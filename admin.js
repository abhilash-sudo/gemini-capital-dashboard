document.addEventListener('DOMContentLoaded', () => {
    // --- Admin Session Check ---
    if (sessionStorage.getItem('isAdmin') !== 'true') {
        window.location.href = 'admin-login.html'; // Redirect if not an admin
        return;
    }

    // --- Element Selection ---
    const navTabs = document.querySelectorAll('.nav-tab');
    const views = document.querySelectorAll('.admin-view');
    const logoutBtn = document.getElementById('admin-logout-btn');
    const totalUsersEl = document.getElementById('total-users');
    const adminUsersEl = document.getElementById('admin-users');
    const totalLoginsEl = document.getElementById('total-logins');
    const userTableBody = document.getElementById('user-table-body');
    const logsList = document.getElementById('logs-list');
    const sendBroadcastBtn = document.getElementById('send-broadcast-btn');
    const clearBroadcastBtn = document.getElementById('clear-broadcast-btn');
    const broadcastMessageInput = document.getElementById('broadcast-message');
    const broadcastTypeSelect = document.getElementById('broadcast-type');
    const broadcastStatus = document.querySelector('.broadcast-status');

    // --- Data Loading Functions from localStorage ---
    const getUsers = () => JSON.parse(localStorage.getItem('users')) || [];
    const getLogs = () => JSON.parse(localStorage.getItem('systemLogs')) || [];
    const saveUsers = (users) => localStorage.setItem('users', JSON.stringify(users));
    const saveLogs = (logs) => localStorage.setItem('systemLogs', JSON.stringify(logs));
    
    // --- Core Admin Functions ---
    const logEvent = (type, message) => {
        const logs = getLogs();
        const timestamp = new Date().toLocaleString('en-US');
        logs.unshift({ type, message, timestamp });
        saveLogs(logs.slice(0, 100)); // Keep logs limited to the last 100 entries
    };

    const populateDashboard = () => {
        const users = getUsers();
        const logs = getLogs();
        const today = new Date().toLocaleDateString();

        totalUsersEl.textContent = users.length;
        adminUsersEl.textContent = users.filter(u => u.role === 'admin').length;
        totalLoginsEl.textContent = logs.filter(l => l.type === 'LOGIN_SUCCESS' && new Date(l.timestamp).toLocaleDateString() === today).length;
    };

    const populateUserTable = () => {
        const users = getUsers();
        userTableBody.innerHTML = '';
        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td><span class="role-badge role-${user.role || 'user'}">${user.role || 'User'}</span></td>
                <td class="action-buttons">
                    <button class="promote-btn" data-email="${user.email}" ${user.role === 'admin' ? 'disabled' : ''}>Promote</button>
                    <button class="delete-btn" data-email="${user.email}">Delete</button>
                </td>
            `;
            userTableBody.appendChild(row);
        });
    };

    const populateLogs = () => {
        const logs = getLogs();
        logsList.innerHTML = '';
        if (logs.length === 0) {
            logsList.innerHTML = '<li class="log-item">No system events recorded.</li>';
            return;
        }
        logs.forEach(log => {
            const li = document.createElement('li');
            li.className = `log-item log-${log.type.toLowerCase()}`;
            li.innerHTML = `
                <span class="log-timestamp">${log.timestamp}</span>
                <span class="log-message">${log.message}</span>
            `;
            logsList.appendChild(li);
        });
    };

    async function loadAdmins() {
        const res = await fetch('http://localhost:5000/api/admins');
        const admins = await res.json();
        const adminList = document.getElementById('admin-list');
        adminList.innerHTML = '';
        admins.forEach(admin => {
            const li = document.createElement('li');
            li.textContent = admin.username;
            adminList.appendChild(li);
        });
    }

    // --- Event Listeners ---
    logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('isAdmin');
        window.location.href = 'admin-login.html';
    });

    // Navigation for tabs
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

    userTableBody.addEventListener('click', (e) => {
        const email = e.target.dataset.email;
        if (e.target.classList.contains('delete-btn')) {
            if (confirm(`Are you sure you want to delete the user: ${email}?`)) {
                let users = getUsers();
                users = users.filter(user => user.email !== email);
                saveUsers(users);
                logEvent('ADMIN_ACTION', `Admin deleted user: ${email}`);
                populateUserTable();
                populateDashboard();
                populateLogs();
            }
        }
        if (e.target.classList.contains('promote-btn')) {
            if (confirm(`Promote ${email} to Admin? They will gain access to this panel.`)) {
                let users = getUsers();
                const user = users.find(u => u.email === email);
                if (user) user.role = 'admin';
                saveUsers(users);
                logEvent('ADMIN_ACTION', `Admin promoted user to Admin: ${email}`);
                populateUserTable();
                populateDashboard();
                populateLogs();
            }
        }
    });

    sendBroadcastBtn.addEventListener('click', () => {
        const message = broadcastMessageInput.value.trim();
        const type = broadcastTypeSelect.value;
        if (!message) {
            broadcastStatus.textContent = 'Message cannot be empty.';
            return;
        }
        const broadcast = { message, type };
        localStorage.setItem('broadcastMessage', JSON.stringify(broadcast));
        broadcastStatus.textContent = 'Broadcast message has been pushed to all users.';
        logEvent('BROADCAST_SENT', `Sent "${type}" message: ${message}`);
        populateLogs();
        setTimeout(() => broadcastStatus.textContent = '', 3000);
    });
    
    clearBroadcastBtn.addEventListener('click', () => {
        localStorage.removeItem('broadcastMessage');
        broadcastStatus.textContent = 'Broadcast message has been cleared.';
        logEvent('BROADCAST_CLEARED', `Cleared active broadcast message.`);
        populateLogs();
        setTimeout(() => broadcastStatus.textContent = '', 3000);
    });

    // --- Initial Page Load ---
    populateDashboard();
    populateUserTable();
    populateLogs();
    loadAdmins();
});

