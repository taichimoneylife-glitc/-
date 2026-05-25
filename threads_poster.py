"""
Threads 自動投稿スクリプト（スレッド形式 2〜3枚構成）

Claude API でバズ投稿セットを生成し、Threads API でスレッド（返信チェーン）として投稿する。

必要な環境変数:
  ANTHROPIC_API_KEY    : Anthropic API キー
  THREADS_ACCESS_TOKEN : Threads の長期アクセストークン
  THREADS_USER_ID      : Threads ユーザー ID（数字）

オプション:
  POST_COUNT           : 生成するセット数（デフォルト 10）
  POST_DELAY_SECONDS   : セット間の待機秒数（デフォルト 60）
  PANEL_COUNT          : 1セットのパネル数 2 or 3（デフォルト 3）
  DRY_RUN              : "true" にすると投稿せず出力のみ
"""

import os
import json
import asyncio
import aiohttp
import anthropic
from dotenv import load_dotenv

load_dotenv()

ANTHROPIC_API_KEY    = os.environ["ANTHROPIC_API_KEY"]
THREADS_ACCESS_TOKEN = os.environ["THREADS_ACCESS_TOKEN"]
THREADS_USER_ID      = os.environ["THREADS_USER_ID"]
POST_COUNT           = int(os.getenv("POST_COUNT", "10"))
POST_DELAY_SECONDS   = int(os.getenv("POST_DELAY_SECONDS", "60"))
PANEL_COUNT          = int(os.getenv("PANEL_COUNT", "3"))
DRY_RUN              = os.getenv("DRY_RUN", "false").lower() == "true"

THREADS_API_BASE = "https://graph.threads.net/v1.0"

# ──────────────────────────────────────────────
# プロンプト設計
# ──────────────────────────────────────────────
SYSTEM_PROMPT = f"""\
あなたはSNSコンテンツのプロデューサーです。
Threadsで日本のフォロワーを増やすための「スレッド形式投稿セット」を作ります。

## ターゲット
・20〜40代の会社員・主婦層
・お金の不安はあるが、何から始めればいいか分からない人

## 投稿のゴール（重要）
1. バズる（シェア・いいねされる）
2. 「相談したい」と思わせてDMやコメントに繋げる
3. フォローしたくなるアカウントに見せる

## 構成ルール（{PANEL_COUNT}枚スレッド）
- 1枚目（フック）: スクロールを止める一言＋共感できる悩みや意外な事実。短く、強く。
- 2枚目（本編）: タメになる具体的な情報・ステップ・比較。読んで「なるほど」と思わせる。
- {'3枚目（締め・CTA）: まとめ＋「こんなお悩みありますか？」「気になる方はフォロー」など行動を促す一言。' if PANEL_COUNT == 3 else ''}

## テーマ（ローテーションして使う）
節約・貯金・家計管理・ポイ活・ふるさと納税・NISA・iDeCo・
お金の習慣・節税・家計簿・固定費削減・給与交渉・フリーランスの稼ぎ方・
老後のお金・保険の見直し・クレカ活用・先取り貯金

## 禁止事項（アカウント安全のため厳守）
- 「投資」「副業」「稼げる」「儲かる」「確実」「必ず」などの断定・誇大表現は使わない
- 具体的な商品・サービスへの誘導はしない
- 「〇〇万円プレゼント」などの詐欺的表現は使わない

## 文体・書式
- 1枚あたり 100〜300文字（長すぎない）
- 改行・絵文字を使い視覚的に読みやすく
- ハッシュタグは最終パネルのみに 2〜3個付ける
- 語尾は親しみやすく（ですます調 or 話し言葉）

## 出力フォーマット（純粋なJSONのみ、説明文不要）
[
  {{
    "panels": ["1枚目のテキスト", "2枚目のテキスト"{', "3枚目のテキスト"' if PANEL_COUNT == 3 else ''}]
  }},
  ...
]
"""


def generate_post_sets(count: int) -> list[list[str]]:
    """Claude API で投稿セットを生成する。"""
    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

    print(f"[Claude] {count}セット × {PANEL_COUNT}枚の投稿を生成中...")

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=8192,
        system=SYSTEM_PROMPT,
        messages=[
            {
                "role": "user",
                "content": (
                    f"テーマをバラバラにして、{count}セットの{PANEL_COUNT}枚構成スレッド投稿を生成してください。"
                    f"各セットは別のテーマで、読者層が「保存したい・フォローしたい」と思える内容にしてください。"
                ),
            }
        ],
    )

    raw = message.content[0].text.strip()

    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()

    data: list[dict] = json.loads(raw)
    return [item["panels"] for item in data]


# ──────────────────────────────────────────────
# Threads API
# ──────────────────────────────────────────────
async def create_container(
    session: aiohttp.ClientSession,
    text: str,
    reply_to_id: str | None = None,
) -> str:
    """テキストコンテナを作成し creation_id を返す。"""
    url = f"{THREADS_API_BASE}/{THREADS_USER_ID}/threads"
    params: dict = {
        "media_type": "TEXT",
        "text": text,
        "access_token": THREADS_ACCESS_TOKEN,
    }
    if reply_to_id:
        params["reply_to_id"] = reply_to_id
    async with session.post(url, params=params) as resp:
        data = await resp.json()
        if "id" not in data:
            raise RuntimeError(f"コンテナ作成失敗: {data}")
        return data["id"]


async def publish_container(session: aiohttp.ClientSession, creation_id: str) -> str:
    """コンテナを公開し投稿 ID を返す。"""
    url = f"{THREADS_API_BASE}/{THREADS_USER_ID}/threads_publish"
    params = {
        "creation_id": creation_id,
        "access_token": THREADS_ACCESS_TOKEN,
    }
    async with session.post(url, params=params) as resp:
        data = await resp.json()
        if "id" not in data:
            raise RuntimeError(f"公開失敗: {data}")
        return data["id"]


async def post_thread(session: aiohttp.ClientSession, panels: list[str], set_index: int):
    """パネルリストをスレッド（返信チェーン）として投稿する。"""
    parent_id: str | None = None

    for i, text in enumerate(panels):
        label = f"  [{set_index}] パネル {i+1}/{len(panels)}"
        print(f"{label}")
        print(f"  {'─'*48}")
        for line in text.splitlines():
            print(f"  {line}")
        print(f"  {'─'*48}")

        if DRY_RUN:
            parent_id = f"dry_run_id_{set_index}_{i}"
            print(f"  → DRY_RUN: スキップ\n")
            continue

        creation_id = await create_container(session, text, reply_to_id=parent_id)
        await asyncio.sleep(3)  # Threads 推奨の待機
        post_id = await publish_container(session, creation_id)
        print(f"  → 投稿完了 (ID: {post_id})\n")
        parent_id = post_id

        if i < len(panels) - 1:
            await asyncio.sleep(5)  # パネル間の待機


async def run_all(post_sets: list[list[str]]):
    """全セットを順番に投稿する。"""
    async with aiohttp.ClientSession() as session:
        for i, panels in enumerate(post_sets, 1):
            print(f"\n{'═'*52}")
            print(f"  セット {i}/{len(post_sets)}")
            print(f"{'═'*52}")
            await post_thread(session, panels, i)

            if i < len(post_sets):
                print(f"  → 次のセットまで {POST_DELAY_SECONDS}秒待機...\n")
                await asyncio.sleep(POST_DELAY_SECONDS)


# ──────────────────────────────────────────────
# エントリポイント
# ──────────────────────────────────────────────
async def main():
    print("=" * 54)
    print("  Threads バズ投稿 自動生成・投稿ツール")
    print(f"  セット数: {POST_COUNT} | {PANEL_COUNT}枚構成 | 間隔: {POST_DELAY_SECONDS}秒")
    print(f"  DRY_RUN: {DRY_RUN}")
    print("=" * 54)

    post_sets = generate_post_sets(POST_COUNT)
    print(f"[Claude] {len(post_sets)}セット生成完了\n")

    await run_all(post_sets)

    print("\n✅ 全投稿完了")


if __name__ == "__main__":
    asyncio.run(main())
