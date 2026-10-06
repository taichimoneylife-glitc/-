import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { FONT } from "./components/font";

// ───────────────────────────────────────────────────────────────
// 年収の壁(2025改正)｜叩き台
//   白1画面(カンタロウ型)×IGツリー(1枝ずつ開いて→消して→次)のごちゃ混ぜ。
//   ハブ「年収の壁」＋3分岐(税金/社会保険/扶養)は常時。各壁の詳しい図解を
//   下に展開→解説→クリア→次の壁。最後に3つ揃った早見表で締め。
//   ※数字=2025税制改正(給与控除65/基礎控除58+α=160万、社保106/130据置、扶養123/150、住民税110)。
// ───────────────────────────────────────────────────────────────

const C = {
  bg: "#FCFBF7",
  ink: "#1F3A5F",
  orange: "#E8912D",
  orangeBg: "#FBEBD4",
  red: "#E0483B",
  green: "#2E9E6B",
  gray: "#AEB8C2",
  grayBg: "#EEF1F4",
  line: "#C9D2DD",
};
const FPS = 30;
export const KABE_FRAMES = 1170; // 39s
const CX = 540;

const useS = (delay: number, dur = 10, cfg: Parameters<typeof spring>[0]["config"] = { damping: 13, stiffness: 150, mass: 0.7 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: f - delay, fps, config: cfg, durationInFrames: dur });
};
const Pop: React.FC<{ delay: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ delay, style, children }) => {
  const s = useS(delay);
  return <div style={{ opacity: Math.min(1, s * 2), transform: `scale(${s})`, transformOrigin: "center", ...style }}>{children}</div>;
};
const Rise: React.FC<{ delay: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ delay, style, children }) => {
  const s = useS(delay, 12, { damping: 18 });
  return <div style={{ opacity: Math.min(1, s * 1.6), transform: `translateY(${(1 - s) * 24}px)`, ...style }}>{children}</div>;
};
const Draw: React.FC<{ d: string; delay: number; dur?: number; color?: string; w?: number }> = ({ d, delay, dur = 9, color = C.line, w = 3 }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [delay, delay + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} opacity={p > 0.001 ? 1 : 0} />;
};

// レンガの壁アイコン
const Wall: React.FC<{ s?: number; color?: string }> = ({ s = 70, color = C.ink }) => (
  <svg width={s} height={s} viewBox="0 0 48 48">
    <rect x="5" y="10" width="38" height="30" rx="3" fill="none" stroke={color} strokeWidth="3" />
    <line x1="5" y1="20" x2="43" y2="20" stroke={color} strokeWidth="2.5" />
    <line x1="5" y1="30" x2="43" y2="30" stroke={color} strokeWidth="2.5" />
    <line x1="24" y1="10" x2="24" y2="20" stroke={color} strokeWidth="2.5" />
    <line x1="14" y1="20" x2="14" y2="30" stroke={color} strokeWidth="2.5" />
    <line x1="34" y1="20" x2="34" y2="30" stroke={color} strokeWidth="2.5" />
    <line x1="24" y1="30" x2="24" y2="40" stroke={color} strokeWidth="2.5" />
  </svg>
);

const Pill: React.FC<{ text: string; variant?: "navy" | "orange" | "red" | "outline"; size?: number; style?: React.CSSProperties }> = ({ text, variant = "navy", size = 30, style }) => {
  const bg = variant === "navy" ? C.ink : variant === "orange" ? C.orange : variant === "red" ? C.red : "#fff";
  const col = variant === "outline" ? C.ink : "#fff";
  return <span style={{ display: "inline-block", background: bg, color: col, border: variant === "outline" ? `2px solid ${C.ink}` : "none", borderRadius: 999, padding: "8px 20px", fontWeight: 800, fontSize: size, ...style }}>{text}</span>;
};

// ── ヘッダー：ハブ＋3分岐（常時・アクティブ枝を強調） ──
const COLS = [
  { x: 210, label: "税金の壁", sub: "本人の所得税" },
  { x: 540, label: "社会保険の壁", sub: "手取りに直結" },
  { x: 870, label: "扶養の壁", sub: "親・配偶者" },
];
const Header: React.FC<{ active: number }> = ({ active }) => {
  const hubY = 120, colY = 300;
  return (
    <>
      <svg width={1080} height={430} style={{ position: "absolute", inset: 0 }}>
        <Draw d={`M${CX} ${hubY + 70} L${CX} 230 M210 230 L870 230 M210 230 L210 ${colY - 18} M540 230 L540 ${colY - 18} M870 230 L870 ${colY - 18}`} delay={14} dur={14} color={C.orange} />
      </svg>
      <Rise delay={4} style={{ position: "absolute", top: hubY - 44, left: 0, width: 1080, textAlign: "center" }}>
        <span style={{ fontSize: 58, fontWeight: 900, color: C.ink, borderBottom: `7px solid ${C.orange}`, paddingBottom: 6 }}>年収の壁</span>
        <div style={{ fontSize: 28, fontWeight: 800, color: C.orange, marginTop: 10 }}>2025年、こう変わった</div>
      </Rise>
      {COLS.map((c, i) => {
        const on = active === i;
        return (
          <Pop key={i} delay={30 + i * 8} style={{ position: "absolute", top: colY - 10, left: c.x - 130, width: 260, textAlign: "center", opacity: active < 0 || on ? 1 : 0.32 }}>
            <div style={{ display: "flex", justifyContent: "center" }}><Wall s={62} color={on ? C.orange : C.ink} /></div>
            <div style={{ fontSize: 30, fontWeight: 900, color: C.ink, marginTop: 4 }}>{c.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.gray }}>{c.sub}</div>
          </Pop>
        );
      })}
    </>
  );
};

// 下段の共通フレーム（展開→クリア）
const Lower: React.FC<{ dur: number; children: React.ReactNode }> = ({ dur, children }) => {
  const f = useCurrentFrame();
  const fade = Math.min(
    interpolate(f, [0, 10], [0, 1], { extrapolateRight: "clamp" }),
    interpolate(f, [dur - 14, dur - 2], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
  );
  return <AbsoluteFill style={{ opacity: fade }}>{children}</AbsoluteFill>;
};

// つなぎ線（アクティブ列→下段）
const Feeder: React.FC<{ x: number }> = ({ x }) => (
  <svg width={1080} height={560} style={{ position: "absolute", inset: 0 }}>
    <Draw d={`M${x} 470 L${x} 520 L${CX} 520 L${CX} 560`} delay={6} dur={10} color={C.orange} />
  </svg>
);

// ── 枝1：税金の壁 ──
const Kabe1: React.FC<{ dur: number }> = ({ dur }) => (
  <Lower dur={dur}>
    <Feeder x={210} />
    <div style={{ position: "absolute", top: 600, left: 60, right: 60 }}>
      {/* 103→160 */}
      <Rise delay={12} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 26 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 30, fontWeight: 800, color: C.gray }}>今まで</div>
          <div style={{ fontSize: 76, fontWeight: 900, color: C.gray, position: "relative" }}>103<span style={{ fontSize: 40 }}>万</span>
            <div style={{ position: "absolute", top: "52%", left: -6, right: -6, height: 6, background: C.red, transform: "rotate(-8deg)" }} /></div>
        </div>
        <svg width="70" height="48" viewBox="0 0 70 48"><path d="M4 24h50M48 10l18 14-18 14" fill="none" stroke={C.orange} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" /></svg>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 30, fontWeight: 800, color: C.orange }}>2025〜</div>
          <div style={{ fontSize: 96, fontWeight: 900, color: C.orange }}>160<span style={{ fontSize: 48 }}>万</span></div>
        </div>
      </Rise>
      {/* 内訳 */}
      <Rise delay={40} style={{ marginTop: 40, display: "flex", justifyContent: "center", gap: 16 }}>
        <Pill text="給与控除 55→65万" variant="outline" size={26} />
        <Pill text="基礎控除 48→58万" variant="outline" size={26} />
      </Rise>
      <Rise delay={58} style={{ marginTop: 18, textAlign: "center" }}>
        <span style={{ fontSize: 26, fontWeight: 800, color: C.ink }}>＋年収200万未満は、さらに＋37万</span>
      </Rise>
      <Rise delay={80} style={{ marginTop: 40, textAlign: "center" }}>
        <div style={{ display: "inline-block", background: C.orangeBg, borderRadius: 16, padding: "22px 30px", maxWidth: 820 }}>
          <span style={{ fontSize: 34, fontWeight: 900, color: C.ink, lineHeight: 1.4 }}>
            本人に<span style={{ color: C.orange }}>所得税がかからない</span>ラインが、<br />103万 → <span style={{ color: C.orange }}>160万</span>に。働ける額が増えた。
          </span>
        </div>
      </Rise>
      <Rise delay={104} style={{ marginTop: 26, textAlign: "center" }}>
        <span style={{ fontSize: 26, fontWeight: 800, color: C.gray }}>※住民税の壁も 100万 → 110万 に</span>
      </Rise>
    </div>
  </Lower>
);

// ── 枝2：社会保険の壁 ──
const Kabe2: React.FC<{ dur: number }> = ({ dur }) => (
  <Lower dur={dur}>
    <Feeder x={540} />
    <div style={{ position: "absolute", top: 600, left: 60, right: 60 }}>
      <Rise delay={12} style={{ display: "flex", justifyContent: "center", gap: 30 }}>
        <div style={{ textAlign: "center" }}><div style={{ fontSize: 88, fontWeight: 900, color: C.ink }}>106<span style={{ fontSize: 44 }}>万</span></div></div>
        <div style={{ textAlign: "center" }}><div style={{ fontSize: 88, fontWeight: 900, color: C.ink }}>130<span style={{ fontSize: 44 }}>万</span></div></div>
      </Rise>
      <Rise delay={34} style={{ marginTop: 10, textAlign: "center" }}>
        <Pill text="ここは変わらず" variant="navy" size={30} />
      </Rise>
      {/* 手取り逆転の警告 */}
      <Rise delay={58} style={{ marginTop: 44, textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 14, background: "#FCE6E3", border: `3px solid ${C.red}`, borderRadius: 16, padding: "22px 28px" }}>
          <svg width="46" height="42" viewBox="0 0 46 42"><path d="M23 3L44 39H2z" fill={C.red} /><rect x="21" y="15" width="4" height="14" rx="2" fill="#fff" /><circle cx="23" cy="34" r="2.4" fill="#fff" /></svg>
          <span style={{ fontSize: 34, fontWeight: 900, color: C.red, lineHeight: 1.35 }}>超えると社会保険に加入<br />＝<span style={{ textDecoration: "underline" }}>手取りが減る</span>こともある</span>
        </div>
      </Rise>
      <Rise delay={84} style={{ marginTop: 36, textAlign: "center" }}>
        <span style={{ fontSize: 34, fontWeight: 900, color: C.ink }}>実は、<span style={{ color: C.red }}>“本当の壁”はここ</span>。</span>
      </Rise>
      <Rise delay={104} style={{ marginTop: 18, textAlign: "center" }}>
        <span style={{ fontSize: 26, fontWeight: 800, color: C.gray }}>※106万=勤め先の条件あり／130万=扶養の基準</span>
      </Rise>
    </div>
  </Lower>
);

// ── 枝3：扶養の壁 ──
const Kabe3: React.FC<{ dur: number }> = ({ dur }) => (
  <Lower dur={dur}>
    <Feeder x={870} />
    <div style={{ position: "absolute", top: 600, left: 60, right: 60 }}>
      <Rise delay={12} style={{ display: "flex", flexDirection: "column", gap: 24, alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Pill text="配偶者を扶養" variant="outline" size={28} />
          <svg width="56" height="36" viewBox="0 0 56 36"><path d="M4 18h38M38 7l14 11-14 11" fill="none" stroke={C.ink} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          <div style={{ fontSize: 72, fontWeight: 900, color: C.orange }}>123<span style={{ fontSize: 38 }}>万</span></div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Pill text="大学生の子を扶養" variant="outline" size={28} />
          <svg width="56" height="36" viewBox="0 0 56 36"><path d="M4 18h38M38 7l14 11-14 11" fill="none" stroke={C.ink} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          <div style={{ fontSize: 72, fontWeight: 900, color: C.orange }}>150<span style={{ fontSize: 38 }}>万</span></div>
        </div>
      </Rise>
      <Rise delay={64} style={{ marginTop: 48, textAlign: "center" }}>
        <div style={{ display: "inline-block", background: C.orangeBg, borderRadius: 16, padding: "22px 30px", maxWidth: 840 }}>
          <span style={{ fontSize: 34, fontWeight: 900, color: C.ink, lineHeight: 1.4 }}>
            扶養してる人(親・配偶者)の<br /><span style={{ color: C.orange }}>税金が変わる</span>ライン。子が働いても103万→123/150万まで安心。
          </span>
        </div>
      </Rise>
      <Rise delay={92} style={{ marginTop: 24, textAlign: "center" }}>
        <span style={{ fontSize: 26, fontWeight: 800, color: C.gray }}>※19〜22歳＝特定扶養。103万→123万へ、さらに150万まで段階的に</span>
      </Rise>
    </div>
  </Lower>
);

// ── 締め：3つ揃った早見表 ──
const Summary: React.FC = () => {
  const f = useCurrentFrame();
  const rows = [
    { k: "税金の壁", v: "160万", s: "旧103万・本人の所得税", c: C.orange },
    { k: "社会保険の壁", v: "106・130万", s: "据え置き＝手取り直結", c: C.red },
    { k: "扶養の壁", v: "123・150万", s: "配偶者/大学生の子", c: C.ink },
  ];
  return (
    <AbsoluteFill style={{ opacity: interpolate(f, [0, 10], [0, 1], { extrapolateRight: "clamp" }) }}>
      <Rise delay={4} style={{ position: "absolute", top: 560, left: 0, width: 1080, textAlign: "center" }}>
        <span style={{ fontSize: 42, fontWeight: 900, color: C.ink, borderBottom: `6px solid ${C.orange}`, paddingBottom: 4 }}>年収の壁 2025 早見表</span>
      </Rise>
      <div style={{ position: "absolute", top: 700, left: 90, right: 90, display: "flex", flexDirection: "column", gap: 24 }}>
        {rows.map((r, i) => (
          <Pop key={i} delay={20 + i * 12}>
            <div style={{ display: "flex", alignItems: "center", gap: 20, background: "#fff", border: `4px solid ${r.c}`, borderRadius: 18, padding: "24px 26px", boxShadow: "0 6px 16px rgba(31,58,95,0.08)" }}>
              <Wall s={56} color={r.c} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 34, fontWeight: 900, color: C.ink }}>{r.k}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: C.gray }}>{r.s}</div>
              </div>
              <div style={{ fontSize: 56, fontWeight: 900, color: r.c }}>{r.v}</div>
            </div>
          </Pop>
        ))}
      </div>
      <Rise delay={64} style={{ position: "absolute", top: 1230, left: 0, width: 1080, textAlign: "center" }}>
        <span style={{ fontSize: 28, fontWeight: 800, color: C.gray }}>＋住民税の壁 100万 → 110万</span>
      </Rise>
    </AbsoluteFill>
  );
};

// ── 本体 ──
export const KabeReel: React.FC = () => {
  const B = 300; // 各枝10s
  const intro = 90;
  const act = (f: number) => {
    if (f < intro + B) return 0;
    if (f < intro + B * 2) return 1;
    if (f < intro + B * 3) return 2;
    return -1; // summary = all
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
