const express = require('express');
const WebSocket = require('ws');

const app = express();
const PORT = process.env.PORT || 3000;


app.get('/', (req, res) => {
  res.send('test');
});

const server = app.listen(PORT, () => {
  console.log(`Server started`);
});


const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('New client connected');
  

  ws.send(JSON.stringify({
    type: 'welcome',
    message: 'Successfully connected',
    timestamp: new Date().toISOString()
  }));
  

  ws.on('message', (message) => {
    console.log(`Received: ${message}`);
    

    ws.send(JSON.stringify({
      type: 'echo',
      message: `Server received: ${message}`,
      timestamp: new Date().toISOString()
    }));
  });
  
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

console.log(`server is running`);
