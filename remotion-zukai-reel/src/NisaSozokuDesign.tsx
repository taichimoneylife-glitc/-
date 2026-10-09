import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { FONT } from "./components/font";

// ═══════════════════════════════════════════════════════════════════
// NISA 亡くなったら｜図解【設計図】（静止画レビュー用・レイアウト確認）
//   page=1 フック / 2 流れ(6ステップ縦ツリー) / 3 結論(口座✕・商品〇) /
//   4 カギ(取得価額・損益対比) / 5 やること3つ / 6 CTA
//   録音前なので音声同期なし＝レイアウト確定が目的。
//   恒久ルール：TOP_SAFE、カード型＋やわ影、連結ツリー。
// ═══════════════════════════════════════════════════════════════════
const C = {
  bg: "#FCFBF7", ink: "#1F3A5F", sub: "#5B6B7F",
  orange: "#E8912D", red: "#E0483B", green: "#2E9E6B",
  blue: "#3B7DD8", gold: "#E0A72E", gray: "#AEB8C2", line: "#C9D2DD",
  blueBg: "#E7F0FB", greenBg: "#E4F3EC", redBg: "#FCE6E3", goldBg: "#FBF1D9",
};
const TOP_SAFE = 130;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const NISA_DESIGN_FRAMES = 120;

const Bg: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.bg }}>
    <AbsoluteFill style={{ background: "radial-gradient(1200px 1200px at 50% -10%, #FFFFFF 0%, rgba(255,255,255,0) 60%)" }} />
  </AbsoluteFill>
);

const Pop: React.FC<{ at?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at = 0, children, style }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - at, fps, config: { damping: 13, stiffness: 150, mass: 0.8 }, durationInFrames: 14 });
  return <div style={{ opacity: Math.min(1, s * 1.5), transform: `translateY(${(1 - Math.min(1, s)) * 14}px)`, ...style }}>{children}</div>;
};

const Head: React.FC<{ kicker: string; title: React.ReactNode; kc?: string }> = ({ kicker, title, kc = C.blue }) => (
  <div style={{ textAlign: "center", padding: "0 48px" }}>
    <div style={{ display: "inline-block", background: kc, color: "#fff", fontWeight: 800, fontSize: 34, padding: "8px 26px", borderRadius: 999, boxShadow: "0 8px 18px rgba(0,0,0,0.14)" }}>{kicker}</div>
    <div style={{ marginTop: 16, fontWeight: 900, fontSize: 56, lineHeight: 1.22, color: C.ink, letterSpacing: 0.5 }}>{title}</div>
  </div>
);

// ───────── P1 フック ─────────
const PageHook: React.FC = () => (
  <div style={{ paddingTop: 150, textAlign: "center", padding: "150px 56px 0" }}>
    <Pop at={0}>
      <div style={{ display: "inline-block", background: C.red, color: "#fff", fontWeight: 900, fontSize: 36, padding: "10px 28px", borderRadius: 999, boxShadow: "0 10px 22px rgba(224,72,59,0.3)" }}>⚠ 知らないと損</div>
    </Pop>
    <Pop at={4}>
      <div style={{ marginTop: 34, fontWeight: 900, fontSize: 92, lineHeight: 1.18, color: C.ink }}>夫が亡くなったら<br />新NISAは<br /><span style={{ color: C.blue }}>どうなる？</span></div>
    </Pop>
    <Pop at={10}>
      <div style={{ marginTop: 44, display: "inline-block", background: "#fff", border: `3px solid ${C.gold}`, borderRadius: 24, padding: "22px 30px", boxShadow: "0 12px 26px rgba(31,58,95,0.12)" }}>
        <div style={{ fontWeight: 900, fontSize: 44, color: C.ink, lineHeight: 1.3 }}>「NISAだから<br />相続も<span style={{ color: C.red }}>非課税</span>」</div>
        <div style={{ marginTop: 10, fontWeight: 900, fontSize: 50, color: C.red }}>…は、勘違い</div>
      </div>
    </Pop>
    <Pop at={16}>
      <div style={{ marginTop: 40, fontWeight: 800, fontSize: 34, color: C.sub }}>損したくない人は、最後まで見て</div>
    </Pop>
  </div>
);

// ───────── P2 手続きの流れ（6ステップ縦ツリー）＋動かせない帯 ─────────
const FlowNode: React.FC<{ no: number | string; title: string; sub: string; color: string; bg?: string }> = ({ no, title, sub, color, bg = "#fff" }) => (
  <div style={{ width: 720, background: bg, borderRadius: 18, boxShadow: "0 8px 18px rgba(31,58,95,0.10)", border: `2px solid ${C.line}`, padding: "12px 20px", display: "flex", alignItems: "center", gap: 16 }}>
    <div style={{ flexShrink: 0, width: 48, height: 48, borderRadius: "50%", background: color, color: "#fff", fontWeight: 900, fontSize: 26, display: "flex", alignItems: "center", justifyContent: "center" }}>{no}</div>
    <div style={{ textAlign: "left" }}>
      <div style={{ fontWeight: 900, fontSize: 33, color: C.ink, lineHeight: 1.15 }}>{title}</div>
      <div style={{ fontWeight: 700, fontSize: 22, color: C.sub, marginTop: 1 }}>{sub}</div>
    </div>
  </div>
);
const Conn: React.FC<{ color?: string }> = ({ color = C.gray }) => <div style={{ width: 5, height: 16, background: color, borderRadius: 3, margin: "4px auto" }} />;

const PageFlow: React.FC = () => (
  <div style={{ paddingTop: 36 }}>
    <Head kicker="全体像" title={<>NISAの相続、<span style={{ color: C.blue }}>手続きの流れ</span></>} />
    <div style={{ position: "relative", marginTop: 20, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ position: "absolute", right: 20, top: 100, bottom: 96, width: 78, background: C.redBg, border: `2px solid ${C.red}`, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ writingMode: "vertical-rl", fontWeight: 900, fontSize: 28, color: C.red, letterSpacing: 3 }}>この間ずっと動かせない</div>
      </div>
      <Pop at={0}><FlowNode no={1} title="金融機関へ連絡" sub="死亡後すみやかに／口座が凍結" color={C.red} /></Pop>
      <Conn />
      <Pop at={3}><FlowNode no={2} title="死亡届出書を提出" sub="非課税口座開設者死亡届出書 ※市区町村の届とは別" color={C.blue} /></Pop>
      <Conn />
      <Pop at={6}><FlowNode no={3} title="保有資産を確認" sub="株・投信・預り金／残高証明書" color={C.blue} /></Pop>
      <Conn />
      <Pop at={9}><FlowNode no={4} title="引き継ぐ人を決定" sub="遺言 または 相続人全員で協議" color={C.blue} /></Pop>
      <Conn />
      <Pop at={12}><FlowNode no={5} title="受取口座・必要書類を準備" sub="戸籍・遺産分割協議書 ※金融機関で異なる" color={C.blue} /></Pop>
      <Conn />
      <Pop at={15}><FlowNode no={6} title="相続人の課税口座へ移管" sub="特定／一般口座へ（NISA枠は引き継げない）" color={C.green} bg={C.greenBg} /></Pop>
    </div>
  </div>
);

// ───────── P3 結論（口座✕ / 商品〇） ─────────
const PageConc: React.FC = () => (
  <div style={{ paddingTop: 40 }}>
    <Head kicker="結論" title={<>非課税は<span style={{ color: C.red }}>「亡くなった日」</span>で終了</>} kc={C.red} />
    <Pop at={4} style={{ marginTop: 30, display: "flex", justifyContent: "center" }}>
      <div style={{ width: 300, background: "#fff", border: `2px solid ${C.line}`, borderRadius: 22, padding: "24px 0", textAlign: "center", boxShadow: "0 10px 22px rgba(31,58,95,0.1)" }}>
        <div style={{ fontSize: 70 }}>📄</div>
        <div style={{ fontWeight: 900, fontSize: 36, color: C.ink, marginTop: 6 }}>亡くなった人の<br />NISA口座</div>
      </div>
    </Pop>
    <div style={{ display: "flex", justifyContent: "center", gap: 36, marginTop: 24, padding: "0 48px" }}>
      <Pop at={10}>
        <div style={{ width: 420, background: C.redBg, border: `3px solid ${C.red}`, borderRadius: 22, padding: "22px 24px", textAlign: "center" }}>
          <div style={{ fontWeight: 900, fontSize: 44, color: C.red }}>✕ 口座</div>
          <div style={{ fontWeight: 800, fontSize: 30, color: C.ink, marginTop: 8, lineHeight: 1.3 }}>NISAの“口座”は<br />そのまま継げない</div>
        </div>
      </Pop>
      <Pop at={14}>
        <div style={{ width: 420, background: C.greenBg, border: `3px solid ${C.green}`, borderRadius: 22, padding: "22px 24px", textAlign: "center" }}>
          <div style={{ fontWeight: 900, fontSize: 44, color: C.green }}>〇 商品</div>
          <div style={{ fontWeight: 800, fontSize: 30, color: C.ink, marginTop: 8, lineHeight: 1.3 }}>中の株・投信は<br />相続できる</div>
        </div>
      </Pop>
    </div>
    <Pop at={18} style={{ marginTop: 26, display: "flex", justifyContent: "center" }}>
      <div style={{ background: C.ink, color: "#fff", fontWeight: 900, fontSize: 34, padding: "16px 34px", borderRadius: 18, textAlign: "center" }}>ただし移る先は “普通の課税口座”</div>
    </Pop>
  </div>
);

// ───────── P4 カギ（取得価額・損益対比・山場） ─────────
const Step: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
  <div style={{ textAlign: "center" }}>
    <div style={{ fontWeight: 700, fontSize: 24, color: C.sub }}>{label}</div>
    <div style={{ fontWeight: 900, fontSize: 44, color, lineHeight: 1.1 }}>{value}</div>
  </div>
);
const Arrow: React.FC = () => <div style={{ fontWeight: 900, fontSize: 40, color: C.gray }}>→</div>;

const PagePrice: React.FC = () => (
  <div style={{ paddingTop: 40 }}>
    <Head kicker="一番のカギ" title={<>引き継ぐ値段が<br /><span style={{ color: C.red }}>“亡くなった日”</span>に変わる</>} kc={C.red} />
    <Pop at={6} style={{ marginTop: 30, display: "flex", justifyContent: "center" }}>
      <div style={{ width: 880, background: "#fff", border: `3px solid ${C.red}`, borderRadius: 26, boxShadow: "0 14px 30px rgba(224,72,59,0.18)", padding: "22px 28px 26px" }}>
        <div style={{ display: "inline-block", background: C.red, color: "#fff", fontWeight: 800, fontSize: 28, padding: "6px 20px", borderRadius: 999 }}>損したパターン</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20, padding: "0 6px" }}>
          <Step label="買ったとき" value="100万" color={C.ink} />
          <Arrow />
          <Step label="亡くなった日" value="40万" color={C.red} />
          <Arrow />
          <Step label="戻して売る" value="100万" color={C.ink} />
        </div>
        <div style={{ marginTop: 20, textAlign: "center", background: C.redBg, borderRadius: 16, padding: "16px 0" }}>
          <span style={{ fontWeight: 800, fontSize: 30, color: C.ink }}>戻っただけなのに </span>
          <span style={{ fontWeight: 900, fontSize: 56, color: C.red }}>約12万円</span>
          <span style={{ fontWeight: 800, fontSize: 30, color: C.ink }}> 課税</span>
          <div style={{ fontWeight: 700, fontSize: 22, color: C.sub, marginTop: 4 }}>※損（60万）は「なかったこと」に／60万×20.315%の概算</div>
        </div>
      </div>
    </Pop>
    <Pop at={12} style={{ marginTop: 20, display: "flex", justifyContent: "center" }}>
      <div style={{ width: 880, background: C.greenBg, border: `2px solid ${C.green}`, borderRadius: 22, padding: "16px 28px", display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
        <span style={{ fontWeight: 800, fontSize: 28, color: C.green }}>逆に増えてたら得 ▶</span>
        <span style={{ fontWeight: 900, fontSize: 34, color: C.ink }}>300万→500万 の利益200万は</span>
        <span style={{ fontWeight: 900, fontSize: 36, color: C.green }}>非課税</span>
      </div>
    </Pop>
  </div>
);

// ───────── P5 やること3つ ─────────
const TodoCard: React.FC<{ no: number; emoji: string; title: React.ReactNode }> = ({ no, emoji, title }) => (
  <div style={{ width: 880, background: "#fff", borderRadius: 24, boxShadow: "0 10px 24px rgba(31,58,95,0.12)", border: `2px solid ${C.line}`, padding: "22px 28px", display: "flex", alignItems: "center", gap: 22 }}>
    <div style={{ flexShrink: 0, width: 72, height: 72, borderRadius: "50%", background: C.green, color: "#fff", fontWeight: 900, fontSize: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>{no}</div>
    <div style={{ fontSize: 56 }}>{emoji}</div>
    <div style={{ fontWeight: 900, fontSize: 38, color: C.ink, textAlign: "left", lineHeight: 1.25 }}>{title}</div>
  </div>
);
const PageTodo: React.FC = () => (
  <div style={{ paddingTop: 40 }}>
    <Head kicker="元気なうちに" title={<>やることは、<span style={{ color: C.green }}>3つ</span></>} kc={C.green} />
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22, marginTop: 34 }}>
      <Pop at={2}><TodoCard no={1} emoji="🗣️" title={<>どの金融機関に口座があるか<br />家族に伝えておく</>} /></Pop>
      <Pop at={6}><TodoCard no={2} emoji="🏦" title={<>夫婦で同じ金融機関に<br />口座を作っておく</>} /></Pop>
      <Pop at={10}><TodoCard no={3} emoji="🧭" title={<>継いだあと「持つ／売る」の<br />方針を話しておく</>} /></Pop>
    </div>
  </div>
);

// ───────── P6 CTA ─────────
const PageCTA: React.FC = () => (
  <div style={{ paddingTop: 120, textAlign: "center", padding: "120px 56px 0" }}>
    <Pop at={0}><div style={{ fontWeight: 900, fontSize: 54, color: C.ink, lineHeight: 1.3 }}>増やす“入口”より<br /><span style={{ color: C.blue }}>“出口”</span>が大事</div></Pop>
    <Pop at={6}>
      <div style={{ marginTop: 40, background: "#fff", border: `3px solid ${C.blue}`, borderRadius: 26, padding: "28px 30px", boxShadow: "0 12px 26px rgba(31,58,95,0.12)" }}>
        <div style={{ fontWeight: 900, fontSize: 40, color: C.ink, lineHeight: 1.3 }}>「亡くなったときに<br />やることリスト」作りました</div>
        <div style={{ marginTop: 20, display: "inline-block", background: C.green, color: "#fff", fontWeight: 900, fontSize: 46, padding: "16px 40px", borderRadius: 999, boxShadow: "0 10px 24px rgba(46,158,107,0.35)" }}>DMで「守る」</div>
      </div>
    </Pop>
    <Pop at={12}><div style={{ marginTop: 36, fontWeight: 800, fontSize: 36, color: C.sub }}>🔖 見返せるように保存も</div></Pop>
  </div>
);

const PAGES: Record<number, React.FC> = { 1: PageHook, 2: PageFlow, 3: PageConc, 4: PagePrice, 5: PageTodo, 6: PageCTA };

export const NisaSozokuDesign: React.FC<{ page?: number }> = ({ page = 2 }) => {
  const P = PAGES[page] ?? PageFlow;
  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <Bg />
      <AbsoluteFill style={{ transform: `translateY(${TOP_SAFE}px)` }}>
        <P />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
