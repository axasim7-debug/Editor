"""Slow, rate-limit-friendly Wikimedia Commons search (one query every 15 s)."""
import json, sys, time, urllib.parse, urllib.request
H = {"User-Agent": "FermiDoc/1.0 (educational documentary; contact via repo)"}
for q in sys.argv[1:]:
    p = {"action": "query", "generator": "search", "gsrsearch": q, "gsrnamespace": 6, "gsrlimit": 8,
         "prop": "imageinfo", "iiprop": "url|size|mime|extmetadata", "iiextmetadatafilter": "LicenseShortName|Artist", "format": "json"}
    for attempt in range(4):
        try:
            d = json.load(urllib.request.urlopen(urllib.request.Request("https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(p), headers=H), timeout=40))
            break
        except Exception as e:
            time.sleep(30)
    else:
        print("== FAIL", q); continue
    print("==", q, flush=True)
    for pg in sorted(d.get("query", {}).get("pages", {}).values(), key=lambda x: x.get("index", 0)):
        ii = pg["imageinfo"][0]; md = ii.get("extmetadata", {})
        print("  ", ii["width"], "x", ii["height"], ii["mime"].split("/")[-1], "|", md.get("LicenseShortName", {}).get("value", ""), "|", ii["url"], flush=True)
    time.sleep(15)
