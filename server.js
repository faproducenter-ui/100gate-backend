const express = require('express');
const app = express();

// Нативная настройка CORS (работает всегда без дополнительных библиотек)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Настройки Robokassa
const MerchantLogin = '100gate';

app.post('/create-payment', (req, res) => {
    const { amount, description } = req.body;
    const OutSum = amount || 100;
    const InvId = Date.now();

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
