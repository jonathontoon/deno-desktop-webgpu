/**
 * Unit tests for `createCube` and its shader file.
 *
 * @module
 */
import {
  assertAlmostEquals,
  assertEquals,
  assertStringIncludes,
} from "@std/assert";
import {
  CUBE_CAMERA_DISTANCE,
  CUBE_FAR_PLANE,
  CUBE_FOCAL_LENGTH,
  CUBE_NEAR_PLANE,
  CUBE_TILT_RATIO,
  CUBE_UNIFORM_FLOAT_COUNT,
  CUBE_VERTEX_COUNT,
  FRAGMENT_ENTRY_POINT,
  MS_PER_SECOND,
  VERTEX_ENTRY_POINT,
} from "../constants.ts";
import type { Graphics } from "../gpu/graphics.ts";
import { createFakeDevice, fake } from "../../testing/fakes.ts";
import CUBE_SHADER from "./cube.wgsl" with { type: "text" };
import { createCube } from "./cube.ts";

const FLOAT_BYTES = 4;

/** Make a cube with a fake device. */
function makeCube() {
  const gpu = createFakeDevice();
  const context = fake<Graphics>({
    device: gpu.device,
    format: "bgra8unorm",
    sampleCount: 4,
  });
  return { gpu, cube: createCube(context) };
}

Deno.test("the shader file has the entry points that the constants name", () => {
  assertStringIncludes(CUBE_SHADER, `fn ${VERTEX_ENTRY_POINT}(`);
  assertStringIncludes(CUBE_SHADER, `fn ${FRAGMENT_ENTRY_POINT}(`);
});

Deno.test("the shader file has the uniform fields that the class writes", () => {
  assertStringIncludes(CUBE_SHADER, "transform: mat4x4f");
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
  const { gpu } = makeCube();
  assertEquals(gpu.shaderModuleDescriptors, [{ code: CUBE_SHADER }]);
  assertEquals(gpu.pipelineDescriptors[0].fragment?.targets, [
    { format: "bgra8unorm" },
  ]);
});

Deno.test("the cube does not draw the faces that point away", () => {
  const { gpu } = makeCube();
  assertEquals(gpu.pipelineDescriptors[0].primitive, {
    topology: "triangle-list",
    cullMode: "back",
    frontFace: "cw",
  });
});

Deno.test("the cube draws with the number of samples of the graphics", () => {
  const { gpu } = makeCube();
  assertEquals(gpu.pipelineDescriptors[0].multisample, { count: 4 });
});

Deno.test("the cube makes a buffer for its uniform values", () => {
  const { gpu } = makeCube();
  assertEquals(
    gpu.bufferDescriptors[0].size,
    CUBE_UNIFORM_FLOAT_COUNT * FLOAT_BYTES,
  );
});

Deno.test("the cube draws 36 vertices", () => {
  const { gpu, cube } = makeCube();
  gpu.events.length = 0;
  cube.draw(gpu.pass, { time: 0, aspectRatio: 1 });
  assertEquals(gpu.events.at(-1), "draw:36");
});

/** Read the half edge of the cube from the shader file. */
function readHalfEdge(): number {
  return Number(CUBE_SHADER.match(/const HALF_EDGE = ([\d.]+);/)?.[1]);
}

/** Give the position of each of the 8 corners of the cube, as the shader does. */
function cornerPositions(): [number, number, number][] {
  const edge = 2 * readHalfEdge();
  return [0, 1, 2, 3, 4, 5, 6, 7].map((corner) => [
    ((corner & 1) - 0.5) * edge,
    (((corner >> 1) & 1) - 0.5) * edge,
    (((corner >> 2) & 1) - 0.5) * edge,
  ]);
}

/**
 * Compute the place of a corner in the window, step by step. This is the
 * answer that the matrix must give.
 */
function expectedPosition(
  [x, y, z]: [number, number, number],
  time: number,
  aspectRatio: number,
): number[] {
  const angle = time / MS_PER_SECOND;
  const turned = [
    x * Math.cos(angle) + z * Math.sin(angle),
    y,
    -x * Math.sin(angle) + z * Math.cos(angle),
  ];
  const tip = angle * CUBE_TILT_RATIO;
  const tipped = [
    turned[0],
    turned[1] * Math.cos(tip) - turned[2] * Math.sin(tip),
    turned[1] * Math.sin(tip) + turned[2] * Math.cos(tip),
  ];
  const depth = tipped[2] + CUBE_CAMERA_DISTANCE;
  const range = CUBE_FAR_PLANE - CUBE_NEAR_PLANE;
  return [
    tipped[0] * CUBE_FOCAL_LENGTH / aspectRatio,
    tipped[1] * CUBE_FOCAL_LENGTH,
    depth * CUBE_FAR_PLANE / range - CUBE_FAR_PLANE * CUBE_NEAR_PLANE / range,
    depth,
  ];
}

/** Multiply a corner by a 4 by 4 matrix that is in column order. */
function transform(
  matrix: readonly number[],
  [x, y, z]: [number, number, number],
): number[] {
  const corner = [x, y, z, 1];
  return [0, 1, 2, 3].map((row) =>
    corner.reduce(
      (sum, value, column) => sum + matrix[column * 4 + row] * value,
      0,
    )
  );
}

Deno.test("the uniform values are one matrix of 16 numbers", () => {
  const { gpu, cube } = makeCube();
  cube.draw(gpu.pass, { time: 2000, aspectRatio: 1.5 });
  assertEquals(gpu.writes[0].data.length, CUBE_UNIFORM_FLOAT_COUNT);
});

Deno.test("the matrix puts each corner where the step by step math puts it", () => {
  const times = [0, 1234, 7000, 3600 * MS_PER_SECOND * 30 + 1500];
  const aspectRatios = [1, 0.75, 1.5];
  for (const time of times) {
    for (const aspectRatio of aspectRatios) {
      const { gpu, cube } = makeCube();
      cube.draw(gpu.pass, { time, aspectRatio });
      const matrix = gpu.writes[0].data;
      for (const corner of cornerPositions()) {
        const actual = transform(matrix, corner);
        const expected = expectedPosition(corner, time, aspectRatio);
        actual.forEach((value, index) =>
          assertAlmostEquals(value, expected[index], 1e-5)
        );
      }
    }
  }
});

Deno.test("the cube is in front of the camera", () => {
  const { gpu, cube } = makeCube();
  for (const time of [0, 1234, 7000]) {
    cube.draw(gpu.pass, { time, aspectRatio: 1 });
    const matrix = gpu.writes.at(-1)?.data ?? [];
    for (const corner of cornerPositions()) {
      assertEquals(transform(matrix, corner)[3] > 0, true);
    }
  }
});
