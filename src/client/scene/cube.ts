/**
 * The `Cube` class.
 *
 * @module
 */
import {
  CUBE_UNIFORM_FLOAT_COUNT,
  CUBE_VERTEX_COUNT,
  MS_PER_SECOND,
} from "../../constants.ts";
import type { Graphics } from "../gpu/graphics.ts";
import type { FrameInfo } from "../../types.ts";
import CUBE_SHADER from "./cube.wgsl" with { type: "text" };
import { Pipeline } from "./pipeline.ts";

/**
 * A 3D cube that turns and tips. Its 8 corners are the 8 colors of the RGB
 * cube. It is in the center of the window.
 *
 * @remarks
 * The shader is in `cube.wgsl`. It reads two numbers: the rotation angle and
 * the aspect ratio of the window. The GPU does not draw the faces that point
 * away from the camera, so the cube needs no depth buffer.
 *
 * @example
 * ```typescript
 * scene.add(new Cube(graphics));
 * ```
 */
export class Cube extends Pipeline {
  /**
   * Make the cube and its GPU objects.
   *
   * @param graphics - The `Graphics` object. It gives the device and the pixel format.
   */
  public constructor(graphics: Graphics) {
    super({
      device: graphics.device,
      format: graphics.format,
      shaderCode: CUBE_SHADER,
      vertexCount: CUBE_VERTEX_COUNT,
      uniformFloatCount: CUBE_UNIFORM_FLOAT_COUNT,
      cullMode: "back",
      frontFace: "cw",
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
