// All shared types and protocols of the program.

/** The native surface of the window. WebGPU draws to it. */
export type NativeSurface = ReturnType<Deno.BrowserWindow["getNativeWindow"]>;

export interface AppWindowOptions {
  readonly title: string;
  readonly width: number;
  readonly height: number;
}

export interface FrameInfo {
  /** Time in milliseconds. */
  readonly time: number;
  /** Width of the window divided by its height. */
  readonly aspect: number;
}

/** An object that records its draw calls in a render pass. */
export interface Drawable {
  draw(pass: GPURenderPassEncoder, frame: FrameInfo): void;
}

export interface PipelineDrawableOptions {
  readonly device: GPUDevice;
  readonly format: GPUTextureFormat;
  readonly shaderCode: string;
  readonly vertexCount: number;
  readonly uniformFloatCount: number;
}

/** The window tells its delegate about events. */
export interface WindowDelegate {
  windowDidClose(): void;
}

/** The render loop tells its delegate when to draw a frame. */
export interface RenderLoopDelegate {
  /** `time` is in milliseconds. */
  renderLoopDidTick(time: number): void;
}
