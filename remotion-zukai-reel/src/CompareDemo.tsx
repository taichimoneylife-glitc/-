import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { A2 } from "./components/kit2";
import { FONT } from "./components/font";
import { B } from "./MileLifePlan";
import { K, SER } from "./components/zukaiKit";
import { SfxTrack } from "./components/sfx";
import { Board, type Panel, type Stop } from "./components/board";

// ════════════════════════════════════════════════════════════════════
//  比較動画の見本（参考⑦の見せ方＋マーケ博士のページ送り・黄色ノート版）
//  仮テーマ：同じ年収の2人／毎月3万円を NISA で積み立てる（太一）vs 貯金（助手）→ 10年後
//  数字：3万円×120か月＝360万円／年5%（月複利）で約466万円／差 約106万円（仮定の試算）
//  ルール：役の色を全編で固定（太一＝青・助手＝ピンク・中立＝紫）／1語ずつ強調の字幕／数字はカウントアップ
// ════════════════════════════════════════════════════════════════════
const F = (t: number) => Math.round(t * 30);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const OUT = Easing.bezier(0.16, 1, 0.3, 1);
const INK = A2.ink, SUB = A2.sub;
const CA = "#2F7BD9", CB = "#E5679A", CN = "#7B5CF0", RED = "#E8553B", GOLD = "#E9B82E", GREEN = "#2E9E6B";
const yen = (v: number) => Math.round(v).toLocaleString("ja-JP");

// ── 小さな部品 ─────────────────────────────────────────
const ease = (f: number, at: number, dur = 0.5) => interpolate(f - F(at), [0, F(dur)], [0, 1], { ...clamp, easing: OUT });
const rise = (f: number, at: number): React.CSSProperties => { const d = f - F(at); return { opacity: interpolate(d, [0, 6], [0, 1], clamp), transform: `translateY(${interpolate(d, [0, 9], [26, 0], { ...clamp, easing: OUT })}px) scale(${interpolate(d, [0, 9], [0.96, 1], { ...clamp, easing: OUT })})` }; };
const pop = (f: number, at: number) => interpolate(f - F(at), [0, 4, 8], [0.3, 1.12, 1], clamp);
const count = (f: number, at: number, to: number, dur = 0.5, from = 0) => from + (to - from) * ease(f, at, dur);

const Gen: React.FC<{ n: string; h: number; style?: React.CSSProperties }> = ({ n, h, style }) => <Img src={staticFile(`gen/${n}.png`)} style={{ height: h, width: "auto", display: "block", ...style }} />;

// 章の札＋大見出し
const Head: React.FC<{ at: number; pill: string; title: string; c: string }> = ({ at, pill, title, c }) => {
  const f = useCurrentFrame();
  const o = interpolate(f - F(at), [0, 8], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 180, textAlign: "center", opacity: o, filter: o < 1 ? `blur(${(1 - o) * 6}px)` : undefined }}>
      <span style={{ display: "inline-block", border: `4px solid ${c}`, color: c, background: "#fff", borderRadius: 999, padding: "4px 26px", ...K, fontSize: 30 }}>{pill}</span>
      <div style={{ ...K, fontSize: 68, color: INK, marginTop: 18, letterSpacing: 1 }}>{title}</div>
    </div>
  );
};

// 顔の丸（太一は顔の絵、助手は全身の絵の上の方を切り抜く）
const Face: React.FC<{ who: "A" | "B"; size: number }> = ({ who, size }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", border: `6px solid ${who === "A" ? CA : CB}`, background: "#fff", position: "relative", flex: "none" }}>
    {who === "A"
      ? <Img src={staticFile("gen/taichi_face_smile.png")} style={{ position: "absolute", width: "112%", left: "-6%", top: "2%" }} />
      : <Img src={staticFile("gen/girl_front_smile.png")} style={{ position: "absolute", width: "150%", left: "-25%", top: "-4%" }} />}
  </div>
);

// キャラ（全身）：出るときにポンと跳ねる＋ゆっくり上下
const Chara: React.FC<{ n: string; at: number; h: number; style?: React.CSSProperties; flip?: boolean }> = ({ n, at, h, style, flip }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  if (f < F(at)) return null;
  const s = spring({ frame: f - F(at), fps, config: { damping: 11, stiffness: 170, mass: 0.7 } });
  return <div style={{ position: "absolute", transform: `translateY(${(1 - s) * 60 + Math.sin(f / 12) * 4}px) scale(${0.7 + 0.3 * s}) ${flip ? "scaleX(-1)" : ""}`, opacity: Math.min(1, s * 2), transformOrigin: "50% 100%", ...style }}><Gen n={n} h={h} /></div>;
};

// ハンコ（斜めにドン）
const Stamp: React.FC<{ at: number; text: string; c?: string; style?: React.CSSProperties }> = ({ at, text, c = RED, style }) => {
  const f = useCurrentFrame();
  const d = f - F(at);
  if (d < 0) return null;
  const k = interpolate(d, [0, 4, 7], [2.2, 0.92, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const sh = d >= 4 && d < 12 ? Math.sin(d * 2.6) * (12 - d) * 1.2 : 0;
  return <div style={{ position: "absolute", opacity: interpolate(d, [0, 2], [0, 1], clamp), transform: `translateX(${sh}px) rotate(-8deg) scale(${k})`, ...style }}><span style={{ display: "inline-block", border: `7px solid ${c}`, color: c, background: "rgba(255,255,255,0.92)", borderRadius: 16, padding: "6px 30px", ...K, fontSize: 54, whiteSpace: "nowrap" }}>{text}</span></div>;
};

// ── 1語ずつ強調の字幕 ─────────────────────────────────────────
type Cap = { t: number; w: string[]; c: string; step?: number };
const Captions: React.FC<{ caps: Cap[]; end: number }> = ({ caps, end }) => {
  const f = useCurrentFrame(); const t = f / 30;
  let idx = -1; caps.forEach((c, i) => { if (t >= c.t) idx = i; });
  if (idx < 0 || t > end) return null;
  const c = caps[idx]; const step = c.step ?? 0.42;
  const nextT = idx + 1 < caps.length ? caps[idx + 1].t : end;
  const fadeOut = interpolate(t, [nextT - 0.12, nextT], [1, 0], clamp);
  const shown = Math.min(c.w.length, Math.floor((t - c.t) / step) + 1);
  return (
    <div style={{ position: "absolute", left: 140, right: 140, top: 1290, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px 6px", opacity: fadeOut }}>
      {c.w.slice(0, shown).map((w, i) => {
        const cur = i === shown - 1 && t - c.t < c.w.length * step + 0.25;
        const d = f - F(c.t + i * step);
        return <span key={i} style={{ ...K, fontSize: 52, lineHeight: 1.25, padding: "2px 12px", borderRadius: 14, color: cur ? "#fff" : INK, background: cur ? c.c : "transparent", transform: `scale(${interpolate(d, [0, 3, 6], [0.8, 1.08, 1], clamp)})`, display: "inline-block" }}>{w}</span>;
      })}
    </div>
  );
};

// ── ページ1：同じ年収の2人 ─────────────────────────────────────────
const P1: React.FC = () => {
  const f = useCurrentFrame(); const t = f / 30;
  const q = t >= 4.8;
  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: 230, textAlign: "center", ...K, fontSize: 84, color: INK }}>
        {q ? <span style={{ display: "inline-block", ...rise(f, 4.8) }}>10年後、<span style={{ color: RED }}>どうなる？</span></span> : <span style={{ display: "inline-block", ...rise(f, 0.3) }}>同じ年収の<span style={{ background: "linear-gradient(transparent 60%, #FCE07A 60%)" }}>2人</span></span>}
      </div>
      {(["A", "B"] as const).map((w, i) => {
        const at = 0.6 + i * 0.25; const c = w === "A" ? CA : CB;
        const tag = w === "A" ? "NISAで積み立て" : "貯金";
        return (
          <div key={w} style={{ position: "absolute", left: i === 0 ? 110 : 570, top: 420, width: 400, height: 640, background: "#fff", border: `6px solid ${c}`, borderRadius: 36, boxShadow: `8px 10px 0 ${c}`, ...rise(f, at) }}>
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 120, display: "flex", justifyContent: "center" }}><Gen n={w === "A" ? "taichi_front_smile" : "girl_front_smile"} h={420} /></div>
            {t >= (w === "A" ? 2.4 : 3.8) ? <div style={{ position: "absolute", left: 0, right: 0, bottom: 34, textAlign: "center", transform: `scale(${pop(f, w === "A" ? 2.4 : 3.8)})` }}><span style={{ background: c, color: "#fff", borderRadius: 999, padding: "8px 26px", ...K, fontSize: 34 }}>{tag}</span></div> : null}
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 470, top: 680, width: 140, height: 140, borderRadius: "50%", background: CN, border: `6px solid ${INK}`, color: "#fff", ...K, fontSize: 56, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${pop(f, 1.3)}) rotate(${Math.sin(f / 9) * 4}deg)`, opacity: t >= 1.3 ? 1 : 0 }}>VS</div>
    </>
  );
};

// ── ページ2：条件はまったく同じ（2枚のカード＋「＝」） ─────────────────
const ROWS: { at: number; label: string; to: number; fmt: (v: number) => string }[] = [
  { at: 8.0, label: "年齢", to: 30, fmt: (v) => `${Math.round(v)}歳` },
  { at: 8.9, label: "手取り", to: 30, fmt: (v) => `月${Math.round(v)}万円` },
  { at: 10.8, label: "貯金", to: 100, fmt: (v) => `${Math.round(v)}万円` },
];
const P2: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <Head at={6.2} pill="前提" title="条件はまったく同じ" c={CN} />
      {(["A", "B"] as const).map((w, i) => {
        const c = w === "A" ? CA : CB;
        return (
          <div key={w} style={{ position: "absolute", left: i === 0 ? 100 : 580, top: 420, width: 400, height: 720, background: "#fff", border: `6px solid ${c}`, borderRadius: 36, boxShadow: `8px 10px 0 ${c}`, ...rise(f, 6.6 + i * 0.2) }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 34 }}>
              <Face who={w} size={170} />
              <span style={{ marginTop: 14, background: c, color: "#fff", borderRadius: 999, padding: "4px 24px", ...K, fontSize: 32 }}>{w === "A" ? "太一" : "助手"}</span>
            </div>
            {ROWS.map((r, k) => f >= F(r.at) ? (
              <div key={r.label} style={{ position: "absolute", left: 36, right: 36, top: 330 + k * 120, ...rise(f, r.at) }}>
                <div style={{ ...B, fontSize: 26, color: SUB }}>{r.label}</div>
                <div style={{ ...K, fontSize: 52, color: INK }}>{r.fmt(count(f, r.at, r.to, 0.45, r.to * 0.85))}</div>
              </div>
            ) : null)}
          </div>
        );
      })}
      {ROWS.map((r, k) => f >= F(r.at + 0.25) ? <div key={k} style={{ position: "absolute", left: 510, top: 385 + 330 + k * 120, width: 60, height: 60, borderRadius: "50%", background: CN, color: "#fff", ...K, fontSize: 40, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${pop(f, r.at + 0.25)})` }}>＝</div> : null)}
    </>
  );
};

// ── 章の扉＋メーター（毎月3万円） ─────────────────────────────────────
const Meter: React.FC<{ at: number; c: string; label: string; sub: string }> = ({ at, c, label, sub }) => {
  const f = useCurrentFrame();
  const p = ease(f, at, 0.9);
  const R = 230, cx = 540, cy = 860, L = Math.PI * R;
  return (
    <>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, opacity: f >= F(at) ? 1 : 0 }}>
        <path d={`M${cx - R},${cy} A${R},${R} 0 0 1 ${cx + R},${cy}`} fill="none" stroke="#EDE6CC" strokeWidth={44} strokeLinecap="round" />
        <path d={`M${cx - R},${cy} A${R},${R} 0 0 1 ${cx + R},${cy}`} fill="none" stroke={c} strokeWidth={44} strokeLinecap="round" strokeDasharray={`${L * p * 0.62} 9999`} />
      </svg>
      {f >= F(at) ? <div style={{ position: "absolute", left: 0, right: 0, top: cy - 150, textAlign: "center" }}>
        <div style={{ ...SER, fontSize: 120, color: INK, lineHeight: 1 }}>{yen(count(f, at, 3, 0.9))}<span style={{ ...K, fontSize: 52 }}>万円</span></div>
        <div style={{ ...B, fontSize: 32, color: SUB, marginTop: 6 }}>{label}</div>
      </div> : null}
      {f >= F(at + 1.4) ? <div style={{ position: "absolute", left: 0, right: 0, top: cy + 70, textAlign: "center", transform: `scale(${pop(f, at + 1.4)})` }}><span style={{ display: "inline-block", border: `5px solid ${c}`, background: "#fff", color: c, borderRadius: 999, padding: "8px 30px", ...K, fontSize: 36 }}>{sub}</span></div> : null}
    </>
  );
};
const Chapter: React.FC<{ at: number; no: string; who: "A" | "B"; pose: string; title: string; meterAt: number; label: string; sub: string; poseH?: number }> = ({ at, no, who, pose, title, meterAt, label, sub, poseH = 360 }) => {
  const f = useCurrentFrame();
  const c = who === "A" ? CA : CB;
  const door = f < F(meterAt - 0.3);
  const doorOut = interpolate(f, [F(meterAt - 0.5), F(meterAt - 0.2)], [1, 0], clamp);
  return (
    <>
      {door ? <div style={{ position: "absolute", inset: 0, opacity: doorOut, filter: doorOut < 1 ? `blur(${(1 - doorOut) * 8}px)` : undefined }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 420, textAlign: "center", ...rise(f, at) }}>
          <div style={{ display: "inline-flex", width: 130, height: 130, borderRadius: "50%", background: c, color: "#fff", ...SER, fontSize: 80, alignItems: "center", justifyContent: "center" }}>{no}</div>
          <div style={{ ...K, fontSize: 96, color: c, marginTop: 14 }}>{who === "A" ? "太一" : "助手"}</div>
        </div>
        <Chara n={pose} at={at + 0.3} h={poseH} style={{ left: 540 - poseH * 0.36, top: 780 }} />
      </div> : null}
      {!door ? <Head at={meterAt - 0.3} pill={`${no}・${who === "A" ? "太一" : "助手"}`} title={title} c={c} /> : null}
      <Meter at={meterAt} c={c} label={label} sub={sub} />
    </>
  );
};
const P3: React.FC = () => <Chapter at={14.2} no="1" who="A" pose="taichi_wave_hi" title="毎月3万円をNISAで" meterAt={16.0} label="毎月の積立" sub="年5%で運用（仮定）" />;
const P4: React.FC = () => <Chapter at={20.2} no="2" who="B" pose="girl_front_smile" title="毎月3万円を貯金" meterAt={22.0} label="毎月の貯金" sub="金利はほぼ0%" poseH={380} />;

// ── 早送り（カレンダー） ─────────────────────────────────────────
const P5: React.FC = () => {
  const f = useCurrentFrame();
  const yr = Math.max(1, Math.min(10, Math.floor(interpolate(f, [F(26.4), F(28.0)], [1, 10.99], clamp))));
  return (
    <>
      <Head at={26.2} pill="早送り" title="10年後へ" c={CN} />
      {Array.from({ length: 9 }).map((_, i) => { const y = 500 + ((i * 97) % 600); const x = ((i * 233 + f * 70) % 1400) - 300; return <div key={i} style={{ position: "absolute", left: x, top: y, width: 160 + (i % 3) * 80, height: 6, borderRadius: 3, background: "rgba(123,92,240,0.25)" }} />; })}
      <div style={{ position: "absolute", left: 340, top: 520, width: 400, height: 440, background: "#fff", border: `6px solid ${INK}`, borderRadius: 30, boxShadow: `8px 10px 0 ${CN}`, overflow: "hidden", ...rise(f, 26.3) }}>
        <div style={{ height: 110, background: CN, color: "#fff", ...K, fontSize: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>年目</div>
        <div style={{ ...SER, fontSize: 230, color: INK, textAlign: "center", lineHeight: "320px", transform: `translateY(${(f % 3) * (yr < 10 ? 4 : 0)}px)` }}>{yr}</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1010, textAlign: "center", ...K, fontSize: 64, color: CN, opacity: yr >= 10 ? 1 : 0.3 }}>▶▶ ＋10年</div>
    </>
  );
};

// ── 10年後の資産（2本の棒＋点線＋差のハンコ） ─────────────────────────
const P6: React.FC = () => {
  const f = useCurrentFrame();
  const base = 1040, H = 520, MAX = 466;
  const bar = (x: number, who: "A" | "B", v: number, at: number, label: string) => {
    const c = who === "A" ? CA : CB; const p = ease(f, at, 0.9);
    const h = H * (v / MAX) * p;
    return (
      <>
        {f >= F(at) ? <div style={{ position: "absolute", left: x, top: base - h, width: 260, height: h, background: c, border: `5px solid ${INK}`, borderBottom: "none", borderRadius: "20px 20px 0 0" }} /> : null}
        {f >= F(at) ? <div style={{ position: "absolute", left: x - 40, width: 340, top: base - h - 96, textAlign: "center", ...SER, fontSize: 64, color: c }}>{yen(count(f, at, v, 0.9))}<span style={{ ...K, fontSize: 30 }}>万円</span></div> : null}
        <div style={{ position: "absolute", left: x - 30, width: 320, top: base + 20, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: f >= F(at - 0.3) ? 1 : 0 }}>
          <Face who={who} size={110} />
          <span style={{ ...K, fontSize: 30, color: INK }}>{label}</span>
        </div>
      </>
    );
  };
  const lineY = base - H * (360 / MAX);
  return (
    <>
      <Head at={29.2} pill="10年後" title="資産はいくら？" c={CN} />
      <div style={{ position: "absolute", left: 120, right: 120, top: base, height: 5, background: INK, borderRadius: 3 }} />
      {bar(640, "B", 360, 29.6, "貯金")}
      {f >= F(31.2) ? <div style={{ position: "absolute", left: 120, right: 120, top: lineY, borderTop: `5px dashed ${CB}`, opacity: ease(f, 31.2, 0.4) }} /> : null}
      {bar(180, "A", 466, 31.8, "NISA")}
      {f >= F(34.0) ? (() => { const top = base - H, bot = lineY; return <div style={{ position: "absolute", left: 460, top, height: bot - top, width: 40, borderRight: `6px solid ${RED}`, borderTop: `6px solid ${RED}`, borderBottom: `6px solid ${RED}`, borderRadius: "0 12px 12px 0", opacity: ease(f, 34.0, 0.3) }} />; })() : null}
      <Stamp at={34.6} text="差は約106万円！" style={{ left: 470, top: 410 }} />
    </>
  );
};

// ── まとめ（＋−の2列） ─────────────────────────────────────────
const LIST: { who: "A" | "B"; at: number; plus: boolean; text: string }[] = [
  { who: "A", at: 38.6, plus: true, text: "増える可能性" },
  { who: "A", at: 40.3, plus: false, text: "値下がりもある" },
  { who: "B", at: 42.0, plus: true, text: "減らない" },
  { who: "B", at: 42.9, plus: false, text: "増えない" },
];
const P7: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <Head at={38.2} pill="まとめ" title="NISA vs 貯金" c={CN} />
      {(["A", "B"] as const).map((w, i) => {
        const c = w === "A" ? CA : CB;
        return (
          <div key={w} style={{ position: "absolute", left: i === 0 ? 100 : 580, top: 420, width: 400, height: 460, background: "#fff", border: `6px solid ${c}`, borderRadius: 36, boxShadow: `8px 10px 0 ${c}`, ...rise(f, 38.3 + i * 0.2) }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 24 }}>
              <Face who={w} size={130} />
              <span style={{ marginTop: 10, ...K, fontSize: 40, color: c }}>{w === "A" ? "NISA" : "貯金"}</span>
            </div>
            {LIST.filter((l) => l.who === w).map((l, k) => f >= F(l.at) ? (
              <div key={k} style={{ position: "absolute", left: 30, right: 20, top: 270 + k * 86, display: "flex", alignItems: "center", gap: 14, ...rise(f, l.at) }}>
                <span style={{ width: 54, height: 54, borderRadius: "50%", background: l.plus ? GREEN : RED, color: "#fff", ...K, fontSize: 40, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>{l.plus ? "＋" : "−"}</span>
                <span style={{ ...K, fontSize: 38, color: INK, whiteSpace: "nowrap" }}>{l.text}</span>
              </div>
            ) : null)}
          </div>
        );
      })}
      {f >= F(44.0) ? <div style={{ position: "absolute", left: 100, right: 250, top: 940, display: "flex", alignItems: "center", justifyContent: "center", gap: 18, background: "#fff", border: `5px solid ${GOLD}`, borderRadius: 24, padding: "18px 0", ...rise(f, 44.0) }}>
        <span style={{ width: 56, height: 56, borderRadius: 12, border: `5px solid ${INK}`, display: "flex", alignItems: "center", justifyContent: "center", ...K, fontSize: 44, color: GREEN }}>{f >= F(44.8) ? "✓" : ""}</span>
        <span style={{ ...K, fontSize: 34, color: INK }}>長く続けるなら、比べる価値あり</span>
      </div> : null}
      <Chara n="taichi_thumbs_up" at={44.8} h={230} style={{ left: 840, top: 920 }} />
    </>
  );
};

// ── 全体 ─────────────────────────────────────────
const PANELS: Panel[] = [1, 2, 3, 4, 5, 6, 7].map((n, i) => ({ id: `p${n}`, col: i, row: 0 }));
const LINKS: [string, string][] = [["p1", "p2"], ["p2", "p3"], ["p3", "p4"], ["p4", "p5"], ["p5", "p6"], ["p6", "p7"]];
const STOPS: Stop[] = [
  { id: "p1", trans: 0 }, { id: "p2", trans: 5.9, kind: "kick" }, { id: "p3", trans: 13.9, kind: "kick" }, { id: "p4", trans: 19.9, kind: "fast" },
  { id: "p5", trans: 25.9, kind: "fast" }, { id: "p6", trans: 28.9, kind: "kick" }, { id: "p7", trans: 37.9, kind: "fast" },
];
const PAGES: Record<string, React.FC> = { p1: P1, p2: P2, p3: P3, p4: P4, p5: P5, p6: P6, p7: P7 };
const CAPS: Cap[] = [
  { t: 0.3, w: ["同じ", "年収の", "2人"], c: CN }, { t: 2.0, w: ["1人は", "NISAで", "積み立て"], c: CA }, { t: 3.5, w: ["もう1人は", "貯金"], c: CB }, { t: 4.8, w: ["10年後、", "どうなる？"], c: RED },
  { t: 6.4, w: ["条件は", "まったく", "同じ"], c: CN }, { t: 8.0, w: ["30歳、", "手取りは", "月30万円"], c: CN }, { t: 10.6, w: ["貯金は", "100万円"], c: CN },
  { t: 14.3, w: ["1人目、", "太一は"], c: CA }, { t: 16.0, w: ["毎月", "3万円を", "NISAで"], c: CA }, { t: 17.8, w: ["年5%で", "運用できたと", "仮定します"], c: CA },
  { t: 20.3, w: ["2人目、", "助手は"], c: CB }, { t: 22.0, w: ["毎月", "3万円を", "貯金"], c: CB }, { t: 23.8, w: ["金利は", "ほぼ", "ゼロ"], c: CB },
  { t: 26.4, w: ["10年", "早送り！"], c: CN },
  { t: 29.6, w: ["貯金は", "10年で", "360万円"], c: CB }, { t: 31.8, w: ["NISAは", "約466万円"], c: CA }, { t: 34.0, w: ["その差、", "約106万円"], c: RED },
  { t: 38.4, w: ["NISAは", "増える", "可能性"], c: CA }, { t: 40.1, w: ["でも", "値下がりも", "ある"], c: CA }, { t: 41.8, w: ["貯金は", "減らない", "けど増えない"], c: CB }, { t: 43.8, w: ["長く", "続けるなら", "比べる価値あり"], c: CN },
];
const CUES: { file: string; at: number; volume: number }[] = [
  { file: "user/u02s", at: F(1.3), volume: 0.2 },
  ...[5.9, 13.9, 19.9, 25.9, 28.9, 37.9].map((t) => ({ file: "user/u03s", at: F(t), volume: 0.22 })),
  ...[8.0, 8.9, 10.8].map((t) => ({ file: "user/u02s", at: F(t), volume: 0.16 })),
  ...[16.0, 22.0].map((t) => ({ file: "user/u05s", at: F(t), volume: 0.2 })),
  { file: "user/u05", at: F(29.6), volume: 0.2 }, { file: "user/u05", at: F(31.8), volume: 0.22 }, { file: "user/u04", at: F(34.6), volume: 0.26 },
  ...[38.6, 40.3, 42.0, 42.9].map((t) => ({ file: "user/u02s", at: F(t), volume: 0.16 })), { file: "user/u10", at: F(44.8), volume: 0.24 },
];
const Note: React.FC = () => {
  const f = useCurrentFrame(); const t = f / 30;
  if (t < 29 || t > 38) return null;
  return <div style={{ position: "absolute", left: 150, right: 150, top: 1248, textAlign: "center", ...B, fontSize: 21, color: SUB }}>※毎月3万円・10年。NISAは年5%（月複利）で運用できた場合の仮定の試算</div>;
};

export const COMPAREDEMO_FRAMES = F(46.5);
export const CompareDemo: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: FONT, background: A2.bg }}>
    <SfxTrack cues={CUES} />
    <Board streaks panels={PANELS} stops={STOPS} links={LINKS} paper={{ background: A2.bg, backgroundImage: "repeating-linear-gradient(transparent 0 62px, rgba(176,146,60,0.22) 62px 64px)" }}>
      {(id) => { const C = PAGES[id]; return <AbsoluteFill><C /></AbsoluteFill>; }}
    </Board>
    <Note />
    <Captions caps={CAPS} end={46.2} />
  </AbsoluteFill>
);
