/**
 * The `selectBackend` function.
 *
 * @module
 */
import type { Backend } from "../../types.ts";
import { requestDevice } from "../gpu/graphics.ts";
import { WebGPU } from "../gpu/webgpu.ts";

/**
 * Choose the best drawing method that the web view has, and make its backend.
 *
 * @param surface - The canvas that the backend draws to.
 * @returns The backend.
 * @throws {Error} When no drawing method is available.
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
