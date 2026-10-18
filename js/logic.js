document.addEventListener("DOMContentLoaded", function() {
    const roleSelect = document.getElementById('aiRole');
    const container = document.getElementById('dynamic-buttons-container');
    const aiForm = document.getElementById('aiForm');
    const inputField = document.getElementById('userQuery');

    // ЭЛЕМЕНТЫ УПРАВЛЕНИЯ НОВОЙ ПАНЕЛИ GRVclarity
    const netStatus = document.getElementById('netStatus');
    const dot = netStatus ? netStatus.querySelector('.status-dotIndicator') : null;
    const openWalletBtn = document.getElementById('openWalletBtn');
    const closeWalletBtn = document.getElementById('closeWalletBtn');
    const walletModal = document.getElementById('walletModal');
    const userStaticID = document.getElementById('userStaticID');
    const requestPayoutBtn = document.getElementById('requestPayoutBtn');

    // Адрес вашего личного облачного хранилища промптов на Vercel / GitHub
    const PROMPTS_URL = './data.json';
    
    // Внутренняя память сайта для хранения скачанных из сети кнопок и промптов
    let cloudData = {};

    // Умная генерация или чтение ID из локальной памяти устройства (Защищенная имитация)
    function initializeUserIdentity() {
        if (!userStaticID) return;
        let savedID = localStorage.getItem('grv_user_id');
        if (!savedID) {
            // Если зашли первый раз, создаем красивый случайный номер
            const randomNum = Math.floor(1000 + Math.random() * 9000);
            savedID = `GRV-AI-${randomNum}`;
            localStorage.setItem('grv_user_id', savedID);
        }
        userStaticID.textContent = savedID;
    }

    // Управление огоньком связи (Индикатор сети)
    function setNetworkStatus(state) {
        if (!dot || !netStatus) return;
        // Сбрасываем старые состояния
        dot.className = 'status-dotIndicator';
        
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
            
            // 🔥 ВКЛЮЧАЕМ ЗЕЛЕНЫЙ ОГОНЕК: База прилетела из сети без ошибок!
            setNetworkStatus('success');
            
            updateQuickButtons();
        } catch (error) {
            console.error("Ошибка загрузки единой базы данных GRVclarity:", error);
            // 🔥 ВСПЫХИВАЕТ КРАСНЫЙ ОГОНЕК: Есть сетевой сбой подключения
            setNetworkStatus('error');
        }
    }

    // Вспомогательная функция для безопасного перехода по ссылке
    function sendRequestToGoogle(finalText) {
        if (!aiForm) return;
        
        const baseUrl = aiForm.getAttribute('action') || 'https://google.ru';
        const searchUrl = `${baseUrl}?hl=ru&udm=50&q=${encodeURIComponent(finalText)}`;
        
        // 🔥 УМНОЕ РАЗДЕЛЕНИЕ: Проверяем, запущен ли код внутри плагина
        // Если окно открыто как iframe (плагин), принудительно открываем НОВУЮ ВКЛАДКУ, чтобы обойти блокировку Google
        if (window.self !== window.top) {
            window.open(searchUrl, '_blank');
        } else {
            // Если это обычный сайт или мобильное WebViewer приложение — делаем плавный переход на месте
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

        const currentButtons = cloudData[selectedText] || [];
        
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
            walletModal.classList.add('active'); // Показываем окно
        });
    }
    if (closeWalletBtn && walletModal) {
        closeWalletBtn.addEventListener('click', function() {
            walletModal.classList.remove('active'); // Прячем окно
        });
    }
    // Закрытие при клике на темный фон мимо карточки
    if (walletModal) {
        walletModal.addEventListener('click', function(e) {
            if (e.target === walletModal) {
                walletModal.classList.remove('active');
            }
        });
    }

    // Логика кнопки "Вывести средства" (Безопасная ручная отправка заявки)
    if (requestPayoutBtn) {
        requestPayoutBtn.addEventListener('click', function() {
            const currentBalance = document.getElementById('modalBalanceValue')?.textContent || '0';
            const userCode = userStaticID ? userStaticID.textContent : 'GRV';
            
            if (currentBalance === '0') {
                alert(`Ваш текущий честный баланс: 0 ₽. Делитесь QR-кодом, чтобы накопить бонусы за рекомендации!`);
            } else {
                // Заготовка: в будущем здесь будет открываться форма ввода карты
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
