import { FRAGMENT_ENTRY_POINT, VERTEX_ENTRY_POINT } from "../constants.ts";
import type { Drawable, FrameInfo, PipelineDrawableOptions } from "../types.ts";

/**
 * Base class for a drawable that uses one render pipeline and one uniform
 * buffer. The base class owns the GPU objects. A subclass gives the shader
 * code and fills the uniform values.
 */
export abstract class PipelineDrawable implements Drawable {
  private readonly device: GPUDevice;
  private readonly vertexCount: number;
  private readonly pipeline: GPURenderPipeline;
  private readonly uniforms: Float32Array<ArrayBuffer>;
  private readonly uniformBuffer: GPUBuffer;
  private readonly bindGroup: GPUBindGroup;

  public constructor(options: PipelineDrawableOptions) {
    const { device, format, shaderCode, vertexCount, uniformFloatCount } =
      options;
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
      primitive: { topology: "triangle-list" },
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

  public draw(pass: GPURenderPassEncoder, frame: FrameInfo): void {
    this.writeUniforms(frame, this.uniforms);
    this.device.queue.writeBuffer(this.uniformBuffer, 0, this.uniforms);

    pass.setPipeline(this.pipeline);
    pass.setBindGroup(0, this.bindGroup);
    pass.draw(this.vertexCount);
  }

  /** Put the uniform values for this frame into `uniforms`. */
  protected abstract writeUniforms(
    frame: FrameInfo,
    uniforms: Float32Array,
  ): void;
}
