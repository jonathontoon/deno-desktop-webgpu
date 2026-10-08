/**
 * Fake GPU and window objects for the unit tests. They need no GPU and no
 * display. Each fake records the calls that it receives.
 *
 * @module
 */
import type { AppWindowOptions, NativeSurface } from "../types.ts";

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
  /** The arguments of each `beginRenderPass` call. */
  readonly passDescriptors: GPURenderPassDescriptor[];
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
  const passDescriptors: GPURenderPassDescriptor[] = [];
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
    createCommandEncoder: () => {
      events.push("createCommandEncoder");
      return fake<GPUCommandEncoder>({
        beginRenderPass: (descriptor: GPURenderPassDescriptor) => {
          passDescriptors.push(descriptor);
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
    passDescriptors,
    writes,
    submissions,
    pass,
    pipeline,
    buffer,
    bindGroup,
    commandBuffer,
  };
}

/** A fake window surface and the records of the calls that it received. */
export interface FakeSurface {
  /** The fake surface. Give it to the code under test. */
  readonly surface: NativeSurface;
  /** The context that `getContext` gives. It is `null` when a test asks. */
  readonly context: GPUCanvasContext | null;
  /** The arguments of each `configure` call. */
  readonly configurations: GPUCanvasConfiguration[];
  /** The view that the texture of the context gives. */
  readonly view: GPUTextureView;
  /** The number of `present` calls. */
  presentCount: number;
}

/**
 * Make a fake window surface.
 *
 * @param hasContext - `false` makes `getContext` give `null`.
 * @returns The surface and the records of its calls.
 */
export function createFakeSurface(hasContext = true): FakeSurface {
  const view = fake<GPUTextureView>({});
  const configurations: GPUCanvasConfiguration[] = [];
  const context = hasContext
    ? fake<GPUCanvasContext>({
      configure: (configuration: GPUCanvasConfiguration) => {
        configurations.push(configuration);
      },
      getCurrentTexture: () => ({ createView: () => view }),
    })
    : null;

  const record: FakeSurface = {
    surface: fake<NativeSurface>({
      width: 0,
      height: 0,
      getContext: () => context,
      present: () => {
        record.presentCount += 1;
      },
    }),
    context,
    configurations,
    view,
    presentCount: 0,
  };
  return record;
}

/** The values that a fake `navigator.gpu` gives. */
export interface FakeNavigatorGPUOptions {
  /** The device that the adapter gives. */
  readonly device: GPUDevice;
  /** `false` makes `requestAdapter` give `null`. */
  readonly hasAdapter?: boolean;
  /** The preferred pixel format. */
  readonly format?: GPUTextureFormat;
  /** A function that runs each time the code asks for an adapter. */
  readonly onRequestAdapter?: () => void;
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
      requestAdapter: () => {
        onRequestAdapter();
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

/** A fake of `Deno.BrowserWindow`. A test can close it and send events. */
export class FakeBrowserWindow {
  /** The window that the code under test made last. */
  public static last: FakeBrowserWindow | undefined;

  /** The number of windows that the code under test made. */
  public static count = 0;

  /** `true` after the test closes the window. */
  public closed = false;

  /** The width and the height that `getSize` gives. */
  public size: [number, number];

  /** The fake surface of this window. */
  public readonly surfaceKit: FakeSurface = createFakeSurface();

  /** The listeners, by event name. */
  private readonly listeners = new Map<string, () => void>();

  /**
   * Make the window and remember it in `FakeBrowserWindow.last`.
   *
   * @param options - The title and the size of the window.
   */
  public constructor(public readonly options: AppWindowOptions) {
    this.size = [options.width, options.height];
    FakeBrowserWindow.last = this;
    FakeBrowserWindow.count += 1;
  }

  /**
   * Give the fake surface of this window.
   *
   * @returns The fake surface.
   */
  public getNativeWindow(): NativeSurface {
    return this.surfaceKit.surface;
  }

  /**
   * Give the size of the window.
   *
   * @returns The width and the height of the window.
   */
  public getSize(): [number, number] {
    return this.size;
  }

  /**
   * Find out if the test closed the window.
   *
   * @returns `true` if the test closed the window.
   */
  public isClosed(): boolean {
    return this.closed;
  }

  /**
   * Keep a listener.
   *
   * @param type - The name of the event.
   * @param listener - The function to call when the event happens.
   */
  public addEventListener(type: string, listener: () => void): void {
    this.listeners.set(type, listener);
  }

  /**
   * Run the listener of an event.
   *
   * @param type - The name of the event.
   */
  public dispatch(type: string): void {
    this.listeners.get(type)?.();
  }
}

/**
 * Replace `Deno.BrowserWindow` with `FakeBrowserWindow`.
 *
 * @returns A function that puts the original value back.
 */
export function installFakeBrowserWindow(): () => void {
  const target = Deno as unknown as Record<string, unknown>;
  const original = Object.getOwnPropertyDescriptor(target, "BrowserWindow");
  FakeBrowserWindow.last = undefined;
  FakeBrowserWindow.count = 0;
  Object.defineProperty(target, "BrowserWindow", {
    configurable: true,
    writable: true,
    value: FakeBrowserWindow,
  });
  return () => {
    if (original) {
      Object.defineProperty(target, "BrowserWindow", original);
    } else {
      delete target.BrowserWindow;
    }
  };
}
