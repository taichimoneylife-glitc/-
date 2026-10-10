import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { FONT } from "./components/font";

// ═══════════════════════════════════════════════════════════════════
// NISA 亡くなったら｜図解【設計図】（手本=KabeReel の設計システムに準拠）
//   page=1 フック / 2 流れ(4ステップ) / 3 ①NISA→課税口座 /
//   4 ②同じ金融機関 / 5 ③損グラフ / 6 ③益グラフ / 7 まとめ3つ
//   方針：背景に奥行き(BackgroundFX)／数字は主役(NumCount+MarkNum)／
//        イラストは大きく主役／キャンバス全体を使う／山場はキメ(Pap+Burst)。
//   ナレ同期の出現フレーム(at)は維持。
// ═══════════════════════════════════════════════════════════════════
const C = {
  bg: "#FCFBF7", ink: "#1F3A5F", sub: "#5B6B7F",
  orange: "#E8912D", red: "#E0483B", green: "#2E9E6B",
  blue: "#3B7DD8", gold: "#E0A72E", gray: "#AEB8C2", line: "#C9D2DD",
  blueBg: "#E7F0FB", greenBg: "#E4F3EC", redBg: "#FCE6E3", goldBg: "#FBF1D9", orangeBg: "#FBEBD4",
};
const TOP_SAFE = 130;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const NISA_DESIGN_FRAMES = 120;

// ── 背景の奥行き（やわらかいグラデ＋ぼかしブロブ＋ドットグリッド）＝手本と同じ ──
const BackgroundFX: React.FC = () => {
  const f = useCurrentFrame();
  const drift = (spd: number, amp: number, ph: number) => Math.sin(f / spd + ph) * amp;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(125% 80% at 50% -5%, #FFFDF8 0%, #FAF6EC 55%, #F0ECE0 100%)" }} />
      <div style={{ position: "absolute", width: 760, height: 760, borderRadius: "50%", background: C.blue, opacity: 0.08, filter: "blur(90px)", left: -170 + drift(120, 34, 0), top: 120 + drift(150, 46, 1) }} />
      <div style={{ position: "absolute", width: 640, height: 640, borderRadius: "50%", background: C.green, opacity: 0.07, filter: "blur(90px)", right: -140 + drift(140, 34, 2), top: 860 + drift(130, 46, 0.5) }} />
      <div style={{ position: "absolute", width: 560, height: 560, borderRadius: "50%", background: C.red, opacity: 0.05, filter: "blur(100px)", left: 300 + drift(160, 40, 3), bottom: -140 + drift(120, 34, 1.5) }} />
      <AbsoluteFill style={{ backgroundImage: `radial-gradient(${C.line} 1.4px, transparent 1.4px)`, backgroundSize: "48px 48px", opacity: 0.16, maskImage: "radial-gradient(120% 90% at 50% 40%, #000 55%, transparent 100%)", WebkitMaskImage: "radial-gradient(120% 90% at 50% 40%, #000 55%, transparent 100%)" }} />
    </AbsoluteFill>
  );
};

// ── 共通アニメ（手本から流用。at=出現フレーム）──
const useSp = (at: number, dur = 14, cfg: Parameters<typeof spring>[0]["config"] = { damping: 14, stiffness: 150, mass: 0.8 }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  return spring({ frame: f - at, fps, config: cfg, durationInFrames: dur });
};
const Pop: React.FC<{ at?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ at = 0, style, children }) => {
  const s = useSp(at, 12, { damping: 13, stiffness: 150, mass: 0.7 });
  return <div style={{ opacity: Math.min(1, s * 2), transform: `scale(${s})`, transformOrigin: "center", ...style }}>{children}</div>;
};
const Drop: React.FC<{ at?: number; dy?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ at = 0, dy = -28, style, children }) => {
  const s = useSp(at, 16, { damping: 15 });
  return <div style={{ opacity: Math.min(1, s * 1.8), transform: `translateY(${(1 - s) * dy}px)`, ...style }}>{children}</div>;
};
// イラスト（透過PNG）：スライドイン＋弾み＋ゆらぎフロート
const GenImg: React.FC<{ name: string; w: number; h?: number; at?: number; float?: number; dir?: "left" | "right" | "up"; style?: React.CSSProperties }> = ({ name, w, h, at = 0, float = 7, dir, style }) => {
  const f = useCurrentFrame();
  const s = useSp(at, 20, { damping: 11, stiffness: 135, mass: 0.9 });
  const fy = Math.sin((f - at) / 24) * float;
  const sx = dir === "left" ? (1 - s) * -95 : dir === "right" ? (1 - s) * 95 : 0;
  const sy = dir === "up" ? (1 - s) * 80 : (1 - s) * 22;
  return <Img src={staticFile(`gen/${name}.png`)} style={{ width: w, height: h ?? "auto", objectFit: "contain", opacity: Math.min(1, s * 1.7), transform: `translate(${sx}px, ${sy + fy}px) scale(${0.88 + s * 0.12})`, ...style }} />;
};
// 数字カウントアップ＋着地のパンチ
const NumCount: React.FC<{ to: number; at: number; dur?: number; style?: React.CSSProperties }> = ({ to, at, dur = 16, style }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + dur], [0, 1], clamp);
  const eased = 1 - Math.pow(1 - p, 3);
  const v = Math.round(to * eased);
  const punch = interpolate(f, [at + dur - 3, at + dur + 1, at + dur + 7], [1, 1.14, 1], clamp);
  return <span style={{ display: "inline-block", transform: `scale(${punch})`, transformOrigin: "center bottom", ...style }}>{v.toLocaleString()}</span>;
};
// マーカー下線
const MarkNum: React.FC<{ at: number; color?: string; dur?: number; children: React.ReactNode }> = ({ at, color = C.orange, dur = 11, children }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + dur], [0, 1], clamp);
  return (
    <span style={{ position: "relative", display: "inline-block", padding: "0 8px" }}>
      <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
      <span style={{ position: "absolute", left: 0, right: 0, bottom: 8, height: "32%", background: color, opacity: 0.34, transform: `scaleX(${p})`, transformOrigin: "left center", borderRadius: 6, zIndex: 0 }} />
    </span>
  );
};
// インライン・ハイライト
const Hi: React.FC<{ at: number; color?: string; dur?: number; children: React.ReactNode }> = ({ at, color = C.orange, dur = 12, children }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + dur], [0, 1], clamp);
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <span style={{ position: "absolute", left: -6, right: -6, bottom: 1, height: "44%", background: color, opacity: 0.32, transform: `scaleX(${p})`, transformOrigin: "left center", borderRadius: 4, zIndex: 0 }} />
      <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
    </span>
  );
};
// 手書き風の丸囲み
const CircleMark: React.FC<{ at: number; w?: number; h?: number; color?: string; sw?: number; rot?: number; dur?: number; style?: React.CSSProperties }> =
  ({ at, w = 300, h = 150, color = C.red, sw = 7, rot = -4, dur = 15, style }) => {
    const f = useCurrentFrame();
    const p = interpolate(f, [at, at + dur], [0, 1], clamp);
    const cx = w / 2, cy = h / 2, rx = w / 2 - sw, ry = h / 2 - sw;
    const dd = `M ${cx + rx * 0.95} ${cy - ry * 0.22} C ${cx + rx * 1.05} ${cy - ry * 0.95}, ${cx - rx * 0.15} ${cy - ry * 1.12}, ${cx - rx * 0.8} ${cy - ry * 0.55} C ${cx - rx * 1.12} ${cy + ry * 0.2}, ${cx - rx * 0.35} ${cy + ry * 1.12}, ${cx + rx * 0.55} ${cy + ry * 0.85} C ${cx + rx * 1.1} ${cy + ry * 0.55}, ${cx + rx * 1.03} ${cy - ry * 0.25}, ${cx + rx * 0.82} ${cy - ry * 0.55}`;
    return (
      <svg width={w} height={h} style={{ transform: `rotate(${rot}deg)`, ...style }}>
        <path d={dd} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} opacity={p > 0.001 ? 1 : 0} />
      </svg>
    );
  };
// バースト（キメの「パッ」）
const Burst: React.FC<{ at: number; color?: string; size?: number; style?: React.CSSProperties }> = ({ at, color = C.red, size = 440, style }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + 18], [0, 1], clamp);
  if (p <= 0 || p >= 1) return null;
  const sc = 0.25 + p * 1.25, op = (1 - p) * 0.5;
  return <div style={{ position: "absolute", width: size, height: size, borderRadius: "50%", border: `7px solid ${color}`, transform: `translate(-50%,-50%) scale(${sc})`, opacity: op, pointerEvents: "none", ...style }} />;
};
// ため→パッ
const Pap: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, children, style }) => {
  const f = useCurrentFrame();
  const s = useSp(at, 14, { damping: 9, stiffness: 180, mass: 0.7 });
  const appear = interpolate(f, [at - 10, at - 7], [0, 1], clamp);
  const sc = f < at ? 0.8 : 0.8 + s * 0.2 + Math.max(0, s - 1) * 0.18;
  return <div style={{ display: "inline-block", transform: `scale(${sc})`, transformOrigin: "center", opacity: appear, ...style }}>{children}</div>;
};

const Head: React.FC<{ kicker: string; title: React.ReactNode; kc?: string; at?: number }> = ({ kicker, title, kc = C.blue, at = 0 }) => (
  <div style={{ textAlign: "center", padding: "0 48px" }}>
    <Pop at={at} style={{ display: "inline-block" }}>
      <div style={{ display: "inline-block", background: kc, color: "#fff", fontWeight: 900, fontSize: 36, padding: "9px 30px", borderRadius: 999, boxShadow: `0 10px 22px ${kc}44` }}>{kicker}</div>
    </Pop>
    <Drop at={at + 4} style={{ marginTop: 16, fontWeight: 900, fontSize: 56, lineHeight: 1.2, color: C.ink, letterSpacing: 0.5 }}>{title}</Drop>
  </div>
);

// ───────── P1 フック ─────────
const PageHook: React.FC = () => (
  <div style={{ textAlign: "center", padding: "150px 56px 0" }}>
    <Pop at={0}><div style={{ display: "inline-block", background: C.red, color: "#fff", fontWeight: 900, fontSize: 36, padding: "10px 28px", borderRadius: 999, boxShadow: "0 10px 22px rgba(224,72,59,0.3)" }}>⚠ 知らないと損</div></Pop>
    <Drop at={4}><div style={{ marginTop: 34, fontWeight: 900, fontSize: 86, lineHeight: 1.2, color: C.ink }}>もし配偶者が<br />亡くなったら<br /><span style={{ color: C.blue }}>新NISAはどうなる？</span></div></Drop>
    <Pop at={10}><div style={{ marginTop: 40, display: "inline-block", background: "#fff", border: `3px solid ${C.gold}`, borderRadius: 24, padding: "22px 30px", boxShadow: "0 12px 26px rgba(31,58,95,0.12)", fontWeight: 900, fontSize: 40, color: C.ink, lineHeight: 1.4 }}>相続人がNISA口座を<br /><span style={{ color: C.red }}>引き継げない</span>など注意点も</div></Pop>
    <Drop at={16}><div style={{ marginTop: 36, fontWeight: 800, fontSize: 34, color: C.sub }}>損したくない人は最後まで</div></Drop>
  </div>
);

// ───────── P2 流れ（4ステップ・手本PageMerit型の大カード）＋書類チップ＋下帯 ─────────
const FLOW = [
  { no: 1, img: "nisa_phone_bank", t: "金融機関へ連絡", s: "まずは電話で相続の連絡", c: C.red, at: 20 },
  { no: 2, img: "nisa_family_talk", t: "誰に何を相続するか決める", s: "家族で遺産分割を話し合う", c: C.blue, at: 74 },
  { no: 3, img: "nisa_documents", t: "必要書類を集める", s: "", c: C.gold, at: 120, chips: ["戸籍謄本", "印鑑証明書", "遺産分割協議書", "死亡届出 等"] },
  { no: 4, img: "nisa_bank_counter", t: "金融機関で手続きを行う", s: "窓口で名義変更・移管", c: C.green, at: 169 },
] as const;
const PageFlow: React.FC = () => (
  <div style={{ paddingTop: 36 }}>
    <Head kicker="全体像" title={<>相続手続きの<span style={{ color: C.blue }}>流れ</span></>} />
    <div style={{ marginTop: 28, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      {FLOW.map((it, i) => (
        <React.Fragment key={it.no}>
          {i > 0 && <ArrowLine at={it.at - 8} dir="down" len={30} color={C.gray} w={5} />}
          <Drop at={it.at} dy={-22}>
          <div style={{ display: "flex", alignItems: "center", gap: 20, width: 920, background: "#fff", border: `4px solid ${it.c}`, borderRadius: 22, padding: "16px 26px", boxShadow: `0 8px 20px ${it.c}22` }}>
            <div style={{ position: "relative", width: 136, height: 136, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <GenImg name={it.img} w={132} at={it.at} float={5} style={{ maxHeight: 132 }} />
              <span style={{ position: "absolute", left: -8, top: -8, width: 48, height: 48, borderRadius: "50%", background: it.c, color: "#fff", fontSize: 28, fontWeight: 900, display: "inline-flex", alignItems: "center", justifyContent: "center", border: "3px solid #fff" }}>{it.no}</span>
            </div>
            <div style={{ textAlign: "left", flex: 1 }}>
              <div style={{ fontSize: 42, fontWeight: 900, color: C.ink, lineHeight: 1.15 }}>{it.t}</div>
              {it.s && <div style={{ fontSize: 24, fontWeight: 800, color: it.c, marginTop: 4 }}>{it.s}</div>}
              {"chips" in it && it.chips && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 9, marginTop: 10 }}>
                  {it.chips.map((t) => <span key={t} style={{ background: C.blueBg, color: C.ink, fontWeight: 800, fontSize: 24, padding: "5px 14px", borderRadius: 999 }}>{t}</span>)}
                </div>
              )}
            </div>
          </div>
          </Drop>
        </React.Fragment>
      ))}
    </div>
    <Pop at={205} style={{ marginTop: 40, display: "flex", justifyContent: "center" }}>
      <div style={{ width: 920, background: C.redBg, border: `3px solid ${C.red}`, borderRadius: 16, padding: "22px 22px", textAlign: "center", fontWeight: 900, fontSize: 34, color: C.red }}>
        ⛔ 手続きが終わるまで、自由に売却・出金できません
      </div>
    </Pop>
  </div>
);

// ───────── P3 ①NISAのままは引き継げない（移動の図）─────────
const AcctBox: React.FC<{ title: React.ReactNode; sub?: string; nisa?: boolean; at?: number }> = ({ title, sub, nisa, at = 0 }) => (
  <Pop at={at}>
    <div style={{ width: 380, background: nisa ? C.blueBg : C.goldBg, border: `4px solid ${nisa ? C.blue : C.gold}`, borderRadius: 18, padding: "22px 10px", textAlign: "center", boxShadow: "0 8px 18px rgba(31,58,95,0.1)" }}>
      <div style={{ fontWeight: 900, fontSize: 38, color: C.ink, lineHeight: 1.2 }}>{title}</div>
      {sub && <div style={{ fontWeight: 800, fontSize: 24, color: C.sub, marginTop: 4 }}>{sub}</div>}
    </div>
  </Pop>
);
const PagePoint1: React.FC = () => (
  <div style={{ paddingTop: 36 }}>
    <Head kicker="注意点①" title={<>NISA口座のまま<span style={{ color: C.red }}>引き継げない</span></>} kc={C.red} />
    <div style={{ position: "relative", width: 1000, height: 720, margin: "24px auto 0" }}>
      <div style={{ position: "absolute", left: 10, top: 10, width: 420, height: 690, border: `3px dashed ${C.gray}`, borderRadius: 24 }} />
      <div style={{ position: "absolute", left: 570, top: 10, width: 420, height: 690, border: `3px dashed ${C.gray}`, borderRadius: 24 }} />
      {/* 左：亡くなった方 */}
      <div style={{ position: "absolute", left: 20, top: 46 }}><AcctBox at={76} title={<>亡くなった方の<br />NISA口座</>} nisa /></div>
      <Pop at={178} style={{ position: "absolute", left: 150, top: 236, width: 200, textAlign: "center" }}>
        <div style={{ fontSize: 28, fontWeight: 900, color: C.blue }}>非課税は終了</div>
      </Pop>
      <ArrowLine at={184} dir="down" len={150} color={C.blue} style={{ position: "absolute", left: 210, top: 278 }} />
      <div style={{ position: "absolute", left: 20, top: 450 }}><AcctBox at={185} title={<>課税口座</>} sub="特定口座・一般口座" /></div>
      {/* 右：相続する人 */}
      <div style={{ position: "absolute", left: 580, top: 46 }}><AcctBox at={95} title={<>NISA口座</>} nisa /></div>
      <div style={{ position: "absolute", left: 580, top: 450 }}><AcctBox at={272} title={<>課税口座</>} sub="相続人の名義へ" /></div>
      {/* ✕ */}
      <Pop at={135} style={{ position: "absolute", left: 452, top: 96, width: 96, textAlign: "center" }}>
        <div style={{ fontSize: 76, fontWeight: 900, color: C.red }}>✕</div>
        <div style={{ fontSize: 24, fontWeight: 900, color: C.red }}>継げない</div>
      </Pop>
      {/* 移管→（描く矢印）*/}
      <Pop at={266} style={{ position: "absolute", left: 450, top: 466, width: 100, textAlign: "center" }}>
        <div style={{ fontSize: 26, fontWeight: 900, color: C.green }}>移管</div>
      </Pop>
      <ArrowLine at={268} dir="right" len={84} color={C.green} style={{ position: "absolute", left: 448, top: 496 }} />
      {/* 名義ラベル */}
      <div style={{ position: "absolute", left: 30, top: 606, display: "flex", alignItems: "center", gap: 8 }}>
        <GenImg name="nisa_husband_passed" w={76} at={76} float={4} />
        <span style={{ fontWeight: 900, fontSize: 26, color: C.sub }}>亡くなった方の名義</span>
      </div>
      <div style={{ position: "absolute", left: 590, top: 606, display: "flex", alignItems: "center", gap: 8 }}>
        <GenImg name="nisa_wife_stand" w={76} at={95} float={4} />
        <span style={{ fontWeight: 900, fontSize: 26, color: C.sub }}>相続する人の名義</span>
      </div>
    </div>
    <Pop at={300} style={{ marginTop: 10, display: "flex", justifyContent: "center" }}>
      <div style={{ width: 920, background: C.greenBg, border: `3px solid ${C.green}`, borderRadius: 16, padding: "14px 22px", textAlign: "center", fontWeight: 800, fontSize: 28, color: C.ink, lineHeight: 1.4 }}>
        非課税で運用したいなら<br /><b style={{ color: C.green }}>課税口座で受取 → 売却 → NISAで買い直し</b>
      </div>
    </Pop>
  </div>
);

// ───────── P4 ②同じ金融機関じゃないと移せない ─────────
const PagePoint2: React.FC = () => (
  <div style={{ paddingTop: 36 }}>
    <Head kicker="注意点②" title={<><span style={{ color: C.blue }}>同じ金融機関</span>じゃないと移せない</>} />
    <div style={{ position: "relative", marginTop: 40, display: "flex", justifyContent: "center", alignItems: "center", gap: 10 }}>
      <GenImg name="nisa_bank_building" w={360} at={20} dir="up" />
    </div>
    <div style={{ marginTop: 40, display: "flex", justifyContent: "center", alignItems: "center", gap: 22 }}>
      <Pop at={83}><div style={{ width: 340, background: "#fff", border: `3px solid ${C.line}`, borderRadius: 18, padding: "26px 10px", textAlign: "center", fontWeight: 900, fontSize: 36, color: C.ink, lineHeight: 1.25 }}>亡くなった人の<br />口座</div></Pop>
      <ArrowLine at={110} dir="right" len={70} color={C.green} w={7} />
      <Pop at={120}><div style={{ width: 380, background: C.greenBg, border: `4px solid ${C.green}`, borderRadius: 18, padding: "26px 10px", textAlign: "center", fontWeight: 900, fontSize: 36, color: C.ink, lineHeight: 1.25 }}>相続人の口座<br /><span style={{ fontSize: 26, color: C.green }}>（同じ金融機関）</span></div></Pop>
    </div>
    <Pop at={178} style={{ marginTop: 56, display: "flex", justifyContent: "center" }}>
      <div style={{ width: 920, background: "#fff", border: `4px solid ${C.gold}`, borderRadius: 24, padding: "32px 34px", display: "flex", alignItems: "center", gap: 28, boxShadow: "0 12px 26px rgba(31,58,95,0.1)" }}>
        <GenImg name="nisa_open_account" w={210} at={190} dir="left" style={{ flexShrink: 0 }} />
        <div style={{ textAlign: "left" }}>
          <div style={{ fontWeight: 900, fontSize: 42, color: C.ink, lineHeight: 1.25 }}>口座が無ければ<br />新しく開設が必要</div>
          <div style={{ position: "relative", display: "inline-block", marginTop: 16 }}>
            <span style={{ fontWeight: 900, fontSize: 46, color: C.orange }}>今のうちに作っておこう</span>
            <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none" }}><CircleMark at={240} w={540} h={120} color={C.orange} /></div>
          </div>
        </div>
      </div>
    </Pop>
    <Drop at={300} style={{ marginTop: 40, textAlign: "center", fontSize: 26, fontWeight: 800, color: C.sub }}>
      万一のときイチから作るのはバタバタ。元気なうちに準備を。
    </Drop>
  </div>
);

// ───────── ③ 折れ線グラフ（損／益・大きめ）─────────
const Bubble: React.FC<{ x: number; y: number; children: React.ReactNode; bg?: string; color?: string; w?: number; at?: number; bd?: string }> = ({ x, y, children, bg = C.goldBg, color = C.ink, w = 200, at = 0, bd }) => {
  const s = useSp(at, 11, { damping: 13, stiffness: 160, mass: 0.7 });
  return <div style={{ position: "absolute", left: x, top: y, width: w, background: bg, color, border: bd ? `3px solid ${bd}` : "none", borderRadius: 16, padding: "10px 12px", textAlign: "center", fontWeight: 900, fontSize: 28, lineHeight: 1.2, boxShadow: "0 6px 14px rgba(0,0,0,0.12)", opacity: Math.min(1, s * 1.6), transform: `translateY(${(1 - Math.min(1, s)) * 10}px) scale(${0.9 + 0.1 * Math.min(1, s)})` }}>{children}</div>;
};
const ZoneLabel: React.FC<{ x: number; top: number; text: string; color: string; at?: number }> = ({ x, top, text, color, at = 0 }) => {
  const s = useSp(at, 10);
  return <div style={{ position: "absolute", left: x, top, background: color, color: "#fff", fontWeight: 900, fontSize: 27, padding: "7px 16px", borderRadius: 10, whiteSpace: "nowrap", opacity: Math.min(1, s * 1.6) }}>{text}</div>;
};
// 描く矢印（縦/横）：線が伸びて先端が付く＝ツリー式。単体要素用。
const ArrowLine: React.FC<{ at: number; dir: "down" | "right"; len?: number; color: string; dur?: number; w?: number; style?: React.CSSProperties }> = ({ at, dir, len = 70, color, dur = 14, w = 6, style }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + dur], [0, 1], clamp);
  const hb = interpolate(f, [at + dur * 0.6, at + dur], [0, 1], clamp);
  if (p <= 0.001) return <svg width={dir === "down" ? 40 : len + 18} height={dir === "down" ? len + 18 : 40} style={style} />;
  if (dir === "down") {
    const yE = len * p;
    return (
      <svg width={40} height={len + 18} style={style}>
        <line x1={20} y1={0} x2={20} y2={yE} stroke={color} strokeWidth={w} strokeLinecap="round" />
        <path d={`M${20 - 11} ${yE - 13} L20 ${yE} L${20 + 11} ${yE - 13}`} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" opacity={hb} />
      </svg>
    );
  }
  const xE = len * p;
  return (
    <svg width={len + 18} height={40} style={style}>
      <line x1={0} y1={20} x2={xE} y2={20} stroke={color} strokeWidth={w} strokeLinecap="round" />
      <path d={`M${xE - 13} ${20 - 11} L${xE} 20 L${xE - 13} ${20 + 11}`} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" opacity={hb} />
    </svg>
  );
};

// グラフ枠：幅980 高さ560。3ゾーン＋折れ線を「区間ごとに」ナレに同期して描画＋マーカー＋縦矢印。
type Seg = { d: string; from: number; to: number };
type GArrow = { x: number; y1: number; y2: number; at: number; color: string; dur?: number };
const GraphFrame: React.FC<{ zones: [number, number]; segs: Seg[]; markers: { x: number; y: number; at: number }[]; arrows?: GArrow[]; dashed?: { y: number; x1: number; x2: number; at: number }[] }> = ({ zones, segs, markers, arrows = [], dashed = [] }) => {
  const f = useCurrentFrame();
  const [zA, zB] = zones;
  return (
    <svg width="980" height="560" style={{ display: "block" }}>
      <rect x="0" y="0" width={zA} height="540" rx="10" fill={C.blueBg} />
      <rect x={zA} y="0" width={zB - zA} height="540" fill="#FBE7D4" />
      <rect x={zB} y="0" width={980 - zB} height="540" rx="10" fill="#F6DCDA" />
      {dashed.map((d, i) => <line key={i} x1={d.x1} y1={d.y} x2={d.x2} y2={d.y} stroke={C.sub} strokeWidth="2.5" strokeDasharray="8 8" opacity={interpolate(f, [d.at, d.at + 8], [0, 1], clamp)} />)}
      {segs.map((s, i) => {
        const p = interpolate(f, [s.from, s.to], [0, 1], clamp);
        return <path key={i} d={s.d} fill="none" stroke={C.blue} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} opacity={p > 0.001 ? 1 : 0} />;
      })}
      {arrows.map((a, i) => {
        const dur = a.dur ?? 14;
        const p = interpolate(f, [a.at, a.at + dur], [0, 1], clamp);
        if (p <= 0.001) return null;
        const yE = a.y1 + (a.y2 - a.y1) * p;
        const up = a.y2 < a.y1;
        const hb = interpolate(f, [a.at + dur * 0.55, a.at + dur], [0, 1], clamp);
        return (
          <g key={i}>
            <line x1={a.x} y1={a.y1} x2={a.x} y2={yE} stroke={a.color} strokeWidth="5" strokeLinecap="round" />
            <path d={`M${a.x - 9} ${yE + (up ? 12 : -12)} L${a.x} ${yE} L${a.x + 9} ${yE + (up ? 12 : -12)}`} fill="none" stroke={a.color} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" opacity={hb} />
            <path d={`M${a.x - 9} ${a.y1 + (up ? -12 : 12)} L${a.x} ${a.y1} L${a.x + 9} ${a.y1 + (up ? -12 : 12)}`} fill="none" stroke={a.color} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" opacity={hb} />
          </g>
        );
      })}
      {markers.map((m, i) => <circle key={i} cx={m.x} cy={m.y} r="13" fill={C.blue} stroke="#fff" strokeWidth="4" opacity={interpolate(f, [m.at, m.at + 5], [0, 1], clamp)} />)}
    </svg>
  );
};

// 損：1,000万→600万→1,000万（戻っただけで課税・積立投信）
const PageGraphLoss: React.FC = () => (
  <div style={{ paddingTop: 36 }}>
    <Head kicker="注意点③（ここがカギ）" title={<>亡くなった日に<span style={{ color: C.red }}>下がっていたら</span>？</>} kc={C.red} />
    <div style={{ position: "relative", width: 980, margin: "22px auto 0" }}>
      {/* 線は2区間で、喋りの流れに同期して描く：①1,000万→600万に下落 ②600万→回復1,000万 */}
      <GraphFrame
        zones={[340, 580]}
        segs={[
          { d: "M60,150 C150,235 220,310 300,310 C365,310 385,370 440,370 L580,370", from: 300, to: 352 },
          { d: "M580,370 C665,370 720,235 780,185 L920,150", from: 458, to: 506 },
        ]}
        markers={[{ x: 60, y: 150, at: 200 }, { x: 510, y: 370, at: 352 }, { x: 920, y: 150, at: 506 }]}
        dashed={[{ y: 370, x1: 510, x2: 900, at: 515 }, { y: 150, x1: 520, x2: 900, at: 515 }]}
        arrows={[{ x: 888, y1: 370, y2: 150, at: 522, color: C.red, dur: 16 }]}
      />
      <Bubble x={8} y={52} bg={C.goldBg} w={210} at={200}>積立で<br />1,000万円に</Bubble>
      <Bubble x={356} y={384} bg="#fff" bd={C.orange} w={240} at={352}>新しい取得価格<br />600万円</Bubble>
      <Bubble x={716} y={44} bg={C.goldBg} w={244} at={506}>回復して売却<br />1,000万円</Bubble>
      <Bubble x={744} y={250} bg="#fff" color={C.red} bd={C.red} w={132} at={528}>＋400万</Bubble>
      <ZoneLabel x={64} top={492} text="亡くなった方のNISA" color={C.blue} at={200} />
      <ZoneLabel x={360} top={492} text="死亡・相続発生" color={C.orange} at={352} />
      <ZoneLabel x={660} top={492} text="相続人の課税口座" color={C.red} at={506} />
      <GenImg name="nisa_mascot_worry" w={148} at={360} style={{ position: "absolute", left: 66, top: 322 }} />
    </div>
    {/* 山場のキメ：400万に約81万円課税 */}
    <div style={{ position: "relative", marginTop: 30, height: 130, display: "flex", justifyContent: "center", alignItems: "center" }}>
      <Burst at={544} color={C.red} size={520} style={{ left: "50%", top: "50%" }} />
      <Pap at={544}>
        <div style={{ background: C.red, borderRadius: 18, padding: "16px 36px", textAlign: "center", boxShadow: "0 12px 26px rgba(224,72,59,0.3)" }}>
          <div style={{ fontSize: 30, fontWeight: 900, color: "#fff" }}>増えた<b style={{ fontSize: 44 }}>400万</b>に課税</div>
          <div style={{ fontSize: 56, fontWeight: 900, color: "#fff", lineHeight: 1 }}>約<NumCount to={81} at={546} />万円</div>
        </div>
      </Pap>
    </div>
    <Drop at={578} style={{ marginTop: 16, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <div style={{ width: 920, background: "#fff", border: `3px solid ${C.red}`, borderRadius: 16, padding: "14px 22px", textAlign: "center", fontWeight: 800, fontSize: 28, color: C.ink, lineHeight: 1.4 }}>
        取得価格が600万に下がる → 死亡後に増えた<b style={{ color: C.red }}>400万</b>に<Hi at={600} color={C.red}>金融所得課税 20.315%</Hi>
      </div>
      <div style={{ fontSize: 23, fontWeight: 700, color: C.sub }}>※戻っただけでも課税／旧つみたて・旧一般NISAも同じ</div>
    </Drop>
  </div>
);

// 益：元本500万→死亡日1,000万（利益500万は非課税）
const PageGraphGain: React.FC = () => (
  <div style={{ paddingTop: 36 }}>
    <Head kicker="注意点③（ここがカギ）" title={<>亡くなった日に<span style={{ color: C.green }}>増えていたら</span>？</>} kc={C.green} />
    <div style={{ position: "relative", width: 980, margin: "22px auto 0" }}>
      {/* 線は喋りに同期：元本500万→死亡日1,000万へ上昇、そのまま引き継ぐ */}
      <GraphFrame
        zones={[340, 580]}
        segs={[
          { d: "M60,390 C160,340 240,310 300,300 C385,282 410,175 470,150", from: 100, to: 128 },
          { d: "M470,150 L580,150 C700,150 820,150 920,150", from: 130, to: 150 },
        ]}
        markers={[{ x: 60, y: 390, at: 90 }, { x: 470, y: 150, at: 128 }]}
        dashed={[{ y: 390, x1: 60, x2: 520, at: 132 }, { y: 150, x1: 60, x2: 520, at: 132 }]}
        arrows={[{ x: 510, y1: 390, y2: 150, at: 136, color: C.green, dur: 16 }]}
      />
      <Bubble x={48} y={404} bg={C.goldBg} w={200} at={90}>積立元本<br />500万円</Bubble>
      <Bubble x={356} y={44} bg={C.goldBg} w={244} at={128}>新しい取得価格<br />1,000万円</Bubble>
      <Bubble x={524} y={244} bg="#fff" color={C.green} bd={C.green} w={132} at={142}>＋500万</Bubble>
      <ZoneLabel x={64} top={492} text="亡くなった方のNISA" color={C.blue} at={90} />
      <ZoneLabel x={360} top={492} text="死亡・相続発生" color={C.orange} at={128} />
      <ZoneLabel x={660} top={492} text="相続人の課税口座" color={C.red} at={150} />
      <GenImg name="nisa_mascot_happy" w={148} at={136} style={{ position: "absolute", left: 772, top: 300 }} />
    </div>
    <div style={{ position: "relative", marginTop: 30, height: 130, display: "flex", justifyContent: "center", alignItems: "center" }}>
      <Burst at={160} color={C.green} size={520} style={{ left: "50%", top: "50%" }} />
      <Pap at={160}>
        <div style={{ background: C.green, borderRadius: 18, padding: "16px 40px", textAlign: "center", boxShadow: "0 12px 26px rgba(46,158,107,0.3)" }}>
          <div style={{ fontSize: 30, fontWeight: 900, color: "#fff" }}>増えた利益</div>
          <div style={{ fontSize: 56, fontWeight: 900, color: "#fff", lineHeight: 1 }}><NumCount to={500} at={162} />万円は非課税</div>
        </div>
      </Pap>
    </div>
    <Drop at={184} style={{ marginTop: 16, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <div style={{ width: 920, background: "#fff", border: `3px solid ${C.green}`, borderRadius: 16, padding: "14px 22px", textAlign: "center", fontWeight: 800, fontSize: 28, color: C.ink, lineHeight: 1.4 }}>
        亡くなった日までの値上がりは<Hi at={202} color={C.green}>非課税で確定</Hi>＝NISAの良さは活きる
      </div>
      <div style={{ fontSize: 23, fontWeight: 700, color: C.sub }}>※死亡後に増えた分・分配金は、売ったときに課税／別途 死亡日の時価に相続税</div>
    </Drop>
  </div>
);

// ───────── まとめ（やること3つ）─────────
const TODO = [
  { no: 1, img: "nisa_tell_family", t: <>どこの金融機関に口座があるか<br />家族に伝える</>, at: 59 },
  { no: 2, img: "nisa_couple", t: <>夫婦で同じ金融機関の<br />口座を持つ</>, at: 142 },
  { no: 3, img: "nisa_think", t: <>受け取ったあと、どう使い<br />どう残すかを話しておく</>, at: 200 },
] as const;
const PageTodo: React.FC = () => (
  <div style={{ paddingTop: 36 }}>
    <Head kicker="元気なうちに" title={<>やることは、<span style={{ color: C.green }}>3つ</span></>} kc={C.green} />
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32, marginTop: 38 }}>
      {TODO.map((it) => (
        <Drop key={it.no} at={it.at} dy={-22}>
          <div style={{ display: "flex", alignItems: "center", gap: 22, width: 920, background: C.greenBg, border: `4px solid ${C.green}`, borderRadius: 22, padding: "18px 28px", boxShadow: "0 8px 20px rgba(46,158,107,0.18)" }}>
            <div style={{ position: "relative", width: 136, height: 136, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <GenImg name={it.img} w={132} at={it.at} float={5} style={{ maxHeight: 132 }} />
              <span style={{ position: "absolute", left: -8, top: -8, width: 48, height: 48, borderRadius: "50%", background: C.green, color: "#fff", fontSize: 28, fontWeight: 900, display: "inline-flex", alignItems: "center", justifyContent: "center", border: "3px solid #fff" }}>{it.no}</span>
            </div>
            <div style={{ fontWeight: 900, fontSize: 40, color: C.ink, textAlign: "left", lineHeight: 1.25 }}>{it.t}</div>
          </div>
        </Drop>
      ))}
    </div>
    <Pop at={298} style={{ marginTop: 46, display: "flex", justifyContent: "center" }}>
      <div style={{ width: 920, background: C.goldBg, border: `3px solid ${C.gold}`, borderRadius: 16, padding: "24px 24px", textAlign: "center", fontWeight: 900, fontSize: 30, color: C.ink, lineHeight: 1.45 }}>
        ちなみに、NISAの資産も<b style={{ color: C.orange }}>相続税</b>の対象<br /><span style={{ fontSize: 25, fontWeight: 800, color: C.sub }}>〔3,000万＋600万×法定相続人〕の基礎控除内ならかからない</span>
      </div>
    </Pop>
  </div>
);

const PAGES: Record<number, React.FC> = { 1: PageHook, 2: PageFlow, 3: PagePoint1, 4: PagePoint2, 5: PageGraphLoss, 6: PageGraphGain, 7: PageTodo };

export const NisaSozokuDesign: React.FC<{ page?: number }> = ({ page = 2 }) => {
  const P = PAGES[page] ?? PageFlow;
  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <BackgroundFX />
      <AbsoluteFill style={{ transform: `translateY(${TOP_SAFE}px)` }}>
        <P />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
