const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'data/vetformulab.db');

const createDemoUser = async () => {
  const db = new sqlite3.Database(dbPath);
  
  try {
    // Проверяем есть ли уже демо-пользователь
    const user = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM users WHERE email = ?', ['demo@clinic.com'], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (user) {
      console.log('👤 Демо-пользователь уже существует');
      db.close();
      return;
    }

    // Создаем хеш пароля
    const passwordHash = await bcrypt.hash('demo123', 10);

    // Вставляем демо-пользователя
    await new Promise((resolve, reject) => {
      const insertQuery = `
        INSERT INTO users (email, password_hash, clinic_name, clinic_phone, clinic_address, contact_person, is_active)
        VALUES (?, ?, ?, ?, ?, ?, 1)
      `;

      db.run(insertQuery, [
        'demo@clinic.com',
        passwordHash,
        'Демо Ветклиника',
        '+7 (999) 123-45-67',
        'г. Москва, ул. Демонстрационная, д. 1',
        'Демо Ветеринар'
      ], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });

    console.log('✅ Демо-пользователь создан успешно!');
    console.log('📧 Email: demo@clinic.com');
    console.log('🔑 Пароль: demo123');
    
  } catch (error) {
    console.error('❌ Ошибка создания демо-пользователя:', error);
  } finally {
    db.close();
  }
};

createDemoUser(); 