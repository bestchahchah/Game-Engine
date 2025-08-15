/**
 * Logger
 * Handles logging, debugging, and error reporting
 */

class Logger {
    constructor() {
        this.isInitialized = false;
        this.logLevel = Logger.Level.INFO;
        this.maxLogEntries = 1000;
        this.logEntries = [];
        this.outputFile = null;
        this.enableConsole = true;
        this.enableFile = false;
        this.enableRemote = false;
        this.remoteEndpoint = null;
        
        // Performance tracking
        this.performance = {
            logCount: 0,
            errorCount: 0,
            warningCount: 0,
            infoCount: 0,
            debugCount: 0,
            traceCount: 0
        };
        
        // Log formatting
        this.timestampFormat = 'ISO';
        this.includeTimestamp = true;
        this.includeLevel = true;
        this.includeSource = true;
        this.includeThread = false;
        
        // Callbacks
        this.onLog = null;
        this.onError = null;
        this.onWarning = null;
    }
    
    /**
     * Initialize the logger
     */
    async initialize(config = {}) {
        try {
            this.logLevel = config.logLevel || Logger.Level.INFO;
            this.maxLogEntries = config.maxLogEntries || 1000;
            this.enableConsole = config.enableConsole !== false;
            this.enableFile = config.enableFile || false;
            this.enableRemote = config.enableRemote || false;
            this.remoteEndpoint = config.remoteEndpoint || null;
            
            if (config.outputFile) {
                this.setOutputFile(config.outputFile);
            }
            
            this.isInitialized = true;
            this.info('Logger initialized successfully');
            
            return true;
        } catch (error) {
            console.error('Failed to initialize Logger:', error);
            return false;
        }
    }
    
    /**
     * Set log level
     */
    setLevel(level) {
        if (Logger.Level[level] !== undefined) {
            this.logLevel = level;
            this.info(`Log level set to: ${level}`);
        } else {
            this.warning(`Invalid log level: ${level}`);
        }
    }
    
    /**
     * Set output file
     */
    setOutputFile(filename) {
        this.outputFile = filename;
        this.enableFile = true;
        this.info(`Log output file set to: ${filename}`);
    }
    
    /**
     * Log a message
     */
    log(level, message, source = null, data = null) {
        if (!this.isInitialized) {
            console.log(`[${level}] ${message}`);
            return;
        }
        
        if (Logger.Level[level] < Logger.Level[this.logLevel]) {
            return;
        }
        
        const timestamp = this.getTimestamp();
        const logEntry = {
            timestamp: timestamp,
            level: level,
            message: message,
            source: source,
            data: data,
            thread: this.getThreadInfo()
        };
        
        // Add to log entries
        this.logEntries.push(logEntry);
        
        // Limit log entries
        if (this.logEntries.length > this.maxLogEntries) {
            this.logEntries.shift();
        }
        
        // Update performance counters
        this.updatePerformanceCounters(level);
        
        // Format and output
        const formattedMessage = this.formatMessage(logEntry);
        
        // Console output
        if (this.enableConsole) {
            this.outputToConsole(level, formattedMessage);
        }
        
        // File output
        if (this.enableFile) {
            this.outputToFile(formattedMessage);
        }
        
        // Remote output
        if (this.enableRemote && this.remoteEndpoint) {
            this.outputToRemote(logEntry);
        }
        
        // Callbacks
        if (this.onLog) {
            this.onLog(logEntry);
        }
        
        if (level === Logger.Level.ERROR && this.onError) {
            this.onError(logEntry);
        }
        
        if (level === Logger.Level.WARNING && this.onWarning) {
            this.onWarning(logEntry);
        }
    }
    
    /**
     * Log trace message
     */
    trace(message, source = null, data = null) {
        this.log(Logger.Level.TRACE, message, source, data);
    }
    
    /**
     * Log debug message
     */
    debug(message, source = null, data = null) {
        this.log(Logger.Level.DEBUG, message, source, data);
    }
    
    /**
     * Log info message
     */
    info(message, source = null, data = null) {
        this.log(Logger.Level.INFO, message, source, data);
    }
    
    /**
     * Log warning message
     */
    warning(message, source = null, data = null) {
        this.log(Logger.Level.WARNING, message, source, data);
    }
    
    /**
     * Log error message
     */
    error(message, source = null, data = null) {
        this.log(Logger.Level.ERROR, message, source, data);
    }
    
    /**
     * Log fatal message
     */
    fatal(message, source = null, data = null) {
        this.log(Logger.Level.FATAL, message, source, data);
    }
    
    /**
     * Format message with template
     */
    formatMessage(logEntry) {
        let formatted = '';
        
        if (this.includeTimestamp) {
            formatted += `[${logEntry.timestamp}] `;
        }
        
        if (this.includeLevel) {
            formatted += `[${logEntry.level}] `;
        }
        
        if (this.includeSource && logEntry.source) {
            formatted += `[${logEntry.source}] `;
        }
        
        if (this.includeThread && logEntry.thread) {
            formatted += `[${logEntry.thread}] `;
        }
        
        formatted += logEntry.message;
        
        if (logEntry.data) {
            formatted += ` | Data: ${JSON.stringify(logEntry.data)}`;
        }
        
        return formatted;
    }
    
    /**
     * Get timestamp
     */
    getTimestamp() {
        const now = new Date();
        
        switch (this.timestampFormat) {
            case 'ISO':
                return now.toISOString();
            case 'LOCAL':
                return now.toLocaleString();
            case 'UNIX':
                return Math.floor(now.getTime() / 1000);
            default:
                return now.toISOString();
        }
    }
    
    /**
     * Get thread info
     */
    getThreadInfo() {
        // In web environment, we don't have real threads
        // But we can track async operations
        return 'main';
    }
    
    /**
     * Update performance counters
     */
    updatePerformanceCounters(level) {
        this.performance.logCount++;
        
        switch (level) {
            case Logger.Level.TRACE:
                this.performance.traceCount++;
                break;
            case Logger.Level.DEBUG:
                this.performance.debugCount++;
                break;
            case Logger.Level.INFO:
                this.performance.infoCount++;
                break;
            case Logger.Level.WARNING:
                this.performance.warningCount++;
                break;
            case Logger.Level.ERROR:
                this.performance.errorCount++;
                break;
            case Logger.Level.FATAL:
                this.performance.errorCount++;
                break;
        }
    }
    
    /**
     * Output to console
     */
    outputToConsole(level, message) {
        const colors = {
            [Logger.Level.TRACE]: '#888888',
            [Logger.Level.DEBUG]: '#2196F3',
            [Logger.Level.INFO]: '#4CAF50',
            [Logger.Level.WARNING]: '#FF9800',
            [Logger.Level.ERROR]: '#F44336',
            [Logger.Level.FATAL]: '#9C27B0'
        };
        
        const color = colors[level] || '#FFFFFF';
        
        switch (level) {
            case Logger.Level.TRACE:
            case Logger.Level.DEBUG:
                console.debug(`%c${message}`, `color: ${color}`);
                break;
            case Logger.Level.INFO:
                console.info(`%c${message}`, `color: ${color}`);
                break;
            case Logger.Level.WARNING:
                console.warn(`%c${message}`, `color: ${color}`);
                break;
            case Logger.Level.ERROR:
            case Logger.Level.FATAL:
                console.error(`%c${message}`, `color: ${color}`);
                break;
            default:
                console.log(`%c${message}`, `color: ${color}`);
        }
    }
    
    /**
     * Output to file
     */
    outputToFile(message) {
        // In web environment, we can't directly write to files
        // But we can use the File System Access API if available
        if ('showSaveFilePicker' in window) {
            // Implementation for file writing would go here
        }
    }
    
    /**
     * Output to remote endpoint
     */
    async outputToRemote(logEntry) {
        try {
            await fetch(this.remoteEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(logEntry)
            });
        } catch (error) {
            console.error('Failed to send log to remote endpoint:', error);
        }
    }
    
    /**
     * Get log entries
     */
    getLogEntries(level = null, source = null, limit = null) {
        let entries = this.logEntries;
        
        if (level) {
            entries = entries.filter(entry => entry.level === level);
        }
        
        if (source) {
            entries = entries.filter(entry => entry.source === source);
        }
        
        if (limit) {
            entries = entries.slice(-limit);
        }
        
        return entries;
    }
    
    /**
     * Get performance statistics
     */
    getPerformanceStats() {
        return { ...this.performance };
    }
    
    /**
     * Clear log entries
     */
    clear() {
        this.logEntries = [];
        this.resetPerformanceCounters();
        this.info('Log entries cleared');
    }
    
    /**
     * Reset performance counters
     */
    resetPerformanceCounters() {
        this.performance = {
            logCount: 0,
            errorCount: 0,
            warningCount: 0,
            infoCount: 0,
            debugCount: 0,
            traceCount: 0
        };
    }
    
    /**
     * Export log entries
     */
    export(format = 'json') {
        switch (format.toLowerCase()) {
            case 'json':
                return JSON.stringify(this.logEntries, null, 2);
            case 'csv':
                return this.exportToCSV();
            case 'text':
                return this.exportToText();
            default:
                return JSON.stringify(this.logEntries, null, 2);
        }
    }
    
    /**
     * Export to CSV
     */
    exportToCSV() {
        const headers = ['Timestamp', 'Level', 'Message', 'Source', 'Thread'];
        const rows = this.logEntries.map(entry => [
            entry.timestamp,
            entry.level,
            entry.message,
            entry.source || '',
            entry.thread || ''
        ]);
        
        return [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');
    }
    
    /**
     * Export to text
     */
    exportToText() {
        return this.logEntries
            .map(entry => this.formatMessage(entry))
            .join('\n');
    }
    
    /**
     * Set callback for log events
     */
    setLogCallback(callback) {
        this.onLog = callback;
    }
    
    /**
     * Set callback for error events
     */
    setErrorCallback(callback) {
        this.onError = callback;
    }
    
    /**
     * Set callback for warning events
     */
    setWarningCallback(callback) {
        this.onWarning = callback;
    }
    
    /**
     * Shutdown the logger
     */
    async shutdown() {
        this.info('Logger shutting down...');
        
        // Flush any pending logs
        if (this.enableFile) {
            // Implementation for flushing file logs
        }
        
        if (this.enableRemote) {
            // Implementation for flushing remote logs
        }
        
        this.isInitialized = false;
        console.log('Logger shutdown completed');
    }
}

// Log levels
Logger.Level = {
    TRACE: 0,
    DEBUG: 1,
    INFO: 2,
    WARNING: 3,
    ERROR: 4,
    FATAL: 5
};

// Global logger instance
window.Logger = Logger;