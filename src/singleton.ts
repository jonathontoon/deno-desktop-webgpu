/**
 * The `Singleton` helper class.
 *
 * @module
 */

/**
 * Holds the one instance of a class.
 *
 * @remarks
 * Each singleton class owns one holder in a `private static` field. The
 * constructor of the class has two calls. The first line calls `assertEmpty`,
 * so a second `new` fails before it does any work. The last line calls `claim`,
 * so the holder keeps only an object that the constructor made without a
 * failure. `get` fails until `claim` has run.
 *
 * @typeParam T - The type of the instance that the holder keeps.
 *
 * @example
 * ```typescript
 * class Logger {
 *   private static readonly holder = new Singleton<Logger>("Logger");
 *
 *   public static get shared(): Logger {
 *     return Logger.holder.get();
 *   }
 *
 *   public constructor() {
 *     Logger.holder.assertEmpty();
 *     Logger.holder.claim(this);
 *   }
 * }
 * ```
 */
export class Singleton<T> {
  /** The instance. It is `undefined` until `claim` runs. */
  private instance: T | undefined;

  /**
   * Make a holder with no instance in it.
   *
   * @param name - The name of the class. Error messages use it.
   */
  public constructor(private readonly name: string) {}

  /**
   * Make sure that the holder is empty.
   *
   * @throws {Error} When the holder already has an instance.
   */
  public assertEmpty(): void {
    if (this.instance !== undefined) {
      throw new Error(`${this.name} exists already.`);
    }
  }

  /**
   * Keep the instance.
   *
   * @param instance - The object that the constructor made.
   * @throws {Error} When the holder already has an instance.
   */
  public claim(instance: T): void {
    this.assertEmpty();
    this.instance = instance;
  }

  /**
   * Give the instance.
   *
   * @returns The instance that `claim` kept.
   * @throws {Error} When `claim` has not run yet.
   */
  public get(): T {
    if (this.instance === undefined) {
      throw new Error(`${this.name} is not initialized.`);
    }
    return this.instance;
  }
}
