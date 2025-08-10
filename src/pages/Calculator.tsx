import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AnimalEnergyData } from '../types';
import { calculateEnergyNeed } from '../utils/calculateEnergyNeed';
import { calculateIdealWeight } from '../utils/calculateIdealWeight';


// === NEW: precise ME calculation based on client's algorithm ===
type SpeciesAlg = 'dog' | 'cat';
type AgeUnitAlg = 'years' | 'months' | 'weeks';
type ActivityAlg = 'low' | 'moderate' | 'high' | 'obesity_prone';
type StatusAlg = 'none' | 'preg_1_4' | 'preg_5_plus' | 'lactation';

function calculateMEAlgorithm(params: {
  species: SpeciesAlg;
  age: number;
  ageUnit: AgeUnitAlg;
  weight: number;           // target weight (kg)
  bcs: number;              // 1..9
  activity: ActivityAlg;
  status: StatusAlg;
  adultWeight?: number;     // for puppies/kittens
  lactationWeek?: number;   // integer
  litterCount?: number;     // puppies/kittens count
}): number {
  const { species, age, ageUnit, weight, bcs, activity, status, adultWeight = 0, lactationWeek = 0, litterCount = 0 } = params;
  const pow = (x:number,p:number)=>Math.pow(x,p);
  const bcsMultipliers: Record<number, number> = {1:1.4,2:1.3,3:1.2,4:1.1,5:1.0,6:0.9,7:0.8,8:0.7,9:0.6};
  const oBW = weight * (bcsMultipliers[bcs] ?? 1.0);
  const ageWeeks = ageUnit === 'weeks' ? age : ageUnit === 'months' ? age * 4.3482 : age * 52;

  const dogLactWeekCoef = (w:number) => ({1:0.75,2:0.95,3:1.1,4:1.2} as any)[w] ?? 1.0;
  const catLactWeekCoef = (w:number) => ({1:0.9,2:0.9,3:1.2,4:1.2,5:1.1,6:1.0,7:0.8} as any)[w] ?? 1.0;

  // Status overrides
  if (status === 'preg_1_4') {
    return species === 'dog' ? 132 * pow(oBW, 0.75) : 140 * pow(oBW, 0.67);
  }
  if (status === 'preg_5_plus') {
    return species === 'dog' ? 132 * pow(oBW, 0.75) + 26 * oBW : 140 * pow(oBW, 0.67);
  }
  if (status === 'lactation') {
    if (species === 'dog') {
      const k = dogLactWeekCoef(lactationWeek || 1);
      if (litterCount > 0 && litterCount < 4) return 145 * pow(oBW, 0.75) + 24 * litterCount * oBW * k;
      if (litterCount >= 4) return 145 * pow(oBW, 0.75) + (96 + 12 * (litterCount - 4)) * oBW * k;
      return 145 * pow(oBW, 0.75);
    } else {
      const k = catLactWeekCoef(lactationWeek || 1);
      if (litterCount > 0 && litterCount < 3) return 100 * pow(oBW, 0.67) + 18 * oBW * k;
      if (litterCount === 3 || litterCount === 4) return 100 * pow(oBW, 0.67) + 60 * oBW * k;
      if (litterCount > 4) return 100 * pow(oBW, 0.67) + 70 * oBW * k;
      return 100 * pow(oBW, 0.67);
    }
  }

  // Adults (age in years)
  if (ageUnit === 'years') {
    if (species === 'dog') {
      if (age > 7) return 95 * pow(oBW, 0.75);
      if (age < 2.1) return 130 * pow(oBW, 0.75);
      switch (activity) {
        case 'low': return 95 * pow(oBW, 0.75);
        case 'moderate': return 110 * pow(oBW, 0.75);
        case 'high': return 130 * pow(oBW, 0.75);
        case 'obesity_prone': return 90 * pow(oBW, 0.75);
      }
      return 110 * pow(oBW, 0.75);
    } else {
      if (age > 7) return 75 * pow(oBW, 0.67);
      switch (activity) {
        case 'low': return 65 * pow(oBW, 0.67);
        case 'moderate': return 75 * pow(oBW, 0.67);
        case 'high': return 100 * pow(oBW, 0.67);
        case 'obesity_prone': return 65 * pow(oBW, 0.67);
      }
      return 75 * pow(oBW, 0.67);
    }
  }

  // Puppies/kittens
  const hasAdult = (adultWeight || 0) > 0;
  if (species === 'dog') {
    if (hasAdult) {
      if (ageWeeks < 8) return 250 * weight;
      if (ageWeeks >= 8.1) return (254.1 - 135.0 * (weight / adultWeight)) * pow(weight, 0.75);
    } else {
      if (ageWeeks < 21) return 175 * pow(oBW, 0.75);
      if (ageWeeks > 22) return 140 * pow(oBW, 0.75);
    }
  } else {
    if (ageWeeks < 18) return 2.3 * 70 * pow(weight, 0.67);
    if (ageWeeks >= 18 && ageWeeks < 39) return 1.9 * 70 * pow(weight, 0.67);
    if (ageWeeks >= 39) return 1.5 * 70 * pow(weight, 0.67);
  }

  return species === 'dog' ? 110 * pow(oBW, 0.75) : 75 * pow(oBW, 0.67);
}
// === /NEW ===

// Компонент подсказки
const InfoTooltip: React.FC<{ text: string }> = ({ text }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div style={{ position: 'relative', display: 'inline-block', marginLeft: '8px' }}>
      <button
        type="button"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          border: '2px solid #00C851',
          background: 'white',
          color: '#00C851',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease'
        }}
      >
        !
      </button>
      {isVisible && (
        <div style={{
          position: 'absolute',
          top: '25px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#2d3748',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '14px',
          lineHeight: '1.4',
          maxWidth: '250px',
          whiteSpace: 'normal',
          zIndex: 1000,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          {text}
          <div style={{
            position: 'absolute',
            top: '-6px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '0',
            height: '0',
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderBottom: '6px solid #2d3748'
          }} />
        </div>
      )}
    </div>
  );
};

interface Feed {
  id: number;
  name: string;
  brand: string;
  type: string;
  animal_type: string;
  metabolic_energy: number;
  protein: number;
  fat: number;
  fiber: number;
  ash: number;
  carbohydrates: number;
  calcium: number;
  phosphorus: number;
  ingredients: string;
}

const Calculator: React.FC = () => {
  const windowWidth = window.innerWidth;

  const [animalData, setAnimalData] = useState<AnimalEnergyData>({
    species: 'собака',
    gender: 'самец',
    breed: '',
    age: 0,
    condition: 5,
    name: '',
    status: 'кастрированный',
    activity: 'нормальная активность',
    owner: '',
    currentWeight: 0,
    targetWeight: 0,
    adultWeight: 0,
    lactationWeeks: 0,
    contact: '',
    meCoefficient: 1
  });

  const [energyNeed, setEnergyNeed] = useState<number>(0);
  const [diagnosis, setDiagnosis] = useState('');
  const [intolerances, setIntolerances] = useState('');
  const [ageFormat, setAgeFormat] = useState<'years' | 'months' | 'weeks'>('years');

  // Современные стили для полей
  const modernFieldStyle: React.CSSProperties = {
    width: '100%',
    padding: '16px 20px',
    fontSize: '16px',
    fontWeight: '500',
    color: '#2d3748',
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)',
    border: '2px solid rgba(0, 200, 81, 0.2)',
    borderRadius: '12px',
    outline: 'none',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 4px 20px rgba(0, 200, 81, 0.08)',
    fontFamily: 'inherit'
  };

  const modernSelectStyle: React.CSSProperties = {
    ...modernFieldStyle,
    paddingRight: '50px',
    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2300C851' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
    backgroundPosition: 'right 16px center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '20px',
    cursor: 'pointer',
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none'
  };

  const modernLabelStyle: React.CSSProperties = {
    position: 'absolute',
    top: '-10px',
    left: '16px',
    background: 'linear-gradient(135deg, #00C851 0%, #33B5E5 100%)',
    color: 'white',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    boxShadow: '0 4px 15px rgba(0, 200, 81, 0.3)',
    zIndex: 1
  };

  const fieldContainerStyle: React.CSSProperties = {
    position: 'relative',
    marginBottom: '24px'
  };

  const modernFocusStyle = {
    borderColor: '#00C851',
    boxShadow: '0 8px 30px rgba(0, 200, 81, 0.2), 0 0 0 3px rgba(0, 200, 81, 0.1)',
    transform: 'translateY(-2px)'
  };

  const modernTextareaStyle: React.CSSProperties = {
    ...modernFieldStyle,
    minHeight: '80px',
    resize: 'vertical' as 'vertical',
    paddingTop: '20px'
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
    const speciesAlg = animalData.species === 'собака' ? 'dog' : 'cat';
    const activityMap: any = {
      'склонность к ожирению': 'obesity_prone',
      'нормальная активность': 'moderate',
      'высокая активность': 'high'
    };
    const statusMap: any = {
      'беременность 1-4 недели': 'preg_1_4',
      'беременность >5 недель': 'preg_5_plus',
      'лактация': 'lactation'
    };
    const calculated = calculateMEAlgorithm({
      species: speciesAlg as any,
      age: animalData.age || 0,
      ageUnit: ageFormat,
      weight: animalData.targetWeight || 0,
      bcs: (animalData.condition as any) || 5,
      activity: (activityMap[animalData.activity || 'нормальная активность'] || 'moderate') as any,
      status: (statusMap[animalData.status || ''] || 'none') as any,
      adultWeight: animalData.adultWeight || 0,
      lactationWeek: animalData.lactationWeeks || 0,
      litterCount: 0
    });
    setEnergyNeed(calculated);
    
    // Сохраняем ВСЕ данные животного для использования в Аналитике
    const animalForAnalytics = {
      ...animalData,
      energyNeed: calculated,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem('animalData', JSON.stringify(animalForAnalytics));
    
    // Сохраняем диагноз и непереносимости отдельно
    localStorage.setItem('diagnosis', diagnosis);
    localStorage.setItem('intolerances', intolerances);
  }, [animalData, energyNeed, diagnosis, intolerances]);

  const handleInputChange = (field: keyof AnimalEnergyData, value: any) => {
    setAnimalData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #00C851 0%, #33B5E5 100%)',
      padding: window.innerWidth <= 768 ? '10px' : '20px'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '30px'
        }}>
          <h1 style={{
            fontSize: window.innerWidth <= 768 ? '28px' : '36px',
            fontWeight: '700',
            color: 'white',
            marginBottom: '10px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            🧮 Калькулятор питания
          </h1>
          <p style={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: window.innerWidth <= 768 ? '16px' : '18px',
            textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
          }}>
            Расчёт потребности в метаболизируемой энергии
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          {/* Группа 1: Основные характеристики */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
            padding: '30px',
            borderRadius: '20px',
            boxShadow: '0 10px 40px rgba(0, 200, 81, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 200, 81, 0.2)'
          }}>
            <h3 style={{ 
              color: '#1a202c', 
              marginBottom: '25px', 
              fontSize: '1.3rem', 
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{
                background: 'linear-gradient(135deg, #00C851 0%, #33B5E5 100%)',
                color: 'white',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: 'bold'
              }}>
                1
              </span>
              Основные характеристики
            </h3>

            <div style={fieldContainerStyle}>
              <select
                value={animalData.species}
                onChange={(e) => handleInputChange('species', e.target.value)}
                style={modernSelectStyle}
              >
                <option value="собака">🐕 Собака</option>
                <option value="кошка">🐱 Кошка</option>
                              </select>
              <label style={modernLabelStyle}>вид животного</label>
            </div>

            <div style={fieldContainerStyle}>
              <select
                value={animalData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                style={modernSelectStyle}
              >
                <option value="самец">♂ Самец</option>
                <option value="самка">♀ Самка</option>
              </select>
              <label style={modernLabelStyle}>пол</label>
            </div>

            <div style={fieldContainerStyle}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px' }}>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    step="0.1"
                    value={animalData.age}
                    onChange={(e) => handleInputChange('age', parseFloat(e.target.value))}
                    style={modernFieldStyle}
                    placeholder="0.0"
                    onFocus={(e) => Object.assign(e.target.style, modernFocusStyle)}
                    onBlur={(e) => Object.assign(e.target.style, { borderColor: 'rgba(0, 200, 81, 0.2)', boxShadow: 'none', transform: 'none' })}
                  />
                  <label style={modernLabelStyle}>возраст</label>
                </div>
                <select
                  value={ageFormat}
                  onChange={(e) => setAgeFormat(e.target.value as 'years' | 'months' | 'weeks')}
                  style={modernSelectStyle}
                >
                  <option value="years">лет</option>
                  <option value="months">мес.</option>
                  <option value="weeks">нед.</option>
                </select>
              </div>
            </div>

            <div style={fieldContainerStyle}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="number"
                  min="1"
                  max="9"
                  value={animalData.condition}
                  onChange={(e) => handleInputChange('condition', parseInt(e.target.value))}
                  style={modernFieldStyle}
                  placeholder="1-9"
                  onFocus={(e) => Object.assign(e.target.style, modernFocusStyle)}
                  onBlur={(e) => Object.assign(e.target.style, { borderColor: 'rgba(0, 200, 81, 0.2)', boxShadow: 'none', transform: 'none' })}
                />
                <InfoTooltip text="Шкала оценки упитанности: 1-3 недостаточная масса тела, 4-5 идеальная масса тела, 6-7 избыточная масса тела, 8-9 ожирение. Кондиция 5 соответствует идеальному весу." />
              </div>
              <label style={modernLabelStyle}>кондиция (1-9)</label>
            </div>

            <div style={fieldContainerStyle}>
              <select
                value={animalData.activity}
                onChange={(e) => handleInputChange('activity', e.target.value)}
                style={modernSelectStyle}
              >
                <option value="склонность к ожирению">🛌 Склонность к ожирению</option>
                <option value="нормальная активность">🚶 Нормальная активность</option>
                <option value="высокая активность">🏃 Высокая активность</option>
              </select>
              <label style={modernLabelStyle}>активность</label>
            </div>

            <div style={fieldContainerStyle}>
              <select
                value={animalData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                style={modernSelectStyle}
              >
                <option value="кастрированный">⚕ Кастрированный</option>
                <option value="интактный">🔸 Интактный</option>
                <option value="беременность 1-4 недели">🤱 Беременность 1-4 недели</option>
                <option value="беременность >5 недель">🤱 Беременность {'>'}5 недель</option>
                <option value="лактация">🍼 Лактация</option>
              </select>
              <label style={modernLabelStyle}>статус</label>
            </div>
          </div>

          {/* Группа 2: Персональные данные */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
            padding: '30px',
            borderRadius: '20px',
            boxShadow: '0 10px 40px rgba(0, 200, 81, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 200, 81, 0.2)'
          }}>
            <h3 style={{ 
              color: '#1a202c', 
              marginBottom: '25px', 
              fontSize: '1.3rem', 
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{
                background: 'linear-gradient(135deg, #00C851 0%, #33B5E5 100%)',
                color: 'white',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: 'bold'
              }}>
                2
              </span>
              Персональные данные
            </h3>

            <div style={fieldContainerStyle}>
              <input
                type="text"
                value={animalData.breed}
                onChange={(e) => handleInputChange('breed', e.target.value)}
                style={modernFieldStyle}
                placeholder="Введите породу"
                onFocus={(e) => Object.assign(e.target.style, modernFocusStyle)}
                onBlur={(e) => Object.assign(e.target.style, { borderColor: 'rgba(0, 200, 81, 0.2)', boxShadow: 'none', transform: 'none' })}
              />
              <label style={modernLabelStyle}>порода</label>
            </div>

            <div style={fieldContainerStyle}>
              <input
                type="text"
                value={animalData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                style={modernFieldStyle}
                placeholder="Введите кличку"
                onFocus={(e) => Object.assign(e.target.style, modernFocusStyle)}
                onBlur={(e) => Object.assign(e.target.style, { borderColor: 'rgba(0, 200, 81, 0.2)', boxShadow: 'none', transform: 'none' })}
              />
              <label style={modernLabelStyle}>кличка</label>
            </div>

            <div style={fieldContainerStyle}>
              <input
                type="text"
                value={animalData.owner}
                onChange={(e) => handleInputChange('owner', e.target.value)}
                style={modernFieldStyle}
                placeholder="Введите имя владельца"
                onFocus={(e) => Object.assign(e.target.style, modernFocusStyle)}
                onBlur={(e) => Object.assign(e.target.style, { borderColor: 'rgba(0, 200, 81, 0.2)', boxShadow: 'none', transform: 'none' })}
              />
              <label style={modernLabelStyle}>владелец</label>
            </div>

            <div style={fieldContainerStyle}>
              <textarea
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                style={modernTextareaStyle}
                placeholder="Основной диагноз (при наличии)"
                onFocus={(e) => Object.assign(e.target.style, modernFocusStyle)}
                onBlur={(e) => Object.assign(e.target.style, { borderColor: 'rgba(0, 200, 81, 0.2)', boxShadow: 'none', transform: 'none' })}
              />
              <label style={modernLabelStyle}>🏥 диагноз</label>
            </div>

            <div style={fieldContainerStyle}>
              <textarea
                value={intolerances}
                onChange={(e) => setIntolerances(e.target.value)}
                style={modernTextareaStyle}
                placeholder="Непереносимости и аллергии"
                onFocus={(e) => Object.assign(e.target.style, modernFocusStyle)}
                onBlur={(e) => Object.assign(e.target.style, { borderColor: 'rgba(0, 200, 81, 0.2)', boxShadow: 'none', transform: 'none' })}
              />
              <label style={modernLabelStyle}>⚠️ непереносимости</label>
            </div>

            <div style={fieldContainerStyle}>
              <input
                type="text"
                value={animalData.contact}
                onChange={(e) => handleInputChange('contact', e.target.value)}
                style={modernFieldStyle}
                placeholder="Введите контакт"
                onFocus={(e) => Object.assign(e.target.style, modernFocusStyle)}
                onBlur={(e) => Object.assign(e.target.style, { borderColor: 'rgba(0, 200, 81, 0.2)', boxShadow: 'none', transform: 'none' })}
              />
              <label style={modernLabelStyle}>контакт</label>
            </div>
          </div>

          {/* Группа 3: Весовые характеристики */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
            padding: '30px',
            borderRadius: '20px',
            boxShadow: '0 10px 40px rgba(0, 200, 81, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 200, 81, 0.2)'
          }}>
            <h3 style={{ 
              color: '#1a202c', 
              marginBottom: '25px', 
              fontSize: '1.3rem', 
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{
                background: 'linear-gradient(135deg, #00C851 0%, #33B5E5 100%)',
                color: 'white',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: 'bold'
              }}>
                3
              </span>
              Весовые характеристики
            </h3>

            <div style={fieldContainerStyle}>
              <input
                type="number"
                step="0.1"
                value={animalData.currentWeight}
                onChange={(e) => handleInputChange('currentWeight', parseFloat(e.target.value))}
                style={modernFieldStyle}
                placeholder="0.0"
                onFocus={(e) => Object.assign(e.target.style, modernFocusStyle)}
                onBlur={(e) => Object.assign(e.target.style, { borderColor: 'rgba(0, 200, 81, 0.2)', boxShadow: 'none', transform: 'none' })}
              />
              <label style={modernLabelStyle}>текущий вес (кг)</label>
            </div>

            <div style={fieldContainerStyle}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="number"
                  step="0.1"
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
                <InfoTooltip text="Расчетный (идеальный) вес рассчитывается автоматически на основе текущего веса и кондиции животного. Кондиция 5 = идеальный вес = текущий вес. Кондиция <5 = недовес, нужно увеличить вес. Кондиция >5 = перевес, нужно снизить вес." />
              </div>
              <label style={{
                ...modernLabelStyle,
                background: 'linear-gradient(135deg, #00C851 0%, #33B5E5 100%)'
              }}>расчетный вес (кг) ⚡ авто</label>
            </div>

            <div style={fieldContainerStyle}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="number"
                  step="0.1"
                  value={animalData.adultWeight}
                  onChange={(e) => handleInputChange('adultWeight', parseFloat(e.target.value))}
                  style={modernFieldStyle}
                  placeholder="0.0"
                  onFocus={(e) => Object.assign(e.target.style, modernFocusStyle)}
                  onBlur={(e) => Object.assign(e.target.style, { borderColor: 'rgba(0, 200, 81, 0.2)', boxShadow: 'none', transform: 'none' })}
                />
                <InfoTooltip text="Взрослый вес - это идеальный вес здорового взрослого животного данной породы и размера при кондиции 5 (идеальная упитанность). Используется для расчета энергетических потребностей молодых растущих животных." />
              </div>
              <label style={modernLabelStyle}>взрослый вес (кг)</label>
            </div>

            {/* Результат расчета энергии */}
            <div style={{
              background: 'linear-gradient(135deg, #ff9a8b 0%, #fad0c4 100%)',
              padding: '20px',
              borderRadius: '12px',
              textAlign: 'center',
              marginBottom: '16px'
            }}>
              <div style={{ fontSize: '14px', color: '#7c2d12', marginBottom: '4px' }}>
                потребность в МЭ, ккал/день
              </div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#7c2d12' }}>
                {energyNeed.toFixed(2)}
              </div>
            </div>

            {/* Коэффициент МЭ - корректировка потребности */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 152, 0, 0.1) 100%)',
              padding: '20px',
              borderRadius: '12px',
              border: '2px solid rgba(255, 193, 7, 0.2)',
              marginBottom: '16px'
            }}>
              <div style={{ marginBottom: '12px' }}>
                <h4 style={{ color: '#2d3748', fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                  🔧 Корректировка потребности
                </h4>
                <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.5', marginBottom: '16px' }}>
                  Введите коэффициент для увеличения или уменьшения рассчитанной потребности, если это необходимо. 
                  По умолчанию - 1.0 (без изменений).
                </p>
              </div>
              
              <div style={fieldContainerStyle}>
                <input
                  type="number"
                  step="0.1"
                  value={animalData.meCoefficient}
                  onChange={(e) => handleInputChange('meCoefficient', parseFloat(e.target.value))}
                  style={{
                    ...modernFieldStyle,
                    background: 'rgba(255, 255, 255, 0.9)',
                    border: '2px solid rgba(255, 193, 7, 0.3)',
                    width: '120px',
                    textAlign: 'center',
                    fontSize: '18px',
                    fontWeight: '600'
                  }}
                  placeholder="1.0"
                  onFocus={(e) => Object.assign(e.target.style, { borderColor: '#FFC107', boxShadow: '0 8px 30px rgba(255, 193, 7, 0.2)', transform: 'translateY(-2px)' })}
                  onBlur={(e) => Object.assign(e.target.style, { borderColor: 'rgba(255, 193, 7, 0.3)', boxShadow: 'none', transform: 'none' })}
                />
                <label style={{
                  ...modernLabelStyle,
                  background: 'linear-gradient(135deg, #FFC107 0%, #FF9800 100%)'
                }}>коэффициент МЭ</label>
              </div>

              {(animalData.meCoefficient !== 1 && animalData.meCoefficient) && (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.8)',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 193, 7, 0.3)',
                  marginTop: '12px'
                }}>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
                    скорректированная потребность:
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#FF9800' }}>
                    {(energyNeed * (animalData.meCoefficient || 1)).toFixed(2)} ккал/день
                  </div>
                </div>
              )}
            </div>

            {/* Навигация к базе кормов */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(0, 200, 81, 0.1) 0%, rgba(51, 181, 229, 0.1) 100%)',
              padding: '20px',
              borderRadius: '12px',
              textAlign: 'center',
              border: '2px solid rgba(0, 200, 81, 0.2)',
              marginBottom: '16px'
            }}>
              <h4 style={{ color: '#2d3748', fontSize: '16px', fontWeight: '600', marginBottom: '10px' }}>
                Следующий шаг
              </h4>
              <p style={{ color: '#666', fontSize: '14px', marginBottom: '15px' }}>
                Теперь выберите подходящие корма для сравнения и анализа
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link 
                  to="/feeds"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'linear-gradient(135deg, #00C851 0%, #33B5E5 100%)',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600',
                    padding: '12px 20px',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(0, 200, 81, 0.3)'
                  }}
                >
                  🍖 База кормов
                </Link>
                <Link 
                  to="/comparisons"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600',
                    padding: '12px 20px',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(255, 107, 53, 0.3)'
                  }}
                >
                  📊 Аналитика
                </Link>
              </div>
            </div>

            <button
              onClick={() => {
                setAnimalData({
                  species: 'собака',
                  gender: 'самец',
                  breed: '',
                  age: 0,
                  condition: 5,
                  name: '',
                  status: 'кастрированный',
                  activity: 'нормальная активность',
                  owner: '',
                  currentWeight: 0,
                  targetWeight: 0,
                  adultWeight: 0,
                  lactationWeeks: 0,
                  contact: '',
                  meCoefficient: 1
                });
                setEnergyNeed(0);
                setDiagnosis('');
                setIntolerances('');
              }}
              style={{
                width: '100%',
                height: '48px',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(240, 147, 251, 0.3)'
              }}
            >
              🔄 Очистить форму
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calculator; 