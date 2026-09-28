# Huni Supabase backend

## Setup

1. Create a project at [supabase.com](https://supabase.com).
2. Apply the schema: `supabase link --project-ref <ref>` then
   `supabase db push` (or paste `migrations/0001_init.sql` into the SQL
   editor).
3. Seed sample data: run `seed/seed.sql` the same way — optional, but the
   app has nothing to show without it (or a properly listed catalogue) once
   it's pointed at Supabase.
4. In Authentication settings, enable the **Google** provider and **Phone**
   (SMS OTP, needs an SMS provider like Twilio/MessageBird configured under
   Auth → Providers → Phone).
5. Copy `.env.example` to `.env.local` in the repo root and fill in the
   project URL and **anon** key from Project Settings → API. Never put the
   `service_role` key in the app or in chat — it only belongs in Edge
   Function secrets.
6. For Android push (FCM), see the "Push notifications" section in the repo
   root `README.md` — Axel needs to create a Firebase project and send
   `google-services.json`.
7. Deploy the edge functions:
   ```bash
   supabase functions deploy price-drop-alerts
   supabase functions deploy shortlist-invite
   ```
   `price-drop-alerts` expects a DB webhook on `properties` UPDATE (or a
   cron schedule) so it has something to react to.

## What's here

- `migrations/0001_init.sql` — full schema: property taxonomy, advertisers,
  properties, projects/units, the user decision workspace (saved
  properties/searches, KPR scenarios, price watches, shortlists), leads,
  and notification/push-token tables, all with row-level security.
- `seed/seed.sql` — the same six properties and two projects the app used
  as mock data, so a fresh project isn't empty.
- `functions/price-drop-alerts` — records a price_change_events row and
  pushes an Expo notification to everyone watching a listing when its price
  drops.
- `functions/shortlist-invite` — resolves an invite code and joins the
  calling user to that shortlist.

## App-side wiring

`src/lib/supabase.ts` creates the client from `EXPO_PUBLIC_SUPABASE_URL` /
`EXPO_PUBLIC_SUPABASE_ANON_KEY`. `src/data/repository.ts` exposes
`fetchProperties`/`fetchPropertyById`/`fetchProjects`/`fetchProjectById`,
which query Supabase when configured and fall back to the bundled mock data
otherwise — so the app keeps working before the project exists. Home,
Search, and the property/project detail screens are wired to these through
React Query. `src/auth/AuthProvider.tsx` handles Google OAuth (via
`expo-web-browser`) and phone OTP.

Not yet wired to Supabase (still local zustand/mock state): saved
properties/searches, KPR scenarios, shortlists, price watches, and compare —
the tables and RLS policies exist (see the migration), but the screens
still read/write local state. Next step is swapping those stores' actions
for Supabase reads/writes once real auth sessions exist to scope them to.
