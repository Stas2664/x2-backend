import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import config from '../config';

const Dashboard: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState({
    feeds: 0,
    animals: 0,
    comparisons: 0,
    brands: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Всегда загружаем публичные корма
      const feedsRes = await fetch(`${config.API_BASE_URL}${config.API_ENDPOINTS.feeds}`);
      
      if (!feedsRes.ok) {
        throw new Error('Ошибка загрузки кормов');
      }
      
      const feeds = await feedsRes.json();
      const uniqueBrands = new Set(feeds.map((feed: any) => feed.brand));

      if (isAuthenticated) {
        // Для авторизованных пользователей загружаем все данные
        try {
          const token = localStorage.getItem('token');
          const requestOptions: RequestInit = token 
            ? { headers: { 'Authorization': `Bearer ${token}` } }
            : {};
          
          const [animalsRes, comparisonsRes] = await Promise.all([
            fetch(`${config.API_BASE_URL}${config.API_ENDPOINTS.animals}`, requestOptions),
            fetch(`${config.API_BASE_URL}${config.API_ENDPOINTS.calculations}`, requestOptions)
          ]);

          if (animalsRes.ok && comparisonsRes.ok) {
            const [animals, calculations] = await Promise.all([
              animalsRes.json(),
              comparisonsRes.json()
            ]);

            setStats({
              feeds: feeds.length,
              animals: animals.length,
              comparisons: calculations.length,
              brands: uniqueBrands.size
            });
          } else {
            setStats({
              feeds: feeds.length,
              animals: 0,
              comparisons: 0,
              brands: uniqueBrands.size
            });
          }
        } catch (authError) {
          console.error('Ошибка загрузки защищенных данных:', authError);
          setStats({
            feeds: feeds.length,
            animals: 0,
            comparisons: 0,
            brands: uniqueBrands.size
          });
        }
      } else {
        // Для неавторизованных пользователей показываем только публичные данные
        setStats({
          feeds: feeds.length,
          animals: 0,
          comparisons: 0,
          brands: uniqueBrands.size
        });
      }

    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
      setError('Не удалось загрузить данные');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '50px',
        fontSize: '18px'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>🐕</div>
        <div>Загружаем данные...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '50px',
        color: '#F44336',
        background: 'rgba(244, 67, 54, 0.1)',
        borderRadius: '16px',
        margin: '20px'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
        <h3>Ошибка загрузки</h3>
        <p>{error}</p>
        <button 
          onClick={fetchStats}
          style={{
            padding: '12px 24px',
            background: '#00C851',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: window.innerWidth <= 768 ? '10px' : '20px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {/* Hero секция */}
      <div style={{
        textAlign: 'center',
        marginBottom: '60px',
        padding: '40px 20px',
        background: 'linear-gradient(135deg, rgba(0, 200, 81, 0.1) 0%, rgba(51, 181, 229, 0.1) 100%)',
        borderRadius: '25px',
        border: '2px solid rgba(0, 200, 81, 0.1)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Декоративные элементы */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '200px',
          height: '200px',
          background: 'linear-gradient(135deg, rgba(0, 200, 81, 0.1) 0%, rgba(51, 181, 229, 0.1) 100%)',
          borderRadius: '50%',
          zIndex: 0
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-30px',
          left: '-30px',
          width: '150px',
          height: '150px',
          background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.1) 0%, rgba(247, 147, 30, 0.1) 100%)',
          borderRadius: '50%',
          zIndex: 0
        }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{
            fontSize: window.innerWidth <= 768 ? '2.5rem' : '3.5rem',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #00C851 0%, #33B5E5 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '20px',
            lineHeight: '1.2'
          }}>
            🐕 VetFormuLab
          </h1>
          <p style={{
            fontSize: window.innerWidth <= 768 ? '1.1rem' : '1.3rem',
            color: '#666',
            marginBottom: '30px',
            maxWidth: '600px',
            margin: '0 auto 30px auto'
          }}>
            Профессиональная платформа для расчёта питания животных и анализа кормов
          </p>
        </div>
      </div>

      {/* Секция с данными животного из Калькулятора */}
      {(() => {
        const savedAnimalData = localStorage.getItem('animalData');
        if (savedAnimalData) {
          try {
            const animalData = JSON.parse(savedAnimalData);
            // Проверяем что данные валидные и не тестовые (убираем "бобика")
            if (animalData && animalData.name && animalData.name.trim() !== '' && animalData.name !== 'бобик' && animalData.energyNeed > 0) {
              return (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(0, 200, 81, 0.05) 0%, rgba(51, 181, 229, 0.05) 100%)',
                  borderRadius: '20px',
                  padding: '25px',
                  marginBottom: '30px',
                  border: '2px solid rgba(0, 200, 81, 0.2)',
                  boxShadow: '0 10px 40px rgba(0, 200, 81, 0.1)'
                }}>
                  <h2 style={{
                    fontSize: '1.8rem',
                    fontWeight: '700',
                    marginBottom: '20px',
                    color: '#2d3748',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    🐾 Данные из Калькулятора
                  </h2>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '15px'
                  }}>
                    <div style={{
                      background: 'white',
                      padding: '20px',
                      borderRadius: '15px',
                      textAlign: 'center',
                      border: '1px solid rgba(0, 200, 81, 0.1)'
                    }}>
                      <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🏷️</div>
                      <div style={{ fontWeight: '600', color: '#2d3748', marginBottom: '5px' }}>Кличка</div>
                      <div style={{ color: '#666', fontSize: '1.1rem' }}>{animalData.name}</div>
                    </div>
                    
                    <div style={{
                      background: 'white',
                      padding: '20px',
                      borderRadius: '15px',
                      textAlign: 'center',
                      border: '1px solid rgba(0, 200, 81, 0.1)'
                    }}>
                      <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📅</div>
                      <div style={{ fontWeight: '600', color: '#2d3748', marginBottom: '5px' }}>Возраст</div>
                      <div style={{ color: '#666', fontSize: '1.1rem' }}>{animalData.age} лет</div>
                    </div>
                    
                    <div style={{
                      background: 'white',
                      padding: '20px',
                      borderRadius: '15px',
                      textAlign: 'center',
                      border: '1px solid rgba(0, 200, 81, 0.1)'
                    }}>
                      <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⚖️</div>
                      <div style={{ fontWeight: '600', color: '#2d3748', marginBottom: '5px' }}>Вес</div>
                      <div style={{ color: '#666', fontSize: '1.1rem' }}>{animalData.weight} кг</div>
                    </div>
                    
                    <div style={{
                      background: 'linear-gradient(135deg, #00C851 0%, #33B5E5 100%)',
                      color: 'white',
                      padding: '20px',
                      borderRadius: '15px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🔥</div>
                      <div style={{ fontWeight: '600', marginBottom: '5px' }}>Потребность в МЭ</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: '700' }}>{animalData.energyNeed.toFixed(1)} ккал/день</div>
                    </div>
                  </div>
                </div>
              );
            }
          } catch (error) {
            console.error('Ошибка парсинга данных животного из localStorage:', error);
            localStorage.removeItem('animalData'); // Очищаем поврежденные данные
          }
        }
        
        // Показываем сообщение если данных нет
        return (
          <div style={{
            background: 'rgba(255, 193, 7, 0.1)',
            borderRadius: '20px',
            padding: '25px',
            marginBottom: '30px',
            border: '2px solid rgba(255, 193, 7, 0.3)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🧮</div>
            <h3 style={{ 
              color: '#2d3748', 
              marginBottom: '10px',
              fontSize: '1.5rem',
              fontWeight: '600'
            }}>
              Данные о животном не введены
            </h3>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              Используйте Калькулятор для расчета потребности в энергии
            </p>
            <Link 
              to="/calculator"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #FFC107 0%, #FF9800 100%)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '10px',
                textDecoration: 'none',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
            >
              🧮 Перейти к Калькулятору
            </Link>
          </div>
        );
      })()}

      {/* Секция для владельцев питомцев */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.8)',
        borderRadius: '20px',
        padding: window.innerWidth <= 768 ? '20px' : '30px',
        marginBottom: '30px',
        border: '2px solid rgba(0, 200, 81, 0.1)',
        boxShadow: '0 10px 40px rgba(0, 200, 81, 0.1)',
        backdropFilter: 'blur(10px)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{
            fontSize: window.innerWidth <= 768 ? '1.8rem' : '2.2rem',
            fontWeight: '700',
            marginBottom: '15px',
            color: '#2d3748',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            justifyContent: 'center'
          }}>
            🏠 Для владельцев питомцев
            <span style={{
              background: 'linear-gradient(135deg, #00C851 0%, #33B5E5 100%)',
              color: 'white',
              padding: '6px 16px',
              borderRadius: '25px',
              fontSize: '14px',
              fontWeight: '700'
            }}>
              БЕСПЛАТНО
            </span>
          </h2>

          <p style={{
            textAlign: 'center',
            color: '#666',
            fontSize: '1.1rem',
            marginBottom: '30px',
            maxWidth: '600px',
            margin: '0 auto 30px auto'
          }}>
            Рассчитайте потребность в энергии для вашего питомца и сравните обычные коммерческие корма
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : 'repeat(3, 1fr)',
            gap: '25px'
          }}>
            {[
              {
                icon: '🧮',
                title: 'Калькулятор питания',
                description: 'Рассчитайте суточную потребность в метаболизируемой энергии для вашего питомца',
                link: '/calculator',
                gradient: 'linear-gradient(135deg, #00C851 0%, #33B5E5 100%)'
              },
              {
                icon: '📊',
                title: 'Сравнение кормов',
                description: 'Сравните до 5 обычных кормов по составу и питательности',
                link: '/comparisons',
                gradient: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)'
              },
              {
                icon: '🍖',
                title: 'База кормов',
                description: 'Просматривайте состав и характеристики коммерческих кормов',
                link: '/feeds',
                gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }
            ].map((feature, index) => (
              <Link
                key={index}
                to={feature.link}
                style={{
                  textDecoration: 'none',
                  background: 'white',
                  borderRadius: '18px',
                  padding: '30px 25px',
                  border: '2px solid rgba(0, 200, 81, 0.1)',
                  transition: 'all 0.3s ease',
                  display: 'block',
                  position: 'relative',
                  overflow: 'hidden',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 20px 50px rgba(0, 200, 81, 0.2)';
                  e.currentTarget.style.borderColor = 'rgba(0, 200, 81, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = 'rgba(0, 200, 81, 0.1)';
                }}
              >
                <div style={{
                  fontSize: '3rem',
                  marginBottom: '20px'
                }}>
                  {feature.icon}
                </div>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: '700',
                  marginBottom: '15px',
                  color: '#2d3748'
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  color: '#666',
                  fontSize: '15px',
                  lineHeight: '1.6',
                  margin: 0
                }}>
                  {feature.description}
                </p>
                
                {/* Декоративная полоска */}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '5px',
                  background: feature.gradient
                }} />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Секция для профессионалов */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.8)',
        borderRadius: '20px',
        padding: window.innerWidth <= 768 ? '20px' : '30px',
        border: '2px solid rgba(255, 193, 7, 0.3)',
        boxShadow: '0 10px 40px rgba(255, 193, 7, 0.1)',
        backdropFilter: 'blur(10px)',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: '40px'
      }}>
        {/* Декоративный элемент */}
        <div style={{
          position: 'absolute',
          top: '-30px',
          right: '-30px',
          width: '120px',
          height: '120px',
          background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 152, 0, 0.1) 100%)',
          borderRadius: '50%',
          zIndex: 0
        }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{
            fontSize: window.innerWidth <= 768 ? '1.6rem' : '2rem',
            fontWeight: '700',
            marginBottom: '15px',
            color: '#2d3748',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            justifyContent: 'center'
          }}>
            👨‍⚕️ Для ветеринарных врачей и диетологов
            <span style={{
              background: 'linear-gradient(135deg, #FFC107 0%, #FF9800 100%)',
              color: 'white',
              padding: '6px 16px',
              borderRadius: '25px',
              fontSize: '14px',
              fontWeight: '700'
            }}>
              ПО ПОДПИСКЕ
            </span>
          </h2>

          <p style={{
            textAlign: 'center',
            color: '#666',
            fontSize: '1.1rem',
            marginBottom: '30px',
            maxWidth: '700px',
            margin: '0 auto 30px auto'
          }}>
            Полный доступ к диетическим кормам, расширенной аналитике и профессиональным инструментам
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : 'repeat(2, 1fr)',
            gap: '25px',
            marginBottom: '30px'
          }}>
            {[
              {
                icon: '🏥',
                title: 'Диетические корма',
                description: 'Доступ к базе лечебных и диетических кормов для различных заболеваний',
                features: ['Корма для ЖКТ', 'Почечные диеты', 'Кардиологические', 'Диабетические']
              },
              {
                icon: '📈',
                title: 'Расширенная аналитика',
                description: 'Профессиональные инструменты анализа и сравнения кормов',
                features: ['Анализ по 40+ параметрам', 'Соответствие FEDIAF', 'Экспорт отчётов', 'История расчётов']
              },
              {
                icon: '🔬',
                title: 'Диагностические инструменты',
                description: 'Специализированные расчёты с учётом заболеваний и особых потребностей',
                features: ['Учёт диагнозов', 'Непереносимости', 'Индивидуальные формулы', 'Мониторинг']
              },
              {
                icon: '👥',
                title: 'Управление пациентами',
                description: 'Ведение базы пациентов и истории назначений',
                features: ['База пациентов', 'История назначений', 'Напоминания', 'Отчёты для владельцев']
              }
            ].map((feature, index) => (
              <div
                key={index}
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.05) 0%, rgba(255, 152, 0, 0.05) 100%)',
                  borderRadius: '18px',
                  padding: '30px 25px',
                  border: '2px solid rgba(255, 193, 7, 0.2)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{
                  fontSize: '3rem',
                  marginBottom: '20px',
                  textAlign: 'center'
                }}>
                  {feature.icon}
                </div>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: '700',
                  marginBottom: '15px',
                  color: '#2d3748',
                  textAlign: 'center'
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  color: '#666',
                  fontSize: '15px',
                  lineHeight: '1.6',
                  marginBottom: '20px',
                  textAlign: 'center'
                }}>
                  {feature.description}
                </p>
                
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0
                }}>
                  {feature.features.map((item, idx) => (
                    <li key={idx} style={{
                      color: '#2d3748',
                      fontSize: '14px',
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span style={{ color: '#00C851', fontWeight: 'bold' }}>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div style={{
            textAlign: 'center',
            padding: '30px',
            background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 152, 0, 0.1) 100%)',
            borderRadius: '15px',
            border: '2px solid rgba(255, 193, 7, 0.2)'
          }}>
            <h3 style={{
              color: '#2d3748',
              fontSize: '1.4rem',
              fontWeight: '700',
              marginBottom: '15px'
            }}>
              🚀 Скоро запуск профессиональной версии!
            </h3>
            <p style={{
              color: '#666',
              fontSize: '1.1rem',
              marginBottom: '20px'
            }}>
              Оставьте заявку на раннее подключение и получите скидку 50% на первый месяц
            </p>
            <button style={{
              background: 'linear-gradient(135deg, #FFC107 0%, #FF9800 100%)',
              color: 'white',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '25px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 25px rgba(255, 193, 7, 0.3)'
            }}>
              📧 Оставить заявку
            </button>
          </div>
        </div>
      </div>

      {/* Баннер для неавторизованных пользователей */}
      {!isAuthenticated && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 143, 0, 0.1) 0%, rgba(255, 193, 7, 0.1) 100%)',
          border: '1px solid rgba(255, 143, 0, 0.3)',
          borderRadius: '20px',
          padding: '30px',
          marginBottom: '40px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '40px', marginBottom: '15px' }}>🔑</div>
          
          <h3 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#FF8F00',
            marginBottom: '12px'
          }}>
            Получите больше возможностей!
          </h3>
          
          <p style={{
            fontSize: '16px',
            color: '#666',
            marginBottom: '20px',
            maxWidth: '500px',
            margin: '0 auto 20px auto'
          }}>
            Зарегистрируйтесь в системе для сохранения истории расчетов, 
            создания профилей животных и доступа к расширенной аналитике.
          </p>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '15px',
            flexWrap: 'wrap'
          }}>
            <Link 
              to="/register"
              style={{
                background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '25px',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(255, 143, 0, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 143, 0, 0.4)';
                e.currentTarget.style.background = 'linear-gradient(135deg, #e74c3c 0%, #FF6B35 100%)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 143, 0, 0.3)';
                e.currentTarget.style.background = 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)';
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px) scale(1.02)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)';
              }}
            >
              🚀 Создать аккаунт
            </Link>
            
            <Link 
              to="/login"
              style={{
                background: 'rgba(255, 143, 0, 0.1)',
                color: '#FF8F00',
                border: '2px solid rgba(255, 143, 0, 0.3)',
                padding: '10px 24px',
                borderRadius: '25px',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 143, 0, 0.2)';
                e.currentTarget.style.background = 'rgba(255, 143, 0, 0.2)';
                e.currentTarget.style.border = '2px solid rgba(255, 143, 0, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.background = 'rgba(255, 143, 0, 0.1)';
                e.currentTarget.style.border = '2px solid rgba(255, 143, 0, 0.3)';
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px) scale(1.02)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)';
              }}
            >
              🔓 Уже есть аккаунт
            </Link>
          </div>
        </div>
      )}

      {/* Статистические карточки */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: window.innerWidth <= 768 ? '16px' : '24px',
        marginBottom: window.innerWidth <= 768 ? '30px' : '40px'
      }}>
        {/* Карточка кормов */}
        <div 
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            padding: '30px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            border: '1px solid rgba(0, 200, 81, 0.2)',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
            e.currentTarget.style.boxShadow = '0 16px 48px rgba(0, 200, 81, 0.15)';
            e.currentTarget.style.border = '1px solid rgba(0, 200, 81, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)';
            e.currentTarget.style.border = '1px solid rgba(0, 200, 81, 0.2)';
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ 
                color: '#666', 
                fontSize: '14px', 
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '8px'
              }}>
                ВСЕГО КОРМОВ
              </h3>
              <div style={{ 
                fontSize: '36px', 
                fontWeight: '800', 
                color: '#00C851',
                marginBottom: '8px'
              }}>
                {stats.feeds}
              </div>
              <div style={{ 
                color: '#00C851', 
                fontSize: '14px',
                fontWeight: '600'
              }}>
                📈 +12% за месяц
              </div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #00C851 0%, #007E33 100%)',
              borderRadius: '16px',
              padding: '12px',
              fontSize: '24px'
            }}>
              🍖
            </div>
          </div>
        </div>

        {/* Карточка животных */}
        <div 
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            padding: '30px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            border: '1px solid rgba(51, 181, 229, 0.2)',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
            e.currentTarget.style.boxShadow = '0 16px 48px rgba(51, 181, 229, 0.15)';
            e.currentTarget.style.border = '1px solid rgba(51, 181, 229, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)';
            e.currentTarget.style.border = '1px solid rgba(51, 181, 229, 0.2)';
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ 
                color: '#666', 
                fontSize: '14px', 
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '8px'
              }}>
                ПИТОМЦЕВ В БАЗЕ
              </h3>
              <div style={{ 
                fontSize: '36px', 
                fontWeight: '800', 
                color: '#33B5E5',
                marginBottom: '8px'
              }}>
                {stats.animals}
              </div>
              <div style={{ 
                color: '#33B5E5', 
                fontSize: '14px',
                fontWeight: '600'
              }}>
                {isAuthenticated ? '📊 Ваши питомцы' : '🔒 Нужен вход'}
              </div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #33B5E5 0%, #0099CC 100%)',
              borderRadius: '16px',
              padding: '12px',
              fontSize: '24px'
            }}>
              🐕
            </div>
          </div>
        </div>

        {/* Карточка сравнений */}
        <div 
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            padding: '30px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255, 107, 53, 0.2)',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
            e.currentTarget.style.boxShadow = '0 16px 48px rgba(255, 107, 53, 0.15)';
            e.currentTarget.style.border = '1px solid rgba(255, 107, 53, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)';
            e.currentTarget.style.border = '1px solid rgba(255, 107, 53, 0.2)';
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ 
                color: '#666', 
                fontSize: '14px', 
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '8px'
              }}>
                РАСЧЕТОВ ВЫПОЛНЕНО
              </h3>
              <div style={{ 
                fontSize: '36px', 
                fontWeight: '800', 
                color: '#FF6B35',
                marginBottom: '8px'
              }}>
                {stats.comparisons}
              </div>
              <div style={{ 
                color: '#FF6B35', 
                fontSize: '14px',
                fontWeight: '600'
              }}>
                ⚡ Быстро и точно
              </div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
              borderRadius: '16px',
              padding: '12px',
              fontSize: '24px'
            }}>
              📊
            </div>
          </div>
        </div>

        {/* Карточка брендов */}
        <div 
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            padding: '30px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            border: '1px solid rgba(139, 195, 74, 0.2)',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
            e.currentTarget.style.boxShadow = '0 16px 48px rgba(139, 195, 74, 0.15)';
            e.currentTarget.style.border = '1px solid rgba(139, 195, 74, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)';
            e.currentTarget.style.border = '1px solid rgba(139, 195, 74, 0.2)';
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ 
                color: '#666', 
                fontSize: '14px', 
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '8px'
              }}>
                БРЕНДОВ КОРМОВ
              </h3>
              <div style={{ 
                fontSize: '36px', 
                fontWeight: '800', 
                color: '#8BC34A',
                marginBottom: '8px'
              }}>
                {stats.brands}
              </div>
              <div style={{ 
                color: '#8BC34A', 
                fontSize: '14px',
                fontWeight: '600'
              }}>
                🏷️ Проверенные бренды
              </div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #8BC34A 0%, #9CCC65 100%)',
              borderRadius: '16px',
              padding: '12px',
              fontSize: '24px'
            }}>
              🏭
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 