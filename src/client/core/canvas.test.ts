/**
 * Unit tests for `Canvas`.
 *
 * @module
 */
import { assertEquals, assertStrictEquals, assertThrows } from "@std/assert";
import type { CanvasDelegate } from "../../types.ts";
import {
  createFakeSurface,
  installFakeAnimationFrames,
  installFakeMatchMedia,
  installFakeResizeObserver,
} from "../../testing/fakes.ts";
import { Canvas } from "./canvas.ts";

/** The action that the delegate runs at each frame. */
let onFrame: () => void = () => {};

/** Make a delegate that records the time of each frame request. */
function createDelegate(times: number[]): CanvasDelegate {
  return {
    canvasDidRequestFrame: (time) => {
      times.push(time);
      onFrame();
    },
  };
}

Deno.test("Canvas", async (t) => {
  await t.step("shared fails before a Canvas exists", () => {
    assertThrows(
      () => Canvas.shared,
      Error,
      "Canvas is not initialized.",
    );
  });

  const observers = installFakeResizeObserver();
  const media = installFakeMatchMedia();
  const frames = installFakeAnimationFrames();
  const fake = createFakeSurface();
  const canvas = new Canvas(fake.surface);

  await t.step("the constructor keeps the canvas as the surface", () => {
    assertStrictEquals(canvas.surface, fake.surface);
  });

  await t.step("shared gives the instance", () => {
    assertStrictEquals(Canvas.shared, canvas);
  });

  await t.step("a second Canvas fails", () => {
    assertThrows(
      () => new Canvas(createFakeSurface().surface),
      Error,
      "Canvas exists already.",
    );
  });

  await t.step("the constructor does not wait for a pixel ratio change", () => {
    assertEquals(media.queries, []);
  });

  await t.step("the constructor watches the box in device pixels", () => {
    assertEquals(observers.options.get(fake.surface), {
      box: "device-pixel-content-box",
    });
  });

  await t.step("a size report sets the size of the surface", () => {
    observers.resize(fake.surface, 1600, 1200);
    assertEquals(fake.surface.width, 1600);
    assertEquals(fake.surface.height, 1200);
  });

  await t.step("a new size report changes the surface again", () => {
    observers.resize(fake.surface, 802, 600);
    assertEquals(fake.surface.width, 802);
    assertEquals(fake.surface.height, 600);
  });

  await t.step("a size report never makes a surface of size 0", () => {
    observers.resize(fake.surface, 0, 0);
    assertEquals(fake.surface.width, 1);
    assertEquals(fake.surface.height, 1);
  });

  await t.step("aspectRatio is the width divided by the height", () => {
    observers.resize(fake.surface, 900, 300);
    assertEquals(canvas.aspectRatio, 3);
  });

  const times: number[] = [];
  const delegate = createDelegate(times);

  await t.step("start asks for a frame and draws none at once", () => {
    canvas.start(delegate);
    assertEquals(frames.pending, 1);
    assertEquals(times.length, 0);
    canvas.stop();
  });

  await t.step("a screen refresh gives the frame time to the delegate", () => {
    canvas.start(delegate);
    frames.step(1234);
    assertEquals(times, [1234]);
    canvas.stop();
  });

  await t.step("the loop asks for the next frame after each frame", () => {
    times.length = 0;
    canvas.start(delegate);
    frames.step(10);
    assertEquals(frames.pending, 1);
    frames.step(20);
    frames.step(30);
    assertEquals(times, [10, 20, 30]);
    canvas.stop();
  });

  await t.step("start does nothing while the loop runs", () => {
    times.length = 0;
    canvas.start(delegate);
    canvas.start(delegate);
    assertEquals(frames.pending, 1);
    frames.step(10);
    assertEquals(times, [10]);
    canvas.stop();
  });

  await t.step("stop cancels the waiting frame", () => {
    times.length = 0;
    canvas.start(delegate);
    canvas.stop();
    assertEquals(frames.pending, 0);
    frames.step(10);
    assertEquals(times.length, 0);
  });

  await t.step("stop inside a frame ends the loop", () => {
    times.length = 0;
    onFrame = () => canvas.stop();
    canvas.start(delegate);
    frames.step(10);
    onFrame = () => {};
    assertEquals(frames.pending, 0);
    assertEquals(times, [10]);
  });

  await t.step("stop does nothing when the loop is idle", () => {
    canvas.stop();
    canvas.stop();
    assertEquals(frames.pending, 0);
  });

  await t.step("the loop can start again after stop", () => {
    times.length = 0;
    canvas.start(delegate);
    canvas.stop();
    canvas.start(delegate);
    assertEquals(frames.pending, 1);
    frames.step(10);
    assertEquals(times, [10]);
    canvas.stop();
  });

  media.restore();
  observers.restore();
  frames.restore();
});
