/**
 * The `Reloader` class.
 *
 * @module
 */
import { RELOAD_INTERVAL_MS, VERSION_PATH } from "../../constants.ts";
import { Singleton } from "../../singleton.ts";

/**
 * Loads the page again when a file of the page changes. It is for development
 * mode.
 *
 * @remarks
 * Only one instance exists. It asks the server for the version of the files at
 * a fixed interval. The first answer is the version that the page has. A
 * different answer later means that a file changed.
 */
export class Reloader {
  /** Keeps the one instance. */
  private static readonly holder = new Singleton<Reloader>("Reloader");

  /**
   * The one instance.
   *
   * @throws {Error} When no `Reloader` exists yet.
   */
  public static get shared(): Reloader {
    return Reloader.holder.get();
  }

  /** The version that the page has. It is `undefined` before the first answer. */
  private version: string | undefined;

  /**
   * Keep the function that loads the page again.
   *
   * @param reload - The function that loads the page again.
   * @throws {Error} When a `Reloader` exists already.
   *
   * @example
   * ```typescript
   * new Reloader(() => location.reload()).start();
   * ```
   */
  public constructor(
    /** The function that loads the page again. */
    private readonly reload: () => void,
  ) {
    Reloader.holder.assertEmpty();
    Reloader.holder.claim(this);
  }

  /** Start to ask the server for changes. */
  public start(): void {
    setInterval(() => void this.check(), RELOAD_INTERVAL_MS);
  }

  /**
   * Ask the server for the version of the files. Load the page again if it is
   * not the version that the page has. An error is not a change: the server can
   * be busy, so the next check tries again.
   */
  private async check(): Promise<void> {
    try {
      const answer = await fetch(VERSION_PATH, { cache: "no-store" });
      const version = await answer.text();
      if (this.version === undefined) {
        this.version = version;
      } else if (version !== this.version) {
        this.reload();
      }
    } catch {
      // Try again at the next check.
    }
  }
}
