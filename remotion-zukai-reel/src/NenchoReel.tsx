import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from "remotion";
import { A2 } from "./components/kit2";
import { FONT } from "./components/font";
import { SfxTrack } from "./components/sfx";
import { B, GenSlot, Head, SubFade } from "./MileLifePlan";
import { Scene, Page, PopAt, Pill, Stamp, Count, Note, CARD, useCardIn, Taichi, Captions, pop, useShake } from "./BourakuReel";
import { NENCHO_MOUTH } from "./nenchoMouth";

// ════════════════════════════════════════════════════════════════════
//  2026年 年末調整（全部図解リール：冒頭・締めは太一キャラがしゃべる）
//  音声＝public/nencho-narration.wav（127.8秒）。1画面1情報。数字は国税庁・各社解説で確認済み（下のメモ）
//  ・基礎控除 最大95万→104万（合計所得489万以下・令和8/9年分特例）
//  ・給与所得控除 最低保障65万→74万（令和8/9年分は特例5万含む）→ 給与のみで所得税がかかり始める目安 160万→178万
//  ・扶養親族等の所得要件 58万→62万（給与のみ年収123万→136万）
//  ・配偶者特別控除38万（満額）年収160万→169万／特定親族特別控除63万 150万→159万、197万まで段階的（95・85・123万＋74万の計算）
//  ・23歳未満の扶養親族がいる人：一般生命保険料控除（新契約）上限 4万→6万
// ════════════════════════════════════════════════════════════════════

const F = (t: number) => Math.round(t * 30);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const out = { ...clamp, easing: Easing.out(Easing.cubic) };
const io = { ...clamp, easing: Easing.inOut(Easing.cubic) };
const BLUE = "#4A8FD6", ORANGE = A2.coral;

// ── 冒頭・締めの大きな太一（口パク＋まばたき＋表情差し替え） ──
const BigTaichi: React.FC<{ a: number; b: number; poses?: [number, string, string?][]; shrinkTo?: boolean }> = ({ a, b, poses = [], shrinkTo }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const A = F(a), Bf = F(b);
  if (f < A || f >= Bf + 10) return null;
  const s = spring({ frame: f - A, fps, config: { damping: 10, stiffness: 200, mass: 0.7 } });
  const t = f / 30;
  let name = "taichi_talk_closed", talk: string | undefined = "taichi_talk_open";
  poses.forEach(([pt, n, tk]) => { if (t >= pt) { name = n; talk = tk; } });
  const lv = NENCHO_MOUTH.charCodeAt(Math.min(NENCHO_MOUTH.length - 1, f)) - 48;
  const blink = name === "taichi_talk_closed" && f % 96 > 90;
  const img = blink ? "taichi_blink" : talk && lv >= 1 && Math.floor(f / 3) % 2 === 0 ? talk : name;
  // 出口：小さくなって右下へ（図解へバトンタッチ）／締めは下へ
  const o = interpolate(f, [Bf, Bf + 10], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const ox = shrinkTo ? o * 330 : 0, oy = shrinkTo ? o * 420 : o * 900, osc = shrinkTo ? 1 - o * 0.6 : 1;
  const bob = Math.sin(f / 9) * 6 + (lv >= 2 ? -4 : 0);
  return (
    <div style={{ position: "absolute", left: 540 - 270, top: 700 + (1 - s) * 500, width: 540, height: 540, transform: `translate(${ox}px, ${oy + bob}px) scale(${(0.9 + 0.1 * s) * osc})`, opacity: 1 - o * 0.4 }}>
      <div style={{ position: "absolute", left: 60, right: 60, bottom: 10, height: 40, borderRadius: "50%", background: "rgba(80,60,20,0.14)", filter: "blur(10px)" }} />
      <GenSlot name={img} size={540} />
    </div>
  );
};

// ドンと出る大きなテロップ（1行）
const Punch: React.FC<{ at: number; y: number; children: React.ReactNode; size?: number; color?: string; bg?: string }> = ({ at, y, children, size = 86, color = A2.ink, bg }) => {
  const f = useCurrentFrame();
  const A = F(at);
  if (f < A) return null;
  const k = interpolate(f - A, [0, 3, 7], [1.6, 0.94, 1], clamp);
  return (
    <div style={{ position: "absolute", left: 0, top: y, width: 1080, textAlign: "center", transform: `scale(${k})`, opacity: interpolate(f - A, [0, 3], [0, 1], clamp) }}>
      <span style={{ display: "inline-block", ...B, fontSize: size, color, background: bg, borderRadius: 24, padding: bg ? "8px 36px" : 0, whiteSpace: "nowrap" }}>{children}</span>
    </div>
  );
};

// 前 → 後 の数字カード（いちばん使う部品）
const BeforeAfter: React.FC<{ at: number; y?: number; label: React.ReactNode; sub?: string; from: number; to: number; unit?: string; color?: string; pre?: string }> = ({ at, y = 420, label, sub, from, to, unit = "万円", color = A2.green, pre }) => {
  const c = useCardIn(at);
  const f = useCurrentFrame();
  if (!c.on) return null;
  const A = F(at);
  const strike = interpolate(f, [A + 10, A + 18], [0, 100], out);
  const arrow = interpolate(f, [A + 14, A + 22], [0, 1], out);
  return (
    <div style={{ ...CARD, left: 70, top: y, width: 940, height: 520, ...c.style }}>
      <div style={{ position: "absolute", left: 0, top: 40, width: 940, textAlign: "center" }}>
        <div style={{ ...B, fontSize: 52, color: A2.ink }}>{label}</div>
        {sub ? <div style={{ ...B, fontSize: 28, color: A2.sub, marginTop: 6 }}>{sub}</div> : null}
      </div>
      {/* 前（灰色＋取り消し線） */}
      <div style={{ position: "absolute", left: 40, top: 230, width: 300, textAlign: "center" }}>
        <span style={{ position: "relative", display: "inline-block", whiteSpace: "nowrap" }}>
          {pre ? <span style={{ ...B, fontSize: 30, color: A2.sub }}>{pre}</span> : null}
          <span style={{ ...B, fontSize: 92, color: A2.sub }}>{from}</span><span style={{ ...B, fontSize: 34, color: A2.sub }}>{unit}</span>
          <span style={{ position: "absolute", left: -6, top: "54%", height: 8, borderRadius: 4, background: A2.sub, width: `calc(${strike}% + 12px)`, opacity: 0.7 }} />
        </span>
        <div style={{ ...B, fontSize: 26, color: A2.sub, marginTop: 6 }}>去年</div>
      </div>
      {/* 矢印 */}
      <div style={{ position: "absolute", left: 345, top: 262, width: 120 * arrow, height: 16, borderRadius: 8, background: color }} />
      {arrow > 0.6 ? <div style={{ position: "absolute", left: 455, top: 246, width: 0, height: 0, borderTop: "24px solid transparent", borderBottom: "24px solid transparent", borderLeft: `34px solid ${color}` }} /> : null}
      {/* 後（大きく・数え上げ） */}
      {f >= A + 18 ? (
        <div style={{ position: "absolute", left: 470, top: 180, width: 450, textAlign: "center", transform: `scale(${pop(f, A + 18)})` }}>
          <div style={{ whiteSpace: "nowrap", lineHeight: 1 }}>
            {pre ? <span style={{ ...B, fontSize: 40, color: A2.ink }}>{pre}</span> : null}
            <Count at={(A + 18) / 30} to={to} dur={12} style={{ ...B, fontSize: 170, color, letterSpacing: -4 }} />
            <span style={{ ...B, fontSize: 50, color: A2.ink }}>{unit}</span>
          </div>
          <div style={{ ...B, fontSize: 26, color, marginTop: 10 }}>今年</div>
        </div>
      ) : null}
      {f >= A + 26 ? <div style={{ position: "absolute", right: 30, top: 30, transform: `scale(${pop(f, A + 26)}) rotate(8deg)` }}><Pill bg={color} size={34}>UP</Pill></div> : null}
    </div>
  );
};

// ═══════════════ 冒頭（0–9.04）：太一がしゃべる ═══════════════
const Hook: React.FC = () => (
  <Scene a={0} b={9.04} inT="punch" outT="zoom">
    <Punch at={0.0} y={300} size={70}>今年の<span style={{ color: A2.green }}>年末調整</span></Punch>
    <Punch at={1.1} y={400} size={96} color="#fff" bg={A2.coral}>知らないと大損</Punch>
    <BigTaichi a={0} b={9.04} poses={[[0, "taichi_surprise_hands", undefined], [1.0, "taichi_talk_closed", "taichi_talk_open"], [2.58, "taichi_point_talk_closed", "taichi_point_talk_open"], [5.14, "taichi_talk_closed", "taichi_talk_open"]]} shrinkTo />
    {/* 変更点の3つ */}
    <div style={{ position: "absolute", left: 0, top: 580, width: 1080, display: "flex", justifyContent: "center", gap: 18 }}>
      {[["基礎控除", 5.3], ["扶養", 6.1], ["生命保険料控除", 6.7]].map(([t, at]) => {
        const f0 = F(at as number);
        return <ChipPop key={t as string} at={f0}><Pill bg="#fff" color={A2.ink} size={42}>{t as string}</Pill></ChipPop>;
      })}
    </div>
  </Scene>
);
const ChipPop: React.FC<{ at: number; children: React.ReactNode }> = ({ at, children }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  return <span style={{ display: "inline-block", transform: `scale(${pop(f, at)})`, filter: "drop-shadow(0 8px 14px rgba(80,60,20,0.15))" }}>{children}</span>;
};

// ═══════════════ 全体像（9.04–10.72） ═══════════════
const Overview: React.FC = () => {
  const rows: [string, string, string, string][] = [["基礎控除（最大）", "95万円", "104万円", A2.green], ["扶養の年収ライン", "123万円", "136万円", BLUE], ["生命保険料控除（一般）", "4万円", "6万円", ORANGE]];
  const f = useCurrentFrame();
  return (
    <Scene a={9.04} b={10.72} inT="zoom">
      <Head text={<>今年 変わったのは<span style={{ color: A2.green }}>3つ</span></>} from={F(9.04)} />
      {rows.map(([k, a, b, c], i) => {
        const at = F(9.2) + i * 5;
        if (f < at) return null;
        return (
          <div key={k} style={{ ...CARD, left: 90, top: 420 + i * 220, width: 900, height: 180, transform: `translateX(${interpolate(f - at, [0, 8], [-160, 0], out)}px)`, opacity: interpolate(f - at, [0, 5], [0, 1], clamp) }}>
            <div style={{ position: "absolute", left: 34, top: 28, ...B, fontSize: 40, color: A2.ink }}>{k}</div>
            <div style={{ position: "absolute", left: 34, top: 100, ...B, fontSize: 32, color: A2.sub }}>{a} →</div>
            <div style={{ position: "absolute", right: 34, top: 40, ...B, fontSize: 92, color: c as string }}>{b}</div>
          </div>
        );
      })}
    </Scene>
  );
};

// ═══════════════ ① 基礎控除（10.72–29.5） ═══════════════
const Kiso: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Scene a={10.72} b={29.5}>
      <Head text={<>①<span style={{ color: A2.green }}>基礎控除</span></>} from={F(10.72)} />
      <Page a={10.72} b={14.52}><BeforeAfter at={10.9} label="基礎控除（最大）" from={95} to={104} /></Page>
      <Page a={14.52} b={18.14}><BeforeAfter at={14.6} label="給与所得控除（最低）" from={65} to={74} color={BLUE} /></Page>
      {/* 104 + 74 = 178 */}
      <Page a={18.14} b={24.9}>
        <div style={{ position: "absolute", left: 0, top: 430, width: 1080, display: "flex", justifyContent: "center", alignItems: "center", gap: 22 }}>
          <ChipPop at={F(18.3)}><span style={{ ...CARD, position: "relative", display: "inline-block", padding: "20px 30px", ...B, fontSize: 64, color: A2.green }}>104<span style={{ fontSize: 30 }}>万</span><div style={{ fontSize: 22, color: A2.sub }}>基礎控除</div></span></ChipPop>
          <ChipPop at={F(18.7)}><span style={{ ...B, fontSize: 70, color: A2.ink }}>＋</span></ChipPop>
          <ChipPop at={F(19.0)}><span style={{ ...CARD, position: "relative", display: "inline-block", padding: "20px 30px", ...B, fontSize: 64, color: BLUE }}>74<span style={{ fontSize: 30 }}>万</span><div style={{ fontSize: 22, color: A2.sub }}>給与所得控除</div></span></ChipPop>
        </div>
        <PopAt at={20.62} x={0} y={700} w={1080} center><span style={{ ...B, fontSize: 40, color: A2.ink }}>所得税がかかり始める給与収入</span></PopAt>
        {f >= F(22.28) ? (
          <div style={{ position: "absolute", left: 0, top: 790, width: 1080, textAlign: "center", whiteSpace: "nowrap" }}>
            <span style={{ ...B, fontSize: 64, color: A2.sub, textDecoration: "line-through" }}>160万超</span>
            <span style={{ ...B, fontSize: 70, color: A2.ink, margin: "0 18px" }}>→</span>
            <span style={{ display: "inline-block", transform: `scale(${pop(f, F(22.8))})` }}><Count at={22.8} to={178} dur={12} style={{ ...B, fontSize: 200, color: A2.green, letterSpacing: -6 }} /><span style={{ ...B, fontSize: 70, color: A2.ink }}>万円超</span></span>
          </div>
        ) : null}
        <Note at={22.8} y={1080}>※給与だけの場合の目安。所得税の話（住民税の基礎控除は43万円のまま）</Note>
      </Page>
      {/* ただし所得で変わる */}
      <Page a={24.9} b={29.6}>
        {f >= F(25.0) ? (
          <div style={{ ...CARD, left: 70, top: 420, width: 940, height: 560 }}>
            <div style={{ position: "absolute", left: 40, top: 30, ...B, fontSize: 40, color: A2.ink }}>基礎控除は<span style={{ color: ORANGE }}>所得で変わる</span></div>
            {[["合計所得 489万円以下", "104万円"], ["489万円超〜655万円", "67万円"], ["655万円超〜2,350万円", "62万円"]].map(([a, b], i) => {
              const at = F(25.6) + i * 8;
              if (f < at) return null;
              return (
                <div key={a} style={{ position: "absolute", left: 40, right: 40, top: 130 + i * 120, height: 100, borderRadius: 20, background: i === 0 ? "rgba(46,158,107,0.10)" : A2.track, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 30px", boxSizing: "border-box", opacity: interpolate(f - at, [0, 6], [0, 1], clamp), transform: `translateY(${interpolate(f - at, [0, 8], [24, 0], out)}px)` }}>
                  <span style={{ ...B, fontSize: 32, color: A2.ink }}>{a}</span>
                  <span style={{ ...B, fontSize: 52, color: i === 0 ? A2.green : A2.ink }}>{b}</span>
                </div>
              );
            })}
          </div>
        ) : null}
        <div style={{ position: "absolute", inset: 0 }}><Stamp at={27.76} x={220} y={1030} text="自分の金額は必ず確認" size={56} rot={-3} /></div>
        <Note at={25.6}>※令和8年分・9年分の特例。2,350万円超は段階的に減ります</Note>
      </Page>
    </Scene>
  );
};

// ═══════════════ ② 扶養（29.5–75.66） ═══════════════
const Fuyo: React.FC = () => {
  const f = useCurrentFrame();
  const stepP = interpolate(f, [F(57.74), F(59.5)], [0, 1], out);
  return (
    <Scene a={29.5} b={75.66} inT="drop">
      <Head text={<>②<span style={{ color: BLUE }}>扶養</span></>} from={F(29.5)} />
      <Page a={29.5} b={34.62}><BeforeAfter at={29.7} label="扶養控除の年収ライン" sub="給与のみの場合" from={123} to={136} color={BLUE} /><Note at={30.5} y={1080}>※税金の扶養と、社会保険の扶養（130万円）は別の制度</Note></Page>
      {/* 書くのは年収ではなく所得：130 − 74 = 56 */}
      <Page a={34.62} b={42.1}>
        <Punch at={34.7} y={420} size={56}>紙に書くのは<span style={{ color: A2.sub, textDecoration: "line-through" }}>「年収」</span>ではなく<span style={{ color: ORANGE }}>「所得」</span></Punch>
        <PopAt at={36.4} x={0} y={510} w={1080} center><Pill bg="#fff" color={A2.ink} size={36}>所得 ＝ 年収 − 74万円</Pill></PopAt>
        {f >= F(37.48) ? (
          <div style={{ ...CARD, left: 70, top: 580, width: 940, height: 420 }}>
            <div style={{ position: "absolute", left: 0, top: 40, width: 940, textAlign: "center", ...B, fontSize: 34, color: A2.sub }}>例えば</div>
            <div style={{ position: "absolute", left: 0, top: 110, width: 940, display: "flex", justifyContent: "center", alignItems: "baseline", gap: 18, whiteSpace: "nowrap" }}>
              <ChipPop at={F(37.6)}><span style={{ ...B, fontSize: 30, color: A2.sub }}>年収</span><span style={{ ...B, fontSize: 90, color: A2.ink }}>130</span><span style={{ ...B, fontSize: 34, color: A2.ink }}>万</span></ChipPop>
              <ChipPop at={F(39.2)}><span style={{ ...B, fontSize: 70, color: A2.ink }}>−</span><span style={{ ...B, fontSize: 90, color: BLUE }}>74</span><span style={{ ...B, fontSize: 34, color: BLUE }}>万</span></ChipPop>
            </div>
            <div style={{ position: "absolute", left: 120, right: 120, top: 250, height: 6, borderRadius: 3, background: A2.bar }} />
            {f >= F(40.68) ? <div style={{ position: "absolute", left: 0, top: 270, width: 940, textAlign: "center", transform: `scale(${pop(f, F(40.68))})`, whiteSpace: "nowrap" }}><span style={{ ...B, fontSize: 34, color: A2.ink }}>所得 ＝ </span><span style={{ ...B, fontSize: 110, color: ORANGE }}>56</span><span style={{ ...B, fontSize: 40, color: A2.ink }}>万円</span></div> : null}
          </div>
        ) : null}
      </Page>
      <Page a={42.1} b={48.42}><BeforeAfter at={42.2} label="配偶者特別控除" sub="満額38万円の年収上限" from={160} to={169} color={BLUE} /></Page>
      <Page a={48.42} b={55.68}><BeforeAfter at={48.5} label="19〜22歳の子" sub="63万円控除の年収上限" from={150} to={159} color={BLUE} /></Page>
      {/* 159万〜197万：段階的に残る */}
      <Page a={55.68} b={61.92}>
        <Punch at={55.8} y={420} size={50}><span style={{ color: BLUE }}>159万円</span>を超えても</Punch>
        <div style={{ ...CARD, left: 70, top: 540, width: 940, height: 470 }}>
          <div style={{ position: "absolute", left: 40, top: 30, ...B, fontSize: 36, color: A2.ink }}>特定親族特別控除</div>
          <div style={{ position: "absolute", left: 40, top: 80, ...B, fontSize: 24, color: A2.sub }}>子の年収が上がると、控除が少しずつ減る</div>
          {/* 階段グラフ（イメージ） */}
          {Array.from({ length: 8 }).map((_, i) => {
            const h = 230 * (1 - i / 8.5);
            const show = stepP * 8 > i;
            return <div key={i} style={{ position: "absolute", left: 60 + i * 102, top: 410 - h, width: 88, height: show ? h : 0, borderRadius: "12px 12px 0 0", background: i === 0 ? BLUE : `rgba(74,143,214,${0.75 - i * 0.07})` }} />;
          })}
          <div style={{ position: "absolute", left: 50, right: 50, top: 410, height: 4, background: A2.bar }} />
          <div style={{ position: "absolute", left: 40, top: 420, ...B, fontSize: 28, color: A2.ink }}>159万</div>
          <div style={{ position: "absolute", right: 40, top: 420, ...B, fontSize: 28, color: ORANGE }}>197万まで</div>
        </div>
        <Note at={57.74} y={1040}>159万円超〜197万円は「特定親族特別控除」で段階的に残る</Note>
      </Page>
      {/* 16歳未満の子：扶養控除なし／「住民税に関する事項」欄に記入 */}
      <Page a={61.92} b={65.94}>
        <Punch at={62.0} y={420} size={56}><span style={{ color: BLUE }}>16歳未満の子</span>は</Punch>
        <div style={{ ...CARD, left: 120, top: 540, width: 840, height: 440 }}>
          <div style={{ position: "absolute", left: 30, top: 24, ...B, fontSize: 26, color: A2.sub }}>扶養控除等申告書（令和8年分）</div>
          {[["主たる給与から控除を受ける", 0], ["住民税に関する事項", 1]].map(([t, i]) => (
            <div key={t as string} style={{ position: "absolute", left: 30, right: 30, top: 80 + (i as number) * 160, height: 140, borderRadius: 16, border: `4px solid ${i ? BLUE : A2.bar}`, background: i ? "rgba(74,143,214,0.08)" : "#fff", boxSizing: "border-box", padding: "14px 22px" }}>
              <div style={{ ...B, fontSize: 30, color: i ? BLUE : A2.sub }}>{t as string}</div>
              {i ? <div style={{ ...B, fontSize: 36, color: A2.ink, marginTop: 10 }}>16歳未満の扶養親族を記入</div> : <div style={{ ...B, fontSize: 32, color: A2.sub, marginTop: 10 }}>扶養控除なし</div>}
            </div>
          ))}
        </div>
        <div style={{ position: "absolute", inset: 0 }}><Stamp at={64.26} x={300} y={1000} text="忘れずに記入" color={BLUE} size={56} rot={-3} /></div>
      </Page>
      {/* 16歳未満の子は扶養控除なし → でも生命保険料控除の上限UP */}
      <Page a={65.94} b={75.8}>
        <Punch at={66.0} y={420} size={48}>扶養控除がない16歳未満の子でも…</Punch>
        {f >= F(69.02) ? <BeforeAfter at={69.02} y={540} label={<>23歳未満の扶養親族がいる人</>} sub="一般生命保険料控除の上限" from={4} to={6} color={ORANGE} /> : null}
      </Page>
    </Scene>
  );
};

// ═══════════════ ③ 生命保険料控除（75.66–96.92） ═══════════════
const Seiho: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Scene a={75.66} b={96.92}>
      <Head text={<>③<span style={{ color: ORANGE }}>生命保険料控除</span></>} from={F(75.66)} />
      {/* 6万円控除 ≠ 6万円安くなる */}
      <Page a={75.66} b={86.86}>
        <Punch at={77.34} y={420} size={64}>最大<span style={{ color: ORANGE }}>6万円</span>控除できても</Punch>
        {f >= F(79.46) ? <Punch at={79.46} y={540} size={52} color="#fff" bg={A2.ink}>6万円がそのまま<span style={{ color: "#FFE07A" }}>戻るわけではない</span></Punch> : null}
        {f >= F(82.46) ? (
          <div style={{ ...CARD, left: 70, top: 720, width: 940, height: 360 }}>
            <div style={{ position: "absolute", left: 0, top: 40, width: 940, display: "flex", justifyContent: "center", alignItems: "baseline", gap: 16, whiteSpace: "nowrap" }}>
              <ChipPop at={F(82.6)}><span style={{ ...B, fontSize: 76, color: ORANGE }}>6万円</span></ChipPop>
              <ChipPop at={F(83.0)}><span style={{ ...B, fontSize: 60, color: A2.ink }}>×</span></ChipPop>
              <ChipPop at={F(83.3)}><span style={{ ...B, fontSize: 30, color: A2.sub }}>所得税率</span><span style={{ ...B, fontSize: 76, color: A2.ink }}>10%</span></ChipPop>
            </div>
            <div style={{ position: "absolute", left: 120, right: 120, top: 170, height: 6, borderRadius: 3, background: A2.bar }} />
            {f >= F(84.08) ? <div style={{ position: "absolute", left: 0, top: 190, width: 940, textAlign: "center", transform: `scale(${pop(f, F(85.3))})`, whiteSpace: "nowrap" }}><span style={{ ...B, fontSize: 34, color: A2.ink }}>安くなるのは 年間約</span><Count at={85.3} to={6000} dur={12} comma style={{ ...B, fontSize: 110, color: A2.green }} /><span style={{ ...B, fontSize: 40, color: A2.ink }}>円</span></div> : null}
          </div>
        ) : null}
      </Page>
      {/* 最大まで使うには 年間12万円超 */}
      <Page a={86.86} b={90.96}>
        <Punch at={86.9} y={440} size={52}>しかも最大まで使うには</Punch>
        <PopAt at={88.28} x={0} y={560} w={1080} center>
          <div style={{ ...B, fontSize: 36, color: A2.sub }}>一般生命保険料が 年間</div>
          <div style={{ whiteSpace: "nowrap" }}><Count at={88.4} to={12} dur={10} style={{ ...B, fontSize: 220, color: ORANGE, letterSpacing: -6 }} /><span style={{ ...B, fontSize: 70, color: A2.ink }}>万円超</span></div>
        </PopAt>
      </Page>
      {/* 控除のためだけに保険に入る・増やす → おすすめしません */}
      <Page a={90.96} b={97.0}>
        <div style={{ position: "absolute", left: 0, top: 440, width: 1080, display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
          {[["控除のためだけに保険に入る", 91.2], ["保険料を増やす", 93.88]].map(([t, at]) => (
            <ChipPop key={t as string} at={F(at as number)}><span style={{ ...CARD, position: "relative", display: "inline-flex", alignItems: "center", gap: 20, padding: "22px 40px", ...B, fontSize: 46, color: A2.ink }}><span style={{ color: A2.red, fontSize: 56 }}>✕</span>{t as string}</span></ChipPop>
          ))}
        </div>
        <div style={{ position: "absolute", inset: 0 }}><Stamp at={95.4} x={170} y={760} text="個人的にはおすすめしません" color={A2.red} size={54} rot={-3} /></div>
        <Taichi name="taichi_ng_cross" at={95.4} until={97.0} side="right" />
      </Page>
    </Scene>
  );
};

// ═══════════════ まとめ（96.92–115.52） ═══════════════
const Matome: React.FC = () => {
  const f = useCurrentFrame();
  const rows: [number, string, string, string, string][] = [[96.92, "基礎控除", "最大95万", "104万円", A2.green], [100.44, "扶養の年収ライン", "123万", "136万円", BLUE], [104.0, "一般生命保険料控除", "4万", "6万円", ORANGE]];
  const shake = useShake(F(112.1), 10, 10);
  return (
    <Scene a={96.92} b={115.52} inT="zoom">
      <div style={{ position: "absolute", inset: 0, transform: shake }}>
        <Head text={<><span style={{ color: A2.green }}>まとめ</span></>} from={F(96.92)} />
        {rows.map(([at, k, a, b, c], i) => {
          const A = F(at);
          if (f < A) return null;
          return (
            <div key={k} style={{ ...CARD, left: 70, top: 410 + i * 210, width: 940, height: 180, opacity: interpolate(f - A, [0, 5], [0, 1], clamp), transform: `translateX(${interpolate(f - A, [0, 8], [-160, 0], out)}px)` }}>
              <div style={{ position: "absolute", left: 30, top: 54, width: 72, height: 72, borderRadius: 18, background: c, color: "#fff", ...B, fontSize: 50, textAlign: "center", lineHeight: "72px", transform: `scale(${pop(f, A + 8)})` }}>✓</div>
              <div style={{ position: "absolute", left: 130, top: 30, ...B, fontSize: 38, color: A2.ink }}>{k}</div>
              <div style={{ position: "absolute", left: 130, top: 100, ...B, fontSize: 30, color: A2.sub }}>{a} →</div>
              <div style={{ position: "absolute", right: 34, top: 40, ...B, fontSize: 92, color: c }}>{b}</div>
            </div>
          );
        })}
        {f >= F(109.76) ? (
          <div style={{ position: "absolute", left: 0, top: 1060, width: 1080, textAlign: "center", transform: `scale(${pop(f, F(109.76))})` }}>
            <span style={{ display: "inline-block", background: A2.ink, borderRadius: 24, padding: "12px 36px", ...B, fontSize: 44, color: "#fff" }}>去年の控えを<span style={{ color: "#FFE07A" }}>写さず</span>、今年の数字で</span>
          </div>
        ) : null}
        <Note at={112.1} y={1160}>※用紙は「令和8年分」を使用。改正は令和8年12月1日施行で、12月の年末調整で精算</Note>
        <Note at={112.1} y={1200}>出典：国税庁 令和8年分（No.1199・1410・1191・1195・1177・1140）</Note>
      </div>
    </Scene>
  );
};

// ═══════════════ 締め（115.52–127.8）：太一がしゃべる＋公式LINE ═══════════════
const Outro: React.FC = () => {
  const f = useCurrentFrame();
  const guide = F(119.32), line = F(124.8);
  const tap = interpolate(f, [line + 12, line + 16, line + 20], [1, 0.9, 1], clamp);
  return (
    <Scene a={115.52} b={128.6} inT="zoom">
      <Punch at={115.6} y={300} size={56}>一見ややこしいけど</Punch>
      <Punch at={117.66} y={390} size={70}><span style={{ color: A2.green }}>変わった所</span>を押さえれば大丈夫</Punch>
      <BigTaichi a={115.52} b={128.6} poses={[[115.52, "taichi_talk_closed", "taichi_talk_open"], [117.66, "taichi_ok_hand", undefined], [118.6, "taichi_talk_closed", "taichi_talk_open"], [124.8, "taichi_point_talk_closed", "taichi_point_talk_open"]]} />
      {/* 完全ガイド */}
      {f >= guide ? (
        <div style={{ position: "absolute", left: 720, top: 600, transform: `scale(${pop(f, guide)}) rotate(6deg)` }}>
          <div style={{ width: 300, height: 400, borderRadius: 18, background: "#fff", boxShadow: "0 18px 40px rgba(80,60,20,0.18)", padding: 24, boxSizing: "border-box" }}>
            <div style={{ ...B, fontSize: 24, color: A2.sub }}>2026年版</div>
            <div style={{ ...B, fontSize: 40, color: A2.ink, lineHeight: 1.2, marginTop: 6 }}>年末調整<br /><span style={{ color: A2.green }}>完全ガイド</span></div>
            {[0, 1, 2, 3, 4].map((i) => <div key={i} style={{ height: 14, borderRadius: 7, background: A2.track, marginTop: 18, width: `${90 - i * 9}%` }} />)}
          </div>
        </div>
      ) : null}
      {/* 公式LINEボタン */}
      {f >= line ? (
        <div style={{ position: "absolute", left: 0, top: 1170, width: 1080, textAlign: "center", transform: `scale(${pop(f, line) * tap})` }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 16, background: "#06C755", color: "#fff", ...B, fontSize: 48, padding: "18px 50px", borderRadius: 999, boxShadow: "0 12px 26px rgba(6,199,85,0.35)" }}>プロフィールの公式LINEから受け取る</span>
        </div>
      ) : null}
    </Scene>
  );
};

const SUBS: [number, string][] = [
  [0, "今年の*年末調整*"], [1.1, "これ知らないと!大損!します"], [2.58, "今年の年末調整は*変更点*があるので"], [5.14, "*基礎控除*、*扶養*、*生命保険料控除*"], [7.6, "それぞれ解説していきます"],
  [9.04, "今回の全体像はこんな感じ"], [10.72, "まずは*基礎控除*"], [11.92, "最大95万円から*104万円*にアップ"], [14.52, "給与所得控除も最低65万円から~74万円~に"], [18.14, "この2つが上がったことで"], [19.9, "給与収入だけなら"], [20.62, "所得税がかかり始める目安も"], [22.28, "160万円から*178万円*に上がっています"], [24.9, "ただし基礎控除は!所得によって金額が変わる!ので"], [27.76, "自分の金額は*必ず確認*"],
  [29.5, "次は~扶養~"], [30.96, "扶養控除の年収ラインが123万円から~136万円~にアップ"], [34.62, "ここで注意したいのが"], [35.6, "紙に書くのは年収ではなくて!所得!"], [37.48, "例えば年収130万円なら74万円を引いて"], [40.68, "所得は!56万円!"], [42.1, "~配偶者特別控除~は38万円を"], [44.56, "満額受けられる年収が160万円から~169万円~に"], [48.42, "19歳から22歳の子どもは"], [50.5, "63万円の控除を受けられる年収が"], [53.12, "150万円から~159万円~にアップ"], [55.68, "さらに159万円を超えても"], [57.74, "197万円までは*特定親族特別控除*が段階的に残ります"], [61.92, "「~住民税に関する事項~」は記入が必要なので"], [64.26, "ここも忘れないようにしてください"], [65.94, "16歳未満の子どもは扶養控除はありませんが"], [69.02, "*23歳未満の扶養親族*がいる人は"], [71.48, "一般生命保険料控除の上限が"], [73.64, "4万円から!6万円!に上がりました"],
  [75.66, "最後は!生命保険料控除!"], [77.34, "例えば最大6万円控除できても"], [79.46, "6万円そのまま"], [80.8, "税金が安くなる!わけではありません!"], [82.46, "所得税率10%なら"], [84.08, "所得税が安くなるのは年間*約6000円*です"], [86.86, "しかも最大まで使うには"], [88.28, "年間!12万円!を超える一般生命保険料が必要"], [90.96, "なので保険料控除のためだけに保険に入ったりとか"], [93.88, "保険料を増やしたりするのは"], [95.4, "個人的には!おすすめしません!"],
  [96.92, "まとめると"], [97.9, "基礎控除は最大95万円から*104万円*"], [100.44, "扶養控除の年収ラインは"], [101.82, "123万円から~136万円~"], [104.0, "23歳未満の扶養親族がいる人は"], [106.32, "一般生命保険料控除の上限が"], [108.38, "4万円から!6万円!"], [109.76, "今年は去年と数字が*かなり変わって*います"], [112.1, "去年の控えをそのまま!写さず!"], [113.84, "今年の数字で確認してください"],
  [115.52, "こんな感じで一見ややこしいですが"], [117.66, "*変わったところ*を押さえれば大丈夫"], [119.32, "2026年版の年末調整を"], [121.74, "実際の用紙を見ながら書けるように"], [123.48, "*完全ガイド*にまとめました"], [124.8, "欲しい方はプロフィールの*公式LINE*から"], [126.9, "受け取ってください"],
];

const CUES: { file: string; at: number; volume: number }[] = [
  { file: "user/u05", at: F(1.1), volume: 0.34 },
  ...[5.3, 6.1, 6.7].map((t) => ({ file: "user/u02s", at: F(t), volume: 0.22 })),
  ...[9.04, 10.72, 29.5, 75.66, 96.92, 115.52].map((t) => ({ file: "user/u03", at: F(t), volume: 0.26 })),
  ...[10.72, 29.5, 75.66].map((t) => ({ file: "swipe", at: F(t) - 2, volume: 0.2 })),
  // 前→後カード：数字が出る所だけ
  ...[10.9, 14.6, 29.7, 42.2, 48.5, 69.02].map((t) => ({ file: "user/u05s", at: F(t) + 18, volume: 0.24 })),
  { file: "user/u05", at: F(22.8), volume: 0.3 },
  { file: "user/u05", at: F(27.76), volume: 0.26 },
  { file: "user/u05s", at: F(40.68), volume: 0.26 },
  { file: "user/u05", at: F(61.92), volume: 0.24 },
  { file: "thud", at: F(79.46), volume: 0.32 },
  { file: "user/u05s", at: F(85.3), volume: 0.26 },
  { file: "user/u05", at: F(88.4), volume: 0.28 },
  { file: "user/u05", at: F(95.4), volume: 0.3 },
  ...[96.92, 100.44, 104.0].map((t) => ({ file: "user/u02s", at: F(t) + 8, volume: 0.22 })),
  { file: "user/u05", at: F(109.76), volume: 0.26 },
  { file: "user/u05s", at: F(119.32), volume: 0.26 },
  { file: "user/u10", at: F(124.8), volume: 0.3 },
];

export const NENCHO_FRAMES = F(127.81) + 24;
export const NenchoReel: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: A2.bg, fontFamily: FONT }}>
    <Audio src={staticFile("nencho-narration.wav")} />
    <SfxTrack cues={CUES} />
    <Hook /><Overview /><Kiso /><Fuyo /><Seiho /><Matome /><Outro />
    <SubFade />
    <Captions subs={SUBS} end={127.7} />
  </AbsoluteFill>
);
