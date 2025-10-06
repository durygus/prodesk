#!/bin/bash

# Тестовый скрипт для проверки подключения к серверу
# Использование: ./test-server-connection.sh [server_user@server_ip]

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Параметры
SERVER=${1:-"user@your-server.com"}
DEPLOY_PATH="/opt/herzen/core"

echo -e "${GREEN}🔍 Тестируем подключение к серверу${NC}"
echo -e "${YELLOW}Сервер: $SERVER${NC}"
echo -e "${YELLOW}Путь развертывания: $DEPLOY_PATH${NC}"

# Проверяем подключение к серверу
echo -e "${YELLOW}📡 Проверяем подключение к серверу...${NC}"
if ! ssh -o ConnectTimeout=10 $SERVER "echo 'Подключение успешно'"; then
  echo -e "${RED}❌ Не удается подключиться к серверу${NC}"
  exit 1
fi

# Проверяем SSH ключ
echo -e "${YELLOW}🔑 Проверяем SSH ключ...${NC}"
if ! ssh -o BatchMode=yes -o ConnectTimeout=10 $SERVER "echo 'SSH ключ работает'" 2>/dev/null; then
  echo -e "${RED}❌ SSH ключ не настроен или не работает без пароля${NC}"
  exit 1
fi
echo -e "${GREEN}✅ SSH ключ работает корректно${NC}"

# Проверяем системную информацию
echo -e "${YELLOW}💻 Системная информация:${NC}"
ssh $SERVER "
  echo 'OS: \$(lsb_release -d | cut -f2)'
  echo 'Kernel: \$(uname -r)'
  echo 'User: \$(whoami)'
  echo 'Home: \$HOME'
  echo 'PWD: \$(pwd)'
"

# Проверяем установленные пакеты
echo -e "${YELLOW}📦 Проверяем установленные пакеты:${NC}"
ssh $SERVER "
  echo 'Git: \$(git --version 2>/dev/null || echo \"не установлен\")'
  echo 'Docker: \$(docker --version 2>/dev/null || echo \"не установлен\")'
  echo 'Curl: \$(curl --version 2>/dev/null | head -1 || echo \"не установлен\")'
"

# Проверяем права доступа к целевой директории
echo -e "${YELLOW}📁 Проверяем права доступа к $DEPLOY_PATH:${NC}"
ssh $SERVER "
  if [ -d \"$DEPLOY_PATH\" ]; then
    echo 'Директория существует'
    ls -la $DEPLOY_PATH
  else
    echo 'Директория не существует'
    echo 'Проверяем родительскую директорию:'
    ls -la \$(dirname $DEPLOY_PATH) 2>/dev/null || echo 'Родительская директория не существует'
  fi
"

# Проверяем подключение к GitHub
echo -e "${YELLOW}🌐 Проверяем подключение к GitHub:${NC}"
ssh $SERVER "
  if curl -s --connect-timeout 10 https://github.com > /dev/null; then
    echo '✅ Подключение к GitHub работает'
  else
    echo '❌ Нет подключения к GitHub'
  fi
"

# Тестируем клонирование в временную директорию
echo -e "${YELLOW}🧪 Тестируем клонирование в временную директорию:${NC}"
ssh $SERVER "
  TEMP_DIR=\"/tmp/test-git-clone-\$(date +%s)\"
  echo 'Клонируем в: \$TEMP_DIR'
  
  if git clone https://github.com/durygus/prodesk.git \$TEMP_DIR; then
    echo '✅ Клонирование успешно'
    echo 'Содержимое:'
    ls -la \$TEMP_DIR | head -10
    rm -rf \$TEMP_DIR
  else
    echo '❌ Ошибка при клонировании'
  fi
"

echo -e "${GREEN}✅ Тестирование завершено${NC}"
