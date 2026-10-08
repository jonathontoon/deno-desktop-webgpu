/**
 * Unit tests for `Alert`.
 *
 * @module
 */
import { assertEquals, assertStrictEquals, assertThrows } from "@std/assert";
import { stub } from "@std/testing/mock";
import { fake } from "../../testing/fakes.ts";
import { Alert } from "./alert.ts";

/** Make a fake element that starts hidden and empty. */
function createTarget(): HTMLElement {
  return fake<HTMLElement>({ hidden: true, textContent: "" });
}

Deno.test("Alert", async (t) => {
  await t.step("shared fails before a Alert exists", () => {
    assertThrows(
      () => Alert.shared,
      Error,
      "Alert is not initialized.",
    );
  });

  const target = createTarget();
  const alert = new Alert(target);

  await t.step("the constructor does not show the element", () => {
    assertEquals(target.hidden, true);
    assertEquals(target.textContent, "");
  });

  await t.step("shared gives the instance", () => {
    assertStrictEquals(Alert.shared, alert);
  });

  await t.step("a second Alert fails", () => {
    assertThrows(
      () => new Alert(createTarget()),
      Error,
      "Alert exists already.",
    );
  });

  await t.step("show shows the message of an error", () => {
    using _log = stub(console, "error");
    alert.show(new Error("No WebGPU adapter is available."));
    assertEquals(target.textContent, "No WebGPU adapter is available.");
    assertEquals(target.hidden, false);
  });

  await t.step("show shows a thrown value that is not an error", () => {
    using _log = stub(console, "error");
    alert.show("broken");
    assertEquals(target.textContent, "broken");
  });

  await t.step("show writes the error to the console", () => {
    using log = stub(console, "error");
    const error = new Error("broken");
    alert.show(error);
    assertEquals(log.calls[0].args, [error]);
  });
});
