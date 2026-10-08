/**
 * Unit tests for `selectBackend`.
 *
 * @module
 */
import {
  assertEquals,
  assertInstanceOf,
  assertRejects,
  assertStrictEquals,
} from "@std/assert";
import {
  createFakeDevice,
  createFakeGL,
  createFakeSurface,
  installFakeNavigatorGPU,
} from "../../testing/fakes.ts";
import { WebGL2 } from "../gl/webgl2.ts";
import { WebGPU } from "../gpu/webgpu.ts";
import { selectBackend } from "./backend.ts";

Deno.test("selectBackend", async (t) => {
  const fakeDevice = createFakeDevice();

  await t.step(
    "fails when neither WebGPU nor WebGL2 is available",
    async () => {
      const restore = installFakeNavigatorGPU({
        device: fakeDevice.device,
        hasAdapter: false,
      });
      try {
        const fakeSurface = createFakeSurface();
        const error = await assertRejects(
          () => selectBackend(fakeSurface.surface),
          Error,
          "WebGPU or WebGL2 is required.",
        );
        // The canvas got no WebGPU context, so WebGL2 could still use it.
        assertEquals(fakeSurface.requestedKinds, ["webgl2"]);
        assertInstanceOf(error.cause, Error);
        assertEquals(error.cause.message, "No WebGPU adapter is available.");
      } finally {
        restore();
      }
    },
  );

  await t.step("gives a WebGL2 backend when there is no adapter", async () => {
    const restore = installFakeNavigatorGPU({
      device: fakeDevice.device,
      hasAdapter: false,
    });
    try {
      const fakeSurface = createFakeSurface({ webgl2: createFakeGL().gl });
      const backend = await selectBackend(fakeSurface.surface);
      assertInstanceOf(backend, WebGL2);
      assertEquals(backend.kind, "webgl2");
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
      assertStrictEquals(WebGPU.shared, backend);
    } finally {
      restore();
    }
  });
});
