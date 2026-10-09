// WGSL shader code. WGSL is the language that WebGPU programs the GPU with.
//
// The cube has 8 corners. The number of a corner has 3 bits: the bits are the
// x, y, and z position (0 or 1). The color of a corner is its position, so the
// corners are the 8 colors of the RGB cube. The GPU mixes the colors on each
// face. The program computes the turn, the tip, and the camera of each frame
// one time, and it gives them to the shader as one matrix.

struct Uniforms {
  transform: mat4x4f,
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) color: vec3f,
}

// Half of the length of one edge of the cube.
const HALF_EDGE = 0.4;

// The 12 triangles of the 6 faces, as numbers of corners. Seen from outside the
// cube, each triangle goes around in the same direction.
const CORNERS = array<u32, 36>(
  4, 6, 2, 4, 2, 0,
  1, 3, 7, 1, 7, 5,
  0, 1, 5, 0, 5, 4,
  6, 7, 3, 6, 3, 2,
  2, 3, 1, 2, 1, 0,
  4, 5, 7, 4, 7, 6,
);

@vertex
fn vertexMain(@builtin(vertex_index) index: u32) -> VertexOutput {
  let corner = CORNERS[index];
  let unit = vec3f(
    f32(corner & 1u),
    f32((corner >> 1u) & 1u),
    f32((corner >> 2u) & 1u),
  );
  let local = (unit - vec3f(0.5)) * (2.0 * HALF_EDGE);

  var out: VertexOutput;
  out.position = uniforms.transform * vec4f(local, 1.0);
  out.color = unit;
  return out;
}

@fragment
fn fragmentMain(in: VertexOutput) -> @location(0) vec4f {
  return vec4f(in.color, 1.0);
}
