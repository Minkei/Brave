const API_KEY = 'Kqq059SeG3Ce8PMpK0eRrUvmqEkH69j5fHIqo7PxlzY';

async function loadBackground() {
    try {
        const response = await fetch(
            `https://api.unsplash.com/photos/random?client_id=${API_KEY}&query=aurora&orientation=landscape`
        );

        console.log('Response status:', response.status);

        const data = await response.json();
        console.log('Data:', data);

        const imageUrl = data.urls.full;

        document.getElementById('bgImage').style.backgroundImage = `url(${imageUrl})`;
    } catch (error) {
        console.error('Error:', error);
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













document.addEventListener('DOMContentLoaded', () => {
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsPanel = document.getElementById('settingsPanel');
    const settingsClose = document.getElementById('settingsClose');
    const blurSlider = document.getElementById('blurSlider');
    const blurValue = document.getElementById('blurValue');

    // Mouse spotlight effect function
    const addSpotlightEffect = () => {
        document.querySelectorAll('.widget, .settings-panel').forEach(element => {
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

    if (settingsBtn && settingsPanel && settingsClose) {
        settingsBtn.addEventListener('click', () => {
            settingsPanel.classList.toggle('active');
            // Re-apply spotlight after panel appears
            setTimeout(addSpotlightEffect, 100);
        });

        settingsClose.addEventListener('click', () => {
            settingsPanel.classList.remove('active');
        });

        // Blur adjustment (CHỈ 1 LẦN)
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
            });
        }

        // Spotlight size adjustment - THÊM ĐOẠN NÀY
        const spotlightSlider = document.getElementById('spotlightSlider');
        const spotlightValue = document.getElementById('spotlightValue');

        if (spotlightSlider && spotlightValue) {
            spotlightSlider.addEventListener('input', (e) => {
                const size = e.target.value;
                spotlightValue.textContent = `${size}px`;

                // Update CSS variable for all elements
                document.documentElement.style.setProperty('--spotlight-size', `${size}px`);
            });
        }
    }
});