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

## What's implemented (Phase 0 foundation)

- App shell: root stack + glass tab bar (Beranda / Cari / Tersimpan / Profil)
- Home: intent switch (Beli/Sewa/Proyek Baru), intent search entry, KPR entry
  banner, recommended/popular-area/new-project rails with "why this fits" rationale
- Search: query + sort, list/map toggle (map is a placeholder pending a maps
  provider decision), 2-column results grid, empty state
- Property detail: full-bleed gallery, verification badge, price + estimated
  installment, spec rail, facilities, location placeholder, advertiser
  identity, report action, similar properties, sticky WhatsApp contact bar
- Saved workspace: saved properties grid backed by local zustand state
- Profile: guest state, menu scaffold for preferences/saved searches/KPR
  scenarios/notifications/privacy/account deletion

All property data in `src/data/properties.ts` is local mock content standing
in for the eventual listings API.

## Not yet implemented (see PRD §21 phases)

- Auth (Google/phone OTP), real backend, and listing/media pipeline
- Real map provider (`react-native-maps`) with synchronized price pins
- Filters sheet, natural-language intent parsing, KPR simulator screen
- Saved searches/notifications, shortlists/collaboration, comparison
- Agent/Seller Portal, Admin Console, Play-release hardening (§18–20)

## Development

```bash
npm install
npm run start      # Expo dev server (use a dev client, not Expo Go, for native modules)
npm run typecheck
```
