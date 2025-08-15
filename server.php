<?php
// Simple PHP server for the game engine
$port = isset($_GET['port']) ? (int)$_GET['port'] : 8080;

echo "🎮 Advanced Web Game Engine - PHP Server\n";
echo "========================================\n";
echo "Starting server on port: $port\n";
echo "Access your engine at: http://localhost:$port\n";
echo "Press Ctrl+C to stop\n\n";

// Start the built-in PHP server
$command = "php -S localhost:$port";
system($command);
?>