const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Подключаемся к MongoDB
mongoose.connect('mongodb://mongo:27017/trudesk', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Схема роли
const roleSchema = new mongoose.Schema({
  name: String,
  normalized: String,
  permissions: [String]
});

// Схема пользователя
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  fullname: String,
  email: String,
  role: mongoose.Schema.Types.ObjectId,
  accessToken: String
});

const Role = mongoose.model('Role', roleSchema);
const User = mongoose.model('User', userSchema);

async function createAdmin() {
  try {
    // Удаляем существующих пользователей
    await User.deleteMany({});
    
    // Создаем роли если их нет
    let adminRole = await Role.findOne({normalized: 'admin'});
    if (!adminRole) {
      adminRole = await Role.create({
        name: 'Admin',
        normalized: 'admin',
        permissions: ['admin']
      });
    }
    
    // Создаем хеш пароля
    const password = 'password';
    const hashedPassword = await bcrypt.hash(password, 4);
    
    // Создаем пользователя
    const admin = await User.create({
      username: 'admin',
      password: hashedPassword,
      fullname: 'Administrator',
      email: 'admin@trudesk.io',
      role: adminRole._id,
      accessToken: 'admin-token-123'
    });
    
    console.log('Admin user created successfully!');
    console.log('Username: admin');
    console.log('Password: password');
    console.log('User ID:', admin._id);
    
    // Проверяем создание
    const createdUser = await User.findOne({username: 'admin'});
    console.log('Created user:', createdUser.username, createdUser.email);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

createAdmin();
