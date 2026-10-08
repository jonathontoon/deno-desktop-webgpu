/**
 * The `Scene` class.
 *
 * @module
 */
import { Singleton } from "../../singleton.ts";
import type { Drawable, FrameInfo } from "../../types.ts";

/**
 * A list of drawables. It draws them in the order that they were added.
 *
 * @remarks
 * Only one instance exists. A `Scene` is also a `Drawable`. So the
 * `Renderer` draws a whole scene in one call.
 */
export class Scene implements Drawable {
  /** Keeps the one instance. */
  private static readonly holder = new Singleton<Scene>("Scene");

  /**
   * The one instance.
   *
   * @throws {Error} When no `Scene` exists yet.
   */
  public static get shared(): Scene {
    return Scene.holder.get();
  }

  /** The drawables, in the order that they were added. */
  private readonly drawables: Drawable[] = [];

  /**
   * Make an empty scene.
   *
   * @throws {Error} When a `Scene` exists already.
   */
  public constructor() {
    Scene.holder.assertEmpty();
    Scene.holder.claim(this);
  }

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
