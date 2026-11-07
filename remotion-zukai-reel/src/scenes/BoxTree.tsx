import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Background } from "../components/Layout";
import { FONT } from "../components/font";
import { COLORS } from "../theme";

export const BOXTREE_FRAMES = 260;

const draw = (f: number, start: number, dur: number) => {
  const x = Math.max(0, Math.min(1, (f - start) / dur));
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
};
const DrawPath: React.FC<{ d: string; s: number; w?: number; c?: string }> = ({ d, s, w = 5, c = COLORS.ink }) => (
  <path d={d} fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - s} opacity={s > 0.001 ? 1 : 0} />
);

// 出現ラッパ（フェード＋少し拡大）
const In: React.FC<{ delay: number; children: React.ReactNode; style?: React.CSSProperties; pop?: boolean }> = ({ delay, children, style, pop }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: pop ? { damping: 14, mass: 0.7 } : { damping: 200 }, durationInFrames: pop ? 26 : 24 });
  return (
    <div style={{ position: "absolute", opacity: Math.min(1, s * 1.4), transform: pop ? `scale(${s})` : `translateY(${(1 - s) * 20}px)`, transformOrigin: "center", ...style }}>
      {children}
    </div>
  );
};

const abs = (cx: number, top: number, w: number): React.CSSProperties => ({ left: cx - w / 2, top, width: w });

export const BoxTree: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Background>
      <AbsoluteFill style={{ fontFamily: FONT }}>
        {/* 接続線レイヤー */}
        <svg width="1080" height="1920" style={{ position: "absolute" }}>
          {/* header下 → バス → 2箱 */}
          <DrawPath d="M540 470 L540 560" s={draw(f, 34, 16)} />
          <DrawPath d="M300 560 L780 560" s={draw(f, 48, 16)} />
          <DrawPath d="M300 560 L300 610" s={draw(f, 62, 12)} />
          <DrawPath d="M780 560 L780 610" s={draw(f, 62, 12)} />
          {/* 2箱下 → 合流 → 結論へ */}
          <DrawPath d="M300 740 L300 800 L540 800" s={draw(f, 96, 16)} c={COLORS.accent} w={6} />
          <DrawPath d="M780 740 L780 800 L540 800" s={draw(f, 96, 16)} c={COLORS.accent} w={6} />
          <DrawPath d="M540 800 L540 860" s={draw(f, 112, 12)} c={COLORS.accent} w={6} />
        </svg>

        {/* 枠見出し */}
        <In delay={2} style={abs(540, 210, 700)}>
          <div style={{ border: `5px solid ${COLORS.ink}`, borderRadius: 18, backgroundColor: "#fff", padding: "26px 30px", display: "flex", alignItems: "center", gap: 22, justifyContent: "center" }}>
            <div style={{ width: 11, height: 60, backgroundColor: COLORS.accent, borderRadius: 4 }} />
            <div style={{ fontSize: 54, fontWeight: 700, color: COLORS.ink }}>500万円の車の買い方</div>
          </div>
          <div style={{ textAlign: "center", fontSize: 30, fontWeight: 700, color: "#6C7A93", marginTop: 12 }}>現金 or ローン、どっちが得？</div>
        </In>

        {/* 2つの箱 */}
        <In delay={64} pop style={abs(300, 610, 300)}>
          <div style={{ border: `4px solid ${COLORS.ink}`, borderRadius: 16, backgroundColor: "#fff", padding: "22px 0", textAlign: "center", fontSize: 44, fontWeight: 700, color: COLORS.ink }}>現金一括</div>
        </In>
        <In delay={76} pop style={abs(780, 610, 300)}>
          <div style={{ border: `4px solid ${COLORS.accent}`, borderRadius: 16, backgroundColor: COLORS.accent, padding: "22px 0", textAlign: "center", fontSize: 44, fontWeight: 700, color: "#fff" }}>銀行ローン</div>
        </In>

        {/* 結論の大テキスト */}
        <In delay={122} style={abs(540, 890, 960)}>
          <div style={{ textAlign: "center", fontSize: 76, fontWeight: 700, color: COLORS.ink, lineHeight: 1.2 }}>
            ローンで買って<span style={{ color: COLORS.accent }}>運用</span>
          </div>
        </In>

        {/* 赤い強調数字＋注記 */}
        <In delay={150} style={abs(540, 1040, 960)}>
          <div style={{ textAlign: "center", fontSize: 100, fontWeight: 700, color: COLORS.accent, lineHeight: 1.1 }}>＋約270万円 お得</div>
        </In>
        <In delay={168} style={abs(540, 1170, 960)}>
          <div style={{ textAlign: "center", fontSize: 30, fontWeight: 700, color: "#6C7A93" }}>※運用益 約330万 − 利息 約52万・数字は一例</div>
        </In>

        {/* 下のpill */}
        <In delay={192} pop style={abs(540, 1250, 820)}>
          <div style={{ backgroundColor: COLORS.ink, color: "#fff", borderRadius: 20, padding: "26px 0", textAlign: "center", fontSize: 48, fontWeight: 700 }}>
            浮いた現金は“債券”で増やす
          </div>
        </In>
      </AbsoluteFill>
    </Background>
  );
};
