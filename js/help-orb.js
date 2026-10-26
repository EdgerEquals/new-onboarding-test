/* HELP ORB (Kids Club standard "help orb on by default, in the kid's own look", Danny 14:30 AWST 26 Oct 2026).
   On from the very first screen. Drop it on anything (drag it there, or tap the orb and then tap the thing) and that thing grows a
   little and says what it does in plain words. The kid picks the orb's look (orb, owl, car, moon, or their own emoji or word), saved on
   this device; every look works exactly the same (one drop handler, one grow, one help text). Placeholder controls say they're still
   being tuned. Sizes come from the page's own text unit as phi rungs (CSS), timings from B. No network, nothing leaves the device. */
(function (W, D) {
  "use strict";
  var N = W.NOT, PHI = N.PHI, IP = N.IP, MS = 1000;                               // unit: ms per second
  var LOOKS = [["orb", "🔮"], ["owl", "🦉"], ["car", "🚗"], ["moon", "🌙"]];       // label: the starter looks
  var TUNING = " This one is still being tuned, so it may change.";              // label: placeholder note
  function look() { var L = N.S.orbLook; return L && L.text ? L.text : "🔮"; }
  // ---------- help text for every control (by data-help, or by data-id) ----------
  var EXACT = {
    "start": "Starts building your page. First your bot, then your page.",
    "continue": "Carries on from where you stopped last time.",
    "start-over-welcome": "For someone new on this device. It clears the last person's picks and starts fresh.",
    "callMe-next": "Saves what you'd like to be called and goes on.", "callMe-skip": "Skips this for now. You can come back to it.",
    "botName-next": "Saves your bot's name and goes on.", "botName-skip": "Skips this for now. You can come back to it.",
    "back": "Goes back one step. Nothing you picked is lost.",
    "avatar-done": "Keeps this look for your bot and goes on.", "avatar-skip": "Skips this for now. Your bot gets a starter look.",
    "colour-next": "Keeps this colour and goes on.", "colour-skip": "Skips this for now. Your page gets a starter colour.",
    "frame-next": "Keeps this banner and goes on.", "frame-skip": "Skips this for now. You get a starter banner.",
    "pattern-next": "Keeps this pattern and goes on.", "pattern-skip": "Skips this for now. You get a starter pattern.",
    "logo-keep": "Keeps your logo the way it is and goes on. You can change it any time.",
    "logo-revert": "Puts your logo back to how it started.",
    "logo-hear": "Plays your logo's sound. Your device's volume sets how loud it is." + TUNING,
    "sections-finish": "Builds your page with the parts you picked.", "sections-skip": "Skips this for now. Your page starts with your bot's corner.",
    "logo-page": "Your logo. Tap it to change it.", "logo-step": "Your logo.",
    "bot-card": "Your bot. Tap it to change its name or look.",
    "build-more": "More things to add to your page later. Coming soon.",
    "overlay-done": "Closes this and keeps your changes.",
    "export": "For testers: copies what you made and a log of taps, so you can send it back. No call-me name is in it.",
    "reset": "For testers: tap twice to clear everything and start again.",
    "tester-more": "Shows or hides more tester tools.",
    "bug": "For testers: marks this screen so the grown-ups can find a problem.",
    "motion": "Turns movement on the page up or down.",
    "sound": "Turns the page's sounds on or off. Your device's volume is the loudness control." + TUNING,
    "knobs": "Opens the knobs. They start where the sky, weather and your own rhythm have them right now." + TUNING,
    "export-close": "Closes this box.",
    "f-callMe": "Type what you'd like to be called. A nickname is best, not your real name.",
    "f-botName": "Type a name for your bot.", "f-botName-edit": "Type a new name for your bot.",
    "steps": "How far along you are. Each dot is one step.",
    "mini-logo": "Your logo. It grows as you pick things, until it's yours to change.",
    "orb": "That's me! Drag me onto anything, or tap me and then tap the thing, and I'll explain it."
  };
  var PREFIX = [
    ["Shape:", "Picks your bot's body shape."], ["Colour:", "Picks this colour."], ["Eyes:", "Picks your bot's eyes."],
    ["Extra:", "Adds something on top of your bot's head."], ["Light or dark:", "Makes your page light or dark."],
    ["Banner:", "Picks the shape of the banner across the top of your page."], ["Pattern:", "Picks the pattern on your page and logo."],
    ["Frame:", "Picks the frame around your logo."], ["Middle:", "Picks what sits in the middle of your logo. 'my bot' follows your bot's look."],
    ["Motion:", "Picks how your logo moves: breathe, still or spin."], ["section:", "Adds or removes this part of your page."],
    ["knob:pace:", "Sets how quick the page's rhythm feels. The dotted one is live right now." + TUNING],
    ["knob:tint:", "Sets how strongly the season tints the background. The dotted one is live right now." + TUNING],
    ["knob:pitch:", "Sets how high or low the sounds are. The dotted one is live right now." + TUNING],
    ["look:", "Changes how I look. I work the same in every look."]
  ];
  function helpFor(el) {
    var t = el.getAttribute("data-help"); if (t) return t;
    var id = el.getAttribute("data-id") || el.id || ""; if (EXACT[id]) return EXACT[id];
    for (var i = 0; i < PREFIX.length; i++) if (id.indexOf(PREFIX[i][0]) === 0) return PREFIX[i][1];
    return null;
  }
  function targetAt(el) {
    while (el && el !== D.body) { if (el.nodeType === 1 && !orb.contains(el) && !bubble.contains(el) && helpFor(el)) return el; el = el.parentNode; }
    return null;
  }
  // ---------- the orb and its bubble ----------
  var orb = D.createElement("button"); orb.type = "button"; orb.className = "help-orb"; orb.setAttribute("data-id", "orb");
  orb.setAttribute("aria-label", "Help. Drag me onto anything, or tap me and then tap the thing.");
  var face = D.createElement("span"); face.className = "orb-face"; orb.appendChild(face);
  var bubble = D.createElement("div"); bubble.className = "help-bubble"; bubble.setAttribute("role", "status"); bubble.hidden = true;
  D.body.appendChild(orb); D.body.appendChild(bubble);
  function paint() { face.textContent = look(); }
  var grown = null, armed = false;
  function settle() { if (grown) grown.classList.remove("help-grow"); grown = null; }
  function closeBubble() { bubble.hidden = true; armed = false; orb.classList.remove("armed"); settle(); }
  function show(nodes) { bubble.replaceChildren.apply(bubble, nodes); bubble.hidden = false; }
  function p(text) { var e = D.createElement("p"); e.textContent = text; return e; }
  function drop(el) {                                                            // the one drop handler (every look, real or virtual drop)
    settle(); if (!el) { show([p("Drop me right on a button or a tile, and I'll explain it.")]); return; }
    grown = el; el.classList.add("help-grow");
    show([p(helpFor(el))]); N.log("help-drop", { on: el.getAttribute("data-id") || el.id || el.className });
  }
  function lookPicker() {
    var row = D.createElement("div"); row.className = "orb-looks";
    LOOKS.forEach(function (L) { var b = D.createElement("button"); b.type = "button"; b.className = "tile small"; b.setAttribute("data-id", "look:" + L[0]);
      b.textContent = L[1] + " " + L[0]; b.addEventListener("click", function (e) { e.stopPropagation(); setLook(L[1], L[0]); }); row.appendChild(b); });
    var inp = D.createElement("input"); inp.type = "text"; inp.id = "f-orb-look"; inp.setAttribute("data-help", "Type an emoji or a word, and I'll look like that.");
    inp.setAttribute("aria-label", "Your own look for the help orb: an emoji or a word"); inp.placeholder = "or your own emoji or word"; inp.autocomplete = "off";
    inp.addEventListener("change", function () { var v = inp.value.trim(); if (v) setLook(v, "own"); });
    row.appendChild(inp); return row;
  }
  function setLook(text, kind) { N.S.orbLook = { text: text, kind: kind }; N.save(); paint(); N.log("orb-look", { kind: kind }); show([p("That's my new look. I still work the same.")]); }
  function openHelp() {
    armed = true; orb.classList.add("armed");
    show([p("Tap anything and I'll explain it. Or drag me onto it."), p("Change my look:"), lookPicker()]);
  }
  // tap the orb = arm help (next tap explains); drag the orb = drop it where it lands
  var start = null, moved = false, ghost = null;
  orb.addEventListener("pointerdown", function (e) { start = { x: e.clientX, y: e.clientY }; moved = false; try { orb.setPointerCapture(e.pointerId); } catch (er) {} });
  orb.addEventListener("pointermove", function (e) {
    if (!start) return; var dx = e.clientX - start.x, dy = e.clientY - start.y, r = orb.offsetWidth * IP;   // a drag starts past PHI^-1 of the orb's own size
    if (!moved && Math.sqrt(dx * dx + dy * dy) > r) { moved = true; orb.classList.add("dragging"); }
    if (moved) orb.style.transform = "translate(" + dx + "px," + dy + "px)";
  });
  function endDrag(e) {
    if (!start) return; var wasDrag = moved; start = null; orb.classList.remove("dragging"); orb.style.transform = "";
    if (!wasDrag) { if (bubble.hidden || !armed) openHelp(); else closeBubble(); return; }
    orb.style.visibility = "hidden"; var under = D.elementFromPoint(e.clientX, e.clientY); orb.style.visibility = "";
    armed = false; orb.classList.remove("armed"); drop(targetAt(under));
  }
  orb.addEventListener("pointerup", endDrag);
  orb.addEventListener("pointercancel", function () { start = null; moved = false; orb.classList.remove("dragging"); orb.style.transform = ""; });
  orb.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (bubble.hidden || !armed) openHelp(); else closeBubble(); } });
  // armed: the next tap on a control is explained instead of pressed
  D.addEventListener("click", function (e) {
    if (orb.contains(e.target) || bubble.contains(e.target)) return;
    if (armed) { var t = targetAt(e.target); if (t) { e.preventDefault(); e.stopPropagation(); armed = false; orb.classList.remove("armed"); drop(t); return; } }
    if (!bubble.hidden) closeBubble();
  }, true);
  D.addEventListener("keydown", function (e) { if (e.key === "Escape" && !bubble.hidden) closeBubble(); });
  paint();
  W.HelpOrb = { paint: paint, drop: drop, helpFor: helpFor, settle: settle, close: closeBubble, look: look };   // drop(el) is the virtual drop for questionnaires
})(window, document);
