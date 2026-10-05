# がん② 図解パート ビート表（音声同期・fps30／`gan2-narration.m4a` 86.82s）

> 音声＝図解パートVOのみ（冒頭/締めは実写・別録り）。frame=round(sec*30)。GAN2_FRAMES≈2610。
> VOは8ブロック＝ページは**9枚**に落ち着く（2本柱の掘り下げはP4“役割対比”の中でアニメ分割）。c_review は P9 見直しで使用。

| P | 内容 | 秒 | フレーム |
|---|---|---|---|
| P1 | 三大治療（★三角形） | 0.00–6.98 | 0–209 |
| P2 | お金のリスク4つ（★縦スタック順次） | 6.98–17.26 | 209–518 |
|   | └ ブリッジ「どう備える？」 | 15.18 | 455 |
| P3 | 備え方＝2本柱（全体像） | 17.26–22.54 | 518–676 |
| P4 | なぜ2つ＝役割対比（★山場） | 22.54–36.14 | 676–1084 |
|   | └ 一時金＝まとまった余裕 | 22.54–28.28 | 676–848 |
|   | └ 月額＝長期の支え | 28.28–34.56 | 848–1037 |
|   | └ だから両方（c_combine） | 34.56 | 1037 |
| P5 | 公的保険の外（特約・300万） | 36.14–44.96 | 1084–1349 |
|   | └ ブリッジ「ここから落とし穴」 | 43.92 | 1318 |
| P6 | 落とし穴①一時金の条件 | 44.96–57.28 | 1349–1718 |
| P7 | 落とし穴②月額のカバー範囲 | 57.28–69.22 | 1718–2077 |
|   | └ 「だからこそ、いくら出るかだけで選ぶのは危険」 | 65.42 | 1963 |
| P8 | まとめ＝入院→通院／チェック列挙 | 69.22–78.60 | 2077–2358 |
| P9 | 見直し（体験＋確認を）※c_review | 78.60–86.82 | 2358–2605 |

## 画像割り当て（確定）
- P1：t_surgery / t_radiation / t_drug（三角形）＋g3_commute_hospital
- P2：ic_hospital・ic_pill_iv／c_cost_bed・c_cost_wig・c_cost_meal／c_life_loan・g6_savings_empty／g6_income_worry ＋ c_balance_break（締め）
- P3：c_lumpsum_gift・c_monthly（2本柱）
- P4：c_lumpsum_gift（一時金）→ c_monthly（月額）→ c_combine（だから両方）＋g5_coverage_gap
- P5：c_advanced・g5_free_drug・g4_money_fly・ic_shield・ic_insurance_card
- P6：g2_relax_insurance→g1_hook_shock・ic_warning・c_lumpsum_gift
- P7：t_anticancer・t_hormone・t_radiation・ic_outpatient・ic_relapse（○×の揃いアイコン）＋ic_warning
- P8：（入院→通院の時代変化）g3_commute_hospital
- P9：c_review（証券を見直す）＋c_consult・g2_recovered_smile

## ASR補正メモ（図内文言は台本の正表記を使う）
三大地上→三大治療／地上費→治療費／先進異形→先進医療／自重診療→自由診療／得役→特約／おとしやな→落とし穴／上費内側→上皮内（がん）／高額在→抗がん剤。
