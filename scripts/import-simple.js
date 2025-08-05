const fs = require('fs');
const path = require('path');
const https = require('https');

console.log('🚀 Запуск импорта кормов из Google Sheets...\n');

// Функции нормализации данных
const normalizeAnimalType = (type) => {
  if (!type) return 'dog';
  const typeStr = type.toLowerCase();
  if (typeStr.includes('собака') || typeStr.includes('dog')) return 'dog';
  if (typeStr.includes('кошка') || typeStr.includes('cat')) return 'cat';
  return 'dog';
};

const normalizeFeedType = (type) => {
  if (!type) return 'adult';
  const typeStr = type.toLowerCase();
  if (typeStr.includes('терапевтический') || typeStr.includes('лечебный')) return 'diet';
  if (typeStr.includes('повседневный') || typeStr.includes('adult')) return 'adult';
  return 'adult';
};

const normalizeLifeStage = (stage) => {
  if (!stage) return 'adult';
  const stageStr = stage.toLowerCase();
  if (stageStr.includes('щенок') || stageStr.includes('puppy')) return 'puppy_medium';
  if (stageStr.includes('котенок') || stageStr.includes('kitten')) return 'kitten';
  if (stageStr.includes('пожилой') || stageStr.includes('senior')) return 'senior';
  return 'adult';
};

const parseNumber = (value) => {
  if (!value || value === '' || value === '-') return null;
  const numStr = String(value).replace(',', '.');
  const num = parseFloat(numStr);
  return isNaN(num) ? null : num;
};

// Функция для скачивания CSV из Google Sheets
function downloadCSV(url) {
  return new Promise((resolve, reject) => {
    console.log('📥 Скачиваем данные из Google Sheets...');
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP статус: ${response.statusCode}`));
        return;
      }
      
      let data = '';
      response.setEncoding('utf8');
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        console.log('✅ Данные успешно получены');
        resolve(data);
      });
      
    }).on('error', (error) => {
      reject(error);
    });
  });
}

// Функция для парсинга CSV
function parseCSV(csvData) {
  console.log('📋 Парсим CSV данные...');
  
  const lines = csvData.split('\n');
  const rows = [];
  
  for (let i = 1; i < lines.length; i++) { // Пропускаем заголовок
    const line = lines[i].trim();
    if (!line) continue;
    
    // Простой парсинг CSV (может быть неточным для сложных случаев)
    const row = line.split(',').map(cell => cell.replace(/"/g, '').trim());
    
    if (row.length > 6 && row[6]) { // Проверяем что есть название корма
      rows.push(row);
    }
  }
  
  console.log(`📊 Найдено ${rows.length} строк с данными`);
  return rows;
}

// Функция преобразования строки в объект корма
function transformRowToFeed(row, index) {
  const feed = {
    id: index + 1,
    name: row[6] || `Корм ${index + 1}`,
    brand: row[5] || 'Неизвестный бренд',
    type: normalizeFeedType(row[2]),
    animal_type: normalizeAnimalType(row[1]),
    life_stage: normalizeLifeStage(row[3]),
    composition: {
      crude_protein: parseNumber(row[9]) || 25.0,
      crude_fat: parseNumber(row[10]) || 12.0,
      crude_fiber: parseNumber(row[12]) || 2.5,
      ash: parseNumber(row[13]) || 7.0,
      moisture: parseNumber(row[8]) || 8.0,
      nfe: parseNumber(row[11]) || 45.0,
      calcium: parseNumber(row[14]) || 1.0,
      phosphorus: parseNumber(row[15]) || 0.8,
      sodium: parseNumber(row[16]) || 0.4,
      potassium: parseNumber(row[17]) || 0.7,
      magnesium: parseNumber(row[18]) || 0.08,
      iron: parseNumber(row[19]) || 150.0,
      copper: parseNumber(row[21]) || 15.0,
      zinc: parseNumber(row[20]) || 180.0,
      manganese: parseNumber(row[22]) || 50.0,
      iodine: parseNumber(row[23]) || 2.5,
      selenium: parseNumber(row[24]) || 0.3
    },
    vitamins: {
      vitamin_a: parseNumber(row[25]) || 20000,
      vitamin_d3: parseNumber(row[26]) || 1000,
      vitamin_e: parseNumber(row[27]) || 500,
      vitamin_k: parseNumber(row[28]) || 0.8,
      vitamin_b1: parseNumber(row[29]) || 25.0,
      vitamin_b2: parseNumber(row[30]) || 20.0,
      vitamin_b6: parseNumber(row[31]) || 15.0,
      vitamin_b12: parseNumber(row[32]) || 0.1,
      niacin: parseNumber(row[33]) || 400.0,
      pantothenic_acid: parseNumber(row[34]) || 120.0,
      folic_acid: parseNumber(row[35]) || 10.0,
      biotin: parseNumber(row[36]) || 2.5,
      choline: parseNumber(row[37]) || 1500.0
    },
    energy: {
      metabolizable_energy: parseNumber(row[7]) || 3700.0,
      digestible_energy: parseNumber(row[7]) ? parseNumber(row[7]) * 1.1 : 4000.0,
      gross_energy: parseNumber(row[7]) ? parseNumber(row[7]) * 1.2 : 4400.0
    },
    feeding_guide: {
      weight_5kg: "70-90g",
      weight_10kg: "120-150g",
      weight_15kg: "165-205g",
      weight_20kg: "200-255g",
      weight_25kg: "235-295g"
    }
  };
  
  return feed;
}

// Основная функция импорта
async function importFeeds() {
  try {
    // URL для экспорта Google Sheets в CSV
    const csvUrl = 'https://docs.google.com/spreadsheets/d/1z_3fgHP9HAupBA9uGW3-_KDVdoWC2WkvBRuexCnVzMA/export?format=csv&gid=0';
    
    // Скачиваем CSV данные
    const csvData = await downloadCSV(csvUrl);
    
    // Парсим CSV
    const rows = parseCSV(csvData);
    
    if (rows.length === 0) {
      throw new Error('Не найдено данных для импорта');
    }
    
    // Загружаем существующие корма
    console.log('📖 Загружаем существующие корма...');
    let existingFeeds = [];
    const existingPath = path.join(__dirname, '../data/feeds_database.json');
    
    try {
      const existingData = fs.readFileSync(existingPath, 'utf8');
      const parsed = JSON.parse(existingData);
      existingFeeds = parsed.feeds || [];
      console.log(`📦 Найдено ${existingFeeds.length} существующих кормов`);
    } catch (error) {
      console.log('⚠️ Файл с существующими кормами не найден, создаем новый');
    }
    
    // Преобразуем новые корма
    console.log('🔄 Обрабатываем новые корма...');
    const newFeeds = [];
    let processed = 0;
    
    for (let i = 0; i < rows.length && processed < 114; i++) {
      try {
        const feed = transformRowToFeed(rows[i], existingFeeds.length + processed);
        newFeeds.push(feed);
        processed++;
        
        if (processed % 20 === 0) {
          console.log(`⏳ Обработано: ${processed} кормов...`);
        }
      } catch (error) {
        console.log(`⚠️ Ошибка обработки строки ${i + 1}: ${error.message}`);
      }
    }
    
    // Объединяем все корма
    const allFeeds = [...existingFeeds, ...newFeeds];
    
    console.log(`\n✅ Всего кормов: ${allFeeds.length}`);
    console.log(`📈 Добавлено новых: ${newFeeds.length}`);
    
    // Создаем полную структуру данных
    const outputData = {
      feeds: allFeeds,
      nutritional_requirements: {
        dogs: {
          adult: { protein_min: 18.0, fat_min: 5.5, fiber_max: 4.0, moisture_max: 12.0 },
          puppy: { protein_min: 22.5, fat_min: 8.5, fiber_max: 4.0, moisture_max: 12.0 },
          senior: { protein_min: 18.0, fat_min: 5.5, fiber_max: 4.0, moisture_max: 12.0 }
        }
      },
      energy_calculations: {
        formulas: {
          rer: "70 * (weight_kg ^ 0.75)",
          mer_intact: "RER * 1.6",
          mer_neutered: "RER * 1.4"
        }
      }
    };
    
    // Сохраняем результат
    const outputPath = path.join(__dirname, '../data/feeds_database.json');
    fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf8');
    
    console.log('\n🎉 Импорт завершен успешно!');
    console.log(`📁 Файл обновлен: ${outputPath}`);
    console.log(`📊 Общее количество кормов: ${allFeeds.length}`);
    
    // Показываем примеры импортированных кормов
    console.log('\n📋 Примеры импортированных кормов:');
    newFeeds.slice(0, 3).forEach((feed, i) => {
      console.log(`${i + 1}. ${feed.name} (${feed.brand}) - ${feed.animal_type}/${feed.life_stage}`);
    });
    
    return allFeeds.length;
    
  } catch (error) {
    console.error('\n❌ Ошибка импорта:', error.message);
    process.exit(1);
  }
}

// Запуск
if (require.main === module) {
  importFeeds();
}

module.exports = { importFeeds }; 