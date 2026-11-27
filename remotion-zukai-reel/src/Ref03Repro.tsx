import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame } from "remotion";
import { GenSlot } from "./MileLifePlan";
import { K } from "./components/zukaiKit";
import { CommentCta } from "./components/ctaComment";
import { REF3_MOUTH } from "./ref3Mouth";

// ════════════════════════════════════════════════════════════════════
//  参考③（Claude Codeのセキュリティ対策5つ・69秒）の丸ごと再現（練習用VTR）
//  音＝public/ref3-audio.wav（参考動画の音。リポジトリに入れない）
//  置きかえ：話している本人 → 太一のイラスト（口だけ動く）／アプリのロゴ → ふつうのアイコン（✳・🤖）
//  分析＝.claude/skills/zukai-reel/references/ref-03-claude-security-cta.md
// ════════════════════════════════════════════════════════════════════

const F = (t: number) => Math.round(t * 30);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const OUT = Easing.bezier(0.16, 1, 0.3, 1);
const OR = "#FF6A13", DARK = "#141414", PAPER = "#EFEFEB", BEIGE = "#E4DDCC", WHITE = "#F8F8F6", INK = "#1C1C1C";
const MONO = "ui-monospace, Menlo, Consolas, monospace";

// ── 時刻で出す（ポン） ──
const popK = (d: number) => interpolate(d, [0, 4, 7], [0.5, 1.08, 1], clamp);
const Pop: React.FC<{ at: number; until?: number; x: number; y: number; children: React.ReactNode; mode?: "pop" | "up" | "fade" | "drop" }> = ({ at, until = 999, x, y, children, mode = "pop" }) => {
  const f = useCurrentFrame();
  const d = f - F(at);
  if (d < 0 || f >= F(until) + 4) return null;
  const o = interpolate(d, [0, 3], [0, 1], clamp) * (1 - interpolate(f, [F(until), F(until) + 4], [0, 1], clamp));
  const tr = mode === "pop" ? `scale(${popK(d)})` : mode === "up" ? `translateY(${interpolate(d, [0, 8], [40, 0], { ...clamp, easing: OUT })}px)` : mode === "drop" ? `translateY(${interpolate(d, [0, 6, 9], [-60, 6, 0], clamp)}px)` : "none";
  return <div style={{ position: "absolute", left: x, top: y, opacity: o, transform: tr }}>{children}</div>;
};

// ── 太一（話す人の代わり） ──
const Talker: React.FC<{ size: number; x: number; y: number }> = ({ size, x, y }) => {
  const f = useCurrentFrame();
  const lv = REF3_MOUTH.charCodeAt(Math.min(REF3_MOUTH.length - 1, f)) - 48;
  const blink = f % 84 >= 80 && lv === 0;
  const img = blink ? "taichi_blink" : lv >= 2 ? (Math.floor(f / 2) % 3 === 0 ? "taichi_talk_mid" : "taichi_talk_open") : lv === 1 ? "taichi_talk_mid" : "taichi_talk_closed";
  return <div style={{ position: "absolute", left: x, top: y + Math.sin(f / 11) * 3 }}><GenSlot name={img} size={size} /></div>;
};
// 部屋（暗い部屋にオレンジのネオン）
const Room: React.FC<{ top?: number }> = ({ top = 0 }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top, bottom: 0, background: "radial-gradient(circle at 75% 25%, #5A2A10 0, #24160F 35%, #0E0C0B 75%)" }}>
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "45%", background: "linear-gradient(#0000, #000A)" }} />
  </div>
);
// ネオンの絵（しおり・吹き出し）
const Neon: React.FC<{ kind: "bookmark" | "bubble"; at: number; x: number; y: number; s?: number }> = ({ kind, at, x, y, s = 1 }) => {
  const f = useCurrentFrame();
  const d = f - F(at);
  if (d < 0) return null;
  const o = interpolate(d, [0, 2, 3, 5, 6], [0, 1, 0.3, 1, 1], clamp) * (0.9 + 0.1 * Math.sin(f / 3));
  return (
    <svg width={300 * s} height={300 * s} viewBox="0 0 300 300" style={{ position: "absolute", left: x, top: y, opacity: o, filter: `drop-shadow(0 0 10px ${OR}) drop-shadow(0 0 26px ${OR})` }}>
      {kind === "bookmark"
        ? <path d="M70 40 H230 a20 20 0 0 1 20 20 V260 L150 200 L50 260 V60 a20 20 0 0 1 20 -20 Z" fill="none" stroke="#FFB070" strokeWidth={14} strokeLinejoin="round" />
        : <path d="M60 60 H240 a30 30 0 0 1 30 30 V180 a30 30 0 0 1 -30 30 H130 L80 255 V210 H60 a30 30 0 0 1 -30 -30 V90 a30 30 0 0 1 30 -30 Z" fill="none" stroke="#FFB070" strokeWidth={14} strokeLinejoin="round" />}
    </svg>
  );
};

// ── テロップ（2行まで。2行目は後から足す） ──
type Cap = [number, string, (1 | 2)?];
const CAPS: Cap[] = [
  [1.9, "これを今すぐ"], [2.6, "これを今すぐ\n読み込ませてください"], [3.3, "Claude Codeは\n便利な反面"], [4.55, "使い方ミスると"], [5.35, "使い方ミスると\nかなり危険なので"], [6.1, "保存して"], [6.6, "保存して\n最後まで見てください"],
  [7.45, "実は10月に"], [9.1, "という会社が"], [9.75, "という会社が\nダウンロードフォルダに入った"], [10.95, "偽の指示書で"], [11.65, "偽の指示書で\nCodexが"], [12.15, "不正なプログラムを\n入れかけた例を報告してます"],
  [14.1, "他人ごとではないので"], [15.0, "他人ごとではないので\n必ず今日設定しておきましょう"],
  [18.85, "ダウンロードフォルダは"], [19.7, "ダウンロードフォルダは\nWebサイトが勝手に"], [20.65, "ファイルを置ける場所"], [21.45, "そこで開くと"], [22.05, "仕込まれた指示書を\n読んでしまうので"], [23.65, "専用のフォルダを1つ決めて"], [25.1, "専用のフォルダを1つ決めて\nそこだけで開きます"],
  [25.95, "②.envを読ませない", 1], [27.6, ".envはパスワードや"], [28.9, ".envはパスワードや\nAPIキーを入れておくファイル"], [30.25, "Claude Codeが\n読めない設定にしておけば"], [31.9, "大事な鍵が外に漏れる"], [33.1, "大事な鍵が外に漏れる\nリスクを減らせます"],
  [34.0, "③/permissionsで", 1], [35.55, "③/permissionsで\n許可を見直す", 1], [36.35, "Claude Codeに"], [37.05, "Claude Codeに\n「確認なしでやっていいよ」と"], [38.35, "OKしたルールが"], [39.15, "OKしたルールが\n一覧で見られます"],
  [39.95, "前に許可したまま"], [40.8, "前に許可したまま\n忘れてるものが"], [41.6, "危ない操作を通さないように"], [43.05, "危ない操作を通さないように\n覚えのないものは消します"],
  [44.05, "④bypassモードをロック", 1], [45.6, "確認を全部飛ばして"], [46.7, "確認を全部飛ばして\n動かすモードは"], [47.4, "ラクな反面"], [48.05, "変な指示書に従っても"], [49.2, "変な指示書に従っても\n誰も止められません"], [50.0, "設定でロックすれば"], [51.0, "うっかりオンに"], [51.65, "うっかりオンに\nできなくなります"],
  [54.3, "Claude Codeの\nコマンドを"], [55.6, "囲いの中で動かす機能"], [56.8, "決めた場所以外への"], [57.75, "決めた場所以外への\n書き込みや"], [58.25, "知らないサーバーへの送信を"], [59.6, "知らないサーバーへの送信を\nパソコン側で止めてくれます"],
  [60.8, "②④⑤は"], [62.0, "プロンプトを貼るだけで"], [62.9, "設定できるので"], [63.6, "プロンプト本体と"], [64.5, "プロンプト本体と\n画面つき解説が欲しい人は"], [65.85, "好きな色をコメントして", 1], [66.9, "受け取ってください"],
];
// 場面ごとのテロップの置き場所と色
type Look = { y: number; color: string; shadow: boolean };
const capLook = (t: number): Look | null => {
  const S = SCENES.find((s) => t >= s.a && t < s.b);
  if (!S) return null;
  return S.cap;
};
const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  let c: Cap | undefined;
  for (const x of CAPS) if (t >= x[0]) c = x;
  if (!c || t < 1.85) return null;
  const nextT = CAPS[CAPS.indexOf(c) + 1]?.[0] ?? 69.5;
  if (t > nextT + 0.1 && !CAPS.find((x) => x[0] > c![0])) return null;
  const L = capLook(t);
  if (!L) return null;
  const [t0, text, orange] = c;
  const lines = text.split("\n");
  const prev = CAPS[CAPS.indexOf(c) - 1];
  const keep = prev && text.startsWith(prev[1]) ? prev[1].split("\n").length : 0; // 前と同じ行はそのまま
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: L.y, textAlign: "center" }}>
      {lines.map((ln, i) => {
        const d = f - F(t0);
        const isNew = i >= keep;
        const k = isNew ? interpolate(d, [0, 5], [0, 1], { ...clamp, easing: OUT }) : 1;
        return <div key={i} style={{ ...K, fontSize: orange ? 60 : 52, lineHeight: 1.32, color: orange ? OR : L.color, opacity: k, transform: `translateY(${(1 - k) * 14}px) scale(${0.96 + 0.04 * k})`, textShadow: L.shadow ? "0 3px 10px #000C, 0 0 2px #000" : "none", whiteSpace: "nowrap" }}>{ln}</div>;
      })}
    </div>
  );
};

// ── 部品：方眼の背景＋右上の時刻 ──
const Grid: React.FC<{ bg: string; line: string; t0: number }> = ({ bg, line, t0 }) => {
  const f = useCurrentFrame();
  const ts = Math.max(0, f / 30 - t0);
  return (
    <AbsoluteFill style={{ background: bg, backgroundImage: `linear-gradient(${line} 2px, transparent 2px), linear-gradient(90deg, ${line} 2px, transparent 2px)`, backgroundSize: "120px 120px" }}>
      <div style={{ position: "absolute", right: 70, top: 170, fontFamily: MONO, fontSize: 22, color: line.replace(/[\d.]+\)$/, "0.9)") }}>T+{ts.toFixed(2).padStart(5, "0")}</div>
      {[...Array(14)].map((_, i) => <div key={i} style={{ position: "absolute", left: 18, top: 60 + i * 130, width: i % 3 === 0 ? 26 : 14, height: 3, background: line }} />)}
    </AbsoluteFill>
  );
};
// アプリのカード（黒・白）
const Card: React.FC<{ w?: number; h?: number; dark?: boolean; label: string; icon: React.ReactNode; red?: boolean; warn?: boolean; glow?: boolean }> = ({ w = 230, h = 170, dark = true, label, icon, red, warn, glow }) => (
  <div style={{ position: "relative", width: w, height: h, borderRadius: 18, background: dark ? "#1E1E1E" : "#fff", boxShadow: `0 14px 30px rgba(0,0,0,0.25)${red ? `, 0 0 0 5px #E8414A, 0 0 26px #E8414A88` : ""}${glow ? `, 0 0 0 6px #F2B33D` : ""}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
    <div style={{ fontSize: 56, lineHeight: 1 }}>{icon}</div>
    <div style={{ ...K, fontSize: 26, color: dark ? "#fff" : INK, fontFamily: MONO, fontWeight: 800 }}>{label}</div>
    {warn ? <div style={{ position: "absolute", right: -24, top: -34, fontSize: 64 }}>⚠️</div> : null}
  </div>
);
const Folder = <svg width={64} height={52} viewBox="0 0 64 52"><path d="M2 8 a6 6 0 0 1 6 -6 h16 l6 6 h26 a6 6 0 0 1 6 6 v30 a6 6 0 0 1 -6 6 h-48 a6 6 0 0 1 -6 -6 z" fill="#6FA0F5" /></svg>;
const Spark = <span style={{ color: "#E07A4F" }}>✳</span>;
const Robot = <span>🤖</span>;
const Win: React.FC<{ title: string; w: number; h: number; children: React.ReactNode; input?: React.ReactNode }> = ({ title, w, h, children, input }) => (
  <div style={{ position: "relative", width: w, height: h, borderRadius: 22, background: "#FBFAF6", boxShadow: "0 20px 46px rgba(0,0,0,0.18)", overflow: "hidden" }}>
    <div style={{ height: 54, background: "#EFEDE5", display: "flex", alignItems: "center", gap: 10, padding: "0 20px" }}>
      {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <span key={c} style={{ width: 14, height: 14, borderRadius: "50%", background: c }} />)}
      <span style={{ marginLeft: 12, color: "#E07A4F", fontSize: 22 }}>✳</span><span style={{ ...K, fontSize: 22, color: "#555" }}>{title}</span>
    </div>
    <div style={{ padding: "22px 26px" }}>{children}</div>
    <div style={{ position: "absolute", left: 20, right: 20, bottom: 20, height: 70, borderRadius: 16, border: "2px solid #E6E2D6", background: "#fff", display: "flex", alignItems: "center", padding: "0 18px", fontFamily: MONO, fontSize: 24, color: "#888" }}>
      <div style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden" }}>{input}</div>
      <span style={{ width: 40, height: 40, borderRadius: 10, background: "#E07A4F", color: "#fff", textAlign: "center", lineHeight: "40px", fontSize: 24 }}>↑</span>
    </div>
  </div>
);
const Typing: React.FC<{ at: number; text: string; cps?: number }> = ({ at, text, cps = 18 }) => {
  const f = useCurrentFrame();
  const n = Math.max(0, Math.min(text.length, Math.floor(((f - F(at)) / 30) * cps)));
  return <>{text.slice(0, n)}{n < text.length && Math.floor(f / 8) % 2 === 0 ? "|" : ""}</>;
};
const Row: React.FC<{ at: number; text: string; bad?: number; gone?: number }> = ({ at, text, bad, gone }) => {
  const f = useCurrentFrame();
  if (f < F(at)) return <div style={{ height: 58 }} />;
  const isBad = bad !== undefined && f >= F(bad);
  const g = gone !== undefined ? interpolate(f, [F(gone), F(gone) + 8], [1, 0], clamp) : 1;
  if (g <= 0) return null;
  const k = interpolate(f - F(at), [0, 6], [0, 1], { ...clamp, easing: OUT });
  return (
    <div style={{ height: 50 * g, marginBottom: 8 * g, opacity: k * g, transform: `translateX(${(1 - k) * 30}px)`, borderRadius: 10, border: `2px solid ${isBad ? "#F0A0A0" : "#ECE8DD"}`, background: isBad ? "#FDECEC" : "#fff", display: "flex", alignItems: "center", gap: 12, padding: "0 14px", fontFamily: MONO, fontSize: 22, color: INK, overflow: "hidden" }}>
      <span style={{ width: 14, height: 14, borderRadius: "50%", background: isBad ? "#E8414A" : "#3FB950" }} />{text}
      {isBad ? <span style={{ marginLeft: "auto", ...K, fontSize: 18, color: "#E8414A" }}>覚えがない</span> : null}
    </div>
  );
};
const Toggle: React.FC<{ on: number; x: number; y: number; s?: number }> = ({ on, x, y, s = 1 }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [F(on), F(on) + 6], [0, 1], { ...clamp, easing: OUT });
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 150 * s, height: 80 * s, borderRadius: 999, background: p > 0.5 ? OR : "#D6D6D6", boxShadow: p > 0.5 ? `0 0 30px ${OR}` : "inset 0 2px 6px #0003" }}>
      <div style={{ position: "absolute", top: 8 * s, left: (8 + 70 * p) * s, width: 64 * s, height: 64 * s, borderRadius: "50%", background: "#fff", boxShadow: "0 3px 8px #0004" }} />
    </div>
  );
};
const StepCard: React.FC<{ t0: number; n: string; l1: string; l2: string; toggle?: number }> = ({ t0, n, l1, l2, toggle }) => {
  const f = useCurrentFrame();
  const d = f - F(t0);
  const k = interpolate(d, [0, 7], [0, 1], { ...clamp, easing: OUT });
  return (
    <>
      <Grid bg="#120D0B" line="rgba(255,106,19,0.13)" t0={t0} />
      <div style={{ position: "absolute", left: 120, top: 360, fontFamily: MONO, fontSize: 30, color: OR, letterSpacing: 6 }}>STEP</div>
      <div style={{ position: "absolute", left: 100, top: 410, ...K, fontSize: 300, lineHeight: 1, color: OR, transform: `scale(${0.7 + 0.3 * k})`, transformOrigin: "0 50%", opacity: k, filter: k < 1 ? `blur(${(1 - k) * 12}px)` : undefined }}>{n}</div>
      <div style={{ position: "absolute", left: 120, top: 760, ...K, fontSize: 80, lineHeight: 1.25, color: "#fff", opacity: interpolate(d, [4, 10], [0, 1], clamp) }}>{l1}<br /><span style={{ color: OR }}>{l2}</span></div>
      {toggle !== undefined ? <Toggle on={toggle} x={640} y={470} s={1.3} /> : null}
    </>
  );
};

// ── 場面 ──
type Scene = { a: number; b: number; cap: Look | null; C: React.FC; z?: number };
const capDark: Look = { y: 1450, color: "#fff", shadow: true };
const capSplit: Look = { y: 1000, color: "#fff", shadow: true };
const capLight: Look = { y: 1330, color: INK, shadow: false };
const capDarkFull: Look = { y: 1330, color: "#fff", shadow: false };
// 上下に分ける（上＝図、下＝太一）
const Split: React.FC<{ bg: string; z?: number; children: React.ReactNode }> = ({ bg, z = 1.45, children }) => (
  <AbsoluteFill>
    <Room top={820} />
    <Talker size={760} x={160} y={1010} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 1080, background: `linear-gradient(${bg} 0, ${bg} 760px, ${bg}00 1080px)` }} />
    <div style={{ position: "absolute", inset: 0, transform: `scale(${z})`, transformOrigin: "540px 230px" }}>{children}</div>
  </AbsoluteFill>
);
const FullTalk: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill><Room /><Talker size={1000} x={40} y={620} />{children}</AbsoluteFill>
);

const S_Alert: React.FC = () => {
  const f = useCurrentFrame();
  const k = interpolate(f, [2, 14], [0, 1], { ...clamp, easing: OUT });
  return (
    <AbsoluteFill>
      <Grid bg={OR} line="rgba(120,30,0,0.22)" t0={0} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 640, textAlign: "center", fontFamily: MONO, fontSize: 30, letterSpacing: 10, color: "rgba(90,20,0,0.7)", opacity: interpolate(f, [8, 14], [0, 1], clamp) }}>SECURITY ALERT</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 700, textAlign: "center", ...K, fontSize: 250, color: "#1A0E08", opacity: k, filter: `blur(${(1 - k) * 22}px)`, transform: `scale(${1.25 - 0.25 * k})` }}>緊急</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1000, textAlign: "center", ...K, fontSize: 64, color: "#1A0E08", opacity: interpolate(f, [16, 22], [0, 1], clamp) }}>Claude Codeの<br /><span style={{ opacity: interpolate(f, [34, 40], [0, 1], clamp) }}>セキュリティ対策</span></div>
    </AbsoluteFill>
  );
};
const S_Hook: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Split bg={PAPER} z={1}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", fontFamily: MONO, fontWeight: 900, fontSize: 120, lineHeight: 1.0, color: "#E8735A", letterSpacing: 4, textShadow: "4px 4px 0 #F4C2B5" }}>CLAUDE<br />CODE</div>
      {f >= F(4.6) ? <div style={{ position: "absolute", left: 730, top: 240, fontSize: 130, transform: `scale(${popK(f - F(4.6))}) rotate(${interpolate(f - F(4.6), [0, 6], [-25, 0], clamp)}deg)` }}>⚠️</div> : null}
    </Split>
  );
};
const S_Save: React.FC = () => (
  <FullTalk><Neon kind="bookmark" at={6.15} x={720} y={260} /><Neon kind="bubble" at={7.45} x={720} y={260} /></FullTalk>
);
const S_Case: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: WHITE }}>
      <Pop at={9.8} x={150} y={420}><Card label="Downloads" icon={Folder} /></Pop>
      <Pop at={10.3} x={530} y={420}><Card label="Codex" icon={Robot} red={f >= F(11.75)} warn={f >= F(12.25)} /></Pop>
      <Pop at={11.0} until={11.7} x={170} y={600} mode="up"><div style={{ background: "#fff", border: "3px solid #E8414A", borderRadius: 10, padding: "4px 14px", fontFamily: MONO, fontSize: 22, color: INK }}>📄 AGENTS.md</div></Pop>
      <Pop at={12.6} x={150} y={640} mode="up"><div style={{ width: 610, background: "#1E1E1E", borderRadius: 14, padding: "16px 22px", fontFamily: MONO, fontSize: 26, color: "#ddd", boxShadow: "0 0 0 4px #E8414A55" }}><span style={{ color: "#3FB950" }}>$</span> npm install <span style={{ color: "#FF7A59" }}>function-color</span></div></Pop>
    </AbsoluteFill>
  );
};
const S_Today: React.FC = () => <FullTalk><Neon kind="bubble" at={14.15} x={720} y={260} /></FullTalk>;
const S_Five: React.FC = () => {
  const f = useCurrentFrame();
  const d = f - F(16.4);
  return (
    <AbsoluteFill>
      <Grid bg="#120D0B" line="rgba(255,106,19,0.13)" t0={16.4} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 560, textAlign: "center", ...K, fontSize: 70, color: "#fff" }}>やることは</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 660, textAlign: "center", ...K, fontSize: 420, lineHeight: 1, color: OR, transform: `scale(${interpolate(d, [4, 8, 11], [0.4, 1.1, 1], clamp)})`, opacity: interpolate(d, [4, 6], [0, 1], clamp) }}>5<span style={{ fontSize: 110 }}>つ</span></div>
    </AbsoluteFill>
  );
};
const S_Step1: React.FC = () => <StepCard t0={17.3} n="01" l1="Downloadsで" l2="開かない" />;
const S_DL: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Split bg={DARK}>
      <Pop at={18.85} x={200} y={360}><div style={{ width: 230, height: 170, borderRadius: 18, background: "#F4F4F4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 90 }}>🌐</div></Pop>
      <Pop at={19.75} x={600} y={360}><Card label="Downloads" icon={Folder} /></Pop>
      {[20.7, 21.0, 21.3].map((t, i) => <Pop key={t} at={t} x={620 + i * 64} y={560} mode="drop"><div style={{ fontSize: 50 }}>{i === 1 ? "📕" : "📄"}</div></Pop>)}
      {f >= F(22.1) ? <div style={{ position: "absolute", left: 600, top: 360, width: 230, height: 170, borderRadius: 18, boxShadow: `0 0 0 5px #E8414A`, opacity: 0.5 + 0.5 * Math.sin(f / 3) }} /> : null}
    </Split>
  );
};
const S_Folder: React.FC = () => {
  const f = useCurrentFrame();
  const items = ["Documents", "Pictures", "claude-work", "Desktop", "Downloads"];
  const lock = f >= F(25.15);
  return (
    <Split bg={PAPER} z={1.1}>
      <div style={{ position: "absolute", left: 160, top: 260, width: 760, display: "flex", flexDirection: "column", gap: 14 }}>
        {items.map((it, i) => {
          const at = F(23.65) + (i < 3 ? i * 3 : 10 + i * 2);
          if (f < at) return <div key={it} style={{ height: 66 }} />;
          const sel = it === "claude-work";
          return (
            <div key={it} style={{ height: 66, borderRadius: 12, background: lock && !sel ? "#CFCFCB" : sel && lock ? "#FFF3C9" : "#1E1E1E", boxShadow: sel && f >= F(24.8) ? "0 0 0 5px #F2B33D" : "0 6px 14px #0002", display: "flex", alignItems: "center", gap: 16, padding: "0 20px", fontFamily: MONO, fontSize: 28, color: lock && !sel ? "#fff" : sel && lock ? "#B07A00" : "#fff", transform: `scale(${popK(f - at)})` }}>
              <span style={{ fontSize: 30 }}>📁</span>{it}{lock && !sel ? <span style={{ marginLeft: "auto" }}>🔒</span> : null}
            </div>
          );
        })}
      </div>
    </Split>
  );
};
const Shield: React.FC<{ at: number; icon: string }> = ({ at, icon }) => {
  const f = useCurrentFrame();
  const d = f - F(at);
  return (
    <div style={{ position: "absolute", left: 340, top: 300, width: 400, height: 400, transform: `scale(${interpolate(d, [0, 5, 9], [0.4, 1.08, 1], clamp)})`, opacity: interpolate(d, [0, 3], [0, 1], clamp) }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "5px dashed #F2B33D", transform: `rotate(${f * 1.2}deg)` }} />
      <svg width={260} height={300} viewBox="0 0 260 300" style={{ position: "absolute", left: 70, top: 50 }}><path d="M130 10 L240 50 V140 C240 210 190 260 130 290 C70 260 20 210 20 140 V50 Z" fill="#F2A72E" stroke="#fff" strokeWidth={12} /></svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", fontSize: 110 }}>{icon}</div>
    </div>
  );
};
const S_Env1: React.FC = () => <AbsoluteFill style={{ background: DARK }}><div style={{ position: "absolute", inset: 0, transform: "scale(1.45)", transformOrigin: "540px 300px" }}><Shield at={25.95} icon="🔑" /></div></AbsoluteFill>;
const S_Env2: React.FC = () => (
  <Split bg={BEIGE} z={1.1}>
    <Pop at={27.6} x={160} y={320} mode="up">
      <div style={{ width: 760, background: "#1E1E1E", borderRadius: 18, padding: "18px 26px 26px", fontFamily: MONO, fontSize: 26, lineHeight: 1.6, color: "#9CC8FF", boxShadow: "0 16px 30px #0004" }}>
        <div style={{ color: "#777", fontSize: 20, marginBottom: 8 }}>● ● ●  .env</div>
        <Pop at={28.4} x={0} y={0} mode="fade"><div>PASSWORD=<span style={{ color: "#FFB86B" }}>••••••••••</span></div></Pop><div style={{ height: 42 }} />
        <Pop at={29.0} x={0} y={42} mode="fade"><div>OPENAI_API_KEY=<span style={{ color: "#FFB86B" }}>sk-•••••••</span></div></Pop><div style={{ height: 42 }} />
        <Pop at={29.5} x={0} y={84} mode="fade"><div>STRIPE_SECRET=<span style={{ color: "#FFB86B" }}>••••••••</span></div></Pop>
      </div>
    </Pop>
    <Pop at={28.9} x={840} y={300}><div style={{ fontSize: 80 }}>🔑</div></Pop>
  </Split>
);
const S_Env3: React.FC = () => {
  const f = useCurrentFrame();
  const fly = interpolate(f, [F(32.4), F(33.8)], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  return (
    <AbsoluteFill style={{ background: WHITE }}>
      <Pop at={30.25} x={110} y={480}><Card dark={false} label="Claude Code" icon={Spark} w={260} /></Pop>
      <Pop at={30.45} x={700} y={480}><Card label=".env" icon="📄" w={260} /></Pop>
      {f >= F(30.45) ? <div style={{ position: "absolute", left: 370, top: 562, width: 330, height: 6, background: "#ccc" }} /> : null}
      <Pop at={31.0} x={485} y={510}><div style={{ width: 110, height: 110, borderRadius: "50%", background: "#F2B33D", ...K, fontSize: 80, lineHeight: "110px", textAlign: "center", color: INK }}>×</div></Pop>
      <Pop at={31.2} x={920} y={450}><div style={{ fontSize: 56 }}>🔒</div></Pop>
      <Pop at={32.3} x={700 + fly * 300} y={760 - fly * 200}><div style={{ fontSize: 70, opacity: 1 - fly }}>🔑</div></Pop>
    </AbsoluteFill>
  );
};
const S_Perm1: React.FC = () => <Split bg="#1A1410" z={1.25}><div style={{ position: "absolute", left: 0, top: -80, width: 1080, height: 800 }}><Shield at={34.05} icon="🔍" /></div></Split>;
const S_Perm2: React.FC = () => (
  <AbsoluteFill style={{ background: "#E6E6E2" }}>
    <div style={{ position: "absolute", left: 130, top: 220 }}>
      <Win title="Claude Code" w={820} h={860} input={<Typing at={36.4} text="/permissions" />}>
        <Pop at={37.2} x={560} y={0}><div style={{ background: "#FCE6DC", color: "#E07A4F", borderRadius: 10, padding: "6px 16px", fontFamily: MONO, fontSize: 24 }}>/permissions</div></Pop>
        <div style={{ height: 60 }} />
        <Pop at={37.6} x={0} y={60} mode="fade"><div style={{ ...K, fontSize: 24, color: INK }}><span style={{ color: "#E07A4F" }}>✳</span> 確認なしで実行してよいルール</div></Pop>
        <div style={{ position: "absolute", left: 26, right: 26, top: 190 }}>
          <Row at={38.5} text="Bash(npm run build)" />
          <Row at={38.7} text="Bash(curl *)" bad={41.7} gone={43.3} />
          <Row at={38.9} text="Bash(git push *)" bad={42.0} gone={43.45} />
          <Row at={39.1} text="Read(./src/**)" />
          <Pop at={43.8} x={0} y={140} mode="fade"><div style={{ fontFamily: MONO, fontSize: 20, color: "#3FB950" }}>✓ 2件のルールを削除しました</div></Pop>
        </div>
      </Win>
    </div>
  </AbsoluteFill>
);
const S_Bypass1: React.FC = () => <FullTalk><Neon kind="bubble" at={44.1} x={720} y={260} /></FullTalk>;
const S_Bypass2: React.FC = () => (
  <Split bg={WHITE} z={1.15}>
    <Pop at={45.65} x={120} y={300} mode="up"><div style={{ width: 760, background: "#1E1E1E", borderRadius: 14, padding: "16px 24px", fontFamily: MONO, fontSize: 26, color: "#ddd", lineHeight: 1.5 }}><span style={{ color: "#3FB950" }}>$</span> claude<br /><span style={{ color: "#FF7A59" }}>--dangerously-skip-permissions</span></div></Pop>
    <Pop at={46.7} until={47.9} x={560} y={460} mode="drop"><div style={{ background: "#fff", borderRadius: 10, padding: "8px 16px", fontFamily: MONO, fontSize: 22, boxShadow: "0 8px 16px #0003", transform: "rotate(8deg)" }}>Allow? Yes / No <span style={{ background: "#F2B33D", padding: "0 6px", ...K }}>SKIP</span></div></Pop>
    <Pop at={48.4} x={420} y={480}><div style={{ background: "#fff", border: "3px solid #E8414A", borderRadius: 10, padding: "4px 14px", fontFamily: MONO, fontSize: 22 }}>📄 CLAUDE.md</div></Pop>
    <Pop at={49.3} x={840} y={250}><div style={{ fontSize: 80 }}>⚠️</div></Pop>
  </Split>
);
const S_Bypass3: React.FC = () => (
  <AbsoluteFill style={{ background: "#161616" }}>
    <Pop at={50.05} x={150} y={330} mode="up">
      <div style={{ width: 780, background: "#222", borderRadius: 16, padding: "16px 24px 24px", fontFamily: MONO, fontSize: 26, color: "#ccc", lineHeight: 1.6 }}>
        <div style={{ color: "#777", fontSize: 20 }}>● ● ●  settings.json</div>
        "permissions": {"{"}<br /><span style={{ background: "#4A3A10", padding: "2px 8px", color: "#FFD27A" }}>&nbsp;&nbsp;"disableBypassPermissionsMode":</span><br />&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: "#FFD27A" }}>"disable"</span><br />{"}"}
      </div>
    </Pop>
    <Pop at={50.6} x={880} y={300}><div style={{ width: 80, height: 80, borderRadius: "50%", background: "#fff", fontSize: 44, textAlign: "center", lineHeight: "80px" }}>🔒</div></Pop>
    <Pop at={50.9} x={460} y={720}><div style={{ width: 160, height: 86, borderRadius: 999, background: "#D6D6D6", position: "relative" }}><div style={{ position: "absolute", left: 10, top: 10, width: 66, height: 66, borderRadius: "50%", background: "#fff" }} /></div></Pop>
  </AbsoluteFill>
);
const S_Step5: React.FC = () => <StepCard t0={52.3} n="05" l1="/sandboxを" l2="オンにする" toggle={53.4} />;
const S_Sand1: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Split bg={DARK}>
      <Pop at={54.35} x={430} y={260}><div style={{ width: 220, height: 150, borderRadius: 16, background: "#FFF6E8", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontSize: 50, color: "#E07A4F", boxShadow: f >= F(55.65) ? "0 0 0 10px #141414, 0 0 0 16px #F2B33D" : "none" }}>✳<span style={{ fontFamily: MONO, fontSize: 24, color: INK }}>&gt;_</span></div></Pop>
      <Pop at={56.8} x={300} y={520}><Card label="" icon={Folder} w={150} h={120} /></Pop>
      <Pop at={57.1} x={640} y={520}><Card label="" icon="🗄️" w={150} h={120} /></Pop>
    </Split>
  );
};
const S_Sand2: React.FC = () => {
  const f = useCurrentFrame();
  const ln = interpolate(f, [F(57.8), F(58.2)], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: BEIGE }}>
      <svg width={1080} height={1920} style={{ position: "absolute" }}><line x1={540} y1={600} x2={540 - 200 * ln} y2={600 + 160 * ln} stroke="#fff" strokeWidth={8} /><line x1={540} y1={600} x2={540 + 200 * ln} y2={600 + 160 * ln} stroke="#fff" strokeWidth={8} /></svg>
      <div style={{ position: "absolute", left: 430, top: 440, width: 220, height: 150, borderRadius: 16, background: "#FFF6E8", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontSize: 50, color: "#E07A4F", boxShadow: "0 0 0 10px " + BEIGE + ", 0 0 0 16px #F2B33D" }}>✳<span style={{ fontFamily: MONO, fontSize: 24, color: INK }}>&gt;_</span></div>
      <div style={{ position: "absolute", left: 265, top: 760 }}><Card label="" icon={Folder} w={150} h={120} /></div>
      <div style={{ position: "absolute", left: 665, top: 760 }}><Card label="" icon="🗄️" w={150} h={120} /></div>
      {[[58.4, 380], [59.6, 640]].map(([t, x]) => <Pop key={t} at={t} x={x} y={660}><div style={{ width: 80, height: 80, borderRadius: "50%", background: "#F2B33D", ...K, fontSize: 60, lineHeight: "80px", textAlign: "center", color: INK }}>×</div></Pop>)}
    </AbsoluteFill>
  );
};
const S_Prompt: React.FC = () => {
  const f = useCurrentFrame();
  const sent = f >= F(62.6);
  return (
    <AbsoluteFill style={{ background: "#E6E6E2" }}>
      <div style={{ position: "absolute", left: 130, top: 220 }}>
        <Win title="Claude Code" w={820} h={860} input={sent ? "" : <Typing at={61.0} text="Claude Codeのセキュリティ設定をして。" cps={14} />}>
          {sent ? <Pop at={62.6} x={300} y={0} mode="up"><div style={{ width: 460, background: "#F2EFE6", borderRadius: 14, padding: "12px 18px", fontSize: 20, lineHeight: 1.5, color: INK, fontFamily: "sans-serif" }}><b>Claude Codeのセキュリティ設定をして。</b><br />・permissions.deny に Read(./.env) …<br />・disableBypassPermissionsMode を "disable"<br />・sandbox.enabled を true</div></Pop> : null}
          <Pop at={63.0} x={0} y={170} mode="fade"><div style={{ ...K, fontSize: 24, color: INK }}><span style={{ color: "#E07A4F" }}>✳</span> settings.json に3つの設定を入れました</div></Pop>
          {[["② .env を読ませない", 63.5], ["④ bypassモードをロック", 63.9], ["⑤ /sandbox をオン", 64.3]].map(([t, at], i) => (
            <Pop key={t} at={at as number} x={30} y={220 + i * 62} mode="up"><div style={{ width: 680, height: 50, borderRadius: 10, background: "#fff", border: "2px solid #ECE8DD", display: "flex", alignItems: "center", padding: "0 16px", fontSize: 22, ...K, color: INK }}>{t}<span style={{ marginLeft: "auto", width: 30, height: 30, borderRadius: "50%", background: "#3FB950", color: "#fff", textAlign: "center", lineHeight: "30px", fontSize: 18 }}>✓</span></div></Pop>
          ))}
        </Win>
      </div>
    </AbsoluteFill>
  );
};
const S_Cta: React.FC = () => (
  <CommentCta at={64.75} want="プロンプト本体と画面つき解説" keyword="好きな色" title={"Claude Codeのセキュリティ対策5つ\nプロンプトつき設定ガイド"} chips={["①〜⑤を画面つきで解説", "コピペで使えるプロンプト", "設定できたか確かめる方法", "画面写真8枚"]}
    pages={["① Downloadsで開かない", "② .envを読ませない", "③ /permissionsで許可を見直す", "④ bypassモードをロック", "⑤ /sandboxをオンにする"].map((h) => (
      <div key={h} style={{ padding: "22px 26px" }}><div style={{ ...K, fontSize: 30, color: INK }}>{h}</div><div style={{ marginTop: 14, height: 300, borderRadius: 12, background: "#1E1E1E", padding: 16, fontFamily: MONO, fontSize: 18, color: "#9CC8FF", lineHeight: 1.6 }}>$ claude<br />{"> "}settings.json を確認<br />✓ 設定済み</div></div>
    ))} tComment={1.1} tLine={2.15} mouth={REF3_MOUTH.slice(F(64.75))} />
);

const SCENES: Scene[] = [
  { a: 0, b: 1.95, cap: null, C: S_Alert },
  { a: 1.95, b: 6.1, cap: capSplit, C: S_Hook },
  { a: 6.1, b: 9.8, cap: capDark, C: S_Save },
  { a: 9.8, b: 14.1, cap: capLight, C: S_Case, z: 1.45 },
  { a: 14.1, b: 16.4, cap: capDark, C: S_Today },
  { a: 16.4, b: 17.3, cap: null, C: S_Five },
  { a: 17.3, b: 18.85, cap: null, C: S_Step1 },
  { a: 18.85, b: 23.65, cap: capSplit, C: S_DL },
  { a: 23.65, b: 25.95, cap: capSplit, C: S_Folder },
  { a: 25.95, b: 27.6, cap: { y: 1050, color: OR, shadow: false }, C: S_Env1 },
  { a: 27.6, b: 30.25, cap: capSplit, C: S_Env2 },
  { a: 30.25, b: 34.0, cap: capLight, C: S_Env3, z: 1.15 },
  { a: 34.0, b: 36.35, cap: { y: 960, color: OR, shadow: false }, C: S_Perm1 },
  { a: 36.35, b: 44.05, cap: { y: 1330, color: INK, shadow: false }, C: S_Perm2 },
  { a: 44.05, b: 45.6, cap: capDark, C: S_Bypass1 },
  { a: 45.6, b: 50.0, cap: capSplit, C: S_Bypass2 },
  { a: 50.0, b: 52.3, cap: capDarkFull, C: S_Bypass3 },
  { a: 52.3, b: 54.3, cap: null, C: S_Step5 },
  { a: 54.3, b: 57.75, cap: capSplit, C: S_Sand1 },
  { a: 57.75, b: 60.8, cap: capLight, C: S_Sand2, z: 1.4 },
  { a: 60.8, b: 64.75, cap: capLight, C: S_Prompt },
  { a: 64.75, b: 69.1, cap: null, C: S_Cta },
];

export const REF03_FRAMES = F(69.05);
export const Ref03Repro: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const S = SCENES.find((s) => t >= s.a && t < s.b) ?? SCENES[SCENES.length - 1];
  const d = f - F(S.a);
  // 転換：カット＋最初の3fだけ少し寄って戻る
  const k = interpolate(d, [0, 3], [1.04, 1], clamp);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Audio src={staticFile("ref3-audio.wav")} />
      <AbsoluteFill style={{ transform: `scale(${k})` }}>{S.z ? <AbsoluteFill style={{ transform: `scale(${S.z})`, transformOrigin: "540px 420px" }}><S.C /></AbsoluteFill> : <S.C />}</AbsoluteFill>
      <Captions />
    </AbsoluteFill>
  );
};
