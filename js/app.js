/* APP: the new-kid flow (shared layer: light first-build onboarding; kid makes their own bot name and avatar; logo grows with the page;
   resume on refresh; Back on every screen after the first). A test page: it belongs to no kid and carries no names.
   The only typed fields are the two names. Everything else is buttons and tiles. */
(function (W, D) {
  "use strict";
  var N = W.NOT, A = W.ART, PHI = N.PHI, IP = N.IP, FIB = N.FIB;
  var BUILD = "v0.3 test build, 2026-10-26 (review fixes)";                                     // label: version stamp
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
  var keepFocus = null;                                                          // keyboard focus stays on the picked tile across a re-render
  function btn(label, fn, cls, id) { var b = h("button", { type: "button", class: "tile " + (cls || ""), "data-id": id || label, on: { click: function (e) { keepFocus = b.getAttribute("data-id"); fn(e); } } }, [label]); return b; }
  function refocus() {
    if (keepFocus == null) return false;
    var t = null; D.querySelectorAll("[data-id]").forEach(function (e) { if (!t && e.getAttribute("data-id") === keepFocus) t = e; });
    keepFocus = null; if (t && t.offsetParent !== null) { t.focus({ preventScroll: true }); return true; } return false;
  }
  function say(t) { var e = D.getElementById("status"); if (e) e.textContent = t; }   // the one small aria-live status line
  function go(step) { N.log("step", { from: S.step, to: step }); stuckStep(step); S.step = step; N.save(); render(); W.scrollTo(0, 0);
    var t = app.querySelector("h1"); if (t) say(t.textContent); }
  function next() { go(FLOW[FLOW.indexOf(S.step) + 1]); }
  function back() { go(FLOW[Math.max(1, FLOW.indexOf(S.step) - 1)]); }
  function done(piece) { if (S.done.indexOf(piece) < 0) S.done.push(piece); var i = S.skipped.indexOf(piece); if (i >= 0) S.skipped.splice(i, 1); N.chime("piece"); N.log("piece-done", { piece: piece }); }
  function skip(piece) { if (S.skipped.indexOf(piece) < 0 && S.done.indexOf(piece) < 0) S.skipped.push(piece); N.log("skip", { piece: piece }); next();
    toast("That's fine. We'll use a starter pick for now, and you can come back to it any time."); }

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
  function live(L) { var v = Object.assign({}, L); if (v.centre) v.centre = S.avatar; return v; }   // the logo's middle follows the bot's current look
  function logoNow(pending) {
    if (S.logo.current) return A.logo(live(S.logo.current), S.logo.current.have, "logo");
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
    var i = FLOW.indexOf(S.step) - 1, total = FLOW.length - 2, bar = null;       // steps after the welcome, up to the page (the real step count)
    if (i >= 0 && i < total) {
      bar = h("div", { class: "steps", "data-id": "steps", role: "img", "aria-label": "Step " + (i + 1) + " of " + total }, [h("span", { class: "dots" }, FLOW.slice(1, -1).map(function (st, k) {
        return h("i", { class: k < i ? "done" : k === i ? "now" : "" }); })), h("span", { class: "steps-n", text: (i + 1) + " / " + total })]);
    }
    var top = h("div", { class: "top" }, [FLOW.indexOf(S.step) > 1 ? btn("← Back", back, "ghost", "back") : h("span"), bar, opts.logo !== false && FLOW.indexOf(S.step) >= FLOW.indexOf("avatar") ? h("div", { class: "mini-logo", "data-id": "mini-logo" }, [logoNow(opts.pending)]) : h("span")]);
    app.replaceChildren(h("section", { class: "screen s-" + S.step }, [top, h("h1", { text: title }), sub ? h("p", { class: "sub", text: sub }) : null].concat(body)));
    if (!refocus()) { var f = app.querySelector("input,button.tile:not(.ghost)"); if (f) f.focus({ preventScroll: true }); }
  }
  function group(label, items, cur, pick, draw) {
    return h("div", { class: "group" }, [h("h2", { text: label }), h("div", { class: "tiles" }, items.map(function (it, k) {
      var b = btn(draw ? "" : it, function () { pick(it, k); }, "pick" + (cur === it ? " on" : ""), label + ":" + it);
      b.setAttribute("aria-pressed", cur === it ? "true" : "false");
      if (draw) { b.appendChild(draw(it, k)); b.setAttribute("aria-label", label + " " + (typeof it === "number" ? "colour " + (k + 1) : it));
        if (typeof it !== "number") b.appendChild(h("span", { class: "cap", text: it })); }
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
      var body = [h("p", { class: "note", text: "This is a test page. Everything you make stays on this device. Nothing about you is sent." })];
      if (S.started && S.resumeTo) {                                             // shared device: check it's the same kid before carrying on
        body.push(h("p", { class: "sub", text: S.callMe ? "Is this you, " + S.callMe + "?" : "Is this you, carrying on from last time?" }));
        body.push(h("div", { class: "row" }, [btn("Yes, carry on", function () { go(S.resumeTo); }, "primary", "continue"), btn("No, I'm someone new", startOver, "ghost", "start-over-welcome")]));
      }
      else body.push(btn("Start", function () { S.started = new Date().toISOString(); N.log("start"); next(); }, "primary", "start"));
      frame("Let's build your own page", S.logo.current ? "Welcome back. Your logo is yours now. Tap it any time to change it." : "First your bot, then your page. Your logo builds itself as you go.", body, { logo: false });
      if (S.started && S.resumeTo) say("Welcome back.");
    },
    name: function () { nameScreen("callMe", "What would you like to be called?", "💡 Kind tip: we recommend not using your real name. A nickname or a fun word is perfect. It stays on this device.", next); },
    botname: function () { nameScreen("botName", "What will you call your bot?", "Your bot is a helper that chats with you. It only talks with you and your grown-up, never with strangers. Pick any name you like.", function () { done("botname"); next(); }); },
    avatar: function () {
      var a = S.avatar, prev = h("div", { class: "av-prev" }, [A.avatar(a)]);
      function set(k, v) { a[k] = v; N.log("avatar-pick", { part: k, value: v }); N.chime("tile", FIB[1]); render(); }
      frame("Make your bot's look", (S.botName ? "This is how " + S.botName + " will look." : "This is how your bot will look.") + " Tap the tiles.", [prev,
        group("Shape", A.SHAPES, a.shape, function (v) { set("shape", v); }, function (v) { return A.avatar({ shape: v, hue: a.hue }); }),
        group("Colour", hues(), a.hue, function (v) { set("hue", v); }, hueDot),
        group("Eyes", A.EYES, a.eyes, function (v) { set("eyes", v); }, function (v) { return A.face(v, a.hue); }),
        group("Extra", A.EXTRAS, a.extra, function (v) { set("extra", v); }, function (v) { return A.extraArt(v, a.hue); }),
        h("p", { class: "note", text: "A grown-up says yes before your bot uses this name and look." }),
        h("div", { class: "row" }, [btn("Done →", function () { done("avatar"); next(); }, "primary", "avatar-done"), btn("Skip for now", function () { skip("avatar"); }, "ghost", "avatar-skip")])], { pending: "avatar" });
    },
    colour: function () {
      var p = S.page;
      frame("Pick your page colour", S.logo.current ? "Your logo is yours now. Tap it any time to change it." : "Watch your logo up top. It grows as you build.", [
        group("Colour", hues(), p.hue, function (v) { p.hue = v; palette(); N.log("page-pick", { part: "hue", value: v }); render(); }, hueDot),
        group("Light or dark", ["dark", "light"], p.mode || "dark", function (v) { p.mode = v; palette(); N.log("page-pick", { part: "mode", value: v }); render(); }),
        h("div", { class: "row" }, [btn("Next →", function () { if (p.hue == null) { p.hue = S.avatar.hue || 0; palette(); } done("colour"); next(); }, "primary", "colour-next"), btn("Skip for now", function () { skip("colour"); }, "ghost", "colour-skip")])], { pending: S.page.hue != null ? "colour" : null });
    },
    frame: function () {
      var p = S.page;
      frame("Pick a banner shape", "Your banner goes across the top of your page.", [
        h("div", { class: "banner-prev b-" + (p.frame || "none") }),
        group("Banner", A.FRAMES, p.frame, function (v) { p.frame = v; N.log("page-pick", { part: "frame", value: v }); render(); }, function (v) { return h("span", { class: "mini-banner b-" + v }); }),
        h("div", { class: "row" }, [btn("Next →", function () { if (!p.frame) return skip("frame"); done("frame"); next(); }, "primary", "frame-next"), btn("Skip for now", function () { skip("frame"); }, "ghost", "frame-skip")])], { pending: p.frame ? "frame" : null });
    },
    pattern: function () {
      var p = S.page;
      frame("Pick a pattern", "It shows up on your page and in your logo.", [
        group("Pattern", A.PATTERNS, p.pattern, function (v) { p.pattern = v; N.log("page-pick", { part: "pattern", value: v }); render(); }, A.patternArt),
        h("div", { class: "row" }, [btn("Next →", function () { if (!p.pattern) return skip("pattern"); done("pattern"); next(); }, "primary", "pattern-next"), btn("Skip for now", function () { skip("pattern"); }, "ghost", "pattern-skip")])], { pending: p.pattern ? "pattern" : null });
    },
    logo: function () {
      handover();
      var picked = PRE.some(function (pc) { return S.done.indexOf(pc) >= 0; });
      frame("Now it's your logo", (picked ? "It built itself from what you picked." : "It starts from starter picks, because you skipped the pieces so far. That's fine.") + " From here it only changes when you change it.", [editor("logo-step"),
        h("div", { class: "row" }, [btn("Keep it →", function () { done("logo"); next(); }, "primary", "logo-keep")])], { logo: false });
    },
    sections: function () {
      var p = S.page; p.sections = p.sections || [];
      var opts = ["About me", "Things I love", "My bot's corner", "Pictures", "My music"], pics = { "About me": "🙂", "Things I love": "💛", "My bot's corner": "🤖", "Pictures": "🖼️", "My music": "🎵" };   // label: section names and pictures
      frame("What goes on your page?", "Pick as many as you like. You can add more later.", [
        h("div", { class: "tiles" }, opts.map(function (o) { var on = p.sections.indexOf(o) >= 0;
          var b = btn(pics[o] + " " + o, function () { if (on) p.sections.splice(p.sections.indexOf(o), 1); else p.sections.push(o); N.log("section", { name: o, on: !on }); render(); }, "pick" + (on ? " on" : ""), "section:" + o);
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
        h("div", { class: "top" }, [btn("← Back", back, "ghost", "back")]),
        h("header", { class: "kid-banner b-" + (p.frame || "none") + " p-" + (p.pattern || "none") }, [logoButton("page"), h("div", { class: "hi", text: S.callMe ? "Hi " + S.callMe + "!" : "Hi!" })]),
        hint, bot,
        h("div", { class: "sections" }, (p.sections && p.sections.length ? p.sections : ["My bot's corner"]).map(function (s) { return h("article", { class: "card" }, [h("h2", { text: s }), h("p", { class: "sub", text: "Coming soon. You'll fill this in on your dashboard." })]); })),
        h("div", { class: "build-more" }, [h("p", { text: "You can come back any time and build more on your dashboard." }), btn("Build more (coming soon)", function () { N.log("build-more"); }, "ghost", "build-more")])
      ]));
      if (hint) N.log("hint-shown");
      if (!refocus()) { var f0 = app.querySelector(".logo-btn,.bot-card"); if (f0) f0.focus({ preventScroll: true }); }
    }
  };

  // ---------- the logo editor (buttons and tiles, no settings boxes) ----------
  function editor(where) {
    var L = S.logo.current;
    function set(k, v) { L[k] = v; N.log("logo-change", { part: k, value: v, where: where }); N.chime("logo", FIB[2]); N.save(); render(); }
    return h("div", { class: "editor" }, [h("div", { class: "logo-big" }, [A.logo(live(L), L.have, "logo")]),
      group("Colour", hues(), L.hue, function (v) { set("hue", v); }, hueDot),
      group("Frame", A.FRAMES, L.frame, function (v) { set("frame", v); }, A.frameArt),
      group("Pattern", A.PATTERNS, L.pattern, function (v) { set("pattern", v); }, A.patternArt),
      group("Middle", ["my bot", "empty"], L.centre ? "my bot" : "empty", function (v) { L.have.centre = v === "my bot"; set("centre", v === "my bot" ? JSON.parse(JSON.stringify(S.avatar)) : null); }),
      group("Motion", ["breathe", "still", "spin"], L.motion, function (v) { set("motion", v); }, function (v) { var m = Object.assign({}, live(L), { motion: v }); return h("span", { class: "tile-logo" }, [A.logo(m, L.have, "logo")]); }),
      h("div", { class: "row" }, [btn("Back to my start", function () { S.logo.current = JSON.parse(JSON.stringify(S.logo.start)); N.log("logo-revert", { where: where }); N.save(); render(); }, "ghost", "logo-revert"),
        btn(N.sound ? "Hear it" : "Sound is off", function () { N.chime("logo", FIB[4]); }, "ghost", "logo-hear")])]);
  }
  var open = null;
  function closeOverlay() { if (!open) return; var kind = open; open = null; var o = D.querySelector(".overlay"); if (o) o.remove(); N.log("overlay-close", { kind: kind }); render(); }
  D.addEventListener("keydown", function (e) { if (e.key === "Escape" && open) { e.preventDefault(); closeOverlay(); } });   // Escape closes the overlay
  function overlay(kind) {
    open = kind;
    var body = kind === "logo" ? [h("h1", { text: "Change your logo" }), editor("overlay")] : kind === "knobs" ? knobsPanel() : avatarEditor();
    var o = h("div", { class: "overlay", role: "dialog", "aria-modal": "true" }, [h("div", { class: "sheet" }, body.concat([btn("Done", closeOverlay, "primary", "overlay-done")]))]);
    var old = D.querySelector(".overlay"); if (old) old.remove();
    D.body.appendChild(o);
    var hd = o.querySelector("h1"); if (hd) { hd.setAttribute("tabindex", "-1"); if (!refocus()) hd.focus(); } else o.querySelector("button").focus();
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
      group("Eyes", A.EYES, a.eyes, function (v) { set("eyes", v); }, function (v) { return A.face(v, a.hue); }),
      group("Extra", A.EXTRAS, a.extra, function (v) { set("extra", v); }, function (v) { return A.extraArt(v, a.hue); }),
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
  function tuning() { return h("span", { class: "tuning", title: "These ratios are placeholders waiting on Danny's decision." , text: "tuning" }); }   // label: placeholder tag
  function knobLabel(k, n) {
    if (k === "pace") return "breath " + Math.round(Math.pow(PHI, n)) + " s";
    if (k === "pitch") return n < 0 ? "lower" : n > 0 ? "higher" : "middle";
    var L = N.knob("tint").ladder; return n === L[0] ? "strongest" : n === L[L.length - 1] ? "softest" : "rung " + n;
  }
  function knobsPanel() {
    var wrap = h("div", { class: "knobs" }), live = h("p", { class: "sub knob-live" });
    KNOBS.forEach(function (kk) {
      var k = kk[0], st = N.knob(k);
      wrap.appendChild(h("div", { class: "group" }, [h("h2", {}, [kk[1], tuning()]), h("div", { class: "tiles", "data-knob": k }, st.ladder.map(function (n) {
        var b = btn(knobLabel(k, n), function () { N.setKnob(k, n); knobsSync(); }, "pick", "knob:" + k + ":" + n);
        b.setAttribute("data-rung", n); return b; }))]));
    });
    return [h("h1", { text: "Knobs" }), live, wrap];
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
  function startOver() { N.log("reset"); N.reset(); S = N.S; motionT0 = Date.now(); open = null; var o = D.querySelector(".overlay"); if (o) o.remove(); S.step = "welcome"; if (W.HelpOrb) W.HelpOrb.paint(); render(); toast("Started over. Everything from the last run is cleared."); }
  function toast(t) { say(t); var e = D.getElementById("toast"); e.textContent = t; e.classList.add("on"); clearTimeout(e._t); e._t = setTimeout(function () { e.classList.remove("on"); }, N.B() * Math.pow(IP, 2) * MSF); }
  var MSF = 1000;                                                                // unit: ms per second
  function summary() {
    var words = (S.callMe || "").toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean), bn = S.botName || "", bl = bn.toLowerCase();
    var leak = words.some(function (w) { return bl.indexOf(w) >= 0; });           // any word of the call-me name, case-insensitive
    return { page: "new-onboarding-test", build: BUILD, exportedAt: new Date().toISOString(), tzOffsetMin: -new Date().getTimezoneOffset(),
      note: "No call-me name is included. The bot name is left out if it contains any word of the call-me name.",
      env: { shortSidePx: Math.min(W.innerWidth, W.innerHeight), lightView: D.documentElement.getAttribute("data-light"), reducedMotion: N.rm(), userAgent: navigator.userAgent },
      created: { callMeGiven: !!S.callMe, botName: leak ? null : (bn || null), botNameWithheld: !!leak, avatar: S.avatar,
        page: { hue: S.page.hue, mode: S.page.mode, frame: S.page.frame, pattern: S.page.pattern, sections: S.page.sections },
        path: PATH, done: S.done, skipped: S.skipped, step: S.step,
        logo: { start: S.logo.start, current: S.logo.current, handoverAt: S.logo.handoverAt, progressAtHandover: S.logo.progressAtHandover,
          changedSinceStart: JSON.stringify(S.logo.start) !== JSON.stringify(S.logo.current) } },
      anchors: { B_seconds: N.B(), skyB_seconds: N.skyB(), kidGapMedian: N.kidGap(), gaps: S.gaps.length, weather: N.wx ? { pos: N.wx.pos, U: N.wx.U } : null },
      pitch: N.S && N.pitch(), amplitudeMatrix: N.AMP.defined ? "defined" : "TODO (not yet defined; placeholder share used)",
      continuity: W.RhythmContinuity ? W.RhythmContinuity.info() : null, knobs: { pace: N.knob("pace"), tint: N.knob("tint"), pitch: N.knob("pitch") },
      tapToSound: S.lastTapToSound || null, stuckTest: S.stuck || {}, soundBridged: !!(W.NOTSoundExtras && W.NOTSoundExtras.bridged),
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
      (function () { var sb = btn(N.sound ? "Sound: on" : "Sound: off", function () { N.setSound(!N.sound); N.log("sound-toggle", { on: N.sound }); bar(); }, "small", "sound"); sb.appendChild(tuning()); return sb; })()];
    var b = h("footer", { class: "tester" + (barOpen ? " open" : ""), "aria-label": "Tester tools" }, [
      h("span", { class: "stamp", text: BUILD }), btn("Copy feedback", copyFeedback, "small", "export"), resetBtn,
      btn(barOpen ? "Less ▴" : "More ▾", function () { barOpen = !barOpen; bar(); }, "small ghost", "tester-more")].concat(barOpen ? more : []));
    var old = D.querySelector("footer.tester"); if (old) old.replaceWith(b); else D.body.appendChild(b);
    footH();
  }
  function footH() { var f = D.querySelector("footer.tester"); if (f) D.documentElement.style.setProperty("--foot", f.offsetHeight + "px"); }  // measured, not fixed

  // ---------- stuck alert (Kids Club "stuck alert to Dad", generic TEST HOOK): logs locally only, no ntfy and no real ping ----------
  // Pump A pace per step: the time spent on a step (counted only while the page is open and in view) against the kid's own usual time
  // per step. One phi rung slower than usual on the same step = a possible stuck point. Quiet until the rhythm recovers (a tap or a new
  // step). Alerts are kept per step; when they cluster on one step it's flagged as a possible dead end. Nothing leaves the device.
  var dwell = 0, seen = Date.now(), alerted = false;
  function tick() { var now = Date.now(); if (!D.hidden) dwell += now - seen; seen = now; }
  function stuckStep(to) {                                                       // leaving a step: its time joins the kid's usual time per step
    tick(); if (dwell > 0 && S.step !== "welcome") S.stepDwell = S.stepDwell == null ? dwell : S.stepDwell * (1 - Math.pow(IP, 2)) + dwell * Math.pow(IP, 2);
    dwell = 0; alerted = false;
  }
  function stuckCheck() {
    tick();
    if (!alerted && S.stepDwell != null && S.step !== "welcome" && S.step !== "page" && dwell >= S.stepDwell * PHI) {
      alerted = true; S.stuck = S.stuck || {}; S.stuck[S.step] = (S.stuck[S.step] || 0) + 1;
      var last = S.events.length ? S.events[S.events.length - 1].ev : null;
      N.log("stuck-alert-test", { step: S.step, before: last, count: S.stuck[S.step], deadEnd: S.stuck[S.step] >= FIB[2], ping: "test hook only, not sent" });   // fib: two or more on one step = a cluster
    }
    setTimeout(stuckCheck, N.B() * MSF);                                         // checked once per breath B
  }
  D.addEventListener("visibilitychange", tick);
  D.addEventListener("pointerdown", function () { tick(); if (alerted) { alerted = false; dwell = 0; } }, true);   // the rhythm has recovered

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
  render(); bar(); setTimeout(stuckCheck, N.B() * MSF);
  var idle = W.requestIdleCallback || function (f) { setTimeout(f, N.B() * MSF * Math.pow(IP, FIB[4])); };
  var idleT1 = W.requestIdleCallback || function (f) { requestAnimationFrame(function () { setTimeout(f); }); };   // Safari: the frame after
  requestAnimationFrame(function () { idleT1(loadSound); });                      // T1: the sound engine loads at idle just after the first paint
  idle(function () { N.weather(); });                                             // tier 2: the weather feed loads at idle
  D.addEventListener("not:resume-tap", function () { toast("Tap anywhere to bring the sound back."); });   // one gentle tap, never a reset
  W.NOTAPP = { summary: summary, BUILD: BUILD, motionSync: motionSync, get motionT0() { return motionT0; } };
})(window, document);
