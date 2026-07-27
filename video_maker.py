"""ニュース記事から要約ダイジェスト動画（MP4）を自動生成するモジュール。

外部の生成AIは使わず、Pillow でスライド画像を描画し、
imageio-ffmpeg 同梱の ffmpeg で MP4 にエンコードする。
"""

import os
import re
import subprocess
from datetime import datetime, timezone, timedelta

import numpy as np
from PIL import Image, ImageDraw, ImageFont
import imageio_ffmpeg

# ── 動画設定 ─────────────────────────────
WIDTH, HEIGHT = 1280, 720
FPS = 24
TITLE_SEC = 3.0        # タイトルスライドの表示秒数
HEADLINE_SEC = 3.8     # 見出し1件あたりの表示秒数
OUTLINE_SEC = 2.5      # 最後のまとめスライド

JST = timezone(timedelta(hours=9))

FONT_PATH = "/usr/share/fonts/truetype/fonts-japanese-gothic.ttf"

# 配色（ダーク基調 + ゴールドのアクセント。botのEmbed色に合わせる）
BG_TOP = (18, 20, 28)
BG_BOTTOM = (30, 34, 48)
ACCENT = (240, 196, 80)
TEXT_MAIN = (238, 240, 245)
TEXT_SUB = (150, 156, 170)


def _font(size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(FONT_PATH, size)


# 絵文字・記号など日本語フォントが持たない文字（□化する）を除去する
_EMOJI_RE = re.compile(
    "[\U0001F000-\U0001FAFF\U00002600-\U000027BF\U0001F1E6-\U0001F1FF←-⇿⬀-⯿️]"
)


def _clean(text: str) -> str:
    return _EMOJI_RE.sub("", text or "").strip()


def _gradient_bg() -> Image.Image:
    """上下グラデーションの背景を作る。"""
    top = np.array(BG_TOP, dtype=np.float32)
    bottom = np.array(BG_BOTTOM, dtype=np.float32)
    ratio = np.linspace(0, 1, HEIGHT, dtype=np.float32)[:, None]
    rows = (top[None, :] * (1 - ratio) + bottom[None, :] * ratio).astype(np.uint8)
    grad = np.repeat(rows[:, None, :], WIDTH, axis=1)
    return Image.fromarray(grad, "RGB")


def _wrap_by_width(draw, text, font, max_width):
    """ピクセル幅で日本語テキストを折り返す（空白に依存しない）。"""
    lines = []
    line = ""
    for ch in text:
        if ch == "\n":
            lines.append(line)
            line = ""
            continue
        test = line + ch
        if draw.textlength(test, font=font) <= max_width:
            line = test
        else:
            lines.append(line)
            line = ch
    if line:
        lines.append(line)
    return lines


def _draw_multiline(draw, lines, font, x, y, fill, line_gap=12):
    for ln in lines:
        draw.text((x, y), ln, font=font, fill=fill)
        bbox = draw.textbbox((0, 0), ln or "A", font=font)
        y += (bbox[3] - bbox[1]) + line_gap
    return y


def _title_slide(count: int) -> Image.Image:
    img = _gradient_bg()
    d = ImageDraw.Draw(img)
    # アクセントバー
    d.rectangle([80, 250, 88, 470], fill=ACCENT)
    d.text((120, 250), "FP・金融ニュース", font=_font(72), fill=TEXT_MAIN)
    d.text((122, 350), "本日のダイジェスト", font=_font(56), fill=ACCENT)
    now = datetime.now(JST).strftime("%Y/%m/%d %H:%M JST")
    d.text((122, 440), f"{now}   全{count}件", font=_font(30), fill=TEXT_SUB)
    return img


def _headline_slide(index: int, total: int, article: dict) -> Image.Image:
    img = _gradient_bg()
    d = ImageDraw.Draw(img)
    margin = 96

    # ヘッダー（番号・ソース）
    d.rectangle([margin, 90, margin + 6, 150], fill=ACCENT)
    d.text((margin + 22, 92), f"{index:02d} / {total:02d}", font=_font(34), fill=ACCENT)
    source = _clean(article.get("source", ""))
    d.text((margin + 22, 132), source, font=_font(26), fill=TEXT_SUB)

    # 見出し（大きく折り返し）
    title = _clean(article.get("title", "タイトルなし"))
    tf = _font(46)
    lines = _wrap_by_width(d, title, tf, WIDTH - margin * 2)[:4]
    _draw_multiline(d, lines, tf, margin, 210, TEXT_MAIN, line_gap=16)

    # 要約（小さめ・グレー）
    summary = _clean(article.get("summary") or "")
    if summary:
        sf = _font(26)
        slines = _wrap_by_width(d, summary, sf, WIDTH - margin * 2)[:3]
        _draw_multiline(d, slines, sf, margin, 470, TEXT_SUB, line_gap=10)

    # フッター（公開日時）
    d.text((margin, HEIGHT - 60), article.get("published", ""), font=_font(22), fill=TEXT_SUB)
    return img


def _closing_slide() -> Image.Image:
    img = _gradient_bg()
    d = ImageDraw.Draw(img)
    msg = "詳細は各リンクをチェック"
    f = _font(52)
    w = d.textlength(msg, font=f)
    d.text(((WIDTH - w) / 2, 300), msg, font=f, fill=TEXT_MAIN)
    sub = "Powered by FP News Bot"
    sf = _font(26)
    sw = d.textlength(sub, font=sf)
    d.text(((WIDTH - sw) / 2, 380), sub, font=sf, fill=TEXT_SUB)
    return img


def make_news_video(articles: list[dict], output_path: str, max_items: int = 6) -> str:
    """記事リストからダイジェスト動画を生成し、出力パスを返す。"""
    if not articles:
        raise ValueError("記事が空です")

    items = articles[:max_items]

    # (画像, 表示秒数) のシーケンスを組み立てる
    sequence = [(_title_slide(len(items)), TITLE_SEC)]
    for i, art in enumerate(items, start=1):
        sequence.append((_headline_slide(i, len(items), art), HEADLINE_SEC))
    sequence.append((_closing_slide(), OUTLINE_SEC))

    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    cmd = [
        ffmpeg, "-y",
        "-f", "rawvideo",
        "-pixel_format", "rgb24",
        "-video_size", f"{WIDTH}x{HEIGHT}",
        "-framerate", str(FPS),
        "-i", "-",
        "-c:v", "libx264",
        "-preset", "medium",
        "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
        output_path,
    ]

    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stderr=subprocess.DEVNULL)
    try:
        for img, sec in sequence:
            frame = np.asarray(img, dtype=np.uint8).tobytes()
            for _ in range(int(round(sec * FPS))):
                proc.stdin.write(frame)
    finally:
        proc.stdin.close()
        proc.wait()

    if proc.returncode != 0 or not os.path.exists(output_path):
        raise RuntimeError("ffmpeg による動画生成に失敗しました")
    return output_path


if __name__ == "__main__":
    # 単体テスト用のサンプルデータ
    sample = [
        {"source": "📰 日本経済新聞", "title": "日経平均が続伸、終値は前日比350円高の4万1200円台を回復",
         "summary": "米ハイテク株高を受けて半導体関連が買われ、幅広い銘柄に資金が流入した。",
         "published": "2026/07/27 15:00 JST"},
        {"source": "🌐 Bloomberg Japan", "title": "円相場、1ドル=148円台前半で推移 日米金利差が意識される展開",
         "summary": "米長期金利の上昇を背景に、ドル買い・円売りが優勢となっている。",
         "published": "2026/07/27 14:30 JST"},
        {"source": "💰 ダイヤモンド・オンライン", "title": "新NISA、2年目で口座数2500万突破 若年層の利用が拡大",
         "summary": "つみたて投資枠の利用が中心で、20〜30代の新規開設が全体を牽引した。",
         "published": "2026/07/27 12:00 JST"},
        {"source": "🏦 NHK", "title": "公的年金の運用益、過去最高を更新 GPIFが四半期決算を公表",
         "summary": "国内外の株式市場が堅調に推移したことが寄与した。",
         "published": "2026/07/27 11:00 JST"},
    ]
    out = make_news_video(sample, "sample_news.mp4")
    size = os.path.getsize(out) / 1024
    print(f"生成完了: {out} ({size:.0f} KB)")
