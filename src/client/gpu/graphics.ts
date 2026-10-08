/**
 * The `Graphics` class.
 *
 * @module
 */
import { CANVAS_ALPHA_MODE } from "../../constants.ts";
import { Singleton } from "../../singleton.ts";

/**
 * Owns the GPU device and the WebGPU context of the window.
 *
 * @remarks
 * Only one instance exists. Call `Graphics.initialize` one time.
 * The `Renderer` and each `Drawable` use the device to make GPU objects.
 */
export class Graphics {
  /** Keeps the one instance. */
  private static readonly holder = new Singleton<Graphics>("Graphics");

  /**
   * Ask the system for a GPU, and connect it to the window.
   *
   * @param surface - The canvas that WebGPU draws to.
   * @returns The new `Graphics`.
   * @throws {Error} When the browser has no WebGPU.
   * @throws {Error} When no WebGPU adapter exists.
   * @throws {Error} When the window gives no WebGPU context.
   * @throws {Error} When a `Graphics` exists already.
   *
   * @example
   * ```typescript
   * const graphics = await Graphics.initialize(canvas.surface);
   * ```
   */
  public static async initialize(
    surface: HTMLCanvasElement,
  ): Promise<Graphics> {
    Graphics.holder.assertEmpty();
    if (!navigator.gpu) {
      throw new Error("WebGPU is not available.");
    }
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      throw new Error("No WebGPU adapter is available.");
    }
    const device = await adapter.requestDevice();
    const format = navigator.gpu.getPreferredCanvasFormat();

    // The DOM types do not list the "webgpu" context kind.
    const context = surface.getContext("webgpu") as unknown as
      | GPUCanvasContext
      | null;
    if (!context) {
      throw new Error("Could not create a WebGPU context for the window.");
    }
    context.configure({ device, format, alphaMode: CANVAS_ALPHA_MODE });

    return Graphics.holder.create(
      () => new Graphics(device, context, format),
    );
  }

  /**
   * The one instance.
   *
   * @throws {Error} When `initialize` has not run yet.
   */
  public static get shared(): Graphics {
    return Graphics.holder.get();
  }

  /**
   * Keep the GPU objects. Use `initialize` to make an instance.
   *
   * @param device - The GPU device that makes the GPU objects.
   * @param context - The WebGPU context of the window.
   * @param format - The pixel format of the window.
   */
  private constructor(
    /** The GPU device that makes the GPU objects. */
    public readonly device: GPUDevice,
    /** The WebGPU context of the window. */
    private readonly context: GPUCanvasContext,
    /** The pixel format of the window. */
    public readonly format: GPUTextureFormat,
  ) {}

  /**
   * Give the texture of the window for the frame that is now in progress.
   *
   * @returns A view of the texture. A render pass draws to it.
   */
  public currentView(): GPUTextureView {
    return this.context.getCurrentTexture().createView();
  }
}
