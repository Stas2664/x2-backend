const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const { initDatabase } = require('./database');
const animalsRouter = require('./routes/animals');
const feedsRouter = require('./routes/feeds');
const calculationsRouter = require('./routes/calculations');
const { router: authRouter } = require('./routes/auth');

const app = express();

// ======== CORS CONFIGURATION ========
const allowedOrigins = [
  "http://localhost:3000",
  "https://x2-frontend-gmwx.vercel.app"
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));
// ====================================


// ======== CORS CONFIGURATION ========





// ====================================


// ======== CORS CONFIGURATION ========





// ====================================

const PORT = process.env.PORT || 3001;

// CORS конфигурация для отдельного фронтенда


// Middleware

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Логирование всех запросов для диагностики
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check - улучшенная версия
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'VetFormuLab Backend API работает!',
    env: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    port: PORT,
    cors: 'enabled'
  });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/animals', animalsRouter);
app.use('/api/feeds', feedsRouter);
app.use('/api/calculations', calculationsRouter);

// API информация на главной странице
app.get('/', (req, res) => {
  res.json({ 
    message: 'VetFormuLab API Server работает!', 
    status: 'running',
    version: '1.0.0',
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      animals: '/api/animals',
      feeds: '/api/feeds',
      calculations: '/api/calculations'
    },
    cors: {
      enabled: true,
      origins: corsOptions.origin
    },
    documentation: 'API для VetFormuLab - профессиональной платформы расчета питания животных'
  });
});

// 404 для всех остальных маршрутов
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    res.status(404).json({ 
      error: 'API endpoint not found', 
      available_endpoints: ['/api/health', '/api/auth', '/api/animals', '/api/feeds', '/api/calculations']
    });
  } else {
    res.status(404).json({ 
      error: 'Not Found', 
      message: 'Это API сервер. Фронтенд находится на отдельном домене.',
      api_url: `${req.protocol}://${req.get('host')}/api/health`
    });
  }
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error('Ошибка сервера:', err);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

// Инициализация базы данных
console.log('🔄 Запуск VetFormuLab Backend сервера...');
console.log('📁 Рабочая директория:', process.cwd());
console.log('🔧 Node.js версия:', process.version);

initDatabase().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log('=====================================');
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    console.log(`📖 API документация: http://localhost:${PORT}/api/health`);
    console.log(`🌐 Сервер доступен по адресу: http://localhost:${PORT}`);
    console.log(`✅ CORS настроен для: ${allowedOrigins.join(', ')}`);
    console.log('=====================================');
  });
}).catch(err => {
  console.error('❌ Ошибка инициализации базы данных:', err);
  console.error('Подробности:', err.message);
  process.exit(1);
}); 