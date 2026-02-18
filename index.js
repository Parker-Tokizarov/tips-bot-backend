// Подключаем библиотеки
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');

// Создаём express-приложение
const app = express();
const port = process.env.PORT || 3000; // Render будет задавать свой PORT, локально будет 3000

// Токен бота (вставь свой)
const token = '8477201002:AAHDGBQjUMJz3UO-6-tyt5giYlPUFyT-l84'; // ⚠️ ЗАМЕНИ НА СВОЙ ТОКЕН

// Создаём экземпляр бота
const bot = new TelegramBot(token, { polling: true }); // polling: true — для локальной разработки

// Обработка команды /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Добро пожаловать! Открой калькулятор чаевых через кнопку меню.');
});

// Обработка всех сообщений (в том числе данных от Mini App)
bot.on('message', (msg) => {
    // Проверяем, есть ли у сообщения поле web_app_data (данные из Mini App)
    if (msg.web_app_data) {
        try {
            // Парсим JSON-строку, которую мы отправили из Mini App
            const data = JSON.parse(msg.web_app_data.data);
            const chatId = msg.chat.id;

            // Формируем ответное сообщение (используем Markdown для красоты)
            const response = `
✅ *Результат расчета:*
• Сумма чека: ${data.bill} ₽
• Количество человек: ${data.people}
• Чаевые: ${data.tip}%
• Общая сумма: ${data.total} ₽
• С каждого: ${data.perPerson} ₽
            `;

            // Отправляем сообщение обратно в чат
            bot.sendMessage(chatId, response, { parse_mode: 'Markdown' });
        } catch (error) {
            console.error('Ошибка при обработке данных:', error);
            bot.sendMessage(msg.chat.id, 'Произошла ошибка. Попробуйте снова.');
        }
    }
});

// Простой маршрут для проверки, что сервер работает
app.get('/', (req, res) => {
    res.send('Бот работает!');
});

// Запускаем сервер
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});