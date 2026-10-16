import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, interpolate, Easing } from "remotion";
import { A2, Mark2 } from "./components/kit2";
import { FONT } from "./components/font";
import { SfxTrack } from "./components/sfx";
import { R } from "./mileTime";
import { B, GenSlot, In, Head, MarkerSub, SubFade } from "./MileLifePlan";
import { MileLifeChart, MILE_LC_FRAMES } from "./MileLifeChart";

// ════════════════════════════════════════════════════════════════════
//  マイル図解パート 通し（①〜④）。見た目＝三大原則（薄黄×白カード×生成イラスト）
//  ① マイルとは（0–5.12）  ② 貯まる仕組み＝1本の太い線をコマが進む＋カメラ（5.12–19.72）
//  ③ 半年100万のハードル→チャンス→他にも方法（19.72–35.32）  ④ ライフプラン＝MileLifeChart 横軸版（35.32–）※縦版は MileLifePlan
//  画像は GenSlot（public/gen に置いて `node scripts/gen-manifest.mjs`）
// ════════════════════════════════════════════════════════════════════

const F = (t: number) => Math.round(R(t) * 30); // t＝旧ナレの秒 → 新ナレのフレーム
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

// 画像は背景に直置き（カードで囲まない）。足元にやわらかい影だけ付けて存在感を出す
const Free: React.FC<{ name: string; size: number; label?: string; bob?: boolean }> = ({ name, size, label, bob }) => {
  const f = useCurrentFrame();
  const y = bob ? Math.sin(f / 9) * 8 : 0; // C4：ゆっくり上下
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <div style={{ position: "absolute", left: size * 0.18, right: size * 0.18, bottom: -size * 0.03, height: size * 0.09, borderRadius: "50%", background: "rgba(80,60,20,0.13)", filter: "blur(6px)", transform: `scaleX(${1 - y / 80})` }} />
      <div style={{ position: "relative", transform: `translateY(${y}px)` }}><GenSlot name={name} size={size} label={label} /></div>
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
        <div style={{ position: "absolute", left: 360 + mv * 290, top: 450 + mv * 40, transform: `scale(${pop(f, pAt) * (1 - mv * 0.18)})`, transformOrigin: "0 0" }}>
          <Free name="mile_plane" size={360} label="飛行機" bob />
        </div>
      ) : null}
      {f >= F(1.9) ? (
        <div style={{ position: "absolute", left: 0, top: 900, width: 1080, textAlign: "center", opacity: 1 - mv, transform: `scale(${pop(f, F(1.9))})` }}>
          <span style={{ display: "inline-block", background: A2.coral, color: "#fff", ...B, fontSize: 52, padding: "12px 40px", borderRadius: 999 }}>飛行機に乗らなくても</span>
        </div>
      ) : null}
      <In at={F(3.16)} style={{ left: 90, top: 480 }}><Free name="mile_receipt" size={300} label="生活費" /></In>
      <Arrow x={415} y={640} w={210} at={F(4.08)} label="貯まる" />
      <In at={F(4.08)} style={{ left: 0, top: 930, width: 1080, textAlign: "center" }}>
        <div style={{ ...B, fontSize: 66, color: A2.ink }}>普段の<Mark2 delay={F(4.08) + 4}>生活費</Mark2>から貯まる</div>
      </In>
    </AbsoluteFill>
  );
};

// ── ② 貯まる仕組み：1本の太い線（すごろく）を順に進む＋カメラ 5.12–19.72 ──
const SPINE = 130;
const ST = [480, 880, 1290, 1740, 2070, 2400]; // 各ステップ（見出し中心）のキャンバスy
const ST_AT = [F(6.58), F(8.78), F(11.02), F(13.7), F(15.44), F(16.96)];
const StepHead: React.FC<{ i: number; title: React.ReactNode }> = ({ i, title }) => {
  const f = useCurrentFrame();
  const at = ST_AT[i];
  if (f < at) return null;
  const y = ST[i];
  return (
    <>
      <div style={{ position: "absolute", left: SPINE - 36, top: y - 36, width: 72, height: 72, borderRadius: "50%", background: A2.green, border: "6px solid #fff", boxSizing: "border-box", color: "#fff", ...B, fontSize: 38, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${pop(f, at)})`, boxShadow: "0 4px 10px rgba(80,60,20,0.15)", zIndex: 3 }}>{i + 1}</div>
      <div style={{ position: "absolute", left: 220, top: y - 32, ...B, fontSize: 48, color: A2.ink, whiteSpace: "nowrap", opacity: interpolate(f - at, [0, 6], [0, 1], clamp), transform: `translateX(${interpolate(f - at, [0, 8], [-30, 0], out)}px)` }}>{title}</div>
    </>
  );
};

const PILLS = ["食費", "光熱費", "通信費", "日用品"];
const SceneB: React.FC = () => {
  const f = useCurrentFrame();
  const a = F(5.12);
  const lv = useLeave(F(19.72));
  if (f < a || lv.gone) return null;
  const cam =
    f < F(11.02) ? 0 :
    f < F(13.7) ? interpolate(f, [F(11.02), F(11.02) + 14], [0, 730], io) :
    f < F(16.96) ? interpolate(f, [F(13.7), F(13.7) + 14], [730, 1180], io) :
    interpolate(f, [F(16.96), F(16.96) + 14], [1180, 1880], io);
  // 進んだ位置（線の上を進むコマ）
  let trav = ST[0];
  ST_AT.forEach((t, i) => { if (i > 0) trav += interpolate(f, [t - 2, t + 12], [0, ST[i] - ST[i - 1]], io); });
  const S = ST;
  const merge = F(7.88) + 8;
  const mg = interpolate(f, [merge, merge + 10], [0, 1], io);
  const big = F(12.52);
  const price = interpolate(f, [F(18.4), F(18.4) + 10], [0, 1], io);
  return (
    <AbsoluteFill style={{ ...lv.style, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 2900, transform: `translateY(${-cam}px)` }}>
        {/* 太い線（道）＋進んだぶんが緑に */}
        <div style={{ position: "absolute", left: SPINE - 11, top: S[0], width: 22, height: interpolate(f, [ST_AT[0], ST_AT[0] + 20], [0, S[5] - S[0]], out), background: A2.track, borderRadius: 11 }} />
        <div style={{ position: "absolute", left: SPINE - 11, top: S[0], width: 22, height: trav - S[0], background: A2.green, borderRadius: 11 }} />
        {f >= ST_AT[0] ? <div style={{ position: "absolute", left: SPINE - 24, top: trav - 24, width: 48, height: 48, borderRadius: "50%", background: A2.marker, border: "6px solid #E6C63E", boxSizing: "border-box", zIndex: 2, boxShadow: "0 6px 14px rgba(80,60,20,0.2)" }} /> : null}

        <StepHead i={0} title={<>生活費を<span style={{ color: A2.green }}>クレカ</span>でまとめる</>} />
        {PILLS.map((p, i) => {
          const at = F(6.84) + i * 3;
          if (f < at) return null;
          const x = 230 + (i % 2) * 196, y = S[0] + 70 + Math.floor(i / 2) * 80;
          const dx = (895 - (x + 90)) * mg, dy = (S[0] + 145 - (y + 32)) * mg;
          return <div key={p} style={{ position: "absolute", left: x, top: y, width: 180, height: 64, borderRadius: 999, background: "#fff", border: `3px solid ${A2.bar}`, ...B, fontSize: 32, color: A2.ink, display: "flex", alignItems: "center", justifyContent: "center", transform: `translate(${dx}px, ${dy}px) scale(${pop(f, at) * (1 - mg * 0.7)})`, opacity: 1 - mg }}>{p}</div>;
        })}
        {f >= merge + 6 ? <div style={{ position: "absolute", left: 240, top: S[0] + 105, ...B, fontSize: 56, color: A2.ink, opacity: interpolate(f, [merge + 6, merge + 12], [0, 1], clamp) }}><Mark2 delay={merge + 8}>1枚</Mark2>にまとめる</div> : null}
        <Arrow x={640} y={S[0] + 150} w={130} at={F(7.88)} />
        {f >= F(7.88) ? <div style={{ position: "absolute", left: 790, top: S[0] + 40, transform: `scale(${pop(f, F(7.88)) * (1 + 0.1 * Math.sin(mg * Math.PI))})` }}><Free name="mile_card" size={210} label="クレカ" /></div> : null}

        <StepHead i={1} title={<>入会キャンペーンの<span style={{ color: A2.green }}>条件</span>を達成</>} />
        {f >= F(9.08) ? <div style={{ position: "absolute", left: 230, top: S[1] + 50, transform: `scale(${pop(f, F(9.08))})` }}><Free name="mile_gift" size={200} label="特典" /></div> : null}
        {f >= F(9.08) ? (
          <div style={{ position: "absolute", left: 480, top: S[1] + 120, display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ width: 60, height: 60, borderRadius: 12, border: `5px solid ${A2.green}`, background: "#fff", ...B, fontSize: 48, color: A2.green, lineHeight: "52px", textAlign: "center" }}>{f >= F(10.32) ? "✓" : ""}</div>
            <div style={{ ...B, fontSize: 46, color: f >= F(10.32) ? A2.ink : A2.sub }}>利用条件</div>
          </div>
        ) : null}
        {f >= F(10.48) ? <div style={{ position: "absolute", left: 790, top: S[1] + 60, transform: `rotate(-8deg) scale(${interpolate(f - F(10.48), [0, 4, 7], [1.8, 0.92, 1], clamp)})`, opacity: interpolate(f - F(10.48), [0, 3], [0, 1], clamp), border: `7px solid ${A2.coral}`, borderRadius: 20, padding: "8px 22px", ...B, fontSize: 60, color: A2.coral, background: A2.bg }}>達成！</div> : null}

        <StepHead i={2} title={<><span style={{ color: A2.green }}>まとまった</span>ポイントがもらえる</>} />
        <div style={{ position: "absolute", left: 250, top: S[2] + 260 - interpolate(f, [F(11.3), F(11.3) + 8], [0, 60], out), width: 160, height: interpolate(f, [F(11.3), F(11.3) + 8], [0, 60], out), background: A2.bar, borderRadius: "12px 12px 0 0" }} />
        {f >= F(11.3) ? <div style={{ position: "absolute", left: 200, top: S[2] + 272, width: 260, textAlign: "center", ...B, fontSize: 30, color: A2.sub }}>通常の利用分</div> : null}
        {f >= F(11.96) ? <div style={{ position: "absolute", left: 460, top: S[2] + 140, ...B, fontSize: 84, color: A2.ink, transform: `scale(${pop(f, F(11.96))})` }}>＋</div> : null}
        <div style={{ position: "absolute", left: 570, top: S[2] + 260 - interpolate(f, [big, big + 10], [0, 190], out), width: 200, height: interpolate(f, [big, big + 10], [0, 190], out), background: A2.marker, borderRadius: "12px 12px 0 0" }} />
        {f >= big ? <div style={{ position: "absolute", left: 520, top: S[2] + 272, width: 300, textAlign: "center", ...B, fontSize: 30, color: A2.ink }}>まとまったポイント</div> : null}
        {f >= big + 4 ? <div style={{ position: "absolute", left: 800, top: S[2] + 50, transform: `scale(${pop(f, big + 4)})` }}><Free name="mile_coins" size={220} label="ポイント" /></div> : null}
        {/* 下の線（地面） */}
        {f >= F(11.3) ? <div style={{ position: "absolute", left: 220, top: S[2] + 260, width: 580, height: 5, borderRadius: 3, background: A2.ink, opacity: 0.6 }} /> : null}

        <StepHead i={3} title={<>ポイントを<span style={{ color: A2.green }}>マイル</span>に交換</>} />
        {f >= F(13.98) ? <div style={{ position: "absolute", left: 240, top: S[3] + 50, transform: `scale(${pop(f, F(13.98))})` }}><Free name="mile_coins" size={190} /></div> : null}
        <Arrow x={430} y={S[3] + 130} w={220} at={F(14.9)} label="交換" />
        {f >= F(14.9) + 6 ? <div style={{ position: "absolute", left: 650, top: S[3] + 30, transform: `scale(${pop(f, F(14.9) + 6)})` }}><Free name="mile_plane" size={200} bob /></div> : null}
        {f >= F(14.9) + 8 ? <div style={{ position: "absolute", left: 855, top: S[3] + 100, ...B, fontSize: 52, color: A2.green }}>マイル</div> : null}

        <StepHead i={4} title={<><span style={{ color: A2.green }}>航空券</span>を予約</>} />
        {f >= F(15.76) ? <div style={{ position: "absolute", left: 240, top: S[4] + 45, transform: `scale(${pop(f, F(15.76))})` }}><Free name="mile_ticket" size={200} label="航空券" /></div> : null}
        {f >= F(16.18) ? <div style={{ position: "absolute", left: 460, top: S[4] + 100, ...B, fontSize: 52, color: A2.ink, opacity: interpolate(f - F(16.18), [0, 6], [0, 1], clamp) }}><span style={{ color: A2.green }}>マイル</span>で予約</div> : null}

        <StepHead i={5} title={<>家族旅行の<span style={{ color: A2.green }}>飛行機代</span>を大きく抑える</>} />
        {f >= F(17.2) ? <div style={{ position: "absolute", left: 200, top: S[5] + 40, transform: `scale(${pop(f, F(17.2))})` }}><Free name="mile_family_happy" size={330} label="家族" /></div> : null}
        {f >= F(17.7) ? <div style={{ position: "absolute", left: 560, top: S[5] + 80, ...B, fontSize: 36, color: A2.sub }}>飛行機代</div> : null}
        <div style={{ position: "absolute", left: 560, top: S[5] + 135, height: 76, borderRadius: 16, background: price > 0.5 ? A2.green : A2.coral, width: interpolate(f, [F(17.7), F(17.7) + 10], [0, 420], out) * (1 - price * 0.66) }} />
        {f >= F(18.4) ? <div style={{ position: "absolute", left: 560 + 420 * 0.34 + 10, top: S[5] + 135, width: 420 * 0.66 - 10, height: 76, borderRadius: 16, border: `4px dashed ${A2.coral}`, boxSizing: "border-box", opacity: price * 0.8 }} /> : null}
        {f >= F(18.4) + 4 ? (
          <div style={{ position: "absolute", left: 560, top: S[5] + 240, transform: `scale(${pop(f, F(18.4) + 4)})`, transformOrigin: "left center" }}>
            <span style={{ display: "inline-block", background: A2.coral, color: "#fff", ...B, fontSize: 46, padding: "10px 32px", borderRadius: 999 }}>大きく抑えられる</span>
          </div>
        ) : null}
      </div>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 440, background: `linear-gradient(${A2.bg} 86%, rgba(251,246,216,0))` }} />
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
  const barAt = F(23.2) + 4, cut = F(23.76), per = F(24.6);
  const bw = interpolate(f, [barAt, barAt + 10], [0, 900], io);
  return (
    <AbsoluteFill style={lv.style}>
      <In at={F(20.72)} style={{ left: 60, top: 430 }}><Free name="mile_calendar" size={300} label="半年" /></In>
      <In at={F(22.24)} style={{ left: 430, top: 460 }}><div style={{ ...B, fontSize: 36, color: A2.sub }}>例えば</div></In>
      <In at={F(22.6)} style={{ left: 430, top: 515 }}><div style={{ ...B, fontSize: 58, color: A2.ink }}>半年で</div></In>
      {f >= F(23.2) ? (
        <div style={{ position: "absolute", left: 420, top: 585, ...B, color: A2.green, whiteSpace: "nowrap", transform: `scale(${pop(f, F(23.2))})`, transformOrigin: "left center" }}>
          <span style={{ fontSize: 150, letterSpacing: -4 }}>{n}</span><span style={{ fontSize: 70, color: A2.ink }}>万円</span>
        </div>
      ) : null}
      {/* 100万円の1本バー → 6つに割れる */}
      {f >= cut ? <div style={{ position: "absolute", left: 90, top: 800, ...B, fontSize: 32, color: A2.sub, opacity: interpolate(f - cut, [0, 6], [0, 1], clamp) }}>月にすると…</div> : null}
      <div style={{ position: "absolute", left: 90, top: 860, width: bw, height: 110, borderRadius: 22, background: A2.green, overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", ...B, fontSize: 56, color: "#fff", opacity: interpolate(f, [barAt + 4, barAt + 8, cut + 2, cut + 8], [0, 1, 1, 0], clamp) }}>100万円</div>
        {Array.from({ length: MONTHS - 1 }).map((_, k) => (
          <div key={k} style={{ position: "absolute", left: 150 * (k + 1) - 4, top: 0, width: 8, height: 110, background: A2.bg, transform: `scaleY(${interpolate(f, [cut + k * 3, cut + k * 3 + 6], [0, 1], out)})` }} />
        ))}
        {Array.from({ length: MONTHS }).map((_, i) => f >= per + i * 2 ? (
          <div key={i} style={{ position: "absolute", left: 150 * i, top: 0, width: 150, height: 110, display: "flex", alignItems: "center", justifyContent: "center", ...B, fontSize: 32, color: "#fff", transform: `scale(${pop(f, per + i * 2)})` }}>約17万</div>
        ) : null)}
      </div>
      {f >= per + 12 ? (
        <div style={{ position: "absolute", left: 0, top: 1010, width: 1080, textAlign: "center", ...B, color: A2.ink, transform: `scale(${pop(f, per + 12)})` }}>
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
      <In at={F(25.94)} style={{ left: 60, top: 530, width: 460, textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center" }}><Free name="mile_house" size={280} label="固定費" /></div>
        <div style={{ ...B, fontSize: 46, color: A2.ink, marginTop: 18 }}>毎月の<Mark2 delay={F(26.6)}>固定費</Mark2></div>
        <div style={{ ...B, fontSize: 32, color: A2.sub, marginTop: 2 }}>をまとめる</div>
      </In>
      <In at={F(27.64)} style={{ left: 560, top: 530, width: 460, textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center" }}><Free name="mile_cart" size={280} label="大きな買い物" /></div>
        <div style={{ ...B, fontSize: 46, color: A2.ink, marginTop: 18 }}><Mark2 delay={F(28.08)}>大きな出費</Mark2></div>
        <div style={{ ...B, fontSize: 32, color: A2.sub, marginTop: 2 }}>があれば</div>
      </In>
      {f >= st ? (
        <div style={{ position: "absolute", left: 0, top: 1010, width: 1080, display: "flex", justifyContent: "center" }}>
          <div style={{ transform: `rotate(-4deg) scale(${interpolate(f - st, [0, 4, 7], [1.8, 0.92, 1], clamp)})`, opacity: interpolate(f - st, [0, 3], [0, 1], clamp), background: A2.bg, border: `8px solid ${A2.coral}`, borderRadius: 26, padding: "12px 44px", ...B, fontSize: 84, color: A2.coral }}>むしろチャンス</div>
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
        const wob = f >= many ? Math.sin((f - many - i * 3) / 2.2) * interpolate(f - many - i * 3, [0, 4, 14], [0, 8, 0], clamp) : 0;
        return (
          <In key={i} at={at} style={{ left: 80 + i * 315, top: 470, width: 290, textAlign: "center" }}>
            <div style={{ width: 210, height: 210, margin: "0 auto", borderRadius: "50%", background: "#fff", border: `6px dashed ${A2.green}`, boxSizing: "border-box", ...B, fontSize: 130, lineHeight: "198px", color: A2.green, transform: `rotate(${wob}deg)` }}>?</div>
            <div style={{ ...B, fontSize: 40, color: A2.ink, marginTop: 18 }}>方法{["①", "②", "③"][i]}</div>
          </In>
        );
      })}
      {f >= many ? <div style={{ position: "absolute", left: 0, top: 790, width: 1080, textAlign: "center", ...B, fontSize: 44, color: A2.sub, opacity: interpolate(f - many, [0, 6], [0, 1], clamp) }}>…いくつもある</div> : null}
      {f >= F(34.16) ? (
        <div style={{ position: "absolute", left: 0, top: 880, width: 1080, display: "flex", justifyContent: "center", alignItems: "center", gap: 30, transform: `scale(${pop(f, F(34.16))})` }}>
          <Free name="mile_phone_dm" size={230} label="DM" />
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
    <MarkerSub subs={SUBS.map(([t, s]) => [R(t), s] as [number, string])} start={0} end={R(35.32)} />
  </AbsoluteFill>
);

export const MILE_Z_FRAMES = PART4 + MILE_LC_FRAMES;
export const MileZukai: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: A2.bg }}>
    <Sequence durationInFrames={PART4}><Mile123 /></Sequence>
    <Sequence from={PART4}><MileLifeChart /></Sequence>
  </AbsoluteFill>
);
