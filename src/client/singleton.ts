/**
 * The `Singleton` helper class.
 *
 * @module
 */

/**
 * Guards a class that can have only one instance.
 *
 * @remarks
 * Each singleton class owns one holder in a `private static` field. The
 * constructor of the class has two calls. The first line calls `assertEmpty`,
 * so a second `new` fails before it does any work. The last line calls `claim`,
 * so the holder is full only after a constructor ran without a failure.
 *
 * @example
 * ```typescript
 * class Window {
 *   private static readonly holder = new Singleton("Window");
 *
 *   public constructor() {
 *     Window.holder.assertEmpty();
 *     Window.holder.claim();
 *   }
 * }
 * ```
 */
export class Singleton {
  /** `true` after `claim` has run. */
  private claimed = false;

  /**
   * Make an empty holder.
   *
   * @param name - The name of the class. Error messages use it.
   */
  public constructor(private readonly name: string) {}

  /**
   * Make sure that the holder is empty.
   *
   * @throws {Error} When the holder is full.
   */
  public assertEmpty(): void {
    if (this.claimed) {
      throw new Error(`${this.name} exists already.`);
    }
  }

  /**
   * Fill the holder.
   *
   * @throws {Error} When the holder is full.
   */
  public claim(): void {
    this.assertEmpty();
    this.claimed = true;
  }
}
