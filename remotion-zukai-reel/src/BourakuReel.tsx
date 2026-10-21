import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from "remotion";
import { A2, Mark2 } from "./components/kit2";
import { FONT } from "./components/font";
import { SfxTrack } from "./components/sfx";
import { B, GenSlot, In, Head, SubFade } from "./MileLifePlan";
import { MOUTH } from "./bourakuMouth";

// ════════════════════════════════════════════════════════════════════
//  暴落対策（オルカン）図解パート。音声＝public/bouraku-narration.wav（70.4秒）
//  見た目＝マイル完成版と同じ（薄黄×緑×コーラル、画像は背景に直置き、ぼかし転換）
//  画像は GenSlot（public/gen に置いて `node scripts/gen-manifest.mjs` で自動差し替え）
//  台本＝script_bouraku_final.md（音声は「計画的に用意できる」など一部言い回しが録音どおり）
// ════════════════════════════════════════════════════════════════════

const F = (t: number) => Math.round(t * 30);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const io = { ...clamp, easing: Easing.inOut(Easing.cubic) };
const out = { ...clamp, easing: Easing.out(Easing.cubic) };
const pop = (f: number, at: number) => interpolate(f - at, [0, 3, 6], [0.3, 1.2, 1], clamp);
const STOCK = A2.green, BOND = "#4A8FD6", CASH = "#E9B82E";

type Trans = "whip" | "drop" | "punch" | "zoom";
// 場面転換：意味に合わせて使い分ける
//  whip＝右からシュッ→左へ加速して抜ける（基本） / drop＝下へストンと落ちて抜ける（落とし穴）
//  punch＝ドンと拡大して入り、揺れる（山場） / zoom＝奥から寄って入り、手前に抜ける（締め）
const Scene: React.FC<{ a: number; b: number; inT?: Trans; outT?: Trans; children: React.ReactNode }> = ({ a, b, inT = "whip", outT = "whip", children }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const A = F(a), Bf = F(b);
  if (f < A - 1 || f >= Bf + 8) return null;
  const s = spring({ frame: f - A, fps, config: inT === "punch" ? { damping: 8, stiffness: 260, mass: 0.6 } : { damping: 13, stiffness: 210, mass: 0.7 } });
  const o = interpolate(f, [Bf, Bf + 8], [0, 1], { ...clamp, easing: Easing.in(Easing.exp) });
  const inB = interpolate(f - A, [0, 6], [12, 0], clamp);
  let tx = 0, ty = 0, sc = 1, rot = 0;
  if (inT === "whip") { tx += (1 - s) * 520; sc *= 0.96 + 0.04 * Math.min(s, 1); }
  if (inT === "punch") { sc *= 1.25 - 0.25 * s; }
  if (inT === "zoom") { sc *= 0.82 + 0.18 * s; }
  if (inT === "drop") { ty += -(1 - s) * 700; }
  if (outT === "whip") tx -= o * 900;
  if (outT === "drop") { ty += o * 1400; rot += o * 6; }
  if (outT === "zoom") sc *= 1 + o * 0.5;
  if (outT === "punch") sc *= 1 - o * 0.2;
  const blur = Math.max(inB, o * 22);
  return <AbsoluteFill style={{ opacity: Math.min(1, (f - A + 1) / 3) * (1 - o * 0.6), filter: blur > 0.3 ? `blur(${blur}px)` : undefined, transform: `translate(${tx}px, ${ty}px) scale(${sc}) rotate(${rot}deg)` }}>{children}</AbsoluteFill>;
};
// 画面ゆれ（衝撃の瞬間）
const useShake = (at: number, power = 18, dur = 14) => {
  const f = useCurrentFrame();
  const k = interpolate(f - at, [0, dur], [1, 0], clamp);
  if (f < at || k <= 0) return "";
  return `translate(${Math.sin((f - at) * 2.7) * power * k}px, ${Math.cos((f - at) * 3.3) * power * 0.6 * k}px)`;
};
// 1つの場面の中のページ送り（a〜b の間だけ出す。ぼかし＋少しズームで入れ替わる）
const Page: React.FC<{ a: number; b: number; children: React.ReactNode }> = ({ a, b, children }) => {
  const f = useCurrentFrame();
  const A = F(a), Bf = F(b);
  if (f < A - 1 || f >= Bf + 6) return null;
  const i = interpolate(f, [A - 1, A + 6], [1, 0], out);
  const o = interpolate(f, [Bf, Bf + 6], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const k = Math.max(i, o);
  return <AbsoluteFill style={{ opacity: 1 - k, filter: k > 0.02 ? `blur(${k * 14}px)` : undefined, transform: `scale(${1 + i * 0.06 - o * 0.06})` }}>{children}</AbsoluteFill>;
};
// 大きな数字（主役）
const Hero: React.FC<{ at: number; y: number; pre?: string; to: number; unit: string; sub?: string; color?: string; comma?: boolean; size?: number }> = ({ at, y, pre, to, unit, sub, color = A2.green, comma, size = 210 }) => (
  <PopAt at={at} x={0} y={y} w={1080} center>
    <div style={{ whiteSpace: "nowrap", lineHeight: 1 }}>
      {pre ? <span style={{ ...B, fontSize: size * 0.34, color: A2.ink }}>{pre}</span> : null}
      <Count at={at} to={to} comma={comma} style={{ ...B, fontSize: size, color, letterSpacing: -4 }} />
      <span style={{ ...B, fontSize: size * 0.34, color: A2.ink }}>{unit}</span>
    </div>
    {sub ? <div style={{ ...B, fontSize: 34, color: A2.sub, marginTop: 12 }}>{sub}</div> : null}
  </PopAt>
);

// 画像（直置き＋足元の影、任意でふわふわ）
const Pic: React.FC<{ name: string; size: number; bob?: boolean }> = ({ name, size, bob }) => {
  const f = useCurrentFrame();
  const y = bob ? Math.sin(f / 10) * 8 : 0;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <div style={{ position: "absolute", left: size * 0.2, right: size * 0.2, bottom: -size * 0.02, height: size * 0.08, borderRadius: "50%", background: "rgba(80,60,20,0.13)", filter: "blur(6px)" }} />
      <div style={{ position: "relative", transform: `translateY(${y}px)` }}><GenSlot name={name} size={size} /></div>
    </div>
  );
};
const PopAt: React.FC<{ at: number; x: number; y: number; w?: number; center?: boolean; children: React.ReactNode }> = ({ at, x, y, w, center, children }) => {
  const f = useCurrentFrame();
  const A = F(at);
  if (f < A) return null;
  return <div style={{ position: "absolute", left: x, top: y, width: w, textAlign: center ? "center" : undefined, transform: `scale(${pop(f, A)})` }}>{children}</div>;
};
const Pill: React.FC<{ bg?: string; color?: string; size?: number; children: React.ReactNode }> = ({ bg = A2.coral, color = "#fff", size = 44, children }) => (
  <span style={{ display: "inline-block", background: bg, color, ...B, fontSize: size, padding: `${size * 0.22}px ${size * 0.7}px`, borderRadius: 999, whiteSpace: "nowrap" }}>{children}</span>
);
const Stamp: React.FC<{ at: number; x: number; y: number; text: string; color?: string; size?: number; rot?: number }> = ({ at, x, y, text, color = A2.coral, size = 76, rot = -6 }) => {
  const f = useCurrentFrame();
  const A = F(at);
  if (f < A) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `rotate(${rot}deg) scale(${interpolate(f - A, [0, 4, 7], [1.8, 0.92, 1], clamp)})`, opacity: interpolate(f - A, [0, 3], [0, 1], clamp), background: A2.bg, border: `8px solid ${color}`, borderRadius: 24, padding: "8px 34px", ...B, fontSize: size, color, whiteSpace: "nowrap" }}>{text}</div>
  );
};

// ── 国旗（CSSで描く簡易版） ──
const Flag: React.FC<{ c: string; w?: number }> = ({ c, w = 96 }) => {
  const h = w * 0.66;
  const box: React.CSSProperties = { width: w, height: h, borderRadius: 8, overflow: "hidden", position: "relative", boxShadow: "0 4px 10px rgba(80,60,20,0.18)", border: "2px solid #fff" };
  const v = (cols: string[]) => <div style={{ ...box, display: "flex" }}>{cols.map((x, i) => <div key={i} style={{ flex: 1, background: x }} />)}</div>;
  const hz = (cols: string[]) => <div style={{ ...box, display: "flex", flexDirection: "column" }}>{cols.map((x, i) => <div key={i} style={{ flex: 1, background: x }} />)}</div>;
  if (c === "jp") return <div style={{ ...box, background: "#fff" }}><div style={{ position: "absolute", left: "50%", top: "50%", width: h * 0.6, height: h * 0.6, marginLeft: -h * 0.3, marginTop: -h * 0.3, borderRadius: "50%", background: "#BC002D" }} /></div>;
  if (c === "fr") return v(["#0055A4", "#fff", "#EF4135"]);
  if (c === "it") return v(["#009246", "#fff", "#CE2B37"]);
  if (c === "de") return hz(["#000", "#DD0000", "#FFCE00"]);
  if (c === "in") return <div style={{ ...box, display: "flex", flexDirection: "column" }}>{["#FF9933", "#fff", "#138808"].map((x, i) => <div key={i} style={{ flex: 1, background: x }} />)}<div style={{ position: "absolute", left: "50%", top: "50%", width: h * 0.26, height: h * 0.26, marginLeft: -h * 0.13, marginTop: -h * 0.13, borderRadius: "50%", border: `${Math.max(2, w / 40)}px solid #000080`, boxSizing: "border-box" }} /></div>;
  if (c === "ca") return <div style={{ ...box, display: "flex" }}><div style={{ flex: 1, background: "#D52B1E" }} /><div style={{ flex: 2, background: "#fff", position: "relative" }}><div style={{ position: "absolute", left: "50%", top: "50%", width: h * 0.32, height: h * 0.32, marginLeft: -h * 0.16, marginTop: -h * 0.16, background: "#D52B1E", transform: "rotate(45deg)" }} /></div><div style={{ flex: 1, background: "#D52B1E" }} /></div>;
  if (c === "br") return <div style={{ ...box, background: "#009C3B" }}><div style={{ position: "absolute", left: "50%", top: "50%", width: h * 0.62, height: h * 0.62, marginLeft: -h * 0.31, marginTop: -h * 0.31, background: "#FFDF00", transform: "rotate(45deg) scaleX(1.35)" }} /><div style={{ position: "absolute", left: "50%", top: "50%", width: h * 0.34, height: h * 0.34, marginLeft: -h * 0.17, marginTop: -h * 0.17, borderRadius: "50%", background: "#002776" }} /></div>;
  // us
  return (
    <div style={{ ...box, display: "flex", flexDirection: "column" }}>
      {Array.from({ length: 7 }).map((_, i) => <div key={i} style={{ flex: 1, background: i % 2 ? "#fff" : "#B22234" }} />)}
      <div style={{ position: "absolute", left: 0, top: 0, width: "42%", height: "57%", background: "#3C3B6E" }} />
    </div>
  );
};
const FLAGS = ["us", "jp", "fr", "de", "ca", "in", "it", "br"];
const Count: React.FC<{ at: number; to: number; dur?: number; comma?: boolean; style?: React.CSSProperties }> = ({ at, to, dur = 16, comma, style }) => {
  const f = useCurrentFrame();
  const n = Math.round(interpolate(f, [F(at), F(at) + dur], [0, to], out));
  return <span style={style}>{comma ? n.toLocaleString("en-US") : n}</span>;
};
const Note: React.FC<{ at: number; y?: number; children: React.ReactNode }> = ({ at, y = 1262, children }) => {
  const f = useCurrentFrame();
  if (f < F(at)) return null;
  return <div style={{ position: "absolute", left: 60, right: 60, top: y, textAlign: "center", ...B, fontSize: 24, color: A2.sub, opacity: interpolate(f - F(at), [0, 8], [0, 1], clamp) }}>{children}</div>;
};

// ════════ ① オルカンとは（0–7.44）：1ページ1主役 ════════
const S1: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Scene a={0} b={7.44}>
      <Head text={<>そもそも<span style={{ color: A2.green }}>オルカン</span>って？</>} from={0} />
      {/* P1 世界中に分散＝47カ国 */}
      <Page a={0} b={2.42}>
        <div style={{ position: "absolute", left: 330, top: 400, transform: `rotate(${Math.sin(f / 18) * 3}deg)` }}><PopIn at={0.05}><Pic name="bouraku_globe" size={420} bob /></PopIn></div>
        {FLAGS.map((c, i) => {
          const at = F(0.5) + i * 3;
          if (f < at) return null;
          const ang = (-90 + i * 45 + f * 0.35) * (Math.PI / 180);
          return <div key={c} style={{ position: "absolute", left: 540 + Math.cos(ang) * 300 - 45, top: 610 + Math.sin(ang) * 250 - 30, transform: `scale(${pop(f, at)})` }}><Flag c={c} w={90} /></div>;
        })}
        <Hero at={1.0} y={930} pre="世界" to={47} unit="カ国" sub="先進国23・新興国24" />
      </Page>
      {/* P2 たくさんの企業＝約2,500社、まとめて投資 */}
      <Page a={2.42} b={4.68}>
        <div style={{ position: "absolute", left: 300, top: 390 }}><PopIn at={2.42}><Pic name="bouraku_buildings" size={480} /></PopIn></div>
        <Hero at={2.5} y={930} pre="約" to={2500} comma unit="社" />
        <PopAt at={3.42} x={0} y={1180} w={1080} center><span style={{ ...B, fontSize: 56, color: A2.ink }}><Mark2 delay={F(3.42) + 4}>まとめて投資</Mark2>できる商品</span></PopAt>
      </Page>
      {/* P3 定期的に見直し＝年4回 */}
      <Page a={4.68} b={6.66}>
        <div style={{ position: "absolute", left: 360, top: 420, transform: `rotate(${interpolate(f, [F(4.68), F(4.68) + 24], [-200, 0], out)}deg)` }}><PopIn at={4.68}><Pic name="bouraku_refresh" size={360} /></PopIn></div>
        <Hero at={4.9} y={900} pre="見直し 年" to={4} unit="回" />
        <div style={{ position: "absolute", left: 0, top: 1140, width: 1080, display: "flex", justifyContent: "center", gap: 16 }}>
          {["2月", "5月", "8月", "11月"].map((m, i) => <span key={m} style={{ transform: `scale(${f >= F(5.3) + i * 3 ? pop(f, F(5.3) + i * 3) : 0})` }}><Pill bg="#fff" color={A2.ink} size={36}>{m}</Pill></span>)}
        </div>
      </Page>
      {/* P4 かなり優秀 */}
      <Page a={6.66} b={7.6}>
        <div style={{ position: "absolute", left: 340, top: 420, transform: `rotate(${Math.sin((f - F(6.66)) / 3) * interpolate(f - F(6.66), [0, 14], [12, 0], clamp)}deg)` }}><PopIn at={6.66}><Pic name="bouraku_medal" size={400} /></PopIn></div>
        <div style={{ position: "absolute", inset: 0 }}><Stamp at={6.9} x={260} y={900} text="かなり優秀" color={A2.green} size={96} rot={-4} /></div>
      </Page>
      <Note at={1.0}>※オルカンが連動する指数「MSCI ACWI」（2026年8月末時点）</Note>
    </Scene>
  );
};
const PopIn: React.FC<{ at: number; children: React.ReactNode }> = ({ at, children }) => {
  const f = useCurrentFrame();
  return <div style={{ transform: `scale(${f >= F(at) ? pop(f, F(at)) : 0})` }}>{children}</div>;
};

// ════════ ② 落とし穴（7.44–14.44）：大きな穴に、株の箱と地球儀が落ちる ════════
const S2: React.FC = () => {
  const f = useCurrentFrame();
  const open = F(7.76);
  const lid = interpolate(f, [open, open + 10], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const swap = interpolate(f, [F(10.38), F(10.38) + 10], [0, 1], io);
  const fall = F(12.34), gFall = F(13.2);
  const fallY = (t: number) => interpolate(f, [t, t + 14], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const g = fallY(gFall);
  const land = gFall + 14;
  const shake = useShake(land, 22, 16);
  return (
    <Scene a={7.44} b={14.44} outT="drop">
      <div style={{ position: "absolute", inset: 0, transform: shake }}>
        <Head text={<>ここが<span style={{ color: A2.coral }}>落とし穴</span></>} from={F(7.44)} />
        {/* 大きな断面の穴（画面の下半分） */}
        <div style={{ position: "absolute", left: 60, top: 760 }}><GenSlot name="bouraku_pit_side" size={960} /></div>
        {/* フタ：パカッと外れて飛ぶ */}
        {lid < 1 ? <div style={{ position: "absolute", left: 200 + lid * 600, top: 820 - lid * 260, transform: `rotate(${lid * 80}deg)`, opacity: 1 - lid }}><GenSlot name="bouraku_pit_cover" size={680} /></div> : null}
        {/* 地球儀→中身は全部株式→穴へ落ちる */}
        {f >= F(8.66) ? (
          <div style={{ position: "absolute", left: 340, top: 400 + g * 620, transform: `scale(${pop(f, F(8.66)) * (1 - g * 0.3)}) rotate(${g * 140}deg)` }}>
            <div style={{ position: "relative", width: 400, height: 400 }}>
              <div style={{ position: "absolute", inset: 0 }}><GenSlot name="bouraku_globe" size={400} /></div>
              <div style={{ position: "absolute", left: 80, top: 80, opacity: swap, transform: `scale(${0.6 + 0.4 * swap})` }}><GenSlot name="bouraku_stock_box_many" size={240} /></div>
            </div>
          </div>
        ) : null}
        <PopAt at={10.38} x={0} y={815} w={1080} center><span style={{ display: "inline-block", background: "#fff", borderRadius: 22, padding: "8px 30px", boxShadow: "0 8px 20px rgba(80,60,20,0.12)", ...B, fontSize: 60, color: A2.ink, opacity: 1 - g }}>中身は<span style={{ color: A2.coral }}>全部「株式」</span></span></PopAt>
        {/* 株の箱が次々に落ちる */}
        {[0, 1, 2, 3, 4].map((i) => {
          const t = fall + i * 3;
          if (f < t) return null;
          const p = fallY(t);
          return <div key={i} style={{ position: "absolute", left: 160 + i * 160, top: 300 + p * 760, transform: `rotate(${p * (i % 2 ? 70 : -60)}deg)`, opacity: 1 - p * 0.5 }}><GenSlot name="bouraku_stock_box" size={150} /></div>;
        })}
        {f >= land ? <div style={{ position: "absolute", left: 300, top: 980, transform: `scale(${pop(f, land)})` }}><GenSlot name="bouraku_dust" size={480} /></div> : null}
        {/* 過去の暴落（上が空いたところに大きく） */}
        {f >= land ? (
          <div style={{ position: "absolute", left: 0, top: 400, width: 1080, display: "flex", justifyContent: "center", gap: 40 }}>
            {[["2008年", 56, "リーマン"], ["2020年", 34, "コロナ"]].map(([y, v, n], i) => (
              <div key={y as string} style={{ textAlign: "center", transform: `scale(${pop(f, land + 2 + i * 5)})`, background: "#fff", borderRadius: 28, padding: "16px 34px", boxShadow: "0 14px 30px rgba(80,60,20,0.12)" }}>
                <div style={{ ...B, fontSize: 30, color: A2.sub }}>{y as string}<span style={{ fontSize: 24, marginLeft: 8 }}>{n as string}</span></div>
                <div style={{ whiteSpace: "nowrap" }}><span style={{ ...B, fontSize: 110, color: A2.coral, lineHeight: 1.05 }}>−{v as number}</span><span style={{ ...B, fontSize: 50, color: A2.coral }}>%</span></div>
              </div>
            ))}
          </div>
        ) : null}
        <PopAt at={13.6} x={0} y={680} w={1080} center><Pill size={50}>オルカンも下がる</Pill></PopAt>
        <Note at={13.66}>※世界株指数（MSCI ACWI）の高値からの最大下落率</Note>
      </div>
    </Scene>
  );
};

// ════════ ③ 株だけで分けている（14.44–23.62）：全米・全世界・日経…中身は全部株 → 一緒に落ちる ════════
const FUNDS: [string, string][] = [["全米株式", "#2E9E6B"], ["全世界株式", "#3FB57F"], ["日経平均", "#1F7A52"]];
const S3: React.FC = () => {
  const f = useCurrentFrame();
  const A = F(14.44);
  const allStock = F(19.56);          // 「資産が株に寄っている」
  const crash = F(20.5);              // 3本が一緒に落ちる
  const crashP = interpolate(f, [crash, crash + 12], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const shake = useShake(crash + 10, 20, 16);
  const tilt = interpolate(f, [F(21.24), F(21.24) + 14], [0, -13], { ...clamp, easing: Easing.out(Easing.back(2)) });
  // ミニ折れ線（3本とも同じ形＝同じ動き）
  const W = 780, H = 260;
  const base: [number, number][] = [[0, 0.75], [0.15, 0.62], [0.3, 0.66], [0.45, 0.48], [0.6, 0.42], [0.72, 0.3]];
  const drop: [number, number][] = [[0.72, 0.3], [0.86, 0.78], [1, 0.9]];
  const path = (ps: [number, number][], dy: number) => ps.map(([x, y], i) => `${i ? "L" : "M"}${x * W} ${y * H + dy}`).join(" ");
  const lineP = interpolate(f, [allStock, allStock + 18], [0, 1], out);
  return (
    <Scene a={14.44} b={23.62} inT="drop">
      <div style={{ position: "absolute", inset: 0, transform: shake }}>
        <Head text={<>多くの人が<span style={{ color: A2.coral }}>ハマる</span>落とし穴</>} from={A} />
        {/* P1：分散してるつもり（全米・全世界・日経） */}
        <Page a={14.44} b={19.56}>
          <PopAt at={14.86} x={0} y={400} w={1080} center><span style={{ ...B, fontSize: 52, color: A2.ink }}>「分散してるつもり」</span></PopAt>
          {FUNDS.map(([name, col], i) => {
            const at = F(15.3) + i * 8;
            if (f < at) return null;
            const flip = F(18.38) + i * 4; // 「とりあえず積み立て」で中身＝株のタグ
            return (
              <div key={name} style={{ ...CARD, left: 90, top: 520 + i * 200, width: 900, height: 170, transform: `translateX(${interpolate(f - at, [0, 10], [-200, 0], out)}px)`, opacity: interpolate(f - at, [0, 6], [0, 1], clamp) }}>
                <div style={{ position: "absolute", left: 36, top: 44, ...B, fontSize: 58, color: A2.ink }}>{name}</div>
                <svg width={220} height={90} style={{ position: "absolute", left: 420, top: 40 }}>
                  <path d="M0 80 L40 60 L80 68 L120 40 L160 46 L210 12" fill="none" stroke={col} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {f >= flip ? (
                  <div style={{ position: "absolute", right: 30, top: 50, transform: `scale(${pop(f, flip)})` }}><Pill bg={STOCK} size={40}>中身＝株</Pill></div>
                ) : (
                  <div style={{ position: "absolute", right: 30, top: 54, ...B, fontSize: 36, color: A2.sub }}>✓ 分散？</div>
                )}
              </div>
            );
          })}
          <PopAt at={16.6} x={0} y={1140} w={1080} center><Pill bg={A2.green} size={40}>増やそう増やそう</Pill></PopAt>
        </Page>
        {/* P2：3本を重ねると…同じ動き → 一緒に落ちる */}
        <Page a={19.56} b={21.24}>
          <div style={{ ...CARD, left: 70, top: 400, width: 940, height: 560 }}>
            <div style={{ position: "absolute", left: 36, top: 26, display: "flex", gap: 22 }}>
              {FUNDS.map(([n, c]) => <span key={n} style={{ display: "inline-flex", alignItems: "center", gap: 8, ...B, fontSize: 28, color: A2.ink }}><span style={{ width: 28, height: 8, borderRadius: 4, background: c }} />{n}</span>)}
            </div>
            <svg width={W + 20} height={H + 40} style={{ position: "absolute", left: 80, top: 130, overflow: "visible" }}>
              {[0.33, 0.66].map((g) => <line key={g} x1={0} y1={H * g} x2={W} y2={H * g} stroke={A2.track} strokeWidth={2} />)}
              {FUNDS.map(([n, c], i) => (
                <g key={n}>
                  <path d={path(base, i * 12 - 12)} fill="none" stroke={c} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - lineP} />
                  {crashP > 0 ? <path d={path(drop, i * 12 - 12)} fill="none" stroke={A2.red} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - crashP} /> : null}
                </g>
              ))}
            </svg>
            {f >= crash + 10 ? <div style={{ position: "absolute", left: 0, top: 440, width: 940, textAlign: "center", transform: `scale(${pop(f, crash + 10)})` }}><span style={{ ...B, fontSize: 58, color: A2.red }}>全部いっしょに下がる</span></div> : null}
            <div style={{ position: "absolute", right: 30, top: 28, ...B, fontSize: 22, color: A2.sub }}>イメージ</div>
          </div>
          <PopAt at={19.9} x={0} y={1010} w={1080} center><span style={{ ...B, fontSize: 54, color: A2.ink }}>中身は<span style={{ color: A2.coral }}>どれも「株」</span></span></PopAt>
        </Page>
        {/* P3：資産分散ができていない（シーソー） */}
        <Page a={21.24} b={23.8}>
          <div style={{ position: "absolute", left: 140, top: 660, width: 800, height: 240 }}>
            <div style={{ position: "absolute", left: 370, top: 140, width: 0, height: 0, borderLeft: "34px solid transparent", borderRight: "34px solid transparent", borderBottom: `70px solid ${A2.ink}` }} />
            <div style={{ position: "absolute", left: 0, top: 128, width: 800, height: 16, borderRadius: 8, background: A2.ink, transform: `rotate(${tilt}deg)` }}>
              <div style={{ position: "absolute", left: 10, top: -150, display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-start" }}>
                {FUNDS.map(([n, c]) => <span key={n} style={{ display: "inline-block", background: c, color: "#fff", ...B, fontSize: 30, padding: "4px 18px", borderRadius: 999 }}>{n}</span>)}
              </div>
              <div style={{ position: "absolute", right: 20, top: -64, display: "flex", gap: 10 }}><Pill bg={BOND} size={30}>債券</Pill><Pill bg={CASH} color={A2.ink} size={30}>現金</Pill></div>
            </div>
          </div>
          <Stamp at={22.06} x={150} y={940} text="資産分散できていない" size={64} rot={-3} />
        </Page>
      </div>
    </Scene>
  );
};

// ════════ ④ 本当に困るとき（23.62–33.88）：山場。暴落の瞬間に揺れ・赤・ドン ════════
const S4: React.FC = () => {
  const f = useCurrentFrame();
  const W = 860, H = 300;
  const line = interpolate(f, [F(23.8), F(25.2)], [0, 1], out);
  const crashAt = F(27.52);
  const crashP = interpolate(f, [crashAt, crashAt + 10], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const pts: [number, number][] = [[0, 0.8], [0.12, 0.7], [0.24, 0.74], [0.36, 0.58], [0.48, 0.52], [0.6, 0.38], [0.72, 0.3], [0.8, 0.24]];
  const crash: [number, number][] = [[0.8, 0.24], [0.88, 0.7], [1, 0.9]];
  const path = (ps: [number, number][]) => ps.map(([x, y], i) => `${i ? "L" : "M"}${x * W} ${y * H}`).join(" ");
  const useX = 0.88 * W;
  const ring = F(26.28);
  const shake = useShake(crashAt + 6, 24, 18);
  const flash = interpolate(f, [crashAt + 4, crashAt + 7, crashAt + 22], [0, 0.35, 0], clamp);
  const fear = F(32.06);
  const dark = interpolate(f, [fear - 2, fear + 8], [0, 1], out);
  const card2 = useCardIn(28.94);
  return (
    <Scene a={23.62} b={33.88} inT="whip" outT="punch">
      <div style={{ position: "absolute", inset: 0, transform: shake }}>
        <Head text={<>本当に<span style={{ color: A2.coral }}>困る</span>のは？</>} from={F(23.62)} />
        {/* チャートカード */}
        <div style={{ ...CARD, left: 70, top: 400, width: 940, height: 470 }}>
          <div style={{ position: "absolute", left: 36, top: 26, ...B, fontSize: 30, color: A2.sub }}>株の値動き（イメージ）</div>
          <svg width={W + 40} height={H + 40} style={{ position: "absolute", left: 40, top: 110, overflow: "visible" }}>
            <defs><linearGradient id="g4" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={STOCK} stopOpacity={0.22} /><stop offset="100%" stopColor={STOCK} stopOpacity={0} /></linearGradient></defs>
            {[0.33, 0.66].map((g) => <line key={g} x1={0} y1={H * g} x2={W} y2={H * g} stroke={A2.track} strokeWidth={2} />)}
            <line x1={0} y1={H + 8} x2={W} y2={H + 8} stroke={A2.bar} strokeWidth={4} />
            {/* お金を使う時（太い帯） */}
            {f >= ring ? <rect x={useX - 30} y={-20} width={60} height={H + 28} rx={12} fill={A2.coral} opacity={0.14 * interpolate(f - ring, [0, 6], [0, 1], clamp)} /> : null}
            <path d={`${path(pts)} L${pts[pts.length - 1][0] * W} ${H} L0 ${H} Z`} fill="url(#g4)" opacity={line} />
            <path d={path(pts)} fill="none" stroke={STOCK} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - line} />
            {crashP > 0 ? <path d={path(crash)} fill="none" stroke={A2.red} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - crashP} /> : null}
          </svg>
          {f >= ring ? <div style={{ position: "absolute", left: 40 + useX - 140, top: 40, width: 280, textAlign: "center", transform: `scale(${pop(f, ring)})` }}><Pill bg={A2.ink} size={30}>お金を使う時</Pill><div style={{ ...B, fontSize: 22, color: A2.sub, marginTop: 6 }}>入学・教育費など</div></div> : null}
          {f >= crashAt + 8 ? <div style={{ position: "absolute", left: 40 + useX - 260, top: 300, transform: `scale(${pop(f, crashAt + 8)}) rotate(-6deg)` }}><span style={{ ...B, fontSize: 64, color: A2.red, background: "#fff", padding: "0 10px" }}>暴落</span></div> : null}
        </div>
        <div style={{ position: "absolute", inset: 0, opacity: 1 - dark }}><Stamp at={28.3} x={120} y={780} text="重なると…" size={64} rot={-4} /></div>
        {/* 2つの困りごと */}
        {card2.on ? (
          <div style={{ ...CARD, left: 70, top: 920, width: 940, height: 290, ...card2.style, opacity: (card2.style.opacity as number) * (1 - dark) }}>
            <div style={{ position: "absolute", left: 30, top: 30, display: "flex", alignItems: "center", gap: 18 }}>
              <GenSlot name="bouraku_wallet_thin" size={140} />
              <div style={{ ...B, fontSize: 40, color: A2.ink, lineHeight: 1.3 }}>必要なお金が<br /><span style={{ color: A2.red }}>減っている</span></div>
            </div>
            {f >= F(30.36) ? (
              <div style={{ position: "absolute", left: 500, top: 30, display: "flex", alignItems: "center", gap: 14, transform: `scale(${pop(f, F(30.36))})` }}>
                <GenSlot name="bouraku_person_stress" size={150} />
                <div style={{ ...B, fontSize: 40, color: A2.ink, lineHeight: 1.3 }}>下がる中で<br /><span style={{ color: A2.red }}>売るストレス</span></div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
      {/* 一番怖いところ：画面が暗い赤に沈み、大きな文字＋太一 */}
      {dark > 0 ? <AbsoluteFill style={{ background: `rgba(60,20,15,${0.55 * dark})` }} /> : null}
      {f >= fear ? (
        <div style={{ position: "absolute", left: 0, top: 640, width: 1080, textAlign: "center", transform: `scale(${interpolate(f - fear, [0, 4, 8], [1.6, 0.95, 1], clamp)})`, opacity: interpolate(f - fear, [0, 3], [0, 1], clamp) }}>
          <div style={{ ...B, fontSize: 46, color: "#fff" }}>これが</div>
          <div style={{ ...B, fontSize: 120, color: "#FFE07A", textShadow: "0 6px 20px rgba(0,0,0,0.35)" }}>一番怖い</div>
        </div>
      ) : null}
      {flash > 0 ? <AbsoluteFill style={{ background: A2.red, opacity: flash }} /> : null}
      <Taichi name="taichi_head_hold" at={32.06} until={33.88} side="bottom" />
    </Scene>
  );
};

// ミニチャート（株：ギザギザ／債券：なめらか）白いカード＋線の下にうすい面
const MiniChart: React.FC<{ at: number; x: number; kind: "stock" | "bond"; dim?: number }> = ({ at, x, kind, dim = 0 }) => {
  const f = useCurrentFrame();
  const A = F(at);
  if (f < A) return null;
  const W = 380, H = 150;
  const stock = [0.85, 0.66, 0.76, 0.5, 0.6, 0.36, 0.56, 0.28, 0.44, 0.2, 0.3, 0.1];
  const ys = kind === "stock" ? stock : stock.map((_, i) => 0.85 - (0.7 * i) / (stock.length - 1) - 0.04 * Math.sin((i / (stock.length - 1)) * Math.PI));
  const pts = ys.map((y, i) => [(i / (ys.length - 1)) * W, y * H] as const);
  const d = pts.map(([px, py], i) => `${i ? "L" : "M"}${px.toFixed(1)} ${py.toFixed(1)}`).join(" ");
  const p = interpolate(f, [A, A + 22], [0, 1], out);
  const col = kind === "stock" ? STOCK : BOND;
  const id = `g_${kind}`;
  const enter = interpolate(f - A, [0, 8], [0, 1], out);
  return (
    <div style={{ position: "absolute", left: x, top: 400, width: 440, padding: "20px 24px 18px", boxSizing: "border-box", background: "#fff", borderRadius: 28, boxShadow: "0 14px 30px rgba(80,60,20,0.10)", opacity: (1 - dim * 0.5) * enter, transform: `translateY(${(1 - enter) * 30}px) scale(${1 - dim * 0.05})`, transformOrigin: "50% 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ width: 14, height: 14, borderRadius: 4, background: col }} />
        <span style={{ ...B, fontSize: 34, color: A2.ink }}>{kind === "stock" ? "株" : "債券"}</span>
        <span style={{ ...B, fontSize: 22, color: A2.sub, marginLeft: "auto" }}>{kind === "stock" ? "上下しながら増える" : "下がりにくく安定"}</span>
      </div>
      <svg width={W + 12} height={H + 16} style={{ marginTop: 10, overflow: "visible" }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={col} stopOpacity={0.28} /><stop offset="100%" stopColor={col} stopOpacity={0} /></linearGradient>
          <clipPath id={`c_${kind}`}><rect x={0} y={-10} width={W * p + 6} height={H + 30} /></clipPath>
        </defs>
        {[0.33, 0.66].map((g) => <line key={g} x1={0} y1={H * g} x2={W} y2={H * g} stroke={A2.track} strokeWidth={2} />)}
        <g clipPath={`url(#c_${kind})`}>
          <path d={`${d} L${W} ${H} L0 ${H} Z`} fill={`url(#${id})`} />
          <path d={d} fill="none" stroke={col} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
        </g>
        {p > 0.98 ? <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r={10} fill="#fff" stroke={col} strokeWidth={6} /> : null}
      </svg>
    </div>
  );
};
const GROW: [string, number][] = [["今", 500], ["10年後", 810], ["20年後", 1330], ["30年後", 2160]]; // 500万円×1.05^n（814・1,327・2,161を丸め）
// 株と債券を1枚に重ねたチャート（「債券は」のあと、成長カードと入れ替わる）
const DuoChart: React.FC = () => {
  const f = useCurrentFrame();
  const A = F(34.6), Bd = F(35.66), X = F(37.5);
  if (f < A || f >= X + 10) return null;
  const W = 860, H = 380;
  const n = 12;
  const st = [0.85, 0.62, 0.74, 0.46, 0.58, 0.3, 0.52, 0.22, 0.42, 0.16, 0.3, 0.1];
  const bd = st.map((_, i) => 0.85 - (0.62 * i) / (n - 1) - 0.05 * Math.sin((i / (n - 1)) * Math.PI));
  const path = (ys: number[]) => ys.map((y, i) => `${i ? "L" : "M"}${((i / (n - 1)) * W).toFixed(1)} ${(y * H).toFixed(1)}`).join(" ");
  const ps = interpolate(f, [A, A + 24], [0, 1], out), pb = interpolate(f, [Bd, Bd + 24], [0, 1], out);
  const enter = interpolate(f - A, [0, 8], [0, 1], out);
  const leave = interpolate(f, [X, X + 10], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const line = (ys: number[], col: string, p: number, id: string, w: number) => (
    <g>
      <defs>
        <linearGradient id={`d_${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={col} stopOpacity={0.22} /><stop offset="100%" stopColor={col} stopOpacity={0} /></linearGradient>
        <clipPath id={`k_${id}`}><rect x={-10} y={-20} width={W * p + 10} height={H + 40} /></clipPath>
      </defs>
      <g clipPath={`url(#k_${id})`}>
        <path d={`${path(ys)} L${W} ${H} L0 ${H} Z`} fill={`url(#d_${id})`} />
        <path d={path(ys)} fill="none" stroke={col} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
      </g>
      {p > 0.98 ? <circle cx={W} cy={ys[n - 1] * H} r={11} fill="#fff" stroke={col} strokeWidth={6} /> : null}
    </g>
  );
  return (
    <div style={{ position: "absolute", left: 70, top: 420, width: 940, height: 560, background: "#fff", borderRadius: 34, boxShadow: "0 18px 40px rgba(80,60,20,0.12)", opacity: enter * (1 - leave), filter: leave > 0.01 ? `blur(${leave * 12}px)` : undefined, transform: `translateY(${(1 - enter) * 40 - leave * 60}px) scale(${1 - leave * 0.06})` }}>
      {/* 凡例 */}
      <div style={{ position: "absolute", left: 40, top: 30, display: "flex", gap: 30 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 10, ...B, fontSize: 34, color: A2.ink }}><span style={{ width: 34, height: 8, borderRadius: 4, background: STOCK }} />株<span style={{ fontSize: 22, color: A2.sub }}>上下しながら増える</span></span>
        {f >= Bd ? <span style={{ display: "inline-flex", alignItems: "center", gap: 10, ...B, fontSize: 34, color: A2.ink, transform: `scale(${pop(f, Bd)})` }}><span style={{ width: 34, height: 8, borderRadius: 4, background: BOND }} />債券<span style={{ fontSize: 22, color: A2.sub }}>下がりにくく安定</span></span> : null}
      </div>
      <svg width={W + 20} height={H + 20} style={{ position: "absolute", left: 40, top: 120, overflow: "visible" }}>
        {[0.25, 0.5, 0.75].map((g) => <line key={g} x1={0} y1={H * g} x2={W} y2={H * g} stroke={A2.track} strokeWidth={2} />)}
        <line x1={0} y1={H + 6} x2={W} y2={H + 6} stroke={A2.bar} strokeWidth={4} />
        {line(st, STOCK, ps, "s", 7)}
        {f >= Bd ? line(bd, BOND, pb, "b", 9) : null}
      </svg>
    </div>
  );
};

// 500万円×年5%の成長カード
const GrowthCard: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame();
  const A = F(at);
  if (f < A) return null;
  const enter = interpolate(f - A, [0, 9], [0, 1], out);
  const CX = 70, CY = 560, CW = 940, CH = 560;
  const base = 490, maxH = 280, bw = 128;
  const xs = GROW.map((_, i) => 110 + i * 215);
  const tops = GROW.map(([, man]) => base - (man / 2160) * maxH);
  const bar = (i: number) => interpolate(f, [F(38.4) + i * 14, F(38.4) + i * 14 + 12], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.3)) });
  const okAt = F(43.44);
  return (
    <div style={{ position: "absolute", left: CX, top: CY, width: CW, height: CH, background: "#fff", borderRadius: 34, boxShadow: "0 18px 40px rgba(80,60,20,0.12)", opacity: enter, transform: `translateY(${(1 - enter) * 40}px)` }}>
      {/* 見出し：500万円 × 年5% × 30年 */}
      <div style={{ position: "absolute", left: 36, top: 26, display: "flex", alignItems: "center", gap: 12 }}>
        {[["500万円", A2.ink], ["年5%", BOND], ["30年", A2.ink]].map(([t, c], i) => (
          <React.Fragment key={t}>
            {i ? <span style={{ ...B, fontSize: 30, color: A2.sub }}>×</span> : null}
            <span style={{ ...B, fontSize: 36, color: c, background: i === 1 ? "rgba(74,143,214,0.12)" : A2.track, borderRadius: 14, padding: "4px 16px" }}>{t}</span>
          </React.Fragment>
        ))}
      </div>
      {f >= okAt ? <div style={{ position: "absolute", left: 36, top: 96, transform: `scale(${pop(f, okAt)})`, transformOrigin: "0 50%" }}><span style={{ display: "inline-flex", alignItems: "center", gap: 8, background: BOND, color: "#fff", ...B, fontSize: 28, padding: "8px 20px", borderRadius: 999 }}>✓ 計画的に用意できる</span></div> : null}
      {/* うすい目盛り線 */}
      {[0.25, 0.5, 0.75].map((g) => <div key={g} style={{ position: "absolute", left: 40, right: 40, top: base - maxH * g, height: 2, background: A2.track }} />)}
      <div style={{ position: "absolute", left: 40, right: 40, top: base, height: 4, borderRadius: 2, background: A2.bar }} />
      {GROW.map(([label, man], i) => {
        const k = bar(i);
        if (k <= 0) return null;
        const last = i === GROW.length - 1;
        const h = (base - tops[i]) * k;
        return (
          <React.Fragment key={label}>
            <div style={{ position: "absolute", left: xs[i], top: base - h, width: bw, height: h, borderRadius: "20px 20px 6px 6px", background: last ? `linear-gradient(${BOND}, #2F6FB5)` : `linear-gradient(rgba(74,143,214,${0.35 + i * 0.12}), rgba(74,143,214,${0.2 + i * 0.1}))`, boxShadow: last ? "0 10px 24px rgba(47,111,181,0.35)" : undefined, overflow: "hidden" }}>
              <div style={{ position: "absolute", left: 14, top: 10, width: 16, height: Math.max(0, h - 30), borderRadius: 8, background: "rgba(255,255,255,0.25)" }} />
            </div>
            <div style={{ position: "absolute", left: xs[i] - 50, top: base + 14, width: bw + 100, textAlign: "center", ...B, fontSize: 26, color: last ? A2.ink : A2.sub }}>{label}</div>
            {!last ? (
              <div style={{ position: "absolute", left: xs[i] - 50, top: tops[i] - 50 - 22, width: bw + 100, textAlign: "center", whiteSpace: "nowrap", opacity: interpolate(k, [0.6, 1], [0, 1], clamp) }}>
                <span style={{ ...B, fontSize: 22, color: A2.sub }}>{man === 500 ? "" : "約"}</span>
                <span style={{ ...B, fontSize: 34, color: A2.ink }}>{man.toLocaleString("en-US")}</span>
                <span style={{ ...B, fontSize: 22, color: A2.sub }}>万円</span>
              </div>
            ) : null}
          </React.Fragment>
        );
      })}
      {/* 30年後：吹き出し */}
      {bar(3) > 0.7 ? (
        <div style={{ position: "absolute", left: xs[3] + bw / 2 - 150, top: tops[3] - 118, width: 300, textAlign: "center", transform: `scale(${pop(f, F(38.4) + 3 * 14 + 8)})`, transformOrigin: "50% 100%" }}>
          <div style={{ display: "inline-block", background: A2.ink, color: "#fff", borderRadius: 20, padding: "8px 22px", whiteSpace: "nowrap" }}>
            <span style={{ ...B, fontSize: 26 }}>約</span>
            <Count at={(F(38.4) + 3 * 14 + 8) / 30} to={2160} dur={14} comma style={{ ...B, fontSize: 56, color: "#FFE07A" }} />
            <span style={{ ...B, fontSize: 26 }}>万円</span>
          </div>
          <div style={{ width: 0, height: 0, margin: "0 auto", borderLeft: "14px solid transparent", borderRight: "14px solid transparent", borderTop: `16px solid ${A2.ink}` }} />
        </div>
      ) : null}
      {/* 約4.3倍 */}
      {f >= F(40.2) ? <div style={{ position: "absolute", left: xs[1] + 70, top: 160, transform: `scale(${pop(f, F(40.2))}) rotate(-6deg)` }}><span style={{ ...B, fontSize: 34, color: BOND, background: "rgba(74,143,214,0.12)", borderRadius: 999, padding: "6px 22px" }}>約4.3倍に</span></div> : null}
    </div>
  );
};
const S5: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Scene a={33.88} b={44.8}>
      <Head text={<>だから<span style={{ color: BOND }}>債券</span>も組み合わせる</>} from={F(33.88)} />
      {/* 株＝上下しながら右肩上がり／債券＝下がらずに安定して右肩上がり */}
      <DuoChart />
      {/* 何年後にいくら＝見える：500万円を年5%で30年（複利の単純計算） */}
      <GrowthCard at={37.9} />
      <Note at={38.4}>※年5%の複利で増えた場合の単純計算（税金・手数料は考慮せず）</Note>
      <Taichi name="taichi_point_talk_closed" talk="taichi_point_talk_open" at={33.88} until={37.2} />
    </Scene>
  );
};

// 金利メーター（棒が上がる）
const RateMeter: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + 16], [0.2, 0.85], { ...clamp, easing: Easing.out(Easing.back(1.6)) });
  return (
    <div style={{ position: "relative", width: 200, height: 270 }}>
      <div style={{ position: "absolute", left: 70, top: 0, width: 60, height: 230, borderRadius: 30, background: "#fff", boxShadow: "0 8px 20px rgba(80,60,20,0.12)", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 10, right: 10, bottom: 10, height: 210 * p, borderRadius: 20, background: `linear-gradient(${A2.coral}, ${BOND})` }} />
      </div>
      <div style={{ position: "absolute", left: 55, top: 200, width: 90, height: 90, borderRadius: "50%", background: BOND, border: "8px solid #fff", boxSizing: "border-box" }} />
      {[0.25, 0.5, 0.75].map((y) => <div key={y} style={{ position: "absolute", left: 140, top: 230 * (1 - y), width: 26, height: 5, borderRadius: 3, background: A2.bar }} />)}
    </div>
  );
};

// ════════ ⑥ 金利が高い・利回りを固定（44.8–56.8） ════════
const CARD: React.CSSProperties = { position: "absolute", background: "#fff", borderRadius: 34, boxShadow: "0 18px 40px rgba(80,60,20,0.12)" };
const useCardIn = (at: number) => {
  const f = useCurrentFrame();
  const k = interpolate(f, [F(at), F(at) + 9], [0, 1], out);
  return { on: f >= F(at), style: { opacity: k, transform: `translateY(${(1 - k) * 40}px)` } as React.CSSProperties };
};
const S6: React.FC = () => {
  const f = useCurrentFrame();
  const lockAt = F(49.28);
  const lk = interpolate(f, [lockAt, lockAt + 7], [-50, 0], { ...clamp, easing: Easing.out(Easing.back(3)) });
  const top = useCardIn(45.4), bot = useCardIn(50.3);
  const T0 = 300, TW = 560, TY = 250; // タイムライン（カード内座標）
  const tl = interpolate(f, [F(46.94), F(48.3)], [0, 1], out);
  const debt = interpolate(f, [F(53.26), F(53.26) + 14], [0, 0.42], { ...clamp, easing: Easing.out(Easing.back(1.2)) });
  const ex = F(54.12), ok = F(55.72);
  return (
    <Scene a={44.8} b={56.8}>
      <Head text={<>今は<span style={{ color: BOND }}>債券の金利</span>が高い</>} from={F(44.8)} />
      {/* 上のカード：金利↑ ＋ 20年・30年先まで固定 */}
      {top.on ? (
        <div style={{ ...CARD, left: 70, top: 400, width: 940, height: 390, ...top.style }}>
          <div style={{ position: "absolute", left: 40, top: 40, transform: "scale(0.85)", transformOrigin: "0 0" }}><RateMeter at={F(45.9)} /></div>
          <div style={{ position: "absolute", left: 30, top: 300, width: 220, textAlign: "center" }}><span style={{ ...B, fontSize: 32, color: BOND }}>金利が高い</span></div>
          <div style={{ position: "absolute", left: T0, top: 40, ...B, fontSize: 30, color: A2.sub }}>利回りを長く固定できる</div>
          {/* 線 */}
          <div style={{ position: "absolute", left: T0, top: TY, width: TW, height: 14, borderRadius: 7, background: A2.track }} />
          <div style={{ position: "absolute", left: T0, top: TY, width: TW * tl, height: 14, borderRadius: 7, background: `linear-gradient(90deg, #8DB8E8, ${BOND})` }} />
          {[["今", 0], ["20年", 0.62], ["30年", 1]].map(([t, p]) => {
            const on = tl >= (p as number) - 0.01;
            return (
              <React.Fragment key={t as string}>
                <div style={{ position: "absolute", left: T0 + TW * (p as number) - 15, top: TY - 8, width: 30, height: 30, borderRadius: "50%", background: on ? BOND : "#fff", border: `5px solid ${on ? "#fff" : A2.bar}`, boxSizing: "border-box", boxShadow: on ? "0 0 0 4px rgba(74,143,214,0.25)" : undefined }} />
                <div style={{ position: "absolute", left: T0 + TW * (p as number) - 60, top: TY + 34, width: 120, textAlign: "center", ...B, fontSize: (p as number) === 0 ? 26 : 34, color: on ? A2.ink : A2.sub }}>{t as string}</div>
              </React.Fragment>
            );
          })}
          {f >= F(46.94) ? <div style={{ position: "absolute", left: T0 + TW - 40, top: 80, transform: `scale(${pop(f, F(46.94))}) rotate(${interpolate(f, [F(46.94), F(46.94) + 18], [-180, 0], out)}deg)` }}><GenSlot name="bouraku_hourglass" size={110} /></div> : null}
          {f >= lockAt ? <div style={{ position: "absolute", left: T0 + TW * 0.3 - 60, top: TY - 135 + lk, transform: `scale(${pop(f, lockAt)})` }}><GenSlot name="bouraku_lock" size={120} /></div> : null}
          {f >= F(49.8) ? <div style={{ position: "absolute", left: T0 + TW * 0.3 + 70, top: TY - 100, transform: `scale(${pop(f, F(49.8))})`, transformOrigin: "0 50%" }}><span style={{ display: "inline-flex", alignItems: "center", gap: 8, background: BOND, color: "#fff", ...B, fontSize: 30, padding: "8px 22px", borderRadius: 999 }}>利回りを固定</span></div> : null}
        </div>
      ) : null}
      {/* 下のカード：僕自身も、30年先に必要なお金の一部を債券に */}
      {bot.on ? (
        <div style={{ ...CARD, left: 70, top: 820, width: 940, height: 400, ...bot.style }}>
          <div style={{ position: "absolute", left: 24, top: -30, transform: `scale(${pop(f, F(50.3))})` }}><GenSlot name="taichi_explain_both" size={150} /></div>
          <div style={{ position: "absolute", left: 180, top: 30 }}>
            <div style={{ ...B, fontSize: 40, color: A2.ink }}>僕自身も</div>
            <div style={{ ...B, fontSize: 26, color: A2.sub, marginTop: 2 }}>30年先に必要なお金</div>
          </div>
          {f >= ok ? <div style={{ position: "absolute", right: 30, top: 34, transform: `scale(${pop(f, ok)})`, transformOrigin: "100% 50%" }}><span style={{ display: "inline-flex", alignItems: "center", gap: 8, background: A2.green, color: "#fff", ...B, fontSize: 28, padding: "8px 22px", borderRadius: 999 }}>✓ ある程度決めている</span></div> : null}
          {/* 積み上げバー：債券（一部）＋そのほか */}
          <div style={{ position: "absolute", left: 40, top: 160, width: 860, height: 86, borderRadius: 22, background: A2.track, overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 0, top: 0, height: 86, width: 860 * debt, background: `linear-gradient(90deg, #6FA6E0, ${BOND})` }} />
            {f >= F(53.6) ? <div style={{ position: "absolute", left: 24, top: 20, ...B, fontSize: 36, color: "#fff", whiteSpace: "nowrap" }}>債券（一部）</div> : null}
            <div style={{ position: "absolute", right: 24, top: 24, ...B, fontSize: 30, color: A2.sub }}>株・現金など</div>
          </div>
          {debt > 0.4 ? <div style={{ position: "absolute", left: 40 + 860 * 0.42 - 34, top: 140, transform: `scale(${pop(f, F(53.26) + 12)})` }}><GenSlot name="bouraku_lock" size={70} /></div> : null}
          {/* 例：500万円 → 30年後 約2,160万円 */}
          {f >= ex ? (
            <div style={{ position: "absolute", left: 40, top: 280, transform: `scale(${pop(f, ex)})`, transformOrigin: "0 50%" }}>
              <span style={{ display: "inline-flex", alignItems: "baseline", gap: 12, background: A2.ink, color: "#fff", borderRadius: 22, padding: "12px 28px" }}>
                <span style={{ ...B, fontSize: 26, color: "rgba(255,255,255,0.7)" }}>例</span>
                <span style={{ ...B, fontSize: 36 }}>500万円</span>
                <span style={{ ...B, fontSize: 30, color: "rgba(255,255,255,0.7)" }}>→ 30年後</span>
                <span style={{ ...B, fontSize: 30 }}>約</span><Count at={ex / 30 + 0.1} to={2160} dur={14} comma style={{ ...B, fontSize: 52, color: "#FFE07A" }} /><span style={{ ...B, fontSize: 30 }}>万円</span>
              </span>
            </div>
          ) : null}
        </div>
      ) : null}
      <Note at={54.12} y={1240}>※例は年5%の複利で増えた場合の単純計算（税金・手数料は考慮せず）</Note>
    </Scene>
  );
};


// ════════ ⑦ 今のお金も使いやすくなる（56.8–70.4） ════════
const NOW = ["mile_now_beach", "mile_now_photo", "mile_now_dinner", "mile_now_shoulder", "mile_now_snow", "mile_now_hug"];
const S7: React.FC = () => {
  const f = useCurrentFrame();
  const see = F(59.94), save = F(63.32), trip = F(64.62), end = F(68.2);
  const burst = interpolate(f, [save, save + 14], [0, 1], out);
  const card = useCardIn(57.0);
  const zoomOut = interpolate(f, [end - 4, end + 10], [0, 1], io);
  return (
    <Scene a={56.8} b={70.6} inT="zoom" outT="zoom">
      <Head text={<>将来が<span style={{ color: A2.green }}>見えている</span>と…</>} from={F(56.8)} to={trip} />
      <Head text={<><span style={{ color: A2.coral }}>今</span>を楽しめる</>} from={trip} />
      {/* P1 将来のお金が見えている → 全部貯め込まなくていい */}
      <Page a={56.8} b={64.62}>
        {card.on ? (
          <div style={{ ...CARD, left: 70, top: 400, width: 940, height: 330, ...card.style }}>
            <div style={{ position: "absolute", left: 30, top: 20 }}><GenSlot name="mile_lp_retire_fund" size={290} /></div>
            <div style={{ position: "absolute", left: 360, top: 70 }}>
              <div style={{ ...B, fontSize: 34, color: A2.sub }}>将来必要なお金</div>
              <div style={{ ...B, fontSize: 64, color: A2.ink, marginTop: 6 }}>{f >= see ? <><span style={{ color: BOND }}>見えている</span></> : "　"}</div>
              {f >= see + 6 ? <div style={{ marginTop: 16, transform: `scale(${pop(f, see + 6)})`, transformOrigin: "0 50%" }}><span style={{ display: "inline-flex", alignItems: "center", gap: 10, background: BOND, color: "#fff", ...B, fontSize: 30, padding: "8px 22px", borderRadius: 999 }}>✓ 何年後に・いくら</span></div> : null}
            </div>
          </div>
        ) : null}
        {f >= F(62.28) ? (
          <div style={{ position: "absolute", left: 330, top: 760, transform: `scale(${pop(f, F(62.28))}) rotate(${Math.sin(f / 2) * (f < save ? 2 : 0)}deg)` }}><Pic name="bouraku_piggy_full" size={420} /></div>
        ) : null}
        {burst > 0 ? Array.from({ length: 9 }).map((_, i) => {
          const ang = -Math.PI / 2 + (i - 4) * 0.32;
          const r = 380 * burst;
          return <div key={i} style={{ position: "absolute", left: 500 + Math.cos(ang) * r, top: 900 + Math.sin(ang) * r * 0.9 + burst * burst * 160, transform: `rotate(${burst * 300 + i * 40}deg)`, opacity: 1 - Math.max(0, burst - 0.7) * 3 }}><GenSlot name="bouraku_coin" size={80} /></div>;
        }) : null}
        <div style={{ position: "absolute", inset: 0 }}><Stamp at={63.54} x={140} y={1150} text="全部貯め込まなくていい" color={A2.green} size={58} rot={-3} /></div>
      </Page>
      {/* P2 旅行・家族の時間：写真がポンポン → 引いて、太一＋罪悪感なく */}
      {f >= trip - 1 ? (
        <div style={{ position: "absolute", inset: 0, transform: `scale(${1 - zoomOut * 0.18}) translateY(${-zoomOut * 120}px)` }}>
          {NOW.map((n, i) => {
            const at = trip + i * 7;
            if (f < at) return null;
            const x = 60 + (i % 3) * 330, y = 410 + Math.floor(i / 3) * 360;
            const kb = 1 + ((f - at) / 900);
            return <div key={n} style={{ position: "absolute", left: x, top: y, transform: `scale(${pop(f, at) * kb}) rotate(${(i % 2 ? 1 : -1) * 2}deg)` }}><Pic name={n} size={300} /></div>;
          })}
        </div>
      ) : null}
      {f >= end ? (
        <div style={{ position: "absolute", left: 50, top: 1100, transformOrigin: "0 50%", transform: `scale(${interpolate(f - end, [0, 4, 8], [1.5, 0.96, 1], clamp)})`, opacity: interpolate(f - end, [0, 3], [0, 1], clamp) }}>
          <span style={{ display: "inline-block", background: A2.ink, borderRadius: 28, padding: "14px 44px" }}>
            <span style={{ ...B, fontSize: 70, color: "#FFE07A" }}>罪悪感なく</span><span style={{ ...B, fontSize: 52, color: "#fff" }}> 使える</span>
          </span>
        </div>
      ) : null}
      <Taichi name="taichi_talk_closed" talk="taichi_talk_open" at={68.2} until={70.6} side="right" />
    </Scene>
  );
};

// ── 太一キャラ：シュッと入って行き過ぎて戻る／サッと抜ける。talk があると声に合わせて口パク ──
const Taichi: React.FC<{ name: string; talk?: string; at: number; until: number; side?: "left" | "right" | "bottom" }> = ({ name, talk, at, until, side = "left" }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const A = F(at), U = F(until);
  if (f < A || f >= U) return null;
  const s = spring({ frame: f - A, fps, config: { damping: 9, stiffness: 230, mass: 0.6 } });
  const o = interpolate(f, [U - 7, U], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const lv = MOUTH.charCodeAt(Math.min(MOUTH.length - 1, f)) - 48;
  const open = talk && lv >= 1 && Math.floor(f / 3) % 2 === 0;
  const img = open ? talk! : name;
  let x = 20, y = 1000, lean = 0;
  if (side === "left") { x = -360 + s * 380 - o * 420; lean = (1 - s) * -14 + o * -12; }
  if (side === "right") { x = 1080 + 40 - s * 400 + o * 420; lean = (1 - s) * 14 + o * 12; }
  if (side === "bottom") { x = 390; y = 1000 + (1 - s) * 420 + o * 420; }
  const streak = interpolate(f - A, [0, 2, 8], [0, 1, 0], clamp) + o;
  return (
    <>
      {streak > 0.02 && side !== "bottom" ? [0, 1, 2].map((k) => <div key={k} style={{ position: "absolute", left: side === "left" ? x - 120 + k * 30 : x + 260 - k * 30, top: 1080 + k * 50, width: 160, height: 6, borderRadius: 3, background: A2.green, opacity: streak * 0.5 }} />) : null}
      <div style={{ position: "absolute", left: x, top: y, transform: `rotate(${lean + Math.sin(f / 8) * 1.5}deg) translateY(${Math.sin(f / 10) * 4}px)`, transformOrigin: "50% 100%" }}>
        <GenSlot name={img} size={300} />
      </div>
    </>
  );
};

// ── 字幕：声に合わせて1文字ずつ。*語* はキーワード（大きく・色・下線マーカー）。!語!＝赤、~語~＝青 ──
type Seg = { t: string; k: "" | "g" | "r" | "b" };
const parseCap = (s: string): Seg[] => {
  const out: Seg[] = [];
  const re = /(\*[^*]+\*|![^!]+!|~[^~]+~)/g;
  let last = 0, m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    if (m.index > last) out.push({ t: s.slice(last, m.index), k: "" });
    const c = m[0][0];
    out.push({ t: m[0].slice(1, -1), k: c === "*" ? "g" : c === "!" ? "r" : "b" });
    last = m.index + m[0].length;
  }
  if (last < s.length) out.push({ t: s.slice(last), k: "" });
  return out;
};
const KCOL = { g: A2.green, r: A2.coral, b: BOND, "": A2.ink } as const;
const Captions: React.FC<{ subs: [number, string][]; end: number }> = ({ subs, end }) => {
  const f = useCurrentFrame();
  const t = f / 30;
  let i = -1;
  subs.forEach(([s0], k) => { if (t >= s0) i = k; });
  if (i < 0 || t > end) return null;
  const [s0, raw] = subs[i];
  const e = i + 1 < subs.length ? subs[i + 1][0] : end;
  const segs = parseCap(raw);
  const total = segs.reduce((n, g) => n + g.t.length, 0);
  let idx = 0;
  const est = segs.reduce((n, g) => n + g.t.length * (g.k ? 74 : 58), 0);
  const fit = Math.min(1, 1000 / est); // はみ出す長さなら縮める
  return (
    <div style={{ position: "absolute", left: 30, right: 30, top: 1350, display: "flex", justifyContent: "center", alignItems: "baseline", flexWrap: "nowrap", transform: `scale(${fit})`, transformOrigin: "50% 100%" }}>
      {segs.map((g, gi) => {
        const kw = g.k !== "";
        const k0 = idx;
        const mStart = s0 + (e - s0) * 0.8 * (k0 / total) - 0.06;
        const mEnd = s0 + (e - s0) * 0.8 * ((k0 + g.t.length) / total) + 0.08;
        const mw = interpolate(t, [mStart, mEnd], [0, 100], clamp);
        return (
          <span key={gi} style={{ position: "relative", display: "inline-block", whiteSpace: "nowrap" }}>
            {kw && mw > 0 ? <span style={{ position: "absolute", left: -4, width: `calc(${mw}% + 8px)`, bottom: 4, height: "34%", background: g.k === "r" ? "rgba(239,125,87,0.25)" : g.k === "b" ? "rgba(74,143,214,0.22)" : "rgba(252,224,122,0.9)", borderRadius: 6 }} /> : null}
            {Array.from(g.t).map((ch, k) => {
              const at = s0 + (e - s0) * 0.8 * (idx++ / total) - 0.06;
              const p = interpolate(t, [at, at + 0.14], [0, 1], clamp);
              return <span key={k} style={{ position: "relative", display: "inline-block", ...B, fontSize: kw ? 74 : 58, color: KCOL[g.k], opacity: 0.15 + 0.85 * p, filter: p < 1 ? `blur(${(1 - p) * 8}px)` : undefined, transform: `translateY(${(1 - p) * 10}px) scale(${kw ? 1 + (1 - p) * 0.3 : 1})`, textShadow: "0 0 10px #FBF6D8, 0 0 4px #FBF6D8" }}>{ch}</span>;
            })}
          </span>
        );
      })}
    </div>
  );
};

const SUBS: [number, string][] = [
  [0, "そもそも*オルカン*って"], [1.0, "*世界中*に分散できて"], [2.42, "*たくさんの企業*に"], [3.42, "まとめて投資できる商品"], [4.68, "中身も*定期的に見直*されるので"], [6.66, "*かなり優秀*"],
  [7.44, "でも、ここが!落とし穴!"], [8.66, "世界中に分散できていても"], [10.38, "中身は!全部「株式」!"], [11.9, "だから"], [12.34, "株が下がるときは"], [13.46, "!オルカンも下がり!ます"],
  [14.44, "しかも"], [14.86, "多くの人がハマっている落とし穴が"], [16.6, "株で*増やそう増やそう*としたり"], [18.38, "*とりあえず積み立て*して"], [19.56, "資産が!株に寄っている!状態"], [21.24, "つまり資産分散が"], [22.7, "!できていない!状態"],
  [23.62, "株が下がること自体より"], [25.28, "本当に!困る!のは"], [26.28, "「*お金を使うタイミング*」と"], [27.52, "!暴落!が重なったとき"], [28.94, "必要なお金が!減っている!うえに"], [30.36, "下がっている中で!売るストレス!もある"], [32.06, "これが!一番怖い!ところです"],
  [33.88, "だから僕は"], [34.6, "株だけに任せず"], [35.66, "~債券~も組み合わせています"], [37.2, "~債券~は"], [38.0, "*何年後にいくら*くらいになるかを"], [39.9, "ある程度*見える*状態にしやすいから"], [42.0, "将来必要なお金を"], [43.44, "~計画的に用意~できる"],
  [44.8, "しかも今は"], [45.6, "~債券の金利~も高く"], [46.94, "*20年、30年*先まで"], [48.66, "~利回りを固定~できるチャンスです"], [50.3, "僕自身も"], [51.08, "30年先に必要なお金の一部は"], [53.26, "~債券~に入れて"], [54.12, "「*何年後にいくら*」にするかを"], [55.72, "ある程度決めています"],
  [56.8, "これをやっている理由は"], [58.1, "将来のお金のためだけではなくて"], [59.94, "将来必要なお金が"], [61.22, "ある程度*見えていれば*"], [62.28, "残ったお金を"], [63.32, "*全部貯め込まなくていい*"], [64.62, "*旅行*だったり"], [65.46, "*家族との時間*だったり"], [66.88, "*今を楽しむ*ことにも"], [68.2, "!罪悪感なく!"], [68.94, "お金を使いやすくなります"],
];

const CUES: { file: string; at: number; volume: number }[] = [
  // 場面の頭（見出し）
  ...[0.05, 7.44, 14.44, 33.88, 44.8].map((t) => ({ file: "user/u03", at: F(t), volume: 0.26 })),
  ...[7.44, 14.44, 33.88, 44.8].map((t) => ({ file: "swipe", at: F(t) - 2, volume: 0.2 })),
  // ① ページ送り＋数字
  ...[1.0, 2.5, 4.9].map((t) => ({ file: "user/u02s", at: F(t), volume: 0.26 })),
  { file: "user/u05s", at: F(4.68), volume: 0.22 },
  { file: "user/u05", at: F(6.9), volume: 0.3 },
  // ② 落とし穴
  { file: "swipe", at: F(7.76), volume: 0.3 },
  { file: "user/u02s", at: F(10.38), volume: 0.22 },
  { file: "whoosh2", at: F(12.34), volume: 0.3 },
  { file: "thud", at: F(13.2) + 14, volume: 0.45 },
  { file: "user/u05", at: F(13.6), volume: 0.26 },
  { file: "whoosh2", at: F(14.44) - 4, volume: 0.25 },
  // ③ コインは4回だけ／傾き／スタンプ
  ...[0, 1, 2].map((i) => ({ file: "user/u02s", at: F(15.3) + i * 8, volume: 0.2 })),
  { file: "user/u05s", at: F(18.38), volume: 0.22 },
  { file: "dadan", at: F(20.5) + 10, volume: 0.36 },
  { file: "thunk", at: F(21.24), volume: 0.32 },
  { file: "user/u05", at: F(22.06), volume: 0.3 },
  // ④ 山場
  { file: "user/u02s", at: F(26.28), volume: 0.22 },
  { file: "dadan", at: F(27.52) + 4, volume: 0.42 },
  { file: "user/u05", at: F(28.3), volume: 0.26 },
  { file: "user/u02s", at: F(30.36), volume: 0.2 },
  { file: "thud", at: F(32.06), volume: 0.4 },
  // ⑤⑥
  { file: "user/u02s", at: F(35.66), volume: 0.22 },
  { file: "user/u05s", at: F(41.3), volume: 0.26 },
  { file: "user/u05", at: F(49.28), volume: 0.3 },
  { file: "user/u02s", at: F(54.12), volume: 0.22 },
  { file: "user/u05s", at: F(55.72), volume: 0.24 },
  // ⑦ 締め
  { file: "user/u03", at: F(56.8), volume: 0.26 },
  { file: "user/u05", at: F(63.54), volume: 0.28 },
  ...[0, 2, 4].map((i) => ({ file: "user/u02s", at: F(64.62) + i * 7, volume: 0.18 })),
  { file: "user/u10", at: F(68.2), volume: 0.3 },
];

export const BOURAKU_FRAMES = F(70.4) + 20;
export const BourakuReel: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: A2.bg, fontFamily: FONT }}>
    <Audio src={staticFile("bouraku-narration.wav")} />
    <SfxTrack cues={CUES} />
    <S1 /><S2 /><S3 /><S4 /><S5 /><S6 /><S7 />
    <SubFade />
    <Captions subs={SUBS} end={70.3} />
  </AbsoluteFill>
);
