# Huni

Property marketplace app for Indonesia — mobile-first discovery, evaluation, and
decision support for buying, renting, and exploring new development projects.

Full requirements live in `PRD.md`, `SRS.md`, `ARCHITECTURE.md`, and `DESIGN.md`
at the repo root.

## Stack

- Expo SDK 57 + React Native 0.86 + React 19.2 + TypeScript
- Expo Router (file-based navigation, `app/`)
- `@tanstack/react-query` for server state (wired, not yet backed by an API)
- `zustand` for ephemeral client state (saved properties, search intent)
- `expo-image`, `expo-blur`, `expo-haptics`, `@shopify/flash-list`,
  `react-native-reanimated` + `react-native-gesture-handler`

## Design system

`src/theme` implements the light/dark palettes, spacing, type, and material
tokens from `DESIGN.md`: a warm-neutral canvas, ink-black primary actions, and
a restrained coral accent reserved for selection/fit signals — not full-screen
fills. Floating glass (`src/components/GlassSurface.tsx`) is reserved for the
bottom tab bar, detail screen's top controls, and the sticky contact bar, per
the material layering rules in the design doc. Everything else stays opaque
for readability and performance.

## What's implemented (Phase 0 + Phase 1 in progress)

- App shell: root stack + glass tab bar (Beranda / Cari / Tersimpan / Profil)
- Home: intent switch (Beli/Sewa/Proyek Baru), intent search entry, KPR entry
  banner, recommended/popular-area rails (with neighborhood "vibe" one-liners)
  and new-project rails
- Search: query + sort, filters sheet (type/price/beds/baths/installment/
  verified), native map with synchronized price pins (`react-native-maps`,
  list fallback on web) or 2-column grid, multi-select compare (2–3), empty state
- Property detail: full-bleed gallery → fullscreen pinch/double-tap-zoom
  viewer, verification badge, price + price-drop badge, "pantau harga" watch
  toggle, nearby commute lines, estimated installment → KPR simulator,
  spec rail, facilities, location, advertiser identity, report action, add to
  shortlist, similar properties, sticky WhatsApp contact bar
- KPR simulator: down payment/tenor/rate steppers, amortization estimate,
  savable scenarios, required "estimate, not an offer" disclaimer
- Compare: side-by-side spec table for selected properties
- Shortlists: named collections with a native-share invite link for
  partner/family collaboration
- Saved workspace: saved properties, price-drop alerts feed, shortlists,
  saved searches, saved KPR scenarios — all local zustand state
- Profile: guest state, links to notifications/privacy/account deletion
- Release scaffolding: `eas.json` build profiles, `app.json` permissions/
  plugins for location, notifications and maps, in-app account deletion +
  privacy policy screens (Play §17/18)

All property data in `src/data/properties.ts` is local mock content standing
in for the eventual listings API.

## Not yet implemented (see PRD §21 phases)

- Auth (Google/phone OTP), real backend, and listing/media pipeline
- Natural-language intent parsing/composer
- Saved-search push notifications actually firing (preferences UI exists;
  no push backend yet)
- Project/developer/unit pages, onboarding flow
- Agent/Seller Portal, Admin Console
- Full Play-release hardening: real Maps API keys, real domain for web
  resources, signing, Data Safety, store listing assets (§18–20)

## Development

```bash
npm install
npm run start      # Expo dev server (use a dev client, not Expo Go, for native modules)
npm run typecheck
```
