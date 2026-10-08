/**
 * Unit tests for `Scene`.
 *
 * @module
 */
import { assertEquals, assertStrictEquals, assertThrows } from "@std/assert";
import { createFakePass, fake } from "../../testing/fakes.ts";
import type { Drawable, FrameInfo } from "../../types.ts";
import { Scene } from "./scene.ts";

const FRAME: FrameInfo = { time: 1000, aspectRatio: 2 };

Deno.test("Scene is a singleton", async (t) => {
  await t.step("shared fails before initialize", () => {
    assertThrows(() => Scene.shared, Error, "Scene is not initialized.");
  });

  const scene = Scene.initialize();

  await t.step("shared gives the instance from initialize", () => {
    assertStrictEquals(Scene.shared, scene);
  });

  await t.step("initialize fails the second time", () => {
    assertThrows(() => Scene.initialize(), Error, "Scene exists already.");
  });

  await t.step("draw with no drawable does nothing", () => {
    const events: string[] = [];
    scene.draw(createFakePass(events), FRAME);
    assertEquals(events, []);
  });

  await t.step("draw runs each drawable in the order of add", () => {
    const events: string[] = [];
    const pass = createFakePass(events);
    const received: unknown[] = [];
    const makeDrawable = (name: string): Drawable =>
      fake<Drawable>({
        draw: (receivedPass: unknown, frame: unknown) => {
          events.push(name);
          received.push(receivedPass, frame);
        },
      });

    scene.add(makeDrawable("first"));
    scene.add(makeDrawable("second"));
    scene.draw(pass, FRAME);

    assertEquals(events, ["first", "second"]);
    assertStrictEquals(received[0], pass);
    assertStrictEquals(received[1], FRAME);
    assertStrictEquals(received[2], pass);
    assertStrictEquals(received[3], FRAME);
  });
});
