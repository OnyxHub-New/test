const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(morgan('dev'));

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

app.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Onyx Hub Logger API is running',
        endpoints: {
            log: 'POST /log - для отправки логов',
            logs: 'GET /logs - для получения списка логов'
        }
    });
});

app.post('/log', (req, res) => {
    try {
        const data = req.body;
        console.log('New log entry:', data);
        logToFile(data);
        res.status(200).json({ status: 'success', message: 'Log saved' });
    } catch (error) {
        console.error('Error processing log:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
});

app.get('/logs', (req, res) => {
    try {
        const files = fs.readdirSync(logDir);
        res.status(200).json({
            status: 'success',
            data: files
        });
    } catch (error) {
        console.error('Error reading logs:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
});

app.use((req, res) => {
    res.status(404).json({ status: 'error', message: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
});


app.listen(PORT, () => {
    console.log(`Server running`);
    console.log(`Logs directory: ${logDir}`);
});
