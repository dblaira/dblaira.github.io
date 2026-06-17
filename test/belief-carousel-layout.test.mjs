import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = () =>
  readFile(
    new URL("../src/components/BeliefCarousel.tsx", import.meta.url),
    "utf8"
  );

test("belief carousel quote can shrink and wrap inside the phone card", async () => {
  const carousel = await source();

  assert.match(carousel, /minWidth:\s*0/);
  assert.match(carousel, /overflowWrap:\s*"break-word"/);
});
