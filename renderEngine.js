// Render Engine - Intelligent Rendering with Dirty Checking
// Only re-renders UI elements when their data actually changes

(() => {
  class RenderEngine {
    constructor() {
      this.dirtyFlags = new Set();
      this.renderQueue = new Map();
      this.lastRenderTime = 0;
      this.renderInterval = 16; // ~60fps max
      this.isRendering = false;
      this.frameId = null;
      
      // Performance tracking
      this.renderCount = 0;
      this.skippedRenders = 0;
      
      // Use consistent 60 FPS on all devices for smooth rendering
      this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                      ('ontouchstart' in window) || 
                      (navigator.maxTouchPoints > 0);
      
      // Keep 60 FPS on all devices
      this.renderInterval = 16; // ~60fps on all devices
      
      this.start();
    }
    
    start() {
      this.isRendering = true;
      this.render();
    }
    
    stop() {
      this.isRendering = false;
      if (this.frameId) {
        cancelAnimationFrame(this.frameId);
        this.frameId = null;
      }
    }
    
    render() {
      if (!this.isRendering) return;
      
      const now = performance.now();
      
      // Only render if enough time has passed
      if (now - this.lastRenderTime >= this.renderInterval) {
        this.processRenderQueue();
        this.lastRenderTime = now;
        this.renderCount++;
      } else {
        this.skippedRenders++;
      }
      
      this.frameId = requestAnimationFrame(() => this.render());
    }
    
    processRenderQueue() {
      // Process all dirty elements
      for (const elementId of this.dirtyFlags) {
        const renderFunction = this.renderQueue.get(elementId);
        if (renderFunction) {
          try {
            renderFunction();
          } catch (error) {
            console.error(`Error rendering ${elementId}:`, error);
          }
        }
      }
      
      // Clear dirty flags
      this.dirtyFlags.clear();
    }
    
    // Mark an element as needing re-render
    markDirty(elementId) {
      this.dirtyFlags.add(elementId);
    }
    
    // Register a render function for an element
    registerRenderer(elementId, renderFunction) {
      this.renderQueue.set(elementId, renderFunction);
    }
    
    // Unregister a render function
    unregisterRenderer(elementId) {
      this.renderQueue.delete(elementId);
      this.dirtyFlags.delete(elementId);
    }
    
    // Force render all elements (use sparingly)
    forceRenderAll() {
      for (const [elementId, renderFunction] of this.renderQueue) {
        try {
          renderFunction();
        } catch (error) {
          console.error(`Error force rendering ${elementId}:`, error);
        }
      }
      this.dirtyFlags.clear();
    }
    
    // Get performance stats
    getPerformanceStats() {
      return {
        renderCount: this.renderCount,
        skippedRenders: this.skippedRenders,
        dirtyElements: this.dirtyFlags.size,
        registeredRenderers: this.renderQueue.size,
        renderEfficiency: this.renderCount / (this.renderCount + this.skippedRenders) * 100
      };
    }
  }
  
  // Expose globally
  window.RenderEngine = RenderEngine;
})();
