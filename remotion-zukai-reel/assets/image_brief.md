# 画像指示書（image_brief）— 「500万円の車、どう買う？」

外部の画像生成AIに**順番に1つずつ**依頼する用。各プロンプトは**共通スタイル込みの完成形**なので、そのままコピペでOK。
生成物は **透過PNG・正方形** で、指定ファイル名にして `public/gen/` に置く。
（Claudeはこの環境で画像生成不可。生成はユーザー側、Claudeは指示と合成・動画化を担当）

## ① s1_car.png（1枚目・車）
```
a cute modern compact family car, front three-quarter view, trustworthy, cute pop flat illustration, rounded soft shapes, thick clean outlines, warm friendly palette (navy, red-orange, gold, cream and green accents), minimal, single centered subject, generous padding, NO text, no letters, no numbers, transparent background, 1:1 square, high quality
```

## ② s2_wallet.png（2枚目・ローン/お金）
```
an open wallet with coins and a small bank building, loan and money concept, cute pop flat illustration, rounded soft shapes, thick clean outlines, warm friendly palette (navy, red-orange, gold, cream and green accents), minimal, single centered subject, generous padding, NO text, no letters, no numbers, transparent background, 1:1 square, high quality
```

## ③ s3_stock.png（3枚目・株）
```
a jagged volatile stock chart line going up and down, anxious risky feeling, red-orange, cute pop flat illustration, rounded soft shapes, thick clean outlines, warm friendly palette (navy, red-orange, gold, cream and green accents), minimal, single centered subject, generous padding, NO text, no letters, no numbers, transparent background, 1:1 square, high quality
```

## ④ s3_bond.png（3枚目・債券）
```
a smooth steadily rising line chart on a gentle hill, calm safe stable feeling, green, cute pop flat illustration, rounded soft shapes, thick clean outlines, warm friendly palette (navy, red-orange, gold, cream and green accents), minimal, single centered subject, generous padding, NO text, no letters, no numbers, transparent background, 1:1 square, high quality
```

## ⑤ s4_family.png（4枚目・子育て世帯）
```
a friendly young family, two parents and two small children, standing beside a red piggy bank, planning the future, cute pop flat illustration, rounded soft shapes, thick clean outlines, warm friendly palette (navy, red-orange, gold, cream and green accents), minimal, single centered subject, generous padding, NO text, no letters, no numbers, transparent background, 1:1 square, high quality
```

## ⑥ s4_usa.png（4枚目・米国債5%）
```
an American treasury bond concept, a US flag with a shining upward arrow and a gold badge, premium high-grade feeling, cute pop flat illustration, rounded soft shapes, thick clean outlines, warm friendly palette (navy, red-orange, gold, cream and green accents), minimal, single centered subject, generous padding, NO text, no letters, no numbers, transparent background, 1:1 square, high quality
```

## ⑦ s5_growth.png（5枚目・10年後の成長）
```
coins and a small money plant growing taller over time, assets increasing upward, hopeful, cute pop flat illustration, rounded soft shapes, thick clean outlines, warm friendly palette (navy, red-orange, gold, cream and green accents), minimal, single centered subject, generous padding, NO text, no letters, no numbers, transparent background, 1:1 square, high quality
```

## ⑧ s5_trophy.png（5枚目・締め「得」）
```
a shiny gold trophy with a star, celebration and winning feeling, cute pop flat illustration, rounded soft shapes, thick clean outlines, warm friendly palette (navy, red-orange, gold, cream and green accents), minimal, single centered subject, generous padding, NO text, no letters, no numbers, transparent background, 1:1 square, high quality
```

## メモ
- アイコン（🎓教育／🐖老後／⭐特別費）や数字・グラフ・矢印・比較・テロップは**図解側（Claude）**で出すので画像不要。
- 生成後は `public/gen/<name>.png` に置く → `GenImg name="<name>"` で差し込み。
