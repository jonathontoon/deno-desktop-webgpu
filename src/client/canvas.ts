/**
 * The `Canvas` class.
 *
 * @module
 */
import { CANVAS_OBSERVED_BOX } from "./constants.ts";
import { Singleton } from "./singleton.ts";
import type { FrameHandler } from "./types.ts";

/**
 * Owns the canvas that WebGPU draws to. It keeps the size of the drawing
 * surface correct and gives each frame to a handler before each screen
 * refresh.
 *
 * @remarks
 * Only one instance exists. The canvas fills the window. A `ResizeObserver`
 * gives the size of the canvas on the screen in device pixels. It reports a
 * new size when the window changes size, and when the window moves to a screen
 * with a different pixel ratio. The canvas keeps the newest size and applies it
 * at the start of the next frame, just before the handler draws. A change of
 * the size clears the canvas. If it happened after the drawing of a frame, the
 * page would show a cleared canvas. The frame loop uses `requestAnimationFrame`,
 * so the browser sets the speed of the frames and pauses them when the window
 * is hidden.
 */
export class Canvas {
  /** Keeps the one instance. */
  private static readonly holder = new Singleton("Canvas");

  /** The observer that reports the size of the canvas. */
  private readonly sizeObserver: ResizeObserver;

  /** `true` while the frame loop runs. */
  private running = false;

  /** The id of the next frame request. It is `undefined` when none waits. */
  private frameRequest: number | undefined;

  /** The function that draws the frames. It is `undefined` until `start` runs. */
  private handler: FrameHandler | undefined;

  /**
   * The newest size that the observer reported, in device pixels. It is
   * `undefined` when the surface has this size already.
   */
  private pendingSize: { width: number; height: number } | undefined;

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
   * canvas.start((frame) => backend.render(frame));
   * ```
   */
  public constructor(
    /** The canvas that WebGPU draws to. */
    public readonly surface: HTMLCanvasElement,
  ) {
    Canvas.holder.assertEmpty();
    this.sizeObserver = new ResizeObserver((entries) => this.resize(entries));
    this.sizeObserver.observe(surface, CANVAS_OBSERVED_BOX);
    Canvas.holder.claim();
  }

  /** The width of the surface divided by its height. */
  public get aspectRatio(): number {
    return this.surface.width / this.surface.height;
  }

  /**
   * Start the frame loop. The first frame comes before the next screen
   * refresh. Do nothing if the loop runs.
   *
   * @param handler - The function that draws each frame.
   */
  public start(handler: FrameHandler): void {
    if (this.running) {
      return;
    }
    this.handler = handler;
    this.running = true;
    this.requestFrame();
  }

  /** Stop the frame loop. The handler gets no more frames. */
  public stop(): void {
    this.running = false;
    if (this.frameRequest !== undefined) {
      cancelAnimationFrame(this.frameRequest);
      this.frameRequest = undefined;
    }
  }

  /**
   * Keep the newest size of the canvas on the screen. The surface gets this
   * size at the start of the next frame, not now.
   *
   * @param entries - The size reports from the `ResizeObserver`.
   */
  private resize(entries: readonly ResizeObserverEntry[]): void {
    for (const entry of entries) {
      const [size] = entry.devicePixelContentBoxSize;
      this.pendingSize = {
        width: Math.max(1, size.inlineSize),
        height: Math.max(1, size.blockSize),
      };
    }
  }

  /**
   * Give the surface the newest size. A change of the size clears the canvas, so
   * this must happen just before the handler draws and not after it. Do
   * nothing for a size that the surface has already.
   */
  private applyPendingSize(): void {
    const size = this.pendingSize;
    this.pendingSize = undefined;
    if (!size) {
      return;
    }
    if (this.surface.width !== size.width) {
      this.surface.width = size.width;
    }
    if (this.surface.height !== size.height) {
      this.surface.height = size.height;
    }
  }

  /** Ask the browser to call `tick` before the next screen refresh. */
  private requestFrame(): void {
    this.frameRequest = requestAnimationFrame((time) => this.tick(time));
  }

  /**
   * Give the frame to the handler, then ask for the next frame if the loop
   * runs.
   *
   * @param time - The time of the frame, in milliseconds.
   */
  private tick(time: number): void {
    this.frameRequest = undefined;
    this.applyPendingSize();
    this.handler?.({ time, aspectRatio: this.aspectRatio });
    if (this.running) {
      this.requestFrame();
    }
  }
}
