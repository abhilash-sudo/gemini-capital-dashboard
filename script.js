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
    const compareSelect = document.getElementById('compare-symbols');
    const favoritesList = document.getElementById('favorites-list');
    const saveFavoriteBtn = document.getElementById('save-favorite-btn');
    const bgMusic = document.getElementById('bg-music');
    const musicToggle = document.getElementById('music-toggle');

    // --- STATE MANAGEMENT ---
    let stockChart = null;
    let currentChartType = 'line';
    let popularStocks = []; // This will now be fetched from the server
    let searchHistory = JSON.parse(localStorage.getItem('stockSearchHistory')) || [];
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    // --- SESSION & USER MANAGEMENT ---
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
        if (stockChart) stockChart.destroy();
        stockChart = new Chart(ctx, {
            type: currentChartType,
            data: {
                labels: [...priceData.history.labels, 'Prediction'],
                datasets: [{
                    label: 'Historical Price',
                    data: [...priceData.history.prices, null],
                    borderColor: '#58a6ff', backgroundColor: 'rgba(88, 166, 255, 0.2)',
                    fill: currentChartType === 'area', tension: 0.4,
                }, {
                    label: 'Predicted Price',
                    data: [...Array(priceData.history.prices.length).fill(null), priceData.prediction],
                    borderColor: '#3fb950', backgroundColor: '#3fb950',
                    pointRadius: 6,
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    };
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
            const predictionResponse = await fetch('http://localhost:5001/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ticker: ticker })
            });
            if (!predictionResponse.ok) throw new Error('Prediction server failed');
            const predictionResult = await predictionResponse.json();
            const predictedPrice = predictionResult.predictedPrice;

            const stockInfo = popularStocks.find(s => s.symbol.toLowerCase() === ticker.toLowerCase()) || { name: `${ticker} Company` };
            companyNameDisplay.textContent = `${stockInfo.name} (${ticker})`;
            currentPriceDisplay.textContent = `$${data.price.toFixed(2)}`;
            priceChangeDisplay.textContent = `${data.change.toFixed(2)} (${data.changePercent.toFixed(2)}%)`;
            priceChangeDisplay.className = `price-change ${data.change >= 0 ? 'positive' : 'negative'}`;
            predictedPriceDisplay.textContent = `$${predictedPrice.toFixed(2)}`;
            confidenceDisplay.textContent = `${(predictionResult.r2Score * 100).toFixed(1)}%`;
            document.getElementById('volume-display').textContent = data.volume ? data.volume.toLocaleString() : '--';
            document.getElementById('marketcap-display').textContent = data.marketCap ? `$${(data.marketCap/1e9).toFixed(2)}B` : '--';
            document.getElementById('pe-display').textContent = data.pe ? data.pe.toFixed(2) : '--';
            
            renderChart({ history: data.history, prediction: predictedPrice });

        } catch (error) {
            console.error("An error occurred during search:", error);
            alert("Could not fetch data or prediction. Please ensure both servers are running and API keys are valid.");
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

    if (broadcastBanner) {
        const msg = JSON.parse(localStorage.getItem('broadcastMessage'));
        if (msg) {
            broadcastBanner.textContent = msg.message;
            broadcastBanner.className = `broadcast-banner ${msg.type}`;
            broadcastBanner.style.display = 'block';
        }
    }

    // --- INITIAL APP SETUP FUNCTION ---
    const initializeApp = async () => {
        // Fetch the dynamic stock list from the server
        try {
            const response = await fetch('http://localhost:5000/api/stocks');
            popularStocks = await response.json();
            
            // Now that we have the stocks, populate the comparison dropdown
            compareSelect.innerHTML = '';
            popularStocks.forEach(stock => {
                const option = document.createElement('option');
                option.value = stock.symbol;
                option.textContent = `${stock.symbol} - ${stock.name}`;
                compareSelect.appendChild(option);
            });

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
});