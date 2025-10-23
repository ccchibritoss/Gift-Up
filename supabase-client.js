// supabase-client.js
class SupabaseClient {
    constructor() {
        this.client = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
    }
    
    // Получить все подарки
    async getGifts() {
        const { data, error } = await this.client
            .from('gifts')
            .select('*')
            .order('created_at', { ascending: false });
        
        return error ? [] : data;
    }
    
    // Добавить подарок (только админ)
    async addGift(giftData, userId) {
        if (userId !== CONFIG.ADMIN_ID) {
            throw new Error("Access denied");
        }
        
        const { data, error } = await this.client
            .from('gifts')
            .insert([{
                image: giftData.image,
                model: giftData.model,
                days: giftData.days,
                price: giftData.price,
                background: giftData.background,
                pattern: giftData.pattern,
                video: giftData.video,
                added_by: userId
            }]);
        
        return { success: !error, error };
    }
    
    // Арендовать подарок
    async rentGift(giftId, userId) {
        const { data, error } = await this.client
            .from('rentals')
            .insert([{
                gift_id: giftId,
                user_id: userId,
                rented_at: new Date().toISOString()
            }]);
        
        return { success: !error, error };
    }
    
    // Получить статистику пользователя
    async getUserStats(userId) {
        const { count, error } = await this.client
            .from('rentals')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);
        
        return {
            rentedGifts: error ? 0 : count,
            balance: 0 // Можно добавить логику баланса
        };
    }
    
    // Сохранить номер телефона
    async savePhoneNumber(userId, phone) {
        const { data, error } = await this.client
            .from('users')
            .upsert({ 
                id: userId,
                phone: phone,
                updated_at: new Date().toISOString()
            });
        
        return { success: !error, error };
    }
    
    // Получить данные пользователя
    async getUserData(userId) {
        const { data, error } = await this.client
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();
        
        return error ? null : data;
    }
}

// Глобальный клиент
window.supabaseClient = new SupabaseClient();
