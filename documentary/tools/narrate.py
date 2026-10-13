"""Generate narration WAVs for every speech beat with Kokoro TTS (local, offline)."""
import json, os, sys
import soundfile as sf
from kokoro_onnx import Kokoro

beats_json, model_dir, out_dir = sys.argv[1:4]
voice, speed = os.environ.get("VOICE", "am_michael"), float(os.environ.get("SPEED", "0.9"))
k = Kokoro(os.path.join(model_dir, "kokoro-v1.0.onnx"), os.path.join(model_dir, "voices-v1.0.bin"))
chapters = json.load(open(beats_json))
os.makedirs(out_dir, exist_ok=True)
for ch in chapters:
    for i, b in enumerate(ch["beats"]):
        if b["type"] != "speech":
            continue
        out = os.path.join(out_dir, f"{ch['id']}_{i:02d}.wav")
        if not os.path.exists(out):
            samples, sr = k.create(b["text"], voice=voice, speed=speed, lang="en-us")
            sf.write(out, samples, sr)
        b["audio"] = os.path.basename(out)
        b["seconds"] = sf.info(out).duration
        print(out, round(b["seconds"], 1), flush=True)
json.dump(chapters, open(beats_json, "w"), indent=1)
