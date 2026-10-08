/**
 * The `Application` class.
 *
 * @module
 */
import { CLEAR_COLOR } from "../../constants.ts";
import { Graphics } from "../gpu/graphics.ts";
import { Renderer } from "../gpu/renderer.ts";
import { Scene } from "../scene/scene.ts";
import { Triangle } from "../scene/triangle.ts";
import { Singleton } from "../../singleton.ts";
import type { CanvasDelegate } from "../../types.ts";
import { Canvas } from "./canvas.ts";

/**
 * Creates the other objects and connects them. It is the delegate of the
 * canvas.
 *
 * @remarks
 * Only one instance exists. This class is the one place that makes each
 * singleton and gives it to the objects that need it.
 */
export class Application implements CanvasDelegate {
  /** Keeps the one instance. */
  private static readonly holder = new Singleton<Application>("Application");

  /**
   * The one instance.
   *
   * @throws {Error} When no `Application` exists yet.
   */
  public static get shared(): Application {
    return Application.holder.get();
  }

  /** The canvas that shows the frames. */
  private readonly canvas: Canvas;

  /** The object that draws one frame. */
  private readonly renderer: Renderer;

  /** The drawables to draw in each frame. */
  private readonly scene: Scene;

  /**
   * Make the other objects and connect them. The loop does not run until
   * `start` is called.
   *
   * @param element - The canvas element of the page.
   * @param device - The GPU device. Get it from `requestDevice`.
   * @throws {Error} When the canvas gives no WebGPU context.
   * @throws {Error} When an `Application` exists already.
   *
   * @example
   * ```typescript
   * const application = new Application(element, await requestDevice());
   * application.start();
   * ```
   */
  public constructor(element: HTMLCanvasElement, device: GPUDevice) {
    Application.holder.assertEmpty();
    this.canvas = new Canvas(element);
    const graphics = new Graphics(device, this.canvas.surface);
    this.renderer = new Renderer(graphics, CLEAR_COLOR);
    this.scene = new Scene();
    this.scene.add(new Triangle(graphics));
    Application.holder.claim(this);
  }

  /** Start to draw. The canvas asks for a frame before each screen refresh. */
  public start(): void {
    this.canvas.start(this);
  }

  /**
   * Draw one frame. The page shows it.
   *
   * @param time - The time, in milliseconds.
   */
  public canvasDidRequestFrame(time: number): void {
    this.renderer.render(this.scene, {
      time,
      aspectRatio: this.canvas.aspectRatio,
    });
  }
}
