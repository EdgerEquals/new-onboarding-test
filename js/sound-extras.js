/* SOUND EXTRAS: loaded only after sound has begun ("Sound responds fast", Danny 14:20 AWST 26 Oct 2026). Kids Club standard "rhythms
   keep going while you're away" (Danny 13:48 / 13:51 AWST), this page's own copy of the dad-page pattern (never linked or loaded from it):
   - media element bridge: the WebAudio output -> MediaStreamAudioDestinationNode -> a hidden <audio playsinline>, so iOS Safari treats the
     page's sound as media playback. Once the element is really playing the direct path is disconnected (no doubled sound); if the
     element pauses, the direct path comes back.
   - Media Session: title, playbackState, and play / pause / stop handlers wired to the page's own sound switch; audioSession 'playback'.
   This page only plays short chimes, so the element plays while a chime rings and rests after it (PHI x the chime's own length). */
(function (W, D) {
  "use strict";
  var N = W.NOT, PHI = N.PHI, MS = 1000;                                         // unit: ms per second
  var ctx = N.ctx, out = N.out, el = null, direct = true, rest = 0;
  if (!ctx || !out) return;
  try { if (navigator.audioSession) navigator.audioSession.type = "playback"; } catch (e) {}
  if (ctx.createMediaStreamDestination && W.HTMLAudioElement) {
    try { var msd = ctx.createMediaStreamDestination(); out.connect(msd);
      el = D.createElement("audio"); el.setAttribute("playsinline", ""); el.srcObject = msd.stream;
      el.addEventListener("pause", function () { if (!direct) { try { out.connect(ctx.destination); } catch (e) {} direct = true; } });
    } catch (e) { el = null; }
  }
  function elPlay() {
    if (!el) return; var p; try { p = el.play(); } catch (e) { return; }
    if (p && p.then) p.then(function () { if (direct && !el.paused) { try { out.disconnect(ctx.destination); direct = false; } catch (e) {} } }, function () {});
  }
  function elStop() { if (el) try { el.pause(); } catch (e) {} }
  var wired = false;
  function session(state) {
    var m = navigator.mediaSession; if (!m) return;
    try {
      if (!wired) { wired = true;
        m.setActionHandler("play", function () { N.setSound(true); try { ctx.resume(); } catch (e) {} });
        m.setActionHandler("pause", function () { N.setSound(false); });
        m.setActionHandler("stop", function () { N.setSound(false); }); }
      if (state === "playing" && W.MediaMetadata) m.metadata = new MediaMetadata({ title: "Onboarding test sounds", artist: "Kids Club" });   // label: lock-screen text
      m.playbackState = state;
    } catch (e) {}
  }
  function ring(len) {                                                           // a chime is ringing: play through the media element
    clearTimeout(rest); elPlay(); session("playing");
    rest = setTimeout(function () { session("paused"); if (D.hidden) elStop(); }, len * PHI * MS);
  }
  function wake() { if (el && el.paused && W.NOTSound && W.NOTSound.ringing()) elPlay(); }
  function stop() { clearTimeout(rest); elStop(); session("paused"); }
  D.addEventListener("visibilitychange", function () { if (D.hidden && !(W.NOTSound && W.NOTSound.ringing())) elStop(); });
  W.NOTSoundExtras = { ring: ring, wake: wake, stop: stop, get bridged() { return !!el && !direct; }, get el() { return el; } };
  N.log("sound-extras", { bridge: !!el, mediaSession: !!navigator.mediaSession });
  if (W.NOTSound && W.NOTSound.ringing()) ring(W.NOTSound.left());              // the first chime is still ringing
})(window, document);
