/* ArtanMap3D — dependency-free pseudo-3D map of Ukraine (SVG + CSS 3D transforms).
   window.ArtanMap3D.mount(container, cities, onSelect) -> { select(i|null), destroy() } */
(function () {
  'use strict';

  var OUTLINE = [[22.15,48.4],[22.6,49.1],[22.7,49.55],[23.6,50.35],[24.1,50.6],[24.0,50.85],[23.65,51.5],[23.6,51.62],[24.3,51.75],[25.3,51.95],[26.5,51.85],[27.5,51.6],[28.6,51.5],[29.3,51.4],[30.2,51.5],[30.55,51.28],[30.95,52.05],[31.8,52.1],[32.4,52.3],[33.2,52.37],[33.85,52.3],[34.4,51.8],[34.3,51.25],[35.1,51.2],[35.6,50.4],[36.3,50.3],[37.5,50.4],[38.0,49.95],[39.2,49.85],[40.1,49.6],[40.2,49.25],[39.7,48.6],[39.95,48.3],[39.8,47.85],[38.85,47.85],[38.2,47.1],[37.55,47.07],[36.8,46.75],[35.9,46.6],[35.35,46.35],[34.85,46.15],[35.0,45.7],[35.5,45.3],[36.6,45.42],[36.45,45.05],[35.4,45.0],[34.4,44.75],[33.75,44.4],[33.4,44.6],[33.55,45.1],[32.5,45.35],[33.0,45.75],[33.65,46.1],[32.9,46.1],[31.8,46.3],[32.0,46.6],[31.55,46.6],[30.75,46.5],[30.5,46.1],[29.75,45.6],[29.65,45.2],[28.2,45.45],[28.5,45.75],[28.95,46.1],[29.6,46.4],[30.15,46.4],[29.9,46.8],[29.55,47.35],[29.2,47.9],[28.9,48.0],[28.2,48.2],[27.5,48.45],[26.6,48.25],[26.2,47.98],[25.2,47.9],[24.9,47.72],[24.2,47.9],[23.2,48.1],[22.9,48.0]];
  var DNIPRO = [[30.62,51.3],[30.5,50.95],[30.56,50.5],[30.95,50.1],[31.55,49.8],[32.1,49.45],[32.6,49.15],[33.4,49.07],[34.1,48.9],[34.6,48.55],[35.05,48.45],[35.17,48.05],[35.15,47.82],[34.6,47.58],[34.1,47.5],[33.4,46.82],[32.65,46.66],[32.05,46.6]];

  var STYLE_ID = 'am3d-style';
  var CSS = [
    '.am3d-root{position:relative;width:100%;overflow:hidden;background:radial-gradient(ellipse 75% 65% at 50% 55%,#171a12 0%,#0f110d 55%,#0A0B09 100%);color:#EDEBE2;font-family:Inter,system-ui,sans-serif;-webkit-user-select:none;user-select:none;touch-action:pan-y;cursor:grab;-webkit-tap-highlight-color:transparent;outline:none}',
    '.am3d-root.am3d-grab{cursor:grabbing}',
    '.am3d-frame{position:absolute;inset:8px;pointer-events:none;background:',
    'linear-gradient(#4a5040,#4a5040) left top/12px 1px no-repeat,linear-gradient(#4a5040,#4a5040) left top/1px 12px no-repeat,',
    'linear-gradient(#4a5040,#4a5040) right top/12px 1px no-repeat,linear-gradient(#4a5040,#4a5040) right top/1px 12px no-repeat,',
    'linear-gradient(#4a5040,#4a5040) left bottom/12px 1px no-repeat,linear-gradient(#4a5040,#4a5040) left bottom/1px 12px no-repeat,',
    'linear-gradient(#4a5040,#4a5040) right bottom/12px 1px no-repeat,linear-gradient(#4a5040,#4a5040) right bottom/1px 12px no-repeat}',
    '.am3d-stage{position:absolute;left:0;top:0;right:0;bottom:0;perspective-origin:50% 50%}',
    '.am3d-slab{position:absolute;left:50%;top:50%;transform-style:preserve-3d;will-change:transform}',
    '.am3d-slab>*{position:absolute;left:0;top:0;overflow:visible}',
    '.am3d-ground{pointer-events:none}',
    '.am3d-shadow{filter:blur(10px);opacity:.85}',
    '.am3d-glow{filter:blur(9px);opacity:.35}',
    '.am3d-overlay{position:absolute;left:0;top:0;right:0;bottom:0;pointer-events:none}',
    '.am3d-pin{position:absolute;left:0;top:0;width:0;height:0}',
    '.am3d-pinin{position:absolute;left:0;top:0;width:0;height:0;transform-origin:0 0}',
    '.am3d-col{position:absolute;left:-1px;width:2px;transform-origin:50% 100%;border-radius:2px;background:linear-gradient(to top,rgba(242,194,48,.95),rgba(242,194,48,.35) 60%,rgba(242,194,48,0));box-shadow:0 0 6px rgba(242,194,48,.55);transition:width .25s,left .25s}',
    '.am3d-head{position:absolute;left:0;top:0;width:7px;height:7px;margin:-3.5px 0 0 -3.5px;border-radius:50%;background:#F2C230;box-shadow:0 0 0 2px rgba(10,11,9,.55),0 0 10px 2px rgba(242,194,48,.75);transition:width .25s,height .25s,margin .25s,background .25s,box-shadow .25s}',
    '.am3d-hit{position:absolute;left:-19px;top:-38px;width:38px;height:46px;pointer-events:auto;cursor:pointer;border-radius:10px;outline:none}',
    '.am3d-hit:focus-visible{box-shadow:0 0 0 2px #F2C230,0 0 0 4px rgba(10,11,9,.8)}',
    '.am3d-sel .am3d-col{left:-1.5px;width:3px;background:linear-gradient(to top,#fff,rgba(255,248,214,.6) 55%,rgba(255,248,214,0));box-shadow:0 0 10px rgba(255,255,255,.75),0 0 18px rgba(242,194,48,.6)}',
    '.am3d-sel .am3d-head{width:12px;height:12px;margin:-6px 0 0 -6px;background:#fff;box-shadow:0 0 0 2px rgba(10,11,9,.5),0 0 14px 4px rgba(255,255,255,.85),0 0 28px 6px rgba(242,194,48,.6)}',
    '.am3d-label{position:absolute;left:0;top:0;white-space:nowrap;font:600 10.5px/1 Inter,system-ui,sans-serif;letter-spacing:.02em;color:#EDEBE2;padding:3px 5px;border-radius:3px;background:rgba(10,11,9,.78);border:1px solid rgba(195,199,154,.28);pointer-events:auto;cursor:pointer;transition:background .25s,color .25s,border-color .25s}',
    '.am3d-sm .am3d-label{font-size:9.5px;padding:2px 4px}',
    '.am3d-label.am3d-sel{background:#EDEBE2;color:#0A0B09;border-color:#fff;box-shadow:0 0 12px rgba(255,255,255,.35)}',
    '.am3d-ring{fill:none;stroke:#F2C230;stroke-width:1.2;transform-box:fill-box;transform-origin:center;animation:am3d-ring 2.6s ease-out infinite}',
    '.am3d-ring2{animation-delay:1.3s}',
    '.am3d-base{fill:#F2C230}',
    '.am3d-rsel .am3d-ring{stroke:#fff;stroke-width:1.6;animation-duration:1.8s}',
    '.am3d-rsel .am3d-ring2{animation-delay:.9s}',
    '.am3d-rsel .am3d-base{fill:#fff}',
    '.am3d-halo{fill:rgba(242,194,48,.18)}',
    '.am3d-rsel .am3d-halo{fill:rgba(255,255,255,.25)}',
    '.am3d-scan{transform-box:fill-box;animation:am3d-scan 6s cubic-bezier(.45,0,.55,1) infinite}',
    '.am3d-border{stroke-dasharray:1 1;stroke-dashoffset:0}',
    '.am3d-intro .am3d-border{animation:am3d-draw 1.7s .1s cubic-bezier(.6,0,.3,1) both}',
    '.am3d-intro .am3d-layer,.am3d-intro .am3d-shadow,.am3d-intro .am3d-glow,.am3d-intro .am3d-ground{animation:am3d-fade 1s .8s both}',
    '.am3d-intro .am3d-pinin{animation:am3d-pop .55s cubic-bezier(.3,1.7,.55,1) both}',
    '.am3d-intro .am3d-label,.am3d-intro .am3d-ringg{animation:am3d-fade .4s both}',
    '.am3d-intro .am3d-hud{animation:am3d-fade .8s 1.2s both}',
    '.am3d-hud{position:absolute;pointer-events:none;font-family:Inter,system-ui,sans-serif}',
    '.am3d-tl{left:16px;top:13px;font:500 11px/1 Oswald,Inter,sans-serif;letter-spacing:.14em;color:#A9AD9D;text-transform:uppercase}',
    '.am3d-tl b{color:#F2C230;font-weight:600;margin-left:6px}',
    '.am3d-tl i{font-style:normal;color:#C3C79A;margin-right:6px}',
    '.am3d-compass{right:14px;top:10px;width:26px;height:26px;border:1px solid #32372B;border-radius:50%;background:rgba(21,23,18,.7)}',
    '.am3d-needle{position:absolute;left:50%;top:50%;width:0;height:0;transform-origin:0 0}',
    '.am3d-needle:before{content:"";position:absolute;left:-3px;top:-10px;border:3px solid transparent;border-bottom:7px solid #F2C230;border-top:0}',
    '.am3d-needle:after{content:"";position:absolute;left:-3px;top:0;border:3px solid transparent;border-top:7px solid #4a5040;border-bottom:0}',
    '.am3d-bl{left:16px;bottom:12px;max-width:70%}',
    '.am3d-bl .am3d-k{font:500 9px/1 Inter,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#A9AD9D;display:block;margin-bottom:4px}',
    '.am3d-bl .am3d-v{font:500 15px/1 Oswald,Inter,sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#EDEBE2}',
    '.am3d-bl .am3d-v.am3d-muted{color:#A9AD9D;font-size:12px}',
    '.am3d-bl .am3d-v em{font-style:normal;color:#F2C230;margin-right:6px}',
    '.am3d-br{right:16px;bottom:12px;font:500 9px/1.5 Inter,sans-serif;letter-spacing:.12em;color:#6f7464;text-align:right;text-transform:uppercase}',
    '@keyframes am3d-ring{0%{transform:scale(.35);opacity:.95}100%{transform:scale(2.3);opacity:0}}',
    '@keyframes am3d-scan{0%{transform:translateX(0)}70%,100%{transform:translateX(560%)}}',
    '@keyframes am3d-draw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}',
    '@keyframes am3d-fade{from{opacity:0}}',
    '@keyframes am3d-pop{0%{transform:scale(0);opacity:0}100%{transform:scale(1);opacity:1}}',
    '@media (prefers-reduced-motion:reduce){.am3d-root *{animation:none!important;transition:none!important}.am3d-scan{display:none}}'
  ].join('\n');

  var mounts = 0;
  var uid = 0;
  var SVGNS = 'http://www.w3.org/2000/svg';

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.appendChild(document.createTextNode(CSS));
    (document.head || document.documentElement).appendChild(s);
  }
  function el(tag, cls, parent) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (parent) parent.appendChild(e);
    return e;
  }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function easeInOut(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function projU(lon) { return (lon - 21.8) * 0.663; }
  function projV(lat) { return 52.6 - lat; }
  function fmt(n) { return Math.round(n * 10) / 10; }

  // Bounds of the outline in projected units
  var minU = 1e9, maxU = -1e9, minV = 1e9, maxV = -1e9;
  (function () {
    for (var i = 0; i < OUTLINE.length; i++) {
      var u = projU(OUTLINE[i][0]), v = projV(OUTLINE[i][1]);
      if (u < minU) minU = u; if (u > maxU) maxU = u;
      if (v < minV) minV = v; if (v > maxV) maxV = v;
    }
  })();
  var UW = maxU - minU, VH = maxV - minV;

  // Smooth closed path through points (Catmull-Rom -> cubic Bezier, gentle tension)
  function smoothPath(pts, closed, tension) {
    var n = pts.length, d = 'M' + fmt(pts[0][0]) + ' ' + fmt(pts[0][1]);
    var t = tension == null ? 0.18 : tension;
    var last = closed ? n : n - 1;
    for (var i = 0; i < last; i++) {
      var p0 = pts[closed ? (i - 1 + n) % n : Math.max(i - 1, 0)];
      var p1 = pts[i];
      var p2 = pts[closed ? (i + 1) % n : i + 1];
      var p3 = pts[closed ? (i + 2) % n : Math.min(i + 2, n - 1)];
      var c1x = p1[0] + (p2[0] - p0[0]) * t, c1y = p1[1] + (p2[1] - p0[1]) * t;
      var c2x = p2[0] - (p3[0] - p1[0]) * t, c2y = p2[1] - (p3[1] - p1[1]) * t;
      d += 'C' + fmt(c1x) + ' ' + fmt(c1y) + ' ' + fmt(c2x) + ' ' + fmt(c2y) + ' ' + fmt(p2[0]) + ' ' + fmt(p2[1]);
    }
    return closed ? d + 'Z' : d;
  }

  function mount(container, cities, onSelect) {
    injectStyle();
    mounts++;
    cities = cities || [];
    var id = 'am3d' + (++uid);
    var reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

    var root = el('div', 'am3d-root', container);
    root.setAttribute('role', 'group');
    root.setAttribute('aria-label', '3D-карта України з просторами «Артан»');

    var AX0 = 54, AZ0 = -3;          // rest pose (deg)
    var selected = null;
    var destroyed = false;
    var raf = 0, timers = [];
    var t0 = (window.performance && performance.now) ? performance.now() : Date.now();
    var introStart = 0, introOn = false;
    var drag = null, moved = false;
    var off = { x: 0, z: 0 }, target = { x: 0, z: 0 };
    var g = null; // geometry/state of current build
    var lastW = 0;

    function now() { return (window.performance && performance.now) ? performance.now() : Date.now(); }

    // ---------- projection (mirrors the CSS transform exactly) ----------
    function project(px, py, pz, pose) {
      var az = pose.az * Math.PI / 180, ax = pose.ax * Math.PI / 180;
      var cz = Math.cos(az), sz = Math.sin(az), cx = Math.cos(ax), sx = Math.sin(ax);
      var x1 = px * cz - py * sz, y1 = px * sz + py * cz;
      var y2 = y1 * cx - pz * sx, z2 = y1 * sx + pz * cx;
      var y3 = y2 + pose.ty, z3 = z2 + pose.tz;
      var s = pose.P / (pose.P - z3);
      return { x: pose.ox + x1 * s, y: pose.oy + y3 * s };
    }

    function build(withIntro) {
      root.innerHTML = '';
      var cw = root.parentNode ? (container.clientWidth || 390) : 390;
      lastW = cw;
      var ch = Math.round(clamp(cw * 0.86, 300, 370));
      root.style.height = ch + 'px';
      var P = Math.round(Math.max(600, cw * 1.7));
      var padX = 12, padTop = 34, padBot = 40;
      var availW = cw - padX * 2, availH = ch - padTop - padBot;
      var COLH = 24, COLSEL = 34;

      function measure(W, ty) {
        var k = W / UW, H = VH * k, T = clamp(Math.round(W * 0.05), 10, 18);
        var pose = { ax: AX0, az: AZ0, ty: ty, tz: 0, P: P, ox: 0, oy: 0 };
        var mnx = 1e9, mxx = -1e9, mny = 1e9, mxy = -1e9, i, p, q;
        function add(pt) { if (pt.x < mnx) mnx = pt.x; if (pt.x > mxx) mxx = pt.x; if (pt.y < mny) mny = pt.y; if (pt.y > mxy) mxy = pt.y; }
        for (i = 0; i < OUTLINE.length; i++) {
          var x = (projU(OUTLINE[i][0]) - minU) * k - W / 2, y = (projV(OUTLINE[i][1]) - minV) * k - H / 2;
          add(project(x, y, 0, pose)); add(project(x, y, -T, pose));
        }
        for (i = 0; i < cities.length; i++) {
          var cx = (projU(cities[i].lon) - minU) * k - W / 2, cy = (projV(cities[i].lat) - minV) * k - H / 2;
          p = project(cx, cy, COLSEL, pose); q = { x: p.x, y: p.y - 22 }; add(q);
        }
        return { minX: mnx, maxX: mxx, minY: mny, maxY: mxy, w: mxx - mnx, h: mxy - mny };
      }
      var W = cw * 0.8, ty = 0, m, it;
      for (it = 0; it < 5; it++) {
        m = measure(W, ty);
        W *= Math.min(availW / m.w, availH / m.h);
        m = measure(W, ty);
        var targetCy = padTop + availH / 2 - ch / 2;
        ty += targetCy - (m.minY + m.maxY) / 2;
      }
      W = Math.round(W);
      var k = W / UW, H = Math.round(VH * k), T = clamp(Math.round(W * 0.05), 10, 18);

      var pts = [], i;
      for (i = 0; i < OUTLINE.length; i++) pts.push([(projU(OUTLINE[i][0]) - minU) * k, (projV(OUTLINE[i][1]) - minV) * k]);
      var D = smoothPath(pts, true, 0.16);
      var rv = [];
      for (i = 0; i < DNIPRO.length; i++) rv.push([(projU(DNIPRO[i][0]) - minU) * k, (projV(DNIPRO[i][1]) - minV) * k]);
      var RD = smoothPath(rv, false, 0.2);

      var cpos = [];
      for (i = 0; i < cities.length; i++) cpos.push([(projU(cities[i].lon) - minU) * k, (projV(cities[i].lat) - minV) * k]);

      root.className = 'am3d-root' + (withIntro ? ' am3d-intro' : '') + (cw < 380 ? ' am3d-sm' : '');
      el('div', 'am3d-frame', root);
      var stage = el('div', 'am3d-stage', root);
      stage.style.perspective = P + 'px';
      var slab = el('div', 'am3d-slab', stage);
      slab.style.width = W + 'px'; slab.style.height = H + 'px';
      slab.style.marginLeft = (-W / 2) + 'px'; slab.style.marginTop = (-H / 2) + 'px';

      function svgWrap(cls, z, inner, w, h, x, y) {
        var wrap = document.createElement('div');
        wrap.className = cls;
        wrap.style.width = (w || W) + 'px'; wrap.style.height = (h || H) + 'px';
        wrap.style.transform = 'translate3d(' + (x || 0) + 'px,' + (y || 0) + 'px,' + z + 'px)';
        wrap.innerHTML = '<svg xmlns="' + SVGNS + '" width="' + (w || W) + '" height="' + (h || H) + '" viewBox="0 0 ' + (w || W) + ' ' + (h || H) + '" style="overflow:visible;display:block">' + inner + '</svg>';
        slab.appendChild(wrap);
        return wrap;
      }

      // ground "radar" plane well below the slab
      var GS = Math.round(W * 1.5), gx = (W - GS) / 2, gy = (H - GS) / 2, gc = GS / 2, gr = '';
      gr += '<defs><radialGradient id="' + id + 'gf"><stop offset="0" stop-color="#C3C79A" stop-opacity=".16"/><stop offset=".55" stop-color="#C3C79A" stop-opacity=".07"/><stop offset="1" stop-color="#C3C79A" stop-opacity="0"/></radialGradient>' +
        '<mask id="' + id + 'gm"><rect width="' + GS + '" height="' + GS + '" fill="url(#' + id + 'gr)"/></mask>' +
        '<radialGradient id="' + id + 'gr"><stop offset="0" stop-color="#fff"/><stop offset=".45" stop-color="#fff" stop-opacity=".7"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>';
      gr += '<g mask="url(#' + id + 'gm)" stroke="#5a604c" stroke-width="1" fill="none">';
      for (i = 1; i <= 5; i++) gr += '<circle cx="' + gc + '" cy="' + gc + '" r="' + (gc * i / 5.2) + '"' + (i % 2 ? ' stroke-dasharray="2 4"' : '') + '/>';
      gr += '<line x1="0" y1="' + gc + '" x2="' + GS + '" y2="' + gc + '"/><line x1="' + gc + '" y1="0" x2="' + gc + '" y2="' + GS + '"/>';
      for (i = 0; i < 36; i++) {
        var a = i * Math.PI / 18, r1 = gc * 0.93, r2 = gc * (i % 3 ? 0.96 : 1);
        gr += '<line x1="' + fmt(gc + Math.cos(a) * r1) + '" y1="' + fmt(gc + Math.sin(a) * r1) + '" x2="' + fmt(gc + Math.cos(a) * r2) + '" y2="' + fmt(gc + Math.sin(a) * r2) + '"/>';
      }
      gr += '</g><circle cx="' + gc + '" cy="' + gc + '" r="' + gc * 0.7 + '" fill="url(#' + id + 'gf)"/>';
      svgWrap('am3d-ground', -T - 46, gr, GS, GS, gx, gy);

      // shadow + glow under the plate
      svgWrap('am3d-shadow', -T - 26, '<path d="' + D + '" fill="#000"/>', 0, 0, 6, 10);
      svgWrap('am3d-glow', -T - 2, '<path d="' + D + '" fill="#C3C79A" stroke="#C3C79A" stroke-width="6"/>');

      // extruded side: stacked layers, darker with depth
      for (i = T; i >= 1; i--) {
        var f = i / T;
        var r = Math.round(46 - 30 * f), gg = Math.round(50 - 32 * f), b = Math.round(36 - 23 * f);
        var col = 'rgb(' + r + ',' + gg + ',' + b + ')';
        var extra = (i === T) ? ' stroke="#6b7155" stroke-opacity=".55" stroke-width="1"' : ' stroke="' + col + '" stroke-width="1"';
        if (i === 1) extra = ' stroke="#8f9471" stroke-width="1.2"';
        svgWrap('am3d-layer', -i, '<path d="' + D + '" fill="' + col + '"' + extra + '/>');
      }

      // top surface
      var gsz = Math.max(10, Math.round(W / 26));
      var top = '<defs>' +
        '<linearGradient id="' + id + 'tf" x1="0" y1="0" x2=".35" y2="1"><stop offset="0" stop-color="#454b35"/><stop offset=".55" stop-color="#363b2a"/><stop offset="1" stop-color="#2a2e20"/></linearGradient>' +
        '<radialGradient id="' + id + 'sh" cx=".3" cy=".15" r=".8"><stop offset="0" stop-color="#EDEBE2" stop-opacity=".13"/><stop offset="1" stop-color="#EDEBE2" stop-opacity="0"/></radialGradient>' +
        '<pattern id="' + id + 'gp" width="' + gsz + '" height="' + gsz + '" patternUnits="userSpaceOnUse">' +
          '<path d="M' + gsz + ' 0H0V' + gsz + '" fill="none" stroke="#C3C79A" stroke-opacity=".09" stroke-width=".6"/>' +
          '<circle cx="0" cy="0" r=".9" fill="#C3C79A" fill-opacity=".35"/>' +
          '<circle cx="' + gsz / 2 + '" cy="' + gsz / 2 + '" r=".5" fill="#C3C79A" fill-opacity=".18"/></pattern>' +
        '<clipPath id="' + id + 'cl"><path d="' + D + '"/></clipPath>' +
        '<linearGradient id="' + id + 'sc" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#F2EFC8" stop-opacity="0"/><stop offset=".7" stop-color="#F2EFC8" stop-opacity=".16"/><stop offset=".93" stop-color="#FFF8D6" stop-opacity=".42"/><stop offset="1" stop-color="#FFF8D6" stop-opacity="0"/></linearGradient>' +
        '</defs>' +
        '<path d="' + D + '" fill="url(#' + id + 'tf)"/>' +
        '<path d="' + D + '" fill="url(#' + id + 'gp)"/>' +
        '<path d="' + D + '" fill="url(#' + id + 'sh)"/>' +
        '<g clip-path="url(#' + id + 'cl)">' + (reduced ? '' : '<rect class="am3d-scan" x="' + (-W * 0.3) + '" y="-4" width="' + (W * 0.25) + '" height="' + (H + 8) + '" fill="url(#' + id + 'sc)"/>') + '</g>' +
        '<path d="' + RD + '" fill="none" stroke="#0A0B09" stroke-opacity=".45" stroke-width="3.2" stroke-linecap="round"/>' +
        '<path d="' + RD + '" fill="none" stroke="#8FA3AA" stroke-opacity=".75" stroke-width="1.4" stroke-linecap="round"/>' +
        '<path class="am3d-border" pathLength="1" d="' + D + '" fill="none" stroke="#C3C79A" stroke-opacity=".25" stroke-width="4" stroke-linejoin="round"/>' +
        '<path class="am3d-border" pathLength="1" d="' + D + '" fill="none" stroke="#D6D9AE" stroke-width="1.4" stroke-linejoin="round"/>';
      for (i = 0; i < cpos.length; i++) {
        top += '<g class="am3d-ringg" data-i="' + i + '" transform="translate(' + fmt(cpos[i][0]) + ' ' + fmt(cpos[i][1]) + ')">' +
          '<circle class="am3d-halo" r="6"/><circle class="am3d-ring" r="7"/><circle class="am3d-ring am3d-ring2" r="7"/><circle class="am3d-base" r="2.2"/></g>';
      }
      var topEl = svgWrap('am3d-top', 0, top);
      var rings = topEl.querySelectorAll('.am3d-ringg');

      // overlay pins + labels
      var overlay = el('div', 'am3d-overlay', root);
      var pins = [];
      for (i = 0; i < cities.length; i++) {
        var pin = el('div', 'am3d-pin', overlay);
        var pinin = el('div', 'am3d-pinin', pin);
        var colEl = el('div', 'am3d-col', pinin);
        var head = el('div', 'am3d-head', pinin);
        var hit = el('div', 'am3d-hit', pinin);
        hit.setAttribute('role', 'button');
        hit.setAttribute('tabindex', '0');
        hit.setAttribute('aria-label', 'Простір «Артан», ' + cities[i].c);
        hit.setAttribute('aria-pressed', 'false');
        var lab = el('div', 'am3d-label', overlay);
        lab.setAttribute('aria-hidden', 'true');
        lab.appendChild(document.createTextNode(cities[i].c));
        var delay = withIntro ? (1.25 + i * 0.09) : 0;
        if (withIntro) {
          pinin.style.animationDelay = delay + 's';
          lab.style.animationDelay = (delay + 0.15) + 's';
          if (rings[i]) rings[i].style.animationDelay = delay + 's';
        }
        (function (idx) {
          function act() { choose(idx, true); }
          hit.addEventListener('click', function (e) { if (!moved) choose(nearestPin(e, idx), true); });
          lab.addEventListener('click', function () { if (!moved) act(); });
          hit.addEventListener('keydown', function (e) {
            var kk = e.key || e.keyCode;
            if (kk === 'Enter' || kk === ' ' || kk === 'Spacebar' || kk === 13 || kk === 32) { e.preventDefault(); act(); }
          });
        })(i);
        pins.push({ pin: pin, col: colEl, head: head, hit: hit, lab: lab, lw: 0, lh: 0, place: 0,
          x: cpos[i][0] - W / 2, y: cpos[i][1] - H / 2 });
      }

      // HUD
      var tl = el('div', 'am3d-hud am3d-tl', root);
      tl.innerHTML = '<i>UA</i>Простори «Артан»<b>' + (cities.length < 10 ? '0' : '') + cities.length + '</b>';
      tl.setAttribute('aria-hidden', 'true');
      var comp = el('div', 'am3d-hud am3d-compass', root);
      comp.setAttribute('aria-hidden', 'true');
      var needle = el('div', 'am3d-needle', comp);
      var bl = el('div', 'am3d-hud am3d-bl', root);
      bl.setAttribute('aria-live', 'polite');
      var br = el('div', 'am3d-hud am3d-br', root);
      br.setAttribute('aria-hidden', 'true');
      br.innerHTML = '44°–52° Пн<br>22°–40° Сх';

      g = { cw: cw, ch: ch, P: P, W: W, H: H, T: T, ty: ty, COLH: COLH, COLSEL: COLSEL,
        slab: slab, pins: pins, rings: rings, needle: needle, bl: bl };

      measureLabels();
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function () { if (!destroyed && g && g.pins === pins) { measureLabels(); kick(); } });
      }
      applySelection();

      introOn = !!withIntro;
      introStart = now();
      if (withIntro) {
        timers.push(setTimeout(function () {
          introOn = false;
          if (!destroyed) root.className = root.className.replace(' am3d-intro', '');
        }, 2900));
      }
      kick();
    }

    function measureLabels() {
      for (var i = 0; i < g.pins.length; i++) {
        g.pins[i].lw = g.pins[i].lab.offsetWidth || 40;
        g.pins[i].lh = g.pins[i].lab.offsetHeight || 16;
      }
    }

    function applySelection() {
      if (!g) return;
      for (var i = 0; i < g.pins.length; i++) {
        var on = i === selected;
        var p = g.pins[i];
        p.pin.className = 'am3d-pin' + (on ? ' am3d-sel' : '');
        p.lab.className = 'am3d-label' + (on ? ' am3d-sel' : '');
        p.hit.setAttribute('aria-pressed', on ? 'true' : 'false');
        var rg = g.rings[i];
        if (rg) rg.setAttribute('class', 'am3d-ringg' + (on ? ' am3d-rsel' : ''));
      }
      if (selected != null && cities[selected]) {
        var c = cities[selected];
        g.bl.innerHTML = '<span class="am3d-k">Обраний простір</span><span class="am3d-v"><em>◆</em></span>';
        g.bl.lastChild.appendChild(document.createTextNode(c.c));
      } else {
        g.bl.innerHTML = '<span class="am3d-k">Мапа просторів</span><span class="am3d-v am3d-muted">Оберіть точку на мапі</span>';
      }
      // measure the (possibly bolder) selected label after class change
      measureLabels();
    }

    // overlapping hit areas: pick the pin whose beacon is closest to the tap point
    function nearestPin(e, fallback) {
      if (!g || !g.lastProj || e.clientX == null || (e.clientX === 0 && e.clientY === 0)) return fallback;
      var r = root.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      var best = fallback, bd = 1e9;
      for (var i = 0; i < g.lastProj.length; i++) {
        var p = g.lastProj[i], vx = p.tx - p.bx, vy = p.ty - p.by, l2 = vx * vx + vy * vy || 1;
        var t = clamp(((x - p.bx) * vx + (y - p.by) * vy) / l2, 0, 1);
        var dx = x - (p.bx + vx * t), dy = y - (p.by + vy * t), d = dx * dx + dy * dy;
        if (d < bd) { bd = d; best = i; }
      }
      return bd < 30 * 30 ? best : fallback;
    }

    function choose(i, notify) {
      selected = (i == null || i < 0 || i >= cities.length) ? null : i;
      applySelection();
      kick();
      if (notify && selected != null && typeof onSelect === 'function') {
        try { onSelect(selected); } catch (e) { if (window.console) console.error(e); }
      }
    }

    // ---------- label placement ----------
    function overlaps(a, b) {
      return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    }
    function overlapArea(a, b) {
      var w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
      var h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
      return (w > 0 && h > 0) ? w * h : 0;
    }
    function placeLabels(proj) {
      var placed = [], heads = [], i, j, order = [];
      for (i = 0; i < proj.length; i++) {
        heads.push({ x: proj[i].tx - 7, y: proj[i].ty - 7, w: 14, h: 14, i: i });
        heads.push({ x: Math.min(proj[i].tx, proj[i].bx) - 3, y: proj[i].ty, w: Math.abs(proj[i].tx - proj[i].bx) + 6, h: Math.max(4, proj[i].by - proj[i].ty), i: i });
        order.push(i);
      }
      if (selected != null) { order.splice(selected, 1); order.unshift(selected); }
      var bounds = { x: 6, y: 30, w: g.cw - 12, h: g.ch - 30 - 36 };
      for (var n = 0; n < order.length; n++) {
        i = order[n];
        var p = g.pins[i], pr = proj[i], w = p.lw, h = p.lh;
        var cands = [
          { x: pr.tx - w / 2, y: pr.ty - 9 - h },
          { x: pr.tx + 9, y: pr.ty - h / 2 },
          { x: pr.tx - 9 - w, y: pr.ty - h / 2 },
          { x: pr.bx - w / 2, y: pr.by + 7 },
          { x: pr.tx + 6, y: pr.ty - 6 - h },
          { x: pr.tx - 6 - w, y: pr.ty - 6 - h },
          { x: pr.bx + 6, y: pr.by + 2 },
          { x: pr.bx - 6 - w, y: pr.by + 2 }
        ];
        var best = -1, bestScore = 1e9;
        var tryOrder = [p.place];
        for (j = 0; j < cands.length; j++) if (j !== p.place) tryOrder.push(j);
        for (var tI = 0; tI < tryOrder.length; tI++) {
          var c = cands[tryOrder[tI]];
          c.w = w; c.h = h;
          var score = 0;
          for (j = 0; j < placed.length; j++) score += overlapArea(c, placed[j]) * 3;
          for (j = 0; j < heads.length; j++) if (heads[j].i !== i) score += overlapArea(c, heads[j]) * 6;
          var ox = Math.max(0, bounds.x - c.x) + Math.max(0, c.x + w - bounds.x - bounds.w);
          var oy = Math.max(0, bounds.y - c.y) + Math.max(0, c.y + h - bounds.y - bounds.h);
          score += (ox + oy) * h * 2;
          score += tI * 0.5; // prefer previous / earlier candidate on ties
          if (score < bestScore) { bestScore = score; best = tryOrder[tI]; }
          if (score < 1) break;
        }
        p.place = best;
        var cb = cands[best];
        cb.x = clamp(cb.x, 4, g.cw - w - 4);
        cb.y = clamp(cb.y, 4, g.ch - h - 4);
        placed.push(cb);
        p.lab.style.transform = 'translate(' + Math.round(cb.x) + 'px,' + Math.round(cb.y) + 'px)';
        p.lab.style.zIndex = i === selected ? 900 : 500;
      }
    }

    // ---------- frame ----------
    function frame() {
      raf = 0;
      if (destroyed || !g) return;
      var tn = now(), t = (tn - t0) / 1000;
      var animating = !reduced;

      // drag spring
      var kf = drag ? 0.35 : 0.085;
      off.x += (target.x - off.x) * kf;
      off.z += (target.z - off.z) * kf;
      var springing = Math.abs(target.x - off.x) > 0.02 || Math.abs(target.z - off.z) > 0.02;

      var e = 1, e2 = 1;
      if (introOn && !reduced) {
        var ip = clamp((tn - introStart - 80) / 1500, 0, 1);
        e = easeInOut(ip); e2 = easeOut(ip);
      }
      var sway = reduced ? 0 : 1;
      var pose = {
        ax: AX0 * e + sway * 1.6 * Math.sin(t * 0.5) + off.x,
        az: AZ0 + (1 - e2) * -16 + sway * 2.6 * Math.sin(t * 0.33) + off.z,
        ty: g.ty + sway * 3 * Math.sin(t * 0.8) + (1 - e) * 10,
        tz: (1 - e2) * -90,
        P: g.P, ox: g.cw / 2, oy: g.ch / 2
      };
      g.slab.style.transform = 'translate3d(0,' + pose.ty.toFixed(2) + 'px,' + pose.tz.toFixed(2) + 'px) rotateX(' + pose.ax.toFixed(3) + 'deg) rotateZ(' + pose.az.toFixed(3) + 'deg)';
      g.needle.style.transform = 'rotate(' + pose.az.toFixed(2) + 'deg)';
      // override projection offsets: the CSS translate is applied in world space, so pass ty/tz via pose
      var proj = [];
      for (var i = 0; i < g.pins.length; i++) {
        var p = g.pins[i];
        var hgt = (i === selected ? g.COLSEL : g.COLH) * (0.25 + 0.75 * e);
        var b = project(p.x, p.y, 0, pose), tp = project(p.x, p.y, hgt, pose);
        var dx = tp.x - b.x, dy = tp.y - b.y, len = Math.sqrt(dx * dx + dy * dy);
        p.pin.style.transform = 'translate(' + b.x.toFixed(1) + 'px,' + b.y.toFixed(1) + 'px)';
        p.pin.style.zIndex = i === selected ? 400 : Math.round(b.y);
        p.col.style.height = len.toFixed(1) + 'px';
        p.col.style.top = (-len).toFixed(1) + 'px';
        p.col.style.transform = 'rotate(' + Math.atan2(dx, -dy).toFixed(4) + 'rad)';
        p.head.style.transform = 'translate(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px)';
        proj.push({ bx: b.x, by: b.y, tx: tp.x, ty: tp.y });
      }
      g.lastProj = proj;
      placeLabels(proj);

      if (animating || drag || springing || introOn) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && !destroyed) raf = requestAnimationFrame(frame); }

    // ---------- pointer drag ----------
    function onDown(e) {
      if (e.button != null && e.button > 0) return;
      moved = false;
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY, ox: target.x, oz: target.z, active: false };
    }
    function onMove(e) {
      if (!drag || e.pointerId !== drag.id) return;
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!drag.active) {
        if (dx * dx + dy * dy < 36) return;
        drag.active = true; moved = true;
        try { root.setPointerCapture(e.pointerId); } catch (er) {}
        root.className += ' am3d-grab';
      }
      target.z = clamp(drag.oz + dx * 0.16, -20, 20);
      target.x = clamp(drag.ox - dy * 0.14, -14, 8);
      kick();
    }
    function onUp(e) {
      if (!drag || (e.pointerId != null && e.pointerId !== drag.id)) return;
      if (drag.active) {
        try { root.releasePointerCapture(drag.id); } catch (er) {}
        root.className = root.className.replace(' am3d-grab', '');
      }
      drag = null;
      target.x = 0; target.z = 0;
      kick();
      // `moved` stays true through the click that follows this pointerup
      timers.push(setTimeout(function () { moved = false; }, 0));
    }
    root.addEventListener('pointerdown', onDown);
    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerup', onUp);
    root.addEventListener('pointercancel', onUp);
    root.addEventListener('lostpointercapture', onUp);

    function onResize() {
      var w = container.clientWidth;
      if (w && Math.abs(w - lastW) > 2) { build(false); }
    }
    var ro = null;
    if (window.ResizeObserver) { ro = new ResizeObserver(onResize); ro.observe(container); }
    else window.addEventListener('resize', onResize);

    build(!reduced);

    return {
      select: function (i) { if (!destroyed) choose(i, false); },
      destroy: function () {
        if (destroyed) return;
        destroyed = true;
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        for (var i = 0; i < timers.length; i++) clearTimeout(timers[i]);
        timers = [];
        root.removeEventListener('pointerdown', onDown);
        root.removeEventListener('pointermove', onMove);
        root.removeEventListener('pointerup', onUp);
        root.removeEventListener('pointercancel', onUp);
        root.removeEventListener('lostpointercapture', onUp);
        if (ro) ro.disconnect(); else window.removeEventListener('resize', onResize);
        if (root.parentNode) root.parentNode.removeChild(root);
        g = null;
        mounts--;
        if (mounts <= 0) {
          mounts = 0;
          var s = document.getElementById(STYLE_ID);
          if (s && s.parentNode) s.parentNode.removeChild(s);
        }
      }
    };
  }

  window.ArtanMap3D = { mount: mount };
})();
