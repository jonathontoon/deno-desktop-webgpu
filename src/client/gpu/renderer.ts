/**
 * The `Renderer` class.
 *
 * @module
 */
import { Singleton } from "../../singleton.ts";
import type { Drawable, FrameInfo } from "../../types.ts";
import type { Graphics } from "./graphics.ts";

/**
 * Draws one frame: it clears the window and then runs a drawable.
 *
 * @remarks
 * Only one instance exists. The `Renderer` does not know what the drawable
 * draws. It only makes the render pass and sends the commands to the GPU.
 */
export class Renderer {
  /** Keeps the one instance. */
  private static readonly holder = new Singleton<Renderer>("Renderer");

  /**
   * Make the renderer.
   *
   * @param graphics - The `Graphics` object. It gives the device and the texture.
   * @param clearColor - The color that fills the window before each frame.
   * @returns The new `Renderer`.
   * @throws {Error} When a `Renderer` exists already.
   */
  public static initialize(
    graphics: Graphics,
    clearColor: GPUColor,
  ): Renderer {
    return Renderer.holder.create(() => new Renderer(graphics, clearColor));
  }

  /**
   * The one instance.
   *
   * @throws {Error} When `initialize` has not run yet.
   */
  public static get shared(): Renderer {
    return Renderer.holder.get();
  }

  /**
   * Keep the `Graphics` object and the clear color. Use `initialize` to make an
   * instance.
   *
   * @param graphics - The `Graphics` object. It gives the device and the texture.
   * @param clearColor - The color that fills the window before each frame.
   */
  private constructor(
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
