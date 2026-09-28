// Deno Edge Function. Run on a schedule (Supabase Cron) whenever a listing's
// price is updated: compares against the previous price, records a
// price_change_events row for drops, and sends an Expo push notification to
// everyone watching that property who has price_drops enabled.
//
// Deploy: supabase functions deploy price-drop-alerts
// Schedule (supabase/config.toml or Dashboard): every 15 minutes, or trigger
// it directly from a DB webhook on public.properties UPDATE.

import { createClient } from 'jsr:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

type PropertyRow = { id: string; price: number; previous_price: number | null; title: string };

Deno.serve(async (req) => {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  let changed: PropertyRow[] = [];
  try {
    const body = await req.json();
    if (body?.record && body.record.price < body.old_record?.price) {
      changed = [{ ...body.record, previous_price: body.old_record.price }];
    }
  } catch {
    // No webhook body — fall back to scanning for unrecorded drops.
    const { data } = await supabase
      .from('properties')
      .select('id, price, previous_price, title')
      .not('previous_price', 'is', null)
      .filter('previous_price', 'gt', 'price');
    changed = data ?? [];
  }

  let notified = 0;
  for (const property of changed) {
    await supabase.from('price_change_events').insert({
      property_id: property.id,
      from_price: property.previous_price,
      to_price: property.price,
    });

    const { data: watchers } = await supabase
      .from('price_watches')
      .select('user_id')
      .eq('property_id', property.id);
    if (!watchers?.length) continue;

    const userIds = watchers.map((w) => w.user_id);
    const { data: prefs } = await supabase
      .from('notification_prefs')
      .select('user_id')
      .in('user_id', userIds)
      .eq('price_drops', true);
    const eligibleIds = new Set((prefs ?? []).map((p) => p.user_id));

    const { data: tokens } = await supabase
      .from('push_tokens')
      .select('expo_push_token')
      .in('user_id', [...eligibleIds]);
    if (!tokens?.length) continue;

    const messages = tokens.map((t) => ({
      to: t.expo_push_token,
      title: 'Harga turun',
      body: `${property.title} sekarang lebih murah`,
      data: { propertyId: property.id, type: 'price_drop' },
    }));

    await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(messages),
    });
    notified += messages.length;
  }

  return new Response(JSON.stringify({ propertiesProcessed: changed.length, notificationsSent: notified }), {
    headers: { 'content-type': 'application/json' },
  });
});
