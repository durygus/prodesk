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
SERVER_DATA_PATH="/opt/herzen/data"
LOCAL_DATA_PATH="./data"

case "${1:-help}" in
  to-server)
    echo -e "${GREEN}📤 Синхронизируем данные с локальной машины на сервер...${NC}"
    
    # Создаем директории на сервере
    ssh $SERVER "sudo mkdir -p $SERVER_DATA_PATH/mongo $SERVER_DATA_PATH/app $SERVER_DATA_PATH/logs $SERVER_DATA_PATH/uploads"
    
    # Синхронизируем MongoDB данные
    echo -e "${YELLOW}🗄️  Синхронизируем MongoDB...${NC}"
    rsync -avz --delete $LOCAL_DATA_PATH/mongo/ $SERVER:$SERVER_DATA_PATH/mongo/
    
    # Синхронизируем данные приложения
    echo -e "${YELLOW}📱 Синхронизируем данные приложения...${NC}"
    rsync -avz --delete $LOCAL_DATA_PATH/app/ $SERVER:$SERVER_DATA_PATH/app/ 2>/dev/null || true
    
    echo -e "${GREEN}✅ Синхронизация завершена!${NC}"
    ;;
    
  from-server)
    echo -e "${GREEN}📥 Синхронизируем данные с сервера на локальную машину...${NC}"
    
    # Создаем локальные директории
    mkdir -p $LOCAL_DATA_PATH/mongo $LOCAL_DATA_PATH/app $LOCAL_DATA_PATH/logs $LOCAL_DATA_PATH/uploads
    
    # Синхронизируем MongoDB данные
    echo -e "${YELLOW}🗄️  Синхронизируем MongoDB...${NC}"
    rsync -avz --delete $SERVER:$SERVER_DATA_PATH/mongo/ $LOCAL_DATA_PATH/mongo/
    
    # Синхронизируем данные приложения
    echo -e "${YELLOW}📱 Синхронизируем данные приложения...${NC}"
    rsync -avz --delete $SERVER:$SERVER_DATA_PATH/app/ $LOCAL_DATA_PATH/app/ 2>/dev/null || true
    
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
    ssh $SERVER "sudo tar -czf /tmp/server-data.tar.gz -C $SERVER_DATA_PATH ."
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
      ssh $SERVER "sudo tar -xzf /tmp/server-data.tar.gz -C $SERVER_DATA_PATH && rm /tmp/server-data.tar.gz"
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
