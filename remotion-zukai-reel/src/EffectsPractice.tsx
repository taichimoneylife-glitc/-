import React from "react";
import { AbsoluteFill, Easing, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { K, B, SER, F } from "./components/marke";
import { GenSlot } from "./MileLifePlan";

// ════════════════════════════════════════════════════════════════════
//  練習：参考⑬「エフェクト17選」のうち、人を切り抜かなくても使える14個を、たいちの動画（talk_video.mp4）で再現
//  分析：.claude/skills/zukai-reel/references/ref-13-effects17.md
//  形：方眼＋固定タイトル＋目次（今は青枠・終わると✓）＋中央のカードの中だけが動く
// ════════════════════════════════════════════════════════════════════
const INK = "#22252E", SUB = "#8A8F9C", BLUE = "#3B6FE0", G = "#23A06B", O = "#EF7D57", RED = "#E5483B", YEL = "#FFE15A";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const OUT = Easing.bezier(0.16, 1, 0.3, 1);
const p01 = (k: number, a: number, b: number, e = OUT) => interpolate(k, [a, b], [0, 1], { ...clamp, easing: e });
const pop = (k: number, t: number) => interpolate(k - t, [0, 4, 8], [0, 1.12, 1], clamp);
const SEG = 66; // 1つ 2.2秒
const CW = 760, CH = 1000, CX = (1080 - CW) / 2, CY = 640;

const LIST: [string, string][] = [
  ["Orbit", "回るアイコン"], ["Couch Wall", "後ろに貼る"], ["UI World", "チャット画面"], ["Digital Zoom", "枠で寄る"],
  ["Phone Mockup", "スマホ枠"], ["Checklist", "チェック"], ["Headline Wall", "見出しの紙"], ["Zoom Through Cut", "寄って抜ける"],
  ["Chart Grow", "数字と棒"], ["Pullback Reveal", "引くと画面"], ["Doodle Boil", "手描き"], ["Vertigo", "奥行きの線"],
  ["Cover Story", "雑誌の表紙"], ["Glass Type", "すりガラス文字"],
];
export const EFFECTS_FRAMES = LIST.length * SEG + 45;

// 動画（カードの中）
const Talk: React.FC<{ z?: number; ox?: number; oy?: number; style?: React.CSSProperties; start?: number }> = ({ z = 1, ox = 0, oy = 0, style, start = 0 }) => (
  <OffthreadVideo src={staticFile("talk_video.mp4")} muted startFrom={start} style={{ position: "absolute", left: (CW - 1080 * 0.82 * z) / 2 + ox, top: -260 * z + oy, width: 1080 * 0.82 * z, height: 1920 * 0.82 * z, ...style }} />
);
const Card: React.FC<{ children: React.ReactNode; bg?: string; style?: React.CSSProperties }> = ({ children, bg = "#EDE9E1", style }) => (
  <div style={{ position: "absolute", left: CX, top: CY, width: CW, height: CH, borderRadius: 34, overflow: "hidden", background: bg, boxShadow: "0 24px 60px rgba(30,35,50,0.16)", ...style }}>{children}</div>
);
const Note: React.FC<{ x: number; y: number; k: number; t: number; rot?: number; children: React.ReactNode }> = ({ x, y, k, t, rot = -3, children }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: `rotate(${rot}deg) scale(${pop(k, t)})`, background: "#FFFDF5", padding: "14px 18px", boxShadow: "0 6px 14px rgba(0,0,0,0.18)", ...SER, fontSize: 40, color: INK, lineHeight: 1.15, whiteSpace: "nowrap" }}>{children}</div>
);

// ── 14個 ──
const E: React.FC<{ i: number; k: number }> = ({ i, k }) => {
  switch (i) {
    case 0: { // Orbit：楕円の点線の上をアイコンが回る（手前は大きく、奥は小さく薄く）
      const ic = [["NISA", G], ["債券", BLUE]] as const;
      return (
        <Card><Talk />
          <svg width={CW} height={CH} style={{ position: "absolute", inset: 0 }}><ellipse cx={CW / 2} cy={560} rx={340} ry={90} fill="none" stroke="#fff" strokeWidth={4} strokeDasharray="10 12" opacity={p01(k, 0, 10)} /></svg>
          {ic.map(([t, c], j) => {
            const a = (k / 30) * 2.2 + j * Math.PI;
            const front = Math.sin(a);
            return <div key={t} style={{ position: "absolute", left: CW / 2 + Math.cos(a) * 340 - 55, top: 560 + Math.sin(a) * 90 - 55, width: 110, height: 110, borderRadius: 26, background: c, color: "#fff", ...K, fontSize: 32, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${(0.75 + 0.3 * front) * pop(k, 4 + j * 4)})`, opacity: 0.55 + 0.45 * (front + 1) / 2, boxShadow: "0 8px 18px rgba(0,0,0,0.25)" }}>{t}</div>;
          })}
        </Card>
      );
    }
    case 1: // Couch Wall：本人のまわりにカードが1枚ずつ貼られる
      return (
        <Card><Talk />
          {([[30, 40, -8, "jt_money_tree_big", 8], [520, 60, 6, "kn_coin_stack", 18], [40, 640, 5, "jt_eggs_two_baskets", 28], [540, 660, -6, "jt_parent_shield_family", 38]] as const).map(([x, y, r, img, t]) => (
            <div key={img} style={{ position: "absolute", left: x, top: y, width: 190, height: 190, background: "#fff", borderRadius: 16, padding: 8, boxShadow: "0 8px 18px rgba(0,0,0,0.2)", transform: `rotate(${r}deg) scale(${pop(k, t)})` }}><GenSlot name={img} size={174} /></div>
          ))}
        </Card>
      );
    case 2: { // UI World：チャット画面の中に本人、返事が1文字ずつ
      const msg = "児童手当は、NISAで運用しています。";
      const n = Math.floor(p01(k, 22, 52, Easing.linear) * msg.length);
      return (
        <Card bg="#F7F4EE">
          <div style={{ position: "absolute", left: 30, top: 26, ...K, fontSize: 30, color: O }}>● たいちに聞く</div>
          <div style={{ position: "absolute", left: 200, top: 90, width: 520, height: 520, borderRadius: 22, overflow: "hidden", transform: `scale(${pop(k, 2)})` }}><Talk z={0.7} oy={30} ox={-130} /></div>
          <div style={{ position: "absolute", left: 200, top: 625, width: 520, textAlign: "right", ...B, fontSize: 30 }}>児童手当、どうしてる？</div>
          {k > 20 ? <div style={{ position: "absolute", left: 40, top: 700, width: 660, ...B, fontSize: 34, color: INK }}><span style={{ color: O }}>● </span>{msg.slice(0, n)}<span style={{ opacity: k % 16 < 8 ? 1 : 0 }}>▍</span></div> : null}
          <div style={{ position: "absolute", left: 30, right: 30, bottom: 30, height: 80, borderRadius: 18, background: "#fff", border: "2px solid #E3DDD2", ...B, fontSize: 28, color: SUB, display: "flex", alignItems: "center", paddingLeft: 24 }}>メッセージを入力</div>
        </Card>
      );
    }
    case 3: { // Digital Zoom：四すみのカギ＋倍率で寄る
      const z = k < 30 ? 1 + 0.6 * p01(k, 6, 16) : 1.6 + 0.7 * p01(k, 34, 44);
      const corner = (x: number, y: number, sx: number, sy: number) => <path d={`M${x + sx * 60} ${y} L${x} ${y} L${x} ${y + sy * 60}`} stroke="#fff" strokeWidth={8} fill="none" />;
      return (
        <Card><Talk z={z} oy={-(z - 1) * 120} />
          <svg width={CW} height={CH} style={{ position: "absolute", inset: 0 }}>{corner(60, 60, 1, 1)}{corner(CW - 60, 60, -1, 1)}{corner(60, CH - 60, 1, -1)}{corner(CW - 60, CH - 60, -1, -1)}</svg>
          <div style={{ position: "absolute", right: 70, bottom: 80, ...K, fontSize: 48, color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>{z.toFixed(1)}×</div>
        </Card>
      );
    }
    case 4: // Phone Mockup：スマホの枠に入る
      return (
        <Card bg="#DCE4F5">
          <div style={{ position: "absolute", left: 160, top: 60, width: 440, height: 880, borderRadius: 60, background: "#111", padding: 14, boxSizing: "border-box", transform: `scale(${interpolate(k, [0, 10], [1.35, 1], { ...clamp, easing: OUT })})` }}>
            <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 48, overflow: "hidden", background: "#000" }}>
              <Talk z={0.62} ox={-160} oy={40} />
              <div style={{ position: "absolute", left: "50%", top: 14, width: 120, height: 32, marginLeft: -60, borderRadius: 20, background: "#000" }} />
              {["♡", "💬", "➤"].map((c, j) => <div key={c} style={{ position: "absolute", right: 22, top: 470 + j * 90, fontSize: 46, color: "#fff", transform: `scale(${pop(k, 12 + j * 4)})` }}>{c}</div>)}
              <div style={{ position: "absolute", left: 22, bottom: 40, ...K, fontSize: 26, color: "#fff", opacity: p01(k, 20, 26) }}>taichi__moneylife　フォロー</div>
            </div>
          </div>
        </Card>
      );
    case 5: { // Checklist：本人の上の黒いカードに順に✓
      const items = ["児童手当をNISAへ", "株と債券に分ける", "使う時期を決める"];
      return (
        <Card><Talk oy={180} />
          <div style={{ position: "absolute", left: 60, top: 50, width: 640, background: "rgba(25,27,33,0.94)", borderRadius: 22, padding: "22px 30px", transform: `scale(${pop(k, 2)})` }}>
            <div style={{ display: "flex", justifyContent: "space-between", ...B, fontSize: 24, color: "#9AA0AE" }}><span>やること</span><span>{Math.min(3, Math.max(0, Math.floor((k - 14) / 12) + 1))}/3</span></div>
            {items.map((t, j) => { const on = k >= 14 + j * 12; return (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 16, ...K, fontSize: 36, color: "#fff" }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", border: `4px solid ${on ? G : "#666"}`, background: on ? G : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, transform: `scale(${on ? interpolate(k - 14 - j * 12, [0, 3, 6], [0.6, 1.2, 1], clamp) : 1})` }}>{on ? "✓" : ""}</div>{t}
              </div>); })}
          </div>
        </Card>
      );
    }
    case 6: // Headline Wall：見出しの紙が1枚ずつ
      return (
        <Card><Talk oy={200} />
          <Note x={40} y={50} k={k} t={4}>児童手当<br />全額NISA</Note>
          <Note x={470} y={70} k={k} t={14} rot={4}>債券も<br />500万円</Note>
          <Note x={60} y={250} k={k} t={24} rot={3}>暴落は<br />数年前でも</Note>
          <Note x={450} y={280} k={k} t={34} rot={-5}>資産分散</Note>
        </Card>
      );
    case 7: { // Zoom Through Cut：ぐっと寄る → 暗転 → 次の場面
      const z = 1 + 1.4 * p01(k, 4, 26, Easing.in(Easing.cubic));
      const dark = p01(k, 22, 28) * (1 - p01(k, 30, 40));
      return (
        <Card>{k < 30 ? <Talk z={z} oy={-(z - 1) * 220} /> : <Talk start={400} z={1.05} />}
          <div style={{ position: "absolute", inset: 0, background: "#000", opacity: dark }} />
        </Card>
      );
    }
    case 8: { // Chart Grow：本人の前で数字が段で増え、棒が伸びる
      const v = Math.floor(Math.min(1, k / 40) ** 0.6 * 650 / 1) ;
      const shown = Math.floor(v / 5) * 5;
      return (
        <Card><Talk />
          <div style={{ position: "absolute", left: 40, top: 560, width: 680, height: 380, background: "#fff", borderRadius: 24, padding: "22px 30px", boxSizing: "border-box", boxShadow: "0 10px 30px rgba(0,0,0,0.2)", transform: `translateY(${(1 - p01(k, 0, 10)) * 200}px)` }}>
            <div style={{ ...B, fontSize: 26, color: SUB }}>年5%で運用できたら</div>
            <div style={{ ...SER, fontSize: 110, color: INK, lineHeight: 1.1 }}>{shown}<span style={{ ...K, fontSize: 44 }}>万円</span></div>
            <div style={{ position: "absolute", right: 30, bottom: 30, display: "flex", alignItems: "flex-end", gap: 12 }}>
              {[0.25, 0.35, 0.5, 0.7, 1].map((h, j) => <div key={j} style={{ width: 34, height: 180 * h * p01(k, 8 + j * 3, 16 + j * 3), background: j === 4 ? BLUE : "#BFD0F5", borderRadius: 6 }} />)}
            </div>
          </div>
        </Card>
      );
    }
    case 9: { // Pullback Reveal：引くと、編集ソフトの画面の中だった
      const p = p01(k, 10, 34, Easing.inOut(Easing.cubic));
      const s = 1 - 0.55 * p;
      return (
        <Card bg="#1E2028">
          <div style={{ position: "absolute", inset: 0, opacity: p }}>
            <div style={{ position: "absolute", left: 30, top: 24, ...K, fontSize: 28, color: "#fff" }}>動画スタジオ</div>
            <div style={{ position: "absolute", right: 30, top: 18, background: BLUE, color: "#fff", borderRadius: 10, padding: "4px 16px", ...K, fontSize: 24 }}>書き出し</div>
            {[[O, 0.1, 0.55], [YEL, 0.25, 0.45], [G, 0.05, 0.8]].map(([c, a, w], j) => <div key={j} style={{ position: "absolute", left: 60 + (a as number) * 600, top: 780 + j * 52, width: (w as number) * 600, height: 34, borderRadius: 8, background: c as string }} />)}
            <div style={{ position: "absolute", left: 360, top: 760, width: 4, height: 170, background: RED }} />
          </div>
          <div style={{ position: "absolute", left: CW / 2 - (CW * s) / 2, top: 360 * p - (CH * s) / 2 + CH / 2 * (1 - p) + (CH * s) / 2 - CH * s / 2, width: CW * s, height: CH * s, overflow: "hidden", borderRadius: 30 * p }}>
            <div style={{ position: "absolute", left: 0, top: 0, width: CW, height: CH, transform: `scale(${s})`, transformOrigin: "0 0" }}><Talk /></div>
          </div>
        </Card>
      );
    }
    case 10: { // Doodle Boil：手描きが少し揺れながら描かれる
      const boil = (j: number) => Math.floor(k / 4) % 3 === j ? 1 : 0;
      const jig = (j: number) => `translate(${(Math.floor(k / 4) * 7 + j * 3) % 5 - 2}px, ${(Math.floor(k / 4) * 5 + j) % 5 - 2}px)`;
      const draw = (t: number) => 1 - p01(k, t, t + 10);
      void boil;
      return (
        <Card><Talk />
          <svg width={CW} height={CH} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
            <path d="M300 150 L320 90 L350 135 L380 80 L410 135 L440 90 L460 150 Z" stroke={YEL} strokeWidth={9} fill="none" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={draw(4)} style={{ transform: jig(0) }} />
            <path d="M120 260 l18 40 l44 6 l-32 30 l8 44 l-38 -22 l-38 22 l8 -44 l-32 -30 l44 -6 z" stroke="#fff" strokeWidth={8} fill="none" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={draw(14)} style={{ transform: jig(1) }} />
            <path d="M620 300 c-30 -40 -90 -10 -60 40 l60 60 l60 -60 c30 -50 -30 -80 -60 -40 z" stroke="#FF7BAC" strokeWidth={8} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={draw(24)} style={{ transform: jig(2) }} />
            <path d="M590 560 q20 -25 40 0 t40 0 t40 0" stroke="#7FD3FF" strokeWidth={8} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={draw(34)} style={{ transform: jig(0) }} />
          </svg>
        </Card>
      );
    }
    case 11: { // Vertigo：奥行きの線＋引きながら寄る
      const z = 1 + 0.25 * p01(k, 0, 60, Easing.inOut(Easing.cubic));
      const g = 1.25 - 0.35 * p01(k, 0, 60, Easing.inOut(Easing.cubic));
      const ln = (x1: number, y1: number, x2: number, y2: number) => <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={BLUE} strokeWidth={4} />;
      const ix = 230 * g, iy = 290 * g;
      return (
        <Card bg="#F3F5FA"><Talk z={z} oy={-(z - 1) * 150} style={{ opacity: 0.92 }} />
          <svg width={CW} height={CH} style={{ position: "absolute", inset: 0 }}>
            <rect x={CW / 2 - ix} y={CH / 2 - iy} width={ix * 2} height={iy * 2} fill="none" stroke={BLUE} strokeWidth={4} />
            {ln(0, 0, CW / 2 - ix, CH / 2 - iy)}{ln(CW, 0, CW / 2 + ix, CH / 2 - iy)}{ln(0, CH, CW / 2 - ix, CH / 2 + iy)}{ln(CW, CH, CW / 2 + ix, CH / 2 + iy)}
          </svg>
        </Card>
      );
    }
    case 12: // Cover Story：雑誌の表紙
      return (
        <Card bg="#F2E8D5"><Talk oy={160} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 30, textAlign: "center", ...SER, fontSize: 150, color: RED, letterSpacing: 4, transform: `translateY(${(1 - p01(k, 0, 10)) * -80}px)`, opacity: p01(k, 0, 8) }}>MONEY</div>
          <div style={{ position: "absolute", right: 40, top: 30, ...B, fontSize: 22, color: INK }}>第26号　2026年11月</div>
          <div style={{ position: "absolute", left: 40, top: 560, ...SER, fontSize: 72, color: RED, lineHeight: 1, opacity: p01(k, 14, 20) }}>415<span style={{ ...K, fontSize: 30, color: INK }}>万円の<br />使い道</span></div>
          <div style={{ position: "absolute", left: 40, top: 760, background: INK, color: "#fff", padding: "6px 16px", ...K, fontSize: 26, opacity: p01(k, 22, 28) }}>2歳と0歳 わが家の実例</div>
          <div style={{ position: "absolute", right: 40, bottom: 40, width: 110, height: 70, background: "repeating-linear-gradient(90deg, #111 0 3px, transparent 3px 6px, #111 6px 8px, transparent 8px 12px)" }} />
        </Card>
      );
    case 13: // Glass Type：グラデの背景＋本人の上にすりガラスの大きな文字
      return (
        <Card><Talk /><div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, #5B6CFF, #9B5BFF 55%, #FF6FB0)", mixBlendMode: "soft-light", opacity: p01(k, 0, 10) }} /><div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, rgba(91,108,255,0.35), rgba(255,111,176,0.25))", opacity: p01(k, 0, 10) }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 70, textAlign: "center", ...K, fontSize: 190, color: "rgba(255,255,255,0.28)", WebkitTextStroke: "3px rgba(255,255,255,0.75)", backdropFilter: "blur(6px)", letterSpacing: 10, transform: `scale(${interpolate(k, [0, 12], [1.2, 1], { ...clamp, easing: OUT })})`, opacity: p01(k, 0, 10) }}>分散</div>
        </Card>
      );
  }
  return null;
};

export const EffectsPractice: React.FC = () => {
  const f = useCurrentFrame();
  const cur = Math.min(LIST.length - 1, Math.floor(f / SEG));
  const k = f - cur * SEG;
  const end = f >= LIST.length * SEG;
  return (
    <AbsoluteFill style={{ background: "#F4F4F2", backgroundImage: "linear-gradient(rgba(120,130,150,0.12) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(120,130,150,0.12) 1.5px, transparent 1.5px)", backgroundSize: "48px 48px" }}>
      {/* 固定のタイトル */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 130, textAlign: "center", ...K, fontSize: 64, color: INK, lineHeight: 1.15 }}>
        <div style={{ ...SER, fontStyle: "italic", fontSize: 50 }}>トークで使える</div>
        <div>エフェクト <span style={{ color: BLUE }}>14</span> 選</div>
      </div>
      {/* 目次（今＝青枠、終わり＝✓） */}
      <div style={{ position: "absolute", left: 150, top: 300, width: 780, display: "grid", gridTemplateColumns: "1fr 1fr", gridAutoFlow: "column", gridTemplateRows: "repeat(7, 38px)", columnGap: 40 }}>
        {LIST.map(([n], j) => {
          const done = j < cur || end, now = j === cur && !end;
          return <div key={n} style={{ ...K, fontSize: 24, color: now ? BLUE : done ? INK : "#B7BBC4", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18, color: SUB, width: 30 }}>{String(j + 1).padStart(2, "0")}</span>
            <span style={{ border: now ? `3px solid ${BLUE}` : "3px solid transparent", borderRadius: 8, padding: "0 8px", background: now ? "#E8EFFF" : undefined }}>{n}</span>
            {done ? <span style={{ color: G }}>✓</span> : null}
          </div>;
        })}
      </div>
      {!end ? (
        <Sequence from={cur * SEG} durationInFrames={SEG} layout="none">
          <E i={cur} k={k} />
          <div style={{ position: "absolute", left: 0, right: 0, top: CY + CH + 24, display: "flex", justifyContent: "center" }}>
            <span style={{ background: "#fff", borderRadius: 12, padding: "6px 20px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", ...K, fontSize: 30, color: INK }}><span style={{ color: BLUE }}>{String(cur + 1).padStart(2, "0")}</span> {LIST[cur][0]}　<span style={{ color: SUB, fontSize: 24 }}>{LIST[cur][1]}</span></span>
          </div>
        </Sequence>
      ) : (
        <div style={{ position: "absolute", left: 0, right: 0, top: 1000, textAlign: "center", ...K, fontSize: 56, color: INK, opacity: p01(f - LIST.length * SEG, 0, 10) }}>練習：14個 ✓</div>
      )}
    </AbsoluteFill>
  );
};
