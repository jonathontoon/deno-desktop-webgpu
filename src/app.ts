// Entry point. It opens the window and runs the render loop.
import { createRenderer } from "./renderer.ts";

const FRAME_MS = 1000 / 60;

const adapter = await navigator.gpu.requestAdapter();
if (!adapter) {
  throw new Error("No WebGPU adapter is available.");
}
const device = await adapter.requestDevice();

const win = new Deno.BrowserWindow({
  title: "Deno Desktop WebGPU",
  width: 800,
  height: 600,
});

const surface = win.getNativeWindow();
const format = navigator.gpu.getPreferredCanvasFormat();
const maybeContext = surface.getContext("webgpu") as GPUCanvasContext | null;
if (!maybeContext) {
  throw new Error("Could not create a WebGPU context for the window.");
}
const context: GPUCanvasContext = maybeContext;
context.configure({ device, format, alphaMode: "opaque" });

function resizeSurface(): void {
  const [width, height] = win.getSize();
  surface.width = width;
  surface.height = height;
}
resizeSurface();

const renderer = createRenderer(device, context, format);

// The raw backend has no DOM, so there is no requestAnimationFrame.
// This loop draws about 60 frames each second.
function loop(): void {
  if (win.isClosed()) {
    return;
  }
  renderer.render(performance.now(), surface.width / surface.height);
  surface.present();
  setTimeout(loop, FRAME_MS);
}

win.addEventListener("resize", resizeSurface);
win.addEventListener("close", () => Deno.exit());
loop();
