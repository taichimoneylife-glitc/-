import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { A2 } from "./components/kit2";
import { FONT } from "./components/font";
import { K } from "./components/zukaiKit";
import { SfxTrack } from "./components/sfx";
import { Board, type Panel, type Stop } from "./components/board";

// ════════════════════════════════════════════════════════════════════
//  比較動画の見本 v2（参考⑦の「密度」と「カード」を黄色ノートで）
//  仮テーマ：毎月3万円を10年　太一＝NISA（年5%と仮定） vs 助手＝貯金
//  数字（月複利で計算）：元本360万／年3%≈419万／年5%≈466万／年7%≈519万
//  型：1〜2秒ごとに画面のどこかが変わる／カード＝アイコン＋小見出し＋大きな数字／役の色は固定
// ════════════════════════════════════════════════════════════════════
const F = (t: number) => Math.round(t * 30);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const OUT = Easing.bezier(0.16, 1, 0.3, 1);
const INK = A2.ink, SUB = "#8C8471";
const CA = "#2F7BD9", CB = "#E5679A", CN = "#7B5CF0", RED = "#E8553B", GOLD = "#E3A51C", GREEN = "#2E9E6B", PRIN = "#A9A08A";
const man = (v: number) => Math.round(v).toLocaleString("ja-JP");
const fv = (rate: number, months: number) => { const i = rate / 12; return i === 0 ? 3 * months : (3 * ((1 + i) ** months - 1)) / i; };

const ease = (f: number, at: number, dur = 0.5) => interpolate(f - F(at), [0, F(dur)], [0, 1], { ...clamp, easing: OUT });
const rise = (f: number, at: number): React.CSSProperties => { const d = f - F(at); return { opacity: interpolate(d, [0, 6], [0, 1], clamp), transform: `translateY(${interpolate(d, [0, 10], [30, 0], { ...clamp, easing: OUT })}px) scale(${interpolate(d, [0, 10], [0.94, 1], { ...clamp, easing: OUT })})` }; };
const pop = (f: number, at: number) => interpolate(f - F(at), [0, 4, 8], [0.3, 1.1, 1], clamp);
const count = (f: number, at: number, to: number, dur = 0.5, from = 0) => from + (to - from) * ease(f, at, dur);
const until = (f: number, t: number) => interpolate(f, [F(t) - 6, F(t)], [1, 0], clamp);
const shadow = "0 16px 34px rgba(90,70,20,0.13), 0 3px 0 rgba(90,70,20,0.06)";

// ── 部品 ─────────────────────────────────────────
const Gen: React.FC<{ n: string; h: number }> = ({ n, h }) => <Img src={staticFile(`gen/${n}.png`)} style={{ height: h, width: "auto", display: "block" }} />;

const Head: React.FC<{ at: number; end?: number; pill: string; title: React.ReactNode; c: string }> = ({ at, end = 999, pill, title, c }) => {
  const f = useCurrentFrame();
  if (f < F(at) || f > F(end)) return null;
  const o = Math.min(interpolate(f - F(at), [0, 8], [0, 1], clamp), until(f, end));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 190, textAlign: "center", opacity: o, filter: o < 1 ? `blur(${(1 - o) * 8}px)` : undefined }}>
      <span style={{ display: "inline-block", background: `${c}1C`, border: `2.5px solid ${c}`, color: c, borderRadius: 999, padding: "3px 20px", ...K, fontSize: 24, letterSpacing: 1 }}>{pill}</span>
      <div style={{ ...K, fontSize: 64, color: INK, marginTop: 14, letterSpacing: 1 }}>{title}</div>
    </div>
  );
};

const Dot: React.FC<{ c: string; g: string; s?: number }> = ({ c, g, s = 62 }) => (
  <div style={{ width: s, height: s, borderRadius: "50%", background: `${c}1E`, border: `2.5px solid ${c}55`, color: c, ...K, fontSize: s * 0.46, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>{g}</div>
);

// カード：アイコン＋小見出し＋大きな数字
const Card: React.FC<{ at: number; x: number; y: number; w: number; h?: number; c: string; g?: string; label: string; children: React.ReactNode; big?: number; end?: number; hot?: boolean }> = ({ at, x, y, w, h = 136, c, g, label, children, big = 54, end = 999, hot }) => {
  const f = useCurrentFrame();
  if (f < F(at) || f > F(end)) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, boxSizing: "border-box", background: hot ? `linear-gradient(180deg, #fff, ${c}14)` : "#fff", borderRadius: 26, border: `3px solid ${hot ? c : `${c}40`}`, boxShadow: hot ? `${shadow}, 0 0 0 8px ${c}18` : shadow, display: "flex", alignItems: "center", gap: 18, padding: "0 24px", ...rise(f, at), opacity: (rise(f, at).opacity as number) * until(f, end) }}>
      {g ? <Dot c={c} g={g} /> : null}
      <div style={{ minWidth: 0 }}>
        <div style={{ ...K, fontSize: 22, color: SUB, letterSpacing: 1, whiteSpace: "nowrap" }}>{label}</div>
        <div style={{ ...K, fontSize: big, color: c, lineHeight: 1.08, whiteSpace: "nowrap" }}>{children}</div>
      </div>
    </div>
  );
};

const Chip: React.FC<{ at: number; c: string; children: React.ReactNode; style?: React.CSSProperties; solid?: boolean; fs?: number }> = ({ at, c, children, style, solid, fs = 30 }) => {
  const f = useCurrentFrame();
  if (f < F(at)) return null;
  return <div style={{ position: "absolute", transform: `scale(${pop(f, at)})`, ...style }}><span style={{ display: "inline-block", whiteSpace: "nowrap", background: solid ? c : "#fff", color: solid ? "#fff" : c, border: `3px solid ${c}`, borderRadius: 999, padding: "6px 22px", ...K, fontSize: fs, boxShadow: shadow }}>{children}</span></div>;
};

const Face: React.FC<{ who: "A" | "B"; size: number; style?: React.CSSProperties }> = ({ who, size, style }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", border: `${Math.max(3, size / 22)}px solid ${who === "A" ? CA : CB}`, background: "#fff", position: "relative", flex: "none", boxShadow: shadow, ...style }}>
    {who === "A"
      ? <Img src={staticFile("gen/taichi_face_smile.png")} style={{ position: "absolute", width: "112%", left: "-6%", top: "2%" }} />
      : <Img src={staticFile("gen/girl_front_smile.png")} style={{ position: "absolute", width: "128%", left: "-14%", top: "-30%" }} />}
  </div>
);

// 全身キャラ：ポンと出て、ゆっくり揺れる。swap で途中からポーズを変える
const Chara: React.FC<{ n: string; at: number; h: number; x: number; y: number; end?: number; swap?: [number, string][] }> = ({ n, at, h, x, y, end = 999, swap = [] }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  if (f < F(at) || f > F(end)) return null;
  let name = n, last = at;
  swap.forEach(([t, p]) => { if (f >= F(t)) { name = p; last = t; } });
  const s = spring({ frame: f - F(at), fps, config: { damping: 11, stiffness: 170, mass: 0.7 } });
  const hop = last !== at ? interpolate(f - F(last), [0, 4, 9], [0, -26, 0], clamp) : 0;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translateX(-50%) translateY(${(1 - s) * 60 + hop + Math.sin(f / 13) * 4}px) scale(${0.7 + 0.3 * s})`, transformOrigin: "50% 100%", opacity: Math.min(1, s * 2) * until(f, end) }}>
      <div style={{ position: "absolute", left: "10%", right: "10%", bottom: -10, height: 26, borderRadius: "50%", background: "rgba(90,70,20,0.14)" }} />
      <Gen n={name} h={h} />
    </div>
  );
};

const Stamp: React.FC<{ at: number; text: string; c?: string; style?: React.CSSProperties; fs?: number; end?: number }> = ({ at, text, c = RED, style, fs = 54, end = 999 }) => {
  const f = useCurrentFrame(); const d = f - F(at);
  if (d < 0 || f > F(end)) return null;
  const k = interpolate(d, [0, 4, 7], [2.2, 0.92, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const sh = d >= 4 && d < 12 ? Math.sin(d * 2.6) * (12 - d) * 1.2 : 0;
  return <div style={{ position: "absolute", opacity: interpolate(d, [0, 2], [0, 1], clamp), transform: `translateX(${sh}px) rotate(-7deg) scale(${k})`, ...style }}><span style={{ display: "inline-block", border: `7px solid ${c}`, color: c, background: "rgba(255,255,255,0.94)", borderRadius: 16, padding: "4px 28px", ...K, fontSize: fs, whiteSpace: "nowrap" }}>{text}</span></div>;
};

// 章の扉（番号＋名前＋キャラが手を振る）→ ぼかして消える
const Door: React.FC<{ at: number; end: number; no: string; who: "A" | "B"; name: string; pose: string; h: number }> = ({ at, end, no, who, name, pose, h }) => {
  const f = useCurrentFrame();
  if (f > F(end)) return null;
  const o = until(f, end); const c = who === "A" ? CA : CB;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o, filter: o < 1 ? `blur(${(1 - o) * 10}px)` : undefined }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 380, textAlign: "center", ...rise(f, at) }}>
        <div style={{ display: "inline-flex", width: 120, height: 120, borderRadius: "50%", background: c, color: "#fff", ...K, fontSize: 70, alignItems: "center", justifyContent: "center", boxShadow: `0 0 0 12px ${c}26` }}>{no}</div>
        <div style={{ ...K, fontSize: 100, color: c, marginTop: 10, letterSpacing: 4 }}>{name}</div>
      </div>
      <Chara n={pose} at={at + 0.25} h={h} x={540} y={1180 - h} />
    </div>
  );
};

// しま模様の進みバー
const Stripe: React.FC<{ x: number; y: number; w: number; h: number; p: number; c: string; f: number }> = ({ x, y, w, h, p, c, f }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: h / 2, background: "#EFE8CF", overflow: "hidden", boxShadow: "inset 0 3px 6px rgba(90,70,20,0.12)" }}>
    <div style={{ width: `${p * 100}%`, height: "100%", borderRadius: h / 2, background: `repeating-linear-gradient(-45deg, ${c} 0 18px, ${c}CC 18px 36px)`, backgroundPosition: `${f * 2}px 0` }} />
  </div>
);

// ── 字幕：今の言葉に色の箱 ─────────────────────────────────────────
type Cap = { t: number; w: string[]; c: string; step?: number };
const Captions: React.FC<{ caps: Cap[]; end: number }> = ({ caps, end }) => {
  const f = useCurrentFrame(); const t = f / 30;
  let idx = -1; caps.forEach((c, i) => { if (t >= c.t) idx = i; });
  if (idx < 0 || t > end) return null;
  const c = caps[idx]; const step = c.step ?? 0.36;
  const nextT = idx + 1 < caps.length ? caps[idx + 1].t : end;
  const shown = Math.min(c.w.length, Math.floor((t - c.t) / step) + 1);
  return (
    <div style={{ position: "absolute", left: 150, right: 150, top: 1290, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "6px 4px", opacity: interpolate(t, [nextT - 0.1, nextT], [1, 0], clamp) }}>
      {c.w.slice(0, shown).map((w, i) => {
        const cur = i === shown - 1;
        const d = f - F(c.t + i * step);
        return <span key={i} style={{ ...K, fontSize: 46, lineHeight: 1.3, padding: "0 10px", borderRadius: 12, color: cur ? "#fff" : INK, background: cur ? c.c : "transparent", transform: `scale(${interpolate(d, [0, 3, 6], [0.8, 1.06, 1], clamp)})`, display: "inline-block" }}>{w}</span>;
      })}
    </div>
  );
};

// ════════ P1 つかみ→前提（参考⑦の冒頭：2枚のカード＋真ん中の丸が VS→＝→時計→電卓 と変わり、そのまま条件のカードに変身） ════════
const ROWS = [
  { at: 8.6, g: "人", la: "年齢", lb: "年齢", v: "30歳" },
  { at: 9.6, g: "¥", la: "手取り", lb: "手取り", v: "月30万円" },
  { at: 10.6, g: "↓", la: "毎月 NISAへ", lb: "毎月 貯金へ", v: "3万円" },
];
const MID: [number, string][] = [[0.6, "vs"], [1.6, "eq"], [5.0, "clock"], [6.2, "calc"]];
const MidIcon: React.FC<{ k: string }> = ({ k }) => {
  if (k === "vs") return <span style={{ ...K, fontSize: 44, color: "#fff" }}>VS</span>;
  if (k === "eq") return <span style={{ ...K, fontSize: 60, color: CN, lineHeight: 1 }}>＝</span>;
  if (k === "clock") return <svg width={60} height={60} viewBox="0 0 24 24"><circle cx={12} cy={12} r={9} fill="none" stroke="#fff" strokeWidth={2.4} /><path d="M12 7v5l3.5 2.2" fill="none" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" /></svg>;
  return <svg width={56} height={56} viewBox="0 0 24 24"><rect x={5} y={2.5} width={14} height={19} rx={2.5} fill="none" stroke="#fff" strokeWidth={2.2} /><rect x={8} y={5.5} width={8} height={3.5} rx={0.8} fill="#fff" />{[0, 1, 2].map((r) => [0, 1, 2].map((c) => <circle key={`${r}${c}`} cx={8.6 + c * 3.4} cy={12.4 + r * 3.2} r={1.1} fill="#fff" />))}</svg>;
};
const Bill: React.FC<{ at: number; x: number; y: number }> = ({ at, x, y }) => {
  const f = useCurrentFrame();
  if (f < F(at)) return null;
  return <div style={{ position: "absolute", left: x - 70, top: y, width: 140, height: 66, borderRadius: 10, background: "linear-gradient(180deg,#7ED3A2,#4DB37C)", border: "3px solid #2E8F5B", boxShadow: shadow, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${pop(f, at)}) rotate(${-6 + Math.sin(f / 9) * 3}deg)`, opacity: until(f, 7.8) }}>
    <div style={{ width: 44, height: 44, borderRadius: "50%", border: "3px solid #fff", color: "#fff", ...K, fontSize: 26, display: "flex", alignItems: "center", justifyContent: "center" }}>¥</div>
  </div>;
};
const P1: React.FC = () => {
  const f = useCurrentFrame(); const t = f / 30;
  const k = ease(f, 7.6, 0.8); // カード→プロフィールへの変身
  let mi = -1; MID.forEach(([at], i) => { if (t >= at) mi = i; });
  const midOut = until(f, 7.7);
  const CW = 450, CT = 400, CH = 760;
  const cards = [{ w: "A" as const, x: 65, c: CA, tag: "NISAで積立", tagAt: 2.6, pose: "taichi_front_smile", swap: [[2.6, "taichi_thumbs_up"], [5.0, "taichi_question"], [6.2, "taichi_point_right"]] as [number, string][] },
    { w: "B" as const, x: 565, c: CB, tag: "貯金", tagAt: 3.8, pose: "girl_front_smile", swap: [[3.8, "girl_front_smile"]] as [number, string][] }];
  return (
    <>
      <Head at={0.9} end={5.0} pill="比較" title="同じ年収の2人" c={CN} />
      <Head at={5.0} end={7.6} pill="比較" title="10年後、得するのは？" c={CN} />
      <Head at={7.6} pill="前提" title="2人の条件" c={CN} />
      <Chip at={6.2} c={CN} style={{ left: 0, right: 0, top: 345, textAlign: "center", opacity: until(f, 7.6) }} fs={24}>実際に計算してみる</Chip>
      {cards.map((cd, i) => (
        <div key={cd.w} style={{ position: "absolute", left: cd.x, top: CT, width: CW, height: CH, borderRadius: 34, overflow: "hidden", background: `linear-gradient(180deg, #ffffff 0%, ${cd.c}14 100%)`, border: `3px solid ${cd.c}55`, boxShadow: `${shadow}, 0 0 0 8px ${cd.c}12`, ...rise(f, 0.2 + i * 0.12) }}>
          {/* 全身 → 小さくなって消える */}
          {k < 1 ? <div style={{ position: "absolute", inset: 0, opacity: 1 - k, transform: `translateY(${-k * 120}px) scale(${1 - 0.55 * k})`, transformOrigin: "50% 0%" }}>
            <Chara n={cd.pose} at={0.35 + i * 0.12} h={560} x={CW / 2} y={CH - 575} swap={cd.swap} />
          </div> : null}
          {/* 丸い顔アイコン（変身後） */}
          {k > 0 ? <div style={{ position: "absolute", left: CW / 2 - 85, top: 40, opacity: k, transform: `scale(${0.6 + 0.4 * k})` }}><Face who={cd.w} size={170} /></div> : null}
          {/* 役の札：上 → 顔の下へ移動 */}
          {t >= cd.tagAt ? <div style={{ position: "absolute", left: 0, right: 0, top: 26 + k * 200, textAlign: "center", transform: `scale(${pop(f, cd.tagAt)})` }}>
            <span style={{ display: "inline-block", background: cd.c, color: "#fff", borderRadius: 999, padding: "6px 24px", ...K, fontSize: 32, boxShadow: shadow }}>{cd.tag}</span>
          </div> : null}
          {/* 条件の行 */}
          {ROWS.map((r, j) => f >= F(r.at + i * 0.12) ? (
            <div key={j} style={{ position: "absolute", left: 34, right: 20, top: 330 + j * 130, display: "flex", alignItems: "center", gap: 16, ...rise(f, r.at + i * 0.12) }}>
              <Dot c={cd.c} g={r.g} s={58} />
              <div><div style={{ ...K, fontSize: 22, color: SUB }}>{cd.w === "A" ? r.la : r.lb}</div><div style={{ ...K, fontSize: 48, color: cd.c, lineHeight: 1.05 }}>{r.v}</div></div>
            </div>) : null)}
        </div>
      ))}
      <Bill at={1.6} x={290} y={505} /><Bill at={1.75} x={790} y={505} />
      {/* 真ん中の丸 */}
      {mi >= 0 && midOut > 0 ? (() => { const [at, kind] = MID[mi]; const light = kind === "eq"; return (
        <div style={{ position: "absolute", left: 540 - 62, top: 760, width: 124, height: 124, borderRadius: "50%", background: light ? "#fff" : CN, border: `5px solid ${light ? CN : "#fff"}`, boxShadow: `${shadow}, 0 0 0 10px ${CN}22`, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${pop(f, at)})`, opacity: midOut }}><MidIcon k={kind} /></div>); })() : null}
      {/* 行の間の＝ */}
      {ROWS.map((r, j) => f >= F(r.at + 0.4) ? <div key={j} style={{ position: "absolute", left: 540 - 28, top: CT + 330 + j * 130 + 18, width: 56, height: 56, borderRadius: "50%", background: CN, color: "#fff", ...K, fontSize: 36, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${pop(f, r.at + 0.4)})`, boxShadow: shadow }}>＝</div> : null)}
      <Chip at={11.6} c={CN} solid style={{ left: 0, right: 0, top: 1185, textAlign: "center" }} fs={30}>違うのは「置き場所」だけ</Chip>
    </>
  );
};

// ════════ P3 元本の計算（式が組み上がる） ════════
const P3: React.FC = () => {
  const f = useCurrentFrame();
  const parts: [number, string][] = [[13.4, "3万円"], [14.2, "12か月"], [15.0, "10年"]];
  return (
    <>
      <Head at={12.8} pill="前提" title="10年で入れるお金" c={CN} />
      {parts.map(([at, s], i) => (
        <React.Fragment key={i}>
          {i > 0 && f >= F(at - 0.15) ? <div style={{ position: "absolute", left: 0, right: 0, top: 432 + i * 120 - 56, textAlign: "center", ...K, fontSize: 40, color: SUB, opacity: ease(f, at - 0.15, 0.2) }}>×</div> : null}
          <Chip at={at} c={INK} style={{ left: 0, right: 0, top: 410 + i * 120, textAlign: "center" }} fs={40}>{s}</Chip>
        </React.Fragment>
      ))}
      <div style={{ position: "absolute", left: 300, right: 300, top: 760, height: 5, borderRadius: 3, background: INK, transform: `scaleX(${ease(f, 15.7, 0.4)})` }} />
      <Card at={16.0} x={240} y={800} w={600} h={170} c={CN} g="¥" label="2人とも 入れたお金" big={80} hot>{man(count(f, 16.0, 360, 0.6))}<span style={{ fontSize: 40 }}>万円</span></Card>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1010, display: "flex", justifyContent: "center", gap: 30 }}>
        {(["A", "B"] as const).map((w, i) => f >= F(17.0 + i * 0.2) ? <div key={w} style={{ transform: `scale(${pop(f, 17.0 + i * 0.2)})` }}><Face who={w} size={96} /></div> : null)}
      </div>
    </>
  );
};

// ════════ P4 助手＝貯金 ════════
const P4: React.FC = () => {
  const f = useCurrentFrame();
  const p = interpolate(f, [F(20.6), F(22.6)], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  return (
    <>
      <Door at={18.6} end={20.2} no="1" who="B" name="貯金" pose="girl_front_smile" h={520} />
      <Head at={20.2} pill="1・助手" title="貯金の10年" c={CB} />
      {f >= F(20.4) ? <>
        <div style={{ position: "absolute", left: 120, top: 390, ...K, fontSize: 24, color: SUB, opacity: ease(f, 20.4) }}>口座の残高</div>
        <Stripe x={120} y={430} w={840} h={64} p={p} c={CB} f={f} />
        <div style={{ position: "absolute", left: 120, top: 504, width: 840, display: "flex", justifyContent: "space-between", ...K, fontSize: 22, color: SUB }}>{["0年", "5年", "10年"].map((s) => <span key={s}>{s}</span>)}</div>
        <div style={{ position: "absolute", left: 120 + 840 * p - 70, top: 400 - 66, width: 140, textAlign: "center", ...K, fontSize: 30, color: CB }}>{man(360 * p)}万</div>
      </> : null}
      <Card at={21.4} x={100} y={600} w={400} c={CB} g="¥" label="入れたお金">360<span style={{ fontSize: 30 }}>万円</span></Card>
      <Card at={22.6} x={580} y={600} w={400} c={SUB} g="%" label="利息で増えた分">ほぼ<span style={{ fontSize: 60 }}>0</span></Card>
      <Card at={23.8} x={100} y={780} w={880} h={190} c={CB} label="10年後の貯金" big={96} hot>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 24 }}>{man(count(f, 23.8, 360, 0.6))}<span style={{ fontSize: 44 }}>万円</span><Face who="B" size={100} /></span>
      </Card>
      <Chip at={24.6} c={GREEN} style={{ left: 340, top: 1010 }}>元本は 1円も減らない</Chip>
    </>
  );
};

// ════════ P5 太一＝NISA（線が伸びる） ════════
const P5: React.FC = () => {
  const f = useCurrentFrame();
  const x0 = 200, x1 = 920, y0 = 930, y1 = 470, M = 500;
  const X = (m: number) => x0 + ((x1 - x0) * m) / 120; const Y = (v: number) => y0 - ((y0 - y1) * v) / M;
  const mP = 120 * interpolate(f, [F(28.0), F(28.8)], [0, 1], clamp);
  const mA = 120 * interpolate(f, [F(29.2), F(32.2)], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const path = (m: number, r: number) => { let d = ""; for (let k = 0; k <= m; k += 2) d += `${k ? "L" : "M"}${X(k)},${Y(fv(r, k))} `; return d; };
  const show = f >= F(27.4);
  return (
    <>
      <Door at={25.6} end={27.2} no="2" who="A" name="NISA" pose="taichi_wave_hi" h={520} />
      <Head at={27.2} pill="2・太一" title="NISAの10年" c={CA} />
      {show ? <div style={{ position: "absolute", left: 110, top: 400, width: 860, height: 620, background: "#fff", borderRadius: 30, boxShadow: shadow, ...rise(f, 27.4) }} /> : null}
      {show ? <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, opacity: ease(f, 27.6) }}>
        {[100, 200, 300, 400, 500].map((v) => <g key={v}><line x1={x0} x2={x1} y1={Y(v)} y2={Y(v)} stroke="#EFE8CF" strokeWidth={2} /><text x={x0 - 14} y={Y(v) + 8} textAnchor="end" fontSize={22} fill={SUB} fontFamily={FONT} fontWeight={700}>{v}万</text></g>)}
        <line x1={x0} x2={x1} y1={y0} y2={y0} stroke={INK} strokeWidth={4} />
        {[0, 5, 10].map((y) => <text key={y} x={X(y * 12)} y={y0 + 40} textAnchor="middle" fontSize={24} fill={SUB} fontFamily={FONT} fontWeight={700}>{y}年</text>)}
        {mP > 0 ? <path d={path(mP, 0)} fill="none" stroke={PRIN} strokeWidth={6} strokeDasharray="14 12" strokeLinecap="round" /> : null}
        {mA > 0 ? (() => { const ks: number[] = []; for (let k = 0; k <= mA; k += 2) ks.push(k); const pts = [...ks.map((k) => `${X(k)},${Y(fv(0.05, k))}`), ...ks.slice().reverse().map((k) => `${X(k)},${Y(fv(0, k))}`)]; return <polygon points={pts.join(" ")} fill={`${GOLD}38`} />; })() : null}
        {mA > 0 ? <path d={path(mA, 0.05)} fill="none" stroke={CA} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" /> : null}
      </svg> : null}
      {f >= F(28.8) ? <div style={{ position: "absolute", left: X(120) - 150, top: Y(360) + 14, ...K, fontSize: 24, color: PRIN, opacity: ease(f, 28.8) }}>入れたお金 360万</div> : null}
      {mA > 0 ? (() => { const m = Math.floor(mA / 2) * 2; return (
        <div style={{ position: "absolute", left: X(m), top: Y(fv(0.05, m)), transform: "translate(-50%, -50%)" }}>
          <Face who="A" size={70} />
          <div style={{ position: "absolute", left: "50%", bottom: 84, transform: "translateX(-50%)", whiteSpace: "nowrap", background: CA, color: "#fff", borderRadius: 999, padding: "4px 16px", ...K, fontSize: 30 }}>{man(fv(0.05, m))}万円</div>
        </div>); })() : null}
      <Chip at={30.6} c={GOLD} style={{ left: 260, top: 560 }} fs={28}>この差が「運用で増えた分」</Chip>
      <Chip at={32.6} c={SUB} style={{ left: 250, top: 1050 }} fs={26}>年5%で運用できた場合（仮定の試算）</Chip>
    </>
  );
};

// ════════ P6 中身（ドーナツが2色に割れる） ════════
const P6: React.FC = () => {
  const f = useCurrentFrame();
  const cx = 540, cy = 640, R = 190, L = 2 * Math.PI * R;
  const pa = (360 / 466) * ease(f, 34.6, 0.8), pb = (106 / 466) * ease(f, 36.0, 0.6);
  return (
    <>
      <Head at={34.0} pill="2・太一" title="466万円の中身" c={CA} />
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, opacity: ease(f, 34.2) }}>
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="#EFE8CF" strokeWidth={70} />
        <circle cx={cx} cy={cy} r={R} fill="none" stroke={PRIN} strokeWidth={70} strokeDasharray={`${L * pa} ${L}`} transform={`rotate(-90 ${cx} ${cy})`} />
        {pb > 0 ? <circle cx={cx} cy={cy} r={R} fill="none" stroke={GOLD} strokeWidth={78} strokeDasharray={`${L * pb} ${L}`} strokeDashoffset={-L * (360 / 466)} transform={`rotate(-90 ${cx} ${cy})`} /> : null}
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: cy - 62, textAlign: "center", opacity: ease(f, 34.4) }}>
        <div style={{ ...K, fontSize: 84, color: CA, lineHeight: 1 }}>466<span style={{ fontSize: 38 }}>万円</span></div>
        <div style={{ ...K, fontSize: 24, color: SUB, marginTop: 6 }}>10年後</div>
      </div>
      <Card at={35.0} x={100} y={890} w={400} c={PRIN} g="¥" label="入れたお金">360<span style={{ fontSize: 30 }}>万円</span></Card>
      <Card at={36.2} x={580} y={890} w={400} c={GOLD} g="↑" label="運用で増えた分" hot>+{man(count(f, 36.2, 106, 0.6))}<span style={{ fontSize: 30 }}>万円</span></Card>
      <Chip at={37.4} c={GREEN} solid style={{ left: 330, top: 1060 }} fs={30}>NISAなので 税金0円</Chip>
    </>
  );
};

// ════════ P7 結果（2枚のカード＋差） ════════
const P7: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <Head at={38.8} pill="10年後" title="2人の差" c={CN} />
      <Card at={39.4} x={100} y={400} w={640} h={170} c={CA} label="太一｜NISA" big={84} hot><span style={{ display: "inline-flex", alignItems: "center", gap: 20 }}><Face who="A" size={86} />{man(count(f, 39.4, 466, 0.6))}<span style={{ fontSize: 38 }}>万円</span></span></Card>
      <Card at={40.4} x={100} y={610} w={640} h={170} c={CB} label="助手｜貯金" big={84}><span style={{ display: "inline-flex", alignItems: "center", gap: 20 }}><Face who="B" size={86} />{man(count(f, 40.4, 360, 0.6))}<span style={{ fontSize: 38 }}>万円</span></span></Card>
      {f >= F(41.4) ? <div style={{ position: "absolute", left: 770, top: 485, width: 46, height: 210, borderRight: `6px solid ${RED}`, borderTop: `6px solid ${RED}`, borderBottom: `6px solid ${RED}`, borderRadius: "0 14px 14px 0", transformOrigin: "left center", transform: `scaleX(${ease(f, 41.4, 0.3)})` }} /> : null}
      {f >= F(41.8) ? <div style={{ position: "absolute", left: 836, top: 540, width: 150, textAlign: "center", ...K, color: RED, transform: `scale(${pop(f, 41.8)})` }}><div style={{ fontSize: 24 }}>差</div><div style={{ fontSize: 50, lineHeight: 1 }}>+{man(count(f, 41.8, 106, 0.5))}</div><div style={{ fontSize: 26 }}>万円</div></div> : null}
      <Chara n="taichi_guts" at={42.6} h={300} x={330} y={830} />
      <Chara n="girl_front_smile" at={42.9} h={300} x={760} y={830} />
      <Stamp at={43.2} text="同じ3万円なのに" style={{ left: 260, top: 1110 }} fs={44} />
    </>
  );
};

// ════════ P8 でも待って（シナリオの棒） ════════
const SCN = [
  { at: 46.6, label: "年3%", v: fv(0.03, 120) },
  { at: 47.4, label: "年5%", v: fv(0.05, 120) },
  { at: 48.2, label: "年7%", v: fv(0.07, 120) },
];
const P8: React.FC = () => {
  const f = useCurrentFrame();
  const x0 = 260, W = 640, MAXV = 560; const XV = (v: number) => x0 + (W * v) / MAXV;
  return (
    <>
      <Stamp at={44.6} text="ちょっと待って！" style={{ left: 250, top: 560 }} end={46.0} />
      <Chara n="taichi_stop_hand" at={44.9} h={360} x={540} y={720} end={46.0} />
      {f < F(46.0) ? null : <>
        <Head at={46.0} pill="注意" title="毎年5%とは限らない" c={RED} />
        {SCN.map((s, i) => { const y = 430 + i * 150; const p = ease(f, s.at, 0.7); return f >= F(s.at) ? (
          <React.Fragment key={i}>
            <div style={{ position: "absolute", left: 100, top: y + 16, width: 150, ...K, fontSize: 36, color: INK, ...rise(f, s.at) }}>{s.label}</div>
            <div style={{ position: "absolute", left: x0, top: y, height: 84, width: (XV(s.v) - x0) * p, borderRadius: 18, background: `linear-gradient(90deg, ${CA}AA, ${CA})`, boxShadow: shadow }} />
            <div style={{ position: "absolute", left: x0 + 18, top: y + 16, ...K, fontSize: 40, color: "#fff" }}>{man(s.v * p)}万</div>
          </React.Fragment>) : null; })}
        {f >= F(49.0) ? <>
          <div style={{ position: "absolute", left: 100, top: 880, width: 150, ...K, fontSize: 30, color: RED, ...rise(f, 49.0) }}>悪い年が<br />続くと</div>
          <div style={{ position: "absolute", left: x0, top: 880, height: 84, width: (XV(300) - x0) * ease(f, 49.0, 0.7), borderRadius: 18, background: `repeating-linear-gradient(-45deg, ${RED}55 0 14px, ${RED}22 14px 28px)`, border: `3px dashed ${RED}` }} />
          <div style={{ position: "absolute", left: x0 + 18, top: 896, ...K, fontSize: 40, color: RED, opacity: ease(f, 49.4) }}>？</div>
        </> : null}
        {f >= F(50.0) ? <>
          <div style={{ position: "absolute", left: XV(360), top: 410, height: 590, borderLeft: `5px dashed ${CB}`, transformOrigin: "top", transform: `scaleY(${ease(f, 50.0, 0.5)})` }} />
          <Chip at={50.3} c={CB} style={{ left: XV(360) - 110, top: 350 }} fs={26}>貯金 360万円</Chip>
        </> : null}
        <Stamp at={51.2} text="保証はない" style={{ left: 560, top: 1050 }} fs={46} />
      </>}
    </>
  );
};

// ════════ P9 まとめ（＋−の2列＋チェック） ════════
const LIST: { who: "A" | "B"; at: number; plus: boolean; text: string }[] = [
  { who: "A", at: 54.0, plus: true, text: "増える可能性" },
  { who: "A", at: 54.9, plus: false, text: "値下がりもある" },
  { who: "B", at: 56.0, plus: true, text: "減らない" },
  { who: "B", at: 56.9, plus: false, text: "ほぼ増えない" },
];
const P9: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <Head at={53.2} pill="まとめ" title="NISA vs 貯金" c={CN} />
      {(["A", "B"] as const).map((w, i) => {
        const c = w === "A" ? CA : CB;
        return (
          <div key={w} style={{ position: "absolute", left: i === 0 ? 100 : 580, top: 400, width: 400, height: 430, background: "#fff", borderRadius: 30, border: `3px solid ${c}40`, boxShadow: shadow, ...rise(f, 53.5 + i * 0.2) }}>
            <div style={{ height: 120, borderRadius: "27px 27px 0 0", background: `${c}16`, display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
              <Face who={w} size={84} /><span style={{ ...K, fontSize: 44, color: c }}>{w === "A" ? "NISA" : "貯金"}</span>
            </div>
            {LIST.filter((l) => l.who === w).map((l, k) => f >= F(l.at) ? (
              <div key={k} style={{ position: "absolute", left: 28, right: 16, top: 160 + k * 120, display: "flex", alignItems: "center", gap: 14, ...rise(f, l.at) }}>
                <span style={{ width: 54, height: 54, borderRadius: "50%", background: l.plus ? GREEN : RED, color: "#fff", ...K, fontSize: 40, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>{l.plus ? "＋" : "−"}</span>
                <span style={{ ...K, fontSize: 36, color: INK, whiteSpace: "nowrap" }}>{l.text}</span>
              </div>
            ) : null)}
          </div>
        );
      })}
      {f >= F(58.0) ? <div style={{ position: "absolute", left: 100, right: 100, top: 880, background: "#fff", borderRadius: 26, border: `3px solid ${GOLD}`, boxShadow: `${shadow}, 0 0 0 8px ${GOLD}22`, padding: "22px 28px", display: "flex", alignItems: "center", gap: 20, ...rise(f, 58.0) }}>
        <span style={{ width: 60, height: 60, borderRadius: 14, border: `5px solid ${INK}`, display: "flex", alignItems: "center", justifyContent: "center", ...K, fontSize: 46, color: GREEN, flex: "none" }}>{f >= F(59.4) ? "✓" : ""}</span>
        <div style={{ ...K, fontSize: 36, color: INK, lineHeight: 1.35 }}>すぐ使うお金は <span style={{ color: CB }}>貯金</span><br />10年使わないお金は <span style={{ color: CA }}>NISA</span></div>
      </div> : null}
      <Chara n="taichi_ok_hand" at={59.6} h={220} x={880} y={1060} />
    </>
  );
};

// ── 全体 ─────────────────────────────────────────
const IDS = ["p1", "p3", "p4", "p5", "p6", "p7", "p8", "p9"];
const PANELS: Panel[] = IDS.map((id, i) => ({ id, col: i, row: 0 }));
const LINKS: [string, string][] = IDS.slice(1).map((id, i) => [IDS[i], id]);
const STOPS: Stop[] = [
  { id: "p1", trans: 0 }, { id: "p3", trans: 12.4, kind: "kick" }, { id: "p4", trans: 18.2, kind: "kick" },
  { id: "p5", trans: 25.2, kind: "kick" }, { id: "p6", trans: 33.6, kind: "fast" }, { id: "p7", trans: 38.4, kind: "kick" }, { id: "p8", trans: 44.2, kind: "fast" }, { id: "p9", trans: 52.8, kind: "kick" },
];
const PAGES: Record<string, React.FC> = { p1: P1, p3: P3, p4: P4, p5: P5, p6: P6, p7: P7, p8: P8, p9: P9 };
const CAPS: Cap[] = [
  { t: 0.3, w: ["同じ", "年収の", "2人"], c: CN }, { t: 1.6, w: ["手取りも", "まったく", "同じ"], c: CN }, { t: 2.6, w: ["1人は", "NISAで", "積み立て"], c: CA }, { t: 3.8, w: ["もう1人は", "貯金"], c: CB },
  { t: 5.0, w: ["10年後、", "得するのは", "どっち？"], c: RED }, { t: 6.2, w: ["実際に", "計算して", "みます"], c: CN },
  { t: 7.8, w: ["2人の", "条件は"], c: CN }, { t: 8.6, w: ["30歳"], c: CN }, { t: 9.6, w: ["手取りは", "月30万円"], c: CN }, { t: 10.6, w: ["毎月", "3万円ずつ"], c: CN }, { t: 11.6, w: ["違うのは", "置き場所", "だけ"], c: CN },
  { t: 13.0, w: ["3万円", "×", "12か月", "×", "10年"], c: CN, step: 0.42 }, { t: 16.0, w: ["入れるお金は", "2人とも", "360万円"], c: CN },
  { t: 18.8, w: ["まずは", "助手の", "貯金"], c: CB }, { t: 20.6, w: ["10年", "コツコツ", "貯めると"], c: CB }, { t: 22.6, w: ["利息は", "ほぼゼロ"], c: CB }, { t: 23.8, w: ["10年後", "360万円"], c: CB }, { t: 24.6, w: ["でも", "1円も", "減らない"], c: GREEN },
  { t: 25.8, w: ["次は", "太一の", "NISA"], c: CA }, { t: 28.0, w: ["点線が", "入れたお金"], c: CA }, { t: 29.2, w: ["年5%で", "増えていくと"], c: CA }, { t: 30.6, w: ["この差が", "運用で", "増えた分"], c: GOLD },
  { t: 34.2, w: ["466万円の", "中身は"], c: CA }, { t: 35.0, w: ["入れたお金", "360万円"], c: CA }, { t: 36.2, w: ["増えた分", "106万円"], c: GOLD }, { t: 37.4, w: ["NISAだから", "税金は", "かからない"], c: GREEN },
  { t: 39.2, w: ["10年後"], c: CN }, { t: 39.4, w: ["NISAは", "466万円"], c: CA }, { t: 40.4, w: ["貯金は", "360万円"], c: CB }, { t: 41.6, w: ["差は", "約106万円"], c: RED }, { t: 43.2, w: ["同じ", "3万円", "なのに"], c: RED },
  { t: 44.6, w: ["でも", "ちょっと", "待って"], c: RED }, { t: 46.2, w: ["毎年", "5%とは", "限らない"], c: RED }, { t: 46.6, w: ["年3%なら", "約419万円"], c: CA }, { t: 48.2, w: ["年7%なら", "約519万円"], c: CA }, { t: 49.0, w: ["悪い年が", "続けば"], c: RED }, { t: 50.0, w: ["貯金を", "下回る", "ことも"], c: CB }, { t: 51.2, w: ["増える", "保証は", "ない"], c: RED },
  { t: 53.4, w: ["まとめると"], c: CN }, { t: 54.0, w: ["NISAは", "増える", "可能性"], c: CA }, { t: 54.9, w: ["でも", "値下がりも", "ある"], c: CA }, { t: 56.0, w: ["貯金は", "減らない"], c: CB }, { t: 56.9, w: ["でも", "ほぼ", "増えない"], c: CB },
  { t: 58.0, w: ["すぐ使う", "お金は", "貯金"], c: CB }, { t: 59.2, w: ["使わない", "お金は", "NISA"], c: CA },
];
const s = (file: string, t: number, volume = 0.18) => ({ file: `user/${file}`, at: F(t), volume });
const CUES = [
  s("u02s", 0.6, 0.16), s("u02s", 1.6), s("u02s", 2.6), s("u02s", 3.8), s("u02s", 5.0, 0.16), s("u02s", 6.2, 0.16), s("u03s", 7.6, 0.16),
  ...STOPS.slice(1).map((st) => s("u03s", st.trans, 0.22)),
  ...ROWS.map((r) => s("u02s", r.at + 0.4, 0.14)), s("u02s", 11.6),
  s("u02s", 13.4, 0.14), s("u02s", 14.2, 0.14), s("u02s", 15.0, 0.14), s("u05", 16.0, 0.2),
  s("u05s", 20.6), s("u02s", 22.6, 0.14), s("u05", 23.8, 0.2),
  s("u05s", 29.2), s("u02s", 30.6, 0.14),
  s("u05s", 34.6), s("u05", 36.2, 0.2), s("u02s", 37.4, 0.14),
  s("u05", 39.4, 0.2), s("u05", 40.4, 0.2), s("u04", 43.2, 0.24),
  s("u04", 44.6, 0.26), ...SCN.map((x) => s("u05s", x.at, 0.16)), s("u04", 51.2, 0.24),
  ...LIST.map((l) => s("u02s", l.at, 0.14)), s("u10", 59.4, 0.24),
];
const Note: React.FC = () => {
  const t = useCurrentFrame() / 30;
  if (t < 27 || t > 52.6) return null;
  return <div style={{ position: "absolute", left: 150, right: 150, top: 1240, textAlign: "center", ...K, fontSize: 20, color: SUB, opacity: 0.85 }}>※毎月3万円・10年・月複利で計算した仮定の試算です</div>;
};

export const COMPAREDEMO_FRAMES = F(62);
export const CompareDemo: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: FONT, background: A2.bg }}>
    <SfxTrack cues={CUES} />
    <Board streaks panels={PANELS} stops={STOPS} links={LINKS} paper={{ background: A2.bg, backgroundImage: "radial-gradient(circle at 50% 38%, rgba(255,255,255,0.7), rgba(255,255,255,0) 58%), repeating-linear-gradient(transparent 0 62px, rgba(176,146,60,0.18) 62px 64px)" }}>
      {(id) => { const C = PAGES[id]; return <AbsoluteFill><C /></AbsoluteFill>; }}
    </Board>
    <Note />
    <Captions caps={CAPS} end={61.8} />
  </AbsoluteFill>
);
