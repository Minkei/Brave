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
        SPOTLIGHT: 'spotlightSize'
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
        
        try {
            // Copy to clipboard
            await navigator.clipboard.writeText(prompt);
            
            // Open Claude.ai in new tab
            window.open('https://claude.ai/new', '_blank');
            
            // Show success notification
            showNotification('✓ Copied to clipboard! Opening Claude...', 'success');
            
            // Clear textarea
            claudeTextarea.value = '';
            claudeBtn.disabled = true;
            
        } catch (error) {
            console.error('Failed to copy:', error);
            showNotification('⚠ Failed to copy. Opening Claude anyway...', 'warning');
            window.open('https://claude.ai/new', '_blank');
        }
    });
    
    // Ask ChatGPT
    chatgptBtn.addEventListener('click', async () => {
        const prompt = chatgptTextarea.value.trim();
        if (!prompt) return;
        
        try {
            // Copy to clipboard
            await navigator.clipboard.writeText(prompt);
            
            // Open ChatGPT in new tab
            window.open('https://chat.openai.com/', '_blank');
            
            // Show success notification
            showNotification('✓ Copied to clipboard! Opening ChatGPT...', 'success');
            
            // Clear textarea
            chatgptTextarea.value = '';
            chatgptBtn.disabled = true;
            
        } catch (error) {
            console.error('Failed to copy:', error);
            showNotification('⚠ Failed to copy. Opening ChatGPT anyway...', 'warning');
            window.open('https://chat.openai.com/', '_blank');
        }
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
}

// ============================================
// START APPLICATION
// ============================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
