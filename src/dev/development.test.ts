/**
 * Unit tests for `runDevelopment`.
 *
 * @module
 */
import { assertEquals, assertRejects } from "@std/assert";
import {
  BUNDLE_ARGUMENTS,
  DESKTOP_ARGUMENTS,
  WATCH_ARGUMENT,
} from "../constants.ts";
import type { ProcessStatus, SpawnProcess } from "../types.ts";
import { runDevelopment } from "./development.ts";

/** What a fake child process does when it is started. */
type Outcome = ProcessStatus | Error;

/** Make a spawn function that records the calls and gives the outcomes in order. */
function createSpawn(outcomes: Outcome[]) {
  const events: string[] = [];
  const spawn: SpawnProcess = (args) => {
    const name = args.join(" ");
    events.push(`start ${name}`);
    const outcome = outcomes.shift() ?? { success: true, code: 0 };
    return {
      status: outcome instanceof Error
        ? Promise.reject(outcome)
        : Promise.resolve(outcome),
      kill: () => void events.push(`kill ${name}`),
    };
  };
  return { spawn, events };
}

const BUNDLE = BUNDLE_ARGUMENTS.join(" ");
const WATCH = [...BUNDLE_ARGUMENTS, WATCH_ARGUMENT].join(" ");
const DESKTOP = DESKTOP_ARGUMENTS.join(" ");

Deno.test("runDevelopment", async (t) => {
  await t.step("bundles, starts the bundler, then starts the app", async () => {
    const { spawn, events } = createSpawn([]);
    await runDevelopment(spawn);
    assertEquals(events.slice(0, 3), [
      `start ${BUNDLE}`,
      `start ${WATCH}`,
      `start ${DESKTOP}`,
    ]);
  });

  await t.step("stops the bundler when the app ends", async () => {
    const { spawn, events } = createSpawn([]);
    await runDevelopment(spawn);
    assertEquals(events.at(-1), `kill ${WATCH}`);
  });

  await t.step("gives the exit code of the app", async () => {
    const { spawn } = createSpawn([
      { success: true, code: 0 },
      { success: true, code: 0 },
      { success: false, code: 3 },
    ]);
    assertEquals(await runDevelopment(spawn), 3);
  });

  await t.step("stops the bundler when the app fails to start", async () => {
    const { spawn, events } = createSpawn([
      { success: true, code: 0 },
      { success: true, code: 0 },
      new Error("no desktop"),
    ]);
    await assertRejects(() => runDevelopment(spawn), Error, "no desktop");
    assertEquals(events.at(-1), `kill ${WATCH}`);
  });

  await t.step("starts nothing else when the first bundle fails", async () => {
    const { spawn, events } = createSpawn([{ success: false, code: 2 }]);
    assertEquals(await runDevelopment(spawn), 2);
    assertEquals(events, [`start ${BUNDLE}`]);
  });
});
