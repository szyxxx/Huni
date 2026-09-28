import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { FilterState, KprScenario, NotificationPrefs, SavedSearch, Shortlist } from '../store/useAppStore';

const pendingWrites = new Map<string, Promise<void>>();

function serializeWrite(key: string, write: () => Promise<void>): Promise<void> {
  const previous = pendingWrites.get(key) ?? Promise.resolve();
  const current = previous.catch(() => {}).then(write);
  pendingWrites.set(key, current);
  void current.finally(() => {
    if (pendingWrites.get(key) === current) pendingWrites.delete(key);
  }).catch(() => {});
  return current;
}

async function requireSuccess(query: PromiseLike<{ error: { message: string } | null }>): Promise<void> {
  const { error } = await query;
  if (error) throw new Error(error.message);
}

export type RemoteUserData = {
  savedIds: string[];
  watchedPriceIds: string[];
  savedSearches: SavedSearch[];
  kprScenarios: KprScenario[];
  shortlists: Shortlist[];
  notificationPrefs: NotificationPrefs | null;
};

export async function pullUserData(userId: string): Promise<RemoteUserData | null> {
  if (!supabase) return null;
  const [saved, watches, searches, kpr, shortlists, shortlistProps, prefs] = await Promise.all([
    supabase.from('saved_properties').select('property_id').eq('user_id', userId),
    supabase.from('price_watches').select('property_id').eq('user_id', userId),
    supabase.from('saved_searches').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('kpr_scenarios').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('shortlists').select('*').order('created_at', { ascending: false }),
    supabase.from('shortlist_properties').select('shortlist_id, property_id'),
    supabase.from('notification_prefs').select('*').eq('user_id', userId).maybeSingle(),
  ]);

  const failed = [saved, watches, searches, kpr, shortlists, shortlistProps, prefs].find((result) => result.error);
  if (failed?.error) throw failed.error;

  const propsByShortlist = new Map<string, string[]>();
  for (const row of shortlistProps.data ?? []) {
    const list = propsByShortlist.get(row.shortlist_id) ?? [];
    list.push(row.property_id);
    propsByShortlist.set(row.shortlist_id, list);
  }

  return {
    savedIds: (saved.data ?? []).map((r) => r.property_id),
    watchedPriceIds: (watches.data ?? []).map((r) => r.property_id),
    savedSearches: (searches.data ?? []).map((r) => ({
      id: r.id,
      label: r.label,
      query: r.query,
      intent: r.intent,
      filters: r.filters as FilterState,
      createdAt: r.created_at,
      notify: r.notify,
    })),
    kprScenarios: (kpr.data ?? []).map((r) => ({
      id: r.id,
      label: r.label,
      price: r.price,
      downPaymentPercent: Number(r.down_payment_percent),
      tenorYears: r.tenor_years,
      ratePercent: Number(r.rate_percent),
      monthlyInstallment: r.monthly_installment,
      createdAt: r.created_at,
    })),
    shortlists: (shortlists.data ?? []).map((r) => ({
      id: r.id,
      name: r.name,
      propertyIds: propsByShortlist.get(r.id) ?? [],
      inviteCode: r.invite_code,
      ownerId: r.owner_id,
      createdAt: r.created_at,
    })),
    notificationPrefs: prefs.data ? {
      savedSearchMatch: prefs.data.saved_search_match,
      priceDrops: prefs.data.price_drops,
      listingUpdates: prefs.data.listing_updates,
      projectPromotions: prefs.data.project_promotions,
      shortlistActivity: prefs.data.shortlist_activity,
      leadFollowUp: prefs.data.lead_follow_up,
    } : null,
  };
}

export async function pushSavedProperty(userId: string, propertyId: string, saved: boolean) {
  const client = supabase;
  if (!isSupabaseConfigured || !client) return;
  await serializeWrite(`saved:${userId}:${propertyId}`, async () => {
    const query = saved
      ? client.from('saved_properties').upsert({ user_id: userId, property_id: propertyId })
      : client.from('saved_properties').delete().match({ user_id: userId, property_id: propertyId });
    await requireSuccess(query);
  });
}

export async function pushPriceWatch(userId: string, propertyId: string, watching: boolean) {
  const client = supabase;
  if (!isSupabaseConfigured || !client) return;
  await serializeWrite(`watch:${userId}:${propertyId}`, async () => {
    const query = watching
      ? client.from('price_watches').upsert({ user_id: userId, property_id: propertyId })
      : client.from('price_watches').delete().match({ user_id: userId, property_id: propertyId });
    await requireSuccess(query);
  });
}

export async function pushSavedSearch(userId: string, search: SavedSearch) {
  const client = supabase;
  if (!isSupabaseConfigured || !client) return;
  await serializeWrite(`search:${search.id}`, () => requireSuccess(client
    .from('saved_searches')
    .insert({
      id: search.id,
      user_id: userId,
      label: search.label,
      query: search.query,
      intent: search.intent,
      filters: search.filters,
      notify: search.notify,
    })
  ));
}

export async function removeSavedSearchRemote(id: string) {
  const client = supabase;
  if (!isSupabaseConfigured || !client) return;
  await serializeWrite(`search:${id}`, () => requireSuccess(client.from('saved_searches').delete().eq('id', id)));
}

export async function pushKprScenario(userId: string, scenario: KprScenario) {
  const client = supabase;
  if (!isSupabaseConfigured || !client) return;
  await serializeWrite(`kpr:${scenario.id}`, () => requireSuccess(client
    .from('kpr_scenarios')
    .insert({
      id: scenario.id,
      user_id: userId,
      label: scenario.label,
      price: scenario.price,
      down_payment_percent: scenario.downPaymentPercent,
      tenor_years: scenario.tenorYears,
      rate_percent: scenario.ratePercent,
      monthly_installment: scenario.monthlyInstallment,
    })
  ));
}

export async function removeKprScenarioRemote(id: string) {
  const client = supabase;
  if (!isSupabaseConfigured || !client) return;
  await serializeWrite(`kpr:${id}`, () => requireSuccess(client.from('kpr_scenarios').delete().eq('id', id)));
}

export async function pushShortlist(userId: string, shortlist: Shortlist) {
  const client = supabase;
  if (!isSupabaseConfigured || !client) return;
  await serializeWrite(`shortlist:${shortlist.id}`, () => requireSuccess(client
    .from('shortlists')
    .insert({ id: shortlist.id, owner_id: userId, name: shortlist.name, invite_code: shortlist.inviteCode })
  ));
}

export async function deleteShortlistRemote(id: string) {
  const client = supabase;
  if (!isSupabaseConfigured || !client) return;
  await serializeWrite(`shortlist:${id}`, () => requireSuccess(client.from('shortlists').delete().eq('id', id)));
}

export async function pushShortlistProperty(shortlistId: string, propertyId: string, userId: string, add: boolean) {
  const client = supabase;
  if (!isSupabaseConfigured || !client) return;
  await serializeWrite(`shortlist:${shortlistId}`, async () => {
    const query = add
      ? client.from('shortlist_properties').upsert({ shortlist_id: shortlistId, property_id: propertyId, added_by: userId })
      : client.from('shortlist_properties').delete().match({ shortlist_id: shortlistId, property_id: propertyId });
    await requireSuccess(query);
  });
}

export async function pushNotificationPrefs(userId: string, prefs: NotificationPrefs) {
  const client = supabase;
  if (!isSupabaseConfigured || !client) return;
  await serializeWrite(`prefs:${userId}`, () => requireSuccess(client.from('notification_prefs').upsert({
    user_id: userId,
    saved_search_match: prefs.savedSearchMatch,
    price_drops: prefs.priceDrops,
    listing_updates: prefs.listingUpdates,
    project_promotions: prefs.projectPromotions,
    shortlist_activity: prefs.shortlistActivity,
    lead_follow_up: prefs.leadFollowUp,
  })));
}
