import os
import asyncio
from datetime import datetime, timezone, timedelta
import discord
from discord import app_commands
from dotenv import load_dotenv
from news_fetcher import fetch_news

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


if __name__ == "__main__":
    client.run(DISCORD_TOKEN)
