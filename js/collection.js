// 수집품 전시실: 진열장 하나에 고른 수집품을 올려 보여줍니다. 모델은 Blender로 만든 .glb.
import * as THREE from '../vendor/three.module.js';
import { GLTFLoader } from '../vendor/loaders/GLTFLoader.js';
import { t } from './config.js?v=c83e6e22';

const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.8, metalness: 0, ...o });
const BASE_Y = 1.88; // 수집품이 떠 있는 높이
const FONT = "'Gowun Batang', 'Nanum Myeongjo', 'Shippori Mincho', serif";

// 영수증 겉면 글자를 그린 텍스처 (glTF UV에 맞춰 flipY를 끔)
function printTexture(lines, note) {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 1476;
  const tex = new THREE.CanvasTexture(c);
  tex.flipY = false;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const draw = () => {
    const x = c.getContext('2d'), w = c.width;
    x.fillStyle = '#fffdf6'; x.fillRect(0, 0, w, c.height);
    x.fillStyle = '#3b3128'; x.strokeStyle = '#3b3128'; x.textBaseline = 'middle';
    const total = lines.filter(Array.isArray).pop(); // 마지막 품목 줄(합계)은 굵게
    let y = 190;
    lines.forEach((l, i) => {
      if (l === '-') { x.setLineDash([10, 8]); x.lineWidth = 3; x.beginPath(); x.moveTo(48, y); x.lineTo(w - 48, y); x.stroke(); }
      else if (Array.isArray(l)) {
        x.font = `${l === total ? '700 ' : ''}38px ${FONT}`;
        x.textAlign = 'left'; x.fillText(l[0], 52, y);
        x.textAlign = 'right'; x.fillText(l[1], w - 52, y);
      } else { x.font = `${i === 0 ? '700 46px' : '34px'} ${FONT}`; x.textAlign = 'center'; x.fillText(l, w / 2, y); }
      y += i === 0 ? 92 : 78;
    });
    if (note) {
      x.save(); x.translate(w / 2, y + 70); x.rotate(-0.07);
      x.fillStyle = '#ad6474'; x.font = `700 52px ${FONT}`; x.textAlign = 'center'; x.fillText(note, 0, 0);
      x.restore();
    }
    tex.needsUpdate = true;
  };
  draw();
  document.fonts?.ready.then(draw);
  return tex;
}

// 빈 진열장에 놓는 '예약' 팻말
function reservedSign() {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 160;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const draw = () => {
    const x = c.getContext('2d');
    x.fillStyle = '#fffdf8'; x.fillRect(0, 0, 256, 160);
    x.strokeStyle = '#a07f3a'; x.lineWidth = 4; x.strokeRect(10, 10, 236, 140);
    x.fillStyle = '#3b3128'; x.textAlign = 'center'; x.textBaseline = 'middle';
    let size = 56; do { x.font = `700 ${size}px ${FONT}`; size -= 2; } while (x.measureText(t('예약')).width > 200); // 긴 말은 팻말에 맞게 줄임
    x.fillText(t('예약'), 128, 84);
    tex.needsUpdate = true;
  };
  draw();
  document.fonts?.ready.then(draw);
  const g = new THREE.Group();
  const card = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.39, 0.02), [std('#fffdf8'), std('#fffdf8'), std('#fffdf8'), std('#fffdf8'), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 }), std('#fffdf8')]);
  card.rotation.x = -0.32; card.castShadow = true;
  g.add(card);
  g.position.y = -0.87;
  return g;
}

export function mountCase(canvas, items) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 4 / 5, 0.1, 60);

  scene.add(new THREE.HemisphereLight('#fff8ea', '#e9d9c6', 1.25));
  const key = new THREE.DirectionalLight('#fff3d8', 2.3);
  key.position.set(3, 7, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -3, right: 3, top: 4, bottom: -1, near: 1, far: 20 });
  key.shadow.bias = -0.0005;
  scene.add(key);
  const fill = new THREE.DirectionalLight('#ffe4e8', 0.6);
  fill.position.set(-4, 3, 2);
  scene.add(fill);

  // 받침대 + 유리 진열장
  const cyl = (rt, rb, h, color, y, o) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, 48), std(color, o)); m.position.y = y; m.castShadow = m.receiveShadow = true; return m; };
  const stand = new THREE.Group();
  stand.add(cyl(1.0, 1.06, 0.12, '#efe4cc', 0.06));
  stand.add(cyl(0.9, 0.9, 0.5, '#fbf6ea', 0.37));
  stand.add(cyl(0.93, 0.93, 0.04, '#c2a05a', 0.16, { roughness: 0.45 }));
  stand.add(cyl(1.04, 0.96, 0.1, '#efe4cc', 0.67));
  stand.add(cyl(1.05, 1.05, 0.03, '#c2a05a', 0.735, { roughness: 0.45 }));
  stand.add(cyl(0.78, 0.8, 0.06, '#ad6474', 0.78, { roughness: 0.95 }));
  scene.add(stand);
  const glassGeo = new THREE.CylinderGeometry(0.98, 0.98, 2.2, 48, 1, true);
  const glass = new THREE.Mesh(glassGeo, new THREE.MeshStandardMaterial({ color: '#ffffff', transparent: true, opacity: 0.1, roughness: 0.05, side: THREE.DoubleSide, depthWrite: false }));
  glass.position.y = 1.85; glass.renderOrder = 2;
  scene.add(glass);
  const lid = cyl(1.0, 1.0, 0.04, '#c2a05a', 2.97, { roughness: 0.45 });
  lid.castShadow = false;
  scene.add(lid);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), new THREE.ShadowMaterial({ opacity: 0.16 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true;
  scene.add(floor);

  // 수집품
  const holder = new THREE.Group();
  holder.position.y = BASE_Y;
  scene.add(holder);
  const models = {};
  const loader = new GLTFLoader();
  items.forEach((it) => {
    const wrap = new THREE.Group();
    wrap.visible = false;
    holder.add(wrap);
    models[it.id] = wrap;
    if (!it.glb) { wrap.add(reservedSign()); return; }
    loader.load(it.glb, (gl) => {
      const m = gl.scene;
      const bb = new THREE.Box3().setFromObject(m);
      const size = bb.getSize(new THREE.Vector3());
      m.scale.setScalar(1.7 / Math.max(size.x, size.y, size.z, 0.001));
      const c = new THREE.Box3().setFromObject(m).getCenter(new THREE.Vector3());
      m.position.sub(c);
      m.traverse((o) => {
        if (!o.isMesh) return;
        o.castShadow = true;
        if (it.print && o.material.name === 'print') { o.material.map = printTexture(it.print, it.note); o.material.color.set('#ffffff'); o.material.needsUpdate = true; }
      });
      wrap.add(m);
    }, undefined, (e) => console.warn('수집품 모델을 불러오지 못했어요:', it.id, e));
  });

  let current = null, yaw = 0.5, dragging = false, lastX = 0;
  canvas.addEventListener('pointerdown', (e) => { dragging = true; lastX = e.clientX; canvas.setPointerCapture(e.pointerId); canvas.style.cursor = 'grabbing'; });
  canvas.addEventListener('pointerup', () => { dragging = false; canvas.style.cursor = 'grab'; });
  canvas.addEventListener('pointercancel', () => { dragging = false; });
  canvas.addEventListener('pointermove', (e) => { if (dragging) { yaw += (e.clientX - lastX) * 0.012; lastX = e.clientX; } });

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(canvas);
  resize();
  camera.position.set(0, 2.5, 7.7);
  camera.lookAt(0, 1.6, 0);

  const clock = new THREE.Clock();
  let visible = true;
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(canvas);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function tick() {
    requestAnimationFrame(tick);
    if (!visible) return;
    const dt = clock.getDelta();
    if (!dragging && !reduce) yaw += dt * 0.45;
    holder.rotation.y = yaw;
    if (!reduce) holder.position.y = BASE_Y + Math.sin(clock.elapsedTime * 1.3) * 0.035;
    renderer.render(scene, camera);
  }
  tick();

  return {
    show(id) {
      if (current) models[current].visible = false;
      current = id;
      if (models[id]) models[id].visible = true;
      yaw = 0.5;
    },
  };
}
