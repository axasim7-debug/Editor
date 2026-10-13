"""Loudness-normalize narration (-16 LUFS) and music (-18 LUFS) for consistent levels."""
import glob, os, subprocess
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def norm(src, dest, lufs):
    if os.path.exists(dest):
        return
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", src, "-af", f"loudnorm=I={lufs}:TP=-1.5:LRA=11", "-ar", "48000", "-vn", dest], check=True)


jobs = []
os.makedirs(os.path.join(ROOT, "public", "narration_n"), exist_ok=True)
os.makedirs(os.path.join(ROOT, "public", "music_n"), exist_ok=True)
for f in glob.glob(os.path.join(ROOT, "public", "narration", "*.wav")):
    jobs.append((f, os.path.join(ROOT, "public", "narration_n", os.path.basename(f)), -16))
for f in glob.glob(os.path.join(ROOT, "public", "music", "*.mp3")):
    jobs.append((f, os.path.join(ROOT, "public", "music_n", os.path.basename(f)[:-4] + ".m4a"), -18))
with ThreadPoolExecutor(2) as ex:
    list(ex.map(lambda j: norm(*j), jobs))
print(len(jobs), "files normalized")
