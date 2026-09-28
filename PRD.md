# PRD — [APP_NAME] Property Marketplace

**Document status:** Production baseline / Play Store-ready specification  
**Version:** 3.0  
**Date:** 28 September 2026  
**Primary market:** Indonesia  
**Primary launch surface:** Android app distributed through Google Play  
**Client strategy:** Expo SDK 57 + React Native 0.86 + React 19.2 + TypeScript + Expo Router, with Expo Modules/native escape hatches  
**Supporting surfaces:** SEO/public web, Agent/Seller Portal, Admin Console  
**Product reference class:** Rumah123-class property discovery and decision platform, rebuilt with original brand, UX, code, assets, data model, and visual language.

---

## 1. Product Summary

[APP_NAME] is a mobile-first property marketplace for finding, evaluating, comparing, financing, and contacting sellers, agents, and developers for residential and commercial property in Indonesia.

The product is intentionally broader than a listing catalogue. It combines five layers:

1. **Discovery** — intent search, autocomplete, recommendations, POI, filters, map/list browsing.
2. **Evaluation** — property media, structured specs, facilities, price context, location confidence, nearby places, commute context.
3. **Decision support** — favorites, saved searches, comparison, collaborative shortlists, affordability, KPR simulation.
4. **Lead conversion** — WhatsApp, phone, inquiry, brochure, project/unit interest.
5. **Supply operations** — agent/developer listing management through a separate portal, backed by moderation and admin controls.

The Android app MUST be a real installable product with bundled application assets, native device integrations, production telemetry, privacy controls, and Google Play release readiness. It MUST NOT behave as a thin remote-website wrapper.

---

## 2. Product Positioning

### 2.1 Product promise

> Find a place that fits your life — not just your filters.

The experience should help the user answer three questions quickly:

- **Can I afford it?**
- **Does it fit the way I live?**
- **Is it worth contacting?**

### 2.2 Differentiation

The product should differentiate from conventional property portals through:

- intent-first search rather than filter-first forms;
- map and lifestyle context as first-class discovery surfaces;
- monthly affordability as a search primitive;
- collaborative household decision tools;
- explainable “why this may fit you” recommendations;
- premium, calm, editorial presentation rather than dense classifieds UI;
- seller/developer trust signals and location-privacy controls.

---

## 3. Product Principles

### 3.1 User-first, not listing-first
Home starts with the user’s intent: where they want to live, monthly affordability, commute needs, preferred property type, and life context.

### 3.2 Decision confidence over information density
The platform may contain large amounts of data, but the UI progressively reveals detail and surfaces only the most useful decision signals at each stage.

### 3.3 Content is the hero
Property photography, price, location, and key trade-offs dominate. Application chrome should feel light and recede when the user is browsing.

### 3.4 Fast path to human contact
Users can contact an advertiser from any meaningful conversion surface without losing search context.

### 3.5 Trust is visible
Verification, listing freshness, location precision, seller identity, reporting, moderation, duplicate detection, and sponsored placement are explicit.

### 3.6 Original implementation
No Rumah123, Apple, or Meta trademarks, proprietary artwork, private APIs, copied copywriting, or pixel-identical screens are reused. Functional patterns may be studied, but the product identity and implementation are independent.

### 3.7 Play-ready by design
Permissions, account deletion, Data Safety, SDK disclosure, target SDK, signing, test tracks, 16 KB page-size readiness, app links, and release assets are requirements from the start.

### 3.8 Native-first cross-platform, not a web wrapper
The consumer app uses Expo + React Native so Android and iOS share one native UI codebase while rendering real native views rather than a packaged website. Platform capability is reached through Expo modules, maintained React Native libraries, and narrowly scoped custom native modules only when needed.

---

## 4. Product Goals

### G1 — Reach relevant inventory quickly
A cold-start user should reach a useful property set in under 60 seconds without completing a long form.

### G2 — Reduce uncertainty before contact
Price, monthly affordability, core specs, location confidence, facilities, seller identity, and nearby context should be visible before contact.

### G3 — Support household decision-making
Users should be able to save, compare, and share shortlists with a partner/family without relying on screenshots and scattered chat messages.

### G4 — Connect price to affordability
Users can search by total price or comfortable monthly installment.

### G5 — Produce attributable qualified leads
Call, WhatsApp, inquiry, and brochure interactions are attributable to source listing/project and user journey while respecting consent and privacy.

### G6 — Ship through Google Play as a production app
The release candidate must meet current Play submission requirements and pass internal/closed testing, pre-launch reporting, policy checks, and signed AAB delivery.

### G7 — Keep one native product experience across Android and iOS
Android and iOS MUST share the Expo/React Native product codebase, design tokens, navigation model, API contracts, analytics contracts, and domain logic. Public web may use a dedicated SEO-oriented web client while sharing TypeScript domain packages and visual tokens.

---

## 5. Non-Goals for v1

- In-app property settlement or escrow.
- Wallet/stored value.
- Direct lending by [APP_NAME].
- Automated legal/notarial due diligence.
- Digital deed execution.
- Autonomous negotiation with sellers.
- Public social feed.
- Public comments/reviews on individual listings.
- Separate native seller app; launch uses responsive Agent/Seller Portal.
- AR room scanning or intensive 3D visualization.

---

## 6. Personas

### P1 — First-home buyer
Needs affordability, commute context, KPR simulation, comparisons, and family collaboration.

### P2 — Family upgrader
Needs larger inventory, facilities, school/health context, neighborhood quality, and shared shortlists.

### P3 — Renter
Needs monthly/yearly rental price, furnishing, transit proximity, move-in readiness, and fast WhatsApp contact.

### P4 — Investor
Needs unit price, project/developer signals, project progress, availability, promotions, and price context.

### P5 — Agent / independent owner
Needs controlled listing submission, media/location management, freshness maintenance, and lead visibility.

### P6 — Developer marketing team
Needs developer → project → cluster/tower → unit structure, unit-level promotions, progress updates, media, and lead attribution.

### P7 — Marketplace operations
Needs moderation, verification, taxonomy control, duplicate/fraud signals, analytics, audit trails, and policy administration.

---

## 7. Core User Journeys

### 7.1 Search-to-contact
`Home → intent/search → suggestions → results → filter/map → property detail → WhatsApp/call → lead recorded`

### 7.2 Affordability-first discovery
`Home → comfortable monthly installment → estimate affordable price envelope → results → KPR simulation → save/contact`

### 7.3 Map-first exploration
`Search → Map → pan/zoom → price pins → preview card → detail → save/contact`

### 7.4 Collaborative home search
`Save → create shortlist → invite partner/family → members save/remove → compare → decide → contact`

### 7.5 Developer project discovery
`New Projects → project → cluster/tower → unit → compare units → promo/progress → POI → inquiry`

### 7.6 Saved-search alert
`Search → save query → notification preferences → matching listing appears/updates → push → result/detail`

### 7.7 Seller supply flow
`Seller Portal → verify → create listing → upload media → location/privacy → moderation → publish → leads → sold/rented`

---

## 8. Launch Product Scope

### 8.1 Consumer Android App

#### Authentication and account
- Guest browsing.
- Google sign-in.
- Phone OTP.
- Optional WhatsApp-based verification if approved technically and legally.
- Profile and property preferences.
- Bahasa Indonesia first; English-ready localization.
- Secure session lifecycle.
- Logout.
- In-app account deletion path.
- External web account-deletion resource.

#### Onboarding
- Minimal 1–3 screen onboarding; skippable after first launch.
- Strong visual/property storytelling rather than feature explanation walls.
- Optional preference capture after value has been shown.
- No mandatory account creation before browsing.

#### Home
- Compact personalized greeting/context.
- Primary intent/search field.
- Buy / Rent / New Projects mode.
- Curated or personalized rails.
- Recently explored.
- Popular areas.
- New projects.
- Special offers.
- Affordability/KPR entry point.
- Saved workspace shortcut.

#### Search
- Full-text query.
- Location autocomplete.
- Entity suggestions: area, project, developer, POI.
- Search history and recent places.
- Natural-language intent composer.
- Editable extracted filter chips.
- List view.
- Map view with synchronized results.
- Cursor pagination / progressive loading.
- Pull-to-refresh where natural.
- Robust empty/error states.

#### Filters
- Buy / rent.
- Secondary / new project.
- Property type.
- Province/city/district/area.
- Price range.
- Monthly/yearly rental period.
- Monthly installment maximum.
- Bedrooms/bathrooms.
- Land/building area.
- Furnishing.
- Certificate/status attributes when appropriate.
- Video available.
- Verified/official developer.
- Special offer.
- Rent-to-own eligibility where supplied.
- Sort: recommendation, newest, price low/high, largest land/building area.
- Optional histogram/distribution visualization for price range when enough data exists.

#### Property results
- Media-led editorial cards.
- Price and optional monthly estimate.
- Location.
- Top 3–5 property specs.
- Verification/sponsor status.
- Save/hide.
- Quick transition to detail.
- Avoid dense card-level CTA overload.

#### Property detail
- Full-bleed gallery.
- Fullscreen image viewer + pinch zoom.
- Video.
- Share.
- Favorite.
- Price / previous price / unit price where relevant.
- Estimated installment.
- Core specification rail.
- Structured details.
- Facilities.
- Description.
- Location precision: exact / approximate / hidden.
- Map and nearby places.
- “Why it may fit you” explainable module.
- Advertiser identity and verification.
- Report listing.
- Similar properties.
- Persistent primary contact action.

#### Saved and decision workspace
- Saved properties.
- Saved searches.
- Recently viewed.
- Hidden properties.
- Saved mortgage simulations.
- Shortlists/collections.
- Shared shortlist invitation.
- Property comparison.

#### Financing
- KPR simulator.
- Down payment.
- Loan amount.
- Tenor.
- Rate assumption.
- Monthly estimate.
- Compare/save scenarios.
- Bank product directory only when source and disclosure are reliable.
- Take-over KPR estimator may follow after core simulator.

#### Project/developer
- Developer profile.
- Project detail.
- Cluster/tower.
- Unit type.
- Unit comparison.
- Promotions.
- Construction progress.
- Project facilities.
- Nearby POI.
- Travel distance/time to saved office/favorite places.
- Inquiry and brochure request.

#### Notifications
- Saved search match.
- Price decrease.
- Listing availability update.
- Project promotion.
- Shortlist invitation/activity.
- Lead follow-up only where consent exists.
- Per-category notification preferences.

### 8.2 Consumer Web

The public web surface is a supporting product, not the runtime of the mobile app. It SHOULD use an SEO-oriented React framework (recommended: Next.js) and share domain schemas, API clients, analytics contracts, and visual tokens with the Expo app where practical.

It MUST support:

- indexable public listing/project/developer pages;
- share/deep-link fallback for mobile routes;
- account-deletion resource;
- canonical URLs, metadata, sitemap, and structured data;
- responsive desktop/tablet/mobile layout;
- optional authenticated saved workspace where product scope justifies it.

### 8.3 Agent/Seller Portal

Launch portal includes:

- responsive web authentication;
- agent/agency/developer profiles;
- listing CRUD;
- project/cluster/unit management;
- media upload/order;
- location and privacy controls;
- draft/review/active/sold/rented/archived lifecycle;
- promotion/progress management;
- lead inbox/status;
- listing freshness reminders;
- basic analytics.

### 8.4 Admin Console

- account/role management;
- advertiser verification;
- listing moderation;
- report queue;
- duplicate/fraud signals;
- taxonomy control;
- developer/project verification;
- promotion review;
- content controls;
- audit log;
- operations metrics;
- feature flags.

---

## 9. Client Technology Product Constraints

The consumer mobile application MUST use **Expo SDK 57 + React Native 0.86 + React 19.2 + TypeScript + Expo Router** as the production baseline. Expo SDK 58 is beta as of this document date and MUST NOT be adopted for production until its stable release is validated through dependency, regression, and store-readiness testing.

### 9.1 Required approach

- Expo/React Native owns the mobile UI and renders native views; the release app MUST NOT be a remote website wrapper.
- Expo Router owns file-based navigation, deep links, modal routes, and platform route state.
- Use **development builds (`expo-dev-client`)**, not Expo Go, for production-feature development and QA whenever native modules, notifications, maps, credentials, or config plugins are involved.
- Use **Continuous Native Generation / `expo prebuild`** and config plugins to keep native projects reproducible. Native folders SHOULD remain generated unless a documented native customization requires committed native code.
- Use **EAS Build** for deterministic Android/iOS build profiles and **EAS Submit** or controlled Play Console upload for releases.
- Use **EAS Update** only for JS/assets changes permitted by store policy and release governance; never use OTA to introduce undeclared native capabilities or materially change the app in a way that bypasses store review.
- Android production output MUST be a signed **AAB** compatible with Google Play.
- iOS is supported from the same codebase, but Android/Google Play remains the launch gate.

### 9.2 Required mobile stack

Recommended production libraries/services:

- `expo-router` — navigation and deep linking;
- `@tanstack/react-query` — server-state/cache;
- `zustand` or equivalent lightweight store — ephemeral client state only;
- `zod` — runtime schema validation;
- `react-hook-form` — complex form state;
- `react-native-reanimated` + `react-native-gesture-handler` — motion/gestures;
- `@shopify/flash-list` — large property result lists;
- `expo-image` — image rendering and caching;
- `expo-blur` — constrained glass/material surfaces with performance fallback;
- `expo-haptics` — subtle interaction feedback;
- `expo-location` — foreground location;
- `expo-notifications` — push notification device integration;
- `expo-secure-store` — sensitive local secrets;
- `expo-linking` / Expo Router linking — app links and deep links;
- `expo-sharing` and native intents — system sharing;
- `react-native-maps` as the production map baseline until `expo-maps` exits alpha and passes project-specific evaluation.

### 9.3 Native integrations expected

- Google Maps on Android and an approved map provider on iOS;
- foreground geolocation only for launch scope;
- FCM/APNs-backed push notifications via `expo-notifications`;
- Android App Links / iOS Universal Links;
- native share sheet and explicit WhatsApp/phone handoff;
- Keystore/Keychain-backed secure storage;
- contextual haptics;
- camera/photo access only if an approved consumer feature needs it;
- Play Integrity or equivalent server-side device/app risk signals for selected abuse-sensitive flows;
- custom Expo Module in Kotlin/Swift only when a maintained Expo/RN solution cannot meet security, reliability, or performance requirements.

### 9.4 Expo production rules

The release product MUST NOT:

- depend on Expo Go for production behavior;
- ship a dev client or developer menu in production;
- rely on AsyncStorage for refresh tokens or equivalent sensitive credentials;
- request broad storage, contacts, SMS, call-log, or background-location permissions without a documented release-blocking use case;
- adopt beta/alpha native libraries for critical P0 flows without an explicit ADR, fallback, and regression plan;
- use EAS Update to bypass Google Play policy/review expectations;
- include secrets in `app.json`, client JavaScript bundles, source maps, or public environment variables.

### 9.5 Mobile performance expectations

- Result lists use virtualization and avoid mounting full galleries.
- Property imagery uses `expo-image` cache policy, thumbnails, and progressive loading.
- Expensive blur is limited to small navigation/control surfaces.
- Reanimated animations MUST prefer transform/opacity and remain interruptible.
- Map viewport requests are debounced and cancellable.
- App cold/warm start, JS thread stalls, memory pressure, and image cache behavior are profiled on representative mid-range Android devices.

## 10. Property Domain Requirements

### 10.1 Supported property classes

Residential:
- house;
- apartment;
- villa;
- kost/boarding;
- land.

Commercial:
- shop-house/ruko;
- office;
- warehouse;
- business space;
- factory where applicable.

Taxonomy must be configurable rather than hard-coded into one screen.

### 10.2 Listing lifecycle

`DRAFT → PENDING_REVIEW → ACTIVE → EXPIRED → SOLD/RENTED → ARCHIVED`

Verification is separate:

`UNVERIFIED / VERIFIED_OWNER / VERIFIED_AGENT / VERIFIED_AGENCY / OFFICIAL_DEVELOPER`

Promotion is separate:

`NORMAL / FEATURED / PREMIUM / SPONSORED`

Sponsored content MUST be visibly labeled.

### 10.3 Location privacy

- **EXACT** — precise map pin may be displayed.
- **APPROXIMATE** — safe radius/centroid only.
- **HIDDEN** — area is visible; user must contact advertiser for precise location.

### 10.4 Freshness

Listings have last-confirmed timestamps. Stale inventory is downgraded, re-confirmed, expired, or moderated according to marketplace rules.

---

## 11. Search and Ranking

Ranking can combine:

- query relevance;
- location fit;
- property intent fit;
- freshness;
- inventory completeness;
- availability confidence;
- user preferences;
- affordability fit;
- saved/view/contact history;
- quality/trust signals;
- explicit sponsored boost.

Organic relevance and paid promotion MUST be separated in the ranking model and analytics.

### Search states

- initial discovery;
- loading skeleton;
- results/list;
- map/list synchronized;
- zero results + relaxed suggestions;
- offline cached state;
- partial degradation when map/routing provider fails.

---

## 12. Recommendation System

Recommendations MAY use explicit preferences and behavioral signals, but the product must retain user agency.

Allowed signals include:

- preferred location/type/budget;
- saved/hidden listings;
- search history;
- viewed listings;
- contacted listings;
- project interest;
- office/favorite places if user explicitly saves them.

The UI should provide lightweight rationale such as:

- “within your monthly budget”;
- “12 min from your saved office”;
- “matches your 3-bedroom preference.”

Do not present a hidden composite score as an objective truth.

---

## 13. Lead and Contact Management

Lead-triggering events:

- WhatsApp handoff;
- call tap;
- inquiry submit;
- brochure request;
- project/unit interest.

Each lead stores only necessary attribution:

- listing/project/unit;
- advertiser;
- source surface;
- campaign/sponsored metadata if applicable;
- timestamp;
- authenticated user ID when available and lawful;
- guest anonymous journey/session ID when permitted.

If WhatsApp is unavailable, present copy-number or call fallback rather than dead-end failure.

---

## 14. KPR and Financial UX

### Inputs
- property price;
- down payment percentage/amount;
- tenor;
- interest/rate assumptions;
- optional bank product.

### Outputs
- estimated principal;
- estimated installment;
- total estimate where meaningful;
- assumptions and disclaimer.

The calculator MUST clearly state that outputs are estimates and not an approval, offer, or lending decision.

If the product later brokers loans, routes users to lenders, or performs regulated financial intermediation, legal/compliance review and Play financial-feature declarations must be updated before release.

---

## 15. Analytics and Product Metrics

### North-star
**Qualified property decisions per monthly active searcher** — a composite funnel measure based on meaningful save/compare/contact activity, not raw screen views.

### Discovery
- search completion rate;
- result click-through;
- map/list usage;
- zero-result rate;
- filter abandonment;
- search latency.

### Evaluation
- detail depth;
- gallery/video engagement;
- POI/map engagement;
- KPR simulation usage;
- advertiser trust interaction.

### Decision
- save rate;
- shortlist creation;
- collaboration invite acceptance;
- compare usage;
- return-to-saved rate.

### Conversion
- contact rate;
- qualified lead rate;
- contact success rate;
- advertiser response outcome when available.

### Marketplace quality
- stale listing rate;
- duplicate rate;
- report rate;
- moderation turnaround;
- location-confidence defects.

### Reliability
- crash-free sessions;
- ANR rate;
- native screen/navigation failure rate;
- fatal JavaScript/native exception rate;
- API p95;
- image load p95;
- map load success;
- push delivery/open rate.

---

## 16. Accessibility

- WCAG 2.2 AA-oriented contrast and semantics where applicable.
- Tap targets at least 44×44 CSS px / comparable native hit area.
- Screen reader names for interactive controls.
- Logical focus order.
- Respect reduced-motion preference.
- Never encode status by color alone.
- Dynamic text/zoom must not clip primary actions.
- Map-only information must have a list/text alternative.

---

## 17. Privacy and Data Minimization

- Request precise location only when needed; approximate/manual location must remain usable.
- Do not request background location for launch scope.
- Store user favorite/office locations only after explicit action.
- Separate service-critical notification from marketing consent.
- Maintain a data inventory for every SDK and backend destination.
- Provide privacy policy in-app and on web.
- If account creation exists, provide account-deletion request both in-app and externally via web.
- Delete associated account data except data retained for legitimate security, fraud-prevention, contractual, or legal obligations; retention must be disclosed.
- Analytics identifiers must not be used as hidden advertising IDs.

---

## 18. Google Play Production Readiness

Launch is blocked unless all applicable items are complete.

1. **Target Android 16 / API 36 or higher** for new apps and updates submitted under the post-31-August-2026 requirement.
2. Build and publish a signed **Android App Bundle (AAB)**.
3. Use **Play App Signing** and protect the separate upload key.
4. Audit all native libraries/plugins for **16 KB page-size compatibility**; treat this as mandatory readiness ahead of the 1-February-2027 update enforcement window.
5. Complete **Data Safety** accurately from actual app/SDK behavior.
6. Publish a public privacy policy.
7. If users can create accounts, expose account deletion in-app and through a web resource registered in Play Console.
8. Complete the Play **Financial Features declaration** accurately for KPR/financial functionality.
9. Complete content rating, ads declaration, target audience, app access, and any other Play Console declarations that apply at submission time.
10. Request runtime permissions only in context and only when necessary.
11. Ensure the production binary is standalone, contains no Expo Go/dev-client tooling, and uses only approved production API/update channels.
12. Configure Android App Links and verify domains.
13. Test FCM behavior, notification permission, and deep-link routes on supported Android versions.
14. Pass Play pre-launch report without release-blocking issue.
15. Complete required closed testing if the developer account is subject to the current personal-account testing rule.
16. Verify all third-party SDKs against Google Play SDK Index/policy guidance where applicable.

---

## 19. Store Listing Deliverables

Before production submission prepare:

- final app name and unique package/application ID;
- launcher icon;
- adaptive icon foreground/background;
- monochrome icon where supported;
- feature graphic;
- phone screenshots showing real implemented UI;
- short description;
- full description;
- privacy policy URL;
- account deletion URL;
- support website/email;
- category selection;
- Data Safety answers;
- Financial Features declaration;
- App Access instructions if any gated review flow exists.

Screenshots MUST represent actual product behavior and must not use misleading mock-only features.

---

## 20. Launch Acceptance Criteria

A production candidate is acceptable when:

- all P0 consumer journeys pass on physical Android devices;
- search → detail → save → contact works with graceful degraded states;
- map and geolocation flows work without forcing precise location;
- account deletion works from both required paths;
- privacy/permission prompts match actual behavior;
- release AAB installs from a Play test track;
- target/compile SDK are compliant;
- native libraries pass 16 KB compatibility audit;
- no release-blocking crash/ANR/accessibility issue remains;
- production build contains no Expo Go/dev-client tooling and passes release-channel configuration checks;
- store listing and Data Safety declarations match the exact release build;
- the design QA checklist in `DESIGN.md` passes on representative phones.

---

## 21. Suggested Release Phases

### Phase 0 — Foundation
Authentication, client shell, design system, property domain, listing ingestion, media, search baseline, analytics, CI/CD, Play internal track.

### Phase 1 — Play launch
Home, search/list/map, filters, property detail, favorites, contact, saved search, notifications, KPR simulator, project pages, privacy/account deletion, production hardening.

### Phase 2 — Decision workspace
Collaborative shortlist, advanced comparison, commute context, price-change notifications, richer saved workspace.

### Phase 3 — Marketplace intelligence
Explainable recommendations, advanced supply quality scoring, richer developer progress, optional AI-assisted intent search.

---

## 22. External Standards Snapshot

These documents should be re-checked immediately before release because platform requirements can change:

- Google Play target API requirements: https://support.google.com/googleplay/android-developer/answer/11926878
- Google Play user data/account deletion: https://support.google.com/googleplay/android-developer/answer/10144311
- Android 16 KB page-size guidance: https://developer.android.com/guide/practices/page-sizes
- Android App Bundle: https://developer.android.com/guide/app-bundle
- Play App Signing: https://support.google.com/googleplay/android-developer/answer/9842756
- Expo SDK reference: https://docs.expo.dev/versions/latest/
- Expo SDK 57 release notes: https://expo.dev/changelog/sdk-57
- EAS Build: https://docs.expo.dev/build/introduction/
- Expo Router: https://docs.expo.dev/router/introduction/

