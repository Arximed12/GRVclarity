export default function handler(req, res) {
    // Полное открытие шлюза CORS для любых доменов
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Сервер просто возвращает этот текст напрямую вашему сайту на GitHub
    return res.status(200).send("Ура! Сервер Vercel успешно вышел на связь и работает без блокировок!");
}
