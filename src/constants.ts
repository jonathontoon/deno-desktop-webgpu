/**
 * All fixed values of the program. A class must not hold a magic value.
 * A magic value is a number or a text that has no name.
 *
 * @module
 */

/**
 * Time between two frames, in milliseconds.
 * The value gives about 60 frames each second.
 */
export const FRAME_MS = 1000 / 60;

/** The number of milliseconds in one second. */
export const MS_PER_SECOND = 1000;

/** The title and the size (in pixels) of the window when the program starts. */
export const WINDOW_OPTIONS = {
  title: "Deno Desktop WebGPU",
  width: 800,
  height: 600,
} as const;

/** How the window mixes with the desktop behind it. `"opaque"` means that it does not show the desktop. */
export const CANVAS_ALPHA_MODE: GPUCanvasAlphaMode = "opaque";

/** The color that fills the window before each frame. Each value is from 0 to 1. */
export const CLEAR_COLOR: GPUColorDict = { r: 0.05, g: 0.05, b: 0.1, a: 1 };

/** The name of the vertex function in each shader file. */
export const VERTEX_ENTRY_POINT = "vertexMain";

/** The name of the fragment function in each shader file. */
export const FRAGMENT_ENTRY_POINT = "fragmentMain";

/** The number of corner points (vertices) of a triangle. */
export const TRIANGLE_VERTEX_COUNT = 3;

/** The number of numbers that the triangle shader reads: the rotation angle and the aspect ratio of the window. */
export const TRIANGLE_UNIFORM_FLOAT_COUNT = 2;
