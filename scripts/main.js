/**
 * Main Application Entry Point
 * Advanced Web Game Engine
 */

// Global engine instance
let engine = null;

// Application state
const AppState = {
    LOADING: 'loading',
    READY: 'ready',
    RUNNING: 'running',
    PAUSED: 'paused',
    ERROR: 'error'
};

let currentState = AppState.LOADING;

/**
 * Initialize the application
 */
async function initializeApp() {
    try {
        console.log('Initializing Advanced Web Game Engine...');
        
        // Show loading screen
        showLoadingScreen();
        
        // Create engine instance
        engine = Engine.getInstance();
        
        // Initialize engine
        const success = await engine.initialize();
        
        if (success) {
            currentState = AppState.READY;
            console.log('Engine initialized successfully');
            
            // Set up UI event listeners
            setupUIEventListeners();
            
            // Start the engine
            engine.start();
            currentState = AppState.RUNNING;
            
        } else {
            throw new Error('Failed to initialize engine');
        }
        
    } catch (error) {
        currentState = AppState.ERROR;
        console.error('Failed to initialize application:', error);
        showErrorMessage('Failed to initialize engine: ' + error.message);
    }
}

/**
 * Show loading screen
 */
function showLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    const editor = document.getElementById('editor');
    
    if (loadingScreen) {
        loadingScreen.style.display = 'flex';
    }
    
    if (editor) {
        editor.style.display = 'none';
    }
}

/**
 * Hide loading screen
 */
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    const editor = document.getElementById('editor');
    
    if (loadingScreen) {
        loadingScreen.style.display = 'none';
    }
    
    if (editor) {
        editor.style.display = 'flex';
    }
}

/**
 * Show error message
 */
function showErrorMessage(message) {
    const loadingText = document.querySelector('.loading-text');
    if (loadingText) {
        loadingText.textContent = 'Error: ' + message;
        loadingText.style.color = '#F44336';
    }
}

/**
 * Set up UI event listeners
 */
function setupUIEventListeners() {
    // Toolbar buttons
    setupToolbarEventListeners();
    
    // Panel controls
    setupPanelEventListeners();
    
    // Console
    setupConsoleEventListeners();
    
    // Modals
    setupModalEventListeners();
    
    // Context menus
    setupContextMenuEventListeners();
}

/**
 * Set up toolbar event listeners
 */
function setupToolbarEventListeners() {
    // New Project
    const newProjectBtn = document.getElementById('new-project');
    if (newProjectBtn) {
        newProjectBtn.addEventListener('click', () => {
            if (engine) {
                engine.newProject();
            }
        });
    }
    
    // Open Project
    const openProjectBtn = document.getElementById('open-project');
    if (openProjectBtn) {
        openProjectBtn.addEventListener('click', () => {
            if (engine) {
                engine.openProject();
            }
        });
    }
    
    // Save Project
    const saveProjectBtn = document.getElementById('save-project');
    if (saveProjectBtn) {
        saveProjectBtn.addEventListener('click', () => {
            if (engine) {
                engine.saveProject();
            }
        });
    }
    
    // Play Button
    const playBtn = document.getElementById('play-btn');
    if (playBtn) {
        playBtn.addEventListener('click', () => {
            if (engine) {
                if (currentState === AppState.RUNNING) {
                    engine.stop();
                    currentState = AppState.PAUSED;
                    playBtn.innerHTML = '<i class="fas fa-play"></i> Play';
                } else {
                    engine.start();
                    currentState = AppState.RUNNING;
                    playBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
                }
            }
        });
    }
    
    // Pause Button
    const pauseBtn = document.getElementById('pause-btn');
    if (pauseBtn) {
        pauseBtn.addEventListener('click', () => {
            if (engine && currentState === AppState.RUNNING) {
                engine.stop();
                currentState = AppState.PAUSED;
            }
        });
    }
    
    // Stop Button
    const stopBtn = document.getElementById('stop-btn');
    if (stopBtn) {
        stopBtn.addEventListener('click', () => {
            if (engine) {
                engine.stop();
                currentState = AppState.READY;
            }
        });
    }
    
    // Settings Button
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            showSettingsModal();
        });
    }
    
    // Help Button
    const helpBtn = document.getElementById('help-btn');
    if (helpBtn) {
        helpBtn.addEventListener('click', () => {
            showHelpModal();
        });
    }
}

/**
 * Set up panel event listeners
 */
function setupPanelEventListeners() {
    // Project Explorer
    const addAssetBtn = document.getElementById('add-asset');
    if (addAssetBtn) {
        addAssetBtn.addEventListener('click', () => {
            showAddAssetModal();
        });
    }
    
    const refreshExplorerBtn = document.getElementById('refresh-explorer');
    if (refreshExplorerBtn) {
        refreshExplorerBtn.addEventListener('click', () => {
            if (engine && engine.projectExplorer) {
                engine.projectExplorer.refresh();
            }
        });
    }
    
    // Scene View Tools
    const translateToolBtn = document.getElementById('translate-tool');
    if (translateToolBtn) {
        translateToolBtn.addEventListener('click', () => {
            setActiveTool('translate');
        });
    }
    
    const rotateToolBtn = document.getElementById('rotate-tool');
    if (rotateToolBtn) {
        rotateToolBtn.addEventListener('click', () => {
            setActiveTool('rotate');
        });
    }
    
    const scaleToolBtn = document.getElementById('scale-tool');
    if (scaleToolBtn) {
        scaleToolBtn.addEventListener('click', () => {
            setActiveTool('scale');
        });
    }
    
    const selectToolBtn = document.getElementById('select-tool');
    if (selectToolBtn) {
        selectToolBtn.addEventListener('click', () => {
            setActiveTool('select');
        });
    }
    
    // Console
    const clearConsoleBtn = document.getElementById('clear-console');
    if (clearConsoleBtn) {
        clearConsoleBtn.addEventListener('click', () => {
            if (engine && engine.console) {
                engine.console.clear();
            }
        });
    }
    
    const toggleConsoleBtn = document.getElementById('toggle-console');
    if (toggleConsoleBtn) {
        toggleConsoleBtn.addEventListener('click', () => {
            toggleConsole();
        });
    }
}

/**
 * Set up console event listeners
 */
function setupConsoleEventListeners() {
    const consoleInput = document.getElementById('console-input');
    const consoleExecuteBtn = document.getElementById('console-execute');
    
    if (consoleInput) {
        consoleInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                executeConsoleCommand();
            }
        });
    }
    
    if (consoleExecuteBtn) {
        consoleExecuteBtn.addEventListener('click', () => {
            executeConsoleCommand();
        });
    }
}

/**
 * Execute console command
 */
function executeConsoleCommand() {
    const consoleInput = document.getElementById('console-input');
    if (!consoleInput) return;
    
    const command = consoleInput.value.trim();
    if (!command) return;
    
    try {
        // Execute the command
        const result = eval(command);
        
        // Log the result
        if (engine && engine.console) {
            engine.console.log('> ' + command);
            if (result !== undefined) {
                engine.console.log(result);
            }
        }
        
        // Clear input
        consoleInput.value = '';
        
    } catch (error) {
        if (engine && engine.console) {
            engine.console.error('Error executing command: ' + error.message);
        }
    }
}

/**
 * Set up modal event listeners
 */
function setupModalEventListeners() {
    const modalOverlay = document.getElementById('modal-overlay');
    const modalCloseBtn = document.querySelector('.modal-close');
    
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (event) => {
            if (event.target === modalOverlay) {
                hideModal();
            }
        });
    }
    
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', () => {
            hideModal();
        });
    }
}

/**
 * Set up context menu event listeners
 */
function setupContextMenuEventListeners() {
    // Hide context menu when clicking elsewhere
    document.addEventListener('click', () => {
        hideContextMenu();
    });
    
    // Prevent context menu from hiding when clicking inside it
    const contextMenu = document.getElementById('context-menu');
    if (contextMenu) {
        contextMenu.addEventListener('click', (event) => {
            event.stopPropagation();
        });
    }
}

/**
 * Set active tool
 */
function setActiveTool(tool) {
    // Remove active class from all tool buttons
    const toolButtons = document.querySelectorAll('.panel-btn');
    toolButtons.forEach(btn => btn.classList.remove('active'));
    
    // Add active class to selected tool
    const activeButton = document.querySelector(`#${tool}-tool`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
    
    // Update scene editor tool
    if (engine && engine.sceneEditor) {
        engine.sceneEditor.setActiveTool(tool);
    }
}

/**
 * Toggle console visibility
 */
function toggleConsole() {
    const consolePanel = document.querySelector('.console');
    if (consolePanel) {
        const isVisible = consolePanel.style.display !== 'none';
        consolePanel.style.display = isVisible ? 'none' : 'flex';
    }
}

/**
 * Show modal
 */
function showModal(title, content) {
    const modalOverlay = document.getElementById('modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');
    
    if (modalOverlay && modalTitle && modalContent) {
        modalTitle.textContent = title;
        modalContent.innerHTML = content;
        modalOverlay.style.display = 'flex';
    }
}

/**
 * Hide modal
 */
function hideModal() {
    const modalOverlay = document.getElementById('modal-overlay');
    if (modalOverlay) {
        modalOverlay.style.display = 'none';
    }
}

/**
 * Show settings modal
 */
function showSettingsModal() {
    const content = `
        <div class="settings-content">
            <div class="settings-section">
                <h4>General</h4>
                <div class="setting-item">
                    <label>Show FPS Counter</label>
                    <input type="checkbox" id="show-fps" checked>
                </div>
                <div class="setting-item">
                    <label>Show Statistics</label>
                    <input type="checkbox" id="show-stats" checked>
                </div>
                <div class="setting-item">
                    <label>Enable Physics</label>
                    <input type="checkbox" id="enable-physics" checked>
                </div>
                <div class="setting-item">
                    <label>Enable Audio</label>
                    <input type="checkbox" id="enable-audio" checked>
                </div>
            </div>
            <div class="settings-section">
                <h4>Performance</h4>
                <div class="setting-item">
                    <label>Target FPS</label>
                    <input type="range" id="target-fps" min="30" max="144" value="60">
                    <span id="target-fps-value">60</span>
                </div>
                <div class="setting-item">
                    <label>VSync</label>
                    <input type="checkbox" id="vsync" checked>
                </div>
            </div>
        </div>
    `;
    
    showModal('Settings', content);
}

/**
 * Show help modal
 */
function showHelpModal() {
    const content = `
        <div class="help-content">
            <h4>Keyboard Shortcuts</h4>
            <ul>
                <li><strong>Ctrl/Cmd + S:</strong> Save Project</li>
                <li><strong>Ctrl/Cmd + O:</strong> Open Project</li>
                <li><strong>Ctrl/Cmd + N:</strong> New Project</li>
                <li><strong>Space:</strong> Play/Pause</li>
                <li><strong>Escape:</strong> Stop</li>
                <li><strong>F5:</strong> Refresh</li>
            </ul>
            
            <h4>Scene View Controls</h4>
            <ul>
                <li><strong>Left Mouse:</strong> Select</li>
                <li><strong>Right Mouse:</strong> Orbit Camera</li>
                <li><strong>Middle Mouse:</strong> Pan Camera</li>
                <li><strong>Mouse Wheel:</strong> Zoom Camera</li>
                <li><strong>W:</strong> Translate Tool</li>
                <li><strong>E:</strong> Rotate Tool</li>
                <li><strong>R:</strong> Scale Tool</li>
                <li><strong>Q:</strong> Select Tool</li>
            </ul>
            
            <h4>Getting Started</h4>
            <p>Welcome to the Advanced Web Game Engine! This is a comprehensive game development tool that runs entirely in your web browser.</p>
            <p>To get started:</p>
            <ol>
                <li>Create a new project or open an existing one</li>
                <li>Add assets to your project using the Project Explorer</li>
                <li>Create game objects in the Scene View</li>
                <li>Configure properties in the Inspector</li>
                <li>Write scripts to add behavior to your objects</li>
                <li>Test your game using the Play button</li>
            </ol>
        </div>
    `;
    
    showModal('Help', content);
}

/**
 * Show add asset modal
 */
function showAddAssetModal() {
    const content = `
        <div class="add-asset-content">
            <div class="asset-type">
                <h4>3D Models</h4>
                <button onclick="addAsset('model')">Add 3D Model</button>
            </div>
            <div class="asset-type">
                <h4>Textures</h4>
                <button onclick="addAsset('texture')">Add Texture</button>
            </div>
            <div class="asset-type">
                <h4>Audio</h4>
                <button onclick="addAsset('audio')">Add Audio</button>
            </div>
            <div class="asset-type">
                <h4>Scripts</h4>
                <button onclick="addAsset('script')">Add Script</button>
            </div>
        </div>
    `;
    
    showModal('Add Asset', content);
}

/**
 * Add asset to project
 */
function addAsset(type) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = getFileAccept(type);
    
    input.onchange = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (engine && engine.assetManager) {
                engine.assetManager.importAsset(file, type);
            }
        }
    };
    
    input.click();
    hideModal();
}

/**
 * Get file accept string for asset type
 */
function getFileAccept(type) {
    switch (type) {
        case 'model':
            return '.obj,.fbx,.gltf,.glb,.dae,.3ds,.blend';
        case 'texture':
            return '.png,.jpg,.jpeg,.bmp,.tga,.hdr,.exr';
        case 'audio':
            return '.mp3,.wav,.ogg,.flac,.aac';
        case 'script':
            return '.js,.ts';
        default:
            return '*';
    }
}

/**
 * Show context menu
 */
function showContextMenu(x, y, items) {
    const contextMenu = document.getElementById('context-menu');
    if (!contextMenu) return;
    
    // Clear existing items
    contextMenu.innerHTML = '';
    
    // Add new items
    items.forEach(item => {
        if (item.separator) {
            const separator = document.createElement('div');
            separator.className = 'context-menu-separator';
            contextMenu.appendChild(separator);
        } else {
            const menuItem = document.createElement('div');
            menuItem.className = 'context-menu-item';
            menuItem.innerHTML = `<i class="${item.icon}"></i>${item.text}`;
            menuItem.onclick = item.action;
            contextMenu.appendChild(menuItem);
        }
    });
    
    // Position and show
    contextMenu.style.left = x + 'px';
    contextMenu.style.top = y + 'px';
    contextMenu.style.display = 'block';
}

/**
 * Hide context menu
 */
function hideContextMenu() {
    const contextMenu = document.getElementById('context-menu');
    if (contextMenu) {
        contextMenu.style.display = 'none';
    }
}

/**
 * Handle window resize
 */
function handleWindowResize() {
    if (engine && engine.renderer) {
        engine.renderer.resize();
    }
}

/**
 * Handle before unload
 */
function handleBeforeUnload() {
    if (engine) {
        engine.shutdown();
    }
}

// Global functions for use in HTML
window.addAsset = addAsset;
window.showContextMenu = showContextMenu;
window.hideContextMenu = hideContextMenu;

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Set up global event listeners
    window.addEventListener('resize', handleWindowResize);
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Initialize the application
    initializeApp();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AppState, initializeApp };
}