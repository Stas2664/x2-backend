const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database');
const path = require('path');
const fs = require('fs');

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
  
  db.all('SELECT DISTINCT brand FROM feeds WHERE brand IS NOT NULL ORDER BY brand', (err, rows) => {
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
    'SELECT COUNT(DISTINCT brand) as total_brands FROM feeds WHERE brand IS NOT NULL',
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