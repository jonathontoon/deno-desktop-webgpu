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
 * `create` makes one instance only. It runs the factory after it checks that
 * no instance exists, so a second call has no side effect. `get` fails until
 * `create` has run.
 *
 * @typeParam T - The type of the instance that the holder keeps.
 *
 * @example
 * ```typescript
 * class Logger {
 *   private static readonly holder = new Singleton<Logger>("Logger");
 *
 *   public static initialize(): Logger {
 *     return Logger.holder.create(() => new Logger());
 *   }
 *
 *   private constructor() {}
 * }
 * ```
 */
export class Singleton<T> {
  /** The instance. It is `undefined` until `create` runs. */
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
   * @remarks
   * Call this before any slow or costly work that comes before `create`.
   * Then a second call fails at once and does not start that work.
   *
   * @throws {Error} When the holder already has an instance.
   */
  public assertEmpty(): void {
    if (this.instance !== undefined) {
      throw new Error(`${this.name} exists already.`);
    }
  }

  /**
   * Make the instance and keep it.
   *
   * @remarks
   * The factory runs only when the holder is empty. If the holder has an
   * instance, the factory does not run, so it makes no object.
   *
   * @param factory - The function that makes the instance.
   * @returns The new instance.
   * @throws {Error} When the holder already has an instance.
   */
  public create(factory: () => T): T {
    this.assertEmpty();
    this.instance = factory();
    return this.instance;
  }

  /**
   * Give the instance.
   *
   * @returns The instance that `create` kept.
   * @throws {Error} When `create` has not run yet.
   */
  public get(): T {
    if (this.instance === undefined) {
      throw new Error(`${this.name} is not initialized.`);
    }
    return this.instance;
  }
}
