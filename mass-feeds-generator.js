// Генератор массивной партии кормов для VetFormuLab
const generateMassFeeds = () => {
  const brands = [
    'Purina Pro Plan', 'Royal Canin', 'Hill\'s', 'Eukanuba', 'Whiskas', 'Friskies', 
    'Iams', 'Pedigree', 'Blue Buffalo', 'Nutro', 'Wellness', 'Merrick', 'Taste of the Wild',
    'Orijen', 'Acana', 'Fromm', 'Natural Balance', 'Diamond', 'Canidae', 'Science Diet',
    'Advance', 'Specific', 'Brit', 'Farmina', 'Wolfsblut', 'Canagan', 'Meow Mix',
    'Felix', 'Sheba', 'Cesar', 'Animonda', 'Almo Nature', 'Applaws', 'Bozita',
    'Go!', 'Now Fresh', 'Grandorf', 'Monge', 'Schesir', 'Trainer', 'Sanabelle'
  ];

  const dogNames = [
    'Adult Large Breed', 'Small Breed Formula', 'Senior Care', 'Puppy Growth',
    'Weight Management', 'Sensitive Skin & Stomach', 'Active Adult', 'Indoor Formula',
    'Grain Free Recipe', 'Lamb & Rice', 'Chicken & Vegetables', 'Fish & Sweet Potato',
    'Turkey & Barley', 'Beef & Brown Rice', 'Duck & Potato', 'Venison & Pea',
    'Salmon Formula', 'Original Recipe', 'High Protein', 'Light & Healthy'
  ];

  const catNames = [
    'Indoor Adult', 'Kitten Growth', 'Senior Care', 'Hairball Control',
    'Weight Control', 'Sensitive Stomach', 'Urinary Health', 'Dental Care',
    'Chicken & Rice', 'Tuna & Salmon', 'Ocean Fish', 'Turkey & Giblets',
    'Beef & Liver', 'Mixed Grill', 'Seafood Medley', 'Original Recipe',
    'High Protein', 'Natural Formula', 'Grain Free', 'Complete Nutrition'
  ];

  const animalTypes = ['собака', 'кошка'];
  const lifeStages = ['взрослый', 'щенок', 'котенок', 'пожилой'];
  const feedTypes = ['повседневный', 'лечебный'];

  const feeds = [];
  let currentId = 42; // Начинаем с ID 42

  // Генерируем 78 кормов (119 - 41 = 78)
  for (let i = 0; i < 78; i++) {
    const animalType = animalTypes[i % animalTypes.length];
    const brand = brands[i % brands.length];
    const nameArray = animalType === 'собака' ? dogNames : catNames;
    const baseName = nameArray[i % nameArray.length];
    
    // Базовые значения для разных типов животных
    const isKitten = lifeStages[i % lifeStages.length] === 'котенок';
    const isPuppy = lifeStages[i % lifeStages.length] === 'щенок';
    const isSenior = lifeStages[i % lifeStages.length] === 'пожилой';
    const isCat = animalType === 'кошка';
    
    const baseProtein = isCat ? (isKitten ? 40 : 32) : (isPuppy ? 30 : 25);
    const baseFat = isCat ? (isKitten ? 18 : 14) : (isPuppy ? 16 : 12);
    const baseEnergy = isCat ? (isKitten ? 4200 : 3800) : (isPuppy ? 4000 : 3600);
    
    // Добавляем вариативность
    const variation = (base, range) => Math.round((base + (Math.random() - 0.5) * range) * 10) / 10;
    
    const feed = {
      id: currentId++,
      name: `${brand} ${baseName}`,
      brand: brand,
      type: feedTypes[i % feedTypes.length],
      animal_type: animalType,
      life_stage: lifeStages[i % lifeStages.length],
      composition: {
        crude_protein: variation(baseProtein, 8),
        crude_fat: variation(baseFat, 6),
        crude_fiber: variation(3, 2),
        ash: variation(7, 2),
        moisture: variation(9, 3),
        nfe: variation(isCat ? 25 : 40, 15),
        calcium: Math.round(variation(1.1, 0.6) * 100) / 100,
        phosphorus: Math.round(variation(0.9, 0.4) * 100) / 100,
        sodium: Math.round(variation(0.4, 0.3) * 100) / 100,
        potassium: Math.round(variation(0.7, 0.3) * 100) / 100,
        magnesium: Math.round(variation(0.09, 0.05) * 100) / 100,
        iron: Math.round(variation(140, 80)),
        copper: Math.round(variation(12, 8)),
        zinc: Math.round(variation(150, 60)),
        manganese: Math.round(variation(35, 25)),
        iodine: Math.round(variation(2.3, 1.5) * 10) / 10,
        selenium: Math.round(variation(0.3, 0.2) * 100) / 100
      },
      vitamins: {
        vitamin_a: Math.round(variation(18000, 10000)),
        vitamin_d3: Math.round(variation(1400, 800)),
        vitamin_e: Math.round(variation(350, 250)),
        vitamin_k: Math.round(variation(0.9, 0.7) * 10) / 10,
        vitamin_b1: Math.round(variation(14, 10) * 10) / 10,
        vitamin_b2: Math.round(variation(16, 10) * 10) / 10,
        vitamin_b6: Math.round(variation(10, 8) * 10) / 10,
        vitamin_b12: Math.round(variation(0.08, 0.06) * 1000) / 1000,
        niacin: Math.round(variation(220, 180)),
        pantothenic_acid: Math.round(variation(70, 50)),
        folic_acid: Math.round(variation(6, 4) * 10) / 10,
        biotin: Math.round(variation(1.3, 1) * 10) / 10,
        choline: Math.round(variation(1700, 1000))
      },
      energy: {
        metabolizable_energy: Math.round(variation(baseEnergy, 600)),
        digestible_energy: Math.round(variation(baseEnergy * 1.1, 600)),
        gross_energy: Math.round(variation(baseEnergy * 1.2, 600))
      },
      feeding_guide: isCat ? {
        "weight_2kg": "30-45g",
        "weight_3kg": "40-60g",
        "weight_4kg": "50-75g",
        "weight_5kg": "60-90g", 
        "weight_6kg": "70-105g"
      } : {
        "weight_10kg": "110-150g",
        "weight_15kg": "150-200g",
        "weight_20kg": "190-250g",
        "weight_25kg": "220-290g",
        "weight_30kg": "250-330g"
      }
    };
    
    feeds.push(feed);
  }
  
  return feeds;
};

// Генерируем корма и выводим JSON
const massFeeds = generateMassFeeds();

console.log('// Массивная партия кормов для добавления в feeds_database.json:');
console.log(',');
massFeeds.forEach((feed, index) => {
  console.log(JSON.stringify(feed, null, 6));
  if (index < massFeeds.length - 1) {
    console.log(',');
  }
});

console.log(`\n// Сгенерировано ${massFeeds.length} кормов (ID ${massFeeds[0].id} - ${massFeeds[massFeeds.length-1].id})`);
console.log('// Общее количество кормов станет: 41 + 78 = 119'); 