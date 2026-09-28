# Huni — Feature Gap Audit (code-only, no screenshots)

Scope: PRD.md/SRS.md §8.1 Consumer Android App (and shared logic). Excludes Agent/Seller
Portal, Admin Console, and the listing/media upload pipeline per README.md's stated
"Not yet implemented" scope.

Legend: **Done** = wired to real store/data, no dead ends. **Stubbed** = UI exists but is
fake/dead/hardcoded. **Missing** = no code at all.

## Authentication and account

| Feature | Status | Evidence | Notes |
|---|---|---|---|
| Guest browsing | Done | `src/app/(tabs)/profile.tsx:21,35-39` shows guest state; no route requires auth | |
| Google sign-in | Done | `src/app/sign-in.tsx:29-35`, `src/auth/AuthProvider.tsx` (Supabase OAuth) | Inert until Supabase env vars are set (`configured` flag), but code path is real |
| Phone OTP | Done | `src/app/sign-in.tsx:37-51` two-step OTP via Supabase `signInWithPhone`/`verifyPhoneOtp` | |
| WhatsApp-based verification | Missing | no reference anywhere in `src/` | PRD marks this optional/conditional, so low priority |
| Profile and property preferences | Stubbed | `src/app/(tabs)/profile.tsx` shows name/avatar only; no editable preference fields (property type, budget, area) anywhere in the app | PRD 8.1 explicitly lists "profile and property preferences" |
| Bahasa Indonesia first; English-ready localization | Missing | `grep -rn "i18n\|Bahasa\|English\|localiz"` over `src/` returns nothing; every string is hardcoded Indonesian inline, no i18n framework | Not "English-ready" in any sense — a language switch would require rewriting every screen |
| Secure session lifecycle / logout | Done | `src/app/(tabs)/profile.tsx:41-44` calls `signOut` from `AuthProvider` | |
| In-app account deletion path | Stubbed | `src/app/account-deletion.tsx:20-35` only shows a confirm dialog and says "Permintaan diterima" — no Supabase call, no request is actually persisted or sent anywhere; comment at line 13 admits "Wiring the actual delete call needs the backend/auth decision" | Button looks functional but does nothing durable |
| External web account-deletion resource | Stubbed | `src/app/account-deletion.tsx:7,61-65` links to `https://huni.id/hapus-akun`, a domain that doesn't exist/isn't owned yet | Required by Play policy; currently a dead link |

## Onboarding

| Feature | Status | Evidence | Notes |
|---|---|---|---|
| 1–3 screen skippable onboarding | Done | `src/app/onboarding.tsx:9-25,85-93` 3 slides, "Lewati" skip button | |
| Visual/property storytelling | Done | same file, Unsplash hero images + narrative copy | |
| Optional preference capture after value shown | Missing | onboarding goes straight from slide 3 to `router.replace('/(tabs)')` (`src/app/onboarding.tsx:36-39`); no preference step exists anywhere | |
| No mandatory account creation before browsing | Done | onboarding never gates on auth; guest browsing works | |

## Home

| Feature | Status | Evidence | Notes |
|---|---|---|---|
| Personalized greeting/context | Stubbed | `src/app/(tabs)/index.tsx:46-47` — greeting text is static ("Selamat datang," / "Cari rumah yang pas untukmu"), not personalized by name or context even when signed in | |
| Primary intent/search field | Done | `src/app/(tabs)/index.tsx:57-69` real `TextInput` that pushes to Search with the query | |
| Buy/Rent/New Projects mode | Done | `src/app/(tabs)/index.tsx:51-55` wired to `useAppStore().intent` | |
| Curated/personalized rails ("Rekomendasi untukmu") | Stubbed | `src/app/(tabs)/index.tsx:31` — `recommended = properties.filter(p => p.fitReason || p.nearby?.length)`, i.e. just "has a canned fitReason string in mock data", not a real personalization/ranking pipeline | `getFitReasons` (real logic) is used on the detail/card level but the Home rail itself is just a hardcoded-field filter |
| Recently explored | Missing | Home screen has no "recently explored" rail; recently-viewed only appears in Saved tab (`src/app/(tabs)/saved.tsx:75-91`) | PRD 8.1 lists this under Home specifically |
| Popular areas | Stubbed | `src/app/(tabs)/index.tsx:93-108` renders `popularAreas` from `src/data/properties.ts:191-196` — `count: 1240` etc. and `vibe: 'Tenang & asri'` are hand-typed constants, not computed from any listings data; tapping a card just routes to `/search` with no filter applied (line 97) | Card promises "1240 properti" but Search shows the full unfiltered catalogue (6 mock items) |
| New projects rail | Done | `src/app/(tabs)/index.tsx:110-130` pulls from `fetchProjects()` (repository, live or mock) | |
| Special offers | Missing | no "special offers" rail/section on Home; `promotion` field exists on properties but Home doesn't surface a dedicated offers rail | |
| Affordability/KPR entry point | Done | `src/app/(tabs)/index.tsx:71-82` banner routes to `/kpr` | |
| Saved workspace shortcut | Partial/Stubbed | No explicit "shortcut" card on Home; only reachable via the Saved tab or Profile menu | Low severity — tab bar already provides this, but PRD calls it out as a distinct Home element |

## Search

| Feature | Status | Evidence | Notes |
|---|---|---|---|
| Full-text query | Done | `src/app/(tabs)/search.tsx:72-77` substring match on title/area/city | |
| Location autocomplete | Missing | no autocomplete dropdown/suggestions component anywhere; `intentParser.ts` only extracts a "near X" phrase from typed text via regex (`src/lib/intentParser.ts:75-79`), no suggestion UI | |
| Entity suggestions (area/project/developer/POI) | Missing | none of these exist as a suggestion surface | |
| Search history and recent places | Missing | no history list UI/persistence in `search.tsx` or the store (`useAppStore.ts` has no `searchHistory` field) | |
| Natural-language intent composer | Done | `src/lib/intentParser.ts` full implementation; wired into `search.tsx:37-46` | Real regex-based parsing of intent/type/bedrooms/installment/price/location |
| Editable/removable extracted filter chips | Done | `src/app/(tabs)/search.tsx:132-145`, `removedChipKeys` state actually removes the filter effect (line 38, 61) | |
| List view | Done | `search.tsx:171-206` FlashList-style 2-col grid | |
| Map view with synchronized results | Done | `search.tsx:166-169` + `src/components/PropertyMapView.tsx` — real MapLibre integration, degrades to a list fallback on web/Expo Go (by design, needs dev build) | |
| Cursor pagination / progressive loading | Missing | `FlatList` renders the full filtered array (`src/app/(tabs)/search.tsx:171`), no `onEndReached`/cursor logic; `fetchProperties()` has no pagination params (`src/data/repository.ts:69-78`) | Mock catalogue is tiny (6 items) so this was never exercised |
| Pull-to-refresh | Missing | no `RefreshControl` on any `FlatList` in `search.tsx`, `saved.tsx`, etc. | |
| Robust empty/error states | Partial | Empty state exists (`search.tsx:196-205`); no explicit error state UI if `fetchProperties` query errors (react-query `error` is never read) | |

## Filters

| Feature | Status | Evidence | Notes |
|---|---|---|---|
| Buy/rent | Done | via Home/Search intent switch, not in filters sheet itself | |
| Secondary/new project | Missing | no such toggle in `src/app/filters.tsx` or `FilterState` (`src/store/useAppStore.ts:23-32`) | |
| Property type | Done | `filters.tsx:58-63` | |
| Province/city/district/area | Missing | no location filter fields in `filters.tsx`; location only reachable via free-text "dekat X" in search box | |
| Price range | Done | `filters.tsx:65-78` stepper | |
| Monthly/yearly rental period | Missing | `FilterState` has no rent-period field | |
| Monthly installment maximum | Done | `filters.tsx:80-85` | |
| Bedrooms/bathrooms | Done | `filters.tsx:88-102` | |
| Land/building area | Missing | no area-range filter | |
| Furnishing | Done | `filters.tsx:111-115` (furnished-only toggle) | |
| Certificate/status attributes | Missing | no such field on `Property` type or filters | |
| Video available | Missing | no `video` field on `Property`, no filter chip | Property detail also has no video player (see below) |
| Verified/official developer | Done | `filters.tsx:106-110` | |
| Special offer | Missing | `promotion` exists on data but no filter chip for it | |
| Rent-to-own eligibility | Missing | not modeled anywhere | |
| Sort: recommendation/newest/price low/high/largest area | Partial | `search.tsx:14,88-91` implements Newest/Price low/Price high; "Rekomendasi" sort option exists in the list but has no distinct sort logic (falls through to default array order); "largest land/building area" sort is missing entirely | |
| Price histogram | Missing | no chart/visualization in `filters.tsx` (marked optional in PRD) | |

## Property results (cards)

| Feature | Status | Evidence | Notes |
|---|---|---|---|
| Media-led editorial cards | Done | `src/components/PropertyCard.tsx` | |
| Price + monthly estimate | Done | `formatPriceLine` used; installment shown on detail, not on card itself | Card doesn't show estimated monthly on the card face — minor gap vs PRD wording |
| Location | Done | `PropertyCard.tsx:68-70` | |
| Top specs | Done | `PropertyCard.tsx:25-29,71-75` | |
| Verification/sponsor status | Done | `PropertyCard.tsx:41-47` promotion tag; verification badge only shown on detail, not the card | |
| Save/hide | Partial | Save wired (`PropertyCard.tsx:48-59`, `toggleSaved`); **Hide is entirely missing from the UI** — `toggleHidden` exists in the store (`useAppStore.ts:98-99, 157-163`) but is never called from any screen, and `hiddenIds` never filters any list | Dead store code — a feature that's half-wired |
| Quick transition to detail | Done | `onPress` navigates to `/property/[id]` | |

## Property detail

| Feature | Status | Evidence | Notes |
|---|---|---|---|
| Full-bleed gallery | Done | `src/app/property/[id].tsx:67-121` | |
| Fullscreen viewer + pinch zoom | Done | `src/app/gallery/[id].tsx` real pinch/double-tap gesture handling with reanimated | |
| Video | Missing | no video field/player anywhere in `property/[id].tsx` or `Property` type | |
| Share | **Stubbed (dead button)** | `src/app/property/[id].tsx:87-92` — the share `Pressable` has **no `onPress` handler at all**; tapping it does nothing | High-visibility dead button on the most-visited screen |
| Favorite | Done | `property/[id].tsx:93-105`, `toggleSaved` | |
| Price / previous price / unit price | Done | `property/[id].tsx:126-137`, drop badge | |
| Estimated installment | Done | `property/[id].tsx:195-201`, links into KPR | |
| Core specification rail | Done | `property/[id].tsx:222-227` | |
| Structured details / description | Done | `property/[id].tsx:229-232` | |
| Facilities | Done | `property/[id].tsx:234-241` | |
| Location precision (exact/approximate/hidden) | Stubbed | `property/[id].tsx:243-248` — `mapPlaceholder` is a static gray box with text "Peta lokasi tersembunyi/perkiraan"; **no actual map is rendered here**, even though `PropertyMapView`/MapLibre is already built and used on Search | The one screen where a real map matters most for "is this worth contacting" shows a placeholder box instead |
| Map and nearby places | Partial/Stubbed | Nearby distances are shown as plain text (`property/[id].tsx:185-193`) but they reference generic saved-preference labels ("Kantor tersimpan", "Sekolah tersimpan") from mock data, not real POI data or a real "nearby places" list/map; no map widget on this screen at all | This is one of the 6 named differentiators ("Nearby Places") — currently just static text lines |
| "Why it may fit you" explainable module | Done | `property/[id].tsx:209-220` + `src/lib/recommendations.ts` — genuinely computed from filters/KPR state, not a hidden score | Best-implemented differentiator in the app |
| Advertiser identity and verification | Done | `property/[id].tsx:250-268` + `VerificationBadge.tsx` | |
| Report listing | **Stubbed (dead button)** | `src/app/property/[id].tsx:270-274` — `Pressable` has **no `onPress`**; tapping "Laporkan iklan ini" does nothing | Second dead button on this screen |
| Similar properties | Done | `property/[id].tsx:57,276-287` — same-type filter, real data | |
| Persistent primary contact action | Done | `property/[id].tsx:291-301`, sticky WhatsApp bar with real `Linking.openURL` | |

## Saved and decision workspace

| Feature | Status | Evidence | Notes |
|---|---|---|---|
| Saved properties | Done | `src/app/(tabs)/saved.tsx:28,54-72` | |
| Saved searches | Done | `saved.tsx:154-176`, `search.tsx:94-103` create flow | |
| Recently viewed | Done | `saved.tsx:75-91`, `addRecentlyViewed` called from `property/[id].tsx:44` | |
| Hidden properties | Missing (UI) | store field exists (`useAppStore.ts:98-99`) but no screen ever lists hidden properties or a way to unhide; no card ever calls `toggleHidden` | See "Save/hide" row above — same underlying gap |
| Saved mortgage simulations | Done | `saved.tsx:178-201`, `kpr.tsx:45-67` | |
| Shortlists/collections | Done | `saved.tsx:121-151`, `shortlist/[id].tsx` | |
| Shared shortlist invitation | Done | `shortlist/[id].tsx:39-48,80-88` real `Share.share()` with a deep link; comment at lines 11-16 is honest that the join flow (someone actually opening the link and landing in the shortlist) isn't wired since there's no backend auth flow yet | Share works; receiving end of the invite is not implemented |
| Property comparison | Done | `compare.tsx`, `search.tsx:180-193,209-218` (2–3 item multi-select) | |

## Financing (KPR)

| Feature | Status | Evidence | Notes |
|---|---|---|---|
| KPR simulator (DP/loan/tenor/rate/monthly) | Done | `src/app/kpr.tsx` + `src/lib/kpr.ts` real amortization math | |
| Compare/save scenarios | Done | `kpr.tsx:45-67`, `saved.tsx:178-201` | |
| Bank product directory | Missing | not present anywhere (PRD marks this conditional on reliable source/disclosure, so appropriately absent) | |
| Take-over KPR estimator | Done | `kpr.tsx` "takeover" mode + `calculateTakeOver` in `src/lib/kpr.ts` | Ahead of PRD, which says this "may follow after core simulator" |

## Project/developer

| Feature | Status | Evidence | Notes |
|---|---|---|---|
| Developer profile | Stubbed | No dedicated developer-profile screen/route; developer identity is shown inline on the project page only (`project/[id].tsx:61-69`) | PRD lists "Developer profile" as its own item separate from "Project detail" |
| Project detail | Done | `src/app/project/[id].tsx` | |
| Cluster/tower | Missing | `DevelopmentProject` type (`src/data/projects.ts`) has no cluster/tower concept, only flat `units` | |
| Unit type | Done | `project/[id].tsx:87-102` | |
| Unit comparison | Missing | no compare action scoped to project units (the general `compare.tsx` only compares `Property` records, not project units) | |
| Promotions | Done | `project/[id].tsx:71-75` | |
| Construction progress | Done | `project/[id].tsx:77-85` real progress bar from data | |
| Project facilities | Done | `project/[id].tsx:104-111` | |
| Nearby POI | Stubbed | `project/[id].tsx:113-118` — same static-label pattern as property detail ("Sekolah tersimpan" etc.), no map | |
| Travel distance/time to saved office/favorite places | Stubbed | Values exist in mock data but there's no UI anywhere to actually save "my office" or "my favorite place" — the labels are hardcoded strings, not user-entered places | This is presented as personalized but nothing lets the user set what it's relative to |
| Inquiry and brochure request | Done | `project/[id].tsx:36-40,122-132` real WhatsApp deep link | |

## Notifications

| Feature | Status | Evidence | Notes |
|---|---|---|---|
| Saved search match | Partial | Preference toggle exists (`notifications-settings.tsx:16-23`) and a Supabase edge function scaffold exists for price drops, but there is no equivalent edge function/cron for saved-search matching; nothing actually triggers this notification type | |
| Price decrease | Done (backend scaffolded) | `supabase/functions/price-drop-alerts/index.ts`, `src/lib/pushNotifications.ts` registers tokens, `useAppStore.ts:267-274` computes local price-alert feed | Requires a deployed Supabase project + FCM credentials to actually fire; code path is real, not literally stubbed |
| Listing availability update | Missing | preference toggle exists but no backend job/trigger for it anywhere | |
| Project promotion | Missing | preference toggle exists, no trigger | |
| Shortlist invitation/activity | Partial | `shortlist-invite` edge function exists (`supabase/functions/shortlist-invite/index.ts`) for invitations; "activity" notifications (member added/removed a property) have no trigger | |
| Lead follow-up (consent-gated) | Missing | no lead/contact tracking table or trigger; toggle exists in UI only | |
| Per-category notification preferences | Done | `src/app/notifications-settings.tsx` full UI wired to store + permission request flow | |

## The 6 named differentiators

| Feature | Status | Evidence | Notes |
|---|---|---|---|
| Gallery Fullscreen | Done | `src/app/gallery/[id].tsx` | Real pinch-zoom + double-tap, best-executed differentiator alongside "why fits" |
| Compare Properties | Done | `src/app/compare.tsx`, multi-select in Search | |
| Nearby Places | Stubbed | Static text lines referencing generic "Kantor/Sekolah tersimpan" labels, no map, no way to set what "tersimpan" (saved) actually refers to (`property/[id].tsx:185-193`, `project/[id].tsx:113-118`) | |
| Shareable Shortlists | Done (mostly) | `shortlist/[id].tsx` — share works; recipient join flow not wired (documented honestly in the code comment) | |
| Price Drop Alerts | Done (needs live backend) | Watch toggle (`property/[id].tsx:139-150`), alert feed (`saved.tsx:93-119`), edge function + push token registration all exist | Functionally complete in code; inert until Supabase/FCM are actually configured |
| Neighborhood Vibe | **Stubbed** | `src/data/properties.ts:191-196` — `vibe: 'Tenang & asri'` etc. are hand-typed one-line strings on 4 hardcoded areas, `count` is a fake number, tapping a card ignores the area entirely and opens unfiltered Search (`(tabs)/index.tsx:97`) | This is presented on Home as if it were a real area-intelligence feature; it is entirely static copy |

---

## Design consistency (DESIGN.md vs code)

**Radius scale drift.** DESIGN.md §8 defines an explicit radius scale: `8, 12, 16, 20, 24, 28, 32, 999`. In practice the codebase uses many off-scale values — `14` appears 12 times, `18` appears 6 times, `22` appears 3 times, plus one-off `15`:
- `src/app/filters.tsx:131` (`borderRadius: 18`)
- `src/app/notifications-settings.tsx:110` (`14`)
- `src/app/shortlist/[id].tsx:121` (`18`)
- `src/app/project/[id].tsx:144,147,155,161` (`14`, `14`, `22`, `14`)
- `src/app/gallery/[id].tsx:112` (`18`)
- `src/app/property/[id].tsx:320,350,359,366,372` (`14`, `18`, `22`, `22`, `14`)
- `src/app/kpr.tsx:239` (`18`)
- `src/app/(tabs)/search.tsx:231,234` (`14`, `14`)
- `src/app/(tabs)/saved.tsx:215` (`14`)
- `src/app/(tabs)/index.tsx:186` (`18`)
- `src/app/sign-in.tsx:147,148` (`14`, `14`)
- `src/components/PropertyCard.tsx:124` (`15`, half of a hardcoded 30px circle)

This is the single most systemic inconsistency: almost every screen picks its own "close enough" radius instead of the documented 16/20/24 steps, so cards, pills and buttons read as subtly different roundness across screens (search bar vs. filter card vs. KPR input vs. contact bar).

**Hardcoded colors instead of theme tokens.**
- `src/components/ErrorBoundary.tsx:46-50` — the entire error screen is hardcoded (`#F5F3F0`, `#1A1A1A`, `#6B6B6B`, `#FFFFFF`) and **never imports `useTheme` at all**, so it always renders in the light palette regardless of system dark mode. This is the only screen file in the app with zero theme awareness (confirmed via `grep`: it's the sole file matching "no `theme.` usage").
- `src/app/account-deletion.tsx:54` — `color: '#fff'` on the danger button label instead of `theme.colors.onDanger`/`surface`.
- `src/app/gallery/[id].tsx:37,53,55` — `#000`/`#fff` hardcoded for the fullscreen viewer chrome. Defensible (viewer is always a black scrim regardless of theme) but not routed through tokens, so it can't be swapped if the design system's "on-dark" color ever changes.
- `src/app/property/[id].tsx:116,132`, `src/app/(tabs)/index.tsx:100`, `src/components/PropertyCard.tsx:56` — `#fff`/`rgba(255,255,255,...)` used for text/dots sitting on photo scrims. Same category as above: reasonable in isolation (image overlays are scheme-independent) but not tokenized, so there's no single place to adjust "on-image" white if that ever needs to change.

**Inconsistent card/section patterns.** Most list screens use `SectionHeader` (`src/components/SectionHeader.tsx`) consistently for rail titles (Home, Saved). But several screens roll their own one-off row/card styles instead of a shared `Card`/`ListRow` primitive — there is no shared card component at all beyond `PropertyCard`:
- `src/app/(tabs)/saved.tsx:210-217` defines a local `row`/`empty` style
- `src/app/filters.tsx:131` defines a local `card` style
- `src/app/kpr.tsx` (styles not fully quoted above) defines its own `card`/`priceInput` styles
- `src/app/notifications-settings.tsx:111` defines its own `row`
Each of these hand-rolls border width, radius, and padding independently rather than sharing one `Card`/`Row` component, which is how the radius drift above happens in the first place — there's no single source of truth to keep them aligned.

**Dark mode.** `theme.scheme` is only referenced in `src/app/_layout.tsx`, `src/components/GlassSurface.tsx`, and `src/theme/ThemeProvider.tsx` — every screen consumes color via `theme.colors.*` (correct pattern) rather than branching on scheme directly, which is good. The one break is `ErrorBoundary.tsx` noted above, which will show a light-hardcoded error screen even in dark mode — ironic, since it's the screen users see when something else has already gone wrong.

---

## Prioritized punch list (highest impact on "feels unfinished" first)

1. **Dead Share and Report buttons on the property detail screen** (`src/app/property/[id].tsx:87-92`, `270-274`) — no `onPress` at all. This is the single most-visited screen in the app; two visibly tappable icons/links that do nothing is the fastest way for a user to conclude the app is broken.
2. **Property detail "Lokasi" section is a static gray placeholder box** (`src/app/property/[id].tsx:243-248`) instead of the real MapLibre map that already exists and works on the Search screen (`src/components/PropertyMapView.tsx`). Users expect a map exactly where the text literally says "Peta lokasi…" (map location).
3. **Account deletion doesn't do anything and links to a domain that doesn't exist** (`src/app/account-deletion.tsx:7,20-35`). A confirm dialog that says "diterima" (accepted) but persists nothing, plus a dead link to `huni.id`, is a trust-breaking dead end on a legally-required flow.
4. **"Neighborhood Vibe" and "Popular areas" on Home are fully fake data** (`src/data/properties.ts:191-196`) — hardcoded counts and one-line vibes, and tapping a card ignores the area and opens the unfiltered full catalogue. Since this sits front-and-center on Home, it reads as an obviously fake/non-functional feature on first launch.
5. **Hidden properties feature is half-wired** — `toggleHidden`/`hiddenIds` exist in the store but no card anywhere exposes a "hide" action and no list filters by it. Either finish it (surface the hide action + a "hidden" section in Saved) or remove the dead store code; right now it's neither present nor absent, just latent.
6. **No search history / recent places / location autocomplete** — Search feels like a single blunt text box despite PRD calling for entity suggestions; this is the kind of "obviously missing" gap a first-time user notices immediately when they tap the search bar and get nothing.
7. **Off-scale, inconsistent card/button radii across nearly every screen** (see Design consistency section) — individually invisible, but in aggregate this is very likely a meaningful part of why the app "looks messy": no two screens' cards, pills, and buttons round the same way.
8. **No localization scaffolding at all** despite PRD requiring "English-ready" — not urgent for launch polish, but worth flagging since it will require a rewrite of every screen's strings later, not just a toggle.
