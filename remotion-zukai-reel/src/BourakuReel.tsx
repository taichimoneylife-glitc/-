import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from "remotion";
import { A2, Mark2 } from "./components/kit2";
import { FONT } from "./components/font";
import { SfxTrack } from "./components/sfx";
import { B, GenSlot, In, Head, MarkerSub, SubFade } from "./MileLifePlan";

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

// 場面：ぼかしイン → ぼかしアウト
const Scene: React.FC<{ a: number; b: number; children: React.ReactNode }> = ({ a, b, children }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const A = F(a), Bf = F(b);
  if (f < A - 1 || f >= Bf + 8) return null;
  // イン：右からシュッと入って、少し行き過ぎて止まる（バネ）
  const s = spring({ frame: f - A, fps, config: { damping: 13, stiffness: 210, mass: 0.7 } });
  const inX = (1 - s) * 520;
  const inB = interpolate(f - A, [0, 6], [12, 0], clamp);
  // アウト：最初ゆっくり→一気に左へ抜ける（加速）
  const o = interpolate(f, [Bf, Bf + 8], [0, 1], { ...clamp, easing: Easing.in(Easing.exp) });
  const blur = Math.max(inB, o * 22);
  return <AbsoluteFill style={{ opacity: Math.min(1, (f - A + 1) / 3) * (1 - o * 0.6), filter: blur > 0.3 ? `blur(${blur}px)` : undefined, transform: `translateX(${inX - o * 900}px) scale(${0.96 + 0.04 * Math.min(s, 1)})` }}>{children}</AbsoluteFill>;
};

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

// ════════ ① オルカンとは（0–7.44） ════════
const S1: React.FC = () => {
  const f = useCurrentFrame();
  const sh = interpolate(f, [F(2.42), F(2.42) + 12], [0, 1], io);
  const gx = 540 - 210 + sh * (-170), gy = 440;
  const gs = 420 - sh * 130;
  return (
    <Scene a={0} b={7.44}>
      <Head text={<>そもそも<span style={{ color: A2.green }}>オルカン</span>って？</>} from={0} />
      {/* 地球儀＋まわりに国旗がポンポン */}
      <div style={{ position: "absolute", left: gx + (420 - gs) / 2, top: gy, transform: `rotate(${Math.sin(f / 18) * 3}deg)` }}>
        <PopIn at={0.2}><Pic name="bouraku_globe" size={gs} bob /></PopIn>
      </div>
      {FLAGS.map((c, i) => {
        const at = F(1.0) + i * 3;
        if (f < at) return null;
        const ang = (-90 + i * 45 + f * 0.25) * (Math.PI / 180);
        const cx = gx + 210, cy = gy + gs / 2 + 10, r = gs / 2 + 70;
        return <div key={c} style={{ position: "absolute", left: cx + Math.cos(ang) * r - 40, top: cy + Math.sin(ang) * r - 26, transform: `scale(${pop(f, at) * (1 - sh * 0.15)})` }}><Flag c={c} w={80} /></div>;
      })}
      {/* たくさんの企業 */}
      {f >= F(2.42) ? <div style={{ position: "absolute", left: 580, top: 430, transform: `scale(${pop(f, F(2.42))})` }}><Pic name="bouraku_buildings" size={330} /></div> : null}
      {/* 具体的な数字（MSCI ACWI） */}
      <PopAt at={1.28} x={60} y={910} w={440} center>
        <div style={{ ...B, fontSize: 30, color: A2.sub }}>世界</div>
        <div style={{ whiteSpace: "nowrap" }}><Count at={1.28} to={47} style={{ ...B, fontSize: 120, color: A2.green, lineHeight: 1 }} /><span style={{ ...B, fontSize: 50, color: A2.ink }}>カ国</span></div>
        <div style={{ ...B, fontSize: 24, color: A2.sub }}>先進国23・新興国24</div>
      </PopAt>
      <PopAt at={2.66} x={560} y={910} w={460} center>
        <div style={{ ...B, fontSize: 30, color: A2.sub }}>企業</div>
        <div style={{ whiteSpace: "nowrap" }}><span style={{ ...B, fontSize: 50, color: A2.ink }}>約</span><Count at={2.66} to={2500} comma style={{ ...B, fontSize: 120, color: A2.green, lineHeight: 1 }} /><span style={{ ...B, fontSize: 50, color: A2.ink }}>社</span></div>
      </PopAt>
      {/* まとめて投資 */}
      <PopAt at={3.42} x={0} y={1130} w={1080} center><span style={{ ...B, fontSize: 56, color: A2.ink }}><Mark2 delay={F(3.42) + 4}>まとめて投資</Mark2>できる商品</span></PopAt>
      {/* 定期的に見直し：くるっと回るマーク＋年4回 */}
      {f >= F(4.68) ? (
        <div style={{ position: "absolute", left: 0, top: 790, width: 1080, display: "flex", justifyContent: "center", alignItems: "center", gap: 14, transform: `scale(${pop(f, F(4.68))})` }}>
          <div style={{ transform: `rotate(${interpolate(f, [F(4.68), F(4.68) + 20], [-180, 0], out)}deg)` }}><GenSlot name="bouraku_refresh" size={96} /></div>
          <span style={{ display: "inline-flex", alignItems: "baseline", gap: 8, background: "#fff", borderRadius: 999, padding: "6px 26px", boxShadow: "0 6px 16px rgba(80,60,20,0.1)" }}>
            <span style={{ ...B, fontSize: 34, color: A2.ink }}>中身の見直し 年</span><span style={{ ...B, fontSize: 56, color: A2.green }}>4</span><span style={{ ...B, fontSize: 34, color: A2.ink }}>回</span>
            <span style={{ ...B, fontSize: 24, color: A2.sub, marginLeft: 8 }}>2・5・8・11月</span>
          </span>
        </div>
      ) : null}
      <Note at={1.28}>※オルカンが連動する指数「MSCI ACWI」の構成（2026年8月末時点・社数は変動）</Note>
      {/* かなり優秀 */}
      {f >= F(6.66) ? <div style={{ position: "absolute", left: 140, top: 520, zIndex: 5, transform: `scale(${pop(f, F(6.66))}) rotate(${Math.sin((f - F(6.66)) / 3) * interpolate(f - F(6.66), [0, 12], [10, 0], clamp)}deg)` }}><Pic name="bouraku_medal" size={230} /></div> : null}
      <div style={{ position: "absolute", inset: 0, zIndex: 5 }}><Stamp at={7.0} x={390} y={600} text="かなり優秀" color={A2.green} size={70} /></div>
    </Scene>
  );
};
const PopIn: React.FC<{ at: number; children: React.ReactNode }> = ({ at, children }) => {
  const f = useCurrentFrame();
  return <div style={{ transform: `scale(${f >= F(at) ? pop(f, F(at)) : 0})` }}>{children}</div>;
};

// ════════ ② 落とし穴（7.44–14.44）：フタが外れ、株の箱と地球儀が落ちる ════════
const PIT_X = 290, PIT_Y = 900, PIT_W = 500;
const S2: React.FC = () => {
  const f = useCurrentFrame();
  const open = F(7.76);
  const lid = interpolate(f, [open, open + 10], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const swap = interpolate(f, [F(10.38), F(10.38) + 10], [0, 1], io); // 地球儀の中身が株に
  const fall = F(12.34);
  const fallY = (delay: number) => interpolate(f, [fall + delay, fall + delay + 16], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const g = fallY(F(13.46) - fall); // 「オルカンも下がります」で地球儀が落ちる
  const shock = F(13.7);
  return (
    <Scene a={7.44} b={14.44}>
      <Head text={<>ここが<span style={{ color: A2.coral }}>落とし穴</span></>} from={F(7.44)} />
      {/* 断面の穴 */}
      <div style={{ position: "absolute", left: PIT_X - 60, top: PIT_Y - 120 }}><GenSlot name="bouraku_pit_side" size={620} /></div>
      {/* フタ：パカッと外れて飛ぶ */}
      {lid < 1 ? <div style={{ position: "absolute", left: PIT_X + 20 + lid * 520, top: PIT_Y - 110 - lid * 160, transform: `rotate(${lid * 70}deg)`, opacity: 1 - lid }}><GenSlot name="bouraku_pit_cover" size={460} /></div> : null}
      <Stamp at={7.9} x={620} y={420} text="落とし穴" size={58} />
      {/* 地球儀（世界中に分散できていても）→ 中身は全部株式 */}
      {f >= F(8.66) ? (
        <div style={{ position: "absolute", left: 360, top: 420 + g * 760, transform: `scale(${pop(f, F(8.66)) * (1 - g * 0.4)}) rotate(${g * 120}deg)`, opacity: 1 - g * 0.6 }}>
          <div style={{ position: "relative", width: 340, height: 340 }}>
            <div style={{ position: "absolute", inset: 0, opacity: 1 - swap * 0.25 }}><GenSlot name="bouraku_globe" size={340} /></div>
            {/* 中身＝株の箱が透けて見える */}
            <div style={{ position: "absolute", left: 70, top: 70, opacity: swap, transform: `scale(${0.6 + 0.4 * swap})` }}><GenSlot name="bouraku_stock_box_many" size={200} /></div>
          </div>
        </div>
      ) : null}
      <PopAt at={10.38} x={0} y={790} w={1080} center><span style={{ ...B, fontSize: 60, color: A2.ink }}>中身は<Mark2 delay={F(11.08)}>全部「株式」</Mark2></span></PopAt>
      {/* 株の箱が次々に落ちる */}
      {[0, 1, 2, 3].map((i) => {
        const d = i * 4;
        if (f < fall + d) return null;
        const p = fallY(d);
        return <div key={i} style={{ position: "absolute", left: PIT_X + 60 + i * 90, top: 560 + p * 620, transform: `rotate(${p * (i % 2 ? 60 : -50)}deg)`, opacity: 1 - p * 0.7 }}><GenSlot name="bouraku_stock_box" size={130} /></div>;
      })}
      {/* 嵐＋下がるグラフ */}
      {f >= fall ? <div style={{ position: "absolute", left: 650, top: 360, transform: `scale(${pop(f, fall)}) translateX(${Math.sin(f / 2) * 3}px)` }}><GenSlot name="bouraku_storm" size={300} /></div> : null}
      <DropLine at={fall} x={90} y={420} w={420} h={260} />
      {/* 過去の大きな下落（世界株） */}
      <PopAt at={12.5} x={40} y={640}><span style={{ display: "inline-flex", alignItems: "baseline", gap: 10, background: "#fff", borderRadius: 18, padding: "6px 18px", boxShadow: "0 6px 16px rgba(80,60,20,0.12)" }}><span style={{ ...B, fontSize: 28, color: A2.sub }}>2008年</span><span style={{ ...B, fontSize: 50, color: A2.coral }}>−56%</span></span></PopAt>
      <PopAt at={12.9} x={40} y={720}><span style={{ display: "inline-flex", alignItems: "baseline", gap: 10, background: "#fff", borderRadius: 18, padding: "6px 18px", boxShadow: "0 6px 16px rgba(80,60,20,0.12)" }}><span style={{ ...B, fontSize: 28, color: A2.sub }}>2020年</span><span style={{ ...B, fontSize: 50, color: A2.coral }}>−34%</span></span></PopAt>
      <Note at={12.5}>※世界株指数（MSCI ACWI・価格）の高値からの最大下落率。2008年＝リーマン・ショック、2020年＝コロナ・ショック</Note>
      {f >= shock ? <div style={{ position: "absolute", left: PIT_X + 70, top: PIT_Y + 200, transform: `scale(${pop(f, shock)})` }}><GenSlot name="bouraku_dust" size={360} /></div> : null}
      <PopAt at={13.46} x={0} y={1160} w={1080} center><Pill size={46}>オルカンも下がる</Pill></PopAt>
    </Scene>
  );
};
// 下がる折れ線（D1）
const DropLine: React.FC<{ at: number; x: number; y: number; w: number; h: number }> = ({ at, x, y, w, h }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const pts = [[0, 0.25], [0.15, 0.18], [0.3, 0.28], [0.42, 0.2], [0.55, 0.45], [0.68, 0.4], [0.8, 0.75], [1, 0.9]];
  const d = pts.map(([px, py], i) => `${i ? "L" : "M"}${px * w} ${py * h}`).join(" ");
  const p = interpolate(f, [at, at + 18], [0, 1], out);
  return (
    <svg width={w + 20} height={h + 20} style={{ position: "absolute", left: x, top: y }}>
      <path d={d} fill="none" stroke={A2.coral} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
    </svg>
  );
};

// ════════ ③ 資産が株に寄っていく（14.44–23.62） ════════
const JARS: [string, string, string][] = [["bouraku_jar_green", "株", STOCK], ["bouraku_jar_blue", "債券", BOND], ["bouraku_jar_yellow", "現金", CASH]];
const S3: React.FC = () => {
  const f = useCurrentFrame();
  const c0 = F(16.6), c1 = F(21.0);
  const coins = Array.from({ length: 12 }).map((_, i) => c0 + Math.round(((c1 - c0) * i) / 12));
  const landed = coins.filter((t) => f >= t + 10).length;
  const fill = landed / 12;
  const tilt = interpolate(f, [F(21.24), F(21.24) + 14], [0, -13], { ...clamp, easing: Easing.out(Easing.back(2)) });
  return (
    <Scene a={14.44} b={23.62}>
      <Head text={<>多くの人が<span style={{ color: A2.coral }}>ハマる</span>落とし穴</>} from={F(14.44)} />
      {/* 3つのビン */}
      {JARS.map(([n, label, col], i) => {
        const x = 90 + i * 320;
        const big = i === 0 ? 1 + fill * 0.12 : 1;
        const shake = i === 0 ? Math.sin(f / 1.7) * fill * fill * 5 : 0; // いっぱいになるほどグラグラ
        return (
          <PopAt key={n} at={14.9 + i * 0.15} x={x} y={430}>
            {i === 0 ? <div style={{ position: "absolute", left: -30, top: -20, width: 320, height: 340, borderRadius: "50%", background: `radial-gradient(circle, rgba(239,125,87,${0.45 * fill}) 0%, rgba(239,125,87,0) 70%)` }} /> : null}
            <div style={{ position: "relative", width: 260, height: 300, transform: `scale(${big}) rotate(${shake}deg)`, transformOrigin: "50% 100%" }}>
              {/* 中身（コインの量） */}
              <div style={{ position: "absolute", left: 0, top: 0 }}><GenSlot name={n} size={260} /></div>
              {/* 中身（コインの量）＝ビンのガラスの内側に重ねる */}
              <div style={{ position: "absolute", left: 52, right: 52, bottom: 24, height: (i === 0 ? fill * 165 : 14), borderRadius: "10px 10px 26px 26px", background: `linear-gradient(#F7D45A, #D9A21A)`, opacity: 0.92, boxShadow: "inset 0 6px 0 rgba(255,255,255,0.35)" }}>
                {i === 0 && fill > 0.1 ? Array.from({ length: Math.ceil(fill * 9) }).map((_, k) => <div key={k} style={{ position: "absolute", left: 10 + (k % 3) * 40, top: 6 + Math.floor(k / 3) * 34, width: 34, height: 10, borderRadius: 5, background: "rgba(255,255,255,0.45)" }} />) : null}
              </div>
              <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center" }}><Pill bg={col} size={38}>{label}</Pill></div>
            </div>
          </PopAt>
        );
      })}
      {/* コインが毎月チャリン（株のビンにだけ） */}
      {coins.map((t, i) => {
        if (f < t || f > t + 10) return null;
        const p = interpolate(f, [t, t + 10], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
        return <div key={i} style={{ position: "absolute", left: 175 + (i % 3) * 12, top: 290 + p * 230, transform: `rotate(${p * 200}deg)` }}><GenSlot name="bouraku_coin" size={90} /></div>;
      })}
      {/* リスク大（株のビンがいっぱいになると点滅） */}
      {fill > 0.55 ? <div style={{ position: "absolute", left: 95, top: 360, transform: `scale(${pop(f, coins[7] + 10)})`, opacity: 0.75 + 0.25 * Math.sin(f / 2.5) }}><Pill bg={A2.red} size={38}>⚠ リスク大</Pill></div> : null}
      <PopAt at={17.02} x={60} y={830}><Pill bg={A2.green} size={36}>増やそう増やそう</Pill></PopAt>
      <PopAt at={18.38} x={560} y={830}><Pill bg={A2.green} size={36}>とりあえず積立</Pill></PopAt>
      {/* シーソー：株側にガクッ */}
      {f >= F(19.56) ? (
        <div style={{ position: "absolute", left: 140, top: 990, width: 800, height: 160, opacity: interpolate(f - F(19.56), [0, 6], [0, 1], clamp) }}>
          <div style={{ position: "absolute", left: 370, top: 90, width: 0, height: 0, borderLeft: "30px solid transparent", borderRight: "30px solid transparent", borderBottom: `60px solid ${A2.ink}` }} />
          <div style={{ position: "absolute", left: 0, top: 80, width: 800, height: 14, borderRadius: 7, background: A2.ink, transform: `rotate(${tilt}deg)` }}>
            <div style={{ position: "absolute", left: 20, top: -96, transform: `scale(${1 + fill * 0.2})`, transformOrigin: "50% 100%" }}><Pill bg={STOCK} size={44}>株</Pill></div>
            <div style={{ position: "absolute", right: 30, top: -70 }}><span style={{ display: "inline-flex", gap: 10 }}><Pill bg={BOND} size={28}>債券</Pill><Pill bg={CASH} color={A2.ink} size={28}>現金</Pill></span></div>
          </div>
        </div>
      ) : null}
      <Stamp at={22.06} x={170} y={1190} text="資産分散できていない" size={56} rot={-3} />
    </Scene>
  );
};

// ════════ ④ 使うタイミングと暴落が重なる（23.62–33.88） ════════
const S4: React.FC = () => {
  const f = useCurrentFrame();
  const W = 860, H = 340, X = 110, Y = 470;
  const line = interpolate(f, [F(23.8), F(25.0)], [0, 1], out);
  const crashP = interpolate(f, [F(27.52), F(27.52) + 14], [0, 1], out);
  // 右肩上がり→最後に暴落
  const pts: [number, number][] = [[0, 0.75], [0.12, 0.66], [0.24, 0.7], [0.36, 0.55], [0.48, 0.5], [0.6, 0.36], [0.72, 0.3]];
  const crash: [number, number][] = [[0.8, 0.26], [0.88, 0.62], [1, 0.82]];
  const path = (ps: [number, number][]) => ps.map(([x, y], i) => `${i ? "L" : "M"}${x * W} ${y * H}`).join(" ");
  const useX = 0.88 * W;
  const ring = F(26.28);
  return (
    <Scene a={23.62} b={33.88}>
      <Head text={<>本当に<span style={{ color: A2.coral }}>困る</span>のは？</>} from={F(23.62)} />
      <svg width={W + 40} height={H + 40} style={{ position: "absolute", left: X, top: Y }}>
        <line x1={0} y1={H + 10} x2={W} y2={H + 10} stroke={A2.bar} strokeWidth={4} />
        <path d={path(pts)} fill="none" stroke={STOCK} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - line} />
        {crashP > 0 ? <path d={path([pts[pts.length - 1], ...crash])} fill="none" stroke={A2.coral} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - crashP} /> : null}
        {/* お金を使うタイミング：縦の点線 */}
        {f >= ring ? <line x1={useX} y1={-10} x2={useX} y2={H + 10} stroke={A2.ink} strokeWidth={4} strokeDasharray="12 10" opacity={interpolate(f - ring, [0, 6], [0, 1], clamp)} /> : null}
      </svg>
      {f >= ring ? <div style={{ position: "absolute", left: X + useX - 120, top: Y - 130, transform: `scale(${pop(f, ring)})` }}><Pic name="bouraku_calendar_event" size={150} /></div> : null}
      <PopAt at={26.28} x={X + useX - 60} y={Y - 140}><Pill bg={A2.ink} size={30}>お金を使う時</Pill></PopAt>
      <Stamp at={28.3} x={240} y={870} text="重なると…" size={56} rot={-4} />
      {/* 必要なお金が減る＋売るストレス */}
      <div style={{ opacity: interpolate(f, [F(31.9), F(32.2)], [1, 0], clamp) }}>
      <In at={F(28.94)} style={{ left: 90, top: 990 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <Pic name="mile_lp_school" size={190} />
          <div style={{ ...B, fontSize: 44, color: A2.ink }}>必要なお金が<br /><span style={{ color: A2.coral }}>減っている</span></div>
        </div>
      </In>
      <In at={F(30.36)} style={{ left: 600, top: 980 }}>
        <div style={{ textAlign: "center" }}>
          <Pic name="bouraku_person_stress" size={220} />
        </div>
      </In>
      <PopAt at={31.24} x={590} y={1200}><Pill size={36}>売るストレス</Pill></PopAt>
      </div>
      <PopAt at={32.3} x={360} y={1060}><span style={{ ...B, fontSize: 54, color: A2.coral }}>一番怖いところ</span></PopAt>
      <Taichi name="taichi_head_hold" at={32.06} until={33.88} />
    </Scene>
  );
};

// ════════ ⑤ 債券を組み合わせる（33.88–44.8） ════════
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
      <Taichi name="taichi_point_right" at={33.88} until={37.2} />
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
const S6: React.FC = () => {
  const f = useCurrentFrame();
  const lockAt = F(49.28);
  const lk = interpolate(f, [lockAt, lockAt + 6], [-40, 0], { ...clamp, easing: Easing.out(Easing.back(3)) });
  return (
    <Scene a={44.8} b={56.8}>
      <Head text={<>今は<span style={{ color: BOND }}>債券の金利</span>が高い</>} from={F(44.8)} />
      {/* 金利の温度計が上がる */}
      <In at={F(45.6)} style={{ left: 110, top: 420 }}><RateMeter at={F(45.9)} /></In>
      <PopAt at={46.14} x={110} y={710}><Pill bg={BOND} size={40}>金利 ↑</Pill></PopAt>
      {/* 20年・30年先まで固定：タイムラインに鍵 */}
      <div style={{ position: "absolute", left: 420, top: 520, width: 560, height: 12, borderRadius: 6, background: A2.track }} />
      <div style={{ position: "absolute", left: 420, top: 520, width: 560 * interpolate(f, [F(46.94), F(48.3)], [0, 1], out), height: 12, borderRadius: 6, background: BOND }} />
      <PopAt at={46.94} x={600} y={560}><Pill bg="#fff" color={A2.ink} size={34}>20年</Pill></PopAt>
      {f >= F(46.94) ? <div style={{ position: "absolute", left: 880, top: 360, transform: `scale(${pop(f, F(46.94))}) rotate(${interpolate(f, [F(46.94), F(46.94) + 18], [-180, 0], out)}deg)` }}><GenSlot name="bouraku_hourglass" size={130} /></div> : null}
      <PopAt at={47.5} x={840} y={560}><Pill bg="#fff" color={A2.ink} size={34}>30年</Pill></PopAt>
      {f >= lockAt ? <div style={{ position: "absolute", left: 640, top: 340 + lk, transform: `scale(${pop(f, lockAt)})` }}><Pic name="bouraku_lock" size={170} /></div> : null}
      <Stamp at={49.8} x={470} y={680} text="利回りを固定" color={BOND} size={54} rot={-4} />
      {/* 僕自身も：30年先の一部を債券に */}
      {f >= F(50.3) ? (
        <div style={{ position: "absolute", left: 360, top: 860, width: 640, opacity: interpolate(f - F(50.3), [0, 6], [0, 1], clamp) }}>
          <div style={{ ...B, fontSize: 36, color: A2.sub }}>30年先に必要なお金</div>
          <div style={{ marginTop: 14, height: 70, borderRadius: 18, background: "#fff", overflow: "hidden", position: "relative", boxShadow: "0 8px 20px rgba(80,60,20,0.08)" }}>
            <div style={{ position: "absolute", left: 0, top: 0, height: 70, width: `${interpolate(f, [F(53.26), F(53.26) + 12], [0, 45], out)}%`, background: BOND }} />
            {f >= F(53.6) ? <div style={{ position: "absolute", left: 20, top: 12, ...B, fontSize: 34, color: "#fff" }}>一部を債券に</div> : null}
          </div>
          <PopAt at={54.12} x={0} y={130}><Pill bg="#fff" color={A2.ink} size={34}>例：500万円 → 30年後 約2,160万円</Pill></PopAt>
          <Stamp at={55.94} x={300} y={120} text="決めている" color={A2.green} size={44} rot={-4} />
        </div>
      ) : null}
      <Taichi name="taichi_explain_both" at={50.3} until={56.8} />
    </Scene>
  );
};

// ════════ ⑦ 今のお金も使いやすくなる（56.8–70.4） ════════
const NOW = ["mile_now_beach", "mile_now_photo", "mile_now_dinner", "mile_now_shoulder", "mile_now_snow", "mile_now_hug"];
const S7: React.FC = () => {
  const f = useCurrentFrame();
  const see = F(59.94), save = F(63.32), trip = F(64.62);
  const burst = interpolate(f, [save, save + 10], [0, 1], out);
  return (
    <Scene a={56.8} b={70.6}>
      <Head text={<>将来が<span style={{ color: A2.green }}>見えている</span>と…</>} from={F(56.8)} to={F(64.62)} />
      <Head text={<><span style={{ color: A2.coral }}>今</span>を楽しめる</>} from={F(64.62)} />
      {f < trip + 8 ? (
        <div style={{ position: "absolute", inset: 0, opacity: interpolate(f, [trip, trip + 8], [1, 0], clamp) }}>
          {/* 将来のお金（見えている）＝ゴールの箱 */}
          <In at={F(58.1)} style={{ left: 110, top: 460 }}><div style={{ textAlign: "center" }}><Pic name="mile_lp_retire_fund" size={260} /><div style={{ marginTop: 6 }}><Pill bg={BOND} size={34}>将来のお金</Pill></div></div></In>
          {f >= see ? <div style={{ position: "absolute", left: 140, top: 400, transform: `scale(${pop(f, see)})` }}><Pill bg="#fff" color={A2.green} size={34}>✓ 見えている</Pill></div> : null}
          {/* 全部貯め込まなくていい：あふれた貯金箱 → お金が飛び出す */}
          <In at={F(62.28)} style={{ left: 600, top: 440 }}><Pic name="bouraku_piggy_full" size={300} /></In>
          {burst > 0 ? [0, 1, 2, 3, 4].map((i) => <div key={i} style={{ position: "absolute", left: 720 + Math.cos(-1.2 - i * 0.45) * 260 * burst, top: 520 - Math.sin(-1.2 - i * 0.45 + 3.14) * 200 * burst, opacity: 1 - burst * 0.3 }}><GenSlot name="bouraku_coin" size={70} /></div>) : null}
          <Stamp at={63.54} x={330} y={860} text="全部貯め込まなくていい" color={A2.green} size={50} rot={-3} />
        </div>
      ) : null}
      {/* 旅行・家族の時間：画像がポンポン */}
      {NOW.map((n, i) => {
        const at = trip + i * 8;
        if (f < at) return null;
        const x = 70 + (i % 3) * 320, y = 440 + Math.floor(i / 3) * 330;
        const again = F(66.88) + i * 3;
        const hop = f >= again ? interpolate(f - again, [0, 3, 8], [0, -24, 0], clamp) : 0;
        return <div key={n} style={{ position: "absolute", left: x, top: y + hop, transform: `scale(${pop(f, at)})` }}><Pic name={n} size={290} /></div>;
      })}
      <PopAt at={68.2} x={0} y={1110} w={1080} center><span style={{ ...B, fontSize: 60, color: A2.ink }}><Mark2 delay={F(68.4)}>罪悪感なく</Mark2>使える</span></PopAt>
      <Taichi name="taichi_relief" at={68.2} until={70.6} />
    </Scene>
  );
};

// ── 太一キャラ（左下からひょこっと）──
const Taichi: React.FC<{ name: string; at: number; until: number }> = ({ name, at, until }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const A = F(at), U = F(until);
  if (f < A || f >= U) return null;
  const s = spring({ frame: f - A, fps, config: { damping: 9, stiffness: 230, mass: 0.6 } }); // 行き過ぎて戻る
  const o = interpolate(f, [U - 7, U], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const x = -360 + s * 380 - o * 420;
  const lean = (1 - s) * -14 + o * -12; // 入る勢いで前のめり
  const streak = interpolate(f - A, [0, 2, 8], [0, 1, 0], clamp) + o;
  return (
    <>
      {streak > 0.02 ? [0, 1, 2].map((k) => <div key={k} style={{ position: "absolute", left: x - 120 + k * 30, top: 1080 + k * 50, width: 160, height: 6, borderRadius: 3, background: A2.green, opacity: streak * 0.5 }} />) : null}
      <div style={{ position: "absolute", left: x, top: 1000, transform: `rotate(${lean + Math.sin(f / 8) * 1.5}deg) translateY(${Math.sin(f / 10) * 4}px)`, transformOrigin: "50% 100%" }}>
        <GenSlot name={name} size={300} />
      </div>
    </>
  );
};


const SUBS: [number, string][] = [
  [0, "そもそもオルカンって"], [1.0, "世界中に分散できて"], [2.42, "たくさんの企業に"], [3.42, "まとめて投資できる商品"], [4.68, "中身も定期的に見直されるので"], [6.66, "かなり優秀"],
  [7.44, "でも、ここが落とし穴"], [8.66, "世界中に分散できていても"], [10.38, "中身は全部「株式」"], [11.9, "だから"], [12.34, "株が下がるときは"], [13.46, "オルカンも下がります"],
  [14.44, "しかも"], [14.86, "多くの人がハマっている落とし穴が"], [16.6, "株で増やそう増やそうとしたり"], [18.38, "とりあえず積み立てして"], [19.56, "資産が株に寄っている状態"], [21.24, "つまり資産分散が"], [22.7, "できていない状態"],
  [23.62, "株が下がること自体より"], [25.28, "本当に困るのは"], [26.28, "「お金を使うタイミング」と"], [27.52, "暴落が重なったとき"], [28.94, "必要なお金が減っているうえに"], [30.36, "下がっている中で売るストレスもある"], [32.06, "これが一番怖いところです"],
  [33.88, "だから僕は"], [34.6, "株だけに任せず"], [35.66, "債券も組み合わせています"], [37.2, "債券は"], [38.0, "何年後にいくらくらいになるかを"], [39.9, "ある程度見える状態にしやすいから"], [42.0, "将来必要なお金を"], [43.44, "計画的に用意できる"],
  [44.8, "しかも今は"], [45.6, "債券の金利も高く"], [46.94, "20年、30年先まで"], [48.66, "利回りを固定できるチャンスです"], [50.3, "僕自身も"], [51.08, "30年先に必要なお金の一部は"], [53.26, "債券に入れて"], [54.12, "「何年後にいくら」にするかを"], [55.72, "ある程度決めています"],
  [56.8, "これをやっている理由は"], [58.1, "将来のお金のためだけではなくて"], [59.94, "将来必要なお金が"], [61.22, "ある程度見えていれば"], [62.28, "残ったお金を"], [63.32, "全部貯め込まなくていい"], [64.62, "旅行だったり"], [65.46, "家族との時間だったり"], [66.88, "今を楽しむことにも"], [68.2, "罪悪感なく"], [68.94, "お金を使いやすくなります"],
];

const CUES: { file: string; at: number; volume: number }[] = [
  { file: "user/u03s", at: F(0.1), volume: 0.28 },
  ...FLAGS.map((_, i) => ({ file: "user/u02s", at: F(1.0) + i * 3, volume: 0.14 })),
  { file: "user/u02s", at: F(2.42), volume: 0.24 },
  { file: "user/u05s", at: F(4.68), volume: 0.24 },
  { file: "user/u05", at: F(7.0), volume: 0.3 },
  { file: "user/u03", at: F(7.44), volume: 0.28 },
  { file: "swipe", at: F(7.76), volume: 0.3 },
  { file: "user/u02s", at: F(10.38), volume: 0.24 },
  { file: "whoosh2", at: F(12.34), volume: 0.32 },
  { file: "thud", at: F(13.7), volume: 0.35 },
  { file: "user/u03", at: F(14.44), volume: 0.28 },
  ...Array.from({ length: 12 }).map((_, i) => ({ file: "coin", at: F(16.6) + Math.round(((F(21.0) - F(16.6)) * i) / 12) + 10, volume: 0.12 })),
  { file: "thunk", at: F(21.24), volume: 0.32 },
  { file: "user/u05", at: F(22.06), volume: 0.3 },
  { file: "user/u03", at: F(23.62), volume: 0.28 },
  { file: "user/u02s", at: F(26.28), volume: 0.24 },
  { file: "whoosh2", at: F(27.52), volume: 0.28 },
  { file: "user/u05", at: F(28.3), volume: 0.3 },
  { file: "user/u03", at: F(33.88), volume: 0.28 },
  ...[7.44, 14.44, 23.62, 44.8, 56.8].map((t) => ({ file: "swipe", at: F(t) - 2, volume: 0.25 })),
  ...[32.06, 33.88, 50.3, 68.2].map((t) => ({ file: "swipe", at: F(t), volume: 0.22 })),
  { file: "user/u02s", at: F(35.66), volume: 0.24 },
  { file: "user/u02s", at: F(39.9), volume: 0.22 },
  { file: "user/u05s", at: F(43.6), volume: 0.26 },
  { file: "user/u03", at: F(44.8), volume: 0.28 },
  { file: "user/u05", at: F(49.28), volume: 0.3 },
  { file: "user/u05s", at: F(55.94), volume: 0.26 },
  { file: "user/u03", at: F(56.8), volume: 0.28 },
  { file: "user/u05", at: F(63.54), volume: 0.28 },
  ...NOW.map((_, i) => ({ file: "user/u02s", at: F(64.62) + i * 8, volume: 0.18 })),
  { file: "user/u10", at: F(68.2), volume: 0.3 },
];

export const BOURAKU_FRAMES = F(70.4) + 20;
export const BourakuReel: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: A2.bg, fontFamily: FONT }}>
    <Audio src={staticFile("bouraku-narration.wav")} />
    <SfxTrack cues={CUES} />
    <S1 /><S2 /><S3 /><S4 /><S5 /><S6 /><S7 />
    <SubFade />
    <MarkerSub subs={SUBS} start={0} end={70.3} />
  </AbsoluteFill>
);
