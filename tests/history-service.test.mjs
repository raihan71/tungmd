import assert from "node:assert/strict";
import { beforeEach, afterEach, test } from "node:test";
import {
  claimGuestHistory,
  historyKey,
  loadHistory,
  mergeHistory,
  parseHistory,
  saveHistory,
  syncHistory,
} from "../src/services/history-service.ts";

const originalFetch = globalThis.fetch;
const item = (url, updatedAt = "2026-10-03T10:00:00.000Z") => ({
  url,
  title: url,
  at: "10:00",
  assets: 2,
  updatedAt,
});

beforeEach(() => {
  const storage = new Map();
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
      removeItem: (key) => storage.delete(key),
    },
  });
});
afterEach(() => {
  globalThis.fetch = originalFetch;
  delete globalThis.localStorage;
});

test("migrates legacy clock-only records without changing order", () => {
  const legacy = [item("https://a.test"), item("https://b.test")].map(
    ({ updatedAt, ...rest }) => rest,
  );
  localStorage.setItem(historyKey(), JSON.stringify(legacy));
  const migrated = claimGuestHistory("user_a");
  assert.deepEqual(
    migrated.map((entry) => entry.url),
    legacy.map((entry) => entry.url),
  );
  assert.ok(migrated.every((entry) => Number.isFinite(Date.parse(entry.updatedAt))));
  assert.deepEqual(loadHistory(), []);
  assert.deepEqual(loadHistory("user_a"), migrated);
});

test("deduplicates URLs and retains the newest visit across devices", () => {
  const newer = item("https://a.test", "2026-10-03T12:00:00.000Z");
  const older = item("https://a.test");
  assert.deepEqual(mergeHistory([older], [newer], [older]), [newer]);
});

test("retains more than six pages", () => {
  const entries = Array.from({ length: 20 }, (_, i) => item(`https://${i}.test`));
  saveHistory(mergeHistory(entries));
  assert.equal(loadHistory().length, 20);
});

test("claimed history survives failed sync and is not imported by another account", async () => {
  saveHistory([item("https://private.test")]);
  const claimed = claimGuestHistory("user_a");
  globalThis.fetch = async () => new Response("unavailable", { status: 503 });
  await assert.rejects(syncHistory(claimed, "token", { url: "https://db.test", key: "public" }));
  assert.deepEqual(claimGuestHistory("user_b"), []);
  assert.deepEqual(loadHistory("user_a"), claimed);
  assert.deepEqual(claimGuestHistory("user_a"), claimed);
});

test("does not delete guest data when the account copy cannot be saved", () => {
  saveHistory([item("https://a.test")]);
  localStorage.setItem = () => {
    throw new Error("Quota exceeded");
  };
  assert.equal(claimGuestHistory("user_a").length, 1);
  assert.equal(loadHistory().length, 1);
});

test("handles corrupted storage and discards malformed entries", () => {
  localStorage.setItem(historyKey(), "not-json");
  assert.deepEqual(loadHistory(), []);
  assert.deepEqual(parseHistory({}), []);
  assert.deepEqual(parseHistory([null, {}, { ...item("a"), assets: -1 }]), []);
});

test("sends Clerk authentication and returns remote history on a fresh device", async () => {
  const remote = [item("https://saved.test")];
  globalThis.fetch = async (url, options) => {
    assert.equal(url, "https://db.test/rest/v1/rpc/sync_page_history");
    assert.equal(options.headers.Authorization, "Bearer clerk-token");
    assert.equal(options.headers.apikey, "publishable-key");
    assert.deepEqual(JSON.parse(options.body), { entries: [] });
    return Response.json(remote);
  };
  assert.deepEqual(
    await syncHistory([], "clerk-token", {
      url: "https://db.test/",
      key: "publishable-key",
    }),
    remote,
  );
});

test("rejects expired sessions without discarding the local copy", async () => {
  saveHistory([item("https://a.test")], "user_a");
  globalThis.fetch = async () => new Response(null, { status: 401 });
  await assert.rejects(
    syncHistory(loadHistory("user_a"), "expired", {
      url: "https://db.test",
      key: "public",
    }),
  );
  assert.equal(loadHistory("user_a").length, 1);
});
