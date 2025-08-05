const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Поддержка переменной окружения для пути к базе данных
const dbPath = process.env.SQLITE_DATABASE_PATH || path.join(__dirname, '../data/vetformulab.db');
let db = null;

// Создаем директорию для базы данных, если её нет
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log(`📁 Создана директория для базы данных: ${dbDir}`);
}

const connectDatabase = () => {
  return new Promise((resolve, reject) => {
    console.log(`🔗 Подключение к базе данных: ${dbPath}`);
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('❌ Ошибка подключения к SQLite:', err);
        reject(err);
      } else {
        console.log(`✅ Подключение к SQLite базе данных установлено: ${dbPath}`);
        resolve();
      }
    });
  });
};

const createTables = () => {
  return new Promise((resolve, reject) => {
    // Создаем таблицы в правильном порядке (пользователи первые)
    const queries = [
      // Таблица пользователей (ветклиники)
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        clinic_name TEXT NOT NULL,
        clinic_phone TEXT,
        clinic_address TEXT,
        contact_person TEXT,
        is_active INTEGER DEFAULT 1,
        subscription_type TEXT DEFAULT 'basic',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Обновленная таблица животных с user_id
      `CREATE TABLE IF NOT EXISTS animals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        species TEXT NOT NULL CHECK (species IN ('dog', 'cat', 'ferret')),
        weight REAL NOT NULL,
        age INTEGER NOT NULL,
        gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
        breed TEXT,
        is_neutered BOOLEAN DEFAULT 0,
        activity_level TEXT NOT NULL CHECK (activity_level IN ('low', 'moderate', 'high', 'very_high')),
        physiological_state TEXT DEFAULT 'normal' CHECK (physiological_state IN ('normal', 'pregnant', 'lactating', 'growing', 'senior', 'overweight', 'underweight')),
        metabolic_energy_need REAL,
        owner_name TEXT,
        owner_phone TEXT,
        medical_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )`,
      
      // Таблица кормов (может быть общей или привязанной к пользователю)
      `CREATE TABLE IF NOT EXISTS feeds (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NULL,
        name TEXT NOT NULL,
        brand TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('dry', 'wet', 'raw', 'treats')),
        animal_type TEXT NOT NULL CHECK (animal_type IN ('dog', 'cat', 'both')),
        category TEXT NOT NULL CHECK (category IN ('kitten', 'puppy_small', 'puppy_medium', 'puppy_large', 'adult', 'senior', 'weight_loss', 'diet', 'special')),
        metabolic_energy REAL NOT NULL,
        protein REAL,
        fat REAL,
        carbohydrates REAL,
        fiber REAL,
        ash REAL,
        moisture REAL,
        calcium INTEGER,
        phosphorus INTEGER,
        sodium INTEGER,
        potassium INTEGER,
        magnesium INTEGER,
        iron INTEGER,
        zinc INTEGER,
        copper INTEGER,
        manganese INTEGER,
        selenium REAL,
        iodine INTEGER,
        vitamin_a INTEGER,
        vitamin_d INTEGER,
        vitamin_e INTEGER,
        vitamin_k INTEGER,
        vitamin_b1 REAL,
        vitamin_b2 REAL,
        vitamin_b3 REAL,
        vitamin_b5 REAL,
        vitamin_b6 REAL,
        vitamin_b7 REAL,
        vitamin_b9 REAL,
        vitamin_b12 REAL,
        vitamin_c INTEGER,
        ingredients TEXT,
        notes TEXT,
        price_per_kg REAL,
        is_available BOOLEAN DEFAULT 1,
        is_public BOOLEAN DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
      )`,
      
      // Обновленная таблица сравнений с user_id
      `CREATE TABLE IF NOT EXISTS comparisons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        animal_id INTEGER NOT NULL,
        feed_ids TEXT NOT NULL,
        comparison_data TEXT NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (animal_id) REFERENCES animals (id) ON DELETE CASCADE
      )`
    ];

    let completed = 0;
    let hasError = false;

    queries.forEach((query, index) => {
      db.run(query, (err) => {
        if (err && !hasError) {
          console.error(`Ошибка создания таблицы ${index + 1}:`, err);
          hasError = true;
          reject(err);
          return;
        }
        
        completed++;
        if (completed === queries.length && !hasError) {
          console.log('✅ Все таблицы созданы успешно');
          resolve();
        }
      });
    });
  });
};

const insertSampleData = () => {
  return new Promise((resolve, reject) => {
    console.log('🔄 Принудительная перезагрузка кормов из JSON...');
    
    // Удаляем все существующие публичные корма
    db.run('DELETE FROM feeds WHERE user_id IS NULL', (err) => {
      if (err) {
        console.error('❌ Ошибка при очистке старых кормов:', err);
        reject(err);
        return;
      }
      
      console.log('🗑️ Старые корма удалены');
      
      // Загружаем данные из JSON файла
      let feedsData;
      try {
        const jsonPath = path.join(__dirname, '../data/feeds_database.json');
        const jsonContent = fs.readFileSync(jsonPath, 'utf8');
        feedsData = JSON.parse(jsonContent);
        console.log(`📦 Загружено ${feedsData.feeds.length} кормов из JSON`);
      } catch (error) {
        console.error('❌ Ошибка чтения JSON файла:', error);
        reject(error);
        return;
      }

      // Функции нормализации
      const normalizeAnimalType = (type) => {
        const map = { 'собака': 'dog', 'кошка': 'cat' };
        return map[type] || type;
      };

      const normalizeLifeStage = (stage) => {
        const map = { 
          'взрослый': 'adult', 
          'щенок': 'puppy_medium', 
          'котенок': 'kitten',
          'пожилой': 'senior'
        };
        return map[stage] || 'adult';
      };

      const normalizeFeedType = (type) => {
        const map = { 
          'лечебный': 'diet',
          'повседневный': 'adult'
        };
        return map[type] || 'adult';
      };

      // Подготавливаем данные для вставки
      const sampleFeeds = feedsData.feeds.map(feed => ({
        name: feed.name,
        brand: feed.brand,
        type: 'dry',
        animal_type: normalizeAnimalType(feed.animal_type),
        category: feed.type === 'лечебный' ? 'diet' : normalizeLifeStage(feed.life_stage),
        metabolic_energy: Math.round(feed.energy.metabolizable_energy / 10), // конвертируем в ккал/100г
        protein: feed.composition.crude_protein,
        fat: feed.composition.crude_fat,
        carbohydrates: feed.composition.nfe,
        fiber: feed.composition.crude_fiber,
        ash: feed.composition.ash,
        moisture: feed.composition.moisture,
        calcium: Math.round((feed.composition.calcium || 0) * 1000), // конвертируем в мг
        phosphorus: Math.round((feed.composition.phosphorus || 0) * 1000), // конвертируем в мг
        sodium: Math.round((feed.composition.sodium || 0) * 1000), // конвертируем в мг
        potassium: Math.round((feed.composition.potassium || 0) * 1000), // конвертируем в мг
        magnesium: Math.round((feed.composition.magnesium || 0) * 1000), // конвертируем в мг
        iron: Math.round(feed.composition.iron || 0),
        zinc: Math.round(feed.composition.zinc || 0),
        copper: Math.round(feed.composition.copper || 0),
        manganese: Math.round(feed.composition.manganese || 0),
        selenium: feed.composition.selenium || 0,
        iodine: Math.round(feed.composition.iodine || 0),
        vitamin_a: Math.round(feed.vitamins.vitamin_a || 0),
        vitamin_d: Math.round(feed.vitamins.vitamin_d3 || 0),
        vitamin_e: Math.round(feed.vitamins.vitamin_e || 0),
        vitamin_k: feed.vitamins.vitamin_k || 0,
        vitamin_b1: feed.vitamins.vitamin_b1 || 0,
        vitamin_b2: feed.vitamins.vitamin_b2 || 0,
        vitamin_b6: feed.vitamins.vitamin_b6 || 0,
        vitamin_b12: feed.vitamins.vitamin_b12 || 0,
        ingredients: feed.ingredients || 'Состав уточняется',
        price_per_kg: 1000, // Примерная цена
        is_public: 1
      }));

      // Вставляем корма пакетами для избежания проблем с размером запроса
      let insertedCount = 0;
      const batchSize = 10;
      
      const insertBatch = (startIndex) => {
        if (startIndex >= sampleFeeds.length) {
          console.log(`\n✅ Успешно загружено ${insertedCount} кормов!`);
          console.log('📊 Статистика:');
          
          const dogFeeds = sampleFeeds.filter(f => f.animal_type === 'dog').length;
          const catFeeds = sampleFeeds.filter(f => f.animal_type === 'cat').length;
          const brands = [...new Set(sampleFeeds.map(f => f.brand))].length;
          
          console.log(`🐕 Для собак: ${dogFeeds}`);
          console.log(`🐱 Для кошек: ${catFeeds}`);
          console.log(`🏷️ Брендов: ${brands}`);
          console.log(`📦 Всего кормов: ${sampleFeeds.length}`);
          
          resolve();
          return;
        }
        
        const batch = sampleFeeds.slice(startIndex, startIndex + batchSize);
        const placeholders = batch.map(() => 
          '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        ).join(', ');

        const values = batch.flatMap(feed => [
          null, // user_id (NULL для публичных кормов)
          feed.name, feed.brand, feed.type, feed.animal_type, feed.category,
          feed.metabolic_energy, feed.protein, feed.fat, feed.carbohydrates,
          feed.fiber, feed.ash, feed.moisture, feed.calcium, feed.phosphorus,
          feed.sodium, feed.potassium, feed.magnesium, feed.iron, feed.zinc, 
          feed.copper, feed.manganese, feed.selenium, feed.iodine,
          feed.vitamin_a, feed.vitamin_d, feed.vitamin_e, feed.vitamin_k,
          feed.vitamin_b1, feed.vitamin_b2, 
          0, // vitamin_b3 (niacin) - пока 0, можно добавить в JSON позже
          0, // vitamin_b5 (pantothenic acid) - пока 0
          feed.vitamin_b6, 
          0, // vitamin_b7 (biotin) - пока 0
          0, // vitamin_b9 (folic acid) - пока 0
          feed.vitamin_b12,
          0, // vitamin_c - пока 0
          feed.ingredients || 'Состав уточняется', // ingredients - полный состав корма
          '', // notes - пока пустое
          feed.price_per_kg, 
          1, // is_available = 1 (true)
          1, // is_public = 1 (true)
          new Date().toISOString(), // created_at
          new Date().toISOString()  // updated_at
        ]);

        const insertQuery = `
          INSERT INTO feeds (
            user_id, name, brand, type, animal_type, category, metabolic_energy, protein, fat, carbohydrates,
            fiber, ash, moisture, calcium, phosphorus, sodium, potassium, magnesium, iron, zinc, 
            copper, manganese, selenium, iodine, vitamin_a, vitamin_d, vitamin_e, vitamin_k,
            vitamin_b1, vitamin_b2, vitamin_b3, vitamin_b5, vitamin_b6, vitamin_b7, vitamin_b9, vitamin_b12, vitamin_c,
            ingredients, notes, price_per_kg, is_available, is_public, created_at, updated_at
          ) VALUES ${placeholders}
        `;

        db.run(insertQuery, values, function(err) {
          if (err) {
            console.error(`❌ Ошибка при вставке пакета ${startIndex}-${startIndex + batch.length}:`, err);
            reject(err);
            return;
          }
          
          insertedCount += batch.length;
          console.log(`📥 Загружено ${insertedCount}/${sampleFeeds.length} кормов...`);
          
          // Переходим к следующему пакету
          insertBatch(startIndex + batchSize);
        });
      };
      
      // Начинаем вставку с первого пакета
      insertBatch(0);
    });
  });
};

const createDemoUser = () => {
  return new Promise((resolve, reject) => {
    const bcrypt = require('bcryptjs');
    
    // Проверяем есть ли уже демо-пользователь
    db.get('SELECT id FROM users WHERE email = ?', ['demo@clinic.com'], async (err, user) => {
      if (err) {
        reject(err);
        return;
      }

      if (user) {
        console.log('👤 Демо-пользователь уже существует');
        resolve();
        return;
      }

      try {
        // Создаем хеш пароля для демо-аккаунта
        const passwordHash = await bcrypt.hash('demo123', 10);

        // Вставляем демо-пользователя
        const insertQuery = `
          INSERT INTO users (email, password_hash, clinic_name, clinic_phone, clinic_address, contact_person, is_active)
          VALUES (?, ?, ?, ?, ?, ?, 1)
        `;

        db.run(insertQuery, [
          'demo@clinic.com',
          passwordHash,
          'Демо Ветклиника',
          '+7 (999) 123-45-67',
          'г. Москва, ул. Демонстрационная, д. 1',
          'Демо Ветеринар'
        ], function(err) {
          if (err) {
            console.error('Ошибка создания демо-пользователя:', err);
            reject(err);
          } else {
            console.log('👤 Демо-пользователь создан успешно (demo@clinic.com / demo123)');
            resolve();
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  });
};

const initDatabase = async () => {
  try {
    await connectDatabase();
    await createTables();
    await createDemoUser();
    await insertSampleData();
  } catch (error) {
    console.error('Ошибка инициализации базы данных:', error);
    throw error;
  }
};

const getDatabase = () => {
  if (!db) {
    throw new Error('База данных не инициализирована');
  }
  return db;
};

module.exports = {
  initDatabase,
  getDatabase
}; 