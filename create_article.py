"""
note超優良記事 生成・投稿ツール

使い方:
  python create_article.py                        # 対話モード
  python create_article.py --theme "積立投資の始め方"
  python create_article.py --theme "積立投資" --words 3000 --audience 初心者 --angle "失敗談を交えて"
  python create_article.py --theme "積立投資" --publish   # 生成後すぐ公開投稿
  python create_article.py --theme "積立投資" --draft     # 生成後に下書き保存（デフォルト）
  python create_article.py --theme "積立投資" --no-post   # 投稿せずファイル保存のみ
"""

import argparse
import os
import sys
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv
from article_generator import generate_custom_article

load_dotenv()

JST = timezone(timedelta(hours=9))

VALID_AUDIENCES = ["初心者", "中級者", "上級者"]


def prompt_input(label: str, default: str = "") -> str:
    default_hint = f"（デフォルト: {default}）" if default else ""
    val = input(f"{label}{default_hint}: ").strip()
    return val if val else default


def interactive_mode() -> dict:
    """対話形式で記事仕様を入力する。"""
    print("\n━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print("  note 超優良記事ジェネレーター")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━\n")

    theme = ""
    while not theme:
        theme = input("📝 テーマ（例: 一括投資と積立投資の比較）: ").strip()
        if not theme:
            print("  ※ テーマは必須です")

    words_raw = prompt_input("📏 文字数", "3000")
    try:
        words = int(words_raw)
    except ValueError:
        words = 3000

    print(f"👥 対象読者を選んでください: {' / '.join(VALID_AUDIENCES)}")
    audience = prompt_input("   入力", "初心者")
    if audience not in VALID_AUDIENCES:
        print(f"  ※ '{audience}' は無効です。「初心者」を使用します")
        audience = "初心者"

    angle = prompt_input("🎯 切り口・角度（省略可、例: データで比較 / 失敗談を交えて）", "")

    print("\n投稿方法を選んでください:")
    print("  1. noteに下書き保存（デフォルト）")
    print("  2. noteに公開投稿")
    print("  3. ファイル保存のみ（noteには投稿しない）")
    post_choice = prompt_input("   番号を入力", "1")

    if post_choice == "2":
        post_mode = "publish"
    elif post_choice == "3":
        post_mode = "no-post"
    else:
        post_mode = "draft"

    return {
        "theme": theme,
        "words": words,
        "audience": audience,
        "angle": angle,
        "post_mode": post_mode,
    }


def save_to_file(article: dict) -> str:
    """記事をマークダウンファイルとして保存する。"""
    os.makedirs("articles", exist_ok=True)
    now = datetime.now(JST).strftime("%Y%m%d_%H%M%S")
    safe_title = article["title"][:30].replace("/", "・").replace(" ", "_")
    filename = f"articles/{now}_{safe_title}.md"

    with open(filename, "w", encoding="utf-8") as f:
        f.write(f"# {article['title']}\n\n")
        f.write(f"タグ: {', '.join(article['tags'])}\n\n")
        f.write("---\n\n")
        f.write(article["content"])

    return filename


def run(theme: str, words: int, audience: str, angle: str, post_mode: str):
    print(f"\n🔄 記事を生成中... （{words}文字 / {audience}向け）")
    print(f"   テーマ: {theme}")
    if angle:
        print(f"   切り口: {angle}")
    print()

    article = generate_custom_article(
        theme=theme,
        word_count=words,
        audience=audience,
        angle=angle,
    )

    char_count = len(article["content"])
    print(f"✅ 生成完了！")
    print(f"   タイトル : {article['title']}")
    print(f"   文字数   : {char_count}文字")
    print(f"   タグ     : {', '.join(article['tags'])}")

    # ファイル保存（常に実行）
    saved_path = save_to_file(article)
    print(f"   保存先   : {saved_path}")

    if post_mode == "no-post":
        print("\n📁 noteへの投稿はスキップしました（ファイル保存のみ）")
        return

    # note投稿
    from note_publisher import publish_to_note

    publish = post_mode == "publish"
    mode_label = "公開投稿" if publish else "下書き保存"
    print(f"\n🚀 noteに{mode_label}中...")

    success = publish_to_note(
        title=article["title"],
        content=article["content"],
        tags=article["tags"],
        publish=publish,
    )

    if success:
        print(f"🎉 noteへの{mode_label}が完了しました！")
    else:
        print("❌ noteへの投稿に失敗しました。note_error.png を確認してください。")
        print(f"   記事はファイルに保存されています: {saved_path}")


def main():
    parser = argparse.ArgumentParser(description="note超優良記事ジェネレーター")
    parser.add_argument("--theme", type=str, help="記事テーマ")
    parser.add_argument("--words", type=int, default=3000, help="目標文字数（デフォルト3000）")
    parser.add_argument("--audience", type=str, default="初心者", choices=VALID_AUDIENCES, help="対象読者")
    parser.add_argument("--angle", type=str, default="", help="切り口・角度")
    parser.add_argument("--publish", action="store_true", help="生成後すぐ公開投稿")
    parser.add_argument("--draft", action="store_true", help="生成後に下書き保存（デフォルト）")
    parser.add_argument("--no-post", dest="no_post", action="store_true", help="投稿せずファイル保存のみ")
    args = parser.parse_args()

    if args.theme:
        # 引数モード
        if args.no_post:
            post_mode = "no-post"
        elif args.publish:
            post_mode = "publish"
        else:
            post_mode = "draft"

        run(
            theme=args.theme,
            words=args.words,
            audience=args.audience,
            angle=args.angle,
            post_mode=post_mode,
        )
    else:
        # 対話モード
        params = interactive_mode()
        run(**params)


if __name__ == "__main__":
    main()
