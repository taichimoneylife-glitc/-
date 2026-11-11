# 参考動画の一覧（番号つき・保存版）

届いた順に番号をつける。新しい参考動画は ④、⑤… と足していく。

| 番号 | 届いた日 | 中身 | 分析 | 部品・再現 |
|---|---|---|---|---|
| 参考① | 2026-10 | マーケ博士（図解リール） | .claude/skills/zukai-reel/references/ref-motion-marke.md | src/MarkeRepro.tsx |
| 参考② | 2026-11 | マーケ博士 最新（1枚の地図で進む） | .claude/skills/zukai-reel/references/ref-motion-marke2.md | src/Marke2Repro.tsx・src/components/board.tsx・src/components/zukaiKit.tsx |
| 参考③ | 2026-11-03 | Claude Codeのセキュリティ対策5つ → **最後の「コメントで受け取る」CTA** | .claude/skills/zukai-reel/references/ref-03-claude-security-cta.md | src/Ref03Repro.tsx（丸ごと再現）・src/components/ctaComment.tsx（見本 CommentCtaDemo） |
| 参考④ | 2026-11-03 | マーケ博士「Claudeの4つのモデル」（101秒）→ **最後のプロフィールURLをタップさせる締め** | .claude/skills/zukai-reel/references/ref-04-marke-claude-models.md | src/components/tapCard.tsx（寄せすぎないよう太一のノート版に作り変えてNISA→債券の締めで使用：テープの紙・赤ペンの丸・手描き矢印・付箋）／丸ごと再現は次の段階 |
| 参考⑤ | 2026-11-04 | 「AI編集20個、20秒で見せます」（41秒）＝**編集の演出20個**＋右上の「この動画の演出」チェックリスト | .claude/skills/zukai-reel/references/ref-05-claude-edit20.md | 見本＝src/CompareDemo.tsx。**AさんBさん投稿はこの型をまねる**（流れの表と空欄テンプレ＝メモの11章） |
| 参考⑥ | 2026-11-04 | 「伝わるスライド図鑑」＝動くスライド777件の見本サイト（セミナー用）。**図解の動きの引き出し** | .claude/skills/zukai-reel/references/ref-06-slide-zukan.md | 丸ごと保存：assets/ref_slides/slidezukan/（gitignore・index.htmlを開けば動く） |
| 参考⑦ | 2026-11-10 | 海外（フランス）「買う vs 借りる、10年後どっちが得？」（2分53秒）＝同じ条件の2人で比べる型、前提→買う→借りる→10年後→3シナリオ→思い込み崩し→まとめ | .claude/skills/zukai-reel/references/ref-07-acheter-vs-louer.md | 見本＝src/CompareDemo.tsx。**AさんBさん投稿はこの型をまねる**（流れの表と空欄テンプレ＝メモの11章） |
| 参考⑧ | 2026-11-11 | 海外トークリール「棒人間アニメで稼ぐYouTube」（54秒）＝本人＋テロップ自動＋図解。画面の型5つ（本人だけ／上下2分割／カード型／空の背景のフロー図／全画面の図解）を2〜4秒ごとに切り替え | .claude/skills/zukai-reel/references/ref-08-talk-split-sky.md | 先輩用キット（talk-reel-kit）の segments に部品化 |
| 参考⑨ | 2026-11-11 | マーケ博士・最新「AIっぽい画像から抜け出す方法」（66秒）＝ほぼ白の方眼・上に黒い章札だけ・大きな主役1つ＋線と点でつながる札・輪・放射線・灰色に沈める | .claude/skills/zukai-reel/references/ref-09-marke-latest.md | 住宅ローン① v3 で使用（marke.tsx の後半） |
