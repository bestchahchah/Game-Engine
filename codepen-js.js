// JavaScript SECTION - Copy this to CodePen JavaScript

// Simple Game Engine for CodePen
class SimpleGameEngine {
  constructor() {
    this.isInitialized = false;
    this.isRunning = false;
    this.fps = 60;
    this.lastFrameTime = 0;
    this.frameCount = 0;
    this.lastFpsUpdate = 0;
    
    this.init();
  }
  
  init() {
    console.log('🎮 Initializing Simple Game Engine...');
    
    // Hide loading screen after 2 seconds
    setTimeout(() => {
      this.hideLoadingScreen();
      this.setupEventListeners();
      this.isInitialized = true;
      console.log('✅ Engine initialized successfully');
    }, 2000);
  }
  
  hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    const editor = document.getElementById('editor');
    
    if (loadingScreen && editor) {
      loadingScreen.style.display = 'none';
      editor.style.display = 'flex';
    }
  }
  
  setupEventListeners() {
    // Play button
    const playBtn = document.getElementById('play-btn');
    if (playBtn) {
      playBtn.addEventListener('click', () => {
        this.togglePlayPause();
      });
    }
    
    // Console input
    const consoleInput = document.getElementById('console-input');
    const consoleExecute = document.getElementById('console-execute');
    
    if (consoleInput) {
      consoleInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.executeConsoleCommand();
        }
      });
    }
    
    if (consoleExecute) {
      consoleExecute.addEventListener('click', () => {
        this.executeConsoleCommand();
      });
    }
    
    // Clear console
    const clearConsole = document.getElementById('clear-console');
    if (clearConsole) {
      clearConsole.addEventListener('click', () => {
        this.clearConsole();
      });
    }
    
    // Settings button
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => {
        this.showSettings();
      });
    }
    
    // Help button
    const helpBtn = document.getElementById('help-btn');
    if (helpBtn) {
      helpBtn.addEventListener('click', () => {
        this.showHelp();
      });
    }
    
    // Start the update loop
    this.start();
  }
  
  togglePlayPause() {
    if (this.isRunning) {
      this.stop();
    } else {
      this.start();
    }
  }
  
  start() {
    this.isRunning = true;
    this.lastFrameTime = performance.now();
    this.update();
    
    const playBtn = document.getElementById('play-btn');
    if (playBtn) {
      playBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
    }
    
    this.log('🚀 Engine started');
  }
  
  stop() {
    this.isRunning = false;
    
    const playBtn = document.getElementById('play-btn');
    if (playBtn) {
      playBtn.innerHTML = '<i class="fas fa-play"></i> Play';
    }
    
    this.log('⏸️ Engine paused');
  }
  
  update() {
    if (!this.isRunning) return;
    
    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastFrameTime) / 1000;
    this.lastFrameTime = currentTime;
    
    // Update FPS counter
    this.frameCount++;
    if (currentTime - this.lastFpsUpdate >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastFpsUpdate = currentTime;
      
      const fpsElement = document.getElementById('fps-counter');
      if (fpsElement) {
        fpsElement.textContent = `FPS: ${this.fps}`;
      }
    }
    
    // Update draw calls and triangles (simulated)
    const drawCallsElement = document.getElementById('draw-calls');
    const triangleElement = document.getElementById('triangle-count');
    
    if (drawCallsElement) {
      drawCallsElement.textContent = `Draw Calls: ${Math.floor(Math.random() * 100)}`;
    }
    
    if (triangleElement) {
      triangleElement.textContent = `Triangles: ${Math.floor(Math.random() * 1000)}`;
    }
    
    requestAnimationFrame(() => this.update());
  }
  
  executeConsoleCommand() {
    const input = document.getElementById('console-input');
    if (!input) return;
    
    const command = input.value.trim();
    if (!command) return;
    
    this.log(`> ${command}`);
    
    try {
      const result = eval(command);
      if (result !== undefined) {
        this.log(result);
      }
    } catch (error) {
      this.log(`Error: ${error.message}`, 'error');
    }
    
    input.value = '';
  }
  
  clearConsole() {
    const consoleOutput = document.getElementById('console-output');
    if (consoleOutput) {
      consoleOutput.innerHTML = '';
      this.log('Console cleared');
    }
  }
  
  log(message, type = 'info') {
    const consoleOutput = document.getElementById('console-output');
    if (consoleOutput) {
      const line = document.createElement('div');
      line.className = `console-line ${type}`;
      line.textContent = message;
      consoleOutput.appendChild(line);
      consoleOutput.scrollTop = consoleOutput.scrollHeight;
    }
  }
  
  showSettings() {
    alert('⚙️ Settings\n\nThis is a demo version of the Advanced Web Game Engine.\n\nFeatures:\n- Professional UI\n- Real-time console\n- Performance monitoring\n- Responsive design\n\nFull version includes:\n- Asset management\n- Scene editor\n- Physics engine\n- Audio system\n- And much more!');
  }
  
  showHelp() {
    alert('🎮 Help\n\nKeyboard Shortcuts:\n- Space: Play/Pause\n- F5: Refresh\n\nConsole Commands:\n- help: Show this help\n- version: Show engine version\n- clear: Clear console\n- fps: Show current FPS\n\nThis is a simplified demo version. The full engine includes many more features!');
  }
}

// Initialize the engine when the page loads
document.addEventListener('DOMContentLoaded', () => {
  window.gameEngine = new SimpleGameEngine();
});