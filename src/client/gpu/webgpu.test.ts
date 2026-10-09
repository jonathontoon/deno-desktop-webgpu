/**
 * Unit tests for `WebGPU`.
 *
 * @module
 */
import { assertEquals, assertStrictEquals } from "@std/assert";
import { fake } from "../../testing/fakes.ts";
import type { Drawable, FrameInfo } from "../types.ts";
import type { Renderer } from "./renderer.ts";
import { WebGPU } from "./webgpu.ts";

const FRAME: FrameInfo = { time: 1000, aspectRatio: 2 };

Deno.test("WebGPU", async (t) => {
  const drawn: { drawable: Drawable; frame: FrameInfo }[] = [];
  const renderer = fake<Renderer>({
    render: (drawable: Drawable, frame: FrameInfo) =>
      void drawn.push({ drawable, frame }),
  });
  const drawable: Drawable = { draw: () => {} };
  const backend = new WebGPU(renderer, drawable);

  await t.step("the constructor draws nothing", () => {
    assertEquals(drawn.length, 0);
  });

  await t.step(
    "render gives the drawable and the frame to the renderer",
    () => {
      backend.render(FRAME);
      assertEquals(drawn.length, 1);
      assertStrictEquals(drawn[0].drawable, drawable);
      assertStrictEquals(drawn[0].frame, FRAME);
    },
  );

  await t.step("each render call draws one frame", () => {
    backend.render({ time: 2000, aspectRatio: 3 });
    assertEquals(drawn.length, 2);
    assertEquals(drawn[1].frame, { time: 2000, aspectRatio: 3 });
  });
});
