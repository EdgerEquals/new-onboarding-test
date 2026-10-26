/* ART: the bot avatar and the logo, drawn as SVG in a 0..1 box, so every size is a ratio of the box (no fixed sizes).
   Colours: hues are golden-angle shares of one turn; saturation and lightness are phi rungs; contrast is checked against WCAG.
   Logo grows with the page (shared layer, 12:22 AWST 26 Oct): each page piece the kid has done adds its layer; at the logo step
   assembly stops for good and what is there becomes the kid's starting point. */
(function (W) {
  "use strict";
  var N = W.NOT, PHI = N.PHI, IP = N.IP, FIB = N.FIB, H = 1 / 2;
  var TURN = 360;                                                                // unit: degrees in one turn
  var NS = "http://www.w3.org/2000/svg";                                         // label: SVG namespace

  function hue(k) { return TURN * ((k * IP) % 1); }                              // golden-angle hue for tile k
  var PCT = 100;                                                                 // unit: per cent
  function hsl(h, s, l) { return "hsl(" + h + "," + s * PCT + "%," + l * PCT + "%)"; }
  var HSL_K = [0, 8, 4], HSL_N = 12, HSL_A = 3, HSL_B = 9;                          // cite: CSS Color 4, hslToRgb() sample code constants
  function rgb(h, s, l) {                                                        // CSS Color 4 HSL -> sRGB (0..255)
    var a = s * Math.min(l, 1 - l), f = function (n) { var k = (n + h / (TURN / HSL_N)) % HSL_N; return l - a * Math.max(-1, Math.min(k - HSL_A, HSL_B - k, 1)); };
    return HSL_K.map(function (n) { return f(n) * CH; });
  }
  var CH = 255;                                                                  // unit: 8-bit colour channel full scale
  function el(tag, at) { var e = document.createElementNS(NS, tag); for (var k in at) e.setAttribute(k, at[k]); return e; }
  function svg(cls) { return el("svg", { viewBox: "0 0 1 1", class: cls, "aria-hidden": "true" }); }

  var R = H * (1 - Math.pow(IP, 4));                                             // body radius, a phi share of the half box
  function star(cx, cy, r, pts, inner) {                                         // inner/outer = PHI^-2 is the pentagram's own ratio
    var d = "", n = pts * 2;
    for (var i = 0; i < n; i++) { var a = Math.PI * i / pts - Math.PI / 2, rr = i % 2 ? r * inner : r; d += (i ? "L" : "M") + (cx + rr * Math.cos(a)) + " " + (cy + rr * Math.sin(a)); }
    return d + "Z";
  }
  function bodyPath(shape, r) {
    r = r || R;
    if (shape === "square") { var k = r * Math.pow(IP, 2); return "M" + (H - r + k) + " " + (H - r) + "H" + (H + r - k) + "Q" + (H + r) + " " + (H - r) + " " + (H + r) + " " + (H - r + k) + "V" + (H + r - k) + "Q" + (H + r) + " " + (H + r) + " " + (H + r - k) + " " + (H + r) + "H" + (H - r + k) + "Q" + (H - r) + " " + (H + r) + " " + (H - r) + " " + (H + r - k) + "V" + (H - r + k) + "Q" + (H - r) + " " + (H - r) + " " + (H - r + k) + " " + (H - r) + "Z"; }
    if (shape === "star") return star(H, H, r, FIB[4], Math.pow(IP, 2));
    if (shape === "drop") return "M" + H + " " + (H - r) + "C" + (H + r * IP) + " " + (H - r * Math.pow(IP, 2)) + " " + (H + r) + " " + (H + r * Math.pow(IP, 2)) + " " + H + " " + (H + r) + "C" + (H - r) + " " + (H + r * Math.pow(IP, 2)) + " " + (H - r * IP) + " " + (H - r * Math.pow(IP, 2)) + " " + H + " " + (H - r) + "Z";
    return "M" + (H - r) + " " + H + "A" + r + " " + r + " 0 1 0 " + (H + r) + " " + H + "A" + r + " " + r + " 0 1 0 " + (H - r) + " " + H + "Z";
  }
  var SHAPES = ["circle", "square", "star", "drop"];
  var EYES = ["dots", "happy", "sparkle", "sleepy"];
  var EXTRAS = ["none", "antenna", "ears", "halo"];

  function avatar(a, cls) {
    var s = svg(cls || "avatar"), hk = a.hue != null ? a.hue : 0, r = R * IP;
    var fill = hsl(hue(hk), IP, IP), ink = hsl(hue(hk), IP, Math.pow(IP, 4));
    var ex = a.extra || "none";
    if (ex === "antenna") { s.appendChild(el("path", { d: "M" + H + " " + (H - r) + "V" + (H - r - r * Math.pow(IP, 1)), stroke: ink, "stroke-width": r * Math.pow(IP, 4), fill: "none" })); s.appendChild(el("circle", { cx: H, cy: H - r - r * IP, r: r * Math.pow(IP, 4), fill: fill })); }
    if (ex === "ears") [-1, 1].forEach(function (sd) { s.appendChild(el("path", { d: star(H + sd * r * IP, H - r * IP, r * Math.pow(IP, 2), FIB[3], Math.pow(IP, 2)), fill: fill })); });
    if (ex === "halo") s.appendChild(el("ellipse", { cx: H, cy: H - r - r * Math.pow(IP, 3), rx: r * IP, ry: r * Math.pow(IP, 3), fill: "none", stroke: hsl(hue(hk + 1), IP, IP), "stroke-width": r * Math.pow(IP, 4) }));
    s.appendChild(el("path", { d: bodyPath(a.shape || "circle", r), fill: fill, class: "av-body" }));
    var ey = H - r * Math.pow(IP, 3), ex2 = r * Math.pow(IP, 2), er = r * Math.pow(IP, 4), eye = a.eyes || "dots";
    [-1, 1].forEach(function (sd) {
      var x = H + sd * ex2;
      if (eye === "dots") s.appendChild(el("circle", { cx: x, cy: ey, r: er, fill: ink }));
      if (eye === "happy") s.appendChild(el("path", { d: "M" + (x - er) + " " + ey + "Q" + x + " " + (ey - er * PHI) + " " + (x + er) + " " + ey, stroke: ink, fill: "none", "stroke-width": er * IP }));
      if (eye === "sparkle") s.appendChild(el("path", { d: star(x, ey, er * PHI, FIB[4], Math.pow(IP, 3)), fill: ink }));
      if (eye === "sleepy") s.appendChild(el("path", { d: "M" + (x - er) + " " + ey + "H" + (x + er), stroke: ink, "stroke-width": er * IP }));
    });
    s.appendChild(el("path", { d: "M" + (H - ex2 * IP) + " " + (H + r * Math.pow(IP, 2)) + "Q" + H + " " + (H + r * IP) + " " + (H + ex2 * IP) + " " + (H + r * Math.pow(IP, 2)), stroke: ink, fill: "none", "stroke-width": er * IP }));
    return s;
  }

  // ---------- logo ----------
  var FRAMES = ["wave", "arch", "zigzag", "ring"];
  var PATTERNS = ["stars", "seeds", "rings", "rays"];
  function framePath(kind, r) {
    var d = "", n = FIB[5];                                                        // fib: 8 bumps
    if (kind === "ring") return bodyPath("circle", r);
    if (kind === "arch") return "M" + (H - r) + " " + (H + r * IP) + "V" + H + "A" + r + " " + r + " 0 0 1 " + (H + r) + " " + H + "V" + (H + r * IP) + "Z";
    var zig = kind === "zigzag", m = zig ? n * 2 : n * FIB[4];                  // fib: zigzag corners, or 5 sub-steps per wave bump
    for (var i = 0; i <= m; i++) {
      var a = 2 * Math.PI * i / m, w = zig ? (i % 2 ? 1 : -1) : Math.cos(a * n);
      var rr = r * (1 + Math.pow(IP, FIB[4]) * w);
      d += (i ? "L" : "M") + (H + rr * Math.cos(a)) + " " + (H + rr * Math.sin(a));
    }
    return d + "Z";
  }
  function pattern(g, kind, r, col) {
    var n = kind === "seeds" ? FIB[7] : FIB[4];                                   // fib: 21 seeds or 5 marks
    for (var i = 1; i <= n; i++) {
      if (kind === "seeds") { var a = i * 2 * Math.PI * IP * IP, rr = r * IP * Math.sqrt(i / n); g.appendChild(el("circle", { cx: H + rr * Math.cos(a), cy: H + rr * Math.sin(a), r: r * Math.pow(IP, FIB[5] + 1), fill: col })); }
      if (kind === "stars") { var b = 2 * Math.PI * i / n; g.appendChild(el("path", { d: star(H + r * IP * Math.cos(b), H + r * IP * Math.sin(b), r * Math.pow(IP, 4), FIB[4], Math.pow(IP, 2)), fill: col })); }
      if (kind === "rays") { var c = 2 * Math.PI * i / n; g.appendChild(el("path", { d: "M" + (H + r * Math.pow(IP, 2) * Math.cos(c)) + " " + (H + r * Math.pow(IP, 2) * Math.sin(c)) + "L" + (H + r * IP * Math.cos(c)) + " " + (H + r * IP * Math.sin(c)), stroke: col, "stroke-width": r * Math.pow(IP, FIB[4]), "stroke-linecap": "round" })); }
      if (kind === "rings" && i <= FIB[3]) g.appendChild(el("circle", { cx: H, cy: H, r: r * Math.pow(IP, i), fill: "none", stroke: col, "stroke-width": r * Math.pow(IP, FIB[4] + 1) }));
    }
  }
  /* L = logo description {hue, frame, pattern, centre (avatar or null), motion}. `have` says which layers exist (assembly). */
  function logo(L, have, cls) {
    var s = svg(cls || "logo"), r = R, hk = L.hue != null ? L.hue : null;
    var col = hk == null ? "currentColor" : hsl(hue(hk), IP, IP);
    var ink = hk == null ? "currentColor" : hsl(hue(hk), IP, W.ART.dark ? 1 - Math.pow(IP, 3) : Math.pow(IP, 3));   // ink contrasts with the page, not the fill
    var root = el("g", { class: "logo-root m-" + (L.motion || "breathe") }); s.appendChild(root);
    function layer(name, on, build) { var g = el("g", { class: "lg-layer lg-" + name + (on ? " on" : "") }); build(g); root.appendChild(g); }
    layer("base", true, function (g) { g.appendChild(el("path", { d: bodyPath("circle", r * Math.pow(IP, 3)), fill: hk == null ? "none" : col, stroke: "currentColor", "stroke-width": r * Math.pow(IP, FIB[4]), "stroke-dasharray": hk == null ? r * Math.pow(IP, 4) : "none" })); });
    layer("colour", have.colour, function (g) { g.appendChild(el("path", { d: bodyPath("circle", r * IP), fill: col, opacity: IP })); });
    layer("frame", have.frame, function (g) { g.appendChild(el("path", { d: framePath(L.frame || "ring", r), fill: "none", stroke: ink, "stroke-width": r * Math.pow(IP, FIB[4] - 1) })); });
    layer("pattern", have.pattern, function (g) { pattern(g, L.pattern || "stars", r, ink); });
    layer("centre", have.centre && L.centre, function (g) { if (L.centre) { var a = avatar(L.centre, "lg-av"); var k = Math.pow(IP, 2), o = H * (1 - k); a.setAttribute("x", o); a.setAttribute("y", o); a.setAttribute("width", k); a.setAttribute("height", k); g.appendChild(a); } });
    return s;
  }
  W.ART = { dark: true, hue: hue, hsl: hsl, rgb: rgb, avatar: avatar, logo: logo, SHAPES: SHAPES, EYES: EYES, EXTRAS: EXTRAS, FRAMES: FRAMES, PATTERNS: PATTERNS, HUES: FIB[4] };
})(window);
