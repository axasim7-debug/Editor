# Are We Alone? — The Mystery of the Fermi Paradox (film files)

Full documentary (45:42, 1080p, English narration), split into one MP4 per chapter.
Play them in order 00 → 13. To download: open a file, then press the download button (↓).

- `subtitles.srt` — English subtitles for the full film
- `chapters.txt` — YouTube chapter timestamps (paste into the video description)

To join the parts into one file (optional, needs ffmpeg):
`ls 0*.mp4 1*.mp4 | sed "s/.*/file '&'/" > list.txt && ffmpeg -f concat -safe 0 -i list.txt -c copy film.mp4`

Source project: branch `ccr-42b424cf-oxnz77`, folder `documentary/`.
