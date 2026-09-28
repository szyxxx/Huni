import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { FilterState, KprScenario, SavedSearch, Shortlist } from '../store/useAppStore';

/**
 * Best-effort writes to the decision-workspace tables (see
 * supabase/migrations/0001_init.sql). Every function is a no-op when
 * Supabase isn't configured or nobody is signed in — the zustand store
 * stays the source of truth locally either way, this just mirrors it
 * server-side once there's a user_id to scope it to.
 */

export type RemoteUserData = {
  savedIds: string[];
  watchedPriceIds: string[];
  savedSearches: SavedSearch[];
  kprScenarios: KprScenario[];
  shortlists: Shortlist[];
};

export async function pullUserData(userId: string): Promise<RemoteUserData | null> {
  if (!supabase) return null;
  const [saved, watches, searches, kpr, shortlists, shortlistProps] = await Promise.all([
    supabase.from('saved_properties').select('property_id').eq('user_id', userId),
    supabase.from('price_watches').select('property_id').eq('user_id', userId),
    supabase.from('saved_searches').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('kpr_scenarios').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('shortlists').select('*').eq('owner_id', userId).order('created_at', { ascending: false }),
    supabase.from('shortlist_properties').select('shortlist_id, property_id'),
  ]);

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
      createdAt: r.created_at,
    })),
  };
}

export function pushSavedProperty(userId: string, propertyId: string, saved: boolean) {
  if (!isSupabaseConfigured || !supabase) return;
  const query = saved
    ? supabase.from('saved_properties').upsert({ user_id: userId, property_id: propertyId })
    : supabase.from('saved_properties').delete().match({ user_id: userId, property_id: propertyId });
  query.then(() => {});
}

export function pushPriceWatch(userId: string, propertyId: string, watching: boolean) {
  if (!isSupabaseConfigured || !supabase) return;
  const query = watching
    ? supabase.from('price_watches').upsert({ user_id: userId, property_id: propertyId })
    : supabase.from('price_watches').delete().match({ user_id: userId, property_id: propertyId });
  query.then(() => {});
}

export function pushSavedSearch(userId: string, search: SavedSearch) {
  if (!isSupabaseConfigured || !supabase) return;
  supabase
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
    .then(() => {});
}

export function removeSavedSearchRemote(id: string) {
  if (!isSupabaseConfigured || !supabase) return;
  supabase.from('saved_searches').delete().eq('id', id).then(() => {});
}

export function pushKprScenario(userId: string, scenario: KprScenario) {
  if (!isSupabaseConfigured || !supabase) return;
  supabase
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
    .then(() => {});
}

export function removeKprScenarioRemote(id: string) {
  if (!isSupabaseConfigured || !supabase) return;
  supabase.from('kpr_scenarios').delete().eq('id', id).then(() => {});
}

export function pushShortlist(userId: string, shortlist: Shortlist) {
  if (!isSupabaseConfigured || !supabase) return;
  supabase
    .from('shortlists')
    .insert({ id: shortlist.id, owner_id: userId, name: shortlist.name, invite_code: shortlist.inviteCode })
    .then(() => {});
}

export function deleteShortlistRemote(id: string) {
  if (!isSupabaseConfigured || !supabase) return;
  supabase.from('shortlists').delete().eq('id', id).then(() => {});
}

export function pushShortlistProperty(shortlistId: string, propertyId: string, userId: string, add: boolean) {
  if (!isSupabaseConfigured || !supabase) return;
  const query = add
    ? supabase.from('shortlist_properties').upsert({ shortlist_id: shortlistId, property_id: propertyId, added_by: userId })
    : supabase.from('shortlist_properties').delete().match({ shortlist_id: shortlistId, property_id: propertyId });
  query.then(() => {});
}
