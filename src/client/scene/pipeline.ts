/**
 * The `Pipeline` base class.
 *
 * @module
 */
import { FRAGMENT_ENTRY_POINT, VERTEX_ENTRY_POINT } from "../../constants.ts";
import type { Drawable, FrameInfo, PipelineOptions } from "../../types.ts";

/**
 * Base class for a drawable that uses one render pipeline and one uniform
 * buffer.
 *
 * @remarks
 * The base class owns the GPU objects. A subclass gives the shader code and
 * fills the uniform values. This class cannot make an object by itself,
 * because it is `abstract`. A subclass must write `writeUniforms`.
 *
 * @example
 * ```typescript
 * class Pulse extends Pipeline {
 *   public constructor(graphics: Graphics) {
 *     super({
 *       device: graphics.device,
 *       format: graphics.format,
 *       shaderCode: PULSE_SHADER,
 *       vertexCount: 3,
 *       uniformFloatCount: 1,
 *     });
 *   }
 *
 *   protected override writeUniforms(frame: FrameInfo, uniforms: Float32Array): void {
 *     uniforms[0] = frame.time;
 *   }
 * }
 * ```
 */
export abstract class Pipeline implements Drawable {
  /** The GPU device that owns the GPU objects. */
  private readonly device: GPUDevice;

  /** The number of vertices to draw. */
  private readonly vertexCount: number;

  /** The render pipeline. It holds the compiled shader. */
  private readonly pipeline: GPURenderPipeline;

  /** The uniform values in CPU memory. `writeUniforms` fills them. */
  private readonly uniforms: Float32Array<ArrayBuffer>;

  /** The copy of the uniform values in GPU memory. */
  private readonly uniformBuffer: GPUBuffer;

  /** Connects the uniform buffer to the shader. */
  private readonly bindGroup: GPUBindGroup;

  /**
   * Make the pipeline, the uniform buffer, and the bind group.
   *
   * @param options - The device, the pixel format, the shader code, the sizes,
   * and the face culling.
   */
  public constructor(options: PipelineOptions) {
    const {
      device,
      format,
      shaderCode,
      vertexCount,
      uniformFloatCount,
      cullMode = "none",
      frontFace = "ccw",
    } = options;
    this.device = device;
    this.vertexCount = vertexCount;

    const module = device.createShaderModule({ code: shaderCode });
    this.pipeline = device.createRenderPipeline({
      layout: "auto",
      vertex: { module, entryPoint: VERTEX_ENTRY_POINT },
      fragment: {
        module,
        entryPoint: FRAGMENT_ENTRY_POINT,
        targets: [{ format }],
      },
      primitive: { topology: "triangle-list", cullMode, frontFace },
    });

    this.uniforms = new Float32Array(uniformFloatCount);
    this.uniformBuffer = device.createBuffer({
      size: this.uniforms.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    this.bindGroup = device.createBindGroup({
      layout: this.pipeline.getBindGroupLayout(0),
      entries: [{ binding: 0, resource: { buffer: this.uniformBuffer } }],
    });
  }

  /**
   * Update the uniform values and record the draw calls.
   *
   * @remarks
   * The steps are always in this order: `writeUniforms`, copy to the GPU,
   * then set the pipeline and draw. A subclass does not change this order.
   *
   * @param pass - The render pass that receives the draw calls.
   * @param frame - The data about the frame that is in progress.
   */
  public draw(pass: GPURenderPassEncoder, frame: FrameInfo): void {
    this.writeUniforms(frame, this.uniforms);
    this.device.queue.writeBuffer(this.uniformBuffer, 0, this.uniforms);

    pass.setPipeline(this.pipeline);
    pass.setBindGroup(0, this.bindGroup);
    pass.draw(this.vertexCount);
  }

  /**
   * Put the uniform values for this frame into `uniforms`.
   *
   * @param frame - The data about the frame that is in progress.
   * @param uniforms - The numbers that go to the shader. Write into this array.
   */
  protected abstract writeUniforms(
    frame: FrameInfo,
    uniforms: Float32Array,
  ): void;
}
