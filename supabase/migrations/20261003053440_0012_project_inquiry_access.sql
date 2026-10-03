-- Let a signed-in developer read inquiries for projects they own.
-- Seed projects have no owner_id; an operator must link a verified account
-- before those developers can receive inquiries in the app.
create policy "project owners read their inquiries"
  on public.leads for select to authenticated
  using (
    channel = 'project_interest' and project_id is not null and exists (
      select 1 from public.projects p
      join public.advertisers a on a.id = p.advertiser_id
      where p.id = leads.project_id and a.owner_id = auth.uid()
    )
  );

-- Inquiry notes contain contact details. Remove them with the buyer's account
-- instead of orphaning personal information when auth.users is deleted.
alter table public.leads drop constraint if exists leads_user_id_fkey;
alter table public.leads add constraint leads_user_id_fkey
  foreign key (user_id) references auth.users (id) on delete cascade;
