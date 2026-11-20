# 한여름

얀데레 코미디 캐릭터 "한여름"을 소개하는 모바일 청첩장 컨셉의 정적 웹사이트입니다.

- `index.html` 청첩장 · `profile.html` 신부 소개 · `room.html` 3D 신혼집 · `collection.html` 수집품 전시실 · `chat.html` 연락하기 · `gallery.html` 갤러리
- 캐릭터·대사·청첩장 내용은 `js/config.js` 한 파일에서 수정합니다.
- 3D 소품은 `js/config.js`의 `room` 항목에 `glb` 경로를 넣으면 직접 만든 모델로 교체됩니다.
- 수집품 모델(`assets/collection/*.glb`)은 Blender로 만들었고, `js/config.js`의 `collection` 항목으로 추가·수정합니다.

빌드 과정 없이 정적 호스팅(GitHub Pages 등)에 그대로 올리면 동작합니다.
로컬에서 볼 때는 `python3 -m http.server`로 열어주세요 (파일을 더블클릭하면 모듈 스크립트가 동작하지 않습니다).

※ 코미디와 얀데레가 섞인 가상의 이야기입니다. 등장인물과 상황은 모두 허구입니다.
