const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// Данные (в продакшене используй базу данных)
let users = {};
let gifts = [];
let authSessions = {};

// Инициализация бота для админских команд
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// API для получения подарков
app.get('/api/gifts', (req, res) => {
    res.json(gifts);
});

// API для аренды подарка
app.post('/api/rent', (req, res) => {
    const { giftId, userId } = req.body;
    
    // Логика аренды
    const gift = gifts.find(g => g.id === giftId);
    if (gift) {
        if (!users[userId]) {
            users[userId] = { balance: 0, rentedGifts: [], myGifts: [] };
        }
        
        users[userId].rentedGifts.push(giftId);
        res.json({ success: true });
    } else {
        res.json({ success: false, error: 'Подарок не найден' });
    }
});

// API для сохранения номера телефона
app.post('/api/save-phone', (req, res) => {
    const { userId, phone } = req.body;
    
    if (!users[userId]) {
        users[userId] = {};
    }
    
    users[userId].phone = phone;
    res.json({ success: true });
});

// API для получения данных пользователя
app.get('/api/user/:userId', (req, res) => {
    const userId = req.params.userId;
    const user = users[userId] || { balance: 0, rentedGifts: [], myGifts: [] };
    
    res.json({
        balance: user.balance || 0,
        rentedGifts: user.rentedGifts ? user.rentedGifts.length : 0,
        myGifts: user.myGifts ? user.myGifts.length : 0,
        phone: user.phone || null
    });
});

// API для проверки статуса Telegram
app.get('/api/telegram-status/:userId', (req, res) => {
    const userId = req.params.userId;
    const user = users[userId];
    
    res.json({
        connected: !!(user && user.telegramConnected)
    });
});

// Авторизация Telegram
app.post('/auth/request', async (req, res) => {
    const { phone } = req.body;
    
    // Сохраняем сессию
    const sessionId = Date.now().toString();
    authSessions[sessionId] = { phone, step: 'code_requested' };
    
    // Здесь должна быть логика отправки кода через Telegram API
    // Это сложная часть, требующая настройки Telegram Client
    
    res.json({ requires_code: true, sessionId });
});

app.post('/auth/verify', async (req, res) => {
    const { code, sessionId } = req.body;
    
    // Верификация кода
    // Это упрощенная версия - в реальности нужна полная реализация авторизации
    
    res.json({ success: true });
});

// Админская команда для добавления подарков
bot.onText(/\/gift (.+)/, (msg, match) => {
    if (msg.from.id.toString() !== process.env.ADMIN_ID) {
        return bot.sendMessage(msg.chat.id, '❌ Доступ запрещен');
    }
    
    const params = match[1].split(' ');
    if (params.length < 6) {
        return bot.sendMessage(msg.chat.id, 
            'Использование: /gift [ссылка_на_фото] [Модель] [дни] [цена] [фон] [узор] [ссылка_на_видео]');
    }
    
    const gift = {
        id: Date.now(),
        image: params[0],
        model: params[1],
        days: parseInt(params[2]),
        price: parseFloat(params[3]),
        background: params[4],
        pattern: params[5],
        video: params[6] || '',
        addedBy: msg.from.id,
        addedAt: new Date().toISOString()
    };
    
    gifts.push(gift);
    bot.sendMessage(msg.chat.id, 
        `🎁 Подарок "${gift.model}" добавлен!\n` +
        `Цена: ${gift.price} TON\n` +
        `Срок: ${gift.days} дней`);
});

app.listen(process.env.PORT || 3000, () => {
    console.log('Server running on port 3000');
});
