document.addEventListener('DOMContentLoaded', () => {
    // --- Admin Session Check ---
    if (sessionStorage.getItem('isAdmin') !== 'true') {
        window.location.href = 'admin-login.html';
        return;
    }

    // --- Element Selection ---
    const navTabs = document.querySelectorAll('.nav-tab');
    const views = document.querySelectorAll('.admin-view');
    const logoutBtn = document.getElementById('admin-logout-btn');
    
    // Dashboard metrics
    const totalUsersEl = document.getElementById('total-users');
    const adminUsersEl = document.getElementById('admin-users');
    const totalStocksEl = document.getElementById('total-stocks');

    // User management
    const userTableBody = document.getElementById('user-table-body');
    
    // Stock management (NEW)
    const addStockForm = document.getElementById('add-stock-form');
    const stockSymbolInput = document.getElementById('stock-symbol-input');
    const stockNameInput = document.getElementById('stock-name-input');
    const stockStatusMessage = document.getElementById('stock-status-message');
    const currentStocksTableBody = document.getElementById('current-stocks-table-body');

    // Logs
    const logsList = document.getElementById('logs-list');
    
    // Broadcast
    const sendBroadcastBtn = document.getElementById('send-broadcast-btn');
    const clearBroadcastBtn = document.getElementById('clear-broadcast-btn');
    const broadcastMessageInput = document.getElementById('broadcast-message');
    const broadcastTypeSelect = document.getElementById('broadcast-type');
    const broadcastStatus = document.querySelector('.broadcast-status');
    
    // --- DATA IS NOW FETCHED FROM THE SERVER, NOT LOCALSTORAGE ---
    
    // --- Core Functions ---
    
    const populateDashboard = async () => {
        // NOTE: This now requires endpoints to get all users and all stocks
        // We will implement GET /api/users next. For now, it might show 0.
        // const users = await (await fetch('http://localhost:5000/api/users')).json();
        const stocks = await (await fetch('http://localhost:5000/api/stocks')).json();
        
        // totalUsersEl.textContent = users.length;
        // adminUsersEl.textContent = users.filter(u => u.role === 'admin').length;
        totalStocksEl.textContent = stocks.length;
    };

    const populateUserTable = () => {
        // This will be refactored later to fetch from the server.
        // For now, it will be empty until we build the GET /api/users endpoint.
        userTableBody.innerHTML = '<tr><td colspan="4">User management will be connected to the server next.</td></tr>';
    };

    // NEW: Function to fetch and display stocks
    const fetchAndDisplayStocks = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/stocks');
            const stocks = await response.json();
            
            currentStocksTableBody.innerHTML = ''; // Clear existing table
            if (stocks.length === 0) {
                currentStocksTableBody.innerHTML = '<tr><td colspan="2">No stocks found in the database.</td></tr>';
            } else {
                stocks.forEach(stock => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${stock.symbol}</td>
                        <td>${stock.name}</td>
                    `;
                    currentStocksTableBody.appendChild(row);
                });
            }
            // Update dashboard metric
            if(totalStocksEl) totalStocksEl.textContent = stocks.length;

        } catch (error) {
            console.error("Error fetching stocks:", error);
            currentStocksTableBody.innerHTML = '<tr><td colspan="2">Error loading stocks.</td></tr>';
        }
    };

    const populateLogs = () => {
        // This will be refactored later to fetch from a server or will be removed.
        logsList.innerHTML = '<li class="log-item">Log viewing will be connected to the server.</li>';
    };

    // --- Event Listeners ---
    logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('isAdmin');
        window.location.href = 'admin-login.html';
    });

    navTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelector('.nav-tab.active').classList.remove('active');
            document.querySelector('.admin-view.active-view').classList.remove('active-view');
            
            tab.classList.add('active');
            const viewId = tab.getAttribute('data-view');
            document.getElementById(viewId).classList.add('active-view');
        });
    });

    // NEW: Handle Add Stock Form Submission
    addStockForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const symbol = stockSymbolInput.value.trim().toUpperCase();
        const name = stockNameInput.value.trim();
        stockStatusMessage.textContent = 'Adding...';

        try {
            const response = await fetch('http://localhost:5000/api/stocks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ symbol, name })
            });

            const result = await response.json();

            if (response.ok) {
                stockStatusMessage.textContent = `Successfully added ${result.symbol}.`;
                stockStatusMessage.className = 'status-message success';
                addStockForm.reset(); // Clear the form
                fetchAndDisplayStocks(); // Refresh the list
            } else {
                stockStatusMessage.textContent = `Error: ${result.message}`;
                stockStatusMessage.className = 'status-message error';
            }
        } catch (error) {
            stockStatusMessage.textContent = 'A network error occurred.';
            stockStatusMessage.className = 'status-message error';
            console.error("Error adding stock:", error);
        }
    });

    // --- Initial Page Load ---
    populateDashboard();
    populateUserTable();
    fetchAndDisplayStocks(); // Fetch stocks when the page loads
    populateLogs();
});