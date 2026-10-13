"""Search NASA Image and Video Library for videos. Prints nasa_id, duration-less title."""
import json, sys, urllib.parse, urllib.request
for q in sys.argv[1:]:
    u = "https://images-api.nasa.gov/search?media_type=video&q=" + urllib.parse.quote(q)
    d = json.load(urllib.request.urlopen(u, timeout=30))
    print("==", q, d["collection"]["metadata"]["total_hits"])
    for it in d["collection"]["items"][:12]:
        m = it["data"][0]
        print("  ", m["nasa_id"], "|", m["title"][:90], "|", m.get("date_created", "")[:4])
