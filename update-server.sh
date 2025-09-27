#!/bin/bash

# Скрипт быстрого обновления Herzen Core на сервере
# Использование: ./update-server.sh [server_user@server_ip] [deploy_path]

# set -e  # Отключено для предотвращения завершения при ошибках SSH

# Защита от множественного запуска
LOCKFILE="/tmp/update-server-$$.lock"
if ! mkdir "$LOCKFILE" 2>/dev/null; then
    echo "❌ Скрипт уже запущен! Дождитесь завершения или удалите $LOCKFILE"
    exit 1
fi

# Очистка при выходе
trap 'rm -rf "$LOCKFILE"' EXIT

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

# Останавливаем сервисы и очищаем конфликты
echo -e "${BLUE}🛑 Останавливаем сервисы...${NC}"
if ! ssh -o ConnectTimeout=15 $SERVER "cd $DEPLOY_PATH && docker-compose -f docker-compose.prod.yml down 2>/dev/null || true"; then
    echo -e "${YELLOW}⚠️ Предупреждение: не удалось остановить сервисы${NC}"
fi

echo -e "${BLUE}🧹 Очищаем конфликтующие процессы...${NC}"
if ! ssh -o ConnectTimeout=15 $SERVER "pkill -f 'docker-compose.*build.*herzen-core' 2>/dev/null || true"; then
    echo -e "${YELLOW}⚠️ Предупреждение: не удалось очистить процессы${NC}"
fi

# Очищаем MongoDB данные
echo -e "${BLUE}🗄️ Очищаем MongoDB данные...${NC}"
if ! ssh -o ConnectTimeout=15 $SERVER "cd $DEPLOY_PATH && docker run --rm -v \$(pwd)/data/mongo:/data alpine sh -c 'rm -rf /data/* /data/.* 2>/dev/null || true' 2>/dev/null || true"; then
    echo -e "${YELLOW}⚠️ Предупреждение: не удалось очистить MongoDB данные${NC}"
fi

# Обновляем код
echo -e "${BLUE}📥 Обновляем код...${NC}"
ssh -o ConnectTimeout=30 $SERVER "
  cd $DEPLOY_PATH
  CURRENT_BRANCH=\$(git branch --show-current)
  echo \"Текущая ветка: \$CURRENT_BRANCH\"
  git reset --hard HEAD 2>/dev/null || true
  git clean -fd 2>/dev/null || true
  echo 'data/mongo/' >> .gitignore 2>/dev/null || true
  git rm -r --cached data/mongo/ 2>/dev/null || true
  git fetch origin
  git reset --hard origin/\$CURRENT_BRANCH
  echo 'Код обновлен успешно'
"

# Пересобираем и перезапускаем контейнеры
echo -e "${YELLOW}🔨 Пересобираем и перезапускаем контейнеры...${NC}"

# Проверяем место на диске и очищаем кэш
echo -e "${BLUE}💾 Проверяем место на диске...${NC}"
ssh -o BatchMode=yes -o ConnectTimeout=15 $SERVER "cd $DEPLOY_PATH && df -h / | tail -1"

echo -e "${BLUE}🧹 Очищаем Docker кэш...${NC}"
ssh -o ConnectTimeout=30 $SERVER "cd $DEPLOY_PATH && docker system prune -f 2>/dev/null || true && docker volume prune -f 2>/dev/null || true"

# Пересобираем образы
echo -e "${BLUE}🔨 Пересобираем образы...${NC}"
ssh -o ConnectTimeout=300 $SERVER "cd $DEPLOY_PATH && docker-compose -f docker-compose.prod.yml build --no-cache herzen-core"

# Запускаем сервисы
echo -e "${BLUE}🚀 Запускаем сервисы...${NC}"
ssh -o ConnectTimeout=60 $SERVER "cd $DEPLOY_PATH && docker-compose -f docker-compose.prod.yml up -d --remove-orphans"

# Ждем немного и проверяем статус
echo -e "${YELLOW}⏳ Ждем запуска контейнеров (15 секунд)...${NC}"
sleep 15

# Проверяем статус
echo -e "${YELLOW}🔍 Проверяем статус сервисов...${NC}"
ssh -o ConnectTimeout=10 $SERVER "cd $DEPLOY_PATH && docker-compose -f docker-compose.prod.yml ps"

# Проверяем версию кода
echo -e "${YELLOW}📋 Проверяем версию кода...${NC}"
ssh -o ConnectTimeout=10 $SERVER "cd $DEPLOY_PATH && git log --oneline -3"

echo -e "${GREEN}✅ Обновление завершено!${NC}"
echo -e "${BLUE}🌐 Web UI: http://$(echo $SERVER | cut -d'@' -f2)${NC}"
