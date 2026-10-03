-- Hosted Supabase operational migration. The local RLS test uses plain
-- PostgreSQL and intentionally skips this file because pg_cron, pg_net,
-- and Vault are Supabase-managed extensions.
create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;

do $$
begin
  if not exists (select 1 from vault.secrets where name = 'huni_project_url')
    or not exists (select 1 from vault.secrets where name = 'huni_price_drop_job_secret')
    or not exists (select 1 from vault.secrets where name = 'huni_account_deletion_job_secret') then
    raise exception 'Create Huni worker secrets in Supabase Vault before scheduling jobs';
  end if;
end;
$$;

select cron.schedule(
  'huni-price-drop-alerts',
  '*/5 * * * *',
  $job$
    select net.http_post(
      url := (select decrypted_secret from vault.decrypted_secrets where name = 'huni_project_url')
        || '/functions/v1/price-drop-alerts',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-huni-job-secret',
        (select decrypted_secret from vault.decrypted_secrets where name = 'huni_price_drop_job_secret')
      ),
      body := '{}'::jsonb
    );
  $job$
);

select cron.schedule(
  'huni-process-account-deletions',
  '0 * * * *',
  $job$
    select net.http_post(
      url := (select decrypted_secret from vault.decrypted_secrets where name = 'huni_project_url')
        || '/functions/v1/process-account-deletions',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-huni-job-secret',
        (select decrypted_secret from vault.decrypted_secrets where name = 'huni_account_deletion_job_secret')
      ),
      body := '{}'::jsonb
    );
  $job$
);
