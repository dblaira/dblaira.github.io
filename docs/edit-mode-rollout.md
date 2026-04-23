# Edit-Mode Rollout to Every Page

**Status:** paused 2026-04-23 mid-extraction. Infrastructure + `/sleep` fully
wired. `/home`, `/nutrition`, `/mood`, `/ontology`, `/beliefs` still need
wiring. Shared hook and shell components extracted and on disk but not yet
imported by any non-sleep page.

---

## What "edit mode" is

A pencil icon in the site header (`SavySiteHeader`) toggles **edit mode** on
the current page. When on:

- Every wrapped region on the page gets a thin dashed crimson outline plus a
  small floating label tag ("HEADLINE", "CARD BACKGROUND", etc.).
- A sticky toolbar appears under the header with chips for page-level roles
  (Page Background, Page Dots & Fill).
- Tapping any outlined region (or a toolbar chip) opens a bottom-sheet color
  picker with three tabs: **Color**, **Pattern** (dots / stripes / grid), and
  **Image** (URL paste + 10 Unsplash preset wallpapers, Fill/Fit/Tile toggle).
- Every save writes to Supabase optimistically (local state updates instantly),
  pops a toast with an **Undo** button, and syncs across devices via the
  existing realtime channel.
- **Esc** key closes the sheet or exits edit mode.
- Recent colors persist across sessions in `localStorage`.

Text elements (headlines, labels, button colors, rings) get `allowFills={false}`
and see only the Color tab — patterns/images don't read as text color.

---

## Data model

One column added to the existing `studio_themes` table:

```sql
ALTER TABLE studio_themes ADD COLUMN IF NOT EXISTS overrides jsonb NOT NULL DEFAULT '{}'::jsonb;
```

Migration already applied (commit `3d341c2`). `overrides` is a JSON map keyed
by element id. Values are of type `Fill` (defined in `src/lib/fills.ts`):

```ts
type Fill =
  | string                                                // solid hex, backward-compat
  | { kind: "color"; value: string }
  | { kind: "pattern"; pattern: "dots" | "stripes" | "grid"; fg: string; bg: string; scale?: number }
  | { kind: "image"; url: string; size?: "cover" | "contain" | "tile" };
```

Each page's row in `studio_themes` has its own `overrides` map. Element ids
are page-scoped (no collision across routes).

Render precedence for any element:

```
localOverrides[id]  →  theme.overrides[id]  →  shared role fallback  →  built-in default
```

---

## Files touched

**New infrastructure (all generic — no per-page logic):**

- `src/lib/fills.ts` — Fill type, `fillStyle`, `fillColor`, `fillIsImage`,
  `IMAGE_PRESETS` (10 curated Unsplash wallpapers)
- `src/lib/useEditMode.ts` — `EditModeProvider`, `useEditMode` hook, toast
  state, recent-colors state, Esc-key handler
- `src/lib/useTheme.ts` — already existed; extended to surface the
  `overrides` column
- `src/lib/usePageEditing.ts` — **NEW**, one-stop hook per page. Returns
  `theme`, `colorFor`, `fillFor`, `saveOverride`. Optimistic updates +
  Supabase persist + toast with undo built in.
- `src/components/Editable.tsx` — dashed-outline wrapper with label tag;
  opens sheet on tap. Takes `id`, `label`, `description`, `value`,
  `onChange`, optional `inline` + `allowFills`.
- `src/components/EditColorSheet.tsx` — bottom-sheet color/pattern/image
  picker (tabs, recent colors, gallery, Fill/Fit/Tile toggle)
- `src/components/EditToast.tsx` — slim pill with green "Saved" label,
  region name, and Undo button. Auto-dismisses ~4s.
- `src/components/EditingShell.tsx` — **NEW**, one-line wrapper:
  `<EditingShell>{pageBody}</EditingShell>` mounts provider + sheet + toast.
- `src/components/SavySiteHeader.tsx` — pencil icon added. Only renders when
  an `EditModeProvider` is mounted (uses `useEditMode()` and checks for null
  context, so every non-edit-mode page continues to work).

**Sleep-specific wiring (complete, reference implementation):**

- `src/components/SleepDashboard.tsx` — rewired to use `fillStyle` on every
  card, per-element `<Editable id="...">` wrappers on:
  - `headline`, `donut-card-bg`, `donut-ring`, `log-card-bg`, `log-heading`,
    `add-button`, `trend-card-bg`, `trend-label`, `entries-card-bg`,
    `entries-label`, `rating-card-bg`, `rating-label`, `quote-card-bg`,
    `quote-bar`
  - Plus `canvas` and `accent-3` via the `PageColorsToolbar` chips.

---

## The mechanical wiring recipe (apply to every other page)

For each page's body component, do these four things:

### 1. Wrap the page's top-level `page.tsx` in `<EditingShell>`

```tsx
// BEFORE: src/app/nutrition/page.tsx
import NutritionDashboard from "@/components/NutritionDashboard";
export default function Page() { return <NutritionDashboard />; }

// AFTER:
import NutritionDashboard from "@/components/NutritionDashboard";
import { EditingShell } from "@/components/EditingShell";
export default function Page() {
  return (
    <EditingShell>
      <NutritionDashboard />
    </EditingShell>
  );
}
```

### 2. In the body component, call `usePageEditing`

```tsx
import { usePageEditing } from "@/lib/usePageEditing";
import { Editable } from "@/components/Editable";
import { fillStyle } from "@/lib/fills";

export default function NutritionDashboard() {
  const { theme, colorFor, fillFor, saveOverride } = usePageEditing("/nutrition");

  // Derive role colors from theme.accents[] with safe fallbacks:
  const ink     = theme.accents[0] ?? "#1A1A1A";
  const surface = theme.accents[1] ?? "#FFFFFF";
  // ...etc (each page picks its own role count)
  // ...
}
```

### 3. Wrap each visible card / label / button with `<Editable>`

```tsx
// A card background (supports color + pattern + image):
<Editable
  id="meal-card-bg"
  label="Meal Card Background"
  description="The background of every meal card on this page."
  value={fillFor("meal-card-bg", surface)}
  onChange={(v) => saveOverride("meal-card-bg", "Meal Card Background", v)}
>
  <div style={{ ...fillStyle(fillFor("meal-card-bg", surface), surface), borderRadius: 16, padding: 20 }}>
    ...
  </div>
</Editable>

// A text element (color only):
<Editable
  id="nutrition-headline"
  label="Headline"
  description="The big title at the top of the page."
  value={colorFor("nutrition-headline", ink)}
  onChange={(v) => saveOverride("nutrition-headline", "Headline", v)}
  allowFills={false}
>
  <h1 style={{ color: colorFor("nutrition-headline", ink) }}>Macros</h1>
</Editable>
```

### 4. Optional: add a page-level toolbar for canvas + atmosphere

Copy/pattern from `PageColorsToolbar` in `SleepDashboard.tsx`. Renders only
when `edit?.enabled` is true. Each chip calls `edit.setActive({ ... })`
directly with an `id` (`"canvas"` or `"accent-3"` etc), an `onChange` that
writes to the appropriate column, and `allowFills: true` for canvas,
`false` for atmosphere.

---

## Per-page scope estimates

Rough time + regions per page:

| Page       | File(s)                                                  | Regions | Est.     | Notes                                                  |
|------------|----------------------------------------------------------|---------|----------|--------------------------------------------------------|
| Home       | `SandboxHome.tsx` (299 lines)                           | ~10     | 15 min   | SAVY title + 6 experiment cards + quote carousel       |
| Beliefs    | `BeliefLibrary.tsx` (309) + `BeliefCarousel.tsx` (149)  | ~7      | 10 min   | Card stack + headline                                  |
| Mood       | `MoodCheckin.tsx` (331) + `EmotionWheel.tsx` (262)      | ~6      | 15 min   | Wheel wrapped as one region in v1                      |
| Ontology   | `OntologyPage.tsx` (148) + `OntologyNetwork.tsx` (328)  | ~5      | 10 min   | Graph wrapped as one region in v1                      |
| Nutrition  | `NutritionDashboard.tsx` (634)                          | ~15     | 25 min   | Biggest. Macro bars, meal blocks, form. Biggest win.   |

Total: ~75 minutes of focused grind.

**Out of scope for v1** (defer to a second pass if requested):

- Individual emotion-wheel slice colors (8 slices × independent tap)
- Individual graph nodes on ontology network
- Individual macro-bar colors on nutrition (protein/carbs/fat as three Editables?)
- Home-page experiment card tile backgrounds as individual Editables
  (shared `feed-tile-bg` is fine for v1; split later if needed)

---

## Resumption checklist for another agent

1. Read this doc + `src/components/SleepDashboard.tsx` (reference pattern)
2. Commit already-extracted but unused files:
   - `src/lib/usePageEditing.ts`
   - `src/components/EditingShell.tsx`
3. Work through the table top-down. Commit per page so any regression is one
   `git revert` away.
4. For each page commit:
   - Run `npm run dev`, visit the route, tap the pencil, verify outlines
     appear on every wrapped region.
   - Tap each region, change to a test color, confirm it sticks. Refresh, confirm
     it's still there (Supabase persistence working).
   - Tap Undo from the toast, confirm revert.
5. After all five pages, push once. Verify `https://www.savy.sh/{sleep,mood,nutrition,ontology,beliefs,/}` all return `200` and render.
6. If anything breaks, the render precedence means setting a single element's
   override to an invalid value shouldn't crash the page — `fillStyle`'s
   `fallback` param always produces a valid CSS background.

---

## Quick-start commands

```bash
# verify infrastructure files exist
ls src/lib/fills.ts src/lib/useEditMode.ts src/lib/usePageEditing.ts \
   src/components/Editable.tsx src/components/EditColorSheet.tsx \
   src/components/EditToast.tsx src/components/EditingShell.tsx

# reference implementation
less src/components/SleepDashboard.tsx

# live site
open https://www.savy.sh/sleep  # tap pencil, try any card

# migration (already applied, but for reference)
# ALTER TABLE studio_themes ADD COLUMN IF NOT EXISTS overrides jsonb NOT NULL DEFAULT '{}'::jsonb;
```

---

## History

- Per-element edit mode built on 2026-04-23
- Patterns + image fills added same day (commit `7593310`)
- `overrides` JSONB column added via MCP migration `add_overrides_to_studio_themes` (commit `3d341c2`)
- Rollout to other pages **paused here** to insert a new page first. Plan
  resumes after that page lands.
