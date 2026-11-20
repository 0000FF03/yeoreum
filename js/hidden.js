// 히든 테마(감시 모드): 조건 감지, 테마 전환, 선물로 복귀. 문구는 config.js의 hidden.
import { hidden } from './config.js';

const root = document.documentElement;
const store = {
  get(k, d = '') { try { return localStorage.getItem('yr.' + k) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem('yr.' + k, String(v)); } catch { /* 무시 */ } },
  del(k) { try { localStorage.removeItem('yr.' + k); } catch { /* 무시 */ } },
};
const listeners = [];
let entering = false;

export const isWatch = () => root.dataset.theme === 'watch';

// 테마가 바뀔 때마다(그리고 등록 즉시 한 번) 불립니다.
export function onTheme(fn) { listeners.push(fn); fn(isWatch()); }

function apply(watch) {
  if (watch) root.dataset.theme = 'watch'; else delete root.dataset.theme;
  document.querySelectorAll('[data-watch]').forEach((el) => {
    if (el.dataset.normal == null) el.dataset.normal = el.textContent;
    el.textContent = watch ? el.dataset.watch : el.dataset.normal;
  });
  listeners.forEach((fn) => fn(watch));
}

function overlay(lines) {
  const o = document.createElement('div');
  o.className = 'glitch';
  o.setAttribute('role', 'status');
  lines.forEach((l) => { const p = document.createElement('p'); p.textContent = l; o.appendChild(p); });
  document.body.appendChild(o);
  const close = () => { o.classList.add('out'); setTimeout(() => o.remove(), 500); };
  o.onclick = close;
  setTimeout(close, 3600);
}

// 조건 하나가 채워졌을 때 호출. 이미 히든 테마면 아무 일도 없습니다.
export function trigger(reason) {
  if (isWatch() || entering) return false;
  entering = true;
  store.set('theme', 'watch');
  const n = store.get('visits', '1');
  overlay((hidden.enter[reason] || []).map((l) => l.replace('{n}', n)));
  setTimeout(() => { apply(true); entering = false; }, 500);
  return true;
}

// 선물 주기: 원래 테마로 돌아가고, 누적된 조건을 처음부터 다시 셉니다.
export function restore() {
  store.del('theme');
  ['away', 'drone', 'scenes'].forEach((k) => store.del(k));
  apply(false);
}

// 횟수를 세다가 need번째에 히든 테마를 켭니다. (드론 클릭, 탭 떠나기)
export function count(key, need) {
  if (isWatch() || entering) return;
  const v = Number(store.get(key, '0')) + 1;
  if (v >= need) { store.del(key); trigger(key); } else store.set(key, v);
}

// 서로 다른 항목을 total개 다 보면 히든 테마를 켭니다. (채팅 장면)
export function mark(key, id, total) {
  if (isWatch() || entering) return;
  let seen = [];
  try { seen = JSON.parse(store.get('scenes', '[]')); } catch { /* 처음부터 */ }
  if (!seen.includes(id)) seen.push(id);
  if (seen.length >= total) { store.del('scenes'); trigger(key); } else store.set('scenes', JSON.stringify(seen));
}

export function initHidden(footer, camNo) {
  // 녹화 표시 (히든 테마에서만 보임)
  const rec = document.createElement('div');
  rec.className = 'rec';
  rec.setAttribute('aria-hidden', 'true');
  const time = document.createElement('span');
  rec.append(document.createElement('i'), `REC · CAM ${String(camNo).padStart(2, '0')}`, time);
  const clock = () => { time.textContent = ' · ' + new Date().toTimeString().slice(0, 8); };
  clock(); setInterval(clock, 1000);
  document.body.appendChild(rec);

  // 맨 아래 선물 주기 (히든 테마에서만 보임)
  const g = document.createElement('div');
  g.className = 'giftback';
  const lead = document.createElement('p');
  lead.textContent = hidden.gift.lead;
  const btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'btn'; btn.textContent = hidden.gift.button;
  const reply = document.createElement('p');
  reply.className = 'toast'; reply.setAttribute('aria-live', 'polite');
  btn.onclick = () => {
    if (btn.disabled) return;
    btn.disabled = true;
    reply.textContent = hidden.gift.reply;
    setTimeout(() => { restore(); btn.disabled = false; reply.textContent = ''; }, 2200);
  };
  g.append(lead, btn, reply);
  footer.prepend(g);

  apply(isWatch());

  // 조건: 탭을 떠나면 제목이 바뀌고, 한 번 떠났다 돌아오면 켜짐
  let title = document.title;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { title = document.title; document.title = hidden.awayTitle; }
    else { document.title = title; count('away', 1); }
  });

  // 조건: 5번째 방문마다 (브라우저를 새로 열 때마다 1번으로 셈)
  let fresh = false;
  try { fresh = !sessionStorage.getItem('yr.s'); sessionStorage.setItem('yr.s', '1'); } catch { /* 무시 */ }
  if (fresh) {
    const visits = Number(store.get('visits', '0')) + 1;
    store.set('visits', visits);
    if (visits % 5 === 0) setTimeout(() => trigger('visits'), 2500);
  }

  // 조건: 새벽 0~4시 접속 (하룻밤에 한 번만)
  const now = new Date();
  if (now.getHours() < 4) {
    const key = now.toDateString();
    if (store.get('night') !== key) { store.set('night', key); setTimeout(() => trigger('night'), 2500); }
  }
}
