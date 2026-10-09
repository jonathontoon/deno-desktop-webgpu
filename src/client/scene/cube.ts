/**
 * The `createCube` function.
 *
 * @module
 */
import {
  CUBE_CAMERA_DISTANCE,
  CUBE_FAR_PLANE,
  CUBE_FOCAL_LENGTH,
  CUBE_NEAR_PLANE,
  CUBE_TILT_RATIO,
  CUBE_UNIFORM_FLOAT_COUNT,
  CUBE_VERTEX_COUNT,
  MS_PER_SECOND,
} from "../constants.ts";
import type { Graphics } from "../gpu/graphics.ts";
import { Pipeline } from "../gpu/pipeline.ts";
import type { Drawable, FrameInfo } from "../types.ts";
import CUBE_SHADER from "./cube.wgsl" with { type: "text" };

/**
 * Make a 3D cube that turns and tips. Its 8 corners are the 8 colors of the RGB
 * cube. It is in the center of the window.
 *
 * @remarks
 * The shader is in `cube.wgsl`. It reads one matrix. The matrix has the turn,
 * the tip, and the camera of the frame. The program computes it one time for
 * each frame, and the GPU does not compute it again for each corner. The GPU
 * does not draw the faces that point away from the camera, so the cube needs no
 * depth buffer.
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
 * Put the matrix of the frame into the uniform values.
 *
 * @remarks
 * The matrix does these steps to a corner of the cube, in this order: turn
 * around the y axis, tip around the x axis, move away from the camera, and
 * project into the window. The numbers are in column order, as WGSL needs. The
 * program works with the numbers of the type `number`, which has more precision
 * than the `f32` of the shader. So a large time does not make the turn coarse.
 *
 * @param frame - The data about the frame. `time` sets the angle.
 * @param uniforms - The 16 numbers of the matrix.
 */
function writeCubeUniforms(frame: FrameInfo, uniforms: Float32Array): void {
  const angle = frame.time / MS_PER_SECOND;
  const cosTurn = Math.cos(angle);
  const sinTurn = Math.sin(angle);
  const cosTip = Math.cos(angle * CUBE_TILT_RATIO);
  const sinTip = Math.sin(angle * CUBE_TILT_RATIO);

  const sideScale = CUBE_FOCAL_LENGTH / frame.aspectRatio;
  const depthScale = CUBE_FAR_PLANE / (CUBE_FAR_PLANE - CUBE_NEAR_PLANE);
  const depthOffset = CUBE_NEAR_PLANE * depthScale;

  // Column 0 is the result for the x axis of the cube.
  uniforms[0] = cosTurn * sideScale;
  uniforms[1] = sinTurn * sinTip * CUBE_FOCAL_LENGTH;
  uniforms[2] = -sinTurn * cosTip * depthScale;
  uniforms[3] = -sinTurn * cosTip;
  // Column 1 is the result for the y axis of the cube.
  uniforms[4] = 0;
  uniforms[5] = cosTip * CUBE_FOCAL_LENGTH;
  uniforms[6] = sinTip * depthScale;
  uniforms[7] = sinTip;
  // Column 2 is the result for the z axis of the cube.
  uniforms[8] = sinTurn * sideScale;
  uniforms[9] = -cosTurn * sinTip * CUBE_FOCAL_LENGTH;
  uniforms[10] = cosTurn * cosTip * depthScale;
  uniforms[11] = cosTurn * cosTip;
  // Column 3 moves the cube away from the camera.
  uniforms[12] = 0;
  uniforms[13] = 0;
  uniforms[14] = CUBE_CAMERA_DISTANCE * depthScale - depthOffset;
  uniforms[15] = CUBE_CAMERA_DISTANCE;
}
