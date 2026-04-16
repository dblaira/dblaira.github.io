# SAVY Studio — Session Handoff (2026-04-16)

Context for relaying this work back to a Claude Code project. Everything
below is committed and pushed on `main`.

---

## What we built

A bespoke in-repo design studio for SAVY (`/studio`) plus the seam that
lets it actually drive the live pages in real time.

Three pieces, each solving a specific problem:

1. **`/studio`** — a 3-column dashboard for editing every page's theme
   (canvas, ink, accents, fonts, component kind, notes). Reads/writes
   `public.studio_themes` in Supabase.
2. **Floating `studio` badge** — a corner pill that appears on every page
   (except `/studio` itself), linking to `/studio?route=<current path>`
   so the right room is pre-selected with one click.
3. **`useTheme(route)` hook** — the seam. Live pages read their theme
   from Supabase and subscribe to `postgres_changes`, so Studio edits
   propagate live with no refresh.

---

## Why this matters (strategic framing)

This is not dev tooling. It's the v0 of the **tester-facing palette
tool** that will ship when Material Health onboards testers. The user
mission is "FUCK TEXT" — visual-first UIs where color, shape, and
composition carry meaning before copy does.

Design decisions were made with that in mind:

- **Homepage will become a Pinterest-style feed** sampling from every
  other page. Each page needs a distinct visual identity so its tiles
  are recognizable in the feed. The Studio is how that identity gets
  set and iterated.
- **Per-user themes are coming.** `studio_themes` is currently keyed by
  `route` only. When user auth lands, add `user_id uuid` as a column
  and change `useTheme` from "fetch by route" to "fetch by
  (user_id, route) with global fallback." Zero component edits required.
- **Don't hardcode theme values in page components.** That was the big
  architectural call. Read everything through `useTheme(route)`.

---

## Files (7 code + 1 doc)

### New
| File | Purpose |
|----|----|
| `src/app/studio/page.tsx` | `/studio` route — full theme editor UI |
| `src/components/StudioLink.tsx` | Floating badge mounted in root layout |
| `src/lib/useTheme.ts` | The seam — fetch + realtime subscribe |
| `STUDIO-HANDOFF.md` | This document |

### Modified
| File | What changed |
|----|----|
| `src/app/layout.tsx` | Mounts `<StudioLink />` below `{children}` |
| `src/components/MoodCheckin.tsx` | `useTheme("/mood")` → canvas, ink, heading_font |
| `src/components/OntologyPage.tsx` | `useTheme("/ontology")` → canvas, ink, heading_font |
| `src/components/SleepDashboard.tsx` | `useTheme("/sleep")` → canvas only (rest bespoke) |

---

## Supabase state

### Table: `public.studio_themes`

```sql
create table public.studio_themes (
  route              text primary key,
  label              text not null,
  canvas             text not null,
  ink                text not null,
  accents            jsonb not null,
  heading_font       text not null,
  body_font          text not null,
  component_kind     text not null,
  notes              text default '',
  updated_at         timestamptz default now()
);
```

### Policies (RLS enabled)
| Policy | Command | Using |
|----|----|----|
| `read all` | `SELECT` | `true` |
| `write anon` | `ALL` | `true` (with_check `true`) |

Anon write is intentional for now (single-tenant). When auth lands,
replace `write anon` with a policy that checks `user_id = auth.uid()`.

### Realtime
`studio_themes` is added to the `supabase_realtime` publication —
that's what makes live updates work.

### Current rows
6 routes seeded; canvas/ink values reconciled to match what each page
looked like *before* the hook was wired, so wiring was visually invisible:

| Route | Canvas | Ink |
|----|----|----|
| `/` | `#F5F0E8` | `#1A1A1A` |
| `/beliefs` | `#E8DFD3` | `#2C2C2C` |
| `/mood` | `#F5F0E8` | `#1A1A1A` |
| `/nutrition` | `#F4D160` | `#2C2C2C` |
| `/ontology` | `#F5F0E8` | `#1A1A1A` |
| `/sleep` | `#FF7A1E` | `#1A1A1A` |

### Project
Supabase project ref: `wqdacfrzurhpsiuvzxwo` (NOT the AdamWeb project).
`.env.local` points here with anon key.

---

## How the workflow works

1. Open any page (e.g. `/mood`).
2. Click the `studio` badge in the bottom-right corner.
3. Land on `/studio?route=/mood` with Mood pre-selected.
4. Tweak canvas / ink / heading font in the right rail.
5. The `/mood` tab updates **live** — no refresh, no redeploy.
6. Every edit is persisted to Supabase on keystroke.

---

## What's still hardcoded (intentionally)

These are live-page values still baked into components, waiting for
explicit decisions before moving into the theme table:

- **Accents** on every page. `CRIMSON` (`#DC143C`) is still baked in
  for CTAs, eyebrows, and selected states. Decide: does `accents[0]`
  map to primary CTA? Etc.
- **Body font** everywhere (`'Inter', sans-serif`).
- **Card/container colors** (`#FFFFFF` cards, various rgba(0,0,0,X)
  muted text).
- **Sleep's bespoke palette and hero** — `PSY_*` constants, the radial
  gradient, `'The Psychedelic Peace'` font, `#FFE36A` title color.
  Kept hardcoded because they're the distinctive visual of that page.
- **Ontology's edge colors** — muted earth tones from the network
  graph (`#4F7F63`, `#B79A7A`, `#A74D4D`).

---

## Known gaps before Material Health launch

Three, in order of when they bite:

1. ✅ **Live pages read from `studio_themes`.** Done this session for
   mood, ontology, sleep. Still needed: `/`, `/beliefs`, `/nutrition`.
2. ⏳ **Multi-tenant data model.** Add `user_id uuid references
   auth.users(id)` nullable column. `null` = global default.
3. ⏳ **Tester-facing Studio UI.** The current 3-column layout with
   raw hex boxes, component-kind dropdown, and JSON export is a dev
   surface. The tester version is the right rail only, branded as
   "your palette," with presets and slider controls — no hex typing,
   no component-kind picker.

---

## Useful references

- Studio page UI lives in one file: `src/app/studio/page.tsx`
  (~21 KB, all inline — seed themes, live preview variants, right-rail
  controls, token strip).
- The 6 preview component kinds are defined inline in that same file:
  `FeedTilesPreview`, `MealBlocksPreview`, `RingsGridPreview`,
  `EmotionWheelPreview`, `GraphNodesPreview`, `CardStackPreview`.
  These are reference mockups for the Studio only — not the live
  components on the actual routes.
- `useTheme` fallback defaults live in `src/lib/useTheme.ts` (used
  only if Supabase is unreachable).

---

## Commits from this session

```
bcbc694 Add SAVY Studio and useTheme hook for live per-page theming
4182974 Track Cursor rules, project skill, design docs, and mockup
```

Plus this doc commit (follows).
