/**
 * The `AppWindow` class.
 *
 * @module
 */
import { Singleton } from "../singleton.ts";
import type {
  AppWindowOptions,
  NativeSurface,
  WindowDelegate,
} from "../types.ts";

/**
 * Owns the native window and its drawing surface.
 *
 * @remarks
 * Only one instance exists. The window tells its `delegate` about events.
 * The surface is the part of the window that WebGPU draws to.
 */
export class AppWindow {
  /** Keeps the one instance. */
  private static readonly holder = new Singleton<AppWindow>("AppWindow");

  /**
   * Open the window.
   *
   * @param options - The title and the size of the window.
   * @returns The new `AppWindow`.
   * @throws {Error} When an `AppWindow` exists already.
   *
   * @example
   * ```typescript
   * const appWindow = AppWindow.initialize(WINDOW_OPTIONS);
   * ```
   */
  public static initialize(options: AppWindowOptions): AppWindow {
    return AppWindow.holder.set(new AppWindow(options));
  }

  /**
   * The one instance.
   *
   * @throws {Error} When `initialize` has not run yet.
   */
  public static get shared(): AppWindow {
    return AppWindow.holder.get();
  }

  /** The window tells this object about events. It is optional. */
  public delegate: WindowDelegate | undefined;

  /** The part of the window that WebGPU draws to. */
  public readonly surface: NativeSurface;

  /** The native window from Deno. */
  private readonly window: Deno.BrowserWindow;

  /**
   * Open the native window and listen for its events. Use `initialize` to
   * make an instance.
   *
   * @param options - The title and the size of the window.
   */
  private constructor(options: AppWindowOptions) {
    this.window = new Deno.BrowserWindow(options);
    this.surface = this.window.getNativeWindow();
    this.window.addEventListener("resize", () => this.syncSurfaceSize());
    this.window.addEventListener(
      "close",
      () => this.delegate?.windowDidClose(),
    );
  }

  /** The width of the surface divided by its height. */
  public get aspectRatio(): number {
    return this.surface.width / this.surface.height;
  }

  /**
   * Find out if the user closed the window.
   *
   * @returns `true` if the window is closed.
   */
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
