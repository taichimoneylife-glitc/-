import React from "react";
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from "remotion";
import { A2 } from "./components/kit2";
import { FONT, FONT_BLACK } from "./components/font";
import { SfxTrack } from "./components/sfx";
import { B, GenSlot, Head, SubFade } from "./MileLifePlan";
import { Scene, Page, PopAt, PopIn, Pic, Pill, Stamp, Count, Note, CARD, useCardIn, Taichi, Captions, pop, useShake } from "./BourakuReel";
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
const K = { fontFamily: FONT_BLACK, fontWeight: 900 as const };

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
const ImgRow: React.FC<{ at: number; y: number; names: string[]; size?: number }> = ({ at, y, names, size = 250 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 0, top: y, width: 1080, display: "flex", justifyContent: "center", gap: 40 }}>
      {names.map((n, i) => {
        const A = F(at) + i * 5;
        if (f < A) return <div key={n} style={{ width: size, height: size }} />;
        return <div key={n} style={{ transform: `scale(${pop(f, A)}) translateY(${Math.sin((f - A) / 10 + i) * 5}px)`, filter: "drop-shadow(0 14px 16px rgba(80,60,20,0.16))" }}><GenSlot name={n} size={size} /></div>;
      })}
    </div>
  );
};
const BeforeAfter: React.FC<{ at: number; y?: number; label: React.ReactNode; sub?: string; from: number; to: number; unit?: string; color?: string; pre?: string; imgs?: string[]; imgSize?: number }> = ({ at, y = 420, label, sub, from, to, unit = "万円", color = A2.green, pre, imgs, imgSize = 250 }) => {
  const c = useCardIn(at);
  const f = useCurrentFrame();
  if (!c.on) return null;
  const A = F(at);
  const strike = interpolate(f, [A + 10, A + 18], [0, 100], out);
  const arrow = interpolate(f, [A + 14, A + 22], [0, 1], out);
  return (
    <>
    {imgs ? <ImgRow at={at + 0.9} y={y + 545} names={imgs} size={imgSize} /> : null}
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
    </>
  );
};

// ═══════════════ 冒頭（0–9.04）：見出しは1つのかたまり、太一は体固定で口だけ ═══════════════
const MouthOnly: React.FC<{ size: number; x: number; y: number }> = ({ size, x, y }) => {
  const f = useCurrentFrame();
  const lv = NENCHO_MOUTH.charCodeAt(Math.min(NENCHO_MOUTH.length - 1, f)) - 48;
  const blink = f % 84 >= 80 && lv === 0;
  const img = blink ? "taichi_blink" : lv >= 2 ? (Math.floor(f / 2) % 3 === 0 ? "taichi_talk_mid" : "taichi_talk_open") : lv === 1 ? "taichi_talk_mid" : "taichi_talk_closed";
  return <div style={{ position: "absolute", left: x, top: y, width: size, height: size }}><GenSlot name={img} size={size} /></div>;
};
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const shake = useShake(F(1.1) + 3, 12, 10);
  const k1 = interpolate(f, [0, 8], [0, 1], out);
  const big = F(1.1);
  const kb = f >= big ? interpolate(f - big, [0, 4, 8], [1.7, 0.94, 1], clamp) : 0;
  const mk = interpolate(f, [big + 6, big + 14], [0, 100], out);
  return (
    <Scene a={0} b={9.04} inT="punch" outT="zoom">
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 66%, #FFF3BF 0%, ${A2.bg} 58%)` }} />
      <div style={{ position: "absolute", left: 0, top: 250, width: 1080, textAlign: "center", transform: shake }}>
        <div style={{ opacity: k1, transform: `translateY(${(1 - k1) * -30}px)` }}>
          <div style={{ display: "inline-block", background: A2.ink, color: "#FFE07A", borderRadius: 999, padding: "8px 30px", ...K, fontSize: 36, letterSpacing: 2 }}>2026年分（令和8年）</div>
          <div style={{ ...K, fontSize: 112, color: A2.ink, lineHeight: 1.12, marginTop: 18, letterSpacing: 2 }}>今年の年末調整</div>
        </div>
        {f >= big ? (
          <div style={{ position: "relative", display: "inline-block", marginTop: 4, transform: `scale(${kb})` }}>
            <span style={{ position: "absolute", left: -14, bottom: 12, height: 44, width: `calc(${mk}% + 28px)`, background: "#FFE07A", borderRadius: 10 }} />
            <span style={{ position: "relative", ...K, fontSize: 132, color: A2.red, letterSpacing: 2 }}>知らないと<span style={{ fontSize: 150 }}>大損</span></span>
          </div>
        ) : null}
      </div>
      <MouthOnly size={700} x={190} y={640} />
      {f >= F(5.14) ? (
        <div style={{ position: "absolute", left: 0, top: 1110, width: 1080, display: "flex", justifyContent: "center", gap: 18 }}>
          {([["nencho_icon_kiso", "基礎控除", A2.green, 5.3], ["nencho_icon_fuyo", "扶養", BLUE, 6.1], ["nencho_icon_seiho", "生命保険料控除", ORANGE, 6.7]] as [string, string, string, number][]).map(([n, t, c, at]) => (
            <ChipPop key={t} at={F(at)}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff", borderRadius: 999, padding: "8px 22px 8px 10px", border: `4px solid ${c}` }}>
                <GenSlot name={n} size={64} /><span style={{ ...K, fontSize: 34, color: c }}>{t}</span>
              </span>
            </ChipPop>
          ))}
        </div>
      ) : null}
    </Scene>
  );
};
const ChipPop: React.FC<{ at: number; children: React.ReactNode }> = ({ at, children }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  return <span style={{ display: "inline-block", transform: `scale(${pop(f, at)})`, filter: "drop-shadow(0 8px 14px rgba(80,60,20,0.15))" }}>{children}</span>;
};

// ═══════════════ ツリー：全体像とまとめは大きなツリー、解説中は上のタブで「今どこ」 ═══════════════
const BRANCH: { key: string; t: string; from: string; to: string; c: string; a: number; z: number }[] = [
  { key: "kiso", t: "基礎控除", from: "最大95万円", to: "104万円", c: A2.green, a: 10.72, z: 29.5 },
  { key: "fuyo", t: "扶養", from: "年収123万円", to: "136万円", c: BLUE, a: 29.5, z: 75.66 },
  { key: "seiho", t: "生命保険料控除", from: "一般 4万円", to: "6万円", c: ORANGE, a: 75.66, z: 96.92 },
];
const BigTree: React.FC<{ a: number; b: number; checks?: number[]; title: React.ReactNode }> = ({ a, b, checks, title }) => {
  const f = useCurrentFrame();
  const A = F(a);
  const line = interpolate(f, [A + 4, A + 18], [0, 1], out);
  const X = [190, 540, 890];
  return (
    <Scene a={a} b={b} inT="zoom" outT="zoom">
      <div style={{ position: "absolute", left: 0, top: 290, width: 1080, textAlign: "center", transform: `scale(${pop(f, A)})` }}>
        <div style={{ display: "inline-block", background: A2.ink, color: "#fff", borderRadius: 26, padding: "16px 44px", ...B, fontSize: 52 }}>年末調整 <span style={{ color: "#FFE07A" }}>2026</span></div>
        <div style={{ ...B, fontSize: 34, color: A2.ink, marginTop: 14 }}>{title}</div>
      </div>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <path d="M540 500 L540 560 M190 560 L890 560 M190 560 L190 620 M540 560 L540 620 M890 560 L890 620" fill="none" stroke={A2.ink} strokeOpacity={0.35} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - line} />
      </svg>
      {BRANCH.map((br, i) => {
        const at = A + 14 + i * 6;
        if (f < at) return null;
        const ck = checks ? F(checks[i]) : -1;
        const done = checks && f >= ck;
        return (
          <div key={br.key} style={{ position: "absolute", left: X[i] - 160, top: 630, width: 320, transform: `scale(${pop(f, at)})`, transformOrigin: "50% 0" }}>
            <div style={{ position: "relative", background: "#fff", borderRadius: 30, boxShadow: done ? `0 14px 30px ${br.c}55` : "0 14px 30px rgba(80,60,20,0.12)", border: done ? `5px solid ${br.c}` : "5px solid transparent", overflow: "hidden" }}>
              <div style={{ background: br.c, color: "#fff", ...B, fontSize: br.t.length > 4 ? 32 : 40, textAlign: "center", padding: "16px 0" }}>{["①", "②", "③"][i]} {br.t}</div>
              <div style={{ display: "flex", justifyContent: "center", paddingTop: 14 }}><GenSlot name={["nencho_icon_kiso", "nencho_icon_fuyo", "nencho_icon_seiho"][i]} size={130} /></div>
              <div style={{ padding: "6px 0 26px", textAlign: "center" }}>
                <div style={{ ...B, fontSize: 28, color: A2.sub, textDecoration: "line-through" }}>{br.from}</div>
                <div style={{ ...B, fontSize: 30, color: A2.sub, margin: "4px 0" }}>↓</div>
                <div style={{ ...B, fontSize: 74, color: br.c, lineHeight: 1 }}>{br.to}</div>
              </div>
              {done ? <div style={{ position: "absolute", right: 14, top: 76, width: 64, height: 64, borderRadius: "50%", background: br.c, border: "5px solid #fff", color: "#fff", ...B, fontSize: 38, textAlign: "center", lineHeight: "54px", transform: `scale(${pop(f, ck)})` }}>✓</div> : null}
            </div>
          </div>
        );
      })}
    </Scene>
  );
};
// 解説中：上に固定のツリー（年収の壁と同じ型）。話している枝だけ色が付いて光る
const TabBar: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const A = F(10.72), Z = F(96.92);
  if (f < A - 2 || f >= Z + 8) return null;
  const t = f / 30;
  let idx = 0;
  BRANCH.forEach((b, i) => { if (t >= b.a) idx = i; });
  const enter = interpolate(f, [A - 2, A + 8], [0, 1], out);
  const leave = interpolate(f, [Z, Z + 8], [0, 1], clamp);
  const X = [200, 540, 880];
  const col = BRANCH[idx].c;
  const since = f - F(BRANCH[idx].a);
  const grow = interpolate(since, [0, 10], [0, 1], out); // 根元→枝へ色が走る
  const pulse = 1 + (Math.sin(f / 7) * 0.5 + 0.5) * 0.06;
  const pop1 = spring({ frame: since, fps, config: { damping: 9, stiffness: 220, mass: 0.5 } });
  const hx = X[idx];
  // 根元(540,300)→横線→枝(hx,330) を走る色付きの道
  const segH = Math.abs(hx - 540);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 420, opacity: enter * (1 - leave), transform: `translateY(${(1 - enter) * -30}px)` }}>
      {/* 根元 */}
      <div style={{ position: "absolute", left: 0, top: 246, width: 1080, textAlign: "center" }}>
        <span style={{ display: "inline-block", background: A2.ink, color: "#fff", borderRadius: 999, padding: "6px 26px", ...B, fontSize: 28 }}>年末調整 <span style={{ color: "#FFE07A" }}>2026</span></span>
      </div>
      <svg width={1080} height={420} style={{ position: "absolute", inset: 0 }}>
        <path d="M540 294 L540 312 M200 312 L880 312 M200 312 L200 330 M540 312 L540 330 M880 312 L880 330" fill="none" stroke={A2.bar} strokeWidth={6} strokeLinecap="round" />
        {/* 話している枝への道だけ色付き */}
        <path d={`M540 294 L540 312 L${hx} 312 L${hx} 330`} fill="none" stroke={col} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - grow} />
        {grow > 0.05 && grow < 0.98 ? <circle cx={grow < 0.5 && segH > 0 ? 540 + (hx - 540) * Math.min(1, grow * 1.4) : hx} cy={312} r={9} fill="#fff" stroke={col} strokeWidth={4} /> : null}
      </svg>
      {BRANCH.map((b, i) => {
        const on = i === idx;
        return (
          <div key={b.key} style={{ position: "absolute", left: X[i] - 150, top: 330, width: 300, height: 66, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: on ? b.c : "#fff", border: `4px solid ${on ? b.c : A2.bar}`, boxSizing: "border-box", boxShadow: on ? `0 8px 20px ${b.c}66` : "0 4px 10px rgba(80,60,20,0.06)", transform: `scale(${on ? (0.85 + 0.15 * pop1) * pulse : 0.94})`, opacity: on ? 1 : 0.55, ...B, fontSize: b.t.length > 4 ? 28 : 34, color: on ? "#fff" : A2.sub }}>
            <span>{["①", "②", "③"][i]}</span>{b.t}
          </div>
        );
      })}
    </div>
  );
};
// 実際の用紙（国税庁 令和8年分）を出して、該当欄にズーム＋枠＋吹き出し
type Reg = [number, number, number, number];
const FormZoom: React.FC<{ at: number; src: string; title: string; reg: Reg; mark?: Reg; zoomAt?: number; note: React.ReactNode; color?: string; top?: number; kz?: number; fxr?: number }> = ({ at, src, title, reg, mark, zoomAt, note, color = ORANGE, top = 400, kz, fxr }) => {
  const f = useCurrentFrame();
  const A = F(at), Zt = F(zoomAt ?? at + 0.9);
  if (f < A) return null;
  const VW = 980, VH = 700, IW = 980, IH = IW * 1654 / 2339;
  const [x0, y0, x1, y1] = reg;
  const rw = (x1 - x0) * IW, rh = (y1 - y0) * IH;
  const kT = kz ?? Math.min((VW * 0.92) / rw, (VH * 0.78) / rh, 4.2);
  const z = interpolate(f, [Zt, Zt + 16], [0, 1], io);
  const k = 1 + (kT - 1) * z;
  const cx = (fxr ?? (x0 + x1) / 2) * IW, cy = ((y0 + y1) / 2) * IH;
  const fx = IW / 2 + (cx - IW / 2) * z, fy = IH / 2 + (cy - IH / 2) * z; // 見る中心
  const tx = Math.min(0, Math.max(VW - IW * k, VW / 2 - fx * k));
  const ty = Math.min((VH - IH) / 2, Math.max(VH - IH * k, VH / 2 - fy * k)); // 用紙の外（白）が見えないように
  const enter = interpolate(f - A, [0, 9], [0, 1], out);
  const m = mark ?? reg;
  const box = interpolate(f, [Zt + 14, Zt + 22], [0, 1], out);
  const pulse = 1 + 0.03 * Math.sin((f - Zt) / 4);
  return (
    <div style={{ position: "absolute", left: 50, top, width: VW, opacity: enter, transform: `translateY(${(1 - enter) * 50}px)` }}>
      <div style={{ ...B, fontSize: 28, color: A2.sub, marginBottom: 10, textAlign: "center" }}>実際の用紙：<span style={{ color: A2.ink }}>{title}</span></div>
      <div style={{ position: "relative", width: VW, height: VH, borderRadius: 26, overflow: "hidden", background: "#fff", boxShadow: "0 18px 40px rgba(80,60,20,0.16)", border: "6px solid #fff" }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: IW, height: IH, transform: `translate(${tx}px, ${ty}px) scale(${k})`, transformOrigin: "0 0" }}>
          <Img src={staticFile(`nencho_forms/${src}.png`)} style={{ width: IW, height: IH }} />
          {/* 該当欄以外を少し暗く */}
          <div style={{ position: "absolute", inset: 0, background: `rgba(30,30,30,${0.28 * box})`, clipPath: `polygon(0 0,100% 0,100% 100%,0 100%,0 0,${m[0] * 100}% ${m[1] * 100}%,${m[0] * 100}% ${m[3] * 100}%,${m[2] * 100}% ${m[3] * 100}%,${m[2] * 100}% ${m[1] * 100}%,${m[0] * 100}% ${m[1] * 100}%)` }} />
          {box > 0 ? <div style={{ position: "absolute", left: `${m[0] * 100}%`, top: `${m[1] * 100}%`, width: `${(m[2] - m[0]) * 100}%`, height: `${(m[3] - m[1]) * 100}%`, border: `${9 / k}px solid ${color}`, borderRadius: 8 / k, background: `${color}26`, boxShadow: `0 0 ${18 / k}px ${color}`, opacity: box, transform: `scale(${pulse})`, boxSizing: "border-box" }} /> : null}
        </div>
      </div>
      {box > 0.5 ? <div style={{ marginTop: 22, textAlign: "center", transform: `scale(${pop(f, Zt + 18)})` }}><span style={{ display: "inline-block", background: color, color: "#fff", ...B, fontSize: 38, padding: "12px 30px", borderRadius: 22, whiteSpace: "nowrap" }}>{note}</span></div> : null}
    </div>
  );
};

// ═══════════════ 解説パートの部品（暴落リールと同じ作り：1ページ1主役・大きく・余白多め） ═══════════════
// ページの見出し（ツリーの下に固定の位置）
const Head2: React.FC<{ at: number; color?: string; children: React.ReactNode }> = ({ at, color = A2.green, children }) => {
  const f = useCurrentFrame();
  const A = F(at);
  const p = interpolate(f, [A, A + 8], [0, 1], out);
  return (
    <div style={{ position: "absolute", left: 0, top: 418, width: 1080, textAlign: "center", opacity: p, transform: `translateY(${(1 - p) * 18}px)` }}>
      <div style={{ ...B, fontSize: 54, color: A2.ink, letterSpacing: 1, whiteSpace: "nowrap" }}>{children}</div>
      <div style={{ width: interpolate(f, [A + 4, A + 12], [0, 120], out), height: 10, borderRadius: 999, background: color, margin: "12px auto 0" }} />
    </div>
  );
};
const C = (c: string, t: React.ReactNode) => <span style={{ color: c }}>{t}</span>;

// 去年 → 今年（上に画像、下に数字。今年の数字が主役）
const UpNum: React.FC<{ at: number; rev: number; img: string; imgSize?: number; label: string; from: number; to: number; color: string }> = ({ at, rev, img, imgSize = 300, label, from, to, color }) => {
  const f = useCurrentFrame();
  const A = F(at), R = F(rev);
  const strike = interpolate(f, [R - 8, R], [0, 100], out);
  const arrow = interpolate(f, [R - 4, R + 4], [0, 1], out);
  return (
    <>
      <div style={{ position: "absolute", left: 540 - imgSize / 2, top: 530 + (300 - imgSize) / 2 }}><PopIn at={at}><Pic name={img} size={imgSize} bob /></PopIn></div>
      {f >= A + 4 ? <div style={{ position: "absolute", left: 0, top: 862, width: 1080, textAlign: "center", ...B, fontSize: 40, color: A2.sub, opacity: interpolate(f, [A + 4, A + 12], [0, 1], clamp) }}>{label}</div> : null}
      {f >= A + 6 ? (
        <div style={{ position: "absolute", left: 0, top: 920, width: 1080, display: "flex", justifyContent: "center", alignItems: "center", gap: 26, whiteSpace: "nowrap" }}>
          <span style={{ position: "relative", display: "inline-block", transform: `scale(${pop(f, A + 6)})` }}>
            <span style={{ ...B, fontSize: 86, color: A2.sub }}>{from}</span><span style={{ ...B, fontSize: 34, color: A2.sub }}>万円</span>
            <span style={{ position: "absolute", left: -6, top: "52%", height: 9, borderRadius: 5, background: A2.red, width: `calc(${strike}% + 12px)` }} />
            <div style={{ position: "absolute", left: 0, right: 0, top: -34, textAlign: "center", ...B, fontSize: 26, color: A2.sub }}>去年</div>
          </span>
          <svg width={90} height={60} style={{ opacity: arrow, transform: `translateX(${(arrow - 1) * 30}px)` }}><path d="M4 30 H62 M44 10 L72 30 L44 50" fill="none" stroke={color} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" /></svg>
          {f >= R ? (
            <span style={{ display: "inline-block", transform: `scale(${pop(f, R)})`, lineHeight: 1 }}>
              <Count at={rev} to={to} dur={12} style={{ ...K, fontSize: 200, color, letterSpacing: -4 }} /><span style={{ ...K, fontSize: 62, color: A2.ink }}>万円</span>
            </span>
          ) : <span style={{ display: "inline-block", width: 420 }} />}
        </div>
      ) : null}
    </>
  );
};

// レンガの「壁」：年収ラインが上がる＝壁がグッと高くなる
const BRICK = `url("data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="120" height="60"><rect width="120" height="60" fill="#F3D6B4"/><rect x="3" y="3" width="54" height="24" rx="4" fill="#E0804A"/><rect x="63" y="3" width="54" height="24" rx="4" fill="#D97843"/><rect x="-27" y="33" width="54" height="24" rx="4" fill="#D97843"/><rect x="33" y="33" width="54" height="24" rx="4" fill="#E0804A"/><rect x="93" y="33" width="54" height="24" rx="4" fill="#DC7C46"/></svg>')}")`;
const GROUND = 1150, WX = 450, WW = 570, H0 = 290, H1 = 450;
const Wall: React.FC<{ at: number; rise: number; from: number; to: number; img: string; color: string; imgSize?: number }> = ({ at, rise, from, to, img, color, imgSize = 400 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const A = F(at), R = F(rise);
  const inS = spring({ frame: f - A, fps, config: { damping: 14, stiffness: 150 } });
  const rs = f >= R ? spring({ frame: f - R, fps, config: { damping: 8, stiffness: 150, mass: 0.8 } }) : 0;
  const h = H0 * inS + (H1 - H0) * rs;
  const top = GROUND - h;
  const shake = useShake(R + 7, 12, 12);
  const val = f >= R ? Math.round(interpolate(f, [R, R + 12], [from, to], out)) : from;
  const jump = interpolate(f - R, [6, 12, 20], [0, -46, 0], clamp);
  const after = f >= R + 8;
  return (
    <div style={{ position: "absolute", inset: 0, transform: shake }}>
      <div style={{ position: "absolute", left: 30, top: GROUND - 4, width: 1020, height: 12, borderRadius: 6, background: "#E4D8AF" }} />
      {/* 人 */}
      <div style={{ position: "absolute", left: 20, top: GROUND - imgSize + 6, transform: `translateY(${jump}px)` }}><PopIn at={at + 0.15}><Pic name={img} size={imgSize} /></PopIn></div>
      {/* 壁 */}
      <div style={{ position: "absolute", left: WX, top, width: WW, height: h, backgroundImage: BRICK, backgroundPosition: "left bottom", borderRadius: "12px 12px 0 0", boxShadow: "0 16px 30px rgba(120,60,20,0.18)", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: WW, height: 22, background: "#B9582C" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(255,255,255,0.10), rgba(0,0,0,0.08))" }} />
      </div>
      {/* 去年の高さ（点線）と、上がった幅 */}
      {after ? (
        <>
          <div style={{ position: "absolute", left: WX - 14, top: GROUND - H0 - 3, width: WW + 28, borderTop: "7px dashed #fff", opacity: interpolate(f, [R + 8, R + 14], [0, 1], clamp) }} />
          <div style={{ position: "absolute", left: WX + 24, top: GROUND - H0 + 18, transform: `scale(${pop(f, R + 10)})`, transformOrigin: "0 0" }}>
            <span style={{ display: "inline-block", background: "rgba(46,44,38,0.82)", color: "#fff", borderRadius: 14, padding: "6px 18px", ...B, fontSize: 30, whiteSpace: "nowrap" }}>去年 <span style={{ textDecoration: "line-through" }}>{from}万円</span></span>
          </div>
          <div style={{ position: "absolute", left: WX, top: (top + GROUND - H0) / 2 - 34, width: WW, textAlign: "center", transform: `scale(${pop(f, R + 14)})` }}>
            <span style={{ display: "inline-block", background: color, color: "#fff", borderRadius: 999, padding: "8px 30px", ...K, fontSize: 40, boxShadow: "0 6px 14px rgba(0,0,0,0.18)" }}>▲ ＋{to - from}万円</span>
          </div>
        </>
      ) : null}
      {/* 壁の上の札 */}
      {f >= A + 6 ? (
        <div style={{ position: "absolute", left: WX + WW / 2 - 230, top: top - 152, width: 460, textAlign: "center", transform: `scale(${pop(f, A + 6) * (f >= R ? interpolate(f - R, [0, 4, 9], [1, 1.12, 1], clamp) : 1)})` }}>
          <div style={{ display: "inline-block", background: "#fff", border: `7px solid ${f >= R ? color : A2.bar}`, borderRadius: 28, padding: "4px 30px", boxShadow: "0 12px 26px rgba(80,60,20,0.14)", whiteSpace: "nowrap", lineHeight: 1.15 }}>
            <span style={{ ...K, fontSize: 108, color: f >= R ? color : A2.sub, letterSpacing: -2 }}>{val}</span><span style={{ ...K, fontSize: 44, color: A2.ink }}>万円</span>
          </div>
        </div>
      ) : null}
    </div>
  );
};

// ═══════════════ ① 基礎控除（10.72–29.5） ═══════════════
const Kiso: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Scene a={10.72} b={29.5}>
      <Page a={10.72} b={14.52}>
        <Head2 at={10.72}>まずは{C(A2.green, "基礎控除")}</Head2>
        <UpNum at={10.9} rev={12.6} img="nencho_icon_kiso" label="基礎控除（最大）" from={95} to={104} color={A2.green} />
      </Page>
      <Page a={14.52} b={18.14}>
        <Head2 at={14.52} color={BLUE}>{C(BLUE, "給与所得控除")}も</Head2>
        <UpNum at={14.6} rev={16.4} img="nencho_payslip" label="給与所得控除（最低）" from={65} to={74} color={BLUE} />
      </Page>
      <Page a={18.14} b={24.9}>
        <Head2 at={18.14} color={A2.red}>{C(A2.red, "所得税")}がかかり始める年収</Head2>
        <Wall at={18.2} rise={22.28} from={160} to={178} img="kabe_husband_salaryman" color={A2.red} />
        {f >= F(18.5) ? (
          <div style={{ position: "absolute", left: 0, top: 1178, width: 1080, display: "flex", justifyContent: "center", alignItems: "center", gap: 12, whiteSpace: "nowrap" }}>
            <ChipPop at={F(18.5)}><Pill bg={A2.green} size={32}>基礎控除 104万</Pill></ChipPop>
            <span style={{ ...K, fontSize: 40, color: A2.ink }}>＋</span>
            <ChipPop at={F(18.5) + 5}><Pill bg={BLUE} size={32}>給与所得控除 74万</Pill></ChipPop>
            {f >= F(22.9) ? <ChipPop at={F(22.9)}><span style={{ ...K, fontSize: 40, color: A2.ink }}>＝ <span style={{ color: A2.red }}>178万</span></span></ChipPop> : null}
          </div>
        ) : null}
        <Note at={19.9} y={1262}>※給与収入だけの場合の目安（所得税の話。住民税は別）</Note>
      </Page>
      <Page a={24.9} b={29.6}>
        <FormZoom at={24.9} zoomAt={25.6} src="kiso" title="基礎控除申告書（令和8年分）" reg={[0.055, 0.355, 0.38, 0.595]} mark={[0.062, 0.383, 0.282, 0.406]} color={A2.green} note={<>合計所得489万円以下なら <span style={{ color: "#FFE07A" }}>104万円</span></>} />
        <div style={{ position: "absolute", inset: 0 }}><Stamp at={27.76} x={250} y={1210} text="自分の金額は必ず確認" size={50} rot={-3} /></div>
      </Page>
    </Scene>
  );
};

// ═══════════════ ② 扶養（29.5–75.66） ═══════════════
// 特定親族特別控除（所得税）：合計所得に応じて 63→61→51→41→31→21→11→6→3万円（国税庁 No.1177）
const STEPS = [63, 61, 51, 41, 31, 21, 11, 6, 3];
const Taper: React.FC = () => {
  const f = useCurrentFrame();
  const A = F(55.68), S = F(57.74);
  const c = useCardIn(55.8);
  const BW = 78, GAP = 14, X0 = 60, BASE = 450, KH = 5.0;
  return (
    <>
      <Head2 at={55.68}>159万円を<span style={{ color: A2.red }}>超えても</span>…</Head2>
      <div style={{ ...CARD, left: 70, top: 540, width: 940, height: 560, ...c.style }}>
        <div style={{ position: "absolute", left: 40, top: 28, ...B, fontSize: 32, color: A2.ink }}>{C(A2.green, "特定親族特別控除")}<span style={{ fontSize: 24, color: A2.sub }}>（19〜22歳の子の年収で変わる）</span></div>
        <div style={{ position: "absolute", left: X0 - 10, top: BASE, width: 9 * (BW + GAP) + 20 + 40, height: 5, background: A2.bar, borderRadius: 3 }} />
        {STEPS.map((v, i) => {
          const at = i === 0 ? A + 4 : S + 4 + i * 3;
          if (f < at) return null;
          const g = interpolate(f - at, [0, 8], [0, 1], out);
          const hh = v * KH * g;
          return (
            <div key={i} style={{ position: "absolute", left: X0 + i * (BW + GAP), top: BASE - hh, width: BW, height: hh, borderRadius: "12px 12px 4px 4px", background: i === 0 ? A2.green : `${A2.green}${["", "E6", "CC", "B3", "99", "80", "66", "4D", "40"][i]}` }} />
          );
        })}
        {f >= A + 10 ? <div style={{ position: "absolute", left: X0 - 20, top: BASE - 63 * KH - 72, width: BW + 40, textAlign: "center", transform: `scale(${pop(f, A + 10)})`, whiteSpace: "nowrap" }}><span style={{ ...K, fontSize: 56, color: A2.green }}>63</span><span style={{ ...B, fontSize: 26 }}>万</span></div> : null}
        {f >= A + 10 ? <div style={{ position: "absolute", left: X0 - 20, top: BASE + 14, width: BW + 40, textAlign: "center", ...B, fontSize: 26, color: A2.ink }}>〜159万</div> : null}
        {f >= S + 30 ? <div style={{ position: "absolute", left: X0 + 8 * (BW + GAP) - 40, top: BASE + 14, width: BW + 80, textAlign: "center", ...B, fontSize: 26, color: A2.ink }}>197万</div> : null}
        {f >= S + 34 ? <div style={{ position: "absolute", left: X0 + 9 * (BW + GAP), top: BASE - 40, ...K, fontSize: 30, color: A2.sub, transform: `scale(${pop(f, S + 34)})` }}>0</div> : null}
      </div>
      <PopAt at={58.9} x={0} y={1130} w={1080} center><span style={{ display: "inline-block", background: A2.green, color: "#fff", borderRadius: 22, padding: "10px 32px", ...K, fontSize: 44 }}>197万円まで<span style={{ color: "#FFE07A" }}>段階的に残る</span></span></PopAt>
      <Note at={58} y={1262}>※所得税の控除額（国税庁 No.1177）。年収は給与だけの場合の目安</Note>
    </>
  );
};
const Fuyo: React.FC = () => (
  <Scene a={29.5} b={75.66} inT="drop">
    <Page a={29.5} b={34.62}>
      <Head2 at={29.5} color={BLUE}>{C(BLUE, "扶養控除")}の年収ライン</Head2>
      <Wall at={29.6} rise={32.6} from={123} to={136} img="mile_family_happy" color={BLUE} />
      <Note at={31} y={1250}>※給与だけの場合の目安。社会保険の扶養（130万円）とは別の制度</Note>
    </Page>
    <Page a={34.62} b={42.1}><ShotokuPage /></Page>
    <Page a={42.1} b={48.42}>
      <Head2 at={42.1} color="#8A62C9">{C("#8A62C9", "配偶者特別控除")}<span style={{ fontSize: 36 }}>（38万円 満額）</span></Head2>
      <Wall at={42.2} rise={46.4} from={160} to={169} img="nencho_couple_parttime" color="#8A62C9" />
      <Note at={44.6} y={1250}>※配偶者の年収（給与だけの場合の目安）</Note>
    </Page>
    <Page a={48.42} b={55.68}>
      <Head2 at={48.42}>{C(A2.green, "19〜22歳の子")}<span style={{ fontSize: 36 }}>（控除63万円）</span></Head2>
      <Wall at={48.5} rise={53.7} from={150} to={159} img="nencho_student_parttime" color={A2.green} />
      <Note at={50.5} y={1250}>※子の年収（給与だけの場合の目安）</Note>
    </Page>
    <Page a={55.68} b={61.92}><Taper /></Page>
    <Page a={61.92} b={65.94}>
      <FormZoom at={61.92} zoomAt={62.5} src="fuyo" title="扶養控除等申告書（令和8年分）" reg={[0.03, 0.76, 0.92, 0.94]} mark={[0.03, 0.795, 0.92, 0.93]} kz={2.1} fxr={0.3} color={BLUE} note={<>16歳未満の子は<span style={{ color: "#FFE07A" }}>「住民税に関する事項」</span>に記入</>} />
    </Page>
    <Page a={65.94} b={69.02}>
      <Head2 at={65.94}>{C(ORANGE, "16歳未満")}の子ども</Head2>
      <div style={{ position: "absolute", left: 300, top: 540 }}><PopIn at={66.0}><Pic name="nencho_small_kids" size={480} bob /></PopIn></div>
      <PopAt at={66.6} x={0} y={1080} w={1080} center><span style={{ display: "inline-block", background: "#fff", borderRadius: 22, padding: "10px 34px", boxShadow: "0 8px 20px rgba(80,60,20,0.12)", ...B, fontSize: 52, color: A2.ink }}>扶養控除は<span style={{ color: A2.red }}>なし</span></span></PopAt>
    </Page>
    <Page a={69.02} b={75.66}>
      <Head2 at={69.02} color={ORANGE}>{C(ORANGE, "23歳未満の扶養親族")}がいる人</Head2>
      <UpNum at={71.48} rev={73.9} img="nencho_insurance_doc" label="一般生命保険料控除の上限" from={4} to={6} color={ORANGE} />
      {useCurrentFrame() < F(71.48) ? <div style={{ position: "absolute", left: 220, top: 560 }}><PopIn at={69.1}><Pic name="mile_family_happy" size={640} bob /></PopIn></div> : null}
    </Page>
  </Scene>
);

// ═══════════════ ③ 生命保険料控除（75.66–96.92） ═══════════════
const Seiho: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Scene a={75.66} b={96.92}>
      <Page a={75.66} b={77.34}>
        <FormZoom at={75.66} zoomAt={76.0} src="hoken" title="保険料控除申告書（令和8年分）" reg={[0.06, 0.33, 0.48, 0.48]} mark={[0.07, 0.402, 0.33, 0.44]} color={ORANGE} note={<>新しい欄：<span style={{ color: "#FFE07A" }}>23歳未満の扶養親族の有無</span></>} />
      </Page>
      <Page a={77.34} b={82.46}>
        <Head2 at={77.34} color={ORANGE}>控除が{C(ORANGE, "6万円")}でも…</Head2>
        <div style={{ position: "absolute", left: 340, top: 540 }}><PopIn at={77.4}><Pic name="nencho_insurance_doc" size={400} bob /></PopIn></div>
        <PopAt at={77.8} x={0} y={940} w={1080} center>
          <span style={{ ...B, fontSize: 44, color: A2.sub }}>控除 </span><Count at={77.8} to={6} dur={8} style={{ ...K, fontSize: 170, color: ORANGE, lineHeight: 1 }} /><span style={{ ...K, fontSize: 56, color: A2.ink }}>万円</span>
        </PopAt>
        <div style={{ position: "absolute", inset: 0 }}><Stamp at={80.8} x={150} y={1150} text="6万円 安くなる訳じゃない" color={A2.red} size={56} rot={-4} /></div>
      </Page>
      <Page a={82.46} b={86.86}>
        <Head2 at={82.46}>実際に{C(A2.green, "安くなる税金")}は？</Head2>
        <PopAt at={82.6} x={0} y={560} w={1080} center>
          <span style={{ display: "inline-block", background: "#fff", borderRadius: 26, padding: "14px 36px", boxShadow: "0 10px 24px rgba(80,60,20,0.12)", whiteSpace: "nowrap" }}>
            <span style={{ ...K, fontSize: 70, color: ORANGE }}>6万円</span><span style={{ ...B, fontSize: 50, color: A2.ink }}> × </span><span style={{ ...B, fontSize: 34, color: A2.sub }}>所得税率</span><span style={{ ...K, fontSize: 70, color: A2.ink }}>10%</span>
          </span>
        </PopAt>
        {f >= F(84.08) ? <div style={{ position: "absolute", left: 510, top: 700, width: 60, height: 70, transform: `scale(${pop(f, F(84.08))})` }}><svg width={60} height={70}><path d="M30 4 V52 M10 34 L30 60 L50 34" fill="none" stroke={A2.green} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" /></svg></div> : null}
        <PopAt at={84.3} x={0} y={790} w={1080} center>
          <div style={{ whiteSpace: "nowrap", lineHeight: 1 }}><span style={{ ...B, fontSize: 50, color: A2.ink }}>年間 約</span><Count at={84.3} to={6000} dur={14} comma style={{ ...K, fontSize: 190, color: A2.green, letterSpacing: -4 }} /><span style={{ ...K, fontSize: 64, color: A2.ink }}>円</span></div>
        </PopAt>
        <div style={{ position: "absolute", left: 420, top: 1010 }}><PopIn at={84.8}><Pic name="nencho_coins_small" size={240} /></PopIn></div>
        <Note at={84.3} y={1262}>※所得税率10%の人の所得税の軽減額（住民税は別に計算）</Note>
      </Page>
      <Page a={86.86} b={90.96}>
        <Head2 at={86.86} color={ORANGE}>しかも最大まで使うには</Head2>
        <PopAt at={88.28} x={0} y={560} w={1080} center>
          <div style={{ ...B, fontSize: 38, color: A2.sub }}>一般生命保険料が 年間</div>
          <div style={{ whiteSpace: "nowrap", lineHeight: 1.05 }}><Count at={88.4} to={12} dur={10} style={{ ...K, fontSize: 220, color: ORANGE, letterSpacing: -6 }} /><span style={{ ...K, fontSize: 70, color: A2.ink }}>万円超</span></div>
        </PopAt>
        <div style={{ position: "absolute", left: 370, top: 900 }}><PopIn at={88.9}><Pic name="nencho_piggy_heavy" size={340} bob /></PopIn></div>
      </Page>
      <Page a={90.96} b={97.0}>
        <div style={{ position: "absolute", left: 0, top: 440, width: 1080, display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
          {[["控除のためだけに保険に入る", 91.2], ["保険料を増やす", 93.88]].map(([t, at]) => (
            <ChipPop key={t as string} at={F(at as number)}><span style={{ ...CARD, position: "relative", display: "inline-flex", alignItems: "center", gap: 20, padding: "22px 40px", ...B, fontSize: 46, color: A2.ink }}><span style={{ color: A2.red, fontSize: 56 }}>✕</span>{t as string}</span></ChipPop>
          ))}
        </div>
        <div style={{ position: "absolute", left: 320, top: 690 }}><PopIn at={95.4}><Pic name="taichi_ng_cross" size={440} /></PopIn></div>
        <div style={{ position: "absolute", inset: 0 }}><Stamp at={95.6} x={150} y={1130} text="個人的にはおすすめしません" color={A2.red} size={54} rot={-3} /></div>
      </Page>
    </Scene>
  );
};

// 書くのは「所得」：用紙をルーペで拡大＋計算
const ShotokuPage: React.FC = () => {
  const f = useCurrentFrame();
  const A = F(34.62);
  const k = interpolate(f - A, [0, 9], [0, 1], out);
  const lp = F(35.6);
  return (
    <>
      <Head2 at={34.62} color={A2.red}>書くのは{C(A2.red, "「所得」")}<span style={{ fontSize: 40 }}>（年収じゃない）</span></Head2>
      <div style={{ position: "absolute", left: 50, top: 520, width: 640, transform: `rotate(-4deg) translateY(${(1 - k) * 60}px)`, opacity: k, filter: "drop-shadow(0 18px 26px rgba(80,60,20,0.2))" }}>
        <Img src={staticFile("nencho_forms/fuyo.png")} style={{ width: 640, borderRadius: 10, border: "6px solid #fff" }} />
        {f >= lp ? <div style={{ position: "absolute", left: 640 * 0.49, top: 453 * 0.2, width: 640 * 0.066, height: 453 * 0.36, border: `5px solid ${A2.red}`, borderRadius: 6 }} /> : null}
      </div>
      {f >= lp ? (
        <div style={{ position: "absolute", left: 540, top: 600, width: 460, height: 460, borderRadius: "50%", overflow: "hidden", border: `10px solid ${A2.red}`, boxShadow: "0 22px 40px rgba(0,0,0,0.25)", background: "#fff", transform: `scale(${pop(f, lp)})` }}>
          <Img src={staticFile("nencho_forms/fuyo.png")} style={{ position: "absolute", width: 2339 * 0.9, left: 230 - 2339 * 0.9 * 0.523, top: 230 - 1654 * 0.9 * 0.36 }} />
        </div>
      ) : null}
      {f >= lp + 8 ? <div style={{ position: "absolute", left: 500, top: 1070, width: 540, textAlign: "center", transform: `scale(${pop(f, lp + 8)})` }}><span style={{ display: "inline-block", background: A2.red, color: "#fff", borderRadius: 18, padding: "8px 24px", ...K, fontSize: 34 }}>令和8年中の所得の見積額</span></div> : null}
      {f >= F(37.48) ? (
        <div style={{ position: "absolute", left: 50, top: 1060, width: 460, background: "#fff", borderRadius: 26, padding: "16px 22px", boxShadow: "0 12px 24px rgba(80,60,20,0.12)", transform: `scale(${pop(f, F(37.48))})`, transformOrigin: "0 0" }}>
          <div style={{ ...B, fontSize: 24, color: A2.sub }}>例：年収130万円なら</div>
          <div style={{ whiteSpace: "nowrap" }}><span style={{ ...K, fontSize: 46 }}>130</span><span style={{ ...B, fontSize: 24 }}>万−</span><span style={{ ...K, fontSize: 46, color: BLUE }}>74</span><span style={{ ...B, fontSize: 24 }}>万＝</span>{f >= F(40.68) ? <span style={{ display: "inline-block", transform: `scale(${pop(f, F(40.68))})` }}><span style={{ ...K, fontSize: 64, color: A2.red }}>56</span><span style={{ ...B, fontSize: 26 }}>万円</span></span> : null}</div>
        </div>
      ) : null}
    </>
  );
};
// ═══════════════ まとめ（96.92–115.52） ═══════════════
const Matome: React.FC = () => {
  const f = useCurrentFrame();
  const shake = useShake(F(112.1), 10, 10);
  return (
    <>
    <BigTree a={96.92} b={115.52} title={<><span style={{ color: A2.green }}>まとめ</span>：この3つだけ押さえる</>} checks={[97.9, 101.82, 108.38]} />
    <Scene a={96.92} b={115.52} inT="zoom">
      <div style={{ position: "absolute", inset: 0, transform: shake }}>
        {f >= F(109.76) ? (
          <div style={{ position: "absolute", left: 0, top: 1090, width: 1080, textAlign: "center", transform: `scale(${pop(f, F(109.76))})` }}>
            {f >= F(112.1) ? <span style={{ display: "inline-block", verticalAlign: "middle", marginRight: 10, transform: `scale(${pop(f, F(112.1))})` }}><GenSlot name="nencho_copy_ng" size={120} /></span> : null}
            <span style={{ display: "inline-block", verticalAlign: "middle", background: A2.ink, borderRadius: 24, padding: "12px 36px", ...B, fontSize: 44, color: "#fff" }}>去年の控えを<span style={{ color: "#FFE07A" }}>写さず</span>、今年の数字で</span>
          </div>
        ) : null}
        <Note at={112.1} y={1230}>※用紙は「令和8年分」を使用。改正は令和8年12月1日施行で、12月の年末調整で精算</Note>
        <Note at={112.1} y={1262}>出典：国税庁 令和8年分（No.1199・1410・1191・1195・1177・1140）</Note>
      </div>
    </Scene>
    </>
  );
};

// ═══════════════ 締め（115.52–127.8）：太一がしゃべる＋公式LINE ═══════════════
// ── スマホ画面の流れ（Instagramプロフ → リンク一覧 → 公式LINE → リッチメニューの「情報まとめ」） ──
const PW = 560, PH = 940, PX = 260, PY = 290; // スマホの位置
const Tap: React.FC<{ at: number; x: number; y: number }> = ({ at, x, y }) => {
  const f = useCurrentFrame();
  if (f < at - 8 || f > at + 14) return null;
  const move = interpolate(f, [at - 8, at], [1, 0], out);
  const ring = interpolate(f, [at, at + 12], [0, 1], out);
  return (
    <>
      {f >= at ? <div style={{ position: "absolute", left: x - 60 * ring, top: y - 60 * ring, width: 120 * ring, height: 120 * ring, borderRadius: "50%", border: `6px solid rgba(46,158,107,${1 - ring})` }} /> : null}
      <div style={{ position: "absolute", left: x - 26 + move * 60, top: y - 26 + move * 80, width: 52, height: 52, borderRadius: "50%", background: "rgba(46,44,38,0.35)", border: "4px solid #fff", transform: `scale(${f >= at && f < at + 4 ? 0.8 : 1})` }} />
    </>
  );
};
const Phone: React.FC<{ a: number }> = ({ a }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const A = F(a);
  if (f < A) return null;
  const s = spring({ frame: f - A, fps, config: { damping: 14, stiffness: 180, mass: 0.7 } });
  const tLink = F(125.7), tSheet = F(126.0), tLine = F(126.75), tMenu = F(127.1), tPick = F(128.0);
  const sheet = interpolate(f, [tSheet, tSheet + 8], [0, 1], out);
  const menuIn = interpolate(f, [tMenu, tMenu + 8], [0, 1], out);
  const pulse = f >= tPick ? 1 + 0.05 * Math.sin((f - tPick) / 3) : 1;
  const zoom = interpolate(f, [tPick - 6, tPick + 8], [0, 1], io); // リッチメニューへ寄る
  // リッチメニュー画像内「情報まとめ」の位置（2000x1349 → 幅PW）
  const rmH = PW * 1349 / 2000;
  const hx = PW * 685 / 2000, hy = PH - rmH + rmH * 705 / 1349, hw = PW * 630 / 2000, hh = rmH * 600 / 1349;
  return (
    <div style={{ position: "absolute", left: PX, top: PY + (1 - s) * 900, width: PW, height: PH, transform: `translateY(${-zoom * 330}px) scale(${1 + zoom * 0.55})`, transformOrigin: `50% ${hy + hh / 2}px` }}>
      <div style={{ position: "absolute", inset: -18, borderRadius: 70, background: "#1E1E1E", boxShadow: "0 30px 60px rgba(0,0,0,0.35)" }} />
      <div style={{ position: "absolute", inset: 0, borderRadius: 54, overflow: "hidden", background: "#fff" }}>
        {/* ① Instagramプロフィール */}
        <div style={{ position: "absolute", left: 0, top: 70, width: PW }}><Img src={staticFile("nencho_cta/ig_profile.png")} style={{ width: PW }} /></div>
        <div style={{ position: "absolute", left: 0, top: 0, width: PW, height: 70, background: "#fff", borderBottom: "1px solid #eee", display: "flex", alignItems: "center", justifyContent: "center", ...B, fontSize: 26 }}>Instagram</div>
        {/* ② リンク一覧（下からシート） */}
        {sheet > 0 ? (
          <>
            <div style={{ position: "absolute", inset: 0, background: `rgba(0,0,0,${0.35 * sheet})` }} />
            <div style={{ position: "absolute", left: 0, top: PH - 470 * sheet, width: PW, height: 470, borderRadius: "30px 30px 0 0", background: "#fff", overflow: "hidden" }}>
              <div style={{ width: 70, height: 8, borderRadius: 4, background: "#ccc", margin: "12px auto 0" }} />
              <Img src={staticFile("nencho_cta/ig_links.png")} style={{ width: PW, marginTop: 6 }} />
            </div>
          </>
        ) : null}
        {/* ③ 公式LINE：トーク画面＋リッチメニュー */}
        {menuIn > 0 ? (
          <div style={{ position: "absolute", inset: 0, background: "#8CABD9", transform: `translateX(${(1 - menuIn) * PW}px)` }}>
            <div style={{ position: "absolute", left: 0, top: 0, width: PW, height: 90, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", ...B, fontSize: 24, color: A2.ink }}>たいち｜積立保険を売らない保険屋さん</div>
            <div style={{ position: "absolute", left: 30, top: 130, maxWidth: 380, background: "#fff", borderRadius: 26, padding: "16px 22px", ...B, fontSize: 24, color: A2.ink }}>友だち追加ありがとうございます！<br />下のメニューからどうぞ</div>
            <Img src={staticFile("nencho_cta/richmenu.png")} style={{ position: "absolute", left: 0, top: PH - rmH, width: PW }} />
            {f >= tPick ? <div style={{ position: "absolute", left: hx, top: hy, width: hw, height: hh, borderRadius: 10, border: "8px solid #FFD43B", boxShadow: "0 0 0 8px rgba(255,212,59,0.35)", transform: `scale(${pulse})`, boxSizing: "border-box" }} /> : null}
          </div>
        ) : null}
      </div>
      <Tap at={tLink} x={190} y={70 + PW * 857 / 1179} />
      <Tap at={tLine} x={240} y={PH - 470 + 32 + PW * 70 / 1179} />
      <Tap at={tMenu + 22} x={hx + hw / 2} y={hy + hh / 2} />
      {/* 「特典はここ！」吹き出し */}
      {f >= tPick ? (
        <div style={{ position: "absolute", left: hx + hw / 2 - 170, top: hy - 140, width: 340, textAlign: "center", transform: `scale(${pop(f, tPick)})`, transformOrigin: "50% 100%" }}>
          <div style={{ display: "inline-block", background: A2.coral, color: "#fff", ...B, fontSize: 40, padding: "12px 28px", borderRadius: 22, whiteSpace: "nowrap" }}>特典はここ！</div>
          <div style={{ width: 0, height: 0, margin: "0 auto", borderLeft: "16px solid transparent", borderRight: "16px solid transparent", borderTop: `18px solid ${A2.coral}` }} />
        </div>
      ) : null}
    </div>
  );
};

// ═══════════════ 締め（115.52–）：太一がしゃべる → ガイドの画面収録 → スマホでLINEまで ═══════════════
const Outro: React.FC = () => {
  const f = useCurrentFrame();
  const guide = F(119.32), line = F(124.8);
  const bg = interpolate(f, [guide, guide + 12], [0, 1], out);
  const card = interpolate(f, [guide + 4, guide + 16], [0, 1], out);
  const cardOut = interpolate(f, [line - 6, line + 4], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  return (
    <Scene a={115.52} b={131.0} inT="zoom">
      {/* 背景：ガイドの画面収録をぼかして流す */}
      {f >= guide - 1 ? (
        <AbsoluteFill style={{ opacity: bg }}>
          <Sequence from={guide}><OffthreadVideo src={staticFile("nencho_cta/guide.mp4")} muted style={{ width: 1080, height: 1920, objectFit: "cover", filter: "blur(18px) saturate(1.1)", transform: "scale(1.12)" }} /></Sequence>
          <AbsoluteFill style={{ background: "rgba(251,246,216,0.45)" }} />
        </AbsoluteFill>
      ) : null}
      {f < guide + 8 ? (
        <div style={{ position: "absolute", inset: 0, opacity: 1 - interpolate(f, [guide, guide + 8], [0, 1], clamp) }}>
          <Punch at={115.6} y={300} size={56}>一見ややこしいけど</Punch>
          <Punch at={117.66} y={390} size={70}><span style={{ color: A2.green }}>変わった所</span>を押さえれば大丈夫</Punch>
        </div>
      ) : null}
      <BigTaichi a={115.52} b={119.32} poses={[[115.52, "taichi_talk_closed", "taichi_talk_open"], [117.66, "taichi_ok_hand", undefined], [118.6, "taichi_talk_closed", "taichi_talk_open"]]} shrinkTo />
      {/* 完全ガイド：実物の画面をカードで見せる */}
      {card > 0 && cardOut < 1 ? (
        <div style={{ position: "absolute", left: 160, top: 420, width: 760, transform: `translateY(${(1 - card) * 80 - cardOut * 200}px) scale(${1 - cardOut * 0.1})`, opacity: card * (1 - cardOut) }}>
          <div style={{ textAlign: "center", marginBottom: 18 }}><span style={{ display: "inline-block", background: A2.ink, color: "#fff", ...B, fontSize: 40, padding: "10px 32px", borderRadius: 999 }}>2026年版 <span style={{ color: "#FFE07A" }}>年末調整 完全ガイド</span></span></div>
          <div style={{ borderRadius: 28, overflow: "hidden", boxShadow: "0 24px 50px rgba(0,0,0,0.25)", border: "8px solid #fff", height: 900 }}>
            <Sequence from={guide}><OffthreadVideo src={staticFile("nencho_cta/guide.mp4")} muted style={{ width: 744, height: 1102, objectFit: "cover", objectPosition: "top" }} /></Sequence>
          </div>
          <div style={{ textAlign: "center", marginTop: 18 }}><span style={{ ...B, fontSize: 36, color: A2.ink, background: "rgba(255,255,255,0.85)", padding: "6px 22px", borderRadius: 14 }}>実際の用紙を見ながら書ける</span></div>
        </div>
      ) : null}
      {/* スマホ：プロフ → リンク → 公式LINE → 情報まとめ */}
      <Phone a={124.8} />
      {f >= line && f < F(127.6) ? <div style={{ position: "absolute", left: 0, top: 200, width: 1080, textAlign: "center", transform: `scale(${pop(f, line)})` }}><span style={{ display: "inline-block", background: "#06C755", color: "#fff", ...B, fontSize: 40, padding: "10px 34px", borderRadius: 999 }}>プロフィールの公式LINEから</span></div> : null}
      <Taichi name="taichi_point_upright" at={128.3} until={131.0} side="left" mouth={NENCHO_MOUTH} />
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
  { file: "dadan", at: F(1.1), volume: 0.36 },
  { file: "user/u05", at: F(2.58), volume: 0.28 },
  ...[5.3, 6.1, 6.7].map((t) => ({ file: "user/u02s", at: F(t), volume: 0.22 })),
  ...[9.04, 10.72, 29.5, 75.66, 96.92, 115.52].map((t) => ({ file: "user/u03", at: F(t), volume: 0.26 })),
  ...[10.72, 29.5, 75.66].map((t) => ({ file: "swipe", at: F(t) - 2, volume: 0.2 })),
  // ページ送り
  ...[14.52, 18.14, 24.9, 34.62, 42.1, 48.42, 55.68, 61.92, 65.94, 69.02, 77.34, 82.46, 86.86, 90.96].map((t) => ({ file: "user/u02s", at: F(t), volume: 0.2 })),
  // 去年→今年の数字
  ...[12.6, 16.4, 73.9].map((t) => ({ file: "user/u05s", at: F(t), volume: 0.26 })),
  // 壁がグッと上がる
  ...[22.28, 32.6, 46.4, 53.7].map((t) => ({ file: "dadan", at: F(t), volume: 0.34 })),
  ...[22.28, 32.6, 46.4, 53.7].map((t) => ({ file: "user/u05", at: F(t) + 10, volume: 0.24 })),
  // 用紙のズーム
  ...[25.6, 36.0, 62.5, 76.0].map((t) => ({ file: "user/u05s", at: F(t) + 14, volume: 0.22 })),
  { file: "user/u05", at: F(40.68), volume: 0.26 },
  ...[0, 1, 2].map((i) => ({ file: "user/u02s", at: F(57.74) + 4 + i * 9, volume: 0.18 })),
  { file: "user/u05s", at: F(58.9), volume: 0.24 },
  { file: "thunk", at: F(66.6), volume: 0.28 },
  { file: "thud", at: F(27.76), volume: 0.3 },
  { file: "thud", at: F(80.8), volume: 0.34 },
  { file: "user/u05", at: F(84.3), volume: 0.28 },
  { file: "user/u05", at: F(88.4), volume: 0.28 },
  ...[91.2, 93.88].map((t) => ({ file: "user/u02s", at: F(t), volume: 0.22 })),
  { file: "thud", at: F(95.6), volume: 0.34 },
  ...[96.92, 100.44, 104.0].map((t) => ({ file: "user/u02s", at: F(t) + 8, volume: 0.22 })),
  { file: "user/u05", at: F(109.76), volume: 0.26 },
  { file: "user/u05s", at: F(119.32), volume: 0.26 },
  { file: "user/u03s", at: F(124.8), volume: 0.26 },
  ...[125.7, 126.75, 127.85].map((t) => ({ file: "tap", at: F(t), volume: 0.35 })),
  { file: "user/u10", at: F(128.0), volume: 0.3 },
];

export const NENCHO_FRAMES = F(131.0);
export const NenchoReel: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: A2.bg, fontFamily: FONT }}>
    <Audio src={staticFile("nencho-narration.wav")} />
    <SfxTrack cues={CUES} />
    <Hook /><BigTree a={9.04} b={10.72} title="今年 変わったのは3つ" /><Kiso /><Fuyo /><Seiho /><Matome /><TabBar /><Outro />
    <SubFade />
    <Captions subs={SUBS} end={127.7} />
  </AbsoluteFill>
);
