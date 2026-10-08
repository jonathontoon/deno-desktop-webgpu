/**
 * The `Triangle` class.
 *
 * @module
 */
import {
  MS_PER_SECOND,
  TRIANGLE_UNIFORM_FLOAT_COUNT,
  TRIANGLE_VERTEX_COUNT,
} from "../../constants.ts";
import type { Graphics } from "../gpu/graphics.ts";
import type { FrameInfo } from "../../types.ts";
import TRIANGLE_SHADER from "./triangle.wgsl" with { type: "text" };
import { Pipeline } from "./pipeline.ts";

/**
 * A colored triangle that turns around its center.
 *
 * @remarks
 * The shader is in `triangle.wgsl`. It reads two numbers: the rotation angle
 * and the aspect ratio of the window.
 *
 * @example
 * ```typescript
 * scene.add(new Triangle(graphics));
 * ```
 */
export class Triangle extends Pipeline {
  /**
   * Make the triangle and its GPU objects.
   *
   * @param graphics - The `Graphics` object. It gives the device and the pixel format.
   */
  public constructor(graphics: Graphics) {
    super({
      device: graphics.device,
      format: graphics.format,
      shaderCode: TRIANGLE_SHADER,
      vertexCount: TRIANGLE_VERTEX_COUNT,
      uniformFloatCount: TRIANGLE_UNIFORM_FLOAT_COUNT,
    });
  }

  /**
   * Put the rotation angle and the aspect ratio into the uniform values.
   *
   * @param frame - The data about the frame. `time` sets the angle.
   * @param uniforms - The numbers that go to the shader.
   */
  protected override writeUniforms(
    frame: FrameInfo,
    uniforms: Float32Array,
  ): void {
    uniforms[0] = frame.time / MS_PER_SECOND;
    uniforms[1] = frame.aspectRatio;
  }
}
