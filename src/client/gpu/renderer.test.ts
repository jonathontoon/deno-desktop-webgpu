/**
 * Unit tests for `Renderer`.
 *
 * @module
 */
import { assertEquals, assertStrictEquals } from "@std/assert";
import { createFakeDevice, fake } from "../../testing/fakes.ts";
import type { Drawable, FrameInfo } from "../types.ts";
import type { Graphics } from "./graphics.ts";
import { Renderer } from "./renderer.ts";

const CLEAR_COLOR = { r: 0.1, g: 0.2, b: 0.3, a: 1 };
const FRAME: FrameInfo = { time: 12, aspectRatio: 2 };

Deno.test("Renderer", async (t) => {
  const fakeDevice = createFakeDevice();
  const view = fake<GPUTextureView>({});
  const graphics = fake<Graphics>({
    device: fakeDevice.device,
    currentView: () => view,
  });
  const renderer = new Renderer(graphics, CLEAR_COLOR);

  await t.step("render clears the window to the clear color", () => {
    const drawable: Drawable = { draw: () => {} };
    renderer.render(drawable, FRAME);

    const [descriptor] = fakeDevice.passDescriptors;
    const [attachment] = [...descriptor.colorAttachments];
    assertStrictEquals(attachment?.view, view);
    assertEquals(attachment?.clearValue, CLEAR_COLOR);
    assertEquals(attachment?.loadOp, "clear");
    assertEquals(attachment?.storeOp, "store");
  });

  await t.step("render gives the pass and the frame to the drawable", () => {
    let receivedPass: unknown;
    let receivedFrame: unknown;
    renderer.render({
      draw: (pass, frame) => {
        receivedPass = pass;
        receivedFrame = frame;
      },
    }, FRAME);
    assertStrictEquals(receivedPass, fakeDevice.pass);
    assertStrictEquals(receivedFrame, FRAME);
  });

  await t.step("render runs the steps in the right order", () => {
    fakeDevice.events.length = 0;
    fakeDevice.submissions.length = 0;
    renderer.render({ draw: () => void fakeDevice.events.push("draw") }, FRAME);

    assertEquals(fakeDevice.events, [
      "createCommandEncoder",
      "beginRenderPass",
      "draw",
      "pass.end",
      "finish",
      "submit",
    ]);
    assertEquals(fakeDevice.submissions, [[fakeDevice.commandBuffer]]);
  });

  await t.step("render reuses the render pass objects in each frame", () => {
    fakeDevice.passDescriptorObjects.length = 0;
    renderer.render({ draw: () => {} }, FRAME);
    renderer.render({ draw: () => {} }, FRAME);
    const [first, second] = fakeDevice.passDescriptorObjects;
    assertStrictEquals(first, second);
    assertStrictEquals(
      [...first.colorAttachments][0],
      [...second.colorAttachments][0],
    );
  });

  await t.step("each frame draws to the view of its own frame", () => {
    const views = [fake<GPUTextureView>({}), fake<GPUTextureView>({})];
    let next = 0;
    const changing = new Renderer(
      fake<Graphics>({
        device: fakeDevice.device,
        currentView: () => views[next++],
      }),
      CLEAR_COLOR,
    );
    fakeDevice.passDescriptors.length = 0;
    changing.render({ draw: () => {} }, FRAME);
    changing.render({ draw: () => {} }, FRAME);
    const drawn = fakeDevice.passDescriptors.map((descriptor) =>
      [...descriptor.colorAttachments][0]?.view
    );
    assertStrictEquals(drawn[0], views[0]);
    assertStrictEquals(drawn[1], views[1]);
  });

  await t.step("two renderers can share one graphics object", () => {
    const other = { r: 1, g: 0, b: 0, a: 1 };
    new Renderer(graphics, other).render({ draw: () => {} }, FRAME);

    const descriptor = fakeDevice.passDescriptors.at(-1);
    const [attachment] = [...(descriptor?.colorAttachments ?? [])];
    assertEquals(attachment?.clearValue, other);
  });
});
