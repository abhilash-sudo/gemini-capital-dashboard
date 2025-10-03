const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');

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

// --- MongoDB Connection ---
// NOTE: For Render deployment, you should set MONGO_URI as an environment variable in the Render dashboard.
// This code will use that variable.
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Successfully connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));


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
        console.log(`User logged in: ${email}`);
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

// --- Start the Server ---
// This will use the PORT environment variable from Render, or default to 5000 for local development
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
