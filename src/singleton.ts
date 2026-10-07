/**
 * Holds the one instance of a class. Each singleton class owns one holder.
 * `set` accepts one instance only. `get` fails until `set` has run.
 */
export class Singleton<T> {
  private instance: T | undefined;

  public constructor(private readonly name: string) {}

  public set(instance: T): T {
    if (this.instance !== undefined) {
      throw new Error(`${this.name} exists already.`);
    }
    this.instance = instance;
    return instance;
  }

  public get(): T {
    if (this.instance === undefined) {
      throw new Error(`${this.name} is not initialized.`);
    }
    return this.instance;
  }
}
