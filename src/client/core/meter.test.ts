/**
 * Unit tests for `Meter`.
 *
 * @module
 */
import { assertEquals, assertStrictEquals, assertThrows } from "@std/assert";
import { FPS_INTERVAL_MS } from "../../constants.ts";
import { fake } from "../../testing/fakes.ts";
import { Meter } from "./meter.ts";

Deno.test("Meter", async (t) => {
  await t.step("shared fails before a Meter exists", () => {
    assertThrows(() => Meter.shared, Error, "Meter is not initialized.");
  });

  const target = fake<HTMLElement>({ textContent: "" });
  const meter = new Meter(target);

  /** Send frames to the meter every `step` milliseconds, from `from` to `to`. */
  const run = (from: number, to: number, step: number): void => {
    for (let time = from; time <= to; time += step) {
      meter.record(time);
    }
  };

  await t.step("shared gives the instance", () => {
    assertStrictEquals(Meter.shared, meter);
  });

  await t.step("a second Meter fails", () => {
    assertThrows(
      () => new Meter(fake<HTMLElement>({ textContent: "" })),
      Error,
      "Meter exists already.",
    );
  });

  await t.step("the element is empty before the first interval ends", () => {
    meter.record(1000);
    run(1010, 1490, 10);
    assertEquals(target.textContent, "");
  });

  await t.step("it shows 100 FPS for a frame every 10 milliseconds", () => {
    meter.record(1000 + FPS_INTERVAL_MS);
    assertEquals(target.textContent, "100 FPS");
  });

  await t.step("it starts a new interval after it shows the number", () => {
    const start = 1000 + FPS_INTERVAL_MS;
    run(start + 20, start + FPS_INTERVAL_MS, 20);
    assertEquals(target.textContent, "50 FPS");
  });

  await t.step("it rounds the number to a whole number", () => {
    // 4 frames in 600 milliseconds is 6.67 frames each second.
    run(2150, 2600, 150);
    assertEquals(target.textContent, "7 FPS");
  });
});
