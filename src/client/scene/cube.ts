/**
 * The `createCube` function.
 *
 * @module
 */
import {
  CUBE_ANGLE_PERIOD,
  CUBE_UNIFORM_FLOAT_COUNT,
  CUBE_VERTEX_COUNT,
  MS_PER_SECOND,
} from "../../constants.ts";
import type { Graphics } from "../gpu/graphics.ts";
import type { Drawable, FrameInfo } from "../../types.ts";
import CUBE_SHADER from "./cube.wgsl" with { type: "text" };
import { Pipeline } from "../gpu/pipeline.ts";

/**
 * Make a 3D cube that turns and tips. Its 8 corners are the 8 colors of the RGB
 * cube. It is in the center of the window.
 *
 * @remarks
 * The shader is in `cube.wgsl`. It reads two numbers: the rotation angle and
 * the aspect ratio of the window. The GPU does not draw the faces that point
 * away from the camera, so the cube needs no depth buffer.
 *
 * @param graphics - The `Graphics` object. It gives the device and the pixel format.
 * @returns The drawable cube.
 *
 * @example
 * ```typescript
 * scene.add(createCube(graphics));
 * ```
 */
export function createCube(graphics: Graphics): Drawable {
  return new Pipeline({
    device: graphics.device,
    format: graphics.format,
    shaderCode: CUBE_SHADER,
    vertexCount: CUBE_VERTEX_COUNT,
    uniformFloatCount: CUBE_UNIFORM_FLOAT_COUNT,
    writeUniforms: writeCubeUniforms,
    cullMode: "back",
    frontFace: "cw",
  });
}

/**
 * Put the rotation angle and the aspect ratio into the uniform values.
 *
 * @param frame - The data about the frame. `time` sets the angle. The angle
 * repeats after `CUBE_ANGLE_PERIOD`, so it stays small.
 * @param uniforms - The numbers that go to the shader.
 */
function writeCubeUniforms(frame: FrameInfo, uniforms: Float32Array): void {
  uniforms[0] = (frame.time / MS_PER_SECOND) % CUBE_ANGLE_PERIOD;
  uniforms[1] = frame.aspectRatio;
}
