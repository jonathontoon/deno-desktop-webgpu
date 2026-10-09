/**
 * Entry point of the web page. The page loads it as a script. It finds the
 * canvas, chooses the drawing method, and runs the render loop. If the start
 * fails, it shows the error in the page. In development mode, it also shows the
 * meter, and it loads the page again when a file changes.
 *
 * @module
 */
import {
  CANVAS_ELEMENT_ID,
  DEV_ATTRIBUTE,
  ERROR_ELEMENT_ID,
  METER_ELEMENT_ID,
  VERSION_ATTRIBUTE,
} from "../constants.ts";
import { showAlert } from "./core/alert.ts";
import { selectBackend } from "./core/backend.ts";
import { Canvas } from "./core/canvas.ts";
import { Meter } from "./core/meter.ts";
import { reloadOnChange } from "./core/reload.ts";

const canvasElement = document.getElementById(CANVAS_ELEMENT_ID);
const message = document.getElementById(ERROR_ELEMENT_ID);
const meterElement = document.getElementById(METER_ELEMENT_ID);
if (
  !(canvasElement instanceof HTMLCanvasElement) || !message || !meterElement
) {
  throw new Error(
    `The page needs <canvas id="${CANVAS_ELEMENT_ID}"> and elements with id="${ERROR_ELEMENT_ID}" and id="${METER_ELEMENT_ID}".`,
  );
}

const main = async (): Promise<void> => {
  const backend = await selectBackend(canvasElement);
  if (document.body.hasAttribute(DEV_ATTRIBUTE)) {
    meterElement.hidden = false;
    new Meter(meterElement, canvasElement).start();
    reloadOnChange(
      document.body.getAttribute(VERSION_ATTRIBUTE) ?? "",
      () => location.reload(),
    );
  }
  new Canvas(canvasElement).start((frame) => backend.render(frame));
};

main().catch((error) => showAlert(message, error));
