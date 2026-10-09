/**
 * The `Graphics` class.
 *
 * @module
 */
import { CANVAS_ALPHA_MODE, GPU_POWER_PREFERENCE } from "../constants.ts";
import { Singleton } from "../singleton.ts";

/**
 * Owns the GPU device and the WebGPU context of the window.
 *
 * @remarks
 * Only one instance exists. Make it with `new Graphics(device, surface)`.
 * The `Renderer` and each `Drawable` use the device to make GPU objects.
 */
export class Graphics {
  /** Keeps the one instance. */
  private static readonly holder = new Singleton("Graphics");

  /** The WebGPU context of the window. */
  private readonly context: GPUCanvasContext;

  /** The pixel format of the window. */
  public readonly format: GPUTextureFormat;

  /**
   * Connect the GPU device to the canvas.
   *
   * @param device - The GPU device that makes the GPU objects. Get it from
   * `requestDevice`.
   * @param surface - The canvas that WebGPU draws to.
   * @throws {Error} When the canvas gives no WebGPU context.
   * @throws {Error} When a `Graphics` exists already.
   *
   * @example
   * ```typescript
   * const graphics = new Graphics(await requestDevice(), canvas.surface);
   * ```
   */
  public constructor(
    /** The GPU device that makes the GPU objects. */
    public readonly device: GPUDevice,
    surface: HTMLCanvasElement,
  ) {
    Graphics.holder.assertEmpty();
    // The DOM types do not list the "webgpu" context kind.
    const context = surface.getContext("webgpu") as unknown as
      | GPUCanvasContext
      | null;
    if (!context) {
      throw new Error("Could not create a WebGPU context for the window.");
    }
    this.format = navigator.gpu.getPreferredCanvasFormat();
    context.configure({
      device,
      format: this.format,
      alphaMode: CANVAS_ALPHA_MODE,
    });
    this.context = context;
    Graphics.holder.claim();
  }

  /**
   * Give the texture of the window for the frame that is now in progress.
   *
   * @returns A view of the texture. A render pass draws to it.
   */
  public currentView(): GPUTextureView {
    return this.context.getCurrentTexture().createView();
  }
}

/**
 * Ask the system for a GPU device.
 *
 * @returns The GPU device.
 * @throws {Error} When the browser has no WebGPU.
 * @throws {Error} When no WebGPU adapter exists.
 *
 * @example
 * ```typescript
 * const device = await requestDevice();
 * ```
 */
export async function requestDevice(): Promise<GPUDevice> {
  if (!navigator.gpu) {
    throw new Error("WebGPU is not available.");
  }
  const adapter = await navigator.gpu.requestAdapter({
    powerPreference: GPU_POWER_PREFERENCE,
  });
  if (!adapter) {
    throw new Error("No WebGPU adapter is available.");
  }
  return adapter.requestDevice();
}
