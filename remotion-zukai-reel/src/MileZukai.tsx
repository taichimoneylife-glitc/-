import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, interpolate, Easing } from "remotion";
import { A2, Mark2 } from "./components/kit2";
import { FONT } from "./components/font";
import { SfxTrack } from "./components/sfx";
import { B, GenSlot, In, Card, Head, MarkerSub, SubFade } from "./MileLifePlan";
import { MileLifeChart, MILE_LC_FRAMES } from "./MileLifeChart";

// ════════════════════════════════════════════════════════════════════
//  マイル図解パート 通し（①〜④）。見た目＝三大原則（薄黄×白カード×生成イラスト）
//  ① マイルとは（0–5.12）  ② 貯まる仕組み＝縦のフロー＋カメラ（5.12–19.72）
//  ③ 半年100万のハードル→チャンス→他にも方法（19.72–35.32）  ④ ライフプラン＝MileLifeChart 横軸版（35.32–）※縦版は MileLifePlan
//  画像は GenSlot（public/gen に置いて `node scripts/gen-manifest.mjs`）
// ════════════════════════════════════════════════════════════════════

const F = (t: number) => Math.round(t * 30);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const io = { ...clamp, easing: Easing.inOut(Easing.cubic) };
const out = { ...clamp, easing: Easing.out(Easing.cubic) };
const PART4 = F(35.32);

// C1：ポン（0.3→1.25→1）
const pop = (f: number, at: number) => interpolate(f - at, [0, 3, 6], [0.3, 1.25, 1], clamp);

// 場面の退場（上へスライド＋フェード）
const useLeave = (end: number) => {
  const f = useCurrentFrame();
  const k = interpolate(f, [end, end + 10], [0, 1], io);
  return { gone: f >= end + 10, style: { transform: `translateY(${-k * 240}px)`, opacity: 1 - k } as React.CSSProperties };
};

// D1：線が伸びる矢印
const Arrow: React.FC<{ x: number; y: number; w: number; at: number; label?: string }> = ({ x, y, w, at, label }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const p = interpolate(f, [at, at + 8], [0, 1], out);
  return (
    <div style={{ position: "absolute", left: x, top: y - 30, width: w, height: 60 }}>
      {label ? <div style={{ position: "absolute", left: 0, right: 0, top: -34, textAlign: "center", ...B, fontSize: 30, color: A2.green, opacity: p }}>{label}</div> : null}
      <div style={{ position: "absolute", left: 0, top: 25, width: (w - 20) * p, height: 10, borderRadius: 5, background: A2.green }} />
      <div style={{ position: "absolute", left: (w - 34) * p, top: 12, width: 0, height: 0, borderTop: "18px solid transparent", borderBottom: "18px solid transparent", borderLeft: `30px solid ${A2.green}`, opacity: p > 0.2 ? 1 : 0 }} />
    </div>
  );
};

// ── ① マイルの活用：飛行機に乗らなくても生活費から（0–5.12）──
const SceneA: React.FC = () => {
  const f = useCurrentFrame();
  const lv = useLeave(F(5.12));
  if (lv.gone) return null;
  const mv = interpolate(f, [F(3.0), F(3.0) + 12], [0, 1], io);
  const pAt = F(0.86);
  return (
    <AbsoluteFill style={lv.style}>
      <Head text={<><span style={{ color: A2.green }}>マイル</span>の活用</>} from={pAt} />
      {f >= pAt ? (
        <div style={{ position: "absolute", left: 370 + mv * 270, top: 470, transform: `scale(${pop(f, pAt) * (1.15 - mv * 0.15)})` }}>
          <Card style={{ padding: 20 }}><GenSlot name="mile_plane" size={300} label="飛行機" /></Card>
        </div>
      ) : null}
      {f >= F(1.9) ? (
        <div style={{ position: "absolute", left: 0, top: 920, width: 1080, textAlign: "center", opacity: 1 - mv, transform: `scale(${pop(f, F(1.9))})` }}>
          <span style={{ display: "inline-block", background: A2.coral, color: "#fff", ...B, fontSize: 52, padding: "12px 40px", borderRadius: 999 }}>飛行機に乗らなくても</span>
        </div>
      ) : null}
      <In at={F(3.16)} style={{ left: 80, top: 470 }}>
        <Card style={{ padding: 20 }}><GenSlot name="mile_receipt" size={300} label="生活費" /></Card>
      </In>
      <Arrow x={440} y={640} w={180} at={F(4.08)} label="貯まる" />
      <In at={F(4.08)} style={{ left: 0, top: 930, width: 1080, textAlign: "center" }}>
        <div style={{ ...B, fontSize: 66, color: A2.ink }}>普段の<Mark2 delay={F(4.08) + 4}>生活費</Mark2>から貯まる</div>
      </In>
    </AbsoluteFill>
  );
};

// ── ② 貯まる仕組み：縦のフロー（1枚キャンバス＋カメラ）5.12–19.72 ──
const Step: React.FC<{ top: number; h: number; n: number; at: number; title: React.ReactNode; children: React.ReactNode }> = ({ top, h, n, at, title, children }) => (
  <In at={at} style={{ left: 70, top, width: 940 }}>
    <Card style={{ position: "relative", height: h, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 32, top: 26, display: "flex", alignItems: "center", gap: 18 }}>
        {/* G16：2トーンの番号 */}
        <div style={{ width: 60, height: 60, borderRadius: "50%", background: A2.green, color: "#fff", ...B, fontSize: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>{n}</div>
        <div style={{ ...B, fontSize: 42, color: A2.ink }}>{title}</div>
      </div>
      {children}
    </Card>
  </In>
);
const Chevron: React.FC<{ y: number; at: number }> = ({ y, at }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  return <div style={{ position: "absolute", left: 510, top: y - 18, width: 0, height: 0, borderLeft: "30px solid transparent", borderRight: "30px solid transparent", borderTop: `30px solid ${A2.green}`, opacity: interpolate(f - at, [0, 5], [0, 1], clamp) }} />;
};

const PILLS = ["食費", "光熱費", "通信費", "日用品"];
const SceneB: React.FC = () => {
  const f = useCurrentFrame();
  const a = F(5.12);
  const lv = useLeave(F(19.72));
  if (f < a || lv.gone) return null;
  const cam =
    f < F(11.02) ? 0 :
    f < F(13.98) ? interpolate(f, [F(11.02), F(11.02) + 14], [0, 260], io) :
    f < F(15.44) ? interpolate(f, [F(13.98), F(13.98) + 14], [260, 680], io) :
    f < F(16.96) ? interpolate(f, [F(15.44), F(15.44) + 14], [680, 1000], io) :
    interpolate(f, [F(16.96), F(16.96) + 14], [1000, 1440], io);
  const merge = F(7.88) + 8;
  const mg = interpolate(f, [merge, merge + 10], [0, 1], io);
  const big = F(12.52);
  const price = interpolate(f, [F(18.4), F(18.4) + 10], [0, 1], io);
  return (
    <AbsoluteFill style={{ ...lv.style, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 2700, transform: `translateY(${-cam}px)` }}>
        {/* 1 生活費をクレカでまとめる */}
        <Step top={430} h={330} n={1} at={F(6.58)} title="生活費をクレカでまとめる">
          {PILLS.map((p, i) => {
            const at = F(6.84) + i * 3;
            if (f < at) return null;
            const x = 40 + (i % 2) * 196, y = 120 + Math.floor(i / 2) * 80;
            const dx = (700 - (x + 90)) * mg, dy = (200 - (y + 32)) * mg;
            return (
              <div key={p} style={{ position: "absolute", left: x, top: y, width: 180, height: 64, borderRadius: 999, background: A2.track, ...B, fontSize: 32, color: A2.ink, display: "flex", alignItems: "center", justifyContent: "center", transform: `translate(${dx}px, ${dy}px) scale(${pop(f, at) * (1 - mg * 0.7)})`, opacity: 1 - mg }}>{p}</div>
            );
          })}
          {f >= merge + 6 ? <div style={{ position: "absolute", left: 50, top: 160, ...B, fontSize: 50, color: A2.ink, opacity: interpolate(f, [merge + 6, merge + 12], [0, 1], clamp) }}><Mark2 delay={merge + 8}>1枚</Mark2>にまとめる</div> : null}
          <Arrow x={420} y={200} w={150} at={F(7.88)} />
          {f >= F(7.88) ? <div style={{ position: "absolute", left: 600, top: 100, transform: `scale(${pop(f, F(7.88)) * (1 + 0.08 * Math.sin(Math.min(1, mg) * Math.PI))})` }}><GenSlot name="mile_card" size={210} label="クレカ" /></div> : null}
        </Step>
        <Chevron y={790} at={F(8.78)} />
        {/* 2 入会キャンペーンの条件を達成 */}
        <Step top={820} h={300} n={2} at={F(8.78)} title="入会キャンペーンの条件を達成">
          {f >= F(9.08) ? <div style={{ position: "absolute", left: 40, top: 100, transform: `scale(${pop(f, F(9.08))})` }}><GenSlot name="mile_gift" size={180} label="特典" /></div> : null}
          <div style={{ position: "absolute", left: 270, top: 150, display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ width: 56, height: 56, borderRadius: 12, border: `5px solid ${A2.green}`, background: "#fff", ...B, fontSize: 46, color: A2.green, lineHeight: "50px", textAlign: "center" }}>{f >= F(10.32) ? "✓" : ""}</div>
            <div style={{ ...B, fontSize: 44, color: f >= F(10.32) ? A2.ink : A2.sub }}>利用条件</div>
          </div>
          {f >= F(10.48) ? (
            <div style={{ position: "absolute", left: 620, top: 110, transform: `rotate(-8deg) scale(${interpolate(f - F(10.48), [0, 4, 7], [1.8, 0.92, 1], clamp)})`, opacity: interpolate(f - F(10.48), [0, 3], [0, 1], clamp), border: `7px solid ${A2.coral}`, borderRadius: 20, padding: "10px 26px", ...B, fontSize: 64, color: A2.coral }}>達成！</div>
          ) : null}
        </Step>
        <Chevron y={1150} at={F(11.02)} />
        {/* 3 まとまったポイントがもらえる */}
        <Step top={1180} h={360} n={3} at={F(11.02)} title="まとまったポイントがもらえる">
          <div style={{ position: "absolute", left: 90, top: 290 - interpolate(f, [F(11.3), F(11.3) + 8], [0, 60], out), width: 160, height: interpolate(f, [F(11.3), F(11.3) + 8], [0, 60], out), background: A2.bar, borderRadius: "12px 12px 0 0" }} />
          <div style={{ position: "absolute", left: 40, top: 300, width: 260, textAlign: "center", ...B, fontSize: 28, color: A2.sub }}>通常の利用分</div>
          {f >= F(11.96) ? <div style={{ position: "absolute", left: 320, top: 180, ...B, fontSize: 80, color: A2.ink, transform: `scale(${pop(f, F(11.96))})` }}>＋</div> : null}
          <div style={{ position: "absolute", left: 450, top: 290 - interpolate(f, [big, big + 10], [0, 170], out), width: 200, height: interpolate(f, [big, big + 10], [0, 170], out), background: A2.marker, borderRadius: "12px 12px 0 0" }} />
          {f >= big ? <div style={{ position: "absolute", left: 400, top: 300, width: 300, textAlign: "center", ...B, fontSize: 28, color: A2.ink }}>まとまったポイント</div> : null}
          {f >= big + 4 ? <div style={{ position: "absolute", left: 710, top: 110, transform: `scale(${pop(f, big + 4)})` }}><GenSlot name="mile_coins" size={190} label="ポイント" /></div> : null}
        </Step>
        <Chevron y={1570} at={F(13.98)} />
        {/* 4 ポイントをマイルに交換 */}
        <Step top={1600} h={270} n={4} at={F(13.7)} title="ポイントをマイルに交換">
          <div style={{ position: "absolute", left: 140, top: 100 }}><GenSlot name="mile_coins" size={150} /></div>
          <Arrow x={330} y={175} w={230} at={F(14.9)} label="交換" />
          {f >= F(14.9) + 6 ? <div style={{ position: "absolute", left: 590, top: 100, transform: `scale(${pop(f, F(14.9) + 6)})` }}><GenSlot name="mile_plane" size={150} /></div> : null}
          {f >= F(14.9) + 8 ? <div style={{ position: "absolute", left: 760, top: 145, ...B, fontSize: 50, color: A2.green }}>マイル</div> : null}
        </Step>
        <Chevron y={1895} at={F(15.44)} />
        {/* 5 航空券を予約 */}
        <Step top={1920} h={270} n={5} at={F(15.44)} title="航空券を予約">
          {f >= F(15.76) ? <div style={{ position: "absolute", left: 140, top: 100, transform: `scale(${pop(f, F(15.76))})` }}><GenSlot name="mile_ticket" size={160} label="航空券" /></div> : null}
          {f >= F(16.18) ? <div style={{ position: "absolute", left: 360, top: 145, ...B, fontSize: 50, color: A2.ink, opacity: interpolate(f - F(16.18), [0, 6], [0, 1], clamp) }}><span style={{ color: A2.green }}>マイル</span>で予約</div> : null}
        </Step>
        <Chevron y={2195} at={F(16.96)} />
        {/* 6 家族旅行の飛行機代を大きく抑える */}
        <Step top={2220} h={420} n={6} at={F(16.96)} title="家族旅行の飛行機代を大きく抑える">
          {f >= F(17.2) ? <div style={{ position: "absolute", left: 30, top: 110, transform: `scale(${pop(f, F(17.2))})` }}><GenSlot name="mile_family_happy" size={280} label="家族" /></div> : null}
          <div style={{ position: "absolute", left: 350, top: 135, ...B, fontSize: 34, color: A2.sub }}>飛行機代</div>
          <div style={{ position: "absolute", left: 350, top: 190, height: 70, borderRadius: 14, background: price > 0.5 ? A2.green : A2.coral, width: interpolate(f, [F(17.7), F(17.7) + 10], [0, 540], out) * (1 - price * 0.68) }} />
          {f >= F(18.4) + 4 ? (
            <div style={{ position: "absolute", left: 350, top: 295, transform: `scale(${pop(f, F(18.4) + 4)})`, transformOrigin: "left center" }}>
              <span style={{ display: "inline-block", background: A2.coral, color: "#fff", ...B, fontSize: 46, padding: "10px 32px", borderRadius: 999 }}>大きく抑えられる</span>
            </div>
          ) : null}
        </Step>
      </div>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 420, background: `linear-gradient(${A2.bg} 78%, rgba(251,246,216,0))` }} />
      <Head text={<>どうやって<span style={{ color: A2.green }}>貯める</span>？</>} from={a} />
    </AbsoluteFill>
  );
};

// ── ③ 利用条件のハードル（19.72–35.32）──
const MONTHS = 6;
const SceneC1: React.FC = () => {
  const f = useCurrentFrame();
  const lv = useLeave(F(25.74));
  if (lv.gone) return null;
  const n = Math.round(interpolate(f, [F(23.2), F(23.2) + 10], [0, 100], out));
  const per = F(24.6);
  return (
    <AbsoluteFill style={lv.style}>
      <In at={F(20.72)} style={{ left: 80, top: 450 }}><Card style={{ padding: 20 }}><GenSlot name="mile_calendar" size={260} label="半年" /></Card></In>
      <In at={F(22.24)} style={{ left: 430, top: 460 }}><div style={{ ...B, fontSize: 36, color: A2.sub }}>例えば</div></In>
      <In at={F(22.6)} style={{ left: 430, top: 515 }}><div style={{ ...B, fontSize: 58, color: A2.ink }}>半年で</div></In>
      {f >= F(23.2) ? (
        <div style={{ position: "absolute", left: 420, top: 585, ...B, color: A2.green, whiteSpace: "nowrap", transform: `scale(${pop(f, F(23.2))})`, transformOrigin: "left center" }}>
          <span style={{ fontSize: 150, letterSpacing: -4 }}>{n}</span><span style={{ fontSize: 70, color: A2.ink }}>万円</span>
        </div>
      ) : null}
      {Array.from({ length: MONTHS }).map((_, i) => {
        const at = F(23.76) + i * 3;
        return (
          <In key={i} at={at} style={{ left: 88 + i * 153, top: 830, width: 140 }}>
            <Card style={{ height: 150, borderRadius: 20, textAlign: "center", paddingTop: 18, boxSizing: "border-box" }}>
              <div style={{ ...B, fontSize: 26, color: A2.sub }}>{i + 1}ヶ月目</div>
              {f >= per + i * 2 ? <div style={{ ...B, fontSize: 34, color: A2.ink, marginTop: 14, transform: `scale(${pop(f, per + i * 2)})` }}>約17万</div> : null}
            </Card>
          </In>
        );
      })}
      {f >= per + 12 ? (
        <div style={{ position: "absolute", left: 0, top: 1020, width: 1080, textAlign: "center", ...B, color: A2.ink, transform: `scale(${pop(f, per + 12)})` }}>
          <span style={{ fontSize: 58 }}>月 約</span><span style={{ fontSize: 120, color: A2.coral }}>17</span><span style={{ fontSize: 58 }}>万円</span>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

const SceneC2: React.FC = () => {
  const f = useCurrentFrame();
  const a = F(25.74);
  const lv = useLeave(F(30.02));
  if (f < a || lv.gone) return null;
  const st = F(29.46);
  return (
    <AbsoluteFill style={lv.style}>
      <In at={a} style={{ left: 0, top: 425, width: 1080, textAlign: "center" }}>
        <span style={{ display: "inline-block", background: A2.track, ...B, fontSize: 38, color: A2.ink, padding: "8px 30px", borderRadius: 999 }}>月 約17万円</span>
      </In>
      <In at={F(25.94)} style={{ left: 80, top: 530, width: 440 }}>
        <Card style={{ padding: "24px 0", textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center" }}><GenSlot name="mile_house" size={240} label="固定費" /></div>
          <div style={{ ...B, fontSize: 42, color: A2.ink, marginTop: 12 }}>毎月の<Mark2 delay={F(26.6)}>固定費</Mark2></div>
          <div style={{ ...B, fontSize: 30, color: A2.sub, marginTop: 4 }}>をまとめる</div>
        </Card>
      </In>
      <In at={F(27.64)} style={{ left: 560, top: 530, width: 440 }}>
        <Card style={{ padding: "24px 0", textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center" }}><GenSlot name="mile_cart" size={240} label="大きな買い物" /></div>
          <div style={{ ...B, fontSize: 42, color: A2.ink, marginTop: 12 }}><Mark2 delay={F(28.08)}>大きな出費</Mark2></div>
          <div style={{ ...B, fontSize: 30, color: A2.sub, marginTop: 4 }}>があれば</div>
        </Card>
      </In>
      {f >= st ? (
        <div style={{ position: "absolute", left: 0, top: 990, width: 1080, display: "flex", justifyContent: "center" }}>
          <div style={{ transform: `rotate(-4deg) scale(${interpolate(f - st, [0, 4, 7], [1.8, 0.92, 1], clamp)})`, opacity: interpolate(f - st, [0, 3], [0, 1], clamp), background: "#fff", border: `8px solid ${A2.coral}`, borderRadius: 26, padding: "14px 44px", ...B, fontSize: 84, color: A2.coral }}>むしろチャンス</div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

const SceneC3: React.FC = () => {
  const f = useCurrentFrame();
  const a = F(30.02);
  if (f < a) return null;
  const many = F(33.34);
  return (
    <AbsoluteFill>
      <Head text={<>効率よく<span style={{ color: A2.green }}>達成</span>する方法</>} from={a + 7} />
      {[0, 1, 2].map((i) => {
        const at = F(31.48) + i * 5;
        const wob = f >= many ? Math.sin((f - many - i * 3) / 2.2) * interpolate(f - many - i * 3, [0, 4, 14], [0, 6, 0], clamp) : 0;
        return (
          <In key={i} at={at} style={{ left: 80 + i * 315, top: 470, width: 290 }}>
            <Card style={{ height: 320, textAlign: "center", paddingTop: 34, boxSizing: "border-box", transform: `rotate(${wob}deg)` }}>
              <div style={{ width: 170, height: 170, margin: "0 auto", borderRadius: "50%", background: A2.track, ...B, fontSize: 120, lineHeight: "170px", color: A2.green }}>?</div>
              <div style={{ ...B, fontSize: 38, color: A2.ink, marginTop: 20 }}>方法{["①", "②", "③"][i]}</div>
            </Card>
          </In>
        );
      })}
      {f >= many ? <div style={{ position: "absolute", left: 0, top: 815, width: 1080, textAlign: "center", ...B, fontSize: 44, color: A2.sub, opacity: interpolate(f - many, [0, 6], [0, 1], clamp) }}>…いくつもある</div> : null}
      {f >= F(34.16) ? (
        <div style={{ position: "absolute", left: 0, top: 900, width: 1080, display: "flex", justifyContent: "center", alignItems: "center", gap: 30, transform: `scale(${pop(f, F(34.16))})` }}>
          <Card style={{ padding: 14 }}><GenSlot name="mile_phone_dm" size={200} label="DM" /></Card>
          <span style={{ display: "inline-block", background: A2.coral, color: "#fff", ...B, fontSize: 64, padding: "12px 44px", borderRadius: 999 }}>DMで</span>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

const SceneC: React.FC = () => {
  const f = useCurrentFrame();
  if (f < F(19.72)) return null;
  const lv = interpolate(f, [F(30.02), F(30.02) + 6], [1, 0], clamp);
  return (
    <AbsoluteFill>
      {f < F(30.02) + 8 ? <div style={{ opacity: lv }}><Head text={<>キャンペーンの<span style={{ color: A2.green }}>利用条件</span></>} from={F(19.72)} /></div> : null}
      <SceneC1 />
      <SceneC2 />
      <SceneC3 />
    </AbsoluteFill>
  );
};

const SUBS: [number, string][] = [
  [0.0, "その方法が"], [0.86, "マイルの活用です"], [1.56, "実は"], [1.9, "飛行機に乗らなくても"], [3.0, "普段の生活費から"], [4.08, "貯めることができます"],
  [5.12, "では、どうやって貯めるのか"], [6.58, "まず、普段の生活費を"], [7.88, "クレカでまとめます"], [8.78, "そして、入会キャンペーンの"], [10.0, "条件を達成すると"],
  [11.02, "通常の利用分に加えて"], [12.52, "まとまったポイントがもらえる"], [13.7, "そのポイントをマイルに交換して"], [15.44, "航空券を予約することで"],
  [16.96, "家族旅行の飛行機代を"], [18.4, "大きく抑えることができます"],
  [19.72, "ただ、キャンペーンには"], [20.72, "一定の利用条件があって"], [22.24, "例えば、半年で100万円"], [23.76, "月にすると"], [24.4, "約17万円くらい"],
  [25.74, "家族の毎月の固定費をまとめたり"], [27.64, "大きな出費があれば"], [28.78, "むしろそれはチャンスです"],
  [30.02, "実は、他にも効率よく"], [31.48, "利用条件を達成する方法が"], [33.34, "いくつもあるので"], [34.16, "気になる方はDMで"],
];

const CUES: { file: string; at: number; volume: number }[] = [
  { file: "user/u02s", at: F(0.86), volume: 0.32 },
  { file: "user/u02s", at: F(1.9), volume: 0.26 },
  { file: "user/u03s", at: F(3.16), volume: 0.26 },
  { file: "user/u03s", at: F(5.12), volume: 0.3 },
  { file: "user/u02s", at: F(6.58), volume: 0.26 },
  { file: "user/u05s", at: F(7.88) + 8, volume: 0.3 },
  { file: "user/u02s", at: F(8.78), volume: 0.26 },
  { file: "user/u05s", at: F(10.48), volume: 0.32 },
  { file: "user/u02s", at: F(11.02), volume: 0.26 },
  { file: "user/u05", at: F(12.52), volume: 0.28 },
  { file: "user/u02s", at: F(13.7), volume: 0.26 },
  { file: "user/u05s", at: F(14.9), volume: 0.28 },
  { file: "user/u02s", at: F(15.44), volume: 0.26 },
  { file: "user/u02s", at: F(16.96), volume: 0.26 },
  { file: "user/u05", at: F(18.4), volume: 0.3 },
  { file: "user/u03", at: F(19.72), volume: 0.3 },
  { file: "user/u02s", at: F(23.2), volume: 0.3 },
  { file: "user/u05s", at: F(24.6) + 12, volume: 0.3 },
  { file: "user/u03s", at: F(25.74), volume: 0.26 },
  { file: "user/u02s", at: F(27.64), volume: 0.26 },
  { file: "user/u05", at: F(29.46), volume: 0.34 },
  { file: "user/u03", at: F(30.02), volume: 0.3 },
  ...[0, 1, 2].map((i) => ({ file: "user/u02s", at: F(31.48) + i * 5, volume: 0.22 })),
  { file: "user/u05s", at: F(34.16), volume: 0.3 },
];

export const Mile123: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: A2.bg, fontFamily: FONT }}>
    <Audio src={staticFile("mile-narration.wav")} />
    <SfxTrack cues={CUES} />
    <SceneA />
    <SceneB />
    <SubFade />
    <SceneC />
    <MarkerSub subs={SUBS} start={0} end={35.32} />
  </AbsoluteFill>
);

export const MILE_Z_FRAMES = PART4 + MILE_LC_FRAMES;
export const MileZukai: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: A2.bg }}>
    <Sequence durationInFrames={PART4}><Mile123 /></Sequence>
    <Sequence from={PART4}><MileLifeChart /></Sequence>
  </AbsoluteFill>
);
