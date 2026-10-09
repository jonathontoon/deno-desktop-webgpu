/**
 * Unit tests for `showAlert`.
 *
 * @module
 */
import { assertEquals } from "@std/assert";
import { stub } from "@std/testing/mock";
import { fake } from "../testing/fakes.ts";
import { showAlert } from "./alert.ts";

/** Make a fake element that starts hidden and empty. */
function createTarget(): HTMLElement {
  return fake<HTMLElement>({ hidden: true, textContent: "" });
}

Deno.test("showAlert", async (t) => {
  await t.step("shows the message of an error", () => {
    using _log = stub(console, "error");
    const target = createTarget();
    showAlert(target, new Error("No WebGPU adapter is available."));
    assertEquals(target.textContent, "No WebGPU adapter is available.");
    assertEquals(target.hidden, false);
  });

  await t.step("shows a thrown value that is not an error", () => {
    using _log = stub(console, "error");
    const target = createTarget();
    showAlert(target, "broken");
    assertEquals(target.textContent, "broken");
    assertEquals(target.hidden, false);
  });

  await t.step("writes the error to the console", () => {
    using log = stub(console, "error");
    const error = new Error("broken");
    showAlert(createTarget(), error);
    assertEquals(log.calls[0].args, [error]);
  });

  await t.step("changes only the element that it gets", () => {
    using _log = stub(console, "error");
    const other = createTarget();
    showAlert(createTarget(), new Error("broken"));
    assertEquals(other.hidden, true);
    assertEquals(other.textContent, "");
  });
});
