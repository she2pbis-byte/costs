const { Telegraf } = require('telegraf');
const admin = require('firebase-admin');

// Инициализация Firebase через переменную окружения
// В облачном сервисе (Render/Railway) создайте переменную FIREBASE_SERVICE_ACCOUNT
// и вставьте туда содержимое вашего JSON-файла целиком.
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Инициализация бота через переменную окружения BOT_TOKEN
const bot = new Telegraf(process.env.BOT_TOKEN);

// Команда "взял X"
bot.hears(/^взял\s+(\d+)$/i, async (ctx) => {
    try {
        const amount = parseInt(ctx.match[1]);
        await db.collection('cash_flow').add({
            action: 'withdrawal',
            amount: amount,
            date: new Date().toISOString()
        });
        ctx.reply(`✅ Записано: взял из кассы ${amount}₽.`);
    } catch (error) {
        ctx.reply('❌ Ошибка при записи в базу.');
        console.error(error);
    }
});

// Команда "имя дата сумма" (например: авдонин 23.05 3000)
bot.hears(/^([а-яё]+)\s+(\d{1,2}\.\d{1,2})\s+(\d+)$/i, async (ctx) => {
    try {
        const [_, name, eventDate, amount] = ctx.match;
        await db.collection('payments').add({
            person: name.toLowerCase(),
            date: eventDate,
            amount: parseInt(amount),
            timestamp: new Date().toISOString()
        });
        ctx.reply(`✅ Записано: ${name} получил ${amount}₽ за ${eventDate}.`);
    } catch (error) {
        ctx.reply('❌ Ошибка при записи в базу.');
        console.error(error);
    }
});

// Запуск бота
bot.launch().then(() => {
    console.log('Бот успешно запущен!');
}).catch((err) => {
    console.error('Ошибка при запуске бота:', err);
});

// Остановка бота при выключении процесса
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
