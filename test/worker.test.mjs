import { test } from "node:test";
import assert from "node:assert/strict";
import { createTestHarness } from "@paperclipai/plugin-sdk/testing";
import plugin from "../dist/worker.js";
import manifest from "../dist/manifest.js";

const companyId = "48dd5ec6-1ea3-44d9-8bb0-f1762912b8c9";

test("cache-usage issues whitelisted, parameterized SQL and defaults to zero with no rows", async () => {
  const harness = createTestHarness({ manifest });
  await plugin.definition.setup(harness.ctx);

  const result = await harness.getData("cache-usage", { companyId });

  assert.equal(result.windowDays, 7);
  assert.deepEqual(result.companyTotal, { input: 0, cached: 0 });
  assert.deepEqual(result.byAgent, []);

  assert.equal(harness.dbQueries.length, 2);
  for (const query of harness.dbQueries) {
    assert.deepEqual(query.params, [companyId]);
    assert.match(query.sql, /^select/i);
    assert.match(query.sql, /public\.cost_events/);
  }
  assert.match(harness.dbQueries[1].sql, /public\.agents/);
});

test("cache-usage requires companyId", async () => {
  const harness = createTestHarness({ manifest });
  await plugin.definition.setup(harness.ctx);
  await assert.rejects(harness.getData("cache-usage", {}));
});
