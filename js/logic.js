document.addEventListener("DOMContentLoaded", function() {
    const roleSelect = document.getElementById('aiRole');
    const container = document.getElementById('dynamic-buttons-container');
    const aiForm = document.getElementById('aiForm');
    const inputField = document.getElementById('userQuery');
    
    // Элементы управления статус-бара и модального окна
    const netStatus = document.getElementById('netStatus');
    const dot = netStatus ? netStatus.querySelector('.status-dotIndicator') : null;
    const openWalletBtn = document.getElementById('openWalletBtn');
    const closeWalletBtn = document.getElementById('closeWalletBtn');
    const walletModal = document.getElementById('walletModal');
    const userStaticID = document.getElementById('userStaticID');
    const requestPayoutBtn = document.getElementById('requestPayoutBtn');
    
    const PROMPTS_URL = './data.json';
    let cloudData = {};

    // Генерация и сессия ID пользователя фемто-уровня
    function initializeUserIdentity() {
        if (!userStaticID) return;
        let savedID = localStorage.getItem('grv_user_id');
        if (!savedID) {
            const randomNum = Math.floor(1000 + Math.random() * 9000);
            savedID = `GRV-AI-${randomNum}`;
            localStorage.setItem('grv_user_id', savedID);
        }
        userStaticID.textContent = savedID;
    }

    function setNetworkStatus(state) {
        if (!dot || !netStatus) return;
        dot.className = 'status-dotIndicator';
        if (state === 'success') {
            dot.classList.add('green');
            netStatus.setAttribute('title', 'Сеть: База промптов успешно загружена');
        } else if (state === 'error') {
            dot.classList.add('red');
            netStatus.setAttribute('title', 'Сеть: Ошибка загрузки облачной конфигурации');
        }
    }

    async function loadCloudData() {
        try {
            const response = await fetch(PROMPTS_URL);
            cloudData = await response.json();
            setNetworkStatus('success');
            updateQuickButtons();
        } catch (error) {
            console.error("Критический сбой инициализации данных:", error);
            setNetworkStatus('error');
        }
    }

    // Безвредный метод передачи контекста без вызова ERR_CONNECTION_ABORTED
    function sendRequestToGoogle(finalText) {
        if (!aiForm || !inputField) return;
        
        // Передаем склеенные данные в инпут и выполняем штатную отправку формы
        inputField.value = finalText;
        aiForm.submit();
        
        // Очищаем поле с микрозадержкой, чтобы поток отправки успел сериализовать строку
        setTimeout(() => {
            inputField.value = '';
        }, 150);
    }

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

    // Логика переключения состояния модального интерфейса кошелька
    if (openWalletBtn && walletModal) {
        openWalletBtn.addEventListener('click', () => walletModal.classList.add('active'));
    }
    if (closeWalletBtn && walletModal) {
        closeWalletBtn.addEventListener('click', () => walletModal.classList.remove('active'));
    }
    if (walletModal) {
        walletModal.addEventListener('click', (e) => {
            if (e.target === walletModal) walletModal.classList.remove('active');
        });
    }

    if (requestPayoutBtn) {
        requestPayoutBtn.addEventListener('click', function() {
            const currentBalance = document.getElementById('modalBalanceValue')?.textContent || '0';
            const userCode = userStaticID ? userStaticID.textContent : 'GRV';
            if (currentBalance === '0') {
                alert(`Ваш текущий баланс: 0 ₽. Накапливайте бонусы через реферальный QR-код.`);
            } else {
                alert(`Заявка на вывод ${currentBalance} ₽ (Пользователь ${userCode}) успешно отправлена на ручную верификацию.`);
            }
        });
    }

    if (roleSelect) roleSelect.addEventListener('change', updateQuickButtons);
    
    if (aiForm) {
        aiForm.addEventListener('submit', function(e) {
            e.preventDefault();
            let userText = inputField.value.trim();
            if (!userText) return;
            if (!userText.includes("[Настройка ИИ:")) {
                sendRequestToGoogle(userText);
            }
        });
    }

    initializeUserIdentity();
    loadCloudData();
});
