document.addEventListener("DOMContentLoaded", function() {
    const roleSelect = document.getElementById('aiRole');
    const container = document.getElementById('dynamic-buttons-container');
    const aiForm = document.getElementById('aiForm');
    const inputField = document.getElementById('userQuery');

    // Адрес вашего личного облачного хранилища промптов на Vercel
    const PROMPTS_URL = './data.json';
    
    // Внутренняя память сайта для хранения скачанных из сети кнопок и промптов
    let cloudData = {};

    // Функция, которая скачивает всю базу из интернета при старте
    async function loadCloudData() {
        try {
            const response = await fetch(PROMPTS_URL);
            cloudData = await response.json();
            updateQuickButtons();
        } catch (error) {
            console.error("Ошибка загрузки единой базы данных MSK AI:", error);
        }
    }

    // Вспомогательная функция для безопасного перехода по ссылке
    function sendRequestToGoogle(finalText) {
        if (!aiForm) return;
        
        // Собираем точную и чистую поисковую интернет-ссылку
        const baseUrl = aiForm.getAttribute('action') || 'https://google.ru';
        const searchUrl = `${baseUrl}?hl=ru&udm=50&q=${encodeURIComponent(finalText)}`;
        
        // 🔥 ГЛАВНОЕ ИСПРАВЛЕНИЕ: Плавное перенаправление без жесткого перезапуска формы,
        // что предотвращает ошибку ERR_CONNECTION_ABORTED в мобильном WebViewer
        window.location.href = searchUrl;

        // Аккуратно зачищаем поле ввода, чтобы интерфейс оставался премиально чистым
        setTimeout(() => {
            if (inputField) inputField.value = '';
        }, 100);
    }

    // Функция отрисовки 4 динамических кнопок
    function updateQuickButtons() {
        if (!roleSelect || !container) return;
        const selectedText = roleSelect.options[roleSelect.selectedIndex].text.trim();
        container.innerHTML = '';

        // Берем список кнопок из скачанного облачного архива cloudData
        const currentButtons = cloudData[selectedText] || [];
        
        currentButtons.forEach(buttonInfo => {
            const button = document.createElement('button');
            button.type = 'button'; 
            button.className = 'quick-btn';
            button.innerHTML = `<span>${buttonInfo.icon}</span> ${buttonInfo.text}`;
            
            // КЛИК ПО КНОПКЕ: Скрытая склейка облачного промпта, точки-маскировка и авто-отправка!
            button.onclick = function(e) {
                e.preventDefault(); 

                if (!inputField) return;

                let userText = inputField.value.trim();
                
                // Если поле пустое, просим заполнить перед отправкой
                if (!userText) {
                    inputField.reportValidity(); 
                    return;
                }

                // Достаем скрытый промпт, который привязан к этой кнопке внутри data.json
                let systemPrompt = buttonInfo.prompt || "";
                
                // Стена-маскировка из 120 точек, которая красиво прячет промпт за троеточие в чате
                const lineSeparator = ".".repeat(120);
                let finalText = "";
                
                if (systemPrompt) {
                    finalText = `${userText} ${lineSeparator} [Настройка ИИ: ${systemPrompt}]`;
                } else {
                    let mainRole = roleSelect.value;
                    finalText = `${userText} ${lineSeparator} [Настройка ИИ: ${mainRole} / Задача: ${buttonInfo.text}]`;
                }

                // Отправляем запрос через нашу безопасную программную функцию
                sendRequestToGoogle(finalText);
            };

            container.appendChild(button);
        });
    }

    // Вешаем событие на изменение выпадающего списка категорий
    if (roleSelect) {
        roleSelect.addEventListener('change', updateQuickButtons);
    }

    // 🔥 БЕЗОПАСНАЯ ОТПРАВКА ДЛЯ ТЕЛЕФОНА И ПЛАГИНА (Enter и Синяя кнопка со стрелочкой)
    if (aiForm) {
        aiForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Намертво блокируем стандартную HTML-отправку, вызывавшую сбой!

            if (!inputField) return;
            let userText = inputField.value.trim();
            
            // Если текст пустой — ничего не делаем
            if (!userText) return;

            // Отправляем абсолютно чистый текст пользователя без промптов и точек
            sendRequestToGoogle(userText);
        });
    }

    // ЗАПУСК: скачиваем базу из интернета при старте панели
    loadCloudData();
});
