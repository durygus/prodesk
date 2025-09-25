# Dockerfile для Herzen Core
FROM node:18-alpine

# Устанавливаем системные зависимости
RUN apk add --no-cache \
    python3 \
    py3-setuptools \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    musl-dev \
    giflib-dev \
    pixman-dev \
    pangomm-dev \
    libjpeg-turbo-dev \
    freetype-dev

# Создаем пользователя для приложения
RUN addgroup -g 1001 -S nodejs
RUN adduser -S herzen -u 1001

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install --only=production && npm cache clean --force

# Копируем исходный код
COPY . .

# Создаем необходимые директории
RUN mkdir -p data logs public/uploads

# Устанавливаем права доступа
RUN chown -R herzen:nodejs /app
USER herzen

# Открываем порт
EXPOSE 8118

# Создаем конфигурационный файл по умолчанию
RUN cat > config.yml << 'EOF'
# Herzen Configuration
mongo:
  uri: mongodb://mongo:27017/herzen

server:
  port: 8118
  host: 0.0.0.0

session:
  secret: herzen-secret-key-change-in-production

email:
  enabled: false

redis:
  enabled: false

logging:
  level: info
  file: logs/herzen.log
EOF

# Команда запуска
CMD ["node", "app.js"]