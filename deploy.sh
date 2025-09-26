#!/bin/bash

# Скрипт развертывания Herzen (Trudesk) на удаленном сервере
# Использование: ./deploy.sh [server_user@server_ip] [deploy_path]

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Параметры
SERVER=${1:-"user@your-server.com"}
DEPLOY_PATH=${2:-"/opt/herzen"}
APP_NAME="herzen"

echo -e "${GREEN}🚀 Начинаем развертывание Herzen на сервере${NC}"
echo -e "${YELLOW}Сервер: $SERVER${NC}"
echo -e "${YELLOW}Путь развертывания: $DEPLOY_PATH${NC}"

# Проверяем подключение к серверу
echo -e "${YELLOW}📡 Проверяем подключение к серверу...${NC}"
ssh -o ConnectTimeout=10 $SERVER "echo 'Подключение успешно'"

# Создаем директорию на сервере
echo -e "${YELLOW}📁 Создаем директорию на сервере...${NC}"
ssh $SERVER "sudo mkdir -p $DEPLOY_PATH && sudo chown \$(whoami):\$(whoami) $DEPLOY_PATH"

# Копируем файлы проекта
echo -e "${YELLOW}📦 Копируем файлы проекта...${NC}"
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude 'data' --exclude 'logs' ./ $SERVER:$DEPLOY_PATH/

# Устанавливаем зависимости на сервере
echo -e "${YELLOW}📦 Устанавливаем зависимости...${NC}"
ssh $SERVER "cd $DEPLOY_PATH && npm install --production"

# Создаем конфигурационный файл
echo -e "${YELLOW}⚙️ Создаем конфигурационный файл...${NC}"
ssh $SERVER "cd $DEPLOY_PATH && cat > config.yml << 'EOF'
# Herzen Configuration
# Database
mongo:
  uri: mongodb://mongo:27017/herzen

# Server
server:
  port: 8118
  host: 0.0.0.0

# Session
session:
  secret: $(openssl rand -base64 32)

# Email (настройте под ваши нужды)
email:
  enabled: false
  host: smtp.gmail.com
  port: 587
  secure: false
  user: your-email@gmail.com
  pass: your-password

# Redis (опционально)
redis:
  enabled: false
  host: localhost
  port: 6379

# Logging
logging:
  level: info
  file: logs/herzen.log
EOF"

# Создаем systemd сервис
echo -e "${YELLOW}🔧 Создаем systemd сервис...${NC}"
ssh $SERVER "sudo tee /etc/systemd/system/herzen.service > /dev/null << 'EOF'
[Unit]
Description=Herzen Ticket Management System
After=network.target mongodb.service

[Service]
Type=simple
User=\$(whoami)
WorkingDirectory=$DEPLOY_PATH
ExecStart=/usr/bin/node $DEPLOY_PATH/app.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=8118

[Install]
WantedBy=multi-user.target
EOF"

# Перезагружаем systemd
ssh $SERVER "sudo systemctl daemon-reload"

echo -e "${GREEN}✅ Развертывание завершено!${NC}"
echo -e "${YELLOW}📋 Следующие шаги:${NC}"
echo "1. Установите MongoDB на сервере:"
echo "   sudo apt update && sudo apt install mongodb"
echo ""
echo "2. Настройте конфигурацию в $DEPLOY_PATH/config.yml"
echo ""
echo "3. Запустите сервис:"
echo "   sudo systemctl start herzen"
echo "   sudo systemctl enable herzen"
echo ""
echo "4. Проверьте статус:"
echo "   sudo systemctl status herzen"
echo ""
echo "5. Откройте в браузере: http://your-server-ip:8118"
