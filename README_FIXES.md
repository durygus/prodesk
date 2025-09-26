# Исправления Docker установки Trudesk

## Проблема
После установки Trudesk в Docker система продолжает показывать страницу установки вместо переключения в рабочий режим.

## Ключевые исправления

### 1. app.js - Логика проверки установки
**Проблема:** Система проверяла `if (!installed)` вместо `if (!installed.value)`

```javascript
// БЫЛО:
if (!installed) {
  return launchInstallServer()
}

// СТАЛО:
if (!installed || !installed.value) {
  return launchInstallServer()
}
```

### 2. config.yml - Адреса для Docker
```yaml
mongo:
  host: mongo          # Было: localhost
  database: herzen     # Было: trudesk
```

### 3. docker-compose.dev.yml - Переменные окружения
```yaml
environment:
  TRUDESK_DOCKER: true    # Включает Docker режим
  # install: true         # Убирается после установки
```

### 4. install.hbs - JavaScript для Docker режима
```javascript
// Автоматически устанавливает параметры MongoDB:
var mongoConnection = {{#if isDocker}}{
  host: 'mongo',
  port: '27017',
  database: 'herzen'
}{{else}}undefined{{/if}};
```

## Процесс установки

1. **Первая установка:**
   ```bash
   rm -rf data/          # Очистить данные
   ./dev.sh start        # Запустить
   # Открыть http://localhost:8118/install
   ```

2. **Добавить переменную для установки** (временно):
   ```yaml
   # В docker-compose.dev.yml
   environment:
     install: true
   ```

3. **После установки убрать переменную:**
   ```yaml
   # Убрать install: true из environment
   ```

4. **Перезапуск:** `./dev.sh restart`

## Коммиты с исправлениями
- `6d2060fc` - Основные исправления логики
- `fd20ca98` - Документация

**Автор исправлений:** AI Assistant  
**Дата:** 26 сентября 2025
