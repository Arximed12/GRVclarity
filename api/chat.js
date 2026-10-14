export default function handler(req, res) {
    // Вшиваем железобетонные заголовки CORS для защиты от "Failed to fetch"
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Если браузер делает предварительную проверку связи (OPTIONS)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Твой серверный тестовый ответ
    return res.status(200).send("Ура! Сервер Vercel успешно выполнил скрипт и ответил на GitHub Pages!");
}
