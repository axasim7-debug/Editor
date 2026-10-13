"""Cut and normalize raw footage into public/footage/*.mp4 (1920x1080, 30 fps, silent H.264).

Reads assets/footage_resolved.json and assets/cuts.json ({name: [[start, end], ...]}).
Clips without explicit cuts use the whole file (trimmed 0.5 s at both ends, max 120 s).
Writes src/data/clips.json, the catalog the timeline builder picks shots from.
Usage: normalize.py [--sheets] [names...]   (--sheets only writes contact sheets for QC)
"""
import json, os, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "footage")
SHEETS = os.path.join(ROOT, "build", "sheets")


def probe(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                          "stream=width,height:format=duration", "-of", "json", path], capture_output=True, text=True).stdout
    d = json.loads(out)
    s = d["streams"][0]
    return s["width"], s["height"], float(d["format"]["duration"])


def sheet(name, path, dur):
    # Seek to 30 evenly spaced timestamps (fast even for hour-long 4K files) and tile them.
    from PIL import Image, ImageDraw
    os.makedirs(SHEETS, exist_ok=True)
    tiles = []
    for i in range(30):
        t = dur * (i + 0.5) / 30
        tmp = os.path.join(SHEETS, f"_{name}_{i}.jpg")
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", f"{t:.2f}", "-i", path, "-frames:v", "1",
                        "-vf", "scale=320:180:force_original_aspect_ratio=decrease,pad=320:180:(ow-iw)/2:(oh-ih)/2", tmp])
        im = Image.open(tmp).convert("RGB") if os.path.exists(tmp) else Image.new("RGB", (320, 180))
        ImageDraw.Draw(im).text((4, 4), f"{t:.0f}s", fill=(255, 255, 0))
        tiles.append(im)
        if os.path.exists(tmp):
            os.remove(tmp)
    grid = Image.new("RGB", (320 * 6, 180 * 5))
    for i, im in enumerate(tiles):
        grid.paste(im, ((i % 6) * 320, (i // 6) * 180))
    dest = os.path.join(SHEETS, name + ".jpg")
    grid.save(dest, quality=80)
    return dest


def cut(src, dest, start, end, w, h, crop=None):
    # Wide sources fill the frame; narrow (archival 4:3) sources are pillarboxed.
    if crop == "4:3":
        # 4:3 picture pillarboxed inside a 16:9 file: take the centre and fill the frame
        vf = "crop=ih*4/3:ih,scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080"
    elif w / h >= 1.6:
        vf = "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080"
    else:
        vf = "scale=-2:1080,pad=1920:1080:(ow-iw)/2:0:black"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", f"{start:.2f}", "-to", f"{end:.2f}", "-i", src, "-an",
                    "-vf", vf + ",fps=30,format=yuv420p", "-c:v", "libx264", "-preset", "veryfast", "-crf", "21",
                    "-g", "15", "-movflags", "+faststart", dest], check=True)


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    sheets_only = "--sheets" in sys.argv
    resolved = json.load(open(os.path.join(ROOT, "assets", "footage_resolved.json")))
    cuts_path = os.path.join(ROOT, "assets", "cuts.json")
    cuts = json.load(open(cuts_path)) if os.path.exists(cuts_path) else {}
    cat_path = os.path.join(ROOT, "src", "data", "clips.json")
    catalog = {c["id"]: c for c in json.load(open(cat_path))} if os.path.exists(cat_path) else {}
    os.makedirs(OUT, exist_ok=True)
    for r in resolved:
        name = r["name"]
        if args and name not in args:
            continue
        if not os.path.exists(r["raw"]):
            continue
        try:
            w, h, dur = probe(r["raw"])
        except Exception as ex:
            print("FAIL probe", name, ex)
            continue
        if sheets_only:
            print(sheet(name, r["raw"], dur))
            continue
        spans = cuts.get(name) or [[0.5, min(dur - 0.5, 120)]]
        if spans == "skip":
            continue
        for k, span in enumerate(spans):
            a, b = span[0], span[1]
            opts = span[2] if len(span) > 2 else {}
            cid = f"{name}_{k}"
            dest = os.path.join(OUT, cid + ".mp4")
            if not os.path.exists(dest):
                cut(r["raw"], dest, a, min(b, dur), w, h, opts.get("crop"))
            _, _, d = probe(dest)
            catalog[cid] = {"id": cid, "file": f"footage/{cid}.mp4", "tags": opts.get("tags", r["tags"]), "duration": round(d, 2),
                            "credit": r["credit"], "archival": name.startswith("arc_")}
            print(f"ok {cid:28s} {d:6.1f}s", flush=True)
    os.makedirs(os.path.dirname(cat_path), exist_ok=True)
    json.dump(sorted(catalog.values(), key=lambda c: c["id"]), open(cat_path, "w"), indent=1)


if __name__ == "__main__":
    main()
