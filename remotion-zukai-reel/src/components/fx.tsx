import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { A2 } from "./kit2";
import { K, SER } from "./zukaiKit";
import { B, GenSlot } from "../MileLifePlan";

// ════════════════════════════════════════════════════════════════════
//  参考⑤（AI編集20個）から選んだ演出を、太一の黄色ノートの色で部品にしたもの
//  各部品は「at＝出し始めのフレーム（場面の中で0から）」で動く。色はA2（黄色ノート）
//  01 BounceText 文字が弾む／02 PopOutPhone タイトル飛び出し／03 ScriptPage 台本ページ／04 DropText 文字が上から落ちる
//  06 CutoutText 切り抜き文字／07 Receipt レシート／10 CommentBox コメント誘導／12 SlotCount カウントアップ
//  13 PhotoGrid 写真が並ぶ／15 Scribble 画面に書き込み／17 ReelUI リール画面／Checklist 右上のチェックリスト
// ════════════════════════════════════════════════════════════════════
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const INK = A2.ink, RED = "#E8553B", BLUE = "#2F7BD9", GOLD = "#E9B82E", SUB = "#8C8471";

// ── 01 文字が弾む：1文字ずつ下から跳ねて出る ──
export const BounceText: React.FC<{ text: string; at?: number; size?: number; color?: string; step?: number; stroke?: boolean }> = ({ text, at = 0, size = 150, color = INK, step = 2, stroke = true }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  return (
    <span style={{ display: "inline-flex" }}>
      {Array.from(text).map((ch, i) => {
        const s = spring({ frame: f - at - i * step, fps, config: { damping: 7, stiffness: 180, mass: 0.6 } });
        return <span key={i} style={{ display: "inline-block", ...K, fontSize: size, color, lineHeight: 1.05, transform: `translateY(${(1 - s) * 140}px) scale(${0.4 + 0.6 * s}, ${0.4 + 0.6 * Math.min(1.2, s)})`, opacity: Math.min(1, s * 3), WebkitTextStroke: stroke ? `${size / 22}px ${A2.bg}` : undefined, paintOrder: "stroke" }}>{ch}</span>;
      })}
    </span>
  );
};

// ── 02 タイトル飛び出し：スマホの枠が奥から手前へ飛び出す ──
export const PopOutPhone: React.FC<{ at?: number; children: React.ReactNode; w?: number }> = ({ at = 0, children, w = 420 }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const s = spring({ frame: f - at, fps, config: { damping: 10, stiffness: 120, mass: 0.8 } });
  const k = interpolate(s, [0, 1], [0.45, 1]);
  return (
    <div style={{ width: w, height: w * 1.9, borderRadius: w * 0.12, background: INK, padding: w * 0.035, boxSizing: "border-box", transform: `scale(${k}) rotate(${(1 - s) * -8}deg)`, boxShadow: `0 ${20 + 40 * s}px ${40 + 60 * s}px rgba(60,40,10,${0.15 + 0.2 * s})`, opacity: Math.min(1, s * 3) }}>
      <div style={{ width: "100%", height: "100%", borderRadius: w * 0.09, overflow: "hidden", background: A2.bg, position: "relative" }}>{children}</div>
    </div>
  );
};

// ── 03 台本ページ：ノートに1行ずつタイプ。今の行にマーカー ──
export const ScriptPage: React.FC<{ lines: string[]; at?: number; per?: number; w?: number }> = ({ lines, at = 0, per = 12, w = 760 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ width: w, background: "#FFFDF4", borderRadius: 16, boxShadow: "0 16px 34px rgba(90,70,20,0.18)", padding: "34px 40px 30px 80px", boxSizing: "border-box", position: "relative", backgroundImage: "repeating-linear-gradient(transparent 0 66px, rgba(120,150,200,0.25) 66px 68px)", backgroundPosition: "0 22px" }}>
      <div style={{ position: "absolute", left: 56, top: 0, bottom: 0, width: 3, background: "rgba(232,85,59,0.45)" }} />
      {lines.map((ln, i) => {
        const a = at + i * per, d = f - a;
        if (d < 0) return <div key={i} style={{ height: 68 }} />;
        const n = Math.min(ln.length, Math.floor(d * 1.6));
        const cur = d < per;
        const mk = interpolate(d, [0, per * 0.7], [0, 1], clamp);
        return (
          <div key={i} style={{ height: 68, display: "flex", alignItems: "center", ...K, fontSize: 40, color: cur ? INK : SUB }}>
            <span style={{ position: "relative" }}>
              {cur ? <span style={{ position: "absolute", left: -4, bottom: 6, height: 20, width: `calc(${mk * 100}% + 8px)`, background: "rgba(255,201,60,0.7)", borderRadius: 6 }} /> : null}
              <span style={{ position: "relative" }}>{ln.slice(0, n)}</span>
              {cur && n < ln.length && Math.floor(f / 6) % 2 === 0 ? <span style={{ color: RED }}>|</span> : null}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// ── 04 文字が上から落ちる：1文字ずつ落ちて弾む（out＝落ちて消え始めるフレーム） ──
export const DropText: React.FC<{ text: string; at?: number; size?: number; color?: string; out?: number; step?: number }> = ({ text, at = 0, size = 170, color = INK, out = 9999, step = 3 }) => {
  const f = useCurrentFrame();
  return (
    <span style={{ display: "inline-flex" }}>
      {Array.from(text).map((ch, i) => {
        const d = f - at - i * step;
        const y = interpolate(d, [0, 7, 10, 13], [-420, 14, -6, 0], { ...clamp, easing: Easing.in(Easing.quad) });
        const od = f - out - i * 2;
        const y2 = od > 0 ? interpolate(od, [0, 10], [0, 900], { ...clamp, easing: Easing.in(Easing.cubic) }) : 0;
        return <span key={i} style={{ display: "inline-block", ...SER, fontSize: size, color, lineHeight: 1.05, transform: `translateY(${y + y2}px) rotate(${od > 0 ? od * (i % 2 ? 2 : -2) : 0}deg)`, opacity: d < 0 ? 0 : 1 }}>{ch}</span>;
      })}
    </span>
  );
};

// ── 06 切り抜き文字：太い文字の形に絵が抜かれる ──
export const CutoutText: React.FC<{ text: string; img: string; at?: number; size?: number }> = ({ text, img, at = 0, size = 230 }) => {
  const f = useCurrentFrame();
  const d = f - at;
  const k = interpolate(d, [0, 10], [1.3, 1], { ...clamp, easing: OUT });
  const pan = interpolate(d, [0, 60], [40, 60]);
  return (
    <div style={{ ...K, fontSize: size, lineHeight: 1, letterSpacing: -6, color: "transparent", backgroundImage: `url(${staticFile(`gen/${img}.png`)}), linear-gradient(${GOLD}, #F5C76A)`, backgroundSize: "160% auto, cover", backgroundPosition: `${pan}% 45%, 0 0`, WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextStroke: `6px ${INK}`, transform: `scale(${k})`, opacity: interpolate(d, [0, 4], [0, 1], clamp), whiteSpace: "nowrap" }}>{text}</div>
  );
};

// ── 07 レシート：上から印字されるように伸びて出る ──
export const Receipt: React.FC<{ title: string; rows: [string, string, boolean?][]; total: [string, string]; at?: number; w?: number }> = ({ title, rows, total, at = 0, w = 560 }) => {
  const f = useCurrentFrame();
  const H = 150 + rows.length * 70 + 110;
  const h = interpolate(f - at, [0, 24], [0, H], { ...clamp, easing: Easing.out(Easing.quad) });
  const zig = Array.from({ length: 21 }).map((_, i) => `${(i / 20) * 100}% ${i % 2 ? 100 : 97}%`).join(", ");
  return (
    <div style={{ width: w, height: h, overflow: "hidden", position: "relative", filter: "drop-shadow(0 12px 18px rgba(90,70,20,0.2))" }}>
      <div style={{ position: "absolute", left: 0, bottom: 0, width: w, height: H, background: "#fff", clipPath: `polygon(0 0, 100% 0, ${zig.split(", ").reverse().join(", ")})`, padding: "30px 36px", boxSizing: "border-box", fontFamily: "ui-monospace, Menlo, monospace" }}>
        <div style={{ textAlign: "center", ...K, fontSize: 34, color: INK }}>{title}</div>
        <div style={{ borderTop: `3px dashed ${SUB}`, margin: "16px 0" }} />
        {rows.map(([a, b, bad], i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", height: 70, alignItems: "center", ...K, fontSize: 32, color: INK }}><span>{a}</span><span style={{ color: bad ? RED : INK }}>{b}</span></div>
        ))}
        <div style={{ borderTop: `3px dashed ${SUB}`, margin: "10px 0" }} />
        <div style={{ display: "flex", justifyContent: "space-between", ...K, fontSize: 40, color: INK }}><span>{total[0]}</span><span style={{ color: RED }}>{total[1]}</span></div>
      </div>
    </div>
  );
};

// ── 10 コメント誘導：コメント欄にタイプ→送信→返信とハート ──
export const CommentBox: React.FC<{ text: string; reply: string; at?: number; w?: number }> = ({ text, reply, at = 0, w = 800 }) => {
  const f = useCurrentFrame(); const d = f - at;
  const n = Math.max(0, Math.min(text.length, Math.floor((d - 4) / 2.5)));
  const sent = d > 8 + text.length * 2.5;
  const rp = interpolate(d - (14 + text.length * 2.5), [0, 8], [0, 1], { ...clamp, easing: OUT });
  const hk = interpolate(d - (24 + text.length * 2.5), [0, 4, 7], [0, 1.4, 1], clamp);
  return (
    <div style={{ width: w }}>
      <div style={{ height: 100, borderRadius: 999, background: "#fff", boxShadow: "0 10px 24px rgba(90,70,20,0.15)", display: "flex", alignItems: "center", gap: 18, padding: "0 20px", boxSizing: "border-box" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#E9E2CC" }} />
        <div style={{ flex: 1, ...K, fontSize: 40, color: n ? INK : "#B7AE98" }}>{n ? text.slice(0, n) : "コメントを追加…"}</div>
        <div style={{ background: sent ? BLUE : "#B7D5F5", color: "#fff", borderRadius: 999, padding: "10px 26px", ...K, fontSize: 28 }}>送信</div>
      </div>
      {rp > 0 ? (
        <div style={{ marginTop: 24, marginLeft: 60, display: "flex", alignItems: "center", gap: 16, opacity: rp, transform: `translateY(${(1 - rp) * 20}px)` }}>
          <div style={{ width: 70, height: 70, borderRadius: "50%", overflow: "hidden", background: A2.bg, border: `3px solid ${INK}`, flex: "none" }}><GenSlot name="taichi_face_smile" size={70} /></div>
          <div style={{ background: "#fff", borderRadius: 24, padding: "14px 24px", ...K, fontSize: 32, color: INK, boxShadow: "0 6px 14px rgba(90,70,20,0.12)" }}><span style={{ ...B, fontSize: 22, color: SUB }}>たいち</span><br />{reply}</div>
          <div style={{ fontSize: 56, transform: `scale(${hk})`, color: RED }}>♥</div>
        </div>
      ) : null}
    </div>
  );
};

// ── 12 カウントアップ（スロット）：けたごとに縦に回って止まる ──
export const SlotCount: React.FC<{ value: string; at?: number; size?: number; color?: string }> = ({ value, at = 0, size = 170, color = BLUE }) => {
  const f = useCurrentFrame();
  const chars = Array.from(value);
  let digitIdx = 0;
  return (
    <span style={{ display: "inline-flex", alignItems: "flex-end" }}>
      {chars.map((ch, i) => {
        if (!/[0-9]/.test(ch)) return <span key={i} style={{ ...SER, fontSize: size, color, lineHeight: 1 }}>{ch}</span>;
        const di = digitIdx++;
        const stopAt = at + 18 + di * 6;
        const target = Number(ch);
        const spinP = interpolate(f, [at, stopAt], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
        const pos = (target + 20) * spinP; // 2周して止まる
        return (
          <span key={i} style={{ display: "inline-block", height: size, overflow: "hidden", ...SER, fontSize: size, lineHeight: `${size}px`, color }}>
            <span style={{ display: "block", transform: `translateY(${-(pos % 10) * size}px)`, filter: spinP < 0.95 ? `blur(${(1 - spinP) * 4}px)` : undefined }}>
              {Array.from({ length: 11 }).map((_, k) => <span key={k} style={{ display: "block", height: size }}>{k % 10}</span>)}
            </span>
          </span>
        );
      })}
    </span>
  );
};

// ── 13 写真が並ぶ：マスに1枚ずつ埋まる ──
export const PhotoGrid: React.FC<{ imgs: string[]; cols?: number; at?: number; cell?: number; step?: number }> = ({ imgs, cols = 4, at = 0, cell = 190, step = 2 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, ${cell}px)`, gap: 12 }}>
      {imgs.map((im, i) => {
        const p = interpolate(f - at - i * step, [0, 8], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.6)) });
        return <div key={i} style={{ width: cell, height: cell, borderRadius: 16, background: p > 0 ? "#fff" : "rgba(255,255,255,0.4)", border: `3px solid ${p > 0 ? INK : "rgba(176,146,60,0.3)"}`, boxSizing: "border-box", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ transform: `scale(${p})`, opacity: p }}><GenSlot name={im} size={cell - 20} /></div></div>;
      })}
    </div>
  );
};

// ── 15 画面に書き込み：手書きの丸・矢印・文字が描かれていく ──
export const Scribble: React.FC<{ at?: number; cx: number; cy: number; rx: number; ry: number; note: string; nx: number; ny: number; color?: string }> = ({ at = 0, cx, cy, rx, ry, note, nx, ny, color = RED }) => {
  const f = useCurrentFrame();
  const p1 = interpolate(f - at, [0, 12], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const p2 = interpolate(f - at, [12, 20], [0, 1], { ...clamp, easing: OUT });
  const nn = Math.max(0, Math.floor((f - at - 18) / 2.5));
  const N = 60, pts: string[] = [];
  for (let i = 0; i <= N; i++) { const t = i / N; const a = -Math.PI * 0.6 + t * Math.PI * 2.15; const g = 1 + 0.05 * t; pts.push(`${(cx + Math.cos(a) * rx * g).toFixed(1)},${(cy + Math.sin(a) * ry * g).toFixed(1)}`); }
  const L = 2.2 * Math.PI * (rx + ry) / 2;
  const ax0 = nx + 80, ay0 = ny + 70, ax1 = cx + rx * 0.7, ay1 = cy - ry * 0.75;
  return (
    <>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: `${L * p1} 9999` }} />
        {note && p2 > 0 ? <path d={`M${ax0},${ay0} Q${(ax0 + ax1) / 2 + 40},${ay0} ${ax0 + (ax1 - ax0) * p2},${ay0 + (ay1 - ay0) * p2}`} fill="none" stroke={color} strokeWidth={8} strokeLinecap="round" /> : null}
        {note && p2 > 0.95 ? <g transform={`translate(${ax1},${ay1}) rotate(${(Math.atan2(ay1 - ay0, ax1 - ax0) * 180) / Math.PI})`}><polyline points="-28,-16 0,0 -28,16" fill="none" stroke={color} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" /></g> : null}
      </svg>
      <div style={{ position: "absolute", left: nx, top: ny, ...K, fontWeight: 700, fontSize: 56, color, transform: "rotate(-6deg)", whiteSpace: "nowrap" }}>{note.slice(0, nn)}</div>
    </>
  );
};

// ── 17 リール画面：インスタのリールの見た目を重ね、保存ボタンを指す ──
export const ReelUI: React.FC<{ at?: number; name?: string; caption?: string; pointSave?: number; noProfile?: boolean }> = ({ at = 0, name = "たいち｜積立保険を売らない保険屋さん", caption = "保存して見返してね", pointSave, noProfile }) => {
  const f = useCurrentFrame();
  const o = interpolate(f - at, [0, 8], [0, 1], clamp);
  const icons: [string, string][] = [["♡", "1.2万"], ["💬", "320"], ["➤", ""], ["🔖", "保存"]];
  const sv = pointSave !== undefined ? f - pointSave : -1;
  return (
    <AbsoluteFill style={{ opacity: o, pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 520, background: "linear-gradient(transparent, rgba(0,0,0,0.45))" }} />
      <div style={{ position: "absolute", right: 30, bottom: 360, display: "flex", flexDirection: "column", gap: 34, alignItems: "center" }}>
        {icons.map(([ic, n], i) => {
          const hit = i === 3 && sv > 0;
          return (
            <div key={i} style={{ textAlign: "center", color: "#fff", transform: `scale(${hit ? interpolate(sv, [0, 4, 8], [1, 1.5, 1.2], clamp) : 1})` }}>
              <div style={{ fontSize: 60, lineHeight: 1, filter: hit ? `drop-shadow(0 0 12px ${GOLD})` : "drop-shadow(0 2px 4px rgba(0,0,0,0.5))", color: hit ? GOLD : "#fff" }}>{ic}</div>
              <div style={{ ...K, fontSize: 22, textShadow: "0 2px 4px rgba(0,0,0,0.6)" }}>{n}</div>
            </div>
          );
        })}
      </div>
      {noProfile ? null : <div style={{ position: "absolute", left: 40, right: 160, bottom: 220, color: "#fff", textShadow: "0 2px 6px rgba(0,0,0,0.6)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}><div style={{ width: 64, height: 64, borderRadius: "50%", overflow: "hidden", border: "3px solid #fff", background: A2.bg }}><GenSlot name="taichi_face_smile" size={64} /></div><span style={{ ...K, fontSize: 28 }}>{name}</span></div>
        <div style={{ ...B, fontSize: 28, marginTop: 10 }}>{caption}</div>
      </div>}
      {sv > 0 ? <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}><path d={`M700,1180 Q880,1150 ${960},${1920 - 380}`} fill="none" stroke={GOLD} strokeWidth={9} strokeLinecap="round" style={{ strokeDasharray: `${interpolate(sv, [0, 10], [0, 600], clamp)} 9999` }} /></svg> : null}
    </AbsoluteFill>
  );
};

// ── 右上のチェックリスト：今の行だけ光る（黄色ノートの付箋風） ──
export const Checklist: React.FC<{ title: string; items: string[]; cur: number; x?: number; y?: number; w?: number }> = ({ title, items, cur, x = 640, y = 260, w = 400 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, background: "rgba(255,253,244,0.96)", border: `4px solid ${INK}`, borderRadius: 20, boxShadow: `5px 6px 0 ${INK}`, padding: "16px 18px 14px", boxSizing: "border-box" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", ...K, fontSize: 24, color: INK, marginBottom: 6 }}><span>{title}</span><span style={{ fontFamily: "ui-monospace, Menlo, monospace", fontSize: 22, color: RED }}>{Math.max(0, cur + 1)} / {items.length}</span></div>
      {items.map((t, i) => {
        const on = i === cur, done = i < cur;
        return (
          <div key={t} style={{ display: "flex", alignItems: "center", gap: 10, height: 40, borderRadius: 10, padding: "0 10px", background: on ? "#FFE58A" : "transparent", transform: on ? `scale(${1 + 0.02 * Math.sin(f / 5)})` : undefined }}>
            <span style={{ fontFamily: "ui-monospace, Menlo, monospace", fontSize: 18, color: on ? RED : SUB, width: 26 }}>{String(i + 1).padStart(2, "0")}</span>
            <span style={{ ...K, fontSize: 24, color: on ? INK : done ? INK : SUB, opacity: done ? 0.6 : 1, textDecoration: done ? "line-through" : "none", textDecorationColor: RED }}>{t}</span>
          </div>
        );
      })}
    </div>
  );
};
