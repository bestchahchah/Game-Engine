/**
 * Advanced Web Game Engine
 * Main Engine Class
 */

class Engine {
    constructor() {
        this.version = '1.0.0';
        this.isInitialized = false;
        this.isRunning = false;
        this.lastFrameTime = 0;
        this.deltaTime = 0;
        this.fps = 60;
        this.targetFps = 60;
        
        // Core systems
        this.memoryManager = null;
        this.logger = null;
        this.eventSystem = null;
        this.assetManager = null;
        this.sceneManager = null;
        this.ecs = null;
        this.renderer = null;
        this.physicsEngine = null;
        this.audioEngine = null;
        this.inputManager = null;
        this.scriptEngine = null;
        this.networkManager = null;
        
        // Editor systems
        this.editor = null;
        this.sceneEditor = null;
        this.inspector = null;
        this.projectExplorer = null;
        this.console = null;
        
        // Performance tracking
        this.frameCount = 0;
        this.lastFpsUpdate = 0;
        this.drawCalls = 0;
        this.triangleCount = 0;
        
        // Configuration
        this.config = {
            debug: true,
            showFps: true,
            showStats: true,
            enablePhysics: true,
            enableAudio: true,
            enableNetworking: false,
            maxFps: 144,
            vsync: true
        };
        
        // Bind methods
        this.update = this.update.bind(this);
        this.render = this.render.bind(this);
        this.handleResize = this.handleResize.bind(this);
    }
    
    /**
     * Initialize the engine
     */
    async initialize() {
        try {
            this.logger = new Logger();
            this.logger.info(`Initializing Advanced Web Game Engine v${this.version}`);
            
            // Initialize core systems
            await this.initializeCoreSystems();
            
            // Initialize rendering
            await this.initializeRendering();
            
            // Initialize physics
            if (this.config.enablePhysics) {
                await this.initializePhysics();
            }
            
            // Initialize audio
            if (this.config.enableAudio) {
                await this.initializeAudio();
            }
            
            // Initialize input
            await this.initializeInput();
            
            // Initialize scripting
            await this.initializeScripting();
            
            // Initialize networking
            if (this.config.enableNetworking) {
                await this.initializeNetworking();
            }
            
            // Initialize editor
            await this.initializeEditor();
            
            // Set up event listeners
            this.setupEventListeners();
            
            this.isInitialized = true;
            this.logger.info('Engine initialization completed successfully');
            
            // Hide loading screen and show editor
            this.hideLoadingScreen();
            
            return true;
        } catch (error) {
            this.logger.error('Failed to initialize engine:', error);
            return false;
        }
    }
    
    /**
     * Initialize core systems
     */
    async initializeCoreSystems() {
        this.logger.info('Initializing core systems...');
        
        this.memoryManager = new MemoryManager();
        await this.memoryManager.initialize();
        
        this.eventSystem = new EventSystem();
        await this.eventSystem.initialize();
        
        this.assetManager = new AssetManager();
        await this.assetManager.initialize();
        
        this.sceneManager = new SceneManager();
        await this.sceneManager.initialize();
        
        this.ecs = new EntityComponentSystem();
        await this.ecs.initialize();
        
        this.logger.info('Core systems initialized');
    }
    
    /**
     * Initialize rendering system
     */
    async initializeRendering() {
        this.logger.info('Initializing rendering system...');
        
        const canvas = document.getElementById('scene-canvas');
        if (!canvas) {
            throw new Error('Scene canvas not found');
        }
        
        this.renderer = new Renderer(canvas);
        await this.renderer.initialize();
        
        this.logger.info('Rendering system initialized');
    }
    
    /**
     * Initialize physics system
     */
    async initializePhysics() {
        this.logger.info('Initializing physics system...');
        
        this.physicsEngine = new PhysicsEngine();
        await this.physicsEngine.initialize();
        
        this.logger.info('Physics system initialized');
    }
    
    /**
     * Initialize audio system
     */
    async initializeAudio() {
        this.logger.info('Initializing audio system...');
        
        this.audioEngine = new AudioEngine();
        await this.audioEngine.initialize();
        
        this.logger.info('Audio system initialized');
    }
    
    /**
     * Initialize input system
     */
    async initializeInput() {
        this.logger.info('Initializing input system...');
        
        this.inputManager = new InputManager();
        await this.inputManager.initialize();
        
        this.logger.info('Input system initialized');
    }
    
    /**
     * Initialize scripting system
     */
    async initializeScripting() {
        this.logger.info('Initializing scripting system...');
        
        this.scriptEngine = new ScriptEngine();
        await this.scriptEngine.initialize();
        
        this.logger.info('Scripting system initialized');
    }
    
    /**
     * Initialize networking system
     */
    async initializeNetworking() {
        this.logger.info('Initializing networking system...');
        
        this.networkManager = new NetworkManager();
        await this.networkManager.initialize();
        
        this.logger.info('Networking system initialized');
    }
    
    /**
     * Initialize editor systems
     */
    async initializeEditor() {
        this.logger.info('Initializing editor systems...');
        
        this.editor = new Editor();
        await this.editor.initialize();
        
        this.sceneEditor = new SceneEditor();
        await this.sceneEditor.initialize();
        
        this.inspector = new Inspector();
        await this.inspector.initialize();
        
        this.projectExplorer = new ProjectExplorer();
        await this.projectExplorer.initialize();
        
        this.console = new Console();
        await this.console.initialize();
        
        this.logger.info('Editor systems initialized');
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Window events
        window.addEventListener('resize', this.handleResize);
        window.addEventListener('beforeunload', () => this.shutdown());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            this.handleKeyboardShortcuts(event);
        });
        
        // Prevent context menu on canvas
        const canvas = document.getElementById('scene-canvas');
        canvas.addEventListener('contextmenu', (event) => {
            event.preventDefault();
        });
    }
    
    /**
     * Handle window resize
     */
    handleResize() {
        if (this.renderer) {
            this.renderer.resize();
        }
    }
    
    /**
     * Handle keyboard shortcuts
     */
    handleKeyboardShortcuts(event) {
        // Ctrl/Cmd + S: Save project
        if ((event.ctrlKey || event.metaKey) && event.key === 's') {
            event.preventDefault();
            this.saveProject();
        }
        
        // Ctrl/Cmd + O: Open project
        if ((event.ctrlKey || event.metaKey) && event.key === 'o') {
            event.preventDefault();
            this.openProject();
        }
        
        // Ctrl/Cmd + N: New project
        if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
            event.preventDefault();
            this.newProject();
        }
        
        // Space: Play/Pause
        if (event.key === ' ') {
            event.preventDefault();
            this.togglePlayPause();
        }
        
        // Escape: Stop
        if (event.key === 'Escape') {
            this.stop();
        }
        
        // F5: Refresh
        if (event.key === 'F5') {
            event.preventDefault();
            this.refresh();
        }
    }
    
    /**
     * Start the engine
     */
    start() {
        if (!this.isInitialized) {
            this.logger.error('Cannot start engine: not initialized');
            return;
        }
        
        if (this.isRunning) {
            this.logger.warning('Engine is already running');
            return;
        }
        
        this.isRunning = true;
        this.lastFrameTime = performance.now();
        this.frameCount = 0;
        this.lastFpsUpdate = this.lastFrameTime;
        
        this.logger.info('Engine started');
        this.update();
    }
    
    /**
     * Stop the engine
     */
    stop() {
        if (!this.isRunning) {
            return;
        }
        
        this.isRunning = false;
        this.logger.info('Engine stopped');
    }
    
    /**
     * Main update loop
     */
    update() {
        if (!this.isRunning) {
            return;
        }
        
        const currentTime = performance.now();
        this.deltaTime = (currentTime - this.lastFrameTime) / 1000;
        this.lastFrameTime = currentTime;
        
        // Cap delta time to prevent spiral of death
        this.deltaTime = Math.min(this.deltaTime, 1.0 / 30.0);
        
        // Update systems
        this.updateSystems();
        
        // Render
        this.render();
        
        // Update FPS counter
        this.updateFpsCounter(currentTime);
        
        // Request next frame
        requestAnimationFrame(this.update);
    }
    
    /**
     * Update all systems
     */
    updateSystems() {
        // Update input
        if (this.inputManager) {
            this.inputManager.update(this.deltaTime);
        }
        
        // Update physics
        if (this.physicsEngine && this.config.enablePhysics) {
            this.physicsEngine.update(this.deltaTime);
        }
        
        // Update audio
        if (this.audioEngine && this.config.enableAudio) {
            this.audioEngine.update(this.deltaTime);
        }
        
        // Update scripting
        if (this.scriptEngine) {
            this.scriptEngine.update(this.deltaTime);
        }
        
        // Update networking
        if (this.networkManager && this.config.enableNetworking) {
            this.networkManager.update(this.deltaTime);
        }
        
        // Update ECS
        if (this.ecs) {
            this.ecs.update(this.deltaTime);
        }
        
        // Update scene
        if (this.sceneManager) {
            this.sceneManager.update(this.deltaTime);
        }
        
        // Update editor
        if (this.editor) {
            this.editor.update(this.deltaTime);
        }
    }
    
    /**
     * Main render loop
     */
    render() {
        if (!this.renderer) {
            return;
        }
        
        // Clear the canvas
        this.renderer.clear();
        
        // Render the scene
        if (this.sceneManager) {
            this.renderer.render(this.sceneManager.getCurrentScene());
        }
        
        // Update render stats
        this.drawCalls = this.renderer.getDrawCalls();
        this.triangleCount = this.renderer.getTriangleCount();
        
        // Update stats display
        this.updateStatsDisplay();
    }
    
    /**
     * Update FPS counter
     */
    updateFpsCounter(currentTime) {
        this.frameCount++;
        
        if (currentTime - this.lastFpsUpdate >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFpsUpdate = currentTime;
            
            // Update FPS display
            const fpsElement = document.getElementById('fps-counter');
            if (fpsElement) {
                fpsElement.textContent = `FPS: ${this.fps}`;
            }
        }
    }
    
    /**
     * Update stats display
     */
    updateStatsDisplay() {
        const drawCallsElement = document.getElementById('draw-calls');
        if (drawCallsElement) {
            drawCallsElement.textContent = `Draw Calls: ${this.drawCalls}`;
        }
        
        const triangleElement = document.getElementById('triangle-count');
        if (triangleElement) {
            triangleElement.textContent = `Triangles: ${this.triangleCount}`;
        }
    }
    
    /**
     * Hide loading screen
     */
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        const editor = document.getElementById('editor');
        
        if (loadingScreen && editor) {
            loadingScreen.style.display = 'none';
            editor.style.display = 'flex';
        }
    }
    
    /**
     * Toggle play/pause
     */
    togglePlayPause() {
        if (this.isRunning) {
            this.stop();
        } else {
            this.start();
        }
    }
    
    /**
     * New project
     */
    newProject() {
        this.logger.info('Creating new project...');
        // Implementation for new project
    }
    
    /**
     * Open project
     */
    openProject() {
        this.logger.info('Opening project...');
        // Implementation for opening project
    }
    
    /**
     * Save project
     */
    saveProject() {
        this.logger.info('Saving project...');
        // Implementation for saving project
    }
    
    /**
     * Refresh
     */
    refresh() {
        this.logger.info('Refreshing...');
        location.reload();
    }
    
    /**
     * Shutdown the engine
     */
    async shutdown() {
        this.logger.info('Shutting down engine...');
        
        this.stop();
        
        // Shutdown systems in reverse order
        if (this.networkManager) {
            await this.networkManager.shutdown();
        }
        
        if (this.scriptEngine) {
            await this.scriptEngine.shutdown();
        }
        
        if (this.inputManager) {
            await this.inputManager.shutdown();
        }
        
        if (this.audioEngine) {
            await this.audioEngine.shutdown();
        }
        
        if (this.physicsEngine) {
            await this.physicsEngine.shutdown();
        }
        
        if (this.renderer) {
            await this.renderer.shutdown();
        }
        
        if (this.ecs) {
            await this.ecs.shutdown();
        }
        
        if (this.sceneManager) {
            await this.sceneManager.shutdown();
        }
        
        if (this.assetManager) {
            await this.assetManager.shutdown();
        }
        
        if (this.eventSystem) {
            await this.eventSystem.shutdown();
        }
        
        if (this.memoryManager) {
            await this.memoryManager.shutdown();
        }
        
        this.logger.info('Engine shutdown completed');
    }
    
    /**
     * Get engine instance (singleton)
     */
    static getInstance() {
        if (!Engine.instance) {
            Engine.instance = new Engine();
        }
        return Engine.instance;
    }
}

// Global engine instance
window.Engine = Engine;