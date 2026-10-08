/**
 * The `Alert` class.
 *
 * @module
 */
import { Singleton } from "../../singleton.ts";

/**
 * Shows an error to the user in the page.
 *
 * @remarks
 * Only one instance exists. It keeps the element that shows the message. That
 * element is hidden until an error comes.
 */
export class Alert {
  /** Keeps the one instance. */
  private static readonly holder = new Singleton<Alert>("Alert");

  /**
   * The one instance.
   *
   * @throws {Error} When no `Alert` exists yet.
   */
  public static get shared(): Alert {
    return Alert.holder.get();
  }

  /**
   * Keep the element that shows the message.
   *
   * @param target - The element that shows the message. It is hidden until an
   * error comes.
   * @throws {Error} When a `Alert` exists already.
   *
   * @example
   * ```typescript
   * const alert = new Alert(element);
   * alert.show(new Error("WebGPU is not available."));
   * ```
   */
  public constructor(
    /** The element that shows the message. */
    private readonly target: HTMLElement,
  ) {
    Alert.holder.assertEmpty();
    Alert.holder.claim(this);
  }

  /**
   * Show an error in the page. The error also goes to the console.
   *
   * @param error - The error. It can be any value that was thrown.
   */
  public show(error: unknown): void {
    console.error(error);
    this.target.textContent = error instanceof Error
      ? error.message
      : String(error);
    this.target.hidden = false;
  }
}
