const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Путь к базе данных
const dbPath = path.join(__dirname, '../data/vetformulab.db');
const jsonPath = path.join(__dirname, '../data/feeds_database.json');

console.log('🚀 Принудительное обновление базы кормов...\n');

// Удаляем существующую базу данных для полного пересоздания
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('🗑️ Старая база данных удалена');
}

// Создаем новую базу данных
const db = new sqlite3.Database(dbPath);

// Создаем таблицу кормов
db.serialize(() => {
  console.log('📋 Создаю таблицу кормов...');
  
  db.run(`
    CREATE TABLE IF NOT EXISTS feeds (
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
    )
  `);

  // Загружаем данные из JSON
  console.log('📖 Загружаю данные из JSON...');
  
  const feedsData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  
  console.log(`📊 Найдено ${feedsData.feeds.length} кормов для загрузки`);
  
  // Функции нормализации (те же что в database.js)
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
    ingredients: `Состав не указан. Рекомендации по кормлению: ${Object.entries(feed.feeding_guide || {}).map(([weight, amount]) => `${weight}: ${amount}`).join(', ')}`,
    price_per_kg: 1000, // Примерная цена
    is_public: 1
  }));

  const placeholders = sampleFeeds.map(() => 
    '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).join(', ');

  const values = sampleFeeds.flatMap(feed => [
    feed.name, feed.brand, feed.type, feed.animal_type, feed.category,
    feed.metabolic_energy, feed.protein, feed.fat, feed.carbohydrates,
    feed.fiber, feed.ash, feed.moisture, feed.calcium, feed.phosphorus,
    feed.sodium, feed.potassium, feed.magnesium, feed.iron, feed.zinc, 
    feed.copper, feed.manganese, feed.selenium, feed.iodine,
    feed.vitamin_a, feed.vitamin_d, feed.vitamin_e, feed.vitamin_k,
    feed.vitamin_b1, feed.vitamin_b2, feed.vitamin_b6, feed.vitamin_b12,
    feed.ingredients, feed.price_per_kg, 1  // is_public = 1 (true)
  ]);

  const insertQuery = `
    INSERT INTO feeds (
      name, brand, type, animal_type, category, metabolic_energy, protein, fat, carbohydrates,
      fiber, ash, moisture, calcium, phosphorus, sodium, potassium, magnesium, iron, zinc, 
      copper, manganese, selenium, iodine, vitamin_a, vitamin_d, vitamin_e, vitamin_k,
      vitamin_b1, vitamin_b2, vitamin_b6, vitamin_b12, ingredients, price_per_kg, is_public
    ) VALUES ${placeholders}
  `;

  console.log('💾 Загружаю корма в базу данных...');
  
  db.run(insertQuery, values, function(err) {
    if (err) {
      console.error('❌ Ошибка загрузки:', err);
    } else {
      console.log(`\n✅ Успешно загружено ${sampleFeeds.length} кормов!`);
      console.log('📊 Статистика:');
      
      // Подсчитываем статистику
      const dogFeeds = sampleFeeds.filter(f => f.animal_type === 'dog').length;
      const catFeeds = sampleFeeds.filter(f => f.animal_type === 'cat').length;
      const brands = [...new Set(sampleFeeds.map(f => f.brand))].length;
      
      console.log(`🐕 Для собак: ${dogFeeds}`);
      console.log(`🐱 Для кошек: ${catFeeds}`);
      console.log(`🏷️ Брендов: ${brands}`);
      console.log(`📦 Всего кормов: ${sampleFeeds.length}`);
      
      console.log('\n🎉 База данных успешно обновлена!');
      console.log('🔄 Перезапустите сервер для применения изменений.');
    }
    
    db.close();
  });
}); 