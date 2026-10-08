#version 300 es
// GLSL ES 3.00 shader code. It does the same work as cube.wgsl. Keep the
// numbers and the corner table the same in both files.
//
// The cube has 8 corners. The number of a corner has 3 bits: the bits are the
// x, y, and z position (0 or 1). The color of a corner is its position, so the
// corners are the 8 colors of the RGB cube. The GPU mixes the colors on each
// face.

precision highp float;

uniform float uAngle;
uniform float uAspectRatio;

out vec3 vColor;

// Half of the length of one edge of the cube.
const float HALF_EDGE = 0.4;
// The distance from the camera to the center of the cube.
const float CAMERA_DISTANCE = 2.0;
// The planes that cut the view. The GPU draws only what is between them.
const float NEAR = 0.1;
const float FAR = 10.0;
// 1 divided by tan(30 degrees). The field of view is 60 degrees.
const float FOCAL_LENGTH = 1.7320508;
// How fast the cube tips forward, compared with how fast it turns.
const float TILT_RATIO = 0.6;

// The 12 triangles of the 6 faces, as numbers of corners. Seen from outside the
// cube, each triangle goes around in the same direction.
const int CORNERS[36] = int[36](
  4, 6, 2, 4, 2, 0,
  1, 3, 7, 1, 7, 5,
  0, 1, 5, 0, 5, 4,
  6, 7, 3, 6, 3, 2,
  2, 3, 1, 2, 1, 0,
  4, 5, 7, 4, 7, 6
);

void main() {
  int corner = CORNERS[gl_VertexID];
  vec3 unit = vec3(
    float(corner & 1),
    float((corner >> 1) & 1),
    float((corner >> 2) & 1)
  );
  vec3 local = (unit - vec3(0.5)) * (2.0 * HALF_EDGE);

  // Turn around the y axis, then tip around the x axis.
  float cy = cos(uAngle);
  float sy = sin(uAngle);
  vec3 turned = vec3(
    local.x * cy + local.z * sy,
    local.y,
    -local.x * sy + local.z * cy
  );
  float cx = cos(uAngle * TILT_RATIO);
  float sx = sin(uAngle * TILT_RATIO);
  vec3 tipped = vec3(
    turned.x,
    turned.y * cx - turned.z * sx,
    turned.y * sx + turned.z * cx
  );

  // Move the cube away from the camera. Then project it into the window.
  float depth = tipped.z + CAMERA_DISTANCE;
  gl_Position = vec4(
    tipped.x * FOCAL_LENGTH / uAspectRatio,
    tipped.y * FOCAL_LENGTH,
    depth * FAR / (FAR - NEAR) - FAR * NEAR / (FAR - NEAR),
    depth
  );
  vColor = unit;
}
