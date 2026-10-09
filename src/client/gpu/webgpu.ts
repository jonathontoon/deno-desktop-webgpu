/**
 * The `WebGPU` class.
 *
 * @module
 */
import { CLEAR_COLOR } from "../../constants.ts";
import type { Backend, FrameInfo } from "../../types.ts";
import { Cube } from "../scene/cube.ts";
import { Scene } from "../scene/scene.ts";
import { Graphics } from "./graphics.ts";
import { Renderer } from "./renderer.ts";

/**
 * Draws the scene with WebGPU.
 *
 * @remarks
 * It makes the `Graphics` object, the `Renderer`, and the `Scene` that holds
 * the cube. A canvas has one WebGPU context, so only one `WebGPU` can exist.
 * The `Graphics` object enforces this.
 */
export class WebGPU implements Backend {
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
   * @throws {Error} When a `Graphics` object exists already.
   *
   * @example
   * ```typescript
   * const backend = new WebGPU(await requestDevice(), canvas);
   * ```
   */
  public constructor(device: GPUDevice, surface: HTMLCanvasElement) {
    const graphics = new Graphics(device, surface);
    this.renderer = new Renderer(graphics, CLEAR_COLOR);
    this.scene = new Scene();
    this.scene.add(new Cube(graphics));
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
