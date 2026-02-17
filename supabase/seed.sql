-- Seed companies
insert into public.companies (id, name, slug, status) values
  (gen_random_uuid(),'Northwind Services','northwind','active'),
  (gen_random_uuid(),'Acme Field Ops','acme','active'),
  (gen_random_uuid(),'BlueSky Maintenance','bluesky','trial');

-- Ensure roles
insert into public.roles (id, role_name) values
  (gen_random_uuid(),'admin'), (gen_random_uuid(),'staff'), (gen_random_uuid(),'customer')
on conflict (role_name) do nothing;

with seed_users as (
  select gen_random_uuid() as user_id,
         c.id as company_id,
         'user'||g||'@'||replace(lower(c.name),' ','')||'.com' as email,
         initcap(md5(random()::text)) as full_name
  from public.companies c,
       generate_series(1,5) g
),
inserted_auth as (
  insert into auth.users (id, email, role, aud)
  select user_id, email, 'authenticated', 'authenticated'
  from seed_users
  returning id
)
insert into public.profiles (id, user_id, company_id, email, full_name)
select gen_random_uuid(), su.user_id, su.company_id, su.email, su.full_name
from seed_users su
join inserted_auth ia on ia.id = su.user_id;

-- Map roles: first user admin, second staff, others staff, 5th customer
do $$
declare comp record; prof uuid; idx int :=0; admin_id uuid; staff_id uuid; customer_id uuid;
begin
  for comp in select c.id from public.companies c loop
    idx :=0;
    for prof in select p.id from public.profiles p where p.company_id = comp.id order by p.created_at loop
      idx := idx + 1;
      if idx = 1 then
        admin_id := prof;
        insert into public.user_roles(profile_id, company_id, role_id)
          select prof, comp.id, r.id from public.roles r where r.role_name='admin';
      elsif idx = 5 then
        customer_id := prof;
        insert into public.user_roles(profile_id, company_id, role_id)
          select prof, comp.id, r.id from public.roles r where r.role_name='customer';
      else
        staff_id := prof;
        insert into public.user_roles(profile_id, company_id, role_id)
          select prof, comp.id, r.id from public.roles r where r.role_name='staff';
      end if;
    end loop;
  end loop;
end$$;

-- Seed customers (30 per company)
insert into public.customers (id, company_id, name, email, phone, address, tags)
select gen_random_uuid(), c.id,
       concat_ws(' ', initcap((md5(random()::text))::varchar(6)), initcap((md5(random()::text))::varchar(6))) as name,
       'customer'||g||'@'||c.slug||'.com',
       '+1-555-'||to_char(floor(random()*9000)+1000,'FM0000'),
       concat(g, ' Main St, ', c.slug),
       array['residential']
from public.companies c, generate_series(1,30) g;

-- Seed quotes (20 per company) + items
with qs as (
  insert into public.quotes (id, company_id, customer_id, title, status, expires_at, subtotal, tax, total, created_by)
  select gen_random_uuid(), c.id, cust.id,
         'Service Quote #'||g,
         (array['draft','sent','accepted','expired','rejected'])[1+floor(random()*5)::int],
         now() + (g||' days')::interval,
         200 + (random()*800)::numeric(12,2),
         0,
         0,
         (select id from public.profiles p where p.company_id=c.id limit 1)
  from public.companies c
  join public.customers cust on cust.company_id = c.id
  join lateral (select generate_series(1,20) g) gs on true
  limit 60
  returning *
)
insert into public.quote_items (id, company_id, quote_id, description, quantity, unit_price, tax_rate)
select gen_random_uuid(), q.company_id, q.id,
       (array['Lawn care','HVAC tune-up','Window cleaning','Roof inspection'])[1+floor(random()*4)::int],
       1 + floor(random()*3),
       80 + (random()*220)::numeric(12,2),
       8.5
from qs q, generate_series(1,3);

-- Seed jobs (20 per company)
insert into public.jobs (id, company_id, customer_id, title, status, scheduled_at, notes)
select gen_random_uuid(), c.id, cust.id,
       'Job #'||g,
       (array['scheduled','in_progress','completed','cancelled'])[1+floor(random()*4)::int],
       now() + ((g-10)||' days')::interval,
       'Perform scheduled service'
from public.companies c
join public.customers cust on cust.company_id = c.id
join lateral (select generate_series(1,20) g) gs on true
limit 60;

-- Assign first two staff to each job
insert into public.job_assignments (id, company_id, job_id, profile_id, role)
select gen_random_uuid(), j.company_id, j.id, p.id, 'worker'
from public.jobs j
join public.profiles p on p.company_id = j.company_id
join public.user_roles ur on ur.profile_id = p.id
join public.roles r on r.id = ur.role_id and r.role_name in ('admin','staff')
where (select count(*) from public.job_assignments ja where ja.job_id=j.id) < 2
limit 120;

-- Work orders
insert into public.work_orders (id, company_id, job_id, checklist, attachments)
select gen_random_uuid(), j.company_id, j.id,
       jsonb_build_array('Arrive on site','Perform service','Capture photos','Obtain sign-off'),
       '[]'::jsonb
from public.jobs j;

-- Invoices (20 per company) + items
with inv as (
  insert into public.invoices (id, company_id, customer_id, job_id, status, due_date, subtotal, tax, total, balance_due)
  select gen_random_uuid(), c.id, cust.id,
         (select id from public.jobs j where j.company_id=c.id and j.customer_id=cust.id limit 1),
         (array['draft','sent','partial','paid','overdue'])[1+floor(random()*5)::int],
         current_date + (g||' days')::interval,
         150 + (random()*600)::numeric(12,2),
         0,
         0,
         0
  from public.companies c
  join public.customers cust on cust.company_id=c.id
  join lateral (select generate_series(1,20) g) gs on true
  limit 60
  returning *
)
insert into public.invoice_items (id, company_id, invoice_id, description, quantity, unit_price, tax_rate)
select gen_random_uuid(), i.company_id, i.id,
       (array['Labor','Materials','Travel','Cleanup'])[1+floor(random()*4)::int],
       1 + floor(random()*3),
       50 + (random()*250)::numeric(12,2),
       8.5
from inv i, generate_series(1,3);

-- Payments for 60% of invoices
insert into public.payments (id, company_id, invoice_id, amount, status, method, stripe_payment_intent_id)
select gen_random_uuid(), i.company_id, i.id,
       (i.total = 0)::int * (100 + random()*500) + (case when i.total = 0 then 0 else i.total end),
       'succeeded',
       'card',
       'pi_'||substr(md5(random()::text),1,12)
from public.invoices i
where random() < 0.6;

-- Activity logs (minimal)
insert into public.activity_logs (id, company_id, actor_profile_id, action, target_table, target_id, metadata)
select gen_random_uuid(), i.company_id, null, 'invoice_created', 'invoices', i.id, jsonb_build_object('status', i.status)
from public.invoices i
limit 50;
