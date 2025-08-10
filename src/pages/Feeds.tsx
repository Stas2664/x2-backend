import React, { useState, useEffect } from 'react';
import config from '../config';
import { Link } from 'react-router-dom'; // Added Link import

interface Feed {
  id: number;
  name: string;
  brand: string;
  type: string;
  animal_type: string;
  category: string;
  metabolic_energy: number;
  protein: number;
  fat: number;
  carbohydrates: number;
  fiber: number;
  ash: number;
  moisture: number;
  calcium: number;
  phosphorus: number;
  sodium: number;
  vitamin_d: number;
  vitamin_e: number;
  ingredients: string;
  notes: string;
  price_per_kg: number;
  is_public: boolean;
  created_at: string;
}

const Feeds: React.FC = () => {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedFeedCategory, setSelectedFeedCategory] = useState(''); // полнорационный/дополнительный/терапевтический
  const [proteinMin, setProteinMin] = useState<number | ''>('');
  const [proteinMax, setProteinMax] = useState<number | ''>('');
  const [fatMin, setFatMin] = useState<number | ''>('');
  const [fatMax, setFatMax] = useState<number | ''>('');
  const [fiberMin, setFiberMin] = useState<number | ''>('');
  const [fiberMax, setFiberMax] = useState<number | ''>('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedAnimalType, setSelectedAnimalType] = useState(''); // Новый фильтр

  // Списки для фильтров
  const [brands, setBrands] = useState<string[]>([]);
  const [animalTypes, setAnimalTypes] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  // Состояние для выбранных кормов и пагинации
  const [selectedFeeds, setSelectedFeeds] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showIngredientsModal, setShowIngredientsModal] = useState(false);
  const [selectedFeedIngredients, setSelectedFeedIngredients] = useState('');

  const [newFeed, setNewFeed] = useState({
    name: '',
    brand: '',
    type: 'dry',
    animal_type: 'dog',
    category: 'adult',
    metabolic_energy: 0,
    protein: 0,
    fat: 0,
    carbohydrates: 0,
    fiber: 0,
    ash: 0,
    moisture: 0,
    calcium: 0,
    phosphorus: 0,
    sodium: 0,
    vitamin_d: 0,
    vitamin_e: 0,
    ingredients: ''
  });

  // --- СТЕЙТ ДЛЯ ФОРМУЛЫ МЭ ---
  const [meFormula, setMeFormula] = useState<'standard' | 'nrc'>('standard');

  // Современные стили для полей
  const modernFieldStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    fontSize: '14px',
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
    paddingRight: '40px',
    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2300C851' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
    backgroundPosition: 'right 12px center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '16px',
    cursor: 'pointer',
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none'
  };

  const modernFocusStyle = {
    borderColor: '#00C851',
    boxShadow: '0 6px 25px rgba(0, 200, 81, 0.15), 0 0 0 3px rgba(0, 200, 81, 0.1)',
    transform: 'translateY(-1px)'
  };

  // Автоматический расчет углеводов
  useEffect(() => {
    // Если не указана влажность, принимаем 10%
    const moisture = isNaN(newFeed.moisture) ? 10 : newFeed.moisture;
    const protein = isNaN(newFeed.protein) ? 0 : newFeed.protein;
    const fat = isNaN(newFeed.fat) ? 0 : newFeed.fat;
    const fiber = isNaN(newFeed.fiber) ? 0 : newFeed.fiber;
    const ash = isNaN(newFeed.ash) ? 0 : newFeed.ash;

    // Расчет углеводов: 100% - влажность% - белок% - жир% - клетчатка% - зола%
    const calculatedCarbs = Math.max(0, 100 - moisture - protein - fat - fiber - ash);

    // Расчет МЭ по выбранной формуле
    let calculatedME = 0;
    
    if (meFormula === 'standard') {
      // Стандартная формула: МЭ = 3.5 * белок + 8.5 * жир + 3.5 * углеводы
      calculatedME = Math.round((3.5 * protein + 8.5 * fat + 3.5 * calculatedCarbs) * 10);
    } else if (meFormula === 'nrc') {
      // Формула NRC 2006: более сложная формула (упрощенная версия)
      // НА САМОМ ДЕЛЕ формула NRC сложнее, но для демонстрации используем модифицированную
      calculatedME = Math.round((3.8 * protein + 8.4 * fat + 3.8 * calculatedCarbs - 0.8 * fiber) * 10);
    }

    // Обновляем состояние только если значения изменились
    setNewFeed(prev => {
      if (prev.carbohydrates !== calculatedCarbs || prev.metabolic_energy !== calculatedME) {
        return {
          ...prev,
          carbohydrates: calculatedCarbs,
          metabolic_energy: calculatedME
        };
      }
      return prev;
    });
  }, [newFeed.moisture, newFeed.protein, newFeed.fat, newFeed.fiber, newFeed.ash, meFormula]);

  useEffect(() => {
    fetchFeeds();
  }, []);

  const fetchFeeds = async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}${config.API_ENDPOINTS.feeds}/detailed`);
      const data = await response.json();
      if (data.success) {
        setFeeds(data.feeds);
      }
    } catch (error) {
      console.error('Error fetching feeds:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFeed = async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}${config.API_ENDPOINTS.feeds}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newFeed,
          calories_per_100g: newFeed.metabolic_energy / 10 // конвертация из kcal/kg в kcal/100g
        }),
      });

      if (response.ok) {
        await fetchFeeds();
        setShowAddForm(false);
        resetNewFeed();
        alert('Корм успешно добавлен!');
      } else {
        alert('Ошибка при добавлении корма');
      }
    } catch (error) {
      console.error('Error adding feed:', error);
      alert('Ошибка при добавлении корма');
    }
  };

  const handleDeleteFeed = async (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить этот корм?')) {
      try {
        const response = await fetch(`${config.API_BASE_URL}${config.API_ENDPOINTS.feeds}/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          await fetchFeeds();
          alert('Корм успешно удален!');
        } else {
          alert('Ошибка при удалении корма');
        }
      } catch (error) {
        console.error('Error deleting feed:', error);
        alert('Ошибка при удалении корма');
      }
    }
  };

  const resetNewFeed = () => {
    setNewFeed({
      name: '',
      brand: '',
      type: 'dry',
      animal_type: 'dog',
      category: 'adult',
      metabolic_energy: 0,
      protein: 0,
      fat: 0,
      carbohydrates: 0,
      fiber: 0,
      ash: 0,
      moisture: 0,
      calcium: 0,
      phosphorus: 0,
      sodium: 0,
      vitamin_d: 0,
      vitamin_e: 0,
      ingredients: ''
    });
  };

  const filteredFeeds = feeds.filter(feed => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === '' || 
                         feed.name.toLowerCase().includes(searchLower) ||
                         feed.brand.toLowerCase().includes(searchLower) ||
                         feed.ingredients.toLowerCase().includes(searchLower) ||
                         feed.category.toLowerCase().includes(searchLower);
    const matchesBrand = !selectedBrand || feed.brand === selectedBrand;
    const matchesType = !selectedType || feed.type === selectedType;
    const matchesAnimalType = !selectedAnimalType || feed.animal_type === selectedAnimalType;
    const matchesCategory = !selectedCategory || feed.category === selectedCategory;
    const matchesFeedCategory = !selectedFeedCategory || (feed as any).feed_category === selectedFeedCategory;

    const within = (val:number, min:any, max:any) => (min === '' || val >= min) && (max === '' || val <= max);
    const matchesProtein = within(feed.protein, proteinMin, proteinMax);
    const matchesFat = within(feed.fat, fatMin, fatMax);
    const matchesFiber = within(feed.fiber, fiberMin, fiberMax);
    
    return matchesSearch && matchesBrand && matchesType && matchesAnimalType && matchesCategory && matchesFeedCategory && matchesProtein && matchesFat && matchesFiber;
  });

  // Пагинация
  const totalPages = Math.ceil(filteredFeeds.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentFeeds = filteredFeeds.slice(startIndex, startIndex + itemsPerPage);

  // Функции для работы с выбранными кормами
  const handleFeedSelect = (feedId: number) => {
    setSelectedFeeds(prev => 
      prev.includes(feedId) 
        ? prev.filter(id => id !== feedId)
        : [...prev, feedId]
    );
  };

  const handleSelectAll = () => {
    if (selectedFeeds.length === currentFeeds.length) {
      setSelectedFeeds([]);
    } else {
      setSelectedFeeds(currentFeeds.map(feed => feed.id));
    }
  };

  // Функция для показа ингредиентов
  const showIngredients = (ingredients: string) => {
    setSelectedFeedIngredients(ingredients);
    setShowIngredientsModal(true);
  };
const feedsBySpecies = selectedAnimalType
    ? feeds.filter(f => f.animal_type === selectedAnimalType)
    : feeds;

  const uniqueAnimalTypes = Array.from(new Set(feeds.map(f => f.animal_type).filter(Boolean)));
  const uniqueTypes = Array.from(new Set(feedsBySpecies.map(f => f.type).filter(Boolean)));
  const uniqueBrands = Array.from(new Set(feedsBySpecies.map(f => f.brand).filter(Boolean)));
  const uniqueFeedCategories = Array.from(new Set(feedsBySpecies.map(f => (f as any).feed_category || '').filter(Boolean)));
  const uniquePurposes = Array.from(new Set(feedsBySpecies.map(f => f.category).filter(Boolean)));
if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        fontSize: '18px',
        color: '#666'
      }}>
        Загрузка кормов...
      </div>
    );
  }

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
          WebkitTextFillColor: 'transparent'
        }}>
          🍖 База кормов
        </h1>
        <p style={{
          color: '#666',
          fontSize: '1.1rem'
        }}>
          Полная база данных кормов с подробным составом и питательностью
        </p>
      </div>

      {/* Панель управления */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '25px',
        borderRadius: '15px',
        marginBottom: '25px',
        border: '2px solid rgba(0, 200, 81, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 200, 81, 0.1)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: '20px',
          alignItems: 'center'
        }}>
          {/* Фильтры */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
            gap: '15px'
          }}>
            <input
              type="text"
              placeholder="🔍 Поиск по названию, бренду или ингредиентам..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={modernFieldStyle}
              onFocus={(e) => Object.assign(e.target.style, modernFocusStyle)}
              onBlur={(e) => Object.assign(e.target.style, { borderColor: 'rgba(0, 200, 81, 0.2)', boxShadow: '0 3px 15px rgba(0, 200, 81, 0.08)', transform: 'none' })}
            />

            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              style={modernSelectStyle}
              onFocus={(e) => Object.assign(e.target.style, modernFocusStyle)}
              onBlur={(e) => Object.assign(e.target.style, { borderColor: 'rgba(0, 200, 81, 0.2)', boxShadow: '0 3px 15px rgba(0, 200, 81, 0.08)', transform: 'none' })}
            >
              <option value="">Все бренды</option>
              {uniqueBrands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              style={modernSelectStyle}
              onFocus={(e) => Object.assign(e.target.style, modernFocusStyle)}
              onBlur={(e) => Object.assign(e.target.style, { borderColor: 'rgba(0, 200, 81, 0.2)', boxShadow: '0 3px 15px rgba(0, 200, 81, 0.08)', transform: 'none' })}
            >
              <option value="">Все типы</option>
              {uniqueTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <select
              value={selectedAnimalType}
              onChange={(e) => setSelectedAnimalType(e.target.value)}
              style={modernSelectStyle}
              onFocus={(e) => Object.assign(e.target.style, modernFocusStyle)}
              onBlur={(e) => Object.assign(e.target.style, { borderColor: 'rgba(0, 200, 81, 0.2)', boxShadow: '0 3px 15px rgba(0, 200, 81, 0.08)', transform: 'none' })}
            >
              <option value="">Все животные</option>
              <option value="dog">🐕 Собаки</option>
              <option value="cat">🐱 Кошки</option>
            </select>

            <select
              value={selectedFeedCategory}
              onChange={(e) => setSelectedFeedCategory(e.target.value)}
              style={modernSelectStyle}
              onFocus={(e) => Object.assign(e.target.style, modernFocusStyle)}
              onBlur={(e) => Object.assign(e.target.style, { borderColor: 'rgba(0, 200, 81, 0.2)', boxShadow: '0 3px 15px rgba(0, 200, 81, 0.08)', transform: 'none' })}
            >
              <option value="">Все категории корма</option>
              {(
                (uniqueFeedCategories && uniqueFeedCategories.length > 0)
                  ? uniqueFeedCategories
                  : ['полнорационный','дополнительный','терапевтический']
              ).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={modernSelectStyle}
              onFocus={(e) => Object.assign(e.target.style, modernFocusStyle)}
              onBlur={(e) => Object.assign(e.target.style, { borderColor: 'rgba(0, 200, 81, 0.2)', boxShadow: '0 3px 15px rgba(0, 200, 81, 0.08)', transform: 'none' })}
            >
              <option value="">Все категории</option>
              
              {/* Категории для щенков */}
              <optgroup label="🐶 Для щенков">
                <option value="puppy_small">Щенки мелких пород</option>
                <option value="puppy_medium">Щенки средних пород</option>
                <option value="puppy_large">Щенки крупных пород</option>
                <option value="puppy_all">Щенки всех пород</option>
              </optgroup>
              
              {/* Категории для котят */}
              <optgroup label="🐱 Для котят">
                <option value="kitten">Котята</option>
                <option value="kitten_mother">Котята и кормящие кошки</option>
              </optgroup>
              
              {/* Категории для взрослых */}
              <optgroup label="🦮 Для взрослых собак">
                <option value="adult_small">Взрослые мелких пород</option>
                <option value="adult_medium">Взрослые средних пород</option>
                <option value="adult_large">Взрослые крупных пород</option>
                <option value="adult_all">Взрослые всех пород</option>
                <option value="active">Активные собаки</option>
                <option value="working">Рабочие собаки</option>
              </optgroup>
              
              <optgroup label="🐈 Для взрослых кошек">
                <option value="adult_cat">Взрослые кошки</option>
                <option value="indoor_cat">Домашние кошки</option>
                <option value="outdoor_cat">Уличные кошки</option>
              </optgroup>
              
              {/* Категории для пожилых */}
              <optgroup label="👴 Для пожилых">
                <option value="senior_dog">Пожилые собаки</option>
                <option value="senior_cat">Пожилые кошки</option>
              </optgroup>
              
              {/* Специализированные диеты */}
              <optgroup label="⚕️ Диетические (базовые)">
                <option value="weight_loss">Снижение веса</option>
                <option value="sensitive_digestion">Чувствительное пищеварение</option>
                <option value="skin_coat">Здоровье кожи и шерсти</option>
              </optgroup>
              
              {/* Профессиональные диеты (будут скрыты для обычных пользователей) */}
              <optgroup label="🏥 Лечебные диеты (PRO)" style={{ color: '#999', fontStyle: 'italic' }}>
                <option value="renal" disabled>Почечные диеты</option>
                <option value="hepatic" disabled>Печеночные диеты</option>
                <option value="cardiac" disabled>Кардиологические</option>
                <option value="diabetic" disabled>Диабетические</option>
                <option value="gastrointestinal" disabled>Желудочно-кишечные</option>
                <option value="urinary" disabled>Урологические</option>
                <option value="hypoallergenic" disabled>Гипоаллергенные</option>
              </optgroup>
            </select>
          </div>

          {/* Кнопка добавления */}
          <button
            onClick={() => setShowAddForm(true)}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #00C851 0%, #33B5E5 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'transform 0.3s ease',
              boxShadow: '0 4px 16px rgba(0, 200, 81, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            ➕ Добавить корм
          </button>
        </div>
      </div>

      {/* Статистика */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        marginBottom: '25px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #00C851 0%, #33B5E5 100%)',
          color: 'white',
          padding: '20px',
          borderRadius: '15px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '700' }}>{filteredFeeds.length}</div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>Всего кормов</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
          color: 'white',
          padding: '20px',
          borderRadius: '15px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '700' }}>{uniqueBrands.length}</div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>Брендов</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '20px',
          borderRadius: '15px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '700' }}>
            {filteredFeeds.filter(f => f.animal_type === 'dog').length}
          </div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>Для собак</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: 'white',
          padding: '20px',
          borderRadius: '15px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '700' }}>
            {filteredFeeds.filter(f => f.animal_type === 'cat').length}
          </div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>Для кошек</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          color: 'white',
          padding: '20px',
          borderRadius: '15px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '700' }}>
            {filteredFeeds.filter(f => f.type === 'dry').length}
          </div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>Сухих кормов</div>
        </div>
      </div>

            {/* Дополнительные фильтры убраны: всё в верхней панели */}


      {/* --- ТАБЛИЦА КОРМОВ --- */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '15px',
        overflow: 'hidden',
        border: '2px solid rgba(0, 200, 81, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 200, 81, 0.1)'
      }}>
        <div style={{
          overflowX: 'auto'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '14px'
          }}>
            <thead style={{ background: 'linear-gradient(135deg, #00C851 0%, #33B5E5 100%)', color: 'white' }}>
              <tr>
                <th style={{ padding: '15px 10px', textAlign: 'center', fontWeight: '600' }}>
                  <input
                    type="checkbox"
                    checked={selectedFeeds.length === currentFeeds.length && currentFeeds.length > 0}
                    onChange={handleSelectAll}
                    style={{ transform: 'scale(1.2)', cursor: 'pointer' }}
                  />
                </th>
                <th style={{ padding: '15px 10px', textAlign: 'left', fontWeight: '600' }}>Название</th>
                <th style={{ padding: '15px 10px', textAlign: 'center', fontWeight: '600' }}>Бренд</th>
                <th style={{ padding: '15px 10px', textAlign: 'center', fontWeight: '600' }}>Тип</th>
                <th style={{ padding: '15px 10px', textAlign: 'center', fontWeight: '600' }}>Вид<br/>животного</th>
                <th style={{ padding: '15px 10px', textAlign: 'center', fontWeight: '600' }}>Категория</th>
                <th style={{ padding: '15px 10px', textAlign: 'center', fontWeight: '600' }}>МЭ<br/>ккал/кг</th>
                <th style={{ padding: '15px 10px', textAlign: 'center', fontWeight: '600' }}>Белок<br/>%</th>
                <th style={{ padding: '15px 10px', textAlign: 'center', fontWeight: '600' }}>Жир<br/>%</th>
                <th style={{ padding: '15px 10px', textAlign: 'center', fontWeight: '600' }}>Клетчатка<br/>%</th>
                <th style={{ padding: '15px 10px', textAlign: 'center', fontWeight: '600' }}>Зола<br/>%</th>
                <th style={{ padding: '15px 10px', textAlign: 'center', fontWeight: '600' }}>Состав</th>
              </tr>
            </thead>
            <tbody>
              {currentFeeds.map((feed, index) => (
                <tr
                  key={feed.id}
                  style={{
                    background: index % 2 === 0 ? '#f8f9fa' : 'white',
                    borderBottom: '1px solid rgba(0, 200, 81, 0.1)',
                    transition: 'background-color 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 200, 81, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#f8f9fa' : 'white';
                  }}
                >
                  <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={selectedFeeds.includes(feed.id)}
                      onChange={() => handleFeedSelect(feed.id)}
                      style={{ transform: 'scale(1.2)', cursor: 'pointer' }}
                    />
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <div style={{ fontWeight: '600', color: '#2d3748' }}>{feed.name}</div>
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                      {feed.animal_type}
                    </div>
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'center' }}>{feed.brand}</td>
                  <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                    <span style={{
                      background: feed.type === 'dry' ? 'rgba(244, 67, 54, 0.1)' : feed.type === 'wet' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                      color: feed.type === 'dry' ? '#d32f2f' : feed.type === 'wet' ? '#388e3c' : '#fff',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {feed.type}
                    </span>
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'center' }}>{feed.animal_type}</td>
                  <td style={{ padding: '12px 10px', textAlign: 'center' }}>{feed.category}</td>
                  <td style={{ padding: '12px 10px', textAlign: 'center', fontWeight: '600' }}>
                    {feed.metabolic_energy}
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'center' }}>{feed.protein}</td>
                  <td style={{ padding: '12px 10px', textAlign: 'center' }}>{feed.fat}</td>
                  <td style={{ padding: '12px 10px', textAlign: 'center' }}>{feed.fiber}</td>
                  <td style={{ padding: '12px 10px', textAlign: 'center' }}>{feed.ash}</td>
                  <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                      <button
                      onClick={() => showIngredients(feed.ingredients)}
                        style={{
                        padding: '8px 12px',
                          background: 'rgba(33, 150, 243, 0.1)',
                          color: '#1976d2',
                          border: '1px solid rgba(33, 150, 243, 0.2)',
                        borderRadius: '8px',
                        fontSize: '16px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(33, 150, 243, 0.2)';
                        e.currentTarget.style.transform = 'scale(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(33, 150, 243, 0.1)';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      ℹ️
                      </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Пагинация */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: '20px',
          gap: '10px'
        }}>
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            style={{
              padding: '8px 15px',
              background: 'linear-gradient(135deg, #00C851 0%, #33B5E5 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0, 200, 81, 0.2)'
            }}
          >
            ←
          </button>
          <span style={{ fontSize: '16px', fontWeight: '600', color: '#2d3748' }}>
            Страница {currentPage} из {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            style={{
              padding: '8px 15px',
              background: 'linear-gradient(135deg, #00C851 0%, #33B5E5 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0, 200, 81, 0.2)'
            }}
          >
            →
          </button>
        </div>
      )}

      {/* --- ФОРМА ДОБАВЛЕНИЯ КОРМА --- */}
      {showAddForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '30px',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2 style={{
              color: '#2d3748',
              marginBottom: '25px',
              textAlign: 'center',
              fontSize: '1.8rem',
              fontWeight: '700'
            }}>
              ➕ Добавить новый корм
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
              marginBottom: '20px'
            }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2d3748' }}>
                  Название корма
                </label>
                <input
                  type="text"
                  value={newFeed.name}
                  onChange={(e) => setNewFeed({...newFeed, name: e.target.value})}
                  style={modernFieldStyle}
                  onFocus={(e) => Object.assign(e.target.style, modernFocusStyle)}
                  onBlur={(e) => Object.assign(e.target.style, { borderColor: 'rgba(0, 200, 81, 0.2)', boxShadow: '0 3px 15px rgba(0, 200, 81, 0.08)', transform: 'none' })}
                  placeholder="Название корма"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2d3748' }}>
                  Бренд
                </label>
                <input
                  type="text"
                  value={newFeed.brand}
                  onChange={(e) => setNewFeed({...newFeed, brand: e.target.value})}
                  style={modernFieldStyle}
                  onFocus={(e) => Object.assign(e.target.style, modernFocusStyle)}
                  onBlur={(e) => Object.assign(e.target.style, { borderColor: 'rgba(0, 200, 81, 0.2)', boxShadow: '0 3px 15px rgba(0, 200, 81, 0.08)', transform: 'none' })}
                  placeholder="Бренд"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2d3748' }}>
                  Тип корма
                </label>
                <select
                  value={newFeed.type}
                  onChange={(e) => setNewFeed({...newFeed, type: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid rgba(0, 200, 81, 0.2)',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                >
                  <option value="dry">Сухой</option>
                  <option value="wet">Влажный</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2d3748' }}>
                  Вид животного
                </label>
                <select
                  value={newFeed.animal_type}
                  onChange={(e) => setNewFeed({...newFeed, animal_type: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid rgba(0, 200, 81, 0.2)',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                >
                  <option value="dog">Собака</option>
                  <option value="cat">Кошка</option>
                  <option value="other">Другой</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2d3748' }}>
                  Категория
                </label>
                <select
                  value={newFeed.category}
                  onChange={(e) => setNewFeed({...newFeed, category: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid rgba(0, 200, 81, 0.2)',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                >
                  <option value="puppy">Щенки/Котята</option>
                  <option value="adult">Взрослые</option>
                  <option value="senior">Пожилые</option>
                  <option value="weight">Снижение веса</option>
                  <option value="diet">Диетические</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2d3748' }}>
                  Белок (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newFeed.protein}
                  onChange={(e) => setNewFeed({...newFeed, protein: parseFloat(e.target.value)})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid rgba(0, 200, 81, 0.2)',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                  placeholder="24.0"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2d3748' }}>
                  Жир (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newFeed.fat}
                  onChange={(e) => setNewFeed({...newFeed, fat: parseFloat(e.target.value)})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid rgba(0, 200, 81, 0.2)',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                  placeholder="12.0"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2d3748' }}>
                  Клетчатка (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newFeed.fiber}
                  onChange={(e) => setNewFeed({...newFeed, fiber: parseFloat(e.target.value)})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid rgba(0, 200, 81, 0.2)',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                  placeholder="2.5"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2d3748' }}>
                  Зола (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newFeed.ash}
                  onChange={(e) => setNewFeed({...newFeed, ash: parseFloat(e.target.value)})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid rgba(0, 200, 81, 0.2)',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                  placeholder="1.0"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2d3748' }}>
                  Влажность (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newFeed.moisture}
                  onChange={(e) => setNewFeed({...newFeed, moisture: parseFloat(e.target.value)})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid rgba(0, 200, 81, 0.2)',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                  placeholder="10.0"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2d3748' }}>
                  Ингредиенты (состав)
                </label>
                <textarea
                  value={newFeed.ingredients}
                  onChange={e => setNewFeed({ ...newFeed, ingredients: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid rgba(0, 200, 81, 0.2)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    minHeight: '60px'
                  }}
                  placeholder="Опишите состав, например: курица, рис, кукуруза, витамины..."
                />
              </div>
              
              {/* Выбор формулы МЭ */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2d3748' }}>
                  Формула расчета МЭ
                </label>
                <select
                  value={meFormula}
                  onChange={(e) => setMeFormula(e.target.value as 'standard' | 'nrc')}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid rgba(0, 200, 81, 0.2)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: 'white'
                  }}
                >
                  <option value="standard">Стандартная (МЭ = 3.5×белок + 8.5×жир + 3.5×углеводы)</option>
                  <option value="nrc">NRC 2006 (модифицированная)</option>
                </select>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  Выберите формулу для автоматического расчета метаболизируемой энергии
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2d3748' }}>
                  Углеводы (%) <span style={{ color: '#00C851', fontSize: '12px' }}>рассчитано автоматически</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={isNaN(newFeed.carbohydrates) ? '' : newFeed.carbohydrates.toFixed(1)}
                  readOnly
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    border: '2px solid #e2e8f0', 
                    borderRadius: '8px', 
                    fontSize: '14px', 
                    background: '#f8f9fa',
                    color: '#666'
                  }}
                  placeholder="Рассчитывается автоматически"
                />
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  Формула: 100% - влажность% - белок% - жир% - клетчатка% - зола%
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2d3748' }}>
                  МЭ (ккал/кг) <span style={{ color: '#00C851', fontSize: '12px' }}>рассчитано автоматически</span>
                </label>
                <input
                  type="number"
                  value={isNaN(newFeed.metabolic_energy) ? '' : newFeed.metabolic_energy}
                  readOnly
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    border: '2px solid #e2e8f0', 
                    borderRadius: '8px', 
                    fontSize: '14px', 
                    background: '#f8f9fa',
                    color: '#666'
                  }}
                  placeholder="Рассчитывается автоматически"
                />
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  Рассчитывается по выбранной формуле на основе БЖУ
                </div>
              </div>
            </div>

            {/* Важное предупреждение о единицах измерения */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 152, 0, 0.1) 100%)',
              border: '2px solid rgba(255, 193, 7, 0.3)',
              borderRadius: '12px',
              padding: '15px',
              marginBottom: '20px'
            }}>
              <h4 style={{ color: '#2d3748', fontSize: '14px', fontWeight: '700', marginBottom: '8px' }}>
                ⚠️ Важно! Единицы измерения
              </h4>
              <p style={{ color: '#666', fontSize: '13px', margin: 0, lineHeight: '1.5' }}>
                <strong>Все значения указываются на 100 г продукта.</strong><br/>
                Обратите внимание: производители часто указывают минеральные добавки на 1 кг корма. 
                Не забудьте пересчитать эти значения на 100 г (разделить на 10).
              </p>
            </div>

            <div style={{
              display: 'flex',
              gap: '15px',
              justifyContent: 'center',
              marginTop: '30px'
            }}>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  resetNewFeed();
                }}
                style={{
                  padding: '12px 24px',
                  background: 'rgba(108, 117, 125, 0.1)',
                  color: '#6c757d',
                  border: '2px solid rgba(108, 117, 125, 0.2)',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Отмена
              </button>

              <button
                onClick={handleAddFeed}
                disabled={!newFeed.name || !newFeed.brand || !newFeed.metabolic_energy}
                style={{
                  padding: '12px 24px',
                  background: newFeed.name && newFeed.brand && newFeed.metabolic_energy 
                    ? 'linear-gradient(135deg, #00C851 0%, #33B5E5 100%)' 
                    : 'rgba(108, 117, 125, 0.2)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: newFeed.name && newFeed.brand && newFeed.metabolic_energy ? 'pointer' : 'not-allowed',
                  boxShadow: newFeed.name && newFeed.brand && newFeed.metabolic_energy 
                    ? '0 4px 16px rgba(0, 200, 81, 0.3)' 
                    : 'none'
                }}
              >
                ➕ Добавить корм
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно с ингредиентами */}
      {showIngredientsModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '30px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#2d3748',
                margin: 0
              }}>
                📝 Состав корма
              </h3>
              <button
                onClick={() => setShowIngredientsModal(false)}
                style={{
                  background: 'rgba(244, 67, 54, 0.1)',
                  color: '#d32f2f',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  fontSize: '20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>
            <div style={{
              background: 'rgba(0, 200, 81, 0.05)',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid rgba(0, 200, 81, 0.2)',
              fontSize: '16px',
              lineHeight: '1.6',
              color: '#2d3748'
            }}>
              {selectedFeedIngredients || 'Информация о составе не указана'}
            </div>
          </div>
        </div>
      )}

      {/* Блок с выбранными кормами */}
      {selectedFeeds.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(0, 200, 81, 0.1) 0%, rgba(51, 181, 229, 0.1) 100%)',
          border: '2px solid rgba(0, 200, 81, 0.2)',
          borderRadius: '15px',
          padding: '20px',
          marginTop: '20px'
        }}>
          <h3 style={{
            color: '#2d3748',
            fontSize: '18px',
            fontWeight: '700',
            marginBottom: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            ✅ Выбрано кормов для сравнения: {selectedFeeds.length}
          </h3>
          
          <div style={{
            display: 'flex',
            gap: '15px',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <div style={{ fontSize: '14px', color: '#666' }}>
              Выбранные корма готовы для анализа и сравнения
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  // Сохраняем выбранные корма для передачи в аналитику
                  const selectedFeedsData = feeds.filter(feed => selectedFeeds.includes(feed.id));
                  localStorage.setItem('selectedFeedsForComparison', JSON.stringify(selectedFeedsData));
                  localStorage.setItem('selectedFeedIds', JSON.stringify(selectedFeeds));
                  
                  // Переходим на страницу аналитики
                  window.location.href = '/comparisons';
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'linear-gradient(135deg, #00C851 0%, #33B5E5 100%)',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(0, 200, 81, 0.3)'
                }}
              >
                📊 Перейти к сравнению
              </button>
              
              <button
                onClick={() => setSelectedFeeds([])}
                style={{
                  background: 'rgba(244, 67, 54, 0.1)',
                  color: '#d32f2f',
                  border: '1px solid rgba(244, 67, 54, 0.2)',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '600',
                  padding: '10px 20px',
                  cursor: 'pointer'
                }}
              >
                🗑️ Очистить выбор
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feeds; 