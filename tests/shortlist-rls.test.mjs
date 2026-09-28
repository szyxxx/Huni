import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const container = `huni-rls-${process.pid}`;

function docker(args, input) {
  return spawnSync('docker', args, { input, encoding: 'utf8', timeout: 120_000 });
}

function sql(input) {
  const result = docker(['exec', '-i', container, 'psql', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', 'huni'], input);
  assert.equal(result.status, 0, result.stderr || result.stdout);
}

test('shortlist membership requires the invite service, while service writes retain member access', () => {
  const started = docker(['run', '-d', '--rm', '--name', container, '-e', 'POSTGRES_PASSWORD=test', '-e', 'POSTGRES_DB=huni', 'postgres:17-alpine']);
  assert.equal(started.status, 0, started.stderr);
  try {
    let consecutiveReadyChecks = 0;
    for (let attempt = 0; attempt < 30; attempt++) {
      if (docker(['exec', container, 'pg_isready', '-U', 'postgres', '-d', 'huni']).status === 0) {
        consecutiveReadyChecks++;
        if (consecutiveReadyChecks === 3) break;
      } else {
        consecutiveReadyChecks = 0;
      }
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1000);
    }
    assert.equal(consecutiveReadyChecks, 3, 'temporary PostgreSQL did not start');

    sql(`
      create schema auth;
      create table auth.users (id uuid primary key, raw_user_meta_data jsonb not null default '{}'::jsonb);
      create function auth.uid() returns uuid language sql stable as $$
        select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
      $$;
      create role authenticated;
    `);

    for (const file of readdirSync(resolve(root, 'supabase/migrations')).filter((name) => name.endsWith('.sql')).sort()) {
      sql(readFileSync(resolve(root, 'supabase/migrations', file), 'utf8'));
    }

    sql(`
      insert into auth.users (id) values
        ('00000000-0000-4000-8000-000000000001'),
        ('00000000-0000-4000-8000-000000000002');
      insert into public.shortlists (id, owner_id, name, invite_code) values
        ('00000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000001', 'Private', 'secret-code');
      grant usage on schema public to authenticated;
      grant select on public.shortlists to authenticated;
      grant select, insert on public.shortlist_members to authenticated;
      set role authenticated;
      set request.jwt.claim.sub = '00000000-0000-4000-8000-000000000002';
      do $$
      begin
        if exists (select 1 from public.shortlists where id = '00000000-0000-4000-8000-000000000003') then
          raise exception 'nonmember could read private shortlist';
        end if;
        begin
          insert into public.shortlist_members (shortlist_id, user_id) values
            ('00000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000002');
          raise exception 'nonmember joined without invite code';
        exception when insufficient_privilege then
          null;
        end;
      end $$;
      reset role;
      insert into public.shortlist_members (shortlist_id, user_id) values
        ('00000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000002');
      set role authenticated;
      do $$
      begin
        if not exists (select 1 from public.shortlists where id = '00000000-0000-4000-8000-000000000003') then
          raise exception 'invited member cannot read shortlist';
        end if;
      end $$;
    `);
  } finally {
    docker(['rm', '-f', container]);
  }
});
