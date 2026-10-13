"""Parse the script and attach narration file names and durations to every spoken beat."""
import json, os, sys
import soundfile as sf
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from parse_script import parse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
chapters = parse(os.path.join(ROOT, "script", "script.md"))
for ch in chapters:
    for i, b in enumerate(ch["beats"]):
        if b["type"] == "speech":
            b["audio"] = f"{ch['id']}_{i:02d}.wav"
            b["seconds"] = sf.info(os.path.join(ROOT, "public", "narration_n", b["audio"])).duration
json.dump(chapters, open(os.path.join(ROOT, "build", "beats.json"), "w"), indent=1)
print(sum(len(c["beats"]) for c in chapters), "beats")
