/**
 * Pitch Mode
 *
 * When PITCH_MODE is true, every nav surface that calls pitchHref() silently
 * rewrites a known real route to its facade counterpart under /pitch/*.
 *
 * This is the switch used when opening Savy in front of investors or close
 * friends: they tap icons and nav items as normal and land on polished,
 * hardcoded facades — never on the unfinished backend-wired app.
 *
 * The real dashboards stay reachable by typing the URL directly (e.g. /sleep),
 * which is how Adam uses the live tool day-to-day.
 *
 * To add a new facade:
 *   1. Build /pitch/<feature>/page.tsx
 *   2. Add an entry here:  "/<feature>": "/pitch/<feature>"
 *
 * To go back to real-app nav temporarily, flip PITCH_MODE to false.
 */

export const PITCH_MODE = true;

const PITCH_ROUTES: Record<string, string> = {
  "/sleep": "/pitch/sleep",
};

export function pitchHref(href: string): string {
  if (!PITCH_MODE) return href;
  return PITCH_ROUTES[href] ?? href;
}
