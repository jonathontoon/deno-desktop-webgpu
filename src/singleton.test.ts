/**
 * Unit tests for `Singleton`.
 *
 * @module
 */
import { assertThrows } from "@std/assert";
import { Singleton } from "./singleton.ts";

Deno.test("assertEmpty passes on an empty holder", () => {
  new Singleton("Thing").assertEmpty();
});

Deno.test("assertEmpty fails on a full holder", () => {
  const holder = new Singleton("Thing");
  holder.claim();
  assertThrows(() => holder.assertEmpty(), Error, "Thing exists already.");
});

Deno.test("claim fails when the holder is full", () => {
  const holder = new Singleton("Thing");
  holder.claim();
  assertThrows(() => holder.claim(), Error, "Thing exists already.");
});

Deno.test("the holder stays empty until claim runs", () => {
  const holder = new Singleton("Thing");
  holder.assertEmpty();
  holder.assertEmpty();
});

Deno.test("each holder is independent", () => {
  const first = new Singleton("First");
  const second = new Singleton("Second");
  first.claim();
  second.assertEmpty();
});
