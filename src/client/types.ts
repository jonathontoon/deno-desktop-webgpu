/**
 * The types and protocols of the page.
 * A protocol is an `interface` that tells which methods an object must have.
 *
 * @module
 */

/** The data about one frame. A `Drawable` uses it to draw the frame. */
export interface FrameInfo {
  /** The time, in milliseconds. */
  readonly time: number;
  /** The width of the window divided by its height. */
  readonly aspectRatio: number;
}

/**
 * An object that records its draw calls in a render pass.
 *
 * @remarks
 * A `Scene` and a `Pipeline` both implement this protocol.
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

/**
 * A function that puts the uniform values of one frame into an array. A
 * `Pipeline` calls it before each draw.
 *
 * @param frame - The data about the frame that is in progress.
 * @param uniforms - The numbers that go to the shader. Write into this array.
 */
export type UniformWriter = (frame: FrameInfo, uniforms: Float32Array) => void;

/** The values that a `Pipeline` needs to build its GPU objects. */
export interface PipelineOptions {
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
  /** The function that fills the uniform values for each frame. */
  readonly writeUniforms: UniformWriter;
  /** Which faces the GPU does not draw. The default is `"none"`. */
  readonly cullMode?: GPUCullMode;
  /** Which winding order is the front of a face. The default is `"ccw"`. */
  readonly frontFace?: GPUFrontFace;
}

/**
 * An object that draws the scene on the canvas with one drawing method.
 *
 * @remarks
 * `WebGPU` implements this protocol. The frame loop does not know which backend
 * it has, so a new drawing method does not change it.
 */
export interface Backend {
  /**
   * Draw one frame.
   *
   * @param frame - The data about the frame that is in progress.
   */
  render(frame: FrameInfo): void;
}

/**
 * A function that the canvas calls before each screen refresh. It draws one
 * frame.
 *
 * @remarks
 * The canvas gives the same `frame` object in each call, and it writes new
 * values into it. Copy the values if you need them after the call.
 *
 * @param frame - The data about the frame that is in progress.
 */
export type FrameHandler = (frame: FrameInfo) => void;
