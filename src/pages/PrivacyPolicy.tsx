import React from 'react';

const PrivacyPolicy: React.FC = () => {
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
        Политика конфиденциальности
      </h1>
      
      <div style={{
        textAlign: 'center',
        color: '#666',
        marginBottom: '40px',
        fontSize: '16px'
      }}>
        VetFormuLab Pro - Система расчета питания для животных
      </div>

      <div style={{ color: '#333', fontSize: '16px' }}>
        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#00C851', fontSize: '24px', marginBottom: '15px' }}>
            1. Общие положения
          </h2>
          <p style={{ marginBottom: '15px' }}>
            Настоящая Политика конфиденциальности определяет порядок обработки и защиты информации о пользователях сервиса VetFormuLab Pro (далее — "Сервис"), доступного по адресу [ваш домен].
          </p>
          <p style={{ marginBottom: '15px' }}>
            Администрация сервиса обязуется сохранять конфиденциальность информации о пользователях. Политика конфиденциальности применяется только к данному сервису и не распространяется на сторонние ресурсы.
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#00C851', fontSize: '24px', marginBottom: '15px' }}>
            2. Персональные данные пользователей
          </h2>
          <p style={{ marginBottom: '15px' }}>
            В рамках работы с сервисом мы можем собирать следующую информацию:
          </p>
          <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
            <li>Адрес электронной почты</li>
            <li>Название и контактные данные ветеринарной клиники</li>
            <li>Имя контактного лица</li>
            <li>Данные о животных и расчетах питания (для предоставления услуг)</li>
            <li>Техническая информация (IP-адрес, тип браузера, операционная система)</li>
          </ul>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#00C851', fontSize: '24px', marginBottom: '15px' }}>
            3. Цели обработки персональных данных
          </h2>
          <p style={{ marginBottom: '15px' }}>
            Персональные данные обрабатываются в следующих целях:
          </p>
          <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
            <li>Предоставление доступа к функциям сервиса</li>
            <li>Идентификация пользователя</li>
            <li>Обеспечение технической поддержки</li>
            <li>Уведомления об изменениях в работе сервиса</li>
            <li>Улучшение качества сервиса</li>
            <li>Обеспечение безопасности и предотвращение мошенничества</li>
          </ul>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#00C851', fontSize: '24px', marginBottom: '15px' }}>
            4. Условия обработки персональных данных
          </h2>
          <p style={{ marginBottom: '15px' }}>
            Обработка персональных данных осуществляется с согласия субъектов персональных данных на обработку их персональных данных.
          </p>
          <p style={{ marginBottom: '15px' }}>
            Обработка персональных данных может осуществляться без согласия субъекта в случаях, предусмотренных законодательством РФ.
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#00C851', fontSize: '24px', marginBottom: '15px' }}>
            5. Способы и сроки обработки персональной информации
          </h2>
          <p style={{ marginBottom: '15px' }}>
            Обработка персональных данных может осуществляться с использованием средств автоматизации и без использования таких средств.
          </p>
          <p style={{ marginBottom: '15px' }}>
            Персональные данные хранятся в течение срока, необходимого для достижения целей обработки, либо в течение срока, предусмотренного законом или договором.
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#00C851', fontSize: '24px', marginBottom: '15px' }}>
            6. Обязательства сторон
          </h2>
          <h3 style={{ color: '#00C851', fontSize: '20px', marginBottom: '10px' }}>
            Администрация обязуется:
          </h3>
          <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
            <li>Использовать полученную информацию исключительно для целей, указанных в данной Политике</li>
            <li>Обеспечить хранение конфиденциальной информации в тайне</li>
            <li>Не разглашать персональную информацию третьим лицам без согласия пользователя</li>
            <li>Принимать меры предосторожности для защиты конфиденциальности персональной информации</li>
          </ul>
          
          <h3 style={{ color: '#00C851', fontSize: '20px', marginBottom: '10px' }}>
            Пользователь обязуется:
          </h3>
          <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
            <li>Предоставлять достоверную и актуальную информацию</li>
            <li>Обновлять персональную информацию в случае ее изменения</li>
            <li>Не передавать свои данные доступа третьим лицам</li>
          </ul>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#00C851', fontSize: '24px', marginBottom: '15px' }}>
            7. Права субъекта персональных данных
          </h2>
          <p style={{ marginBottom: '15px' }}>
            Субъект персональных данных имеет право:
          </p>
          <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
            <li>Получать information о обработке его персональных данных</li>
            <li>Требовать уточнения, блокирования или уничтожения недостоверных или незаконно полученных данных</li>
            <li>Отзывать согласие на обработку персональных данных</li>
            <li>Обжаловать действия или бездействие Администрации</li>
          </ul>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#00C851', fontSize: '24px', marginBottom: '15px' }}>
            8. Меры по защите персональной информации
          </h2>
          <p style={{ marginBottom: '15px' }}>
            Администрация принимает необходимые и достаточные организационные и технические меры для защиты персональной информации от неправомерного или случайного доступа, уничтожения, изменения, блокирования, копирования, распространения, а также от иных неправомерных действий с ней третьих лиц.
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#00C851', fontSize: '24px', marginBottom: '15px' }}>
            9. Изменение Политики конфиденциальности
          </h2>
          <p style={{ marginBottom: '15px' }}>
            Администрация оставляет за собой право вносить изменения в настоящую Политику конфиденциальности. При внесении изменений в актуальной редакции указывается дата последнего обновления.
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#00C851', fontSize: '24px', marginBottom: '15px' }}>
            10. Контактная информация
          </h2>
          <p style={{ marginBottom: '15px' }}>
            По вопросам, касающимся обработки персональных данных, Вы можете обратиться к Администрации сервиса по адресу электронной почты: [ваш email]
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
          <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
            Дата последнего обновления: {new Date().toLocaleDateString('ru-RU')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy; 