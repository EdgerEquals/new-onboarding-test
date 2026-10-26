/* Tester live share (Danny yes, 15:11 AWST 26 Oct 2026). Tester-only: shares the build and counts live with Danny's own server,
   which keeps it behind his login and wipes it daily (Server Bot owns that side).
   - Off by default. It switches off at the daily restart and on Start over.
   - Sends at most once per breath B, and only when something changed.
   - Whitelist payload: picks, looks and counts only. Any string that isn't a known option becomes "<text>". Names, call-me names, typed
     text, logo words, location, audio and device IDs are never read into it. The export name check then runs over the payload
     as a guard, and a hit blocks the send.
   - The toggle stays hidden while LIVE_SHARE_URL is empty, so nothing goes live half-built. */
(function (W) {
  "use strict";
  var LIVE_SHARE_URL = "";                                                       // label: Danny's receiving route (set when Server Bot replies)
  var N = W.NOT, D = W.document, MS = 1000, TEXT = "<text>", SCHEMA = 1;        // unit: ms per second; label: payload shape version
  if (!LIVE_SHARE_URL) { W.NOTLive = { ready: false }; return; }

  var A = W.ART, timer = 0, lastSent = "", sent = 0, blocked = 0;
  function S() { return N.S; }
  function day() { return W.RhythmContinuity ? W.RhythmContinuity.info().day : null; }
  function st() { var s = S(); if (!s.liveShare || s.liveShare.day !== day()) s.liveShare = { on: false, code: null, day: day() }; return s.liveShare; }
  function on() { return st().on; }
  var HEX = 16, BYTE_HEX = 2;                                                    // unit: hex base and two hex digits per byte
  function code() { var b = new Uint8Array(N.FIB[5]); crypto.getRandomValues(b); return [].map.call(b, function (x) { return x.toString(HEX).padStart(BYTE_HEX, "0"); }).join(""); }   // fib: 8 random bytes

  // ---------- the payload: whitelist, then placeholders, then the name guard ----------
  function vocab() {
    var a = W.NOTAPP, v = {};
    [].concat(A.SHAPES, A.EYES, A.EXTRAS, A.FRAMES, A.PATTERNS, a.SECTIONS, a.FLOW, a.MOTIONS, W.HelpOrb && W.HelpOrb.LOOKS ? [].concat.apply([], W.HelpOrb.LOOKS) : [], ["light", "dark"])
      .forEach(function (x) { if (typeof x === "string") v[x] = 1; else if (x && x.id) v[x.id] = 1; else if (Array.isArray(x)) v[x[0]] = 1; });
    return v;
  }
  function clean(x, V) {                                                         // keep numbers, booleans and known options; any other string becomes a placeholder
    if (x == null || typeof x === "number" || typeof x === "boolean") return x == null ? null : x;
    if (typeof x === "string") return V[x] ? x : TEXT;
    if (Array.isArray(x)) return x.map(function (y) { return clean(y, V); });
    var o = {}; Object.keys(x).forEach(function (k) { o[k] = clean(x[k], V); }); return o;
  }
  function pick(o, keys) { var r = {}; o = o || {}; keys.forEach(function (k) { if (o[k] !== undefined) r[k] = o[k]; }); return r; }
  var AV = ["shape", "hue", "eyes", "extra"], LOGO = ["hue", "frame", "pattern", "motion"];   // label: the build fields that are shared
  function payload() {
    var s = S(), u = s.usage || {}, taps = 0, V = vocab(), d = N.dials();
    Object.keys(u).forEach(function (k) { taps += u[k]; });
    var L = s.logo.current, look = s.orbLook || { kind: "orb" };
    var p = {
      schema: SCHEMA, session: null, build: null, step: s.step,
      counts: { taps: taps, skips: (s.skipped || []).length, back: u.back || 0, bugMarks: s.bugs || 0 },
      pace: { B: N.B(), skyB: N.skyB(), paceRung: d.pace.k, filterRung: d.filter.k, seasonRung: d.season.k },
      knobs: { pace: N.knob("pace").eff, tint: N.knob("tint").eff, pitch: N.knob("pitch").eff },
      stuck: s.stuck || {},
      nameCheck: s.nameCheck ? pick(s.nameCheck, ["trips", "retries", "surprise", "kept", "tiles", "stepMs"]) : null,
      picks: {
        done: s.done, skipped: s.skipped,
        bot: pick(s.avatar, AV),
        orbLook: { kind: look.kind === "own" ? "own" : look.kind, face: look.kind === "own" ? TEXT : look.text },
        page: { hue: s.page.hue, mode: s.page.mode, frame: s.page.frame, pattern: s.page.pattern, sections: s.page.sections || [] },
        logo: L ? Object.assign(pick(L, LOGO), { middle: L.centre ? "my bot" : "empty", middleBot: L.centre ? pick(L.centre, AV) : null }) : null
      }
    };
    var out = clean(p, Object.assign(V, { "my bot": 1, "empty": 1, "own": 1 }));
    out.build = W.NOTAPP.BUILD_ID; out.session = st().code; out.nameCheck = p.nameCheck;   // fixed tag, random hex and counts
    return out;
  }
  function guard(p) {                                                            // the export name check, run over every value in the payload
    var s = S(), words = [].concat((s.callMe || "").toLowerCase().split(/[^\p{L}\p{N}]+/u), (s.botName || "").toLowerCase().split(/[^\p{L}\p{N}]+/u)).filter(Boolean);
    if (!words.length) return true;
    var V = vocab(), bad = false;
    (function walk(x) { if (bad || x == null) return;
      if (typeof x === "string") { if (!V[x] && x !== TEXT && words.some(function (w) { return x.toLowerCase().indexOf(w) >= 0; })) bad = true; return; }
      if (typeof x === "object") Object.keys(x).forEach(function (k) { walk(x[k]); }); })(p);
    return !bad;
  }

  // ---------- sending: at most once per B, only on change ----------
  function tick() {
    timer = 0; if (!on()) return;
    var p = payload(), body = JSON.stringify(p), same = JSON.stringify(Object.assign({}, p, { pace: { paceRung: p.pace.paceRung, filterRung: p.pace.filterRung, seasonRung: p.pace.seasonRung } }));
    if (same !== lastSent) {                                                     // "changed" ignores the always-drifting B values; they ride along with real changes
      if (!guard(p)) { blocked++; N.log("live-share-blocked"); }
      else { lastSent = same; sent++;
        try { fetch(LIVE_SHARE_URL, { method: "POST", mode: "cors", credentials: "omit", keepalive: true, headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.assign({ sentAt: new Date().toISOString() }, p)) })
          .catch(function () { lastSent = ""; }); } catch (e) { lastSent = ""; } }
    }
    timer = setTimeout(tick, N.B() * MS);
  }
  function set(v) {
    var l = st(); l.on = !!v; l.code = v ? code() : null; l.day = day(); lastSent = ""; N.log("live-share", { on: l.on }); N.save();
    clearTimeout(timer); timer = 0; if (l.on) tick(); paint();
  }
  function paint() { if (W.NOTAPP && W.NOTAPP.bar) W.NOTAPP.bar(); }
  D.addEventListener("rhythm:restart", function () { if (S().liveShare && S().liveShare.on) set(false); });   // daily restart: off
  if (on()) tick();
  setTimeout(paint);                                                             // show the toggle once this module is in
  W.NOTLive = { ready: true, on: on, set: set, payload: payload, guard: guard, stats: function () { return { sent: sent, blocked: blocked }; } };
})(window);
