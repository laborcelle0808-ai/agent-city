/*
 * «Артан» — генератор «Диплому Захисника» (canvas, 1600×1131).
 * ES5, без бібліотек і мережі.
 *
 * window.ArtanDiploma.render(opts) -> Promise<HTMLCanvasElement>
 *   opts = { name, mode:'call'|'fio', rank, xp, city, missions:[string], date:Date, serial }
 */
(function () {
  'use strict';

  var W = 1600, H = 1131;
  var EMBLEM_SRC = 'img/emblem.png';

  var C = {
    bg0: '#0A0B09', bg1: '#1E211A',
    olive: '#C3C79A', gold: '#F2C230', goldHi: '#FFE27A', goldLo: '#C99A12',
    text: '#EDEBE2', muted: '#A9AD9D'
  };

  var F_DISPLAY = "'Oswald', 'Arial Narrow', 'DejaVu Sans Condensed', Impact, sans-serif";
  var F_BODY = "'Inter', 'Helvetica Neue', Arial, 'DejaVu Sans', sans-serif";
  var F_WORD = "'Ruslan Display', 'Oswald', Georgia, 'DejaVu Serif', serif";
  var F_SERIF = "Georgia, 'DejaVu Serif', 'Times New Roman', serif";

  var MONTHS = ['січня', 'лютого', 'березня', 'квітня', 'травня', 'червня', 'липня',
    'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'];

  /* ---------------- утиліти ---------------- */

  function timeout(ms) {
    return new Promise(function (res) { setTimeout(res, ms); });
  }

  var fontsPromise = null;
  function loadFonts() {
    if (fontsPromise) return fontsPromise;
    var p;
    try {
      if (document.fonts && document.fonts.load) {
        var list = ["400 20px 'Inter'", "500 20px 'Inter'", "600 20px 'Inter'",
          "500 20px 'Oswald'", "600 20px 'Oswald'", "400 20px 'Ruslan Display'"];
        var txt = 'АРТАН Диплом Захисника 0123456789';
        p = Promise.all(list.map(function (f) {
          return document.fonts.load(f, txt).catch(function () { return null; });
        }));
      } else {
        p = Promise.resolve();
      }
    } catch (e) {
      p = Promise.resolve();
    }
    fontsPromise = Promise.race([p, timeout(1500)]).catch(function () { return null; });
    return fontsPromise;
  }

  var emblemPromise = null;
  function loadEmblem() {
    if (emblemPromise) return emblemPromise;
    emblemPromise = new Promise(function (res) {
      var done = false;
      var img = new Image();
      function finish(v) { if (!done) { done = true; res(v); } }
      img.onload = function () { finish(img.naturalWidth ? img : null); };
      img.onerror = function () { finish(null); };
      setTimeout(function () { finish(null); }, 4000);
      img.src = EMBLEM_SRC;
    }).then(function (img) {
      if (!img) emblemPromise = null; // дозволити повторну спробу наступного разу
      return img;
    });
    return emblemPromise;
  }

  // детермінований ГПВЧ (щоб фон диплома залежав від номера)
  var imul = Math.imul || function (a, b) { var ah = (a >>> 16) & 0xffff, al = a & 0xffff, bh = (b >>> 16) & 0xffff, bl = b & 0xffff; return ((al * bl) + (((ah * bl + al * bh) << 16) >>> 0) | 0); };

  function rng(seedStr) {
    var h = 2166136261;
    seedStr = String(seedStr || 'artan');
    for (var i = 0; i < seedStr.length; i++) {
      h ^= seedStr.charCodeAt(i);
      h = imul(h, 16777619);
    }
    var s = h >>> 0;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0;
      var t = s;
      t = imul(t ^ (t >>> 15), t | 1);
      t ^= t + imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function font(ctx, weight, size, family) {
    ctx.font = weight + ' ' + size + 'px ' + family;
  }

  function spacedWidth(ctx, s, sp) {
    var w = 0;
    for (var i = 0; i < s.length; i++) w += ctx.measureText(s.charAt(i)).width;
    return w + sp * Math.max(0, s.length - 1);
  }

  // текст із розрядкою, вирівняний по центру x
  function spacedText(ctx, s, x, y, sp, stroke) {
    var w = spacedWidth(ctx, s, sp);
    var cx = x - w / 2;
    var oldAlign = ctx.textAlign;
    ctx.textAlign = 'left';
    for (var i = 0; i < s.length; i++) {
      var ch = s.charAt(i);
      if (stroke) ctx.strokeText(ch, cx, y);
      ctx.fillText(ch, cx, y);
      cx += ctx.measureText(ch).width + sp;
    }
    ctx.textAlign = oldAlign;
    return w;
  }

  function goldGrad(ctx, x0, y0, x1, y1) {
    var g = ctx.createLinearGradient(x0, y0, x1, y1);
    g.addColorStop(0, C.goldHi);
    g.addColorStop(0.45, C.gold);
    g.addColorStop(0.7, C.goldLo);
    g.addColorStop(1, C.goldHi);
    return g;
  }

  function roundRect(ctx, x, y, w, h, r) {
    r = Math.min(r, h / 2, w / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }

  // підібрати розмір шрифту, щоб текст вмістився у maxW
  function fitSize(ctx, s, weight, family, maxSize, minSize, maxW, sp) {
    var size = maxSize;
    while (size > minSize) {
      font(ctx, weight, size, family);
      var w = sp ? spacedWidth(ctx, s, sp * size) : ctx.measureText(s).width;
      if (w <= maxW) break;
      size -= 2;
    }
    font(ctx, weight, size, family);
    return size;
  }

  function ellipsize(ctx, s, maxW) {
    if (ctx.measureText(s).width <= maxW) return s;
    var lo = 0, hi = s.length;
    while (lo < hi) {
      var mid = (lo + hi + 1) >> 1;
      if (ctx.measureText(s.slice(0, mid).replace(/\s+$/, '') + '…').width <= maxW) lo = mid; else hi = mid - 1;
    }
    return s.slice(0, lo).replace(/[\s,.;:–-]+$/, '') + '…';
  }

  function wrapLines(ctx, s, maxW) {
    var words = s.split(/\s+/), lines = [], cur = '';
    for (var i = 0; i < words.length; i++) {
      var t = cur ? cur + ' ' + words[i] : words[i];
      if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = words[i]; } else cur = t;
    }
    if (cur) lines.push(cur);
    return lines;
  }

  function fmtDate(d) {
    if (!(d instanceof Date) || isNaN(d.getTime())) d = new Date();
    return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear();
  }

  function fmtXp(n) {
    n = Math.max(0, Math.round(Number(n) || 0));
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  /* ---------------- фон ---------------- */

  function drawBackground(ctx, rand) {
    var g = ctx.createRadialGradient(W / 2, H * 0.42, 60, W / 2, H / 2, W * 0.72);
    g.addColorStop(0, C.bg1);
    g.addColorStop(1, C.bg0);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // топографічні горизонталі
    ctx.save();
    ctx.lineWidth = 1.2;
    var centers = [
      { x: W * (0.12 + rand() * 0.1), y: H * (0.25 + rand() * 0.2) },
      { x: W * (0.82 + rand() * 0.08), y: H * (0.62 + rand() * 0.2) },
      { x: W * (0.45 + rand() * 0.15), y: H * (1.02 + rand() * 0.08) }
    ];
    for (var c = 0; c < centers.length; c++) {
      var cc = centers[c];
      var ph = [rand() * 6.28, rand() * 6.28, rand() * 6.28];
      for (var k = 1; k <= 16; k++) {
        var r0 = k * 34;
        ctx.strokeStyle = 'rgba(195,199,154,' + (k % 5 === 0 ? 0.075 : 0.04) + ')';
        ctx.beginPath();
        for (var a = 0; a <= 120; a++) {
          var t = a / 120 * Math.PI * 2;
          var rr = r0 * (1 + 0.13 * Math.sin(3 * t + ph[0] + k * 0.05) +
            0.07 * Math.sin(5 * t + ph[1] - k * 0.08) + 0.04 * Math.sin(2 * t + ph[2]));
          var px = cc.x + Math.cos(t) * rr * 1.25, py = cc.y + Math.sin(t) * rr;
          if (a === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
      }
    }
    ctx.restore();

    // гільйош-розетка під заголовком
    ctx.save();
    ctx.translate(W / 2, 132);
    ctx.strokeStyle = 'rgba(242,194,48,0.06)';
    ctx.lineWidth = 1;
    for (var i = 0; i < 36; i++) {
      ctx.rotate(Math.PI * 2 / 36);
      ctx.beginPath();
      ctx.ellipse(0, 70, 34, 120, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();

    // промені від емблеми
    ctx.save();
    ctx.translate(W / 2, 132);
    for (var j = 0; j < 72; j++) {
      var ang = j / 72 * Math.PI * 2;
      ctx.strokeStyle = 'rgba(195,199,154,' + (j % 2 ? 0.025 : 0.05) + ')';
      ctx.beginPath();
      ctx.moveTo(Math.cos(ang) * 130, Math.sin(ang) * 130);
      ctx.lineTo(Math.cos(ang) * 560, Math.sin(ang) * 560);
      ctx.stroke();
    }
    ctx.restore();

    // віньєтка
    var v = ctx.createRadialGradient(W / 2, H / 2, H * 0.38, W / 2, H / 2, W * 0.68);
    v.addColorStop(0, 'rgba(0,0,0,0)');
    v.addColorStop(1, 'rgba(0,0,0,0.6)');
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, W, H);
  }

  /* ---------------- рамка й орнаменти ---------------- */

  // вишиванковий мотив «восьмипелюсткова зірка» хрестиком (13×13)
  var STAR = [
    '......X......',
    '.....XXX.....',
    '..X...X...X..',
    '.XXX..X..XXX.',
    '..XXX.O.XXX..',
    '...X.OOO.X...',
    'XXXXOO.OOXXXX',
    '...X.OOO.X...',
    '..XXX.O.XXX..',
    '.XXX..X..XXX.',
    '..X...X...X..',
    '.....XXX.....',
    '......X......'
  ];

  function stitch(ctx, x, y, s) {
    // клітинка «хрестик» — квадрат зі скошеними кутами
    var m = s * 0.12;
    ctx.beginPath();
    ctx.moveTo(x + m, y);
    ctx.lineTo(x + s - m, y);
    ctx.lineTo(x + s, y + m);
    ctx.lineTo(x + s, y + s - m);
    ctx.lineTo(x + s - m, y + s);
    ctx.lineTo(x + m, y + s);
    ctx.lineTo(x, y + s - m);
    ctx.lineTo(x, y + m);
    ctx.closePath();
    ctx.fill();
  }

  function drawStar(ctx, cx, cy, cell, gold) {
    var n = STAR.length, x0 = cx - n * cell / 2, y0 = cy - n * cell / 2;
    for (var r = 0; r < n; r++) {
      for (var c = 0; c < n; c++) {
        var ch = STAR[r].charAt(c);
        if (ch === '.') continue;
        ctx.fillStyle = ch === 'X' ? gold : C.olive;
        stitch(ctx, x0 + c * cell + 0.5, y0 + r * cell + 0.5, cell - 1);
      }
    }
  }

  function drawLaurelSprig(ctx, len, dir) {
    // гілочка лавра вздовж осі x: вигнуте стебло, листки-мигдалики парами, ягідки
    var bend = 10 * dir;
    function pt(t) { return { x: len * t, y: -bend * 4 * t * (1 - t) }; }
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(len * 0.5, -bend * 2, len, 0);
    ctx.stroke();
    var n = 7;
    for (var i = 0; i < n; i++) {
      var t = 0.08 + i / n * 0.86, p = pt(t);
      var sc = 1 - t * 0.45;              // листя дрібнішає до кінчика
      var ang = Math.atan2(-bend * 4 * (1 - 2 * t), len);
      for (var s = -1; s <= 1; s += 2) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(ang + s * 0.62);
        ctx.scale(sc, sc);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(5, -6, 15, -6, 22, 0);
        ctx.bezierCurveTo(15, 6, 5, 6, 0, 0);
        ctx.fill();
        ctx.restore();
      }
      if (i % 2 === 1) {
        ctx.beginPath();
        ctx.arc(p.x + 4, p.y + 7 * dir, 2.4 * sc, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // бутон на кінчику
    ctx.beginPath();
    ctx.ellipse(len + 6, 0, 7, 3.2, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawFrame(ctx) {
    var gg = goldGrad(ctx, 0, 0, W, H);

    // зовнішня рамка
    ctx.save();
    ctx.strokeStyle = gg;
    ctx.lineWidth = 6;
    ctx.strokeRect(26, 26, W - 52, H - 52);
    ctx.lineWidth = 1.5;
    ctx.strokeRect(38, 38, W - 76, H - 76);

    // смуга між рамками — ланцюжок ромбиків (вишиванковий бордюр)
    var bx0 = 38, by0 = 38, bx1 = W - 38, by1 = H - 38, inset = 70;
    ctx.fillStyle = 'rgba(242,194,48,0.55)';
    var step = 18;
    function diamond(x, y, s) {
      ctx.beginPath();
      ctx.moveTo(x, y - s); ctx.lineTo(x + s, y); ctx.lineTo(x, y + s); ctx.lineTo(x - s, y);
      ctx.closePath(); ctx.fill();
    }
    var mid = (38 + 58) / 2;
    for (var x = bx0 + inset; x <= bx1 - inset; x += step) {
      var big = Math.round((x - bx0) / step) % 3 === 0;
      diamond(x, mid, big ? 4.5 : 2.4);
      diamond(x, H - mid, big ? 4.5 : 2.4);
    }
    for (var y = by0 + inset; y <= by1 - inset; y += step) {
      var big2 = Math.round((y - by0) / step) % 3 === 0;
      diamond(mid, y, big2 ? 4.5 : 2.4);
      diamond(W - mid, y, big2 ? 4.5 : 2.4);
    }

    // внутрішня рамка
    ctx.strokeStyle = gg;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(58, 58, W - 116, H - 116);
    ctx.strokeStyle = 'rgba(195,199,154,0.35)';
    ctx.lineWidth = 1;
    ctx.strokeRect(66, 66, W - 132, H - 132);
    ctx.restore();

    // кутові орнаменти
    var corners = [[1, 1, 0], [-1, 1, W], [1, -1, 0], [-1, -1, W]];
    for (var i = 0; i < 4; i++) {
      var sx = corners[i][0], sy = corners[i][1];
      var ox = sx > 0 ? 0 : W, oy = sy > 0 ? 0 : H;
      ctx.save();
      ctx.translate(ox, oy);
      ctx.scale(sx, sy);
      // підкладка під зірку
      ctx.fillStyle = C.bg0;
      ctx.beginPath();
      ctx.moveTo(48, 20); ctx.lineTo(76, 48); ctx.lineTo(48, 76); ctx.lineTo(20, 48);
      ctx.closePath();
      ctx.fill();
      // ромб-оправа
      ctx.strokeStyle = gg;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(48, 6); ctx.lineTo(90, 48); ctx.lineTo(48, 90); ctx.lineTo(6, 48);
      ctx.closePath();
      ctx.fillStyle = C.bg0;
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // вишиванкова зірка (не дзеркалимо — вона симетрична)
      var cx = sx > 0 ? 48 : W - 48, cy = sy > 0 ? 48 : H - 48;
      drawStar(ctx, cx, cy, 5.2, C.gold);

      // лаврові гілочки вздовж сторін
      ctx.save();
      ctx.translate(ox, oy);
      ctx.scale(sx, sy);
      ctx.strokeStyle = 'rgba(242,194,48,0.8)';
      ctx.fillStyle = 'rgba(242,194,48,0.8)';
      ctx.lineWidth = 1.5;
      ctx.save();
      ctx.translate(100, 94);
      drawLaurelSprig(ctx, 150, 1);
      ctx.restore();
      ctx.save();
      ctx.translate(94, 100);
      ctx.rotate(Math.PI / 2);
      drawLaurelSprig(ctx, 150, -1);
      ctx.restore();
      ctx.restore();
    }
  }

  /* ---------------- верхній блок ---------------- */

  function drawHeader(ctx, emblem) {
    var cy = 132, R = 68;
    // ореол під емблему
    var halo = ctx.createRadialGradient(W / 2, cy, R * 0.6, W / 2, cy, R * 1.55);
    halo.addColorStop(0, 'rgba(195,199,154,0.30)');
    halo.addColorStop(1, 'rgba(195,199,154,0)');
    ctx.fillStyle = halo;
    ctx.beginPath(); ctx.arc(W / 2, cy, R * 1.6, 0, Math.PI * 2); ctx.fill();

    ctx.save();
    ctx.strokeStyle = goldGrad(ctx, W / 2 - R, cy - R, W / 2 + R, cy + R);
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(W / 2, cy, R + 8, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([2, 6]);
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(W / 2, cy, R + 16, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();

    if (emblem) {
      var s = R * 2 * 1.06;
      ctx.drawImage(emblem, W / 2 - s / 2, cy - s / 2, s, s);
    } else {
      // запасний варіант — щит із зіркою
      ctx.fillStyle = 'rgba(30,33,26,0.9)';
      ctx.beginPath(); ctx.arc(W / 2, cy, R, 0, Math.PI * 2); ctx.fill();
      drawShield(ctx, W / 2, cy, 46, goldGrad(ctx, W / 2 - 40, cy - 50, W / 2 + 40, cy + 50), C.bg0);
    }

    // вордмарк «АРТАН» з декоративними лініями
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    font(ctx, 400, 34, F_WORD);
    ctx.fillStyle = C.olive;
    var ww = spacedText(ctx, 'АРТАН', W / 2, 266, 14);
    ctx.strokeStyle = 'rgba(195,199,154,0.6)';
    ctx.lineWidth = 1.5;
    var lx = ww / 2 + 26;
    ctx.beginPath();
    ctx.moveTo(W / 2 - lx, 254); ctx.lineTo(W / 2 - lx - 120, 254);
    ctx.moveTo(W / 2 + lx, 254); ctx.lineTo(W / 2 + lx + 120, 254);
    ctx.stroke();
    ctx.fillStyle = C.olive;
    [-1, 1].forEach(function (s) {
      var x = W / 2 + s * (lx - 8);
      ctx.beginPath();
      ctx.moveTo(x, 249); ctx.lineTo(x + 5, 254); ctx.lineTo(x, 259); ctx.lineTo(x - 5, 254);
      ctx.closePath(); ctx.fill();
    });

    // заголовок
    font(ctx, 600, 72, F_DISPLAY);
    var title = 'ДИПЛОМ ЗАХИСНИКА';
    var tw = spacedWidth(ctx, title, 6);
    var size = 72;
    while (tw > 1100 && size > 50) { size -= 2; font(ctx, 600, size, F_DISPLAY); tw = spacedWidth(ctx, title, 6); }
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = goldGrad(ctx, 0, 284, 0, 344);
    spacedText(ctx, title, W / 2, 342, 6);
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,226,122,0.35)';
    ctx.lineWidth = 1;
    ctx.fillStyle = 'rgba(0,0,0,0)';
  }

  /* ---------------- щит / печатка ---------------- */

  function starPath(ctx, cx, cy, ro, ri, n) {
    ctx.beginPath();
    for (var i = 0; i < n * 2; i++) {
      var r = i % 2 ? ri : ro, a = -Math.PI / 2 + i * Math.PI / n;
      var x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
  }

  function shieldPath(ctx, cx, cy, h) {
    var w = h * 0.8;
    ctx.beginPath();
    ctx.moveTo(cx - w / 2, cy - h / 2);
    ctx.lineTo(cx + w / 2, cy - h / 2);
    ctx.lineTo(cx + w / 2, cy + h * 0.05);
    ctx.quadraticCurveTo(cx + w / 2, cy + h * 0.38, cx, cy + h / 2);
    ctx.quadraticCurveTo(cx - w / 2, cy + h * 0.38, cx - w / 2, cy + h * 0.05);
    ctx.closePath();
  }

  function drawShield(ctx, cx, cy, h, fill, starFill) {
    shieldPath(ctx, cx, cy, h);
    ctx.fillStyle = fill;
    ctx.fill();
    starPath(ctx, cx, cy - h * 0.03, h * 0.28, h * 0.12, 5);
    ctx.fillStyle = starFill;
    ctx.fill();
  }

  function drawSeal(ctx, cx, cy) {
    var R = 80;
    // стрічки під печаткою
    ctx.save();
    [-1, 1].forEach(function (s) {
      ctx.beginPath();
      ctx.moveTo(cx + s * 18, cy + 40);
      ctx.lineTo(cx + s * 70, cy + 80);
      ctx.lineTo(cx + s * 52, cy + 80);
      ctx.lineTo(cx + s * 50, cy + 98);
      ctx.lineTo(cx + s * -2, cy + 52);
      ctx.closePath();
      var rb = ctx.createLinearGradient(cx, cy + 40, cx + s * 60, cy + 136);
      rb.addColorStop(0, '#5E6249');
      rb.addColorStop(1, '#3A3D2C');
      ctx.fillStyle = rb;
      ctx.fill();
    });
    ctx.restore();
    ctx.save();
    // тінь
    ctx.shadowColor = 'rgba(0,0,0,0.65)';
    ctx.shadowBlur = 22;
    ctx.shadowOffsetY = 8;
    // хвилястий «восковий» край
    ctx.beginPath();
    var n = 36;
    for (var i = 0; i <= n * 4; i++) {
      var a = i / (n * 4) * Math.PI * 2;
      var r = R + 5 * Math.sin(a * n) + 1.5 * Math.sin(a * 7);
      var x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    var rg = ctx.createRadialGradient(cx - 30, cy - 35, 10, cx, cy, R + 8);
    rg.addColorStop(0, C.goldHi);
    rg.addColorStop(0.55, C.gold);
    rg.addColorStop(1, '#8F6A07');
    ctx.fillStyle = rg;
    ctx.fill();
    ctx.restore();

    // кільця
    ctx.strokeStyle = 'rgba(90,64,4,0.75)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, R - 10, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(cx, cy, R - 40, 0, Math.PI * 2); ctx.stroke();

    // текст по колу
    ctx.save();
    ctx.fillStyle = '#5A4004';
    font(ctx, 600, 15, F_DISPLAY);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    var txt = 'ШКОЛА ЗАХИСНИКА';
    var rText = R - 24;
    var sp = 3;
    var total = spacedWidth(ctx, txt, sp);
    var arc = total / rText;
    var a0 = -Math.PI / 2 - arc / 2;
    var acc = 0;
    for (var k = 0; k < txt.length; k++) {
      var ch = txt.charAt(k), cw = ctx.measureText(ch).width;
      var ang = a0 + (acc + cw / 2) / rText;
      ctx.save();
      ctx.translate(cx + Math.cos(ang) * rText, cy + Math.sin(ang) * rText);
      ctx.rotate(ang + Math.PI / 2);
      ctx.fillText(ch, 0, 0);
      ctx.restore();
      acc += cw + sp;
    }
    // нижня дуга — зірочки й «АРТАН»
    var bottom = 'АРТАН';
    font(ctx, 600, 14, F_DISPLAY);
    var bw = spacedWidth(ctx, bottom, 4);
    var barc = bw / rText;
    var b0 = Math.PI / 2 + barc / 2;
    acc = 0;
    for (var m = 0; m < bottom.length; m++) {
      var ch2 = bottom.charAt(m), cw2 = ctx.measureText(ch2).width;
      var ang2 = b0 - (acc + cw2 / 2) / rText;
      ctx.save();
      ctx.translate(cx + Math.cos(ang2) * rText, cy + Math.sin(ang2) * rText);
      ctx.rotate(ang2 - Math.PI / 2);
      ctx.fillText(ch2, 0, 0);
      ctx.restore();
      acc += cw2 + 4;
    }
    // зірочки-роздільники
    [Math.PI / 2 + barc / 2 + 0.28, Math.PI / 2 - barc / 2 - 0.28].forEach(function (a) {
      starPath(ctx, cx + Math.cos(a) * rText, cy + Math.sin(a) * rText, 5, 2.2, 5);
      ctx.fill();
    });
    ctx.restore();

    // щит зі зіркою в центрі
    shieldPath(ctx, cx, cy, 58);
    ctx.fillStyle = '#6E5205';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,236,160,0.7)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    starPath(ctx, cx, cy - 3, 18, 7.5, 5);
    var sg = ctx.createLinearGradient(cx, cy - 20, cx, cy + 16);
    sg.addColorStop(0, '#FFF2B8');
    sg.addColorStop(1, C.gold);
    ctx.fillStyle = sg;
    ctx.fill();

    // відблиск
    var hl = ctx.createRadialGradient(cx - 35, cy - 45, 2, cx - 35, cy - 45, 60);
    hl.addColorStop(0, 'rgba(255,255,240,0.35)');
    hl.addColorStop(1, 'rgba(255,255,240,0)');
    ctx.fillStyle = hl;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();

  }

  /* ---------------- основний текст ---------------- */

  function drawBody(ctx, o) {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';

    font(ctx, 'italic 400', 26, F_SERIF);
    ctx.fillStyle = C.muted;
    ctx.fillText('Цим засвідчується, що', W / 2, 392);

    var isCall = o.mode === 'call';
    var raw = String(o.name || '').replace(/\s+/g, ' ').trim() || (isCall ? 'Захисник' : 'Юний захисник');
    if (raw.length > 48) raw = raw.slice(0, 47) + '…';
    var name = isCall ? '«' + raw + '»' : raw;

    var nameY = 476, maxW = 1240;
    var size = fitSize(ctx, name, 600, F_DISPLAY, 88, 40, maxW, 0.01);
    var nw = spacedWidth(ctx, name, size * 0.01);
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.7)';
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = C.text;
    spacedText(ctx, name, W / 2, nameY, size * 0.01);
    ctx.restore();

    // підкреслення-розчерк
    var uw = Math.max(380, Math.min(nw + 80, 1300));
    var ug = ctx.createLinearGradient(W / 2 - uw / 2, 0, W / 2 + uw / 2, 0);
    ug.addColorStop(0, 'rgba(242,194,48,0)');
    ug.addColorStop(0.2, 'rgba(242,194,48,0.9)');
    ug.addColorStop(0.8, 'rgba(242,194,48,0.9)');
    ug.addColorStop(1, 'rgba(242,194,48,0)');
    ctx.strokeStyle = ug;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(W / 2 - uw / 2, nameY + 20); ctx.lineTo(W / 2 + uw / 2, nameY + 20); ctx.stroke();
    ctx.fillStyle = C.gold;
    ctx.beginPath();
    ctx.moveTo(W / 2, nameY + 13); ctx.lineTo(W / 2 + 7, nameY + 20); ctx.lineTo(W / 2, nameY + 27); ctx.lineTo(W / 2 - 7, nameY + 20);
    ctx.closePath(); ctx.fill();

    if (isCall) {
      // підпис «позивний» на лінії
      font(ctx, 500, 15, F_BODY);
      var cap = 'ПОЗИВНИЙ';
      var cw = spacedWidth(ctx, cap, 4) + 28;
      ctx.fillStyle = '#16180F';
      roundRect(ctx, W / 2 - cw / 2, nameY + 32, cw, 26, 13);
      ctx.fill();
      ctx.strokeStyle = 'rgba(195,199,154,0.45)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = C.olive;
      ctx.textBaseline = 'middle';
      spacedText(ctx, cap, W / 2, nameY + 46, 4);
      ctx.textBaseline = 'alphabetic';
    }

    var bodyY = isCall ? 570 : 548;
    font(ctx, 400, 24, F_BODY);
    ctx.fillStyle = C.text;
    var body = 'успішно пройшов(-ла) навчання у Школі захисника та опанував(-ла) навички безпеки';
    var lines = wrapLines(ctx, body, 1200);
    for (var i = 0; i < lines.length; i++) ctx.fillText(lines[i], W / 2, bodyY + i * 32);
    return bodyY + (lines.length - 1) * 32;
  }

  var BADGE_H = 78;

  function drawBadges(ctx, o, top) {
    var items = [
      { label: 'ЗВАННЯ', value: String(o.rank || 'Новобранець'), icon: 'star' },
      { label: 'БАЛИ', value: fmtXp(o.xp) + ' XP', icon: 'bolt' }
    ];
    var city = String(o.city || '').trim();
    if (city) items.push({ label: 'МІСТО', value: city, icon: 'pin' });

    var bw = items.length > 2 ? 372 : 400, bh = BADGE_H, gap = 30;
    var total = items.length * bw + (items.length - 1) * gap;
    var x = W / 2 - total / 2;
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var bx = x + i * (bw + gap);
      var bg = ctx.createLinearGradient(0, top, 0, top + bh);
      bg.addColorStop(0, 'rgba(46,50,38,0.92)');
      bg.addColorStop(1, 'rgba(22,24,18,0.92)');
      roundRect(ctx, bx, top, bw, bh, 18);
      ctx.fillStyle = bg;
      ctx.fill();
      ctx.strokeStyle = 'rgba(242,194,48,0.55)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // іконка в колі
      var icx = bx + 44, icy = top + bh / 2;
      ctx.beginPath(); ctx.arc(icx, icy, 25, 0, Math.PI * 2);
      ctx.fillStyle = goldGrad(ctx, icx - 25, icy - 25, icx + 25, icy + 25);
      ctx.fill();
      ctx.fillStyle = C.bg0;
      ctx.strokeStyle = C.bg0;
      drawIcon(ctx, it.icon, icx, icy);

      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      var maxW = bw - 84 - 18;
      var sz = fitSize(ctx, it.value, 600, F_DISPLAY, 30, 18, maxW, 0);
      var twoLine = !(sz >= 22 || it.value.indexOf(' ') < 0);
      font(ctx, 600, 14, F_BODY);
      ctx.fillStyle = C.muted;
      var lx = bx + 84;
      // розрядка вручну
      var cx = lx;
      for (var k = 0; k < it.label.length; k++) {
        ctx.fillText(it.label.charAt(k), cx, top + (twoLine ? 24 : 30));
        cx += ctx.measureText(it.label.charAt(k)).width + 2.5;
      }
      ctx.fillStyle = it.icon === 'bolt' ? C.gold : C.text;
      fitSize(ctx, it.value, 600, F_DISPLAY, 30, 18, maxW, 0);
      if (!twoLine) {
        ctx.fillText(ellipsize(ctx, it.value, maxW), lx, top + 62);
      } else {
        // довге значення — у два рядки
        font(ctx, 600, 19, F_DISPLAY);
        var vl = wrapLines(ctx, it.value, maxW);
        var l2 = vl.slice(1).join(' ');
        ctx.fillText(ellipsize(ctx, vl[0], maxW), lx, top + 46);
        ctx.fillText(ellipsize(ctx, l2, maxW), lx, top + 67);
      }
    }
    ctx.textAlign = 'center';
    return top + bh;
  }

  function drawIcon(ctx, kind, cx, cy) {
    if (kind === 'star') {
      starPath(ctx, cx, cy + 1, 14, 6, 5);
      ctx.fill();
    } else if (kind === 'bolt') {
      ctx.beginPath();
      ctx.moveTo(cx + 3, cy - 15); ctx.lineTo(cx - 9, cy + 2); ctx.lineTo(cx - 1, cy + 2);
      ctx.lineTo(cx - 4, cy + 15); ctx.lineTo(cx + 9, cy - 3); ctx.lineTo(cx + 1, cy - 3);
      ctx.closePath(); ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(cx, cy - 4, 9, Math.PI * 0.85, Math.PI * 2.15);
      ctx.lineTo(cx, cy + 14);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = C.gold;
      ctx.beginPath(); ctx.arc(cx, cy - 4, 3.6, 0, Math.PI * 2); ctx.fill();
    }
  }

  var CHIP = { h: 40, rowGap: 10, maxRowW: 1300, gap: 12, maxRows: 2, padL: 40, padR: 20, maxText: 520 };

  // розкладка чипів місій (не малює) -> { rows, rw } або null, якщо місій немає
  function layoutMissions(ctx, missions) {
    var list = [];
    for (var i = 0; i < (missions || []).length; i++) {
      var m = String(missions[i] == null ? '' : missions[i]).replace(/\s+/g, ' ').trim();
      if (m) list.push(m);
    }
    if (!list.length) return null;
    font(ctx, 500, 19, F_BODY);
    var chips = list.map(function (t) {
      var s = ellipsize(ctx, t, CHIP.maxText);
      return { text: s, w: ctx.measureText(s).width + CHIP.padL + CHIP.padR };
    });
    function layout(chs) {
      var rows = [[]], rw = [0];
      for (var j = 0; j < chs.length; j++) {
        var r = rows.length - 1, add = (rows[r].length ? CHIP.gap : 0) + chs[j].w;
        if (rw[r] + add > CHIP.maxRowW && rows[r].length) { rows.push([]); rw.push(0); r++; add = chs[j].w; }
        rows[r].push(chs[j]); rw[r] += add;
      }
      return { rows: rows, rw: rw };
    }
    var lay = layout(chips);
    if (lay.rows.length > CHIP.maxRows) {
      // прибираємо хвіст і додаємо чип «+ ще N»
      var keep = chips.length;
      while (keep > 0) {
        keep--;
        var more = { text: '+ ще ' + (chips.length - keep), w: 0, more: true };
        more.w = ctx.measureText(more.text).width + 36;
        lay = layout(chips.slice(0, keep).concat([more]));
        if (lay.rows.length <= CHIP.maxRows) break;
      }
    }
    return lay;
  }

  function missionsHeight(lay) {
    return 36 + (lay ? lay.rows.length * CHIP.h + (lay.rows.length - 1) * CHIP.rowGap : 40);
  }

  function drawMissions(ctx, lay, top) {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    font(ctx, 600, 16, F_BODY);
    ctx.fillStyle = C.olive;
    var hw = spacedText(ctx, 'ОПАНОВАНІ МІСІЇ', W / 2, top + 22, 3);
    ctx.strokeStyle = 'rgba(195,199,154,0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W / 2 - hw / 2 - 18, top + 16); ctx.lineTo(W / 2 - hw / 2 - 150, top + 16);
    ctx.moveTo(W / 2 + hw / 2 + 18, top + 16); ctx.lineTo(W / 2 + hw / 2 + 150, top + 16);
    ctx.stroke();

    var rowTop = top + 36, chipH = CHIP.h, rowGap = CHIP.rowGap, gap = CHIP.gap, padL = CHIP.padL;
    if (!lay) {
      font(ctx, 'italic 400', 26, F_SERIF);
      ctx.fillStyle = C.gold;
      ctx.fillText('Перші кроки зроблено!', W / 2, rowTop + 28);
      return;
    }
    font(ctx, 500, 19, F_BODY);

    for (var r = 0; r < lay.rows.length; r++) {
      var row = lay.rows[r];
      var x = W / 2 - lay.rw[r] / 2, y = rowTop + r * (chipH + rowGap);
      for (var c = 0; c < row.length; c++) {
        var ch = row[c];
        roundRect(ctx, x, y, ch.w, chipH, chipH / 2);
        if (ch.more) {
          ctx.fillStyle = 'rgba(242,194,48,0.12)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(242,194,48,0.7)';
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = C.gold;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(ch.text, x + ch.w / 2, y + chipH / 2 + 1);
        } else {
          var cg = ctx.createLinearGradient(0, y, 0, y + chipH);
          cg.addColorStop(0, 'rgba(195,199,154,0.20)');
          cg.addColorStop(1, 'rgba(195,199,154,0.08)');
          ctx.fillStyle = cg;
          ctx.fill();
          ctx.strokeStyle = 'rgba(195,199,154,0.55)';
          ctx.lineWidth = 1.2;
          ctx.stroke();
          // галочка
          var gx = x + 21, gy = y + chipH / 2;
          ctx.beginPath(); ctx.arc(gx, gy, 10, 0, Math.PI * 2);
          ctx.fillStyle = C.gold; ctx.fill();
          ctx.strokeStyle = C.bg0; ctx.lineWidth = 2.4; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
          ctx.beginPath(); ctx.moveTo(gx - 4.5, gy + 0.5); ctx.lineTo(gx - 1, gy + 4); ctx.lineTo(gx + 5, gy - 3.5); ctx.stroke();
          ctx.lineCap = 'butt'; ctx.lineJoin = 'miter';
          ctx.fillStyle = C.text;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText(ch.text, x + padL, y + chipH / 2 + 1);
        }
        x += ch.w + gap;
      }
    }
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
  }

  function drawFooter(ctx, o) {
    var lineY = 958, colW = 340;
    var cols = [
      { cx: 330, value: fmtDate(o.date), label: 'Дата' },
      { cx: W - 330, value: '№ ' + (String(o.serial || '').trim() || '—'), label: 'Номер диплома' }
    ];
    for (var i = 0; i < cols.length; i++) {
      var c = cols[i];
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      fitSize(ctx, c.value, 500, F_DISPLAY, 32, 18, colW - 20, 0);
      ctx.fillStyle = C.text;
      ctx.fillText(ellipsize(ctx, c.value, colW - 20), c.cx, lineY - 14);
      ctx.strokeStyle = goldGrad(ctx, c.cx - colW / 2, 0, c.cx + colW / 2, 0);
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(c.cx - colW / 2, lineY); ctx.lineTo(c.cx + colW / 2, lineY); ctx.stroke();
      font(ctx, 500, 15, F_BODY);
      ctx.fillStyle = C.muted;
      spacedText(ctx, c.label.toUpperCase(), c.cx, lineY + 26, 2.5);
    }

    drawSeal(ctx, W / 2, 928);

    ctx.textAlign = 'center';
    font(ctx, 'italic 400', 20, F_SERIF);
    ctx.fillStyle = C.olive;
    ctx.fillText('Знаємо. Знаходимо. Знищуємо.', W / 2, 1034);
    font(ctx, 400, 13, F_BODY);
    ctx.fillStyle = 'rgba(169,173,157,0.75)';
    ctx.fillText('Тестова версія застосунку «Артан»', W / 2, 1056);
  }

  /* ---------------- публічний API ---------------- */

  function render(opts) {
    var o = opts || {};
    return Promise.all([loadFonts(), loadEmblem()]).then(function (r) {
      var emblem = r[1];
      var canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      var ctx = canvas.getContext('2d');
      var rand = rng(o.serial || o.name);

      drawBackground(ctx, rand);
      drawFrame(ctx);
      drawHeader(ctx, emblem);
      drawFooter(ctx, o);

      // середній блок центруємо по вертикалі у вільному просторі
      var lay = layoutMissions(ctx, o.missions);
      var blockEnd = (o.mode === 'call' ? 570 : 548) + 26 + BADGE_H + 16 + missionsHeight(lay);
      var dy = Math.max(0, Math.min(44, (830 - blockEnd) / 2));
      ctx.save();
      ctx.translate(0, Math.round(dy));
      var y = drawBody(ctx, o);
      y = drawBadges(ctx, o, y + 26);
      drawMissions(ctx, lay, y + 16);
      ctx.restore();
      return canvas;
    });
  }

  window.ArtanDiploma = { render: render };
})();
