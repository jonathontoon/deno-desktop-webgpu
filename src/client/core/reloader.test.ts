/**
 * Unit tests for `Reloader`.
 *
 * @module
 */
import { assertEquals, assertStrictEquals, assertThrows } from "@std/assert";
import { stub } from "@std/testing/mock";
import { FakeTime } from "@std/testing/time";
import { RELOAD_INTERVAL_MS, VERSION_PATH } from "../../constants.ts";
import { fake } from "../../testing/fakes.ts";
import { Reloader } from "./reloader.ts";

Deno.test("Reloader", async (t) => {
  await t.step("shared fails before a Reloader exists", () => {
    assertThrows(() => Reloader.shared, Error, "Reloader is not initialized.");
  });

  let reloads = 0;
  const reloader = new Reloader(() => void (reloads += 1));

  await t.step("shared gives the instance", () => {
    assertStrictEquals(Reloader.shared, reloader);
  });

  await t.step("a second Reloader fails", () => {
    assertThrows(
      () => new Reloader(() => {}),
      Error,
      "Reloader exists already.",
    );
  });

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
  reloader.start();

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
