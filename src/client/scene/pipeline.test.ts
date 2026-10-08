/**
 * Unit tests for `Pipeline`.
 *
 * @module
 */
import { assertEquals, assertExists, assertStrictEquals } from "@std/assert";
import { FRAGMENT_ENTRY_POINT, VERTEX_ENTRY_POINT } from "../../constants.ts";
import { createFakeDevice, createFakePass } from "../../testing/fakes.ts";
import type { FrameInfo, PipelineOptions } from "../../types.ts";
import { Pipeline } from "./pipeline.ts";

const FLOAT_BYTES = 4;
const FRAME: FrameInfo = { time: 5, aspectRatio: 1.5 };

/** A drawable that writes the frame values into the uniforms. */
class TestPipeline extends Pipeline {
  /** The names of the calls of `writeUniforms`, in the order that they ran. */
  public readonly log: string[];

  /**
   * @param options - The options for the base class.
   * @param log - The list that receives the name of each `writeUniforms` call.
   */
  public constructor(options: PipelineOptions, log: string[]) {
    super(options);
    this.log = log;
  }

  protected override writeUniforms(
    frame: FrameInfo,
    uniforms: Float32Array,
  ): void {
    this.log.push("writeUniforms");
    uniforms[0] = frame.time;
    uniforms[1] = frame.aspectRatio;
  }
}

/** Make a drawable with a fake device. */
function createTestPipeline() {
  const gpu = createFakeDevice();
  const options: PipelineOptions = {
    device: gpu.device,
    format: "rgba8unorm",
    shaderCode: "// shader",
    vertexCount: 6,
    uniformFloatCount: 2,
  };
  const drawable = new TestPipeline(options, gpu.events);
  return { gpu, drawable };
}

Deno.test("the constructor makes the shader module with the given code", () => {
  const { gpu } = createTestPipeline();
  assertEquals(gpu.shaderModuleDescriptors, [{ code: "// shader" }]);
});

Deno.test("the constructor makes a pipeline with the entry points", () => {
  const { gpu } = createTestPipeline();
  assertEquals(gpu.pipelineDescriptors.length, 1);
  const descriptor = gpu.pipelineDescriptors[0];
  assertEquals(descriptor.layout, "auto");
  assertEquals(descriptor.vertex.entryPoint, VERTEX_ENTRY_POINT);
  assertExists(descriptor.fragment);
  assertEquals(descriptor.fragment.entryPoint, FRAGMENT_ENTRY_POINT);
  assertEquals(descriptor.fragment.targets, [{ format: "rgba8unorm" }]);
  assertEquals(descriptor.primitive, { topology: "triangle-list" });
});

Deno.test("the constructor makes a uniform buffer of the right size", () => {
  const { gpu } = createTestPipeline();
  assertEquals(gpu.bufferDescriptors.length, 1);
  const descriptor = gpu.bufferDescriptors[0];
  assertEquals(descriptor.size, 2 * FLOAT_BYTES);
  assertEquals(
    descriptor.usage,
    GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  );
});

Deno.test("the constructor binds the uniform buffer at slot 0", () => {
  const { gpu } = createTestPipeline();
  assertEquals(gpu.bindGroupDescriptors.length, 1);
  const descriptor = gpu.bindGroupDescriptors[0];
  assertEquals(descriptor.entries.length, 1);
  const [entry] = [...descriptor.entries];
  assertEquals(entry.binding, 0);
  assertStrictEquals(
    (entry.resource as GPUBufferBinding).buffer,
    gpu.buffer,
  );
  assertEquals(gpu.events.includes("getBindGroupLayout:0"), true);
});

Deno.test("draw writes the uniforms, then sets state, then draws", () => {
  const { gpu, drawable } = createTestPipeline();
  gpu.events.length = 0;

  drawable.draw(gpu.pass, FRAME);

  assertEquals(gpu.events, [
    "writeUniforms",
    "writeBuffer",
    "setPipeline",
    "setBindGroup:0",
    "draw:6",
  ]);
});

Deno.test("draw copies the uniform values to the uniform buffer", () => {
  const { gpu, drawable } = createTestPipeline();

  drawable.draw(gpu.pass, FRAME);

  assertEquals(gpu.writes.length, 1);
  assertStrictEquals(gpu.writes[0].buffer, gpu.buffer);
  assertEquals(gpu.writes[0].offset, 0);
  assertEquals(gpu.writes[0].data, [5, 1.5]);
});

Deno.test("each draw call writes the values of its own frame", () => {
  const { gpu, drawable } = createTestPipeline();
  const pass = createFakePass([]);

  drawable.draw(pass, { time: 1, aspectRatio: 2 });
  drawable.draw(pass, { time: 3, aspectRatio: 4 });

  assertEquals(gpu.writes.map((write) => write.data), [[1, 2], [3, 4]]);
});
