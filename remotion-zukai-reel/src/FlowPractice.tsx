import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Easing } from "remotion";
import { FONT } from "./components/font";

// ───────────────────────────────────────────────────────────────
// 縦スクロール連結フローチャート型｜練習台（参考=インスタ運用術リールの語彙）
//   1本の縦スパインに沿って要素が積み上がり、カメラが下へ追う。
//   練習ポイント：①カメラのスムーズ追従 ②要素のスライドイン(overshoot)
//   ③赤✕スタンプ ④側吹き出し(ピンク正解) ⑤STEPタブ ⑥横アイコン行 ⑦before→after棒
//   ⑧章の切り替わり(ソフトフラッシュ/フェード)
// ───────────────────────────────────────────────────────────────

const C = {
  bg: "#F4F4F6", ink: "#2B2B30", gray: "#9AA0A8", line: "#C9CDD3",
  red: "#E0483B", pink: "#F6D0DA", pinkLine: "#E86A8A", orange: "#E8912D", orangeBg: "#FBEBD4",
  green: "#2E9E6B", navy: "#1F3A5F",
};
export const FLOW_FRAMES = 660; // 22s
const CX = 540;

const useSp = (delay: number, dur = 16, cfg: Parameters<typeof spring>[0]["config"] = { damping: 13, stiffness: 140, mass: 0.9 }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  return spring({ frame: f - delay, fps, config: cfg, durationInFrames: dur });
};
// スライドイン（少し行き過ぎて戻る）
const In: React.FC<{ delay: number; from?: "down" | "up" | "left" | "right"; dist?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ delay, from = "down", dist = 46, style, children }) => {
  const s = useSp(delay);
  const d = { down: [0, (1 - s) * dist], up: [0, (1 - s) * -dist], left: [(1 - s) * -dist, 0], right: [(1 - s) * dist, 0] }[from];
  return <div style={{ opacity: Math.min(1, s * 1.6), transform: `translate(${d[0]}px, ${d[1]}px)`, ...style }}>{children}</div>;
};
// 線を描く
const Draw: React.FC<{ d: string; delay: number; dur?: number; color?: string; w?: number; dash?: boolean }> = ({ d, delay, dur = 10, color = C.line, w = 4, dash }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [delay, delay + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={dash ? "10 8" : 1} strokeDashoffset={dash ? 0 : 1 - p} opacity={dash ? p : (p > 0.001 ? 1 : 0)} />;
};
// 丸アイコン（ラベル付き）
const IconNode: React.FC<{ emoji: string; label: string; color?: string; dim?: boolean }> = ({ emoji, label, color = C.ink, dim }) => (
  <div style={{ textAlign: "center", opacity: dim ? 0.35 : 1 }}>
    <div style={{ width: 86, height: 86, borderRadius: "50%", background: "#fff", border: `3px solid ${dim ? C.line : color}`, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 40, boxShadow: dim ? "none" : "0 5px 14px rgba(43,43,48,0.10)" }}>{emoji}</div>
    <div style={{ fontSize: 24, fontWeight: 800, color: dim ? C.gray : C.ink, marginTop: 8 }}>{label}</div>
  </div>
);
// 赤✕スタンプ（大きく回転しながら押される）
const XStamp: React.FC<{ delay: number; size?: number; x: number; y: number }> = ({ delay, size = 150, x, y }) => {
  const f = useCurrentFrame();
  const s = interpolate(f, [delay, delay + 5, delay + 10], [2.4, 0.9, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const o = interpolate(f, [delay, delay + 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ position: "absolute", left: x - size / 2, top: y - size / 2, opacity: o, transform: `scale(${s}) rotate(-8deg)`, transformOrigin: "center" }}>
      <line x1="16" y1="16" x2="84" y2="84" stroke={C.red} strokeWidth="13" strokeLinecap="round" />
      <line x1="84" y1="16" x2="16" y2="84" stroke={C.red} strokeWidth="13" strokeLinecap="round" />
    </svg>
  );
};
// STEPタブ（オレンジ）
const StepTab: React.FC<{ n: string; delay: number }> = ({ n, delay }) => (
  <In delay={delay} from="down" dist={20} style={{ display: "inline-block" }}>
    <span style={{ display: "inline-block", background: "#fff", color: C.orange, border: `3px solid ${C.orange}`, borderRadius: 12, padding: "6px 22px", fontSize: 30, fontWeight: 900, boxShadow: "0 4px 10px rgba(232,145,45,0.15)" }}>{n}</span>
  </In>
);

// board上のY座標
const Y = {
  title: 120, card: 300, row: 620, gear: 900, xmind: 1080, callout: 1280,
  step1: 1520, s1b: 1640, step2: 1960, s2b: 2080, step3: 2420, s3b: 2560, end: 3000,
};
const LAST = 3180;

export const FlowPractice: React.FC = () => {
  const f = useCurrentFrame();
  // カメラ：出現に合わせて下へ追従（イージングでスムーズに）
  const camBP = [
    [0, 360], [60, 360], [90, 700], [150, 980], [210, 1320], [300, 1620],
    [380, 2060], [460, 2520], [560, 3050], [FLOW_FRAMES, 3050],
  ];
  const focus = interpolate(f, camBP.map(b => b[0]), camBP.map(b => b[1]), { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const offset = -(focus - 760);

  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: FONT, overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, width: 1080, transform: `translateY(${offset}px)` }}>
        {/* 縦スパイン＋接続線 */}
        <svg width={1080} height={LAST} style={{ position: "absolute", inset: 0 }}>
          <Draw d={`M${CX} ${Y.card + 150} L${CX} ${Y.row - 60}`} delay={60} />
          <Draw d={`M${CX} ${Y.row + 70} L${CX} ${Y.gear - 40}`} delay={92} />
          <Draw d={`M${CX} ${Y.gear + 70} L${CX} ${Y.xmind - 30}`} delay={120} />
          <Draw d={`M${CX} ${Y.xmind + 30} L${CX} ${Y.callout - 50}`} delay={150} />
          <Draw d={`M${CX} ${Y.callout + 50} L${CX} ${Y.step1 - 30}`} delay={200} />
          <Draw d={`M${CX} ${Y.s1b + 70} L${CX} ${Y.step2 - 30}`} delay={300} />
          <Draw d={`M${CX} ${Y.s2b + 70} L${CX} ${Y.step3 - 30}`} delay={380} />
          <Draw d={`M${CX} ${Y.s3b + 90} L${CX} ${Y.end - 40}`} delay={470} />
          {/* STEP1 分岐 */}
          <Draw d={`M300 ${Y.s1b + 10} L780 ${Y.s1b + 10} M300 ${Y.s1b + 10} L300 ${Y.s1b + 50} M540 ${Y.s1b + 10} L540 ${Y.s1b + 50} M780 ${Y.s1b + 10} L780 ${Y.s1b + 50}`} delay={250} color={C.line} />
        </svg>

        {/* タイトル */}
        <In delay={0} from="up" style={{ position: "absolute", top: Y.title, left: 0, width: 1080, textAlign: "center" }}>
          <span style={{ fontSize: 52, fontWeight: 900, color: C.ink, borderBottom: `6px solid ${C.orange}`, paddingBottom: 4 }}>年収の壁 2026</span>
        </In>
        {/* 専門家カード（結論先出し） */}
        <In delay={10} from="down" style={{ position: "absolute", top: Y.card, left: 90, width: 900 }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center", background: "#fff", border: `3px solid ${C.line}`, borderRadius: 20, padding: "20px 24px", boxShadow: "0 8px 20px rgba(43,43,48,0.08)" }}>
            <div style={{ width: 88, height: 88, borderRadius: "50%", background: C.orangeBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 46, flexShrink: 0 }}>🧑‍💼</div>
            <div style={{ fontSize: 30, fontWeight: 900, color: C.ink, lineHeight: 1.4 }}>大事なのは「いくら稼ぐか」より<br /><span style={{ color: C.red }}>どの壁を超えるか</span></div>
          </div>
        </In>

        {/* 横アイコン行：4つの壁 */}
        <In delay={60} from="down" style={{ position: "absolute", top: Y.row, left: 0, width: 1080 }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10 }}>
            {[{ e: "🏠", l: "住民税119" }, { e: "👫", l: "扶養136" }, { e: "📄", l: "所得税178" }, { e: "🛡️", l: "社保130" }].map((x, i) => (
              <React.Fragment key={i}>
                <IconNode emoji={x.e} label={x.l} color={i === 3 ? C.red : C.ink} />
                {i < 3 && <span style={{ fontSize: 30, color: C.line, alignSelf: "flex-start", marginTop: 30 }}>→</span>}
              </React.Fragment>
            ))}
          </div>
        </In>

        {/* 歯車（手段）→ ✕ */}
        <In delay={92} from="down" style={{ position: "absolute", top: Y.gear, left: CX - 55, width: 110, textAlign: "center" }}>
          <div style={{ width: 110, height: 110, borderRadius: 16, background: C.ink, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 50 }}>⚙️</div>
        </In>
        <In delay={120} from="left" style={{ position: "absolute", top: Y.xmind, left: 0, width: 1080, textAlign: "center" }}>
          <span style={{ fontSize: 30, fontWeight: 900, color: C.gray }}>「178万まで働いてOK」</span>
        </In>
        <XStamp delay={132} x={CX + 150} y={Y.xmind + 14} size={120} />

        {/* 側吹き出し：✕ / ピンク正解 */}
        <In delay={150} from="left" style={{ position: "absolute", top: Y.callout - 36, left: 150, width: 780 }}>
          <div style={{ position: "relative", display: "inline-block", background: "#fff", border: `2px solid ${C.gray}`, borderRadius: 12, padding: "10px 48px 10px 18px", fontSize: 26, fontWeight: 800, color: C.gray }}>目的：壁を絶対に超えない
            <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: C.red, fontWeight: 900, fontSize: 30 }}>✕</span>
          </div>
        </In>
        <In delay={168} from="left" style={{ position: "absolute", top: Y.callout + 24, left: 150, width: 820 }}>
          <div style={{ display: "inline-block", background: C.pink, border: `2px solid ${C.pinkLine}`, borderRadius: 12, padding: "10px 20px", fontSize: 28, fontWeight: 900, color: C.ink }}>○ 世帯の手取りと保障で決める</div>
        </In>

        {/* STEP1 税金 */}
        <In delay={210} from="down" dist={20} style={{ position: "absolute", top: Y.step1, left: 0, width: 1080, textAlign: "center" }}><StepTab n="STEP1 税金" delay={210} /></In>
        <In delay={224} from="down" style={{ position: "absolute", top: Y.s1b - 54, left: 0, width: 1080, textAlign: "center" }}>
          <span style={{ fontSize: 30, fontWeight: 900, color: C.ink }}>超えても<span style={{ color: C.orange }}>少しずつ</span>（怖くない）</span>
        </In>
        {[{ l: "住民税", s: "119万〜" }, { l: "所得税", s: "178万〜" }, { l: "逆転", s: "しない" }].map((x, i) => (
          <In key={i} delay={232 + i * 6} from="down" dist={26} style={{ position: "absolute", top: Y.s1b + 60, left: 300 + i * 240 - 90, width: 180, textAlign: "center" }}>
            <div style={{ background: "#fff", border: `3px solid ${C.orange}`, borderRadius: 14, padding: "12px 6px" }}><div style={{ fontSize: 24, fontWeight: 900, color: C.ink }}>{x.l}</div><div style={{ fontSize: 22, fontWeight: 800, color: C.orange }}>{x.s}</div></div>
          </In>
        ))}

        {/* STEP2 扶養 */}
        <In delay={300} from="down" dist={20} style={{ position: "absolute", top: Y.step2, left: 0, width: 1080, textAlign: "center" }}><StepTab n="STEP2 扶養" delay={300} /></In>
        <In delay={314} from="down" style={{ position: "absolute", top: Y.s2b - 54, left: 0, width: 1080, textAlign: "center" }}>
          <span style={{ fontSize: 30, fontWeight: 900, color: C.ink }}>169万まで<span style={{ color: C.green }}>満額</span>（怖くない）</span>
        </In>
        <In delay={322} from="down" style={{ position: "absolute", top: Y.s2b + 60, left: 0, width: 1080, textAlign: "center" }}>
          <span style={{ fontSize: 44, fontWeight: 900, color: C.ink }}>136万 <span style={{ color: C.gray, fontSize: 30 }}>→</span> 169万</span>
        </In>

        {/* STEP3 社会保険（山場）＋ before→after棒 */}
        <In delay={380} from="down" dist={20} style={{ position: "absolute", top: Y.step3, left: 0, width: 1080, textAlign: "center" }}><StepTab n="★STEP3 社会保険" delay={380} /></In>
        <In delay={394} from="down" style={{ position: "absolute", top: Y.s3b - 54, left: 0, width: 1080, textAlign: "center" }}>
          <span style={{ fontSize: 34, fontWeight: 900, color: "#fff", background: C.red, borderRadius: 12, padding: "8px 22px" }}>130万で手取りに大きく影響</span>
        </In>
        {/* before→after 棒（定性） */}
        <In delay={404} from="down" style={{ position: "absolute", top: Y.s3b + 70, left: 0, width: 1080 }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 60 }}>
            <BeforeAfterBar label="超えた直後" h={120} color={C.red} delay={410} note="負担が発生" />
            <span style={{ fontSize: 40, color: C.red, alignSelf: "center" }}>➜</span>
            <BeforeAfterBar label="しっかり働く" h={230} color={C.green} delay={424} note="手取りUP" />
          </div>
        </In>

        {/* 締め */}
        <In delay={470} from="down" style={{ position: "absolute", top: Y.end, left: 0, width: 1080, textAlign: "center" }}>
          <div style={{ fontSize: 40, fontWeight: 900, color: C.ink, lineHeight: 1.4 }}>壁を超えないより、<br /><span style={{ color: C.red }}>世帯の手取りと保障</span>で決める</div>
        </In>
      </div>

      {/* 章の切り替わり＝ソフトフラッシュ（カメラが大きく動く瞬間に白をふわっと） */}
      <FlashOverlay at={[88, 208, 298, 378, 468]} />
    </AbsoluteFill>
  );
};

const BeforeAfterBar: React.FC<{ label: string; h: number; color: string; delay: number; note: string }> = ({ label, h, color, delay, note }) => {
  const g = useSp(delay, 18, { damping: 16 });
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 22, fontWeight: 900, color, marginBottom: 6 }}>{note}</div>
      <div style={{ width: 150, height: h * g, background: color, borderRadius: "12px 12px 0 0", margin: "0 auto" }} />
      <div style={{ width: 170, height: 4, background: C.line }} />
      <div style={{ fontSize: 24, fontWeight: 800, color: C.ink, marginTop: 8 }}>{label}</div>
    </div>
  );
};

// 章切り替わりのソフトフラッシュ（白をふわっと重ねる）
const FlashOverlay: React.FC<{ at: number[] }> = ({ at }) => {
  const f = useCurrentFrame();
  let op = 0;
  for (const a of at) {
    op = Math.max(op, interpolate(f, [a - 3, a, a + 9], [0, 0.5, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  }
  return <AbsoluteFill style={{ background: "#fff", opacity: op, pointerEvents: "none" }} />;
};
