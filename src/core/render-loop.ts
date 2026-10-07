/**
 * The `RenderLoop` class.
 *
 * @module
 */
import { FRAME_MS } from "../constants.ts";
import { Singleton } from "../singleton.ts";
import type { RenderLoopDelegate } from "../types.ts";

/**
 * Calls its delegate again and again, about 60 times each second.
 *
 * @remarks
 * Only one instance exists. The raw backend has no DOM, so there is no
 * `requestAnimationFrame`. This class uses `setTimeout` instead.
 */
export class RenderLoop {
  /** Keeps the one instance. */
  private static readonly holder = new Singleton<RenderLoop>("RenderLoop");

  /**
   * Make the loop. The loop does not run until `start` is called.
   *
   * @param delegate - The object that draws a frame at each tick.
   * @param frameMs - The time between two ticks, in milliseconds.
   * @returns The new `RenderLoop`.
   * @throws {Error} When a `RenderLoop` exists already.
   */
  public static initialize(
    delegate: RenderLoopDelegate,
    frameMs: number = FRAME_MS,
  ): RenderLoop {
    return RenderLoop.holder.set(new RenderLoop(delegate, frameMs));
  }

  /**
   * The one instance.
   *
   * @throws {Error} When `initialize` has not run yet.
   */
  public static get shared(): RenderLoop {
    return RenderLoop.holder.get();
  }

  /** `true` while the loop runs. */
  private running = false;

  /** The timer of the next tick. It is `undefined` when no tick waits. */
  private timer: ReturnType<typeof setTimeout> | undefined;

  /**
   * Keep the delegate and the frame time. Use `initialize` to make an
   * instance.
   *
   * @param delegate - The object that draws a frame at each tick.
   * @param frameMs - The time between two ticks, in milliseconds.
   */
  private constructor(
    /** The object that draws a frame at each tick. */
    private readonly delegate: RenderLoopDelegate,
    /** The time between two ticks, in milliseconds. */
    private readonly frameMs: number,
  ) {}

  /** Start the loop. The first tick happens at once. Do nothing if the loop runs. */
  public start(): void {
    if (this.running) {
      return;
    }
    this.running = true;
    this.tick();
  }

  /** Stop the loop. The delegate gets no more ticks. */
  public stop(): void {
    this.running = false;
    if (this.timer !== undefined) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
  }

  /** Tell the delegate to draw, then plan the next tick if the loop still runs. */
  private tick(): void {
    this.delegate.renderLoopDidTick(performance.now());
    if (this.running) {
      this.timer = setTimeout(() => this.tick(), this.frameMs);
    }
  }
}
