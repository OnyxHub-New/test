const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const clientDataStore = new Map();

app.get('/api/client-id', (req, res) => {
    const clientId = uuidv4();
    clientDataStore.set(clientId, {
        id: clientId,
        createdAt: new Date(),
        lastUpdated: new Date(),
        robloxClientId: null,
        isValid: false
    });
    
    res.json({ clientId });
});

app.post('/api/submit-data', (req, res) => {
    const { clientId, robloxClientId } = req.body;
    
    if (!clientId || !robloxClientId) {
        return res.status(400).json({ error: 'clientId and robloxClientId are required' });
    }
    
    if (!clientDataStore.has(clientId)) {
        return res.status(404).json({ error: 'Client ID not found' });
    }
    
    const clientData = clientDataStore.get(clientId);
    clientData.robloxClientId = robloxClientId;
    clientData.lastUpdated = new Date();
    clientData.isValid = true;
    
    clientDataStore.set(clientId, clientData);
    
    res.json({ 
        success: true, 
        message: 'Data submitted successfully',
        data: clientData
    });
});

app.get('/api/verify/:clientId', (req, res) => {
    const { clientId } = req.params;
    
    if (!clientDataStore.has(clientId)) {
        return res.status(404).json({ error: 'Client ID not found' });
    }
    
    const clientData = clientDataStore.get(clientId);
    
    res.json({
        exists: true,
        isValid: clientData.isValid,
        robloxClientId: clientData.robloxClientId,
        createdAt: clientData.createdAt,
        lastUpdated: clientData.lastUpdated
    });
});

setInterval(() => {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    
    for (const [clientId, data] of clientDataStore.entries()) {
        if (data.createdAt < twentyFourHoursAgo) {
            clientDataStore.delete(clientId);
        }
    }
    
    console.log(`Cleaned up old entries. Current count: ${clientDataStore.size}`);
}, 24 * 60 * 60 * 1000);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
