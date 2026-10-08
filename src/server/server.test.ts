/**
 * Unit tests for the page server functions and for the files of the page.
 *
 * @module
 */
import { assertEquals, assertStringIncludes } from "@std/assert";
import {
  CANVAS_ELEMENT_ID,
  CLEAR_COLOR,
  CLIENT_SCRIPT_PATH,
  CLIENT_SCRIPT_SOURCE,
  DEV_ATTRIBUTE,
  ERROR_ELEMENT_ID,
  HTTP_NOT_FOUND,
  INDEX_HTML_SOURCE,
  METER_ELEMENT_ID,
  PAGE_PATH,
  STYLES_PATH,
  STYLES_SOURCE,
  VERSION_PATH,
  WINDOW_OPTIONS,
} from "../constants.ts";
import INDEX_HTML from "../client/index.html" with { type: "text" };
import STYLES_CSS from "../client/styles.css" with { type: "text" };
import type { DiskFiles } from "../types.ts";
import { createRequestHandler } from "./server.ts";

Deno.test("index.html", async (t) => {
  await t.step("has the canvas", () => {
    assertStringIncludes(INDEX_HTML, `<canvas id="${CANVAS_ELEMENT_ID}">`);
  });

  await t.step("has the element for the error message", () => {
    assertStringIncludes(INDEX_HTML, `id="${ERROR_ELEMENT_ID}"`);
  });

  await t.step("has the element for the meter", () => {
    assertStringIncludes(INDEX_HTML, `id="${METER_ELEMENT_ID}"`);
  });

  await t.step("hides the meter until development mode shows it", () => {
    assertStringIncludes(INDEX_HTML, `<p id="${METER_ELEMENT_ID}" hidden>`);
  });

  await t.step("has a <body> tag that the server can mark", () => {
    assertStringIncludes(INDEX_HTML, "<body>");
  });

  await t.step("loads the client script", () => {
    assertStringIncludes(INDEX_HTML, `src="${CLIENT_SCRIPT_PATH}"`);
  });

  await t.step("loads the style sheet", () => {
    assertStringIncludes(INDEX_HTML, `href="${STYLES_PATH}"`);
  });

  await t.step("has the title of the window", () => {
    assertStringIncludes(INDEX_HTML, `<title>${WINDOW_OPTIONS.title}</title>`);
  });
});

Deno.test("styles.css", async (t) => {
  await t.step("makes the canvas a square as large as the shorter side", () => {
    assertStringIncludes(STYLES_CSS, "width: 100vmin;");
    assertStringIncludes(STYLES_CSS, "height: 100vmin;");
  });

  await t.step("puts the canvas in the center of the window", () => {
    assertStringIncludes(STYLES_CSS, "place-items: center;");
  });

  await t.step("has the clear color as the page background", () => {
    const [red, green, blue] = [CLEAR_COLOR.r, CLEAR_COLOR.g, CLEAR_COLOR.b]
      .map((value) => Math.round(value * 255).toString(16).padStart(2, "0"));
    assertStringIncludes(STYLES_CSS, `background: #${red}${green}${blue};`);
  });
});

Deno.test("createRequestHandler", async (t) => {
  const handler = createRequestHandler("console.log(1);");

  /** Ask a handler for a path and give the response. */
  const ask = (
    target: (request: Request) => Promise<Response>,
    path: string,
  ): Promise<Response> => target(new Request(`http://localhost${path}`));
  const get = (path: string): Promise<Response> => ask(handler, path);

  await t.step("answers the page path with the page", async () => {
    const response = await get(PAGE_PATH);
    assertStringIncludes(
      response.headers.get("content-type") ?? "",
      "text/html",
    );
    assertEquals(await response.text(), INDEX_HTML);
  });

  await t.step("does not mark the page as development mode", async () => {
    const page = await (await get(PAGE_PATH)).text();
    assertEquals(page.includes(DEV_ATTRIBUTE), false);
  });

  await t.step("answers the style sheet path with CSS", async () => {
    const response = await get(STYLES_PATH);
    assertStringIncludes(
      response.headers.get("content-type") ?? "",
      "text/css",
    );
    assertStringIncludes(await response.text(), "canvas");
  });

  await t.step("answers the script path with the script", async () => {
    const response = await get(CLIENT_SCRIPT_PATH);
    assertStringIncludes(
      response.headers.get("content-type") ?? "",
      "text/javascript",
    );
    assertEquals(await response.text(), "console.log(1);");
  });

  await t.step("has no version path outside development mode", async () => {
    const response = await get(VERSION_PATH);
    assertEquals(response.status, HTTP_NOT_FOUND);
    await response.body?.cancel();
  });

  await t.step(
    "lets the browser keep the files outside development mode",
    async () => {
      const response = await get(PAGE_PATH);
      assertEquals(response.headers.get("cache-control"), null);
      await response.body?.cancel();
    },
  );

  await t.step("answers another path with not found", async () => {
    const response = await get("/other");
    assertEquals(response.status, HTTP_NOT_FOUND);
    await response.body?.cancel();
  });

  // Development mode: the files come from a fake disk.
  const contents: Record<string, string> = {
    [INDEX_HTML_SOURCE]: "<html><body>disk page</body></html>",
    [STYLES_SOURCE]: "canvas { color: blue; }",
    [CLIENT_SCRIPT_SOURCE]: "console.log('disk');",
  };
  let stamp = "1";
  const reads: string[] = [];
  const disk: DiskFiles = {
    read: (path) => {
      reads.push(path);
      return Promise.resolve(contents[path]);
    },
    stamp: () => Promise.resolve(stamp),
  };
  const development = createRequestHandler("console.log(1);", disk);
  const getDevelopment = (path: string): Promise<Response> =>
    ask(development, path);

  await t.step(
    "development: marks the page and reads it from the disk",
    async () => {
      const page = await (await getDevelopment(PAGE_PATH)).text();
      assertEquals(
        page,
        `<html><body ${DEV_ATTRIBUTE}>disk page</body></html>`,
      );
    },
  );

  await t.step("development: reads the style sheet from the disk", async () => {
    assertEquals(
      await (await getDevelopment(STYLES_PATH)).text(),
      "canvas { color: blue; }",
    );
  });

  await t.step("development: reads the script from the disk", async () => {
    assertEquals(
      await (await getDevelopment(CLIENT_SCRIPT_PATH)).text(),
      "console.log('disk');",
    );
  });

  await t.step(
    "development: reads the disk again for each request",
    async () => {
      contents[CLIENT_SCRIPT_SOURCE] = "console.log('changed');";
      assertEquals(
        await (await getDevelopment(CLIENT_SCRIPT_PATH)).text(),
        "console.log('changed');",
      );
      assertEquals(
        reads.filter((path) => path === CLIENT_SCRIPT_SOURCE).length,
        2,
      );
    },
  );

  await t.step(
    "development: answers the version path with the stamp",
    async () => {
      assertEquals(await (await getDevelopment(VERSION_PATH)).text(), "1");
      stamp = "2";
      assertEquals(await (await getDevelopment(VERSION_PATH)).text(), "2");
    },
  );

  await t.step(
    "development: tells the browser not to keep the files",
    async () => {
      const response = await getDevelopment(PAGE_PATH);
      assertEquals(response.headers.get("cache-control"), "no-store");
      await response.body?.cancel();
    },
  );
});
