# 🚀 Развертывание VetFormuLab на Render

## Обзор

Это руководство описывает, как развернуть ваше приложение VetFormuLab на Render с интеграцией Google Sheets.

## 📋 Предварительные требования

- ✅ Google Cloud Project с включенным Google Sheets API
- ✅ Service Account с ключами
- ✅ Доступ к Google таблице [База кормов](https://docs.google.com/spreadsheets/d/1z_3fgHP9uGW3-_KDVdoWC2WkvBRuexCnVzMA/edit?usp=sharing)
- ✅ GitHub репозиторий с кодом

## 🔧 Настройка на Render

### 1. Создание нового Web Service

1. Войдите в [Render Dashboard](https://dashboard.render.com/)
2. Нажмите "New" → "Web Service"
3. Подключите ваш GitHub репозиторий
4. Выберите ветку (обычно `main` или `master`)

### 2. Настройка сервиса

- **Name**: `vetformulab-backend` (или любое другое)
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: `Free` (для начала)

### 3. Настройка переменных окружения

В разделе "Environment Variables" добавьте:

```bash
GOOGLE_SHEETS_URL=https://docs.google.com/spreadsheets/d/1z_3fgHP9uGW3-_KDVdoWC2WkvBRuexCnVzMA/edit?usp=sharing
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
SQLITE_DATABASE_PATH=./data/vetformulab.db
CLEAR_FEEDS_ON_IMPORT=1
PORT=10000
NODE_ENV=production
RENDER=true
```

### 4. Получение данных для переменных

#### GOOGLE_SERVICE_ACCOUNT_EMAIL:
1. Откройте файл `google-service-account-key.json`
2. Скопируйте значение `client_email`

#### GOOGLE_PRIVATE_KEY:
1. Откройте файл `google-service-account-key.json`
2. Скопируйте значение `private_key`
3. **Замените все переносы строк на `\n`**

Пример:
```json
{
  "client_email": "vetformulab-sync@project-123456.iam.gserviceaccount.com",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
}
```

## 🚀 Развертывание

1. Нажмите "Create Web Service"
2. Дождитесь завершения сборки
3. Проверьте логи на наличие ошибок

## ✅ Проверка работы

### 1. Проверка статуса:
```bash
curl https://your-app-name.onrender.com/api/health
```

### 2. Проверка Google Sheets:
```bash
curl https://your-app-name.onrender.com/api/sync/status
```

### 3. Синхронизация кормов:
```bash
curl -X POST https://your-app-name.onrender.com/api/sync/feeds \
  -H "Content-Type: application/json" \
  -d '{"clearExisting": true}'
```

## 🔍 Устранение неполадок

### Ошибка "Cannot find module":
- Проверьте, что `package.json` содержит все зависимости
- Убедитесь, что `npm install` выполнился успешно

### Ошибка аутентификации Google:
- Проверьте правильность `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- Убедитесь, что `GOOGLE_PRIVATE_KEY` содержит `\n` вместо переносов строк
- Проверьте, что Service Account имеет доступ к таблице

### Ошибка базы данных:
- Убедитесь, что `SQLITE_DATABASE_PATH` указан правильно
- Проверьте права доступа к папке `data/`

## 📊 Мониторинг

- **Logs**: Просматривайте логи в реальном времени
- **Metrics**: Отслеживайте производительность
- **Health Checks**: Автоматические проверки работоспособности

## 🔄 Автоматическое развертывание

При каждом push в GitHub:
1. Render автоматически обнаружит изменения
2. Выполнит новую сборку
3. Развернет обновленную версию

## 💡 Полезные команды

```bash
# Перезапуск сервиса
# В панели Render: Manual Deploy → Deploy latest commit

# Просмотр логов
# В панели Render: Logs

# Изменение переменных окружения
# В панели Render: Environment → Edit Variables
```

## 🎯 Следующие шаги

После успешного развертывания:
1. Настройте домен (если нужно)
2. Настройте SSL сертификат
3. Настройте мониторинг и алерты
4. Протестируйте все API endpoints

## 🆘 Поддержка

При возникновении проблем:
1. Проверьте логи в Render
2. Убедитесь в правильности переменных окружения
3. Проверьте доступность Google Sheets API
4. Обратитесь к документации Render

