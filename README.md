# Liquid Glass Homepage

A beautiful, modern homepage with liquid glass morphism design and integrated AI widgets.

## ✨ Features

### 🎨 Design
- **Liquid Glass Effect**: Beautiful glassmorphism UI with spotlight hover effects
- **Dynamic Background**: Random aurora images from Unsplash API
- **Responsive**: Works seamlessly on desktop, tablet, and mobile
- **Customizable Settings**: Adjust blur and spotlight size to your preference

### 🤖 AI Widgets
- **Ask Claude**: Quickly copy prompts and open Claude.ai
- **Ask ChatGPT**: Quickly copy prompts and open ChatGPT
- **Smart Input**: Buttons auto-enable when you type
- **Keyboard Shortcut**: Press Enter to submit (Shift+Enter for new line)

### 📱 App Launcher
- **Drag & Drop**: Reorder apps by dragging
- **Add Apps**: Click the "+" button to add custom apps
- **Context Menu**: Right-click to edit or remove apps
- **Persistent**: Order and custom apps saved to localStorage

### ⚙️ Settings
- **Background Blur**: Adjust glass effect intensity (0-40px)
- **Spotlight Size**: Control hover spotlight radius (50-300px)
- **Auto-Save**: Settings persist across sessions

## 🚀 How to Use

### AI Widgets

1. **Type your question** in the Claude or ChatGPT textarea
2. **Click the button** or press Enter
3. Your prompt is **automatically copied** to clipboard
4. A new tab opens to the AI service
5. **Paste** (Ctrl+V / Cmd+V) your prompt and start chatting!

**Pro Tip**: Use Shift+Enter to add new lines in your prompt.

### App Management

**Add New App:**
1. Click the "+" button
2. Enter app name, URL, and icon URL
3. App appears in the grid

**Reorder Apps:**
- Just drag and drop!

**Edit/Remove App:**
1. Right-click on any app
2. Choose "Edit" or "Remove"

### Customization

1. Click the ⚙️ settings button (top-right)
2. Adjust sliders:
   - **Background Blur**: How blurry the glass effect is
   - **Spotlight Size**: Size of the hover light effect
3. Changes save automatically

## 🔧 Technical Details

### Structure
```
├── index.html      # Main HTML structure
├── style.css       # Glassmorphism styling
└── script.js       # Interactive functionality
```

### Key Technologies
- **Vanilla JavaScript**: No frameworks, pure JS
- **CSS Grid**: Responsive app layout
- **LocalStorage**: Persistent settings and app order
- **Unsplash API**: Dynamic background images
- **Clipboard API**: Copy-paste functionality

### Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## 🎯 Features Breakdown

### Glassmorphism Effect
All glass elements share the `.glass-effect` class for:
- Backdrop blur with saturation
- Subtle gradient overlays
- Border highlights
- Dynamic spotlight on hover

### Spotlight System
Uses CSS custom properties for smooth mouse tracking:
```css
--mouse-x: Position X
--mouse-y: Position Y
--spotlight-size: Radius (adjustable)
```

### Smart Notifications
Toast-style notifications for user feedback:
- ✓ Success (green)
- ⚠ Warning (yellow)
- ✗ Error (red)
- ℹ Info (blue)

Auto-dismiss after 3 seconds with smooth animations.

## 📝 Customization Guide

### Change Default Background
Edit `CONFIG.UNSPLASH_QUERY` in `script.js`:
```javascript
UNSPLASH_QUERY: 'aurora',  // Try: 'ocean', 'mountain', 'sunset'
```

### Change Greeting Name
Edit the `updateGreeting()` function in `script.js`:
```javascript
document.getElementById('greeting').innerHTML = 
    `${greetingText}, <span>YourName</span>`;
```

### Add Default Apps
Add more app items in `index.html` following the pattern:
```html
<a class="app-item glass-effect" 
   href="https://example.com" 
   target="_blank" 
   draggable="true" 
   data-id="unique-id">
    <img src="icon-url" alt="App Name">
    <span>App Name</span>
</a>
```

## 🐛 Troubleshooting

**Q: Background won't load?**
- Check console for API errors
- Fallback image will load automatically
- You can replace the API key in `CONFIG.UNSPLASH_API_KEY`

**Q: AI widgets not working?**
- Make sure your browser allows clipboard access
- Check if pop-up blocker is preventing new tabs

**Q: Apps not saving?**
- Check if localStorage is enabled
- Clear browser cache and try again

**Q: Spotlight effect laggy?**
- Reduce spotlight size in settings
- Try increasing blur slider (better performance)

## 🔐 Privacy & Security

- ✅ No data sent to external servers (except Unsplash for background)
- ✅ All settings stored locally in browser
- ✅ AI prompts only copied to clipboard, never logged
- ⚠️ Consider moving API key to environment variable for production

## 📄 License

Free to use and modify for personal projects.

## 🙏 Credits

- Design: Inspired by iOS/macOS glassmorphism
- Icons: Simple Icons, Font Awesome
- Background: Unsplash API

---

**Built with ❤️ for Minkei**
