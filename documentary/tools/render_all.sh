#!/bin/bash
# Render every chapter separately (resumable), then join them losslessly.
set -e
cd "$(dirname "$0")/.."
mkdir -p out/parts
SEGS=$(python3 -c "import json;print(' '.join(s['id'] for s in json.load(open('src/data/timeline.json'))['segments']))")
: > out/parts/list.txt
for id in $SEGS; do
  if [ ! -s "out/parts/$id.mp4" ]; then
    npx remotion render "Seg-$id" "out/parts/$id.tmp.mp4" --concurrency=4 --log=error
    mv "out/parts/$id.tmp.mp4" "out/parts/$id.mp4"
  fi
  echo "file '$id.mp4'" >> out/parts/list.txt
  echo "done $id"
done
ffmpeg -y -v error -f concat -safe 0 -i out/parts/list.txt -c copy -movflags +faststart "out/Are_We_Alone_Fermi_Paradox_1080p.mp4"
echo "FILM READY"
