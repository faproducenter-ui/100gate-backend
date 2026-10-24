const express = require('express');
const cors = require('cors');

const app = express();

// Разрешаем запросы со всех сайтов (CORS)
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Настройки Robokassa (укажите свои пароли при необходимости)
const MerchantLogin = '100gate';
const Pass1 = 'your_pass1'; // Пароль #1 из личного кабинета Robokassa

app.post('/create-payment', (req, res) => {
    const { amount, description } = req.body;
    const OutSum = amount || 100;
    const InvId = Date.now(); // Уникальный номер заказа

    // В тестовом режиме добавляем IsTest=1
    const paymentUrl = `https://auth.robokassa.ru/Merchant/Index.aspx?MerchantLogin=${MerchantLogin}&OutSum=${OutSum}&InvId=${InvId}&Description=${encodeURIComponent(description || 'Покупка монет')}&IsTest=1`;

    res.json({ paymentUrl });
});

app.get('/', (req, res) => {
    res.send('Server is running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
