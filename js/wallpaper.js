// 움직이는 일러스트(가짜 Live2D): 한 장짜리 그림을 격자로 나눠 베일과 드레스 자락을 나부끼게 하고, 눈 감은 그림이 있으면 깜빡임을 준다.
import * as THREE from '../vendor/three.module.js';

// 그림 안에서의 위치 (0~1, 왼쪽 아래 기준). 다른 그림으로 바꾸면 이 값만 다시 맞추면 된다.
const RIG = {
  neck: [0.565, 0.753],                       // 고개가 도는 중심
  eyes: [[0.466, 0.825], [0.550, 0.847]],     // 눈 중심 (왼쪽, 오른쪽)
  eyeSize: [0.042, 0.021],                    // 눈 반지름 (가로, 세로)
  bouquet: [0.17, 0.52],                      // 부케 중심
};

const VERT = /* glsl */`
uniform float uTime; uniform vec2 uPointer; uniform vec2 uNeck; uniform vec2 uBouquet; uniform float uAspect; uniform float uMotion;
varying vec2 vUv;
void main() {
  vUv = uv;
  vec2 p = uv;                                  // 그림 좌표에서 변형한 뒤 화면 크기로 옮김
  float t = uTime;
  // 몸·얼굴·부케는 그대로 두고, 바람을 받는 천(베일과 드레스 자락)만 나부끼게 한다.
  // 오른쪽으로 날리는 베일: 몸에서 멀수록 크게
  float veilR = smoothstep(0.64, 0.92, uv.x) * smoothstep(0.50, 0.60, uv.y) * (1.0 - smoothstep(0.80, 0.90, uv.y));
  p.x += sin(t * 1.1 + uv.y * 9.0) * 0.008 * veilR * uMotion;
  p.y += cos(t * 0.85 + uv.x * 7.0) * 0.005 * veilR * uMotion;
  // 왼쪽 어깨 뒤로 내려온 베일: 살짝만
  float veilL = (1.0 - smoothstep(0.26, 0.38, uv.x)) * smoothstep(0.60, 0.68, uv.y) * (1.0 - smoothstep(0.84, 0.90, uv.y));
  p.x += sin(t * 0.95 + uv.y * 8.0 + 1.3) * 0.004 * veilL * uMotion;
  // 드레스 자락: 허리 아래에서 시작해 아래로 갈수록 크게 물결침 (부케에서 늘어진 잎 쪽은 제외)
  float skirt = (1.0 - smoothstep(0.26, 0.42, uv.y)) * smoothstep(0.20, 0.36, uv.x);
  float low = 1.0 - smoothstep(0.0, 0.42, uv.y);
  p.x += sin(t * 0.8 + uv.y * 10.0 + uv.x * 3.0) * 0.007 * skirt * (0.35 + low) * uMotion;
  p.y += sin(t * 0.65 + uv.x * 8.0) * 0.003 * skirt * low * uMotion;
  // 평면이 1x1 크기라 그림 좌표에서 0.5를 빼면 그대로 꼭짓점 위치가 된다 (크기는 mesh.scale이 맡음)
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p - 0.5, 0.0, 1.0);
}`;

const FRAG = /* glsl */`
uniform sampler2D uMap; uniform float uBlink; uniform vec2 uEyeL; uniform vec2 uEyeR; uniform vec2 uEyeSize; uniform vec3 uTint; uniform float uDim;
varying vec2 vUv;
uniform sampler2D uClosed; uniform float uHasClosed;
// 눈 깜빡임: 눈 감은 그림이 있을 때만, 눈 둘레에서 그 그림으로 잠깐 바꿔 보여준다.
// (그림을 눌러서 감기는 척하는 방식은 눈이 일그러져 보여서 쓰지 않는다)
float eyeMask(vec2 uv, vec2 c) {
  vec2 q = (uv - c) / (uEyeSize * 1.9);
  return 1.0 - smoothstep(0.6, 1.0, length(q));
}
void main() {
  vec4 c = texture2D(uMap, vUv);
  if (uHasClosed > 0.5) {
    float m = max(eyeMask(vUv, uEyeL), eyeMask(vUv, uEyeR)) * uBlink;
    c = mix(c, texture2D(uClosed, vUv), m);
  }
  c.rgb = c.rgb * uTint * uDim;
  gl_FragColor = vec4(c.rgb * c.a, c.a);
}`;

export function mountCharacter(canvas, { src, closedSrc, aspect, onReady }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, premultipliedAlpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
  const uniforms = {
    uTime: { value: 0 }, uPointer: { value: new THREE.Vector2() }, uBlink: { value: 0 }, uMotion: { value: 1 },
    uNeck: { value: new THREE.Vector2(...RIG.neck) }, uBouquet: { value: new THREE.Vector2(...RIG.bouquet) },
    uEyeL: { value: new THREE.Vector2(...RIG.eyes[0]) }, uEyeR: { value: new THREE.Vector2(...RIG.eyes[1]) },
    uEyeSize: { value: new THREE.Vector2(...RIG.eyeSize) }, uAspect: { value: aspect },
    uTint: { value: new THREE.Vector3(1.03, 0.99, 0.93) }, uDim: { value: 1 }, uMap: { value: null },
    uClosed: { value: null }, uHasClosed: { value: 0 },
  };
  const mat = new THREE.ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthTest: false,
    blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor });
  // 격자의 각 점이 그림의 어느 위치인지(uv)로 변형하므로, 평면은 uv와 같은 0~1 크기로 만든다
  const geo = new THREE.PlaneGeometry(1, 1, 48, 70);
  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);

  new THREE.TextureLoader().load(src, (tex) => {
    tex.colorSpace = THREE.NoColorSpace;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.anisotropy = 4;
    uniforms.uMap.value = tex;
    onReady?.();
  });
  if (closedSrc) {                                    // 눈 감은 그림(같은 크기·같은 위치)이 있으면 깜빡임을 켬
    new THREE.TextureLoader().load(closedSrc, (tex) => {
      tex.colorSpace = THREE.NoColorSpace;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      uniforms.uClosed.value = tex;
      uniforms.uHasClosed.value = 1;
    });
  }

  // 화면 배치: 캐릭터를 아래에 붙이고, 잘린 드레스 끝이 안 보이게 조금 내려 놓음
  function layout() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.left = 0; camera.right = w; camera.top = h; camera.bottom = 0;
    camera.updateProjectionMatrix();
    const ch = Math.min(h * 0.97, (w * 1.08) / aspect);       // 높이 기준, 좁은 화면에서는 너비 기준
    const cw = ch * aspect;
    mesh.scale.set(cw, ch, 1);
    // 그림의 오른쪽 끝(베일이 잘린 곳)이 화면 안에 보이지 않게, 필요하면 오른쪽으로 밀어 화면 밖으로 내보냄
    mesh.position.set(Math.max(w * 0.5 + cw * 0.03, w * 1.02 - cw * 0.5), ch * 0.5 - ch * 0.035, 0);
  }
  new ResizeObserver(layout).observe(canvas);
  layout();

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  uniforms.uMotion.value = reduce ? 0 : 1;
  const pointer = new THREE.Vector2(), goal = new THREE.Vector2();
  addEventListener('pointermove', (e) => { goal.set((e.clientX / innerWidth) * 2 - 1, -((e.clientY / innerHeight) * 2 - 1)); });
  addEventListener('pointerleave', () => goal.set(0, 0));

  // 깜빡임: 3~6초마다, 가끔 두 번 연달아
  let blinkAt = 2.5, blinkStart = -1, again = false;
  function blinkValue(t) {
    if (blinkStart < 0 && t > blinkAt) { blinkStart = t; again = Math.random() < 0.22; }
    if (blinkStart < 0) return 0;
    const e = t - blinkStart;
    const v = e < 0.07 ? e / 0.07 : e < 0.11 ? 1 : e < 0.24 ? 1 - (e - 0.11) / 0.13 : 0;
    if (e >= 0.24) { blinkStart = -1; blinkAt = t + (again ? 0.12 : 2.8 + Math.random() * 3.4); if (again) again = false; }
    return v;
  }

  const clock = new THREE.Clock();
  function tick() {
    requestAnimationFrame(tick);
    const t = clock.getElapsedTime();
    pointer.lerp(goal, 0.05);
    uniforms.uTime.value = t;
    uniforms.uPointer.value.copy(pointer);
    uniforms.uBlink.value = reduce ? 0 : blinkValue(t);
    renderer.render(scene, camera);
  }
  tick();
  return { uniforms, pointer };
}

// 무대 하나를 통째로 만든다: el 안에 배경, 캐릭터, 햇살, 빛먼지·꽃잎을 쌓고 움직이게 한다.
// 청첩장 표지의 아치 틀에도, 전체 화면 페이지에도 같은 함수를 쓴다.
export function mountScene(el, { src, closedSrc, aspect, label }) {
  const make = (tag, cls) => { const e = document.createElement(tag); e.className = cls; el.appendChild(e); return e; };
  const bg = make('div', 'bg');
  const charCanvas = make('canvas', 'char');
  if (label) { charCanvas.setAttribute('role', 'img'); charCanvas.setAttribute('aria-label', label); }
  make('div', 'rays');
  const cv = make('canvas', 'motes');
  cv.setAttribute('aria-hidden', 'true');
  make('div', 'vig');

  const char = mountCharacter(charCanvas, { src, closedSrc, aspect });
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isWatch = () => document.documentElement.dataset.theme === 'watch';   // 테마는 중간에 바뀔 수 있어 매번 확인

  const cx = cv.getContext('2d');
  let W = 0, H = 0;
  const size = () => { const r = cv.getBoundingClientRect(), d = Math.min(devicePixelRatio, 2); W = cv.width = Math.round(r.width * d); H = cv.height = Math.round(r.height * d); };
  new ResizeObserver(size).observe(cv); size();
  const rnd = (a, b) => a + Math.random() * (b - a);
  const motes = Array.from({ length: 46 }, () => ({ x: Math.random(), y: Math.random(), r: rnd(0.0012, 0.0042), s: rnd(0.004, 0.014), ph: rnd(0, 6.28), a: rnd(0.25, 0.8) }));
  const petals = Array.from({ length: 16 }, () => ({ x: Math.random() * 1.3, y: Math.random(), r: rnd(0.006, 0.012), s: rnd(0.025, 0.055), ph: rnd(0, 6.28), rot: rnd(0, 6.28) }));
  let visible = true, last = performance.now();
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(el);

  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!visible || reduce) { if (reduce) cx.clearRect(0, 0, W, H); return; }
    const watch = isWatch(), t = now / 1000, p = char.pointer;
    char.uniforms.uTint.value.set(...(watch ? [0.9, 1.0, 0.94] : [1.03, 0.99, 0.93]));
    bg.style.transform = `translate(${(-p.x * 1.1).toFixed(3)}%, ${(p.y * 0.7).toFixed(3)}%) scale(1.02)`;   // 배경은 캐릭터와 반대로
    cx.clearRect(0, 0, W, H);
    for (const m of motes) {                                   // 떠오르는 빛 먼지
      m.y -= m.s * dt * 0.5; m.x += Math.sin(t * 0.4 + m.ph) * 0.0006;
      if (m.y < -0.03) { m.y = 1.03; m.x = Math.random(); }
      const tw = 0.55 + 0.45 * Math.sin(t * 1.3 + m.ph), R = Math.max(1.5, m.r * H * 3);
      const g = cx.createRadialGradient(m.x * W, m.y * H, 0, m.x * W, m.y * H, R);
      g.addColorStop(0, `rgba(255, 236, 190, ${(m.a * tw * (watch ? 0.25 : 1)).toFixed(3)})`); g.addColorStop(1, 'rgba(255, 236, 190, 0)');
      cx.fillStyle = g; cx.beginPath(); cx.arc(m.x * W, m.y * H, R, 0, 6.283); cx.fill();
    }
    if (watch) return;
    for (const q of petals) {                                  // 햇살과 같은 방향(오른쪽 위 → 왼쪽 아래)으로 흩날리는 꽃잎
      q.y += q.s * dt; q.x -= q.s * dt * 0.55 + Math.sin(t * 0.9 + q.ph) * 0.0004; q.rot += dt * 0.8;
      if (q.y > 1.05 || q.x < -0.05) { q.y = -0.05; q.x = Math.random() * 1.3; }
      cx.save(); cx.translate(q.x * W, q.y * H); cx.rotate(q.rot); cx.scale(1, 0.55 + 0.4 * Math.sin(t * 1.7 + q.ph));
      cx.fillStyle = 'rgba(255, 248, 238, .5)'; cx.beginPath(); cx.ellipse(0, 0, q.r * H, q.r * H * 0.62, 0, 0, 6.283); cx.fill(); cx.restore();
    }
  }
  requestAnimationFrame(frame);
  return char;
}
