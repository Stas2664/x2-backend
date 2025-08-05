const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDatabase } = require('../database');

const router = express.Router();

// Секретный ключ для JWT (в продакшене должен быть в переменных окружения)
const JWT_SECRET = process.env.JWT_SECRET || 'vetformulab_secret_key_2024';

// Middleware для проверки токена
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Токен доступа отсутствует' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Недействительный токен' });
    }
    req.user = user;
    next();
  });
};

// Регистрация новой ветклиники
router.post('/register', async (req, res) => {
  const db = getDatabase();
  const { 
    email, 
    password, 
    clinic_name, 
    clinic_phone, 
    clinic_address, 
    contact_person 
  } = req.body;

  // Валидация
  if (!email || !password || !clinic_name) {
    return res.status(400).json({ 
      error: 'Обязательные поля: email, password, clinic_name' 
    });
  }

  if (password.length < 6) {
    return res.status(400).json({ 
      error: 'Пароль должен содержать минимум 6 символов' 
    });
  }

  // Проверка email формата
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      error: 'Некорректный формат email' 
    });
  }

  try {
    // Проверяем существует ли пользователь
    db.get('SELECT id FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        console.error('Ошибка проверки пользователя:', err);
        return res.status(500).json({ error: 'Ошибка сервера' });
      }

      if (user) {
        return res.status(409).json({ 
          error: 'Ветклиника с таким email уже зарегистрирована' 
        });
      }

      // Хешируем пароль
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Создаем пользователя
      const insertQuery = `
        INSERT INTO users (email, password_hash, clinic_name, clinic_phone, clinic_address, contact_person)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      db.run(insertQuery, [
        email, 
        passwordHash, 
        clinic_name, 
        clinic_phone || null, 
        clinic_address || null, 
        contact_person || null
      ], function(err) {
        if (err) {
          console.error('Ошибка создания пользователя:', err);
          return res.status(500).json({ error: 'Ошибка сервера' });
        }

        // Создаем JWT токен
        const token = jwt.sign(
          { 
            userId: this.lastID, 
            email: email,
            clinicName: clinic_name 
          },
          JWT_SECRET,
          { expiresIn: '30d' }
        );

        // Возвращаем данные пользователя без пароля
        res.status(201).json({
          message: 'Ветклиника успешно зарегистрирована',
          token,
          user: {
            id: this.lastID,
            email,
            clinic_name,
            clinic_phone,
            clinic_address,
            contact_person,
            subscription_type: 'basic',
            created_at: new Date().toISOString()
          }
        });
      });
    });
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Вход в систему
router.post('/login', (req, res) => {
  const db = getDatabase();
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ 
      error: 'Необходимо указать email и пароль' 
    });
  }

  // Ищем пользователя
  db.get('SELECT * FROM users WHERE email = ? AND is_active = 1', [email], async (err, user) => {
    if (err) {
      console.error('Ошибка поиска пользователя:', err);
      return res.status(500).json({ error: 'Ошибка сервера' });
    }

    if (!user) {
      return res.status(401).json({ 
        error: 'Неверный email или пароль' 
      });
    }

    try {
      // Проверяем пароль
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      
      if (!isValidPassword) {
        return res.status(401).json({ 
          error: 'Неверный email или пароль' 
        });
      }

      // Создаем JWT токен
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email,
          clinicName: user.clinic_name 
        },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      // Возвращаем данные пользователя без пароля
      const { password_hash, ...userWithoutPassword } = user;
      
      res.json({
        message: 'Успешный вход в систему',
        token,
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('Ошибка проверки пароля:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  });
});

// Получить профиль текущего пользователя
router.get('/profile', authenticateToken, (req, res) => {
  const db = getDatabase();
  
  db.get('SELECT * FROM users WHERE id = ?', [req.user.userId], (err, user) => {
    if (err) {
      console.error('Ошибка получения профиля:', err);
      return res.status(500).json({ error: 'Ошибка сервера' });
    }

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    // Возвращаем данные без пароля
    const { password_hash, ...userProfile } = user;
    res.json(userProfile);
  });
});

// Обновить профиль
router.put('/profile', authenticateToken, (req, res) => {
  const db = getDatabase();
  const { 
    clinic_name, 
    clinic_phone, 
    clinic_address, 
    contact_person 
  } = req.body;

  if (!clinic_name) {
    return res.status(400).json({ 
      error: 'Название клиники обязательно' 
    });
  }

  const updateQuery = `
    UPDATE users 
    SET clinic_name = ?, clinic_phone = ?, clinic_address = ?, 
        contact_person = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.run(updateQuery, [
    clinic_name,
    clinic_phone || null,
    clinic_address || null,
    contact_person || null,
    req.user.userId
  ], function(err) {
    if (err) {
      console.error('Ошибка обновления профиля:', err);
      return res.status(500).json({ error: 'Ошибка сервера' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json({ message: 'Профиль успешно обновлен' });
  });
});

// Смена пароля
router.put('/change-password', authenticateToken, async (req, res) => {
  const db = getDatabase();
  const { current_password, new_password } = req.body;

  if (!current_password || !new_password) {
    return res.status(400).json({ 
      error: 'Необходимо указать текущий и новый пароль' 
    });
  }

  if (new_password.length < 6) {
    return res.status(400).json({ 
      error: 'Новый пароль должен содержать минимум 6 символов' 
    });
  }

  try {
    // Получаем текущий хеш пароля
    db.get('SELECT password_hash FROM users WHERE id = ?', [req.user.userId], async (err, user) => {
      if (err) {
        console.error('Ошибка получения пользователя:', err);
        return res.status(500).json({ error: 'Ошибка сервера' });
      }

      if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }

      // Проверяем текущий пароль
      const isValidPassword = await bcrypt.compare(current_password, user.password_hash);
      
      if (!isValidPassword) {
        return res.status(401).json({ 
          error: 'Неверный текущий пароль' 
        });
      }

      // Хешируем новый пароль
      const saltRounds = 10;
      const newPasswordHash = await bcrypt.hash(new_password, saltRounds);

      // Обновляем пароль
      db.run(
        'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [newPasswordHash, req.user.userId],
        (err) => {
          if (err) {
            console.error('Ошибка обновления пароля:', err);
            return res.status(500).json({ error: 'Ошибка сервера' });
          }

          res.json({ message: 'Пароль успешно изменен' });
        }
      );
    });
  } catch (error) {
    console.error('Ошибка смены пароля:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Проверить токен (для фронтенда)
router.get('/verify', authenticateToken, (req, res) => {
  res.json({ 
    valid: true, 
    user: {
      userId: req.user.userId,
      email: req.user.email,
      clinicName: req.user.clinicName
    }
  });
});

// Статистика по клинике
router.get('/stats', authenticateToken, (req, res) => {
  const db = getDatabase();
  const userId = req.user.userId;
  
  const queries = [
    'SELECT COUNT(*) as animals_count FROM animals WHERE user_id = ?',
    'SELECT COUNT(*) as comparisons_count FROM comparisons WHERE user_id = ?',
    'SELECT COUNT(*) as custom_feeds_count FROM feeds WHERE user_id = ?'
  ];

  const results = {};
  let completed = 0;

  // Количество животных
  db.get(queries[0], [userId], (err, row) => {
    if (!err) results.animals_count = row.animals_count;
    if (++completed === 3) res.json(results);
  });

  // Количество сравнений
  db.get(queries[1], [userId], (err, row) => {
    if (!err) results.comparisons_count = row.comparisons_count;
    if (++completed === 3) res.json(results);
  });

  // Количество пользовательских кормов
  db.get(queries[2], [userId], (err, row) => {
    if (!err) results.custom_feeds_count = row.custom_feeds_count;
    if (++completed === 3) res.json(results);
  });
});

module.exports = { router, authenticateToken }; 