/**
 * Event System
 * Handles decoupled communication between engine systems
 */

class EventSystem {
    constructor() {
        this.isInitialized = false;
        this.listeners = new Map();
        this.eventQueue = [];
        this.maxQueueSize = 1000;
        this.processingEvents = false;
        this.eventHistory = [];
        this.maxHistorySize = 100;
        
        // Performance tracking
        this.performance = {
            eventsProcessed: 0,
            eventsQueued: 0,
            eventsDropped: 0,
            averageProcessingTime: 0
        };
        
        // Event types
        this.eventTypes = new Set();
        
        // Callbacks
        this.onEventProcessed = null;
        this.onEventDropped = null;
    }
    
    /**
     * Initialize the event system
     */
    async initialize(config = {}) {
        try {
            this.maxQueueSize = config.maxQueueSize || 1000;
            this.maxHistorySize = config.maxHistorySize || 100;
            
            this.isInitialized = true;
            console.log('EventSystem initialized');
            
            return true;
        } catch (error) {
            console.error('Failed to initialize EventSystem:', error);
            return false;
        }
    }
    
    /**
     * Subscribe to an event type
     */
    subscribe(eventType, callback, priority = 0) {
        if (!this.isInitialized) {
            console.warn('EventSystem not initialized');
            return false;
        }
        
        if (!eventType || typeof callback !== 'function') {
            console.error('Invalid event type or callback');
            return false;
        }
        
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, []);
            this.eventTypes.add(eventType);
        }
        
        const listener = {
            callback: callback,
            priority: priority,
            id: this.generateListenerId()
        };
        
        const listeners = this.listeners.get(eventType);
        listeners.push(listener);
        
        // Sort by priority (higher priority first)
        listeners.sort((a, b) => b.priority - a.priority);
        
        console.log(`Subscribed to event: ${eventType}`);
        return listener.id;
    }
    
    /**
     * Unsubscribe from an event type
     */
    unsubscribe(eventType, callbackOrId) {
        if (!this.listeners.has(eventType)) {
            return false;
        }
        
        const listeners = this.listeners.get(eventType);
        let removed = false;
        
        if (typeof callbackOrId === 'function') {
            // Remove by callback function
            const index = listeners.findIndex(listener => listener.callback === callbackOrId);
            if (index !== -1) {
                listeners.splice(index, 1);
                removed = true;
            }
        } else {
            // Remove by listener ID
            const index = listeners.findIndex(listener => listener.id === callbackOrId);
            if (index !== -1) {
                listeners.splice(index, 1);
                removed = true;
            }
        }
        
        if (removed) {
            console.log(`Unsubscribed from event: ${eventType}`);
        }
        
        return removed;
    }
    
    /**
     * Publish an event
     */
    publish(eventType, data = null, immediate = false) {
        if (!this.isInitialized) {
            console.warn('EventSystem not initialized');
            return false;
        }
        
        if (!eventType) {
            console.error('Invalid event type');
            return false;
        }
        
        const event = {
            type: eventType,
            data: data,
            timestamp: performance.now(),
            id: this.generateEventId()
        };
        
        if (immediate) {
            this.processEvent(event);
        } else {
            this.queueEvent(event);
        }
        
        return event.id;
    }
    
    /**
     * Queue an event for processing
     */
    queueEvent(event) {
        if (this.eventQueue.length >= this.maxQueueSize) {
            this.performance.eventsDropped++;
            console.warn('Event queue full, dropping event:', event.type);
            
            if (this.onEventDropped) {
                this.onEventDropped(event);
            }
            
            return false;
        }
        
        this.eventQueue.push(event);
        this.performance.eventsQueued++;
        
        return true;
    }
    
    /**
     * Process all queued events
     */
    processEvents() {
        if (this.processingEvents || this.eventQueue.length === 0) {
            return;
        }
        
        this.processingEvents = true;
        
        const startTime = performance.now();
        let processedCount = 0;
        
        while (this.eventQueue.length > 0) {
            const event = this.eventQueue.shift();
            this.processEvent(event);
            processedCount++;
        }
        
        const endTime = performance.now();
        const processingTime = endTime - startTime;
        
        // Update performance statistics
        this.performance.eventsProcessed += processedCount;
        this.performance.averageProcessingTime = 
            (this.performance.averageProcessingTime + processingTime) / 2;
        
        this.processingEvents = false;
    }
    
    /**
     * Process a single event
     */
    processEvent(event) {
        if (!this.listeners.has(event.type)) {
            return;
        }
        
        const listeners = this.listeners.get(event.type);
        const results = [];
        
        for (const listener of listeners) {
            try {
                const result = listener.callback(event.data, event);
                if (result !== undefined) {
                    results.push(result);
                }
            } catch (error) {
                console.error(`Error in event listener for ${event.type}:`, error);
            }
        }
        
        // Add to history
        this.addToHistory(event);
        
        if (this.onEventProcessed) {
            this.onEventProcessed(event, results);
        }
        
        return results;
    }
    
    /**
     * Add event to history
     */
    addToHistory(event) {
        this.eventHistory.push(event);
        
        if (this.eventHistory.length > this.maxHistorySize) {
            this.eventHistory.shift();
        }
    }
    
    /**
     * Get event history
     */
    getEventHistory(eventType = null, limit = null) {
        let history = this.eventHistory;
        
        if (eventType) {
            history = history.filter(event => event.type === eventType);
        }
        
        if (limit) {
            history = history.slice(-limit);
        }
        
        return history;
    }
    
    /**
     * Clear event history
     */
    clearHistory() {
        this.eventHistory = [];
        console.log('Event history cleared');
    }
    
    /**
     * Get all event types
     */
    getEventTypes() {
        return Array.from(this.eventTypes);
    }
    
    /**
     * Get listeners for an event type
     */
    getListeners(eventType) {
        if (!this.listeners.has(eventType)) {
            return [];
        }
        
        return [...this.listeners.get(eventType)];
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
            eventsProcessed: 0,
            eventsQueued: 0,
            eventsDropped: 0,
            averageProcessingTime: 0
        };
    }
    
    /**
     * Generate unique listener ID
     */
    generateListenerId() {
        return `listener_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * Generate unique event ID
     */
    generateEventId() {
        return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * Set callback for processed events
     */
    setProcessedCallback(callback) {
        this.onEventProcessed = callback;
    }
    
    /**
     * Set callback for dropped events
     */
    setDroppedCallback(callback) {
        this.onEventDropped = callback;
    }
    
    /**
     * Wait for an event
     */
    async waitForEvent(eventType, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                this.unsubscribe(eventType, listenerId);
                reject(new Error(`Timeout waiting for event: ${eventType}`));
            }, timeout);
            
            const listenerId = this.subscribe(eventType, (data, event) => {
                clearTimeout(timeoutId);
                this.unsubscribe(eventType, listenerId);
                resolve({ data, event });
            });
        });
    }
    
    /**
     * Wait for multiple events
     */
    async waitForEvents(eventTypes, timeout = 5000) {
        const promises = eventTypes.map(eventType => this.waitForEvent(eventType, timeout));
        return Promise.all(promises);
    }
    
    /**
     * Wait for any of multiple events
     */
    async waitForAnyEvent(eventTypes, timeout = 5000) {
        return Promise.race(
            eventTypes.map(eventType => this.waitForEvent(eventType, timeout))
        );
    }
    
    /**
     * Create a one-time listener
     */
    once(eventType, callback) {
        const wrappedCallback = (data, event) => {
            this.unsubscribe(eventType, listenerId);
            callback(data, event);
        };
        
        const listenerId = this.subscribe(eventType, wrappedCallback);
        return listenerId;
    }
    
    /**
     * Remove all listeners for an event type
     */
    removeAllListeners(eventType) {
        if (this.listeners.has(eventType)) {
            this.listeners.delete(eventType);
            this.eventTypes.delete(eventType);
            console.log(`Removed all listeners for event: ${eventType}`);
        }
    }
    
    /**
     * Remove all listeners
     */
    removeAllListeners() {
        this.listeners.clear();
        this.eventTypes.clear();
        console.log('Removed all event listeners');
    }
    
    /**
     * Get queue status
     */
    getQueueStatus() {
        return {
            queueLength: this.eventQueue.length,
            maxQueueSize: this.maxQueueSize,
            processingEvents: this.processingEvents,
            historyLength: this.eventHistory.length,
            maxHistorySize: this.maxHistorySize
        };
    }
    
    /**
     * Clear event queue
     */
    clearQueue() {
        this.eventQueue = [];
        console.log('Event queue cleared');
    }
    
    /**
     * Update the event system (called by engine)
     */
    update(deltaTime) {
        this.processEvents();
    }
    
    /**
     * Shutdown the event system
     */
    async shutdown() {
        console.log('EventSystem shutting down...');
        
        // Process remaining events
        this.processEvents();
        
        // Clear all data
        this.listeners.clear();
        this.eventTypes.clear();
        this.eventQueue = [];
        this.eventHistory = [];
        
        this.isInitialized = false;
        console.log('EventSystem shutdown completed');
    }
}

// Global event system instance
window.EventSystem = EventSystem;