/**
 * The `Application` class.
 *
 * @module
 */
import { CLEAR_COLOR, WINDOW_OPTIONS } from "../constants.ts";
import { GPUContext } from "../gpu/gpu-context.ts";
import { Renderer } from "../gpu/renderer.ts";
import { Scene } from "../scene/scene.ts";
import { TriangleDrawable } from "../scene/triangle-drawable.ts";
import { Singleton } from "../singleton.ts";
import type { RenderLoopDelegate, WindowDelegate } from "../types.ts";
import { AppWindow } from "./app-window.ts";
import { RenderLoop } from "./render-loop.ts";

/**
 * Creates the other objects and connects them. It is the delegate of the
 * window and of the render loop.
 *
 * @remarks
 * Only one instance exists. This class is the one place that makes each
 * singleton and gives it to the objects that need it.
 */
export class Application implements WindowDelegate, RenderLoopDelegate {
  /** Keeps the one instance. */
  private static readonly holder = new Singleton<Application>("Application");

  /**
   * Open the window, set up the GPU, and start to draw.
   *
   * @returns The new `Application`.
   * @throws {Error} When the GPU setup fails.
   * @throws {Error} When an `Application` exists already.
   *
   * @example
   * ```typescript
   * await Application.launch();
   * ```
   */
  public static async launch(): Promise<Application> {
    Application.holder.assertEmpty();
    const appWindow = AppWindow.initialize(WINDOW_OPTIONS);
    const gpu = await GPUContext.initialize(appWindow.surface);
    appWindow.syncSurfaceSize();

    const renderer = Renderer.initialize(gpu, CLEAR_COLOR);
    const scene = Scene.initialize();
    scene.add(new TriangleDrawable(gpu));

    const application = Application.holder.create(
      () => new Application(appWindow, renderer, scene),
    );
    appWindow.delegate = application;
    application.loop.start();
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

  /** The loop that gives a tick for each frame. */
  private readonly loop: RenderLoop;

  /**
   * Keep the parts and make the render loop. Use `launch` to make an
   * instance.
   *
   * @param appWindow - The window that shows the frames.
   * @param renderer - The object that draws one frame.
   * @param scene - The drawables to draw in each frame.
   */
  private constructor(
    /** The window that shows the frames. */
    private readonly appWindow: AppWindow,
    /** The object that draws one frame. */
    private readonly renderer: Renderer,
    /** The drawables to draw in each frame. */
    private readonly scene: Scene,
  ) {
    this.loop = RenderLoop.initialize(this);
  }

  /**
   * Draw one frame and show it. Stop the loop if the window is closed.
   *
   * @param time - The time, in milliseconds.
   */
  public renderLoopDidRequestFrame(time: number): void {
    if (this.appWindow.isClosed()) {
      this.loop.stop();
      return;
    }
    this.renderer.render(this.scene, {
      time,
      aspectRatio: this.appWindow.aspectRatio,
    });
    this.appWindow.present();
  }

  /** End the program. */
  public windowDidClose(): void {
    Deno.exit();
  }
}
