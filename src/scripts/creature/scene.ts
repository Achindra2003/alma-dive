// The Dive: one water column, one jellyfish. Lazy-loaded after first paint.
// docs/dive/03-DESIGN-LANGUAGE.md §4 (one light source: the surface, above), §7 (how the creature is used).
// A single `depth` value (0 surface, 0.5 mid-water, 1 the deep) drives the water colour, the surface seen from below,
// the light shafts, the creature's tissue (lit pearl up top, its own violet in the dark) and the particles.
// shader-dev: water-ocean (caustic ridges, Beer-style absorption), atmospheric-scattering (extinction with distance,
// shafts), procedural-noise (haze, tissue). No bloom, no post chain: nothing glows without a source.
import * as THREE from "three";
import { gsap } from "gsap";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { demoFiles, type Demo } from "../../data/demos";
import type { AnchorOptions, CreatureImpl, CreatureState } from "./index";

// ---------- easing (tokens.css curves) ----------
function bezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sy = (t: number) => ((ay * t + by) * t + cy) * t;
  const dx = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (x: number) => {
    let t = x;
    for (let i = 0; i < 6; i++) {
      const d = dx(t);
      if (Math.abs(d) < 1e-6) break;
      t -= (sx(t) - x) / d;
    }
    return sy(Math.min(1, Math.max(0, t)));
  };
}
const easeOut = bezier(0.23, 1, 0.32, 1);
const easeInOut = bezier(0.77, 0, 0.175, 1);
const smooth = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

// Pearl is the tissue under surface light; violet (--life) is the creature's own light. Display-space values.
const PEARL = new THREE.Color(0.84, 0.87, 1.0);
const LIFE = new THREE.Color(0.52, 0.45, 1.0);

const STATES: Record<CreatureState, { glow: number; period: number }> = {
  idle: { glow: 1, period: 5200 },
  bloom: { glow: 1.3, period: 4200 },
  startle: { glow: 1, period: 900 },
};

const NOISE_GLSL = /* glsl */ `
  float hash(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
  float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
    return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y); }
  // Caustics: domain-warped ridged noise (division-free; the iterative variant NaNs under D3D fast-math)
  float caustic(vec2 p, float t){
    vec2 w = vec2(noise(p*0.8 + vec2(t*0.21, 0.0)), noise(p*0.8 + vec2(5.2, -t*0.17)));
    vec2 q = p + (w - 0.5) * 2.2;
    float v1 = 1.0 - abs(noise(q*1.4 + t*0.12)*2.0 - 1.0);
    float v2 = 1.0 - abs(noise(q*2.3 - t*0.09 + 3.7)*2.0 - 1.0);
    return pow(v1, 7.0)*0.7 + pow(v2, 9.0)*0.5;
  }
`;

// The water. Colours are the water-by-depth roles in docs/dive/04-DESIGN-SYSTEM.md §2, converted to display sRGB.
const WATER_FRAG = /* glsl */ `
  precision highp float;
  uniform vec2 uRes; uniform float uTime; uniform float uDepth; uniform float uLight; uniform float uOctaves;
  uniform vec2 uSun;                       // the light source in uv space (it sits above the frame)
  uniform vec2 uGlowPos; uniform float uGlow; uniform vec3 uLife;
  uniform vec4 uRipples[4];                // x, y (gl px), start time, strength
  uniform float uCueShade;                 // narrow screens: the scroll cue sits top-right, so that corner is shaded too
  ${NOISE_GLSL}
  const mat2 R = mat2(0.80, 0.60, -0.60, 0.80);
  float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ if (float(i) >= uOctaves) break; v += a*noise(p); p = R*p*2.03; a *= 0.5; } return v; }
  const vec3 S_TOP = vec3(0.190, 0.265, 0.490), S_BOT = vec3(0.044, 0.019, 0.133);
  const vec3 M_TOP = vec3(0.075, 0.070, 0.230), M_BOT = vec3(0.030, 0.010, 0.068);   // indigo, a little bluer than the token: measured below
  const vec3 D_TOP = vec3(0.043, 0.004, 0.067), D_BOT = vec3(0.027, 0.004, 0.043);
  const vec3 LIGHT = vec3(0.62, 0.72, 1.0);
  const vec3 SUN_DIR = vec3(0.330, 0.800, 0.500);
  void main(){
    vec2 px = gl_FragCoord.xy;
    // ripples: a ring travels out at 0.22 screen heights a second (ripples.ts bends the type at the same speed),
    // bending the water it passes and catching a little light
    float ringLight = 0.0;
    for (int i = 0; i < 4; i++){
      vec4 q = uRipples[i]; float age = uTime - q.z;
      if (q.w > 0.0 && age > 0.0 && age < 2.6){
        vec2 dv = px - q.xy; float l = length(dv);
        float ring = exp(-pow((l - age*uRes.y*0.22) / (uRes.y*(0.016 + age*0.012)), 2.0));
        float fade = 1.0 - age/2.6; fade *= fade;
        px += dv / max(l, 1.0) * ring * uRes.y * 0.014 * q.w * fade;
        ringLight += ring * fade * q.w;
      }
    }
    vec2 uv = px / uRes;
    float asp = uRes.x / uRes.y;
    float toMid = smoothstep(0.0, 0.5, uDepth), toDeep = smoothstep(0.5, 1.0, uDepth);
    float surf = 1.0 - smoothstep(0.0, 0.9, uDepth);             // how much surface light reaches this depth (mid-water keeps about 40%)
    // the water column: lighter toward the surface, absorbed toward the bottom of the frame
    vec3 top = mix(mix(S_TOP, M_TOP, toMid), D_TOP, toDeep);
    vec3 bot = mix(mix(S_BOT, M_BOT, toMid), D_BOT, toDeep);
    vec3 col = mix(bot, top, pow(uv.y, 1.7));
    // light falls off away from its source, so the far corner (where the type sits) stays dark
    vec2 sd = (uv - uSun) * vec2(asp, 1.0);
    float r = length(sd);
    col *= mix(1.0, mix(0.5, 1.0, smoothstep(1.45, 0.35, r)), surf);
    col += LIGHT * 0.15 * exp(-r*r*1.7) * surf;
    // slow haze: the water is a volume, not a gradient
    vec2 hp = vec2(uv.x*asp*1.6, uv.y*1.3);
    float hz = fbm(hp + vec2(fbm(hp + uTime*0.015), fbm(hp + 7.3 - uTime*0.012))*1.5 + vec2(0.0, -uTime*0.02));
    col *= 0.86 + 0.28*hz;
    // the surface seen from below: a plane above the camera, its ripples fading with distance through the water
    vec3 rd = normalize(vec3((uv.x - 0.5)*asp*0.63, (uv.y - 0.5)*0.63 + 0.30, 1.0));
    float H = 1.5 + uDepth*26.0;
    float t = H / max(rd.y, 0.02);
    vec2 hit = rd.xz * t;
    float rip = caustic(hit*1.7 + vec2(uTime*0.05, uTime*0.03), uTime*0.45);
    float swell = noise(hit*0.5 + uTime*0.04);
    float sunA = pow(max(dot(rd, SUN_DIR), 0.0), 3.0);
    col += LIGHT * (0.10 + 0.5*swell*swell + rip*1.3) * exp(-t*0.56) * (0.06 + sunA*2.6) * surf;
    // shafts fall from the source and thin with distance
    float ang = atan(sd.x, -sd.y);
    float rays = noise(vec2(ang*7.0 + 2.0, uTime*0.045)) * noise(vec2(ang*19.0 - 5.0, 3.1 - uTime*0.07));
    rays = smoothstep(0.16, 0.62, rays) * exp(-r*1.15) * smoothstep(0.15, 0.45, r) * smoothstep(1.9, 0.6, abs(ang));
    col += LIGHT * rays * 0.30 * surf;
    // in the dark the creature is the light source
    float d = distance(px, uGlowPos);
    col += uLife * uGlow * (0.015 + 0.30*toDeep) * exp(-d / (uRes.y*0.22));
    // the corner that holds the wordmark stays in shade at every width (measured contrast, 04-DESIGN-SYSTEM §2)
    col *= 1.0 - 0.62*exp(-pow(length((uv - vec2(0.0, 1.0))*vec2(asp, 1.0))/0.30, 2.0));
    col *= 1.0 - 0.7*uCueShade*exp(-pow(length((uv - vec2(1.0, 1.0))*vec2(asp, 1.0))/0.34, 2.0));
    col += mix(LIGHT, uLife, toDeep) * ringLight * (0.035 + 0.03*toDeep);
    col *= uLight;
    col *= 1.0 - 0.34*pow(length((uv - vec2(0.60, 0.56))*vec2(1.0, 0.9))*1.25, 2.2);
    col += (hash(px) - 0.5) * 0.006;   // static dither against banding; too low to read as grain
    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
  }`;

export function createScene(canvas: HTMLCanvasElement, onLost: () => void): CreatureImpl & { tier: "high" | "low" } {
  const reduceMQ = matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const tier: "high" | "low" = !finePointer || (navigator.hardwareConcurrency ?? 8) <= 4 ? "low" : "high";
  const cfg = tier === "low"
    ? { tentacles: 30, segs: 20, snow: 60, dpr: Math.min(devicePixelRatio, 1.5), octaves: 3 }
    : { tentacles: 45, segs: 30, snow: 130, dpr: Math.min(devicePixelRatio, 2), octaves: 5 };

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, stencil: false, powerPreference: tier === "low" ? "low-power" : "high-performance" });
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace; // shaders write display values; pass-through
  renderer.setPixelRatio(cfg.dpr);
  renderer.autoClear = false;
  const gl = renderer.getContext();

  const scene = new THREE.Scene();
  const CAM_Z = 7;
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, CAM_Z);
  camera.lookAt(0, 0, 0);

  // ---------- water ----------
  const bgScene = new THREE.Scene();
  const bgCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const waterU = {
    uRes: { value: new THREE.Vector2(1, 1) }, uTime: { value: 0 }, uDepth: { value: 0 }, uLight: { value: 1 },
    uOctaves: { value: cfg.octaves }, uSun: { value: new THREE.Vector2(0.7, 1.22) },
    uGlowPos: { value: new THREE.Vector2() }, uGlow: { value: 1 }, uLife: { value: LIFE },
    uRipples: { value: [new THREE.Vector4(), new THREE.Vector4(), new THREE.Vector4(), new THREE.Vector4()] },
    uCueShade: { value: 0 },
  };
  let rippleIdx = 0;
  const bgQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
    vertexShader: `void main(){ gl_Position = vec4(position.xy, 0.0, 1.0); }`,
    fragmentShader: WATER_FRAG, uniforms: waterU, depthWrite: false, depthTest: false,
  }));
  bgQuad.frustumCulled = false;
  bgScene.add(bgQuad);

  // ---------- the bell ----------
  // Profile (radius, height), height normalised 0..1. Modelled on a moon jelly / Turritopsis medusa:
  // flat crown, broad shoulder, a thin margin that flares, then curls in (the velum).
  const BELL_PROFILE = [
    [0.0, 1.0], [0.18, 0.99], [0.36, 0.955], [0.52, 0.89], [0.65, 0.8], [0.76, 0.68], [0.85, 0.54],
    [0.92, 0.38], [0.965, 0.22], [0.99, 0.1], [1.0, 0.03], [0.985, 0.0], [0.955, 0.01],
  ].map(([r, y]) => new THREE.Vector2(Math.max(r, 0.0001), y));
  const PULSE_IN = 0.2;  // how far the margin draws in at full stroke
  const tissueU = { uSurf: { value: 1 }, uSelf: { value: 0 }, uGlow: { value: 1 }, uTime: { value: 0 }, uLife: { value: LIFE }, uPearl: { value: PEARL } };
  const bellU = { ...tissueU, uPulse: { value: 0 } };
  const bell = new THREE.Mesh(new THREE.LatheGeometry(BELL_PROFILE, tier === "low" ? 48 : 96), new THREE.ShaderMaterial({
    uniforms: bellU,
    vertexShader: /* glsl */ `
      uniform float uPulse; uniform float uTime;
      varying vec3 vN; varying vec3 vNw; varying vec3 vView; varying float vY; varying vec3 vPos;
      void main() {
        vec3 p = position;
        float rim = 1.0 - p.y;
        p.xz *= 1.0 - uPulse * ${PULSE_IN.toFixed(2)} * rim;
        p.y = p.y * 0.52 * (1.0 + uPulse * 0.14);   // a lens: about half as tall as it is wide
        float a = atan(p.z, p.x);
        // the margin: eight shallow notches and a slow travelling ripple, never a scalloped cup
        float m = pow(rim, 3.0);
        p.y -= m * (0.012 * abs(sin(a*4.0)) + 0.008 * sin(a*3.0 - uTime*0.5));
        vY = position.y; vPos = position;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vN = normalize(normalMatrix * normal);
        vNw = normalize(mat3(modelMatrix) * normal);
        vView = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uSurf; uniform float uSelf; uniform float uGlow; uniform float uTime;
      uniform vec3 uLife; uniform vec3 uPearl;
      varying vec3 vN; varying vec3 vNw; varying vec3 vView; varying float vY; varying vec3 vPos;
      ${NOISE_GLSL}
      void main() {
        // translucent tissue: a thin edge that catches light (fresnel), a crown lit from above, caustics from the
        // surface moving over it, fine radial canals and the margin ring
        vec3 n = normalize(vN), v = normalize(vView);
        float fres = pow(1.0 - abs(dot(n, v)), 2.2);
        float top = clamp(vY, 0.0, 1.0);
        float a = atan(vPos.z, vPos.x);
        float sky = clamp(normalize(vNw).y*0.5 + 0.5, 0.0, 1.0);
        float c = caustic(vPos.xz*2.4 + vec2(0.0, uTime*0.05), uTime*0.6) * smoothstep(0.2, 0.95, top);
        float canals = pow(0.5 + 0.5*cos(a*8.0), 30.0) * smoothstep(1.0, 0.25, top);
        float ring = exp(-pow((top - 0.06)/0.03, 2.0));
        float tissue = noise(vec2(a*5.0, vY*9.0) + uTime*0.05);
        vec3 lit = uPearl * (fres*0.72 + sky*sky*0.07 + c*0.26 + canals*0.24 + ring*0.40 + tissue*0.04);
        vec3 self = uLife * (fres*1.15 + canals*0.5 + ring*0.6 + tissue*0.05 + 0.03) + uPearl*fres*fres*0.22;
        vec3 col = (lit*uSurf + self*uSelf) * uGlow * smoothstep(-0.02, 0.10, vY);
        gl_FragColor = vec4(col, 1.0);
      }`,
    transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
  }));
  const creature = new THREE.Group();
  creature.visible = false;
  creature.add(bell);
  scene.add(creature);

  // The inner mark: four lobes seen through the tissue, drawn as Alma's four-lobe mark. The one violet thing up top.
  const lobes = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.95), new THREE.ShaderMaterial({
    uniforms: tissueU,
    transparent: true, depthWrite: false, depthTest: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform float uTime; uniform float uGlow; uniform float uSelf; uniform vec3 uLife; varying vec2 vUv;
      void main(){
        vec2 p = (vUv - 0.5) * 2.0;
        float m = 0.0;
        for (int k = 0; k < 4; k++){
          float a = float(k) * 1.5707963 + 0.785398;
          vec2 c = vec2(cos(a), sin(a)) * 0.38;
          vec2 q = p - c;
          float d = abs(length(q) - 0.26);
          float open = smoothstep(-0.2, 0.35, dot(normalize(q + 1e-4), -normalize(c)));
          m += exp(-d*d / 0.0035) * (1.0 - open*0.9);
        }
        float core = exp(-dot(p, p) * 2.2) * 0.22;
        vec3 col = uLife * (m*(1.25 + 0.4*uSelf) + core) * uGlow * (0.92 + 0.08*sin(uTime*0.9));
        gl_FragColor = vec4(col * smoothstep(1.0, 0.7, length(p)), 1.0);
      }`,
  }));
  lobes.position.set(0, 0.24, 0.04);
  lobes.scale.setScalar(0.82);
  lobes.rotation.x = -0.35;
  creature.add(lobes);

  // ---------- distant kin: the deep only, faint, far off, each its own small violet light [01-PLAN §2 beat 5] ----------
  // Placed in viewport fractions (x, y from the top, bell radius as a fraction of the screen height), all in the upper
  // part of the frame so they never sit behind the text or the dock. Atmosphere, not a second metaphor [03 §1].
  const KIN: [number, number, number, number][] = [
    [0.13, 0.3, 0.02, 0.0], [0.85, 0.15, 0.028, 1.9], [0.93, 0.42, 0.013, 3.1], [0.25, 0.12, 0.011, 4.4], [0.73, 0.07, 0.009, 5.6],
  ];
  const kinU = { uGain: { value: 0 }, uLife: { value: LIFE }, uPearl: { value: PEARL } };
  const kinMat = new THREE.ShaderMaterial({
    uniforms: kinU,
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vView; varying float vY;
      void main() {
        vec3 p = position; p.y *= 0.52;
        vY = position.y;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vN = normalize(normalMatrix * normal); vView = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uGain; uniform vec3 uLife; uniform vec3 uPearl;
      varying vec3 vN; varying vec3 vView; varying float vY;
      void main() {
        float fres = pow(1.0 - abs(dot(normalize(vN), normalize(vView))), 2.0);
        float ring = exp(-pow((vY - 0.06)/0.05, 2.0));
        // rim light only: far away, a jellyfish is its edge and its margin, never a filled disc
        vec3 col = uLife * (pow(fres, 1.6)*0.8 + ring*0.35) * uGain * smoothstep(-0.02, 0.1, vY);
        gl_FragColor = vec4(col, 1.0);
      }`,
    transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
  });
  const kin = KIN.map(([, , , ph]) => {
    const m = new THREE.Mesh(bell.geometry, kinMat.clone());   // each its own gain: they pulse out of step
    m.rotation.set(0.28 + 0.12 * Math.sin(ph), ph, 0.3 * Math.sin(ph * 1.7));
    m.visible = false;
    scene.add(m);
    return m;
  });
  // their threads: a few hairlines hanging from each margin (one draw call for all of them)
  const KIN_T = 7, KIN_S = 6;
  const kinLinePos = new Float32Array(KIN.length * KIN_T * (KIN_S - 1) * 2 * 3);
  const kinLineGeo = new THREE.BufferGeometry();
  kinLineGeo.setAttribute("position", new THREE.BufferAttribute(kinLinePos, 3).setUsage(THREE.DynamicDrawUsage));
  {
    // each thread fades to nothing at its tip
    const c = new Float32Array(kinLinePos.length);
    for (let v = 0; v < c.length / 3; v++) {
      const seg = Math.floor(v / 2) % (KIN_S - 1), end = v % 2;
      const f = Math.pow(1 - (seg + end) / (KIN_S - 1), 1.5);
      c[v * 3] = LIFE.r * f; c[v * 3 + 1] = LIFE.g * f; c[v * 3 + 2] = LIFE.b * f;
    }
    kinLineGeo.setAttribute("color", new THREE.BufferAttribute(c, 3));
  }
  const kinLineMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  const kinLines = new THREE.LineSegments(kinLineGeo, kinLineMat);
  kinLines.frustumCulled = false;
  kinLines.visible = false;
  scene.add(kinLines);
  const kinRim = new THREE.Vector3();

  // ---------- the Macs: the deep only. Open laptops resting in the dark, each screen dimly showing a still from one of
  // the recordings, lit by the creature's glow as it passes [USER, 01-PLAN §10]. Code-built; no logo.
  // Unit model: base 1.0 wide; origin at the middle of the base's bottom.
  const MAC_LAYOUT: Record<"wide" | "narrow", { fx: number; fy: number; w: number; ry: number; z: number; demo: Demo["slug"]; peek: number }[]> = {
    wide: [
      { fx: 0.15, fy: 0.5, w: 0.15, ry: 0.62, z: -0.4, demo: "blender", peek: 1.1 },
      { fx: 0.79, fy: 0.52, w: 0.15, ry: -0.66, z: -0.2, demo: "passwords", peek: 0.6 },
      { fx: 0.7, fy: 0.17, w: 0.06, ry: -0.35, z: -3.5, demo: "krunker", peek: 0.9 },
    ],
    narrow: [
      { fx: 0.2, fy: 0.46, w: 0.26, ry: 0.6, z: -0.4, demo: "blender", peek: 1.1 },
      { fx: 0.76, fy: 0.4, w: 0.24, ry: -0.62, z: -0.8, demo: "passwords", peek: 1.1 },
    ],
  };
  const macBodyMat = new THREE.ShaderMaterial({
    uniforms: { uGlowW: { value: new THREE.Vector3() }, uGlowStr: { value: 0 }, uLife: { value: LIFE }, uGain: { value: 0 }, uReach: { value: 2.6 } },
    vertexShader: /* glsl */ `
      varying vec3 vWN; varying vec3 vWP;
      void main(){ vec4 wp = modelMatrix * vec4(position, 1.0); vWP = wp.xyz; vWN = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * wp; }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uGlowW; uniform float uGlowStr; uniform vec3 uLife; uniform float uGain; uniform float uReach;
      varying vec3 vWN; varying vec3 vWP;
      void main(){
        // anodised aluminium in the dark: almost nothing of its own; the creature's violet light rakes across it
        vec3 n = normalize(vWN);
        vec3 L = uGlowW - vWP; float d = length(L); L /= d;
        float lam = max(dot(n, L), 0.0);
        float fall = 1.0 / (1.0 + pow(d / uReach, 2.0));
        vec3 V = normalize(cameraPosition - vWP);
        float fres = pow(1.0 - max(dot(n, V), 0.0), 3.0);
        vec3 H = normalize(L + V); float spec = pow(max(dot(n, H), 0.0), 40.0);
        vec3 alu = vec3(0.56, 0.57, 0.63);
        vec3 col = alu*0.022 + alu*uLife*(lam*0.85 + spec*1.6)*fall*uGlowStr + uLife*fres*0.12*fall*uGlowStr + alu*fres*0.025;
        gl_FragColor = vec4(col * uGain, 1.0);
      }`,
  });
  const macScreenMat = new THREE.ShaderMaterial({
    uniforms: { uTex: { value: null as THREE.Texture | null }, uHas: { value: 0 }, uGain: { value: 0 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D uTex; uniform float uHas; uniform float uGain; varying vec2 vUv;
      void main(){
        vec3 off = vec3(0.012, 0.010, 0.026);
        vec3 still = uHas > 0.5 ? texture2D(uTex, vUv).rgb : off;
        // a dimmed screen, a little blue, darker at its edges
        vec2 e = vUv - 0.5; float edge = 1.0 - dot(e, e) * 0.9;
        vec3 col = mix(off, still * vec3(0.30, 0.31, 0.36), uHas) * edge;
        gl_FragColor = vec4(col * uGain, 1.0);
      }`,
  });
  const macBaseGeo = new RoundedBoxGeometry(1.0, 0.035, 0.7, 2, 0.016);
  const macLidGeo = new RoundedBoxGeometry(1.0, 0.65, 0.022, 2, 0.01);
  const macScreenGeo = new THREE.PlaneGeometry(0.94, 0.5875);   // 16:10, as the recordings are
  type Mac = { group: THREE.Group; body: THREE.ShaderMaterial; screen: THREE.ShaderMaterial; slug: Demo["slug"] | null };
  const macs: Mac[] = [0, 1, 2].map(() => {
    const group = new THREE.Group();
    const body = macBodyMat.clone(), screen = macScreenMat.clone();
    const base = new THREE.Mesh(macBaseGeo, body);
    base.position.y = 0.0175;
    const hinge = new THREE.Group();
    hinge.position.set(0, 0.035, -0.34);
    hinge.rotation.x = -0.3;   // open a little past upright
    const lid = new THREE.Mesh(macLidGeo, body);
    lid.position.set(0, 0.325, 0);
    const scr = new THREE.Mesh(macScreenGeo, screen);
    scr.position.set(0, 0.335, 0.0115);
    hinge.add(lid, scr);
    group.add(base, hinge);
    group.visible = false;
    scene.add(group);
    return { group, body, screen, slug: null };
  });
  // picking: each Mac is a way into its recording (raycast against the visible Macs only)
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let hoverMac = -1;
  function macAt(x: number, y: number): number {
    ndc.set((x / vw) * 2 - 1, -(y / vh) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    let best = -1, bestD = Infinity;
    macs.forEach((m, i) => {
      if (!m.group.visible || (m.body.uniforms.uGain.value as number) < 0.5) return;
      const hit = raycaster.intersectObject(m.group, true)[0];
      if (hit && hit.distance < bestD) { bestD = hit.distance; best = i; }
    });
    return best;
  }
  const posters = new Map<string, THREE.Texture>();
  const texLoader = new THREE.TextureLoader();
  function poster(slug: Demo["slug"]) {
    let t = posters.get(slug);
    if (!t) {
      // posters only, and only once the deep is reached: no recording bytes in the first view [04 §9]
      t = texLoader.load(demoFiles(slug).poster, () => macs.forEach((m) => { if (m.slug === slug) m.screen.uniforms.uHas.value = 1; }));
      t.minFilter = THREE.LinearFilter;
      posters.set(slug, t);
    }
    return t;
  }

  // ---------- ribbons (tentacles and oral arms) ----------
  const ribbonMat = (alpha: number) => new THREE.ShaderMaterial({
    uniforms: { uCol: { value: PEARL.clone() }, uGlow: { value: 1 }, uAlpha: { value: alpha } },
    vertexShader: `attribute vec2 aUv; varying vec2 vUv; void main(){ vUv = aUv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `uniform vec3 uCol; uniform float uGlow; uniform float uAlpha; varying vec2 vUv;
      void main(){ float across = 1.0 - pow(abs(vUv.x*2.0 - 1.0), 2.0); float along = pow(1.0 - vUv.y, 0.6);
        gl_FragColor = vec4(uCol * across * along * uAlpha * uGlow, 1.0); }`,
    transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
  });
  function makeRibbon(count: number, segs: number, mat: THREE.ShaderMaterial) {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * segs * 2 * 3);
    const uv = new Float32Array(count * segs * 2 * 2);
    const idx: number[] = [];
    for (let r = 0; r < count; r++) {
      for (let s = 0; s < segs; s++) {
        const v = (r * segs + s) * 2;
        uv.set([0, s / (segs - 1), 1, s / (segs - 1)], v * 2);
        if (s < segs - 1) idx.push(v, v + 1, v + 2, v + 1, v + 3, v + 2);
      }
    }
    geo.setIndex(idx);
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
    geo.setAttribute("aUv", new THREE.BufferAttribute(uv, 2));
    const mesh = new THREE.Mesh(geo, mat);
    mesh.frustumCulled = false;
    return { mesh, pos };
  }
  // write a camera-facing strip from a centreline (world points), width per point
  function writeStrip(dst: Float32Array, base: number, pts: Float32Array, pBase: number, n: number, width: (s: number) => number) {
    for (let s = 0; s < n; s++) {
      const k = pBase + s * 3;
      const kn = pBase + Math.min(n - 1, s + 1) * 3, kp = pBase + Math.max(0, s - 1) * 3;
      let tx = pts[kn] - pts[kp], ty = pts[kn + 1] - pts[kp + 1];
      const l = Math.hypot(tx, ty) || 1;
      tx /= l; ty /= l;
      const w = width(s / (n - 1)) * 0.5;
      const o = base + s * 6;
      dst[o] = pts[k] - ty * w; dst[o + 1] = pts[k + 1] + tx * w; dst[o + 2] = pts[k + 2];
      dst[o + 3] = pts[k] + ty * w; dst[o + 4] = pts[k + 1] - tx * w; dst[o + 5] = pts[k + 2];
    }
  }

  const TENT_LEN = 2.3;       // longest tentacle, in bell radii
  const ANIMAL_H = 3.0;       // crown to the longest tips, in bell radii: what `span` sizes
  const T = cfg.tentacles, S = cfg.segs;
  const isLong = (t: number) => t % 5 === 2;
  const rnd = (i: number, k: number) => ((Math.sin(i * k) * 43758.5453) % 1 + 1) % 1;
  // a fine short fringe, and every fifth a long tendril
  const tLen = Array.from({ length: T }, (_, i) => (isLong(i) ? 0.74 + rnd(i, 12.9898) * 0.3 : 0.22 + rnd(i, 12.9898) * 0.3));
  const tPhase = Array.from({ length: T }, (_, i) => i * 1.7 + rnd(i, 78.233) * 3);
  const tCurl = Array.from({ length: T }, (_, i) => rnd(i, 4.1414) * 1.6 - 0.3);
  const tentPos = new Float32Array(T * S * 3), tentPrev = new Float32Array(T * S * 3);
  const tentSmooth = new Float32Array(S * 3), tentTmp = new Float32Array(S * 3);
  const tentMat = ribbonMat(0.8);
  const tentRibbon = makeRibbon(T, S, tentMat);
  scene.add(tentRibbon.mesh);
  const ARMS = 4, ARM_S = 22;
  const armMat = ribbonMat(0.42);
  const armPts = new Float32Array(ARMS * ARM_S * 3);
  const armRibbon = makeRibbon(ARMS, ARM_S, armMat);
  scene.add(armRibbon.mesh);
  tentRibbon.mesh.visible = armRibbon.mesh.visible = false;

  // ---------- marine snow: a few slow motes, for depth. Never over the type or the dock. ----------
  const snowU = { uTime: { value: 0 }, uPx: { value: cfg.dpr }, uGain: { value: 1 }, uKeep: { value: new THREE.Vector4(0, 0, 0, 0) }, uDescent: { value: 0 } };
  const snow = new THREE.Points(new THREE.BufferGeometry(), new THREE.ShaderMaterial({
    uniforms: snowU,
    vertexShader: `uniform float uTime; uniform float uPx; uniform float uGain; uniform float uDescent;
      attribute float aSeed; varying float vA;
      void main(){ vec3 p = position;
        // marine snow sinks slowly; as the camera descends it streams up past it (nearer motes faster: parallax)
        p.y = 4.5 - mod(4.5 - p.y + uTime*(0.035 + aSeed*0.05) - uDescent*(0.7 + aSeed*0.6), 9.0);
        p.x += sin(uTime*0.2 + aSeed*20.0) * 0.1;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        float blur = abs(-mv.z - 7.0) * 0.5;                       // out of the focal plane: larger and fainter
        gl_PointSize = (1.4 + aSeed*1.6 + blur*2.2) * uPx * (7.0 / -mv.z);
        vA = uGain * (0.10 + aSeed*0.16) / (1.0 + blur*blur*1.6);
        gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `varying float vA; uniform vec4 uKeep;
      void main(){ float d = length(gl_PointCoord - 0.5);
        vec2 q = max(uKeep.xy - gl_FragCoord.xy, gl_FragCoord.xy - uKeep.zw);
        float clear = smoothstep(0.0, 60.0, max(q.x, q.y));           // fades out before the copy
        gl_FragColor = vec4(vec3(0.78, 0.82, 1.0) * smoothstep(0.5, 0.1, d) * vA * clear, 1.0); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  snow.frustumCulled = false;
  {
    const N = cfg.snow, pos = new Float32Array(N * 3), seed = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 9;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 7 - 1;
      seed[i] = Math.random();
    }
    snow.geometry.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    snow.geometry.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
  }
  scene.add(snow);

  // ---------- layout: the creature is placed from a DOM element's rect (cached; never read per frame) ----------
  let vw = 1, vh = 1, worldPerPx = 1;
  // The creature's path: one composed stop per rest (Surface, Mid-water, The deep), measured from a DOM region.
  // The conductor's chapter value picks a point between two stops (scroll-worlds: author endpoints, interpolate).
  let anchor: { el: Element; stops: AnchorOptions[] } | null = null;
  let keepOut: Element[] = [];
  const place = { ok: false };
  let stops: { x: number; y: number; s: number }[] = [];
  function measure() {
    if (anchor) {
      const r = anchor.el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) {
        stops = anchor.stops.map((o) => {
          const rPx = Math.min((r.height * o.span) / ANIMAL_H, r.width * (o.maxW ?? 0.5) * 0.5);
          const cx = r.left + r.width * o.x;
          const rimY = r.top + r.height * o.top + rPx * 0.62;   // the crown stands about 0.6 radii above the rim once tipped
          return { x: (cx - vw / 2) * worldPerPx, y: (vh / 2 - rimY) * worldPerPx, s: rPx * worldPerPx };
        });
        place.ok = stops.length > 0;
      }
    }
    // one rect around the copy and the dock, in gl pixels, for the particles to stay out of
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const el of keepOut) {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      x0 = Math.min(x0, r.left); x1 = Math.max(x1, r.right); y0 = Math.min(y0, r.top); y1 = Math.max(y1, r.bottom);
    }
    if (x1 > x0) snowU.uKeep.value.set(x0 * dpr, (vh - y1) * dpr, x1 * dpr, (vh - y0) * dpr);
    else snowU.uKeep.value.set(-1e5, -1e5, -1e5, -1e5);
  }
  let dpr = cfg.dpr;
  function resize() {
    vw = innerWidth; vh = innerHeight;
    renderer.setPixelRatio(dpr);
    renderer.setSize(vw, vh, false);
    camera.aspect = vw / vh;
    camera.updateProjectionMatrix();
    worldPerPx = (2 * CAM_Z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) / vh;
    waterU.uRes.value.set(vw * dpr, vh * dpr);
    waterU.uCueShade.value = 0;   // the worded cue is gone; kept as a hook
    snowU.uPx.value = dpr;
    measure();
    still();
  }
  const ro = new ResizeObserver(() => { measure(); still(); });
  addEventListener("resize", resize, { passive: true });

  // ---------- state ----------
  let state: CreatureState = "idle";
  let pulseT0 = performance.now();
  const live = { x: 0, y: 0, s: 1, glow: 1, depth: 0, placed: false, d: 0, speed: 0, vx: 0, lift: 0 };
  let depthTarget = 0;
  // the conductor: a function returning the smoothed chapter value (0 Surface, 1 Mid-water, 2 The deep)
  let conductor: (() => number) | null = null;
  let depthOverride: number | null = null;   // the theatre holds the water at the deep
  const depthOfD = (d: number) => (d <= 2 ? d * 0.5 : 1);
  // fold back to a polyp, hold, bloom again: the idea, felt not named (01-PLAN §2 beat 6)
  // fold: tweened between 0 (medusa) and 1 (a closed bud), so a sequence can hold it folded as long as it needs
  const foldS = { from: 0, to: 0, t0: 0, dur: 1 };
  let foldTimer = 0;
  function foldTo(v: number, ms: number) {
    const now = performance.now();
    foldS.from = foldValue(now); foldS.to = v; foldS.t0 = now; foldS.dur = Math.max(1, ms);
  }
  function foldValue(now: number) {
    if (reduceMQ.matches) return 0;
    const u = Math.min(1, (now - foldS.t0) / foldS.dur);
    return foldS.from + (foldS.to - foldS.from) * easeInOut(u);
  }
  let creatureHover = false;
  const intro = { t0: performance.now(), dur: 1600, done: reduceMQ.matches };
  const t0 = performance.now();

  function pulseValue(now: number) {
    if (reduceMQ.matches) return 0;
    // swimming: the faster the dive, the quicker the strokes (travel comes from the bell, not from sliding)
    const period = STATES[state].period / (1 + Math.min(2.8, live.speed * 4));
    const k = Math.min(1, period / 2400);
    let t = now - pulseT0;
    if (t > period) { pulseT0 = now; t = 0; }
    if (t < 420 * k) return easeOut(t / (420 * k));
    if (t < 2100 * k) return 1 - easeInOut((t - 420 * k) / (1680 * k));
    return 0;
  }

  const rim = new THREE.Vector3();
  function rimPoint(i: number, pulse: number, out: THREE.Vector3) {
    const a = (i / T) * Math.PI * 2;
    const r = 0.975 * (1 - pulse * PULSE_IN);
    out.set(Math.cos(a) * r, 0, Math.sin(a) * r);
    return creature.localToWorld(out);
  }
  function seedTentacles() {
    creature.updateMatrixWorld();
    for (let t = 0; t < T; t++) {
      const seg = (TENT_LEN / S) * live.s * tLen[t];
      rimPoint(t, 0, rim);
      for (let s = 0; s < S; s++) {
        const k = (t * S + s) * 3;
        tentPos[k] = tentPrev[k] = rim.x;
        tentPos[k + 1] = tentPrev[k + 1] = rim.y - s * seg;
        tentPos[k + 2] = tentPrev[k + 2] = rim.z;
      }
    }
  }

  // ---------- one step: everything is driven from here (one loop) ----------
  function step(now: number, dt: number) {
    const reduce = reduceMQ.matches;
    const motion = reduce ? 0 : 1;
    const time = reduce ? 20 : (now - t0) / 1000;   // reduced motion: one still, well-composed moment

    // the chapter value comes from the conductor (already smoothed by the scroll scrub); depth follows it
    const dNow = conductor ? conductor() : depthTarget * 2;
    if (dt > 0) {
      const v = Math.abs(dNow - live.d) / dt;
      live.speed += (v - live.speed) * (1 - Math.exp(-dt / 0.25));
    }
    live.d = dNow;
    const depthWanted = depthOverride ?? depthOfD(dNow);
    live.depth += (depthWanted - live.depth) * (reduce ? 1 : 1 - Math.exp(-dt / (depthOverride !== null ? 0.45 : 0.08)));
    const depth = live.depth;
    snowU.uDescent.value = dNow * 3;
    const surf = 1 - smooth(0, 0.9, depth), self = smooth(0.45, 1, depth);
    let light = 1;
    if (!intro.done) {
      const u = Math.min(1, (now - intro.t0) / intro.dur);
      light = 0.2 + 0.8 * easeOut(u);
      if (u >= 1) intro.done = true;
    }
    live.glow += (STATES[state].glow - live.glow) * (reduce ? 1 : 1 - Math.exp(-dt / 0.5));
    const p = pulseValue(now);
    // in the deep the creature is the light: each stroke of the bell brightens it and the water around it
    const shine = 1 + self * (0.35 + 0.5 * p);
    live.lift = (live.lift ?? 0) + ((creatureHover ? 1 : 0) - (live.lift ?? 0)) * (1 - Math.exp(-dt / 0.15));
    const glow = live.glow * light * (1 + 0.22 * live.lift);

    waterU.uTime.value = time;
    waterU.uDepth.value = depth;
    waterU.uLight.value = light;
    waterU.uGlow.value = glow * shine;
    snowU.uTime.value = time;
    snowU.uGain.value = light * (0.55 + 0.45 * surf);
    tissueU.uTime.value = time;
    tissueU.uSurf.value = 0.12 + 0.88 * surf;
    tissueU.uSelf.value = self;
    tissueU.uGlow.value = glow * (1 + self * 0.35 * p);
    tentMat.uniforms.uCol.value.copy(PEARL).lerp(LIFE, self * 0.85);
    tentMat.uniforms.uGlow.value = glow * (0.5 + 0.5 * Math.max(surf, self));
    armMat.uniforms.uCol.value.copy(tentMat.uniforms.uCol.value);
    armMat.uniforms.uGlow.value = tentMat.uniforms.uGlow.value;

    // The deep lives below: as the dive goes on, its kin and Macs rise into the frame from the bottom (camera
    // descending), so at Mid-water the nearest ones are already peeking up at the bottom edge [USER, round 3].
    // Things on the left rise from further down: at Mid-water the text and the form are on the left.
    const rise = 1 - smooth(0.32, 1, depth);       // 1 = all the way below, 0 = in place
    const wideLayout = vw >= 1024;
    const kinGain = smooth(0.3, 0.8, depth) * 0.6 * light;
    kinU.uGain.value = kinGain;
    for (let i = 0; i < kin.length; i++) {
      const [fx, fy, fr, ph] = KIN[i];
      const m = kin[i];
      m.visible = kinGain > 0.001;
      if (!m.visible) continue;
      const late = wideLayout && fx > 0.5 ? 1 : smooth(0.8, 1, depth);
      (m.material as THREE.ShaderMaterial).uniforms.uGain.value = kinGain * late * (0.6 + 0.4 * (0.5 + 0.5 * Math.sin(time * 0.45 + ph * 1.3)));
      const r = fr * vh * worldPerPx;
      m.scale.setScalar(r);
      m.position.set(
        (fx * vw - vw / 2) * worldPerPx + motion * Math.sin(time * 0.07 + ph) * r * 0.6,
        (vh / 2 - (fy + rise * (wideLayout && fx > 0.5 ? 0.62 : 1.1)) * vh) * worldPerPx + motion * Math.sin(time * 0.11 + ph * 2.0) * r * 0.5,
        0,
      );
      m.updateMatrixWorld();
      // threads: from the margin, hanging and swaying a little, about three bell radii long
      for (let t = 0; t < KIN_T; t++) {
        const ang = (t / KIN_T) * Math.PI * 2 + ph;
        kinRim.set(Math.cos(ang) * 0.8, 0.02, Math.sin(ang) * 0.8);
        m.localToWorld(kinRim);
        let px = kinRim.x, py = kinRim.y;
        const len = r * (1.4 + ((t * 7 + i * 3) % 5) * 0.55) * late / (KIN_S - 1);   // threads appear with their bell
        const lean = Math.sin(ph * 3.1 + t * 2.3) * 0.5;   // each thread drifts its own way, so they curve apart
        for (let s2 = 1; s2 < KIN_S; s2++) {
          const k = ((i * KIN_T + t) * (KIN_S - 1) + (s2 - 1)) * 6;
          const nx = px + (lean + motion * Math.sin(time * 0.5 + ph + t + s2 * 0.6) * 0.4) * len * s2 / KIN_S;
          const ny = py - len;
          kinLinePos[k] = px; kinLinePos[k + 1] = py; kinLinePos[k + 2] = 0;
          kinLinePos[k + 3] = nx; kinLinePos[k + 4] = ny; kinLinePos[k + 5] = 0;
          px = nx; py = ny;
        }
      }
    }
    kinLines.visible = kinGain > 0.001;
    kinLineMat.opacity = kinGain * 0.6;
    if (kinLines.visible) kinLineGeo.attributes.position.needsUpdate = true;

    const macGain = smooth(0.3, 0.8, depth) * light;
    // short narrow screens (landscape phones, 200% zoom): no room above the text, so the Macs stay out of frame
    const layout = vw >= 1024 ? MAC_LAYOUT.wide : vh < 640 ? [] : MAC_LAYOUT.narrow;
    for (let i = 0; i < macs.length; i++) {
      const m = macs[i], L = layout[i];
      m.group.visible = !!L && macGain > 0.001;
      if (!m.group.visible) continue;
      if (m.slug !== L.demo) { m.slug = L.demo; m.screen.uniforms.uTex.value = poster(L.demo); m.screen.uniforms.uHas.value = posters.get(L.demo)?.image ? 1 : 0; }
      const zs = (CAM_Z - L.z) / CAM_Z;              // a plane further back spans more world per pixel
      const wpp = worldPerPx * zs;
      const w = L.w * vw * wpp;
      m.group.scale.setScalar(w);
      m.group.position.set((L.fx * vw - vw / 2) * wpp, (vh / 2 - (L.fy + rise * L.peek) * vh) * wpp - w * 0.3 + motion * Math.sin(time * 0.09 + i * 2.1) * w * 0.02, L.z);
      m.group.rotation.set(0.16, L.ry + motion * Math.sin(time * 0.05 + i) * 0.03, 0.02 * (i - 1));
      const fog = Math.exp(Math.min(0, L.z) * 0.22);  // further away, deeper in the water
      // the ones that rise from further down (behind the form's side) only show near their place, never passing it
      const late = L.peek > 1 ? smooth(0.8, 1, depth) : 1;
      m.body.uniforms.uGain.value = macGain * fog * late;
      m.screen.uniforms.uGain.value = macGain * fog * late * (i === hoverMac ? 2.2 : 1);   // hover: its screen wakes
      m.body.uniforms.uGlowW.value.copy(creature.position);
      m.body.uniforms.uGlowStr.value = shine * live.glow * (0.6 + 0.4 * p * self);
      m.body.uniforms.uReach.value = 2.2 + live.s * 1.5;
    }

    if (!place.ok) return;
    // where it should be on its path: between two composed stops; mid-travel it swims down ahead of the camera
    const n = stops.length, dc = Math.min(n - 1, Math.max(0, live.d));
    const i0 = Math.max(0, Math.min(n - 2, Math.floor(dc))), i1 = Math.min(n - 1, i0 + 1);
    const tt = n > 1 ? dc - i0 : 0;
    const A = stops[i0], B = stops[i1];
    const tx = A.x + (B.x - A.x) * tt, ts = A.s + (B.s - A.s) * tt;
    const ty = A.y + (B.y - A.y) * tt - motion * Math.sin(Math.PI * tt) * vh * 0.09 * worldPerPx;
    const lx = live.x;
    if (!live.placed) { live.x = tx; live.y = ty; live.s = ts; }
    else {
      const k = reduce ? 1 : 1 - Math.exp(-dt / 0.14);
      live.x += (tx - live.x) * k; live.y += (ty - live.y) * k; live.s += (ts - live.s) * k;
    }
    if (dt > 0) live.vx += ((live.x - lx) / dt - live.vx) * (1 - Math.exp(-dt / 0.3));
    const fold = foldValue(now);
    bellU.uPulse.value = p;
    // its place: a slow drift, tipped toward the viewer so the dome and the inner mark read; each stroke lifts it
    creature.position.set(
      live.x + motion * Math.sin(time * 0.19) * 0.06 * live.s,
      live.y + motion * (Math.sin(time * 0.31) * 0.05 + p * 0.07) * live.s,
      0,
    );
    // a polyp is a small, closed bud: the bell draws in and down, the tentacles shorten
    creature.scale.set(live.s * (1 - 0.55 * fold), live.s * (1 - 0.3 * fold), live.s * (1 - 0.55 * fold));
    // it banks a little into its sideways travel
    const bank = Math.max(-0.35, Math.min(0.35, -live.vx / Math.max(0.001, live.s) * 0.06));
    creature.rotation.set(0.44 + motion * 0.05 * Math.sin(time * 0.17), 0.25 + motion * 0.35 * Math.sin(time * 0.11), 0.1 + bank + motion * 0.05 * Math.sin(time * 0.23));
    creature.updateMatrixWorld();
    waterU.uGlowPos.value.set((creature.position.x / worldPerPx + vw / 2) * dpr, (creature.position.y / worldPerPx + vh / 2) * dpr);
    if (!live.placed) {
      seedTentacles();
      live.placed = true;
      creature.visible = tentRibbon.mesh.visible = armRibbon.mesh.visible = true;
    }

    // tentacles: verlet chains hanging from the margin, with weight and follow-through
    const cs = live.s;
    const damp = 0.968, grav = -0.0009 * cs;
    for (let t = 0; t < T; t++) {
      rimPoint(t, p, rim);
      const b = t * S * 3;
      const seg = (TENT_LEN / S) * cs * tLen[t] * (1 - 0.8 * fold);
      tentPos[b] = rim.x; tentPos[b + 1] = rim.y; tentPos[b + 2] = rim.z;
      for (let s = 1; s < S; s++) {
        const kk = b + s * 3, u = s / S;
        const vx = (tentPos[kk] - tentPrev[kk]) * damp, vy = (tentPos[kk + 1] - tentPrev[kk + 1]) * damp, vz = (tentPos[kk + 2] - tentPrev[kk + 2]) * damp;
        tentPrev[kk] = tentPos[kk]; tentPrev[kk + 1] = tentPos[kk + 1]; tentPrev[kk + 2] = tentPos[kk + 2];
        const fx = (Math.sin(time * 0.9 + tPhase[t] + s * 0.22) * 0.00045 + Math.sin(s * 0.18 + time * 0.35 + tPhase[t]) * tCurl[t] * u * u * 0.0002
          + Math.sin(u * Math.PI * 2 + time * 0.5 + tPhase[t]) * 0.0007 * u) * cs;
        const fz = Math.cos(time * 0.7 + t) * 0.00028 * cs;
        tentPos[kk] += vx + fx; tentPos[kk + 1] += vy + grav; tentPos[kk + 2] += vz + fz;
      }
      for (let it = 0; it < 3; it++) {
        for (let s = 1; s < S; s++) {
          const a = b + (s - 1) * 3, c = b + s * 3;
          const dx = tentPos[c] - tentPos[a], dy = tentPos[c + 1] - tentPos[a + 1], dz = tentPos[c + 2] - tentPos[a + 2];
          const d = Math.hypot(dx, dy, dz) || 1e-6, diff = (d - seg) / d;
          if (s === 1) { tentPos[c] -= dx * diff; tentPos[c + 1] -= dy * diff; tentPos[c + 2] -= dz * diff; }
          else {
            const h = diff * 0.5;
            tentPos[a] += dx * h; tentPos[a + 1] += dy * h; tentPos[a + 2] += dz * h;
            tentPos[c] -= dx * h; tentPos[c + 1] -= dy * h; tentPos[c + 2] -= dz * h;
          }
        }
      }
      // draw a smoothed copy (two Laplacian passes): the chain keeps its physics, the ribbon loses its kinks
      for (let s = 0; s < S * 3; s++) tentSmooth[s] = tentPos[b + s];
      for (let pass = 0; pass < 2; pass++) {
        for (let s = 1; s < S - 1; s++) {
          for (let c = 0; c < 3; c++) {
            const k = s * 3 + c;
            tentTmp[k] = 0.25 * tentSmooth[k - 3] + 0.5 * tentSmooth[k] + 0.25 * tentSmooth[k + 3];
          }
        }
        for (let s = 3; s < (S - 1) * 3; s++) tentSmooth[s] = tentTmp[s];
      }
      const thick = (isLong(t) ? 0.02 : 0.008) * cs;
      writeStrip(tentRibbon.pos, t * S * 6, tentSmooth, 0, S, (u) => thick * Math.pow(1 - u, 0.8) + 0.0025 * cs);
    }
    tentRibbon.mesh.geometry.attributes.position.needsUpdate = true;

    // oral arms: ruffled curtains under the bell, analytic sway
    for (let a = 0; a < ARMS; a++) {
      const ang = (a / ARMS) * Math.PI * 2 + Math.PI / 4;
      for (let s = 0; s < ARM_S; s++) {
        const u = s / (ARM_S - 1);
        rim.set(
          Math.cos(ang) * 0.07 * (1 + u * 0.6) + Math.sin(time * 0.7 + a + u * 4) * 0.06 * u,
          0.12 - u * 1.15,
          Math.sin(ang) * 0.07 * (1 + u * 0.6) + Math.cos(time * 0.55 + a + u * 3) * 0.06 * u,
        );
        creature.localToWorld(rim);
        const k3 = (a * ARM_S + s) * 3;
        armPts[k3] = rim.x; armPts[k3 + 1] = rim.y; armPts[k3 + 2] = rim.z;
      }
      writeStrip(armRibbon.pos, a * ARM_S * 6, armPts, a * ARM_S * 3, ARM_S,
        (u) => cs * (0.055 + 0.025 * Math.sin(u * 30 - time * 2)) * (1 - u * 0.6) * Math.min(1, u / 0.1));
    }
    armRibbon.mesh.geometry.attributes.position.needsUpdate = true;
  }

  function render() {
    renderer.clear();
    renderer.render(bgScene, bgCam);
    renderer.clearDepth();
    renderer.render(scene, camera);
  }

  // Reduced motion: no loop. One still frame, redrawn only when something changes. The tentacles are settled first
  // (the simulation runs unseen) so the still is a hanging animal, not straight threads.
  let settled = false;
  function settle() {
    if (settled || !place.ok) return;
    const now = performance.now();
    for (let i = 0; i < 240; i++) step(now, 1 / 60);
    settled = true;
  }
  function still() {
    if (!reduceMQ.matches) return;
    settle();
    step(performance.now(), 1 / 60);
    render();
  }

  // ---------- loop; one resolution drop if this device cannot hold the frame rate ----------
  // One loop [JURY 07, 14]: the scene runs on GSAP's ticker, after GSAP has applied the scroll scrub, so the canvas
  // and the DOM read the same smoothed value in the same frame.
  let ticking = false, last = performance.now();
  const tick = () => loop(performance.now());
  const stopTick = () => { if (ticking) { gsap.ticker.remove(tick); ticking = false; } };
  const frameTimes: number[] = [];
  function loop(now: number) {
    const dtMs = now - last;
    last = now;
    settle();   // the first visible frame is a hanging animal, not straight threads
    step(now, Math.min(0.05, dtMs / 1000));
    render();
    if (dpr > 1 && !document.hidden && dtMs < 200) {
      frameTimes.push(dtMs);
      if (frameTimes.length >= 120) {
        const sorted = [...frameTimes].sort((a, b) => a - b);
        frameTimes.length = 0;
        if (sorted[60] > 24) { dpr = 1; resize(); }
      }
    }
  }
  const start = () => {
    stopTick();
    if (reduceMQ.matches) { still(); return; }
    if (!document.hidden) { last = performance.now(); gsap.ticker.add(tick); ticking = true; }
  };
  document.addEventListener("visibilitychange", start);
  reduceMQ.addEventListener("change", start);
  canvas.addEventListener("webglcontextlost", (e) => { e.preventDefault(); stopTick(); onLost(); });
  resize();
  renderer.compile(scene, camera);
  start();

  (window as Window & { __dive?: unknown }).__dive = {
    /** set the depth directly (0 surface, 0.5 mid-water, 1 the deep) */
    depth(v: number) { depthOverride = Math.min(1, Math.max(0, v)); still(); },
    release() { depthOverride = null; still(); },
    /** brightest relative luminance the scene draws inside a CSS-pixel rect (for measured text contrast) */
    probe(x: number, y: number, w: number, h: number) {
      step(performance.now(), 1 / 60); render();
      const X = Math.max(0, Math.floor(x * dpr)), Y = Math.max(0, Math.floor((vh - y - h) * dpr));
      const W = Math.max(1, Math.min(Math.floor(w * dpr), gl.drawingBufferWidth - X)), Hh = Math.max(1, Math.min(Math.floor(h * dpr), gl.drawingBufferHeight - Y));
      const buf = new Uint8Array(W * Hh * 4);
      gl.readPixels(X, Y, W, Hh, gl.RGBA, gl.UNSIGNED_BYTE, buf);
      const lin = (c: number) => { const v = c / 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
      let max = 0;
      for (let i = 0; i < buf.length; i += 4) max = Math.max(max, 0.2126 * lin(buf[i]) + 0.7152 * lin(buf[i + 1]) + 0.0722 * lin(buf[i + 2]));
      return max;
    },
    bench(n = 200) {
      const ts: number[] = [];
      let now = performance.now();
      for (let i = 0; i < n; i++) {
        const t = performance.now(); now += 16.67;
        step(now, 1 / 60); render(); gl.finish();
        ts.push(performance.now() - t);
      }
      ts.sort((a, b) => a - b);
      return { tier, dpr, calls: renderer.info.render.calls, avgMs: +(ts.reduce((a, b) => a + b, 0) / n).toFixed(2), p95Ms: +ts[Math.floor(n * 0.95)].toFixed(2) };
    },
  };

  function setPath(el: Element, list: AnchorOptions[]) {
    if (anchor) ro.unobserve(anchor.el);
    anchor = { el, stops: list };
    ro.observe(el);
    measure();
    still();
  }

  return {
    tier,
    setState(s) {
      state = s;
      if (s !== "idle" && !reduceMQ.matches) pulseT0 = performance.now();   // one stroke: it answers
      if (s === "startle") setTimeout(() => { if (state === "startle") state = "idle"; }, 900);
      still();
    },
    setAnchor(el, opts) { setPath(el, [opts]); },
    setPath,
    setKeepOut(els) {
      keepOut.forEach((el) => ro.unobserve(el));
      keepOut = els;
      els.forEach((el) => ro.observe(el));
      measure();
    },
    setDepth(d) {
      if (conductor) depthOverride = d === null ? null : Math.min(1, Math.max(0, d));
      else if (d !== null) depthTarget = Math.min(1, Math.max(0, d));
      still();
    },
    setConductor(fn) { conductor = fn; still(); },
    pick(x, y) { const i = macAt(x, y); return i >= 0 ? macs[i].slug : null; },
    hover(x, y) { const i = x < 0 ? -1 : macAt(x, y); if (i !== hoverMac) { hoverMac = i; still(); } return i >= 0; },
    cycle() {
      if (reduceMQ.matches) return;
      clearTimeout(foldTimer);
      foldTo(1, 1400);
      foldTimer = window.setTimeout(() => foldTo(0, 1400), 2000);
    },
    fold(v, ms) { clearTimeout(foldTimer); foldTo(v, reduceMQ.matches ? 0 : ms); },
    /** is a screen point (CSS px) on the creature? the bell and the top of its tentacles, an ellipse around them */
    creatureAt(x, y) {
      if (!place.ok || !live.placed) return false;
      const cx = creature.position.x / worldPerPx + vw / 2, cy = vh / 2 - creature.position.y / worldPerPx;
      const r = Math.max(28, live.s / worldPerPx);
      const dx = (x - cx) / (r * 1.25), dy = (y - (cy + r * 0.55)) / (r * 1.7);
      return dx * dx + dy * dy <= 1;
    },
    hoverCreature(on) { if (on !== creatureHover) { creatureHover = on; still(); } },
    skipIntro() { intro.done = true; },
    ripple(x, y, strength) {
      if (reduceMQ.matches) return;
      waterU.uRipples.value[rippleIdx++ % 4].set(x * dpr, (vh - y) * dpr, waterU.uTime.value, strength);
    },
    destroy() {
      stopTick();
      ro.disconnect();
      removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", start);
      renderer.dispose();
    },
  };
}
