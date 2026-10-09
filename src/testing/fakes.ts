/**
 * Fake GPU and canvas objects for the unit tests. They need no GPU and no
 * display. Each fake records the calls that it receives.
 *
 * @module
 */
/**
 * Give a partial fake the type of the real object.
 *
 * @typeParam T - The type of the real object.
 * @param partial - An object that has only the members that a test needs.
 * @returns The same object, typed as `T`.
 */
export function fake<T>(partial: object): T {
  return partial as unknown as T;
}

/** One call of `GPUQueue.writeBuffer`. */
export interface BufferWrite {
  /** The buffer that received the data. */
  readonly buffer: GPUBuffer;
  /** The byte offset in the buffer. */
  readonly offset: number;
  /** A copy of the numbers at the time of the call. */
  readonly data: readonly number[];
}

/** A fake GPU device and the records of the calls that it received. */
export interface FakeDevice {
  /** The fake device. Give it to the code under test. */
  readonly device: GPUDevice;
  /** The names of the calls, in the order that they happened. */
  readonly events: string[];
  /** The arguments of each `createShaderModule` call. */
  readonly shaderModuleDescriptors: GPUShaderModuleDescriptor[];
  /** The arguments of each `createRenderPipeline` call. */
  readonly pipelineDescriptors: GPURenderPipelineDescriptor[];
  /** The arguments of each `createBuffer` call. */
  readonly bufferDescriptors: GPUBufferDescriptor[];
  /** The arguments of each `createBindGroup` call. */
  readonly bindGroupDescriptors: GPUBindGroupDescriptor[];
  /** The arguments of each `createTexture` call. */
  readonly textureDescriptors: GPUTextureDescriptor[];
  /** The view that each texture from `createTexture` gives. */
  readonly textureView: GPUTextureView;
  /**
   * The values of the arguments of each `beginRenderPass` call, as they were
   * at the time of the call.
   */
  readonly passDescriptors: GPURenderPassDescriptor[];
  /**
   * The argument objects of each `beginRenderPass` call. Code that reuses an
   * object gives the same object more than one time.
   */
  readonly passDescriptorObjects: GPURenderPassDescriptor[];
  /** Each `writeBuffer` call. */
  readonly writes: BufferWrite[];
  /** The command buffers of each `submit` call. */
  readonly submissions: GPUCommandBuffer[][];
  /** The render pass that `beginRenderPass` gives. */
  readonly pass: GPURenderPassEncoder;
  /** The pipeline that `createRenderPipeline` gives. */
  readonly pipeline: GPURenderPipeline;
  /** The buffer that `createBuffer` gives. */
  readonly buffer: GPUBuffer;
  /** The bind group that `createBindGroup` gives. */
  readonly bindGroup: GPUBindGroup;
  /** The command buffer that `finish` gives. */
  readonly commandBuffer: GPUCommandBuffer;
}

/**
 * Make a fake render pass that adds the name of each call to `events`.
 *
 * @param events - The list that receives the names of the calls.
 * @returns The fake render pass.
 */
export function createFakePass(events: string[]): GPURenderPassEncoder {
  return fake<GPURenderPassEncoder>({
    setPipeline: () => void events.push("setPipeline"),
    setBindGroup: (index: number) => void events.push(`setBindGroup:${index}`),
    draw: (count: number) => void events.push(`draw:${count}`),
    end: () => void events.push("pass.end"),
  });
}

/**
 * Make a fake GPU device.
 *
 * @returns The device and the records of its calls.
 */
export function createFakeDevice(): FakeDevice {
  const events: string[] = [];
  const shaderModuleDescriptors: GPUShaderModuleDescriptor[] = [];
  const pipelineDescriptors: GPURenderPipelineDescriptor[] = [];
  const bufferDescriptors: GPUBufferDescriptor[] = [];
  const bindGroupDescriptors: GPUBindGroupDescriptor[] = [];
  const textureDescriptors: GPUTextureDescriptor[] = [];
  const textureView = fake<GPUTextureView>({});
  const passDescriptors: GPURenderPassDescriptor[] = [];
  const passDescriptorObjects: GPURenderPassDescriptor[] = [];
  const writes: BufferWrite[] = [];
  const submissions: GPUCommandBuffer[][] = [];

  const pass = createFakePass(events);
  const module = fake<GPUShaderModule>({});
  const layout = fake<GPUBindGroupLayout>({});
  const buffer = fake<GPUBuffer>({});
  const bindGroup = fake<GPUBindGroup>({});
  const commandBuffer = fake<GPUCommandBuffer>({});
  const pipeline = fake<GPURenderPipeline>({
    getBindGroupLayout: (index: number) => {
      events.push(`getBindGroupLayout:${index}`);
      return layout;
    },
  });

  const device = fake<GPUDevice>({
    createShaderModule: (descriptor: GPUShaderModuleDescriptor) => {
      shaderModuleDescriptors.push(descriptor);
      return module;
    },
    createRenderPipeline: (descriptor: GPURenderPipelineDescriptor) => {
      pipelineDescriptors.push(descriptor);
      return pipeline;
    },
    createBuffer: (descriptor: GPUBufferDescriptor) => {
      bufferDescriptors.push(descriptor);
      return buffer;
    },
    createBindGroup: (descriptor: GPUBindGroupDescriptor) => {
      bindGroupDescriptors.push(descriptor);
      return bindGroup;
    },
    createTexture: (descriptor: GPUTextureDescriptor) => {
      textureDescriptors.push(descriptor);
      events.push("createTexture");
      return fake<GPUTexture>({
        createView: () => textureView,
        destroy: () => void events.push("texture.destroy"),
      });
    },
    createCommandEncoder: () => {
      events.push("createCommandEncoder");
      return fake<GPUCommandEncoder>({
        beginRenderPass: (descriptor: GPURenderPassDescriptor) => {
          passDescriptorObjects.push(descriptor);
          passDescriptors.push({
            ...descriptor,
            colorAttachments: [...descriptor.colorAttachments].flatMap((
              attachment,
            ) => attachment ? [{ ...attachment }] : []),
          });
          events.push("beginRenderPass");
          return pass;
        },
        finish: () => {
          events.push("finish");
          return commandBuffer;
        },
      });
    },
    queue: fake<GPUQueue>({
      writeBuffer: (
        target: GPUBuffer,
        offset: number,
        data: Float32Array,
      ) => {
        writes.push({ buffer: target, offset, data: Array.from(data) });
        events.push("writeBuffer");
      },
      submit: (buffers: GPUCommandBuffer[]) => {
        submissions.push([...buffers]);
        events.push("submit");
      },
    }),
  });

  return {
    device,
    events,
    shaderModuleDescriptors,
    pipelineDescriptors,
    bufferDescriptors,
    bindGroupDescriptors,
    textureDescriptors,
    textureView,
    passDescriptors,
    passDescriptorObjects,
    writes,
    submissions,
    pass,
    pipeline,
    buffer,
    bindGroup,
    commandBuffer,
  };
}

/** The width of a new canvas, in pixels. A real canvas starts with it. */
const DEFAULT_CANVAS_WIDTH = 300;

/** The height of a new canvas, in pixels. A real canvas starts with it. */
const DEFAULT_CANVAS_HEIGHT = 150;

/** A fake canvas and the records of the calls that it received. */
export interface FakeSurface {
  /** The fake canvas. Give it to the code under test. */
  readonly surface: HTMLCanvasElement;
  /** The context that `getContext` gives. It is `null` when a test asks. */
  readonly context: GPUCanvasContext | null;
  /** The arguments of each `configure` call. */
  readonly configurations: GPUCanvasConfiguration[];
  /** The view that the texture of the context gives. */
  readonly view: GPUTextureView;
}

/**
 * Make a fake canvas.
 *
 * @param hasContext - `false` makes `getContext` give `null`.
 * @returns The canvas and the records of its calls.
 */
export function createFakeSurface(hasContext = true): FakeSurface {
  const view = fake<GPUTextureView>({});
  const configurations: GPUCanvasConfiguration[] = [];
  const context = hasContext
    ? fake<GPUCanvasContext>({
      configure: (configuration: GPUCanvasConfiguration) => {
        configurations.push(configuration);
      },
      getCurrentTexture: () => ({
        createView: () => view,
        width: surface.width,
        height: surface.height,
      }),
    })
    : null;

  const surface = fake<HTMLCanvasElement>({
    width: DEFAULT_CANVAS_WIDTH,
    height: DEFAULT_CANVAS_HEIGHT,
    getContext: () => context,
  });
  return {
    surface,
    context,
    configurations,
    view,
  };
}

/** The values that a fake `navigator.gpu` gives. */
export interface FakeNavigatorGPUOptions {
  /** The device that the adapter gives. */
  readonly device: GPUDevice;
  /** `false` makes `requestAdapter` give `null`. */
  readonly hasAdapter?: boolean;
  /** The preferred pixel format. */
  readonly format?: GPUTextureFormat;
  /**
   * A function that runs each time the code asks for an adapter. It gets the
   * options of the request.
   */
  readonly onRequestAdapter?: (options?: GPURequestAdapterOptions) => void;
}

/**
 * Replace `navigator.gpu` with a fake.
 *
 * @param options - The device, the adapter switch, and the pixel format.
 * @returns A function that puts the original value back.
 */
export function installFakeNavigatorGPU(
  options: FakeNavigatorGPUOptions,
): () => void {
  const {
    device,
    hasAdapter = true,
    format = "bgra8unorm",
    onRequestAdapter = () => {},
  } = options;
  const original = Object.getOwnPropertyDescriptor(navigator, "gpu");
  Object.defineProperty(navigator, "gpu", {
    configurable: true,
    value: {
      requestAdapter: (adapterOptions?: GPURequestAdapterOptions) => {
        onRequestAdapter(adapterOptions);
        return Promise.resolve(
          hasAdapter ? { requestDevice: () => Promise.resolve(device) } : null,
        );
      },
      getPreferredCanvasFormat: () => format,
    },
  });
  return () => {
    if (original) {
      Object.defineProperty(navigator, "gpu", original);
    } else {
      delete (navigator as unknown as Record<string, unknown>).gpu;
    }
  };
}

/** The fake `ResizeObserver` class and the records of its calls. */
export interface FakeResizeObservers {
  /** The options of each `observe` call, by target. */
  readonly options: Map<Element, ResizeObserverOptions | undefined>;
  /**
   * Send a size report to each observer that watches a target.
   *
   * @param target - The element that changed size.
   * @param width - The new width, in device pixels.
   * @param height - The new height, in device pixels.
   */
  resize(target: Element, width: number, height: number): void;
  /** Put the original `ResizeObserver` back. */
  restore(): void;
}

/**
 * Replace `ResizeObserver` with a fake that a test can drive.
 *
 * @returns The records of the calls, a `resize` function, and a `restore`
 * function.
 */
export function installFakeResizeObserver(): FakeResizeObservers {
  const options = new Map<Element, ResizeObserverOptions | undefined>();
  const callbacks = new Map<Element, ResizeObserverCallback[]>();

  class FakeResizeObserver {
    /** The function to call with the size reports. */
    private readonly callback: ResizeObserverCallback;

    /**
     * Keep the callback.
     *
     * @param callback - The function to call with the size reports.
     */
    public constructor(callback: ResizeObserverCallback) {
      this.callback = callback;
    }

    /**
     * Start to watch a target.
     *
     * @param target - The element to watch.
     * @param observeOptions - The box to watch.
     */
    public observe(target: Element, observeOptions?: ResizeObserverOptions) {
      options.set(target, observeOptions);
      callbacks.set(target, [...(callbacks.get(target) ?? []), this.callback]);
    }
  }

  const original = Object.getOwnPropertyDescriptor(
    globalThis,
    "ResizeObserver",
  );
  Object.defineProperty(globalThis, "ResizeObserver", {
    configurable: true,
    writable: true,
    value: FakeResizeObserver,
  });

  /** Send one size report to each observer that watches a target. */
  const send = (target: Element, sizes: object): void => {
    const entry = fake<ResizeObserverEntry>({ target, ...sizes });
    for (const callback of callbacks.get(target) ?? []) {
      callback([entry], fake<ResizeObserver>({}));
    }
  };

  return {
    options,
    resize: (target, width, height) => {
      send(target, {
        devicePixelContentBoxSize: [{ inlineSize: width, blockSize: height }],
      });
    },
    restore: () => {
      if (original) {
        Object.defineProperty(globalThis, "ResizeObserver", original);
      } else {
        delete (globalThis as unknown as Record<string, unknown>)
          .ResizeObserver;
      }
    },
  };
}

/** The fake animation frame functions and the records of their calls. */
export interface FakeAnimationFrames {
  /** The number of frame requests that wait for a screen refresh. */
  readonly pending: number;
  /**
   * Run a screen refresh. It runs each waiting request one time.
   *
   * @param time - The time of the frame, in milliseconds.
   */
  step(time: number): void;
  /** Put the original functions back. */
  restore(): void;
}

/**
 * Replace `requestAnimationFrame` and `cancelAnimationFrame` with fakes that a
 * test can drive.
 *
 * @returns The records of the calls, a `step` function, and a `restore`
 * function.
 */
export function installFakeAnimationFrames(): FakeAnimationFrames {
  const requests = new Map<number, FrameRequestCallback>();
  let lastId = 0;

  const names = ["requestAnimationFrame", "cancelAnimationFrame"] as const;
  const originals = names.map((name) =>
    Object.getOwnPropertyDescriptor(globalThis, name)
  );
  const target = globalThis as unknown as Record<string, unknown>;
  target.requestAnimationFrame = (callback: FrameRequestCallback): number => {
    lastId += 1;
    requests.set(lastId, callback);
    return lastId;
  };
  target.cancelAnimationFrame = (id: number): void => {
    requests.delete(id);
  };

  return {
    get pending() {
      return requests.size;
    },
    step: (time) => {
      const callbacks = [...requests.values()];
      requests.clear();
      for (const callback of callbacks) {
        callback(time);
      }
    },
    restore: () => {
      names.forEach((name, index) => {
        const original = originals[index];
        if (original) {
          Object.defineProperty(globalThis, name, original);
        } else {
          delete target[name];
        }
      });
    },
  };
}
