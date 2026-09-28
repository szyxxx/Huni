import { createClient } from 'jsr:@supabase/supabase-js@2';

const url = Deno.env.get('SUPABASE_URL');
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const jobSecret = Deno.env.get('ACCOUNT_DELETION_JOB_SECRET');

Deno.serve(async (request) => {
  if (request.method !== 'POST' || !jobSecret || request.headers.get('x-huni-job-secret') !== jobSecret) {
    return new Response('Unauthorized', { status: 401 });
  }
  if (!url || !serviceKey) return new Response('Missing service configuration', { status: 500 });

  const supabase = createClient(url, serviceKey);
  const { data: requests, error } = await supabase
    .from('account_deletion_requests')
    .select('id, user_id')
    .eq('status', 'pending')
    .order('requested_at', { ascending: true })
    .limit(100);
  if (error) return new Response(error.message, { status: 500 });

  const failures: string[] = [];
  let deleted = 0;
  for (const item of requests ?? []) {
    const { error: deletionError } = await supabase.auth.admin.deleteUser(item.user_id);
    if (deletionError) {
      failures.push(item.id);
      continue;
    }
    const { error: auditError } = await supabase.from('account_deletion_audit').insert({ request_id: item.id });
    if (auditError) failures.push(item.id);
    deleted++;
  }

  return Response.json({ deleted, failedRequestIds: failures }, { status: failures.length ? 500 : 200 });
});
