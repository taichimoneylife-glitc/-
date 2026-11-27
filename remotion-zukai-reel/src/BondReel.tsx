import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { K, B, SER, F } from "./components/marke";
import { GenSlot } from "./MileLifePlan";
import { SfxTrack } from "./components/sfx";
import { enter } from "./components/motionLib";
import { BD_LAB, BD_STOCK, BD_BOND } from "./bondData";
import { UST10Y } from "./ust10y";
import { Audio, staticFile } from "remotion";
import { BOND_MOUTH } from "./bondMouth";

// ════════════════════════════════════════════════════════════════════
//  教育資金×債券（図解パートのみ。冒頭と締めは実写）台本：assets/script_bond_education.md／設計：assets/bond_blueprint.md v4
//  形：黄色のノート＋上に6章の目次（今＝青枠・終わり＝✓）＋大きな白いカード1枚の中だけが動く（参考⑬）
//  時間：まだ音声が無いので、台本の文字数から仮に決める（LINES の秒）。音声が来たら LINES の秒だけ差し替える。
// ════════════════════════════════════════════════════════════════════
const INK = "#2E2C26", SUB = "#8C8471", STK = "#EF7D57", BND = "#2E9E6B", CASH = "#3C78C8", RED = "#E5483B", YEL = "#FFE15A", BLUE = "#3B6FE0";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const OUT = Easing.bezier(0.16, 1, 0.3, 1);
const p01 = (f: number, a: number, b: number, e = OUT) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: e });
type PatT = Parameters<typeof enter>[2];

// ── 台本（しゃべる言葉）→ 仮の時間 ──
const SCRIPT: string[][] = [
  ["例えば、教育資金を株で500万円用意して", "残りは現金だけ、という家庭", "リーマンショックのとき", "米国株は1年で約37%下がり", "500万円が約317万円になりました", "入学金や授業料は待ってくれないので", "下がったところで売るしかないこともあります"],
  ["でも、ここが落とし穴", "株が大きく下がると", "元に戻るまで何年もかかることがあります", "リーマンショックでは約5年半", "ITバブルでは約7年", "過去の大きな暴落7回のうち4回は", "3年たっても戻っていません"],
  ["例えば、子どもが中学3年の冬に暴落が始まったとします", "大学入学までは、あと3年", "暴落の前に500万円あった株は", "3年たっても、約460万円までしか戻っていません", "つまり、危ないのは使う年の暴落だけではなくて", "暴落したあと", "戻るまでにどれくらいかかるかわからないことです"],
  ["だから僕は、株と一緒に債券も持っています", "NISAの一部を売って債券に移して、今は500万円", "株が下がっている間は債券を使い、株が戻るまで待つ", "株が上がっていれば、株から使う", "その時の状況に合わせて、柔軟に対応しやすくなります"],
  ["景気の悪化で株が下がるときは", "歴史的に見ると債券が上がる傾向にあります", "暴落のときは、景気を支えるために金利が下がりやすく", "金利が下がると、債券の価値が上がるからです", "実際、リーマンショックの年は", "株が約37%下がった一方で", "アメリカの10年国債は約20%上がりました"],
  ["米国株が下がった年の、約8割で債券はプラス", "ただ2022年のように", "株も債券も一緒に下がった年もあります", "そして今、アメリカの10年国債の金利は5%前後", "資産を増やしやすく、暴落の備えにもなりやすいので", "債券も選択肢に入れやすいと思います", "つまり、どれか1つだけではなくて", "何が起きても対応できる資産分散が", "個人的には一番大事だと思っています"],
];
// 声（public/bond-narration.wav 107.5秒）の言葉ごとの時刻から合わせた、各行の始まりの秒
const LINES: number[][] = [[0.0, 3.2, 5.16, 6.42, 9.72, 12.58, 15.34], [17.24, 18.6, 20.14, 22.62, 24.76, 26.48, 29.42], [30.98, 34.68, 36.66, 38.86, 42.38, 45.68, 46.78], [49.32, 51.86, 55.12, 58.64, 60.64], [63.84, 65.94, 68.54, 72.04, 74.76, 76.54, 79.34], [82.66, 86.26, 88.1, 90.86, 95.5, 98.2, 100.68, 103.02, 105.34]];
const END = 107.6;
const L = (s: number, i: number) => LINES[s][i];
const SEC_START = LINES.map((l, i) => (i === 0 ? 0 : l[0] - 0.4));
const SEC_END = (s: number) => (s + 1 < SEC_START.length ? SEC_START[s + 1] : END);
export const BOND_FRAMES = F(END + 0.5);

// ── 部品 ──
const Pos: React.FC<{ x: number; y: number; t: number; pat?: PatT; tempo?: Parameters<typeof enter>[3]; until?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ x, y, t, pat = "pop", tempo = "bounce", until, children, style }) => {
  const f = useCurrentFrame();
  if (f < F(t) - 1) return null;
  if (until !== undefined && f > F(until) + 8) return null;
  const e = enter(f, F(t), pat, tempo);
  const fade = until !== undefined ? 1 - p01(f, F(until), F(until) + 8) : 1;
  return <div style={{ position: "absolute", left: x, top: y, ...e, ...style, opacity: (e.opacity === undefined ? 1 : Number(e.opacity)) * fade }}>{children}</div>;
};
const Pic: React.FC<{ name: string; x: number; y: number; size: number; t: number; pat?: PatT; until?: number }> = ({ name, x, y, size, t, pat = "pop", until }) => {
  const f = useCurrentFrame();
  const k = f - F(t) - 10;
  const br = k > 0 ? Math.sin(k / 12) : 0;
  return <Pos x={x} y={y} t={t} pat={pat} until={until}><div style={{ transform: `scale(${1 + 0.012 * br}, ${1 - 0.012 * br})`, transformOrigin: "50% 100%" }}><GenSlot name={name} size={size} /></div></Pos>;
};
const Stamp: React.FC<{ x: number; y: number; t: number; c?: string; size?: number; rot?: number; until?: number; children: React.ReactNode }> = ({ x, y, t, c = RED, size = 52, rot = -5, until, children }) => (
  <Pos x={x} y={y} t={t} pat="stamp" tempo="kire" until={until}><span style={{ display: "inline-block", border: `7px solid ${c}`, color: c, background: "rgba(255,255,255,0.96)", borderRadius: 14, padding: "4px 24px", ...K, fontSize: size, transform: `rotate(${rot}deg)`, whiteSpace: "nowrap" }}>{children}</span></Pos>
);
const Small: React.FC<{ y: number; t: number; children: React.ReactNode }> = ({ y, t, children }) => {
  const f = useCurrentFrame();
  return <div style={{ position: "absolute", left: 30, right: 30, top: y, ...B, fontSize: 21, color: SUB, lineHeight: 1.4, opacity: p01(f, F(t), F(t) + 10) }}>{children}</div>;
};
// 数字が段で増えて、言った瞬間に止まる（Chart Grow）
const Count: React.FC<{ t0: number; t1: number; from?: number; to: number; dec?: number }> = ({ t0, t1, from = 0, to, dec = 0 }) => {
  const f = useCurrentFrame();
  const step = Math.floor(f / 3) * 3;
  const v = f >= F(t1) ? to : from + (to - from) * p01(step, F(t0), F(t1), Easing.out(Easing.cubic));
  const land = f >= F(t1) ? interpolate(f - F(t1), [0, 2, 5], [-8, 3, 0], clamp) : 0;
  return <span style={{ display: "inline-block", transform: `translateY(${land}px)` }}>{v.toFixed(dec)}</span>;
};
const NumCard: React.FC<{ x: number; y: number; t: number; t1: number; label: string; to: number; from?: number; unit?: string; c?: string; w?: number; pre?: string }> = ({ x, y, t, t1, label, to, from, unit = "万円", c = INK, w = 400, pre = "約" }) => (
  <Pos x={x} y={y} t={t} pat="slideUp" tempo="brake">
    <div style={{ width: w, background: "#fff", borderRadius: 22, padding: "14px 24px", boxSizing: "border-box", boxShadow: "0 10px 26px rgba(60,45,10,0.18)", border: `4px solid ${c}` }}>
      <div style={{ ...B, fontSize: 24, color: SUB }}>{label}</div>
      <div style={{ ...SER, fontSize: 96, color: c, lineHeight: 1.05 }}><span style={{ ...K, fontSize: 40 }}>{pre}</span><Count t0={t} t1={t1} from={from} to={to} /><span style={{ ...K, fontSize: 40 }}>{unit}</span></div>
    </div>
  </Pos>
);
// お金のタンク：水位＝金額（max を満タンとする）
const Tank: React.FC<{ x: number; y: number; w: number; h: number; level: number; max: number; c: string; label: string; faucet?: number; wait?: boolean }> = ({ x, y, w, h, level, max, c, label, faucet = 0, wait }) => {
  const f = useCurrentFrame();
  const r = Math.max(0, Math.min(1, level / max));
  const wave = Math.sin(f / 8) * 4;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: 26, border: `6px solid ${INK}`, background: "rgba(255,255,255,0.7)", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${r * 100}%`, background: c, opacity: 0.9 }}>
          <svg width={w} height={20} style={{ position: "absolute", top: -10, left: 0 }}><path d={`M0 10 Q${w / 4} ${10 + wave} ${w / 2} 10 T${w} 10 V20 H0 Z`} fill={c} opacity={0.9} /></svg>
        </div>
        {[0.25, 0.5, 0.75].map((m) => <div key={m} style={{ position: "absolute", right: 0, width: 22, top: `${(1 - m) * 100}%`, height: 3, background: INK, opacity: 0.4 }} />)}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: -54, textAlign: "center", ...K, fontSize: 34, color: c }}>{label}</div>
      {/* 蛇口 */}
      <div style={{ position: "absolute", left: w - 10, top: h - 70, width: 70, height: 26, background: INK, borderRadius: "0 10px 10px 0" }} />
      <div style={{ position: "absolute", left: w + 44, top: h - 56, width: 22, height: 40, background: INK, borderRadius: 6 }} />
      {faucet > 0 ? Array.from({ length: 4 }).map((_, i) => { const k = (f + i * 9) % 36; return <div key={i} style={{ position: "absolute", left: w + 42, top: h - 10 + k * 5, opacity: faucet * (1 - k / 36) }}><GenSlot name="kn_coin" size={30} /></div>; }) : null}
      {wait ? <div style={{ position: "absolute", left: w - 30, top: h + 6, whiteSpace: "nowrap", background: "#fff", border: `4px solid ${RED}`, borderRadius: 10, padding: "0 12px", ...K, fontSize: 28, color: RED, transform: "rotate(-6deg)" }}>待つ</div> : null}
    </div>
  );
};
// 折れ線（BD の i0〜i1 を描く）
const sx = (i: number, i0: number, i1: number, x0: number, w: number) => x0 + ((i - i0) / (i1 - i0)) * w;
const sy = (v: number, lo: number, hi: number, y0: number, h: number) => y0 + h - ((v - lo) / (hi - lo)) * h;
const linePts = (arr: number[], i0: number, n: number, i1: number, x0: number, w: number, lo: number, hi: number, y0: number, h: number) =>
  arr.slice(i0, i0 + n + 1).map((v, k) => `${sx(i0 + k, i0, i1, x0, w)},${sy(v, lo, hi, y0, h)}`).join(" ");
const IX = (lab: string) => BD_LAB.indexOf(lab);

// ══ ① 暴落でいくら減る？ ══
const S1: React.FC<{ f: number }> = ({ f }) => {
  const drop = p01(f, F(L(0, 3)), F(L(0, 4)), Easing.in(Easing.cubic));
  const level = 500 - 183 * drop;
  const shake = f > F(L(0, 3)) && f < F(L(0, 3)) + 14 ? Math.sin(f * 2.2) * 8 : 0;
  return (
    <>
      <div style={{ position: "absolute", left: 0, top: 0, transform: `translateX(${shake}px)` }}>
        <Pos x={0} y={0} t={L(0, 0)} pat="drop"><Tank x={110} y={170} w={300} h={470} level={level} max={540} c={STK} label="株" faucet={p01(f, F(L(0, 6)), F(L(0, 6)) + 8)} /></Pos>
      </div>
      <Pos x={0} y={0} t={L(0, 1)} pat="pop" until={L(0, 5)}><Tank x={470} y={470} w={130} h={170} level={120} max={170} c={CASH} label="現金" /></Pos>
      <Pos x={130} y={680} t={L(0, 0) + 0.3}><div style={{ ...K, fontSize: 40, color: STK, width: 300, textAlign: "center" }}>{level > 499 ? "500万円" : null}</div></Pos>
      {/* リーマンショックの札が落ちてくる */}
      <Pos x={150} y={80} t={L(0, 2)} pat="drop" until={L(0, 5)}><span style={{ display: "inline-block", background: RED, color: "#fff", ...K, fontSize: 40, padding: "6px 26px", borderRadius: 12, transform: "rotate(-4deg)" }}>リーマンショック</span></Pos>
      <Pos x={430} y={220} t={L(0, 3)} pat="pop" until={L(0, 5)}><span style={{ ...SER, fontSize: 90, color: RED }}>−37<span style={{ ...K, fontSize: 44 }}>%</span></span></Pos>
      <NumCard x={520} y={40} t={L(0, 4) - 0.3} t1={L(0, 4) + 0.9} label="1年後" to={317} from={500} c={RED} w={420} />
      <Pic name="bk_calendar_due" x={480} y={640} size={170} t={L(0, 5)} />
      <Pic name="bk_parent_bill" x={700} y={600} size={250} t={L(0, 5) + 0.3} />
      <Pic name="bk_sell_low" x={630} y={250} size={250} t={L(0, 6)} pat="slideUp" />
      <Small y={890} t={L(0, 4)}>※米国株S&P500・配当込み・2008年の年間リターン（−36.55%）で計算</Small>
    </>
  );
};

// ══ ② 戻るまで何年も（★暴落の表は必ず全部出す） ══
const ROWS: [string, string, string, string, number, boolean?][] = [
  ["世界恐慌（1929年）", "−86%", "約2年9か月", "約25年", 25],
  ["オイルショック（1973年）", "−48%", "約1年9か月", "約7年半", 7.5],
  ["ブラックマンデー（1987年）", "−34%", "約3か月", "約1年11か月", 1.9],
  ["ITバブル崩壊（2000年）", "−49%", "約2年7か月", "約7年", 7],
  ["リーマンショック（2007年）", "−57%", "約1年5か月", "約5年半", 5.5],
  ["コロナショック（2020年）", "−34%", "約1か月", "約6か月", 0.5],
  ["2022年（インフレ・利上げ）", "−25%", "約9か月", "約2年", 2],
  ["（日本）バブル崩壊（1989年）", "−82%", "約19年", "約34年", 34, true],
];
const S2: React.FC<{ f: number }> = ({ f }) => {
  const red = f >= F(L(1, 5));
  const hl = (i: number) => (i === 4 && f >= F(L(1, 3)) && f < F(L(1, 4)) + 6) || (i === 3 && f >= F(L(1, 4)) && f < F(L(1, 5)));
  return (
    <>
      <Pos x={30} y={20} t={L(1, 0)} pat="stamp" tempo="kire"><span style={{ ...K, fontSize: 52, color: RED }}>でも、ここが<span style={{ background: "rgba(229,72,59,0.15)", padding: "0 8px" }}>落とし穴</span></span></Pos>
      <div style={{ position: "absolute", left: 20, top: 110, width: 960 }}>
        <div style={{ display: "flex", ...K, fontSize: 24, color: "#fff", background: INK, borderRadius: "12px 12px 0 0", opacity: p01(f, F(L(1, 1)), F(L(1, 1)) + 6) }}>
          {["暴落", "下がった幅", "下がった期間", "最高値に戻るまで"].map((h, i) => <div key={h} style={{ flex: i ? 1 : 1.9, padding: "8px 6px", textAlign: i ? "center" : "left", fontSize: 21, whiteSpace: "nowrap" }}>{h}</div>)}
        </div>
        {ROWS.map(([n, d, p, r, yrs, jp], i) => {
          const t = L(1, 1) + 0.15 + i * 0.22;
          const over = red && !jp && yrs > 3;
          return (
            <div key={n} style={{ display: "flex", alignItems: "center", ...B, fontSize: 25, height: 64, marginTop: jp ? 14 : 0, background: hl(i) ? "#FFF1BF" : over ? "#FDE3DF" : jp ? "#F2EEE4" : "#fff", borderBottom: "2px solid #E8E1CC", opacity: p01(f, F(t), F(t) + 5), transform: `translateX(${(1 - p01(f, F(t), F(t) + 7)) * 60}px)`, outline: hl(i) ? `5px solid ${YEL}` : undefined, position: "relative" }}>
              <div style={{ flex: 1.9, padding: "0 10px", ...K, fontSize: 25 }}>{n}</div>
              <div style={{ flex: 1, textAlign: "center", color: RED }}>{d}</div>
              <div style={{ flex: 1, textAlign: "center" }}>{p}</div>
              <div style={{ flex: 1, textAlign: "center", ...K, fontSize: over ? 30 : 26, color: over ? RED : INK }}>{r}</div>
            </div>
          );
        })}
      </div>
      {/* 3年の線（戻るまで の列） */}
      <Pos x={560} y={690} t={L(1, 5)} pat="drop"><span style={{ background: RED, color: "#fff", borderRadius: 8, padding: "2px 12px", ...K, fontSize: 24 }}>赤＝戻るまで3年より長い</span></Pos>
      <Stamp x={40} y={790} t={L(1, 6)} size={40} rot={-2}>7回のうち4回は、3年たっても戻らなかった</Stamp>
      <Pic name="bk_hourglass_long" x={690} y={-20} size={110} t={L(1, 2)} />
      <Pic name="bk_mountain_climb" x={820} y={-25} size={130} t={L(1, 2) + 0.2} />
      <Small y={880} t={L(1, 1)}>※米国株S&P500は株価だけ（配当なし）。「戻る」＝暴落前の最高値に戻ること。日本は日経平均。米国の7回と日本は分けて数えています</Small>
    </>
  );
};

// ══ ③ 使う前の暴落でも（山場）＝本物の折れ線 ══
const C3 = { i0: IX("2006-06"), i1: IX("2011-06"), x0: 80, w: 860, y0: 150, h: 520, lo: 250, hi: 560 };
const S3: React.FC<{ f: number }> = ({ f }) => {
  const { i0, i1, x0, w, y0, h, lo, hi } = C3;
  const iCrash = IX("2007-12"), iEnd = IX("2010-12");
  const n = Math.round(interpolate(f, [F(L(2, 0)), F(L(2, 3))], [iCrash - i0, iEnd - i0], { ...clamp, easing: Easing.inOut(Easing.quad) }));
  const zoom = p01(f, F(L(2, 3)), F(L(2, 3)) + 12) * (1 - p01(f, F(L(2, 4)) + 0.4, F(L(2, 4)) + 1.0));
  const ex = sx(iEnd, i0, i1, x0, w), ey = sy(BD_STOCK[iEnd], lo, hi, y0, h);
  const z = 1 + 0.6 * zoom;
  const corner = (cx: number, cy: number, dx: number, dy: number) => <path d={`M${cx + dx * 34} ${cy} L${cx} ${cy} L${cx} ${cy + dy * 34}`} stroke={RED} strokeWidth={6} fill="none" />;
  return (
    <>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1000, height: y0 + h + 44, overflow: "hidden" }}><div style={{ position: "absolute", inset: 0, transform: `scale(${z})`, transformOrigin: `${ex}px ${ey}px` }}>
        <svg width={1000} height={760} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          {[300, 400, 500].map((v) => <g key={v}><line x1={x0} x2={x0 + w} y1={sy(v, lo, hi, y0, h)} y2={sy(v, lo, hi, y0, h)} stroke={v === 500 ? STK : "#E6DDBE"} strokeWidth={v === 500 ? 4 : 2} strokeDasharray={v === 500 ? "12 10" : undefined} /><text x={x0 - 10} y={sy(v, lo, hi, y0, h) + 8} textAnchor="end" fontSize={22} fill={SUB} fontFamily="Noto Sans JP" fontWeight={700}>{v}</text></g>)}
          {["2007", "2008", "2009", "2010", "2011"].map((y) => { const i = IX(`${y}-01`); return <text key={y} x={sx(i, i0, i1, x0, w)} y={y0 + h + 34} textAnchor="middle" fontSize={22} fill={SUB} fontFamily="Noto Sans JP" fontWeight={700}>{y}</text>; })}
          <polyline points={linePts(BD_STOCK, i0, iCrash - i0, i1, x0, w, lo, hi, y0, h)} fill="none" stroke={STK} strokeWidth={5} opacity={0.45} strokeLinejoin="round" />
          {f >= F(L(2, 0)) ? <polyline points={linePts(BD_STOCK, iCrash, n - (iCrash - i0), i1, x0, w, lo, hi, y0, h)} fill="none" stroke={STK} strokeWidth={7} strokeLinejoin="round" /> : null}
          {zoom > 0.02 ? <g opacity={zoom}>{corner(ex - 70, ey - 70, 1, 1)}{corner(ex + 70, ey - 70, -1, 1)}{corner(ex - 70, ey + 70, 1, -1)}{corner(ex + 70, ey + 70, -1, -1)}</g> : null}
          {f >= F(L(2, 3)) ? <circle cx={ex} cy={ey} r={12} fill={RED} /> : null}
        </svg>
        <div style={{ position: "absolute", left: x0 + w - 150, top: sy(500, lo, hi, y0, h) - 40, ...K, fontSize: 24, color: STK }}>500万円</div>
      </div></div>
      {/* 学年の旗 */}
      <Pos x={sx(iCrash, i0, i1, x0, w) - 80} y={y0 + h + 50} t={L(2, 0)} pat="drop"><div style={{ display: "flex", alignItems: "center", gap: 6 }}><GenSlot name="bk_kid_jhs3" size={130} /><span style={{ background: INK, color: "#fff", borderRadius: 8, padding: "2px 10px", ...K, fontSize: 28 }}>中3の冬</span></div></Pos>
      <Pos x={sx(IX("2009-06"), i0, i1, x0, w) - 40} y={y0 + h + 50} t={L(2, 1)} pat="drop"><GenSlot name="bk_kid_hs" size={130} /></Pos>
      <Pos x={ex - 200} y={y0 + h + 50} t={L(2, 1) + 0.3} pat="drop"><div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ background: RED, color: "#fff", borderRadius: 8, padding: "2px 10px", ...K, fontSize: 28 }}>3年後</span><GenSlot name="bk_kid_univ" size={130} /></div></Pos>
      <NumCard x={560} y={20} t={L(2, 3) - 0.2} t1={L(2, 3) + 1.0} label="3年たっても" to={460} from={317} c={RED} w={400} />
      <Pos x={ex + 40} y={ey - 20} t={L(2, 5)} pat="pop"><span style={{ ...SER, fontSize: 90, color: RED }}>？</span></Pos>
      <Pic name="bk_parent_relax" x={30} y={10} size={190} t={L(2, 1)} until={L(2, 3) - 0.1} />
      <Pic name="bk_parent_relax_crack" x={30} y={10} size={190} t={L(2, 3)} />
      <Small y={890} t={L(2, 0)}>※2007年末に500万円。米国株S&P500・配当込み・ドル建て。月の動きはShiller（イェール大）の月次データ、年末の値はDamodaran（NYU）の年間リターンに合わせています</Small>
    </>
  );
};

// ══ ④ どこから使うか選べる ══
const S4: React.FC<{ f: number }> = ({ f }) => {
  const i0 = IX("2007-12"), i1 = IX("2013-12");
  const n = Math.round(p01(f, F(L(3, 0)), F(L(3, 1)) + 0.5, Easing.inOut(Easing.quad)) * (i1 - i0));
  const mix = BD_STOCK.map((v, i) => (v + BD_BOND[i]) / 2);
  const half = p01(f, F(L(3, 1)), F(L(3, 1)) + 10);
  const phaseA = f >= F(L(3, 2)) && f < F(L(3, 3));
  const phaseB = f >= F(L(3, 3));
  return (
    <>
      <Pos x={20} y={10} t={L(3, 0)} pat="slideL" tempo="brake"><div style={{ display: "flex", alignItems: "center", gap: 10 }}><GenSlot name="taichi_one_finger" size={120} /><span style={{ background: BND, color: "#fff", borderRadius: 14, padding: "6px 16px", ...K, fontSize: 30, whiteSpace: "nowrap" }}>僕は 債券 500万円</span></div></Pos>
      {/* 10マス：全部オレンジ → 半分を緑に */}
      <div style={{ position: "absolute", left: 560, top: 30, display: "flex", gap: 5, opacity: p01(f, F(L(3, 0)) + 6, F(L(3, 0)) + 14) }}>
        {Array.from({ length: 10 }).map((_, i) => { const g = i >= 5 && half > (i - 5) / 5; return <div key={i} style={{ width: 36, height: 64, borderRadius: 8, background: g ? BND : STK, transform: `scaleX(${g ? interpolate(half * 5 - (i - 5), [0, 0.5, 1], [1, 0, 1], clamp) : 1})` }} />; })}
      </div>
      <div style={{ position: "absolute", left: 560, top: 104, ...B, fontSize: 22, color: SUB, opacity: half }}>株 50%（オレンジ）・債券 50%（緑）</div>
      {/* 2本の折れ線 */}
      <svg width={1000} height={760} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {[300, 500, 700].map((v) => <line key={v} x1={60} x2={940} y1={sy(v, 250, 760, 170, 330)} y2={sy(v, 250, 760, 170, 330)} stroke={v === 500 ? "#C9BE9C" : "#EEE6CC"} strokeWidth={2} strokeDasharray={v === 500 ? "10 8" : undefined} />)}
        <polyline points={linePts(BD_STOCK, i0, n, i1, 60, 880, 250, 760, 170, 330)} fill="none" stroke={STK} strokeWidth={6} strokeLinejoin="round" />
        {half > 0 ? <polyline points={linePts(mix, i0, n, i1, 60, 880, 250, 760, 170, 330)} fill="none" stroke={BND} strokeWidth={6} strokeLinejoin="round" opacity={half} /> : null}
      </svg>
      <Pos x={70} y={480} t={L(3, 0) + 0.4}><span style={{ ...K, fontSize: 26, color: STK }}>━ 株だけ</span></Pos>
      <Pos x={240} y={480} t={L(3, 1) + 0.3}><span style={{ ...K, fontSize: 26, color: BND }}>━ 株と債券 半分ずつ</span></Pos>
      {/* 蛇口：場面A＝債券から・場面B＝株から */}
      {f >= F(L(3, 2)) ? (
        <>
          <Tank x={120} y={620} w={160} h={180} level={phaseA ? 300 : 470} max={520} c={STK} label="株" faucet={phaseB ? 1 : 0} wait={phaseA} />
          <Tank x={420} y={620} w={160} h={180} level={phaseA ? 330 : 300} max={520} c={BND} label="債券" faucet={phaseA ? 1 : 0} />
          <Pic name="bk_parent_pay" x={700} y={570} size={250} t={L(3, 2) + 0.3} until={L(3, 4) - 0.1} />
          <Pos x={620} y={520} t={L(3, 2)} pat="pop"><span style={{ ...K, fontSize: 28, color: phaseA ? RED : BND }}>{phaseA ? "株↓ → 債券から使う" : "株↑ → 株から使う"}</span></Pos>
        </>
      ) : null}
      <Stamp x={260} y={300} t={L(3, 4)} c={BND} size={46} rot={-3}>状況に合わせて、柔軟に</Stamp>
      <Pic name="bk_family_relief" x={700} y={590} size={250} t={L(3, 4) + 0.2} />
      <Small y={890} t={L(3, 0)}>※2007年末に500万円。株＝S&P500配当込み／債券＝米国10年債。過去の例で、割合や値動きは人によって違います</Small>
    </>
  );
};

// ══ ⑤ なんで暴落で債券が上がりやすい？ ══
const S5: React.FC<{ f: number }> = ({ f }) => {
  const tilt = 16 * p01(f, F(L(4, 2)), F(L(4, 3)) + 0.4, Easing.inOut(Easing.cubic));
  const cx = 500, cy = 360, R = 300;
  const lx = cx - R * Math.cos((tilt * Math.PI) / 180), ly = cy + R * Math.sin((tilt * Math.PI) / 180);
  const rx = cx + R * Math.cos((tilt * Math.PI) / 180), ry = cy - R * Math.sin((tilt * Math.PI) / 180);
  const AX = 470;
  const bar = (x: number, v: number, c: string, t: number, lab: string) => {
    const p = p01(f, F(t), F(t) + 14, Easing.out(Easing.cubic));
    const H = Math.abs(v) * 4.2 * p;
    return (
      <>
        <div style={{ position: "absolute", left: x, top: v > 0 ? AX - H : AX, width: 170, height: H, background: c, borderRadius: v > 0 ? "14px 14px 0 0" : "0 0 14px 14px" }} />
        {p > 0.1 ? <div style={{ position: "absolute", left: x - 30, width: 230, top: v > 0 ? AX - H - 70 : AX + H + 6, textAlign: "center", ...SER, fontSize: 56, color: c }}>{v > 0 ? "+" : "−"}<Count t0={t} t1={t + 0.6} to={Math.abs(v)} />%</div> : null}
        <div style={{ position: "absolute", left: x - 20, width: 210, top: v > 0 ? AX + 10 : AX - 42, textAlign: "center", ...K, fontSize: 28, color: INK, opacity: p }}>{lab}</div>
      </>
    );
  };
  const part2 = f >= F(L(4, 4));
  return (
    <>
      <Pos x={30} y={20} t={L(4, 0)} pat="slideL" tempo="brake"><span style={{ ...K, fontSize: 40 }}>景気悪化で株が下がると、<span style={{ color: BND }}>債券は？</span></span></Pos>
      {!part2 ? (
        <>
          <Pic name="bk_bank_building_rate" x={30} y={90} size={230} t={L(4, 2)} />
          <Pos x={270} y={130} t={L(4, 2) + 0.3}><span style={{ ...B, fontSize: 24, color: SUB }}>アメリカの政策金利 4.75% → ほぼ0%<br />（2007年9月 → 2008年12月）</span></Pos>
          <svg width={1000} height={760} style={{ position: "absolute", inset: 0, overflow: "visible", opacity: p01(f, F(L(4, 1)), F(L(4, 1)) + 8) }}>
            <path d={`M${cx} ${cy + 20} L${cx - 50} ${cy + 140} L${cx + 50} ${cy + 140} Z`} fill={INK} />
            <line x1={lx} y1={ly} x2={rx} y2={ry} stroke={INK} strokeWidth={16} strokeLinecap="round" />
          </svg>
          <div style={{ position: "absolute", left: lx - 90, top: ly - 130, width: 180, height: 110, borderRadius: 16, background: CASH, color: "#fff", ...K, fontSize: 36, display: "flex", alignItems: "center", justifyContent: "center", opacity: p01(f, F(L(4, 1)), F(L(4, 1)) + 8) }}>金利 {tilt > 3 ? "↓" : ""}</div>
          <div style={{ position: "absolute", left: rx - 100, top: ry - 150, width: 200, height: 130, borderRadius: 16, background: BND, color: "#fff", ...K, fontSize: 32, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: p01(f, F(L(4, 1)), F(L(4, 1)) + 8), lineHeight: 1.15 }}><div>債券の価値</div><div style={{ fontSize: 44 }}>{tilt > 3 ? "↑" : ""}</div></div>
          <Pic name="bk_bond_paper" x={740} y={520} size={200} t={L(4, 3)} />
        </>
      ) : (
        <>
          <Pos x={30} y={100} t={L(4, 4)} pat="pop"><span style={{ background: RED, color: "#fff", borderRadius: 10, padding: "4px 16px", ...K, fontSize: 34 }}>2008年（リーマンショックの年）</span></Pos>
          <div style={{ position: "absolute", left: 120, top: AX, width: 760, height: 4, background: INK }} />
          {bar(220, -36.6, STK, L(4, 5), "株")}
          {bar(600, 20.1, BND, L(4, 6), "米国10年国債")}
          <Pic name="bk_bond_paper" x={790} y={160} size={160} t={L(4, 6) + 0.2} />
        </>
      )}
      <Small y={890} t={L(4, 0)}>※景気悪化の暴落の例。2008年の年間リターン（配当・利息込み）：S&P500 −36.55%、米国10年債 +20.10%（Damodaran）</Small>
    </>
  );
};

// ══ ⑥ 約8割と、今の金利 → 資産分散 ══
const DOWN: [number, boolean][] = [[1929, true], [1930, true], [1931, false], [1932, true], [1934, true], [1937, true], [1939, true], [1940, true], [1941, false], [1946, true], [1953, true], [1957, true], [1962, true], [1966, true], [1969, false], [1973, true], [1974, true], [1977, true], [1981, true], [1990, true], [2000, true], [2001, true], [2002, true], [2008, true], [2018, false], [2022, false]];
const S6: React.FC<{ f: number }> = ({ f }) => {
  const p3 = f >= F(L(5, 3)), p6 = f >= F(L(5, 6));
  const i0 = UST10Y.length - 1 - 12 * 26 + 12, n = UST10Y.length - 1;
  const lo = 0, hi = 6, X0 = 90, W = 820, Y0 = 170, H = 380;
  const drawN = Math.round(p01(f, F(L(5, 3)), F(L(5, 4)), Easing.inOut(Easing.quad)) * (n - i0));
  const iLow = UST10Y.indexOf(Math.min(...UST10Y));
  const gx = (i: number) => X0 + ((i - i0) / (n - i0)) * W, gy = (v: number) => Y0 + H - ((v - lo) / (hi - lo)) * H;
  return (
    <>
      {!p3 ? (
        <>
          <Pos x={30} y={20} t={L(5, 0)} pat="slideL" tempo="brake"><span style={{ ...K, fontSize: 38 }}>米国株が下がった年（26回）の債券は？</span></Pos>
          <div style={{ position: "absolute", left: 70, top: 110, display: "grid", gridTemplateColumns: "repeat(7, 118px)", gap: 12 }}>
            {DOWN.map(([y, plus], i) => {
              const t = L(5, 0) + 0.2 + i * 0.06;
              const on = f >= F(t + 1.0);
              const c = !on ? "#D9D1BC" : plus ? BND : RED;
              const tag2022 = y === 2022 && f >= F(L(5, 1));
              return <div key={y} style={{ height: 70, borderRadius: 14, background: c, color: "#fff", ...K, fontSize: 26, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${interpolate(f - F(t), [0, 3, 6], [0, 1.1, 1], clamp) * (tag2022 ? 1.12 : 1)})`, outline: tag2022 ? `5px solid ${YEL}` : undefined }}>{y}</div>;
            })}
          </div>
          <NumCard x={80} y={520} t={L(5, 0) + 1.6} t1={L(5, 0) + 2.6} label="債券がプラスだった年" to={8} unit="割" c={BND} w={380} />
          <Pos x={500} y={560} t={L(5, 0) + 2.0}><span style={{ ...K, fontSize: 30, color: BND }}>■ 債券プラス 21回</span><br /><span style={{ ...K, fontSize: 30, color: RED }}>■ 債券もマイナス 5回</span></Pos>
          <Stamp x={60} y={740} t={L(5, 2)} c={RED} size={36} rot={-2}>2022年は株も債券も一緒に下がった</Stamp>
          <Small y={860} t={L(5, 0)}>※1928〜2025年（98年間）でS&P500（配当込み）がマイナスの26年のうち、米国10年債（利息込み）がプラスは21年（Damodaran）。2022年は物価の上昇を抑えるため金利が大きく上がり、株も債券も下がりました</Small>
        </>
      ) : !p6 ? (
        <>
          <Pos x={30} y={20} t={L(5, 3)} pat="slideL" tempo="brake"><span style={{ ...K, fontSize: 38 }}>アメリカの10年国債の金利（月平均）</span></Pos>
          <svg width={1000} height={760} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
            {[0, 2, 4, 6].map((v) => <g key={v}><line x1={X0} x2={X0 + W} y1={gy(v)} y2={gy(v)} stroke="#E6DDBE" strokeWidth={2} /><text x={X0 - 12} y={gy(v) + 8} textAnchor="end" fontSize={22} fill={SUB} fontFamily="Noto Sans JP" fontWeight={700}>{v}%</text></g>)}
            {[2005, 2010, 2015, 2020, 2025].map((y) => { const i = (y - 2000) * 12; return i >= i0 ? <text key={y} x={gx(i)} y={Y0 + H + 34} textAnchor="middle" fontSize={22} fill={SUB} fontFamily="Noto Sans JP" fontWeight={700}>{y}</text> : null; })}
            <polyline points={UST10Y.slice(i0, i0 + drawN + 1).map((v, k) => `${gx(i0 + k)},${gy(v)}`).join(" ")} fill="none" stroke={BND} strokeWidth={6} strokeLinejoin="round" />
            {drawN >= iLow - i0 ? <circle cx={gx(iLow)} cy={gy(UST10Y[iLow])} r={10} fill={INK} /> : null}
            {drawN >= n - i0 ? <circle cx={gx(n)} cy={gy(UST10Y[n])} r={14 + 4 * Math.sin(f / 4)} fill={RED} /> : null}
          </svg>
          <Pos x={gx(iLow) - 100} y={gy(UST10Y[iLow]) + 30} t={L(5, 3) + 1.0} pat="drop"><span style={{ background: INK, color: "#fff", borderRadius: 8, padding: "2px 12px", ...K, fontSize: 24 }}>2020年 0.52%</span></Pos>
          <Pos x={gx(n) - 260} y={gy(UST10Y[n]) - 120} t={L(5, 4)} pat="stamp" tempo="kire"><span style={{ ...SER, fontSize: 80, color: RED }}>約5%</span><span style={{ ...K, fontSize: 28 }}> 今</span></Pos>
          <Pos x={60} y={640} t={L(5, 4)}><span style={{ ...K, fontSize: 32 }}>増やしやすい ＋ 暴落の備えにもなりやすい</span></Pos>
          <Pos x={60} y={700} t={L(5, 5)}><span style={{ ...K, fontSize: 32, color: BND }}>→ 債券も選択肢に入れやすい</span></Pos>
          <Small y={860} t={L(5, 3)}>※FRED（米セントルイス連銀）DGS10の月平均。利回りは2026年11月時点で5%前後。将来の金利や受取額を約束するものではありません</Small>
        </>
      ) : (
        <>
          <Pos x={30} y={20} t={L(5, 6)} pat="slideL" tempo="brake"><span style={{ ...K, fontSize: 42 }}>どれか1つだけではなく</span></Pos>
          <Pos x={0} y={0} t={L(5, 6) + 0.2} pat="drop"><Tank x={110} y={240} w={200} h={300} level={380} max={500} c={STK} label="株" /></Pos>
          <Pos x={0} y={0} t={L(5, 6) + 0.4} pat="drop"><Tank x={410} y={240} w={200} h={300} level={340} max={500} c={BND} label="債券" /></Pos>
          <Pos x={0} y={0} t={L(5, 6) + 0.6} pat="drop"><Tank x={710} y={240} w={200} h={300} level={260} max={500} c={CASH} label="現金" /></Pos>
          <svg width={1000} height={760} style={{ position: "absolute", inset: 0, overflow: "visible", opacity: p01(f, F(L(5, 7)), F(L(5, 7)) + 10) }}><path d="M210 560 V610 H810 V560 M510 560 V610" stroke={INK} strokeWidth={14} fill="none" strokeLinejoin="round" /></svg>
          {([[110, "増やす・物価の上昇に負けない", STK], [410, "株が下がった時の備え", BND], [710, "すぐ使う", CASH]] as [number, string, string][]).map(([x, t, c]) => <Pos key={x} x={x - 20} y={640} t={L(5, 7) + 0.2}><div style={{ width: 240, textAlign: "center", ...K, fontSize: 24, color: c }}>{t}</div></Pos>)}
          <Stamp x={110} y={740} t={L(5, 7) + 0.5} c={INK} size={44} rot={-2}>何が起きても対応できる 資産分散</Stamp>
          <Pic name="bk_parent_balance" x={820} y={20} size={170} t={L(5, 8)} />
        </>
      )}
    </>
  );
};

// ── 目次（上・6章）──
const TOC = ["暴落でいくら減る", "戻るまで", "使う前の暴落", "どこから使う", "なんで債券", "8割と今の金利"];
const Toc: React.FC<{ f: number; cur: number }> = ({ f, cur }) => (
  <div style={{ position: "absolute", left: 30, top: 30, width: 1020, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
    {TOC.map((t, i) => {
      const done = i < cur || f >= F(END - 0.6), now = i === cur && !done;
      return <div key={t} style={{ ...K, fontSize: 30, color: now ? BLUE : done ? INK : "#BDB5A0", background: now ? "#E8EFFF" : "rgba(255,255,255,0.7)", border: `3px solid ${now ? BLUE : "transparent"}`, borderRadius: 10, padding: "4px 10px", display: "flex", alignItems: "center", gap: 8, transform: now ? `scale(${1 + 0.03 * Math.sin(f / 6)})` : undefined }}><span style={{ fontSize: 20, color: SUB }}>0{i + 1}</span>{t}{done ? <span style={{ color: BND, marginLeft: "auto" }}>✓</span> : null}</div>;
    })}
  </div>
);

// ── 字幕（1行ずつ。仮の時間）──
const Caption: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30;
  let s = -1, i = -1;
  LINES.forEach((ls, si) => ls.forEach((v, li) => { if (t >= v) { s = si; i = li; } }));
  if (s < 0 || t > END) return null;
  const text = SCRIPT[s][i];
  const sc = interpolate(f - F(LINES[s][i]), [0, 3, 6], [0.92, 1.03, 1], clamp);
  const size = Math.min(44, Math.floor(680 / text.length));
  const next = i + 1 < LINES[s].length ? LINES[s][i + 1] : s + 1 < LINES.length ? LINES[s + 1][0] : END;
  const done = interpolate(t, [LINES[s][i], LINES[s][i] + (next - LINES[s][i]) * 0.9], [0, text.length], clamp);
  return <div style={{ position: "absolute", left: 40, width: 720, top: 1205, display: "flex", justifyContent: "center" }}><div style={{ background: "rgba(255,255,255,0.95)", border: `5px solid ${INK}`, borderRadius: 20, padding: "10px 22px", ...K, fontSize: size, whiteSpace: "nowrap", transform: `scale(${sc})`, boxShadow: `6px 6px 0 ${INK}` }}>{text.split("").map((c, k) => <span key={k} style={{ color: k < done ? INK : "#BDB5A0" }}>{c}</span>)}</div></div>;
};

// 効果音（大＝4回だけ高い音。中＝章の切り替え・ハンコ。小＝音なし）
const s = (file: string, t: number, volume = 0.2) => ({ file: `user/${file}`, at: F(t), volume });
const BIG = [L(0, 4) + 0.9, L(1, 6), L(2, 3) + 1.0, L(5, 0) + 2.6];
const CUES = [
  ...BIG.map((t) => s("u04", t, 0.24)),
  ...SEC_START.slice(1).map((t) => s("u03s", t, 0.14)),
  s("u05s", L(0, 2), 0.14), s("u07", L(0, 3), 0.14), s("u05s", L(1, 5), 0.14), s("u05s", L(3, 1), 0.14), s("u05s", L(3, 4), 0.14),
  s("u05s", L(4, 3), 0.14), s("u05s", L(4, 6), 0.14), s("u05s", L(5, 2), 0.14), s("u05s", L(5, 4), 0.14), s("u05s", L(5, 7) + 0.5, 0.16),
];

const SAFE = 0.86, SAFE_X = 40, SAFE_Y = 120;
export const BondReel: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  let cur = 0;
  SEC_START.forEach((s0, i) => { if (t >= s0) cur = i; });
  const punch = BIG.reduce((a, b) => { const k = f - F(b); return k >= 0 && k < 10 ? a + [0, 0.05, 0.06, 0.045, 0.03, 0.018, 0.01, 0.005, 0.002, 0][k] : a; }, 0);
  // 章の切り替え：カードが上へ抜けて、次が下から入る
  const out = p01(f, F(SEC_END(cur) - 0.3), F(SEC_END(cur)), Easing.in(Easing.cubic));
  const inn = p01(f, F(SEC_START[cur]), F(SEC_START[cur]) + 10);
  const cardY = (1 - inn) * 260 - out * 260;
  const S = [S1, S2, S3, S4, S5, S6][cur];
  return (
    <AbsoluteFill style={{ background: "#FBF6D8", overflow: "hidden" }}>
      <Audio src={staticFile("bond-narration.wav")} />
      <SfxTrack cues={CUES} />
      <AbsoluteFill style={{ backgroundImage: "repeating-linear-gradient(transparent 0 62px, rgba(176,146,60,0.22) 62px 64px)" }} />
      <div style={{ position: "absolute", left: 92, top: 0, width: 4, height: 1920, background: "rgba(239,125,87,0.35)" }} />
      <div style={{ position: "absolute", left: SAFE_X, top: SAFE_Y, width: 1080, height: 1400, transform: `scale(${SAFE})`, transformOrigin: "0 0" }}>
        <Toc f={f} cur={cur} />
        <div style={{ position: "absolute", left: 40, top: 180, width: 1000, height: 960, transform: `translateY(${cardY}px) scale(${1 + punch})`, opacity: Math.min(inn * 1.5, 1 - out * 0.6), filter: out > 0.05 || inn < 0.9 ? `blur(${Math.max(out, 1 - inn) * 6}px)` : undefined }}>
          <div style={{ position: "absolute", inset: 0, background: "#fff", borderRadius: 34, boxShadow: "0 22px 60px rgba(90,70,20,0.16)" }} />
          <div style={{ position: "absolute", left: 0, top: 0, width: 1000, height: 960, overflow: "hidden", borderRadius: 34 }}>
            <div style={{ position: "absolute", left: 0, top: 30, width: 1000, height: 930 }}><S f={f} /></div>
          </div>
        </div>
        <div style={{ position: "absolute", left: 40, top: 1150, ...B, fontSize: 18, color: SUB }}>※過去の例で、将来を約束するものではありません。米国株・米国債はドル建て</div>
      </div>
      <Caption f={f} />
      <div style={{ position: "absolute", left: 790, top: 1180 + Math.sin(f / 10) * 4 }}><GenSlot name={(() => { const lv = BOND_MOUTH.charCodeAt(Math.min(BOND_MOUTH.length - 1, f)) - 48; return f % 96 > 92 && lv === 0 ? "taichi_blink" : lv >= 2 ? (Math.floor(f / 3) % 4 ? "taichi_talk_open" : "taichi_talk_mid") : lv === 1 ? "taichi_talk_mid" : "taichi_talk_closed"; })()} size={190} /></div>
    </AbsoluteFill>
  );
};
