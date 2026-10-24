const express = require('express');
const app = express();

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

const MerchantLogin = '100gate';

app.post('/api/create-payment', (req, res) => {
    try {
        const { amount, description } = req.body;
        const OutSum = amount || 100;
        const InvId = Date.now();

        const paymentUrl = `https://auth.robokassa.ru/Merchant/Index.aspx?MerchantLogin=${MerchantLogin}&OutSum=${OutSum}&InvId=${InvId}&Description=${encodeURIComponent(description || 'Покупка монет')}&IsTest=1`;

        res.json({ paymentUrl });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api', (req, res) => {
    res.send('100Gate Payment Server is Active');
});

app.get('/', (req, res) => {
    res.send('100Gate Payment Server is Active');
});

module.exports = app;
