import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { FONT } from "./components/font";

// ───────────────────────────────────────────────────────────────
// 年収の壁(2026年版)｜白1画面×枝ごと展開→クリア→次→早見表
//   数字=2026年分(令和8年度改正/2026-10時点)。出典=kabe_source.md(国税庁/厚労省ほか)。
//   税金178万・住民税110万／社保106万は2026/10撤廃→週20時間・130万／扶養136万・配偶者169万・大学生150万。
//   各枝にキャッチ＋✕→○の誤解崩し。締めは早見表＋保険屋の一言。
// ───────────────────────────────────────────────────────────────

const C = {
  bg: "#FCFBF7", ink: "#1F3A5F", orange: "#E8912D", orangeBg: "#FBEBD4",
  red: "#E0483B", redBg: "#FCE6E3", green: "#2E9E6B", greenBg: "#E4F3EC",
  gray: "#AEB8C2", grayBg: "#EEF1F4", line: "#C9D2DD",
};
const FPS = 30;
export const KABE_FRAMES = 1230; // 41s
const CX = 540;

const useS = (delay: number, dur = 10, cfg: Parameters<typeof spring>[0]["config"] = { damping: 13, stiffness: 150, mass: 0.7 }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  return spring({ frame: f - delay, fps, config: cfg, durationInFrames: dur });
};
const Pop: React.FC<{ delay: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ delay, style, children }) => {
  const s = useS(delay);
  return <div style={{ opacity: Math.min(1, s * 2), transform: `scale(${s})`, transformOrigin: "center", ...style }}>{children}</div>;
};
const Rise: React.FC<{ delay: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ delay, style, children }) => {
  const s = useS(delay, 12, { damping: 18 });
  return <div style={{ opacity: Math.min(1, s * 1.6), transform: `translateY(${(1 - s) * 22}px)`, ...style }}>{children}</div>;
};
const Draw: React.FC<{ d: string; delay: number; dur?: number; color?: string; w?: number }> = ({ d, delay, dur = 9, color = C.line, w = 3 }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [delay, delay + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} opacity={p > 0.001 ? 1 : 0} />;
};
const Wall: React.FC<{ s?: number; color?: string }> = ({ s = 62, color = C.ink }) => (
  <svg width={s} height={s} viewBox="0 0 48 48"><rect x="5" y="10" width="38" height="30" rx="3" fill="none" stroke={color} strokeWidth="3" /><line x1="5" y1="20" x2="43" y2="20" stroke={color} strokeWidth="2.5" /><line x1="5" y1="30" x2="43" y2="30" stroke={color} strokeWidth="2.5" /><line x1="24" y1="10" x2="24" y2="20" stroke={color} strokeWidth="2.5" /><line x1="14" y1="20" x2="14" y2="30" stroke={color} strokeWidth="2.5" /><line x1="34" y1="20" x2="34" y2="30" stroke={color} strokeWidth="2.5" /><line x1="24" y1="30" x2="24" y2="40" stroke={color} strokeWidth="2.5" /></svg>
);
const Pill: React.FC<{ text: string; variant?: "navy" | "orange" | "red" | "green" | "outline"; size?: number; style?: React.CSSProperties }> = ({ text, variant = "navy", size = 28, style }) => {
  const map: any = { navy: C.ink, orange: C.orange, red: C.red, green: C.green };
  const bg = variant === "outline" ? "#fff" : map[variant];
  const col = variant === "outline" ? C.ink : "#fff";
  return <span style={{ display: "inline-block", background: bg, color: col, border: variant === "outline" ? `2px solid ${C.ink}` : "none", borderRadius: 999, padding: "7px 18px", fontWeight: 800, fontSize: size, ...style }}>{text}</span>;
};
const Catch: React.FC<{ delay: number; text: string }> = ({ delay, text }) => (
  <Rise delay={delay} style={{ textAlign: "center" }}>
    <span style={{ fontSize: 36, fontWeight: 900, color: C.ink, background: "#FCE07A", borderRadius: 8, padding: "6px 16px", boxDecorationBreak: "clone" }}>「{text}」</span>
  </Rise>
);
// ✕→○ 誤解崩し
const XO: React.FC<{ delay: number; x: string; o: string }> = ({ delay, x, o }) => (
  <Rise delay={delay} style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12, background: C.grayBg, borderRadius: 12, padding: "12px 20px" }}>
      <span style={{ color: C.red, fontWeight: 900, fontSize: 30 }}>✕</span>
      <span style={{ fontSize: 26, fontWeight: 800, color: "#7A828E", textDecoration: "line-through" }}>{x}</span>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 12, background: C.greenBg, border: `2px solid ${C.green}`, borderRadius: 12, padding: "12px 20px" }}>
      <span style={{ color: C.green, fontWeight: 900, fontSize: 30 }}>○</span>
      <span style={{ fontSize: 28, fontWeight: 900, color: C.ink }}>{o}</span>
    </div>
  </Rise>
);

const COLS = [
  { x: 210, label: "税金の壁", sub: "本人の税金" },
  { x: 540, label: "社会保険の壁", sub: "手取りに直結" },
  { x: 870, label: "扶養の壁", sub: "家族の税金" },
];
const Header: React.FC<{ active: number }> = ({ active }) => {
  const hubY = 110, colY = 290;
  return (
    <>
      <svg width={1080} height={420} style={{ position: "absolute", inset: 0 }}>
        <Draw d={`M${CX} ${hubY + 66} L${CX} 220 M210 220 L870 220 M210 220 L210 ${colY - 18} M540 220 L540 ${colY - 18} M870 220 L870 ${colY - 18}`} delay={14} dur={14} color={C.orange} />
      </svg>
      <Rise delay={4} style={{ position: "absolute", top: hubY - 40, left: 0, width: 1080, textAlign: "center" }}>
        <span style={{ fontSize: 56, fontWeight: 900, color: C.ink, borderBottom: `7px solid ${C.orange}`, paddingBottom: 5 }}>年収の壁</span>
        <div style={{ fontSize: 27, fontWeight: 800, color: C.orange, marginTop: 8 }}>2026年版・こう変わった</div>
      </Rise>
      {COLS.map((c, i) => {
        const on = active === i;
        return (
          <Pop key={i} delay={30 + i * 8} style={{ position: "absolute", top: colY - 8, left: c.x - 130, width: 260, textAlign: "center", opacity: active < 0 || on ? 1 : 0.3 }}>
            <div style={{ display: "flex", justifyContent: "center" }}><Wall s={58} color={on ? C.orange : C.ink} /></div>
            <div style={{ fontSize: 30, fontWeight: 900, color: C.ink, marginTop: 2 }}>{c.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.gray }}>{c.sub}</div>
          </Pop>
        );
      })}
    </>
  );
};
const Lower: React.FC<{ dur: number; children: React.ReactNode }> = ({ dur, children }) => {
  const f = useCurrentFrame();
  const fade = Math.min(interpolate(f, [0, 10], [0, 1], { extrapolateRight: "clamp" }), interpolate(f, [dur - 14, dur - 2], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  return <AbsoluteFill style={{ opacity: fade }}>{children}</AbsoluteFill>;
};
const Feeder: React.FC<{ x: number }> = ({ x }) => (
  <svg width={1080} height={540} style={{ position: "absolute", inset: 0 }}><Draw d={`M${x} 450 L${x} 500 L${CX} 500 L${CX} 540`} delay={6} dur={10} color={C.orange} /></svg>
);

// 枝1：税金の壁（103→160→178の進化）
const Kabe1: React.FC<{ dur: number }> = ({ dur }) => (
  <Lower dur={dur}>
    <Feeder x={210} />
    <div style={{ position: "absolute", top: 585, left: 50, right: 50 }}>
      <Rise delay={10} style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 18 }}>
        <div style={{ textAlign: "center" }}><div style={{ fontSize: 24, fontWeight: 800, color: C.gray }}>〜2024</div><div style={{ fontSize: 50, fontWeight: 900, color: C.gray, position: "relative" }}>103<span style={{ fontSize: 26 }}>万</span><div style={{ position: "absolute", top: "50%", left: -4, right: -4, height: 5, background: C.red, transform: "rotate(-8deg)" }} /></div></div>
        <span style={{ fontSize: 28, color: C.gray, paddingBottom: 14 }}>→</span>
        <div style={{ textAlign: "center" }}><div style={{ fontSize: 24, fontWeight: 800, color: C.gray }}>去年</div><div style={{ fontSize: 56, fontWeight: 900, color: C.gray }}>160<span style={{ fontSize: 28 }}>万</span></div></div>
        <span style={{ fontSize: 34, color: C.orange, paddingBottom: 12 }}>→</span>
        <div style={{ textAlign: "center" }}><div style={{ fontSize: 26, fontWeight: 900, color: C.orange }}>今年2026</div><div style={{ fontSize: 92, fontWeight: 900, color: C.orange }}>178<span style={{ fontSize: 46 }}>万</span></div></div>
      </Rise>
      <Rise delay={40} style={{ marginTop: 26, display: "flex", justifyContent: "center", gap: 14, alignItems: "center" }}>
        <Pill text="給与控除 74万" variant="outline" size={25} /><span style={{ fontSize: 28, fontWeight: 900, color: C.ink }}>＋</span><Pill text="基礎控除 104万" variant="outline" size={25} /><span style={{ fontSize: 28, fontWeight: 900, color: C.orange }}>＝178万</span>
      </Rise>
      <Rise delay={62} style={{ marginTop: 22, textAlign: "center" }}>
        <span style={{ fontSize: 28, fontWeight: 800, color: C.ink }}>住民税は<span style={{ color: C.orange }}>110万</span>から。所得税より先にかかる</span>
      </Rise>
      <div style={{ marginTop: 34, display: "flex", justifyContent: "center" }}><Catch delay={84} text="今年の壁は178万" /></div>
      <div style={{ marginTop: 36, display: "flex", justifyContent: "center" }}>
        <XO delay={110} x="178万まで何もかからない" o="所得税だけ。住民税110万・社保130万は別" />
      </div>
    </div>
  </Lower>
);

// 枝2：社会保険（106万撤廃→週20時間／130万）
const Kabe2: React.FC<{ dur: number }> = ({ dur }) => (
  <Lower dur={dur}>
    <Feeder x={540} />
    <div style={{ position: "absolute", top: 585, left: 50, right: 50 }}>
      {/* 106万撤廃 */}
      <Rise delay={10} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20 }}>
        <div style={{ position: "relative" }}><span style={{ fontSize: 64, fontWeight: 900, color: C.gray }}>106<span style={{ fontSize: 32 }}>万</span></span>
          <div style={{ position: "absolute", top: "46%", left: -6, right: -6, height: 7, background: C.red, transform: "rotate(-10deg)" }} /></div>
        <Pill text="2026年10月 撤廃" variant="red" size={26} />
      </Rise>
      <Rise delay={36} style={{ marginTop: 16, textAlign: "center" }}>
        <span style={{ fontSize: 34, fontWeight: 900, color: C.ink }}>今の基準は<span style={{ color: C.orange }}>「週20時間」</span></span>
      </Rise>
      <div style={{ marginTop: 20, display: "flex", justifyContent: "center" }}><Catch delay={54} text="今は年収より週20時間" /></div>
      {/* 130万 */}
      <Rise delay={76} style={{ marginTop: 40, textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 16, background: C.redBg, border: `3px solid ${C.red}`, borderRadius: 16, padding: "18px 26px" }}>
          <span style={{ fontSize: 66, fontWeight: 900, color: C.red }}>130<span style={{ fontSize: 32 }}>万</span></span>
          <span style={{ fontSize: 30, fontWeight: 900, color: C.red, lineHeight: 1.3, textAlign: "left" }}>扶養を外れて<br />手取りが減る</span>
        </div>
      </Rise>
      <Rise delay={98} style={{ marginTop: 16, textAlign: "center" }}>
        <span style={{ fontSize: 26, fontWeight: 800, color: C.gray }}>※19〜22歳は150万／60歳以上・障害者は180万</span>
      </Rise>
      <div style={{ marginTop: 26, display: "flex", justifyContent: "center" }}><Catch delay={116} text="本当に怖いのは130万" /></div>
    </div>
  </Lower>
);

// 枝3：扶養（配偶者136→169／大学生150）
const Kabe3: React.FC<{ dur: number }> = ({ dur }) => (
  <Lower dur={dur}>
    <Feeder x={870} />
    <div style={{ position: "absolute", top: 580, left: 50, right: 50 }}>
      <Rise delay={10} style={{ display: "flex", flexDirection: "column", gap: 18, alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Pill text="配偶者" variant="outline" size={26} /><span style={{ fontSize: 26, color: C.ink }}>→</span>
          <span style={{ fontSize: 30, fontWeight: 900, color: C.ink }}>136万まで満額、</span>
          <span style={{ fontSize: 54, fontWeight: 900, color: C.orange }}>169<span style={{ fontSize: 28 }}>万</span></span>
          <span style={{ fontSize: 26, fontWeight: 800, color: C.ink }}>まで満額</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Pill text="大学生(19〜22)" variant="outline" size={26} /><span style={{ fontSize: 26, color: C.ink }}>→</span>
          <span style={{ fontSize: 30, fontWeight: 900, color: C.ink }}>税は159万でも</span>
          <span style={{ fontSize: 54, fontWeight: 900, color: C.red }}>社保150<span style={{ fontSize: 28 }}>万</span></span>
          <span style={{ fontSize: 26, fontWeight: 800, color: C.ink }}>が先</span>
        </div>
      </Rise>
      <Rise delay={54} style={{ marginTop: 34, textAlign: "center" }}>
        <div style={{ display: "inline-block", background: C.orangeBg, borderRadius: 16, padding: "20px 28px", maxWidth: 860 }}>
          <span style={{ fontSize: 32, fontWeight: 900, color: C.ink, lineHeight: 1.4 }}>子が稼ぎすぎると、<span style={{ color: C.orange }}>親(夫)の控除が減る</span>。<br />大学生の子なら、親の税が年6〜13万変わることも。</span>
        </div>
      </Rise>
      <div style={{ marginTop: 30, display: "flex", justifyContent: "center", gap: 20 }}>
        <Catch delay={82} text="配偶者は169万まで満額" />
      </div>
      <div style={{ marginTop: 24, display: "flex", justifyContent: "center" }}>
        <XO delay={104} x="税金の壁が上がったから130万も上がった" o="社保130万は据え置き。別物" />
      </div>
    </div>
  </Lower>
);

// 締め：早見表＋保険屋の一言
const Summary: React.FC = () => {
  const f = useCurrentFrame();
  const rows = [
    { k: "税金の壁", v: "178万", s: "住民税は110万から", c: C.orange },
    { k: "社会保険の壁", v: "週20h・130万", s: "106万は2026/10撤廃", c: C.red },
    { k: "扶養の壁", v: "136・169・150万", s: "配偶者/大学生", c: C.ink },
  ];
  return (
    <AbsoluteFill style={{ opacity: interpolate(f, [0, 10], [0, 1], { extrapolateRight: "clamp" }) }}>
      <Rise delay={4} style={{ position: "absolute", top: 540, left: 0, width: 1080, textAlign: "center" }}>
        <span style={{ fontSize: 42, fontWeight: 900, color: C.ink, borderBottom: `6px solid ${C.orange}`, paddingBottom: 4 }}>年収の壁 2026 早見表</span>
      </Rise>
      <div style={{ position: "absolute", top: 670, left: 80, right: 80, display: "flex", flexDirection: "column", gap: 20 }}>
        {rows.map((r, i) => (
          <Pop key={i} delay={18 + i * 12}>
            <div style={{ display: "flex", alignItems: "center", gap: 18, background: "#fff", border: `4px solid ${r.c}`, borderRadius: 18, padding: "22px 24px", boxShadow: "0 6px 16px rgba(31,58,95,0.08)" }}>
              <Wall s={52} color={r.c} />
              <div style={{ flex: 1 }}><div style={{ fontSize: 33, fontWeight: 900, color: C.ink }}>{r.k}</div><div style={{ fontSize: 21, fontWeight: 700, color: C.gray }}>{r.s}</div></div>
              <div style={{ fontSize: 46, fontWeight: 900, color: r.c }}>{r.v}</div>
            </div>
          </Pop>
        ))}
      </div>
      {/* 保険屋の一言 */}
      <Rise delay={60} style={{ position: "absolute", top: 1090, left: 80, right: 80 }}>
        <div style={{ background: C.orangeBg, borderRadius: 16, padding: "22px 26px", textAlign: "center" }}>
          <span style={{ fontSize: 30, fontWeight: 900, color: C.ink, lineHeight: 1.45 }}>社保に入ると<span style={{ color: C.orange }}>傷病手当金・出産手当金</span>も。<br />「壁」より<span style={{ color: C.orange }}>世帯の手取りと保障</span>で考えよう。</span>
        </div>
      </Rise>
      <Rise delay={80} style={{ position: "absolute", top: 1230, left: 0, width: 1080, textAlign: "center" }}>
        <span style={{ fontSize: 24, fontWeight: 700, color: C.gray }}>出典：国税庁・厚労省ほか（2026年10月時点）</span>
      </Rise>
    </AbsoluteFill>
  );
};

export const KabeReel: React.FC = () => {
  const B = 320; const intro = 90;
  const act = (f: number) => {
    if (f < intro + B) return 0;
    if (f < intro + B * 2) return 1;
    if (f < intro + B * 3) return 2;
    return -1;
  };
  const Head: React.FC = () => { const f = useCurrentFrame(); return <Header active={act(f)} />; };
  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: FONT }}>
      <Head />
      <Sequence from={intro} durationInFrames={B}><Kabe1 dur={B} /></Sequence>
      <Sequence from={intro + B} durationInFrames={B}><Kabe2 dur={B} /></Sequence>
      <Sequence from={intro + B * 2} durationInFrames={B}><Kabe3 dur={B} /></Sequence>
      <Sequence from={intro + B * 3} durationInFrames={KABE_FRAMES - (intro + B * 3)}><Summary /></Sequence>
    </AbsoluteFill>
  );
};
