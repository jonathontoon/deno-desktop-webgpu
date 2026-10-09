/**
 * The `Graphics` class.
 *
 * @module
 */
import {
  CANVAS_ALPHA_MODE,
  GPU_POWER_PREFERENCE,
  SAMPLE_COUNT,
} from "../constants.ts";
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

  /** The number of samples for each pixel. Each pipeline uses this number. */
  public readonly sampleCount: number = SAMPLE_COUNT;

  /**
   * The texture that has the samples of the frame. It is `undefined` until the
   * first frame.
   */
  private multisample: MultisampleTarget | undefined;

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

  /**
   * Give the texture that has the samples of the frame. The render pass draws
   * to it, and the GPU then gives the mixed color of each pixel to the texture
   * of the window. The texture has the size of the window. A change of the size
   * of the window makes a new texture.
   *
   * @returns A view of the texture with the samples.
   */
  public multisampleView(): GPUTextureView {
    const { width, height } = this.context.getCurrentTexture();
    const current = this.multisample;
    if (current && current.width === width && current.height === height) {
      return current.view;
    }
    current?.texture.destroy();
    const texture = this.device.createTexture({
      size: [width, height],
      format: this.format,
      sampleCount: this.sampleCount,
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });
    const view = texture.createView();
    this.multisample = { texture, view, width, height };
    return view;
  }
}

/** The texture with the samples, its view, and the size that it was made for. */
interface MultisampleTarget {
  /** The texture. */
  readonly texture: GPUTexture;
  /** A view of the texture. */
  readonly view: GPUTextureView;
  /** The width of the texture, in pixels. */
  readonly width: number;
  /** The height of the texture, in pixels. */
  readonly height: number;
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
