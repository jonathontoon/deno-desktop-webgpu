// All fixed values of the program. A class must not hold a magic value.

/** Time between two frames, in milliseconds. About 60 frames each second. */
export const FRAME_MS = 1000 / 60;

export const MS_PER_SECOND = 1000;

export const WINDOW_OPTIONS = {
  title: "Deno Desktop WebGPU",
  width: 800,
  height: 600,
} as const;

export const CANVAS_ALPHA_MODE: GPUCanvasAlphaMode = "opaque";

export const CLEAR_COLOR: GPUColorDict = { r: 0.05, g: 0.05, b: 0.1, a: 1 };

export const VERTEX_ENTRY_POINT = "vertexMain";
export const FRAGMENT_ENTRY_POINT = "fragmentMain";

export const TRIANGLE_VERTEX_COUNT = 3;

/** The rotation angle and the aspect ratio of the window. */
export const TRIANGLE_UNIFORM_FLOAT_COUNT = 2;
