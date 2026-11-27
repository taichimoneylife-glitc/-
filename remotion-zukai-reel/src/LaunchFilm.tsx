import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { CountUp } from "./components/kit";
import { FONT } from "./components/font";

// ══════════════════════════════════════════════════════════
//  Opus 5.5 ローンチフィルム「完コピ」試作（非公式ファンメイド風）
//  参考：SEIIIRU氏 (Claude Opus5.5 × Higgsfield × After Effects) の30秒プロモを
//  Remotionで再現。キネティックタイポ＋データカード＋データビジュアル。
//  ※イラスト/写真は簡易プレースホルダ（後で外部AI画像に差し替え可）。
//  1080x1920 / 30fps / 900f(30s)。
// ══════════════════════════════════════════════════════════

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const LAUNCH_FRAMES = 900;

const L = {
  cream: "#F0EAD9", creamAlt: "#F5F0E2", ink: "#1A1712", coral: "#E4572E", coralDk: "#C6431E",
  blue: "#4A90D9", olive: "#7B8B4E", gold: "#E1A93A", gray: "#9A927F", card: "#FFFFFF", dark: "#17130E",
};

const useSp = (delay: number, dur = 18, cfg: any = { damping: 13, stiffness: 130, mass: 0.8 }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  return spring({ frame: f - delay, fps, config: cfg, durationInFrames: dur });
};

// 生成り＋方眼の背景
const Grid: React.FC<{ bg?: string }> = ({ bg = L.cream }) => (
  <AbsoluteFill style={{ background: bg }}>
    <AbsoluteFill style={{ backgroundImage: `repeating-linear-gradient(0deg, transparent 0 63px, rgba(0,0,0,0.045) 63px 64px), repeating-linear-gradient(90deg, transparent 0 63px, rgba(0,0,0,0.045) 63px 64px)` }} />
  </AbsoluteFill>
);

// 上下のチェッカー帯
const Checker: React.FC<{ y: number; color?: string }> = ({ y, color = L.coral }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: y, height: 26, backgroundImage: `repeating-linear-gradient(90deg, ${color} 0 26px, transparent 26px 52px)` }} />
);

// 上下の共通クローム（LAUNCH FILM / ページ番号 / RELEASE）
const Chrome: React.FC<{ page: number }> = ({ page }) => {
  const f = useCurrentFrame();
  const dot = interpolate(f % 90, [0, 90], [200, 880], clamp);
  return (
    <>
      <div style={{ position: "absolute", left: 60, top: 88, right: 60, display: "flex", justifyContent: "space-between", fontFamily: FONT, fontSize: 22, fontWeight: 700, letterSpacing: 3, color: L.ink }}>
        <span>CLAUDE OPUS 5.5 — LAUNCH FILM</span><span>{String(page).padStart(2, "0")} / 13</span>
      </div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 128, height: 2, background: "rgba(0,0,0,0.18)" }} />
      <div style={{ position: "absolute", left: dot, top: 123, width: 12, height: 12, borderRadius: "50%", background: L.coral }} />
      <div style={{ position: "absolute", left: 60, bottom: 70, right: 60, display: "flex", justifyContent: "space-between", fontFamily: FONT, fontSize: 21, fontWeight: 700, letterSpacing: 3, color: L.gray }}>
        <span>2026.09.22 RELEASE</span><span>UNOFFICIAL FAN FILM</span>
      </div>
    </>
  );
};

// 黒い強調ボックス（「はやい。」風）
const Emph: React.FC<{ delay: number; children: React.ReactNode; color?: string; size?: number; rot?: number; style?: React.CSSProperties }> = ({ delay, children, color = "#fff", size = 96, rot = -2, style }) => {
  const s = useSp(delay);
  return (
    <div style={{ display: "inline-block", background: L.ink, color, fontFamily: FONT, fontWeight: 900, fontSize: size, padding: "8px 30px", borderRadius: 18, transform: `rotate(${rot}deg) scale(${Math.min(1, s)})`, opacity: Math.min(1, s * 1.6), boxShadow: "0 14px 30px rgba(0,0,0,0.25)", ...style }}>{children}</div>
  );
};

// フライアップ・ワード
const Word: React.FC<{ delay: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ delay, children, style }) => {
  const s = useSp(delay, 16);
  return <span style={{ display: "inline-block", transform: `translateY(${(1 - Math.min(1, s)) * 40}px)`, opacity: Math.min(1, s * 1.6), ...style }}>{children}</span>;
};

// 簡易フラットイラスト：ノートPCの人（プレースホルダ）
const PersonLaptop: React.FC<{ delay: number; cheer?: boolean; color?: string }> = ({ delay, cheer, color = L.coral }) => {
  const s = useSp(delay, 20);
  const f = useCurrentFrame();
  const arm = cheer ? -1.1 : 0.2;
  const bob = Math.sin(f * 0.15) * 6;
  return (
    <div style={{ transform: `translateY(${(1 - Math.min(1, s)) * 40 + bob}px) scale(${Math.min(1, s)})`, opacity: Math.min(1, s * 1.6) }}>
      <svg width="360" height="360" viewBox="0 0 360 360">
        {/* 体 */}
        <path d="M110 300 Q110 210 180 210 Q250 210 250 300 Z" fill={color} />
        {/* 腕 */}
        <g transform={`rotate(${arm * 30} 130 250)`}><rect x="96" y="240" width="34" height="90" rx="16" fill={color} /></g>
        <g transform={`rotate(${-arm * 30} 230 250)`}><rect x="230" y="240" width="34" height="90" rx="16" fill={color} /></g>
        {/* 首・頭 */}
        <rect x="168" y="180" width="24" height="30" fill="#F2C9A0" />
        <circle cx="180" cy="150" r="42" fill="#F2C9A0" />
        <path d="M138 148 Q138 100 180 100 Q222 100 222 148 Q222 120 180 120 Q138 120 138 148Z" fill="#3A2A1E" />
        {/* メガネ */}
        <circle cx="166" cy="150" r="12" fill="none" stroke="#2A2018" strokeWidth="3" />
        <circle cx="196" cy="150" r="12" fill="none" stroke="#2A2018" strokeWidth="3" />
        {/* ノートPC */}
        {!cheer && <><rect x="120" y="300" width="120" height="16" rx="4" fill={L.ink} /><rect x="134" y="262" width="92" height="42" rx="4" fill={L.ink} /></>}
      </svg>
    </div>
  );
};

// ══ シーン ══

// 01 イントロ（コーラル背景・傾いたカード）
const S01: React.FC = () => {
  const f = useCurrentFrame();
  const r = interpolate(f, [0, 60], [-14, -6], clamp);
  return (
    <AbsoluteFill style={{ background: L.coral, alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      {[0, 1, 2].map((i) => {
        const s = useSp(i * 6, 20);
        return <div key={i} style={{ position: "absolute", width: 360, height: 480, background: i === 2 ? L.cream : "rgba(255,255,255,0.25)", border: "6px dashed rgba(255,255,255,0.8)", borderRadius: 20, transform: `rotate(${r + i * 8 - 8}deg) translateY(${(1 - Math.min(1, s)) * 60}px) scale(${Math.min(1, s)})`, opacity: Math.min(1, s * 1.6) }} />;
      })}
      <div style={{ position: "relative", fontFamily: FONT, fontWeight: 900, fontSize: 150, color: L.ink, transform: `scale(${Math.min(1, useSp(16, 20))})` }}>★</div>
    </AbsoluteFill>
  );
};

// 02 Opus（暗い放射バースト）
const S02: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, #3a2a20, #17130E 70%)", alignItems: "center", justifyContent: "center" }}>
      <svg width="1080" height="1920" style={{ position: "absolute", opacity: 0.5 }}>
        <g transform={`rotate(${f * 0.3} 540 860)`}>
          {Array.from({ length: 36 }).map((_, i) => <path key={i} d="M540 860 L560 -200 L520 -200 Z" fill={i % 2 ? "rgba(228,87,46,0.25)" : "transparent"} transform={`rotate(${i * 10} 540 860)`} />)}
        </g>
      </svg>
      <div style={{ fontFamily: "Georgia, serif", fontWeight: 900, fontSize: 220, color: "#F0EAD9", transform: `scale(${0.8 + 0.2 * Math.min(1, useSp(4, 22))})`, opacity: Math.min(1, useSp(4) * 1.6), textShadow: "0 10px 40px rgba(0,0,0,0.5)" }}>Opus</div>
      <div style={{ position: "absolute", bottom: 700, fontFamily: FONT, fontSize: 40, fontWeight: 800, color: L.coral, letterSpacing: 8, opacity: Math.min(1, useSp(24) * 1.6) }}>5.5</div>
    </AbsoluteFill>
  );
};

// 03 Fable 5.1級。
const S03: React.FC = () => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
    <Grid />
    <Checker y={360} /><Checker y={1500} />
    <div style={{ position: "relative", textAlign: "center", fontFamily: FONT }}>
      <div style={{ fontSize: 60, fontWeight: 800, color: L.ink }}><Word delay={4}>ほとんどの仕事で</Word></div>
      <div style={{ fontSize: 170, fontWeight: 900, color: L.ink, margin: "10px 0", fontFamily: "Georgia, serif" }}><Word delay={14}>Fable 5.1</Word></div>
      <div style={{ marginTop: 10 }}><Emph delay={30} color={L.cream} size={120} rot={-3}>級。</Emph></div>
    </div>
  </AbsoluteFill>
);

// 04 コードも、安く。（ダッシュボード寄せ）
const S04: React.FC = () => (
  <AbsoluteFill>
    <Grid />
    <div style={{ position: "absolute", inset: "320px 60px 360px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, opacity: 0.9 }}>
      {[
        { t: "月次レポート", v: "+24%", c: L.coral }, { t: "DASHBOARD", v: "98.2", c: L.ink },
        { t: "Active users", v: "▲", c: L.blue }, { t: "ワークフロー", v: "◱", c: L.olive },
      ].map((k, i) => {
        const s = useSp(i * 5, 16);
        return <div key={i} style={{ background: L.card, borderRadius: 20, padding: 26, boxShadow: "0 10px 24px rgba(80,60,20,0.1)", transform: `scale(${Math.min(1, s)})`, opacity: Math.min(1, s * 1.6), fontFamily: FONT }}>
          <div style={{ fontSize: 26, color: L.gray, fontWeight: 700 }}>{k.t}</div>
          <div style={{ fontSize: 72, fontWeight: 900, color: k.c }}>{k.v}</div>
          <div style={{ height: 12, borderRadius: 8, background: "#EFE7CE", marginTop: 12 }}><div style={{ width: `${40 + i * 15}%`, height: 12, borderRadius: 8, background: k.c }} /></div>
        </div>;
      })}
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 760, textAlign: "center", fontFamily: FONT }}>
      <Emph delay={20} color={L.cream} size={110}>コードも、<span style={{ color: L.coral }}>安く。</span></Emph>
    </div>
  </AbsoluteFill>
);

// 05 68万行のコード移行（イラスト）
const S05: React.FC = () => (
  <AbsoluteFill style={{ background: "#22303f" }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", fontFamily: FONT }}>
      <div style={{ fontSize: 90, fontWeight: 900, color: L.cream }}><Word delay={4}>68万行の</Word></div>
      <div style={{ marginTop: 8 }}><Emph delay={16} color={L.cream} size={100}>コード移行。</Emph></div>
      <div style={{ marginTop: 20, fontSize: 40, fontWeight: 800, color: "#cfe0ea" }}><Word delay={30}>エンジニアチームなら<span style={{ color: L.coral }}>"数週間"</span></Word></div>
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 340, display: "flex", justifyContent: "center" }}><PersonLaptop delay={20} color={L.blue} /></div>
  </AbsoluteFill>
);

// 06 Opus5.5に（プロンプトカード）
const S06: React.FC = () => (
  <AbsoluteFill style={{ background: "#0f0c08" }}>
    <div style={{ position: "absolute", left: 70, top: 360, fontFamily: FONT, fontSize: 84, fontWeight: 900, color: L.cream }}><Word delay={4}>Opus 5.5</Word><span style={{ color: L.coral }}>に</span></div>
    <div style={{ position: "absolute", left: 70, right: 70, top: 560, background: "#1c1710", border: "1px solid #3a3226", borderRadius: 22, padding: 36, transform: `scale(${Math.min(1, useSp(18, 18))})`, opacity: Math.min(1, useSp(18) * 1.6) }}>
      <div style={{ fontFamily: FONT, fontSize: 30, color: L.gray }}>📁 legacy-monorepo/ &nbsp;680,000行</div>
      <div style={{ fontFamily: FONT, fontSize: 64, fontWeight: 900, color: "#fff", margin: "20px 0" }}>68万行を移行して<span style={{ opacity: (useCurrentFrame() % 20 < 10) ? 1 : 0 }}>|</span></div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: FONT, fontSize: 28, color: L.gray }}>+ &nbsp; Opus 5.5</span>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: L.coral, color: "#fff", fontSize: 34, display: "flex", alignItems: "center", justifyContent: "center" }}>↑</div>
      </div>
    </div>
  </AbsoluteFill>
);

// 07 672,636行を移行中…（ピクセルグリッド）
const S07: React.FC = () => {
  const f = useCurrentFrame();
  const pct = Math.min(99, Math.round(interpolate(f, [10, 60], [0, 99], clamp)));
  const cells = 15 * 20;
  const lit = Math.floor((pct / 100) * cells);
  return (
    <AbsoluteFill style={{ background: "#0f0c08" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 380, textAlign: "center", fontFamily: FONT }}>
        <div style={{ fontSize: 130, fontWeight: 900, color: "#fff" }}><CountUp delay={10} to={672636} dur={50} /></div>
        <div style={{ fontSize: 44, fontWeight: 800, color: L.coral, marginTop: 4 }}>行を移行中…</div>
      </div>
      <div style={{ position: "absolute", left: 90, right: 90, top: 740, display: "grid", gridTemplateColumns: "repeat(20, 1fr)", gap: 6 }}>
        {Array.from({ length: cells }).map((_, i) => <div key={i} style={{ paddingBottom: "100%", background: i < lit ? (Math.random() > 0.85 ? "#fff" : L.coral) : "#221c14", borderRadius: 3 }} />)}
      </div>
      <div style={{ position: "absolute", right: 90, top: 1180, fontFamily: FONT, fontSize: 40, fontWeight: 900, color: "#fff" }}>{pct}%</div>
    </AbsoluteFill>
  );
};

// 08 移行完了（歓喜イラスト＋紙吹雪）
const S08: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 60%, #f6e3c8, #ecd9b8)" }}>
      <svg width="1080" height="1920" style={{ position: "absolute", opacity: 0.5 }}><g transform={`rotate(${f * 0.4} 540 1100)`}>{Array.from({ length: 28 }).map((_, i) => <path key={i} d="M540 1100 L556 200 L524 200 Z" fill={i % 2 ? "rgba(228,87,46,0.18)" : "transparent"} transform={`rotate(${i * 12.8} 540 1100)`} />)}</g></svg>
      {Array.from({ length: 40 }).map((_, i) => {
        const x = (i * 137) % 1080; const y = ((f * (4 + (i % 5)) + i * 60) % 1400) + 200;
        const cols = [L.coral, L.blue, L.gold, L.olive];
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: 16, height: 22, background: cols[i % 4], transform: `rotate(${f * 6 + i * 30}deg)` }} />;
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: 360, textAlign: "center", fontFamily: FONT }}>
        <Emph delay={4} color={L.cream} size={96}>移行完了。</Emph>
        <div style={{ marginTop: 20, fontSize: 44, fontWeight: 800, color: L.ink, opacity: Math.min(1, useSp(24) * 1.6) }}>専門用語も、しっかり読み進めて。</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 380, display: "flex", justifyContent: "center" }}><PersonLaptop delay={10} cheer color={L.coral} /></div>
    </AbsoluteFill>
  );
};

// 09 API料金も、値下げ。
const PriceRow: React.FC<{ delay: number; icon: string; jp: string; en: string; old: string; now: string; badge: string; c: string; barW: number }> = ({ delay, icon, jp, en, old, now, badge, c, barW }) => {
  const s = useSp(delay, 16);
  return (
    <div style={{ background: L.card, borderRadius: 26, padding: "26px 30px", boxShadow: "0 10px 24px rgba(80,60,20,0.12)", position: "relative", transform: `scale(${Math.min(1, s)})`, opacity: Math.min(1, s * 1.6) }}>
      <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
        <div style={{ width: 88, height: 88, borderRadius: "50%", background: c, color: "#fff", fontSize: 44, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 42, fontWeight: 900, color: L.ink }}>{jp}</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: L.gray, letterSpacing: 2 }}>{en}</div>
        </div>
        <div style={{ fontSize: 40, fontWeight: 800, color: L.gray, textDecoration: "line-through", marginRight: 10 }}>{old}</div>
        <div style={{ fontSize: 30, color: L.gray, marginRight: 10 }}>→</div>
        <div style={{ fontSize: 76, fontWeight: 900, color: L.ink }}>{now}</div>
      </div>
      <div style={{ height: 12, borderRadius: 8, background: "#EFE7CE", marginTop: 18 }}><div style={{ width: `${barW}%`, height: 12, borderRadius: 8, background: c }} /></div>
      <div style={{ position: "absolute", right: -10, top: -18, background: L.coral, color: "#fff", fontFamily: FONT, fontWeight: 900, fontSize: 30, padding: "6px 18px", borderRadius: 999, transform: "rotate(6deg)" }}>{badge}</div>
    </div>
  );
};
const S09: React.FC = () => {
  const f = useCurrentFrame();
  const ring = interpolate(f, [40, 80], [0, 0.4], clamp);
  return (
    <AbsoluteFill>
      <Grid />
      <div style={{ position: "absolute", left: 60, top: 200, fontFamily: FONT, fontSize: 30, fontWeight: 800, color: L.gray, letterSpacing: 4 }}>API PRICING — PER 1M TOKENS ↓</div>
      <div style={{ position: "absolute", left: 54, top: 250, fontFamily: FONT, fontSize: 104, fontWeight: 900, color: L.ink }}>API料金も、<Emph delay={10} color={L.cream} size={104} rot={-2}>値下げ</Emph>。</div>
      <div style={{ position: "absolute", left: 54, right: 54, top: 470, display: "flex", flexDirection: "column", gap: 22 }}>
        <PriceRow delay={20} icon="→" jp="入力" en="INPUT" old="$5" now="$4" badge="-20%" c={L.blue} barW={80} />
        <PriceRow delay={30} icon="↦" jp="出力" en="OUTPUT" old="$25" now="$20" badge="-20%" c={L.coral} barW={80} />
        <PriceRow delay={40} icon="≡" jp="キャッシュ読込" en="CACHE READ" old="$0.50" now="$0.20" badge="-60%" c={L.olive} barW={40} />
      </div>
      <div style={{ position: "absolute", left: 54, right: 54, top: 1120, background: L.dark, borderRadius: 26, padding: "34px 30px", display: "flex", alignItems: "center", gap: 30, transform: `scale(${Math.min(1, useSp(50, 16))})`, opacity: Math.min(1, useSp(50) * 1.6) }}>
        <svg width="150" height="150"><circle cx="75" cy="75" r="58" fill="none" stroke="#3a352c" strokeWidth="20" /><circle cx="75" cy="75" r="58" fill="none" stroke={L.coral} strokeWidth="20" strokeDasharray={2 * Math.PI * 58} strokeDashoffset={2 * Math.PI * 58 * (1 - ring)} transform="rotate(-90 75 75)" strokeLinecap="round" /></svg>
        <div style={{ fontFamily: FONT, color: "#fff" }}>
          <div style={{ fontSize: 32, color: "#cbc4b4" }}>一般的なワークロードで</div>
          <div style={{ fontSize: 52, fontWeight: 900 }}>実行コスト <span style={{ color: L.coral }}>約40%</span> 減</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// 10 GDPval（ベンチ棒）
const S10: React.FC = () => {
  const f = useCurrentFrame();
  const w55 = interpolate(f, [20, 60], [0, 100], clamp);
  const w5 = interpolate(f, [30, 70], [0, 9], clamp);
  return (
    <AbsoluteFill style={{ background: L.dark }}>
      <div style={{ position: "absolute", left: 70, top: 320, fontFamily: FONT, fontSize: 70, fontWeight: 900, color: "#fff" }}><Word delay={4}>Opus 5から、</Word><br /><Word delay={14}>ここまで。</Word></div>
      <div style={{ position: "absolute", left: 70, right: 70, top: 620, background: "#1e1a13", borderRadius: 26, padding: 40 }}>
        <div style={{ fontFamily: FONT, fontSize: 30, color: L.gray, fontWeight: 700 }}>GDPval-AA v2.1 ｜ 知的業務（ナレッジワーク）</div>
        <div style={{ marginTop: 30, display: "flex", alignItems: "baseline", gap: 16 }}>
          <span style={{ fontFamily: FONT, fontSize: 130, fontWeight: 900, color: L.coral }}><CountUp delay={20} to={1837} dur={40} /></span>
          <span style={{ fontFamily: FONT, fontSize: 40, fontWeight: 900, color: L.coral }}>Elo</span>
          <span style={{ marginLeft: "auto", fontFamily: FONT, fontSize: 30, color: L.gray }}>Opus 5.5</span>
        </div>
        <div style={{ height: 20, borderRadius: 10, background: "#2b271e", marginTop: 8 }}><div style={{ width: `${w55}%`, height: 20, borderRadius: 10, background: L.coral }} /></div>
        <div style={{ marginTop: 28, display: "flex", justifyContent: "space-between", fontFamily: FONT, fontSize: 30, color: L.gray }}><span>Opus 5</span><span>1708</span></div>
        <div style={{ height: 20, borderRadius: 10, background: "#2b271e", marginTop: 8 }}><div style={{ width: `${w5 + 78}%`, height: 20, borderRadius: 10, background: L.gray }} /></div>
      </div>
    </AbsoluteFill>
  );
};

// 11/12 はやい。/ かしこい♪（チェッカー＋写真プレースホルダ）
const PhotoWall: React.FC = () => (
  <>
    {[{ x: 90, y: 260, r: -6 }, { x: 600, y: 320, r: 5 }, { x: 120, y: 1180, r: 4 }, { x: 560, y: 1120, r: -5 }].map((p, i) => {
      const s = useSp(i * 4, 16);
      return <div key={i} style={{ position: "absolute", left: p.x, top: p.y, width: 360, height: 420, background: "#d9d2c0", border: "12px solid #fff", borderRadius: 8, boxShadow: "0 14px 30px rgba(0,0,0,0.25)", transform: `rotate(${p.r}deg) scale(${Math.min(1, s)})`, opacity: Math.min(1, s * 1.6), display: "flex", alignItems: "center", justifyContent: "center", color: "#8a8270", fontFamily: FONT, fontSize: 26 }}>写真</div>;
    })}
  </>
);
const S11: React.FC = () => (
  <AbsoluteFill style={{ background: L.coral }}>
    <AbsoluteFill style={{ backgroundImage: `repeating-conic-gradient(${L.coral} 0% 25%, ${L.coralDk} 0% 50%)`, backgroundSize: "160px 160px", opacity: 0.35 }} />
    <PhotoWall />
    <div style={{ position: "absolute", left: 0, right: 0, top: 800, textAlign: "center" }}><Emph delay={6} color="#fff" size={150} rot={-3}>はやい。</Emph>
      <div style={{ marginTop: 20, fontFamily: FONT, fontSize: 40, fontWeight: 900, color: "#fff", background: L.ink, display: "inline-block", padding: "10px 26px", borderRadius: 14 }}>出力 30%以上 高速</div></div>
  </AbsoluteFill>
);
const S12: React.FC = () => (
  <AbsoluteFill style={{ background: L.creamAlt }}>
    <AbsoluteFill style={{ backgroundImage: `repeating-conic-gradient(#e9e0cb 0% 25%, #f4eedd 0% 50%)`, backgroundSize: "160px 160px" }} />
    <PhotoWall />
    <div style={{ position: "absolute", left: 0, right: 0, top: 800, textAlign: "center" }}><Emph delay={6} color={L.gold} size={140} rot={-2}>かしこい♪</Emph>
      <div style={{ marginTop: 20, fontFamily: FONT, fontSize: 40, fontWeight: 900, color: "#fff", background: L.ink, display: "inline-block", padding: "10px 26px", borderRadius: 14 }}>Fable 5.1級の性能</div></div>
  </AbsoluteFill>
);

// 13 提供開始（フィナーレ）
const S13: React.FC = () => (
  <AbsoluteFill style={{ background: L.cream }}>
    <Checker y={150} /><Checker y={1740} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 320, textAlign: "center", fontFamily: FONT }}>
      <div style={{ fontSize: 54, fontWeight: 800, color: L.ink, opacity: Math.min(1, useSp(2) * 1.6) }}>Claude</div>
      <div style={{ fontFamily: "Georgia, serif", fontSize: 190, fontWeight: 900, color: L.ink, lineHeight: 1, transform: `scale(${Math.min(1, useSp(8, 22))})` }}>Opus 5.5</div>
      <div style={{ marginTop: 16 }}><Emph delay={24} color={L.cream} size={64} rot={-2}>提供開始。</Emph></div>
      <div style={{ marginTop: 18, fontSize: 34, fontWeight: 800, color: L.coral, letterSpacing: 8, opacity: Math.min(1, useSp(34) * 1.6) }}>AVAILABLE NOW</div>
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 300, display: "flex", justifyContent: "center", gap: 10 }}>
      <PersonLaptop delay={30} cheer color={L.olive} /><PersonLaptop delay={36} cheer color={L.coral} /><PersonLaptop delay={42} cheer color={L.blue} />
    </div>
  </AbsoluteFill>
);

const SCENES: { C: React.FC; dur: number }[] = [
  { C: S01, dur: 60 }, { C: S02, dur: 75 }, { C: S03, dur: 75 }, { C: S04, dur: 75 },
  { C: S05, dur: 75 }, { C: S06, dur: 60 }, { C: S07, dur: 75 }, { C: S08, dur: 65 },
  { C: S09, dur: 90 }, { C: S10, dur: 70 }, { C: S11, dur: 60 }, { C: S12, dur: 60 }, { C: S13, dur: 60 },
];

export const LaunchFilm: React.FC = () => {
  let from = 0;
  return (
    <AbsoluteFill style={{ background: L.cream }}>
      {SCENES.map(({ C, dur }, i) => {
        const el = (
          <Sequence key={i} from={from} durationInFrames={dur}>
            <AbsoluteFill><C /><Chrome page={i + 1} /></AbsoluteFill>
          </Sequence>
        );
        from += dur;
        return el;
      })}
    </AbsoluteFill>
  );
};
