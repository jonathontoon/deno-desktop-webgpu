/**
 * Unit tests for `Application` when the user closes the window while the GPU
 * starts. This file has its own tests, because `Application` can launch one
 * time in each test file.
 *
 * @module
 */
import { assertEquals } from "@std/assert";
import { assertSpyCalls, stub } from "@std/testing/mock";
import {
  createFakeDevice,
  FakeBrowserWindow,
  installFakeBrowserWindow,
  installFakeNavigatorGPU,
} from "../testing/fakes.ts";
import { Application } from "./application.ts";
import { RenderLoop } from "./render-loop.ts";

Deno.test("a close during the GPU start ends the program", async () => {
  const restoreWindow = installFakeBrowserWindow();
  const restoreGPU = installFakeNavigatorGPU({
    device: createFakeDevice().device,
    // The user closes the window while the program asks for the GPU.
    onRequestAdapter: () => FakeBrowserWindow.last?.dispatch("close"),
  });
  using exit = stub(Deno, "exit");
  try {
    await Application.launch();
    assertSpyCalls(exit, 1);
    assertEquals(FakeBrowserWindow.count, 1);
  } finally {
    RenderLoop.shared.stop();
    restoreGPU();
    restoreWindow();
  }
});
