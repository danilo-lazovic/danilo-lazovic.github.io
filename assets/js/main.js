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

  /* Hero: particles flowing through one narrow neck, drawn with the ramp " .:-=+*#%@".
     They slow down where the channel is narrow, so a queue builds up before the cut. */
  var pre = document.querySelector('.flow-ascii');
  if (!pre) return;

  var COLS = 60, ROWS = 18, CUT = 26, YC = (ROWS - 1) / 2;
  var HMAX = 8.4, HMIN = 0.7;
  var RAMP = ' .:-=+*#%@';
  var grid = new Float32Array(COLS * ROWS);
  var parts = [];
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
        if (x === CUT && idx === 0) {
          out += y % 2 ? '<span class="cut">:</span>' : ' ';
        } else if (x === CUT) {
          out += '<span class="cut">' + ch + '</span>';
        } else {
          out += ch;
        }
      }
      out += '\n';
    }
    pre.innerHTML = out;
  }

  for (var w = 0; w < 400; w++) step();
  render();
  if (reduce) return;

  var visible = true, last = 0, running = false;
  function loop(t) {
    if (!visible) { running = false; return; }
    if (t - last > 80) { step(); render(); last = t; }
    requestAnimationFrame(loop);
  }
  function start() { if (!running) { running = true; requestAnimationFrame(loop); } }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (e) { visible = e[0].isIntersecting; if (visible) start(); }).observe(pre);
  }
  document.addEventListener('visibilitychange', function () { visible = !document.hidden; if (visible) start(); });
  start();
})();
