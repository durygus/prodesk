#!/bin/bash

# Скрипт для запуска MongoDB с данными в папке проекта
# Использование: ./start-mongo.sh [start|stop|status|restart]

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Конфигурация
MONGO_DBPATH="./data/mongo"
MONGO_PORT="27017"
MONGO_LOGPATH="./logs/mongodb.log"
MONGO_PIDFILE="./logs/mongodb.pid"

# Создаем необходимые директории
mkdir -p data/mongo
mkdir -p logs

case "${1:-start}" in
  start)
    echo -e "${GREEN}🚀 Запускаем MongoDB...${NC}"
    
    # Проверяем, не запущен ли уже MongoDB
    if pgrep -f "mongod.*--dbpath.*$MONGO_DBPATH" > /dev/null; then
      echo -e "${YELLOW}⚠️  MongoDB уже запущен!${NC}"
      exit 0
    fi
    
    # Запускаем MongoDB в фоновом режиме
    mongod --dbpath "$MONGO_DBPATH" --port "$MONGO_PORT" --logpath "$MONGO_LOGPATH" &
    MONGO_PID=$!
    
    # Сохраняем PID
    echo $MONGO_PID > "$MONGO_PIDFILE"
    
    # Ждем немного и проверяем
    sleep 2
    if kill -0 $MONGO_PID 2>/dev/null; then
      echo -e "${GREEN}✅ MongoDB успешно запущен!${NC}"
      echo -e "${BLUE}📁 Данные: $MONGO_DBPATH${NC}"
      echo -e "${BLUE}🔌 Порт: $MONGO_PORT${NC}"
      echo -e "${BLUE}📋 Логи: $MONGO_LOGPATH${NC}"
      echo -e "${BLUE}🆔 PID: $MONGO_PID${NC}"
    else
      echo -e "${RED}❌ Ошибка запуска MongoDB!${NC}"
      exit 1
    fi
    ;;
  
  stop)
    echo -e "${YELLOW}⏹️  Останавливаем MongoDB...${NC}"
    
    # Ищем процесс MongoDB
    MONGO_PID=$(pgrep -f "mongod.*--dbpath.*$MONGO_DBPATH" || true)
    
    if [ -n "$MONGO_PID" ]; then
      kill $MONGO_PID
      sleep 2
      
      # Проверяем, что процесс остановлен
      if ! kill -0 $MONGO_PID 2>/dev/null; then
        echo -e "${GREEN}✅ MongoDB остановлен!${NC}"
        rm -f "$MONGO_PIDFILE"
      else
        echo -e "${RED}❌ Не удалось остановить MongoDB!${NC}"
        exit 1
      fi
    else
      echo -e "${YELLOW}⚠️  MongoDB не запущен${NC}"
    fi
    ;;
  
  restart)
    echo -e "${YELLOW}🔄 Перезапускаем MongoDB...${NC}"
    $0 stop
    sleep 1
    $0 start
    ;;
  
  status)
    echo -e "${BLUE}📊 Статус MongoDB:${NC}"
    
    MONGO_PID=$(pgrep -f "mongod.*--dbpath.*$MONGO_DBPATH" || true)
    
    if [ -n "$MONGO_PID" ]; then
      echo -e "${GREEN}✅ MongoDB запущен${NC}"
      echo -e "${BLUE}🆔 PID: $MONGO_PID${NC}"
      echo -e "${BLUE}📁 Данные: $MONGO_DBPATH${NC}"
      echo -e "${BLUE}🔌 Порт: $MONGO_PORT${NC}"
      
      # Проверяем подключение
      if mongo --port $MONGO_PORT --eval "db.runCommand('ping')" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Подключение работает${NC}"
      else
        echo -e "${YELLOW}⚠️  Подключение недоступно${NC}"
      fi
    else
      echo -e "${RED}❌ MongoDB не запущен${NC}"
    fi
    ;;
  
  *)
    echo -e "${YELLOW}Использование: $0 [start|stop|status|restart]${NC}"
    echo ""
    echo "Команды:"
    echo "  start   - Запустить MongoDB"
    echo "  stop    - Остановить MongoDB"
    echo "  restart - Перезапустить MongoDB"
    echo "  status  - Показать статус MongoDB"
    exit 1
    ;;
esac

