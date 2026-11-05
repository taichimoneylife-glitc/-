import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { A2 } from "./components/kit2";
import { FONT } from "./components/font";
import { B } from "./MileLifePlan";
import { SfxTrack } from "./components/sfx";
import { K, SER, TypeIn } from "./components/zukaiKit";
import { Captions } from "./BourakuReel";
import { Scribble, Checklist, ReelUI } from "./components/fx";
import { AMEX_MOUTH } from "./amexMouth";
import { Board, type Panel, type Stop } from "./components/board";

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

// たいちさんの絵（public/gen）
const Gen: React.FC<{ n: string; w: number; style?: React.CSSProperties }> = ({ n, w, style }) => <Img src={staticFile(`gen/${n}.png`)} style={{ width: w, height: "auto", display: "block", ...style }} />;
// 光るコイン（絵）＋真ん中に文字。face＝コインの面の中心（絵の幅・高さに対する割合）
const CoinArt: React.FC<{ w: number; big: string; small: string; style?: React.CSSProperties }> = ({ w, big, small, style }) => (
  <div style={{ position: "absolute", width: w, ...style }}>
    <Gen n="amex_coin_shine" w={w} />
    <div style={{ position: "absolute", left: w * 0.44 - 150, top: w * 0.866 * 0.5 - w * 0.13, width: 300, textAlign: "center", lineHeight: 1 }}>
      <div style={{ ...SER, fontSize: w * 0.2, color: INK }}>{big}</div><div style={{ ...K, fontSize: w * 0.085, color: INK, marginTop: w * 0.02 }}>{small}</div>
    </div>
  </div>
);

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

// ════════ 損する使い方5つ（0〜35.1）：上＝5つの枠が順に埋まる／下＝1つずつ違う動きで「なぜ損か」を見せる ════════
type Bad = { at: number; end: number; reveal: number; name: string; logo?: React.ReactNode; val: string; unit: string };
const BADS: Bad[] = [
  { at: 0.0, end: 7.2, reveal: 4.9, name: "年会費以外のカード支払い", val: "8,000／5,000", unit: "円" },
  { at: 7.26, end: 11.66, reveal: 10.1, name: "Amazonでポイント払い", logo: <><Logo n="amazon" h={32} style={{ marginTop: 9 }} /><span>でポイント払い</span></>, val: "5,000", unit: "円分" },
  { at: 11.72, end: 16.9, reveal: 15.6, name: "カタログのアイテム", val: "5,000円以下", unit: "も" },
  { at: 16.94, end: 23.32, reveal: 21.2, name: "楽天・Vポイント", logo: <><Logo n="rakuten_wm" h={24} /><span>・</span><Logo n="vpoint" h={36} /></>, val: "3,000〜4,700", unit: "pt" },
  { at: 23.38, end: 29.25, reveal: 26.9, name: "JALマイル", logo: <><Logo n="jal" h={32} /><span>マイル</span></>, val: "4,000", unit: "マイル" },
];
const ROW_TOP = 400, ROW_H = 86, ROW_GAP = 10;
const ease = (f: number, a: number, dur: number) => interpolate(f - F(a), [0, F(dur)], [0, 1], { ...clamp, easing: OUT });
const num = (v: number) => Math.round(v).toLocaleString("en-US");

// 下の舞台：入る＝下からポン、出る＝小さくなって上の枠へ吸い込まれる
const Stage: React.FC<{ a: number; b: number; slot?: number; children: React.ReactNode }> = ({ a, b, slot, children }) => {
  const f = useCurrentFrame();
  if (f < F(a) || f > F(b) + 9) return null;
  const i = interpolate(f - F(a), [0, 9], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.4)) });
  const o = interpolate(f - F(b), [0, 9], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const ty = slot === undefined ? o * 200 : o * (ROW_TOP + slot * (ROW_H + ROW_GAP) + 40 - 1090);
  return <AbsoluteFill style={{ opacity: Math.min(1, i * 1.5) * (1 - o), transform: `translateY(${(1 - i) * 90 + ty}px) scale(${(0.9 + 0.1 * i) * (1 - 0.7 * o)})`, transformOrigin: "540px 1090px" }}>{children}</AbsoluteFill>;
};

// ① ゲージ：旅行8,000／それ以外5,000、1万に届かない分が赤く点滅
const HeroGauge: React.FC = () => {
  const f = useCurrentFrame();
  const W = 520, X = 400;
  const g1 = ease(f, 2.82, 0.9), g2 = ease(f, 4.58, 0.9), lack = f >= F(5.74);
  const blink = lack ? 0.55 + 0.45 * Math.sin((f - F(5.74)) / 3) : 0;
  const bar = (top: number, label: string, p: number, rate: number, val: number) => (
    <div style={{ position: "absolute", left: X, top, width: W }}>
      <div style={{ ...K, fontSize: 28, color: INK, marginBottom: 6 }}>{label}<span style={{ ...B, fontSize: 22, color: SUB, marginLeft: 10 }}>1pt＝{rate}円</span></div>
      <div style={{ position: "relative", height: 58, borderRadius: 14, border: `4px dashed ${INK}55`, boxSizing: "border-box", overflow: "hidden", background: "#fff" }}>
        <div style={{ position: "absolute", left: W * rate * p, top: 0, bottom: 0, width: W * (1 - rate), background: `repeating-linear-gradient(45deg, ${RED}${lack ? "" : "00"} 0 10px, transparent 10px 20px)`, opacity: blink }} />
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: W * rate * p, background: GOLD, borderRight: p > 0 ? `4px solid ${INK}` : "none", boxSizing: "border-box" }} />
        <div style={{ position: "absolute", left: 16, top: 2, ...SER, fontSize: 36, lineHeight: "48px", color: INK, opacity: p > 0.05 ? 1 : 0 }}>{num(val * p)}<span style={{ ...B, fontSize: 20 }}>円</span></div>
      </div>
      {lack ? <div style={{ position: "absolute", right: 8, top: 52, ...K, fontSize: 30, color: RED, transform: `scale(${pop(f, 5.74)})` }}>−{num(10000 - val)}</div> : null}
    </div>
  );
  return (
    <>
      {/* 左の絵：カード支払い → 「旅行」でスーツケース → 「それ以外」でカードに戻る */}
      {(() => {
        const cur = f >= F(4.58) ? ["amex_card_bill", 4.58] : f >= F(2.82) ? ["amex_travel_pay", 2.82] : ["amex_card_bill", 0.4];
        return <div key={cur[0] as string + cur[1]} style={{ position: "absolute", left: 140, top: 975, transform: `rotate(${Math.sin(f / 14) * 3}deg) scale(${pop(f, cur[1] as number)})` }}><Gen n={cur[0] as string} w={240} /></div>;
      })()}
      <div style={{ position: "absolute", left: X + W - 2, top: 950, height: 260, borderLeft: `4px solid ${INK}`, opacity: lack ? 1 : 0.25 }} />
      <div style={{ position: "absolute", left: X + W - 60, top: 918, ...K, fontSize: 24, color: INK, opacity: lack ? 1 : 0.4 }}>1万円</div>
      {bar(960, "旅行の代金", g1, 0.8, 8000)}
      {bar(1080, "それ以外", g2, 0.5, 5000)}
    </>
  );
};

// ② 1万ptのチケットをハサミで半分に → 右半分が落ちる
const HeroTicket: React.FC = () => {
  const f = useCurrentFrame();
  const cut = ease(f, 9.34, 0.5), fall = interpolate(f - F(9.9), [0, 22], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const L = 390, T = 960, W = 540, H = 250;
  const ticket = (half: "l" | "r") => (
    <div style={{ position: "absolute", left: L, top: T, width: W, height: H, clipPath: half === "l" ? `inset(0 ${W / 2}px 0 0)` : `inset(0 0 0 ${W / 2}px)`, transform: half === "r" ? `translate(${fall * 150}px, ${fall * 200}px) rotate(${fall * 22}deg)` : undefined, opacity: half === "r" ? 1 - fall : 1 }}>
      <div style={{ position: "absolute", inset: 0, background: "#fff", border: `6px solid ${INK}`, borderRadius: 26, boxShadow: `7px 9px 0 ${GOLD}` }} />
      <Logo n="amazon" h={46} style={{ position: "absolute", left: 34, top: 26 }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 96, textAlign: "center", ...SER, fontSize: 92, color: INK, lineHeight: 1 }}>10,000<span style={{ ...K, fontSize: 36 }}>pt</span></div>
      <div style={{ position: "absolute", left: -22, top: H / 2 - 22, width: 44, height: 44, borderRadius: "50%", background: A2.bg, border: `6px solid ${INK}` }} />
      <div style={{ position: "absolute", right: -22, top: H / 2 - 22, width: 44, height: 44, borderRadius: "50%", background: A2.bg, border: `6px solid ${INK}` }} />
    </div>
  );
  return (
    <>
      <div style={{ position: "absolute", left: 140, top: 975, transform: `rotate(${Math.sin(f / 12) * 3}deg) scale(${pop(f, 7.5)})` }}><Gen n="amex_shopping_box" w={230} /></div>
      {ticket("r")}{ticket("l")}
      {f >= F(9.34) && fall < 0.05 ? <div style={{ position: "absolute", left: L + W / 2 - 2, top: T - 20, height: (H + 40) * cut, borderLeft: `5px dashed ${RED}` }} /> : null}
      {f >= F(9.34) && fall < 0.05 ? <div style={{ position: "absolute", left: L + W / 2 - 30, top: T - 60 + (H + 40) * cut, fontSize: 56, transform: "rotate(90deg)" }}>✂️</div> : null}
      {f >= F(10.1) ? <div style={{ position: "absolute", left: L, width: W / 2, top: T + H + 18, textAlign: "center", ...K, fontSize: 44, color: INK, ...slam(f, 10.1) }}><span style={{ background: "#FFE58A", padding: "2px 18px" }}>5,000円分</span></div> : null}
      {f >= F(10.3) ? <div style={{ position: "absolute", left: L + W / 2 + 40, top: T + 30, ...K, fontSize: 46, color: RED, transform: `rotate(-8deg) scale(${pop(f, 10.3)})` }}>−5,000円</div> : null}
    </>
  );
};

// ③ カタログが開く → ビール24本 → 値札がくるっと裏返って「5,000円以下」
const HeroCatalog: React.FC = () => {
  const f = useCurrentFrame();
  const open = ease(f, 12.3, 0.7), flip = ease(f, 15.44, 0.5);
  return (
    <>
      <div style={{ position: "absolute", left: 140, top: 950, transform: `translateY(${(1 - open) * 60}px) rotate(${(1 - open) * -8}deg) scale(${0.7 + 0.3 * open})`, opacity: Math.min(1, open * 2) }}>
        <Gen n="amex_catalog_beer" w={400} />
      </div>
      {f >= F(12.9) ? <div style={{ position: "absolute", left: 360, top: 935, background: INK, color: "#fff", borderRadius: 999, padding: "4px 18px", ...K, fontSize: 26, transform: `rotate(6deg) scale(${pop(f, 12.9)})` }}>ビール24本</div> : null}
      <div style={{ position: "absolute", left: 560, top: 980, width: 350, height: 220, perspective: 1000, opacity: f >= F(13.44) ? 1 : 0, transform: `scale(${pop(f, 13.44)})` }}>
        <div style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d", transform: `rotateX(${180 * flip}deg)` }}>
          <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", background: "#fff", border: `5px solid ${INK}`, borderRadius: 20, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ ...B, fontSize: 26, color: SUB }}>交換に必要</div><div style={{ ...SER, fontSize: 70, color: INK }}>21,000<span style={{ ...K, fontSize: 28 }}>pt</span></div>
          </div>
          <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", transform: "rotateX(180deg)", background: "#FFF2EE", border: `5px solid ${RED}`, borderRadius: 20, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ ...B, fontSize: 26, color: SUB }}>1万ポイントあたり</div><div style={{ ...SER, fontSize: 62, color: RED }}>5,000円<span style={{ ...K, fontSize: 30 }}>以下</span></div>
          </div>
        </div>
      </div>
    </>
  );
};

// ④ 交換マシン：コイン10枚が入って、少なくなって出てくる
const Coin: React.FC<{ x: number; y: number; c?: string }> = ({ x, y, c = GOLD }) => <div style={{ position: "absolute", left: x, top: y, width: 110, height: 30, borderRadius: "50%", background: c, border: `4px solid ${INK}`, boxSizing: "border-box" }} />;
const HeroMachine: React.FC = () => {
  const f = useCurrentFrame();
  const t0 = F(17.7), W = 660, L = 190, T = 990;
  const shake = f > t0 && f < F(20.8) ? Math.sin(f * 2.3) * 5 : 0;
  const r = ease(f, 20.8, 0.8), v = ease(f, 21.4, 0.8);
  return (
    <>
      <div style={{ position: "absolute", left: L, top: T, transform: `translateX(${shake}px)` }}><Gen n="amex_points_exchange" w={W} /></div>
      <div style={{ position: "absolute", left: L - 10, top: T + 240, width: 240, textAlign: "center", ...SER, fontSize: 40, color: INK }}>{num(10000)}<span style={{ ...K, fontSize: 22 }}>pt</span></div>
      {f >= F(20.8) ? <div style={{ position: "absolute", left: 470, top: 920, width: 460, display: "flex", gap: 12, transform: `scale(${pop(f, 20.8)})`, transformOrigin: "50% 100%" }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", border: `4px solid ${INK}`, borderRadius: 14, padding: "4px 12px" }}><Logo n="rakuten_wm" h={22} /><span style={{ ...SER, fontSize: 36, color: RED }}>{num(4700 * r)}</span></div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", border: `4px solid ${INK}`, borderRadius: 14, padding: "4px 12px", opacity: f >= F(21.4) ? 1 : 0 }}><Logo n="vpoint" h={38} /><span style={{ ...SER, fontSize: 36, color: RED }}>{num(3000 * v)}</span></div>
      </div> : null}
    </>
  );
};

// ⑤ JAL と ANA のバー競争 → 「半分以下」
const HeroRace: React.FC = () => {
  const f = useCurrentFrame();
  const W = 380, X = 420;
  const j = ease(f, 26.24, 0.8), a = ease(f, 27.98, 0.9);
  const plane = interpolate(f - F(24.84), [0, 30], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const row = (top: number, logo: string, h: number, p: number, max: number, c: string) => (
    <div style={{ position: "absolute", left: 160, top, width: 770, height: 100, display: "flex", alignItems: "center" }}>
      <div style={{ width: 250, display: "flex", justifyContent: "center" }}><Logo n={logo} h={h} /></div>
      <div style={{ position: "relative", width: W, height: 70 }}>
        <div style={{ position: "absolute", left: 0, top: 0, height: 70, width: W * max * p, background: c, border: p > 0 ? `4px solid ${INK}` : "none", borderRadius: 14, boxSizing: "border-box" }} />
        {p > 0 ? <div style={{ position: "absolute", left: W * max * p - 70, top: -46, transform: `rotate(${logo === "ana" ? -8 : 0}deg)` }}><Gen n={logo === "ana" ? "amex_plane_blue" : "amex_plane_red"} w={logo === "ana" ? 110 : 120} /></div> : null}
        <div style={{ position: "absolute", left: W * max * p + 12, top: 8, ...SER, fontSize: 42, color: c, opacity: p > 0.05 ? 1 : 0, whiteSpace: "nowrap" }}>{num(10000 * max * p)}<span style={{ ...B, fontSize: 20, color: INK }}>マイル</span></div>
      </div>
    </div>
  );
  return (
    <>
      {plane > 0 && plane < 1 ? <div style={{ position: "absolute", left: -120 + plane * 1300, top: 1180 - plane * 260, transform: "rotate(-14deg)" }}><Gen n="amex_plane_red" w={260} /></div> : null}
      {row(990, "jal", 50, j, 0.4, RED)}
      {row(1110, "ana", 46, a, 1, BLUE)}
      {f >= F(28.3) ? <div style={{ position: "absolute", left: 160 + 250 + W * 0.4 + 230, top: 1004, ...K, fontSize: 40, color: RED, transform: `rotate(-6deg) scale(${pop(f, 28.3)})`, whiteSpace: "nowrap" }}>← 半分以下</div> : null}
    </>
  );
};

// ⑥ プラス登録スイッチ：ON → OFF で全部の数字が沈む
const HeroSwitch: React.FC = () => {
  const f = useCurrentFrame();
  const off = ease(f, 33.12, 0.35);
  return (
    <>
      <div style={{ position: "absolute", left: 150, top: 950, width: 170, transform: `scale(${(1 - off) * pop(f, 29.4)}) rotate(${-6 * (1 - off)}deg)`, opacity: 1 - off }}><Gen n="amex_membership_phone" w={150} /></div>
      {off > 0 ? <div style={{ position: "absolute", left: 130, top: 990, transform: `scale(${pop(f, 33.2)})` }}><Gen n="amex_coins_shrink" w={210} /></div> : null}
      <div style={{ position: "absolute", left: 340, top: 980, width: 430, height: 170, background: "#fff", border: `5px solid ${INK}`, borderRadius: 26, boxShadow: `6px 8px 0 ${INK}`, display: "flex", alignItems: "center", padding: "0 30px", boxSizing: "border-box", gap: 20 }}>
        <div style={{ flex: 1 }}><div style={{ ...B, fontSize: 24, color: SUB }}>メンバーシップ・リワード</div><div style={{ ...K, fontSize: 44, color: INK }}>プラス</div></div>
        <div style={{ position: "relative", width: 150, height: 80, borderRadius: 999, background: off > 0.5 ? "#C9C2B0" : BLUE, border: `4px solid ${INK}` }}>
          <div style={{ position: "absolute", top: 6, left: 6 + 70 * (1 - off), width: 60, height: 60, borderRadius: "50%", background: "#fff", border: `4px solid ${INK}`, boxSizing: "border-box" }} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 350, width: 400, top: 1170, textAlign: "left", ...K, fontSize: 30, color: off > 0.5 ? RED : BLUE }}>{off > 0.5 ? "未登録 → さらに下がる" : "登録した場合の数字"}</div>
    </>
  );
};

const BadScene: React.FC = () => {
  const f = useCurrentFrame(); const t = f / 30;
  let cur = -1; BADS.forEach((b, i) => { if (t >= b.at) cur = i; });
  const plusAt = 29.3, unAt = 33.12;
  const sink = ease(f, unAt, 0.6);
  // カメラ：ゆっくり寄る＋数字が出た瞬間に軽く押し込む
  const kick = BADS.reduce((s, b) => { const d = f - F(b.reveal); return s + (d >= 0 && d < 14 ? Math.sin((d / 14) * Math.PI) * 0.018 : 0); }, 0);
  const zoom = 1 + 0.02 * ((f % F(7)) / F(7)) * 0 + 0.025 * (f / F(35)) + kick;
  return (
    <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "540px 760px" }}>
      <Sticky at={0} tag="損する" title="使い方 5つ" c="#FFC4B5" />
      {t >= plusAt ? <div style={{ position: "absolute", left: 650, top: 300, ...slam(f, plusAt) }}><span style={{ display: "inline-block", border: `5px solid ${BLUE}`, borderRadius: 14, padding: "2px 16px", ...K, fontSize: 26, color: BLUE, background: "#EEF5FF", transform: "rotate(-4deg)" }}>プラス登録の場合</span></div> : null}
      {BADS.map((b, i) => {
        const top = ROW_TOP + i * (ROW_H + ROW_GAP);
        const d = f - F(b.at);
        const on = i === cur && t < plusAt;
        const ph = interpolate(f, [F(0.2) + i * 3, F(0.2) + i * 3 + 8], [0, 1], clamp);
        if (d < 0) return <div key={i} style={{ position: "absolute", left: 150, top, width: 780, height: ROW_H, border: `4px dashed ${INK}40`, borderRadius: 18, boxSizing: "border-box", display: "flex", alignItems: "center", paddingLeft: 18, opacity: ph, ...K, fontSize: 30, color: `${INK}55` }}>{i + 1}</div>;
        const inP = interpolate(d, [0, 10], [0, 1], { ...clamp, easing: OUT });
        const rv = f - F(b.reveal);
        const vk = interpolate(rv, [0, 4, 8], [0.2, 1.2, 1], clamp);
        return (
          <div key={i} style={{ position: "absolute", left: 150, top, width: 780, height: ROW_H, background: on ? "#FFF6F2" : "#fff", border: `${on ? 5 : 4}px solid ${on ? RED : INK}`, borderRadius: 18, boxShadow: `5px 6px 0 ${on ? RED : INK}`, display: "flex", alignItems: "center", gap: 14, padding: "0 18px", boxSizing: "border-box", opacity: 0.2 + 0.8 * inP, transform: `scaleY(${0.6 + 0.4 * inP}) scale(${on ? 1.02 : 1})` }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: on ? RED : INK, color: "#fff", ...K, fontSize: 28, textAlign: "center", lineHeight: "48px", flex: "none" }}>{i + 1}</div>
            <div style={{ flex: 1, minWidth: 0, overflow: "hidden", ...K, fontSize: 32, color: INK, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6, height: 44 }}>{b.logo ?? b.name}</div>
            <div style={{ position: "relative", textAlign: "right", whiteSpace: "nowrap" }}>
              {rv < 0 ? <span style={{ ...SER, fontSize: 40, color: `${INK}40` }}>？</span>
                : <span style={{ display: "inline-block", transform: `scale(${vk}) translateY(${sink * 10}px)`, transformOrigin: "100% 50%", opacity: 1 - sink * 0.45 }}><span style={{ ...SER, fontSize: b.val.length > 6 ? 34 : 42, color: RED }}>{b.val}</span><span style={{ ...B, fontSize: 20, color: INK }}>{b.unit}</span></span>}
              {sink > 0 ? <span style={{ position: "absolute", right: -46, top: 4 + sink * 8, ...K, fontSize: 38, color: RED, opacity: sink }}>↓</span> : null}
            </div>
          </div>
        );
      })}
      <Stage a={0.3} b={7.2} slot={0}><HeroGauge /></Stage>
      <Stage a={7.3} b={11.66} slot={1}><HeroTicket /></Stage>
      <Stage a={11.75} b={16.9} slot={2}><HeroCatalog /></Stage>
      <Stage a={16.97} b={23.32} slot={3}><HeroMachine /></Stage>
      <Stage a={23.4} b={29.25} slot={4}><HeroRace /></Stage>
      <Stage a={29.3} b={35.2}><HeroSwitch /></Stage>
    </AbsoluteFill>
  );
};

// ════════ つなぎ：じゃあどう使う？（35.1〜40.2）＝1万ptのコインから4枚のカードが飛び出す ════════
const PICKS: { name: string; logos: [string, number][]; tease: string; c: string; dx: number; dy: number; rot: number }[] = [
  { name: "ANAマイル", logos: [["ana", 40]], tease: "10,000マイル", c: BLUE, dx: -1, dy: -1, rot: -14 },
  { name: "外資系のマイル", logos: [["singapore", 14], ["british", 15], ["qatar", 34]], tease: "8,000マイル", c: "#5B7FBF", dx: 1, dy: -1, rot: 12 },
  { name: "ホテルのポイント", logos: [["hilton", 34], ["marriott", 44]], tease: "最大12,500pt", c: GREEN, dx: -1, dy: 1, rot: 10 },
  { name: "カードの年会費", logos: [["amex", 50]], tease: "10,000円分", c: "#B38A12", dx: 1, dy: 1, rot: -12 },
];
const BridgeScene: React.FC = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const CX = 540, CY = 820;
  const glow = ease(f, 36.82, 0.6);
  const coinOut = ease(f, 37.5, 0.4);
  const q = f - F(35.9); const qk = q >= 0 ? interpolate(q, [0, 5, 9, 13], [0, -26, 6, 0], clamp) : 0;
  return (
    <>
      <div style={{ position: "absolute", left: 0, width: 1080, top: 320, textAlign: "center", ...K, fontSize: 68, color: INK }}>
        <TypeIn at={F(35.14)} step={1.4}>じゃあ、どう使う</TypeIn><span style={{ display: "inline-block", color: RED, opacity: q >= 0 ? 1 : 0, transform: `translateY(${qk}px) rotate(${qk * 0.6}deg)` }}>？</span>
      </div>
      <div style={{ position: "absolute", left: 0, width: 1080, top: 430, textAlign: "center", ...B, fontSize: 32, color: SUB, ...rise(f, 36.82) }}>ポイントの価値を<span style={{ color: INK, background: `linear-gradient(transparent 60%, #FFE58A 60%)` }}>しっかり活かせる</span>使い方</div>
      {/* 後ろで回る光 */}
      <svg width={1080} height={1080} style={{ position: "absolute", left: CX - 540, top: CY - 540, opacity: glow * 0.9, transform: `rotate(${f * 0.8}deg) scale(${0.6 + 0.4 * glow})` }}>
        {Array.from({ length: 16 }).map((_, i) => { const a = (i / 16) * Math.PI * 2, b = a + Math.PI / 32; return <path key={i} d={`M540,540 L${540 + Math.cos(a) * 540},${540 + Math.sin(a) * 540} L${540 + Math.cos(b) * 540},${540 + Math.sin(b) * 540} Z`} fill="#FFE58A" opacity={0.55} />; })}
      </svg>
      {/* 1万ptのコイン（絵）：光ってからカードに分かれる */}
      <CoinArt w={330} big="1万" small="ポイント" style={{ left: CX - 145, top: CY - 150, transform: `scale(${interpolate(f - F(35.3), [0, 6, 10], [0, 1.15, 1], clamp) * (1 + 0.06 * Math.sin(f / 5) * glow) * (1 - coinOut)})`, opacity: 1 - coinOut, filter: glow > 0 ? `drop-shadow(0 0 ${24 * glow}px ${GOLD})` : undefined }} />
      {/* 4枚のカードが飛び出して、少し回りながら着地 */}
      {PICKS.map((p, i) => {
        const at = 37.6 + i * 0.32;
        const s = spring({ frame: f - F(at), fps, config: { damping: 13, stiffness: 140, mass: 0.8 } });
        if (f < F(at)) return null;
        const tx = CX + p.dx * 190, ty = CY + p.dy * 150;
        const x = CX + (tx - CX) * s, y = CY + (ty - CY) * s;
        const hl = f >= F(39.22) + i * 4 && f < F(39.22) + i * 4 + 8;
        return (
          <div key={p.name} style={{ position: "absolute", left: x - 175, top: y - 125, width: 350, height: 250, background: "#fff", border: `6px solid ${INK}`, borderRadius: 26, boxShadow: `7px 9px 0 ${p.c}`, transform: `rotate(${p.rot * (1 - s) + p.rot * 0.12}deg) scale(${(0.3 + 0.7 * s) * (hl ? 1.08 : 1)})`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <div style={{ position: "absolute", left: -18, top: -22, width: 56, height: 56, borderRadius: "50%", background: p.c, border: `5px solid ${INK}`, color: "#fff", ...SER, fontSize: 34, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</div>
            <div style={{ height: 56, display: "flex", alignItems: "center", gap: 12 }}>{p.logos.map(([n, h]) => <Logo key={n} n={n} h={h} style={{ maxWidth: p.logos.length > 2 ? 92 : 150 }} />)}</div>
            <div style={{ ...K, fontSize: 34, color: INK }}>{p.name}</div>
            <div style={{ ...B, fontSize: 22, color: SUB }}>1万ptで <span style={{ ...SER, fontSize: 32, color: p.c }}>{p.tease}</span></div>
          </div>
        );
      })}
      {f >= F(39.22) ? <div style={{ position: "absolute", left: 0, width: 1080, top: 1150, textAlign: "center", ...slam(f, 39.22) }}><span style={{ display: "inline-block", background: RED, color: "#fff", border: `5px solid ${INK}`, padding: "6px 34px", borderRadius: 16, transform: "rotate(-3deg)", ...K, fontSize: 46, boxShadow: `5px 7px 0 ${INK}` }}>この4つ！</span></div> : null}
    </>
  );
};

// レートの大きなカード（1,000pt → 1,000マイル など）
const RateCard: React.FC<{ at: number; from: string; to: string; unit: string; c: string; ratio: string; top?: number; logo?: string; art?: string; artW?: number }> = ({ at, from, to, unit, c, ratio, top = 420, logo, art, artW = 150 }) => {
  const f = useCurrentFrame(); const d = f - F(at);
  if (d < 0) return null;
  const ar = interpolate(d, [6, 16], [0, 1], { ...clamp, easing: OUT });
  return (
    <div style={{ position: "absolute", left: 150, top, width: 780, height: 300, background: "#fff", border: `6px solid ${INK}`, borderRadius: 30, boxShadow: `8px 10px 0 ${c}`, ...rise(f, at) }}>
      <div style={{ position: "absolute", left: 24, top: 18, ...B, fontSize: 26, color: SUB }}>交換レート（公式）</div>
      {logo ? <Logo n={logo} h={44} style={{ position: "absolute", right: 26, top: 16 }} /> : null}
      {art ? <div style={{ position: "absolute", right: -36, top: -26, transform: `rotate(${Math.sin(f / 12) * 5}deg) scale(${pop(f, at + 0.4)})` }}><Gen n={art} w={artW} /></div> : null}
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

// ANAの青い飛行機：「1対1」で左下から右上へ飛んで抜ける
const AnaPlane: React.FC = () => {
  const f = useCurrentFrame();
  const p = interpolate(f - F(42.0), [0, 34], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  if (p <= 0 || p >= 1) return null;
  return <div style={{ position: "absolute", left: -260 + p * 1500, top: 1180 - p * 1000, transform: `scale(${0.8 + p * 0.5})`, opacity: p > 0.85 ? (1 - p) / 0.15 : 1 }}><Gen n="amex_plane_blue" w={320} /></div>;
};

const AnaJar: React.FC = () => {
  const f = useCurrentFrame();
  if (f < F(45.0)) return null;
  const sh = f < F(45.0) + 14 ? Math.sin((f - F(45.0)) * 1.8) * 6 : 0;
  return <div style={{ position: "absolute", left: 470, top: 1125, transform: `translateX(${sh}px) scale(${pop(f, 45.0)})` }}><Gen n="amex_jar_full" w={140} /></div>;
};

// ════════ おすすめ① ANAマイル（40.2〜46.1） ════════
const AnaScene: React.FC = () => (
  <>
    <Sticky at={40.24} tag="おすすめ①" title="ANAマイル" c="#CFE3FF" />
    <RateCard at={40.5} from="1,000" to="1,000" unit="マイル" c={BLUE} ratio="1対1" logo="ana" />
    <AnaPlane />
    <Fact at={42.7} top={760} label="1万ポイントだと" value={<><span style={{ ...SER, fontSize: 52, color: BLUE }}>10,000</span><span style={{ fontSize: 26 }}>マイル</span></>} />
    <Fact at={44.98} top={884} label="年間の上限" value={<span style={{ color: RED }}>年4万マイルまで</span>} />
    <Fact at={45.4} top={1008} label="移行の参加費" value={<>年5,500円<span style={{ ...B, fontSize: 22, color: SUB }}>（プラチナは無料）</span></>} />
    <Scribble at={F(45.1)} cx={720} cy={936} rx={190} ry={52} note="" nx={0} ny={0} />
    <AnaJar />
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
      <RateCard at={46.5} from="1,250" to="1,000" unit="マイル" c="#5B7FBF" ratio="1対0.8" top={410} art="amex_world_planes" artW={170} />
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
          <div style={{ flex: 1, height: 260, background: "#fff", border: `4px solid ${INK}`, borderRadius: 18, display: "flex", alignItems: "center", gap: 10, padding: "0 14px", boxSizing: "border-box" }}><Gen n="amex_jar_full" w={110} /><div><div style={{ ...B, fontSize: 22, color: SUB }}>ANA</div><div style={{ ...K, fontSize: 32, color: INK }}>年4万<br />マイルまで</div></div></div>
          <div style={{ flex: 1, height: 260, overflow: "hidden", background: "#EEF5FF", border: `5px solid #5B7FBF`, borderRadius: 18, display: "flex", alignItems: "flex-end", gap: 10, padding: "0 14px", boxSizing: "border-box", transform: `scale(${pop(f, 52.1)})`, opacity: f >= F(52.1) ? 1 : 0 }}>
            <div style={{ transform: `translateY(${(1 - ease(f, 52.1, 0.9)) * 240}px)` }}><Gen n="amex_stack_endless" w={86} /></div>
            <div style={{ alignSelf: "center" }}><div style={{ ...B, fontSize: 22, color: SUB }}>外資系</div><div style={{ ...K, fontSize: 32, color: "#3D5E9E" }}>年間の<br />上限なし</div></div>
          </div>
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
      {f >= F(53.6) && f < F(55.6) ? <div style={{ position: "absolute", left: 240, top: 430, opacity: interpolate(f, [F(55.0), F(55.5)], [1, 0], clamp), transform: `scale(${pop(f, 53.6) * interpolate(f, [F(55.0), F(55.5)], [1, 0.7], clamp)})` }}><Gen n="amex_hotel_luxury" w={600} /></div> : null}
      {card(150, "ヒルトン", "1,000", "1,250", "12,500", 55.3, false)}
      {card(550, "マリオット", "1,000", "990", "9,900", 58.6, true)}
      {t >= 62.98 ? (
        <div style={{ position: "absolute", left: 150, top: 930, width: 780, ...rise(f, 62.98) }}>
          <div style={{ background: "#fff", border: `4px solid ${INK}`, borderRadius: 20, padding: "14px 24px", display: "flex", alignItems: "center", gap: 16 }}>
            <Gen n="amex_bed_coins" w={130} style={{ transform: `scale(${pop(f, 63.1)})` }} />
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
    <RateCard at={69.2} from="1" to="1" unit="円" c="#B38A12" ratio="1pt＝1円" art="amex_fee_coins" artW={130} />
    <Fact at={70.9} top={760} label="1万ポイントだと" value={<><span style={{ ...SER, fontSize: 52, color: "#B38A12" }}>10,000</span><span style={{ fontSize: 26 }}>円分</span></>} />
    <Fact at={72.5} top={884} label="年会費の負担を" value={<span style={{ color: GREEN }}>軽くできる</span>} />
    <Fact at={72.9} top={1008} label="ANA移行の参加費にも" value="1pt＝1円で使える" />
  </>
);

// ════════ 締め（73.8〜79）：同じ1万ポイントでも価値がちがう＝絵＋ロゴ＋伸びる棒＋判定の印 ════════
const ENDS: { img: string; iw: number; logo: string; lh: number; name: string; v: number; unit: string; w: number; c: string; good: boolean }[] = [
  { img: "amex_coins_shrink", iw: 120, logo: "vpoint", lh: 34, name: "商品券・Vポイント", v: 3000, unit: "円分", w: 0.3, c: RED, good: false },
  { img: "amex_shopping_box", iw: 118, logo: "amazon", lh: 26, name: "Amazon", v: 5000, unit: "円分", w: 0.5, c: RED, good: false },
  { img: "amex_fee_coins", iw: 92, logo: "amex", lh: 40, name: "年会費", v: 10000, unit: "円分", w: 1, c: "#B38A12", good: true },
  { img: "amex_plane_blue", iw: 128, logo: "ana", lh: 28, name: "ANAマイル", v: 10000, unit: "マイル", w: 1, c: BLUE, good: true },
];
const EndScene: React.FC = () => {
  const f = useCurrentFrame();
  const BW = 400;
  return (
    <>
      {/* 見出し：「同じ」＋コイン＋「でも」 */}
      <div style={{ position: "absolute", left: 0, width: 1080, top: 300, display: "flex", alignItems: "center", justifyContent: "center", gap: 14, ...rise(f, 75.55) }}>
        <span style={{ ...K, fontSize: 52, color: INK }}>同じ</span>
        <div style={{ position: "relative", width: 150, height: 130 }}><CoinArt w={150} big="1万" small="ポイント" style={{ left: 0, top: 0, transform: `rotate(${Math.sin(f / 8) * 6}deg)` }} /></div>
        <span style={{ ...K, fontSize: 52, color: INK }}>でも</span>
      </div>
      {ENDS.map((r, i) => {
        const at = 75.7 + i * 0.16, top = 470 + i * 140;
        if (f < F(at)) return null;
        const g = ease(f, at + 0.1, 0.7);
        const mk = f >= F(76.15) + i * 3;
        return (
          <div key={r.name} style={{ position: "absolute", left: 150, top, width: 780, height: 128, background: "#fff", border: `4px solid ${INK}`, borderRadius: 22, boxShadow: `5px 6px 0 ${r.good ? r.c : "#C9C2B0"}`, ...rise(f, at) }}>
            <div style={{ position: "absolute", left: 10, top: 0, bottom: 0, width: 130, display: "flex", alignItems: "center", justifyContent: "center" }}><Gen n={r.img} w={r.iw} /></div>
            <div style={{ position: "absolute", left: 150, top: 12, display: "flex", alignItems: "center", gap: 10, height: 40 }}><Logo n={r.logo} h={r.lh} /><span style={{ ...K, fontSize: 24, color: SUB }}>{r.name}</span></div>
            <div style={{ position: "absolute", left: 150, top: 62, height: 46, width: BW * r.w * g, background: r.c, borderRadius: 10, border: `3px solid ${INK}`, boxSizing: "border-box" }} />
            <div style={{ position: "absolute", left: 150 + BW * r.w * g + 12, top: 58, ...SER, fontSize: 40, color: r.c, whiteSpace: "nowrap" }}>{num(r.v * g)}<span style={{ ...B, fontSize: 20, color: INK }}>{r.unit}</span></div>
            {mk ? <div style={{ position: "absolute", right: -18, top: -22, width: 70, height: 70, borderRadius: "50%", background: r.good ? GOLD : "#fff", border: `5px solid ${r.good ? INK : RED}`, display: "flex", alignItems: "center", justifyContent: "center", ...K, fontSize: 40, color: r.good ? INK : RED, transform: `rotate(${r.good ? -8 : 8}deg) scale(${pop(f, 76.15 + i * 0.1)})` }}>{r.good ? "◎" : "×"}</div> : null}
          </div>
        );
      })}
      {/* 締めのひとこと：「価値」だけ大きく金色 */}
      {f >= F(76.4) ? (
        <div style={{ position: "absolute", left: 340, top: 1036, width: 440, ...slam(f, 76.4) }}>
          <div style={{ ...K, fontSize: 34, color: INK }}>使い方で</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{ ...SER, fontSize: 100, lineHeight: 1.05, color: "#B38A12", textShadow: `4px 4px 0 ${INK}` }}>価値</span>
            <span style={{ ...K, fontSize: 40, color: INK }}>が</span>
          </div>
          <div style={{ ...K, fontSize: 42, color: INK }}><span style={{ color: RED }}>まったく</span>変わる</div>
        </div>
      ) : null}
      {f >= F(76.6) ? <div style={{ position: "absolute", left: 150, top: 1040, transform: `scale(${pop(f, 76.6)}) rotate(${Math.sin(f / 10) * 3}deg)` }}><Gen n="amex_two_paths" w={170} /></div> : null}
      <ReelUI at={F(77.3)} pointSave={F(77.5)} caption="保存して参考にしてね" />
    </>
  );
};

// 女の子（ちびFP助手）：気持ちが動く所だけ。絵は1枚なので、動きと記号で気持ちを出す
//  worry＝傾いてしょんぼり＋汗 ／ idea＝ぴょんと跳ねて電球 ／ think＝首をかしげて「？」 ／ talk＝声に合わせて弾む
const APPEAR: [number, number, "worry" | "idea" | "think" | "talk"][] = [[29.3, 35.1, "worry"], [35.14, 40.2, "idea"], [60.7, 68.9, "think"], [73.84, 79.1, "talk"]];
const Chara: React.FC = () => {
  const f = useCurrentFrame();
  const a = APPEAR.find(([s0, e]) => f >= F(s0) - 2 && f < F(e) + 8);
  if (!a) return null;
  const [s0, e, mood] = a;
  const d = f - F(s0);
  const inP = interpolate(f, [F(s0) - 2, F(s0) + 9], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.6)) });
  const outP = interpolate(f, [F(e), F(e) + 8], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  let rot = 0, ty = 0, sx = 1, sy = 1;
  if (mood === "worry") { rot = -6 + Math.sin(f / 9) * 2; ty = 6; }
  if (mood === "idea") { const j = d >= 0 && d < 16 ? Math.sin((d / 16) * Math.PI) : 0; ty = -60 * j; sy = 1 + 0.05 * j; sx = 1 - 0.03 * j; }
  if (mood === "think") { rot = 7 * Math.sin(f / 14); }
  if (mood === "talk") { const lv = AMEX_MOUTH.charCodeAt(Math.min(AMEX_MOUTH.length - 1, f)) - 48; const k = lv >= 2 ? 1 : lv === 1 ? 0.5 : 0; sy = 1 + 0.035 * k; sx = 1 - 0.015 * k; ty = -6 * k; rot = Math.sin(f / 11) * 2; }
  const W = 140, H = W * 884 / 498;
  return (
    <div style={{ position: "absolute", left: 790 + (1 - inP) * 360 + outP * 360, top: 1342 - H + Math.sin(f / 10) * 3, width: W, height: H }}>
      <div style={{ position: "absolute", inset: 0, transform: `translateY(${ty}px) rotate(${rot}deg) scale(${sx}, ${sy})`, transformOrigin: "50% 100%" }}>
        <Gen n="girl_front_smile" w={W} />
      </div>
      {mood === "worry" ? (() => { const k = (d % 36) / 36; return <svg width={40} height={56} style={{ position: "absolute", left: W - 26, top: 18 + k * 30, opacity: d < 6 ? 0 : 1 - k * 0.8 }}><path d="M20 4 C 30 22, 36 32, 36 40 A 16 16 0 0 1 4 40 C 4 32, 10 22, 20 4 Z" fill="#8EC5F0" stroke={INK} strokeWidth={4} /></svg>; })() : null}
      {mood === "idea" && d >= 6 ? (
        <div style={{ position: "absolute", left: W / 2 - 40, top: -96, width: 80, height: 90, transform: `scale(${pop(f, s0 + 0.2)})` }}>
          {Array.from({ length: 7 }).map((_, i) => { const an = (-150 + i * 20) * Math.PI / 180; const r1 = 44, r2 = 58 + 6 * Math.sin(f / 3 + i); return <div key={i} style={{ position: "absolute", left: 40 + Math.cos(an) * r1, top: 36 + Math.sin(an) * r1, width: r2 - r1, height: 6, borderRadius: 3, background: GOLD, transform: `rotate(${an * 180 / Math.PI}deg)`, transformOrigin: "0 50%" }} />; })}
          <div style={{ position: "absolute", left: 16, top: 12, width: 48, height: 48, borderRadius: "50%", background: "#FFE58A", border: `4px solid ${INK}`, boxShadow: `0 0 18px ${GOLD}` }} />
          <div style={{ position: "absolute", left: 28, top: 58, width: 24, height: 16, borderRadius: 4, background: "#C9C2B0", border: `4px solid ${INK}` }} />
        </div>
      ) : null}
      {mood === "think" ? <div style={{ position: "absolute", left: W - 30, top: -30 + Math.sin(f / 6) * 6, ...K, fontSize: 64, color: RED, transform: `rotate(12deg) scale(${pop(f, s0 + 0.15)})` }}>？</div> : null}
    </div>
  );
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
// 「せっかく貯めた」で宝箱がポン（地図に引いている間・画面に固定）
const Treasure: React.FC = () => {
  const f = useCurrentFrame();
  if (f < F(73.9) || f > F(75.6)) return null;
  const out = interpolate(f, [F(75.2), F(75.6)], [0, 1], clamp);
  return <div style={{ position: "absolute", left: 290, top: 620, transform: `scale(${pop(f, 73.9) * (1 - out * 0.6)}) rotate(${Math.sin(f / 6) * 3}deg)`, opacity: 1 - out, filter: "drop-shadow(0 12px 24px rgba(90,70,20,0.25))" }}><Gen n="amex_treasure_points" w={500} /></div>;
};
const CHECK = ["ANAマイル", "外資系のマイル", "ホテル", "年会費"];
const CheckWrap: React.FC = () => {
  const f = useCurrentFrame(); const t = f / 30;
  if (t < 40.24 || t >= 73.84) return null;
  const cur = t >= 68.9 ? 3 : t >= 53.46 ? 2 : t >= 46.14 ? 1 : 0;
  return <div style={{ position: "absolute", right: 120, top: 210, width: 380, transform: "scale(0.6)", transformOrigin: "100% 0" }}><Checklist title="おすすめ" items={CHECK} cur={cur} x={0} y={0} w={380} /></div>;
};

// 1枚の大きな地図に7ページを並べ、カメラで移る（参考②の「縮む→流れる→戻る」）
const PANELS: Panel[] = [{ id: "bad", col: 0, row: 0 }, { id: "bridge", col: 1, row: 0 }, { id: "ana", col: 2, row: 0 }, { id: "foreign", col: 3, row: 0 }, { id: "hotel", col: 3, row: 1 }, { id: "fee", col: 2, row: 1 }, { id: "end", col: 1, row: 1 }];
const LINKS: [string, string][] = [["bad", "bridge"], ["bridge", "ana"], ["ana", "foreign"], ["foreign", "hotel"], ["hotel", "fee"], ["fee", "end"]];
const STOPS: Stop[] = [
  { id: "bad", trans: 0 }, { id: "bridge", trans: 34.9, kind: "kick" }, { id: "ana", trans: 39.95, kind: "kick" },
  { id: "foreign", trans: 45.9, kind: "fast" }, { id: "hotel", trans: 53.2, kind: "fast" }, { id: "fee", trans: 68.7, kind: "fast" },
  { id: "__map", trans: 73.7, scale: 0.36, ids: ["ana", "foreign", "hotel", "fee"] }, { id: "end", trans: 75.3, kind: "kick" },
];
const PAGES: Record<string, React.FC> = { bad: BadScene, bridge: BridgeScene, ana: AnaScene, foreign: ForeignScene, hotel: HotelScene, fee: FeeScene, end: EndScene };
export const AMEX_FRAMES = F(79.1);
export const AmexReel: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: FONT }}>
    <Paper />
    <Audio src={staticFile("amex-narration.wav")} />
    <SfxTrack cues={CUES} />
    <Board streaks panels={PANELS} stops={STOPS} links={LINKS} paper={{ background: A2.bg, backgroundImage: "repeating-linear-gradient(transparent 0 62px, rgba(176,146,60,0.22) 62px 64px)" }}>
      {(id) => { const C = PAGES[id]; return <AbsoluteFill><C /></AbsoluteFill>; }}
    </Board>
    <Treasure />
    <CheckWrap />
    <Chara />
    <CapBand />
    <Captions subs={SUBS} end={78.9} maxW={740} size={0.78} kcol={{ g: RED, r: RED }} top={1352} swap />
  </AbsoluteFill>
);
