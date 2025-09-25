# Herzen - Docker Development & Deployment

## 🚀 Быстрый старт

### Разработка на локальной машине:

```bash
# 1. Запустить все сервисы для разработки
./dev.sh start

# 2. Открыть в браузере
open http://localhost:8118

# 3. Просмотреть логи
./dev.sh logs

# 4. Остановить сервисы
./dev.sh stop
```

### Развертывание на Ubuntu сервере:

```bash
# 1. Развернуть на сервере
./deploy-server.sh user@your-server.com /opt/herzen

# 2. На сервере запустить
sudo systemctl start herzen
sudo systemctl enable herzen

# 3. Открыть в браузере
http://your-server-ip
```

## 📁 Структура файлов

```
prodesk/
├── Dockerfile              # Production образ
├── Dockerfile.dev          # Development образ с hot reload
├── docker-compose.yml      # Production конфигурация
├── docker-compose.dev.yml  # Development конфигурация
├── dev.sh                  # Скрипт для разработки
├── deploy-server.sh        # Скрипт развертывания на сервер
└── mongo-init.js          # Инициализация MongoDB
```

## 🛠️ Команды разработки

```bash
./dev.sh start     # Запустить все сервисы
./dev.sh stop      # Остановить все сервисы
./dev.sh restart   # Перезапустить все сервисы
./dev.sh logs      # Показать логи
./dev.sh shell     # Подключиться к контейнеру
./dev.sh clean     # Очистить все данные
./dev.sh build     # Пересобрать образы
```

## 🔧 Настройка

### Переменные окружения:

```bash
# Development
NODE_ENV=development
PORT=8118

# Production
NODE_ENV=production
PORT=8118
```

### Порты:

- **8118** - Herzen приложение
- **27017** - MongoDB
- **6379** - Redis

## 📊 Мониторинг

### Логи:
```bash
# Development
./dev.sh logs

# Production (на сервере)
docker-compose -f docker-compose.prod.yml logs -f
```

### Статус:
```bash
# Development
docker-compose -f docker-compose.dev.yml ps

# Production (на сервере)
docker-compose -f docker-compose.prod.yml ps
```

## 🔄 Обновление

### Development:
```bash
# Остановить, обновить код, запустить
./dev.sh stop
git pull
./dev.sh start
```

### Production (на сервере):
```bash
cd /opt/herzen
git pull
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

## 🐛 Отладка

### Подключиться к контейнеру:
```bash
# Development
./dev.sh shell

# Production
docker exec -it herzen-app sh
```

### Проверить подключение к БД:
```bash
# MongoDB
docker exec -it herzen-mongo mongosh

# Redis
docker exec -it herzen-redis redis-cli
```

## 📝 Примечания

- **Hot reload** работает только в development режиме
- **Данные** сохраняются в Docker volumes
- **Логи** доступны через `docker-compose logs`
- **Конфигурация** в `config.yml` (автоматически создается)
