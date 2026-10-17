document.addEventListener("DOMContentLoaded", function() {
    const roleSelect = document.getElementById('aiRole');
    const container = document.getElementById('dynamic-buttons-container');
    const aiForm = document.getElementById('aiForm');
    const inputField = document.getElementById('userQuery');

    // Прямой относительный адрес к вашей единой базе данных на GitHub Pages
    const DATA_URL = './data.json';
    
    // Внутренняя память сайта, куда запишется скачанный из сети data.json
    let cloudData = {};

    // Главная функция: за долю секунды скачивает всю базу кнопок и промптов из интернета
    async function loadCloudData() {
        try {
            const response = await fetch(DATA_URL);
            cloudData = await response.json();
            // Как только данные прилетели из сети — мгновенно рисуем кнопки на экране!
            updateQuickButtons();
        } catch (error) {
            console.error("Ошибка загрузки единой базы данных MSK AI:", error);
        }
    }

    // Функция отрисовки 4 динамических кнопок на основе интернет-данных
    function updateQuickButtons() {
        if (!roleSelect || !container) return;
        const selectedText = roleSelect.options[roleSelect.selectedIndex].text.trim();
        container.innerHTML = '';

        // Теперь берем список кнопок ПРЯМО из скачанного облачного архива cloudData
        const currentButtons = cloudData[selectedText] || [];
        
        currentButtons.forEach(buttonInfo => {
            const button = document.createElement('button');
            button.type = 'button'; 
            button.className = 'quick-btn';
            button.innerHTML = `<span>${buttonInfo.icon}</span> ${buttonInfo.text}`;
            
            // КЛИК ПО КНОПКЕ: Скрытая склейка облачного промпта и авто-отправка!
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
                
                // Линия-маскировка, которая красиво прячет промпт за троеточие в чате
                const lineSeparator = ".".repeat(111120);
;
                
                if (systemPrompt) {
                    inputField.value = `${userText} ${lineSeparator} [Настройка ИИ: ${systemPrompt}]`;
                } else {
                    let mainRole = roleSelect.value;
                    inputField.value = `${userText} ${lineSeparator} [Настройка ИИ: ${mainRole} / Задача: ${buttonInfo.text}]`;
                }

                // Отправляем форму со скрытой склейкой в Google
                aiForm.submit();

                // Моментально очищаем поле ввода в самом плагине, чтобы экран оставался чистым
                setTimeout(() => {
                    inputField.value = '';
                }, 100);
            };

            container.appendChild(button);
        });
    }

    if (roleSelect) {
        roleSelect.addEventListener('change', updateQuickButtons);
    }

    if (aiForm) {
        aiForm.addEventListener('submit', function(e) {
            let userText = inputField.value.trim();
            let mainRole = roleSelect.value;
            const lineSeparator = " — ".repeat(40);
            
            if (!userText.includes("[Настройка ИИ:")) {
                inputField.value = `${userText} ${lineSeparator} [Настройка ИИ: ${mainRole}]`;
                setTimeout(() => {
                    inputField.value = '';
                }, 100);
            }
        });
    }

    // ЗАПУСК: при открытии сайта сразу включаем скачивание базы из сети
    loadCloudData();
});
