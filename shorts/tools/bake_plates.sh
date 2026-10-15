#!/usr/bin/env bash
# Pre-render the static galaxy into transparent image plates (run after changing Galaxy.tsx).
set -euo pipefail
mkdir -p public/plates
npx remotion still GalaxyPlate public/plates/galaxy.png --image-format=png
npx remotion still GalaxyPlateSoft public/plates/galaxy-soft.png --image-format=png
