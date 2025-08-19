# 🚀 Настройка Render для VetFormuLab

## 📋 Что нужно сделать прямо сейчас

### 1. Перейти в панель Render
Откройте [dashboard.render.com](https://dashboard.render.com) и найдите ваш сервис `x2-backend`

### 2. Добавить переменные окружения
В разделе **Environment** → **Environment Variables** добавьте:

```bash
GOOGLE_SHEETS_URL=https://docs.google.com/spreadsheets/d/1z_3fgHP9HAupBA9uGW3-_KDVdoWC2WkvBRuexCnVzMA/edit?usp=sharing
GOOGLE_SERVICE_ACCOUNT_EMAIL=vetformulab-sync@project-123456.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC9RVuvJcr756Gw\n2D8cDxepVRQEKcMfy9hBK9a1hEwiLEI7t/aetGGfguQ61lrpnBB8XDFxMWUbrjnu\nwgGmUskftmyZokN7ACeblzvyOAK9yqpP2F4IxsuVLI/XB/5MeemOLlerPLO79VXa\nHbVi0Q8uYUaAbmZKuUyQn9ZY0BKaZxz383p/jZ5duqVuTgd7DqmGOB8BLMWT+ZQt\nedxPw5Z86DDHl79+iENIlDx3+p5PdKfmeae8uWH13Q3Bi1lzfLpAEQtVjOCtDSdL\nswZ6kNTvKuL3Gjfhkt/g/tiKFkjrJg0TQjcg7rztJUK/fzHDOdHYpaXmLhV1bQs+\nBZDyuJ8vAgMBAAECggEAD7dsr5SR0G0hjg/G3cubCWKZMOdO3psMsAy13YjI0aWf\nMlpKTk9oM9ionwIhtnhRHiKBsIaLgMrs4JiXjnodXVbGmdNRiysuHstmHOztvVjQ\n36R12oC3cwGqSA7P3QXakQXkHcICor7yjBQfdb8qZY2KTyvbrqTIaNH8+I7+nHeC\nvliL7PVL3KfOJeTIcqcTvUzamZO+roiBBCXIIUVyUgK6Demw9o/PfWOdBpcX9L1T\nidiczwdi2Qx0YJyJX8ZA0/kMNCW9WZARlYxl1rnQUeP5Rw7qn1dKaSO2JTAW/OS6\nva994cb6TCQXYdpVTlFefG6UslzQNcBjT9QlzhqpYQKBgQDz63cXM3U730inUVHM\nlXFDJ5W5Wnh6HlfqENGM0/cjbU6Uhf6lF4ucwuV1UV41Mdd5Ul9GFgg49AHCI5yt\nBcijE/+oB+RlteAcJZcm1hpjUuEAYgCcQJBQAuDGbtmyJ2v1xFtcYPlur7nWBigV\nM8hWC+InrWkhjQ4KiL2rsoGt9wKBgQDGpQclykwXgxIto6sdSY2raKxf5E/9c5mY\nNJxxZeWu1EdI3lo25cZEnpAWW/NRUg1Q3Rq6GyhehSKjKHlCMbIuNjwX4vh5fjZl\n3OnBk7tzmaP2Mn3qXUY4KXjk/5Cw35a7ptvF5dVQWeiT3XtHbnuDPeU3PR7GcGMX\np3ne73gqiQKBgHEyXywnN0q3znHHrVxyJgPyROul7q9NkaMQdw8R92k7evI2VPys\ntp/jWrVdM4kgPk0RSyGta9dydbZw7G7ndjsoNsb2EqqZAw5M656cUdaySbTxxjK9\nS7u1+jZcjy68WL/Phk6Sum8Bog6PAN8GDvzPuv6K3XUyjseYud0KlF/1AoGATs6J\n12Q6a9mEDLcx25yip64PNLvPQC3scYXtys8yH/n3jeEoyT6/OdnuL/Cqx0hWIA6X\n292KVnVbGH+mG6y7k7nQfWl+SjTYP/E0i6egZmw9sB639ZKrmPxbCf6Z2JHbqva3\nmftkdUw2CPOFRQF/3sFfflqxKujLZ0b6AofelIECgYEA54R5Q8gjdsah9QzbB8Xl\nvLDWSIm0RmM9SsWT1FvGcI9CQpzCUb2II7AkFoLp4a8fmIAyH2w/tqMXlzGM2CrE\nHxBTKPCMkBGu8MHw4JiJLkjVkXp46Vi2/5zMo5OG49Ur7sQ8ibijsDF78Q8jgaZ5\nG8M97ZIWKCb3qyVgq+6A834=\n-----END PRIVATE KEY-----\n"
SQLITE_DATABASE_PATH=./data/vetformulab.db
CLEAR_FEEDS_ON_IMPORT=1
PORT=10000
NODE_ENV=production
RENDER=true
```

### 3. Перезапустить сервис
После добавления переменных:
1. Нажмите **Manual Deploy** → **Deploy latest commit**
2. Дождитесь завершения развертывания

### 4. Проверить работу
После перезапуска проверьте логи - должны исчезнуть ошибки:
- ❌ "Ошибка аутентификации Google Sheets"
- ❌ "Ошибка инициализации Google Sheets сервиса"

## 🔍 Как проверить, что все работает

### 1. Проверка статуса API:
```bash
curl https://x2-backend-j0jk.onrender.com/api/health
```

### 2. Проверка Google Sheets:
```bash
curl https://x2-backend-j0jk.onrender.com/api/sync/status
```

### 3. Синхронизация кормов:
```bash
curl -X POST https://x2-backend-j0jk.onrender.com/api/sync/feeds \
  -H "Content-Type: application/json" \
  -d '{"clearExisting": true}'
```

## ⚠️ Важные моменты

1. **Не меняйте** `GOOGLE_PRIVATE_KEY` - он уже правильный
2. **Не меняйте** `GOOGLE_SERVICE_ACCOUNT_EMAIL` - он уже правильный
3. **Порт должен быть** `10000` для Render
4. **NODE_ENV** должен быть `production`

## 🚨 Если что-то не работает

1. Проверьте логи в Render
2. Убедитесь, что все переменные добавлены правильно
3. Проверьте, что сервис перезапустился
4. Обратитесь к файлу `DEPLOYMENT.md` для подробной информации

## ✅ После успешной настройки

Ваш бэкенд будет:
- ✅ Автоматически импортировать корма из Google Sheets при запуске
- ✅ Предоставлять API для синхронизации
- ✅ Работать с фронтендом на Vercel
- ✅ Использовать Google Sheets как основную базу данных
