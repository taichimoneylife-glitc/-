import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame } from "remotion";
import { A2 } from "./components/kit2";
import { FONT } from "./components/font";
import { B, GenSlot } from "./MileLifePlan";
import { SfxTrack } from "./components/sfx";
import { Board, Panel, Stop, Stepper, panelXY, PW, PH } from "./components/board";
import { F, K, SER, pop, R, Lines, At, Arrow, Cross, Count } from "./components/zukaiKit";
import { ghostIn, Spot } from "./components/cam";
import { UST10Y } from "./ust10y";

// ════════════════════════════════════════════════════════════════════
//  NISAを売って債券に移した理由（図解パート・76.4秒。冒頭と締めは実写トーク）
//  音声＝public/nisabond-narration.wav。作り＝参考リール②（マーケ博士）の「1枚の地図」＋左下のステップ表示、色は太一の黄色ノート。
//  数字：500万円×年5%複利 → 16年後 約1,091万円／30年後 約2,161万円。米国10年債＝FRED DGS10の月平均（2020年8月 0.52%が最低、2026年10月 約5%）。
//  画像 nb_*（太一と同じ絵柄で依頼中）は、届くまで点線の枠で表示される。
// ════════════════════════════════════════════════════════════════════

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const out = { ...clamp, easing: Easing.out(Easing.cubic) };
const INK = A2.ink, RED = A2.red, STOCK = "#2E9E6B", BOND = "#4A8FD6", CASH = "#E9B82E", SUB = A2.sub;
const Img2: React.FC<{ n: string; s: number }> = ({ n, s }) => <GenSlot name={n} size={s} />;
const Tag: React.FC<{ c: string; children: React.ReactNode; size?: number }> = ({ c, children, size = 30 }) => (
  <span style={{ display: "inline-block", background: c, color: "#fff", borderRadius: 999, padding: "4px 22px", ...K, fontSize: size, whiteSpace: "nowrap" }}>{children}</span>
);
const Head: React.FC<{ n: number; at: number; title: string }> = ({ n, at, title }) => {
  const f = useCurrentFrame();
  if (f < F(at)) return null;
  return (
    <div style={{ position: "absolute", left: 60, top: 300, display: "flex", alignItems: "center", gap: 20, ...ghostIn(f, F(at)), transformOrigin: "0 50%" }}>
      <span style={{ background: RED, color: "#fff", borderRadius: 999, padding: "6px 28px", ...K, fontSize: 36 }}>理由 {n}</span>
      <span style={{ ...K, fontSize: 62, color: INK }}>{title}</span>
    </div>
  );
};
const Foot: React.FC<{ at: number; children: React.ReactNode; y?: number }> = ({ at, children, y = 1290 }) => (
  <At at={at} x={60} y={y} mode="fade"><span style={{ ...B, fontSize: 24, color: SUB }}>{children}</span></At>
);

// ── 10マスのブロック（1マス＝10%） ──
type Mix = [number, number, number]; // 株・債券・現金その他
const mixAt = (t: number): Mix => (t >= 10.42 ? [5, 3, 2] : t >= 5.9 ? [8, 1, 1] : t >= 5.14 ? [7, 2, 1] : [6, 2, 2]);
const Blocks: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  const f = useCurrentFrame();
  const t = f / 30;
  const m = mixAt(t);
  const crash = t >= 8.46 && t < 10.42;
  const cols = Array.from({ length: 10 }).map((_, i) => (i < m[0] ? STOCK : i < m[0] + m[1] ? BOND : CASH));
  const flipAt = t >= 10.42 ? F(10.42) : t >= 5.9 ? F(5.9) : t >= 5.14 ? F(5.14) : -99;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 960, background: "#fff", border: `5px solid ${INK}`, borderRadius: 26, boxShadow: "8px 10px 0 #E3B53C", padding: "26px 28px", boxSizing: "border-box" }}>
      <div style={{ display: "flex", gap: 10 }}>
        {cols.map((c, i) => {
          const shake = crash && c === STOCK ? Math.sin((f + i * 3) * 1.9) * 7 : 0;
          const flip = flipAt > 0 ? interpolate(f - flipAt - i, [0, 4, 8], [1, 0, 1], clamp) : 1;
          return <div key={i} style={{ flex: 1, height: 120, borderRadius: 12, background: crash && c === STOCK ? RED : c, transform: `translateY(${shake}px) scaleX(${flip})`, boxShadow: "inset 0 -8px 0 rgba(0,0,0,0.12)" }} />;
        })}
      </div>
      <div style={{ display: "flex", gap: 34, marginTop: 18, ...B, fontSize: 32, color: INK }}>
        {([["株", STOCK, m[0]], ["債券", BOND, m[1]], ["現金その他", CASH, m[2]]] as [string, string, number][]).map(([l, c, v]) => (
          <span key={l} style={{ display: "inline-flex", alignItems: "center", gap: 10 }}><span style={{ width: 26, height: 26, borderRadius: 6, background: c }} />{l} <span style={{ ...SER, color: c, fontSize: 44 }}>{v * 10}</span>%</span>
        ))}
      </div>
    </div>
  );
};

// ── P1 理由① 資産分散（0–11.8） ──
const P1: React.FC = () => {
  const f = useCurrentFrame();
  const crashP = interpolate(f, [F(8.46), F(8.46) + 10], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  return (
    <>
      <Head n={1} at={0} title="資産分散" />
      <Lines y={420} size={50} lines={[[1.4, <>僕はこれからも<R>投資信託</R>を積み立てていく</>], [4.4, <>今後さらに<R>株の割合</R>が増えていく</>]]} />
      <At at={1.6} x={70} y={600} mode="pop"><Img2 n="nb_phone_invest" s={230} /></At>
      <At at={1.9} x={330} y={640} mode="pop"><Tag c={STOCK} size={34}>毎月 積立</Tag></At>
      <Arrow at={2.4} x1={340} y1={760} x2={560} y2={760} color={STOCK} />
      <At at={2.6} x={590} y={690} mode="pop"><span style={{ ...K, fontSize: 52, color: STOCK }}>株 ↑↑</span></At>
      <Blocks x={60} y={890} />
      {f >= F(8.46) && f < F(10.42) ? (
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
          <polyline points={`560,640 640,610 720,625 ${720 + 120 * crashP},${625 + 170 * crashP}`} fill="none" stroke={RED} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : null}
      <At at={8.6} until={10.4} x={760} y={760} mode="pop"><span style={{ ...K, fontSize: 60, color: RED }}>暴落</span></At>
      <At at={7.6} until={10.4} x={60} y={1150} mode="ghost"><span style={{ ...K, fontSize: 46, color: INK }}>株に偏るほど <R>暴落の影響</R>も大きい</span></At>
      <At at={10.6} x={240} y={1140} mode="pop"><span style={{ display: "inline-block", border: `7px solid ${RED}`, borderRadius: 18, padding: "4px 40px", ...SER, fontSize: 64, color: RED, background: "#FFF6F2", transform: "rotate(-4deg)" }}>資産を分散</span></At>
    </>
  );
};

// ── P2 理由② 今の高金利（11.8–24.42）米国10年債の折れ線 ──
const GX = 90, GY = 620, GW = 900, GH = 480, YMAX = 7;
const gx = (i: number) => GX + (i / (UST10Y.length - 1)) * GW, gy = (v: number) => GY + GH - (v / YMAX) * GH;
const iLow = UST10Y.indexOf(Math.min(...UST10Y)), iEnd = UST10Y.length - 1;
const P2: React.FC = () => {
  const f = useCurrentFrame();
  const L = interpolate(f, [F(13.6), F(15.6)], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const n = Math.max(2, Math.round(L * UST10Y.length));
  const blink = f >= F(17.94) ? 0.55 + 0.45 * Math.sin((f - F(17.94)) / 3) : 0;
  return (
    <>
      <Head n={2} at={11.8} title="今の高金利" />
      <Lines y={420} size={46} lines={[[13.6, <>債券の金利は<R>日々変わる</R></>]]} />
      <At at={13.0} x={60} y={GY - 60} mode="fade"><span style={{ ...B, fontSize: 28, color: SUB }}>米国10年債の利回り（月平均）</span></At>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        {f >= F(13.2) ? <>
          {[0, 2, 4, 6].map((v) => <g key={v}><line x1={GX} y1={gy(v)} x2={GX + GW} y2={gy(v)} stroke="#E6DDBE" strokeWidth={2} /><text x={GX - 14} y={gy(v) + 10} textAnchor="end" fontSize={26} fill={SUB} fontFamily="Noto Sans JP" fontWeight={700}>{v}%</text></g>)}
          {[2000, 2010, 2020].map((y) => { const i = (y - 2000) * 12; return <text key={y} x={gx(i)} y={GY + GH + 40} textAnchor="middle" fontSize={26} fill={SUB} fontFamily="Noto Sans JP" fontWeight={700}>{y}</text>; })}
          <polyline points={UST10Y.slice(0, n).map((v, i) => `${gx(i)},${gy(v)}`).join(" ")} fill="none" stroke={BOND} strokeWidth={6} strokeLinejoin="round" />
        </> : null}
        {blink > 0 ? <circle cx={gx(iEnd)} cy={gy(UST10Y[iEnd])} r={18 + 10 * blink} fill={RED} opacity={0.35 + 0.5 * blink} /> : null}
      </svg>
      <Spot at={16.68} until={17.9} rect={[gx(iLow) - 70, gy(UST10Y[iLow]) - 60, 140, 110]} r={18} />
      <At at={16.9} until={17.9} x={gx(iLow) - 150} y={gy(UST10Y[iLow]) + 60} mode="pop"><Tag c={INK}>2020年 0.52%</Tag></At>
      <At at={18.14} x={gx(iEnd) - 300} y={gy(UST10Y[iEnd]) - 150} mode="pop"><span style={{ ...SER, fontSize: 84, color: RED }}>約5%</span><span style={{ ...B, fontSize: 28, color: INK }}> 今</span></At>
      <At at={20.6} x={660} y={1180} mode="pop"><span style={{ display: "inline-block", border: `6px solid ${RED}`, borderRadius: 14, padding: "2px 26px", ...SER, fontSize: 52, color: RED, background: "#FFF6F2", transform: "rotate(-6deg)" }}>期間限定</span></At>
      <At at={21.88} x={60} y={1180} mode="ghost"><span style={{ ...K, fontSize: 46, color: INK }}>高金利の<R>今</R>、債券へ</span></At>
      <Foot at={13.6} y={1300}>※出典：FRED（米セントルイス連銀）DGS10。2026年10月時点</Foot>
    </>
  );
};

// ── P3 理由③ 500万円（24.42–36.38） ──
const Stack: React.FC<{ at: number; h: number; c: string; label: string }> = ({ at, h, c, label }) => {
  const f = useCurrentFrame();
  if (f < F(at)) return null;
  const k = interpolate(f - F(at), [0, 8], [0, 1], out);
  return <div style={{ height: h * k, background: c, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", ...K, fontSize: 46, color: "#fff", overflow: "hidden", boxShadow: "inset 0 -8px 0 rgba(0,0,0,0.12)" }}>{label}</div>;
};
const P3: React.FC = () => (
  <>
    <Head n={3} at={24.42} title="将来のお金を見える化" />
    <Lines y={420} size={48} lines={[[25.18, <>将来のお金を<R>ある程度確定</R>させたかった</>]]} />
    <div style={{ position: "absolute", left: 120, top: 560, width: 320, height: 620, display: "flex", flexDirection: "column-reverse", gap: 8 }}>
      <Stack at={28.76} h={330} c={BOND} label="300万円" />
      <Stack at={30.98} h={220} c="#2F6FB8" label="+200万円" />
    </div>
    <At at={28.9} x={130} y={1190} mode="fade"><span style={{ ...B, fontSize: 28, color: SUB }}>もともと</span></At>
    <At at={32.22} x={520} y={700} mode="pop"><div style={{ ...B, fontSize: 40, color: INK }}>合計<br /><span style={{ ...SER, fontSize: 150, color: BOND, lineHeight: 1 }}><Count at={32.4} to={500} dur={12} /></span><span style={{ ...K, fontSize: 52 }}>万円</span></div></At>
    <At at={33.84} x={520} y={980} mode="pop"><Tag c={RED} size={40}>5%超の水準で運用</Tag></At>
    <At at={30.0} x={540} y={1090} mode="pop"><Img2 n="nb_bond_box" s={190} /></At>
    <Foot at={33.4}>※ドル建て・満期まで持った場合。円での金額は為替で変わります</Foot>
  </>
);

// ── P4 16年後・30年後（36.38–45.26） ──
const P4: React.FC = () => {
  const f = useCurrentFrame();
  const g1 = interpolate(f, [F(38.1), F(38.1) + 18], [0, 1], out), g2 = interpolate(f, [F(39.74), F(39.74) + 18], [0, 1], out);
  const col = (x: number, h: number, c: string) => <div style={{ position: "absolute", left: x, top: 1060 - h, width: 200, height: h, borderRadius: "16px 16px 0 0", background: c, boxShadow: "inset 0 -8px 0 rgba(0,0,0,0.1)" }} />;
  return (
    <>
      <Lines y={330} size={48} lines={[[36.38, <>何年後に<R>いくら</R>になるか、わかる</>]]} />
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}><line x1={60} y1={1062} x2={1020} y2={1062} stroke={INK} strokeWidth={6} /></svg>
      {col(100, 120, BOND)}
      {f >= F(38.1) ? col(440, 120 + 140 * g1, BOND) : null}
      {f >= F(39.74) ? col(780, 120 + 360 * g2, BOND) : null}
      <At at={36.4} x={100} y={1080} mode="fade"><div style={{ width: 200, textAlign: "center", ...K, fontSize: 34 }}>今<br /><span style={{ ...B, fontSize: 26, color: SUB }}>子ども2歳</span></div></At>
      <At at={36.6} x={110} y={620} mode="pop"><Img2 n="nb_kid_toddler" s={180} /></At>
      <At at={36.6} x={115} y={885} mode="fade"><span style={{ ...SER, fontSize: 52, color: BOND }}>500万</span></At>
      <At at={38.1} x={440} y={1080} mode="fade"><div style={{ width: 200, textAlign: "center", ...K, fontSize: 34 }}>16年後<br /><span style={{ ...B, fontSize: 26, color: SUB }}>18歳・大学</span></div></At>
      <At at={37.34} x={450} y={530} mode="pop"><Img2 n="nb_kid_student" s={180} /></At>
      <At at={38.4} x={410} y={735} mode="pop"><span style={{ ...B, fontSize: 30 }}>約</span><span style={{ ...SER, fontSize: 64, color: BOND }}>1,091</span><span style={{ ...B, fontSize: 30 }}>万円</span></At>
      <At at={39.74} x={780} y={1080} mode="fade"><div style={{ width: 200, textAlign: "center", ...K, fontSize: 34 }}>30年後<br /><span style={{ ...B, fontSize: 26, color: SUB }}>老後</span></div></At>
      <At at={39.9} x={790} y={300} mode="pop"><Img2 n="nb_elderly_couple" s={170} /></At>
      <At at={40.1} x={750} y={515} mode="pop"><span style={{ ...B, fontSize: 30 }}>約</span><span style={{ ...SER, fontSize: 64, color: BOND }}>2,161</span><span style={{ ...B, fontSize: 30 }}>万円</span></At>
      <At at={42.7} x={350} y={1180} mode="pop"><Tag c={STOCK} size={36}>教育資金</Tag></At>
      <At at={43.78} x={640} y={1180} mode="pop"><Tag c={CASH} size={36}>老後資金</Tag></At>
      <Foot at={38.4} y={1270}>※500万円を年5%で複利運用した場合の目安。ドル建て・満期まで持った場合／円での金額は為替で変わります</Foot>
    </>
  );
};

// ── P5 暴落していたら債券から（45.26–52.3） ──
const P5: React.FC = () => {
  const f = useCurrentFrame();
  const cr = interpolate(f, [F(47.5), F(47.5) + 12], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  return (
    <>
      <Lines y={330} size={48} lines={[[45.26, <>もし<R>教育費が必要な時</R>に</>], [47.08, <>株が<R>暴落</R>していたら？</>]]} />
      <div style={{ position: "absolute", left: 80, top: 600, width: 400, height: 380, background: "#fff", border: `5px solid ${INK}`, borderRadius: 22, boxSizing: "border-box" }}>
        <div style={{ position: "absolute", left: 24, top: 16, ...K, fontSize: 40, color: STOCK }}>株</div>
        <svg width={390} height={370} style={{ position: "absolute", left: 0, top: 0 }}><polyline points={`30,280 100,230 170,250 240,170 ${240 + 110 * cr},${170 + 170 * cr}`} fill="none" stroke={cr > 0 ? RED : STOCK} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
      <Cross at={48.66} x={190} y={680} s={200} />
      <At at={48.86} x={110} y={1000} mode="pop"><span style={{ ...K, fontSize: 38, color: RED }}>無理に売らない</span></At>
      <div style={{ position: "absolute", left: 600, top: 600, width: 400, height: 380, background: "#fff", border: `5px solid ${INK}`, borderRadius: 22, boxSizing: "border-box" }}>
        <div style={{ position: "absolute", left: 24, top: 16, ...K, fontSize: 40, color: BOND }}>債券</div>
        <div style={{ position: "absolute", left: 110, top: 110 }}><Img2 n="nb_bond_box" s={180} /></div>
      </div>
      <Spot at={49.66} until={52.0} rect={[590, 590, 420, 400]} r={26} color={CASH} />
      <Arrow at={50.2} x1={800} y1={1000} x2={800} y2={1110} color={BOND} />
      <At at={50.4} x={660} y={1110} mode="pop"><Img2 n="nb_envelope_money" s={150} /></At>
      <At at={50.6} x={820} y={1120} mode="pop"><Tag c={BOND} size={30}>債券側から使う</Tag></At>
      <At at={51.26} x={60} y={1190} mode="ghost"><span style={{ ...K, fontSize: 44, color: INK }}>そんな<R>選択肢</R>も持てる</span></At>
    </>
  );
};

// ── P6 株と債券を持つ理由（52.3–65.22） ──
const P6: React.FC = () => {
  const f = useCurrentFrame();
  const fan = interpolate(f, [F(53.0), F(55.0)], [0, 1], out);
  const line = interpolate(f, [F(59.5), F(61.3)], [0, 1], out);
  const ends = [-170, -90, -20, 50, 120];
  return (
    <>
      <div style={{ position: "absolute", left: 60, top: 330, ...K, fontSize: 58, color: INK }}>株と債券を<R>両方</R>持つ理由</div>
      {/* 株：シミュレーション（点線が広がる） */}
      <div style={{ position: "absolute", left: 60, top: 470, width: 470, height: 600, background: "#fff", border: `5px solid ${INK}`, borderRadius: 24, boxSizing: "border-box" }}>
        <div style={{ position: "absolute", left: 24, top: 16, ...K, fontSize: 44, color: STOCK }}>株</div>
        <svg width={460} height={590} style={{ position: "absolute", left: 0, top: 0 }}>
          {f >= F(52.3) ? ends.map((e, i) => <line key={i} x1={50} y1={330} x2={50 + 360 * fan} y2={330 + (e - 40) * fan} stroke={STOCK} strokeWidth={5} strokeDasharray="12 10" opacity={0.85} />) : null}
          <circle cx={50} cy={330} r={10} fill={STOCK} />
        </svg>
        <At at={52.72} x={40} y={440} mode="pop"><span style={{ ...B, fontSize: 30, color: INK }}>「年利5%なら…」</span></At>
        <At at={55.66} x={40} y={500} mode="pop"><span style={{ ...B, fontSize: 28, color: SUB }}>過去の実績をもとにした</span></At>
      </div>
      <At at={57.16} x={90} y={1090} mode="pop"><span style={{ display: "inline-block", border: `6px solid ${STOCK}`, borderRadius: 14, padding: "2px 22px", ...SER, fontSize: 44, color: STOCK, background: "#F2FBF6", transform: "rotate(-4deg)" }}>シミュレーション</span></At>
      {/* 債券：満期でゴールが決まっている */}
      <div style={{ position: "absolute", left: 550, top: 470, width: 470, height: 600, background: "#fff", border: `5px solid ${INK}`, borderRadius: 24, boxSizing: "border-box" }}>
        <div style={{ position: "absolute", left: 24, top: 16, ...K, fontSize: 44, color: BOND }}>債券</div>
        <svg width={460} height={590} style={{ position: "absolute", left: 0, top: 0 }}>
          {f >= F(58.46) ? <line x1={50} y1={360} x2={50 + 340 * line} y2={360 - 150 * line} stroke={BOND} strokeWidth={8} strokeLinecap="round" /> : null}
          <circle cx={50} cy={360} r={10} fill={BOND} />
          {line > 0.95 ? <circle cx={390} cy={210} r={16} fill={RED} /> : null}
        </svg>
        <At at={59.5} x={250} y={130} mode="pop"><span style={{ ...B, fontSize: 28, color: INK }}>満期 🏁</span></At>
        <At at={60.8} x={40} y={440} mode="pop"><span style={{ ...B, fontSize: 30, color: INK }}>何年後にいくらか</span></At>
        <At at={61.6} x={40} y={500} mode="pop"><span style={{ ...B, fontSize: 28, color: SUB }}>満期まで持つ前提なら</span></At>
      </div>
      <At at={63.14} x={600} y={1090} mode="pop"><span style={{ display: "inline-block", border: `6px solid ${BOND}`, borderRadius: 14, padding: "2px 22px", ...SER, fontSize: 44, color: BOND, background: "#F1F6FD", transform: "rotate(-4deg)" }}>計画が立てやすい</span></At>
      <Foot at={60.0} y={1210}>※ドル建て・満期まで持った場合。円での金額は為替で変わります</Foot>
    </>
  );
};

// ── P7 まとめ（70.7–76.4） ──
const P7: React.FC = () => (
  <>
    <div style={{ position: "absolute", left: 60, top: 330, ...K, fontSize: 60, color: INK }}><R>株</R>と<R>債券</R>、両方を持つと</div>
    <At at={71.0} x={250} y={470} mode="pop"><Img2 n="nb_family" s={580} /></At>
    <Lines y={1070} size={52} lines={[[72.94, <><R>将来のお金</R>も</>], [73.9, <><R>今使っていいお金</R>も</>], [75.16, "計画しやすくなる"]]} />
  </>
);

// ════════ 地図の並び ════════
const PANELS: Panel[] = [
  { id: "p1", col: 0, row: 0 }, { id: "p2", col: 1, row: 0 }, { id: "p3", col: 2, row: 0 },
  { id: "p4", col: 2, row: 1 }, { id: "p5", col: 1, row: 1 }, { id: "p6", col: 0, row: 1 }, { id: "p7", col: 0, row: 2 },
];
const MAPIDS = ["p1", "p2", "p3", "p4", "p5", "p6"];
const STOPS: Stop[] = [
  { id: "p1", trans: 0 }, { id: "p2", trans: 11.6 }, { id: "p3", trans: 24.2 }, { id: "p4", trans: 36.1 },
  { id: "p5", trans: 45.0 }, { id: "p6", trans: 52.05 }, { id: "__map", trans: 65.0, scale: 0.26, ids: MAPIDS }, { id: "p7", trans: 70.5 },
];
const LINKS: [string, string][] = PANELS.slice(1).map((p, i) => [PANELS[i].id, p.id]);
const BODY: Record<string, React.FC> = { p1: P1, p2: P2, p3: P3, p4: P4, p5: P5, p6: P6, p7: P7 };

// まとめの全体マップ：見出し＋各理由に赤い枠
const MapLayer: React.FC = () => {
  const f = useCurrentFrame();
  if (f < F(65.2) || f >= F(70.6)) return null;
  const ps = PANELS.filter((p) => MAPIDS.includes(p.id));
  const xs = ps.map((p) => panelXY(p)[0]), ys = ps.map((p) => panelXY(p)[1]);
  const cx = (Math.min(...xs) + Math.max(...xs) + PW) / 2, cy = (Math.min(...ys) + Math.max(...ys) + PH) / 2, s = 0.26;
  return (
    <>
      {["p1", "p2", "p3", "p6"].map((id, i) => {
        const [x, y] = panelXY(PANELS.find((q) => q.id === id)!);
        const at = F([66.4, 68.24, 68.9, 70.0][i]);
        if (f < at) return null;
        return <div key={id} style={{ position: "absolute", left: 540 + (x - cx) * s - 6, top: 960 + (y - cy) * s - 6, width: PW * s + 12, height: PH * s + 12, border: `7px solid ${RED}`, borderRadius: 16, background: "rgba(232,85,59,0.07)", transform: `scale(${pop(f, at)})` }} />;
      })}
      <div style={{ position: "absolute", left: 0, top: 230, width: 1080, padding: "26px 60px", background: "rgba(251,246,216,0.94)", boxSizing: "border-box" }}>
        <Lines x={0} y={0} size={54} lines={[[65.22, "まとめると、"], [66.4, <>これから<R>株の割合</R>が増えていく中で</>], [68.24, <><R>高金利の今</R>、一部を債券に移しました</>]]} />
        <div style={{ height: 250 }} />
      </div>
    </>
  );
};

// 右下の太一
const POSES: [number, string][] = [
  [0, "taichi_point_up"], [7.5, "taichi_scared"], [10.42, "taichi_ok_hand"], [11.8, "taichi_explain_both"], [16.68, "taichi_notice"], [17.94, "taichi_point_upright"],
  [21.88, "taichi_thumbs_up"], [24.42, "taichi_point_left"], [32.22, "taichi_proud"], [36.38, "taichi_think_chin"], [42.7, "taichi_happy_big"],
  [45.26, "taichi_worry"], [49.66, "taichi_idea"], [52.3, "taichi_explain_both"], [57.16, "taichi_hmm_doubt"], [62.62, "taichi_ok_circle"],
  [65.22, "taichi_point_up"], [70.72, "taichi_heart_hands"],
];
const Chara: React.FC = () => {
  const f = useCurrentFrame();
  let name = POSES[0][1], at = 0;
  POSES.forEach(([t, n]) => { if (f >= F(t)) { name = n; at = t; } });
  const k = interpolate(f - F(at), [0, 3, 7], [0.82, 1.06, 1], clamp);
  return <div style={{ position: "absolute", left: 680, top: 1390, width: 400, height: 400, transform: `scale(${k})`, transformOrigin: "50% 100%" }}><GenSlot name={name} size={400} /></div>;
};

// 効果音（たいちさん指定の音だけ）
const CUES: { file: string; at: number; volume: number }[] = [
  ...[11.6, 24.2, 36.1, 45.0, 52.05, 65.0, 70.5].map((t) => ({ file: "user/u03s", at: F(t), volume: 0.24 })),
  ...[0, 11.8, 24.42].map((t) => ({ file: "user/u03", at: F(t), volume: 0.24 })),
  ...[1.6, 2.6, 5.14, 5.9].map((t) => ({ file: "user/u02s", at: F(t), volume: 0.2 })),
  { file: "user/u04", at: F(8.6), volume: 0.28 }, { file: "user/u05", at: F(10.6), volume: 0.28 },
  { file: "user/u05s", at: F(16.68), volume: 0.22 }, { file: "user/u05", at: F(18.14), volume: 0.26 }, { file: "user/u04", at: F(20.6), volume: 0.26 },
  ...[28.76, 30.98].map((t) => ({ file: "user/u02s", at: F(t), volume: 0.2 })), { file: "user/u05", at: F(32.4), volume: 0.26 }, { file: "user/u02s", at: F(33.84), volume: 0.2 },
  ...[38.4, 40.1].map((t) => ({ file: "user/u05s", at: F(t), volume: 0.22 })), ...[42.7, 43.78].map((t) => ({ file: "user/u02s", at: F(t), volume: 0.2 })),
  { file: "user/u04", at: F(47.5), volume: 0.26 }, { file: "user/u05s", at: F(49.66), volume: 0.22 }, { file: "user/u02s", at: F(50.6), volume: 0.2 },
  { file: "user/u04", at: F(57.16), volume: 0.24 }, { file: "user/u04", at: F(63.14), volume: 0.24 },
  ...[66.4, 68.24, 68.9, 70.0].map((t) => ({ file: "user/u05s", at: F(t), volume: 0.2 })), { file: "user/u10", at: F(75.16), volume: 0.28 },
];

export const NISABOND_FRAMES = F(76.9);
export const NisaBondReel: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: A2.bg, fontFamily: FONT }}>
    <Audio src={staticFile("nisabond-narration.wav")} />
    <SfxTrack cues={CUES} />
    <Board panels={PANELS} stops={STOPS} links={LINKS} paper={{ background: A2.bg, backgroundImage: "repeating-linear-gradient(transparent 0 62px, rgba(176,146,60,0.22) 62px 64px)" }}>
      {(id) => { const C = BODY[id]; return <AbsoluteFill><C /></AbsoluteFill>; }}
    </Board>
    <MapLayer />
    <Stepper labels={["分散", "高金利", "見える化", "株と債券"]} steps={[0, 11.8, 24.42, 52.3]} x={40} y={1420} color={RED} />
    <Chara />
  </AbsoluteFill>
);
