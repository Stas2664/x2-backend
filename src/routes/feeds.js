const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database');
const path = require('path');
const fs = require('fs');
const https = require('https');

// Создаем расширенную таблицу кормов если её нет при запуске
const initDatabase = () => {
  const db = getDatabase();
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS feeds_extended (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        brand TEXT NOT NULL,
        type TEXT NOT NULL,
        animal_type TEXT NOT NULL,
        life_stage TEXT NOT NULL,
        crude_protein REAL,
        crude_fat REAL,
        crude_fiber REAL,
        ash REAL,
        moisture REAL,
        nfe REAL,
        calcium REAL,
        phosphorus REAL,
        sodium REAL,
        potassium REAL,
        magnesium REAL,
        iron REAL,
        copper REAL,
        zinc REAL,
        manganese REAL,
        iodine REAL,
        selenium REAL,
        vitamin_a REAL,
        vitamin_d3 REAL,
        vitamin_e REAL,
        vitamin_k REAL,
        vitamin_b1 REAL,
        vitamin_b2 REAL,
        vitamin_b6 REAL,
        vitamin_b12 REAL,
        niacin REAL,
        pantothenic_acid REAL,
        folic_acid REAL,
        biotin REAL,
        choline REAL,
        metabolizable_energy REAL,
        digestible_energy REAL,
        gross_energy REAL,
        feeding_guide TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  });
};

// Инициализируем БД при первом запросе
let dbInitialized = false;
const ensureDbInitialized = () => {
  if (!dbInitialized) {
    initDatabase();
    dbInitialized = true;
  }
};

// Получить все корма с фильтрацией и поиском
router.get('/', (req, res) => {
  ensureDbInitialized();
  const db = getDatabase();
  const { search, type, brand, animal_type, category, limit, offset } = req.query;
  
  let query = 'SELECT * FROM feeds WHERE 1=1';
  const params = [];

  // Поиск по названию
  if (search) {
    query += ' AND (name LIKE ? OR brand LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  // Фильтр по типу корма
  if (type) {
    query += ' AND type = ?';
    params.push(type);
  }

  // Фильтр по бренду
  if (brand) {
    query += ' AND brand = ?';
    params.push(brand);
  }

  // Фильтр по виду животного
  if (animal_type) {
    query += ' AND (animal_type = ? OR animal_type = "both")';
    params.push(animal_type);
  }

  // Фильтр по категории
  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }

  query += ' ORDER BY created_at DESC';

  // Пагинация
  if (limit) {
    query += ' LIMIT ?';
    params.push(parseInt(limit));
    
    if (offset) {
      query += ' OFFSET ?';
      params.push(parseInt(offset));
    }
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Ошибка получения кормов:', err);
      res.status(500).json({ error: 'Ошибка сервера' });
    } else {
      // Преобразуем названия полей для совместимости с фронтендом
      const transformedRows = rows.map(row => ({
        ...row,
        crude_protein: row.protein,
        crude_fat: row.fat,
        crude_fiber: row.fiber,
        metabolizable_energy: row.metabolic_energy,
        // Добавляем отсутствующие поля со значениями по умолчанию
        potassium: row.potassium || 0,
        vitamin_a: row.vitamin_a || 0,
        vitamin_d3: row.vitamin_d || 0,
        vitamin_e: row.vitamin_e || 0,
        feeding_guide: {}
      }));
      
      console.log(`✅ Отправлено кормов: ${transformedRows.length}`);
      res.json(transformedRows);
    }
  });
});

// Получить список брендов
router.get('/brands', (req, res) => {
  const db = getDatabase();
  
  db.all("SELECT DISTINCT brand FROM feeds WHERE brand IS NOT NULL AND TRIM(brand) <> '' ORDER BY brand", (err, rows) => {
    if (err) {
      console.error('Ошибка получения брендов:', err);
      res.status(500).json({ error: 'Ошибка сервера' });
    } else {
      const brands = rows.map(row => row.brand);
      res.json(brands);
    }
  });
});

// Получить список типов животных
router.get('/animal-types', (req, res) => {
  const db = getDatabase();
  
  db.all('SELECT DISTINCT animal_type FROM feeds WHERE animal_type IS NOT NULL ORDER BY animal_type', (err, rows) => {
    if (err) {
      console.error('Ошибка получения типов животных:', err);
      res.status(500).json({ error: 'Ошибка сервера' });
    } else {
      const animalTypes = rows.map(row => row.animal_type);
      res.json(animalTypes);
    }
  });
});

// Получить список категорий кормов
router.get('/categories', (req, res) => {
  const db = getDatabase();
  
  db.all('SELECT DISTINCT category FROM feeds WHERE category IS NOT NULL ORDER BY category', (err, rows) => {
    if (err) {
      console.error('Ошибка получения категорий:', err);
      res.status(500).json({ error: 'Ошибка сервера' });
    } else {
      const categories = rows.map(row => row.category);
      res.json(categories);
    }
  });
});

// Получить все корма с подробной информацией
router.get('/detailed', (req, res) => {
  try {
    const db = getDatabase();
    
    // Используем основную таблицу feeds, где находятся наши образцы данных
    db.all(`SELECT 
      id, name, brand, type, animal_type, category,
      metabolic_energy, protein, fat, carbohydrates, fiber, ash, moisture,
      calcium, phosphorus, sodium, vitamin_d, vitamin_e, ingredients,
      created_at, updated_at,
      metabolic_energy as metabolizable_energy,
      protein as crude_protein,
      fat as crude_fat,
      fiber as crude_fiber,
      category as life_stage,
      '' as feeding_guide
    FROM feeds ORDER BY brand, name`, (err, rows) => {
      if (err) {
        console.error('Error fetching detailed feeds:', err);
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch feeds data'
        });
      }

      const toFeedCategory = (row) => {
        // Выводим человеко-понятную категорию корма:
        // - терапевтический: диетические и контроль веса
        // - дополнительный: лакомства/добавки (type = treats)
        // - полнорационный: все остальные
        const category = String(row.category || '').toLowerCase();
        const type = String(row.type || '').toLowerCase();
        if (['diet', 'weight_loss'].includes(category)) return 'терапевтический';
        if (type === 'treats') return 'дополнительный';
        return 'полнорационный';
      };

      const feeds = rows.map(feed => ({
        ...feed,
        feeding_guide: {},
        feed_category: toFeedCategory(feed)
      }));

      console.log(`✅ Найдено кормов: ${feeds.length}`);

      res.json({
        success: true,
        feeds: feeds,
        total_count: feeds.length
      });
    });

  } catch (error) {
    console.error('Error fetching detailed feeds:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch feeds data'
    });
  }
});

// Получить корм по ID
router.get('/:id', (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  
  db.get('SELECT * FROM feeds WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Ошибка получения корма:', err);
      res.status(500).json({ error: 'Ошибка сервера' });
    } else if (!row) {
      res.status(404).json({ error: 'Корм не найден' });
    } else {
      res.json(row);
    }
  });
});

// Создать новый корм
router.post('/', (req, res) => {
  const db = getDatabase();
  const feedData = req.body;

  // Валидация обязательных полей
  if (!feedData.name || !feedData.metabolic_energy || !feedData.animal_type || !feedData.category) {
    return res.status(400).json({ 
      error: 'Обязательные поля: name, metabolic_energy, animal_type, category' 
    });
  }

  if (feedData.type && !['dry', 'wet', 'raw', 'treats'].includes(feedData.type)) {
    return res.status(400).json({ error: 'Некорректный тип корма' });
  }

  if (!['dog', 'cat', 'both'].includes(feedData.animal_type)) {
    return res.status(400).json({ error: 'Некорректный тип животного' });
  }

  if (!['kitten', 'puppy_small', 'puppy_medium', 'puppy_large', 'adult', 'senior', 'weight_loss', 'diet', 'special'].includes(feedData.category)) {
    return res.status(400).json({ error: 'Некорректная категория корма' });
  }

  // Подготовка полей для вставки
  const fields = [
    'name', 'brand', 'type', 'animal_type', 'category', 'metabolic_energy', 'protein', 'fat', 'carbohydrates',
    'fiber', 'ash', 'moisture', 'calcium', 'phosphorus', 'sodium', 'potassium',
    'magnesium', 'iron', 'zinc', 'copper', 'manganese', 'selenium', 'iodine',
    'vitamin_d', 'vitamin_e', 'vitamin_k', 'vitamin_b1', 'vitamin_b2',
    'vitamin_b3', 'vitamin_b5', 'vitamin_b6', 'vitamin_b7', 'vitamin_b9', 'vitamin_b12',
    'vitamin_c', 'ingredients', 'notes'
  ];

  const values = fields.map(field => feedData[field] || null);
  const placeholders = fields.map(() => '?').join(', ');
  const fieldNames = fields.join(', ');

  const query = `INSERT INTO feeds (${fieldNames}) VALUES (${placeholders})`;

  db.run(query, values, function(err) {
    if (err) {
      if (err.code === 'SQLITE_CONSTRAINT' && err.message.includes('UNIQUE')) {
        res.status(400).json({ error: 'Корм с таким названием уже существует' });
      } else {
        console.error('Ошибка создания корма:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
      }
    } else {
      // Получить созданный корм
      db.get('SELECT * FROM feeds WHERE id = ?', [this.lastID], (err, row) => {
        if (err) {
          console.error('Ошибка получения созданного корма:', err);
          res.status(500).json({ error: 'Ошибка сервера' });
        } else {
          res.status(201).json(row);
        }
      });
    }
  });
});

// Обновить корм
router.put('/:id', (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  const feedData = req.body;

  // Проверяем, существует ли корм
  db.get('SELECT * FROM feeds WHERE id = ?', [id], (err, existingFeed) => {
    if (err) {
      console.error('Ошибка проверки корма:', err);
      return res.status(500).json({ error: 'Ошибка сервера' });
    }

    if (!existingFeed) {
      return res.status(404).json({ error: 'Корм не найден' });
    }

    // Подготовка полей для обновления
    const fields = [
      'name', 'brand', 'type', 'animal_type', 'category', 'metabolic_energy', 'protein', 'fat', 'carbohydrates',
      'fiber', 'ash', 'moisture', 'calcium', 'phosphorus', 'sodium', 'potassium',
      'magnesium', 'iron', 'zinc', 'copper', 'manganese', 'selenium', 'iodine',
      'vitamin_d', 'vitamin_e', 'vitamin_k', 'vitamin_b1', 'vitamin_b2',
      'vitamin_b3', 'vitamin_b5', 'vitamin_b6', 'vitamin_b7', 'vitamin_b9', 'vitamin_b12',
      'vitamin_c', 'ingredients', 'notes'
    ];

    const updates = [];
    const values = [];

    fields.forEach(field => {
      if (feedData[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(feedData[field]);
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Нет данных для обновления' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const query = `UPDATE feeds SET ${updates.join(', ')} WHERE id = ?`;

    db.run(query, values, function(err) {
      if (err) {
        if (err.code === 'SQLITE_CONSTRAINT' && err.message.includes('UNIQUE')) {
          res.status(400).json({ error: 'Корм с таким названием уже существует' });
        } else {
          console.error('Ошибка обновления корма:', err);
          res.status(500).json({ error: 'Ошибка сервера' });
        }
      } else {
        // Получить обновленный корм
        db.get('SELECT * FROM feeds WHERE id = ?', [id], (err, row) => {
          if (err) {
            console.error('Ошибка получения обновленного корма:', err);
            res.status(500).json({ error: 'Ошибка сервера' });
          } else {
            res.json(row);
          }
        });
      }
    });
  });
});

// Удалить корм
router.delete('/:id', (req, res) => {
  const db = getDatabase();
  const { id } = req.params;

  // Проверяем, существует ли корм
  db.get('SELECT * FROM feeds WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Ошибка проверки корма:', err);
      return res.status(500).json({ error: 'Ошибка сервера' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Корм не найден' });
    }

    // Удаляем корм
    db.run('DELETE FROM feeds WHERE id = ?', [id], function(err) {
      if (err) {
        console.error('Ошибка удаления корма:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
      } else {
        res.json({ message: 'Корм успешно удален' });
      }
    });
  });
});

// Получить несколько кормов по их ID для сравнения
router.post('/compare', (req, res) => {
  const db = getDatabase();
  const { feedIds } = req.body;

  if (!feedIds || !Array.isArray(feedIds) || feedIds.length === 0) {
    return res.status(400).json({ error: 'Необходимо предоставить массив ID кормов' });
  }

  const placeholders = feedIds.map(() => '?').join(', ');
  const query = `SELECT * FROM feeds WHERE id IN (${placeholders})`;

  db.all(query, feedIds, (err, rows) => {
    if (err) {
      console.error('Ошибка получения кормов для сравнения:', err);
      res.status(500).json({ error: 'Ошибка сервера' });
    } else {
      res.json(rows);
    }
  });
});

// Получить статистику по кормам
router.get('/stats/overview', (req, res) => {
  const db = getDatabase();
  
  const queries = [
    'SELECT COUNT(*) as total_feeds FROM feeds',
    "SELECT COUNT(DISTINCT brand) as total_brands FROM feeds WHERE brand IS NOT NULL AND TRIM(brand) <> ''",
    'SELECT type, COUNT(*) as count FROM feeds WHERE type IS NOT NULL GROUP BY type',
    'SELECT AVG(metabolic_energy) as avg_calories FROM feeds'
  ];

  const results = {};
  let completed = 0;

  // Общее количество кормов
  db.get(queries[0], (err, row) => {
    if (!err) results.totalFeeds = row.total_feeds;
    if (++completed === 4) res.json(results);
  });

  // Количество брендов
  db.get(queries[1], (err, row) => {
    if (!err) results.totalBrands = row.total_brands;
    if (++completed === 4) res.json(results);
  });

  // Распределение по типам
  db.all(queries[2], (err, rows) => {
    if (!err) results.feedTypes = rows;
    if (++completed === 4) res.json(results);
  });

  // Средняя калорийность
  db.get(queries[3], (err, row) => {
    if (!err) results.avgCalories = Math.round(row.avg_calories);
    if (++completed === 4) res.json(results);
  });
});

// Импорт данных из JSON файла
router.post('/import', (req, res) => {
  ensureDbInitialized();
  try {
    const jsonPath = path.join(__dirname, '../../data/feeds_database.json');
    const feedsData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const db = getDatabase();

    db.serialize(() => {
      // Очищаем существующие данные
      db.run('DELETE FROM feeds_extended');

      const insertStmt = db.prepare(`
        INSERT INTO feeds_extended (
          name, brand, type, animal_type, life_stage,
          crude_protein, crude_fat, crude_fiber, ash, moisture, nfe,
          calcium, phosphorus, sodium, potassium, magnesium,
          iron, copper, zinc, manganese, iodine, selenium,
          vitamin_a, vitamin_d3, vitamin_e, vitamin_k,
          vitamin_b1, vitamin_b2, vitamin_b6, vitamin_b12,
          niacin, pantothenic_acid, folic_acid, biotin, choline,
          metabolizable_energy, digestible_energy, gross_energy,
          feeding_guide
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      let imported = 0;
      for (const feed of feedsData.feeds) {
        insertStmt.run([
          feed.name,
          feed.brand,
          feed.type,
          feed.animal_type,
          feed.life_stage,
          feed.composition.crude_protein,
          feed.composition.crude_fat,
          feed.composition.crude_fiber,
          feed.composition.ash,
          feed.composition.moisture,
          feed.composition.nfe,
          feed.composition.calcium,
          feed.composition.phosphorus,
          feed.composition.sodium,
          feed.composition.potassium,
          feed.composition.magnesium,
          feed.composition.iron,
          feed.composition.copper,
          feed.composition.zinc,
          feed.composition.manganese,
          feed.composition.iodine,
          feed.composition.selenium,
          feed.vitamins.vitamin_a,
          feed.vitamins.vitamin_d3,
          feed.vitamins.vitamin_e,
          feed.vitamins.vitamin_k,
          feed.vitamins.vitamin_b1,
          feed.vitamins.vitamin_b2,
          feed.vitamins.vitamin_b6,
          feed.vitamins.vitamin_b12,
          feed.vitamins.niacin,
          feed.vitamins.pantothenic_acid,
          feed.vitamins.folic_acid,
          feed.vitamins.biotin,
          feed.vitamins.choline,
          feed.energy.metabolizable_energy,
          feed.energy.digestible_energy,
          feed.energy.gross_energy,
          JSON.stringify(feed.feeding_guide)
        ]);
        imported++;
      }

      insertStmt.finalize();

      res.json({
        success: true,
        message: `Successfully imported ${imported} feeds`,
        imported_count: imported
      });
    });

  } catch (error) {
    console.error('Error importing feeds:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to import feeds data'
    });
  }
});

// Локальный импорт CSV с пути на диске
// POST /feeds/import/local-csv { filePath: 'C:\\path\\to\\file.csv' }
router.post('/import/local-csv', (req, res) => {
  ensureDbInitialized();
  try {
    const { filePath } = req.body || {};
    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(400).json({ success: false, error: 'CSV filePath is missing or not found' });
    }

    const csv = fs.readFileSync(filePath, 'utf8');

    const parseCSV = (text) => {
      const rows = [];
      let i = 0, field = '', row = [], inQuotes = false;
      while (i < text.length) {
        const c = text[i];
        if (inQuotes) {
          if (c === '"') { if (text[i+1] === '"') { field += '"'; i++; } else { inQuotes = false; } }
          else { field += c; }
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
      if (h.includes('мг') || n > 10) return n;
      return Math.round(n * 1000);
    };

    const rows = parseCSV(csv);
    if (!rows.length) return res.status(400).json({ success: false, error: 'CSV is empty' });
    const headers = rows[0].map(h => String(h || '').trim());
    const getIndex = (...aliases) => headers.findIndex(h => {
      const low = h.toLowerCase();
      return aliases.some(a => low.includes(a));
    });

    const idx = {
      animal: getIndex('вид живот', 'собак', 'кош'),
      category: getIndex('категор'),
      purpose: getIndex('назначен'),
      type: getIndex('тип корма', 'тип'),
      brand: getIndex('бренд'),
      name: getIndex('назв', 'корм'),
      me100g: getIndex('мэ', 'ккал/100'),
      moisture: getIndex('влага', 'влажн'),
      protein: getIndex('белок'),
      fat: getIndex('жир'),
      carbs: getIndex('перев.углев', 'углев'),
      fiber: getIndex('пищ.волок', 'клетчат'),
      ash: getIndex('зола'),
      calcium: getIndex('кальц'),
      phosphorus: getIndex('фосфор'),
      ingredients: getIndex('ингредиент', 'состав')
    };

    const db = getDatabase();
    db.serialize(() => {
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

        const animal_type = mapAnimal(row[idx.animal]);
        const type = mapType(row[idx.type]);

        // Нормализация категории из назначения
        let category = 'adult';
        const categoryRaw = String(row[idx.category] || row[idx.purpose] || '').toLowerCase();
        if (categoryRaw.includes('щен') || categoryRaw.includes('юниор') || categoryRaw.includes('котен')) category = 'puppy';
        else if (categoryRaw.includes('пожил') || categoryRaw.includes('senior')) category = 'senior';
        else if (categoryRaw.includes('вес') || categoryRaw.includes('похуд') || categoryRaw.includes('weight')) category = 'weight_loss';
        else if (categoryRaw.includes('диет') || categoryRaw.includes('therap') || categoryRaw.includes('терап')) category = 'diet';

        // В таблице МЭ на 100г → переводим в ккал/кг
        const me100g = toNumber(row[idx.me100g]);
        const metabolic_energy = Math.round(me100g * 10); // 100г -> кг

        const protein = toNumber(row[idx.protein]);
        const fat = toNumber(row[idx.fat]);
        const fiber = toNumber(row[idx.fiber]);
        const ash = toNumber(row[idx.ash]);
        const moisture = toNumber(row[idx.moisture]);
        let carbohydrates = toNumber(row[idx.carbs]);
        if (!carbohydrates) {
          carbohydrates = Math.max(0, 100 - (protein + fat + fiber + ash + moisture));
        }

        const calcium = normalizeCaP(row[idx.calcium], headers[idx.calcium]);
        const phosphorus = normalizeCaP(row[idx.phosphorus], headers[idx.phosphorus]);
        const ingredients = String(row[idx.ingredients] || '');

        stmt.run([
          String(name).trim(), String(brand).trim(), type, animal_type, category,
          metabolic_energy, protein, fat, carbohydrates, fiber, ash, moisture,
          calcium, phosphorus, 0, 0, ingredients
        ]);
        imported++;
      }
      stmt.finalize((err) => {
        if (err) return res.status(500).json({ success: false, error: 'DB finalize error' });
        res.json({ success: true, imported });
      });
    });
  } catch (e) {
    console.error('Local CSV import error:', e);
    res.status(500).json({ success: false, error: 'Failed import from local CSV' });
  }
});

// === Импорт из Google Sheets (публичный лист) ===
// POST /feeds/import/google { url: string }
router.post('/import/google', (req, res) => {
  ensureDbInitialized();
  try {
    const { url } = req.body || {};
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ success: false, error: 'Google Sheets URL is required' });
    }

    // Преобразуем ссылку /edit?... -> /export?format=csv
    let exportUrl = url;
    if (exportUrl.includes('/edit')) {
      exportUrl = exportUrl.split('/edit')[0] + '/export?format=csv';
    } else if (!exportUrl.includes('/export')) {
      exportUrl = exportUrl + (exportUrl.includes('?') ? '&' : '?') + 'export=download&format=csv';
    }

    const fetchCSV = (csvUrl) => new Promise((resolve, reject) => {
      https.get(csvUrl, (resp) => {
        if (resp.statusCode && resp.statusCode >= 300 && resp.statusCode < 400 && resp.headers.location) {
          // redirect
          return resolve(fetchCSV(resp.headers.location));
        }
        let data = '';
        resp.on('data', (chunk) => data += chunk);
        resp.on('end', () => resolve(data));
      }).on('error', reject);
    });

    const parseCSV = (text) => {
      // Простой CSV-парсер с поддержкой кавычек
      const rows = [];
      let i = 0, field = '', row = [], inQuotes = false;
      while (i < text.length) {
        const c = text[i];
        if (inQuotes) {
          if (c === '"') {
            if (text[i+1] === '"') { field += '"'; i++; } else { inQuotes = false; }
          } else { field += c; }
        } else {
          if (c === '"') { inQuotes = true; }
          else if (c === ',') { row.push(field); field=''; }
          else if (c === '\n') { row.push(field); rows.push(row); row=[]; field=''; }
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
      // Приводим Ca/P к мг/100г. Если значение похоже на проценты (<= 5), умножаем на 1000
      const n = toNumber(value);
      const h = String(header || '').toLowerCase();
      if (h.includes('мг') || n > 10) return n; // уже мг/100г
      return Math.round(n * 1000); // из % в мг/100г
    };

    fetchCSV(exportUrl)
      .then(csv => {
        const rows = parseCSV(csv);
        if (!rows.length) throw new Error('Empty sheet');
        const headers = rows[0].map(h => String(h || '').trim());
        const getIndex = (...aliases) => headers.findIndex(h => {
          const low = h.toLowerCase();
          return aliases.some(a => low.includes(a));
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
          moisture: getIndex('влажн'),
          calcium: getIndex('кальц'),
          phosphorus: getIndex('фосфор'),
          vitamin_a: getIndex('витамин а', 'vitamin a'),
          vitamin_d3: getIndex('витамин d', 'vitamin d'),
          ingredients: getIndex('ингредиент', 'состав')
        };

        const db = getDatabase();
        db.serialize(() => {
          let imported = 0;
          const upsert = db.prepare(`
            INSERT INTO feeds (name, brand, type, animal_type, category, metabolic_energy, protein, fat, carbohydrates, fiber, ash, moisture, calcium, phosphorus, vitamin_a, vitamin_d, ingredients)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);

          for (let r = 1; r < rows.length; r++) {
            const row = rows[r];
            if (!row || row.length === 0) continue;
            const name = row[idx.name] || '';
            const brand = row[idx.brand] || '';
            if (!String(name).trim()) continue;

            const type = mapType(row[idx.type]);
            const animal_type = mapAnimal(row[idx.animal]);
            const categoryRaw = String(row[idx.category] || '').toLowerCase();
            // Нормализуем категорию для таблицы feeds (life_stage)
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

            upsert.run([
              String(name).trim(), String(brand).trim(), type, animal_type, category,
              me, protein, fat, carbohydrates, fiber, ash, moisture, calcium, phosphorus,
              vitamin_a, vitamin_d, ingredients
            ]);
            imported++;
          }

          upsert.finalize((err) => {
            if (err) {
              console.error('Upsert finalize error:', err);
              return res.status(500).json({ success: false, error: 'DB error on import' });
            }
            res.json({ success: true, imported });
          });
        });
      })
      .catch((err) => {
        console.error('Google import error:', err);
        res.status(500).json({ success: false, error: 'Failed to import from Google Sheets' });
      });
  } catch (error) {
    console.error('Error in /import/google:', error);
    res.status(500).json({ success: false, error: 'Unexpected server error' });
  }
});

// Получить конкретный корм по ID
router.get('/:id/detailed', (req, res) => {
  ensureDbInitialized();
  try {
    const { id } = req.params;
    const db = getDatabase();
    
    db.get('SELECT * FROM feeds_extended WHERE id = ?', [id], (err, row) => {
      if (err) {
        console.error('Error fetching feed details:', err);
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch feed details'
        });
      }

      if (!row) {
        return res.status(404).json({
          success: false,
          error: 'Feed not found'
        });
      }

      row.feeding_guide = JSON.parse(row.feeding_guide || '{}');

      res.json({
        success: true,
        feed: row
      });
    });

  } catch (error) {
    console.error('Error fetching feed details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch feed details'
    });
  }
});

// Расчет суточной нормы корма
router.post('/calculate-daily-amount', (req, res) => {
  ensureDbInitialized();
  try {
    const { feedId, animalWeight, energyNeed } = req.body;

    if (!feedId || !animalWeight || !energyNeed) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: feedId, animalWeight, energyNeed'
      });
    }

    const db = getDatabase();
    
    db.get('SELECT * FROM feeds_extended WHERE id = ?', [feedId], (err, feed) => {
      if (err) {
        console.error('Error calculating daily amount:', err);
        return res.status(500).json({
          success: false,
          error: 'Failed to calculate daily amount'
        });
      }

      if (!feed) {
        return res.status(404).json({
          success: false,
          error: 'Feed not found'
        });
      }

      // Расчет суточной нормы в граммах
      const dailyAmountGrams = (energyNeed / feed.metabolizable_energy) * 1000;
      
      // Расчет в чашках (примерно 120г на чашку сухого корма)
      const dailyAmountCups = dailyAmountGrams / 120;

      // Расчет питательных веществ в суточной норме
      const dailyNutrients = {
        protein: (feed.crude_protein * dailyAmountGrams) / 100,
        fat: (feed.crude_fat * dailyAmountGrams) / 100,
        fiber: (feed.crude_fiber * dailyAmountGrams) / 100,
        calcium: (feed.calcium * dailyAmountGrams) / 100,
        phosphorus: (feed.phosphorus * dailyAmountGrams) / 100
      };

      res.json({
        success: true,
        calculation: {
          feed_name: feed.name,
          feed_brand: feed.brand,
          animal_weight: animalWeight,
          energy_need: energyNeed,
          feed_me: feed.metabolizable_energy,
          daily_amount: {
            grams: Math.round(dailyAmountGrams * 10) / 10,
            cups: Math.round(dailyAmountCups * 10) / 10
          },
          daily_nutrients: dailyNutrients
        }
      });
    });

  } catch (error) {
    console.error('Error calculating daily amount:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate daily amount'
    });
  }
});

module.exports = router; 