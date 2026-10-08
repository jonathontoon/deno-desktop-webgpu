/**
 * Unit tests for the page server functions and for the files of the page.
 *
 * @module
 */
import { assertEquals, assertStringIncludes } from "@std/assert";
import {
  BACKEND_ELEMENT_ID,
  CANVAS_ELEMENT_ID,
  CLEAR_COLOR,
  CLIENT_SCRIPT_PATH,
  DEV_ATTRIBUTE,
  ERROR_ELEMENT_ID,
  HTTP_NOT_FOUND,
  METER_ELEMENT_ID,
  PAGE_PATH,
  STYLES_PATH,
  WINDOW_OPTIONS,
} from "../constants.ts";
import INDEX_HTML from "../client/index.html" with { type: "text" };
import STYLES_CSS from "../client/styles.css" with { type: "text" };
import { createRequestHandler } from "./server.ts";

Deno.test("index.html", async (t) => {
  await t.step("has the canvas", () => {
    assertStringIncludes(INDEX_HTML, `<canvas id="${CANVAS_ELEMENT_ID}">`);
  });

  await t.step("has the element for the error message", () => {
    assertStringIncludes(INDEX_HTML, `id="${ERROR_ELEMENT_ID}"`);
  });

  await t.step("has the element for the name of the drawing method", () => {
    assertStringIncludes(INDEX_HTML, `id="${BACKEND_ELEMENT_ID}"`);
  });

  await t.step("has the element for the meter", () => {
    assertStringIncludes(INDEX_HTML, `id="${METER_ELEMENT_ID}"`);
  });

  await t.step("hides both elements until development mode shows them", () => {
    assertStringIncludes(INDEX_HTML, `<p id="${BACKEND_ELEMENT_ID}" hidden>`);
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

  /** Ask the handler for a path and give the response. */
  const get = (path: string): Response =>
    handler(new Request(`http://localhost${path}`));

  await t.step("answers the page path with the page", async () => {
    const response = get(PAGE_PATH);
    assertStringIncludes(
      response.headers.get("content-type") ?? "",
      "text/html",
    );
    assertEquals(await response.text(), INDEX_HTML);
  });

  await t.step("does not mark the page as development mode", async () => {
    const page = await get(PAGE_PATH).text();
    assertEquals(page.includes(DEV_ATTRIBUTE), false);
  });

  await t.step("marks the page as development mode when asked", async () => {
    const development = createRequestHandler("console.log(1);", true);
    const page = await development(new Request("http://localhost/")).text();
    assertStringIncludes(page, `<body ${DEV_ATTRIBUTE}>`);
    assertEquals(page, INDEX_HTML.replace("<body>", `<body ${DEV_ATTRIBUTE}>`));
  });

  await t.step("answers the style sheet path with CSS", async () => {
    const response = get(STYLES_PATH);
    assertStringIncludes(
      response.headers.get("content-type") ?? "",
      "text/css",
    );
    assertStringIncludes(await response.text(), "canvas");
  });

  await t.step("answers the script path with the script", async () => {
    const response = get(CLIENT_SCRIPT_PATH);
    assertStringIncludes(
      response.headers.get("content-type") ?? "",
      "text/javascript",
    );
    assertEquals(await response.text(), "console.log(1);");
  });

  await t.step("answers another path with not found", async () => {
    const response = get("/other");
    assertEquals(response.status, HTTP_NOT_FOUND);
    await response.body?.cancel();
  });
});
