document.addEventListener("DOMContentLoaded", function() {
    const roleSelect = document.getElementById('aiRole');
    const container = document.getElementById('dynamic-buttons-container');
    const aiForm = document.getElementById('aiForm');
    const inputField = document.getElementById('userQuery');

    // ЭЛЕМЕНТЫ УПРАВЛЕНИЯ ПАНЕЛИ GRVclarity (Сохраняем новые элементы)
    const netStatus = document.getElementById('netStatus');
    const dot = netStatus ? netStatus.querySelector('.status-dotIndicator') : null;
    const openWalletBtn = document.getElementById('openWalletBtn');
    const closeWalletBtn = document.getElementById('closeWalletBtn');
    const walletModal = document.getElementById('walletModal');
    const userStaticID = document.getElementById('userStaticID');
    const requestPayoutBtn = document.getElementById('requestPayoutBtn');

    // 🔥 ИСПРАВЛЕНО: Универсальный путь, который намертво связывает телефон и сайт с вашим файлом в сети
    const PROMPTS_URL = 'https://github.io';
    
    // Внутренняя память сайта для хранения скачанных из сети кнопок и промптов
    let cloudData = {};

    // 🔥 ДОБАВЛЕНО: Безопасное создание ID пользователя для личного кабинета
    function initializeUserIdentity() {
        if (!userStaticID) return;
        let savedID = null;
        try {
            savedID = localStorage.getItem('grv_user_id');
            if (!savedID) {
                const randomNum = Math.floor(1000 + Math.random() * 9000);
                savedID = `GRV-AI-${randomNum}`;
                localStorage.setItem('grv_user_id', savedID);
            }
        } catch (e) {
            const randomNum = Math.floor(1000 + Math.random() * 9000);
            savedID = `GRV-WEB-${randomNum}`;
        }
        userStaticID.textContent = savedID;
    }

    // 🔥 ДОБАВЛЕНО: Управление огоньком связи (Индикатор сети)
    function setNetworkStatus(state) {
        if (!dot || !netStatus) return;
        dot.className = 'status-dotIndicator'; // Сброс
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
            
            // Зажигаем зеленый огонек при успешной загрузке
            setNetworkStatus('success');
            updateQuickButtons();
        } catch (error) {
            console.error("Ошибка загрузки единой базы данных:", error);
            // Зажигаем красный огонек при сбое
            setNetworkStatus('error');
        }
    }

    // Вспомогательная функция для безопасного перехода по ссылке
    function sendRequestToGoogle(finalText) {
        if (!aiForm) return;
        
        const baseUrl = aiForm.getAttribute('action') || 'https://google.ru';
        const searchUrl = `${baseUrl}?hl=ru&udm=50&q=${encodeURIComponent(finalText)}`;
        
        // Умное разделение: плагин открывает в новом окне, телефон — на месте
        if (window.self !== window.top) {
            window.open(searchUrl, '_blank');
        } else {
            window.location.href = searchUrl;
        }

        setTimeout(() => {
            if (inputField) inputField.value = '';
        }, 100);
    }

    // 🔥 ВАША ОРИГИНАЛЬНАЯ ФУНКЦИЯ ОТРИСОВКИ КНОПОК С АВТОПОДБОРОМ ЭМОДЗИ
    function updateQuickButtons() {
        if (!roleSelect || !container) return;
        const selectedText = roleSelect.options[roleSelect.selectedIndex].text.trim();
        container.innerHTML = '';

        // Ищем массив кнопок в cloudData
        let currentButtons = cloudData[selectedText];
        
        // Хак-защита от разницы текстовых значков эмодзи весов/коробок в файле data.json
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
            
            // КЛИК ПО КНОПКЕ: Скрытая склейка, пустые строки-маскировка и отправка!
            button.onclick = function(e) {
                e.preventDefault(); 

                if (!inputField) return;
                let userText = inputField.value.trim();
                
                if (!userText) {
                    inputField.reportValidity(); 
                    return;
                }

                let systemPrompt = buttonInfo.prompt || "";
                // Плавная скрытая маскировка на 100 строк вниз
                const lineSeparator = "\n".repeat(100);
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

    // 🔥 ДОБАВЛЕНО: ВСПЛЫВАЮЩЕЕ ОКНО КОШЕЛЬКА (ОТКРЫТИЕ И ЗАКРЫТИЕ)
    if (openWalletBtn && walletModal) {
        openWalletBtn.addEventListener('click', function() {
            walletModal.classList.add('active');
        });
    }
    if (closeWalletBtn && walletModal) {
        closeWalletBtn.addEventListener('click', function() {
            walletModal.classList.remove('active');
        });
    }
    if (walletModal) {
        walletModal.addEventListener('click', function(e) {
            if (e.target === walletModal) {
                walletModal.classList.remove('active');
            }
        });
    }

    // 🔥 ДОБАВЛЕНО: Логика кнопки "Вывести средства"
    if (requestPayoutBtn) {
        requestPayoutBtn.addEventListener('click', function() {
            const currentBalance = document.getElementById('modalBalanceValue')?.textContent || '0';
            const userCode = userStaticID ? userStaticID.textContent : 'GRV';
            
            if (currentBalance === '0' || currentBalance.includes('0 ₽')) {
                alert(`Ваш текущий честный баланс: 0 ₽. Делитесь QR-кодом, чтобы накопить бонусы за рекомендации!`);
            } else {
                alert(`Заявка на вывод ${currentBalance} для пользователя ${userCode} сформирована и передана на проверку.`);
            }
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

            if (!userText.includes("[Настройка ИИ:")) {
                sendRequestToGoogle(userText);
            }
        });
    }

    // ЗАПУСК ПОЛНОЙ ЭКОСИСТЕМЫ
    initializeUserIdentity();
    loadCloudData();
});
