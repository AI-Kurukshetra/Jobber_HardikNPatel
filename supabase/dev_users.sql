-- Deterministic users per company (dev only)
-- Creates admin/staff/customer with known credentials per company.
-- Safe to re-run; uses upserts to refresh profiles and roles.

-- Helper: creates auth user + profile + user_role
create or replace function create_user_with_role(
  email_input text,
  password_input text,
  full_name_input text,
  company_id_input uuid,
  role_id_input uuid
) returns void language plpgsql as $$
declare
  new_user uuid;
  new_profile uuid;
begin
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

  insert into public.profiles (id, user_id, company_id, email, full_name)
  values (gen_random_uuid(), new_user, company_id_input, email_input, full_name_input)
  on conflict (user_id) do update
    set company_id = excluded.company_id,
        email = excluded.email,
        full_name = excluded.full_name
  returning id into new_profile;

  insert into public.user_roles (profile_id, company_id, role_id)
  values (new_profile, company_id_input, role_id_input)
  on conflict (profile_id, company_id, role_id) do nothing;
end;
$$;

do $$
declare
  comp record;
  admin_role uuid := (select id from public.roles where role_name = 'admin');
  staff_role uuid := (select id from public.roles where role_name = 'staff');
  customer_role uuid := (select id from public.roles where role_name = 'customer');
begin
  for comp in select id, slug, name from public.companies loop
    perform create_user_with_role(
      email_input      => format('admin@%s.com', comp.slug),
      password_input   => 'Password123!'::text,
      full_name_input  => comp.name || ' Admin',
      company_id_input => comp.id,
      role_id_input    => admin_role
    );
    perform create_user_with_role(
      email_input      => format('staff@%s.com', comp.slug),
      password_input   => 'Password123!'::text,
      full_name_input  => comp.name || ' Staff',
      company_id_input => comp.id,
      role_id_input    => staff_role
    );
    perform create_user_with_role(
      email_input      => format('customer@%s.com', comp.slug),
      password_input   => 'Password123!'::text,
      full_name_input  => comp.name || ' Customer',
      company_id_input => comp.id,
      role_id_input    => customer_role
    );
  end loop;
end $$;
