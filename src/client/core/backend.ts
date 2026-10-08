/**
 * The `selectBackend` function.
 *
 * @module
 */
import type { Backend } from "../../types.ts";
import { requestDevice } from "../gpu/graphics.ts";
import { WebGPU } from "../gpu/webgpu.ts";

/**
 * Make the backend that draws on the canvas.
 *
 * @remarks
 * This is the one place that chooses a backend. A new drawing method is a new
 * class that implements `Backend`. Add it here, after the ones that look
 * better, and use it when the one before it fails.
 *
 * @param surface - The canvas that the backend draws to.
 * @returns The backend.
 * @throws {Error} When the computer has no WebGPU.
 *
 * @example
 * ```typescript
 * const backend = await selectBackend(canvas);
 * ```
 */
export async function selectBackend(
  surface: HTMLCanvasElement,
): Promise<Backend> {
  return new WebGPU(await requestDevice(), surface);
}
