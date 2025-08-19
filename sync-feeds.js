#!/usr/bin/env node

/**
 * Скрипт для быстрой синхронизации кормов из Google Sheets
 * Запуск: node sync-feeds.js
 */

require('dotenv').config();
const googleSheetsService = require('./src/services/googleSheets');
const { getDatabase } = require('./src/database');

async function syncFeeds() {
  console.log('🔄 Запуск синхронизации кормов из Google Sheets...\n');

  try {
    // 1. Инициализация сервиса
    console.log('1️⃣ Инициализация Google Sheets сервиса...');
    const initialized = await googleSheetsService.initialize();
    if (!initialized) {
      console.log('❌ Не удалось инициализировать сервис');
      return;
    }
    console.log('✅ Сервис инициализирован');

    // 2. Получение данных
    console.log('\n2️⃣ Получение данных из Google Sheets...');
    const feedsData = await googleSheetsService.getFeedsData();
    if (feedsData.length === 0) {
      console.log('⚠️ Нет данных для синхронизации');
      return;
    }
    console.log(`✅ Получено ${feedsData.length} кормов`);

    // 3. Подключение к базе данных
    console.log('\n3️⃣ Подключение к базе данных...');
    const db = getDatabase();
    console.log('✅ База данных подключена');

    // 4. Очистка старых публичных кормов
    console.log('\n4️⃣ Очистка старых публичных кормов...');
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM feeds WHERE user_id IS NULL', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log('✅ Старые корма удалены');

    // 5. Вставка новых данных
    console.log('\n5️⃣ Вставка новых данных...');
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

    for (const feed of feedsData) {
      try {
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

        stmt.run(values);
        imported++;
        console.log(`✅ Импортирован: ${feed.name} (${feed.brand})`);
      } catch (error) {
        errors++;
        console.error(`❌ Ошибка импорта ${feed.name}:`, error.message);
      }
    }

    // 6. Завершение
    stmt.finalize((err) => {
      if (err) {
        console.error('❌ Ошибка завершения:', err);
      } else {
        console.log('\n🎉 Синхронизация завершена!');
        console.log(`📊 Статистика:`);
        console.log(`   ✅ Импортировано: ${imported}`);
        console.log(`   ❌ Ошибок: ${errors}`);
        console.log(`   📦 Всего: ${feedsData.length}`);
        
        // Получаем общую статистику
        db.get('SELECT COUNT(*) as total FROM feeds WHERE user_id IS NULL', (err, result) => {
          if (!err) {
            console.log(`   🗄️ В базе: ${result.total} публичных кормов`);
          }
          process.exit(0);
        });
      }
    });

  } catch (error) {
    console.error('\n❌ Ошибка синхронизации:', error.message);
    process.exit(1);
  }
}

// Запуск синхронизации
if (require.main === module) {
  syncFeeds();
}

module.exports = { syncFeeds };

