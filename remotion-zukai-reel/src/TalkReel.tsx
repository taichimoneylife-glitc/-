import React from "react";
import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { SfxTrack } from "./components/sfx";
import { FONT } from "./components/font";

// ══════════════════════════════════════════════════════════
//  トークリール自動編集（実写＋オーバーレイ）＝参考動画スタイルの完コピ試作
//  素材：public/mytalk.mp4（ユーザーの喋り／投資の三大原則・17.8s）
//  レイヤー：実写(下敷き)＋寄りズーム＋語ごとテロップ(下)＋図解チップ(上)＋効果音
//  ※ テロップ文言はユーザーの発話どおり（ASR誤り「見落とし価値/観光」は正しい語に修正）
// ══════════════════════════════════════════════════════════

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const FPS = 30;
export const TALK_FRAMES = 535; // 17.81s

// パレット（実写上で映える）
const C = { white: "#FFFFFF", orange: "#FF7A1A", green: "#37C86B", blue: "#3B82F6", mark: "#FFE14D", ink: "#20242C" };
const OUTLINE = "0 3px 0 rgba(0,0,0,0.55), 0 0 10px rgba(0,0,0,0.35)";

type Run = { t: string; c?: string; mark?: boolean };
type Seg = { f: number; runs: Run[] };

const SEGS: Seg[] = [
  { f: 0, runs: [{ t: "投資で" }, { t: "失敗", c: C.orange }, { t: "したくないなら" }] },
  { f: 47, runs: [{ t: "これだけ", mark: true }, { t: "を抑えてほしい" }] },
  { f: 89, runs: [{ t: "投資の" }, { t: "3大原則", c: C.orange }] },
  { f: 119, runs: [{ t: "長期", c: C.green }, { t: "・" }, { t: "積立", c: C.green }, { t: "・" }, { t: "分散", c: C.green }] },
  { f: 172, runs: [{ t: "この3つを分かりやすく解説します" }] },
  { f: 231, runs: [{ t: "この3つを守るだけで" }] },
  { f: 264, runs: [{ t: "投資はグッと" }, { t: "安定", c: C.green }, { t: "します" }] },
  { f: 314, runs: [{ t: "特に" }, { t: "資産の分散", c: C.orange }, { t: "は" }] },
  { f: 356, runs: [{ t: "見落としがち", mark: true }] },
  { f: 383, runs: [{ t: "ぜひ意識してみてください" }] },
  { f: 439, runs: [{ t: "参考になったら" }, { t: "保存", c: C.orange }, { t: "して" }] },
  { f: 476, runs: [{ t: "見返してもらえると嬉しいです" }] },
];

// ── 語ごとテロップ（下1/3・極太・縁取り、キーワード色＋黄マーカー）──
const Telop: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  let idx = 0;
  for (let i = 0; i < SEGS.length; i++) if (f >= SEGS[i].f) idx = i;
  const seg = SEGS[idx];
  const end = idx + 1 < SEGS.length ? SEGS[idx + 1].f : TALK_FRAMES;
  if (f >= end) return null;
  const s = spring({ frame: f - seg.f, fps, config: { damping: 13, stiffness: 160, mass: 0.7 }, durationInFrames: 12 });
  const pop = 0.9 + 0.1 * Math.min(1, s * 1.6);
  return (
    <div style={{ position: "absolute", left: 56, right: 56, top: 1340, textAlign: "center", transform: `scale(${pop})`, transformOrigin: "center" }}>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 68, lineHeight: 1.32, letterSpacing: 1 }}>
        {seg.runs.map((r, i) =>
          r.mark ? (
            <span key={i} style={{ position: "relative", display: "inline-block", color: C.ink }}>
              <span style={{ position: "absolute", left: -6, right: -6, top: "22%", bottom: "10%", background: C.mark, borderRadius: 10, zIndex: 0 }} />
              <span style={{ position: "relative", zIndex: 1 }}>{r.t}</span>
            </span>
          ) : (
            <span key={i} style={{ color: r.c || C.white, textShadow: OUTLINE }}>{r.t}</span>
          )
        )}
      </div>
    </div>
  );
};

// ── 図解チップ（上部・本棚のヘッドルームに乗せる。顔に被せない）──
const Chip: React.FC<{ show: number; hide: number; children: React.ReactNode; style?: React.CSSProperties; delay?: number }> = ({ show, hide, children, style, delay = 0 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < show || f >= hide) return null;
  const s = spring({ frame: f - show - delay, fps, config: { damping: 12, stiffness: 130, mass: 0.9 }, durationInFrames: 16 });
  const out = interpolate(f, [hide - 8, hide], [1, 0], clamp);
  return <div style={{ position: "absolute", opacity: Math.min(1, s * 1.6) * out, transform: `scale(${Math.min(1, s)})`, transformOrigin: "center", ...style }}>{children}</div>;
};

const Panels: React.FC = () => (
  <>
    {/* タイトルピル：投資の3大原則 */}
    <Chip show={89} hide={314} style={{ left: 0, right: 0, top: 96, display: "flex", justifyContent: "center" }}>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 46, color: "#fff", background: C.ink, padding: "16px 34px", borderRadius: 999, boxShadow: "0 10px 26px rgba(0,0,0,0.3)" }}>
        📈 投資の3大原則
      </div>
    </Chip>
    {/* 3チップ：長期・積立・分散（順にポップ） */}
    {[
      { t: "長期", d: 119, x: 150 },
      { t: "積立", d: 134, x: 440 },
      { t: "分散", d: 155, x: 730 },
    ].map((c, i) => (
      <Chip key={c.t} show={c.d} hide={314} style={{ left: c.x, top: 220, width: 200 }}>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 44, color: C.ink, background: "#fff", border: `4px solid ${C.green}`, padding: "16px 0", borderRadius: 20, textAlign: "center", boxShadow: "0 8px 20px rgba(0,0,0,0.22)" }}>
          <span style={{ color: C.green }}>{i + 1}</span> {c.t}
        </div>
      </Chip>
    ))}
    {/* 資産の分散＝見落としがち（手描きマル風） */}
    <Chip show={314} hide={439} style={{ left: 0, right: 0, top: 150, display: "flex", justifyContent: "center" }}>
      <div style={{ position: "relative", fontFamily: FONT, fontWeight: 900, fontSize: 48, color: C.ink, background: "#fff", padding: "18px 40px", borderRadius: 22, boxShadow: "0 10px 26px rgba(0,0,0,0.28)" }}>
        資産の分散
        <div style={{ position: "absolute", right: -18, top: -26, fontSize: 30, fontWeight: 900, color: "#fff", background: C.orange, padding: "6px 16px", borderRadius: 999, transform: "rotate(6deg)" }}>要注意</div>
      </div>
    </Chip>
    {/* 保存CTA */}
    <Chip show={439} hide={TALK_FRAMES} style={{ left: 0, right: 0, top: 120, display: "flex", justifyContent: "center" }}>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 42, color: C.ink, background: C.mark, padding: "16px 34px", borderRadius: 999, boxShadow: "0 10px 26px rgba(0,0,0,0.28)" }}>
        🔖 保存して見返そう
      </div>
    </Chip>
  </>
);

// ── 寄りズーム（常時ゆっくり＋キーワードでプッシュイン）──
const punches = [89, 264, 314, 356];
const useZoom = () => {
  const f = useCurrentFrame();
  const base = interpolate(f, [0, TALK_FRAMES], [1.02, 1.09], clamp);
  let bump = 0;
  for (const p of punches) bump += 0.035 * Math.max(0, 1 - Math.abs(f - (p + 6)) / 12);
  return base + bump;
};

export const TalkReel: React.FC = () => {
  const z = useZoom();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill style={{ transform: `scale(${z})`, transformOrigin: "50% 40%" }}>
        <OffthreadVideo src={staticFile("mytalk.mp4")} />
      </AbsoluteFill>
      <Panels />
      <Telop />
      <SfxTrack cues={[
        { file: "up5", at: 0, volume: 0.4 },
        { file: "pop", at: 47, volume: 0.42 },
        { file: "up6", at: 89, volume: 0.46 },
        { file: "up1", at: 119, volume: 0.46 },
        { file: "up2", at: 134, volume: 0.46 },
        { file: "up3", at: 155, volume: 0.46 },
        { file: "pop", at: 172, volume: 0.38 },
        { file: "pop", at: 231, volume: 0.38 },
        { file: "correct", at: 264, volume: 0.46 },
        { file: "swipe", at: 314, volume: 0.42 },
        { file: "correct", at: 356, volume: 0.44 },
        { file: "pop", at: 383, volume: 0.38 },
        { file: "up2", at: 439, volume: 0.46 },
        { file: "finish", at: 476, volume: 0.5 },
      ]} />
    </AbsoluteFill>
  );
};
