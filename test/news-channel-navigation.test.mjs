import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const text = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("News Channel exists as a routable page and appears in site navigation", async () => {
  const [page, menu, home, studio] = await Promise.all([
    text("src/app/news-channel/page.tsx"),
    text("src/components/SavyMobileMenu.tsx"),
    text("src/components/SandboxHome.tsx"),
    text("src/app/studio/page.tsx"),
  ]);

  assert.match(page, /title:\s*"News Channel · SAVY"/);
  assert.match(page, /This Week(?:'|&apos;)s AI Brief/);
  assert.match(page, /AI is moving from (?:\"|&quot;)chat(?:\"|&quot;) to (?:\"|&quot;)work systems\.(?:\"|&quot;)/);
  assert.match(page, /Build a relationship engine/);

  assert.match(menu, /href:\s*"\/news-channel",\s*label:\s*"News Channel"/);
  assert.match(home, /label:\s*"NEWS CHANNEL"/);
  assert.match(home, /href:\s*"\/news-channel"/);
  assert.match(studio, /route:\s*"\/news-channel"/);
  assert.match(studio, /label:\s*"News Channel"/);
});
