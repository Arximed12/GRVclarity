document.addEventListener("DOMContentLoaded", function() {
    // Привязка переменных строго к вашему актуальному HTML-каркасу
    const openWalletBtn = document.getElementById('openWalletBtn');
    const closeWalletBtn = document.getElementById('closeWalletBtn');
    const walletModal = document.getElementById('walletModal');
    const userStaticID = document.getElementById('userStaticID');
    const requestPayoutBtn = document.getElementById('requestPayoutBtn');

    // Безопасная генерация ID пользователя (не боится блокировок памяти Android)
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
            // Запасной вариант создания ID в оперативной памяти устройства
            const randomNum = Math.floor(1000 + Math.random() * 9000);
            savedID = `GRV-WEB-${randomNum}`;
        }
        userStaticID.textContent = savedID;
    }

    // Открытие и закрытие окна кошелька по клику на баланс 👛 0 ₽
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
                walletModal.classList.remove('active'); // Клик по фону мимо карточки
            }
        });
    }

    // Логика работы кнопки "Вывести средства"
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

    // Запускаем личный кабинет при загрузке
    initializeUserIdentity();
});
