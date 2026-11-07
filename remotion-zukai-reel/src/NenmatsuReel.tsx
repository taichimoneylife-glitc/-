import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { FONT } from "./components/font";

// ───────────────────────────────────────────────────────────────
// 年末調整リール「完全再現」(実フレーム解析ベース / 設計書: nenmatsu_design_spec.md)
//   3パート: 実写フック(0-13.5s) → 1画面積み上げ図解(13.5-40s) → 実写締め(40-45s)
//   図解は上60%に集約・直角連結・pillノード・紺×オレンジ。下に白テロップ。
//   実写パートはピンク顔アイコンのプレースホルダ(footageなし・練習)。
// ───────────────────────────────────────────────────────────────

const C = {
  bg: "#FCFBF7",
  ink: "#1F3A5F",
  orange: "#E8912D",
  orangeBg: "#FBEBD4",
  gray: "#AEB8C2",
  grayBg: "#EDF0F3",
  white: "#FFFFFF",
};
const FPS_LOCAL = 30;
export const NEN_FRAMES = 1350; // 45s

const TALK_IN = 405;   // 0-13.5s
const DIAG = 795;      // 13.5-40s
const TALK_OUT = 150;  // 40-45s
const CX = 540;

// ── アニメ ────────────────────────────────────────────
const useS = (delay: number, dur = 10, cfg: Parameters<typeof spring>[0]["config"] = { damping: 13, stiffness: 150, mass: 0.7 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: f - delay, fps, config: cfg, durationInFrames: dur });
};
const Pop: React.FC<{ delay: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ delay, style, children }) => {
  const s = useS(delay);
  return <div style={{ opacity: Math.min(1, s * 2), transform: `scale(${s})`, transformOrigin: "center", ...style }}>{children}</div>;
};
// 対象外フェード(自営業)：reveal後にグレーへ
const dimAt = (f: number, at: number) => interpolate(f, [at, at + 9], [1, 0.4], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

// 直角連結線（draw）。segs=[[x,y]...] の折れ線
const Ortho: React.FC<{ pts: number[][]; delay: number; color?: string; w?: number; dur?: number }> = ({ pts, delay, color = C.ink, w = 3, dur = 10 }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [delay, delay + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const d = pts.map((pt, i) => `${i === 0 ? "M" : "L"}${pt[0]} ${pt[1]}`).join(" ");
  return <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} opacity={p > 0.001 ? 1 : 0} />;
};

// ── pill ノード ───────────────────────────────────────
const Pill: React.FC<{ x: number; y: number; delay: number; text: string; variant: "navy" | "orange" | "outline"; size?: number; padY?: number; op?: number; emph?: string }> = ({ x, y, delay, text, variant, size = 32, padY = 12, op = 1, emph }) => {
  const bg = variant === "navy" ? C.ink : variant === "orange" ? C.orange : "#fff";
  const col = variant === "outline" ? C.ink : "#fff";
  const bd = variant === "outline" ? `2px solid ${C.ink}` : "none";
  return (
    <Pop delay={delay} style={{ position: "absolute", left: 0, top: y, width: 1080, display: "flex", justifyContent: "center", opacity: op, pointerEvents: "none" }}>
      <div style={{ transform: `translateX(${x - CX}px)`, background: bg, color: col, border: bd, borderRadius: 999, padding: `${padY}px 22px`, fontSize: size, fontWeight: 800, boxShadow: variant === "outline" ? "none" : "0 4px 10px rgba(31,58,95,0.12)", whiteSpace: "nowrap", lineHeight: 1 }}>
        {emph
          ? text.split(emph).flatMap((seg, i) => i === 0 ? [seg] : [<span key={i} style={{ color: variant === "navy" ? C.orange : col }}>{emph}</span>, seg])
          : text}
      </div>
    </Pop>
  );
};

// 任意位置ラベル
const Label: React.FC<{ x: number; y: number; delay: number; children: React.ReactNode; size?: number; color?: string; weight?: number; op?: number }> = ({ x, y, delay, children, size = 30, color = C.ink, weight = 800, op = 1 }) => (
  <Pop delay={delay} style={{ position: "absolute", left: 0, top: y, width: 1080, display: "flex", justifyContent: "center", opacity: op }}>
    <div style={{ transform: `translateX(${x - CX}px)`, fontSize: size, fontWeight: weight, color, whiteSpace: "nowrap", lineHeight: 1.1 }}>{children}</div>
  </Pop>
);

// ── アイコン ─────────────────────────────────────────
const Icon: React.FC<{ x: number; y: number; delay: number; op?: number; children: React.ReactNode }> = ({ x, y, delay, op = 1, children }) => (
  <Pop delay={delay} style={{ position: "absolute", left: x - 40, top: y, width: 80, height: 80, display: "flex", alignItems: "center", justifyContent: "center", opacity: op }}>{children}</Pop>
);
const svgPerson = (c = C.ink) => <svg width="54" height="54" viewBox="0 0 48 48"><circle cx="24" cy="15" r="8.5" fill={c} /><path d="M9 42c0-8.5 6.5-14 15-14s15 5.5 15 14" fill={c} /></svg>;
const PersonDoc: React.FC<{ c?: string }> = ({ c = C.ink }) => (
  <svg width="68" height="56" viewBox="0 0 68 56"><circle cx="20" cy="15" r="9" fill={c} /><path d="M4 50c0-9 7-15 16-15s16 6 16 15" fill={c} /><rect x="42" y="12" width="22" height="30" rx="3" fill="#fff" stroke={c} strokeWidth="3" /><rect x="47" y="19" width="12" height="3" rx="1.5" fill={c} /><rect x="47" y="26" width="12" height="3" rx="1.5" fill={c} /><rect x="47" y="33" width="8" height="3" rx="1.5" fill={c} /></svg>
);
const PersonPC: React.FC<{ c?: string }> = ({ c = C.ink }) => (
  <svg width="68" height="56" viewBox="0 0 68 56"><circle cx="20" cy="15" r="9" fill={c} /><path d="M4 50c0-9 7-15 16-15s16 6 16 15" fill={c} /><rect x="40" y="18" width="26" height="18" rx="2" fill="#fff" stroke={c} strokeWidth="3" /><rect x="37" y="37" width="32" height="4" rx="2" fill={c} /></svg>
);
const CalcIcon: React.FC = () => (
  <svg width="64" height="64" viewBox="0 0 48 48"><rect x="9" y="4" width="30" height="40" rx="5" fill="#fff" stroke={C.orange} strokeWidth="3.5" /><rect x="14" y="9" width="20" height="8" rx="2" fill={C.orange} /><circle cx="17" cy="25" r="2.4" fill={C.orange} /><circle cx="24" cy="25" r="2.4" fill={C.orange} /><circle cx="31" cy="25" r="2.4" fill={C.orange} /><circle cx="17" cy="33" r="2.4" fill={C.orange} /><circle cx="24" cy="33" r="2.4" fill={C.orange} /><circle cx="31" cy="33" r="2.4" fill={C.orange} /></svg>
);
const EnvIcon: React.FC<{ c?: string }> = ({ c = C.ink }) => (
  <svg width="72" height="54" viewBox="0 0 72 54"><rect x="3" y="6" width="66" height="44" rx="5" fill="#fff" stroke={c} strokeWidth="3.5" /><path d="M6 10l30 22 30-22" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" /><rect x="12" y="34" width="20" height="3.5" rx="1.5" fill={c} opacity="0.5" /></svg>
);
const Paycheck: React.FC = () => (
  <svg width="86" height="60" viewBox="0 0 86 60"><rect x="2" y="8" width="56" height="40" rx="4" fill="#fff" stroke={C.ink} strokeWidth="3" /><path d="M5 12l25 18 25-18" fill="none" stroke={C.ink} strokeWidth="2.5" /><ellipse cx="66" cy="44" rx="13" ry="5" fill={C.orange} /><ellipse cx="66" cy="39" rx="13" ry="5" fill={C.orange} /><ellipse cx="66" cy="34" rx="13" ry="5" fill="#F3A94E" /><text x="66" y="38" textAnchor="middle" fontSize="8" fontWeight="800" fill="#fff" fontFamily={FONT}>¥</text></svg>
);

// 月チップ(1列12個)＋¥コイン、完成後に橙枠
const MonthRow: React.FC<{ y: number; delay: number }> = ({ y, delay }) => {
  const f = useCurrentFrame();
  const months = ["1","2","3","4","5","6","7","8","9","10","11","12"];
  const pitch = 76, startX = 108, w = 56;
  const borderP = interpolate(f, [delay + 48, delay + 62], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <>
      {borderP > 0 && (
        <div style={{ position: "absolute", left: startX - 16, top: y - 10, width: pitch * 11 + w + 32, height: 118, border: `3px solid ${C.orange}`, borderRadius: 16, opacity: borderP }} />
      )}
      {months.map((m, i) => (
        <Pop key={i} delay={delay + i * 4} style={{ position: "absolute", left: startX + i * pitch, top: y, width: w }}>
          <div style={{ width: w, height: 50, background: "#fff", border: `2px solid ${C.ink}`, borderRadius: 8, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: C.ink }}>{m}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>月</span>
          </div>
          <div style={{ width: 30, height: 30, margin: "6px auto 0", borderRadius: "50%", background: C.orange, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 17, fontWeight: 800, color: "#fff" }}>¥</span>
          </div>
        </Pop>
      ))}
    </>
  );
};

// 2×2 チェックグリッド
const CheckGrid: React.FC<{ x: number; y: number; delay: number }> = ({ x, y, delay }) => {
  const cells = [["家族", "保険"], ["iDeCo", "住宅ローン"]];
  const cw = 210, ch = 62;
  return (
    <>
      {cells.map((row, r) => row.map((c, ci) => (
        <Pop key={`${r}-${ci}`} delay={delay + (r * 2 + ci) * 6} style={{ position: "absolute", left: x + ci * cw, top: y + r * ch, width: cw, height: ch }}>
          <div style={{ width: "100%", height: "100%", boxSizing: "border-box", border: `2px solid ${C.ink}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#fff" }}>
            <span style={{ color: C.ink, fontWeight: 900, fontSize: 28 }}>✓</span>
            <span style={{ fontSize: 28, fontWeight: 800, color: C.ink }}>{c}</span>
          </div>
        </Pop>
      )))}
    </>
  );
};

// ── 下部テロップ（白太字＋影） ─────────────────────────
type Tel = { at: number; text: string; big?: boolean };
const Telop: React.FC<{ cues: Tel[]; base: number }> = ({ cues, base }) => {
  const f = useCurrentFrame() - base;
  let cur = cues[0];
  for (const c of cues) if (f >= c.at) cur = c;
  const s = spring({ frame: f - cur.at, fps: FPS_LOCAL, config: { damping: 18 }, durationInFrames: 12 });
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: cur.big ? 560 : 1500, display: "flex", justifyContent: "center" }}>
      <div style={{ opacity: Math.min(1, s * 1.7), transform: `translateY(${(1 - s) * 14}px)`, textAlign: "center" }}>
        <span style={{ fontSize: cur.big ? 96 : 52, fontWeight: 900, color: "#fff", lineHeight: 1.25, textShadow: "2.5px 2.5px 0 #1F3A5F, -2.5px 2.5px 0 #1F3A5F, 2.5px -2.5px 0 #1F3A5F, -2.5px -2.5px 0 #1F3A5F, 0 0 2px #1F3A5F, 0 5px 14px rgba(20,30,60,0.35)", whiteSpace: "pre-line" }}>{cur.text}</span>
      </div>
    </div>
  );
};

// ピンク顔アイコン（実写の顔隠し）
const FaceAvatar: React.FC<{ size?: number }> = ({ size = 300 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="48" fill="#F6C9D4" />
    <circle cx="50" cy="50" r="40" fill="#FDEEF1" />
    <path d="M30 40c0-14 9-20 20-20s20 6 20 20c-3-8-10-11-20-11s-17 3-20 11z" fill="#4A3B33" />
    <circle cx="40" cy="50" r="3.6" fill="#3A2E28" /><circle cx="60" cy="50" r="3.6" fill="#3A2E28" />
    <path d="M44 60q6 5 12 0" fill="none" stroke="#3A2E28" strokeWidth="2.2" strokeLinecap="round" />
    <circle cx="34" cy="57" r="4" fill="#F4A6B6" opacity="0.6" /><circle cx="66" cy="57" r="4" fill="#F4A6B6" opacity="0.6" />
  </svg>
);

// 実写プレースホルダ背景（部屋風グラデ）
const RoomBG: React.FC = () => (
  <AbsoluteFill style={{ background: "linear-gradient(160deg, #3C4A5E 0%, #30404F 55%, #6B5C4A 55%, #7A6A54 100%)" }}>
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "55%", background: "#35475C" }} />
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "45%", background: "linear-gradient(180deg,#7A6A54,#6A5B46)" }} />
  </AbsoluteFill>
);

// ── 実写フック ───────────────────────────────────────
const TalkIn: React.FC = () => {
  const f = useCurrentFrame();
  const sirenPulse = 0.5 + 0.5 * Math.sin(f * 0.5);
  const cues: Tel[] = [
    { at: 0, text: "朗報です", big: true },
    { at: 45, text: "税金のルールが変わって" },
    { at: 105, text: "お金が例年より" },
    { at: 195, text: "適当に書いていた人は" },
    { at: 285, text: "最後まで見て保存してね" },
  ];
  const showSiren = f < 45;
  return (
    <AbsoluteFill>
      <RoomBG />
      {showSiren && (
        <div style={{ position: "absolute", top: 150, left: 0, width: 1080, display: "flex", justifyContent: "center" }}>
          <div style={{ width: 120, height: 120, position: "relative" }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: "50% 50% 40% 40%", background: "#E23B3B", boxShadow: `0 0 ${40 + sirenPulse * 60}px ${20 + sirenPulse * 30}px rgba(226,59,59,${0.4 + sirenPulse * 0.4})` }} />
            <div style={{ position: "absolute", left: 34, top: 22, width: 24, height: 22, borderRadius: "50%", background: "#fff", opacity: 0.85 }} />
            <div style={{ position: "absolute", bottom: 0, left: 18, width: 84, height: 20, borderRadius: 6, background: C.ink }} />
          </div>
        </div>
      )}
      <div style={{ position: "absolute", top: 760, left: 0, width: 1080, display: "flex", justifyContent: "center" }}>
        <FaceAvatar size={300} />
      </div>
      <Telop cues={cues} base={0} />
    </AbsoluteFill>
  );
};

// ── 実写締め ─────────────────────────────────────────
const TalkOut: React.FC = () => {
  const cues: Tel[] = [
    { at: 0, text: "まずは保険のハガキを" },
    { at: 90, text: "大切な友達や家族にも" },
  ];
  return (
    <AbsoluteFill>
      <RoomBG />
      <div style={{ position: "absolute", top: 560, left: 0, width: 1080, display: "flex", justifyContent: "center" }}>
        <FaceAvatar size={300} />
      </div>
      {/* アカウント名カード（プレースホルダ） */}
      <Pop delay={30} style={{ position: "absolute", top: 1180, left: 90 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, background: "rgba(20,25,35,0.72)", borderRadius: 16, padding: "12px 18px" }}>
          <div style={{ width: 54, height: 54, borderRadius: "50%", background: "#F6C9D4" }} />
          <div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#fff" }}>kantaro_moneylife</div>
            <div style={{ fontSize: 20, color: "#CBD3DD" }}>かんたろ｜手取り13万のゼロから…</div>
          </div>
        </div>
      </Pop>
      <Telop cues={cues} base={0} />
    </AbsoluteFill>
  );
};

// ── 図解本体（1画面・上60%） ──────────────────────────
const Diagram: React.FC = () => {
  const f = useCurrentFrame();
  // reveal delays（Diagram内フレーム）
  const d = { emp: 10, self: 105, grayAt: 150, month: 195, calc: 285, form: 375, hagaki: 465, check: 555, kampu: 645, salary: 735 };
  const selfOp = f < d.grayAt ? 1 : dimAt(f, d.grayAt);

  // 座標
  const hubY = 300, colY = 470, pillY = 540, tagY = 600;
  const empX = 258, selfX = 812;
  const monthY = 700;
  const calcRowY = 850;
  const formY = 1075, checkY = 1055;
  const kampuY = 1270, kampuPillY = 1330, salaryY = 1300;

  const cues: Tel[] = [
    { at: 0, text: "会社員なら年末調整" },
    { at: 105, text: "1年分の税金を精算する" },
    { at: 195, text: "税金をざっくり" },
    { at: 285, text: "正しく計算し直すのが" },
    { at: 375, text: "書くのは家族" },
    { at: 465, text: "保険会社から届く" },
    { at: 555, text: "払いすぎてた税金は" },
    { at: 645, text: "一緒に戻ってくる" },
    { at: 735, text: "ここでまとめて\n戻ってくるよ" },
  ];

  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: FONT }}>
      {/* 連結線（直角・draw） */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {/* hub→分岐ブラケット */}
        <Ortho pts={[[CX, hubY + 36], [CX, 420], [empX, 420], [empX, colY - 6]]} delay={d.emp - 4} color={C.orange} />
        <Ortho pts={[[CX, 420], [selfX, 420], [selfX, colY - 6]]} delay={d.self - 4} color={C.gray} />
        {/* 会社員→月チップ */}
        <Ortho pts={[[empX, tagY + 26], [empX, monthY - 14]]} delay={d.month - 4} />
        {/* 答え合わせ→電卓 横線（テキスト右端から電卓へ） */}
        <Ortho pts={[[760, calcRowY - 4], [862, calcRowY - 4]]} delay={d.calc + 4} color={C.orange} w={3} />
        {/* 還付→給料 戻り矢印 */}
        <Ortho pts={[[700, kampuPillY + 6], [700, 1395], [250, 1395], [250, salaryY + 56]]} delay={d.salary - 2} color={C.ink} w={3.5} />
      </svg>
      {/* 戻り矢印の矢頭 */}
      <Pop delay={d.salary + 8} style={{ position: "absolute", left: 232, top: salaryY + 42 }}>
        <svg width="36" height="30" viewBox="0 0 36 30"><path d="M18 0 L36 18 L24 18 L24 30 L12 30 L12 18 L0 18 Z" fill={C.ink} transform="rotate(180 18 15)" /></svg>
      </Pop>

      {/* hub */}
      <Pop delay={d.emp - 6} style={{ position: "absolute", top: hubY - 46, left: 0, width: 1080, display: "flex", justifyContent: "center", alignItems: "center", gap: 10 }}>
        {svgPerson(C.ink)}
        <span style={{ fontSize: 38, fontWeight: 800, color: C.ink }}>日本で働く人</span>
      </Pop>

      {/* 会社員列 */}
      <Icon x={empX} y={colY - 50} delay={d.emp}><PersonDoc /></Icon>
      <Pill x={empX} y={pillY} delay={d.emp} text="会社員" variant="navy" />
      <Pill x={empX} y={tagY} delay={d.emp + 6} text="年末調整" variant="orange" size={28} padY={10} />

      {/* 自営業列（後でグレーアウト） */}
      <Icon x={selfX} y={colY - 50} delay={d.self} op={selfOp}><PersonPC c={f < d.grayAt ? C.ink : C.gray} /></Icon>
      <Pill x={selfX} y={pillY} delay={d.self} text="自営業・フリーランス" variant="outline" size={26} op={selfOp} />
      <Pill x={selfX} y={tagY} delay={d.self + 6} text="確定申告" variant="outline" size={26} padY={9} op={selfOp} />

      {/* 月チップ */}
      <MonthRow y={monthY} delay={d.month} />

      {/* 毎月ざっくり天引き / 年末に答え合わせ / 電卓 / =年末調整 */}
      <Label x={250} y={calcRowY - 4} delay={d.month + 40}><span>毎月 <span style={{ color: C.orange }}>ざっくり天引き</span></span></Label>
      <Label x={620} y={calcRowY - 18} delay={d.calc} size={26}><span>年末に<span style={{ color: C.orange }}>答え合わせ</span></span></Label>
      <Icon x={900} y={calcRowY - 32} delay={d.calc + 4}><CalcIcon /></Icon>
      <Pill x={880} y={calcRowY + 40} delay={d.calc + 8} text="＝年末調整" variant="orange" size={26} padY={9} />

      {/* 保険会社のハガキ */}
      <Icon x={160} y={formY - 30} delay={d.hagaki}><EnvIcon /></Icon>
      <Label x={160} y={formY + 36} delay={d.hagaki + 4} size={22} weight={700}>保険会社のハガキ</Label>
      <Pill x={330} y={formY - 44} delay={d.check} text="写すだけOK" variant="navy" size={24} padY={8} />

      {/* 2×2 チェック */}
      <CheckGrid x={560} y={checkY} delay={d.form} />

      {/* 還付ブロック */}
      <Pill x={640} y={kampuY} delay={d.kampu} text="今年は減税分も" variant="navy" size={28} padY={10} emph="減税" />
      <Pill x={720} y={kampuPillY} delay={d.kampu + 8} text="還付" variant="orange" size={30} />
      <Icon x={170} y={salaryY - 8} delay={d.salary - 6}><Paycheck /></Icon>
      <Label x={190} y={salaryY + 56} delay={d.salary - 4} size={22} weight={700}>12月 or 1月の給料</Label>

      <Telop cues={cues} base={0} />
    </AbsoluteFill>
  );
};

// ── 本体 ───────────────────────────────────────────────
export const NenmatsuReel: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg, fontFamily: FONT }}>
    <Sequence from={0} durationInFrames={TALK_IN}><TalkIn /></Sequence>
    <Sequence from={TALK_IN} durationInFrames={DIAG}><Diagram /></Sequence>
    <Sequence from={TALK_IN + DIAG} durationInFrames={TALK_OUT}><TalkOut /></Sequence>
  </AbsoluteFill>
);
