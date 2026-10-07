import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { FONT } from "./components/font";

// ───────────────────────────────────────────────────────────────
// 締めシーン①：釣り型・分岐図（まず勤務先の社保の条件チェック）
//   条件チップ3つ(アイコン付)横並び → 満たす=加入 / 満たさない=130万で分岐。
//   出現はポンポン(stagger)＋注意ノードはパルス。断定回避。
// ───────────────────────────────────────────────────────────────
const C = { bg: "#FCFBF7", ink: "#1F3A5F", orange: "#E8912D", red: "#E0483B", green: "#2E9E6B", gray: "#AEB8C2", grayBg: "#EEF1F4", redBg: "#FCE6E3", greenBg: "#E4F3EC" };
// 締め音声(kabe_close.wav)シーン①に同期。dur=358(≒11.95s)
export const KABEBRANCH_FRAMES = 360;

const Pop: React.FC<{ delay: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ delay, style, children }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const s = spring({ frame: f - delay, fps, config: { damping: 11, stiffness: 160, mass: 0.7 }, durationInFrames: 12 });
  return <div style={{ opacity: Math.min(1, s * 2), transform: `scale(${s})`, transformOrigin: "center", ...style }}>{children}</div>;
};
const usePulse = (on: boolean, amp = 0.05, spd = 7) => { const f = useCurrentFrame(); return on ? 1 + (Math.sin(f / spd) * 0.5 + 0.5) * amp : 1; };
const Draw: React.FC<{ d: string; delay: number; dur?: number; color?: string; w?: number }> = ({ d, delay, dur = 12, color = C.orange, w = 5 }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [delay, delay + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} opacity={p > 0.001 ? 1 : 0} />;
};
const GenImg: React.FC<{ name: string; w: number; delay?: number; float?: number; style?: React.CSSProperties }> = ({ name, w, delay = 0, float = 5, style }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const s = spring({ frame: f - delay, fps, config: { damping: 12, stiffness: 140, mass: 0.8 }, durationInFrames: 14 });
  const fy = Math.sin((f - delay) / 22) * float;
  return <Img src={staticFile(`gen/${name}.png`)} style={{ width: w, height: "auto", objectFit: "contain", opacity: Math.min(1, s * 1.7), transform: `translateY(${(1 - s) * 16 + fy}px) scale(${0.9 + s * 0.1})`, ...style }} />;
};
const Tag: React.FC<{ t: string; c: string }> = ({ t, c }) => (
  <span style={{ fontSize: 24, fontWeight: 900, color: "#fff", background: c, borderRadius: 999, padding: "6px 20px" }}>{t}</span>
);

export const KabeBranch: React.FC = () => {
  const redPulse = usePulse(true, 0.05, 7);
  const chips = [
    { img: "kabe_company_building", t: "51人以上の会社など" },
    { img: "kabe_clock_20h", t: "週20時間以上" },
    { img: "kabe_check", t: "その他条件あり" },
  ];
  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: FONT, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(125% 80% at 50% -5%, #FFFDF8 0%, #FAF6EC 55%, #F1EBDD 100%)" }} />
      <Pop delay={2} style={{ position: "absolute", top: 100, left: 0, width: 1080, textAlign: "center" }}>
        <div style={{ fontSize: 28, fontWeight: 900, color: C.red }}>最後に、ここだけ整理</div>
        <div style={{ fontSize: 46, fontWeight: 900, color: C.ink, marginTop: 6 }}>まずは<span style={{ color: C.red }}>勤務先の社保</span>の条件チェック</div>
      </Pop>

      {/* 条件ボックス（アイコン付チップ3つ）：3.6s「まずチェック…条件」 */}
      <Pop delay={108} style={{ position: "absolute", top: 272, left: 70, width: 940 }}>
        <div style={{ background: "#fff", border: `3px solid ${C.orange}`, borderRadius: 20, padding: "14px 16px", boxShadow: "0 6px 16px rgba(31,58,95,0.08)" }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: C.orange, textAlign: "center", marginBottom: 10 }}>勤務先の社会保険の条件</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
            {chips.map((c, i) => (
              <div key={i} style={{ width: 288, background: C.orange + "14", border: `2px solid ${C.orange}`, borderRadius: 14, padding: "12px 6px", textAlign: "center" }}>
                <GenImg name={c.img} w={88} delay={116 + i * 13} style={{ margin: "0 auto", display: "block", maxHeight: 88 }} />
                <div style={{ fontSize: 23, fontWeight: 900, color: C.ink, marginTop: 4 }}>{c.t}</div>
              </div>
            ))}
          </div>
        </div>
      </Pop>

      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <Draw d="M540 548 L540 596" delay={168} color={C.orange} />
        <Draw d="M300 596 L780 596 M300 596 L300 628 M780 596 L780 628" delay={174} color={C.orange} />
        <Draw d="M780 760 L780 806" delay={258} color={C.ink} />
        <Draw d="M780 936 L780 982" delay={312} color={C.red} />
      </svg>

      {/* 満たす → 加入（split：6.3s頃） */}
      <Pop delay={186} style={{ position: "absolute", top: 616, left: 110, width: 370, textAlign: "center" }}>
        <Tag t="満たす" c={C.green} />
        <div style={{ marginTop: 10, background: C.greenBg, border: `4px solid ${C.green}`, borderRadius: 16, padding: "12px 10px" }}>
          <GenImg name="kabe_shaho_card" w={110} delay={192} style={{ margin: "0 auto", display: "block" }} />
          <div style={{ fontSize: 30, fontWeight: 900, color: C.green, marginTop: 2 }}>社会保険に加入</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.gray, marginTop: 2 }}>（130万未満でも入ることも）</div>
        </div>
      </Pop>

      {/* 満たさない → 130万で分岐：6.6s「満たさない人は」 */}
      <Pop delay={195} style={{ position: "absolute", top: 616, left: 600, width: 370, textAlign: "center" }}><Tag t="満たさない" c={C.gray} /></Pop>
      {/* 130万未満 → 扶養内：7.3s「130万円未満なら夫の扶養内」 */}
      <Pop delay={219} style={{ position: "absolute", top: 696, left: 520, width: 500 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: C.grayBg, border: `3px solid ${C.gray}`, borderRadius: 14, padding: "10px 14px" }}>
          <GenImg name="kabe_couple" w={60} delay={223} float={3} />
          <span style={{ fontSize: 28, fontWeight: 900, color: C.ink, minWidth: 148 }}>130万未満</span>
          <span style={{ fontSize: 24, color: C.gray }}>→</span>
          <span style={{ fontSize: 26, fontWeight: 900, color: C.ink }}>夫の扶養内</span>
        </div>
      </Pop>
      {/* 130万以上 → 扶養から外れる（★パルス）：9.6s「でも130万を超えると…外れて」 */}
      <div style={{ position: "absolute", top: 820, left: 520, width: 500, transform: `scale(${redPulse})`, transformOrigin: "center" }}>
        <Pop delay={287}>
          <div style={{ background: C.redBg, border: `4px solid ${C.red}`, borderRadius: 14, padding: "10px 14px", boxShadow: `0 8px 20px ${C.red}33` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <GenImg name="kabe_leave_fuyo" w={62} delay={291} float={3} />
              <span style={{ fontSize: 27, fontWeight: 900, color: C.red, minWidth: 120 }}>130万以上</span>
              <span style={{ fontSize: 22, color: C.red }}>→</span>
              <span style={{ fontSize: 23, fontWeight: 900, color: C.ink, whiteSpace: "nowrap" }}>夫の扶養から外れる</span>
            </div>
          </div>
        </Pop>
      </div>
      {/* 入れない場合は国保（図解補足・外れるの直後に）：10.8s */}
      <Pop delay={324} style={{ position: "absolute", top: 990, left: 520, width: 500 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#fff", border: `2px dashed ${C.red}`, borderRadius: 12, padding: "10px 12px" }}>
          <GenImg name="kabe_nenkin_kokuho_paper" w={66} delay={328} float={3} />
          <div style={{ fontSize: 23, fontWeight: 900, color: C.ink, lineHeight: 1.3, textAlign: "left" }}>入れない場合は<br />国民年金＋国保を<span style={{ color: C.red }}>自分で負担</span></div>
        </div>
      </Pop>

      <Pop delay={130} style={{ position: "absolute", top: 1200, left: 90, width: 900, textAlign: "left" }}>
        {["※2026年10月時点", "※詳しい加入条件は勤務先などで確認してください"].map((n, i) => (
          <div key={i} style={{ fontSize: 20, fontWeight: 700, color: C.gray, marginBottom: 6 }}>{n}</div>
        ))}
      </Pop>
    </AbsoluteFill>
  );
};
