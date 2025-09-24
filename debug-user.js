const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Подключаемся к MongoDB
mongoose.connect('mongodb://localhost:27017/trudesk', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Схема роли
const roleSchema = new mongoose.Schema({
  name: String,
  normalized: String,
  permissions: [String]
});

// Схема пользователя (точно как в приложении)
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  fullname: { type: String, required: true, index: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  role: { type: mongoose.Schema.Types.ObjectId, ref: 'roles', required: true },
  lastOnline: Date,
  title: String,
  image: String,
  workNumber: { type: String },
  mobileNumber: { type: String },
  companyName: { type: String },
  facebookUrl: { type: String },
  linkedinUrl: { type: String },
  twitterUrl: { type: String },
  resetPassHash: { type: String, select: false },
  resetPassExpire: { type: Date, select: false },
  tOTPKey: { type: String, select: false },
  tOTPPeriod: { type: Number, select: false },
  resetL2AuthHash: { type: String, select: false },
  resetL2AuthExpire: { type: Date, select: false },
  hasL2Auth: { type: Boolean, required: true, default: false },
  accessToken: { type: String, sparse: true, select: false },
  preferences: {
    tourCompleted: { type: Boolean, default: false },
    autoRefreshTicketGrid: { type: Boolean, default: true },
    openChatWindows: [{ type: String, default: [] }],
    keyboardShortcuts: { type: Boolean, default: true },
    timezone: { type: String }
  },
  deleted: { type: Boolean, default: false }
});

const Role = mongoose.model('Role', roleSchema);
const User = mongoose.model('User', userSchema);

// Добавляем статический метод validate
User.validate = function (password, dbPass) {
  return bcrypt.compareSync(password, dbPass);
};

async function debugUser() {
  try {
    // Удаляем всех пользователей
    await User.deleteMany({});
    
    // Создаем роли
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
      accessToken: 'admin-token-123',
      hasL2Auth: false,
      deleted: false
    });
    
    console.log('User created:', admin.username, admin.email);
    
    // Тестируем поиск пользователя
    const foundUser = await User.findOne({ username: new RegExp('^' + 'admin'.trim() + '$', 'i') })
      .select('+password +tOTPKey +tOTPPeriod')
      .exec();
    
    console.log('Found user:', foundUser ? foundUser.username : 'NOT FOUND');
    
    if (foundUser) {
      console.log('User password field exists:', !!foundUser.password);
      console.log('Password validation:', User.validate('password', foundUser.password));
      console.log('User deleted:', foundUser.deleted);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

debugUser();
