// Конфигурация приложения
const CONFIG = {
    // Иконки навигации (замени на свои URL)
    RENT_ICON: "https://raw.githubusercontent.com/ccchibritoss/Gift-Up/main/icons/rent.png",
    PROFILE_ICON: "https://raw.githubusercontent.com/ccchibritoss/Gift-Up/main/icons/profile.png",
    
    // Настройки бэкенда
    API_URL: "https://your-app.herokuapp.com",
    
    // Админ (никому не говори!)
    ADMIN_ID: "7773057702",
    
    // Настройки Telegram бота
    BOT_USERNAME: "YourGiftUpBot"
};

// Инициализация иконок при загрузке
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('rentIcon').src = CONFIG.RENT_ICON;
    document.getElementById('profileIcon').src = CONFIG.PROFILE_ICON;
});
