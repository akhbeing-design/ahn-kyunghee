# -*- coding: utf-8 -*-
"""
질의응답 관리 도구
────────────────────────────────────────────────────────
· 더블클릭(질의응답_관리.bat)하면 관리 화면이 브라우저에 열립니다.
· 방문자 질문에 답을 적고 '공개' 또는 '비밀'을 선택합니다.
    - 공개: qna.js 에 담겨 GitHub에 올라가 사이트 '질의응답' 섹션에 표시됩니다.
    - 비밀: 이 PC의 비밀답변.json 에만 저장(사이트에 올라가지 않음) — 답장은 이메일로.
· [게시하기]를 누르면 공개 항목이 GitHub에 자동 업로드됩니다.
"""
import http.server, socketserver, json, os, re, subprocess, webbrowser, threading

REPO = os.path.dirname(os.path.abspath(__file__))
QNA_JS = os.path.join(REPO, "qna.js")
SECRET_JSON = os.path.join(REPO, "비밀답변.json")
HEADER = ('/* 질의응답(공개) 목록\n'
          '   ── \'질의응답_관리\' 도구가 자동으로 고쳐서 GitHub에 올립니다.\n'
          '      여기에는 \'공개\'로 선택한 질의응답만 담깁니다. (비밀 답변은 이 파일에 저장되지 않습니다) */\n')

def read_qna():
    try:
        with open(QNA_JS, encoding="utf-8") as f:
            m = re.search(r'window\.QNA\s*=\s*(\[.*?\])\s*;', f.read(), re.S)
        return json.loads(m.group(1)) if m else []
    except Exception:
        return []

def read_secret():
    try:
        with open(SECRET_JSON, encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []

def _norm(e):
    return {"q": (e.get("q") or "").strip(), "a": (e.get("a") or "").strip(),
            "date": (e.get("date") or "").strip(), "by": (e.get("by") or "").strip()}

def write_qna(pub):
    body = HEADER + "window.QNA = " + json.dumps([_norm(e) for e in pub], ensure_ascii=False, indent=2) + ";\n"
    with open(QNA_JS, "w", encoding="utf-8") as f:
        f.write(body)

def write_secret(priv):
    with open(SECRET_JSON, "w", encoding="utf-8") as f:
        json.dump([_norm(e) for e in priv], f, ensure_ascii=False, indent=2)

def load_all():
    return ([dict(_norm(e), secret=False) for e in read_qna() if e.get("q") and e.get("a")] +
            [dict(_norm(e), secret=True) for e in read_secret() if e.get("q") and e.get("a")])

def git(*args):
    p = subprocess.run(["git", "-C", REPO] + list(args),
                       capture_output=True, text=True, encoding="utf-8", errors="replace")
    return p.returncode, ((p.stdout or "") + (p.stderr or "")).strip()

def publish(entries):
    entries = [e for e in entries if (e.get("q") or "").strip() and (e.get("a") or "").strip()]
    pub = [e for e in entries if not e.get("secret")]
    priv = [e for e in entries if e.get("secret")]
    write_qna(pub)
    write_secret(priv)
    git("add", "qna.js")
    code, out = git("commit", "-m", "질의응답 업데이트")
    committed = (code == 0)
    if not committed and "nothing to commit" not in out and "변경 사항 없음" not in out and "no changes" not in out:
        return {"ok": False, "msg": "커밋 실패:\n" + out}
    pcode, pout = git("push")
    if pcode != 0 and "up to date" not in pout.lower() and "up-to-date" not in pout.lower():
        return {"ok": False, "msg": "GitHub 업로드(push) 실패:\n" + pout}
    return {"ok": True, "msg": ("게시 완료! 공개 %d개를 GitHub에 올렸습니다 (비밀 %d개는 이 PC에만 저장).\n1~2분 뒤 사이트에 반영됩니다."
                                % (len(pub), len(priv))) if committed
                               else ("변경 사항이 없어 그대로 두었습니다. (공개 %d · 비밀 %d)" % (len(pub), len(priv)))}

PAGE = r"""<!DOCTYPE html>
<html lang="ko"><head><meta charset="utf-8"><title>질의응답 관리</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  :root{--navy:#12233f;--navy2:#1b3358;--gold:#b6924f;--gold2:#cbb07a;--ink:#1c2430;--soft:#5a6472;--line:#e6e0d5;--ivory:#f7f4ef}
  *{box-sizing:border-box}
  body{font-family:"Malgun Gothic",-apple-system,sans-serif;background:var(--ivory);color:var(--ink);margin:0;line-height:1.6}
  .top{background:linear-gradient(150deg,#0d1b2f,var(--navy2));color:#fff;padding:26px 22px}
  .top h1{margin:0;font-size:22px}.top p{margin:6px 0 0;color:var(--gold2);font-size:14px}
  .wrap{max-width:860px;margin:0 auto;padding:22px}
  .card{background:#fff;border:1px solid var(--line);border-radius:14px;padding:18px 20px;margin-bottom:18px;box-shadow:0 2px 10px rgba(13,27,47,.06)}
  h2{font-size:16px;margin:0 0 14px;color:var(--navy)}
  textarea,input[type=text]{width:100%;padding:11px 13px;border:1px solid var(--line);border-radius:9px;font:14px inherit;outline:none;font-family:inherit}
  textarea:focus,input:focus{border-color:var(--gold2)}
  textarea{resize:vertical;min-height:56px}
  label.fld{display:block;font-size:13px;color:var(--soft);margin:10px 0 5px}
  button{cursor:pointer;border:none;border-radius:9px;font-size:14px;font-weight:600;padding:11px 18px;font-family:inherit}
  .add{background:var(--navy);color:#fff}.add:hover{background:var(--navy2)}
  .pub{background:var(--gold);color:#241a06;font-size:16px;padding:14px 26px;width:100%}.pub:hover{background:var(--gold2)}
  .pub:disabled{opacity:.5;cursor:default}
  .seg{display:inline-flex;border:1px solid var(--line);border-radius:9px;overflow:hidden;margin-top:8px}
  .seg button{background:#fff;color:var(--soft);border:none;padding:9px 16px;font-weight:600}
  .seg button.on{background:var(--navy);color:#fff}
  .list{display:flex;flex-direction:column;gap:12px;margin-top:6px}
  .qa{border:1px solid var(--line);border-radius:11px;padding:14px;background:var(--ivory)}
  .qa .badge{display:inline-block;font-size:12px;font-weight:700;padding:2px 10px;border-radius:999px;margin-bottom:8px}
  .qa .badge.pub{background:#eaf6ec;color:#1c6b2b}.qa .badge.sec{background:#fbeee9;color:#a5261c}
  .qa .q{font-weight:700;color:var(--navy)}.qa .a{margin-top:6px;color:var(--ink);white-space:pre-wrap;font-size:14px}
  .qa .ops{display:flex;gap:6px;margin-top:10px;flex-wrap:wrap}
  .qa .ops button{padding:6px 11px;font-size:12px;background:#fff;border:1px solid var(--line);color:var(--soft)}
  .qa .ops .tgl:hover{background:var(--gold);color:#241a06;border-color:var(--gold)}
  .qa .ops .del:hover{background:#c0392b;color:#fff;border-color:#c0392b}
  .empty{color:var(--soft);font-size:14px;text-align:center;padding:24px;border:1px dashed var(--line);border-radius:11px}
  .note{font-size:12.5px;color:var(--soft);margin-top:10px}
  #status{margin-top:14px;padding:13px 15px;border-radius:9px;font-size:14px;white-space:pre-wrap;display:none}
  #status.ok{background:#eaf6ec;color:#1c6b2b;display:block}#status.err{background:#fbeceb;color:#a5261c;display:block}#status.info{background:#eef2f8;color:#274a76;display:block}
</style></head>
<body>
  <div class="top"><h1>💬 질의응답 관리</h1><p>답을 적고 공개/비밀을 고른 뒤 [게시하기]를 누르세요. 공개만 사이트에 표시됩니다.</p></div>
  <div class="wrap">
    <div class="card">
      <h2>➕ 질의응답 추가</h2>
      <label class="fld">질문</label>
      <textarea id="q" placeholder="방문자 질문(또는 자주 묻는 질문)을 적어주세요"></textarea>
      <label class="fld">답변</label>
      <textarea id="a" placeholder="답변을 적어주세요"></textarea>
      <label class="fld">질문자 이름/표시(선택)</label>
      <input id="by" type="text" placeholder="예: 대학생 김OO (비워도 됩니다)">
      <label class="fld">공개 여부</label>
      <div class="seg" id="seg">
        <button type="button" class="on" data-v="pub" onclick="setVis('pub')">🌐 공개 (사이트에 표시)</button>
        <button type="button" data-v="sec" onclick="setVis('sec')">🔒 비밀 (이 PC에만)</button>
      </div>
      <div style="margin-top:14px"><button class="add" onclick="add()">추가</button></div>
      <div class="note">공개=사이트 ‘질의응답’에 보임 · 비밀=사이트엔 안 보이고 이 PC에만 기록(답장은 이메일로).</div>
    </div>
    <div class="card">
      <h2>📋 목록 <span id="cnt" style="color:var(--soft);font-weight:400"></span></h2>
      <div id="list" class="list"></div>
    </div>
    <div class="card">
      <button id="pubBtn" class="pub" onclick="publish()">💾 게시하기 (공개 항목을 사이트에 반영)</button>
      <div id="status"></div>
      <div class="note">게시하면 공개 항목이 GitHub에 올라가 1~2분 뒤 사이트에 반영됩니다. 비밀 항목은 올라가지 않아요.</div>
    </div>
  </div>
<script>
let items = __ITEMS_JSON__;
let vis = 'pub';
function esc(s){return String(s||"").replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
function today(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function setVis(v){vis=v;document.querySelectorAll('#seg button').forEach(b=>b.classList.toggle('on',b.dataset.v===v));}
function render(){
  const L=document.getElementById('list');L.innerHTML='';
  const p=items.filter(x=>!x.secret).length,s=items.length-p;
  document.getElementById('cnt').textContent=items.length?('· 공개 '+p+' · 비밀 '+s):'';
  if(!items.length){L.innerHTML='<div class="empty">아직 항목이 없습니다. 위에서 추가해 보세요.</div>';return;}
  items.forEach((it,i)=>{
    const d=document.createElement('div');d.className='qa';
    d.innerHTML=`<span class="badge ${it.secret?'sec':'pub'}">${it.secret?'🔒 비밀':'🌐 공개'}</span>
      <div class="q">Q. ${esc(it.q)}</div><div class="a">A. ${esc(it.a)}</div>
      <div class="ops">
        <button class="tgl" onclick="toggle(${i})">${it.secret?'공개로 전환':'비밀로 전환'}</button>
        <button onclick="mv(${i},-1)" ${i===0?'disabled':''}>▲</button>
        <button onclick="mv(${i},1)" ${i===items.length-1?'disabled':''}>▼</button>
        <button class="del" onclick="del(${i})">삭제</button>
      </div>`;
    L.appendChild(d);
  });
}
function add(){
  const q=document.getElementById('q').value.trim(),a=document.getElementById('a').value.trim();
  if(!q||!a){alert('질문과 답변을 모두 입력해 주세요.');return;}
  items.unshift({q,a,by:document.getElementById('by').value.trim(),date:today(),secret:vis==='sec'});
  document.getElementById('q').value='';document.getElementById('a').value='';document.getElementById('by').value='';
  setVis('pub');render();setStatus('info','추가했습니다. 아래 [게시하기]를 눌러야 사이트에 반영돼요.');
}
function toggle(i){items[i].secret=!items[i].secret;render();}
function del(i){if(confirm('삭제할까요?')){items.splice(i,1);render();}}
function mv(i,dir){const j=i+dir;if(j<0||j>=items.length)return;[items[i],items[j]]=[items[j],items[i]];render();}
function setStatus(cls,msg){const s=document.getElementById('status');s.className=cls;s.textContent=msg;}
async function publish(){
  const btn=document.getElementById('pubBtn');btn.disabled=true;setStatus('info','게시 중… 잠시 기다려 주세요.');
  try{const r=await fetch('/publish',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(items)});
    const j=await r.json();setStatus(j.ok?'ok':'err',j.msg);}
  catch(e){setStatus('err','통신 오류: '+e);}
  btn.disabled=false;
}
render();
</script>
</body></html>"""

class H(http.server.BaseHTTPRequestHandler):
    def log_message(self, *a): pass
    def _send(self, code, body, ctype="text/html; charset=utf-8"):
        data = body.encode("utf-8") if isinstance(body, str) else body
        self.send_response(code); self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(data))); self.end_headers(); self.wfile.write(data)
    def do_GET(self):
        if self.path in ("/", "/index.html"):
            self._send(200, PAGE.replace("__ITEMS_JSON__", json.dumps(load_all(), ensure_ascii=False)))
        else:
            self._send(404, "not found")
    def do_POST(self):
        if self.path != "/publish":
            self._send(404, "not found"); return
        try:
            n = int(self.headers.get("Content-Length", 0))
            result = publish(json.loads(self.rfile.read(n).decode("utf-8")))
        except Exception as e:
            result = {"ok": False, "msg": "오류: " + str(e)}
        self._send(200, json.dumps(result, ensure_ascii=False), "application/json; charset=utf-8")

def main():
    port = None
    for p in range(8790, 8810):
        try:
            httpd = socketserver.TCPServer(("127.0.0.1", p), H); port = p; break
        except OSError:
            continue
    if port is None:
        print("사용 가능한 포트를 찾지 못했습니다."); return
    url = "http://127.0.0.1:%d/" % port
    print("\n  질의응답 관리 도구 실행 중:  " + url + "\n  (이 창을 닫으면 종료됩니다.)\n")
    threading.Timer(0.8, lambda: webbrowser.open(url)).start()
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass

if __name__ == "__main__":
    main()
