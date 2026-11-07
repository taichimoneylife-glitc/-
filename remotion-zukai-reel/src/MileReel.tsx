import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, interpolate } from "remotion";
import { BG2, A2, Mark2, Big, SAFE } from "./components/kit2";
import { PopIn, Float, Appear, DrawLine } from "./components/kit";
import { SfxTrack } from "./components/sfx";

// ════════════════════════════════════════════════════════════════════
//  マイル｜図解リール 大枠（新録音 public/mile-narration.wav・図解パート約50秒）
//  ★連結ツリー（生活費→クレカ→キャンペーン→ポイント→マイル→特典航空券で家族旅行）が主役。
//  画像はまだ無いので PhBox（プレースホルダ）で配置。本番は public/gen/mile_*.png に差し替え。
//  fps=30 / frame = round(sec*30)。
// ════════════════════════════════════════════════════════════════════

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>{children}</svg>
);

const SlideTrans: React.FC<{ dur: number; children: React.ReactNode }> = ({ dur, children }) => {
  const f = useCurrentFrame();
  const IN = 8, OUT = 12;
  const inY = interpolate(f, [0, IN], [48, 0], clamp);
  const inO = interpolate(f, [0, IN], [0, 1], clamp);
  const outY = interpolate(f, [dur - OUT, dur], [0, -100], clamp);
  const outO = interpolate(f, [dur - OUT, dur], [1, 0], clamp);
  return <AbsoluteFill style={{ transform: `translateY(${inY + outY}px)`, opacity: Math.min(inO, outO) }}>{children}</AbsoluteFill>;
};

// 画像プレースホルダの“箱だけ”（配置はしない＝flex/カード内で使える）。本番は gen/mile_*.png に差し替え。
const PhBox: React.FC<{ emoji: string; label?: string; size?: number; round?: boolean }> = ({ emoji, label, size = 150, round }) => (
  <div style={{ width: size, height: size, borderRadius: round ? "50%" : 26, background: "#FFFDF4", border: `3px dashed ${A2.bar}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 24px rgba(80,60,20,0.08)", flexShrink: 0 }}>
    <div style={{ fontSize: size * 0.44, lineHeight: 1 }}>{emoji}</div>
    {label ? <div style={{ fontSize: Math.max(20, size * 0.11), fontWeight: 800, color: A2.sub, marginTop: 6, textAlign: "center", lineHeight: 1.1 }}>{label}</div> : null}
  </div>
);

// 単体で絶対配置するプレースホルダ（PopIn＋Float付き）
const Ph: React.FC<{ delay: number; emoji: string; label?: string; size?: number; left: number; top: number; amp?: number; round?: boolean }> = ({ delay, emoji, label, size = 150, left, top, amp = 7, round }) => (
  <PopIn delay={delay} style={{ position: "absolute", left, top, width: size }}>
    <Float delay={delay} amp={amp}><PhBox emoji={emoji} label={label} size={size} round={round} /></Float>
  </PopIn>
);

const HeadPill: React.FC<{ delay: number; title: React.ReactNode; top?: number }> = ({ delay, title, top = SAFE.top }) => (
  <PopIn delay={delay} style={{ position: "absolute", left: SAFE.x0, top, width: SAFE.x1 - SAFE.x0, textAlign: "center" }}>
    <div style={{ display: "inline-block", background: A2.green, color: "#fff", fontWeight: 800, fontSize: 52, letterSpacing: 2, padding: "14px 40px", borderRadius: 999, boxShadow: "0 12px 26px rgba(46,158,107,0.28)" }}>{title}</div>
  </PopIn>
);

const Line: React.FC<{ delay: number; top: number; size?: number; children: React.ReactNode }> = ({ delay, top, size = 46, children }) => (
  <Appear delay={delay} style={{ position: "absolute", left: SAFE.x0, top, width: SAFE.x1 - SAFE.x0, textAlign: "center" }}>
    <div style={{ fontSize: size, fontWeight: 800, lineHeight: 1.4, color: A2.ink }}>{children}</div>
  </Appear>
);

const Band: React.FC<{ delay: number; top: number; children: React.ReactNode; color?: string; size?: number }> = ({ delay, top, children, color = A2.marker, size = 46 }) => (
  <PopIn delay={delay} style={{ position: "absolute", left: 100, top, width: 880 }}>
    <Float delay={delay} amp={3}>
      <div style={{ background: color, borderRadius: 24, padding: "24px 22px", textAlign: "center", fontSize: size, fontWeight: 800, lineHeight: 1.35, boxShadow: "0 10px 24px rgba(80,60,20,0.1)" }}>{children}</div>
    </Float>
  </PopIn>
);

// 行内チップ（PhBox＋ラベル）＝横フロー用
const FlowChip: React.FC<{ delay: number; emoji: string; label: string; size?: number; hi?: boolean }> = ({ delay, emoji, label, size = 150, hi }) => (
  <PopIn delay={delay}>
    <Float delay={delay} amp={4}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <div style={{ width: size, height: size, borderRadius: 24, background: hi ? A2.marker : "#fff", border: `3px ${hi ? "solid #E6C63E" : "dashed " + A2.bar}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.5, boxShadow: "0 10px 22px rgba(80,60,20,0.1)" }}>{emoji}</div>
        <div style={{ fontSize: 30, fontWeight: 800, color: A2.ink }}>{label}</div>
      </div>
    </Float>
  </PopIn>
);
const Arrow: React.FC = () => <div style={{ fontSize: 48, fontWeight: 800, color: A2.green, alignSelf: "center", paddingBottom: 30 }}>→</div>;

// ── P1 マイルとは／生活費から貯まる（0–5.12s / 154f）──────────────
const P1: React.FC = () => (
  <BG2>
    <SfxTrack cues={[{ file: "user/u05", at: 2, volume: 0.42 }, { file: "user/u02s", at: 47, volume: 0.4 }, { file: "user/u03", at: 89, volume: 0.4 }]} />
    <HeadPill delay={2} title="そもそもマイルとは？" />
    <Ph delay={20} emoji="✈️" size={250} left={415} top={420} />
    <Line delay={47} top={720} size={48}>マイルは、<Mark2 delay={62}>航空券に交換できるポイント</Mark2></Line>
    <Line delay={89} top={830} size={46}>実は、普段の生活費から貯まるんです</Line>
    {/* 生活費 → マイル → 旅行 の簡単フロー（詳細はP2） */}
    <div style={{ position: "absolute", left: 0, top: 980, width: 1080, display: "flex", justifyContent: "center", alignItems: "flex-start", gap: 24 }}>
      <FlowChip delay={100} emoji="🧾" label="生活費" />
      <Arrow />
      <FlowChip delay={112} emoji="🎫" label="マイル" />
      <Arrow />
      <FlowChip delay={124} emoji="🧳" label="家族旅行" hi />
    </div>
    <Band delay={132} top={1290} size={46}>飛行機に乗らなくても、<Mark2 delay={146} color="#FFFFFF80">貯められる</Mark2></Band>
  </BG2>
);

// ── P2 ★連結ツリー（5.12–19.72s / 438f）＝主役 ──────────────────
const P2: React.FC = () => {
  const nodes = [
    { d: 43, y: 342, emoji: "🧾", title: "毎月の生活費", sub: "食費・光熱費・スマホ・保険" },
    { d: 70, y: 527, emoji: "💳", title: "クレカでまとめる", sub: "支払いを1枚に集約" },
    { d: 109, y: 712, emoji: "🎯", title: "入会キャンペーン達成", sub: "条件クリアで特典" },
    { d: 176, y: 897, emoji: "🪙", title: "まとまったポイント", sub: "通常利用分に上乗せ" },
    { d: 257, y: 1082, emoji: "🎫", title: "マイルに交換", sub: "ポイント → マイル" },
    { d: 310, y: 1267, emoji: "✈️", title: "特典航空券で家族旅行", sub: "飛行機代を大きく抑える", climax: true },
  ];
  const NODE_W = 760, LEFT = (1080 - NODE_W) / 2;
  return (
    <BG2>
      <SfxTrack cues={[
        { file: "user/u03", at: 2, volume: 0.4 },
        { file: "user/u02s", at: 43, volume: 0.4 }, { file: "user/u02s", at: 70, volume: 0.36 },
        { file: "user/u05", at: 109, volume: 0.4 }, { file: "user/u02s", at: 176, volume: 0.4 },
        { file: "user/u05", at: 257, volume: 0.4 }, { file: "user/u02s", at: 310, volume: 0.4 },
        { file: "user/u04", at: 355, volume: 0.42 },
      ]} />
      <Svg>
        {nodes.slice(1).map((n, i) => {
          const prev = nodes[i];
          return <DrawLine key={i} d={`M540 ${prev.y + 128} L540 ${n.y}`} delay={n.d - 8} dur={10} color={A2.green} w={7} />;
        })}
      </Svg>
      {nodes.map((n, i) => (
        <PopIn key={i} delay={n.d} style={{ position: "absolute", left: LEFT, top: n.y, width: NODE_W }}>
          <Float delay={n.d} amp={3}>
            <div style={{ display: "flex", alignItems: "center", gap: 20, background: n.climax ? A2.marker : "#fff", border: `3px solid ${n.climax ? "#E6C63E" : A2.track}`, borderRadius: 24, padding: "16px 24px", boxShadow: n.climax ? "0 14px 30px rgba(230,198,62,0.35)" : "0 10px 22px rgba(80,60,20,0.1)" }}>
              <div style={{ width: 86, height: 86, borderRadius: 18, background: n.climax ? "#fff" : "#FFFDF4", border: `2px dashed ${A2.bar}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 46, flexShrink: 0 }}>{n.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: n.climax ? 44 : 40, fontWeight: 800, color: A2.ink, lineHeight: 1.1 }}>{n.title}</div>
                <div style={{ fontSize: 26, fontWeight: 700, color: A2.sub, marginTop: 4 }}>{n.sub}</div>
              </div>
            </div>
          </Float>
        </PopIn>
      ))}
    </BG2>
  );
};

// ── P3 半年100万円のハードル（19.72–35.32s / 468f）──────────────
const P3: React.FC = () => {
  const f = useCurrentFrame();
  const barW = interpolate(f, [74, 120], [0, 100], clamp);
  const cards = [
    { d: 179, emoji: "🏠", a: "毎月の", hi: "固定費", b: "をまとめる", mk: false },
    { d: 238, emoji: "🛒", a: "大きな出費は、むしろ", hi: "チャンス", b: "", mk: true },
  ];
  return (
    <BG2>
      <SfxTrack cues={[
        { file: "user/u03", at: 2, volume: 0.4 }, { file: "user/u04", at: 74, volume: 0.42 },
        { file: "user/u06", at: 120, volume: 0.36 }, { file: "user/u02s", at: 179, volume: 0.4 },
        { file: "user/u05", at: 238, volume: 0.42 }, { file: "user/u03", at: 310, volume: 0.4 },
        { file: "user/u02s", at: 407, volume: 0.4 },
      ]} />
      <HeadPill delay={2} title="ただし、利用条件がある" />
      <div style={{ position: "absolute", left: 60, top: 420, width: 960, textAlign: "center" }}>
        <Appear delay={74}><div style={{ fontSize: 46, fontWeight: 800 }}>例えば、半年で <Big delay={78} to={100} suffix="万円" size={100} color={A2.green} dur={16} /></div></Appear>
      </div>
      <div style={{ position: "absolute", left: 160, top: 580, width: 760 }}>
        <div style={{ height: 44, borderRadius: 999, background: A2.track, position: "relative" }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${barW}%`, background: A2.green, borderRadius: 999 }} />
        </div>
      </div>
      <Line delay={120} top={672} size={46}>月にすると <Mark2 delay={132}>約17万円</Mark2> くらい</Line>
      {cards.map((c, i) => (
        <PopIn key={i} delay={c.d} style={{ position: "absolute", left: 70, top: 800 + i * 170, width: 940 }}>
          <Float delay={c.d} amp={4}>
            <div style={{ display: "flex", alignItems: "center", gap: 20, background: c.mk ? A2.marker : "#fff", border: `3px solid ${c.mk ? "#E6C63E" : A2.track}`, borderRadius: 22, padding: "16px 26px", boxShadow: "0 8px 18px rgba(80,60,20,0.1)" }}>
              <PhBox emoji={c.emoji} size={96} />
              <div style={{ fontSize: 42, fontWeight: 800, lineHeight: 1.25 }}>{c.a}<span style={{ color: c.mk ? A2.coral : A2.green }}>{c.hi}</span>{c.b}</div>
            </div>
          </Float>
        </PopIn>
      ))}
      <Band delay={310} top={1160} size={40} color="#E4F6EC">他にも、効率よく達成する方法がいくつも</Band>
      <PopIn delay={407} style={{ position: "absolute", left: 290, top: 1320, width: 500 }}>
        <Float delay={407} amp={5}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, background: A2.green, color: "#fff", borderRadius: 999, padding: "16px 28px", fontSize: 46, fontWeight: 800 }}>💬 気になる方はDM</div>
        </Float>
      </PopIn>
    </BG2>
  );
};

// ── P4 家族との思い出（35.32–50.04s / 441f）──────────────────────
const P4: React.FC = () => (
  <BG2>
    <SfxTrack cues={[
      { file: "user/u03", at: 2, volume: 0.4 }, { file: "user/u05", at: 53, volume: 0.42 },
      { file: "user/u02s", at: 126, volume: 0.4 }, { file: "user/u05", at: 179, volume: 0.42 },
      { file: "user/u02s", at: 264, volume: 0.36 }, { file: "user/u07", at: 368, volume: 0.5 },
    ]} />
    <HeadPill delay={2} title="お得、だけじゃない" />
    <Ph delay={53} emoji="👨‍👩‍👧‍👦" label="家族の思い出" size={330} left={375} top={360} />
    <Line delay={126} top={760} size={46}>子どもが小さい<Mark2 delay={140}>今</Mark2>だからできる</Line>
    <Line delay={179} top={850} size={44}>家族との思い出や経験を増やしてほしい</Line>
    {/* 将来の備え × 今の経験 ＝ 同じくらい大切 */}
    <div style={{ position: "absolute", left: 0, top: 970, width: 1080, display: "flex", justifyContent: "center", alignItems: "center", gap: 36 }}>
      <PopIn delay={264}><Float delay={264} amp={4}><div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}><PhBox emoji="🐷" size={180} /><div style={{ fontSize: 32, fontWeight: 800, color: A2.sub }}>将来の備え</div></div></Float></PopIn>
      <PopIn delay={282}><div style={{ fontSize: 64, fontWeight: 800, color: A2.ink }}>＋</div></PopIn>
      <PopIn delay={290}><Float delay={290} amp={4}><div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}><PhBox emoji="🎒" size={180} /><div style={{ fontSize: 32, fontWeight: 800, color: A2.sub }}>今の経験</div></div></Float></PopIn>
    </div>
    <Band delay={368} top={1290} size={44} color={A2.marker}>将来の備えも、今しかできない経験も、<br />同じくらい大切</Band>
  </BG2>
);

const SCENES: { c: React.FC; from: number; dur: number }[] = [
  { c: P1, from: 0, dur: 154 },
  { c: P2, from: 154, dur: 438 },
  { c: P3, from: 592, dur: 468 },
  { c: P4, from: 1060, dur: 442 },
];

export const MILE_FRAMES = 1502; // ~50.07s @30fps

export const MileReel: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: A2.bg }}>
    <Audio src={staticFile("mile-narration.wav")} />
    {SCENES.map(({ c: C, from, dur }, i) => (
      <Sequence key={i} from={from} durationInFrames={dur}>
        <SlideTrans dur={dur}><C /></SlideTrans>
      </Sequence>
    ))}
  </AbsoluteFill>
);
