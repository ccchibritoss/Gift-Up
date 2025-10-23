// telegram-bot.js - Бот через Telegram Web App
class TelegramBot {
    constructor() {
        this.commands = {
            '/start': this.handleStart.bind(this),
            '/gift': this.handleGift.bind(this),
            '/gifts': this.handleGifts.bind(this),
            '/stats': this.handleStats.bind(this)
        };
    }
    
    // Обработка команды /gift от админа
    async handleGift(message, userId) {
        if (userId !== CONFIG.ADMIN_ID) {
            return "❌ Только админ может добавлять подарки";
        }
        
        const params = message.split(' ');
        if (params.length < 6) {
            return "ℹ️ Использование: /gift [эмодзи] [Модель] [дни] [цена] [фон] [узор] [видео-URL]";
        }
        
        try {
            const giftData = {
                image: params[0],
                model: params[1],
                days: parseInt(params[2]),
                price: parseFloat(params[3]),
                background: params[4],
                pattern: params[5],
                video: params[6] || ""
            };
            
            const result = await window.supabaseClient.addGift(giftData, userId);
            
            if (result.success) {
                return `🎁 Подарок "${giftData.model}" добавлен!\n💰 ${giftData.price} TON | 📅 ${giftData.days} дней`;
            } else {
                return "❌ Ошибка при добавлении подарка";
            }
        } catch (error) {
            return "❌ Ошибка: " + error.message;
        }
    }
    
    // Показать все подарки
    async handleGifts() {
        try {
            const gifts = await window.supabaseClient.getGifts();
            
            if (gifts.length === 0) {
                return "📭 Нет доступных подарков";
            }
            
            let message = "🎁 Доступные подарки:\n\n";
            gifts.forEach((gift, index) => {
                message += `${index + 1}. ${gift.image} ${gift.model}\n`;
                message += `   💰 ${gift.price} TON | 📅 ${gift.days} дней\n\n`;
            });
            
            return message;
        } catch (error) {
            return "❌ Ошибка загрузки подарков";
        }
    }
    
    // Статистика пользователя
    async handleStats(userId) {
        try {
            const stats = await window.supabaseClient.getUserStats(userId);
            const userData = await window.supabaseClient.getUserData(userId);
            
            return `📊 Ваша статистика:\n` +
                   `🎁 Арендовано: ${stats.rentedGifts} подарков\n` +
                   `💰 Баланс: ${stats.balance} TON\n` +
                   `📞 Телефон: ${userData?.phone || 'Не указан'}\n` +
                   `👤 ID: ${userId}`;
        } catch (error) {
            return "❌ Ошибка загрузки статистики";
        }
    }
    
    // Стартовая команда
    handleStart() {
        return `🎉 Добро пожаловать в Gift Up!\n\n` +
               `Доступные команды:\n` +
               `📋 /gifts - Список подарков\n` +
               `📊 /stats - Ваша статистика\n` +
               `🎁 /gift - Добавить подарок (только админ)`;
    }
    
    // Обработка входящих сообщений
    async processMessage(command, message, userId) {
        const handler = this.commands[command];
        if (handler) {
            return await handler(message, userId);
        }
        return "❌ Неизвестная команда. Используйте /start для справки";
    }
}

window.telegramBot = new TelegramBot();
