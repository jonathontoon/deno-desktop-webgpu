/**
 * The `WebGPU` class.
 *
 * @module
 */
import type { Backend, Drawable, FrameInfo } from "../types.ts";
import type { Renderer } from "./renderer.ts";

/**
 * Draws a drawable with WebGPU.
 *
 * @remarks
 * It gets the `Renderer` and the drawable from its constructor. It does not
 * know what the drawable draws. `selectBackend` makes the `Graphics` object,
 * the `Renderer`, and the scene. A canvas has one WebGPU context, so only one
 * `Graphics` object can exist, and only one set of these objects.
 */
export class WebGPU implements Backend {
  /**
   * Make the backend.
   *
   * @param renderer - The object that draws one frame.
   * @param drawable - The object to draw in each frame.
   *
   * @example
   * ```typescript
   * const backend = new WebGPU(renderer, scene);
   * ```
   */
  public constructor(
    /** The object that draws one frame. */
    private readonly renderer: Renderer,
    /** The object to draw in each frame. */
    private readonly drawable: Drawable,
  ) {}

  /**
   * Draw one frame.
   *
   * @param frame - The data about the frame that is in progress.
   */
  public render(frame: FrameInfo): void {
    this.renderer.render(this.drawable, frame);
  }
}
