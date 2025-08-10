import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    clinic_name: '',
    clinic_phone: '',
    clinic_address: '',
    contact_person: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Валидация
    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (formData.password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }

    setLoading(true);

    try {
      await register({
        email: formData.email,
        password: formData.password,
        clinic_name: formData.clinic_name,
        clinic_phone: formData.clinic_phone || undefined,
        clinic_address: formData.clinic_address || undefined,
        contact_person: formData.contact_person || undefined
      });
      navigate('/');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (!formData.email || !formData.password || !formData.confirmPassword) {
        setError('Заполните все обязательные поля');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Пароли не совпадают');
        return;
      }
      if (formData.password.length < 6) {
        setError('Пароль должен содержать минимум 6 символов');
        return;
      }
    }
    setError('');
    setCurrentStep(2);
  };

  const prevStep = () => {
    setError('');
    setCurrentStep(1);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '24px',
        padding: '40px',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
      }}>
        {/* Заголовок */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontSize: '64px', marginBottom: '15px' }}>🏥✨</div>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: '700',
            color: '#1a1a1a',
            marginBottom: '8px'
          }}>
            Регистрация ветклиники
          </h1>
          <p style={{ color: '#666', fontSize: '16px' }}>
            Присоединяйтесь к VetFormuLab Pro
          </p>
          
          {/* Индикатор шагов */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '10px',
            marginTop: '20px'
          }}>
            <div style={{
              width: '30px',
              height: '4px',
              borderRadius: '2px',
              background: currentStep >= 1 ? '#00C851' : '#e0e0e0'
            }} />
            <div style={{
              width: '30px',
              height: '4px',
              borderRadius: '2px',
              background: currentStep >= 2 ? '#00C851' : '#e0e0e0'
            }} />
          </div>
          <p style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
            Шаг {currentStep} из 2
          </p>
        </div>

        <form onSubmit={currentStep === 2 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
          {error && (
            <div style={{
              background: 'rgba(244, 67, 54, 0.1)',
              color: '#F44336',
              padding: '12px 16px',
              borderRadius: '12px',
              marginBottom: '20px',
              border: '1px solid rgba(244, 67, 54, 0.3)',
              fontSize: '14px'
            }}>
              ⚠️ {error}
            </div>
          )}

          {currentStep === 1 && (
            <>
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: '600', 
                color: '#1a1a1a', 
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                🔐 Учетные данные
              </h3>

              {/* Email */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontWeight: '600',
                  color: '#1a1a1a',
                  fontSize: '14px'
                }}>
                  📧 Email клиники *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '14px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '12px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'border-color 0.3s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#00C851'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  placeholder="clinic@example.com"
                />
              </div>

              {/* Пароль */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontWeight: '600',
                  color: '#1a1a1a',
                  fontSize: '14px'
                }}>
                  🔒 Пароль *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '14px 45px 14px 14px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '12px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'border-color 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#00C851'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                    placeholder="Минимум 6 символов"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '18px'
                    }}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* Подтверждение пароля */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontWeight: '600',
                  color: '#1a1a1a',
                  fontSize: '14px'
                }}>
                  🔐 Подтвердите пароль *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '14px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '12px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'border-color 0.3s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#00C851'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  placeholder="Повторите пароль"
                />
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '16px',
                  background: 'linear-gradient(135deg, #00C851 0%, #007E33 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                Далее ➡️ Информация о клинике
              </button>
            </>
          )}

          {currentStep === 2 && (
            <>
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: '600', 
                color: '#1a1a1a', 
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                🏥 Информация о клинике
              </h3>

              {/* Название клиники */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontWeight: '600',
                  color: '#1a1a1a',
                  fontSize: '14px'
                }}>
                  🏢 Название клиники *
                </label>
                <input
                  type="text"
                  name="clinic_name"
                  value={formData.clinic_name}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '14px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '12px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'border-color 0.3s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#00C851'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  placeholder="Ветеринарная клиника Лапушки"
                />
              </div>

              {/* Контактное лицо */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontWeight: '600',
                  color: '#1a1a1a',
                  fontSize: '14px'
                }}>
                  👨‍⚕️ Контактное лицо
                </label>
                <input
                  type="text"
                  name="contact_person"
                  value={formData.contact_person}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '14px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '12px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'border-color 0.3s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#00C851'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  placeholder="Главный ветеринар"
                />
              </div>

              {/* Телефон */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontWeight: '600',
                  color: '#1a1a1a',
                  fontSize: '14px'
                }}>
                  📞 Телефон клиники
                </label>
                <input
                  type="tel"
                  name="clinic_phone"
                  value={formData.clinic_phone}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '14px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '12px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'border-color 0.3s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#00C851'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  placeholder="+7 (999) 123-45-67"
                />
              </div>

              {/* Адрес */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontWeight: '600',
                  color: '#1a1a1a',
                  fontSize: '14px'
                }}>
                  📍 Адрес клиники
                </label>
                <textarea
                  name="clinic_address"
                  value={formData.clinic_address}
                  onChange={handleChange}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '14px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '12px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'border-color 0.3s ease',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#00C851'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  placeholder="г. Москва, ул. Ветеринарная, д. 123"
                />
              </div>

              <div style={{
                display: 'flex',
                gap: '12px'
              }}>
                <button
                  type="button"
                  onClick={prevStep}
                  style={{
                    flex: '0 0 auto',
                    padding: '16px 20px',
                    background: 'rgba(108, 117, 125, 0.1)',
                    color: '#6c757d',
                    border: '2px solid rgba(108, 117, 125, 0.3)',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  ⬅️ Назад
                </button>
                
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: '1',
                    padding: '16px',
                    background: loading ? '#ccc' : 'linear-gradient(135deg, #00C851 0%, #007E33 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {loading ? '⏳ Создание аккаунта...' : '🚀 Создать аккаунт'}
                </button>
              </div>
            </>
          )}
        </form>

        {/* Ссылка на вход */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <p style={{ color: '#666', fontSize: '14px' }}>
            Уже есть аккаунт?{' '}
            <Link 
              to="/login" 
              style={{ 
                color: '#00C851', 
                textDecoration: 'none',
                fontWeight: '600'
              }}
            >
              Войти в систему
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register; 