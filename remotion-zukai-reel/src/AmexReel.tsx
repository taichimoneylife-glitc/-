import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { A2 } from "./components/kit2";
import { FONT } from "./components/font";
import { B, GenSlot } from "./MileLifePlan";
import { SfxTrack } from "./components/sfx";
import { K, SER, TypeIn } from "./components/zukaiKit";
import { Captions } from "./BourakuReel";
import { Scribble, Checklist, ReelUI } from "./components/fx";
import { AMEX_MOUTH } from "./amexMouth";

// ════════════════════════════════════════════════════════════════════
//  アメックスのポイント（図解パート・79秒。冒頭は実写）
//  音声＝public/amex-narration.wav（「1つ目〜」から）。数字は2026年11月 公式（ゴールド・プリファード＝プラス自動登録）
//  構成：損する5つ＝1画面に順に増える ／ おすすめ4つ＝1つずつ全画面（公式の交換レートを大きく）
//  画面の取り決め：横150〜930・縦280〜1180、テロップ1352（インスタの右ボタン・下の文章を避ける）
// ════════════════════════════════════════════════════════════════════
const F = (t: number) => Math.round(t * 30);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const OUT = Easing.bezier(0.16, 1, 0.3, 1);
const INK = A2.ink, RED = "#E8553B", BLUE = "#2F7BD9", GREEN = "#2E9E6B", GOLD = "#E9B82E", SUB = "#8C8471";

const Paper: React.FC = () => <AbsoluteFill style={{ background: A2.bg, backgroundImage: "repeating-linear-gradient(transparent 0 62px, rgba(176,146,60,0.22) 62px 64px)" }} />;
const pop = (f: number, at: number) => interpolate(f - F(at), [0, 4, 8], [0.4, 1.1, 1], clamp);
const rise = (f: number, at: number): React.CSSProperties => { const d = f - F(at); return { opacity: interpolate(d, [0, 5], [0, 1], clamp), transform: `translateY(${interpolate(d, [0, 10], [40, 0], { ...clamp, easing: OUT })}px)` }; };
const slam = (f: number, at: number): React.CSSProperties => { const d = f - F(at); const sh = d >= 4 && d < 12 ? Math.sin(d * 2.7) * (12 - d) * 1.4 : 0; return { opacity: interpolate(d, [0, 2], [0, 1], clamp), transform: `translate(${sh}px,0) scale(${interpolate(d, [0, 4, 7], [2.0, 0.94, 1], { ...clamp, easing: Easing.in(Easing.quad) })})` }; };

// ロゴ（public/logos・gitには入れない）
const Logo: React.FC<{ n: string; h: number; style?: React.CSSProperties }> = ({ n, h, style }) => <Img src={staticFile(`logos/${n}.png`)} style={{ height: h, width: "auto", objectFit: "contain", display: "block", ...style }} />;

// 付箋の見出し
const Sticky: React.FC<{ at: number; tag: React.ReactNode; title: string; c?: string }> = ({ at, tag, title, c = "#FFE58A" }) => {
  const f = useCurrentFrame(); const d = f - F(at);
  if (d < 0) return null;
  const k = interpolate(d, [0, 6, 10], [1.5, 0.95, 1], clamp);
  return (
    <div style={{ position: "absolute", left: 150, top: 290, display: "flex", alignItems: "center", gap: 22 }}>
      <div style={{ position: "relative", background: c, padding: "12px 24px 8px", transform: `rotate(-4deg) scale(${k})`, opacity: interpolate(d, [0, 3], [0, 1], clamp), boxShadow: "3px 6px 12px rgba(90,70,20,0.2)", ...K, fontSize: 34, color: INK, whiteSpace: "nowrap" }}>
        <div style={{ position: "absolute", left: "50%", top: -14, width: 80, height: 26, marginLeft: -40, background: "rgba(255,255,255,0.65)", transform: "rotate(4deg)" }} />{tag}
      </div>
      <div style={{ ...K, fontSize: 50, color: INK, whiteSpace: "nowrap" }}><TypeIn at={F(at) + 6} step={1.5}>{title}</TypeIn></div>
    </div>
  );
};

// 場面の出入り（横から入って横へ抜ける）
const Shot: React.FC<{ a: number; b: number; children: React.ReactNode }> = ({ a, b, children }) => {
  const f = useCurrentFrame();
  if (f < F(a) - 2 || f > F(b) + 8) return null;
  const inP = interpolate(f, [F(a), F(a) + 10], [0, 1], { ...clamp, easing: OUT });
  const outP = interpolate(f, [F(b), F(b) + 8], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  return <AbsoluteFill style={{ transform: `translateX(${(1 - inP) * 380 - outP * 1100}px) rotate(${(1 - inP) * 2}deg)`, opacity: Math.min(inP * 2, 1 - outP * 0.6), filter: inP < 0.8 || outP > 0.1 ? `blur(${Math.max((1 - inP) * 8, outP * 8)}px)` : undefined }}>{children}</AbsoluteFill>;
};

// ════════ 損する使い方5つ（0〜35.1） ════════
type Bad = { at: number; name: string; sub?: string; rate: string; val: string; unit: string; logo?: React.ReactNode };
const BADS: Bad[] = [
  { at: 0.0, name: "年会費以外のカード支払い", sub: "旅行の代金／それ以外", rate: "1pt → 0.8円／0.5円", val: "8,000／5,000", unit: "円" },
  { at: 7.26, name: "Amazonでポイント払い", logo: <><Logo n="amazon" h={36} style={{ marginTop: 10 }} /><span>でポイント払い</span></>, rate: "1pt → 0.5円", val: "5,000", unit: "円分" },
  { at: 11.72, name: "カタログのアイテム", sub: "例：ビール24本＝21,000pt", rate: "商品によって", val: "5,000円以下", unit: "も" },
  { at: 16.94, name: "楽天・Vポイント", logo: <><Logo n="rakuten_wm" h={26} /><span>・</span><Logo n="vpoint" h={40} /></>, sub: "楽天 3,000→1,400", rate: "V 1万→3,000", val: "3,000〜4,700", unit: "pt" },
  { at: 23.38, name: "JALマイル", logo: <><Logo n="jal" h={34} /><span>マイル</span></>, sub: "ANAなら10,000マイル", rate: "2,500pt → 1,000マイル", val: "4,000", unit: "マイル" },
];
const BadScene: React.FC = () => {
  const f = useCurrentFrame(); const t = f / 30;
  let cur = -1; BADS.forEach((b, i) => { if (t >= b.at) cur = i; });
  const plusAt = 29.3, unAt = 33.1;
  return (
    <>
      <Sticky at={0} tag="損する" title="使い方 5つ" c="#FFC4B5" />
      <div style={{ position: "absolute", left: 150, top: 420, width: 780 }}>
        <div style={{ display: "flex", justifyContent: "flex-end", ...B, fontSize: 24, color: SUB, marginBottom: 6, paddingRight: 14 }}>1万ポイントだと</div>
        {BADS.map((b, i) => {
          const d = f - F(b.at);
          if (d < 0) return <div key={i} style={{ height: 132 }} />;
          const on = i === cur && t < plusAt;
          const inP = interpolate(d, [0, 10], [0, 1], { ...clamp, easing: OUT });
          const vk = interpolate(d, [10, 14, 18], [0.3, 1.15, 1], clamp);
          return (
            <div key={i} style={{ position: "relative", height: 120, marginBottom: 12, background: on ? "#FFF6F2" : "#fff", border: `${on ? 5 : 4}px solid ${on ? RED : INK}`, borderRadius: 20, boxShadow: `5px 6px 0 ${on ? RED : INK}`, display: "flex", alignItems: "center", gap: 16, padding: "0 18px", boxSizing: "border-box", opacity: inP * (on || t >= plusAt ? 1 : 0.62), transform: `translateX(${(1 - inP) * -120}px) scale(${on ? 1.02 : 1})` }}>
              <div style={{ width: 54, height: 54, borderRadius: "50%", background: on ? RED : INK, color: "#fff", ...K, fontSize: 30, textAlign: "center", lineHeight: "54px", flex: "none" }}>{i + 1}</div>
              <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
                <div style={{ ...K, fontSize: 32, color: INK, whiteSpace: "nowrap", lineHeight: 1.15, display: "flex", alignItems: "center", gap: 6, height: 42 }}>{b.logo ?? b.name}</div>
                <div style={{ ...B, fontSize: 20, color: SUB, whiteSpace: "nowrap" }}>{b.sub ? `${b.sub}　` : ""}{b.rate}</div>
              </div>
              <div style={{ textAlign: "right", whiteSpace: "nowrap", transform: `scale(${vk})`, transformOrigin: "100% 50%" }}><span style={{ ...SER, fontSize: b.val.length > 6 ? 34 : 44, color: RED }}>{b.val}</span><span style={{ ...B, fontSize: 20, color: INK }}>{b.unit}</span></div>
            </div>
          );
        })}
      </div>
      {t >= plusAt ? <div style={{ position: "absolute", left: 650, top: 300, ...slam(f, plusAt) }}><span style={{ display: "inline-block", border: `5px solid ${BLUE}`, borderRadius: 14, padding: "2px 16px", ...K, fontSize: 26, color: BLUE, background: "#EEF5FF", transform: "rotate(-4deg)" }}>プラス登録の場合</span></div> : null}
      {t >= unAt ? <div style={{ position: "absolute", left: 150, top: 1130, width: 620, ...rise(f, unAt) }}><div style={{ background: "#2B2925", color: "#fff", borderRadius: 18, padding: "12px 20px", ...K, fontSize: 27, textAlign: "center" }}>未登録だと <span style={{ color: "#FFB4A2" }}>1pt → 0.3円</span> まで下がるものも</div></div> : null}
    </>
  );
};

// ════════ つなぎ：じゃあどう使う？（35.1〜40.2） ════════
const BridgeScene: React.FC = () => {
  const f = useCurrentFrame();
  const items = ["ANAマイル", "外資系のマイル", "ホテルのポイント", "カードの年会費"];
  return (
    <>
      <div style={{ position: "absolute", left: 0, width: 1080, top: 360, textAlign: "center", ...K, fontSize: 64, color: INK }}><TypeIn at={F(35.14)} step={1.5}>じゃあ、どう使う？</TypeIn></div>
      <div style={{ position: "absolute", left: 0, width: 1080, top: 470, textAlign: "center", ...B, fontSize: 34, color: SUB, ...rise(f, 36.8) }}>ポイントの価値を活かせる使い方</div>
      <div style={{ position: "absolute", left: 190, top: 570, width: 700, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
        {items.map((it, i) => (
          <div key={it} style={{ height: 210, background: "#fff", border: `5px solid ${INK}`, borderRadius: 26, boxShadow: `6px 8px 0 ${[BLUE, "#5B7FBF", GREEN, GOLD][i]}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, transform: `scale(${pop(f, 37.6 + i * 0.35)})`, opacity: f >= F(37.6 + i * 0.35) ? 1 : 0 }}>
            <div style={{ ...SER, fontSize: 64, color: [BLUE, "#5B7FBF", GREEN, "#B38A12"][i], lineHeight: 1 }}>{i + 1}</div>
            <div style={{ ...K, fontSize: 36, color: INK }}>{it}</div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 0, width: 1080, top: 1060, textAlign: "center", ...slam(f, 39.2) }}><span style={{ display: "inline-block", background: "#FFE58A", padding: "8px 30px", transform: "rotate(-2deg)", ...K, fontSize: 44, color: INK, boxShadow: "3px 6px 12px rgba(90,70,20,0.2)" }}>この4つ</span></div>
    </>
  );
};

// レートの大きなカード（1,000pt → 1,000マイル など）
const RateCard: React.FC<{ at: number; from: string; to: string; unit: string; c: string; ratio: string; top?: number; logo?: string }> = ({ at, from, to, unit, c, ratio, top = 420, logo }) => {
  const f = useCurrentFrame(); const d = f - F(at);
  if (d < 0) return null;
  const ar = interpolate(d, [6, 16], [0, 1], { ...clamp, easing: OUT });
  return (
    <div style={{ position: "absolute", left: 150, top, width: 780, height: 300, background: "#fff", border: `6px solid ${INK}`, borderRadius: 30, boxShadow: `8px 10px 0 ${c}`, ...rise(f, at) }}>
      <div style={{ position: "absolute", left: 24, top: 18, ...B, fontSize: 26, color: SUB }}>交換レート（公式）</div>
      {logo ? <Logo n={logo} h={44} style={{ position: "absolute", right: 26, top: 16 }} /> : null}
      <div style={{ position: "absolute", left: 0, right: 0, top: 70, display: "flex", alignItems: "center", justifyContent: "center", gap: 18 }}>
        <div style={{ textAlign: "center" }}><div style={{ ...SER, fontSize: 84, color: INK, lineHeight: 1 }}>{from}</div><div style={{ ...K, fontSize: 28, color: SUB }}>ポイント</div></div>
        <svg width={120} height={60}><line x1={6} y1={30} x2={6 + 96 * ar} y2={30} stroke={c} strokeWidth={10} strokeLinecap="round" />{ar > 0.9 ? <polyline points="86,10 110,30 86,50" fill="none" stroke={c} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" /> : null}</svg>
        <div style={{ textAlign: "center", opacity: ar, transform: `scale(${0.8 + 0.2 * ar})` }}><div style={{ ...SER, fontSize: 84, color: c, lineHeight: 1 }}>{to}</div><div style={{ ...K, fontSize: 28, color: SUB }}>{unit}</div></div>
      </div>
      <div style={{ position: "absolute", right: 22, bottom: 16, background: c, color: "#fff", borderRadius: 999, padding: "4px 22px", ...K, fontSize: 30, transform: `scale(${pop(f, at + 0.6)})` }}>{ratio}</div>
    </div>
  );
};
const Fact: React.FC<{ at: number; top: number; label: string; value: React.ReactNode; c?: string; left?: number; w?: number }> = ({ at, top, label, value, c = INK, left = 150, w = 780 }) => {
  const f = useCurrentFrame();
  if (f < F(at)) return null;
  return (
    <div style={{ position: "absolute", left, top, width: w, height: 104, background: "#fff", border: `4px solid ${INK}`, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", boxSizing: "border-box", ...rise(f, at) }}>
      <span style={{ ...K, fontSize: 30, color: SUB, whiteSpace: "nowrap" }}>{label}</span><span style={{ ...K, fontSize: 40, color: c, whiteSpace: "nowrap" }}>{value}</span>
    </div>
  );
};

// ════════ おすすめ① ANAマイル（40.2〜46.1） ════════
const AnaScene: React.FC = () => (
  <>
    <Sticky at={40.24} tag="おすすめ①" title="ANAマイル" c="#CFE3FF" />
    <RateCard at={40.5} from="1,000" to="1,000" unit="マイル" c={BLUE} ratio="1対1" logo="ana" />
    <Fact at={42.7} top={760} label="1万ポイントだと" value={<><span style={{ ...SER, fontSize: 52, color: BLUE }}>10,000</span><span style={{ fontSize: 26 }}>マイル</span></>} />
    <Fact at={44.98} top={884} label="年間の上限" value={<span style={{ color: RED }}>年4万マイルまで</span>} />
    <Fact at={45.4} top={1008} label="移行の参加費" value={<>年5,500円<span style={{ ...B, fontSize: 22, color: SUB }}>（プラチナは無料）</span></>} />
    <Scribble at={F(45.1)} cx={720} cy={936} rx={190} ry={52} note="" nx={0} ny={0} />
  </>
);

// ════════ おすすめ② 外資系の航空会社（46.1〜53.5） ════════
const AIRLINES = ["singapore", "cathay", "qatar", "british", "qantas", "delta", "afklm", "thai", "sas", "virgin", "emirates"];
const LOGO_H: Record<string, number> = { singapore: 22, cathay: 30, qatar: 54, british: 24, qantas: 24, delta: 34, afklm: 34, thai: 46, sas: 44, virgin: 40, emirates: 60 };
const ForeignScene: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <Sticky at={46.14} tag="おすすめ②" title="外資系マイル" c="#D9E2F5" />
      <RateCard at={46.5} from="1,250" to="1,000" unit="マイル" c="#5B7FBF" ratio="1対0.8" top={410} />
      <div style={{ position: "absolute", left: 150, top: 735, width: 780, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        {AIRLINES.map((a, i) => {
          const at = 47.2 + i * 0.12;
          const off = a === "emirates";
          return (
            <div key={a} style={{ position: "relative", height: 82, background: "#fff", border: `3px solid ${off ? "#C9C2B0" : INK}`, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 10px", boxSizing: "border-box", transform: `scale(${pop(f, at)})`, opacity: f >= F(at) ? 1 : 0 }}>
              <Logo n={a} h={LOGO_H[a]} style={{ maxWidth: "100%", opacity: off ? 0.35 : 1, filter: off ? "grayscale(1)" : undefined }} />
              {off ? <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ background: "#2B2925", color: "#fff", borderRadius: 8, padding: "2px 12px", ...K, fontSize: 22, transform: "rotate(-6deg)" }}>休止中</span></div> : null}
            </div>
          );
        })}
      </div>
      {f >= F(50.8) ? (
        <div style={{ position: "absolute", left: 150, top: 1030, width: 780, display: "flex", gap: 16, ...rise(f, 50.8) }}>
          <div style={{ flex: 1, background: "#fff", border: `4px solid ${INK}`, borderRadius: 18, padding: "10px 0", textAlign: "center" }}><div style={{ ...B, fontSize: 22, color: SUB }}>ANA</div><div style={{ ...K, fontSize: 34, color: INK }}>年4万マイルまで</div></div>
          <div style={{ flex: 1, background: "#EEF5FF", border: `5px solid #5B7FBF`, borderRadius: 18, padding: "10px 0", textAlign: "center", transform: `scale(${pop(f, 52.1)})`, opacity: f >= F(52.1) ? 1 : 0 }}><div style={{ ...B, fontSize: 22, color: SUB }}>外資系</div><div style={{ ...K, fontSize: 34, color: "#3D5E9E" }}>年間の上限なし</div></div>
        </div>
      ) : null}
    </>
  );
};

// ════════ おすすめ③ ホテル（53.5〜68.9） ════════
const HotelScene: React.FC = () => {
  const f = useCurrentFrame(); const t = f / 30;
  const card = (x: number, name: string, from: string, to: string, ten: string, at: number, win: boolean) => {
    const glowH = name === "ヒルトン" && t >= 60.7 && t < 65.7;
    const winOn = win && t >= 66.9;
    return (
      <div style={{ position: "absolute", left: x, top: 430, width: 380, height: 460, background: "#fff", border: `6px solid ${winOn ? GOLD : INK}`, borderRadius: 28, boxShadow: winOn ? `0 0 0 8px ${GOLD}55, 7px 9px 0 ${GOLD}` : `7px 9px 0 ${GREEN}`, ...rise(f, at), padding: "22px 0", boxSizing: "border-box", textAlign: "center", opacity: (f >= F(at) ? 1 : 0) * (t >= 66.9 && !win ? 0.55 : 1) }}>
        <div style={{ height: 70, display: "flex", alignItems: "center", justifyContent: "center" }}><Logo n={name === "ヒルトン" ? "hilton" : "marriott"} h={name === "ヒルトン" ? 62 : 92} /></div>
        <div style={{ ...B, fontSize: 24, color: SUB, marginTop: 12 }}>交換レート</div>
        <div style={{ ...K, fontSize: 36, color: INK }}>{from} → <span style={{ color: GREEN }}>{to}</span></div>
        <div style={{ height: 3, background: "#EEE6CF", margin: "20px 30px" }} />
        <div style={{ ...B, fontSize: 24, color: SUB }}>1万ポイントだと</div>
        <div style={{ ...SER, fontSize: 76, color: GREEN, lineHeight: 1.1 }}>{ten}</div>
        <div style={{ ...K, fontSize: 26, color: SUB }}>ポイント</div>
        {glowH ? <div style={{ position: "absolute", left: 90, top: -30, background: "#FFE58A", padding: "4px 18px", ...K, fontSize: 28, color: INK, transform: `rotate(-4deg) scale(${pop(f, 60.7)})`, boxShadow: "3px 5px 10px rgba(0,0,0,0.15)" }}>お得そう？</div> : null}
        {winOn ? <div style={{ position: "absolute", left: 60, top: -40, background: GOLD, border: `4px solid ${INK}`, borderRadius: 999, padding: "4px 20px", ...K, fontSize: 28, color: INK, transform: `scale(${pop(f, 66.9)})` }}>1ptの価値が高い</div> : null}
      </div>
    );
  };
  return (
    <>
      <Sticky at={53.46} tag="おすすめ③" title="ホテル" c="#CDEBDB" />
      {card(150, "ヒルトン", "1,000", "1,250", "12,500", 55.3, false)}
      {card(550, "マリオット", "1,000", "990", "9,900", 58.6, true)}
      {t >= 62.98 ? (
        <div style={{ position: "absolute", left: 150, top: 930, width: 780, ...rise(f, 62.98) }}>
          <div style={{ background: "#fff", border: `4px solid ${INK}`, borderRadius: 20, padding: "14px 24px", display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: 44 }}>🛏️</span>
            <div><div style={{ ...K, fontSize: 32, color: INK }}>ヒルトンは1泊に必要なポイントが<span style={{ color: RED }}>多め</span></div><div style={{ ...B, fontSize: 22, color: SUB }}>1ポイントの価値 ＝ 宿泊代 ÷ 必要なポイント</div></div>
          </div>
        </div>
      ) : null}
      {t >= 66.9 ? <div style={{ position: "absolute", left: 0, width: 1080, top: 1080, textAlign: "center", ...slam(f, 66.9) }}><span style={{ display: "inline-block", border: `6px solid ${GREEN}`, borderRadius: 14, padding: "2px 24px", ...K, fontSize: 38, color: GREEN, background: "#F2FBF6", transform: "rotate(-3deg)" }}>マリオットが高くなりやすい</span></div> : null}
    </>
  );
};

// ════════ おすすめ④ 年会費（68.9〜73.8） ════════
const FeeScene: React.FC = () => (
  <>
    <Sticky at={68.9} tag="おすすめ④" title="年会費" c="#FFE58A" />
    <RateCard at={69.2} from="1" to="1" unit="円" c="#B38A12" ratio="1pt＝1円" />
    <Fact at={70.9} top={760} label="1万ポイントだと" value={<><span style={{ ...SER, fontSize: 52, color: "#B38A12" }}>10,000</span><span style={{ fontSize: 26 }}>円分</span></>} />
    <Fact at={72.5} top={884} label="年会費の負担を" value={<span style={{ color: GREEN }}>軽くできる</span>} />
    <Fact at={72.9} top={1008} label="ANA移行の参加費にも" value="1pt＝1円で使える" />
  </>
);

// ════════ 締め（73.8〜79） ════════
const EndScene: React.FC = () => {
  const f = useCurrentFrame();
  const g = interpolate(f, [F(75.6), F(75.6) + 20], [0, 1], { ...clamp, easing: OUT });
  return (
    <>
      <div style={{ position: "absolute", left: 0, width: 1080, top: 330, textAlign: "center", ...K, fontSize: 52, color: INK }}><TypeIn at={F(73.84)} step={1.2}>同じ1万ポイントでも</TypeIn></div>
      <div style={{ position: "absolute", left: 150, top: 470, width: 780 }}>
        {([["商品券・Vポイント", "3,000円分", 0.3, RED], ["Amazon", "5,000円分", 0.5, RED], ["年会費", "10,000円分", 1, GOLD], ["ANAマイル", "10,000マイル", 1, BLUE]] as const).map(([n, v, w, c], i) => (
          <div key={n} style={{ display: "flex", alignItems: "center", gap: 16, height: 110 }}>
            <div style={{ width: 230, textAlign: "right", ...K, fontSize: 30, color: INK, whiteSpace: "nowrap" }}>{n}</div>
            <div style={{ height: 70, width: 400 * w * interpolate(g - i * 0.12, [0, 0.6], [0, 1], clamp), background: c, borderRadius: 12, border: `4px solid ${INK}`, boxSizing: "border-box" }} />
            <div style={{ ...SER, fontSize: 32, color: c, whiteSpace: "nowrap", opacity: g > 0.5 ? 1 : 0 }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 0, width: 1080, top: 950, textAlign: "center", ...slam(f, 76.3) }}><span style={{ display: "inline-block", background: RED, color: "#fff", border: `6px solid ${INK}`, borderRadius: 20, padding: "8px 34px", ...K, fontSize: 52, boxShadow: `6px 8px 0 ${INK}` }}>使い方で価値が変わる</span></div>
      <ReelUI at={F(77.3)} pointSave={F(77.5)} caption="保存して参考にしてね" />
    </>
  );
};

// 太一：気持ちが動く所だけ。締めは口が動く
const APPEAR: [number, number, string][] = [[29.3, 35.1, "taichi_worry"], [35.14, 40.2, "taichi_idea"], [60.7, 68.9, "taichi_think_chin"], [73.84, 79.1, "__talk"]];
const Chara: React.FC = () => {
  const f = useCurrentFrame();
  const a = APPEAR.find(([s0, e]) => f >= F(s0) - 2 && f < F(e) + 8);
  if (!a) return null;
  const [s0, e, name] = a;
  const inP = interpolate(f, [F(s0) - 2, F(s0) + 8], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.6)) });
  const outP = interpolate(f, [F(e), F(e) + 8], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  let img = name;
  if (name === "__talk") { const lv = AMEX_MOUTH.charCodeAt(Math.min(AMEX_MOUTH.length - 1, f)) - 48; img = f % 84 >= 80 && lv === 0 ? "taichi_blink" : lv >= 2 ? (Math.floor(f / 2) % 3 === 0 ? "taichi_talk_mid" : "taichi_talk_open") : lv === 1 ? "taichi_talk_mid" : "taichi_talk_closed"; }
  return <div style={{ position: "absolute", left: 770 + (1 - inP) * 380 + outP * 380, top: 1150 + Math.sin(f / 10) * 3, width: 190, height: 190 }}><GenSlot name={img} size={190} /></div>;
};

const CapBand: React.FC = () => {
  const f = useCurrentFrame();
  const w = interpolate(f, [0, 10], [0, 1], { ...clamp, easing: OUT }) * (1 - interpolate(f, [F(78.9), F(78.9) + 6], [0, 1], clamp));
  return <div style={{ position: "absolute", left: 540 - 410 * w, width: 820 * w, top: 1340, height: 112, borderRadius: 999, background: "rgba(255,255,255,0.72)", boxShadow: "0 6px 18px rgba(120,90,20,0.10)" }} />;
};
const SUBS: [number, string][] = [
  [0.0, "1つ目 *年会費以外のカードの支払い*"], [2.82, "旅行の代金なら!8,000円!"], [4.58, "それ以外は!5,000円!"], [5.74, "1万円分にはならないよ"],
  [7.26, "2つ目 *Amazonでのポイント払い*"], [9.34, "1万ポイントで買えるのは!5,000円分!だけ"],
  [11.72, "3つ目 *カタログのアイテム*"], [13.44, "商品によっては1万ポイントが"], [15.44, "!5,000円以下!の価値になるよ"],
  [16.94, "4つ目 *楽天ポイントやVポイント*"], [19.66, "1万ポイントが"], [20.8, "!3,000〜4,700ポイント!くらいに"],
  [23.38, "そして5つ目が *JALマイル*"], [24.84, "マイルならお得そうだけど"], [26.24, "1万ポイントが!4,000マイル!"], [27.98, "ANAの半分以下だよ"],
  [29.3, "しかもこれ、*プラスに登録*した場合のレート"], [33.12, "未登録だと、もっと低くなるよ"],
  [35.14, "じゃあ、どう使えばいいのか"], [36.82, "ポイントの価値を活かせる使い方を*4つ*"],
  [40.24, "1つ目 *ANAマイルに交換*"], [42.24, "*1対1*で、いちばん効率がいい"], [44.98, "!年間上限!には注意"],
  [46.14, "2つ目 *外資系の航空会社のマイル*"], [49.02, "レートは1対0.8だけど"], [50.82, "ANAみたいな*年間の上限がない*よ"],
  [53.46, "3つ目 *ホテルのポイント*"], [55.38, "ヒルトンは1万ポイントが*12,500*ポイントに"], [58.68, "マリオットは*9,900*ポイント"],
  [60.7, "数字だけ見ると、ヒルトンがお得そうだけど"], [62.98, "ヒルトンは1泊に必要なポイントが!多め!だから"], [65.7, "1ポイントの価値は"], [66.9, "*マリオット*のほうが高くなりやすいよ"],
  [68.9, "4つ目 *カードの年会費に充てる*"], [70.9, "ポイントで年会費の負担を"], [72.5, "軽減するのもありだよ"],
  [73.84, "せっかく貯めたアメックスのポイント"], [75.64, "*使い方で価値がまったく変わる*から"], [77.44, "*保存*して参考にしてね"],
];
const CUES: { file: string; at: number; volume: number }[] = [
  ...[0, 7.26, 11.72, 16.94, 23.38].map((t) => ({ file: "user/u02s", at: F(t), volume: 0.22 })),
  ...[4.2, 9.9, 15.6, 21.0, 27.2].map((t) => ({ file: "user/u05s", at: F(t), volume: 0.2 })),
  { file: "user/u04", at: F(29.3), volume: 0.26 },
  ...[35.14, 40.24, 46.14, 53.46, 68.9, 73.84].map((t) => ({ file: "user/u03s", at: F(t), volume: 0.24 })),
  ...[37.6, 37.95, 38.3, 38.65].map((t) => ({ file: "user/u02s", at: F(t), volume: 0.18 })),
  { file: "user/u05", at: F(41.0), volume: 0.24 }, { file: "user/u04", at: F(44.98), volume: 0.24 },
  { file: "user/u05", at: F(47.0), volume: 0.24 }, { file: "user/u05s", at: F(52.1), volume: 0.22 },
  ...[55.3, 58.6].map((t) => ({ file: "user/u02s", at: F(t), volume: 0.2 })), { file: "user/u04", at: F(66.9), volume: 0.26 },
  { file: "user/u05", at: F(69.6), volume: 0.24 }, { file: "user/u04", at: F(76.3), volume: 0.26 }, { file: "user/u10", at: F(77.5), volume: 0.26 },
];
const CHECK = ["ANAマイル", "外資系のマイル", "ホテル", "年会費"];
const CheckWrap: React.FC = () => {
  const f = useCurrentFrame(); const t = f / 30;
  if (t < 40.24 || t >= 73.84) return null;
  const cur = t >= 68.9 ? 3 : t >= 53.46 ? 2 : t >= 46.14 ? 1 : 0;
  return <div style={{ position: "absolute", right: 120, top: 210, width: 380, transform: "scale(0.6)", transformOrigin: "100% 0" }}><Checklist title="おすすめ" items={CHECK} cur={cur} x={0} y={0} w={380} /></div>;
};

export const AMEX_FRAMES = F(79.1);
export const AmexReel: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: FONT }}>
    <Paper />
    <Audio src={staticFile("amex-narration.wav")} />
    <SfxTrack cues={CUES} />
    <Shot a={0} b={35.0}><BadScene /></Shot>
    <Shot a={35.1} b={40.1}><BridgeScene /></Shot>
    <Shot a={40.2} b={46.0}><AnaScene /></Shot>
    <Shot a={46.1} b={53.35}><ForeignScene /></Shot>
    <Shot a={53.4} b={68.8}><HotelScene /></Shot>
    <Shot a={68.85} b={73.75}><FeeScene /></Shot>
    <Shot a={73.8} b={80}><EndScene /></Shot>
    <CheckWrap />
    <Chara />
    <CapBand />
    <Captions subs={SUBS} end={78.9} maxW={740} size={0.78} kcol={{ g: RED, r: RED }} top={1352} swap />
  </AbsoluteFill>
);
