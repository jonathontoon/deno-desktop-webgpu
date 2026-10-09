/**
 * The fixed values of the Deno side. A class must not hold a magic value.
 * A magic value is a number or a text that has no name.
 *
 * @module
 */

/** The title and the size of the window when the program starts. */
export const WINDOW_OPTIONS = {
  title: "WebGPU",
  width: 800,
  height: 600,
} as const;

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
