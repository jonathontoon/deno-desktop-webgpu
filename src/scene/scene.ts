import { Singleton } from "../singleton.ts";
import type { Drawable, FrameInfo } from "../types.ts";

/** A list of drawables. It draws them in the order that they were added. */
export class Scene implements Drawable {
  private static readonly holder = new Singleton<Scene>("Scene");

  public static initialize(): Scene {
    return Scene.holder.set(new Scene());
  }

  public static get shared(): Scene {
    return Scene.holder.get();
  }

  private readonly drawables: Drawable[] = [];

  private constructor() {}

  public add(drawable: Drawable): void {
    this.drawables.push(drawable);
  }

  public draw(pass: GPURenderPassEncoder, frame: FrameInfo): void {
    for (const drawable of this.drawables) {
      drawable.draw(pass, frame);
    }
  }
}
