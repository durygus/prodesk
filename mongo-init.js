// Инициализация MongoDB для Herzen
db = db.getSiblingDB('herzen');

// Создаем пользователя для приложения
db.createUser({
  user: 'herzen',
  pwd: 'herzen123',
  roles: [
    {
      role: 'readWrite',
      db: 'herzen'
    }
  ]
});

print('MongoDB инициализирован для Herzen');
