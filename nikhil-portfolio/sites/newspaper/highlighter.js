/* The Gazette highlighter.
   The pointer becomes a highlighter pen. Select any text and it is marked in yellow; click the
   mark (or the "Read about it" tab) and the Explainer opens: what the terms mean, which story
   the line comes from, and a link to that project's full page.
   Uses the CSS Custom Highlight API when available (marks across element boundaries without
   touching the DOM); otherwise falls back to wrapping text in <mark>. */
(function () {
  var P = window.PORTFOLIO;
  var ROOT = document.querySelector('[data-hl-root]') || document.body;

  /* ---------- glossary: what a reader might highlight ---------- */
  var G = [
    [/\bRAG\b|retrieval[- ]augmented/i, 'RAG', 'Retrieval-augmented generation. Before the model answers, the system searches a knowledge base and puts the most relevant passages into the prompt, so the answer is grounded in real documents instead of the model’s memory.'],
    [/LangGraph/i, 'LangGraph', 'A framework for building LLM agents as a graph: each node is a step or an agent, edges decide what runs next. Nikhil uses it to run several agents in parallel and keep the whole round trip under 5 seconds.'],
    [/LangChain/i, 'LangChain', 'A Python/JS toolkit of building blocks for LLM apps: prompts, retrievers, tool calls and chains.'],
    [/\bMCP\b|Model Context Protocol/i, 'MCP', 'Model Context Protocol: an open standard for giving models tools and context. Here it lets agents share context and call in-house and external tools without custom glue for each one.'],
    [/Pinecone/i, 'Pinecone', 'A managed vector database. Text (or image captions) is turned into embeddings and stored there, so the system can search by meaning rather than exact words.'],
    [/Redis/i, 'Redis', 'An in-memory data store. Used here as a semantic cache: if a new question means the same as one already answered, the stored answer is returned and the LLM is never called.'],
    [/semantic cache|caching/i, 'Semantic cache', 'A cache keyed on meaning instead of exact text: "what are your hours?" and "when are you open?" hit the same entry.'],
    [/Celery/i, 'Celery', 'A Python task queue. Workers pick jobs off a broker and run them in the background, so the web request does not wait.'],
    [/RabbitMQ/i, 'RabbitMQ', 'A message broker. In the API logging platform it holds log events between the Django middleware and the Celery workers.'],
    [/ClickHouse/i, 'ClickHouse', 'A column-oriented database built for fast analytics over huge tables, the sink for every logged API request.'],
    [/Django/i, 'Django', 'A Python web framework. Its middleware sees every request, which is where the logging platform intercepts calls without blocking them.'],
    [/FastAPI/i, 'FastAPI', 'A modern async Python web framework, the backend of the OPD claims platform.'],
    [/Gemini/i, 'Gemini', 'Google’s multimodal LLM. In the OPD project it reads prescriptions and invoices (images and PDFs) into structured claim fields.'],
    [/JinaAI|Jina/i, 'JinaAI', 'A web-reading service that turns pages into clean, LLM-ready text, used to scrape client websites for the ingestion pipeline.'],
    [/\bTD3\b/i, 'TD3', 'Twin Delayed Deep Deterministic policy gradient: a reinforcement-learning algorithm for continuous control, such as setting pump speeds.'],
    [/\bMPC\b|Model Predictive Control/i, 'MPC', 'Model Predictive Control: at every step, predict the system a few moves ahead and pick the best action. Safe and accurate but expensive, so it was used to teach the RL agent.'],
    [/do-mpc/i, 'do-mpc', 'An open-source Python toolbox for MPC, used to generate expert trajectories for pretraining.'],
    [/Kalman/i, 'Kalman filter', 'An estimator that blends noisy sensor readings with a model to give the best guess of the true state in real time.'],
    [/Quadruple Tank|four-tank/i, 'Quadruple Tank System', 'A classic control benchmark: four connected water tanks and two pumps. Coupled and nonlinear, which makes it hard to control well.'],
    [/steady[- ]state error/i, 'Steady-state error', 'How far the system settles from its target once it stops moving. Under 1% means it lands almost exactly where it was asked to.'],
    [/WebRTC/i, 'WebRTC', 'Browser-native real-time audio/video. It carried the live race stream on the F1 club site.'],
    [/MongoDB/i, 'MongoDB', 'A document database, used for race stats and chat on the F1 site.'],
    [/identity resol|orphaned session|match accuracy/i, 'Identity resolution', 'Working out that sessions from different channels belong to the same person. An "orphaned session" is one that could not be linked to anyone; this system leaves none.'],
    [/omnichannel|five channels|cross-channel/i, 'Omnichannel', 'WhatsApp, website chat, Instagram, Messenger and voice treated as one conversation with one customer, not five separate ones.'],
    [/embedding/i, 'Embeddings', 'Lists of numbers that capture the meaning of text, so similar meanings sit close together and can be searched.'],
    [/chunk/i, 'Chunking', 'Splitting documents into pieces small enough to retrieve. Split badly and the answer is cut in half; most RAG quality problems start here.'],
    [/re-?rank/i, 'Re-ranking', 'A second, more careful pass that reorders retrieved passages so the best ones reach the model first.'],
    [/multi-?agent|agentic|agents?\b/i, 'Agents', 'LLM programs that decide what to do next, call tools and hand work to each other, instead of answering in one shot.'],
    [/Chat360/i, 'Chat360', 'The conversational-AI company where Nikhil has worked since June 2025, first as an intern, then as Backend AI Engineer.'],
    [/IIT Jodhpur|IITJ/i, 'IIT Jodhpur', 'Indian Institute of Technology Jodhpur. Nikhil graduated with a B.Tech in Chemical Engineering in May 2025.'],
    [/CodeChef/i, 'CodeChef', 'A competitive-programming platform. Nikhil’s rating is 1520 and his best finish is 43rd globally (Starters 146, Div 3).'],
    [/LeetCode/i, 'LeetCode', 'Coding-interview practice and contests. Contest rating: 1465.'],
    [/Amazon ML/i, 'Amazon ML Summer School', 'A selective Amazon programme (July 2024) covering deep learning, reinforcement learning, generative AI and LLMs, taught by Amazon scientists.'],
    [/Afame/i, 'Afame Technologies', 'Data Analyst internship, Jun–Jul 2024: global COVID-19 analysis and a life-expectancy model accurate to about 95%.'],
    [/\bOPD\b|adjudicat|claim/i, 'OPD claims', 'Outpatient insurance claims: doctor visits, tests, medicines. Adjudication means deciding whether a claim is paid and how much.'],
    [/\bAWS\b|Lambda|S3|DynamoDB|API Gateway/i, 'AWS', 'Amazon Web Services. Lambda runs code without servers, S3 stores files, API Gateway exposes APIs, DynamoDB is a key-value database.'],
    [/Customer Data Platform|\bCDP\b/i, 'Customer Data Platform', 'One profile per customer, assembled from every channel they use. The memory layer sits on top of it.'],
    [/latency|five seconds|<\s?5s|under 5/i, 'Latency', 'Time from the user’s message to the answer. Every hand-off between agents adds to it, so staying under 5 seconds takes caching and parallel execution.'],
    [/Air Force School/i, 'Air Force School, Pune', 'Where Nikhil finished secondary (2019) and higher secondary (2021) school.'],
    [/Python/i, 'Python', 'Nikhil’s main language for backends, agents and ML.'],
  ];

  /* stories: a headline on the page -> the project it is about */
  var STORIES = [
    ['memory', /Memory That Follows You|Omnichannel Memory|One Customer, One Memory/i],
    ['agents', /Orchestration Under Five Seconds|Multi-Agent Orchestration/i],
    ['pdf-vision', /Pictures Now Answer Questions/i],
    ['auto-bot', /Listens To Your Engine/i],
    ['api-logs', /Every API Call, On The Record/i],
    ['ask-ai', /Answers In One Sentence/i],
    ['redis-cache', /Fewer LLM Calls, Faster Replies/i],
    ['opd-claims', /Reads Your Medical Claim/i],
    ['rl-control', /Teaching A Controller/i],
    ['f1-club', /Formula 1 Club Goes Live/i],
  ];
  var HEADS = [];
  function scanHeads() {
    var els = ROOT.querySelectorAll('h1,h2,h3,h4');
    els.forEach(function (el) {
      var t = el.textContent;
      for (var i = 0; i < STORIES.length; i++) if (STORIES[i][1].test(t)) { HEADS.push([el, STORIES[i][0]]); break; }
    });
  }
  function storyFor(node) {
    if (document.body.dataset.story) return document.body.dataset.story;
    var el = node.nodeType === 1 ? node : node.parentElement;
    while (el && el !== ROOT) {
      var ids = {};
      for (var i = 0; i < HEADS.length; i++) if (el.contains(HEADS[i][0])) ids[HEADS[i][1]] = 1;
      var k = Object.keys(ids);
      if (k.length === 1) return k[0];
      if (k.length > 1) return null;
      el = el.parentElement;
    }
    return null;
  }

  /* ---------- styles ---------- */
  var pen = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><g transform="rotate(45 16 16)"><rect x="11" y="2" width="10" height="17" rx="2" fill="#161412"/><rect x="11" y="6" width="10" height="3" fill="#ffe14d"/><path d="M11 19h10l-2 5h-6z" fill="#3a352e"/><path d="M13.2 24h5.6l-1.2 5h-3.2z" fill="#ffe14d" stroke="#161412" stroke-width=".8"/></g></svg>');
  var css = document.createElement('style');
  css.textContent = [
    '[data-hl-root], [data-hl-root] * { cursor: url("' + pen + '") 6 27, text; }',
    '[data-hl-root] a, [data-hl-root] a *, [data-hl-root] button, [data-hl-root] [data-go] { cursor: pointer; }',
    '[data-hl-root] ::selection { background: rgba(255, 225, 77, .75); color: inherit; }',
    '::highlight(gazette) { background-color: rgba(255, 221, 51, .62); color: inherit; }',
    'mark.gz-hl { background: linear-gradient(104deg, rgba(255,221,51,0) 0.6%, rgba(255,221,51,.7) 2.4%, rgba(255,226,77,.55) 96%, rgba(255,221,51,0) 99%); color: inherit; padding: 0 1px; border-radius: 2px; cursor: pointer; }',
    '[data-go] { cursor: pointer; } [data-go]:hover { color: #a8281c; }',
    '.gz-tab { position: fixed; z-index: 60; display: none; align-items: center; gap: 8px; padding: 7px 12px 7px 10px; background: #161412; color: #f1ece1; border: 0; font: 500 11px/1 "IBM Plex Mono", monospace; letter-spacing: .12em; text-transform: uppercase; box-shadow: 3px 3px 0 #ffd84a; cursor: pointer; transform-origin: 0 100%; }',
    '.gz-tab.on { display: inline-flex; animation: gzpop .25s cubic-bezier(.2,1.4,.4,1); }',
    '.gz-tab i { width: 9px; height: 9px; background: #ffd84a; transform: rotate(45deg); }',
    '@keyframes gzpop { from { transform: scale(.6); opacity: 0; } }',
    '.gz-bar { position: fixed; left: 16px; bottom: 16px; z-index: 55; display: flex; align-items: center; gap: 12px; padding: 9px 14px; background: #f1ece1; color: #161412; border: 1px solid #161412; box-shadow: 4px 4px 0 #161412; font: 500 11px/1.2 "IBM Plex Mono", monospace; letter-spacing: .1em; text-transform: uppercase; }',
    '.gz-bar b { display: inline-block; width: 22px; height: 10px; background: #ffd84a; border: 1px solid #161412; transform: skewX(-12deg); }',
    '.gz-bar button { all: unset; cursor: pointer; text-decoration: underline; text-underline-offset: 3px; }',
    '.gz-bar button[hidden] { display: none; }',
    '.gz-veil { position: fixed; inset: 0; z-index: 70; background: rgba(22,20,18,.35); opacity: 0; pointer-events: none; transition: opacity .3s; }',
    '.gz-veil.on { opacity: 1; pointer-events: auto; }',
    '.gz-panel { position: fixed; top: 0; right: 0; bottom: 0; z-index: 71; width: min(440px, 100vw); background: #f6f1e5; color: #161412; border-left: 1px solid #161412; box-shadow: -18px 0 40px rgba(0,0,0,.18); transform: translateX(105%); transition: transform .45s cubic-bezier(.2,.8,.2,1); display: flex; flex-direction: column; font-family: "Newsreader", Georgia, serif; }',
    '.gz-panel.on { transform: none; }',
    '.gz-panel header { padding: 18px 22px 14px; border-bottom: 4px double #161412; display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }',
    '.gz-panel .ed { font: 500 10.5px/1.4 "IBM Plex Mono", monospace; letter-spacing: .16em; text-transform: uppercase; color: #a8281c; }',
    '.gz-panel h2 { margin: 4px 0 0; font: 700 30px/1 "Old Standard TT", Georgia, serif; }',
    '.gz-panel .x { all: unset; cursor: pointer; width: 34px; height: 34px; display: grid; place-items: center; border: 1px solid #161412; flex: none; }',
    '.gz-panel .x:focus-visible { outline: 2px solid #a8281c; outline-offset: 2px; }',
    '.gz-body { overflow: auto; padding: 20px 22px 28px; }',
    '.gz-quote { margin: 0 0 20px; padding: 12px 14px; font: italic 400 19px/1.4 "Newsreader", Georgia, serif; background: linear-gradient(104deg, rgba(255,221,51,0) .6%, rgba(255,221,51,.55) 2.4%, rgba(255,226,77,.4) 96%, rgba(255,221,51,0) 99%); border-left: 3px solid #161412; }',
    '.gz-h { margin: 22px 0 8px; font: 500 10.5px/1 "IBM Plex Mono", monospace; letter-spacing: .18em; text-transform: uppercase; display: flex; align-items: center; gap: 10px; }',
    '.gz-h::after { content: ""; flex: 1; height: 1px; background: #161412; }',
    '.gz-term { padding: 10px 0 12px; border-bottom: 1px dotted #8a8274; }',
    '.gz-term dt { font: 700 18px/1.2 "Old Standard TT", Georgia, serif; }',
    '.gz-term dd { margin: 4px 0 0; font-size: 16px; line-height: 1.5; }',
    '.gz-story { display: block; padding: 14px; border: 1px solid #161412; margin-top: 4px; }',
    '.gz-story small { font: 500 10px/1 "IBM Plex Mono", monospace; letter-spacing: .14em; text-transform: uppercase; color: #5a5348; }',
    '.gz-story strong { display: block; margin: 6px 0; font: 700 21px/1.15 "Old Standard TT", Georgia, serif; }',
    '.gz-story p { margin: 0 0 10px; font-size: 15.5px; line-height: 1.45; }',
    '.gz-story span { font: 500 11px/1 "IBM Plex Mono", monospace; letter-spacing: .12em; text-transform: uppercase; border-bottom: 1px solid; }',
    '.gz-story:hover strong { color: #a8281c; }',
    '.gz-none { font-size: 16px; line-height: 1.5; color: #3a352e; }',
    '.gz-ask { display: inline-block; margin-top: 18px; font: 500 11px/1 "IBM Plex Mono", monospace; letter-spacing: .12em; text-transform: uppercase; padding: 11px 14px; background: #161412; color: #f1ece1 !important; }',
    '@media (max-width: 600px) { .gz-bar { left: 10px; bottom: 10px; padding: 7px 10px; font-size: 10px; gap: 8px; } .gz-bar b { width: 16px; } }',
    '@media (prefers-reduced-motion: reduce) { .gz-panel, .gz-veil { transition: none; } .gz-tab.on { animation: none; } }',
  ].join('\n');
  document.head.appendChild(css);

  /* ---------- UI ---------- */
  var tab = el('button', 'gz-tab', '<i></i>Read about it');
  tab.type = 'button';
  var bar = el('div', 'gz-bar', '<b></b><span class="gz-n">Highlighter on: select any text</span><button type="button" hidden>Clear</button>');
  var veil = el('div', 'gz-veil', '');
  var panel = el('aside', 'gz-panel', '<header><div><div class="ed">The Explainer</div><h2>In other words</h2></div><button class="x" type="button" aria-label="Close the explainer"><svg width="14" height="14" viewBox="0 0 14 14"><path d="M1 1l12 12M13 1L1 13" stroke="#161412" stroke-width="1.6"/></svg></button></header><div class="gz-body"></div>');
  panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'true'); panel.setAttribute('aria-label', 'The Explainer');
  [tab, bar, veil, panel].forEach(function (n) { document.body.appendChild(n); });
  var clearBtn = bar.querySelector('button'), countEl = bar.querySelector('.gz-n'), body = panel.querySelector('.gz-body');
  function el(tag, cls, html) { var n = document.createElement(tag); n.className = cls; n.innerHTML = html; return n; }

  var useAPI = !!(window.CSS && CSS.highlights && window.Highlight);
  var hl = useAPI ? new Highlight() : null;
  if (useAPI) CSS.highlights.set('gazette', hl);
  var marks = [];       // [{range, text, story, nodes?}]
  var pending = null;   // the mark the tab points at

  function inRoot(n) { return n && ROOT.contains(n.nodeType === 1 ? n : n.parentNode) && !panel.contains(n) && !bar.contains(n); }

  function addMark(range) {
    var text = range.toString().replace(/\s+/g, ' ').trim();
    if (text.length < 2 || text.length > 600) return null;
    var m = { text: text, story: storyFor(range.commonAncestorContainer), range: range.cloneRange() };
    if (useAPI) hl.add(m.range);
    else {
      try { var mk = document.createElement('mark'); mk.className = 'gz-hl'; range.surroundContents(mk); m.node = mk; m.range = document.createRange(); m.range.selectNodeContents(mk); }
      catch (e) { m.node = null; } // spans several elements: keep the selection colour only
    }
    marks.push(m);
    sync();
    return m;
  }
  function sync() {
    countEl.textContent = marks.length ? marks.length + (marks.length === 1 ? ' mark' : ' marks') + ': click one to read about it' : 'Highlighter on: select any text';
    clearBtn.hidden = !marks.length;
  }
  clearBtn.addEventListener('click', function () {
    if (useAPI) hl.clear();
    marks.forEach(function (m) { if (m.node && m.node.parentNode) { var p = m.node.parentNode; while (m.node.firstChild) p.insertBefore(m.node.firstChild, m.node); p.removeChild(m.node); p.normalize(); } });
    marks = []; hideTab(); sync();
  });

  function showTab(m) {
    pending = m;
    var rects = m.range.getClientRects(); var r = rects[rects.length - 1] || m.range.getBoundingClientRect();
    var x = Math.min(window.innerWidth - 150, Math.max(8, r.right + 6)), y = r.top - 34;
    if (y < 8) y = r.bottom + 8;
    tab.style.left = x + 'px'; tab.style.top = y + 'px';
    tab.classList.remove('on'); void tab.offsetWidth; tab.classList.add('on');
  }
  function hideTab() { tab.classList.remove('on'); pending = null; }
  tab.addEventListener('mousedown', function (e) { e.preventDefault(); });
  tab.addEventListener('click', function () { if (pending) open(pending); });

  // grow a partial selection to whole words, the way a highlighter stroke would cover them
  function snap(r) {
    var W = /[\w\u00C0-\u024F'\u2019%-]/;
    if (r.startContainer.nodeType === 3) { var a = r.startContainer.data, i = r.startOffset; while (i > 0 && W.test(a[i - 1])) i--; r.setStart(r.startContainer, i); }
    if (r.endContainer.nodeType === 3) { var b = r.endContainer.data, j = r.endOffset; while (j < b.length && W.test(b[j])) j++; r.setEnd(r.endContainer, j); }
    return r;
  }
  function finishSelection() {
    var sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.rangeCount) return;
    var r = snap(sel.getRangeAt(0).cloneRange());
    if (!inRoot(r.startContainer) || !inRoot(r.endContainer)) return;
    var m = addMark(r);
    if (!m) return;
    sel.removeAllRanges();
    showTab(m);
  }
  document.addEventListener('mouseup', function (e) {
    if (e.button !== 0 || panel.contains(e.target) || tab.contains(e.target) || bar.contains(e.target)) return;
    setTimeout(finishSelection, 0);
  });
  // touch: long-press selection settles through selectionchange
  var st;
  document.addEventListener('selectionchange', function () {
    if (!matchMedia('(pointer: coarse)').matches) return;
    clearTimeout(st); st = setTimeout(finishSelection, 700);
  });
  document.addEventListener('keyup', function (e) { if (e.shiftKey && /Arrow/.test(e.key)) setTimeout(finishSelection, 0); });

  // clicking on an existing mark opens it
  function markAt(x, y) {
    var pos = document.caretRangeFromPoint ? document.caretRangeFromPoint(x, y) : (document.caretPositionFromPoint ? (function (p) { if (!p) return null; var r = document.createRange(); r.setStart(p.offsetNode, p.offset); return r; })(document.caretPositionFromPoint(x, y)) : null);
    if (!pos) return null;
    for (var i = marks.length - 1; i >= 0; i--) {
      try { if (marks[i].range.isPointInRange(pos.startContainer, pos.startOffset)) return marks[i]; } catch (e) {}
    }
    return null;
  }
  document.addEventListener('click', function (e) {
    if (panel.contains(e.target) || tab.contains(e.target) || bar.contains(e.target)) return;
    var s = window.getSelection(); if (s && !s.isCollapsed) return;
    var m = markAt(e.clientX, e.clientY);
    if (m) { e.preventDefault(); open(m); return; }
    var go = e.target.closest && e.target.closest('[data-go]');
    if (go) { location.href = go.getAttribute('data-go'); return; }
    if (!tab.contains(e.target)) hideTab();
  }, true);
  window.addEventListener('scroll', function () { if (pending) showTab(pending); }, { passive: true });

  /* ---------- the Explainer ---------- */
  var lastFocus = null;
  function esc(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function open(m) {
    hideTab();
    var found = [], seen = {};
    var hay = m.text;
    // look a little wider than the selection if it was a fragment of a word or a short phrase
    for (var i = 0; i < G.length && found.length < 4; i++) if (G[i][0].test(hay) && !seen[G[i][1]]) { seen[G[i][1]] = 1; found.push(G[i]); }
    var html = '<blockquote class="gz-quote">“' + esc(m.text.length > 220 ? m.text.slice(0, 217) + '…' : m.text) + '”</blockquote>';
    if (found.length) {
      html += '<div class="gz-h">Terms in your mark</div><dl>' + found.map(function (g) { return '<div class="gz-term"><dt>' + g[1] + '</dt><dd>' + esc(g[2]) + '</dd></div>'; }).join('') + '</dl>';
    }
    var p = m.story && P ? P.byId(m.story) : null;
    if (p) {
      html += '<div class="gz-h">From the story</div><a class="gz-story" href="' + projectHref(p.id) + '"><small>' + esc(p.org) + ' · ' + esc(p.period) + '</small><strong>' + esc(p.title) + '</strong><p>' + esc(p.dek) + '</p><span>Read the full story →</span></a>';
    }
    if (!found.length && !p) {
      html += '<p class="gz-none">The Explainer has no entry for that line yet. Here is what the Gazette is about:</p>' + (P ? '<a class="gz-story" href="' + aboutHref() + '"><small>Page 2 · The Long Read</small><strong>' + esc(P.about.headline) + '</strong><p>' + esc(P.about.paras[0].slice(0, 160)) + '…</p><span>Read about Nikhil →</span></a>' : '');
    }
    html += '<a class="gz-ask" href="mailto:nikhil385713@gmail.com?subject=' + encodeURIComponent('Question from the Gazette') + '&body=' + encodeURIComponent('You wrote: "' + m.text.slice(0, 300) + '"\n\n') + '">Ask Nikhil about this</a>';
    body.innerHTML = html;
    body.scrollTop = 0;
    lastFocus = document.activeElement;
    veil.classList.add('on'); panel.classList.add('on');
    panel.querySelector('.x').focus({ preventScroll: true });
  }
  function close() { veil.classList.remove('on'); panel.classList.remove('on'); if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true }); }
  veil.addEventListener('click', close);
  panel.querySelector('.x').addEventListener('click', close);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && panel.classList.contains('on')) close(); });

  var base = document.body.dataset.base || '';
  function projectHref(id) { return base + 'project.html?id=' + id; }
  function aboutHref() { return base + 'about.html'; }

  scanHeads();
  // headlines also work as plain links to their full story
  HEADS.forEach(function (h) { if (!h[0].closest('a')) h[0].setAttribute('data-go', projectHref(h[1])); });
  window.GazetteHighlighter = { marks: marks, open: open };
})();
