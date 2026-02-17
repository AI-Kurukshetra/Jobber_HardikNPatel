-- One-shot reset + reseed script that works in Supabase SQL editor (no psql meta-commands).
-- Run in the SQL editor or via psql: \i supabase/reset_and_seed_full.sql

begin;

-- Try to elevate for auth.* writes; ignore if not allowed (e.g., SQL editor without service role)
do $$
begin
  begin
    execute 'set local role supabase_auth_admin';
  exception
    when insufficient_privilege then
      raise notice 'Skipping SET ROLE supabase_auth_admin (insufficient privilege). Run with service_role/postgres if auth deletes fail.';
  end;
end $$;

-- Fix RLS on profiles to avoid recursive policies
do $$
begin
  if exists (select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='company_iso_select_profiles') then
    execute 'drop policy company_iso_select_profiles on public.profiles';
  end if;
  if exists (select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='company_iso_mod_profiles') then
    execute 'drop policy company_iso_mod_profiles on public.profiles';
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='profiles_self_access') then
    execute 'create policy profiles_self_access on public.profiles for select using (user_id = auth.uid())';
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='profiles_self_write') then
    execute 'create policy profiles_self_write on public.profiles for all using (user_id = auth.uid()) with check (user_id = auth.uid())';
  end if;
end $$;

-- Wipe existing data; keep schema
truncate table
  public.user_roles,
  public.quote_items,
  public.invoice_items,
  public.payments,
  public.job_assignments,
  public.work_orders,
  public.quotes,
  public.invoices,
  public.jobs,
  public.customers,
  public.activity_logs,
  public.profiles,
  public.companies,
  public.roles
restart identity cascade;

-- Auth tables
delete from auth.identities;
delete from auth.users;

-- Seed one company
insert into public.companies (id, name, slug, status)
values (gen_random_uuid(), 'Acme Field Ops', 'acme', 'active');

-- Ensure roles
insert into public.roles (id, role_name) values
  (gen_random_uuid(),'admin'),
  (gen_random_uuid(),'staff'),
  (gen_random_uuid(),'customer')
on conflict (role_name) do nothing;

-- Helper to create auth user + profile + role for the single tenant
create or replace function create_user_with_role(
  email_input text,
  password_input text,
  full_name_input text,
  company_slug text,
  role_name_input text
) returns void language plpgsql as $$
declare
  company_id_val uuid;
  role_id_val uuid;
  new_user uuid;
  new_profile uuid;
begin
  select id into company_id_val from public.companies where slug = company_slug limit 1;
  select id into role_id_val from public.roles where role_name = role_name_input limit 1;

  select id into new_user from auth.users where email = email_input limit 1;
  if new_user is null then
    insert into auth.users (id, email, encrypted_password, email_confirmed_at, role, aud)
    values (
      gen_random_uuid(),
      email_input,
      crypt(password_input, gen_salt('bf')),
      now(),
      'authenticated',
      'authenticated'
    )
    returning id into new_user;
  else
    update auth.users
      set encrypted_password = crypt(password_input, gen_salt('bf')),
          email_confirmed_at = now()
      where id = new_user;
  end if;

  insert into auth.identities (provider, provider_id, user_id, identity_data, created_at, updated_at)
  values ('email', email_input, new_user,
          jsonb_build_object('sub', new_user, 'email', email_input),
          now(), now())
  on conflict (provider, provider_id) do update
    set user_id = excluded.user_id,
        identity_data = excluded.identity_data,
        updated_at = excluded.updated_at;

  insert into public.profiles (id, user_id, company_id, email, full_name)
  values (gen_random_uuid(), new_user, company_id_val, email_input, full_name_input)
  on conflict (user_id) do update
    set company_id = excluded.company_id,
        email = excluded.email,
        full_name = excluded.full_name
  returning id into new_profile;

  insert into public.user_roles (profile_id, company_id, role_id)
  values (new_profile, company_id_val, role_id_val)
  on conflict (profile_id, company_id, role_id) do nothing;
end;
$$;

-- Create deterministic users for the single company
select create_user_with_role('admin@acme.com',    'Password123!', 'Acme Admin',    'acme', 'admin');
select create_user_with_role('staff@acme.com',    'Password123!', 'Acme Staff',    'acme', 'staff');
select create_user_with_role('customer@acme.com', 'Password123!', 'Acme Customer', 'acme', 'customer');

-- Seed a sample customer so UI flows work immediately
insert into public.customers (id, company_id, name, email, phone, address, tags)
select gen_random_uuid(), c.id, 'Sample Customer', 'customer@sample.com', '+1-555-123-4567', '123 Main St', array['residential']
from public.companies c
where c.slug = 'acme'
on conflict do nothing;

commit;
