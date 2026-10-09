/**
 * The `runDevelopment` function.
 *
 * @module
 */
import {
  BUNDLE_ARGUMENTS,
  DESKTOP_ARGUMENTS,
  WATCH_ARGUMENT,
} from "../../constants.ts";
import type { SpawnProcess } from "../../types.ts";

/**
 * Run the app for development: bundle the page script, bundle it again after
 * each change, and show the app with hot reloading.
 *
 * @remarks
 * The function stops the bundler when the app ends, for example when the user
 * closes the window. So no bundler stays alive.
 *
 * @param spawn - The function that starts `deno` as a child process.
 * @returns The exit code. If the first bundle fails, this is the code of the
 * bundle. If not, this is the code of the app.
 *
 * @example
 * ```typescript
 * Deno.exit(await runDevelopment(spawn));
 * ```
 */
export async function runDevelopment(spawn: SpawnProcess): Promise<number> {
  const first = await spawn(BUNDLE_ARGUMENTS).status;
  if (!first.success) {
    return first.code;
  }
  const watcher = spawn([...BUNDLE_ARGUMENTS, WATCH_ARGUMENT]);
  try {
    return (await spawn(DESKTOP_ARGUMENTS).status).code;
  } finally {
    watcher.kill();
  }
}
