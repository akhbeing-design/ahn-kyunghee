/* ============================================================
   안경희 소개 웹사이트 — 렌더링 & 챗봇
   내용은 data.js, 디자인은 styles.css.
   ============================================================ */
(function () {
  "use strict";
  const P = window.PROFILE || (typeof PROFILE !== "undefined" ? PROFILE : null);
  if (!P) { console.error("PROFILE 데이터를 찾을 수 없습니다. data.js 로드를 확인하세요."); return; }
  const $ = (id) => document.getElementById(id);
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  /* ---------- 헤더/브랜드 ---------- */
  const MARK = '<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect x="2.5" y="2.5" width="35" height="35" rx="9" fill="none" stroke="currentColor" stroke-width="2"/><polyline points="9,28 17,21 23,25 31,12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="31" cy="12" r="3.2" fill="currentColor"/></svg>';
  // 세련된 라인아트 인물 아바타 (실제 얼굴 아님)
  const AVATAR = '<svg viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M18 238 C18 176 52 154 80 148 L100 176 L120 148 C148 154 182 176 182 238 Z" fill="rgba(203,176,122,0.10)" stroke="#cbb07a" stroke-width="2.4" stroke-linejoin="round"/>' +
    '<path d="M80 148 L100 176 L120 148" fill="none" stroke="#cbb07a" stroke-width="2.4" stroke-linejoin="round"/>' +
    '<path d="M95 176 L105 176 L109 210 L100 224 L91 210 Z" fill="#b6924f" opacity="0.9"/>' +
    '<path d="M88 150 L90 126 M112 150 L110 126" stroke="#cbb07a" stroke-width="2.4" fill="none"/>' +
    '<ellipse cx="100" cy="94" rx="33" ry="39" fill="rgba(203,176,122,0.08)" stroke="#cbb07a" stroke-width="2.6"/>' +
    '<path d="M66 92 C64 52 86 43 100 43 C114 43 136 52 134 92 C133 76 120 64 100 64 C80 64 67 76 66 92 Z" fill="#b6924f" opacity="0.55"/>' +
    '</svg>';
  $("brandName").textContent = P.name;
  $("brandSub").textContent = P.nameEn.toUpperCase();
  $("heroName").firstChild.textContent = P.name;
  $("heroEn").textContent = P.nameEn.toUpperCase();
  $("heroRole").textContent = P.title;
  $("heroTag").textContent = P.tagline;
  $("footName").textContent = P.name;
  $("footName").nextElementSibling.textContent = P.title;
  P.credentials.forEach((c) => $("heroChips").appendChild(el("span", "chip", esc(c))));

  const portrait = $("portrait");
  if (P.portrait) {
    const img = el("img"); img.src = P.portrait; img.alt = P.name; portrait.appendChild(img);
    $("portraitCap").textContent = P.name + " · " + P.title;
  } else {
    const m = el("div", "avatar"); m.innerHTML = AVATAR; portrait.appendChild(m);
    $("portraitCap").textContent = P.name + " · " + P.title;
  }

  /* ---------- 신뢰 지표 ---------- */
  P.stats.forEach((s) => {
    const box = el("div", "stat");
    box.appendChild(el("div", "num", esc(s.value) + (s.unit ? '<span class="u">' + esc(s.unit) + "</span>" : "")));
    box.appendChild(el("div", "lbl", esc(s.label)));
    $("stats").appendChild(box);
  });

  /* ---------- 소개 ---------- */
  $("introText").textContent = P.intro;
  P.currentRoles.forEach((r) => {
    const parts = r.split(" (");
    const li = el("li");
    li.innerHTML = "<b>" + esc(parts[0]) + "</b>" + (parts[1] ? " (" + esc(parts[1]) : "");
    $("currentRoles").appendChild(li);
  });

  /* ---------- 전문성 ---------- */
  P.specialties.forEach((s) => {
    const card = el("div", "exp-card");
    card.appendChild(el("div", "ic", esc(s.icon)));
    card.appendChild(el("h3", null, esc(s.name)));
    card.appendChild(el("p", null, esc(s.desc)));
    $("expGrid").appendChild(card);
  });

  /* ---------- 경력 타임라인 ---------- */
  P.career.forEach((c) => {
    const item = el("div", "tl-item" + (c.highlight ? " hl" : ""));
    item.appendChild(el("div", "tl-period", esc(c.period)));
    item.appendChild(el("div", "tl-org", esc(c.org)));
    if (c.role) item.appendChild(el("div", "tl-role", esc(c.role)));
    $("timeline").appendChild(item);
  });

  /* ---------- 학력 ---------- */
  P.education.forEach((e) => {
    const card = el("div", "edu-card");
    card.appendChild(el("div", "p", esc(e.period)));
    card.appendChild(el("div", "s", esc(e.school)));
    card.appendChild(el("div", "d", esc(e.detail)));
    $("eduGrid").appendChild(card);
  });

  /* ---------- 저서 ---------- */
  const b = P.book;
  const cover = $("cover");
  if (b.cover) {
    const img = el("img"); img.src = b.cover; img.alt = b.title; cover.appendChild(img);
  } else {
    cover.appendChild(el("div", "c-pub", esc(b.publisher) + " · " + esc(b.date)));
    const t = el("div");
    t.appendChild(el("div", "c-title", esc(b.title)));
    t.appendChild(el("div", "c-rule"));
    t.appendChild(el("div", "c-author", esc(P.name) + " 지음"));
    cover.appendChild(t);
  }
  // 표지 아래 작은 아이콘 → 본문 PDF 숨은 다운로드
  {
    const dl = $("pdfDl");
    if (dl) {
      if (b.pdf) {
        const PIN = String(b.downloadPin || "1111");   // 다운로드 비밀번호(data.js book.downloadPin 로 변경 가능)
        dl.addEventListener("click", () => {
          const pw = prompt("본문 PDF 다운로드 — 비밀번호 4자리를 입력하세요.");
          if (pw === null) return;                      // 취소
          if (pw.trim() !== PIN) { alert("비밀번호가 올바르지 않습니다."); return; }
          const a = el("a");
          a.href = encodeURI(b.pdf);
          a.download = "깨진유리창과 시장의 배신 - 본문.pdf";
          document.body.appendChild(a); a.click(); a.remove();
        });
      } else { dl.style.display = "none"; }
    }
  }
  $("bookCatch").textContent = "“" + b.catchphrase + "”";
  $("bookDesc").textContent = b.description;
  $("bookMeta").innerHTML =
    "<div>출판 <b>" + esc(b.publisher) + "</b></div>" +
    "<div>출간 <b>" + esc(b.date) + "</b></div>" +
    "<div>구성 <b>" + b.chapters.length + "개 장</b></div>";
  b.chapters.forEach((ch, ci) => {
    const hasSub = ch.sections && ch.sections.length;
    const item = el("div", "acc-item" + (hasSub ? "" : " empty"));
    item.id = "chap" + ci;
    const head = el("button", "acc-head");
    head.innerHTML = esc(ch.title) + (hasSub ? '<span class="plus">+</span>' : "");
    const body = el("div", "acc-body");
    if (hasSub) {
      const ul = el("ul");
      ch.sections.forEach((s) => {
        const li = el("li");
        if (s.file) {
          const a = el("a", "toc-link");
          a.href = encodeURI(s.file);
          a.textContent = s.t;
          li.appendChild(a);
        } else {
          li.textContent = s.t || s;
        }
        ul.appendChild(li);
      });
      body.appendChild(ul);
      head.addEventListener("click", () => {
        const open = item.classList.toggle("open");
        body.style.maxHeight = open ? body.scrollHeight + "px" : "0";
      });
    }
    item.appendChild(head); item.appendChild(body);
    $("toc").appendChild(item);
  });

  // 칼럼에서 '목차로 돌아가기'로 오면 해당 장을 펼치고 그 위치로 이동
  function openChapFromHash() {
    const m = (location.hash || "").match(/^#chap(\d+)$/);
    if (!m) return;
    const item = document.getElementById("chap" + m[1]);
    if (!item) return;
    const body = item.querySelector(".acc-body");
    if (body && !item.classList.contains("open")) {
      item.classList.add("open");
      body.style.maxHeight = body.scrollHeight + "px";
    }
    setTimeout(() => item.scrollIntoView({ block: "start" }), 60);
  }
  window.addEventListener("hashchange", openChapFromHash);
  openChapFromHash();

  /* ---------- 추천사 ---------- */
  P.endorsements.forEach((q, i) => {
    const card = el("div", "qcard" + (i === 0 ? " featured" : ""));
    card.appendChild(el("div", "qt", esc(q.quote)));
    const by = el("div", "qby");
    by.appendChild(el("div", "n", esc(q.name)));
    by.appendChild(el("div", "t", esc(q.title)));
    card.appendChild(by);
    $("quotes").appendChild(card);
  });

  /* ---------- 강의 · 연구 ---------- */
  P.teaching.schools.forEach((s) => $("schools").appendChild(el("span", null, esc(s))));
  P.teaching.subjects.forEach((s) => { const tag = el("span", null, esc(s.name)); tag.title = s.desc; $("subjects").appendChild(tag); });
  P.research.forEach((r) => {
    const p = el("div", "paper");
    p.appendChild(el("div", "pt", esc(r.title)));
    p.appendChild(el("div", "pv", esc(r.venue)));
    if (r.note) p.appendChild(el("div", "pn", "🏆 " + esc(r.note)));
    $("papers").appendChild(p);
  });
  P.external.forEach((x) => $("external").appendChild(el("li", null, esc(x))));

  /* ---------- 안박사의 경제스터디 (안경스) — 유튜브/동영상 + 추가 UI ---------- */
  if (P.study && $("studyGrid")) {
    const S = P.study;
    $("studyTitle").textContent = S.title + " (" + S.short + ")";
    $("studyDesc").textContent = S.desc;
    if (S.channelUrl) {
      const a = el("a", "btn btn-gold"); a.href = S.channelUrl; a.target = "_blank"; a.rel = "noopener"; a.textContent = "▶ 유튜브 채널 바로가기";
      $("studyChannel").appendChild(a);
    }
    const grid = $("studyGrid");
    const ytid = (u) => { if (!u) return null; const m = String(u).match(/(?:youtu\.be\/|[?&]v=|shorts\/|embed\/|live\/)([A-Za-z0-9_-]{11})/); return m ? m[1] : (/^[A-Za-z0-9_-]{11}$/.test(u) ? u : null); };

    // 게시된 영상 = data.js(study.videos) + videos.js(window.STUDY_VIDEOS).
    // videos.js 는 '안경스_관리' 로컬 도구가 갱신해서 GitHub에 올린다 → 데스크탑·모바일 모두 반영.
    const published = [].concat(S.videos || [], window.STUDY_VIDEOS || []);

    // 영상 크게 보기(라이트박스)
    const lb = $("lightbox"), lbInner = $("lbInner");
    function closeLB() { if (!lb) return; lb.hidden = true; lbInner.innerHTML = ""; }
    function openLB(node) { if (!lb) return; lbInner.innerHTML = ""; lbInner.appendChild(node); lb.hidden = false; }
    if (lb) {
      $("lbClose").addEventListener("click", closeLB);
      lb.addEventListener("click", (e) => { if (e.target === lb) closeLB(); });
      window.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLB(); });
    }
    function playYT(id) {
      const ifr = el("iframe");
      ifr.src = "https://www.youtube.com/embed/" + id + "?autoplay=1";
      ifr.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      ifr.setAttribute("allowfullscreen", "");
      openLB(ifr);
    }
    function playFile(src) {
      const v = el("video"); v.src = src; v.controls = true; v.autoplay = true; openLB(v);
    }
    function ytCard(id, title) {
      const card = el("div", "yt-card");
      const thumb = el("div", "yt-thumb");
      thumb.style.backgroundImage = "url('https://img.youtube.com/vi/" + id + "/hqdefault.jpg')";
      thumb.appendChild(el("div", "yt-play", "▶"));
      thumb.addEventListener("click", () => playYT(id));
      card.appendChild(thumb);
      if (title) card.appendChild(el("div", "yt-title", esc(title)));
      return card;
    }
    function fileCard(src, title) {
      const card = el("div", "yt-card");
      const thumb = el("div", "yt-thumb file");
      const pv = el("video"); pv.src = src; pv.preload = "metadata"; pv.muted = true; pv.playsInline = true; thumb.appendChild(pv);
      thumb.appendChild(el("div", "yt-play", "▶"));
      thumb.addEventListener("click", () => playFile(src));
      card.appendChild(thumb);
      card.appendChild(el("div", "yt-title", esc(title || "동영상")));
      return card;
    }
    const seen = new Set();
    published.forEach((v) => {
      if (v.file) { grid.appendChild(fileCard(v.file, v.title)); return; }   // 사이트에 올린 파일
      const id = ytid(v.url || v.id);                                        // 유튜브
      if (id && !seen.has(id)) { seen.add(id); grid.appendChild(ytCard(id, v.title)); }
    });
    if (!grid.children.length) grid.appendChild(el("div", "study-empty", '아직 등록된 영상이 없습니다. <b>안경스_관리</b> 도구에서 영상을 추가·게시하면 여기에 표시됩니다.'));
  }

  /* ---------- 내비게이션 스크롤 효과 ---------- */
  const nav = $("nav");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 40);
  window.addEventListener("scroll", onScroll); onScroll();

  /* ---------- 모바일 햄버거 메뉴 ---------- */
  const navToggle = $("navToggle"), navlinks = $("navlinks");
  if (navToggle && navlinks) {
    const closeMenu = () => { nav.classList.remove("menu-open"); navToggle.setAttribute("aria-expanded", "false"); };
    navToggle.addEventListener("click", () => {
      const open = nav.classList.toggle("menu-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    navlinks.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));
  }

  /* ---------- 진입 애니메이션 ---------- */
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach((r) => io.observe(r));

  /* ============================================================
     챗봇 (규칙 기반) — 예시 Q&A + 자유질문 + 관리자 직접답변/학습
     ============================================================ */
  const bullets = (arr) => arr.map((x) => "• " + x).join("\n");
  const norm = (s) => String(s).toLowerCase().replace(/[\s?!.,·‘’“”'"()]/g, "");

  // 관리자가 입력한 답변·받은 질문을 브라우저에 저장(로컬). file://에서 막히면 메모리로 대체.
  const Store = {
    mem: {},
    get(k) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return this.mem[k] || null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { this.mem[k] = v; } }
  };
  const LEARNED = "akh_learned", PENDING = "akh_pending";
  const getLearned = () => Store.get(LEARNED) || {};
  const getPending = () => Store.get(PENDING) || [];

  // ── 섹션(구조) 답변 ──
  function specialtyList() {
    return { text: "제 전문 분야예요. 눌러보시면 자세히 설명해 드릴게요. 👇", chips: P.specialties.map((s) => ["🔹 " + s.name, "spec::" + s.name]) };
  }
  function subjectList() {
    return { text: "여러 대학에서 이런 과목을 가르쳐요. 눌러보시면 어떤 내용인지 알려드려요. 👇\n\n강의한 학교: " + P.teaching.schools.join(", "), chips: P.teaching.subjects.map((s) => ["📘 " + s.name, "subj::" + s.name]) };
  }
  function bookAnswer() {
    let t = "📖 『" + b.title + "』 (" + b.publisher + ", " + b.date + ")\n\n" + b.description + "\n\n[ 목차 ]";
    b.chapters.forEach((ch) => { t += "\n\n▸ " + ch.title + (ch.sections && ch.sections.length ? "\n   " + ch.sections.slice(0, 3).map((s) => s.t || s).join(" · ") + (ch.sections.length > 3 ? " 외" : "") : ""); });
    t += "\n\n자세한 목차·설명은 위쪽 ‘저서’ 섹션에서 볼 수 있어요.";
    return { text: t, chips: qaChips(5) };
  }
  function careerAnswer() {
    return { text: "주요 경력을 시간 순으로 정리하면 다음과 같아요.\n\n" + P.career.map((c) => "• " + c.period + "  " + c.org + (c.role ? "\n   " + c.role : "")).join("\n"), chips: qaChips(5) };
  }

  // 예시 질문 칩 (n개)
  const qaChips = (n) => P.qa.slice(0, n == null ? P.qa.length : n).map((item, i) => [item.q, "qa::" + i]);
  const MENU = [["🎯 전문분야", "specialty"], ["💼 경력", "career"], ["📖 저서", "book"], ["📚 강의", "teaching"], ["📝 논문", "research"], ["🏅 추천사", "endorse"]];

  function respond(intent) {
    if (intent.indexOf("qa::") === 0) { const item = P.qa[+intent.slice(4)]; return item ? { text: item.a, chips: qaChips(6) } : null; }
    if (intent.indexOf("spec::") === 0) { const s = P.specialties.find((x) => x.name === intent.slice(6)); return s ? { text: "🔹 " + s.name + "\n\n" + s.desc, chips: specialtyList().chips } : null; }
    if (intent.indexOf("subj::") === 0) { const s = P.teaching.subjects.find((x) => x.name === intent.slice(6)); return s ? { text: "📘 " + s.name + "\n\n" + s.desc, chips: subjectList().chips } : null; }
    switch (intent) {
      case "intro": return { text: P.intro, chips: qaChips(6) };
      case "specialty": return specialtyList();
      case "career": return careerAnswer();
      case "education": return { text: "학력은 다음과 같아요.\n\n" + P.education.map((e) => "• " + e.period + "  " + e.school + " — " + e.detail).join("\n"), chips: qaChips(5) };
      case "teaching": return subjectList();
      case "book": return bookAnswer();
      case "research": return { text: "주요 논문·연구예요.\n\n" + P.research.map((r) => "• " + r.title + " (" + r.venue + ")" + (r.note ? " 🏆 " + r.note : "")).join("\n"), chips: qaChips(5) };
      case "endorse": return { text: "이 책과 저를 이렇게 평가해 주셨어요.\n\n" + P.endorsements.map((q) => "“" + q.quote.slice(0, 55) + "…”\n— " + q.name).join("\n\n"), chips: qaChips(5) };
      case "study": { const n = ((P.study && P.study.videos ? P.study.videos.length : 0) + (window.STUDY_VIDEOS ? window.STUDY_VIDEOS.length : 0)); return { text: (P.study ? P.study.title + "(" + P.study.short + ") — " + P.study.desc : "경제스터디") + (n ? "\n\n위쪽 ‘안경스’ 섹션에서 영상을 보실 수 있어요." : "\n\n곧 영상이 올라올 예정이에요. 위쪽 ‘안경스’ 섹션을 확인해 주세요."), chips: qaChips(5) }; }
      case "browse": return { text: "어떤 주제가 궁금하세요? 아래에서 골라보셔도 좋아요.", chips: MENU };
      case "admin": return adminList();
      case "adminClear": Store.set(PENDING, []); return { text: "받은 질문을 모두 비웠어요. 🗑", chips: qaChips(4) };
    }
    return null;
  }

  // 자유 입력 → 답 찾기 (학습답변 → 예시Q&A → 섹션 순)
  function answerFor(text) {
    const n = norm(text);
    const learned = getLearned();
    for (const k in learned) { if (k && (n.indexOf(k) >= 0 || k.indexOf(n) >= 0)) return { text: learned[k] + "\n\n(안경희 님이 직접 남긴 답변이에요.)", chips: qaChips(6) }; }
    // 예시 Q&A 매칭: 태그(+3), 질문 완전일치(+10)/부분일치(+6)
    let best = null, bestScore = 0;
    P.qa.forEach((item, i) => {
      let score = 0;
      (item.tags || []).forEach((t) => { if (n.indexOf(norm(t)) >= 0) score += 3; });
      const nq = norm(item.q);
      if (n === nq) score += 10;
      else if (n.indexOf(nq) >= 0 || nq.indexOf(n) >= 0) score += 6;
      if (score > bestScore) { bestScore = score; best = i; }
    });
    if (best != null && bestScore >= 3) return { text: P.qa[best].a, chips: qaChips(6) };
    // 섹션 키워드 (최후 보조)
    const intent = matchIntent(text);
    if (intent) return respond(intent);
    return null;
  }

  const KEYWORDS = [
    [["전문", "분야", "강점", "특기"], "specialty"],
    [["논문", "연구", "학술", "학회", "수상"], "research"],
    [["책", "저서", "목차", "유리창"], "book"],
    [["추천", "서평", "평가받"], "endorse"],
    [["유튜브", "영상", "동영상", "경제스터디", "안경스", "스터디"], "study"],
    [["강의", "강사", "가르", "수업", "과목", "교수"], "teaching"],
    [["경력", "이력", "커리어", "직장 생활", "한신평"], "career"],
    [["학력", "졸업", "박사", "석사", "학사", "전공"], "education"],
    [["소개", "누구", "어떤 사람", "자기소개", "안녕"], "intro"]
  ];
  function matchIntent(text) { const t = text.toLowerCase(); for (const [kws, intent] of KEYWORDS) if (kws.some((k) => t.indexOf(k.toLowerCase()) >= 0)) return intent; return null; }

  // 관리자: 받은(미답변) 질문 목록
  function adminList() {
    const p = getPending();
    if (!p.length) return { text: "받은(미답변) 질문이 없어요. 🙂", chips: qaChips(4) };
    const chips = p.map((it, i) => ["✍️ " + it.q.slice(0, 18) + (it.q.length > 18 ? "…" : ""), "ownerAnswer::" + encodeURIComponent(it.q)]);
    chips.push(["🗑 전체 비우기", "adminClear"]);
    return { text: "받은 질문 " + p.length + "개예요. 답변할 질문을 누르세요.\n(질문을 누르면 답변 입력·삭제를 할 수 있어요.)", chips: chips };
  }

  const cleanLabel = (s) => s.replace(/^[^가-힣a-zA-Z0-9]+\s*/, "");
  const FALLBACK_INTRO = "안경희 박사가 직접 답변해 드립니다. 잠시만 기다려 주세요 — 빠른 시간 안에 답변드리겠습니다. 🙏";

  const Chat = {
    seeded: false,
    open() { $("chatbox").classList.add("open"); $("cbtn").classList.add("open"); if (!this.seeded) this.seed(); setTimeout(() => $("chatText").focus(), 250); },
    close() { $("chatbox").classList.remove("open"); $("cbtn").classList.remove("open"); },
    toggle() { $("chatbox").classList.contains("open") ? this.close() : this.open(); },
    seed() { this.seeded = true; this.reset(); },
    clear() { $("chatLog").innerHTML = ""; },
    // 소개 챗봇: 소개멘트 + 예시 질문을 '항상 맨 위'에 표시
    reset() {
      this.clear();
      $("chatLog").appendChild(el("div", "msg intro", "안녕하세요, " + esc(P.name) + " 소개 챗봇입니다. 아래 질문을 눌러보거나 자유롭게 물어보세요. 😊"));
      const row = el("div", "chips-row");
      qaChips(10).forEach(([label, intent]) => { const b = el("button", null, esc(label)); b.addEventListener("click", () => Chat.pick(label, intent)); row.appendChild(b); });
      $("chatLog").appendChild(row);
      this.toTop();
    },
    toTop() { $("chatLog").scrollTop = 0; },
    scroll() { $("chatLog").scrollTop = 0; },   // 항상 소개멘트가 맨 위에 오도록
    user(t) { $("chatLog").appendChild(el("div", "msg user", esc(t))); },
    keepChips(intent, chips) {  // 하위 탐색(전문분야·강의) 버튼만 답변에 유지
      if (intent && (intent === "specialty" || intent === "teaching" || intent.indexOf("spec::") === 0 || intent.indexOf("subj::") === 0)) return chips;
      if (chips && chips.length && /^(spec|subj)::/.test(chips[0][1] || "")) return chips;
      return null;
    },
    bot(text, chips) {
      const m = el("div", "msg bot");
      m.innerHTML = esc(text).replace(/\n/g, "<br>");
      $("chatLog").appendChild(m);
      if (chips && chips.length) {
        const row = el("div", "chips-row");
        chips.forEach(([label, intent]) => { const btn = el("button", null, esc(label)); btn.addEventListener("click", () => Chat.pick(label, intent)); row.appendChild(btn); });
        $("chatLog").appendChild(row);
      }
      this.scroll();
    },
    pick(label, intent) {
      if (intent.indexOf("ownerAnswer::") === 0) { this.showOwnerInput(decodeURIComponent(intent.slice(13))); return; }
      if (intent.indexOf("forward::") === 0) { this.showForward(decodeURIComponent(intent.slice(9))); return; }
      this.reset();                    // 소개멘트+질문 맨 위 유지, 이전 Q&A는 정리
      this.user(cleanLabel(label));
      const r = respond(intent) || { text: FALLBACK_INTRO, chips: null };
      setTimeout(() => this.bot(r.text, this.keepChips(intent, r.chips)), 180);
    },
    send() {
      const i = $("chatText"); const t = i.value.trim(); if (!t) return;
      i.value = "";
      this.reset();
      this.user(t);
      if (["관리자", "받은 질문", "미답변", "대기질문", "대기 질문"].some((k) => t.indexOf(k) >= 0)) { const r = adminList(); setTimeout(() => this.bot(r.text, r.chips), 180); return; }
      const ans = answerFor(t);
      if (ans) { setTimeout(() => this.bot(ans.text, this.keepChips(null, ans.chips)), 220); }
      else { this.fallbackFlow(t); }
    },
    fallbackFlow(q) {
      // 질문을 '받은 질문함'에 저장(이 브라우저 내). 실제 전달은 아래 이메일 버튼으로.
      const p = getPending(); if (!p.some((it) => it.q === q)) { p.push({ q: q, ts: Date.now() }); Store.set(PENDING, p); }
      const chips = [];
      if (P.ownerFormKey || P.ownerEmail) chips.push(["✉️ 안경희 박사에게 질문 전달", "forward::" + encodeURIComponent(q)]);
      chips.push(["🔎 다른 질문 보기", "browse"]);
      chips.push(["✍️ (주인) 직접 답변 입력", "ownerAnswer::" + encodeURIComponent(q)]);
      setTimeout(() => this.bot(FALLBACK_INTRO, chips), 280);
    },
    showOwnerInput(q) {
      const wrap = el("div", "msg bot");
      wrap.innerHTML = "<b>주인 직접 답변</b><br>질문: “" + esc(q) + "”";
      const box = el("div", "owner-box");
      const ta = el("textarea"); ta.placeholder = "이 질문에 대한 답변을 입력하세요…";
      const actions = el("div", "ob-actions");
      const del = el("button", "ghost", "🗑 질문 삭제");
      const cancel = el("button", "ghost", "취소");
      const save = el("button", null, "답변 저장");
      actions.appendChild(del); actions.appendChild(cancel); actions.appendChild(save);
      box.appendChild(ta); box.appendChild(actions);
      wrap.appendChild(box);
      $("chatLog").appendChild(wrap);
      wrap.scrollIntoView({ block: "nearest" });   // 입력창이 보이도록
      setTimeout(() => ta.focus(), 100);
      cancel.addEventListener("click", () => { wrap.remove(); });
      del.addEventListener("click", () => {
        Store.set(PENDING, getPending().filter((it) => it.q !== q));   // 받은 질문함에서 삭제
        wrap.remove();
        this.bot("질문을 삭제했어요. 🗑", null);
        const r = adminList(); this.bot(r.text, r.chips);
      });
      save.addEventListener("click", () => {
        const ans = ta.value.trim(); if (!ans) { ta.focus(); return; }
        // 학습: 다음에 같은 질문엔 자동 응답
        const learned = getLearned(); learned[norm(q)] = ans; Store.set(LEARNED, learned);
        // 받은 질문함에서 제거
        Store.set(PENDING, getPending().filter((it) => it.q !== q));
        box.remove();
        wrap.innerHTML = "<b>주인 직접 답변</b><br>질문: “" + esc(q) + "”";
        this.bot(ans + "\n\n(안경희 님이 직접 남긴 답변이에요.)", null);
        this.bot("답변을 저장했어요. 앞으로 같은 질문에는 이 답변이 자동으로 표시됩니다. ✅", qaChips(4));
      });
    },
    // 방문자 → 안경희 박사에게 질문 전달 (공개/개인 선택 + 이메일)
    showForward(q) {
      let mode = "public";
      const wrap = el("div", "msg bot");
      wrap.innerHTML = "<b>안경희 박사에게 질문 전달</b><br>질문: “" + esc(q) + "”";
      const box = el("div", "owner-box");
      const modeRow = el("div", "ob-mode");
      const pubBtn = el("button", "obm on", "🌐 공개 답변"); pubBtn.type = "button";
      const secBtn = el("button", "obm", "🔒 개인 답변"); secBtn.type = "button";
      modeRow.appendChild(pubBtn); modeRow.appendChild(secBtn);
      const em = el("input"); em.type = "email"; em.placeholder = "답변받을 이메일 (공개는 선택)";
      const help = el("div", "ob-help", "공개 답변은 ‘질의응답’ 섹션에 올라옵니다.");
      const setMode = (m) => {
        mode = m;
        pubBtn.classList.toggle("on", m === "public"); secBtn.classList.toggle("on", m === "private");
        em.placeholder = m === "private" ? "답변받을 이메일 (개인은 필수)" : "답변받을 이메일 (공개는 선택)";
        help.textContent = m === "private" ? "개인 답변은 이메일로만 보내드려요. 이메일을 꼭 입력해 주세요." : "공개 답변은 ‘질의응답’ 섹션에 올라옵니다.";
      };
      pubBtn.addEventListener("click", () => setMode("public"));
      secBtn.addEventListener("click", () => setMode("private"));
      const actions = el("div", "ob-actions");
      const cancel = el("button", "ghost", "취소");
      const send = el("button", null, "✉️ 보내기");
      actions.appendChild(cancel); actions.appendChild(send);
      box.appendChild(modeRow); box.appendChild(em); box.appendChild(help); box.appendChild(actions);
      wrap.appendChild(box);
      $("chatLog").appendChild(wrap);
      wrap.scrollIntoView({ block: "nearest" });
      setTimeout(() => em.focus(), 100);
      cancel.addEventListener("click", () => { wrap.remove(); });
      send.addEventListener("click", async () => {
        const email = em.value.trim();
        if (mode === "private" && !email) { em.focus(); this.bot("개인 답변을 받으시려면 이메일을 꼭 입력해 주세요. (또는 ‘공개 답변’을 선택하세요)", null); return; }
        if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { em.focus(); this.bot("이메일 형식을 확인해 주세요.", null); return; }
        send.disabled = true; send.textContent = "보내는 중…";
        const ok = await this.sendQuestion(q, email, mode);
        box.remove();
        if (ok === "mail") { this.bot("메일 앱을 열었어요. 전송 버튼을 눌러야 전달됩니다. ✉️", qaChips(4)); }
        else if (ok) {
          this.bot(mode === "private"
            ? "질문이 전달되었어요! 남겨주신 이메일(" + esc(email) + ")로 답변드리겠습니다. 🙏"
            : "질문이 전달되었어요! 답변은 ‘질의응답’ 섹션에 공개로 올라옵니다. 잠시 후 확인해 주세요. 🙏", qaChips(4));
        }
        else { this.bot("전송에 실패했어요. 잠시 후 다시 시도해 주세요.", qaChips(4)); }
      });
    },
    async sendQuestion(q, email, mode) {
      const kind = mode === "private" ? "개인 답변(이메일 회신)" : "공개 답변(사이트 게시)";
      const tag = mode === "private" ? "[개인]" : "[공개]";
      if (P.ownerFormKey) {   // web3forms: 서버가 이메일로 전송(이메일 주소 비공개)
        try {
          const res = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Accept": "application/json" },
            body: JSON.stringify({
              access_key: P.ownerFormKey,
              subject: "[안경희 소개 챗봇] " + tag + " 방문자 질문",
              from_name: "안경희 소개 챗봇",
              "질문": q,
              "답변 방식": kind,
              "답변받을 이메일": email || "(미입력)"
            })
          });
          const j = await res.json();
          return !!j.success;
        } catch (e) { return false; }
      }
      if (P.ownerEmail) {     // 폴백: 방문자 메일 앱 열기
        const body = encodeURIComponent("질문:\n" + q + "\n\n답변 방식: " + kind + "\n답변받을 이메일: " + (email || "(미입력)"));
        window.location.href = "mailto:" + P.ownerEmail + "?subject=" + encodeURIComponent("[소개 챗봇] " + tag + " 방문자 질문") + "&body=" + body;
        return "mail";
      }
      return false;
    }
  };
  window.Chat = Chat;

  /* ---------- 질의응답 게시판 (Firebase Firestore) ---------- */
  (function qnaBoard() {
    const listEl = $("qnaList"), pagerEl = $("qnaPager"), msgEl = $("qnaMsg"),
          adminEl = $("qnaAdmin"), adminBtn = $("qnaAdminBtn"), adminState = $("qnaAdminState");
    if (!listEl) return;
    const cfg = window.FIREBASE_CONFIG, OWNER = window.OWNER_EMAIL;
    if (!cfg || !window.firebase) {
      listEl.appendChild(el("div", "qna-empty", "게시판을 준비 중입니다. 잠시 후 다시 확인해 주세요."));
      return;
    }
    try { firebase.initializeApp(cfg); } catch (e) {}
    const db = firebase.firestore(), auth = firebase.auth();
    const COL = () => db.collection("questions");
    const PER = 10;
    let page = 0, published = [], pending = [], isOwner = false;

    const fmt = (ts) => { try { const d = ts && ts.toDate ? ts.toDate() : null; return d ? d.getFullYear() + "." + (d.getMonth() + 1) + "." + d.getDate() : ""; } catch (e) { return ""; } };
    const secOf = (ts) => (ts && ts.seconds) ? ts.seconds : 0;

    // ── 주인 편집 도구 (질문/답변 수정, 삭제) ──
    function editText(displayEl, current, onSave, rows) {
      const ta = el("textarea", "qna-ans"); ta.value = current; if (rows) ta.rows = rows;
      const ops = el("div", "qna-ops");
      const save = el("button", null, "저장"); const cancel = el("button", "ghost", "취소");
      ops.appendChild(save); ops.appendChild(cancel);
      const box = el("div"); box.appendChild(ta); box.appendChild(ops);
      const prev = displayEl;
      const placeholder = el("div"); prev.replaceWith(placeholder); placeholder.replaceWith(box);
      setTimeout(() => ta.focus(), 50);
      cancel.addEventListener("click", () => box.replaceWith(prev));
      save.addEventListener("click", async () => {
        const v = ta.value.trim(); if (!v) { ta.focus(); return; }
        save.disabled = true; save.textContent = "저장 중…";
        try { await onSave(v); await reloadAll(); }
        catch (e) { save.disabled = false; save.textContent = "저장"; alert("저장 실패: " + (e.code || e.message)); }
      });
    }
    function delButton(id) {
      const b = el("button", "ghost", "삭제");
      let armed = false;
      b.addEventListener("click", async () => {
        if (!armed) { armed = true; b.textContent = "정말 삭제? (한 번 더)"; b.classList.add("danger"); setTimeout(() => { if (armed) { armed = false; b.textContent = "삭제"; b.classList.remove("danger"); } }, 3500); return; }
        b.disabled = true; b.textContent = "삭제 중…";
        try { await COL().doc(id).delete(); await reloadAll(); }
        catch (e) { b.disabled = false; b.textContent = "삭제"; b.classList.remove("danger"); armed = false; alert("삭제 실패: " + (e.code || e.message)); }
      });
      return b;
    }
    function ownerOps(it, qEl, aEl) {
      const ops = el("div", "qna-ops");
      const eq = el("button", "ghost", "질문 수정"); eq.addEventListener("click", () => editText(qEl, it.q, (v) => COL().doc(it.id).update({ q: v })));
      ops.appendChild(eq);
      if (aEl) { const ea = el("button", "ghost", "답변 수정"); ea.addEventListener("click", () => editText(aEl, it.answer, (v) => COL().doc(it.id).update({ answer: v }), 3)); ops.appendChild(ea); }
      ops.appendChild(delButton(it.id));
      return ops;
    }

    function renderBoard() {
      listEl.innerHTML = "";
      if (!published.length) { listEl.appendChild(el("div", "qna-empty", "아직 공개된 질의응답이 없습니다. 위에서 첫 질문을 남겨보세요. 🙂")); pagerEl.innerHTML = ""; return; }
      const pages = Math.ceil(published.length / PER);
      if (page > pages - 1) page = pages - 1;
      published.slice(page * PER, page * PER + PER).forEach((it) => {
        const card = el("div", "qna-item");
        const q = el("div", "qna-q"); q.innerHTML = "<b>Q.</b> " + esc(it.q) + (it.name ? " <span class=\"qna-by\">— " + esc(it.name) + "</span>" : "");
        const a = el("div", "qna-a"); a.innerHTML = "<b>A.</b> " + esc(it.answer).replace(/\n/g, "<br>");
        if (it.answeredAt) a.appendChild(el("div", "qna-date", fmt(it.answeredAt)));
        card.appendChild(q); card.appendChild(a);
        if (isOwner) card.appendChild(ownerOps(it, q, a));
        listEl.appendChild(card);
      });
      renderPager(pages);
    }

    function renderPager(pages) {
      pagerEl.innerHTML = "";
      if (pages <= 1) return;
      const go = (p) => { page = Math.max(0, Math.min(pages - 1, p)); renderBoard(); document.getElementById("qna").scrollIntoView({ block: "start" }); };
      const btn = (label, p, dis, cur) => { const b = el("button", "qp" + (cur ? " cur" : ""), label); if (dis) b.disabled = true; else b.addEventListener("click", () => go(p)); pagerEl.appendChild(b); };
      btn("« 처음", 0, page === 0);
      btn("‹ 이전", page - 1, page === 0);
      const WIN = 10, start = Math.floor(page / WIN) * WIN, end = Math.min(pages, start + WIN);
      for (let i = start; i < end; i++) btn(String(i + 1), i, false, i === page);
      btn("다음 ›", page + 1, page === pages - 1);
      btn("끝 »", pages - 1, page === pages - 1);
    }

    function renderAdmin() {
      if (!adminEl) return;
      adminEl.innerHTML = "";
      if (!isOwner) return;
      adminEl.appendChild(el("div", "qna-admin-title", "🔒 답변 대기 질문 " + pending.length + "개"));
      if (!pending.length) { adminEl.appendChild(el("div", "qna-empty", "대기 중인 질문이 없습니다.")); return; }
      pending.forEach((it) => {
        const card = el("div", "qna-item pending");
        const q = el("div", "qna-q"); q.innerHTML = "<b>Q.</b> " + esc(it.q) + (it.name ? " <span class=\"qna-by\">— " + esc(it.name) + "</span>" : "");
        card.appendChild(q);
        if (it.email) card.appendChild(el("div", "qna-mailto", "📧 " + esc(it.email)));
        const ta = el("textarea", "qna-ans"); ta.placeholder = "답변을 입력하세요… (게시하면 게시판에 공개됩니다)";
        const ops = el("div", "qna-ops");
        const pub = el("button", null, "게시(공개)");
        const eq = el("button", "ghost", "질문 수정"); eq.addEventListener("click", () => editText(q, it.q, (v) => COL().doc(it.id).update({ q: v })));
        ops.appendChild(pub); ops.appendChild(eq); ops.appendChild(delButton(it.id));
        card.appendChild(ta); card.appendChild(ops);
        pub.addEventListener("click", async () => {
          const v = ta.value.trim(); if (!v) { ta.focus(); return; }
          pub.disabled = true; pub.textContent = "게시 중…";
          try {
            await COL().doc(it.id).update({ answer: v, status: "published", answeredAt: firebase.firestore.FieldValue.serverTimestamp(), email: firebase.firestore.FieldValue.delete() });
            await reloadAll();
          } catch (e) { pub.disabled = false; pub.textContent = "게시(공개)"; alert("게시 실패: " + (e.code || e.message)); }
        });
        adminEl.appendChild(card);
      });
    }

    async function loadPublished() {
      const snap = await COL().where("status", "==", "published").get();
      published = snap.docs.map((d) => Object.assign({ id: d.id }, d.data())).sort((a, b) => secOf(b.answeredAt) - secOf(a.answeredAt));
    }
    async function loadPending() {
      if (!isOwner) { pending = []; return; }
      const snap = await COL().where("status", "==", "pending").get();
      pending = snap.docs.map((d) => Object.assign({ id: d.id }, d.data())).sort((a, b) => secOf(b.createdAt) - secOf(a.createdAt));
    }
    async function reloadAll() { await loadPublished(); await loadPending(); renderAdmin(); renderBoard(); }

    loadPublished().then(renderBoard).catch((e) => { listEl.innerHTML = ""; listEl.appendChild(el("div", "qna-empty", "게시판을 불러오지 못했습니다. 잠시 후 새로고침해 주세요.")); console.warn(e); });

    // 질문 등록
    const sendBtn = $("qnaSend");
    if (sendBtn) sendBtn.addEventListener("click", async () => {
      const q = $("qnaQ").value.trim(), name = $("qnaName").value.trim(), email = $("qnaEmail").value.trim();
      if (!q) { $("qnaQ").focus(); return; }
      if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { msgEl.className = "qna-msg err"; msgEl.textContent = "이메일 형식을 확인해 주세요."; return; }
      sendBtn.disabled = true; const o = sendBtn.textContent; sendBtn.textContent = "등록 중…";
      try {
        await COL().add({ q: q, name: name, email: email, answer: "", status: "pending", createdAt: firebase.firestore.FieldValue.serverTimestamp() });
        if (P.ownerFormKey) { // 새 질문 알림 이메일(선택)
          fetch("https://api.web3forms.com/submit", { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify({ access_key: P.ownerFormKey, subject: "[안경희 질의응답] 새 질문이 등록되었습니다", from_name: "질의응답 게시판", "질문": q, "이름": name || "(익명)", "연락 이메일": email || "(미입력)" }) }).catch(() => {});
        }
        msgEl.className = "qna-msg ok"; msgEl.textContent = "질문이 등록되었어요! 답변이 완료되면 이 게시판에 공개됩니다. 🙏";
        $("qnaQ").value = ""; $("qnaName").value = ""; $("qnaEmail").value = "";
      } catch (e) { msgEl.className = "qna-msg err"; msgEl.textContent = "등록에 실패했어요. 잠시 후 다시 시도해 주세요."; console.warn(e); }
      sendBtn.disabled = false; sendBtn.textContent = o;
    });

    // 관리자 로그인/로그아웃
    async function ownerSignIn() {
      const provider = new firebase.auth.GoogleAuthProvider();
      try {
        await auth.signInWithPopup(provider);
      } catch (e) {
        if (e.code === "auth/popup-blocked" || e.code === "auth/cancelled-popup-request" || e.code === "auth/operation-not-supported-in-this-environment") {
          try { await auth.signInWithRedirect(provider); return; } catch (e2) { showLoginErr(e2); return; }
        }
        showLoginErr(e);
      }
    }
    function showLoginErr(e) {
      let m = e.code || e.message || "알 수 없는 오류";
      if (e.code === "auth/unauthorized-domain") m = "이 사이트 도메인이 Firebase에 등록되지 않았어요 → 승인된 도메인에 'akhbeing-design.github.io' 추가가 필요합니다.";
      else if (e.code === "auth/popup-blocked") m = "브라우저가 팝업을 막았어요. 팝업을 허용하고 다시 시도해 주세요.";
      else if (e.code === "auth/popup-closed-by-user") m = "로그인 창이 닫혔어요. 다시 시도해 주세요.";
      if (adminState) adminState.textContent = "로그인 실패: " + m;
      console.warn("[qna login]", e);
    }
    if (adminBtn) adminBtn.addEventListener("click", async () => {
      if (auth.currentUser) { await auth.signOut(); return; }
      if (adminState) adminState.textContent = "로그인 창을 여는 중…";
      ownerSignIn();
    });
    auth.getRedirectResult().catch(showLoginErr);   // 리다이렉트 로그인 결과 처리
    auth.onAuthStateChanged(async (user) => {
      isOwner = !!(user && user.email === OWNER);
      if (adminState) adminState.textContent = user ? (isOwner ? "관리자 모드: " + user.email : "권한 없음 (" + user.email + ")") : "";
      if (adminBtn) adminBtn.textContent = user ? "로그아웃" : "🔑 관리자";
      try { await loadPending(); } catch (e) { pending = []; }
      renderAdmin(); renderBoard();
    });
  })();

  $("cbtn").addEventListener("click", () => Chat.toggle());
  $("chatSend").addEventListener("click", () => Chat.send());
  $("chatText").addEventListener("keydown", (e) => { if (e.key === "Enter") Chat.send(); });
})();
