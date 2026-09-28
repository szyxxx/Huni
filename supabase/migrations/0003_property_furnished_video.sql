alter table public.properties add column if not exists furnished boolean;
alter table public.properties add column if not exists video_url text;
alter table public.project_units add column if not exists cluster text;
