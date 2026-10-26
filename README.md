# New onboarding test page

A test copy of the Kids Club **new-kid onboarding**, so a tester (for example Cody, as a kid or as himself) can run it in a browser, make a bot and a page, and send back what they made plus a bug log. It belongs to no kid. It carries no names, no secrets and no analytics.

Built by Kids Club on Danny's ask (Kids Club chat, 12:52 AWST 26 Oct 2026). It follows the Kids Club shared layer (`/home/box/.config/kids-club/shared.md` on the box) and the adaptive-phi rulebook (rule 12).

## What it does (v0.1)

1. **Name**: the tester types their name (typed field 1 of 2). It stays on this device and is never in the export.
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

What the export leaves out: the name typed on the first screen, any typed text, and the bot name if it contains that first name.

## Reset

Use **Start over** (tap twice). Or clear site data, or run `localStorage.removeItem('not.v1'); localStorage.removeItem('not.wx')` in the console.

## Privacy and network

- Everything is stored on the device in `localStorage` (`not.v1`, plus the weather cache `not.wx`).
- **One** network request is made: an idle-time GET to `api.open-meteo.com` carrying only the shared layer's coarse city point (Perth, -32.0 / 115.9). It sends no credentials and no referrer, and carries nothing about the tester. If it fails, the sky clocks carry anchor B alone.
- No analytics, no fonts or CDNs, no other requests. `robots.txt` and `noindex` keep it out of search.

## Vault

There's **no vault yet**. The page needs no secrets. If it ever does (for example a gated tester config or a private relay), it would follow simmie-chat's pattern: an encrypted `config.enc.json` (PBKDF2-SHA-256 key from a password, AES-GCM, random salt and IV), built and pushed by a local build script, with the password kept off the repo. See `vault/README.md`. Never commit real secrets here.

## Files

- `index.html`
- `css/style.css`: every size and timing is a CSS variable set from the anchors.
- `js/season-pumps.js`: a copy of the Kids Club Season pumps file.
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
