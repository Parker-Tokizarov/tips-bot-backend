const express = require('express');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
const port = process.env.PORT || 3000;

// Токен берём из переменных окружения (которые мы задали на Render)
const token = process.env.BOT_TOKEN;
if (!token) {
    console.error('BOT_TOKEN not set');
    process.exit(1);
}

const bot = new TelegramBot(token);

// URL нашего сервиса (Render должен подставить автоматически, но можно прописать вручную)
const baseUrl = process.env.RENDER_EXTERNAL_URL;
if (!baseUrl) {
    console.warn('RENDER_EXTERNAL_URL not set, using fallback (you need to set it manually)');
    // Можно временно вставить свой URL вручную, но лучше задать переменную окружения
}

// Устанавливаем вебхук
if (baseUrl) {
    bot.setWebHook(`${baseUrl}/bot${token}`);
    console.log(`Webhook set to ${baseUrl}/bot${token}`);
}

// Middleware для парсинга JSON (обязательно для вебхука)
app.use(express.json());

// Эндпоинт, на который Telegram будет отправлять обновления
app.post(`/bot${token}`, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

// Обработка команды /start
// Обработка команды /start с inline-кнопкой для открытия Mini App
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    
    // Создаём inline-клавиатуру с кнопкой, ведущей на наше приложение
    const opts = {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: '🚀 Открыть калькулятор чаевых', // Текст кнопки
                        web_app: { url: 'https://tips-calculator.vercel.app' } // Адрес твоего приложения на Vercel
                    }
                ]
            ]
        }
    };
    
    bot.sendMessage(chatId, 'Нажми кнопку ниже, чтобы открыть приложение:', opts);
});

// Обработка всех сообщений (в том числе данных от Mini App)
bot.on('message', (msg) => {
    if (msg.web_app_data) {
        try {
            const data = JSON.parse(msg.web_app_data.data);
            const chatId = msg.chat.id;

            const response = `
✅ *Результат расчета:*
• Сумма чека: ${data.bill} ₽
• Количество человек: ${data.people}
• Чаевые: ${data.tip}%
• Общая сумма: ${data.total} ₽
• С каждого: ${data.perPerson} ₽
            `;

            bot.sendMessage(chatId, response, { parse_mode: 'Markdown' });
        } catch (error) {
            console.error('Ошибка парсинга данных:', error);
            bot.sendMessage(msg.chat.id, 'Произошла ошибка при обработке данных.');
        }
    }
});

app.get('/', (req, res) => {
    res.send('Bot is running with webhook!');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});