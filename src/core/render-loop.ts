import { FRAME_MS } from "../constants.ts";
import { Singleton } from "../singleton.ts";
import type { RenderLoopDelegate } from "../types.ts";

/**
 * Calls its delegate again and again, about 60 times each second.
 * The raw backend has no DOM, so there is no `requestAnimationFrame`.
 * This class uses `setTimeout` instead.
 */
export class RenderLoop {
  private static readonly holder = new Singleton<RenderLoop>("RenderLoop");

  public static initialize(
    delegate: RenderLoopDelegate,
    frameMs: number = FRAME_MS,
  ): RenderLoop {
    return RenderLoop.holder.set(new RenderLoop(delegate, frameMs));
  }

  public static get shared(): RenderLoop {
    return RenderLoop.holder.get();
  }

  private running = false;
  private timer: ReturnType<typeof setTimeout> | undefined;

  private constructor(
    private readonly delegate: RenderLoopDelegate,
    private readonly frameMs: number,
  ) {}

  public start(): void {
    if (this.running) {
      return;
    }
    this.running = true;
    this.tick();
  }

  public stop(): void {
    this.running = false;
    if (this.timer !== undefined) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
  }

  private tick(): void {
    this.delegate.renderLoopDidTick(performance.now());
    if (this.running) {
      this.timer = setTimeout(() => this.tick(), this.frameMs);
    }
  }
}
