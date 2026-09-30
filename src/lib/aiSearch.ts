import { supabase, isSupabaseConfigured } from './supabase';
import { parseIntentQuery, type ParsedIntent } from './intentParser';

/**
 * Tries the `ai-search` Supabase Edge Function (which calls an LLM with
 * ANTHROPIC_API_KEY held server-side, never in the app bundle) for a
 * richer read of free-text queries than the regex-based local parser.
 * Falls back to parseIntentQuery on any failure — not configured,
 * network error, function not deployed, bad response shape — so typing
 * a query never dead-ends even if the AI path is unavailable.
 */
export async function parseIntentSmart(query: string): Promise<ParsedIntent & { source: 'ai' | 'local' }> {
  const local = parseIntentQuery(query);
  if (!query.trim() || !isSupabaseConfigured || !supabase) return { ...local, source: 'local' };

  try {
    const { data, error } = await supabase.functions.invoke('ai-search', { body: { query } });
    if (error || !data?.result) return { ...local, source: 'local' };
    const r = data.result as Partial<ParsedIntent>;
    return {
      intent: r.intent ?? local.intent,
      type: r.type ?? local.type,
      bedrooms: r.bedrooms ?? local.bedrooms,
      maxInstallment: r.maxInstallment ?? local.maxInstallment,
      maxPrice: r.maxPrice ?? local.maxPrice,
      location: r.location ?? local.location,
      chips: local.chips,
      source: 'ai',
    };
  } catch {
    return { ...local, source: 'local' };
  }
}
