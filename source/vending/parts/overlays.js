// P02 + detail — overlays that open from the machine: the project detail (from a tray
// can) and the four receipts the keypad prints.
const S = require('./shelf.js');
const { F } = require('../lib');

const mono = "'Share Tech Mono','DejaVu Sans Mono',monospace";

/** Project detail dialog. The can flies in from the tray (GSAP Flip) and stands on the left. */
function projectModal(p, { W = 1440, H = 900 } = {}) {
  const pal = S.PAL[p.color];
  const cw = 1100;
  const ch = 640;
  const x = (W - cw) / 2;
  const y = (H - ch) / 2;
  const canSvg = `<svg width="380" height="560" viewBox="0 0 380 560" style="display:block;">${S.defs('md')}<ellipse cx="190" cy="500" rx="150" ry="22" fill="#000" opacity=".5"/>${S.can(p, 190, 500, 'md', 2.1)}</svg>`;
  const row = (k, v) => `<div style="display:flex;justify-content:space-between;gap:16px;padding:7px 0;border-top:1px solid #141018;font:600 16px/1.2 ${F.ui};"><span style="font-weight:700;letter-spacing:.08em;">${k}</span><span style="text-align:right;">${v}</span></div>`;
  return `<div style="position:absolute;inset:0;background:rgba(6,4,9,.72);backdrop-filter:blur(3px);"></div>
<div role="dialog" aria-labelledby="pd-title" style="position:absolute;left:${x}px;top:${y}px;width:${cw}px;height:${ch}px;border-radius:24px;overflow:hidden;background:linear-gradient(135deg,#1d1724,#110d16);box-shadow:0 40px 120px rgba(0,0,0,.75), 0 0 0 1px rgba(255,255,255,.06);display:flex;">
<div style="position:relative;width:420px;flex:none;background:radial-gradient(ellipse at 50% 55%,${pal.b}66,${pal.b}10 55%,transparent 75%);display:flex;align-items:flex-end;justify-content:center;padding-bottom:24px;">
<div style="position:absolute;left:28px;top:28px;font:400 15px/1 ${F.disp};color:${pal.l};letter-spacing:.06em;">SLOT ${p.code}</div>
${canSvg}
</div>
<div style="flex:1;padding:44px 48px 40px 20px;display:flex;flex-direction:column;gap:16px;min-width:0;">
<div style="display:flex;justify-content:space-between;align-items:flex-start;">
<span style="display:inline-block;padding:6px 14px;border-radius:14px;background:${pal.b};color:#141018;font:700 13px/1 ${F.ui};letter-spacing:.14em;">${p.cat}</span>
<button type="button" aria-label="Put the can back" style="all:unset;width:44px;height:44px;border-radius:50%;background:#2a2530;color:#f5efdf;display:flex;align-items:center;justify-content:center;cursor:pointer;"><svg width="18" height="18" viewBox="0 0 24 24" style="fill:none;stroke:currentColor;stroke-width:2.4;stroke-linecap:round;"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg></button>
</div>
<h2 id="pd-title" style="margin:0;font:400 46px/1 ${F.disp};color:#f5efdf;">${p.name}</h2>
<p style="margin:0;font:500 20px/1.4 ${F.ui};color:#cfc8d8;max-width:560px;">[One-line summary: what the project does and who it is for.]</p>
<div style="background:#f6efdc;color:#141018;border-radius:6px;padding:14px 18px 10px;max-width:560px;box-shadow:inset 0 0 0 2px #141018;">
<div style="font:400 22px/1 ${F.disp};">WHAT'S INSIDE</div>
<div style="height:7px;background:#141018;margin:8px 0 2px;"></div>
${row('MY ROLE', '[Your role]')}${row('YEAR', '[Year]')}${row('MADE WITH', '[Tech · Tech · Tech]')}${row('STATUS', '[Live / Shipped / Archived]')}
<div style="height:4px;background:#141018;margin-top:4px;"></div>
<div style="font:600 12px/1.4 ${F.ui};padding-top:6px;color:#3a3440;">[One line of result: a number, an outcome, or who uses it.]</div>
</div>
<div style="display:flex;gap:14px;margin-top:auto;">
<a href="#" style="display:inline-flex;align-items:center;height:50px;padding:0 24px;border-radius:25px;background:#ffd21f;color:#141018;font:700 16px/1 ${F.ui};letter-spacing:.12em;text-decoration:none;box-shadow:0 0 20px rgba(255,210,31,.35);">OPEN LIVE PROJECT</a>
<a href="#" style="display:inline-flex;align-items:center;height:50px;padding:0 24px;border-radius:25px;border:2px solid #f5efdf;color:#f5efdf;font:700 16px/1 ${F.ui};letter-spacing:.12em;text-decoration:none;box-sizing:border-box;">VIEW SOURCE</a>
<button type="button" style="all:unset;display:inline-flex;align-items:center;height:50px;padding:0 18px;color:#8b8593;font:700 15px/1 ${F.ui};letter-spacing:.12em;cursor:pointer;">PUT IT BACK</button>
</div>
</div>
</div>`;
}

/** A thermal-paper receipt (HTML). kind: about | skills | resume | contact */
function receipt(kind, { w = 340 } = {}) {
  const line = (t = '', extra = '') => `<div style="font:400 14px/20px ${mono};color:#2a2420;white-space:pre;${extra}">${t}</div>`;
  const rule = (c = '-') => line(c.repeat(32), 'overflow:hidden;');
  const hdr = `${line('      NIKHIL MFG. CO.', 'font-weight:700;')}${line('   MODEL 2026 · 12 SLOT')}${rule()}`;
  const foot = `${rule()}${line('   THANK YOU. COME AGAIN.')}<div style="height:34px;margin:10px 0 2px;background:repeating-linear-gradient(90deg,#2a2420 0 2px,transparent 2px 4px,#2a2420 4px 5px,transparent 5px 8px,#2a2420 8px 11px,transparent 11px 12px);"></div>`;
  let body = '';
  if (kind === 'about') {
    body = `${line('ABOUT ME', 'font-weight:700;font-size:16px;')}${line()}${line('NIKHIL KUMAR')}${line('AI & Backend Engineer.')}${line('Python backends and the LLM')}${line('systems on top: RAG, multi-')}${line('agent orchestration, AWS.')}${line()}${line('CURRENTLY  Chat360')}${line('ROLE       Backend AI Eng.')}${line('EDUCATION  IIT Jodhpur, 2025')}${line('CODECHEF   Global rank 43')}`;
  } else if (kind === 'resume') {
    body = `${line('RESUME', 'font-weight:700;font-size:16px;')}${line()}${line('AUG25-NOW  Backend AI Eng.')}${line('           Chat360')}${line('JUN-AUG25  Backend AI Intern')}${line('           Chat360')}${line('JUL 2024   Amazon ML')}${line('           Summer School')}${line('JUN-JUL24  Data Analyst Intern')}${line('           Afame Technologies')}${line()}${line('EDUCATION  B.Tech Chem. Eng.')}${line('           IIT Jodhpur, 2025')}${line()}<a href="#" data-todo="resume-pdf" style="display:block;text-align:center;margin:6px 0;padding:10px;border:2px dashed #2a2420;font:700 14px/1 ${mono};color:#2a2420;text-decoration:none;">DOWNLOAD PDF</a>`;
  } else if (kind === 'contact') {
    body = `${line('CONTACT', 'font-weight:700;font-size:16px;')}${line()}${line('EMAIL')}<a href="mailto:nikhil385713@gmail.com" style="display:block;font:700 14px/20px ${mono};color:#2a2420;">nikhil385713@gmail.com</a>${line()}<a href="#" data-todo="linkedin-url" style="display:block;font:400 14px/20px ${mono};color:#2a2420;">LINKEDIN  Nikhil Kumar</a><a href="#" data-todo="github-url" style="display:block;font:400 14px/20px ${mono};color:#2a2420;">GITHUB    [handle]</a>${line()}${line('OPEN TO   AI / backend roles')}`;
  }
  if (kind === 'skills') {
    // nutrition-facts label instead of a receipt
    const r = (k, v, bold) => `<div style="display:flex;justify-content:space-between;gap:10px;border-top:${bold ? '1px solid #141018' : '0'};padding:${bold ? '5px 0 2px' : '0 0 5px'};font:${bold ? 700 : 500} ${bold ? 15 : 13.5}px/1.25 ${F.ui};"><span>${k}</span><span style="font-weight:700;flex:none;">${v}</span></div>`;
    return `<div style="width:${w}px;background:#fff;color:#141018;padding:12px 14px;border:2px solid #141018;box-sizing:border-box;font-family:${F.ui};">
<div style="font:800 34px/1 'Barlow Condensed','Arial Narrow',sans-serif;letter-spacing:-.5px;">Skill Facts</div>
<div style="font:500 14px/1.3 ${F.ui};border-bottom:1px solid #141018;padding-bottom:4px;">Serving size: 1 AI &amp; backend engineer</div>
<div style="height:10px;background:#141018;margin:4px 0;"></div>
<div style="display:flex;justify-content:space-between;align-items:flex-end;font:800 16px/1 ${F.ui};padding:2px 0 4px;"><span>Amount per serving</span><span>Tools</span></div>
<div style="height:5px;background:#141018;"></div>
${r('Languages', '6', true)}${r('&#160;&#160;Python, C++, SQL, JavaScript, Bash, Matlab', '')}${r('Backend', '5', true)}${r('&#160;&#160;Django REST, FastAPI, Node.js, Celery, RabbitMQ', '')}${r('AI / LLM', '8', true)}${r('&#160;&#160;LangGraph, LangChain, MCP, RAG, Pinecone, Hugging Face, PyTorch, TensorFlow', '')}${r('Databases', '6', true)}${r('&#160;&#160;PostgreSQL, MongoDB, Redis, Elasticsearch, ClickHouse, Firebase', '')}${r('Cloud &amp; DevOps', '3', true)}${r('&#160;&#160;AWS (Lambda, S3, API Gateway, DynamoDB), Docker, Git', '')}
<div style="height:10px;background:#141018;margin-top:4px;"></div>
<div style="font:500 12px/1.35 ${F.ui};padding-top:6px;">Also contains: React, Tailwind, HTML/CSS. Competitive programming: CodeChef 1520, LeetCode 1465.</div>
</div>`;
  }
  // thermal paper: warm white, serrated top edge, slight curl shading
  return `<div style="position:relative;width:${w}px;padding:20px 20px 16px;box-sizing:border-box;background:linear-gradient(90deg,#e8e0cc,#fbf7ec 12%,#f8f3e6 85%,#ddd4bf);box-shadow:0 20px 50px rgba(0,0,0,.55);-webkit-mask:linear-gradient(#000,#000) 0 10px/100% calc(100% - 10px) no-repeat, conic-gradient(from -45deg at bottom,#0000,#000 1deg 89deg,#0000 90deg) 0 0/14px 10px repeat-x;mask:linear-gradient(#000,#000) 0 10px/100% calc(100% - 10px) no-repeat, conic-gradient(from -45deg at bottom,#0000,#000 1deg 89deg,#0000 90deg) 0 0/14px 10px repeat-x;">${hdr}${body}${foot}</div>`;
}

module.exports = { projectModal, receipt };
