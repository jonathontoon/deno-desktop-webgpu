/**
 * Unit tests for `Singleton`.
 *
 * @module
 */
import { assertEquals, assertStrictEquals, assertThrows } from "@std/assert";
import { Singleton } from "./singleton.ts";

Deno.test("get fails before set", () => {
  const holder = new Singleton<object>("Thing");
  assertThrows(() => holder.get(), Error, "Thing is not initialized.");
});

Deno.test("set returns the instance and get gives it back", () => {
  const holder = new Singleton<object>("Thing");
  const instance = {};
  assertStrictEquals(holder.set(instance), instance);
  assertStrictEquals(holder.get(), instance);
});

Deno.test("set fails when an instance exists already", () => {
  const holder = new Singleton<object>("Thing");
  const first = {};
  holder.set(first);
  assertThrows(() => holder.set({}), Error, "Thing exists already.");
  assertStrictEquals(holder.get(), first);
});

Deno.test("a falsy instance counts as an instance", () => {
  const holder = new Singleton<number>("Zero");
  holder.set(0);
  assertEquals(holder.get(), 0);
  assertThrows(() => holder.set(1), Error, "Zero exists already.");
});

Deno.test("each holder is independent", () => {
  const first = new Singleton<string>("First");
  const second = new Singleton<string>("Second");
  first.set("a");
  assertThrows(() => second.get(), Error, "Second is not initialized.");
});
