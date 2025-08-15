#!/bin/bash

echo "🎮 Starting Advanced Web Game Engine..."
echo "========================================"
echo ""
echo "📁 Files found:"
echo "  ✅ index.html - Main Engine Interface"
echo "  ✅ demo.html - Engine Showcase"
echo "  ✅ scripts/core/ - Core Engine Systems"
echo "  ✅ styles/main.css - Professional Styling"
echo ""
echo "🌐 Starting web server on port 8000..."
echo "🚀 Open your browser and go to:"
echo "   http://localhost:8000/demo.html (Showcase)"
echo "   http://localhost:8000/index.html (Full Engine)"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

python3 -m http.server 8000