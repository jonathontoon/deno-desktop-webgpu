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
 */
export class Application implements WindowDelegate, RenderLoopDelegate {
  private static readonly holder = new Singleton<Application>("Application");

  /** Open the window, set up the GPU, and start to draw. */
  public static async launch(): Promise<Application> {
    const appWindow = AppWindow.initialize(WINDOW_OPTIONS);
    const gpu = await GPUContext.initialize(appWindow.surface);
    // Set the size after the GPU setup. The old code did the same.
    appWindow.syncSurfaceSize();

    const renderer = Renderer.initialize(gpu, CLEAR_COLOR);
    const scene = Scene.initialize();
    scene.add(new TriangleDrawable(gpu));

    const application = Application.holder.set(
      new Application(appWindow, renderer, scene),
    );
    appWindow.delegate = application;
    application.loop.start();
    return application;
  }

  public static get shared(): Application {
    return Application.holder.get();
  }

  private readonly loop: RenderLoop;

  private constructor(
    private readonly appWindow: AppWindow,
    private readonly renderer: Renderer,
    private readonly scene: Scene,
  ) {
    this.loop = RenderLoop.initialize(this);
  }

  public renderLoopDidTick(time: number): void {
    if (this.appWindow.isClosed()) {
      this.loop.stop();
      return;
    }
    this.renderer.render(this.scene, { time, aspect: this.appWindow.aspect });
    this.appWindow.present();
  }

  public windowDidClose(): void {
    Deno.exit();
  }
}
