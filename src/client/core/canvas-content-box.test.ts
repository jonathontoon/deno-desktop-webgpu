/**
 * Unit tests for `Canvas` in a web view that cannot observe the device pixel
 * box, such as WebKit. This file has its own tests, because `Canvas` can be made
 * one time in each test file.
 *
 * @module
 */
import { assertEquals } from "@std/assert";
import { CANVAS_OBSERVED_BOX_FALLBACK } from "../../constants.ts";
import {
  createFakeSurface,
  installFakeDevicePixelRatio,
  installFakeMatchMedia,
  installFakeResizeObserver,
} from "../../testing/fakes.ts";
import { Canvas } from "./canvas.ts";

Deno.test("Canvas without the device pixel box", async (t) => {
  const observers = installFakeResizeObserver(false);
  const restoreRatio = installFakeDevicePixelRatio(2);
  const media = installFakeMatchMedia();
  const restoreFunctions = [restoreRatio];
  try {
    const fake = createFakeSurface();
    new Canvas(fake.surface);

    await t.step("the constructor watches the box in CSS pixels", () => {
      assertEquals(
        observers.options.get(fake.surface),
        CANVAS_OBSERVED_BOX_FALLBACK,
      );
    });

    await t.step("a size report is multiplied by the pixel ratio", () => {
      observers.resizeContent(fake.surface, 400.4, 300.2);
      assertEquals(fake.surface.width, 801);
      assertEquals(fake.surface.height, 600);
    });

    await t.step("a size report never makes a surface of size 0", () => {
      observers.resizeContent(fake.surface, 0, 0);
      assertEquals(fake.surface.width, 1);
      assertEquals(fake.surface.height, 1);
    });

    await t.step("the aspect ratio follows the new size", () => {
      observers.resizeContent(fake.surface, 450, 150);
      assertEquals(Canvas.shared.aspectRatio, 3);
    });

    await t.step(
      "the constructor waits for a change of the pixel ratio",
      () => {
        assertEquals(media.queries, ["(resolution: 2dppx)"]);
      },
    );

    await t.step("a new pixel ratio changes the size of the surface", () => {
      fake.setClientSize(400, 300);
      restoreFunctions.push(installFakeDevicePixelRatio(3));
      media.change();
      assertEquals(fake.surface.width, 1200);
      assertEquals(fake.surface.height, 900);
    });

    await t.step("it then waits for the next change of the ratio", () => {
      assertEquals(media.queries, [
        "(resolution: 2dppx)",
        "(resolution: 3dppx)",
      ]);
      restoreFunctions.push(installFakeDevicePixelRatio(1));
      media.change();
      assertEquals(fake.surface.width, 400);
      assertEquals(fake.surface.height, 300);
    });
  } finally {
    restoreFunctions.reverse().forEach((restore) => restore());
    media.restore();
    observers.restore();
  }
});
