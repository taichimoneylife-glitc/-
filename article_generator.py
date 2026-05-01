import os
import random
from anthropic import Anthropic

client = Anthropic()

# 記事トピックリスト（ローテーション）
ARTICLE_TOPICS = [
    {
        "title": "一括投資vs積立投資：あなたに合う方法はどっち？",
        "theme": "一括投資と積立投資の違い・メリット・デメリット・選び方",
        "tags": ["投資", "積立投資", "一括投資", "資産形成", "初心者"],
    },
    {
        "title": "投資初心者が最初に理解すべき5つのこと",
        "theme": "投資の基本概念（リスクとリターン、分散投資、長期投資、複利、インフレ対策）",
        "tags": ["投資初心者", "資産形成", "投資の基本", "お金の勉強"],
    },
    {
        "title": "NISAとiDeCoの違いを徹底比較！どちらを選ぶべき？",
        "theme": "NISAとiDeCoの制度の違い・税制メリット・使い分け方",
        "tags": ["NISA", "iDeCo", "節税", "投資", "資産形成"],
    },
    {
        "title": "インデックス投資とアクティブ投資、長期で勝てるのはどっち？",
        "theme": "インデックスファンドとアクティブファンドのパフォーマンス比較と選び方",
        "tags": ["インデックス投資", "投資信託", "長期投資", "資産形成"],
    },
    {
        "title": "複利の力を最大化する積立投資のはじめ方",
        "theme": "複利の仕組みと積立投資で資産を増やすための実践的な方法",
        "tags": ["複利", "積立投資", "資産形成", "投資初心者"],
    },
    {
        "title": "リスク許容度とは？自分に合った投資スタイルの見つけ方",
        "theme": "投資におけるリスク許容度の考え方と自己診断方法",
        "tags": ["リスク管理", "投資", "資産形成", "ポートフォリオ"],
    },
    {
        "title": "新NISAを使い倒す！賢い投資枠の使い方",
        "theme": "2024年新NISA制度の詳細と成長投資枠・つみたて投資枠の活用戦略",
        "tags": ["新NISA", "NISA", "節税", "投資", "資産形成"],
    },
]


def generate_article(topic: dict | None = None) -> dict:
    """Claude APIを使って金融記事を生成する。"""
    if topic is None:
        topic = random.choice(ARTICLE_TOPICS)

    prompt = f"""あなたはわかりやすい金融・投資記事を書く専門ライターです。
以下のテーマでnote向けの記事を書いてください。

テーマ: {topic["theme"]}
記事タイトル: {topic["title"]}

## 執筆条件
- 文字数: 1500〜2500文字
- 対象読者: 投資初心者〜中級者
- トーン: 親しみやすく、専門用語は丁寧に解説する
- 構成: 見出し（##）を3〜5個使って読みやすく整理する
- 具体的な数字・例を使って説明する
- 最後に「まとめ」セクションを入れる
- マークダウン形式で書く（noteのエディタで使える##, **太字**, リストなど）

記事本文のみ出力してください（タイトルは含めない）。"""

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=4096,
        messages=[{"role": "user", "content": prompt}],
    )

    content = message.content[0].text

    return {
        "title": topic["title"],
        "content": content,
        "tags": topic["tags"],
    }


def get_topic_by_index(index: int) -> dict:
    return ARTICLE_TOPICS[index % len(ARTICLE_TOPICS)]


if __name__ == "__main__":
    print("記事生成テスト中...")
    article = generate_article()
    print(f"タイトル: {article['title']}")
    print(f"タグ: {', '.join(article['tags'])}")
    print(f"文字数: {len(article['content'])}")
    print("\n--- 記事本文（冒頭500文字）---")
    print(article["content"][:500])
