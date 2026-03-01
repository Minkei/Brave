// ============================================
// CONSTANTS & CONFIG
// ============================================
const CONFIG = {
    // API Configuration (Consider moving to env file for production)
    UNSPLASH_API_KEY: 'Kqq059SeG3Ce8PMpK0eRrUvmqEkH69j5fHIqo7PxlzY',
    UNSPLASH_QUERY: 'aurora',
    FALLBACK_IMAGE: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
    
    // Default Settings
    DEFAULT_BLUR: 40,
    DEFAULT_SPOTLIGHT: 150,
    
    // Blur Settings
    BLUR_MIN: 0,
    BLUR_MAX: 40,
    BLUR_STEP: 1,
    
    // Spotlight Settings
    SPOTLIGHT_MIN: 50,
    SPOTLIGHT_MAX: 300,
    SPOTLIGHT_STEP: 10,
    
    // LocalStorage Keys
    STORAGE_KEYS: {
        APP_ORDER: 'appOrder',
        BLUR: 'bgBlur',
        SPOTLIGHT: 'spotlightSize',
        WIDGET_WIDTH: 'widgetWidth',
        WIDGET_HEIGHT: 'widgetHeight',
        ICON_SIZE: 'iconSize',
        LOCATION: 'userLocation'
    }
};

// ============================================
// STATE MANAGEMENT
// ============================================
let draggedItem = null;
let currentContextMenuApp = null;

// ============================================
// BACKGROUND IMAGE
// ============================================
async function loadBackground() {
    const bgElement = document.getElementById('bgImage');
    
    try {
        const response = await fetch(
            `https://api.unsplash.com/photos/random?query=${CONFIG.UNSPLASH_QUERY}&orientation=landscape&client_id=${CONFIG.UNSPLASH_API_KEY}`
        );
        
        if (!response.ok) {
            throw new Error(`Unsplash API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data?.urls?.full) {
            bgElement.style.backgroundImage = `url(${data.urls.full})`;
        } else {
            throw new Error('Invalid Unsplash response');
        }
        
    } catch (error) {
        console.warn('Failed to load Unsplash background, using fallback:', error);
        bgElement.style.backgroundImage = `url(${CONFIG.FALLBACK_IMAGE})`;
    }
}

// ============================================
// TIME & DATE MANAGEMENT
// ============================================
function updateTime() {
    const now = new Date();
    
    // Format time
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('time').textContent = `${hours}:${minutes}`;
    
    // Format date
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    const dayName = days[now.getDay()];
    const monthName = months[now.getMonth()];
    const date = now.getDate();
    const year = now.getFullYear();
    
    document.getElementById('date').textContent = `${dayName}, ${monthName} ${date}, ${year}`;
}

function updateGreeting() {
    const hour = new Date().getHours();
    let greetingText = '';
    
    if (hour >= 5 && hour < 12) {
        greetingText = 'Good morning';
    } else if (hour >= 12 && hour < 18) {
        greetingText = 'Good afternoon';
    } else if (hour >= 18 && hour < 22) {
        greetingText = 'Good evening';
    } else {
        greetingText = 'Good night';
    }
    
    document.getElementById('greeting').innerHTML = `${greetingText}, <span>Minkei</span>`;
}

// ============================================
// LOCAL STORAGE HELPERS
// ============================================
function saveAppOrder() {
    const order = [...document.querySelectorAll('.app-item:not(.add-app)')]
        .map(item => item.dataset.id)
        .filter(Boolean);
    
    localStorage.setItem(CONFIG.STORAGE_KEYS.APP_ORDER, JSON.stringify(order));
}

function loadAppOrder() {
    const savedOrder = localStorage.getItem(CONFIG.STORAGE_KEYS.APP_ORDER);
    if (!savedOrder) return;
    
    try {
        const order = JSON.parse(savedOrder);
        const grid = document.getElementById('appGrid');
        const addAppBtn = document.getElementById('addApp');
        
        order.forEach(id => {
            const item = grid.querySelector(`[data-id="${id}"]`);
            if (item) {
                grid.insertBefore(item, addAppBtn);
            }
        });
    } catch (error) {
        console.error('Failed to load app order:', error);
    }
}

// ============================================
// SPOTLIGHT EFFECT
// ============================================
function initSpotlightEffect() {
    document.querySelectorAll('.glass-effect').forEach(element => {
        element.addEventListener('mousemove', (e) => {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            element.style.setProperty('--mouse-x', `${x}px`);
            element.style.setProperty('--mouse-y', `${y}px`);
        });
    });
}

// ============================================
// SETTINGS PANEL
// ============================================
function initSettings() {
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsPanel = document.getElementById('settingsPanel');
    const blurSlider = document.getElementById('blurSlider');
    const blurValue = document.getElementById('blurValue');
    const spotlightSlider = document.getElementById('spotlightSlider');
    const spotlightValue = document.getElementById('spotlightValue');
    const widgetWidthSlider = document.getElementById('widgetWidthSlider');
    const widgetWidthValue = document.getElementById('widgetWidthValue');
    const widgetHeightSlider = document.getElementById('widgetHeightSlider');
    const widgetHeightValue = document.getElementById('widgetHeightValue');
    const iconSizeSlider = document.getElementById('iconSizeSlider');
    const iconSizeValue = document.getElementById('iconSizeValue');

    // Restore saved blur
    const savedBlur = localStorage.getItem(CONFIG.STORAGE_KEYS.BLUR);
    if (savedBlur !== null) {
        applyBlur(savedBlur);
        blurSlider.value = savedBlur;
        blurValue.textContent = `${savedBlur}px`;
    }
    
    // Restore saved spotlight size
    const savedSpotlight = localStorage.getItem(CONFIG.STORAGE_KEYS.SPOTLIGHT);
    if (savedSpotlight !== null) {
        applySpotlightSize(savedSpotlight);
        spotlightSlider.value = savedSpotlight;
        spotlightValue.textContent = `${savedSpotlight}px`;
    }
    
    // Toggle settings panel
    settingsBtn.addEventListener('click', () => {
        settingsPanel.classList.toggle('active');
        setTimeout(initSpotlightEffect, 100);
    });
    
    // Blur adjustment
    blurSlider.addEventListener('input', (e) => {
        const blur = e.target.value;
        blurValue.textContent = `${blur}px`;
        applyBlur(blur);
        localStorage.setItem(CONFIG.STORAGE_KEYS.BLUR, blur);
    });
    
    // Spotlight size adjustment
    spotlightSlider.addEventListener('input', (e) => {
        const size = e.target.value;
        spotlightValue.textContent = `${size}px`;
        applySpotlightSize(size);
        localStorage.setItem(CONFIG.STORAGE_KEYS.SPOTLIGHT, size);
    });

    // Restore saved widget height
    const savedWidgetHeight = localStorage.getItem(CONFIG.STORAGE_KEYS.WIDGET_HEIGHT);
    if (savedWidgetHeight !== null) {
        applyWidgetHeight(savedWidgetHeight);
        widgetHeightSlider.value = savedWidgetHeight;
        widgetHeightValue.textContent = savedWidgetHeight === '0' ? 'Auto' : `${savedWidgetHeight}px`;
    }

    // Restore saved widget width
    const savedWidgetWidth = localStorage.getItem(CONFIG.STORAGE_KEYS.WIDGET_WIDTH);
    if (savedWidgetWidth !== null) {
        applyWidgetWidth(savedWidgetWidth);
        widgetWidthSlider.value = savedWidgetWidth;
        widgetWidthValue.textContent = `${savedWidgetWidth}px`;
    }

    // Restore saved icon size
    const savedIconSize = localStorage.getItem(CONFIG.STORAGE_KEYS.ICON_SIZE);
    if (savedIconSize !== null) {
        applyIconSize(savedIconSize);
        iconSizeSlider.value = savedIconSize;
        iconSizeValue.textContent = `${savedIconSize}px`;
    }

    // Widget height adjustment
    widgetHeightSlider.addEventListener('input', (e) => {
        const height = e.target.value;
        widgetHeightValue.textContent = height === '0' ? 'Auto' : `${height}px`;
        applyWidgetHeight(height);
        localStorage.setItem(CONFIG.STORAGE_KEYS.WIDGET_HEIGHT, height);
    });

    // Widget width adjustment
    widgetWidthSlider.addEventListener('input', (e) => {
        const width = e.target.value;
        widgetWidthValue.textContent = `${width}px`;
        applyWidgetWidth(width);
        localStorage.setItem(CONFIG.STORAGE_KEYS.WIDGET_WIDTH, width);
    });

    // Icon size adjustment
    iconSizeSlider.addEventListener('input', (e) => {
        const size = e.target.value;
        iconSizeValue.textContent = `${size}px`;
        applyIconSize(size);
        localStorage.setItem(CONFIG.STORAGE_KEYS.ICON_SIZE, size);
    });
}

function applyWidgetHeight(height) {
    document.documentElement.style.setProperty('--widget-height', height === '0' ? 'auto' : `${height}px`);
}

function applyWidgetWidth(width) {
    document.documentElement.style.setProperty('--sidebar-width', `${width}px`);
}

function applyIconSize(size) {
    document.documentElement.style.setProperty('--icon-size', `${size}px`);
}

function applyBlur(blur) {
    const elements = document.querySelectorAll('.widget, .settings-panel');
    elements.forEach(element => {
        element.style.backdropFilter = `blur(${blur}px) saturate(200%)`;
        element.style.webkitBackdropFilter = `blur(${blur}px) saturate(200%)`;
    });
}

function applySpotlightSize(size) {
    document.documentElement.style.setProperty('--spotlight-size', `${size}px`);
}

// ============================================
// DRAG & DROP
// ============================================
function attachDragEvents(item) {
    item.setAttribute('draggable', 'true');
    
    item.addEventListener('dragstart', (e) => {
        draggedItem = item;
        item.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', '');
    });
    
    item.addEventListener('dragend', () => {
        item.classList.remove('dragging');
        draggedItem = null;
        saveAppOrder();
    });
    
    // Prevent click when dragging
    item.addEventListener('click', (e) => {
        if (item.classList.contains('dragging')) {
            e.preventDefault();
        }
    });
}

function initDragAndDrop() {
    const grid = document.getElementById('appGrid');
    const addAppBtn = document.getElementById('addApp');
    
    // Attach drag events to all apps
    document.querySelectorAll('.app-item:not(.add-app)').forEach(app => {
        attachDragEvents(app);
    });
    
    // Handle drag over
    grid.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (!draggedItem) return;
        
        const afterElement = getDragAfterElement(grid, e.clientX, e.clientY);
        
        if (!afterElement) {
            grid.insertBefore(draggedItem, addAppBtn);
        } else {
            grid.insertBefore(draggedItem, afterElement);
        }
    });
}

function getDragAfterElement(container, x, y) {
    const items = [...container.querySelectorAll('.app-item:not(.dragging):not(.add-app)')];
    
    let closest = null;
    let closestDistance = Number.POSITIVE_INFINITY;
    
    items.forEach(item => {
        const box = item.getBoundingClientRect();
        const centerX = box.left + box.width / 2;
        const centerY = box.top + box.height / 2;
        
        const distance = Math.hypot(x - centerX, y - centerY);
        
        if (distance < closestDistance) {
            closestDistance = distance;
            closest = item;
        }
    });
    
    return closest;
}

// ============================================
// CONTEXT MENU
// ============================================
function initContextMenu() {
    const menu = document.getElementById('appContextMenu');
    const editBtn = document.getElementById('editApp');
    const removeBtn = document.getElementById('removeApp');
    
    // Show context menu on right-click
    document.querySelectorAll('.app-item:not(.add-app)').forEach(app => {
        app.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            currentContextMenuApp = app;
            
            menu.style.top = `${e.clientY}px`;
            menu.style.left = `${e.clientX}px`;
            menu.style.display = 'flex';
        });
    });
    
    // Hide menu on click outside
    document.addEventListener('click', () => {
        menu.style.display = 'none';
    });
    
    // Edit app
    editBtn.addEventListener('click', () => {
        if (!currentContextMenuApp) return;
        
        const newName = prompt('App name:', currentContextMenuApp.querySelector('span').textContent);
        const newUrl = prompt('App URL:', currentContextMenuApp.href);
        
        if (newName) {
            currentContextMenuApp.querySelector('span').textContent = newName;
        }
        if (newUrl) {
            currentContextMenuApp.href = newUrl;
        }
        
        saveAppOrder();
    });
    
    // Remove app
    removeBtn.addEventListener('click', () => {
        if (!currentContextMenuApp) return;
        
        currentContextMenuApp.remove();
        saveAppOrder();
        currentContextMenuApp = null;
    });
}

// ============================================
// ADD NEW APP
// ============================================
function initAddApp() {
    const addAppBtn = document.getElementById('addApp');
    const grid = document.getElementById('appGrid');
    
    addAppBtn.addEventListener('click', () => {
        const name = prompt('App name?');
        if (!name) return;
        
        const url = prompt('App URL?');
        if (!url) return;
        
        const icon = prompt(
            'Icon URL? (SVG/PNG)\nExample:\nhttps://cdn.simpleicons.org/github/white'
        );
        
        const id = 'app_' + Date.now();
        
        const app = document.createElement('a');
        app.className = 'app-item glass-effect';
        app.href = url;
        app.target = '_blank';
        app.draggable = true;
        app.dataset.id = id;
        
        app.innerHTML = `
            <img src="${icon || 'https://cdn.simpleicons.org/link/white'}" alt="${name}">
            <span>${name}</span>
        `;
        
        grid.insertBefore(app, addAppBtn);
        
        attachDragEvents(app);
        attachContextMenuToElement(app);
        initSpotlightEffect();
        saveAppOrder();
    });
}

function attachContextMenuToElement(app) {
    const menu = document.getElementById('appContextMenu');
    
    app.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        currentContextMenuApp = app;
        
        menu.style.top = `${e.clientY}px`;
        menu.style.left = `${e.clientX}px`;
        menu.style.display = 'flex';
    });
}

// ============================================
// AI WIDGET HANDLERS
// ============================================
function initAIWidgets() {
    const claudeTextarea = document.querySelector('#claudeSubmitBtn').previousElementSibling;
    const claudeBtn = document.getElementById('claudeSubmitBtn');
    const chatgptTextarea = document.querySelector('#chatgptSubmitBtn').previousElementSibling;
    const chatgptBtn = document.getElementById('chatgptSubmitBtn');
    
    // Initially disable buttons
    claudeBtn.disabled = true;
    chatgptBtn.disabled = true;
    
    // Enable/disable buttons based on input
    claudeTextarea.addEventListener('input', () => {
        claudeBtn.disabled = !claudeTextarea.value.trim();
    });
    
    chatgptTextarea.addEventListener('input', () => {
        chatgptBtn.disabled = !chatgptTextarea.value.trim();
    });
    
    // Ask Claude
    claudeBtn.addEventListener('click', async () => {
        const prompt = claudeTextarea.value.trim();
        if (!prompt) return;

        // Open Claude.ai with prompt in URL query parameter
        const claudeUrl = `https://claude.ai/new?q=${encodeURIComponent(prompt)}`;
        window.open(claudeUrl, '_blank');

        showNotification('✓ Opening Claude with your prompt...', 'success');

        // Clear textarea
        claudeTextarea.value = '';
        claudeBtn.disabled = true;
    });

    // Ask ChatGPT
    chatgptBtn.addEventListener('click', async () => {
        const prompt = chatgptTextarea.value.trim();
        if (!prompt) return;

        // Open ChatGPT with prompt in URL query parameter
        const chatgptUrl = `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`;
        window.open(chatgptUrl, '_blank');

        showNotification('✓ Opening ChatGPT with your prompt...', 'success');

        // Clear textarea
        chatgptTextarea.value = '';
        chatgptBtn.disabled = true;
    });
    
    // Allow Enter to submit (Shift+Enter for new line)
    [claudeTextarea, chatgptTextarea].forEach(textarea => {
        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const btn = textarea.nextElementSibling;
                if (!btn.disabled) {
                    btn.click();
                }
            }
        });
    });
}

// ============================================
// NOTIFICATION SYSTEM
// ============================================
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// ============================================
// WEATHER WIDGET
// ============================================
const WEATHER_CODES = {
    0: { desc: 'Clear sky', icon: 'fa-sun' },
    1: { desc: 'Mainly clear', icon: 'fa-sun' },
    2: { desc: 'Partly cloudy', icon: 'fa-cloud-sun' },
    3: { desc: 'Overcast', icon: 'fa-cloud' },
    45: { desc: 'Foggy', icon: 'fa-smog' },
    48: { desc: 'Depositing rime fog', icon: 'fa-smog' },
    51: { desc: 'Light drizzle', icon: 'fa-cloud-rain' },
    53: { desc: 'Moderate drizzle', icon: 'fa-cloud-rain' },
    55: { desc: 'Dense drizzle', icon: 'fa-cloud-showers-heavy' },
    61: { desc: 'Slight rain', icon: 'fa-cloud-rain' },
    63: { desc: 'Moderate rain', icon: 'fa-cloud-showers-heavy' },
    65: { desc: 'Heavy rain', icon: 'fa-cloud-showers-heavy' },
    71: { desc: 'Slight snow', icon: 'fa-snowflake' },
    73: { desc: 'Moderate snow', icon: 'fa-snowflake' },
    75: { desc: 'Heavy snow', icon: 'fa-snowflake' },
    80: { desc: 'Slight rain showers', icon: 'fa-cloud-sun-rain' },
    81: { desc: 'Moderate rain showers', icon: 'fa-cloud-showers-heavy' },
    82: { desc: 'Violent rain showers', icon: 'fa-cloud-showers-heavy' },
    95: { desc: 'Thunderstorm', icon: 'fa-cloud-bolt' },
    96: { desc: 'Thunderstorm with hail', icon: 'fa-cloud-bolt' },
    99: { desc: 'Thunderstorm with heavy hail', icon: 'fa-cloud-bolt' },
};

async function getLocation(forceRefresh = false) {
    // Try cached location first
    if (!forceRefresh) {
        const cached = localStorage.getItem(CONFIG.STORAGE_KEYS.LOCATION);
        if (cached) {
            return JSON.parse(cached);
        }
    }

    // Request fresh location
    const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 10000
        });
    });

    const coords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
    };

    // Cache for future use
    localStorage.setItem(CONFIG.STORAGE_KEYS.LOCATION, JSON.stringify(coords));
    return coords;
}

async function initWeather(forceRefresh = false) {
    const content = document.getElementById('weatherContent');

    try {
        const { latitude, longitude } = await getLocation(forceRefresh);

        const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`
        );
        const weatherData = await weatherRes.json();
        const current = weatherData.current;

        const weatherInfo = WEATHER_CODES[current.weather_code] || { desc: 'Unknown', icon: 'fa-question' };

        // Reverse geocode for city name
        let cityName = `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
        try {
            const reverseRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=10`);
            const reverseData = await reverseRes.json();
            cityName = reverseData.address?.city || reverseData.address?.town || reverseData.address?.village || reverseData.display_name?.split(',')[0] || cityName;
        } catch {}

        content.innerHTML = `
            <div class="weather-main">
                <div class="weather-temp">${Math.round(current.temperature_2m)}°</div>
                <i class="fa-solid ${weatherInfo.icon} weather-icon"></i>
            </div>
            <div class="weather-desc">${weatherInfo.desc}</div>
            <div class="weather-details">
                <div class="weather-detail-item">
                    <i class="fa-solid fa-droplet"></i>
                    <span>${current.relative_humidity_2m}%</span>
                </div>
                <div class="weather-detail-item">
                    <i class="fa-solid fa-wind"></i>
                    <span>${current.wind_speed_10m} km/h</span>
                </div>
            </div>
            <div class="weather-location">
                <i class="fa-solid fa-location-dot"></i>
                <span>${cityName}</span>
            </div>
        `;

    } catch (error) {
        console.warn('Weather error:', error);
        content.innerHTML = `
            <div class="weather-error">
                <i class="fa-solid fa-location-crosshairs"></i>
                <p>Enable location access to see weather</p>
            </div>
        `;
    }
}

// ============================================
// QUICK ACTIONS
// ============================================
function initQuickActions() {
    // Refresh background
    document.getElementById('refreshBgBtn').addEventListener('click', () => {
        loadBackground();
        showNotification('✓ Loading new background...', 'success');
    });

    // Fullscreen toggle
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    fullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            fullscreenBtn.querySelector('i').className = 'fa-solid fa-compress';
        } else {
            document.exitFullscreen();
            fullscreenBtn.querySelector('i').className = 'fa-solid fa-expand';
        }
    });

    document.addEventListener('fullscreenchange', () => {
        const icon = fullscreenBtn.querySelector('i');
        icon.className = document.fullscreenElement ? 'fa-solid fa-compress' : 'fa-solid fa-expand';
    });

    // Refresh weather
    document.getElementById('refreshWeatherBtn').addEventListener('click', () => {
        document.getElementById('weatherContent').innerHTML = `
            <div class="weather-loading">
                <i class="fa-solid fa-spinner fa-spin"></i>
                <span>Loading weather...</span>
            </div>
        `;
        initWeather(true);
        showNotification('✓ Refreshing weather...', 'success');
    });
}

// ============================================
// INITIALIZATION
// ============================================
function init() {
    // Load background
    loadBackground();
    
    // Initialize time & date
    updateTime();
    updateGreeting();
    setInterval(updateTime, 1000);
    
    // Initialize settings
    initSettings();
    
    // Initialize spotlight effect
    initSpotlightEffect();
    
    // Load saved app order
    loadAppOrder();
    
    // Initialize drag & drop
    initDragAndDrop();
    
    // Initialize context menu
    initContextMenu();
    
    // Initialize add app functionality
    initAddApp();
    
    // Initialize AI widgets
    initAIWidgets();

    // Initialize quick actions
    initQuickActions();

    // Initialize weather
    initWeather();
}

// ============================================
// START APPLICATION
// ============================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
