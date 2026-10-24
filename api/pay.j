module.exports = (req, res) => {
    // Угодим CORS, чтобы игра могла отправлять запросы
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'GET') {
        return res.status(200).send('100Gate Payment Server is Active');
    }

    if (req.method === 'POST') {
        try {
            // Читаем тело запроса (даже если оно приходит как строка)
            let body = req.body;
            if (typeof body === 'string') {
                body = JSON.parse(body);
            }

            const amount = body && body.amount ? body.amount : 100;
            const description = body && body.description ? body.description : 'Покупка монет';
            const MerchantLogin = '100gate';
            const InvId = Date.now();

            const paymentUrl = `https://auth.robokassa.ru/Merchant/Index.aspx?MerchantLogin=${MerchantLogin}&OutSum=${amount}&InvId=${InvId}&Description=${encodeURIComponent(description)}&IsTest=1`;

            return res.status(200).json({ paymentUrl });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    res.status(405).send('Method Not Allowed');
};
