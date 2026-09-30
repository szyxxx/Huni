// Deploy: supabase functions deploy ai-search
// Secret required: supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
//
// Turns a free-text "describe your ideal home" query into the same
// structured shape src/lib/intentParser.ts's local regex parser
// produces, so the client can apply it through the exact same filter
// path either way. Never holds the API key client-side — this function
// is the only thing that ever sees it.

const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');

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

Deno.serve(async (request) => {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  if (!anthropicKey) return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }), { status: 500 });

  let query: string;
  try {
    const body = await request.json();
    query = String(body.query ?? '').slice(0, 500);
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), { status: 400 });
  }
  if (!query.trim()) return new Response(JSON.stringify({ error: 'Empty query' }), { status: 400 });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: query }],
      }),
    });
    if (!response.ok) {
      return new Response(JSON.stringify({ error: `Anthropic API error: ${response.status}` }), { status: 502 });
    }
    const data = await response.json();
    const text = data.content?.[0]?.text ?? '{}';
    const result = JSON.parse(text);
    return new Response(JSON.stringify({ result }), { headers: { 'content-type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
