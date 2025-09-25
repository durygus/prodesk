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
DEPLOY_PATH=${2:-"/opt/herzen"}
APP_NAME="herzen"

echo -e "${GREEN}🚀 Развертываем Herzen Core на Ubuntu сервере${NC}"
echo -e "${YELLOW}Сервер: $SERVER${NC}"
echo -e "${YELLOW}Путь развертывания: $DEPLOY_PATH${NC}"

# Проверяем подключение к серверу
echo -e "${YELLOW}📡 Проверяем подключение к серверу...${NC}"
ssh -o ConnectTimeout=10 $SERVER "echo 'Подключение успешно'"

# Проверяем, что SSH ключ работает без пароля
echo -e "${YELLOW}🔑 Проверяем SSH ключ...${NC}"
if ! ssh -o BatchMode=yes -o ConnectTimeout=10 $SERVER "echo 'SSH ключ работает'" 2>/dev/null; then
  echo -e "${RED}❌ SSH ключ не настроен или не работает без пароля${NC}"
  echo -e "${YELLOW}💡 Убедитесь, что:${NC}"
  echo "   1. SSH ключ добавлен в ~/.ssh/authorized_keys на сервере"
  echo "   2. Права доступа: chmod 600 ~/.ssh/authorized_keys"
  echo "   3. Права на директорию: chmod 700 ~/.ssh"
  exit 1
fi
echo -e "${GREEN}✅ SSH ключ работает корректно${NC}"

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
ssh $SERVER "echo '$SUDO_PASSWORD' | sudo -S mkdir -p $DEPLOY_PATH && echo '$SUDO_PASSWORD' | sudo -S chown \$(whoami):\$(whoami) $DEPLOY_PATH"

# Копируем файлы проекта
echo -e "${YELLOW}📦 Копируем файлы проекта...${NC}"
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude 'data' --exclude 'logs' ./ $SERVER:$DEPLOY_PATH/

# Создаем production docker-compose файл на сервере
echo -e "${YELLOW}⚙️ Создаем production конфигурацию...${NC}"
ssh $SERVER "cd $DEPLOY_PATH && cat > docker-compose.prod.yml << 'EOF'
version: '3.8'

services:
  # MongoDB
  mongo:
    image: mongo:6.0
    container_name: herzen-mongo
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: herzen123
      MONGO_INITDB_DATABASE: herzen
    volumes:
      - mongo_data:/data/db
      - ./mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro
    networks:
      - herzen-network

  # Redis
  redis:
    image: redis:7-alpine
    container_name: herzen-redis
    restart: unless-stopped
    networks:
      - herzen-network

  # Herzen Core приложение
  herzen-core:
    build: .
    container_name: herzen-core
    restart: unless-stopped
    depends_on:
      - mongo
      - redis
    environment:
      NODE_ENV: production
      PORT: 8118
    ports:
      - \"80:8118\"
    volumes:
      - herzen_data:/app/data
      - herzen_logs:/app/logs
      - herzen_uploads:/app/public/uploads
    networks:
      - herzen-network

volumes:
  mongo_data:
  herzen_data:
  herzen_logs:
  herzen_uploads:

networks:
  herzen-network:
    driver: bridge
EOF"

# Создаем systemd сервис для управления
echo -e "${YELLOW}🔧 Создаем systemd сервис...${NC}"
ssh $SERVER "echo '$SUDO_PASSWORD' | sudo -S tee /etc/systemd/system/herzen.service > /dev/null << 'EOF'
[Unit]
Description=Herzen Core - Central Service for Ticket Management
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$DEPLOY_PATH
ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF"

# Перезагружаем systemd
ssh $SERVER "echo '$SUDO_PASSWORD' | sudo -S systemctl daemon-reload"

# Запускаем Herzen Core автоматически
echo -e "${YELLOW}🚀 Запускаем Herzen Core...${NC}"
ssh $SERVER "echo '$SUDO_PASSWORD' | sudo -S systemctl start herzen && echo '$SUDO_PASSWORD' | sudo -S systemctl enable herzen"

# Ждем запуска сервисов
echo -e "${YELLOW}⏳ Ждем запуска сервисов (30 секунд)...${NC}"
sleep 30

# Проверяем статус
echo -e "${YELLOW}🔍 Проверяем статус сервисов...${NC}"
ssh $SERVER "cd $DEPLOY_PATH && docker-compose -f docker-compose.prod.yml ps"

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
echo "  ssh $SERVER 'cd $DEPLOY_PATH && docker-compose -f docker-compose.prod.yml logs -f'"
echo ""
echo "• Перезапустить:"
echo "  ssh $SERVER 'sudo systemctl restart herzen'"
echo ""
echo "• Обновить код:"
echo "  ssh $SERVER 'cd $DEPLOY_PATH && git pull && docker-compose -f docker-compose.prod.yml up -d'"
echo ""
echo -e "${GREEN}🎉 Herzen Core успешно развернут и запущен!${NC}"
