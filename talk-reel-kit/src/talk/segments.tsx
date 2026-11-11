import React from "react";
import { AbsoluteFill, Easing, OffthreadVideo, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { F, clamp } from "../lib/anim";
import { K } from "../lib/font";
import type { Segment } from "./types";

// ════════════════════════════════════════════════════════════
//  画面の型（参考：海外のトークリール）。2〜4秒ごとに切り替えると飽きない
//   full ＝本人だけ（ゆっくり寄り）
//   split＝上半分：画面の録画・画像・図／下半分：本人。字幕は分かれ目のすぐ下
//   card ＝本人が角丸のカードに縮む。後ろは同じ映像を大きく・ぼかして・暗く＋巨大な影の文字が横に流れる
//   sky  ＝空のような背景。文字が1つずつ書かれ、細い線で次へつながり、カメラが下へ流れる
//   end  ＝文字だけの締め
// ════════════════════════════════════════════════════════════
export const segAt = (segs: Segment[] | undefined, t: number) => segs?.find((s) => t >= s.from && t < s.to);

// 字幕の位置（画面の型ごと）。null＝字幕を出さない
export const capTop = (s: Segment | undefined): number | null => {
  if (!s || s.mode === "full") return 1180;
  if (s.mode === "split") return 985;
  if (s.mode === "card") return 1080;
  return null;
};

const Talk: React.FC<{ src: string; scale?: number; pos?: string; style?: React.CSSProperties }> = ({ src, scale = 1, pos = "50% 40%", style }) => (
  <OffthreadVideo src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: pos, transform: `scale(${scale})`, transformOrigin: "50% 38%", ...style }} />
);

const grade = (mono?: boolean, g = true) => [mono ? "grayscale(1) contrast(1.1)" : "", g ? "contrast(1.08) saturate(1.12) brightness(0.98)" : ""].join(" ").trim() || undefined;

export const SegmentView: React.FC<{ seg: Segment | undefined; video: string; zoom: number; gradeOn: boolean }> = ({ seg, video, zoom, gradeOn }) => {
  const f = useCurrentFrame();
  const d = seg ? f - F(seg.from) : 999;
  const enter = interpolate(d, [0, 5], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) }); // 切り替えの最初の5フレーム

  if (!seg || seg.mode === "full") {
    return <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "50% 38%" }}><Talk src={video} style={{ filter: grade(seg?.mono, gradeOn) }} /></AbsoluteFill>;
  }
  if (seg.mode === "split") {
    return (
      <AbsoluteFill style={{ background: "#0E0E12" }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 960, overflow: "hidden", background: "#F4F5F8" }}>
          <div style={{ position: "absolute", inset: 0, transform: `scale(${1.06 - 0.06 * enter + (f - F(seg.from)) * 0.0004})` }}>
            {seg.top.video
              ? <OffthreadVideo src={staticFile(seg.top.src)} muted style={{ width: "100%", height: "100%", objectFit: seg.top.fit ?? "cover" }} />
              : <Img src={staticFile(seg.top.src)} style={{ width: "100%", height: "100%", objectFit: seg.top.fit ?? "cover" }} />}
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 140, background: "linear-gradient(transparent, rgba(0,0,0,0.25))" }} />
        </div>
        <div style={{ position: "absolute", left: 0, top: 960, width: 1080, height: 960, overflow: "hidden" }}>
          <Talk src={video} scale={zoom} pos="50% 30%" style={{ filter: grade(seg.mono, gradeOn) }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 220, background: "linear-gradient(rgba(0,0,0,0.35), transparent)" }} />
        </div>
      </AbsoluteFill>
    );
  }
  if (seg.mode === "card") {
    const k = 0.9 + 0.1 * enter;
    const drift = (f - F(seg.from)) * 7;
    return (
      <AbsoluteFill style={{ background: "#000" }}>
        <AbsoluteFill style={{ filter: `blur(22px) brightness(0.42) ${seg.mono ? "grayscale(1)" : ""}` }}><Talk src={video} scale={1.3} /></AbsoluteFill>
        {seg.echo ? <div style={{ position: "absolute", left: 0, top: 1260, whiteSpace: "nowrap", transform: `translateX(${260 - drift}px)`, ...K, fontSize: 250, color: "rgba(255,255,255,0.16)", filter: "blur(5px)" }}>{seg.echo}　{seg.echo}</div> : null}
        <div style={{ position: "absolute", left: 40, top: 640, width: 1000, height: 600, borderRadius: 34, overflow: "hidden", boxShadow: "0 30px 70px rgba(0,0,0,0.55)", transform: `scale(${k})`, opacity: enter }}>
          <Talk src={video} scale={zoom * 1.05} pos="50% 32%" style={{ filter: grade(seg.mono, gradeOn) }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(transparent 45%, rgba(0,0,0,0.35))" }} />
        </div>
      </AbsoluteFill>
    );
  }
  if (seg.mode === "sky") return <Sky seg={seg} />;
  return <End seg={seg} />;
};

// ── 空の背景のフロー図 ─────────────────────────────────────────
const GAP = 300;
const Sky: React.FC<{ seg: Extract<Segment, { mode: "sky" }> }> = ({ seg }) => {
  const f = useCurrentFrame(); const t = f / 30;
  let cur = 0; seg.nodes.forEach((n, i) => { if (t >= n.t) cur = i; });
  // カメラ：今のノードが画面の真ん中に来るように、下へ流れる（0.45秒・ためて→スッ）
  let cam = 0;
  seg.nodes.forEach((n, i) => { if (i > 0) cam += GAP * interpolate(f, [F(n.t) - 4, F(n.t) + 9], [0, 1], { ...clamp, easing: Easing.bezier(0.7, 0, 0.2, 1) }); });
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #FFFFFF 0%, #FBFAFF 38%, #ECEAFC 62%, #D9D5F7 100%)" }}>
      <AbsoluteFill style={{ background: "radial-gradient(60% 18% at 50% 50%, rgba(255,255,255,0.95), rgba(255,255,255,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, transform: `translateY(${-cam}px)` }}>
        {/* 一番上のノードの上にも線（ここから続いている感じ） */}
        <div style={{ position: "absolute", left: 539, top: 960 - 230, width: 3, height: 150, background: "#3A3A44", opacity: interpolate(f, [F(seg.from), F(seg.from) + 8], [0, 1], clamp) }} />
        {seg.nodes.map((n, i) => {
          const y = 960 + i * GAP;
          const show = t >= n.t - 0.05;
          const line = i > 0 ? interpolate(f, [F(n.t) - 8, F(n.t) + 2], [0, 1], clamp) : 0;
          const chars = [...n.text];
          const rev = interpolate(f, [F(n.t), F(n.t) + Math.max(8, chars.length * 1.6)], [0, chars.length], clamp);
          const mi = n.mark ? n.text.indexOf(n.mark) : -1;
          const markP = mi >= 0 ? interpolate(f, [F(n.t) + chars.length * 1.6, F(n.t) + chars.length * 1.6 + 8], [0, 1], clamp) : 0;
          const fade = i < cur ? 0.45 : 1;
          return (
            <React.Fragment key={i}>
              {i > 0 ? <div style={{ position: "absolute", left: 539, top: y - GAP + 60, width: 3, height: (GAP - 120) * line, background: "#3A3A44" }} /> : null}
              {show ? (
                <div style={{ position: "absolute", left: 60, right: 60, top: y - 40, textAlign: "center", ...K, fontSize: 62, color: "#18181F", opacity: fade, letterSpacing: 1 }}>
                  {chars.map((c, j) => {
                    const o = Math.max(0, Math.min(1, rev - j));
                    const inMark = mi >= 0 && j >= mi && j < mi + n.mark!.length;
                    return <span key={j} style={{ opacity: 0.15 + 0.85 * o, position: "relative", color: inMark ? "#18181F" : undefined }}>
                      {c}
                      {inMark && j === mi ? <svg width={n.mark!.length * 64} height={26} style={{ position: "absolute", left: 0, top: 70, overflow: "visible" }}>
                        <path d={`M2 14 Q ${n.mark!.length * 16} 4 ${n.mark!.length * 32} 13 T ${n.mark!.length * 62} 10`} fill="none" stroke="#E5484D" strokeWidth={5} strokeLinecap="round" strokeDasharray={n.mark!.length * 70} strokeDashoffset={n.mark!.length * 70 * (1 - markP)} />
                      </svg> : null}
                    </span>;
                  })}
                </div>
              ) : null}
            </React.Fragment>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ── 文字だけの締め ─────────────────────────────────────────
const End: React.FC<{ seg: Extract<Segment, { mode: "end" }> }> = ({ seg }) => {
  const f = useCurrentFrame(); const t = f / 30;
  let cur = -1; seg.lines.forEach((l, i) => { if (t >= l.t) cur = i; });
  const l = seg.lines[Math.max(0, cur)];
  const k = interpolate(f - F(l.t), [0, 4, 8], [0.9, 1.04, 1], clamp);
  return (
    <AbsoluteFill style={{ background: seg.dark ? "#050507" : "#E9E8E3", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {cur >= 0 ? <div style={{ ...K, fontSize: 84, lineHeight: 1.15, textAlign: "center", color: seg.dark ? "#fff" : "#111", transform: `scale(${k})`, padding: "0 70px", whiteSpace: "pre-line" }}>{l.text}</div> : null}
    </AbsoluteFill>
  );
};
