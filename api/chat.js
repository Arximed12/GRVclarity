// Официальный скрытый ИИ-шлюз MSK AI для сервера Vercel
export default async function handler(req, res) {
    // Включаем защиту CORS, чтобы ваш сайт на GitHub Pages мог свободно общаться с этим шлюзом
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // Если это предварительный технический запрос от браузера — сразу одобряем его
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        // Считываем вопрос, который прилетел с вашего сайта на GitHub Pages
        const { message, systemPrompt } = req.body;

        // В темноте вытаскиваем ваш секретный ключ gsk_..., который мы спрятали в настройках Vercel
        const apiKey = process.env.GROQ_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: "Критическая ошибка: Ключ GROQ_API_KEY не найден в тайнике Vercel!" });
        }

        // Отправляем официальный, замаскированный запрос напрямую в самую быструю нейросеть Groq
        const response = await fetch("https://groq.com", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                // Используем топовую, быструю и экономную модель Llama 3 (8B)
                model: "llama3-8b-8192", 
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: message }
                ],
                temperature: 0.7
            })
        });

        const data = await response.json();
        
        // Забираем чистый текст ответа от искусственного интеллекта
        const aiText = data.choices[0].message.content;

        // Возвращаем этот ответ обратно на ваш сайт на GitHub Pages
        res.status(200).send(aiText);

    } catch (error) {
        // Если что-то упало — вежливо сообщаем об этом
        res.status(500).send("Ошибка шлюза Vercel. Повторите попытку через секунду.");
    }
}
