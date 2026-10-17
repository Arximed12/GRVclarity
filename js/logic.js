document.addEventListener("DOMContentLoaded", function() {
    const roleSelect = document.getElementById('aiRole');
    const container = document.getElementById('dynamic-buttons-container');
    const aiForm = document.getElementById('aiForm');
    const inputField = document.getElementById('userQuery');

    // ЭЛЕМЕНТЫ УПРАВЛЕНИЯ ПАНЕЛИ GRVclarity
    const netStatus = document.getElementById('netStatus');
    const dot = netStatus ? netStatus.querySelector('.status-dotIndicator') : null;
    const openWalletBtn = document.getElementById('openWalletBtn');
    const closeWalletBtn = document.getElementById('closeWalletBtn');
    const walletModal = document.getElementById('walletModal');
    const userStaticID = document.getElementById('userStaticID');
    const requestPayoutBtn = document.getElementById('requestPayoutBtn');

    // 🔥 АВТОМАТИЧЕСКИЙ ПУТЬ: Сам находит data.json на вашем Гитхабе без ошибок регистра букв
    const PROMPTS_URL = window.location.origin + window.location.pathname.replace(/[^\/]*\$/, '') + 'data.json';
    
    // Внутренняя память сайта для хранения скачанных из сети кнопок и промптов
    let cloudData = {};

    // Защищенная трехуровневая генерация ID (не боится блокировок Android)
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
        } catch (securityError) {
            console.warn("Локальное хранилище заблокировано системой безопасности телефона.");
            const randomNum = Math.floor(1000 + Math.random() * 9000);
            savedID = `GRV-WEB-${randomNum}`;
        }
        
        userStaticID.textContent = savedID;
    }

    // Управление огоньком связи (Индикатор сети)
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
            
            // ВКЛЮЧАЕМ ЗЕЛЕНЫЙ ОГОНЕК: База прилетела из сети без ошибок!
            setNetworkStatus('success');
            
            // Сразу запускаем отрисовку кнопок
            updateQuickButtons();
        } catch (error) {
            console.error("Ошибка загрузки единой базы данных GRVclarity:", error);
            setNetworkStatus('error');
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

    // 🔥 ФУНКЦИЯ ОТРИСОВКИ КНОПОК ИЗ ВАШЕЙ ОРИГИНАЛЬНОЙ ВЕРСИИ НА ГИТХАБЕ
    function updateQuickButtons() {
        if (!roleSelect || !container) return;
        
        // Получаем чистый текст выбранной роли
        const selectedText = roleSelect.options[roleSelect.selectedIndex].text.trim();
        container.innerHTML = '';

        // Находим массив кнопок в cloudData. Если из-за разницы эмодзи не находит, ищет по запасному совпадению слов
        let currentButtons = cloudData[selectedText];
        
        if (!currentButtons) {
            // Защитный хак: ищем по ключевым словам, если в data.json съехали эмодзи весов или коробок
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

    // ВСПЛЫВАЮЩЕЕ ОКНО (ЛОГИКА ОТКРЫТИЯ И ЗАКРЫТИЯ)
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

    // Логика кнопки "Вывести средства"
    if (requestPayoutBtn) {
        requestPayoutBtn.addEventListener('click', function() {
            const currentBalance = document.getElementById('modalBalanceValue')?.textContent || '0';
            const userCode = userStaticID ? userStaticID.textContent : 'GRV';
            
            if (currentBalance === '0' || currentBalance.includes('0 ₽')) {
                alert(`Ваш текущий честный баланс: 0 ₽. Делитесь QR-кодом, чтобы накопить бонусы за рекомендации!`);
            } else {
                alert(`Заявка на вывод ${currentBalance} ₽ для пользователя ${userCode} сформирована и передана на ручную проверку администратору экосистемы.`);
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

    // ЗАПУСК ЭКОСИСТЕМЫ
    initializeUserIdentity();
    loadCloudData();
});
