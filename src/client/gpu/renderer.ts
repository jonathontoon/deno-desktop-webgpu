/**
 * The `Renderer` class.
 *
 * @module
 */
import type { Drawable, FrameInfo } from "../types.ts";
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
   * The color attachments of the render pass. The array is empty until the
   * first frame. After that, it has one attachment that each frame reuses.
   */
  private readonly colorAttachments: GPURenderPassColorAttachment[] = [];

  /** The render pass descriptor. Each frame reuses it. */
  private readonly passDescriptor: GPURenderPassDescriptor = {
    colorAttachments: this.colorAttachments,
  };

  /** The list for `submit`. Each frame reuses it. */
  private readonly commandBuffers: GPUCommandBuffer[] = [];

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
    this.setViews(this.graphics.multisampleView(), this.graphics.currentView());
    const pass = encoder.beginRenderPass(this.passDescriptor);
    drawable.draw(pass, frame);
    pass.end();
    this.commandBuffers[0] = encoder.finish();
    device.queue.submit(this.commandBuffers);
  }

  /**
   * Give the texture views of this frame to the render pass. The first call
   * makes the color attachment. Each later call changes only its views, so no
   * new object is made.
   *
   * @param view - The texture view with the samples. The frame draws to it.
   * @param resolveTarget - The texture view of the window. The GPU writes the
   * mixed color of each pixel to it. The samples are not kept.
   */
  private setViews(view: GPUTextureView, resolveTarget: GPUTextureView): void {
    const [attachment] = this.colorAttachments;
    if (attachment) {
      attachment.view = view;
      attachment.resolveTarget = resolveTarget;
      return;
    }
    this.colorAttachments.push({
      view,
      resolveTarget,
      clearValue: this.clearColor,
      loadOp: "clear",
      storeOp: "discard",
    });
  }
}
