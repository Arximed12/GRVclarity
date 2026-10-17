document.addEventListener("DOMContentLoaded", function() {
    const roleSelect = document.getElementById('aiRole');
    const container = document.getElementById('dynamic-buttons-container');
    const aiForm = document.getElementById('aiForm');
    const inputField = document.getElementById('userQuery');

    // ЭЛЕМЕНТЫ СЕТЕВОГО ИНДИКАТОРА
    const netStatus = document.getElementById('netStatus');
    const dot = netStatus ? netStatus.querySelector('.status-dotIndicator') : null;

    // 🔥 СТРОГО ОНЛАЙН: Прямая и точная интернет-ссылка на ваш файл Data.json
    const PROMPTS_URL = 'https://github.io';
    let cloudData = {};

    // Управление огоньком связи (Индикатор сети)
    function setNetworkStatus(state) {
        if (!dot || !netStatus) return;
        dot.className = 'status-dotIndicator'; // Сброс классов
        if (state === 'success') {
            dot.classList.add('green');
            netStatus.setAttribute('title', 'Статус сети: Облачная база промптов успешно загружена');
        } else if (state === 'error') {
            dot.classList.add('red');
            netStatus.setAttribute('title', 'Статус сети: Ошибка подключения к серверу');
        }
    }

    // Функция, которая скачивает базу из интернета при старте
    async function loadCloudData() {
        try {
            const response = await fetch(PROMPTS_URL);
            if (!response.ok) throw new Error(`Ошибка сервера: ${response.status}`);
            cloudData = await response.json();
            
            // Если интернет есть и файл скачался — зажигаем ЗЕЛЕНЫЙ неон!
            setNetworkStatus('success');
            updateQuickButtons();
        } catch (error) {
            console.error("Критическая ошибка сети GRVclarity:", error);
            // Если интернета нет — зажигаем КРАСНЫЙ огонёк, ничего не работает
            setNetworkStatus('error');
        }
    }

    // Вспомогательная функция для безопасного перехода по ссылке
    function sendRequestToGoogle(finalText) {
        if (!aiForm) return;
        const baseUrl = aiForm.getAttribute('action') || 'https://google.ru';
        const searchUrl = `${baseUrl}?hl=ru&udm=50&q=${encodeURIComponent(finalText)}`;
        
        // Умное разделение: в плагине открываем в новой вкладке, на телефоне — внешнее окно
        if (window.self !== window.top) {
            window.open(searchUrl, '_blank');
        } else {
            window.location.href = searchUrl;
        }

        setTimeout(() => {
            if (inputField) inputField.value = '';
        }, 100);
    }

    // Ваша оригинальная функция отрисовки 4 динамических кнопок
    function updateQuickButtons() {
        if (!roleSelect || !container) return;
        const selectedText = roleSelect.options[roleSelect.selectedIndex].text.trim();
        container.innerHTML = '';

        let currentButtons = cloudData[selectedText];
        
        // Хак-защита от разницы текстовых значков эмодзи весов/коробок в файле Data.json
        if (!currentButtons) {
            const keys = Object.keys(cloudData);
            const cleanText = selectedText.replace(/[^а-яа-ёа-зй-шы-ъе-я\s]/gi, '').trim();
            const matchedKey = keys.find(k => k.replace(/[^а-яа-ёа-зй-шы-ъе-я\s]/gi, '').trim() === cleanText);
            currentButtons = cloudData[matchedKey] || [];
        }
        
        currentButtons.forEach(buttonInfo => {
            const button = document.createElement('button');
            button.type = 'button'; 
            button.className = 'quick-btn';
            button.innerHTML = `<span>${buttonInfo.icon}</span> ${buttonInfo.text}`;
            
            // КЛИК ПО КНОПКЕ: Скрытая склейка, маскировка точками и отправка
            button.onclick = function(e) {
                e.preventDefault(); 
                if (!inputField) return;
                let userText = inputField.value.trim();
                
                if (!userText) {
                    inputField.reportValidity(); 
                    return;
                }

                let systemPrompt = buttonInfo.prompt || "";
                const lineSeparator = ".".repeat(120); // Маскировка точками
                let finalText = "";
                
                if (systemPrompt) {
                    finalText = `${userText} ${lineSeparator} [Настройка ИИ: ${systemPrompt}]`;
                } else {
                    let mainRole = roleSelect.value;
                    finalText = `${userText} ${lineSeparator} [Настройка ИИ: ${mainRole} / Задача: ${buttonInfo.text}]`;
                }

                sendRequestToGoogle(finalText);
            };

            container.appendChild(button);
        });
    }

    if (roleSelect) {
        roleSelect.addEventListener('change', updateQuickButtons);
    }

    // СИНИЙ КРУГЛЯШОК И ENTER: Отправляют чистый текст БЕЗ промптов
    if (aiForm) {
        aiForm.addEventListener('submit', function(e) {
            e.preventDefault(); 
            if (!inputField) return;
            let userText = inputField.value.trim();
            if (!userText) return;

            if (!userText.includes("[Настройка ИИ:")) {
                sendRequestToGoogle(userText);
            }
        });
    }

    // ЗАПУСК ОНЛАЙН-ДВИЖКА
    loadCloudData();
});
