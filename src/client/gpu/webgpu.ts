/**
 * The `WebGPU` class.
 *
 * @module
 */
import { CLEAR_COLOR } from "../../constants.ts";
import { Singleton } from "../../singleton.ts";
import type { Backend, BackendKind, FrameInfo } from "../../types.ts";
import { Cube } from "../scene/cube.ts";
import { Scene } from "../scene/scene.ts";
import { Graphics } from "./graphics.ts";
import { Renderer } from "./renderer.ts";

/**
 * Draws the scene with WebGPU.
 *
 * @remarks
 * Only one instance exists. It makes the `Graphics` object, the `Renderer`,
 * and the `Scene` that holds the cube.
 */
export class WebGPU implements Backend {
  /** Keeps the one instance. */
  private static readonly holder = new Singleton<WebGPU>("WebGPU");

  /**
   * The one instance.
   *
   * @throws {Error} When no `WebGPU` exists yet.
   */
  public static get shared(): WebGPU {
    return WebGPU.holder.get();
  }

  /** The drawing method of this backend. */
  public readonly kind: BackendKind = "webgpu";

  /** The object that draws one frame. */
  private readonly renderer: Renderer;

  /** The drawables to draw in each frame. */
  private readonly scene: Scene;

  /**
   * Connect the GPU device to the canvas and make the scene.
   *
   * @param device - The GPU device. Get it from `requestDevice`.
   * @param surface - The canvas that WebGPU draws to.
   * @throws {Error} When the canvas gives no WebGPU context.
   * @throws {Error} When a `WebGPU` exists already.
   *
   * @example
   * ```typescript
   * const backend = new WebGPU(await requestDevice(), canvas);
   * ```
   */
  public constructor(device: GPUDevice, surface: HTMLCanvasElement) {
    WebGPU.holder.assertEmpty();
    const graphics = new Graphics(device, surface);
    this.renderer = new Renderer(graphics, CLEAR_COLOR);
    this.scene = new Scene();
    this.scene.add(new Cube(graphics));
    WebGPU.holder.claim(this);
  }

  /**
   * Draw one frame.
   *
   * @param frame - The data about the frame that is in progress.
   */
  public render(frame: FrameInfo): void {
    this.renderer.render(this.scene, frame);
  }
}
