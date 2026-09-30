-- Reuse the existing `leads` table for tour requests instead of a parallel table:
-- schedule-a-tour is just another lead channel with an extra date/note.
alter table public.leads drop constraint if exists leads_channel_check;
alter table public.leads add constraint leads_channel_check
  check (channel in ('whatsapp', 'call', 'inquiry', 'brochure', 'project_interest', 'tour_request'));
alter table public.leads add column if not exists scheduled_for timestamptz;
alter table public.leads add column if not exists note text;
