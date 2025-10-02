document.addEventListener('DOMContentLoaded', () => {
    // --- Element Selection ---
    const userNameDisplay = document.getElementById('user-name-display');
    const userAvatar = document.getElementById('user-avatar');
    const logoutBtn = document.getElementById('logout-btn');
    const themeToggle = document.getElementById('theme-checkbox');
    const profilePicture = document.getElementById('profile-picture');
    const photoUploadInput = document.getElementById('photo-upload');
    const uploadBtn = document.getElementById('upload-btn');
    const profileNameEl = document.getElementById('profile-name');
    const profileEmailEl = document.getElementById('profile-email');
    const changePasswordForm = document.getElementById('change-password-form');
    const feedbackMessageEl = document.getElementById('feedback-message');

    // --- Session & User Management ---
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'login.html'; // Redirect if not logged in
        return;
    }

    // Populate user info on the page
    userNameDisplay.textContent = `Welcome, ${currentUser.name}`;
    profileNameEl.textContent = currentUser.name;
    profileEmailEl.textContent = currentUser.email;

    // Load saved profile picture from localStorage
    const savedPhoto = localStorage.getItem(`profilePhoto_${currentUser.email}`);
    if (savedPhoto) {
        profilePicture.src = savedPhoto;
        userAvatar.src = savedPhoto;
    }

    logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    });
    
    // --- Theme Toggle Logic ---
    const applyTheme = (theme) => {
        document.body.classList.toggle('light-mode', theme === 'light');
        themeToggle.checked = theme === 'light';
    };
    const savedTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(savedTheme);
    themeToggle.addEventListener('change', () => {
        const newTheme = themeToggle.checked ? 'light' : 'dark';
        applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // --- Photo Upload Logic ---
    uploadBtn.addEventListener('click', () => {
        photoUploadInput.click(); // Trigger the hidden file input
    });

    photoUploadInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const imageDataUrl = e.target.result;
                profilePicture.src = imageDataUrl;
                userAvatar.src = imageDataUrl; // Also update the header avatar
                // Save the image data to localStorage, associated with the user's email
                localStorage.setItem(`profilePhoto_${currentUser.email}`, imageDataUrl);
            }
            reader.readAsDataURL(file);
        }
    });

    // --- Change Password Logic ---
    changePasswordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        feedbackMessageEl.textContent = '';
        feedbackMessageEl.className = 'feedback-message';

        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmNewPassword = document.getElementById('confirm-new-password').value;

        // Validation
        if (newPassword !== confirmNewPassword) {
            feedbackMessageEl.textContent = 'New passwords do not match.';
            feedbackMessageEl.classList.add('error');
            return;
        }

        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(u => u.email === currentUser.email);

        if (userIndex === -1) {
            feedbackMessageEl.textContent = 'Error: Could not find user account.';
            feedbackMessageEl.classList.add('error');
            return;
        }

        const user = users[userIndex];

        if (user.password !== currentPassword) {
            feedbackMessageEl.textContent = 'Incorrect current password.';
            feedbackMessageEl.classList.add('error');
            return;
        }

        // Update Password in localStorage
        users[userIndex].password = newPassword;
        localStorage.setItem('users', JSON.stringify(users));

        feedbackMessageEl.textContent = 'Password updated successfully!';
        feedbackMessageEl.classList.add('success');
        changePasswordForm.reset(); // Clear the form fields
    });

    // --- Page Load Animations ---
    const fadeInCards = document.querySelectorAll('.fade-in-card');
    fadeInCards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('visible');
        }, 100 * (index + 1));
    });
});

