/**
 * The `reloadOnChange` function.
 *
 * @module
 */
import { RELOAD_INTERVAL_MS } from "../constants.ts";
import { VERSION_PATH } from "../../constants.ts";

/**
 * Ask the server for the version of the page files at each interval. Call
 * `reload` when the version is not the one that the page has.
 *
 * @remarks
 * An error of the server is ignored. The next check tries again.
 *
 * @param version - The version that the server put in the page.
 * @param reload - The function that loads the page again.
 *
 * @example
 * ```typescript
 * reloadOnChange(version, () => location.reload());
 * ```
 */
export function reloadOnChange(version: string, reload: () => void): void {
  setInterval(() => void check(version, reload), RELOAD_INTERVAL_MS);
}

/**
 * Ask the server for the version one time, and call `reload` if it differs.
 *
 * @param version - The version that the server put in the page.
 * @param reload - The function that loads the page again.
 */
async function check(version: string, reload: () => void): Promise<void> {
  try {
    const answer = await fetch(VERSION_PATH, { cache: "no-store" });
    if ((await answer.text()) !== version) {
      reload();
    }
  } catch {
    // Try again at the next check.
  }
}
