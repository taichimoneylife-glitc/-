# 画像指示書｜年収の壁リール（ポップ大量生産版）

- 外部の画像生成AI（太一さんが使用）向け。図解・数字・矢印・壁リスト・チェックは図解側(Claude)で出すので、画像は「各場面の主役イラスト」に絞る。
- テイスト＝ポップで可愛い・親しみやすい（かたくない）。壁・パート主婦・社会保険のメリット類を中心に。
- 生成後は `public/gen/<ファイル名>` に置く → `GenImg name="<ファイル名(拡張子なし)>"` で図解に差し込む。
- 枚数上限なし＝あるだけポップになる。足りなければ同じ主題の別バリエーションも歓迎。

---

## ▼ まとめてコピペ用（これを丸ごと画像AIに貼る）

【共通スタイル（全画像に適用）】
フラットでポップな手描き風ミニイラスト、太めの輪郭線、丸くて可愛いゆるいタッチ、やわらかい彩度、親しみやすく明るい雰囲気、透過PNG、正方形、被写体は中央・余白多め、文字や数字・ロゴは入れない、色は自然でOK（色の強制なし）。日本の生活感（パート主婦・家庭）に合う雰囲気。

【画像一覧（番号. ファイル名 → 主題（名詞句＋トーン））】

■ 冒頭フック（主婦のリアクション）
1. kabe_hook_happy.png → ガッツポーズで喜ぶパート主婦、嬉しそう（hopeful）
2. kabe_hook_wait.png → 手のひらを前に出して「待って」のポーズの主婦、驚き（surprised）
3. kabe_hook_confused.png → たくさんの壁や数字に囲まれて困り顔の主婦（overwhelmed）

■ 全体像：壁は4つ（ポップな壁＋主婦）
4. kabe_wall_plain.png → ポップで可愛いレンガの壁（単体）、ゆるい（simple）
5. kabe_wall_tax.png → レンガの壁に電卓とコインのモチーフ（税金の壁）、ゆるい
6. kabe_wall_resident.png → レンガの壁に家とコインのモチーフ（住民税の壁）、ゆるい
7. kabe_wall_income.png → レンガの壁に給与明細と小銭のモチーフ（所得税の壁）、ゆるい
8. kabe_wall_fuyo.png → レンガの壁に夫婦（ハート）のモチーフ（扶養の壁）、ゆるい
9. kabe_wall_shaho.png → レンガの壁に盾や保険証のモチーフ（社会保険の壁）、ゆるい
10. kabe_housewife_walls.png → 大小の壁を見上げて考えるパート主婦（curious）
11. kabe_housewife_point.png → 指を1本立てて「ここが大事」と示す主婦（confident）

■ ①税金の壁（怖くない）
12. kabe_tax_light.png → コインが少しだけ減る様子・軽い負担（relieved）
13. kabe_tax_calc.png → 電卓を持ってにっこりの主婦、安心（calm）
14. kabe_resident_tax.png → 家＋コインで住民税のイメージ（neutral）

■ ②扶養の壁（怖くない）＝夫の税金
15. kabe_husband_salaryman.png → スーツの会社員の夫、人の好い笑顔（friendly）
16. kabe_couple.png → 会社員の夫とパートの妻の夫婦、仲良し（warm）
17. kabe_husband_tax_same.png → 夫の給料袋が変わらず安定（stable）

■ ③社会保険の壁（山場）
18. kabe_shaho_card.png → 可愛い健康保険証のイラスト（trust）
19. kabe_clock_20h.png → 時計と働く主婦、週20時間のイメージ（busy）
20. kabe_company_building.png → ポップな会社のビル（neutral）
21. kabe_leave_fuyo.png → 夫の傘（扶養）からそっと出ていく妻のイメージ（uneasy）
22. kabe_pay_self.png → 自分で保険料を財布から払う主婦、ちょっと痛い（concerned）
23. kabe_nenkin_kokuho_paper.png → 国民年金・国民健康保険の納付書のイメージ（paperwork）
24. kabe_takehome_down.png → 手取り（お財布）が少ししぼむ様子（worried）

■ ④社会保険のメリット（4つ）
25. kabe_merit_pension_up.png → 貯金箱や年金手帳が育って増える、笑顔の高齢女性（hopeful）
26. kabe_merit_pension_old.png → 安心して暮らす老後の夫婦（secure）
27. kabe_merit_sick.png → ベッドで休む人の枕元にお金・傷病手当金（cared-for）
28. kabe_merit_birth.png → 妊婦さん／赤ちゃんとお金、出産手当金（gentle）
29. kabe_merit_family_guard.png → 大きな手や傘が家族を守る、障害・遺族の保障（protective）
30. kabe_merit_umbrella.png → 家族を覆う大きな安心の傘（reassuring）

■ ⑤まとめ／⑥やること／締め
31. kabe_housewife_got_it.png → 「なるほど！」と納得して手を打つ主婦（satisfied）
32. kabe_check_company.png → スマホや書類で勤務先の条件を確認する主婦（checking）
33. kabe_decide_work.png → カレンダーや電卓で働き方を計画する主婦（planning）
34. kabe_family_money_guard.png → 世帯の手取り（お金）と保障（盾）を両手に持つ主婦（balanced）
35. kabe_consult_phone.png → スマホで相談する／吹き出しで相談のイメージ（friendly）
36. kabe_housewife_smile_forward.png → 前向きに笑顔で歩き出す主婦（positive）

【メモ】透過PNG・正方形・文字なし。壁は色やモチーフで種類を区別（文字は図解側で付ける）。同じ主婦キャラの見た目をできるだけ揃えると統一感◎。足りない場面があれば同主題の別ポーズも歓迎。

---

## ▼ 使い所（図解への割り当て・Claude用メモ）
- フック：1→2（喜ぶ→待って）、3は「よく分からん」で。
- 全体像：4〜9の壁を並べて「4つ（＋住民税）」、10/11で主婦。
- 図解①税金：12〜14（軽い負担・安心）。
- 図解②扶養：15〜17（夫・夫婦・夫の税金変わらず）。
- 図解③社保(山場)：18〜24（保険証/時計/会社→扶養を出る→自分で払う→手取り減）。
- 図解④メリット：25〜30を4つのメリットに1枚ずつ＋α。
- 図解⑤⑥締め：31〜36（納得→確認→計画→手取りと保障→相談→前向き）。
