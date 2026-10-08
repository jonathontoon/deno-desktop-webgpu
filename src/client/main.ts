/**
 * Entry point of the web page. The page loads it as a script. It finds the
 * canvas, chooses the drawing method, and runs the render loop. If the start
 * fails, it shows the error in the page. In development mode, it also shows the
 * name of the drawing method and the frame rate.
 *
 * @module
 */
import {
  BACKEND_ELEMENT_ID,
  CANVAS_ELEMENT_ID,
  DEV_ATTRIBUTE,
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

/**
 * Choose the drawing method and start to draw. In development mode, also show
 * the name of the drawing method and the frame rate.
 */
async function main(): Promise<void> {
  const backend = await selectBackend(canvas as HTMLCanvasElement);
  let meter: Meter | undefined;
  if (document.body.hasAttribute(DEV_ATTRIBUTE)) {
    label!.textContent = backend.kind;
    label!.hidden = false;
    rate!.hidden = false;
    meter = new Meter(rate!);
  }
  new Application(canvas as HTMLCanvasElement, backend, meter).start();
}

main().catch((error) => errorAlert.show(error));
