"""Assemble src/data/timeline.json: shots, narration, music, captions and credits.

Inputs: build/beats.json (parsed script + narration durations), src/data/clips.json,
src/data/images.json, public/narration_n, public/music_n.
Also writes out/subtitles.srt and out/chapters.txt (YouTube chapter markers).
"""
import json, os, random, re, subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FPS = 30
GAP = 0.55          # silence after each narrated paragraph (s)
LEAD_FIRST = 2.0    # cold open: picture fades up before the first line
LEAD_CHAPTER = 6.5  # chapter card plays before narration starts
TAIL = 2.0          # music breath at the end of each chapter
FADE = 15           # crossfade between shots (frames)
CREDITS_SECONDS = 85

GRAPHIC_TAGS = {
    "drake_equation": ("DrakeEquation", {}),
    "wow_signal": ("WowSignal", {}),
    "filter_graphic": ("GreatFilter", {}),
    "galaxy_spread": ("GalaxySpread", {"mode": "colonize"}),
    "probe_art": ("GalaxySpread", {"mode": "probes"}),
    "dyson_sphere_art": ("DysonSwarm", {}),
    "grabby_graphic": ("GrabbyAliens", {}),
    "ocean_analogy": ("OceanAnalogy", {}),
    "dark_forest": ("DarkForest", {}),
    "digital_universe": ("DigitalUniverse", {}),
    "dinosaur_asteroid": ("AsteroidImpact", {}),
    "title_card": ("TitleBackdrop", {}),
    "microscopic_life": ("CellMerger", {}),
}
# tags whose pool may be thin borrow from a related pool
FALLBACK = {
    "moon_earth": "earth_from_space",
    "archive_lunch": "archive_1950s",
    "archive_1970s": "radio_telescope_night",
    "rubin_observatory": "elt_observatory",
    "microscopic_life": "ocean_life",
    "jupiter_juno": "europa_clipper",
}
SHOT_SECONDS = {"default": 6.5, "image": 7.5, "slow": 8.5}
SLOW_TAGS = {"stars_drift", "milkyway_timelapse", "earth_from_space", "radio_telescope_night", "deep_field"}

MUSIC = {
    "C00": ["Lightless_Dawn"],
    "C01": ["Echoes_of_Time", "Night_Vigil"],
    "C02": ["Infinite_Perspective", "Floating_Cities"],
    "C03": ["Clean_Soul", "Long_Note_Two"],
    "C04": ["Tranquility_Base"],
    "C05": ["Satiate_Strings", "Ascending_the_Vale"],
    "C06": ["Ossuary_6_-_Air", "Long_Note_One"],
    "C07": ["Dark_Fog", "Long_Note_Three"],
    "C08": ["Unseen_Horrors", "Deep_Haze", "Long_Note_Four"],
    "C09": ["Peaceful_Desolation", "Constancy_Part_One", "Constancy_Part_Two", "Constancy_Part_Three"],
    "C10": ["Interloper", "Heart_of_Nowhere", "Ether_Vox"],
    "C11": ["Reawakening", "Bathed_in_the_Light"],
    "C12": ["Eternal_Hope", "Lasting_Hope"],
    "END": ["Majestic_Hills"],
}
MUSIC_VOLUME = {"default": 0.34, "Tranquility_Base": 0.4, "Long_Note_One": 0.4, "Long_Note_Two": 0.4,
                "Long_Note_Three": 0.4, "Long_Note_Four": 0.4, "Unseen_Horrors": 0.3, "Majestic_Hills": 0.42}
NUMBERS = ["", "Chapter One", "Chapter Two", "Chapter Three", "Chapter Four", "Chapter Five", "Chapter Six",
           "Chapter Seven", "Chapter Eight", "Chapter Nine", "Chapter Ten", "Chapter Eleven", "Epilogue"]

rng = random.Random(1950)


def f(seconds):
    return int(round(seconds * FPS))


def duration(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
                         capture_output=True, text=True).stdout
    return float(out.strip())


class Picker:
    """Chooses clips for a tag, spreading usage and walking through each clip."""

    def __init__(self, clips, images):
        self.items = [dict(c, kind="video") for c in clips] + [dict(i, kind="image", id=i["name"]) for i in images]
        self.usage = {it["id"]: 0 for it in self.items}
        self.cursor = {it["id"]: 0 for it in self.items}
        self.recent = []

    def pool(self, tag):
        seen = set()
        while tag and tag not in seen:
            seen.add(tag)
            p = [it for it in self.items if tag in it["tags"]]
            if p:
                return p
            tag = FALLBACK.get(tag)
        return []

    def pick(self, tag):
        pool = self.pool(tag)
        if not pool:
            return None
        fresh = [it for it in pool if it["id"] not in self.recent[-3:]] or pool
        best = min(fresh, key=lambda it: (self.usage[it["id"]], rng.random()))
        self.usage[best["id"]] += 1
        self.recent.append(best["id"])
        return best


def kenburns(kind, i):
    if kind == "image":
        s0, s1 = (1.0, 1.12) if i % 2 == 0 else (1.12, 1.02)
        dx = rng.choice([-2.5, 2.5, 0])
        dy = rng.choice([-1.5, 1.5, 0])
        return {"s0": s0, "s1": s1, "x0": -dx / 2, "x1": dx / 2, "y0": -dy / 2, "y1": dy / 2}
    s0, s1 = (1.0, 1.06) if i % 2 == 0 else (1.06, 1.01)
    return {"s0": s0, "s1": s1, "x0": 0, "x1": rng.choice([-1, 1, 0]), "y0": 0, "y1": 0}


def fill_block(picker, tag, start, end, shots):
    """Cover [start, end) frames with shots for a visual tag."""
    if tag in GRAPHIC_TAGS:
        name, props = GRAPHIC_TAGS[tag]
        shots.append({"from": start, "len": end - start, "type": "graphic", "graphic": name, "props": dict(props)})
        return
    t = start
    i = 0
    while t < end:
        item = picker.pick(tag)
        if item is None:
            shots.append({"from": t, "len": end - t, "type": "graphic", "graphic": "Starfield", "props": {"seed": tag}})
            return
        target = SHOT_SECONDS["image" if item["kind"] == "image" else ("slow" if tag in SLOW_TAGS else "default")]
        d = f(target * rng.uniform(0.85, 1.15))
        if end - (t + d) < f(3.0):  # don't leave a sliver at the end of the block
            d = end - t
        shot = {"from": t, "type": item["kind"], "src": item["file"], "credit": item.get("credit", ""),
                "archival": item.get("archival", False), "kb": kenburns(item["kind"], i)}
        if item["kind"] == "image":
            if item["w"] / item["h"] < 1.3:
                shot["props"] = {"fit": "contain"}
        else:
            total = f(item["duration"]) - 2
            need = d + FADE
            rate = 1.0
            if total < need:
                rate = max(0.6, total / need)
                if total / need < 0.6:  # too short even in slow motion: shorten this shot
                    d = max(f(3.0), int(total / 0.6) - FADE)
                    need = d + FADE
                picker.cursor[item["id"]] = 0
            elif picker.cursor[item["id"]] + need > total:
                picker.cursor[item["id"]] = 0
            shot["startFrom"] = picker.cursor[item["id"]]
            shot["playbackRate"] = round(rate, 3)
            picker.cursor[item["id"]] += int(need * rate) + f(1)
        shot["len"] = min(d, end - t)
        shots.append(shot)
        t += shot["len"]
        i += 1


def finalize_shots(shots, seg_len):
    out = []
    for k, s in enumerate(shots):
        nxt = shots[k + 1] if k + 1 < len(shots) else None
        overlap = FADE if nxt else 0
        s = dict(s)
        s["fadeIn"] = 0 if k == 0 else FADE
        s["duration"] = min(s.pop("len") + overlap, seg_len - s["from"])
        out.append(s)
    return out


def music_for(key, seg_len):
    clips = []
    t = 0
    tracks = MUSIC[key]
    k = 0
    while seg_len - t > f(5):
        name = tracks[k % len(tracks)]
        src = f"music_n/{name}.m4a"
        L = f(duration(os.path.join(ROOT, "public", src)))
        d = min(L, seg_len - t)
        if seg_len - (t + d - f(3)) <= f(5):  # last track: let it run (and fade) to the end
            d = min(seg_len - t, L)
            clips.append({"from": t, "duration": d, "src": src, "volume": MUSIC_VOLUME.get(name, MUSIC_VOLUME["default"]),
                          "fadeIn": 45 if t > 0 else 20, "fadeOut": 90, "name": name})
            break
        clips.append({"from": t, "duration": d, "src": src, "volume": MUSIC_VOLUME.get(name, MUSIC_VOLUME["default"]),
                      "fadeIn": 45 if t > 0 else 20, "fadeOut": 90 if t + d < seg_len else 60, "name": name})
        t += d - f(3)  # 3 s crossfade into the next track
        k += 1
    return clips


def srt_time(sec):
    h, rem = divmod(sec, 3600)
    m, s = divmod(rem, 60)
    return f"{int(h):02d}:{int(m):02d}:{int(s):02d},{int(round((s - int(s)) * 1000)):03d}"


def split_caption(text, start, dur):
    """Split a paragraph into caption chunks (<= ~84 chars), timed by length."""
    sentences = re.split(r"(?<=[.?!])\s+", text)
    chunks = []
    for s in sentences:
        words = s.split()
        cur = ""
        for w in words:
            if len(cur) + len(w) + 1 > 84 and cur:
                chunks.append(cur)
                cur = w
            else:
                cur = (cur + " " + w).strip()
        if cur:
            chunks.append(cur)
    total = sum(len(c) for c in chunks)
    t = start
    out = []
    for c in chunks:
        d = dur * len(c) / total
        out.append((t, t + d, c))
        t += d
    return out


def main():
    chapters = json.load(open(os.path.join(ROOT, "build", "beats.json")))
    clips = json.load(open(os.path.join(ROOT, "src", "data", "clips.json")))
    images = json.load(open(os.path.join(ROOT, "src", "data", "images.json")))
    picker = Picker(clips, images)
    segments = []
    captions = []
    chapter_marks = []
    film_t = 0
    used_credits = set()
    used_music = []

    for ci, ch in enumerate(chapters):
        first = ci == 0
        lead = f(LEAD_FIRST if first else LEAD_CHAPTER)
        t = lead
        narration, speech, overlays, blocks = [], [], [], []
        cur_tag, block_start = None, 0
        for bi, b in enumerate(ch["beats"]):
            tag = b["vis"]
            if tag != cur_tag:
                if cur_tag is not None:
                    blocks.append((cur_tag, block_start, t))
                cur_tag, block_start = tag, (0 if not blocks and cur_tag is None else t)
            if b["type"] == "speech":
                d = f(b["seconds"])
                narration.append({"from": t, "duration": d + 2, "src": f"narration_n/{b['audio']}"})
                speech.append([t, t + d])
                captions.append((film_t / FPS + t / FPS, b["seconds"], b["text"]))
                if "lower" in b:
                    overlays.append({"type": "lowerThird", "from": t + 12, "duration": min(f(6.5), d + f(GAP) - 12),
                                     "title": b["lower"]["title"], "sub": b["lower"]["sub"]})
                if "callout" in b:
                    overlays.append({"type": "callout", "from": t + 30, "duration": max(f(3), min(f(6.5), d - 30)),
                                     "title": b["callout"]["title"], "sub": b["callout"]["sub"]})
                if "quote" in b:
                    overlays.append({"type": "quote", "from": t, "duration": d + f(GAP),
                                     "title": b["quote"]["title"], "sub": b["quote"]["sub"]})
                t += d + f(GAP)
            else:
                t += f(b["seconds"])
        seg_len = t + f(TAIL)
        blocks.append((cur_tag, block_start, seg_len))
        # the first block also covers the lead-in
        blocks[0] = (blocks[0][0], 0, blocks[0][2])

        shots = []
        for tag, a, b in blocks:
            fill_block(picker, tag, a, b, shots)
        shots = finalize_shots(shots, seg_len)
        for s in shots:
            if s.get("credit"):
                used_credits.add(s["credit"])

        if first:
            # main title over the last pause of the cold open
            last = ch["beats"][-1]
            overlays.append({"type": "titleCard", "from": seg_len - f(TAIL) - f(last["seconds"]) + 10,
                             "duration": f(last["seconds"]) + f(TAIL) - 10,
                             "title": "Are We Alone?", "sub": "The Mystery of the Fermi Paradox"})
        else:
            overlays.insert(0, {"type": "chapterCard", "from": 8, "duration": lead - 8, "num": NUMBERS[ci],
                                "title": ch["title"], "sub": ch["subtitle"]})
        if ch["id"] == "C12":
            last = ch["beats"][-1]
            overlays.append({"type": "titleCard", "from": seg_len - f(TAIL) - f(last["seconds"]) + 10,
                             "duration": f(last["seconds"]) + f(TAIL) - 10, "title": "Are We Alone?", "sub": ""})

        music = music_for(ch["id"], seg_len)
        used_music += [m["name"] for m in music]
        chapter_marks.append((film_t / FPS, ch["title"] if not first else "Cold Open"))
        segments.append({
            "id": ch["id"], "title": ch["title"], "subtitle": ch["subtitle"], "durationInFrames": seg_len,
            "shots": shots, "narration": narration, "music": [{k: v for k, v in m.items() if k != "name"} for m in music],
            "overlays": overlays, "speech": speech, "fadeFromBlack": 45 if first else 20, "fadeToBlack": 20,
        })
        film_t += seg_len

    # closing credits
    end_len = f(CREDITS_SECONDS)
    music = music_for("END", end_len)
    used_music += [m["name"] for m in music]
    credit_lines = ["# Are We Alone?", "The Mystery of the Fermi Paradox", "",
                    "# Written, researched & edited", "Made with Remotion", "",
                    "# Narration", "Synthetic voice · Kokoro TTS (Apache 2.0)", "",
                    "# Footage & Images"] + sorted(used_credits | {"ESO (CC BY 4.0)"} - {"ESO"}) + ["",
                    "# Music", *[f"“{n.replace('_', ' ')}” · Kevin MacLeod (incompetech.com)" for n in dict.fromkeys(used_music)],
                    "Licensed under Creative Commons: By Attribution 4.0", "",
                    "# Selected Sources",
                    "Hart, M. H. (1975) · Quarterly Journal of the RAS",
                    "Drake, F. (1961) · Green Bank conference",
                    "Hanson, R. (1998) · The Great Filter",
                    "Ward & Brownlee (2000) · Rare Earth",
                    "Sandberg, Drexler & Ord (2018) · Dissolving the Fermi Paradox",
                    "Hanson et al. (2021) · If Loud Aliens Explain Human Earliness…",
                    "Wright, Kanodia & Lubar (2018) · How Much SETI Has Been Done?",
                    "Madhusudhan et al. (2025) · ApJ Letters — K2-18 b",
                    "Hurowitz et al. (2025) · Nature — Sapphire Canyon",
                    "Suazo et al. (2024) · MNRAS — Project Hephaistos", "",
                    "Thank you for watching."]
    segments.append({
        "id": "END", "title": "Credits", "subtitle": "", "durationInFrames": end_len,
        "shots": [{"from": 0, "duration": end_len, "type": "graphic", "graphic": "TitleBackdrop", "props": {}, "fadeIn": 0}],
        "narration": [], "music": [{k: v for k, v in m.items() if k != "name"} for m in music],
        "overlays": [{"type": "credits", "from": 0, "duration": end_len, "lines": credit_lines}],
        "speech": [], "fadeFromBlack": 30, "fadeToBlack": 60,
    })
    film_t += end_len

    timeline = {"fps": FPS, "width": 1920, "height": 1080, "segments": segments}
    json.dump(timeline, open(os.path.join(ROOT, "src", "data", "timeline.json"), "w"))

    os.makedirs(os.path.join(ROOT, "out"), exist_ok=True)
    with open(os.path.join(ROOT, "out", "subtitles.srt"), "w") as fh:
        n = 1
        for start, dur, text in captions:
            for a, b, c in split_caption(text, start, dur):
                fh.write(f"{n}\n{srt_time(a)} --> {srt_time(b)}\n{c}\n\n")
                n += 1
    with open(os.path.join(ROOT, "out", "chapters.txt"), "w") as fh:
        for sec, title in chapter_marks:
            fh.write(f"{int(sec // 60):02d}:{int(sec % 60):02d} {title}\n")
        credits_at = (film_t - end_len) / FPS
        fh.write(f"{int(credits_at // 60):02d}:{int(credits_at % 60):02d} Credits\n")
    print(f"segments: {len(segments)}  total: {film_t / FPS / 60:.1f} min  shots: {sum(len(s['shots']) for s in segments)}")
    for s in segments:
        print(f"  {s['id']:4s} {s['durationInFrames'] / FPS / 60:5.2f} min  {len(s['shots']):3d} shots")


if __name__ == "__main__":
    main()
