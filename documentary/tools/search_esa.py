"""Search ESO / ESA-Webb / ESA-Hubble video archives (CC BY 4.0). Prints site, id, title."""
import re, sys, html, urllib.parse, urllib.request
SITES = {"eso": "https://www.eso.org/public/videos/list/1/?search=",
         "webb": "https://esawebb.org/videos/list/1/?search=",
         "hubble": "https://esahubble.org/videos/list/1/?search="}
def search(q, n=10):
    out = []
    for name, base in SITES.items():
        try:
            page = urllib.request.urlopen(base + urllib.parse.quote_plus(q), timeout=30).read().decode()
        except Exception as e:
            continue
        for title, url in re.findall(r'data-title="([^"]+)" data-url="([^"]+)"', page)[:n]:
            out.append((name, url.rstrip("/").split("/")[-1], html.unescape(title)))
    return out
if __name__ == "__main__":
    for q in sys.argv[1:]:
        print("==", q)
        for r in search(q): print("  ", *r)
