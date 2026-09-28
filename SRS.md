# SRS — [APP_NAME] Property Marketplace

**Version:** 3.0  
**Date:** 28 September 2026  
**Status:** Production requirements baseline  
**Primary release:** Google Play Android application using Expo SDK 57 + React Native 0.86 + Expo Router

---

## 1. Purpose

This Software Requirements Specification defines functional, user-interface, data, security, privacy, reliability, and Google Play release requirements for [APP_NAME].

Requirements marked **MUST** are release-blocking unless explicitly deferred through an approved change record. **SHOULD** requirements may be deferred only with documented product/engineering rationale.

---

## 2. System Components

| ID | Component | Purpose |
|---|---|---|
| SYS-A | Consumer Android App | Search, evaluation, saved decision workspace, KPR, contact |
| SYS-B | Consumer Web | Public/SEO/share routes and authenticated consumer web |
| SYS-C | Marketplace API | Mobile/web BFF and domain logic |
| SYS-D | Seller Portal | Agent/owner/developer inventory and lead management |
| SYS-E | Admin Console | Moderation, verification, taxonomy, operations |
| SYS-F | Search Platform | Indexed text/geospatial search and ranking |
| SYS-G | Media Pipeline | Upload, processing, delivery |
| SYS-H | Notification Worker | Push/event delivery |

---

## 3. Client Platform Requirements

- **PLAT-001 MUST** implement the consumer mobile UI in Expo SDK 57 + React Native 0.86 + React 19.2 + TypeScript.
- **PLAT-002 MUST** use Expo Router for the primary navigation/deep-link model.
- **PLAT-003 MUST** render the product as native React Native views; it MUST NOT use a remote website as the primary application runtime.
- **PLAT-004 MUST** use development builds rather than Expo Go for native-feature QA and release validation.
- **PLAT-005 MUST** use EAS Build or an equivalently controlled native build pipeline capable of producing a signed Android App Bundle.
- **PLAT-006 MUST** pin an approved stable Expo SDK for release; Expo SDK 58 beta MUST NOT be a production dependency until promoted to stable and regression-qualified.
- **PLAT-007 MUST** use `expo-secure-store` or an approved Keystore/Keychain-backed equivalent for sensitive refresh/session secrets.
- **PLAT-008 MUST** use native integrations for maps, geolocation, notifications, app links, secure storage, share, and external contact intents.
- **PLAT-009 MUST** use `react-native-maps` or another production-approved native map implementation for P0 map discovery; alpha/beta map packages require an ADR and fallback.
- **PLAT-010 MUST** support narrowly scoped custom Expo Modules in Kotlin/Swift when no maintained module satisfies a critical platform requirement.
- **PLAT-011 MUST** use Continuous Native Generation/config plugins so Android/iOS native configuration can be recreated deterministically.
- **PLAT-012 MUST** remove dev-client/developer tooling, debug flags, and non-production endpoints from release builds.
- **PLAT-013 MUST** use EAS Update only within an approved OTA governance policy and MUST NOT use OTA updates to bypass app-store review or introduce undeclared native capabilities.
- **PLAT-014 SHOULD** keep the mobile app independent of the public web runtime; web may share TypeScript domain packages, API contracts, and design tokens.

## 4. Functional Requirements

### 4.1 Authentication

- **FR-AUTH-001 MUST** allow guest browsing of public inventory.
- **FR-AUTH-002 MUST** support Google sign-in.
- **FR-AUTH-003 MUST** support phone OTP or an approved equivalent first-party authentication flow.
- **FR-AUTH-004 SHOULD** support optional WhatsApp verification only after technical/legal validation.
- **FR-AUTH-005 MUST** persist authenticated sessions securely.
- **FR-AUTH-006 MUST** allow logout.
- **FR-AUTH-007 MUST** expose an in-app account-deletion initiation path.
- **FR-AUTH-008 MUST** expose an external web deletion resource registered for Google Play.
- **FR-AUTH-009 MUST** require appropriate re-authentication before destructive account actions.

### 4.2 Profile and preferences

- **FR-PRO-001 MUST** allow edit of display name and contact profile fields used by the product.
- **FR-PRO-002 MUST** allow preferred transaction mode, property type, location, budget, and key spec preferences.
- **FR-PRO-003 SHOULD** allow saved office/favorite places.
- **FR-PRO-004 MUST** allow notification preference management by category.
- **FR-PRO-005 MUST** provide privacy policy, terms, support, app version, and deletion entry points.

### 4.3 Home

- **FR-HOME-001 MUST** expose one visually dominant search/intent entry point.
- **FR-HOME-002 MUST** expose Buy, Rent, and New Project modes.
- **FR-HOME-003 SHOULD** show recently explored properties for returning users.
- **FR-HOME-004 SHOULD** show recommendation/popular/project content rails.
- **FR-HOME-005 MUST** expose KPR/affordability entry points without implying loan approval.
- **FR-HOME-006 MUST** remain useful for guest users.

### 4.4 Search

- **FR-SRC-001 MUST** search by free text.
- **FR-SRC-002 MUST** resolve location hierarchy suggestions.
- **FR-SRC-003 MUST** support project/developer/POI entity suggestions where indexed.
- **FR-SRC-004 MUST** preserve search context when opening and returning from detail.
- **FR-SRC-005 MUST** use progressive/cursor loading for large result sets.
- **FR-SRC-006 MUST** provide map view at launch unless explicitly deferred by approved scope change.
- **FR-SRC-007 MUST** synchronize result identity between list and map views.
- **FR-SRC-008 SHOULD** support natural-language search that converts detected intent into visible editable chips.
- **FR-SRC-009 MUST NOT** silently apply inferred constraints that the user cannot inspect/edit.
- **FR-SRC-010 MUST** provide no-result recovery suggestions.

### 4.5 Filters and sorting

- **FR-FLT-001 MUST** filter by transaction type.
- **FR-FLT-002 MUST** filter by property type.
- **FR-FLT-003 MUST** filter by price range.
- **FR-FLT-004 SHOULD** filter by estimated monthly installment.
- **FR-FLT-005 MUST** filter by bedroom/bathroom counts where applicable.
- **FR-FLT-006 MUST** filter by land/building area where applicable.
- **FR-FLT-007 SHOULD** filter by furnishing, video, verification, and special offers.
- **FR-FLT-008 MUST** support recommendation/newest/price low-high/high-low sorting.
- **FR-FLT-009 SHOULD** show price-distribution histogram when the search sample is statistically useful.
- **FR-FLT-010 MUST** support reset and apply without losing the base query.

### 4.6 Property results

- **FR-RES-001 MUST** show primary image, price, location, and key specs.
- **FR-RES-002 MUST** visibly distinguish sponsored/promoted content.
- **FR-RES-003 MUST** allow save/favorite from result cards.
- **FR-RES-004 SHOULD** show monthly affordability estimate when enabled.
- **FR-RES-005 MUST** avoid presenting unavailable inventory as available after backend state refresh.

### 4.7 Property detail

- **FR-DET-001 MUST** provide media gallery.
- **FR-DET-002 MUST** support fullscreen image viewing and pinch zoom.
- **FR-DET-003 SHOULD** support listing video.
- **FR-DET-004 MUST** display price and major specifications.
- **FR-DET-005 MUST** display structured facilities and description.
- **FR-DET-006 MUST** enforce location precision state: exact, approximate, or hidden.
- **FR-DET-007 SHOULD** provide nearby POIs.
- **FR-DET-008 MUST** display advertiser identity and verification state.
- **FR-DET-009 MUST** provide report-listing action.
- **FR-DET-010 MUST** provide share action through platform share behavior.
- **FR-DET-011 MUST** provide persistent primary contact CTA without obscuring content.
- **FR-DET-012 SHOULD** show explainable match reasons based only on user-visible preferences/signals.

### 4.8 Favorites and saved workspace

- **FR-SAV-001 MUST** save/unsave properties.
- **FR-SAV-002 MUST** sync saves across authenticated devices.
- **FR-SAV-003 MUST** support saved searches.
- **FR-SAV-004 SHOULD** support recently viewed.
- **FR-SAV-005 SHOULD** support hide/dismiss property.
- **FR-SAV-006 MUST** survive transient network failure using optimistic state + reconciliation or equivalent.

### 4.9 Comparison

- **FR-CMP-001 MUST** compare at least 2 saved properties.
- **FR-CMP-002 SHOULD** compare up to 4 properties on phone using horizontally scrollable or focused comparison UX.
- **FR-CMP-003 MUST** align comparable attributes consistently.
- **FR-CMP-004 MUST** mark unavailable/missing values rather than inventing equivalence.

### 4.10 Collaborative shortlist

- **FR-COL-001 SHOULD** allow a user to create named collections.
- **FR-COL-002 SHOULD** allow invitation of collaborators.
- **FR-COL-003 SHOULD** define owner/editor/viewer permissions.
- **FR-COL-004 MUST** authorize every collection mutation server-side.
- **FR-COL-005 SHOULD** notify members about meaningful shortlist changes, subject to preferences.

### 4.11 Mortgage / KPR

- **FR-KPR-001 MUST** accept property price.
- **FR-KPR-002 MUST** accept down payment.
- **FR-KPR-003 MUST** accept tenor.
- **FR-KPR-004 MUST** accept an interest-rate assumption or documented product rate.
- **FR-KPR-005 MUST** calculate estimated monthly installment.
- **FR-KPR-006 MUST** display assumptions and estimation disclaimer.
- **FR-KPR-007 SHOULD** allow saving scenarios.
- **FR-KPR-008 SHOULD** use saved simulation as a property search constraint.
- **FR-KPR-009 MUST NOT** imply credit approval or guaranteed lender pricing.

### 4.12 Projects and developers

- **FR-PRJ-001 MUST** support developer profiles.
- **FR-PRJ-002 MUST** support project detail.
- **FR-PRJ-003 SHOULD** support cluster/tower structures.
- **FR-PRJ-004 SHOULD** support unit types and unit comparison.
- **FR-PRJ-005 SHOULD** support project/unit promotion.
- **FR-PRJ-006 SHOULD** support construction progress updates.
- **FR-PRJ-007 SHOULD** support project POI and travel-time context.
- **FR-PRJ-008 MUST** provide inquiry/brochure lead action when enabled.

### 4.13 Leads

- **FR-LEAD-001 MUST** record source attribution before opening an external contact handoff where technically possible.
- **FR-LEAD-002 MUST** support WhatsApp handoff without Contacts/SMS permission.
- **FR-LEAD-003 MUST** support call handoff without Call Log permission.
- **FR-LEAD-004 SHOULD** support in-app inquiry.
- **FR-LEAD-005 MUST** make repeated taps idempotent enough to avoid duplicate lead inflation.

### 4.14 Notifications

- **FR-NOT-001 MUST** request runtime notification permission only in context where the Android version requires it.
- **FR-NOT-002 MUST** support deep-link destinations from notifications.
- **FR-NOT-003 MUST** honor category preferences.
- **FR-NOT-004 MUST** separate marketing preference from service-critical notifications.

### 4.15 Reporting and moderation

- **FR-MOD-001 MUST** allow listing report submission.
- **FR-MOD-002 MUST** record report reason and listing snapshot/reference.
- **FR-MOD-003 MUST** expose reports to authorized operations users.
- **FR-MOD-004 MUST** maintain audit records for moderation decisions.

### 4.16 Agent portal

- **FR-AGT-001 MUST** create/edit listing drafts.
- **FR-AGT-002 MUST** upload/reorder property media.
- **FR-AGT-003 MUST** configure location precision.
- **FR-AGT-004 MUST** submit inventory for moderation.
- **FR-AGT-005 MUST** transition listing state according to permissions/workflow.
- **FR-AGT-006 SHOULD** expose leads and simple analytics.

---

## 5. User Interface and Design Requirements

The visual system is defined in `DESIGN.md` and informed by the two supplied UI references.

### 5.1 Visual language

- **UI-001 MUST** use a premium, calm, editorial aesthetic inspired by contemporary Apple/macOS material hierarchy and Meta Muse-style intent interaction, without copying proprietary UI assets.
- **UI-002 MUST** prioritize warm white/soft neutral content surfaces with one restrained brand accent.
- **UI-003 MUST** use deep ink/near-black for primary CTA and typography rather than heavy colorful chrome.
- **UI-004 MUST** use glass/translucency primarily for floating navigation, overlays, map controls, and sticky action surfaces; content cards remain predominantly opaque.
- **UI-005 MUST** keep property photography large and visually dominant.
- **UI-006 MUST** use rounded geometry consistently; nested radii must feel proportional.
- **UI-007 MUST** avoid dense dashboard-style boxed layouts on consumer screens.
- **UI-008 MUST** use progressive disclosure for filters and dense metadata.

### 5.2 Reference-specific patterns

- **UI-010 SHOULD** use an onboarding composition with floating/radial property imagery rather than an illustration-heavy feature tutorial.
- **UI-011 SHOULD** use compact pill/chip filters similar in density to the supplied references.
- **UI-012 MUST** support a map-first view with clean price pins and a single highlighted property preview card.
- **UI-013 SHOULD** use full-width/full-bleed property media at the top of detail screens.
- **UI-014 SHOULD** use a filter bottom sheet with clear steppers, range controls, and optional distribution visualization.
- **UI-015 MUST** keep the bottom navigation visually lightweight and avoid a large opaque navigation block.
- **UI-016 MUST** preserve Android back, focus, accessibility, and safe-area behavior even when emulating premium floating-material patterns.

### 5.3 Motion

- **UI-MOT-001 MUST** use motion to preserve spatial causality between list/map/detail states.
- **UI-MOT-002 MUST** honor reduced-motion preferences.
- **UI-MOT-003 MUST NOT** use continuous decorative animation that competes with property content.
- **UI-MOT-004 SHOULD** use spring-like transitions for sheets/chips and restrained crossfade/scale for media transitions.

---

## 6. Data Requirements

- **DR-001 MUST** use stable globally unique public identifiers or safe opaque IDs.
- **DR-002 MUST** store money using integer minor units or approved exact decimal representation.
- **DR-003 MUST** store area values with explicit unit.
- **DR-004 MUST** store timestamps in UTC and render local time as needed.
- **DR-005 MUST** preserve audit-relevant soft-deletion/status history where policy requires it.
- **DR-006 MUST** treat PostgreSQL as canonical and search index as derived.
- **DR-007 MUST** record privileged state changes in immutable or tamper-evident audit storage/records.
- **DR-008 MUST** store location precision independently from canonical location data.

---

## 7. Non-Functional Requirements

### Performance

- **NFR-PERF-001 MUST** render initial local app shell without network dependency after native launch.
- **NFR-PERF-002 SHOULD** reach interactive home content quickly enough to feel immediate on representative mid-range devices; exact SLO set after prototype profiling.
- **NFR-PERF-003 SHOULD** keep common API p95 below 500 ms excluding third-party provider latency.
- **NFR-PERF-004 MUST** lazy-load media and avoid downloading full galleries at once.
- **NFR-PERF-005 MUST** debounce/cancel map viewport queries.
- **NFR-PERF-006 MUST** test long lists for smooth scrolling on target mid-range Android hardware.

### Reliability

- **NFR-REL-001 MUST** handle temporary network loss without corrupting save/contact state.
- **NFR-REL-002 MUST** make save/favorite operations idempotent or convergent.
- **NFR-REL-003 MUST** degrade map failures into usable list/location text.
- **NFR-REL-004 MUST** expose retry for failed user-initiated operations.

### Mobile quality

- **NFR-MOB-001 MUST** support edge-to-edge layouts and system insets.
- **NFR-MOB-002 MUST** handle keyboard/resizing correctly in search/forms.
- **NFR-MOB-003 MUST** preserve Android back semantics.
- **NFR-MOB-004 MUST** route external URLs through explicit allowlisted native linking/browser handoff rather than unintended in-app navigation.
- **NFR-MOB-005 MUST** pass representative device orientation/resume/background tests.

### Accessibility

- **NFR-A11Y-001 MUST** provide semantic labels for all interactive controls.
- **NFR-A11Y-002 MUST** meet AA-oriented color contrast for essential text/actions.
- **NFR-A11Y-003 MUST** keep primary actions operable at text zoom/font scaling.
- **NFR-A11Y-004 MUST** provide text/list alternatives for map-only information.
- **NFR-A11Y-005 MUST** honor reduced motion where detectable.

### Localization

- **NFR-I18N-001 MUST** ship Bahasa Indonesia.
- **NFR-I18N-002 MUST** avoid hard-coded UI strings in components.
- **NFR-I18N-003 SHOULD** support English without structural redesign.
- **NFR-I18N-004 MUST** format Indonesian currency/number units consistently.

---

## 8. Security Requirements

- **SEC-001 MUST** use TLS for all network traffic.
- **SEC-002 MUST** enforce authorization server-side for every protected resource.
- **SEC-003 MUST** validate request/response schema boundaries.
- **SEC-004 MUST** protect refresh credentials with Keystore-backed secure storage or an approved equivalent.
- **SEC-005 MUST** prevent token leakage into logs/analytics.
- **SEC-006 MUST** validate media type/content before publication.
- **SEC-007 MUST** use signed/limited media upload mechanisms.
- **SEC-008 MUST** rate-limit authentication, leads, invitations, reports, and other abuse-sensitive routes.
- **SEC-009 MUST** require MFA for privileged admin roles.
- **SEC-010 MUST** maintain security/audit records for privileged actions.
- **SEC-011 MUST** scan dependencies and secrets in CI.
- **SEC-012 SHOULD** use Play Integrity risk signals for selected abuse-sensitive operations.
- **SEC-013 MUST** remove Expo dev menu/dev-client/debug instrumentation from release builds.
- **SEC-014 MUST** disallow cleartext HTTP production traffic except approved local development cases.
- **SEC-015 MUST** review every Expo/RN native module and SDK for permissions, privacy behavior, maintenance status, New Architecture compatibility, and native binary impact.
- **SEC-016 MUST** prevent secrets from being embedded in public Expo config, JavaScript bundles, source maps, or client-visible environment variables.

---

## 9. Privacy Requirements

- **PRV-001 MUST** document every category of user data collected/shared.
- **PRV-002 MUST** collect only data necessary for stated features.
- **PRV-003 MUST** accurately declare collection/sharing in Play Data Safety.
- **PRV-004 MUST** request location in context.
- **PRV-005 MUST NOT** require background location for launch scope.
- **PRV-006 MUST** provide external account-deletion web resource.
- **PRV-007 MUST** provide in-app deletion initiation.
- **PRV-008 MUST** delete associated user data subject to disclosed legitimate retention exceptions.
- **PRV-009 MUST** separate marketing notification/communication consent.
- **PRV-010 MUST** maintain an SDK/privacy inventory for every release.

---

## 10. Google Play Requirements

### Build and platform

- **PLAY-001 MUST** target Android 16 / API 36 or higher under the current post-31-August-2026 submission requirement.
- **PLAY-002 MUST** compile with API 36 or higher.
- **PLAY-003 MUST** ship production as Android App Bundle.
- **PLAY-004 MUST** use Play App Signing.
- **PLAY-005 MUST** use monotonically increasing `versionCode`.
- **PLAY-006 MUST** verify 16 KB page-size support for any shipped native libraries/SDKs and be ready ahead of the current 1-February-2027 update enforcement milestone.

### Policy declarations

- **PLAY-010 MUST** provide a public privacy policy URL.
- **PLAY-011 MUST** complete Data Safety accurately for the release build.
- **PLAY-012 MUST** complete account-deletion declarations when account creation exists.
- **PLAY-013 MUST** complete Financial Features declaration accurately.
- **PLAY-014 MUST** complete ads, content rating, target audience, app access, and other applicable declarations.
- **PLAY-015 MUST** ensure store listing claims/screenshots represent implemented behavior.

### Account/testing eligibility

- **PLAY-020 MUST** complete any closed-testing duration/tester requirement applicable to the developer account before production access.

### Permissions

- **PLAY-030 MUST** request only permissions required by current advertised features.
- **PLAY-031 MUST** avoid restricted/high-risk permissions unless a compliant, documented use case exists.
- **PLAY-032 MUST NOT** request Contacts, SMS, Call Log, broad file storage, or background location for the defined launch scope.

### Expo / React Native release integrity

- **PLAY-040 MUST** ship a standalone React Native binary and MUST NOT depend on Expo Go.
- **PLAY-041 MUST** ensure release profiles exclude `expo-dev-client`, developer menus, debug endpoints, and development credentials.
- **PLAY-042 MUST** configure EAS Update channels/branches so production devices receive only approved production updates.
- **PLAY-043 MUST** ensure OTA updates comply with Google Play policy and do not bypass required store review.
- **PLAY-044 MUST** run `expo-doctor` and dependency compatibility checks as release gates.
- **PLAY-045 MUST** verify every native library used by the Expo build for 16 KB page-size compatibility when applicable.

---

## 11. Compatibility Matrix

Minimum acceptance matrix SHOULD include:

- Android 8/9 class device if `minSdk 26` retained;
- Android 12/13 mid-range physical device;
- Android 14 device;
- Android 15 device;
- Android 16 device;
- at least one low/mid-memory device;
- at least one high-density large-screen phone;
- emulator/device configured for 16 KB page-size validation where applicable;
- at least one OEM-skinned Android device (for example Samsung/Pixel class behavior) represented in QA where practical.

---

## 12. Test Requirements

### Unit

- calculations;
- state reducers/stores;
- schema validation;
- formatting;
- search/filter serialization;
- ranking support logic where local.

### Component

- React Native UI components;
- accessibility semantics;
- keyboard/focus states;
- visual state variants.

### Integration

- API contracts;
- auth refresh;
- save sync;
- search index ingestion;
- media upload;
- lead creation;
- account deletion;
- notification preference flow.

### Expo/native integration

- development build behavior separate from Expo Go;
- geolocation permission and denial;
- FCM token/notification/deep link via `expo-notifications`;
- share sheet and external browser/intents;
- app links/universal links;
- secure storage persistence and invalidation;
- external WhatsApp/call intents;
- Android back/predictive-back-compatible navigation behavior where supported;
- process kill/resume/background/foreground transitions;
- release profile without dev menu/dev client;
- EAS Update production channel and rollback path.

### End-to-end

At minimum:

1. guest search → detail;
2. sign-in → save → reopen on another session;
3. filter/list ↔ map synchronization;
4. property detail → contact handoff;
5. KPR simulation → save/use filter;
6. account deletion request;
7. seller listing → moderation → visible search result;
8. push notification → correct deep link.

### Release

- AAB install from Play internal/closed track;
- pre-launch report review;
- crash/ANR review;
- Data Safety/SDK inventory comparison;
- 16 KB dependency verification;
- accessibility smoke test;
- store screenshot/copy validation.

---

## 13. Acceptance Criteria for Production Candidate

Production release candidate MUST satisfy all of the following:

1. Search, map/list, detail, save, and contact P0 flows pass.
2. No blocker/severe crash or ANR remains.
3. Account deletion works in both in-app and web paths.
4. Location denial still permits manual search.
5. Notifications are opt-in/contextual and category controls function.
6. KPR results show assumptions/disclaimer.
7. Release AAB is signed and installable from a Play test track.
8. Production build is standalone React Native, contains no Expo Go/dev-client dependency, and uses only approved production update channels.
9. Target/compile SDK meet current Play requirement.
10. Native dependencies pass the required compatibility audit.
11. Data Safety and privacy policy match actual app/SDK behavior.
12. Design QA passes against `DESIGN.md` on representative phone sizes.

---

## 14. Traceability Summary

| Area | Requirement groups |
|---|---|
| Product scope | FR-* |
| Client runtime | PLAT-* |
| Premium UI | UI-* |
| Data | DR-* |
| Quality | NFR-* |
| Security | SEC-* |
| Privacy | PRV-* |
| Play readiness | PLAY-* |

---

## 15. Source Requirements Snapshot

Current references to re-check before submission:

- Play target API: https://support.google.com/googleplay/android-developer/answer/11926878
- Play user data/account deletion: https://support.google.com/googleplay/android-developer/answer/10144311
- Android 16 KB page size: https://developer.android.com/guide/practices/page-sizes
- Expo SDK reference: https://docs.expo.dev/versions/latest/
- Expo SDK 57 release notes: https://expo.dev/changelog/sdk-57
- Expo Router: https://docs.expo.dev/router/introduction/
- EAS Build: https://docs.expo.dev/build/introduction/

