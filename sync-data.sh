#!/bin/bash

# Скрипт для синхронизации данных между разработкой и продакшеном
# Использование: ./sync-data.sh [to-server|from-server|backup|restore]

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Параметры
SERVER=${SERVER:-"durygus@188.130.234.42"}
SERVER_PROJECT_PATH="/opt/herzen/core"
LOCAL_DATA_PATH="./data"
LOCAL_MONGO_PATH="./data/mongodb"

case "${1:-help}" in
  to-server)
    echo -e "${GREEN}📤 Синхронизируем данные с локальной машины на сервер...${NC}"
    
    # Создаем директории на сервере
    ssh $SERVER "mkdir -p $SERVER_PROJECT_PATH/data/mongodb $SERVER_PROJECT_PATH/data/app $SERVER_PROJECT_PATH/logs $SERVER_PROJECT_PATH/public/uploads"
    
    # Останавливаем MongoDB для безопасной синхронизации
    echo -e "${YELLOW}⏸️  Останавливаем MongoDB для безопасной синхронизации...${NC}"
    ssh $SERVER "cd $SERVER_PROJECT_PATH && docker stop herzen-mongo" 2>/dev/null || true
    
    # Синхронизируем MongoDB данные
    echo -e "${YELLOW}🗄️  Синхронизируем MongoDB...${NC}"
    
    # Универсальное решение: используем временный Docker контейнер для управления правами
    echo -e "${BLUE}🔧 Очищаем папку MongoDB через Docker...${NC}"
    ssh $SERVER "cd $SERVER_PROJECT_PATH && docker run --rm -v \$(pwd)/data/mongodb:/data alpine sh -c 'rm -rf /data/* /data/.* 2>/dev/null || true; chown 1000:1000 /data; chmod 755 /data'"
    
    rsync -avz --delete $LOCAL_MONGO_PATH/ $SERVER:$SERVER_PROJECT_PATH/data/mongodb/
    
    # Устанавливаем правильные права для MongoDB через Docker контейнер
    echo -e "${BLUE}🔧 Устанавливаем права MongoDB через Docker...${NC}"
    ssh $SERVER "cd $SERVER_PROJECT_PATH && docker run --rm -v \$(pwd)/data/mongodb:/data alpine sh -c 'chown -R 999:999 /data'" 2>/dev/null || true
    
    # Запускаем MongoDB обратно
    echo -e "${YELLOW}▶️  Запускаем MongoDB...${NC}"
    ssh $SERVER "cd $SERVER_PROJECT_PATH && docker start herzen-mongo"
    
    # Ждем запуска MongoDB
    echo -e "${YELLOW}⏳ Ждем запуска MongoDB (10 секунд)...${NC}"
    sleep 10
    
    # Синхронизируем данные приложения
    echo -e "${YELLOW}📱 Синхронизируем данные приложения...${NC}"
    rsync -avz --delete $LOCAL_DATA_PATH/app/ $SERVER:$SERVER_PROJECT_PATH/data/app/ 2>/dev/null || true
    
    # Синхронизируем логи
    echo -e "${YELLOW}📋 Синхронизируем логи...${NC}"
    rsync -avz --delete ./logs/ $SERVER:$SERVER_PROJECT_PATH/logs/ 2>/dev/null || true
    
    # Синхронизируем загрузки
    echo -e "${YELLOW}📁 Синхронизируем загрузки...${NC}"
    rsync -avz --delete ./public/uploads/ $SERVER:$SERVER_PROJECT_PATH/public/uploads/ 2>/dev/null || true
    
    echo -e "${GREEN}✅ Синхронизация завершена!${NC}"
    ;;
    
  from-server)
    echo -e "${GREEN}📥 Синхронизируем данные с сервера на локальную машину...${NC}"
    
    # Создаем локальные директории
    mkdir -p $LOCAL_MONGO_PATH $LOCAL_DATA_PATH/app logs public/uploads
    
    # Останавливаем MongoDB на сервере для безопасного чтения
    echo -e "${YELLOW}⏸️  Останавливаем MongoDB на сервере для безопасного чтения...${NC}"
    ssh $SERVER "cd $SERVER_PROJECT_PATH && docker stop herzen-mongo" 2>/dev/null || true
    
    # Синхронизируем MongoDB данные
    echo -e "${YELLOW}🗄️  Синхронизируем MongoDB...${NC}"
    
    # Универсальное решение: делаем файлы читаемыми через Docker
    echo -e "${BLUE}🔧 Делаем файлы читаемыми через Docker...${NC}"
    ssh $SERVER "cd $SERVER_PROJECT_PATH && docker run --rm -v \$(pwd)/data/mongodb:/data alpine sh -c 'chmod -R 644 /data/*; chmod 755 /data/*/'" 2>/dev/null || true
    
    # Создаём локальную папку если не существует
    mkdir -p $LOCAL_MONGO_PATH/
    
    rsync -avz --delete $SERVER:$SERVER_PROJECT_PATH/data/mongodb/ $LOCAL_MONGO_PATH/
    
    # Возвращаем правильные права для MongoDB через Docker
    echo -e "${BLUE}🔧 Возвращаем права MongoDB через Docker...${NC}"
    ssh $SERVER "cd $SERVER_PROJECT_PATH && docker run --rm -v \$(pwd)/data/mongodb:/data alpine sh -c 'chown -R 999:999 /data'" 2>/dev/null || true
    
    # Запускаем MongoDB на сервере обратно
    echo -e "${YELLOW}▶️  Запускаем MongoDB на сервере...${NC}"
    ssh $SERVER "cd $SERVER_PROJECT_PATH && docker start herzen-mongo"
    
    # Ждем запуска MongoDB
    echo -e "${YELLOW}⏳ Ждем запуска MongoDB (10 секунд)...${NC}"
    sleep 10
    
    # Синхронизируем данные приложения (безопасно)
    echo -e "${YELLOW}📱 Синхронизируем данные приложения...${NC}"
    rsync -avz --delete $SERVER:$SERVER_PROJECT_PATH/data/app/ $LOCAL_DATA_PATH/app/ 2>/dev/null || true
    
    # Синхронизируем логи (безопасно)
    echo -e "${YELLOW}📋 Синхронизируем логи...${NC}"
    rsync -avz --delete $SERVER:$SERVER_PROJECT_PATH/logs/ ./logs/ 2>/dev/null || true
    
    # Синхронизируем загрузки (безопасно)
    echo -e "${YELLOW}📁 Синхронизируем загрузки...${NC}"
    rsync -avz --delete $SERVER:$SERVER_PROJECT_PATH/public/uploads/ ./public/uploads/ 2>/dev/null || true
    
    echo -e "${GREEN}✅ Синхронизация завершена!${NC}"
    ;;
    
  backup)
    echo -e "${GREEN}💾 Создаем резервную копию данных...${NC}"
    
    BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p $BACKUP_DIR
    
    # Архивируем локальные данные
    echo -e "${YELLOW}📦 Архивируем локальные данные...${NC}"
    tar -czf $BACKUP_DIR/local-data.tar.gz -C $LOCAL_DATA_PATH .
    
    # Архивируем данные с сервера
    echo -e "${YELLOW}📦 Архивируем данные с сервера...${NC}"
    ssh $SERVER "tar -czf /tmp/server-data.tar.gz -C $SERVER_PROJECT_PATH data logs public/uploads"
    scp $SERVER:/tmp/server-data.tar.gz $BACKUP_DIR/server-data.tar.gz
    ssh $SERVER "rm /tmp/server-data.tar.gz"
    
    echo -e "${GREEN}✅ Резервная копия создана в $BACKUP_DIR${NC}"
    ;;
    
  restore)
    BACKUP_DIR=${2:-"./backups/latest"}
    
    if [ ! -d "$BACKUP_DIR" ]; then
      echo -e "${RED}❌ Директория резервной копии не найдена: $BACKUP_DIR${NC}"
      exit 1
    fi
    
    echo -e "${GREEN}🔄 Восстанавливаем данные из $BACKUP_DIR...${NC}"
    
    # Восстанавливаем локальные данные
    if [ -f "$BACKUP_DIR/local-data.tar.gz" ]; then
      echo -e "${YELLOW}📦 Восстанавливаем локальные данные...${NC}"
      tar -xzf $BACKUP_DIR/local-data.tar.gz -C $LOCAL_DATA_PATH
    fi
    
    # Восстанавливаем данные на сервере
    if [ -f "$BACKUP_DIR/server-data.tar.gz" ]; then
      echo -e "${YELLOW}📦 Восстанавливаем данные на сервере...${NC}"
      scp $BACKUP_DIR/server-data.tar.gz $SERVER:/tmp/server-data.tar.gz
      ssh $SERVER "tar -xzf /tmp/server-data.tar.gz -C $SERVER_PROJECT_PATH && rm /tmp/server-data.tar.gz"
    fi
    
    echo -e "${GREEN}✅ Восстановление завершено!${NC}"
    ;;
    
  help|*)
    echo -e "${BLUE}Использование: $0 [команда]${NC}"
    echo ""
    echo "Команды:"
    echo "  to-server    - Синхронизировать данные с локальной машины на сервер"
    echo "  from-server  - Синхронизировать данные с сервера на локальную машину"
    echo "  backup       - Создать резервную копию данных"
    echo "  restore [dir] - Восстановить данные из резервной копии"
    echo ""
    echo "Переменные окружения:"
    echo "  SERVER=user@host  - Адрес сервера (по умолчанию: durygus@188.130.234.42)"
    echo ""
    echo "Примеры:"
    echo "  $0 to-server"
    echo "  $0 from-server"
    echo "  $0 backup"
    echo "  $0 restore ./backups/20241225_143000"
    ;;
esac
