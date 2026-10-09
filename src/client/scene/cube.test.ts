/**
 * Unit tests for `Cube` and its shader file.
 *
 * @module
 */
import {
  assertAlmostEquals,
  assertEquals,
  assertStringIncludes,
} from "@std/assert";
import {
  CUBE_ANGLE_PERIOD,
  CUBE_TILT_RATIO,
  CUBE_UNIFORM_FLOAT_COUNT,
  CUBE_VERTEX_COUNT,
  FRAGMENT_ENTRY_POINT,
  MS_PER_SECOND,
  VERTEX_ENTRY_POINT,
} from "../../constants.ts";
import type { Graphics } from "../gpu/graphics.ts";
import { createFakeDevice, fake } from "../../testing/fakes.ts";
import CUBE_SHADER from "./cube.wgsl" with { type: "text" };
import { Cube } from "./cube.ts";

const FLOAT_BYTES = 4;

/** Make a cube with a fake device. */
function createCube() {
  const gpu = createFakeDevice();
  const context = fake<Graphics>({
    device: gpu.device,
    format: "bgra8unorm",
  });
  return { gpu, cube: new Cube(context) };
}

Deno.test("the shader file has the entry points that the constants name", () => {
  assertStringIncludes(CUBE_SHADER, `fn ${VERTEX_ENTRY_POINT}(`);
  assertStringIncludes(CUBE_SHADER, `fn ${FRAGMENT_ENTRY_POINT}(`);
});

Deno.test("the shader file has the uniform fields that the class writes", () => {
  assertStringIncludes(CUBE_SHADER, "angle: f32");
  assertStringIncludes(CUBE_SHADER, "aspectRatio: f32");
});

/** Read the 36 corner numbers of the faces from the shader file. */
function readFaceCorners(): number[] {
  const list = CUBE_SHADER.match(/array<u32, 36>\(([^)]*)\)/)?.[1] ?? "";
  return list.split(",").map((text) => text.trim()).filter(Boolean).map(Number);
}

/** Give the position of a corner: each of x, y, and z is -0.5 or 0.5. */
function cornerPosition(corner: number): [number, number, number] {
  return [
    (corner & 1) - 0.5,
    ((corner >> 1) & 1) - 0.5,
    ((corner >> 2) & 1) - 0.5,
  ];
}

Deno.test("the shader file has 12 triangles with corners from 0 to 7", () => {
  const corners = readFaceCorners();
  assertEquals(corners.length, CUBE_VERTEX_COUNT);
  assertEquals(
    corners.every((n) => Number.isInteger(n) && n >= 0 && n < 8),
    true,
  );
});

Deno.test("each triangle goes around the same way when seen from outside", () => {
  const corners = readFaceCorners();
  const normals = new Map<string, number>();
  for (let start = 0; start < corners.length; start += 3) {
    const [a, b, c] = corners.slice(start, start + 3).map(cornerPosition);
    const ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
    const ac = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    const normal = [
      ab[1] * ac[2] - ab[2] * ac[1],
      ab[2] * ac[0] - ab[0] * ac[2],
      ab[0] * ac[1] - ab[1] * ac[0],
    ];
    const center = [0, 1, 2].map((k) => (a[k] + b[k] + c[k]) / 3);
    // The normal points away from the center of the cube.
    const outward = normal[0] * center[0] + normal[1] * center[1] +
      normal[2] * center[2];
    assertEquals(outward > 0, true);
    const key = normal.map((value) => Math.sign(value)).join(",");
    normals.set(key, (normals.get(key) ?? 0) + 1);
  }
  // 6 faces, 2 triangles each.
  assertEquals(normals.size, 6);
  assertEquals([...normals.values()], [2, 2, 2, 2, 2, 2]);
});

Deno.test("the cube uses the shader file and the pixel format", () => {
  const { gpu } = createCube();
  assertEquals(gpu.shaderModuleDescriptors, [{ code: CUBE_SHADER }]);
  assertEquals(gpu.pipelineDescriptors[0].fragment?.targets, [
    { format: "bgra8unorm" },
  ]);
});

Deno.test("the cube does not draw the faces that point away", () => {
  const { gpu } = createCube();
  assertEquals(gpu.pipelineDescriptors[0].primitive, {
    topology: "triangle-list",
    cullMode: "back",
    frontFace: "cw",
  });
});

Deno.test("the cube makes a buffer for its uniform values", () => {
  const { gpu } = createCube();
  assertEquals(
    gpu.bufferDescriptors[0].size,
    CUBE_UNIFORM_FLOAT_COUNT * FLOAT_BYTES,
  );
});

Deno.test("the cube draws 36 vertices", () => {
  const { gpu, cube } = createCube();
  gpu.events.length = 0;
  cube.draw(gpu.pass, { time: 0, aspectRatio: 1 });
  assertEquals(gpu.events.at(-1), "draw:36");
});

Deno.test("the uniform values are the angle and the aspect ratio", () => {
  const { gpu, cube } = createCube();
  cube.draw(gpu.pass, { time: 2000, aspectRatio: 1.5 });
  assertEquals(gpu.writes[0].data, [2, 1.5]);
});

Deno.test("the shader file has the tilt ratio of the constants", () => {
  const ratio = CUBE_SHADER.match(/const TILT_RATIO = ([\d.]+);/)?.[1];
  assertEquals(Number(ratio), CUBE_TILT_RATIO);
});

Deno.test("the turn and the tip both repeat after the angle period", () => {
  const turns = CUBE_ANGLE_PERIOD / (2 * Math.PI);
  const tips = CUBE_ANGLE_PERIOD * CUBE_TILT_RATIO / (2 * Math.PI);
  assertAlmostEquals(turns, Math.round(turns), 1e-9);
  assertAlmostEquals(tips, Math.round(tips), 1e-9);
});

Deno.test("the angle stays below the angle period after a long time", () => {
  const { gpu, cube } = createCube();
  const seconds = 100 * 3600 + 1;
  cube.draw(gpu.pass, { time: seconds * MS_PER_SECOND, aspectRatio: 1 });
  const angle = gpu.writes[0].data[0];
  assertEquals(angle >= 0 && angle < CUBE_ANGLE_PERIOD, true);
  assertAlmostEquals(angle, seconds % CUBE_ANGLE_PERIOD, 1e-4);
});

Deno.test("the angle is the same one period later", () => {
  const { gpu, cube } = createCube();
  const period = CUBE_ANGLE_PERIOD * MS_PER_SECOND;
  cube.draw(gpu.pass, { time: 3000, aspectRatio: 1 });
  cube.draw(gpu.pass, { time: 3000 + period, aspectRatio: 1 });
  assertAlmostEquals(gpu.writes[1].data[0], gpu.writes[0].data[0], 1e-6);
});
