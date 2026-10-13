"""List video/image files of an SVS page: id -> url width height."""
import json, sys, urllib.request
def media(i):
    d = json.load(urllib.request.urlopen(f"https://svs.gsfc.nasa.gov/api/{i}", timeout=40))
    out = []
    def walk(x):
        if isinstance(x, dict):
            if "url" in x and str(x.get("url", "")).lower().endswith((".mp4", ".mov", ".jpg", ".png", ".tif", ".webm")):
                out.append((x["url"], x.get("width"), x.get("height"), x.get("filename", "")))
            for v in x.values(): walk(v)
        elif isinstance(x, list):
            for v in x: walk(v)
    walk(d.get("media_groups", d))
    return d.get("title"), out
if __name__ == "__main__":
    for i in sys.argv[1:]:
        t, m = media(i); print("==", i, t)
        for u, w, h, f in m:
            if u.endswith((".mp4", ".mov", ".webm")): print("  ", w, h, u)
