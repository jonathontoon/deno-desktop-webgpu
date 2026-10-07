import { Singleton } from "../singleton.ts";
import type { Drawable, FrameInfo } from "../types.ts";
import type { GPUContext } from "./gpu-context.ts";

/** Draws one frame: it clears the window and then runs a drawable. */
export class Renderer {
  private static readonly holder = new Singleton<Renderer>("Renderer");

  public static initialize(
    gpu: GPUContext,
    clearColor: GPUColor,
  ): Renderer {
    return Renderer.holder.set(new Renderer(gpu, clearColor));
  }

  public static get shared(): Renderer {
    return Renderer.holder.get();
  }

  private constructor(
    private readonly gpu: GPUContext,
    private readonly clearColor: GPUColor,
  ) {}

  public render(drawable: Drawable, frame: FrameInfo): void {
    const { device } = this.gpu;
    const encoder = device.createCommandEncoder();
    const pass = encoder.beginRenderPass({
      colorAttachments: [{
        view: this.gpu.currentView(),
        clearValue: this.clearColor,
        loadOp: "clear",
        storeOp: "store",
      }],
    });
    drawable.draw(pass, frame);
    pass.end();
    device.queue.submit([encoder.finish()]);
  }
}
