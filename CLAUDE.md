# 한여름 캐릭터 사이트 — 작업 메모

얀데레 코미디 캐릭터 "한여름"을 소개하는 **모바일 청첩장 컨셉**의 정적 웹사이트. 빌드 과정 없음.

> **먼저 읽기:** 폴더에 `작업기록.md`가 있으면 그 파일부터 읽을 것. 이전 세션에서 사용자와 나눈 대화 전체(요청, 결정, 캐릭터 플롯 원문, 남은 일)가 정리되어 있다. 공개 저장소라 이 파일은 `.gitignore`로 커밋에서 제외되어 있다.

## 구조
- `index.html` 청첩장 (표지, 모시는 글, 신부와 신랑, 달력+카운트다운, 참석 여부, 오시는 길, 갤러리 미리보기, 마음 전하실 곳)
- `profile.html` 신부 소개 · `room.html` 3D 신혼집 · `chat.html` 연락하기(선택지 채팅) · `gallery.html` 갤러리
- `js/config.js` — **캐릭터·대사·청첩장·소품·갤러리 데이터는 전부 여기.** 문구 수정은 이 파일만 고치면 됨
  - `invite.rsvpNo`: "못 가요"를 누를 때마다 순서대로 나오는 반응 6개
  - `chat`: 한여름이 먼저 말하지 않음. 시작 노드 `n0`은 선택지만 보여줌
  - `room[].glb`: 경로를 넣으면 그 소품만 직접 만든 .glb 모델로 교체
- `js/room.js` 3D 신혼집 (Three.js, 소품은 코드로 생성) · `js/common.js` 헤더/푸터 · `css/style.css` 디자인
- `vendor/` Three.js 0.170 로컬 사본 (GLTFLoader 포함, `'three'` import를 상대 경로로 바꿔둠)
- `assets/profile.jpg` 캐릭터 일러스트

## 디자인 규칙
- 아이보리 + 골드 + 장미색, 명조체(Nanum Myeongjo / Gowun Batang) + 영문 필기체(Pinyon Script)
- 가운데 최대 560px 한 장짜리 세로 종이 레이아웃. 모바일(390px)에서 가로 스크롤 없어야 함
- 호칭: 부르는 말은 "자기야", 문장 속 주어/목적어는 "자기"

## 로컬 확인
`python3 -m http.server` 후 http://localhost:8000 (파일 더블클릭으로는 모듈 스크립트가 안 돌아감)

## 배포 (GitHub Pages)
- 사이트는 **`gh-pages` 브랜치**에서 나감. 수정 후에는 `main`과 `gh-pages` 둘 다 푸시:
  `git push origin main && git push origin main:gh-pages`
- 반영까지 1~2분

## 남은 일
- 저장소 이름을 `-` → `yeoreum`으로 변경 (GitHub Settings → Repository name → Rename,
  또는 `gh repo rename yeoreum`). 바뀌면 사이트 주소가 https://0000ff03.github.io/yeoreum/ 이 됨.
  변경 후 `git remote set-url origin https://github.com/0000FF03/yeoreum.git` 하고 새 주소에서 5개 페이지 확인.
- 3D 신혼집 가구 색(초록 매트, 분홍 침대)이 아직 예전 팝 톤 — 청첩장 톤으로 맞출지 사용자에게 확인
- 일러스트 사용 권한 확인 필요 (오른쪽 아래 서명 있음)
