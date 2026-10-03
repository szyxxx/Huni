# Huni

Property marketplace app for Indonesia — mobile-first discovery, evaluation, and
decision support for buying, renting, and exploring new development projects.

Full requirements live in `PRD.md`, `SRS.md`, `ARCHITECTURE.md`, and `DESIGN.md`
at the repo root.

## Stack

- Expo SDK 57 + React Native 0.86 + React 19.2 + TypeScript
- Expo Router (file-based navigation, `src/app/`)
- Supabase (Postgres + Auth + Storage + Edge Functions) — see `supabase/README.md`
- `@tanstack/react-query` for server state, backed by Supabase when configured
- `zustand` for the local decision workspace (saved properties/searches, KPR
  scenarios, shortlists, price watches) — mirrored to Supabase for
  signed-in users, local-only for guests
- `expo-image`, `expo-blur`, `expo-haptics`,
  `react-native-reanimated` + `react-native-gesture-handler`,
  `@maplibre/maplibre-react-native` (OpenFreeMap tiles, free/no key —
  needs a dev/production build, not Expo Go)

## Backend

The app runs on local mock data (`src/data/properties.ts`, `src/data/projects.ts`)
until a Supabase project exists. Set `EXPO_PUBLIC_SUPABASE_URL` and
`EXPO_PUBLIC_SUPABASE_ANON_KEY` (see `.env.example`) and `src/data/repository.ts`
switches Home, Search, and the property/project detail screens to live
queries automatically — no code change needed. See `supabase/README.md` for
schema, seed data, edge functions, and what's not wired up yet.

## Push notifications

Data and auth run on Supabase; Android push notifications go through
**FCM** (Expo push tokens deliver over FCM on Android). To enable it:

1. Create a Firebase project, add an Android app with package name
   `id.huni.app`, and download `google-services.json`.
2. Place it at the repo root as `google-services.json` for local builds
   (git-ignored — never commit it). For EAS builds, upload it as a secret
   file variable named `GOOGLE_SERVICES_JSON` in both environments.
   `app.config.js` selects the EAS file path when present.
3. Upload the FCM **V1 service account key** to EAS yourself (`eas
   credentials`) — don't paste it in chat.

The JSON file configures the Android Firebase app. Delivery also requires
the FCM V1 service account credential in EAS and the scheduled Supabase
`price-drop-alerts` worker; verify both before enabling price alerts in a
public release.
`src/lib/pushNotifications.ts` registers a device's Expo push token into
Supabase's `push_tokens` table (used by the `price-drop-alerts` edge
function) once a user is signed in and has granted notification
permission.

## Design system

`src/theme` implements the light/dark palettes, spacing, type, and material
tokens from `DESIGN.md`: a warm-neutral canvas, ink-black primary actions, and
a restrained coral accent reserved for selection/fit signals — not full-screen
fills. Floating glass (`src/components/GlassSurface.tsx`) is reserved for the
bottom tab bar, detail screen's top controls, and the sticky contact bar, per
the material layering rules in the design doc. Everything else stays opaque
for readability and performance.

## What's implemented

- App shell: root stack + floating tab bar (Beranda / Explore / Tersimpan / Profil),
  skippable 3-slide onboarding on first launch
- Auth: Google sign-in (OAuth via `expo-web-browser`) and phone OTP through
  Supabase; guest browsing works with no account (PRD §8.1)
- Home: intent switch (Beli/Sewa/Hunian Baru), real search input feeding
  natural-language parsing, KPR entry banner, recommended/popular-area
  (vibe one-liners)/new-project rails
- Search: natural-language intent composer ("rumah 3 kamar dekat ITB cicilan
  8 juta" → editable/removable chips), a separate filters sheet, native map
  with synchronized price pins, a readable list, and multi-select compare (2–3).
  The map uses OpenFreeMap/OSM and shows selected public places within 10 km
  when zoomed in; tapping a point reveals its name.
- Property detail: full-bleed gallery → fullscreen pinch/double-tap-zoom
  viewer, verification badge, price + price-drop badge, "pantau harga" watch
  toggle, nearby commute lines, explainable multi-reason "why this fits"
  (computed from real filters/KPR state, no hidden score), spec rail,
  facilities, location, advertiser identity, report action, add to
  shortlist, similar properties, and a sticky contact action. Properties
  without a verified contact offer a clearly labelled local inquiry simulation.
- KPR simulator: new-loan mode (down payment/tenor/rate steppers,
  amortization estimate) and take-over/refinance mode, savable scenarios,
  required "estimate, not an offer" disclaimer
- Compare: side-by-side spec table for selected properties
- Shortlists: named collections with a native-share invite link for
  partner/family collaboration
- Saved workspace: saved properties, price-drop alerts feed, shortlists,
  saved searches, saved KPR scenarios
- Profile: guest/signed-in state, links to notifications/privacy/account deletion
- Developer/project pages: unit types, construction progress, promo, nearby
  places, and an inquiry simulation for disconnected developers
- Release scaffolding: `eas.json` build profiles, `app.config.js` permissions/
  plugins for location, notifications and maps (native module versions
  pinned to the SDK 57 bundled set), in-app account deletion + privacy
  policy screens (Play §17/18). Native Liquid Glass is used on supported iOS
  versions, with a translucent fallback on other devices.

## Not yet implemented (see PRD §21 phases)

- Listing/media upload pipeline, Agent/Seller Portal, Admin Console
- Real advertiser/developer contact delivery: the current catalogue has no
  verified contact numbers or connected developer accounts, so inquiries stay
  on the user's device until those integrations are supplied.
- Full Play-release hardening: a real domain for the web account-deletion/
  privacy resources, signing, Data Safety, store listing assets (§18–20), and
  an iOS 26 visual check on a real device or simulator.

## Android release builds

`eas.json` has a standalone `preview` APK for device testing and a
`production` AAB for Google Play. Build with
`npx eas-cli@latest build --platform android --profile preview` or replace
`preview` with `production`. Both profiles read their named EAS environment;
`.env.local` is for local development and is not uploaded to the build server.
The AAB is a store artifact and cannot be installed directly as an APK.
See `RELEASE_2026-10-03.md` for the current build, verification, and launch
blockers.

## Development

```bash
npm install
cp .env.example .env.local   # fill in once a Supabase project exists
npm run start      # Expo dev server (use a dev client, not Expo Go, for native modules)
npm run lint
npm run typecheck
npm test
npx expo-doctor
```
