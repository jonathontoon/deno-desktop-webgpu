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

/** The argument that `deno task dev` gives to the app to turn on development mode. */
export const DEV_ARGUMENT = "dev";

/** The arguments of `deno` that bundle the page script into `dist/client.js`. */
export const BUNDLE_ARGUMENTS: readonly string[] = [
  "bundle",
  "--platform",
  "browser",
  "--format",
  "esm",
  "--output",
  "dist/client.js",
  "src/client/main.ts",
];

/** The argument of `deno bundle` that makes it bundle again after each change. */
export const WATCH_ARGUMENT = "--watch";

/** The path of the answer that tells the page if a file of the page changed. */
export const VERSION_PATH = "/version";

/** How often the page asks the server for changes in development mode, in milliseconds. */
export const RELOAD_INTERVAL_MS = 500;

/** The path of the HTML file on the disk, from the folder of the project. */
export const INDEX_HTML_SOURCE = "src/client/index.html";

/** The path of the style sheet on the disk, from the folder of the project. */
export const STYLES_SOURCE = "src/client/styles.css";

/** The path of the bundled page script on the disk, from the folder of the project. */
export const CLIENT_SCRIPT_SOURCE = "dist/client.js";

/**
 * The arguments of `deno` that start the app with hot reloading in development
 * mode. The app may read only the three page files that the server reads from
 * the disk. Without this, the app asks for the permission at each start.
 */
export const DESKTOP_ARGUMENTS: readonly string[] = [
  "desktop",
  "--hmr",
  `--allow-read=${INDEX_HTML_SOURCE},${STYLES_SOURCE},${CLIENT_SCRIPT_SOURCE}`,
  "src/desktop/app.ts",
  "dev",
];

/** The paths of the page files on the disk, from the folder of the project. */
export const PAGE_SOURCES: readonly string[] = [
  INDEX_HTML_SOURCE,
  STYLES_SOURCE,
  CLIENT_SCRIPT_SOURCE,
];

/** The attribute that the server adds to the `<body>` of the page in development mode. */
export const DEV_ATTRIBUTE = "data-development";

/** The attribute that the server adds to the `<body>` in development mode. It has the version of the page files that the server read for the page. */
export const VERSION_ATTRIBUTE = "data-version";

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

/** The media type of a plain text answer. */
export const TEXT_CONTENT_TYPE = "text/plain; charset=utf-8";

/** The media type of the script of the page. */
export const SCRIPT_CONTENT_TYPE = "text/javascript; charset=utf-8";

/** The HTTP status code for a path that has no content. */
export const HTTP_NOT_FOUND = 404;

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
