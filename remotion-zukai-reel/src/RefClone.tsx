import React from "react";
import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { CountUp } from "./components/kit";
import { SfxTrack } from "./components/sfx";
import { FONT } from "./components/font";

// ══════════════════════════════════════════════════════════
//  参考トークリール「完コピ」（Opus5.5が全部編集 / 43.84s）
//  素材：public/refperson.mp4（参考動画そのもの）を土台に、全オーバーレイを再現。
//  学習・再現用。語りのセグメント時刻に同期。
// ══════════════════════════════════════════════════════════

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const REFCLONE_FRAMES = 1315;
const O = "#F5822B", Y = "#FFD64A", G = "#38C06B", B = "#5B9BD5", INK = "#20242C", CREAM = "#F3EFE6", SUB = "#8C8574";
const OUT = "0 3px 0 rgba(0,0,0,0.55), 0 0 12px rgba(0,0,0,0.45)";
const useSp = (d: number, dur = 14, cfg: any = { damping: 13, stiffness: 150, mass: 0.7 }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  return spring({ frame: f - d, fps, config: cfg, durationInFrames: dur });
};
const Pop: React.FC<{ show: number; hide: number; delay?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ show, hide, delay = 0, children, style }) => {
  const f = useCurrentFrame(); const s = useSp(show + delay, 14);
  if (f < show || f >= hide) return null;
  const out = interpolate(f, [hide - 7, hide], [1, 0], clamp);
  const bob = Math.sin((f - show) / 32 * Math.PI * 2) * 3;
  return <div style={{ position: "absolute", opacity: Math.min(1, s * 1.6) * out, transform: `translateY(${(1 - Math.min(1, s)) * 16 + bob}px) scale(${Math.min(1, s)})`, fontFamily: FONT, ...style }}>{children}</div>;
};

// ── テロップ ──
type Run = { t: string; c?: string; box?: boolean };
type T = { f: number; runs: Run[]; big?: boolean; color?: string };
const TELOPS: T[] = [
  { f: 0, runs: [{ t: "みんな" }] },
  { f: 42, runs: [{ t: "Opus 5.5", c: O }] },
  { f: 84, runs: [{ t: "全部編集", box: true }] },
  { f: 126, big: true, color: O, runs: [{ t: "ヤバすぎ" }] },
  { f: 168, runs: [{ t: "最近の私の", }, { t: "投稿", c: Y }] },
  { f: 210, runs: [{ t: "全て", }, { t: "撮影", c: Y }] },
  { f: 252, runs: [{ t: "Claude", c: O }, { t: "にデータを送って" }] },
  { f: 294, runs: [{ t: "自動編集", box: true }, { t: "をしてる" }] },
  { f: 336, runs: [{ t: "ほぼ", }, { t: "毎日", box: true }, { t: "編集に" }] },
  { f: 378, runs: [{ t: "1時間", c: O }, { t: "ぐらい" }] },
  { f: 420, runs: [{ t: "撮影して" }] },
  { f: 462, runs: [{ t: "ご飯", c: Y }, { t: "食べたり" }] },
  { f: 504, runs: [{ t: "ジム", c: Y }, { t: "行ったり" }] },
  { f: 546, runs: [{ t: "出来上がってる", c: G }] },
  { f: 588, runs: [{ t: "個人の発信者の" }] },
  { f: 630, runs: [{ t: "ワークフロー", c: B }, { t: "が変わる" }] },
  { f: 672, runs: [{ t: "いろんな" }] },
  { f: 714, runs: [{ t: "企業", c: O }, { t: "にどんどん" }] },
  { f: 756, big: true, color: G, runs: [{ t: "絶対" }] },
  { f: 798, runs: [{ t: "昨日" }] },
  { f: 840, runs: [{ t: "実績", c: O }, { t: "を出した" }] },
  { f: 882, runs: [{ t: "20分", c: Y }, { t: "にまとめた" }] },
  { f: 924, runs: [{ t: "見たい人は" }] },
  { f: 966, runs: [{ t: "コメント", c: G }, { t: "したら届く" }] },
  { f: 1050, runs: [{ t: "この動画も", }, { t: "8時間", c: Y }, { t: "かけて" }] },
  { f: 1092, runs: [{ t: "全部", }, { t: "自動", box: true }, { t: "で編集してます" }] },
  { f: 1260, big: true, color: O, runs: [{ t: "クオリティ" }] },
];
const Telop: React.FC = () => {
  const f = useCurrentFrame();
  let idx = 0; for (let i = 0; i < TELOPS.length; i++) if (f >= TELOPS[i].f) idx = i;
  const seg = TELOPS[idx]; const end = idx + 1 < TELOPS.length ? TELOPS[idx + 1].f : REFCLONE_FRAMES;
  const s = useSp(seg.f, 9);
  if (f >= end) return null;
  const pop = 0.92 + 0.08 * Math.min(1, s * 1.6);
  if (seg.big) return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 560, textAlign: "center", fontFamily: FONT, transform: `scale(${0.8 + 0.3 * Math.min(1, s)}) rotate(-3deg)`, opacity: Math.min(1, s * 1.6) }}>
      <span style={{ fontSize: 200, fontWeight: 900, color: seg.color, textShadow: OUT }}>{seg.runs[0].t}</span>
    </div>
  );
  return (
    <div style={{ position: "absolute", left: 50, right: 50, top: 1300, textAlign: "center", fontFamily: FONT, transform: `scale(${pop})` }}>
      <div style={{ fontWeight: 900, fontSize: 76, lineHeight: 1.25 }}>
        {seg.runs.map((r, i) => r.box ? (
          <span key={i} style={{ display: "inline-block", background: Y, color: INK, padding: "4px 18px", borderRadius: 12, margin: "0 4px", transform: "rotate(-2deg)" }}>{r.t}</span>
        ) : <span key={i} style={{ color: r.c || "#fff", textShadow: OUT }}>{r.t}</span>)}
      </div>
    </div>
  );
};

// ── 図解パーツ ──
const DarkIcon: React.FC<{ emoji: string; label: string; no?: string }> = ({ emoji, label, no }) => (
  <div style={{ width: 150, background: INK, borderRadius: 20, padding: "16px 0 12px", textAlign: "center", boxShadow: "0 10px 22px rgba(0,0,0,0.3)", position: "relative" }}>
    {no ? <div style={{ position: "absolute", left: 10, top: 8, fontSize: 20, fontWeight: 900, color: SUB }}>{no}</div> : null}
    <div style={{ fontSize: 56, lineHeight: 1 }}>{emoji}</div>
    <div style={{ fontSize: 30, fontWeight: 900, color: "#fff", marginTop: 2 }}>{label}</div>
  </div>
);

const YtCard: React.FC = () => (
  <Pop show={6} hide={138} style={{ left: 60, top: 150, width: 560 }}>
    <div style={{ background: "#fff", borderRadius: 18, boxShadow: "0 10px 24px rgba(0,0,0,0.3)", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", fontFamily: FONT, fontSize: 24, fontWeight: 800, color: INK }}>
        <span style={{ color: "#E0352B" }}>▶</span> 昨日のYouTube <span style={{ marginLeft: "auto", fontSize: 20, color: SUB }}>どの場面でも</span>
      </div>
      <div style={{ height: 150, background: "linear-gradient(120deg,#3a3a44,#222)", display: "flex", alignItems: "center", justifyContent: "center", color: "#eee", fontFamily: FONT, fontWeight: 800 }}>🎬 編集画面</div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", fontFamily: FONT, fontSize: 26, fontWeight: 900, color: INK }}>
        <span style={{ background: O, color: "#fff", borderRadius: 6, padding: "2px 8px", fontSize: 20 }}>✴</span> Opus 5.5が全部編集 <span style={{ marginLeft: "auto", color: SUB }}>20:25</span>
      </div>
    </div>
  </Pop>
);

const RecentPosts: React.FC = () => (
  <>
    <Pop show={160} hide={214} style={{ left: 0, right: 0, top: 160, display: "flex", justifyContent: "center", gap: 14 }}>
      <div style={{ display: "flex", gap: 14 }}>{[0, 1, 2, 3].map((i) => <div key={i} style={{ width: 150, height: 220, background: "#fff", borderRadius: 14, boxShadow: "0 10px 22px rgba(0,0,0,0.25)", transform: `rotate(${i % 2 ? 4 : -4}deg)`, display: "flex", alignItems: "center", justifyContent: "center", color: SUB, fontFamily: FONT }}>投稿{i + 1}</div>)}</div>
    </Pop>
    <Pop show={160} hide={214} style={{ left: 0, right: 0, top: 110, textAlign: "center" }}>
      <span style={{ background: INK, color: "#fff", fontFamily: FONT, fontWeight: 900, fontSize: 26, padding: "6px 20px", borderRadius: 999 }}>▶ 最近の投稿</span>
    </Pop>
  </>
);

const Flow: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Pop show={214} hide={336} style={{ left: 0, right: 0, top: 190, display: "flex", justifyContent: "center", alignItems: "center", gap: 16 }}>
      <DarkIcon emoji="📷" label="撮影" no="01" />
      <span style={{ fontSize: 44, color: INK, opacity: f > 236 ? 1 : 0 }}>→</span>
      <div style={{ opacity: f > 240 ? 1 : 0 }}><DarkIcon emoji="✴" label="Claude" no="02" /></div>
      <span style={{ fontSize: 44, color: INK, opacity: f > 290 ? 1 : 0 }}>→</span>
      <div style={{ opacity: f > 294 ? 1 : 0, position: "relative" }}><DarkIcon emoji="🎞" label="自動編集" no="03" /><span style={{ position: "absolute", right: -8, top: -8, color: G, fontSize: 36 }}>✓</span></div>
    </Pop>
  );
};

const Calendar: React.FC = () => (
  <Pop show={336} hide={420} style={{ left: 60, right: 60, top: 180 }}>
    <div style={{ background: INK, borderRadius: 22, padding: 24, fontFamily: FONT, boxShadow: "0 12px 26px rgba(0,0,0,0.3)" }}>
      <div style={{ color: "#fff", fontSize: 26, fontWeight: 900, marginBottom: 14 }}><span style={{ background: SUB, borderRadius: 6, padding: "2px 10px", marginRight: 10 }}>BEFORE</span>これまで</div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {["月", "火", "水", "木", "金", "土", "日"].map((d) => <div key={d} style={{ textAlign: "center" }}><div style={{ color: "#fff", fontSize: 28, fontWeight: 800 }}>{d}</div><div style={{ background: O, color: "#fff", fontSize: 18, fontWeight: 800, borderRadius: 6, padding: "2px 0", marginTop: 6 }}>編集</div></div>)}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 18 }}>
        <span style={{ fontSize: 44 }}>⏱</span><span style={{ color: "#fff", fontSize: 30, fontWeight: 800 }}>リールの編集</span><span style={{ marginLeft: "auto", color: O, fontSize: 48, fontWeight: 900 }}>1時間</span>
      </div>
    </div>
  </Pop>
);

const ProgressPanel: React.FC = () => {
  const f = useCurrentFrame();
  const pct = Math.round(interpolate(f, [420, 540], [0, 100], clamp));
  const steps = [{ e: "📷", l: "撮影", at: 420 }, { e: "🍚", l: "ご飯", at: 462 }, { e: "🏋", l: "ジム", at: 504 }, { e: "✅", l: "完成", at: 540 }];
  return (
    <>
      <Pop show={420} hide={560} style={{ left: 60, right: 60, top: 190 }}>
        <div style={{ background: INK, borderRadius: 20, padding: "20px 26px", fontFamily: FONT, boxShadow: "0 12px 26px rgba(0,0,0,0.3)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
            <span style={{ color: "#fff", fontSize: 32, fontWeight: 900 }}><span style={{ color: O }}>✴</span> Claude が編集中..</span>
            <span style={{ color: G, fontSize: 36, fontWeight: 900 }}>{pct}%</span>
          </div>
          <div style={{ position: "relative", height: 10, background: "#3a352c", borderRadius: 6 }}>
            <div style={{ position: "absolute", height: 10, width: `${pct}%`, background: G, borderRadius: 6 }} />
            {[0, 1, 2, 3].map((i) => <div key={i} style={{ position: "absolute", left: `${i / 3 * 100}%`, top: -7, transform: "translateX(-50%)", width: 24, height: 24, borderRadius: "50%", background: pct >= i / 3 * 100 ? G : "#3a352c", border: "3px solid #15130f" }} />)}
          </div>
        </div>
      </Pop>
      {steps.map((st, i) => (
        <Pop key={st.l} show={st.at} hide={560} style={{ left: 70 + i * 230, top: 330 }}>
          <div style={{ width: 180, background: "#FBE7A8", borderRadius: 14, padding: "20px 0 12px", textAlign: "center", boxShadow: "0 8px 18px rgba(80,60,20,0.2)", position: "relative" }}>
            <div style={{ position: "absolute", left: "50%", top: -12, transform: "translateX(-50%) rotate(-3deg)", width: 70, height: 22, background: "#f0cf6a", borderRadius: 3 }} />
            <div style={{ fontSize: 52 }}>{st.e}</div><div style={{ fontSize: 30, fontWeight: 900, color: INK }}>{st.l}</div>
          </div>
        </Pop>
      ))}
    </>
  );
};

const Workflow: React.FC = () => (
  <>
    <Pop show={588} hide={660} style={{ left: 0, right: 0, top: 150, textAlign: "center" }}>
      <span style={{ background: "#fff", color: INK, fontFamily: FONT, fontWeight: 900, fontSize: 28, padding: "8px 22px", borderRadius: 999, boxShadow: "0 8px 18px rgba(0,0,0,0.2)" }}>👤 個人の発信者</span>
    </Pop>
    <Pop show={600} hide={660} style={{ left: 50, right: 50, top: 240 }}>
      <div style={{ background: INK, borderRadius: 20, padding: "22px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: FONT, boxShadow: "0 12px 26px rgba(0,0,0,0.3)" }}>
        {[{ e: "📷", l: "撮影" }, { e: "✴", l: "Claude\n自動で編集", hi: true }, { e: "⬆", l: "投稿" }].map((s, i) => (
          <React.Fragment key={i}>
            <div style={{ textAlign: "center", background: s.hi ? Y : "transparent", borderRadius: 14, padding: s.hi ? "10px 16px" : 0 }}>
              <div style={{ fontSize: 44 }}>{s.e}</div><div style={{ fontSize: 24, fontWeight: 900, color: s.hi ? INK : "#fff", whiteSpace: "pre-line" }}>{s.l}</div>
            </div>
            {i < 2 && <span style={{ fontSize: 36, color: "#fff" }}>→</span>}
          </React.Fragment>
        ))}
      </div>
    </Pop>
  </>
);

const Fanout: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Pop show={672} hide={756} style={{ left: 0, right: 0, top: 180 }}>
      <div style={{ position: "relative", height: 360 }}>
        <div style={{ position: "absolute", left: 70, top: 120, textAlign: "center" }}>
          <div style={{ width: 110, height: 110, borderRadius: "50%", background: G, border: "5px solid #fff", boxShadow: "0 8px 18px rgba(0,0,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 50 }}>🧑</div>
          <div style={{ fontFamily: FONT, fontSize: 22, fontWeight: 900, color: "#fff", background: INK, borderRadius: 999, padding: "4px 12px", marginTop: 6 }}>AI編集ができる</div>
        </div>
        <svg width="1080" height="360" style={{ position: "absolute", left: 0, top: 0 }}>
          {[60, 150, 240].map((y, i) => <line key={i} x1="190" y1="175" x2="760" y2={y + 20} stroke={O} strokeWidth="4" strokeDasharray="8 8" opacity={interpolate(f, [690 + i * 8, 704 + i * 8], [0, 1], clamp)} />)}
        </svg>
        {[60, 150, 240].map((y, i) => <div key={i} style={{ position: "absolute", left: 760, top: y, width: 90, height: 70, background: ["#C0392B", "#2E86AB", "#8E44AD"][i], borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>🏢</div>)}
      </div>
    </Pop>
  );
};

const Sparkle: React.FC = () => {
  const f = useCurrentFrame();
  const o = interpolate(f, [752, 760, 775], [0, 0.8, 0], clamp);
  return <AbsoluteFill style={{ pointerEvents: "none" }}><div style={{ position: "absolute", left: 400, top: 500, fontSize: 300, opacity: o, filter: "blur(2px)" }}>✨</div></AbsoluteFill>;
};

const Promo: React.FC = () => (
  <Pop show={798} hide={924} style={{ right: 50, top: 150, width: 480 }}>
    <div style={{ background: "#fff", borderRadius: 18, boxShadow: "0 12px 26px rgba(0,0,0,0.3)", overflow: "hidden", fontFamily: FONT }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", fontSize: 22, fontWeight: 800, color: INK }}><span style={{ color: O }}>✴</span>+🎬 <span style={{ marginLeft: "auto", fontSize: 18, color: SUB }}>★昨日まとめた YouTube</span></div>
      <div style={{ padding: "6px 16px 16px" }}>
        <div style={{ fontSize: 26, fontWeight: 800, color: INK }}>YouTube広告収益</div>
        <div style={{ fontSize: 54, fontWeight: 900, color: INK }}>月20万円 <span style={{ color: G, fontSize: 36 }}>↑</span></div>
        <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", background: INK, borderRadius: 8, padding: "4px 14px", display: "inline-block", marginTop: 6 }}>作り方を公開</div>
      </div>
    </div>
  </Pop>
);

const CommentUI: React.FC = () => {
  const f = useCurrentFrame();
  const typed = f > 980 ? "AI" : "";
  return (
    <Pop show={924} hide={1008} style={{ left: 60, right: 60, top: 420 }}>
      <div style={{ background: "#fff", borderRadius: 18, padding: 20, fontFamily: FONT, boxShadow: "0 12px 26px rgba(0,0,0,0.3)" }}>
        <div style={{ fontSize: 26, fontWeight: 800, color: SUB, borderBottom: "2px solid #eee", paddingBottom: 10 }}>コメント</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: G }} />
          <div style={{ flex: 1, border: "2px solid #ddd", borderRadius: 999, padding: "12px 20px", fontSize: 30, fontWeight: 800, color: INK }}>{typed}<span style={{ opacity: f % 20 < 10 ? 1 : 0 }}>|</span></div>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: O, color: "#fff", fontSize: 26, display: "flex", alignItems: "center", justifyContent: "center" }}>➤</div>
        </div>
      </div>
    </Pop>
  );
};

const Checklist: React.FC = () => (
  <>
    <Pop show={1050} hide={1140} style={{ right: 60, top: 160, width: 300 }}>
      <div style={{ background: Y, borderRadius: 18, padding: "16px 0", textAlign: "center", fontFamily: FONT }}>
        <div style={{ fontSize: 40 }}>⏱</div><div style={{ fontSize: 44, fontWeight: 900, color: INK }}>8時間</div>
      </div>
    </Pop>
    <Pop show={1050} hide={1140} style={{ left: 60, top: 160, width: 380 }}>
      <div style={{ background: INK, borderRadius: 18, padding: 20, fontFamily: FONT }}>
        <div style={{ color: "#fff", fontSize: 26, fontWeight: 900, marginBottom: 10 }}><span style={{ color: O }}>✴</span> Opus 5.5</div>
        {["字幕", "効果音", "BGM", "画面収録"].map((t) => <div key={t} style={{ display: "flex", alignItems: "center", gap: 10, color: "#fff", fontSize: 26, fontWeight: 800, margin: "6px 0" }}><span style={{ color: G }}>✓</span>{t}</div>)}
      </div>
    </Pop>
  </>
);

const EditLog: React.FC = () => {
  const rows = [
    { icon: "💬", l: "テロップ", v: 248, u: "枚", at: 1150 },
    { icon: "🔊", l: "効果音", v: 686, u: "個", at: 1168 },
    { icon: "🎞", l: "図解アニメ", v: 100, u: "場面", at: 1186 },
    { icon: "🖥", l: "画面収録", v: 20, u: "本", at: 1204 },
    { icon: "🎵", l: "BGM", v: 6, u: "曲", at: 1218 },
    { icon: "🔍", l: "寄り（ズーム）", v: 229, u: "回", at: 1232 },
  ];
  return (
    <Pop show={1140} hide={1258} style={{ left: 0, right: 0, top: 0, bottom: 0 }}>
      <AbsoluteFill style={{ background: CREAM }}>
        <AbsoluteFill style={{ backgroundImage: `repeating-linear-gradient(0deg, transparent 0 55px, rgba(0,0,0,0.05) 55px 56px), repeating-linear-gradient(90deg, transparent 0 55px, rgba(0,0,0,0.05) 55px 56px)` }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 170, textAlign: "center", fontFamily: FONT }}>
          <div style={{ fontSize: 26, fontWeight: 900, color: SUB, letterSpacing: 6 }}>— EDIT LOG —</div>
          <div style={{ fontSize: 60, fontWeight: 900, color: INK, marginTop: 6 }}><span style={{ color: O }}>✴ Opus 5.5</span> がやった編集</div>
        </div>
        <div style={{ position: "absolute", left: 60, right: 60, top: 420, display: "flex", flexDirection: "column", gap: 18 }}>
          {rows.map((r) => {
            const show = useCurrentFrame() >= r.at;
            return (
              <div key={r.l} style={{ background: "#fff", borderRadius: 18, padding: "22px 30px", display: "flex", alignItems: "center", gap: 20, boxShadow: "0 10px 22px rgba(80,60,20,0.12)", opacity: show ? 1 : 0.25 }}>
                <span style={{ fontSize: 44 }}>{r.icon}</span>
                <span style={{ fontSize: 42, fontWeight: 900, color: INK }}>{r.l}</span>
                <span style={{ marginLeft: "auto", fontSize: 70, fontWeight: 900, color: INK }}>{show ? <CountUp delay={r.at} to={r.v} dur={16} /> : 0}<span style={{ fontSize: 32 }}>{r.u}</span></span>
                <span style={{ color: G, fontSize: 44, opacity: show ? 1 : 0 }}>✓</span>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </Pop>
  );
};

// 寄りズーム
const useZoom = () => {
  const f = useCurrentFrame();
  const base = 1.02 + 0.0005 * (f % 200);
  const punch = [126, 294, 546, 756, 1092].reduce((a, p) => a + 0.03 * Math.max(0, 1 - Math.abs(f - (p + 6)) / 12), 0);
  return base + punch;
};

export const RefClone: React.FC = () => {
  const z = useZoom();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ transform: `scale(${z})`, transformOrigin: "50% 40%" }}>
        <OffthreadVideo src={staticFile("refperson.mp4")} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "contrast(1.06) saturate(1.1)" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0) 20%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.4) 100%)", pointerEvents: "none" }} />
      <YtCard /><RecentPosts /><Flow /><Calendar /><ProgressPanel /><Workflow /><Fanout /><Sparkle /><Promo /><CommentUI /><Checklist /><EditLog />
      <Telop />
      <SfxTrack cues={[
        { file: "pop", at: 0, volume: 0.3 }, { file: "up1", at: 42, volume: 0.3 }, { file: "pop", at: 84, volume: 0.32 }, { file: "up6", at: 126, volume: 0.4 },
        { file: "swipe", at: 160, volume: 0.3 }, { file: "pop", at: 210, volume: 0.3 }, { file: "up2", at: 252, volume: 0.3 }, { file: "correct", at: 294, volume: 0.32 },
        { file: "swipe", at: 336, volume: 0.3 }, { file: "count", at: 378, volume: 0.3 },
        { file: "up1", at: 420, volume: 0.3 }, { file: "up2", at: 462, volume: 0.3 }, { file: "up3", at: 504, volume: 0.3 }, { file: "correct", at: 546, volume: 0.34 },
        { file: "swipe", at: 588, volume: 0.3 }, { file: "up4", at: 630, volume: 0.3 },
        { file: "swipe", at: 672, volume: 0.3 }, { file: "up6", at: 714, volume: 0.32 }, { file: "finish", at: 756, volume: 0.42 },
        { file: "swipe", at: 798, volume: 0.3 }, { file: "up2", at: 882, volume: 0.3 }, { file: "pop", at: 966, volume: 0.3 },
        { file: "swipe", at: 1050, volume: 0.3 }, { file: "correct", at: 1092, volume: 0.32 },
        { file: "up1", at: 1150, volume: 0.28 }, { file: "up2", at: 1168, volume: 0.28 }, { file: "up3", at: 1186, volume: 0.28 }, { file: "up4", at: 1204, volume: 0.28 }, { file: "up5", at: 1218, volume: 0.28 }, { file: "finish", at: 1232, volume: 0.4 },
      ]} />
    </AbsoluteFill>
  );
};
