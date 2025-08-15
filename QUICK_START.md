# 🎮 Quick Start Guide - Advanced Web Game Engine

## 🚀 Multiple Ways to Run Your Game Engine

### 1. **Direct File Access (Easiest)**
Simply open these files directly in your browser:
- `demo.html` - Beautiful engine showcase
- `index.html` - Full game engine interface
- `status.html` - Engine status checker

**No server needed!** Just double-click the files.

### 2. **Python Server (Recommended)**
```bash
# Try different ports if 8000 doesn't work:
python3 -m http.server 3000
python3 -m http.server 5000
python3 -m http.server 8080
python3 -m http.server 9000

# Or with npm:
npm run server-python
npm run server-5000
npm run server-8080
npm run server-9000
```

### 3. **Node.js Server**
```bash
# Start Node.js server:
node server.js

# Or with npm:
npm start
npm run server-node
```

### 4. **PHP Server**
```bash
# Start PHP server:
php -S localhost:8080

# Or with npm:
npm run server-php
```

### 5. **VS Code Live Server**
1. Install "Live Server" extension in VS Code
2. Right-click on `demo.html` or `index.html`
3. Select "Open with Live Server"

### 6. **Other Options**
- **XAMPP** - Use Apache server
- **WAMP** - Windows Apache MySQL PHP
- **MAMP** - Mac Apache MySQL PHP
- **LAMP** - Linux Apache MySQL PHP

## 🌐 Access URLs

Once your server is running, access:
- **Demo:** `http://localhost:PORT/demo.html`
- **Engine:** `http://localhost:PORT/index.html`
- **Status:** `http://localhost:PORT/status.html`

## 🔧 Troubleshooting

### Port Already in Use?
Try a different port:
```bash
python3 -m http.server 3000  # Instead of 8000
```

### Permission Denied?
```bash
# On Linux/Mac:
chmod +x start.sh
./start.sh
```

### File Not Found?
Make sure you're in the correct directory:
```bash
ls -la  # Should show index.html, demo.html, etc.
```

## 📱 Mobile Access

To access from your phone/tablet:
```bash
# Bind to all interfaces:
python3 -m http.server 3000 --bind 0.0.0.0

# Then access from your device:
http://YOUR_COMPUTER_IP:3000/demo.html
```

## 🎯 Quick Commands

```bash
# Start with Python (port 3000):
npm run dev

# Start with Node.js (port 3000):
npm start

# Start with Python (port 5000):
npm run server-5000

# Open files directly (Mac):
npm run open-demo
npm run open-engine
```

## ✅ Success Indicators

You'll know it's working when you see:
- ✅ Professional dark theme interface
- ✅ Loading screen with animated progress bar
- ✅ Toolbar with Play/Pause buttons
- ✅ Scene view, project explorer, inspector panels
- ✅ Real-time console at the bottom

## 🚀 Ready to Go!

Your game engine is now ready to use! Choose any method above and start creating amazing games! 🎮