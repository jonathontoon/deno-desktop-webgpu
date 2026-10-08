/**
 * Entry point of the web page. The page loads it as a script. It finds the
 * canvas, chooses the drawing method, and runs the render loop. If the start
 * fails, it shows the error in the page.
 *
 * @module
 */
import {
  BACKEND_ELEMENT_ID,
  CANVAS_ELEMENT_ID,
  ERROR_ELEMENT_ID,
  FPS_ELEMENT_ID,
} from "../constants.ts";
import { Alert } from "./core/alert.ts";
import { Application } from "./core/application.ts";
import { selectBackend } from "./core/backend.ts";
import { Meter } from "./core/meter.ts";

const canvas = document.getElementById(CANVAS_ELEMENT_ID);
const message = document.getElementById(ERROR_ELEMENT_ID);
const label = document.getElementById(BACKEND_ELEMENT_ID);
const rate = document.getElementById(FPS_ELEMENT_ID);
if (!(canvas instanceof HTMLCanvasElement) || !message || !label || !rate) {
  throw new Error(
    `The page needs <canvas id="${CANVAS_ELEMENT_ID}"> and elements with id="${ERROR_ELEMENT_ID}", id="${BACKEND_ELEMENT_ID}", and id="${FPS_ELEMENT_ID}".`,
  );
}

const errorAlert = new Alert(message);

/** Choose the drawing method, show its name, and start to draw. */
async function main(): Promise<void> {
  const backend = await selectBackend(canvas as HTMLCanvasElement);
  label!.textContent = backend.kind;
  new Application(canvas as HTMLCanvasElement, backend, new Meter(rate!))
    .start();
}

main().catch((error) => errorAlert.show(error));
