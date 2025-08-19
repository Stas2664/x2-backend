// Загружаем переменные окружения
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const https = require('https');
const { getDatabase } = require('./database');

const { initDatabase } = require('./database');
const animalsRouter = require('./routes/animals');
const feedsRouter = require('./routes/feeds');
const calculationsRouter = require('./routes/calculations');
const { router: authRouter } = require('./routes/auth');
const syncRouter = require('./routes/sync');

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
app.use('/api/sync', syncRouter);

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
      calculations: '/api/calculations',
      sync: '/api/sync'
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
      available_endpoints: ['/api/health', '/api/auth', '/api/animals', '/api/feeds', '/api/calculations', '/api/sync']
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

  // Автоимпорт из Google Sheets при старте (если настроено)
  const sheetUrl = process.env.GOOGLE_SHEETS_URL;
  if (sheetUrl) {
    console.log('🟢 Найдена переменная GOOGLE_SHEETS_URL — запущу автоимпорт корма из Google Sheets');
    
    // Импортируем сервис Google Sheets
    const googleSheetsService = require('./services/googleSheets');
    
    const runAutoImport = async () => {
      try {
        // Инициализируем сервис
        const initialized = await googleSheetsService.initialize();
        if (!initialized) {
          console.log('⚠️ Google Sheets сервис не инициализирован — пропускаю автоимпорт');
          return;
        }

        // Получаем данные
        const feedsData = await googleSheetsService.getFeedsData();
        if (feedsData.length === 0) {
          console.log('⚠️ Google Sheets: нет данных для импорта');
          return;
        }

        console.log(`📊 Получено ${feedsData.length} кормов из Google Sheets`);

        const db = getDatabase();
        const clearOnImport = process.env.CLEAR_FEEDS_ON_IMPORT === '1';
        
        db.serialize(() => {
          if (clearOnImport) {
            db.run('DELETE FROM feeds WHERE user_id IS NULL', (err) => {
              if (err) {
                console.error('❌ Ошибка при очистке старых кормов:', err);
                return;
              }
              console.log('🗑️ Старые публичные корма удалены');
            });
          }

          const stmt = db.prepare(`
            INSERT INTO feeds (
              user_id, name, brand, type, animal_type, category, metabolic_energy, 
              protein, fat, carbohydrates, fiber, ash, moisture, calcium, phosphorus,
              sodium, potassium, magnesium, iron, zinc, copper, manganese, selenium, iodine,
              vitamin_a, vitamin_d, vitamin_e, vitamin_k, vitamin_b1, vitamin_b2, vitamin_b3,
              vitamin_b5, vitamin_b6, vitamin_b7, vitamin_b9, vitamin_b12, vitamin_c,
              ingredients, notes, price_per_kg, is_available, is_public, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);

          let imported = 0;
          let errors = 0;

          feedsData.forEach((feed) => {
            const values = [
              null, // user_id (NULL для публичных кормов)
              feed.name,
              feed.brand,
              feed.type,
              feed.animal_type,
              feed.category,
              feed.metabolic_energy,
              feed.protein,
              feed.fat,
              feed.carbohydrates,
              feed.fiber,
              feed.ash,
              feed.moisture,
              feed.calcium,
              feed.phosphorus,
              feed.sodium,
              feed.potassium,
              feed.magnesium,
              feed.iron,
              feed.zinc,
              feed.copper,
              feed.manganese,
              feed.selenium,
              feed.iodine,
              feed.vitamin_a,
              feed.vitamin_d,
              feed.vitamin_e,
              feed.vitamin_k,
              feed.vitamin_b1,
              feed.vitamin_b2,
              feed.vitamin_b3,
              feed.vitamin_b5,
              feed.vitamin_b6,
              feed.vitamin_b7,
              feed.vitamin_b9,
              feed.vitamin_b12,
              feed.vitamin_c,
              feed.ingredients,
              feed.notes,
              feed.price_per_kg,
              feed.is_available ? 1 : 0,
              feed.is_public ? 1 : 0,
              new Date().toISOString(),
              new Date().toISOString()
            ];

            stmt.run(values, function(err) {
              if (err) {
                console.error(`❌ Ошибка при вставке корма ${feed.name}:`, err);
                errors++;
              } else {
                imported++;
                console.log(`✅ Импортирован корм: ${feed.name} (${feed.brand})`);
              }

              if (imported + errors === feedsData.length) {
                stmt.finalize((finalizeErr) => {
                  if (finalizeErr) {
                    console.error('❌ Ошибка завершения автоимпорта:', finalizeErr);
                  } else {
                    console.log(`✅ Автоимпорт из Google Sheets завершён: ${imported} кормов импортировано, ${errors} ошибок`);
                  }
                });
              }
            });
          });
        });

      } catch (error) {
        console.error('❌ Ошибка автоимпорта из Google Sheets:', error.message);
      }
    };

    // Старт через короткую задержку, чтобы сервер поднялся
    setTimeout(runAutoImport, 1500);
  } else {
    console.log('ℹ️ Переменная GOOGLE_SHEETS_URL не указана — автоимпорт кормов отключен');
  }
}).catch(err => {
  console.error('❌ Ошибка инициализации базы данных:', err);
  console.error('Подробности:', err.message);
  process.exit(1);
}); 