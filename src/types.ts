/**
 * All shared types and protocols of the program.
 * A protocol is an `interface` that tells which methods an object must have.
 *
 * @module
 */

/** The native surface of the window. WebGPU draws to it. */
export type NativeSurface = ReturnType<Deno.BrowserWindow["getNativeWindow"]>;

/** The values that the program uses to open a window. */
export interface AppWindowOptions {
  /** The text in the title bar of the window. */
  readonly title: string;
  /** The width of the window, in pixels. */
  readonly width: number;
  /** The height of the window, in pixels. */
  readonly height: number;
}

/** The data about one frame. A `Drawable` uses it to draw the frame. */
export interface FrameInfo {
  /** The time, in milliseconds. */
  readonly time: number;
  /** The width of the window divided by its height. */
  readonly aspect: number;
}

/**
 * An object that records its draw calls in a render pass.
 *
 * @remarks
 * A `Scene` and a `PipelineDrawable` both implement this protocol.
 * Because of this, the `Renderer` can draw one object or a list of objects
 * in the same way.
 */
export interface Drawable {
  /**
   * Record the draw calls of this object.
   *
   * @param pass - The render pass that receives the draw calls.
   * @param frame - The data about the frame that is in progress.
   */
  draw(pass: GPURenderPassEncoder, frame: FrameInfo): void;
}

/** The values that a `PipelineDrawable` needs to build its GPU objects. */
export interface PipelineDrawableOptions {
  /** The GPU device that makes the GPU objects. */
  readonly device: GPUDevice;
  /** The pixel format of the window. */
  readonly format: GPUTextureFormat;
  /** The WGSL source code of the shader. */
  readonly shaderCode: string;
  /** The number of vertices to draw. */
  readonly vertexCount: number;
  /** The number of numbers in the uniform buffer. */
  readonly uniformFloatCount: number;
}

/** The window tells its delegate about events. */
export interface WindowDelegate {
  /** The user closed the window. */
  windowDidClose(): void;
}

/** The render loop tells its delegate when to draw a frame. */
export interface RenderLoopDelegate {
  /**
   * Draw one frame now.
   *
   * @param time - The time, in milliseconds.
   */
  renderLoopDidTick(time: number): void;
}
