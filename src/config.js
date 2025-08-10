// API Configuration for VetFormuLab
const config = {
  // Локальная разработка - пробуем разные варианты подключения
  API_BASE_URL: process.env.REACT_APP_API_URL || 
    (process.env.NODE_ENV === 'production' 
      ? 'https://https://x2-backend-j0jk.onrender.com'
      : 'http://https://x2-backend-j0jk.onrender.com'),
  
  // API endpoints
  API_ENDPOINTS: {
    auth: '/api/auth',
    animals: '/api/animals', 
    feeds: '/api/feeds',
    calculations: '/api/calculations',
    health: '/api/health'
  },

  // Таймаути для запросов
  API_TIMEOUT: 15000,

  // Retry настройки
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
};

// Логирование конфигурации в development режиме
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 VetFormuLab API Config:', {
    baseURL: config.API_BASE_URL,
    environment: process.env.NODE_ENV,
    timeout: config.API_TIMEOUT
  });
}

export default config; 