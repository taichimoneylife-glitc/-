"""
note記事自動投稿スケジューラー

使い方:
  python article_scheduler.py            # スケジューラー起動（毎日定時に自動投稿）
  python article_scheduler.py --now      # 今すぐ1記事を下書き保存
  python article_scheduler.py --publish  # 今すぐ1記事を公開投稿
"""

import os
import sys
import asyncio
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv
from article_generator import generate_article, get_topic_by_index, ARTICLE_TOPICS
from note_publisher import publish_to_note

load_dotenv()

JST = timezone(timedelta(hours=9))

# 投稿時刻（日本時間）
POST_HOUR = int(os.getenv("NOTE_POST_HOUR", "10"))
POST_MINUTE = int(os.getenv("NOTE_POST_MINUTE", "0"))

# 公開投稿するか下書き保存か
AUTO_PUBLISH = os.getenv("NOTE_AUTO_PUBLISH", "false").lower() == "true"

_article_index = 0  # トピックのローテーション管理


def seconds_until_next_post() -> float:
    now = datetime.now(JST)
    target = now.replace(hour=POST_HOUR, minute=POST_MINUTE, second=0, microsecond=0)
    if now >= target:
        target += timedelta(days=1)
    return (target - now).total_seconds()


def run_once(publish: bool = False):
    """1記事を生成してnoteに投稿する。"""
    global _article_index

    topic = get_topic_by_index(_article_index)
    _article_index += 1

    now_jst = datetime.now(JST).strftime("%Y/%m/%d %H:%M")
    mode = "公開投稿" if publish else "下書き保存"
    print(f"[Scheduler] {now_jst} JST — 記事生成開始（{mode}）")
    print(f"[Scheduler] トピック: {topic['title']}")

    article = generate_article(topic)
    print(f"[Scheduler] 生成完了（{len(article['content'])}文字）")

    success = publish_to_note(
        title=article["title"],
        content=article["content"],
        tags=article["tags"],
        publish=publish,
    )

    status = "成功" if success else "失敗"
    print(f"[Scheduler] note投稿 {status}: {article['title']}")
    return success


async def scheduler_loop():
    """毎日定時に記事を自動投稿するループ。"""
    print(f"[Scheduler] 起動完了")
    print(f"[Scheduler] 投稿時刻: 毎日 {POST_HOUR:02d}:{POST_MINUTE:02d} JST")
    print(f"[Scheduler] 投稿モード: {'公開投稿' if AUTO_PUBLISH else '下書き保存'}")
    print(f"[Scheduler] トピック数: {len(ARTICLE_TOPICS)}記事（ローテーション）")

    while True:
        wait_sec = seconds_until_next_post()
        next_dt = datetime.now(JST) + timedelta(seconds=wait_sec)
        print(f"[Scheduler] 次の投稿: {next_dt.strftime('%Y/%m/%d %H:%M JST')} （{wait_sec/3600:.1f}時間後）")

        await asyncio.sleep(wait_sec)
        run_once(publish=AUTO_PUBLISH)
        await asyncio.sleep(60)  # 二重実行防止


if __name__ == "__main__":
    args = sys.argv[1:]

    if "--now" in args:
        print("今すぐ記事を生成して下書き保存します...")
        run_once(publish=False)
    elif "--publish" in args:
        print("今すぐ記事を生成して公開投稿します...")
        run_once(publish=True)
    else:
        asyncio.run(scheduler_loop())
