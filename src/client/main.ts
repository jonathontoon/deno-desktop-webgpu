/**
 * Entry point of the web page. The page loads it as a script. It finds the
 * canvas and runs the render loop. If the start fails, it shows the error in
 * the page.
 *
 * @module
 */
import { CANVAS_ELEMENT_ID, ERROR_ELEMENT_ID } from "../constants.ts";
import { Application } from "./core/application.ts";
import { requestDevice } from "./gpu/graphics.ts";
import { showFailure } from "./failure.ts";

const canvas = document.getElementById(CANVAS_ELEMENT_ID);
const message = document.getElementById(ERROR_ELEMENT_ID);
if (!(canvas instanceof HTMLCanvasElement) || !message) {
  throw new Error(
    `The page needs <canvas id="${CANVAS_ELEMENT_ID}"> and an element with id="${ERROR_ELEMENT_ID}".`,
  );
}

try {
  new Application(canvas, await requestDevice()).start();
} catch (error) {
  showFailure(error, message);
}
