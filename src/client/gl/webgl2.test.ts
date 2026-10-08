/**
 * Unit tests for `WebGL2`.
 *
 * @module
 */
import { assertEquals, assertStrictEquals, assertThrows } from "@std/assert";
import { CLEAR_COLOR, CUBE_VERTEX_COUNT } from "../../constants.ts";
import { createFakeGL, createFakeSurface } from "../../testing/fakes.ts";
import CUBE_FRAGMENT_SHADER from "./cube.fragment.glsl" with { type: "text" };
import CUBE_VERTEX_SHADER from "./cube.vertex.glsl" with { type: "text" };
import { WebGL2 } from "./webgl2.ts";

Deno.test("WebGL2", async (t) => {
  await t.step("shared fails before a WebGL2 exists", () => {
    assertThrows(() => WebGL2.shared, Error, "WebGL2 is not initialized.");
  });

  await t.step("the constructor fails when a shader does not compile", () => {
    const { gl } = createFakeGL({ compiles: false });
    assertThrows(
      () => new WebGL2(gl, createFakeSurface().surface),
      Error,
      "Could not compile the shader: bad shader",
    );
  });

  await t.step("the constructor fails when the program does not link", () => {
    const { gl } = createFakeGL({ links: false });
    assertThrows(
      () => new WebGL2(gl, createFakeSurface().surface),
      Error,
      "Could not link the program: bad program",
    );
  });

  const fakeGL = createFakeGL();
  const fakeSurface = createFakeSurface();
  const backend = new WebGL2(fakeGL.gl, fakeSurface.surface);

  await t.step("the kind is webgl2", () => {
    assertEquals(backend.kind, "webgl2");
  });

  await t.step("shared gives the instance", () => {
    assertStrictEquals(WebGL2.shared, backend);
  });

  await t.step("the constructor compiles the two shader files", () => {
    assertEquals(fakeGL.sources, [CUBE_VERTEX_SHADER, CUBE_FRAGMENT_SHADER]);
  });

  await t.step("the constructor hides the faces that point away", () => {
    const { gl, events } = fakeGL;
    assertEquals(events.includes(`enable:${gl.CULL_FACE}`), true);
    assertEquals(events.includes(`cullFace:${gl.BACK}`), true);
    assertEquals(events.includes(`frontFace:${gl.CW}`), true);
  });

  await t.step("the constructor sets the clear color", () => {
    const { r, g, b, a } = CLEAR_COLOR;
    assertEquals(
      fakeGL.events.includes(`clearColor:${r},${g},${b},${a}`),
      true,
    );
  });

  await t.step("the constructor draws nothing", () => {
    assertEquals(
      fakeGL.events.some((event) => event.startsWith("drawArrays")),
      false,
    );
  });

  await t.step("render draws the cube with 36 vertices", () => {
    fakeGL.events.length = 0;
    backend.render({ time: 2000, aspectRatio: 1.5 });
    assertEquals(fakeGL.events, [
      "viewport:0,0,300,150",
      `clear:${fakeGL.gl.COLOR_BUFFER_BIT}`,
      "uniform1f:uAngle",
      "uniform1f:uAspectRatio",
      `drawArrays:${fakeGL.gl.TRIANGLES},0,${CUBE_VERTEX_COUNT}`,
    ]);
  });

  await t.step("render gives the angle and the aspect ratio", () => {
    assertEquals(fakeGL.uniforms.get("uAngle"), 2);
    assertEquals(fakeGL.uniforms.get("uAspectRatio"), 1.5);
  });

  await t.step("render uses the size of the canvas", () => {
    fakeSurface.surface.width = 800;
    fakeSurface.surface.height = 600;
    fakeGL.events.length = 0;
    backend.render({ time: 0, aspectRatio: 4 / 3 });
    assertEquals(fakeGL.events[0], "viewport:0,0,800,600");
  });

  await t.step("a second WebGL2 fails", () => {
    assertThrows(
      () => new WebGL2(createFakeGL().gl, createFakeSurface().surface),
      Error,
      "WebGL2 exists already.",
    );
  });
});
