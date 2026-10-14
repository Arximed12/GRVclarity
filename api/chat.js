export const config = {
    runtime: 'edge',
};

export default async function handler(req) {
    // Формируем идеальные заголовки CORS, которые пробивают любую блокировку
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Content-Type': 'text/plain; charset=utf-8'
    };

    // Одобрение предварительного запроса браузера
    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers });
    }

    // Возвращаем чистый текстовый ответ
    return new Response("Ура! Сервер Vercel на Edge Runtime успешно работает!", {
        status: 200,
        headers: headers
    });
}
