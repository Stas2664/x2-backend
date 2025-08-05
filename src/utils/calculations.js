// Расчет энергетической потребности животных

/**
 * Расчет базального метаболизма (RER - Resting Energy Requirement)
 * Формула: RER = 70 × (вес в кг)^0.75
 * @param {number} weight - вес животного в кг
 * @returns {number} базальный метаболизм в ккал/день
 */
function calculateRER(weight) {
  return 70 * Math.pow(weight, 0.75);
}

/**
 * Расчет общей энергетической потребности (MER - Maintenance Energy Requirement)
 * @param {number} weight - вес животного в кг
 * @param {string} species - вид животного ('dog', 'cat', 'ferret')
 * @param {string} activityLevel - уровень активности
 * @param {string} physiologicalState - физиологическое состояние
 * @param {boolean} isNeutered - кастрировано ли животное
 * @param {number} age - возраст в месяцах
 * @returns {number} общая энергетическая потребность в ккал/день
 */
function calculateMER(weight, species, activityLevel, physiologicalState, isNeutered, age) {
  const rer = calculateRER(weight);
  let multiplier = 1.0;

  // Базовые коэффициенты по видам
  if (species === 'dog') {
    // Коэффициенты для собак
    if (age < 4) { // щенки до 4 месяцев
      multiplier = 3.0;
    } else if (age < 12) { // щенки 4-12 месяцев
      multiplier = 2.0;
    } else if (isNeutered) {
      multiplier = 1.6;
    } else {
      multiplier = 1.8;
    }

    // Корректировка по активности
    switch (activityLevel) {
      case 'low':
        multiplier *= 0.8;
        break;
      case 'moderate':
        multiplier *= 1.0;
        break;
      case 'high':
        multiplier *= 1.2;
        break;
      case 'very_high':
        multiplier *= 1.4;
        break;
    }
  } else if (species === 'cat') {
    // Коэффициенты для кошек
    if (age < 4) { // котята до 4 месяцев
      multiplier = 2.5;
    } else if (age < 12) { // котята 4-12 месяцев
      multiplier = 1.6;
    } else if (isNeutered) {
      multiplier = 1.2;
    } else {
      multiplier = 1.4;
    }

    // Кошки менее активны, поэтому меньшие коэффициенты
    switch (activityLevel) {
      case 'low':
        multiplier *= 0.9;
        break;
      case 'moderate':
        multiplier *= 1.0;
        break;
      case 'high':
        multiplier *= 1.1;
        break;
      case 'very_high':
        multiplier *= 1.2;
        break;
    }
  } else if (species === 'ferret') {
    // Коэффициенты для хорьков (высокий метаболизм)
    if (age < 6) { // молодые хорьки
      multiplier = 3.5;
    } else if (isNeutered) {
      multiplier = 2.0;
    } else {
      multiplier = 2.5;
    }

    // Хорьки очень активны
    switch (activityLevel) {
      case 'low':
        multiplier *= 0.9;
        break;
      case 'moderate':
        multiplier *= 1.0;
        break;
      case 'high':
        multiplier *= 1.2;
        break;
      case 'very_high':
        multiplier *= 1.4;
        break;
    }
  }

  // Корректировка по физиологическому состоянию
  switch (physiologicalState) {
    case 'pregnant':
      if (species === 'dog') {
        multiplier *= 1.5; // последние 3 недели беременности
      } else if (species === 'cat') {
        multiplier *= 1.6;
      } else if (species === 'ferret') {
        multiplier *= 1.5;
      }
      break;
    case 'lactating':
      if (species === 'dog') {
        multiplier *= 2.0; // пик лактации
      } else if (species === 'cat') {
        multiplier *= 2.5;
      } else if (species === 'ferret') {
        multiplier *= 3.0;
      }
      break;
    case 'growth':
      // Уже учтено в возрастных коэффициентах
      break;
    case 'senior':
      if (age > 84) { // старше 7 лет
        multiplier *= 0.9; // снижение метаболизма
      }
      break;
  }

  return Math.round(rer * multiplier);
}

/**
 * Расчет суточной нормы корма
 * @param {number} energyNeed - энергетическая потребность в ккал/день
 * @param {number} feedCalories - калорийность корма в ккал/100г
 * @returns {number} суточная норма корма в граммах
 */
function calculateDailyFeedAmount(energyNeed, feedCalories) {
  return Math.round((energyNeed / feedCalories) * 100);
}

/**
 * Расчет содержания питательных веществ в суточной норме
 * @param {number} dailyAmount - суточная норма корма в граммах
 * @param {object} feedNutrients - питательные вещества корма на 100г
 * @returns {object} содержание питательных веществ в суточной норме
 */
function calculateDailyNutrients(dailyAmount, feedNutrients) {
  const multiplier = dailyAmount / 100;
  const dailyNutrients = {};

  // Макронутриенты
  if (feedNutrients.protein) dailyNutrients.protein = Math.round(feedNutrients.protein * multiplier * 10) / 10;
  if (feedNutrients.fat) dailyNutrients.fat = Math.round(feedNutrients.fat * multiplier * 10) / 10;
  if (feedNutrients.carbohydrates) dailyNutrients.carbohydrates = Math.round(feedNutrients.carbohydrates * multiplier * 10) / 10;
  if (feedNutrients.fiber) dailyNutrients.fiber = Math.round(feedNutrients.fiber * multiplier * 10) / 10;

  // Минералы (мг)
  const minerals = ['calcium', 'phosphorus', 'sodium', 'potassium', 'magnesium', 'iron', 'zinc', 'copper', 'manganese'];
  minerals.forEach(mineral => {
    if (feedNutrients[mineral]) {
      dailyNutrients[mineral] = Math.round(feedNutrients[mineral] * multiplier);
    }
  });

  // Микроэлементы (мкг)
  const micronutrients = ['selenium', 'iodine', 'vitamin_b7', 'vitamin_b9', 'vitamin_b12'];
  micronutrients.forEach(nutrient => {
    if (feedNutrients[nutrient]) {
      dailyNutrients[nutrient] = Math.round(feedNutrients[nutrient] * multiplier);
    }
  });

  // Витамины (МЕ или мг)
  const vitamins = ['vitamin_a', 'vitamin_d', 'vitamin_e', 'vitamin_k', 'vitamin_b1', 'vitamin_b2', 'vitamin_b3', 'vitamin_b5', 'vitamin_b6', 'vitamin_c'];
  vitamins.forEach(vitamin => {
    if (feedNutrients[vitamin]) {
      dailyNutrients[vitamin] = Math.round(feedNutrients[vitamin] * multiplier * 10) / 10;
    }
  });

  return dailyNutrients;
}

/**
 * Сравнение кормов для конкретного животного
 * @param {object} animal - данные животного
 * @param {array} feeds - массив кормов для сравнения
 * @returns {object} результаты сравнения
 */
function compareFeeds(animal, feeds) {
  const energyNeed = calculateMER(
    animal.weight,
    animal.species,
    animal.activity_level,
    animal.physiological_state,
    animal.is_neutered,
    animal.age
  );

  const comparison = {
    animal: {
      name: animal.name,
      energyNeed: energyNeed
    },
    feeds: []
  };

  feeds.forEach(feed => {
    const dailyAmount = calculateDailyFeedAmount(energyNeed, feed.metabolic_energy);
    const dailyNutrients = calculateDailyNutrients(dailyAmount, feed);
    const costPerDay = feed.price ? (feed.price / 1000) * dailyAmount : null; // если есть цена за кг

    comparison.feeds.push({
      id: feed.id,
      name: feed.name,
      brand: feed.brand,
      dailyAmount: dailyAmount,
      costPerDay: costPerDay,
      dailyNutrients: dailyNutrients,
      caloriesPerGram: feed.metabolic_energy / 100
    });
  });

  return comparison;
}

module.exports = {
  calculateRER,
  calculateMER,
  calculateDailyFeedAmount,
  calculateDailyNutrients,
  compareFeeds
}; 