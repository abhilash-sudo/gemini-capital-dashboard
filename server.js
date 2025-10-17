const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// --- User Model ---
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    favorites: [String],
    theme: String,
    searchHistory: [String],
    loginHistory: [Date],
    role: { type: String, default: 'user' }
});
const User = mongoose.model('User', userSchema);

// --- Stock Model ---
const stockSchema = new mongoose.Schema({
    symbol: { type: String, required: true, unique: true, uppercase: true },
    name: { type: String, required: true }
});
const Stock = mongoose.model('Stock', stockSchema);

// --- Log Model ---
const logSchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    message: { type: String, required: true }
});
const Log = mongoose.model('Log', logSchema);

// --- Broadcast Model ---
const broadcastSchema = new mongoose.Schema({
    message: String,
    type: String,
    timestamp: { type: Date, default: Date.now }
});
const Broadcast = mongoose.model('Broadcast', broadcastSchema);

// --- MongoDB Connection ---
// This will use the MONGO_URI from Render's environment variables if it exists,
// otherwise it will fall back to the local database for development.
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/stockapp';

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log(`Successfully connected to MongoDB at ${MONGO_URI.startsWith('mongodb+srv') ? 'Atlas Cluster' : 'Local Database'}`))
    .catch(err => console.error('MongoDB connection error:', err));

// --- Logging ---
const LOG_FILE = 'system.log';

function logEvent(message) {
    const entry = `[${new Date().toISOString()}] ${message}\n`;
    fs.appendFile(LOG_FILE, entry, err => {
        if (err) console.error('Failed to write log:', err);
    });
    // Also save to MongoDB
    const log = new Log({ message });
    log.save().catch(err => console.error('Failed to save log to DB:', err));
}

// --- API Routes ---

// GET /api/user/:email
app.get('/api/user/:email', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email }).select('-password');
        res.json(user || {});
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/user/:email
app.post('/api/user/:email', async (req, res) => {
    try {
        const { favorites, theme } = req.body;
        const user = await User.findOneAndUpdate(
            { email: req.params.email },
            { favorites, theme },
            { new: true, upsert: true }
        );
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// POST /api/register
app.post('/api/register', async (req, res) => {
    try {
        const { name, password, email } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already in use' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, password: hashedPassword, email });
        await user.save();
        res.status(201).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// POST /api/login
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid email or password.' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid email or password.' });
        }
        // After successful login
        console.log(`User logged in: ${email}`);
        logEvent(`User logged in: ${email}`);
        res.status(200).json({
            success: true,
            user: {
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        logEvent(`Error during login for ${email}: ${error.message}`);
        res.status(500).json({ success: false, message: 'Server error during login.' });
    }
});

// GET /api/stocks
app.get('/api/stocks', async (req, res) => {
    try {
        const stocks = await Stock.find().sort({ symbol: 1 });
        res.json(stocks);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching stocks' });
    }
});

// POST /api/stocks
app.post('/api/stocks', async (req, res) => {
    try {
        const { symbol, name } = req.body;
        if (!symbol || !name) {
            return res.status(400).json({ message: 'Symbol and name are required.' });
        }
        const newStock = new Stock({ symbol, name });
        await newStock.save();
        res.status(201).json(newStock);
    } catch (error) {
        if(error.code === 11000) {
            return res.status(400).json({ message: 'This stock symbol already exists.' });
        }
        res.status(500).json({ message: 'Server error adding new stock' });
    }
});

// GET /api/users
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching users' });
    }
});

// GET /api/logs
app.get('/api/logs', async (req, res) => {
    // Return an array of log objects: { timestamp, message }
    const logs = await Log.find().sort({ timestamp: -1 }).limit(100);
    res.json(logs);
});

// POST /api/users/promote
app.post('/api/users/promote', async (req, res) => {
    const { email } = req.body;
    try {
        const result = await User.updateOne({ email }, { $set: { role: 'admin' } });
        if (result.modifiedCount > 0) {
            res.json({ success: true });
        } else {
            res.status(404).json({ success: false, message: 'User not found.' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET /api/broadcast
app.get('/api/broadcast', async (req, res) => {
    const latest = await Broadcast.findOne().sort({ timestamp: -1 });
    res.json(latest || {});
});

// POST /api/broadcast
app.post('/api/broadcast', async (req, res) => {
    const { message, type } = req.body;
    const broadcast = new Broadcast({ message, type });
    await broadcast.save();
    res.json({ success: true });
});

// DELETE /api/broadcast
app.delete('/api/broadcast', async (req, res) => {
    await Broadcast.deleteMany({});
    res.json({ success: true });
});

// --- Start the Server ---
// This will use the PORT environment variable from Render, or default to 5000 for local development
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

