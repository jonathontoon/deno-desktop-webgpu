/**
 * Entry point of `deno task dev`. It runs the app for development.
 *
 * @module
 */
import type { SpawnProcess } from "../types.ts";
import { runDevelopment } from "./development.ts";

const spawn: SpawnProcess = (args) => {
  const child = new Deno.Command(Deno.execPath(), { args: [...args] }).spawn();
  return {
    status: child.status,
    kill: () => {
      try {
        child.kill();
      } catch {
        // The process ended already.
      }
    },
  };
};

Deno.exit(await runDevelopment(spawn));
