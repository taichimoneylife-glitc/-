import React from "react";
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from "remotion";
import { A2 } from "./components/kit2";
import { FONT, FONT_BLACK } from "./components/font";
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

// ═══════════════ ① 基礎控除（10.72–29.5）：年収ものさしに「控除のブロック」を積む ═══════════════
const Y0 = (man: number) => 1190 - man * 3.45; // 0万=1190, 220万≈431
const Ticks: React.FC<{ Y: (m: number) => number; from: number; to: number; step: number; label: number }> = ({ Y, from, to, step, label }) => (
  <>
    <div style={{ position: "absolute", left: 128, top: Y(to) - 10, width: 22, height: Y(from) - Y(to) + 20, borderRadius: 11, background: "#fff", boxShadow: "inset 0 0 0 4px #E2D9B8" }} />
    {Array.from({ length: Math.round((to - from) / step) + 1 }).map((_, i) => {
      const m = from + i * step;
      const major = m % label === 0;
      return (
        <React.Fragment key={m}>
          <div style={{ position: "absolute", left: 150, top: Y(m) - 2, width: major ? 30 : 14, height: 4, background: "#CFC4A0" }} />
          {major ? <div style={{ position: "absolute", left: 0, top: Y(m) - 18, width: 118, textAlign: "right", ...B, fontSize: 26, color: A2.sub }}>{m}万</div> : null}
        </React.Fragment>
      );
    })}
  </>
);
const KisoRuler: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = (at: number) => spring({ frame: f - F(at), fps, config: { damping: 14, stiffness: 120 } });
  const appear = interpolate(f, [F(10.8), F(10.8) + 10], [0, 1], out);
  const kiso = 95 + 9 * sp(11.92);        // 95→104
  const kyuyo = 65 + 9 * sp(14.52);       // 65→74
  const top = kiso + kyuyo;               // 160→178
  const lineOn = f >= F(18.14);
  const big = F(22.28);
  const X = 300, W = 300;
  const blk = (from: number, to: number, c: string, label: string, val: number, on: boolean) => (
    <div style={{ position: "absolute", left: X, top: Y0(to), width: W, height: (to - from) * 3.45, borderRadius: 18, background: c, boxShadow: on ? `0 0 0 6px ${c}44` : undefined, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff", opacity: appear }}>
      <div style={{ ...B, fontSize: 30 }}>{label}</div>
      <div style={{ whiteSpace: "nowrap" }}><span style={{ ...K, fontSize: 66 }}>{Math.round(val)}</span><span style={{ ...B, fontSize: 30 }}>万円</span></div>
    </div>
  );
  return (
    <>
      <div style={{ position: "absolute", left: 0, top: 410, width: 1080, textAlign: "center", ...K, fontSize: 46, color: A2.ink }}>税金がかからない「土台」</div>
      <Ticks Y={Y0} from={0} to={200} step={10} label={50} />
      {/* 去年の高さ（点線） */}
      {f >= F(12.2) ? <div style={{ position: "absolute", left: X - 10, top: Y0(65 + 95), width: W + 20, borderTop: "5px dashed #BDB28F" }} /> : null}
      {blk(0, kyuyo, BLUE, "給与所得控除", kyuyo, f >= F(14.52) && f < F(18.14))}
      {blk(kyuyo, top, A2.green, "基礎控除", kiso, f >= F(11.92) && f < F(14.52))}
      {/* UPラベル */}
      {f >= F(11.92) && f < F(18.14) ? <div style={{ position: "absolute", left: X + W + 30, top: Y0(top) - 10, transform: `scale(${pop(f, F(11.92))})`, transformOrigin: "0 50%" }}><Pill bg={A2.green} size={36}>基礎控除 95→104万</Pill></div> : null}
      {f >= F(14.52) && f < F(18.14) ? <div style={{ position: "absolute", left: X + W + 30, top: Y0(kyuyo / 2) - 30, transform: `scale(${pop(f, F(14.52))})`, transformOrigin: "0 50%" }}><Pill bg={BLUE} size={36}>給与所得控除 65→74万</Pill></div> : null}
      {/* ライン：所得税がかかり始める年収 */}
      {lineOn ? (
        <>
          <div style={{ position: "absolute", left: 140, top: Y0(160) - 3, width: 860 * interpolate(f, [F(18.14), F(18.14) + 12], [0, 1], out), borderTop: "6px dashed #BDB28F" }} />
          <div style={{ position: "absolute", left: 140, top: Y0(178) - 7, width: 860 * interpolate(f, [F(18.14), F(18.14) + 12], [0, 1], out), height: 14, borderRadius: 7, background: A2.red, boxShadow: `0 0 0 6px ${A2.red}33` }} />
          <div style={{ position: "absolute", left: X + W + 40, top: Y0(160) + 10, ...B, fontSize: 32, color: A2.sub, opacity: interpolate(f, [F(20.62), F(20.62) + 8], [0, 1], clamp) }}>去年 <span style={{ textDecoration: "line-through" }}>160万円</span></div>
        </>
      ) : null}
      {f >= F(20.62) ? <div style={{ position: "absolute", left: X + W + 20, top: Y0(160) + 62, ...B, fontSize: 32, color: A2.ink, opacity: interpolate(f, [F(20.62), F(20.62) + 8], [0, 1], clamp) }}>所得税がかかり始める年収</div> : null}
      {f >= big ? (
        <div style={{ position: "absolute", left: X + W + 20, top: Y0(160) + 105, transform: `scale(${pop(f, big)})`, transformOrigin: "0 0", whiteSpace: "nowrap" }}>
          <Count at={big / 30} to={178} dur={12} style={{ ...K, fontSize: 150, color: A2.red, lineHeight: 1 }} /><span style={{ ...K, fontSize: 52, color: A2.ink }}>万円超</span>
        </div>
      ) : null}
      {f >= big + 6 ? <div style={{ position: "absolute", left: X + W + 30, top: Y0(160) + 275, transform: `scale(${pop(f, big + 6)})` }}><Pill bg={A2.red} size={34}>＋18万円</Pill></div> : null}
      {f >= F(10.9) ? <div style={{ position: "absolute", left: 770, top: 960, transform: `scale(${pop(f, F(10.9))})` }}><GenSlot name="nencho_payslip" size={230} /></div> : null}
      <Note at={22.8} y={1235}>※給与だけの場合の目安。所得税の話（住民税の基礎控除は43万円のまま）</Note>
    </>
  );
};
const Kiso: React.FC = () => (
  <Scene a={10.72} b={29.5}>
    <Page a={10.72} b={24.9}><KisoRuler /></Page>
    <Page a={24.9} b={29.6}>
      <FormZoom at={24.9} zoomAt={25.6} src="kiso" title="基礎控除申告書（令和8年分）" reg={[0.055, 0.355, 0.38, 0.595]} mark={[0.062, 0.383, 0.282, 0.406]} color={A2.green} note={<>合計所得489万円以下なら <span style={{ color: "#FFE07A" }}>104万円</span></>} />
      <div style={{ position: "absolute", inset: 0 }}><Stamp at={27.76} x={250} y={1210} text="自分の金額は必ず確認" size={50} rot={-3} /></div>
    </Page>
  </Scene>
);

// ═══════════════ ② 扶養（29.5–75.66）：家族の年収ものさしに、ラインが次々に上がる ═══════════════
const Y1 = (man: number) => 1190 - (man - 100) * 6.6; // 100万=1190, 210万≈464
const FLINES: { at: number; from: number; to: number; c: string; label: string; img: string }[] = [
  { at: 29.7, from: 123, to: 136, c: BLUE, label: "扶養控除", img: "mile_family_happy" },
  { at: 42.2, from: 160, to: 169, c: "#8A62C9", label: "配偶者特別控除（満額）", img: "nencho_couple_parttime" },
  { at: 48.5, from: 150, to: 159, c: A2.green, label: "19〜22歳の子（63万円）", img: "nencho_student_parttime" },
];
const FuyoRuler: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / 30;
  let active = -1;
  FLINES.forEach((l, i) => { if (t >= l.at) active = i; });
  const band = F(57.74);
  const bandP = interpolate(f, [band, band + 18], [0, 1], out);
  const appear = interpolate(f, [F(29.6), F(29.6) + 10], [0, 1], out);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: appear }}>
      <div style={{ position: "absolute", left: 0, top: 410, width: 1080, textAlign: "center", ...K, fontSize: 46, color: A2.ink }}>家族の<span style={{ color: BLUE }}>年収</span>のライン</div>
      <Ticks Y={Y1} from={100} to={200} step={10} label={20} />
      {/* 特定親族特別控除：159万〜197万は段階的に残る */}
      {bandP > 0 ? (
        <div style={{ position: "absolute", left: 160, top: Y1(197), width: 840 * bandP, height: Y1(159) - Y1(197), background: `linear-gradient(${A2.green}08, ${A2.green}55)`, borderTop: `4px dashed ${A2.green}` }}>
          <div style={{ position: "absolute", left: 30, top: 18, ...B, fontSize: 32, color: A2.green, whiteSpace: "nowrap", opacity: bandP }}>〜197万円まで 控除が段階的に残る</div>
          <div style={{ position: "absolute", left: 30, top: 62, ...B, fontSize: 24, color: A2.sub, whiteSpace: "nowrap", opacity: bandP }}>特定親族特別控除</div>
        </div>
      ) : null}
      {FLINES.map((l, i) => {
        if (i > active) return null;
        const s = spring({ frame: f - F(l.at) - 10, fps, config: { damping: 13, stiffness: 120 } });
        const v = l.from + (l.to - l.from) * s;
        const on = i === active && f < band;
        const dim = !on && active !== -1 && f < band ? 0.45 : f >= band && i !== 2 ? 0.45 : 1;
        const w = interpolate(f, [F(l.at), F(l.at) + 10], [0, 1], out);
        return (
          <React.Fragment key={l.label}>
            {on ? <div style={{ position: "absolute", left: 160, top: Y1(l.from) - 3, width: 840 * w, borderTop: "5px dashed #BDB28F" }} /> : null}
            {on ? <div style={{ position: "absolute", left: 640, top: Y1(l.from) + 8, ...B, fontSize: 28, color: A2.sub }}>去年 <span style={{ textDecoration: "line-through" }}>{l.from}万円</span></div> : null}
            <div style={{ position: "absolute", left: 160, top: Y1(v) - (on ? 7 : 4), width: 840 * w, height: on ? 14 : 8, borderRadius: 7, background: l.c, opacity: dim, boxShadow: on ? `0 0 0 6px ${l.c}33` : undefined }} />
            <div style={{ position: "absolute", right: 70, top: Y1(v) - (on ? 120 : 52), textAlign: "right", opacity: dim, whiteSpace: "nowrap", transform: on ? `scale(${pop(f, F(l.at) + 10)})` : undefined, transformOrigin: "100% 100%" }}>
              <div style={{ ...B, fontSize: on ? 30 : 24, color: l.c }}>{l.label}</div>
              {on ? <div><Count at={(F(l.at) + 10) / 30} to={l.to} dur={14} style={{ ...K, fontSize: 96, color: l.c, lineHeight: 1 }} /><span style={{ ...K, fontSize: 40, color: A2.ink }}>万円</span></div> : <div style={{ ...K, fontSize: 36, color: l.c }}>{l.to}万円</div>}
            </div>
            {on ? <div style={{ position: "absolute", left: 200, top: Y1(l.to) - 250, transform: `scale(${pop(f, F(l.at) + 6)})` }}><GenSlot name={l.img} size={230} /></div> : null}
          </React.Fragment>
        );
      })}
      {f >= F(30.5) && f < F(34.62) ? <Note at={30.5} y={1235}>※給与だけの場合の目安。税金の扶養と、社会保険の扶養（130万円）は別の制度</Note> : null}
    </div>
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
      <div style={{ position: "absolute", left: 0, top: 410, width: 1080, textAlign: "center", ...K, fontSize: 56, color: A2.ink, opacity: k }}>書くのは<span style={{ color: A2.red }}>「所得」</span>（年収じゃない）</div>
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
const Fuyo: React.FC = () => (
  <Scene a={29.5} b={75.66} inT="drop">
    <Page a={29.5} b={34.62}><FuyoRuler /></Page>
    <Page a={34.62} b={42.1}><ShotokuPage /></Page>
    <Page a={42.1} b={61.92}><FuyoRuler /></Page>
    <Page a={61.92} b={65.94}>
      <FormZoom at={61.92} zoomAt={62.5} src="fuyo" title="扶養控除等申告書（令和8年分）" reg={[0.03, 0.76, 0.92, 0.94]} mark={[0.03, 0.795, 0.92, 0.93]} kz={2.1} fxr={0.3} color={BLUE} note={<>16歳未満の子は<span style={{ color: "#FFE07A" }}>「住民税に関する事項」</span>に記入</>} />
    </Page>
    <Page a={65.94} b={72.6}>
      <Punch at={66.0} y={420} size={48}>扶養控除がない16歳未満の子でも…</Punch>
      {useCurrentFrame() >= F(69.02) ? <BeforeAfter at={69.02} y={540} label={<>23歳未満の扶養親族がいる人</>} sub="一般生命保険料控除の上限" from={4} to={6} color={ORANGE} imgs={["nencho_small_kids", "nencho_insurance_doc"]} imgSize={180} /> : null}
    </Page>
    <Page a={72.6} b={75.8}>
      <FormZoom at={72.6} zoomAt={73.1} src="hoken" title="保険料控除申告書（令和8年分）" reg={[0.06, 0.33, 0.48, 0.48]} mark={[0.07, 0.402, 0.33, 0.44]} color={ORANGE} note={<>新しい欄：<span style={{ color: "#FFE07A" }}>23歳未満の扶養親族の有無</span></>} />
    </Page>
  </Scene>
);

// ═══════════════ ③ 生命保険料控除（75.66–96.92）：「控除6万円」と「戻る額」を長さで比べる ═══════════════
const Seiho: React.FC = () => {
  const f = useCurrentFrame();
  const L1 = interpolate(f, [F(77.6), F(77.6) + 14], [0, 1], out);
  const L2 = interpolate(f, [F(85.0), F(85.0) + 12], [0, 1], out);
  return (
    <Scene a={75.66} b={96.92}>
      <Page a={75.66} b={86.86}>
        <div style={{ position: "absolute", left: 0, top: 410, width: 1080, textAlign: "center", ...K, fontSize: 50, color: A2.ink }}>控除<span style={{ color: ORANGE }}>6万円</span>で、いくら戻る？</div>
        {/* 控除される額 */}
        <div style={{ position: "absolute", left: 70, top: 560, ...B, fontSize: 32, color: A2.ink }}>控除される額</div>
        <div style={{ position: "absolute", left: 70, top: 610, width: 940 * L1, height: 120, borderRadius: 24, background: `linear-gradient(90deg, #F6A07F, ${ORANGE})`, display: "flex", alignItems: "center", paddingLeft: 30, boxSizing: "border-box", overflow: "hidden" }}>
          <span style={{ ...K, fontSize: 70, color: "#fff", whiteSpace: "nowrap" }}>6万円</span>
        </div>
        {f >= F(79.46) ? <div style={{ position: "absolute", inset: 0 }}><Stamp at={79.46} x={420} y={760} text="そのまま戻る額じゃない" color={A2.red} size={46} rot={-4} /></div> : null}
        {/* × 所得税率 */}
        {f >= F(82.46) ? <div style={{ position: "absolute", left: 70, top: 880, transform: `scale(${pop(f, F(82.46))})`, transformOrigin: "0 50%" }}><span style={{ ...B, fontSize: 38 }}>× 所得税率 </span><span style={{ ...K, fontSize: 64, color: A2.ink }}>10%</span><span style={{ ...B, fontSize: 30, color: A2.sub }}>（の人なら）</span></div> : null}
        {/* 戻る額 */}
        {f >= F(84.08) ? <div style={{ position: "absolute", left: 70, top: 980, ...B, fontSize: 32, color: A2.ink }}>実際に安くなる税金</div> : null}
        <div style={{ position: "absolute", left: 70, top: 1030, width: 94 * L2, height: 120, borderRadius: 20, background: A2.green }} />
        {L2 > 0.9 ? <div style={{ position: "absolute", left: 190, top: 1030, transform: `scale(${pop(f, F(85.3))})`, transformOrigin: "0 50%", whiteSpace: "nowrap" }}><span style={{ ...B, fontSize: 36 }}>年間 約</span><Count at={85.3} to={6000} dur={12} comma style={{ ...K, fontSize: 100, color: A2.green, lineHeight: 1.1 }} /><span style={{ ...B, fontSize: 40 }}>円</span></div> : null}
        {L2 > 0.9 ? <div style={{ position: "absolute", left: 790, top: 960, transform: `scale(${pop(f, F(85.6))})` }}><GenSlot name="nencho_coins_small" size={200} /></div> : null}
      </Page>
      <Page a={86.86} b={90.96}>
        <Punch at={86.9} y={440} size={52}>しかも最大まで使うには</Punch>
        <PopAt at={88.28} x={0} y={560} w={1080} center>
          <div style={{ ...B, fontSize: 36, color: A2.sub }}>一般生命保険料が 年間</div>
          <div style={{ whiteSpace: "nowrap" }}><Count at={88.4} to={12} dur={10} style={{ ...K, fontSize: 220, color: ORANGE, letterSpacing: -6 }} /><span style={{ ...K, fontSize: 70, color: A2.ink }}>万円超</span></div>
        </PopAt>
        <ImgRow at={88.9} y={900} names={["nencho_piggy_heavy"]} size={300} />
      </Page>
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
