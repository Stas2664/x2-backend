import React from 'react';

const TechnicalSupport: React.FC = () => {
  return (
    <div style={{
      maxWidth: '1000px',
      margin: '0 auto',
      padding: '40px 20px',
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '20px',
      boxShadow: '0 20px 60px rgba(0, 200, 81, 0.1)',
      lineHeight: '1.6'
    }}>
      <h1 style={{
        fontSize: '36px',
        fontWeight: '800',
        background: 'linear-gradient(135deg, #00C851 0%, #33B5E5 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        Техническая поддержка
      </h1>
      
      <div style={{
        textAlign: 'center',
        color: '#666',
        marginBottom: '40px',
        fontSize: '16px'
      }}>
        Помощь и поддержка пользователей VetFormuLab Pro
      </div>

      <div style={{ color: '#333', fontSize: '16px' }}>
        {/* Быстрые ссылки */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          <div style={{
            padding: '20px',
            background: 'rgba(0, 200, 81, 0.05)',
            borderRadius: '15px',
            border: '1px solid rgba(0, 200, 81, 0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>📧</div>
            <h3 style={{ color: '#00C851', marginBottom: '10px' }}>Email поддержка</h3>
            <p style={{ margin: '0', fontSize: '14px' }}>
              support@vetformulab.pro<br/>
              Ответ в течение 24 часов
            </p>
          </div>
          
          <div style={{
            padding: '20px',
            background: 'rgba(51, 181, 229, 0.05)',
            borderRadius: '15px',
            border: '1px solid rgba(51, 181, 229, 0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>💬</div>
            <h3 style={{ color: '#33B5E5', marginBottom: '10px' }}>Онлайн чат</h3>
            <p style={{ margin: '0', fontSize: '14px' }}>
              Доступен в рабочие дни<br/>
              9:00 - 18:00 МСК
            </p>
          </div>
          
          <div style={{
            padding: '20px',
            background: 'rgba(255, 193, 7, 0.05)',
            borderRadius: '15px',
            border: '1px solid rgba(255, 193, 7, 0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>📞</div>
            <h3 style={{ color: '#FFC107', marginBottom: '10px' }}>Телефон</h3>
            <p style={{ margin: '0', fontSize: '14px' }}>
              +7 (800) 123-45-67<br/>
              Бесплатно по России
            </p>
          </div>
        </div>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ color: '#00C851', fontSize: '28px', marginBottom: '20px', textAlign: 'center' }}>
            Часто задаваемые вопросы
          </h2>
          
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ color: '#00C851', fontSize: '20px', marginBottom: '10px' }}>
              🔐 Как зарегистрироваться в системе?
            </h3>
            <p style={{ marginBottom: '15px' }}>
              1. Нажмите кнопку "Регистрация" на главной странице<br/>
              2. Заполните форму с данными вашей ветеринарной клиники<br/>
              3. Подтвердите email адрес<br/>
              4. Начните использовать все функции сервиса
            </p>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ color: '#00C851', fontSize: '20px', marginBottom: '10px' }}>
              🧮 Как правильно использовать калькулятор энергии?
            </h3>
            <p style={{ marginBottom: '15px' }}>
              1. Выберите вид животного (собака, кошка, и т.д.)<br/>
              2. Укажите точный вес животного в килограммах<br/>
              3. Выберите уровень активности и физиологическое состояние<br/>
              4. Учтите особые условия (беременность, лактация, болезнь)<br/>
              5. Полученный результат используйте как рекомендацию для корректировки рациона
            </p>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ color: '#00C851', fontSize: '20px', marginBottom: '10px' }}>
              📊 Как сравнивать корма между собой?
            </h3>
            <p style={{ marginBottom: '15px' }}>
              1. Перейдите в раздел "Корма"<br/>
              2. Найдите интересующие корма через поиск<br/>
              3. Отметьте корма для сравнения (до 5 штук)<br/>
              4. Нажмите "Сравнить выбранные"<br/>
              5. Анализируйте состав, энергетическую ценность и соотношение БЖУ
            </p>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ color: '#00C851', fontSize: '20px', marginBottom: '10px' }}>
              💾 Как сохранить данные о пациенте?
            </h3>
            <p style={{ marginBottom: '15px' }}>
              1. После проведения расчетов нажмите "Сохранить расчет"<br/>
              2. Заполните информацию о животном (кличка, порода, возраст)<br/>
              3. Добавьте заметки о состоянии здоровья<br/>
              4. Данные сохранятся в разделе "Питомцы" для дальнейшего использования
            </p>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ color: '#00C851', fontSize: '20px', marginBottom: '10px' }}>
              🔄 Как экспортировать данные?
            </h3>
            <p style={{ marginBottom: '15px' }}>
              1. Откройте раздел с нужными данными (питомцы, расчеты, сравнения)<br/>
              2. Нажмите кнопку "Экспорт" в правом верхнем углу<br/>
              3. Выберите формат (PDF для отчетов, Excel для анализа)<br/>
              4. Файл автоматически загрузится на ваш компьютер
            </p>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ color: '#00C851', fontSize: '20px', marginBottom: '10px' }}>
              ⚠️ Что делать, если расчеты кажутся неточными?
            </h3>
            <p style={{ marginBottom: '15px' }}>
              1. Проверьте правильность введенных данных (вес, возраст, активность)<br/>
              2. Убедитесь, что выбран корректный вид животного<br/>
              3. Учтите индивидуальные особенности конкретного пациента<br/>
              4. Помните: расчеты носят рекомендательный характер<br/>
              5. При сомнениях обратитесь в техподдержку для консультации
            </p>
          </div>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ color: '#00C851', fontSize: '28px', marginBottom: '20px', textAlign: 'center' }}>
            Системные требования
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            <div>
              <h3 style={{ color: '#00C851', fontSize: '20px', marginBottom: '15px' }}>
                🖥️ Рекомендуемые браузеры
              </h3>
              <ul style={{ marginLeft: '20px' }}>
                <li>Google Chrome 90+</li>
                <li>Mozilla Firefox 88+</li>
                <li>Safari 14+</li>
                <li>Microsoft Edge 90+</li>
              </ul>
            </div>
            
            <div>
              <h3 style={{ color: '#00C851', fontSize: '20px', marginBottom: '15px' }}>
                📱 Мобильные устройства
              </h3>
              <ul style={{ marginLeft: '20px' }}>
                <li>iOS 13+ (Safari, Chrome)</li>
                <li>Android 8+ (Chrome, Firefox)</li>
                <li>Responsive дизайн</li>
                <li>Touch-friendly интерфейс</li>
              </ul>
            </div>
          </div>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ color: '#00C851', fontSize: '28px', marginBottom: '20px', textAlign: 'center' }}>
            Устранение неполадок
          </h2>
          
          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ color: '#00C851', fontSize: '20px', marginBottom: '10px' }}>
              🚫 Проблемы с входом в систему
            </h3>
            <ul style={{ marginLeft: '20px' }}>
              <li>Проверьте правильность email и пароля</li>
              <li>Убедитесь, что email подтвержден</li>
              <li>Попробуйте сбросить пароль через "Забыли пароль?"</li>
              <li>Очистите cookies и cache браузера</li>
            </ul>
          </div>

          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ color: '#00C851', fontSize: '20px', marginBottom: '10px' }}>
              ⚡ Медленная работа сервиса
            </h3>
            <ul style={{ marginLeft: '20px' }}>
              <li>Проверьте скорость интернет-соединения</li>
              <li>Закройте лишние вкладки браузера</li>
              <li>Обновите страницу (Ctrl+F5)</li>
              <li>Попробуйте другой браузер</li>
            </ul>
          </div>

          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ color: '#00C851', fontSize: '20px', marginBottom: '10px' }}>
              💾 Данные не сохраняются
            </h3>
            <ul style={{ marginLeft: '20px' }}>
              <li>Убедитесь, что вы авторизованы в системе</li>
              <li>Проверьте соединение с интернетом</li>
              <li>Отключите блокировщики рекламы</li>
              <li>Разрешите cookies для нашего сайта</li>
            </ul>
          </div>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ color: '#00C851', fontSize: '28px', marginBottom: '20px', textAlign: 'center' }}>
            Обратная связь
          </h2>
          
          <div style={{
            background: 'rgba(0, 200, 81, 0.05)',
            padding: '25px',
            borderRadius: '15px',
            border: '1px solid rgba(0, 200, 81, 0.1)',
            textAlign: 'center'
          }}>
            <p style={{ marginBottom: '20px', fontSize: '18px' }}>
              Не нашли ответ на свой вопрос? Мы всегда готовы помочь!
            </p>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px',
              marginTop: '20px'
            }}>
              <button style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #00C851 0%, #33B5E5 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'transform 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              onClick={() => window.location.href = 'mailto:support@vetformulab.pro'}>
                📧 Написать в поддержку
              </button>
              
              <button style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #33B5E5 0%, #00C851 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'transform 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              onClick={() => alert('Чат поддержки будет доступен в ближайшее время!')}>
                💬 Онлайн чат
              </button>
            </div>
          </div>
        </section>

        <div style={{
          textAlign: 'center',
          marginTop: '40px',
          padding: '20px',
          background: 'rgba(0, 200, 81, 0.05)',
          borderRadius: '10px',
          border: '1px solid rgba(0, 200, 81, 0.1)'
        }}>
          <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>
            Время работы поддержки: Пн-Пт 9:00-18:00 МСК
          </p>
          <p style={{ margin: '0', color: '#00C851', fontSize: '14px', fontWeight: '600' }}>
            Мы стремимся отвечать на все обращения в течение 24 часов
          </p>
        </div>
      </div>
    </div>
  );
};

export default TechnicalSupport; 