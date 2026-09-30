import { supabase, isSupabaseConfigured } from './supabase';
import { parseIntentQuery, type ParsedIntent } from './intentParser';
import { z } from 'zod';

const aiResultSchema = z.object({
  intent: z.enum(['buy', 'rent']).optional(),
  type: z.enum(['house', 'apartment', 'villa', 'kost', 'land', 'ruko', 'office']).optional(),
  bedrooms: z.number().int().min(1).max(20).optional(),
  maxInstallment: z.number().finite().positive().max(1_000_000_000_000).optional(),
  maxPrice: z.number().finite().positive().max(1_000_000_000_000_000).optional(),
  location: z.string().trim().min(1).max(120).optional(),
});

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
    const validated = aiResultSchema.safeParse(data.result);
    if (!validated.success) return { ...local, source: 'local' };
    const r = validated.data;
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
