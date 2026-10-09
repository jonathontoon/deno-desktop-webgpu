/**
 * Unit tests for `selectBackend`.
 *
 * @module
 */
import {
  assertAlmostEquals,
  assertEquals,
  assertInstanceOf,
  assertRejects,
} from "@std/assert";
import { CUBE_FOCAL_LENGTH, CUBE_UNIFORM_FLOAT_COUNT } from "./constants.ts";
import {
  createFakeDevice,
  createFakeSurface,
  installFakeNavigatorGPU,
} from "../testing/fakes.ts";
import { WebGPU } from "./gpu/webgpu.ts";
import { selectBackend } from "./backend.ts";

Deno.test("selectBackend", async (t) => {
  const fakeDevice = createFakeDevice();

  await t.step("fails when no WebGPU adapter exists", async () => {
    const restore = installFakeNavigatorGPU({
      device: fakeDevice.device,
      hasAdapter: false,
    });
    try {
      await assertRejects(
        () => selectBackend(createFakeSurface().surface),
        Error,
        "No WebGPU adapter is available.",
      );
    } finally {
      restore();
    }
  });

  await t.step("gives a WebGPU backend that draws the cube", async () => {
    const restore = installFakeNavigatorGPU({ device: fakeDevice.device });
    try {
      const backend = await selectBackend(createFakeSurface().surface);
      assertInstanceOf(backend, WebGPU);
      assertEquals(fakeDevice.submissions.length, 0);

      backend.render({ time: 1000, aspectRatio: 2 });
      assertEquals(fakeDevice.submissions.length, 1);
      assertEquals(
        fakeDevice.events.filter((event) => event.startsWith("draw:")),
        ["draw:36"],
      );

      backend.render({ time: 2000, aspectRatio: 3 });
      const matrix = fakeDevice.writes.at(-1)?.data ?? [];
      assertEquals(matrix.length, CUBE_UNIFORM_FLOAT_COUNT);
      // The first number is cos(angle) * focal length / aspect ratio.
      assertAlmostEquals(matrix[0], Math.cos(2) * CUBE_FOCAL_LENGTH / 3, 1e-6);
    } finally {
      restore();
    }
  });

  await t.step("a second backend fails, because Graphics exists", async () => {
    const restore = installFakeNavigatorGPU({ device: fakeDevice.device });
    try {
      await assertRejects(
        () => selectBackend(createFakeSurface().surface),
        Error,
        "Graphics exists already.",
      );
    } finally {
      restore();
    }
  });
});
