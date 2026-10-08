/**
 * Unit tests that check that the GLSL shader has the same numbers and the same
 * corner table as the WGSL shader.
 *
 * @module
 */
import { assertEquals } from "@std/assert";
import CUBE_WGSL from "../scene/cube.wgsl" with { type: "text" };
import CUBE_VERTEX_GLSL from "./cube.vertex.glsl" with { type: "text" };

/** The names of the numbers that both shader files must have. */
const NAMES = [
  "HALF_EDGE",
  "CAMERA_DISTANCE",
  "NEAR",
  "FAR",
  "FOCAL_LENGTH",
  "TILT_RATIO",
];

/** Read the value of `const NAME = value;` or `const float NAME = value;`. */
function readNumber(source: string, name: string): number {
  const match = source.match(
    new RegExp(`const (?:float )?${name} = ([0-9.]+);`),
  );
  if (!match) {
    throw new Error(`The shader has no number named ${name}.`);
  }
  return Number(match[1]);
}

/** Read the numbers of the table of corners. */
function readCorners(source: string): number[] {
  const list =
    source.match(/CORNERS(?:\[36\])? = (?:array<u32, 36>|int\[36\])\(([^)]*)\)/)
      ?.[1] ?? "";
  return list.split(",").map((text) => text.trim()).filter(Boolean).map(Number);
}

Deno.test("the GLSL shader has the same numbers as the WGSL shader", () => {
  for (const name of NAMES) {
    assertEquals(
      readNumber(CUBE_VERTEX_GLSL, name),
      readNumber(CUBE_WGSL, name),
      name,
    );
  }
});

Deno.test("the GLSL shader has the same corner table as the WGSL shader", () => {
  const corners = readCorners(CUBE_WGSL);
  assertEquals(corners.length, 36);
  assertEquals(readCorners(CUBE_VERTEX_GLSL), corners);
});
