import { site, character } from './config.js';
import { initHidden } from './hidden.js';

const pages = [['index.html', '청첩장'], ['profile.html', '신부 소개'], ['room.html', '신혼집'], ['collection.html', '수집품'], ['chat.html', '연락하기'], ['gallery.html', '갤러리']];
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

// 일러스트의 얼굴 부분을 아바타로 사용
export function setAvatar(el) {
  el.style.backgroundImage = `url(${character.image})`;
}
