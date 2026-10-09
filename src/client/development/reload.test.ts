/**
 * Unit tests for `reloadOnChange`.
 *
 * @module
 */
import { assertEquals } from "@std/assert";
import { stub } from "@std/testing/mock";
import { FakeTime } from "@std/testing/time";
import { RELOAD_INTERVAL_MS, VERSION_PATH } from "../../constants.ts";
import { fake } from "../../testing/fakes.ts";
import { reloadOnChange } from "./reload.ts";

Deno.test("reloadOnChange", async (t) => {
  let reloads = 0;
  let version = "1";
  const asked: string[] = [];
  let failing = false;
  using _fetch = stub(globalThis, "fetch", (input: string | URL | Request) => {
    asked.push(String(input));
    return failing
      ? Promise.reject(new Error("The server is busy."))
      : Promise.resolve(
        fake<Response>({ text: () => Promise.resolve(version) }),
      );
  });
  using time = new FakeTime();
  reloadOnChange("1", () => void (reloads += 1));

  /** Let one interval pass and wait for the check to end. */
  const wait = async (): Promise<void> => {
    await time.tickAsync(RELOAD_INTERVAL_MS);
  };

  await t.step("it asks nothing before the first interval", () => {
    assertEquals(asked, []);
  });

  await t.step(
    "it asks the server for the version at each interval",
    async () => {
      await wait();
      await wait();
      assertEquals(asked, [VERSION_PATH, VERSION_PATH]);
    },
  );

  await t.step(
    "it does not load the page again when the version is the same",
    () => {
      assertEquals(reloads, 0);
    },
  );

  await t.step("it ignores an error from the server", async () => {
    failing = true;
    await wait();
    failing = false;
    assertEquals(reloads, 0);
  });

  await t.step("it loads the page again when the version changes", async () => {
    version = "2";
    await wait();
    assertEquals(reloads, 1);
  });
});

Deno.test("reloadOnChange loads the page again at the first check if a file changed before it", async () => {
  let reloads = 0;
  // The server gave the page the version "1". A file changed in the first
  // interval, so the first answer of the server is "2".
  using _fetch = stub(
    globalThis,
    "fetch",
    () => Promise.resolve(fake<Response>({ text: () => Promise.resolve("2") })),
  );
  using time = new FakeTime();
  reloadOnChange("1", () => void (reloads += 1));
  await time.tickAsync(RELOAD_INTERVAL_MS);
  await time.runMicrotasks();
  assertEquals(reloads, 1);
});
