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
// 年末調整リール「完全再現」= 参考スタイルのテンプレ（音声なし・練習）
//   ・白背景 ＋ 積み上げ連結図解（カメラが下へパンしながら要素が増える）
//   ・下部に大きい青テロップ（読み上げ想定で順番に切替）
//   ・アクセントはオレンジ（年末調整・還付）／対象外はグレー
//   ・アイコンは全部コード内SVG（画像生成なし）
//   ・前後の実写トークはプレースホルダーのカードで代用
// ───────────────────────────────────────────────────────────────

const C = {
  bg: "#FFFFFF",
  ink: "#223049", // ダークネイビー（線・文字・アイコン）
  sub: "#6B7686",
  orange: "#F0872A", // 年末調整・還付
  orangeBg: "#FDEBD8",
  gray: "#9AA6B2", // 対象外（自営業）
  grayBg: "#EEF1F4",
  line: "#C9D2DD",
  blue: "#1F6FEB", // 下部大テロップ
  navy: "#1A2640", // トークカード背景
};

const FPS_LOCAL = 30;

// 全体フレーム：冒頭トーク(150) + 図解(1080) + 締め(120) = 1350 = 45s
export const NEN_FRAMES = 1350;
const TALK_IN = 150;
const DIAGRAM = 1080;
const TALK_OUT = 120;

// ── 小物 ───────────────────────────────────────────────
const useS = (delay: number, dur = 22, cfg: Parameters<typeof spring>[0]["config"] = { damping: 13, stiffness: 130, mass: 0.9 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: f - delay, fps, config: cfg, durationInFrames: dur });
};

const Pop: React.FC<{ delay: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ delay, style, children }) => {
  const s = useS(delay);
  return <div style={{ opacity: Math.min(1, s * 1.8), transform: `scale(${s})`, transformOrigin: "center", ...style }}>{children}</div>;
};

// つなぎ線（上のノード下端→下のノード上端）。board座標。
const Link: React.FC<{ x1: number; y1: number; x2: number; y2: number; delay: number; color?: string; dash?: boolean }> = ({ x1, y1, x2, y2, delay, color = C.line, dash }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [delay, delay + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const midY = (y1 + y2) / 2;
  const d = `M${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={6}
      strokeLinecap="round"
      pathLength={1}
      strokeDasharray={dash ? "10 12" : 1}
      strokeDashoffset={dash ? 0 : 1 - p}
      opacity={dash ? p : p > 0.001 ? 1 : 0}
    />
  );
};

// ── アイコン（コード内SVG・ネイビー） ─────────────────
type IcoProps = { s?: number; color?: string };
const IPerson: React.FC<IcoProps> = ({ s = 56, color = C.ink }) => (
  <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="15" r="9" fill={color} />
    <path d="M8 42c0-9 7-15 16-15s16 6 16 15" fill={color} />
  </svg>
);
const ICalc: React.FC<IcoProps> = ({ s = 56, color = C.ink }) => (
  <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
    <rect x="9" y="5" width="30" height="38" rx="5" fill={color} />
    <rect x="14" y="10" width="20" height="8" rx="2" fill="#fff" />
    <circle cx="16" cy="25" r="2.6" fill="#fff" /><circle cx="24" cy="25" r="2.6" fill="#fff" /><circle cx="32" cy="25" r="2.6" fill="#fff" />
    <circle cx="16" cy="33" r="2.6" fill="#fff" /><circle cx="24" cy="33" r="2.6" fill="#fff" /><circle cx="32" cy="33" r="2.6" fill="#fff" />
  </svg>
);
const IEnvelope: React.FC<IcoProps> = ({ s = 56, color = C.ink }) => (
  <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
    <rect x="5" y="11" width="38" height="26" rx="4" fill={color} />
    <path d="M7 14l17 12 17-12" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const ICoin: React.FC<IcoProps> = ({ s = 56, color = C.orange }) => (
  <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="18" fill={color} />
    <text x="24" y="31" textAnchor="middle" fontSize="20" fontWeight="800" fill="#fff" fontFamily={FONT}>¥</text>
  </svg>
);
const ICalendar: React.FC<IcoProps> = ({ s = 56, color = C.ink }) => (
  <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
    <rect x="7" y="9" width="34" height="32" rx="5" fill={color} />
    <rect x="7" y="9" width="34" height="10" rx="5" fill={C.orange} />
    <rect x="14" y="5" width="4" height="8" rx="2" fill={color} /><rect x="30" y="5" width="4" height="8" rx="2" fill={color} />
    <rect x="13" y="24" width="6" height="5" rx="1.5" fill="#fff" /><rect x="22" y="24" width="6" height="5" rx="1.5" fill="#fff" /><rect x="31" y="24" width="4" height="5" rx="1.5" fill="#fff" />
    <rect x="13" y="32" width="6" height="5" rx="1.5" fill="#fff" /><rect x="22" y="32" width="6" height="5" rx="1.5" fill="#fff" />
  </svg>
);
const IHouse: React.FC<IcoProps> = ({ s = 56, color = C.ink }) => (
  <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
    <path d="M24 7L7 21v20h34V21z" fill={color} />
    <rect x="20" y="29" width="8" height="12" fill="#fff" />
  </svg>
);
const IShield: React.FC<IcoProps> = ({ s = 56, color = C.ink }) => (
  <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
    <path d="M24 5l15 6v12c0 11-7 17-15 20-8-3-15-9-15-20V11z" fill={color} />
    <path d="M17 24l5 5 10-11" stroke="#fff" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IPiggy: React.FC<IcoProps> = ({ s = 56, color = C.ink }) => (
  <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
    <ellipse cx="23" cy="26" rx="17" ry="13" fill={color} />
    <circle cx="16" cy="24" r="2.4" fill="#fff" />
    <rect x="20" y="11" width="10" height="4" rx="2" fill={color} />
    <rect x="12" y="37" width="4" height="6" fill={color} /><rect x="30" y="37" width="4" height="6" fill={color} />
    <path d="M40 22c4 0 4 7 0 7" fill={color} />
  </svg>
);
const IFamily: React.FC<IcoProps> = ({ s = 56, color = C.ink }) => (
  <svg width={s} height={s} viewBox="0 0 56 48" fill="none">
    <circle cx="18" cy="14" r="7" fill={color} /><path d="M6 40c0-7 5-12 12-12s12 5 12 12" fill={color} />
    <circle cx="40" cy="17" r="5.5" fill={color} /><path d="M30 40c0-6 4-10 10-10s10 4 10 10" fill={color} />
  </svg>
);

// ── ノード（ラベル付きのカード） ─────────────────────
const Node: React.FC<{
  x: number; y: number; delay: number; w?: number;
  icon?: React.ReactNode; title: string; tag?: string; tagColor?: string; tagBg?: string;
  dim?: boolean; big?: boolean;
}> = ({ x, y, delay, w = 560, icon, title, tag, tagColor, tagBg, dim, big }) => {
  const border = dim ? C.gray : C.ink;
  const txt = dim ? C.gray : C.ink;
  return (
    <Pop delay={delay} style={{ position: "absolute", left: x - w / 2, top: y - (big ? 86 : 64), width: w }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 20,
        background: "#fff", border: `5px solid ${border}`, borderRadius: 22,
        padding: big ? "30px 30px" : "22px 26px",
        boxShadow: "0 8px 22px rgba(34,48,73,0.10)",
      }}>
        {icon && <div style={{ flexShrink: 0, opacity: dim ? 0.6 : 1 }}>{icon}</div>}
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: big ? 56 : 44, fontWeight: 800, color: txt, lineHeight: 1.18, whiteSpace: "pre-line" }}>{title}</div>
          {tag && (
            <div style={{ display: "inline-block", marginTop: 12, padding: "6px 20px", borderRadius: 999, fontSize: 32, fontWeight: 800, color: tagColor ?? "#fff", background: tagBg ?? C.orange }}>{tag}</div>
          )}
        </div>
      </div>
    </Pop>
  );
};

// ── チェック項目チップ（家族/保険/iDeCo/住宅ローン） ──
const Chip: React.FC<{ x: number; y: number; delay: number; icon: React.ReactNode; label: string }> = ({ x, y, delay, icon, label }) => (
  <Pop delay={delay} style={{ position: "absolute", left: x - 125, top: y - 70, width: 250 }}>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, background: C.orangeBg, border: `4px solid ${C.orange}`, borderRadius: 18, padding: "16px 10px" }}>
      {icon}
      <div style={{ fontSize: 30, fontWeight: 800, color: C.ink }}>{label}</div>
    </div>
  </Pop>
);

// ── 下部の大きい青テロップ（順番に切替） ───────────────
type Tel = { at: number; text: string };
const BottomTelop: React.FC<{ cues: Tel[]; base: number }> = ({ cues, base }) => {
  const f = useCurrentFrame() - base;
  let cur = cues[0];
  for (const c of cues) if (f >= c.at) cur = c;
  const local = f - cur.at;
  const s = spring({ frame: local, fps: FPS_LOCAL, config: { damping: 18 }, durationInFrames: 16 });
  const op = Math.min(1, s * 1.6);
  const y = (1 - s) * 26;
  return (
    <div style={{ position: "absolute", left: 60, right: 60, bottom: 150, display: "flex", justifyContent: "center" }}>
      <div style={{ opacity: op, transform: `translateY(${y}px)`, background: C.blue, color: "#fff", borderRadius: 20, padding: "22px 34px", maxWidth: 940, textAlign: "center", boxShadow: "0 10px 30px rgba(31,111,235,0.30)" }}>
        <span style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.26, whiteSpace: "pre-line" }}>{cur.text}</span>
      </div>
    </div>
  );
};

// ── 実写トーク代用カード（顔アイコンで隠す） ─────────────
const TalkCard: React.FC<{ cues: Tel[]; base: number; dur: number }> = ({ cues, base, dur }) => {
  const f = useCurrentFrame() - base;
  const fade = Math.min(
    interpolate(f, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    interpolate(f, [dur - 10, dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
  );
  let cur = cues[0];
  for (const c of cues) if (f >= c.at) cur = c;
  const local = f - cur.at;
  const s = spring({ frame: local, fps: FPS_LOCAL, config: { damping: 18 }, durationInFrames: 14 });
  return (
    <AbsoluteFill style={{ background: C.navy, opacity: fade, alignItems: "center", justifyContent: "center" }}>
      {/* 実写の代わり：顔を隠す丸＋「撮影」プレースホルダ */}
      <div style={{ position: "absolute", top: 430, width: 320, height: 320, borderRadius: "50%", background: "#2A3A5C", border: "6px solid #3C5080", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <IPerson s={150} color="#5A6E96" />
      </div>
      <div style={{ position: "absolute", top: 770, fontSize: 30, color: "#7E8EB2", fontWeight: 700 }}>（実写トーク）</div>
      <div style={{ position: "absolute", bottom: 360, left: 60, right: 60, display: "flex", justifyContent: "center" }}>
        <div style={{ opacity: Math.min(1, s * 1.6), transform: `translateY(${(1 - s) * 24}px)`, textAlign: "center" }}>
          <span style={{ fontSize: 64, fontWeight: 800, color: "#fff", lineHeight: 1.3, borderBottom: `8px solid ${C.orange}`, paddingBottom: 6, whiteSpace: "pre-line" }}>{cur.text}</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── 図解パート：積み上げ連結＋カメラパン ──────────────
const Diagram: React.FC = () => {
  const f = useCurrentFrame();

  // ノードのboard座標（縦に積む）とリール上の登場フレーム
  const CX = 540;
  const nodes = {
    hub: { x: CX, y: 150, at: 10 },
    emp: { x: 320, y: 420, at: 110 }, // 会社員→年末調整(orange)
    self: { x: 770, y: 420, at: 150 }, // 自営業(gray)
    tenbiki: { x: CX, y: 700, at: 250 },
    calc: { x: CX, y: 980, at: 360 },
    kazoku: { x: CX, y: 1230, at: 470 },
    check: { y: 1430 }, // chips row
    hagaki: { x: CX, y: 1700, at: 700 },
    ok: { x: CX, y: 1940, at: 800 },
    salary: { x: CX, y: 2180, at: 890 },
    kampu: { x: CX, y: 2440, at: 980 }, // 還付(orange, big)
  };

  // カメラパン：active node のyをビューポートy=540付近へ
  const camBP = [
    [10, 150], [110, 420], [250, 700], [360, 980], [470, 1230],
    [590, 1430], [700, 1700], [800, 1940], [890, 2180], [980, 2440], [DIAGRAM, 2440],
  ];
  const camY = interpolate(f, camBP.map((b) => b[0]), camBP.map((b) => b[1]), { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const offset = -(camY - 760);

  const telops: Tel[] = [
    { at: 10, text: "日本で働く人は" },
    { at: 110, text: "会社員なら「年末調整」" },
    { at: 250, text: "毎月ざっくり\n天引きされてる" },
    { at: 360, text: "年末にまとめて\n答え合わせするのが年末調整" },
    { at: 470, text: "書くのは家族のことなど" },
    { at: 590, text: "家族・保険・iDeCo・住宅ローン" },
    { at: 700, text: "保険会社のハガキを見ながら" },
    { at: 800, text: "答えるだけでOK" },
    { at: 890, text: "12月か1月の給料と" },
    { at: 980, text: "今年は減税分も\nまとめて戻ってくるよ" },
  ];

  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: FONT }}>
      {/* カメラ移動するレイヤー */}
      <AbsoluteFill style={{ transform: `translateY(${offset}px)` }}>
        {/* つなぎ線 */}
        <svg width={1080} height={2700} style={{ position: "absolute", inset: 0 }}>
          <Link x1={nodes.hub.x} y1={nodes.hub.y + 64} x2={nodes.emp.x} y2={nodes.emp.y - 64} delay={nodes.emp.at - 8} color={C.orange} />
          <Link x1={nodes.hub.x} y1={nodes.hub.y + 64} x2={nodes.self.x} y2={nodes.self.y - 64} delay={nodes.self.at - 8} color={C.gray} dash />
          <Link x1={nodes.emp.x} y1={nodes.emp.y + 64} x2={nodes.tenbiki.x} y2={nodes.tenbiki.y - 64} delay={nodes.tenbiki.at - 8} color={C.line} />
          <Link x1={nodes.tenbiki.x} y1={nodes.tenbiki.y + 64} x2={nodes.calc.x} y2={nodes.calc.y - 64} delay={nodes.calc.at - 8} color={C.line} />
          <Link x1={nodes.calc.x} y1={nodes.calc.y + 64} x2={nodes.kazoku.x} y2={nodes.kazoku.y - 64} delay={nodes.kazoku.at - 8} color={C.line} />
          <Link x1={nodes.kazoku.x} y1={nodes.kazoku.y + 64} x2={CX} y2={nodes.check.y - 90} delay={582} color={C.line} />
          <Link x1={CX} y1={nodes.check.y + 90} x2={nodes.hagaki.x} y2={nodes.hagaki.y - 64} delay={nodes.hagaki.at - 8} color={C.line} />
          <Link x1={nodes.hagaki.x} y1={nodes.hagaki.y + 64} x2={nodes.ok.x} y2={nodes.ok.y - 64} delay={nodes.ok.at - 8} color={C.line} />
          <Link x1={nodes.ok.x} y1={nodes.ok.y + 64} x2={nodes.salary.x} y2={nodes.salary.y - 64} delay={nodes.salary.at - 8} color={C.line} />
          <Link x1={nodes.salary.x} y1={nodes.salary.y + 64} x2={nodes.kampu.x} y2={nodes.kampu.y - 86} delay={nodes.kampu.at - 8} color={C.orange} />
        </svg>

        <Node x={nodes.hub.x} y={nodes.hub.y} delay={nodes.hub.at} w={520} icon={<IFamily s={70} />} title="日本で働く人" />
        <Node x={nodes.emp.x} y={nodes.emp.y} delay={nodes.emp.at} w={430} icon={<IPerson s={54} />} title={"会社員"} tag="年末調整" tagBg={C.orange} />
        <Node x={nodes.self.x} y={nodes.self.y} delay={nodes.self.at} w={430} icon={<IPerson s={54} color={C.gray} />} title={"自営業・\nフリーランス"} tag="確定申告" tagBg={C.gray} dim />
        <Node x={nodes.tenbiki.x} y={nodes.tenbiki.y} delay={nodes.tenbiki.at} w={620} icon={<ICoin s={56} />} title={"毎月ざっくり天引き"} />
        <Node x={nodes.calc.x} y={nodes.calc.y} delay={nodes.calc.at} w={640} icon={<ICalc s={58} />} title={"年末に答え合わせ"} tag="＝ 年末調整" tagBg={C.orange} />
        <Node x={nodes.kazoku.x} y={nodes.kazoku.y} delay={nodes.kazoku.at} w={560} title={"書くのは家族のことなど"} />

        {/* チェック項目4つ */}
        <Chip x={CX - 390} y={nodes.check.y} delay={590} icon={<IFamily s={46} />} label="家族" />
        <Chip x={CX - 130} y={nodes.check.y} delay={615} icon={<IShield s={46} />} label="保険" />
        <Chip x={CX + 130} y={nodes.check.y} delay={640} icon={<IPiggy s={46} />} label="iDeCo" />
        <Chip x={CX + 390} y={nodes.check.y} delay={665} icon={<IHouse s={46} />} label="住宅ローン" />

        <Node x={nodes.hagaki.x} y={nodes.hagaki.y} delay={nodes.hagaki.at} w={620} icon={<IEnvelope s={56} />} title={"保険会社のハガキを見て"} />
        <Node x={nodes.ok.x} y={nodes.ok.y} delay={nodes.ok.at} w={460} title={"答えるだけでOK"} />
        <Node x={nodes.salary.x} y={nodes.salary.y} delay={nodes.salary.at} w={620} icon={<ICalendar s={56} />} title={"12月 or 1月の給料と"} />
        <Node x={nodes.kampu.x} y={nodes.kampu.y} delay={nodes.kampu.at} w={700} big icon={<ICoin s={76} />} title={"今年は減税分も"} tag="還付（戻ってくる）" tagBg={C.orange} />
      </AbsoluteFill>

      {/* 固定の下部テロップ */}
      <BottomTelop cues={telops} base={0} />
    </AbsoluteFill>
  );
};

// ── 本体 ───────────────────────────────────────────────
export const NenmatsuReel: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: FONT }}>
      <Sequence from={0} durationInFrames={TALK_IN}>
        <TalkCard
          base={0}
          dur={TALK_IN}
          cues={[
            { at: 0, text: "年末調整って今年は" },
            { at: 40, text: "税金のルールが変わって" },
            { at: 80, text: "お金が例年より動くから" },
            { at: 115, text: "損しないように解説するね" },
          ]}
        />
      </Sequence>

      <Sequence from={TALK_IN} durationInFrames={DIAGRAM}>
        <Diagram />
      </Sequence>

      <Sequence from={TALK_IN + DIAGRAM} durationInFrames={TALK_OUT}>
        <TalkCard
          base={0}
          dur={TALK_OUT}
          cues={[{ at: 0, text: "大切な友達や家族にも\n教えてあげてね" }]}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
