# NISA→債券リール｜画像指示書（新規6枚＋使い回し）2026-11-03

> 絵柄は暴落対策・マイルと同じ（やわらかい立体感のイラスト）。保存先 `public/gen/<名前>.png`。
> グラフ・数字・金利・矢印・文字は動画側で描く。画像は「動かせる部品」として1枚ずつ作る。

```
【共通スタイル】
やわらかい立体感のあるフラットイラスト（軽いグラデーションと陰影）、
輪郭線は細めか無し、明るく親しみやすい色合い、
透過PNG、正方形、被写体は中央で余白多め、文字・数字・ロゴ・国旗・企業名は入れない。
※人物は小物を持たせず表情とポーズだけ。小物は人物なしの単体で描く。
※1枚ずつ別の画像として出す（1枚に複数を並べない）。

【新規】
1. bond_box        → 「債券」を表す青い箱。側面に、まっすぐ右肩上がりのなだらかな線の模様（ギザギザなし）
                     ※すでにある赤い「株の箱」（側面にギザギザの上向き矢印）と対になるように、同じ形・同じ角度で
2. bond_safe       → 青っぽい小さな金庫（扉は閉まっている）※「金利が確定したお金をしまっておく」役
3. kid_toddler     → 2歳くらいの子ども、全身、にこにこ笑顔（性別がわかりにくい服装）
4. kid_student     → 18歳くらいの学生、上半身、明るい笑顔（大学入学のイメージ・性別がわかりにくい服装）
5. coin_pile_big   → 金色のコインが高く積み上がった山（将来のお金が大きく育ったイメージ）
6. wave_line_tag   → 「期間限定」をイメージした、赤い札（タグ）に時計マークが付いたもの（文字は入れない）
```

## 使い回し（新しく作らなくてOK）
- 株の箱 `bouraku_stock_box`、株の暴落グラフ `p9_stock_crash`、嵐 `bouraku_storm`
- 債券の証書 `bouraku_bond` / `p9_bond`、カギ `bouraku_lock`、砂時計 `bouraku_hourglass`
- シーソー `bouraku_seesaw`、重り `bouraku_weight`、ゴールの道 `bouraku_road_goal`、双眼鏡 `bouraku_binoculars`
- 大学（角帽と本）`infure_grad`、ランドセル `ic_schoolbag`、老後の夫婦 `ic_elderly_couple`、家族 `mile_family_happy`
- 予定に丸のカレンダー `bouraku_calendar_event`、コインが育つグラフ `kabe_coins_grow`、豚の貯金箱 `bouraku_piggy_full`
- 太一：冒頭・締めは口だけ動く `taichi_talk_*`／図解中は `taichi_point_*`・`taichi_think_chin`・`taichi_ok_hand` など
