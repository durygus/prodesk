# Развертывание Herzen на удаленном сервере

## Вариант 1: Простое развертывание (рекомендуется)

### Требования на сервере:
- Ubuntu/Debian/CentOS
- Node.js 16+ 
- MongoDB 4.4+
- Git

### Шаги:

1. **Подготовьте сервер:**
```bash
# Обновляем систему
sudo apt update && sudo apt upgrade -y

# Устанавливаем Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Устанавливаем MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

2. **Запустите скрипт развертывания:**
```bash
# С вашего локального компьютера
./deploy.sh user@your-server.com /opt/herzen
```

3. **Настройте конфигурацию:**
```bash
# На сервере отредактируйте конфигурацию
sudo nano /opt/herzen/config.yml
```

4. **Запустите приложение:**
```bash
# На сервере
sudo systemctl start herzen
sudo systemctl enable herzen
sudo systemctl status herzen
```

5. **Откройте в браузере:**
```
http://your-server-ip:8118
```

## Вариант 2: Docker развертывание

### Требования:
- Docker
- Docker Compose

### Шаги:

1. **Скопируйте файлы на сервер:**
```bash
scp -r . user@your-server.com:/opt/herzen/
```

2. **На сервере запустите:**
```bash
cd /opt/herzen
docker-compose up -d
```

3. **Проверьте статус:**
```bash
docker-compose ps
docker-compose logs herzen
```

4. **Откройте в браузере:**
```
http://your-server-ip
```

## Настройка после установки

1. **Первый запуск:**
   - Откройте http://your-server-ip:8118
   - Следуйте инструкциям мастера установки
   - Создайте администратора

2. **Настройка email (опционально):**
   - Отредактируйте `config.yml`
   - Укажите настройки SMTP

3. **Настройка домена (опционально):**
   - Настройте DNS
   - Используйте Nginx для SSL

## Мониторинг

### Логи:
```bash
# Systemd
sudo journalctl -u herzen -f

# Docker
docker-compose logs -f herzen
```

### Перезапуск:
```bash
# Systemd
sudo systemctl restart herzen

# Docker
docker-compose restart herzen
```

## Безопасность

1. **Настройте firewall:**
```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

2. **Измените пароли по умолчанию:**
   - MongoDB: admin/herzen123
   - Приложение: через веб-интерфейс

3. **Настройте SSL (рекомендуется):**
   - Используйте Let's Encrypt
   - Настройте Nginx reverse proxy
