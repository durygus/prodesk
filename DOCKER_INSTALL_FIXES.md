# Исправления для Docker установки Trudesk

## Проблема
При запуске Trudesk в Docker контейнере страница установки `/install` была недоступна или работала некорректно.

## Исправления

### 1. app.js - Логика запуска для Docker
```javascript
// БЫЛО:
if (nconf.get('install') || (!configExists && !isDocker)) {
  launchInstallServer()
}

// СТАЛО:
if (nconf.get('install') || (!configExists && !isDocker)) {
  launchInstallServer()
}

// И добавлена правильная проверка installed.value:
if (!installed || !installed.value) {
  return launchInstallServer()
} else {
  return launchServer(db)
}
```

### 2. docker-compose.dev.yml - Переменные окружения
```yaml
environment:
  TRUDESK_DOCKER: true          # Определяет Docker режим
  TD_MONGODB_HOST: mongo        # Правильный адрес MongoDB в Docker
  TD_MONGODB_URI: mongodb://mongo:27017/herzen
```

### 3. config.yml - База данных
```yaml
mongo:
  host: mongo          # Было: localhost
  database: herzen     # Было: trudesk
```

### 4. src/views/install.hbs - JavaScript для Docker
```javascript
// Автоматическая установка параметров MongoDB для Docker:
var mongoConnection = {{#if isDocker}}{
  host: 'mongo',
  port: '27017',
  username: '',
  password: '',
  database: 'herzen'
}{{else}}undefined{{/if}};
```

## Как использовать

1. **Первая установка:**
   ```bash
   ./dev.sh start
   # Откройте http://localhost:8118/install
   # Пройдите установку
   ```

2. **После установки:**
   - Система автоматически перезапустится в обычном режиме
   - `/install` будет перенаправлять на главную страницу
   - Можете войти с данными администратора

3. **Повторная установка:**
   ```bash
   ./dev.sh stop
   rm -rf data/mongo/*  # Очистить базу данных
   ./dev.sh start
   ```

## Переменные для отладки

- `TRUDESK_DOCKER=true` - включает Docker режим
- `install=true` - принудительно запускает установочный сервер
- `NODE_ENV=development` - режим разработки

Commit: 6d2060fc
