-- Only the shortlist-invite Edge Function may add a member after validating
-- the invite code. Its service-role client bypasses RLS for this insert.
drop policy if exists "members join via invite (insert only self)" on public.shortlist_members;
