/**
 * Unit tests for `Scene`.
 *
 * @module
 */
import { assertEquals, assertStrictEquals } from "@std/assert";
import { createFakePass, fake } from "../../testing/fakes.ts";
import type { Drawable, FrameInfo } from "../types.ts";
import { Scene } from "./scene.ts";

const FRAME: FrameInfo = { time: 1000, aspectRatio: 2 };

/** Makes a drawable that writes its name to `events` when it draws. */
function makeDrawable(
  name: string,
  events: string[],
  received: unknown[] = [],
): Drawable {
  return fake<Drawable>({
    draw: (pass: unknown, frame: unknown) => {
      events.push(name);
      received.push(pass, frame);
    },
  });
}

Deno.test("Scene", async (t) => {
  await t.step("draw with no drawable does nothing", () => {
    const events: string[] = [];
    new Scene().draw(createFakePass(events), FRAME);
    assertEquals(events, []);
  });

  await t.step("draw runs each drawable in the order of add", () => {
    const scene = new Scene();
    const events: string[] = [];
    const pass = createFakePass(events);
    const received: unknown[] = [];

    scene.add(makeDrawable("first", events, received));
    scene.add(makeDrawable("second", events, received));
    scene.draw(pass, FRAME);

    assertEquals(events, ["first", "second"]);
    assertStrictEquals(received[0], pass);
    assertStrictEquals(received[1], FRAME);
    assertStrictEquals(received[2], pass);
    assertStrictEquals(received[3], FRAME);
  });

  await t.step("two scenes keep their own drawables", () => {
    const events: string[] = [];
    const first = new Scene();
    const second = new Scene();
    first.add(makeDrawable("first", events));
    second.add(makeDrawable("second", events));

    second.draw(createFakePass(events), FRAME);

    assertEquals(events, ["second"]);
  });

  await t.step("a scene can hold another scene", () => {
    const events: string[] = [];
    const outer = new Scene();
    const inner = new Scene();
    inner.add(makeDrawable("inner", events));
    outer.add(makeDrawable("before", events));
    outer.add(inner);
    outer.add(makeDrawable("after", events));

    outer.draw(createFakePass(events), FRAME);

    assertEquals(events, ["before", "inner", "after"]);
  });
});
