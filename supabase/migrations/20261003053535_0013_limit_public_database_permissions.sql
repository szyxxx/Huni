-- The taxonomy is read-only client configuration. Keep catalogue reads available
-- while preventing anyone with the anon key from changing valid property types.
revoke insert, update, delete, truncate, references, trigger
  on table public.property_types from anon, authenticated;

-- These functions are invoked by database triggers, never by the mobile app.
-- Their SECURITY DEFINER bodies must not be callable through the Data API.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.create_notification_prefs_for_new_user() from public, anon, authenticated;
revoke execute on function public.record_price_drop() from public, anon, authenticated;
