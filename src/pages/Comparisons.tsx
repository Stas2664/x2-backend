import React, { useState, useEffect } from 'react';
import config from '../config';
import { AnimalEnergyData } from '../types';
import { calculateEnergyNeed } from '../utils/calculateEnergyNeed';
import { calculateIdealWeight } from '../utils/calculateIdealWeight';

interface Feed {
  id: number;
  name: string;
  brand: string;
  type: string;
  animal_type: string;
  crude_protein: number;
  crude_fat: number;
  crude_fiber: number;
  ash: number;
  moisture: number;
  metabolizable_energy: number;
  calcium: number;
  phosphorus: number;
  sodium: number;
  potassium: number;
  vitamins?: {
    vitamin_a?: number;
    vitamin_d3?: number;
    vitamin_e?: number;
    [key: string]: number | undefined;
  };
  feeding_guide: {
    [key: string]: string;
  };
}

interface AnimalData {
  weight: number;
  energyNeed: number;
  name: string;
}

const Comparisons: React.FC = () => {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [selectedFeeds, setSelectedFeeds] = useState<number[]>([]);
  const [animalData, setAnimalData] = useState<AnimalEnergyData>({
    species: 'собака',
    gender: 'самец',
    age: 3,
    condition: 5,
    name: 'Мой питомец',
    breed: '',
    status: 'кастрированный',
    activity: 'нормальная активность',
    owner: '',
    currentWeight: 15,
    targetWeight: 15,
    adultWeight: 15,
    lactationWeeks: 0,
    contact: '',
    meCoefficient: 1
  });
  const [energyNeed, setEnergyNeed] = useState<number>(calculateEnergyNeed(animalData));
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // --- СТЕЙТЫ ДЛЯ ФИЛЬТРОВ И ВЫБОРА ПОКАЗАТЕЛЕЙ ---
  const [filterAnimalType, setFilterAnimalType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterPriceRange, setFilterPriceRange] = useState<'all' | 'budget' | 'premium' | 'ultra'>('all');
  const [compareFields, setCompareFields] = useState([
    'metabolizable_energy', 'moisture', 'crude_protein', 'crude_fat', 'crude_fiber', 'ash', 'calcium', 'phosphorus', 'vitamin_a', 'vitamin_d3'
  ]);
  const [compareMode, setCompareMode] = useState<'as_is' | 'per_1000kcal' | 'per_100g_dm'>('as_is');

  // --- НОВЫЕ СТЕЙТЫ ДЛЯ ДИАГНОЗА И НЕПЕРЕНОСИМОСТЕЙ ---
  const [diagnosis, setDiagnosis] = useState('');
  const [intolerances, setIntolerances] = useState('');
  
  // --- СТЕЙТ ДЛЯ ОТОБРАЖЕНИЯ ФОРМЫ ЖИВОТНОГО ---
  const [showAnimalForm, setShowAnimalForm] = useState(true);

  // Современные стили для полей
  const modernFieldStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 18px',
    fontSize: '15px',
    fontWeight: '500',
    color: '#2d3748',
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
    border: '2px solid rgba(0, 200, 81, 0.2)',
    borderRadius: '10px',
    outline: 'none',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 3px 15px rgba(0, 200, 81, 0.08)',
    fontFamily: 'inherit'
  };

  const modernSelectStyle: React.CSSProperties = {
    ...modernFieldStyle,
    paddingRight: '45px',
    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2300C851' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
    backgroundPosition: 'right 14px center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '18px',
    cursor: 'pointer',
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none'
  };

  const modernLabelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: '#2d3748',
    fontSize: '13px',
    letterSpacing: '0.5px'
  };

  const modernFocusStyle = {
    borderColor: '#00C851',
    boxShadow: '0 6px 25px rgba(0, 200, 81, 0.15), 0 0 0 3px rgba(0, 200, 81, 0.1)',
    transform: 'translateY(-1px)'
  };

  // --- НОРМАТИВЫ FEDIAF ---
  const getFediafNorm = (nutrient: string, animalSpecies: string, age: number) => {
    const isAdult = age >= 1;
    const species = animalSpecies.toLowerCase();
    
    const norms: { [key: string]: { [key: string]: { adult: string, puppy: string } } } = {
      'crude_protein': {
        'собака': { adult: '18%', puppy: '22.5%' },
        'кошка': { adult: '26%', puppy: '30%' },
      },
      'crude_fat': {
        'собака': { adult: '5.5%', puppy: '8.5%' },
        'кошка': { adult: '9%', puppy: '9%' },
      },
      'calcium': {
        'собака': { adult: '0.5%', puppy: '1.2%' },
        'кошка': { adult: '0.4%', puppy: '1.0%' },
      },
      'phosphorus': {
        'собака': { adult: '0.4%', puppy: '1.0%' },
        'кошка': { adult: '0.26%', puppy: '0.8%' },
      },
      'metabolizable_energy': {
        'собака': { adult: '3500-4200', puppy: '4000-4500' },
        'кошка': { adult: '4000-4500', puppy: '4200-4800' },
      },
      'crude_fiber': {
        'собака': { adult: '≤5%', puppy: '≤4%' },
        'кошка': { adult: '≤5%', puppy: '≤4%' },
      },
      'ash': {
        'собака': { adult: '≤8%', puppy: '≤8%' },
        'кошка': { adult: '≤8%', puppy: '≤8%' },
      }
    };

    if (norms[nutrient] && norms[nutrient][species]) {
      return isAdult ? norms[nutrient][species].adult : norms[nutrient][species].puppy;
    }
    return '-';
  };

  useEffect(() => {
    loadSelectedFeeds();
    loadAnimalDataFromCalculator();
    
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadAnimalDataFromCalculator = () => {
    try {
      const savedAnimalData = localStorage.getItem('animalData');
      if (savedAnimalData) {
        const animalFromCalculator = JSON.parse(savedAnimalData);
        
        // Устанавливаем данные из калькулятора
        setAnimalData(prev => ({
          ...prev,
          species: animalFromCalculator.species || prev.species,
          name: animalFromCalculator.name || prev.name,
          breed: animalFromCalculator.breed || prev.breed,
          age: animalFromCalculator.age || prev.age,
          gender: animalFromCalculator.gender || prev.gender,
          status: animalFromCalculator.status || prev.status,
          activity: animalFromCalculator.activity || prev.activity,
          condition: animalFromCalculator.condition || prev.condition,
          currentWeight: animalFromCalculator.currentWeight || prev.currentWeight,
          targetWeight: animalFromCalculator.targetWeight || prev.targetWeight,
          adultWeight: animalFromCalculator.adultWeight || prev.adultWeight,
          lactationWeeks: animalFromCalculator.lactationWeeks || prev.lactationWeeks,
          meCoefficient: animalFromCalculator.meCoefficient || prev.meCoefficient,
          owner: animalFromCalculator.owner || prev.owner,
          contact: animalFromCalculator.contact || prev.contact
        }));

        // Если есть diagnosis и intolerances в localStorage
        const savedDiagnosis = localStorage.getItem('diagnosis');
        const savedIntolerances = localStorage.getItem('intolerances');
        if (savedDiagnosis) setDiagnosis(savedDiagnosis);
        if (savedIntolerances) setIntolerances(savedIntolerances);
        
        console.log('Загружены данные животного из калькулятора');
      }
    } catch (error) {
      console.error('Ошибка загрузки данных животного:', error);
    }
  };

  // Автоматический расчет идеального веса при изменении current weight или condition
  useEffect(() => {
    if (animalData.currentWeight && animalData.currentWeight > 0 && 
        animalData.condition && animalData.condition >= 1 && animalData.condition <= 9) {
      const idealWeight = calculateIdealWeight(animalData.currentWeight, animalData.condition);
      if (idealWeight !== animalData.targetWeight) {
        setAnimalData(prev => ({
          ...prev,
          targetWeight: idealWeight
        }));
      }
    }
  }, [animalData.currentWeight, animalData.condition, animalData.targetWeight]);

  useEffect(() => {
    setEnergyNeed(calculateEnergyNeed(animalData));
  }, [animalData]);

  const loadSelectedFeeds = () => {
    try {
      // Загружаем выбранные корма из localStorage
      const savedFeeds = localStorage.getItem('selectedFeedsForComparison');
      const savedFeedIds = localStorage.getItem('selectedFeedIds');
      
      if (savedFeeds && savedFeedIds) {
        const feedsData = JSON.parse(savedFeeds);
        const feedIds = JSON.parse(savedFeedIds);
        
        setFeeds(feedsData);
        setSelectedFeeds(feedIds);
        
        console.log('Загружены выбранные корма:', feedsData.length);
      } else {
        // Если нет сохраненных данных, оставляем пустой массив
        setFeeds([]);
        setSelectedFeeds([]);
        console.log('Нет сохраненных кормов для сравнения');
      }
    } catch (error) {
      console.error('Ошибка загрузки выбранных кормов:', error);
      setFeeds([]);
      setSelectedFeeds([]);
    }
  };

  // --- ФИЛЬТРАЦИЯ КОРМОВ ---
  const filteredFeeds = feeds.filter(feed => {
    const matchesAnimal = !filterAnimalType || feed.animal_type === filterAnimalType;
    const matchesCategory = !filterCategory || feed.type === filterCategory; // Assuming 'type' is the category
    const matchesBrand = !filterBrand || feed.brand.toLowerCase().includes(filterBrand.toLowerCase());
    const matchesType = !filterType || feed.type === filterType;
    
    // Фильтр по ценовой категории (примерная логика на основе МЭ)
    let matchesPrice = true;
    if (filterPriceRange !== 'all') {
      const me = feed.metabolizable_energy;
      switch (filterPriceRange) {
        case 'budget':
          matchesPrice = me < 3500;
          break;
        case 'premium':
          matchesPrice = me >= 3500 && me < 4000;
          break;
        case 'ultra':
          matchesPrice = me >= 4000;
          break;
      }
    }
    
    return matchesAnimal && matchesCategory && matchesBrand && matchesType && matchesPrice;
  });

  // --- ВЫБОР КОРМОВ ---
  const handleFeedSelection = (feedId: number) => {
    if (selectedFeeds.includes(feedId)) {
      setSelectedFeeds(selectedFeeds.filter(id => id !== feedId));
    } else if (selectedFeeds.length < 5) {
      setSelectedFeeds([...selectedFeeds, feedId]);
    } else {
      alert('Можно сравнивать максимум 5 кормов одновременно');
    }
  };

  const getSelectedFeedsData = () => {
    return feeds.filter(feed => selectedFeeds.includes(feed.id));
  };

  const calculateDailyAmount = (feed: Feed) => {
    // МЭ в базе хранится в ккал/100г, поэтому умножаем на 100, а не на 1000
    const dailyAmountGrams = (energyNeed / feed.metabolizable_energy) * 100;
    const dailyAmountCups = dailyAmountGrams / 120; // 120г = 1 чашка
    
    return {
      grams: Math.round(dailyAmountGrams * 10) / 10,
      cups: Math.round(dailyAmountCups * 10) / 10,
      protein: Math.round((feed.crude_protein * dailyAmountGrams / 100) * 10) / 10,
      fat: Math.round((feed.crude_fat * dailyAmountGrams / 100) * 10) / 10,
      calcium: Math.round((feed.calcium * dailyAmountGrams / 100) * 10) / 10,
      phosphorus: Math.round((feed.phosphorus * dailyAmountGrams / 100) * 10) / 10,
      fiber: Math.round((feed.crude_fiber * dailyAmountGrams / 100) * 10) / 10,
      vitaminA: Math.round(((feed.vitamins?.vitamin_a || 0) * dailyAmountGrams / 1000) * 10) / 10,
      vitaminD3: Math.round(((feed.vitamins?.vitamin_d3 || 0) * dailyAmountGrams / 1000) * 10) / 10
    };
  };

  const getBestValue = (values: number[], isLower = false) => {
    return isLower ? Math.min(...values) : Math.max(...values);
  };

  const getValueColor = (value: number, bestValue: number, isLower = false) => {
    const isBest = isLower ? value === bestValue : value === bestValue;
    return isBest ? '#00C851' : '#666';
  };

  const getComparisonChart = (feeds: Feed[], property: keyof Feed, title: string) => {
    // Определяем цвета для каждого корма
    const colors = [
      'linear-gradient(135deg, #00C851 0%, #33B5E5 100%)',
      'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    ];
    
    return (
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '20px',
        padding: '25px',
        border: '2px solid rgba(0, 200, 81, 0.1)',
        marginBottom: '20px',
        boxShadow: '0 8px 32px rgba(0, 200, 81, 0.1)',
        backdropFilter: 'blur(10px)'
      }}>
        <h3 style={{
          color: '#2d3748',
          marginBottom: '20px',
          fontSize: '1.3rem',
          fontWeight: '700',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #00C851 0%, #33B5E5 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          {title}
        </h3>
        
        {feeds.map((feed, index) => {
          const value = Number(feed[property]);
          
          return (
            <div key={feed.id} style={{ marginBottom: '15px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '15px 20px',
                background: 'rgba(255, 255, 255, 0.8)',
                borderRadius: '12px',
                border: '2px solid rgba(0, 200, 81, 0.1)',
                boxShadow: '0 4px 15px rgba(0, 200, 81, 0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    background: colors[index % colors.length]
                  }} />
                  <span style={{ 
                    fontSize: '16px', 
                    fontWeight: '600',
                    color: '#2d3748'
                  }}>
                    {feed.brand} {feed.name.substring(0, 30)}...
                  </span>
                </div>
                <div>
                  <span style={{ 
                    fontSize: '18px', 
                    fontWeight: '700',
                    color: '#2d3748'
                  }}>
                    {(() => {
                      if (property === 'metabolizable_energy') return `${value} ккал/кг`;
                      if (property === 'calcium') return `${(value * 1000).toFixed(0)} мг/100г`;
                      if (property === 'phosphorus') return `${(value * 10).toFixed(0)} мг/100г`;
                      if (['crude_protein', 'crude_fat', 'crude_fiber', 'ash'].includes(property as string)) return `${value} г`;
                      if ((property as string) === 'vitamin_a' || (property as string) === 'vitamin_d3') return `${value} МЕ/100г`;
                      return `${value}%`;
                    })()}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const selectedFeedsData = getSelectedFeedsData();

  // --- ФУНКЦИИ ПЕРЕСЧЕТА ---
  const recalculateValue = (value: number, feed: any, nutrient: string) => {
    if (compareMode === 'as_is') {
      return value;
    } else if (compareMode === 'per_1000kcal') {
      // Пересчет на 1000 ккал МЭ (влажность не меняем)
      if (nutrient === 'moisture') return value;
      const me = feed.metabolizable_energy || feed.metabolic_energy;
      if (!me) return value;
      return (value * 1000) / me;
    } else if (compareMode === 'per_100g_dm') {
      // Пересчет на 100 г сухого вещества (влажность = 0 по определению)
      if (nutrient === 'moisture') return 0;
      const moisture = typeof feed.moisture === 'number' ? feed.moisture : 10; // % как есть
      const dryMatter = 100 - moisture;
      if (dryMatter <= 0) return value;
      return (value * 100) / dryMatter;
    }
    return value;
  };

  // Нормализация единиц для Ca/P: если значение <= 20, считаем что это г/100г и конвертируем в мг/100г; иначе уже мг/100г
  const toMg100g = (val: number): number => {
    if (val === null || val === undefined || Number.isNaN(val as any)) return 0;
    return val <= 20 ? val * 1000 : val;
  };
;

  const getRecalculatedNorm = (baseNorm: string, feed: any) => {
    const numericNorm = parseFloat(baseNorm.replace(/[^\d.,]/g, '').replace(',', '.'));
    if (isNaN(numericNorm)) return baseNorm;
    
    if (compareMode === 'per_1000kcal') {
      const me = feed.metabolizable_energy || feed.metabolic_energy || 3500;
      const recalculated = (numericNorm * 1000) / me;
      return recalculated.toFixed(2);
    } else if (compareMode === 'per_100g_dm') {
      const moisture = feed.moisture || 10;
      const dryMatter = 100 - moisture;
      const recalculated = (numericNorm * 100) / dryMatter;
      return recalculated.toFixed(2);
    }
    return baseNorm;
  };

  return (
    <div style={{
      padding: '20px',
      maxWidth: '1600px',
      margin: '0 auto'
    }}>
      {/* Заголовок */}
      <div style={{
        textAlign: 'center',
        marginBottom: '40px'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          color: '#2d3748',
          marginBottom: '15px',
          background: 'linear-gradient(135deg, #00C851 0%, #33B5E5 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px'
        }}>
          <span style={{
            background: 'linear-gradient(135deg, #00C851 0%, #33B5E5 100%)',
            color: 'white',
            width: '45px',
            height: '45px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            fontWeight: 'bold'
          }}>
            ≈
          </span>
          Аналитика кормов
        </h1>
        <p style={{
          color: '#666',
          fontSize: '1.1rem',
          marginBottom: '20px'
        }}>
          Подробное сравнение питательности и расчет суточных норм
        </p>

        {/* Переключатель режима сравнения */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
          padding: '20px',
          borderRadius: '15px',
          marginBottom: '25px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '15px',
          border: '2px solid rgba(0, 200, 81, 0.2)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 5px 20px rgba(0, 200, 81, 0.1)'
        }}>
          <span style={{ 
            fontWeight: '600', 
            color: '#2d3748', 
            fontSize: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            🧮 С данными животного
          </span>
          <div style={{
            position: 'relative',
            width: '60px',
            height: '32px',
            background: showAnimalForm ? 
              'linear-gradient(135deg, #00C851 0%, #33B5E5 100%)' : 
              'linear-gradient(135deg, #e2e8f0 0%, #cbd5e0 100%)',
            borderRadius: '16px',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: showAnimalForm ? 
              '0 4px 15px rgba(0, 200, 81, 0.3)' : 
              '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}
          onClick={() => setShowAnimalForm(!showAnimalForm)}>
            <div style={{
              position: 'absolute',
              top: '2px',
              left: showAnimalForm ? '30px' : '2px',
              width: '28px',
              height: '28px',
              background: 'white',
              borderRadius: '50%',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px'
            }}>
              {showAnimalForm ? '✓' : '✗'}
            </div>
          </div>
          <span style={{ 
            fontWeight: '600', 
            color: '#2d3748', 
            fontSize: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            📊 Только корма
          </span>
        </div>
      </div>

      {/* Расширенная форма животного */}
      {showAnimalForm && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '25px',
          borderRadius: '15px',
          marginBottom: '25px',
          border: '2px solid rgba(0, 200, 81, 0.1)'
        }}>
          <h2 style={{
            color: '#2d3748',
            marginBottom: '20px',
            fontSize: '1.4rem',
            fontWeight: '600'
          }}>
            🐕 Данные животного
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: windowWidth > 768 ? '1fr 1fr 1fr' : '1fr',
            gap: '20px'
          }}>
            <div>
              <label style={modernLabelStyle}>🐕 Вид</label>
              <select 
                value={animalData.species} 
                onChange={e => setAnimalData({...animalData, species: e.target.value as any})}
                style={modernSelectStyle}
                onFocus={(e) => Object.assign(e.target.style, modernFocusStyle)}
                onBlur={(e) => Object.assign(e.target.style, { borderColor: 'rgba(0, 200, 81, 0.2)', boxShadow: '0 3px 15px rgba(0, 200, 81, 0.08)', transform: 'none' })}>
                <option value="собака">🐕 Собака</option>
                <option value="кошка">🐱 Кошка</option>
                
              </select>
            </div>
            <div>
              <label style={modernLabelStyle}>⚧️ Пол</label>
              <select 
                value={animalData.gender} 
                onChange={e => setAnimalData({...animalData, gender: e.target.value as any})}
                style={modernSelectStyle}
                onFocus={(e) => Object.assign(e.target.style, modernFocusStyle)}
                onBlur={(e) => Object.assign(e.target.style, { borderColor: 'rgba(0, 200, 81, 0.2)', boxShadow: '0 3px 15px rgba(0, 200, 81, 0.08)', transform: 'none' })}>
                <option value="самец">♂️ Самец</option>
                <option value="самка">♀️ Самка</option>
              </select>
            </div>
            <div>
              <label style={modernLabelStyle}>📅 Возраст (лет)</label>
              <input 
                type="number" 
                value={animalData.age} 
                onChange={e => setAnimalData({...animalData, age: parseFloat(e.target.value)})}
                style={modernFieldStyle}
                placeholder="0.0"
                onFocus={(e) => Object.assign(e.target.style, modernFocusStyle)}
                onBlur={(e) => Object.assign(e.target.style, { borderColor: 'rgba(0, 200, 81, 0.2)', boxShadow: '0 3px 15px rgba(0, 200, 81, 0.08)', transform: 'none' })}
              />
            </div>
            <div>
              <label style={modernLabelStyle}>🐾 Кличка</label>
              <input 
                type="text" 
                value={animalData.name} 
                onChange={e => setAnimalData({...animalData, name: e.target.value})}
                style={modernFieldStyle}
                placeholder="Введите кличку"
                onFocus={(e) => Object.assign(e.target.style, modernFocusStyle)}
                onBlur={(e) => Object.assign(e.target.style, { borderColor: 'rgba(0, 200, 81, 0.2)', boxShadow: '0 3px 15px rgba(0, 200, 81, 0.08)', transform: 'none' })}
              />
            </div>
            <div>
              <label style={modernLabelStyle}>🐾 Порода</label>
              <input 
                type="text" 
                value={animalData.breed} 
                onChange={e => setAnimalData({...animalData, breed: e.target.value})}
                style={modernFieldStyle}
                placeholder="Введите породу"
                onFocus={(e) => Object.assign(e.target.style, modernFocusStyle)}
                onBlur={(e) => Object.assign(e.target.style, { borderColor: 'rgba(0, 200, 81, 0.2)', boxShadow: '0 3px 15px rgba(0, 200, 81, 0.08)', transform: 'none' })}
              />
            </div>
            <div>
              <label style={modernLabelStyle}>👤 Владелец</label>
              <input 
                type="text" 
                value={animalData.owner} 
                onChange={e => setAnimalData({...animalData, owner: e.target.value})}
                style={modernFieldStyle}
                placeholder="Введите имя владельца"
                onFocus={(e) => Object.assign(e.target.style, modernFocusStyle)}
                onBlur={(e) => Object.assign(e.target.style, { borderColor: 'rgba(0, 200, 81, 0.2)', boxShadow: '0 3px 15px rgba(0, 200, 81, 0.08)', transform: 'none' })}
              />
            </div>
            <div>
              <label style={modernLabelStyle}>🔢 Кондиция (1-9)</label>
              <input 
                type="number" 
                min="1"
                max="9"
                value={animalData.condition} 
                onChange={e => setAnimalData({...animalData, condition: parseInt(e.target.value)})}
                style={modernFieldStyle}
                placeholder="5"
                onFocus={(e) => Object.assign(e.target.style, modernFocusStyle)}
                onBlur={(e) => Object.assign(e.target.style, { borderColor: 'rgba(0, 200, 81, 0.2)', boxShadow: '0 3px 15px rgba(0, 200, 81, 0.08)', transform: 'none' })}
              />
            </div>
            <div>
              <label style={modernLabelStyle}>✂️ Кастрация/Статус</label>
              <select 
                value={animalData.status} 
                onChange={e => setAnimalData({...animalData, status: e.target.value})}
                style={modernSelectStyle}
                onFocus={(e) => Object.assign(e.target.style, modernFocusStyle)}
                onBlur={(e) => Object.assign(e.target.style, { borderColor: 'rgba(0, 200, 81, 0.2)', boxShadow: '0 3px 15px rgba(0, 200, 81, 0.08)', transform: 'none' })}>
                <option value="кастрированный">✂️ Кастрированный</option>
                <option value="интактный">🔸 Интактный</option>
                <option value="беременность 1-4 недели">🤱 Беременность 1-4 недели</option>
                <option value="беременность >5 недель">🤱 Беременность {'>'}5 недель</option>
                <option value="лактация">🍼 Лактация</option>
              </select>
            </div>
            <div>
              <label style={modernLabelStyle}>🏃 Активность</label>
              <select 
                value={animalData.activity} 
                onChange={e => setAnimalData({...animalData, activity: e.target.value})}
                style={modernSelectStyle}
                onFocus={(e) => Object.assign(e.target.style, modernFocusStyle)}
                onBlur={(e) => Object.assign(e.target.style, { borderColor: 'rgba(0, 200, 81, 0.2)', boxShadow: '0 3px 15px rgba(0, 200, 81, 0.08)', transform: 'none' })}>
                <option value="склонность к ожирению">😴 Склонность к ожирению</option>
                <option value="нормальная активность">🚶 Нормальная активность</option>
                <option value="высокая активность">🏃 Высокая активность</option>
              </select>
            </div>
            <div>
              <label style={modernLabelStyle}>⚖️ Текущий вес (кг)</label>
              <input 
                type="number" 
                value={animalData.currentWeight} 
                onChange={e => setAnimalData({...animalData, currentWeight: parseFloat(e.target.value)})}
                style={modernFieldStyle}
                placeholder="0.0"
                onFocus={(e) => Object.assign(e.target.style, modernFocusStyle)}
                onBlur={(e) => Object.assign(e.target.style, { borderColor: 'rgba(0, 200, 81, 0.2)', boxShadow: '0 3px 15px rgba(0, 200, 81, 0.08)', transform: 'none' })}
              />
            </div>
            <div>
              <label style={{
                ...modernLabelStyle,
                background: 'linear-gradient(135deg, #00C851 0%, #33B5E5 100%)'
              }}>🎯 Расчётный вес (кг) ⚡ авто</label>
              <input 
                type="number" 
                value={animalData.targetWeight || 0} 
                readOnly
                style={{
                  ...modernFieldStyle,
                  background: 'linear-gradient(135deg, rgba(0, 200, 81, 0.05) 0%, rgba(51, 181, 229, 0.05) 100%)',
                  border: '2px solid rgba(0, 200, 81, 0.3)',
                  color: '#00C851',
                  fontWeight: '600',
                  cursor: 'not-allowed'
                }}
                placeholder="0.0"
              />
            </div>
            <div>
              <label style={modernLabelStyle}>📏 Взрослый вес (кг)</label>
              <input 
                type="number" 
                value={animalData.adultWeight} 
                onChange={e => setAnimalData({...animalData, adultWeight: parseFloat(e.target.value)})}
                style={modernFieldStyle}
                placeholder="0.0"
                onFocus={(e) => Object.assign(e.target.style, modernFocusStyle)}
                onBlur={(e) => Object.assign(e.target.style, { borderColor: 'rgba(0, 200, 81, 0.2)', boxShadow: '0 3px 15px rgba(0, 200, 81, 0.08)', transform: 'none' })}
              />
            </div>
            <div>
              <label style={modernLabelStyle}>🍼 Недели лактации</label>
              <input 
                type="number" 
                value={animalData.lactationWeeks} 
                onChange={e => setAnimalData({...animalData, lactationWeeks: parseInt(e.target.value)})}
                style={modernFieldStyle}
                placeholder="0"
                onFocus={(e) => Object.assign(e.target.style, modernFocusStyle)}
                onBlur={(e) => Object.assign(e.target.style, { borderColor: 'rgba(0, 200, 81, 0.2)', boxShadow: '0 3px 15px rgba(0, 200, 81, 0.08)', transform: 'none' })}
              />
            </div>
            <div>
              <label style={modernLabelStyle}>📊 Коэффициент МЭ</label>
              <input 
                type="number" 
                value={animalData.meCoefficient} 
                onChange={e => setAnimalData({...animalData, meCoefficient: parseFloat(e.target.value)})}
                style={modernFieldStyle}
                placeholder="1.0"
                onFocus={(e) => Object.assign(e.target.style, modernFocusStyle)}
                onBlur={(e) => Object.assign(e.target.style, { borderColor: 'rgba(0, 200, 81, 0.2)', boxShadow: '0 3px 15px rgba(0, 200, 81, 0.08)', transform: 'none' })}
              />
            </div>

          </div>
          <div style={{ marginTop: '20px', fontWeight: 'bold', color: '#00C851' }}>
            Потребность в энергии (МЭ): {energyNeed} ккал/день
          </div>
        </div>
      )}

      {/* Информация о выбранных кормах */}
      {selectedFeedsData.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(0, 200, 81, 0.1) 0%, rgba(51, 181, 229, 0.1) 100%)',
          border: '2px solid rgba(0, 200, 81, 0.2)',
          borderRadius: '15px',
          padding: '20px',
          marginBottom: '25px',
          textAlign: 'center'
        }}>
          <h3 style={{
            color: '#2d3748',
            fontSize: '18px',
            fontWeight: '700',
            marginBottom: '15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}>
            📊 Корма для сравнения: {selectedFeedsData.length}
          </h3>
          
          <div style={{
            display: 'flex',
            gap: '15px',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            {selectedFeedsData.map((feed, index) => (
              <div key={feed.id} style={{
                background: 'rgba(255, 255, 255, 0.8)',
                padding: '10px 15px',
                borderRadius: '10px',
                border: '1px solid rgba(0, 200, 81, 0.2)',
                fontSize: '14px',
                fontWeight: '500',
                color: '#2d3748'
              }}>
                {index + 1}. {feed.brand} - {feed.name}
              </div>
            ))}
          </div>
          
          <div style={{
            marginTop: '15px',
            display: 'flex',
            gap: '10px',
            justifyContent: 'center'
          }}>
            <button
              onClick={() => {
                localStorage.removeItem('selectedFeedsForComparison');
                localStorage.removeItem('selectedFeedIds');
                window.location.href = '/feeds';
              }}
              style={{
                background: 'rgba(255, 193, 7, 0.1)',
                color: '#FF8F00',
                border: '1px solid rgba(255, 193, 7, 0.2)',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '600',
                padding: '8px 16px',
                cursor: 'pointer'
              }}>
              🔄 Выбрать другие корма
            </button>
          </div>
        </div>
      )}

      {/* Результаты сравнения */}
      {selectedFeedsData.length > 0 && (
        <>
          {/* Выбор показателей для сравнения */}
          <div style={{ 
            marginBottom: '25px',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
            padding: '20px',
            borderRadius: '15px',
            border: '2px solid rgba(0, 200, 81, 0.2)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 5px 20px rgba(0, 200, 81, 0.1)'
          }}>
            <div style={{ 
              fontWeight: '600', 
              color: '#2d3748', 
              marginBottom: '15px',
              fontSize: '16px',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              ✅ Показатели для сравнения
            </div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '12px' 
            }}>
              {[
                { key: 'metabolizable_energy', label: '🔥 МЭ (ккал/кг)' },
                { key: 'moisture', label: '💧 Влажность (%)' },
                { key: 'crude_protein', label: '🥩 Белок (г)' },
                { key: 'crude_fat', label: '🧈 Жир (г)' },
                { key: 'crude_fiber', label: '🌿 Сырая клетчатка (г)' },
                { key: 'ash', label: '⚪ Зола (г)' },
                { key: 'calcium', label: '🦴 Кальций (мг/100г)' },
                { key: 'phosphorus', label: '⚡ Фосфор (мг/100г)' },
                { key: 'vitamin_a', label: '🍊 Витамин А (МЕ/100г)' },
                { key: 'vitamin_d3', label: '☀️ Витамин Д (МЕ/100г)' }
              ].map(field => (
                <label 
                  key={field.key} 
                  style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 15px',
                    borderRadius: '10px',
                    background: compareFields.includes(field.key) ? 
                      'linear-gradient(135deg, rgba(0, 200, 81, 0.1) 0%, rgba(51, 181, 229, 0.1) 100%)' : 
                      'rgba(255, 255, 255, 0.5)',
                    border: compareFields.includes(field.key) ? 
                      '2px solid rgba(0, 200, 81, 0.3)' : 
                      '2px solid rgba(0, 0, 0, 0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                  onMouseEnter={(e) => {
                    if (!compareFields.includes(field.key)) {
                      e.currentTarget.style.background = 'rgba(0, 200, 81, 0.05)';
                      e.currentTarget.style.borderColor = 'rgba(0, 200, 81, 0.2)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!compareFields.includes(field.key)) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.5)';
                      e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.1)';
                    }
                  }}>
                  <input
                    type="checkbox"
                    checked={compareFields.includes(field.key)}
                    onChange={e => {
                      if (e.target.checked) {
                        setCompareFields([...compareFields, field.key]);
                      } else {
                        setCompareFields(compareFields.filter(f => f !== field.key));
                      }
                    }}
                    style={{
                      width: '18px',
                      height: '18px',
                      accentColor: '#00C851',
                      cursor: 'pointer'
                    }}
                  />
                  <span style={{ color: compareFields.includes(field.key) ? '#00C851' : '#666' }}>
                    {field.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Кнопки пересчёта */}
          <div style={{ 
            marginBottom: '25px', 
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
            padding: '20px',
            borderRadius: '15px',
            border: '2px solid rgba(0, 200, 81, 0.2)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 5px 20px rgba(0, 200, 81, 0.1)'
          }}>
            <div style={{ 
              fontWeight: '600', 
              color: '#2d3748', 
              marginBottom: '15px',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              📊 Пересчитать значения
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button 
                onClick={() => setCompareMode('as_is')} 
                style={{ 
                  padding: '12px 20px',
                  borderRadius: '12px',
                  border: 'none',
                  background: compareMode === 'as_is' ? 
                    'linear-gradient(135deg, #00C851 0%, #33B5E5 100%)' : 
                    'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                  color: compareMode === 'as_is' ? 'white' : '#666',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: compareMode === 'as_is' ? 
                    '0 4px 15px rgba(0, 200, 81, 0.3)' : 
                    '0 2px 8px rgba(0, 0, 0, 0.1)',
                  fontSize: '14px'
                }}
                onMouseEnter={(e) => {
                  if (compareMode !== 'as_is') {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (compareMode !== 'as_is') {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                  }
                }}>
                📋 Как в базе
              </button>
              <button 
                onClick={() => setCompareMode('per_1000kcal')} 
                style={{ 
                  padding: '12px 20px',
                  borderRadius: '12px',
                  border: 'none',
                  background: compareMode === 'per_1000kcal' ? 
                    'linear-gradient(135deg, #00C851 0%, #33B5E5 100%)' : 
                    'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                  color: compareMode === 'per_1000kcal' ? 'white' : '#666',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: compareMode === 'per_1000kcal' ? 
                    '0 4px 15px rgba(0, 200, 81, 0.3)' : 
                    '0 2px 8px rgba(0, 0, 0, 0.1)',
                  fontSize: '14px'
                }}
                onMouseEnter={(e) => {
                  if (compareMode !== 'per_1000kcal') {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (compareMode !== 'per_1000kcal') {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                  }
                }}>
                🔥 На 1000 ккал
              </button>
              <button 
                onClick={() => setCompareMode('per_100g_dm')} 
                style={{ 
                  padding: '12px 20px',
                  borderRadius: '12px',
                  border: 'none',
                  background: compareMode === 'per_100g_dm' ? 
                    'linear-gradient(135deg, #00C851 0%, #33B5E5 100%)' : 
                    'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                  color: compareMode === 'per_100g_dm' ? 'white' : '#666',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: compareMode === 'per_100g_dm' ? 
                    '0 4px 15px rgba(0, 200, 81, 0.3)' : 
                    '0 2px 8px rgba(0, 0, 0, 0.1)',
                  fontSize: '14px'
                }}
                onMouseEnter={(e) => {
                  if (compareMode !== 'per_100g_dm') {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (compareMode !== 'per_100g_dm') {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                  }
                }}>
                💧 На 100г сух. в-ва
              </button>
            </div>
          </div>

          {/* Таблица сравнения */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '15px',
            overflow: 'hidden',
            marginBottom: '25px',
            border: '2px solid rgba(0, 200, 81, 0.1)'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #00C851 0%, #33B5E5 100%)',
              color: 'white',
              padding: '20px',
              textAlign: 'center'
            }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0, marginBottom: '8px' }}>
                📊 Сравнительная таблица кормов
              </h2>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>
                {compareMode === 'as_is' && 'Значения как в базе данных (на 100г продукта)'}
                {compareMode === 'per_1000kcal' && 'Значения пересчитаны на 1000 ккал МЭ'}
                {compareMode === 'per_100g_dm' && 'Значения пересчитаны на 100г сухого вещества'}
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '14px'
              }}>
                <thead>
                  <tr style={{ background: '#f8f9fa' }}>
                    <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#2d3748' }}>
                      Показатель
                    </th>
                    {selectedFeedsData.map(feed => (
                      <th key={feed.id} style={{ 
                        padding: '15px', 
                        textAlign: 'center', 
                        fontWeight: '600',
                        color: '#2d3748',
                        minWidth: '150px'
                      }}>
                        <div>{feed.brand}</div>
                        <div style={{ fontSize: '12px', fontWeight: '400', color: '#666' }}>
                          {feed.name.substring(0, 20)}...
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {compareFields.map((key, index) => (
                    <tr key={key} style={{ background: index % 2 === 0 ? 'white' : '#f8f9fa', borderBottom: '1px solid rgba(0, 200, 81, 0.1)' }}>
                      <td style={{ padding: '12px 15px', fontWeight: '600', color: '#2d3748' }}>{
                        {
                          metabolizable_energy: 'МЭ (ккал/кг)',
                          moisture: 'Влажность (%)',
                          crude_protein: 'Белок (г)',
                          crude_fat: 'Жир (г)',
                          crude_fiber: 'Сырая клетчатка (г)',
                          ash: 'Зола (г)',
                          calcium: 'Кальций (мг/100г)',
                          phosphorus: 'Фосфор (мг/100г)',
                          vitamin_a: 'Витамин А (МЕ/100г)',
                          vitamin_d3: 'Витамин Д (МЕ/100г)'
                        }[key] || key
                      }</td>
                      {selectedFeedsData.map(feed => {
                        let value: any;
                        
                        // Специальная обработка для витаминов
                        if (key === 'vitamin_a') {
                          value = (feed.vitamins?.vitamin_a || 0) * 0.1; // IU/kg -> IU/100г
                        } else if (key === 'vitamin_d3') {
                          value = (feed.vitamins?.vitamin_d3 || 0) * 0.1; // IU/kg -> IU/100г
                        } else {
                          value = feed[key as keyof Feed];
                        }
                        
                        

if (compareMode === 'per_1000kcal') {
  // МЭ у нас хранится как ккал/100г
  const mePer100g = (feed as any).metabolizable_energy ?? (feed as any).metabolic_energy ?? (feed as any).kcal_per_100g ?? (feed as any).kcalPer100g;
  if (!mePer100g || mePer100g <= 0) {
    displayValue = null;
  } else {
    // сколько граммов корма нужно для 1000 ккал
    const gramsFor1000 = 100000 / mePer100g; // г

    const percentKeys = ['protein','fat','fiber','ash','moisture','calcium','phosphorus','crude_protein','crude_fat','crude_fiber'];
    const asGramsFromPercent = (percent: number) => (percent / 100) * gramsFor1000;
    const asGramsFromGPer100g = (gPer100g: number) => gPer100g * (gramsFor1000 / 100);

    if (column.key === 'moisture') {
      // Влажность в режиме 1000 ккал не меняем (процент остаётся как есть)
      displayValue = value;
    } else if (percentKeys.includes(column.key)) {
      // Значение задано в процентах (% от продукта)
      const grams = asGramsFromPercent(value as number);
      if (column.key === 'calcium' || column.key === 'phosphorus') {
        displayValue = grams * 1000; // мг/1000 ккал
      } else {
        displayValue = grams; // г/1000 ккал
      }
    } else if (column.key === 'vitaminA' || column.key === 'vitaminD' || column.key === 'vitamin_a' || column.key === 'vitamin_d3') {
      // Витамины: МЕ/кг -> МЕ/1000 ккал пропорционально массе
      displayValue = (value as number) * (gramsFor1000 / 1000);
    } else {
      // Если где-то значение было в г/100г — пересчитаем как для г/100г
      const grams = asGramsFromGPer100g(value as number);
      displayValue = grams;
    }
  }
}
else {
    // сколько граммов корма нужно для 1000 ккал
    const gramsFor1000 = 1000000 / kcalPerKg; // г

    const percentKeys = ['protein','fat','fiber','ash','moisture','calcium','phosphorus'];
    const toMg100gSmart = (val: number): number => (val <= 20 ? val * 1000 : val); // г->мг, мг оставляем
    const asGramsFromPercent = (percent: number) => (percent / 100) * gramsFor1000;
    const asGramsFromGPer100g = (gPer100g: number) => gPer100g * (gramsFor1000 / 100);

    if (column.key === 'moisture') {
      // Влажность в режиме 1000 ккал не меняем (процент остаётся как есть)
      displayValue = value;
    } else if (percentKeys.includes(column.key)) {
      // Значение задано в процентах (% от продукта)
      const grams = asGramsFromPercent(value as number);
      if (column.key === 'calcium' || column.key === 'phosphorus') {
        displayValue = grams * 1000; // мг/1000 ккал
      } else {
        displayValue = grams; // г/1000 ккал
      }
    } else if (column.key === 'vitaminA' || column.key === 'vitaminD') {
      // Витамины: МЕ/кг -> МЕ/1000 ккал пропорционально массе
      displayValue = (value as number) * (gramsFor1000 / 1000);
    } else {
      // Если где-то значение было в г/100г — пересчитаем как для г/100г
      const grams = asGramsFromGPer100g(value as number);
      displayValue = grams;
    }
  }
}

// Пересчёт значений
                        if (compareMode === 'per_1000kcal' && key !== 'ingredients') {
                          if (key === 'moisture') {
                            // Влажность при 1000 ккал не меняется
                            value = value;
                          } else if (typeof value === 'number' && typeof feed.metabolizable_energy === 'number' && feed.metabolizable_energy) {
                            value = (value / feed.metabolizable_energy) * 1000;
                          } else {
                            value = '';
                          }
                        }
                        if (compareMode === 'per_100g_dm' && key !== 'ingredients') {
                          const dryMatter = typeof feed.moisture === 'number' ? 100 - feed.moisture : 90;
                          if (key === 'moisture') {
                            // В сухом веществе воды нет
                            value = 0;
                          } else if (typeof value === 'number' && dryMatter) {
                            value = (value / dryMatter) * 100;
                          } else {
                            value = '';
                          }
                        }

                        // Применяем пересчет для числовых значений (кроме МЭ)
                        let displayValue = value;
                        if (typeof value === 'number' && key !== 'metabolizable_energy' && key !== 'metabolic_energy') {
                          displayValue = recalculateValue(value, feed, key);
                        }

                        return <td key={feed.id} style={{ 
                          padding: '12px 15px', 
                          textAlign: 'center', 
                          color: '#2d3748', 
                          fontWeight: '500',
                          background: 'white'
                        }}>
                          {typeof displayValue === 'number' ? (() => {
                            // Конвертация для разных типов питательных веществ
                            if (key === 'phosphorus') {
                              return toMg100g(displayValue as number).toFixed(0); // мг/100г
                            } else if (key === 'calcium') {
                              return toMg100g(displayValue as number).toFixed(0); // мг/100г
                            } else if (['crude_protein', 'crude_fat', 'crude_fiber', 'ash'].includes(key)) {
                              return displayValue.toFixed(2); // граммы на 100г продукта (проценты уже означают г/100г)
                            } else {
                              return displayValue.toFixed(2);
                            }
                          })() : String(displayValue || '-')}
                        </td>;
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Расчет суточных норм */}
          {showAnimalForm && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '15px',
              overflow: 'hidden',
              marginBottom: '25px',
              border: '2px solid rgba(0, 200, 81, 0.1)'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
                color: 'white',
                padding: '20px',
                textAlign: 'center'
              }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
                  🥣 Суточные нормы для {animalData.name} ({animalData.currentWeight} кг, {energyNeed} ккал/день)
                </h2>
              </div>

              <div style={{ padding: '25px' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${selectedFeedsData.length}, 1fr)`,
                  gap: '20px'
                }}>
                  {selectedFeedsData.map(feed => {
                    const dailyData = calculateDailyAmount(feed);
                    
                    return (
                      <div key={feed.id} style={{
                        background: 'linear-gradient(135deg, rgba(0, 200, 81, 0.05) 0%, rgba(51, 181, 229, 0.05) 100%)',
                        border: '2px solid rgba(0, 200, 81, 0.1)',
                        borderRadius: '15px',
                        padding: '20px',
                        textAlign: 'center'
                      }}>
                        <h3 style={{
                          color: '#2d3748',
                          marginBottom: '15px',
                          fontSize: '1.1rem',
                          fontWeight: '600'
                        }}>
                          {feed.brand} {feed.name.substring(0, 20)}...
                        </h3>

                        <div style={{
                          background: '#00C851',
                          color: 'white',
                          padding: '15px',
                          borderRadius: '10px',
                          marginBottom: '15px'
                        }}>
                          <div style={{ fontSize: '1.8rem', fontWeight: '700' }}>
                            {dailyData.grams} г
                          </div>
                          <div style={{ fontSize: '14px', opacity: 0.9 }}>
                            суточная норма
                          </div>
                        </div>

                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(3, 1fr)',
                          gap: '8px',
                          fontSize: '11px'
                        }}>
                          <div style={{
                            background: 'white',
                            padding: '8px',
                            borderRadius: '6px',
                            border: '1px solid rgba(0, 200, 81, 0.1)',
                            textAlign: 'center'
                          }}>
                            <div style={{ fontWeight: '600', color: '#2d3748', fontSize: '10px' }}>Белок</div>
                            <div style={{ color: '#666', fontSize: '12px', fontWeight: '600' }}>{dailyData.protein} г</div>
                          </div>

                          <div style={{
                            background: 'white',
                            padding: '8px',
                            borderRadius: '6px',
                            border: '1px solid rgba(0, 200, 81, 0.1)',
                            textAlign: 'center'
                          }}>
                            <div style={{ fontWeight: '600', color: '#2d3748', fontSize: '10px' }}>Жир</div>
                            <div style={{ color: '#666', fontSize: '12px', fontWeight: '600' }}>{dailyData.fat} г</div>
                          </div>

                          <div style={{
                            background: 'white',
                            padding: '8px',
                            borderRadius: '6px',
                            border: '1px solid rgba(0, 200, 81, 0.1)',
                            textAlign: 'center'
                          }}>
                            <div style={{ fontWeight: '600', color: '#2d3748', fontSize: '10px' }}>Клетчатка</div>
                            <div style={{ color: '#666', fontSize: '12px', fontWeight: '600' }}>{dailyData.fiber} г</div>
                          </div>

                          <div style={{
                            background: 'white',
                            padding: '8px',
                            borderRadius: '6px',
                            border: '1px solid rgba(0, 200, 81, 0.1)',
                            textAlign: 'center'
                          }}>
                            <div style={{ fontWeight: '600', color: '#2d3748', fontSize: '10px' }}>Ca</div>
                            <div style={{ color: '#666', fontSize: '12px', fontWeight: '600' }}>{dailyData.calcium} г</div>
                          </div>

                          <div style={{
                            background: 'white',
                            padding: '8px',
                            borderRadius: '6px',
                            border: '1px solid rgba(0, 200, 81, 0.1)',
                            textAlign: 'center'
                          }}>
                            <div style={{ fontWeight: '600', color: '#2d3748', fontSize: '10px' }}>P</div>
                            <div style={{ color: '#666', fontSize: '12px', fontWeight: '600' }}>{dailyData.phosphorus} г</div>
                          </div>

                          <div style={{
                            background: 'white',
                            padding: '8px',
                            borderRadius: '6px',
                            border: '1px solid rgba(0, 200, 81, 0.1)',
                            textAlign: 'center'
                          }}>
                            <div style={{ fontWeight: '600', color: '#2d3748', fontSize: '10px' }}>Вит А</div>
                            <div style={{ color: '#666', fontSize: '12px', fontWeight: '600' }}>{dailyData.vitaminA} МЕ</div>
                          </div>

                          <div style={{
                            background: 'white',
                            padding: '8px',
                            borderRadius: '6px',
                            border: '1px solid rgba(0, 200, 81, 0.1)',
                            textAlign: 'center'
                          }}>
                            <div style={{ fontWeight: '600', color: '#2d3748', fontSize: '10px' }}>Вит Д</div>
                            <div style={{ color: '#666', fontSize: '12px', fontWeight: '600' }}>{dailyData.vitaminD3} МЕ</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}


        </>
      )}

      {selectedFeeds.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: 'rgba(255, 255, 255, 0.8)',
          borderRadius: '20px',
          border: '2px dashed rgba(0, 200, 81, 0.3)'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🍖</div>
          <h2 style={{
            color: '#2d3748',
            marginBottom: '15px',
            fontSize: '1.5rem',
            fontWeight: '600'
          }}>
            Сначала выберите корма для сравнения
          </h2>
          <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '30px' }}>
            Перейдите на вкладку "Корма", выберите нужные корма с помощью чекбоксов 
            и нажмите "Перейти к сравнению"
          </p>
          
          <button
            onClick={() => window.location.href = '/feeds'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '15px 30px',
              background: 'linear-gradient(135deg, #00C851 0%, #33B5E5 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '15px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 25px rgba(0, 200, 81, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 12px 35px rgba(0, 200, 81, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 200, 81, 0.3)';
            }}>
            🍖 Перейти к выбору кормов
          </button>
        </div>
      )}
    </div>
  );
};

export default Comparisons; 