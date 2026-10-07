import { Singleton } from "../singleton.ts";
import type {
  AppWindowOptions,
  NativeSurface,
  WindowDelegate,
} from "../types.ts";

/** Owns the native window and its drawing surface. */
export class AppWindow {
  private static readonly holder = new Singleton<AppWindow>("AppWindow");

  public static initialize(options: AppWindowOptions): AppWindow {
    return AppWindow.holder.set(new AppWindow(options));
  }

  public static get shared(): AppWindow {
    return AppWindow.holder.get();
  }

  /** The window tells this object about events. It is optional. */
  public delegate: WindowDelegate | undefined;

  public readonly surface: NativeSurface;
  private readonly window: Deno.BrowserWindow;

  private constructor(options: AppWindowOptions) {
    this.window = new Deno.BrowserWindow(options);
    this.surface = this.window.getNativeWindow();
    this.window.addEventListener("resize", () => this.syncSurfaceSize());
    this.window.addEventListener(
      "close",
      () => this.delegate?.windowDidClose(),
    );
  }

  /** Width of the surface divided by its height. */
  public get aspect(): number {
    return this.surface.width / this.surface.height;
  }

  public isClosed(): boolean {
    return this.window.isClosed();
  }

  /** Show the frame that was drawn. */
  public present(): void {
    this.surface.present();
  }

  /** Make the surface the same size as the window. */
  public syncSurfaceSize(): void {
    const [width, height] = this.window.getSize();
    this.surface.width = width;
    this.surface.height = height;
  }
}
