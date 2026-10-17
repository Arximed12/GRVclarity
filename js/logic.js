document.addEventListener("DOMContentLoaded", function() {
    // 1. СЕЛЕКТОРЫ ГЛАВНОГО ДВИЖКА КНОПОК
    const roleSelect = document.getElementById('aiRole');
    const container = document.getElementById('dynamic-buttons-container');
    const aiForm = document.getElementById('aiForm');
    const inputField = document.getElementById('userQuery');

    // 2. СЕЛЕКТОРЫ ЛИЧНОГО КАБИНЕТА И СЕТИ
    const netStatus = document.getElementById('netStatus');
    const dot = netStatus ? netStatus.querySelector('.status-dotIndicator') : null;
    const openWalletBtn = document.getElementById('openWalletBtn');
    const closeWalletBtn = document.getElementById('closeWalletBtn');
    const walletModal = document.getElementById('walletModal');
    const userStaticID = document.getElementById('userStaticID');
    const requestPayoutBtn = document.getElementById('requestPayoutBtn');

    // Чистый путь к облачной базе данных внутри папки вашего репозитория grvclarity
    const PROMPTS_URL = './data.json';
    let cloudData = {};

    // Безопасная генерация ID пользователя (Защита от блокировок памяти Android)
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

    // Вспомогательная функция для безопасного перехода по ссылке в Google
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

    // Функция отрисовки 4 динамических кнопок
    function updateQuickButtons() {
        if (!roleSelect || !container) return;
        const selectedText = roleSelect.options[roleSelect.selectedIndex].text.trim();
        container.innerHTML = '';

        let currentButtons = cloudData[selectedText];
        
        // Защита от разницы текстовых значков эмодзи весов/коробок в файле data.json
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
            
            // КЛИК ПО КНОПКЕ: Скрытая склейка, маскировка из 120 точек и отправка
            button.onclick = function(e) {
                e.preventDefault(); 
                if (!inputField) return;
                let userText = inputField.value.trim();
                
                if (!userText) {
                    inputField.reportValidity(); 
                    return;
                }

                let systemPrompt = buttonInfo.prompt || "";
                const lineSeparator = ".".repeat(120); // Наша стена маскировки
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

    // Функция, которая скачивает всю базу при старте
    async function loadCloudData() {
        try {
            const response = await fetch(PROMPTS_URL);
            if (!response.ok) throw new Error(`Ошибка сервера: ${response.status}`);
            cloudData = await response.json();
            
            setNetworkStatus('success'); // Зажигаем зеленый неон!
            updateQuickButtons();
        } catch (error) {
            console.error("Критическая ошибка сети GRVclarity:", error);
            setNetworkStatus('error'); // Красный огонек при сбое
        }
    }

    // УПРАВЛЕНИЕ МОДАЛЬНЫМ ОКНОМ КОШЕЛЬКА
    if (openWalletBtn && walletModal) {
        openWalletBtn.addEventListener('click', function(e) {
            e.preventDefault();
            walletModal.classList.add('active');
        });
    }
    if (closeWalletBtn && walletModal) {
        closeWalletBtn.addEventListener('click', function(e) {
            e.preventDefault();
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

    // Логика кнопки "Вывести средства"
    if (requestPayoutBtn) {
        requestPayoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
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

    // БЕЗОПАСНАЯ ОТПРАВКА: синий кругляшок и Enter шлют чистый текст
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

    // СИНХРОННЫЙ ЗАПУСК ВСЕЙ ЭКОСИСТЕМЫ ПРИ СТАРТЕ
    initializeUserIdentity();
    loadCloudData();
});
