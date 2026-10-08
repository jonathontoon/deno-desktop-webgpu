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
 * Only one instance exists. It gets the version that the server gave to the
 * page. It asks the server for the version of the files at a fixed interval. A
 * different answer means that a file changed after the server sent the page.
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

  /**
   * Keep the version of the page and the function that loads the page again.
   *
   * @param version - The version that the server gave to the page.
   * @param reload - The function that loads the page again.
   * @throws {Error} When a `Reloader` exists already.
   *
   * @example
   * ```typescript
   * new Reloader(version, () => location.reload()).start();
   * ```
   */
  public constructor(
    /** The version that the server gave to the page. */
    private readonly version: string,
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
      if ((await answer.text()) !== this.version) {
        this.reload();
      }
    } catch {
      // Try again at the next check.
    }
  }
}
