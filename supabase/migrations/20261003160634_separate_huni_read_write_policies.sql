-- One read policy per role/action avoids evaluating multiple permissive
-- policies for the same row. Write conditions preserve the former ALL rules.

drop policy "project owners read their inquiries" on public.leads;
drop policy "users read their own leads" on public.leads;
create policy "buyers and project owners read leads" on public.leads
  for select using (
    user_id = (select auth.uid())
    or (
      channel = 'project_interest'
      and project_id is not null
      and exists (
        select 1 from public.projects p
        join public.advertisers a on a.id = p.advertiser_id
        where p.id = leads.project_id and a.owner_id = (select auth.uid())
      )
    )
  );

drop policy "advertisers manage their own projects" on public.projects;
create policy "advertisers insert their own projects" on public.projects
  for insert with check (
    exists (select 1 from public.advertisers a
      where a.id = advertiser_id and a.owner_id = (select auth.uid()))
  );
create policy "advertisers update their own projects" on public.projects
  for update using (
    exists (select 1 from public.advertisers a
      where a.id = advertiser_id and a.owner_id = (select auth.uid()))
  ) with check (
    exists (select 1 from public.advertisers a
      where a.id = advertiser_id and a.owner_id = (select auth.uid()))
  );
create policy "advertisers delete their own projects" on public.projects
  for delete using (
    exists (select 1 from public.advertisers a
      where a.id = advertiser_id and a.owner_id = (select auth.uid()))
  );

drop policy "active properties are publicly readable" on public.properties;
drop policy "advertisers manage their own properties" on public.properties;
create policy "active or owned properties are readable" on public.properties
  for select using (
    status = 'active'
    or exists (select 1 from public.advertisers a
      where a.id = advertiser_id and a.owner_id = (select auth.uid()))
  );
create policy "advertisers insert their own properties" on public.properties
  for insert with check (
    exists (select 1 from public.advertisers a
      where a.id = advertiser_id and a.owner_id = (select auth.uid()))
  );
create policy "advertisers update their own properties" on public.properties
  for update using (
    exists (select 1 from public.advertisers a
      where a.id = advertiser_id and a.owner_id = (select auth.uid()))
  ) with check (
    exists (select 1 from public.advertisers a
      where a.id = advertiser_id and a.owner_id = (select auth.uid()))
  );
create policy "advertisers delete their own properties" on public.properties
  for delete using (
    exists (select 1 from public.advertisers a
      where a.id = advertiser_id and a.owner_id = (select auth.uid()))
  );

drop policy "members add/remove shortlist properties" on public.shortlist_properties;
create policy "members add shortlist properties" on public.shortlist_properties
  for insert with check (huni_internal.is_shortlist_member(shortlist_id));
create policy "members update shortlist properties" on public.shortlist_properties
  for update using (huni_internal.is_shortlist_member(shortlist_id))
  with check (huni_internal.is_shortlist_member(shortlist_id));
create policy "members remove shortlist properties" on public.shortlist_properties
  for delete using (huni_internal.is_shortlist_member(shortlist_id));

drop policy "owners manage their shortlists" on public.shortlists;
create policy "owners create shortlists" on public.shortlists
  for insert with check (owner_id = (select auth.uid()));
create policy "owners update shortlists" on public.shortlists
  for update using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));
create policy "owners delete shortlists" on public.shortlists
  for delete using (owner_id = (select auth.uid()));
