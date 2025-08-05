const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database');
const { calculateMER } = require('../utils/calculations');
const { authenticateToken } = require('./auth');

// Получить всех животных текущего пользователя
router.get('/', authenticateToken, (req, res) => {
  const db = getDatabase();
  const userId = req.user.userId;
  
  db.all('SELECT * FROM animals WHERE user_id = ? ORDER BY created_at DESC', [userId], (err, rows) => {
    if (err) {
      console.error('Ошибка получения животных:', err);
      res.status(500).json({ error: 'Ошибка сервера' });
    } else {
      res.json(rows);
    }
  });
});

// Получить животное по ID (только своего)
router.get('/:id', authenticateToken, (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  const userId = req.user.userId;
  
  db.get('SELECT * FROM animals WHERE id = ? AND user_id = ?', [id, userId], (err, row) => {
    if (err) {
      console.error('Ошибка получения животного:', err);
      res.status(500).json({ error: 'Ошибка сервера' });
    } else if (!row) {
      res.status(404).json({ error: 'Животное не найдено' });
    } else {
      res.json(row);
    }
  });
});

// Создать новое животное
router.post('/', authenticateToken, (req, res) => {
  const db = getDatabase();
  const userId = req.user.userId;
  const {
    name,
    species,
    weight,
    age,
    gender,
    breed,
    is_neutered,
    activity_level,
    physiological_state,
    owner_name,
    owner_phone,
    medical_notes
  } = req.body;

  // Валидация
  if (!name || !species || !weight || !age || !gender || !activity_level) {
    return res.status(400).json({ 
      error: 'Обязательные поля: name, species, weight, age, gender, activity_level' 
    });
  }

  if (!['dog', 'cat', 'ferret'].includes(species)) {
    return res.status(400).json({ error: 'Некорректный вид животного' });
  }

  if (!['male', 'female'].includes(gender)) {
    return res.status(400).json({ error: 'Некорректный пол' });
  }

  if (!['low', 'moderate', 'high', 'very_high'].includes(activity_level)) {
    return res.status(400).json({ error: 'Некорректный уровень активности' });
  }

  // Расчет энергетической потребности
  const metabolic_energy_need = calculateMER(
    weight,
    species,
    activity_level,
    physiological_state || 'normal',
    is_neutered || false,
    age
  );

  const query = `INSERT INTO animals (
    user_id, name, species, weight, age, gender, breed, is_neutered, 
    activity_level, physiological_state, metabolic_energy_need, owner_name, owner_phone, medical_notes
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.run(query, [
    userId, name, species, weight, age, gender, breed || null, 
    is_neutered || false, activity_level, physiological_state || 'normal',
    metabolic_energy_need, owner_name || null, owner_phone || null, medical_notes || null
  ], function(err) {
    if (err) {
      console.error('Ошибка создания животного:', err);
      res.status(500).json({ error: 'Ошибка сервера' });
    } else {
      // Получить созданное животное
      db.get('SELECT * FROM animals WHERE id = ?', [this.lastID], (err, row) => {
        if (err) {
          console.error('Ошибка получения созданного животного:', err);
          res.status(500).json({ error: 'Ошибка сервера' });
        } else {
          res.status(201).json(row);
        }
      });
    }
  });
});

// Обновить животное (только свое)
router.put('/:id', authenticateToken, (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  const userId = req.user.userId;
  const {
    name,
    species,
    weight,
    age,
    gender,
    breed,
    is_neutered,
    activity_level,
    physiological_state,
    owner_name,
    owner_phone,
    medical_notes
  } = req.body;

  // Проверяем, существует ли животное и принадлежит ли оно пользователю
  db.get('SELECT * FROM animals WHERE id = ? AND user_id = ?', [id, userId], (err, existingAnimal) => {
    if (err) {
      console.error('Ошибка проверки животного:', err);
      return res.status(500).json({ error: 'Ошибка сервера' });
    }

    if (!existingAnimal) {
      return res.status(404).json({ error: 'Животное не найдено' });
    }

    // Используем существующие значения, если новые не предоставлены
    const updatedData = {
      name: name || existingAnimal.name,
      species: species || existingAnimal.species,
      weight: weight || existingAnimal.weight,
      age: age || existingAnimal.age,
      gender: gender || existingAnimal.gender,
      breed: breed !== undefined ? breed : existingAnimal.breed,
      is_neutered: is_neutered !== undefined ? is_neutered : existingAnimal.is_neutered,
      activity_level: activity_level || existingAnimal.activity_level,
      physiological_state: physiological_state || existingAnimal.physiological_state,
      owner_name: owner_name !== undefined ? owner_name : existingAnimal.owner_name,
      owner_phone: owner_phone !== undefined ? owner_phone : existingAnimal.owner_phone,
      medical_notes: medical_notes !== undefined ? medical_notes : existingAnimal.medical_notes
    };

    // Пересчитываем энергетическую потребность
    const metabolic_energy_need = calculateMER(
      updatedData.weight,
      updatedData.species,
      updatedData.activity_level,
      updatedData.physiological_state,
      updatedData.is_neutered,
      updatedData.age
    );

    const query = `UPDATE animals SET 
      name = ?, species = ?, weight = ?, age = ?, gender = ?, breed = ?, 
      is_neutered = ?, activity_level = ?, physiological_state = ?, 
      metabolic_energy_need = ?, owner_name = ?, owner_phone = ?, medical_notes = ?,
      updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?`;

    db.run(query, [
      updatedData.name, updatedData.species, updatedData.weight, updatedData.age,
      updatedData.gender, updatedData.breed, updatedData.is_neutered,
      updatedData.activity_level, updatedData.physiological_state,
      metabolic_energy_need, updatedData.owner_name, updatedData.owner_phone, 
      updatedData.medical_notes, id, userId
    ], function(err) {
      if (err) {
        console.error('Ошибка обновления животного:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
      } else {
        // Получить обновленное животное
        db.get('SELECT * FROM animals WHERE id = ?', [id], (err, row) => {
          if (err) {
            console.error('Ошибка получения обновленного животного:', err);
            res.status(500).json({ error: 'Ошибка сервера' });
          } else {
            res.json(row);
          }
        });
      }
    });
  });
});

// Удалить животное (только свое)
router.delete('/:id', authenticateToken, (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  const userId = req.user.userId;

  // Проверяем, существует ли животное и принадлежит ли оно пользователю
  db.get('SELECT * FROM animals WHERE id = ? AND user_id = ?', [id, userId], (err, row) => {
    if (err) {
      console.error('Ошибка проверки животного:', err);
      return res.status(500).json({ error: 'Ошибка сервера' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Животное не найдено' });
    }

    // Удаляем животное
    db.run('DELETE FROM animals WHERE id = ? AND user_id = ?', [id, userId], function(err) {
      if (err) {
        console.error('Ошибка удаления животного:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
      } else {
        res.json({ message: 'Животное успешно удалено' });
      }
    });
  });
});

// Рассчитать энергетическую потребность для животного (только своего)
router.post('/:id/calculate-energy', authenticateToken, (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  const userId = req.user.userId;

  db.get('SELECT * FROM animals WHERE id = ? AND user_id = ?', [id, userId], (err, animal) => {
    if (err) {
      console.error('Ошибка получения животного:', err);
      return res.status(500).json({ error: 'Ошибка сервера' });
    }

    if (!animal) {
      return res.status(404).json({ error: 'Животное не найдено' });
    }

    const energyNeed = calculateMER(
      animal.weight,
      animal.species,
      animal.activity_level,
      animal.physiological_state,
      animal.is_neutered,
      animal.age
    );

    // Обновляем энергетическую потребность в базе
    db.run('UPDATE animals SET metabolic_energy_need = ? WHERE id = ? AND user_id = ?', [energyNeed, id, userId], (err) => {
      if (err) {
        console.error('Ошибка обновления энергетической потребности:', err);
        return res.status(500).json({ error: 'Ошибка сервера' });
      }

      res.json({ 
        animal_id: id,
        metabolic_energy_need: energyNeed,
        message: 'Энергетическая потребность рассчитана и обновлена'
      });
    });
  });
});

module.exports = router; 