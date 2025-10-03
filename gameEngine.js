// Game Engine - Event-Driven Architecture
// Replaces polling-based intervals with event-driven updates

(() => {
  // Event-driven game engine
  class GameEngine {
    constructor() {
      this.eventQueue = [];
      this.scheduledEvents = new Map();
      this.isProcessing = false;
      this.lastProcessTime = 0;
      this.frameId = null;
      
      // Performance monitoring
      this.frameCount = 0;
      this.lastFpsTime = 0;
      this.currentFps = 0;
      
      // Mobile detection
      this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                      ('ontouchstart' in window) || 
                      (navigator.maxTouchPoints > 0);
      
      // Use consistent 60 FPS on all devices for smooth particles
      this.targetFPS = 60;
      this.frameInterval = 1000 / this.targetFPS;
      
      this.start();
    }
    
    start() {
      this.isProcessing = true;
      this.lastProcessTime = performance.now();
      this.processFrame();
    }
    
    stop() {
      this.isProcessing = false;
      if (this.frameId) {
        cancelAnimationFrame(this.frameId);
        this.frameId = null;
      }
    }
    
    processFrame() {
      if (!this.isProcessing) return;
      
      const now = performance.now();
      const deltaTime = now - this.lastProcessTime;
      
      // Only process if enough time has passed (adaptive frame rate)
      if (deltaTime >= this.frameInterval) {
        this.processEvents(deltaTime);
        this.updateFPS(now);
        this.lastProcessTime = now;
      }
      
      this.frameId = requestAnimationFrame(() => this.processFrame());
    }
    
    processEvents(deltaTime) {
      // Process scheduled events
      const currentTime = performance.now();
      const eventsToProcess = [];
      
      for (const [eventId, event] of this.scheduledEvents) {
        if (currentTime >= event.scheduledTime) {
          eventsToProcess.push(event);
          this.scheduledEvents.delete(eventId);
        }
      }
      
      // Process events
      eventsToProcess.forEach(event => {
        try {
          event.callback(deltaTime);
        } catch (error) {
          console.error('Error processing event:', error);
        }
      });
      
      // Process immediate events
      while (this.eventQueue.length > 0) {
        const event = this.eventQueue.shift();
        try {
          event.callback(deltaTime);
        } catch (error) {
          console.error('Error processing immediate event:', error);
        }
      }
    }
    
    updateFPS(now) {
      this.frameCount++;
      if (now - this.lastFpsTime >= 1000) {
        this.currentFps = this.frameCount;
        this.frameCount = 0;
        this.lastFpsTime = now;
        
        // Adaptive performance: reduce frame rate if struggling (disabled for consistent particle performance)
        // if (this.currentFps < this.targetFPS * 0.8) {
        //   this.targetFPS = Math.max(15, this.targetFPS - 5);
        //   this.frameInterval = 1000 / this.targetFPS;
        // } else if (this.currentFps > this.targetFPS * 1.2) {
        //   this.targetFPS = Math.min(60, this.targetFPS + 5); // Cap at 60 FPS on all devices
        //   this.frameInterval = 1000 / this.targetFPS;
        // }
      }
    }
    
    // Schedule an event to run at a specific time
    scheduleEvent(eventId, callback, delayMs) {
      this.scheduledEvents.set(eventId, {
        callback,
        scheduledTime: performance.now() + delayMs
      });
    }
    
    // Schedule a recurring event
    scheduleRecurringEvent(eventId, callback, intervalMs) {
      const recurringCallback = (deltaTime) => {
        callback(deltaTime);
        // Reschedule for next interval
        this.scheduleEvent(eventId, recurringCallback, intervalMs);
      };
      this.scheduleEvent(eventId, recurringCallback, intervalMs);
    }
    
    // Add an immediate event to the queue
    queueEvent(callback) {
      this.eventQueue.push({ callback });
    }
    
    // Cancel a scheduled event
    cancelEvent(eventId) {
      this.scheduledEvents.delete(eventId);
    }
    
    // Get performance stats
    getPerformanceStats() {
      return {
        fps: this.currentFps,
        targetFps: this.targetFPS,
        scheduledEvents: this.scheduledEvents.size,
        queuedEvents: this.eventQueue.length
      };
    }
  }
  
  // Expose globally
  window.GameEngine = GameEngine;
})();
