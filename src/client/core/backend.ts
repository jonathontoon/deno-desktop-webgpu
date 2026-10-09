/**
 * The `selectBackend` function.
 *
 * @module
 */
import { CLEAR_COLOR } from "../../constants.ts";
import type { Backend } from "../../types.ts";
import { Graphics, requestDevice } from "../gpu/graphics.ts";
import { Renderer } from "../gpu/renderer.ts";
import { WebGPU } from "../gpu/webgpu.ts";
import { createCube } from "../scene/cube.ts";
import { Scene } from "../scene/scene.ts";

/**
 * Make the backend that draws on the canvas.
 *
 * @remarks
 * This is the one place that chooses a backend. A new drawing method is a new
 * class that implements `Backend`. Add it here, after the ones that look
 * better, and use it when the one before it fails. The WebGPU backend draws a
 * scene that holds the cube. This function makes the `Graphics` object, the
 * `Renderer`, and the scene.
 *
 * @param surface - The canvas that the backend draws to.
 * @returns The backend.
 * @throws {Error} When the computer has no WebGPU.
 * @throws {Error} When the canvas gives no WebGPU context.
 * @throws {Error} When a `Graphics` object exists already.
 *
 * @example
 * ```typescript
 * const backend = await selectBackend(canvas);
 * ```
 */
export async function selectBackend(
  surface: HTMLCanvasElement,
): Promise<Backend> {
  const graphics = new Graphics(await requestDevice(), surface);
  const scene = new Scene();
  scene.add(createCube(graphics));
  return new WebGPU(new Renderer(graphics, CLEAR_COLOR), scene);
}
