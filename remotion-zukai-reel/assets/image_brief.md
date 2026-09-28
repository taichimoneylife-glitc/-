# 画像指示書（image_brief）— 「500万円の車、どう買う？」

別のAI（Codex等の画像生成）で作る用。**この共通スタイルを毎回プロンプト末尾に付ける**と画風が揃います。
生成したら **透過PNG** で書き出し、ファイル名を指定どおりにして `public/gen/` に入れてください。
（僕＝Claudeはこの環境で画像生成できないため、生成はあなた側。僕は指示と合成・動画化を担当します）

## 共通スタイル（毎回末尾に付ける）
```
cute pop flat illustration, rounded soft shapes, thick clean outlines,
warm friendly palette (navy, red-orange, gold, cream/green accents),
minimal and modern, single centered subject, generous empty padding,
NO text, no letters, no numbers, transparent background, 1:1 square, high quality
```

## 必要な画像（8枚。★=必須 / ☆=あると良い）

| ファイル名 | 使う場所 | 主題プロンプト（＋共通スタイル） |
|---|---|---|
| ★ `s1_car.png` | 1枚目 導入 | a cute modern compact family car, front three-quarter view, trustworthy |
| ★ `s2_wallet.png` | 2枚目 ローン/利息 | an open wallet with coins and a small bank building, loan & money concept |
| ★ `s3_stock.png` | 3枚目 株 | a jagged, volatile stock chart line going up and down, anxious risky feeling, red-orange |
| ★ `s3_bond.png` | 3枚目 債券 | a smooth, steadily rising line chart on a gentle hill, calm safe stable feeling, green |
| ★ `s4_family.png` | 4枚目 子育て世帯 | a friendly young family, two parents and two small children, beside a red piggy bank, planning the future |
| ★ `s4_usa.png` | 4枚目 米国債5% | an American treasury bond concept: US flag with a shining upward arrow and a gold badge, premium high-grade feeling |
| ☆ `s5_growth.png` | 5枚目 10年後 | coins and a money plant growing taller over time, assets increasing upward, hopeful |
| ☆ `s5_trophy.png` | 5枚目 締め「得」 | a shiny gold trophy with a star, celebration and winning feeling |

## メモ
- アイコン（教育資金🎓／老後資金🐖／特別費⭐）は**画像不要**。図解側のアイコンで出します。
- 数字・グラフ・カード・矢印・比較・テロップは全部**図解側（Claude）で制御**します。画像は「主役イラスト」だけでOK。
- サイズは正方形（1024×1024など）。人物は全身か上半身、余白多めだと配置しやすいです。
