import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Интерфейс для данных животного из калькулятора
interface AnimalData {
  name: string;
  age: number;
  weight: number;
  energyNeed: number;
  species: string;
  breed: string;
  owner: string;
  lastUpdated: string;
}

// 🔥 ПРИНУДИТЕЛЬНОЕ ОБНОВЛЕНИЕ 29.07.2025 22:35 - ФИНАЛЬНАЯ ВЕРСИЯ!
// ОБЯЗАТЕЛЬНО ДОЛЖНА ПОКАЗЫВАТЬ СТРАНИЦУ ПОДПИСКИ ДЛЯ НЕАВТОРИЗОВАННЫХ!
const Animals: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [animalData, setAnimalData] = useState<AnimalData | null>(null);

  console.log('🔥 НОВАЯ ВЕРСИЯ! Animals.tsx: isAuthenticated =', isAuthenticated); // ДЕБАГ
  console.log('🔥 Время:', new Date().toLocaleTimeString()); // ДЕБАГ
  console.log('🔥 ТЕСТ ОБНОВЛЕНИЯ:', Math.random()); // УНИКАЛЬНЫЙ ТЕСТ

  // ПРИНУДИТЕЛЬНОЕ ТЕСТОВОЕ СООБЩЕНИЕ
  if (window.location.pathname === '/animals') {
    console.log('🚨 ВНИМАНИЕ! Загружается Animals.tsx - НОВАЯ ВЕРСИЯ 22:35!');
  }

  // Загружаем данные животного из localStorage
  useEffect(() => {
    if (isAuthenticated) {
      try {
        const savedData = localStorage.getItem('animalData');
        if (savedData) {
          const parsed = JSON.parse(savedData);
          setAnimalData(parsed);
          console.log('🐕 Данные животного загружены:', parsed);
        } else {
          console.log('📭 Данные животного не найдены в калькуляторе');
        }
      } catch (error) {
        console.error('❌ Ошибка загрузки данных животного:', error);
      }
    }
  }, [isAuthenticated]);

  // Если пользователь НЕ авторизован - показываем страницу подписки
  if (!isAuthenticated) {
    console.log('🔒 ПОКАЗЫВАЕМ СТРАНИЦУ ПОДПИСКИ - НОВАЯ ВЕРСИЯ!'); // ДЕБАГ
    return (
      <div style={{
        padding: '40px 20px',
        textAlign: 'center',
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #e8f8f5 0%, #d1f2eb 100%)'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '60px 50px',
          borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
          maxWidth: '700px',
          width: '100%',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          backdropFilter: 'blur(10px)'
        }}>
          {/* Замок */}
          <div style={{
            fontSize: '5rem',
            marginBottom: '40px',
            color: '#FF8F00'
          }}>
            🔒
          </div>
          
          <h1 style={{
            fontSize: '2.4rem',
            fontWeight: '800',
            color: '#2d3748',
            marginBottom: '20px',
            lineHeight: '1.2'
          }}>
            Раздел доступен только по активной подписке
          </h1>
          
          <p style={{
            fontSize: '1.1rem',
            color: '#718096',
            fontWeight: '400',
            lineHeight: '1.6',
            marginBottom: '40px',
            maxWidth: '500px',
            margin: '0 auto 40px auto'
          }}>
            Авторизуйтесь и активируйте подписку для перехода к калькулятору
          </p>
          
          <Link 
            to="/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              padding: '18px 40px',
              background: 'linear-gradient(135deg, #00C851 0%, #33B5E5 100%)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '14px',
              fontSize: '18px',
              fontWeight: '700',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 25px rgba(0, 200, 81, 0.25)',
              border: 'none',
              cursor: 'pointer',
              minWidth: '250px'
            }}
          >
            Оформить подписку
          </Link>
        </div>
      </div>
    );
  }

  console.log('✅ Показываем полную версию для авторизованных!'); // ДЕБАГ

  // Если пользователь АВТОРИЗОВАН - показываем полнофункциональную базу данных пациентов
  return (
    <div style={{
      padding: '20px',
      maxWidth: '1400px',
      margin: '0 auto',
      minHeight: '60vh'
    }}>
      {/* Заголовок для авторизованных */}
      <div style={{
        textAlign: 'center',
        marginBottom: '40px',
        background: 'linear-gradient(135deg, rgba(0, 200, 81, 0.05) 0%, rgba(51, 181, 229, 0.05) 100%)',
        padding: '30px',
        borderRadius: '20px',
        border: '2px solid rgba(0, 200, 81, 0.1)'
      }}>
        <h1 style={{
          fontSize: '2.8rem',
          fontWeight: '800',
          color: '#2d3748',
          marginBottom: '15px',
          background: 'linear-gradient(135deg, #00C851 0%, #33B5E5 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          🏥 База данных пациентов
        </h1>
        <p style={{
          color: '#666',
          fontSize: '1.2rem',
          marginBottom: '15px'
        }}>
          Добро пожаловать, {user?.clinic_name || 'Доктор'}! Управляйте картами ваших пациентов
        </p>
        <div style={{
          display: 'inline-block',
          background: 'linear-gradient(135deg, #00C851 0%, #33B5E5 100%)',
          color: 'white',
          padding: '8px 20px',
          borderRadius: '20px',
          fontSize: '14px',
          fontWeight: '600'
        }}>
          ✅ ПРО-АККАУНТ АКТИВЕН
        </div>
      </div>

      {/* Блок с данными животного из калькулятора */}
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '30px',
        marginBottom: '30px',
        border: '2px solid rgba(0, 200, 81, 0.1)',
        boxShadow: '0 10px 40px rgba(0, 200, 81, 0.05)'
      }}>
        <h2 style={{
          fontSize: '1.8rem',
          fontWeight: '700',
          color: '#2d3748',
          marginBottom: '25px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          🐕 Данные из калькулятора
        </h2>

        {animalData ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : 'repeat(2, 1fr)',
            gap: '20px'
          }}>
            {/* Левая колонка - основные данные */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(0, 200, 81, 0.05) 0%, rgba(51, 181, 229, 0.05) 100%)',
              padding: '25px',
              borderRadius: '15px',
              border: '1px solid rgba(0, 200, 81, 0.1)'
            }}>
              <h3 style={{
                fontSize: '1.3rem',
                fontWeight: '600',
                color: '#2d3748',
                marginBottom: '20px'
              }}>
                📋 Основная информация
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#666', fontWeight: '500' }}>🏷️ Кличка:</span>
                  <span style={{ fontWeight: '600', color: '#2d3748' }}>{animalData.name || 'Не указана'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#666', fontWeight: '500' }}>🐾 Вид:</span>
                  <span style={{ fontWeight: '600', color: '#2d3748' }}>{animalData.species}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#666', fontWeight: '500' }}>🎂 Возраст:</span>
                  <span style={{ fontWeight: '600', color: '#2d3748' }}>{animalData.age} лет</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#666', fontWeight: '500' }}>⚖️ Вес:</span>
                  <span style={{ fontWeight: '600', color: '#2d3748' }}>{animalData.weight} кг</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#666', fontWeight: '500' }}>👤 Владелец:</span>
                  <span style={{ fontWeight: '600', color: '#2d3748' }}>{animalData.owner || 'Не указан'}</span>
                </div>
              </div>
            </div>

            {/* Правая колонка - энергетические потребности */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.05) 0%, rgba(247, 147, 30, 0.05) 100%)',
              padding: '25px',
              borderRadius: '15px',
              border: '1px solid rgba(255, 107, 53, 0.1)'
            }}>
              <h3 style={{
                fontSize: '1.3rem',
                fontWeight: '600',
                color: '#2d3748',
                marginBottom: '20px'
              }}>
                ⚡ Энергетические потребности
              </h3>
              <div style={{
                textAlign: 'center',
                padding: '20px',
                background: 'rgba(255, 107, 53, 0.1)',
                borderRadius: '10px'
              }}>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: '800',
                  color: '#FF6B35',
                  marginBottom: '10px'
                }}>
                  {Math.round(animalData.energyNeed)} ккал/день
                </div>
                <div style={{
                  color: '#666',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  Расчетная потребность в энергии
                </div>
              </div>
              <div style={{
                marginTop: '15px',
                fontSize: '12px',
                color: '#888',
                textAlign: 'center'
              }}>
                📅 Рассчитано: {new Date(animalData.lastUpdated).toLocaleDateString('ru-RU')}
              </div>
              <Link 
                to="/calculator" 
                style={{
                  display: 'block',
                  marginTop: '15px',
                  padding: '10px',
                  background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  textAlign: 'center',
                  transition: 'all 0.3s ease'
                }}
              >
                🔄 Пересчитать в калькуляторе
              </Link>
            </div>
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            background: 'rgba(102, 126, 234, 0.05)',
            borderRadius: '15px',
            border: '1px solid rgba(102, 126, 234, 0.1)'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🧮</div>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#2d3748',
              marginBottom: '10px'
            }}>
              Данные о животном не введены
            </h3>
            <p style={{
              color: '#666',
              marginBottom: '25px'
            }}>
              Воспользуйтесь калькулятором для расчета потребности в энергии
            </p>
            <Link 
              to="/calculator" 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '15px 25px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.2)',
                transition: 'all 0.3s ease'
              }}
            >
              🧮 Перейти к калькулятору
            </Link>
          </div>
        )}
      </div>

      {/* Панель управления */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : 'repeat(4, 1fr)',
        gap: '20px',
        marginBottom: '40px'
      }}>
        {[
          { icon: '👥', title: 'Всего пациентов', value: '127', color: '#00C851' },
          { icon: '📋', title: 'Активных карт', value: '98', color: '#33B5E5' },
          { icon: '🔥', title: 'Расчетов за месяц', value: '245', color: '#FF6B35' },
          { icon: '⭐', title: 'Рейтинг клиники', value: '4.9', color: '#FFC107' }
        ].map((stat, index) => (
          <div key={index} style={{
            background: 'white',
            padding: '25px',
            borderRadius: '18px',
            textAlign: 'center',
            border: `2px solid ${stat.color}20`,
            boxShadow: `0 8px 25px ${stat.color}15`,
            transition: 'all 0.3s ease'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>{stat.icon}</div>
            <div style={{
              fontSize: '2rem',
              fontWeight: '800',
              color: stat.color,
              marginBottom: '5px'
            }}>
              {stat.value}
            </div>
            <div style={{
              color: '#666',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              {stat.title}
            </div>
          </div>
        ))}
      </div>

      {/* Действия */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : 'repeat(3, 1fr)',
        gap: '20px',
        marginBottom: '40px'
      }}>
        <button style={{
          background: 'linear-gradient(135deg, #00C851 0%, #33B5E5 100%)',
          color: 'white',
          border: 'none',
          padding: '20px',
          borderRadius: '15px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 8px 25px rgba(0, 200, 81, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px'
        }}>
          <span style={{ fontSize: '1.5rem' }}>➕</span>
          Добавить пациента
        </button>

        <button style={{
          background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
          color: 'white',
          border: 'none',
          padding: '20px',
          borderRadius: '15px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 8px 25px rgba(255, 107, 53, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px'
        }}>
          <span style={{ fontSize: '1.5rem' }}>🔍</span>
          Поиск пациентов
        </button>

        <button style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          padding: '20px',
          borderRadius: '15px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 8px 25px rgba(102, 126, 234, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px'
        }}>
          <span style={{ fontSize: '1.5rem' }}>📊</span>
          Отчеты и аналитика
        </button>
      </div>

      {/* Список последних пациентов */}
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '30px',
        border: '2px solid rgba(0, 200, 81, 0.1)',
        boxShadow: '0 10px 40px rgba(0, 200, 81, 0.05)'
      }}>
        <h2 style={{
          fontSize: '1.8rem',
          fontWeight: '700',
          color: '#2d3748',
          marginBottom: '25px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          📋 Последние пациенты
        </h2>

        {/* Заголовки таблицы */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 100px',
          gap: '15px',
          padding: '15px',
          background: 'linear-gradient(135deg, rgba(0, 200, 81, 0.05) 0%, rgba(51, 181, 229, 0.05) 100%)',
          borderRadius: '12px',
          marginBottom: '15px',
          fontSize: '14px',
          fontWeight: '600',
          color: '#2d3748'
        }}>
          <div>🏷️ Кличка</div>
          <div>🐕 Вид</div>
          <div>👤 Владелец</div>
          <div>📞 Контакт</div>
          <div>📅 Последний визит</div>
          <div>⚙️ Действия</div>
        </div>

        {/* Примеры пациентов */}
        {[
          { name: 'Барон', species: 'Собака', owner: 'Иванов А.И.', phone: '+7 (999) 123-45-67', lastVisit: '15.03.2024' },
          { name: 'Мурка', species: 'Кошка', owner: 'Петрова М.С.', phone: '+7 (999) 765-43-21', lastVisit: '14.03.2024' },
          { name: 'Рекс', species: 'Собака', owner: 'Сидорова К.В.', phone: '+7 (999) 111-22-33', lastVisit: '13.03.2024' }
        ].map((patient, index) => (
          <div key={index} style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 100px',
            gap: '15px',
            padding: '15px',
            background: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '12px',
            marginBottom: '10px',
            border: '1px solid rgba(0, 200, 81, 0.1)',
            fontSize: '14px',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ fontWeight: '600', color: '#2d3748' }}>{patient.name}</div>
            <div style={{ color: '#666' }}>{patient.species}</div>
            <div style={{ color: '#666' }}>{patient.owner}</div>
            <div style={{ color: '#666' }}>{patient.phone}</div>
            <div style={{ color: '#666' }}>{patient.lastVisit}</div>
            <div style={{
              display: 'flex',
              gap: '8px'
            }}>
              <button style={{
                background: '#00C851',
                color: 'white',
                border: 'none',
                padding: '6px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer'
              }}>
                👁️
              </button>
              <button style={{
                background: '#FF6B35',
                color: 'white',
                border: 'none',
                padding: '6px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer'
              }}>
                ✏️
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Ссылка на калькулятор */}
      <div style={{
        textAlign: 'center',
        marginTop: '40px',
        padding: '20px',
        background: 'linear-gradient(135deg, rgba(0, 200, 81, 0.05) 0%, rgba(51, 181, 229, 0.05) 100%)',
        borderRadius: '15px',
        border: '1px solid rgba(0, 200, 81, 0.1)'
      }}>
        <h4 style={{ color: '#2d3748', marginBottom: '10px' }}>
          💡 Нужен быстрый расчет питания?
        </h4>
        <Link 
          to="/calculator"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            background: 'linear-gradient(135deg, #00C851 0%, #33B5E5 100%)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'all 0.3s ease'
          }}
        >
          🧮 Использовать Калькулятор
        </Link>
      </div>
    </div>
  );
};

export default Animals; 