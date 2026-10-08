import * as THREE from 'three';

export function initWebGL() {
  const container = document.getElementById('webgl-container');
  if (!container) return;

  const canvas = document.createElement('canvas');
  container.appendChild(canvas);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
  } catch {
    return null;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const fragmentShader = /* glsl */ `
    precision highp float;
    uniform float uTime;
    uniform vec2 uResolution;
    uniform vec2 uPointer;
    uniform float uHill;
    
    // Portfolio color scheme
    uniform vec3 uBg;
    uniform vec3 uLine;
    uniform vec3 uMajor;
    uniform vec3 uAccent;
    uniform float uLineAlpha;
    uniform float uMajorAlpha;
    
    varying vec2 vUv;

    // 2D simplex noise (Ashima Arts, MIT)
    vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
      vec2 i = floor(v + dot(v, C.yy));
      vec2 x0 = v - i + dot(i, C.xx);
      vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod(i, 289.0);
      vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
      vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
      m = m * m;
      m = m * m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
      vec3 g;
      g.x = a0.x * x0.x + h.x * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    float height(vec2 p, float t) {
      vec2 q = vec2(snoise(p * 0.9 + vec2(0.0, t)), snoise(p * 0.9 + vec2(4.1, -t)));
      float h = snoise(p * 0.7 + q * 0.6) * 0.65 + snoise(p * 1.6 - q * 0.3 + t) * 0.25;
      return h;
    }

    float iso(float h, float density, float width) {
      float v = h * density;
      float d = abs(fract(v - 0.5) - 0.5) / max(fwidth(v), 1e-4);
      return 1.0 - smoothstep(width - 0.5, width + 0.5, d);
    }

    void main() {
      float aspect = uResolution.x / uResolution.y;
      vec2 p = (vUv - 0.5) * vec2(aspect, 1.0) * 2.2;
      float t = uTime * 0.025; // slightly slower for premium feel
      float h = height(p, t);

      vec2 m = (uPointer - 0.5) * vec2(aspect, 1.0) * 2.2;
      float hill = exp(-dot(p - m, p - m) * 2.4) * uHill;
      h += hill * 0.9;

      float minor = iso(h, 9.0, 0.6);
      float major = iso(h, 9.0 / 5.0, 0.9);
      float peak = iso(h, 9.0, 0.8) * smoothstep(0.35, 0.8, hill);

      vec3 col = uBg;
      col = mix(col, uLine, minor * uLineAlpha);
      col = mix(col, uMajor, major * uMajorAlpha);
      col = mix(col, uAccent, peak * 0.9);

      // Fade toward the edges so the section blends with the page
      float edge = smoothstep(0.0, 0.2, vUv.y) * smoothstep(1.0, 0.8, vUv.y);
      col = mix(uBg, col, edge);
      gl_FragColor = vec4(col, 1.0);
    }
  `;

  const uniforms = {
    uTime: { value: 12 },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uPointer: { value: new THREE.Vector2(0.5, 0.5) },
    uHill: { value: 0 },
    // Portfolio specific colors:
    // Background: #050507, Lines: #3a7bd5 (muted), Accent: #00d2ff
    uBg: { value: new THREE.Color('#050507') },
    uLine: { value: new THREE.Color('#1c3b57') },
    uMajor: { value: new THREE.Color('#3a7bd5') },
    uAccent: { value: new THREE.Color('#00d2ff') },
    uLineAlpha: { value: 0.3 },
    uMajorAlpha: { value: 0.6 },
  };

  scene.add(
    new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.ShaderMaterial({
        uniforms,
        vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
        fragmentShader,
      })
    )
  );

  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  // Convert HEX to LinearSRGB properly
  uniforms.uBg.value.setStyle('#050507', THREE.LinearSRGBColorSpace);
  uniforms.uLine.value.setStyle('#1c3b57', THREE.LinearSRGBColorSpace);
  uniforms.uMajor.value.setStyle('#3a7bd5', THREE.LinearSRGBColorSpace);
  uniforms.uAccent.value.setStyle('#00d2ff', THREE.LinearSRGBColorSpace);

  const target = new THREE.Vector2(0.5, 0.5);
  let hillTarget = 0;
  let running = true;
  let rafId = 0;
  let last = performance.now();

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    uniforms.uResolution.value.set(w, h);
  }

  function frame() {
    const now = performance.now();
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    uniforms.uTime.value += dt;
    uniforms.uPointer.value.lerp(target, 0.06);
    uniforms.uHill.value += (hillTarget - uniforms.uHill.value) * 0.05;
    renderer.render(scene, camera);
  }

  let skip = false;
  function loop() {
    if (!running) return;
    skip = !skip;
    if (!skip) frame();
    rafId = requestAnimationFrame(loop);
  }

  window.addEventListener('resize', () => {
    resize();
    frame();
  });

  window.addEventListener('mousemove', (e) => {
    target.set(e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight);
    hillTarget = 1;
  });

  window.addEventListener('mouseleave', () => {
    hillTarget = 0;
  });

  resize();
  last = performance.now();
  loop();
}
