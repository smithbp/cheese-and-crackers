// Global configuration
const CONFIG = {
    apiUrl: 'https://script.google.com/macros/s/AKfycbzV6jEmE4EEQ10pHxLSwpOqcqCdBPWMP3p5UafDufKw-ovxC4agLwHtS05vgRO8OS9u/exec'
};

const API_CACHE_PREFIX = 'bookClubApiCache:';
const AUTH_VERIFICATION_KEY = 'bookClubAuthVerification';
const AUTH_VERIFICATION_TTL_MS = 2 * 60 * 1000;

const API_CACHEABLE_ACTIONS = {
    verifyToken: 60 * 1000,
    getCurrentBook: 2 * 60 * 1000,
    getNextMeeting: 5 * 60 * 1000,
    getMembers: 2 * 60 * 1000,
    getBooksRead: 2 * 60 * 1000,
    getNominations: 60 * 1000,
    getVotingStatus: 20 * 1000,
    getVotingBooks: 20 * 1000,
    getVotingResults: 20 * 1000,
    getCalendarUrl: 5 * 60 * 1000,
    getCalendarSettings: 5 * 60 * 1000
};

const MUTATING_ACTIONS = new Set([
    'addMember',
    'removeMember',
    'resetCredentials',
    'addRating',
    'addNomination',
    'removeNomination',
    'uploadImage',
    'startVoting',
    'submitVotes',
    'showResults',
    'nextRound',
    'selectFinalBook',
    'restartVoting',
    'saveCalendarSettings'
]);

function getStoredUser() {
    try {
        return JSON.parse(localStorage.getItem('bookClubUser'));
    } catch (error) {
        localStorage.removeItem('bookClubUser');
        return null;
    }
}

function setStoredUser(user) {
    localStorage.setItem('bookClubUser', JSON.stringify(user));
}

function getActionFromEndpoint(endpoint) {
    return endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
}

function isLoginPagePath(pathname = window.location.pathname) {
    return pathname.includes('login.html');
}

function buildApiCacheKey(action, data, token) {
    const safeData = data || {};
    return `${API_CACHE_PREFIX}${action}:${token || 'anon'}:${JSON.stringify(safeData)}`;
}

function getCachedApiResponse(key, ttlMs) {
    try {
        const cached = sessionStorage.getItem(key);
        if (!cached) return null;

        const parsed = JSON.parse(cached);
        if (!parsed || typeof parsed.ts !== 'number') {
            sessionStorage.removeItem(key);
            return null;
        }

        if (Date.now() - parsed.ts > ttlMs) {
            sessionStorage.removeItem(key);
            return null;
        }

        return parsed.value;
    } catch (error) {
        return null;
    }
}

function setCachedApiResponse(key, value) {
    try {
        sessionStorage.setItem(key, JSON.stringify({ ts: Date.now(), value: value }));
    } catch (error) {
        // Ignore storage quota errors
    }
}

function clearApiCache() {
    try {
        for (let i = sessionStorage.length - 1; i >= 0; i--) {
            const key = sessionStorage.key(i);
            if (key && key.startsWith(API_CACHE_PREFIX)) {
                sessionStorage.removeItem(key);
            }
        }
    } catch (error) {
        // Ignore session storage access errors
    }
}

function setAuthVerification(token) {
    try {
        sessionStorage.setItem(AUTH_VERIFICATION_KEY, JSON.stringify({
            token: token,
            ts: Date.now()
        }));
    } catch (error) {
        // Ignore storage errors
    }
}

function clearAuthVerification() {
    try {
        sessionStorage.removeItem(AUTH_VERIFICATION_KEY);
    } catch (error) {
        // Ignore storage errors
    }
}

function hasFreshAuthVerification(token) {
    try {
        const raw = sessionStorage.getItem(AUTH_VERIFICATION_KEY);
        if (!raw) return false;
        const parsed = JSON.parse(raw);

        if (!parsed || parsed.token !== token || typeof parsed.ts !== 'number') {
            return false;
        }

        return Date.now() - parsed.ts <= AUTH_VERIFICATION_TTL_MS;
    } catch (error) {
        return false;
    }
}

function handleAuthFailure() {
    localStorage.removeItem('bookClubUser');
    clearApiCache();
    clearAuthVerification();

    if (!isLoginPagePath()) {
        window.location.href = 'login.html';
    }
}

function renderUserInfo(user) {
    const userInfo = document.getElementById('userInfo');
    if (!userInfo || !user) return;

    userInfo.textContent = '';

    const nameSpan = document.createElement('span');
    nameSpan.className = 'welcome-label';
    nameSpan.textContent = user.name || 'Member';

    const logoutLink = document.createElement('a');
    logoutLink.href = '#';
    logoutLink.textContent = 'Logout';
    logoutLink.addEventListener('click', function(event) {
        event.preventDefault();
        logout();
    });

    userInfo.appendChild(nameSpan);
    userInfo.appendChild(logoutLink);
}

// API call helper function
async function apiCall(endpoint, data = null, options = {}) {
    const currentUser = getStoredUser();
    const token = currentUser ? currentUser.token : null;
    const action = getActionFromEndpoint(endpoint);
    const payload = {
        action: action,
        ...(data || {}),
        token: token
    };

    const cacheTtlMs = options.cacheTtlMs ?? API_CACHEABLE_ACTIONS[action] ?? 0;
    const useCache = cacheTtlMs > 0 && !options.bypassCache;
    const cacheKey = useCache ? buildApiCacheKey(action, data, token) : null;

    if (useCache && cacheKey) {
        const cachedResult = getCachedApiResponse(cacheKey, cacheTtlMs);
        if (cachedResult) {
            return cachedResult;
        }
    }

    const fetchOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain' // Use text/plain to avoid CORS preflight
        },
        body: JSON.stringify(payload)
    };

    try {
        const response = await fetch(CONFIG.apiUrl, fetchOptions);

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();

        if (result.error === 'UNAUTHORIZED' || result.error === 'INVALID_TOKEN') {
            handleAuthFailure();
            return result;
        }

        if (action === 'verifyToken' && result.success && result.user) {
            setStoredUser(result.user);
            setAuthVerification(result.user.token);
            renderUserInfo(result.user);
        }

        if (useCache && cacheKey && result.success) {
            setCachedApiResponse(cacheKey, result);
        }

        if (MUTATING_ACTIONS.has(action) && result.success) {
            clearApiCache();
            clearAuthVerification();
        }

        return result;
    } catch (error) {
        console.error('API call error:', error);
        throw error;
    }
}

// Initialize authentication
async function initAuth() {
    const currentUser = getStoredUser();
    const isLoginPage = isLoginPagePath();

    if (!currentUser || !currentUser.token) {
        if (!isLoginPage) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }

    renderUserInfo(currentUser);

    if (isLoginPage) {
        window.location.href = 'index.html';
        return true;
    }

    try {
        const response = await apiCall('/verifyToken', null, {
            bypassCache: true
        });

        if (!response.success || !response.user) {
            handleAuthFailure();
            return false;
        }

        return true;
    } catch (error) {
        console.error('Token verification failed:', error);
        handleAuthFailure();
        return false;
    }
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('bookClubUser');
        clearApiCache();
        clearAuthVerification();
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
    const user = getStoredUser();
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

function applyPageContext() {
    const currentFile = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
    const pageName = currentFile.replace('.html', '') || 'index';
    document.body.classList.add('page-shell', `page-${pageName}`);

    document.querySelectorAll('.dropdown-content a').forEach(link => {
        const target = (link.getAttribute('href') || '').toLowerCase();
        if (target === currentFile) {
            link.classList.add('active');
        }
    });
}

// Global error handler for uncaught errors
window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
});

// Toast helper (creates container if needed)
function showToast(message, type = 'info', timeout = 3500) {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    // force reflow to enable transition
    void toast.offsetWidth;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => container.removeChild(toast), 300);
    }, timeout);
}

// Handle API URL configuration warning and page context
window.addEventListener('DOMContentLoaded', function() {
    applyPageContext();

    if (CONFIG.apiUrl === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE') {
        console.warn('⚠️ API URL not configured! Please update the CONFIG.apiUrl in app.js with your Google Apps Script Web App URL.');

        if (!isLoginPagePath()) {
            const banner = document.createElement('div');
            banner.style.cssText = 'background: #a16108; color: white; padding: 15px; text-align: center; font-weight: 700;';
            banner.textContent = '⚠️ API not configured. Please set your Google Apps Script Web App URL in app.js';
            document.body.insertBefore(banner, document.body.firstChild);
        }
    }
});
