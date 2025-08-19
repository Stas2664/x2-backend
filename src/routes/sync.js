const express = require('express');
const router = express.Router();
const googleSheetsService = require('../services/googleSheets');
const { getDatabase } = require('../database');

// Проверка статуса подключения к Google Sheets
router.get('/status', async (req, res) => {
  try {
    const status = await googleSheetsService.checkAccess();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Синхронизация кормов из Google Sheets
router.post('/feeds', async (req, res) => {
  try {
    const { clearExisting = false, range = 'Лист1!A:Z' } = req.body;
    
    console.log('🔄 Начинаю синхронизацию кормов из Google Sheets...');
    
    // Получаем данные из Google Sheets
    const feedsData = await googleSheetsService.getFeedsData(range);
    
    if (feedsData.length === 0) {
      return res.json({
        success: true,
        message: 'Нет данных для синхронизации',
        imported: 0
      });
    }

    const db = getDatabase();
    
    // Транзакция для синхронизации
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');
      
      try {
        // Очищаем существующие публичные корма если требуется
        if (clearExisting) {
          db.run('DELETE FROM feeds WHERE user_id IS NULL', (err) => {
            if (err) {
              console.error('❌ Ошибка при очистке старых кормов:', err);
              db.run('ROLLBACK');
              return res.status(500).json({
                success: false,
                error: 'Ошибка при очистке старых кормов'
              });
            }
            console.log('🗑️ Старые корма удалены');
          });
        }

        // Подготавливаем запрос для вставки
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

        // Вставляем корма
        feedsData.forEach((feed, index) => {
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

            // Проверяем завершение всех операций
            if (imported + errors === feedsData.length) {
              stmt.finalize((finalizeErr) => {
                if (finalizeErr) {
                  console.error('❌ Ошибка завершения импорта:', finalizeErr);
                  db.run('ROLLBACK');
                  return res.status(500).json({
                    success: false,
                    error: 'Ошибка завершения импорта'
                  });
                }

                // Фиксируем транзакцию
                db.run('COMMIT', (commitErr) => {
                  if (commitErr) {
                    console.error('❌ Ошибка фиксации транзакции:', commitErr);
                    return res.status(500).json({
                      success: false,
                      error: 'Ошибка фиксации транзакции'
                    });
                  }

                  console.log(`✅ Синхронизация завершена: ${imported} кормов импортировано, ${errors} ошибок`);
                  
                  res.json({
                    success: true,
                    message: 'Синхронизация завершена успешно',
                    imported,
                    errors,
                    total: feedsData.length
                  });
                });
              });
            }
          });
        });

      } catch (error) {
        console.error('❌ Ошибка в транзакции:', error);
        db.run('ROLLBACK');
        res.status(500).json({
          success: false,
          error: 'Ошибка в транзакции'
        });
      }
    });

  } catch (error) {
    console.error('❌ Ошибка синхронизации:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Получение статистики синхронизации
router.get('/stats', async (req, res) => {
  try {
    const db = getDatabase();
    
    db.get('SELECT COUNT(*) as total_feeds FROM feeds WHERE user_id IS NULL', (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: 'Ошибка получения статистики'
        });
      }

      // Получаем статистику по типам животных
      db.get('SELECT COUNT(*) as dog_feeds FROM feeds WHERE user_id IS NULL AND animal_type = "dog"', (err, dogResult) => {
        if (err) {
          return res.status(500).json({
            success: false,
            error: 'Ошибка получения статистики по собакам'
          });
        }

        db.get('SELECT COUNT(*) as cat_feeds FROM feeds WHERE user_id IS NULL AND animal_type = "cat"', (err, catResult) => {
          if (err) {
            return res.status(500).json({
              success: false,
              error: 'Ошибка получения статистики по кошкам'
            });
          }

          // Получаем последнее обновление
          db.get('SELECT MAX(updated_at) as last_update FROM feeds WHERE user_id IS NULL', (err, updateResult) => {
            if (err) {
              return res.status(500).json({
                success: false,
                error: 'Ошибка получения времени последнего обновления'
              });
            }

            res.json({
              success: true,
              data: {
                total_feeds: result.total_feeds,
                dog_feeds: dogResult.dog_feeds,
                cat_feeds: catResult.cat_feeds,
                last_update: updateResult.last_update,
                google_sheets_url: process.env.GOOGLE_SHEETS_URL
              }
            });
          });
        });
      });
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Принудительная перезагрузка всех кормов
router.post('/feeds/reload', async (req, res) => {
  try {
    console.log('🔄 Принудительная перезагрузка всех кормов из Google Sheets...');
    
    // Получаем данные из Google Sheets
    const feedsData = await googleSheetsService.getFeedsData();
    
    if (feedsData.length === 0) {
      return res.json({
        success: true,
        message: 'Нет данных для перезагрузки',
        imported: 0
      });
    }

    const db = getDatabase();
    
    // Полностью очищаем и перезагружаем
    db.serialize(() => {
      db.run('DELETE FROM feeds WHERE user_id IS NULL', (err) => {
        if (err) {
          console.error('❌ Ошибка при очистке кормов:', err);
          return res.status(500).json({
            success: false,
            error: 'Ошибка при очистке кормов'
          });
        }

        console.log('🗑️ Все публичные корма удалены');

        // Вставляем новые данные
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
            null, // user_id
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
            }

            if (imported + errors === feedsData.length) {
              stmt.finalize((finalizeErr) => {
                if (finalizeErr) {
                  console.error('❌ Ошибка завершения перезагрузки:', finalizeErr);
                  return res.status(500).json({
                    success: false,
                    error: 'Ошибка завершения перезагрузки'
                  });
                }

                console.log(`✅ Перезагрузка завершена: ${imported} кормов импортировано, ${errors} ошибок`);
                
                res.json({
                  success: true,
                  message: 'Перезагрузка завершена успешно',
                  imported,
                  errors,
                  total: feedsData.length
                });
              });
            }
          });
        });
      });
    });

  } catch (error) {
    console.error('❌ Ошибка перезагрузки:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
