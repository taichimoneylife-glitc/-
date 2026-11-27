import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame } from "remotion";
import { FONT, FONT_BLACK } from "./components/font";
import { B, GenSlot } from "./MileLifePlan";
import { Camera, CamKey, camAt, Spot, ghostIn, SpeedLines } from "./components/cam";
import { MARKE_MOUTH } from "./markeMouth";

// ════════════════════════════════════════════════════════════════════
//  練習：参考リール（マーケ博士「インスタのAIが出した3つの必須設定」73秒）の再現VTR
//  時間は元動画の0.1秒ごとの変化から拾った値。キャラは太一に置き換え。
//  音声＝public/marke-ref-audio.wav（元動画の音。比べる用、投稿しない・コミットしない）
// ════════════════════════════════════════════════════════════════════

const F = (t: number) => Math.round(t * 30);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const out = { ...clamp, easing: Easing.out(Easing.cubic) };
const K = { fontFamily: FONT_BLACK, fontWeight: 900 as const };
const INK = "#1B1F3B", SH = "#2C42C9", BLUE = "#2F5BF0", YEL = "#FFC23A", RED = "#EE4646", GREEN = "#21A35B", LAV = "#ECEDFA";

// ── 背景：方眼＋小さな記号 ──
const DOODLES: [number, number, string][] = [[90, 160, "△"], [960, 250, "○"], [70, 640, "＋"], [1000, 760, "▽"], [120, 1180, "○"], [980, 1420, "×"], [80, 1640, "～"], [880, 1780, "○"], [520, 1840, "×"], [300, 120, "～"], [1010, 1060, "＋"], [40, 900, "×"]];
const Bg: React.FC<{ blue?: boolean }> = ({ blue }) => {
  const line = blue ? "rgba(255,255,255,0.09)" : "rgba(60,70,170,0.07)";
  return (
    <AbsoluteFill style={{ background: blue ? BLUE : LAV, backgroundImage: `linear-gradient(${line} 2px, transparent 2px), linear-gradient(90deg, ${line} 2px, transparent 2px)`, backgroundSize: "56px 56px" }}>
      {DOODLES.map(([x, y, c], i) => <div key={i} style={{ position: "absolute", left: x, top: y, fontSize: 40, color: blue ? "rgba(255,255,255,0.28)" : "rgba(90,100,170,0.25)", fontWeight: 700 }}>{c}</div>)}
    </AbsoluteFill>
  );
};

// ── 道順の札と見出し ──
const Crumb: React.FC<{ at: number; icon: string; children: React.ReactNode }> = ({ at, icon, children }) => {
  const f = useCurrentFrame();
  if (f < F(at)) return null;
  return (
    <div style={{ position: "absolute", left: 0, top: 222, width: 1080, textAlign: "center" }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 14, background: INK, color: "#fff", borderRadius: 999, padding: "8px 30px", ...B, fontSize: 30, boxShadow: `0 6px 0 ${SH}`, ...ghostIn(f, F(at)) }}><span style={{ fontSize: 30 }}>{icon}</span>{children}</span>
    </div>
  );
};
const Title: React.FC<{ at: number; white?: boolean; size?: number; top?: number; children: React.ReactNode }> = ({ at, white, size = 100, top = 282, children }) => {
  const f = useCurrentFrame();
  if (f < F(at)) return null;
  return (
    <div style={{ position: "absolute", left: 0, top, width: 1080, textAlign: "center", ...ghostIn(f, F(at)) }}>
      <span style={{ ...K, fontSize: size, color: white ? "#fff" : INK, letterSpacing: 2, textShadow: `0 8px 0 ${white ? "#142A9C" : "#4462F2"}`, whiteSpace: "nowrap" }}>{children}</span>
    </div>
  );
};

// ── 説明の箱（点 → 線が伸びる → うっすら大きめ → くっきり）。座標は画面の座標 ──
const BOXS: React.CSSProperties = { background: "#fff", border: `5px solid ${INK}`, borderRadius: 18, boxShadow: `0 8px 0 ${SH}`, padding: "14px 32px", textAlign: "center", ...B, color: INK, lineHeight: 1.32, whiteSpace: "pre" };
const Box: React.FC<{ at: number; until?: number; to: [number, number]; from?: [number, number]; size?: number; bg?: string; children: React.ReactNode; tail?: "down" | "right" }> = ({ at, until = 999, to, from, size = 40, bg = "#fff", children, tail }) => {
  const f = useCurrentFrame();
  const A = F(at), Z = F(until);
  if (f < A || f >= Z + 3) return null;
  const o = 1 - interpolate(f, [Z, Z + 3], [0, 1], clamp);
  const lineP = from ? interpolate(f, [A, A + 4], [0, 1], out) : 1;
  const boxA = from ? A + 3 : A;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      {from ? (
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <line x1={from[0]} y1={from[1]} x2={from[0] + (to[0] - from[0]) * lineP} y2={from[1] + (to[1] - from[1]) * lineP} stroke={INK} strokeWidth={5} />
          <circle cx={from[0]} cy={from[1]} r={11} fill={YEL} stroke={INK} strokeWidth={4} />
        </svg>
      ) : null}
      {f >= boxA ? (
        <div style={{ position: "absolute", left: to[0], top: to[1], transform: "translate(-50%, -50%)" }}>
          <div style={{ position: "relative", ...BOXS, background: bg, fontSize: size * 1.12, ...ghostIn(f, boxA) }}>
            {children}
            {tail === "down" ? <div style={{ position: "absolute", left: "50%", bottom: -34, marginLeft: -16, width: 0, height: 0, borderLeft: "16px solid transparent", borderRight: "16px solid transparent", borderTop: `30px solid ${INK}` }} /> : null}
            {tail === "right" ? <div style={{ position: "absolute", right: -40, top: "40%", width: 0, height: 0, borderTop: "16px solid transparent", borderBottom: "16px solid transparent", borderLeft: `40px solid ${INK}` }} /> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
};
const c = (col: string, t: string) => <span style={{ color: col }}>{t}</span>;

// ── 太一（しゃべる時は口パク、それ以外はポーズ差し替え） ──
const Tai: React.FC<{ x: number; y: number; size: number; talk?: boolean; poses?: [number, string][]; style?: React.CSSProperties }> = ({ x, y, size, talk, poses = [], style }) => {
  const f = useCurrentFrame();
  const t = f / 30;
  let pose = "";
  poses.forEach(([pt, n]) => { if (t >= pt) pose = n; });
  const lv = MARKE_MOUTH.charCodeAt(Math.min(MARKE_MOUTH.length - 1, f)) - 48;
  let img = pose || "taichi_talk_closed";
  if (!pose && talk) img = f % 90 > 86 && lv === 0 ? "taichi_blink" : lv >= 2 ? (Math.floor(f / 2) % 3 ? "taichi_talk_open" : "taichi_talk_mid") : lv === 1 ? "taichi_talk_mid" : "taichi_talk_closed";
  const bob = Math.sin(f / 8) * 5;
  return <div style={{ position: "absolute", left: x, top: y + bob, width: size, height: size, ...style }}><GenSlot name={img} size={size} /></div>;
};

// 世界の座標 → 画面の座標（カメラが止まった後）
const scr = (keys: CamKey[], t: number, p: [number, number]): [number, number] => {
  const k = camAt(F(t) + 20, keys);
  return [(p[0] - k.x) * k.s + 540, (p[1] - k.y) * k.s + 960];
};
const Show: React.FC<{ a: number; b?: number; children: React.ReactNode }> = ({ a, b = 999, children }) => {
  const f = useCurrentFrame();
  return f >= F(a) && f < F(b) ? <>{children}</> : null;
};
const Ghost: React.FC<{ at: number; until?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ at, until = 999, style, children }) => {
  const f = useCurrentFrame();
  const A = F(at), Z = F(until);
  if (f < A || f >= Z + 3) return null;
  return <div style={{ position: "absolute", ...style, ...ghostIn(f, A), opacity: (ghostIn(f, A).opacity as number) * (1 - interpolate(f, [Z, Z + 3], [0, 1], clamp)) }}>{children}</div>;
};

// ════════ A：冒頭（0–12.5）「3つの必須設定」 ════════
const TABS: [string, string, string, number][] = [["01", "コンテンツ\n設定", BLUE, 0.3], ["02", "おすすめ\n表示", "#FFB000", 1.0], ["03", "アカウント\nステータス", RED, 1.7]];
const SceneA: React.FC = () => {
  const f = useCurrentFrame();
  if (f >= F(12.5)) return null;
  const keys: CamKey[] = [{ t: 0, x: 540, y: 837, s: 1.2, d: 1 }, { t: 8.0, x: 540, y: 950, s: 1.2, d: 10 }, { t: 11.3, x: 540, y: 690, s: 1.45, d: 7 }];
  const n = TABS.filter((tb) => f >= F(tb[3])).length;
  const crack = interpolate(f, [F(10.2), F(10.2) + 6], [0, 1], out);
  return (
    <AbsoluteFill>
      <Bg />
      <Camera keys={keys}>
        <Title at={0.05} size={112} top={330}>3つの必須設定</Title>
        <Ghost at={0.05} style={{ left: 0, top: 284, width: 1080, textAlign: "center" }}><span style={{ ...B, fontSize: 40, color: BLUE }}>インスタの「AI」が出した</span></Ghost>
        {/* 3つのタブ */}
        {TABS.map(([no, t, col, at], i) => f >= F(at) ? (
          <div key={no} style={{ position: "absolute", left: 262 + i * 190, top: 520, width: 176, ...ghostIn(f, F(at)), transform: `translateY(${interpolate(f - F(at), [0, 5], [-40, 0], out)}px)` }}>
            <div style={{ background: col, border: `5px solid ${INK}`, borderBottom: "none", borderRadius: "14px 14px 0 0", textAlign: "center", color: "#fff", ...K, fontSize: 32, padding: "2px 0" }}>{no}</div>
            <div style={{ background: "#fff", border: `5px solid ${INK}`, height: 104, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", ...B, fontSize: 28, lineHeight: 1.25, whiteSpace: "pre-line", color: INK }}>{t}</div>
          </div>
        ) : null)}
        {/* 台 */}
        <div style={{ position: "absolute", left: 170, top: 668, width: 740, height: 116, background: "#fff", border: `5px solid ${INK}`, borderRadius: 10, boxShadow: `16px 16px 0 #DCE0FB, 16px 16px 0 5px ${INK}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 34px", boxSizing: "border-box", ...ghostIn(f, 0) }}>
          <span style={{ ...K, fontSize: 40, color: INK }}><span style={{ color: BLUE }}>✦</span> インスタAI 必須設定</span>
          <span style={{ display: "inline-block", minWidth: 96, textAlign: "center", borderRadius: 999, border: `4px solid ${n === 3 ? GREEN : INK}`, background: n === 3 ? GREEN : "#fff", color: n === 3 ? "#fff" : INK, ...K, fontSize: 30, padding: "2px 14px", transform: `scale(${n === 3 ? interpolate(f - F(1.7), [0, 3, 6], [1.3, 0.95, 1], clamp) : 1})` }}>{n}/3</span>
        </div>
        {/* 台から下へ：理由 → 放っておくと → アカウントが壊れる */}
        <Box at={3.6} until={5.8} from={[540, 789]} to={[540, 900]} size={36}>正直、{c(BLUE, "この設定")}を{"\n"}しておらんだけで</Box>
        <Show a={5.8}>
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}><line x1={540} y1={789} x2={540} y2={880} stroke={INK} strokeWidth={5} /></svg>
          <Ghost at={5.8} style={{ left: 0, top: 870, width: 1080, textAlign: "center" }}>
            <span style={{ display: "inline-block", background: RED, color: "#fff", border: `5px solid ${INK}`, borderRadius: 999, padding: "8px 36px", ...K, fontSize: 36, boxShadow: `0 7px 0 ${INK}` }}>✕　リール500再生を超えられん</span>
          </Ghost>
        </Show>
        <Box at={8.0} from={[540, 945]} to={[540, 1010]} size={32}>そのまま放っておくと…</Box>
        <Box at={9.2} from={[540, 1042]} to={[540, 1135]} size={36}>
          <span style={{ position: "relative", display: "inline-block" }}>
            <span style={{ display: "inline-block", width: 46, height: 46, borderRadius: "50%", border: `4px solid ${BLUE}`, verticalAlign: "middle", marginRight: 14, textAlign: "center", lineHeight: "38px", fontSize: 28, color: BLUE }}>👤</span>あなたのアカウント
            {crack > 0 ? <svg width={300} height={110} style={{ position: "absolute", left: 140, top: -30, overflow: "visible" }}><path d="M40 0 L70 40 L50 55 L95 80 L80 110" fill="none" stroke={RED} strokeWidth={7} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - crack} /></svg> : null}
          </span>
        </Box>
        <Ghost at={10.2} style={{ left: 0, top: 1196, width: 1080, textAlign: "center" }}><span style={{ ...K, fontSize: 40, color: RED }}>が壊れていってしまう…</span></Ghost>
        <Tai x={690} y={1180} size={380} talk poses={[[10.2, "taichi_shock"], [11.3, ""]]} />
        {/* 11.3 暗くして、台だけ明るく＋今すぐ確認 */}
        <Spot at={11.3} rect={[150, 498, 790, 312]} r={16} />
        <Ghost at={11.4} style={{ left: 0, top: 832, width: 1080, textAlign: "center" }}>
          <span style={{ display: "inline-block", background: YEL, border: `5px solid ${INK}`, borderRadius: 16, padding: "10px 40px", ...K, fontSize: 44, color: INK, boxShadow: `0 7px 0 ${INK}` }}>{c(BLUE, "今すぐ確認")}するんじゃ!</span>
        </Ghost>
      </Camera>
      <SpeedLines at={12.1} dur={12} />
    </AbsoluteFill>
  );
};

// ════════ B：コンテンツ設定（12.5–31.0） ════════
const PX = 140, PY = 560, PW = 380, PH = 650; // スマホ
const BASE = (y = 900): CamKey => ({ t: 0, x: 540, y, s: 1.2, d: 1 });
const BK: CamKey[] = [BASE(), { t: 13.3, x: 440, y: 690, s: 2.5, d: 7 }, { ...BASE(), t: 16.0, d: 7 }, { t: 19.2, x: 410, y: 1100, s: 2.4, d: 7 }, { ...BASE(), t: 20.5, d: 7 }];
const TAGS: [string, string, string, number][] = [["#インスタ運用", BLUE, "#fff", 16.3], ["#集客", "#FFB000", INK, 16.9], ["#マーケティング", GREEN, "#fff", 17.5]];
const SceneB: React.FC = () => {
  const f = useCurrentFrame();
  if (f < F(12.5) || f >= F(31.0)) return null;
  const tagOut = interpolate(f, [F(25.4), F(25.4) + 4], [1, 0], clamp);
  const on = interpolate(f, [F(19.7), F(19.7) + 5], [0, 1], out);
  const ham = scr(BK, 13.3, [PX + PW - 48, PY + 76]);
  const tog = scr(BK, 19.2, [PX + 300, PY + 530]);
  return (
    <AbsoluteFill>
      <Bg />
      <Camera keys={BK}>
        <Crumb at={12.5} icon="≡">右上の三本線→コンテンツ設定</Crumb>
        <Title at={12.55}>コンテンツ設定</Title>
        {/* スマホ */}
        <div style={{ position: "absolute", left: PX, top: PY, width: PW, height: PH, background: "#fff", border: `6px solid ${INK}`, borderRadius: 48, boxShadow: `9px 11px 0 ${SH}`, boxSizing: "border-box", overflow: "hidden", ...ghostIn(f, F(12.6)) }}>
          <div style={{ width: 90, height: 12, borderRadius: 6, background: INK, margin: "18px auto 0" }} />
          <div style={{ position: "absolute", left: 26, top: 56, ...B, fontSize: 28, color: INK }}>コンテンツ設定</div>
          <div style={{ position: "absolute", right: 22, top: 50, width: 46, height: 42, border: `4px solid ${INK}`, borderRadius: 10, display: "flex", flexDirection: "column", justifyContent: "center", gap: 5, padding: "0 8px", boxSizing: "border-box" }}>{[0, 1, 2].map((i) => <div key={i} style={{ height: 4, background: INK, borderRadius: 2 }} />)}</div>
          <div style={{ position: "absolute", left: 22, right: 22, top: 112, height: 44, borderRadius: 999, background: "#EEF0F8", ...B, fontSize: 20, color: "#9AA0BC", lineHeight: "44px", paddingLeft: 20 }}>🔍 キーワードを追加</div>
          {/* タグ */}
          {TAGS.map(([t, bg, col, at], i) => f >= F(at) ? (
            <div key={t} style={{ position: "absolute", left: 26, right: 26, top: 186 + i * 66, height: 50, borderRadius: 999, background: bg, border: `4px solid ${INK}`, color: col, ...K, fontSize: 24, textAlign: "center", lineHeight: "42px", boxSizing: "border-box", opacity: tagOut * (ghostIn(f, F(at)).opacity as number), transform: `translateX(${interpolate(f - F(at), [0, 5], [-80, 0], out)}px)` }}>{t}</div>
          ) : null)}
          {/* 競合のリール */}
          {[0, 1, 2].map((i) => f >= F(25.4) + i * 3 ? (
            <div key={i} style={{ position: "absolute", left: 22, right: 22, top: 180 + i * 72, height: 58, borderRadius: 12, border: `4px solid ${INK}`, background: "#fff", ...ghostIn(f, F(25.4) + i * 3) }}>
              <span style={{ position: "absolute", left: 14, top: 10, fontSize: 24, color: BLUE }}>▷</span>
              <div style={{ position: "absolute", left: 52, top: 14, width: 200, height: 9, borderRadius: 5, background: "#B8C0E8" }} />
              <div style={{ position: "absolute", left: 52, top: 32, width: 140, height: 9, borderRadius: 5, background: "#DDE1F4" }} />
            </div>
          ) : null)}
          {/* オンのスイッチ */}
          {f >= F(19.2) ? (
            <div style={{ position: "absolute", left: 26, right: 26, top: 500, height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ ...B, fontSize: 28, color: INK }}>オン</span>
              <div style={{ position: "relative", width: 96, height: 50, borderRadius: 999, border: `4px solid ${INK}`, background: on > 0.5 ? GREEN : "#C9CDE0", boxSizing: "border-box" }}>
                <div style={{ position: "absolute", top: 4, left: 4 + on * 46, width: 34, height: 34, borderRadius: "50%", background: "#fff", border: `3px solid ${INK}`, boxSizing: "border-box" }} />
              </div>
            </div>
          ) : null}
        </div>
        {/* AI と、その先の人 */}
        <Show a={20.5}>
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
            <line x1={PX + PW} y1={760} x2={PX + PW + 220 * interpolate(f, [F(20.5), F(20.5) + 5], [0, 1], out)} y2={760} stroke={INK} strokeWidth={5} />
            {f >= F(22.9) ? [700, 800, 900].map((x, i) => <line key={x} x1={800} y1={840} x2={800 + (x - 800) * interpolate(f, [F(22.9) + i, F(22.9) + i + 5], [0, 1], out)} y2={840 + 150 * interpolate(f, [F(22.9) + i, F(22.9) + i + 5], [0, 1], out)} stroke={INK} strokeWidth={4} />) : null}
          </svg>
          <Ghost at={20.6} style={{ left: 720, top: 680, width: 160, height: 160 }}>
            <div style={{ width: 150, height: 150, borderRadius: "50%", background: "#fff", border: `5px solid ${INK}`, boxShadow: `0 7px 0 ${SH}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: BLUE, ...K }}>
              <span style={{ fontSize: 44, lineHeight: 1 }}>✦</span><span style={{ fontSize: 34 }}>AI</span>
            </div>
          </Ghost>
          {[700, 800, 900].map((x, i) => (
            <Ghost key={x} at={23.0 + i * 0.07} style={{ left: x - 40, top: 950 + (i === 1 ? 30 : 0), width: 80, height: 80 }}>
              <div style={{ position: "relative", width: 76, height: 76, borderRadius: "50%", background: "#fff", border: `4px solid ${INK}`, textAlign: "center", lineHeight: "66px", fontSize: 34, color: BLUE }}>
                👤
                {f >= F(25.8) + i * 2 ? <span style={{ position: "absolute", right: -10, top: -10, width: 34, height: 34, borderRadius: "50%", background: GREEN, border: `3px solid ${INK}`, color: "#fff", fontSize: 16, lineHeight: "28px", transform: `scale(${interpolate(f - F(25.8) - i * 2, [0, 3, 6], [0, 1.3, 1], clamp)})` }}>▶</span> : null}
              </div>
            </Ghost>
          ))}
          {f >= F(29.6) ? <div style={{ position: "absolute", left: 838, top: 664, width: 58, height: 58, borderRadius: "50%", background: YEL, border: `4px solid ${INK}`, textAlign: "center", lineHeight: "48px", fontSize: 32, transform: `scale(${interpolate(f - F(29.6), [0, 3, 6], [0, 1.3, 1], clamp)})` }}>↗</div> : null}
        </Show>
        {/* 注目（スポット） */}
        <Spot at={13.3} until={16.0} rect={[PX + PW - 64, PY + 44, 58, 54]} r={12} />
        <Spot at={16.3} until={19.2} rect={[PX + 14, PY + 172, PW - 28, 220]} r={18} />
        <Spot at={19.25} until={20.5} rect={[PX + 14, PY + 494, PW - 28, 72]} r={16} />
        <Spot at={25.7} until={28.3} rect={[PX + 14, PY + 168, PW - 28, 232]} r={18} />
        <Tai x={800} y={1330} size={330} poses={[[12.5, "taichi_think_chin"], [16.0, "taichi_point_left"], [20.5, "taichi_notice"], [25.4, "taichi_hmm_doubt"], [28.3, "taichi_lean_in"], [29.6, "taichi_happy_big"]]} />
      </Camera>
      {/* 説明の箱（画面の座標） */}
      <Box at={13.45} until={14.6} from={[ham[0] + 80, ham[1]]} to={[870, ham[1]]} size={40}>右上の{"\n"}{c(BLUE, "三本線")}から</Box>
      <Box at={14.6} until={16.0} from={[ham[0] + 80, ham[1]]} to={[870, ham[1]]} size={38}>{c(BLUE, "「コンテンツ設定」")}{"\n"}を開いて</Box>
      <Box at={16.0} until={19.2} from={scr(BK, 16.0, [330, PY + PH - 160])} to={[380, 1440]} size={36}>ジャンルに関係する{"\n"}{c(BLUE, "キーワード")}を入れておく</Box>
      <Box at={19.35} until={20.5} from={[tog[0] + 60, tog[1]]} to={[860, 660]} size={40}>これを{"\n"}{c(GREEN, "オン")}にすると</Box>
      <Box at={20.8} until={22.9} from={scr(BK, 20.8, [800, 840])} to={[380, 1440]} size={36}>インスタの{c(BLUE, "AI")}が{"\n"}ジャンルを理解して</Box>
      <Box at={23.3} until={25.4} from={scr(BK, 23.3, [700, 1030])} to={[380, 1440]} size={34}>興味を持ちそうな人に{"\n"}動画が{c(GREEN, "届きやすくなる")}</Box>
      <Box at={25.75} until={28.3} from={scr(BK, 25.75, [330, PY + 400])} to={[380, 1440]} size={34}>{c(BLUE, "競合のリール")}ばかりが{"\n"}流れてくるように</Box>
      <Box at={28.3} until={29.9} to={[380, 1440]} size={40}>リサーチの{"\n"}効率が上がって</Box>
      <Box at={30.0} from={scr(BK, 30.0, [800, 840])} to={[360, 1440]} size={42} bg={YEL}>リールが{"\n"}{c(RED, "伸びやすくなる!")}</Box>
      <SpeedLines at={12.5} dur={8} />
    </AbsoluteFill>
  );
};

// ════════ C：おすすめ表示（31.0–46.0）背景を青に ════════
const CK: CamKey[] = [BASE(), { t: 35.2, x: 540, y: 790, s: 1.35, d: 7 }, { t: 37.2, x: 400, y: 790, s: 2.0, d: 7 }, { t: 39.2, x: 540, y: 860, s: 1.2, d: 8 }, { ...BASE(), t: 40.6, d: 1 }];
const WY = 520; // ブラウザの窓
const SceneC: React.FC = () => {
  const f = useCurrentFrame();
  if (f < F(31.0) || f >= F(46.0)) return null;
  const chk = f >= F(38.0);
  const row = scr(CK, 35.2, [540, WY + 300]);
  const cb = scr(CK, 37.2, [204, WY + 262]);
  const cb2 = scr(CK, 39.2, [204, WY + 262]);
  const DOTS = 26;
  return (
    <AbsoluteFill>
      <Bg blue />
      <Camera keys={CK}>
        <Crumb at={31.0} icon="🖥">PC→プロフィールを編集</Crumb>
        <Title at={31.05} white>おすすめ表示</Title>
        {/* ブラウザの窓 */}
        <Ghost at={33.7} until={40.5} style={{ left: 115, top: WY, width: 850, height: 400 }}>
          <div style={{ position: "relative", width: 850, height: 400, background: "#fff", border: `6px solid ${INK}`, borderRadius: 20, boxShadow: `0 10px 0 #142A9C`, boxSizing: "border-box", overflow: "hidden" }}>
            <div style={{ height: 46, borderBottom: `4px solid ${INK}`, background: "#F3F4FB", display: "flex", gap: 12, alignItems: "center", paddingLeft: 22 }}>{["#F05A5A", "#FFC23A", "#2FBF6B"].map((col) => <span key={col} style={{ width: 18, height: 18, borderRadius: "50%", background: col }} />)}</div>
            <div style={{ position: "absolute", left: 0, top: 70, width: 838, textAlign: "center", ...B, fontSize: 38, color: INK }}>プロフィールを編集</div>
            <div style={{ position: "absolute", left: 60, top: 140, width: 540, height: 14, borderRadius: 7, background: "#E1E4F3" }} />
            <div style={{ position: "absolute", left: 60, top: 172, width: 420, height: 14, borderRadius: 7, background: "#EDEFF8" }} />
            {f >= F(35.2) ? (
              <div style={{ position: "absolute", left: 40, right: 40, top: 222, height: 80, borderRadius: 14, border: `4px solid ${INK}`, display: "flex", alignItems: "center", gap: 22, paddingLeft: 26, ...ghostIn(f, F(35.2)) }}>
                <span style={{ width: 46, height: 46, borderRadius: 8, border: `5px solid ${INK}`, background: chk ? GREEN : "#fff", color: "#fff", ...K, fontSize: 34, textAlign: "center", lineHeight: "38px", boxSizing: "border-box", transform: `scale(${chk ? interpolate(f - F(38.0), [0, 3, 6], [1.3, 0.95, 1], clamp) : 1})` }}>{chk ? "✓" : ""}</span>
                <span style={{ ...B, fontSize: 30, color: INK }}>プロフィールにアカウントのおすすめを表示</span>
              </div>
            ) : null}
            {f >= F(37.3) && f < F(40.5) ? <div style={{ position: "absolute", left: 100, top: 262, fontSize: 52, transform: `translate(${interpolate(f, [F(37.3), F(37.3) + 8], [60, 0], out)}px, ${interpolate(f, [F(37.3), F(37.3) + 8], [50, 0], out)}px)` }}>👆</div> : null}
          </div>
        </Ghost>
        <Spot at={35.25} until={39.2} rect={[153, WY + 220, 774, 84]} r={16} />
        {/* 同じジャンルの発信者を見ている人の輪 */}
        <Show a={40.6}>
          {Array.from({ length: DOTS }).map((_, i) => {
            const a = (i / DOTS) * Math.PI * 2 - Math.PI / 2;
            const at = F(41.1) + i * 0.6;
            if (f < at) return null;
            const yel = f >= F(44.1) + i * 1.1;
            return <div key={i} style={{ position: "absolute", left: 540 + Math.cos(a) * 390 - 17, top: 760 + Math.sin(a) * 230 - 17, width: 34, height: 34, borderRadius: "50%", background: yel ? YEL : "#fff", border: `4px solid ${INK}`, boxSizing: "border-box", transform: `scale(${interpolate(f - at, [0, 3, 6], [0, 1.3, 1], clamp) * (yel ? interpolate(f - F(44.1) - i * 1.1, [0, 3, 6], [1, 1.35, 1], clamp) : 1)})` }} />;
          })}
          <Ghost at={40.6} style={{ left: 430, top: 650, width: 220, height: 220 }}>
            <div style={{ width: 210, height: 210, borderRadius: "50%", background: "#fff", border: `6px solid ${INK}`, boxShadow: `0 8px 0 #142A9C`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", ...B, color: INK }}>
              <span style={{ fontSize: 56, color: BLUE, lineHeight: 1 }}>👤</span><span style={{ fontSize: 24, lineHeight: 1.2, textAlign: "center" }}>同ジャンルの{"\n"}発信者</span>
            </div>
          </Ghost>
        </Show>
        <Show a={43.0}>
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}><line x1={470} y1={988} x2={470 - 120 * interpolate(f, [F(43.0), F(43.0) + 4], [0, 1], out)} y2={988 + 112 * interpolate(f, [F(43.0), F(43.0) + 4], [0, 1], out)} stroke={INK} strokeWidth={5} /></svg>
          <Ghost at={43.1} style={{ left: 170, top: 1080 }}>
            <div style={{ ...BOXS, display: "flex", alignItems: "center", gap: 18, padding: "12px 30px" }}>
              <span style={{ width: 54, height: 54, borderRadius: "50%", background: YEL, border: `4px solid ${INK}`, textAlign: "center", lineHeight: "46px", fontSize: 30 }}>★</span>
              <span style={{ textAlign: "left", lineHeight: 1.2 }}><span style={{ fontSize: 22, color: BLUE }}>おすすめ</span><br /><span style={{ fontSize: 34 }}>あなたのアカウント</span></span>
            </div>
          </Ghost>
        </Show>
        <Tai x={780} y={1290} size={320} poses={[[31.0, "taichi_explain_both"], [35.2, "taichi_point_left"], [38.0, "taichi_ok_hand"], [40.6, "taichi_notice"], [44.1, "taichi_happy_big"]]} />
      </Camera>
      <Box at={31.9} until={33.7} from={[850, 1560]} to={[360, 1400]} size={40}>これは{c(BLUE, "PC")}から{"\n"}変えられる設定</Box>
      <Box at={34.1} until={35.2} from={scr(CK, 34.1, [540, WY + 112])} to={[540, 1080]} size={40}>{c(BLUE, "「プロフィールを編集」")}を開く</Box>
      <Box at={35.4} until={37.2} from={[row[0], row[1] + 50]} to={[540, row[1] + 190]} size={36}>「プロフィールにアカウントの{"\n"}{c(BLUE, "おすすめを表示")}」</Box>
      <Box at={37.4} until={39.2} from={[cb[0], cb[1] + 50]} to={[560, cb[1] + 200]} size={38}>ここに{c(GREEN, "チェック")}が入っておるか{"\n"}確認してくれ</Box>
      <Box at={39.4} until={40.6} from={[cb2[0], cb2[1] + 30]} to={[300, cb2[1] + 190]} size={40}>これを{"\n"}{c(GREEN, "オン")}にすると</Box>
      <Box at={41.3} until={43.0} from={scr(CK, 41.3, [540, 992])} to={[540, 1190]} size={38}>{c(BLUE, "同じジャンル")}の発信者を{"\n"}見ている人に</Box>
      <Box at={44.2} to={[360, 1430]} size={40}>{c(GREEN, "おすすめ")}として{"\n"}表示されるように!</Box>
    </AbsoluteFill>
  );
};

// ════════ D：アカウントステータス（46.0–66.2） ════════
const DK: CamKey[] = [BASE(), { t: 54.0, x: 770, y: 700, s: 1.75, d: 7 }, { ...BASE(), t: 56.3, d: 7 }];
const ROWS = ["削除されたコンテンツ", "おすすめに表示されない", "利用が制限される機能"];
const CY = 500; // カード
const SceneD: React.FC = () => {
  const f = useCurrentFrame();
  if (f < F(46.0) || f >= F(66.2)) return null;
  const shrink = interpolate(f, [F(50.5), F(50.5) + 7], [0, 1], { ...clamp, easing: Easing.bezier(0.7, 0, 0.18, 1) });
  const grow = interpolate(f, [F(53.0), F(53.0) + 6], [0, 1], out);
  const colB = scr(DK, 54.0, [899, CY + 340]);
  const dark = interpolate(f, [F(62.7), F(62.7) + 4], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Bg />
      <Camera keys={DK}>
        <Crumb at={46.0} icon="✳">設定→アカウントステータス</Crumb>
        <Title at={46.05} size={74}>アカウントステータス</Title>
        {/* カード */}
        {f >= F(50.6) ? (
          <div style={{ position: "absolute", left: 110, top: CY, width: 860, height: 320 + 60 * grow, background: "#fff", border: `6px solid ${INK}`, borderRadius: 22, boxShadow: `0 10px 0 ${SH}`, boxSizing: "border-box", ...ghostIn(f, F(50.6)) }}>
            <div style={{ position: "absolute", left: 0, top: 18, width: 848, textAlign: "center", ...B, fontSize: 30, color: INK }}>アカウントステータス</div>
            <div style={{ position: "absolute", left: 20, right: 20, top: 66, height: 3, background: "#E3E6F5" }} />
            {f >= F(53.0) ? ROWS.map((r, i) => {
              const ck = F(54.2) + i * 5;
              const bad = i === 1 && f >= F(58.0);
              return (
                <div key={r} style={{ position: "absolute", left: 24, right: 24, top: 90 + i * 84, height: 70, borderRadius: 14, border: `4px solid ${bad ? RED : INK}`, background: "#F7F8FD", display: "flex", alignItems: "center", justifyContent: "center", ...ghostIn(f, F(53.0) + i * 2) }}>
                  <span style={{ ...B, fontSize: 32, color: INK }}>{r}</span>
                  {f >= ck ? <span style={{ position: "absolute", right: 18, top: 9, width: 46, height: 46, borderRadius: "50%", background: bad ? RED : GREEN, border: `4px solid ${INK}`, color: "#fff", ...K, fontSize: 26, textAlign: "center", lineHeight: "38px", boxSizing: "border-box", transform: `scale(${interpolate(f - (bad ? F(58.0) : ck), [0, 3, 6], [0.2, 1.3, 1], clamp)})` }}>{bad ? "✕" : "✓"}</span> : null}
                </div>
              );
            }) : null}
          </div>
        ) : null}
        <Spot at={53.05} until={54.0} rect={[126, CY + 82, 828, 260]} r={18} />
        <Spot at={54.05} until={56.3} rect={[870, CY + 86, 74, 250]} r={16} />
        <Spot at={58.0} until={61.5} rect={[126, CY + 168, 828, 84]} r={16} color={RED} />
        {/* 太一：真ん中で話す → 角へ */}
        {f < F(62.7) ? <Tai x={270 + shrink * 480} y={760 + shrink * 560} size={560 - shrink * 250} talk poses={[[58.0, "taichi_surprise_hands"]]} /> : null}
      </Camera>
      <Box at={47.3} until={50.4} to={[540, 640]} size={40} tail="down">アカウントが{c(RED, "規制対象")}に{"\n"}なっておらんか確認じゃ</Box>
      <Box at={51.1} until={53.0} from={scr(DK, 51.1, [540, CY + 66])} to={[540, 1010]} size={38}>設定→{c(BLUE, "「アカウントステータス」")}</Box>
      <Box at={53.2} until={54.0} from={scr(DK, 53.2, [540, CY + 382])} to={[540, 1050]} size={40}>3つの項目すべてに</Box>
      <Box at={54.3} until={56.3} from={colB} to={[420, 1320]} size={38}>{c(GREEN, "緑のチェック")}が入っておるか{"\n"}見てみてくれ</Box>
      <Box at={56.4} until={59.0} from={scr(DK, 56.4, [899, CY + 382])} to={[440, 1100]} size={36}>もし1つでも{c(RED, "緑になっておらん")}{"\n"}項目があったら</Box>
      <Box at={59.0} until={61.5} from={scr(DK, 59.0, [300, CY + 252])} to={[340, 1100]} size={38}>それは投稿が{"\n"}{c(RED, "規制対象")}になっておるサイン</Box>
      <Box at={62.0} until={62.7} from={scr(DK, 62.0, [300, CY + 252])} to={[420, 1080]} size={40}>そのまま放っておくと</Box>
      {/* 最悪の場合：画面ごと真っ暗に */}
      {dark > 0 ? (
        <AbsoluteFill style={{ background: `rgba(30,31,46,${0.8 * dark})` }}>
          <Ghost at={62.75} style={{ left: 0, top: 740, width: 1080, textAlign: "center" }}><span style={{ ...K, fontSize: 76, color: "#fff" }}>最悪の場合…</span></Ghost>
          <Ghost at={63.8} style={{ left: 0, top: 860, width: 1080, textAlign: "center" }}><span style={{ ...K, fontSize: 56, color: "#fff" }}>あなたのアカウントが</span></Ghost>
          {f >= F(65.0) ? (
            <div style={{ position: "absolute", left: 0, top: 980, width: 1080, textAlign: "center" }}>
              <span style={{ display: "inline-block", background: "#FFF3F0", border: `9px solid ${RED}`, borderRadius: 18, padding: "4px 50px", ...K, fontSize: 110, color: RED, transform: `rotate(-6deg) scale(${interpolate(f - F(65.0), [0, 4, 7], [1.9, 0.92, 1], clamp)})`, opacity: interpolate(f - F(65.0), [0, 3], [0, 1], clamp) }}>垢BAN</span>
            </div>
          ) : null}
          <Ghost at={65.3} style={{ left: 0, top: 1170, width: 1080, textAlign: "center" }}><span style={{ ...B, fontSize: 40, color: "#fff" }}>されてしまうことも あるんじゃ</span></Ghost>
          <Tai x={760} y={1330} size={300} poses={[[0, "taichi_sad"]]} />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

// ════════ E：締め（66.2–73.4）今すぐ確認！ ════════
const LIST: [string, string][] = [["コンテンツ設定", BLUE], ["おすすめ表示", "#FFB000"], ["アカウントステータス", RED]];
const SceneE: React.FC = () => {
  const f = useCurrentFrame();
  if (f < F(66.2)) return null;
  return (
    <AbsoluteFill>
      <Bg />
      <Camera keys={[{ t: 0, x: 540, y: 1000, s: 1.2, d: 1 }]}>
      {/* プロフィールの札（自分のアカウントに置き換え） */}
      <Ghost at={66.2} style={{ left: 115, top: 200, width: 850 }}>
        <div style={{ position: "relative", height: 150, background: "#fff", border: `6px solid ${INK}`, borderRadius: 24, boxShadow: `0 9px 0 ${SH}`, display: "flex", alignItems: "center", gap: 24, padding: "0 30px", boxSizing: "border-box" }}>
          <div style={{ width: 106, height: 106, borderRadius: "50%", border: `4px solid ${INK}`, overflow: "hidden", background: LAV }}><GenSlot name="taichi_face_smile" size={106} /></div>
          <div style={{ flex: 1, textAlign: "center" }}><div style={{ ...K, fontSize: 46, color: INK, lineHeight: 1.1 }}>たいち</div><div style={{ ...B, fontSize: 24, color: "#6B7092" }}>積立保険を売らない保険屋さん</div></div>
          <span style={{ background: BLUE, color: "#fff", borderRadius: 999, padding: "8px 26px", ...K, fontSize: 28 }}>フォロー</span>
        </div>
      </Ghost>
      <Title at={66.25} size={120} top={400}>今すぐ確認!</Title>
      {LIST.map(([t, col], i) => {
        const at = F(66.6) + i * 4;
        const ck = F(70.5) + i * 5;
        return f >= at ? (
          <div key={t} style={{ position: "absolute", left: 150, top: 590 + i * 100, width: 640, height: 78, background: "#fff", border: `5px solid ${INK}`, borderRadius: 14, boxShadow: `0 7px 0 ${SH}`, display: "flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box", ...ghostIn(f, at) }}>
            <span style={{ position: "absolute", left: 20, top: 14, width: 42, height: 42, borderRadius: 8, border: `4px solid ${INK}`, background: f >= ck ? GREEN : "#fff", color: "#fff", ...K, fontSize: 28, textAlign: "center", lineHeight: "34px", boxSizing: "border-box", transform: `scale(${f >= ck ? interpolate(f - ck, [0, 3, 6], [1.4, 0.95, 1], clamp) : 1})` }}>{f >= ck ? "✓" : ""}</span>
            <span style={{ ...B, fontSize: 34, color: INK }}>{t}</span>
            <span style={{ position: "absolute", right: 16, top: 14, width: 14, height: 40, borderRadius: 7, background: col }} />
          </div>
        ) : null;
      })}
      <Tai x={520} y={960} size={480} talk />
      </Camera>
      <Box at={66.5} until={68.5} to={[280, 1250]} size={36}>気づかんうちに{"\n"}{c(RED, "規制")}がかかっておったり</Box>
      <Box at={68.5} until={70.5} to={[280, 1250]} size={36}>{c(BLUE, "設定が変わって")}しまって{"\n"}おる人もおるから</Box>
      <Box at={70.5} to={[290, 1240]} size={40} bg={YEL} tail="right">{c(BLUE, "今すぐ確認")}して{"\n"}おくんじゃぞ!</Box>
    </AbsoluteFill>
  );
};

export const MARKE_FRAMES = F(73.36);
export const MarkeRepro: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: LAV, fontFamily: FONT }}>
    <Audio src={staticFile("marke-ref-audio.wav")} />
    <SceneA /><SceneB /><SceneC /><SceneD /><SceneE />
  </AbsoluteFill>
);
