const { google } = require('googleapis');
const { JWT } = require('google-auth-library');
const path = require('path');
const fs = require('fs');

class GoogleSheetsService {
  constructor() {
    this.sheets = null;
    this.spreadsheetId = null;
    this.initialized = false;
  }

  // Инициализация сервиса
  async initialize() {
    try {
      // Получаем ID таблицы из переменной окружения или URL
      const sheetsUrl = process.env.GOOGLE_SHEETS_URL;
      if (!sheetsUrl) {
        throw new Error('GOOGLE_SHEETS_URL не указан в переменных окружения');
      }

      // Извлекаем ID таблицы из URL
      this.spreadsheetId = this.extractSpreadsheetId(sheetsUrl);
      if (!this.spreadsheetId) {
        throw new Error('Не удалось извлечь ID таблицы из URL');
      }

      // Настройка аутентификации
      const auth = await this.authenticate();
      this.sheets = google.sheets({ version: 'v4', auth });
      
      this.initialized = true;
      console.log(`✅ Google Sheets сервис инициализирован для таблицы: ${this.spreadsheetId}`);
      
      return true;
    } catch (error) {
      console.error('❌ Ошибка инициализации Google Sheets сервиса:', error.message);
      return false;
    }
  }

  // Извлечение ID таблицы из URL
  extractSpreadsheetId(url) {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  }

  // Аутентификация через Service Account
  async authenticate() {
    try {
      // Проверяем наличие файла ключей
      const keyFilePath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE || 
                         path.join(__dirname, '../../google-service-account-key.json');
      
      if (fs.existsSync(keyFilePath)) {
        // Аутентификация через файл ключей
        const keyFile = JSON.parse(fs.readFileSync(keyFilePath, 'utf8'));
        const auth = new JWT({
          email: keyFile.client_email,
          key: keyFile.private_key,
          scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
        });
        
        await auth.authorize();
        console.log('🔐 Аутентификация через Service Account успешна');
        return auth;
      } else {
        // Аутентификация через переменные окружения
        const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
        const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
        
        if (!clientEmail || !privateKey) {
          throw new Error('Не найдены учетные данные Google Service Account');
        }

        const auth = new JWT({
          email: clientEmail,
          key: privateKey,
          scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
        });
        
        await auth.authorize();
        console.log('🔐 Аутентификация через переменные окружения успешна');
        return auth;
      }
    } catch (error) {
      console.error('❌ Ошибка аутентификации Google Sheets:', error.message);
      throw error;
    }
  }

  // Получение данных из таблицы
  async getFeedsData(range = 'Лист1!A:Z') {
    if (!this.initialized) {
      throw new Error('Google Sheets сервис не инициализирован');
    }

    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: range
      });

      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        console.log('⚠️ Google Sheets: таблица пуста');
        return [];
      }

      console.log(`📊 Получено ${rows.length} строк из Google Sheets`);
      return this.parseFeedsData(rows);
    } catch (error) {
      console.error('❌ Ошибка получения данных из Google Sheets:', error.message);
      throw error;
    }
  }

  // Парсинг данных кормов
  parseFeedsData(rows) {
    if (rows.length < 2) return [];

    const headers = rows[0].map(h => String(h || '').trim());
    const feeds = [];

    // Индексы колонок
    const idx = {
      name: this.findColumnIndex(headers, ['назв', 'name', 'название']),
      brand: this.findColumnIndex(headers, ['бренд', 'торгов', 'производитель']),
      type: this.findColumnIndex(headers, ['тип', 'вид корма']),
      animal: this.findColumnIndex(headers, ['собак', 'кош', 'вид живот', 'животное']),
      category: this.findColumnIndex(headers, ['категор', 'назначен', 'возраст', 'стадия']),
      me: this.findColumnIndex(headers, ['мэ', 'ккал/кг', 'энерг', 'энергетическая ценность']),
      protein: this.findColumnIndex(headers, ['белок', 'протеин', 'crude protein']),
      fat: this.findColumnIndex(headers, ['жир', 'crude fat']),
      fiber: this.findColumnIndex(headers, ['клетчат', 'crude fiber']),
      ash: this.findColumnIndex(headers, ['зола', 'ash']),
      moisture: this.findColumnIndex(headers, ['влага', 'влажн', 'moisture']),
      calcium: this.findColumnIndex(headers, ['кальц', 'calcium', 'ca']),
      phosphorus: this.findColumnIndex(headers, ['фосфор', 'phosphorus', 'p']),
      vitamin_a: this.findColumnIndex(headers, ['витамин а', 'vitamin a', 'a']),
      vitamin_d3: this.findColumnIndex(headers, ['витамин d', 'vitamin d', 'd3']),
      ingredients: this.findColumnIndex(headers, ['ингредиент', 'состав', 'ingredients'])
    };

    // Обработка строк данных
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;

      const feed = this.parseFeedRow(row, idx, headers);
      if (feed) {
        feeds.push(feed);
      }
    }

    console.log(`✅ Парсинг завершен: ${feeds.length} кормов`);
    return feeds;
  }

  // Поиск индекса колонки по ключевым словам
  findColumnIndex(headers, keywords) {
    return headers.findIndex(h => {
      const low = h.toLowerCase();
      return keywords.some(keyword => low.includes(keyword.toLowerCase()));
    });
  }

  // Парсинг одной строки корма
  parseFeedRow(row, idx, headers) {
    try {
      const name = String(row[idx.name] || '').trim();
      const brand = String(row[idx.brand] || '').trim();
      
      if (!name) return null;

      const feed = {
        name: name,
        brand: brand,
        type: this.mapFeedType(row[idx.type]),
        animal_type: this.mapAnimalType(row[idx.animal]),
        category: this.mapCategory(row[idx.category]),
        metabolic_energy: this.toNumber(row[idx.me]),
        protein: this.toNumber(row[idx.protein]),
        fat: this.toNumber(row[idx.fat]),
        fiber: this.toNumber(row[idx.fiber]),
        ash: this.toNumber(row[idx.ash]),
        moisture: this.toNumber(row[idx.moisture]),
        calcium: this.normalizeCaP(row[idx.calcium], headers[idx.calcium]),
        phosphorus: this.normalizeCaP(row[idx.phosphorus], headers[idx.phosphorus]),
        vitamin_a: this.toNumber(row[idx.vitamin_a]),
        vitamin_d: this.toNumber(row[idx.vitamin_d3]),
        ingredients: String(row[idx.ingredients] || ''),
        // Вычисляем углеводы
        carbohydrates: this.calculateCarbohydrates(row, idx),
        // Дополнительные поля
        sodium: 0,
        potassium: 0,
        magnesium: 0,
        iron: 0,
        zinc: 0,
        copper: 0,
        manganese: 0,
        selenium: 0,
        iodine: 0,
        vitamin_e: 0,
        vitamin_k: 0,
        vitamin_b1: 0,
        vitamin_b2: 0,
        vitamin_b3: 0,
        vitamin_b5: 0,
        vitamin_b6: 0,
        vitamin_b7: 0,
        vitamin_b9: 0,
        vitamin_b12: 0,
        vitamin_c: 0,
        notes: '',
        price_per_kg: 1000,
        is_available: true,
        is_public: true
      };

      return feed;
    } catch (error) {
      console.error(`❌ Ошибка парсинга строки ${row}:`, error.message);
      return null;
    }
  }

  // Маппинг типа корма
  mapFeedType(type) {
    if (!type) return 'dry';
    const s = String(type).toLowerCase();
    if (s.includes('сух')) return 'dry';
    if (s.includes('влаж')) return 'wet';
    if (s.includes('лаком') || s.includes('дополн') || s.includes('treat')) return 'treats';
    return 'dry';
  }

  // Маппинг типа животного
  mapAnimalType(animal) {
    if (!animal) return 'dog';
    const s = String(animal).toLowerCase();
    if (s.includes('кош')) return 'cat';
    if (s.includes('соб')) return 'dog';
    if (s.includes('both') || s.includes('оба')) return 'both';
    return 'dog';
  }

  // Маппинг категории
  mapCategory(category) {
    if (!category) return 'adult';
    const s = String(category).toLowerCase();
    if (s.includes('щен') || s.includes('котен')) return 'puppy_small';
    if (s.includes('пожил') || s.includes('senior')) return 'senior';
    if (s.includes('вес') || s.includes('похуд') || s.includes('weight')) return 'weight_loss';
    if (s.includes('диет') || s.includes('therap')) return 'diet';
    return 'adult';
  }

  // Конвертация в число
  toNumber(value) {
    if (value === undefined || value === null) return 0;
    if (typeof value === 'number') return value;
    const s = String(value).replace(/[^0-9,\.\-]/g, '').replace(',', '.');
    const n = parseFloat(s);
    return Number.isFinite(n) ? n : 0;
  }

  // Нормализация кальция и фосфора
  normalizeCaP(value, header) {
    const n = this.toNumber(value);
    const h = String(header || '').toLowerCase();
    if (h.includes('мг') || n > 10) return n; // уже мг/100г
    return Math.round(n * 1000); // % -> мг/100г
  }

  // Вычисление углеводов
  calculateCarbohydrates(row, idx) {
    const protein = this.toNumber(row[idx.protein]);
    const fat = this.toNumber(row[idx.fat]);
    const fiber = this.toNumber(row[idx.fiber]);
    const ash = this.toNumber(row[idx.ash]);
    const moisture = this.toNumber(row[idx.moisture]);
    
    if (protein || fat || fiber || ash || moisture) {
      return Math.max(0, 100 - (protein + fat + fiber + ash + moisture));
    }
    return 0;
  }

  // Проверка доступности таблицы
  async checkAccess() {
    try {
      if (!this.initialized) {
        await this.initialize();
      }
      
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId
      });
      
      return {
        accessible: true,
        title: response.data.properties.title,
        sheets: response.data.sheets.map(s => s.properties.title)
      };
    } catch (error) {
      return {
        accessible: false,
        error: error.message
      };
    }
  }
}

module.exports = new GoogleSheetsService();
