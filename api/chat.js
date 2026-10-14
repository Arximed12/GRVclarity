export default async function handler(req, res) {
    // Жестко разрешаем любым сайтам (включая GitHub) читать ответ сервера
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            return res.status(200).send("Ошибка: Ключ GROQ_API_KEY потерялся в настройках Vercel!");
        }

        // Тестовый запрос в Groq
        const response = await fetch("https://groq.com", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama3-8b-8192", 
                messages: [
                    { role: "system", content: "Ты — юрист." },
                    { role: "user", content: "Напиши фразу: Связь с Groq установлена успешно!" }
                ],
                temperature: 0.5
            })
        });

        const data = await response.json();
        const aiText = data.choices[0].message.content;
        
        // Отправляем чистый текст обратно
        res.status(200).send(aiText);

    } catch (error) {
        res.status(200).send("Сервер Vercel работает, но сам Groq выдал ошибку. Проверьте правильность gsk_ ключа.");
    }
}
