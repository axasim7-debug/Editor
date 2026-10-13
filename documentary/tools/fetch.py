"""Download raw footage listed in assets/footage.json into RAW_DIR (skips existing).

Each entry names one source: "eso" (ESO video id), "url" (direct file),
"nasa" (NASA Image and Video Library id) or "archive" (archive.org identifier).
Writes assets/footage_resolved.json with the resolved URL, local path and duration.
"""
import json, os, re, subprocess, sys, urllib.parse, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.environ.get("RAW_DIR", os.path.join(ROOT, "raw"))
UA = {"User-Agent": "FermiDoc/1.0 (educational documentary)"}


def get_json(url):
    return json.load(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60))


def resolve(e):
    if "eso" in e:
        page = urllib.request.urlopen(urllib.request.Request(f"https://www.eso.org/public/videos/{e['eso']}/", headers=UA), timeout=60).read().decode()
        for fmt in ("hd_1080p25_screen", "hd_and_apple", "ultra_hd", "medium_podcast"):
            m = re.search(rf'https://cdn\.eso\.org/videos/{fmt}/[^"]+\.(?:mp4|m4v)', page)
            if m:
                return m.group(0), "ESO"
        raise ValueError("no ESO download")
    if "url" in e:
        return e["url"], e.get("credit", "")
    if "nasa" in e:
        files = [i["href"] for i in get_json("https://images-api.nasa.gov/asset/" + urllib.parse.quote(e["nasa"]))["collection"]["items"]]
        mp4 = [f for f in files if f.endswith(".mp4")]
        for pref in ("~large.mp4", "~medium.mp4", "~orig.mp4"):
            for f in mp4:
                if f.endswith(pref):
                    return f.replace(" ", "%20"), "NASA"
        return mp4[0].replace(" ", "%20"), "NASA"
    if "archive" in e:
        md = get_json("https://archive.org/metadata/" + e["archive"])
        vids = [f for f in md["files"] if f["name"].lower().endswith((".mp4", ".mpeg", ".mpg", ".ogv"))]
        # prefer the original/highest quality h.264 derivative
        vids.sort(key=lambda f: (f["name"].lower().endswith(".mp4"), int(f.get("size", 0))), reverse=True)
        f = vids[0]["name"]
        return f"https://archive.org/download/{e['archive']}/{urllib.parse.quote(f)}", "Prelinger Archives / Internet Archive"
    raise ValueError(e)


def duration(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
                         capture_output=True, text=True).stdout.strip()
    return float(out or 0)


def main():
    os.makedirs(RAW, exist_ok=True)
    entries = json.load(open(os.path.join(ROOT, "assets", "footage.json")))
    only = set(sys.argv[1:])
    resolved_path = os.path.join(ROOT, "assets", "footage_resolved.json")
    resolved = {r["name"]: r for r in json.load(open(resolved_path))} if os.path.exists(resolved_path) else {}
    for e in entries:
        if only and e["name"] not in only:
            continue
        try:
            url, credit = resolve(e)
            ext = os.path.splitext(urllib.parse.urlparse(url).path)[1] or ".mp4"
            dest = os.path.join(RAW, e["name"] + ext)
            if not os.path.exists(dest) or os.path.getsize(dest) < 10000:
                subprocess.run(["curl", "-sSL", "--retry", "3", "-A", UA["User-Agent"], "-o", dest + ".part", url], check=True)
                os.rename(dest + ".part", dest)
            resolved[e["name"]] = {**e, "src": url, "credit": credit, "raw": dest, "duration": duration(dest)}
            print(f"ok   {e['name']:24s} {resolved[e['name']]['duration']:7.1f}s  {os.path.getsize(dest)/1e6:7.1f}MB", flush=True)
        except Exception as ex:
            print(f"FAIL {e['name']:24s} {ex}", flush=True)
        json.dump(list(resolved.values()), open(resolved_path, "w"), indent=1)


if __name__ == "__main__":
    main()
