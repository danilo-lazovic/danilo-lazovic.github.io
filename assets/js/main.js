(function () {
  var root = document.documentElement;
  root.classList.remove('no-js');

  function store(key, val) {
    try {
      if (val === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, val);
    } catch (e) { return null; }
  }

  /* ---------- Language ---------- */
  function setLang(lang) {
    root.setAttribute('data-lang', lang);
    root.setAttribute('lang', lang === 'sr' ? 'sr-Latn' : 'en');
    var t = document.querySelector('meta[name="x-title-' + lang + '"]');
    if (t) document.title = t.content;
  }
  var savedLang = store('lang');
  var navLang = (navigator.language || '').toLowerCase();
  setLang(savedLang || (/^(sr|hr|bs|me|sh)/.test(navLang) ? 'sr' : 'en'));
  document.querySelectorAll('.lang-btn').forEach(function (b) {
    b.addEventListener('click', function () {
      var next = root.getAttribute('data-lang') === 'en' ? 'sr' : 'en';
      setLang(next);
      store('lang', next);
    });
  });

  /* ---------- Theme ---------- */
  var savedTheme = store('theme');
  if (savedTheme) root.setAttribute('data-theme', savedTheme);
  var darkMq = window.matchMedia('(prefers-color-scheme: dark)');
  function isDark() {
    var t = root.getAttribute('data-theme');
    return t ? t === 'dark' : darkMq.matches;
  }
  document.querySelectorAll('.theme-btn').forEach(function (b) {
    b.addEventListener('click', function () {
      var next = isDark() ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      store('theme', next);
      readColors();
    });
  });
  if (darkMq.addEventListener) darkMq.addEventListener('change', function () { readColors(); });

  /* ---------- Nav border on scroll ---------- */
  var nav = document.querySelector('.nav');
  function onScroll() { nav.classList.toggle('scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Reveal on scroll ---------- */
  var revealables = document.querySelectorAll('.rv, .reveal-bars, .tsp-wrap');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealables.forEach(function (el) { io.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Year ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Hero: layered network with one bottleneck layer ---------- */
  var canvas = document.querySelector('.hero-canvas');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var colors = {};
  var W = 0, H = 0, dpr = 1;
  var nodes = [], edges = [], layers = [], particles = [];
  var LAYOUT = [7, 10, 12, 3, 11, 9, 6];
  var CUT = 3;
  var rand = mulberry32(7);

  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function readColors() {
    var cs = getComputedStyle(root);
    colors.ink = cs.getPropertyValue('--ink').trim() || '#15161a';
    colors.accent = cs.getPropertyValue('--accent').trim() || '#df4a1b';
    colors.faint = cs.getPropertyValue('--faint').trim() || '#8b8d93';
    if (reduce) draw(0);
  }

  function build() {
    var rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = rect.width; H = rect.height;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    rand = mulberry32(7);
    nodes = []; edges = []; layers = []; particles = [];
    var mobile = W < 760;
    var x0 = mobile ? W * 0.06 : W * 0.44;
    var x1 = mobile ? W * 0.94 : W * 0.97;
    var y0 = H * 0.1, y1 = H * 0.9;

    LAYOUT.forEach(function (count, li) {
      var layer = [];
      var x = x0 + (x1 - x0) * (li / (LAYOUT.length - 1));
      var spread = li === CUT ? 0.34 : 1;
      for (var i = 0; i < count; i++) {
        var t = count === 1 ? 0.5 : i / (count - 1);
        var yc = (y0 + y1) / 2;
        var y = yc + (t - 0.5) * (y1 - y0) * spread + (rand() - 0.5) * 18;
        var n = {
          x: x + (rand() - 0.5) * 26, y: y, layer: li, out: [],
          phase: rand() * Math.PI * 2, glow: 0, cut: li === CUT
        };
        layer.push(n); nodes.push(n);
      }
      layers.push(layer);
    });

    for (var li = 0; li < layers.length - 1; li++) {
      var next = layers[li + 1];
      layers[li].forEach(function (n) {
        var k = li + 1 === CUT ? 1 + Math.floor(rand() * 2) : 2 + Math.floor(rand() * 2);
        var picks = {};
        for (var j = 0; j < k; j++) {
          var idx = Math.floor(rand() * next.length);
          if (picks[idx]) continue;
          picks[idx] = 1;
          var e = { a: n, b: next[idx] };
          n.out.push(e); edges.push(e);
        }
      });
      // every node in the next layer gets at least one incoming edge
      next.forEach(function (m) {
        if (!edges.some(function (e) { return e.b === m; })) {
          var src = layers[li][Math.floor(rand() * layers[li].length)];
          var e = { a: src, b: m };
          src.out.push(e); edges.push(e);
        }
      });
    }
    readColors();
  }

  function spawn() {
    var src = layers[0][Math.floor(Math.random() * layers[0].length)];
    if (!src.out.length) return;
    particles.push({ e: src.out[Math.floor(Math.random() * src.out.length)], t: 0, v: 0.006 + Math.random() * 0.008 });
  }

  function pos(n, time) {
    return { x: n.x + Math.sin(time * 0.0006 + n.phase) * 3, y: n.y + Math.cos(time * 0.0005 + n.phase) * 4 };
  }

  function draw(time) {
    ctx.clearRect(0, 0, W, H);
    ctx.lineWidth = 1;
    ctx.strokeStyle = colors.faint;
    ctx.globalAlpha = 0.22;
    ctx.beginPath();
    edges.forEach(function (e) {
      var a = pos(e.a, time), b = pos(e.b, time);
      var mx = (a.x + b.x) / 2;
      ctx.moveTo(a.x, a.y);
      ctx.bezierCurveTo(mx, a.y, mx, b.y, b.x, b.y);
    });
    ctx.stroke();

    // particles
    ctx.globalAlpha = 1;
    particles.forEach(function (p) {
      var a = pos(p.e.a, time), b = pos(p.e.b, time);
      var t = p.t, u = 1 - t, mx = (a.x + b.x) / 2;
      var x = u * u * u * a.x + 3 * u * u * t * mx + 3 * u * t * t * mx + t * t * t * b.x;
      var y = u * u * u * a.y + 3 * u * u * t * a.y + 3 * u * t * t * b.y + t * t * t * b.y;
      var hot = p.e.b.cut || p.e.a.cut;
      ctx.fillStyle = hot ? colors.accent : colors.ink;
      ctx.globalAlpha = hot ? 0.9 : 0.45;
      ctx.beginPath();
      ctx.arc(x, y, hot ? 2.2 : 1.6, 0, Math.PI * 2);
      ctx.fill();
    });

    // nodes
    nodes.forEach(function (n) {
      var p = pos(n, time);
      if (n.cut) {
        var g = n.glow;
        ctx.globalAlpha = 0.12 + g * 0.25;
        ctx.fillStyle = colors.accent;
        ctx.beginPath(); ctx.arc(p.x, p.y, 16 + g * 8, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
        ctx.beginPath(); ctx.arc(p.x, p.y, 6.5, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = colors.accent; ctx.lineWidth = 1.2; ctx.globalAlpha = 0.6;
        ctx.beginPath(); ctx.arc(p.x, p.y, 11, 0, Math.PI * 2); ctx.stroke();
      } else {
        ctx.globalAlpha = 0.75;
        ctx.fillStyle = colors.ink;
        ctx.beginPath(); ctx.arc(p.x, p.y, 2.6, 0, Math.PI * 2); ctx.fill();
      }
    });
    ctx.globalAlpha = 1;

    // dashed "cut" line through the bottleneck layer
    var cx = layers[CUT][0].x;
    ctx.save();
    ctx.setLineDash([4, 6]);
    ctx.strokeStyle = colors.accent;
    ctx.globalAlpha = 0.45;
    ctx.beginPath(); ctx.moveTo(cx, H * 0.04); ctx.lineTo(cx, H * 0.96); ctx.stroke();
    ctx.restore();
  }

  function step() {
    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      p.t += p.v;
      if (p.t >= 1) {
        var n = p.e.b;
        if (n.cut) n.glow = 1;
        if (n.out.length) {
          p.e = n.out[Math.floor(Math.random() * n.out.length)];
          p.t = 0;
        } else {
          particles.splice(i, 1);
        }
      }
    }
    nodes.forEach(function (n) { n.glow *= 0.94; });
    if (particles.length < 70 && Math.random() < 0.35) spawn();
  }

  var running = false, visible = true;
  function loop(time) {
    if (!visible) { running = false; return; }
    step();
    draw(time);
    requestAnimationFrame(loop);
  }
  function start() {
    if (reduce || running) return;
    running = true;
    requestAnimationFrame(loop);
  }

  build();
  if (reduce) {
    draw(0);
  } else {
    for (var w = 0; w < 260; w++) step();
    start();
  }

  var resizeT;
  window.addEventListener('resize', function () {
    clearTimeout(resizeT);
    resizeT = setTimeout(function () { build(); if (reduce) draw(0); }, 150);
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible) start();
    }).observe(canvas);
  }
  document.addEventListener('visibilitychange', function () {
    visible = !document.hidden;
    if (visible) start();
  });
})();
