const { Telegraf } = require('telegraf');
const admin = require('firebase-admin');

// Инициализация Firebase (файл ключа должен быть в той же папке при запуске)
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

const bot = new Telegraf('ВАШ_TOKEN_ОТ_BOTFATHER');

// Команда "взял X"
bot.hears(/^взял\s+(\d+)$/i, async (ctx) => {
    const amount = parseInt(ctx.match[1]);
    await db.collection('cash_flow').add({
        action: 'withdrawal',
        amount: amount,
        date: new Date()
    });
    ctx.reply(`✅ Взято: ${amount}₽`);
});

// Команда "имя дата сумма"
bot.hears(/^([а-яё]+)\s+(\d{2}\.\d{2})\s+(\d+)$/i, async (ctx) => {
    const [_, name, eventDate, amount] = ctx.match;
    await db.collection('payments').add({
        person: name,
        date: eventDate,
        amount: parseInt(amount),
        timestamp: new Date()
    });
    ctx.reply(`✅ Записано: ${name}, ${eventDate}, ${amount}₽`);
});

bot.launch();
