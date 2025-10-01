# 🗄️ Настройка MongoDB для Herzen Core

## 📁 Расположение данных

Данные MongoDB хранятся в папке проекта:
```
core/
├── data/
│   └── mongo/          # Данные MongoDB
├── logs/
│   ├── mongodb.log     # Логи MongoDB
│   └── mongodb.pid     # PID файл
└── start-mongo.sh      # Скрипт управления MongoDB
```

## 🚀 Способы запуска MongoDB

### 1. **Через скрипт (Рекомендуется)**

```bash
cd /Users/vadim/Code/herzen/core

# Запустить MongoDB
./start-mongo.sh start

# Проверить статус
./start-mongo.sh status

# Остановить MongoDB
./start-mongo.sh stop

# Перезапустить MongoDB
./start-mongo.sh restart
```

### 2. **Ручной запуск**

```bash
cd /Users/vadim/Code/herzen/core

# Создать директории
mkdir -p data/mongo logs

# Запустить MongoDB
mongod --dbpath ./data/mongo --port 27017 --logpath ./logs/mongodb.log &

# Остановить (найти PID и убить)
ps aux | grep mongod
kill <PID>
```

### 3. **Через Docker (альтернатива)**

```bash
cd /Users/vadim/Code/herzen/core

# Запустить только MongoDB в Docker
docker-compose -f docker-compose.dev.yml up mongo -d

# Остановить
docker-compose -f docker-compose.dev.yml down
```

## ⚙️ Конфигурация

### Локальный запуск (config.yml):
```yaml
mongo:
  host: localhost
  port: '27017'
  username: ''
  password: ''
  database: herzen
```

### Docker запуск (environment):
```yaml
TD_MONGODB_SERVER: mongo
TD_MONGODB_PORT: 27017
TD_MONGODB_DATABASE: herzen
TD_MONGODB_URI: mongodb://mongo:27017/herzen
```

## 🔧 Управление данными

### Просмотр данных:
```bash
# Подключиться к MongoDB
mongo --port 27017

# В MongoDB shell:
use herzen
show collections
db.accounts.find()
```

### Очистка данных:
```bash
# Остановить MongoDB
./start-mongo.sh stop

# Удалить данные
rm -rf data/mongo/*

# Запустить заново
./start-mongo.sh start
```

### Backup данных:
```bash
# Создать backup
mongodump --port 27017 --db herzen --out ./backups/$(date +%Y%m%d_%H%M%S)

# Восстановить из backup
mongorestore --port 27017 --db herzen ./backups/YYYYMMDD_HHMMSS/herzen
```

## 🐛 Устранение проблем

### MongoDB не запускается:
```bash
# Проверить, не занят ли порт
lsof -i :27017

# Убить процесс на порту
kill -9 $(lsof -ti:27017)

# Проверить права на папку данных
ls -la data/mongo/
chmod 755 data/mongo/
```

### Ошибки подключения:
```bash
# Проверить статус
./start-mongo.sh status

# Проверить логи
tail -f logs/mongodb.log

# Проверить подключение
mongo --port 27017 --eval "db.runCommand('ping')"
```

## 📊 Мониторинг

### Проверка статуса:
```bash
./start-mongo.sh status
```

### Просмотр логов:
```bash
tail -f logs/mongodb.log
```

### Проверка использования диска:
```bash
du -sh data/mongo/
```

## 🎯 Рекомендации

1. **Для разработки**: используйте `./start-mongo.sh start`
2. **Для продакшена**: используйте Docker с внешними volumes
3. **Регулярно делайте backup**: данные в `data/mongo/` важны
4. **Мониторьте логи**: `logs/mongodb.log` содержит важную информацию
5. **Не коммитьте данные**: папка `data/mongo/` в `.gitignore`

