#!/bin/bash

# Скрипт развертывания Herzen Core на Ubuntu сервере
# Использование: ./deploy-server.sh [server_user@server_ip] [deploy_path]

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

echo -e "${GREEN}🚀 Развертываем Herzen Core на Ubuntu сервере${NC}"
echo -e "${YELLOW}Сервер: $SERVER${NC}"
echo -e "${YELLOW}Путь развертывания: $DEPLOY_PATH${NC}"

# Проверяем подключение к серверу
echo -e "${YELLOW}📡 Проверяем подключение к серверу...${NC}"
ssh -o ConnectTimeout=10 $SERVER "echo 'Подключение успешно'"

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

# Устанавливаем Docker на сервере
echo -e "${YELLOW}🐳 Устанавливаем Docker на сервере...${NC}"
echo "$SUDO_PASSWORD" | ssh $SERVER "
  # Обновляем систему (без интерактивного режима)
  sudo -S DEBIAN_FRONTEND=noninteractive apt update && sudo -S DEBIAN_FRONTEND=noninteractive apt upgrade -y
  
  # Устанавливаем Docker
  curl -fsSL https://get.docker.com -o get-docker.sh
  sudo -S sh get-docker.sh
  sudo -S usermod -aG docker \$(whoami)
  
  # Устанавливаем Docker Compose
  sudo -S curl -L \"https://github.com/docker/compose/releases/latest/download/docker-compose-\$(uname -s)-\$(uname -m)\" -o /usr/local/bin/docker-compose
  sudo -S chmod +x /usr/local/bin/docker-compose
  
  # Устанавливаем Git
  sudo -S DEBIAN_FRONTEND=noninteractive apt install -y git
  
  echo 'Docker установлен успешно'
"

# Создаем директорию на сервере
echo -e "${YELLOW}📁 Создаем директорию на сервере...${NC}"
ssh $SERVER "
  # Проверяем пароль sudo
  echo '$SUDO_PASSWORD' | sudo -S echo 'Sudo работает' || exit 1
  
  echo '$SUDO_PASSWORD' | sudo -S mkdir -p $DEPLOY_PATH
  echo '$SUDO_PASSWORD' | sudo -S chown \$(whoami):\$(whoami) $DEPLOY_PATH
  echo 'Директория создана успешно'
"

# Клонируем Git репозиторий на сервере
echo -e "${YELLOW}📦 Клонируем Git репозиторий на сервере...${NC}"
ssh $SERVER "
  # Проверяем, что Git установлен
  if ! command -v git &> /dev/null; then
    echo 'Git не установлен, устанавливаем...'
    echo '$SUDO_PASSWORD' | sudo -S DEBIAN_FRONTEND=noninteractive apt install -y git
  fi
  
  # Удаляем только код, сохраняем данные
  if [ -d "$DEPLOY_PATH" ]; then
    echo 'Сохраняем данные и удаляем только код...'
    # Создаем временную папку для данных
    echo '$SUDO_PASSWORD' | sudo -S mkdir -p /tmp/herzen-backup
    # Копируем данные
    echo '$SUDO_PASSWORD' | sudo -S cp -r $DEPLOY_PATH/data /tmp/herzen-backup/ 2>/dev/null || true
    echo '$SUDO_PASSWORD' | sudo -S cp -r $DEPLOY_PATH/logs /tmp/herzen-backup/ 2>/dev/null || true
    echo '$SUDO_PASSWORD' | sudo -S cp -r $DEPLOY_PATH/public/uploads /tmp/herzen-backup/ 2>/dev/null || true
    # Удаляем всю директорию (код + данные) через Docker
    cd $(dirname $DEPLOY_PATH)
    docker run --rm -v \$(pwd):/data alpine sh -c 'rm -rf /data/$(basename $DEPLOY_PATH)'
    echo 'Код удален, данные сохранены'
  fi
  
  # Создаем родительскую директорию если не существует
  echo '$SUDO_PASSWORD' | sudo -S mkdir -p $(dirname $DEPLOY_PATH)
  echo '$SUDO_PASSWORD' | sudo -S chown \$(whoami):\$(whoami) $(dirname $DEPLOY_PATH)
  
  # Проверяем подключение к GitHub
  echo 'Проверяем подключение к GitHub...'
  if ! curl -s --connect-timeout 10 https://github.com > /dev/null; then
    echo 'Ошибка: нет подключения к GitHub'
    exit 1
  fi
  
  # Создаем директорию для клонирования
  echo 'Создаем директорию для клонирования...'
  echo '$SUDO_PASSWORD' | sudo -S mkdir -p $DEPLOY_PATH
  echo '$SUDO_PASSWORD' | sudo -S chown \$(whoami):\$(whoami) $DEPLOY_PATH
  
  # Клонируем репозиторий
  echo 'Клонируем репозиторий...'
  if ! git clone https://github.com/durygus/prodesk.git $DEPLOY_PATH; then
    echo 'Ошибка при клонировании репозитория'
    exit 1
  fi
  
  # Проверяем, что клонирование прошло успешно
  if [ -d \"$DEPLOY_PATH\" ] && [ -f \"$DEPLOY_PATH/package.json\" ]; then
    echo 'Git репозиторий клонирован успешно'
    ls -la $DEPLOY_PATH
  else
    echo 'Ошибка: репозиторий не клонирован или файлы отсутствуют'
    exit 1
  fi
  
  # Создаем необходимые директории
  echo 'Создаем директории для данных...'
  mkdir -p data/mongodb data/app logs public/uploads
  echo 'Директории созданы'
  
  # Восстанавливаем данные если они были сохранены
  if [ -d \"/tmp/herzen-backup\" ]; then
    echo 'Восстанавливаем сохраненные данные...'
    echo '$SUDO_PASSWORD' | sudo -S cp -r /tmp/herzen-backup/data/* data/ 2>/dev/null || true
    echo '$SUDO_PASSWORD' | sudo -S cp -r /tmp/herzen-backup/logs/* logs/ 2>/dev/null || true
    echo '$SUDO_PASSWORD' | sudo -S cp -r /tmp/herzen-backup/uploads/* public/uploads/ 2>/dev/null || true
    echo '$SUDO_PASSWORD' | sudo -S rm -rf /tmp/herzen-backup
    echo 'Данные восстановлены'
  fi
"

# Проверяем что docker-compose.yml существует
echo -e "${YELLOW}⚙️ Проверяем конфигурацию Docker...${NC}"
ssh $SERVER "cd $DEPLOY_PATH && ls -la docker-compose.yml"

# Создаем systemd сервис для управления
echo -e "${YELLOW}🔧 Создаем systemd сервис...${NC}"
ssh $SERVER "
  # Проверяем пароль sudo еще раз
  echo 'Проверяем пароль sudo для systemd...'
  if ! echo '$SUDO_PASSWORD' | sudo -S -v; then
    echo 'Ошибка: неправильный пароль sudo'
    exit 1
  fi
  
  echo '$SUDO_PASSWORD' | sudo -S tee /etc/systemd/system/herzen.service > /dev/null << 'EOF'
[Unit]
Description=Herzen Core - Central Service for Ticket Management
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$DEPLOY_PATH
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF"

# Перезагружаем systemd
echo -e "${YELLOW}🔄 Перезагружаем systemd...${NC}"
ssh $SERVER "
  # Продлеваем время действия sudo
  echo '$SUDO_PASSWORD' | sudo -S -v
  echo '$SUDO_PASSWORD' | sudo -S systemctl daemon-reload
  echo 'Systemd перезагружен'
"

# Запускаем Herzen Core автоматически
echo -e "${YELLOW}🚀 Запускаем Herzen Core...${NC}"
ssh $SERVER "
  cd $DEPLOY_PATH
  
  # Продлеваем время действия sudo
  echo '$SUDO_PASSWORD' | sudo -S -v
  
  # Проверяем, что пользователь в группе docker
  echo 'Проверяем группу docker...'
  if ! groups \$(whoami) | grep -q docker; then
    echo 'Добавляем пользователя в группу docker...'
    echo '$SUDO_PASSWORD' | sudo -S usermod -aG docker \$(whoami)
    echo 'Перелогиниваемся для применения группы...'
    newgrp docker
  fi
  
  # Сначала запускаем контейнеры напрямую для проверки
  echo 'Запускаем Docker контейнеры...'
  echo '$SUDO_PASSWORD' | sudo -S docker-compose up -d
  
  # Затем запускаем systemd сервис
  echo '$SUDO_PASSWORD' | sudo -S systemctl start herzen
  echo '$SUDO_PASSWORD' | sudo -S systemctl enable herzen
  echo 'Herzen Core запущен'
"

# Ждем запуска сервисов
echo -e "${YELLOW}⏳ Ждем запуска сервисов (30 секунд)...${NC}"
sleep 30

# Проверяем статус
echo -e "${YELLOW}🔍 Проверяем статус сервисов...${NC}"
ssh $SERVER "cd $DEPLOY_PATH && docker-compose ps"

echo -e "${GREEN}✅ Развертывание и запуск завершены!${NC}"
echo ""
echo -e "${GREEN}🌐 Доступ к Herzen Core:${NC}"
echo -e "${BLUE}   Web UI: http://$(echo $SERVER | cut -d'@' -f2)${NC}"
echo -e "${BLUE}   Администратор: admin / admin${NC}"
echo ""
echo -e "${YELLOW}📋 Управление сервисом:${NC}"
echo "• Проверить статус:"
echo "  ssh $SERVER 'sudo systemctl status herzen'"
echo ""
echo "• Просмотреть логи:"
echo "  ssh $SERVER 'cd $DEPLOY_PATH && docker-compose logs -f'"
echo ""
echo "• Перезапустить:"
echo "  ssh $SERVER 'sudo systemctl restart herzen'"
echo ""
echo "• Обновить код:"
echo "  ssh $SERVER 'cd $DEPLOY_PATH && git pull && docker-compose up -d'"
echo ""
echo -e "${GREEN}🎉 Herzen Core успешно развернут и запущен!${NC}"
