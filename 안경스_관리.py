# -*- coding: utf-8 -*-
"""
안경스(안박사의 경제스터디) 영상 관리 도구
────────────────────────────────────────────────────────
· 더블클릭(안경스_관리.bat)하면 관리 화면이 브라우저에 열립니다.
· 유튜브 링크를 추가/삭제하고 [게시하기]를 누르면
  videos.js 를 고쳐 GitHub 에 자동으로 올립니다(데스크탑·모바일 모두 반영).
· 백엔드 서버가 아니라, 내 PC에서만 실행되는 개인 관리 도구입니다.
"""
import http.server, socketserver, json, os, re, subprocess, webbrowser, sys, threading, urllib.parse

REPO = os.path.dirname(os.path.abspath(__file__))
VIDEOS_JS = os.path.join(REPO, "videos.js")
HEADER = ('/* 안경스(안박사의 경제스터디) 게시 영상 목록\n'
          '   ── 이 파일은 "안경스_관리" 도구가 자동으로 고쳐서 GitHub에 올립니다.\n'
          '      손으로 고쳐도 되지만, 형식(JSON 배열)을 지켜주세요.\n'
          '      · 유튜브:   { "url": "https://youtu.be/영상ID", "title": "제목" }\n'
          '      · 올린파일: { "file": "videos/파일명.mp4", "title": "제목" } */\n')

YT_RE = re.compile(r'(?:youtu\.be/|[?&]v=|shorts/|embed/|live/)([A-Za-z0-9_-]{11})')

def ytid(u):
    if not u:
        return None
    m = YT_RE.search(str(u))
    if m:
        return m.group(1)
    return u if re.fullmatch(r'[A-Za-z0-9_-]{11}', str(u)) else None

def read_videos():
    try:
        with open(VIDEOS_JS, encoding="utf-8") as f:
            txt = f.read()
        m = re.search(r'window\.STUDY_VIDEOS\s*=\s*(\[.*?\])\s*;', txt, re.S)
        return json.loads(m.group(1)) if m else []
    except Exception:
        return []

def write_videos(vids):
    clean = []
    for v in vids:
        if v.get("file"):                                   # 사이트에 올린 동영상 파일
            clean.append({"file": v["file"], "title": (v.get("title") or "").strip()})
            continue
        vid = ytid(v.get("url") or v.get("id"))             # 유튜브 링크
        if not vid:
            continue
        clean.append({"url": "https://youtu.be/" + vid, "title": (v.get("title") or "").strip()})
    body = HEADER + "window.STUDY_VIDEOS = " + json.dumps(clean, ensure_ascii=False, indent=2) + ";\n"
    with open(VIDEOS_JS, "w", encoding="utf-8") as f:
        f.write(body)
    return clean

VIDEOS_DIR = os.path.join(REPO, "videos")

def safe_name(name):
    base = os.path.basename(name or "")
    stem, ext = os.path.splitext(base)
    ext = "." + re.sub(r'[^A-Za-z0-9]', '', ext).lower() if ext else ".mp4"
    stem = re.sub(r'[^A-Za-z0-9_-]', '', stem) or "video"
    os.makedirs(VIDEOS_DIR, exist_ok=True)
    cand, i = stem + ext, 1
    while os.path.exists(os.path.join(VIDEOS_DIR, cand)):
        cand = "%s-%d%s" % (stem, i, ext); i += 1
    return cand

def save_upload(name, raw):
    fn = safe_name(name)
    with open(os.path.join(VIDEOS_DIR, fn), "wb") as f:
        f.write(raw)
    return "videos/" + fn

def git(*args):
    p = subprocess.run(["git", "-C", REPO] + list(args),
                       capture_output=True, text=True, encoding="utf-8", errors="replace")
    return p.returncode, ((p.stdout or "") + (p.stderr or "")).strip()

def publish(vids):
    clean = write_videos(vids)
    git("add", "videos.js")
    if os.path.isdir(VIDEOS_DIR):
        git("add", "videos")
    code, out = git("commit", "-m", "안경스 영상 업데이트")
    committed = (code == 0)
    if not committed and "nothing to commit" not in out and "변경 사항 없음" not in out and "no changes" not in out:
        return {"ok": False, "msg": "커밋 실패:\n" + out, "count": len(clean)}
    pcode, pout = git("push")
    if pcode != 0 and "up to date" not in pout.lower() and "up-to-date" not in pout.lower():
        return {"ok": False, "msg": "GitHub 업로드(push) 실패:\n" + pout +
                "\n\n인터넷 연결이나 GitHub 로그인 상태를 확인해 주세요.", "count": len(clean)}
    return {"ok": True, "count": len(clean),
            "msg": ("게시 완료! 영상 %d개를 GitHub에 올렸습니다.\n1~2분 뒤 사이트(데스크탑·모바일)에 반영됩니다." % len(clean))
                   if committed else
                   ("변경 사항이 없어 그대로 두었습니다. (현재 게시된 영상 %d개)" % len(clean))}

PAGE = r"""<!DOCTYPE html>
<html lang="ko"><head><meta charset="utf-8"><title>안경스 영상 관리</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  :root{--navy:#12233f;--navy2:#1b3358;--gold:#b6924f;--gold2:#cbb07a;--ink:#1c2430;--soft:#5a6472;--line:#e6e0d5;--ivory:#f7f4ef}
  *{box-sizing:border-box}
  body{font-family:"Malgun Gothic",-apple-system,sans-serif;background:var(--ivory);color:var(--ink);margin:0;line-height:1.6}
  .top{background:linear-gradient(150deg,#0d1b2f,var(--navy2));color:#fff;padding:26px 22px}
  .top h1{margin:0;font-size:22px}
  .top p{margin:6px 0 0;color:var(--gold2);font-size:14px}
  .wrap{max-width:820px;margin:0 auto;padding:22px}
  .card{background:#fff;border:1px solid var(--line);border-radius:14px;padding:18px 20px;margin-bottom:18px;box-shadow:0 2px 10px rgba(13,27,47,.06)}
  h2{font-size:16px;margin:0 0 14px;color:var(--navy)}
  .row{display:flex;gap:8px;flex-wrap:wrap}
  input[type=text]{flex:1;min-width:200px;padding:11px 13px;border:1px solid var(--line);border-radius:9px;font-size:14px;outline:none}
  input[type=text]:focus{border-color:var(--gold2)}
  button{cursor:pointer;border:none;border-radius:9px;font-size:14px;font-weight:600;padding:11px 18px;font-family:inherit}
  .add{background:var(--navy);color:#fff}
  .add:hover{background:var(--navy2)}
  .pub{background:var(--gold);color:#241a06;font-size:16px;padding:14px 26px;width:100%}
  .pub:hover{background:var(--gold2)}
  .pub:disabled{opacity:.5;cursor:default}
  .list{display:flex;flex-direction:column;gap:10px;margin-top:4px}
  .vid{display:flex;gap:12px;align-items:center;border:1px solid var(--line);border-radius:11px;padding:10px;background:var(--ivory)}
  .vid img{width:120px;height:68px;object-fit:cover;border-radius:7px;flex:none;background:#ccc}
  .vid .meta{flex:1;min-width:0}
  .vid .ttl{width:100%;border:1px solid transparent;background:transparent;font-size:14px;font-weight:600;color:var(--navy);padding:4px 6px;border-radius:6px}
  .vid .ttl:focus{border-color:var(--gold2);background:#fff;outline:none}
  .vid .u{font-size:12px;color:var(--soft);padding:0 6px;word-break:break-all}
  .vid .ops{display:flex;flex-direction:column;gap:5px}
  .vid .ops button{padding:5px 9px;font-size:12px;background:#fff;border:1px solid var(--line);color:var(--soft)}
  .vid .ops .del:hover{background:#c0392b;color:#fff;border-color:#c0392b}
  .vid .thumbph{width:120px;height:68px;border-radius:7px;flex:none;background:#12233f;color:var(--gold2);display:flex;align-items:center;justify-content:center;font-size:24px}
  .filebtn{display:inline-flex;align-items:center;gap:6px;background:var(--gold);color:#241a06;padding:11px 18px;border-radius:9px;cursor:pointer;font-size:14px;font-weight:600}
  .filebtn:hover{background:var(--gold2)}
  .filebtn input{display:none}
  .empty{color:var(--soft);font-size:14px;text-align:center;padding:26px;border:1px dashed var(--line);border-radius:11px}
  .note{font-size:12.5px;color:var(--soft);margin-top:10px}
  #status{margin-top:14px;padding:13px 15px;border-radius:9px;font-size:14px;white-space:pre-wrap;display:none}
  #status.ok{background:#eaf6ec;color:#1c6b2b;display:block}
  #status.err{background:#fbeceb;color:#a5261c;display:block}
  #status.info{background:#eef2f8;color:#274a76;display:block}
  a{color:var(--navy2)}
</style></head>
<body>
  <div class="top"><h1>🎬 안경스 영상 관리</h1><p>유튜브 링크를 추가하고 [게시하기]를 누르면 사이트(데스크탑·모바일)에 반영됩니다.</p></div>
  <div class="wrap">
    <div class="card">
      <h2>➕ 새 영상 추가</h2>
      <div class="row">
        <input id="u" type="text" placeholder="유튜브 링크 (youtu.be/… 또는 youtube.com/watch?v=…)">
        <input id="t" type="text" placeholder="제목 (선택)" style="max-width:240px">
        <button class="add" onclick="add()">추가</button>
      </div>
      <div class="row" style="margin-top:10px;align-items:center">
        <label class="filebtn">🎬 동영상 파일 올리기<input id="f" type="file" accept="video/*" onchange="uploadFile(this)"></label>
        <span id="upmsg" class="note" style="margin:0">PC 동영상 파일을 사이트에 직접 올립니다. (용량 큰 영상은 유튜브 링크를 권장)</span>
      </div>
      <div class="note">유튜브: <b>일부공개(unlisted)</b>/공개로 올린 뒤 링크를 붙여넣기. 제목은 목록에서 바로 고칠 수 있어요.</div>
    </div>
    <div class="card">
      <h2>📺 게시할 영상 목록 <span id="cnt" style="color:var(--soft);font-weight:400"></span></h2>
      <div id="list" class="list"></div>
    </div>
    <div class="card">
      <button id="pubBtn" class="pub" onclick="publish()">💾 게시하기 (GitHub에 올려 모든 기기에 반영)</button>
      <div id="status"></div>
      <div class="note">게시하면 <b>videos.js</b>가 갱신되고 GitHub에 자동 업로드됩니다. 반영까지 보통 1~2분 걸려요.</div>
    </div>
    <p class="note">사이트 주소: <a href="https://akhbeing-design.github.io/ahn-kyunghee/" target="_blank">akhbeing-design.github.io/ahn-kyunghee</a></p>
  </div>
<script>
let vids = __VIDEOS_JSON__;
function ytid(u){ if(!u) return null; const m=String(u).match(/(?:youtu\.be\/|[?&]v=|shorts\/|embed\/|live\/)([A-Za-z0-9_-]{11})/); return m?m[1]:(/^[A-Za-z0-9_-]{11}$/.test(u)?u:null); }
function esc(s){ return String(s||"").replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
function render(){
  const L=document.getElementById('list'); L.innerHTML='';
  document.getElementById('cnt').textContent = vids.length?('· '+vids.length+'개'):'';
  if(!vids.length){ L.innerHTML='<div class="empty">아직 영상이 없습니다. 위에서 유튜브 링크를 추가해 보세요.</div>'; return; }
  vids.forEach((v,i)=>{
    const d=document.createElement('div'); d.className='vid';
    const thumb = v.file ? `<div class="thumbph">🎬</div>`
                         : `<img src="https://img.youtube.com/vi/${ytid(v.url)}/mqdefault.jpg" alt="">`;
    const sub = v.file ? ('올린 파일 · '+esc(v.file)) : esc(v.url);
    d.innerHTML=`${thumb}
      <div class="meta">
        <input class="ttl" value="${esc(v.title)}" placeholder="제목 (선택)" oninput="vids[${i}].title=this.value">
        <div class="u">${sub}</div>
      </div>
      <div class="ops">
        <button onclick="mv(${i},-1)" ${i===0?'disabled':''}>▲</button>
        <button onclick="mv(${i},1)" ${i===vids.length-1?'disabled':''}>▼</button>
        <button class="del" onclick="del(${i})">삭제</button>
      </div>`;
    L.appendChild(d);
  });
}
function add(){
  const u=document.getElementById('u').value.trim();
  if(!ytid(u)){ alert('올바른 유튜브 링크를 붙여넣어 주세요.'); return; }
  if(vids.some(v=>ytid(v.url)===ytid(u))){ alert('이미 목록에 있는 영상입니다.'); return; }
  vids.push({url:u,title:document.getElementById('t').value.trim()});
  document.getElementById('u').value=''; document.getElementById('t').value=''; render();
  setStatus('info','추가했습니다. 아래 [게시하기]를 눌러야 사이트에 반영돼요.');
}
function uploadFile(inp){
  const f=inp.files&&inp.files[0]; if(!f) return;
  const um=document.getElementById('upmsg');
  um.textContent='올리는 중… '+f.name+' ('+Math.round(f.size/1048576)+'MB)';
  const rd=new FileReader();
  rd.onload=async()=>{
    try{
      const b64=String(rd.result).split(',')[1];
      const r=await fetch('/upload',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:f.name,data:b64})});
      const j=await r.json();
      if(j.ok){ vids.push({file:j.file,title:f.name.replace(/\.[^.]+$/,'')}); render(); um.textContent='파일 추가됨: '+j.file+' — 아래 [게시하기]를 눌러 반영하세요.'; }
      else { um.textContent='업로드 실패: '+(j.msg||''); }
    }catch(e){ um.textContent='업로드 오류: '+e; }
    inp.value='';
  };
  rd.readAsDataURL(f);
}
function del(i){ vids.splice(i,1); render(); }
function mv(i,dir){ const j=i+dir; if(j<0||j>=vids.length) return; [vids[i],vids[j]]=[vids[j],vids[i]]; render(); }
function setStatus(cls,msg){ const s=document.getElementById('status'); s.className=cls; s.textContent=msg; }
async function publish(){
  const btn=document.getElementById('pubBtn'); btn.disabled=true;
  setStatus('info','게시 중… GitHub에 올리는 동안 잠시 기다려 주세요.');
  try{
    const r=await fetch('/publish',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(vids)});
    const j=await r.json();
    setStatus(j.ok?'ok':'err', j.msg);
  }catch(e){ setStatus('err','통신 오류: '+e); }
  btn.disabled=false;
}
render();
</script>
</body></html>"""

class H(http.server.BaseHTTPRequestHandler):
    def log_message(self, *a):
        pass
    def _send(self, code, body, ctype="text/html; charset=utf-8"):
        data = body.encode("utf-8") if isinstance(body, str) else body
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)
    def do_GET(self):
        if self.path in ("/", "/index.html"):
            page = PAGE.replace("__VIDEOS_JSON__", json.dumps(read_videos(), ensure_ascii=False))
            self._send(200, page)
        else:
            self._send(404, "not found")
    def _read_body(self):
        n = int(self.headers.get("Content-Length", 0))
        buf = b""
        while len(buf) < n:
            chunk = self.rfile.read(min(65536, n - len(buf)))
            if not chunk:
                break
            buf += chunk
        return buf
    def do_POST(self):
        try:
            if self.path == "/publish":
                vids = json.loads(self._read_body().decode("utf-8"))
                result = publish(vids)
            elif self.path == "/upload":
                import base64
                data = json.loads(self._read_body().decode("utf-8"))
                raw = base64.b64decode(data["data"])
                path = save_upload(data.get("name", "video.mp4"), raw)
                result = {"ok": True, "file": path}
            else:
                self._send(404, "not found"); return
        except Exception as e:
            result = {"ok": False, "msg": "오류: " + str(e)}
        self._send(200, json.dumps(result, ensure_ascii=False), "application/json; charset=utf-8")

def main():
    port = 8765
    for p in range(8765, 8785):
        try:
            httpd = socketserver.TCPServer(("127.0.0.1", p), H)
            port = p
            break
        except OSError:
            continue
    else:
        print("사용 가능한 포트를 찾지 못했습니다."); return
    url = "http://127.0.0.1:%d/" % port
    print("\n  안경스 영상 관리 도구가 실행 중입니다.")
    print("  브라우저에서 열기:  " + url)
    print("  (이 창을 닫으면 도구가 종료됩니다.)\n")
    threading.Timer(0.8, lambda: webbrowser.open(url)).start()
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass

if __name__ == "__main__":
    main()
