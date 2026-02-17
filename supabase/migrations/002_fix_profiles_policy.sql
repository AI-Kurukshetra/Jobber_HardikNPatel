-- Fix recursive RLS policies on profiles that reference profiles in their USING clause.

drop policy if exists company_iso_select_profiles on public.profiles;
drop policy if exists company_iso_mod_profiles on public.profiles;

create policy profiles_self_access on public.profiles
  for select
  using (user_id = auth.uid());

create policy profiles_self_write on public.profiles
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
