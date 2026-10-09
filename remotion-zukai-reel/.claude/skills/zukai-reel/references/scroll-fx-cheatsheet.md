# スクロール演出チートシート24（AIに伝える名前・2026-10-09 インプット）

> 太一さん提供。Web/スクロール系（LP・スクロールテリング・カルーセル/縦動画の演出発想）に使う
> 「動きの番号 → AIに伝える正式名（英名）」の対応表。発注時はこの英名で指示すると精度が上がる。
> ★名前に「実装手段」を添えるとさらに精度UP：**CSSだけで / GSAP ScrollTriggerで / Framer Motionで**。

出典（Threads・動画3本）：
- 動画1 https://www.threads.com/share/BCKnVDRI-V/
- 動画2 https://www.threads.com/share/BAw2GzJfjS/
- 動画3 https://www.threads.com/share/_o8Os15S4/

---

## 動画1：出てくる動き（01–08）
| # | 和名 | AIに伝える名前 | どんな動き |
|---|---|---|---|
| 01 | フェードイン | Scroll-triggered fade-in | 画面に入ったらふわっと表示 |
| 02 | スライドイン | Slide-in | 横からすべり込む |
| 03 | スタッガー | Stagger animation | 時間差で順番に表示 |
| 04 | テキストリビール | Text reveal (Split text) | 文字が1字ずつせり上がる |
| 05 | マスクリビール | Clip-path reveal | 幕が開くように画像が出る |
| 06 | ブラーイン | Blur-in reveal | ぼかしからくっきり表示 |
| 07 | タイプライター | Typewriter effect | 1文字ずつ打ち込まれる |
| 08 | カウントアップ | Count-up animation | 数字が0から増えていく |

## 動画2：スクロールに連動する動き（09–16）
| # | 和名 | AIに伝える名前 | どんな動き |
|---|---|---|---|
| 09 | スクロール連動 | Scroll-linked animation | スクロール量に合わせて進む（読了バー） |
| 10 | パララックス | Parallax scrolling | 背景と手前が違う速さで動く |
| 11 | スクロールズーム | Scale on scroll | 画像が拡大して全画面に |
| 12 | 画像シーケンス | Scroll-scrubbed image sequence | 連番画像をコマ送り再生 |
| 13 | SVGラインドロー | SVG line drawing | 線が描かれていく |
| 14 | テキストフィル | Text fill on scroll | 読み進めるほど文字色が塗られる |
| 15 | 背景色トランジション | Background color transition | 背景色がなめらかに変わる |
| 16 | マーキー | Marquee (scroll velocity) | 流れ続け、スクロールで加速 |

## 動画3：固定・送り・ナビ（17–24）
| # | 和名 | AIに伝える名前 | どんな動き |
|---|---|---|---|
| 17 | スティッキー | position: sticky | 見出しが上に貼り付く |
| 18 | ピン留め＋スクラブ | Pin + scrub (GSAP ScrollTrigger) | 画面を固定して中身だけ進む |
| 19 | スクロールテリング | Scrollytelling | 文章に合わせて固定図が切り替わる |
| 20 | カードスタック | Stacking cards | カードが重なっていく |
| 21 | スクロールスナップ | CSS scroll snap | 1画面ずつピタッと止まる |
| 22 | 横スクロール | Horizontal scroll | 縦スクロールで横に流れる |
| 23 | 隠れるヘッダー | Hide-on-scroll header | 下で隠れ、戻すと出る |
| 24 | スクロールスパイ | Scrollspy | 目次が現在地をハイライト |

---

### 図解リール（Remotion）への転用メモ
- Web専用（スクロール依存）は 09/10/14/17/21/22/23/24。動画では時間 driven に読み替える（スクロール量→フレーム）。
- 動画でそのまま効くのは：01 フェードイン / 02 スライドイン / 03 スタッガー（順次ピッ）/ 04 テキストリビール / 06 ブラーイン / 07 タイプライター / 08 カウントアップ / 11 ズーム / 13 SVGラインドロー（連結ツリーの線引き）/ 20 カードスタック。
- 既存の motion-kit と重複する語は統一して使う。
