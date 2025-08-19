#!/usr/bin/env node

/**
 * Скрипт для тестирования интеграции с Google Sheets
 * Запуск: node test-google-sheets.js
 */

require('dotenv').config();
const googleSheetsService = require('./src/services/googleSheets');

async function testGoogleSheetsIntegration() {
  console.log('🧪 Тестирование интеграции с Google Sheets...\n');

  try {
    // 1. Проверка переменных окружения
    console.log('1️⃣ Проверка переменных окружения...');
    const sheetsUrl = process.env.GOOGLE_SHEETS_URL;
    if (!sheetsUrl) {
      console.log('❌ GOOGLE_SHEETS_URL не указан');
      console.log('💡 Создайте файл .env на основе env.example');
      return;
    }
    console.log('✅ GOOGLE_SHEETS_URL:', sheetsUrl);

    // 2. Инициализация сервиса
    console.log('\n2️⃣ Инициализация Google Sheets сервиса...');
    const initialized = await googleSheetsService.initialize();
    if (!initialized) {
      console.log('❌ Не удалось инициализировать сервис');
      return;
    }
    console.log('✅ Сервис инициализирован');

    // 3. Проверка доступа к таблице
    console.log('\n3️⃣ Проверка доступа к таблице...');
    const accessStatus = await googleSheetsService.checkAccess();
    if (!accessStatus.accessible) {
      console.log('❌ Нет доступа к таблице:', accessStatus.error);
      return;
    }
    console.log('✅ Доступ к таблице получен');
    console.log('📊 Название таблицы:', accessStatus.title);
    console.log('📋 Листы:', accessStatus.sheets.join(', '));

    // 4. Получение данных
    console.log('\n4️⃣ Получение данных из таблицы...');
    const feedsData = await googleSheetsService.getFeedsData();
    if (feedsData.length === 0) {
      console.log('⚠️ Таблица пуста или не содержит данных кормов');
      return;
    }
    console.log(`✅ Получено ${feedsData.length} кормов`);

    // 5. Анализ данных
    console.log('\n5️⃣ Анализ полученных данных...');
    const brands = [...new Set(feedsData.map(f => f.brand))];
    const animalTypes = [...new Set(feedsData.map(f => f.animal_type))];
    const categories = [...new Set(feedsData.map(f => f.category))];

    console.log('🏷️ Бренды:', brands.join(', '));
    console.log('🐾 Типы животных:', animalTypes.join(', '));
    console.log('📂 Категории:', categories.join(', '));

    // 6. Примеры данных
    console.log('\n6️⃣ Примеры данных:');
    feedsData.slice(0, 3).forEach((feed, index) => {
      console.log(`\n   Корм ${index + 1}:`);
      console.log(`   📝 Название: ${feed.name}`);
      console.log(`   🏷️ Бренд: ${feed.brand}`);
      console.log(`   🐾 Животное: ${feed.animal_type}`);
      console.log(`   📂 Категория: ${feed.category}`);
      console.log(`   ⚡ МЭ: ${feed.metabolic_energy} ккал/100г`);
      console.log(`   🥩 Белок: ${feed.protein}%`);
      console.log(`   🧈 Жир: ${feed.fat}%`);
    });

    console.log('\n🎉 Тестирование завершено успешно!');
    console.log('💡 Теперь можете запустить сервер и использовать API синхронизации');

  } catch (error) {
    console.error('\n❌ Ошибка тестирования:', error.message);
    console.error('\n🔍 Возможные причины:');
    console.error('   - Неправильная настройка Google Cloud');
    console.error('   - Отсутствие доступа к таблице');
    console.error('   - Неправильные учетные данные');
    console.error('\n📖 См. GOOGLE_SHEETS_SETUP.md для подробной инструкции');
  }
}

// Запуск тестирования
if (require.main === module) {
  testGoogleSheetsIntegration();
}

module.exports = { testGoogleSheetsIntegration };

