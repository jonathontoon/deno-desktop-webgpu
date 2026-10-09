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

/** The color that fills the window before each frame. Each value is from 0 to 1. */
export const CLEAR_COLOR: GPUColorDict = { r: 0, g: 0, b: 0, a: 1 };

/** The name of the vertex function in each shader file. */
export const VERTEX_ENTRY_POINT = "vertexMain";

/** The name of the fragment function in each shader file. */
export const FRAGMENT_ENTRY_POINT = "fragmentMain";

/** The number of corner points (vertices) of a triangle. */
export const TRIANGLE_VERTEX_COUNT = 3;

/** The number of numbers that the triangle shader reads: the rotation angle, the aspect ratio of the window, and the offset to the right. */
export const TRIANGLE_UNIFORM_FLOAT_COUNT = 3;

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

/** How far the triangle moves to the right, in screen units. A negative value moves it to the left. */
export const TRIANGLE_OFFSET_X: number = -0.5;

/** The number of corner points (vertices) of a cube: 6 faces, 2 triangles each, 3 vertices each. */
export const CUBE_VERTEX_COUNT = 36;

/** The number of numbers that the cube shader reads: the rotation angle and the aspect ratio of the window. */
export const CUBE_UNIFORM_FLOAT_COUNT = 2;

/** How fast the cube tips forward, compared with how fast it turns. The shader file has the same value. */
export const CUBE_TILT_RATIO = 0.6;

/**
 * The angle after which the turn and the tip of the cube repeat, in radians.
 * The cube turns one time at 2π and tips 3 times at 10π. So both repeat at 10π.
 * The cube gets the angle modulo this value. A large angle then does not lose
 * precision in the `f32` number of the shader.
 */
export const CUBE_ANGLE_PERIOD = 10 * Math.PI;

/** The angle after which the turn of the triangle repeats, in radians. */
export const TRIANGLE_ANGLE_PERIOD = 2 * Math.PI;
