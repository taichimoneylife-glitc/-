# 図解リール モーションキット（プロ感の演出・使い回し用）

> 太一さんの年収の壁リールで確立した「プロっぽく見せる」演出の保存版。
> 実装の本体は `src/KabeReel.tsx` にある（コミット済み）。新しいリールでは
> これらをコピペ流用する。将来は `src/components/zukaiMotion.tsx` に切り出して
> import 共通化してもよい。配色トークンは各リールの `C`（palette）に合わせる。

採用の指針：**音声に全部同期**（whisperで文字起こし→語の秒数×30fpsで配置）。
下キャプション帯・右いいね欄を避ける（重要要素は y≤1470、下段は中央寄せ）。

---

## 1. パルス（解説中の枠を大きく小さく反復）★太一さんお気に入り・今後ガンガン使う
今"解説している"要素（ツリーの枝など）を呼吸させて注目させる。参考動画と同じ型。
```tsx
const f = useCurrentFrame();
const pulse = 1 + (Math.sin(f / 7) * 0.5 + 0.5) * 0.07;   // 1.00〜1.07・約0.5秒周期
const glow  = 0.12 + (Math.sin(f / 7) * 0.5 + 0.5) * 0.22; // 影の濃さも脈動
// active な要素だけに適用：
style={{ transform: `scale(${pulse})`, transformOrigin: "center",
  boxShadow: `0 8px 22px ${color}${Math.round(glow*255).toString(16).padStart(2,"0")}` }}
```
強さ=0.07/速さ=/7 はお好みで（もっと大きく→0.10、ゆっくり→/10）。

## 2. 背景の奥行き（BackgroundFX）
ベタ塗り卒業。やわらかいradialグラデ＋ゆらぐぼかしブロブ3つ＋控えめドットグリッド。
`radial-gradient(...)` ＋ `filter:"blur(90px)"` のブロブを `Math.sin(f/spd)` でドリフト。
ドットは `backgroundImage: radial-gradient(dot)` ＋ `maskImage` で中央だけ出す。

## 3. 数字カウントアップ＋着地パンチ（NumCount）
```tsx
const p = interpolate(f,[delay,delay+16],[0,1],{extrapolateLeft:"clamp",extrapolateRight:"clamp"});
const v = Math.round(to*(1-Math.pow(1-p,3)));        // easeOutCubic
const punch = interpolate(f,[delay+13,delay+17,delay+23],[1,1.14,1],{clamp}); // 着地でプクッ
// <NumCount to={130} delay={..}/>万  ＋ 直後にマーカー(MarkNum)を引く
```

## 4. マーカー強調（MarkNum / Hi）★丸囲みより太一さんはコレ（いつものやつ）
数字や語の裏を、下からスッとマーカーで引く（`scaleX` を 0→1）。
```tsx
<span style={{position:"relative",...}}>{children}
  <span style={{position:"absolute",left:0,right:0,bottom:8,height:"32%",
    background:color,opacity:0.34,transform:`scaleX(${p})`,transformOrigin:"left center"}}/>
</span>
```

## 5. シーン切替（Beat）＝1枚に詰め込まない
情報量が多い所（山場など）は、ナレに合わせて**1トピック1画面でパッと切替**。
`<Beat from={localFrame} dur={..}>` が中で `opacity` フェードイン/アウト。
各Beatは画面中央にゆったり配置＝文字被りゼロ。

## 6. ページ/シーン切替の統一演出
- 横スライドイン：`enterX = interpolate(f,[0,12],[80,0])` を content に `translateX`。
- セクション抜け：ツリーを上へ `translateY(0→-660)`＋fade（例：山場→メリット）。
- 次ページは下から：`enterY = interpolate(f,[0,14],[90,0])`。
- `SlideIn` ラッパ（横から）も用意。

## 7. 山場の「ため→パッ」（Pap＋Burst）
重要数字の直前に一瞬タメて、パッと弾けさせる＋リングが広がる。
```tsx
// Pap: 小さく出て(0.8)タメ→強オーバーシュートで弾ける（spring damping:9）
// Burst: リングが scale0.25→1.5・opacity0.55→0 で消える
<Burst delay={16} color={C.red} style={{left:540, top:652}} />
<Pap delay={14}> <span>130万</span> </Pap>
```

## 8. キャラ登場モーション（GenImg dir）
方向スライドイン＋弾み（`useSp` damping:11＝低めで軽く弾む）。
`dir="left|right|up"` で入ってくる向きを指定（例：傘から出る=left／財布=right／納付書=up）。

## 9. 効果音（SfxTrack）※BGMは別途
`src/components/sfx.tsx` の `SfxTrack` に `{file, at(frame), volume}` の配列を渡す。
素材は `public/sfx/*.mp3`（効果音ラボ）＋自前合成wav。音声に同期して：
- 出現=`pop`/リスト=`tap`,`up1..`/数字=`coin`/切替=`whoosh2`,`swipe`/山場=`dadan`(ドン)/締め=`bell`
- 音量は 0.18〜0.30（ナレの下で控えめ）。`gain` で一括調整。

---

### まだ足していない“あと一段”
- **BGM**（曲が決まり次第）＝一番効く残りレバー。`<Audio volume={0.08〜0.12}>` でナレの下に敷く。
