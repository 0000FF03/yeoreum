// 히든 테마가 켜져 있으면 첫 화면이 그려지기 전에 바로 적용 (깜빡임 방지)
try { if (localStorage.getItem('yr.theme') === 'watch') document.documentElement.dataset.theme = 'watch'; } catch (e) { /* 저장소를 못 쓰면 기본 테마 */ }

// 언어 고르기: 주소의 ?lang=ko|ja|en → 지난번에 고른 언어 → 브라우저 언어 순서. 고른 값은 <html lang>에 적어 두고 나머지 스크립트가 읽습니다.
(function () {
  var root = document.documentElement, ok = /^(ko|ja|en)$/, lang = '';
  try { var q = new URLSearchParams(location.search).get('lang'); if (ok.test(q || '')) lang = q; } catch (e) { /* 주소를 못 읽으면 넘어감 */ }
  try { if (lang) localStorage.setItem('yr.lang', lang); else lang = localStorage.getItem('yr.lang') || ''; } catch (e) { /* 저장소를 못 쓰면 넘어감 */ }
  if (!ok.test(lang)) { var n = String(navigator.language || 'ko').toLowerCase(); lang = n.indexOf('ko') === 0 ? 'ko' : n.indexOf('ja') === 0 ? 'ja' : 'en'; }
  root.lang = lang;
  if (lang === 'ko') return;
  // 번역이 끝날 때까지 본문을 잠깐 가려서 한국어가 비쳤다 바뀌는 것을 막음 (3초가 지나면 그냥 보여 줌)
  root.dataset.i18n = 'wait';
  setTimeout(function () { delete root.dataset.i18n; }, 3000);
  if (lang === 'ja') { // 일본어 글꼴
    var l = document.createElement('link'); l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@400;700;800&display=swap';
    document.head.appendChild(l);
  }
})();
