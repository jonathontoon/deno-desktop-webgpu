/**
 * The `Triangle` class.
 *
 * @module
 */
import {
  MS_PER_SECOND,
  TRIANGLE_ANGLE_PERIOD,
  TRIANGLE_OFFSET_X,
  TRIANGLE_UNIFORM_FLOAT_COUNT,
  TRIANGLE_VERTEX_COUNT,
} from "../../constants.ts";
import type { Graphics } from "../gpu/graphics.ts";
import type { FrameInfo } from "../../types.ts";
import TRIANGLE_SHADER from "./triangle.wgsl" with { type: "text" };
import { Pipeline } from "./pipeline.ts";

/**
 * A colored triangle that turns around its center. It is on the left side of
 * the window.
 *
 * @remarks
 * The shader is in `triangle.wgsl`. It reads three numbers: the rotation
 * angle, the aspect ratio of the window, and the offset to the right.
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
   * Put the rotation angle, the aspect ratio, and the offset into the uniform
   * values.
   *
   * @param frame - The data about the frame. `time` sets the angle. The angle
   * repeats after `TRIANGLE_ANGLE_PERIOD`, so it stays small.
   * @param uniforms - The numbers that go to the shader.
   */
  protected override writeUniforms(
    frame: FrameInfo,
    uniforms: Float32Array,
  ): void {
    uniforms[0] = (frame.time / MS_PER_SECOND) % TRIANGLE_ANGLE_PERIOD;
    uniforms[1] = frame.aspectRatio;
    uniforms[2] = TRIANGLE_OFFSET_X;
  }
}
