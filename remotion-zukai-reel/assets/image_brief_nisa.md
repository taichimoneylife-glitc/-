# 画像指示書：NISA 亡くなったらリール（太一が一括生成 → public/gen/ に配置）

前提：夫（30〜40代男性）が亡くなり、妻（30〜40代女性）が引き継ぐ。解説役にかわいいマスコット（スーツの鳥など）を共通で使う。
図解・数字・矢印・グラフ・テロップは図解側（Claude）で出す。画像は「各場面の主役イラスト」だけ。

---

## 【コピーして一括生成】

共通スタイル：
フラットでポップなミニイラスト、太めの輪郭、やわらかい彩度、透過PNG、正方形、
被写体中央・余白多め、文字は入れない、色は自然でOK（色の強制なし）。
人物は親しみやすい日本の子育て世帯。マスコットは全ページ同じキャラで統一。

1. nisa_husband_passed → 亡くなった夫（やさしい追悼・重すぎない, gentle）
2. nisa_wife_worry → 不安そうな妻（anxious）
3. nisa_phone_bank → 妻が金融機関へ電話連絡（phone call）
4. nisa_family_talk → 家族で相続を話し合う（discussing）
5. nisa_documents → 書類の束・ファイル（paperwork）
6. nisa_hanko → 印鑑と朱肉（印鑑証明, neat）
7. nisa_bank_counter → 銀行の窓口で手続き（bank teller）
8. nisa_bank_building → 銀行の建物（trustworthy）
9. nisa_open_account → 新しい口座開設の申込（ペンと用紙, fresh start）
10. nisa_passbook → 口座の通帳（neutral）※NISA/課税の別はテロップで
11. nisa_wife_stand → 妻・上半身（calm）※名義表現用
12. nisa_mascot_worry → マスコット・困り顔（anxious）※損グラフ用
13. nisa_mascot_happy → マスコット・うれしい顔（hopeful）※益グラフ用
14. nisa_coin_down → お金・株が減るイメージ（down）
15. nisa_coin_up → お金・株が増えるイメージ（up）
16. nisa_tell_family → 妻が家族に伝える（informative）
17. nisa_couple → 夫婦が並ぶ（warm）
18. nisa_think → 持つか売るか考える人（pondering）

メモ：透過PNG・正方形・文字なし。NISA口座／課税口座の区別、矢印、✕、金額、グラフは図解側で出すので画像は不要。

---

## ページ別の使いどころ（Claude用・差し込み計画）
- フック：1 husband_passed＋2 wife_worry（“もし夫が亡くなったら”を自分ごと化）
- 流れ①連絡：3 phone_bank ／ ②誰に何を：4 family_talk ／ ③書類：5 documents（＋6 hanko）／ ④手続き：7 bank_counter
- 注意点①（NISA→課税口座）：1 husband_passed（左＝故人名義）／11 wife_stand（右＝相続人名義）／10 passbook
- 注意点②（同じ金融機関）：8 bank_building ／ 9 open_account
- 注意点③ 損グラフ：12 mascot_worry ／ 14 coin_down
- 注意点③ 益グラフ：13 mascot_happy ／ 15 coin_up
- まとめ：16 tell_family ／ 17 couple ／ 18 think
- 締めトーク：実写（太一本人）＝画像不要

※各ページは「画像枠」と「テロップ枠」を分けて組み直す（テロップ被り防止）。
