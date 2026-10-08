/**
 * All shared types and protocols of the program.
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
  /** Which faces the GPU does not draw. The default is `"none"`. */
  readonly cullMode?: GPUCullMode;
  /** Which winding order is the front of a face. The default is `"ccw"`. */
  readonly frontFace?: GPUFrontFace;
}

/** The canvas tells its delegate when to draw a frame. */
export interface CanvasDelegate {
  /**
   * The canvas asks for a frame. Draw one frame now.
   *
   * @param time - The time, in milliseconds.
   */
  canvasDidRequestFrame(time: number): void;
}
