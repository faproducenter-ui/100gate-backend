const express = require('express');
const crypto = require('crypto');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Ваши настройки из личного кабинета Robokassa
const MERCHANT_LOGIN = process.env.MERCHANT_LOGIN || "your_merchant_login";
const PASSWORD_1 = process.env.PASSWORD_1 || "your_password_1"; // Пароль 1 для создания платежа
const PASSWORD_2 = process.env.PASSWORD_2 || "your_password_2"; // Пароль 2 для проверки webhook

// База данных в памяти (на следующем этапе заменим на PostgreSQL / SQLite)
const playerBalances = {}; 

// 1. Эндпоинт для создания ссылки на оплату
app.post('/api/create-payment', (req, res) => {
    const { playerId, amount, packageId } = req.body;
    
    // Определяем цену в зависимости от пакета монет
    const prices = { '50': 49, '100': 99, '200': 199, '500': 399 };
    const cost = prices[packageId] || 99;
    
    const invoiceId = Math.floor(Math.random() * 1000000);
    
    // Формируем подпись для Robokassa (MD5)
    // Формат: MerchantLogin:OutSum:InvId:Password_1
    const signatureString = `${MERCHANT_LOGIN}:${cost}:${invoiceId}:${PASSWORD_1}`;
    const signature = crypto.createHash('md5').update(signatureString).digest('hex');

    // Ссылка на оплату в Robokassa (тестовый или боевой режим)
    const isTest = 1; // 1 для тестов, 0 для реальных платежей
    const paymentUrl = `https://auth.robokassa.ru/Merchant/Index.aspx?MerchantLogin=${MERCHANT_LOGIN}&OutSum=${cost}&InvId=${invoiceId}&SignatureValue=${signature}&IsTest=${isTest}&Shp_playerId=${playerId}&Shp_amount=${amount}`;

    res.json({ success: true, paymentUrl });
});

// 2. Webhook (уведомление от банка об успешной оплате)
app.post('/api/payment-success', (req, res) => {
    const { OutSum, InvId, SignatureValue, Shp_playerId, Shp_amount } = req.body;

    // Проверка подписи от Robokassa
    // Формат: OutSum:InvId:Password_2:Shp_playerId=...
    const signatureString = `${OutSum}:${InvId}:${PASSWORD_2}:Shp_amount=${Shp_amount}:Shp_playerId=${Shp_playerId}`;
    const calculatedSignature = crypto.createHash('md5').update(signatureString).digest('hex');

    if (calculatedSignature.toLowerCase() !== SignatureValue.toLowerCase()) {
        return res.status(400).send('bad signature');
    }

    // Начисление монет игроку
    const playerId = Shp_playerId;
    const amount = parseInt(Shp_amount, 10);

    playerBalances[playerId] = (playerBalances[playerId] || 100) + amount;
    console.log(`Игроку ${playerId успешно зачислено ${amount} монет. Новый баланс: ${playerBalances[playerId]}`);

    res.send(`OK${InvId}`);
});

// 3. Эндпоинт для проверки баланса игрока
app.get('/api/balance/:playerId', (req, res) => {
    const playerId = req.params.playerId;
    const balance = playerBalances[playerId] || 100; // Старт со 100 монетами
    res.json({ balance });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
