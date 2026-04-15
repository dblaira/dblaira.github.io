import test from "node:test";
import assert from "node:assert/strict";

import { beginEntryEdit } from "./sleepDashboardActions.ts";

test("beginEntryEdit seeds the form without performing destructive side effects", () => {
  const calls: Array<{ type: string; value: string | number }> = [];

  beginEntryEdit(
    { date: "2026-04-15", score: 7 },
    (date) => calls.push({ type: "date", value: date }),
    (score) => calls.push({ type: "score", value: score })
  );

  assert.deepEqual(calls, [
    { type: "date", value: "2026-04-15" },
    { type: "score", value: 7 },
  ]);
});
