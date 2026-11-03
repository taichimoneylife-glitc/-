import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame } from "remotion";
import { FONT, FONT_BLACK, FONT_SERIF } from "./components/font";
import { B, GenSlot } from "./MileLifePlan";
import { ghostIn } from "./components/cam";
import { Board, Panel, Stop, Stepper, panelXY, PW, PH } from "./components/board";

// ════════════════════════════════════════════════════════════════════
//  練習：参考リール②（マーケ博士「クロードコードでゼロから最短で月七桁」131秒）の丸ごと再現VTR
//  全ページを1枚の地図に並べ、「縮む→点線に沿って流れる→戻る」でページ送り。時刻は元動画の音声と画面の変化から実測。
//  キャラは太一に、プロフィールはたいちに置き換え。ロゴや実在の人物・実績画像は使わず、同じ形の図で再現。
//  音声＝public/marke2-ref-audio.wav（元動画の音。比べる用・投稿しない・コミットしない）
// ════════════════════════════════════════════════════════════════════

const F = (t: number) => Math.round(t * 30);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const out = { ...clamp, easing: Easing.out(Easing.cubic) };
const K = { fontFamily: FONT_BLACK, fontWeight: 900 as const };
const SER = { fontFamily: FONT_SERIF, fontWeight: 900 as const };
const INK = "#22201C", RED = "#E8553B", PAPER = "#EDE8DD", GRAY = "#A8A196", FOLD = "#F2B544";
// 元動画は、文字が声より少し先に出る（約0.5秒）
const LEAD = 0.5;
const pop = (f: number, at: number) => interpolate(f - at, [0, 3, 6], [0.3, 1.18, 1], clamp);

// ── 文字 ──
const R: React.FC<{ children: React.ReactNode }> = ({ children }) => <span style={{ ...SER, color: RED }}>{children}</span>;
type Line = [number, React.ReactNode];
const Lines: React.FC<{ x?: number; y: number; size?: number; lines: Line[]; center?: boolean; lh?: number }> = ({ x = 60, y, size = 58, lines, center, lh = 1.45 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: center ? 0 : x, top: y, width: center ? 1080 : 1000, textAlign: center ? "center" : "left" }}>
      {lines.map(([t, node], i) => f >= F(t - LEAD) ? <div key={i} style={{ ...K, fontSize: size, color: INK, lineHeight: lh, whiteSpace: "nowrap", ...ghostIn(f, F(t - LEAD)), transformOrigin: center ? "50% 50%" : "0 50%" }}>{node}</div> : <div key={i} style={{ fontSize: size, lineHeight: lh }}>&nbsp;</div>)}
    </div>
  );
};
const StepHead: React.FC<{ n: number; at: number; title: string; y?: number }> = ({ n, at, title, y = 400 }) => {
  const f = useCurrentFrame();
  if (f < F(at)) return null;
  return (
    <div style={{ position: "absolute", left: 60, top: y, display: "flex", alignItems: "center", gap: 22, ...ghostIn(f, F(at)), transformOrigin: "0 50%" }}>
      <span style={{ background: RED, color: "#fff", borderRadius: 999, padding: "6px 30px", ...K, fontSize: 36 }}>STEP {n}</span>
      <span style={{ ...K, fontSize: 60, color: INK }}>{title}</span>
    </div>
  );
};
const At: React.FC<{ at: number; until?: number; x: number; y: number; children: React.ReactNode; mode?: "ghost" | "pop" | "fade"; origin?: string }> = ({ at, until = 999, x, y, children, mode = "ghost", origin = "50% 50%" }) => {
  const f = useCurrentFrame();
  const A = F(at), Z = F(until);
  if (f < A || f >= Z + 5) return null;
  const o = 1 - interpolate(f, [Z, Z + 5], [0, 1], clamp);
  const st = mode === "pop" ? { transform: `scale(${pop(f, A)})` } : mode === "fade" ? { opacity: interpolate(f - A, [0, 8], [0, 1], clamp) } : ghostIn(f, A);
  return <div style={{ position: "absolute", left: x, top: y, ...st, opacity: ((st as { opacity?: number }).opacity ?? 1) * o, transformOrigin: origin }}>{children}</div>;
};

// ── 図の部品 ──
const AiIcon: React.FC<{ s: number }> = ({ s }) => (
  <div style={{ width: s, height: s, borderRadius: s * 0.22, background: "#fff", boxShadow: "0 10px 26px rgba(60,40,20,0.16)", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <svg width={s * 0.62} height={s * 0.62} viewBox="-50 -50 100 100">{Array.from({ length: 12 }).map((_, i) => { const a = (i / 12) * Math.PI * 2; const r = i % 2 ? 40 : 46; return <line key={i} x1={0} y1={0} x2={Math.cos(a) * r} y2={Math.sin(a) * r} stroke="#E0784F" strokeWidth={8} strokeLinecap="round" />; })}</svg>
  </div>
);
const Ripple: React.FC<{ x: number; y: number; at: number; until: number; r?: number }> = ({ x, y, at, until, r = 520 }) => {
  const f = useCurrentFrame();
  if (f < F(at) || f > F(until) + 8) return null;
  const o = interpolate(f, [F(at), F(at) + 8, F(until), F(until) + 8], [0, 1, 1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, opacity: o }}>
      {[0, 1, 2].map((k) => { const p = ((f / 30 + k / 3) % 1); return <div key={k} style={{ position: "absolute", inset: r * (1 - (0.35 + p * 0.65)), borderRadius: "50%", background: `rgba(232,85,59,${0.22 * (1 - p)})` }} />; })}
      <div style={{ position: "absolute", inset: r * 0.4, borderRadius: "50%", background: "rgba(232,85,59,0.16)" }} />
    </div>
  );
};
const Books: React.FC<{ w: number }> = ({ w }) => (
  <div style={{ width: w }}>
    {["#2D3A57", "#3E6650", "#E9DFC6", "#8E3B32", "#4A4A4A", "#C9C1AE"].map((c, i) => (
      <div key={i} style={{ height: w * 0.12, margin: `0 ${(i % 2) * 10}px 4px ${((i + 1) % 2) * 10}px`, borderRadius: 8, background: c, boxShadow: "inset 0 -6px 0 rgba(0,0,0,0.15)", transform: `rotate(${[-2, 1, -1, 2, -1, 1][i]}deg)` }} />
    ))}
  </div>
);
const Laptop: React.FC<{ w: number }> = ({ w }) => (
  <div style={{ width: w }}>
    <div style={{ height: w * 0.6, background: "#1E2433", borderRadius: 14, border: "10px solid #3A3F4A", padding: 18, boxSizing: "border-box", display: "flex", gap: 14 }}>
      {[0, 1].map((k) => <div key={k} style={{ flex: 1, background: "#283044", borderRadius: 8, padding: 10 }}>{[70, 45, 80, 55, 65].map((wd, j) => <div key={j} style={{ width: `${wd}%`, height: 8, borderRadius: 4, background: j % 2 ? "#7C6BE0" : "#4C8BE0", margin: "8px 0", marginLeft: j % 2 ? 14 : 0 }} />)}</div>)}
    </div>
    <div style={{ height: 16, margin: "0 -26px", background: "#C9CCD3", borderRadius: "0 0 14px 14px" }} />
  </div>
);
const Pill: React.FC<{ children: React.ReactNode; bg?: string; color?: string; size?: number; border?: string }> = ({ children, bg = "#fff", color = INK, size = 30, border = INK }) => (
  <span style={{ display: "inline-block", background: bg, color, border: `3px solid ${border}`, borderRadius: 999, padding: "4px 22px", ...B, fontSize: size, whiteSpace: "nowrap" }}>{children}</span>
);
const Folder: React.FC<{ w: number; label: string }> = ({ w, label }) => (
  <div style={{ position: "relative", width: w, height: w * 0.48 }}>
    <div style={{ position: "absolute", left: 0, top: 0, width: w * 0.42, height: w * 0.14, background: "#E8A93A", borderRadius: "10px 10px 0 0" }} />
    <div style={{ position: "absolute", left: 0, top: w * 0.1, width: w, height: w * 0.38, background: FOLD, borderRadius: "0 10px 10px 10px", boxShadow: "0 8px 16px rgba(120,80,20,0.18)", display: "flex", alignItems: "center", justifyContent: "center", ...B, fontSize: w * 0.085, color: INK }}>{label}</div>
  </div>
);
const Phone: React.FC<{ w: number }> = ({ w }) => (
  <div style={{ width: w, height: w * 2, borderRadius: w * 0.16, background: "#1C1C1C", padding: w * 0.05, boxSizing: "border-box" }}>
    <div style={{ width: "100%", height: "100%", borderRadius: w * 0.12, background: "linear-gradient(180deg,#F2C79B 0%,#C98A6A 45%,#5E7B8F 100%)", position: "relative" }}>
      <div style={{ position: "absolute", left: "50%", top: "45%", width: w * 0.2, height: w * 0.2, marginLeft: -w * 0.1, borderRadius: "50%", background: "rgba(255,255,255,0.8)" }} />
    </div>
  </div>
);
const Bag: React.FC<{ w: number }> = ({ w }) => (
  <div style={{ position: "relative", width: w, height: w * 1.15 }}>
    <div style={{ position: "absolute", left: w * 0.28, top: 0, width: w * 0.44, height: w * 0.36, border: `${w * 0.05}px solid #8C6A43`, borderBottom: "none", borderRadius: `${w * 0.22}px ${w * 0.22}px 0 0`, boxSizing: "border-box" }} />
    <div style={{ position: "absolute", left: 0, top: w * 0.25, width: w, height: w * 0.9, background: "linear-gradient(90deg,#C59B6A,#B8895A)", borderRadius: 8, boxShadow: "0 10px 18px rgba(80,50,20,0.2)" }} />
  </div>
);
const Person: React.FC<{ s: number; happy?: boolean }> = ({ s, happy }) => <GenSlot name={happy ? "kabe_hook_happy" : "kabe_husband_salaryman"} size={s} />;
const Arrow: React.FC<{ at: number; x1: number; y1: number; x2: number; y2: number; color?: string; dur?: number }> = ({ at, x1, y1, x2, y2, color = RED, dur = 6 }) => {
  const f = useCurrentFrame();
  if (f < F(at)) return null;
  const p = interpolate(f - F(at), [0, dur], [0, 1], out);
  const x = x1 + (x2 - x1) * p, y = y1 + (y2 - y1) * p, a = Math.atan2(y2 - y1, x2 - x1);
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <line x1={x1} y1={y1} x2={x} y2={y} stroke={color} strokeWidth={6} strokeLinecap="round" />
      {p > 0.7 ? <path d={`M${x} ${y} L${x - 22 * Math.cos(a - 0.5)} ${y - 22 * Math.sin(a - 0.5)} M${x} ${y} L${x - 22 * Math.cos(a + 0.5)} ${y - 22 * Math.sin(a + 0.5)}`} stroke={color} strokeWidth={6} strokeLinecap="round" fill="none" /> : null}
    </svg>
  );
};
const Cross: React.FC<{ at: number; x: number; y: number; s: number }> = ({ at, x, y, s }) => {
  const f = useCurrentFrame();
  if (f < F(at)) return null;
  const a = interpolate(f - F(at), [0, 4], [0, 1], out), b = interpolate(f - F(at), [3, 7], [0, 1], out);
  return <svg width={s} height={s} style={{ position: "absolute", left: x, top: y }}><line x1={8} y1={8} x2={8 + (s - 16) * a} y2={8 + (s - 16) * a} stroke={RED} strokeWidth={10} strokeLinecap="round" />{b > 0 ? <line x1={s - 8} y1={8} x2={s - 8 - (s - 16) * b} y2={8 + (s - 16) * b} stroke={RED} strokeWidth={10} strokeLinecap="round" /> : null}</svg>;
};
const Count: React.FC<{ at: number; from?: number; to: number; dur: number }> = ({ at, from = 0, to, dur }) => {
  const f = useCurrentFrame();
  return <>{Math.round(interpolate(f, [F(at), F(at) + dur], [from, to], out)).toLocaleString("en-US")}</>;
};
const Note: React.FC<{ at: number; until?: number; y: number }> = ({ at, until = 999, y }) => <At at={at} until={until} x={60} y={y} mode="fade"><span style={{ ...B, fontSize: 26, color: GRAY }}>※成果には個人差があります</span></At>;

// ════════ 各ページ（1080×1920の座標） ════════
const P1: React.FC = () => {
  const f = useCurrentFrame();
  const shrink = interpolate(f, [F(2.4), F(2.4) + 8], [0, 1], { ...clamp, easing: Easing.bezier(0.65, 0, 0.35, 1) });
  const ix = 540 + (285 - 540) * shrink, iy = 800 + (855 - 800) * shrink, is = 420 - 120 * shrink;
  return (
    <>
      <Ripple x={540 - 0 * shrink} y={830} at={0} until={5.3} r={560} />
      <Lines center y={390} size={64} lines={[[0.5, "もし、クロードコードで"], [0.5, <>ゼロから最短で<R>月七桁</R></>]]} />
      <div style={{ position: "absolute", left: ix - is / 2, top: iy - is / 2, transform: `scale(${f < F(0.3) ? 0 : interpolate(f - F(0.3), [0, 4, 8], [1.3, 0.95, 1], clamp)})` }}>
        <AiIcon s={is} />
        <div style={{ textAlign: "center", ...B, fontSize: 30, color: INK, marginTop: 10 }}>AIツール</div>
      </div>
      <Arrow at={2.66} x1={460} y1={860} x2={590} y2={860} />
      <At at={2.94} x={620} y={640} mode="pop"><Books w={380} /></At>
      <At at={2.94} until={5.3} x={130} y={1100} origin="50% 50%"><span style={{ ...B, fontSize: 56, color: INK }}>月<span style={{ ...SER, fontSize: 112, color: RED }}><Count at={2.94} to={1000000} dur={14} /></span>円</span></At>
      {["アプリ", "作業場", "声", "商品", "提供"].map((t, i) => (
        <At key={t} at={4.4 + i * 0.1} until={5.3} x={55 + i * 196} y={1250} mode="pop">
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff", border: `3px solid ${INK}`, borderRadius: 999, padding: "6px 18px 6px 8px", ...B, fontSize: 28 }}><span style={{ width: 36, height: 36, borderRadius: "50%", background: RED, color: "#fff", textAlign: "center", lineHeight: "36px", fontSize: 24 }}>{i + 1}</span>{t}</span>
        </At>
      ))}
      <At at={5.42} x={800} y={1050} mode="pop"><Pill bg={RED} color="#fff" border={RED}>月7桁</Pill></At>
      <Lines center y={1150} size={50} lines={[[6.54, "エンジニアでなくても、"], [7.36, <><R>簡単</R>に使い始められるんじゃが…</>]]} />
    </>
  );
};
const P2: React.FC = () => {
  const f = useCurrentFrame();
  const L = interpolate(f, [F(10.5), F(12.2)], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const pts = Array.from({ length: 30 }).map((_, i) => { const t = i / 29; return [140 + t * 760, 1200 - (Math.pow(t, 2.2) * 280 + t * 30)]; });
  const vis = pts.slice(0, Math.max(2, Math.round(L * 30)));
  return (
    <>
      <Lines y={480} size={50} lines={[[9.08, "わしもAIを本気で使った結果、"], [11.14, <><R>月三千万</R>も成果が</>], [12.26, "出てしまっておる。"]]} />
      <At at={9.3} x={0} y={0} mode="fade">
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}><path d="M140 930 V1230 H920" fill="none" stroke={INK} strokeWidth={5} /></svg>
      </At>
      {f >= F(10.5) ? <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}><polyline points={vis.map((p) => p.join(",")).join(" ")} fill="none" stroke={RED} strokeWidth={7} strokeLinecap="round" /></svg> : null}
      <At at={11.14} x={150} y={800}><span style={{ ...SER, fontSize: 118, color: RED }}><Count at={11.14} from={2000} to={3000} dur={36} /></span><span style={{ ...K, fontSize: 40, color: INK }}>万円/月</span></At>
      <Note at={9.3} y={1460} />
    </>
  );
};
const P3: React.FC = () => (
  <>
    <Lines y={400} size={56} lines={[[13.22, "しかし、AIをどれだけ極めても、"], [15.22, <>作業が<R>早くなるだけ</R>で、</>], [16.68, <><R>収益</R>にはつながらんのじゃ。</>]]} />
    <At at={14.3} x={70} y={720} mode="pop"><Laptop w={420} /></At>
    {[0, 1, 2].map((i) => <At key={i} at={15.5 + i * 0.08} x={540} y={830 + i * 40} mode="fade"><div style={{ width: 110, height: 7, borderRadius: 4, background: RED }} /></At>)}
    <Arrow at={16.0} x1={665} y1={870} x2={765} y2={870} color="#7B776E" />
    <At at={16.68} x={780} y={820} mode="pop"><span style={{ display: "inline-block", width: 220, height: 100, borderRadius: 999, border: `5px solid ${INK}`, background: "#fff", ...K, fontSize: 44, textAlign: "center", lineHeight: "90px" }}>収益</span></At>
    <Cross at={17.3} x={800} y={780} s={180} />
    <Lines y={1100} size={52} lines={[[18.02, "その理由と、"], [18.88, <>最速で<R>月七桁</R>を超える方法、</>], [22.18, <>今日は<R>全部</R>話していくぞ!</>]]} />
  </>
);
const CARDS = [[">_", "ターミナル"], ["</>", "エディタ"], ["www", "ウェブ"], ["✳", "デスクトップアプリ"]];
const P4: React.FC = () => {
  const f = useCurrentFrame();
  const pick = f >= F(28.86);
  const typed = "Claude Code".slice(0, Math.max(0, Math.min(11, Math.round(interpolate(f, [F(29.9), F(31.0)], [0, 11], clamp)))));
  return (
    <>
      <StepHead n={1} at={23.92} title="デスクトップアプリを入れる" />
      <Lines y={540} size={48} lines={[[26.12, <>クロードコードの使い方は<R>4つ</R></>]]} />
      {CARDS.map(([ic, t], i) => {
        const on = i === 3;
        return (
          <At key={t} at={27.3 + i * 0.1} x={75 + (i % 2) * 485} y={680 + Math.floor(i / 2) * 230} mode="pop">
            <div style={{ width: 455, height: 200, background: "#fff", borderRadius: 18, boxShadow: "0 8px 18px rgba(60,40,20,0.1)", display: "flex", alignItems: "center", justifyContent: "center", gap: 18, opacity: pick && !on ? 0.35 : 1, outline: pick && on ? `8px solid ${RED}` : undefined, outlineOffset: 10, transform: pick && on ? `scale(${interpolate(f - F(28.86), [0, 4, 8], [1, 1.06, 1], clamp)})` : undefined }}>
              <span style={{ ...B, fontSize: 34, color: on ? RED : "#888" }}>{ic}</span><span style={{ ...B, fontSize: 34, color: INK }}>{t}</span>
            </div>
          </At>
        );
      })}
      <At at={29.72} x={75} y={1185} mode="ghost">
        <div style={{ width: 760, height: 84, borderRadius: 999, background: "#fff", border: "3px solid #D8D2C4", display: "flex", alignItems: "center", gap: 18, padding: "0 28px", boxSizing: "border-box", ...B, fontSize: 38, color: INK }}>🔍 {typed}{f % 16 < 8 && typed.length < 11 ? "|" : ""}</div>
      </At>
      <At at={31.6} x={110} y={1290} mode="pop"><span style={{ display: "inline-block", background: RED, color: "#fff", borderRadius: 999, padding: "8px 40px", ...B, fontSize: 32 }}>デスクトップ版をダウンロード ▶</span></At>
    </>
  );
};
const P5: React.FC = () => (
  <>
    <StepHead n={2} at={33.56} title="作業場を作る" />
    <Lines y={540} size={46} lines={[[35.16, <><R>スキル</R>や<R>プラグイン</R>を入れれば賢くなる?</>]]} />
    <At at={35.4} x={430} y={700} mode="pop"><AiIcon s={210} /></At>
    <At at={35.92} x={220} y={760} mode="pop"><Pill size={36}>スキル</Pill></At>
    <At at={36.26} x={660} y={760} mode="pop"><Pill size={36}>プラグイン</Pill></At>
    <At at={38.4} x={400} y={930} mode="pop"><span style={{ display: "inline-block", border: `6px solid ${RED}`, borderRadius: 999, padding: "4px 36px", ...SER, fontSize: 52, color: RED, background: "#FFF3EE", transform: "rotate(-8deg)" }}>勘違い</span></At>
    <Lines y={1080} size={50} lines={[[39.4, <>力を引き出すカギは<R>作業場の整え方</R>!</>]]} />
    <At at={42.9} x={360} y={1190} mode="pop"><Folder w={360} label="AI作業部屋" /></At>
  </>
);
const P6: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <Lines y={400} size={56} lines={[[45.06, <>机の上が<R>ぐちゃぐちゃ</R>だと、</>], [48.16, "仕事にならんよな?"]]} />
      {Array.from({ length: 6 }).map((_, i) => <At key={i} at={45.62 + i * 0.06} x={60 + i * 95} y={700 + (i % 2) * 30} mode="pop"><div style={{ width: 140, height: 140, background: "#fff", border: "2px solid #CFC8B8", transform: `rotate(${[-14, 9, -6, 12, -10, 7][i]}deg)`, boxShadow: "0 4px 8px rgba(0,0,0,0.08)" }} /></At>)}
      <At at={47.0} x={600} y={620} mode="pop"><span style={{ ...SER, fontSize: 70, color: RED }}>?</span></At>
      <At at={47.3} x={650} y={720} mode="pop"><span style={{ ...SER, fontSize: 56, color: RED }}>?</span></At>
      <At at={45.06} x={60} y={960} mode="fade"><div style={{ width: 600, height: 22, background: "#B98B57", borderRadius: 6 }}><div style={{ position: "absolute", left: 30, top: 22, width: 14, height: 60, background: "#B98B57" }} /><div style={{ position: "absolute", right: 30, top: 22, width: 14, height: 60, background: "#B98B57" }} /></div></At>
      <At at={49.3} x={770} y={740} mode="pop"><AiIcon s={180} /></At>
      <At at={49.5} x={810} y={630} mode="pop"><span style={{ display: "inline-block", width: 90, height: 80, borderRadius: 14, ...K, fontSize: 48, textAlign: "center", lineHeight: "76px", background: f >= F(52.2) ? RED : "#fff", color: f >= F(52.2) ? "#fff" : INK, border: `3px solid ${f >= F(52.2) ? RED : INK}` }}>{f >= F(52.2) ? "!" : "?"}</span></At>
      <At at={49.86} x={700} y={970}><span style={{ ...K, fontSize: 48, color: INK }}>クロードも<R>同じ</R></span></At>
      <Lines y={1060} size={48} lines={[[50.36, <>必要な情報を<R>決まった場所</R>に入れて、</>], [52.18, "どこに何があるか分かるようにする!"]]} />
      {["AI作業部屋", "ナレッジ", "お客さんの声", "商品"].map((t, i) => <At key={t} at={52.6 + i * 0.12} x={60 + i * 245} y={1210} mode="pop"><Folder w={215} label={t} /></At>)}
    </>
  );
};
const P7: React.FC = () => (
  <>
    <StepHead n={3} at={56.84} title="声を集める" />
    <At at={58.64} x={330} y={520} mode="ghost"><span style={{ display: "inline-block", background: RED, color: "#fff", borderRadius: 999, padding: "8px 46px", ...K, fontSize: 42 }}>ここが一番大事!</span></At>
    <Lines y={640} size={54} lines={[[59.68, "AIを使いこなすだけでは、"], [61.96, <><R>収益</R>につながらん。</>]]} />
    <At at={63.18} x={80} y={880} mode="pop"><Person s={330} /></At>
    <At at={64.56} x={430} y={990} mode="fade"><span style={{ ...B, fontSize: 32, color: RED }}>解決</span></At>
    <Arrow at={64.56} x1={400} y1={1050} x2={640} y2={1050} />
    <Ripple x={830} y={1060} at={65.6} until={66.5} r={180} />
    <At at={65.6} x={700} y={990} mode="pop"><span style={{ display: "inline-block", width: 260, height: 130, borderRadius: 999, background: RED, color: "#fff", ...SER, fontSize: 60, textAlign: "center", lineHeight: "130px", boxShadow: "0 10px 20px rgba(232,85,59,0.3)" }}>収益</span></At>
  </>
);
const P8: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <Lines y={400} size={56} lines={[[67.4, <><R>誰</R>が<R>どんな悩み</R>を抱えとるのか、</>], [69.18, "声を集める。"]]} />
      <At at={70.14} x={140} y={620} mode="pop"><Phone w={190} /></At>
      <At at={70.5} x={110} y={1020} mode="fade"><span style={{ ...B, fontSize: 30, color: INK }}>インスタで投稿</span></At>
      {["いいね", "参考になる!", "私も悩んでる"].map((t, i) => <At key={t} at={71.3 + i * 0.2} x={375} y={660 + i * 95} mode="pop"><Pill size={26}>{t}</Pill></At>)}
      <At at={72.0} x={660} y={700} mode="pop">
        <div style={{ position: "relative", width: 330, height: 190 }}>
          {[0, 1].map((k) => <div key={k} style={{ position: "absolute", left: 30 + k * 150, top: 0 }}><div style={{ width: 90, height: 90, borderRadius: "50%", background: k ? RED : INK, margin: "0 auto" }} /><div style={{ width: 130, height: 70, borderRadius: "60px 60px 0 0", background: k ? RED : INK, marginTop: 6, marginLeft: -20 }} /></div>)}
          <div style={{ position: "absolute", left: 0, top: 168, width: 330, height: 14, borderRadius: 6, background: "#B98B57" }} />
        </div>
      </At>
      <At at={72.44} x={700} y={910} mode="fade"><span style={{ ...B, fontSize: 30, color: INK }}>無料で相談</span></At>
      <At at={73.48} x={330} y={1110} mode="pop"><Folder w={340} label="お客さんの声" /></At>
      {f >= F(74.0) ? <div style={{ position: "absolute", left: 495, top: interpolate(f, [F(74.0), F(74.5)], [1040, 1150], out), width: 16, height: 16, borderRadius: "50%", background: RED, opacity: interpolate(f, [F(74.4), F(74.7)], [1, 0], clamp) }} /> : null}
      <At at={75.66} x={700} y={1150} mode="pop"><span style={{ ...K, fontSize: 64, color: RED }}>↻</span> <Pill bg={RED} color="#fff" border={RED} size={28}>くり返し</Pill></At>
    </>
  );
};
const P9: React.FC = () => (
  <>
    <StepHead n={4} at={77.06} title="商品を作る" />
    <Lines y={530} size={52} lines={[[80.12, "ここでやるのは、"], [81.04, <><R>誰</R>の<R>どんな悩み</R>を解決するのか</>], [82.9, "決めるだけ。"]]} />
    <At at={80.6} x={130} y={830} mode="pop">
      <div style={{ width: 820, height: 420, background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 12px 26px rgba(60,40,20,0.14)" }}>
        <div style={{ height: 50, background: "#FBE3DC" }} />
        {["誰の?", "どんな悩み?"].map((t, i) => <div key={t} style={{ display: "flex", alignItems: "center", gap: 30, margin: "54px 50px 0", ...K, fontSize: 40, color: INK }}>{t}<div style={{ flex: 1, height: 3, background: "#CFC8B8", marginTop: 30 }} /></div>)}
      </div>
    </At>
    <At at={83.0} x={830} y={930} mode="pop"><span style={{ ...K, fontSize: 64, color: RED }}>✓</span></At>
    <At at={83.12} x={830} y={1070} mode="pop"><span style={{ ...K, fontSize: 64, color: RED }}>✓</span></At>
  </>
);
const P10: React.FC = () => (
  <>
    <Lines y={400} size={54} lines={[[83.76, "集めた声をクロードに読ませれば、"]]} />
    <At at={84.12} x={60} y={570} mode="pop"><Folder w={270} label="お客さんの声" /></At>
    <Arrow at={84.42} x1={340} y1={660} x2={425} y2={720} color="#8A857A" />
    <At at={84.42} x={430} y={650} mode="pop"><AiIcon s={200} /></At>
    {["悩みA", "悩みB", "悩みC"].map((t, i) => <At key={t} at={85.96 + i * 0.12} x={400 + i * 92} y={900} mode="pop"><Pill size={22}>{t}</Pill></At>)}
    <At at={89.04} x={60} y={760} mode="pop"><Folder w={270} label="経験・実績" /></At>
    <Arrow at={89.3} x1={340} y1={840} x2={425} y2={800} color="#8A857A" />
    <Arrow at={90.1} x1={650} y1={700} x2={760} y2={620} />
    <At at={90.3} x={790} y={470} mode="pop"><Bag w={170} /></At>
    <At at={90.46} x={780} y={700} mode="fade"><span style={{ ...B, fontSize: 30, color: RED }}>売れる商品</span></At>
    <Arrow at={91.1} x1={650} y1={800} x2={760} y2={880} />
    <At at={91.24} x={830} y={790} mode="pop"><Phone w={95} /></At>
    <At at={91.5} x={760} y={1000} mode="fade"><span style={{ ...B, fontSize: 30, color: RED }}>発信する内容</span></At>
    <Lines y={1110} size={46} lines={[[94.0, <><R>ステップ4まで</R>をやらんと、</>], [95.58, "AIを極めても、フォロワーを増やしても"], [99.08, <><R>収益</R>にはつながらん!</>]]} />
  </>
);
const P11: React.FC = () => {
  const f = useCurrentFrame();
  const paid = f >= F(113.5);
  return (
    <>
      <StepHead n={5} at={100.78} title="商品を提供する" />
      <Lines y={530} size={50} lines={[[102.7, <>まずは<R>無料</R>でもええ。</>], [106.28, <>求められとるか、<R>無料相談</R>で確かめる。</>]]} />
      <At at={103.0} x={120} y={760} mode="pop"><Bag w={220} /></At>
      <At at={103.02} x={240} y={760} mode="pop"><span style={{ display: "inline-block", background: RED, color: "#fff", borderRadius: 12, padding: "4px 18px", ...B, fontSize: 28, transform: `rotate(-14deg) scale(${paid ? interpolate(f - F(113.5), [0, 3, 7], [0.6, 1.2, 1], clamp) : 1})` }}>{paid ? "有料サポート" : "無料"}</span></At>
      <Arrow at={106.5} x1={390} y1={950} x2={590} y2={950} color="#8A857A" />
      <At at={106.7} x={640} y={780} mode="fade"><Person s={330} happy /></At>
      <At at={109.82} x={500} y={700} mode="pop"><span style={{ display: "inline-block", background: "#fff", border: `3px solid ${INK}`, borderRadius: 16, padding: "6px 22px", ...B, fontSize: 28 }}>長くサポートしてほしい!</span></At>
      <Lines y={1180} size={52} lines={[[112.52, <>そこではじめて、<R>有料</R>でサポート!</>]]} />
    </>
  );
};
// 実績の山（実在の人物・画像は使わず、同じ形の札で）
const WINS = ["月280万円", "月94万円", "月210万円", "月180万円", "月80万円", "月640万円", "月470万円", "月100万円", "月49万円", "月30万円", "月308,000円", "月120万円", "月65万円", "月450万円", "月150万円", "月90万円", "月320万円", "月55万円", "月240万円", "月110万円", "月75万円", "月500万円", "月130万円", "月60万円", "月200万円", "月42万円", "月380万円", "月88万円", "月160万円", "月270万円", "月34万円", "月190万円", "月420万円", "月58万円", "月700万円", "月140万円"];
const P12: React.FC = () => {
  const f = useCurrentFrame();
  const n = Math.round(interpolate(f, [F(119.4), F(121.8)], [0, WINS.length], clamp));
  return (
    <>
      <Lines y={400} size={54} lines={[[118.76, <>このロードマップで<R>月七桁</R>を超えた</>], [120.82, "受講生さんが、こんなにもおる!"]]} />
      {WINS.slice(0, n).map((w, i) => {
        const at = F(119.4) + (i * (F(121.8) - F(119.4))) / WINS.length;
        const col = i % 4, row = Math.floor(i / 4) % 6;
        return (
          <div key={i} style={{ position: "absolute", left: -30 + col * 290 + (row % 2) * 60, top: 580 + row * 105 + (i % 3) * 8, transform: `rotate(${((i * 37) % 9) - 4}deg) scale(${pop(f, at)})` }}>
            <div style={{ width: 300, height: 110, background: "#1D1A16", border: "5px solid #E6B83A", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", ...SER, fontSize: 44, color: "#FFD45A", boxShadow: "0 6px 12px rgba(0,0,0,0.3)" }}>{w}</div>
          </div>
        );
      })}
    </>
  );
};
const P13: React.FC = () => {
  const f = useCurrentFrame();
  const tap = f >= F(126.0) ? interpolate(f - F(126.0), [0, 4, 8], [1, 0.85, 1], clamp) : 1;
  return (
    <>
      <Lines y={400} size={54} lines={[[123.06, <><R>コンテンツ販売</R>のやり方は、</>], [124.52, <><R>プロフィールのURL</R>から</>], [125.68, <>参加できる<R>勉強会</R>で解説!</>]]} />
      <At at={123.4} x={190} y={650} mode="pop">
        <div style={{ width: 700, background: "#fff", borderRadius: 26, boxShadow: "0 12px 28px rgba(60,40,20,0.14)", padding: "26px 30px", boxSizing: "border-box" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", ...K, fontSize: 30, color: INK }}><span>‹</span><span>taichi_moneylife</span><span>⋯</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: 26, marginTop: 22 }}>
            <div style={{ width: 130, height: 130, borderRadius: "50%", background: "#FCE07A", overflow: "hidden" }}><GenSlot name="taichi_face_smile" size={130} /></div>
            <div style={{ ...B, fontSize: 24, color: INK, lineHeight: 1.5 }}>たいち｜積立保険を売らない保険屋さん<br /><span style={{ color: GRAY }}>投稿・フォロワー・フォロー中</span></div>
          </div>
          <div style={{ ...B, fontSize: 22, color: "#555", marginTop: 18, lineHeight: 1.6 }}>保険とお金の「損しない」を発信<br />無料相談・勉強会の案内はこちら👇</div>
          <div style={{ position: "relative", marginTop: 10, ...B, fontSize: 24, color: "#3B5BDB" }}>🔗 lin.ee/xxxxxxx
            {f >= F(125.04) ? <div style={{ position: "absolute", left: -10, top: -6, width: 330, height: 46, border: `4px solid ${RED}`, borderRadius: 8, transform: `scale(${pop(f, F(125.04))})` }} /> : null}
          </div>
        </div>
      </At>
      {f >= F(125.8) ? <div style={{ position: "absolute", left: 470, top: interpolate(f, [F(125.8), F(126.0)], [1280, 1170], out), fontSize: 130, transform: `scale(${tap})` }}>👆</div> : null}
      <At at={126.4} x={150} y={1300} mode="pop"><span style={{ display: "inline-block", background: RED, color: "#fff", borderRadius: 999, padding: "12px 56px", ...K, fontSize: 40 }}>勉強会に参加する ▶</span></At>
    </>
  );
};

// ════════ 地図の並び（元動画の全体マップと同じ蛇行） ════════
const PANELS: Panel[] = [
  { id: "p1", col: 0, row: 0 }, { id: "p2", col: 1, row: 0 }, { id: "p3", col: 2, row: 0 }, { id: "p4", col: 3, row: 0 },
  { id: "p5", col: 3, row: 1 }, { id: "p6", col: 2, row: 1 }, { id: "p7", col: 1, row: 1 }, { id: "p8", col: 0, row: 1 },
  { id: "p9", col: 0, row: 2 }, { id: "p10", col: 1, row: 2 }, { id: "p11", col: 2, row: 2 }, { id: "p12", col: 3, row: 2 }, { id: "p13", col: 3, row: 3 },
];
const MAPIDS = ["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8", "p9", "p10", "p11"];
const STOPS: Stop[] = [
  { id: "p1", trans: 0 }, { id: "p2", trans: 8.8 }, { id: "p3", trans: 13.25 }, { id: "p4", trans: 23.55 }, { id: "p5", trans: 33.0 },
  { id: "p6", trans: 43.9 }, { id: "p7", trans: 56.45 }, { id: "p8", trans: 66.35 }, { id: "p9", trans: 76.65 }, { id: "p10", trans: 83.25 },
  { id: "p11", trans: 100.35 }, { id: "__map", trans: 115.05, scale: 0.2, ids: MAPIDS }, { id: "p12", trans: 118.0 }, { id: "p13", trans: 122.55 },
];
const LINKS: [string, string][] = PANELS.slice(1).map((p, i) => [PANELS[i].id, p.id]);
const BODY: Record<string, React.FC> = { p1: P1, p2: P2, p3: P3, p4: P4, p5: P5, p6: P6, p7: P7, p8: P8, p9: P9, p10: P10, p11: P11, p12: P12, p13: P13 };

// 全体マップのとき、各ステップのページに赤い枠（地図の座標→画面）
const MapFrames: React.FC = () => {
  const f = useCurrentFrame();
  if (f < F(116.2) || f >= F(118.2)) return null;
  const ps = PANELS.filter((p) => MAPIDS.includes(p.id));
  const xs = ps.map((p) => panelXY(p)[0]), ys = ps.map((p) => panelXY(p)[1]);
  const cx = (Math.min(...xs) + Math.max(...xs) + PW) / 2, cy = (Math.min(...ys) + Math.max(...ys) + PH) / 2, s = 0.2;
  return (
    <>
      {["p4", "p5", "p7", "p9", "p11"].map((id, i) => {
        const p = PANELS.find((q) => q.id === id)!; const [x, y] = panelXY(p);
        const at = F(116.4) + i * 7;
        if (f < at) return null;
        return <div key={id} style={{ position: "absolute", left: 540 + (x - cx) * s - 6, top: 960 + (y - cy) * s - 6, width: PW * s + 12, height: PH * s + 12, border: `6px solid ${RED}`, borderRadius: 14, background: "rgba(232,85,59,0.08)", transform: `scale(${pop(f, at)})` }} />;
      })}
    </>
  );
};

// 右下のキャラ（太一）：場面ごとにポーズを差し替え、差し替え時に少し跳ねる
const POSES: [number, string][] = [
  [0, "taichi_hand_cheek"], [9.0, "taichi_happy_big"], [13.3, "taichi_worry"], [18.02, "taichi_guts"], [23.6, "taichi_point_up"], [28.86, "taichi_think_chin"],
  [33.0, "taichi_notice"], [38.4, "taichi_wave_no"], [39.4, "taichi_idea"], [43.9, "taichi_sweat_smile"], [50.36, "taichi_point_upright"],
  [56.5, "taichi_stop_hand"], [63.18, "taichi_point_up"], [66.4, "taichi_think_arms"], [76.7, "taichi_explain_both"], [83.3, "taichi_lean_in"],
  [94.0, "taichi_angry_light"], [100.4, "taichi_think_chin"], [108.34, "taichi_think_arms"], [115.05, "taichi_happy_big"], [122.55, "taichi_point_down"],
];
const Chara: React.FC = () => {
  const f = useCurrentFrame();
  let name = POSES[0][1], at = 0;
  POSES.forEach(([t, n]) => { if (f >= F(t)) { name = n; at = t; } });
  const k = interpolate(f - F(at), [0, 3, 7], [0.82, 1.06, 1], clamp);
  return <div style={{ position: "absolute", left: 600, top: 1330, width: 500, height: 500, transform: `scale(${k})`, transformOrigin: "50% 100%" }}><GenSlot name={name} size={500} /></div>;
};

export const MARKE2_FRAMES = F(131.4);
export const Marke2Repro: React.FC = () => {
  const f = useCurrentFrame();
  const stepIn = interpolate(f, [F(23.6), F(23.6) + 8], [0, 1], out) * (1 - interpolate(f, [F(122.55), F(122.55) + 8], [0, 1], clamp));
  return (
    <AbsoluteFill style={{ backgroundColor: PAPER, fontFamily: FONT }}>
      <Audio src={staticFile("marke2-ref-audio.wav")} />
      <Board panels={PANELS} stops={STOPS} links={LINKS} paper={{ background: PAPER, backgroundImage: "linear-gradient(rgba(120,110,80,0.07) 2px, transparent 2px), linear-gradient(90deg, rgba(120,110,80,0.07) 2px, transparent 2px)", backgroundSize: "120px 120px" }}>
        {(id) => { const C = BODY[id]; return <AbsoluteFill><C /></AbsoluteFill>; }}
      </Board>
      <MapFrames />
      {/* 全体マップの上の見出し */}
      {f >= F(115.3) && f < F(118.1) ? (
        <div style={{ position: "absolute", left: 0, top: 300, width: 1080, padding: "30px 60px", background: "rgba(237,232,221,0.92)", boxSizing: "border-box" }}>
          <Lines x={0} y={0} size={58} lines={[[115.44, "ここまでちゃんとやれば、"], [116.68, <><R>月七桁</R>も目指せる!</>]]} />
          <div style={{ height: 170 }} />
        </div>
      ) : null}
      {stepIn > 0 ? <div style={{ position: "absolute", left: 0, top: 0, opacity: stepIn, transform: `translateY(${(1 - stepIn) * 60}px)` }}><Stepper labels={["アプリ", "作業場", "声", "商品", "提供"]} steps={[23.92, 33.56, 56.84, 77.06, 100.78]} x={40} y={1370} color={RED} /></div> : null}
      {f >= F(94.0) && f < F(95.4) ? <div style={{ position: "absolute", left: 60, top: 1390, width: 480, height: 90, borderRadius: 45, boxShadow: `0 0 0 ${interpolate((f - F(94)) % 15, [0, 15], [0, 22])}px rgba(232,85,59,${interpolate((f - F(94)) % 15, [0, 15], [0.5, 0])})` }} /> : null}
      <Note at={115.05} until={122.5} y={1560} />
      <Chara />
    </AbsoluteFill>
  );
};
