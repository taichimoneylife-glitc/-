import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { FONT } from "./components/font";

// ───────────────────────────────────────────────────────────────
// 年収の壁(2026)｜大枠フロー：3つの壁→シュッと上へ→各壁を1つずつ→働き損→締め
//   縦に積んだシーンをカメラが上へスクロール(=シュッと上に行く)。デザインは大枠。
//   数字=2026(出典kabe_source)。働き損は自前試算(128→126/130超→108/約150回復・目安)。
// ───────────────────────────────────────────────────────────────

const C = {
  bg: "#FCFBF7", ink: "#1F3A5F", orange: "#E8912D", orangeBg: "#FBEBD4",
  red: "#E0483B", redBg: "#FCE6E3", green: "#2E9E6B", greenBg: "#E4F3EC",
  gray: "#AEB8C2", grayBg: "#EEF1F4", line: "#C9D2DD",
};
const H = 1920;
export const KABE_FRAMES = 840; // 28s（大枠プレビュー）

const useS = (delay: number, dur = 12, cfg: Parameters<typeof spring>[0]["config"] = { damping: 16, stiffness: 140, mass: 0.8 }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  return spring({ frame: f - delay, fps, config: cfg, durationInFrames: dur });
};
const Rise: React.FC<{ delay: number; appear: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ delay, appear, style, children }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const s = spring({ frame: f - appear - delay, fps, config: { damping: 18 }, durationInFrames: 14 });
  return <div style={{ opacity: Math.min(1, s * 1.7), transform: `translateY(${(1 - s) * 26}px)`, ...style }}>{children}</div>;
};
const Pop: React.FC<{ delay: number; appear: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ delay, appear, style, children }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const s = spring({ frame: f - appear - delay, fps, config: { damping: 13, stiffness: 150, mass: 0.7 }, durationInFrames: 12 });
  return <div style={{ opacity: Math.min(1, s * 2), transform: `scale(${s})`, transformOrigin: "center", ...style }}>{children}</div>;
};
const Wall: React.FC<{ s?: number; color?: string }> = ({ s = 70, color = C.ink }) => (
  <svg width={s} height={s} viewBox="0 0 48 48"><rect x="5" y="10" width="38" height="30" rx="3" fill="none" stroke={color} strokeWidth="3" /><line x1="5" y1="20" x2="43" y2="20" stroke={color} strokeWidth="2.5" /><line x1="5" y1="30" x2="43" y2="30" stroke={color} strokeWidth="2.5" /><line x1="24" y1="10" x2="24" y2="20" stroke={color} strokeWidth="2.5" /><line x1="14" y1="20" x2="14" y2="30" stroke={color} strokeWidth="2.5" /><line x1="34" y1="20" x2="34" y2="30" stroke={color} strokeWidth="2.5" /><line x1="24" y1="30" x2="24" y2="40" stroke={color} strokeWidth="2.5" /></svg>
);
const Pill: React.FC<{ text: string; v?: "navy" | "orange" | "red" | "green" | "out"; size?: number }> = ({ text, v = "navy", size = 30 }) => {
  const map: any = { navy: C.ink, orange: C.orange, red: C.red, green: C.green };
  const bg = v === "out" ? "#fff" : map[v]; const col = v === "out" ? C.ink : "#fff";
  return <span style={{ display: "inline-block", background: bg, color: col, border: v === "out" ? `2px solid ${C.ink}` : "none", borderRadius: 999, padding: "8px 22px", fontWeight: 800, fontSize: size }}>{text}</span>;
};
const Badge: React.FC<{ n: string; label: string }> = ({ n, label }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: 14 }}>
    <span style={{ width: 64, height: 64, borderRadius: "50%", background: C.orange, color: "#fff", fontSize: 38, fontWeight: 900, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{n}</span>
    <span style={{ fontSize: 52, fontWeight: 900, color: C.ink }}>{label}</span>
  </div>
);

// シーン枠（縦フィルムストリップの1コマ）
const Scene: React.FC<{ i: number; children: React.ReactNode }> = ({ i, children }) => (
  <div style={{ position: "absolute", top: i * H, left: 0, width: 1080, height: H, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 70px", boxSizing: "border-box" }}>{children}</div>
);

// ── 各シーン（appear = そのシーンにカメラが着くフレーム） ──
const S0: React.FC<{ a: number }> = ({ a }) => (
  <>
    <Rise appear={a} delay={0} style={{ textAlign: "center", marginBottom: 20 }}>
      <div style={{ fontSize: 64, fontWeight: 900, color: C.ink, borderBottom: `8px solid ${C.orange}`, paddingBottom: 6, display: "inline-block" }}>年収の壁</div>
      <div style={{ fontSize: 34, fontWeight: 900, color: C.orange, marginTop: 14 }}>10月から、また変わった</div>
    </Rise>
    <Rise appear={a} delay={8} style={{ fontSize: 34, fontWeight: 800, color: C.ink, marginBottom: 30 }}>実は、壁は“3種類”</Rise>
    <div style={{ display: "flex", flexDirection: "column", gap: 18, width: "100%", maxWidth: 820 }}>
      {[{ n: "税金", s: "自分の所得税・住民税", c: C.orange }, { n: "社会保険", s: "手取りに直結（本命）", c: C.red }, { n: "扶養", s: "夫（家族）の税金", c: C.ink }].map((w, i) => (
        <Pop key={i} appear={a} delay={16 + i * 8}>
          <div style={{ display: "flex", alignItems: "center", gap: 20, background: "#fff", border: `4px solid ${w.c}`, borderRadius: 18, padding: "22px 26px", boxShadow: "0 6px 16px rgba(31,58,95,0.08)" }}>
            <Wall s={56} color={w.c} />
            <div><div style={{ fontSize: 40, fontWeight: 900, color: C.ink }}>{w.n}の壁</div><div style={{ fontSize: 24, fontWeight: 700, color: C.gray }}>{w.s}</div></div>
          </div>
        </Pop>
      ))}
    </div>
    <Rise appear={a} delay={44} style={{ fontSize: 30, fontWeight: 800, color: C.gray, marginTop: 30 }}>分ければ簡単。1つずつ見ていこう 👇</Rise>
  </>
);

const S1: React.FC<{ a: number }> = ({ a }) => (
  <>
    <Rise appear={a} delay={0} style={{ marginBottom: 50 }}><Badge n="①" label="税金の壁" /></Rise>
    <Rise appear={a} delay={10} style={{ display: "flex", alignItems: "flex-end", gap: 24, marginBottom: 40 }}>
      <div style={{ textAlign: "center" }}><div style={{ fontSize: 26, fontWeight: 800, color: C.gray }}>今まで</div><div style={{ fontSize: 60, fontWeight: 900, color: C.gray, position: "relative" }}>103万<div style={{ position: "absolute", top: "50%", left: -4, right: -4, height: 6, background: C.red, transform: "rotate(-8deg)" }} /></div></div>
      <span style={{ fontSize: 40, color: C.orange, paddingBottom: 14 }}>→</span>
      <div style={{ textAlign: "center" }}><div style={{ fontSize: 28, fontWeight: 900, color: C.orange }}>今年2026</div><div style={{ fontSize: 110, fontWeight: 900, color: C.orange, lineHeight: 1 }}>178万</div></div>
    </Rise>
    <Rise appear={a} delay={24} style={{ fontSize: 40, fontWeight: 900, color: C.ink, textAlign: "center", lineHeight: 1.4 }}>税金のために<span style={{ color: C.orange }}>103万で抑える時代</span>は、<br />もう終わり。</Rise>
  </>
);

const S2: React.FC<{ a: number }> = ({ a }) => (
  <>
    <Rise appear={a} delay={0} style={{ marginBottom: 46 }}><Badge n="②" label="社会保険の壁" /></Rise>
    <Rise appear={a} delay={10} style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 30 }}>
      <div style={{ position: "relative" }}><span style={{ fontSize: 60, fontWeight: 900, color: C.gray }}>106万</span><div style={{ position: "absolute", top: "46%", left: -6, right: -6, height: 7, background: C.red, transform: "rotate(-10deg)" }} /></div>
      <Pill text="10月に撤廃" v="red" size={28} />
    </Rise>
    <Rise appear={a} delay={22} style={{ fontSize: 40, fontWeight: 900, color: C.ink, textAlign: "center", lineHeight: 1.4, marginBottom: 36 }}>今は<span style={{ color: C.orange }}>“働く時間”</span>で決まる<br /><span style={{ fontSize: 30, color: C.gray }}>51人以上の会社で・週20時間以上</span></Rise>
    <Pop appear={a} delay={34}><div style={{ display: "inline-flex", alignItems: "center", gap: 14, background: C.redBg, border: `3px solid ${C.red}`, borderRadius: 16, padding: "18px 28px" }}><span style={{ fontSize: 56, fontWeight: 900, color: C.red }}>130万</span><span style={{ fontSize: 32, fontWeight: 900, color: C.red }}>で、夫の扶養を外れる</span></div></Pop>
  </>
);

const S3: React.FC<{ a: number }> = ({ a }) => {
  const cards = [{ y: "128万", t: "約126万", c: C.green, bg: C.greenBg, note: "扶養内" }, { y: "130万超", t: "約108万", c: C.red, bg: C.redBg, note: "−18万!" }, { y: "約150万", t: "約126万", c: C.ink, bg: "#EEF2F7", note: "やっと回復" }];
  return (
    <>
      <Rise appear={a} delay={0} style={{ fontSize: 48, fontWeight: 900, color: C.ink, marginBottom: 14, textAlign: "center" }}>一番“損”するのは、ここ</Rise>
      <Rise appear={a} delay={6} style={{ fontSize: 30, fontWeight: 800, color: C.gray, marginBottom: 36 }}>130万を“ちょっと”超えると…</Rise>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        {cards.map((c, i) => (
          <React.Fragment key={i}>
            <Pop appear={a} delay={14 + i * 12} style={{ width: 290 }}>
              <div style={{ background: c.bg, border: `4px solid ${c.c}`, borderRadius: 18, padding: "20px 10px", textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: C.gray }}>年収</div><div style={{ fontSize: 42, fontWeight: 900, color: C.ink }}>{c.y}</div>
                <div style={{ fontSize: 30, color: c.c, margin: "2px 0" }}>↓</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: C.gray }}>手取り</div><div style={{ fontSize: 50, fontWeight: 900, color: c.c }}>{c.t}</div>
                <div style={{ marginTop: 8, display: "inline-block", background: c.c, color: "#fff", borderRadius: 999, padding: "4px 14px", fontSize: 22, fontWeight: 900 }}>{c.note}</div>
              </div>
            </Pop>
            {i < 2 && <span style={{ fontSize: 36, color: C.gray, alignSelf: "center", paddingTop: 50 }}>→</span>}
          </React.Fragment>
        ))}
      </div>
      <Rise appear={a} delay={56} style={{ fontSize: 38, fontWeight: 900, color: "#fff", background: C.red, borderRadius: 12, padding: "12px 28px", marginTop: 40 }}>“中途半端”が、一番損</Rise>
      <Rise appear={a} delay={64} style={{ fontSize: 24, fontWeight: 700, color: C.gray, marginTop: 18 }}>※勤め先の社保＝保険料 約15%で試算した目安</Rise>
    </>
  );
};

const S4: React.FC<{ a: number }> = ({ a }) => (
  <>
    <Rise appear={a} delay={0} style={{ marginBottom: 46 }}><Badge n="③" label="扶養の壁" /></Rise>
    <Rise appear={a} delay={10} style={{ fontSize: 34, fontWeight: 800, color: C.gray, marginBottom: 28 }}>これは“夫の税金”の話</Rise>
    <Pop appear={a} delay={18}><div style={{ display: "inline-flex", alignItems: "center", gap: 16, background: C.orangeBg, border: `3px solid ${C.orange}`, borderRadius: 16, padding: "22px 30px" }}><span style={{ fontSize: 30, fontWeight: 900, color: C.ink }}>配偶者</span><span style={{ fontSize: 72, fontWeight: 900, color: C.orange }}>136万</span><span style={{ fontSize: 30, fontWeight: 900, color: C.ink }}>まで控除は満額</span></div></Pop>
    <Rise appear={a} delay={30} style={{ fontSize: 28, fontWeight: 700, color: C.gray, marginTop: 24 }}>（169万までは特別控除で満額のまま）</Rise>
  </>
);

const S5: React.FC<{ a: number }> = ({ a }) => (
  <>
    <Rise appear={a} delay={0} style={{ fontSize: 34, fontWeight: 900, color: C.ink, marginBottom: 10, textAlign: "center" }}>でも、安心して。</Rise>
    <Rise appear={a} delay={8} style={{ marginBottom: 40 }}><span style={{ fontSize: 42, fontWeight: 900, color: "#fff", background: C.red, borderRadius: 12, padding: "12px 26px" }}>損が出るのは 130〜150万 の間だけ</span></Rise>
    <Rise appear={a} delay={18} style={{ fontSize: 34, fontWeight: 900, color: C.ink, marginBottom: 20 }}>社保に入れば…</Rise>
    <div style={{ display: "flex", gap: 14, marginBottom: 40 }}>
      {["将来の年金↑", "傷病手当金", "出産手当金"].map((t, i) => (
        <Pop key={i} appear={a} delay={24 + i * 8}><div style={{ background: C.greenBg, border: `3px solid ${C.green}`, borderRadius: 14, padding: "16px 20px", fontSize: 28, fontWeight: 900, color: C.ink }}>{t}</div></Pop>
      ))}
    </div>
    <Rise appear={a} delay={50} style={{ fontSize: 38, fontWeight: 900, color: C.ink, textAlign: "center", lineHeight: 1.4 }}>“壁”で縮こまるより、<br /><span style={{ color: C.orange }}>世帯の手取りと保障</span>で考えよう。</Rise>
  </>
);

// カメラ着地フレーム（各シーン）
const APP = [0, 150, 290, 430, 580, 700];
const END = 840;

export const KabeReel: React.FC = () => {
  const f = useCurrentFrame();
  // カメラY：各シーンのAPPフレームで -i*H へスムーズ移動
  const bpF: number[] = []; const bpY: number[] = [];
  APP.forEach((start, i) => {
    if (i === 0) { bpF.push(0); bpY.push(0); }
    else { bpF.push(start - 16); bpY.push(-(i - 1) * H); bpF.push(start); bpY.push(-i * H); }
  });
  bpF.push(END); bpY.push(-(APP.length - 1) * H);
  const camY = interpolate(f, bpF, bpY, { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const Scenes = [S0, S1, S2, S3, S4, S5];
  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: FONT, overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, width: 1080, height: APP.length * H, transform: `translateY(${camY}px)` }}>
        {Scenes.map((Sc, i) => <Scene key={i} i={i}><Sc a={APP[i]} /></Scene>)}
      </div>
    </AbsoluteFill>
  );
};
