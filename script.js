const API_KEY = 'Kqq059SeG3Ce8PMpK0eRrUvmqEkH69j5fHIqo7PxlzY';
let draggedItem = null;

async function loadBackground() {
    const bg = document.getElementById('bgImage');

    try {
        const response = await fetch(
            `https://api.unsplash.com/photos/random?query=aurora&orientation=landscape&client_id=${API_KEY}`
        );

        // ❗ Nếu API lỗi → dùng ảnh fallback
        if (!response.ok) {
            console.warn('Unsplash error:', response.status);
            bg.style.backgroundImage =
                'url(https://images.unsplash.com/photo-1500530855697-b586d89ba3ee)';
            return;
        }

        const data = await response.json();

        if (data?.urls?.full) {
            bg.style.backgroundImage = `url(${data.urls.full})`;
        } else {
            throw new Error('Invalid Unsplash response');
        }

    } catch (err) {
        console.error('Background error:', err);
        bg.style.backgroundImage =
            'url(https://images.unsplash.com/photo-1500530855697-b586d89ba3ee)';
    }
}

loadBackground();

// Update time and date
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

// Update greeting based on time
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

// Initialize
updateTime();
updateGreeting();
setInterval(updateTime, 1000);  // Update every second

function saveAppOrder() {
    const order = [...document.querySelectorAll('.app-item:not(.add-app)')]
        .map(item => item.dataset.id);

    localStorage.setItem('appOrder', JSON.stringify(order));
}

document.addEventListener('DOMContentLoaded', () => {
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsPanel = document.getElementById('settingsPanel');
    const blurSlider = document.getElementById('blurSlider');
    const blurValue = document.getElementById('blurValue');
    const spotlightSlider = document.getElementById('spotlightSlider');
    const spotlightValue = document.getElementById('spotlightValue');

    // ===== RESTORE SETTINGS =====

    // Restore blur
    const savedBlur = localStorage.getItem('bgBlur');
    if (savedBlur !== null) {
        blurSlider.value = savedBlur;
        blurValue.textContent = `${savedBlur}px`;

        document.querySelectorAll('.widget').forEach(widget => {
            widget.style.backdropFilter = `blur(${savedBlur}px) saturate(200%)`;
            widget.style.webkitBackdropFilter = `blur(${savedBlur}px) saturate(200%)`;
        });

        settingsPanel.style.backdropFilter = `blur(${savedBlur}px) saturate(200%)`;
        settingsPanel.style.webkitBackdropFilter = `blur(${savedBlur}px) saturate(200%)`;
    }

    // Restore spotlight size
    const savedSpotlight = localStorage.getItem('spotlightSize');
    if (savedSpotlight !== null) {
        spotlightSlider.value = savedSpotlight;
        spotlightValue.textContent = `${savedSpotlight}px`;

        document.documentElement.style.setProperty(
            '--spotlight-size',
            `${savedSpotlight}px`
        );
    }

    // Mouse spotlight effect function
    const addSpotlightEffect = () => {
        document.querySelectorAll('.widget, .settings-panel, .app-item').forEach(element => {
            element.addEventListener('mousemove', (e) => {
                const rect = element.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                element.style.setProperty('--mouse-x', `${x}px`);
                element.style.setProperty('--mouse-y', `${y}px`);
            });
        });
    };

    // Initialize spotlight effect
    addSpotlightEffect();

    if (settingsBtn && settingsPanel) {
        settingsBtn.addEventListener('click', () => {
            settingsPanel.classList.toggle('active');
            // Re-apply spotlight after panel appears
            setTimeout(addSpotlightEffect, 100);
        });

        // Blur adjustment
        if (blurSlider && blurValue) {
            blurSlider.addEventListener('input', (e) => {
                const blur = e.target.value;
                blurValue.textContent = `${blur}px`;

                // Apply blur to widgets
                document.querySelectorAll('.widget').forEach(widget => {
                    widget.style.backdropFilter = `blur(${blur}px) saturate(200%)`;
                    widget.style.webkitBackdropFilter = `blur(${blur}px) saturate(200%)`;
                });

                // Apply blur to settings panel
                settingsPanel.style.backdropFilter = `blur(${blur}px) saturate(200%)`;
                settingsPanel.style.webkitBackdropFilter = `blur(${blur}px) saturate(200%)`;

                // Save
                localStorage.setItem('bgBlur', blur);
            });
        }

        // Spotlight size adjustment
        if (spotlightSlider && spotlightValue) {
            spotlightSlider.addEventListener('input', (e) => {
                const size = e.target.value;
                spotlightValue.textContent = `${size}px`;

                // Update CSS variable for all elements
                document.documentElement.style.setProperty('--spotlight-size', `${size}px`);
                localStorage.setItem('spotlightSize', size);
            });
        }
    }

    const grid = document.querySelector('.app-grid');
    const addAppBtn = document.getElementById('addApp');

    // 🔁 RESTORE ORDER
    const savedOrder = JSON.parse(localStorage.getItem('appOrder'));
    if (savedOrder) {
        savedOrder.forEach(id => {
            const item = grid.querySelector(`[data-id="${id}"]`);
            if (item) grid.insertBefore(item, addAppBtn);
        });
    }

    // ⬇️ gắn drag cho tất cả app
    document.querySelectorAll('.app-item:not(.add-app)').forEach(app => {
        attachDragEvents(app);
        attachContextMenu(app);
    });

    // 🔒 Prevent click when dragging app
    document.querySelectorAll('.app-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (item.classList.contains('dragging')) {
                e.preventDefault();
            }
        });
    });

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

    // ===== helper =====
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

    // ===== APP CONTEXT MENU =====
    const menu = document.getElementById('appContextMenu');
    let currentApp = null;

    document.querySelectorAll('.app-item').forEach(app => {
        app.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            currentApp = app;

            menu.style.top = `${e.clientY}px`;
            menu.style.left = `${e.clientX}px`;
            menu.style.display = 'flex';
        });
    });

    document.addEventListener('click', () => {
        menu.style.display = 'none';
    });

    document.getElementById('removeApp').addEventListener('click', () => {
        if (currentApp) {
            currentApp.remove();
            saveAppOrder();
        }
    });

    document.getElementById('editApp').addEventListener('click', () => {
        if (!currentApp) return;

        const newName = prompt('App name:', currentApp.querySelector('span').textContent);
        const newUrl = prompt('App URL:', currentApp.href);

        if (newName) currentApp.querySelector('span').textContent = newName;
        if (newUrl) currentApp.href = newUrl;

        saveAppOrder();
    });

    // ===== ADD NEW APP =====
    addAppBtn.addEventListener('click', () => {
        const name = prompt('App name?');
        if (!name) return;

        const url = prompt('App URL?');
        if (!url) return;

        const icon = prompt(
            'Icon URL? (SVG/PNG)\nVí dụ:\nhttps://cdn.simpleicons.org/github/white'
        );

        const id = 'app_' + Date.now();

        const app = document.createElement('a');
        app.className = 'app-item';
        app.href = url;
        app.target = '_blank';
        app.draggable = true;
        app.dataset.id = id;

        app.innerHTML = `
            <img src="${icon || 'https://cdn.simpleicons.org/link/white'}">
            <span>${name}</span>
        `;

        grid.insertBefore(app, addAppBtn);

        attachDragEvents(app);
        attachContextMenu(app);
        saveAppOrder();
    });
});

// ===== DRAG & DROP HELPERS =====
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
}

function attachContextMenu(app) {
    app.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const menu = document.getElementById('appContextMenu');
        const currentApp = app;
        menu.style.top = `${e.clientY}px`;
        menu.style.left = `${e.clientX}px`;
        menu.style.display = 'flex';
    });
}