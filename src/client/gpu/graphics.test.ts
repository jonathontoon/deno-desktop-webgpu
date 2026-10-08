/**
 * Unit tests for `Graphics` and `requestDevice`.
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
import { Graphics, requestDevice } from "./graphics.ts";

Deno.test("requestDevice", async (t) => {
  await t.step("gives the device of the adapter", async () => {
    const { device } = createFakeDevice();
    const restore = installFakeNavigatorGPU({ device });
    try {
      assertStrictEquals(await requestDevice(), device);
    } finally {
      restore();
    }
  });

  await t.step("fails when WebGPU is not available", async () => {
    const original = Object.getOwnPropertyDescriptor(navigator, "gpu");
    Object.defineProperty(navigator, "gpu", {
      configurable: true,
      value: undefined,
    });
    try {
      await assertRejects(
        () => requestDevice(),
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

  await t.step("fails when no adapter exists", async () => {
    const restore = installFakeNavigatorGPU({
      device: createFakeDevice().device,
      hasAdapter: false,
    });
    try {
      await assertRejects(
        () => requestDevice(),
        Error,
        "No WebGPU adapter is available.",
      );
    } finally {
      restore();
    }
  });
});

Deno.test("Graphics", async (t) => {
  await t.step("shared fails before a Graphics exists", () => {
    assertThrows(
      () => Graphics.shared,
      Error,
      "Graphics is not initialized.",
    );
  });

  const fakeDevice = createFakeDevice();
  const restore = installFakeNavigatorGPU({
    device: fakeDevice.device,
    format: "rgba8unorm",
  });
  try {
    await t.step("the constructor fails when the canvas has no context", () => {
      assertThrows(
        () => new Graphics(fakeDevice.device, createFakeSurface(false).surface),
        Error,
        "Could not create a WebGPU context for the window.",
      );
    });

    const fakeSurface = createFakeSurface();
    const graphics = new Graphics(fakeDevice.device, fakeSurface.surface);

    await t.step(
      "the constructor keeps the device and the pixel format",
      () => {
        assertStrictEquals(graphics.device, fakeDevice.device);
        assertEquals(graphics.format, "rgba8unorm");
      },
    );

    await t.step("the constructor configures the context of the canvas", () => {
      assertEquals(fakeSurface.configurations, [{
        device: fakeDevice.device,
        format: "rgba8unorm",
        alphaMode: "opaque",
      }]);
    });

    await t.step("shared gives the instance", () => {
      assertStrictEquals(Graphics.shared, graphics);
    });

    await t.step("a second Graphics fails and leaves the canvas alone", () => {
      const secondSurface = createFakeSurface();
      assertThrows(
        () => new Graphics(fakeDevice.device, secondSurface.surface),
        Error,
        "Graphics exists already.",
      );
      assertEquals(secondSurface.configurations, []);
    });

    await t.step("currentView gives a view of the current texture", () => {
      assertStrictEquals(graphics.currentView(), fakeSurface.view);
    });
  } finally {
    restore();
  }
});
