"""
アメリカン・エキスプレス®・ゴールド・プリファード・カード
決済目標達成トラッカー

入会キャンペーン条件（例: 入会後3ヶ月以内に指定額を利用）の
進捗管理と達成に向けたアドバイスを提供する。
"""

import json
import os
from datetime import datetime, timezone, timedelta
from pathlib import Path

JST = timezone(timedelta(hours=9))
DATA_FILE = Path(__file__).parent / "amex_gold_data.json"

# カードのデフォルト設定（入会キャンペーン標準値）
DEFAULT_GOAL_YEN = 500_000   # 50万円
DEFAULT_DAYS = 90            # 3ヶ月


def _load() -> dict:
    if DATA_FILE.exists():
        try:
            return json.loads(DATA_FILE.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            pass
    return {}


def _save(data: dict) -> None:
    DATA_FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


# ---------------------------------------------------------------------------
# 公開 API
# ---------------------------------------------------------------------------

def set_goal(guild_id: int, user_id: int, goal_yen: int, days: int) -> dict:
    """目標金額・期限を設定または更新する。既存の支払い実績は維持する。"""
    data = _load()
    key = f"{guild_id}:{user_id}"
    existing = data.get(key, {})

    start_date = datetime.now(JST).isoformat()
    deadline = (datetime.now(JST) + timedelta(days=days)).isoformat()

    data[key] = {
        "goal_yen": goal_yen,
        "spent_yen": existing.get("spent_yen", 0),
        "start_date": start_date,
        "deadline": deadline,
        "payments": existing.get("payments", []),
    }
    _save(data)
    return data[key]


def add_payment(guild_id: int, user_id: int, amount: int, memo: str = "") -> dict | None:
    """支払い額を追加する。目標未設定の場合は None を返す。"""
    data = _load()
    key = f"{guild_id}:{user_id}"
    if key not in data:
        return None

    entry = data[key]
    entry["spent_yen"] += amount
    entry["payments"].append({
        "amount": amount,
        "memo": memo,
        "date": datetime.now(JST).isoformat(),
    })
    _save(data)
    return entry


def get_status(guild_id: int, user_id: int) -> dict | None:
    """進捗情報を返す。目標未設定の場合は None を返す。"""
    data = _load()
    key = f"{guild_id}:{user_id}"
    if key not in data:
        return None

    entry = data[key]
    goal = entry["goal_yen"]
    spent = entry["spent_yen"]
    remaining = max(0, goal - spent)
    deadline_dt = datetime.fromisoformat(entry["deadline"])
    now = datetime.now(JST)
    days_left = max(0, (deadline_dt - now).days)

    # 達成率
    pct = min(100.0, spent / goal * 100) if goal > 0 else 100.0

    # 1日あたりの必要額（残り日数が0なら未達成のまま）
    daily_needed = (remaining / days_left) if days_left > 0 else (remaining if remaining > 0 else 0)

    # 週あたりの必要額
    weekly_needed = daily_needed * 7

    return {
        "goal_yen": goal,
        "spent_yen": spent,
        "remaining_yen": remaining,
        "pct": pct,
        "days_left": days_left,
        "daily_needed": daily_needed,
        "weekly_needed": weekly_needed,
        "deadline": deadline_dt,
        "achieved": spent >= goal,
        "payments": entry["payments"],
    }


def reset_goal(guild_id: int, user_id: int) -> bool:
    """目標と実績をすべてリセットする。存在しない場合は False を返す。"""
    data = _load()
    key = f"{guild_id}:{user_id}"
    if key not in data:
        return False
    del data[key]
    _save(data)
    return True


def suggest_spending(remaining_yen: int, days_left: int) -> list[str]:
    """残り金額・日数から具体的な使い道のヒントを返す。"""
    hints = []

    daily = remaining_yen / days_left if days_left > 0 else remaining_yen

    if daily >= 10_000:
        hints.append("🏨 ホテル・旅行の予約をアメックスで支払う（大きく消化できます）")
    if daily >= 5_000:
        hints.append("🍽️ 外食・接待をアメックスにまとめる")
    if daily >= 3_000:
        hints.append("🛒 スーパー・コンビニの日用品もアメックスで支払う")
    if daily >= 1_000:
        hints.append("⛽ ガソリン・公共交通費をアメックスにまとめる")
    hints.append("💡 電気・ガス・水道などの公共料金の引き落とし口座をアメックスに変更する")
    hints.append("📱 サブスクリプション（動画・音楽・クラウド等）の支払いをアメックスに集約する")
    hints.append("🏥 医療費・歯科治療がある場合はアメックスで決済する")

    return hints
