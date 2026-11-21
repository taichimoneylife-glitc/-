import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { K, B, M } from "./components/marke";
import { enter, PATTERN, PatternId, Tempo, TEMPO_NAME, stagger } from "./components/motionLib";

// ════════════════════════════════════════════════════════════════════
//  動き出しの見本帳：1ページ＝3パターン（行）× 3テンポ（列）。各マスは同じ合図で一斉に動き、2回くり返す
//  最後のページは「ずらし方の緩急」（同じ間隔／だんだん速く／だんだん遅く）
// ════════════════════════════════════════════════════════════════════
const IDS = Object.keys(PATTERN) as PatternId[];
const TEMPOS: Tempo[][] = [["kire", "std", "tame"], ["brake", "fuwa", "bounce"]];
const LOOP = 45; // 1回の長さ（1.5秒）
const PAGE = LOOP * 2;
const pages: { ids: PatternId[]; tempos: Tempo[] }[] = [];
for (const tempos of TEMPOS) for (let i = 0; i < IDS.length; i += 3) pages.push({ ids: IDS.slice(i, i + 3), tempos });
export const MOTION_CATALOG_FRAMES = PAGE * (pages.length + 1);

const Card: React.FC<{ style: React.CSSProperties }> = ({ style }) => (
  <div style={{ width: 230, height: 120, background: "#fff", border: `5px solid ${M.ink}`, borderRadius: 16, boxShadow: `6px 6px 0 ${M.green}`, display: "flex", alignItems: "center", justifyContent: "center", ...K, fontSize: 40, ...style }}>600<span style={{ fontSize: 22 }}>万円</span></div>
);

export const MotionCatalog: React.FC = () => {
  const f = useCurrentFrame();
  const pi = Math.floor(f / PAGE), lf = f % LOOP;
  if (pi >= pages.length) {
    // ずらし方の緩急
    const modes: ["even" | "accel" | "decel", string][] = [["even", "同じ間隔"], ["accel", "だんだん速く（後ろほど詰める）"], ["decel", "だんだん遅く（最後をためる）"]];
    return (
      <AbsoluteFill style={{ background: M.paper }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 70, textAlign: "center", ...K, fontSize: 52 }}>ずらし方の緩急（表の行・札が並ぶとき）</div>
        {modes.map(([m, name], r) => (
          <div key={m} style={{ position: "absolute", left: 40, top: 220 + r * 560, width: 1000 }}>
            <div style={{ ...K, fontSize: 38, color: M.green }}>{name}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} style={{ height: 62, width: 900, background: "#fff", border: `4px solid ${M.ink}`, borderRadius: 10, ...B, fontSize: 30, display: "flex", alignItems: "center", paddingLeft: 20, ...enter(lf, 4 + stagger(i, 6, 4, m), "slideL", "brake") }}>表の行 {i + 1}</div>
              ))}
            </div>
          </div>
        ))}
      </AbsoluteFill>
    );
  }
  const pg = pages[pi];
  return (
    <AbsoluteFill style={{ background: M.paper, backgroundImage: `repeating-linear-gradient(transparent 0 62px, ${M.grid} 62px 64px)` }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 60, textAlign: "center", ...K, fontSize: 46 }}>動き出しの見本 {pi + 1}/{pages.length + 1}</div>
      {pg.tempos.map((t, c) => (
        <div key={t} style={{ position: "absolute", left: 300 + c * 260, top: 150, width: 240, textAlign: "center", ...K, fontSize: 36, color: M.red }}>{TEMPO_NAME[t]}</div>
      ))}
      {pg.ids.map((id, r) => (
        <React.Fragment key={id}>
          <div style={{ position: "absolute", left: 20, top: 280 + r * 520, width: 270, ...K, fontSize: 36, lineHeight: 1.25 }}>{PATTERN[id].name}</div>
          {pg.tempos.map((t, c) => (
            <div key={t} style={{ position: "absolute", left: 300 + c * 260, top: 220 + r * 520, width: 240, height: 440, overflow: "hidden", borderRadius: 14, background: "rgba(255,255,255,0.35)", border: `2px dashed ${M.gray}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Card style={enter(lf, 6, id, t)} />
            </div>
          ))}
        </React.Fragment>
      ))}
    </AbsoluteFill>
  );
};
