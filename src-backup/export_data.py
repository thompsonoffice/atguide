#!/usr/bin/env python3
"""Re-export ATGuide/Resources/atguide-data.json from the ATGuide website's index.html.

Usage: python3 tools/export_data.py path/to/index.html
"""
import json, re, sys, datetime, pathlib

src = sys.argv[1] if len(sys.argv) > 1 else "index.html"
html = open(src, encoding="utf-8").read()
D = json.loads(re.search(r"<script>window\.ATG=(.*?);</script>", html, re.S).group(1))
SK = {"cpu": "processor", "ram": "memory", "sto": "storage", "os": "operatingSystem", "tts": "speech",
      "bat": "battery", "disp": "display", "price": "price", "syn": "synthesis", "plat": "platforms", "def": "defaultOn"}
CATS = ["Notetakers", "VoiceNotes", "BrailleSense", "VoiceSense", "PDAs", "Braille Displays", "Book Readers",
        "Speech Synthesizers", "TTS Voices", "Screen Readers", "Accessible Linux", "Magnifiers",
        "Vision Wearables", "Embossers", "Miscellaneous", "Other"]

def drop(d):
    return {k: v for k, v in d.items() if v not in (None, [], {}, "")}

out = dict(
    version=1,
    generated=datetime.date.today().isoformat(),
    categories=CATS,
    companies=[drop(dict(id=c["id"], name=c["n"], founded=c.get("f"), history=c.get("h"), sources=c.get("src", [])))
               for c in D["CO"]],
    devices=[drop(dict(id=d["id"], name=d["n"], company=d["co"], category=d["cat"], year=d.get("yr", 0),
                       released=d.get("y"), overview=d.get("o"), physical=d.get("ph"), features=d.get("f", []),
                       history=d.get("h"), ports=d.get("io"),
                       specs={SK.get(k, {"syns":"Speech synthesizers available","used":"Used price today (eBay)"}.get(k,k)): v for k, v in (d.get("s") or {}).items()},
                       requirements=d.get("req", []), predecessors=d.get("pre", []), successors=d.get("suc", []),
                       voices=d.get("vo", []), sources=d.get("src", [])))
             for d in D["DEV"]],
    osHistories=[drop(dict(id=o["id"], name=o["n"], company=o["co"], overview=o.get("h"),
                           versions=[dict(name=v[0], released=v[1], notes=v[2]) for v in o["v"]],
                           devices=o.get("d", []), requirements=o.get("req", []), sources=o.get("src", [])))
                 for o in D["OSL"]],
    trivia=[drop(dict(text=t["t"], device=t.get("d"), level=t["lv"])) for t in D["TRIV"]],
)
dest = pathlib.Path(__file__).resolve().parent.parent / "ATGuide" / "Resources" / "atguide-data.json"
dest.write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
print("wrote", dest, len(out["companies"]), "companies,", len(out["devices"]), "devices,",
      len(out["osHistories"]), "OS histories,", len(out["trivia"]), "trivia")
