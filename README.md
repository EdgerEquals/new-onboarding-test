# New onboarding test page

A test copy of the Kids Club **new-kid onboarding**, so a tester (for example Cody, as a kid or as himself) can run it in a browser, make a bot and a page, and send back what they made plus a bug log. It belongs to no kid. It carries no names, no secrets and no analytics. Nothing about you is sent.

Built by Kids Club on Danny's ask (Kids Club chat, 12:52 AWST 26 Oct 2026). It follows the Kids Club shared layer (`/home/box/.config/kids-club/shared.md` on the box) and the adaptive-phi rulebook (rule 12).

## What it does (v0.1)

1. **What would you like to be called?** (call-me name, typed field 1 of 2) with a kind tip not to use a real name. It stays on this device, is never treated as a real name, and is never in the export.
2. **Bot name**: typed field 2 of 2.
3. **Bot avatar**: buttons and tiles only (shape, colour, eyes, extra). The note says a grown-up approves before a real bot uses it.
4. **Page pieces**: page colour (plus light or dark), banner shape, pattern.
5. **Logo grows with the page**: the logo in the top corner gains a layer for each piece done (avatar becomes the centre, then colour, frame and pattern). Progress is a ratio: pieces done over pieces before the logo step.
6. **Logo hand-over**: at the logo step auto-assembly stops for good. What's there becomes the starting point (kept as `logo.start`). Tiles change colour, frame, pattern, middle and motion, and "Back to my start" restores it.
7. **Sections**: pick what goes on the page. The logo doesn't change here, which shows that the hand-over held.
8. **The page**: the banner with the logo, a one-time tip ("tap your logo any time to change it"), the bot card (tap it to change the bot's look or name), section cards and the "build more on your dashboard" note.

Also built in:
- **Resume on refresh**: a reload offers "Continue" at the same step.
- **Back** on every screen after the first, and **Skip for now** on every step.
- **Sound only after the first tap**: the AudioContext is made inside the first tap. Short sine chimes play on picks and on logo taps.
- **Pitch** has no fixed root. Pump A is the kid's own tap rhythm (anchor B): base = (1/B) × φ^16. Pump B mixes the sky clocks (spring–neap, M2, year) and the weather and sets the floor and headroom one φ-step either side. Every note is a Fibonacci ratio of the base.
- **Loudness** has no master volume, and the device volume is never read or set. The **amplitude matrix is TODO**: every layer uses one placeholder share, φ^-3. Quiet hours come from the sun's height (the season pumps' rest share).
- **Anchor B** has no fixed seed. It comes from three pumps: the Moon (sky clocks: perigee and spring–neap), local temperature (its place in today's range from Open-Meteo), and the kid's tap rhythm, which takes over one φ rung per Fibonacci count of gaps.
- **Sizes** come from S (the screen's shorter side) × φ^-n, with the WCAG 2.2 24 px target floor, and the light view when S × φ^-4 < 44 px. **Timings** come from B × φ^-n (Rule φ table).
- **Season pumps**: `js/season-pumps.js` is a byte-identical copy of the Kids Club file. The background gets a warmth and calm tint, with the WCAG floor applied after.
- **Golden-ratio dials**: one dial shape, rungs φ^-k, moving one rung at a time, logged. The pace dial moves from the tester's own pace. A move past a floor or ceiling becomes a proposal and isn't applied.
- **Reduced motion**: follows `prefers-reduced-motion`, plus a "Motion" toggle in the tester bar.

## v0.2: rhythms keep going while you're away (26 Oct 2026)

Kids Club standard "Rhythms keep going while you're away" (Danny 13:48 / 13:51 AWST; "Push both everywhere" 14:11 AWST), copied from the dad-page model into this page's **own copy** (`js/rhythm-continuity.js`). Nothing links to or loads from dad-page. The "own radio" part is not built here yet.

- **Save and restore**: every rhythm registers with `js/rhythm-continuity.js`: `sky` (sky and season clocks), `dials`, `knobs` (hand nudges), `sound` (the on/off choice) and `logo:motion` (the logo's breathe/spin phase, written as a function of time). They save on the device under `notRhythm.v1` once per breath B and on every hide, pagehide and freeze, and restore at once after a reload.
- **Catch up on return**: on `visibilitychange`, `pageshow` and `resume` the time away fast-forwards every rhythm (analytically, no frame simulation), and the sky clocks, tint and weather cache are re-read.
- **Daily restart**: everything restarts together at local solar midnight (the sun's lowest point at the shared city point), not a clock time. Nudges clear; the sound choice carries.
- **Sound keeps going / responds fast** (Danny 14:20 AWST): the first touch anywhere makes the audio graph silently (`js/core.js`, the minimal start engine). The chime voices (`js/sound.js`) load at idle just after the first paint. The extras (`js/sound-extras.js`: the hidden `<audio playsinline>` bridge from a MediaStream and the Media Session) load only after sound has begun. On return the page resumes the sound; if the phone insists, a gentle "Tap anywhere to bring the sound back" shows instead of a reset.
- **Knobs open live**: tester bar → More → 🎛 Knobs. Pace (breath B), Sky tint (season dial) and Pitch (Pump B) each open on the rung the pumps have right now (the dotted tile), with a live line (sun, moon, season, weather, breath). They keep updating while open. A tap is a nudge on top of live; tapping the dotted tile goes back to live. The pace ladder (φ^1..φ^6 s) is a placeholder, like the dials (Danny TODO).
- **Logo loudness** (Danny 14:25 AWST): logo level = page level × φ^-1, live. **Dip** (14:28 AWST): there's no page music here yet, so nothing to dip; a future music layer dips its own gain × φ^-1 while the logo sounds, and the logo stays tied to the undipped level.
- **Start over** also clears `notRhythm.v1`.
- The export now includes `continuity`, `knobs`, `tapToSound` (touch to first note, plus the device's output latency) and `soundBridged`.

Rollback: tag `pre-continuity-2026-10-26` (v0.1, 7575750).

## v0.3: Steve's review fixes (Danny yes 14:24, 14:27 and 14:29 AWST, 26 Oct 2026)

- **Call-me name** first, with the kind tip; the banner says "Hi <call-me name>!". A v0.1 record's first answer is moved to the call-me name.
- **Big screens**: the size anchor S is capped at 24 px × φ^6, so the text unit tops out on the 24 px rung (tap target 24 × φ^2). Start stays above the tester bar on first load.
- **Selected tiles** keep their picture and get an outline and a ✓.
- **Pictures** on Eyes (face close-up), Extra (top of the head), Banner, Pattern, Frame, Motion and section tiles, with captions.
- **Copy**: after the hand-over nothing says the logo grows; all-skipped says "starter picks"; a skip shows a kind "starter pick, come back any time" note; welcome says "Nothing about you is sent"; one line says what the bot is and who it talks to.
- **Logo middle** follows the bot's current look live. **Back** on the final page. **Escape** closes an overlay and focus goes to its heading. Keyboard focus stays on the picked tile.
- **Shared device**: the Continue screen asks "Is this you?" with "No, I'm someone new" (clears the last person's run).
- **Progress dots**: step x of the real step count, dot sizes from φ rungs.
- **Tuning tags** on placeholder controls (knobs: pace, tint, pitch; Sound, which waits on the amplitude matrix).
- **Help orb** on from the first screen (`js/help-orb.js`): drag it onto anything, or tap it and then tap the thing; that thing grows and says what it does. The kid picks its look (orb, owl, car, moon, or their own emoji or word), saved on this device; every look works the same. Every visible control has help text; placeholders say they're still being tuned.
- **Stuck alert (test hook)**: the time on a step, counted only while the page is in view, against the kid's own usual time per step; one φ rung slower logs `stuck-alert-test` with the step and what came just before, quiet until the rhythm recovers, and two on one step flag a possible dead end. **Logged locally only: no ntfy, no real ping.**
- **Bugs**: long-term pace weight φ^-8; B is clamped to sky-B × φ^±k with k the pace dial's live rung (mirrored); the pause limit comes from sky-B; one small aria-live status line instead of the whole page.

Rollback: tag `pre-review-fixes-2026-10-26` (v0.2, 605ba97).

## v0.4: Deep's second read + a gently alive help orb (Danny yes 14:47 AWST, 26 Oct 2026)

- Placeholder tags now say **"still warming up"**. The skip note says **"Come back any time"**. The last step says **"last one!"**.
- Resume says **"Welcome back! You were here: …"** with the step in plain words.
- A friendly **"🔊 Tap to hear"** on the first screen, before any sound (sound still only after a tap).
- **One-time orb nudge** on the first screen: "Drag me onto anything to ask what it does", with one gentle pulse. Taps pass straight through it.
- **Knob labels**: each knob shows "Now: …", live or with your nudge.
- **Help orb always gently alive** (looked at Rebella's orb for its look: a soft sphere with a white rim and shadow): it breathes at B × φ^-2 and bobs at B × φ^-3 (a golden ratio apart) on the free-wheel ease, in every look. While dragged, it calms to φ^-2 speed with no jump, then glides back. With reduced motion it keeps only a soft breathing glow. Its phase carries through reloads like the logo's.

Rollback: tag `pre-tester-share-2026-10-26` (v0.3, 5b5d409).

### v0.4 also has Steve's v0.3 test fixes (Danny yes, 26 Oct 2026)

- **Help orb**: the look picker is its own small 🎨 button next to the orb. The help bubble moves to the top if it would cover the main button. Changing the look ends help mode, so the next tap on Start starts. Every screen has room under its last control, and the orb lifts by whole orb-heights when its spot would cover a control.
- **Top row**: on narrow screens it shows only the dots (the count stays for screen readers), and Back never wraps.
- **Is this you?**: the question is the heading, the saved logo and bot sit under it, and "No, I'm someone new" needs a second tap ("Tap again: this clears the last page").
- **Name step**: five fun name tiles to tap. Typing is optional.
- **Quick for everyone**: tap feedback and transitions follow sky-B, not the kid-moved B. A double tap on a toggle only flips it once.
- **Logo step**: "Keep it" is at the top too, and Motion and Middle are tucked under "More".
- **Parent line**: "Your bot is a helper. It only chats with you, and your grown-up can see what it says." (wording waiting on Danny's OK)

## How to test

Open the live page (GitHub Pages) in any browser, on a phone or a desktop, and go through it as a kid or as yourself.

The tester bar at the bottom has:
- **Build stamp**: the version you're on.
- **Copy feedback**: copies a JSON summary to the clipboard. It holds what you made (bot name, avatar, page picks, the logo's start and current state, when the hand-over happened), the anchors, pitch and dials, and a timestamped event log (UTC ISO times plus your UTC offset). If the browser blocks the clipboard, a box opens with the text to copy by hand. Paste it back into the chat.
- **Start over**: tap it twice. It clears everything this page stored, so you can run it again.
- **More ▾** opens three more tiles:
  - **🐞 Bug here** marks the current screen in the event log.
  - **Motion** switches between full and less motion.
  - **Sound** turns the chimes on or off.

What the export leaves out: the call-me name, any typed text, and the bot name if it contains any word of the call-me name (case-insensitive).

## Reset

Use **Start over** (tap twice). Or clear site data, or run `localStorage.removeItem('not.v1'); localStorage.removeItem('not.wx'); localStorage.removeItem('notRhythm.v1')` in the console.

## Privacy and network

- Everything is stored on the device in `localStorage` (`not.v1`, the rhythm snapshot `notRhythm.v1`, plus the weather cache `not.wx`).
- **One** network request is made: an idle-time GET to `api.open-meteo.com` carrying only the shared layer's coarse city point (Perth, -32.0 / 115.9). It sends no credentials and no referrer, and carries nothing about the tester. If it fails, the sky clocks carry anchor B alone.
- No analytics, no fonts or CDNs, no other requests. `robots.txt` and `noindex` keep it out of search.

## Vault

There's **no vault yet**. The page needs no secrets. If it ever does (for example a gated tester config or a private relay), it would follow simmie-chat's pattern: an encrypted `config.enc.json` (PBKDF2-SHA-256 key from a password, AES-GCM, random salt and IV), built and pushed by a local build script, with the password kept off the repo. See `vault/README.md`. Never commit real secrets here.

## Files

- `index.html`
- `css/style.css`: every size and timing is a CSS variable set from the anchors.
- `js/rhythm-continuity.js`: this page's own copy of the continuity module (loaded in `<head>`).
- `js/season-pumps.js`: a copy of the Kids Club Season pumps file.
- `js/sound.js`: the chime voices (idle after first paint). `js/sound-extras.js`: media bridge and Media Session (after sound begins).
- `js/core.js`: the record, event log, anchor B, scale, dials, weather and sound.
- `js/art.js`: the avatar and logo SVG.
- `js/app.js`: the flow, editor, tester bar and export.
- `tools/phi_selfcheck.py`: the rule 12 fixed-literal check. Run it with `python3 tools/phi_selfcheck.py js/*.js`.

Static. No build step.

## Rule 12 self-check (v0.1)

`tools/phi_selfcheck.py js/*.js` gives **PASS**. Every literal is φ, a φ-power, a Fibonacci count (`fib:`), cited data (`cite:`), a unit (`unit:`), a measured anchor (`anchor:`) or a label (`label:`).

**ALERT**, for Danny: these whole-number φ-step exponents and placeholders were my own choices (tagged `step:`):
- `N_B = 17`: B = M2 tide period × φ^-17 (about 12.5 s before the other pumps).
- `N_KID = 4`: the kid's tap gap × φ^4 maps onto B.
- `N_PITCH = 16`: base pitch = (1/B) × φ^16.
- Text unit S × φ^-6, and tap target S × φ^-4 (the Rule φ table).
- Dial rungs are placeholders. Danny sets the floors and ceilings: filter and pace start at 2, floor 5, ceiling 1; season starts at 3, floor 5, ceiling 2.
- Amplitude matrix: placeholder share φ^-3 (TODO).
- Quiet hours: 2 φ-steps down at full rest (the logo standard's worked example).
- The tap gap counts as rhythm only while it's under B × φ^4.
- CSS uses decimal φ values (1.618, .618 and so on), 0, 1, 50%, 100%, 360deg and z-index order.

## Known gaps / TODO

- The amplitude matrix isn't defined yet (Danny).
- The full logo sound engine isn't in yet: no Tone.js, MIDI ladder, pump tree 13/8/5/3/2 or blend wave. v0.1 uses light WebAudio chimes.
- Dial 1 (the information filter) is recorded but doesn't drive anything yet, and nothing leaves the device anyway.
- The city point is fixed to Perth (shared layer location standard). Whether it should come from where the user is is still open with Danny.
- "Build more" on the dashboard and the section contents are placeholders.
- There's no help orb, questionnaire, roll pairs or Dad ping on this test page.

## Tester live share (page side, Danny yes 15:11 AWST, 26 Oct 2026)

`js/live-share.js` has a tester-only "📡 Share with Danny" toggle under More in the tester bar.
- It is off by default, and switches off at the daily restart and on Start over. While it's on, the tester bar says the build is shared live with Danny.
- It sends at most once per breath B, and only when something changed.
- It sends picks, looks and counts only. It never sends names, typed text, location, audio or device IDs.
- The payload shape is in `not-smoke/live-share-payload.md`.
- **Hidden flag:** `LIVE_SHARE_URL` is empty, so the toggle doesn't show and nothing is sent. Set it once Danny's server route is live.

Rollback: tag `pre-live-share-2026-10-26`.
