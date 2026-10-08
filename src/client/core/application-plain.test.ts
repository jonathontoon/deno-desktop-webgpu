/**
 * Unit tests for `Application` without a `Meter`. This file has its own tests,
 * because `Application` can be made one time in each test file.
 *
 * @module
 */
import { assertEquals } from "@std/assert";
import type { FrameInfo } from "../../types.ts";
import {
  createFakeSurface,
  installFakeAnimationFrames,
  installFakeResizeObserver,
} from "../../testing/fakes.ts";
import { Application } from "./application.ts";
import { Canvas } from "./canvas.ts";

Deno.test("Application without a Meter draws each frame", () => {
  const drawn: FrameInfo[] = [];
  const observers = installFakeResizeObserver();
  const frames = installFakeAnimationFrames();
  try {
    const application = new Application(createFakeSurface().surface, {
      kind: "webgl2",
      render: (frame) => void drawn.push(frame),
    });
    application.start();
    frames.step(500);
    assertEquals(drawn, [{ time: 500, aspectRatio: 2 }]);
  } finally {
    Canvas.shared.stop();
    observers.restore();
    frames.restore();
  }
});
