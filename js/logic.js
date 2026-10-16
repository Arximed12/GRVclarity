document.addEventListener("DOMContentLoaded", function() {
    const roleSelect = document.getElementById('aiRole');
    const container = document.getElementById('dynamic-buttons-container');
    const aiForm = document.getElementById('aiForm');
    const inputField = document.getElementById('userQuery');

    // Адрес вашего личного облачного хранилища промптов на Vercel
    const PROMPTS_URL = './data.json';

    // Функция отрисовки 4 динамических кнопок
    function updateQuickButtons() {
        if (!roleSelect || !container) return;
        const selectedText = roleSelect.options[roleSelect.selectedIndex].text.trim();
        container.innerHTML = '';

        // Берем список кнопок из локального config.js
        const currentButtons = buttonsConfig[selectedText] || [];
        
        currentButtons.forEach(buttonInfo => {
            const button = document.createElement('button');
            button.type = 'button'; 
            button.className = 'quick-btn';
            button.innerHTML = `<span>${buttonInfo.icon}</span> ${buttonInfo.text}`;
            
            // КЛИК ПО КНОПКЕ: Облачное скачивание, склейка и авто-отправка!
            button.onclick = async function(e) {
                e.preventDefault(); 

                if (!inputField || !aiForm) return;

                let userText = inputField.value.trim();
                
                // Если поле пустое, просим заполнить перед отправкой
                if (!userText) {
                    inputField.reportValidity(); 
                    return;
                }

                // Визуальный индикатор загрузки для премиального вида
                const originalHTML = button.innerHTML;
                button.innerHTML = `<span>⏳</span> Подготовка...`;
                button.disabled = true;

                let systemPrompt = "";

                try {
                    // Асинхронно скачиваем самый свежий защищенный промпт с вашего сервера
                    const response = await fetch(PROMPTS_URL);
                    const cloudPrompts = await response.json();
                    systemPrompt = cloudPrompts[buttonInfo.text] || "";
                } catch (error) {
                    console.error("Ошибка получения промпта из облака:", error);
                }
                
                // Линия-маскировка, которая красиво прячет промпт за троеточие в чате
                const lineSeparator = " — ".repeat(40);
                
                if (systemPrompt) {
                    inputField.value = `${userText} ${lineSeparator} [Настройка ИИ: ${systemPrompt}]`;
                } else {
                    let mainRole = roleSelect.value;
                    inputField.value = `${userText} ${lineSeparator} [Настройка ИИ: ${mainRole} / Задача: ${buttonInfo.text}]`;
                }

                // Возвращаем кнопку в исходное состояние и отправляем форму
                button.innerHTML = originalHTML;
                button.disabled = false;

                aiForm.submit();

                // Моментально очищаем поле ввода в самом плагине
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

    updateQuickButtons();
});
