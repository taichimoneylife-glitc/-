import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { FONT } from "./components/font";

// ═══════════════════════════════════════════════════════════════════
// NISA 亡くなったら｜図解【設計図】（静止画レビュー用・レイアウト確認）
//   page プロップで1枚ずつ描画。録音前なので音声同期なし＝レイアウトの確定が目的。
//   恒久ルール：上部セーフマージン TOP_SAFE、カード型＋やわ影、連結ツリー。
// ═══════════════════════════════════════════════════════════════════
const C = {
  bg: "#FCFBF7", ink: "#1F3A5F", sub: "#5B6B7F",
  orange: "#E8912D", red: "#E0483B", green: "#2E9E6B",
  blue: "#3B7DD8", gold: "#E0A72E", gray: "#AEB8C2", line: "#C9D2DD",
  blueBg: "#E7F0FB", greenBg: "#E4F3EC", redBg: "#FCE6E3", goldBg: "#FBF1D9",
};
const TOP_SAFE = 130;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const NISA_DESIGN_FRAMES = 120;

const Bg: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.bg }}>
    <AbsoluteFill style={{ background: "radial-gradient(1200px 1200px at 50% -10%, #FFFFFF 0%, rgba(255,255,255,0) 60%)" }} />
  </AbsoluteFill>
);

const Pop: React.FC<{ at?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at = 0, children, style }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - at, fps, config: { damping: 13, stiffness: 150, mass: 0.8 }, durationInFrames: 14 });
  return <div style={{ opacity: Math.min(1, s * 1.5), transform: `translateY(${(1 - Math.min(1, s)) * 14}px)`, ...style }}>{children}</div>;
};

const Head: React.FC<{ kicker: string; title: React.ReactNode; kc?: string }> = ({ kicker, title, kc = C.blue }) => (
  <div style={{ textAlign: "center", padding: "0 48px" }}>
    <div style={{ display: "inline-block", background: kc, color: "#fff", fontWeight: 800, fontSize: 34, padding: "8px 26px", borderRadius: 999, boxShadow: "0 8px 18px rgba(0,0,0,0.14)" }}>{kicker}</div>
    <div style={{ marginTop: 18, fontWeight: 900, fontSize: 58, lineHeight: 1.22, color: C.ink, letterSpacing: 0.5 }}>{title}</div>
  </div>
);

// ── 縦ツリーの1ノード（カード）──
const Node: React.FC<{ no?: number | string; title: React.ReactNode; sub?: React.ReactNode; color?: string; bg?: string; w?: number }> = ({ no, title, sub, color = C.ink, bg = "#fff", w = 760 }) => (
  <div style={{ width: w, background: bg, borderRadius: 22, boxShadow: "0 10px 24px rgba(31,58,95,0.12)", border: `2px solid ${C.line}`, padding: "18px 24px", display: "flex", alignItems: "center", gap: 18 }}>
    {no !== undefined && (
      <div style={{ flexShrink: 0, width: 56, height: 56, borderRadius: "50%", background: color, color: "#fff", fontWeight: 900, fontSize: 30, display: "flex", alignItems: "center", justifyContent: "center" }}>{no}</div>
    )}
    <div style={{ textAlign: "left" }}>
      <div style={{ fontWeight: 900, fontSize: 38, color: C.ink, lineHeight: 1.2 }}>{title}</div>
      {sub && <div style={{ fontWeight: 700, fontSize: 26, color: C.sub, marginTop: 2 }}>{sub}</div>}
    </div>
  </div>
);

const Connector: React.FC<{ color?: string }> = ({ color = C.gray }) => (
  <div style={{ width: 6, height: 26, background: color, borderRadius: 3, margin: "6px auto" }} />
);

// ══════════ P2：全体像＝相続の流れ（縦ツリー）＋「売れない」帯 ══════════
const PageFlow: React.FC = () => (
  <div style={{ paddingTop: 40 }}>
    <Head kicker="全体像" title={<>NISAの相続、<span style={{ color: C.blue }}>流れはこう</span></>} />
    <div style={{ position: "relative", marginTop: 28, display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* 右の「売れない」帯（STEP2〜5をまたぐ） */}
      <div style={{ position: "absolute", right: 24, top: 150, bottom: 150, width: 92, background: C.redBg, border: `2px solid ${C.red}`, borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ writingMode: "vertical-rl", fontWeight: 900, fontSize: 32, color: C.red, letterSpacing: 4 }}>この間ずっと売れない</div>
      </div>

      <Pop at={0}><Node no="1" title="名義人が亡くなる" color={C.ink} w={700} /></Pop>
      <Connector />
      <Pop at={4}><Node no="2" title="証券会社に連絡" sub="口座ストップ（売却・積立が止まる）" color={C.red} w={700} /></Pop>
      <Connector />
      <Pop at={8}><Node no="3" title="死亡届出書を提出" sub="※書類は金融機関で異なる" color={C.blue} w={700} /></Pop>
      <Connector />
      <Pop at={12}><Node no="4" title="継ぐ人を決める・書類をそろえる" color={C.blue} w={700} /></Pop>
      <Connector />
      <Pop at={16}><Node no="5" title="相続人の「課税口座」へ移管" color={C.blue} w={700} /></Pop>
      <Connector color={C.green} />
      <Pop at={20}><Node no="✓" title="やっと売れる" color={C.green} bg={C.greenBg} w={700} /></Pop>
    </div>
  </div>
);

// ══════════ P6：取得価額が“亡くなった日”に（損／益の対比・山場） ══════════
const Step: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
  <div style={{ textAlign: "center" }}>
    <div style={{ fontWeight: 700, fontSize: 24, color: C.sub }}>{label}</div>
    <div style={{ fontWeight: 900, fontSize: 44, color, lineHeight: 1.1 }}>{value}</div>
  </div>
);
const Arrow: React.FC = () => <div style={{ fontWeight: 900, fontSize: 40, color: C.gray }}>→</div>;

const PagePrice: React.FC = () => (
  <div style={{ paddingTop: 40 }}>
    <Head kicker="ここが落とし穴" title={<>引き継ぐ値段が<br /><span style={{ color: C.red }}>“亡くなった日”</span>に変わる</>} kc={C.red} />
    {/* 損のケース（主役） */}
    <Pop at={6} style={{ marginTop: 30, display: "flex", justifyContent: "center" }}>
      <div style={{ width: 880, background: "#fff", border: `3px solid ${C.red}`, borderRadius: 26, boxShadow: "0 14px 30px rgba(224,72,59,0.18)", padding: "22px 28px 26px" }}>
        <div style={{ display: "inline-block", background: C.red, color: "#fff", fontWeight: 800, fontSize: 28, padding: "6px 20px", borderRadius: 999 }}>損したパターン</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20, padding: "0 6px" }}>
          <Step label="買ったとき" value="100万" color={C.ink} />
          <Arrow />
          <Step label="亡くなった日" value="40万" color={C.red} />
          <Arrow />
          <Step label="戻して売る" value="100万" color={C.ink} />
        </div>
        <div style={{ marginTop: 20, textAlign: "center", background: C.redBg, borderRadius: 16, padding: "16px 0" }}>
          <span style={{ fontWeight: 800, fontSize: 30, color: C.ink }}>戻っただけなのに </span>
          <span style={{ fontWeight: 900, fontSize: 56, color: C.red }}>約12万円</span>
          <span style={{ fontWeight: 800, fontSize: 30, color: C.ink }}> 課税</span>
          <div style={{ fontWeight: 700, fontSize: 24, color: C.sub, marginTop: 4 }}>※損（60万）は「なかったこと」に</div>
        </div>
      </div>
    </Pop>
    {/* 益のケース（小さく・安心材料） */}
    <Pop at={12} style={{ marginTop: 20, display: "flex", justifyContent: "center" }}>
      <div style={{ width: 880, background: C.greenBg, border: `2px solid ${C.green}`, borderRadius: 22, padding: "16px 28px", display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
        <span style={{ fontWeight: 800, fontSize: 28, color: C.green }}>逆に増えてたら得 ▶</span>
        <span style={{ fontWeight: 900, fontSize: 34, color: C.ink }}>300万→500万 の利益200万は</span>
        <span style={{ fontWeight: 900, fontSize: 36, color: C.green }}>非課税</span>
      </div>
    </Pop>
  </div>
);

const PAGES: Record<number, React.FC> = { 2: PageFlow, 6: PagePrice };

export const NisaSozokuDesign: React.FC<{ page?: number }> = ({ page = 2 }) => {
  const P = PAGES[page] ?? PageFlow;
  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <Bg />
      <AbsoluteFill style={{ transform: `translateY(${TOP_SAFE}px)` }}>
        <P />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
