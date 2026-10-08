/**
 * The `selectBackend` function.
 *
 * @module
 */
import type { Backend } from "../../types.ts";
import { requestDevice } from "../gpu/graphics.ts";
import { WebGPU } from "../gpu/webgpu.ts";
import { WebGL2 } from "../gl/webgl2.ts";

/**
 * Choose the best drawing method that the web view has, and make its backend.
 *
 * @remarks
 * The order is WebGPU, then WebGL2. The function asks for the WebGPU device
 * before it asks the canvas for any context. So the canvas is free for WebGL2
 * when WebGPU is not available.
 *
 * @param surface - The canvas that the backend draws to.
 * @returns The backend.
 * @throws {Error} When the web view has neither WebGPU nor WebGL2.
 *
 * @example
 * ```typescript
 * const backend = await selectBackend(canvas);
 * ```
 */
export async function selectBackend(
  surface: HTMLCanvasElement,
): Promise<Backend> {
  try {
    return new WebGPU(await requestDevice(), surface);
  } catch (webgpuError) {
    const context = surface.getContext("webgl2");
    if (context) {
      return new WebGL2(context, surface);
    }
    throw new Error("WebGPU or WebGL2 is required.", { cause: webgpuError });
  }
}
