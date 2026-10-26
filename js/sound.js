/* SOUND (start engine voices): the chimes. Loaded at idle just after the first paint (T1) by js/app.js, or at once if the first touch
   comes sooner ("Sound responds fast", Danny 14:20 AWST 26 Oct 2026). The AudioContext and its one output node are made by js/core.js
   inside the kid's first touch, so a start tap only has to start a voice. The extras (js/sound-extras.js: the media element bridge and
   the Media Session that keep sound going while you're away) load only after sound has begun.
   Sound only after the first tap. Pitch: two pumps (js/core.js pitch()). Loudness: the amplitude matrix (TODO) x quiet hours from the
   sun's height. Every timing is B x PHI^-n (Rule phi table). No master volume: the device's own volume is the one overall control. */
(function (W, D) {
  "use strict";
  var N = W.NOT, PHI = N.PHI, IP = N.IP, FIB = N.FIB;
  var MS = 1000;                                                                 // unit: ms per second
  var extrasAsked = false, ringUntil = 0, tapAt = null;
  D.addEventListener("pointerdown", function () { tapAt = W.performance ? performance.now() : Date.now(); }, true);
  function extras() {                                                            // after sound has begun: bridge + Media Session
    if (extrasAsked) return; extrasAsked = true;
    var s = D.createElement("script"); s.src = "js/sound-extras.js"; s.async = true; D.head.appendChild(s);
  }
  function chime(kind, steps) {
    var ctx = N.ctx, out = N.out; if (!ctx || !out) return;
    if (ctx.state !== "running") { try { ctx.resume(); } catch (e) {} }
    var p = N.pitch(), b = p.B, t = ctx.currentTime, lv = N.AMP.level(kind) * N.night();
    var atk = b * Math.pow(IP, 10), dec = b * Math.pow(IP, 6), gap = b * Math.pow(IP, 8);   // Rule phi timings from B
    steps = steps || FIB[3];
    for (var i = 0; i < steps; i++) {
      var o = ctx.createOscillator(), g = ctx.createGain(), at = t + i * gap;
      o.type = "sine"; o.frequency.value = p.f0 * FIB[i + 2] / FIB[i + 1];        // fib: each note a Fibonacci ratio of the base (2/1, 3/2, 5/3...)
      g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(lv * Math.pow(IP, i), at + atk);
      g.gain.exponentialRampToValueAtTime(lv * Math.pow(IP, FIB[7]), at + atk + dec);   // fib: fade to PHI^-21 of its own level
      o.connect(g); g.connect(out); o.start(at); o.stop(at + atk + dec);
    }
    var len = (steps - 1) * gap + atk + dec, now = W.performance ? performance.now() : Date.now();
    ringUntil = Date.now() + len * MS;
    // tap-to-sound: from the touch to the first note's start, plus the device's own output latency (measured, reported in the export)
    var lat = ((ctx.baseLatency || 0) + (ctx.outputLatency || 0)) * MS;
    if (tapAt != null) { N.S.lastTapToSound = { ms: now - tapAt, outputLatencyMs: lat, state: ctx.state }; tapAt = null; }
    N.log("sound", { kind: kind, f0: Math.round(p.f0), pumpB: p.pumpB, busy: p.busy });
    if (W.NOTSoundExtras) W.NOTSoundExtras.ring(len); else extras();
  }
  function wake() {                                                              // back from another app: resume what was on
    var ctx = N.ctx; if (!ctx || !N.sound) return;
    var r = null; try { r = ctx.resume(); } catch (e) {}
    var check = function () { if (N.ctx.state !== "running") D.dispatchEvent(new CustomEvent("not:resume-tap")); };   // one gentle tap, never a reset
    if (r && r.then) r.then(check, check); else check();
    if (W.NOTSoundExtras) W.NOTSoundExtras.wake();
  }
  function quiet() { if (W.NOTSoundExtras) W.NOTSoundExtras.stop(); }
  W.NOTSound = { chime: chime, wake: wake, quiet: quiet, ringing: function () { return Date.now() < ringUntil; },
    left: function () { return Math.max(0, (ringUntil - Date.now()) / MS); } };
  if (N.ctx) N.log("sound-engine", { loadedAfterTouch: true }); else N.log("sound-engine", { loadedAt: "idle" });
})(window, document);
