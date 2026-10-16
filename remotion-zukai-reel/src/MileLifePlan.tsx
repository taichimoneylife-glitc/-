import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, interpolate, spring, useVideoConfig, Easing } from "remotion";
import { A2, Mark2 } from "./components/kit2";
import { FONT } from "./components/font";
import { SfxTrack } from "./components/sfx";
import { R } from "./mileTime";
import { GEN_AVAILABLE } from "./genManifest";

// ════════════════════════════════════════════════════════════════════
//  マイル④ 練習：ライフプラン図解（画像差し込み前提）
//  見た目＝投資の三大原則（薄黄×白カード×リッチなイラスト）。技術＝reel-idea-catalog.md
//  ・縦長の1枚キャンバスをカメラが話に合わせて移動（紙芝居にしない）
//  ・画像は GenSlot：public/gen に置いて `node scripts/gen-manifest.mjs` → 自動で差し替わる
//  音声＝mile-narration.wav の 35.32s〜50.07s（「そして僕がマイルを…同じくらい大切です」）
// ════════════════════════════════════════════════════════════════════

const START = 35.32;
const L = (abs: number) => Math.round((R(abs) - R(START)) * 30); // abs＝旧ナレの秒
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const io = { ...clamp, easing: Easing.inOut(Easing.cubic) };
const out = { ...clamp, easing: Easing.out(Easing.cubic) };
export const B = { fontFamily: FONT, fontWeight: 800 as const };

// ── 画像スロット：あれば画像、無ければファイル名入りの点線枠 ──
export const GenSlot: React.FC<{ name: string; size: number; label?: string }> = ({ name, size, label }) =>
  GEN_AVAILABLE.has(name) ? (
    <Img src={staticFile(`gen/${name}.png`)} style={{ width: size, height: size, objectFit: "contain" }} />
  ) : (
    <div style={{ width: size, height: size, borderRadius: 20, border: `3px dashed ${A2.bar}`, background: "rgba(255,255,255,0.6)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 8, boxSizing: "border-box" }}>
      <div style={{ ...B, fontSize: Math.max(14, size * 0.09), color: A2.sub, wordBreak: "break-all" }}>{name}</div>
      {label ? <div style={{ ...B, fontSize: Math.max(14, size * 0.08), color: A2.bar, marginTop: 4 }}>{label}</div> : null}
    </div>
  );

// C3：やわらかく下から入る
export const useIn = (at: number, dy = 36) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - at, fps, config: { damping: 15, stiffness: 190, mass: 0.6 } });
  return { on: f >= at, style: { opacity: interpolate(f - at, [0, 5], [0, 1], clamp), transform: `translateY(${(1 - s) * dy}px) scale(${0.92 + 0.08 * s})` } as React.CSSProperties };
};
export const In: React.FC<{ at: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ at, style, children }) => {
  const p = useIn(at);
  if (!p.on) return null;
  return <div style={{ position: "absolute", ...style, ...p.style }}>{children}</div>;
};
export const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ background: "#fff", borderRadius: 28, boxShadow: "0 14px 32px rgba(80,60,20,0.12)", ...style }}>{children}</div>
);

// 見出し（三大原則のHeadPlain：インク太字＋緑の短い下線）
export const Head: React.FC<{ text: React.ReactNode; from: number; to?: number }> = ({ text, from, to = 99999 }) => {
  const f = useCurrentFrame();
  if (f < from || f >= to) return null;
  const p = interpolate(f, [from, from + 8], [0, 1], out);
  return (
    <div style={{ position: "absolute", left: 0, top: 262, width: 1080, textAlign: "center", opacity: p, transform: `translateY(${(1 - p) * 18}px)` }}>
      <div style={{ ...B, fontSize: 58, color: A2.ink, letterSpacing: 1 }}>{text}</div>
      <div style={{ width: interpolate(f, [from + 4, from + 12], [0, 132], out), height: 12, borderRadius: 999, background: A2.green, margin: "14px auto 0" }} />
    </div>
  );
};

// ── 導入：取消線リビール（35.32–39.52）──
export const Intro: React.FC = () => {
  const f = useCurrentFrame();
  const end = L(39.52);
  if (f >= end + 10) return null;
  const leave = interpolate(f, [end, end + 10], [0, 1], io);
  const sAt = L(38.86);
  const g = interpolate(f, [sAt, sAt + 9], [0, 1], out);
  return (
    <AbsoluteFill style={{ transform: `translateY(${-leave * 260}px)`, opacity: 1 - leave }}>
      <Head text="マイルをすすめる理由" from={L(36.02)} />
      <In at={L(37.08)} style={{ left: 300, top: 450 }}><GenSlot name="mile_plane" size={480} label="飛行機" /></In>
      <In at={L(37.54)} style={{ left: 0, top: 930, width: 1080, textAlign: "center" }}>
        <span style={{ position: "relative", display: "inline-block", ...B, fontSize: 76, color: f >= sAt ? A2.sub : A2.ink }}>
          飛行機代がお得
          <span style={{ position: "absolute", left: -10, top: "52%", height: 12, width: `calc(${g * 100}% + 20px)`, background: A2.coral, borderRadius: 6 }} />
        </span>
      </In>
      <In at={L(39.0)} style={{ left: 0, top: 1060, width: 1080, textAlign: "center" }}>
        <span style={{ display: "inline-block", background: A2.coral, color: "#fff", ...B, fontSize: 52, padding: "10px 40px", borderRadius: 999 }}>だけじゃない</span>
      </In>
    </AbsoluteFill>
  );
};

// ── ライフプラン（縦長キャンバス＋カメラ）39.52–47.66 ──
export const EXP: [string, string][] = [
  ["mile_now_window", "はじめての飛行機"], ["mile_now_beach", "家族で海"], ["mile_now_shoulder", "旅先で肩車"],
  ["mile_now_snow", "雪あそび"], ["mile_now_photo", "家族写真"], ["mile_now_hotel", "ホテルではしゃぐ"],
  ["mile_now_grandma", "じいじ・ばあばに会う"], ["mile_now_dinner", "旅先ごはん"], ["mile_now_hug", "一緒がいい"],
];
const SPINE = 150;
const AgeNode: React.FC<{ y: number; age: string; at: number; gold?: boolean }> = ({ y, age, at, gold }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const s = interpolate(f - at, [0, 3, 7], [0.2, 1.3, 1], clamp);
  return (
    <>
      <div style={{ position: "absolute", left: SPINE - (gold ? 26 : 18), top: y - (gold ? 26 : 18), width: gold ? 52 : 36, height: gold ? 52 : 36, borderRadius: "50%", background: gold ? A2.marker : A2.green, border: `6px solid ${gold ? "#E6C63E" : "#fff"}`, transform: `scale(${s})`, boxShadow: "0 4px 10px rgba(80,60,20,0.15)" }} />
      <div style={{ position: "absolute", left: 6, top: y + 34, width: 290, textAlign: "left", ...B, fontSize: 30, color: gold ? A2.ink : A2.sub, opacity: interpolate(f - at, [0, 6], [0, 1], clamp) }}>{age}</div>
    </>
  );
};
const RowCard: React.FC<{ y: number; at: number; img: string; title: React.ReactNode; sub: string; tint?: string; imgSize?: number }> = ({ y, at, img, title, sub, tint = "#fff", imgSize = 190 }) => (
  <In at={at} style={{ left: 220, top: y - imgSize / 2 - 20, width: 800 }}>
    <Card style={{ display: "flex", alignItems: "center", gap: 24, padding: "20px 28px", background: tint }}>
      <GenSlot name={img} size={imgSize} />
      <div>
        <div style={{ ...B, fontSize: 46, color: A2.ink, lineHeight: 1.2 }}>{title}</div>
        <div style={{ ...B, fontSize: 28, color: A2.sub, marginTop: 6 }}>{sub}</div>
      </div>
    </Card>
  </In>
);

const LifePlan: React.FC = () => {
  const f = useCurrentFrame();
  const a = L(39.52), z = L(47.66);
  if (f < a - 2 || f >= z + 12) return null;
  // カメラ（canvas座標の上端 camY を画面 y=0 に合わせる）
  const camY =
    f < L(41.3) ? -20 :
    f < L(44.12) ? interpolate(f, [L(41.3), L(42.6)], [-20, 420], io) :
    f < L(45.0) ? interpolate(f, [L(44.12), L(44.9)], [420, 1330], io) :
    interpolate(f, [L(45.0), L(45.8)], [1330, 2230], io);
  const enter = interpolate(f, [a - 2, a + 10], [1, 0], out);
  const leave = interpolate(f, [z, z + 12], [0, 1], io);
  const spineH = interpolate(f, [a, L(45.8)], [0, 2700], clamp);
  return (
    <AbsoluteFill style={{ opacity: 1 - leave, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 3400, transform: `translateY(${-camY + enter * 500}px) scale(${1 - leave * 0.15})`, transformOrigin: "540px 600px" }}>
        {/* 背骨（時間軸）が伸びる */}
        <div style={{ position: "absolute", left: SPINE - 5, top: 520, width: 10, height: spineH, background: A2.track, borderRadius: 5 }} />
        {/* 今しかできないゾーン */}
        <div style={{ position: "absolute", left: SPINE - 9, top: 520, width: 18, height: interpolate(f, [L(41.3), L(42.6)], [0, 1180], out), background: A2.marker, borderRadius: 9 }} />
        {/* 教育資金ゾーン */}
        {f >= L(44.12) ? <div style={{ position: "absolute", left: SPINE - 9, top: 1790, width: 18, height: interpolate(f, [L(44.12), L(44.9)], [0, 900], out), background: A2.green, borderRadius: 9, opacity: 0.85 }} /> : null}
        {/* 老後資金ゾーン */}
        {f >= L(45.0) ? <div style={{ position: "absolute", left: SPINE - 9, top: 2960, width: 18, height: interpolate(f, [L(45.0), L(45.8)], [0, 380], out), background: A2.coral, borderRadius: 9, opacity: 0.85 }} /> : null}

        {/* 今 */}
        <AgeNode y={560} age="今" at={a + 4} gold />
        <In at={a + 4} style={{ left: 220, top: 450, width: 800 }}>
          <Card style={{ display: "flex", alignItems: "center", gap: 24, padding: "20px 28px", background: "#FFFBEA", border: `4px solid ${A2.marker}` }}>
            <GenSlot name="mile_parent_kids" size={220} label="親子" />
            <div>
              <div style={{ ...B, fontSize: 32, color: A2.sub }}>0〜10歳ごろ</div>
              <div style={{ ...B, fontSize: 54, color: A2.ink, lineHeight: 1.2 }}>子どもが<br /><Mark2 delay={L(40.38)}>小さい今</Mark2></div>
            </div>
          </Card>
        </In>
        {/* 今しかできない経験（9枚がポンポン）*/}
        <In at={L(41.3)} style={{ left: 220, top: 790 }}><div style={{ ...B, fontSize: 36, color: A2.ink }}>家族との<span style={{ color: A2.green }}>思い出・経験</span></div></In>
        {EXP.map(([n, cap], i) => {
          const at = L(41.5) + i * 5;
          const x = 220 + (i % 3) * 270, y = 860 + Math.floor(i / 3) * 290;
          return (
            <In key={n} at={at} style={{ left: x, top: y, width: 250 }}>
              <Card style={{ padding: "14px 0 12px", textAlign: "center" }}>
                <GenSlot name={n} size={200} />
                <div style={{ ...B, fontSize: 24, color: A2.ink, marginTop: 4 }}>{cap}</div>
              </Card>
            </In>
          );
        })}
        {/* 教育資金 */}
        <AgeNode y={1900} age="6歳 小学校" at={L(44.12)} />
        <RowCard y={1900} at={L(44.12)} img="mile_lp_school" title="小学校入学" sub="ランドセル・学童" />
        <AgeNode y={2160} age="15歳 高校" at={L(44.3)} />
        <RowCard y={2160} at={L(44.3)} img="mile_lp_highschool" title="高校" sub="塾・部活" />
        <AgeNode y={2420} age="18歳 大学" at={L(44.48)} />
        <RowCard y={2420} at={L(44.48)} img="mile_lp_university" title="大学" sub="いちばんお金がかかる時期" />
        <RowCard y={2680} at={L(44.68)} img="mile_lp_edu_fund" title={<><span style={{ color: A2.green }}>教育資金</span></>} sub="計画的に準備" tint="#E9F6EF" imgSize={170} />
        {/* 老後資金 */}
        <AgeNode y={3020} age="65歳 老後" at={L(45.0)} />
        <RowCard y={3020} at={L(45.0)} img="mile_lp_retired" title="老後" sub="夫婦の時間" />
        <RowCard y={3270} at={L(45.25)} img="mile_lp_retire_fund" title={<><span style={{ color: A2.coral }}>老後資金</span></>} sub="こつこつ準備" tint="#FDEEE8" imgSize={170} />
      </div>
      {/* 固定の見出し（場面に合わせて差し替え） */}
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 420, background: `linear-gradient(${A2.bg} 78%, rgba(251,246,216,0))` }} />
      <Head text={<>子どもが小さい<span style={{ color: A2.green }}>今</span>だからこそ</>} from={a} to={L(44.12)} />
      <Head text={<>将来への<span style={{ color: A2.green }}>備え</span>も大切</>} from={L(44.12)} />
    </AbsoluteFill>
  );
};

// ── まとめ：今の経験 ＝ 将来の備え（47.66–）──
const Summary: React.FC = () => {
  const f = useCurrentFrame();
  const a = L(47.66);
  if (f < a) return null;
  const eq = interpolate(f - L(48.5), [0, 2, 5], [0.3, 1.33, 1], clamp);
  return (
    <AbsoluteFill>
      <Head text={<>今しかできない<span style={{ color: A2.green }}>経験</span>も</>} from={a} />
      <In at={a + 2} style={{ left: 70, top: 470, width: 430 }}>
        <Card style={{ padding: "26px 0 24px", textAlign: "center", border: `4px solid ${A2.marker}` }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
            <GenSlot name="mile_now_beach" size={130} /><GenSlot name="mile_now_window" size={130} />
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 6 }}>
            <GenSlot name="mile_now_photo" size={130} /><GenSlot name="mile_now_hug" size={130} />
          </div>
          <div style={{ ...B, fontSize: 40, color: A2.ink, marginTop: 14 }}>今の経験</div>
        </Card>
      </In>
      <In at={a + 8} style={{ left: 580, top: 470, width: 430 }}>
        <Card style={{ padding: "26px 0 24px", textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
            <GenSlot name="mile_lp_edu_fund" size={130} /><GenSlot name="mile_lp_university" size={130} />
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 6 }}>
            <GenSlot name="mile_lp_retire_fund" size={130} /><GenSlot name="mile_lp_retired" size={130} />
          </div>
          <div style={{ ...B, fontSize: 40, color: A2.ink, marginTop: 14 }}>将来の備え</div>
        </Card>
      </In>
      {f >= L(48.5) ? <div style={{ position: "absolute", left: 490, top: 690, width: 100, textAlign: "center", ...B, fontSize: 96, color: A2.green, transform: `scale(${eq})` }}>＝</div> : null}
      <In at={L(49.02)} style={{ left: 110, top: 1070, width: 860 }}>
        <div style={{ background: A2.marker, borderRadius: 24, padding: "26px 0", textAlign: "center", ...B, fontSize: 62, color: A2.ink }}>同じくらい大切</div>
      </In>
    </AbsoluteFill>
  );
};

// ── 下テロップ：話す速さでマーカーが走る（A4）──
export const SUBS: [number, string][] = [
  [35.32, "そして僕が"], [36.02, "マイルをお勧めするのは"], [37.08, "単に飛行機代が"], [38.22, "お得になるから"], [38.86, "ではありません"],
  [39.52, "子供が小さい"], [40.38, "今だからこそできる"], [41.3, "家族との思い出や経験"], [42.64, "これを増やしてほしいからです"],
  [44.12, "教育資金や老後資金など"], [45.88, "将来への備えも大切ですが"], [47.66, "今しかできない経験も"], [49.02, "同じくらい大切です"],
];
export const MarkerSub: React.FC<{ subs: [number, string][]; start: number; end: number }> = ({ subs, start, end }) => {
  const f = useCurrentFrame();
  const t = start + f / 30;
  let i = -1;
  subs.forEach(([s], k) => { if (t >= s) i = k; });
  if (i < 0 || t > end) return null;
  const [s, txt] = subs[i];
  const e = i + 1 < subs.length ? subs[i + 1][0] : end;
  const prog = interpolate(t, [s, s + (e - s) * 0.85], [0, 100], clamp);
  return (
    <div style={{ position: "absolute", left: 0, top: 1372, width: 1080, display: "flex", justifyContent: "center" }}>
      <span style={{ position: "relative", display: "inline-block", ...B, fontSize: 54, color: A2.ink, whiteSpace: "nowrap" }}>
        <span style={{ position: "absolute", left: -10, right: `${100 - prog}%`, top: "50%", bottom: "2%", background: A2.marker, borderRadius: 8, zIndex: 0 }} />
        <span style={{ position: "relative", textShadow: "0 0 10px #FBF6D8, 0 0 4px #FBF6D8" }}>{txt}</span>
      </span>
    </div>
  );
};
// 字幕の下地：キャンバスが字幕に重ならないよう下側をフェード
export const SubFade: React.FC = () => <div style={{ position: "absolute", left: 0, right: 0, top: 1230, bottom: 0, background: `linear-gradient(${A2.bg}00, ${A2.bg} 110px)` }} />;

const CUES: { file: string; at: number; volume: number }[] = [
  { file: "user/u03s", at: L(36.02), volume: 0.3 },
  { file: "user/u02s", at: L(37.08), volume: 0.32 },
  { file: "user/u05s", at: L(38.86), volume: 0.32 },
  { file: "user/u03", at: L(39.52), volume: 0.3 },
  ...EXP.map((_, i) => ({ file: "user/u02s", at: L(41.5) + i * 5, volume: 0.2 })),
  { file: "user/u03s", at: L(44.12), volume: 0.3 },
  { file: "user/u03s", at: L(45.0), volume: 0.28 },
  { file: "user/u03", at: L(47.66), volume: 0.3 },
  { file: "user/u05s", at: L(48.5), volume: 0.3 },
  { file: "user/u10", at: L(49.02), volume: 0.3 },
];

export const MILE_LP_FRAMES = L(50.07) + 20;

export const MileLifePlan: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: A2.bg, fontFamily: FONT }}>
    <Audio src={staticFile("mile-narration.wav")} trimBefore={Math.round(R(START) * 30)} />
    <SfxTrack cues={CUES} />
    <LifePlan />
    <SubFade />
    <Intro />
    <Summary />
    <MarkerSub subs={SUBS.map(([t, s]) => [R(t), s] as [number, string])} start={R(START)} end={R(50.04)} />
  </AbsoluteFill>
);
