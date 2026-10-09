(function () {
  var root = document.documentElement;

  function store(key, val) {
    try {
      if (val === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, val);
    } catch (e) { return null; }
  }

  /* Language */
  function setLang(lang) {
    root.setAttribute('data-lang', lang);
    root.setAttribute('lang', lang === 'sr' ? 'sr-Latn' : 'en');
    var t = document.querySelector('meta[name="x-title-' + lang + '"]');
    if (t) document.title = t.content;
  }
  setLang(root.getAttribute('data-lang') || 'en');
  document.querySelectorAll('[data-toggle="lang"]').forEach(function (b) {
    b.addEventListener('click', function () {
      var next = root.getAttribute('data-lang') === 'en' ? 'sr' : 'en';
      setLang(next);
      store('lang', next);
    });
  });

  /* Theme: Papir (light) and Noc (dark) */
  var darkMq = window.matchMedia('(prefers-color-scheme: dark)');
  function isDark() {
    var t = root.getAttribute('data-theme');
    return t ? t === 'dark' : darkMq.matches;
  }
  document.querySelectorAll('[data-toggle="theme"]').forEach(function (b) {
    b.addEventListener('click', function () {
      var next = isDark() ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      store('theme', next);
    });
  });

  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* Runs draw(t) about every `ms` while the element is on screen.
     The animations always move (Danilo's choice); a click or tap on one pauses or resumes it. */
  function animate(el, ms, draw) {
    draw(0);
    var visible = true, paused = false, last = 0, running = false;
    function loop(now) {
      if (!visible || paused || document.hidden) { running = false; return; }
      if (now - last > ms) { draw(now / 1000); last = now; }
      requestAnimationFrame(loop);
    }
    function start() { if (!running) { running = true; requestAnimationFrame(loop); } }
    var box = el.parentElement;
    box.setAttribute('title', 'click to pause / klik za pauzu');
    box.addEventListener('click', function () { paused = !paused; if (!paused) start(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) { visible = e[0].isIntersecting; if (visible) start(); }).observe(el);
    }
    document.addEventListener('visibilitychange', function () { if (!document.hidden) start(); });
    start();
  }

  /* Hero: the street cat, in the style of Danilo's drawing. A 16 second loop built from posed
     body parts (body, head, ears, four legs, a spiky tail) that blend from pose to pose:
     sleeps and breathes (z z Z), lifts its head, stands, eyes go wide (!), crouches, hops,
     lands, sits and licks its paw, lies down and falls asleep again.
     Each text row holds two vertical sub-pixels: ':' both filled, '.' bottom, "'" top. */
  function makeCatLife(COLS, ROWS) {
    var H = ROWS * 2, G = H - 3;                                  // ground (sub-pixel row)
    // A pose: body ellipse, head, ears, eyes, 4 legs (hip x,y / foot x,y), tail.
    function P(o) { return o; }
    var STAND = P({ cx: 27, cy: 33, rx: 11, ry: 6.5, hx: 15, hy: 23, hr: 7.6, ear: 7, eye: 1,
      l: [19, 35, 17, G, 23, 35, 23, G, 31, 35, 31, G, 35, 35, 37, G],
      tx: 36, ty: 30, ta: -1.15, tl: 15, tc: 0.5, tw: 2.4 });
    var SLEEP = P({ cx: 28, cy: G - 6, rx: 13, ry: 6.2, hx: 13, hy: G - 8, hr: 6.8, ear: 5.5, eye: 0,
      l: [19, G - 3, 18, G, 23, G - 3, 23, G, 31, G - 3, 31, G, 35, G - 3, 36, G],
      tx: 38, ty: G - 3, ta: -0.25, tl: 11, tc: 1.6, tw: 2.2 });
    var WAKE = Object.assign({}, SLEEP, { hy: G - 13, hx: 16, ear: 6.5, eye: 1 });
    var WIDE = Object.assign({}, STAND, { eye: 1.75, ear: 9, hy: 22 });
    var CROUCH = Object.assign({}, STAND, { cy: 37, hy: 28, eye: 1.3, ear: 7.5,
      l: [19, 39, 16, G, 23, 39, 22, G, 31, 39, 32, G, 35, 39, 38, G], ta: -0.9 });
    var HOP = Object.assign({}, STAND, { cy: 21, hy: 11, eye: 1.6, ear: 9,
      l: [19, 23, 12, 35, 23, 23, 16, 34, 31, 23, 38, 33, 35, 23, 42, 31], ta: -0.4, tc: 0.2 });
    var SIT = P({ cx: 29, cy: 37, rx: 8, ry: 9.5, hx: 21, hy: 23, hr: 7.6, ear: 7, eye: 1,
      l: [23, 38, 22, G, 26, 38, 26, G, 33, 44, 30, G, 36, 44, 37, G],
      tx: 35, ty: G - 1, ta: -0.15, tl: 12, tc: -1.1, tw: 2.2 });
    var LICK = Object.assign({}, SIT, { hx: 21, hy: 26, eye: 0.35,
      l: [23, 35, 9.5, 30, 26, 38, 26, G, 33, 44, 30, G, 36, 44, 37, G] });

    var KEYS = [
      [0, SLEEP], [3.6, SLEEP], [4.3, Object.assign({}, WAKE, { eye: 0 })], [4.9, WAKE],
      [5.7, STAND], [6.0, WIDE], [6.8, WIDE], [7.1, CROUCH], [7.4, HOP], [7.7, CROUCH],
      [8.0, STAND], [8.6, SIT], [9.0, LICK], [11.6, LICK], [12.0, SIT],
      [12.8, Object.assign({}, WAKE, { eye: 0.4 })], [13.4, SLEEP], [16, SLEEP]
    ];
    var LOOP = 16;

    function ease(u) { return u * u * (3 - 2 * u); }
    function mix(a, b, u) {
      var o = {};
      for (var k in a) {
        if (k === 'l') { o.l = a.l.map(function (v, i) { return v + (b.l[i] - v) * u; }); }
        else o[k] = a[k] + (b[k] - a[k]) * u;
      }
      return o;
    }
    function poseAt(t) {
      for (var i = 0; i < KEYS.length - 1; i++) {
        if (t >= KEYS[i][0] && t <= KEYS[i + 1][0]) {
          var u = (t - KEYS[i][0]) / (KEYS[i + 1][0] - KEYS[i][0] || 1);
          return mix(KEYS[i][1], KEYS[i + 1][1], ease(u));
        }
      }
      return KEYS[0][1];
    }

    function inE(x, y, cx, cy, rx, ry) { var a = (x - cx) / rx, b = (y - cy) / ry; return a * a + b * b <= 1; }
    function inTri(x, y, a, b, c) {
      var d1 = (x - b[0]) * (a[1] - b[1]) - (a[0] - b[0]) * (y - b[1]);
      var d2 = (x - c[0]) * (b[1] - c[1]) - (b[0] - c[0]) * (y - c[1]);
      var d3 = (x - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (y - a[1]);
      return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));
    }
    function seg(x, y, ax, ay, bx, by) {
      var dx = bx - ax, dy = by - ay, u = ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy || 1);
      u = Math.max(0, Math.min(1, u));
      var px = ax + u * dx - x, py = ay + u * dy - y; return Math.sqrt(px * px + py * py);
    }

    return function frame(time) {
      var t = time % LOOP;
      var p = poseAt(t);
      var asleep = t < 4.0 || t > 13.2;
      var breath = asleep ? Math.sin(time * 2.2) : 0;
      p.ry += breath * 0.45; p.hy += breath * 0.3;
      var licking = t > 9.0 && t < 11.6;
      var lickPhase = Math.sin(time * 12);
      if (licking) { p.hy += lickPhase * 0.7; p.l[2] += lickPhase * 0.4; p.l[3] -= Math.abs(lickPhase) * 0.6; }
      var awake = !asleep;
      var eye = p.eye;
      var blinkAt = [5.25, 8.4, 12.2];
      blinkAt.forEach(function (b) { if (t > b && t < b + 0.16) eye = Math.min(eye, 0); });
      var wag = awake && !licking ? Math.sin(time * 3.1) * 0.25 : licking ? Math.sin(time * 1.5) * 0.15 : Math.sin(time * 0.7) * 0.05;

      // tail as a chain of discs, spiky like the drawing
      var tail = [], x = p.tx, y = p.ty, n = 26;
      for (var i = 0; i <= n; i++) {
        var s = i / n, a = p.ta + wag * s + p.tc * s;
        var w = p.tw * (1 - 0.35 * s) + (s > 0.35 ? 0.9 * Math.abs(Math.sin(s * 17 + 0.5)) : 0);
        tail.push([x, y, w]);
        x += Math.cos(a) * p.tl / n; y += Math.sin(a) * p.tl / n;
      }
      var nx = (p.hx + (p.cx - p.rx * 0.55)) / 2, ny = (p.hy + p.cy - p.ry * 0.2) / 2;
      var ex = 2.9, eyeY = p.hy - 0.6;
      var erx = 0.8 + 0.75 * eye, ery = 1.0 + 1.0 * eye;
      var tongue = licking && lickPhase > 0.2;

      function body(x, y) {
        if (inE(x, y, p.cx, p.cy, p.rx, p.ry)) return true;
        if (inE(x, y, nx, ny, 4.6, 5.2)) return true;
        if (inE(x, y, p.hx, p.hy, p.hr, p.hr * 0.88)) return true;
        if (inE(x, y, p.hx, p.hy + 2.2, p.hr + 1.1, p.hr * 0.55)) return true;          // cheeks
        if (inTri(x, y, [p.hx - p.hr + 0.6, p.hy - 2.5], [p.hx - 1.2, p.hy - p.hr + 0.8], [p.hx - p.hr + 0.2, p.hy - 3 - p.ear])) return true;
        if (inTri(x, y, [p.hx + 1.2, p.hy - p.hr + 0.8], [p.hx + p.hr - 0.6, p.hy - 2.5], [p.hx + p.hr - 0.2, p.hy - 3 - p.ear])) return true;
        for (var k = 0; k < 4; k++) {
          var L = p.l.slice(k * 4, k * 4 + 4);
          if (seg(x, y, L[0], L[1], L[2], L[3]) <= 1.7) return true;
          if (inE(x, y, L[2] + (k < 2 ? -0.7 : 0.7), L[3] - 0.4, 2.2, 1.3)) return true;
        }
        for (var j = 0; j < tail.length; j++) {
          var q = tail[j], dx = x - q[0], dy = y - q[1]; if (dx * dx + dy * dy <= q[2] * q[2]) return true;
        }
        if (tongue && inE(x, y, p.hx - p.hr - 0.9, p.hy + 3.4, 1.4, 1.0)) return true;
        return false;
      }
      function filled(x, y) {
        if (!body(x, y)) return false;
        for (var side = -1; side <= 1; side += 2) {
          var cxE = p.hx + side * ex;
          if (eye < 0.25) { if (Math.abs(y - (eyeY + 0.6)) < 0.55 && Math.abs(x - cxE) < 1.6) return false; }
          else if (inE(x, y, cxE, eyeY, erx, ery)) {
            if (eye > 1.3 && inE(x, y, cxE, eyeY + 0.3, 0.6, 0.8)) return true;          // pupil when wide
            return false;
          }
        }
        return true;
      }

      var grid = [];
      for (var r = 0; r < ROWS - 1; r++) {
        var line = [];
        for (var c = 0; c < COLS; c++) {
          var a1 = filled(c + 0.5, 2 * r + 0.5), b1 = filled(c + 0.5, 2 * r + 1.5);
          line.push(a1 && b1 ? ':' : b1 ? '.' : a1 ? "'" : ' ');
        }
        grid.push(line);
      }
      // shadow: shrinks when the cat is in the air
      var lift = Math.max(0, (STAND.cy - p.cy)) / 12, half = Math.round(14 - lift * 6), mid = Math.round(p.cx - 1);
      var sh = [];
      for (var c2 = 0; c2 < COLS; c2++) { var d = Math.abs(c2 - mid); sh.push(d > half ? ' ' : d > half - 3 ? '-' : '='); }
      grid.push(sh);
      // overlays: z's while asleep, ! when the eyes go wide
      var marks = [];
      if (asleep) {
        for (var z = 0; z < 3; z++) {
          var ph = ((time * 0.45) + z / 3) % 1;
          var zr = Math.round((p.hy - 9) / 2 - ph * 6), zc = Math.round(p.hx - 4 - ph * 5 + z);
          if (zr >= 0 && zc >= 0) marks.push([zr, zc, ph > 0.6 ? 'Z' : 'z']);
        }
      }
      if (t > 6.0 && t < 6.9) marks.push([Math.max(0, Math.round((p.hy - p.hr - p.ear - 6) / 2)), Math.round(p.hx + 7), '!']);
      var html = grid.map(function (row, ri) {
        var out = '';
        for (var ci = 0; ci < row.length; ci++) {
          var m = null;
          for (var mi = 0; mi < marks.length; mi++) if (marks[mi][0] === ri && marks[mi][1] === ci) m = marks[mi][2];
          out += m ? '<b class="cut">' + m + '</b>' : row[ci];
        }
        return out;
      });
      return html.join('\n');
    };
  }

  var catPre = document.querySelector('.cat-ascii');
  if (catPre) {
    var catFrame = makeCatLife(48, 27);
    animate(catPre, 70, function (t) { catPre.innerHTML = catFrame(t); });
  }

  /* Info: particles flowing through one narrow neck, drawn with the ramp " .:-=+*#%@".
     They slow down where the channel narrows, so a queue builds up in front of the cut.
     The dotted walls show the channel getting narrower. */
  var flowPre = document.querySelector('.flow-ascii');
  if (!flowPre) return;

  var COLS = 60, ROWS = 18, CUT = 26, YC = (ROWS - 1) / 2;
  var HMAX = 8.4, HMIN = 0.7;
  var RAMP = ' .:-=+*#%@';
  var grid = new Float32Array(COLS * ROWS);
  var parts = [];

  function half(x) {
    var span = x < CUT ? CUT : COLS - 1 - CUT;
    var d = Math.min(1, Math.abs(x - CUT) / span);
    return HMIN + (HMAX - HMIN) * Math.pow(d, 1.3);
  }

  function spawn() {
    parts.push({ x: -1 - Math.random() * 6, u: Math.random() * 2 - 1, v: 0.3 + Math.random() * 0.2 });
  }

  function step() {
    for (var i = 0; i < grid.length; i++) grid[i] *= 0.62;
    for (var p = parts.length - 1; p >= 0; p--) {
      var q = parts[p];
      var h = half(Math.max(0, q.x));
      q.x += q.v * (0.18 + 0.82 * (h - HMIN) / (HMAX - HMIN));
      q.u = Math.max(-1, Math.min(1, q.u + (Math.random() - 0.5) * 0.08));
      if (q.x >= COLS) { parts.splice(p, 1); continue; }
      if (q.x < 0) continue;
      var cx = Math.round(q.x), cy = Math.round(YC + q.u * half(q.x));
      if (cy >= 0 && cy < ROWS && cx < COLS) grid[cy * COLS + cx] += 1;
    }
    while (parts.length < 320) spawn();
  }

  function render() {
    var out = '';
    for (var y = 0; y < ROWS; y++) {
      for (var x = 0; x < COLS; x++) {
        var v = grid[y * COLS + x];
        var idx = v <= 0.05 ? 0 : Math.min(RAMP.length - 1, 1 + Math.floor(Math.sqrt(v) * 2.4));
        var ch = RAMP[idx];
        var edge = Math.abs(Math.abs(y - YC) - (half(x) + 1)) < 0.5;
        if (x === CUT && idx === 0) {
          out += y % 2 ? '<span class="cut">:</span>' : ' ';
        } else if (x === CUT) {
          out += '<span class="cut">' + ch + '</span>';
        } else if (idx === 0 && edge) {
          out += '<span class="wall">.</span>';
        } else {
          out += ch;
        }
      }
      out += '\n';
    }
    flowPre.innerHTML = out;
  }

  for (var w = 0; w < 400; w++) step();
  animate(flowPre, 80, function (t) { if (t) step(); render(); });
})();
