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
  fake,
  installFakeAnimationFrames,
  installFakeResizeObserver,
} from "../../testing/fakes.ts";
import { Application } from "./application.ts";
import { Canvas } from "./canvas.ts";
import { Meter } from "./meter.ts";

/** Make a backend that records the frames that it gets. */
function createBackend(frames: FrameInfo[]): Backend {
  return { kind: "webgpu", render: (frame) => void frames.push(frame) };
}

Deno.test("Application", async (t) => {
  const drawn: FrameInfo[] = [];
  const rate = fake<HTMLElement>({ textContent: "" });
  const meter = new Meter(rate);
  const fakeSurface = createFakeSurface();
  const observers = installFakeResizeObserver();
  const frames = installFakeAnimationFrames();
  try {
    const application = new Application(
      fakeSurface.surface,
      createBackend(drawn),
      meter,
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
      application.canvasDidRequestFrame(2000);
      assertEquals(drawn.at(-1), { time: 2000, aspectRatio: 3 });
    });

    await t.step("each frame goes to the meter", () => {
      // The meter shows the rate after an interval of frames.
      for (let time = 2010; time <= 2500; time += 10) {
        application.canvasDidRequestFrame(time);
      }
      assertEquals(rate.textContent, "100 FPS");
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
            meter,
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
