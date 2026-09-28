# Huni — Play Store release readiness

Draft material for the Google Play Console submission, plus what's still
placeholder and needs Axel's input before a production build can actually
ship. Nothing here has been submitted — this is prep only.

## Blocking placeholders (Axel's action items)

| # | Item | Where | Status |
|---|------|-------|--------|
| 1 | Map provider | `src/components/PropertyMapView.tsx`, `app.json` | **Decided:** MapLibre + OpenFreeMap (`@maplibre/maplibre-react-native`) — free, no API key, no billing. Requires a dev/production build to see (not rendered in Expo Go — falls back to a list there). |
| 2 | Domain for Privacy Policy & account-deletion web pages | `src/app/account-deletion.tsx`, `src/app/privacy-policy.tsx`, `supabase/functions/shortlist-invite` | **Decided:** `huni.id` — treat as final, already used everywhere in code |
| 3 | Google Play Console developer account | — | **Deferred** — skipped for now per Axel, not a blocker for continued build work |
| 4 | App signing — let Google Play App Signing manage the upload key (default with EAS + `eas.json` `production` profile) | `eas build --profile production` | Not built yet |
| 5 | Store listing assets — icon (512×512), feature graphic (1024×500), phone screenshots (min 2) | — | Not produced (needs a real device/simulator build to screenshot) |

Domain and Play Console are deferred, not resolved — `huni.id` isn't
registered/live yet, so the privacy-policy/account-deletion links won't
actually resolve until Axel points that domain somewhere. These are release
blockers; the app must not be submitted to Play before both pages work.

Before release, apply all Supabase migrations, deploy and schedule the two
admin functions described in `supabase/README.md`, verify account deletion
end to end, and test push on a real device. The privacy-policy text remains
a draft requiring owner/legal review. Axel still needs a one-time
`eas build --profile development` to see the real map on his phone
(MapLibre's native module isn't in Expo Go).

## Data Safety form (draft answers)

Google Play's Data Safety section, based on what the app actually collects
today (Supabase auth + the decision-workspace tables in
`supabase/migrations/0001_init.sql`):

- **Data collected:** Name/email or phone number (via Google/phone auth),
  approximate/precise location (only while the app is in use, for nearby
  places and commute estimates — `ACCESS_COARSE_LOCATION` /
  `ACCESS_FINE_LOCATION`), user-generated content (saved properties,
  searches, KPR scenarios, shortlists), device push token.
- **Purpose:** App functionality (auth, saved workspace, notifications),
  not analytics or advertising — no ad SDK or analytics SDK is integrated.
- **Sharing:** Not shared with third parties, except the minimum needed to
  operate: Supabase (data processor, hosting) and Google/Firebase (auth,
  push delivery).
- **Security:** Data encrypted in transit (HTTPS/TLS to Supabase); Row
  Level Security restricts private workspace tables to their owners or
  invited shortlist members. Public catalogue tables are intentionally readable.
- **Deletion:** In-app account deletion (`src/app/account-deletion.tsx`)
  plus a web page fallback, per Play's requirement — the web page's URL
  needs item #2 above before it can be listed.
- **Financial Features:** the KPR simulator computes estimates locally and
  explicitly labels them "estimasi, bukan penawaran" (not an offer) — Play
  Console's Financial Features declaration should be answered honestly
  when the form asks; this is informational/estimation only, not a lending
  or brokering feature.

This is a draft to paste into the Play Console form, not a substitute for
Axel (as the account holder) reviewing and submitting it himself — he's
the one legally responsible for its accuracy.

## Store listing copy (draft, Indonesian)

**App name:** Huni — Cari & Bandingkan Rumah

**Short description (80 char max):**
`Cari, bandingkan, dan simulasikan KPR rumah impianmu — cepat & jujur.`

**Full description:**
```
Huni bantu kamu cari rumah, apartemen, dan proyek baru di Indonesia —
tanpa drama.

🔍 Cari dengan bahasa sendiri
Ketik "rumah 3 kamar dekat ITB cicilan 8 juta" dan Huni langsung
menerjemahkannya jadi filter yang bisa kamu sesuaikan.

🏠 Semua yang kamu butuh sebelum memutuskan
Peta properti, informasi lokasi sekitar, foto
fullscreen dengan zoom, dan alasan jujur kenapa sebuah properti cocok
untukmu — bukan skor rahasia.

💰 Simulasi KPR tanpa ribet
Hitung cicilan KPR baru atau take-over/refinance langsung di aplikasi,
simpan skenarionya untuk dibandingkan nanti.

👨‍👩‍👧 Putuskan bareng keluarga
Buat shortlist properti dan undang pasangan atau keluarga lewat tautan
privat untuk ikut memilih.

🔔 Jangan sampai kelewat
Pantau harga properti favoritmu dan dapat notifikasi begitu harganya
turun.

Huni: transparan, cepat, dan dibuat untuk cara orang Indonesia cari
rumah.
```

**Category:** House & Home
**Content rating:** Everyone (no user-generated public content, no
in-app purchases)

## Screenshot plan

Once a preview/production build runs on a device or emulator, capture
(portrait, 1080×1920 or device-native):
1. Home — intent switch + recommended rail
2. Search — natural-language chips + map view
3. Property detail — gallery + "why this fits"
4. KPR simulator — result screen
5. Compare — 2–3 properties side by side
6. Saved workspace — shortlists + saved searches

## Release hardening done this pass

- Fixed Saved/Compare/Shortlist-detail/Gallery screens reading the static
  mock property array by id — they now resolve through the same live
  Supabase-or-mock repository as Home/Search, so saved/watched/shortlisted
  items (real UUIDs once Supabase is configured) actually resolve instead
  of silently showing nothing.
- Added a root-level `ErrorBoundary` (`src/components/ErrorBoundary.tsx`)
  so an unexpected render error shows a "coba lagi" screen instead of a
  blank screen or a redbox in production.
- Gave the React Query client a `retry: 1` / `staleTime: 60s` default so a
  flaky network request doesn't hang indefinitely on a spinner.

## Release hardening, second pass

- Fixed a real Expo Go crash (`expo-notifications` was statically imported
  and throws on import on Android in Expo Go since SDK 53) — now dynamically
  imported and skipped entirely in Expo Go.
- Fixed the "Fully furnished" filter, which had no backing data field at
  all and could never actually filter anything.
- Added: hidden-properties UI, search history + area/city suggestions,
  pull-to-refresh and a real error state (vs. a fake "no results") on
  Search/Saved/Home, a working "Rekomendasi" sort, a dedicated developer
  profile screen, listing video support, project unit clusters/towers,
  and a branded splash screen (`expo-splash-screen`, was configured with
  an unused asset before).
- Replaced every screen's hand-rolled unicode-glyph icons with one
  consistent set (`@expo/vector-icons`'s Feather), including the tab bar.
- Verified clean: `expo-doctor` (only a harmless minor version-string
  mismatch on `@shopify/flash-list`), `tsc --noEmit`, and a production
  `expo export` (23 static routes, no errors).
- `versionCode`: not set manually — `eas.json`'s `appVersionSource: "remote"`
  means EAS auto-increments it on each build; nothing to configure here.

## Explicitly not done (out of scope for this pass)

- **Crash reporting SDK** (Sentry or similar): not installed — needs an
  account/DSN from Axel. Console `console.error` calls from the new
  ErrorBoundary are the only crash visibility for now; wiring a real
  service is a 20-minute job once he creates one and shares the DSN
  (never share full API tokens in chat — a Sentry DSN is safe client-side,
  same as the Supabase anon key).
- **Play submission itself**: not run. `eas.json`'s `submit.production`
  profile is ready (`track: "internal"`) for whenever Axel wants to try
  it, but that requires the Play Console account (#3) and a Play service
  account key, which stays out of chat per the usual credential rule.
