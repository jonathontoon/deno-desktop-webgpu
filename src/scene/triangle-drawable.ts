import {
  MS_PER_SECOND,
  TRIANGLE_UNIFORM_FLOAT_COUNT,
  TRIANGLE_VERTEX_COUNT,
} from "../constants.ts";
import type { GPUContext } from "../gpu/gpu-context.ts";
import type { FrameInfo } from "../types.ts";
import TRIANGLE_SHADER from "./triangle.wgsl" with { type: "text" };
import { PipelineDrawable } from "./pipeline-drawable.ts";

/** A colored triangle that turns around its center. */
export class TriangleDrawable extends PipelineDrawable {
  public constructor(gpu: GPUContext) {
    super({
      device: gpu.device,
      format: gpu.format,
      shaderCode: TRIANGLE_SHADER,
      vertexCount: TRIANGLE_VERTEX_COUNT,
      uniformFloatCount: TRIANGLE_UNIFORM_FLOAT_COUNT,
    });
  }

  protected override writeUniforms(
    frame: FrameInfo,
    uniforms: Float32Array,
  ): void {
    uniforms[0] = frame.time / MS_PER_SECOND;
    uniforms[1] = frame.aspect;
  }
}
