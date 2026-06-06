# SAVY iOS Build Plan

## Product split

SAVY should become two complementary surfaces, not one product duplicated twice.

- **iPhone app:** constrained leverage reader. News Channel, Field Essays, Ontology, and Beliefs in a reliable native order.
- **Web app:** full studio and publishing surface. Theme editing, nutrition, mood check-ins, long-form editing, visual experiments, and admin/editor workflows.

The iOS app should reuse the existing Supabase project. Do not create a second database.

## Product Theme

SAVY is not a catalog of interests. It is a monument to leverage.

The central premise is that the 80/20 rule feels unusually aligned with reality: a few inputs shape most outcomes, a few ideas explain many situations, and the right frame can compound across work, health, learning, attention, and relationships.

The iOS app should make that theme more obvious, not broader. It should present the highest-leverage thought surfaces in a fixed order:

1. News Channel
2. Field Essays
3. Ontology
4. Beliefs

## Why Native

The native app is justified because the target workflows are limited by browser ergonomics:

- a formal, constrained interface that makes the site easier to revisit
- a stable reading/navigation structure instead of an endlessly flexible web canvas
- notifications or widgets later for new essays, briefs, or leverage prompts
- offline reading and saved items later
- a native hierarchy that forces editorial prioritization

The goal is not to make the whole website available in the App Store. The goal is to make the leverage spine of SAVY feel intentional on the phone.

## Current Web Surfaces

The existing `MyWebsite` app contains the surfaces, but the iOS app should keep only a few:

- `/news-channel`
- `/parables` as **Field Essays**
- `/ontology`
- `/beliefs`

Omit from iOS:

- Macro Tracker
- Emotion Check-In
- Design Studio

The public web home should label this section **Latest Leverage**, not **Latest Experiments**.

## Reused Supabase Tables

Known tables used by the web app that may matter to the iOS leverage spine:

- `entries`
- `markmap_content`

Other existing tables should stay web-only for this app direction:

- `emotion_logs`
- `emotion_config`
- `foods`
- `meals`
- `meal_entries`
- `meal_templates`
- `meal_template_items`
- `profiles`
- `studio_themes`

The iOS app should not depend on `studio_themes` for its UI. Native design should be stable and editorial.

## Data/Auth Notes

Because Macro Tracker and Emotion Check-In are now out of scope, the hard-coded nutrition `USER_ID` mismatch is not a Phase 1 blocker.

If nutrition ever returns to iOS, normalize nutrition writes around Supabase Auth before shipping it.

## Native App Shape

Recommended project:

- New repo: `Savy-iOS`
- Native SwiftUI app
- Supabase Swift client
- Same Supabase project as `dblaira.github.io`
- No WebView wrapper for the core shell

Use the existing `Understood` iOS app as a local pattern reference for:

- `SupabaseService`
- auth screen
- shared navigation state
- native list/detail navigation
- stable bottom navigation
- Supabase-backed content loading

Use `Re_Call` only as a reference for a web-bundled shell pattern, not as the default direction.

## MVP Navigation

Use a constrained root model in this exact order:

1. **News Channel**
   - weekly AI briefings
   - source-backed observations
   - systems and product implications

2. **Field Essays**
   - essays from `/parables`
   - leverage observations in the world
   - readable native detail view

3. **Ontology**
   - leverage map
   - categories, relationships, and recurring patterns
   - read-first, not graph-editing-first

4. **Beliefs**
   - principles at the bottom of the hierarchy
   - anchors and validated patterns
   - compact, reflective library

No center capture action in Phase 1.

## Phase 0: Foundation

Goal: create the native shell and prove the app can display the leverage spine.

Tasks:

- Create `Savy-iOS` SwiftUI project.
- Add Supabase Swift.
- Add config for the existing Supabase URL and anon key.
- Build `SavySupabaseService`.
- Implement session restore if authenticated content is required.
- Implement a fixed four-section shell.
- Implement static local seed content for all four sections if live content shape is not ready.
- Implement one live read if a suitable Supabase table/API is ready.
- Build on simulator.

Done when:

- iPhone opens to News Channel
- the four categories display in the requested order
- Macro Tracker, Emotion Check-In, and Design Studio are absent
- the app builds on simulator

## Phase 1: Leverage Reader

Goal: make SAVY's leverage spine feel native and deliberate.

Screens:

- News Channel list/detail
- Field Essays list/detail
- Ontology overview
- Beliefs list/detail

Native decisions:

- no tracking dashboards
- no theme editor
- no decorative complexity
- clear typography
- stable order
- readable detail screens
- one obvious back path

Content sources:

- News Channel can start as bundled/local content mirrored from the web route.
- Field Essays can start from local Markdown/parables content.
- Ontology can start as a curated overview before graph rendering.
- Beliefs can read from `entries` where `entry_type = connection` when auth/data is ready.

## Phase 2: Live Content

Goal: move from static/bundled content to shared web-backed content where useful.

Features:

- fetch News Channel items from a source of truth
- fetch Field Essays from bundled markdown or an API endpoint
- fetch Beliefs from Supabase
- cache content for offline reading

Open decision:

- whether to expose Markdown content through a small Next API route, bundle it into iOS at build time, or move essays/briefs into Supabase.

## Phase 3: Notifications And Saved Items

Goal: make the app worth keeping on the phone.

Features:

- notify when a new News Channel brief is available
- notify when a new Field Essay is available
- save/bookmark leverage items
- optional weekly leverage prompt

## Phase 4: Ontology Depth

Goal: make ontology useful without turning the app into a visual graph editor.

Features:

- curated leverage map
- category details
- pattern relationship cards
- "why this matters" summaries

## Explicitly Out Of Scope

- Macro Tracker
- Emotion Check-In
- Design Studio
- HealthKit
- barcode scanning
- camera capture
- freeform capture
- theme editing

## Web-Only For Now

Keep these out of iOS until there is a clear native reason:

- Studio/edit mode
- full ontology graph editing
- Field Essay publishing
- News Channel publishing/admin
- theme system
- long-form markmap editing

The app can link out to web for these.

## First Build Recommendation

Start with Phase 0 and Phase 1 only.

The first real milestone should be:

> Open SAVY on iPhone and see News Channel, Field Essays, Ontology, and Beliefs in that exact order, with no Macro Tracker, Emotion Check-In, or Design Studio.

That proves the native premise before the app expands.

## Open Questions

- Should the app name be `SAVY`, `Savy`, or something more private-facing?
- Should this live in a new public repo, private repo, or local-only until it is useful?
- Should the first device target be iPhone only, or iPhone plus iPad from the start?
- Should Phase 1 require authentication, or can it start as a public native reader?
- Should News Channel and Field Essays be bundled at build time, served from Next API routes, or moved into Supabase as content records?
