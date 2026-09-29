# DESIGN — Huni

**Visual direction:** Premium elegant Apple macOS 27-inspired spatial material language × Meta Muse-style intent interaction × supplied editorial travel/property references  
**Version:** 3.0  
**Date:** 28 September 2026  
**Target:** Expo SDK 57 + React Native Android/iOS, Android/Google Play first  
**Reference images:** `references/ui-reference-01.png`, `references/ui-reference-02.png`

---

## 1. Design Thesis

Huni should feel like a calm, premium place to make a consequential decision — not a classifieds database and not a generic dashboard.

The visual system combines four ideas:

1. **Contemporary Apple/macOS material hierarchy** — layered translucency, soft depth, restrained controls, precise spacing, confident typography, and surfaces that feel physically related.
2. **Meta Muse interaction character** — intent-first exploration, flexible composition, editable system interpretation, progressive disclosure, and clear user control.
3. **Reference 01** — monochrome editorial layout, circular/floating image storytelling, strong black primary action, minimal line icons, clean filter sheet, histogram/range control, and generous white space.
4. **Reference 02** — warm white surface, restrained coral accent, map-first discovery, price pins, floating property preview, large image-led listing cards, and compact bottom navigation.

The result must be **original**. Do not copy brand marks, exact screen composition, proprietary typefaces, or image assets from Apple, Meta, or the supplied references.

---

## 2. Reference Deconstruction

### Reference 01 — what to carry forward

- Near-monochrome palette with one dominant black CTA.
- Large editorial headline and generous breathing room.
- Property media treated as composition, not decoration.
- Radial/floating image orbit for onboarding storytelling.
- Full-bleed hero image with controls floating over media.
- Compact rounded spec chips.
- Filter UI with steppers and an informative price-distribution histogram.
- Content card emerging from the image rather than a traditional boxed layout.

### Reference 02 — what to carry forward

- Warm soft-white background instead of clinical pure white everywhere.
- Desaturated coral/orange accent used sparingly for selection, price pins, and primary contextual actions.
- Map can become a first-class primary canvas.
- Floating search and filter controls sit above map/content.
- Large, edge-to-edge property images on result/detail screens.
- Thin iconography and low visual noise.
- Bottom navigation is visually light and does not look like a heavy toolbar.
- Price and action remain close to the thumb zone on detail.

### Patterns we intentionally do not copy

- Hotel booking-specific semantics such as guests/night/reserve.
- iOS-specific status/navigation chrome.
- Exact card dimensions/spacing.
- Exact icon set.
- Reference branding or typography.

---

## 3. Core Experience Statement

> “Show me a small set of places that fit my life, make the trade-offs obvious, and let me decide confidently.”

Every major state should answer one dominant question:

1. **What am I looking for?**
2. **Where should I explore?**
3. **Does this place fit me?**
4. **How does it compare?**
5. **What is my next action?**

---

## 4. Design Principles

### 4.1 Quiet luxury, not decoration
Premium comes from proportion, material, photography, and restraint — not gradients everywhere, oversized shadows, or excessive blur.

### 4.2 Property media is the hero
Large photography occupies more visual weight than metadata. Text should explain the image, not compete with it.

### 4.3 One dominant action per state
Many actions may exist, but only one should visually dominate.

### 4.4 Progressive density
Home and result cards stay light. Details become richer as the user drills down.

### 4.5 Glass is a control material
Glass/translucency is reserved for floating navigation, map controls, overlay buttons, sticky contact bars, and contextual sheets. Core property content remains mostly opaque for readability.

### 4.6 Intent-first, not form-first
The user can type “rumah 3 kamar dekat ITB cicilan 8 juta” and see the system translate it into editable chips.

### 4.7 Explain, never mystify
Recommendation and affordability logic expose a short rationale. No secret “match score” masquerades as objective truth.

### 4.8 Native behavior wins over visual imitation
Native Android/iOS navigation, keyboard, permission, safe-area, accessibility, and performance behavior takes priority over visually copying iOS/macOS. The goal is Apple-level restraint and material quality, not an iOS skin on Android.

---

## 5. Visual Identity

Final brand is not yet supplied, so tokens are replaceable. The default direction is warm-neutral + ink + restrained coral.

### 5.1 Light palette

```text
canvas                  #F5F3F0   warm app background
surface                 #FFFFFF
surface-raised          #FCFBF9
surface-soft            #F0EEEA
surface-glass            rgba(255,255,255,0.72)
ink-primary             #151515
ink-secondary           #6D6A66
ink-tertiary            #98938D
border                  #E7E3DE
border-strong           #D7D1CA
brand                   #FF7C63   coral ember
brand-hover             #F06F57
brand-soft              #FFF0EB
brand-ink               #A74431
success                 #2E7D5A
warning                 #B8751A
danger                  #C94E48
scrim                   rgba(0,0,0,0.30)
```

### 5.2 Dark palette

```text
canvas                  #0E0E0F
surface                 #171718
surface-raised          #1D1D1F
surface-soft            #232326
surface-glass            rgba(28,28,30,0.70)
ink-primary             #F6F4F1
ink-secondary           #B5B0AA
ink-tertiary            #837E78
border                  #303033
brand                   #FF8B73
brand-soft              #3A211C
success                 #69B58B
warning                 #D39B4A
danger                  #E17870
```

### 5.3 Brand accent rule

Coral is not a fill color for entire screens. Use it for:

- selected mode/filter;
- map price pin/highlight;
- small progress/notification accents;
- contextual CTA where black is not dominant;
- important but non-destructive selected state.

Primary universal action defaults to **ink/black** for a premium editorial feel.

---

## 6. Material and Depth System

### Layer 0 — Canvas
Warm neutral background. No shadow.

### Layer 1 — Content surface
Opaque white/near-white. Most property information lives here.

### Layer 2 — Raised card/sheet
Soft shadow or 1px border, not both aggressively.

### Layer 3 — Floating glass
Used for:

- bottom navigation;
- map search/filter controls;
- media overlay buttons;
- sticky contact bar;
- transient selection controls.

Recommended CSS characteristics where supported:

```css
background: rgba(255,255,255,.72);
backdrop-filter: blur(22px) saturate(140%);
-webkit-backdrop-filter: blur(22px) saturate(140%);
border: 1px solid rgba(255,255,255,.55);
box-shadow: 0 10px 32px rgba(20,18,16,.08);
```

Provide opaque fallback when blur support/performance is insufficient.

### Material rule
Never stack glass-on-glass repeatedly. At any viewport position, one dominant translucent control layer is usually enough.

---

## 7. Typography

Do not package Apple proprietary fonts.

Recommended:

- **Primary:** Inter Variable, Geist, or another properly licensed neutral grotesk.
- **Display option:** a slightly softer premium sans variable family if brand identity later requires it.
- **Fallback:** system sans-serif.

### Type scale

```text
Display XL       40 / 44  600   onboarding / campaign only
Display          34 / 39  600
Hero             30 / 36  600
Title 1          24 / 30  600
Title 2          20 / 26  600
Headline         17 / 23  600
Body             16 / 23  400
Body Small       14 / 20  400
Label            13 / 17  500
Caption          12 / 16  400
Micro            11 / 14  500
Price Hero       28 / 32  600
```

Rules:

- Use no more than 2–3 weights per screen.
- Prefer sentence case.
- Prices use tabular numerals if available.
- Secondary copy should be genuinely secondary; avoid medium-gray text at tiny sizes.
- Long Indonesian text must be tested, not designed only in English.

---

## 8. Geometry

### Radius scale

```text
8px     small indicators / thumbnails
12px    compact controls
16px    fields / chips / buttons
20px    standard cards
24px    media cards / sheets
28px    large sheets / floating bars
32px    hero cards
999px   pills
```

### Spacing scale

`4, 8, 12, 16, 20, 24, 32, 40, 48, 64`

### Screen padding

- phone: 16px baseline;
- premium/editorial sections: 20–24px where space permits;
- edge-to-edge media may ignore content padding but text aligns back to the main grid;
- tablet/desktop uses adaptive columns and max widths.

### Border strategy

Use subtle borders for structure before adding shadows. Borders should often be `rgba()` against the local surface rather than hard gray lines.

---

## 9. Iconography

- Thin, rounded line icons.
- Consistent optical weight.
- Filled icon only for strong selected state where necessary.
- Avoid mixing unrelated icon libraries in the same surface.
- Build a small internal icon set/wrapper so future replacement is easy.

Core icons:

`search, sliders, map, list, home, bookmark/heart, compare, profile, share, call, whatsapp/message, back, close, chevron, location, bed, bath, area, carport, building, alert, notification`

---

## 10. Motion Language

Motion should feel soft, deliberate, and physically plausible.

### Timing

```text
micro feedback          100–150ms
chip/filter state       160–220ms
card/preview             180–260ms
bottom sheet             260–360ms
map preview transition   220–320ms
hero media/detail        300–450ms
```

### Easing

Use spring-like or smooth deceleration for sheets and floating controls. Avoid bouncy novelty motion.

### Signature transitions

- Result card image → detail hero continuity where feasible.
- Map pin selection → preview card slides/fades from bottom.
- Filter chip selection → size/color morph rather than hard replacement.
- Favorite → subtle scale/haptic.
- Bottom navigation selection → lightweight icon/label transition.

Reduced motion removes shared/scale effects and uses short fades.

---

## 11. Navigation Model

Four primary destinations:

1. **Beranda**
2. **Cari**
3. **Tersimpan**
4. **Profil**

### Floating bottom navigation

Visual treatment:

- compact horizontal floating island above safe area;
- `surface-glass` material;
- selected state uses label + ink or restrained coral accent;
- inactive state remains icon-first and quiet;
- no huge colored navigation background.

On scroll-heavy detail screens, persistent contact action and bottom navigation MUST not compete. Detail may temporarily replace bottom nav with the context action bar.

---

## 12. Onboarding

### Screen 1 — emotional promise

Composition inspired by reference 01:

```text
            [small floating property photos]
        [photo]    [photo]    [photo]

               [hero property/life image]

            Rumah yang terasa tepat.
    Temukan tempat untuk hidup, bukan sekadar listing.

                [ Mulai mencari ]
```

Use a restrained radial/orbit composition of **original property/lifestyle media**. Motion can very slowly drift/parallax, disabled with reduced motion.

### Rules

- 1–3 screens maximum.
- No feature checklist wall.
- Skip available.
- Do not force login.
- Preference onboarding occurs later, after value is demonstrated.

---

## 13. Home Screen

### Visual intent

The home should feel more like a curated living magazine plus a powerful search instrument than a dashboard.

```text
[Good evening, Axel]                         [bell]
Temukan tempat untuk hidup lebih baik.

[ 🔍  Kota, area, proyek, atau ceritakan kebutuhanmu ]

[ Beli ]  [ Sewa ]  [ Proyek Baru ]

Recently explored
[large image card] [large image card] →

For you
[editorial property card]
[editorial property card]

Near the places that matter
[map/lifestyle teaser]

KPR planner
[quiet finance card]
```

### Search field

- white/glass raised surface;
- one search icon;
- optional sliders icon;
- placeholder can rotate only if it does not become distracting;
- on focus, expands into Search Composer.

### Rails

Use horizontal rails sparingly. Do not turn every section into a carousel. Mix:

- 2-up editorial cards;
- full-width hero property;
- compact text + thumbnail list;
- map teaser.

---

## 14. Search Composer — Muse Influence

Initial prompt:

> “Cari rumah, area, proyek, atau ceritakan kebutuhanmu…”

Example:

> “Rumah 3 kamar dekat ITB, cicilan maksimal 8 juta.”

Parsed result:

```text
[ Rumah × ] [ 3 kamar × ] [ dekat ITB × ] [ ≤ Rp8 jt/bln × ]
```

The chips are editable. User can remove any interpretation before searching.

### Composer sheet

- large rounded top field;
- recent searches;
- recent/favorite places;
- suggested property intents;
- voice input MAY be added later but is not launch-critical.

---

## 15. Search Results — List View

### Top region

```text
Bandung Utara                               1.284 properti
[Lokasi] [Harga] [Tipe] [Lainnya 3]      [Map]
```

Chips use white or glass surfaces with selected ink/coral state.

### Property card

Card should resemble the reference media-first rhythm:

```text
┌─────────────────────────────────────────┐
│                                         │
│         large 4:3 property photo        │
│ [Verified]                        [♡]    │
│                                  1/12   │
├─────────────────────────────────────────┤
│ Rp1,85 M                                │
│ Rumah tenang dekat Dago                 │
│ Coblong, Bandung                        │
│ ★ optional trust/context                │
│ 3 KT · 2 KM · LT 120 · LB 96           │
│ Cicilan ± Rp9,1 jt/bln                  │
└─────────────────────────────────────────┘
```

Rules:

- image is dominant;
- title max 2 lines;
- location is secondary;
- specs 1 line where possible;
- no big WhatsApp button per card;
- sponsored label must be explicit;
- action area remains uncluttered.

### Dense list option

A compact row can exist for “See more” or desktop but should not be default on phone.

---

## 16. Search Results — Map View

This is a signature surface inspired by reference 02.

### Composition

```text
[ Search location, area, project...        ]
[filters] [House] [Apartment] [Project] ...

             MAP
        Rp1,2M      Rp950jt
                    ● selected
     Rp2,1M

┌─────────────────────────────────────────┐
│ Location context        Rp1,2M          │
│ [thumbnail] Property preview        →   │
└─────────────────────────────────────────┘

      [home] [map:selected] [saved] [profile]
```

### Pins

- default: compact warm-white pill with ink text;
- selected: coral fill + white text or deep ink fill depending brand contrast;
- cluster: circular count;
- do not show too many overlapping prices; cluster/declutter aggressively.

### Preview card

- one highlighted card only;
- thumbnail + price + 1-line title + key spec/rating/trust signal;
- swipe horizontally MAY move between visible selected results;
- tapping opens detail.

### Map controls

- floating glass circles/pills;
- filter, locate me, list switch;
- exact user location only after contextual permission.

---

## 17. Filters

Use a bottom sheet or full-screen sheet on phone.

### Visual model

Inspired by reference 01:

```text
Filter                                         [×]

Transaksi
[Beli] [Sewa] [Proyek Baru]

Harga
       ▂▃▅▇█▇▅▃▂    ← optional histogram
────────●──────●────────
[Min Rp___]   [Max Rp___]

Kamar tidur
[-]        3        [+]

Tipe
[Semua] [Rumah] [Apartemen] [Tanah] ...

[Reset]                         [Tampilkan 128]
```

### Rules

- group filters by decision sequence;
- show current value inline;
- reset is visible but secondary;
- primary button includes result count when available;
- sticky footer;
- disabled options are visibly disabled, not hidden without reason;
- range controls also have numeric inputs for accessibility/precision.

---

## 18. Property Detail

### Hero media

- edge-to-edge or near-edge image at top;
- 4:3-ish or cinematic aspect depending screen;
- floating back/share/save controls using glass material;
- media count in small ink/glass pill;
- swipe gallery.

### First content block

```text
Rp1,85 M
Cicilan ± Rp9,1 jt/bulan

Rumah modern tenang dekat Dago
Coblong, Bandung

[3 KT] [2 KM] [LT 120] [LB 96] [2 mobil]

[Official/Verified]  [Bebas banjir]  [Siap huni]
```

### Content order

1. Hero media.
2. Price + affordability.
3. Title/location.
4. Core specs rail.
5. Trust/status chips.
6. “Why it may fit you”.
7. Overview/description.
8. Property/facility details.
9. Map/location privacy.
10. Nearby/commute context.
11. KPR module.
12. Advertiser.
13. Similar properties.
14. Report link.

### “Why it may fit you”

A quiet white/soft card, not an AI neon panel.

Example:

```text
Cocok dengan kebutuhanmu
• 11 menit dari kantor yang kamu simpan
• berada dalam rentang cicilanmu
• 3 kamar seperti preferensimu
```

Always allow preference editing.

### Sticky contact bar

```text
Rp1,85 M                          [ Hubungi ]
Cicilan ± Rp9,1 jt
```

or

```text
[Call]                   [WhatsApp / Hubungi]
```

Use a raised/glass surface that clears gesture navigation and does not cover critical content.

---

## 19. Project Detail

Visual structure similar to property detail but with hierarchy:

```text
Project hero
Developer + official badge
Price range
Project value proposition
Cluster/Tower selector
Unit cards
Compare units
Promotion
Facilities
Progress timeline
Map + POI
Developer profile
Inquiry CTA
```

Progress uses a clean chronological visual rather than a dense construction dashboard.

---

## 20. Tersimpan — Decision Workspace

Top-level segmented control:

```text
Properti | Pencarian | Koleksi | Kalkulasi
```

### Saved property card

Use slightly denser cards than search results, because the user already knows the item.

### Collections

Cover tile can be generated from 2–4 property thumbnails.

```text
Rumah Bandung
8 properti · 2 anggota
[photo mosaic]
```

### Comparison

Phone behavior:

- sticky attribute labels;
- property columns horizontally scroll;
- keep 2 columns visible where practical;
- differences can be subtly emphasized, never “winner” scored.

---

## 21. Collaborative Shortlist

Collection detail:

```text
Rumah Masa Depan                          [Invite]
Axel · Rina

8 properti
[card]
[card]

Activity
Rina menyimpan Properti A
Axel menghapus Properti C
```

Optional comments can be introduced later. Collaboration UI must feel private and purposeful, not social-feed-like.

---

## 22. KPR Planner

KPR should look calm and financial, not like a bank dashboard.

```text
Rencanakan cicilanmu

Harga properti
Rp 1.200.000.000

Uang muka
[20%]    Rp240.000.000

Tenor
[10] [15] [20] tahun

Perkiraan cicilan
Rp 8,7 jt / bulan

[ Gunakan untuk mencari properti ]
```

Use clear assumptions/disclaimer below the primary outcome.

---

## 23. Profile

Sections:

```text
Profile
Search preferences
Saved places
Notifications
Privacy & security
Language
Help & support
About
Delete account
```

Delete account should be discoverable, not buried behind multiple unrelated menus.

---

## 24. Permission UX

### Location

Before native permission, explain value:

```text
Lihat properti di sekitarmu
Lokasi hanya digunakan saat kamu meminta pencarian terdekat.

[Gunakan lokasi saya]
[Ketik lokasi secara manual]
```

Only then call the runtime permission.

### Notifications

Ask after a meaningful trigger such as saving a search/property:

> “Mau dikabari saat ada properti baru yang cocok atau harganya berubah?”

Do not ask immediately on first launch.

---

## 25. Offline and Failure Design

### Search failure
Keep query/filter state. Show retry and recent cached results if safe.

### Favorite sync failure
Keep optimistic state with subtle sync warning and retry; never silently lose user choice.

### Map failure
Switch to list with “Peta sedang tidak tersedia” and preserve filters.

### WhatsApp unavailable
Offer copy number / call / inquiry fallback.

### Removed property
Show a clear unavailable state plus similar alternatives; do not return generic 404 inside the app.

---

## 26. Empty States

Empty states are editorial and useful, not cartoon-heavy.

### No search results

```text
Belum ada yang benar-benar cocok.
Coba longgarkan harga atau area pencarian.

[Ubah filter]
[Lihat area terdekat]
```

### No saved properties

Use 1–3 original property images with subtle floating composition rather than a generic illustration.

---

## 27. Component System

Core components:

```text
AppShell
GlassBar
FloatingBottomNav
TopContextBar
SearchComposer
SearchField
SegmentedMode
FilterChip
FilterSheet
RangeHistogram
NumberStepper
PropertyCardHero
PropertyCardCompact
PropertyMedia
PricePin
MapPreviewCard
SpecChip
TrustBadge
SectionHeader
HorizontalRail
SavedCollectionCard
CompareTable
MortgageCard
ProjectCard
ProgressTimeline
AdvertiserCard
StickyContactBar
Toast
InlineError
Skeleton
EmptyState
PermissionPrimer
```

Every component has documented states:

- default;
- pressed;
- hover where web applies;
- focus-visible;
- disabled;
- loading;
- error where applicable;
- dark theme where supported.

---

## 28. Expo / React Native Implementation Notes

### Native rendering principle

The mobile UI MUST be implemented as React Native views. Do not reproduce the reference design by placing an HTML/CSS site inside a WebView. Expo is the native application framework, not a wrapper.

### Core implementation stack

```text
Expo SDK 57
React Native 0.86
Expo Router
React Native Reanimated
React Native Gesture Handler
FlashList
expo-image
expo-blur
expo-linear-gradient (sparingly)
expo-haptics
react-native-safe-area-context
react-native-maps
```

### macOS 27-inspired material treatment

Translate the reference direction into mobile-native primitives:

- opaque content surfaces for reading;
- translucent floating controls for navigation/search/context only;
- `expo-blur` for small glass surfaces, with an opaque/frosted fallback when Android device capability or scrolling performance is insufficient;
- hairline borders and soft ambient shadows rather than large elevation stacks;
- subtle highlight/specular edges may be simulated with low-opacity gradients, never glossy skeuomorphism;
- content behind glass must remain visually calm enough to preserve legibility.

### Motion

Use Reanimated for:

- shared-feeling media/detail transitions where technically stable;
- filter-sheet and card springs;
- map/list mode transitions;
- save/favorite feedback;
- floating navigation compression/expansion;
- gesture-driven gallery and sheets.

Rules:

- prefer transform and opacity;
- animations MUST be interruptible;
- avoid continuous blur/scale work while large lists scroll;
- honor reduced-motion preferences;
- motion never blocks contact/search actions.

### Lists and media

- Use `FlashList` for large result feeds.
- Use `expo-image` with explicit aspect ratios, cache policy, placeholders, and thumbnail/full-image separation.
- Do not mount multiple full-resolution galleries inside result cards.
- Video previews are opt-in and paused by default.

### Safe areas

Use `react-native-safe-area-context`. Floating bottom bars, sticky CTAs, full-bleed media, and sheets must account for Android navigation modes, cutouts, and iOS home indicator.

### Keyboard

Search, authentication, filters, and forms MUST be tested with real Android/iOS keyboards. Sticky actions must remain reachable. Prefer native keyboard avoidance/scroll behavior instead of hard-coded screen offsets.

### Back/navigation

Expo Router route state must behave as a real app:

- dismiss active sheet/modal first;
- exit gallery before detail;
- restore prior list/map query position;
- honor Android system back;
- avoid accidental duplicate routes from deep links.

### Haptics

Use `expo-haptics` sparingly for:

- save confirmation;
- successful filter apply;
- compare/collection add;
- meaningful mode selection.

Do not add haptic feedback to every tap or scroll.

### Maps

Use `react-native-maps` for the production baseline. Price pins, selected pins, clustering, and floating preview cards must remain readable and performant. Map motion should not trigger unbounded network queries.

### Platform adaptation

The app shares one design language, but does not force pixel identity:

- iOS may use slightly stronger blur and spring response;
- Android may use more opaque glass fallback and platform-appropriate system transitions;
- typography metrics and safe areas adapt per platform;
- system dialogs/permissions remain native.

The premium character comes from composition, photography, spacing, hierarchy, and motion quality—not from imitating Apple system chrome exactly.

## 29. Responsive Behavior

### Phone
Single-column media-first default.

### Foldable / tablet
- search results can use 2-column cards;
- map/list split view where width allows;
- detail content max-width with side rail for contact/KPR;
- filter may become side sheet.

### Desktop/public web
The public web is a separate SEO-oriented surface that reuses the same design language and semantic tokens, not the exact React Native component tree.

- map + results split layout;
- persistent filters/side rail where useful;
- detail page uses editorial max-width and sticky contact sidebar.

Do not simply stretch phone cards to desktop width.

---

## 30. Play Store Visual Readiness

Required assets:

- adaptive launcher icon;
- monochrome icon where supported;
- branded Android splash;
- feature graphic;
- real implemented phone screenshots;
- optional tablet screenshots if tablet support is marketed;
- coherent light theme screenshots;
- no device frame required unless store creative strategy uses one consistently.

Store screenshots should demonstrate:

1. premium home/search;
2. list + filters;
3. map discovery;
4. property detail;
5. decision workspace/comparison;
6. KPR planning or developer project.

Do not submit concept mockups that contain features absent from the release build.

---

## 31. Screen Inventory

```text
S01 Splash / restore session
S02 Onboarding
S03 Home
S04 Search composer
S05 Search results — list
S06 Search results — map
S07 Filter sheet
S08 Sort sheet
S09 Property detail
S10 Gallery fullscreen
S11 Location/nearby
S12 Advertiser contact/inquiry
S13 Saved workspace
S14 Saved searches
S15 Collections
S16 Collaborative collection
S17 Compare properties
S18 KPR planner
S19 Project discovery
S20 Project detail
S21 Unit detail
S22 Compare units
S23 Developer profile
S24 Notifications
S25 Profile
S26 Preferences
S27 Saved places
S28 Privacy/security
S29 Account deletion
S30 Login / OTP / Google
S31 Error / offline recovery states
```

---

## 32. Design QA Checklist

Before Play release, verify:

- property images dominate results/detail appropriately;
- no consumer screen resembles a generic admin dashboard;
- one clear dominant CTA per state;
- black/ink + warm neutral + restrained coral ratio is consistent;
- glass is limited to control layers;
- blur does not reduce readability/performance;
- all tappable targets meet size requirements;
- focus-visible works on web/keyboard environments;
- screen reader names are meaningful;
- text zoom does not clip prices/actions;
- bottom bars respect safe area;
- IME does not cover search/apply buttons;
- map has list/text alternative;
- location denial works gracefully;
- dark mode, if shipped, is truly designed rather than auto-inverted;
- loading skeletons match final geometry;
- empty/error states maintain premium tone;
- screenshot assets are taken from the real release build.

---

## 33. Design References

The supplied reference images are included in the package only as internal visual direction references:

- `references/ui-reference-01.png`
- `references/ui-reference-02.png`

External principles to re-check during implementation:

- Apple Human Interface Guidelines: https://developer.apple.com/design/human-interface-guidelines/
- Android accessibility and adaptive layout guidance: https://developer.android.com/design
- Expo SDK reference: https://docs.expo.dev/versions/latest/
- Expo Router: https://docs.expo.dev/router/introduction/
- Expo SDK 57 release notes: https://expo.dev/changelog/sdk-57

The goal is not to reproduce any referenced product. The implementation should express the same qualities — calm hierarchy, refined material depth, image-first browsing, and intent-led interaction — through Huni’s own brand system.
