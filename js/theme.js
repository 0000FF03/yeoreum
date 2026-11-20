// 히든 테마가 켜져 있으면 첫 화면이 그려지기 전에 바로 적용 (깜빡임 방지)
try { if (localStorage.getItem('yr.theme') === 'watch') document.documentElement.dataset.theme = 'watch'; } catch (e) { /* 저장소를 못 쓰면 기본 테마 */ }
