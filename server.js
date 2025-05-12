const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;
const dataFile = path.join('/data', 'data.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve frontend files

// Initialize data file if it doesn't exist
async function initializeData() {
    try {
        await fs.access(dataFile);
        console.log('data.json exists');
    } catch {
        console.log('Creating data.json');
        try {
            await fs.writeFile(dataFile, JSON.stringify([]));
            console.log('data.json created successfully');
        } catch (err) {
            console.error('Failed to create data.json:', err);
            throw err;
        }
    }
}

// Get all walkie-talkie records
app.get('/api/walkies', async (req, res) => {
    try {
        const data = await fs.readFile(dataFile, 'utf8');
        console.log('Successfully read data.json');
        res.json(JSON.parse(data));
    } catch (err) {
        console.error('Error reading data.json:', err);
        res.status(500).json({ error: 'Failed to read data', details: err.message });
    }
});

// Add a walkie-talkie record
app.post('/api/walkies', async (req, res) => {
    try {
        const newWalkie = req.body;
        const data = JSON.parse(await fs.readFile(dataFile, 'utf8'));
        data.push(newWalkie);
        await fs.writeFile(dataFile, JSON.stringify(data, null, 2));
        console.log('Successfully wrote to data.json');
        res.json(newWalkie);
    } catch (err) {
        console.error('Error writing to data.json:', err);
        res.status(500).json({ error: 'Failed to save data', details: err.message });
    }
});

// Update a walkie-talkie record
app.put('/api/walkies/:index', async (req, res) => {
    try {
        const index = parseInt(req.params.index);
        const updatedWalkie = req.body;
        const data = JSON.parse(await fs.readFile(dataFile, 'utf8'));
        if (index >= 0 && index < data.length) {
            data[index] = updatedWalkie;
            await fs.writeFile(dataFile, JSON.stringify(data, null, 2));
            console.log(`Successfully updated record at index ${index}`);
            res.json(updatedWalkie);
        } else {
            console.warn(`Invalid index: ${index}`);
            res.status(404).json({ error: 'Record not found' });
        }
    } catch (err) {
        console.error('Error updating data.json:', err);
        res.status(500).json({ error: 'Failed to update data', details: err.message });
    }
});

// Initialize and start server
initializeData().then(() => {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}).catch(err => {
    console.error('Failed to initialize server:', err);
    process.exit(1);
});