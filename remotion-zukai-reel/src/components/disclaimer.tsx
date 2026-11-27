import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { K, B, M, F } from "./marke";

// ════════════════════════════════════════════════════════════════════
//  動画の最後の注意書き（2026-11-19 たいちさん指定：今後すべての動画の最後に入れる）
//  図解パートの最後に、声が終わってから約2.5秒。インスタの安全な枠（上150〜下1450）の中に、読める大きさで。
//  <EndNote at={声が終わる秒} title="この動画の数字は一例です" lines={["…\n…", "…"]} />（\n＝改行の位置）
// ════════════════════════════════════════════════════════════════════
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const END_NOTE_SEC = 2.6;
export const EndNote: React.FC<{ at: number; title?: string; lines: string[] }> = ({ at, title = "この動画の数字は一例です", lines }) => {
  const f = useCurrentFrame();
  if (f < F(at)) return null;
  const p = interpolate(f, [F(at), F(at) + 10], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.3)) });
  const bg = interpolate(f, [F(at), F(at) + 8], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <div style={{ position: "absolute", inset: 0, background: `rgba(251,246,216,${0.9 * bg})` }} />
      <div style={{ position: "absolute", left: 70, width: 760, top: 360, transform: `translateY(${(1 - p) * 120}px)`, opacity: Math.min(1, p * 2), background: "#fff", border: `7px solid ${M.ink}`, borderRadius: 26, boxShadow: `10px 10px 0 ${M.orange}`, padding: "28px 34px" }}>
        <div style={{ ...K, fontSize: 46, color: M.red }}>⚠ {title}</div>
        <div style={{ marginTop: 18 }}>
          {lines.map((l, i) => {
            // 「\n」で意味のかたまりごとに改行（自動の折り返しはしない）。長い行は文字を小さくして1行に収める
            const rows = l.split("\n");
            const size = Math.min(32, Math.floor(660 / Math.max(...rows.map((r) => r.length + 1))));
            return (
              <div key={i} style={{ display: "flex", ...B, fontSize: size, lineHeight: 1.45, color: M.ink, marginTop: i ? 12 : 0, opacity: interpolate(f, [F(at) + 6 + i * 4, F(at) + 12 + i * 4], [0, 1], clamp) }}>
                <span>・</span><span>{rows.map((r, j) => <div key={j} style={{ whiteSpace: "nowrap" }}>{r}</div>)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
