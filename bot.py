import os
import asyncio
from datetime import datetime, timezone, timedelta
import discord
from discord import app_commands
from dotenv import load_dotenv
from news_fetcher import fetch_news
import amex_gold_tracker as amex

load_dotenv()

DISCORD_TOKEN = os.environ["DISCORD_TOKEN"]
NEWS_CHANNEL_ID = int(os.environ["NEWS_CHANNEL_ID"])
NEWS_COUNT = int(os.getenv("NEWS_COUNT", "10"))

JST = timezone(timedelta(hours=9))

# 1日2回の配信時刻（日本時間）
DELIVER_TIMES = [
    (4, 45),   # AM 4:45
    (11, 55),  # AM 11:55
]


def seconds_until_next_delivery() -> tuple[float, tuple[int, int]]:
    """次の配信までの秒数と配信時刻を返す。"""
    now = datetime.now(JST)
    candidates = []
    for hour, minute in DELIVER_TIMES:
        target = now.replace(hour=hour, minute=minute, second=0, microsecond=0)
        if now >= target:
            target += timedelta(days=1)
        candidates.append((target, (hour, minute)))
    candidates.sort(key=lambda x: x[0])
    next_target, next_time = candidates[0]
    return (next_target - now).total_seconds(), next_time


class FinanceBot(discord.Client):
    def __init__(self):
        intents = discord.Intents.default()
        super().__init__(intents=intents)
        self.tree = app_commands.CommandTree(self)

    async def setup_hook(self):
        await self.tree.sync()
        asyncio.create_task(self.scheduler())

    async def on_ready(self):
        print(f"[Bot] ログイン完了: {self.user} (ID: {self.user.id})")
        print(f"[Bot] 毎日の配信スケジュール:")
        for hour, minute in DELIVER_TIMES:
            print(f"[Bot]   → {hour:02d}:{minute:02d} JST（10件）")

    async def scheduler(self):
        await self.wait_until_ready()
        while not self.is_closed():
            wait_sec, next_time = seconds_until_next_delivery()
            next_dt = datetime.now(JST) + timedelta(seconds=wait_sec)
            print(f"[Bot] 次の配信: {next_dt.strftime('%H:%M JST')} （{wait_sec/3600:.1f}時間後）")
            await asyncio.sleep(wait_sec)
            channel = self.get_channel(NEWS_CHANNEL_ID)
            if channel is None:
                print(f"[Bot] チャンネル {NEWS_CHANNEL_ID} が見つかりません")
            else:
                await post_news(channel, NEWS_COUNT)
            await asyncio.sleep(60)  # 同じ時刻に二重起動しないよう1分待機


client = FinanceBot()


def build_embed(article: dict) -> discord.Embed:
    embed = discord.Embed(
        title=article["title"],
        url=article["url"],
        description=article["summary"] or None,
        color=discord.Color.gold(),
    )
    embed.set_footer(text=f"{article['source']} | {article['published']}")
    return embed


async def post_news(channel: discord.abc.Messageable, count: int):
    loop = asyncio.get_event_loop()
    articles = await loop.run_in_executor(None, fetch_news, count)

    if not articles:
        await channel.send("現在取得できる新着ニュースはありません。")
        return

    now_jst = datetime.now(JST).strftime("%Y/%m/%d %H:%M")
    await channel.send(f"📰 **FPニュース配信 {now_jst} JST（{len(articles)}件）**")
    for article in articles:
        await channel.send(embed=build_embed(article))


@client.tree.command(name="news", description="最新のFP・金融ニュースを取得します")
@app_commands.describe(count="取得件数（1〜10、デフォルト10）")
async def news_command(interaction: discord.Interaction, count: int = 10):
    count = max(1, min(count, 10))
    await interaction.response.defer()
    await post_news(interaction.channel, count)
    await interaction.followup.send("ニュースを取得しました！", ephemeral=True)


@client.tree.command(name="amex-goal-set", description="アメックスゴールドの決済目標を設定します")
@app_commands.describe(
    goal="目標決済額（円）。デフォルトは入会キャンペーンの50万円",
    days="達成期限（日数）。デフォルト90日（約3ヶ月）",
)
async def amex_goal_set(
    interaction: discord.Interaction,
    goal: int = amex.DEFAULT_GOAL_YEN,
    days: int = amex.DEFAULT_DAYS,
):
    if goal <= 0 or days <= 0:
        await interaction.response.send_message("目標額・日数は正の整数で入力してください。", ephemeral=True)
        return

    entry = amex.set_goal(interaction.guild_id, interaction.user.id, goal, days)
    deadline_dt = datetime.fromisoformat(entry["deadline"])

    embed = discord.Embed(
        title="🥇 アメックスゴールド 決済目標を設定しました",
        color=discord.Color.gold(),
    )
    embed.add_field(name="目標額", value=f"**{goal:,}円**", inline=True)
    embed.add_field(name="期限", value=f"**{deadline_dt.strftime('%Y/%m/%d')}**（{days}日後）", inline=True)
    embed.add_field(
        name="1日あたりの目標",
        value=f"**{goal // days:,}円**",
        inline=True,
    )
    embed.set_footer(text="/amex-goal-update で支払い額を随時追加できます")
    await interaction.response.send_message(embed=embed)


@client.tree.command(name="amex-goal-update", description="アメックスゴールドの支払い額を追加します")
@app_commands.describe(
    amount="今回の支払い額（円）",
    memo="メモ（店名・用途など、省略可）",
)
async def amex_goal_update(
    interaction: discord.Interaction,
    amount: int,
    memo: str = "",
):
    if amount <= 0:
        await interaction.response.send_message("支払い額は正の整数で入力してください。", ephemeral=True)
        return

    entry = amex.add_payment(interaction.guild_id, interaction.user.id, amount, memo)
    if entry is None:
        await interaction.response.send_message(
            "目標が設定されていません。まず `/amex-goal-set` で目標を設定してください。",
            ephemeral=True,
        )
        return

    status = amex.get_status(interaction.guild_id, interaction.user.id)
    bar = _progress_bar(status["pct"])

    embed = discord.Embed(
        title="💳 支払いを記録しました",
        color=discord.Color.green() if status["achieved"] else discord.Color.gold(),
    )
    embed.add_field(name="今回の支払い", value=f"**{amount:,}円**" + (f"（{memo}）" if memo else ""), inline=False)
    embed.add_field(name="累計支払い額", value=f"**{status['spent_yen']:,}円** / {status['goal_yen']:,}円", inline=False)
    embed.add_field(name="進捗", value=f"{bar}  **{status['pct']:.1f}%**", inline=False)

    if status["achieved"]:
        embed.add_field(name="🎉 達成！", value="決済目標を達成しました！", inline=False)
    else:
        embed.add_field(
            name="残り",
            value=f"**{status['remaining_yen']:,}円**（残り{status['days_left']}日）",
            inline=True,
        )
        embed.add_field(
            name="1日あたり必要額",
            value=f"**{status['daily_needed']:,.0f}円**",
            inline=True,
        )
    await interaction.response.send_message(embed=embed)


@client.tree.command(name="amex-goal-status", description="アメックスゴールドの決済目標の進捗を確認します")
async def amex_goal_status(interaction: discord.Interaction):
    status = amex.get_status(interaction.guild_id, interaction.user.id)
    if status is None:
        await interaction.response.send_message(
            "目標が設定されていません。まず `/amex-goal-set` で目標を設定してください。",
            ephemeral=True,
        )
        return

    bar = _progress_bar(status["pct"])
    color = discord.Color.green() if status["achieved"] else discord.Color.gold()

    embed = discord.Embed(
        title="🥇 アメックスゴールド 決済目標 進捗レポート",
        color=color,
    )
    embed.add_field(name="目標額", value=f"{status['goal_yen']:,}円", inline=True)
    embed.add_field(name="累計支払い額", value=f"**{status['spent_yen']:,}円**", inline=True)
    embed.add_field(name="残り", value=f"{status['remaining_yen']:,}円", inline=True)
    embed.add_field(name="進捗", value=f"{bar}  **{status['pct']:.1f}%**", inline=False)
    embed.add_field(
        name="期限",
        value=f"{status['deadline'].strftime('%Y/%m/%d')}（残り{status['days_left']}日）",
        inline=True,
    )

    if status["achieved"]:
        embed.add_field(name="🎉 ステータス", value="**達成済み！**", inline=True)
    else:
        embed.add_field(name="1日あたり必要額", value=f"**{status['daily_needed']:,.0f}円**", inline=True)
        embed.add_field(name="1週間あたり必要額", value=f"**{status['weekly_needed']:,.0f}円**", inline=True)

        if status["days_left"] > 0 and status["remaining_yen"] > 0:
            hints = amex.suggest_spending(status["remaining_yen"], status["days_left"])
            embed.add_field(
                name="💡 残り額を消化するヒント",
                value="\n".join(hints[:5]),
                inline=False,
            )

    recent = status["payments"][-5:][::-1]
    if recent:
        lines = [
            f"• {datetime.fromisoformat(p['date']).strftime('%m/%d')} **{p['amount']:,}円**"
            + (f" {p['memo']}" if p["memo"] else "")
            for p in recent
        ]
        embed.add_field(name="直近の支払い履歴", value="\n".join(lines), inline=False)

    await interaction.response.send_message(embed=embed)


@client.tree.command(name="amex-goal-reset", description="アメックスゴールドの決済目標と履歴をリセットします")
async def amex_goal_reset(interaction: discord.Interaction):
    removed = amex.reset_goal(interaction.guild_id, interaction.user.id)
    if removed:
        await interaction.response.send_message("決済目標と支払い履歴をリセットしました。", ephemeral=True)
    else:
        await interaction.response.send_message("設定されている目標がありません。", ephemeral=True)


def _progress_bar(pct: float, length: int = 10) -> str:
    filled = int(pct / 100 * length)
    return "█" * filled + "░" * (length - filled)


if __name__ == "__main__":
    client.run(DISCORD_TOKEN)
