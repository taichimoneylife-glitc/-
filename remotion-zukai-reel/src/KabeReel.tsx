import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { FONT } from "./components/font";

// ───────────────────────────────────────────────────────────────
// 年収の壁(2026)｜3つの壁を上に出す→下に図解が降りて積み上がる（カメラが下に追う）
//   年末調整/IGツリーと同系統。ハブ+3つの壁が上、その下に詳細が1つずつ降りてくる。
//   数字=2026(出典kabe_source)。働き損は自前試算(128→126/130超→108/約150回復・目安)。
// ───────────────────────────────────────────────────────────────

const C = {
  bg: "#FCFBF7", ink: "#1F3A5F", orange: "#E8912D", orangeBg: "#FBEBD4",
  red: "#E0483B", redBg: "#FCE6E3", green: "#2E9E6B", greenBg: "#E4F3EC",
  gray: "#AEB8C2", grayBg: "#EEF1F4", line: "#C9D2DD",
};
export const KABE_FRAMES = 840; // 28s
const CX = 540;

const useSp = (delay: number, dur = 12, cfg: Parameters<typeof spring>[0]["config"] = { damping: 14, stiffness: 150, mass: 0.8 }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  return spring({ frame: f - delay, fps, config: cfg, durationInFrames: dur });
};
// 降りてくる（上から少し降下して着地）
const Drop: React.FC<{ delay: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ delay, style, children }) => {
  const s = useSp(delay, 16, { damping: 15 });
  return <div style={{ opacity: Math.min(1, s * 1.8), transform: `translateY(${(1 - s) * -40}px)`, ...style }}>{children}</div>;
};
const Pop: React.FC<{ delay: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ delay, style, children }) => {
  const s = useSp(delay, 12, { damping: 13, stiffness: 150, mass: 0.7 });
  return <div style={{ opacity: Math.min(1, s * 2), transform: `scale(${s})`, transformOrigin: "center", ...style }}>{children}</div>;
};
const Draw: React.FC<{ d: string; delay: number; dur?: number; color?: string; w?: number }> = ({ d, delay, dur = 10, color = C.line, w = 4 }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [delay, delay + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} opacity={p > 0.001 ? 1 : 0} />;
};
const Wall: React.FC<{ s?: number; color?: string }> = ({ s = 56, color = C.ink }) => (
  <svg width={s} height={s} viewBox="0 0 48 48"><rect x="5" y="10" width="38" height="30" rx="3" fill="none" stroke={color} strokeWidth="3" /><line x1="5" y1="20" x2="43" y2="20" stroke={color} strokeWidth="2.5" /><line x1="5" y1="30" x2="43" y2="30" stroke={color} strokeWidth="2.5" /><line x1="24" y1="10" x2="24" y2="20" stroke={color} strokeWidth="2.5" /><line x1="14" y1="20" x2="14" y2="30" stroke={color} strokeWidth="2.5" /><line x1="34" y1="20" x2="34" y2="30" stroke={color} strokeWidth="2.5" /><line x1="24" y1="30" x2="24" y2="40" stroke={color} strokeWidth="2.5" /></svg>
);
const Pill: React.FC<{ text: string; v?: "navy" | "orange" | "red" | "green" | "out"; size?: number }> = ({ text, v = "navy", size = 26 }) => {
  const map: any = { navy: C.ink, orange: C.orange, red: C.red, green: C.green };
  const bg = v === "out" ? "#fff" : map[v]; const col = v === "out" ? C.ink : "#fff";
  return <span style={{ display: "inline-block", background: bg, color: col, border: v === "out" ? `2px solid ${C.ink}` : "none", borderRadius: 999, padding: "6px 16px", fontWeight: 800, fontSize: size }}>{text}</span>;
};
// 降りてくるカード（中央・board座標y）
const Card: React.FC<{ y: number; delay: number; w?: number; color?: string; bg?: string; n?: string; title: string; children?: React.ReactNode }> = ({ y, delay, w = 760, color = C.ink, bg = "#fff", n, title, children }) => (
  <Drop delay={delay} style={{ position: "absolute", top: y, left: CX - w / 2, width: w }}>
    <div style={{ background: bg, border: `4px solid ${color}`, borderRadius: 20, padding: "22px 26px", boxShadow: "0 8px 20px rgba(31,58,95,0.10)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, justifyContent: "center" }}>
        {n && <span style={{ width: 50, height: 50, borderRadius: "50%", background: color, color: "#fff", fontSize: 30, fontWeight: 900, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{n}</span>}
        <span style={{ fontSize: 40, fontWeight: 900, color: C.ink }}>{title}</span>
      </div>
      {children && <div style={{ marginTop: 16, textAlign: "center" }}>{children}</div>}
    </div>
  </Drop>
);

// board上のY座標と登場frame
const Y = { hub: 120, walls: 320, d1: 560, d2: 860, d3: 1130, d4: 1380, d5: 1880, d6: 2140, d7: 2540 };
const D = { walls: 20, d1: 60, d2: 140, d3: 210, d4: 280, d5: 420, d6: 500, d7: 600 };

export const KabeReel: React.FC = () => {
  const f = useCurrentFrame();
  // カメラ：最新ブロックのyを画面の y≈780 へ（上の3つの壁から下へ降りていく）
  const camBP: number[][] = [
    [0, 420], [D.d1, 560], [D.d2, 860], [D.d3, 1130], [D.d4, 1420], [D.d5, 1880], [D.d6, 2160], [D.d7, 2420], [KABE_FRAMES, 2420],
  ];
  const focus = interpolate(f, camBP.map(b => b[0]), camBP.map(b => b[1]), { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const offset = -(focus - 780);
  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: FONT, overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, width: 1080, transform: `translateY(${offset}px)` }}>
        {/* 連結スパイン＋分岐 */}
        <svg width={1080} height={2800} style={{ position: "absolute", inset: 0 }}>
          <Draw d={`M${CX} ${Y.hub + 70} L${CX} 250 M250 250 L830 250 M250 250 L250 ${Y.walls - 20} M540 250 L540 ${Y.walls - 20} M830 250 L830 ${Y.walls - 20}`} delay={D.walls - 6} dur={14} color={C.orange} />
          {/* 中央スパイン（下へ降りる） */}
          <Draw d={`M${CX} ${Y.walls + 70} L${CX} ${Y.d1 - 10}`} delay={D.d1 - 8} />
          <Draw d={`M${CX} ${Y.d1 + 130} L${CX} ${Y.d2 - 10}`} delay={D.d2 - 8} />
          <Draw d={`M${CX} ${Y.d2 + 120} L${CX} ${Y.d3 - 10}`} delay={D.d3 - 8} />
          <Draw d={`M${CX} ${Y.d3 + 90} L${CX} ${Y.d4 - 10}`} delay={D.d4 - 8} />
          <Draw d={`M${CX} ${Y.d4 + 330} L${CX} ${Y.d5 - 10}`} delay={D.d5 - 8} />
          <Draw d={`M${CX} ${Y.d5 + 110} L${CX} ${Y.d6 - 10}`} delay={D.d6 - 8} />
        </svg>

        {/* ハブ＋3つの壁 */}
        <Drop delay={0} style={{ position: "absolute", top: Y.hub - 40, left: 0, width: 1080, textAlign: "center" }}>
          <span style={{ fontSize: 56, fontWeight: 900, color: C.ink, borderBottom: `7px solid ${C.orange}`, paddingBottom: 5 }}>年収の壁</span>
          <div style={{ fontSize: 28, fontWeight: 900, color: C.orange, marginTop: 8 }}>2026年・また変わった</div>
        </Drop>
        {[{ x: 250, t: "税金", s: "自分の税金", c: C.orange }, { x: 540, t: "社会保険", s: "本命", c: C.red }, { x: 830, t: "扶養", s: "夫の税金", c: C.ink }].map((w, i) => (
          <Pop key={i} delay={D.walls + 6 + i * 6} style={{ position: "absolute", top: Y.walls - 10, left: w.x - 130, width: 260, textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center" }}><Wall s={52} color={w.c} /></div>
            <div style={{ fontSize: 30, fontWeight: 900, color: C.ink, marginTop: 2 }}>{w.t}の壁</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.gray }}>{w.s}</div>
          </Pop>
        ))}

        {/* 以下、下に降りてくる図解 */}
        <Card y={Y.d1} delay={D.d1} n="①" title="税金の壁" color={C.orange}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 18 }}>
            <span style={{ fontSize: 44, fontWeight: 900, color: C.gray, position: "relative" }}>103万<div style={{ position: "absolute", top: "50%", left: -4, right: -4, height: 5, background: C.red, transform: "rotate(-8deg)" }} /></span>
            <span style={{ fontSize: 32, color: C.orange, paddingBottom: 6 }}>→</span>
            <span style={{ fontSize: 72, fontWeight: 900, color: C.orange, lineHeight: 1 }}>178万</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: C.ink, marginTop: 10 }}>103万に抑える時代は、もう終わり</div>
        </Card>

        <Card y={Y.d2} delay={D.d2} n="②" title="社会保険の壁" color={C.red}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 8 }}>
            <span style={{ fontSize: 40, fontWeight: 900, color: C.gray, position: "relative" }}>106万<div style={{ position: "absolute", top: "46%", left: -4, right: -4, height: 6, background: C.red, transform: "rotate(-10deg)" }} /></span>
            <Pill text="10月に撤廃" v="red" size={24} />
          </div>
          <div style={{ fontSize: 30, fontWeight: 900, color: C.ink }}>今は<span style={{ color: C.orange }}>“働く時間”</span>で決まる</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: C.gray, marginTop: 4 }}>51人以上の会社で・週20時間以上</div>
        </Card>

        <Drop delay={D.d3} style={{ position: "absolute", top: Y.d3, left: 0, width: 1080, textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 14, background: C.redBg, border: `3px solid ${C.red}`, borderRadius: 16, padding: "16px 26px" }}>
            <span style={{ fontSize: 54, fontWeight: 900, color: C.red }}>130万</span><span style={{ fontSize: 30, fontWeight: 900, color: C.red }}>で夫の扶養を外れる</span>
          </div>
        </Drop>

        {/* 働き損（山場） */}
        <Drop delay={D.d4} style={{ position: "absolute", top: Y.d4, left: 0, width: 1080, textAlign: "center" }}>
          <div style={{ fontSize: 40, fontWeight: 900, color: C.ink, marginBottom: 18 }}>一番“損”するのは、ここ</div>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", gap: 12 }}>
            {[{ y: "128万", t: "約126万", c: C.green, bg: C.greenBg, nt: "扶養内" }, { y: "130万超", t: "約108万", c: C.red, bg: C.redBg, nt: "−18万!" }, { y: "約150万", t: "約126万", c: C.ink, bg: "#EEF2F7", nt: "やっと回復" }].map((c, i) => (
              <React.Fragment key={i}>
                <div style={{ width: 272, background: c.bg, border: `4px solid ${c.c}`, borderRadius: 16, padding: "16px 8px" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: C.gray }}>年収</div><div style={{ fontSize: 38, fontWeight: 900, color: C.ink }}>{c.y}</div>
                  <div style={{ fontSize: 26, color: c.c }}>↓</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: C.gray }}>手取り</div><div style={{ fontSize: 46, fontWeight: 900, color: c.c }}>{c.t}</div>
                  <div style={{ marginTop: 6, display: "inline-block", background: c.c, color: "#fff", borderRadius: 999, padding: "3px 12px", fontSize: 20, fontWeight: 900 }}>{c.nt}</div>
                </div>
                {i < 2 && <span style={{ fontSize: 32, color: C.gray, alignSelf: "center", paddingTop: 44 }}>→</span>}
              </React.Fragment>
            ))}
          </div>
          <div style={{ marginTop: 20 }}><span style={{ fontSize: 34, fontWeight: 900, color: "#fff", background: C.red, borderRadius: 12, padding: "10px 24px" }}>“中途半端”が、一番損</span></div>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.gray, marginTop: 12 }}>※勤め先の社保＝保険料 約15%で試算した目安</div>
        </Drop>

        <Card y={Y.d5} delay={D.d5} n="③" title="扶養の壁" color={C.ink}>
          <div style={{ fontSize: 30, fontWeight: 900, color: C.ink }}>配偶者 <span style={{ color: C.orange, fontSize: 48 }}>136万</span> まで控除は満額</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.gray, marginTop: 6 }}>（169万までは特別控除で満額）</div>
        </Card>

        {/* まとめ */}
        <Drop delay={D.d6} style={{ position: "absolute", top: Y.d6, left: 0, width: 1080, textAlign: "center" }}>
          <div style={{ fontSize: 40, fontWeight: 900, color: "#fff", background: C.red, borderRadius: 14, padding: "14px 28px", display: "inline-block" }}>損が出るのは 130〜150万 だけ</div>
          <div style={{ fontSize: 30, fontWeight: 900, color: C.ink, marginTop: 24 }}>社保に入れば…</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 14 }}>
            {["将来の年金↑", "傷病手当金", "出産手当金"].map((t, i) => (
              <Pop key={i} delay={D.d6 + 10 + i * 6}><div style={{ background: C.greenBg, border: `3px solid ${C.green}`, borderRadius: 14, padding: "14px 18px", fontSize: 26, fontWeight: 900, color: C.ink }}>{t}</div></Pop>
            ))}
          </div>
        </Drop>
        <Drop delay={D.d7} style={{ position: "absolute", top: Y.d7, left: 0, width: 1080, textAlign: "center" }}>
          <span style={{ fontSize: 40, fontWeight: 900, color: C.ink, lineHeight: 1.4 }}>“壁”で縮こまるより、<br /><span style={{ color: C.orange }}>世帯の手取りと保障</span>で考えよう</span>
        </Drop>
      </div>
    </AbsoluteFill>
  );
};
