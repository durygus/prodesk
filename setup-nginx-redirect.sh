#!/bin/bash

# Скрипт установки Nginx для редиректа herzen.verygood.cloud -> 188.130.234.42:8118
# Использование: ./setup-nginx-redirect.sh [server_user@server_ip]

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Параметры
SERVER=${1:-"durygus@188.130.234.42"}

echo -e "${GREEN}🌐 Настраиваем Nginx для редиректа herzen.verygood.cloud -> 188.130.234.42:8118${NC}"
echo -e "${YELLOW}Сервер: $SERVER${NC}"

# Проверяем подключение к серверу
echo -e "${YELLOW}📡 Проверяем подключение к серверу...${NC}"
if ! ssh -o ConnectTimeout=10 $SERVER "echo 'Подключение успешно'"; then
  echo -e "${RED}❌ Не удается подключиться к серверу${NC}"
  exit 1
fi

# Устанавливаем Nginx
echo -e "${YELLOW}📦 Устанавливаем Nginx...${NC}"
ssh $SERVER "
  # Обновляем систему
  sudo apt update
  
  # Устанавливаем Nginx
  sudo apt install -y nginx
  
  # Запускаем и включаем Nginx
  sudo systemctl start nginx
  sudo systemctl enable nginx
  
  echo 'Nginx установлен и запущен'
"

# Копируем конфигурацию Nginx
echo -e "${YELLOW}⚙️ Настраиваем конфигурацию Nginx...${NC}"
scp nginx-herzen-redirect.conf $SERVER:/tmp/nginx-herzen-redirect.conf

# Применяем конфигурацию
ssh $SERVER "
  # Создаем резервную копию дефолтной конфигурации
  sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup
  
  # Копируем нашу конфигурацию
  sudo cp /tmp/nginx-herzen-redirect.conf /etc/nginx/sites-available/herzen-redirect
  
  # Создаем символическую ссылку
  sudo ln -sf /etc/nginx/sites-available/herzen-redirect /etc/nginx/sites-enabled/
  
  # Удаляем дефолтную конфигурацию
  sudo rm -f /etc/nginx/sites-enabled/default
  
  # Проверяем конфигурацию
  sudo nginx -t
  
  # Перезагружаем Nginx
  sudo systemctl reload nginx
  
  echo 'Конфигурация Nginx применена'
"

# Проверяем статус
echo -e "${YELLOW}🔍 Проверяем статус сервисов...${NC}"
ssh $SERVER "
  echo 'Статус Nginx:'
  sudo systemctl status nginx --no-pager -l
  
  echo 'Статус Herzen Core:'
  sudo systemctl status herzen --no-pager -l || echo 'Herzen Core не запущен'
  
  echo 'Проверяем порты:'
  sudo netstat -tlnp | grep -E ':(80|8118)'
"

echo -e "${GREEN}✅ Настройка завершена!${NC}"
echo ""
echo -e "${GREEN}🌐 Теперь доступно:${NC}"
echo "   http://herzen.verygood.cloud -> 188.130.234.42:8118"
echo ""
echo -e "${BLUE}📋 Следующие шаги:${NC}"
echo "1. Настройте A-запись в Route53: herzen.verygood.cloud -> 188.130.234.42"
echo "2. Проверьте доступность: curl -I http://herzen.verygood.cloud"
echo "3. При необходимости настройте SSL сертификат"
