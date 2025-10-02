document.addEventListener('DOMContentLoaded', () => {
    // =================================================================================
    // --- API Configuration - CRITICAL STEP ---
    // =================================================================================
    // IMPORTANT: You MUST replace the placeholder strings below with your own unique API keys.
    // The real-time data will not work without them.

    // 1. Get your free Alpha Vantage Key here: https://www.alphavantage.co/support/#api-key
    const ALPHA_VANTAGE_API_KEY = 'KTHKEVLWHQOT3KQ4'; // <-- PASTE YOUR ALPHA VANTAGE KEY

    // 2. Get your free FMP Key here: https://site.financialmodelingprep.com/developer/docs/
    const FMP_API_KEY = 'nO9hNolaCJBp7sauflXN21mUm7r82jHo';       // <-- PASTE YOUR FMP KEY

    // --- Element Selection ---
    const userNameDisplay = document.getElementById('user-name-display');
    const logoutBtn = document.getElementById('logout-btn');
    const themeToggle = document.getElementById('theme-checkbox');
    const searchBtn = document.getElementById('search-btn');
    const stockInput = document.getElementById('stock-symbol');
    const resultsSection = document.getElementById('results-section');
    const placeholderSection = document.getElementById('placeholder-section');
    const historyList = document.getElementById('history-list');
    const suggestionsList = document.getElementById('suggestions-list');
    const chartButtonContainer = document.querySelector('.chart-buttons');
    const companyNameDisplay = document.getElementById('company-name-display');
    const currentPriceDisplay = document.getElementById('current-price-display');
    const priceChangeDisplay = document.getElementById('price-change-display');
    const predictedPriceDisplay = document.getElementById('predicted-price-display');
    const confidenceDisplay = document.getElementById('confidence-display');
    const parametersDisplay = document.getElementById('parameters-display');
    const broadcastBanner = document.getElementById('broadcast-banner');
    const newsList = document.getElementById('news-list');
    const compareSelect = document.getElementById('compare-symbols');
    const favoritesList = document.getElementById('favorites-list');
    const saveFavoriteBtn = document.getElementById('save-favorite-btn');
    const bgMusic = document.getElementById('bg-music');
    const musicToggle = document.getElementById('music-toggle');

    // --- EXPANDED DATA FOR SUGGESTIONS ---
    const popularStocks = [
        // US Stocks (Big Tech & Blue Chip)
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

        // Adding more from various sectors to reach ~200
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
        { symbol: "MS", name: "Morgan Stanley" }, { symbol: "BLK", name: "BlackRock" },
        { symbol: "GS", name: "Goldman Sachs" }, { symbol: "SCHW", name: "Charles Schwab" },
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
        { symbol: "AEP", name: "American Electric Power" }, { symbol: "EXC", name: "Exelon Corporation" }
    ];

    // --- STATE MANAGEMENT ---
    let stockChart = null;
    let currentChartType = 'line';
    let searchHistory = JSON.parse(localStorage.getItem('stockSearchHistory')) || [];
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    // --- SESSION & USER MANAGEMENT (using localStorage version) ---
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    userNameDisplay.textContent = `Welcome, ${currentUser.name}`;
    logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    });
    
    // --- THEME TOGGLE LOGIC ---
    const applyTheme = (theme) => {
        document.body.classList.toggle('light-mode', theme === 'light');
        themeToggle.checked = theme === 'light';
        localStorage.setItem('theme', theme);
    };
    const savedTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(savedTheme);
    themeToggle.addEventListener('change', () => {
        const newTheme = themeToggle.checked ? 'light' : 'dark';
        applyTheme(newTheme);
    });

    // --- SEARCH HISTORY & SUGGESTIONS LOGIC ---
    const renderSearchHistory = () => {
        historyList.innerHTML = '';
        searchHistory.forEach(ticker => {
            const button = document.createElement('button');
            button.textContent = ticker;
            const li = document.createElement('li');
            li.appendChild(button);
            historyList.appendChild(li);
        });
    };
    const addToHistory = (ticker) => {
        if (!ticker) return;
        searchHistory = searchHistory.filter(item => item !== ticker);
        searchHistory.unshift(ticker);
        searchHistory = searchHistory.slice(0, 5);
        localStorage.setItem('stockSearchHistory', JSON.stringify(searchHistory));
        renderSearchHistory();
    };
    historyList.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            const ticker = e.target.textContent;
            stockInput.value = ticker;
            performSearch(ticker);
        }
    });
    const renderSuggestions = (query) => {
        suggestionsList.innerHTML = '';
        if (!query) return;
        const filteredStocks = popularStocks.filter(stock =>
            stock.symbol.toLowerCase().startsWith(query.toLowerCase()) ||
            stock.name.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 5);
        filteredStocks.forEach(stock => {
            const button = document.createElement('button');
            button.innerHTML = `<strong>${stock.symbol}</strong> - ${stock.name}`;
            const li = document.createElement('li');
            li.appendChild(button);
            suggestionsList.appendChild(li);
        });
    };
    stockInput.addEventListener('input', () => renderSuggestions(stockInput.value));
    suggestionsList.addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (button) {
            const symbol = button.querySelector('strong').textContent;
            stockInput.value = symbol;
            suggestionsList.innerHTML = '';
            performSearch(symbol);
        }
    });
    document.addEventListener('click', (e) => {
        if (!stockInput.contains(e.target) && !suggestionsList.contains(e.target)) {
            suggestionsList.innerHTML = '';
        }
    });

    // --- CHART & PREDICTION LOGIC ---
    const renderChart = (priceData) => {
        const ctx = document.getElementById('stockChart').getContext('2d');
        const historicalPrices = priceData.history.prices;
        const labels = priceData.history.labels;
        const predictedPrice = priceData.prediction;
        
        if (stockChart) stockChart.destroy();
        
        stockChart = new Chart(ctx, {
            type: currentChartType,
            data: {
                labels: [...labels, 'Prediction'],
                datasets: [{
                    label: 'Historical Price',
                    data: [...historicalPrices, currentChartType !== 'radar' ? null : predictedPrice],
                    borderColor: '#58a6ff', backgroundColor: 'rgba(88, 166, 255, 0.2)',
                    fill: currentChartType === 'line', tension: 0.4,
                }, {
                    label: 'Predicted Price',
                    data: [...Array(historicalPrices.length).fill(null), predictedPrice],
                    borderColor: '#3fb950', backgroundColor: '#3fb950',
                    pointRadius: currentChartType === 'line' ? 6 : undefined,
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false, animation: { duration: 1000, easing: 'easeInOutQuart' },
                plugins: { legend: { labels: { color: 'var(--muted-foreground)' } } },
                scales: {
                    y: { ticks: { color: 'var(--muted-foreground)' }, grid: { color: 'var(--border)' } },
                    x: { ticks: { color: 'var(--muted-foreground)' }, grid: { color: 'var(--border)' } }
                }
            }
        });
    };
    chartButtonContainer.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON' && !e.target.classList.contains('active')) {
            chartButtonContainer.querySelector('.active').classList.remove('active');
            e.target.classList.add('active');
            currentChartType = e.target.dataset.chartType;
            if(resultsSection.style.display === 'block'){
                performSearch(stockInput.value.trim().toUpperCase());
            }
        }
    });

    const generateAndDisplayMockData = (ticker) => {
        console.warn("API limit likely reached. Falling back to mock data.");
        const stockData = popularStocks.find(s => s.symbol.toLowerCase() === ticker.toLowerCase()) || { name: `${ticker} Company` };
        const currentPrice = Math.random() * 200 + 100;
        const priceChange = (Math.random() - 0.5) * 10;
        const predictedPrice = currentPrice * (1 + (Math.random() - 0.45) * 0.1);

        const dates = Array.from({ length: 30 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (29 - i));
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        const historicalPrices = dates.map(() => currentPrice + (Math.random() - 0.5) * 20);

        companyNameDisplay.textContent = `${stockData.name} (${ticker})`;
        currentPriceDisplay.textContent = `$${currentPrice.toFixed(2)}`;
        priceChangeDisplay.textContent = `${priceChange.toFixed(2)} (${(priceChange/currentPrice*100).toFixed(2)}%)`;
        priceChangeDisplay.className = `price-change ${priceChange >= 0 ? 'positive' : 'negative'}`;
        predictedPriceDisplay.textContent = `$${predictedPrice.toFixed(2)}`;
        confidenceDisplay.textContent = `${(Math.random() * 15 + 80).toFixed(1)}%`;
        
        renderChart({ history: { prices: historicalPrices, labels: dates }, prediction: predictedPrice });
    };
    
    const fetchWithFallback = async (ticker) => {
        // Try Alpha Vantage First
        try {
            console.log("Attempting to fetch from Alpha Vantage...");
            if (ALPHA_VANTAGE_API_KEY === 'YOUR_API_KEY_HERE') throw new Error('Alpha Vantage API key is missing.');
            const quoteUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${ALPHA_VANTAGE_API_KEY}`;
            const historyUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${ticker}&apikey=${ALPHA_VANTAGE_API_KEY}`;
            const [quoteResponse, historyResponse] = await Promise.all([fetch(quoteUrl), fetch(historyUrl)]);
            if (!quoteResponse.ok || !historyResponse.ok) throw new Error('AV network response was not ok');
            const quoteData = await quoteResponse.json();
            const historyData = await historyResponse.json();
            if (quoteData.Note || historyData.Note) throw new Error('Alpha Vantage API limit reached.');
            const quote = quoteData['Global Quote'];
            const timeSeries = historyData['Time Series (Daily)'];
            if (!quote || !timeSeries || Object.keys(quote).length === 0 || !quote['05. price']) {
                throw new Error(`No data for symbol: ${ticker} from Alpha Vantage.`);
            }
            const dates = Object.keys(timeSeries).slice(0, 30).reverse();
            return {
                price: parseFloat(quote['05. price']),
                change: parseFloat(quote['09. change']),
                changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
                history: {
                    prices: dates.map(date => parseFloat(timeSeries[date]['4. close'])),
                    labels: dates.map(date => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
                }
            };
        } catch (avError) {
            console.warn(`Alpha Vantage failed: ${avError.message}. Trying FMP as backup.`);
            
            // Fallback to Financial Modeling Prep
            try {
                console.log("Attempting to fetch from Financial Modeling Prep...");
                if (FMP_API_KEY === 'YOUR_FMP_API_KEY_HERE') throw new Error('FMP API key is missing.');
                const quoteUrl = `https://financialmodelingprep.com/api/v3/quote/${ticker}?apikey=${FMP_API_KEY}`;
                const historyUrl = `https://financialmodelingprep.com/api/v3/historical-price-full/${ticker}?apikey=${FMP_API_KEY}`;
                const [quoteResponse, historyResponse] = await Promise.all([fetch(quoteUrl), fetch(historyUrl)]);
                if (!quoteResponse.ok || !historyResponse.ok) throw new Error('FMP network response was not ok');
                const quoteData = (await quoteResponse.json())[0];
                const historyData = await historyResponse.json();
                if (!quoteData || !historyData || !historyData.historical || historyData.historical.length === 0) {
                    throw new Error(`No data for symbol: ${ticker} from FMP.`);
                }
                const historical = historyData.historical.slice(0, 30).reverse();
                return {
                    price: quoteData.price,
                    change: quoteData.change,
                    changePercent: quoteData.changesPercentage,
                    volume: quoteData.volume,
                    marketCap: quoteData.marketCap,
                    pe: quoteData.pe,
                    history: {
                        prices: historical.map(item => item.close),
                        labels: historical.map(item => new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
                    }
                };
            } catch (fmpError) {
                console.error(`FMP also failed: ${fmpError.message}.`);
                throw new Error("Both real-time data sources failed.");
            }
        }
    };

    // THIS FUNCTION IS NOW UPDATED TO CALL THE PYTHON ML SERVER
    const performSearch = async (ticker) => {
        if (!ticker) return;
        const spinner = document.getElementById('spinner');
        const buttonText = document.getElementById('button-text');
        
        buttonText.style.display = 'none';
        spinner.style.display = 'block';
        searchBtn.disabled = true;

        try {
            // First, get the current market data like before
            const data = await fetchWithFallback(ticker);

            // --- NEW: Call the Python ML Server for a prediction ---
            const predictionResponse = await fetch('http://localhost:5001/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ticker: ticker })
            });

            if (!predictionResponse.ok) {
                // If the prediction fails, log it and proceed with a mock value
                console.error('Prediction server failed. Falling back to mock prediction.');
                throw new Error('Prediction server failed');
            }

            const predictionResult = await predictionResponse.json();
            const predictedPrice = predictionResult.predictedPrice;
            // --- End of new code ---

            // Update UI with real data and the new ML prediction
            companyNameDisplay.textContent = popularStocks.find(s => s.symbol.toLowerCase() === ticker.toLowerCase())?.name || `${ticker} Company`;
            currentPriceDisplay.textContent = `$${data.price.toFixed(2)}`;
            priceChangeDisplay.textContent = `${data.change.toFixed(2)} (${data.changePercent.toFixed(2)}%)`;
            priceChangeDisplay.className = `price-change ${data.change >= 0 ? 'positive' : 'negative'}`;
            
            // This now comes from your Python SVR model!
            predictedPriceDisplay.textContent = `$${predictedPrice.toFixed(2)}`;
            confidenceDisplay.textContent = `${(predictionResult.r2Score * 100).toFixed(1)}%`; // Using r2Score as confidence

            document.getElementById('volume-display').textContent = data.volume ? data.volume.toLocaleString() : '--';
            document.getElementById('marketcap-display').textContent = data.marketCap ? `$${(data.marketCap/1e9).toFixed(2)}B` : '--';
            document.getElementById('pe-display').textContent = data.pe ? data.pe.toFixed(2) : '--';
            
            renderChart({ history: data.history, prediction: predictedPrice });

        } catch (error) {
            console.error("An error occurred during search:", error);
            alert("Could not fetch real-time data or prediction. Please ensure both servers are running and API keys are valid. Falling back to simulated data.");
            generateAndDisplayMockData(ticker); // Fallback to mock data on error
        } finally {
            buttonText.style.display = 'inline';
            spinner.style.display = 'none';
            searchBtn.disabled = false;
            placeholderSection.style.display = 'none';
            resultsSection.style.display = 'block';
            addToHistory(ticker);
        }
    };

    let pollingInterval = null;
    function startPolling(symbol) {
        if (pollingInterval) clearInterval(pollingInterval);
        pollingInterval = setInterval(() => performSearch(symbol), 60000); // every 60 seconds
    }
    searchBtn.addEventListener('click', () => {
        const symbol = stockInput.value.trim().toUpperCase();
        if (symbol) {
            performSearch(symbol);
            startPolling(symbol);
        }
    });


    saveFavoriteBtn.addEventListener('click', () => {
        const symbol = stockInput.value.trim().toUpperCase();
        if (symbol && !favorites.includes(symbol)) {
            favorites.push(symbol);
            localStorage.setItem('favorites', JSON.stringify(favorites));
            renderFavorites();
        }
    });
    function renderFavorites() {
        favoritesList.innerHTML = '';
        favorites.forEach(symbol => {
            const li = document.createElement('li');
            li.textContent = symbol;
            favoritesList.appendChild(li);
        });
    }

    stockInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            const symbol = stockInput.value.trim().toUpperCase();
            if (symbol) {
                performSearch(symbol);
                startPolling(symbol);
            }
        }
    });
    
    // --- NEWS, BROADCAST, AND INITIAL ANIMATIONS ---
    const rssFeeds = [
        'https://rss.app/feeds/wT8L370TP8YtmpaD.xml',
        'https://feeds.finance.yahoo.com/rss/2.0/headline?s=AAPL,MSFT,GOOG,AMZN&region=US&lang=en-US',
        'https://www.investing.com/rss/news_25.rss'
    ];
    const fetchNews = async () => {
        let allItems = [];
        for (const rssUrl of rssFeeds) {
            try {
                const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.status === 'ok' && data.items) allItems = allItems.concat(data.items);
                }
            } catch {}
        }
        displayNews(allItems.length ? allItems : []);
    };

    const displayNews = (items) => {
        newsList.innerHTML = '';
        if (items.length === 0) {
            newsList.innerHTML = '<li class="news-placeholder">Could not load news feeds.</li>';
            return;
        }
        items.slice(0, 4).forEach(item => {
            const li = document.createElement('li');
            const timeAgo = item.pubDate ? Math.round((new Date() - new Date(item.pubDate)) / (1000 * 60 * 60)) : Math.floor(Math.random() * 5) + 1;
            
            li.innerHTML = `
                <a href="${item.link}" target="_blank" rel="noopener noreferrer">${item.title}</a>
                <span>${item.author || 'News Source'} - ${timeAgo}h ago</span>
            `;
            newsList.appendChild(li);
        });
    };

    if (broadcastBanner) {
        const broadcastMessage = JSON.parse(localStorage.getItem('broadcastMessage'));
        if (broadcastMessage) {
            broadcastBanner.textContent = broadcastMessage.message;
            broadcastBanner.className = `broadcast-banner ${broadcastMessage.type}`;
            broadcastBanner.style.display = 'block';
        }
    }

    renderSearchHistory();
    renderFavorites(); // Render favorites on initial load
    fetchNews();
    const fadeInCards = document.querySelectorAll('.fade-in-card');
    fadeInCards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('visible');
        }, 100 * (index + 1));
    });

    // --- COMPARISON CHART LOGIC ---
    popularStocks.forEach(stock => {
        const option = document.createElement('option');
        option.value = stock.symbol;
        option.textContent = `${stock.symbol} - ${stock.name}`;
        compareSelect.appendChild(option);
    });
    compareSelect.addEventListener('change', async () => {
        const selected = Array.from(compareSelect.selectedOptions).map(opt => opt.value);
        if (selected.length === 0) return;
        const datasets = [];
        let labels = [];
        for (const symbol of selected) {
            try {
                const data = await fetchWithFallback(symbol);
                if (data && data.history) {
                    datasets.push({
                        label: symbol,
                        data: data.history.prices,
                        borderColor: '#' + Math.floor(Math.random()*16777215).toString(16),
                        fill: false,
                        tension: 0.4
                    });
                    if(labels.length === 0) labels = data.history.labels;
                }
            } catch (error) {
                console.error(`Could not fetch data for comparison symbol: ${symbol}`, error);
            }
        }
        // Render comparison chart
        stockChart && stockChart.destroy();
        const ctx = document.getElementById('stockChart').getContext('2d');
        stockChart = new Chart(ctx, {
            type: 'line',
            data: { labels, datasets },
            options: { responsive: true, maintainAspectRatio: false }
        });
        resultsSection.style.display = 'block';
        placeholderSection.style.display = 'none';
    });

    async function fetchRedditSentiment(symbol) {
        const RAPIDAPI_KEY = 'YOUR_RAPIDAPI_KEY';
        if (RAPIDAPI_KEY === 'YOUR_RAPIDAPI_KEY' || !symbol) {
             document.getElementById('sentiment-score').textContent = `Sentiment analysis not configured.`;
             return;
        }
        const subreddit = 'stocks';
        const url = `https://www.reddit.com/r/${subreddit}/search.json?q=${symbol}&restrict_sr=1&sort=new&limit=10`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            const posts = data.data.children.map(child => child.data.title);
            if (posts.length === 0) {
                 document.getElementById('sentiment-score').textContent = `No recent posts found for ${symbol}.`;
                return;
            }
            const sentimentResults = await Promise.all(posts.map(async post => {
                const sentimentRes = await fetch('https://twinword-sentiment-analysis.p.rapidapi.com/analyze/', {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/x-www-form-urlencoded',
                        'X-RapidAPI-Key': RAPIDAPI_KEY,
                        'X-RapidAPI-Host': 'twinword-sentiment-analysis.p.rapidapi.com'
                    },
                    body: new URLSearchParams({ text: post })
                });
                if (!sentimentRes.ok) return { score: 0, type: 'neutral', text: post };
                const sentimentData = await sentimentRes.json();
                return { text: post, score: sentimentData.score || 0, type: sentimentData.type || 'neutral' };
            }));
            const avgScore = sentimentResults.reduce((sum, r) => sum + r.score, 0) / sentimentResults.length;
            document.getElementById('sentiment-score').textContent = `Avg Sentiment: ${avgScore.toFixed(2)}`;
            const postsList = document.getElementById('sentiment-posts');
            postsList.innerHTML = '';
            sentimentResults.slice(0, 3).forEach(r => {
                const li = document.createElement('li');
                li.textContent = `[${r.type}] ${r.text}`;
                postsList.appendChild(li);
            });
        } catch (error) {
            console.error('Error fetching Reddit sentiment:', error);
            document.getElementById('sentiment-score').textContent = 'Could not fetch sentiment.';
        }
    }

    // --- MUSIC TOGGLE LOGIC (REVISED FOR ROBUSTNESS) ---
    bgMusic.volume = 0.2;

    function enableAudioOnFirstInteraction() {
        const playPromise = bgMusic.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                musicToggle.textContent = '🔊';
            }).catch(error => {
                console.warn("Music autoplay blocked, requires direct click on toggle.", error);
                musicToggle.textContent = '🔇';
            });
        }
        document.body.removeEventListener('click', enableAudioOnFirstInteraction);
        document.body.removeEventListener('keydown', enableAudioOnFirstInteraction);
    }
    document.body.addEventListener('click', enableAudioOnFirstInteraction);
    document.body.addEventListener('keydown', enableAudioOnFirstInteraction);

    musicToggle.addEventListener('click', () => {
        if (bgMusic.paused) {
            bgMusic.play();
            musicToggle.textContent = '🔊';
        } else {
            bgMusic.pause();
            musicToggle.textContent = '🔇';
        }
    });

    // --- USER DATA FETCHING & SAVING (COMMENTED OUT TO USE LOCALSTORAGE) ---
    /*
    const username = currentUser.name.toLowerCase();
    const apiUrl = `http://localhost:5000/api/user/${username}`;

    const fetchUserData = async () => {
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            if (data.favorites) favorites = data.favorites;
            if (data.theme) applyTheme(data.theme);
            renderFavorites();
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    const saveUserData = async (userData) => {
        await fetch(`http://localhost:5000/api/user/${username}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
    };

    // Fetch user data on load
    fetchUserData();
    */
});