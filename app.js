// Global configuration
const CONFIG = {
    apiUrl: 'https://script.google.com/macros/s/AKfycbyMFB1RADwrR-HjtKHwKoWGH0em23swCOKYodPOJWMgpnKfVixsrKjOAdVd4Ozv_aug/exec' // Will be replaced after deployment
};

// API call helper function
async function apiCall(endpoint, data = null) {
    const currentUser = JSON.parse(localStorage.getItem('bookClubUser'));
    const token = currentUser ? currentUser.token : null;
    
    const url = CONFIG.apiUrl;
    
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            action: endpoint,
            ...data,
            token: token
        })
    };
    
    try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const result = await response.json();
        
        // Handle authentication errors
        if (result.error === 'UNAUTHORIZED' || result.error === 'INVALID_TOKEN') {
            localStorage.removeItem('bookClubUser');
            if (window.location.pathname !== '/login.html') {
                window.location.href = 'login.html';
            }
        }
        
        return result;
    } catch (error) {
        console.error('API call error:', error);
        throw error;
    }
}

// Initialize authentication
async function initAuth() {
    const currentUser = JSON.parse(localStorage.getItem('bookClubUser'));
    const userInfo = document.getElementById('userInfo');
    
    // Check if we're on the login page
    const isLoginPage = window.location.pathname.includes('login.html');
    
    if (!currentUser || !currentUser.token) {
        if (!isLoginPage) {
            // Redirect to login if not authenticated
            window.location.href = 'login.html';
            return;
        }
    } else {
        // Verify token is still valid
        try {
            const response = await apiCall('/verifyToken');
            
            if (!response.success) {
                localStorage.removeItem('bookClubUser');
                if (!isLoginPage) {
                    window.location.href = 'login.html';
                }
                return;
            }
            
            // Update user info in the navbar
            if (userInfo) {
                userInfo.innerHTML = `
                    <span>Welcome, ${currentUser.name}!</span>
                    <a href="#" onclick="logout()">Logout</a>
                `;
            }
        } catch (error) {
            console.error('Token verification failed:', error);
            localStorage.removeItem('bookClubUser');
            if (!isLoginPage) {
                window.location.href = 'login.html';
            }
        }
    }
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('bookClubUser');
        window.location.href = 'login.html';
    }
}

// Utility function to format dates
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Utility function to generate random string
function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

// Check if user is admin
function isAdmin() {
    const user = JSON.parse(localStorage.getItem('bookClubUser'));
    return user && user.isAdmin === true;
}

// Show/hide elements based on admin status
function showAdminOnly(elementId) {
    if (isAdmin()) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = 'block';
        }
    }
}

// Global error handler for uncaught errors
window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
});

// Handle API URL configuration warning
window.addEventListener('DOMContentLoaded', function() {
    if (CONFIG.apiUrl === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE') {
        console.warn('⚠️ API URL not configured! Please update the CONFIG.apiUrl in app.js with your Google Apps Script Web App URL.');
        
        // Show a warning banner if not on login page
        const isLoginPage = window.location.pathname.includes('login.html');
        if (!isLoginPage) {
            const banner = document.createElement('div');
            banner.style.cssText = 'background: #ff9800; color: white; padding: 15px; text-align: center; font-weight: bold;';
            banner.textContent = '⚠️ API not configured. Please set up your Google Apps Script Web App URL in app.js';
            document.body.insertBefore(banner, document.body.firstChild);
        }
    }
});
