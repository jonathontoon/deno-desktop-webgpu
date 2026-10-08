/**
 * Unit tests for `Singleton`.
 *
 * @module
 */
import { assertEquals, assertStrictEquals, assertThrows } from "@std/assert";
import { Singleton } from "./singleton.ts";

Deno.test("get fails before create", () => {
  const holder = new Singleton<object>("Thing");
  assertThrows(() => holder.get(), Error, "Thing is not initialized.");
});

Deno.test("create returns the instance and get gives it back", () => {
  const holder = new Singleton<object>("Thing");
  const instance = {};
  assertStrictEquals(holder.create(() => instance), instance);
  assertStrictEquals(holder.get(), instance);
});

Deno.test("create fails when an instance exists already", () => {
  const holder = new Singleton<object>("Thing");
  const first = {};
  holder.create(() => first);
  assertThrows(() => holder.create(() => ({})), Error, "Thing exists already.");
  assertStrictEquals(holder.get(), first);
});

Deno.test("create does not run the factory when an instance exists", () => {
  const holder = new Singleton<object>("Thing");
  holder.create(() => ({}));
  let factoryCalls = 0;
  assertThrows(
    () =>
      holder.create(() => {
        factoryCalls += 1;
        return {};
      }),
    Error,
    "Thing exists already.",
  );
  assertEquals(factoryCalls, 0);
});

Deno.test("create keeps nothing when the factory throws", () => {
  const holder = new Singleton<object>("Thing");
  assertThrows(
    () =>
      holder.create(() => {
        throw new Error("factory failed");
      }),
    Error,
    "factory failed",
  );
  assertThrows(() => holder.get(), Error, "Thing is not initialized.");
  const instance = {};
  assertStrictEquals(holder.create(() => instance), instance);
});

Deno.test("assertEmpty passes on an empty holder and fails on a full one", () => {
  const holder = new Singleton<object>("Thing");
  holder.assertEmpty();
  holder.create(() => ({}));
  assertThrows(() => holder.assertEmpty(), Error, "Thing exists already.");
});

Deno.test("a falsy instance counts as an instance", () => {
  const holder = new Singleton<number>("Zero");
  holder.create(() => 0);
  assertEquals(holder.get(), 0);
  assertThrows(() => holder.create(() => 1), Error, "Zero exists already.");
});

Deno.test("each holder is independent", () => {
  const first = new Singleton<string>("First");
  const second = new Singleton<string>("Second");
  first.create(() => "a");
  assertThrows(() => second.get(), Error, "Second is not initialized.");
});
