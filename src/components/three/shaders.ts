/** Parametrik "dijital heykel" için ortak vertex shader: yüzey tamamen GPU'da üretilir. */
export const vertexShader = /* glsl */ `
uniform float uTime;
uniform vec3 uForm;
uniform float uImpulse;
uniform vec2 uMouse;
uniform float uScroll;
varying vec3 vWorld;
varying float vV;
varying float vR;
const float PI = 3.14159265359;

vec3 sculpt(float u, float v) {
  float th = u * PI * 2.0;
  float t = uTime;
  float s = sin(PI * v);
  float ra = (0.50 + 0.34 * pow(s, 0.65)) * (1.0 + 0.22 * sin(3.0 * th + v * 9.0 + t * 0.35));
  float rb = (0.26 + 0.66 * pow(s, 1.3)) * (1.0 + 0.17 * sin(5.0 * th - v * 6.0 - t * 0.30));
  float rc = (0.56 + 0.32 * cos(PI * 2.5 * v + 0.6)) * (1.0 + 0.26 * sin(2.0 * th + v * 17.0 + t * 0.25));
  float r = ra * uForm.x + rb * uForm.y + rc * uForm.z;
  r *= 1.0 + uScroll * 0.18 * sin(th * 4.0 + v * 10.0);
  r += uImpulse * 0.085 * sin(th * 7.0 + v * 15.0 - t * 10.0);
  float y = (v - 0.5) * 2.7;
  float tw = (v - 0.5) * (0.9 + uScroll * 2.2);
  vR = r;
  return vec3(cos(th + tw) * r, y, sin(th + tw) * r);
}

void main() {
  vec3 p = sculpt(uv.x, uv.y);
  vec3 wp = (modelMatrix * vec4(p, 1.0)).xyz;
  vec2 m = uMouse * vec2(1.8, 1.4);
  float d = distance(wp.xy, m);
  float k = exp(-d * d * 1.6);
  vec3 radial = normalize(vec3(p.x, 0.0, p.z) + vec3(1e-4));
  p += radial * k * 0.14 * (0.4 + uImpulse);
  vV = uv.y;
  vWorld = (modelMatrix * vec4(p, 1.0)).xyz;
  gl_Position = projectionMatrix * viewMatrix * vec4(vWorld, 1.0);
}
`;

export const surfaceFragment = /* glsl */ `
uniform vec3 uBase;
uniform vec3 uRim;
varying vec3 vWorld;
varying float vV;
varying float vR;
void main() {
  vec3 n = normalize(cross(dFdx(vWorld), dFdy(vWorld)));
  if (!gl_FrontFacing) n = -n;
  vec3 vdir = normalize(cameraPosition - vWorld);
  float fres = pow(1.0 - abs(dot(n, vdir)), 2.4);
  float l = max(dot(n, normalize(vec3(0.4, 0.8, 0.6))), 0.0);
  vec3 col = uBase * (0.55 + 0.6 * l) + uRim * fres * 0.85;
  col += uRim * 0.12 * smoothstep(0.7, 1.1, vR);
  gl_FragColor = vec4(col, 1.0);
}
`;

export const lineFragment = /* glsl */ `
uniform vec3 uLineA;
uniform vec3 uLineB;
varying float vV;
varying float vR;
void main() {
  vec3 col = mix(uLineA, uLineB, smoothstep(0.1, 0.9, vV));
  float a = 0.45 + 0.55 * smoothstep(0.25, 0.95, vR);
  gl_FragColor = vec4(col, a);
}
`;
