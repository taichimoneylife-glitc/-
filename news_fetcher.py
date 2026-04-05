import feedparser
import asyncio
from datetime import datetime, timezone

# 金融ニュースRSSフィード一覧（日本語）
RSS_FEEDS = [
    {
        "name": "Bloomberg Japan",
        "url": "https://feeds.bloomberg.com/japan/news.rss",
    },
    {
        "name": "日本経済新聞",
        "url": "https://www.nikkei.com/rss/list/all_article.rdf",
    },
    {
        "name": "ロイター 日本語",
        "url": "https://jp.reuters.com/rssFeed/businessNews",
    },
    {
        "name": "NHK 経済",
        "url": "https://www.nhk.or.jp/rss/news/cat5.xml",
    },
    {
        "name": "Yahoo!ファイナンス",
        "url": "https://news.yahoo.co.jp/rss/topics/business.xml",
    },
]

# 既に送信済みの記事URLを保持するセット（重複防止）
_sent_urls: set[str] = set()


def fetch_news(count: int = 5) -> list[dict]:
    """RSSフィードから最新の金融ニュースを取得する。"""
    articles = []

    for feed_info in RSS_FEEDS:
        try:
            feed = feedparser.parse(feed_info["url"])
            for entry in feed.entries[:count]:
                url = entry.get("link", "")
                if url in _sent_urls:
                    continue

                published = entry.get("published_parsed") or entry.get("updated_parsed")
                if published:
                    pub_dt = datetime(*published[:6], tzinfo=timezone.utc)
                    pub_str = pub_dt.strftime("%Y/%m/%d %H:%M UTC")
                else:
                    pub_str = "日時不明"

                articles.append(
                    {
                        "source": feed_info["name"],
                        "title": entry.get("title", "タイトルなし"),
                        "url": url,
                        "summary": _truncate(entry.get("summary", ""), 200),
                        "published": pub_str,
                    }
                )
        except Exception as e:
            print(f"[news_fetcher] {feed_info['name']} の取得に失敗: {e}")

    # 公開日時でソートして最新順に並べる
    articles.sort(key=lambda a: a["published"], reverse=True)
    new_articles = articles[:count]

    for article in new_articles:
        _sent_urls.add(article["url"])

    return new_articles


def _truncate(text: str, max_len: int) -> str:
    """テキストを指定文字数で切り詰める。"""
    text = text.strip()
    if len(text) > max_len:
        return text[:max_len] + "…"
    return text
