-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Reusable timestamp trigger
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Companies (tenants)
create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text not null default 'trial',
  trial_ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
comment on table public.companies is 'Tenant companies';

-- Profiles linked to Supabase auth users
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  full_name text,
  email text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
comment on table public.profiles is 'Per-tenant user profiles';
create index on public.profiles(company_id);
create unique index on public.profiles(company_id, email);

-- Roles catalog
create table public.roles (
  id uuid primary key default gen_random_uuid(),
  role_name text unique not null check (role_name in ('admin','staff','customer')),
  created_at timestamptz not null default now()
);
comment on table public.roles is 'Role definitions';

-- User-role mapping per company
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  created_at timestamptz not null default now()
);
comment on table public.user_roles is 'Profile roles within a company';
create index on public.user_roles(company_id);
create unique index on public.user_roles(profile_id, company_id, role_id);

-- Customers
create table public.customers (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  address text,
  tags text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
comment on table public.customers is 'Tenant customers';
create index on public.customers(company_id);
create index on public.customers(company_id, name);
create index on public.customers(company_id, email);

-- Customer notes
create table public.customer_notes (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  author_profile_id uuid not null references public.profiles(id) on delete cascade,
  note text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
comment on table public.customer_notes is 'Private notes on customers';
create index on public.customer_notes(company_id);
create index on public.customer_notes(customer_id);

-- Quotes
create table public.quotes (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  title text not null,
  status text not null default 'draft',
  expires_at timestamptz,
  subtotal numeric(12,2) not null default 0,
  tax numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  created_by uuid not null references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
comment on table public.quotes is 'Sales quotes';
create index on public.quotes(company_id);
create index on public.quotes(company_id, status);
create index on public.quotes(customer_id);

-- Quote items
create table public.quote_items (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  quote_id uuid not null references public.quotes(id) on delete cascade,
  description text not null,
  quantity numeric(10,2) not null default 1,
  unit_price numeric(12,2) not null default 0,
  tax_rate numeric(5,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
comment on table public.quote_items is 'Line items per quote';
create index on public.quote_items(company_id);
create index on public.quote_items(quote_id);

-- Jobs
create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  quote_id uuid references public.quotes(id) on delete set null,
  title text not null,
  status text not null default 'scheduled',
  scheduled_at timestamptz,
  completed_at timestamptz,
  recurrence_rule text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
comment on table public.jobs is 'Jobs / work scheduled';
create index on public.jobs(company_id);
create index on public.jobs(company_id, status);
create index on public.jobs(customer_id);

-- Job assignments
create table public.job_assignments (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role text default 'worker',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
comment on table public.job_assignments is 'Staff assigned to jobs';
create index on public.job_assignments(company_id);
create index on public.job_assignments(job_id);

-- Work orders
create table public.work_orders (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  checklist jsonb default '[]',
  attachments jsonb default '[]',
  completed_by uuid references public.profiles(id) on delete set null,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
comment on table public.work_orders is 'On-site work documentation';
create index on public.work_orders(company_id);
create index on public.work_orders(job_id);

-- Invoices
create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  job_id uuid references public.jobs(id) on delete set null,
  status text not null default 'draft',
  due_date date,
  subtotal numeric(12,2) not null default 0,
  tax numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  balance_due numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
comment on table public.invoices is 'Invoices generated from jobs/quotes';
create index on public.invoices(company_id);
create index on public.invoices(company_id, status);
create index on public.invoices(customer_id);
create index on public.invoices(job_id);

-- Invoice items
create table public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  description text not null,
  quantity numeric(10,2) not null default 1,
  unit_price numeric(12,2) not null default 0,
  tax_rate numeric(5,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
comment on table public.invoice_items is 'Line items per invoice';
create index on public.invoice_items(company_id);
create index on public.invoice_items(invoice_id);

-- Payments
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  amount numeric(12,2) not null,
  status text not null default 'succeeded',
  method text default 'card',
  stripe_payment_intent_id text,
  received_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
comment on table public.payments is 'Payments applied to invoices';
create index on public.payments(company_id);
create index on public.payments(company_id, status);
create index on public.payments(invoice_id);

-- Activity logs
create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  actor_profile_id uuid references public.profiles(id) on delete set null,
  action text not null,
  target_table text not null,
  target_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);
comment on table public.activity_logs is 'Audit trail of actions';
create index on public.activity_logs(company_id);
create index on public.activity_logs(target_table);
create index on public.activity_logs(target_id);

-- Triggers
do $$ declare r record; begin
  for r in select table_name from information_schema.columns where column_name='updated_at' and table_schema='public' loop
    execute format('create trigger %I_set_updated_at before update on public.%I for each row execute function set_updated_at();', r.table_name, r.table_name);
  end loop;
end $$;

-- Enable RLS
alter table public.companies enable row level security;
alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.user_roles enable row level security;
alter table public.customers enable row level security;
alter table public.customer_notes enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_items enable row level security;
alter table public.jobs enable row level security;
alter table public.job_assignments enable row level security;
alter table public.work_orders enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.payments enable row level security;
alter table public.activity_logs enable row level security;

-- Helper: current user's company
create or replace view public.current_profile as
select p.*, ur.role_id, r.role_name
from public.profiles p
left join public.user_roles ur on ur.profile_id = p.id
left join public.roles r on r.id = ur.role_id
where p.user_id = auth.uid();

-- Policies: company isolation
create policy "company_isolation_select" on public.customers for select using (company_id = (select company_id from public.profiles where user_id = auth.uid()));
create policy "company_isolation_mod" on public.customers for all using (company_id = (select company_id from public.profiles where user_id = auth.uid())) with check (company_id = (select company_id from public.profiles where user_id = auth.uid()));

-- Repeat concise policies via DO loop
do $$ declare tbl text; begin
  for tbl in select unnest(array[
    'profiles','customer_notes','quotes','quote_items','jobs','job_assignments','work_orders',
    'invoices','invoice_items','payments','activity_logs','user_roles'
  ]) loop
    execute format('create policy company_iso_select_%I on public.%I for select using (company_id = (select company_id from public.profiles where user_id = auth.uid()));', tbl, tbl);
    execute format('create policy company_iso_mod_%I on public.%I for all using (company_id = (select company_id from public.profiles where user_id = auth.uid())) with check (company_id = (select company_id from public.profiles where user_id = auth.uid()));', tbl, tbl);
  end loop;
end $$;

-- Roles table open read
create policy "roles_select" on public.roles for select using (true);

-- Company table: only admins of that company
create policy "company_admin" on public.companies
  using (id = (select company_id from public.profiles where user_id = auth.uid())
          and exists (select 1 from public.user_roles ur join public.roles r on r.id = ur.role_id
                      where ur.profile_id = (select id from public.profiles where user_id = auth.uid())
                        and r.role_name = 'admin'))
  with check (true);

-- Role-based write (admins & staff). Customers read-only portal.
do $$ begin
  execute $p$create policy staff_write_quotes on public.quotes for update using (
    exists(select 1 from public.user_roles ur join public.roles r on r.id=ur.role_id
           where ur.profile_id=(select id from public.profiles where user_id=auth.uid())
             and r.role_name in ('admin','staff'))
  ) with check (
    company_id = (select company_id from public.profiles where user_id=auth.uid())
  );$p$;
  execute $p$create policy staff_write_jobs on public.jobs for update using (
    exists(select 1 from public.user_roles ur join public.roles r on r.id=ur.role_id
           where ur.profile_id=(select id from public.profiles where user_id=auth.uid())
             and r.role_name in ('admin','staff'))
  ) with check (company_id = (select company_id from public.profiles where user_id=auth.uid()));$p$;
  execute $p$create policy staff_write_invoices on public.invoices for update using (
    exists(select 1 from public.user_roles ur join public.roles r on r.id=ur.role_id
           where ur.profile_id=(select id from public.profiles where user_id=auth.uid())
             and r.role_name in ('admin','staff'))
  ) with check (company_id = (select company_id from public.profiles where user_id=auth.uid()));$p$;
end $$;

-- Portal read-only for customers
do $$ declare tbl text; begin
  for tbl in select unnest(array['quotes','invoices','payments']) loop
    execute format($p$create policy customer_read_%I on public.%I for select using (
      exists(select 1 from public.user_roles ur join public.roles r on r.id=ur.role_id
             where ur.profile_id=(select id from public.profiles where user_id=auth.uid())
               and r.role_name='customer')
    );$p$, tbl, tbl);
  end loop;
end $$;
