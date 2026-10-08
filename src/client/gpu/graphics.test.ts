/**
 * Unit tests for `Graphics`.
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
} from "../../testing/fakes.ts";
import { Graphics } from "./graphics.ts";

Deno.test("Graphics", async (t) => {
  await t.step("shared fails before initialize", () => {
    assertThrows(
      () => Graphics.shared,
      Error,
      "Graphics is not initialized.",
    );
  });

  await t.step("initialize fails when WebGPU is not available", async () => {
    const original = Object.getOwnPropertyDescriptor(navigator, "gpu");
    Object.defineProperty(navigator, "gpu", {
      configurable: true,
      value: undefined,
    });
    try {
      await assertRejects(
        () => Graphics.initialize(createFakeSurface().surface),
        Error,
        "WebGPU is not available.",
      );
    } finally {
      if (original) {
        Object.defineProperty(navigator, "gpu", original);
      } else {
        delete (navigator as unknown as Record<string, unknown>).gpu;
      }
    }
  });

  await t.step("initialize fails when no adapter exists", async () => {
    const restore = installFakeNavigatorGPU({
      device: createFakeDevice().device,
      hasAdapter: false,
    });
    try {
      await assertRejects(
        () => Graphics.initialize(createFakeSurface().surface),
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
        () => Graphics.initialize(createFakeSurface(false).surface),
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
  let graphics: Graphics;
  try {
    graphics = await Graphics.initialize(fakeSurface.surface);
  } finally {
    restore();
  }

  await t.step("initialize keeps the device and the pixel format", () => {
    assertStrictEquals(graphics.device, fakeDevice.device);
    assertEquals(graphics.format, "rgba8unorm");
  });

  await t.step("initialize configures the context of the window", () => {
    assertEquals(fakeSurface.configurations, [{
      device: fakeDevice.device,
      format: "rgba8unorm",
      alphaMode: "opaque",
    }]);
  });

  await t.step("shared gives the instance from initialize", () => {
    assertStrictEquals(Graphics.shared, graphics);
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
        () => Graphics.initialize(secondSurface.surface),
        Error,
        "Graphics exists already.",
      );
    } finally {
      again();
    }
    // The failed call must not ask for a GPU or touch the second window.
    assertEquals(adapterRequests, 0);
    assertEquals(secondSurface.configurations, []);
  });

  await t.step("currentView gives a view of the current texture", () => {
    assertStrictEquals(graphics.currentView(), fakeSurface.view);
  });
});
