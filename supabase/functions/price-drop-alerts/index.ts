import { createClient } from 'jsr:@supabase/supabase-js@2';

const url = Deno.env.get('SUPABASE_URL');
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const jobSecret = Deno.env.get('PRICE_DROP_JOB_SECRET');
const expoPushUrl = 'https://exp.host/--/api/v2/push/send';

Deno.serve(async (request) => {
  if (request.method !== 'POST' || !jobSecret || request.headers.get('x-huni-job-secret') !== jobSecret) {
    return new Response('Unauthorized', { status: 401 });
  }
  if (!url || !serviceKey) return new Response('Missing service configuration', { status: 500 });

  const supabase = createClient(url, serviceKey);
  const { data: events, error } = await supabase
    .from('price_change_events')
    .select('id, property_id, from_price, to_price')
    .is('notification_sent_at', null)
    .order('created_at', { ascending: true })
    .limit(100);
  if (error) return new Response(error.message, { status: 500 });

  let processed = 0;
  let sent = 0;
  const failures: string[] = [];
  for (const event of events ?? []) {
    const { data: claimed, error: claimError } = await supabase.rpc('claim_price_change_event', { event_id: event.id });
    if (claimError) {
      failures.push(event.id);
      continue;
    }
    if (!claimed) continue;

    try {
      const [propertyResult, watchesResult] = await Promise.all([
        supabase.from('properties').select('title').eq('id', event.property_id).single(),
        supabase.from('price_watches').select('user_id').eq('property_id', event.property_id),
      ]);
      if (propertyResult.error) throw propertyResult.error;
      if (watchesResult.error) throw watchesResult.error;
      const userIds = (watchesResult.data ?? []).map((row) => row.user_id);
      if (userIds.length) {
        const { data: prefs, error: prefsError } = await supabase
          .from('notification_prefs').select('user_id').in('user_id', userIds).eq('price_drops', true);
        if (prefsError) throw prefsError;
        const eligibleIds = (prefs ?? []).map((row) => row.user_id);
        if (eligibleIds.length) {
          const { data: tokens, error: tokensError } = await supabase
            .from('push_tokens').select('expo_push_token').in('user_id', eligibleIds);
          if (tokensError) throw tokensError;
          if (tokens?.length) {
            const response = await fetch(expoPushUrl, {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify(tokens.map((token) => ({
                to: token.expo_push_token,
                title: 'Harga turun',
                body: `${propertyResult.data.title} sekarang lebih murah`,
                data: { propertyId: event.property_id, type: 'price_drop' },
              }))),
            });
            if (!response.ok) throw new Error(`Expo push returned ${response.status}`);
            sent += tokens.length;
          }
        }
      }
      const { error: markError } = await supabase.from('price_change_events')
        .update({ notification_sent_at: new Date().toISOString() }).eq('id', event.id);
      if (markError) throw markError;
      processed++;
    } catch {
      failures.push(event.id);
    }
  }

  return Response.json({ processed, sent, failedEventIds: failures }, { status: failures.length ? 500 : 200 });
});
