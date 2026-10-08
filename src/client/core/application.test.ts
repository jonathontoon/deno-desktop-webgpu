/**
 * Unit tests for `Application`. They use fake GPU and canvas objects, so
 * they need no GPU and no display.
 *
 * @module
 */
import { assertEquals, assertRejects, assertStrictEquals } from "@std/assert";
import {
  createFakeDevice,
  createFakeSurface,
  installFakeAnimationFrames,
  installFakeNavigatorGPU,
  installFakeResizeObserver,
} from "../../testing/fakes.ts";
import { Application } from "./application.ts";
import { Canvas } from "./canvas.ts";

Deno.test("Application", async (t) => {
  const fakeDevice = createFakeDevice();
  const fakeSurface = createFakeSurface();
  const observers = installFakeResizeObserver();
  const frames = installFakeAnimationFrames();
  const restoreGPU = installFakeNavigatorGPU({ device: fakeDevice.device });
  try {
    const application = await Application.launch(fakeSurface.surface);

    await t.step("launch draws nothing before the first refresh", () => {
      assertEquals(fakeDevice.submissions.length, 0);
      assertEquals(frames.pending, 1);
    });

    await t.step("the first frame draws the triangle with 3 vertices", () => {
      frames.step(0);
      assertEquals(fakeDevice.submissions.length, 1);
      assertEquals(fakeDevice.events.includes("draw:3"), true);
    });

    await t.step("shared gives the instance from launch", () => {
      assertStrictEquals(Application.shared, application);
    });

    await t.step("launch fails the second time", async () => {
      await assertRejects(
        () => Application.launch(createFakeSurface().surface),
        Error,
        "Application exists already.",
      );
    });

    await t.step("a requested frame draws the frame", () => {
      application.canvasDidRequestFrame(1000);
      assertEquals(fakeDevice.submissions.length, 2);
    });

    await t.step(
      "a requested frame uses the aspect ratio of the canvas",
      () => {
        observers.resize(fakeSurface.surface, 900, 300);
        application.canvasDidRequestFrame(2000);
        const lastWrite = fakeDevice.writes.at(-1);
        assertEquals(lastWrite?.data, [2, 3]);
      },
    );
  } finally {
    Canvas.shared.stop();
    restoreGPU();
    observers.restore();
    frames.restore();
  }
});
