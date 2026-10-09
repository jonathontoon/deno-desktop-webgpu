/**
 * Entry point of the web page. The page loads it as a script. It finds the
 * canvas, builds the scene, and runs the render loop. If the start
 * fails, it shows the error in the page. In development mode, it also shows the
 * meter, and it loads the page again when a file changes.
 *
 * @module
 */
import {
  CANVAS_ELEMENT_ID,
  CLEAR_COLOR,
  ERROR_ELEMENT_ID,
  METER_ELEMENT_ID,
} from "./constants.ts";
import { DEV_ATTRIBUTE, VERSION_ATTRIBUTE } from "../constants.ts";
import { showAlert } from "./alert.ts";
import { Canvas } from "./canvas.ts";
import { Meter } from "./development/meter.ts";
import { reloadOnChange } from "./development/reload.ts";
import { Graphics, requestDevice } from "./gpu/graphics.ts";
import { Renderer } from "./gpu/renderer.ts";
import { createCube } from "./scene/cube.ts";
import { Scene } from "./scene/scene.ts";

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
  const graphics = new Graphics(await requestDevice(), canvasElement);
  const scene = new Scene();
  scene.add(createCube(graphics));
  const renderer = new Renderer(graphics, CLEAR_COLOR);
  if (document.body.hasAttribute(DEV_ATTRIBUTE)) {
    meterElement.hidden = false;
    new Meter(meterElement, canvasElement).start();
    reloadOnChange(
      document.body.getAttribute(VERSION_ATTRIBUTE) ?? "",
      () => location.reload(),
    );
  }
  new Canvas(canvasElement).start((frame) => renderer.render(scene, frame));
};

main().catch((error) => showAlert(message, error));
