/**
 * The functions that serve the web page. The page holds the canvas that
 * WebGPU draws to.
 *
 * @module
 */
import {
  CLIENT_SCRIPT_PATH,
  CLIENT_SCRIPT_SOURCE,
  CSS_CONTENT_TYPE,
  DEV_ATTRIBUTE,
  HTML_CONTENT_TYPE,
  HTTP_NOT_FOUND,
  INDEX_HTML_SOURCE,
  PAGE_PATH,
  PAGE_SOURCES,
  SCRIPT_CONTENT_TYPE,
  STYLES_PATH,
  STYLES_SOURCE,
  TEXT_CONTENT_TYPE,
  VERSION_ATTRIBUTE,
  VERSION_PATH,
} from "../constants.ts";
import type { DiskFiles } from "../types.ts";
import INDEX_HTML from "../client/index.html" with { type: "text" };
import STYLES_CSS from "../client/styles.css" with { type: "text" };

/** One file that the server gives to the page. */
interface PageFile {
  /** Give the text of the file. */
  read(): string | Promise<string>;
  /** The media type of the file. */
  readonly contentType: string;
}

/**
 * Make the handler that answers the requests of the window.
 *
 * @remarks
 * In development mode the server reads the page files from the disk for each
 * request, and it answers `/version` with a text that changes when one of the
 * files changes. The `<body>` of the page has the attribute `data-development`
 * and the attribute `data-version` with the version at the time of the request.
 * The page shows the meter, and it loads itself again when `/version` is not
 * the version that it has.
 *
 * @param clientScript - The JavaScript text that the page loads.
 * @param disk - The files on the disk. Give it only in development mode.
 * @returns A handler for `Deno.serve`.
 *
 * @example
 * ```typescript
 * Deno.serve(createRequestHandler(script, diskFiles));
 * ```
 */
export function createRequestHandler(
  clientScript: string,
  disk?: DiskFiles,
): (request: Request) => Promise<Response> {
  // The page gets the version before the server reads the files. If a file
  // changes after that, the version differs, and the page loads itself again.
  const html = disk
    ? async () => {
      const version = await disk.stamp(PAGE_SOURCES);
      return (await disk.read(INDEX_HTML_SOURCE)).replace(
        "<body>",
        `<body ${DEV_ATTRIBUTE} ${VERSION_ATTRIBUTE}="${version}">`,
      );
    }
    : () => INDEX_HTML;
  const files = new Map<string, PageFile>([
    [PAGE_PATH, { read: html, contentType: HTML_CONTENT_TYPE }],
    [STYLES_PATH, {
      read: disk ? () => disk.read(STYLES_SOURCE) : () => STYLES_CSS,
      contentType: CSS_CONTENT_TYPE,
    }],
    [CLIENT_SCRIPT_PATH, {
      read: disk ? () => disk.read(CLIENT_SCRIPT_SOURCE) : () => clientScript,
      contentType: SCRIPT_CONTENT_TYPE,
    }],
  ]);
  if (disk) {
    files.set(VERSION_PATH, {
      read: () => disk.stamp(PAGE_SOURCES),
      contentType: TEXT_CONTENT_TYPE,
    });
  }
  const headers: Record<string, string> = disk
    ? { "cache-control": "no-store" }
    : {};
  return async (request) => {
    const file = files.get(new URL(request.url).pathname);
    if (!file) {
      return new Response("Not found.", { status: HTTP_NOT_FOUND });
    }
    return new Response(await file.read(), {
      headers: { ...headers, "content-type": file.contentType },
    });
  };
}
