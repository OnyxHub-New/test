const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Путь к файлу данных
const dataPath = path.join(__dirname, 'data.json');

// Функция для безопасного чтения JSON
function readData() {
  try {
    if (!fs.existsSync(dataPath)) {
      fs.writeFileSync(dataPath, '[]'); // Создаём файл, если его нет
      return [];
    }
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    return JSON.parse(rawData || '[]'); // Если файл пуст, возвращаем []
  } catch (e) {
    console.error('Ошибка чтения data.json:', e.message);
    return []; // Возвращаем пустой массив при ошибке
  }
}

// Middleware
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST');
  next();
});

// Проверка сервера
app.get('/', (req, res) => {
  res.send('Сервер работает! Проверьте /save для данных Roblox.');
});

// Обработчик POST-запросов от Roblox
app.post('/save', (req, res) => {
  try {
    const { robloxNick } = req.body;
    if (!robloxNick) {
      return res.status(400).send('Требуется robloxNick!');
    }

    const data = readData(); // Читаем данные безопасно
    const newEntry = {
      robloxNick,
      ip: req.ip.replace('::ffff:', ''),
      userAgent: req.headers['user-agent'] || 'Unknown',
      timestamp: new Date().toISOString()
    };

    data.push(newEntry);
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2)); // Записываем красиво

    console.log('✅ Данные сохранены:', newEntry);
    res.status(200).send('Данные получены!');
  } catch (e) {
    console.error('Ошибка в /save:', e);
    res.status(500).send('Ошибка сервера');
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log('Файл данных:', dataPath);
});
