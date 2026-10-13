# Are We Alone? — The Mystery of the Fermi Paradox

A ~47-minute documentary built entirely in code with [Remotion](https://www.remotion.dev/).
English narration, 13 chapters, animated graphics, licensed space footage and music.

## Pipeline

| Step | Command | Output |
|------|---------|--------|
| 1. Script | edit `script/script.md` | chapters, narration, visual tags, captions |
| 2. Narration | `python3 tools/parse_script.py script/script.md build/beats.json && python3 tools/narrate.py build/beats.json <kokoro-model-dir> public/narration` | one WAV per paragraph (Kokoro TTS, voice `am_michael`) |
| 3. Footage | `RAW_DIR=… python3 tools/fetch.py` then `python3 tools/normalize.py` | `public/footage/*.mp4` (1080p30, silent) + `src/data/clips.json` |
| 4. Stills | `python3 tools/fetch_images.py` | `public/images/*.jpg` + `src/data/images.json` |
| 5. Audio levels | `python3 tools/prepare_audio.py` | loudness-normalized narration (−16 LUFS) and music (−18 LUFS) |
| 6. Timeline | `python3 tools/attach_audio.py && python3 tools/build_timeline.py` | `src/data/timeline.json`, `out/subtitles.srt`, `out/chapters.txt` |
| 7. Render | `npx remotion render Seg-C04 out/C04.mp4` (one chapter) or `npx remotion render Film out/film.mp4` | MP4 |

`npx remotion studio` previews everything in the browser.

### Script format

```
## C01 | Where Is Everybody? | Los Alamos, 1950     ← chapter
> vis: fermi_portrait                                ← visual tag for the next paragraphs
> lower: Enrico Fermi | Physicist · Nobel Prize 1938 ← lower-third caption
> callout: 6,000+ | confirmed exoplanets              ← big-number callout
> quote: … | Attributed to Arthur C. Clarke          ← on-screen quote
> pause: 3                                            ← music-only breath (seconds)
Narration paragraph…
```

Visual tags map to footage/stills tagged in `assets/footage.json`, `assets/cuts.json` and
`assets/images.json`, or to animated graphics (`src/graphics/`): Drake Equation, Wow! signal
printout, Great Filter, galaxy colonization wave, probe network, Dyson swarm, grabby aliens,
SETI "ocean" analogy, dark forest, simulated universe, first complex cell, Chicxulub impact.

## Sources & licences

- Footage: ESO (CC BY 4.0), NASA Goddard Scientific Visualization Studio, NASA Image and Video
  Library, ESA/Webb (CC BY 4.0), Prelinger Archives (public domain), Wikimedia Commons (as credited).
- Music: Kevin MacLeod (incompetech.com), CC BY 4.0 — every track used is credited in the film.
- Narration: synthetic voice generated locally with Kokoro-82M (Apache 2.0).

Media files are not committed (see `.gitignore`); the tools above re-download and rebuild them.
