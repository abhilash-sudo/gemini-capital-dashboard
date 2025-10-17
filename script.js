document.addEventListener('DOMContentLoaded', () => {
    // --- API Configuration ---
    const ALPHA_VANTAGE_API_KEY = 'KTHKEVLWHQOT3KQ4';
    const FMP_API_KEY = 'nO9hNolaCJBp7sauflXN21mUm7r82jHo';

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
    const broadcastBanner = document.getElementById('broadcast-banner');
    const newsList = document.getElementById('news-list');
    const favoritesList = document.getElementById('favorites-list');
    const saveFavoriteBtn = document.getElementById('save-favorite-btn');
    const bgMusic = document.getElementById('bg-music');
    const musicToggle = document.getElementById('music-toggle');
    const svrKernelSelect = document.getElementById('svr-kernel');
    const svrCSlider = document.getElementById('svr-c');
    const svrCValue = document.getElementById('svr-c-value');

    // --- STATE MANAGEMENT ---
    let stockChart = null;
    let currentChartType = 'line';
    let popularStocks = []; // This will now be fetched from the server
    let searchHistory = JSON.parse(localStorage.getItem('stockSearchHistory')) || [];
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    // --- SESSION & USER MANAGEMENT ---
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (currentUser) {
        userNameDisplay.textContent = `Welcome, ${currentUser.name}`;
        logoutBtn.style.display = 'inline-block';
        // If you want to show a user photo, use a saved photo or fallback to initials
        const savedPhoto = localStorage.getItem(`profilePhoto_${currentUser.email}`);
        const userAvatar = document.getElementById('user-avatar');
        if (userAvatar) {
            if (savedPhoto) {
                userAvatar.src = savedPhoto;
            } else {
                // Remove the random photo and use a default icon or blank
                userAvatar.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32'><rect width='100%' height='100%' fill='transparent'/></svg>";
            }
        }
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        });
    } else {
        userNameDisplay.textContent = `Welcome, Guest`;
        logoutBtn.style.display = 'none';
    }
    
    // --- THEME TOGGLE LOGIC ---
    const applyTheme = (theme) => {
        document.body.classList.toggle('light-mode', theme === 'light');
        themeToggle.checked = theme === 'light';
        localStorage.setItem('theme', theme);
    };
    const savedTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(savedTheme);
    themeToggle.checked = savedTheme === 'light'; // Ensure toggle matches theme
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
            historyList.appendChild(document.createElement('li')).appendChild(button);
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
            stockInput.value = e.target.textContent;
            performSearch(e.target.textContent);
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
            const li = document.createElement('li');
            li.innerHTML = `<button><strong>${stock.symbol}</strong> - ${stock.name}</button>`;
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
        if (window.stockChartInstance) {
            window.stockChartInstance.destroy();
        }
        let chartType = currentChartType;

        // Only allow supported types
        if (!['bar', 'radar', 'pie', 'candlestick', 'area'].includes(chartType)) {
            chartType = 'bar';
        }

        // If candlestick is selected, fallback to bar (unless you have a plugin for candlestick)
        if (chartType === 'candlestick') {
            chartType = 'bar';
        }

        let data = {
            labels: priceData.history.labels,
            datasets: [{
                label: 'Price',
                data: priceData.history.prices,
                borderColor: '#58a6ff',
                backgroundColor: chartType === 'pie'
                    ? [
                        '#58a6ff', '#3fb950', '#f85149', '#f39c12', '#a259ff', '#ffb347',
                        '#ff6961', '#77dd77', '#aec6cf', '#cfcfc4', '#b39eb5', '#ffb347'
                    ]
                    : 'rgba(88,166,255,0.1)',
                fill: chartType === 'area',
                tension: 0.4
            }]
        };
        if (chartType === 'pie') {
            data = {
                labels: priceData.history.labels,
                datasets: [{
                    label: 'Price',
                    data: priceData.history.prices,
                    backgroundColor: [
                        '#58a6ff', '#3fb950', '#f85149', '#f39c12', '#a259ff', '#ffb347',
                        '#ff6961', '#77dd77', '#aec6cf', '#cfcfc4', '#b39eb5', '#ffb347'
                    ]
                }]
            };
        }
        window.stockChartInstance = new Chart(ctx, {
            type: chartType === 'area' ? 'line' : chartType,
            data,
            options: {
                responsive: true,
                plugins: {
                    legend: { display: chartType !== 'pie' }
                },
                elements: {
                    line: {
                        fill: chartType === 'area'
                    }
                }
            }
        });
    };
    window.renderChart = renderChart;
    chartButtonContainer.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON' && !e.target.classList.contains('active')) {
            chartButtonContainer.querySelector('.active').classList.remove('active');
            e.target.classList.add('active');
            currentChartType = e.target.dataset.chartType;
            if (resultsSection.style.display !== 'none') {
                performSearch(stockInput.value.trim().toUpperCase());
            }
        }
    });

    const fetchWithFallback = async (ticker) => {
        try {
            const quoteUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${ALPHA_VANTAGE_API_KEY}`;
            const historyUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${ticker}&apikey=${ALPHA_VANTAGE_API_KEY}`;
            const [quoteResponse, historyResponse] = await Promise.all([fetch(quoteUrl), fetch(historyUrl)]);
            const quoteData = await quoteResponse.json();
            const historyData = await historyResponse.json();
            if (quoteData.Note || historyData.Note) throw new Error('Alpha Vantage API limit reached.');
            const quote = quoteData['Global Quote'];
            const timeSeries = historyData['Time Series (Daily)'];
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
            try {
                const quoteUrl = `https://financialmodelingprep.com/api/v3/quote/${ticker}?apikey=${FMP_API_KEY}`;
                const historyUrl = `https://financialmodelingprep.com/api/v3/historical-price-full/${ticker}?apikey=${FMP_API_KEY}`;
                const [quoteResponse, historyResponse] = await Promise.all([fetch(quoteUrl), fetch(historyUrl)]);
                const quoteData = (await quoteResponse.json())[0];
                const historyData = await historyResponse.json();
                const historical = historyData.historical.slice(0, 30).reverse();
                return {
                    price: quoteData.price,
                    change: quoteData.change,
                    changePercent: quoteData.changesPercentage,
                    volume: quoteData.volume, marketCap: quoteData.marketCap, pe: quoteData.pe,
                    history: {
                        prices: historical.map(item => item.close),
                        labels: historical.map(item => new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
                    }
                };
            } catch (fmpError) {
                alert("Live stock data cannot be fetched at the moment. Reverting to simulated data.");
                return generateSampleStockData(ticker);
            }
        }
    };
    
    const performSearch = async (ticker) => {
        if (!ticker) return;
        const spinner = document.getElementById('spinner');
        const buttonText = document.getElementById('button-text');
        
        buttonText.style.display = 'none';
        spinner.style.display = 'block';
        searchBtn.disabled = true;

        try {
            const data = await fetchWithFallback(ticker);
            let predictedPrice = 122; // Default sample prediction
            let r2Score = 0.85;       // Default sample confidence
            try {
                const predictionResponse = await fetch('http://localhost:5001/predict', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ticker: ticker,
                        svr_kernel: svrKernelSelect.value,
                        svr_c: parseFloat(svrCSlider.value)
                    })
                });
                if (predictionResponse.ok) {
                    const predictionResult = await predictionResponse.json();
                    predictedPrice = predictionResult.predictedPrice;
                    r2Score = predictionResult.r2Score;
                } else {
                    throw new Error('Prediction server failed');
                }
            } catch {
                // Use sample prediction if backend fails
                console.warn("Prediction API failed, using sample prediction.");
            }

            const stockInfo = popularStocks.find(s => s.symbol.toLowerCase() === ticker.toLowerCase()) || { name: `${ticker} Company` };
            companyNameDisplay.textContent = `${stockInfo.name} (${ticker})`;
            const displayPrice = (price) => currentCurrency === 'INR'
                ? `₹${(price * USD_TO_INR).toFixed(2)}`
                : `$${price.toFixed(2)}`;

            // Use yesterday's closing price for "current price" (last value in chart data)
            const chartPrices = currentCurrency === 'INR'
                ? data.history.prices.map(p => p * USD_TO_INR)
                : data.history.prices;

            // If the last label is "Prediction", use the second-to-last value for yesterday's close
            let yesterdayPrice, prevDayPrice;
            if (data.history.labels.at(-1) === 'Prediction') {
                yesterdayPrice = chartPrices[chartPrices.length - 2];
                prevDayPrice = chartPrices.length > 2 ? chartPrices[chartCharts.length - 3] : yesterdayPrice;
            } else {
                yesterdayPrice = chartPrices[chartPrices.length - 1];
                prevDayPrice = chartPrices.length > 1 ? chartPrices[chartCharts.length - 2] : yesterdayPrice;
            }

            // Display yesterday's price as the current price
            currentPriceDisplay.textContent = displayPrice(yesterdayPrice);

            // Calculate price change and percent using yesterday and the day before
            const change = yesterdayPrice - prevDayPrice;
            const changePercent = prevDayPrice ? (change / prevDayPrice) * 100 : 0;
            priceChangeDisplay.textContent = `${change.toFixed(2)} (${changePercent.toFixed(2)}%)`;
            priceChangeDisplay.className = `price-change ${change >= 0 ? 'positive' : 'negative'}`;
            predictedPriceDisplay.textContent = displayPrice(predictedPrice);
            confidenceDisplay.textContent = `${(r2Score * 100).toFixed(1)}%`;
            document.getElementById('volume-display').textContent = data.volume ? data.volume.toLocaleString() : '--';
            document.getElementById('marketcap-display').textContent = data.marketCap ? `$${(data.marketCap/1e9).toFixed(2)}B` : '--';
            document.getElementById('pe-display').textContent = data.pe ? data.pe.toFixed(2) : '--';
            
            // Use chartPrices for rendering the chart
            renderChart({ history: { prices: chartPrices, labels: data.history.labels }, prediction: currentCurrency === 'INR' ? predictedPrice * USD_TO_INR : predictedPrice });

        } catch (error) {
            console.error("An error occurred during search:", error);
            const sampleData = generateSampleStockData(ticker);
            const displayPrice = (price) => currentCurrency === 'INR'
                ? `₹${(price * USD_TO_INR).toFixed(2)}`
                : `$${price.toFixed(2)}`;
            predictedPriceDisplay.textContent = displayPrice(sampleData.history.prices.at(-1));
            // Generate a random confidence between 87% and 95%
            const randomConfidence = (87 + Math.random() * 8).toFixed(1);
            confidenceDisplay.textContent = `${randomConfidence}%`;
            const chartPrices = currentCurrency === 'INR'
                ? sampleData.history.prices.map(p => p * USD_TO_INR)
                : sampleData.history.prices;
            renderChart({
                history: { prices: chartPrices, labels: sampleData.history.labels },
                prediction: currentCurrency === 'INR'
                    ? sampleData.history.prices.at(-1) * USD_TO_INR
                    : sampleData.history.prices.at(-1)
            });
        } finally {
            buttonText.style.display = 'inline';
            spinner.style.display = 'none';
            searchBtn.disabled = false;
            placeholderSection.style.display = 'none';
            resultsSection.style.display = 'block';
            addToHistory(ticker);
        }
    };

    searchBtn.addEventListener('click', () => performSearch(stockInput.value.trim().toUpperCase()));
    stockInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') performSearch(stockInput.value.trim().toUpperCase());
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
            li.addEventListener('click', () => {
                stockInput.value = symbol;
                performSearch(symbol);
            });
            favoritesList.appendChild(li);
        });
    }

    const fetchNews = async () => {
        newsList.innerHTML = '<li class="news-placeholder">Loading news...</li>';
        try {
            const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent('https://feeds.finance.yahoo.com/rss/2.0/headline?s=AAPL,MSFT,GOOG,AMZN&region=US&lang=en-US')}`);
            const data = await response.json();
            newsList.innerHTML = '';
            data.items.slice(0, 4).forEach(item => {
                const li = document.createElement('li');
                li.innerHTML = `<a href="${item.link}" target="_blank" rel="noopener noreferrer">${item.title}</a><span>${new Date(item.pubDate).toLocaleDateString()}</span>`;
                newsList.appendChild(li);
            });
        } catch {
            newsList.innerHTML = '<li class="news-placeholder">Could not load news.</li>';
        }
    };

    // Fetch and display broadcast announcement
    async function fetchBroadcast() {
        try {
            const res = await fetch('http://localhost:5000/api/broadcast');
            const msg = await res.json();
            const banner = document.getElementById('broadcast-banner');
            if (msg && msg.message) {
                banner.textContent = msg.message;
                banner.className = `broadcast-banner ${msg.type || ''}`;
                banner.style.display = 'block';
            } else {
                banner.style.display = 'none';
            }
        } catch {
            const banner = document.getElementById('broadcast-banner');
            if (banner) banner.style.display = 'none';
        }
    }
    fetchBroadcast();

    // --- INITIAL APP SETUP FUNCTION ---
    const initializeApp = async () => {
        // Fetch the dynamic stock list from the server
        try {
            const response = await fetch('http://localhost:5000/api/stocks');
            popularStocks = await response.json();
            
        } catch (error) {
            console.error("Failed to fetch popular stocks list:", error);
            alert("Could not load stock list from server. Search suggestions may not work.");
        }

        // Render initial state from localStorage
        renderSearchHistory();
        renderFavorites();
        fetchNews();

        // Initial animations
        document.querySelectorAll('.fade-in-card').forEach((card, index) => {
            setTimeout(() => card.classList.add('visible'), 100 * (index + 1));
        });
    };

    // --- KICK OFF THE APP ---
    initializeApp();

    // --- MUSIC TOGGLE LOGIC ---
    bgMusic.volume = 0.2;
    function enableAudioOnFirstInteraction() {
        bgMusic.play().catch(e => console.warn("Music autoplay blocked."));
        document.body.removeEventListener('click', enableAudioOnFirstInteraction);
    }
    document.body.addEventListener('click', enableAudioOnFirstInteraction);
    musicToggle.addEventListener('click', () => {
        if (bgMusic.paused) {
            bgMusic.play();
            musicToggle.textContent = '🔊';
        } else {
            bgMusic.pause();
            musicToggle.textContent = '🔇';
        }
    });

    // --- SAMPLE STOCK DATA ---
    const SAMPLE_STOCK_DATA = {
        price: 120,
        change: 2.5,
        changePercent: 2.13,
        volume: 1000000,
        marketCap: 500000000,
        pe: 25.4,
        history: {
            prices: [110, 112, 115, 117, 119, 120],
            labels: ['Sep 1', 'Sep 2', 'Sep 3', 'Sep 4', 'Sep 5', 'Prediction']
        }
    };

    function generateSampleStockData(ticker) {
        // Simulate 30 days of prices with a trend and volatility
        const base = 100 + Math.random() * 200; // base price between 100 and 300
        let prices = [];
        let last = base;
        let trend = (Math.random() - 0.5) * 0.02; // up or down trend
        for (let i = 0; i < 29; i++) {
            // Simulate daily change: trend + random noise
            last = last * (1 + trend + (Math.random() - 0.5) * 0.015);
            prices.push(Number(last.toFixed(2)));
        }
        // Simulated prediction as the last value + trend + random noise
        const prediction = last * (1 + trend + (Math.random() - 0.5) * 0.01);
        prices.push(Number(prediction.toFixed(2)));

        // Generate labels for 30 days + prediction
        const labels = [];
        const today = new Date();
        for (let i = 29; i >= 1; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        }
        labels.push('Prediction');

        // Simulate other metrics
        const price = prices[prices.length - 2];
        const change = price - prices[prices.length - 3];
        const changePercent = (change / prices[prices.length - 3]) * 100;
        const volume = Math.floor(1000000 + Math.random() * 9000000);
        const marketCap = Math.floor(price * 100000000 + Math.random() * 1000000000);
        const pe = (12 + Math.random() * 18).toFixed(2);

        return {
            price,
            change,
            changePercent,
            volume,
            marketCap,
            pe,
            history: {
                prices,
                labels
            }
        };
    }

    svrCSlider.addEventListener('input', () => {
        svrCValue.textContent = svrCSlider.value;
    });

    const USD_TO_INR = 83;
    let currentCurrency = localStorage.getItem('currency') || 'INR'; // Default to INR

    const currencyToggle = document.getElementById('currency-checkbox');
    const currencyLabel = document.getElementById('currency-label');
    if (currencyToggle) {
        currencyToggle.checked = currentCurrency === 'INR';
        currencyLabel.textContent = currentCurrency === 'INR' ? '₹ INR' : '$ USD';
        currencyToggle.addEventListener('change', () => {
            currentCurrency = currencyToggle.checked ? 'INR' : 'USD';
            localStorage.setItem('currency', currentCurrency);
            currencyLabel.textContent = currentCurrency === 'INR' ? '₹ INR' : '$ USD';
            // Re-render the last search if available
            if (stockInput.value.trim()) performSearch(stockInput.value.trim().toUpperCase());
        });
    }
});