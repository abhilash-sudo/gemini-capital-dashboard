const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/stockapp', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Successfully connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));


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


// --- API Routes ---

// GET /api/user/:email - Get user data by email
app.get('/api/user/:email', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email }).select('-password'); // Exclude password from result
        res.json(user || {});
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/user/:email - Save user data (favorites, theme)
app.post('/api/user/:email', async (req, res) => {
    try {
        const { favorites, theme } = req.body;
        const user = await User.findOneAndUpdate(
            { email: req.params.email },
            { favorites, theme },
            { new: true, upsert: true } // Options: return updated doc, and create if it doesn't exist
        );
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// POST /api/register - Register new user
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

// POST /api/login - Handles user login
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid email or password.' });
        }

        // Compare submitted password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid email or password.' });
        }

        // Login successful, send back user data (without the password)
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

// POST /api/user/:email/search-history - Add search history
app.post('/api/user/:email/search-history', async (req, res) => {
    try {
        const { searchTerm } = req.body;
        const user = await User.findOne({ email: req.params.email });
        if (!user) return res.status(404).json({ error: 'User not found' });
        user.searchHistory.unshift(searchTerm); // Add to the beginning of the array
        user.searchHistory = user.searchHistory.slice(0, 10); // Keep only the last 10 searches
        await user.save();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET /api/admins - Get admin data
app.get('/api/admins', async (req, res) => {
    try {
        const admins = await User.find({ role: 'admin' }).select('-password');
        res.json(admins);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.listen(5000, () => console.log('Server running on http://localhost:5000'));