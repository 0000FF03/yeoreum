import { site, character, faces, faceDefault } from './config.js';
import { initHidden } from './hidden.js';

const pages = [['index.html', '청첩장'], ['profile.html', '신부 소개'], ['room.html', '신혼집'], ['collection.html', '수집품'], ['chat.html', '연락하기'], ['gallery.html', '갤러리'], ['webtoon.html', '웹툰']];
const here = location.pathname.split('/').pop() || 'index.html';

const sheet = document.querySelector('.sheet');

const header = document.createElement('header');
header.className = 'top';
header.innerHTML = '<div class="in pad"><a class="brand" href="index.html"></a><nav aria-label="페이지"></nav></div>';
header.querySelector('.brand').textContent = 'Han Yeoreum';
const nav = header.querySelector('nav');
pages.forEach(([href, label]) => {
  const a = document.createElement('a');
  a.href = href;
  a.textContent = label;
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

// 표정 일러스트의 얼굴 부분을 아바타로 사용 (key는 config의 faces 이름)
export function setAvatar(el, key = faceDefault) {
  const f = faces[key] || faces[faceDefault];
  const S = 3.7, SY = S * 832 / 1216; // 그림 너비를 아바타의 3.7배로 키워 얼굴만 보이게
  el.style.backgroundImage = `url(${f.src})`;
  el.style.backgroundSize = `${S * 100}% auto`;
  el.style.backgroundPosition = `${((f.at[0] * S - 0.5) / (S - 1)) * 100}% ${((f.at[1] * SY - 0.5) / (SY - 1)) * 100}%`;
}
