"""Analyze a music excerpt and write the timing data that drives a Short.

Outputs src/data/<name>.music.json with:
  pulses   – times (s, relative to the excerpt start) of the strongest hits, i.e. the
             musical phrase boundaries the camera travels between
  onsets   – every detected onset with its strength (0..1), for small accents
  energy   – loudness envelope sampled once per video frame (0..1)
  silences – spans where the music drops out

Usage: python3 tools/analyze_music.py <audio> <start_s> <end_s> <fps> <out.json>
"""
import json
import sys

import librosa
import numpy as np

src, start, end, fps, out = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), int(sys.argv[4]), sys.argv[5]
sr, hop = 22050, 256
y, _ = librosa.load(src, sr=sr, mono=True, offset=start, duration=end - start)

env = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop)
times = librosa.times_like(env, sr=sr, hop_length=hop)
on = librosa.onset.onset_detect(onset_envelope=env, sr=sr, hop_length=hop, units='frames')
peak = float(env.max())
onsets = [{'t': round(float(times[i]), 3), 's': round(float(env[i]) / peak, 3)} for i in on]

# Pulses: strongest onsets, at least 3 s apart.
pulses = []
for o in sorted(onsets, key=lambda o: -o['s']):
    if o['s'] > 0.35 and all(abs(o['t'] - p) > 3.0 for p in pulses):
        pulses.append(o['t'])
pulses.sort()

# Per-video-frame loudness, normalised to 0..1 over a 60 dB range.
spf = sr / fps
n = int((end - start) * fps)
rms = np.array([np.sqrt(np.mean(y[int(i * spf):int((i + 1) * spf)] ** 2) + 1e-12) for i in range(n)])
db = 20 * np.log10(rms / rms.max())
energy = np.clip((db + 60) / 60, 0, 1)

silences, cur = [], None
for i, e in enumerate(energy):
    if e < 0.25 and cur is None:
        cur = i
    elif e >= 0.25 and cur is not None:
        if i - cur > fps * 0.2:
            silences.append([round(cur / fps, 3), round(i / fps, 3)])
        cur = None

json.dump({'src': src.split('/')[-1], 'start': start, 'end': end, 'fps': fps, 'pulses': pulses,
           'silences': silences, 'onsets': onsets, 'energy': [round(float(e), 3) for e in energy]},
          open(out, 'w'))
print('pulses', pulses)
print('silences', silences)
