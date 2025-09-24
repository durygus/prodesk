const mongoose = require('mongoose');

// Подключаемся к той же базе данных, что и приложение
mongoose.connect('mongodb://localhost:27017/trudesk', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', async function() {
  console.log('Connected to MongoDB');
  
  // Проверяем существующие коллекции
  const collections = await db.db.listCollections().toArray();
  console.log('Collections:', collections.map(c => c.name));
  
  // Проверяем пользователей
  const users = await db.db.collection('users').find({}).toArray();
  console.log('Users in database:', users.length);
  users.forEach(user => {
    console.log('- User:', user.username, user.email, 'deleted:', user.deleted);
  });
  
  // Проверяем роли
  const roles = await db.db.collection('roles').find({}).toArray();
  console.log('Roles in database:', roles.length);
  roles.forEach(role => {
    console.log('- Role:', role.name, role.normalized);
  });
  
  mongoose.connection.close();
});
