-- Keep auth.uid() stable for each statement instead of evaluating it per row.
-- These are the 18 existing user-scoped policies reported by the linter.
do $$
declare
  policy_row record;
  policy_count integer := 0;
begin
  for policy_row in
    select schemaname, tablename, policyname, qual, with_check
    from pg_policies
    where schemaname = 'public'
      and (tablename, policyname) in (
        values
          ('account_deletion_requests', 'users read their own deletion requests'),
          ('account_deletion_requests', 'users request their own deletion'),
          ('kpr_scenarios', 'users manage their own kpr scenarios'),
          ('leads', 'project owners read their inquiries'),
          ('leads', 'signed-in users create their own leads'),
          ('leads', 'users read their own leads'),
          ('listing_reports', 'reporters read their own reports'),
          ('listing_reports', 'signed-in users submit reports'),
          ('notification_prefs', 'users manage their own notification prefs'),
          ('price_watches', 'users manage their own price watches'),
          ('profiles', 'profiles are self-readable'),
          ('profiles', 'profiles are self-writable'),
          ('projects', 'advertisers manage their own projects'),
          ('properties', 'advertisers manage their own properties'),
          ('push_tokens', 'users manage their own push tokens'),
          ('saved_properties', 'users manage their own saved properties'),
          ('saved_searches', 'users manage their own saved searches'),
          ('shortlists', 'owners manage their shortlists')
      )
  loop
    policy_count := policy_count + 1;
    if policy_row.qual is not null and position('auth.uid()' in policy_row.qual) > 0 then
      execute format(
        'alter policy %I on %I.%I using (%s)',
        policy_row.policyname,
        policy_row.schemaname,
        policy_row.tablename,
        replace(policy_row.qual, 'auth.uid()', '(select auth.uid())')
      );
    end if;
    if policy_row.with_check is not null and position('auth.uid()' in policy_row.with_check) > 0 then
      execute format(
        'alter policy %I on %I.%I with check (%s)',
        policy_row.policyname,
        policy_row.schemaname,
        policy_row.tablename,
        replace(policy_row.with_check, 'auth.uid()', '(select auth.uid())')
      );
    end if;
  end loop;

  if policy_count <> 18 then
    raise exception 'Expected 18 user-scoped policies, found %', policy_count;
  end if;
end;
$$;

-- Cover the foreign keys identified by the Supabase performance advisor.
create index if not exists advertisers_owner_id_idx on public.advertisers (owner_id);
create index if not exists kpr_scenarios_user_id_idx on public.kpr_scenarios (user_id);
create index if not exists leads_project_id_idx on public.leads (project_id);
create index if not exists leads_property_id_idx on public.leads (property_id);
create index if not exists leads_user_id_idx on public.leads (user_id);
create index if not exists listing_reports_property_id_idx on public.listing_reports (property_id);
create index if not exists listing_reports_reporter_id_idx on public.listing_reports (reporter_id);
create index if not exists price_change_events_property_id_idx on public.price_change_events (property_id);
create index if not exists price_watches_property_id_idx on public.price_watches (property_id);
create index if not exists project_nearby_places_project_id_idx on public.project_nearby_places (project_id);
create index if not exists project_units_project_id_idx on public.project_units (project_id);
create index if not exists projects_advertiser_id_idx on public.projects (advertiser_id);
create index if not exists properties_advertiser_id_idx on public.properties (advertiser_id);
create index if not exists properties_type_idx on public.properties (type);
create index if not exists property_nearby_places_property_id_idx on public.property_nearby_places (property_id);
create index if not exists saved_properties_property_id_idx on public.saved_properties (property_id);
create index if not exists saved_searches_user_id_idx on public.saved_searches (user_id);
create index if not exists shortlist_members_user_id_idx on public.shortlist_members (user_id);
create index if not exists shortlist_properties_added_by_idx on public.shortlist_properties (added_by);
create index if not exists shortlist_properties_property_id_idx on public.shortlist_properties (property_id);
create index if not exists shortlists_owner_id_idx on public.shortlists (owner_id);
