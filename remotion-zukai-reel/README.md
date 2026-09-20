# 図解リール スターター（Claude Code × Remotion）

添付いただいた「お金が貯まらない4つの罠」系の**縦型フラット図解リール**を、
コードから MP4 に書き出せる [Remotion](https://www.remotion.dev/) プロジェクトとして再現したスターターです。

- 解像度：**1080×1920（9:16 / リール・Shorts・TikTok）**
- フレームレート：**30fps**
- 構成：**イントロ → 罠①〜④ → まとめ(CTA)**
- 配色：元動画を解析した **3色＋グレー**（`src/theme.ts`）
  - 背景 `#F4EFF2` / 線 `#1B2A4A` / 差し色 `#E5432B`

> ※ 生成AIやコードで「図解っぽさ」を出す最大のコツは **色数を絞る** ことと **要素をアニメで順番に登場させる** ことです。

---

## 必要なもの

- **Node.js 18 以上**（npm 同梱）
- ffmpeg は **Remotion に同梱**されるので別途インストール不要

## セットアップ & 実行

```bash
cd remotion-zukai-reel
npm install

# ① プレビュー（ブラウザでタイムライン編集）
npm run dev        # = remotion studio

# ② MP4 に書き出し（out/reel.mp4 が生成される）
npm run render     # = remotion render MoneyReel out/reel.mp4
```

初回の `render` 時に、Remotion がヘッドレス Chromium を自動ダウンロードします。

### バリエーション（アスペクト比・実写版）

用途別に4つの Composition を用意しています。`remotion render <ID> <出力先>` で個別に書き出せます。

| Composition ID | サイズ | 用途 |
| --- | --- | --- |
| `MoneyReel` | 1080×1920（9:16） | リール / Shorts / TikTok（メイン） |
| `MoneyReel-Footage` | 1080×1920（9:16） | 冒頭を実写クリップ＋テロップにした版 |
| `MoneyReel-Square` | 1080×1080（1:1） | フィード投稿向け（まとめは自動で2列） |
| `MoneyReel-Wide` | 1920×1080（16:9） | YouTube など横型 |

```bash
npx remotion render MoneyReel-Footage out/reel_footage.mp4
npx remotion render MoneyReel-Square  out/reel_square.mp4
npx remotion render MoneyReel-Wide    out/reel_wide.mp4
```

> **実写版について**：`public/intro.mp4` は動作確認用の**サンプル素材**です。手元の実写クリップ（手元・お札・店内など）に差し替えるだけで、そのまま `MoneyReel-Footage` に反映されます（テロップは `src/scenes/IntroFootage.tsx`）。

---

## Claude Code で編集する

このプロジェクトを開いた状態で Claude Code に日本語で指示するだけで改変できます。例：

- 「罠を4つ→**5つ**に増やして。⑤は『**サブスクの入りっぱなし**』で、アイコンはカレンダー」
- 「配色を**青系**に変えて」（`src/theme.ts` を編集）
- 「各シーンを**5秒→7秒**に伸ばして」（`src/config.ts` の `DURATIONS`）
- 「冒頭に実写クリップを入れたい」→ `public/intro.mp4` を置いて `Intro.tsx` の `OffthreadVideo` を有効化
- 「**BGMとナレーション字幕**を付けて」

### さらに Remotion 公式スキルを入れると精度が上がる

Claude Code に Remotion 特有の作法（タイミング・メディア・字幕）を教える**公式 Agent Skills**があります。
このフォルダで次のどちらかを実行してから指示すると、より的確なコードを書いてくれます。

```bash
# スキルだけ入れる（.agents/skills に入る）
npx remotion skills add

# または Claude Code プラグインとして入れる
claude plugin marketplace add remotion-dev/claude-code-plugin
claude plugin install remotion@remotion
```

---

## ファイル構成

```
remotion-zukai-reel/
├─ src/
│  ├─ index.ts            … エントリ（registerRoot）
│  ├─ Root.tsx            … Composition 登録（サイズ/尺/fps）
│  ├─ config.ts           … 尺・シーン構成・解像度の設定
│  ├─ theme.ts            … 配色（ここを触れば全体の色が変わる）
│  ├─ MoneyReel.tsx       … 本編。Intro→罠①〜④→Outro を時系列に並べる
│  ├─ components/
│  │  ├─ Anim.tsx         … 登場アニメ（FadeUp / Pop）
│  │  ├─ Layout.tsx       … 背景・見出し・吹き出し・キャプション等の共通パーツ
│  │  ├─ icons.tsx        … 線画アイコン（スマホ/値札/カート/顔/コイン）
│  │  └─ font.ts          … Noto Sans JP 読み込み
│  └─ scenes/
│     ├─ Intro.tsx        … つかみ（イラスト版）
│     ├─ IntroFootage.tsx … つかみ（実写クリップ＋テロップ版）
│     ├─ TrapScene.tsx    … 「罠」共通レイアウト
│     └─ Outro.tsx        … まとめ + CTA（縦=1列 / 正方形・横=2列に自動切替）
├─ public/                … 実写クリップ・画像などの素材置き場（intro.mp4 はサンプル）
├─ remotion.config.ts     … レンダリング設定（h264/MP4）
└─ package.json
```

---

## よくある調整ポイント

| やりたいこと | 触るファイル |
| --- | --- |
| 色を変える | `src/theme.ts` |
| 各シーンの長さ・本数 | `src/config.ts` + `src/MoneyReel.tsx` の `TRAPS` |
| 文言・キャプション | `src/MoneyReel.tsx` の `TRAPS`、`scenes/*.tsx` |
| アイコンの絵柄 | `src/components/icons.tsx` |
| 登場アニメの動き | `src/components/Anim.tsx` |
| アスペクト比・バリエーション追加 | `src/Root.tsx`（Composition を追加） |
| 冒頭の実写クリップ | `public/intro.mp4` を差し替え＋`src/scenes/IntroFootage.tsx` |
