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


// --- TEMPORARY: Full Data for Seeding the Database ---
const popularStocks = [
    // US Stocks
    { symbol: "AAPL", name: "Apple Inc." }, { symbol: "MSFT", name: "Microsoft Corp." },
    { symbol: "GOOGL", name: "Alphabet Inc. (Class A)" }, { symbol: "GOOG", name: "Alphabet Inc. (Class C)" },
    { symbol: "AMZN", name: "Amazon.com, Inc." }, { symbol: "NVDA", name: "NVIDIA Corporation" },
    { symbol: "TSLA", name: "Tesla, Inc." }, { symbol: "META", name: "Meta Platforms, Inc." },
    { symbol: "BRK-B", name: "Berkshire Hathaway Inc." }, { symbol: "JPM", name: "JPMorgan Chase & Co." },
    { symbol: "JNJ", name: "Johnson & Johnson" }, { symbol: "V", name: "Visa Inc." },
    { symbol: "WMT", name: "Walmart Inc." }, { symbol: "PG", name: "Procter & Gamble Co." },
    { symbol: "UNH", name: "UnitedHealth Group Inc." }, { symbol: "HD", name: "The Home Depot, Inc." },
    { symbol: "MA", name: "Mastercard Incorporated" }, { symbol: "BAC", name: "Bank of America Corp" },
    { symbol: "XOM", name: "Exxon Mobil Corporation" }, { symbol: "CVX", name: "Chevron Corporation" },
    { symbol: "KO", name: "The Coca-Cola Company" }, { symbol: "PEP", name: "PepsiCo, Inc." },
    { symbol: "PFE", name: "Pfizer Inc." }, { symbol: "DIS", name: "The Walt Disney Company" },
    { symbol: "CSCO", name: "Cisco Systems, Inc." }, { symbol: "MRK", name: "Merck & Co., Inc." },
    { symbol: "ADBE", name: "Adobe Inc." }, { symbol: "CRM", name: "Salesforce, Inc." },
    { symbol: "NFLX", name: "Netflix, Inc." }, { symbol: "ORCL", name: "Oracle Corporation" },
    { symbol: "MCD", name: "McDonald's Corporation" }, { symbol: "NKE", name: "NIKE, Inc." },
    { symbol: "INTC", name: "Intel Corporation" }, { symbol: "AMD", name: "Advanced Micro Devices, Inc." },
    { symbol: "QCOM", name: "QUALCOMM Incorporated" }, { symbol: "T", name: "AT&T Inc." },
    { symbol: "VZ", name: "Verizon Communications Inc." }, { symbol: "UBER", name: "Uber Technologies, Inc." },
    { symbol: "SBUX", name: "Starbucks Corporation" }, { symbol: "F", name: "Ford Motor Company" },
    { symbol: "GM", name: "General Motors Company" }, { symbol: "PYPL", name: "PayPal Holdings, Inc." },
    { symbol: "CAT", name: "Caterpillar Inc." }, { symbol: "GS", name: "Goldman Sachs Group" },
    { symbol: "IBM", name: "IBM" }, { symbol: "BA", name: "Boeing Co." },
    { symbol: "GE", name: "General Electric" }, { symbol: "AXP", name: "American Express" },
    { symbol: "MMM", name: "3M Company" }, { symbol: "DOW", name: "Dow Inc." },
    { symbol: "TRV", name: "The Travelers Companies" }, { symbol: "HON", name: "Honeywell International" },
    { symbol: "AMGN", name: "Amgen Inc." }, { symbol: "UNP", name: "Union Pacific" },
    { symbol: "LOW", name: "Lowe's Companies" }, { symbol: "BLK", name: "BlackRock, Inc." },
    { symbol: "DE", name: "Deere & Company" }, { symbol: "SPGI", name: "S&P Global" },
    { symbol: "PLD", name: "Prologis, Inc." }, { symbol: "GILD", name: "Gilead Sciences" },
    { symbol: "RTX", name: "RTX Corporation" }, { symbol: "MDLZ", name: "Mondelez International" },
    { symbol: "TJX", name: "TJX Companies" }, { symbol: "C", name: "Citigroup Inc." },
    { symbol: "ZTS", name: "Zoetis Inc." }, { symbol: "MO", name: "Altria Group" },
    { symbol: "AMT", name: "American Tower" }, { symbol: "TMO", name: "Thermo Fisher Scientific" },
    { symbol: "CVS", name: "CVS Health" }, { symbol: "CI", name: "The Cigna Group" },
    { symbol: "COP", name: "ConocoPhillips" }, { symbol: "EOG", name: "EOG Resources" },
    { symbol: "FDX", name: "FedEx Corporation" }, { symbol: "UPS", name: "United Parcel Service" },
    { symbol: "LMT", name: "Lockheed Martin" }, { symbol: "NOC", name: "Northrop Grumman" },
    { symbol: "GD", name: "General Dynamics" }, { symbol: "COST", name: "Costco Wholesale" },
    { symbol: "TGT", name: "Target Corporation" }, { symbol: "WFC", name: "Wells Fargo" },
    { symbol: "MS", name: "Morgan Stanley" }, { symbol: "SCHW", name: "Charles Schwab" },
    { symbol: "PNC", name: "PNC Financial Services" }, { symbol: "USB", name: "U.S. Bancorp" },
    { symbol: "BK", name: "The Bank of New York Mellon" }, { symbol: "AIG", name: "American International Group" },
    { symbol: "MET", name: "MetLife, Inc." }, { symbol: "PRU", name: "Prudential Financial" },
    { symbol: "ALL", name: "The Allstate Corporation" }, { symbol: "HIG", name: "The Hartford" },
    { symbol: "CL", name: "Colgate-Palmolive" }, { symbol: "KMB", name: "Kimberly-Clark" },
    { symbol: "GIS", name: "General Mills" }, { symbol: "K", name: "Kellanova" },
    { symbol: "SYY", name: "Sysco Corporation" }, { symbol: "ADM", name: "Archer-Daniels-Midland" },
    { symbol: "HRL", name: "Hormel Foods" }, { symbol: "TSN", name: "Tyson Foods" },
    { symbol: "KR", name: "The Kroger Co." }, { symbol: "ACI", name: "Albertsons Companies" },
    { symbol: "BBY", name: "Best Buy Co." }, { symbol: "GME", name: "GameStop Corp." },
    { symbol: "AMC", name: "AMC Entertainment" }, { symbol: "BB", name: "BlackBerry Limited" },
    { symbol: "NOK", name: "Nokia Oyj" }, { symbol: "ERIC", name: "Ericsson" },
    { symbol: "SNAP", name: "Snap Inc." }, { symbol: "PINS", name: "Pinterest, Inc." },
    { symbol: "TWTR", name: "X (Twitter)" }, { symbol: "SPOT", name: "Spotify Technology" },
    { symbol: "ROKU", name: "Roku, Inc." }, { symbol: "SQ", name: "Block, Inc." },
    { symbol: "SHOP", name: "Shopify Inc." }, { symbol: "SNOW", name: "Snowflake Inc." },
    { symbol: "U", name: "Unity Software Inc." }, { symbol: "RBLX", name: "Roblox Corporation" },
    { symbol: "COIN", name: "Coinbase Global" }, { symbol: "HOOD", name: "Robinhood Markets" },
    { symbol: "MSTR", name: "MicroStrategy Inc." }, { symbol: "MARA", name: "Marathon Digital" },
    { symbol: "RIOT", name: "Riot Platforms" }, { symbol: "PLTR", name: "Palantir Technologies" },
    { symbol: "SOFI", name: "SoFi Technologies" }, { symbol: "AFRM", name: "Affirm Holdings" },
    { symbol: "UPST", name: "Upstart Holdings" }, { symbol: "RIVN", name: "Rivian Automotive" },
    { symbol: "LCID", name: "Lucid Group" }, { symbol: "FSR", name: "Fisker Inc." },
    { symbol: "NKLA", name: "Nikola Corporation" }, { symbol: "CHPT", name: "ChargePoint Holdings" },
    { symbol: "BLNK", name: "Blink Charging" }, { symbol: "PLUG", name: "Plug Power Inc." },
    { symbol: "FCEL", name: "FuelCell Energy" }, { symbol: "BE", name: "Bloom Energy" },
    { symbol: "ENPH", name: "Enphase Energy" }, { symbol: "SEDG", name: "SolarEdge Technologies" },
    { symbol: "FSLR", name: "First Solar" }, { symbol: "SPWR", name: "SunPower Corporation" },
    { symbol: "RUN", name: "Sunrun Inc." }, { symbol: "ARRY", name: "Array Technologies" },
    { symbol: "NEE", name: "NextEra Energy" }, { symbol: "DUK", name: "Duke Energy" },
    { symbol: "SO", name: "The Southern Company" }, { symbol: "D", name: "Dominion Energy" },
    { symbol: "AEP", name: "American Electric Power" }, { symbol: "EXC", name: "Exelon Corporation" },
    
    // Indian Stocks (NSE)
    { symbol: "RELIANCE.NS", name: "Reliance Industries" }, { symbol: "TCS.NS", name: "Tata Consultancy Services" },
    { symbol: "HDFCBANK.NS", name: "HDFC Bank" }, { symbol: "INFY.NS", name: "Infosys" },
    { symbol: "ICICIBANK.NS", name: "ICICI Bank" }, { symbol: "HINDUNILVR.NS", name: "Hindustan Unilever" },
    { symbol: "SBIN.NS", name: "State Bank of India" }, { symbol: "BHARTIARTL.NS", name: "Bharti Airtel" },
    { symbol: "ITC.NS", name: "ITC Limited" }, { symbol: "LT.NS", name: "Larsen & Toubro" },
    { symbol: "BAJFINANCE.NS", name: "Bajaj Finance" }, { symbol: "MARUTI.NS", name: "Maruti Suzuki India" },
    { symbol: "TATAMOTORS.NS", name: "Tata Motors" }, { symbol: "WIPRO.NS", name: "Wipro" },
    { symbol: "KOTAKBANK.NS", name: "Kotak Mahindra Bank" }, { symbol: "ASIANPAINT.NS", name: "Asian Paints" },
    { symbol: "HCLTECH.NS", name: "HCL Technologies" }, { symbol: "TITAN.NS", name: "Titan Company" },
    { symbol: "ADANIENT.NS", name: "Adani Enterprises" }, { symbol: "AXISBANK.NS", name: "Axis Bank" },
    { symbol: "SUNPHARMA.NS", name: "Sun Pharmaceutical" }, { symbol: "BAJAJFINSV.NS", name: "Bajaj Finserv" },
    { symbol: "M&M.NS", name: "Mahindra & Mahindra" }, { symbol: "ULTRACEMCO.NS", name: "UltraTech Cement" },
    { symbol: "TATASTEEL.NS", name: "Tata Steel" }, { symbol: "INDUSINDBK.NS", name: "IndusInd Bank" },
    { symbol: "NTPC.NS", name: "NTPC Limited" }, { symbol: "JSWSTEEL.NS", name: "JSW Steel" },
    
    // European Stocks
    { symbol: "LVMH.PA", name: "LVMH Moët Hennessy" }, { symbol: "ASML.AS", name: "ASML Holding" },
    { symbol: "VOW3.DE", name: "Volkswagen AG" }, { symbol: "SIE.DE", name: "Siemens AG" },
    { symbol: "SAP.DE", name: "SAP SE" }, { symbol: "NESN.SW", name: "Nestlé S.A." },
    { symbol: "NOVN.SW", name: "Novartis AG" }, { symbol: "SHEL.L", name: "Shell plc" },
    { symbol: "AZN.L", name: "AstraZeneca PLC" }, { symbol: "HSBA.L", name: "HSBC Holdings plc" },
    { symbol: "RMS.PA", name: "Hermès International" }, { symbol: "DTE.DE", name: "Deutsche Telekom AG" },
    { symbol: "AIR.PA", name: "Airbus SE" }, { symbol: "BMW.DE", name: "BMW AG" },
    
    // Asian Stocks
    { symbol: "BABA", name: "Alibaba Group" }, { symbol: "7203.T", name: "Toyota Motor Corp" },
    { symbol: "6758.T", name: "Sony Group Corporation" }, { symbol: "005930.KS", name: "Samsung Electronics" },
    { symbol: "2330.TW", name: "TSMC" }, { symbol: "0700.HK", name: "Tencent Holdings" },
];

// --- Database Seeding Function ---
const seedDatabase = async () => {
    try {
        const stockCount = await Stock.countDocuments();
        if (stockCount === 0) {
            console.log('No stocks found in DB, seeding initial list...');
            // We use insertMany with ordered:false to prevent one duplicate from stopping the whole process
            await Stock.insertMany(popularStocks, { ordered: false });
            console.log(`Database seeded with ${popularStocks.length} stocks.`);
        } else {
            console.log('Database already contains stocks. Seeding not required.');
        }
    } catch (error) {
        // This will catch duplicate key errors if some stocks exist, but not all
        if (error.code === 11000) {
             console.log('Some initial stocks already exist, skipping duplicates.');
        } else {
            console.error('Error seeding database:', error);
        }
    }
};

// --- MongoDB Connection ---
mongoose.connect('mongodb://localhost:27017/stockapp', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Successfully connected to MongoDB');
        // Run the seeding function after connecting
        seedDatabase();
    })
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

// POST /api/user/:email/search-history
app.post('/api/user/:email/search-history', async (req, res) => {
    try {
        const { searchTerm } = req.body;
        const user = await User.findOne({ email: req.params.email });
        if (!user) return res.status(404).json({ error: 'User not found' });
        user.searchHistory.unshift(searchTerm);
        user.searchHistory = user.searchHistory.slice(0, 10);
        await user.save();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET /api/admins
app.get('/api/admins', async (req, res) => {
    try {
        const admins = await User.find({ role: 'admin' }).select('-password');
        res.json(admins);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
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

        const existingStock = await Stock.findOne({ symbol: symbol.toUpperCase() });
        if (existingStock) {
            return res.status(400).json({ message: 'This stock symbol already exists.' });
        }

        const newStock = new Stock({ symbol, name });
        await newStock.save();
        res.status(201).json(newStock);

    } catch (error) {
        res.status(500).json({ message: 'Server error adding new stock' });
    }
});


app.listen(5000, () => console.log('Server running on http://localhost:5000'));