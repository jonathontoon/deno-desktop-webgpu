/**
 * The `Singleton` helper class.
 *
 * @module
 */

/**
 * Holds the one instance of a class.
 *
 * @remarks
 * Each singleton class owns one holder in a `private static` field.
 * `set` accepts one instance only. `get` fails until `set` has run.
 *
 * @typeParam T - The type of the instance that the holder keeps.
 *
 * @example
 * ```typescript
 * class Logger {
 *   private static readonly holder = new Singleton<Logger>("Logger");
 *
 *   public static initialize(): Logger {
 *     return Logger.holder.set(new Logger());
 *   }
 *
 *   private constructor() {}
 * }
 * ```
 */
export class Singleton<T> {
  /** The instance. It is `undefined` until `set` runs. */
  private instance: T | undefined;

  /**
   * Make a holder with no instance in it.
   *
   * @param name - The name of the class. Error messages use it.
   */
  public constructor(private readonly name: string) {}

  /**
   * Keep the instance.
   *
   * @param instance - The instance to keep.
   * @returns The same instance.
   * @throws {Error} When the holder already has an instance.
   */
  public set(instance: T): T {
    if (this.instance !== undefined) {
      throw new Error(`${this.name} exists already.`);
    }
    this.instance = instance;
    return instance;
  }

  /**
   * Give the instance.
   *
   * @returns The instance that `set` kept.
   * @throws {Error} When `set` has not run yet.
   */
  public get(): T {
    if (this.instance === undefined) {
      throw new Error(`${this.name} is not initialized.`);
    }
    return this.instance;
  }
}
