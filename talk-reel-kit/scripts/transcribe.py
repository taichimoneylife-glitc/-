"""
トーク動画を文字起こしして、言葉ごとの秒を public/words.json に書き出す。
  使い方:  python3 scripts/transcribe.py public/talk.mp4
  オプション: --model small|medium|large-v3（大きいほど正確・遅い。既定 medium）
             --out public/words.json
  必要なもの: pip install faster-whisper
できる形:  {"duration": 秒, "words": [{"w": "言葉", "s": 始まり秒, "e": 終わり秒}, ...]}
※ 固有名詞や数字はまちがうことがあるので、出来上がった words.json を目で見て直す（w だけ直せばOK）。
"""
import argparse, json, sys

ap = argparse.ArgumentParser()
ap.add_argument("src")
ap.add_argument("--model", default="medium")
ap.add_argument("--out", default="public/words.json")
ap.add_argument("--prompt", default="", help="よく出る言葉（固有名詞など）を書くと正確になる")
a = ap.parse_args()

try:
    from faster_whisper import WhisperModel
except ImportError:
    sys.exit("faster-whisper が入っていません: pip install faster-whisper")

model = WhisperModel(a.model, device="cpu", compute_type="int8")
segs, info = model.transcribe(a.src, language="ja", word_timestamps=True, vad_filter=True, initial_prompt=a.prompt or None)
words = []
for s in segs:
    for w in s.words or []:
        t = w.word.strip()
        if t:
            words.append({"w": t, "s": round(w.start, 2), "e": round(w.end, 2)})
    print(f"{s.start:6.1f}-{s.end:6.1f} {s.text}")
json.dump({"duration": round(info.duration, 2), "words": words}, open(a.out, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(f"→ {a.out}（{len(words)}語・{info.duration:.1f}秒）")
