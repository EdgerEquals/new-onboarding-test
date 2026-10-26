/* CORE: the measured anchors, the golden-ratio dials, the on-device record and the event log for the new-onboarding test page.
   Kids Club shared layer (/home/box/.config/kids-club/shared.md) standards built here: Rule phi (anchors B, U, S), golden-ratio dials
   (one closed loop), Season pumps (js/season-pumps.js, a byte-identical COPY of the Kids Club file, not a link), pitch (two pumps),
   loudness (device volume + amplitude matrix, matrix TODO), sound only after the first tap, reduced motion (rule 2).
   RATIOS ONLY: every value is anchor x PHI^n with n a whole number. Lines that need an exponent choice are tagged  step:  and listed in
   the README self-check section for Danny. Nothing here makes a network request except the one weather read (city point only, see
   Weather below). Nothing is sent anywhere.
   CONTINUITY (Kids Club "rhythms keep going while you're away", Danny 13:48 / 13:51 AWST 26 Oct; pushed 14:11 AWST): this file registers
   the sky clocks, the dials and the knob nudges with js/rhythm-continuity.js (this page's own copy). The sound engine itself lives in
   js/sound.js (loaded at idle after the first paint, "Sound responds fast", Danny 14:20 AWST); only the minimal start engine is here,
   so the first touch anywhere prepares the audio graph silently. */
(function (W) {
  "use strict";
  var PHI = (1 + Math.sqrt(5)) / 2, IP = 1 / PHI, LNPHI = Math.log(PHI);         // phi: the golden ratio, the sole scaling factor
  var FIB = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233];                   // fib: Fibonacci counts (Rule phi: counts use Fibonacci)
  var MS = 1000;                                                                 // unit: ms per second
  var KEY = "not.v1";                                                            // label: the one localStorage key (Stream 1, own data)
  var SP = W.SeasonPumps;

  function fibAtMost(n) { var r = 0; for (var i = 1; i < FIB.length; i++) if (FIB[i] <= n) r = i; return r; }   // rung count, Fibonacci steps

  // ---------- the one on-device record ----------
  function blank() { return { v: 1, started: null, step: "welcome", kidName: "", botName: "", avatar: {}, page: {}, done: [],
    skipped: [], logo: { start: null, current: null, handoverAt: null, hintShown: false }, usage: {}, gaps: [], longGap: null,
    dials: null, events: [], bugs: 0 }; }
  var S = blank();
  function load() { try { var o = JSON.parse(localStorage.getItem(KEY) || "null"); if (o && o.v === S.v) S = Object.assign(blank(), o); } catch (e) {} return S; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  function reset() { try { localStorage.removeItem(KEY); } catch (e) {} S = blank(); dials();
    if (typeof nudge !== "undefined") Object.keys(nudge).forEach(function (k) { nudge[k] = 0; });
    if (W.RhythmContinuity && W.RhythmContinuity.forget) W.RhythmContinuity.forget(); return S; }

  // ---------- event log (timestamped; never typed text) ----------
  var T0 = Date.now();
  function log(ev, data) {
    var e = { t: new Date().toISOString(), ms: Date.now() - T0, ev: ev };
    if (data) for (var k in data) e[k] = data[k];
    S.events.push(e);
    if (S.events.length > FIB[12]) S.events.splice(0, S.events.length - FIB[12]); // fib: keep the latest 233 events
    save();
    return e;
  }
  // ---------- anchor B: three pumps, no fixed seed (Rule phi anchor B, Danny 10:11 AWST 26 Oct) ----------
  var M2_S = 12.4206012 * 3600;                                                  // cite: M2 period 12.4206012 h (NOAA CO-OPS), in s
  var N_B = 17;                                                                  // step: B sits 17 phi-steps under the M2 tide clock
  var N_KID = 4;                                                                 // step: the kid's tap gap sits 4 phi-steps under B
  var wx = null;                                                                 // weather feed reading {pos 0..1, U seconds}
  function skyB(d) {                                                             // pump 1: the Moon's position from the sky clocks
    var base = M2_S * Math.pow(IP, N_B), f = 1;
    if (SP) SP.pumps(d || new Date()).forEach(function (p) {
      if (p.id === "springNeap" || p.id === "perigee") f *= Math.pow(p.S, p.c / 2);
    });
    return base * f;
  }
  function tempB(b) { return wx ? b * Math.pow(PHI, (wx.pos * 2 - 1) / 2) : b; } // pump 2: local temperature, its place in today's range
  function kidGap() { if (!S.gaps.length) return null; var g = S.gaps.slice().sort(function (a, b) { return a - b; }); return g[Math.floor(g.length / 2)]; }
  function liveB() {                                                             // breath period in seconds, live from the three pumps
    var b = tempB(skyB()), g = kidGap();
    if (g == null) return b;
    var w = 1 - Math.pow(IP, fibAtMost(S.gaps.length));                         // pump 3 takes over one phi rung per Fibonacci count of gaps
    return Math.exp((1 - w) * Math.log(b) + w * Math.log(g * Math.pow(PHI, N_KID)));
  }
  function B() { var b = liveB(), n = knobRung("pace"); return n == null ? b : Math.pow(PHI, n); }   // a hand nudge sets B on its rung
  var lastTap = null;
  function tap(id) {                                                             // the kid's own rhythm (gaps between taps), and usage counts
    var now = Date.now();
    if (lastTap != null) { var gap = (now - lastTap) / MS;
      if (gap < B() * Math.pow(PHI, N_KID)) {                                    // a gap longer than this is a pause, not rhythm
        S.gaps.push(gap); if (S.gaps.length > FIB[9]) S.gaps.shift();           // fib: rhythm window, 34 gaps
        S.longGap = S.longGap == null ? gap : S.longGap * (1 - Math.pow(IP, 2)) + gap * Math.pow(IP, 2);
      } }
    lastTap = now;
    if (id) S.usage[id] = (S.usage[id] || 0) + 1;
    paceCheck();
    applyScale();
  }

  // ---------- anchor S: the screen's shorter side; sizes and timings as CSS variables ----------
  var WCAG_MIN = 24, WCAG_AAA = 44;                                              // cite: WCAG 2.2 SC 2.5.8 (24 CSS px) and SC 2.5.5 (44 CSS px) target sizes
  function rm() { return document.documentElement.getAttribute("data-rm") === "on"; }
  function applyScale() {
    var r = document.documentElement, s = Math.min(W.innerWidth, W.innerHeight), b = B() * MS, n = 4;   // step: tap target S x PHI^-4 (Rule phi table)
    while (s * Math.pow(IP, n) < WCAG_MIN && n > 0) n--;                        // safe side: one phi step bigger until it passes
    var tapPx = s * Math.pow(IP, n);
    r.setAttribute("data-light", s * Math.pow(IP, 4) < WCAG_AAA ? "on" : "off");  // step: light reduced view when S x PHI^-4 is under 44 px
    var u = s * Math.pow(IP, 6);                                                 // step: text unit S x PHI^-6
    if (u < tapPx * Math.pow(IP, 2)) u = tapPx * Math.pow(IP, 2);
    r.style.setProperty("--u", u + "px");
    r.style.setProperty("--tap", tapPx + "px");
    for (var k = 1; k <= FIB[5]; k++) {                                          // fib: five size rungs either side
      r.style.setProperty("--g" + k, u * Math.pow(PHI, k - 1) + "px");
      r.style.setProperty("--h" + k, u * Math.pow(IP, k) + "px");
    }
    r.style.setProperty("--t-quick", (rm() ? 0 : b * Math.pow(IP, 10)) + "ms");  // Rule phi: quick feedback B x PHI^-10
    r.style.setProperty("--t1", (rm() ? 0 : b * Math.pow(IP, 9)) + "ms");        // Rule phi: transitions B x PHI^-9 / -8 / -7
    r.style.setProperty("--t2", (rm() ? 0 : b * Math.pow(IP, 8)) + "ms");
    r.style.setProperty("--t3", (rm() ? 0 : b * Math.pow(IP, 7)) + "ms");
    r.style.setProperty("--breath", b + "ms");
    seasonTint();
  }

  // ---------- golden-ratio dials (one shape, one loop) ----------
  // Floors and ceilings are Danny's rungs. None are set for this test page yet: TODO(Danny). Placeholders below are tagged step:.
  function dial(name, k, floor, ceil) { return { name: name, k: k, floor: floor, ceil: ceil, moves: [] }; }
  function dials() {
    if (!S.dials) S.dials = {
      filter: dial("information filter", 2, 5, 1),                               // step: placeholder rungs (start 2, floor 5, ceiling 1), Danny TODO
      pace: dial("kid-pace retune", 2, 5, 1),                                    // step: placeholder rungs, Danny TODO
      season: dial("season pump", 3, 5, 2)                                       // step: placeholder rungs, Danny TODO
    };
    return S.dials;
  }
  function rung(d) { return Math.pow(IP, d.k); }
  function move(d, dir, why) {                                                   // one rung at a time, never past Danny's floor or ceiling
    var to = d.k - dir;
    if (to < d.ceil || to > d.floor) { d.moves.push({ t: new Date().toISOString(), proposal: to, why: why }); log("dial-proposal", { dial: d.name, to: to }); return; }
    d.moves.push({ t: new Date().toISOString(), from: d.k, to: to, why: why }); d.k = to; log("dial-move", { dial: d.name, rung: to });
  }
  var visitTaps = 0;
  function paceCheck() {                                                         // the one loop: this visit's pace vs the kid's own long-term pace
    visitTaps++;
    if (FIB.indexOf(visitTaps) < 0 || visitTaps < FIB[6] || S.longGap == null) return;  // fib: check on Fibonacci tap counts from 13
    var g = kidGap(), d = dials().pace;
    if (g != null && g * PHI <= S.longGap) move(d, 1, "quicker than usual");
    else if (g != null && g >= S.longGap * PHI) move(d, -1, "gentler than usual");
  }

  // ---------- season pump on the background (Dial 3 strength) ----------
  function seasonTint() {
    if (!SP) return;
    var d = dials().season, k = knobRung("tint"), r0 = k == null ? rung(d) : Math.pow(IP, k);
    var warm = SP.output("warmth", r0), calm = SP.output("calm", r0);
    var bg = S.page.bgRGB || SP.WHITE, fg = S.page.fgRGB, f = SP.wcagFloor(bg, fg, warm, calm, d.floor);
    var r = document.documentElement;
    r.style.setProperty("--warm", f.warm); r.style.setProperty("--calm", 1 - f.calm);
  }

  // ---------- weather feed (pump 2): city point only ----------
  // One GET to Open-Meteo with ONLY the shared layer's coarse city point (no kid id, no usage, credentials and referrer omitted).
  // Cached for U x PHI^0, U = the feed's own update period (Rule phi "weather cache"). If it fails, the sky clocks carry B alone.
  var WX_KEY = "not.wx";                                                         // label: cache key
  function weather() {
    try { var c = JSON.parse(localStorage.getItem(WX_KEY) || "null"); if (c && Date.now() - c.at < c.U * MS) { wx = c; applyScale(); return; } } catch (e) {}
    if (!SP || !W.fetch) return;
    var u = "https://api.open-meteo.com/v1/forecast?latitude=" + SP.POINT.lat + "&longitude=" + SP.POINT.lon +
      "&current=temperature_2m&daily=temperature_2m_max,temperature_2m_min&forecast_days=1&timezone=auto";  // label: feed URL
    fetch(u, { credentials: "omit", referrerPolicy: "no-referrer", cache: "no-store" }).then(function (r) { return r.json(); }).then(function (j) {
      var t = j.current.temperature_2m, lo = j.daily.temperature_2m_min[0], hi = j.daily.temperature_2m_max[0];
      wx = { at: Date.now(), U: j.current.interval, pos: hi > lo ? Math.max(0, Math.min(1, (t - lo) / (hi - lo))) : 1 / 2 };
      try { localStorage.setItem(WX_KEY, JSON.stringify(wx)); } catch (e) {}
      log("weather", { ok: true }); applyScale();
    }).catch(function () { log("weather", { ok: false }); });
  }

  // ---------- sound: only after the first tap; minimal START ENGINE here, voices in js/sound.js ("Sound responds fast") ----------
  // The first touch anywhere makes the AudioContext and the one output node (graph prepared silently, nothing plays). js/sound.js
  // (loaded at idle after the first paint) plays the chimes; js/sound-extras.js (media element bridge + Media Session) loads only after
  // sound has begun. Pitch and loudness stay here because they are pumps.
  var ctx = null, out = null, soundOn = true;
  function unlock() {                                                            // called inside the kid's first touch (and every touch after)
    if (ctx) { if (ctx.state !== "running" && soundOn) { try { ctx.resume(); } catch (e) {} } return ctx; }
    var A = W.AudioContext || W.webkitAudioContext; if (!A) return null;
    try { ctx = new A(); out = ctx.createGain(); out.connect(ctx.destination); log("audio-unlocked"); } catch (e) { ctx = null; out = null; }
    return ctx;
  }
  function chime(kind, steps) { var E = W.NOTSound; if (E && ctx && soundOn) return E.chime(kind, steps); }   // no engine yet: silent
  // AMPLITUDE MATRIX: TODO(Danny). Not yet defined (shared layer, Loudness). There is NO master volume; the device's own volume is the
  // one overall control and is never read or set. Until the matrix exists every layer uses the same placeholder share PHI^-3.
  // Logo sits under the page's music (Kids Club, Danny 14:25 AWST 26 Oct): logo level = page music level x PHI^-1, following it live.
  // This page has no music layer, so the page's own sound (its chimes) stands in as the page level; any future music layer becomes "page".
  // Dip (Danny 14:28 AWST 26 Oct): while the logo sound plays, page music dips x PHI^-1 with the free-wheel glide, then comes back; the
  // logo stays tied to the UNDIPPED page level (level("page") below is never dipped). This page has no music to dip yet: a future music
  // layer applies the dip on its own gain node, never inside AMP.level.
  var AMP = { defined: false, level: function (layer) { var page = Math.pow(IP, 3);   // step: placeholder share, TODO amplitude matrix
    return layer === "logo" ? AMP.level("page") * IP : page; } };
  var N_PITCH = 16;                                                              // step: base pitch (1/B) x PHI^16, Pump A
  function pitch() {
    var b = B(), off = 0, n = 0, mix = [];
    if (SP) SP.pumps().forEach(function (p) { if (p.id === "springNeap" || p.id === "m2" || p.id === "year") mix.push(p.c); });
    if (wx) mix.push(wx.pos * 2 - 1);
    mix.forEach(function (c) { off += c; n++; });
    var pumpB = n ? Math.round(off / n) : 0;                                     // Pump B: the feeds' mix sets the floor (-1) or headroom (+1)
    var livePumpB = pumpB, kp = knobRung("pitch"); if (kp != null) pumpB = kp;    // a hand nudge moves Pump B along its own ladder
    var g = kidGap(), busy = (g != null && S.longGap != null && g * PHI <= S.longGap) ? 1 : 0;   // busier than their own usual: headroom
    var f = (1 / b) * Math.pow(PHI, N_PITCH);                                    // Pump A: the kid's own rhythm
    var ref = (1 / tempB(skyB())) * Math.pow(PHI, N_PITCH + pumpB);              // Pump B: the feeds' mix
    var lo = ref * IP, hi = ref * Math.pow(PHI, 1 + busy);                       // floor one phi-step under, headroom one (two when busy) over
    while (f < lo) f *= PHI;
    while (f > hi) f *= IP;
    return { f0: f, B: b, ref: ref, pumpB: pumpB, livePumpB: livePumpB, busy: busy };
  }
  function night() { if (!SP) return 1; var c = SP.clocks(); return Math.pow(IP, 2 * c.rest); }  // step: quiet hours, 2 phi-steps down at full rest (Dial 3 worked example)
  // ---------- knobs: settings open at live pump values (Danny 13:51 AWST) ----------
  // Each knob is a ladder of whole phi rungs. The live chip is where the pumps are right now; a hand change is a nudge (whole rungs) on
  // top of the live value, clamped to the ladder, kept through reloads and cleared by the daily restart.
  var PACE_RUNGS = [1, 6];                                                       // step: placeholder ladder B = PHI^1..PHI^6 s, Danny TODO (like the dials)
  var nudge = { pace: 0, tint: 0, pitch: 0 };
  function ladder(k) {
    var a = [], lo, hi;
    if (k === "pace") { lo = PACE_RUNGS[0]; hi = PACE_RUNGS[1]; }
    else if (k === "tint") { var d = dials().season; lo = d.ceil; hi = d.floor; }
    else { lo = -1; hi = 1; }                                                    // Pump B: floor (-1), base (0), headroom (+1)
    for (var i = lo; i <= hi; i++) a.push(i);
    return a;
  }
  function liveRung(k) {
    if (k === "pace") return Math.round(Math.log(liveB()) / LNPHI);
    if (k === "tint") return dials().season.k;
    var keep = nudge.pitch; nudge.pitch = 0; var p = pitch().livePumpB; nudge.pitch = keep; return p;
  }
  function clampTo(k, n) { var L = ladder(k); return Math.max(L[0], Math.min(L[L.length - 1], n)); }
  function knobRung(k) { return nudge[k] ? clampTo(k, liveRung0(k) + nudge[k]) : null; }
  function liveRung0(k) { var keep = nudge[k]; nudge[k] = 0; var r = liveRung(k); nudge[k] = keep; return r; }
  function knob(k) { var live = clampTo(k, liveRung0(k)); return { ladder: ladder(k), live: live, eff: clampTo(k, live + nudge[k]), nudge: nudge[k] }; }
  function setKnob(k, n) { var live = clampTo(k, liveRung0(k)); nudge[k] = n - live; log("knob", { knob: k, nudge: nudge[k] }); applyScale(); if (RC.knobs) RC.knobs.save(); }
  function liveSky() {                                                           // the live inputs the knobs sit on
    var z = W.RhythmContinuity ? W.RhythmContinuity.sun() : null;
    return { sun: z ? z.elev : null, moonLit: z ? z.moonLit : null, season: z ? z.season : null, weather: wx ? wx.pos : null, B: liveB() };
  }

  // ---------- continuity registrations (js/rhythm-continuity.js) ----------
  var RC = {}, RCm = W.RhythmContinuity;
  if (RCm) {
    // sky and season clocks: computed from the date itself, so catching up is a re-read (and the weather cache is re-checked)
    RC.sky = RCm.register("sky", { save: function () { var z = RCm.sun(); return { elev: z.elev, season: z.season, moon: z.moon }; },
      catchUp: function (e, st, mode) { if (mode === "return") { applyScale(); weather(); } }, reset: function () { applyScale(); } });
    // dials: Danny's rungs are kept as set (they live in the on-device record); the live tint is re-read on return
    RC.dials = RCm.register("dials", { save: function () { return { season: dials().season.k, pace: dials().pace.k }; },
      catchUp: function (e, st, mode) { if (mode === "return") applyScale(); }, reset: function () { visitTaps = 0; applyScale(); } });
    // knob nudges: kept through reloads, cleared by the daily restart
    RC.knobs = RCm.register("knobs", { save: function () { return { nudge: nudge }; },
      catchUp: function (e, st, mode) { if (mode === "return" || mode === "restart" || !st || !st.nudge) return;
        Object.keys(nudge).forEach(function (k) { if (isFinite(st.nudge[k])) nudge[k] = st.nudge[k]; }); },
      reset: function () { Object.keys(nudge).forEach(function (k) { nudge[k] = 0; }); applyScale(); } });
    // sound: the on/off choice carries through reloads and the daily restart; on return the engine wakes what was playing
    RC.sound = RCm.register("sound", { save: function () { return { on: soundOn, unlocked: !!ctx }; },
      catchUp: function (e, st, mode) { if (mode === "return") { var E = W.NOTSound; if (E && E.wake) E.wake(); return; } if (st && st.on === false) soundOn = false; },
      reset: function () {} });
  }

  function reducedMotion(on) { document.documentElement.setAttribute("data-rm", on ? "on" : "off"); applyScale(); }

  W.NOT = { PHI: PHI, IP: IP, FIB: FIB, get S() { return S; }, load: load, save: save, reset: reset, log: log, tap: tap, B: B,
    applyScale: applyScale, dials: dials, rung: rung, weather: weather, unlock: unlock, chime: chime, pitch: pitch, AMP: AMP,
    setSound: function (v) { soundOn = v; if (RC.sound) RC.sound.save(); if (!v && ctx && W.NOTSound && W.NOTSound.quiet) W.NOTSound.quiet(); },
    get sound() { return soundOn; }, get ctx() { return ctx; }, get out() { return out; }, night: night,
    knob: knob, setKnob: setKnob, liveSky: liveSky, liveB: liveB, reducedMotion: reducedMotion, rm: rm,
    get wx() { return wx; }, kidGap: kidGap, skyB: skyB };
})(window);
