/**
 * Unit tests for `showFailure`.
 *
 * @module
 */
import { assertEquals } from "@std/assert";
import { stub } from "@std/testing/mock";
import { fake } from "../testing/fakes.ts";
import { showFailure } from "./failure.ts";

/** Make a fake element that starts hidden and empty. */
function createTarget(): HTMLElement {
  return fake<HTMLElement>({ hidden: true, textContent: "" });
}

Deno.test("showFailure", async (t) => {
  await t.step("shows the message of an error", () => {
    using _log = stub(console, "error");
    const target = createTarget();
    showFailure(new Error("No WebGPU adapter is available."), target);
    assertEquals(target.textContent, "No WebGPU adapter is available.");
    assertEquals(target.hidden, false);
  });

  await t.step("shows a thrown value that is not an error", () => {
    using _log = stub(console, "error");
    const target = createTarget();
    showFailure("broken", target);
    assertEquals(target.textContent, "broken");
    assertEquals(target.hidden, false);
  });

  await t.step("writes the error to the console", () => {
    using log = stub(console, "error");
    const error = new Error("broken");
    showFailure(error, createTarget());
    assertEquals(log.calls[0].args, [error]);
  });
});
