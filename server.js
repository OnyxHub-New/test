const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;


const dataPath = path.join(__dirname, 'data.json');


function readData() {
  try {
    if (!fs.existsSync(dataPath)) {
      fs.writeFileSync(dataPath, '[]');
      return [];
    }
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    return JSON.parse(rawData || '[]'); 
  } catch (e) {
    console.error('Ошибка чтения data.json:', e.message);
    return []; 
  }
}


app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST');
  next();
});


app.get('/', (req, res) => {
  res.send('Check');
});

app.post('/save', (req, res) => {
  try {
    const { robloxNick } = req.body;
    if (!robloxNick) {
      return res.status(400).send('Требуется robloxNick!');
    }

    const data = readData(); 
    const newEntry = {
      robloxNick,
      ip: req.ip.replace('::ffff:', ''),
      userAgent: req.headers['user-agent'] || 'Unknown',
      timestamp: new Date().toISOString()
    };

    data.push(newEntry);
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2)); 

    console.log('New User', newEntry);
    res.status(200).send('Данные получены!');
  } catch (e) {
    console.error('Ошибка в /save:', e);
    res.status(500).send('Ошибка сервера');
  }
});


app.listen(PORT, () => {
  console.log('Файл данных:', dataPath);
});
