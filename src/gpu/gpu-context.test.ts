/**
 * Unit tests for `GPUContext`.
 *
 * @module
 */
import {
  assertEquals,
  assertRejects,
  assertStrictEquals,
  assertThrows,
} from "@std/assert";
import {
  createFakeDevice,
  createFakeSurface,
  installFakeNavigatorGPU,
} from "../testing/fakes.ts";
import { GPUContext } from "./gpu-context.ts";

Deno.test("GPUContext", async (t) => {
  await t.step("shared fails before initialize", () => {
    assertThrows(
      () => GPUContext.shared,
      Error,
      "GPUContext is not initialized.",
    );
  });

  await t.step("initialize fails when no adapter exists", async () => {
    const restore = installFakeNavigatorGPU({
      device: createFakeDevice().device,
      hasAdapter: false,
    });
    try {
      await assertRejects(
        () => GPUContext.initialize(createFakeSurface().surface),
        Error,
        "No WebGPU adapter is available.",
      );
    } finally {
      restore();
    }
  });

  await t.step("initialize fails when the window has no context", async () => {
    const restore = installFakeNavigatorGPU({
      device: createFakeDevice().device,
    });
    try {
      await assertRejects(
        () => GPUContext.initialize(createFakeSurface(false).surface),
        Error,
        "Could not create a WebGPU context for the window.",
      );
    } finally {
      restore();
    }
  });

  const fakeDevice = createFakeDevice();
  const fakeSurface = createFakeSurface();
  const restore = installFakeNavigatorGPU({
    device: fakeDevice.device,
    format: "rgba8unorm",
  });
  let gpu: GPUContext;
  try {
    gpu = await GPUContext.initialize(fakeSurface.surface);
  } finally {
    restore();
  }

  await t.step("initialize keeps the device and the pixel format", () => {
    assertStrictEquals(gpu.device, fakeDevice.device);
    assertEquals(gpu.format, "rgba8unorm");
  });

  await t.step("initialize configures the context of the window", () => {
    assertEquals(fakeSurface.configurations, [{
      device: fakeDevice.device,
      format: "rgba8unorm",
      alphaMode: "opaque",
    }]);
  });

  await t.step("shared gives the instance from initialize", () => {
    assertStrictEquals(GPUContext.shared, gpu);
  });

  await t.step("initialize fails the second time", async () => {
    let adapterRequests = 0;
    const again = installFakeNavigatorGPU({
      device: fakeDevice.device,
      onRequestAdapter: () => adapterRequests++,
    });
    const secondSurface = createFakeSurface();
    try {
      await assertRejects(
        () => GPUContext.initialize(secondSurface.surface),
        Error,
        "GPUContext exists already.",
      );
    } finally {
      again();
    }
    // The failed call must not ask for a GPU or touch the second window.
    assertEquals(adapterRequests, 0);
    assertEquals(secondSurface.configurations, []);
  });

  await t.step("currentView gives a view of the current texture", () => {
    assertStrictEquals(gpu.currentView(), fakeSurface.view);
  });
});
