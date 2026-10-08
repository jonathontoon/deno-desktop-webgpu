/**
 * All fixed values of the program. A class must not hold a magic value.
 * A magic value is a number or a text that has no name.
 *
 * @module
 */

/** The number of milliseconds in one second. */
export const MS_PER_SECOND = 1000;

/** The title and the size of the window when the program starts. */
export const WINDOW_OPTIONS = {
  title: "WebGPU",
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

/** The number of numbers that the triangle shader reads: the rotation angle, the aspect ratio of the window, and the offset to the right. */
export const TRIANGLE_UNIFORM_FLOAT_COUNT = 3;

/** The `id` of the `<canvas>` element that WebGPU draws to. */
export const CANVAS_ELEMENT_ID = "canvas";

/** The `id` of the element that shows a start-up error to the user. */
export const ERROR_ELEMENT_ID = "error";

/** The `id` of the element that shows the name of the drawing method. */
export const BACKEND_ELEMENT_ID = "backend";

/** The `id` of the element that shows the number of frames each second. */
export const FPS_ELEMENT_ID = "fps";

/** How long the meter counts frames before it shows a number, in milliseconds. */
export const FPS_INTERVAL_MS = 500;

/** The argument that `deno task dev` gives to the app to turn on development mode. */
export const DEV_ARGUMENT = "dev";

/** The attribute that the server adds to the `<body>` of the page in development mode. */
export const DEV_ATTRIBUTE = "data-development";

/** The path of the web page. */
export const PAGE_PATH = "/";

/** The path of the style sheet that the page loads. */
export const STYLES_PATH = "/styles.css";

/** The path of the script that the page loads. */
export const CLIENT_SCRIPT_PATH = "/client.js";

/** The media type of the web page. */
export const HTML_CONTENT_TYPE = "text/html; charset=utf-8";

/** The media type of the style sheet of the page. */
export const CSS_CONTENT_TYPE = "text/css; charset=utf-8";

/** The media type of the script of the page. */
export const SCRIPT_CONTENT_TYPE = "text/javascript; charset=utf-8";

/** The HTTP status code for a path that has no content. */
export const HTTP_NOT_FOUND = 404;

/** The box that the `ResizeObserver` of the canvas watches: device pixels. */
export const CANVAS_OBSERVED_BOX: ResizeObserverOptions = {
  box: "device-pixel-content-box",
};

/** The box that the `ResizeObserver` watches when the web view has no device pixel box: CSS pixels. */
export const CANVAS_OBSERVED_BOX_FALLBACK: ResizeObserverOptions = {
  box: "content-box",
};

/** How far the triangle moves to the right, in screen units. A negative value moves it to the left. */
export const TRIANGLE_OFFSET_X: number = -0.5;

/** The number of corner points (vertices) of a cube: 6 faces, 2 triangles each, 3 vertices each. */
export const CUBE_VERTEX_COUNT = 36;

/** The number of numbers that the cube shader reads: the rotation angle and the aspect ratio of the window. */
export const CUBE_UNIFORM_FLOAT_COUNT = 2;

/** How fast the cube tips forward, compared with how fast it turns. */
export const CUBE_TILT_RATIO = 0.6;
