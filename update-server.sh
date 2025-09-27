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
  
  # Останавливаем контейнеры для безопасного обновления
  echo 'Останавливаем контейнеры...'
  docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
  
  # Принудительно очищаем MongoDB папку через Docker (избегаем проблем с правами)
  echo 'Очищаем MongoDB папку через Docker...'
  docker run --rm -v \$(pwd)/data/mongo:/data alpine sh -c 'rm -rf /data/* /data/.* 2>/dev/null || true' 2>/dev/null || true
  
  # Принудительно сбрасываем все локальные изменения
  echo 'Сбрасываем локальные изменения...'
  git reset --hard HEAD 2>/dev/null || true
  git clean -fd 2>/dev/null || true
  
  # Исключаем MongoDB данные из git (они создаются при установке)
  echo 'Исключаем MongoDB данные из git...'
  echo 'data/mongo/' >> .gitignore 2>/dev/null || true
  git rm -r --cached data/mongo/ 2>/dev/null || true
  
  # Получаем обновления
  echo 'Получаем обновления...'
  git fetch origin
  git reset --hard origin/\$CURRENT_BRANCH
  
  echo 'Код обновлен успешно'
"

# Пересобираем и перезапускаем контейнеры
echo -e "${YELLOW}🔨 Пересобираем и перезапускаем контейнеры...${NC}"
ssh $SERVER "
  cd $DEPLOY_PATH
  
  # Проверяем место на диске
  echo 'Проверяем место на диске...'
  df -h / | tail -1
  
  # Очищаем Docker кэш для освобождения места
  echo 'Очищаем Docker кэш...'
  docker system prune -f 2>/dev/null || true
  docker volume prune -f 2>/dev/null || true
  
  # Пересобираем образы
  echo 'Пересобираем образы...'
  docker-compose -f docker-compose.prod.yml build --no-cache herzen-core
  
  # Перезапускаем сервисы
  echo 'Запускаем сервисы...'
  timeout 60 docker-compose -f docker-compose.prod.yml up -d || echo 'Таймаут запуска, но продолжаем...'
  
  echo 'Контейнеры запущены'
"

# Ждем немного и проверяем статус
echo -e "${YELLOW}⏳ Ждем запуска контейнеров (15 секунд)...${NC}"
sleep 15

# Проверяем статус
echo -e "${YELLOW}🔍 Проверяем статус сервисов...${NC}"
ssh $SERVER "cd $DEPLOY_PATH && docker-compose -f docker-compose.prod.yml ps"

# Проверяем версию кода
echo -e "${YELLOW}📋 Проверяем версию кода...${NC}"
ssh $SERVER "cd $DEPLOY_PATH && git log --oneline -3"

echo -e "${GREEN}✅ Обновление завершено!${NC}"
echo -e "${BLUE}🌐 Web UI: http://$(echo $SERVER | cut -d'@' -f2)${NC}"
