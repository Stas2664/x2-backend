const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;

// Простая CORS настройка
app.use(cors({
  origin: ['http://localhost:3000'],
  credentials: true
}));

app.use(express.json());

// Тестовый health endpoint
app.get('/api/health', (req, res) => {
  console.log('✅ Health check вызван');
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Тестовый сервер работает!'
  });
});

// Простой тестовый endpoint для кормов
app.get('/api/feeds', (req, res) => {
  console.log('✅ Feeds endpoint вызван');
  res.json({
    feeds: [
      {
        id: 1,
        name: "Тестовый корм",
        brand: "Test Brand",
        type: "повседневный",
        animal_type: "собака"
      }
    ],
    total: 1
  });
});

// Простая аутентификация
app.post('/api/auth/login', (req, res) => {
  console.log('✅ Login endpoint вызван');
  const { email, password } = req.body;
  
  if (email === 'demo@clinic.com' && password === 'demo123') {
    res.json({
      token: 'test-token-123',
      user: {
        id: 1,
        email: 'demo@clinic.com',
        clinic_name: 'Тестовая клиника'
      }
    });
  } else {
    res.status(401).json({ error: 'Неверные данные' });
  }
});

// Запуск сервера
app.listen(PORT, '0.0.0.0', () => {
  console.log('=====================================');
  console.log(`🚀 ТЕСТОВЫЙ СЕРВЕР запущен на порту ${PORT}`);
  console.log(`🌐 Адрес: http://localhost:${PORT}`);
  console.log(`🔍 Health: http://localhost:${PORT}/api/health`);
  console.log(`📊 Feeds: http://localhost:${PORT}/api/feeds`);
  console.log('=====================================');
});

console.log('🔄 Запуск тестового сервера...');
console.log('📁 Рабочая директория:', process.cwd());
console.log('🔧 Node.js версия:', process.version); 