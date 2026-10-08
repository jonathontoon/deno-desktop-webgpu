/**
 * The functions that serve the web page. The page holds the canvas that
 * WebGPU draws to.
 *
 * @module
 */
import {
  CLIENT_SCRIPT_PATH,
  CSS_CONTENT_TYPE,
  HTML_CONTENT_TYPE,
  HTTP_NOT_FOUND,
  PAGE_PATH,
  SCRIPT_CONTENT_TYPE,
  STYLES_PATH,
} from "../constants.ts";
import INDEX_HTML from "../client/index.html" with { type: "text" };
import STYLES_CSS from "../client/styles.css" with { type: "text" };

/** One file that the server gives to the page. */
interface PageFile {
  /** The text of the file. */
  readonly body: string;
  /** The media type of the file. */
  readonly contentType: string;
}

/**
 * Make the handler that answers the requests of the window.
 *
 * @param clientScript - The JavaScript text that the page loads.
 * @returns A handler for `Deno.serve`.
 *
 * @example
 * ```typescript
 * Deno.serve(createRequestHandler(script));
 * ```
 */
export function createRequestHandler(
  clientScript: string,
): (request: Request) => Response {
  const files = new Map<string, PageFile>([
    [PAGE_PATH, { body: INDEX_HTML, contentType: HTML_CONTENT_TYPE }],
    [STYLES_PATH, { body: STYLES_CSS, contentType: CSS_CONTENT_TYPE }],
    [
      CLIENT_SCRIPT_PATH,
      { body: clientScript, contentType: SCRIPT_CONTENT_TYPE },
    ],
  ]);
  return (request) => {
    const file = files.get(new URL(request.url).pathname);
    if (!file) {
      return new Response("Not found.", { status: HTTP_NOT_FOUND });
    }
    return new Response(file.body, {
      headers: { "content-type": file.contentType },
    });
  };
}
