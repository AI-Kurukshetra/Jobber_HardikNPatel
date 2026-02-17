-- Reset and reseed all demo data (requires service-role key / Supabase SQL editor).
-- Run from repo root with: psql "$SUPABASE_DB_URL" -f supabase/reset_and_seed.sql

begin;

-- Wipe data; keep schemas. Order + CASCADE handles FKs.
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
  public.roles,
  auth.users
restart identity cascade;

-- Reseed companies, roles, domain data, and random users
\i supabase/seed.sql

-- Create deterministic login accounts per company (admin/staff/customer)
\i supabase/dev_users.sql

commit;
