#!/usr/bin/env bash
# Cut the excerpt a Short uses and loudness-normalise it for mobile playback (-14 LUFS).
# Usage: tools/prepare_music.sh <source.mp3> <start_s> <end_s> <out.wav>
set -euo pipefail
src=$1; start=$2; end=$3; out=$4
ffmpeg -hide_banner -loglevel error -y -ss "$start" -to "$end" -i "$src" \
  -af "afade=t=in:d=0.05,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000" -ac 2 "$out"
