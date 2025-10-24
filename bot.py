# bot.py
import asyncio
import logging
from telethon import TelegramClient
from telethon.sessions import StringSession
import re
import json

# Настройки
API_ID = 'your_api_id'
API_HASH = 'your_api_hash'
BOT_TOKEN = 'your_bot_token'
ADMIN_ID = 7773057702

# Инициализация клиента
client = TelegramClient('bot_session', API_ID, API_HASH)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GiftRentalBot:
    def __init__(self):
        self.gift_pattern = re.compile(r'/gift\s+(\S+)\s+([^]+?)\s+(\d+)\s+(\d+)\s+(\S+)\s+(\S+)\s+(\S+)')
    
    async def start(self):
        await client.start(bot_token=BOT_TOKEN)
        logger.info("Бот запущен!")
        
        @client.on(events.NewMessage(pattern='/start'))
        async def start_handler(event):
            if event.sender_id == ADMIN_ID:
                await event.reply(
                    "👑 Админ-панель GiftUp\n\n"
                    "Доступные команды:\n"
                    "/gift [ссылка] [модель] [дни] [цена] [фон] [узор] [видео] - Добавить подарок\n"
                    "/stats - Статистика\n"
                    "/gifts - Список подарков"
                )
            else:
                await event.reply("Добро пожаловать в GiftUp! Используйте веб-приложение для доступа к функциям.")
        
        @client.on(events.NewMessage)
        async def message_handler(event):
            if event.sender_id != ADMIN_ID:
                return
                
            message = event.message.text
            
            # Обработка команды /gift
            if message.startswith('/gift'):
                await self.handle_gift_command(event, message)
            
            # Обработка команды /stats
            elif message == '/stats':
                await self.handle_stats_command(event)
            
            # Обработка команды /gifts
            elif message == '/gifts':
                await self.handle_gifts_command(event)
        
        await client.run_until_disconnected()
    
    async def handle_gift_command(self, event, message):
        match = self.gift_pattern.match(message)
        if not match:
            await event.reply(
                "❌ Неправильный формат команды!\n\n"
                "Используйте:\n"
                "/gift [ссылка_на_изображение] [модель] [дни] [цена] [фон] [узор] [ссылка_на_видео]\n\n"
                "Пример:\n"
                "/gift https://example.com/image.jpg iPhone 15 Pro 7 1500 gradient stars https://example.com/video.mp4"
            )
            return
        
        try:
            image_url, model, days, price, background, pattern, video_url = match.groups()
            days = int(days)
            price = int(price)
            
            # Здесь будет добавление в базу данных
            gift_data = {
                'image': image_url,
                'model': model,
                'days': days,
                'price': price,
                'background': background,
                'pattern': pattern,
                'video': video_url
            }
            
            # Добавляем в Supabase (нужно реализовать)
            # await self.add_gift_to_supabase(gift_data)
            
            await event.reply(
                f"✅ Подарок добавлен!\n\n"
                f"🎁 Модель: {model}\n"
                f"📅 Дней: {days}\n"
                f"💰 Цена: {price} TON\n"
                f"🎨 Фон: {background}\n"
                f"✨ Узор: {pattern}\n"
                f"🎥 Видео: {video_url}"
            )
            
        except Exception as e:
            logger.error(f"Ошибка добавления подарка: {e}")
            await event.reply("❌ Ошибка при добавлении подарка")
    
    async def handle_stats_command(self, event):
        # Получаем статистику из Supabase
        stats = await self.get_stats_from_supabase()
        
        await event.reply(
            f"📊 Статистика GiftUp\n\n"
            f"🎁 Всего подарков: {stats['total_gifts']}\n"
            f"📈 Активных аренд: {stats['active_rentals']}\n"
            f"👥 Пользователей: {stats['total_users']}\n"
            f"💰 Общий оборот: {stats['total_revenue']} TON"
        )
    
    async def handle_gifts_command(self, event):
        gifts = await self.get_gifts_from_supabase()
        
        if not gifts:
            await event.reply("📭 Подарков пока нет")
            return
        
        message = "🎁 Список подарков:\n\n"
        for gift in gifts[:10]:  # Показываем первые 10
            message += f"• {gift['model']} - {gift['price']} TON\n"
        
        if len(gifts) > 10:
            message += f"\n... и еще {len(gifts) - 10} подарков"
        
        await event.reply(message)
    
    async def add_gift_to_supabase(self, gift_data):
        # Реализация добавления в Supabase
        pass
    
    async def get_stats_from_supabase(self):
        # Реализация получения статистики
        return {
            'total_gifts': 0,
            'active_rentals': 0,
            'total_users': 0,
            'total_revenue': 0
        }
    
    async def get_gifts_from_supabase(self):
        # Реализация получения подарков
        return []

async def main():
    bot = GiftRentalBot()
    await bot.start()

if __name__ == '__main__':
    asyncio.run(main())
