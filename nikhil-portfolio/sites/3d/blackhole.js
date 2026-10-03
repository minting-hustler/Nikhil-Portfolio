/* First page of the 3D design: Nikhil drawn in stars, with a black hole above his head that keeps
   pulling stars off him. Scroll to feed it; press and hold to pull harder; move the pointer over him
   to scatter stars. Stars that fall in come back after a while, slower the hungrier the hole is.

   Rendering: star pixels are written straight into an ImageData buffer (fast for ~15k stars), then
   the hole, its accretion disk and the falling streaks are drawn on top with canvas 2D.
   GSAP drives the intro (the hole forms, then stars stream out of it to their places). */
(function () {
  var cv = document.getElementById('bh');
  if (!cv || !window.NIKHIL_STARS) return;
  var ctx = cv.getContext('2d');
  var pin = cv.parentElement;
  var space = document.getElementById('space');
  var counter = document.getElementById('bhCount');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DPR = Math.min(window.devicePixelRatio || 1, 2);

  var cells = [], cols = 0, rows = 0;
  var W = 0, H = 0, BW = 0, BH = 0, imgData = null, buf = null;
  var stars = [], order = [], bg = [], disk = [], caps = [];
  var S = { hunger: 0.12, scrollT: 0.12, hold: 0, intro: reduce ? 1 : 0, grow: reduce ? 1 : 0, R: 20, hx: 0, hy: 0, flash: 0, eaten: 0 };
  var pointer = { x: -1e4, y: -1e4, on: false };
  var mobile = false, running = true, looping = false, last = 0, acc = 0, fc = 0;

  var src = new Image();
  src.onload = function () {
    var c = document.createElement('canvas');
    cols = c.width = src.width; rows = c.height = src.height;
    var o = c.getContext('2d'); o.drawImage(src, 0, 0);
    var d = o.getImageData(0, 0, cols, rows).data;
    for (var y = 0; y < rows; y++) for (var x = 0; x < cols; x++) {
      var i = (y * cols + x) * 4;
      if (d[i + 3] < 128) continue;
      var r = d[i], g = d[i + 1], b = d[i + 2];
      var lum = (r * 0.3 + g * 0.59 + b * 0.11) / 255;
      // lift the darks (sunglasses, shoes) so they still read as faint stars on black
      var k = 1.15, f = 30 + 44 * (1 - lum);
      cells.push({ gx: x, gy: y, r: Math.min(255, r * k + f), g: Math.min(255, g * k + f), b: Math.min(255, b * k + f + 8), lum: lum });
    }
    layout();
    start();
  };
  src.src = window.NIKHIL_STARS;

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  function layout() {
    W = Math.max(1, pin.clientWidth); H = Math.max(1, pin.clientHeight);
    BW = cv.width = Math.round(W * DPR); BH = cv.height = Math.round(H * DPR);
    imgData = ctx.createImageData(BW, BH);
    buf = new Uint32Array(imgData.data.buffer);
    mobile = W < 760;

    var figH = mobile ? H * 0.64 : H * 0.76;
    var cell = figH / rows;
    var figW = cols * cell;
    var cx = mobile ? W * 0.5 : W * 0.7;
    var left = cx - figW / 2;
    var top = mobile ? H * 0.22 : H - figH - H * 0.03;
    S.R = Math.min(W, H) * (mobile ? 0.052 : 0.042);
    S.hx = left + figW * 0.6;               // his head sits right of centre in the photo
    S.hy = Math.max(S.R * 2.2 + 56, top - figH * 0.13);

    stars = [];
    var skip = mobile && cells.length > 9000;
    for (var i = 0; i < cells.length; i++) {
      var c = cells[i];
      if (skip && ((c.gx + c.gy) & 1)) continue;
      var x = left + (c.gx + 0.5 + (Math.random() - 0.5) * 0.7) * cell;
      var y = top + (c.gy + 0.5 + (Math.random() - 0.5) * 0.7) * cell;
      stars.push({ hx: x, hy: y, x: x, y: y, vx: 0, vy: 0, st: 0, t: 0, c: c, ph: Math.random() * 6.28, sp: 0.6 + Math.random() * 2.2,
        big: c.lum > 0.55 && Math.random() < 0.5, d: 0 });
    }
    // order stars by distance to the hole: the head goes first
    var maxD = 1;
    stars.forEach(function (s) { s.d = Math.hypot(s.hx - S.hx, s.hy - S.hy); if (s.d > maxD) maxD = s.d; });
    stars.forEach(function (s) { s.dn = s.d / maxD; });
    order = stars.map(function (_, i) { return i; }).sort(function (a, b) { return stars[a].d - stars[b].d; });

    bg = [];
    var nbg = mobile ? 160 : 320;
    for (var k = 0; k < nbg; k++) bg.push({ x: Math.random() * W, y: Math.random() * H, a: 0.15 + Math.random() * 0.5, ph: Math.random() * 6.28, sp: 0.3 + Math.random() * 1.5 });

    disk = [];
    var nd = mobile ? 480 : 950;
    for (var j = 0; j < nd; j++) {
      var u = Math.random();
      var rr = 1.55 + Math.pow(u, 1.8) * 3.4;   // in units of R, denser near the inside
      disk.push({ r: rr, th: Math.random() * 6.283, w: 0.9 * Math.pow(1.55 / rr, 1.5), band: rr < 2.2 ? 0 : rr < 3.4 ? 1 : 2, sz: Math.random() < 0.2 ? 2 : 1.3 });
    }
    caps = [];
  }

  /* ---------- star buffer ---------- */
  function px(x, y, r, g, b, s) {
    var X = (x * DPR) | 0, Y = (y * DPR) | 0;
    if (X < 0 || Y < 0 || X + s > BW || Y + s > BH) return;
    var col = 0xff000000 | (b << 16) | (g << 8) | r;
    for (var yy = 0; yy < s; yy++) { var row = (Y + yy) * BW + X; for (var xx = 0; xx < s; xx++) buf[row + xx] = col; }
  }

  function capture() {
    // bias heavily towards the stars nearest the hole
    for (var tries = 0; tries < 6; tries++) {
      var i = order[Math.floor(order.length * Math.pow(Math.random(), 3.2))];
      var s = stars[i];
      if (!s || s.st !== 0) continue;
      var dx = s.x - S.hx, dy = s.y - S.hy, r = Math.hypot(dx, dy);
      s.st = 1;
      caps.push({ s: s, r: r, r0: r, th: Math.atan2(dy, dx), x: s.x, y: s.y, px: s.x, py: s.y });
      return;
    }
  }

  function frame(now) {
    if (!running) { last = 0; looping = false; return; }
    requestAnimationFrame(frame);
    var dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
    last = now;
    var t = now / 1000;

    var target = Math.max(S.scrollT, S.hold ? 1 : 0);
    S.hunger += (target - S.hunger) * Math.min(1, dt * 2.2);
    S.flash *= Math.pow(0.08, dt);
    var R = S.R * (0.25 + 0.75 * S.grow) * (1 + 0.28 * S.hunger);
    var hx = S.hx, hy = S.hy;

    buf.fill(0);

    // background stars, slowly twinkling
    for (var b = 0; b < bg.length; b++) {
      var q = bg[b], a = q.a * (0.6 + 0.4 * Math.sin(t * q.sp + q.ph));
      var v = (a * 255) | 0;
      px(q.x, q.y, v, v, Math.min(255, v + 20), 1);
    }

    // feed the hole
    if (!reduce && S.intro >= 1) {
      var rate = (18 + 300 * Math.pow(S.hunger, 1.5)) * (stars.length / 15000);
      acc += rate * dt;
      while (acc >= 1) { capture(); acc -= 1; }
    }
    var regen = 1.6 + 16 * Math.pow(S.hunger, 1.6);
    var rp = mobile ? 70 : 110;

    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      if (s.st === 1) continue;
      if (s.st === 2) { s.t -= dt; if (s.t <= 0) { s.st = 3; s.t = 0; s.x = s.hx; s.y = s.hy; s.vx = s.vy = 0; } continue; }
      var k = 1;
      if (s.st === 3) { s.t += dt / 0.9; k = s.t; if (s.t >= 1) { s.st = 0; k = 1; } }

      var x, y;
      if (S.intro < 1) {
        var e = clamp((S.intro - s.dn * 0.55) / 0.45, 0, 1);
        if (e <= 0) continue;
        e = 1 - Math.pow(1 - e, 3);
        x = hx + (s.hx - hx) * e; y = hy + (s.hy - hy) * e; k *= e;
        s.x = x; s.y = y;
      } else {
        if (!reduce) {
          s.vx += (s.hx - s.x) * 0.06; s.vy += (s.hy - s.y) * 0.06;
          if (pointer.on) {
            var dx = s.x - pointer.x, dy = s.y - pointer.y, d2 = dx * dx + dy * dy;
            if (d2 < rp * rp) { var d = Math.sqrt(d2) || 1, f = (1 - d / rp) * 3.2; s.vx += dx / d * f; s.vy += dy / d * f; }
          }
          s.vx *= 0.84; s.vy *= 0.84; s.x += s.vx; s.y += s.vy;
        }
        x = s.x; y = s.y;
      }
      var tw = 0.78 + 0.22 * Math.sin(t * s.sp + s.ph);
      k *= tw;
      var c = s.c;
      var size = DPR >= 2 ? (s.big ? 3 : 2) : (s.big ? 2 : 1);
      px(x, y, (c.r * k) | 0, (c.g * k) | 0, (c.b * k) | 0, size);
    }
    ctx.putImageData(imgData, 0, 0);

    /* ---------- the hole ---------- */
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    var tilt = 0.26;
    var glowA = 0.16 + 0.22 * S.hunger + 0.25 * S.flash;

    ctx.globalCompositeOperation = 'lighter';
    var g = ctx.createRadialGradient(hx, hy, R * 0.8, hx, hy, R * 7);
    g.addColorStop(0, 'rgba(255,150,60,' + glowA + ')');
    g.addColorStop(0.35, 'rgba(255,90,40,' + glowA * 0.35 + ')');
    g.addColorStop(1, 'rgba(255,60,30,0)');
    ctx.fillStyle = g; ctx.fillRect(hx - R * 7, hy - R * 7, R * 14, R * 14);

    drawDisk(t, dt, R, tilt, true);

    // gravitationally lensed light from the far side of the disk, bent over the top
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.ellipse(hx, hy, R * 1.5, R * 1.32, 0, Math.PI * 1.04, Math.PI * 1.96);
    ctx.strokeStyle = 'rgba(255,170,90,' + (0.28 + 0.2 * S.hunger) + ')'; ctx.lineWidth = R * 0.28; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(hx, hy, R * 1.36, R * 1.22, 0, Math.PI * 1.08, Math.PI * 1.92);
    ctx.strokeStyle = 'rgba(255,236,200,' + (0.5 + 0.3 * S.flash) + ')'; ctx.lineWidth = 1.4; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(hx, hy, R * 1.3, R * 1.12, 0, Math.PI * 0.12, Math.PI * 0.88);
    ctx.strokeStyle = 'rgba(255,170,90,0.22)'; ctx.lineWidth = R * 0.12; ctx.stroke();

    // event horizon + photon ring
    ctx.globalCompositeOperation = 'source-over';
    ctx.beginPath(); ctx.arc(hx, hy, R, 0, 6.2832); ctx.fillStyle = '#000'; ctx.fill();
    ctx.globalCompositeOperation = 'lighter';
    ctx.beginPath(); ctx.arc(hx, hy, R * 1.04, 0, 6.2832);
    ctx.strokeStyle = 'rgba(255,225,180,' + (0.75 + 0.25 * S.flash) + ')'; ctx.lineWidth = 1.3; ctx.stroke();
    ctx.beginPath(); ctx.arc(hx, hy, R * 1.1, 0, 6.2832);
    ctx.strokeStyle = 'rgba(255,140,60,0.25)'; ctx.lineWidth = 4; ctx.stroke();

    drawDisk(t, dt, R, tilt, false);

    // stars on their way in: stretched into streaks as they spiral down
    var buckets = [[], [], []];
    for (var c2 = caps.length - 1; c2 >= 0; c2--) {
      var cp = caps[c2];
      var inner = 4 * R;
      var vin = R * (0.9 + 2.4 * S.hunger) * (1 + 2.6 * Math.pow(R * 2 / Math.max(cp.r, R), 1.2));
      cp.r -= vin * dt;
      cp.th += 0.65 * Math.pow(inner / Math.max(cp.r, R), 1.25) * dt;
      var tl = 0.26 + 0.74 * clamp((cp.r - inner) / Math.max(1, cp.r0 - inner), 0, 1);
      cp.px = cp.x; cp.py = cp.y;
      cp.x = hx + Math.cos(cp.th) * cp.r;
      cp.y = hy + Math.sin(cp.th) * cp.r * tl;
      if (cp.r <= R * 1.02) {
        cp.s.st = 2; cp.s.t = regen * (0.6 + Math.random() * 0.8);
        S.flash = Math.min(1, S.flash + 0.03); S.eaten++;
        caps.splice(c2, 1);
        continue;
      }
      // hidden behind the hole?
      if (Math.hypot(cp.x - hx, (cp.y - hy)) < R && Math.sin(cp.th) < 0) continue;
      var p = 1 - cp.r / cp.r0;
      buckets[p < 0.35 ? 0 : p < 0.7 ? 1 : 2].push(cp);
    }
    var cols3 = ['rgba(215,228,255,0.85)', 'rgba(255,214,160,0.9)', 'rgba(255,150,70,0.95)'];
    ctx.lineWidth = 1.2;
    for (var bk = 0; bk < 3; bk++) {
      var L = buckets[bk]; if (!L.length) continue;
      ctx.beginPath();
      for (var m = 0; m < L.length; m++) {
        var z = L[m];
        ctx.moveTo(z.x - (z.x - z.px) * (2 + bk * 2), z.y - (z.y - z.py) * (2 + bk * 2));
        ctx.lineTo(z.x, z.y);
      }
      ctx.strokeStyle = cols3[bk]; ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    if (counter && ++fc % 10 === 0) counter.textContent = S.eaten.toLocaleString('en-IN');
  }

  var diskPal = [[255, 238, 205], [255, 168, 80], [228, 84, 44]];
  function drawDisk(t, dt, R, tilt, back) {
    var paths = [[], [], [], [], [], []];
    for (var i = 0; i < disk.length; i++) {
      var q = disk[i];
      if (back) q.th += q.w * dt * (1 + S.hunger * 1.5) * (reduce ? 0 : 1);
      var sn = Math.sin(q.th);
      if (back !== (sn < 0)) continue;
      var r = q.r * R;
      var x = S.hx + Math.cos(q.th) * r, y = S.hy + sn * r * tilt;
      if (!back && Math.abs(x - S.hx) < R * 0.98 && y < S.hy + R * 0.05) continue;
      // relativistic beaming: the side moving towards us is brighter
      var key = q.band * 2 + (Math.cos(q.th) > 0 ? 1 : 0);
      paths[key].push(x, y, q.sz);
    }
    for (var k = 0; k < 6; k++) {
      var P = paths[k]; if (!P.length) continue;
      var c = diskPal[k >> 1], a = ((k & 1) ? 0.95 : 0.5) * (k >> 1 === 2 ? 0.6 : 1);
      ctx.fillStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')';
      ctx.beginPath();
      for (var j = 0; j < P.length; j += 3) ctx.rect(P[j], P[j + 1], P[j + 2], P[j + 2]);
      ctx.fill();
    }
  }

  function start() {
    if (window.gsap && !reduce) {
      var tl = gsap.timeline({ delay: 0.2 });
      tl.to(S, { grow: 1, duration: 1.1, ease: 'expo.out' })
        .to(S, { intro: 1, duration: 2.6, ease: 'power1.inOut' }, 0.35)
        .fromTo('.space .reveal', { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, stagger: 0.08, ease: 'power3.out' }, 0.5);
    } else { S.grow = 1; S.intro = 1; document.querySelectorAll('.space .reveal').forEach(function (n) { n.style.opacity = 1; }); }
    loop();
  }
  function loop() { if (looping || !cells.length) return; looping = true; last = 0; requestAnimationFrame(frame); }

  /* ---------- input ---------- */
  function onScroll() {
    var r = space.getBoundingClientRect();
    var span = Math.max(1, r.height - window.innerHeight);
    var p = clamp(-r.top / span, 0, 1);
    S.scrollT = 0.12 + 0.88 * p;
    var wasRunning = running;
    running = r.bottom > 0;
    if (running && !wasRunning) loop();
    document.documentElement.style.setProperty('--feed', p.toFixed(3));
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function setP(cx, cy) { var r = pin.getBoundingClientRect(); pointer.x = cx - r.left; pointer.y = cy - r.top; pointer.on = true; }
  pin.addEventListener('pointermove', function (e) { setP(e.clientX, e.clientY); });
  pin.addEventListener('pointerleave', function () { pointer.on = false; S.hold = 0; });
  pin.addEventListener('pointerdown', function (e) {
    if (e.target.closest('a,button')) return;
    S.hold = 1; setP(e.clientX, e.clientY);
  });
  window.addEventListener('pointerup', function () { S.hold = 0; if (matchMedia('(pointer: coarse)').matches) pointer.on = false; });

  var rt;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { if (cells.length) layout(); }, 150); });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) running = false; else { running = true; loop(); }
  });
})();
