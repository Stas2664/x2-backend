const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database');
const { calculateMER, compareFeeds, calculateDailyFeedAmount, calculateDailyNutrients } = require('../utils/calculations');

// Получить все сравнения
router.get('/', (req, res) => {
  const db = getDatabase();
  const { limit = 50, offset = 0 } = req.query;

  const query = `
    SELECT c.*, a.name as animal_name 
    FROM comparisons c 
    LEFT JOIN animals a ON c.animal_id = a.id 
    ORDER BY c.created_at DESC 
    LIMIT ? OFFSET ?
  `;

  db.all(query, [parseInt(limit), parseInt(offset)], (err, rows) => {
    if (err) {
      console.error('Ошибка получения сравнений:', err);
      res.status(500).json({ error: 'Ошибка сервера' });
    } else {
      const comparisons = rows.map(row => ({
        id: row.id,
        animal_id: row.animal_id,
        animal_name: row.animal_name,
        feed_ids: JSON.parse(row.feed_ids || '[]'),
        comparison_data: JSON.parse(row.comparison_data || '{}'),
        created_at: row.created_at
      }));
      
      res.json(comparisons);
    }
  });
});

// Рассчитать энергетическую потребность для животного
router.post('/energy-requirement', (req, res) => {
  const {
    weight,
    species,
    activity_level,
    physiological_state,
    is_neutered,
    age
  } = req.body;

  // Валидация
  if (!weight || !species || !activity_level || !age) {
    return res.status(400).json({ 
      error: 'Обязательные поля: weight, species, activity_level, age' 
    });
  }

  if (!['dog', 'cat', 'ferret'].includes(species)) {
    return res.status(400).json({ error: 'Некорректный вид животного' });
  }

  if (!['low', 'moderate', 'high', 'very_high'].includes(activity_level)) {
    return res.status(400).json({ error: 'Некорректный уровень активности' });
  }

  try {
    const energyRequirement = calculateMER(
      weight,
      species,
      activity_level,
      physiological_state || 'normal',
      is_neutered || false,
      age
    );

    res.json({
      energy_requirement: energyRequirement,
      animal_data: {
        weight,
        species,
        activity_level,
        physiological_state: physiological_state || 'normal',
        is_neutered: is_neutered || false,
        age
      }
    });
  } catch (error) {
    console.error('Ошибка расчета энергетической потребности:', error);
    res.status(500).json({ error: 'Ошибка расчета' });
  }
});

// Сравнить корма для конкретного животного
router.post('/compare-feeds', (req, res) => {
  const db = getDatabase();
  const { animal_id, feed_ids } = req.body;

  if (!animal_id || !feed_ids || !Array.isArray(feed_ids) || feed_ids.length === 0) {
    return res.status(400).json({ 
      error: 'Необходимо указать animal_id и массив feed_ids' 
    });
  }

  // Получаем данные животного
  db.get('SELECT * FROM animals WHERE id = ?', [animal_id], (err, animal) => {
    if (err) {
      console.error('Ошибка получения животного:', err);
      return res.status(500).json({ error: 'Ошибка сервера' });
    }

    if (!animal) {
      return res.status(404).json({ error: 'Животное не найдено' });
    }

    // Получаем данные кормов
    const placeholders = feed_ids.map(() => '?').join(', ');
    const query = `SELECT * FROM feeds WHERE id IN (${placeholders})`;

    db.all(query, feed_ids, (err, feeds) => {
      if (err) {
        console.error('Ошибка получения кормов:', err);
        return res.status(500).json({ error: 'Ошибка сервера' });
      }

      if (feeds.length === 0) {
        return res.status(404).json({ error: 'Корма не найдены' });
      }

      try {
        const comparison = compareFeeds(animal, feeds);
        
        // Сохраняем результат сравнения в базу
        const comparisonData = JSON.stringify(comparison);
        const feedIdsJson = JSON.stringify(feed_ids);
        
        db.run(
          'INSERT INTO comparisons (animal_id, feed_ids, comparison_data) VALUES (?, ?, ?)',
          [animal_id, feedIdsJson, comparisonData],
          function(err) {
            if (err) {
              console.error('Ошибка сохранения сравнения:', err);
            }
            
            res.json({
              comparison_id: this?.lastID,
              ...comparison
            });
          }
        );
      } catch (error) {
        console.error('Ошибка сравнения кормов:', error);
        res.status(500).json({ error: 'Ошибка расчета сравнения' });
      }
    });
  });
});

// Сравнить корма с пользовательскими данными животного (без сохранения животного)
router.post('/compare-feeds-quick', (req, res) => {
  const db = getDatabase();
  const { animal_data, feed_ids } = req.body;

  if (!animal_data || !feed_ids || !Array.isArray(feed_ids) || feed_ids.length === 0) {
    return res.status(400).json({ 
      error: 'Необходимо указать animal_data и массив feed_ids' 
    });
  }

  // Валидация данных животного
  const { weight, species, activity_level, age } = animal_data;
  if (!weight || !species || !activity_level || !age) {
    return res.status(400).json({ 
      error: 'Обязательные поля в animal_data: weight, species, activity_level, age' 
    });
  }

  // Получаем данные кормов
  const placeholders = feed_ids.map(() => '?').join(', ');
  const query = `SELECT * FROM feeds WHERE id IN (${placeholders})`;

  db.all(query, feed_ids, (err, feeds) => {
    if (err) {
      console.error('Ошибка получения кормов:', err);
      return res.status(500).json({ error: 'Ошибка сервера' });
    }

    if (feeds.length === 0) {
      return res.status(404).json({ error: 'Корма не найдены' });
    }

    try {
      // Дополняем данные животного значениями по умолчанию
      const completeAnimalData = {
        name: animal_data.name || 'Временный профиль',
        species: animal_data.species,
        weight: animal_data.weight,
        age: animal_data.age,
        gender: animal_data.gender || 'male',
        breed: animal_data.breed || null,
        is_neutered: animal_data.is_neutered || false,
        activity_level: animal_data.activity_level,
        physiological_state: animal_data.physiological_state || 'normal'
      };

      const comparison = compareFeeds(completeAnimalData, feeds);
      res.json(comparison);
    } catch (error) {
      console.error('Ошибка сравнения кормов:', error);
      res.status(500).json({ error: 'Ошибка расчета сравнения' });
    }
  });
});

// Получить историю сравнений для животного
router.get('/comparisons/animal/:animal_id', (req, res) => {
  const db = getDatabase();
  const { animal_id } = req.params;
  const { limit = 10, offset = 0 } = req.query;

  const query = `
    SELECT c.*, a.name as animal_name 
    FROM comparisons c 
    JOIN animals a ON c.animal_id = a.id 
    WHERE c.animal_id = ? 
    ORDER BY c.created_at DESC 
    LIMIT ? OFFSET ?
  `;

  db.all(query, [animal_id, parseInt(limit), parseInt(offset)], (err, rows) => {
    if (err) {
      console.error('Ошибка получения истории сравнений:', err);
      res.status(500).json({ error: 'Ошибка сервера' });
    } else {
      const comparisons = rows.map(row => ({
        id: row.id,
        animal_id: row.animal_id,
        animal_name: row.animal_name,
        feed_ids: JSON.parse(row.feed_ids),
        comparison_data: JSON.parse(row.comparison_data),
        created_at: row.created_at
      }));
      
      res.json(comparisons);
    }
  });
});

// Получить конкретное сравнение по ID
router.get('/comparisons/:id', (req, res) => {
  const db = getDatabase();
  const { id } = req.params;

  const query = `
    SELECT c.*, a.name as animal_name 
    FROM comparisons c 
    JOIN animals a ON c.animal_id = a.id 
    WHERE c.id = ?
  `;

  db.get(query, [id], (err, row) => {
    if (err) {
      console.error('Ошибка получения сравнения:', err);
      res.status(500).json({ error: 'Ошибка сервера' });
    } else if (!row) {
      res.status(404).json({ error: 'Сравнение не найдено' });
    } else {
      const comparison = {
        id: row.id,
        animal_id: row.animal_id,
        animal_name: row.animal_name,
        feed_ids: JSON.parse(row.feed_ids),
        comparison_data: JSON.parse(row.comparison_data),
        created_at: row.created_at
      };
      
      res.json(comparison);
    }
  });
});

// Рассчитать суточную норму корма для животного
router.post('/daily-amount', (req, res) => {
  const { energy_need, feed_calories } = req.body;

  if (!energy_need || !feed_calories) {
    return res.status(400).json({ 
      error: 'Обязательные поля: energy_need, feed_calories' 
    });
  }

  try {
    const dailyAmount = calculateDailyFeedAmount(energy_need, feed_calories);
    
    res.json({
      energy_need,
      feed_calories,
      daily_amount_grams: dailyAmount,
      daily_amount_cups: Math.round((dailyAmount / 120) * 10) / 10 // примерно 120г = 1 чашка
    });
  } catch (error) {
    console.error('Ошибка расчета суточной нормы:', error);
    res.status(500).json({ error: 'Ошибка расчета' });
  }
});

// Рассчитать питательные вещества в суточной норме
router.post('/daily-nutrients', (req, res) => {
  const { daily_amount, feed_nutrients } = req.body;

  if (!daily_amount || !feed_nutrients) {
    return res.status(400).json({ 
      error: 'Обязательные поля: daily_amount, feed_nutrients' 
    });
  }

  try {
    const dailyNutrients = calculateDailyNutrients(daily_amount, feed_nutrients);
    
    res.json({
      daily_amount_grams: daily_amount,
      daily_nutrients: dailyNutrients
    });
  } catch (error) {
    console.error('Ошибка расчета питательных веществ:', error);
    res.status(500).json({ error: 'Ошибка расчета' });
  }
});

// Получить статистику расчетов
router.get('/stats', (req, res) => {
  const db = getDatabase();
  
  const queries = [
    'SELECT COUNT(*) as total_comparisons FROM comparisons',
    'SELECT COUNT(DISTINCT animal_id) as animals_with_comparisons FROM comparisons',
    'SELECT animal_id, COUNT(*) as comparison_count FROM comparisons GROUP BY animal_id ORDER BY comparison_count DESC LIMIT 5'
  ];

  const results = {};
  let completed = 0;

  // Общее количество сравнений
  db.get(queries[0], (err, row) => {
    if (!err) results.totalComparisons = row.total_comparisons;
    if (++completed === 3) res.json(results);
  });

  // Количество животных с сравнениями
  db.get(queries[1], (err, row) => {
    if (!err) results.animalsWithComparisons = row.animals_with_comparisons;
    if (++completed === 3) res.json(results);
  });

  // Топ животных по количеству сравнений
  db.all(queries[2], (err, rows) => {
    if (!err) results.topAnimals = rows;
    if (++completed === 3) res.json(results);
  });
});

module.exports = router; 