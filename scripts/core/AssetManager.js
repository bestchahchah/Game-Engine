/**
 * Asset Manager
 * Handles asset loading, caching, and management
 */

class AssetManager {
    constructor() {
        this.isInitialized = false;
        this.assets = new Map();
        this.loadingAssets = new Map();
        this.assetTypes = new Map();
        this.cache = new Map();
        this.maxCacheSize = 100 * 1024 * 1024; // 100MB
        this.currentCacheSize = 0;
        
        // Performance tracking
        this.performance = {
            assetsLoaded: 0,
            assetsFailed: 0,
            totalLoadTime: 0,
            averageLoadTime: 0
        };
        
        // Supported file types
        this.supportedTypes = {
            // 3D Models
            'obj': 'model',
            'fbx': 'model',
            'gltf': 'model',
            'glb': 'model',
            'dae': 'model',
            '3ds': 'model',
            'blend': 'model',
            
            // Textures
            'png': 'texture',
            'jpg': 'texture',
            'jpeg': 'texture',
            'bmp': 'texture',
            'tga': 'texture',
            'hdr': 'texture',
            'exr': 'texture',
            'ktx': 'texture',
            'ktx2': 'texture',
            
            // Audio
            'mp3': 'audio',
            'wav': 'audio',
            'ogg': 'audio',
            'flac': 'audio',
            'aac': 'audio',
            'm4a': 'audio',
            
            // Scripts
            'js': 'script',
            'ts': 'script',
            'json': 'script',
            
            // Fonts
            'ttf': 'font',
            'otf': 'font',
            'woff': 'font',
            'woff2': 'font'
        };
        
        // Loaders
        this.loaders = new Map();
        this.registerDefaultLoaders();
    }
    
    /**
     * Initialize the asset manager
     */
    async initialize(config = {}) {
        try {
            this.maxCacheSize = config.maxCacheSize || this.maxCacheSize;
            
            this.isInitialized = true;
            console.log('AssetManager initialized');
            
            return true;
        } catch (error) {
            console.error('Failed to initialize AssetManager:', error);
            return false;
        }
    }
    
    /**
     * Register default asset loaders
     */
    registerDefaultLoaders() {
        // Texture loader
        this.loaders.set('texture', this.loadTexture.bind(this));
        
        // Audio loader
        this.loaders.set('audio', this.loadAudio.bind(this));
        
        // Script loader
        this.loaders.set('script', this.loadScript.bind(this));
        
        // Model loader (placeholder)
        this.loaders.set('model', this.loadModel.bind(this));
        
        // Font loader
        this.loaders.set('font', this.loadFont.bind(this));
    }
    
    /**
     * Load an asset
     */
    async loadAsset(url, type = null, options = {}) {
        if (!this.isInitialized) {
            throw new Error('AssetManager not initialized');
        }
        
        // Check if asset is already loaded
        if (this.assets.has(url)) {
            return this.assets.get(url);
        }
        
        // Check if asset is currently loading
        if (this.loadingAssets.has(url)) {
            return this.loadingAssets.get(url);
        }
        
        // Determine asset type
        if (!type) {
            type = this.getAssetTypeFromUrl(url);
        }
        
        if (!type) {
            throw new Error(`Unknown asset type for: ${url}`);
        }
        
        // Create loading promise
        const loadPromise = this.loadAssetInternal(url, type, options);
        this.loadingAssets.set(url, loadPromise);
        
        try {
            const asset = await loadPromise;
            this.assets.set(url, asset);
            this.loadingAssets.delete(url);
            
            // Update performance
            this.performance.assetsLoaded++;
            
            console.log(`Asset loaded: ${url}`);
            return asset;
            
        } catch (error) {
            this.loadingAssets.delete(url);
            this.performance.assetsFailed++;
            console.error(`Failed to load asset: ${url}`, error);
            throw error;
        }
    }
    
    /**
     * Internal asset loading
     */
    async loadAssetInternal(url, type, options) {
        const startTime = performance.now();
        
        try {
            // Get appropriate loader
            const loader = this.loaders.get(type);
            if (!loader) {
                throw new Error(`No loader registered for type: ${type}`);
            }
            
            // Load the asset
            const asset = await loader(url, options);
            
            // Update performance
            const loadTime = performance.now() - startTime;
            this.performance.totalLoadTime += loadTime;
            this.performance.averageLoadTime = 
                this.performance.totalLoadTime / this.performance.assetsLoaded;
            
            return asset;
            
        } catch (error) {
            throw error;
        }
    }
    
    /**
     * Load texture asset
     */
    async loadTexture(url, options = {}) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                const texture = {
                    type: 'texture',
                    url: url,
                    image: img,
                    width: img.width,
                    height: img.height,
                    loaded: true,
                    timestamp: Date.now()
                };
                
                resolve(texture);
            };
            
            img.onerror = () => {
                reject(new Error(`Failed to load texture: ${url}`));
            };
            
            img.crossOrigin = options.crossOrigin || 'anonymous';
            img.src = url;
        });
    }
    
    /**
     * Load audio asset
     */
    async loadAudio(url, options = {}) {
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            
            audio.oncanplaythrough = () => {
                const audioAsset = {
                    type: 'audio',
                    url: url,
                    audio: audio,
                    duration: audio.duration,
                    loaded: true,
                    timestamp: Date.now()
                };
                
                resolve(audioAsset);
            };
            
            audio.onerror = () => {
                reject(new Error(`Failed to load audio: ${url}`));
            };
            
            audio.crossOrigin = options.crossOrigin || 'anonymous';
            audio.src = url;
            audio.load();
        });
    }
    
    /**
     * Load script asset
     */
    async loadScript(url, options = {}) {
        try {
            const response = await fetch(url);
            const text = await response.text();
            
            const script = {
                type: 'script',
                url: url,
                content: text,
                loaded: true,
                timestamp: Date.now()
            };
            
            return script;
        } catch (error) {
            throw new Error(`Failed to load script: ${url}`);
        }
    }
    
    /**
     * Load model asset (placeholder)
     */
    async loadModel(url, options = {}) {
        // This would integrate with a 3D model loader like Three.js GLTFLoader
        const model = {
            type: 'model',
            url: url,
            loaded: true,
            timestamp: Date.now(),
            placeholder: true
        };
        
        return model;
    }
    
    /**
     * Load font asset
     */
    async loadFont(url, options = {}) {
        return new Promise((resolve, reject) => {
            const font = new FontFace(options.fontFamily || 'CustomFont', `url(${url})`);
            
            font.load().then(() => {
                document.fonts.add(font);
                
                const fontAsset = {
                    type: 'font',
                    url: url,
                    font: font,
                    loaded: true,
                    timestamp: Date.now()
                };
                
                resolve(fontAsset);
            }).catch(() => {
                reject(new Error(`Failed to load font: ${url}`));
            });
        });
    }
    
    /**
     * Get asset type from URL
     */
    getAssetTypeFromUrl(url) {
        const extension = url.split('.').pop().toLowerCase();
        return this.supportedTypes[extension] || null;
    }
    
    /**
     * Get loaded asset
     */
    getAsset(url) {
        return this.assets.get(url);
    }
    
    /**
     * Check if asset is loaded
     */
    isAssetLoaded(url) {
        return this.assets.has(url);
    }
    
    /**
     * Check if asset is loading
     */
    isAssetLoading(url) {
        return this.loadingAssets.has(url);
    }
    
    /**
     * Unload asset
     */
    unloadAsset(url) {
        const asset = this.assets.get(url);
        if (asset) {
            // Clean up resources
            if (asset.type === 'texture' && asset.image) {
                // Release texture memory
                asset.image = null;
            }
            
            if (asset.type === 'audio' && asset.audio) {
                // Stop and release audio
                asset.audio.pause();
                asset.audio.src = '';
                asset.audio = null;
            }
            
            this.assets.delete(url);
            console.log(`Asset unloaded: ${url}`);
        }
    }
    
    /**
     * Unload all assets
     */
    unloadAllAssets() {
        for (const [url, asset] of this.assets) {
            this.unloadAsset(url);
        }
        
        console.log('All assets unloaded');
    }
    
    /**
     * Get all loaded assets
     */
    getAllAssets() {
        return Array.from(this.assets.values());
    }
    
    /**
     * Get assets by type
     */
    getAssetsByType(type) {
        return Array.from(this.assets.values()).filter(asset => asset.type === type);
    }
    
    /**
     * Get performance statistics
     */
    getPerformanceStats() {
        return { ...this.performance };
    }
    
    /**
     * Reset performance statistics
     */
    resetPerformanceStats() {
        this.performance = {
            assetsLoaded: 0,
            assetsFailed: 0,
            totalLoadTime: 0,
            averageLoadTime: 0
        };
    }
    
    /**
     * Import asset from file
     */
    async importAsset(file, type = null) {
        if (!type) {
            type = this.getAssetTypeFromFile(file);
        }
        
        if (!type) {
            throw new Error(`Unsupported file type: ${file.name}`);
        }
        
        const url = URL.createObjectURL(file);
        const asset = await this.loadAsset(url, type);
        
        // Store file reference
        asset.file = file;
        asset.originalName = file.name;
        
        return asset;
    }
    
    /**
     * Get asset type from file
     */
    getAssetTypeFromFile(file) {
        const extension = file.name.split('.').pop().toLowerCase();
        return this.supportedTypes[extension] || null;
    }
    
    /**
     * Register custom loader
     */
    registerLoader(type, loader) {
        this.loaders.set(type, loader);
        console.log(`Registered loader for type: ${type}`);
    }
    
    /**
     * Get supported types
     */
    getSupportedTypes() {
        return { ...this.supportedTypes };
    }
    
    /**
     * Update the asset manager (called by engine)
     */
    update(deltaTime) {
        // Process any background tasks
    }
    
    /**
     * Shutdown the asset manager
     */
    async shutdown() {
        console.log('AssetManager shutting down...');
        
        // Unload all assets
        this.unloadAllAssets();
        
        // Clear all data
        this.assets.clear();
        this.loadingAssets.clear();
        this.assetTypes.clear();
        this.cache.clear();
        
        this.isInitialized = false;
        console.log('AssetManager shutdown completed');
    }
}

// Global asset manager instance
window.AssetManager = AssetManager;