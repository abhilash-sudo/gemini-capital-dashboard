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
        const users = await (await fetch('http://localhost:5000/api/users')).json();
        const stocks = await (await fetch('http://localhost:5000/api/stocks')).json();
        
        totalUsersEl.textContent = users.length;
        adminUsersEl.textContent = users.filter(u => u.role === 'admin').length;
        totalStocksEl.textContent = stocks.length;
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

    sendBroadcastBtn.addEventListener('click', async () => {
        const message = broadcastMessageInput.value.trim();
        const type = broadcastTypeSelect.value;
        if (!message) return;
        broadcastStatus.textContent = 'Sending...';
        try {
            const res = await fetch('http://localhost:5000/api/broadcast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, type })
            });
            if (res.ok) {
                broadcastStatus.textContent = 'Announcement sent!';
                broadcastStatus.className = 'broadcast-status success';
            } else {
                broadcastStatus.textContent = 'Failed to send.';
                broadcastStatus.className = 'broadcast-status error';
            }
        } catch {
            broadcastStatus.textContent = 'Network error.';
            broadcastStatus.className = 'broadcast-status error';
        }
    });
    clearBroadcastBtn.addEventListener('click', async () => {
        broadcastStatus.textContent = 'Clearing...';
        try {
            const res = await fetch('http://localhost:5000/api/broadcast', {
                method: 'DELETE'
            });
            if (res.ok) {
                broadcastStatus.textContent = 'Announcement cleared!';
                broadcastStatus.className = 'broadcast-status success';
            } else {
                broadcastStatus.textContent = 'Failed to clear.';
                broadcastStatus.className = 'broadcast-status error';
            }
        } catch {
            broadcastStatus.textContent = 'Network error.';
            broadcastStatus.className = 'broadcast-status error';
        }
    });
    // --- Initial Page Load ---
    populateDashboard();
    fetchAndDisplayStocks(); // Fetch stocks when the page loads
});

// In admin.js
async function loadUsers() {
    const res = await fetch('http://localhost:5000/api/users');
    const users = await res.json();
    const userTable = document.getElementById('user-table-body');
    userTable.innerHTML = '';
    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.role}</td>
            <td>
                <button class="promote-btn" data-email="${user.email}" ${user.role === 'admin' ? 'disabled' : ''}>
                    Promote to Admin
                </button>
            </td>
        `;
        userTable.appendChild(row);
    });

    // Add event listeners to promote buttons
    document.querySelectorAll('.promote-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const email = btn.getAttribute('data-email');
            const res = await fetch('http://localhost:5000/api/users/promote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            if (res.ok) {
                alert('User promoted to admin!');
                loadUsers(); // Refresh table
                // Also refresh dashboard metrics
                if (typeof populateDashboard === 'function') populateDashboard();
            } else {
                alert('Failed to promote user.');
            }
        });
    });
}
document.addEventListener('DOMContentLoaded', loadUsers);

async function loadLogs() {
    const res = await fetch('http://localhost:5000/api/logs');
    const logs = await res.json();
    // Use logsList instead of logList
    const logsList = document.getElementById('logs-list');
    logsList.innerHTML = '';
    logs.forEach(log => {
        const li = document.createElement('li');
        li.textContent = `[${log.timestamp}] ${log.message}`;
        logsList.appendChild(li);
    });
}
document.addEventListener('DOMContentLoaded', loadLogs);