/**
 * Unit tests for `Canvas`.
 *
 * @module
 */
import { assertEquals, assertStrictEquals, assertThrows } from "@std/assert";
import type { FrameHandler, FrameInfo } from "../../types.ts";
import {
  createFakeSurface,
  installFakeAnimationFrames,
  installFakeResizeObserver,
} from "../../testing/fakes.ts";
import { Canvas } from "./canvas.ts";

/** The action that the handler runs at each frame. */
let onFrame: () => void = () => {};

/** Make a handler that records the frames that it gets. */
function createHandler(received: FrameInfo[]): FrameHandler {
  return (frame) => {
    received.push(frame);
    onFrame();
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

  await t.step("the constructor watches the box in device pixels", () => {
    assertEquals(observers.options.get(fake.surface), {
      box: "device-pixel-content-box",
    });
  });

  const received: FrameInfo[] = [];
  const handler = createHandler(received);
  /** The times of the frames that the handler got. */
  const times = (): number[] => received.map((frame) => frame.time);

  // The size tests run with the frame loop, because the surface gets a new size
  // at the start of a frame.
  canvas.start(handler);
  let time = 0;
  /** Run one frame, and give the time of the frame. */
  const nextFrame = (): number => {
    time += 16;
    frames.step(time);
    return time;
  };

  await t.step("a size report does not change the surface at once", () => {
    observers.resize(fake.surface, 1600, 1200);
    assertEquals(fake.surface.width, 300);
    assertEquals(fake.surface.height, 150);
  });

  await t.step("the next frame sets the size of the surface", () => {
    nextFrame();
    assertEquals(fake.surface.width, 1600);
    assertEquals(fake.surface.height, 1200);
  });

  await t.step("the surface has the new size when the handler draws", () => {
    const sizes: string[] = [];
    onFrame = () => sizes.push(`${fake.surface.width}x${fake.surface.height}`);
    observers.resize(fake.surface, 802, 600);
    nextFrame();
    onFrame = () => {};
    assertEquals(sizes, ["802x600"]);
  });

  await t.step("only the newest size report counts", () => {
    observers.resize(fake.surface, 700, 500);
    observers.resize(fake.surface, 710, 510);
    nextFrame();
    assertEquals(fake.surface.width, 710);
    assertEquals(fake.surface.height, 510);
  });

  await t.step(
    "a size that the surface has already is not written again",
    () => {
      const writes: string[] = [];
      let width = fake.surface.width;
      let height = fake.surface.height;
      Object.defineProperties(fake.surface, {
        width: {
          get: () => width,
          set: (v) => (writes.push("width"), width = v),
        },
        height: {
          get: () => height,
          set: (v) => (writes.push("height"), height = v),
        },
      });
      observers.resize(fake.surface, 710, 510);
      nextFrame();
      assertEquals(writes, []);
      observers.resize(fake.surface, 720, 510);
      nextFrame();
      assertEquals(writes, ["width"]);
    },
  );

  await t.step("a size report never makes a surface of size 0", () => {
    observers.resize(fake.surface, 0, 0);
    nextFrame();
    assertEquals(fake.surface.width, 1);
    assertEquals(fake.surface.height, 1);
  });

  await t.step("aspectRatio is the width divided by the height", () => {
    observers.resize(fake.surface, 900, 300);
    nextFrame();
    assertEquals(canvas.aspectRatio, 3);
  });

  canvas.stop();
  received.length = 0;

  await t.step("start asks for a frame and draws none at once", () => {
    canvas.start(handler);
    assertEquals(frames.pending, 1);
    assertEquals(received.length, 0);
    canvas.stop();
  });

  await t.step("a screen refresh gives the time and the aspect ratio", () => {
    canvas.start(handler);
    frames.step(1234);
    assertEquals(received, [{ time: 1234, aspectRatio: 3 }]);
    canvas.stop();
  });

  await t.step("the aspect ratio follows the size of the canvas", () => {
    received.length = 0;
    canvas.start(handler);
    observers.resize(fake.surface, 600, 300);
    frames.step(10);
    assertEquals(received.at(-1)?.aspectRatio, 2);
    canvas.stop();
  });

  await t.step("the loop asks for the next frame after each frame", () => {
    received.length = 0;
    canvas.start(handler);
    frames.step(10);
    assertEquals(frames.pending, 1);
    frames.step(20);
    frames.step(30);
    assertEquals(times(), [10, 20, 30]);
    canvas.stop();
  });

  await t.step("start does nothing while the loop runs", () => {
    received.length = 0;
    canvas.start(handler);
    canvas.start(handler);
    assertEquals(frames.pending, 1);
    frames.step(10);
    assertEquals(times(), [10]);
    canvas.stop();
  });

  await t.step("stop cancels the waiting frame", () => {
    received.length = 0;
    canvas.start(handler);
    canvas.stop();
    assertEquals(frames.pending, 0);
    frames.step(10);
    assertEquals(received.length, 0);
  });

  await t.step("stop inside a frame ends the loop", () => {
    received.length = 0;
    onFrame = () => canvas.stop();
    canvas.start(handler);
    frames.step(10);
    onFrame = () => {};
    assertEquals(frames.pending, 0);
    assertEquals(times(), [10]);
  });

  await t.step("stop does nothing when the loop is idle", () => {
    canvas.stop();
    canvas.stop();
    assertEquals(frames.pending, 0);
  });

  await t.step("the loop can start again after stop", () => {
    received.length = 0;
    canvas.start(handler);
    canvas.stop();
    canvas.start(handler);
    assertEquals(frames.pending, 1);
    frames.step(10);
    assertEquals(times(), [10]);
    canvas.stop();
  });

  observers.restore();
  frames.restore();
});
