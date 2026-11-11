import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame } from "remotion";
import { FONT } from "./components/font";
import { SfxTrack } from "./components/sfx";
import { GenSlot } from "./MileLifePlan";
import { Board, Stepper, type Panel, type Stop } from "./components/board";
import { Captions } from "./BourakuReel";
import { F, clamp, out, K, B, SER, M, pop, yen, cnt, R, In, Sticker, Tag, Icon, type IconName, Link, Ripple, Stamp, shake, Paper2, SectionPill, Chain, Pill2, HandCircle, CautionTape, MoneyRain, Spotlight } from "./components/marke";
import { RL_MOUTH } from "./rlMouth";

// ════════════════════════════════════════════════════════════════════
//  住宅ローン①「金利が上がると何が起こる？」完全図解 v3（最新のマーケ博士＝参考⑨の型）
//  音声＝public/rl-narration.wav（99.1秒・1.1倍）。字幕なし、要点は札で。
//  型：ほぼ白の方眼＋灰色の小さな形／上の真ん中に黒い札「アイコン｜01｜章」だけ／真ん中に大きな主役1つ／
//      主役から「線＋黄色い点」で下へつながる札／山場は黄色い放射線＋輪／注目は丸い輪／一言の前は灰色に沈める／
//      ④だけ青い背景／右下に大きな太一（ポーズが変わる）
//  数字（計算で確認済み）：5,000万・30年・0.5%＝149,595円/月（元金128,761・利息20,833）
//   1.5%で同じ返済なら元金87,095・利息62,500／5年利息115.4万→355.3万／残高+239.8万／
//   5年後の返済178,279円（+28,684円・1.25倍上限186,993円の内）／総支払+860.5万
// ════════════════════════════════════════════════════════════════════
const BLUE_BG = "#2E9E6B"; // 山場の章の背景＝たいちさんの緑
const Note: React.FC<{ at: number; until?: number; children: React.ReactNode; light?: boolean }> = ({ at, until = 999, children, light }) => {
  const f = useCurrentFrame();
  if (f < F(at) || f > F(until)) return null;
  return <div style={{ position: "absolute", left: 60, width: 560, top: 1330, ...B, fontSize: 20, lineHeight: 1.45, color: light ? "rgba(255,255,255,0.85)" : M.sub, opacity: interpolate(f - F(at), [0, 6], [0, 1], clamp) }}>{children}</div>;
};
// 主役の大きな札（白・黒い太枠・ずらし影）
const Hero: React.FC<{ w?: number; h?: number; bg?: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ w = 900, h, bg = "#fff", children, style }) => (
  <div style={{ width: w, height: h, background: bg, border: `6px solid ${M.ink}`, borderRadius: 22, boxShadow: `10px 10px 0 ${M.blue}`, boxSizing: "border-box", position: "relative", overflow: "hidden", ...style }}>{children}</div>
);
const HeroBar: React.FC<{ title: string; icon?: string }> = ({ title, icon = "▤" }) => (
  <div style={{ background: M.ink, color: "#fff", padding: "10px 22px", ...B, fontSize: 26, display: "flex", alignItems: "center", gap: 10 }}><span>{icon}</span>{title}</div>
);

// ════════ 冒頭（0–10.24）：黄色い放射線の上で「15万円 → 15万円」 ════════
const NUMS: [string, string, string][] = [["01", "仕組み", M.blue], ["02", "5年ルール", M.orange], ["03", "中身", M.red], ["04", "5年後", M.green], ["05", "未払利息", M.blue]];
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ transform: shake(f, 3.6, 14) }}>
      <Paper2 />
      <In at={0.05} x={0} y={250} center mode="ghost"><span style={{ ...K, fontSize: 58, color: M.ink }}>住宅ローン<R>金利</R>が上がっても…</span></In>
      <In at={0.35} x={90} y={360} mode="pop">
        <Hero>
          <HeroBar title="毎月の返済額" icon="¥" />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, padding: "30px 0 26px" }}>
            <GenSlot name="rl_couple_relax" size={250} />
            <div>
              <div style={{ ...B, fontSize: 28, color: M.sub }}>金利 0.5% → <R>1.5%</R></div>
              <div style={{ ...SER, fontSize: 96, lineHeight: 1.1 }}>15<span style={{ ...K, fontSize: 40 }}>万円</span></div>
              <div style={{ ...K, fontSize: 36 }}>→ 15<span style={{ fontSize: 26 }}>万円</span></div>
            </div>
          </div>
        </Hero>
      </In>
      <Chain at={1.62} x={540} y0={784} y1={850}><Pill2 c={M.green}>返済額が変わってない！</Pill2></Chain>
      <CautionTape at={3.4} until={6.2} />
      <Stamp at={3.6} x={250} y={980} text="これ マジで危険" size={70} />
      <Ripple x={540} y={1030} at={3.6} n={3} />
      {/* この動画で分かる5つ（色の番号） */}
      <In at={4.54} x={0} y={1150} center mode="pop"><span style={{ ...K, fontSize: 40 }}>金利が上がると<R>何が起こる？</R></span></In>
      {NUMS.map(([n, t, c], i) => (
        <In key={n} at={6.34 + i * 0.14} x={60 + i * 196} y={1230} mode="pop">
          <div style={{ width: 180, textAlign: "center" }}>
            <div style={{ display: "inline-flex", width: 72, height: 72, borderRadius: 14, background: c, border: `4px solid ${M.ink}`, color: "#fff", ...K, fontSize: 34, alignItems: "center", justifyContent: "center", boxShadow: `4px 4px 0 ${M.ink}` }}>{n}</div>
            <div style={{ ...K, fontSize: 26, marginTop: 6 }}>{t}</div>
          </div>
        </In>
      ))}
    </AbsoluteFill>
  );
};

// ════════ ① 金利が上がる仕組み（10.24–21.42）：日銀の札から下へ、線＋点でつながっていく ════════
const S1: React.FC = () => (
  <AbsoluteFill>
    <Paper2 />
    <SectionPill at={10.24} no="01" icon="％">金利が上がる仕組み</SectionPill>
    <In at={10.6} x={0} y={400} center mode="ghost"><span style={{ ...K, fontSize: 42, color: M.sub }}>変動金利は どうやって上がる？</span></In>
    <In at={12.16} x={140} y={480} mode="pop">
      <Hero w={800}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "18px 26px" }}>
          <GenSlot name="rl_central_bank" size={170} />
          <div><div style={{ ...B, fontSize: 28, color: M.sub }}>日銀が</div><div style={{ ...K, fontSize: 54 }}><R>政策金利</R>を上げる</div></div>
          <span style={{ marginLeft: "auto" }}><Icon n="up" s={80} c={M.red} bg="#FFE3E0" /></span>
        </div>
      </Hero>
    </In>
    <Chain at={13.94} x={540} y0={700} y1={760}><Pill2 c={M.blue} icon="🏦">銀行の短期プライムレートなど ↑</Pill2></Chain>
    <Chain at={16.58} x={540} y0={850} y1={910}><Pill2 c={M.orange} icon="🏠">住宅ローンの基準金利 ↑</Pill2></Chain>
    <Chain at={18.18} x={540} y0={1000} y1={1060}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 14 }}>
        <Pill2 c="#fff" size={34}>基準金利</Pill2><span style={{ ...K, fontSize: 52 }}>−</span><Pill2 c="#fff" size={34}>優遇幅</Pill2>
      </span>
    </Chain>
    <Chain at={19.94} x={540} y0={1150} y1={1190}><Pill2 c={M.yellow} size={42}><span style={{ color: M.ink }}>＝ 自分に適用される金利</span></Pill2></Chain>
    <HandCircle at={20.32} x={540} y={1245} r={290} c={M.green} w={7} until={21.2} />
  </AbsoluteFill>
);

// ════════ ② 5年ルール・125％ルール（21.42–34.58） ════════
const S2: React.FC = () => {
  const f = useCurrentFrame();
  const g = interpolate(f, [F(27.56), F(29.3)], [0, 1], out);
  const level = f < F(29.3) ? 0.8 + 0.2 * g : 1 - 0.015 * Math.sin(Math.min(1, (f - F(29.3)) / 8) * Math.PI);
  return (
    <AbsoluteFill>
      <Paper2 />
      <SectionPill at={21.42} no="02" icon="🗓">5年ルール・125%ルール</SectionPill>
      <In at={21.92} x={0} y={400} center mode="ghost"><span style={{ ...K, fontSize: 46 }}>金利が上がっても 返済額は<R>すぐ上がらない</R></span></In>
      <In at={24.72} x={90} y={490} mode="pop">
        <Hero>
          <HeroBar title="返済額のカレンダー" icon="🗓" />
          <div style={{ display: "flex", gap: 10, padding: "20px 20px 14px" }}>
            {Array.from({ length: 6 }).map((_, i) => {
              const at = 24.9 + i * 0.12 + (i === 5 ? 2.66 : 0);
              const on = f >= F(at);
              return (
                <div key={i} style={{ flex: 1, height: 140, borderRadius: 14, border: `4px solid ${M.ink}`, background: !on ? "#F0F1F6" : i === 5 ? "#FFE3E0" : "#EAF1FF", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: on ? `scale(${pop(f, F(at))})` : undefined }}>
                  <div style={{ ...K, fontSize: 30, color: on ? M.ink : M.gray }}>{i + 1}年目</div>
                  {on ? <div style={{ ...K, fontSize: 26, color: i === 5 ? M.red : M.blue }}>{i === 5 ? "見直し" : "15万"}</div> : null}
                </div>
              );
            })}
          </div>
          {/* 6年目の返済額メーター：1.25倍で止まる */}
          <div style={{ padding: "6px 26px 26px" }}>
            <div style={{ ...B, fontSize: 24, color: M.sub, marginBottom: 8 }}>見直し後の返済額</div>
            <div style={{ position: "relative", height: 70, borderRadius: 12, border: `4px solid ${M.ink}`, background: "#F0F1F6" }}>
              {f >= F(27.56) ? <div style={{ position: "absolute", left: 4, top: 4, bottom: 4, width: `calc(${level * 100}% - 8px)`, borderRadius: 8, background: `repeating-linear-gradient(-45deg, ${M.red} 0 16px, #F06A62 16px 32px)` }} /> : null}
              <div style={{ position: "absolute", left: "80%", top: -14, bottom: -14, borderLeft: `4px dashed ${M.ink}` }} />
              <div style={{ position: "absolute", right: -6, top: -18, bottom: -18, borderLeft: `8px solid ${M.ink}` }} />
            </div>
            <div style={{ position: "relative", height: 34, ...B, fontSize: 22 }}><span style={{ position: "absolute", left: "80%", transform: "translateX(-50%)" }}>今の額</span><span style={{ position: "absolute", right: -6, ...K, color: M.red }}>上限</span></div>
          </div>
        </Hero>
      </In>
      {f >= F(26.14) ? <div style={{ position: "absolute", left: 104, top: 556, width: 5 * 141 + 4, height: 164, border: `6px dashed ${M.green}`, borderRadius: 18, opacity: interpolate(f - F(26.14), [0, 6], [0, 1], clamp) }} /> : null}
      <In at={26.4} x={110} y={1000} mode="pop"><Pill2 c={M.green} icon="🔒">5年ルール：5年間 据え置き</Pill2></In>
      <In at={29.24} x={110} y={1090} mode="pop"><Pill2 c={M.red} icon="⤒">125%ルール：1.25倍まで</Pill2></In>
      <HandCircle at={29.3} x={940} y={940} r={90} until={31.8} />
      {/* でも：灰色に沈めて一言 */}
      <Spotlight at={32.02} until={34.6} x={540} y={760} r={460} />
      <In at={32.02} x={0} y={640} center mode="pop"><Pill2 c="#fff" size={48}>変わらない ＝ <R>安心</R>？</Pill2></In>
      <Stamp at={33.6} x={300} y={760} text="安心ではない" size={74} />
      <Note at={30.32} until={34.58}>※5年ルール・125％ルールは、金融機関や返済方式によって適用されない場合があります</Note>
    </AbsoluteFill>
  );
};

// ════════ ③ 返済額の中身（34.58–53.86）：同じ15万円の中で、元金と利息が入れ替わる ════════
const T = 149595;
const S3: React.FC = () => {
  const f = useCurrentFrame();
  const m = interpolate(f, [F(43.4), F(45.0)], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const prin = 128761 + (87095 - 128761) * m;
  const W = 820, pw = (prin / T) * W;
  const flip = interpolate(f, [F(43.38), F(43.38) + 6], [0, 1], clamp);
  const box = interpolate(f, [F(50.0), F(53.4)], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  return (
    <AbsoluteFill>
      <Paper2 />
      <SectionPill at={34.58} no="03" icon="¥">返済額の中身</SectionPill>
      <In at={35.04} x={90} y={410} mode="pop">
        <span style={{ display: "inline-flex", gap: 12 }}>
          <Pill2 c="#fff" size={32}>借入 5,000万円</Pill2><Pill2 c="#fff" size={32}>30年</Pill2>
          <span style={{ display: "inline-block", transform: `rotateY(${flip < 0.5 ? flip * 180 : (1 - flip) * 180}deg)` }}><Pill2 c={flip >= 0.5 ? M.red : "#fff"} size={32}>金利 {flip >= 0.5 ? "1.5%" : "0.5%"}</Pill2></span>
        </span>
      </In>
      {flip >= 0.5 ? <HandCircle at={43.6} x={850} y={445} r={95} until={45.4} /> : null}
      <In at={38.22} x={90} y={520} mode="pop">
        <Hero>
          <HeroBar title="毎月の返済 約15万円の中身" icon="¥" />
          <div style={{ padding: "26px 34px 30px" }}>
            <div style={{ position: "relative", width: W, height: 170, borderRadius: 16, border: `5px solid ${M.ink}`, overflow: "hidden" }}>
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: pw, background: M.blue, color: "#fff", display: "flex", flexDirection: "column", justifyContent: "center", paddingLeft: 26, boxSizing: "border-box" }}>
                <div style={{ ...B, fontSize: 26 }}>元金に回る</div>
                <div style={{ ...K, fontSize: 64 }}>{yen(f < F(40.9) ? 0 : f < F(43.4) ? cnt(f, 40.9, 128761, 0.8) : prin)}<span style={{ fontSize: 30 }}>円</span></div>
              </div>
              <div style={{ position: "absolute", left: pw, right: 0, top: 0, bottom: 0, background: M.red, borderLeft: `5px solid ${M.ink}`, color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ ...B, fontSize: 24 }}>利息</div><div style={{ ...K, fontSize: 34 }}>{yen(T - prin)}</div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14, ...B, fontSize: 26 }}><span>返済額は同じ</span><span>{f >= F(45.08) ? <Tag c={M.green} dark size={24}>約15万円のまま</Tag> : null}</span></div>
          </div>
        </Hero>
      </In>
      <HandCircle at={47.2} x={300} y={720} r={170} until={48.8} />
      <Chain at={47.48} x={300} y0={890} y1={940}><span style={{ marginLeft: -480 }}><Pill2 c={M.red}>元金に回るお金 約4.2万円 減</Pill2></span></Chain>
      {/* 先送り：負担の箱が「今」から「後ろ」へ運ばれる */}
      {f >= F(48.82) ? (
        <>
          <Link at={48.9} pts={[[130, 1230], [930, 1230]]} w={6} dur={0.4} arrow />
          <div style={{ position: "absolute", left: 100, top: 1248, ...K, fontSize: 30 }}>今</div>
          <div style={{ position: "absolute", left: 870, top: 1248, ...K, fontSize: 30, color: M.red }}>後ろ</div>
          <div style={{ position: "absolute", left: 130 + box * 640, top: 1110 }}><Pill2 c={M.red}>負担</Pill2></div>
        </>
      ) : null}
      <In at={52.08} x={0} y={1040} center mode="pop"><Pill2 c={M.yellow} size={34}><span style={{ color: M.ink }}>後ろに先送りしてるだけ</span></Pill2></In>
    </AbsoluteFill>
  );
};

// ════════ ④ 5年後どうなる？（53.86–75.70）：青い背景・チェックリストのように1つずつ ════════
const ROWS4: [number, IconName, string, (f: number) => React.ReactNode][] = [
  [56.92, "yen", "5年の利息", (f) => <>{yen(cnt(f, 57.98, 115))}万 → {f >= F(59.34) ? <span style={{ ...SER, fontSize: 60, color: M.red }}>{yen(cnt(f, 59.34, 355, 0.7, 115))}万円</span> : null}</>],
  [60.68, "house", "ローン残高", (f) => f >= F(61.96) ? <><span style={{ ...SER, fontSize: 60, color: M.red }}>+{yen(cnt(f, 61.96, 240))}万円</span> 多く残る</> : null],
  [63.88, "up", "毎月の返済", (f) => <>15万 → {f >= F(66.44) ? <span style={{ ...SER, fontSize: 60, color: M.red }}>{cnt(f, 66.44, 17.8, 0.6, 15).toFixed(1)}万円</span> : null}</>],
];
const S4: React.FC = () => {
  const f = useCurrentFrame();
  const away = interpolate(f, [F(69.4), F(69.4) + 8], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Paper2 color={BLUE_BG} grid="rgba(255,255,255,0.16)" shape="rgba(255,255,255,0.35)" margin="rgba(255,255,255,0.3)" />
      <MoneyRain at={72.4} />
      <SectionPill at={53.86} no="04" icon="⏳">5年後どうなる？</SectionPill>
      <In at={54.3} x={0} y={400} center mode="ghost"><span style={{ ...K, fontSize: 40, color: "#fff" }}>金利 0.5% → 1.5% のまま、先送りした結果</span></In>
      <div style={{ opacity: 1 - away, transform: `translateY(${-30 * away}px)` }}>
        {ROWS4.map(([at, ic, label, val], i) => (
          <In key={label} at={at} x={90} y={490 + i * 175} mode="pop">
            <div style={{ width: 900, height: 150, background: "#fff", border: `5px solid ${M.ink}`, borderRadius: 18, boxShadow: `7px 7px 0 ${M.ink}`, display: "flex", alignItems: "center", gap: 18, padding: "0 24px", boxSizing: "border-box" }}>
              <span style={{ width: 58, height: 58, borderRadius: 12, border: `5px solid ${M.ink}`, display: "flex", alignItems: "center", justifyContent: "center", ...K, fontSize: 44, color: M.red, flex: "none" }}>{f >= F(at + 1.1) ? "✓" : ""}</span>
              <Icon n={ic} s={64} c={M.red} />
              <span style={{ ...K, fontSize: 36, width: 210 }}>{label}</span>
              <span style={{ ...K, fontSize: 34, marginLeft: "auto", whiteSpace: "nowrap" }}>{val(f)}</span>
            </div>
          </In>
        ))}
        <In at={60.2} x={760} y={470} mode="pop"><Tag c={M.yellow} size={28}>約3倍</Tag></In>
        <Stamp at={67.98} until={69.4} x={500} y={1050} text="月+2.9万円" size={58} c="#FFD84D" />
        <In at={65.0} until={69.4} x={100} y={1030} mode="pop"><GenSlot name="rl_bill_shock" size={250} /></In>
      </div>
      {/* 山場：放射線＋大きな数字 */}
      <In at={69.6} x={0} y={470} center mode="ghost"><span style={{ ...K, fontSize: 46, color: "#fff" }}>金利1.5%がそのまま続けば</span></In>
      <In at={71.84} x={0} y={550} center mode="pop"><Tag c={M.yellow} size={36}>最終的に</Tag></In>
      <In at={72.2} x={360} y={630} mode="pop"><GenSlot name="rl_money_mountain" size={360} /></In>
      {f >= F(72.68) ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 990, textAlign: "center", transform: `scale(${pop(f, F(72.68))}) ${shake(f, 74.2, 10)}` }}>
          <span style={{ display: "inline-block", background: "#fff", border: `6px solid ${M.ink}`, borderRadius: 24, boxShadow: `10px 10px 0 ${M.ink}`, padding: "6px 40px" }}>
            <span style={{ ...K, fontSize: 40 }}>支払いが </span><span style={{ ...SER, fontSize: 150, color: M.red, lineHeight: 1.05 }}>+{yen(cnt(f, 72.68, 861, 1.4))}</span><span style={{ ...K, fontSize: 56 }}>万円</span>
          </span>
        </div>
      ) : null}
      <HandCircle at={74.2} x={540} y={1080} r={380} c="#FFD84D" />
      <Note at={56.92} light>※5,000万円・30年・金利0.5％で借りた直後に1.5％へ上がり、その後も1.5％が続く前提の試算。実際の返済額の見直し時期は、金融機関・契約内容によって異なります</Note>
    </AbsoluteFill>
  );
};

// ════════ ⑤ 未払利息（75.70–82.90）：コップ（返済額）から水（利息）があふれる ════════
const S5: React.FC = () => {
  const f = useCurrentFrame();
  const lv = interpolate(f, [F(76.4), F(79.3)], [0.35, 1.0], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const overflow = f >= F(79.3);
  const gx = 360, gy = 470, gw = 360, gh = 560;
  return (
    <AbsoluteFill>
      <Paper2 />
      <SectionPill at={75.7} no="05" icon="⚠">未払利息</SectionPill>
      <In at={76.0} x={0} y={390} center mode="ghost"><span style={{ ...K, fontSize: 40 }}>金利が<R>大きく</R>上がると…</span></In>
      {f >= F(76.0) ? (
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, opacity: interpolate(f - F(76.0), [0, 6], [0, 1], clamp) }}>
          <defs><clipPath id="glass2"><path d={`M${gx} ${gy} L${gx + gw} ${gy} L${gx + gw - 40} ${gy + gh} L${gx + 40} ${gy + gh} Z`} /></clipPath></defs>
          <rect x={gx - 10} y={gy + gh * (1 - lv)} width={gw + 20} height={gh * lv + 10} fill="#F06A62" clipPath="url(#glass2)" />
          <path d={`M${gx} ${gy + gh * (1 - lv)} q ${gw / 4} ${Math.sin(f / 4) * 12} ${gw / 2} 0 t ${gw / 2} 0`} fill="none" stroke="#fff" strokeWidth={5} opacity={0.6} clipPath="url(#glass2)" />
          <path d={`M${gx} ${gy} L${gx + 40} ${gy + gh} L${gx + gw - 40} ${gy + gh} L${gx + gw} ${gy}`} fill="none" stroke={M.ink} strokeWidth={9} strokeLinejoin="round" />
          {overflow ? <path d={`M${gx + gw} ${gy} q 30 10 34 ${60 + Math.min(220, (f - F(79.3)) * 12)}`} fill="none" stroke="#F06A62" strokeWidth={16} strokeLinecap="round" /> : null}
          {overflow ? Array.from({ length: 5 }).map((_, i) => { const d = (f - F(79.3) - i * 5) % 30; return d > 0 ? <circle key={i} cx={gx + gw + 36} cy={gy + 80 + d * 18} r={10} fill="#F06A62" opacity={1 - d / 30} /> : null; }) : null}
        </svg>
      ) : null}
      <In at={76.2} x={60} y={500} mode="pop"><Pill2 c="#fff" size={30}>コップ＝<span style={{ color: M.blue }}>返済額</span></Pill2></In>
      <In at={77.86} x={60} y={860} mode="pop"><Pill2 c="#fff" size={30}>水＝<span style={{ color: M.red }}>利息</span></Pill2></In>
      <HandCircle at={79.32} x={gx + gw} y={gy + 20} r={110} until={81.6} />
      <In at={79.32} x={780} y={420} mode="pop"><Pill2 c={M.red} size={28}>払いきれない</Pill2></In>
      <Chain at={80.3} x={gx + gw + 36} y0={gy + 300} y1={gy + 560}><span style={{ marginLeft: 330 }}><Pill2 c="#fff" size={32} icon="↪">次へ繰り越し</Pill2></span></Chain>
      <Spotlight at={81.74} x={540} y={820} r={480} />
      <Stamp at={81.98} x={240} y={760} text="これが 未払利息" size={66} />
    </AbsoluteFill>
  );
};

// ════════ ⑥ まとめ（82.90–94.78）：色の番号の3つ＋最後に確認 ════════
const SUM: [number, string, React.ReactNode][] = [
  [83.46, M.blue, <>返済額は<span style={{ color: M.blue }}>すぐ上がらない</span>ことがある</>],
  [86.56, M.red, <>でも負担は<R>なくなっていない</R></>],
  [88.62, M.orange, <><R>後ろに先送り</R>されているだけ</>],
];
const S6: React.FC = () => {
  const f = useCurrentFrame();
  const dim = interpolate(f, [F(90.26), F(90.26) + 6], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Paper2 />
      <SectionPill at={83.2} icon="✓">まとめ</SectionPill>
      {SUM.map(([at, c, t], i) => (
        <In key={i} at={at} x={90} y={420 + i * 150} mode="pop" style={{ opacity: 1 - 0.5 * dim }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <span style={{ width: 84, height: 84, borderRadius: 16, background: c, border: `5px solid ${M.ink}`, color: "#fff", ...K, fontSize: 38, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `5px 5px 0 ${M.ink}`, flex: "none" }}>0{i + 1}</span>
            <Sticker pad="16px 22px" style={{ width: 790, textAlign: "center" }}><span style={{ ...K, fontSize: 38 }}>{t}</span></Sticker>
          </div>
        </In>
      ))}
      <In at={90.26} x={90} y={900} mode="pop">
        <Hero bg={M.yellow}>
          <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "22px 26px" }}>
            <span style={{ width: 80, height: 80, borderRadius: 16, border: `6px solid ${M.ink}`, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", ...K, fontSize: 64, color: M.green, flex: "none", transform: f >= F(93.94) ? `scale(${pop(f, F(93.94))})` : undefined }}>{f >= F(93.94) ? "✓" : ""}</span>
            <span style={{ ...K, fontSize: 44, lineHeight: 1.3 }}>自分の住宅ローンの<br /><R>契約内容</R>を必ず確認</span>
            <span style={{ marginLeft: "auto" }}><GenSlot name="rl_contract_magnifier" size={150} /></span>
          </div>
        </Hero>
      </In>
      <HandCircle at={93.94} x={180} y={1000} r={80} c={M.green} />
    </AbsoluteFill>
  );
};

// ════════ 締め（94.78–99.08） ════════
const Close: React.FC = () => (
  <AbsoluteFill>
    <Paper2 />
    <SectionPill at={94.78} icon="▶">次の動画</SectionPill>
    <In at={95.26} x={0} y={420} center mode="ghost"><span style={{ ...K, fontSize: 50 }}>金利が上がっている今</span></In>
    <In at={96.38} x={0} y={510} center mode="pop"><span style={{ ...K, fontSize: 84, textShadow: `0 7px 0 ${M.yellow}` }}>どう<R>対策</R>する？</span></In>
    <In at={96.6} x={330} y={640} mode="pop"><GenSlot name="rl_couple_check" size={420} /></In>
    <In at={97.8} x={90} y={1110} mode="pop"><Pill2 c={M.red} size={42} icon="▶">次の動画で解説！</Pill2></In>
  </AbsoluteFill>
);

// 右下の大きな太一：ずっと口パクで話す（声の大きさで口が開く）＋ときどきまばたき＋場面ごとに小さな反応マーク
const REACT: [number, number, string][] = [[3.4, 5.6, "💦"], [18.18, 19.6, "💡"], [32.02, 34.4, "？"], [43.38, 44.8, "！"], [59.34, 61.0, "！"], [72.68, 75.0, "💦"], [81.74, 82.9, "💦"], [93.94, 94.8, "✨"]];
const Chara: React.FC = () => {
  const f = useCurrentFrame();
  const lv = RL_MOUTH.charCodeAt(Math.min(RL_MOUTH.length - 1, f)) - 48;
  const blink = f % 96 > 92 && lv === 0;
  const name = blink ? "taichi_blink" : lv >= 2 ? (Math.floor(f / 3) % 4 ? "taichi_talk_open" : "taichi_talk_mid") : lv === 1 ? "taichi_talk_mid" : "taichi_talk_closed";
  const bob = Math.sin(f / 10) * 5 + (lv >= 2 ? -3 : 0);
  const re = REACT.find(([a, b]) => f >= F(a) && f < F(b));
  return (
    <div style={{ position: "absolute", left: 800, top: 1095 + bob, width: 250, height: 250 }}>
      <GenSlot name={name} size={250} />
      {re ? <div style={{ position: "absolute", left: 170, top: -10, fontSize: 60, transform: `scale(${pop(f, F(re[0]))}) rotate(${Math.sin(f / 4) * 8}deg)` }}>{re[2]}</div> : null}
    </div>
  );
};

const PANELS: Panel[] = [
  { id: "hook", col: 0, row: 0 }, { id: "s1", col: 1, row: 0 }, { id: "s2", col: 2, row: 0 }, { id: "s3", col: 3, row: 0 },
  { id: "s4", col: 3, row: 1 }, { id: "s5", col: 2, row: 1 }, { id: "s6", col: 1, row: 1 }, { id: "close", col: 0, row: 1 },
];
const LINKS: [string, string][] = PANELS.slice(1).map((p, i) => [PANELS[i].id, p.id]);
const STOPS: Stop[] = [
  { id: "hook", trans: 0 }, { id: "s1", trans: 10.0, kind: "kick" }, { id: "s2", trans: 21.2, kind: "kick" }, { id: "s3", trans: 34.36, kind: "kick" },
  { id: "s4", trans: 53.64, kind: "kick" }, { id: "s5", trans: 75.48, kind: "kick" },
  { id: "__map", trans: 82.0, scale: 0.2, ids: ["s1", "s2", "s3", "s4", "s5", "s6"] }, { id: "s6", trans: 83.0, kind: "kick" }, { id: "close", trans: 94.56, kind: "fast" },
];
const PAGES: Record<string, React.FC> = { hook: Hook, s1: S1, s2: S2, s3: S3, s4: S4, s5: S5, s6: S6, close: Close };

const s = (file: string, t: number, volume = 0.22) => ({ file: `user/${file}`, at: F(t), volume });
const CUES = [
  // 0秒には鳴らさない
  s("u02s", 0.35, 0.18), s("u02s", 1.62, 0.22), s("u04", 3.6, 0.32), s("u02s", 4.54, 0.16), ...NUMS.map((_, i) => s("u02s", 6.34 + i * 0.14, 0.14)),
  ...STOPS.slice(1).map((st) => s("u03s", st.trans, 0.26)),
  s("u02s", 12.16, 0.2), s("u02s", 13.94, 0.2), s("u02s", 16.58, 0.2), s("u02s", 18.18, 0.18), s("u05", 19.94, 0.26),
  s("u02s", 24.72, 0.18), ...[0, 1, 2, 3, 4].map((i) => s("u02s", 24.9 + i * 0.12, 0.12)), s("u05s", 26.4, 0.22), s("u06", 27.56, 0.24), s("u05s", 29.24, 0.24), s("u04", 29.3, 0.26), s("u05", 32.02, 0.24), s("u04", 33.6, 0.3),
  s("u02s", 35.04, 0.16), s("u05s", 38.22, 0.22), s("u05s", 40.9, 0.2), s("u03s", 43.38, 0.24), s("u05", 47.48, 0.24), s("u03", 50.0, 0.2), s("u02s", 52.08, 0.18),
  ...ROWS4.map(([t]) => s("u02s", t, 0.2)), ...ROWS4.map(([t]) => s("u05s", t + 1.1, 0.18)), s("u04", 59.34, 0.28), s("u04", 67.98, 0.3), s("u03s", 71.84, 0.24), s("u06", 72.68, 0.26), s("u09", 74.2, 0.32),
  s("u02s", 76.2, 0.18), s("u02s", 77.86, 0.18), s("u04", 79.32, 0.28), s("u02s", 80.3, 0.18), s("u05", 81.74, 0.22), s("u04", 81.98, 0.3),
  ...SUM.map(([t]) => s("u02s", t, 0.2)), s("u05", 90.26, 0.26), s("u10", 93.94, 0.28),
  s("u02s", 96.38, 0.2), s("u07", 97.8, 0.26),
];

// 字幕（話した言葉どおり・*黄色マーカー* !赤!）
const SUBS: [number, string][] = [
  [0, "住宅ローン金利が上がっても"], [1.62, "*返済額*が変わっていない人"], [3.08, "これ!マジで危険!です"], [4.24, "今回は 金利が上がると"], [5.68, "住宅ローンに*何が起こるのか*"], [7.38, "分かりやすく解説します"], [8.52, "対策は次の動画で話します"],
  [10.24, "まず 変動金利が"], [11.24, "どうやって上がるのか"], [12.16, "日銀が*政策金利*を上げる"], [13.94, "すると銀行の*短期プライムレート*などが上がって"], [16.58, "住宅ローンの*基準金利*も上がります"], [18.18, "そこから*優遇幅*を引いたものが"], [19.94, "自分に*適用される金利*です"],
  [21.42, "ただ 金利が上がっても"], [22.94, "返済額は!すぐ上がるとは限りません!"], [24.72, "*5年ルール*で返済額は5年間据え置き"], [27.26, "さらに5年後に見直すときも"], [28.72, "それまでの*1.25倍*まで"], [30.32, "これが*125%ルール*です"], [32.02, "でも返済額が変わらないから"], [33.6, "!安心ではありません!"],
  [34.58, "例えば*5,000万円*を30年"], [36.62, "金利*0.5%*で借りると"], [38.22, "毎月の返済は約15万円"], [40.22, "そのうち*元金*に回るのは"], [41.64, "約12万9,000円"], [42.96, "でも金利*1.5%*になると"], [45.08, "同じ約15万円でも"], [46.38, "元金に回るのは"], [47.2, "!約8万7,000円!まで減ります"], [48.82, "つまり 返済額が変わっていないだけで"], [51.04, "金利上昇の負担を"], [52.08, "!後ろに先送り!しているだけなんです"],
  [53.86, "では その負担を先送りした結果"], [55.96, "*5年後*どうなるのか"], [56.92, "5年で払う利息は"], [57.98, "約115万円から!約355万円!"], [60.68, "さらにローン残高も"], [61.96, "!約240万円!多く残ります"], [63.88, "そして5年後の返済額は"], [65.44, "約15万円から約17万8,000円に"], [67.98, "月!約2万9,000円!アップ"], [69.38, "金利1.5%がそのまま続けば"], [71.84, "最終的には"], [72.68, "!約861万円!支払いが増える計算です"],
  [75.7, "さらに金利が上がると"], [77.12, "返済額より*利息*の方が多くなって"], [79.32, "払いきれなかった利息が"], [80.54, "!繰り越される!こともあります"], [81.74, "これが*未払利息*"],
  [82.9, "まとめると 金利が上がっても"], [84.56, "返済額はすぐ上がらないことがあります"], [86.56, "でも 負担がなくなったわけではなくて"], [88.62, "!後ろに先送り!されているだけ"], [90.26, "だからまずは 自分の住宅ローンが"], [92.0, "どのような*契約内容*なのか"], [93.66, "必ず確認してください"],
  [94.78, "では 金利が上がっている今"], [96.38, "どう対策すればいいのか"], [97.8, "*次の動画*で解説します"],
];
// 右上の進み具合（小さく）。まとめからは出さない
const STEP_S = 0.6;
const StepperWrap: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [F(10.0), F(10.0) + 6], [0, 1], clamp) * interpolate(f, [F(82.6), F(82.6) + 6], [1, 0], clamp);
  return o > 0 ? <div style={{ position: "absolute", left: 0, top: 0, transform: `scale(${STEP_S}) translateY(${(1 - o) * -60}px)`, transformOrigin: "0 0", opacity: o }}>{children}</div> : null;
};
// インスタのボタン（右）・説明文（下）・名前（上）にかからないよう、図は少し小さく（債券リールと同じ）
const SAFE = 0.9, SAFE_X = 540 - 540 * SAFE, SAFE_Y = 300 - 280 * SAFE;
export const RATELOAN_FRAMES = F(99.4);
export const RateLoanReel: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: M.paper, fontFamily: FONT }}>
    <Audio src={staticFile("rl-narration.wav")} />
    <SfxTrack cues={CUES} />
    <AbsoluteFill style={{ background: M.paper, backgroundImage: `repeating-linear-gradient(transparent 0 62px, ${M.grid} 62px 64px)` }} />
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `translate(${SAFE_X}px, ${SAFE_Y}px) scale(${SAFE})`, transformOrigin: "0 0" }}>
      <Board streaks panels={PANELS} stops={STOPS} links={LINKS} paper={{ background: M.paper }}>
        {(id) => { const C = PAGES[id]; return <AbsoluteFill><C /></AbsoluteFill>; }}
      </Board>
    </div>
    <StepperWrap><Stepper labels={["仕組み", "5年ルール", "中身", "5年後", "未払利息"]} steps={[10.24, 21.42, 34.58, 53.86, 75.7]} x={600 / STEP_S} y={196 / STEP_S} color={M.red} /></StepperWrap>
    <div style={{ position: "absolute", left: 0, right: 0, top: 1300, bottom: 0, background: `linear-gradient(${M.paper}00, ${M.paper} 50px)` }} />
    <Chara />
    <Captions subs={SUBS} end={99.0} maxW={740} size={0.78} kcol={{ g: M.red, r: M.red }} top={1352} swap />
  </AbsoluteFill>
);
