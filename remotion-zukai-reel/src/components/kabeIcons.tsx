import React from "react";

// ───────────────────────────────────────────────────────────────
// 年収の壁リール専用 ベクターアイコン（flat 2-tone・線画）
//   「文字ボックス」をやめ、アイコン＋線で図解するための素材。
//   共通API: size(px) / c=主線色 / a=差し色 / bg=塗り。viewBox 100x100。
// ───────────────────────────────────────────────────────────────
type P = { size?: number; c?: string; a?: string; bg?: string; style?: React.CSSProperties };
const INK = "#1F3A5F", OR = "#E8912D", RED = "#E0483B", GRN = "#2E9E6B";
const SW = 5;
const S: React.FC<P & { vb?: string; children: React.ReactNode }> = ({ size = 100, vb = "0 0 100 100", style, children }) => (
  <svg width={size} height={size} viewBox={vb} style={{ overflow: "visible", ...style }}>{children}</svg>
);

// 本人・妻（パート主婦）：丸顔＋ワンピース
export const Woman: React.FC<P> = ({ c = INK, a = OR, bg = "#fff", ...p }) => (
  <S {...p}>
    <path d="M30 42 Q30 20 50 20 Q70 20 70 42 Q70 52 62 58 L38 58 Q30 52 30 42Z" fill={a} opacity={0.25} />
    <circle cx="50" cy="38" r="17" fill={bg} stroke={c} strokeWidth={SW} />
    <path d="M30 42 Q28 22 50 20 Q72 22 70 42" fill="none" stroke={c} strokeWidth={SW} strokeLinecap="round" />
    <path d="M34 60 Q50 54 66 60 L78 92 Q50 100 22 92 Z" fill={bg} stroke={c} strokeWidth={SW} strokeLinejoin="round" />
    <circle cx="44" cy="39" r="2.6" fill={c} /><circle cx="57" cy="39" r="2.6" fill={c} />
    <path d="M46 47 Q50 50 54 47" fill="none" stroke={c} strokeWidth={3} strokeLinecap="round" />
  </S>
);

// 夫（会社員）：ネクタイ
export const Man: React.FC<P> = ({ c = INK, a = INK, bg = "#fff", ...p }) => (
  <S {...p}>
    <circle cx="50" cy="34" r="16" fill={bg} stroke={c} strokeWidth={SW} />
    <path d="M26 92 Q26 62 50 58 Q74 62 74 92 Z" fill={bg} stroke={c} strokeWidth={SW} strokeLinejoin="round" />
    <path d="M50 58 L40 66 L50 74 L60 66 Z" fill={a} opacity={0.9} />
    <path d="M50 74 L46 92 L54 92 Z" fill={a} opacity={0.9} />
    <circle cx="44" cy="35" r="2.4" fill={c} /><circle cx="56" cy="35" r="2.4" fill={c} />
  </S>
);

// 傘（扶養の象徴）
export const Umbrella: React.FC<P> = ({ c = INK, a = GRN, bg = "#fff", ...p }) => (
  <S {...p}>
    <path d="M12 52 Q50 8 88 52 Z" fill={a} opacity={0.9} stroke={c} strokeWidth={SW} strokeLinejoin="round" />
    <path d="M12 52 Q22 44 32 52 Q42 44 50 52 Q58 44 68 52 Q78 44 88 52" fill="none" stroke={c} strokeWidth={3.5} />
    <line x1="50" y1="52" x2="50" y2="84" stroke={c} strokeWidth={SW} strokeLinecap="round" />
    <path d="M50 84 Q50 94 40 94" fill="none" stroke={c} strokeWidth={SW} strokeLinecap="round" />
  </S>
);

// レンガの壁
export const Brick: React.FC<P> = ({ c = INK, a = RED, bg = "#fff", ...p }) => (
  <S {...p} vb="0 0 100 100">
    <rect x="12" y="24" width="76" height="56" rx="4" fill={a} opacity={0.18} stroke={c} strokeWidth={SW} />
    <line x1="12" y1="42" x2="88" y2="42" stroke={c} strokeWidth={3} />
    <line x1="12" y1="61" x2="88" y2="61" stroke={c} strokeWidth={3} />
    <line x1="40" y1="24" x2="40" y2="42" stroke={c} strokeWidth={3} /><line x1="66" y1="24" x2="66" y2="42" stroke={c} strokeWidth={3} />
    <line x1="27" y1="42" x2="27" y2="61" stroke={c} strokeWidth={3} /><line x1="53" y1="42" x2="53" y2="61" stroke={c} strokeWidth={3} /><line x1="76" y1="42" x2="76" y2="61" stroke={c} strokeWidth={3} />
    <line x1="40" y1="61" x2="40" y2="80" stroke={c} strokeWidth={3} /><line x1="66" y1="61" x2="66" y2="80" stroke={c} strokeWidth={3} />
  </S>
);

// コイン（¥）
export const Coin: React.FC<P> = ({ c = INK, a = OR, ...p }) => (
  <S {...p}>
    <circle cx="50" cy="50" r="34" fill={a} stroke={c} strokeWidth={SW} />
    <circle cx="50" cy="50" r="26" fill="none" stroke={c} strokeWidth={2.5} opacity={0.5} />
    <path d="M38 36 L50 52 L62 36 M50 52 L50 70 M41 58 H59 M41 65 H59" fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
  </S>
);

// 財布（手取り）
export const Wallet: React.FC<P> = ({ c = INK, a = OR, bg = "#fff", ...p }) => (
  <S {...p}>
    <rect x="16" y="30" width="68" height="46" rx="8" fill={bg} stroke={c} strokeWidth={SW} />
    <path d="M16 40 Q16 24 34 24 L72 24 Q80 24 80 32" fill="none" stroke={c} strokeWidth={SW} strokeLinecap="round" />
    <rect x="60" y="46" width="30" height="16" rx="5" fill={a} stroke={c} strokeWidth={SW} />
    <circle cx="70" cy="54" r="3" fill={c} />
  </S>
);

// 盾＋十字（社会保険の保障）
export const Shield: React.FC<P> = ({ c = INK, a = GRN, bg = "#fff", ...p }) => (
  <S {...p}>
    <path d="M50 14 L82 26 V52 Q82 78 50 90 Q18 78 18 52 V26 Z" fill={a} opacity={0.2} stroke={c} strokeWidth={SW} strokeLinejoin="round" />
    <path d="M50 38 V66 M36 52 H64" stroke={a} strokeWidth={9} strokeLinecap="round" />
  </S>
);

// 保険証
export const Card: React.FC<P> = ({ c = INK, a = OR, bg = "#fff", ...p }) => (
  <S {...p}>
    <rect x="14" y="30" width="72" height="44" rx="7" fill={bg} stroke={c} strokeWidth={SW} />
    <rect x="22" y="40" width="22" height="16" rx="3" fill={a} opacity={0.5} stroke={c} strokeWidth={3} />
    <line x1="52" y1="44" x2="78" y2="44" stroke={c} strokeWidth={4} strokeLinecap="round" />
    <line x1="52" y1="54" x2="72" y2="54" stroke={c} strokeWidth={4} strokeLinecap="round" />
    <line x1="22" y1="65" x2="78" y2="65" stroke={c} strokeWidth={4} strokeLinecap="round" />
  </S>
);

// 病院＋ハート（傷病手当金）
export const Care: React.FC<P> = ({ c = INK, a = RED, bg = "#fff", ...p }) => (
  <S {...p}>
    <path d="M50 82 Q20 62 20 42 Q20 26 34 26 Q46 26 50 38 Q54 26 66 26 Q80 26 80 42 Q80 62 50 82Z" fill={a} opacity={0.18} stroke={c} strokeWidth={SW} strokeLinejoin="round" />
    <path d="M30 54 H44 L48 44 L54 62 L58 54 H70" fill="none" stroke={a} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
  </S>
);

// 赤ちゃん（出産手当金）
export const Baby: React.FC<P> = ({ c = INK, a = OR, bg = "#fff", ...p }) => (
  <S {...p}>
    <circle cx="50" cy="50" r="30" fill={bg} stroke={c} strokeWidth={SW} />
    <path d="M50 20 Q58 20 58 28" fill="none" stroke={c} strokeWidth={4} strokeLinecap="round" />
    <path d="M40 48 Q42 52 44 48 M56 48 Q58 52 60 48" fill="none" stroke={c} strokeWidth={3.5} strokeLinecap="round" />
    <path d="M44 60 Q50 65 56 60" fill="none" stroke={c} strokeWidth={3.5} strokeLinecap="round" />
    <circle cx="36" cy="56" r="4" fill={a} opacity={0.5} /><circle cx="64" cy="56" r="4" fill={a} opacity={0.5} />
  </S>
);

// 右肩上がり＋コイン（年金が増える）
export const Growth: React.FC<P> = ({ c = INK, a = GRN, ...p }) => (
  <S {...p}>
    <line x1="18" y1="22" x2="18" y2="82" stroke={c} strokeWidth={4} strokeLinecap="round" />
    <line x1="18" y1="82" x2="86" y2="82" stroke={c} strokeWidth={4} strokeLinecap="round" />
    <polyline points="26,70 44,56 60,40 80,24" fill="none" stroke={a} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M80 24 l-12 1 l6 10 Z" fill={a} />
    <rect x="30" y="68" width="12" height="12" fill={OR} stroke={c} strokeWidth={3} />
    <rect x="46" y="60" width="12" height="20" fill={OR} stroke={c} strokeWidth={3} />
    <rect x="62" y="50" width="12" height="30" fill={OR} stroke={c} strokeWidth={3} />
  </S>
);

// 時計（週20時間）
export const Clock: React.FC<P> = ({ c = INK, a = RED, bg = "#fff", ...p }) => (
  <S {...p}>
    <circle cx="50" cy="52" r="34" fill={bg} stroke={c} strokeWidth={SW} />
    <path d="M38 14 H62 M50 14 V22" stroke={c} strokeWidth={5} strokeLinecap="round" />
    <line x1="50" y1="52" x2="50" y2="32" stroke={c} strokeWidth={5} strokeLinecap="round" />
    <line x1="50" y1="52" x2="66" y2="58" stroke={a} strokeWidth={5} strokeLinecap="round" />
  </S>
);

// 会社ビル（51人以上）
export const Building: React.FC<P> = ({ c = INK, a = OR, bg = "#fff", ...p }) => (
  <S {...p}>
    <rect x="24" y="18" width="52" height="68" rx="4" fill={bg} stroke={c} strokeWidth={SW} />
    {[28, 46, 64].map((y) => [33, 47, 61].map((x) => (
      <rect key={`${x}-${y}`} x={x} y={y} width="10" height="10" rx="2" fill={a} opacity={0.5} stroke={c} strokeWidth={2.5} />
    )))}
    <rect x="44" y="74" width="12" height="12" fill={c} />
  </S>
);

// 納付書（国民年金・国保を自分で払う）
export const Bill: React.FC<P> = ({ c = INK, a = RED, bg = "#fff", ...p }) => (
  <S {...p}>
    <path d="M26 16 H62 L78 32 V86 H26 Z" fill={bg} stroke={c} strokeWidth={SW} strokeLinejoin="round" />
    <path d="M62 16 V32 H78" fill="none" stroke={c} strokeWidth={4} strokeLinejoin="round" />
    <line x1="36" y1="46" x2="68" y2="46" stroke={c} strokeWidth={4} strokeLinecap="round" />
    <line x1="36" y1="58" x2="68" y2="58" stroke={c} strokeWidth={4} strokeLinecap="round" />
    <text x="52" y="78" fontSize="18" fontWeight="900" fill={a} textAnchor="middle">¥</text>
  </S>
);

// チェック丸・バツ丸
export const CheckC: React.FC<P> = ({ c = GRN, bg = "#fff", ...p }) => (
  <S {...p}><circle cx="50" cy="50" r="34" fill={bg} stroke={c} strokeWidth={SW} /><path d="M36 51 L46 62 L66 38" fill="none" stroke={c} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" /></S>
);
export const CrossC: React.FC<P> = ({ c = "#AEB8C2", bg = "#fff", ...p }) => (
  <S {...p}><circle cx="50" cy="50" r="34" fill={bg} stroke={c} strokeWidth={SW} /><path d="M38 38 L62 62 M62 38 L38 62" fill="none" stroke={c} strokeWidth={7} strokeLinecap="round" /></S>
);
