/**
 * Unit tests for `WebGPU`.
 *
 * @module
 */
import { assertEquals, assertThrows } from "@std/assert";
import {
  createFakeDevice,
  createFakeSurface,
  installFakeNavigatorGPU,
} from "../../testing/fakes.ts";
import { WebGPU } from "./webgpu.ts";

Deno.test("WebGPU", async (t) => {
  const fakeDevice = createFakeDevice();
  const fakeSurface = createFakeSurface();
  const restore = installFakeNavigatorGPU({ device: fakeDevice.device });
  try {
    const backend = new WebGPU(fakeDevice.device, fakeSurface.surface);

    await t.step("the constructor draws nothing", () => {
      assertEquals(fakeDevice.submissions.length, 0);
    });

    await t.step("render draws the cube with 36 vertices", () => {
      backend.render({ time: 1000, aspectRatio: 2 });
      assertEquals(fakeDevice.submissions.length, 1);
      assertEquals(
        fakeDevice.events.filter((event) => event.startsWith("draw:")),
        ["draw:36"],
      );
    });

    await t.step("render gives the frame values to the cube", () => {
      backend.render({ time: 2000, aspectRatio: 3 });
      assertEquals(fakeDevice.writes.at(-1)?.data, [2, 3]);
    });

    await t.step("a second WebGPU fails, because Graphics exists", () => {
      assertThrows(
        () => new WebGPU(fakeDevice.device, createFakeSurface().surface),
        Error,
        "Graphics exists already.",
      );
    });
  } finally {
    restore();
  }
});
