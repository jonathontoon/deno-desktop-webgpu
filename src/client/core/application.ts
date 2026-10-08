/**
 * The `Application` class.
 *
 * @module
 */
import { Singleton } from "../../singleton.ts";
import type { Backend, CanvasDelegate } from "../../types.ts";
import { Canvas } from "./canvas.ts";
import type { Meter } from "./meter.ts";

/**
 * Connects the canvas to the backend. It is the delegate of the canvas.
 *
 * @remarks
 * Only one instance exists. It makes the `Canvas`, counts each frame with the
 * `Meter`, and gives each frame request to the backend.
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

  /**
   * Make the canvas and connect it to the backend. The loop does not run until
   * `start` is called.
   *
   * @param element - The canvas element of the page.
   * @param backend - The object that draws each frame on the canvas.
   * @param meter - The object that counts the frames.
   * @throws {Error} When an `Application` exists already.
   *
   * @example
   * ```typescript
   * const application = new Application(element, backend, meter);
   * application.start();
   * ```
   */
  public constructor(
    element: HTMLCanvasElement,
    /** The object that draws each frame on the canvas. */
    private readonly backend: Backend,
    /** The object that counts the frames. */
    private readonly meter: Meter,
  ) {
    Application.holder.assertEmpty();
    this.canvas = new Canvas(element);
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
    this.meter.record(time);
    this.backend.render({ time, aspectRatio: this.canvas.aspectRatio });
  }
}
