import * as THREE from '../vendor/three.module.js';
import { GLTFLoader } from '../vendor/loaders/GLTFLoader.js';
import { t } from './config.js?v=c83e6e22';

const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, ...o });
function box(w, h, d, color, x = 0, y = 0, z = 0, o) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), std(color, o));
  m.position.set(x, y, z);
  m.castShadow = m.receiveShadow = true;
  return m;
}
function ball(r, color, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 18), std(color));
  m.position.set(x, y, z);
  m.scale.set(sx, sy, sz);
  m.castShadow = true;
  return m;
}
function cyl(rt, rb, h, color, x = 0, y = 0, z = 0, seg = 28) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), std(color));
  m.position.set(x, y, z);
  m.castShadow = m.receiveShadow = true;
  return m;
}
function heartMesh(color, size) {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.bezierCurveTo(0, 0.3, -0.5, 0.3, -0.5, 0);
  s.bezierCurveTo(-0.5, -0.3, 0, -0.45, 0, -0.7);
  s.bezierCurveTo(0, -0.45, 0.5, -0.3, 0.5, 0);
  s.bezierCurveTo(0.5, 0.3, 0, 0.3, 0, 0);
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.2, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 2 });
  g.center();
  const m = new THREE.Mesh(g, std(color));
  m.scale.setScalar(size);
  m.castShadow = true;
  return m;
}
function canvasTex(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const PASTELS = ['#ffd3e3', '#ffe38a', '#cfe9ff', '#d9f5d0', '#e5dcff', '#ffd9c2'];

// ---- 소품 제작 (각 함수는 그룹을 반환) ----
function makeBed() {
  const g = new THREE.Group();
  g.add(box(2.2, 0.35, 3.6, '#c98d5a', 0, 0.18, 0));
  g.add(box(2.0, 0.3, 3.4, '#ffffff', 0, 0.5, 0));
  g.add(box(2.05, 0.34, 2.1, '#ff9fbd', 0, 0.6, 0.7));
  g.add(box(0.85, 0.22, 0.55, '#ffffff', -0.5, 0.78, -1.35));
  g.add(box(0.85, 0.22, 0.55, '#fff6d6', 0.5, 0.78, -1.35));
  g.add(box(2.2, 1.1, 0.14, '#c98d5a', 0, 0.85, -1.85));
  const h = heartMesh('#ff4f8b', 0.55); h.rotation.x = -Math.PI / 2; h.position.set(0, 0.8, 0.7); g.add(h);
  return g;
}
function makeWall() {
  const g = new THREE.Group();
  for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) {
    const x = (i - 2) * 0.78, y = (j - 1) * 0.95;
    const f = new THREE.Group();
    f.add(box(0.64, 0.82, 0.05, '#ffffff', 0, 0, 0));
    f.add(box(0.52, 0.66, 0.06, PASTELS[(i * 3 + j) % PASTELS.length], 0, 0.02, 0.01));
    f.add(ball(0.1, '#fff0ea', 0, 0.1, 0.07));
    f.add(ball(0.17, '#2a1630', 0, -0.12, 0.05, 1, 0.8, 0.3));
    f.position.set(x, y, 0.03);
    f.rotation.z = ((i * 7 + j * 3) % 5 - 2) * 0.03;
    g.add(f);
  }
  const pin = heartMesh('#ff4f8b', 0.3); pin.position.set(0, 0.48, 0.12); g.add(pin);
  g.rotation.y = Math.PI / 2;
  return g;
}
function makeMonitor() {
  const g = new THREE.Group();
  const tex = canvasTex(512, 320, (c, w, h) => {
    c.fillStyle = '#0d1b17'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 9; i++) {
      const x = (i % 3) * (w / 3) + 5, y = Math.floor(i / 3) * (h / 3) + 5, cw = w / 3 - 10, ch = h / 3 - 10;
      c.fillStyle = i === 4 ? '#3a1c2e' : '#16302a'; c.fillRect(x, y, cw, ch);
      c.fillStyle = '#7dffb0'; c.font = '14px monospace'; c.fillText('CAM 0' + (i + 1), x + 6, y + 18);
      if (i === 4) { c.fillStyle = '#ff4f8b'; c.beginPath(); c.arc(x + cw / 2, y + ch / 2 + 4, 14, 0, 6.3); c.fill(); c.fillStyle = '#fff'; c.font = '16px sans-serif'; c.textAlign = 'center'; c.fillText(t('자기'), x + cw / 2, y + ch - 10); c.textAlign = 'start'; }
    }
  });
  g.add(box(1.5, 0.95, 0.08, '#2a1630', 0, 0, 0));
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.85), new THREE.MeshStandardMaterial({ map: tex, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 0.7 }));
  scr.position.z = 0.05; g.add(scr);
  g.add(box(0.12, 0.35, 0.12, '#2a1630', 0, -0.62, -0.05));
  g.add(box(0.6, 0.05, 0.4, '#2a1630', 0, -0.8, -0.05));
  return g;
}
function makeCalendar() {
  const g = new THREE.Group();
  const tex = canvasTex(256, 300, (c, w, h) => {
    c.fillStyle = '#fff'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#ff4f8b'; c.fillRect(0, 0, w, 56);
    c.fillStyle = '#fff'; c.font = 'bold 30px sans-serif'; c.fillText('D-DAY', 78, 40);
    c.fillStyle = '#2a1630'; c.font = '20px sans-serif';
    for (let d = 0; d < 35; d++) { const x = (d % 7) * 34 + 14, y = Math.floor(d / 7) * 44 + 92; c.fillText(String(d + 1), x, y); }
    c.strokeStyle = '#ff2f6f'; c.lineWidth = 5; c.beginPath(); c.ellipse(14 + 3 * 34 + 12, 92 + 2 * 44 - 7, 22, 20, 0, 0, 6.3); c.stroke();
    c.fillStyle = '#ff2f6f'; c.font = 'bold 26px sans-serif'; c.fillText('♡', 14 + 3 * 34 + 2, 92 + 2 * 44 + 36);
  });
  g.add(box(1.0, 1.2, 0.05, '#c98d5a', 0, 0, 0));
  const p = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.05), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 }));
  p.position.z = 0.03; g.add(p);
  g.rotation.y = Math.PI / 2;
  return g;
}
function makeMat() {
  const g = new THREE.Group();
  g.add(box(3.3, 0.08, 3.3, '#ffffff', 0, 0.04, 0));
  g.add(box(3.0, 0.14, 3.0, '#7fd18a', 0, 0.07, 0));
  g.add(cyl(1.05, 1.05, 0.02, '#ff4f8b', 0, 0.15, 0, 40));
  g.add(cyl(0.85, 0.85, 0.03, '#7fd18a', 0, 0.155, 0, 40));
  g.add(box(1.2, 0.05, 0.14, '#2a1630', 0.2, 0.2, 1.1));
  return g;
}
function makeBear() {
  const g = new THREE.Group();
  const fur = '#d9a56b';
  g.add(ball(0.4, fur, 0, 0.42, 0, 1, 1.05, 0.9));
  g.add(ball(0.3, fur, 0, 0.98, 0.02));
  g.add(ball(0.12, fur, -0.22, 1.22, 0)); g.add(ball(0.12, fur, 0.22, 1.22, 0));
  g.add(ball(0.12, '#f4d9b4', 0, 0.92, 0.26, 1, 0.8, 0.8));
  g.add(ball(0.04, '#2a1630', -0.1, 1.02, 0.27));
  // 오른쪽 눈은 초소형 카메라: 조금 큰 렌즈 + 빨간 녹화등
  g.add(ball(0.05, '#0c0a10', 0.1, 1.02, 0.27));
  const rec = new THREE.Mesh(new THREE.SphereGeometry(0.014, 12, 10), new THREE.MeshBasicMaterial({ color: '#ff2f4f' }));
  rec.position.set(0.1, 1.02, 0.318); g.add(rec);
  g.add(ball(0.04, '#2a1630', 0, 0.96, 0.36));
  g.add(ball(0.14, fur, -0.42, 0.45, 0.1, 1, 1.4, 1)); g.add(ball(0.14, fur, 0.42, 0.45, 0.1, 1, 1.4, 1));
  g.add(ball(0.16, fur, -0.22, 0.1, 0.3, 1, 0.8, 1.3)); g.add(ball(0.16, fur, 0.22, 0.1, 0.3, 1, 0.8, 1.3));
  g.scale.setScalar(1.15);
  return g;
}
function makeFridge() {
  const g = new THREE.Group();
  g.add(box(1.15, 2.1, 1.0, '#fff7ee', 0, 1.05, 0));
  g.add(box(1.17, 0.03, 1.02, '#2a1630', 0, 1.45, 0.0));
  g.add(box(0.06, 0.5, 0.06, '#c9b8a8', 0.45, 1.8, 0.55));
  g.add(box(0.06, 0.6, 0.06, '#c9b8a8', 0.45, 0.95, 0.55));
  const h = heartMesh('#ff4f8b', 0.28); h.position.set(-0.15, 1.8, 0.52); g.add(h);
  [['#ffe38a', -0.3], ['#ffd3e3', 0], ['#cfe9ff', 0.3]].forEach(([c, x]) => g.add(box(0.22, 0.3, 0.02, c, x, 0.85, 0.52)));
  return g;
}
function makeTagbox() {
  const g = new THREE.Group();
  g.add(box(0.55, 0.16, 0.38, '#ffc21a', 0, 0.08, 0));
  [[-0.5, 0.2], [0.55, 0.1], [0.5, -0.2]].forEach(([x, z]) => {
    const t = cyl(0.11, 0.11, 0.035, '#ffffff', x, 0.02, z); g.add(t);
    const d = cyl(0.04, 0.04, 0.04, '#ff4f8b', x, 0.025, z, 12); g.add(d);
  });
  g.scale.setScalar(1.4);
  return g;
}
function makeDrone() {
  const g = new THREE.Group();
  g.add(box(0.5, 0.12, 0.5, '#2a1630'));
  const rotors = [];
  [[1, 1], [-1, 1], [1, -1], [-1, -1]].forEach(([sx, sz]) => {
    const arm = box(0.5, 0.05, 0.05, '#2a1630', sx * 0.3, 0.02, sz * 0.3);
    arm.rotation.y = sx * sz * Math.PI / 4;
    g.add(arm);
    const r = cyl(0.26, 0.26, 0.015, '#ffffff', sx * 0.5, 0.09, sz * 0.5, 24);
    r.material.transparent = true; r.material.opacity = 0.55;
    g.add(r); rotors.push(r);
  });
  g.add(ball(0.09, '#ffffff', 0, -0.1, 0.2)); g.add(ball(0.045, '#ff2f6f', 0, -0.1, 0.28));
  g.userData.rotors = rotors;
  return g;
}

const BUILD = {
  bed: [makeBed, [-3.0, 0, -1.2]],
  wall: [makeWall, [-3.97, 2.75, -1.2]],
  monitor: [makeMonitor, [0.6, 1.96, -3.55]],
  drone: [makeDrone, [1.0, 3.5, 0.2]],
  calendar: [makeCalendar, [-3.98, 2.45, 1.7]],
  mat: [makeMat, [2.3, 0, 1.7]],
  bear: [makeBear, [-0.7, 0, 1.2]],
  fridge: [makeFridge, [3.3, 0, -3.3]],
  tagbox: [makeTagbox, [1.7, 1.11, -3.2]],
};

export function mountRoom(canvas, pinsEl, props, onSelect) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 4 / 3, 0.1, 80);

  scene.add(new THREE.HemisphereLight('#fff4e2', '#ffb8d0', 1.15));
  const sun = new THREE.DirectionalLight('#fff0cf', 2.4);
  sun.position.set(5, 9, 6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, near: 1, far: 30 });
  sun.shadow.bias = -0.0004;
  scene.add(sun);

  // 방 구조
  const room = new THREE.Group();
  room.add(box(8.6, 0.3, 8.6, '#e8bd8a', 0, -0.15, 0));
  for (let i = 0; i < 9; i++) room.add(box(8.6, 0.012, 0.03, '#c99a68', 0, 0.002, -4 + i * 1));
  room.add(box(8.6, 4.8, 0.3, '#ffd3e3', 0, 2.4, -4.15));
  room.add(box(0.3, 4.8, 8.6, '#fff0c8', -4.15, 2.4, 0));
  room.add(box(8.6, 0.25, 0.1, '#ffffff', 0, 0.13, -3.95));
  room.add(box(0.1, 0.25, 8.6, '#ffffff', -3.95, 0.13, 0));
  // 창문
  const win = new THREE.Group();
  win.add(box(2.1, 1.7, 0.1, '#ffffff', 0, 0, 0));
  win.add(box(1.9, 1.5, 0.06, '#bfe8ff', 0, 0, 0.04, { emissive: '#bfe8ff', emissiveIntensity: 0.55 }));
  win.add(box(0.07, 1.5, 0.08, '#ffffff', 0, 0, 0.06));
  win.add(box(1.9, 0.07, 0.08, '#ffffff', 0, 0, 0.06));
  win.position.set(-1.8, 2.8, -3.95);
  room.add(win);
  // 책상 + 의자
  const desk = new THREE.Group();
  desk.add(box(3.0, 0.12, 1.3, '#ffffff', 0, 1.05, 0));
  [[-1.35, -0.55], [1.35, -0.55], [-1.35, 0.55], [1.35, 0.55]].forEach(([x, z]) => desk.add(box(0.1, 1.0, 0.1, '#c98d5a', x, 0.5, z)));
  desk.add(box(0.6, 0.04, 0.22, '#e5dcff', -0.2, 1.13, 0.35));
  desk.position.set(0.6, 0, -3.2);
  room.add(desk);
  const chair = new THREE.Group();
  chair.add(box(0.9, 0.12, 0.9, '#ff4f8b', 0, 0.7, 0));
  chair.add(box(0.9, 0.9, 0.1, '#ff4f8b', 0, 1.2, -0.4));
  chair.add(cyl(0.06, 0.06, 0.65, '#2a1630', 0, 0.35, 0, 10));
  chair.add(cyl(0.45, 0.45, 0.05, '#2a1630', 0, 0.03, 0, 5));
  chair.position.set(0.6, 0, -1.9); chair.rotation.y = 0.35;
  room.add(chair);
  // 러그
  const rug = cyl(1.7, 1.7, 0.04, '#ffc2d9', -0.7, 0.02, 1.0, 48);
  rug.receiveShadow = true; room.add(rug);
  scene.add(room);

  // 소품
  const items = {};
  const meshToId = new Map();
  props.forEach((p, idx) => {
    const spec = BUILD[p.id];
    if (!spec) return;
    const g = spec[0]();
    g.position.set(...spec[1]);
    scene.add(g);
    g.updateMatrixWorld(true);
    const bb = new THREE.Box3().setFromObject(g);
    const anchor = bb.getCenter(new THREE.Vector3());
    anchor.y = bb.max.y + 0.15;
    items[p.id] = { group: g, anchor, idx, p, bb };
    g.traverse((o) => { if (o.isMesh) meshToId.set(o, p.id); });

    if (p.glb) {
      new GLTFLoader().load(p.glb, (gl) => {
        const size = bb.getSize(new THREE.Vector3());
        const m = gl.scene;
        const mb = new THREE.Box3().setFromObject(m);
        const ms = mb.getSize(new THREE.Vector3());
        const k = Math.max(size.x, size.y, size.z) / Math.max(ms.x, ms.y, ms.z, 0.001);
        m.scale.setScalar(k);
        const mb2 = new THREE.Box3().setFromObject(m);
        const c = mb2.getCenter(new THREE.Vector3());
        m.position.set(bb.getCenter(new THREE.Vector3()).x - c.x, bb.min.y - mb2.min.y, bb.getCenter(new THREE.Vector3()).z - c.z);
        m.traverse((o) => { if (o.isMesh) { o.castShadow = o.receiveShadow = true; meshToId.set(o, p.id); } });
        scene.remove(g);
        items[p.id].group = m;
        scene.add(m);
      }, undefined, (e) => console.warn('glb 로드 실패, 기본 소품 유지:', p.id, e));
    }
  });

  // 핀
  const pins = {};
  props.forEach((p, i) => {
    if (!items[p.id]) return;
    const b = document.createElement('button');
    b.className = 'pin';
    b.textContent = String(i + 1);
    b.setAttribute('aria-label', p.name);
    b.onclick = (e) => { e.stopPropagation(); api.select(p.id); };
    pinsEl.appendChild(b);
    pins[p.id] = b;
  });

  // 카메라 (드래그로 좌우 회전)
  const target = new THREE.Vector3(0, 1.5, -0.3);
  let yaw = 0.72, pitch = 0.46, dist = 17.5, yawGoal = yaw, dragging = false, lastX = 0, moved = 0;
  function placeCamera() {
    camera.position.set(
      target.x + dist * Math.sin(yaw) * Math.cos(pitch),
      target.y + dist * Math.sin(pitch),
      target.z + dist * Math.cos(yaw) * Math.cos(pitch)
    );
    camera.lookAt(target);
  }
  canvas.addEventListener('pointerdown', (e) => { dragging = true; moved = 0; lastX = e.clientX; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointerup', (e) => {
    dragging = false;
    if (moved < 5) pick(e);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (dragging) { const dx = e.clientX - lastX; moved += Math.abs(dx); lastX = e.clientX; yawGoal = Math.max(0.2, Math.min(1.25, yawGoal - dx * 0.006)); }
    else hover(e);
  });

  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  function hit(e) {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hits = ray.intersectObjects([...meshToId.keys()], false);
    return hits.length ? meshToId.get(hits[0].object) : null;
  }
  let hovered = null;
  function setGlow(id, on) {
    if (!id || !items[id]) return;
    items[id].group.traverse((o) => {
      if (o.isMesh && o.material && o.material.emissive && !o.material.map) {
        o.material.emissive.set(on ? '#ff4f8b' : '#000000');
        o.material.emissiveIntensity = on ? 0.35 : 0;
      }
    });
  }
  function hover(e) {
    const id = hit(e);
    if (id === hovered) return;
    if (hovered !== selected) setGlow(hovered, false);
    hovered = id;
    if (id) setGlow(id, true);
    canvas.style.cursor = id ? 'pointer' : 'grab';
  }
  function pick(e) { const id = hit(e); if (id) api.select(id); }

  let selected = null;
  const api = {
    select(id) {
      if (selected) { setGlow(selected, false); pins[selected]?.classList.remove('on'); }
      selected = id;
      setGlow(id, true);
      pins[id]?.classList.add('on');
      onSelect(id);
    },
  };

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // 좁은 화면에서는 방 전체가 보이도록 더 멀리
    dist = w < 520 ? 21.5 : w < 760 ? 19.5 : 17.5;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(canvas);
  resize();

  const clock = new THREE.Clock();
  let visible = true;
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(canvas);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const v = new THREE.Vector3();
  function tick() {
    requestAnimationFrame(tick);
    if (!visible) return;
    clock.getDelta();
    const t = clock.elapsedTime;
    yaw += (yawGoal - yaw) * 0.1;
    placeCamera();
    if (!reduce && items.drone) {
      const d = items.drone.group;
      d.position.y = 3.5 + Math.sin(t * 1.8) * 0.12;
      d.position.x = 1.0 + Math.sin(t * 0.6) * 0.35;
      d.rotation.y = Math.sin(t * 0.5) * 0.4;
      d.userData.rotors?.forEach((r) => { r.rotation.y = t * 40; });
    }
    if (!reduce && items.bear) items.bear.group.rotation.z = Math.sin(t * 1.4) * 0.02;
    const w = canvas.clientWidth, h = canvas.clientHeight;
    for (const id in pins) {
      const it = items[id];
      v.copy(it.group === items.drone?.group ? it.group.position : it.anchor);
      if (id === 'drone') v.y += 0.35;
      v.project(camera);
      pins[id].style.left = (v.x * 0.5 + 0.5) * w + 'px';
      pins[id].style.top = (-v.y * 0.5 + 0.5) * h + 'px';
    }
    renderer.render(scene, camera);
  }
  tick();
  return api;
}
