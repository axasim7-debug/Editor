"""Parse script.md into a JSON list of chapters and beats."""
import json, re, sys

def parse(path):
    chapters, ch, vis, extra = [], None, None, {}
    for raw in open(path, encoding="utf-8"):
        line = raw.strip()
        if line.startswith("## "):
            cid, title, sub = [x.strip() for x in line[3:].split("|")]
            ch = {"id": cid, "title": title, "subtitle": sub, "beats": []}
            chapters.append(ch)
        elif line.startswith("> vis:"):
            vis = line[6:].strip()
        elif line.startswith(("> lower:", "> callout:", "> quote:")):
            key, val = line[2:].split(":", 1)
            title, _, sub = val.partition("|")
            extra[key] = {"title": title.strip(), "sub": sub.strip()}
        elif line.startswith("> pause:"):
            ch["beats"].append({"type": "pause", "seconds": float(line[8:]), "vis": vis})
        elif line and not line.startswith("#") and ch is not None:
            ch["beats"].append({"type": "speech", "text": line, "vis": vis, **extra})
            extra = {}
    return chapters

if __name__ == "__main__":
    json.dump(parse(sys.argv[1]), open(sys.argv[2], "w"), indent=1)
