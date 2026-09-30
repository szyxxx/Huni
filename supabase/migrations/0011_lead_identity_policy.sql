drop policy if exists "anyone may create a lead" on public.leads;

create policy "signed-in users create their own leads"
  on public.leads for insert to authenticated
  with check (auth.uid() = user_id);
