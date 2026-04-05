import os
import asyncio
import discord
from discord import app_commands
from discord.ext import tasks
from dotenv import load_dotenv
from news_fetcher import fetch_news

load_dotenv()

DISCORD_TOKEN = os.environ["DISCORD_TOKEN"]
NEWS_CHANNEL_ID = int(os.environ["NEWS_CHANNEL_ID"])
NEWS_INTERVAL_MINUTES = int(os.getenv("NEWS_INTERVAL_MINUTES", "60"))
NEWS_COUNT = int(os.getenv("NEWS_COUNT", "5"))


class FinanceBot(discord.Client):
    def __init__(self):
        intents = discord.Intents.default()
        super().__init__(intents=intents)
        self.tree = app_commands.CommandTree(self)

    async def setup_hook(self):
        await self.tree.sync()
        self.news_task.start()

    async def on_ready(self):
        print(f"[Bot] ログイン完了: {self.user} (ID: {self.user.id})")
        print(f"[Bot] ニュース配信間隔: {NEWS_INTERVAL_MINUTES}分")

    @tasks.loop(minutes=NEWS_INTERVAL_MINUTES)
    async def news_task(self):
        channel = self.get_channel(NEWS_CHANNEL_ID)
        if channel is None:
            print(f"[Bot] チャンネル {NEWS_CHANNEL_ID} が見つかりません")
            return
        await post_news(channel, NEWS_COUNT)

    @news_task.before_loop
    async def before_news_task(self):
        await self.wait_until_ready()


client = FinanceBot()


def build_embed(article: dict) -> discord.Embed:
    """記事1件をDiscord Embedに変換する。"""
    embed = discord.Embed(
        title=article["title"],
        url=article["url"],
        description=article["summary"] or None,
        color=discord.Color.gold(),
    )
    embed.set_footer(text=f"{article['source']} | {article['published']}")
    return embed


async def post_news(channel: discord.abc.Messageable, count: int):
    """チャンネルにニュースを投稿する。"""
    loop = asyncio.get_event_loop()
    articles = await loop.run_in_executor(None, fetch_news, count)

    if not articles:
        await channel.send("現在取得できる新着ニュースはありません。")
        return

    await channel.send(f"📰 **最新の金融ニュース ({len(articles)}件)**")
    for article in articles:
        await channel.send(embed=build_embed(article))


@client.tree.command(name="news", description="最新の金融ニュースを取得します")
@app_commands.describe(count="取得件数（1〜10、デフォルト5）")
async def news_command(interaction: discord.Interaction, count: int = 5):
    count = max(1, min(count, 10))
    await interaction.response.defer()
    await post_news(interaction.channel, count)
    await interaction.followup.send("ニュースを取得しました！", ephemeral=True)


if __name__ == "__main__":
    client.run(DISCORD_TOKEN)
