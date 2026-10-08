/**
 * The `WebGL2` class.
 *
 * @module
 */
import {
  CLEAR_COLOR,
  CUBE_VERTEX_COUNT,
  MS_PER_SECOND,
} from "../../constants.ts";
import { Singleton } from "../../singleton.ts";
import type { Backend, BackendKind, FrameInfo } from "../../types.ts";
import CUBE_FRAGMENT_SHADER from "./cube.fragment.glsl" with { type: "text" };
import CUBE_VERTEX_SHADER from "./cube.vertex.glsl" with { type: "text" };

/**
 * Draws the cube with WebGL2. It is the fallback for a web view that has no
 * WebGPU.
 *
 * @remarks
 * Only one instance exists. The shaders are in `cube.vertex.glsl` and
 * `cube.fragment.glsl`. They do the same work as `cube.wgsl`. The GPU does not
 * draw the faces that point away from the camera, so the cube needs no depth
 * buffer.
 */
export class WebGL2 implements Backend {
  /** Keeps the one instance. */
  private static readonly holder = new Singleton<WebGL2>("WebGL2");

  /**
   * The one instance.
   *
   * @throws {Error} When no `WebGL2` exists yet.
   */
  public static get shared(): WebGL2 {
    return WebGL2.holder.get();
  }

  /** The drawing method of this backend. */
  public readonly kind: BackendKind = "webgl2";

  /** The place of the rotation angle in the shader. */
  private readonly angleLocation: WebGLUniformLocation | null;

  /** The place of the aspect ratio in the shader. */
  private readonly aspectRatioLocation: WebGLUniformLocation | null;

  /**
   * Make the shader program and set the state of the GPU.
   *
   * @param context - The WebGL2 context of the canvas.
   * @param surface - The canvas that WebGL2 draws to.
   * @throws {Error} When a shader does not compile or the program does not link.
   * @throws {Error} When a `WebGL2` exists already.
   *
   * @example
   * ```typescript
   * const backend = new WebGL2(canvas.getContext("webgl2")!, canvas);
   * ```
   */
  public constructor(
    /** The WebGL2 context of the canvas. */
    private readonly context: WebGL2RenderingContext,
    /** The canvas that WebGL2 draws to. */
    private readonly surface: HTMLCanvasElement,
  ) {
    WebGL2.holder.assertEmpty();
    const program = this.link(
      this.compile(context.VERTEX_SHADER, CUBE_VERTEX_SHADER),
      this.compile(context.FRAGMENT_SHADER, CUBE_FRAGMENT_SHADER),
    );
    this.angleLocation = context.getUniformLocation(program, "uAngle");
    this.aspectRatioLocation = context.getUniformLocation(
      program,
      "uAspectRatio",
    );
    context.useProgram(program);
    context.enable(context.CULL_FACE);
    context.cullFace(context.BACK);
    context.frontFace(context.CW);
    context.clearColor(
      CLEAR_COLOR.r,
      CLEAR_COLOR.g,
      CLEAR_COLOR.b,
      CLEAR_COLOR.a,
    );
    WebGL2.holder.claim(this);
  }

  /**
   * Draw one frame.
   *
   * @param frame - The data about the frame that is in progress.
   */
  public render(frame: FrameInfo): void {
    const { context } = this;
    context.viewport(0, 0, this.surface.width, this.surface.height);
    context.clear(context.COLOR_BUFFER_BIT);
    context.uniform1f(this.angleLocation, frame.time / MS_PER_SECOND);
    context.uniform1f(this.aspectRatioLocation, frame.aspectRatio);
    context.drawArrays(context.TRIANGLES, 0, CUBE_VERTEX_COUNT);
  }

  /**
   * Compile one shader.
   *
   * @param type - The kind of shader: vertex or fragment.
   * @param source - The GLSL source code.
   * @returns The compiled shader.
   * @throws {Error} When the shader does not compile.
   */
  private compile(type: number, source: string): WebGLShader {
    const { context } = this;
    const shader = context.createShader(type);
    if (!shader) {
      throw new Error("Could not make a shader.");
    }
    context.shaderSource(shader, source);
    context.compileShader(shader);
    if (!context.getShaderParameter(shader, context.COMPILE_STATUS)) {
      throw new Error(
        `Could not compile the shader: ${context.getShaderInfoLog(shader)}`,
      );
    }
    return shader;
  }

  /**
   * Link a vertex shader and a fragment shader into a program.
   *
   * @param vertex - The compiled vertex shader.
   * @param fragment - The compiled fragment shader.
   * @returns The linked program.
   * @throws {Error} When the program does not link.
   */
  private link(vertex: WebGLShader, fragment: WebGLShader): WebGLProgram {
    const { context } = this;
    const program = context.createProgram();
    context.attachShader(program, vertex);
    context.attachShader(program, fragment);
    context.linkProgram(program);
    if (!context.getProgramParameter(program, context.LINK_STATUS)) {
      throw new Error(
        `Could not link the program: ${context.getProgramInfoLog(program)}`,
      );
    }
    return program;
  }
}
