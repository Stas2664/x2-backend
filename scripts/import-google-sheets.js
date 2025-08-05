const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const sqlite3 = require('sqlite3').verbose();

// Конфигурация Google Sheets
const SPREADSHEET_ID = '1z_3fgHP9HAupBA9uGW3-_KDVdoWC2WkvBRuexCnVzMA';
const RANGE = 'Лист1!A2:AX1000'; // Диапазон данных (пропускаем заголовки)

// Функции нормализации данных
const normalizeAnimalType = (type) => {
  const map = {
    'Собака': 'dog',
    'Кошка': 'cat',
    'собака': 'dog',
    'кошка': 'cat'
  };
  return map[type] || 'dog';
};

const normalizeFeedType = (type) => {
  const map = {
    'Терапевтический': 'diet',
    'Повседневный': 'adult',
    'лечебный': 'diet',
    'повседневный': 'adult'
  };
  return map[type] || 'adult';
};

const normalizeLifeStage = (stage) => {
  const stageStr = stage.toLowerCase();
  if (stageStr.includes('щенок') || stageStr.includes('puppy')) return 'puppy_medium';
  if (stageStr.includes('котенок') || stageStr.includes('kitten')) return 'kitten';
  if (stageStr.includes('пожилой') || stageStr.includes('senior')) return 'senior';
  if (stageStr.includes('взрослый') || stageStr.includes('adult')) return 'adult';
  return 'adult';
};

const parseNumber = (value) => {
  if (!value || value === '' || value === '-') return null;
  const numStr = String(value).replace(',', '.');
  const num = parseFloat(numStr);
  return isNaN(num) ? null : num;
};

// Функция для получения данных из Google Sheets
async function fetchGoogleSheetsData() {
  try {
    console.log('🔄 Получаем данные из Google Sheets...');
    
    // Создаем публичный доступ к Google Sheets API
    const sheets = google.sheets({ version: 'v4' });
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
      key: process.env.GOOGLE_API_KEY // Если нужен API ключ
    });

    const rows = response.data.values;
    console.log(`📊 Получено ${rows.length} строк данных`);
    
    return rows;
  } catch (error) {
    console.error('❌ Ошибка получения данных из Google Sheets:', error.message);
    throw error;
  }
}

// Альтернативный способ - экспорт в CSV и обработка
async function processGoogleSheetsCSV() {
  try {
    console.log('🔄 Обрабатываем данные из Google Sheets...');
    
    // URL для экспорта Google Sheets в CSV формате
    const csvUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=0`;
    
    console.log('📥 Скачиваем CSV файл...');
    console.log('URL:', csvUrl);
    
    // Для скачивания CSV можно использовать fetch или другой HTTP клиент
    const fetch = require('node-fetch');
    const response = await fetch(csvUrl);
    const csvData = await response.text();
    
    console.log('✅ CSV данные получены');
    
    // Парсим CSV данные
    const rows = csvData.split('\n').map(row => row.split(','));
    
    // Удаляем заголовок
    rows.shift();
    
    console.log(`📊 Найдено ${rows.length} кормов для импорта`);
    
    return rows;
  } catch (error) {
    console.error('❌ Ошибка обработки CSV:', error.message);
    throw error;
  }
}

// Функция преобразования данных в нужный формат
function transformRowToFeed(row, index) {
  // Мапинг колонок согласно структуре таблицы
  // A=0: номер, B=1: животное, C=2: тип, D=3: возраст, E=4: форма, F=5: бренд, G=6: название, H=7: ME, и т.д.
  
  const feed = {
    id: index + 1,
    name: row[6] || 'Неизвестный корм', // Колонка G - название
    brand: row[5] || 'Неизвестный бренд', // Колонка F - бренд
    type: normalizeFeedType(row[2] || 'повседневный'), // Колонка C - тип
    animal_type: normalizeAnimalType(row[1] || 'собака'), // Колонка B - животное
    life_stage: normalizeLifeStage(row[3] || 'взрослый'), // Колонка D - возраст
    composition: {
      crude_protein: parseNumber(row[9]) || 25.0, // Колонка J - белок
      crude_fat: parseNumber(row[10]) || 12.0, // Колонка K - жир
      crude_fiber: parseNumber(row[12]) || 2.5, // Колонка M - клетчатка
      ash: parseNumber(row[13]) || 7.0, // Колонка N - зола
      moisture: parseNumber(row[8]) || 8.0, // Колонка I - влага
      nfe: parseNumber(row[11]) || 45.0, // Колонка L - БЭВ
      calcium: parseNumber(row[14]) || 1.0, // Колонка O - кальций
      phosphorus: parseNumber(row[15]) || 0.8, // Колонка P - фосфор
      sodium: parseNumber(row[16]) || 0.4, // Колонка Q - натрий
      potassium: parseNumber(row[17]) || 0.7, // Колонка R - калий
      magnesium: parseNumber(row[18]) || 0.08, // Колонка S - магний
      iron: parseNumber(row[19]) || 150.0, // Колонка T - железо
      copper: parseNumber(row[21]) || 15.0, // Колонка V - медь
      zinc: parseNumber(row[20]) || 180.0, // Колонка U - цинк
      manganese: parseNumber(row[22]) || 50.0, // Колонка W - марганец
      iodine: parseNumber(row[23]) || 2.5, // Колонка X - йод
      selenium: parseNumber(row[24]) || 0.3 // Колонка Y - селен
    },
    vitamins: {
      vitamin_a: parseNumber(row[25]) || 20000, // Колонка Z - витамин A
      vitamin_d3: parseNumber(row[26]) || 1000, // Колонка AA - витамин D3
      vitamin_e: parseNumber(row[27]) || 500, // Колонка AB - витамин E
      vitamin_k: parseNumber(row[28]) || 0.8, // Колонка AC - витамин K
      vitamin_b1: parseNumber(row[29]) || 25.0, // Колонка AD - витамин B1
      vitamin_b2: parseNumber(row[30]) || 20.0, // Колонка AE - витамин B2
      vitamin_b6: parseNumber(row[31]) || 15.0, // Колонка AF - витамин B6
      vitamin_b12: parseNumber(row[32]) || 0.1, // Колонка AG - витамин B12
      niacin: parseNumber(row[33]) || 400.0, // Колонка AH - ниацин
      pantothenic_acid: parseNumber(row[34]) || 120.0, // Колонка AI - пантотеновая кислота
      folic_acid: parseNumber(row[35]) || 10.0, // Колонка AJ - фолиевая кислота
      biotin: parseNumber(row[36]) || 2.5, // Колонка AK - биотин
      choline: parseNumber(row[37]) || 1500.0 // Колонка AL - холин
    },
    energy: {
      metabolizable_energy: parseNumber(row[7]) || 3700.0, // Колонка H - ME
      digestible_energy: parseNumber(row[7]) ? parseNumber(row[7]) * 1.1 : 4000.0, // Примерно +10%
      gross_energy: parseNumber(row[7]) ? parseNumber(row[7]) * 1.2 : 4400.0 // Примерно +20%
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

// Функция записи данных в JSON файл
async function writeToJSON(feeds) {
  const outputData = {
    feeds: feeds,
    nutritional_requirements: {
      dogs: {
        adult: {
          protein_min: 18.0,
          fat_min: 5.5,
          fiber_max: 4.0,
          moisture_max: 12.0,
          calcium: "0.6-2.5",
          phosphorus: "0.5-1.6",
          sodium_max: 0.4,
          potassium_min: 0.6
        },
        puppy: {
          protein_min: 22.5,
          fat_min: 8.5,
          fiber_max: 4.0,
          moisture_max: 12.0,
          calcium: "1.0-2.5",
          phosphorus: "0.8-1.6"
        },
        senior: {
          protein_min: 18.0,
          fat_min: 5.5,
          fiber_max: 4.0,
          moisture_max: 12.0,
          calcium: "0.6-2.5",
          phosphorus: "0.5-1.6"
        }
      }
    },
    energy_calculations: {
      formulas: {
        rer: "70 * (weight_kg ^ 0.75)",
        mer_intact: "RER * 1.6",
        mer_neutered: "RER * 1.4",
        mer_weight_loss: "RER * 1.0",
        mer_senior: "RER * 1.4",
        mer_puppy_4mo: "RER * 3.0",
        mer_puppy_4_12mo: "RER * 2.0"
      },
      activity_multipliers: {
        низкая_активность: 1.2,
        нормальная_активность: 1.4,
        высокая_активность: 1.6,
        очень_высокая_активность: 1.8,
        беременность_ранняя: 1.8,
        беременность_поздняя: 3.0,
        лактация: 4.0
      }
    }
  };

  const outputPath = path.join(__dirname, '../data/feeds_database_full.json');
  
  try {
    fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf8');
    console.log(`✅ Данные записаны в ${outputPath}`);
    console.log(`📊 Всего кормов: ${feeds.length}`);
  } catch (error) {
    console.error('❌ Ошибка записи файла:', error.message);
    throw error;
  }
}

// Основная функция
async function main() {
  try {
    console.log('🚀 Начинаем импорт данных из Google Sheets...\n');
    
    // Пробуем разные способы получения данных
    let rows;
    
    try {
      rows = await processGoogleSheetsCSV();
    } catch (error) {
      console.log('⚠️ CSV метод не сработал, пробуем через API...');
      rows = await fetchGoogleSheetsData();
    }
    
    if (!rows || rows.length === 0) {
      throw new Error('Не удалось получить данные из таблицы');
    }
    
    console.log(`\n📋 Обрабатываем ${rows.length} строк...`);
    
    // Преобразуем строки в объекты кормов
    const feeds = [];
    let processed = 0;
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      
      // Пропускаем пустые строки
      if (!row || row.length < 7 || !row[6]) {
        continue;
      }
      
      try {
        const feed = transformRowToFeed(row, feeds.length);
        feeds.push(feed);
        processed++;
        
        if (processed % 10 === 0) {
          console.log(`⏳ Обработано: ${processed} кормов...`);
        }
      } catch (error) {
        console.log(`⚠️ Ошибка обработки строки ${i + 1}: ${error.message}`);
      }
    }
    
    console.log(`\n✅ Успешно обработано: ${feeds.length} кормов`);
    
    // Записываем в JSON файл
    await writeToJSON(feeds);
    
    console.log('\n🎉 Импорт завершен успешно!');
    console.log('📁 Файл сохранен как: feeds_database_full.json');
    console.log(`📊 Всего кормов для импорта: ${feeds.length}`);
    
  } catch (error) {
    console.error('\n❌ Ошибка импорта:', error.message);
    process.exit(1);
  }
}

// Запуск скрипта
if (require.main === module) {
  main();
}

module.exports = { main }; 