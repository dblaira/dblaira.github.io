import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = () =>
  readFile(
    new URL("../src/components/SandboxHome.tsx", import.meta.url),
    "utf8"
  );

test("home page uses the phone-first card grid and bottom-centered FAB", async () => {
  const home = await source();

  assert.match(home, /home-leverage-grid/);
  assert.match(home, /gridTemplateColumns:\s*"repeat\(2,\s*minmax\(0,\s*1fr\)\)"/);
  assert.match(home, /left:\s*"50%"/);
  assert.match(home, /transform:\s*"translateX\(-50%\)"/);
  assert.match(home, /bottom:\s*"calc\(24px \+ env\(safe-area-inset-bottom,\s*0px\)\)"/);
});
