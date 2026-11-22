import { site, character, faces, faceDefault, lang, t } from './config.js?v=5bdc801e';
import { initHidden } from './hidden.js?v=5bdc801e';

const pages = [['index.html', '청첩장'], ['profile.html', '신부 소개'], ['room.html', '신혼집'], ['collection.html', '수집품'], ['chat.html', '연락하기'], ['gallery.html', '갤러리'], ['webtoon.html', '웹툰']];
const here = location.pathname.split('/').pop() || 'index.html';

// 다른 언어면 페이지에 직접 적힌 문구(글자, 감시 모드용 문구, 설명 글)를 바꿈. 히든 테마가 원래 문구를 기억하기 전에 해야 함.
if (lang !== 'ko') {
  const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n; (n = walk.nextNode());) { const s = n.nodeValue.trim(); if (s && t(s) !== s) n.nodeValue = n.nodeValue.replace(s, t(s)); }
  const attrs = ['data-watch', 'title', 'aria-label', 'alt'];
  document.querySelectorAll(attrs.map((a) => `[${a}]`).join()).forEach((el) => attrs.forEach((a) => { const v = el.getAttribute(a); if (v && t(v) !== v) el.setAttribute(a, t(v)); }));
}
document.title = here === 'index.html' ? site.title : t(document.title);

const sheet = document.querySelector('.sheet');

const header = document.createElement('header');
header.className = 'top';
header.innerHTML = '<div class="in pad"><a class="brand" href="index.html"></a><nav></nav><div class="langs"></div></div>';
header.querySelector('.brand').textContent = 'Han Yeoreum';
const nav = header.querySelector('nav');
nav.setAttribute('aria-label', t('페이지'));
// 언어 고르기 (주소에 ?lang=을 붙여 다시 열면 theme.js가 기억함)
const langs = header.querySelector('.langs');
langs.setAttribute('aria-label', t('언어'));
langs.setAttribute('role', 'group');
[['ko', '한', '한국어'], ['ja', '日', '日本語'], ['en', 'EN', 'English']].forEach(([code, label, name]) => {
  const a = document.createElement('a');
  a.href = '?lang=' + code; a.textContent = label; a.lang = code; a.title = name;
  if (code === lang) { a.className = 'on'; a.setAttribute('aria-current', 'true'); }
  langs.appendChild(a);
});
pages.forEach(([href, label]) => {
  const a = document.createElement('a');
  a.href = href;
  a.textContent = t(label);
  if (href === here) { a.className = 'on'; a.setAttribute('aria-current', 'page'); }
  nav.appendChild(a);
});
sheet.prepend(header);

const footer = document.createElement('footer');
footer.innerHTML = '<span class="eyebrow">Thank you</span><p class="b"></p>';
footer.querySelector('.b').textContent = `© ${character.en} · ${site.disclaimer}`;
sheet.appendChild(footer);

if (here !== 'index.html') document.title = `${document.title.split('|')[0].trim()} | ${site.title}`;

initHidden(footer, pages.findIndex(([href]) => href === here) + 1 || 1);
delete document.documentElement.dataset.i18n; // 번역이 끝났으니 본문을 보여 줌

// 표정 일러스트의 얼굴 부분을 아바타로 사용 (key는 config의 faces 이름)
export function setAvatar(el, key = faceDefault) {
  const f = faces[key] || faces[faceDefault];
  const S = 3.7, SY = S * 832 / 1216; // 그림 너비를 아바타의 3.7배로 키워 얼굴만 보이게
  el.style.backgroundImage = `url(${f.src})`;
  el.style.backgroundSize = `${S * 100}% auto`;
  el.style.backgroundPosition = `${((f.at[0] * S - 0.5) / (S - 1)) * 100}% ${((f.at[1] * SY - 0.5) / (SY - 1)) * 100}%`;
}
