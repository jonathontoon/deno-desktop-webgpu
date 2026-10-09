/**
 * Unit tests for `Triangle` and its shader file.
 *
 * @module
 */
import {
  assertAlmostEquals,
  assertEquals,
  assertStringIncludes,
} from "@std/assert";
import {
  FRAGMENT_ENTRY_POINT,
  MS_PER_SECOND,
  TRIANGLE_ANGLE_PERIOD,
  TRIANGLE_OFFSET_X,
  TRIANGLE_UNIFORM_FLOAT_COUNT,
  VERTEX_ENTRY_POINT,
} from "../../constants.ts";
import type { Graphics } from "../gpu/graphics.ts";
import { createFakeDevice, fake } from "../../testing/fakes.ts";
import TRIANGLE_SHADER from "./triangle.wgsl" with { type: "text" };
import { Triangle } from "./triangle.ts";

const FLOAT_BYTES = 4;

/** Make a triangle with a fake device. */
function createTriangle() {
  const gpu = createFakeDevice();
  const context = fake<Graphics>({
    device: gpu.device,
    format: "bgra8unorm",
  });
  return { gpu, triangle: new Triangle(context) };
}

Deno.test("the shader file has the entry points that the constants name", () => {
  assertStringIncludes(TRIANGLE_SHADER, `fn ${VERTEX_ENTRY_POINT}(`);
  assertStringIncludes(TRIANGLE_SHADER, `fn ${FRAGMENT_ENTRY_POINT}(`);
});

Deno.test("the shader file has the uniform fields that the class writes", () => {
  assertStringIncludes(TRIANGLE_SHADER, "angle: f32");
  assertStringIncludes(TRIANGLE_SHADER, "aspectRatio: f32");
  assertStringIncludes(TRIANGLE_SHADER, "offsetX: f32");
});

Deno.test("the triangle uses the shader file and the pixel format", () => {
  const { gpu } = createTriangle();
  assertEquals(gpu.shaderModuleDescriptors, [{ code: TRIANGLE_SHADER }]);
  assertEquals(gpu.pipelineDescriptors[0].fragment?.targets, [
    { format: "bgra8unorm" },
  ]);
});

Deno.test("the triangle makes a buffer for its uniform values", () => {
  const { gpu } = createTriangle();
  assertEquals(
    gpu.bufferDescriptors[0].size,
    TRIANGLE_UNIFORM_FLOAT_COUNT * FLOAT_BYTES,
  );
});

Deno.test("the triangle draws 3 vertices", () => {
  const { gpu, triangle } = createTriangle();
  gpu.events.length = 0;
  triangle.draw(gpu.pass, { time: 0, aspectRatio: 1 });
  assertEquals(gpu.events.at(-1), "draw:3");
});

Deno.test("the angle is the time in seconds", () => {
  const { gpu, triangle } = createTriangle();
  triangle.draw(gpu.pass, { time: 2000, aspectRatio: 1.5 });
  assertEquals(gpu.writes[0].data[0], 2);
});

Deno.test("the aspect ratio goes to the second uniform value", () => {
  const { gpu, triangle } = createTriangle();
  triangle.draw(gpu.pass, { time: 2000, aspectRatio: 1.5 });
  assertEquals(gpu.writes[0].data[1], 1.5);
});

Deno.test("the offset goes to the third uniform value", () => {
  const { gpu, triangle } = createTriangle();
  triangle.draw(gpu.pass, { time: 2000, aspectRatio: 1.5 });
  assertEquals(gpu.writes[0].data[2], TRIANGLE_OFFSET_X);
});

Deno.test("the angle stays below the angle period after a long time", () => {
  const { gpu, triangle } = createTriangle();
  const seconds = 100 * 3600 + 1;
  triangle.draw(gpu.pass, { time: seconds * MS_PER_SECOND, aspectRatio: 1 });
  const angle = gpu.writes[0].data[0];
  assertEquals(angle >= 0 && angle < TRIANGLE_ANGLE_PERIOD, true);
  assertAlmostEquals(angle, seconds % TRIANGLE_ANGLE_PERIOD, 1e-4);
});
