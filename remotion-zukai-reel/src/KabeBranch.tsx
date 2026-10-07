import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { FONT } from "./components/font";

// ───────────────────────────────────────────────────────────────
// 締めシーン①：釣り型・分岐図（まず勤務先の社保の条件チェック）
//   条件チップ3つを横並び → 満たす=加入 / 満たさない=130万で分岐。
//   断定しない：条件は「など／その他条件あり」、130万以上は
//   「入れない場合は国民年金＋国保を自分で」と前提を明記。
// ───────────────────────────────────────────────────────────────
const C = { bg: "#FCFBF7", ink: "#1F3A5F", orange: "#E8912D", red: "#E0483B", green: "#2E9E6B", gray: "#AEB8C2", grayBg: "#EEF1F4", line: "#C9D2DD", redBg: "#FCE6E3", greenBg: "#E4F3EC" };

export const KABEBRANCH_FRAMES = 540;

const Pop: React.FC<{ delay: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ delay, style, children }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const s = spring({ frame: f - delay, fps, config: { damping: 12, stiffness: 150, mass: 0.7 }, durationInFrames: 12 });
  return <div style={{ opacity: Math.min(1, s * 2), transform: `scale(${s})`, transformOrigin: "center", ...style }}>{children}</div>;
};
const Draw: React.FC<{ d: string; delay: number; dur?: number; color?: string; w?: number }> = ({ d, delay, dur = 10, color = C.line, w = 5 }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [delay, delay + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} opacity={p > 0.001 ? 1 : 0} />;
};
const Tag: React.FC<{ t: string; c: string }> = ({ t, c }) => (
  <span style={{ fontSize: 24, fontWeight: 900, color: "#fff", background: c, borderRadius: 999, padding: "6px 20px" }}>{t}</span>
);

export const KabeBranch: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: FONT, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(125% 80% at 50% -5%, #FFFDF8 0%, #FAF6EC 55%, #F1EBDD 100%)" }} />
      {/* 見出し */}
      <Pop delay={2} style={{ position: "absolute", top: 110, left: 0, width: 1080, textAlign: "center" }}>
        <div style={{ fontSize: 28, fontWeight: 900, color: C.red }}>最後に、ここだけ整理</div>
        <div style={{ fontSize: 46, fontWeight: 900, color: C.ink, marginTop: 6 }}>まずは<span style={{ color: C.red }}>勤務先の社保</span>の条件チェック</div>
      </Pop>

      {/* 条件ボックス（チップ3つ横並び） */}
      <Pop delay={10} style={{ position: "absolute", top: 300, left: 90, width: 900 }}>
        <div style={{ background: "#fff", border: `3px solid ${C.orange}`, borderRadius: 20, padding: "16px 18px", boxShadow: "0 6px 16px rgba(31,58,95,0.08)" }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: C.orange, textAlign: "center", marginBottom: 12 }}>勤務先の社会保険の条件</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
            {["51人以上の会社など", "週20時間以上", "その他条件あり"].map((t, i) => (
              <span key={i} style={{ fontSize: 23, fontWeight: 900, color: C.ink, background: C.orange + "1F", border: `2px solid ${C.orange}`, borderRadius: 12, padding: "10px 14px" }}>{t}</span>
            ))}
          </div>
        </div>
      </Pop>

      {/* 連結線 */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <Draw d="M540 492 L540 540" delay={22} color={C.orange} />
        <Draw d="M300 540 L780 540 M300 540 L300 572 M780 540 L780 572" delay={26} dur={14} color={C.orange} />
        <Draw d="M780 700 L780 740" delay={70} color={C.ink} />
        <Draw d="M780 860 L780 900" delay={110} color={C.red} />
      </svg>

      {/* 満たす → 加入 */}
      <Pop delay={36} style={{ position: "absolute", top: 560, left: 120, width: 360, textAlign: "center" }}>
        <Tag t="満たす" c={C.green} />
        <div style={{ marginTop: 10, background: C.greenBg, border: `4px solid ${C.green}`, borderRadius: 16, padding: "14px 10px" }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: C.ink }}>勤務先の</div>
          <div style={{ fontSize: 30, fontWeight: 900, color: C.green }}>社会保険に加入</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.gray, marginTop: 4 }}>（130万未満でも入ることも）</div>
        </div>
      </Pop>

      {/* 満たさない → 130万で分岐 */}
      <Pop delay={56} style={{ position: "absolute", top: 560, left: 600, width: 360, textAlign: "center" }}>
        <Tag t="満たさない" c={C.gray} />
      </Pop>
      {/* 130万未満 → 扶養内 */}
      <Pop delay={70} style={{ position: "absolute", top: 650, left: 540, width: 480 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, background: C.grayBg, border: `3px solid ${C.gray}`, borderRadius: 14, padding: "12px 16px" }}>
          <span style={{ fontSize: 30, fontWeight: 900, color: C.ink, minWidth: 150 }}>130万未満</span>
          <span style={{ fontSize: 26, color: C.gray }}>→</span>
          <span style={{ fontSize: 28, fontWeight: 900, color: C.ink }}>夫の扶養内</span>
        </div>
      </Pop>
      {/* 130万以上 → 扶養から外れる */}
      <Pop delay={110} style={{ position: "absolute", top: 780, left: 540, width: 480 }}>
        <div style={{ background: C.redBg, border: `4px solid ${C.red}`, borderRadius: 14, padding: "12px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 30, fontWeight: 900, color: C.red, minWidth: 150 }}>130万以上</span>
            <span style={{ fontSize: 26, color: C.red }}>→</span>
            <span style={{ fontSize: 26, fontWeight: 900, color: C.ink }}>夫の扶養から外れる</span>
          </div>
        </div>
      </Pop>
      {/* 入れない場合は国民年金＋国保 */}
      <Pop delay={140} style={{ position: "absolute", top: 930, left: 540, width: 480, textAlign: "center" }}>
        <div style={{ fontSize: 24, fontWeight: 900, color: C.ink, background: "#fff", border: `2px dashed ${C.red}`, borderRadius: 12, padding: "10px 14px", lineHeight: 1.35 }}>
          勤務先の社保に<span style={{ color: C.red }}>入れない場合</span>は<br />国民年金＋国保を<span style={{ color: C.red }}>自分で負担</span>
        </div>
      </Pop>

      {/* 注釈 */}
      <Pop delay={170} style={{ position: "absolute", top: 1160, left: 90, width: 900, textAlign: "left" }}>
        {["※2026年10月時点", "※詳しい加入条件は勤務先などで確認してください"].map((n, i) => (
          <div key={i} style={{ fontSize: 20, fontWeight: 700, color: C.gray, marginBottom: 6 }}>{n}</div>
        ))}
      </Pop>
    </AbsoluteFill>
  );
};
