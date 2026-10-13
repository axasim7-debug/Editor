"""QC helper: one row of 8 evenly spaced frames per clip, 8 clips per image."""
import json, os, subprocess, sys
from PIL import Image, ImageDraw
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
res = {r["name"]: r for r in json.load(open(os.path.join(ROOT, "assets", "footage_resolved.json")))}
names = sys.argv[2:]
out = sys.argv[1]
W, H = 240, 135
rows = []
for n in names:
    r = res[n]; dur = r["duration"]
    row = Image.new("RGB", (W * 8, H))
    for i in range(8):
        t = dur * (i + 0.5) / 8
        tmp = f"/tmp/claude-0/-home-user-Editor/94355bb2-58d8-53ad-bce2-d66d282dd613/scratchpad/_s.jpg"
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", f"{t:.2f}", "-i", r["raw"], "-frames:v", "1", "-vf",
                        f"scale={W}:{H}", tmp])
        if os.path.exists(tmp):
            im = Image.open(tmp).convert("RGB"); os.remove(tmp)
            ImageDraw.Draw(im).text((3, 3), f"{t:.0f}s", fill=(255, 255, 0))
            row.paste(im, (i * W, 0))
    ImageDraw.Draw(row).text((3, H - 14), f"{n} ({dur:.0f}s)", fill=(0, 255, 255))
    rows.append(row)
g = Image.new("RGB", (W * 8, H * len(rows)))
for i, r in enumerate(rows):
    g.paste(r, (0, i * H))
g.save(out, quality=82)
print(out)
