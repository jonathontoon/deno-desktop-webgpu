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
   * Set up the GPU for a canvas, and start to draw.
   *
   * @param element - The canvas element of the page.
   * @returns The new `Application`.
   * @throws {Error} When the GPU setup fails.
   * @throws {Error} When an `Application` exists already.
   *
   * @example
   * ```typescript
   * await Application.launch(element);
   * ```
   */
  public static async launch(element: HTMLCanvasElement): Promise<Application> {
    Application.holder.assertEmpty();
    const canvas = Canvas.initialize(element);
    const graphics = await Graphics.initialize(canvas.surface);

    const renderer = Renderer.initialize(graphics, CLEAR_COLOR);
    const scene = Scene.initialize();
    scene.add(new Triangle(graphics));

    const application = Application.holder.create(
      () => new Application(canvas, renderer, scene),
    );
    canvas.start(application);
    return application;
  }

  /**
   * The one instance.
   *
   * @throws {Error} When `launch` has not run yet.
   */
  public static get shared(): Application {
    return Application.holder.get();
  }

  /**
   * Keep the parts. Use `launch` to make an
   * instance.
   *
   * @param canvas - The canvas that shows the frames.
   * @param renderer - The object that draws one frame.
   * @param scene - The drawables to draw in each frame.
   */
  private constructor(
    /** The canvas that shows the frames. */
    private readonly canvas: Canvas,
    /** The object that draws one frame. */
    private readonly renderer: Renderer,
    /** The drawables to draw in each frame. */
    private readonly scene: Scene,
  ) {}

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
