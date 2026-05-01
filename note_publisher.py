import os
import time
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout

NOTE_EMAIL = os.environ.get("NOTE_EMAIL", "")
NOTE_PASSWORD = os.environ.get("NOTE_PASSWORD", "")
NOTE_URL = "https://note.com"


def _type_markdown_to_editor(page, content: str):
    """noteのブロックエディタにマークダウン形式のテキストを入力する。"""
    editor = page.locator('[data-testid="editor-content"], .o-editor__body, .ProseMirror').first
    editor.click()

    for line in content.split("\n"):
        if line.startswith("## "):
            # 見出し2
            page.keyboard.type(line[3:])
            page.keyboard.press("Enter")
        elif line.startswith("### "):
            # 見出し3
            page.keyboard.type(line[4:])
            page.keyboard.press("Enter")
        elif line.strip() == "":
            page.keyboard.press("Enter")
        else:
            page.keyboard.type(line)
            page.keyboard.press("Enter")
        time.sleep(0.02)


def publish_to_note(title: str, content: str, tags: list[str], publish: bool = False) -> bool:
    """
    noteに記事を投稿する。

    Args:
        title: 記事タイトル
        content: 記事本文（マークダウン形式）
        tags: タグのリスト
        publish: True=公開投稿, False=下書き保存

    Returns:
        成功したかどうか
    """
    if not NOTE_EMAIL or not NOTE_PASSWORD:
        raise ValueError("NOTE_EMAIL と NOTE_PASSWORD を環境変数に設定してください")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1280, "height": 900},
            locale="ja-JP",
        )
        page = context.new_page()

        try:
            # ログイン
            print("[note] ログイン中...")
            page.goto(f"{NOTE_URL}/login", wait_until="networkidle")
            page.fill('input[name="email"]', NOTE_EMAIL)
            page.fill('input[name="password"]', NOTE_PASSWORD)
            page.click('button[type="submit"]')
            page.wait_for_url(f"{NOTE_URL}/**", timeout=15000)
            print("[note] ログイン成功")

            # 新規記事作成ページへ
            page.goto(f"{NOTE_URL}/notes/new", wait_until="networkidle")
            time.sleep(2)

            # タイトル入力
            print("[note] タイトル入力中...")
            title_input = page.locator(
                '[placeholder="記事タイトル"], [data-testid="editor-title"], textarea.p-post__title'
            ).first
            title_input.click()
            title_input.fill(title)
            time.sleep(0.5)

            # 本文入力
            print("[note] 本文入力中...")
            _type_markdown_to_editor(page, content)
            time.sleep(1)

            # タグ入力
            if tags:
                print(f"[note] タグ設定中: {tags}")
                tag_button = page.locator(
                    'button:has-text("タグを追加"), [aria-label="タグ追加"], .p-hashtag-input'
                ).first
                if tag_button.is_visible():
                    tag_button.click()
                    time.sleep(0.5)
                    for tag in tags[:5]:  # noteは最大5タグ
                        tag_input = page.locator('input[placeholder*="タグ"], .p-hashtag-input input').first
                        tag_input.fill(tag)
                        page.keyboard.press("Enter")
                        time.sleep(0.3)

            if publish:
                # 公開投稿
                print("[note] 公開処理中...")
                publish_button = page.locator(
                    'button:has-text("公開設定"), button:has-text("投稿する")'
                ).first
                publish_button.click()
                time.sleep(1)

                # 公開確認ダイアログ
                confirm = page.locator('button:has-text("公開する"), button:has-text("投稿")')
                if confirm.is_visible(timeout=3000):
                    confirm.click()
                    time.sleep(2)
                print("[note] 公開完了")
            else:
                # 下書き保存
                print("[note] 下書き保存中...")
                draft_button = page.locator(
                    'button:has-text("下書き保存"), button:has-text("保存")'
                ).first
                draft_button.click()
                time.sleep(2)
                print("[note] 下書き保存完了")

            return True

        except PlaywrightTimeout as e:
            print(f"[note] タイムアウトエラー: {e}")
            page.screenshot(path="note_error.png")
            return False
        except Exception as e:
            print(f"[note] エラー: {e}")
            page.screenshot(path="note_error.png")
            return False
        finally:
            browser.close()


if __name__ == "__main__":
    from article_generator import generate_article

    print("noteへのテスト投稿（下書き保存）を実行します...")
    article = generate_article()
    print(f"記事タイトル: {article['title']}")

    success = publish_to_note(
        title=article["title"],
        content=article["content"],
        tags=article["tags"],
        publish=False,  # テストは下書き保存
    )
    print(f"結果: {'成功' if success else '失敗'}")
