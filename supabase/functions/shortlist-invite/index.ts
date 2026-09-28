// Deno Edge Function: resolves a shortlist invite code to a shortlist id and
// joins the calling (authenticated) user as a member. Called by the app when
// someone opens a huni://shortlist/<id>?invite=<code> link they didn't
// already own.
//
// Deploy: supabase functions deploy shortlist-invite --no-verify-jwt=false

import { createClient } from 'jsr:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Missing Authorization header' }), { status: 401 });
  }

  const { inviteCode } = await req.json().catch(() => ({}));
  if (!inviteCode || typeof inviteCode !== 'string') {
    return new Response(JSON.stringify({ error: 'inviteCode is required' }), { status: 400 });
  }

  // Client bound to the caller's JWT so auth.uid() resolves inside RLS.
  const supabase = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    return new Response(JSON.stringify({ error: 'Invalid session' }), { status: 401 });
  }

  // Service-role lookup so the invite code itself doesn't need to be publicly
  // selectable (RLS on shortlists only allows members to read it).
  const admin = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data: shortlist, error: findError } = await admin
    .from('shortlists')
    .select('id, name, owner_id')
    .eq('invite_code', inviteCode)
    .maybeSingle();

  if (findError || !shortlist) {
    return new Response(JSON.stringify({ error: 'Invite not found' }), { status: 404 });
  }

  if (shortlist.owner_id !== userData.user.id) {
    const { error: joinError } = await admin
      .from('shortlist_members')
      .upsert({ shortlist_id: shortlist.id, user_id: userData.user.id }, { onConflict: 'shortlist_id,user_id' });
    if (joinError) {
      return new Response(JSON.stringify({ error: joinError.message }), { status: 500 });
    }
  }

  return new Response(JSON.stringify({ shortlistId: shortlist.id, name: shortlist.name }), {
    headers: { 'content-type': 'application/json' },
  });
});
