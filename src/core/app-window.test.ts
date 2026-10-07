/**
 * Unit tests for `AppWindow`.
 *
 * @module
 */
import { assertEquals, assertStrictEquals, assertThrows } from "@std/assert";
import {
  FakeBrowserWindow,
  installFakeBrowserWindow,
} from "../testing/fakes.ts";
import type { WindowDelegate } from "../types.ts";
import { AppWindow } from "./app-window.ts";

const OPTIONS = { title: "Test", width: 800, height: 400 };

Deno.test("AppWindow", async (t) => {
  const restore = installFakeBrowserWindow();
  try {
    await t.step("shared fails before initialize", () => {
      assertThrows(
        () => AppWindow.shared,
        Error,
        "AppWindow is not initialized.",
      );
    });

    const appWindow = AppWindow.initialize(OPTIONS);
    const native = FakeBrowserWindow.last;
    if (!native) {
      throw new Error("AppWindow did not make a window.");
    }

    await t.step("initialize opens a window with the given options", () => {
      assertEquals(native.options, OPTIONS);
    });

    await t.step("shared gives the instance from initialize", () => {
      assertStrictEquals(AppWindow.shared, appWindow);
    });

    await t.step("initialize fails the second time", () => {
      assertThrows(
        () => AppWindow.initialize(OPTIONS),
        Error,
        "AppWindow exists already.",
      );
    });

    await t.step("the surface is the native surface of the window", () => {
      assertStrictEquals(appWindow.surface, native.surfaceKit.surface);
    });

    await t.step("syncSurfaceSize copies the window size", () => {
      native.size = [640, 480];
      appWindow.syncSurfaceSize();
      assertEquals(appWindow.surface.width, 640);
      assertEquals(appWindow.surface.height, 480);
    });

    await t.step("aspectRatio is the width divided by the height", () => {
      native.size = [900, 300];
      appWindow.syncSurfaceSize();
      assertEquals(appWindow.aspectRatio, 3);
    });

    await t.step("a resize event syncs the surface size", () => {
      native.size = [100, 50];
      native.dispatch("resize");
      assertEquals(appWindow.surface.width, 100);
      assertEquals(appWindow.surface.height, 50);
    });

    await t.step("present shows the frame on the surface", () => {
      const before = native.surfaceKit.presentCount;
      appWindow.present();
      assertEquals(native.surfaceKit.presentCount, before + 1);
    });

    await t.step("isClosed follows the native window", () => {
      assertEquals(appWindow.isClosed(), false);
      native.closed = true;
      assertEquals(appWindow.isClosed(), true);
      native.closed = false;
    });

    await t.step("a close event with no delegate does nothing", () => {
      native.dispatch("close");
    });

    await t.step("a close event tells the delegate", () => {
      let closeCount = 0;
      const delegate: WindowDelegate = { windowDidClose: () => closeCount++ };
      appWindow.delegate = delegate;
      native.dispatch("close");
      assertEquals(closeCount, 1);
    });
  } finally {
    restore();
  }
});
