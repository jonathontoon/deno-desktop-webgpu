/**
 * Unit tests for `RenderLoop`.
 *
 * @module
 */
import { assertEquals, assertStrictEquals, assertThrows } from "@std/assert";
import { FakeTime } from "@std/testing/time";
import type { RenderLoopDelegate } from "../types.ts";
import { RenderLoop } from "./render-loop.ts";

const FRAME_MS = 10;

/** Make a delegate that records the time of each tick. */
function createDelegate(
  times: number[],
  onTick: () => void = () => {},
): RenderLoopDelegate {
  return {
    renderLoopDidRequestFrame: (time) => {
      times.push(time);
      onTick();
    },
  };
}

/** The action that the delegate of the shared loop runs at each tick. */
let onTick: () => void = () => {};

Deno.test("RenderLoop", async (t) => {
  await t.step("shared fails before initialize", () => {
    assertThrows(
      () => RenderLoop.shared,
      Error,
      "RenderLoop is not initialized.",
    );
  });

  const times: number[] = [];
  const loop = RenderLoop.initialize(
    createDelegate(times, () => onTick()),
    FRAME_MS,
  );

  await t.step("shared gives the instance from initialize", () => {
    assertStrictEquals(RenderLoop.shared, loop);
  });

  await t.step("initialize fails the second time", () => {
    assertThrows(
      () => RenderLoop.initialize(createDelegate([]), FRAME_MS),
      Error,
      "RenderLoop exists already.",
    );
  });

  await t.step("start makes the first tick at once", () => {
    using time = new FakeTime();
    loop.start();
    assertEquals(times.length, 1);
    assertEquals(typeof times[0], "number");
    loop.stop();
    time.tick(FRAME_MS * 5);
    assertEquals(times.length, 1);
  });

  await t.step("the loop ticks again after each frame time", () => {
    times.length = 0;
    using time = new FakeTime();
    loop.start();
    assertEquals(times.length, 1);
    time.tick(FRAME_MS - 1);
    assertEquals(times.length, 1);
    time.tick(1);
    assertEquals(times.length, 2);
    time.tick(FRAME_MS * 3);
    assertEquals(times.length, 5);
    loop.stop();
  });

  await t.step("start does nothing while the loop runs", () => {
    times.length = 0;
    using time = new FakeTime();
    loop.start();
    loop.start();
    assertEquals(times.length, 1);
    time.tick(FRAME_MS);
    assertEquals(times.length, 2);
    loop.stop();
  });

  await t.step("stop ends the ticks", () => {
    times.length = 0;
    using time = new FakeTime();
    loop.start();
    loop.stop();
    time.tick(FRAME_MS * 10);
    assertEquals(times.length, 1);
  });

  await t.step("stop inside a tick ends the loop", () => {
    times.length = 0;
    using time = new FakeTime();
    onTick = () => loop.stop();
    loop.start();
    time.tick(FRAME_MS * 5);
    onTick = () => {};
    assertEquals(times.length, 1);
  });

  await t.step("stop does nothing when the loop is idle", () => {
    loop.stop();
    loop.stop();
  });

  await t.step("the loop can start again after stop", () => {
    times.length = 0;
    using time = new FakeTime();
    loop.start();
    loop.stop();
    loop.start();
    assertEquals(times.length, 2);
    time.tick(FRAME_MS);
    assertEquals(times.length, 3);
    loop.stop();
  });
});
