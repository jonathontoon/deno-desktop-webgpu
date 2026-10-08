/**
 * Unit tests for `Renderer`.
 *
 * @module
 */
import { assertEquals, assertStrictEquals, assertThrows } from "@std/assert";
import { createFakeDevice, fake } from "../../testing/fakes.ts";
import type { Drawable, FrameInfo } from "../../types.ts";
import type { Graphics } from "./graphics.ts";
import { Renderer } from "./renderer.ts";

const CLEAR_COLOR = { r: 0.1, g: 0.2, b: 0.3, a: 1 };
const FRAME: FrameInfo = { time: 12, aspectRatio: 2 };

Deno.test("Renderer", async (t) => {
  await t.step("shared fails before initialize", () => {
    assertThrows(() => Renderer.shared, Error, "Renderer is not initialized.");
  });

  const fakeDevice = createFakeDevice();
  const view = fake<GPUTextureView>({});
  const graphics = fake<Graphics>({
    device: fakeDevice.device,
    currentView: () => view,
  });
  const renderer = Renderer.initialize(graphics, CLEAR_COLOR);

  await t.step("shared gives the instance from initialize", () => {
    assertStrictEquals(Renderer.shared, renderer);
  });

  await t.step("initialize fails the second time", () => {
    assertThrows(
      () => Renderer.initialize(graphics, CLEAR_COLOR),
      Error,
      "Renderer exists already.",
    );
  });

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
});
