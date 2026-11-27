import React from "react";
import { AbsoluteFill } from "remotion";
import { A2 } from "./components/kit2";
import { FONT, FONT_BLACK } from "./components/font";
import { Board, Panel, Stop, Stepper } from "./components/board";

// 部品 board.tsx の動作確認用（マーケ博士②の「縮んで次のページへ流れる」転換）
const K = { fontFamily: FONT_BLACK, fontWeight: 900 as const };
const P: Panel[] = [{ id: "a", col: 0, row: 0 }, { id: "b", col: 1, row: 0 }, { id: "c", col: 1, row: 1 }, { id: "d", col: 0, row: 1 }];
const S: Stop[] = [{ id: "a", trans: 0 }, { id: "b", trans: 1.5 }, { id: "c", trans: 3.2 }, { id: "__map", trans: 4.9, scale: 0.22 }, { id: "d", trans: 6.6 }];
const TITLE: Record<string, string> = { a: "もし、〇〇で", b: "STEP1 〇〇する", c: "STEP2 〇〇する", d: "STEP3 〇〇する" };
export const BOARD_DEMO_FRAMES = 270;
export const BoardDemo: React.FC = () => (
  <AbsoluteFill style={{ background: "#EFEBE1", backgroundImage: "linear-gradient(rgba(120,110,80,0.06) 2px, transparent 2px), linear-gradient(90deg, rgba(120,110,80,0.06) 2px, transparent 2px)", backgroundSize: "120px 120px", fontFamily: FONT }}>
    <Board panels={P} stops={S} links={[["a", "b"], ["b", "c"], ["c", "d"]]}>
      {(id) => (
        <AbsoluteFill>
          <div style={{ position: "absolute", left: 60, top: 300, ...K, fontSize: 64, color: A2.ink }}>{TITLE[id]}</div>
          <div style={{ position: "absolute", left: 140, top: 520, width: 800, height: 600, background: "#fff", border: `6px solid ${A2.ink}`, borderRadius: 30, display: "flex", alignItems: "center", justifyContent: "center", ...K, fontSize: 200, color: A2.coral }}>{id.toUpperCase()}</div>
        </AbsoluteFill>
      )}
    </Board>
    <Stepper labels={["アプリ", "作業場", "声", "商品", "提供"]} steps={[1.5, 3.2, 6.6]} />
  </AbsoluteFill>
);
