#!/bin/bash

# Скрипт для разработки Herzen Core в Docker
# Использование: ./dev.sh [start|stop|restart|logs|shell|clean]

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

COMPOSE_FILE="docker-compose.yml"

case "${1:-start}" in
  start)
    echo -e "${GREEN}🚀 Запускаем Herzen Core для разработки...${NC}"
    docker-compose -f $COMPOSE_FILE up -d
    echo -e "${GREEN}✅ Сервисы запущены!${NC}"
    echo -e "${BLUE}📱 Приложение: http://localhost:8118${NC}"
    echo -e "${BLUE}🗄️  MongoDB: localhost:27017${NC}"
    echo -e "${YELLOW}📋 Для просмотра логов: ./dev.sh logs${NC}"
    ;;
  
  stop)
    echo -e "${YELLOW}⏹️  Останавливаем сервисы...${NC}"
    docker-compose -f $COMPOSE_FILE down
    echo -e "${GREEN}✅ Сервисы остановлены!${NC}"
    ;;
  
  restart)
    echo -e "${YELLOW}🔄 Перезапускаем сервисы...${NC}"
    docker-compose -f $COMPOSE_FILE restart
    echo -e "${GREEN}✅ Сервисы перезапущены!${NC}"
    ;;
  
  logs)
    echo -e "${BLUE}📋 Показываем логи...${NC}"
    docker-compose -f $COMPOSE_FILE logs -f
    ;;
  
  shell)
    echo -e "${BLUE}🐚 Подключаемся к контейнеру приложения...${NC}"
    docker-compose -f $COMPOSE_FILE exec herzen sh
    ;;
  
  clean)
    echo -e "${RED}🧹 Очищаем все данные...${NC}"
    docker-compose -f $COMPOSE_FILE down -v
    docker system prune -f
    echo -e "${GREEN}✅ Очистка завершена!${NC}"
    ;;
  
  build)
    echo -e "${BLUE}🔨 Пересобираем образы...${NC}"
    docker-compose -f $COMPOSE_FILE build --no-cache
    echo -e "${GREEN}✅ Образы пересобраны!${NC}"
    ;;
  
  *)
    echo -e "${YELLOW}Использование: $0 [start|stop|restart|logs|shell|clean|build]${NC}"
    echo ""
    echo "Команды:"
    echo "  start   - Запустить все сервисы"
    echo "  stop    - Остановить все сервисы"
    echo "  restart - Перезапустить все сервисы"
    echo "  logs    - Показать логи"
    echo "  shell   - Подключиться к контейнеру приложения"
    echo "  clean   - Очистить все данные и контейнеры"
    echo "  build   - Пересобрать образы"
    exit 1
    ;;
esac
