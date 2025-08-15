#!/bin/bash

echo "📱 Mobile Game Engine Setup"
echo "=========================="
echo ""

# Check if we're on mobile
if [ -d "/data/data/com.termux" ]; then
    echo "✅ Detected Termux environment"
    MOBILE=true
elif [ -d "/var/mobile" ]; then
    echo "✅ Detected iOS jailbreak environment"
    MOBILE=true
else
    echo "⚠️  Not detected as mobile environment"
    MOBILE=false
fi

echo ""
echo "🚀 Starting mobile-friendly server..."
echo ""

# Use a mobile-friendly port
PORT=8080

echo "📱 Mobile Server Configuration:"
echo "   Port: $PORT"
echo "   Access: http://localhost:$PORT"
echo "   Demo: http://localhost:$PORT/demo.html"
echo "   Engine: http://localhost:$PORT/index.html"
echo ""

# Check if Python is available
if command -v python3 &> /dev/null; then
    echo "🐍 Using Python server..."
    python3 -m http.server $PORT --bind 0.0.0.0
elif command -v python &> /dev/null; then
    echo "🐍 Using Python server..."
    python -m http.server $PORT --bind 0.0.0.0
elif command -v node &> /dev/null; then
    echo "🟢 Using Node.js server..."
    node server.js
elif command -v php &> /dev/null; then
    echo "🔵 Using PHP server..."
    php -S 0.0.0.0:$PORT
else
    echo "❌ No server found. Please install Python, Node.js, or PHP."
    echo ""
    echo "📱 Mobile Installation Options:"
    echo "   Termux: pkg install python"
    echo "   Termux: pkg install nodejs"
    echo "   iOS: Install via App Store or Cydia"
fi