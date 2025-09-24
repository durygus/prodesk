const mongoose = require('mongoose');

// Подключаемся к MongoDB
mongoose.connect('mongodb://localhost:27017/trudesk', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;

db.once('open', async function() {
  try {
    console.log('Connected to MongoDB');
    
    // Создаем настройки по умолчанию
    const settings = [
      {
        name: 'defaultTicketType',
        value: 'Task',
        type: 'string'
      },
      {
        name: 'installed',
        value: true,
        type: 'boolean'
      },
      {
        name: 'timezone',
        value: 'America/New_York',
        type: 'string'
      }
    ];
    
    // Вставляем настройки
    for (const setting of settings) {
      await db.db.collection('settings').updateOne(
        { name: setting.name },
        { $set: setting },
        { upsert: true }
      );
      console.log(`Created setting: ${setting.name} = ${setting.value}`);
    }
    
    // Создаем типы тикетов
    const ticketTypes = [
      { name: 'Task' },
      { name: 'Issue' },
      { name: 'Bug' },
      { name: 'Feature Request' }
    ];
    
    for (const type of ticketTypes) {
      await db.db.collection('tickettypes').updateOne(
        { name: type.name },
        { $set: type },
        { upsert: true }
      );
      console.log(`Created ticket type: ${type.name}`);
    }
    
    // Создаем статусы тикетов
    const ticketStatuses = [
      { name: 'New', uid: 0, isLocked: true },
      { name: 'Open', uid: 1, isLocked: true },
      { name: 'Pending', uid: 2, isLocked: true },
      { name: 'Closed', uid: 3, isLocked: true, isResolved: true }
    ];
    
    for (const status of ticketStatuses) {
      await db.db.collection('statuses').updateOne(
        { name: status.name },
        { $set: status },
        { upsert: true }
      );
      console.log(`Created ticket status: ${status.name}`);
    }
    
    // Создаем приоритеты
    const priorities = [
      { name: 'Low', htmlColor: '#29b955', overdueIn: 2880, migrationNum: 1, default: false },
      { name: 'Normal', htmlColor: '#29b955', overdueIn: 2880, migrationNum: 1, default: true },
      { name: 'High', htmlColor: '#ff9500', overdueIn: 1440, migrationNum: 2, default: false },
      { name: 'Critical', htmlColor: '#ff3b30', overdueIn: 720, migrationNum: 3, default: false }
    ];
    
    for (const priority of priorities) {
      await db.db.collection('priorities').updateOne(
        { name: priority.name },
        { $set: priority },
        { upsert: true }
      );
      console.log(`Created priority: ${priority.name}`);
    }
    
    console.log('Default settings created successfully!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
});
