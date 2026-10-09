/**
 * The `Scene` class.
 *
 * @module
 */
import type { Drawable, FrameInfo } from "../../types.ts";

/**
 * A list of drawables. It draws them in the order that they were added.
 *
 * @remarks
 * A `Scene` is also a `Drawable`. So the `Renderer` draws a whole scene in one
 * call, and a scene can hold other scenes.
 *
 * @example
 * ```typescript
 * const scene = new Scene();
 * scene.add(new Cube(graphics));
 * ```
 */
export class Scene implements Drawable {
  /** The drawables, in the order that they were added. */
  private readonly drawables: Drawable[] = [];

  /**
   * Add a drawable to the end of the list.
   *
   * @param drawable - The object to draw in each frame.
   *
   * @example
   * ```typescript
   * scene.add(new Triangle(graphics));
   * ```
   */
  public add(drawable: Drawable): void {
    this.drawables.push(drawable);
  }

  /**
   * Draw each drawable in the list.
   *
   * @param pass - The render pass that receives the draw calls.
   * @param frame - The data about the frame that is in progress.
   */
  public draw(pass: GPURenderPassEncoder, frame: FrameInfo): void {
    for (const drawable of this.drawables) {
      drawable.draw(pass, frame);
    }
  }
}
