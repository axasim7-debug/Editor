"""Search archive.org movies (prefer public-domain collections like Prelinger)."""
import json, sys, urllib.parse, urllib.request
for q in sys.argv[1:]:
    p = {"q": f"({q}) AND mediatype:movies", "fl[]": ["identifier", "title", "year", "licenseurl", "collection"], "rows": 12, "output": "json", "sort[]": "downloads desc"}
    u = "https://archive.org/advancedsearch.php?" + urllib.parse.urlencode(p, doseq=True)
    d = json.load(urllib.request.urlopen(u, timeout=40))
    print("==", q, d["response"]["numFound"])
    for x in d["response"]["docs"]:
        print("  ", x["identifier"], "|", str(x.get("title"))[:70], "|", x.get("year"), "|", ",".join(x.get("collection", []))[:40], "|", x.get("licenseurl", "")[-30:])
