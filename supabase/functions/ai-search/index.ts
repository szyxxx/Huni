// Deploy: supabase functions deploy ai-search
//
// Provider-agnostic: talks to any OpenAI-compatible /chat/completions
// endpoint, configured entirely by secrets — so swapping Anthropic,
// 9router, OpenRouter, or a self-hosted gateway is a `supabase secrets
// set` away, no code change.
//
//   supabase secrets set AI_BASE_URL=https://api.anthropic.com/v1/  (OpenAI-compatible path)
//   supabase secrets set AI_API_KEY=sk-...
//   supabase secrets set AI_MODEL=claude-haiku-4-5-20251001
//
// AI_BASE_URL/AI_API_KEY fall back to ANTHROPIC_API_KEY against
// Anthropic's own OpenAI-compatible endpoint if the AI_* secrets aren't
// set, so a project that only ever ran `supabase secrets set
// ANTHROPIC_API_KEY=...` keeps working unchanged.
//
// Turns a free-text "describe your ideal home" query into the same
// structured shape src/lib/intentParser.ts's local regex parser
// produces, so the client can apply it through the exact same filter
// path either way. The API key never leaves this function.
//
// Not yet supported: per-user bring-your-own-key. Every request uses
// this one project-wide key; letting each user supply their own would
// need encrypted storage (or passing it per-request, which pushes the
// same "never ship a key client-side" problem back to the caller) —
// left for a later pass.

const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
const baseUrl = (Deno.env.get('AI_BASE_URL') || 'https://api.anthropic.com/v1/').replace(/\/?$/, '/');
const apiKey = Deno.env.get('AI_API_KEY') || anthropicKey;
const model = Deno.env.get('AI_MODEL') || 'claude-haiku-4-5-20251001';

const SYSTEM_PROMPT = `Kamu mengubah kalimat bebas seorang pencari properti di Indonesia menjadi JSON terstruktur.
Balas HANYA dengan JSON valid, tanpa markdown, tanpa penjelasan, sesuai skema ini (semua field opsional, hilangkan field yang tidak disebutkan):
{
  "intent": "buy" | "rent",
  "type": "house" | "apartment" | "villa" | "kost" | "land" | "ruko" | "office",
  "bedrooms": number,
  "maxInstallment": number (rupiah, cicilan bulanan maksimum),
  "maxPrice": number (rupiah, harga maksimum),
  "location": string (nama area/kota/kampus/landmark yang disebut)
}`;

function extractJson(text: string): unknown {
  // Models sometimes wrap JSON in prose or a ```json fence despite instructions —
  // pull the first {...} block rather than depending on strict-JSON tool-call
  // support, which isn't uniform across OpenAI-compatible providers.
  const match = text.match(/\{[\s\S]*\}/);
  return JSON.parse(match ? match[0] : text);
}

Deno.serve(async (request) => {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  if (!apiKey) return new Response(JSON.stringify({ error: 'AI_API_KEY (or ANTHROPIC_API_KEY) not configured' }), { status: 500 });

  let query: string;
  try {
    const body = await request.json();
    query = String(body.query ?? '').slice(0, 500);
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), { status: 400 });
  }
  if (!query.trim()) return new Response(JSON.stringify({ error: 'Empty query' }), { status: 400 });

  try {
    const response = await fetch(`${baseUrl}chat/completions`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        max_tokens: 300,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: query },
        ],
      }),
    });
    if (!response.ok) {
      return new Response(JSON.stringify({ error: `AI provider error: ${response.status}` }), { status: 502 });
    }
    const data = await response.json();
    const text = data.choices?.[0]?.message?.content ?? '{}';
    const result = extractJson(text);
    return new Response(JSON.stringify({ result }), { headers: { 'content-type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
