// supabase-client.js
class SupabaseClient {
    constructor() {
        this.client = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
    }
    
    // ИСПРАВЛЕННОЕ сохранение номера телефона
    async savePhoneNumber(userId, phone) {
        try {
            const { data, error } = await this.client
                .from('users')
                .upsert({ 
                    user_id: userId,
                    phone: phone,
                    updated_at: new Date().toISOString()
                });
            
            return { success: !error, error };
        } catch (error) {
            console.error('Supabase save error:', error);
            return { success: false, error };
        }
    }
    
    // Получаем статус привязки Telegram
    async getTelegramBindStatus(userId) {
        try {
            const { data, error } = await this.client
                .from('telegram_binds')
                .select('*')
                .eq('user_id', userId)
                .single();
            
            return !error && data;
        } catch (error) {
            return false;
        }
    }
    
    // Получаем данные пользователя
    async getUserData(userId) {
        try {
            const { data, error } = await this.client
                .from('users')
                .select('*')
                .eq('user_id', userId)
                .single();
            
            return error ? null : data;
        } catch (error) {
            return null;
        }
    }
    
    // Остальные методы
    async getGifts() {
        try {
            const { data, error } = await this.client
                .from('gifts')
                .select('*')
                .order('created_at', { ascending: false });
            
            return error ? [] : data;
        } catch (error) {
            return [];
        }
    }
    
    async rentGift(giftId, userId) {
        try {
            const { data, error } = await this.client
                .from('rentals')
                .insert([{
                    gift_id: giftId,
                    user_id: userId,
                    rented_at: new Date().toISOString()
                }]);
            
            return { success: !error, error };
        } catch (error) {
            return { success: false, error };
        }
    }
    
    async getUserStats(userId) {
        try {
            const { count, error } = await this.client
                .from('rentals')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId);
            
            return {
                rentedGifts: error ? 0 : count,
                myGifts: 0,
                balance: 0
            };
        } catch (error) {
            return { rentedGifts: 0, myGifts: 0, balance: 0 };
        }
    }
}

window.supabaseClient = new SupabaseClient();
