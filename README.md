# Discord 金融ニュースボット

定期的に金融ニュースをDiscordチャンネルへ自動配信するボットです。

## 機能

- **自動配信**: 1日2回（4:45 / 11:55 JST）に最新ニュースを投稿
- **ダイジェスト動画**: 取得した見出しから要約MP4を自動生成して添付
- **スラッシュコマンド**: `/news [count]` でいつでもニュースを取得
- **複数ソース**: 日経・Bloomberg・ロイター・ダイヤモンドなど10フィード
- **重複排除**: 一度送信した記事は再送しない

## ダイジェスト動画について

配信ごとに、見出し・要約を並べた 1280x720 のダイジェスト動画（MP4）を自動生成し、
先頭のメッセージに添付します。外部の生成AIは使わず、Pillow でスライドを描画し
`imageio-ffmpeg` 同梱の ffmpeg でエンコードするため、追加のAPIキーや課金は不要です。

- `VIDEO_ENABLED=false` で動画添付を無効化できます（テキストのみ配信）。
- 動画生成に失敗した場合も、テキスト配信はそのまま実行されます。
- 生成物のプレビュー: `python video_maker.py` を実行すると `sample_news.mp4` が作られます。

## セットアップ

### 1. Discord Botの作成

1. [Discord Developer Portal](https://discord.com/developers/applications) を開く
2. 「New Application」→ 「Bot」タブ → 「Reset Token」でトークン取得
3. 「OAuth2」→ 「URL Generator」で `bot` + `applications.commands` スコープを選択
4. Bot Permissions: `Send Messages`, `Embed Links` を選択
5. 生成されたURLでサーバーにボットを追加

### 2. 環境設定

```bash
cp .env.example .env
```

`.env` を編集して以下を設定：

| 変数名 | 説明 |
|--------|------|
| `DISCORD_TOKEN` | Botトークン |
| `NEWS_CHANNEL_ID` | 投稿先チャンネルID |
| `NEWS_INTERVAL_MINUTES` | 配信間隔（分）|
| `NEWS_COUNT` | 1回に取得する件数 |

チャンネルIDはDiscordで「開発者モード」をオンにして、チャンネルを右クリック→「IDをコピー」で取得できます。

### 3. インストール・起動

```bash
pip install -r requirements.txt
python bot.py
```

## スラッシュコマンド

| コマンド | 説明 |
|----------|------|
| `/news` | 最新ニュース5件を取得 |
| `/news count:10` | 最新ニュース10件を取得 |
