/**
 * The `Canvas` class.
 *
 * @module
 */
import { CANVAS_OBSERVED_BOX } from "../../constants.ts";
import { Singleton } from "../../singleton.ts";
import type { CanvasDelegate } from "../../types.ts";

/**
 * Owns the canvas that WebGPU draws to. It keeps the size of the drawing
 * surface correct and asks its delegate for a frame before each screen
 * refresh.
 *
 * @remarks
 * Only one instance exists. The canvas fills the window. A `ResizeObserver`
 * gives the size of the canvas on the screen in device pixels. It reports a
 * new size when the window changes size, and when the window moves to a screen
 * with a different pixel ratio. The frame loop uses `requestAnimationFrame`,
 * so the browser sets the speed of the frames and pauses them when the window
 * is hidden.
 */
export class Canvas {
  /** Keeps the one instance. */
  private static readonly holder = new Singleton<Canvas>("Canvas");

  /**
   * The one instance.
   *
   * @throws {Error} When no `Canvas` exists yet.
   */
  public static get shared(): Canvas {
    return Canvas.holder.get();
  }

  /** The observer that reports the size of the canvas. */
  private readonly sizeObserver: ResizeObserver;

  /** `true` while the frame loop runs. */
  private running = false;

  /** The id of the next frame request. It is `undefined` when none waits. */
  private frameRequest: number | undefined;

  /** The object that draws the frames. It is `undefined` until `start` runs. */
  private delegate: CanvasDelegate | undefined;

  /**
   * Take the canvas and keep its drawing surface the same size as its box in
   * device pixels. The frame loop does not run until `start` is called.
   *
   * @param surface - The canvas element of the page.
   * @throws {Error} When a `Canvas` exists already.
   *
   * @example
   * ```typescript
   * const canvas = new Canvas(element);
   * canvas.start(delegate);
   * ```
   */
  public constructor(
    /** The canvas that WebGPU draws to. */
    public readonly surface: HTMLCanvasElement,
  ) {
    Canvas.holder.assertEmpty();
    this.sizeObserver = new ResizeObserver((entries) => this.resize(entries));
    this.sizeObserver.observe(surface, CANVAS_OBSERVED_BOX);
    Canvas.holder.claim(this);
  }

  /** The width of the surface divided by its height. */
  public get aspectRatio(): number {
    return this.surface.width / this.surface.height;
  }

  /**
   * Start the frame loop. The first frame comes before the next screen
   * refresh. Do nothing if the loop runs.
   *
   * @param delegate - The object that draws each frame.
   */
  public start(delegate: CanvasDelegate): void {
    if (this.running) {
      return;
    }
    this.delegate = delegate;
    this.running = true;
    this.requestFrame();
  }

  /** Stop the frame loop. The delegate gets no more frame requests. */
  public stop(): void {
    this.running = false;
    if (this.frameRequest !== undefined) {
      cancelAnimationFrame(this.frameRequest);
      this.frameRequest = undefined;
    }
  }

  /**
   * Make the drawing surface as large as the canvas is on the screen.
   *
   * @param entries - The size reports from the `ResizeObserver`.
   */
  private resize(entries: readonly ResizeObserverEntry[]): void {
    for (const entry of entries) {
      const [size] = entry.devicePixelContentBoxSize;
      this.surface.width = Math.max(1, size.inlineSize);
      this.surface.height = Math.max(1, size.blockSize);
    }
  }

  /** Ask the browser to call `tick` before the next screen refresh. */
  private requestFrame(): void {
    this.frameRequest = requestAnimationFrame((time) => this.tick(time));
  }

  /**
   * Ask the delegate to draw, then ask for the next frame if the loop runs.
   *
   * @param time - The time of the frame, in milliseconds.
   */
  private tick(time: number): void {
    this.frameRequest = undefined;
    this.delegate?.canvasDidRequestFrame(time);
    if (this.running) {
      this.requestFrame();
    }
  }
}
