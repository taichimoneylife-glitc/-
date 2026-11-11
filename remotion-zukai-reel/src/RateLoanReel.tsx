import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame } from "remotion";
import { FONT } from "./components/font";
import { SfxTrack } from "./components/sfx";
import { GenSlot } from "./MileLifePlan";
import { Board, type Panel, type Stop } from "./components/board";
import { Spot } from "./components/cam";
import { F, clamp, out, K, B, SER, M, pop, yen, cnt, R, GridBg, In, Sticker, DarkPill, Tag, Icon, type IconName, Link, Ripple, Stamp, shake } from "./components/marke";

// ════════════════════════════════════════════════════════════════════
//  住宅ローン①「金利が上がると何が起こる？」完全図解 v2（マーケ博士の見た目＋自分のアレンジ）
//  音声＝public/rl-narration.wav（99.1秒・1.1倍）。字幕は出さず、話の要点を札（ステッカー）で見せる。
//  見た目：方眼の紙・白地＋黒い太枠＋ずらし影の札・札は斜めに投げ込まれる・線が伸びてつながる・
//         章ごとにページ送り（縮む→流れる→戻る）・山場の章は背景が青・下の真ん中に太一（ポーズが変わる）
//  アレンジ：冒頭で5つの章を先に見せる／返済額の中身が「棒の中で入れ替わる」／先送り＝負担の箱が未来へ運ばれる／
//           未払利息＝コップから水があふれて繰り越しの箱にたまる
//  数字（計算で確認済み）：5,000万・30年・0.5%＝149,595円/月（元金128,761・利息20,833）
//   1.5%で同じ返済なら元金87,095・利息62,500／5年利息115.4万→355.3万／残高+239.8万／
//   5年後の返済178,279円（+28,684円・1.25倍上限186,993円の内）／総支払+860.5万
// ════════════════════════════════════════════════════════════════════
const BLUE_BG = "#2D62E0";

// 章の見出し：アイコン＋小見出し＋大見出し＋黒い札
const Head: React.FC<{ at: number; icon: IconName; small: string; pill: string; light?: boolean; children: React.ReactNode }> = ({ at, icon, small, pill, light, children }) => {
  const f = useCurrentFrame();
  const col = light ? "#fff" : M.ink;
  return (
    <>
      <In at={at} x={0} y={196} center mode="ghost">
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <span style={{ transform: `rotate(${interpolate(f - F(at), [0, 10], [-200, 0], { ...clamp, easing: Easing.out(Easing.back(1.6)) })}deg)`, display: "inline-flex" }}><Icon n={icon} s={84} c={M.red} bg="#fff" /></span>
          <div><div style={{ ...B, fontSize: 30, color: col, opacity: 0.85 }}>{small}</div><div style={{ ...K, fontSize: 64, color: col, lineHeight: 1.1 }}>{children}</div></div>
        </div>
      </In>
      <In at={at + 0.25} x={0} y={326} center mode="pop"><DarkPill>{pill}</DarkPill></In>
    </>
  );
};
const Note: React.FC<{ at: number; until?: number; children: React.ReactNode; light?: boolean }> = ({ at, until = 999, children, light }) => {
  const f = useCurrentFrame();
  if (f < F(at) || f > F(until)) return null;
  return <div style={{ position: "absolute", left: 60, right: 60, top: 1384, ...B, fontSize: 20, lineHeight: 1.4, color: light ? "rgba(255,255,255,0.8)" : M.sub, opacity: interpolate(f - F(at), [0, 6], [0, 1], clamp) }}>{children}</div>;
};

// ════════ 冒頭（0–10.24） ════════
const PREVIEW: [string, IconName][] = [["仕組み", "pct"], ["5年ルール", "cal"], ["中身", "yen"], ["5年後", "clock"], ["未払利息", "warn"]];
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const danger = interpolate(f, [F(3.08), F(3.08) + 6], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ transform: shake(f, 3.6, 16) }}>
      <GridBg />
      <AbsoluteFill style={{ background: `rgba(232,69,60,${0.1 * danger})` }} />
      <In at={0.05} x={0} y={210} center mode="ghost"><span style={{ ...K, fontSize: 54, color: M.ink }}>住宅ローン<R>金利</R>が上がっても</span></In>
      <In at={1.62} x={0} y={300} center from="r" rot={-10}><Sticker pad="10px 34px"><span style={{ ...K, fontSize: 70 }}><R>返済額</R>が変わってない人</span></Sticker></In>
      {/* 家と毎月の返済（変わらない） */}
      <In at={0.3} until={3.0} x={260} y={460} mode="pop"><GenSlot name="rl_couple_relax" size={560} /></In>
      <In at={3.08} x={260} y={460} mode="pop"><GenSlot name="rl_house_cloud" size={560} /></In>
      <In at={2.04} x={90} y={930} from="l" rot={8}><Sticker strip={M.blue} pad="10px 22px"><div style={{ ...B, fontSize: 24, color: M.sub }}>毎月の返済</div><div style={{ ...K, fontSize: 46 }}>15万円 → 15万円</div></Sticker></In>
      <In at={2.4} until={3.0} x={600} y={960} mode="pop"><Tag c={M.green} dark>変わらない！</Tag></In>
      <Stamp at={3.6} x={560} y={930} text="マジで危険" size={64} />
      <Ripple x={760} y={980} at={3.6} />
      {/* この動画で分かること：5つの章を先に見せる */}
      <In at={4.54} x={0} y={1090} center mode="pop"><DarkPill icon="❓">金利が上がると何が起こる？</DarkPill></In>
      {PREVIEW.map(([t, ic], i) => (
        <In key={t} at={6.34 + i * 0.16} x={55 + i * 196} y={1180} from="d" rot={i % 2 ? 10 : -10}>
          <Sticker pad="8px 6px" shadow={5} style={{ width: 182, textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center" }}><Icon n={ic} s={50} c={M.red} /></div>
            <div style={{ ...K, fontSize: 25, marginTop: 4, whiteSpace: "nowrap" }}>{t}</div>
          </Sticker>
        </In>
      ))}
      <In at={8.52} x={0} y={1330} center mode="pop"><Tag c={M.yellow}>対策は 次の動画で</Tag></In>
    </AbsoluteFill>
  );
};

// ════════ ① 金利が上がる仕組み（10.24–21.42）：左の名前と右の金利を線でつなぐ表 ════════
const CHAIN: [number, IconName, string, string, string][] = [
  [12.16, "bank", "日銀", "政策金利", M.purple],
  [13.94, "bank", "銀行", "短期プライムレートなど", M.blue],
  [16.58, "house", "住宅ローン", "基準金利", M.orange],
];
const S1: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <GridBg />
      <Head at={10.24} icon="pct" small="変動金利" pill="どうやって上がる？">金利が上がる<R>仕組み</R></Head>
      {/* 左端の縦の矢印：上から順に伝わる */}
      <Link at={12.3} pts={[[70, 470], [70, 900]]} c={M.red} w={7} dur={5.4} arrow />
      {CHAIN.map(([at, ic, name, rate, col], i) => {
        const y = 450 + i * 165;
        return (
          <React.Fragment key={name}>
            <In at={at} x={110} y={y} from="l" rot={-12}>
              <Sticker strip={col} pad="12px 18px" style={{ width: 360, display: "flex", alignItems: "center", gap: 14 }}><Icon n={ic} s={66} c={col} /><span style={{ ...K, fontSize: 40 }}>{name}</span></Sticker>
            </In>
            <Link at={at + 0.25} pts={[[478, y + 50], [560, y + 50]]} dur={0.2} />
            <In at={at + 0.4} x={560} y={y} from="r" rot={12}>
              <Sticker pad="12px 18px" style={{ width: 420, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <span style={{ ...K, fontSize: rate.length > 6 ? 27 : 40, whiteSpace: "nowrap" }}>{rate}</span>
                <span style={{ transform: `translateY(${Math.sin((f - F(at)) / 4) * 5}px)`, display: "inline-flex" }}><Icon n="up" s={58} c={M.red} bg="#FFE3E0" /></span>
              </Sticker>
            </In>
          </React.Fragment>
        );
      })}
      {/* 基準金利 − 優遇幅 ＝ 自分の金利 */}
      <In at={18.18} x={0} y={960} center mode="pop"><span style={{ ...K, fontSize: 34, color: M.sub }}>そこから…</span></In>
      <In at={18.62} x={60} y={1030} from="d" rot={-8}><Sticker pad="10px 20px"><span style={{ ...K, fontSize: 38 }}>基準金利</span></Sticker></In>
      <In at={18.9} x={315} y={1040} mode="pop"><span style={{ ...K, fontSize: 60 }}>−</span></In>
      <In at={18.98} x={370} y={1020} from="d" rot={8}><Sticker pad="6px 16px" style={{ display: "flex", alignItems: "center", gap: 8 }}><GenSlot name="rl_discount_tag" size={70} /><span style={{ ...K, fontSize: 38 }}>優遇幅</span></Sticker></In>
      <In at={19.94} x={676} y={1040} mode="pop"><span style={{ ...K, fontSize: 60 }}>＝</span></In>
      <In at={20.32} x={730} y={1016} mode="pop"><Sticker bg={M.yellow} pad="10px 18px" glow="rgba(255,200,61,0.35)"><div style={{ ...B, fontSize: 22 }}>自分に適用</div><div style={{ ...K, fontSize: 40 }}>自分の金利</div></Sticker></In>
      <Ripple x={860} y={1080} at={20.4} c={M.yellow} />
    </AbsoluteFill>
  );
};

// ════════ ② 5年ルール・125％ルール（21.42–34.58） ════════
const S2: React.FC = () => {
  const f = useCurrentFrame();
  const g = interpolate(f, [F(27.56), F(29.3)], [0, 1], out);
  const over = interpolate(f, [F(29.3), F(29.5), F(29.9)], [0, 1, 0.92], clamp); // 天井にぶつかって少し戻る
  const level = f < F(29.3) ? g * 0.98 : 0.98 + 0.02 * over;
  return (
    <AbsoluteFill>
      <GridBg />
      <Head at={21.42} icon="cal" small="返済額のルール" pill="すぐには上がらない">5年ルール・<R>125%</R>ルール</Head>
      <In at={21.92} until={24.6} x={0} y={460} center from="r" rot={-8}>
        <Sticker pad="12px 30px"><span style={{ ...K, fontSize: 44 }}>金利 <R>↑</R> → 返済額もすぐ <R>↑</R> ？</span></Sticker>
      </In>
      <Stamp at={23.5} until={24.6} x={330} y={540} text="とは限らない" size={50} />
      {/* 年のカード：1〜5年は鍵、6年目に見直し */}
      {Array.from({ length: 6 }).map((_, i) => {
        const at = 24.72 + i * 0.12 + (i === 5 ? 2.84 : 0);
        return (
          <In key={i} at={at} x={78 + i * 158} y={480} from="u" rot={i % 2 ? 12 : -12}>
            <Sticker pad="10px 0" shadow={5} bg={i === 5 ? "#FFE3E0" : "#fff"} style={{ width: 142, textAlign: "center" }}>
              <div style={{ ...B, fontSize: 22, color: M.sub }}>{i === 5 ? "見直し" : "返済"}</div>
              <div style={{ ...K, fontSize: 40 }}>{i + 1}年目</div>
            </Sticker>
          </In>
        );
      })}
      {f >= F(26.14) ? <div style={{ position: "absolute", left: 66, top: 466, width: 5 * 158 - 4, height: 150, border: `6px dashed ${M.green}`, borderRadius: 20, opacity: interpolate(f - F(26.14), [0, 6], [0, 1], clamp) }} /> : null}
      <In at={26.4} x={300} y={640} mode="pop"><span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}><Icon n="lock" s={66} c={M.green} bg="#fff" /><Tag c={M.green} dark size={34}>5年間 据え置き</Tag></span></In>
      {/* 6年目：返済額のメーターが1.25倍の天井で止まる */}
      {f >= F(27.56) ? (
        <div style={{ position: "absolute", left: 110, top: 790, width: 860, opacity: interpolate(f - F(27.56), [0, 6], [0, 1], clamp) }}>
          <div style={{ ...K, fontSize: 34, marginBottom: 12 }}>5年後の見直し：新しい返済額は？</div>
          <div style={{ position: "relative", height: 110, background: "#fff", border: `5px solid ${M.ink}`, borderRadius: 16, boxShadow: `7px 7px 0 ${M.ink}`, overflow: "visible" }}>
            <div style={{ position: "absolute", left: 6, top: 6, bottom: 6, width: `${(0.8 * 0.98 + 0.2 * 0) * 100}%`, maxWidth: "calc(100% - 12px)", background: M.blue, borderRadius: 10, opacity: 0.25 }} />
            <div style={{ position: "absolute", left: 6, top: 6, bottom: 6, width: `calc(${level * 100}% - 12px)`, background: `repeating-linear-gradient(-45deg, ${M.red} 0 18px, #F06A62 18px 36px)`, borderRadius: 10 }} />
            <div style={{ position: "absolute", left: "80%", top: -26, bottom: -26, borderLeft: `4px dashed ${M.ink}` }} />
            <div style={{ position: "absolute", left: "calc(80% - 50px)", top: 118, width: 100, textAlign: "center", ...B, fontSize: 24 }}>今の額</div>
          </div>
          <div style={{ position: "absolute", right: -4, top: 30, height: 170, borderLeft: `8px solid ${M.ink}` }} />
          <div style={{ position: "absolute", right: -4, top: 0, ...K, fontSize: 28, color: M.red }}>上限 1.25倍</div>
        </div>
      ) : null}
      <In at={29.24} x={560} y={1010} from="r" rot={10}><Sticker pad="10px 22px"><span style={{ ...K, fontSize: 36 }}>それまでの<R>1.25倍</R>まで</span></Sticker></In>
      <Stamp at={30.7} x={110} y={1010} text="125%ルール" size={54} />
      {/* でも：変わらない＝安心？ → 安心ではない */}
      <Spot at={32.02} rect={[140, 1120, 800, 200]} dim={0.62} color={M.red} />
      <In at={32.02} x={140} y={1120} mode="pop" w={800}>
        <Sticker pad="0" style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", gap: 18 }}>
          <GenSlot name="rl_sofa_relax" size={170} />
          <span style={{ ...K, fontSize: 46 }}>変わらない＝<R>安心</R>？</span>
        </Sticker>
      </In>
      <In at={33.6} x={640} y={1110} mode="pop"><span style={{ ...SER, fontSize: 200, color: M.red, lineHeight: 1 }}>×</span></In>
      <Note at={30.32} until={34.58}>※5年ルール・125％ルールは、金融機関や返済方式によって適用されない場合があります</Note>
    </AbsoluteFill>
  );
};

// ════════ ③ 返済額の中身（34.58–53.86）：同じ15万円の棒の中で、元金と利息が入れ替わる ════════
const T = 149595;
const S3: React.FC = () => {
  const f = useCurrentFrame();
  const m = interpolate(f, [F(43.4), F(45.0)], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) }); // 0.5%→1.5%
  const prin = 128761 + (87095 - 128761) * m;
  const pw = (prin / T) * 860;
  const showBar = f >= F(38.22);
  const barP = interpolate(f, [F(38.22), F(38.22) + 10], [0, 1], out);
  const flip = interpolate(f, [F(43.38), F(43.38) + 6], [0, 1], clamp);
  const box = interpolate(f, [F(50.0), F(53.4)], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  return (
    <AbsoluteFill>
      <GridBg />
      <Head at={34.58} icon="yen" small="同じ返済額でも" pill="例えば…">返済額の<R>中身</R>が変わる</Head>
      {[["借入", "5,000万円", 35.04], ["期間", "30年", 35.76]].map(([l, v, at], i) => (
        <In key={l as string} at={at as number} x={90 + i * 300} y={440} from="u" rot={i ? 10 : -10}><Sticker pad="6px 22px" shadow={5}><div style={{ ...B, fontSize: 22, color: M.sub }}>{l}</div><div style={{ ...K, fontSize: 40 }}>{v}</div></Sticker></In>
      ))}
      {/* 金利の札：0.5% → くるっと 1.5% */}
      {f >= F(36.62) ? (
        <div style={{ position: "absolute", left: 690, top: 440, transform: `scale(${pop(f, F(36.62))}) rotateY(${flip < 0.5 ? flip * 180 : (1 - flip) * 180}deg)` }}>
          <Sticker pad="6px 22px" shadow={5} bg={flip >= 0.5 ? "#FFE3E0" : "#fff"}><div style={{ ...B, fontSize: 22, color: M.sub }}>金利</div><div style={{ ...K, fontSize: 40, color: flip >= 0.5 ? M.red : M.ink }}>{flip >= 0.5 ? "1.5%" : "0.5%"}</div></Sticker>
        </div>
      ) : null}
      {flip >= 0.5 ? <Ripple x={790} y={490} at={43.6} /> : null}
      {/* 毎月の返済＝約15万円（変わらない） */}
      <In at={38.22} x={110} y={600} mode="pop"><span style={{ display: "inline-flex", alignItems: "center", gap: 12 }}><Icon n="yen" s={56} c={M.blue} bg="#fff" /><span style={{ ...K, fontSize: 40 }}>毎月の返済 <span style={{ ...SER, fontSize: 56 }}>約15万円</span></span>{f >= F(45.08) ? <Tag c={M.green} dark size={26}>同じ</Tag> : null}</span></In>
      {showBar ? (
        <div style={{ position: "absolute", left: 110, top: 700, width: 860, height: 150, border: `5px solid ${M.ink}`, borderRadius: 18, boxShadow: `7px 7px 0 ${M.ink}`, overflow: "hidden", background: "#fff", transform: `scaleX(${barP})`, transformOrigin: "left" }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: pw, background: M.blue, display: "flex", flexDirection: "column", justifyContent: "center", paddingLeft: 26, color: "#fff", boxSizing: "border-box" }}>
            <div style={{ ...B, fontSize: 24 }}>元金に回る</div>
            <div style={{ ...K, fontSize: 52 }}>{yen(f < F(40.9) ? 0 : f < F(43.4) ? cnt(f, 40.9, 128761, 0.8) : prin)}<span style={{ fontSize: 28 }}>円</span></div>
          </div>
          <div style={{ position: "absolute", left: pw, right: 0, top: 0, bottom: 0, background: M.red, borderLeft: `5px solid ${M.ink}`, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", color: "#fff" }}>
            <div style={{ ...B, fontSize: 22 }}>利息</div>
            <div style={{ ...K, fontSize: 30 }}>{yen(T - prin)}</div>
          </div>
        </div>
      ) : null}
      {/* 減った分 */}
      <In at={47.48} x={110} y={890} from="l" rot={-8}><Sticker pad="8px 22px" bg="#FFE3E0"><span style={{ ...K, fontSize: 36 }}>元金に回るお金 <R>約4.2万円 減</R></span></Sticker></In>
      {/* 先送り：負担の箱が「今」から「5年後」へ運ばれる */}
      {f >= F(48.82) ? (
        <>
          <Link at={48.9} pts={[[150, 1240], [930, 1240]]} w={6} dur={0.4} arrow />
          <div style={{ position: "absolute", left: 110, top: 1258, ...K, fontSize: 30 }}>今</div>
          <div style={{ position: "absolute", left: 860, top: 1258, ...K, fontSize: 30, color: M.red }}>後ろ</div>
          <div style={{ position: "absolute", left: 150 + box * 620, top: 1110, transform: `rotate(${Math.sin(f / 3) * 3 * (box > 0 && box < 1 ? 1 : 0)}deg)` }}>
            <Sticker bg={M.red} pad="14px 22px" shadow={6}><span style={{ ...K, fontSize: 36, color: "#fff" }}>負担</span></Sticker>
          </div>
          <In at={49.6} x={0} y={1030} mode="pop" w={360}><GenSlot name="rl_push_box_back" size={150} /></In>
        </>
      ) : null}
      <In at={52.08} x={520} y={1010} mode="pop"><Tag c={M.yellow} size={32}>後ろに先送りしてるだけ</Tag></In>
    </AbsoluteFill>
  );
};

// ════════ ④ 5年後どうなる？（53.86–75.70）：青い背景（山場） ════════
const S4: React.FC = () => {
  const f = useCurrentFrame();
  const rowsOut = interpolate(f, [F(69.4), F(69.4) + 8], [0, 1], clamp);
  const row = (at: number, y: number, label: string, icon: IconName, right: React.ReactNode) => (
    <In at={at} x={90} y={y - rowsOut * 40} from={y % 2 ? "l" : "r"} rot={y % 2 ? -8 : 8} style={{ opacity: 1 - rowsOut }}>
      <Sticker pad="14px 22px" style={{ width: 900, display: "flex", alignItems: "center", gap: 18 }}>
        <Icon n={icon} s={70} c={M.red} />
        <span style={{ ...K, fontSize: 38, width: 230 }}>{label}</span>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12 }}>{right}</div>
      </Sticker>
    </In>
  );
  return (
    <AbsoluteFill>
      <GridBg color={BLUE_BG} grid="rgba(255,255,255,0.12)" cubes={false} />
      <Head at={53.86} icon="clock" small="先送りした結果" pill="金利 0.5% → 1.5% の場合" light>{<span style={{ color: "#FFD84D" }}>5年後</span>}どうなる？</Head>
      <In at={55.3} x={850} y={150} mode="pop"><GenSlot name="rl_hourglass" size={170} /></In>
      {row(56.92, 450, "5年の利息", "yen", <>
        <span style={{ ...K, fontSize: 36, color: M.sub }}>{yen(cnt(f, 57.98, 115))}万</span>
        <span style={{ ...K, fontSize: 40 }}>→</span>
        {f >= F(59.34) ? <span style={{ ...SER, fontSize: 64, color: M.red }}>{yen(cnt(f, 59.34, 355, 0.7, 115))}<span style={{ ...K, fontSize: 30 }}>万円</span></span> : null}
        {f >= F(60.2) ? <span style={{ transform: `scale(${pop(f, F(60.2))})`, display: "inline-block" }}><Tag c={M.yellow} size={26}>約3倍</Tag></span> : null}
      </>)}
      {row(60.68, 650, "ローン残高", "house", <>
        {f >= F(61.96) ? <span style={{ ...SER, fontSize: 64, color: M.red }}>+{yen(cnt(f, 61.96, 240))}<span style={{ ...K, fontSize: 30 }}>万円</span></span> : null}
        <span style={{ ...K, fontSize: 32 }}>多く残る</span>
      </>)}
      {row(63.88, 851, "毎月の返済", "up", <>
        <span style={{ ...K, fontSize: 36, color: M.sub }}>15万</span>
        <span style={{ ...K, fontSize: 40 }}>→</span>
        {f >= F(66.44) ? <span style={{ ...SER, fontSize: 64, color: M.red }}>{(cnt(f, 66.44, 17.8, 0.6, 15)).toFixed(1)}<span style={{ ...K, fontSize: 30 }}>万</span></span> : null}
      </>)}
      <Stamp at={67.98} until={69.4} x={560} y={1010} text="月+2.9万円" size={56} c="#FFD84D" />
      <In at={65.0} until={69.4} x={110} y={1030} mode="pop"><GenSlot name="rl_bill_shock" size={260} /></In>
      {/* 最終的に：大きな数字 */}
      <In at={69.6} x={0} y={470} center mode="ghost"><span style={{ ...K, fontSize: 50, color: "#fff" }}>金利1.5%がそのまま続けば</span></In>
      <In at={71.84} x={0} y={560} center mode="pop"><Tag c={M.yellow} size={36}>最終的に</Tag></In>
      <In at={72.2} x={360} y={650} mode="pop"><GenSlot name="rl_money_mountain" size={360} /></In>
      {f >= F(72.68) ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 1000, textAlign: "center", transform: `scale(${pop(f, F(72.68))}) ${shake(f, 74.2, 10)}` }}>
          <span style={{ display: "inline-block", background: "#fff", border: `6px solid ${M.ink}`, borderRadius: 24, boxShadow: `10px 10px 0 ${M.ink}`, padding: "6px 40px" }}>
            <span style={{ ...K, fontSize: 40 }}>支払いが </span><span style={{ ...SER, fontSize: 150, color: M.red, lineHeight: 1.05 }}>+{yen(cnt(f, 72.68, 861, 1.4))}</span><span style={{ ...K, fontSize: 56 }}>万円</span>
          </span>
        </div>
      ) : null}
      <Ripple x={540} y={1090} at={74.2} c="#FFD84D" n={3} />
      <Note at={56.92} light>※5,000万円・30年・金利0.5％で借りた直後に1.5％へ上がり、その後も1.5％が続く前提の試算。実際の返済額の見直し時期は、金融機関・契約内容によって異なります</Note>
    </AbsoluteFill>
  );
};

// ════════ ⑤ 未払利息（75.70–82.90）：コップ（返済額）から水（利息）があふれる ════════
const S5: React.FC = () => {
  const f = useCurrentFrame();
  const lv = interpolate(f, [F(76.4), F(79.3)], [0.35, 1.0], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const overflow = f >= F(79.3);
  const gx = 300, gy = 470, gw = 360, gh = 560;
  const box = interpolate(f, [F(80.3), F(81.3)], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <GridBg />
      <Head at={75.7} icon="warn" small="金利が大きく上がると" pill="返済額 ＜ 利息">未払<R>利息</R></Head>
      {f >= F(76.0) ? (
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, opacity: interpolate(f - F(76.0), [0, 6], [0, 1], clamp) }}>
          <defs><clipPath id="glass"><path d={`M${gx} ${gy} L${gx + gw} ${gy} L${gx + gw - 40} ${gy + gh} L${gx + 40} ${gy + gh} Z`} /></clipPath></defs>
          <rect x={gx - 10} y={gy + gh * (1 - lv)} width={gw + 20} height={gh * lv + 10} fill="#F06A62" clipPath="url(#glass)" />
          <path d={`M${gx} ${gy + gh * (1 - lv)} q ${gw / 4} ${Math.sin(f / 4) * 12} ${gw / 2} 0 t ${gw / 2} 0`} fill="none" stroke="#fff" strokeWidth={5} opacity={0.6} clipPath="url(#glass)" />
          <path d={`M${gx} ${gy} L${gx + 40} ${gy + gh} L${gx + gw - 40} ${gy + gh} L${gx + gw} ${gy}`} fill="none" stroke={M.ink} strokeWidth={9} strokeLinejoin="round" />
          {/* あふれる水と、落ちるしずく */}
          {overflow ? <path d={`M${gx + gw} ${gy} q 30 10 34 ${60 + Math.min(220, (f - F(79.3)) * 12)}`} fill="none" stroke="#F06A62" strokeWidth={16} strokeLinecap="round" /> : null}
          {overflow ? Array.from({ length: 5 }).map((_, i) => { const d = (f - F(79.3) - i * 5) % 30; return d > 0 ? <circle key={i} cx={gx + gw + 36} cy={gy + 80 + d * 18} r={10} fill="#F06A62" opacity={1 - d / 30} /> : null; }) : null}
        </svg>
      ) : null}
      <In at={76.2} x={gx - 250} y={gy + 10} from="l" rot={-8}><Sticker pad="8px 18px" shadow={5}><span style={{ ...K, fontSize: 32 }}>コップ＝<span style={{ color: M.blue }}>返済額</span></span></Sticker></In>
      <In at={77.86} x={gx - 250} y={gy + 330} from="l" rot={8}><Sticker pad="8px 18px" shadow={5}><span style={{ ...K, fontSize: 32 }}>水＝<R>利息</R></span></Sticker></In>
      <In at={79.32} x={720} y={470} mode="pop"><Sticker pad="8px 18px" bg="#FFE3E0" shadow={5}><span style={{ ...K, fontSize: 32 }}>払いきれない<br /><R>利息</R></span></Sticker></In>
      {/* 繰り越しの箱 */}
      {f >= F(80.3) ? (
        <div style={{ position: "absolute", left: 690, top: 900, transform: `scale(${0.7 + 0.3 * box})`, opacity: box }}>
          <Sticker pad="10px 20px" style={{ display: "flex", alignItems: "center", gap: 10 }}><GenSlot name="rl_snowball" size={110} /><div><div style={{ ...B, fontSize: 22, color: M.sub }}>次へ</div><div style={{ ...K, fontSize: 38 }}>繰り越し</div></div></Sticker>
        </div>
      ) : null}
      <Stamp at={81.98} x={260} y={1110} text="これが 未払利息" size={58} />
    </AbsoluteFill>
  );
};

// ════════ ⑥ まとめ（82.90–94.78） ════════
const SUM: [number, IconName, React.ReactNode][] = [
  [83.46, "check", <>返済額は<span style={{ color: M.blue }}>すぐ上がらない</span>ことがある</>],
  [86.56, "x", <>でも負担は<R>なくなっていない</R></>],
  [88.62, "clock", <><R>後ろに先送り</R>されているだけ</>],
];
const S6: React.FC = () => {
  const f = useCurrentFrame();
  const dimRows = interpolate(f, [F(90.26), F(90.26) + 6], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <GridBg />
      <Head at={83.2} icon="check" small="まとめ" pill="返済額が変わらない ≠ 安心">金利が上がると…</Head>
      {SUM.map(([at, ic, t], i) => (
        <In key={i} at={at} x={90} y={450 + i * 150} from={i % 2 ? "r" : "l"} rot={i % 2 ? 8 : -8} style={{ opacity: 1 - 0.55 * dimRows }}>
          <Sticker strip={i ? M.red : M.blue} pad="14px 20px" style={{ width: 900, display: "flex", alignItems: "center", gap: 16 }}><Icon n={ic} s={60} c={i ? M.red : M.blue} /><span style={{ ...K, fontSize: 40 }}>{t}</span></Sticker>
        </In>
      ))}
      <In at={90.26} x={90} y={940} from="d" rot={-6}>
        <Sticker bg={M.yellow} pad="18px 24px" glow="rgba(255,200,61,0.35)" style={{ width: 900, display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ width: 70, height: 70, borderRadius: 14, border: `6px solid ${M.ink}`, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", ...K, fontSize: 56, color: M.green, flex: "none", transform: f >= F(93.94) ? `scale(${pop(f, F(93.94))})` : undefined }}>{f >= F(93.94) ? "✓" : ""}</span>
          <span style={{ ...K, fontSize: 42, lineHeight: 1.3 }}>自分の住宅ローンの<br /><R>契約内容</R>を必ず確認</span>
          <span style={{ marginLeft: "auto" }}><GenSlot name="rl_contract_magnifier" size={140} /></span>
        </Sticker>
      </In>
      <Ripple x={130} y={1020} at={93.94} c={M.green} />
    </AbsoluteFill>
  );
};

// ════════ 締め（94.78–99.08） ════════
const Close: React.FC = () => (
  <AbsoluteFill>
    <GridBg />
    <In at={94.9} x={0} y={260} center mode="ghost"><span style={{ ...K, fontSize: 52 }}>金利が上がっている今</span></In>
    <In at={96.38} x={0} y={350} center from="r" rot={-10}><Sticker pad="8px 36px"><span style={{ ...K, fontSize: 76 }}>どう<R>対策</R>する？</span></Sticker></In>
    <In at={96.6} x={330} y={520} mode="pop"><GenSlot name="rl_couple_check" size={420} /></In>
    <In at={97.8} x={0} y={980} center mode="pop"><span style={{ display: "inline-block", background: M.red, color: "#fff", border: `5px solid ${M.ink}`, borderRadius: 999, padding: "12px 44px", ...K, fontSize: 46, boxShadow: `6px 6px 0 ${M.ink}` }}>次の動画で解説 ▶</span></In>
  </AbsoluteFill>
);

// 下の真ん中の太一（マーケ博士の型：ずっといて、場面ごとにポーズを差し替え＋少し跳ねる）
const POSES: [number, string][] = [
  [0, "taichi_hand_cheek"], [3.08, "taichi_scared"], [8.52, "taichi_point_up"],
  [10.24, "taichi_explain_both"], [18.18, "taichi_idea"],
  [21.42, "taichi_think_chin"], [26.14, "taichi_ok_hand"], [32.02, "taichi_wave_no"],
  [34.58, "taichi_explain_both"], [43.38, "taichi_notice"], [48.82, "taichi_hmm_doubt"],
  [53.86, "taichi_think_arms"], [59.34, "taichi_surprise"], [72.68, "taichi_shock"],
  [75.7, "taichi_worry"], [81.74, "taichi_head_hold"],
  [82.9, "taichi_one_finger"], [90.26, "taichi_point_up"], [93.94, "taichi_ok_circle"],
  [94.78, "taichi_lean_in"], [97.8, "taichi_wave_hi"],
];
const Chara: React.FC = () => {
  const f = useCurrentFrame();
  let name = POSES[0][1], at = 0;
  POSES.forEach(([t, n]) => { if (f >= F(t)) { name = n; at = t; } });
  const k = interpolate(f - F(at), [0, 3, 7], [0.84, 1.06, 1], clamp);
  const y = 1450 + Math.sin(f / 10) * 6 - interpolate(f - F(at), [0, 4, 9], [0, 26, 0], clamp);
  return <div style={{ position: "absolute", left: 540 - 230, top: y, width: 460, height: 460, transform: `scale(${k})`, transformOrigin: "50% 100%" }}><GenSlot name={name} size={460} /></div>;
};

// ── 地図の並び（上の段 左→右、下の段 右→左）──
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
  s("u02s", 1.62, 0.22), s("u02s", 2.04, 0.18), s("u04", 3.6, 0.32), ...PREVIEW.map((_, i) => s("u02s", 6.34 + i * 0.16, 0.14)), s("u02s", 8.52, 0.16),
  ...STOPS.slice(1).map((st) => s("u03s", st.trans, 0.26)),
  ...CHAIN.flatMap(([t]) => [s("u02s", t, 0.2), s("u02s", t + 0.4, 0.16)]), s("u02s", 18.62, 0.16), s("u02s", 18.98, 0.16), s("u05", 20.32, 0.26),
  s("u02s", 21.92, 0.18), s("u04", 23.5, 0.28), ...[0, 1, 2, 3, 4].map((i) => s("u02s", 24.72 + i * 0.12, 0.12)), s("u05s", 26.4, 0.22), s("u06", 27.56, 0.24), s("u04", 29.3, 0.26), s("u04", 30.7, 0.3), s("u05", 32.02, 0.24), s("u04", 33.6, 0.3),
  s("u02s", 35.04, 0.16), s("u02s", 35.76, 0.16), s("u02s", 36.62, 0.16), s("u05s", 38.22, 0.22), s("u05s", 40.9, 0.2), s("u03s", 43.38, 0.24), s("u05", 47.48, 0.24), s("u03", 50.0, 0.2), s("u02s", 52.08, 0.18),
  s("u02s", 56.92, 0.18), s("u04", 59.34, 0.28), s("u02s", 60.68, 0.18), s("u05s", 61.96, 0.22), s("u02s", 63.88, 0.18), s("u05", 66.44, 0.24), s("u04", 67.98, 0.3), s("u06", 72.68, 0.26), s("u09", 74.2, 0.32),
  s("u05s", 76.2, 0.2), s("u05s", 77.86, 0.2), s("u04", 79.32, 0.28), s("u02s", 80.3, 0.18), s("u04", 81.98, 0.3),
  ...SUM.map(([t]) => s("u02s", t, 0.2)), s("u05", 90.26, 0.26), s("u10", 93.94, 0.28),
  s("u02s", 96.38, 0.2), s("u07", 97.8, 0.26),
];

export const RATELOAN_FRAMES = F(99.4);
export const RateLoanReel: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: M.paper, fontFamily: FONT }}>
    <Audio src={staticFile("rl-narration.wav")} />
    <SfxTrack cues={CUES} />
    <Board streaks panels={PANELS} stops={STOPS} links={LINKS} paper={{ background: M.paper }}>
      {(id) => { const C = PAGES[id]; return <AbsoluteFill><C /></AbsoluteFill>; }}
    </Board>
    <Chara />
  </AbsoluteFill>
);
