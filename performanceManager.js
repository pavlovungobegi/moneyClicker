// Performance Manager - Coordinates all performance optimizations
// Implements requestIdleCallback, lazy loading, and intelligent caching

(() => {
  class PerformanceManager {
    constructor() {
      this.gameEngine = null;
      this.renderEngine = null;
      this.calculationWorker = null;
      this.cache = new Map();
      this.cacheTimestamps = new Map();
      this.cacheExpiry = 30000; // 30 seconds default
      
      // Performance monitoring
      this.performanceMetrics = {
        frameDrops: 0,
        longTasks: 0,
        memoryUsage: 0,
        cpuUsage: 0
      };
      
      // Mobile detection
      this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                      ('ontouchstart' in window) || 
                      (navigator.maxTouchPoints > 0);
      
      // Adaptive performance settings
      this.performanceLevel = this.isMobile ? 'low' : 'high';
      this.adaptiveSettings = this.getAdaptiveSettings();
      
      this.initialize();
    }
    
    initialize() {
      // Initialize Web Worker if supported
      if (typeof Worker !== 'undefined') {
        try {
          this.calculationWorker = new Worker('calculationWorker.js');
          this.calculationWorker.onmessage = this.handleWorkerMessage.bind(this);
          this.calculationWorker.onerror = this.handleWorkerError.bind(this);
        } catch (error) {
          console.warn('Web Worker not supported, falling back to main thread calculations');
        }
      }
      
      // Initialize performance monitoring
      this.startPerformanceMonitoring();
      
      // Initialize requestIdleCallback polyfill
      this.initializeIdleCallback();
    }
    
    getAdaptiveSettings() {
      const settings = {
        low: {
          maxFPS: 30,
          renderInterval: 33,
          cacheExpiry: 60000,
          workerEnabled: false,
          lazyLoading: true,
          virtualization: true
        },
        medium: {
          maxFPS: 45,
          renderInterval: 22,
          cacheExpiry: 30000,
          workerEnabled: true,
          lazyLoading: true,
          virtualization: false
        },
        high: {
          maxFPS: 60,
          renderInterval: 16,
          cacheExpiry: 15000,
          workerEnabled: true,
          lazyLoading: false,
          virtualization: false
        }
      };
      
      return settings[this.performanceLevel];
    }
    
    // Adaptive performance adjustment
    adjustPerformanceLevel() {
      const metrics = this.getPerformanceMetrics();
      
      if (metrics.frameDrops > 10 || metrics.longTasks > 5) {
        // Performance is poor, reduce quality
        if (this.performanceLevel === 'high') {
          this.performanceLevel = 'medium';
        } else if (this.performanceLevel === 'medium') {
          this.performanceLevel = 'low';
        }
      } else if (metrics.frameDrops < 2 && metrics.longTasks < 2) {
        // Performance is good, can increase quality
        if (this.performanceLevel === 'low') {
          this.performanceLevel = 'medium';
        } else if (this.performanceLevel === 'medium') {
          this.performanceLevel = 'high';
        }
      }
      
      this.adaptiveSettings = this.getAdaptiveSettings();
      this.applyAdaptiveSettings();
    }
    
    applyAdaptiveSettings() {
      if (this.gameEngine) {
        this.gameEngine.targetFPS = this.adaptiveSettings.maxFPS;
        this.gameEngine.frameInterval = 1000 / this.adaptiveSettings.maxFPS;
      }
      
      if (this.renderEngine) {
        this.renderEngine.renderInterval = this.adaptiveSettings.renderInterval;
      }
      
      this.cacheExpiry = this.adaptiveSettings.cacheExpiry;
    }
    
    // Intelligent caching with invalidation
    cache(key, value, expiry = null) {
      const expiryTime = expiry || this.cacheExpiry;
      this.cache.set(key, value);
      this.cacheTimestamps.set(key, Date.now() + expiryTime);
    }
    
    getCache(key) {
      const expiry = this.cacheTimestamps.get(key);
      if (expiry && Date.now() > expiry) {
        this.cache.delete(key);
        this.cacheTimestamps.delete(key);
        return null;
      }
      return this.cache.get(key);
    }
    
    invalidateCache(pattern = null) {
      if (pattern) {
        // Invalidate specific pattern
        for (const key of this.cache.keys()) {
          if (key.includes(pattern)) {
            this.cache.delete(key);
            this.cacheTimestamps.delete(key);
          }
        }
      } else {
        // Invalidate all cache
        this.cache.clear();
        this.cacheTimestamps.clear();
      }
    }
    
    // Lazy loading for UI elements
    lazyLoad(elementId, loadFunction, threshold = 0.1) {
      if (!this.adaptiveSettings.lazyLoading) {
        loadFunction();
        return;
      }
      
      const element = document.getElementById(elementId);
      if (!element) return;
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            loadFunction();
            observer.unobserve(entry.target);
          }
        });
      }, { threshold });
      
      observer.observe(element);
    }
    
    // Virtualization for large lists
    virtualizeList(containerId, items, renderItem, itemHeight = 50) {
      if (!this.adaptiveSettings.virtualization) {
        // Render all items
        const container = document.getElementById(containerId);
        if (container) {
          container.innerHTML = items.map(renderItem).join('');
        }
        return;
      }
      
      const container = document.getElementById(containerId);
      if (!container) return;
      
      const containerHeight = container.clientHeight;
      const visibleItems = Math.ceil(containerHeight / itemHeight) + 2; // Buffer
      const scrollTop = container.scrollTop;
      const startIndex = Math.floor(scrollTop / itemHeight);
      const endIndex = Math.min(startIndex + visibleItems, items.length);
      
      // Render only visible items
      const visibleItemsData = items.slice(startIndex, endIndex);
      container.innerHTML = visibleItemsData.map(renderItem).join('');
      
      // Set scroll offset
      container.style.paddingTop = `${startIndex * itemHeight}px`;
      container.style.paddingBottom = `${(items.length - endIndex) * itemHeight}px`;
    }
    
    // requestIdleCallback implementation
    initializeIdleCallback() {
      if (!window.requestIdleCallback) {
        window.requestIdleCallback = (callback, options = {}) => {
          const timeout = options.timeout || 5000;
          const start = performance.now();
          
          return setTimeout(() => {
            callback({
              didTimeout: false,
              timeRemaining: () => Math.max(0, timeout - (performance.now() - start))
            });
          }, 1);
        };
      }
      
      if (!window.cancelIdleCallback) {
        window.cancelIdleCallback = (id) => clearTimeout(id);
      }
    }
    
    // Execute task during idle time
    runWhenIdle(task, priority = 'normal') {
      return new Promise((resolve) => {
        window.requestIdleCallback((deadline) => {
          if (deadline.timeRemaining() > 0 || deadline.didTimeout) {
            const result = task();
            resolve(result);
          } else {
            // Not enough time, defer to next idle period
            this.runWhenIdle(task, priority).then(resolve);
          }
        }, { timeout: priority === 'high' ? 1000 : 5000 });
      });
    }
    
    // Web Worker communication
    calculateAsync(type, data) {
      return new Promise((resolve, reject) => {
        if (!this.calculationWorker || !this.adaptiveSettings.workerEnabled) {
          // Fallback to main thread
          try {
            const result = this.calculateOnMainThread(type, data);
            resolve(result);
          } catch (error) {
            reject(error);
          }
          return;
        }
        
        const id = Date.now() + Math.random();
        const timeout = setTimeout(() => {
          reject(new Error('Calculation timeout'));
        }, 10000);
        
        const handleMessage = (e) => {
          if (e.data.id === id) {
            clearTimeout(timeout);
            this.calculationWorker.removeEventListener('message', handleMessage);
            
            if (e.data.success) {
              resolve(e.data.result);
            } else {
              reject(new Error(e.data.error));
            }
          }
        };
        
        this.calculationWorker.addEventListener('message', handleMessage);
        this.calculationWorker.postMessage({ type, data, id });
      });
    }
    
    calculateOnMainThread(type, data) {
      // Fallback calculations on main thread
      switch (type) {
        case 'CALCULATE_PROPERTY_INCOME':
          return this.calculatePropertyIncomeSync(data);
        case 'CALCULATE_COMPOUND_INTEREST':
          return this.calculateCompoundInterestSync(data);
        default:
          throw new Error(`Unknown calculation type: ${type}`);
      }
    }
    
    calculatePropertyIncomeSync(data) {
      // Simplified synchronous calculation
      const { prestigeInterestMultiplier = 1 } = data;
      let totalIncome = 0;
      for (const [propertyId, count] of Object.entries(data.properties)) {
        if (count > 0) {
          const propertyConfig = data.propertyConfigs[propertyId];
          if (propertyConfig) {
            let income = count * propertyConfig.incomePerSecond;
            // Apply prestige multiplier to property income
            income *= prestigeInterestMultiplier;
            totalIncome += income;
          }
        }
      }
      return Math.floor(totalIncome);
    }
    
    calculateCompoundInterestSync(data) {
      const { principal, rate, time, frequency = 1 } = data;
      return principal * Math.pow(1 + (rate / frequency), frequency * time);
    }
    
    handleWorkerMessage(e) {
      // Worker message handling is done in calculateAsync
    }
    
    handleWorkerError(error) {
      console.error('Web Worker error:', error);
      this.adaptiveSettings.workerEnabled = false;
    }
    
    // Performance monitoring
    startPerformanceMonitoring() {
      setInterval(() => {
        this.monitorPerformance();
        this.adjustPerformanceLevel();
      }, 5000); // Check every 5 seconds
    }
    
    monitorPerformance() {
      // Monitor frame drops
      if (this.gameEngine) {
        const stats = this.gameEngine.getPerformanceStats();
        if (stats.fps < stats.targetFps * 0.8) {
          this.performanceMetrics.frameDrops++;
        }
      }
      
      // Monitor memory usage
      if (performance.memory) {
        this.performanceMetrics.memoryUsage = performance.memory.usedJSHeapSize;
      }
      
      // Monitor long tasks
      if ('PerformanceObserver' in window) {
        try {
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (entry.duration > 50) { // Tasks longer than 50ms
                this.performanceMetrics.longTasks++;
              }
            }
          });
          observer.observe({ entryTypes: ['longtask'] });
        } catch (error) {
          // PerformanceObserver not supported
        }
      }
    }
    
    getPerformanceMetrics() {
      return { ...this.performanceMetrics };
    }
    
    // Cleanup
    destroy() {
      if (this.calculationWorker) {
        this.calculationWorker.terminate();
      }
      this.cache.clear();
      this.cacheTimestamps.clear();
    }
  }
  
  // Expose globally
  window.PerformanceManager = PerformanceManager;
})();
