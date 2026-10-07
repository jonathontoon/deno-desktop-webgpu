import SHADER from "./shader.wgsl" with { type: "text" };

export interface Renderer {
  /** Draw one frame. `time` is in milliseconds. */
  render(time: number, aspect: number): void;
}

/** Create the pipeline and buffers that draw the rotating triangle. */
export function createRenderer(
  device: GPUDevice,
  context: GPUCanvasContext,
  format: GPUTextureFormat,
): Renderer {
  const module = device.createShaderModule({ code: SHADER });
  const pipeline = device.createRenderPipeline({
    layout: "auto",
    vertex: { module, entryPoint: "vertexMain" },
    fragment: { module, entryPoint: "fragmentMain", targets: [{ format }] },
    primitive: { topology: "triangle-list" },
  });

  // Two f32 values: the rotation angle and the aspect ratio of the window.
  const uniforms = new Float32Array(2);
  const uniformBuffer = device.createBuffer({
    size: uniforms.byteLength,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });
  const bindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [{ binding: 0, resource: { buffer: uniformBuffer } }],
  });

  return {
    render(time, aspect) {
      uniforms[0] = time / 1000;
      uniforms[1] = aspect;
      device.queue.writeBuffer(uniformBuffer, 0, uniforms);

      const encoder = device.createCommandEncoder();
      const pass = encoder.beginRenderPass({
        colorAttachments: [{
          view: context.getCurrentTexture().createView(),
          clearValue: { r: 0.05, g: 0.05, b: 0.1, a: 1 },
          loadOp: "clear",
          storeOp: "store",
        }],
      });
      pass.setPipeline(pipeline);
      pass.setBindGroup(0, bindGroup);
      pass.draw(3);
      pass.end();
      device.queue.submit([encoder.finish()]);
    },
  };
}
