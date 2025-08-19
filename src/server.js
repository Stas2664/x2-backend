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

  // Автоимпорт из Google Sheets при старте (если настроено)
  const sheetUrl = process.env.GOOGLE_SHEETS_URL;
  if (sheetUrl) {
    console.log('🟢 Найдена переменная GOOGLE_SHEETS_URL — запущу автоимпорт корма из Google Sheets');

    const fetchCSV = (csvUrl) => new Promise((resolve, reject) => {
      https.get(csvUrl, (resp) => {
        if (resp.statusCode && resp.statusCode >= 300 && resp.statusCode < 400 && resp.headers.location) {
          return resolve(fetchCSV(resp.headers.location));
        }
        let data = '';
        resp.on('data', (chunk) => (data += chunk));
        resp.on('end', () => resolve(data));
      }).on('error', reject);
    });

    const parseCSV = (text) => {
      const rows = [];
      let i = 0, field = '', row = [], inQuotes = false;
      while (i < text.length) {
        const c = text[i];
        if (inQuotes) {
          if (c === '"') {
            if (text[i + 1] === '"') { field += '"'; i++; } else { inQuotes = false; }
          } else { field += c; }
        } else {
          if (c === '"') { inQuotes = true; }
          else if (c === ',') { row.push(field); field = ''; }
          else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
          else if (c === '\r') { /* skip */ }
          else { field += c; }
        }
        i++;
      }
      if (field.length || row.length) { row.push(field); rows.push(row); }
      return rows;
    };

    const toNumber = (v) => {
      if (v === undefined || v === null) return 0;
      if (typeof v === 'number') return v;
      const s = String(v).replace(/[^0-9,\.\-]/g, '').replace(',', '.');
      const n = parseFloat(s);
      return Number.isFinite(n) ? n : 0;
    };

    const mapType = (v) => {
      const s = String(v || '').toLowerCase();
      if (s.includes('сух')) return 'dry';
      if (s.includes('влаж')) return 'wet';
      if (s.includes('лаком') || s.includes('дополн') || s.includes('treat')) return 'treats';
      return 'dry';
    };

    const mapAnimal = (v) => {
      const s = String(v || '').toLowerCase();
      if (s.includes('кош')) return 'cat';
      if (s.includes('соб')) return 'dog';
      if (s.includes('both') || s.includes('оба')) return 'both';
      return 'dog';
    };

    const normalizeCaP = (value, header) => {
      const n = toNumber(value);
      const h = String(header || '').toLowerCase();
      if (h.includes('мг') || n > 10) return n; // уже мг/100г
      return Math.round(n * 1000); // % -> мг/100г
    };

    const run = async () => {
      try {
        let exportUrl = sheetUrl;
        if (exportUrl.includes('/edit')) {
          exportUrl = exportUrl.split('/edit')[0] + '/export?format=csv';
        } else if (!exportUrl.includes('/export')) {
          exportUrl = exportUrl + (exportUrl.includes('?') ? '&' : '?') + 'export=download&format=csv';
        }
        const csv = await fetchCSV(exportUrl);
        const rows = parseCSV(csv);
        if (!rows.length) return console.warn('⚠️ Google Sheets: пустой лист');
        const headers = rows[0].map((h) => String(h || '').trim());
        const getIndex = (...aliases) => headers.findIndex((h) => {
          const low = h.toLowerCase();
          return aliases.some((a) => low.includes(a));
        });

        const idx = {
          name: getIndex('назв', 'name'),
          brand: getIndex('бренд', 'торгов'),
          type: getIndex('тип'),
          animal: getIndex('собак', 'кош', 'вид живот'),
          category: getIndex('категор', 'назначен', 'возраст'),
          me: getIndex('мэ', 'ккал/кг', 'энерг'),
          protein: getIndex('белок'),
          fat: getIndex('жир'),
          fiber: getIndex('клетчат'),
          ash: getIndex('зола'),
          moisture: getIndex('влага', 'влажн'),
          calcium: getIndex('кальц'),
          phosphorus: getIndex('фосфор'),
          vitamin_a: getIndex('витамин а', 'vitamin a'),
          vitamin_d3: getIndex('витамин d', 'vitamin d'),
          ingredients: getIndex('ингредиент', 'состав')
        };

        const db = getDatabase();
        const clearOnImport = process.env.CLEAR_FEEDS_ON_IMPORT === '1';
        db.serialize(() => {
          if (clearOnImport) {
            db.run('DELETE FROM feeds');
          }
          const stmt = db.prepare(`
            INSERT INTO feeds (name, brand, type, animal_type, category, metabolic_energy, protein, fat, carbohydrates, fiber, ash, moisture, calcium, phosphorus, vitamin_a, vitamin_d, ingredients)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          let imported = 0;
          for (let r = 1; r < rows.length; r++) {
            const row = rows[r];
            if (!row || row.length === 0) continue;
            const name = row[idx.name] || '';
            const brand = row[idx.brand] || '';
            if (!String(name).trim()) continue;
            const type = mapType(row[idx.type]);
            const animal_type = mapAnimal(row[idx.animal]);
            const categoryRaw = String(row[idx.category] || '').toLowerCase();
            let category = 'adult';
            if (categoryRaw.includes('щен') || categoryRaw.includes('котен')) category = 'puppy';
            else if (categoryRaw.includes('пожил') || categoryRaw.includes('senior')) category = 'senior';
            else if (categoryRaw.includes('вес') || categoryRaw.includes('похуд') || categoryRaw.includes('weight')) category = 'weight_loss';
            else if (categoryRaw.includes('диет') || categoryRaw.includes('therap')) category = 'diet';

            const me = toNumber(row[idx.me]);
            const protein = toNumber(row[idx.protein]);
            const fat = toNumber(row[idx.fat]);
            const fiber = toNumber(row[idx.fiber]);
            const ash = toNumber(row[idx.ash]);
            const moisture = toNumber(row[idx.moisture]);
            let carbohydrates = 0;
            if (protein || fat || fiber || ash || moisture) {
              carbohydrates = Math.max(0, 100 - (protein + fat + fiber + ash + moisture));
            }
            const calcium = normalizeCaP(row[idx.calcium], headers[idx.calcium]);
            const phosphorus = normalizeCaP(row[idx.phosphorus], headers[idx.phosphorus]);
            const vitamin_a = toNumber(row[idx.vitamin_a]);
            const vitamin_d = toNumber(row[idx.vitamin_d3]);
            const ingredients = String(row[idx.ingredients] || '');

            stmt.run([
              String(name).trim(), String(brand).trim(), type, animal_type, category,
              me, protein, fat, carbohydrates, fiber, ash, moisture, calcium, phosphorus,
              vitamin_a, vitamin_d, ingredients
            ]);
            imported++;
          }
          stmt.finalize((err) => {
            if (err) return console.error('❌ Ошибка завершения импорта из Google:', err);
            console.log(`✅ Импорт из Google Sheets завершён: ${imported} записей`);
          });
        });
      } catch (e) {
        console.error('❌ Не удалось выполнить автоимпорт из Google Sheets:', e.message);
      }
    };

    // Старт через короткую задержку, чтобы сервер поднялся
    setTimeout(run, 1500);
  } else {
    console.log('ℹ️ Переменная GOOGLE_SHEETS_URL не указана — автоимпорт кормов отключен');
  }
}).catch(err => {
  console.error('❌ Ошибка инициализации базы данных:', err);
  console.error('Подробности:', err.message);
  process.exit(1);
}); 