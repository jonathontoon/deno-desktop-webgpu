import { CANVAS_ALPHA_MODE } from "../constants.ts";
import { Singleton } from "../singleton.ts";
import type { NativeSurface } from "../types.ts";

/** Owns the GPU device and the WebGPU context of the window. */
export class GPUContext {
  private static readonly holder = new Singleton<GPUContext>("GPUContext");

  public static async initialize(surface: NativeSurface): Promise<GPUContext> {
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      throw new Error("No WebGPU adapter is available.");
    }
    const device = await adapter.requestDevice();
    const format = navigator.gpu.getPreferredCanvasFormat();

    const context = surface.getContext("webgpu") as GPUCanvasContext | null;
    if (!context) {
      throw new Error("Could not create a WebGPU context for the window.");
    }
    context.configure({ device, format, alphaMode: CANVAS_ALPHA_MODE });

    return GPUContext.holder.set(new GPUContext(device, context, format));
  }

  public static get shared(): GPUContext {
    return GPUContext.holder.get();
  }

  private constructor(
    public readonly device: GPUDevice,
    private readonly context: GPUCanvasContext,
    public readonly format: GPUTextureFormat,
  ) {}

  /** The texture of the window for the frame that is now in progress. */
  public currentView(): GPUTextureView {
    return this.context.getCurrentTexture().createView();
  }
}
