
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

function logToFile(data) {
    const date = new Date();
    const logDate = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
    const logTime = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    
    const logFileName = path.join(logDir, `log_${logDate}.txt`);
    const logEntry = `[${logTime}] ${JSON.stringify(data)}\n`;
    
    fs.appendFile(logFileName, logEntry, (err) => {
        if (err) console.error('Error writing to log file:', err);
    });
}

app.post('/log', (req, res) => {
    const data = req.body;
    console.log('Received log:', data);
    logToFile(data);
    res.status(200).send('Logged successfully');
});


app.listen(PORT, () => {
    console.log(`Server running`);
});
