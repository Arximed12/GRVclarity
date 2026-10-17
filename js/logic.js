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

                if (!inputField || !aiForm) return;

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
                
                if (systemPrompt) {
                    inputField.value = `${userText} ${lineSeparator} [Настройка ИИ: ${systemPrompt}]`;
                } else {
                    let mainRole = roleSelect.value;
                    inputField.value = `${userText} ${lineSeparator} [Настройка ИИ: ${mainRole} / Задача: ${buttonInfo.text}]`;
                }

                // Отправляем форму со скрытым промптом
                aiForm.submit();

                // Моментально очищаем поле ввода в самом плагине, чтобы экран оставался чистым
                setTimeout(() => {
                    inputField.value = '';
                }, 100);
            };

            container.appendChild(button);
        });
    }

    // Вешаем событие на изменение выпадающего списка категорий
    if (roleSelect) {
        roleSelect.addEventListener('change', updateQuickButtons);
    }

    // 🔥 ЧИСТАЯ ОТПРАВКА: Если пользователь нажал Enter или кликнул на синюю стрелочку,
    // форма улетает в ИИ-чат в абсолютно чистом виде БЕЗ ПРОМПТОВ И БЕЗ ТОЧЕК!
    if (aiForm) {
        aiForm.addEventListener('submit', function(e) {
            // Больше никакой скрытой склейки здесь нет! Браузер просто отправит то, что ввел юзер
            setTimeout(() => {
                inputField.value = ''; // Просто аккуратно очищаем окошко после улета
            }, 100);
        });
    }

    // ЗАПУСК: скачиваем базу из интернета при старте панели
    loadCloudData();
});
