#!/usr/bin/env python3
"""参考動画の精密分析（動き・カメラ・音）。
使い方: python3.13 ref_motion.py <動画> <出力フォルダ>
出力: report.txt（数字のまとめ）、hook.png（0〜4秒を30枚/秒）、t01.png…（カメラが大きく動いた所の前後を30枚/秒）
- 画面の変化量（フレーム差）→ 動いている区間・場面の切り替え
- カメラの移動量（位相相関）→ 1フレームごとのずれ。ため・加速・止まり方が数字で分かる
- 音：高い音の立ち上がり（効果音・BGMのリズム）、BGMの有無（声のない所の音量）、テンポ
"""
import os, subprocess, sys
import numpy as np
from PIL import Image

FF = "ffmpeg"
W, H = 180, 320


def run(*a):
    subprocess.run(a, check=True)


def main(src, out):
    os.makedirs(out, exist_ok=True)
    raw = os.path.join(out, "g.raw")
    run(FF, "-v", "error", "-y", "-i", src, "-vf", f"fps=30,scale={W}:{H},format=gray", "-f", "rawvideo", raw)
    a = np.fromfile(raw, dtype=np.uint8)
    n = a.size // (W * H)
    v = a[: n * W * H].reshape(n, H, W).astype(np.float32)
    os.remove(raw)
    rep = [f"frames {n} ({n/30:.2f}s)"]

    d = np.abs(np.diff(v, axis=0)).mean(axis=(1, 2))
    segs, st = [], None
    for i, x in enumerate(d > 1.5):
        if x and st is None:
            st = i
        if not x and st is not None:
            if i - st >= 3:
                segs.append(f"{st/30:.2f}-{i/30:.2f}(max{d[st:i].max():.0f})")
            st = None
    rep.append("動いている区間: " + " ".join(segs))

    def shift(p, q):
        F1 = np.fft.fft2(p - p.mean()); F2 = np.fft.fft2(q - q.mean())
        R = F1 * np.conj(F2); R /= np.abs(R) + 1e-6
        r = np.fft.ifft2(R).real
        y, x = np.unravel_index(r.argmax(), r.shape)
        if y > H // 2: y -= H
        if x > W // 2: x -= W
        return x * 1080 // W, y * 1920 // H, r.max()

    sh = [shift(v[i + 1], v[i]) for i in range(n - 1)]
    # カメラの大きな動き（1フレーム60px以上）をまとめる
    moves, i = [], 0
    while i < len(sh):
        x, y, c = sh[i]
        if c > 0.15 and (abs(x) >= 60 or abs(y) >= 60):
            s = max(0, i - 6); e = i
            while e < len(sh) and (abs(sh[e][0]) >= 6 or abs(sh[e][1]) >= 6 or e - i < 2):
                e += 1
            prof = [(sh[k][0], sh[k][1]) for k in range(s, min(len(sh), e + 4))]
            moves.append((s, e, prof)); i = e + 4
        else:
            i += 1
    rep.append(f"カメラの大きな動き {len(moves)}回（px/フレーム・1080x1920換算）")
    for s, e, prof in moves:
        rep.append(f"  {(s+1)/30:.2f}s〜{(e+1)/30:.2f}s: " + " ".join(f"{x:+d},{y:+d}" for x, y in prof))

    # ズーム（拡大・縮小）：ずれが小さいのに画面が大きく変わるフレームで、前のフレームを何倍にすると一番合うかを探す
    def zoom(p, q):
        best, bs = 1e18, 1.0
        P = Image.fromarray(p.astype(np.uint8))
        for s in np.arange(0.86, 1.161, 0.01):
            w2, h2 = int(W * s), int(H * s)
            z = np.asarray(P.resize((w2, h2)), dtype=np.float32)
            if s >= 1:
                y0, x0 = (h2 - H) // 2, (w2 - W) // 2; z = z[y0:y0 + H, x0:x0 + W]; ref = q
            else:
                y0, x0 = (H - h2) // 2, (W - w2) // 2; ref = q[y0:y0 + h2, x0:x0 + w2]
            e = ((z - ref) ** 2).mean()
            if e < best: best, bs = e, s
        return bs
    zs = []
    for k in range(n - 1):
        if d[k] > 2.0 and abs(sh[k][0]) < 12 and abs(sh[k][1]) < 12:
            s = zoom(v[k], v[k + 1])
            if abs(s - 1) >= 0.02: zs.append((k + 1, s))
    rep.append("ズーム（秒:倍率/フレーム。1より大きい＝寄る）: " + " ".join(f"{k/30:.2f}:{s:.2f}" for k, s in zs))

    # 30枚/秒の絵
    def strip(t0, t1, name):
        fr = [k for k in range(int(t0 * 30), min(n, int(t1 * 30)))]
        if not fr: return
        tw, th = 120, 213
        c = min(15, len(fr)); r = (len(fr) + c - 1) // c
        im = Image.new("L", (tw * c, th * r), 255)
        for j, k in enumerate(fr):
            im.paste(Image.fromarray(v[k].astype(np.uint8)).resize((tw, th)), ((j % c) * tw, (j // c) * th))
        im.save(os.path.join(out, name))
    strip(0, 4, "hook.png")
    for j, (s, e, _) in enumerate(moves[:6]):
        strip(s / 30 - 0.2, e / 30 + 0.5, f"t{j+1:02d}.png")

    # 音
    raw = os.path.join(out, "a.raw")
    run(FF, "-v", "error", "-y", "-i", src, "-vn", "-ac", "1", "-ar", "22050", "-f", "s16le", raw)
    x = np.fromfile(raw, dtype=np.int16).astype(np.float32) / 32768
    os.remove(raw)
    sr, hop, win = 22050, 220, 1024
    fr = (len(x) - win) // hop
    w = np.hanning(win)
    spec = np.array([np.abs(np.fft.rfft(x[k * hop:k * hop + win] * w)) for k in range(fr)])
    f = np.fft.rfftfreq(win, 1 / sr)
    hi = np.maximum(0, np.diff(spec[:, (f > 5000)].sum(1)))
    flux = np.maximum(0, np.diff(spec, axis=0)).sum(1)
    env = flux - np.convolve(flux, np.ones(50) / 50, "same")
    env = np.maximum(env, 0)
    ac = np.correlate(env, env, "full")[len(env) - 1:]
    lags = np.arange(len(ac)) * hop / sr
    m = (lags > 60 / 180) & (lags < 60 / 70)
    bpm = 60 / lags[m][ac[m].argmax()] if m.any() else 0
    rms = np.sqrt(np.convolve(x ** 2, np.ones(2205) / 2205, "same"))[::220]
    rep.append(f"音: 中央の音量 {np.median(rms):.3f} / 静かな所(5%) {np.percentile(rms,5):.3f} → {'BGMあり' if np.percentile(rms,5) > 0.02 else 'BGMなし/小さい'}　リズムの目安 約{bpm:.0f}BPM")
    th = np.median(hi) + 3 * np.std(hi)
    on, last = [], -99
    for k in range(1, len(hi) - 1):
        if hi[k] > th and hi[k] >= hi[k - 1] and hi[k] >= hi[k + 1] and k - last > 10:
            on.append(k * hop / sr); last = k
    rep.append("高い音の立ち上がり(秒): " + " ".join(f"{t:.2f}" for t in on))
    open(os.path.join(out, "report.txt"), "w").write("\n".join(rep) + "\n")
    print("\n".join(rep))


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
