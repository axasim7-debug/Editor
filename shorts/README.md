# Channel Shorts — motion-graphics Shorts built with Remotion

Vertical (1080×1920, 60 fps) explainer Shorts in the channel's documentary look: a virtual
camera travels across an infinite "work canvas" (blueprint grid) from idea to idea, and every
move is locked to the music.

## Shorts

| ID | Topic | Length | Funnels to |
|----|-------|--------|-----------|
| `DrakeShort` | How many alien civilizations share our galaxy? (Drake equation) | 42 s, seamless loop | *Are We Alone?* (Fermi Paradox documentary) |

## Pipeline

| Step | Command |
|------|---------|
| 1. Music excerpt (-14 LUFS) | `tools/prepare_music.sh <track.mp3> <start> <end> public/music/<name>.wav` |
| 2. Music analysis | `python3 tools/analyze_music.py public/music/<name>.wav 0 <len> 60 src/data/<name>.music.json` |
| 3. Lock stations to the phrase hits | edit `PULSE` in `src/drake/script.ts` (hand-checked against the analysis) |
| 4. Preview | `npx remotion studio` · stills: `node tools/stills.mjs out/stills 0 4.5 12` |
| 5. Render | `npx remotion render DrakeShort out/drake-short.mp4` |

Music for `DrakeShort`: download *Interloper* from incompetech.com into `public/music/interloper.mp3`, then
`tools/prepare_music.sh public/music/interloper.mp3 2.0 44.08 public/music/drake.wav`.

## How the music drives the camera

- **Phrase hits → camera moves.** Each pulse in `PULSE` launches a flight to the next node
  (`TRAVEL_S` = 1.45 s, slow lift-off / long soft landing, a slight zoom-out "drone dip" and tilt mid-flight).
- **Quiet passages → near stillness.** While holding, the camera only drifts in slowly with a breath of handheld float.
- **Accents → small lifts.** Onsets pulse glows and illustrations (`accentAt`), loudness drives the backdrop (`energyAt`).
- **Climax → reveal.** On the swell, the last factor counts N up live, the camera pulls back to the whole network, then lands on
  the galaxy on the strongest hit as 2,000 civilizations ignite.
- **Silence → the question.** The music drops out exactly as the camera dives back to "you are here" — the final frame
  matches frame 0, so the Short loops seamlessly.

## Code map

- `src/drake/script.ts` — timings, node positions, all on-screen copy and values
- `src/drake/camera.ts` — virtual camera (segments, curves, drift) and the node-to-node routes
- `src/drake/World.tsx` — the canvas: grid, network, nodes, equation card
- `src/drake/Illustrations.tsx`, `Galaxy.tsx` — the motion-graphic illustrations
- `src/drake/Hud.tsx` — running value of N, flying multiplier chips, result, hook and closing question
- `src/components/` — backdrop/parallax stars, grid, kinetic type, lens finish

## Credits

Music: "Interloper" — Kevin MacLeod (incompetech.com), licensed under CC BY 4.0. Must be credited in the description.
