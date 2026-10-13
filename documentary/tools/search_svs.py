"""Search NASA Scientific Visualization Studio; prints id, type, title."""
import json, sys, urllib.parse, urllib.request
for q in sys.argv[1:]:
    d = json.load(urllib.request.urlopen("https://svs.gsfc.nasa.gov/api/search/?limit=12&search=" + urllib.parse.quote(q), timeout=40))
    print("==", q, d["count"])
    for r in d["results"]:
        print("  ", r["id"], "|", r["result_type"][:18], "|", r["title"][:90], "|", r["release_date"][:4])
