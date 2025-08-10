import React from 'react';

const PublicOffer: React.FC = () => {
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
        Публичная оферта
      </h1>
      
      <div style={{
        textAlign: 'center',
        color: '#666',
        marginBottom: '40px',
        fontSize: '16px'
      }}>
        Договор публичной оферты на оказание услуг сервиса VetFormuLab Pro
      </div>

      <div style={{ color: '#333', fontSize: '16px' }}>
        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#00C851', fontSize: '24px', marginBottom: '15px' }}>
            1. Общие положения
          </h2>
          <p style={{ marginBottom: '15px' }}>
            Настоящий договор является публичной офертой (предложением) для заключения договора на оказание услуг и содержит все существенные условия договора на оказание услуг сервиса VetFormuLab Pro.
          </p>
          <p style={{ marginBottom: '15px' }}>
            В соответствии со статьей 437 Гражданского кодекса Российской Федерации, в случае принятия изложенных ниже условий и регистрации на сайте, физическое или юридическое лицо, производящее акцепт настоящей публичной оферты, становится Заказчиком услуг (далее — "Заказчик").
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#00C851', fontSize: '24px', marginBottom: '15px' }}>
            2. Предмет договора
          </h2>
          <p style={{ marginBottom: '15px' }}>
            2.1. Исполнитель предоставляет Заказчику доступ к веб-сервису VetFormuLab Pro — системе для расчета потребности животных в питании и анализа кормов.
          </p>
          <p style={{ marginBottom: '15px' }}>
            2.2. Сервис включает в себя:
          </p>
          <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
            <li>Калькулятор потребности животных в энергии</li>
            <li>База данных кормов с характеристиками</li>
            <li>Инструменты для сравнения кормов</li>
            <li>Возможность сохранения и управления данными животных и расчетов</li>
            <li>Техническую поддержку пользователей</li>
          </ul>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#00C851', fontSize: '24px', marginBottom: '15px' }}>
            3. Права и обязанности сторон
          </h2>
          <h3 style={{ color: '#00C851', fontSize: '20px', marginBottom: '10px' }}>
            3.1. Исполнитель обязуется:
          </h3>
          <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
            <li>Обеспечить доступ к сервису в соответствии с техническими возможностями</li>
            <li>Поддерживать работоспособность сервиса</li>
            <li>Обеспечить конфиденциальность данных Заказчика</li>
            <li>Предоставлять техническую поддержку</li>
            <li>Своевременно информировать об изменениях в работе сервиса</li>
          </ul>
          
          <h3 style={{ color: '#00C851', fontSize: '20px', marginBottom: '10px' }}>
            3.2. Заказчик обязуется:
          </h3>
          <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
            <li>Использовать сервис в соответствии с его назначением</li>
            <li>Не передавать свои учетные данные третьим лицам</li>
            <li>Предоставлять достоверную информацию при регистрации</li>
            <li>Соблюдать требования законодательства при использовании сервиса</li>
            <li>Не использовать сервис для незаконных целей</li>
          </ul>

          <h3 style={{ color: '#00C851', fontSize: '20px', marginBottom: '10px' }}>
            3.3. Заказчик имеет право:
          </h3>
          <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
            <li>Получать полный доступ к функциям сервиса</li>
            <li>Обращаться в службу технической поддержки</li>
            <li>Получать консультации по использованию сервиса</li>
            <li>Экспортировать свои данные</li>
          </ul>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#00C851', fontSize: '24px', marginBottom: '15px' }}>
            4. Стоимость услуг и порядок расчетов
          </h2>
          <p style={{ marginBottom: '15px' }}>
            4.1. Базовые функции сервиса предоставляются бесплатно.
          </p>
          <p style={{ marginBottom: '15px' }}>
            4.2. Дополнительные функции и премиум-возможности могут предоставляться на платной основе согласно действующему прайс-листу.
          </p>
          <p style={{ marginBottom: '15px' }}>
            4.3. Исполнитель оставляет за собой право изменять стоимость услуг с предварительным уведомлением Заказчика не менее чем за 30 дней.
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#00C851', fontSize: '24px', marginBottom: '15px' }}>
            5. Ответственность сторон
          </h2>
          <p style={{ marginBottom: '15px' }}>
            5.1. Исполнитель не несет ответственности за:
          </p>
          <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
            <li>Временные технические неполадки и перерывы в работе сервиса</li>
            <li>Решения, принятые Заказчиком на основе данных сервиса</li>
            <li>Последствия использования расчетов для лечения животных без консультации с ветеринарным врачом</li>
            <li>Действия третьих лиц</li>
          </ul>
          
          <p style={{ marginBottom: '15px' }}>
            5.2. Заказчик несет полную ответственность за:
          </p>
          <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
            <li>Достоверность предоставляемых данных</li>
            <li>Соблюдение условий настоящего договора</li>
            <li>Правомерность использования сервиса</li>
          </ul>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#00C851', fontSize: '24px', marginBottom: '15px' }}>
            6. Конфиденциальность
          </h2>
          <p style={{ marginBottom: '15px' }}>
            6.1. Исполнитель обязуется не разглашать персональную информацию Заказчика третьим лицам.
          </p>
          <p style={{ marginBottom: '15px' }}>
            6.2. Подробная информация об обработке персональных данных изложена в Политике конфиденциальности.
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#00C851', fontSize: '24px', marginBottom: '15px' }}>
            7. Интеллектуальная собственность
          </h2>
          <p style={{ marginBottom: '15px' }}>
            7.1. Все права на сервис VetFormuLab Pro, включая программное обеспечение, дизайн, базы данных, принадлежат Исполнителю.
          </p>
          <p style={{ marginBottom: '15px' }}>
            7.2. Заказчик получает право использования сервиса в рамках предоставленного доступа, но не приобретает никаких прав на интеллектуальную собственность.
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#00C851', fontSize: '24px', marginBottom: '15px' }}>
            8. Срок действия договора
          </h2>
          <p style={{ marginBottom: '15px' }}>
            8.1. Договор вступает в силу с момента регистрации Заказчика в сервисе и действует бессрочно.
          </p>
          <p style={{ marginBottom: '15px' }}>
            8.2. Любая из сторон может расторгнуть договор в одностороннем порядке, уведомив об этом другую сторону.
          </p>
          <p style={{ marginBottom: '15px' }}>
            8.3. При расторжении договора Заказчик утрачивает доступ к сервису.
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#00C851', fontSize: '24px', marginBottom: '15px' }}>
            9. Изменение условий договора
          </h2>
          <p style={{ marginBottom: '15px' }}>
            9.1. Исполнитель оставляет за собой право изменять условия настоящего договора в одностороннем порядке.
          </p>
          <p style={{ marginBottom: '15px' }}>
            9.2. Уведомление об изменениях публикуется на сайте. Изменения вступают в силу с момента их публикации.
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#00C851', fontSize: '24px', marginBottom: '15px' }}>
            10. Разрешение споров
          </h2>
          <p style={{ marginBottom: '15px' }}>
            10.1. Все споры и разногласия решаются путем переговоров.
          </p>
          <p style={{ marginBottom: '15px' }}>
            10.2. При невозможности достижения соглашения споры рассматриваются в судебном порядке по месту нахождения Исполнителя.
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#00C851', fontSize: '24px', marginBottom: '15px' }}>
            11. Контактная информация
          </h2>
          <p style={{ marginBottom: '15px' }}>
            Исполнитель: [Название организации]<br/>
            Адрес: [Юридический адрес]<br/>
            Email: [Контактный email]<br/>
            Телефон: [Контактный телефон]
          </p>
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
            Дата последнего обновления: {new Date().toLocaleDateString('ru-RU')}
          </p>
          <p style={{ margin: '0', color: '#00C851', fontSize: '14px', fontWeight: '600' }}>
            Регистрируясь в сервисе, вы соглашаетесь с условиями данной оферты
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublicOffer; 