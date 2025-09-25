#!/bin/bash

# Скрипт быстрого обновления Herzen Core на сервере
# Использование: ./update-server.sh [server_user@server_ip] [deploy_path]

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Параметры
SERVER=${1:-"user@your-server.com"}
DEPLOY_PATH=${2:-"/opt/herzen/core"}

echo -e "${GREEN}🔄 Обновляем Herzen Core на сервере${NC}"
echo -e "${YELLOW}Сервер: $SERVER${NC}"
echo -e "${YELLOW}Путь: $DEPLOY_PATH${NC}"

# Проверяем подключение к серверу
echo -e "${YELLOW}📡 Проверяем подключение к серверу...${NC}"
ssh -o ConnectTimeout=10 $SERVER "echo 'Подключение успешно'"

# Обновляем код на сервере
echo -e "${YELLOW}📦 Обновляем код на сервере...${NC}"
ssh $SERVER "
  cd $DEPLOY_PATH
  
  # Сохраняем текущую ветку
  CURRENT_BRANCH=\$(git branch --show-current)
  echo \"Текущая ветка: \$CURRENT_BRANCH\"
  
  # Получаем обновления
  git fetch origin
  git pull origin \$CURRENT_BRANCH
  
  echo 'Код обновлен успешно'
"

# Пересобираем и перезапускаем контейнеры
echo -e "${YELLOW}🔨 Пересобираем и перезапускаем контейнеры...${NC}"
ssh $SERVER "
  cd $DEPLOY_PATH
  
  # Пересобираем образы
  docker-compose -f docker-compose.prod.yml build --no-cache
  
  # Перезапускаем сервисы
  docker-compose -f docker-compose.prod.yml up -d
  
  echo 'Контейнеры перезапущены успешно'
"

# Проверяем статус
echo -e "${YELLOW}🔍 Проверяем статус сервисов...${NC}"
ssh $SERVER "cd $DEPLOY_PATH && docker-compose -f docker-compose.prod.yml ps"

echo -e "${GREEN}✅ Обновление завершено!${NC}"
echo -e "${BLUE}🌐 Web UI: http://$(echo $SERVER | cut -d'@' -f2)${NC}"
