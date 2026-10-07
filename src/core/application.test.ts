/**
 * Unit tests for `Application`. They use fake GPU and window objects, so
 * they need no GPU and no display.
 *
 * @module
 */
import { assertEquals, assertRejects, assertStrictEquals } from "@std/assert";
import { assertSpyCalls, stub } from "@std/testing/mock";
import { WINDOW_OPTIONS } from "../constants.ts";
import {
  createFakeDevice,
  FakeBrowserWindow,
  installFakeBrowserWindow,
  installFakeNavigatorGPU,
} from "../testing/fakes.ts";
import { Application } from "./application.ts";
import { RenderLoop } from "./render-loop.ts";

Deno.test("Application", async (t) => {
  const restoreWindow = installFakeBrowserWindow();
  const fakeDevice = createFakeDevice();
  const restoreGPU = installFakeNavigatorGPU({ device: fakeDevice.device });
  try {
    const application = await Application.launch();
    const native = FakeBrowserWindow.last;
    if (!native) {
      throw new Error("Application did not make a window.");
    }
    // Stop the loop so that no timer stays open after the test.
    RenderLoop.shared.stop();

    await t.step("launch opens the window with the constants", () => {
      assertEquals(native.options, WINDOW_OPTIONS);
    });

    await t.step("launch sizes the surface like the window", () => {
      assertEquals(native.surfaceKit.surface.width, WINDOW_OPTIONS.width);
      assertEquals(native.surfaceKit.surface.height, WINDOW_OPTIONS.height);
    });

    await t.step("launch draws and shows the first frame at once", () => {
      assertEquals(fakeDevice.submissions.length, 1);
      assertEquals(native.surfaceKit.presentCount, 1);
    });

    await t.step("the first frame draws the triangle with 3 vertices", () => {
      assertEquals(fakeDevice.events.includes("draw:3"), true);
    });

    await t.step("shared gives the instance from launch", () => {
      assertStrictEquals(Application.shared, application);
    });

    await t.step("launch fails the second time", async () => {
      await assertRejects(
        () => Application.launch(),
        Error,
        "exists already.",
      );
    });

    await t.step("a requested frame draws and shows the frame", () => {
      application.renderLoopDidRequestFrame(1000);
      assertEquals(fakeDevice.submissions.length, 2);
      assertEquals(native.surfaceKit.presentCount, 2);
    });

    await t.step(
      "a requested frame uses the aspect ratio of the window",
      () => {
        native.size = [900, 300];
        native.dispatch("resize");
        application.renderLoopDidRequestFrame(2000);
        const lastWrite = fakeDevice.writes.at(-1);
        assertEquals(lastWrite?.data, [2, 3]);
      },
    );

    await t.step("a requested frame on a closed window draws nothing", () => {
      native.closed = true;
      const submissions = fakeDevice.submissions.length;
      const presents = native.surfaceKit.presentCount;
      application.renderLoopDidRequestFrame(3000);
      assertEquals(fakeDevice.submissions.length, submissions);
      assertEquals(native.surfaceKit.presentCount, presents);
      native.closed = false;
    });

    await t.step("windowDidClose ends the program", () => {
      using exit = stub(Deno, "exit");
      application.windowDidClose();
      assertSpyCalls(exit, 1);
    });

    await t.step("the close event of the window ends the program", () => {
      using exit = stub(Deno, "exit");
      native.dispatch("close");
      assertSpyCalls(exit, 1);
    });
  } finally {
    RenderLoop.shared.stop();
    restoreGPU();
    restoreWindow();
  }
});
