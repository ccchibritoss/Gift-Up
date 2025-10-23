// auth-system.js
class AuthSystem {
    constructor() {
        this.authSteps = {};
    }
    
    // Привязка Telegram аккаунта
    async bindTelegram(userId) {
        const tg = window.Telegram.WebApp;
        
        tg.showPopup({
            title: "🔐 Привязка Telegram",
            message: "Для привязки аккаунта нам потребуется ваш номер телефона",
            buttons: [
                {id: 'share_phone', type: 'default', text: '📱 Поделиться номером'},
                {type: 'cancel', text: '❌ Отмена'}
            ]
        }, async (buttonId) => {
            if (buttonId === 'share_phone') {
                tg.requestContact(async (contact) => {
                    if (contact) {
                        await this.saveContact(contact, userId);
                        tg.showAlert("✅ Telegram аккаунт привязан!");
                        this.updateUI(userId);
                    }
                });
            }
        });
    }
    
    // Сохранение контакта в Supabase
    async saveContact(contact, userId) {
        try {
            await window.supabaseClient.savePhoneNumber(userId, contact.phone_number);
            
            // Сохраняем факт привязки
            const { error } = await supabaseClient.client
                .from('telegram_auth')
                .insert([{
                    user_id: userId,
                    phone: contact.phone_number,
                    auth_date: new Date().toISOString()
                }]);
                
        } catch (error) {
            console.error("Ошибка сохранения контакта:", error);
        }
    }
    
    // Проверка статуса привязки
    async checkAuthStatus(userId) {
        try {
            const { data, error } = await supabaseClient.client
                .from('telegram_auth')
                .select('*')
                .eq('user_id', userId)
                .single();
                
            return !!data;
        } catch (error) {
            return false;
        }
    }
    
    // Обновление интерфейса
    async updateUI(userId) {
        const isConnected = await this.checkAuthStatus(userId);
        const statusElement = document.getElementById('telegramStatus');
        const buttonElement = document.getElementById('bindTelegramBtn');
        
        if (isConnected) {
            statusElement.textContent = 'Привязан';
            statusElement.className = 'status-connected';
            if (buttonElement) buttonElement.style.display = 'none';
        }
    }
}

window.authSystem = new AuthSystem();
