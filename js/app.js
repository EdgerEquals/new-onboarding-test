/* APP: the new-kid flow (shared layer: light first-build onboarding; kid makes their own bot name and avatar; logo grows with the page;
   resume on refresh; Back on every screen after the first). A test page: it belongs to no kid and carries no names.
   The only typed fields are the two names. Everything else is buttons and tiles. */
(function (W, D) {
  "use strict";
  var N = W.NOT, A = W.ART, PHI = N.PHI, IP = N.IP, FIB = N.FIB;
  var BUILD = "v0.2 test build, 2026-10-26 (rhythms keep going)";                                     // label: version stamp
  var FLOW = ["welcome", "name", "botname", "avatar", "colour", "frame", "pattern", "logo", "sections", "page"];
  var PATH = ["avatar", "colour", "frame", "pattern", "logo", "sections"];      // the kid's own page path (logo step inside it)
  var PRE = PATH.slice(0, PATH.indexOf("logo"));                                 // pieces that feed the logo before the hand-over
  var app = D.getElementById("app"), S;

  function h(tag, at, kids) {
    var e = D.createElement(tag);
    for (var k in at || {}) { if (k === "on") for (var ev in at.on) e.addEventListener(ev, at.on[ev]); else if (k === "text") e.textContent = at.text; else e.setAttribute(k, at[k]); }
    (kids || []).forEach(function (c) { if (c) e.appendChild(typeof c === "string" ? D.createTextNode(c) : c); });
    return e;
  }
  function btn(label, fn, cls, id) { return h("button", { type: "button", class: "tile " + (cls || ""), "data-id": id || label, on: { click: fn } }, [label]); }
  function go(step) { N.log("step", { from: S.step, to: step }); S.step = step; N.save(); render(); W.scrollTo(0, 0); }
  function next() { go(FLOW[FLOW.indexOf(S.step) + 1]); }
  function back() { go(FLOW[Math.max(1, FLOW.indexOf(S.step) - 1)]); }
  function done(piece) { if (S.done.indexOf(piece) < 0) S.done.push(piece); var i = S.skipped.indexOf(piece); if (i >= 0) S.skipped.splice(i, 1); N.chime("piece"); N.log("piece-done", { piece: piece }); }
  function skip(piece) { if (S.skipped.indexOf(piece) < 0 && S.done.indexOf(piece) < 0) S.skipped.push(piece); N.log("skip", { piece: piece }); next(); }

  // ---------- page palette (kid's own hue; contrast checked against WCAG AA) ----------
  function palette() {
    var p = S.page, hk = p.hue != null ? p.hue : (S.avatar.hue != null ? S.avatar.hue : 0), hu = A.hue(hk), dark = p.mode !== "light";
    var lb = dark ? Math.pow(IP, FIB[4]) : 1 - Math.pow(IP, FIB[4]), lf = 1 - lb, sat = Math.pow(IP, 3);
    A.dark = dark; p.bgRGB = A.rgb(hu, sat, lb); p.fgRGB = A.rgb(hu, sat, lf);
    var r = D.documentElement.style;
    r.setProperty("--bg", A.hsl(hu, sat, lb)); r.setProperty("--fg", A.hsl(hu, sat, lf));
    r.setProperty("--surface", A.hsl(hu, sat, dark ? Math.pow(IP, 3) : 1 - Math.pow(IP, 3)));
    r.setProperty("--accent", A.hsl(hu, IP, IP));
    r.setProperty("--breath-k", 1 + Math.pow(IP, FIB[4]));
    N.applyScale();
  }

  // ---------- logo: grows with the page, then the kid's own ----------
  function autoLogo() { var p = S.page; return { hue: p.hue != null ? p.hue : null, frame: p.frame, pattern: p.pattern, centre: S.done.indexOf("avatar") >= 0 ? S.avatar : null, motion: "breathe" }; }
  function haveFrom(list) { return { colour: list.indexOf("colour") >= 0, frame: list.indexOf("frame") >= 0, pattern: list.indexOf("pattern") >= 0, centre: list.indexOf("avatar") >= 0 }; }
  function logoNow(pending) {
    if (S.logo.current) return A.logo(S.logo.current, S.logo.current.have, "logo");
    var have = haveFrom(S.done), L = autoLogo();
    if (pending) have[pending === "avatar" ? "centre" : pending] = true;          // the piece being picked shows as it's chosen
    var s = A.logo(L, have, "logo");
    s.style.setProperty("--grow", progress());
    return s;
  }
  function progress() { var n = 0; PRE.forEach(function (p) { if (S.done.indexOf(p) >= 0) n++; }); return n / PRE.length; }
  function handover() {                                                          // auto-assembly stops for good; what's there is kept
    if (S.logo.current) return;
    var L = autoLogo(); L.have = haveFrom(S.done); L.have.colour = true; L.have.frame = true; L.have.pattern = true;   // from here every layer is theirs to change
    if (L.hue == null) L.hue = S.avatar.hue != null ? S.avatar.hue : 0;
    L.frame = L.frame || A.FRAMES[A.FRAMES.length - 1]; L.pattern = L.pattern || A.PATTERNS[0];
    S.logo.start = JSON.parse(JSON.stringify(L)); S.logo.current = JSON.parse(JSON.stringify(L));
    S.logo.handoverAt = new Date().toISOString(); S.logo.progressAtHandover = progress();
    N.log("logo-handover", { progress: S.logo.progressAtHandover, layers: L.have }); N.save();
  }
  function logoButton(where) {
    var b = h("button", { type: "button", class: "logo-btn", "data-id": "logo-" + where, "aria-label": "Your logo. Tap to change it." }, [logoNow()]);
    if (S.logo.current) b.addEventListener("click", function () { N.chime("logo"); N.log("logo-open", { from: where }); overlay("logo"); });
    return b;
  }

  // ---------- shared bits ----------
  function frame(title, sub, body, opts) {
    opts = opts || {};
    var i = PATH.indexOf(S.step), bar = i >= 0 ? h("div", { class: "progress", role: "progressbar", "aria-valuemin": "0", "aria-valuemax": String(PATH.length), "aria-valuenow": String(i) }, [h("i", { style: "--p:" + (i / PATH.length) })]) : null;
    var top = h("div", { class: "top" }, [FLOW.indexOf(S.step) > 1 ? btn("← Back", back, "ghost", "back") : h("span"), bar, opts.logo !== false && FLOW.indexOf(S.step) >= FLOW.indexOf("avatar") ? h("div", { class: "mini-logo" }, [logoNow(opts.pending)]) : h("span")]);
    app.replaceChildren(h("section", { class: "screen s-" + S.step }, [top, h("h1", { text: title }), sub ? h("p", { class: "sub", text: sub }) : null].concat(body)));
    var f = app.querySelector("input,button.tile:not(.ghost)"); if (f) f.focus({ preventScroll: true });
  }
  function group(label, items, cur, pick, draw) {
    return h("div", { class: "group" }, [h("h2", { text: label }), h("div", { class: "tiles" }, items.map(function (it, k) {
      var b = btn(draw ? "" : it, function () { pick(it, k); }, "pick" + (cur === it ? " on" : ""), label + ":" + it);
      b.setAttribute("aria-pressed", cur === it ? "true" : "false");
      if (draw) { b.appendChild(draw(it, k)); b.setAttribute("aria-label", label + " " + (typeof it === "number" ? "colour " + (k + 1) : it)); }
      return b;
    }))]);
  }
  function hueDot(k) { return h("span", { class: "dot", style: "background:" + A.hsl(A.hue(k), IP, IP) }); }
  function hues() { var a = []; for (var k = 0; k < A.HUES; k++) a.push(k); return a; }
  function nameScreen(field, title, sub, next2) {
    var inp = h("input", { type: "text", id: "f-" + field, autocomplete: "off", spellcheck: "false", "aria-label": title, value: S[field] || "" });
    function ok() { var v = inp.value.trim(); S[field] = v; N.log(field, { given: !!v, length: v.length }); if (v) next2(); else skip(field); }
    inp.addEventListener("keydown", function (e) { if (e.key === "Enter") ok(); });
    frame(title, sub, [inp, h("div", { class: "row" }, [btn("Next →", ok, "primary", field + "-next"), btn("Skip for now", function () { skip(field); }, "ghost", field + "-skip")])]);
  }

  // ---------- screens ----------
  var screens = {
    welcome: function () {
      var body = [h("p", { class: "note", text: "This is a test page. Everything you make stays on this device. Nothing is sent anywhere." })];
      if (S.started && S.resumeTo) body.push(h("div", { class: "row" }, [btn("Continue", function () { go(S.resumeTo); }, "primary", "continue"), btn("Start over", startOver, "ghost", "start-over-welcome")]));
      else body.push(btn("Start", function () { S.started = new Date().toISOString(); N.log("start"); next(); }, "primary", "start"));
      frame("Let's build your own page", "First your bot, then your page. Your logo builds itself as you go.", body, { logo: false });
    },
    name: function () { nameScreen("kidName", "What's your name?", "Only you see this. It stays on this device.", next); },
    botname: function () { nameScreen("botName", "What will you call your bot?", "Your bot is your helper. Pick any name you like.", function () { done("botname"); next(); }); },
    avatar: function () {
      var a = S.avatar, prev = h("div", { class: "av-prev" }, [A.avatar(a)]);
      function set(k, v) { a[k] = v; N.log("avatar-pick", { part: k, value: v }); N.chime("tile", FIB[1]); render(); }
      frame("Make your bot's look", (S.botName ? "This is how " + S.botName + " will look." : "This is how your bot will look.") + " Tap the tiles.", [prev,
        group("Shape", A.SHAPES, a.shape, function (v) { set("shape", v); }, function (v) { return A.avatar({ shape: v, hue: a.hue }); }),
        group("Colour", hues(), a.hue, function (v) { set("hue", v); }, hueDot),
        group("Eyes", A.EYES, a.eyes, function (v) { set("eyes", v); }, function (v) { return A.avatar({ shape: a.shape, hue: a.hue, eyes: v }); }),
        group("Extra", A.EXTRAS, a.extra, function (v) { set("extra", v); }, function (v) { return A.avatar({ shape: a.shape, hue: a.hue, eyes: a.eyes, extra: v }); }),
        h("p", { class: "note", text: "A grown-up says yes before your bot uses this name and look." }),
        h("div", { class: "row" }, [btn("Done →", function () { done("avatar"); next(); }, "primary", "avatar-done"), btn("Skip for now", function () { skip("avatar"); }, "ghost", "avatar-skip")])], { pending: "avatar" });
    },
    colour: function () {
      var p = S.page;
      frame("Pick your page colour", "Watch your logo up top. It grows as you build.", [
        group("Colour", hues(), p.hue, function (v) { p.hue = v; palette(); N.log("page-pick", { part: "hue", value: v }); render(); }, hueDot),
        group("Light or dark", ["dark", "light"], p.mode || "dark", function (v) { p.mode = v; palette(); N.log("page-pick", { part: "mode", value: v }); render(); }),
        h("div", { class: "row" }, [btn("Next →", function () { if (p.hue == null) { p.hue = S.avatar.hue || 0; palette(); } done("colour"); next(); }, "primary", "colour-next"), btn("Skip for now", function () { skip("colour"); }, "ghost", "colour-skip")])], { pending: S.page.hue != null ? "colour" : null });
    },
    frame: function () {
      var p = S.page;
      frame("Pick a banner shape", "Your banner goes across the top of your page.", [
        h("div", { class: "banner-prev b-" + (p.frame || "none") }),
        group("Banner", A.FRAMES, p.frame, function (v) { p.frame = v; N.log("page-pick", { part: "frame", value: v }); render(); }),
        h("div", { class: "row" }, [btn("Next →", function () { if (!p.frame) return skip("frame"); done("frame"); next(); }, "primary", "frame-next"), btn("Skip for now", function () { skip("frame"); }, "ghost", "frame-skip")])], { pending: p.frame ? "frame" : null });
    },
    pattern: function () {
      var p = S.page;
      frame("Pick a pattern", "It shows up on your page and in your logo.", [
        group("Pattern", A.PATTERNS, p.pattern, function (v) { p.pattern = v; N.log("page-pick", { part: "pattern", value: v }); render(); }),
        h("div", { class: "row" }, [btn("Next →", function () { if (!p.pattern) return skip("pattern"); done("pattern"); next(); }, "primary", "pattern-next"), btn("Skip for now", function () { skip("pattern"); }, "ghost", "pattern-skip")])], { pending: p.pattern ? "pattern" : null });
    },
    logo: function () {
      handover();
      frame("Now it's your logo", "It built itself from what you picked. From here it only changes when you change it.", [editor("logo-step"),
        h("div", { class: "row" }, [btn("Keep it →", function () { done("logo"); next(); }, "primary", "logo-keep")])], { logo: false });
    },
    sections: function () {
      var p = S.page; p.sections = p.sections || [];
      var opts = ["About me", "Things I love", "My bot's corner", "Pictures", "My music"];
      frame("What goes on your page?", "Pick as many as you like. You can add more later.", [
        h("div", { class: "tiles" }, opts.map(function (o) { var on = p.sections.indexOf(o) >= 0;
          var b = btn(o, function () { if (on) p.sections.splice(p.sections.indexOf(o), 1); else p.sections.push(o); N.log("section", { name: o, on: !on }); render(); }, "pick" + (on ? " on" : ""), "section:" + o);
          b.setAttribute("aria-pressed", on ? "true" : "false"); return b; })),
        h("p", { class: "note", text: "Your logo stays the way you left it. Tap it any time to change it." }),
        h("div", { class: "row" }, [btn("Finish →", function () { done("sections"); next(); }, "primary", "sections-finish"), btn("Skip for now", function () { skip("sections"); }, "ghost", "sections-skip")])]);
    },
    page: function () {
      var p = S.page, bot = h("button", { type: "button", class: "bot-card", "data-id": "bot-card", "aria-label": "Your bot. Tap to change its name or look.", on: { click: function () { N.log("avatar-open"); overlay("avatar"); } } },
        [A.avatar(S.avatar), h("span", { text: S.botName || "Your bot" })]);
      var hint = !S.logo.hintShown ? h("p", { class: "hint", role: "status", text: "Tip: tap your logo any time to change it." }) : null;
      S.logo.hintShown = true; N.save();
      app.replaceChildren(h("section", { class: "screen s-page" }, [
        h("header", { class: "kid-banner b-" + (p.frame || "none") + " p-" + (p.pattern || "none") }, [logoButton("page"), h("div", { class: "hi", text: S.kidName ? "Hi " + S.kidName + "!" : "Hi!" })]),
        hint, bot,
        h("div", { class: "sections" }, (p.sections && p.sections.length ? p.sections : ["About me"]).map(function (s) { return h("article", { class: "card" }, [h("h2", { text: s }), h("p", { class: "sub", text: "Coming soon. You'll fill this in on your dashboard." })]); })),
        h("div", { class: "build-more" }, [h("p", { text: "You can come back any time and build more on your dashboard." }), btn("Build more (coming soon)", function () { N.log("build-more"); }, "ghost", "build-more")])
      ]));
      if (hint) N.log("hint-shown");
    }
  };

  // ---------- the logo editor (buttons and tiles, no settings boxes) ----------
  function editor(where) {
    var L = S.logo.current;
    function set(k, v) { L[k] = v; N.log("logo-change", { part: k, value: v, where: where }); N.chime("logo", FIB[2]); N.save(); render(); }
    return h("div", { class: "editor" }, [h("div", { class: "logo-big" }, [A.logo(L, L.have, "logo")]),
      group("Colour", hues(), L.hue, function (v) { set("hue", v); }, hueDot),
      group("Frame", A.FRAMES, L.frame, function (v) { set("frame", v); }),
      group("Pattern", A.PATTERNS, L.pattern, function (v) { set("pattern", v); }),
      group("Middle", ["my bot", "empty"], L.centre ? "my bot" : "empty", function (v) { L.have.centre = v === "my bot"; set("centre", v === "my bot" ? JSON.parse(JSON.stringify(S.avatar)) : null); }),
      group("Motion", ["breathe", "still", "spin"], L.motion, function (v) { set("motion", v); }),
      h("div", { class: "row" }, [btn("Back to my start", function () { S.logo.current = JSON.parse(JSON.stringify(S.logo.start)); N.log("logo-revert", { where: where }); N.save(); render(); }, "ghost", "logo-revert"),
        btn(N.sound ? "Hear it" : "Sound is off", function () { N.chime("logo", FIB[4]); }, "ghost", "logo-hear")])]);
  }
  var open = null;
  function overlay(kind) {
    open = kind;
    var body = kind === "logo" ? [h("h1", { text: "Change your logo" }), editor("overlay")] : kind === "knobs" ? knobsPanel() : avatarEditor();
    var o = h("div", { class: "overlay", role: "dialog", "aria-modal": "true" }, [h("div", { class: "sheet" }, body.concat([btn("Done", function () { open = null; o.remove(); N.log("overlay-close", { kind: kind }); render(); }, "primary", "overlay-done")]))]);
    var old = D.querySelector(".overlay"); if (old) old.remove();
    D.body.appendChild(o); o.querySelector("button").focus();
    if (kind === "knobs") { knobsSync(); knobsTick(); }
  }
  function avatarEditor() {
    var a = S.avatar;
    function set(k, v) { a[k] = v; N.log("avatar-change", { part: k, value: v }); N.save(); overlay("avatar"); }
    var inp = h("input", { type: "text", id: "f-botName-edit", autocomplete: "off", "aria-label": "Bot name", value: S.botName || "" });
    inp.addEventListener("change", function () { S.botName = inp.value.trim(); N.log("botName-change", { given: !!S.botName, length: S.botName.length }); N.save(); });
    return [h("h1", { text: "Change your bot" }), h("div", { class: "av-prev" }, [A.avatar(a)]), inp,
      group("Shape", A.SHAPES, a.shape, function (v) { set("shape", v); }, function (v) { return A.avatar({ shape: v, hue: a.hue }); }),
      group("Colour", hues(), a.hue, function (v) { set("hue", v); }, hueDot),
      group("Eyes", A.EYES, a.eyes, function (v) { set("eyes", v); }),
      group("Extra", A.EXTRAS, a.extra, function (v) { set("extra", v); }),
      h("p", { class: "note", text: "A grown-up says yes before your bot uses this name and look." })];
  }
  function render() {
    if (S.step !== "welcome") S.resumeTo = S.step;
    N.save(); palette();
    (screens[S.step] || screens.welcome)();
    if (open && !D.querySelector(".overlay")) overlay(open);
    else if (open) overlay(open);
    motionSync();
  }

  // ---------- logo motion keeps going (continuity): its phase is a function of time, t = now - t0 ----------
  // Every render draws a fresh logo whose CSS animation would start at zero; instead each one is set to the shared phase, which is
  // saved on the device, carried through reloads and returns, and restarts with the daily restart.
  var MOTION = ["breathe", "spin"], motionT0 = Date.now();
  function motionSync() {
    if (!D.getAnimations) return;
    var e = Date.now() - motionT0;
    D.getAnimations().forEach(function (a) { if (MOTION.indexOf(a.animationName) >= 0) try { a.currentTime = e * (a.playbackRate || 1); } catch (er) {} });
  }
  if (W.RhythmContinuity) RhythmContinuity.register("logo:motion", { save: function () { return { t0: motionT0 }; },
    catchUp: function (e, st, mode) { if (mode !== "restart" && st && isFinite(st.t0)) motionT0 = st.t0; requestAnimationFrame(motionSync); },
    reset: function () { motionT0 = Date.now(); motionSync(); } });

  // ---------- knobs: open at the live pump values (Kids Club "settings open live", Danny 13:51 AWST) ----------
  var KNOBS = [["pace", "Pace (your rhythm)"], ["tint", "Sky tint (season)"], ["pitch", "Pitch (sky and weather)"]];
  var PCT = 100, TURN = 360;                                                     // unit: per cent; degrees per turn
  function knobLabel(k, n) {
    if (k === "pace") return "breath " + Math.round(Math.pow(PHI, n)) + " s";
    if (k === "pitch") return n < 0 ? "lower" : n > 0 ? "higher" : "middle";
    var L = N.knob("tint").ladder; return n === L[0] ? "strongest" : n === L[L.length - 1] ? "softest" : "rung " + n;
  }
  function knobsPanel() {
    var wrap = h("div", { class: "knobs" }), live = h("p", { class: "sub knob-live" });
    KNOBS.forEach(function (kk) {
      var k = kk[0], st = N.knob(k);
      wrap.appendChild(h("div", { class: "group" }, [h("h2", { text: kk[1] }), h("div", { class: "tiles", "data-knob": k }, st.ladder.map(function (n) {
        var b = btn(knobLabel(k, n), function () { N.setKnob(k, n); knobsSync(); }, "pick", "knob:" + k + ":" + n);
        b.setAttribute("data-rung", n); return b; }))]));
    });
    return [h("h1", { text: "Knobs" }), live, wrap, h("p", { class: "note", text: "Each knob starts where the sky, the weather and your rhythm have it right now (the dotted one). Tap to nudge it. Tap the dotted one to go back to live. Nudges clear at the daily restart." })];
  }
  function knobsSync() {
    var o = D.querySelector(".overlay"); if (!o || open !== "knobs") return;
    KNOBS.forEach(function (kk) { var k = kk[0], st = N.knob(k);
      o.querySelectorAll('[data-knob="' + k + '"] .tile').forEach(function (b) { var n = +b.getAttribute("data-rung");
        b.classList.toggle("on", n === st.eff); b.setAttribute("aria-pressed", n === st.eff ? "true" : "false");
        b.classList.toggle("is-live", n === st.live); b.title = n === st.live ? "live now" : ""; }); });
    var z = N.liveSky(), l = o.querySelector(".knob-live");
    if (l) l.textContent = "Live now: sun " + (z.sun == null ? "?" : Math.round(z.sun) + "°") + ", moon " + (z.moonLit == null ? "?" : Math.round(z.moonLit * PCT) + "% lit") +
      ", season " + (z.season == null ? "?" : Math.round(z.season * TURN) + "°") + ", weather " + (z.weather == null ? "not in yet" : Math.round(z.weather * PCT) + "% of today's range") +
      ", breath " + z.B.toFixed(1) + " s";
  }
  var knobTimer = 0;
  function knobsTick() { clearTimeout(knobTimer); if (open !== "knobs") return; if (!D.hidden) knobsSync(); knobTimer = setTimeout(knobsTick, N.B() * Math.pow(IP, 2) * MSF); }

  // ---------- tester bar: build stamp, bug mark, feedback export, less motion, sound, start over ----------
  var armed = null, barOpen = false;
  function startOver() { N.log("reset"); N.reset(); S = N.S; motionT0 = Date.now(); open = null; var o = D.querySelector(".overlay"); if (o) o.remove(); S.step = "welcome"; render(); toast("Started over. Everything from the last run is cleared."); }
  function toast(t) { var e = D.getElementById("toast"); e.textContent = t; e.classList.add("on"); clearTimeout(e._t); e._t = setTimeout(function () { e.classList.remove("on"); }, N.B() * Math.pow(IP, 2) * MSF); }
  var MSF = 1000;                                                                // unit: ms per second
  function summary() {
    var kn = (S.kidName || "").toLowerCase(), bn = S.botName || "", leak = kn && bn.toLowerCase().indexOf(kn) >= 0;
    return { page: "new-onboarding-test", build: BUILD, exportedAt: new Date().toISOString(), tzOffsetMin: -new Date().getTimezoneOffset(),
      note: "No kid name is included. The bot name is left out if it contains the name typed on the first screen.",
      env: { shortSidePx: Math.min(W.innerWidth, W.innerHeight), lightView: D.documentElement.getAttribute("data-light"), reducedMotion: N.rm(), userAgent: navigator.userAgent },
      created: { kidNameGiven: !!S.kidName, botName: leak ? null : (bn || null), botNameWithheld: !!leak, avatar: S.avatar,
        page: { hue: S.page.hue, mode: S.page.mode, frame: S.page.frame, pattern: S.page.pattern, sections: S.page.sections },
        path: PATH, done: S.done, skipped: S.skipped, step: S.step,
        logo: { start: S.logo.start, current: S.logo.current, handoverAt: S.logo.handoverAt, progressAtHandover: S.logo.progressAtHandover,
          changedSinceStart: JSON.stringify(S.logo.start) !== JSON.stringify(S.logo.current) } },
      anchors: { B_seconds: N.B(), skyB_seconds: N.skyB(), kidGapMedian: N.kidGap(), gaps: S.gaps.length, weather: N.wx ? { pos: N.wx.pos, U: N.wx.U } : null },
      pitch: N.S && N.pitch(), amplitudeMatrix: N.AMP.defined ? "defined" : "TODO (not yet defined; placeholder share used)",
      continuity: W.RhythmContinuity ? W.RhythmContinuity.info() : null, knobs: { pace: N.knob("pace"), tint: N.knob("tint"), pitch: N.knob("pitch") },
      tapToSound: S.lastTapToSound || null, soundBridged: !!(W.NOTSoundExtras && W.NOTSoundExtras.bridged),
      dials: S.dials, usage: S.usage, bugMarks: S.bugs, events: S.events };
  }
  function copyFeedback() {
    N.log("export"); var txt = JSON.stringify(summary(), null, FIB[2]);
    var fallback = function () {
      var o = h("div", { class: "overlay", role: "dialog", "aria-modal": "true" }, [h("div", { class: "sheet" }, [h("h1", { text: "Copy this feedback" }),
        h("p", { class: "sub", text: "Your browser didn't let the page copy it. Select all of it and copy it yourself." }),
        h("textarea", { readonly: "readonly", class: "export", id: "export-text" }, [txt]), btn("Close", function () { o.remove(); }, "primary", "export-close")])]);
      D.body.appendChild(o); var ta = o.querySelector("textarea"); ta.focus(); ta.select();
    };
    W.__lastExport = txt;
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(function () { toast("Feedback copied. Paste it back into the chat."); }, fallback);
    else fallback();
  }
  function bar() {
    var rmOn = N.rm();
    var resetBtn = btn(armed ? "Tap again to start over" : "Start over", function () { if (armed) { clearTimeout(armed); armed = null; startOver(); bar(); return; } armed = setTimeout(function () { armed = null; bar(); }, N.B() * MSF * Math.pow(IP, 2)); bar(); }, "small warn", "reset");
    var more = [btn("🎛 Knobs", function () { N.log("knobs-open"); overlay("knobs"); }, "small", "knobs"), btn("🐞 Bug here", function () { S.bugs++; N.log("bug-mark", { step: S.step, overlay: open }); toast("Marked. It's in the feedback with this screen."); }, "small", "bug"),
      btn(rmOn ? "Motion: less" : "Motion: full", function () { N.reducedMotion(!N.rm()); N.log("reduced-motion", { on: N.rm() }); bar(); }, "small", "motion"),
      btn(N.sound ? "Sound: on" : "Sound: off", function () { N.setSound(!N.sound); N.log("sound-toggle", { on: N.sound }); bar(); }, "small", "sound")];
    var b = h("footer", { class: "tester" + (barOpen ? " open" : ""), "aria-label": "Tester tools" }, [
      h("span", { class: "stamp", text: BUILD }), btn("Copy feedback", copyFeedback, "small", "export"), resetBtn,
      btn(barOpen ? "Less ▴" : "More ▾", function () { barOpen = !barOpen; bar(); }, "small ghost", "tester-more")].concat(barOpen ? more : []));
    var old = D.querySelector("footer.tester"); if (old) old.replaceWith(b); else D.body.appendChild(b);
    footH();
  }
  function footH() { var f = D.querySelector("footer.tester"); if (f) D.documentElement.style.setProperty("--foot", f.offsetHeight + "px"); }  // measured, not fixed

  // ---------- start ----------
  S = N.load(); N.dials();
  var mq = W.matchMedia ? W.matchMedia("(prefers-reduced-motion: reduce)") : null;
  N.reducedMotion(!!(mq && mq.matches));
  if (S.step !== "welcome") { S.resumeTo = S.step; S.step = "welcome"; }       // resume on refresh: offer Continue
  var soundAsked = false;
  function loadSound() { if (soundAsked) return; soundAsked = true; var s = D.createElement("script"); s.src = "js/sound.js"; s.async = true; D.head.appendChild(s); }
  D.addEventListener("pointerdown", function (e) { N.unlock(); loadSound(); var t = e.target.closest && e.target.closest("[data-id]"); N.tap(t ? t.getAttribute("data-id") : null); }, true);
  W.addEventListener("resize", function () { N.applyScale(); footH(); });
  D.addEventListener("visibilitychange", function () { if (D.hidden) N.log("hidden"); });
  N.log("load", { build: BUILD });
  render(); bar();
  var idle = W.requestIdleCallback || function (f) { setTimeout(f, N.B() * MSF * Math.pow(IP, FIB[4])); };
  var idleT1 = W.requestIdleCallback || function (f) { requestAnimationFrame(function () { setTimeout(f); }); };   // Safari: the frame after
  requestAnimationFrame(function () { idleT1(loadSound); });                      // T1: the sound engine loads at idle just after the first paint
  idle(function () { N.weather(); });                                             // tier 2: the weather feed loads at idle
  D.addEventListener("not:resume-tap", function () { toast("Tap anywhere to bring the sound back."); });   // one gentle tap, never a reset
  W.NOTAPP = { summary: summary, BUILD: BUILD, motionSync: motionSync, get motionT0() { return motionT0; } };
})(window, document);
