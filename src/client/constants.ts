/**
 * The fixed values of the page. A class must not hold a magic value.
 * A magic value is a number or a text that has no name.
 *
 * @module
 */

/** The number of milliseconds in one second. */
export const MS_PER_SECOND = 1000;

/** How the window mixes with the desktop behind it. `"opaque"` means that it does not show the desktop. */
export const CANVAS_ALPHA_MODE: GPUCanvasAlphaMode = "opaque";

/** Which GPU the program asks for. `"high-performance"` asks for the fast GPU on a computer that has more than one. */
export const GPU_POWER_PREFERENCE: GPUPowerPreference = "high-performance";

/** The number of samples for each pixel. More samples make smooth edges. 4 is the number that every GPU supports. */
export const SAMPLE_COUNT = 4;

/** The color that fills the window before each frame. Each value is from 0 to 1. */
export const CLEAR_COLOR: GPUColorDict = { r: 0, g: 0, b: 0, a: 1 };

/** The name of the vertex function in each shader file. */
export const VERTEX_ENTRY_POINT = "vertexMain";

/** The name of the fragment function in each shader file. */
export const FRAGMENT_ENTRY_POINT = "fragmentMain";

/** The `id` of the `<canvas>` element that WebGPU draws to. */
export const CANVAS_ELEMENT_ID = "canvas";

/** The `id` of the element that shows a start-up error to the user. */
export const ERROR_ELEMENT_ID = "error";

/** The `id` of the element that shows the numbers of the meter. */
export const METER_ELEMENT_ID = "meter";

/** How often the meter counts a timer tick, in milliseconds. */
export const METER_TICK_MS = 100;

/** How often the meter shows the numbers, in milliseconds. */
export const METER_INTERVAL_MS = 1000;

/** How often the page asks the server for changes in development mode, in milliseconds. */
export const RELOAD_INTERVAL_MS = 500;

/** The box that the `ResizeObserver` of the canvas watches: device pixels. */
export const CANVAS_OBSERVED_BOX: ResizeObserverOptions = {
  box: "device-pixel-content-box",
};

/** The number of corner points (vertices) of a cube: 6 faces, 2 triangles each, 3 vertices each. */
export const CUBE_VERTEX_COUNT = 36;

/** The number of numbers that the cube shader reads: the 16 numbers of one 4 by 4 matrix. */
export const CUBE_UNIFORM_FLOAT_COUNT = 16;

/** How fast the cube tips forward, compared with how fast it turns. */
export const CUBE_TILT_RATIO = 0.6;

/** The distance from the camera to the center of the cube. */
export const CUBE_CAMERA_DISTANCE = 2;

/** The near plane of the view. The GPU draws only what is between the near plane and the far plane. */
export const CUBE_NEAR_PLANE = 0.1;

/** The far plane of the view. */
export const CUBE_FAR_PLANE = 10;

/** 1 divided by tan(30 degrees). The field of view is 60 degrees. */
export const CUBE_FOCAL_LENGTH = 1 / Math.tan(Math.PI / 6);
