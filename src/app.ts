/**
 * Entry point. It opens the window and serves the web page that draws with
 * WebGPU.
 *
 * @module
 */
// TODO: Use the `raw` backend again when Deno fixes the macOS surface thread
// bug (denoland/deno#36738). See "TODO" in AGENTS.md.
import CLIENT_SCRIPT from "../dist/client.js" with { type: "text" };
import { DEV_ARGUMENT, WINDOW_OPTIONS } from "./constants.ts";
import { createRequestHandler } from "./server/server.ts";

// The first `Deno.BrowserWindow` takes the window that the runtime opened.
const appWindow = new Deno.BrowserWindow(WINDOW_OPTIONS);
appWindow.addEventListener("close", () => Deno.exit());

// `deno task dev` gives the argument "dev". A built app does not get it.
const development = Deno.args.includes(DEV_ARGUMENT);

Deno.serve(createRequestHandler(CLIENT_SCRIPT, development));
