// ── 効果音スターターパックを生成（ネット不要・合成音）──
//  実行: node .claude/skills/zukai-reel/scripts/gen-sfx.mjs
//  出力: public/sfx/*.wav（pop / whoosh / tick / ding / success）
//  すべて著作権フリー（このスクリプトが生成する合成音）。あとで本物の素材に差し替え可。
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

// scripts/ → zukai-reel/ → skills/ → .claude/ → remotion-zukai-reel/
const ROOT = dirname(dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url))))));
const OUT = `${ROOT}/public/sfx`;
mkdirSync(OUT, { recursive: true });

const SR = 44100;
function wav(samples) {
  const n = samples.length;
  const buf = Buffer.alloc(44 + n * 2);
  buf.write("RIFF", 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write("WAVE", 8);
  buf.write("fmt ", 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22); buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 2, 28);
  buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
  buf.write("data", 36); buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    const v = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE((v * 32767) | 0, 44 + i * 2);
  }
  return buf;
}
const env = (i, n, a = 0.005, r = 0.25) => {
  const t = i / SR, dur = n / SR;
  const atk = Math.min(1, t / a);
  const rel = Math.min(1, (dur - t) / r);
  return Math.max(0, Math.min(atk, rel));
};
const tone = (n, f, opts = {}) => {
  const { a = 0.004, r, glide = 0, type = "sine", vib = 0 } = opts;
  const rel = r ?? n / SR * 0.6;
  const s = new Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const freq = f * (1 + glide * (t / (n / SR)));
    const ph = 2 * Math.PI * freq * t + (vib ? Math.sin(2 * Math.PI * 6 * t) * vib : 0);
    let w = type === "square" ? Math.sign(Math.sin(ph)) : type === "tri" ? Math.asin(Math.sin(ph)) * (2 / Math.PI) : Math.sin(ph);
    s[i] = w * env(i, n, a, rel) * 0.6;
  }
  return s;
};
const noise = (n, r = 0.12) => {
  const s = new Array(n);
  for (let i = 0; i < n; i++) s[i] = (Math.random() * 2 - 1) * env(i, n, 0.002, r) * 0.5;
  return s;
};
const mix = (...arrs) => {
  const n = Math.max(...arrs.map((a) => a.length));
  const out = new Array(n).fill(0);
  for (const a of arrs) for (let i = 0; i < a.length; i++) out[i] += a[i];
  return out.map((v) => v / arrs.length);
};

// pop: 箱/カード出現（短い弾け）
writeFileSync(`${OUT}/pop.wav`, wav(tone(Math.floor(SR * 0.14), 520, { glide: 0.9, r: 0.09, type: "tri" })));
// whoosh: 左右スライド/場面転換
writeFileSync(`${OUT}/whoosh.wav`, wav(noise(Math.floor(SR * 0.22), 0.18)));
// tick: カウントアップ（軽いクリック）
writeFileSync(`${OUT}/tick.wav`, wav(tone(Math.floor(SR * 0.05), 1200, { a: 0.001, r: 0.03, type: "square" }).map((v) => v * 0.5)));
// ding: 強調ポップ/チェック
writeFileSync(`${OUT}/ding.wav`, wav(mix(tone(Math.floor(SR * 0.5), 880, { r: 0.42 }), tone(Math.floor(SR * 0.5), 1320, { r: 0.42 }))));
// success: 結論/締め（上昇3和音）
{
  const n = Math.floor(SR * 0.6);
  const a = tone(n, 660, { r: 0.5 }), b = tone(n, 830, { r: 0.5 }).map((v, i) => (i > SR * 0.08 ? v : 0)), c = tone(n, 990, { r: 0.5 }).map((v, i) => (i > SR * 0.16 ? v : 0));
  writeFileSync(`${OUT}/success.wav`, wav(mix(a, b, c)));
}
console.log("✓ 効果音を生成:", OUT, "(pop, whoosh, tick, ding, success)");
