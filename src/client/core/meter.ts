/**
 * The `Meter` class.
 *
 * @module
 */
import {
  METER_INTERVAL_MS,
  METER_TICK_MS,
  MS_PER_SECOND,
} from "../../constants.ts";

/**
 * Shows in the page how well the page runs: the number of animation frames and
 * timer ticks each second, the number of size reports, and the longest wait
 * between two frames and between two ticks.
 *
 * @remarks
 * It has its own frame loop and its own timer, and it does not depend on the
 * `Canvas`. So it still counts when the drawing is slow
 * or stopped. A long wait between frames, but not between ticks, means that the
 * browser did not give frames. A long wait between ticks means that the whole
 * page was stopped.
 */
export class Meter {
  /** The number of animation frames in the last interval. */
  private frames = 0;

  /** The number of timer ticks in the last interval. */
  private ticks = 0;

  /** The number of size reports since the start. */
  private sizeReports = 0;

  /** The time of the last frame. It is `undefined` before the first frame. */
  private lastFrame: number | undefined;

  /** The time of the last tick. It is `undefined` before the start. */
  private lastTick: number | undefined;

  /** The time when the meter showed the numbers last, or the time of the start. */
  private lastShown = 0;

  /** The longest wait between two frames since the start, in milliseconds. */
  private worstFrameGap = 0;

  /** The longest wait between two ticks since the start, in milliseconds. */
  private worstTickGap = 0;

  /**
   * Keep the element that shows the numbers and the canvas that it watches.
   *
   * @param target - The element that shows the numbers.
   * @param surface - The canvas to watch for size changes.
   *
   * @example
   * ```typescript
   * new Meter(element, canvas).start();
   * ```
   */
  public constructor(
    /** The element that shows the numbers. */
    private readonly target: HTMLElement,
    /** The canvas to watch for size changes. */
    private readonly surface: HTMLCanvasElement,
  ) {}

  /** Start to count and to show the numbers. */
  public start(): void {
    this.lastTick = Date.now();
    this.lastShown = this.lastTick;
    requestAnimationFrame(this.onFrame);
    setInterval(this.onTick, METER_TICK_MS);
    new ResizeObserver(() => {
      this.sizeReports += 1;
    }).observe(this.surface);
  }

  /**
   * Count one animation frame and keep the longest wait.
   *
   * @param time - The time of the frame, in milliseconds.
   */
  private readonly onFrame = (time: number): void => {
    this.frames += 1;
    if (this.lastFrame !== undefined) {
      this.worstFrameGap = Math.max(this.worstFrameGap, time - this.lastFrame);
    }
    this.lastFrame = time;
    requestAnimationFrame(this.onFrame);
  };

  /**
   * Count one timer tick and keep the longest wait. After each interval, show
   * the numbers. The tick shows them, so each interval has the same number of
   * ticks.
   */
  private readonly onTick = (): void => {
    const now = Date.now();
    this.ticks += 1;
    if (this.lastTick !== undefined) {
      this.worstTickGap = Math.max(this.worstTickGap, now - this.lastTick);
    }
    this.lastTick = now;
    if (now - this.lastShown >= METER_INTERVAL_MS) {
      this.lastShown = now;
      this.show();
    }
  };

  /** Show the numbers. Then start to count the frames and ticks again. */
  private show(): void {
    this.target.textContent = [
      `frames/s ${this.frames}`,
      `ticks/s ${this.ticks} (${MS_PER_SECOND / METER_TICK_MS} is normal)`,
      `size reports ${this.sizeReports}`,
      `worst frame gap ${Math.round(this.worstFrameGap)} ms`,
      `worst tick gap ${Math.round(this.worstTickGap)} ms`,
      `canvas ${this.surface.width}x${this.surface.height}`,
    ].join("\n");
    this.frames = 0;
    this.ticks = 0;
  }
}
