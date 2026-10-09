/**
 * Unit tests for `Application`. They use a fake backend and fake canvas
 * objects, so they need no GPU and no display.
 *
 * @module
 */
import { assertEquals, assertStrictEquals, assertThrows } from "@std/assert";
import type { Backend, FrameInfo } from "../../types.ts";
import {
  createFakeSurface,
  installFakeAnimationFrames,
  installFakeResizeObserver,
} from "../../testing/fakes.ts";
import { Application } from "./application.ts";
import { Canvas } from "./canvas.ts";

/** Make a backend that records the frames that it gets. */
function createBackend(frames: FrameInfo[]): Backend {
  return { render: (frame) => void frames.push(frame) };
}

Deno.test("Application", async (t) => {
  const drawn: FrameInfo[] = [];
  const fakeSurface = createFakeSurface();
  const observers = installFakeResizeObserver();
  const frames = installFakeAnimationFrames();
  try {
    const application = new Application(
      fakeSurface.surface,
      createBackend(drawn),
    );

    await t.step("the constructor starts no loop", () => {
      assertEquals(frames.pending, 0);
    });

    application.start();

    await t.step("start draws nothing before the first refresh", () => {
      assertEquals(drawn.length, 0);
      assertEquals(frames.pending, 1);
    });

    await t.step("a screen refresh gives the frame to the backend", () => {
      frames.step(1000);
      assertEquals(drawn, [{ time: 1000, aspectRatio: 2 }]);
    });

    await t.step("the aspect ratio follows the size of the canvas", () => {
      observers.resize(fakeSurface.surface, 900, 300);
      frames.step(2000);
      assertEquals(drawn.at(-1), { time: 2000, aspectRatio: 3 });
    });

    await t.step("shared gives the instance", () => {
      assertStrictEquals(Application.shared, application);
    });

    await t.step("a second Application fails", () => {
      assertThrows(
        () =>
          new Application(
            createFakeSurface().surface,
            createBackend(drawn),
          ),
        Error,
        "Application exists already.",
      );
    });
  } finally {
    Canvas.shared.stop();
    observers.restore();
    frames.restore();
  }
});
