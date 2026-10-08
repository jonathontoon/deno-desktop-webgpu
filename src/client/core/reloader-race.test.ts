/**
 * Unit tests for `Reloader` when a file changes before the first check. This
 * file has its own test, because `Reloader` can be made one time in each test
 * file.
 *
 * @module
 */
import { assertEquals } from "@std/assert";
import { stub } from "@std/testing/mock";
import { FakeTime } from "@std/testing/time";
import { RELOAD_INTERVAL_MS } from "../../constants.ts";
import { fake } from "../../testing/fakes.ts";
import { Reloader } from "./reloader.ts";

Deno.test("Reloader loads the page again at the first check if a file changed before it", async () => {
  let reloads = 0;
  // The server gave the page the version "1". A file changed in the first
  // interval, so the first answer of the server is "2".
  const reloader = new Reloader("1", () => void (reloads += 1));
  using _fetch = stub(
    globalThis,
    "fetch",
    () => Promise.resolve(fake<Response>({ text: () => Promise.resolve("2") })),
  );
  using time = new FakeTime();
  reloader.start();
  await time.tickAsync(RELOAD_INTERVAL_MS);
  await time.runMicrotasks();
  assertEquals(reloads, 1);
});
