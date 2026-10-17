document.addEventListener("DOMContentLoaded", function() {
    const roleSelect = document.getElementById('aiRole');
    const container = document.getElementById('dynamic-buttons-container');
    const aiForm = document.getElementById('aiForm');
    const inputField = document.getElementById('userQuery');

    const netStatus = document.getElementById('netStatus');
    const dot = netStatus ? netStatus.querySelector('.status-dotIndicator') : null;

    // Использование строгого относительного пути к файлу конфигурации в одном домене
    const PROMPTS_URL = './data.json';
    let cloudData = {};

    function setNetworkStatus(state) {
        if (!dot || !netStatus) return;
        dot.className = 'status-dotIndicator';
        if (state === 'success') {
            dot.classList.add('green');
            netStatus.setAttribute('title', 'Статус сети: Облачная база промптов успешно загружена');
        } else if (state === 'error') {
            dot.classList.add('red');
            netStatus.setAttribute('title', 'Статус сети: Критическая ошибка загрузки конфигурации');
        }
    }

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

    function updateQuickButtons() {
        if (!roleSelect || !container) return;
        const selectedText = roleSelect.options[roleSelect.selectedIndex].text.trim();
        container.innerHTML = '';

        let currentButtons = cloudData[selectedText];
        
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
                
                // Контекст лимита 60: валидация длины строки для маркетплейсов
                if (selectedText.includes("Маркетплейсы") && buttonInfo.text.includes("SEO") && userText.length > 60) {
                    userText = userText.substring(0, 60);
                    console.warn("Внимание: Заголовок автоматически усечен до 60 символов согласно лимитам SEO Google.");
                }

                const lineSeparator = ".".repeat(120);
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

    async function loadCloudData() {
        try {
            const response = await fetch(PROMPTS_URL);
            if (!response.ok) throw new Error(`Status: ${response.status}`);
            cloudData = await response.json();
            setNetworkStatus('success');
            updateQuickButtons();
        } catch (error) {
            console.error("Ошибка асинхронного вызова loadCloudData:", error);
            setNetworkStatus('error');
        }
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

            if (!userText.includes("[Настройка ИИ:")) {
                sendRequestToGoogle(userText);
            }
        });
    }

    // Запуск строго после полной декларации функций во избежание референс-ошибок Hoisting
    loadCloudData();
});
