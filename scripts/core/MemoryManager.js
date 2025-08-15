/**
 * Memory Manager
 * Handles memory allocation, deallocation, and garbage collection
 */

class MemoryManager {
    constructor() {
        this.isInitialized = false;
        this.totalAllocated = 0;
        this.totalFreed = 0;
        this.peakUsage = 0;
        this.currentUsage = 0;
        this.allocationCount = 0;
        this.deallocationCount = 0;
        
        // Memory pools for different sizes
        this.pools = new Map();
        this.poolSizes = [16, 32, 64, 128, 256, 512, 1024, 2048, 4096];
        
        // Track allocations
        this.allocations = new Map();
        
        // Performance tracking
        this.performance = {
            allocationTime: 0,
            deallocationTime: 0,
            fragmentation: 0
        };
    }
    
    /**
     * Initialize the memory manager
     */
    async initialize() {
        try {
            // Initialize memory pools
            this.initializeMemoryPools();
            
            this.isInitialized = true;
            console.log('MemoryManager initialized');
            
            return true;
        } catch (error) {
            console.error('Failed to initialize MemoryManager:', error);
            return false;
        }
    }
    
    /**
     * Initialize memory pools
     */
    initializeMemoryPools() {
        for (const size of this.poolSizes) {
            this.pools.set(size, {
                blocks: [],
                freeBlocks: [],
                totalBlocks: 0,
                usedBlocks: 0
            });
        }
    }
    
    /**
     * Allocate memory
     */
    allocate(size, alignment = 8, tag = 'unknown') {
        if (!this.isInitialized) {
            throw new Error('MemoryManager not initialized');
        }
        
        const startTime = performance.now();
        
        try {
            // Find appropriate pool size
            const poolSize = this.findPoolSize(size);
            
            let ptr;
            if (poolSize && size <= poolSize) {
                ptr = this.allocateFromPool(poolSize);
            } else {
                ptr = this.allocateFromHeap(size);
            }
            
            if (!ptr) {
                throw new Error('Memory allocation failed');
            }
            
            // Track allocation
            this.trackAllocation(ptr, size, tag);
            
            // Update statistics
            this.updateAllocationStats(size);
            
            const endTime = performance.now();
            this.performance.allocationTime += endTime - startTime;
            
            return ptr;
        } catch (error) {
            console.error('Memory allocation error:', error);
            throw error;
        }
    }
    
    /**
     * Deallocate memory
     */
    deallocate(ptr, tag = 'unknown') {
        if (!this.isInitialized || !ptr) {
            return;
        }
        
        const startTime = performance.now();
        
        try {
            // Get allocation info
            const allocation = this.allocations.get(ptr);
            if (!allocation) {
                console.warn('Attempting to deallocate untracked pointer');
                return;
            }
            
            // Deallocate from appropriate pool or heap
            const poolSize = this.findPoolSize(allocation.size);
            if (poolSize && allocation.size <= poolSize) {
                this.deallocateFromPool(ptr, poolSize);
            } else {
                this.deallocateFromHeap(ptr);
            }
            
            // Remove from tracking
            this.untrackAllocation(ptr);
            
            // Update statistics
            this.updateDeallocationStats(allocation.size);
            
            const endTime = performance.now();
            this.performance.deallocationTime += endTime - startTime;
            
        } catch (error) {
            console.error('Memory deallocation error:', error);
        }
    }
    
    /**
     * Find appropriate pool size
     */
    findPoolSize(size) {
        for (const poolSize of this.poolSizes) {
            if (size <= poolSize) {
                return poolSize;
            }
        }
        return null;
    }
    
    /**
     * Allocate from memory pool
     */
    allocateFromPool(poolSize) {
        const pool = this.pools.get(poolSize);
        
        // Try to get from free blocks first
        if (pool.freeBlocks.length > 0) {
            const block = pool.freeBlocks.pop();
            pool.usedBlocks++;
            return block;
        }
        
        // Allocate new block
        const block = new ArrayBuffer(poolSize);
        pool.blocks.push(block);
        pool.totalBlocks++;
        pool.usedBlocks++;
        
        return block;
    }
    
    /**
     * Deallocate from memory pool
     */
    deallocateFromPool(ptr, poolSize) {
        const pool = this.pools.get(poolSize);
        
        // Return to free blocks
        pool.freeBlocks.push(ptr);
        pool.usedBlocks--;
    }
    
    /**
     * Allocate from heap
     */
    allocateFromHeap(size) {
        return new ArrayBuffer(size);
    }
    
    /**
     * Deallocate from heap
     */
    deallocateFromHeap(ptr) {
        // In JavaScript, garbage collection handles heap deallocation
        ptr = null;
    }
    
    /**
     * Track allocation
     */
    trackAllocation(ptr, size, tag) {
        const allocation = {
            ptr: ptr,
            size: size,
            tag: tag,
            timestamp: performance.now()
        };
        
        this.allocations.set(ptr, allocation);
    }
    
    /**
     * Untrack allocation
     */
    untrackAllocation(ptr) {
        this.allocations.delete(ptr);
    }
    
    /**
     * Update allocation statistics
     */
    updateAllocationStats(size) {
        this.totalAllocated += size;
        this.currentUsage += size;
        this.allocationCount++;
        
        if (this.currentUsage > this.peakUsage) {
            this.peakUsage = this.currentUsage;
        }
    }
    
    /**
     * Update deallocation statistics
     */
    updateDeallocationStats(size) {
        this.totalFreed += size;
        this.currentUsage -= size;
        this.deallocationCount++;
    }
    
    /**
     * Get memory statistics
     */
    getStats() {
        return {
            totalAllocated: this.totalAllocated,
            totalFreed: this.totalFreed,
            peakUsage: this.peakUsage,
            currentUsage: this.currentUsage,
            allocationCount: this.allocationCount,
            deallocationCount: this.deallocationCount,
            fragmentation: this.performance.fragmentation,
            poolStats: this.getPoolStats(),
            performance: { ...this.performance }
        };
    }
    
    /**
     * Get pool statistics
     */
    getPoolStats() {
        const stats = {};
        
        for (const [size, pool] of this.pools) {
            stats[size] = {
                totalBlocks: pool.totalBlocks,
                usedBlocks: pool.usedBlocks,
                freeBlocks: pool.freeBlocks.length,
                utilization: pool.totalBlocks > 0 ? pool.usedBlocks / pool.totalBlocks : 0
            };
        }
        
        return stats;
    }
    
    /**
     * Reset statistics
     */
    resetStats() {
        this.totalAllocated = 0;
        this.totalFreed = 0;
        this.peakUsage = 0;
        this.currentUsage = 0;
        this.allocationCount = 0;
        this.deallocationCount = 0;
        
        this.performance.allocationTime = 0;
        this.performance.deallocationTime = 0;
        this.performance.fragmentation = 0;
    }
    
    /**
     * Format bytes to human readable format
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    /**
     * Shutdown the memory manager
     */
    async shutdown() {
        console.log('Shutting down MemoryManager...');
        
        // Clear all allocations
        this.allocations.clear();
        
        // Clear pools
        this.pools.clear();
        
        // Reset statistics
        this.resetStats();
        
        this.isInitialized = false;
        console.log('MemoryManager shutdown completed');
    }
}

// Global memory manager instance
window.MemoryManager = MemoryManager;