import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { A2 } from "./components/kit2";
import { FONT, FONT_BLACK } from "./components/font";
import { GenSlot } from "./MileLifePlan";

// 年末調整リール 作り直し案のデザイン見本（静止画3枚：0=冒頭, 1=年収ものさし, 2=用紙）
const K = { fontFamily: FONT_BLACK, fontWeight: 900 as const };
const B = { fontFamily: FONT, fontWeight: 800 as const };
const BLUE = "#3E7FD0", RED = "#E8553B", GREEN = A2.green, INK = A2.ink;

const Hook: React.FC = () => (
  <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 62%, #FFF6C9 0%, ${A2.bg} 55%)` }}>
    {/* 見出しブロック：1つのかたまりで、上下の大きさをそろえる */}
    <div style={{ position: "absolute", left: 0, top: 250, width: 1080, textAlign: "center" }}>
      <div style={{ display: "inline-block", background: INK, color: "#FFE07A", borderRadius: 999, padding: "8px 30px", ...K, fontSize: 36, letterSpacing: 2 }}>2026年分（令和8年）</div>
      <div style={{ ...K, fontSize: 112, color: INK, lineHeight: 1.12, marginTop: 18, letterSpacing: 2 }}>今年の年末調整</div>
      <div style={{ position: "relative", display: "inline-block", marginTop: 4 }}>
        <span style={{ position: "absolute", left: -14, right: -14, bottom: 10, height: 42, background: "#FFE07A", borderRadius: 10 }} />
        <span style={{ position: "relative", ...K, fontSize: 132, color: RED, letterSpacing: 2 }}>知らないと<span style={{ fontSize: 150 }}>大損</span></span>
      </div>
    </div>
    {/* 太一（体は固定・口だけ） */}
    <div style={{ position: "absolute", left: 190, top: 640, width: 700, height: 700 }}><GenSlot name="taichi_talk_open" size={700} /></div>
    {/* 3つの変更点：アイコン＋短い言葉 */}
    <div style={{ position: "absolute", left: 0, top: 1110, width: 1080, display: "flex", justifyContent: "center", gap: 20 }}>
      {[["nencho_icon_kiso", "基礎控除", GREEN], ["nencho_icon_fuyo", "扶養", BLUE], ["nencho_icon_seiho", "生命保険料控除", "#EF7D57"]].map(([n, t, c]) => (
        <div key={t} style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", borderRadius: 999, padding: "8px 22px 8px 10px", boxShadow: "0 10px 22px rgba(80,60,20,0.14)", border: `4px solid ${c}` }}>
          <GenSlot name={n} size={64} /><span style={{ ...K, fontSize: 34, color: c }}>{t}</span>
        </div>
      ))}
    </div>
  </AbsoluteFill>
);

// 全編を通す「年収ものさし」：線（＝壁）が上に動く
const Y = (man: number) => 1210 - (man - 100) * 6.4; // 100万=1210, 225万=410
const Ruler: React.FC = () => (
  <AbsoluteFill style={{ background: A2.bg }}>
    <div style={{ position: "absolute", left: 0, top: 250, width: 1080, textAlign: "center", ...K, fontSize: 60, color: INK }}>税金がかかり始める<span style={{ color: GREEN }}>年収</span></div>
    {/* ものさし */}
    <div style={{ position: "absolute", left: 120, top: Y(225), width: 26, height: Y(100) - Y(225), borderRadius: 13, background: "#fff", boxShadow: "inset 0 0 0 4px #E2D9B8" }} />
    {Array.from({ length: 13 }).map((_, i) => {
      const man = 100 + i * 10;
      return (
        <React.Fragment key={man}>
          <div style={{ position: "absolute", left: 146, top: Y(man) - 2, width: man % 50 === 0 ? 34 : 18, height: 4, background: "#CFC4A0" }} />
          {man % 50 === 0 ? <div style={{ position: "absolute", left: 20, top: Y(man) - 18, width: 90, textAlign: "right", ...B, fontSize: 28, color: A2.sub }}>{man}万</div> : null}
        </React.Fragment>
      );
    })}
    {/* 去年の線（うすく・点線） */}
    <div style={{ position: "absolute", left: 140, top: Y(160) - 3, width: 820, height: 0, borderTop: `6px dashed #C9BFA0` }} />
    <div style={{ position: "absolute", left: 420, top: Y(160) + 12, ...B, fontSize: 34, color: A2.sub }}>去年 <span style={{ textDecoration: "line-through" }}>160万円</span></div>
    {/* 今年の線（太く・色） */}
    <div style={{ position: "absolute", left: 140, top: Y(178) - 7, width: 820, height: 14, borderRadius: 7, background: GREEN, boxShadow: `0 0 0 6px ${GREEN}33` }} />
    <div style={{ position: "absolute", left: 460, top: Y(178) - 150, textAlign: "right", width: 500, whiteSpace: "nowrap" }}>
      <span style={{ ...B, fontSize: 40, color: INK }}>今年 </span><span style={{ ...K, fontSize: 130, color: GREEN, lineHeight: 1 }}>178</span><span style={{ ...K, fontSize: 50, color: INK }}>万円</span>
    </div>
    {/* 上がった幅 */}
    <div style={{ position: "absolute", left: 300, top: Y(178) + 12, width: 0, height: Y(160) - Y(178) - 24, borderLeft: `8px solid ${GREEN}` }} />
    <div style={{ position: "absolute", left: 284, top: Y(178) + 4, width: 0, height: 0, borderLeft: "20px solid transparent", borderRight: "20px solid transparent", borderBottom: `26px solid ${GREEN}` }} />
    <div style={{ position: "absolute", left: 330, top: (Y(178) + Y(160)) / 2 - 26, background: GREEN, color: "#fff", borderRadius: 14, padding: "4px 16px", ...K, fontSize: 36 }}>+18万</div>
    {/* 人：自分の年収の位置に立つ */}
    <div style={{ position: "absolute", left: 740, top: Y(150) }}><GenSlot name="nencho_salary_bag" size={220} /></div>
    {/* 内訳 */}
    <div style={{ position: "absolute", left: 180, top: Y(110) - 60, display: "flex", alignItems: "center", gap: 14 }}>
      <span style={{ background: "#fff", borderRadius: 18, padding: "10px 18px", boxShadow: "0 8px 18px rgba(80,60,20,0.1)", ...B, fontSize: 30 }}>基礎控除 <span style={{ color: GREEN, fontSize: 42 }}>104万</span></span>
      <span style={{ ...K, fontSize: 40 }}>＋</span>
      <span style={{ background: "#fff", borderRadius: 18, padding: "10px 18px", boxShadow: "0 8px 18px rgba(80,60,20,0.1)", ...B, fontSize: 30 }}>給与所得控除 <span style={{ color: BLUE, fontSize: 42 }}>74万</span></span>
    </div>
  </AbsoluteFill>
);

// 用紙：明るいまま、該当欄だけ大きく抜き出して「ここ！」
const Form: React.FC = () => (
  <AbsoluteFill style={{ background: A2.bg }}>
    <div style={{ position: "absolute", left: 0, top: 250, width: 1080, textAlign: "center", ...K, fontSize: 58, color: INK }}>書くのは<span style={{ color: RED }}>「所得」</span>（年収じゃない）</div>
    {/* 用紙全体（小さく・傾けて） */}
    <div style={{ position: "absolute", left: 60, top: 380, width: 620, transform: "rotate(-4deg)", filter: "drop-shadow(0 18px 26px rgba(80,60,20,0.2))" }}>
      <Img src={staticFile("nencho_forms/fuyo.png")} style={{ width: 620, borderRadius: 10, border: "6px solid #fff" }} />
      <div style={{ position: "absolute", left: 620 * 0.49, top: 438 * 0.2, width: 620 * 0.066, height: 438 * 0.36, border: `5px solid ${RED}`, borderRadius: 6 }} />
    </div>
    {/* 拡大した欄（ルーペ） */}
    <div style={{ position: "absolute", left: 520, top: 560, width: 470, height: 470, borderRadius: "50%", overflow: "hidden", border: `10px solid ${RED}`, boxShadow: "0 22px 40px rgba(0,0,0,0.25)", background: "#fff" }}>
      <Img src={staticFile("nencho_forms/fuyo.png")} style={{ position: "absolute", width: 2339 * 0.9, left: 235 - 2339 * 0.9 * 0.523, top: 235 - 1654 * 0.9 * 0.36 }} />
    </div>
    <div style={{ position: "absolute", left: 470, top: 1030, width: 560, textAlign: "center" }}>
      <span style={{ display: "inline-block", background: RED, color: "#fff", borderRadius: 18, padding: "10px 28px", ...K, fontSize: 40 }}>令和8年中の所得の見積額</span>
    </div>
    {/* 計算 */}
    <div style={{ position: "absolute", left: 60, top: 1110, width: 600, background: "#fff", borderRadius: 26, padding: "20px 26px", boxShadow: "0 12px 24px rgba(80,60,20,0.12)" }}>
      <div style={{ ...B, fontSize: 28, color: A2.sub }}>例：年収130万円なら</div>
      <div style={{ whiteSpace: "nowrap" }}><span style={{ ...K, fontSize: 56 }}>130</span><span style={{ ...B, fontSize: 30 }}>万 − </span><span style={{ ...K, fontSize: 56, color: BLUE }}>74</span><span style={{ ...B, fontSize: 30 }}>万 ＝ </span><span style={{ ...K, fontSize: 76, color: RED }}>56</span><span style={{ ...B, fontSize: 34 }}>万円</span></div>
    </div>
  </AbsoluteFill>
);

export const NenchoMock: React.FC = () => {
  const f = useCurrentFrame();
  return f < 1 ? <Hook /> : f < 2 ? <Ruler /> : <Form />;
};
