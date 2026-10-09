/**
 * The `Renderer` class.
 *
 * @module
 */
import type { Drawable, FrameInfo } from "../../types.ts";
import type { Graphics } from "./graphics.ts";

/**
 * Draws one frame: it clears the window and then runs a drawable.
 *
 * @remarks
 * The `Renderer` does not know what the drawable draws. It only makes the
 * render pass and sends the commands to the GPU.
 */
export class Renderer {
  /**
   * Make the renderer.
   *
   * @param graphics - The `Graphics` object. It gives the device and the texture.
   * @param clearColor - The color that fills the window before each frame.
   */
  public constructor(
    /** The `Graphics` object. It gives the device and the texture. */
    private readonly graphics: Graphics,
    /** The color that fills the window before each frame. */
    private readonly clearColor: GPUColor,
  ) {}

  /**
   * Draw one frame.
   *
   * @param drawable - The object that records the draw calls.
   * @param frame - The data about the frame.
   *
   * @example
   * ```typescript
   * renderer.render(scene, { time: performance.now(), aspectRatio: 4 / 3 });
   * ```
   */
  public render(drawable: Drawable, frame: FrameInfo): void {
    const { device } = this.graphics;
    const encoder = device.createCommandEncoder();
    const pass = encoder.beginRenderPass({
      colorAttachments: [{
        view: this.graphics.currentView(),
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
