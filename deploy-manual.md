# Ручное развертывание Herzen Core на Ubuntu сервере

Если автоматический скрипт не работает из-за проблем с sudo, выполните следующие шаги вручную:

## 1. Подключитесь к серверу
```bash
ssh durygus@188.130.234.42
```

## 2. Установите Docker
```bash
# Обновляем систему
sudo apt update && sudo apt upgrade -y

# Устанавливаем Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Устанавливаем Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Устанавливаем Git
sudo apt install -y git

# Перезагружаемся для применения изменений группы
sudo reboot
```

## 3. После перезагрузки подключитесь снова
```bash
ssh durygus@188.130.234.42
```

## 4. Создайте директорию и скопируйте код
```bash
# Создаем директорию
sudo mkdir -p /opt/herzen/core
sudo chown $USER:$USER /opt/herzen/core

# Клонируем репозиторий
cd /opt/herzen
git clone https://github.com/durygus/prodesk.git core
cd core
```

## 5. Создайте production конфигурацию
```bash
cat > docker-compose.prod.yml << 'EOF'
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
      - "80:8118"
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
EOF
```

## 6. Создайте systemd сервис
```bash
sudo tee /etc/systemd/system/herzen.service > /dev/null << 'EOF'
[Unit]
Description=Herzen Core - Central Service for Ticket Management
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/herzen/core
ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

# Перезагружаем systemd
sudo systemctl daemon-reload
```

## 7. Запустите Herzen Core
```bash
# Запускаем сервис
sudo systemctl start herzen
sudo systemctl enable herzen

# Проверяем статус
sudo systemctl status herzen

# Просматриваем логи
docker-compose -f docker-compose.prod.yml logs -f
```

## 8. Откройте в браузере
```
http://188.130.234.42
```

## 9. Обновление кода
```bash
cd /opt/herzen/core
git pull
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

## Управление сервисом
```bash
# Запуск
sudo systemctl start herzen

# Остановка
sudo systemctl stop herzen

# Перезапуск
sudo systemctl restart herzen

# Статус
sudo systemctl status herzen

# Логи
docker-compose -f docker-compose.prod.yml logs -f
```
