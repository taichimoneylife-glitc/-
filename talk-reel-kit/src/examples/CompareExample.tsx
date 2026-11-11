import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { F, clamp, count, ease, num, pop, rise, until } from "../lib/anim";
import { FONT, K } from "../lib/font";
import { SfxTrack } from "../lib/sfx";
import { Board, type Panel, type Stop } from "../diagram/board";
import { T, shadow } from "../diagram/theme";
import { Badge, Card, CheckLine, Chip, Door, Donut, HBars, Head, LineGrow, PlusMinus, Stamp, Stripe } from "../diagram/parts";

// ════════════════════════════════════════════════════════════
//  比較動画（Aさん vs Bさん）の見本 ── 図解だけで作る型
//  仮テーマ：毎月3万円を10年　A＝積立投資（年5%と仮定）／B＝貯金
//  数字（月複利）：元本360万／年3%≈419万／年5%≈466万／年7%≈519万
//  流れ：VS → 条件を＝でそろえる → 式 → 片方ずつ（章の扉）→ 中身を割る → 差 → ちょっと待って → ±まとめ
//  人物の絵の代わりに A / B の丸バッジ。絵がある人は Badge を画像に差しかえる
// ════════════════════════════════════════════════════════════
const fv = (rate: number, months: number) => { const i = rate / 12; return i === 0 ? 3 * months : (3 * ((1 + i) ** months - 1)) / i; };
const A = T.A, B = T.B, N = T.N;

// ① VS → ＝ → 時計 → 電卓 → そのまま条件のカードへ変身
const ROWS = [{ at: 8.6, g: "人", l: "年齢", v: "30歳" }, { at: 9.6, g: "¥", l: "手取り", v: "月30万円" }, { at: 10.6, g: "↓", l: "毎月", v: "3万円" }];
const MID: [number, string][] = [[0.6, "VS"], [1.6, "＝"], [5.0, "10年"], [6.2, "計算"]];
const P1: React.FC = () => {
  const f = useCurrentFrame(); const t = f / 30;
  const k = ease(f, 7.6, 0.8);
  let mi = -1; MID.forEach(([at], i) => { if (t >= at) mi = i; });
  return (
    <>
      <Head at={0.9} end={5.0} pill="比較" title="同じ年収の2人" />
      <Head at={5.0} end={7.6} pill="比較" title="10年後、得するのは？" />
      <Head at={7.6} pill="前提" title="2人の条件" />
      {[{ x: 65, c: A, name: "積立投資", b: "A", tag: 2.6 }, { x: 565, c: B, name: "貯金", b: "B", tag: 3.8 }].map((cd, i) => (
        <div key={i} style={{ position: "absolute", left: cd.x, top: 400, width: 450, height: 760, borderRadius: 34, overflow: "hidden", background: `linear-gradient(180deg, #fff, ${cd.c}14)`, border: `3px solid ${cd.c}55`, boxShadow: `${shadow}, 0 0 0 8px ${cd.c}12`, ...rise(f, 0.2 + i * 0.12) }}>
          <div style={{ position: "absolute", left: 225 - (230 - 80 * k) / 2, top: 230 - 190 * k, transform: `translateY(${Math.sin(f / 13 + i) * 5 * (1 - k)}px)` }}><Badge c={cd.c} text={cd.b} size={230 - 80 * k} /></div>
          {t >= cd.tag ? <div style={{ position: "absolute", left: 0, right: 0, top: 520 - 300 * k, textAlign: "center", transform: `scale(${pop(f, cd.tag)})` }}><span style={{ background: cd.c, color: "#fff", borderRadius: 999, padding: "6px 24px", ...K, fontSize: 32 }}>{cd.name}</span></div> : null}
          {ROWS.map((r, j) => f >= F(r.at + i * 0.12) ? (
            <div key={j} style={{ position: "absolute", left: 34, top: 330 + j * 130, display: "flex", alignItems: "center", gap: 16, ...rise(f, r.at + i * 0.12) }}>
              <div style={{ width: 58, height: 58, borderRadius: "50%", background: `${cd.c}1E`, color: cd.c, ...K, fontSize: 26, display: "flex", alignItems: "center", justifyContent: "center" }}>{r.g}</div>
              <div><div style={{ ...K, fontSize: 22, color: T.sub }}>{r.l}</div><div style={{ ...K, fontSize: 48, color: cd.c, lineHeight: 1.05 }}>{r.v}</div></div>
            </div>) : null)}
        </div>
      ))}
      {mi >= 0 && f < F(7.7) ? <div style={{ position: "absolute", left: 478, top: 760, width: 124, height: 124, borderRadius: "50%", background: MID[mi][1] === "＝" ? "#fff" : N, color: MID[mi][1] === "＝" ? N : "#fff", border: `5px solid ${MID[mi][1] === "＝" ? N : "#fff"}`, boxShadow: `${shadow}, 0 0 0 10px ${N}22`, ...K, fontSize: MID[mi][1].length > 1 ? 34 : 48, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${pop(f, MID[mi][0])})`, opacity: until(f, 7.7) }}>{MID[mi][1]}</div> : null}
      {ROWS.map((r, j) => f >= F(r.at + 0.4) ? <div key={j} style={{ position: "absolute", left: 512, top: 748 + j * 130, width: 56, height: 56, borderRadius: "50%", background: N, color: "#fff", ...K, fontSize: 36, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${pop(f, r.at + 0.4)})` }}>＝</div> : null)}
      <Chip at={11.6} c={N} solid style={{ left: 0, right: 0, top: 1185, textAlign: "center" }}>違うのは「置き場所」だけ</Chip>
    </>
  );
};

// ② 式が組み上がる
const P2: React.FC = () => {
  const f = useCurrentFrame();
  const parts: [number, string][] = [[13.4, "3万円"], [14.2, "12か月"], [15.0, "10年"]];
  return (
    <>
      <Head at={12.8} pill="前提" title="10年で入れるお金" />
      {parts.map(([at, s], i) => (
        <React.Fragment key={i}>
          {i > 0 && f >= F(at - 0.15) ? <div style={{ position: "absolute", left: 0, right: 0, top: 376 + i * 120, textAlign: "center", ...K, fontSize: 40, color: T.sub }}>×</div> : null}
          <Chip at={at} c={T.ink} style={{ left: 0, right: 0, top: 410 + i * 120, textAlign: "center" }} fs={40}>{s}</Chip>
        </React.Fragment>
      ))}
      <div style={{ position: "absolute", left: 300, right: 300, top: 760, height: 5, borderRadius: 3, background: T.ink, transform: `scaleX(${ease(f, 15.7, 0.4)})` }} />
      <Card at={16.0} x={240} y={800} w={600} h={170} c={N} g="¥" label="2人とも 入れたお金" big={80} hot>{num(count(f, 16.0, 360, 0.6))}<span style={{ fontSize: 40 }}>万円</span></Card>
    </>
  );
};

// ③ B＝貯金（章の扉 → しま模様のバー）
const P3: React.FC = () => {
  const f = useCurrentFrame();
  const p = interpolate(f, [F(20.6), F(22.6)], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  return (
    <>
      <Door at={18.6} end={20.2} no="1" name="貯金" c={B} />
      <Head at={20.2} pill="1・Bさん" title="貯金の10年" c={B} />
      {f >= F(20.4) ? <>
        <div style={{ position: "absolute", left: 120, top: 390, ...K, fontSize: 24, color: T.sub }}>口座の残高</div>
        <Stripe x={120} y={430} w={840} h={64} p={p} c={B} />
        <div style={{ position: "absolute", left: 120 + 840 * p - 70, top: 334, width: 140, textAlign: "center", ...K, fontSize: 30, color: B }}>{num(360 * p)}万</div>
      </> : null}
      <Card at={21.4} x={100} y={600} w={400} c={B} g="¥" label="入れたお金">360<span style={{ fontSize: 30 }}>万円</span></Card>
      <Card at={22.6} x={580} y={600} w={400} c={T.sub} g="%" label="利息で増えた分">ほぼ<span style={{ fontSize: 60 }}>0</span></Card>
      <Card at={23.8} x={100} y={780} w={880} h={190} c={B} label="10年後の貯金" big={96} hot>{num(count(f, 23.8, 360, 0.6))}<span style={{ fontSize: 44 }}>万円</span></Card>
      <Chip at={24.6} c={T.green} style={{ left: 340, top: 1010 }}>元本は 1円も減らない</Chip>
    </>
  );
};

// ④ A＝積立投資（線が伸びる）
const P4: React.FC = () => (
  <>
    <Door at={25.6} end={27.2} no="2" name="積立投資" c={A} />
    <Head at={27.2} pill="2・Aさん" title="積立投資の10年" c={A} />
    <LineGrow box={{ x: 110, y: 400, w: 860, h: 620 }} max={500} n={120} base={(m) => fv(0, m)} val={(m) => fv(0.05, m)} baseAt={28.0} at={29.2} dur={3} c={A} fmt={(v) => `${num(v)}万円`} xLabels={[[0, "0年"], [60, "5年"], [120, "10年"]]} yStep={100} yFmt={(v) => `${v}万`} head={<Badge c={A} text="A" size={62} />} />
    <Chip at={30.6} c={T.gold} style={{ left: 260, top: 560 }} fs={28}>この差が「運用で増えた分」</Chip>
    <Chip at={32.6} c={T.sub} style={{ left: 250, top: 1050 }} fs={26}>年5%で運用できた場合（仮定の試算）</Chip>
  </>
);

// ⑤ 中身（ドーナツが2色に割れる）
const P5: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <Head at={34.0} pill="2・Aさん" title="466万円の中身" c={A} />
      <Donut cx={540} cy={640} parts={[{ v: 360, c: T.gray, at: 34.6, dur: 0.8 }, { v: 106, c: T.gold, at: 36.0, dur: 0.6 }]}>
        <div style={{ ...K, fontSize: 84, color: A, lineHeight: 1 }}>466<span style={{ fontSize: 38 }}>万円</span></div>
        <div style={{ ...K, fontSize: 24, color: T.sub, marginTop: 6 }}>10年後</div>
      </Donut>
      <Card at={35.0} x={100} y={890} w={400} c={T.gray} g="¥" label="入れたお金">360<span style={{ fontSize: 30 }}>万円</span></Card>
      <Card at={36.2} x={580} y={890} w={400} c={T.gold} g="↑" label="運用で増えた分" hot>+{num(count(f, 36.2, 106, 0.6))}<span style={{ fontSize: 30 }}>万円</span></Card>
    </>
  );
};

// ⑥ 結果（2枚＋差のカッコ）
const P6: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <Head at={38.8} pill="10年後" title="2人の差" />
      <Card at={39.4} x={100} y={400} w={640} h={170} c={A} label="Aさん｜積立投資" big={84} hot><span style={{ display: "inline-flex", alignItems: "center", gap: 20 }}><Badge c={A} text="A" size={80} />{num(count(f, 39.4, 466, 0.6))}<span style={{ fontSize: 38 }}>万円</span></span></Card>
      <Card at={40.4} x={100} y={610} w={640} h={170} c={B} label="Bさん｜貯金" big={84}><span style={{ display: "inline-flex", alignItems: "center", gap: 20 }}><Badge c={B} text="B" size={80} />{num(count(f, 40.4, 360, 0.6))}<span style={{ fontSize: 38 }}>万円</span></span></Card>
      {f >= F(41.4) ? <div style={{ position: "absolute", left: 770, top: 485, width: 46, height: 210, borderRight: `6px solid ${T.red}`, borderTop: `6px solid ${T.red}`, borderBottom: `6px solid ${T.red}`, borderRadius: "0 14px 14px 0", transformOrigin: "left center", transform: `scaleX(${ease(f, 41.4, 0.3)})` }} /> : null}
      {f >= F(41.8) ? <div style={{ position: "absolute", left: 836, top: 540, width: 150, textAlign: "center", ...K, color: T.red, transform: `scale(${pop(f, 41.8)})` }}><div style={{ fontSize: 24 }}>差</div><div style={{ fontSize: 50, lineHeight: 1 }}>+{num(count(f, 41.8, 106, 0.5))}</div><div style={{ fontSize: 26 }}>万円</div></div> : null}
      <Stamp at={43.2} text="同じ3万円なのに" style={{ left: 260, top: 900 }} fs={48} />
    </>
  );
};

// ⑦ ちょっと待って（シナリオの棒）
const P7: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <Stamp at={44.6} text="ちょっと待って！" style={{ left: 250, top: 700 }} end={46.0} />
      {f >= F(46.0) ? <>
        <Head at={46.0} pill="注意" title="毎年5%とは限らない" c={T.red} />
        <HBars y={430} max={560} rows={[{ label: "年3%", v: fv(0.03, 120), at: 46.6, c: A, text: undefined }, { label: "年5%", v: fv(0.05, 120), at: 47.4, c: A }, { label: "年7%", v: fv(0.07, 120), at: 48.2, c: A }]} line={{ v: 360, at: 50.0, label: "貯金 360万円", c: B }} />
        <Stamp at={51.2} text="保証はない" style={{ left: 560, top: 1000 }} fs={46} />
      </> : null}
    </>
  );
};

// ⑧ まとめ（±＋チェック）
const P8: React.FC = () => (
  <>
    <Head at={53.2} pill="まとめ" title="積立投資 vs 貯金" />
    <PlusMinus at={53.5} cols={[
      { title: "積立投資", c: A, badge: "A", items: [{ plus: true, text: "増える可能性", at: 54.0 }, { plus: false, text: "値下がりもある", at: 54.9 }] },
      { title: "貯金", c: B, badge: "B", items: [{ plus: true, text: "減らない", at: 56.0 }, { plus: false, text: "ほぼ増えない", at: 56.9 }] },
    ]} />
    <CheckLine at={58.0} checkAt={59.4} y={880}>すぐ使うお金は <span style={{ color: B }}>貯金</span><br />10年使わないお金は <span style={{ color: A }}>積立投資</span></CheckLine>
  </>
);

const IDS = ["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8"];
const PAGES: Record<string, React.FC> = { p1: P1, p2: P2, p3: P3, p4: P4, p5: P5, p6: P6, p7: P7, p8: P8 };
const PANELS: Panel[] = IDS.map((id, i) => ({ id, col: i, row: 0 }));
const LINKS: [string, string][] = IDS.slice(1).map((id, i) => [IDS[i], id]);
const STOPS: Stop[] = [
  { id: "p1", trans: 0 }, { id: "p2", trans: 12.4, kind: "kick" }, { id: "p3", trans: 18.2, kind: "kick" }, { id: "p4", trans: 25.2, kind: "kick" },
  { id: "p5", trans: 33.6, kind: "fast" }, { id: "p6", trans: 38.4, kind: "kick" }, { id: "p7", trans: 44.2, kind: "fast" }, { id: "p8", trans: 52.8, kind: "kick" },
];
const CUES = STOPS.slice(1).map((s) => ({ file: "whoosh.wav", at: F(s.trans), volume: 0.2 }));

export const COMPARE_FRAMES = F(62);
export const CompareExample: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: FONT, background: T.paper }}>
    <SfxTrack cues={CUES} />
    <Board streaks panels={PANELS} stops={STOPS} links={LINKS} paper={{ background: T.paper, backgroundImage: `radial-gradient(circle at 50% 38%, rgba(255,255,255,0.7), rgba(255,255,255,0) 58%), repeating-linear-gradient(transparent 0 62px, ${T.line} 62px 64px)` }}>
      {(id) => { const C = PAGES[id]; return <AbsoluteFill><C /></AbsoluteFill>; }}
    </Board>
  </AbsoluteFill>
);
