/**
 * Unit tests for `selectBackend`.
 *
 * @module
 */
import { assertEquals, assertInstanceOf, assertRejects } from "@std/assert";
import {
  createFakeDevice,
  createFakeSurface,
  installFakeNavigatorGPU,
} from "../../testing/fakes.ts";
import { WebGPU } from "../gpu/webgpu.ts";
import { selectBackend } from "./backend.ts";

Deno.test("selectBackend", async (t) => {
  const fakeDevice = createFakeDevice();

  await t.step("fails when no adapter exists", async () => {
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

  await t.step("gives a WebGPU backend when WebGPU works", async () => {
    const restore = installFakeNavigatorGPU({ device: fakeDevice.device });
    try {
      const backend = await selectBackend(createFakeSurface().surface);
      assertInstanceOf(backend, WebGPU);
      assertEquals(backend.kind, "webgpu");
    } finally {
      restore();
    }
  });
});
