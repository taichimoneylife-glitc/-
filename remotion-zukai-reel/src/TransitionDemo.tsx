import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { K, B, SER, M } from "./components/marke";
import { Trans, TransKind, TRANS_NAME, TRANS_LEN } from "./components/transitionLib";

// ════════════════════════════════════════════════════════════════════
//  画面の切り替えの見本（子どもNISAの本物の場面で 12種）
//  1種＝前の画面を0.6秒見せる → 切り替え → 次の画面を0.8秒
// ════════════════════════════════════════════════════════════════════
const G = M.green, O = M.orange;
const Paper: React.FC<{ children: React.ReactNode; tint?: string }> = ({ children, tint = M.paper }) => (
  <AbsoluteFill style={{ background: tint, backgroundImage: `repeating-linear-gradient(transparent 0 62px, ${M.grid} 62px 64px)` }}>
    <div style={{ position: "absolute", left: 70, top: 0, bottom: 0, width: 4, background: "rgba(239,125,87,0.35)" }} />
    {children}
  </AbsoluteFill>
);
const S1: React.FC = () => (
  <Paper>
    <div style={{ position: "absolute", left: 0, right: 0, top: 560, display: "flex", justifyContent: "center" }}>
      <div style={{ background: "#fff", border: `7px solid ${M.ink}`, borderRadius: 28, boxShadow: `12px 12px 0 ${G}`, padding: "30px 44px", textAlign: "center" }}>
        <div style={{ ...K, fontSize: 48, color: M.sub }}>子どもNISAは</div>
        <div style={{ ...K, fontSize: 88 }}><span style={{ color: G }}>子どものお金</span>として</div>
        <div style={{ ...K, fontSize: 66 }}>使うもの</div>
      </div>
    </div>
  </Paper>
);
const Box: React.FC<{ c: string; label: string; v: string; h: number }> = ({ c, label, v, h }) => (
  <div style={{ width: 520, height: h, background: c, border: `6px solid ${M.ink}`, borderRadius: 18, boxShadow: `8px 8px 0 ${M.ink}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff" }}>
    <span style={{ ...K, fontSize: 34 }}>{label}</span><span><span style={{ ...SER, fontSize: 100 }}>{v}</span><span style={{ ...K, fontSize: 38 }}>万円</span></span>
  </div>
);
const S2: React.FC = () => (
  <Paper>
    <div style={{ position: "absolute", left: 0, right: 0, top: 420, textAlign: "center", ...K, fontSize: 54 }}>大人の新NISA <span style={{ color: M.red }}>1,800万円</span></div>
    <div style={{ position: "absolute", left: 280, top: 540 }}><Box c={O} label="成長投資枠も使える" v="1,200" h={330} /></div>
    <div style={{ position: "absolute", left: 280, top: 900 }}><Box c={G} label="積立" v="600" h={240} /></div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 1200, textAlign: "center", ...K, fontSize: 50, color: G }}>この600万円を、0歳から先に</div>
  </Paper>
);
const ROWS: [string, string][] = [["始まる", "2027年1月"], ["対象年齢", "0〜17歳"], ["年間投資枠", "60万円"], ["非課税保有限度額", "600万円"], ["買い方", "積立のみ"], ["引き出し", "12歳まで原則✕"]];
const S3: React.FC = () => (
  <Paper>
    <div style={{ position: "absolute", left: 90, top: 400, width: 900, background: "#fff", border: `6px solid ${M.ink}`, borderRadius: 20, boxShadow: `10px 10px 0 ${G}`, overflow: "hidden" }}>
      <div style={{ background: G, color: "#fff", ...K, fontSize: 44, padding: "12px 26px" }}>子どもNISA 全体像</div>
      {ROWS.map(([k, v], i) => (
        <div key={k} style={{ display: "flex", borderTop: i ? `3px dashed ${M.gray}` : undefined, height: 100, alignItems: "center" }}>
          <span style={{ width: 340, ...K, fontSize: 34, padding: "0 22px", color: M.sub }}>{k}</span>
          <span style={{ ...K, fontSize: 42, color: i >= 4 ? M.red : M.ink }}>{v}</span>
        </div>
      ))}
    </div>
  </Paper>
);
const SCENES = [S1, S2, S3];
// 切り替えの起点（その画面で一番目立つ物の位置）
const ORIGIN: [number, number][] = [[540, 790], [540, 1020], [700, 1060]];

const KINDS: TransKind[] = ["zoomThrough", "whipRGB", "iris", "slices", "pageFlip", "spinZoom", "pushParallax", "flashStamp", "cardSwap", "inkWipe", "glitch", "splitOpen"];
const HOLD_A = 18, HOLD_B = 24;
const segLen = (k: TransKind) => HOLD_A + TRANS_LEN[k] + HOLD_B;
const STARTS: number[] = []; { let t = 0; for (const k of KINDS) { STARTS.push(t); t += segLen(k); } }
export const TRANSITION_DEMO_FRAMES = STARTS[STARTS.length - 1] + segLen(KINDS[KINDS.length - 1]);

export const TransitionDemo: React.FC = () => {
  const f = useCurrentFrame();
  let i = 0; while (i + 1 < KINDS.length && f >= STARTS[i + 1]) i++;
  const lf = f - STARTS[i];
  const A = SCENES[i % 3], Bs = SCENES[(i + 1) % 3];
  return (
    <AbsoluteFill style={{ background: "#2E2C26" }}>
      <Trans kind={KINDS[i]} f={lf} start={HOLD_A} A={<A />} B={<Bs />} origin={ORIGIN[i % 3]} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1660, textAlign: "center" }}>
        <span style={{ display: "inline-block", background: "rgba(46,44,38,0.88)", color: "#fff", borderRadius: 14, padding: "10px 26px", ...B, fontSize: 38 }}>{i + 1}. {TRANS_NAME[KINDS[i]]}<span style={{ fontSize: 26, opacity: 0.7 }}>　{TRANS_LEN[KINDS[i]]}コマ</span></span>
      </div>
    </AbsoluteFill>
  );
};
