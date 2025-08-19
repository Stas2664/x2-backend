# Настройка интеграции с Google Sheets

## Обзор

Этот документ описывает, как настроить интеграцию вашего приложения VetFormuLab с Google Sheets для автоматической синхронизации базы кормов.

## Шаг 1: Создание Google Cloud Project

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект или выберите существующий
3. Включите Google Sheets API:
   - Перейдите в "APIs & Services" > "Library"
   - Найдите "Google Sheets API" и включите его

## Шаг 2: Создание Service Account

1. В Google Cloud Console перейдите в "APIs & Services" > "Credentials"
2. Нажмите "Create Credentials" > "Service Account"
3. Заполните форму:
   - **Name**: `vetformulab-sheets-sync`
   - **Description**: `Service account for VetFormuLab Google Sheets integration`
4. Нажмите "Create and Continue"
5. Пропустите шаги с ролями (нажмите "Continue")
6. Нажмите "Done"

## Шаг 3: Создание ключа для Service Account

1. В списке Service Accounts найдите созданный аккаунт
2. Нажмите на email аккаунта
3. Перейдите на вкладку "Keys"
4. Нажмите "Add Key" > "Create new key"
5. Выберите "JSON" и нажмите "Create"
6. Файл ключа автоматически скачается

## Шаг 4: Настройка доступа к Google таблице

1. Откройте вашу Google таблицу: [База кормов](https://docs.google.com/spreadsheets/d/1z_3fgHP9HAupBA9uGW3-_KDVdoWC2WkvBRuexCnVzMA/edit?usp=sharing)
2. Нажмите "Настройки доступа" (кнопка "Поделиться")
3. Добавьте email вашего Service Account (из файла ключа, поле `client_email`)
4. Дайте права "Редактор" или "Просмотр" (для чтения достаточно "Просмотр")

## Шаг 5: Настройка приложения

### Вариант A: Через файл ключей (рекомендуется)

1. Скопируйте скачанный файл ключа в папку `x2-backend-main/`
2. Переименуйте его в `google-service-account-key.json`
3. Убедитесь, что файл добавлен в `.gitignore` (для безопасности)

### Вариант B: Через переменные окружения

1. Создайте файл `.env` на основе `env.example`
2. Заполните переменные:
   ```bash
   GOOGLE_SHEETS_URL=https://docs.google.com/spreadsheets/d/1z_3fgHP9HAupBA9uGW3-_KDVdoWC2WkvBRuexCnVzMA/edit?usp=sharing
   GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```

## Шаг 6: Установка зависимостей

```bash
cd x2-backend-main
npm install googleapis google-auth-library
```

## Шаг 7: Запуск и тестирование

1. Запустите сервер:
   ```bash
   npm start
   ```

2. Проверьте статус подключения:
   ```bash
   curl http://localhost:3001/api/sync/status
   ```

3. Запустите синхронизацию:
   ```bash
   curl -X POST http://localhost:3001/api/sync/feeds \
     -H "Content-Type: application/json" \
     -d '{"clearExisting": true}'
   ```

## API Endpoints

### GET /api/sync/status
Проверка статуса подключения к Google Sheets

### POST /api/sync/feeds
Синхронизация кормов из Google Sheets
```json
{
  "clearExisting": false,
  "range": "Лист1!A:Z"
}
```

### GET /api/sync/stats
Статистика синхронизации

### POST /api/sync/feeds/reload
Принудительная перезагрузка всех кормов

## Структура Google таблицы

Таблица должна содержать следующие колонки (названия могут варьироваться):

| Колонка | Описание | Примеры названий |
|---------|----------|------------------|
| Название | Название корма | "назв", "name", "название" |
| Бренд | Производитель | "бренд", "торгов", "производитель" |
| Тип | Вид корма | "тип", "вид корма" |
| Животное | Вид животного | "собак", "кош", "вид живот", "животное" |
| Категория | Назначение/возраст | "категор", "назначен", "возраст", "стадия" |
| МЭ | Энергетическая ценность | "мэ", "ккал/кг", "энерг", "энергетическая ценность" |
| Белок | Содержание белка | "белок", "протеин", "crude protein" |
| Жир | Содержание жира | "жир", "crude fat" |
| Клетчатка | Содержание клетчатки | "клетчат", "crude fiber" |
| Зола | Содержание золы | "зола", "ash" |
| Влага | Содержание влаги | "влага", "влажн", "moisture" |
| Кальций | Содержание кальция | "кальц", "calcium", "ca" |
| Фосфор | Содержание фосфора | "фосфор", "phosphorus", "p" |
| Витамин А | Содержание витамина А | "витамин а", "vitamin a", "a" |
| Витамин D | Содержание витамина D | "витамин d", "vitamin d", "d3" |
| Состав | Ингредиенты | "ингредиент", "состав", "ingredients" |

## Автоматическая синхронизация

При запуске сервера автоматически происходит импорт кормов из Google Sheets, если:

1. Установлена переменная `GOOGLE_SHEETS_URL`
2. Успешно настроена аутентификация
3. Таблица доступна для чтения

## Устранение неполадок

### Ошибка аутентификации
- Проверьте правильность email и private key
- Убедитесь, что Service Account имеет доступ к таблице
- Проверьте, что Google Sheets API включен

### Ошибка доступа к таблице
- Убедитесь, что таблица доступна для чтения
- Проверьте права доступа Service Account
- Убедитесь, что ID таблицы извлечен корректно

### Пустые данные
- Проверьте структуру таблицы
- Убедитесь, что данные начинаются со второй строки (первая - заголовки)
- Проверьте названия колонок

## Безопасность

⚠️ **ВАЖНО**: Никогда не коммитьте файл ключей в Git!

1. Добавьте `google-service-account-key.json` в `.gitignore`
2. Используйте переменные окружения в продакшене
3. Ограничьте права Service Account только необходимыми

## Поддержка

При возникновении проблем:

1. Проверьте логи сервера
2. Убедитесь в правильности настройки Google Cloud
3. Проверьте доступность Google Sheets API
4. Обратитесь к документации Google Sheets API
