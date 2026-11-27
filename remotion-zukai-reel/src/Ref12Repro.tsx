import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FONT, FONT_SERIF, FONT_BLACK } from "./components/font";
import { at, pillPop, pillFade, titleSlam, Words, Typed, INPUT_GAPS, GrowPath, suckIn, cardIn, windowRise, Dissolve, HalftoneWipe, curtainTop, motionBlur } from "./components/flowKit";

// ════════════════════════════════════════════════════════════════════
//  参考⑫の再現（本物と1コマずつ並べて確かめる用）。コマ番号は本物と同じ（30fps）。
//  見た目は確認のために本物に寄せている（赤い背景・明朝）。本番では太一のノートの見た目に差し替えて、動きだけ使う。
// ════════════════════════════════════════════════════════════════════
const CREAM = "#FFF1D6";
const GLOW = "0 0 10px rgba(255,236,200,0.85), 0 0 26px rgba(255,200,150,0.45)";
const RedBg: React.FC = () => <AbsoluteFill style={{ background: "radial-gradient(circle at 30% 18%, #C8261A 0%, #A3130C 45%, #7E0C07 100%)" }} />;
const Txt: React.FC<{ x: number; y: number; size: number; serif?: boolean; children: React.ReactNode; style?: React.CSSProperties }> = ({ x, y, size, serif, children, style }) => (
  <div style={{ position: "absolute", left: x - 600, top: y - size * 0.6, width: 1200, textAlign: "center", fontFamily: serif ? FONT_SERIF : FONT_BLACK, fontWeight: 900, fontSize: size, color: CREAM, textShadow: GLOW, lineHeight: 1.2, whiteSpace: "nowrap", ...style }}>{children}</div>
);
const Pill: React.FC<{ x: number; y: number; w: number; h: number; size: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ x, y, w, h, size, children, style }) => (
  <div style={{ position: "absolute", left: x - w / 2, top: y - h / 2, width: w, height: h, borderRadius: h / 2, border: `4px solid ${CREAM}`, background: "rgba(120,10,6,0.55)", boxShadow: `0 0 14px rgba(255,220,180,0.7), inset 0 0 10px rgba(255,200,160,0.25)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_BLACK, fontWeight: 900, fontSize: size, color: CREAM, textShadow: GLOW, boxSizing: "border-box", ...style }}>{children}</div>
);

// ── A：まず Opus 5.5 → 安い・早い・上手い → コスパ最強（f500〜620）──
// カメラ：本物の動きを、測った1コマごとの移動量でつないだもの（f600の画面＝0,0）
const moves: [number, number[], number, number][] = [
  // [始まるコマ, 1コマごとの割合, 全体のx, 全体のy]
  [518, [9, 32, 250, 30, 6], 327, -150],
  [532, [20, 60, 128, 68], -276, 0],
  [551, [6, 27, 101, 101, 46, 4], -285, 0],
  [566, [5, 24, 60, 80, 60, 25, 12], 274, -63],
];
const camA = (f: number) => {
  let x = -40, y = 213, v = 0;
  for (const [s, d, dx, dy] of moves) {
    const tot = d.reduce((a, b) => a + b, 0);
    let c = 0;
    for (let i = 0; i < d.length; i++) { if (f >= s + i) c += d[i]; }
    x += dx * (c / tot); y += dy * (c / tot);
    const i = f - s; if (i >= 0 && i < d.length) v = Math.hypot(dx, dy) * d[i] / tot;
  }
  return { x, y, v };
};
const SegA: React.FC = () => {
  const f = useCurrentFrame();
  const c = camA(f), b = motionBlur(c.v);
  return (
    <AbsoluteFill>
      <RedBg />
      <div style={{ position: "absolute", inset: 0, transform: `translate(${c.x}px, ${c.y}px)`, filter: b ? `blur(${b}px)` : undefined }}>
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <path d="M540 270 L540 180 L1400 180" fill="none" stroke={CREAM} strokeWidth={5} style={{ filter: `drop-shadow(0 0 6px ${CREAM})` }} />
          <path d="M540 645 L540 735 M540 825 L540 955" fill="none" stroke={CREAM} strokeWidth={5} style={{ filter: `drop-shadow(0 0 6px ${CREAM})` }} />
          <GrowPath d="M272 1090 L272 1125 L540 1125" start={560} />
          <GrowPath d="M808 1090 L808 1125 L540 1125 L540 1165" start={560} />
        </svg>
        <Txt x={540} y={325} size={50}>まず</Txt>
        <Pill x={540} y={472} w={398} h={135} size={70} style={{ fontFamily: FONT }}>Opus 5.5</Pill>
        <Txt x={540} y={600} size={52}>を使ってください</Txt>
        <Txt x={540} y={778} size={56}>なんでかっていうと</Txt>
        {([["安い", 272, 518], ["早い", 542, 534], ["上手い", 808, 553]] as const).map(([t, x, s]) => (
          <div key={t} style={{ position: "absolute", left: x - 113, top: 960, width: 226, height: 130, ...(t === "安い" ? pillFade(f, s) : pillPop(f, s)) }}><Pill x={113} y={65} w={226} h={130} size={62}>{t}</Pill></div>
        ))}
        <div style={{ position: "absolute", left: 0, top: 1140, width: 1080, display: "flex", justifyContent: "center" }}>
          <div style={{ fontFamily: FONT_SERIF, fontWeight: 900, fontSize: 200, color: CREAM, textShadow: GLOW, lineHeight: 1, ...titleSlam(f, 566) }}>コスパ最強</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── B：言葉ごとに出る（「Claudeで動画が完成するまでの」f184〜215）＋短い線 ──
const SegB: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <RedBg />
      <div style={{ position: "absolute", left: 140, top: 510, fontFamily: FONT_SERIF, fontWeight: 900, fontSize: 56, color: CREAM, textShadow: GLOW }}>
        <Words words={[["Claudeで", 185], ["動画が", 189], ["完成する", 200], ["までの", 200]]} />
      </div>
      <div style={{ position: "absolute", left: 245, top: 760, width: 130, height: 130, borderRadius: 26, background: "#F6E9D8", boxShadow: GLOW }} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}><GrowPath d="M390 825 L780 825" start={193} w={5} /></svg>
      {f >= 196 ? <div style={{ position: "absolute", left: 790, top: 690, width: 240, height: 400, borderRadius: 16, background: "#222", border: `3px solid ${CREAM}`, ...cardIn(f, 196) }} /> : null}
    </AbsoluteFill>
  );
};

// ── C：入力欄に打ち込む（f703〜790）──
const SegC: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <RedBg />
      <div style={{ position: "absolute", left: 160, top: 900, width: 860, height: 400, background: "rgba(255,225,225,0.55)", borderRadius: 24, transform: "rotate(-8deg)", filter: "blur(3px)" }} />
      <div style={{ position: "absolute", left: 100, top: 990, width: 870, height: 190, background: "#fff", borderRadius: 24, boxShadow: "0 10px 30px rgba(0,0,0,0.25)", padding: "34px 36px", boxSizing: "border-box", fontFamily: FONT, fontWeight: 700, fontSize: 32, color: "#222" }}>
        <Typed text="音声撮ってAI作業部屋フォルダに入れたんで、" start={703} gaps={INPUT_GAPS} caretColor="#222" />
      </div>
    </AbsoluteFill>
  );
};

// ── D：長いプロンプトがフォルダに吸い込まれる（f1886〜1905）──
const SegD: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <RedBg />
      <div style={{ position: "absolute", left: 539 - 434, top: 1069 - 269, width: 868, height: 538, background: "#fff", borderRadius: 18, transformOrigin: "50% 50%", ...suckIn(f, 1884) }}>
        <div style={{ padding: 30, fontFamily: FONT, fontSize: 22, lineHeight: 1.5, color: "#333" }}>あなたはプロの動画編集者です。これから渡す音声をカットしてください。カットする時は、言い直しを消して、間は0.1秒くらい残して…（長いプロンプト）</div>
      </div>
      <div style={{ position: "absolute", left: 400, top: 1180, width: 290, height: 215, borderRadius: 18, background: "linear-gradient(#E8553B,#B8241A)", boxShadow: GLOW }} />
    </AbsoluteFill>
  );
};

// ── E：網目で切り替わる（f170〜184）──
const SegE: React.FC = () => (
  <AbsoluteFill style={{ background: "#F3E4B4" }}>
    <div style={{ position: "absolute", left: 300, top: 900, width: 480, height: 800, background: "#2E5E50", borderRadius: 40 }} />
    <HalftoneWipe start={174} />
  </AbsoluteFill>
);

// ── F：見出しの打ち込み＋窓が上がる（f1384〜1432）──
const SegF: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <RedBg />
      <div style={{ position: "absolute", left: 110, top: 700, fontFamily: FONT_SERIF, fontWeight: 900, fontSize: 44, color: CREAM, textShadow: GLOW }}><Typed text="僕のフォルダはこういう構造" start={1390} caretColor={CREAM} /></div>
      <div style={{ position: "absolute", left: 104, top: 804, width: 870, height: 866, borderRadius: 22, border: `4px solid ${CREAM}`, background: "rgba(110,8,4,0.5)", boxShadow: `0 0 18px rgba(255,220,180,0.6)`, ...windowRise(f, 1390) }} />
    </AbsoluteFill>
  );
};

// ── G：かぎ線が四角の粒になって消える（f90〜102）＋冒頭の写真が上から消える（f0〜16）──
const SegG: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#F3E4B4" }}>
      <div style={{ position: "absolute", left: 90, top: 400 }}>
        <Dissolve start={94} w={260} h={260}>
          <svg width={260} height={260}><path d="M20 20 L20 230 L240 230 M20 20 L120 20" fill="none" stroke="#B8160F" strokeWidth={34} /></svg>
        </Dissolve>
      </div>
      <div style={{ position: "absolute", left: 0, top: 1100, width: 1080, fontFamily: FONT, fontSize: 30, textAlign: "center", color: "#7a5" }}>{f}</div>
    </AbsoluteFill>
  );
};
const SegH: React.FC = () => {
  const f = useCurrentFrame();
  const top = curtainTop(f);
  return (
    <AbsoluteFill style={{ background: "#F3E4B4" }}>
      <div style={{ position: "absolute", left: 0, top, right: 0, bottom: 0, background: "linear-gradient(#9BB6C8 0%, #9BB6C8 40%, #B07A3A 60%, #6B4A2A 100%)", clipPath: "inset(0 0 0 0)" }} />
      <div style={{ position: "absolute", left: 0, top: top - 40, right: 0, height: 80, background: "linear-gradient(#F3E4B4, rgba(243,228,180,0))" }} />
    </AbsoluteFill>
  );
};

// 本物と同じコマ番号で、場面ごとに並べる
export const REF12_SEGS: [number, number, React.FC][] = [[0, 17, SegH], [90, 102, SegG], [170, 184, SegE], [184, 215, SegB], [500, 620, SegA], [700, 790, SegC], [1384, 1432, SegF], [1880, 1905, SegD]];
export const REF12_FRAMES = 2452;
export const Ref12Repro: React.FC = () => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ background: "#000" }}>{REF12_SEGS.map(([s, e, C]) => (f >= s && f <= e ? <C key={s} /> : null))}</AbsoluteFill>;
};
