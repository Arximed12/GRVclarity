document.addEventListener("DOMContentLoaded", function() {
    const roleSelect = document.getElementById('aiRole');
    const container = document.getElementById('dynamic-buttons-container');
    const aiForm = document.getElementById('aiForm');
    const inputField = document.getElementById('userQuery');

    // ЭЛЕМЕНТЫ СЕТЕВОГО ИНДИКАТОРА
    const netStatus = document.getElementById('netStatus');
    const dot = netStatus ? netStatus.querySelector('.status-dotIndicator') : null;

    // 🔥 УНИВЕРСАЛЬНЫЙ АДРЕС: Стабильно находит базу data.json на сайте, в плагине и на смартфонах
    const PROMPTS_URL = 'https://github.io';
    let cloudData = {};

    // Управление огоньком связи (Индикатор сети)
    function setNetworkStatus(state) {
        if (!dot || !netStatus) return;
        dot.className = 'status-dotIndicator'; // Сброс классов цвета
        if (state === 'success') {
            dot.classList.add('green');
            netStatus.setAttribute('title', 'Статус сети: База промптов успешно загружена');
        } else if (state === 'error') {
            dot.classList.add('red');
            netStatus.setAttribute('title', 'Статус сети: Ошибка подключения к серверу');
        }
    }

    // Функция, которая скачивает всю базу из интернета при старте
    async function loadCloudData() {
        try {
            const response = await fetch(PROMPTS_URL);
            cloudData = await response.json();
            setNetworkStatus('success'); // Зажигаем зеленый огонек сети
            updateQuickButtons();
        } catch (error) {
            console.error("Ошибка загрузки единой базы данных GRVclarity:", error);
            setNetworkStatus('error'); // Зажигаем красный огонек сбоя
        }
    }

    // Вспомогательная функция для безопасного перехода по ссылке
    function sendRequestToGoogle(finalText) {
        if (!aiForm) return;
        const baseUrl = aiForm.getAttribute('action') || 'https://google.ru';
        const searchUrl = `${baseUrl}?hl=ru&udm=50&q=${encodeURIComponent(finalText)}`;
        
        if (window.self !== window.top) {
            window.open(searchUrl, '_blank');
        } else {
            window.location.href = searchUrl;
        }

        setTimeout(() => {
            if (inputField) inputField.value = '';
        }, 100);
    }

    // Ваша оригинальная функция отрисовки 4 динамических кнопок с защитой эмодзи
    function updateQuickButtons() {
        if (!roleSelect || !container) return;
        const selectedText = roleSelect.options[roleSelect.selectedIndex].text.trim();
        container.innerHTML = '';

        let currentButtons = cloudData[selectedText];
        
        // Хак-защита от разницы текстовых символов эмодзи весов/коробок в файле data.json
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
            
            button.onclick = function(e) {
                e.preventDefault(); 
                if (!inputField) return;

                let userText = inputField.value.trim();
                if (!userText) {
                    inputField.reportValidity(); 
                    return;
                }

                let systemPrompt = buttonInfo.prompt || "";
                const lineSeparator = ".".repeat(120); // Оптимальная маскировка точками
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

    if (aiForm) {
        aiForm.addEventListener('submit', function(e) {
            e.preventDefault(); 
            if (!inputField) return;
            let userText = inputField.value.trim();
            if (!userText) return;

            sendRequestToGoogle(userText);
        });
    }

    // ЗАПУСК ДВИЖКА
    loadCloudData();
});
