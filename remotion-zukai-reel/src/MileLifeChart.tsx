import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from "remotion";
import { A2 } from "./components/kit2";
import { FONT } from "./components/font";
import { SfxTrack } from "./components/sfx";
import { R } from "./mileTime";
import { B, GenSlot, Head, Intro, EXP, SUBS, MarkerSub, SubFade } from "./MileLifePlan";

// ════════════════════════════════════════════════════════════════════
//  マイル④ 横軸ライフプラン版（35.32–50.07）
//  横軸＝人生（親の年齢・例）、資産の線が上下しながら右肩上がり（相続リールの株グラフの発想）。
//  「今」ゾーン（子どもと過ごせる時期）は人生の中の限られた帯。年齢は出さない → そこから思い出の画像が飛び出す。
//  カードで囲まない：画像は背景に直置き、線・帯・ピルで見せる。
// ════════════════════════════════════════════════════════════════════

const START = 35.32;
const L = (abs: number) => Math.round((R(abs) - R(START)) * 30); // abs＝旧ナレの秒
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const io = { ...clamp, easing: Easing.inOut(Easing.cubic) };
const out = { ...clamp, easing: Easing.out(Easing.cubic) };
const pop = (f: number, at: number) => interpolate(f - at, [0, 3, 6], [0.3, 1.25, 1], clamp);

// グラフ座標
const A0 = 30, A1 = 85, X0 = 100, X1 = 980, BASE = 1110;
const ax = (age: number) => X0 + ((age - A0) * (X1 - X0)) / (A1 - A0);
const ANCH: [number, number][] = [[30, 0.06], [34, 0.13], [38, 0.2], [40, 0.24], [44, 0.33], [48, 0.44], [49, 0.41], [52, 0.24], [56, 0.34], [60, 0.5], [65, 0.66], [70, 0.6], [78, 0.46], [85, 0.36]];
const val = (a: number) => {
  let i = 0;
  while (i < ANCH.length - 2 && a > ANCH[i + 1][0]) i++;
  const [a0, v0] = ANCH[i], [a1, v1] = ANCH[i + 1];
  const base = v0 + ((v1 - v0) * (a - a0)) / (a1 - a0);
  return base + 0.022 * Math.sin(a * 1.9) + 0.014 * Math.sin(a * 4.3 + 1); // 株っぽい上下
};
const ay = (age: number) => BASE - val(age) * 480;
const pathOf = (a0: number, a1: number) => {
  let d = "";
  for (let a = a0; a <= a1 + 1e-6; a += 0.5) d += `${d ? "L" : "M"}${ax(a).toFixed(1)} ${ay(a).toFixed(1)} `;
  return d;
};
const PATH_NOW = pathOf(30, 48);
const PATH_LIFE = pathOf(48, 85);
const FILL_LIFE = `${PATH_LIFE}L${ax(85)} ${BASE} L${ax(48)} ${BASE} Z`;
const NOW_X0 = ax(30), NOW_X1 = ax(48); // 今＝子どもと過ごせる時期（内部の目安。画面に年齢は出さない）

const Pill: React.FC<{ bg: string; color?: string; size?: number; children: React.ReactNode }> = ({ bg, color = "#fff", size = 40, children }) => (
  <span style={{ display: "inline-block", background: bg, color, ...B, fontSize: size, padding: `${size * 0.22}px ${size * 0.7}px`, borderRadius: 999, whiteSpace: "nowrap" }}>{children}</span>
);

// 思い出の画像：今ゾーンから飛び出す → 44.12で今ゾーンに戻って小さく収まる → 47.66でもう一度ポン
const Memory: React.FC<{ i: number; name: string }> = ({ i, name }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const at = L(41.5) + i * 4;
  if (f < at) return null;
  const s = spring({ frame: f - at, fps, config: { damping: 14, stiffness: 170, mass: 0.6 } });
  const gx = 410 + (i % 3) * 190, gy = 560 + Math.floor(i / 3) * 180; // 大きいグリッド（175px）
  const mx = NOW_X0 + 30 + (i % 3) * 76, my = 640 + Math.floor(i / 3) * 76; // 今ゾーン内のミニ（70px）
  const zc = { x: (NOW_X0 + NOW_X1) / 2 - 75, y: 900 };
  const back = interpolate(f, [L(44.12), L(44.12) + 14], [0, 1], io);
  const big = 175 / 150, mini = 70 / 150;
  const x0 = zc.x + (gx - zc.x) * s, y0 = zc.y + (gy - zc.y) * s;
  const x = x0 + (mx - x0) * back, y = y0 + (my - y0) * back;
  let sc = (0.2 + 0.8 * s) * (big + (mini - big) * back);
  const again = L(47.66) + i * 3;
  let hop = 0, pulse = 1;
  if (f >= again) {
    pulse = interpolate(f - again, [0, 3, 7, 10], [1, 1.7, 0.92, 1], clamp);
    hop = interpolate(f - again, [0, 3, 8], [0, -26, 0], clamp);
  }
  const grow = (150 * sc * (pulse - 1)) / 2; // ポンは中心から膨らむ
  return (
    <div style={{ position: "absolute", left: x - grow, top: y - grow + hop, width: 150, height: 150, transform: `scale(${sc * pulse})`, transformOrigin: "0 0", zIndex: pulse > 1.05 ? 2 : 1 }}>
      <GenSlot name={name} size={150} />
    </div>
  );
};

const Chart: React.FC = () => {
  const f = useCurrentFrame();
  const a = L(39.52);
  const nowP = interpolate(f, [a + 4, a + 22], [0, 1], out);
  const lifeP = interpolate(f, [L(44.12), L(45.7)], [0, 1], clamp);
  const axisP = interpolate(f, [a - 2, a + 10], [0, 1], out);
  const fillO = interpolate(f, [L(45.88), L(45.88) + 12], [0, 0.32], clamp);
  const eduAt = L(44.5), retAt = L(45.0);
  const glow = f >= L(47.66) ? 0.55 + 0.25 * Math.sin((f - L(47.66)) / 3) : 0.55;
  return (
    <>
      <svg width={1080} height={1240} style={{ position: "absolute", left: 0, top: 0 }}>
        {/* 今ゾーン（人生の中のほんの短い帯） */}
        <rect x={NOW_X0} y={560} width={(NOW_X1 - NOW_X0) * nowP} height={BASE - 560} rx={14} fill={A2.marker} opacity={glow} />
        {/* 教育・老後ゾーン */}
        <rect x={ax(48)} y={560} width={(ax(52) - ax(48)) * interpolate(f, [eduAt - 4, eduAt + 6], [0, 1], out)} height={BASE - 560} rx={10} fill={A2.green} opacity={0.14} />
        <rect x={ax(65)} y={560} width={(ax(85) - ax(65)) * interpolate(f, [retAt - 2, retAt + 10], [0, 1], out)} height={BASE - 560} rx={10} fill={A2.coral} opacity={0.12} />
        {/* 将来への備え＝線の下を塗る */}
        <path d={FILL_LIFE} fill={A2.green} opacity={fillO} />
        {/* 軸 */}
        <line x1={X0} y1={BASE} x2={X0 + (X1 + 20 - X0) * axisP} y2={BASE} stroke={A2.ink} strokeWidth={5} strokeLinecap="round" />
        <line x1={X0} y1={BASE} x2={X0} y2={BASE - 550 * axisP} stroke={A2.ink} strokeWidth={5} strokeLinecap="round" />
        {/* 資産の線：今の部分 → 人生の残り */}
        <path d={PATH_NOW} fill="none" stroke={A2.green} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - nowP} opacity={nowP > 0.01 ? 1 : 0} />
        <path d={PATH_LIFE} fill="none" stroke={A2.green} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - lifeP} opacity={lifeP > 0.01 ? 1 : 0} />
        {/* 教育資金で減る／老後に取り崩す：下向き矢印 */}
        {[{ x: ax(50.5), y1: ay(49) - 10, y2: ay(52) + 6, at: eduAt + 4 }, { x: ax(75), y1: ay(66) - 10, y2: ay(78) + 6, at: retAt + 6 }].map((r, i) => {
          const p = interpolate(f, [r.at, r.at + 10], [0, 1], out);
          if (p <= 0) return null;
          const ye = r.y1 + (r.y2 - r.y1) * p;
          return (
            <g key={i} stroke={i ? A2.coral : A2.green} strokeWidth={5} strokeLinecap="round" fill="none">
              <line x1={r.x} y1={r.y1} x2={r.x} y2={ye} strokeDasharray="10 9" />
              <path d={`M${r.x - 11} ${ye - 13} L${r.x} ${ye} L${r.x + 11} ${ye - 13}`} opacity={p > 0.6 ? 1 : 0} />
            </g>
          );
        })}
      </svg>
      {/* 軸ラベル */}
      <div style={{ position: "absolute", left: X0 - 10, top: 515, ...B, fontSize: 28, color: A2.sub, opacity: axisP }}>お金</div>
      <div style={{ position: "absolute", right: 70, top: BASE + 16, ...B, fontSize: 30, color: A2.sub, opacity: axisP }}>人生の時間 →</div>
      {/* 今ラベル */}
      {f >= a + 6 ? (
        <div style={{ position: "absolute", left: NOW_X0, top: 575, width: NOW_X1 - NOW_X0, textAlign: "center", transform: `scale(${pop(f, a + 6)})` }}>
          <div style={{ ...B, fontSize: 60, color: A2.ink, lineHeight: 1 }}>今</div>
        </div>
      ) : null}
      {/* 教育資金 */}
      {f >= eduAt ? (
        <div style={{ position: "absolute", left: ax(53) - 150, top: 575, width: 300, textAlign: "center", transform: `scale(${pop(f, eduAt)})` }}>
          <div style={{ display: "flex", justifyContent: "center" }}><GenSlot name="mile_lp_edu_fund" size={160} /></div>
          <div style={{ marginTop: 6 }}><Pill bg={A2.green} size={34}>教育資金</Pill></div>
        </div>
      ) : null}
      {/* 老後資金 */}
      {f >= retAt ? (
        <div style={{ position: "absolute", left: ax(70) - 150, top: 530, width: 300, textAlign: "center", transform: `scale(${pop(f, retAt)})` }}>
          <div style={{ display: "flex", justifyContent: "center" }}><GenSlot name="mile_lp_retire_fund" size={140} /></div>
          <div style={{ marginTop: 6 }}><Pill bg={A2.coral} size={34}>老後資金</Pill></div>
        </div>
      ) : null}
      {/* 思い出（今ゾーンから飛び出す） */}
      {EXP.map(([n], i) => <Memory key={n} i={i} name={n} />)}
    </>
  );
};

// まとめ：今の経験 ＝ 将来の備え（上段のピル）＋ 同じくらい大切
export const Equal: React.FC = () => {
  const f = useCurrentFrame();
  const a = L(47.66);
  if (f < a) return null;
  const eq = L(48.5), band = L(49.02);
  return (
    <>
      <div style={{ position: "absolute", left: 60, top: 410, width: 960, display: "flex", justifyContent: "center", alignItems: "center", gap: 26 }}>
        <div style={{ transform: `scale(${pop(f, a + 2)})` }}><Pill bg={A2.marker} color={A2.ink} size={44}>今の経験</Pill></div>
        <div style={{ ...B, fontSize: 70, color: A2.ink, opacity: f >= eq ? 1 : 0, transform: `scale(${f >= eq ? pop(f, eq) : 0})` }}>＝</div>
        <div style={{ opacity: f >= eq ? 1 : 0, transform: `scale(${f >= eq ? pop(f, eq + 2) : 0})` }}><Pill bg={A2.green} size={44}>将来の備え</Pill></div>
      </div>
      {f >= band ? (
        <div style={{ position: "absolute", left: 110, top: 1205, width: 860, transform: `scale(${pop(f, band)})` }}>
          <div style={{ background: A2.marker, borderRadius: 24, padding: "20px 0", textAlign: "center", ...B, fontSize: 60, color: A2.ink }}>同じくらい大切</div>
        </div>
      ) : null}
    </>
  );
};

export const LifeChart: React.FC = () => {
  const f = useCurrentFrame();
  const a = L(39.52);
  if (f < a - 2) return null;
  const enter = interpolate(f, [a - 2, a + 10], [1, 0], out);
  return (
    <AbsoluteFill style={{ opacity: 1 - enter, transform: `translateY(${enter * 80}px)` }}>
      <Chart />
      <Head text={<>子どもが小さい<span style={{ color: A2.green }}>今</span>だからこそ</>} from={a} to={L(44.12)} />
      <Head text={<>将来への<span style={{ color: A2.green }}>備え</span>も大切</>} from={L(44.12)} to={L(47.66)} />
      <Head text={<>今しかできない<span style={{ color: A2.green }}>経験</span>も</>} from={L(47.66)} />
    </AbsoluteFill>
  );
};

const CUES: { file: string; at: number; volume: number }[] = [
  { file: "user/u03s", at: L(36.02), volume: 0.3 },
  { file: "user/u02s", at: L(37.08), volume: 0.32 },
  { file: "user/u05s", at: L(38.86), volume: 0.32 },
  { file: "user/u03", at: L(39.52), volume: 0.3 },
  ...EXP.map((_, i) => ({ file: "user/u02s", at: L(41.5) + i * 4, volume: 0.18 })),
  { file: "user/u05s", at: L(44.12), volume: 0.28 },
  { file: "user/u02s", at: L(44.5), volume: 0.28 },
  { file: "user/u02s", at: L(45.0), volume: 0.28 },
  { file: "user/u03s", at: L(45.88), volume: 0.26 },
  { file: "user/u03", at: L(47.66), volume: 0.3 },
  ...EXP.map((_, i) => ({ file: "user/u02s", at: L(47.66) + i * 3, volume: 0.16 })),
  { file: "user/u05s", at: L(48.5), volume: 0.3 },
  { file: "user/u10", at: L(49.02), volume: 0.3 },
];

export const MILE_LC_FRAMES = L(50.07) + 20;

export const MileLifeChart: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: A2.bg, fontFamily: FONT }}>
    <Audio src={staticFile("mile-narration.wav")} trimBefore={Math.round(R(START) * 30)} />
    <SfxTrack cues={CUES} />
    <LifeChart />
    <SubFade />
    <Intro />
    <Equal />
    <MarkerSub subs={SUBS.map(([t, s]) => [R(t), s] as [number, string])} start={R(START)} end={R(50.04)} />
  </AbsoluteFill>
);
