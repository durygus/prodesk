#!/bin/bash

# Улучшенный скрипт развертывания Herzen Core на Ubuntu сервере с диагностикой
# Использование: ./deploy-server-debug.sh [server_user@server_ip] [deploy_path]

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
APP_NAME="herzen"

echo -e "${GREEN}🚀 Развертываем Herzen Core на Ubuntu сервере (DEBUG MODE)${NC}"
echo -e "${YELLOW}Сервер: $SERVER${NC}"
echo -e "${YELLOW}Путь развертывания: $DEPLOY_PATH${NC}"

# Функция для выполнения команд с логированием
execute_remote() {
  local description="$1"
  local command="$2"
  
  echo -e "${YELLOW}🔄 $description${NC}"
  echo -e "${BLUE}Команда: $command${NC}"
  
  if ssh $SERVER "$command"; then
    echo -e "${GREEN}✅ $description - успешно${NC}"
  else
    echo -e "${RED}❌ $description - ошибка${NC}"
    return 1
  fi
}

# Проверяем подключение к серверу
echo -e "${YELLOW}📡 Проверяем подключение к серверу...${NC}"
if ! ssh -o ConnectTimeout=10 $SERVER "echo 'Подключение успешно'"; then
  echo -e "${RED}❌ Не удается подключиться к серверу${NC}"
  exit 1
fi

# Проверяем SSH подключение
echo -e "${YELLOW}🔑 Проверяем SSH подключение...${NC}"
ssh -o ConnectTimeout=10 $SERVER "echo 'SSH подключение работает'"
echo -e "${GREEN}✅ SSH подключение работает корректно${NC}"

# Запрашиваем пароль sudo
echo -e "${YELLOW}🔐 Введите пароль sudo для пользователя на сервере:${NC}"
read -s SUDO_PASSWORD
echo ""

# Проверяем пароль sudo
echo -e "${YELLOW}🔍 Проверяем пароль sudo...${NC}"
if ! echo "$SUDO_PASSWORD" | ssh $SERVER "sudo -S echo 'Sudo пароль работает'" 2>/dev/null; then
  echo -e "${RED}❌ Неверный пароль sudo${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Sudo пароль работает корректно${NC}"

# Проверяем системную информацию
echo -e "${YELLOW}💻 Системная информация:${NC}"
execute_remote "Получение системной информации" "
  echo 'OS: \$(lsb_release -d | cut -f2)'
  echo 'Kernel: \$(uname -r)'
  echo 'User: \$(whoami)'
  echo 'Home: \$HOME'
  echo 'PWD: \$(pwd)'
  echo 'Disk space:'
  df -h /
"

# Проверяем и устанавливаем необходимые пакеты
echo -e "${YELLOW}📦 Проверяем и устанавливаем пакеты...${NC}"
execute_remote "Обновление системы" "
  echo '$SUDO_PASSWORD' | sudo -S DEBIAN_FRONTEND=noninteractive apt update
"

execute_remote "Установка Git" "
  if ! command -v git &> /dev/null; then
    echo 'Git не установлен, устанавливаем...'
    echo '$SUDO_PASSWORD' | sudo -S DEBIAN_FRONTEND=noninteractive apt install -y git
  else
    echo 'Git уже установлен: \$(git --version)'
  fi
"

execute_remote "Установка Curl" "
  if ! command -v curl &> /dev/null; then
    echo 'Curl не установлен, устанавливаем...'
    echo '$SUDO_PASSWORD' | sudo -S DEBIAN_FRONTEND=noninteractive apt install -y curl
  else
    echo 'Curl уже установлен: \$(curl --version | head -1)'
  fi
"

# Устанавливаем Docker
echo -e "${YELLOW}🐳 Устанавливаем Docker...${NC}"
execute_remote "Установка Docker" "
  if ! command -v docker &> /dev/null; then
    echo 'Docker не установлен, устанавливаем...'
    curl -fsSL https://get.docker.com -o get-docker.sh
    echo '$SUDO_PASSWORD' | sudo -S sh get-docker.sh
    echo '$SUDO_PASSWORD' | sudo -S usermod -aG docker \$(whoami)
    rm -f get-docker.sh
  else
    echo 'Docker уже установлен: \$(docker --version)'
  fi
"

execute_remote "Установка Docker Compose" "
  if ! command -v docker-compose &> /dev/null; then
    echo 'Docker Compose не установлен, устанавливаем...'
    echo '$SUDO_PASSWORD' | sudo -S curl -L \"https://github.com/docker/compose/releases/latest/download/docker-compose-\$(uname -s)-\$(uname -m)\" -o /usr/local/bin/docker-compose
    echo '$SUDO_PASSWORD' | sudo -S chmod +x /usr/local/bin/docker-compose
  else
    echo 'Docker Compose уже установлен: \$(docker-compose --version)'
  fi
"

# Создаем директорию на сервере
echo -e "${YELLOW}📁 Создаем директорию на сервере...${NC}"
execute_remote "Создание директории $DEPLOY_PATH" "
  echo '$SUDO_PASSWORD' | sudo -S mkdir -p $DEPLOY_PATH
  echo '$SUDO_PASSWORD' | sudo -S chown \$(whoami):\$(whoami) $DEPLOY_PATH
  echo 'Права доступа:'
  ls -la \$(dirname $DEPLOY_PATH)
"

# Проверяем подключение к GitHub
echo -e "${YELLOW}🌐 Проверяем подключение к GitHub...${NC}"
execute_remote "Проверка подключения к GitHub" "
  if curl -s --connect-timeout 10 https://github.com > /dev/null; then
    echo '✅ Подключение к GitHub работает'
  else
    echo '❌ Нет подключения к GitHub'
    exit 1
  fi
"

# Клонируем Git репозиторий на сервере
echo -e "${YELLOW}📦 Клонируем Git репозиторий на сервере...${NC}"
execute_remote "Удаление старой директории" "
  echo 'Удаляем старую директорию с правами sudo...'
  echo '$SUDO_PASSWORD' | sudo -S rm -rf $DEPLOY_PATH
  echo 'Старая директория удалена'
"

execute_remote "Клонирование репозитория" "
  echo 'Создаем директорию для клонирования...'
  echo '$SUDO_PASSWORD' | sudo -S mkdir -p $DEPLOY_PATH
  echo '$SUDO_PASSWORD' | sudo -S chown \$(whoami):\$(whoami) $DEPLOY_PATH
  
  echo 'Клонируем репозиторий...'
  git clone https://github.com/durygus/prodesk.git $DEPLOY_PATH
  echo 'Клонирование завершено'
"

execute_remote "Проверка клонированного репозитория" "
  if [ -d \"$DEPLOY_PATH\" ] && [ -f \"$DEPLOY_PATH/package.json\" ]; then
    echo '✅ Репозиторий клонирован успешно'
    echo 'Содержимое директории:'
    ls -la $DEPLOY_PATH
    echo 'Размер репозитория:'
    du -sh $DEPLOY_PATH
  else
    echo '❌ Ошибка: репозиторий не клонирован или файлы отсутствуют'
    exit 1
  fi
"

echo -e "${GREEN}✅ Клонирование завершено успешно!${NC}"
echo -e "${BLUE}📋 Следующие шаги:${NC}"
echo "1. Проверьте содержимое директории: ssh $SERVER 'ls -la $DEPLOY_PATH'"
echo "2. Запустите полный деплой: ./deploy-server.sh $SERVER $DEPLOY_PATH"
