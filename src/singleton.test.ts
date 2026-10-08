/**
 * Unit tests for `Singleton`.
 *
 * @module
 */
import { assertEquals, assertStrictEquals, assertThrows } from "@std/assert";
import { Singleton } from "./singleton.ts";

Deno.test("get fails before claim", () => {
  const holder = new Singleton<object>("Thing");
  assertThrows(() => holder.get(), Error, "Thing is not initialized.");
});

Deno.test("get gives the instance that claim kept", () => {
  const holder = new Singleton<object>("Thing");
  const instance = {};
  holder.claim(instance);
  assertStrictEquals(holder.get(), instance);
});

Deno.test("claim fails when an instance exists already", () => {
  const holder = new Singleton<object>("Thing");
  const first = {};
  holder.claim(first);
  assertThrows(() => holder.claim({}), Error, "Thing exists already.");
  assertStrictEquals(holder.get(), first);
});

Deno.test("assertEmpty passes on an empty holder and fails on a full one", () => {
  const holder = new Singleton<object>("Thing");
  holder.assertEmpty();
  holder.claim({});
  assertThrows(() => holder.assertEmpty(), Error, "Thing exists already.");
});

Deno.test("a falsy instance counts as an instance", () => {
  const holder = new Singleton<number>("Zero");
  holder.claim(0);
  assertEquals(holder.get(), 0);
  assertThrows(() => holder.claim(1), Error, "Zero exists already.");
});

Deno.test("each holder is independent", () => {
  const first = new Singleton<string>("First");
  const second = new Singleton<string>("Second");
  first.claim("a");
  assertThrows(() => second.get(), Error, "Second is not initialized.");
});
