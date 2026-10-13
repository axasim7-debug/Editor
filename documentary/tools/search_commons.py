"""Search Wikimedia Commons files; prints title, size, license."""
import json, sys, urllib.parse, urllib.request
H = {"User-Agent": "FermiDoc/1.0 (educational documentary)"}
for q in sys.argv[1:]:
    p = {"action": "query", "generator": "search", "gsrsearch": q, "gsrnamespace": 6, "gsrlimit": 10,
         "prop": "imageinfo", "iiprop": "url|size|extmetadata", "format": "json"}
    req = urllib.request.Request("https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(p), headers=H)
    d = json.load(urllib.request.urlopen(req, timeout=30))
    print("==", q)
    for pg in sorted(d.get("query", {}).get("pages", {}).values(), key=lambda x: x.get("index", 0)):
        ii = pg["imageinfo"][0]; md = ii.get("extmetadata", {})
        print("  ", pg["title"][5:80], ii["width"], "x", ii["height"], "|", md.get("LicenseShortName", {}).get("value", ""))
