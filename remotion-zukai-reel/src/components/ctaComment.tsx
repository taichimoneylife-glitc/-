import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { A2 } from "./kit2";
import { B, GenSlot } from "../MileLifePlan";
import { K, SER, TypeIn } from "./zukaiKit";

// ════════════════════════════════════════════════════════════════════
//  参考③（Claude Codeのセキュリティ5つ・2026-11）の最後「コメントで受け取る」を部品にしたもの
//  元：上半分＝実際に配る資料のカードが下から上へ流れ続ける／下半分＝話している本人／
//      境目にテロップ「プロンプト本体と画面つき解説が欲しい人は」→（オレンジ）「好きな色をコメントして」→「受け取ってください」
//  太一版：本人の実写 → 太一のイラスト（口だけ動く）。カードの中身 → 実際に作った図解スライド → コメント欄 → 公式LINEで届く画面
//  画面の取り決め：横150〜930px（インスタの右のボタンを避ける）、カード 縦300〜960px、テロップ 990〜、太一 1080〜
// ════════════════════════════════════════════════════════════════════

const F = (t: number) => Math.round(t * 30);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const OUT = Easing.bezier(0.16, 1, 0.3, 1);
const INK = A2.ink, RED = A2.red, LINEG = "#06C755";

export type CtaProps = {
  want: string;            // 〇〇が欲しい人は
  keyword: string;         // 「〇〇」とコメント
  title: string;           // 配る資料の名前
  chips: string[];         // 資料の中身（✓つきの札）
  pages: React.ReactNode[]; // 資料のページ（実際に作ったスライドの画像など）
  tLine?: number;          // 公式LINEの画面に切り替える秒
  tComment?: number;       // コメント欄が出る秒
  mouth?: string;          // 口の動き（0/1/2 の文字列）。なければ自動
};

// ── 太一（口だけ動く） ──
const TalkTaichi: React.FC<{ mouth?: string; size: number }> = ({ mouth, size }) => {
  const f = useCurrentFrame();
  const lv = mouth ? mouth.charCodeAt(Math.min(mouth.length - 1, f)) - 48 : (() => { const v = Math.sin(f * 1.3) + Math.sin(f * 0.47 + 1) * 0.8; return Math.floor(f / 40) % 4 === 3 ? 0 : v > 0.7 ? 2 : v > -0.3 ? 1 : 0; })();
  const blink = f % 84 >= 80 && lv === 0;
  const img = blink ? "taichi_blink" : lv >= 2 ? "taichi_talk_open" : lv === 1 ? "taichi_talk_mid" : "taichi_talk_closed";
  return <GenSlot name={img} size={size} />;
};

// ── 資料の表紙（「プレゼント」の札＋題名＋中身の札） ──
const Cover: React.FC<{ title: string; chips: string[] }> = ({ title, chips }) => (
  <div style={{ padding: "34px 36px 26px" }}>
    <span style={{ display: "inline-block", background: RED, color: "#fff", borderRadius: 999, padding: "4px 20px", ...K, fontSize: 24 }}>プレゼント</span>
    <div style={{ ...K, fontSize: 44, color: INK, lineHeight: 1.3, marginTop: 14, whiteSpace: "pre-line" }}>{title}</div>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 18 }}>
      {chips.map((c) => <span key={c} style={{ border: `3px solid ${RED}`, color: INK, borderRadius: 10, padding: "4px 14px", ...B, fontSize: 22, background: "#FFF6F2" }}>✓ {c}</span>)}
    </div>
  </div>
);

// ── 公式LINEの画面（届いたイメージ。ロゴは使わず、緑の見出しと吹き出しだけ） ──
const LineMock: React.FC<{ title: string; at: number }> = ({ title, at }) => {
  const f = useCurrentFrame();
  const d = f - F(at);
  const b1 = interpolate(d, [6, 14], [0, 1], { ...clamp, easing: OUT });
  const b2 = interpolate(d, [16, 24], [0, 1], { ...clamp, easing: OUT });
  const tap = d - 40;
  return (
    <AbsoluteFill style={{ background: "#8CABD9" }}>
      <div style={{ height: 96, background: "#fff", display: "flex", alignItems: "center", gap: 18, padding: "0 28px", borderBottom: "2px solid #E5E5E5" }}>
        <div style={{ width: 60, height: 60, borderRadius: "50%", overflow: "hidden", background: A2.bg }}><GenSlot name="taichi_face_smile" size={60} /></div>
        <div style={{ ...K, fontSize: 30, color: INK }}>たいち <span style={{ color: LINEG, fontSize: 22 }}>公式LINE</span></div>
      </div>
      <div style={{ padding: "26px 26px", display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ alignSelf: "flex-start", maxWidth: 560, background: "#fff", borderRadius: "8px 28px 28px 28px", padding: "18px 24px", ...B, fontSize: 28, color: INK, lineHeight: 1.45, opacity: b1, transform: `translateY(${(1 - b1) * 30}px) scale(${0.9 + 0.1 * b1})`, transformOrigin: "0 0" }}>
          コメントありがとうございます！<br />こちらから受け取れます👇
        </div>
        <div style={{ alignSelf: "flex-start", width: 520, background: "#fff", borderRadius: 24, overflow: "hidden", opacity: b2, transform: `translateY(${(1 - b2) * 30}px) scale(${(0.9 + 0.1 * b2) * (tap > 0 && tap < 8 ? 0.96 : 1)})`, transformOrigin: "0 0", position: "relative" }}>
          <div style={{ height: 150, background: A2.bg, display: "flex", alignItems: "center", justifyContent: "center", ...K, fontSize: 30, color: INK, padding: "0 20px", textAlign: "center", whiteSpace: "pre-line" }}>{title}</div>
          <div style={{ padding: "14px 20px", ...K, fontSize: 26, color: LINEG, textAlign: "center", borderTop: "2px solid #EEE" }}>受け取る ▶</div>
          {tap > 0 && tap < 16 ? <div style={{ position: "absolute", left: 260 - 40, top: 175 - 40, width: 80, height: 80, borderRadius: "50%", border: `5px solid ${LINEG}`, transform: `scale(${0.4 + tap / 8})`, opacity: 1 - tap / 16 }} /> : null}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── インスタのコメント欄（キーワードを打って送る） ──
const CommentBar: React.FC<{ keyword: string; at: number }> = ({ keyword, at }) => {
  const f = useCurrentFrame();
  const d = f - F(at);
  if (d < 0) return null;
  const p = interpolate(d, [0, 9], [0, 1], { ...clamp, easing: OUT });
  const n = Math.min(keyword.length, Math.max(0, Math.floor((d - 8) / 3)));
  const sent = d >= 8 + keyword.length * 3 + 6;
  const sk = sent ? interpolate(d - (8 + keyword.length * 3 + 6), [0, 3, 7], [1, 0.85, 1], clamp) : 1;
  return (
    <div style={{ position: "absolute", left: 24, right: 24, bottom: 24, height: 92, background: "#fff", borderRadius: 999, boxShadow: "0 10px 26px rgba(60,40,10,0.25)", display: "flex", alignItems: "center", gap: 16, padding: "0 16px", transform: `translateY(${(1 - p) * 140}px)`, opacity: p }}>
      <div style={{ width: 62, height: 62, borderRadius: "50%", background: "#E9E2CC" }} />
      <div style={{ flex: 1, ...K, fontSize: 36, color: INK }}>{keyword.slice(0, n)}{!sent && Math.floor(f / 8) % 2 === 0 ? <span style={{ color: "#999" }}>|</span> : null}{n === 0 ? <span style={{ ...B, fontSize: 28, color: "#AAA" }}>コメントを追加…</span> : null}</div>
      <div style={{ background: sent ? "#3897F0" : "#B7D5F5", color: "#fff", borderRadius: 999, padding: "10px 24px", ...K, fontSize: 26, transform: `scale(${sk})` }}>送信</div>
    </div>
  );
};

// ── 本体（at＝この画面が始まる秒） ──
export const CommentCta: React.FC<CtaProps & { at: number }> = ({ at, want, keyword, title, chips, pages, tComment = 1.7, tLine = 3.4, mouth }) => {
  const f = useCurrentFrame();
  const d = f - F(at);
  if (d < 0) return null;
  const cardIn = interpolate(d, [0, 10], [0, 1], { ...clamp, easing: OUT });
  const lineAt = at + tLine;
  // 資料が下から上へ流れ続ける（最初はゆっくり→速く）
  const scroll = interpolate(d, [6, F(tLine)], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) }) * (pages.length * 470);
  const toLine = interpolate(f, [F(lineAt), F(lineAt) + 10], [0, 1], { ...clamp, easing: OUT });
  const caps: [number, React.ReactNode][] = [
    [at, <>{want}が欲しい人は</>],
    [at + tComment, <span style={{ color: RED }}>「{keyword}」とコメントしてね</span>],
    [lineAt, <>公式LINEで受け取ってください</>],
  ];
  const cap = [...caps].reverse().find(([t]) => f >= F(t))!;
  return (
    <AbsoluteFill style={{ background: A2.bg }}>
      {/* 下：太一（話す） */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1060, height: 860, background: `radial-gradient(circle at 50% 30%, #FFF6D6 0, ${A2.bg} 60%)` }} />
      <div style={{ position: "absolute", left: 290, top: 1090, transform: `translateY(${(1 - cardIn) * 80 + Math.sin(f / 9) * 4}px)` }}><TalkTaichi mouth={mouth} size={500} /></div>
      {/* 上：配る資料のカード */}
      <div style={{ position: "absolute", left: 150, top: 300, width: 780, height: 660, borderRadius: 30, overflow: "hidden", background: "#fff", boxShadow: "0 22px 50px rgba(80,60,20,0.22)", transform: `translateY(${(1 - cardIn) * -160}px) scale(${0.92 + 0.08 * cardIn})`, opacity: cardIn }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: -scroll, transform: `translateX(${toLine * -100}%)` }}>
          <Cover title={title} chips={chips} />
          {pages.map((p, i) => <div key={i} style={{ margin: "0 30px 24px", height: 446, borderRadius: 18, overflow: "hidden", border: "2px solid #EEE6CF", background: A2.bg }}>{p}</div>)}
        </div>
        {/* 下の端はふわっと消える */}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 120, background: "linear-gradient(#fff0, #fff)", opacity: 1 - toLine }} />
        <div style={{ position: "absolute", inset: 0, transform: `translateX(${(1 - toLine) * 100}%)` }}>{f >= F(lineAt) ? <LineMock title={title} at={lineAt} /> : null}</div>
        {f < F(lineAt) + 4 ? <CommentBar keyword={keyword} at={at + tComment} /> : null}
      </div>
      {/* テロップ（カードと太一の境目） */}
      <div key={String(cap[0])} style={{ position: "absolute", left: 150, width: 780, top: 992, textAlign: "center", ...K, fontSize: 46, whiteSpace: "nowrap", color: INK, textShadow: `0 0 12px ${A2.bg}, 0 0 4px ${A2.bg}` }}>
        <TypeIn at={F(cap[0])}>{cap[1]}</TypeIn>
      </div>
    </AbsoluteFill>
  );
};

// ── 見本：NISA→債券の締めにつける場合 ──
const DemoPage: React.FC<{ n: number; head: string; children: React.ReactNode }> = ({ n, head, children }) => (
  <div style={{ padding: "26px 30px", height: "100%", boxSizing: "border-box", position: "relative" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}><span style={{ background: RED, color: "#fff", borderRadius: 999, padding: "2px 16px", ...K, fontSize: 22 }}>理由 {n}</span><span style={{ ...K, fontSize: 34, color: INK }}>{head}</span></div>
    <div style={{ marginTop: 18 }}>{children}</div>
  </div>
);
const bars = (vals: number[], c: string) => (
  <div style={{ display: "flex", alignItems: "flex-end", gap: 26, height: 250, padding: "0 30px", borderBottom: `4px solid ${INK}` }}>
    {vals.map((v, i) => <div key={i} style={{ flex: 1, height: v, background: c, borderRadius: "12px 12px 0 0" }} />)}
  </div>
);
export const CTA_DEMO_FRAMES = F(6.2);
export const CommentCtaDemo: React.FC = () => (
  <CommentCta
    at={0}
    want={"図解スライドと計算表"}
    keyword="債券"
    title={"NISA×債券\n組み合わせ方ガイド"}
    chips={["図解スライド12枚", "16年後・30年後の計算表", "注意点まとめ"]}
    pages={[
      <DemoPage key={1} n={1} head="資産分散"><div style={{ display: "flex", gap: 8 }}>{Array.from({ length: 10 }).map((_, i) => <div key={i} style={{ flex: 1, height: 90, borderRadius: 10, background: i < 5 ? "#2E9E6B" : i < 8 ? "#4A8FD6" : "#E9B82E" }} />)}</div><div style={{ ...B, fontSize: 26, marginTop: 14, color: INK }}>株 50% ・ 債券 30% ・ 現金その他 20%</div></DemoPage>,
      <DemoPage key={2} n={2} head="今の高金利"><svg width={660} height={260}><polyline points="0,60 80,90 160,140 240,170 320,200 400,230 460,190 540,110 600,80 660,70" fill="none" stroke="#4A8FD6" strokeWidth={8} /><circle cx={660} cy={70} r={14} fill={RED} /></svg></DemoPage>,
      <DemoPage key={3} n={3} head="将来のお金を見える化">{bars([60, 130, 250], "#4A8FD6")}<div style={{ ...SER, fontSize: 30, color: "#4A8FD6", marginTop: 8 }}>500万 → 約1,091万 → 約2,161万</div></DemoPage>,
    ]}
  />
);
