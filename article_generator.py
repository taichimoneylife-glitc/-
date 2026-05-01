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


# 対象読者ごとの執筆指示
_AUDIENCE_GUIDE = {
    "初心者": "投資をこれから始める人。専門用語は必ず噛み砕いて説明し、難しい概念は身近なたとえ話で置き換える。「なぜやるのか」の動機づけを大切にする。",
    "中級者": "投資経験1〜3年程度。基本用語の説明は省き、具体的な数字・比較・戦略の深掘りに重点を置く。",
    "上級者": "投資経験豊富な読者。データ・研究・税務・制度の細かい点まで踏み込み、実践的な応用情報を提供する。",
}


def generate_custom_article(
    theme: str,
    word_count: int = 3000,
    audience: str = "初心者",
    angle: str = "",
) -> dict:
    """
    指示ベースで超優良記事を生成する。

    Args:
        theme: 記事のテーマ（例：「一括投資と積立投資の比較」）
        word_count: 目標文字数（デフォルト3000）
        audience: 対象読者「初心者」「中級者」「上級者」
        angle: 切り口・角度（例：「税金視点で」「失敗談を交えて」）

    Returns:
        title, content, tags を含む辞書
    """
    audience_desc = _AUDIENCE_GUIDE.get(audience, _AUDIENCE_GUIDE["初心者"])
    angle_instruction = f"切り口・角度: {angle}" if angle else ""

    prompt = f"""あなたは金融・投資領域で10年以上の執筆経験を持つトップライターです。
noteで月間10万PVを獲得するような、読者に本当に価値を届ける超優良記事を書いてください。

## 記事仕様
- テーマ: {theme}
- 目標文字数: {word_count}文字前後（±10%OK）
- 対象読者: {audience}（{audience_desc}）
{angle_instruction}

## 品質基準（必ず守ること）
1. **導入で心をつかむ**: 読者が「これは自分のことだ」と感じる悩み・状況から書き始める
2. **具体的な数字を使う**: 「増える」ではなく「年利5%で30年後に約4.3倍」のように必ず数値化する
3. **比較・対比を活用**: 選択肢がある場合は表や箇条書きで視覚的に整理する
4. **実例・シナリオ**: 架空でも良いので「Aさん（28歳、手取り25万円）の場合」など読者が自分を投影できる具体例を入れる
5. **よくある誤解を潰す**: 読者が陥りがちな勘違いを1〜2個取り上げ、正しい理解を示す
6. **行動につながるまとめ**: 「今日からできる3つのこと」など読んだ後に何をすべきか明確にする
7. **読みやすさ**: 1段落は4〜5行以内。難しい漢字・専門用語には括弧でルビ・補足を入れる

## 構成
- 見出し（##）を5〜7個使う
- 各セクションは300〜500文字を目安
- 最後は「まとめ」または「今日からできること」で締める

## 出力形式
- マークダウン形式（##見出し、**太字**、箇条書き、数字リスト）
- 記事本文のみ出力（タイトルは含めない）
- 末尾にタグ候補を5つ「タグ: tag1,tag2,tag3,tag4,tag5」の形式で1行追記する"""

    # 長文生成のためmax_tokensを増やす
    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=8192,
        messages=[{"role": "user", "content": prompt}],
    )

    raw = message.content[0].text

    # タグ行を分離
    tags: list[str] = []
    content_lines = []
    for line in raw.strip().splitlines():
        if line.startswith("タグ:"):
            tags = [t.strip() for t in line.replace("タグ:", "").split(",") if t.strip()]
        else:
            content_lines.append(line)
    content = "\n".join(content_lines).strip()

    # タグが取得できなかった場合のフォールバック
    if not tags:
        tags = [theme[:10], audience, "資産形成", "投資", "お金の勉強"]

    # タイトルをClaudeに生成させる（別リクエスト）
    title_resp = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=128,
        messages=[
            {
                "role": "user",
                "content": f"以下の記事本文に最適なnote用タイトルを1行で考えてください。クリックされやすく、内容を的確に表すタイトルにしてください。タイトルのみ出力。\n\n{content[:500]}",
            }
        ],
    )
    title = title_resp.content[0].text.strip().strip("「」『』")

    return {
        "title": title,
        "content": content,
        "tags": tags[:5],
    }


if __name__ == "__main__":
    print("記事生成テスト中...")
    article = generate_article()
    print(f"タイトル: {article['title']}")
    print(f"タグ: {', '.join(article['tags'])}")
    print(f"文字数: {len(article['content'])}")
    print("\n--- 記事本文（冒頭500文字）---")
    print(article["content"][:500])
