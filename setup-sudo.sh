#!/bin/bash

# Скрипт для настройки sudo без пароля на сервере
# Запустите этот скрипт ОДИН РАЗ на сервере для настройки sudo

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔐 Настраиваем sudo без пароля для пользователя $(whoami)${NC}"

# Проверяем, что скрипт запущен не от root
if [ "$EUID" -eq 0 ]; then
  echo -e "${RED}❌ Не запускайте этот скрипт от root!${NC}"
  echo -e "${YELLOW}💡 Запустите от обычного пользователя: ./setup-sudo.sh${NC}"
  exit 1
fi

# Создаем файл sudoers
echo -e "${YELLOW}📝 Создаем файл sudoers...${NC}"
echo "$(whoami) ALL=(ALL) NOPASSWD: ALL" | sudo tee /etc/sudoers.d/$(whoami)

# Устанавливаем правильные права
echo -e "${YELLOW}🔒 Устанавливаем права доступа...${NC}"
sudo chmod 440 /etc/sudoers.d/$(whoami)
sudo chown root:root /etc/sudoers.d/$(whoami)

# Проверяем синтаксис sudoers
echo -e "${YELLOW}✅ Проверяем синтаксис sudoers...${NC}"
sudo visudo -c

echo -e "${GREEN}✅ Sudo настроен без пароля для пользователя $(whoami)${NC}"
echo -e "${YELLOW}💡 Теперь можно запускать deploy-server.sh без запроса пароля${NC}"
