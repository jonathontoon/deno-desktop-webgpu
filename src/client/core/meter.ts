/**
 * The `Meter` class.
 *
 * @module
 */
import { FPS_INTERVAL_MS, MS_PER_SECOND } from "../../constants.ts";
import { Singleton } from "../../singleton.ts";

/**
 * Counts the frames and shows the number of frames each second in the page.
 *
 * @remarks
 * Only one instance exists. It keeps the element that shows the number. The
 * number changes after each interval of `FPS_INTERVAL_MS`, so it is easy to
 * read.
 */
export class Meter {
  /** Keeps the one instance. */
  private static readonly holder = new Singleton<Meter>("Meter");

  /**
   * The one instance.
   *
   * @throws {Error} When no `Meter` exists yet.
   */
  public static get shared(): Meter {
    return Meter.holder.get();
  }

  /** The number of frames since the start of the interval. */
  private frames = 0;

  /** The time of the start of the interval. It is `undefined` before the first frame. */
  private intervalStart: number | undefined;

  /**
   * Keep the element that shows the number of frames each second.
   *
   * @param target - The element that shows the number.
   * @throws {Error} When a `Meter` exists already.
   *
   * @example
   * ```typescript
   * const meter = new Meter(element);
   * meter.record(performance.now());
   * ```
   */
  public constructor(
    /** The element that shows the number. */
    private readonly target: HTMLElement,
  ) {
    Meter.holder.assertEmpty();
    Meter.holder.claim(this);
  }

  /**
   * Count one frame. After each interval, show the number of frames each
   * second.
   *
   * @param time - The time of the frame, in milliseconds.
   */
  public record(time: number): void {
    if (this.intervalStart === undefined) {
      this.intervalStart = time;
      return;
    }
    this.frames += 1;
    const elapsed = time - this.intervalStart;
    if (elapsed >= FPS_INTERVAL_MS) {
      const rate = Math.round(this.frames * MS_PER_SECOND / elapsed);
      this.target.textContent = `${rate} FPS`;
      this.frames = 0;
      this.intervalStart = time;
    }
  }
}
