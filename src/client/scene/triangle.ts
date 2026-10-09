/**
 * The `createTriangle` function.
 *
 * @module
 */
import {
  MS_PER_SECOND,
  TRIANGLE_ANGLE_PERIOD,
  TRIANGLE_OFFSET_X,
  TRIANGLE_UNIFORM_FLOAT_COUNT,
  TRIANGLE_VERTEX_COUNT,
} from "../constants.ts";
import type { Graphics } from "../gpu/graphics.ts";
import type { Drawable, FrameInfo } from "../types.ts";
import TRIANGLE_SHADER from "./triangle.wgsl" with { type: "text" };
import { Pipeline } from "../gpu/pipeline.ts";

/**
 * Make a colored triangle that turns around its center. It is on the left side
 * of the window.
 *
 * @remarks
 * The shader is in `triangle.wgsl`. It reads three numbers: the rotation
 * angle, the aspect ratio of the window, and the offset to the right.
 *
 * @param graphics - The `Graphics` object. It gives the device and the pixel format.
 * @returns The drawable triangle.
 *
 * @example
 * ```typescript
 * scene.add(createTriangle(graphics));
 * ```
 */
export function createTriangle(graphics: Graphics): Drawable {
  return new Pipeline({
    device: graphics.device,
    format: graphics.format,
    shaderCode: TRIANGLE_SHADER,
    vertexCount: TRIANGLE_VERTEX_COUNT,
    uniformFloatCount: TRIANGLE_UNIFORM_FLOAT_COUNT,
    writeUniforms: writeTriangleUniforms,
    sampleCount: graphics.sampleCount,
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
function writeTriangleUniforms(frame: FrameInfo, uniforms: Float32Array): void {
  uniforms[0] = (frame.time / MS_PER_SECOND) % TRIANGLE_ANGLE_PERIOD;
  uniforms[1] = frame.aspectRatio;
  uniforms[2] = TRIANGLE_OFFSET_X;
}
