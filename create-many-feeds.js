// Генератор кормов для добавления в feeds_database.json
const generateFeeds = (startId, count) => {
  const brands = ['Purina', 'Whiskas', 'Royal Canin', 'Hill\'s', 'Eukanuba', 'Pedigree', 'Friskies', 'Iams', 'Blue Buffalo', 'Nutro', 'Wellness', 'Merrick', 'Fromm', 'Orijen', 'Acana', 'Canidae', 'Natural Balance', 'Diamond', 'Science Diet', 'Pro Plan'];
  const animalTypes = ['собака', 'кошка'];
  const lifeStages = ['щенок', 'котенок', 'взрослый', 'пожилой'];
  const feedTypes = ['повседневный', 'лечебный'];
  
  const feeds = [];
  
  for (let i = 0; i < count; i++) {
    const id = startId + i;
    const brand = brands[i % brands.length];
    const animalType = animalTypes[i % animalTypes.length];
    const lifeStage = lifeStages[i % lifeStages.length];
    const feedType = feedTypes[i % feedTypes.length];
    
    // Базовые значения с некоторой вариацией
    const baseProtein = animalType === 'кошка' ? 32 : 26;
    const baseFat = animalType === 'кошка' ? 14 : 12;
    const baseEnergy = animalType === 'кошка' ? 4000 : 3700;
    
    const variation = (base, range) => base + (Math.random() - 0.5) * range;
    
    const feed = {
      id: id,
      name: `${brand} ${animalType === 'кошка' ? 'Cat' : 'Dog'} ${lifeStage} Formula ${i + 1}`,
      brand: brand,
      type: feedType,
      animal_type: animalType,
      life_stage: lifeStage,
      composition: {
        crude_protein: Math.round(variation(baseProtein, 10) * 10) / 10,
        crude_fat: Math.round(variation(baseFat, 6) * 10) / 10,
        crude_fiber: Math.round(variation(3, 2) * 10) / 10,
        ash: Math.round(variation(7, 2) * 10) / 10,
        moisture: Math.round(variation(9, 2) * 10) / 10,
        nfe: Math.round(variation(40, 15) * 10) / 10,
        calcium: Math.round(variation(1.0, 0.4) * 100) / 100,
        phosphorus: Math.round(variation(0.8, 0.3) * 100) / 100,
        sodium: Math.round(variation(0.35, 0.2) * 100) / 100,
        potassium: Math.round(variation(0.65, 0.2) * 100) / 100,
        magnesium: Math.round(variation(0.08, 0.04) * 100) / 100,
        iron: Math.round(variation(140, 60)),
        copper: Math.round(variation(12, 6)),
        zinc: Math.round(variation(160, 40)),
        manganese: Math.round(variation(40, 20)),
        iodine: Math.round(variation(2.5, 1.5) * 10) / 10,
        selenium: Math.round(variation(0.3, 0.2) * 100) / 100
      },
      vitamins: {
        vitamin_a: Math.round(variation(18000, 8000)),
        vitamin_d3: Math.round(variation(1400, 600)),
        vitamin_e: Math.round(variation(300, 200)),
        vitamin_k: Math.round(variation(0.8, 0.4) * 10) / 10,
        vitamin_b1: Math.round(variation(15, 10) * 10) / 10,
        vitamin_b2: Math.round(variation(18, 12) * 10) / 10,
        vitamin_b6: Math.round(variation(12, 8) * 10) / 10,
        vitamin_b12: Math.round(variation(0.08, 0.06) * 1000) / 1000,
        niacin: Math.round(variation(250, 150)),
        pantothenic_acid: Math.round(variation(80, 50)),
        folic_acid: Math.round(variation(8, 5) * 10) / 10,
        biotin: Math.round(variation(1.5, 1) * 10) / 10,
        choline: Math.round(variation(1800, 800))
      },
      energy: {
        metabolizable_energy: Math.round(variation(baseEnergy, 400)),
        digestible_energy: Math.round(variation(baseEnergy * 1.1, 400)),
        gross_energy: Math.round(variation(baseEnergy * 1.2, 400))
      },
      feeding_guide: animalType === 'кошка' ? {
        "weight_3kg": "45-65g",
        "weight_4kg": "55-75g", 
        "weight_5kg": "65-85g",
        "weight_6kg": "75-95g",
        "weight_7kg": "80-105g"
      } : {
        "weight_10kg": "120-150g",
        "weight_15kg": "165-205g",
        "weight_20kg": "200-255g",
        "weight_25kg": "235-295g",
        "weight_30kg": "270-340g"
      }
    };
    
    feeds.push(feed);
  }
  
  return feeds;
};

// Генерируем 30 кормов начиная с ID 26
const newFeeds = generateFeeds(26, 30);

// Выводим JSON для вставки
console.log('// Добавить эти корма в feeds_database.json:');
console.log(',');
newFeeds.forEach((feed, index) => {
  console.log(JSON.stringify(feed, null, 6));
  if (index < newFeeds.length - 1) {
    console.log(',');
  }
});

console.log('\n// Всего добавлено:', newFeeds.length, 'кормов'); 