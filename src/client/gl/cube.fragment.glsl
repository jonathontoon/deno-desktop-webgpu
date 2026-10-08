#version 300 es
// GLSL ES 3.00 shader code. It does the same work as the fragment function in
// cube.wgsl.

precision highp float;

in vec3 vColor;

out vec4 outColor;

void main() {
  outColor = vec4(vColor, 1.0);
}
