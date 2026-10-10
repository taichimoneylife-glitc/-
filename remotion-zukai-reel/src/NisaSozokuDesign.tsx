import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { FONT } from "./components/font";

// ═══════════════════════════════════════════════════════════════════
// NISA 亡くなったら｜図解【設計図】（静止画レビュー用・確定台本に対応）
//   page=1 フック / 2 流れ(4ステップ) / 3 ①NISA→課税口座 /
//   4 ②同じ金融機関 / 5 ③損グラフ / 6 ③益グラフ / 7 まとめ3つ
//   録音前＝レイアウト確定が目的。恒久ルール：TOP_SAFE/カード型/連結。
//   ③は太一提供の参考2図（折れ線＋3ゾーン＋吹き出し＋キャラ）準拠。キャラ画像は後差し。
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
    <div style={{ marginTop: 16, fontWeight: 900, fontSize: 54, lineHeight: 1.22, color: C.ink, letterSpacing: 0.5 }}>{title}</div>
  </div>
);

// ───────── P1 フック ─────────
const PageHook: React.FC = () => (
  <div style={{ textAlign: "center", padding: "150px 56px 0" }}>
    <Pop at={0}><div style={{ display: "inline-block", background: C.red, color: "#fff", fontWeight: 900, fontSize: 36, padding: "10px 28px", borderRadius: 999, boxShadow: "0 10px 22px rgba(224,72,59,0.3)" }}>⚠ 知らないと損</div></Pop>
    <Pop at={4}><div style={{ marginTop: 34, fontWeight: 900, fontSize: 86, lineHeight: 1.2, color: C.ink }}>もし配偶者が<br />亡くなったら<br /><span style={{ color: C.blue }}>新NISAはどうなる？</span></div></Pop>
    <Pop at={10}><div style={{ marginTop: 40, display: "inline-block", background: "#fff", border: `3px solid ${C.gold}`, borderRadius: 24, padding: "22px 30px", boxShadow: "0 12px 26px rgba(31,58,95,0.12)", fontWeight: 900, fontSize: 40, color: C.ink, lineHeight: 1.4 }}>相続人がNISA口座を<br /><span style={{ color: C.red }}>引き継げない</span>など注意点も</div></Pop>
    <Pop at={16}><div style={{ marginTop: 36, fontWeight: 800, fontSize: 34, color: C.sub }}>損したくない人は最後まで</div></Pop>
  </div>
);

// ───────── P2 流れ（4ステップ）＋書類チップ＋下帯 ─────────
const FlowNode: React.FC<{ no: number; title: string; color: string; children?: React.ReactNode }> = ({ no, title, color, children }) => (
  <div style={{ width: 860, background: "#fff", borderRadius: 20, boxShadow: "0 8px 18px rgba(31,58,95,0.10)", border: `2px solid ${C.line}`, padding: "16px 24px" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
      <div style={{ flexShrink: 0, width: 52, height: 52, borderRadius: "50%", background: color, color: "#fff", fontWeight: 900, fontSize: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>{no}</div>
      <div style={{ fontWeight: 900, fontSize: 38, color: C.ink }}>{title}</div>
    </div>
    {children}
  </div>
);
const Conn: React.FC = () => <div style={{ width: 5, height: 20, background: C.gray, borderRadius: 3, margin: "6px auto" }} />;

const PageFlow: React.FC = () => (
  <div style={{ paddingTop: 44 }}>
    <Head kicker="全体像" title={<>相続手続きの<span style={{ color: C.blue }}>流れ</span></>} />
    <div style={{ marginTop: 26, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Pop at={0}><FlowNode no={1} title="金融機関へ連絡" color={C.red} /></Pop>
      <Conn />
      <Pop at={4}><FlowNode no={2} title="誰に何を相続するか決める" color={C.blue} /></Pop>
      <Conn />
      <Pop at={8}>
        <FlowNode no={3} title="必要書類を集める" color={C.blue}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 12, paddingLeft: 70 }}>
            {["戸籍謄本", "印鑑証明書", "遺産分割協議書", "死亡届出 等"].map((t) => (
              <span key={t} style={{ background: C.blueBg, color: C.ink, fontWeight: 800, fontSize: 26, padding: "6px 16px", borderRadius: 999 }}>{t}</span>
            ))}
          </div>
        </FlowNode>
      </Pop>
      <Conn />
      <Pop at={12}><FlowNode no={4} title="金融機関で手続きを行う" color={C.green} /></Pop>
    </div>
    <Pop at={16} style={{ marginTop: 26, display: "flex", justifyContent: "center" }}>
      <div style={{ width: 920, background: C.redBg, border: `2px solid ${C.red}`, borderRadius: 16, padding: "16px 22px", textAlign: "center", fontWeight: 900, fontSize: 32, color: C.red }}>
        ⛔ 手続きが終わるまで、自由に売却・出金できません
      </div>
    </Pop>
  </div>
);

// ───────── P3 ①NISAのままは引き継げない（移動の図）─────────
const Box: React.FC<{ title: React.ReactNode; bg: string; bd: string; w?: number }> = ({ title, bg, bd, w = 300 }) => (
  <div style={{ width: w, background: bg, border: `3px solid ${bd}`, borderRadius: 20, padding: "18px 10px", textAlign: "center", fontWeight: 900, fontSize: 34, color: C.ink, lineHeight: 1.25, boxShadow: "0 8px 18px rgba(31,58,95,0.1)" }}>{title}</div>
);
const DownArrow: React.FC<{ label?: string }> = ({ label }) => (
  <div style={{ textAlign: "center", margin: "6px 0" }}>
    {label && <div style={{ fontSize: 24, fontWeight: 800, color: C.sub, marginBottom: 2 }}>{label}</div>}
    <div style={{ fontSize: 44, fontWeight: 900, color: C.gray, lineHeight: 0.7 }}>↓</div>
  </div>
);
// ① NISA口座はそのまま引き継げない（2名義マトリクス図・参考準拠）
const AcctBox: React.FC<{ title: React.ReactNode; sub?: string; nisa?: boolean }> = ({ title, sub, nisa }) => (
  <div style={{ width: 360, background: nisa ? C.blueBg : C.goldBg, border: `2px solid ${nisa ? C.blue : C.gold}`, borderRadius: 16, padding: "20px 10px", textAlign: "center" }}>
    <div style={{ fontWeight: 900, fontSize: 36, color: C.ink, lineHeight: 1.2 }}>{title}</div>
    {sub && <div style={{ fontWeight: 700, fontSize: 24, color: C.sub, marginTop: 4 }}>{sub}</div>}
  </div>
);
const PagePoint1: React.FC = () => (
  <div style={{ paddingTop: 40 }}>
    <Pop at={0} style={{ display: "flex", justifyContent: "center" }}>
      <div style={{ background: C.ink, color: "#fff", fontWeight: 900, fontSize: 48, padding: "16px 36px", borderRadius: 16, textAlign: "center" }}>NISA口座はそのまま引き継げない</div>
    </Pop>
    <div style={{ position: "relative", width: 1000, height: 760, margin: "30px auto 0" }}>
      {/* 名義コンテナ（破線） */}
      <div style={{ position: "absolute", left: 0, top: 10, width: 440, height: 680, border: `3px dashed ${C.gray}`, borderRadius: 24 }} />
      <div style={{ position: "absolute", left: 560, top: 10, width: 440, height: 680, border: `3px dashed ${C.gray}`, borderRadius: 24 }} />
      {/* 左：亡くなった方 */}
      <Pop at={2} style={{ position: "absolute", left: 40, top: 48 }}><AcctBox title={<>亡くなった方の<br />NISA口座</>} nisa /></Pop>
      <Pop at={6} style={{ position: "absolute", left: 158, top: 250, textAlign: "center" }}>
        <div style={{ fontSize: 30, fontWeight: 900, color: C.blue }}>移管</div>
        <div style={{ fontSize: 60, fontWeight: 900, color: C.blue, lineHeight: 0.8 }}>↓</div>
      </Pop>
      <Pop at={10} style={{ position: "absolute", left: 40, top: 440 }}><AcctBox title={<>課税口座</>} sub="特定口座・一般口座" /></Pop>
      {/* 右：相続する人 */}
      <Pop at={4} style={{ position: "absolute", left: 600, top: 48 }}><AcctBox title={<>NISA口座</>} nisa /></Pop>
      <Pop at={14} style={{ position: "absolute", left: 600, top: 440 }}><AcctBox title={<>課税口座</>} sub="特定口座・一般口座" /></Pop>
      {/* ✕（NISA→NISAはできない）*/}
      <Pop at={8} style={{ position: "absolute", left: 430, top: 92, width: 140, textAlign: "center" }}>
        <div style={{ fontSize: 72, fontWeight: 900, color: C.red }}>✕</div>
        <div style={{ fontSize: 24, fontWeight: 900, color: C.red }}>継げない</div>
      </Pop>
      {/* 移管（課税口座→課税口座）*/}
      <Pop at={12} style={{ position: "absolute", left: 430, top: 486, width: 140, textAlign: "center" }}>
        <div style={{ fontSize: 56, fontWeight: 900, color: C.green, lineHeight: 0.9 }}>→</div>
        <div style={{ fontSize: 26, fontWeight: 900, color: C.green }}>移管</div>
      </Pop>
      {/* 名義ラベル */}
      <div style={{ position: "absolute", left: 40, top: 706, fontWeight: 800, fontSize: 28, color: C.sub }}>亡くなった方の名義</div>
      <div style={{ position: "absolute", left: 600, top: 706, fontWeight: 800, fontSize: 28, color: C.sub }}>相続する人の名義</div>
    </div>
  </div>
);

// ───────── P4 ②同じ金融機関じゃないと移せない ─────────
const PagePoint2: React.FC = () => (
  <div style={{ paddingTop: 44 }}>
    <Head kicker="注意点②" title={<><span style={{ color: C.blue }}>同じ金融機関</span>じゃないと移せない</>} />
    <Pop at={4} style={{ marginTop: 40, display: "flex", justifyContent: "center", alignItems: "center", gap: 20 }}>
      <Box title={<>亡くなった人の<br />口座</>} bg="#fff" bd={C.line} w={320} />
      <div style={{ fontSize: 50, fontWeight: 900, color: C.gray }}>→</div>
      <Box title={<>相続人の口座<br /><span style={{ fontSize: 26, color: C.sub }}>（同じ金融機関）</span></>} bg={C.greenBg} bd={C.green} w={340} />
    </Pop>
    <Pop at={10} style={{ marginTop: 30, display: "flex", justifyContent: "center" }}>
      <div style={{ width: 900, background: "#fff", border: `3px solid ${C.gold}`, borderRadius: 22, padding: "22px 26px", textAlign: "center", boxShadow: "0 10px 22px rgba(31,58,95,0.1)" }}>
        <div style={{ fontWeight: 900, fontSize: 36, color: C.ink }}>口座が無ければ、新しく開設が必要</div>
        <div style={{ marginTop: 10, fontWeight: 900, fontSize: 40, color: C.orange }}>👉 今のうちに作っておこう</div>
      </div>
    </Pop>
  </div>
);

// ───────── ③ 折れ線グラフ（損／益・参考2図準拠）─────────
const Bubble: React.FC<{ x: number; y: number; children: React.ReactNode; bg?: string; color?: string; w?: number }> = ({ x, y, children, bg = C.goldBg, color = C.ink, w = 180 }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, background: bg, color, borderRadius: 16, padding: "8px 10px", textAlign: "center", fontWeight: 900, fontSize: 26, lineHeight: 1.2, boxShadow: "0 6px 14px rgba(0,0,0,0.12)" }}>{children}</div>
);
const ZoneLabel: React.FC<{ x: number; text: string; color: string }> = ({ x, text, color }) => (
  <div style={{ position: "absolute", left: x, top: 548, background: color, color: "#fff", fontWeight: 900, fontSize: 28, padding: "8px 16px", borderRadius: 10, whiteSpace: "nowrap" }}>{text}</div>
);

// グラフ枠：幅960 高さ540。3ゾーン背景＋折れ線＋マーカー。
const GraphFrame: React.FC<{ path: string; zones: [number, number, number]; markers: { x: number; y: number }[]; dashed?: { y: number; x1: number; x2: number }[]; gainArrow?: { x: number; y1: number; y2: number; color: string } }> = ({ path, zones, markers, dashed = [], gainArrow }) => {
  const [zA, zB] = [zones[0], zones[1]];
  return (
    <svg width="960" height="540" style={{ display: "block" }}>
      <rect x="0" y="0" width={zA} height="520" fill={C.blueBg} />
      <rect x={zA} y="0" width={zB - zA} height="520" fill="#FBE7D4" />
      <rect x={zB} y="0" width={960 - zB} height="520" fill="#F6DCDA" />
      {dashed.map((d, i) => <line key={i} x1={d.x1} y1={d.y} x2={d.x2} y2={d.y} stroke={C.sub} strokeWidth="2" strokeDasharray="7 7" />)}
      {gainArrow && (
        <g>
          <line x1={gainArrow.x} y1={gainArrow.y1} x2={gainArrow.x} y2={gainArrow.y2} stroke={gainArrow.color} strokeWidth="5" markerEnd="url(#ah)" markerStart="url(#ah)" />
        </g>
      )}
      <defs>
        <marker id="ah" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill={C.red} /></marker>
      </defs>
      <path d={path} fill="none" stroke={C.blue} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      {markers.map((m, i) => <circle key={i} cx={m.x} cy={m.y} r="11" fill={C.blue} stroke="#fff" strokeWidth="3" />)}
    </svg>
  );
};

// 損：1,000万→600万→1,000万（戻っただけで課税・積立投信）
const PageGraphLoss: React.FC = () => (
  <div style={{ paddingTop: 40 }}>
    <Head kicker="注意点③（カギ）" title={<>亡くなった日に<span style={{ color: C.red }}>下がっていたら</span>？</>} kc={C.red} />
    <div style={{ position: "relative", width: 960, margin: "22px auto 0" }}>
      <GraphFrame
        zones={[330, 560, 0]}
        path="M60,150 C150,230 220,300 300,300 C360,300 380,360 430,360 L560,360 C640,360 700,230 760,180 L900,150"
        markers={[{ x: 60, y: 150 }, { x: 460, y: 360 }, { x: 900, y: 150 }]}
        dashed={[{ y: 150, x1: 60, x2: 900 }, { y: 360, x1: 460, x2: 900 }]}
        gainArrow={{ x: 900, y1: 150, y2: 360, color: C.red }}
      />
      <Bubble x={10} y={60} bg={C.goldBg} w={200}>積立で<br />1,000万円に</Bubble>
      <Bubble x={356} y={400} bg={C.goldBg} w={200}>新しい取得価格<br />600万円</Bubble>
      <Bubble x={720} y={54} bg={C.goldBg} w={200}>回復して<br />売却 1,000万円</Bubble>
      <Bubble x={768} y={236} bg="#fff" color={C.red} w={180}>400万に<br />約81万円課税</Bubble>
      <ZoneLabel x={60} text="亡くなった方のNISA" color={C.blue} />
      <ZoneLabel x={356} text="死亡・相続発生" color={C.orange} />
      <ZoneLabel x={636} text="相続人の課税口座" color={C.red} />
    </div>
    <Pop at={10} style={{ marginTop: 52, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <div style={{ width: 920, background: C.redBg, border: `2px solid ${C.red}`, borderRadius: 16, padding: "14px 22px", textAlign: "center", fontWeight: 800, fontSize: 28, color: C.ink, lineHeight: 1.4 }}>
        取得価格が600万に下がる → 死亡後に増えた<b style={{ color: C.red }}>400万</b>に<br /><b style={{ color: C.red }}>金融所得課税 20.315%</b>（＝約81万円）
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, color: C.sub }}>※戻っただけでも課税／旧つみたて・旧一般NISAも同じ</div>
    </Pop>
  </div>
);

// 益：元本500万→死亡日1,000万（利益500万は非課税）
const PageGraphGain: React.FC = () => (
  <div style={{ paddingTop: 40 }}>
    <Head kicker="注意点③（カギ）" title={<>亡くなった日に<span style={{ color: C.green }}>増えていたら</span>？</>} kc={C.green} />
    <div style={{ position: "relative", width: 960, margin: "22px auto 0" }}>
      <GraphFrame
        zones={[330, 560, 0]}
        path="M60,380 C160,330 240,300 300,290 C380,275 410,170 460,150 L560,150 C680,150 800,150 900,150"
        markers={[{ x: 60, y: 380 }, { x: 460, y: 150 }]}
        dashed={[{ y: 380, x1: 60, x2: 460 }, { y: 150, x1: 60, x2: 460 }]}
        gainArrow={{ x: 60, y1: 380, y2: 150, color: C.green }}
      />
      <Bubble x={18} y={320} bg={C.goldBg} w={190}>積立元本<br />500万円</Bubble>
      <Bubble x={356} y={54} bg={C.goldBg} w={210}>新しい取得価格<br />1,000万円</Bubble>
      <Bubble x={120} y={210} bg={C.greenBg} color={C.green} w={210}>増えた利益<br />500万円は非課税</Bubble>
      <ZoneLabel x={60} text="亡くなった方のNISA" color={C.blue} />
      <ZoneLabel x={356} text="死亡・相続発生" color={C.orange} />
      <ZoneLabel x={636} text="相続人の課税口座" color={C.red} />
    </div>
    <Pop at={10} style={{ marginTop: 52, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <div style={{ width: 920, background: C.greenBg, border: `2px solid ${C.green}`, borderRadius: 16, padding: "14px 22px", textAlign: "center", fontWeight: 800, fontSize: 28, color: C.ink, lineHeight: 1.4 }}>
        亡くなった日までの値上がりは<b style={{ color: C.green }}>非課税で確定</b>＝NISAの良さは活きる
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, color: C.sub }}>※死亡後に増えた分・分配金は、売ったときに課税／別途 死亡日の時価に相続税</div>
    </Pop>
  </div>
);

// ───────── まとめ（やること3つ）─────────
const TodoCard: React.FC<{ no: number; emoji: string; title: React.ReactNode }> = ({ no, emoji, title }) => (
  <div style={{ width: 900, background: "#fff", borderRadius: 24, boxShadow: "0 10px 24px rgba(31,58,95,0.12)", border: `2px solid ${C.line}`, padding: "22px 28px", display: "flex", alignItems: "center", gap: 22 }}>
    <div style={{ flexShrink: 0, width: 70, height: 70, borderRadius: "50%", background: C.green, color: "#fff", fontWeight: 900, fontSize: 38, display: "flex", alignItems: "center", justifyContent: "center" }}>{no}</div>
    <div style={{ fontSize: 54 }}>{emoji}</div>
    <div style={{ fontWeight: 900, fontSize: 37, color: C.ink, textAlign: "left", lineHeight: 1.25 }}>{title}</div>
  </div>
);
const PageTodo: React.FC = () => (
  <div style={{ paddingTop: 44 }}>
    <Head kicker="元気なうちに" title={<>やることは、<span style={{ color: C.green }}>3つ</span></>} kc={C.green} />
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, marginTop: 40 }}>
      <Pop at={2}><TodoCard no={1} emoji="🗣️" title={<>どこの金融機関に口座があるか<br />家族に伝える</>} /></Pop>
      <Pop at={6}><TodoCard no={2} emoji="🏦" title={<>夫婦で同じ金融機関の<br />口座を持つ</>} /></Pop>
      <Pop at={10}><TodoCard no={3} emoji="💬" title={<>受け取ったあと、どう使い<br />どう残すかを話しておく</>} /></Pop>
    </div>
    <Pop at={298} style={{ marginTop: 24, display: "flex", justifyContent: "center" }}>
      <div style={{ width: 900, background: C.goldBg, border: `2px solid ${C.gold}`, borderRadius: 16, padding: "16px 22px", textAlign: "center", fontWeight: 800, fontSize: 27, color: C.ink, lineHeight: 1.45 }}>
        ちなみに、NISAの資産も<b style={{ color: C.orange }}>相続税</b>の対象<br /><span style={{ fontSize: 24, color: C.sub }}>〔3,000万＋600万×法定相続人〕の基礎控除内ならかからない</span>
      </div>
    </Pop>
  </div>
);

const PAGES: Record<number, React.FC> = { 1: PageHook, 2: PageFlow, 3: PagePoint1, 4: PagePoint2, 5: PageGraphLoss, 6: PageGraphGain, 7: PageTodo };

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
