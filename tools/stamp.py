"""스크립트·스타일 주소에 버전(?v=...)을 붙입니다. 내용이 바뀌면 버전도 바뀌어 브라우저가 새 파일을 받습니다.
실행: python tools/stamp.py  (저장소 맨 위 폴더에서, 올리기 전에)
"""
import glob, hashlib, io, os, re, sys

os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
REF = re.compile(r"""(["'])((?:\./js/|\./|js/|css/)[\w-]+\.(?:js|css))(?:\?v=\w+)?\1""")
pages = sorted(glob.glob('*.html'))
code = sorted(glob.glob('js/*.js') + glob.glob('css/*.css'))


def read(p):
    return io.open(p, encoding='utf-8', newline='').read()


# 버전 표시를 뺀 내용으로 해시를 내야 버전을 붙여도 값이 변하지 않음
h = hashlib.sha1()
for p in code:
    h.update(REF.sub(r'\1\2\1', read(p)).replace('\r\n', '\n').encode('utf-8'))
ver = h.hexdigest()[:8]

changed = 0
for p in pages + [c for c in code if c.endswith('.js')]:
    s = read(p)
    t = REF.sub(lambda m: '%s%s?v=%s%s' % (m.group(1), m.group(2), ver, m.group(1)), s)
    if t != s:
        io.open(p, 'w', encoding='utf-8', newline='').write(t)
        changed += 1
sys.stdout.write('version %s, %d file(s) updated\n' % (ver, changed))
