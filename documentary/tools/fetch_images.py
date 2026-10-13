"""Download stills listed in assets/images.json into public/images (max 3200 px wide, JPEG).

Entries name a NASA Image Library id ("nasa") or a direct URL ("url", e.g. Wikimedia Commons).
Writes src/data/images.json with the local path, tags, credit and orientation.
"""
import io, json, os, sys, time, urllib.parse, urllib.request
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "images")
UA = {"User-Agent": "FermiDoc/1.0 (educational documentary)"}
Image.MAX_IMAGE_PIXELS = None


def fetch(url):
    if "wikimedia" in url:
        time.sleep(4)
    for attempt in range(4):
        try:
            return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=120).read()
        except Exception:
            time.sleep(10 * (attempt + 1))
    raise RuntimeError("download failed: " + url)


def nasa_url(nid):
    items = json.loads(fetch("https://images-api.nasa.gov/asset/" + urllib.parse.quote(nid)))["collection"]["items"]
    hrefs = [i["href"] for i in items if i["href"].lower().endswith((".jpg", ".jpeg", ".png", ".tif"))]
    for pref in ("~orig.jpg", "~large.jpg", "~orig.png", "~medium.jpg"):
        for h in hrefs:
            if h.endswith(pref):
                return h.replace(" ", "%20")
    return hrefs[0].replace(" ", "%20")


def main():
    os.makedirs(OUT, exist_ok=True)
    entries = json.load(open(os.path.join(ROOT, "assets", "images.json")))
    cat_path = os.path.join(ROOT, "src", "data", "images.json")
    catalog = {c["name"]: c for c in json.load(open(cat_path))} if os.path.exists(cat_path) else {}
    for e in entries:
        dest = os.path.join(OUT, e["name"] + ".jpg")
        try:
            if not os.path.exists(dest):
                url = nasa_url(e["nasa"]) if "nasa" in e else e["url"]
                im = Image.open(io.BytesIO(fetch(url)))
                if im.mode in ("RGBA", "LA", "P"):
                    bg = Image.new("RGB", im.size, (0, 0, 0))
                    im = im.convert("RGBA")
                    bg.paste(im, mask=im.split()[-1])
                    im = bg
                im = im.convert("RGB")
                if im.width > 3200:
                    im = im.resize((3200, round(im.height * 3200 / im.width)), Image.LANCZOS)
                im.save(dest, quality=90)
            w, h = Image.open(dest).size
            credit = e.get("credit") or ("NASA" if "nasa" in e else "")
            catalog[e["name"]] = {"name": e["name"], "file": f"images/{e['name']}.jpg", "tags": e["tags"], "credit": credit,
                                  "w": w, "h": h, "archival": e.get("archival", False)}
            print(f"ok   {e['name']:22s} {w}x{h}", flush=True)
        except Exception as ex:
            print(f"FAIL {e['name']:22s} {ex}", flush=True)
    json.dump(sorted(catalog.values(), key=lambda c: c["name"]), open(cat_path, "w"), indent=1)


if __name__ == "__main__":
    main()
