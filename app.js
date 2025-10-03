// Global variables for eventTrigger.js access
  let currentAccountBalance = 0;
  let investmentAccountBalance = 0;
let properties = {
  foodStand: 0,
  newsstand: 0,
  parkingGarage: 0,
  convenienceStore: 0,
  apartment: 0,
  manufacturingPlant: 0,
  officeBuilding: 0,
  skyscraper: 0,
  operaHouse: 0
};
let owned = {};
let particleSystem;
let particleEffectsEnabled = true;
let prestigeClickMultiplier = 1;
let prestigeInterestMultiplier = 1;
let prestigeTier = 0;

// Auto-submit functionality
let autoSubmitInterval = null;

// Coin Flip Game Variables
let coinFlipHistory = [];
let isCoinFlipping = false;

(() => {

  // Active tab tracking for performance optimization
  let activeTab = 'earn'; // Default to earn tab
  
  // DOM element caching for performance optimization
  let cachedElements = {};
  
  // Property income caching for performance optimization
  let cachedPropertyIncome = 0;
  let propertyIncomeCacheValid = false;

  // Enhanced caching with performance manager
  function getCachedPropertyIncome() {
    // Check if all properties are 0 - if so, never use cache to ensure 0 income
    const hasAnyProperties = Object.values(properties).some(count => count > 0);
    if (!hasAnyProperties) {
      return null; // Force recalculation when no properties are owned
    }
    
    if (performanceManager && typeof performanceManager.getCache === 'function') {
      try {
        const cacheKey = `propertyIncome_${JSON.stringify(properties)}_${JSON.stringify(owned)}`;
        const cached = performanceManager.getCache(cacheKey);
        if (cached !== null && cached !== undefined && typeof cached === 'number') {
          return cached;
        }
      } catch (error) {
        console.warn('Failed to get cached property income:', error);
      }
    }
    
    // Fallback to old cache system
    if (propertyIncomeCacheValid && typeof cachedPropertyIncome === 'number') {
      return cachedPropertyIncome;
    }
    
    return null;
  }
  
  function setCachedPropertyIncome(income) {
    if (performanceManager && typeof performanceManager.cache === 'function') {
      try {
        const cacheKey = `propertyIncome_${JSON.stringify(properties)}_${JSON.stringify(owned)}`;
        performanceManager.cache(cacheKey, income, 5000); // 5 second cache
      } catch (error) {
        console.warn('Failed to cache property income:', error);
      }
    }
    
    // Update old cache system
    cachedPropertyIncome = income;
    propertyIncomeCacheValid = true;
    //console.log('Updated old cache system, cachedPropertyIncome:', cachedPropertyIncome);
  }

  // Mobile detection for particle optimization
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                   ('ontouchstart' in window) || 
                   (navigator.maxTouchPoints > 0);
  
  // Mobile performance mode detection
  const mobilePerformanceMode = isMobile && GAME_CONFIG.MOBILE_PERFORMANCE.ENABLED;
  
  // Debug log for mobile detection
  console.log('Mobile device detected:', isMobile, 'Performance mode:', mobilePerformanceMode, 'User Agent:', navigator.userAgent);

  // Interval health monitoring
  let lastMainGameTick = Date.now();
  let lastEventCheck = Date.now();
  let lastSave = Date.now();
  
  function checkIntervalHealth() {
    const now = Date.now();
    const mainGameStuck = (now - lastMainGameTick) > (TICK_MS * 3); // 3x expected interval
    const eventsStuck = (now - lastEventCheck) > (getIntervalConfig('EVENTS_CHECK') * 3);
    const saveStuck = (now - lastSave) > (getIntervalConfig('GAME_SAVE') * 3);
    
    if (mainGameStuck || eventsStuck || saveStuck) {
      console.warn('Interval health check failed:', {
        mainGameStuck,
        eventsStuck,
        saveStuck,
        timeSinceMainGame: now - lastMainGameTick,
        timeSinceEvents: now - lastEventCheck,
        timeSinceSave: now - lastSave
        });
      }
    }
    
  // Check interval health every 30 seconds
  setInterval(checkIntervalHealth, 30000);
  
  // Global function to restart intervals if they fail (for debugging)
  window.restartGameIntervals = function() {
    console.log('Restarting game intervals...');
    
    // Clear existing intervals
    if (typeof mainGameInterval !== 'undefined') clearInterval(mainGameInterval);
    if (typeof eventsInterval !== 'undefined') clearInterval(eventsInterval);
    if (typeof saveInterval !== 'undefined') clearInterval(saveInterval);
    
    // Restart main game loop
    const newMainGameInterval = setInterval(() => {
      try {
        lastMainGameTick = Date.now();
        
        // Investment compounding: multiply per tick, boosted by upgrades
        if (investmentAccountBalance > 0) {
          const grown = investmentAccountBalance * getCompoundMultiplierPerTick();
          const growth = grown - investmentAccountBalance;
          investmentAccountBalance = Math.round((investmentAccountBalance + growth) * 100) / 100;
        }

        // Property income
        const propertyIncome = getTotalPropertyIncome();
        if (propertyIncome > 0) {
          if (autoRentEnabled) {
            investmentAccountBalance = Math.round((investmentAccountBalance + propertyIncome) * 100) / 100;
          } else {
            currentAccountBalance = Math.round((currentAccountBalance + propertyIncome) * 100) / 100;
          }
        }

        // Dividends
        tickDividends(TICK_MS);
        renderBalances();
        
        // Only render active tab content for performance
        switch(activeTab) {
          case 'earn':
            renderDividendUI(TICK_MS);
            renderInvestmentUnlocked();
            renderPrestigeMultipliers();
            renderAutoInvestSection();
            renderAutoRentSection();
            renderClickStreak();
            renderRentIncome();
            break;
          case 'upgrades':
            renderUpgradesOwned();
            break;
          case 'portfolio':
            renderAllProperties();
            break;
        }
        
        updateActiveEventDisplay();
        checkExpiredEvents();
        checkStreakTimeout();
        updateUpgradeIndicator();
        updatePortfolioIndicator();
        updateProgressBars();
        checkAchievementsOptimized();
      } catch (error) {
        console.error('Error in restarted main game loop:', error);
      }
    }, TICK_MS);
    
    // Restart events interval
    const newEventsInterval = setInterval(() => {
      try {
        lastEventCheck = Date.now();
        checkEvents();
      } catch (error) {
        console.error('Error in restarted events check:', error);
      }
    }, getIntervalConfig('EVENTS_CHECK'));
    
    // Restart save interval
    const newSaveInterval = setInterval(() => {
      try {
        lastSave = Date.now();
        saveGameState();
      } catch (error) {
        console.error('Error in restarted save interval:', error);
      }
    }, getIntervalConfig('GAME_SAVE'));
    
    // Update global references
    window.mainGameInterval = newMainGameInterval;
    window.eventsInterval = newEventsInterval;
    window.saveInterval = newSaveInterval;
    
    console.log('Game intervals restarted successfully');
  };
  
  // Expose health check function for debugging
  window.checkIntervalHealth = checkIntervalHealth;
  
  // Debug function to check property income
  window.debugPropertyIncome = function() {
    console.log('=== Property Income Debug ===');
    console.log('Properties owned:', properties);
    console.log('PROPERTY_CONFIG available:', !!PROPERTY_CONFIG);
    console.log('Total property income:', getTotalPropertyIncome());
    console.log('Game engine available:', !!gameEngine);
    console.log('Render engine available:', !!renderEngine);
    console.log('Performance manager available:', !!performanceManager);
    console.log('Auto-rent enabled:', autoRentEnabled);
    console.log('Current account balance:', currentAccountBalance);
    console.log('Investment account balance:', investmentAccountBalance);
    
    // Test individual property income calculation
    Object.keys(properties).forEach(propertyId => {
      const count = properties[propertyId];
      if (count > 0) {
        console.log(`Testing ${propertyId}: ${count} owned`);
        const config = PROPERTY_CONFIG[propertyId];
        console.log(`Config for ${propertyId}:`, config);
        if (config) {
          const income = getPropertyTotalIncome(propertyId);
          console.log(`Income for ${propertyId}: ${income}`);
            } else {
          console.log(`No config found for ${propertyId}`);
        }
      }
    });
    console.log('============================');
  };

  // Apply mobile performance mode CSS class
  if (mobilePerformanceMode) {
    document.body.classList.add('mobile-performance-mode');
  }

  // Initialize new performance systems
  let gameEngine, renderEngine, performanceManager;
  
  function initializePerformanceSystems() {
    try {
      // Initialize performance manager first
      performanceManager = new PerformanceManager();
      console.log('Performance manager initialized');
      
      // Initialize game engine
      gameEngine = new GameEngine();
      console.log('Game engine initialized');
      
      // Initialize render engine
      renderEngine = new RenderEngine();
      console.log('Render engine initialized');
      
      console.log('Performance systems initialized successfully');
    } catch (error) {
      console.error('Failed to initialize performance systems:', error);
      // Fallback to original system
      gameEngine = null;
      renderEngine = null;
      performanceManager = null;
    }
  }

  // Function to get appropriate intervals based on mobile performance mode
  function getIntervalConfig(intervalName) {
    if (mobilePerformanceMode && GAME_CONFIG.MOBILE_INTERVALS[intervalName]) {
      return GAME_CONFIG.MOBILE_INTERVALS[intervalName];
    }
    return GAME_CONFIG.INTERVALS[intervalName];
  }

  // Game difficulty system - now using config
  const DIFFICULTY_MODES = GAME_CONFIG.DIFFICULTY_MODES;
  // gameDifficulty moved to eventTrigger.js

  // Particle System - now handled by particles.js
  
  // Initialize particle system - moved to global scope
  
  // Number Animation System
  class NumberAnimator {
    constructor() {
      this.animations = new Map();
      this.animationId = null;
      this.lastValues = new Map(); // Track last animated values
      this.isAnimating = false;
      this.lastFrameTime = 0;
      this.targetFPS = GAME_CONFIG.ANIMATION.TARGET_FPS;
      this.frameInterval = GAME_CONFIG.ANIMATION.FRAME_INTERVAL;
      this.startAnimation();
    }
    
    animateValue(element, startValue, endValue, duration = 1000, formatter = null, minChange = 0.01) {
      if (!element) return;
      
      // If number animations are disabled, just set the value directly
      if (!numberAnimationsEnabled) {
        if (formatter) {
          element.textContent = formatter(endValue);
        } else {
          element.textContent = endValue.toString();
        }
        return;
      }
      
      const key = element.id || element;
      
      // Check if there's already an animation running for this element
      if (this.animations.has(key)) {
        const currentAnimation = this.animations.get(key);
        // If the change is too small, don't interrupt the current animation
        if (Math.abs(endValue - currentAnimation.endValue) < minChange) {
          return;
        }
        // Update the target value of the current animation
        currentAnimation.endValue = endValue;
        currentAnimation.startValue = currentAnimation.startValue; // Keep current start
        return;
      }
      
      // Check if the change is significant enough to animate
      const lastValue = this.lastValues.get(key) || startValue;
      if (Math.abs(endValue - lastValue) < minChange) {
        return;
      }
      
      const startTime = Date.now();
      
      // Add visual feedback during animation
      element.classList.add('animating');
      
      // Store animation data
      this.animations.set(key, {
        element,
        startValue,
        endValue,
        startTime,
        duration,
        formatter: formatter || this.defaultFormatter
      });
      
      // Update last animated value
      this.lastValues.set(key, endValue);

      this.startAnimation();
    }
    
    defaultFormatter(value) {
      return formatNumberShort(value);
    }
    
    // Force immediate animation for important events (bypasses minChange)
    forceAnimateValue(element, startValue, endValue, duration = 1000, formatter = null) {
      if (!element) return;
      
      // If number animations are disabled, just set the value directly
      if (!numberAnimationsEnabled) {
        if (formatter) {
          element.textContent = formatter(endValue);
        } else {
          element.textContent = endValue.toString();
        }
        return;
      }
      
      const key = element.id || element;
      const startTime = Date.now();
      
      // Cancel any existing animation
      this.animations.delete(key);
      
      // Add visual feedback during animation
      element.classList.add('animating');
      
      // Store animation data
      this.animations.set(key, {
        element,
        startValue,
        endValue,
        startTime,
        duration,
        formatter: formatter || this.defaultFormatter
      });
      
      // Update last animated value
      this.lastValues.set(key, endValue);

      this.startAnimation();
    }
    
    updateAnimations() {
      const now = Date.now();
      
      for (const [key, animation] of this.animations.entries()) {
        const elapsed = now - animation.startTime;
        const progress = Math.min(elapsed / animation.duration, 1);
        
        // Use easing function for smooth animation
        const easedProgress = this.easeOutCubic(progress);
        const currentValue = animation.startValue + (animation.endValue - animation.startValue) * easedProgress;
        
        // Update element text
        if (animation.element && animation.element.textContent !== undefined) {
          animation.element.textContent = animation.formatter(currentValue);
        }
        
        // Remove completed animations
        if (progress >= 1) {
          // Remove visual feedback
          animation.element.classList.remove('animating');
          this.animations.delete(key);
        }
      }
    }
    
    easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }
    
    animate(currentTime = 0) {
      // Throttle animation to target FPS
      if (currentTime - this.lastFrameTime >= this.frameInterval) {
      this.updateAnimations();
        this.lastFrameTime = currentTime;
      }
      
      // Only continue animation if there are active animations or we're actively animating
      if (this.animations.size > 0 || this.isAnimating) {
        this.animationId = requestAnimationFrame((time) => this.animate(time));
      } else {
        this.animationId = null;
      }
    }
    
    startAnimation() {
      this.isAnimating = true;
      if (!this.animationId) {
        this.lastFrameTime = 0; // Reset frame time to avoid frame skipping
        this.animate();
      }
    }
    
    stopAnimation() {
      this.isAnimating = false;
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
    }
    
    // Check if there are active animations
    hasActiveAnimations() {
      return this.animations.size > 0;
    }
    
    // Cleanup method to prevent memory leaks
    destroy() {
      this.stopAnimation();
      this.animations.clear();
      this.lastValues.clear();
    }
  }
  
  // Initialize number animator
  let numberAnimator;
  
  // Event System - state variables moved to eventTrigger.js
  let eventCooldown = 0;
  let skipNextEventCheck = false; // Skip next event check to give breathing room
  
  // Active event display elements
  let activeEventDisplay = null;
  let eventIcon = null;
  let eventName = null;
  let eventTimer = null;
  
  // Property system configuration - now using config
  const PROPERTY_CONFIG = GAME_CONFIG.PROPERTY_CONFIG;

  // Property ownership tracking - moved to global scope

  // Buy multiplier system - now using config
  let buyMultiplier = 1;
  const BUY_MULTIPLIERS = GAME_CONFIG.BUY_MULTIPLIERS;

  function cycleBuyMultiplier() {
    const currentIndex = BUY_MULTIPLIERS.indexOf(buyMultiplier);
    const nextIndex = (currentIndex + 1) % BUY_MULTIPLIERS.length;
    buyMultiplier = BUY_MULTIPLIERS[nextIndex];
    updateBuyMultiplierDisplay();
    saveGameState();
  }

  function updateBuyMultiplierDisplay() {
    // Update the toggle button
    if (buyMultiplierBtn) {
      buyMultiplierBtn.textContent = buyMultiplier === 'MAX' ? 'MAX' : `${buyMultiplier}x`;
    }
    
    // Update all property buy buttons to show current multiplier
    Object.keys(PROPERTY_CONFIG).forEach(propertyId => {
      const buyBtn = document.getElementById(`buy${propertyId.charAt(0).toUpperCase() + propertyId.slice(1)}Btn`);
      if (buyBtn) {
        if (buyMultiplier === 'MAX') {
          // Calculate how many properties can be bought for this specific property
          const config = PROPERTY_CONFIG[propertyId];
          const owned = properties[propertyId];
          let propertiesToBuy = 0;
          let runningCost = 0;
          
          while (runningCost <= currentAccountBalance) {
            const cost = getEffectiveBaseCost(config) * Math.pow(config.priceMultiplier, owned + propertiesToBuy);
            if (runningCost + cost > currentAccountBalance) break;
            runningCost += cost;
            propertiesToBuy++;
          }
          
          // If can't buy any, show 1x to indicate they can't even afford one
          if (propertiesToBuy === 0) {
            buyBtn.textContent = 'Buy 1x';
          } else {
            buyBtn.textContent = `Buy ${propertiesToBuy}x`;
          }
        } else {
          buyBtn.textContent = `Buy ${buyMultiplier}x`;
        }
      }
    });
  }

  function setupPropertyButtonEvents(propertyId, buyBtn) {
    if (!buyBtn) return;
    
    // Click event - buy property
    buyBtn.addEventListener("click", () => {
      buyProperty(propertyId);
    });
    
    // Touch events for visual feedback
    buyBtn.addEventListener("touchstart", (e) => {
      buyBtn.classList.add("touch-active");
    }, { passive: true });
    
    buyBtn.addEventListener("touchend", (e) => {
      buyBtn.classList.remove("touch-active");
    }, { passive: true });
    
    buyBtn.addEventListener("touchcancel", (e) => {
      buyBtn.classList.remove("touch-active");
    }, { passive: true });
  }

  // Event logs
  let eventLogs = [];

  // Leaderboard system - Firebase Realtime Database
  const FIREBASE_CONFIG = {
    apiKey: "AIzaSyBprL8LvwvLYQZzPeKNEuIzUGamP1Ii-fY",
    authDomain: "moneyclicker-291ef.firebaseapp.com",
    databaseURL: "https://moneyclicker-291ef-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "moneyclicker-291ef",
    storageBucket: "moneyclicker-291ef.firebasestorage.app",
    messagingSenderId: "105757877305",
    appId: "1:105757877305:web:7ac7e12fd90c70981759e8",
    measurementId: "G-07NZVE6FWJ"
  };
  let leaderboardData = [];

  // Event system configuration
  const EVENT_CONFIG = GAME_CONFIG.EVENT_CONFIG;
  
  // Helper function to calculate current net worth
  function getCurrentNetWorth() {
    return currentAccountBalance + investmentAccountBalance;
  }
  
  // Helper function to check if event meets net worth threshold
  function meetsNetWorthThreshold(eventName) {
    const threshold = GAME_CONFIG.EVENT_CONFIG.netWorthThresholds[eventName] || 0;
    return getCurrentNetWorth() >= threshold;
  }
  
  // Helper function to check if event requirements are met
  function meetsEventRequirements(eventName) {
    const requiredUpgrade = GAME_CONFIG.EVENT_CONFIG.requirements[eventName];
    if (!requiredUpgrade) return true; // No requirements
    return owned[requiredUpgrade] || false;
  }
  
  // Helper functions moved to eventTrigger.js
  
  // Event Functions moved to eventTrigger.js
  
  // Check for expired events immediately (called every second)
  function checkExpiredEvents() {
    const now = Date.now();
    
    // Check if events should end
    if (marketBoomActive() && now >= marketBoomEndTime()) {
      setMarketBoomActive(false);
      updateInterestRateColor();
      updateDividendRateColor();
      renderDividendUI(0); // Update dividend display
      showEventNotification("📈 Boom Ended", "Interest & dividend rates returned to normal", "boom-end");
      updateActiveEventDisplay();
      skipNextEventCheck = true; // Skip next event check for breathing room
    }
    
    if (marketCrashActive() && now >= marketCrashEndTime()) {
      setMarketCrashActive(false);
      updateInterestRateColor();
      updateDividendRateColor();
      renderDividendUI(0); // Update dividend display
      showEventNotification("📉 Crash Ended", "Interest & dividend rates returned to normal", "crash-end");
      updateActiveEventDisplay();
      skipNextEventCheck = true; // Skip next event check for breathing room
    }
    
    if (flashSaleActive() && now >= flashSaleEndTime()) {
      setFlashSaleActive(false);
      showEventNotification("🏷️ Sale Ended", "Upgrade prices returned to normal", "flash-sale-end");
      renderUpgradePrices(); // Update prices back to normal
      
      // Remove visual styling from upgrades section
      const upgradesSection = document.getElementById('upgradesSection');
      if (upgradesSection) {
        upgradesSection.classList.remove('flash-sale-active');
      }
      updateActiveEventDisplay();
      skipNextEventCheck = true; // Skip next event check for breathing room
    }
    
    if (greatDepressionActive() && now >= greatDepressionEndTime()) {
      setGreatDepressionActive(false);
      updateInterestRateColor();
      updateDividendRateColor();
      renderDividendUI(0); // Update dividend display
      showEventNotification("💀 Depression Ended", "Interest rates returned to normal, dividends resumed", "depression-end");
      updateActiveEventDisplay();
      skipNextEventCheck = true; // Skip next event check for breathing room
    }
    
    if (fastFingersActive() && now >= fastFingersEndTime()) {
      setFastFingersActive(false);
      showEventNotification("⚡ Fast Fingers Ended", "Click income returned to normal", "fast-fingers-end");
      updateActiveEventDisplay();
      skipNextEventCheck = true; // Skip next event check for breathing room
    }
    
    if (earthquakeActive() && now >= earthquakeEndTime()) {
      setEarthquakeActive(false);
      showEventNotification("🌍 Earthquake Ended", "Rent income returned to normal", "earthquake-end");
      
      // Invalidate property income cache to ensure earthquake effects are removed
      propertyIncomeCacheValid = false;
      
      renderRentIncome(); // Update rent income display
      updateActiveEventDisplay();
      skipNextEventCheck = true; // Skip next event check for breathing room
    }
  }

  function checkEvents() {
    const now = Date.now();
    
    // Check if events should end (this is now handled by checkExpiredEvents)
    checkExpiredEvents();
    
    // Skip event checking if we need breathing room after an event ended
    if (skipNextEventCheck) {
      skipNextEventCheck = false; // Reset the flag
      console.log('🛑 Skipping event check for breathing room');
      return;
    }
    
    // Check for new events (only one event can be active at a time)
    const anyEventActive = marketBoomActive() || marketCrashActive() || flashSaleActive() || greatDepressionActive() || fastFingersActive() || earthquakeActive();
    
    if (!anyEventActive) {
      // Only check for new events if no event is currently active
      const eventRoll = Math.random();
      
      // Calculate which events can actually trigger (meet thresholds and cooldowns)
      const availableEvents = [];
      
      // Get all event names from config and filter events that can actually trigger
      Object.keys(GAME_CONFIG.EVENT_CONFIG.probabilities).forEach(eventName => {
        let canTrigger = now >= GAME_CONFIG.EVENT_CONFIG.eventCooldowns[eventName] && 
                        meetsNetWorthThreshold(eventName) && 
                        meetsEventRequirements(eventName);
        
        // Special requirement for earthquake: need at least 100 properties
        if (eventName === 'earthquake') {
          const totalProperties = Object.values(properties).reduce((sum, count) => sum + count, 0);
          canTrigger = canTrigger && totalProperties >= 100;
        }
        
        if (canTrigger) {
          availableEvents.push({
            name: eventName,
            prob: getEventProbability(eventName)
          });
        }
      });
      
      // Calculate total probability of available events
      const totalAvailableProb = availableEvents.reduce((sum, event) => sum + event.prob, 0);
      
      // Calculate cumulative probabilities for available events only
      let cumulativeProb = 0;
      const eventRanges = {};
      availableEvents.forEach(event => {
        const startRange = cumulativeProb;
        cumulativeProb += event.prob;
        eventRanges[event.name] = {
          start: startRange,
          end: cumulativeProb,
          probability: event.prob,
          percentage: (event.prob * 100).toFixed(1) + '%'
        };
      });
      
      console.log('🎲 Event Roll:', {
        roll: eventRoll,
        availableEvents: availableEvents.map(e => e.name),
        totalAvailableProbability: (totalAvailableProb * 100).toFixed(1) + '%',
        eventRanges: eventRanges,
        nothingProbability: ((1 - totalAvailableProb) * 100).toFixed(1) + '%',
        cooldownChecks: {
          marketBoom: now >= GAME_CONFIG.EVENT_CONFIG.eventCooldowns.marketBoom,
          marketCrash: now >= GAME_CONFIG.EVENT_CONFIG.eventCooldowns.marketCrash,
          flashSale: now >= GAME_CONFIG.EVENT_CONFIG.eventCooldowns.flashSale,
          greatDepression: now >= GAME_CONFIG.EVENT_CONFIG.eventCooldowns.greatDepression,
          fastFingers: now >= GAME_CONFIG.EVENT_CONFIG.eventCooldowns.fastFingers,
          taxCollection: now >= GAME_CONFIG.EVENT_CONFIG.eventCooldowns.taxCollection,
          robbery: now >= GAME_CONFIG.EVENT_CONFIG.eventCooldowns.robbery,
          divorce: now >= GAME_CONFIG.EVENT_CONFIG.eventCooldowns.divorce,
          earthquake: now >= GAME_CONFIG.EVENT_CONFIG.eventCooldowns.earthquake
        },
        netWorthChecks: {
          currentNetWorth: getCurrentNetWorth(),
          marketBoom: meetsNetWorthThreshold('marketBoom'),
          marketCrash: meetsNetWorthThreshold('marketCrash'),
          flashSale: meetsNetWorthThreshold('flashSale'),
          greatDepression: meetsNetWorthThreshold('greatDepression'),
          fastFingers: meetsNetWorthThreshold('fastFingers'),
          taxCollection: meetsNetWorthThreshold('taxCollection'),
          robbery: meetsNetWorthThreshold('robbery'),
          divorce: meetsNetWorthThreshold('divorce'),
          earthquake: meetsNetWorthThreshold('earthquake')
        }
      });
      
      // Check which event should trigger based on the roll
      let eventTriggered = false;
      for (const event of availableEvents) {
        const range = eventRanges[event.name];
        if (eventRoll >= range.start && eventRoll < range.end) {
          console.log(`🎯 TRIGGERING: ${event.name}!`);
          
          // Trigger the appropriate event
          switch (event.name) {
            case 'marketBoom':
        triggerMarketBoom();
              break;
            case 'marketCrash':
        triggerMarketCrash();
              break;
            case 'flashSale':
        triggerFlashSale();
              break;
            case 'greatDepression':
        triggerGreatDepression();
              break;
            case 'fastFingers':
              triggerFastFingers();
              break;
            case 'taxCollection':
        triggerTaxCollection();
              break;
            case 'robbery':
        triggerRobbery();
              break;
            case 'divorce':
        triggerDivorce();
              break;
            case 'earthquake':
        triggerEarthquake();
              break;
      }
          eventTriggered = true;
          break;
        }
      }
      
      // Nothing happens
      if (!eventTriggered) {
        console.log(`🎲 Result: Nothing triggered (${((1 - totalAvailableProb) * 100).toFixed(1)}% chance)`);
      }
    } else {
      // console.log('🎲 Skipping event check - event already active');
    }
  }
  
  window.updateInterestRateColor = function() {
    const interestEl = document.getElementById('interestPerSec');
    if (!interestEl) return;
    
    // Remove existing color classes
    interestEl.classList.remove('market-boom', 'market-crash', 'great-depression');
    
    // Add appropriate color class
    if (marketBoomActive()) {
      interestEl.classList.add('market-boom');
    } else if (marketCrashActive()) {
      interestEl.classList.add('market-crash');
    } else if (greatDepressionActive()) {
      interestEl.classList.add('great-depression');
    }
  }
  
  window.updateDividendRateColor = function() {
    const dividendRateEl = document.getElementById('dividendRate');
    if (!dividendRateEl) return;
    
    // Remove existing color classes
    dividendRateEl.classList.remove('market-boom', 'market-crash', 'great-depression');
    
    // Add appropriate color class
    if (marketBoomActive()) {
      dividendRateEl.classList.add('market-boom');
    } else if (marketCrashActive()) {
      dividendRateEl.classList.add('market-crash');
    } else if (greatDepressionActive()) {
      dividendRateEl.classList.add('great-depression');
    }
  }
  
  window.updateActiveEventDisplay = function() {
    if (!activeEventDisplay || !eventIcon || !eventName || !eventTimerFill || !eventTimerText) return;
    
    const now = Date.now();
    let activeEvent = null;
    let endTime = 0;
    let eventType = '';
    let totalDuration = 0;
    
    // Determine which event is active
    if (marketBoomActive() && now < marketBoomEndTime()) {
      activeEvent = { name: 'Market Boom', icon: '📈', type: 'market-boom' };
      endTime = marketBoomEndTime();
      eventType = 'market-boom';
      totalDuration = GAME_CONFIG.EVENT_CONFIG.durations.marketBoom;
    } else if (marketCrashActive() && now < marketCrashEndTime()) {
      activeEvent = { name: 'Market Crash', icon: '📉', type: 'market-crash' };
      endTime = marketCrashEndTime();
      eventType = 'market-crash';
      totalDuration = GAME_CONFIG.EVENT_CONFIG.durations.marketCrash;
    } else if (flashSaleActive() && now < flashSaleEndTime()) {
      activeEvent = { name: 'Flash Sale', icon: '🏷️', type: 'flash-sale' };
      endTime = flashSaleEndTime();
      eventType = 'flash-sale';
      totalDuration = GAME_CONFIG.EVENT_CONFIG.durations.flashSale;
    } else if (greatDepressionActive() && now < greatDepressionEndTime()) {
      activeEvent = { name: 'Great Depression', icon: '💀', type: 'great-depression' };
      endTime = greatDepressionEndTime();
      eventType = 'great-depression';
      totalDuration = GAME_CONFIG.EVENT_CONFIG.durations.greatDepression;
    } else if (fastFingersActive() && now < fastFingersEndTime()) {
      activeEvent = { name: 'Fast Fingers', icon: '⚡', type: 'fast-fingers' };
      endTime = fastFingersEndTime();
      eventType = 'fast-fingers';
      totalDuration = GAME_CONFIG.EVENT_CONFIG.durations.fastFingers;
    } else if (earthquakeActive() && now < earthquakeEndTime()) {
      activeEvent = { name: `Earthquake (${earthquakeMagnitude().toFixed(1)})`, icon: '🌍', type: 'earthquake' };
      endTime = earthquakeEndTime();
      eventType = 'earthquake';
      totalDuration = GAME_CONFIG.EVENT_CONFIG.durations.earthquake;
    }
    
    if (activeEvent) {
      // Show the display
      activeEventDisplay.classList.remove('hidden');
      activeEventDisplay.className = `active-event-display ${eventType}`;
      
      // Update content
      eventIcon.textContent = activeEvent.icon;
      eventName.textContent = activeEvent.name;
      
      // Calculate time remaining and progress
      const timeLeft = Math.max(0, endTime - now);
      const seconds = Math.ceil(timeLeft / 1000);
      const progressPercent = Math.max(0, (timeLeft / totalDuration) * 100);
      
      // Update progress bar
      eventTimerFill.style.width = `${progressPercent}%`;
      eventTimerText.textContent = `${seconds}s`;
      
      // Add pulsing animation when time is low (to the progress bar)
      if (seconds <= 5) {
        eventTimerFill.style.animation = 'progressPulse 0.5s ease-in-out infinite alternate';
      } else {
        eventTimerFill.style.animation = '';
      }
    } else {
      // Hide the display
      activeEventDisplay.classList.add('hidden');
    }
  }
  
  window.showEventNotification = function(title, message, type) {
    const notification = document.createElement('div');
    notification.className = `market-event-notification ${type}`;
    notification.innerHTML = `
      <div class="event-title">${title}</div>
      <div class="event-message">${message}</div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Remove after 5 seconds
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 5000);
  }
  
  // Event sound functions are now handled by audio.js

  // Screen shake functionality
  window.screenShake = function(intensity = 5, duration = 200) {
    const body = document.body;
    const originalTransform = body.style.transform;
    const startTime = Date.now();
    
    function shake() {
      const elapsed = Date.now() - startTime;
      if (elapsed >= duration) {
        body.style.transform = originalTransform;
        return;
      }
      
      const progress = elapsed / duration;
      const currentIntensity = intensity * (1 - progress);
      const x = (Math.random() - 0.5) * currentIntensity;
      const y = (Math.random() - 0.5) * currentIntensity;
      
      body.style.transform = `translate(${x}px, ${y}px)`;
      requestAnimationFrame(shake);
    }
    
    shake();
  }
  
  // Screen flash functionality for achievements
  window.screenFlash = function(color = '#FFD700', duration = 300) {
    const flashOverlay = document.createElement('div');
    flashOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: ${color};
      opacity: 0.3;
      pointer-events: none;
      z-index: 10000;
      transition: opacity 0.1s ease-out;
    `;
    
    document.body.appendChild(flashOverlay);
    
    // Fade out
    setTimeout(() => {
      flashOverlay.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(flashOverlay);
      }, 100);
    }, duration);
  }

  const currentDisplay = document.getElementById("currentDisplay");
  const investmentDisplay = document.getElementById("investmentDisplay");
  const headerCurrentDisplay = document.getElementById("headerCurrentDisplay");
  const headerInvestmentDisplay = document.getElementById("headerInvestmentDisplay");
  const clickBtn = document.getElementById("clickBtn");
  const amountInput = document.getElementById("amountInput");
  const depositBtn = document.getElementById("depositBtn");
  const withdrawBtn = document.getElementById("withdrawBtn");
  const depositAllBtn = document.getElementById("depositAllBtn");
  const withdrawAllBtn = document.getElementById("withdrawAllBtn");
  const withdrawHalfBtn = document.getElementById("withdrawHalfBtn");
  const buyFoodStandBtn = document.getElementById("buyFoodStandBtn");
  const buyNewsstandBtn = document.getElementById("buyNewsstandBtn");
  const buyParkingGarageBtn = document.getElementById("buyParkingGarageBtn");
  const buyConvenienceStoreBtn = document.getElementById("buyConvenienceStoreBtn");
  const buyApartmentBtn = document.getElementById("buyApartmentBtn");
  const buyManufacturingPlantBtn = document.getElementById("buyManufacturingPlantBtn");
  const buyOfficeBuildingBtn = document.getElementById("buyOfficeBuildingBtn");
  const buySkyscraperBtn = document.getElementById("buySkyscraperBtn");
  const buyOperaHouseBtn = document.getElementById("buyOperaHouseBtn");
  const buyMultiplierBtn = document.getElementById("buyMultiplierBtn");
  const interestPerSecEl = document.getElementById("interestPerSec");
  const interestContainer = document.getElementById("interestContainer");
  const toggleCompletedBtn = document.getElementById("toggleCompletedBtn");
  const upgradesSection = document.getElementById("upgradesSection");
  const dividendInfo = document.getElementById("dividendInfo");
  const dividendPie = document.getElementById("dividendPie");
  const prestigeMultipliers = document.getElementById("prestigeMultipliers");
  const prestigeMultiplierEl = document.getElementById("prestigeMultiplier");
  const investSection = document.getElementById("investSection");
  const autoInvestSection = document.getElementById("autoInvestSection");
  const autoInvestToggle = document.getElementById("autoInvestToggle");
  const autoRentSection = document.getElementById("autoRentSection");
  const autoRentToggle = document.getElementById("autoRentToggle");
  const clickStreakSection = document.getElementById("clickStreakSection");
  const streakMultiplierEl = document.getElementById("streakMultiplier");
  const streakProgressFill = document.getElementById("streakProgressFill");
  const streakProgressText = document.getElementById("streakProgressText");

  // Active event display elements
  activeEventDisplay = document.getElementById("activeEventDisplay");
  eventIcon = activeEventDisplay?.querySelector(".event-icon");
  eventName = activeEventDisplay?.querySelector(".event-name");
  eventTimerFill = activeEventDisplay?.querySelector(".event-timer-fill");
  eventTimerText = activeEventDisplay?.querySelector(".event-timer-text");

  // Cheat codes: type "money" to get €10,000, "orkun" to get €250,000, "orbay" to get €2,000,000, "ilayda" to get €1,000,000,000,000, "casper" to set 10x multipliers, "upgrade" to unlock all upgrades
  let cheatBuffer = "";
  const CHEAT_CODES = {
    "money": 10000,
    "orkun": 250000,
    "orbay": 2000000,
    "ilayda": 1000000000000,
    "casper": "multipliers",
    "upgrade": "unlock_all"
  };

  function handleCheatCode(key) {
    cheatBuffer += key.toLowerCase();
    
    // Check for the longest possible cheat code length
    const maxLength = Math.max(...Object.keys(CHEAT_CODES).map(code => code.length));
    if (cheatBuffer.length > maxLength) {
      cheatBuffer = cheatBuffer.slice(-maxLength);
    }
    
    // Check if current buffer matches any cheat code
    for (const [code, reward] of Object.entries(CHEAT_CODES)) {
      if (cheatBuffer === code) {
        if (reward === "multipliers") {
          // Special case for casper cheat code - set multipliers to 10x
          console.log('Before cheat code - multipliers:', {
            click: prestigeClickMultiplier,
            interest: prestigeInterestMultiplier
          });
          prestigeClickMultiplier = 10;
          prestigeInterestMultiplier = 10;
          console.log('Cheat code applied - multipliers set to 10:', {
            prestigeClickMultiplier,
            prestigeInterestMultiplier
          });
          renderPrestigeMultipliers();
        } else if (reward === "unlock_all") {
          // Special case for upgrade cheat code - unlock all upgrades
          for (const upgradeId of Object.keys(owned)) {
            owned[upgradeId] = true;
          }
          renderUpgradesOwned();
          renderUpgradePrices();
          sortUpgradesByCost();
          renderInvestmentUnlocked();
          renderInterestPerSecond();
          renderAutoInvestSection();
          renderClickStreak();
          renderPrestigeMultipliers();
          updateUpgradeIndicator();
          updatePortfolioIndicator();
        } else {
          // Regular money cheat codes
          currentAccountBalance += reward;
          renderBalances();
        }
        cheatBuffer = ""; // Reset buffer
        break;
      }
    }
  }

  // Listen for keypress events
  document.addEventListener('keydown', (e) => {
    if (e.key.length === 1) { // Only single character keys
      handleCheatCode(e.key);
    }
  });

  const euroFormatter = new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // Optimized number formatting with caching and performance improvements
  const numberFormatCache = new Map();
  const CACHE_SIZE_LIMIT = GAME_CONFIG.CACHE.NUMBER_FORMAT_CACHE_LIMIT;
  const SIGNIFICANT_CHANGE_THRESHOLD = GAME_CONFIG.CACHE.SIGNIFICANT_CHANGE_THRESHOLD;

  // Format numbers with hybrid abbreviation system (k,m,b,t,aa,bb,cc,dd...)
  // Examples: 1,500 = 1.50k, 2,500,000 = 2.50m, 3,500,000,000 = 3.50b, 4,500,000,000,000 = 4.50t
  //          5,500,000,000,000,000 = 5.50aa, 6,500,000,000,000,000,000 = 6.50bb, etc.
  window.formatNumberShort = function(num) {
    formatStats.totalCalls++;
    
    // Handle edge cases quickly
    if (num === 0) return '0.00';
    if (num === Infinity || num === -Infinity || isNaN(num)) return '0.00';
    
    // Check cache first (major performance boost)
    const cacheKey = Math.round(num * 100) / 100; // Round to 2 decimal places for cache
    if (numberFormatCache.has(cacheKey)) {
      formatStats.cacheHits++;
      return numberFormatCache.get(cacheKey);
    }
    
    formatStats.cacheMisses++;
    
    // Clean cache if it gets too large
    if (numberFormatCache.size > CACHE_SIZE_LIMIT) {
      numberFormatCache.clear();
    }
    
    const isNegative = num < 0;
    const absNum = Math.abs(num);
    
    // Hybrid abbreviation system: k,m,b,t,aa,bb,cc,dd,ee,ff,gg,hh,ii,jj,kk,ll,mm,nn,oo,pp,qq,rr,ss,tt,uu,vv,ww,xx,yy,zz
    const abbreviations = ['', 'k', 'm', 'b', 't', 'aa', 'bb', 'cc', 'dd', 'ee', 'ff', 'gg', 'hh', 'ii', 'jj', 'kk', 'll', 'mm', 'nn', 'oo', 'pp', 'qq', 'rr', 'ss', 'tt', 'uu', 'vv', 'ww', 'xx', 'yy', 'zz'];
    
    let magnitude = 0;
    let divisor = 1;
    let abbreviation = '';
    
    // Find the appropriate magnitude level
    for (let exp = 3; exp <= 90; exp += 3) {
      const threshold = Math.pow(10, exp);
      if (absNum >= threshold) {
        magnitude = exp;
        divisor = threshold;
        abbreviation = abbreviations[exp / 3] || 'zz'; // Fallback to 'zz' for extremely large numbers
    } else {
        break;
      }
    }
    
    let formatted;
    if (magnitude === 0) {
      // Numbers less than 1,000
      formatted = absNum.toFixed(2);
    } else {
      const scaled = absNum / divisor;
      formatted = scaled.toFixed(2) + abbreviation;
    }
    
    const result = isNegative ? '-' + formatted : formatted;
    
    // Cache the result
    numberFormatCache.set(cacheKey, result);
    
    return result;
  }
  
  // Optimized version for frequent updates with change threshold
  function formatNumberShortWithThreshold(num, previousNum = 0, threshold = SIGNIFICANT_CHANGE_THRESHOLD) {
    // If change is not significant, return cached previous result
    if (previousNum !== 0 && Math.abs(num - previousNum) / Math.abs(previousNum) < threshold) {
      return formatNumberShort(previousNum);
    }
    return formatNumberShort(num);
  }
  
  // Batch formatter for multiple numbers (reduces function call overhead)
  function formatNumbersBatch(numbers) {
    return numbers.map(num => formatNumberShort(num));
  }
  
  // Optimized formatters for specific contexts
  const formatCurrency = (value) => '€' + formatNumberShort(value);
  const formatCurrencyWithUnit = (value, unit = '') => '€' + formatNumberShort(value) + unit;
  
  // Cached formatters for animation contexts (major performance boost)
  const animationFormatters = {
    currency: (value) => '€' + formatNumberShort(value),
    currencyPerSec: (value) => '€' + formatNumberShort(value) + '/sec',
    currencyEach: (value) => '€' + formatNumberShort(value) + '/sec each',
    currencyTotal: (value) => '€' + formatNumberShort(value) + '/sec total',
    currencyPerSecCompact: (value) => '€' + formatNumberShort(value) + '/s' // Shorter version for compact displays
  };
  
  // Debounced formatter for high-frequency updates (prevents excessive formatting)
  const debouncedFormatters = new Map();
  function getDebouncedFormatter(key, formatter, delay = 16) { // 16ms = ~60fps
    if (!debouncedFormatters.has(key)) {
      let timeoutId;
      let lastValue;
      let lastFormatted;
      
      debouncedFormatters.set(key, (value) => {
        if (value === lastValue) return lastFormatted;
        
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          lastValue = value;
          lastFormatted = formatter(value);
        }, delay);
        
        return lastFormatted || formatter(value);
      });
    }
    return debouncedFormatters.get(key);
  }
  
  // Performance monitoring for number formatting
  let formatStats = {
    cacheHits: 0,
    cacheMisses: 0,
    totalCalls: 0
  };
  
  function getFormatStats() {
    const hitRate = formatStats.totalCalls > 0 ? (formatStats.cacheHits / formatStats.totalCalls * 100).toFixed(1) : 0;
    return {
      ...formatStats,
      hitRate: `${hitRate}%`,
      cacheSize: numberFormatCache.size
    };
  }
  
  // Reset stats and clean cache periodically to prevent overflow
  const cacheCleanupInterval = setInterval(() => {
    formatStats = { cacheHits: 0, cacheMisses: 0, totalCalls: 0 };
    // Clear cache more frequently to prevent memory buildup
    if (numberFormatCache.size > CACHE_SIZE_LIMIT) {
      numberFormatCache.clear();
    }
  }, GAME_CONFIG.CACHE.CLEANUP_INTERVAL);

  window.renderUpgradePrices = function() {
    // Generate upgrade price elements mapping automatically
    const map = Object.fromEntries(
      Object.keys(UPGRADE_CONFIG).map(id => [id, document.getElementById(id + 'Price')])
    );
    Object.entries(map).forEach(([key, el]) => {
      if (!el) return;
      
      // Special handling for prestige reset upgrade
      if (key === 'u26') {
        if (prestigeTier >= 26) {
          el.textContent = 'MAX PRESTIGE';
          el.style.color = '#ef4444';
          el.style.fontWeight = 'bold';
          return;
        }
        // Show next tier cost for prestige reset
        const nextTierName = getPrestigeTierName(prestigeTier + 1);
        let cost = getUpgradeCost(key);
        
        // Apply Flash Sale discount
        if (flashSaleActive()) {
          cost = cost * 0.75; // 25% off
        }
        
        if (numberAnimator) {
          // Parse current value from element text
          const currentValue = parseDisplayedValue(el.textContent);
          
          // Animate to new cost
          numberAnimator.animateValue(el, currentValue, cost, 300, animationFormatters.currency);
        } else {
          // Fallback to instant update
          el.textContent = `€${formatNumberShort(cost)} (${nextTierName})`;
        }
        el.style.color = '';
        el.style.fontWeight = '';
        return;
      }
      
      let cost = getUpgradeCost(key);
      
      // Apply Flash Sale discount
      if (flashSaleActive()) {
        cost = cost * 0.75; // 25% off
      }
      
      if (numberAnimator) {
        // Parse current value from element text
        const currentValue = parseDisplayedValue(el.textContent);
        
        // Animate to new cost
        numberAnimator.animateValue(el, currentValue, cost, 300, animationFormatters.currency);
      } else {
        // Fallback to instant update
        el.textContent = '€' + formatNumberShort(cost);
      }
    });
  }

  // Helper function to parse displayed value back to actual number
  function parseDisplayedValue(text) {
    if (!text) return 0;
    
    // Remove € symbol
    let cleanText = text.replace('€', '');
    
    // Handle suffixes (k, m, b, t)
    let multiplier = 1;
    if (cleanText.includes('k')) {
      multiplier = 1000;
      cleanText = cleanText.replace('k', '');
    } else if (cleanText.includes('m')) {
      multiplier = 1000000;
      cleanText = cleanText.replace('m', '');
    } else if (cleanText.includes('b')) {
      multiplier = 1000000000;
      cleanText = cleanText.replace('b', '');
    } else if (cleanText.includes('t')) {
      multiplier = 1000000000000;
      cleanText = cleanText.replace('t', '');
    }
    
    // Parse the number and apply multiplier
    const number = parseFloat(cleanText) || 0;
    return number * multiplier;
  }

  // Render only the active tab for performance optimization
  function renderActiveTab() {
    switch(activeTab) {
      case 'earn':
        renderDividendUI(0);
        renderInvestmentUnlocked();
        renderPrestigeMultipliers();
        renderAutoInvestSection();
        renderAutoRentSection();
        renderClickStreak();
        renderRentIncome(); // CRITICAL: Update rent income display immediately // CRITICAL: Update rent income display immediately
        break;
      case 'upgrades':
        renderUpgradesOwned();
        break;
      case 'portfolio':
        renderAllProperties();
        break;
      case 'achievements':
        // Achievements are rendered on demand, no continuous updates needed
        break;
      case 'stats':
        // Stats are rendered on demand, no continuous updates needed
        break;
    }
  }

  // Render interest per second from per-tick multiplier (dynamic)
  function renderInterestPerSecond() {
    if (!interestPerSecEl) return;
      const m = getCompoundMultiplierPerTick();
      const perSecondMultiplier = Math.pow(m, 1000 / TICK_MS);
      const percent = (perSecondMultiplier - 1) * 100;
      
      // Debug logging
      // console.log('renderInterestPerSecond called:', {
      //   multiplier: m,
      //   perSecondMultiplier: perSecondMultiplier,
      //   percent: percent,
      //   owned_u4: owned.u4,
      //   owned_u32: owned.u32
      // });
    
    // Calculate earnings per second
    const earningsPerSecond = investmentAccountBalance * (perSecondMultiplier - 1);
    
    // Update rent income display
    renderRentIncome();
    
    if (numberAnimator) {
      // Parse current percentage from element text
      const currentText = interestPerSecEl.textContent.replace('%', '');
      const currentValue = parseFloat(currentText) || 0;
      
      // Only animate for significant changes (0.01% or more)
      const minChange = 0.01;
      numberAnimator.animateValue(interestPerSecEl, currentValue, percent, 250, (value) => value.toFixed(2) + "%", minChange);
    } else {
      // Fallback to instant update
      interestPerSecEl.textContent = percent.toFixed(2) + "%";
    }
    
    // Update earnings per second display
    const interestPerSecondEl = document.getElementById('interestPerSecond');
    if (interestPerSecondEl) {
      if (numberAnimator) {
        const currentEarnings = parseDisplayedValue(interestPerSecondEl.textContent);
        numberAnimator.animateValue(interestPerSecondEl, currentEarnings, earningsPerSecond, 250, animationFormatters.currencyPerSecCompact);
      } else {
        interestPerSecondEl.textContent = '€' + formatNumberShort(earningsPerSecond) + '/s';
      }
    }
    
    
    // Update market event styling
    const interestRow = document.getElementById('interestContainer');
    if (interestRow) {
      interestRow.classList.remove('market-boom', 'market-crash');
      if (marketBoomActive()) {
        interestRow.classList.add('market-boom');
      } else if (marketCrashActive()) {
        interestRow.classList.add('market-crash');
      }
    }
  }

  window.renderBalances = function() {
    if (currentDisplay && numberAnimator) {
      const currentValue = parseDisplayedValue(currentDisplay.textContent);
      // Only animate for significant changes (1% or more)
      const minChange = Math.max(currentAccountBalance * 0.01, 1);
      numberAnimator.animateValue(currentDisplay, currentValue, currentAccountBalance, 400, animationFormatters.currency, minChange);
    }
    if (investmentDisplay && numberAnimator) {
      const investmentValue = parseDisplayedValue(investmentDisplay.textContent);
      // Dynamic threshold: 1% of balance, but minimum 0.01 for small amounts
      const minChange = Math.max(investmentAccountBalance * 0.01, 0.01);
      numberAnimator.animateValue(investmentDisplay, investmentValue, investmentAccountBalance, 400, animationFormatters.currency, minChange);
    }
    
    // Update header displays
    if (headerCurrentDisplay && numberAnimator) {
      const headerCurrentValue = parseDisplayedValue(headerCurrentDisplay.textContent);
      const minChange = Math.max(currentAccountBalance * 0.01, 1);
      numberAnimator.animateValue(headerCurrentDisplay, headerCurrentValue, currentAccountBalance, 400, animationFormatters.currency, minChange);
    }
    if (headerInvestmentDisplay && numberAnimator) {
      const headerInvestmentValue = parseDisplayedValue(headerInvestmentDisplay.textContent);
      // Dynamic threshold: 1% of balance, but minimum 0.01 for small amounts
      const minChange = Math.max(investmentAccountBalance * 0.01, 0.01);
      numberAnimator.animateValue(headerInvestmentDisplay, headerInvestmentValue, investmentAccountBalance, 400, animationFormatters.currency, minChange);
    }
    
    // Force property updates when balance changes (fix for web version)
    if (renderEngine) {
      renderEngine.markDirty('allProperties');
    }
  }

  function renderUpgradesOwned() {
    // Automatically render ownership for all upgrades
    Object.keys(UPGRADE_CONFIG).forEach(id => {
      const element = document.querySelector(`.upgrade[data-upgrade-id="${id}"]`);
      if (element) {
        element.classList.toggle('owned', !!owned[id]);
      }
    });
  }

  function getPerClickIncome() {
    let base = 1;
    let bonus = getUpgradeEffectTotal('click_income');
    
    let totalIncome = (base + bonus) * prestigeClickMultiplier;
    
    // Apply click multipliers
    let clickMultiplier = getUpgradeEffectMultiplier('click_multiplier');
    totalIncome *= clickMultiplier;
    
    // Apply Fast Fingers 3x boost
    if (fastFingersActive()) {
      totalIncome *= 3;
    }
    
    return totalIncome;
  }

  function handleClick() {
    let income = getPerClickIncome();
    
    // Check if this was a critical hit and multiply income by 5x
    const isCritical = owned.u29 && Math.random() < 0.15;
    if (isCritical) {
      income *= 5;
    }
    
    // Handle click streak if upgrade is owned
    if (owned.u30) {
      updateClickStreak(isCritical);
      income *= streakMultiplier;
    }
    
    // Round income to 2 decimal places
    income = Math.round(income * 100) / 100;
    
    // Add income directly (no money cap)
    currentAccountBalance += income;
    
    // Create particle effects
    if (particleSystem && clickBtn) {
      const rect = clickBtn.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      if (isCritical) {
        // Critical hit: single orange coin + screen shake
        if (particleEffectsEnabled) {
        particleSystem.createCriticalCoin(centerX, centerY);
        }
        screenShake(8, 300);
      } else {
        // Normal click: regular particles based on income (mobile gets even fewer particles)
        const particleMultiplier = isMobile ? 0.5 : 1; // Mobile gets 50% fewer particles
        const baseCoinCount = Math.min(Math.max(Math.floor(income * 0.15 * particleMultiplier), 1), 1);
        const baseSparkleCount = Math.min(Math.max(Math.floor(income * 0.25 * particleMultiplier), 1), isMobile ? 1 : 2);
        
        // Debug log for mobile particles
        /*
        if (isMobile) {
          console.log('Mobile click particles:', { income, particleMultiplier, baseCoinCount, baseSparkleCount });
        }
        */
        
        // Create coin particles
      if (particleEffectsEnabled) {
        particleSystem.createCoinParticles(centerX, centerY, baseCoinCount);
        
        // Create sparkle particles
        particleSystem.createSparkleParticles(centerX, centerY, baseSparkleCount);
      }
      }
    }
    
    // Force immediate balance animation for click feedback
    if (numberAnimator) {
      if (currentDisplay) {
        const currentValue = parseDisplayedValue(currentDisplay.textContent);
        numberAnimator.forceAnimateValue(currentDisplay, currentValue, currentAccountBalance, 300, animationFormatters.currency);
      }
      if (headerCurrentDisplay) {
        const headerCurrentValue = parseDisplayedValue(headerCurrentDisplay.textContent);
        numberAnimator.forceAnimateValue(headerCurrentDisplay, headerCurrentValue, currentAccountBalance, 300, animationFormatters.currency);
      }
    }
    
    renderBalances();
    updateUpgradeIndicator();
    updatePortfolioIndicator();
    
    // Create flying money number with critical hit styling (show actual amount added)
    createFlyingMoney(income, isCritical);
    
    // Play appropriate sound
    if (isCritical) {
      AudioSystem.playCriticalCoinSound();
    } else {
    AudioSystem.playClickSound();
    }
    
    // Check achievements
    checkAchievementsOptimized();
  }

  function createFlyingMoney(amount, isCritical = false) {
    if (!clickBtn) return;
    
    // Create the flying money element
    const flyingMoney = document.createElement('div');
    flyingMoney.className = isCritical ? 'flying-money critical' : 'flying-money';
    
    // Format the amount with k/m/b suffixes for better readability
    const formattedAmount = formatNumberShort(amount);
    flyingMoney.textContent = isCritical ? `CRITICAL! +${formattedAmount}` : `+${formattedAmount}`;
    
    // Position it from the center top of the click button
    const buttonRect = clickBtn.getBoundingClientRect();
    const randomX = (Math.random() - 1.5) * 60; // Small random variation (-10 to +10)
    const randomY = (Math.random() - 1.5) * 40; // Small random variation (-5 to +5)
    
    flyingMoney.style.left = `${buttonRect.width / 2 + randomX}px`;
    flyingMoney.style.top = `${buttonRect.height * 0.1 + randomY}px`; // Start from top 10% of button (center top)
    
    // Add to button
    clickBtn.appendChild(flyingMoney);
    
    // Remove after animation completes (longer for critical hits)
    const duration = isCritical ? 2000 : 1500;
    setTimeout(() => {
      if (flyingMoney.parentNode) {
        flyingMoney.parentNode.removeChild(flyingMoney);
      }
    }, duration);
  }

  if (clickBtn) {
    clickBtn.addEventListener("click", handleClick);
    
    // Add touch-specific animation handling
    clickBtn.addEventListener("touchstart", (e) => {
      clickBtn.classList.add("touch-active");
    }, { passive: true });
    
    clickBtn.addEventListener("touchend", (e) => {
      clickBtn.classList.remove("touch-active");
    }, { passive: true });
    
    // Initialize audio on first click
    clickBtn.addEventListener("click", () => {
      // Resume audio context for iOS PWA compatibility
      AudioSystem.resumeAudioContext();
      // Start background music on first user interaction (browser requirement)
      AudioSystem.startBackgroundMusic();
    }, { once: true });
  }

  function parseAmountInput() {
    const value = amountInput && typeof amountInput.value === "string" ? amountInput.value.trim() : "";
    const parsed = Number(value);
    if (!isFinite(parsed) || parsed <= 0) return 0;
    return Math.floor(parsed * 100) / 100; // normalize to 2 decimals
  }

  function depositAll() {
    if (currentAccountBalance <= 0) return;
    
    const depositAmount = currentAccountBalance;
    
    // Track first investment for achievement
    if (!hasMadeFirstInvestment && currentAccountBalance > 0) {
      hasMadeFirstInvestment = true;
    }
    
    investmentAccountBalance += currentAccountBalance;
    currentAccountBalance = 0;
    
    // Create deposit particle effects
    if (particleSystem) {
      const depositBtn = document.getElementById('depositAllBtn');
      if (depositBtn) {
        const rect = depositBtn.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Create money particles flowing to investment
        if (particleEffectsEnabled) {
        particleSystem.createMoneyGainParticles(centerX, centerY, depositAmount);
        
        // Create upgrade particles for investment
        particleSystem.createUpgradeParticles(centerX, centerY, 3);
        }
      }
    }
    
    renderBalances();
    if (amountInput) amountInput.value = ""; // clear input
    AudioSystem.playDepositSound(); // Play deposit sound effect
    saveGameState();
  }

  function withdrawAll() {
    if (investmentAccountBalance <= 0) return;
    
    const withdrawAmount = investmentAccountBalance;
    currentAccountBalance += investmentAccountBalance;
    investmentAccountBalance = 0;
    
    // Create withdraw particle effects
    if (particleSystem) {
      const withdrawBtn = document.getElementById('withdrawAllBtn');
      if (withdrawBtn) {
        const rect = withdrawBtn.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Create money particles flowing to current account
        if (particleEffectsEnabled) {
        particleSystem.createMoneyGainParticles(centerX, centerY, withdrawAmount);
        
        // Create sparkle particles for withdrawal
        particleSystem.createSparkleParticles(centerX, centerY, 2);
        }
      }
    }
    
    renderBalances();
    if (amountInput) amountInput.value = ""; // clear input
    AudioSystem.playWithdrawSound(); // Play withdraw sound effect
    saveGameState();
  }

  function withdrawHalf() {
    if (investmentAccountBalance <= 0) return;
    
    const withdrawAmount = investmentAccountBalance * 0.5;
    currentAccountBalance += withdrawAmount;
    investmentAccountBalance -= withdrawAmount;
    
    // Create withdraw particle effects
    if (particleSystem) {
      const withdrawHalfBtn = document.getElementById('withdrawHalfBtn');
      if (withdrawHalfBtn) {
        const rect = withdrawHalfBtn.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Create money particles flowing to current account
        if (particleEffectsEnabled) {
        particleSystem.createMoneyGainParticles(centerX, centerY, withdrawAmount);
        
        // Create sparkle particles for withdrawal
        particleSystem.createSparkleParticles(centerX, centerY, 1);
        }
      }
    }
    
    renderBalances();
    if (amountInput) amountInput.value = ""; // clear input
    AudioSystem.playWithdrawSound(); // Play withdraw sound effect
    saveGameState();
  }

  // Property system functions
  function getEffectiveBaseCost(config) {
    // Apply building discount upgrades
    const totalDiscount = getUpgradeEffectTotal('building_discount');
    
    return config.baseCost * (1 - totalDiscount);
  }

  function getPropertyCost(propertyId) {
    const config = PROPERTY_CONFIG[propertyId];
    const owned = properties[propertyId];
    return Math.floor(getEffectiveBaseCost(config) * Math.pow(config.priceMultiplier, owned));
  }


  function getPropertyTotalIncome(propertyId) {
    const config = PROPERTY_CONFIG[propertyId];
    const ownedCount = properties[propertyId];
    
    // Calculate tier using procedural system
    const tier = calculateTier(ownedCount);
    
    let tierMultiplier = Math.pow(2, tier); // 2^tier (1x, 2x, 4x, 8x)
    
    // Special multipliers for high-tier buildings - multiplicative
    if (ownedCount >= 600) {
      tierMultiplier *= 100; // Multiply existing tier multiplier by 100x (Galactic tier)
    } else if (ownedCount >= 500) {
      tierMultiplier *= 10; // Multiply existing tier multiplier by 10x (Cosmic tier)
    }
    
    // All buildings get the same income multiplier based on total owned
    let baseIncome = ownedCount * config.incomePerSecond * tierMultiplier;
    
    // Apply general rent income boosts
    const rentMultiplier = getUpgradeEffectMultiplier('rent_income');
    baseIncome *= rentMultiplier;
    
    // Apply property-specific rent income boosts
    const propertyRentMultiplier = getPropertySpecificRentMultiplier(propertyId);
    baseIncome *= propertyRentMultiplier;
    
    // Apply prestige multiplier to property income (twice for double effect)
    baseIncome *= prestigeInterestMultiplier * prestigeInterestMultiplier;
    
    // Debug logging
    /*
    if (ownedCount >= 99 && ownedCount <= 101) {
      console.log(`${propertyId} Total ${ownedCount} buildings: Tier ${tier}, Multiplier ${tierMultiplier}x, Base €${ownedCount * config.incomePerSecond}, Total €${Math.floor(baseIncome)}/sec`);
    }
    */
    
    return Math.floor(baseIncome);
  }

  function buyProperty(propertyId) {
    const config = PROPERTY_CONFIG[propertyId];
    let totalCost = 0;
    let purchases = 0;
    
    // Calculate how many properties to buy based on available funds
    let propertiesToBuy = 0;
    let currentOwned = properties[propertyId];
    let runningCost = 0;
    
    if (buyMultiplier === 'MAX') {
      // Calculate maximum affordable properties
      while (runningCost <= currentAccountBalance) {
        const cost = getEffectiveBaseCost(config) * Math.pow(config.priceMultiplier, currentOwned + propertiesToBuy);
        if (runningCost + cost > currentAccountBalance) break;
        runningCost += cost;
        propertiesToBuy++;
      }
      
      if (propertiesToBuy === 0) {
        console.log('Insufficient funds for any property purchase:', { propertyId, currentBalance: currentAccountBalance });
      AudioSystem.playErrorSound();
      return false;
    }
    } else {
      // For fixed multipliers (1x, 10x, 25x), calculate how many we can actually afford
      const requestedCount = buyMultiplier;
      while (propertiesToBuy < requestedCount && runningCost <= currentAccountBalance) {
        const cost = getEffectiveBaseCost(config) * Math.pow(config.priceMultiplier, currentOwned + propertiesToBuy);
        if (runningCost + cost > currentAccountBalance) break;
        runningCost += cost;
        propertiesToBuy++;
      }
      
      if (propertiesToBuy === 0) {
        console.log('Insufficient funds for any property purchase:', { propertyId, currentBalance: currentAccountBalance, requested: requestedCount });
        AudioSystem.playErrorSound();
        return false;
      }
    }
    
    totalCost = runningCost;
    
    // Make multiple purchases
    for (let i = 0; i < propertiesToBuy; i++) {
      const cost = getEffectiveBaseCost(config) * Math.pow(config.priceMultiplier, currentOwned + i);
    currentAccountBalance -= cost;
    properties[propertyId]++;
      purchases++;
    }
    
    // Invalidate property income cache since properties changed
    propertyIncomeCacheValid = false;
    
    // Create purchase particle effects
    if (particleSystem) {
      const buyBtn = document.getElementById(`buy${propertyId.charAt(0).toUpperCase() + propertyId.slice(1)}Btn`);
      if (buyBtn) {
        const rect = buyBtn.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Create upgrade particles (more particles for multiple purchases)
        if (particleEffectsEnabled) {
        particleSystem.createUpgradeParticles(centerX, centerY, Math.min(6, purchases * 1));
        
        // Create money gain particles
        particleSystem.createMoneyGainParticles(centerX, centerY, totalCost);
        }
      }
    }
    
    // Play buy sound
    AudioSystem.playBuySound();
    
    // Update displays
    renderBalances();
    renderPropertyUI(propertyId, true); // Show notifications for tier upgrades
    
    updateTotalRentDisplay();
    updatePortfolioIndicator();
    saveGameState();
    
    return true;
  }

  function renderPropertyUI(propertyId, showNotifications = false) {
    const config = PROPERTY_CONFIG[propertyId];
    const ownedCount = properties[propertyId];
    const singleCost = getPropertyCost(propertyId);
    const totalIncome = getPropertyTotalIncome(propertyId);
    
    // Calculate total cost for multiple purchases
    let totalCost = 0;
    let propertiesToBuy = buyMultiplier;
    
    if (buyMultiplier === 'MAX') {
      // Calculate maximum affordable properties
      let currentOwned = ownedCount;
      let runningCost = 0;
      propertiesToBuy = 0;
      
      while (runningCost <= currentAccountBalance) {
        const cost = getEffectiveBaseCost(config) * Math.pow(config.priceMultiplier, currentOwned + propertiesToBuy);
        if (runningCost + cost > currentAccountBalance) break;
        runningCost += cost;
        propertiesToBuy++;
      }
      
      // If can't buy any, fall back to showing cost of 1 property
      if (propertiesToBuy === 0) {
        totalCost = singleCost;
        propertiesToBuy = 1; // Show as if trying to buy 1
      } else {
        totalCost = runningCost;
      }
    } else {
      for (let i = 0; i < buyMultiplier; i++) {
        const currentOwned = ownedCount + i;
        const cost = getEffectiveBaseCost(config) * Math.pow(config.priceMultiplier, currentOwned);
        totalCost += cost;
      }
    }
    
    // Update owned count
    const ownedEl = document.getElementById(`${propertyId}Owned`);
    if (ownedEl) {
      ownedEl.textContent = ownedCount;
    }
    
    // Update cost (show total cost for multiple purchases)
    const costEl = document.getElementById(`${propertyId}Cost`);
    if (costEl) {
      if (buyMultiplier === 'MAX') {
        // If MAX mode can't buy any, show single cost to indicate they can't afford even one
        const config = PROPERTY_CONFIG[propertyId];
        const ownedCount = properties[propertyId];
        let maxPropertiesToBuy = 0;
        let runningCost = 0;
        
        while (runningCost <= currentAccountBalance) {
          const cost = getEffectiveBaseCost(config) * Math.pow(config.priceMultiplier, ownedCount + maxPropertiesToBuy);
          if (runningCost + cost > currentAccountBalance) break;
          runningCost += cost;
          maxPropertiesToBuy++;
        }
        
        if (maxPropertiesToBuy === 0) {
          costEl.textContent = `€${formatNumberShort(singleCost)}`;
        } else {
          costEl.textContent = `€${formatNumberShort(totalCost)}`;
        }
      } else if (buyMultiplier > 1) {
        costEl.textContent = `€${formatNumberShort(totalCost)}`;
      } else {
        costEl.textContent = `€${formatNumberShort(singleCost)}`;
      }
    }
    
    // Update individual income per unit (with tier system and upgrades)
    const individualIncomeEl = document.querySelector(`#${propertyId}Owned`).parentElement.querySelector('.property-income');
    if (individualIncomeEl) {
              // Calculate tier using procedural system
              const tier = calculateTier(ownedCount);
      
      const tierMultiplier = Math.pow(2, tier);
      
      let individualIncome = config.incomePerSecond * tierMultiplier;
      
      // Apply rent income boosts
      const rentMultiplier = getUpgradeEffectMultiplier('rent_income');
      individualIncome *= rentMultiplier;
      
      individualIncomeEl.textContent = animationFormatters.currencyEach(Math.floor(individualIncome));
    }
    
    // Update total income
    const totalIncomeEl = document.getElementById(`${propertyId}TotalIncome`);
    if (totalIncomeEl) {
      totalIncomeEl.textContent = animationFormatters.currencyTotal(totalIncome);
    }
    
    // Apply tier-based styling
    applyTierStyling(propertyId, ownedCount, showNotifications);
    
    // Update tier progress line
    updateTierProgressLine(propertyId, ownedCount);
    
    // Update buy button state and text
    const buyBtn = document.getElementById(`buy${propertyId.charAt(0).toUpperCase() + propertyId.slice(1)}Btn`);
    if (buyBtn) {
      buyBtn.disabled = currentAccountBalance < totalCost;
      if (buyMultiplier === 'MAX') {
        // If MAX mode can't buy any, show 1x to indicate they can't afford even one
        const config = PROPERTY_CONFIG[propertyId];
        const ownedCount = properties[propertyId];
        let maxPropertiesToBuy = 0;
        let runningCost = 0;
        
        while (runningCost <= currentAccountBalance) {
          const cost = getEffectiveBaseCost(config) * Math.pow(config.priceMultiplier, ownedCount + maxPropertiesToBuy);
          if (runningCost + cost > currentAccountBalance) break;
          runningCost += cost;
          maxPropertiesToBuy++;
        }
        
        if (maxPropertiesToBuy === 0) {
          buyBtn.textContent = 'Buy 1x';
        } else {
          buyBtn.textContent = `Buy ${maxPropertiesToBuy}x`;
        }
      } else {
        buyBtn.textContent = `Buy ${buyMultiplier}x`;
      }
    }
  }

  // Get tier information based on building count (not tier number)
  function getTierInfoByBuildings(buildingCount) {
    if (buildingCount === 0) {
      return GAME_CONFIG.TIER_CONFIG.default;
    }
    
    // Check all tiers (now all in standardTiers array)
    for (let i = GAME_CONFIG.TIER_CONFIG.standardTiers.length - 1; i >= 0; i--) {
      const tier = GAME_CONFIG.TIER_CONFIG.standardTiers[i];
      if (buildingCount >= tier.buildingsRequired) {
        return {
          name: tier.name,
          color: tier.color,
          bgColor: tier.bgColor,
          borderColor: tier.borderColor,
          buildingsRequired: tier.buildingsRequired
        };
      }
    }
    
    // Default tier for 0 buildings
    return GAME_CONFIG.TIER_CONFIG.default;
  }

  // Get tier information for a given tier number (for backward compatibility)
  function getTierInfo(tierNumber) {
    if (tierNumber === 0) {
      return GAME_CONFIG.TIER_CONFIG.default;
    }
    
    // Special handling for high-tier buildings
    if (tierNumber === 25) {
      // Galactic tier (600 buildings)
      const galacticTier = GAME_CONFIG.TIER_CONFIG.standardTiers.find(tier => tier.buildingsRequired === 600);
      if (galacticTier) {
        return {
          name: galacticTier.name,
          color: galacticTier.color,
          bgColor: galacticTier.bgColor,
          borderColor: galacticTier.borderColor,
          buildingsRequired: galacticTier.buildingsRequired
        };
      }
    } else if (tierNumber === 20) {
      // Cosmic tier (500 buildings)
      const cosmicTier = GAME_CONFIG.TIER_CONFIG.standardTiers.find(tier => tier.buildingsRequired === 500);
      if (cosmicTier) {
        return {
          name: cosmicTier.name,
          color: cosmicTier.color,
          bgColor: cosmicTier.bgColor,
          borderColor: cosmicTier.borderColor,
          buildingsRequired: cosmicTier.buildingsRequired
        };
      }
    }
    
    // Calculate buildings required for this tier
    const buildingsRequired = tierNumber * GAME_CONFIG.TIER_CONFIG.buildingsPerTier;
    
    // Use the building-based function
    return getTierInfoByBuildings(buildingsRequired);
  }

  // Calculate tier number from owned count
  function calculateTier(ownedCount) {
    // Special handling for high-tier buildings
    if (ownedCount >= 600) {
      return 25; // Return tier 25 for Galactic tier
    } else if (ownedCount >= 500) {
      return 20; // Return tier 20 for Cosmic tier
    }
    
    // Get the tier info based on building count
    const tierInfo = getTierInfoByBuildings(ownedCount);
    
    // Find the tier number that corresponds to this tier info
    if (tierInfo === GAME_CONFIG.TIER_CONFIG.default) {
      return 0;
    }
    
    // Check all tiers (now all in standardTiers array)
    for (let i = 0; i < GAME_CONFIG.TIER_CONFIG.standardTiers.length; i++) {
      if (GAME_CONFIG.TIER_CONFIG.standardTiers[i].buildingsRequired === tierInfo.buildingsRequired) {
        return i + 1; // tier 1 = index 0, tier 2 = index 1, etc.
      }
    }
    
    return 0; // Default fallback
  }

  // Apply tier-based styling to property rows
  function applyTierStyling(propertyId, ownedCount, showNotifications = true) {
    const propertyRow = document.querySelector(`[data-property-id="${propertyId}"]`);
    if (!propertyRow) return;
    
    // Get current tier info based on building count
    const currentTierInfo = getTierInfoByBuildings(ownedCount);
    const currentTierNumber = calculateTier(ownedCount);
    
    // Get previous tier to detect tier changes
    const previousTier = getTierFromClass(propertyRow);
    
    // Remove all existing tier classes
    const existingClasses = Array.from(propertyRow.classList).filter(cls => cls.startsWith('tier-'));
    existingClasses.forEach(cls => propertyRow.classList.remove(cls));
    
    // Add new tier class
    propertyRow.classList.add(`tier-${currentTierNumber}`);
    
    // Generate CSS for this tier if it doesn't exist
    generateTierCSS(currentTierNumber);
    
    // Check if we reached a new tier (regardless of exact building count)
    if (showNotifications && currentTierNumber > previousTier && currentTierNumber > 0) {
      // Celebrate whenever we reach a new tier number
      celebrateTierUpgrade(propertyId, currentTierNumber, propertyRow);
    }
  }
  
  // Helper function to get tier from CSS class
  function getTierFromClass(propertyRow) {
    const tierClasses = Array.from(propertyRow.classList).filter(cls => cls.startsWith('tier-'));
    if (tierClasses.length === 0) return 0;
    
    const tierNumber = parseInt(tierClasses[0].replace('tier-', ''));
    return isNaN(tierNumber) ? 0 : tierNumber;
  }

  // Generate CSS for a specific tier dynamically
  function generateTierCSS(tierNumber) {
    const tierInfo = getTierInfo(tierNumber);
    const className = `.property-row.tier-${tierNumber}`;
    
    // Check if CSS already exists - prevent duplicate style elements
    if (document.querySelector(`style[data-tier="${tierNumber}"]`)) {
      return;
    }
    
    // Use a single consolidated style element for all tiers
    let consolidatedStyle = document.getElementById('consolidated-tier-styles');
    if (!consolidatedStyle) {
      consolidatedStyle = document.createElement('style');
      consolidatedStyle.id = 'consolidated-tier-styles';
      document.head.appendChild(consolidatedStyle);
    }
    
    // Create style element for this specific tier (fallback for complex tiers)
    const style = document.createElement('style');
    style.setAttribute('data-tier', tierNumber);
    
    // Generate CSS based on tier type
    let css = '';
    
    if (tierNumber === 0) {
      // Default tier - no special styling
      css = `${className} { /* Default tier - no special styling */ }`;
    } else if (tierNumber === 12) {
      // Divine tier - special shifting colors and flaming animation with improved background readability
      css = `
        ${className} {
          background: linear-gradient(45deg, 
            rgba(0, 191, 255, 0.15) 0%, 
            rgba(30, 144, 255, 0.15) 25%, 
            rgba(65, 105, 225, 0.15) 50%, 
            rgba(0, 100, 200, 0.15) 75%, 
            rgba(0, 191, 255, 0.15) 100%);
          background-size: 200% 200%;
          animation: divineShift 4s ease-in-out infinite;
          border: 1px solid rgba(0, 191, 255, 0.4);
          box-shadow: 
            0 0 8px rgba(0, 191, 255, 0.3),
            0 0 15px rgba(0, 191, 255, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
          position: relative;
          overflow: hidden;
        }
        
        ${className}::before {
          content: '';
          position: absolute;
          top: -1px;
          left: -1px;
          right: -1px;
          bottom: -1px;
          background: linear-gradient(45deg, 
            rgba(0, 191, 255, 0.3), 
            rgba(30, 144, 255, 0.3), 
            rgba(65, 105, 225, 0.3), 
            rgba(0, 100, 200, 0.3), 
            rgba(0, 191, 255, 0.3));
          background-size: 200% 200%;
          animation: divineShift 5s ease-in-out infinite;
          z-index: -1;
          border-radius: 8px;
        }
        
        ${className}::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: 
            radial-gradient(circle at 20% 20%, rgba(0, 191, 255, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(30, 144, 255, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.05) 0%, transparent 70%);
          animation: divineGlow 3s ease-in-out infinite alternate;
          pointer-events: none;
          border-radius: 6px;
        }
        
        ${className}:hover {
          animation-duration: 2s;
          box-shadow: 
            0 0 12px rgba(0, 191, 255, 0.5),
            0 0 20px rgba(0, 191, 255, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.4);
        }
        
        /* Subtle text glow for Divine tier */
        ${className} .property-name,
        ${className} .property-count,
        ${className} .property-income {
          animation: divineFlicker 2s ease-in-out infinite alternate;
        }
      `;
    } else if (tierNumber >= (GAME_CONFIG.TIER_CONFIG.eliteTierStart / GAME_CONFIG.TIER_CONFIG.buildingsPerTier)) {
      // Elite tiers - enhanced effects
      css = `
        ${className} {
          background: linear-gradient(135deg, 
            ${tierInfo.bgColor} 0%, 
            ${tierInfo.bgColor.replace('0.4', '0.35')} 25%,
            ${tierInfo.bgColor.replace('0.4', '0.3')} 50%,
            ${tierInfo.bgColor.replace('0.4', '0.35')} 75%,
            ${tierInfo.bgColor} 100%);
          border: 1px solid ${tierInfo.borderColor};
          box-shadow: 
            0 2px 8px ${tierInfo.borderColor.replace('0.6', '0.3')},
            inset 0 1px 0 rgba(255, 255, 255, 0.4);
          position: relative;
        }
        
        ${className}::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, 
            transparent, 
            rgba(255, 255, 255, 0.6), 
            rgba(255, 255, 255, 0.8),
            rgba(255, 255, 255, 0.6),
            transparent);
          animation: specialShine 2s infinite;
          pointer-events: none;
          border-radius: 6px;
          overflow: hidden;
        }
        
        ${className}::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle at 30% 20%, ${tierInfo.borderColor.replace('0.6', '0.2')} 0%, transparent 50%),
                      radial-gradient(circle at 70% 80%, ${tierInfo.borderColor.replace('0.6', '0.15')} 0%, transparent 50%);
          pointer-events: none;
          border-radius: 6px;
        }
        
        ${className}:hover {
          border-color: ${tierInfo.borderColor.replace('0.6', '0.9')};
          box-shadow: 
            0 4px 12px ${tierInfo.borderColor.replace('0.6', '0.4')},
            inset 0 1px 0 rgba(255, 255, 255, 0.5);
        }
      `;
    } else if (tierNumber === 5) {
      // Platinum tier - same colors as Silver but with shining animation
      css = `
        ${className} {
          background: linear-gradient(135deg, 
            ${tierInfo.bgColor} 0%, 
            ${tierInfo.bgColor.replace('0.4', '0.35')} 25%,
            ${tierInfo.bgColor.replace('0.4', '0.3')} 50%,
            ${tierInfo.bgColor.replace('0.4', '0.35')} 75%,
            ${tierInfo.bgColor} 100%);
          border: 1px solid ${tierInfo.borderColor};
          box-shadow: 0 2px 8px ${tierInfo.borderColor.replace('0.6', '0.25')};
          position: relative;
          overflow: hidden;
        }
        
        ${className}::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, 
            transparent 0%, 
            rgba(255, 255, 255, 0.4) 50%, 
            transparent 100%);
          animation: platinumShine 2s ease-in-out infinite;
          pointer-events: none;
        }
        
        ${className}:hover {
          border-color: ${tierInfo.borderColor.replace('0.6', '0.8')};
          box-shadow: 0 4px 12px ${tierInfo.borderColor.replace('0.6', '0.35')};
        }
      `;
    } else {
      // Regular tiers - standard styling
      css = `
        ${className} {
          background: linear-gradient(135deg, 
            ${tierInfo.bgColor} 0%, 
            ${tierInfo.bgColor.replace('0.4', '0.35')} 25%,
            ${tierInfo.bgColor.replace('0.4', '0.3')} 50%,
            ${tierInfo.bgColor.replace('0.4', '0.35')} 75%,
            ${tierInfo.bgColor} 100%);
          border: 1px solid ${tierInfo.borderColor};
          box-shadow: 0 2px 8px ${tierInfo.borderColor.replace('0.6', '0.25')};
        }
        
        ${className}:hover {
          border-color: ${tierInfo.borderColor.replace('0.6', '0.8')};
          box-shadow: 0 4px 12px ${tierInfo.borderColor.replace('0.6', '0.35')};
        }
      `;
    }
    
    style.textContent = css;
    document.head.appendChild(style);
  }

  // Add special shine animation for high tiers
  function addSpecialShineAnimation() {
    if (document.querySelector('style[data-animation="specialShine"]')) return;
    
    const style = document.createElement('style');
    style.setAttribute('data-animation', 'specialShine');
    style.textContent = `
      @keyframes specialShine {
        0% { left: -100%; }
        100% { left: 100%; }
      }
      
      @keyframes divineShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 50% 50%; }
        100% { background-position: 0% 50%; }
      }
      
      @keyframes divineGlow {
        0% { 
          opacity: 0.3;
          transform: scale(1);
        }
        100% { 
          opacity: 0.6;
          transform: scale(1.02);
        }
      }
      
      @keyframes divineFlicker {
        0% { 
          text-shadow: 
            0 0 3px rgba(0, 191, 255, 0.4),
            0 0 6px rgba(0, 191, 255, 0.3),
            0 0 9px rgba(30, 144, 255, 0.2);
        }
        100% { 
          text-shadow: 
            0 0 5px rgba(0, 191, 255, 0.6),
            0 0 8px rgba(0, 191, 255, 0.4),
            0 0 12px rgba(30, 144, 255, 0.3),
            0 0 15px rgba(65, 105, 225, 0.2);
        }
      }
      
      @keyframes platinumShine {
        0% { left: -100%; }
        100% { left: 100%; }
      }
    `;
    document.head.appendChild(style);
  }

  // Helper function to adjust color brightness
  function adjustColorBrightness(color, factor) {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Adjust brightness
    const newR = Math.min(255, Math.max(0, Math.round(r * factor)));
    const newG = Math.min(255, Math.max(0, Math.round(g * factor)));
    const newB = Math.min(255, Math.max(0, Math.round(b * factor)));
    
    // Convert back to hex
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }
  
  // Update tier progress line under property card
  function updateTierProgressLine(propertyId, ownedCount) {
    const propertyRow = document.querySelector(`[data-property-id="${propertyId}"]`);
    if (!propertyRow) return;
    
    // Calculate current tier and progress to next tier using procedural system
    const currentTier = calculateTier(ownedCount);
    const nextTierThreshold = (currentTier + 1) * GAME_CONFIG.TIER_CONFIG.buildingsPerTier;
    const progress = (ownedCount % GAME_CONFIG.TIER_CONFIG.buildingsPerTier) / GAME_CONFIG.TIER_CONFIG.buildingsPerTier;
    
    // Get tier info for color
    const tierInfo = getTierInfo(currentTier);
    const lineColor = tierInfo.color;
    
    // Create or update the progress line
    let progressLine = propertyRow.querySelector('.tier-progress-line');
    if (!progressLine) {
      progressLine = document.createElement('div');
      progressLine.classList.add('tier-progress-line');
      propertyRow.appendChild(progressLine);
    }
    
    // Always show progress line (no max tier limit)
      progressLine.style.display = 'block';
      
      // Update progress line styling
      progressLine.style.width = `${progress * 100}%`;
      progressLine.style.backgroundColor = lineColor;
      
      // Add glow effect for higher tiers
      if (currentTier >= 3) {
        progressLine.style.boxShadow = `0 0 8px ${lineColor}`;
      } else {
        progressLine.style.boxShadow = 'none';
    }
  }
  
  // Celebrate tier upgrade with particles
  function celebrateTierUpgrade(propertyId, newTier, propertyRow) {
    if (!particleEffectsEnabled) {
      // Still show notification and play sound even if particles are disabled
      const config = PROPERTY_CONFIG[propertyId];
      if (AudioSystem.getAudioSettings().soundEnabled) {
        AudioSystem.playTierUpgradeSound();
      }
      showTierUpgradeNotification(propertyId, newTier, config.name);
      return;
    }
    
    const config = PROPERTY_CONFIG[propertyId];
    const rect = propertyRow.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Create celebration particles based on tier
    let particleCount = 20 + (newTier * 10); // More particles for higher tiers
    const tierInfo = getTierInfo(newTier);
    
    // Generate color variations based on tier color
    const baseColor = tierInfo.color;
    const colors = [
      baseColor,
      adjustColorBrightness(baseColor, 0.8),
      adjustColorBrightness(baseColor, 1.2),
      adjustColorBrightness(baseColor, 0.6)
    ];
    
    // Create tier-specific particles
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const velocity = 2 + Math.random() * 3;
      const vx = Math.cos(angle) * velocity;
      const vy = Math.sin(angle) * velocity;
      
      createTierParticle(
        centerX,
        centerY,
        vx,
        vy,
        colors[Math.floor(Math.random() * colors.length)],
        newTier
      );
    }
    
    // Play celebration sound
    if (AudioSystem.getAudioSettings().soundEnabled) {
      AudioSystem.playTierUpgradeSound();
    }
    
    // Show tier upgrade notification
    showTierUpgradeNotification(propertyId, newTier, config.name);
  }
  
  // Create individual tier celebration particle
  function createTierParticle(x, y, vx, vy, color, tier) {
    const particle = document.createElement('div');
    particle.style.position = 'fixed';
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    particle.style.width = '8px';
    particle.style.height = '8px';
    particle.style.backgroundColor = color;
    particle.style.borderRadius = '50%';
    particle.style.pointerEvents = 'none';
    particle.style.zIndex = '9999';
    particle.style.boxShadow = `0 0 10px ${color}`;
    
    // Add tier-specific effects
    if (tier >= 2) {
      particle.style.border = '2px solid rgba(255, 255, 255, 0.8)';
    }
    if (tier >= 3) {
      particle.style.animation = 'sparkle 1s ease-out forwards';
    }
    
    document.body.appendChild(particle);
    
    // Animate particle
    let opacity = 1;
    let scale = 1;
    const gravity = 0.1;
    let currentY = y;
    let currentX = x;
    
    const animate = () => {
      opacity -= 0.02;
      scale -= 0.01;
      vy += gravity;
      currentX += vx;
      currentY += vy;
      
      particle.style.opacity = opacity;
      particle.style.transform = `translate(${currentX - x}px, ${currentY - y}px) scale(${scale})`;
      
      if (opacity > 0 && scale > 0) {
        requestAnimationFrame(animate);
      } else {
        document.body.removeChild(particle);
      }
    };
    
    requestAnimationFrame(animate);
  }
  
  // Track active tier notifications to prevent duplicates
  const activeTierNotifications = new Map();
  
  // Show tier upgrade notification
  function showTierUpgradeNotification(propertyId, tier, propertyName) {
    // Remove any existing notification for this property
    if (activeTierNotifications.has(propertyId)) {
      const existingNotification = activeTierNotifications.get(propertyId);
      existingNotification.classList.remove('show');
      setTimeout(() => {
        if (existingNotification.parentNode) {
          existingNotification.remove();
        }
      }, 300);
      activeTierNotifications.delete(propertyId);
    }
    
    const notification = document.createElement('div');
    const tierClass = getTierClass(tier);
    const propertyIcon = PROPERTY_CONFIG[propertyId].icon;
    const tierInfo = getTierInfo(tier);
    
    notification.className = `market-event-notification tier-upgrade ${tierClass}`;
    
    // Apply dynamic tier colors
    const tierColor = tierInfo.color;
    const bgColor = tierInfo.bgColor.replace('0.4', '0.85');
    const borderColor = tierInfo.borderColor.replace('0.6', '0.3').replace('0.7', '0.3').replace('0.8', '0.3');
    
    notification.style.background = `linear-gradient(135deg, ${bgColor} 0%, ${bgColor.replace('0.85', '0.75')} 100%)`;
    notification.style.borderColor = borderColor;
    notification.style.boxShadow = `0 8px 32px ${tierColor}40`;
    
    const multiplier = getMultiplierText(tier);
    notification.innerHTML = `
      <div class="event-title">
        <i class="${propertyIcon}"></i>
        ${propertyName} reached ${getTierText(tier)} tier!
      </div>
      <div class="event-message">Rent income increased to ${multiplier}!</div>
    `;
    
    document.body.appendChild(notification);
    
    // Store reference to this notification
    activeTierNotifications.set(propertyId, notification);
    
    // Animate in
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Remove after 5 seconds
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
        activeTierNotifications.delete(propertyId);
      }, 300);
    }, 5000);
  }
  
  function getTierText(tier) {
    const tierInfo = getTierInfo(tier);
    return tierInfo.name.toLowerCase();
  }
  
  function getMultiplierText(tier) {
    let multiplier = Math.pow(2, tier);
    
    // Special handling for high-tier buildings
    if (tier === 25) {
      multiplier *= 100; // Multiply by 100 for Galactic tier
    } else if (tier === 20) {
      multiplier *= 10; // Multiply by 10 for Cosmic tier
    }
    
    return `${multiplier}x`;
  }
  
  function getTierClass(tier) {
    const tierInfo = getTierInfo(tier);
    return `tier-${tierInfo.name.toLowerCase().replace(/\s+/g, '-')}`;
  }

  window.renderAllProperties = function() {
    Object.keys(PROPERTY_CONFIG).forEach(propertyId => {
      renderPropertyUI(propertyId);
    });
    updateTotalRentDisplay();
    renderRentIncome(); // Update rent income display in earn panel
  }

  function getTotalPropertyIncome() {
    // Use enhanced cached value if valid, but not during earthquakes (to ensure real-time updates)
    if (!earthquakeActive()) {
      const cached = getCachedPropertyIncome();
      if (cached !== null && cached !== undefined && typeof cached === 'number') {
        return cached;
      }
    }
    
    // Calculate and cache the result
    let total = 0;
    let hasProperties = false;
    
    Object.keys(PROPERTY_CONFIG).forEach(propertyId => {
      const count = properties[propertyId];
      if (count > 0) {
        hasProperties = true;
        const income = getPropertyTotalIncome(propertyId);
        total += income;
      }
    });
    
    // Debug logging (only when there are properties but no income)
    if (hasProperties && total === 0) {
      console.log('WARNING: Properties owned but no income calculated');
      Object.keys(PROPERTY_CONFIG).forEach(propertyId => {
        const count = properties[propertyId];
        if (count > 0) {
          const income = getPropertyTotalIncome(propertyId);
          console.log(`Property ${propertyId}: ${count} owned, income: ${income}`);
        }
      });
    }
    
    // Apply earthquake rent reduction if active
    if (earthquakeActive() && earthquakeMagnitude() > 0) {
      let rentReduction = 0;
      if (earthquakeMagnitude() >= 4.0 && earthquakeMagnitude() < 5.0) {
        rentReduction = 0.15; // 15% reduction
      } else if (earthquakeMagnitude() >= 5.0 && earthquakeMagnitude() < 6.0) {
        rentReduction = 0.50; // 50% reduction
      } else if (earthquakeMagnitude() >= 6.0 && earthquakeMagnitude() < 7.0) {
        rentReduction = 0.75; // 75% reduction
      } else if (earthquakeMagnitude() >= 7.0 && earthquakeMagnitude() <= 8.0) {
        rentReduction = 1.00; // 100% reduction
      }
      total *= (1 - rentReduction);
      //console.log(`Earthquake active, rent reduction: ${rentReduction * 100}%, final income: ${total}`);
    }
    
    //console.log('Final total before caching:', total);
    setCachedPropertyIncome(total);
    //console.log('Returning total:', total);
    return total;
  }

  function updateTotalRentDisplay() {
    const totalRentElement = document.getElementById('totalRentPerSecond');
    if (!totalRentElement) return;
    
    const totalRent = getTotalPropertyIncome();
    const formattedRent = formatNumberShort(totalRent);
    totalRentElement.textContent = `€${formattedRent}/sec`;
    
    // Apply earthquake styling if active
    if (earthquakeActive()) {
      totalRentElement.style.color = '#dc2626';
      totalRentElement.style.fontWeight = 'bold';
    } else {
      // Reset to normal styling
      totalRentElement.style.color = '';
      totalRentElement.style.fontWeight = '';
    }
  }

  function updateClickStreak(isCritical = false) {
    const currentTime = Date.now();
    
    // Update streak - critical hits fill 3x more
    if (isCritical) {
      streakCount += 5; // Critical hits fill streak 3x faster
    } else {
      streakCount++; // Normal clicks fill streak normally
    }
    lastClickTime = currentTime;
    
    // Calculate streak multiplier (linear from 1 to 3)
    // Streak builds up over time, reaching max at around 50-60 clicks
    const maxStreakForMaxMultiplier = 60;
    const progress = Math.min(streakCount / maxStreakForMaxMultiplier, 1);
    streakMultiplier = 1 + (progress * (getMaxStreakMultiplier() - 1));
    
    // Check if max streak is reached
    if (streakMultiplier >= getMaxStreakMultiplier() && !maxStreakReached) {
      maxStreakReached = true;
    }
    
    
    // Update UI
    renderClickStreak();
  }

  function checkStreakTimeout() {
    const currentTime = Date.now();
    
    // Check if streak should be reset (more than 2 seconds since last click)
    if (lastClickTime > 0 && (currentTime - lastClickTime) > STREAK_TIMEOUT_MS) {
      streakCount = 0;
      streakMultiplier = 1;
      lastClickTime = 0; // Reset to prevent continuous checking
      renderClickStreak();
    }
  }

  function renderClickStreak() {
    if (!clickStreakSection || !streakMultiplierEl || !streakProgressFill || !streakProgressText) return;
    
    // Show/hide streak section based on upgrade ownership
    clickStreakSection.classList.toggle('hidden', !owned.u30);
    
    if (!owned.u30) return;
    
    // Update multiplier display
    streakMultiplierEl.textContent = `${streakMultiplier.toFixed(1)}x`;
    
    // Update progress bar
    const progress = ((streakMultiplier - 1) / (getMaxStreakMultiplier() - 1)) * 100;
    streakProgressFill.style.width = `${progress}%`;
    
    // Update progress text
    streakProgressText.textContent = `${getMaxStreakMultiplier().toFixed(1)}x`;
  }

  function checkAchievements() {
    let newAchievements = [];
    
    for (const [achievementId, achievement] of Object.entries(achievements)) {
      if (!achievement.unlocked && achievement.condition()) {
        achievement.unlocked = true;
        newAchievements.push(achievementId);
      }
    }
    
    if (newAchievements.length > 0) {
      renderAchievements();
      
      // Show banner only for achievements that haven't shown their banner yet
      for (const achievementId of newAchievements) {
        if (!achievementsBannerShown[achievementId]) {
          showAchievementBanner(achievementId);
          achievementsBannerShown[achievementId] = true; // Mark as shown
          break; // Only show one banner at a time
        }
      }
    }
  }

  // Performance-optimized achievement checking
  let lastAchievementCheck = 0;
  const ACHIEVEMENT_CHECK_INTERVAL = 4000; // Check every 4 seconds
  let achievementsBannerShown = {}; // Track which achievements have shown banners

  function checkAchievementsOptimized() {
    const now = Date.now();
    if (now - lastAchievementCheck < ACHIEVEMENT_CHECK_INTERVAL) {
      return; // Skip if called too frequently
    }
    lastAchievementCheck = now;
    checkAchievements();
  }

  // Simple achievement banner system
  function showAchievementBanner(achievementId) {
    const banner = document.getElementById('achievementBanner');
    const bannerName = document.getElementById('achievementBannerName');
    const bannerIcon = banner?.querySelector('.achievement-icon');
    
    if (!banner || !bannerName || !bannerIcon) return;
    
    // Get achievement data from HTML
    const achievementElement = document.querySelector(`[data-achievement-id="${achievementId}"]`);
    if (!achievementElement) return;
    
    const achievementIcon = achievementElement.querySelector('.achievement-icon').textContent;
    const achievementName = achievementElement.querySelector('.achievement-name').textContent;
    
    // Set the achievement icon and name
    bannerIcon.textContent = achievementIcon;
    bannerName.textContent = achievementName;
    
    // Show the banner
    banner.classList.remove('hidden');
    banner.classList.add('show');
    
    // Create achievement particle effects based on achievement type
    if (particleSystem) {
      const rect = banner.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Categorize achievements for different effects
      const milestoneAchievements = ['ach1', 'ach2', 'ach3', 'ach4', 'ach5']; // Money milestones
      const clickAchievements = ['ach6', 'ach7', 'ach8']; // Click-related achievements
      const rareAchievements = ['ach11', 'ach12']; // Rare/hard achievements
      const upgradeAchievements = ['ach9', 'ach10', 'ach13']; // Upgrade-related achievements
      const propertyAchievements = ['ach14', 'ach15', 'ach16', 'ach17', 'ach18']; // Property-related achievements
      
      if (particleEffectsEnabled) {
      if (milestoneAchievements.includes(achievementId)) {
        // Money milestone achievements - golden particles + fireworks
        particleSystem.createGoldenParticles(centerX, centerY, 13);
        particleSystem.createFireworkParticles(centerX, centerY, 15);
        screenFlash('#FFD700', 400); // Golden flash
        screenShake(6, 250); // Gentle shake
        
      } else if (clickAchievements.includes(achievementId)) {
        // Click achievements - sparkles + confetti
        particleSystem.createSparkleParticles(centerX, centerY, 10);
        particleSystem.createConfettiParticles(centerX, centerY, 13);
        screenFlash('#FFD700', 300); // Golden flash
        
      } else if (rareAchievements.includes(achievementId)) {
        // Rare achievements - multiple bursts + screen effects
        particleSystem.createRareAchievementParticles(centerX, centerY, 50);
        screenFlash('#9B59B6', 500); // Purple flash
        screenShake(10, 400); // Strong shake
        
      } else if (upgradeAchievements.includes(achievementId)) {
        // Upgrade achievements - upgrade particles + milestone particles
        particleSystem.createUpgradeParticles(centerX, centerY, 8);
        particleSystem.createMilestoneParticles(centerX, centerY, 10);
        screenFlash('#3498DB', 350); // Blue flash
        
      } else if (propertyAchievements.includes(achievementId)) {
        // Property achievements - building particles + money gain particles
        particleSystem.createUpgradeParticles(centerX, centerY, 12);
        particleSystem.createMoneyGainParticles(centerX, centerY, 0); // No money amount, just particles
        screenFlash('#32CD32', 500); // Green flash (property color)
        screenShake(4, 300); // Medium shake
        
      } else {
        // Default achievement effects
        particleSystem.createConfettiParticles(centerX, centerY, 10);
        particleSystem.createSparkleParticles(centerX, centerY, 4);
        particleSystem.createUpgradeParticles(centerX, centerY, 3);
        screenFlash('#2ECC71', 300); // Green flash
        }
      } else {
        // Screen effects only when particles are disabled
        if (milestoneAchievements.includes(achievementId)) {
          screenFlash('#FFD700', 400);
          screenShake(6, 250);
        } else if (clickAchievements.includes(achievementId)) {
          screenFlash('#FFD700', 300);
        } else if (rareAchievements.includes(achievementId)) {
          screenFlash('#9B59B6', 500);
          screenShake(10, 400);
        } else if (upgradeAchievements.includes(achievementId)) {
          screenFlash('#3498DB', 350);
        } else if (propertyAchievements.includes(achievementId)) {
          screenFlash('#32CD32', 500);
          screenShake(4, 300);
        } else {
          screenFlash('#2ECC71', 300);
        }
      }
    }
    
    // Play achievement sound
    AudioSystem.playAchievementSound();
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      banner.classList.remove('show');
      setTimeout(() => {
        banner.classList.add('hidden');
      }, 400);
    }, 3000);
  }

  function renderAchievements() {
    const achievementsSection = document.getElementById('achievementsSection');
    if (!achievementsSection) return;
    
    // Separate achievements into unlocked and locked
    const unlockedAchievements = [];
    const lockedAchievements = [];
    
    for (const [achievementId, achievement] of Object.entries(achievements)) {
      const achievementEl = document.querySelector(`[data-achievement-id="${achievementId}"]`);
      const statusEl = document.getElementById(`${achievementId}Status`);
      
      if (achievementEl && statusEl) {
        if (achievement.unlocked) {
          achievementEl.classList.add('unlocked');
          statusEl.textContent = '✅';
          unlockedAchievements.push(achievementEl);
        } else {
          achievementEl.classList.remove('unlocked');
          statusEl.textContent = '🔒';
          lockedAchievements.push(achievementEl);
        }
      }
    }
    
    // Reorder: locked achievements first, then unlocked achievements
    const reorderedAchievements = [...lockedAchievements, ...unlockedAchievements];
    
    // Clear the section and append in new order
    achievementsSection.innerHTML = '';
    reorderedAchievements.forEach(achievementEl => {
      achievementsSection.appendChild(achievementEl);
    });
  }


  
  // Tour system removed


  // Game state persistence functions
  function saveGameState() {
    try {
      // Save to cloud if user is signed in
      if (currentUser && isFirebaseReady) {
        saveToCloud();
      }
      
      const gameState = {
        // Core balances
        currentAccountBalance,
        investmentAccountBalance,
        
        // Upgrades owned
        owned: { ...owned },
        
        // Properties owned
        properties: { ...properties },
        
        // Event logs
        eventLogs: [...eventLogs],
        
        // Statistics
        totalDividendsReceived,
        hasMadeFirstInvestment,
        
        // Click streak system
        streakCount,
        streakMultiplier,
        
        // Prestige multipliers
        prestigeClickMultiplier,
        prestigeInterestMultiplier,
        
        // Prestige tier
        prestigeTier,
        
        // Auto-invest settings
        autoInvestEnabled,
        
        // Auto-rent settings
        autoRentEnabled,
        
        // Buy multiplier
        buyMultiplier,
        
        // Audio settings
        musicEnabled: AudioSystem.getAudioSettings().musicEnabled,
        soundEffectsEnabled: AudioSystem.getAudioSettings().soundEffectsEnabled,
        
        // Game difficulty
        gameDifficulty: getGameDifficulty(),
        
        // Achievement banner tracking
        achievementsBannerShown: { ...achievementsBannerShown },
        
        // Market events
        marketBoomActive: marketBoomActive(),
        marketCrashActive: marketCrashActive(),
        flashSaleActive: flashSaleActive(),
        greatDepressionActive: greatDepressionActive(),
        fastFingersActive: fastFingersActive(),
        earthquakeActive: earthquakeActive(),
        marketBoomEndTime: marketBoomEndTime(),
        marketCrashEndTime: marketCrashEndTime(),
        flashSaleEndTime: flashSaleEndTime(),
        greatDepressionEndTime: greatDepressionEndTime(),
        fastFingersEndTime: fastFingersEndTime(),
        earthquakeEndTime: earthquakeEndTime(),
        earthquakeMagnitude: earthquakeMagnitude(),
        eventCooldown,
        skipNextEventCheck,
        eventConfig: EVENT_CONFIG,
        
        // Save timestamp
        lastSaved: Date.now()
      };
      
      console.log('🔍 [OFFLINE DEBUG] Saving game state with timestamp:', gameState.lastSaved, new Date(gameState.lastSaved));
      localStorage.setItem('moneyClicker_gameState', JSON.stringify(gameState));
      console.log('Game state saved successfully');
    } catch (error) {
      console.warn('Could not save game state:', error);
    }
  }

  // Offline earnings system
  function calculateOfflineEarnings(lastSavedTime) {
    console.log('🔍 [OFFLINE DEBUG] calculateOfflineEarnings called');
    console.log('🔍 [OFFLINE DEBUG] lastSavedTime:', lastSavedTime, new Date(lastSavedTime));
    
    const now = Date.now();
    const timeOffline = now - lastSavedTime;
    console.log('🔍 [OFFLINE DEBUG] now:', now, new Date(now));
    console.log('🔍 [OFFLINE DEBUG] timeOffline:', timeOffline, 'ms (', Math.floor(timeOffline / 1000), 'seconds )');
    
    // Don't calculate if less than minimum offline time
    const minOfflineMs = GAME_CONFIG.OFFLINE_EARNINGS.MIN_OFFLINE_MINUTES * 60 * 1000;
    console.log('🔍 [OFFLINE DEBUG] minOfflineMs:', minOfflineMs, 'ms (', GAME_CONFIG.OFFLINE_EARNINGS.MIN_OFFLINE_MINUTES, 'minutes )');
    
    if (timeOffline < minOfflineMs) {
      console.log('🔍 [OFFLINE DEBUG] Time offline too short, returning null');
      return null;
    }
    
    // Cap offline earnings to prevent abuse
    const maxOfflineMs = GAME_CONFIG.OFFLINE_EARNINGS.MAX_OFFLINE_HOURS * 60 * 60 * 1000;
    const cappedTimeOffline = Math.min(timeOffline, maxOfflineMs);
    console.log('🔍 [OFFLINE DEBUG] maxOfflineMs:', maxOfflineMs, 'ms (', GAME_CONFIG.OFFLINE_EARNINGS.MAX_OFFLINE_HOURS, 'hours )');
    console.log('🔍 [OFFLINE DEBUG] cappedTimeOffline:', cappedTimeOffline, 'ms');
    
    // Calculate offline time in seconds (using capped time for calculations)
    const secondsOffline = Math.floor(cappedTimeOffline / 1000);
    const actualSecondsOffline = Math.floor(timeOffline / 1000);
    console.log('🔍 [OFFLINE DEBUG] secondsOffline (capped):', secondsOffline);
    console.log('🔍 [OFFLINE DEBUG] actualSecondsOffline:', actualSecondsOffline);
    
    // Calculate property income per second (force fresh calculation for offline earnings)
    // Temporarily invalidate cache to ensure fresh calculation
    const originalCacheValid = propertyIncomeCacheValid;
    propertyIncomeCacheValid = false;
    const propertyIncomePerSecond = getTotalPropertyIncome();
    propertyIncomeCacheValid = originalCacheValid; // Restore original state
    console.log('🔍 [OFFLINE DEBUG] propertyIncomePerSecond:', propertyIncomePerSecond);
    
    // Debug: Check if we have any properties
    let totalProperties = 0;
    Object.keys(PROPERTY_CONFIG).forEach(propertyId => {
      const count = properties[propertyId];
      if (count > 0) {
        totalProperties += count;
        console.log(`🔍 [OFFLINE DEBUG] Property ${propertyId}: ${count} owned`);
      }
    });
    console.log('🔍 [OFFLINE DEBUG] Total properties owned:', totalProperties);
    
    // Calculate total property income while offline
    const totalPropertyIncome = propertyIncomePerSecond * secondsOffline;
    console.log('🔍 [OFFLINE DEBUG] totalPropertyIncome:', totalPropertyIncome);
    
    // Calculate investment compound interest while offline
    let totalInvestmentIncome = 0;
    console.log('🔍 [OFFLINE DEBUG] investmentAccountBalance:', investmentAccountBalance);
    if (investmentAccountBalance > 0) {
      // Calculate compound interest using simple multiplication instead of exponential
      // Online: investmentAccountBalance *= getCompoundMultiplierPerTick() every second
      // Offline: apply growth rate directly without compounding to prevent exponential explosion
      const perSecondMultiplier = getCompoundMultiplierPerTick();
      const growthRate = perSecondMultiplier - 1; // Convert multiplier to growth rate
      const totalGrowth = growthRate * secondsOffline; // Linear growth over time
      const newBalance = investmentAccountBalance * (1 + totalGrowth);
      totalInvestmentIncome = newBalance - investmentAccountBalance;
      console.log('🔍 [OFFLINE DEBUG] perSecondMultiplier:', perSecondMultiplier);
      console.log('🔍 [OFFLINE DEBUG] growthRate:', growthRate);
      console.log('🔍 [OFFLINE DEBUG] secondsOffline:', secondsOffline);
      console.log('🔍 [OFFLINE DEBUG] totalGrowth:', totalGrowth);
      console.log('🔍 [OFFLINE DEBUG] newBalance:', newBalance);
      console.log('🔍 [OFFLINE DEBUG] totalInvestmentIncome:', totalInvestmentIncome);
    }
    
    // Calculate dividend income while offline (if dividend upgrade u10 is owned)
    let totalDividendIncome = 0;
    console.log('🔍 [OFFLINE DEBUG] owned.u10 (dividend upgrade):', owned.u10);
    if (owned.u10) {
      // Calculate dividend payout using the same logic as tickDividends
      const speedMultiplier = 1 - getUpgradeEffectTotal('dividend_speed');
      let rateMultiplier = getUpgradeEffectMultiplier('dividend_rate');
      
      // Apply prestige multiplier to dividend rate
      // rateMultiplier *= prestigeInterestMultiplier; // Commented out for balance - prestige should not affect rates
      
      // Market event effects on dividend rate
      let marketRateMultiplier = 1;
      if (marketBoomActive()) {
        marketRateMultiplier = 1.5; // +50% during boom
      } else if (marketCrashActive()) {
        marketRateMultiplier = 0.3; // -70% during crash
      } else if (greatDepressionActive()) {
        marketRateMultiplier = 0; // No dividends during depression
      }
      
      const interval = Math.floor(BASE_DIVIDEND_INTERVAL_MS * speedMultiplier);
      const rate = BASE_DIVIDEND_RATE * rateMultiplier * marketRateMultiplier;
      
      // Calculate how many dividend payouts would occur during offline time
      const dividendPayouts = Math.floor((secondsOffline * 1000) / interval);
      totalDividendIncome = dividendPayouts * (investmentAccountBalance * rate);
      
      console.log('🔍 [OFFLINE DEBUG] dividend calculation:');
      console.log('🔍 [OFFLINE DEBUG] - speedMultiplier:', speedMultiplier);
      console.log('🔍 [OFFLINE DEBUG] - rateMultiplier:', rateMultiplier);
      console.log('🔍 [OFFLINE DEBUG] - marketRateMultiplier:', marketRateMultiplier);
      console.log('🔍 [OFFLINE DEBUG] - interval:', interval, 'ms');
      console.log('🔍 [OFFLINE DEBUG] - rate:', rate);
      console.log('🔍 [OFFLINE DEBUG] - dividendPayouts:', dividendPayouts);
      console.log('🔍 [OFFLINE DEBUG] - totalDividendIncome:', totalDividendIncome);
    }
    
    // Safety check for Infinity values
    const safeInvestmentIncome = isFinite(totalInvestmentIncome) ? totalInvestmentIncome : 0;
    const safeDividendIncome = isFinite(totalDividendIncome) ? totalDividendIncome : 0;
    
    // Apply reduction to offline earnings (configurable in config.js)
    const OFFLINE_EARNINGS_REDUCTION = GAME_CONFIG.OFFLINE_EARNINGS.REDUCTION_FACTOR;
    const reducedPropertyIncome = totalPropertyIncome * OFFLINE_EARNINGS_REDUCTION;
    const reducedInvestmentIncome = safeInvestmentIncome * OFFLINE_EARNINGS_REDUCTION;
    const reducedDividendIncome = safeDividendIncome * OFFLINE_EARNINGS_REDUCTION;
    const totalIncome = reducedPropertyIncome + reducedInvestmentIncome + reducedDividendIncome;
    const wasCapped = timeOffline > maxOfflineMs;
    
    console.log('🔍 [OFFLINE DEBUG] FINAL CALCULATION:');
    console.log('🔍 [OFFLINE DEBUG] - totalPropertyIncome (raw):', totalPropertyIncome);
    console.log('🔍 [OFFLINE DEBUG] - totalInvestmentIncome (raw):', totalInvestmentIncome);
    console.log('🔍 [OFFLINE DEBUG] - totalDividendIncome (raw):', totalDividendIncome);
    console.log('🔍 [OFFLINE DEBUG] - OFFLINE_EARNINGS_REDUCTION:', OFFLINE_EARNINGS_REDUCTION);
    console.log('🔍 [OFFLINE DEBUG] - reducedPropertyIncome:', reducedPropertyIncome);
    console.log('🔍 [OFFLINE DEBUG] - reducedInvestmentIncome:', reducedInvestmentIncome);
    console.log('🔍 [OFFLINE DEBUG] - reducedDividendIncome:', reducedDividendIncome);
    console.log('🔍 [OFFLINE DEBUG] - totalIncome (reduced):', totalIncome);
    console.log('🔍 [OFFLINE DEBUG] - wasCapped:', wasCapped);
    
    return {
      timeOffline,
      secondsOffline: actualSecondsOffline, // Use actual time for display
      propertyIncome: reducedPropertyIncome,
      investmentIncome: reducedInvestmentIncome,
      dividendIncome: reducedDividendIncome,
      totalIncome: totalIncome,
      wasCapped: wasCapped
    };
  }
  
  function getInterestRate() {
    // Convert per-tick multiplier to hourly percentage rate (more reasonable for offline calculations)
    const perTickMultiplier = getCompoundMultiplierPerTick();
    const perSecondMultiplier = Math.pow(perTickMultiplier, 1000 / TICK_MS);
    const hourlyMultiplier = Math.pow(perSecondMultiplier, 3600); // 1 hour = 3600 seconds
    const hourlyRate = (hourlyMultiplier - 1) * 100;
    
    console.log('🔍 [OFFLINE DEBUG] getInterestRate calculation:');
    console.log('🔍 [OFFLINE DEBUG] - perTickMultiplier:', perTickMultiplier);
    console.log('🔍 [OFFLINE DEBUG] - perSecondMultiplier:', perSecondMultiplier);
    console.log('🔍 [OFFLINE DEBUG] - hourlyMultiplier:', hourlyMultiplier);
    console.log('🔍 [OFFLINE DEBUG] - hourlyRate:', hourlyRate);
    
    return hourlyRate;
  }
  
  function hasDividendUpgrades() {
    // Check if any dividend-related upgrades are owned
    return Object.keys(owned).some(key => 
      key.startsWith('u') && UPGRADE_CONFIG[key] && 
      (UPGRADE_CONFIG[key].type === 'dividend_boost' || 
       UPGRADE_CONFIG[key].type === 'dividend_rate')
    );
  }
  
  function getDividendRate() {
    let totalRate = 0;
    Object.keys(owned).forEach(key => {
      if (UPGRADE_CONFIG[key] && UPGRADE_CONFIG[key].type === 'dividend_rate') {
        totalRate += UPGRADE_CONFIG[key].value || 0;
      }
    });
    return totalRate;
  }
  
  function formatOfflineTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  }
  
  function showOfflineEarningsPopup(offlineData) {
    console.log('🔍 [OFFLINE DEBUG] showOfflineEarningsPopup called with:', offlineData);
    
    // Check if popup already exists to prevent multiple popups
    const existingPopup = document.querySelector('.offline-earnings-popup');
    if (existingPopup) {
      console.log('🔍 [OFFLINE DEBUG] Offline earnings popup already exists, skipping...');
      return;
    }
    
    const popup = document.createElement('div');
    popup.className = 'offline-earnings-popup';
    popup.innerHTML = `
      <div class="offline-earnings-content">
        <div class="offline-earnings-header">
          <h3>💰 Welcome Back!</h3>
          <p>You were offline for <strong>${formatOfflineTime(offlineData.secondsOffline)}</strong></p>
          ${offlineData.wasCapped ? `<p class="capped-notice">⚠️ Earnings capped at ${GAME_CONFIG.OFFLINE_EARNINGS.MAX_OFFLINE_HOURS} hour${GAME_CONFIG.OFFLINE_EARNINGS.MAX_OFFLINE_HOURS !== 1 ? 's' : ''} maximum</p>` : ''}
        </div>
        <div class="offline-earnings-breakdown">
          <div class="earnings-item">
            <span class="earnings-label">🏠 Property Income:</span>
            <span class="earnings-amount">€${formatNumberShort(offlineData.propertyIncome)}</span>
          </div>
          ${offlineData.investmentIncome > 0 ? `
          <div class="earnings-item">
            <span class="earnings-label">📈 Investment Growth:</span>
            <span class="earnings-amount">€${formatNumberShort(offlineData.investmentIncome)}</span>
          </div>
          ` : ''}
          ${offlineData.dividendIncome > 0 ? `
          <div class="earnings-item">
            <span class="earnings-label">💎 Dividends:</span>
            <span class="earnings-amount">€${formatNumberShort(offlineData.dividendIncome)}</span>
          </div>
          ` : ''}
          <div class="earnings-total">
            <span class="earnings-label">💰 Total Earned:</span>
            <span class="earnings-amount">€${formatNumberShort(offlineData.totalIncome)}</span>
          </div>
        </div>
        <div class="offline-earnings-actions">
          <button class="offline-earnings-claim" id="offlineClaimButton" onclick="claimOfflineEarnings()">Claim Earnings</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(popup);
    
    // Animate in
    setTimeout(() => popup.classList.add('show'), 100);
    
    // Claim button is now visible immediately
    
    // Store reference for claiming
    window.currentOfflineEarnings = offlineData;
    
    // Add event listener as backup in case onclick doesn't work
    setTimeout(() => {
      const claimButton = document.getElementById('offlineClaimButton');
      if (claimButton) {
        claimButton.addEventListener('click', function(e) {
          e.preventDefault();
          console.log('🔍 [OFFLINE DEBUG] Button clicked via event listener');
          
          // Visual feedback
          this.style.opacity = '0.7';
          this.textContent = 'Claiming...';
          
          setTimeout(() => {
            claimOfflineEarnings();
          }, 100);
        });
      }
    }, 200);
  }
  
  function claimOfflineEarnings() {
    console.log('🔍 [OFFLINE DEBUG] claimOfflineEarnings called');
    console.log('🔍 [OFFLINE DEBUG] - currentOfflineEarnings:', window.currentOfflineEarnings);
    console.log('🔍 [OFFLINE DEBUG] - offlineEarningsClaimed:', window.offlineEarningsClaimed);
    
    if (!window.currentOfflineEarnings) {
      console.log('🔍 [OFFLINE DEBUG] No offline earnings to claim');
      return;
    }
    
    // Allow multiple claims - removed restriction to prevent game getting stuck
    const earnings = window.currentOfflineEarnings;
    
    console.log('🔍 [OFFLINE DEBUG] Claiming earnings - distributing to appropriate accounts:');
    console.log('🔍 [OFFLINE DEBUG] - propertyIncome:', earnings.propertyIncome);
    console.log('🔍 [OFFLINE DEBUG] - investmentIncome:', earnings.investmentIncome);
    console.log('🔍 [OFFLINE DEBUG] - dividendIncome:', earnings.dividendIncome);
    console.log('🔍 [OFFLINE DEBUG] - totalIncome:', earnings.totalIncome);
    
    // Distribute earnings to appropriate accounts
    currentAccountBalance += earnings.propertyIncome; // Property income goes to current account
    investmentAccountBalance += earnings.investmentIncome; // Investment interest goes to investment account
    
    // Dividend income also goes to current account (as it does online)
    currentAccountBalance += earnings.dividendIncome;
    
    // Update UI
    renderBalances();
    renderInvestmentUnlocked();
    
    // Play success sound
    if (AudioSystem.getAudioSettings().soundEnabled) {
      AudioSystem.playSuccessSound();
    }
    
    // Close popup
    closeOfflineEarningsPopup();
    
    // Save game state
    saveGameState();
    
    console.log('Offline earnings claimed:', earnings);
  }
  
  function closeOfflineEarningsPopup() {
    const popup = document.querySelector('.offline-earnings-popup');
    if (popup) {
      popup.classList.remove('show');
      setTimeout(() => {
        if (popup.parentNode) {
          popup.remove();
        }
      }, 300);
    }
    window.currentOfflineEarnings = null;
  }

  function loadGameState() {
    try {
      const saved = localStorage.getItem('moneyClicker_gameState');
      if (saved) {
        const gameState = JSON.parse(saved);
        
        // Restore core balances
        currentAccountBalance = gameState.currentAccountBalance || 0;
        investmentAccountBalance = gameState.investmentAccountBalance || 0;
        
        // Restore upgrades
        if (gameState.owned) {
          Object.keys(gameState.owned).forEach(key => {
            if (owned.hasOwnProperty(key)) {
              owned[key] = gameState.owned[key];
            }
          });
        }
        
        // Restore properties
        if (gameState.properties) {
          Object.keys(gameState.properties).forEach(key => {
            if (properties.hasOwnProperty(key)) {
              properties[key] = gameState.properties[key];
            }
          });
        }
        
        // Restore event logs
        if (gameState.eventLogs) {
          eventLogs = [...gameState.eventLogs];
        }
        
        // Restore statistics
        totalDividendsReceived = gameState.totalDividendsReceived || 0;
        hasMadeFirstInvestment = gameState.hasMadeFirstInvestment || false;
        
        // Click streak should reset on game load - not restored from save
        streakCount = 0;
        streakMultiplier = 1;
        
        // Restore prestige multipliers and tier
        console.log('Loading game state - prestige multipliers:', {
          saved_click: gameState.prestigeClickMultiplier,
          saved_interest: gameState.prestigeInterestMultiplier,
          saved_tier: gameState.prestigeTier,
          before_click: prestigeClickMultiplier,
          before_interest: prestigeInterestMultiplier,
          before_tier: prestigeTier
        });
        prestigeClickMultiplier = gameState.prestigeClickMultiplier || 1;
        prestigeInterestMultiplier = gameState.prestigeInterestMultiplier || 1;
        prestigeTier = gameState.prestigeTier || 0;
        console.log('After loading - prestige multipliers:', {
          click: prestigeClickMultiplier,
          interest: prestigeInterestMultiplier
        });
        
        // Restore auto-invest
        autoInvestEnabled = gameState.autoInvestEnabled || false;
        
        // Update auto-invest toggle UI
        if (autoInvestToggle) {
          autoInvestToggle.checked = autoInvestEnabled;
        }
        
        // Restore auto-rent
        autoRentEnabled = gameState.autoRentEnabled || false;
        
        // Update auto-rent toggle UI
        if (autoRentToggle) {
          autoRentToggle.checked = autoRentEnabled;
        }
        
        // Restore buy multiplier
        buyMultiplier = gameState.buyMultiplier || 1;
        
        // Restore audio settings
        AudioSystem.setMusicEnabled(gameState.musicEnabled !== undefined ? gameState.musicEnabled : true);
        AudioSystem.setSoundEffectsEnabled(gameState.soundEffectsEnabled !== undefined ? gameState.soundEffectsEnabled : true);
        
        // Restore game difficulty
        setGameDifficulty(gameState.gameDifficulty || DIFFICULTY_MODES.NORMAL);
        
        // Update difficulty selector UI
        if (difficultySelect) {
          difficultySelect.value = getGameDifficulty();
        }
        
        // Restore achievement banner tracking
        achievementsBannerShown = gameState.achievementsBannerShown || {};
        
        // Restore market events
        setMarketBoomActive(gameState.marketBoomActive || false);
        setMarketCrashActive(gameState.marketCrashActive || false);
        setFlashSaleActive(gameState.flashSaleActive || false);
        setGreatDepressionActive(gameState.greatDepressionActive || false);
        setFastFingersActive(gameState.fastFingersActive || false);
        setEarthquakeActive(gameState.earthquakeActive || false);
        setMarketBoomEndTime(gameState.marketBoomEndTime || 0);
        setMarketCrashEndTime(gameState.marketCrashEndTime || 0);
        setFlashSaleEndTime(gameState.flashSaleEndTime || 0);
        setGreatDepressionEndTime(gameState.greatDepressionEndTime || 0);
        setFastFingersEndTime(gameState.fastFingersEndTime || 0);
        setEarthquakeEndTime(gameState.earthquakeEndTime || 0);
        setEarthquakeMagnitude(gameState.earthquakeMagnitude || 0);
        eventCooldown = gameState.eventCooldown || 0;
        skipNextEventCheck = gameState.skipNextEventCheck || false;
        
        // Restore event configuration
        if (gameState.eventConfig) {
          Object.assign(GAME_CONFIG.EVENT_CONFIG.eventCooldowns, gameState.eventConfig.eventCooldowns || {});
        }
        
        // Update interest rate color if market event is active
        updateInterestRateColor();
        
        // Update Flash Sale styling if active
        if (flashSaleActive()) {
          const upgradesSection = document.getElementById('upgradesSection');
          if (upgradesSection) {
            upgradesSection.classList.add('flash-sale-active');
          }
        }
        
        console.log('Game state loaded successfully');
        
        // Update UI after loading state
    // Initialize upgrade visibility state before rendering
    initUpgradeVisibility();
    updateToggleCompletedUI();
    
    renderBalances();
    renderUpgradesOwned();
    renderUpgradePrices();
    // Apply upgrade visibility rules now that hide-completed class is set
    // Use requestAnimationFrame to ensure DOM is fully rendered
    requestAnimationFrame(() => {
      sortUpgradesByCost();
    });
    renderInvestmentUnlocked();
    renderInterestPerSecond();
    renderAutoInvestSection();
    renderEventLogs();
    updateUpgradeIndicator();
    updatePortfolioIndicator();
        
        // Apply audio settings after loading game state
        applyAudioSettings();
        
        // Check for offline earnings
        console.log('🔍 [OFFLINE DEBUG] Checking for offline earnings...');
        console.log('🔍 [OFFLINE DEBUG] gameState.lastSaved:', gameState.lastSaved);
        if (gameState.lastSaved) {
          console.log('🔍 [OFFLINE DEBUG] lastSaved exists, calling calculateOfflineEarnings...');
          const offlineEarnings = calculateOfflineEarnings(gameState.lastSaved);
          console.log('🔍 [OFFLINE DEBUG] calculateOfflineEarnings returned:', offlineEarnings);
          if (offlineEarnings && offlineEarnings.totalIncome > 0) {
            console.log('🔍 [OFFLINE DEBUG] Valid offline earnings found, showing popup in 1 second...');
            // Show offline earnings popup after a short delay to ensure UI is ready
            setTimeout(() => {
              console.log('🔍 [OFFLINE DEBUG] Showing offline earnings popup now...');
              showOfflineEarningsPopup(offlineEarnings);
            }, 1000);
          } else {
            console.log('🔍 [OFFLINE DEBUG] No valid offline earnings (null or totalIncome <= 0)');
          }
        } else {
          console.log('🔍 [OFFLINE DEBUG] No lastSaved timestamp found in game state');
        }
        
        return true;
      }
    } catch (error) {
      console.warn('Could not load game state:', error);
    }
    return false;
  }

  // Function to reset all game data
  function resetGameState() {
    try {
      localStorage.removeItem('moneyClicker_gameState');
      
      // Reset achievement banner tracking
      achievementsBannerShown = {};
      
    // Reset prestige multipliers
    console.log('Resetting prestige multipliers to 1');
    prestigeClickMultiplier = 1;
    prestigeInterestMultiplier = 1;
    prestigeTier = 0;
      
      // Reset first investment tracking
      hasMadeFirstInvestment = false;
      
      // Reset market events
      setMarketBoomActive(false);
      setMarketCrashActive(false);
      setFlashSaleActive(false);
      setGreatDepressionActive(false);
      setFastFingersActive(false);
      setEarthquakeActive(false);
      setMarketBoomEndTime(0);
      setMarketCrashEndTime(0);
      setFlashSaleEndTime(0);
      setGreatDepressionEndTime(0);
      setFastFingersEndTime(0);
      setEarthquakeEndTime(0);
      setEarthquakeMagnitude(0);
      eventCooldown = 0;
      skipNextEventCheck = false;
      
      // Reset event cooldowns
      GAME_CONFIG.EVENT_CONFIG.eventCooldowns.marketBoom = 0;
      GAME_CONFIG.EVENT_CONFIG.eventCooldowns.marketCrash = 0;
      GAME_CONFIG.EVENT_CONFIG.eventCooldowns.flashSale = 0;
      GAME_CONFIG.EVENT_CONFIG.eventCooldowns.greatDepression = 0;
      GAME_CONFIG.EVENT_CONFIG.eventCooldowns.fastFingers = 0;
      GAME_CONFIG.EVENT_CONFIG.eventCooldowns.taxCollection = 0;
      GAME_CONFIG.EVENT_CONFIG.eventCooldowns.robbery = 0;
      GAME_CONFIG.EVENT_CONFIG.eventCooldowns.divorce = 0;
      GAME_CONFIG.EVENT_CONFIG.eventCooldowns.earthquake = 0;
      
      // Reset properties
      Object.keys(properties).forEach(propertyKey => {
        properties[propertyKey] = 0;
      });
      
      // Net worth chart data reset removed for performance
      
      console.log('All game data has been reset. Refresh the page to start fresh.');
    } catch (error) {
      console.warn('Could not reset game state:', error);
    }
  }

  // Make functions available globally for debugging
  window.saveGameState = saveGameState;
  window.loadGameState = loadGameState;
  window.resetGameState = resetGameState;
  
  // Manual property update function for debugging
  window.forceUpdateProperties = function() {
    renderAllProperties();
  };
  
  // Make offline earnings functions globally available
  window.claimOfflineEarnings = claimOfflineEarnings;
  window.closeOfflineEarningsPopup = closeOfflineEarningsPopup;
  
  // Manual reset function for stuck popups
  window.resetOfflineEarningsPopup = function() {
    console.log('🔍 [OFFLINE DEBUG] Manually resetting offline earnings popup');
    window.currentOfflineEarnings = null;
    const popup = document.querySelector('.offline-earnings-popup');
    if (popup) {
      popup.remove();
    }
  };

  // Hard Reset functionality
  function performHardReset() {
    // Show custom modal
    const modal = document.getElementById('hardResetModal');
    if (modal) {
      modal.classList.remove('hidden');
    }
  }

  function executeHardReset() {
    // Hide modal
    const modal = document.getElementById('hardResetModal');
    if (modal) {
      modal.classList.add('hidden');
    }
    
    // Perform the reset
    resetGameState();
    
    // Reset all game variables to initial state
    currentAccountBalance = 0;
    investmentAccountBalance = 0;
    totalDividendsReceived = 0;
    streakCount = 0;
    streakMultiplier = 1;
    autoInvestEnabled = false;
    autoRentEnabled = false;
    prestigeTier = 0;
    
    // Reset all upgrades
    Object.keys(owned).forEach(upgradeKey => {
      owned[upgradeKey] = false;
    });
    
    // Reset all properties to initial state
    Object.keys(properties).forEach(propertyKey => {
      properties[propertyKey] = 0;
    });
    
    // Reset audio settings to defaults
    AudioSystem.setMusicEnabled(true);
    AudioSystem.setSoundEffectsEnabled(true);
    
    // Save the reset state before reloading
    saveGameState();
    
    // Refresh the page to start fresh
    window.location.reload();
  }

  function cancelHardReset() {
    // Hide modal
    const modal = document.getElementById('hardResetModal');
    if (modal) {
      modal.classList.add('hidden');
    }
  }
  
  

  // Leaderboard functions - Firebase Realtime Database
  async function loadLeaderboard() {
    try {
      // Add timestamp to prevent caching issues
      const response = await fetch(`${FIREBASE_CONFIG.databaseURL}/leaderboard.json?t=${Date.now()}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Firebase error response:', errorText);
        throw new Error(`Failed to load leaderboard: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      
      if (data && Object.keys(data).length > 0) {
        // Convert Firebase object to array and sort by tier first, then score (highest first)
        leaderboardData = Object.values(data)
          .sort((a, b) => {
            const tierA = a.prestigeTier || 0;
            const tierB = b.prestigeTier || 0;
            
            // First compare by tier (higher tier wins)
            if (tierA !== tierB) {
              return tierB - tierA;
            }
            
            // If tiers are equal, compare by score (higher score wins)
            return b.score - a.score;
          })
          .slice(0, 50); // Take top 50
      } else {
        leaderboardData = [];
      }
      
      renderLeaderboard();
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      document.getElementById('leaderboardContent').innerHTML = 
        '<div class="leaderboard-loading">Failed to load leaderboard</div>';
    }
  }

  function renderLeaderboard() {
    const content = document.getElementById('leaderboardContent');
    if (!content) return;

    if (leaderboardData.length === 0) {
      content.innerHTML = '<div class="leaderboard-loading">No scores yet. Be the first!</div>';
      return;
    }

    // Sort by prestige tier first (highest first), then by score (highest first)
    const sortedData = [...leaderboardData].sort((a, b) => {
      const tierA = a.prestigeTier || 0;
      const tierB = b.prestigeTier || 0;
      
      // First compare by tier (higher tier wins)
      if (tierA !== tierB) {
        return tierB - tierA;
      }
      
      // If tiers are equal, compare by score (higher score wins)
      return b.score - a.score;
    });
    
    // Show top 10
    const top10 = sortedData.slice(0, 10);
    
    content.innerHTML = top10.map((entry, index) => {
      const rank = index + 1;
      const rankClass = rank <= 3 ? 'top-3' : '';
      const formattedScore = formatNumberShort(entry.score);
      
      // Use display name if available, otherwise fall back to name
      const displayName = entry.displayName || entry.name;
      const avatar = entry.photoURL ? 
        `<img src="${entry.photoURL}" alt="${displayName}" class="leaderboard-avatar" onerror="this.style.display='none'" onload="this.style.display='block'">` : '';
      
      // Add prestige tier display if available
      const prestigeDisplay = entry.prestigeTier && entry.prestigeTier > 0 ? 
        `<span class="leaderboard-prestige">${getPrestigeTierName(entry.prestigeTier)}</span>` : '';
      
      return `
        <div class="leaderboard-entry">
          <span class="leaderboard-rank ${rankClass}">#${rank}</span>
          <div class="leaderboard-user">
            ${avatar}
            <span class="leaderboard-name">${displayName}</span>
            ${prestigeDisplay}
          </div>
          <span class="leaderboard-score">€${formattedScore}</span>
        </div>
      `;
    }).join('');
  }

  async function submitScore() {
    const submitBtn = document.getElementById('submitScoreBtn');
    
    // Check if user is authenticated with Google
    if (!currentUser) {
      alert('Please sign in with Google first to submit your score!');
      return;
    }

    // Use Google user's display name or email as username
    const userDisplayName = currentUser.displayName || currentUser.email || 'Anonymous';
    const sanitizedName = userDisplayName.replace(/[^a-zA-Z0-9\s]/g, '').substring(0, 20);
    if (sanitizedName.length < 2) {
      alert('Unable to get valid username from Google account. Please try signing in again.');
      return;
    }

    // Calculate current net worth as score
    const currentBalance = currentAccountBalance;
    const investmentBalance = investmentAccountBalance;
    const propertyValue = calculateTotalPropertyValue();
    const score = currentBalance + investmentBalance + propertyValue;

    // Validate score
    if (score < 1000) {
      alert('You need at least €1,000 to submit a score');
      return;
    }

    // Prevent unrealistic scores (cap at reasonable limit)
    if (score > 1000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000) { // 999zz (999 * 10^27)
      alert('Score too high - please play the game fairly');
      return;
    }

    // Configurable cooldown between submissions
    const lastSubmission = localStorage.getItem('lastScoreSubmission');
    const now = Date.now();
    const cooldownPeriod = GAME_CONFIG.LEADERBOARD_CONFIG.SUBMISSION_COOLDOWN; // Use config value
    
    if (lastSubmission && (now - parseInt(lastSubmission)) < cooldownPeriod) {
      const remainingTime = Math.ceil((cooldownPeriod - (now - parseInt(lastSubmission))) / 1000);
      const minutes = Math.floor(remainingTime / 60);
      const seconds = remainingTime % 60;
      alert(`Please wait ${minutes}:${seconds.toString().padStart(2, '0')} before submitting again.`);
      return;
    }

    // Disable button during submission
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    try {
      // Check if this user already has a score in leaderboard
      const existingResponse = await fetch(`${FIREBASE_CONFIG.databaseURL}/leaderboard.json`);
      let existingEntryKey = null;
      if (existingResponse.ok) {
        const existingData = await existingResponse.json();
        if (existingData) {
          // Look for existing entry by UID
          for (const [key, entry] of Object.entries(existingData)) {
            if (entry.uid === currentUser.uid) {
              existingEntryKey = key;
              break;
            }
          }
        }
      }

      // Create new score entry with validation
      const newEntry = {
        name: sanitizedName,
        displayName: currentUser.displayName || null,
        email: currentUser.email || null,
        photoURL: currentUser.photoURL || null,
        uid: currentUser.uid, // Unique user identifier
        score: Math.round(score), // Ensure integer score
        prestigeTier: prestigeTier || 0, // Include prestige tier
        timestamp: now,
        version: '1.0', // For future validation
        browserFingerprint: generateBrowserFingerprint() // For duplicate detection
      };

      // Use existing key if updating, or create new key if inserting
      const playerKey = existingEntryKey || `${currentUser.uid}_${now}`;

      // Submit to Firebase (PUT will update existing or create new)
      const response = await fetch(`${FIREBASE_CONFIG.databaseURL}/leaderboard/${playerKey}.json`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newEntry)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to submit score: ${response.status} ${errorText}`);
      }

      // Update submission tracking
      localStorage.setItem('lastScoreSubmission', now.toString());
      localStorage.setItem('playerUID', currentUser.uid); // Remember the user's UID

      // Reload leaderboard to get updated data
      await loadLeaderboard();
      
      // Show success message
      const isUpdate = existingEntryKey !== null;
      submitBtn.textContent = isUpdate ? 'Score Updated!' : 'Submitted!';
      setTimeout(() => {
        submitBtn.textContent = 'Submit Score';
        submitBtn.disabled = false;
      }, 2000);

    } catch (error) {
      console.error('Error submitting score:', error);
      alert('Failed to submit score. Please try again.');
      submitBtn.textContent = 'Submit Score';
      submitBtn.disabled = false;
    }
  }

  // Auto-submit functionality
  async function autoSubmitScore() {
    // Only auto-submit if user is authenticated
    if (!currentUser) {
      return;
    }

    // Calculate current score
    const currentBalance = currentAccountBalance;
    const investmentBalance = investmentAccountBalance;
    const propertyValue = calculateTotalPropertyValue();
    const score = currentBalance + investmentBalance + propertyValue;

    // Only auto-submit if score is meaningful (at least €1,000)
    if (score < 1000) {
      return;
    }

    // Check cooldown (same as manual submission)
    const lastSubmission = localStorage.getItem('lastScoreSubmission');
    const now = Date.now();
    const cooldownPeriod = 30 * 1000; // 30 seconds in milliseconds
    
    if (lastSubmission && (now - parseInt(lastSubmission)) < cooldownPeriod) {
      return; // Still in cooldown, skip this auto-submit
    }

    // Use Google user's display name or email as username
    const userDisplayName = currentUser.displayName || currentUser.email || 'Anonymous';
    const sanitizedName = userDisplayName.replace(/[^a-zA-Z0-9\s]/g, '').substring(0, 20);
    if (sanitizedName.length < 2) {
      return; // Invalid username, skip
    }

    try {
      // Check if this user already has a score in leaderboard
      const existingResponse = await fetch(`${FIREBASE_CONFIG.databaseURL}/leaderboard.json`);
      let existingEntryKey = null;
      if (existingResponse.ok) {
        const existingData = await existingResponse.json();
        if (existingData) {
          // Look for existing entry by UID
          for (const [key, entry] of Object.entries(existingData)) {
            if (entry.uid === currentUser.uid) {
              existingEntryKey = key;
              break;
            }
          }
        }
      }

      // Create new score entry with validation
      const newEntry = {
        name: sanitizedName,
        displayName: currentUser.displayName || null,
        email: currentUser.email || null,
        photoURL: currentUser.photoURL || null,
        uid: currentUser.uid,
        score: Math.round(score),
        prestigeTier: prestigeTier || 0,
        timestamp: now,
        version: '1.0',
        browserFingerprint: generateBrowserFingerprint()
      };

      // Use existing key if updating, or create new key if inserting
      const playerKey = existingEntryKey || `${currentUser.uid}_${now}`;

      // Submit to Firebase
      const response = await fetch(`${FIREBASE_CONFIG.databaseURL}/leaderboard/${playerKey}.json`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newEntry)
      });

      if (response.ok) {
        // Update last submission timestamp
        localStorage.setItem('lastScoreSubmission', now.toString());
        
        // Log successful auto-submit (but don't show alert to avoid spam)
        console.log(`🔄 Auto-submitted score: €${formatCurrency(score)} (T${prestigeTier})`);
        
        // Update leaderboard display
        await loadLeaderboard();
      }
      
    } catch (error) {
      console.warn('Auto-submit failed:', error);
      // Don't show error alerts for auto-submit failures
    }
  }

  function startAutoSubmit() {
    // Clear any existing interval
    if (autoSubmitInterval) {
      clearInterval(autoSubmitInterval);
    }
    
    // Start auto-submit every 30 seconds
    autoSubmitInterval = setInterval(autoSubmitScore, 30000);
    console.log('🔄 Auto-submit started (every 30 seconds)');
  }

  function stopAutoSubmit() {
    if (autoSubmitInterval) {
      clearInterval(autoSubmitInterval);
      autoSubmitInterval = null;
      console.log('🛑 Auto-submit stopped');
    }
  }

  // Generate a simple browser fingerprint for duplicate detection
  function generateBrowserFingerprint() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Browser fingerprint', 2, 2);
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  }

  // Update submission status and show helpful messages
  function updateSubmissionStatus() {
    const submitBtn = document.getElementById('submitScoreBtn');
    if (!submitBtn) return;

    // Check if user is authenticated with Google
    if (!currentUser) {
      submitBtn.textContent = 'Sign In to Submit';
      submitBtn.disabled = true;
      submitBtn.title = 'Please sign in with Google to submit your score';
      return;
    }

    // Always show "Submit Score" - cooldown is handled in submitScore function with alerts
    submitBtn.textContent = 'Submit Score';
    submitBtn.disabled = false;
    submitBtn.title = 'Submit your score to the leaderboard';
  }

  // Helper function to calculate total property value (needed for score calculation)
  function calculateTotalPropertyValue() {
    let total = 0;
    Object.keys(PROPERTY_CONFIG).forEach(propertyId => {
      const owned = properties[propertyId];
      const baseCost = PROPERTY_CONFIG[propertyId].baseCost;
      const priceMultiplier = PROPERTY_CONFIG[propertyId].priceMultiplier;
      
      // Sum of all purchase prices (not current market value)
      for (let i = 0; i < owned; i++) {
        total += baseCost * Math.pow(priceMultiplier, i);
      }
    });
    return total;
  }

  // Score URL handling removed - using direct JSONBin submission now

  // Event logging functions
  window.logEvent = function(eventName, eventType, details = null) {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
    
    // Add new event to the beginning of the array
    eventLogs.unshift({
      time: timeString,
      name: eventName,
      type: eventType,
      details: details
    });
    
    // Keep only the last 10 events to prevent memory bloat
    if (eventLogs.length > 10) {
      eventLogs = eventLogs.slice(0, 10);
    }
    
    // Render the updated event logs
    renderEventLogs();
  }

  function renderEventLogs() {
    const eventLogsContent = document.getElementById('eventLogsContent');
    if (!eventLogsContent) return;
    
    if (eventLogs.length === 0) {
      eventLogsContent.innerHTML = `
        <div class="event-log-item">
          <span class="event-time">No events yet</span>
          <span class="event-name">Start playing to see events!</span>
        </div>
      `;
      return;
    }
    
    eventLogsContent.innerHTML = eventLogs.map((event, index) => `
      <div class="event-log-item ${event.type}" ${event.type === 'earthquake' && event.details ? `onclick="showEarthquakeDetails(${index})" style="cursor: pointer;"` : ''}>
        <span class="event-time">${event.time}</span>
        <span class="event-name">${event.name}</span>
        ${event.type === 'earthquake' && event.details ? '<span class="event-details-hint">Click for details</span>' : ''}
      </div>
    `).join('');
  }

  // Make showEarthquakeDetails globally accessible
  window.showEarthquakeDetails = function(eventIndex) {
    const event = eventLogs[eventIndex];
    if (!event || !event.details) return;
    
    const details = event.details;
    
    // Create modal HTML
    const modalHTML = `
      <div class="modal-overlay" id="earthquakeDetailsModal">
        <div class="modal-content earthquake-details-modal">
          <div class="modal-header">
            <h3>🌍 Earthquake Details</h3>
            <button class="modal-close-btn" onclick="closeEarthquakeDetails()">×</button>
          </div>
          <div class="modal-body">
            <div class="earthquake-info">
              <div class="info-row">
                <span class="info-label">Magnitude:</span>
                <span class="info-value magnitude-${details.magnitude >= 7 ? 'high' : details.magnitude >= 6 ? 'medium' : 'low'}">${details.magnitude.toFixed(1)}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Rent Reduction:</span>
                <span class="info-value rent-reduction">${(details.rentReduction * 100).toFixed(0)}%</span>
              </div>
              <div class="info-row">
                <span class="info-label">Duration:</span>
                <span class="info-value">30 seconds</span>
              </div>
            </div>
            
            ${details.demolishCount > 0 ? `
              <div class="demolition-section">
                <h4>Properties Demolished (${details.demolishCount} total)</h4>
                <div class="demolition-list">
                  ${Object.entries(details.demolishedProperties)
                    .map(([propertyId, count]) => {
                      const propertyName = PROPERTY_CONFIG[propertyId]?.name || propertyId;
                      return `
                        <div class="demolition-item">
                          <span class="demolition-count">${count}</span>
                          <span class="demolition-name">${propertyName}${count > 1 ? 's' : ''}</span>
                        </div>
                      `;
                    })
                    .join('')}
                </div>
              </div>
            ` : `
              <div class="no-demolition">
                <p>No properties were demolished.</p>
              </div>
            `}
          </div>
        </div>
      </div>
    `;
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add click outside to close
    const modal = document.getElementById('earthquakeDetailsModal');
    const clickHandler = function(e) {
      if (e.target === modal) {
        closeEarthquakeDetails();
      }
    };
    modal._clickHandler = clickHandler; // Store reference for cleanup
    modal.addEventListener('click', clickHandler);
  };

  // Make closeEarthquakeDetails globally accessible
  window.closeEarthquakeDetails = function() {
    const modal = document.getElementById('earthquakeDetailsModal');
    if (modal) {
      // Remove event listeners before removing the modal
      modal.removeEventListener('click', modal._clickHandler);
      modal.remove();
    }
  };

  // Memory optimization function
  function optimizeMemory() {
    // Limit the number of dynamic style elements to prevent memory bloat
    const styleElements = document.querySelectorAll('style[data-tier]');
    if (styleElements.length > 10) {
      // Remove oldest style elements (keep only the most recent 8)
      const elementsToRemove = Array.from(styleElements).slice(0, styleElements.length - 8);
      elementsToRemove.forEach(el => el.remove());
    }
    
    // Clean up any orphaned modals
    const orphanedModals = document.querySelectorAll('.modal-overlay:not(#earthquakeDetailsModal)');
    orphanedModals.forEach(modal => modal.remove());
    
    // Clean up unused tier classes from DOM elements
    const propertyRows = document.querySelectorAll('.property-row');
    propertyRows.forEach(row => {
      const tierClasses = Array.from(row.classList).filter(cls => cls.startsWith('tier-'));
      if (tierClasses.length > 1) {
        // Keep only the most recent tier class
        const latestTier = tierClasses[tierClasses.length - 1];
        tierClasses.forEach(cls => {
          if (cls !== latestTier) {
            row.classList.remove(cls);
          }
        });
      }
    });
    
    // Clear property income cache periodically to prevent accumulation
    propertyIncomeCacheValid = false;
    cachedPropertyIncome = 0;
    
    // MAJOR MEMORY LEAK FIX: Clean up accumulating objects
    // Clean up achievementsBannerShown object (grows indefinitely)
    if (achievementsBannerShown && Object.keys(achievementsBannerShown).length > 100) {
      // Keep only the most recent 50 achievement banners
      const entries = Object.entries(achievementsBannerShown);
      const recentEntries = entries.slice(-50);
      achievementsBannerShown = Object.fromEntries(recentEntries);
    }
    
    // Clean up cachedElements object
    if (cachedElements && Object.keys(cachedElements).length > 20) {
      // Clear old cached elements
      cachedElements = {};
      cacheDOMElements(); // Re-cache essential elements
    }
    
    // Clean up eventLogs array (already limited to 10, but ensure it's not growing)
    if (eventLogs && eventLogs.length > 10) {
      eventLogs = eventLogs.slice(0, 10);
    }
    
    // Clean up leaderboardData array
    if (leaderboardData && leaderboardData.length > 50) {
      leaderboardData = leaderboardData.slice(0, 50);
    }
    
    // Clean up any accumulated DOM references
    if (window.performance && window.performance.memory) {
      const memInfo = window.performance.memory;
      if (memInfo.usedJSHeapSize > 100 * 1024 * 1024) { // If using more than 100MB
        // Force more aggressive cleanup
        propertyIncomeCacheValid = false;
        if (particleSystem) {
          particleSystem.stopAnimation({ clearCanvas: true });
        }
      }
    }
    
    // Force garbage collection hint (if available)
    if (window.gc) {
      window.gc();
    }
  }

  // Track intervals to prevent accumulation
  let memoryOptimizationInterval = null;
  let aggressiveCleanupInterval = null;
  
  // Run memory optimization periodically
  if (!memoryOptimizationInterval) {
    memoryOptimizationInterval = setInterval(optimizeMemory, 30000); // Every 30 seconds
  }
  
  // More aggressive memory cleanup every 5 minutes
  if (!aggressiveCleanupInterval) {
    aggressiveCleanupInterval = setInterval(() => {
    // Clear all caches
    propertyIncomeCacheValid = false;
    cachedPropertyIncome = 0;
    
    // MAJOR CLEANUP: Reset accumulating objects to prevent memory bloat
    // Reset achievementsBannerShown to prevent indefinite growth
    const currentAchievements = Object.keys(achievements).filter(id => achievements[id].unlocked);
    achievementsBannerShown = {};
    currentAchievements.forEach(id => {
      achievementsBannerShown[id] = true; // Mark current achievements as shown
    });
    
    // Clear cachedElements and re-cache only essential ones
    cachedElements = {};
    cacheDOMElements();
    
    // Ensure arrays are properly limited
    if (eventLogs.length > 10) {
      eventLogs = eventLogs.slice(0, 10);
    }
    if (leaderboardData.length > 50) {
      leaderboardData = leaderboardData.slice(0, 50);
    }
    
    // Clear DOM cache if it exists
    if (typeof clearDOMCache === 'function') {
      clearDOMCache();
    }
    
    // Force particle system cleanup
    if (particleSystem) {
      particleSystem.stopAnimation({ clearCanvas: true });
    }
    
    // Clear any accumulated intervals or timeouts
    const highestTimeoutId = setTimeout(() => {}, 0);
    for (let i = 0; i < highestTimeoutId; i++) {
      clearTimeout(i);
    }
    
    // Force garbage collection
    if (window.gc) {
      window.gc();
    }
    
    console.log('Aggressive memory cleanup completed');
    }, 300000); // Every 5 minutes
  }

  // Event delegation to prevent event listener accumulation
  document.addEventListener('click', function(e) {
    // Handle property buy buttons
    if (e.target.matches('[data-property-id] .buy-btn, [data-property-id] .buy-btn *')) {
      const propertyRow = e.target.closest('[data-property-id]');
      if (propertyRow) {
        const propertyId = propertyRow.getAttribute('data-property-id');
        buyProperty(propertyId);
      }
    }
    
    // Handle upgrade buy buttons
    if (e.target.matches('[data-upgrade-id] .buy-btn, [data-upgrade-id] .buy-btn *')) {
      const upgradeRow = e.target.closest('[data-upgrade-id]');
      if (upgradeRow) {
        const upgradeId = upgradeRow.getAttribute('data-upgrade-id');
        tryBuyUpgrade(upgradeId);
      }
    }
  });

  // Memory monitoring function
  function logMemoryUsage() {
    if (window.performance && window.performance.memory) {
      const memInfo = window.performance.memory;
      const usedMB = Math.round(memInfo.usedJSHeapSize / 1024 / 1024);
      const totalMB = Math.round(memInfo.totalJSHeapSize / 1024 / 1024);
      const limitMB = Math.round(memInfo.jsHeapSizeLimit / 1024 / 1024);
      
      console.log(`Memory Usage: ${usedMB}MB / ${totalMB}MB (Limit: ${limitMB}MB)`);
      
      // If memory usage is high, trigger aggressive cleanup
      if (usedMB > 200) {
        console.warn('High memory usage detected, triggering cleanup...');
        optimizeMemory();
        if (particleSystem) {
          particleSystem.stopAnimation({ clearCanvas: true });
        }
      }
    }
  }

  // Log memory usage every minute for debugging
  setInterval(logMemoryUsage, 60000);

  // Emergency memory reset function (can be called manually)
  window.emergencyMemoryReset = function() {
    console.log('Emergency memory reset triggered...');
    
    // Reset all accumulating objects
    achievementsBannerShown = {};
    cachedElements = {};
    propertyIncomeCacheValid = false;
    cachedPropertyIncome = 0;
    
    // Limit arrays
    eventLogs = eventLogs.slice(0, 10);
    leaderboardData = leaderboardData.slice(0, 50);
    
    // Stop all animations
    if (particleSystem) {
      particleSystem.stopAnimation({ clearCanvas: true });
    }
    if (numberAnimator) {
      numberAnimator.stopAnimation();
    }
    
    // Clear all style elements
    const styleElements = document.querySelectorAll('style[data-tier]');
    styleElements.forEach(el => el.remove());
    
    // Clear all modals
    const modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(modal => modal.remove());
    
    // Force garbage collection
    if (window.gc) {
      window.gc();
    }
    
    // Re-initialize essential elements
    cacheDOMElements();
    
    console.log('Emergency memory reset completed');
  };

  if (depositAllBtn) {
    depositAllBtn.addEventListener("click", depositAll);
    
    // Add touch-specific animation handling
    depositAllBtn.addEventListener("touchstart", (e) => {
      depositAllBtn.classList.add("touch-active");
    }, { passive: true });
    
    depositAllBtn.addEventListener("touchend", (e) => {
      depositAllBtn.classList.remove("touch-active");
    }, { passive: true });
  }
  
  if (withdrawAllBtn) {
    withdrawAllBtn.addEventListener("click", withdrawAll);
    
    // Add touch-specific animation handling
    withdrawAllBtn.addEventListener("touchstart", (e) => {
      withdrawAllBtn.classList.add("touch-active");
    }, { passive: true });
    
    withdrawAllBtn.addEventListener("touchend", (e) => {
      withdrawAllBtn.classList.remove("touch-active");
    }, { passive: true });
  }

  if (withdrawHalfBtn) {
    withdrawHalfBtn.addEventListener("click", withdrawHalf);
    
    // Add touch-specific animation handling
    withdrawHalfBtn.addEventListener("touchstart", (e) => {
      withdrawHalfBtn.classList.add("touch-active");
    }, { passive: true });
    
    withdrawHalfBtn.addEventListener("touchend", (e) => {
      withdrawHalfBtn.classList.remove("touch-active");
    }, { passive: true });
  }

  // Property system event listeners
  setupPropertyButtonEvents("foodStand", buyFoodStandBtn);
  setupPropertyButtonEvents("newsstand", buyNewsstandBtn);
  setupPropertyButtonEvents("parkingGarage", buyParkingGarageBtn);
  setupPropertyButtonEvents("convenienceStore", buyConvenienceStoreBtn);
  setupPropertyButtonEvents("apartment", buyApartmentBtn);
  setupPropertyButtonEvents("manufacturingPlant", buyManufacturingPlantBtn);
  setupPropertyButtonEvents("officeBuilding", buyOfficeBuildingBtn);
  setupPropertyButtonEvents("skyscraper", buySkyscraperBtn);
  setupPropertyButtonEvents("operaHouse", buyOperaHouseBtn);

  // Buy multiplier toggle button
  if (buyMultiplierBtn) {
    buyMultiplierBtn.addEventListener("click", () => {
      cycleBuyMultiplier();
    });
  }

  // Prestige system - moved to global scope

  // Automatic investments
  let autoInvestEnabled = false;
  
  // Automatic rent contribution
  let autoRentEnabled = false;

  // Click streak system
  let lastClickTime = 0;
  let streakCount = 0;
  let streakMultiplier = 1;
  const STREAK_TIMEOUT_MS = 2000; // 2 seconds
  const BASE_MAX_STREAK_MULTIPLIER = 3;
  
  function getMaxStreakMultiplier() {
    // Check if Extended Streak upgrade is owned
    if (owned.u52) {
      return 5; // Extended to 5x
    }
    return BASE_MAX_STREAK_MULTIPLIER; // Default 3x
  }

  // Auto clicker system
  let autoClickTimer = 0;
  const AUTO_CLICK_INTERVAL_MS = 3000; // 3 seconds

  // Achievement system
  let maxStreakReached = false;
  let totalDividendsReceived = 0;

  // Statistics tracking
  let hasMadeFirstInvestment = false;
  
  const achievements = {
    ach1: { unlocked: false, condition: () => getTotalMoney() >= 1000 },
    ach2: { unlocked: false, condition: () => getTotalMoney() >= 10000 },
    ach3: { unlocked: false, condition: () => getTotalMoney() >= 1000000 },
    ach4: { unlocked: false, condition: () => getTotalMoney() >= 1000000000 },
    ach5: { unlocked: false, condition: () => getTotalMoney() >= 1000000000000 },
    ach8: { unlocked: false, condition: () => maxStreakReached },
    ach9: { unlocked: false, condition: () => owned.u5 }, // Educated - Higher Education
    ach10: { unlocked: false, condition: () => investmentAccountBalance >= 100000 },
    ach11: { unlocked: false, condition: () => totalDividendsReceived >= 1000000 }, // Receive €1,000,000 in dividends
    ach13: { unlocked: false, condition: () => hasMadeFirstInvestment }, // First investment
    ach14: { unlocked: false, condition: () => hasBoughtFirstProperty() }, // Property Pioneer
    ach15: { unlocked: false, condition: () => getTotalRentIncome() >= 1000 }, // Rent Rookie
    ach16: { unlocked: false, condition: () => getTotalRentIncome() >= 100000 }, // Rent Royalty
    ach17: { unlocked: false, condition: () => getTotalRentIncome() >= 1000000 }, // Rent Empire
    ach18: { unlocked: false, condition: () => getTotalRentIncome() >= 1000000000 } // Rent Billionaire
  };

  // Money cap system - REMOVED (no longer needed)

  function getTotalMoney() {
    return currentAccountBalance + investmentAccountBalance;
  }

  // Helper functions for new achievements
  function hasBoughtFirstProperty() {
    return Object.values(properties).some(count => count > 0);
  }

  function getTotalRentIncome() {
    let totalRent = 0;
    Object.keys(PROPERTY_CONFIG).forEach(propertyId => {
      totalRent += getPropertyTotalIncome(propertyId);
    });
    return totalRent;
  }

  // applyMoneyCap function - REMOVED (no longer needed)


  // Audio system - now handled by audio.js
  
  // Particle effects system - moved to global scope
  
  // Number animations system
  let numberAnimationsEnabled = true;
  
  // Username is now handled by Google authentication (currentUser.displayName or email)

  // Audio functions are now handled by audio.js

  // Centralized upgrade configuration
  // To add a new upgrade: Add an entry with id, cost, name, effect, and type
  // To remove an upgrade: Delete the entry from this object
  // Types: "click", "interest", "dividend", "dividend_speed", "dividend_rate", "unlock", "prestige", "special"
  const UPGRADE_CONFIG = GAME_CONFIG.UPGRADE_CONFIG;

  // Generate upgrade costs and owned objects from config
  const UPGRADE_COSTS = Object.fromEntries(
    Object.entries(UPGRADE_CONFIG).map(([id, config]) => [id, config.cost])
  );

  // Function to get dynamic prestige reset cost based on current tier
  function getPrestigeResetCost() {
    // Max prestige tier is 30 (1zz), after that no more resets
    if (prestigeTier >= 30) {
      return Infinity; // No more prestige resets possible
    }
    
    // Cost progression: 1t, 1aa, 1bb, 1cc, 1dd, 1ee, 1ff, 1gg, 1hh, 1ii, 1jj, 1kk, 1ll, 1mm, 1nn, 1oo, 1pp, 1qq, 1rr, 1ss, 1tt, 1uu, 1vv, 1ww, 1xx, 1yy, 1zz
    const costProgression = [
      1000000000000,    // 1t (1 trillion) - tier 0
      1000000000000000, // 1aa (1 quadrillion) - tier 1
      1000000000000000000, // 1bb - tier 2
      1000000000000000000000, // 1cc - tier 3
      1000000000000000000000000, // 1dd - tier 4
      1000000000000000000000000000, // 1ee - tier 5
      1000000000000000000000000000000, // 1ff - tier 6
      1000000000000000000000000000000000, // 1gg - tier 7
      1000000000000000000000000000000000000, // 1hh - tier 8
      1000000000000000000000000000000000000000, // 1ii - tier 9
      1000000000000000000000000000000000000000000, // 1jj - tier 10
      1000000000000000000000000000000000000000000000, // 1kk - tier 11
      1000000000000000000000000000000000000000000000000, // 1ll - tier 12
      1000000000000000000000000000000000000000000000000000, // 1mm - tier 13
      1000000000000000000000000000000000000000000000000000000, // 1nn - tier 14
      1000000000000000000000000000000000000000000000000000000000, // 1oo - tier 15
      1000000000000000000000000000000000000000000000000000000000000, // 1pp - tier 16
      1000000000000000000000000000000000000000000000000000000000000000, // 1qq - tier 17
      1000000000000000000000000000000000000000000000000000000000000000000, // 1rr - tier 18
      1000000000000000000000000000000000000000000000000000000000000000000000, // 1ss - tier 19
      1000000000000000000000000000000000000000000000000000000000000000000000000, // 1tt - tier 20
      1000000000000000000000000000000000000000000000000000000000000000000000000000, // 1uu - tier 21
      1000000000000000000000000000000000000000000000000000000000000000000000000000000, // 1vv - tier 22
      1000000000000000000000000000000000000000000000000000000000000000000000000000000000, // 1ww - tier 23
      1000000000000000000000000000000000000000000000000000000000000000000000000000000000000, // 1xx - tier 24
      1000000000000000000000000000000000000000000000000000000000000000000000000000000000000000, // 1yy - tier 25
      1000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000, // 1zz - tier 26
    ];
    
    return costProgression[prestigeTier] || Infinity;
  }

  // Function to get upgrade cost (with dynamic prestige reset cost)
  function getUpgradeCost(upgradeId) {
    if (upgradeId === 'u26') {
      return getPrestigeResetCost();
    }
    return UPGRADE_COSTS[upgradeId];
  }

  // Helper functions to calculate upgrade effects dynamically
  function getUpgradeEffectTotal(effectType) {
    let total = 0;
    Object.entries(UPGRADE_CONFIG).forEach(([upgradeId, config]) => {
      if (owned[upgradeId] && config.effects && config.effects[effectType]) {
        total += config.effects[effectType];
      }
    });
    return total;
  }

  function getUpgradeEffectMultiplier(effectType) {
    let multiplier = 1;
    Object.entries(UPGRADE_CONFIG).forEach(([upgradeId, config]) => {
      if (owned[upgradeId] && config.effects && config.effects[effectType]) {
        multiplier *= (1 + config.effects[effectType]);
      }
    });
    return multiplier;
  }

  function getPropertySpecificRentMultiplier(propertyId) {
    let multiplier = 1;
    Object.entries(UPGRADE_CONFIG).forEach(([upgradeId, config]) => {
      if (owned[upgradeId] && config.type === 'property_rent_boost' && config.property === propertyId) {
        multiplier *= (1 + config.effects.property_rent_income);
      }
    });
    return multiplier;
  }

  // Function to get icon class based on upgrade type
  function getUpgradeIconClass(type, config = null) {
    // For property-specific rent boosts, use the property's icon
    if (type === 'property_rent_boost' && config && config.property) {
      const propertyConfig = PROPERTY_CONFIG[config.property];
      if (propertyConfig && propertyConfig.icon) {
        return `${propertyConfig.icon} upgrade-icon property-icon`;
      }
    }
    
    const iconMap = {
      'click': 'fas fa-money-bill-wave upgrade-icon click-icon',
      'click_multiplier': 'fas fa-mouse-pointer upgrade-icon click-icon',
      'interest': 'fas fa-percentage upgrade-icon interest-icon',
      'dividend': 'fas fa-coins upgrade-icon dividend-icon',
      'dividend_speed': 'fas fa-coins upgrade-icon dividend-icon',
      'dividend_rate': 'fas fa-coins upgrade-icon dividend-icon',
      'unlock': 'fas fa-unlock upgrade-icon unlock-icon',
      'prestige': 'fas fa-redo upgrade-icon prestige-icon',
      'special': 'fas fa-bolt upgrade-icon special-icon',
      'building_discount': 'fas fa-building upgrade-icon building-icon',
      'rent_boost': 'fas fa-building upgrade-icon building-icon',
      'property_discount': 'fas fa-building upgrade-icon building-icon',
      'property_rent_boost': 'fas fa-building upgrade-icon building-icon', // fallback
      'streak_boost': 'fas fa-fire upgrade-icon streak-icon'
    };
    return iconMap[type] || 'fas fa-star upgrade-icon';
  }

  // Function to generate upgrade HTML from configuration
  function generateUpgradeHTML(upgradeId, config) {
    const iconClass = getUpgradeIconClass(config.type, config);
    const buttonText = config.type === 'prestige' ? 'Reset' : 'Buy';
    
    return `
      <div class="upgrade" data-upgrade-id="${upgradeId}">
        <div class="upgrade-info">
          <div class="upgrade-name"><i class="${iconClass}"></i>${config.name}</div>
          <div class="upgrade-price" id="${upgradeId}Price"></div>
          <div class="upgrade-desc">${config.effect}</div>
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" id="${upgradeId}Progress"></div>
            </div>
            <div class="progress-text" id="${upgradeId}ProgressText">0%</div>
          </div>
        </div>
        <div class="upgrade-actions">
          <button id="buy${upgradeId.charAt(0).toUpperCase() + upgradeId.slice(1)}Btn" class="buyBtn">${buttonText}</button>
        </div>
      </div>
    `;
  }

  // Function to generate all upgrade HTML and insert into DOM
  function generateAllUpgradeHTML() {
    const upgradesContainer = document.querySelector('#upgradesSection .scrollable-content');
    if (!upgradesContainer) return;

    // Clear existing upgrades
    upgradesContainer.innerHTML = '';

    // Generate HTML for each upgrade in the config
    Object.entries(UPGRADE_CONFIG).forEach(([upgradeId, config]) => {
      const upgradeHTML = generateUpgradeHTML(upgradeId, config);
      upgradesContainer.insertAdjacentHTML('beforeend', upgradeHTML);
    });
  }

  // Achievement configuration with display information
  const ACHIEVEMENT_CONFIG = GAME_CONFIG.ACHIEVEMENT_CONFIG;

  // Function to generate achievement HTML from configuration
  function generateAchievementHTML(achievementId, config) {
    return `
      <div class="achievement" data-achievement-id="${achievementId}">
        <div class="achievement-icon">${config.icon}</div>
        <div class="achievement-info">
          <div class="achievement-name">${config.name}</div>
          <div class="achievement-desc">${config.description}</div>
        </div>
        <div class="achievement-status" id="${achievementId}Status">🔒</div>
      </div>
    `;
  }

  // Function to generate all achievement HTML and insert into DOM
  function generateAllAchievementHTML() {
    const achievementsContainer = document.getElementById('achievementsSection');
    if (!achievementsContainer) return;

    // Clear existing achievements
    achievementsContainer.innerHTML = '';

    // Generate HTML for each achievement in the config
    Object.entries(ACHIEVEMENT_CONFIG).forEach(([achievementId, config]) => {
      const achievementHTML = generateAchievementHTML(achievementId, config);
      achievementsContainer.insertAdjacentHTML('beforeend', achievementHTML);
    });
  }

  // Function to set up event listeners for upgrade buy buttons
  function setupUpgradeButtonEventListeners() {
    Object.keys(UPGRADE_CONFIG).forEach(id => {
      const buyBtn = document.getElementById(`buy${id.charAt(0).toUpperCase() + id.slice(1)}Btn`);
      if (buyBtn) {
        // Remove any existing event listeners to prevent duplicates
        buyBtn.replaceWith(buyBtn.cloneNode(true));
        const newBuyBtn = document.getElementById(`buy${id.charAt(0).toUpperCase() + id.slice(1)}Btn`);
        newBuyBtn.addEventListener("click", () => tryBuyUpgrade(id));
      }
    });
  }
  
  // Initialize owned upgrades from global variable
  owned = Object.fromEntries(
    Object.keys(UPGRADE_CONFIG).map(id => [id, false])
  );

  function tryBuyUpgrade(key) {
    if (owned[key]) return;
    
    // Check if upgrade has requirements that aren't met
    const upgradeConfig = UPGRADE_CONFIG[key];
    if (upgradeConfig && upgradeConfig.requires && !owned[upgradeConfig.requires]) {
      AudioSystem.playErrorSound();
      return;
    }
    
    let cost = getUpgradeCost(key);
    
    // Apply Flash Sale discount
    if (flashSaleActive()) {
      cost = cost * 0.75; // 25% off
    }
    
    if (currentAccountBalance < cost) {
      AudioSystem.playErrorSound();
      return;
    }

    // Special handling for prestige reset (u26)
    if (key === "u26") {
      // Check if max prestige reached
      if (prestigeTier >= 26) {
        alert("You have reached the maximum prestige level (1zz). No more prestige resets are possible!");
        AudioSystem.playErrorSound();
        return;
      }
      
      if (confirm("Are you sure you want to reset everything? This will give you permanent +25% multipliers but reset all money and upgrades.")) {
        // Increment prestige tier
        prestigeTier++;
        
        // Apply permanent multipliers (linear growth: +0.25 each time)
        prestigeClickMultiplier += 0.25;
        prestigeInterestMultiplier += 0.25;
        
        // Create prestige reset particle effects
        if (particleSystem) {
          const centerX = window.innerWidth / 2;
          const centerY = window.innerHeight / 2;
          
          // Create massive particle celebration
          if (particleEffectsEnabled) {
          particleSystem.createRareAchievementParticles(centerX, centerY, 50);
          particleSystem.createFireworkParticles(centerX, centerY, 25);
          particleSystem.createGoldenParticles(centerX, centerY, 20);
          particleSystem.createMilestoneParticles(centerX, centerY, 30);
          }
          
          // Screen effects
          screenFlash('#FF6B35', 800); // Orange flash
          screenShake(15, 600); // Strong shake
        }
        
        // Reset everything
        currentAccountBalance = 0;
        investmentAccountBalance = 0;
        dividendElapsed = 0;
        autoInvestEnabled = false;
        
        // Reset all upgrades
        Object.keys(owned).forEach(upgradeKey => {
          owned[upgradeKey] = false;
        });
        
        // Reset all properties
        Object.keys(properties).forEach(propertyKey => {
          properties[propertyKey] = 0;
        });
        
        // CRITICAL: Invalidate all caches immediately after reset
        propertyIncomeCacheValid = false;
        cachedPropertyIncome = 0;
        
        // Also invalidate performance manager cache if available
        if (performanceManager && typeof performanceManager.invalidateCache === 'function') {
          performanceManager.invalidateCache('propertyIncome'); // Invalidate property income cache specifically
          performanceManager.invalidateCache(); // Invalidate all caches as backup
        }
        
        // Force immediate recalculation of property income to ensure it's 0
        const immediatePropertyIncome = getTotalPropertyIncome();
        console.log('DEBUG: Property income immediately after reset:', immediatePropertyIncome);
        
        // Reset auto-invest toggle
        if (autoInvestToggle) {
          autoInvestToggle.checked = false;
        }
        
        // Reset auto-rent toggle
        if (autoRentToggle) {
          autoRentToggle.checked = false;
        }
        
        // Update UI
        renderBalances();
        renderUpgradesOwned();
        renderUpgradePrices(); // Update upgrade prices (including prestige reset cost)
        renderPrestigeMultipliers();
        sortUpgradesByCost();
        renderInvestmentUnlocked();
        renderInterestPerSecond();
        renderDividendUI(0);
        renderAutoInvestSection();
        renderAutoRentSection();
        renderClickStreak();
        renderRentIncome(); // CRITICAL: Update rent income display immediately
        
        // Update property UI for all properties
        Object.keys(PROPERTY_CONFIG).forEach(propertyId => {
          renderPropertyUI(propertyId);
        });
        
        // Update indicators
        updateUpgradeIndicator();
        updatePortfolioIndicator();
        
        // Check achievements after prestige
        checkAchievementsOptimized();
      }
      return;
    }

    currentAccountBalance -= cost;
    owned[key] = true;
    
    // Invalidate property income cache if rent-related upgrade was purchased
    const purchasedUpgrade = GAME_CONFIG.UPGRADE_CONFIG[key];
    if (purchasedUpgrade && (purchasedUpgrade.type === 'rent_boost' || purchasedUpgrade.type === 'property_rent_boost' || purchasedUpgrade.effects?.rent_income || purchasedUpgrade.effects?.property_rent_income)) {
      propertyIncomeCacheValid = false;
    }
    
    // Create upgrade particle effects
    if (particleSystem) {
      const buyButton = document.getElementById(`buy${key.charAt(0).toUpperCase() + key.slice(1)}Btn`);
      if (buyButton) {
        const rect = buyButton.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Create upgrade particles
        if (particleEffectsEnabled) {
        particleSystem.createUpgradeParticles(centerX, centerY, 3);
        
        // Create confetti for expensive upgrades
        if (cost >= 10000) {
          particleSystem.createConfettiParticles(centerX, centerY, 6);
        }
        
        // Create money gain particles
        particleSystem.createMoneyGainParticles(centerX, centerY, cost);
        }
      }
    }
    
    // Force immediate balance animation for purchase feedback
    if (numberAnimator) {
      if (currentDisplay) {
        const currentValue = parseDisplayedValue(currentDisplay.textContent);
        numberAnimator.forceAnimateValue(currentDisplay, currentValue, currentAccountBalance, 250, animationFormatters.currency);
      }
      if (headerCurrentDisplay) {
        const headerCurrentValue = parseDisplayedValue(headerCurrentDisplay.textContent);
        numberAnimator.forceAnimateValue(headerCurrentDisplay, headerCurrentValue, currentAccountBalance, 250, animationFormatters.currency);
      }
    }
    
    renderBalances();
    renderUpgradesOwned();
    renderInterestPerSecond();
    // After purchase, re-sort and re-evaluate which upgrade to show next
    renderUpgradePrices();
    sortUpgradesByCost();
    updateUpgradeIndicator();
    updatePortfolioIndicator();
    // Update property displays in case upgrade affects property income
    renderAllProperties();
    renderRentIncome(); // Update rent income display after upgrade purchase
    
    // Play buy sound
    AudioSystem.playBuySound();
    
    // Check achievements
    checkAchievementsOptimized();
    
    // Save game state after upgrade purchase
    saveGameState();
  }


  // Auto-invest toggle event listener
  if (autoInvestToggle) {
    autoInvestToggle.addEventListener("change", handleAutoInvestToggle);
  }
  
  // Auto-rent toggle event listener
  if (autoRentToggle) {
    autoRentToggle.addEventListener("change", handleAutoRentToggle);
  }

  // Toggle completed (owned) upgrades visibility
  function updateToggleCompletedUI() {
    if (!toggleCompletedBtn || !upgradesSection) return;
    const hidden = upgradesSection.classList.contains('hide-completed');
    toggleCompletedBtn.setAttribute('aria-pressed', hidden ? 'true' : 'false');
    toggleCompletedBtn.textContent = hidden ? 'Show completed' : 'Hide completed';
  }

  if (toggleCompletedBtn && upgradesSection) {
    // hide-completed class is already set during early initialization
    updateToggleCompletedUI();
    toggleCompletedBtn.addEventListener('click', () => {
      upgradesSection.classList.toggle('hide-completed');
      updateToggleCompletedUI();
      // Re-apply visibility rules when toggling completed view
      sortUpgradesByCost();
    });
  }

  // Game loop timing - now using config with mobile optimization
  const TICK_MS = mobilePerformanceMode ? getIntervalConfig('INVESTMENT_COMPOUNDING') : GAME_CONFIG.TICK_MS;
  // Base compound multiplier per tick - varies by difficulty
  function getBaseCompoundMultiplierPerTick() {
    switch (getGameDifficulty()) {
      case 'easy': return 1.00044;    // 0.5% per second (easier)
      case 'normal': return 1.00044;  // 0.4% per second (original)
      case 'hard': return 1.00024;   // 0.35% per second (harder)
      case 'extreme': return 1.00014; // 0.3% per second (extreme)
      default: return 1.0001;        // fallback to normal
    }
  }
  function getCompoundMultiplierPerTick() {
    let rateBoost = getUpgradeEffectMultiplier('interest_rate');
    
    // Market event effects
    if (marketBoomActive()) {
      rateBoost *= 1.5; // +50% during boom
    } else if (marketCrashActive()) {
      rateBoost *= 0.3; // -70% during crash
    } else if (greatDepressionActive()) {
      rateBoost *= -0.2; // -120% during depression (negative rate = money shrinking)
    }
    
    const baseMultiplier = getBaseCompoundMultiplierPerTick();
    const finalMultiplier = 1 + (baseMultiplier - 1) * rateBoost; // Removed prestigeInterestMultiplier for balance
    
    // Debug logging
    /*
    console.log('Interest calculation:', {
      rateBoost,
      baseMultiplier,
      prestigeInterestMultiplier,
      finalMultiplier,
      gameDifficulty: getGameDifficulty(),
      prestigeClickMultiplier, // Also check click multiplier for comparison
      typeof_prestigeInterestMultiplier: typeof prestigeInterestMultiplier,
      // Direct reference to check scope
      direct_prestigeInterestMultiplier: window.prestigeInterestMultiplier || 'not on window'
    });
    */
    
    return finalMultiplier;
  }

  // Cache DOM elements for performance optimization
  function cacheDOMElements() {
    cachedElements.upgradeIndicator = document.getElementById('upgradeIndicator');
    cachedElements.portfolioIndicator = document.getElementById('portfolioIndicator');
  }

  // Check if any upgrades are available and update indicator
  function updateUpgradeIndicator() {
    const indicator = cachedElements.upgradeIndicator;
    if (!indicator) return;
    
    // Check if any upgrade is affordable using only current account balance
    const hasAffordableUpgrade = Object.keys(UPGRADE_CONFIG).some((upgradeId) => {
      const cost = getUpgradeCost(upgradeId);
      if (owned[upgradeId]) return false;
      
      // Check if upgrade has requirements that aren't met
      const upgradeConfig = UPGRADE_CONFIG[upgradeId];
      if (upgradeConfig && upgradeConfig.requires && !owned[upgradeConfig.requires]) {
        return false;
      }
      
      return currentAccountBalance >= cost;
    });
    
    if (hasAffordableUpgrade) {
      indicator.classList.remove('hidden');
    } else {
      indicator.classList.add('hidden');
    }
  }

  // Check if any buildings are available and update portfolio indicator
  function updatePortfolioIndicator() {
    const indicator = cachedElements.portfolioIndicator;
    if (!indicator) return;
    
    // Check if any building is affordable using only current account balance
    const hasAffordableBuilding = Object.entries(PROPERTY_CONFIG).some(([propertyId, config]) => {
      const owned = properties[propertyId];
      const cost = getEffectiveBaseCost(config) * Math.pow(config.priceMultiplier, owned);
      return currentAccountBalance >= cost;
    });
    
    if (hasAffordableBuilding) {
      indicator.classList.remove('hidden');
    } else {
      indicator.classList.add('hidden');
    }
  }

  // Sort upgrades by cost ascending
  function sortUpgradesByCost() {
    const container = document.getElementById('upgradesSection');
    if (!container) return;
    const scrollableContent = container.querySelector('.scrollable-content');
    if (!scrollableContent) return;
    const rows = Array.from(scrollableContent.querySelectorAll('.upgrade'));
    rows.sort((a, b) => {
      const aId = a.getAttribute('data-upgrade-id');
      const bId = b.getAttribute('data-upgrade-id');
      const aCost = getUpgradeCost(aId) ?? Number.MAX_SAFE_INTEGER;
      const bCost = getUpgradeCost(bId) ?? Number.MAX_SAFE_INTEGER;
      return aCost - bCost;
    });
    rows.forEach((row) => scrollableContent.appendChild(row));

    const hideCompleted = container.classList.contains('hide-completed');
    
    if (hideCompleted) {
      // Show all unowned upgrades that meet requirements
      rows.forEach((row) => {
        const id = row.getAttribute('data-upgrade-id');
        const upgradeConfig = UPGRADE_CONFIG[id];
        const hasRequirements = upgradeConfig && upgradeConfig.requires && !owned[upgradeConfig.requires];
        
        // Hide if owned, or if requirements not met
        row.style.display = (!owned[id] && !hasRequirements) ? '' : 'none';
      });
    } else {
      // Show only completed (owned) upgrades when "Show completed" is active
      rows.forEach((row) => {
        const id = row.getAttribute('data-upgrade-id');
        row.style.display = owned[id] ? '' : 'none';
      });
    }
  }

  // Dividends logic: 1% every 10 seconds to current, investment unchanged
  const BASE_DIVIDEND_INTERVAL_MS = 10000;
  const BASE_DIVIDEND_RATE = 0.0015;
  let dividendElapsed = 0;
  let dividendAnimationId = null;

  function tickDividends(deltaMs) {
    if (!owned.u10) {
      // console.log('Dividends not owned (u10), skipping');
      return;
    }
    dividendElapsed += deltaMs;
    
    // Calculate speed multipliers (stack multiplicatively)
    let speedMultiplier = 1;
    const speedBoost = getUpgradeEffectTotal('dividend_speed');
    speedMultiplier *= (1 - speedBoost); // Convert percentage to multiplier
    
    // Calculate rate multipliers (stack multiplicatively)
    let rateMultiplier = getUpgradeEffectMultiplier('dividend_rate');
    
    // Apply prestige multiplier to dividend rate
    rateMultiplier *= prestigeInterestMultiplier;
    
    // Market event effects on dividend rate
    if (marketBoomActive()) {
      rateMultiplier *= 1.5; // +50% during boom
    } else if (marketCrashActive()) {
      rateMultiplier *= 0.3; // -70% during crash
    } else if (greatDepressionActive()) {
      rateMultiplier = 0; // No dividends during depression (0% rate)
    }
    
    const interval = Math.floor(BASE_DIVIDEND_INTERVAL_MS * speedMultiplier);
    const rate = BASE_DIVIDEND_RATE * rateMultiplier;
    
    
    if (dividendElapsed >= interval) {
      dividendElapsed -= interval;
      const payout = Math.floor(investmentAccountBalance * rate * 100) / 100;
      
      
      if (payout > 0) {
        // Track total dividends received for achievement
        totalDividendsReceived += payout;
        
        // Create flying money particles for dividend payout
        if (particleSystem && particleSystem.createMoneyGainParticles && particleEffectsEnabled) {
          const dividendProgress = document.getElementById('dividendProgressBar');
          if (dividendProgress) {
            const rect = dividendProgress.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            // Create money particles from the dividend progress bar
            particleSystem.createMoneyGainParticles(centerX, centerY, Math.min(payout / 2000000, 6));
          }
        }
        
        if (autoInvestEnabled) {
          // Auto-invest: add dividends to investment account
          investmentAccountBalance += payout;
        } else {
          // Normal: add dividends to current account
          currentAccountBalance += payout;
        }
        
        // Force UI update after dividend payout
        renderBalances();
        
      }
    }
  }


  // Smooth dividend animation function
  function animateDividendTimer() {
    if (!owned.u10) {
      if (dividendAnimationId) {
        cancelAnimationFrame(dividendAnimationId);
        dividendAnimationId = null;
      }
      return;
    }
    
      // Calculate speed multipliers (same as tickDividends)
      let speedMultiplier = 1;
      const speedBoost = getUpgradeEffectTotal('dividend_speed');
      speedMultiplier *= (1 - speedBoost);
      
      const interval = Math.floor(BASE_DIVIDEND_INTERVAL_MS * speedMultiplier);
    
    // Use the same dividendElapsed variable as the payout logic for synchronization
    const timeInCycle = dividendElapsed % interval;
    const remaining = Math.ceil((interval - timeInCycle) / 1000);
    const percent = timeInCycle / interval;
      const dashOffset = 100 - percent * 100;
    
    // Update progress bar smoothly
    const progressFill = document.getElementById('dividendProgressFill');
    if (progressFill) {
      progressFill.style.width = `${percent * 100}%`;
    }
    
    // Continue animation
    dividendAnimationId = requestAnimationFrame(animateDividendTimer);
  }

  function renderDividendUI(deltaMs) {
    if (!dividendInfo) return;
    dividendInfo.classList.toggle('hidden', !owned.u10);
    
    if (!owned.u10) {
      // Stop animation if dividends are disabled
      if (dividendAnimationId) {
        cancelAnimationFrame(dividendAnimationId);
        dividendAnimationId = null;
      }
      return;
    }
    
    // Start smooth animation if not already running
    if (!dividendAnimationId) {
      animateDividendTimer();
    }
    
    // Calculate speed multipliers (same as tickDividends)
      let speedMultiplier = 1;
      const speedBoost = getUpgradeEffectTotal('dividend_speed');
      speedMultiplier *= (1 - speedBoost);
      
      let rateMultiplier = getUpgradeEffectMultiplier('dividend_rate');
      
      // Apply prestige multiplier to dividend rate
      // rateMultiplier *= prestigeInterestMultiplier; // Commented out for balance - prestige should not affect rates
      
      // Market event effects on dividend rate
      if (marketBoomActive()) {
        rateMultiplier *= 1.5; // +50% during boom
      } else if (marketCrashActive()) {
        rateMultiplier *= 0.3; // -70% during crash
      } else if (greatDepressionActive()) {
        rateMultiplier = 0; // No dividends during depression (0% rate)
      }
      
      const interval = Math.floor(BASE_DIVIDEND_INTERVAL_MS * speedMultiplier);
      const rate = BASE_DIVIDEND_RATE * rateMultiplier;
      const intervalSeconds = Math.round(interval / 1000);
      const ratePercent = (rate * 100).toFixed(2);

    // Update dividend rate display
    const rateEl = document.getElementById('dividendRate');
    if (rateEl) {
      if (numberAnimator) {
        const currentText = rateEl.textContent.replace('%', '');
        const currentValue = parseFloat(currentText) || 0;
        numberAnimator.animateValue(rateEl, currentValue, parseFloat(ratePercent), 250, (value) => value.toFixed(2) + "%");
      } else {
        rateEl.textContent = ratePercent + "%";
      }
    }
    
    // Update dividend interval display
    const intervalEl = document.getElementById('dividendInterval');
    if (intervalEl) {
      intervalEl.textContent = `Every ${intervalSeconds}s`;
    }
    
    // Calculate and display dividend amount per payout
    const dividendAmount = investmentAccountBalance * rate;
    const dividendAmountEl = document.getElementById('dividendAmount');
    if (dividendAmountEl) {
      if (numberAnimator) {
        const currentAmount = parseDisplayedValue(dividendAmountEl.textContent);
        numberAnimator.animateValue(dividendAmountEl, currentAmount, dividendAmount, 250, animationFormatters.currency);
      } else {
        dividendAmountEl.textContent = '€' + formatNumberShort(dividendAmount);
      }
    }
  }

  function renderInvestmentUnlocked() {
    if (!investSection) return;
    investSection.classList.toggle('hidden', !owned.u11);
    
    // Always show the earnings metrics container, but hide individual elements based on unlock status
    const earningsMetricsContainer = document.querySelector('.earnings-metrics-container');
    if (earningsMetricsContainer) {
      earningsMetricsContainer.classList.remove('hidden'); // Always show the container
    }
    
    // Show/hide the entire investment account section in the header when investment is unlocked
    const headerInvestmentDisplay = document.getElementById('headerInvestmentDisplay');
    const headerInvestmentAccount = headerInvestmentDisplay?.closest('.header-account');
    if (headerInvestmentDisplay) {
      headerInvestmentDisplay.classList.toggle('hidden', !owned.u11);
    }
    if (headerInvestmentAccount) {
      headerInvestmentAccount.classList.toggle('hidden', !owned.u11);
    }
    
    // Individual element visibility within the container
    if (interestContainer) interestContainer.classList.toggle('hidden', !owned.u11);
    if (dividendInfo) dividendInfo.classList.toggle('hidden', !owned.u11 || !owned.u10);
  }


  function renderPrestigeMultipliers() {
    if (!prestigeMultipliers) return;
    // Always show multiplier in settings (never hide it)
    prestigeMultipliers.classList.remove('hidden');
    if (prestigeMultiplierEl) {
      // Use the higher of the two multipliers for display
      const displayMultiplier = Math.max(prestigeClickMultiplier, prestigeInterestMultiplier);
      if (prestigeTier > 0) {
        const tierName = getPrestigeTierName(prestigeTier);
        prestigeMultiplierEl.textContent = `Multiplier: ${displayMultiplier.toFixed(2)}x (${tierName})`;
      } else {
        prestigeMultiplierEl.textContent = `Multiplier: ${displayMultiplier.toFixed(2)}x`;
      }
    }
  }

  // Function to get prestige tier name based on tier number
  function getPrestigeTierName(tier) {
    return `T${tier}`;
  }

  // Make getPrestigeTierName globally accessible
  window.getPrestigeTierName = getPrestigeTierName;

  function renderAutoInvestSection() {
    if (!autoInvestSection) return;
    autoInvestSection.classList.toggle('hidden', !owned.u27);
  }

  function renderAutoRentSection() {
    if (!autoRentSection) return;
    autoRentSection.classList.toggle('hidden', !owned.u32);
  }

  function updateProgressBars() {
    // Update progress for all upgrades that have progress bars
    Object.keys(UPGRADE_CONFIG).forEach(upgradeId => {
      if (owned[upgradeId]) return; // Skip if already owned
      
      // Get the current price (including flash sale discounts)
      let cost = getUpgradeCost(upgradeId);
      
      // Apply Flash Sale discount (same logic as renderUpgradePrices)
      if (flashSaleActive()) {
        cost = cost * 0.75; // 25% off
      }
      
      const progress = Math.min((currentAccountBalance / cost) * 100, 100);
      
      const progressFill = document.getElementById(`${upgradeId}Progress`);
      const progressText = document.getElementById(`${upgradeId}ProgressText`);
      
      if (progressFill) {
        progressFill.style.width = `${progress}%`;
      }
      
      if (progressText) {
        progressText.textContent = `${Math.round(progress)}%`;
      }
    });
  }

  function handleAutoInvestToggle() {
    if (!autoInvestToggle) return;
    autoInvestEnabled = autoInvestToggle.checked;
    saveGameState();
  }

  function handleAutoRentToggle() {
    if (!autoRentToggle) return;
    autoRentEnabled = autoRentToggle.checked;
    saveGameState();
  }


  // New event-driven game loop
  function setupEventDrivenGameLoop() {
    if (!gameEngine) {
      // Fallback to old system if new system not available
      console.log('Game engine not available, using legacy game loop');
      setupLegacyGameLoop();
      return;
    }
    
    console.log('Using event-driven game loop');
    
    // Register render functions with render engine
    if (renderEngine) {
      renderEngine.registerRenderer('balances', renderBalances);
      renderEngine.registerRenderer('dividendUI', () => renderDividendUI(TICK_MS));
      renderEngine.registerRenderer('investmentUnlocked', renderInvestmentUnlocked);
      renderEngine.registerRenderer('prestigeMultipliers', renderPrestigeMultipliers);
      renderEngine.registerRenderer('autoInvestSection', renderAutoInvestSection);
      renderEngine.registerRenderer('autoRentSection', renderAutoRentSection);
      renderEngine.registerRenderer('clickStreak', renderClickStreak);
      renderEngine.registerRenderer('rentIncome', renderRentIncome);
      renderEngine.registerRenderer('upgradesOwned', renderUpgradesOwned);
      renderEngine.registerRenderer('allProperties', renderAllProperties);
      renderEngine.registerRenderer('activeEventDisplay', updateActiveEventDisplay);
      renderEngine.registerRenderer('upgradeIndicator', updateUpgradeIndicator);
      renderEngine.registerRenderer('portfolioIndicator', updatePortfolioIndicator);
      renderEngine.registerRenderer('progressBars', updateProgressBars);
    }
    
    // Schedule recurring game mechanics
    gameEngine.scheduleRecurringEvent('mainGameTick', (deltaTime) => {
      try {
        lastMainGameTick = Date.now();
        
    // Investment compounding: multiply per tick, boosted by upgrades
    if (investmentAccountBalance > 0) {
      const grown = investmentAccountBalance * getCompoundMultiplierPerTick();
      const growth = grown - investmentAccountBalance;
          investmentAccountBalance = Math.round((investmentAccountBalance + growth) * 100) / 100;
          renderEngine?.markDirty('balances');
    }

        // Property income - always use sync calculation for now to ensure it works
    const propertyIncome = getTotalPropertyIncome();
    if (propertyIncome > 0) {
      // Debug logging for property income after prestige reset
      /*
      if (prestigeTier > 0) {
        console.log('DEBUG: Property income detected after prestige reset:', propertyIncome, 'Properties:', properties);
      }
      */
      
      if (autoRentEnabled) {
            investmentAccountBalance = Math.round((investmentAccountBalance + propertyIncome) * 100) / 100;
      } else {
            currentAccountBalance = Math.round((currentAccountBalance + propertyIncome) * 100) / 100;
          }
          renderEngine?.markDirty('balances');
          renderEngine?.markDirty('rentIncome');
        }
        
        // Debug logging for property income (only when there's an issue)
        if (propertyIncome > 0) {
          // Only log occasionally to avoid spam
          if (Math.random() < 0.01) { // 1% chance
            console.log('Event-driven: Property income added:', propertyIncome, 'Auto-rent:', autoRentEnabled);
          }
        }

        // Dividends
    tickDividends(TICK_MS);
        renderEngine?.markDirty('dividendUI');
        
        // Mark UI elements as dirty based on active tab
        switch(activeTab) {
          case 'earn':
            renderEngine?.markDirty('investmentUnlocked');
            renderEngine?.markDirty('prestigeMultipliers');
            renderEngine?.markDirty('autoInvestSection');
            renderEngine?.markDirty('autoRentSection');
            renderEngine?.markDirty('clickStreak');
            break;
          case 'upgrades':
            renderEngine?.markDirty('upgradesOwned');
            break;
          case 'portfolio':
            renderEngine?.markDirty('allProperties');
            break;
        }
        
        // Always update these (needed for indicators and events)
        renderEngine?.markDirty('activeEventDisplay');
        renderEngine?.markDirty('upgradeIndicator');
        renderEngine?.markDirty('portfolioIndicator');
        renderEngine?.markDirty('progressBars');
        
        // Check expired events and streak timeout
        checkExpiredEvents();
        checkStreakTimeout();
        
        // Use idle time for non-critical tasks
        if (performanceManager) {
          performanceManager.runWhenIdle(() => {
            checkAchievementsOptimized();
          }, 'low');
        } else {
          checkAchievementsOptimized();
        }
      } catch (error) {
        console.error('Error in event-driven game loop:', error);
      }
    }, TICK_MS);
  }
  
  // Legacy game loop fallback
  function setupLegacyGameLoop() {
    const mainGameInterval = setInterval(() => {
      try {
        lastMainGameTick = Date.now();
        
        // Investment compounding: multiply per tick, boosted by upgrades
        if (investmentAccountBalance > 0) {
          const grown = investmentAccountBalance * getCompoundMultiplierPerTick();
          const growth = grown - investmentAccountBalance;
          investmentAccountBalance = Math.round((investmentAccountBalance + growth) * 100) / 100;
        }

        // Property income
        const propertyIncome = getTotalPropertyIncome();
        if (propertyIncome > 0) {
          if (autoRentEnabled) {
            investmentAccountBalance = Math.round((investmentAccountBalance + propertyIncome) * 100) / 100;
          } else {
            currentAccountBalance = Math.round((currentAccountBalance + propertyIncome) * 100) / 100;
          }
          // Debug logging for property income (only when there's an issue)
          if (Math.random() < 0.01) { // 1% chance
            console.log('Legacy: Property income added:', propertyIncome, 'Auto-rent:', autoRentEnabled);
          }
        }

        // Dividends
        tickDividends(TICK_MS);
    renderBalances();
    
    // Only render active tab content for performance
    switch(activeTab) {
      case 'earn':
    renderDividendUI(TICK_MS);
    renderInvestmentUnlocked();
    renderPrestigeMultipliers();
    renderAutoInvestSection();
        renderAutoRentSection();
    renderClickStreak();
            renderRentIncome();
        break;
      case 'upgrades':
        renderUpgradesOwned();
        break;
      case 'portfolio':
        renderAllProperties();
        break;
    }
    
    // Always update these (needed for indicators and events)
    updateActiveEventDisplay();
        checkExpiredEvents();
    checkStreakTimeout();
    updateUpgradeIndicator();
    updatePortfolioIndicator();
    updateProgressBars();
        checkAchievementsOptimized();
      } catch (error) {
        console.error('Error in legacy game loop:', error);
      }
  }, TICK_MS);
    
    // Store reference for cleanup
    window.mainGameInterval = mainGameInterval;
  }

  // Net worth data collection removed for performance
  
  // Events check - use new system if available
  function setupEventDrivenEvents() {
    if (gameEngine) {
      gameEngine.scheduleRecurringEvent('eventsCheck', (deltaTime) => {
        try {
          lastEventCheck = Date.now();
    checkEvents();
        } catch (error) {
          console.error('Error in event-driven events check:', error);
        }
      }, getIntervalConfig('EVENTS_CHECK'));
    } else {
      // Fallback to legacy system
      const eventsInterval = setInterval(() => {
        try {
          lastEventCheck = Date.now();
          checkEvents();
        } catch (error) {
          console.error('Error in legacy events check:', error);
        }
      }, getIntervalConfig('EVENTS_CHECK'));
      window.eventsInterval = eventsInterval;
    }
  }

  // Loading screen functionality
  function showLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
      loadingScreen.classList.remove('hidden');
    }
  }

  function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
      loadingScreen.classList.add('hidden');
      // Remove from DOM after animation completes
      setTimeout(() => {
        if (loadingScreen.parentNode) {
          loadingScreen.parentNode.removeChild(loadingScreen);
        }
      }, 500);
    }
  }

  function initializeGame() {
  // Clear any leftover backgrounded timestamp from previous session
  localStorage.removeItem('moneyClicker_tabBackgroundedAt');
  
  // Load saved game state first (after DOM elements are ready)
  const gameStateLoaded = loadGameState();
  
  // Update buy multiplier display after game state is loaded
  if (gameStateLoaded) {
    updateBuyMultiplierDisplay();
  }
  
  // Initialize achievementsBannerShown for already unlocked achievements (prevent notifications on load)
  if (gameStateLoaded) {
    for (const [achievementId, achievement] of Object.entries(achievements)) {
      if (achievement.unlocked && !achievementsBannerShown[achievementId]) {
        achievementsBannerShown[achievementId] = true;
      }
    }
    
    // Try to start music after a short delay if it was enabled (fallback for autoplay restrictions)
    if (AudioSystem.getAudioSettings().musicEnabled) {
      setTimeout(() => {
        if (AudioSystem.getAudioSettings().musicEnabled) {
          AudioSystem.startBackgroundMusic();
        }
      }, 1000);
    }
  }
  
  // Initialize performance systems
  initializePerformanceSystems();
  
  // Setup new event-driven systems after performance systems are initialized
  setupEventDrivenGameLoop();
  setupEventDrivenEvents();
  setupEventDrivenSaving();
  
  // Cache DOM elements for performance optimization
  cacheDOMElements();
  
  // Initialize procedural tier system
  addSpecialShineAnimation();
  
  // Invalidate property income cache to ensure fresh calculation
  propertyIncomeCacheValid = false;

  // Auto-submit functionality disabled - users must manually submit scores
  // if (currentUser) {
  //   startAutoSubmit();
  // }

  // Auto-submit disabled - no cleanup needed
  // window.addEventListener('beforeunload', () => {
  //   stopAutoSubmit();
  // });

  // Generate upgrade HTML from configuration
  generateAllUpgradeHTML();

  // Set up event listeners for upgrade buy buttons
  setupUpgradeButtonEventListeners();

  // Generate achievement HTML from configuration
  generateAllAchievementHTML();

  // Initialize upgrade visibility state before rendering
  initUpgradeVisibility();
  updateToggleCompletedUI();

  renderBalances();
  renderUpgradePrices();
  renderActiveTab(); // Render only the active tab for performance
  // Apply upgrade visibility rules now that hide-completed class is set
  // Use requestAnimationFrame to ensure DOM is fully rendered
  requestAnimationFrame(() => {
  sortUpgradesByCost();
  });
  renderInvestmentUnlocked();
  renderPrestigeMultipliers();
  renderAutoInvestSection();
  renderClickStreak();
  updateProgressBars();
  
  // Net worth chart initialization removed for performance
  renderAchievements();
    renderEventLogs();
  updateUpgradeIndicator();
    updatePortfolioIndicator();
    
    // Initialize leaderboard
    loadLeaderboard();
    
    // Check submission status and update UI
    updateSubmissionStatus();
    
    // Set up timer to update submission status every second
    
    // Add leaderboard event listeners
    const submitBtn = document.getElementById('submitScoreBtn');
    
    if (submitBtn) {
      submitBtn.addEventListener('click', submitScore);
    }
  }


  // Desktop detection and warning
  function checkDesktopWarning() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                     window.innerWidth <= 768 || 
                     ('ontouchstart' in window);
    
    if (!isMobile) {
      const desktopWarning = document.getElementById('desktopWarning');
      const desktopContinueBtn = document.getElementById('desktopContinueBtn');
      
      if (desktopWarning && desktopContinueBtn) {
        desktopWarning.classList.remove('hidden');
        
        desktopContinueBtn.addEventListener('click', () => {
          desktopWarning.classList.add('hidden');
        });
      }
    }
  }

  // Check if user is on desktop and show warning
  checkDesktopWarning();

  // Show loading screen and initialize game after 2 seconds
  showLoadingScreen();
  setTimeout(() => {
    initializeGame();
    hideLoadingScreen();
  }, 1500);
  
  // Settings panel functionality
  const settingsToggle = document.getElementById('settingsToggle');
  const settingsMenu = document.getElementById('settingsMenu');
  const musicToggle = document.getElementById('musicToggle');
  const soundEffectsToggle = document.getElementById('soundEffectsToggle');
  const particleEffectsToggle = document.getElementById('particleEffectsToggle');
  const numberAnimationsToggle = document.getElementById('numberAnimationsToggle');
  const darkModeToggle = document.getElementById('darkModeToggle');

  // Auto Invest Help Modal functionality
  const autoInvestHelpBtn = document.getElementById('autoInvestHelpBtn');
  const autoInvestModal = document.getElementById('autoInvestModal');
  const autoInvestModalClose = document.getElementById('autoInvestModalClose');
  
  // Auto Rent Help Modal functionality
  const autoRentHelpBtn = document.getElementById('autoRentHelpBtn');
  const autoRentModal = document.getElementById('autoRentModal');
  const autoRentModalClose = document.getElementById('autoRentModalClose');

  // Load audio settings from localStorage
  function loadAudioSettings() {
    const savedMusicEnabled = localStorage.getItem('musicEnabled');
    const savedSoundEffectsEnabled = localStorage.getItem('soundEffectsEnabled');
    const savedParticleEffectsEnabled = localStorage.getItem('particleEffectsEnabled');
    const savedNumberAnimationsEnabled = localStorage.getItem('numberAnimationsEnabled');
    const savedDarkMode = localStorage.getItem('darkMode');
    
    if (savedMusicEnabled !== null) {
      AudioSystem.setMusicEnabled(savedMusicEnabled === 'true');
      if (musicToggle) musicToggle.checked = AudioSystem.getAudioSettings().musicEnabled;
    }
    
    if (savedSoundEffectsEnabled !== null) {
      AudioSystem.setSoundEffectsEnabled(savedSoundEffectsEnabled === 'true');
      if (soundEffectsToggle) soundEffectsToggle.checked = AudioSystem.getAudioSettings().soundEffectsEnabled;
    }
    
    if (savedParticleEffectsEnabled !== null) {
      particleEffectsEnabled = savedParticleEffectsEnabled === 'true';
      if (particleEffectsToggle) particleEffectsToggle.checked = particleEffectsEnabled;
    }
    
    if (savedNumberAnimationsEnabled !== null) {
      numberAnimationsEnabled = savedNumberAnimationsEnabled === 'true';
      if (numberAnimationsToggle) numberAnimationsToggle.checked = numberAnimationsEnabled;
    }
    
    if (savedDarkMode !== null) {
      const isDarkMode = savedDarkMode === 'true';
      if (darkModeToggle) darkModeToggle.checked = isDarkMode;
      if (isDarkMode) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
    }
    
    // Username is now handled by Google authentication
    
    // Apply music setting on load
    if (!AudioSystem.getAudioSettings().musicEnabled) {
      AudioSystem.pauseAllAudio();
    } else {
      // If music should be enabled, try to start it
      AudioSystem.startBackgroundMusic();
    }
  }

  // Save audio settings to localStorage
  function saveAudioSettings() {
    localStorage.setItem('musicEnabled', AudioSystem.getAudioSettings().musicEnabled.toString());
    localStorage.setItem('soundEffectsEnabled', AudioSystem.getAudioSettings().soundEffectsEnabled.toString());
    localStorage.setItem('particleEffectsEnabled', particleEffectsEnabled.toString());
    localStorage.setItem('numberAnimationsEnabled', numberAnimationsEnabled.toString());
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode').toString());
    // Username is now handled by Google authentication
  }

  // Apply audio settings to UI and audio
  function applyAudioSettings() {
    // Update toggle UI
    if (musicToggle) musicToggle.checked = AudioSystem.getAudioSettings().musicEnabled;
    if (soundEffectsToggle) soundEffectsToggle.checked = AudioSystem.getAudioSettings().soundEffectsEnabled;
    if (particleEffectsToggle) particleEffectsToggle.checked = particleEffectsEnabled;
    if (numberAnimationsToggle) numberAnimationsToggle.checked = numberAnimationsEnabled;
    
    // Apply music setting
    if (!AudioSystem.getAudioSettings().musicEnabled) {
      AudioSystem.pauseAllAudio();
    } else {
      // Try to start music if it should be enabled
      AudioSystem.startBackgroundMusic();
    }
  }

  // Toggle settings menu
  if (settingsToggle && settingsMenu) {
    settingsToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      settingsMenu.classList.toggle('hidden');
    });

    // Close settings menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!settingsMenu.contains(e.target) && !settingsToggle.contains(e.target)) {
        settingsMenu.classList.add('hidden');
      }
    });
  }

  // Music toggle functionality
  if (musicToggle) {
    musicToggle.addEventListener('change', (e) => {
      AudioSystem.setMusicEnabled(e.target.checked);
      console.log('Music toggle changed to:', AudioSystem.getAudioSettings().musicEnabled);
      saveAudioSettings();
      AudioSystem.toggleBackgroundMusic();
    });
  }

  // Cheat system variables
  let cheatToggleCount = 0;
  let lastToggleTime = 0;
  const cheatSection = document.getElementById('cheatSection');
  const addMoneyBtn = document.getElementById('addMoneyBtn');

  // Sound effects toggle functionality
  if (soundEffectsToggle) {
    soundEffectsToggle.addEventListener('change', (e) => {
      AudioSystem.setSoundEffectsEnabled(e.target.checked);
      saveAudioSettings();
      
      // Handle cheat activation
      handleCheatToggle();
    });
  }

  // Particle effects toggle functionality
  if (particleEffectsToggle) {
    particleEffectsToggle.addEventListener('change', (e) => {
      particleEffectsEnabled = e.target.checked;
      saveAudioSettings();
      console.log('Particle effects toggle changed to:', particleEffectsEnabled);
    });
  }

  // Number animations toggle functionality
  if (numberAnimationsToggle) {
    numberAnimationsToggle.addEventListener('change', (e) => {
      numberAnimationsEnabled = e.target.checked;
      saveAudioSettings();
      console.log('Number animations toggle changed to:', numberAnimationsEnabled);
    });
  }

  // Dark mode toggle functionality
  if (darkModeToggle) {
    darkModeToggle.addEventListener('change', (e) => {
      const isDarkMode = e.target.checked;
      if (isDarkMode) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
      saveAudioSettings();
      console.log('Dark mode toggle changed to:', isDarkMode);
    });
  }

  // Cheat system functions
  function handleCheatToggle() {
    const currentTime = Date.now();
    
    // Reset counter if more than 5 seconds have passed since last toggle
    if (currentTime - lastToggleTime > 5000) {
      cheatToggleCount = 0;
    }
    
    // Increment counter and update last toggle time
    cheatToggleCount++;
    lastToggleTime = currentTime;
    
    // Show cheat button after 3 consecutive toggles
    if (cheatToggleCount >= 8) {
      showCheatButton();
    }
  }
  
  function showCheatButton() {
    if (cheatSection) {
      cheatSection.classList.remove('hidden');
    }
  }
  
  function hideCheatButton() {
    if (cheatSection) {
      cheatSection.classList.add('hidden');
    }
    cheatToggleCount = 0; // Reset counter
  }
  
  function addCheatMoney() {
    // Apply 10x multiplier to both click and interest income
    console.log('Before 10x multiplier button - multipliers:', {
      click: prestigeClickMultiplier,
      interest: prestigeInterestMultiplier
    });
    prestigeClickMultiplier *= 10;
    prestigeInterestMultiplier *= 10;
    console.log('After 10x multiplier button - multipliers:', {
      click: prestigeClickMultiplier,
      interest: prestigeInterestMultiplier
    });
    
    // Create celebration particles
    if (particleSystem) {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      // Create golden money particles
      if (particleEffectsEnabled) {
      particleSystem.createGoldenParticles(centerX, centerY, 30);
      particleSystem.createMilestoneParticles(centerX, centerY, 20);
      }
      
      // Screen effects
      screenFlash('#ffd700', 600); // Golden flash
      screenShake(8, 400); // Gentle shake
    }
    
    // Play success sound
    if (AudioSystem.getAudioSettings().soundEnabled && AudioSystem.getAudioSettings().soundEffectsEnabled) {
      AudioSystem.playSuccessSound();
    }
    
    // Update UI
    window.renderBalances();
    
    // Hide the cheat button after use
    hideCheatButton();
  }

  // Difficulty selector functionality
  const difficultySelect = document.getElementById('difficultySelect');
  if (difficultySelect) {
    difficultySelect.addEventListener('change', (e) => {
      setGameDifficulty(e.target.value);
      saveGameState();
      console.log('Game difficulty changed to:', getGameDifficulty());
    });
  }

  // Cheat button event listener
  if (addMoneyBtn) {
    addMoneyBtn.addEventListener('click', addCheatMoney);
  }

  // Initialize cheat system - hide button on load
  if (cheatSection) {
    cheatSection.classList.add('hidden');
  }

  // Simple event listeners for hard reset
  document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'hardResetBtn') {
      performHardReset();
    } else if (e.target && e.target.id === 'hardResetCancel') {
      cancelHardReset();
    } else if (e.target && e.target.id === 'hardResetConfirm') {
      executeHardReset();
    } else if (e.target && e.target.id === 'hardResetModal') {
      // Close modal when clicking outside
      cancelHardReset();
    }
  });
  

  // Mobile Navigation functionality
  function initMobileNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const panelsContainer = document.querySelector('.panels');
    
    if (!navButtons.length || !panelsContainer) return;
    
    // Panel mapping
    const panelMap = {
      'earn': 0,
      'upgrades': 1,
      'portfolio': 2,
      'achievements': 3,
      'stats': 4,
      'games': 5
    };
    
    let isScrolling = false;
    let scrollTimeout = null;
    
    navButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const panelName = button.getAttribute('data-panel');
        const panelIndex = panelMap[panelName];
        
        // Update active tab for performance optimization
        activeTab = panelName;
        
        // Render the newly active tab immediately
        renderActiveTab();
        
        if (panelIndex !== undefined) {
          // Immediately update active button to prevent jittering
          navButtons.forEach(btn => btn.classList.remove('active'));
          button.classList.add('active');
          
          // Set scrolling flag to prevent scroll event from overriding
          isScrolling = true;
          
          // Scroll to panel
          const panelWidth = window.innerWidth - 32; // Account for padding
          panelsContainer.scrollLeft = panelWidth * panelIndex;
          
          // Clear scrolling flag after instant scroll completes
          setTimeout(() => {
            isScrolling = false;
          }, 10); // Minimal timeout for instant scrolling
        }
      });
    });
    
    // Update active button based on scroll position (debounced)
    panelsContainer.addEventListener('scroll', () => {
      // Don't update if we're programmatically scrolling
      if (isScrolling) return;
      
      // Clear existing timeout
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      
      // Debounce scroll updates to prevent rapid changes
      scrollTimeout = setTimeout(() => {
        const scrollLeft = panelsContainer.scrollLeft;
        const panelWidth = window.innerWidth - 32;
        const currentPanel = Math.round(scrollLeft / panelWidth);
        
        // Only update if the panel actually changed
        const currentActive = document.querySelector('.nav-btn.active');
        const currentActiveIndex = Array.from(navButtons).indexOf(currentActive);
        
        if (currentActiveIndex !== currentPanel) {
          navButtons.forEach(btn => btn.classList.remove('active'));
          if (navButtons[currentPanel]) {
            navButtons[currentPanel].classList.add('active');
          }
        }
      }, 100); // Small delay to debounce rapid scroll events
    });
  }
  
  // Initialize mobile navigation
  initMobileNavigation();

// Check if Font Awesome loaded and apply fallback if needed
function checkFontAwesome() {
  // Check if Font Awesome CSS is loaded by testing if a Font Awesome class exists
  const testElement = document.createElement('i');
  testElement.className = 'fas fa-coins';
  testElement.style.position = 'absolute';
  testElement.style.left = '-9999px';
  document.body.appendChild(testElement);
  
  const computedStyle = window.getComputedStyle(testElement);
  const fontFamily = computedStyle.getPropertyValue('font-family');
  
  document.body.removeChild(testElement);
  
  // If Font Awesome didn't load (no Font Awesome font family), use fallback
  if (!fontFamily.includes('Font Awesome')) {
    console.log('Font Awesome not loaded, using emoji fallbacks');
    const navIcons = document.querySelectorAll('.nav-icon');
    navIcons.forEach(icon => {
      icon.classList.add('fallback');
    });
  } else {
    console.log('Font Awesome loaded successfully');
  }
}

// Check Font Awesome after a short delay to allow it to load
setTimeout(checkFontAwesome, 1000);

// Automatic cache clearing on page load (preserves game data)
function clearCacheOnLoad() {
  if ('caches' in window) {
    caches.keys().then((cacheNames) => {
      const deletePromises = cacheNames.map((cacheName) => {
        console.log('Auto-clearing cache:', cacheName);
        return caches.delete(cacheName);
      });
      
      Promise.all(deletePromises).then(() => {
        console.log('All caches auto-cleared on page load');
      }).catch((error) => {
        console.error('Error auto-clearing caches:', error);
      });
    });
  }
}

// Clear cache immediately on page load
clearCacheOnLoad();

// Handle app visibility changes (only pause audio for idle game)
function handleVisibilityChange() {
  if (document.hidden) {
    // App went to background - only pause audio to save battery
    // Game logic continues running for idle game mechanics
    AudioSystem.pauseAllAudio();
    
    // Save timestamp when going to background for offline earnings calculation
    window.tabBackgroundedAt = Date.now();
    localStorage.setItem('moneyClicker_tabBackgroundedAt', window.tabBackgroundedAt.toString());
    console.log('🔍 [VISIBILITY DEBUG] Tab went to background at:', new Date(window.tabBackgroundedAt));
    
    // Mobile performance optimization: pause heavy operations when backgrounded
    if (mobilePerformanceMode && GAME_CONFIG.MOBILE_PERFORMANCE.PAUSE_BACKGROUND) {
      // Pause particle animations to reduce CPU usage
      if (particleSystem) {
        particleSystem.stopAnimation();
      }
      // Pause number animations
      if (numberAnimator) {
        numberAnimator.stopAnimation();
      }
    }
    // console.log('Audio paused - app went to background (game continues running)');
  } else {
    // App came to foreground - resume audio if it was enabled
    if (AudioSystem.getAudioSettings().musicEnabled) {
      AudioSystem.startBackgroundMusic();
    }
    
    // Check for offline earnings from tab backgrounding
    let backgroundedTimestamp = window.tabBackgroundedAt;
    if (!backgroundedTimestamp) {
      // Check localStorage in case page was refreshed while backgrounded
      const storedTimestamp = localStorage.getItem('moneyClicker_tabBackgroundedAt');
      if (storedTimestamp) {
        backgroundedTimestamp = parseInt(storedTimestamp);
        window.tabBackgroundedAt = backgroundedTimestamp;
      }
    }
    
    if (backgroundedTimestamp) {
      const timeBackgrounded = Date.now() - backgroundedTimestamp;
      const minOfflineMs = GAME_CONFIG.OFFLINE_EARNINGS.MIN_OFFLINE_MINUTES * 60 * 1000;
      
      console.log('🔍 [VISIBILITY DEBUG] Tab came to foreground after:', timeBackgrounded, 'ms');
      
      if (timeBackgrounded >= minOfflineMs) {
        console.log('🔍 [VISIBILITY DEBUG] Calculating offline earnings from tab backgrounding...');
        
        // Calculate offline earnings using the backgrounded timestamp
        const offlineEarnings = calculateOfflineEarnings(backgroundedTimestamp);
        
        if (offlineEarnings && offlineEarnings.totalIncome > 0) {
          console.log('🔍 [VISIBILITY DEBUG] Valid offline earnings found, showing popup in 1 second...');
          setTimeout(() => {
            showOfflineEarningsPopup(offlineEarnings);
          }, 1000);
        }
      }
      
      // Clear the backgrounded timestamp from both memory and localStorage
      window.tabBackgroundedAt = null;
      localStorage.removeItem('moneyClicker_tabBackgroundedAt');
    }
    
    // Mobile performance optimization: resume animations when foregrounded
    if (mobilePerformanceMode && GAME_CONFIG.MOBILE_PERFORMANCE.PAUSE_BACKGROUND) {
      // Resume particle animations
      if (particleSystem && particleEffectsEnabled) {
        particleSystem.startAnimation();
      }
      // Resume number animations
      if (numberAnimator) {
        numberAnimator.startAnimation();
      }
    }
    // console.log('Audio resumed - app came to foreground');
  }
}

// Add event listener for visibility changes
document.addEventListener('visibilitychange', handleVisibilityChange);


// Handle page focus/blur events (only pause audio for idle game)
window.addEventListener('blur', () => {
  AudioSystem.pauseAllAudio();
  // console.log('Audio paused - window lost focus (game continues running)');
});

window.addEventListener('focus', () => {
  if (AudioSystem.getAudioSettings().musicEnabled) {
    AudioSystem.startBackgroundMusic();
    // console.log('Audio resumed - window gained focus');
  }
});

// Handle mobile app lifecycle events (only pause audio for idle game)
document.addEventListener('pause', () => {
  AudioSystem.pauseAllAudio();
  // console.log('Audio paused - app paused (mobile, game continues running)');
});

document.addEventListener('resume', () => {
  if (AudioSystem.getAudioSettings().musicEnabled) {
    AudioSystem.startBackgroundMusic();
    // console.log('Audio resumed - app resumed (mobile)');
  }
});

// Achievement banner close button event listener
const achievementBannerClose = document.getElementById('achievementBannerClose');
if (achievementBannerClose) {
  achievementBannerClose.addEventListener('click', () => {
    const banner = document.getElementById('achievementBanner');
    if (banner) {
      banner.classList.remove('show');
      setTimeout(() => {
        banner.classList.add('hidden');
      }, 400);
    }
  });
}

// Cleanup function to prevent memory leaks
function cleanup() {
  // Stop new performance systems
  if (gameEngine) {
    gameEngine.stop();
  }
  if (renderEngine) {
    renderEngine.stop();
  }
  if (performanceManager) {
    performanceManager.destroy();
  }
  
  // Clear all intervals (legacy fallback)
  if (typeof cacheCleanupInterval !== 'undefined') clearInterval(cacheCleanupInterval);
  if (typeof mainGameInterval !== 'undefined') clearInterval(mainGameInterval);
  if (typeof eventsInterval !== 'undefined') clearInterval(eventsInterval);
  if (typeof saveInterval !== 'undefined') clearInterval(saveInterval);
  if (typeof submissionStatusInterval !== 'undefined') clearInterval(submissionStatusInterval);
  if (typeof upgradeUpdateInterval !== 'undefined') clearInterval(upgradeUpdateInterval);
  
  // Stop animation systems
  if (particleSystem) particleSystem.destroy();
  if (numberAnimator) numberAnimator.destroy();
  
  // Pause background music
  AudioSystem.pauseAllAudio();
  
  // Save game state
  saveGameState();
}

// Handle page unload (when user closes tab/app)
window.addEventListener('beforeunload', cleanup);

  
  // Console debugging functions
  function addMoney(amount) {
    if (typeof amount !== 'number' || amount <= 0) {
      console.log('❌ Invalid amount. Please provide a positive number.');
      return;
    }
    
    currentAccountBalance += amount;
    
    // Force immediate UI update
    renderBalances();
    
    console.log(`💰 Added €${formatNumberShort(amount)} to current account!`);
    console.log(`💳 New balance: €${formatNumberShort(currentAccountBalance)}`);
    
    // Save game state
    saveGameState();
  }
  
  function setBalance(amount) {
    if (typeof amount !== 'number' || amount < 0) {
      console.log('❌ Invalid amount. Please provide a non-negative number.');
      return;
    }
    
    const oldBalance = currentAccountBalance;
    // Set balance directly (no money cap)
    currentAccountBalance = amount;
    
    // Force immediate UI update
    renderBalances();
    
    console.log(`💳 Balance set to €${formatNumberShort(amount)}!`);
    if (oldBalance !== amount) {
      const difference = amount - oldBalance;
      if (difference > 0) {
        console.log(`📈 Increased by €${formatNumberShort(difference)}`);
      } else {
        console.log(`📉 Decreased by €${formatNumberShort(Math.abs(difference))}`);
      }
    }
    
    // Save game state
    saveGameState();
  }
  
  // Console function to check upgrade statistics
  
  // Make functions globally available
  window.addMoney = addMoney;
  window.setBalance = setBalance;

  // Register Service Worker for PWA functionality
  if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    console.log('Attempting to register service worker...');
    navigator.serviceWorker.register('./sw.js')
      .then((registration) => {
        console.log('SW registered successfully: ', registration);
        console.log('Scope: ', registration.scope);
        
        // Force service worker update after registration
        registration.update();
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
} else {
  console.log('Service Worker not supported');
}

  
  // Initialize audio on first user interaction
    AudioSystem.initAudio();
  
  // Initialize background music immediately when page loads
  AudioSystem.initBackgroundMusic();
  
  // Initialize particle system
  particleSystem = new ParticleSystem();
  
  // Initialize number animator
  numberAnimator = new NumberAnimator();

  // Note: Removed visibility-based animation pausing for idle game
  // Game continues running even when tab is hidden
  
  // Initialize upgrade visibility state (will be called after DOM is ready)
  function initUpgradeVisibility() {
    const upgradesSection = document.getElementById('upgradesSection');
    if (upgradesSection) {
      // Default: hide completed upgrades to show next available ones
      upgradesSection.classList.add('hide-completed');
    }
  }
  
  // Load saved audio settings
  loadAudioSettings();
  
  // Load saved game state - moved to initializeGame() to ensure DOM elements are ready
  
  // Initialize achievementsBannerShown for already unlocked achievements (prevent notifications on load)
  // Note: This will be handled in initializeGame() after game state is loaded
  
  // Update buy multiplier display after game state is loaded
  // Note: This will be handled in initializeGame() after game state is loaded
  
  // Try to start music after a short delay if it was enabled (fallback for autoplay restrictions)
  // Note: This will be handled in initializeGame() after game state is loaded
  
  // Periodic saving - use new system if available
  function setupEventDrivenSaving() {
    if (gameEngine) {
      gameEngine.scheduleRecurringEvent('gameSave', (deltaTime) => {
        try {
          lastSave = Date.now();
    saveGameState();
        } catch (error) {
          console.error('Error in event-driven save:', error);
        }
      }, getIntervalConfig('GAME_SAVE'));
    } else {
      // Fallback to legacy system
      const saveInterval = setInterval(() => {
        try {
          lastSave = Date.now();
          saveGameState();
        } catch (error) {
          console.error('Error in legacy save interval:', error);
        }
      }, getIntervalConfig('GAME_SAVE'));
      window.saveInterval = saveInterval;
    }
  }

  // renderInterestPerSecond function moved earlier in file

  // Render rent income display
  function renderRentIncome() {
    const rentContainer = document.getElementById('rentContainer');
    const rentRate = document.getElementById('rentRate');
    const rentPerSecond = document.getElementById('rentPerSecond');
    
    if (!rentContainer || !rentRate || !rentPerSecond) return;
    
    // Always show the rent container (no longer hidden when no properties)
    rentContainer.classList.remove('hidden');
    
    // Calculate total rent income
    const totalRentIncome = getTotalPropertyIncome();
    const formattedRent = formatNumberShort(totalRentIncome);
    
    // Update rent rate (number of properties)
    const totalProperties = Object.values(properties).reduce((sum, count) => sum + count, 0);
    rentRate.textContent = totalProperties.toString();
    
    // Update rent per second (using compact format)
    rentPerSecond.textContent = `€${formattedRent}/s`;
    
    // Apply earthquake styling if active
    if (earthquakeActive()) {
      rentContainer.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.1) 100%)';
      rentContainer.style.borderColor = 'rgba(239, 68, 68, 0.4)';
      rentContainer.style.color = '#dc2626';
      rentPerSecond.style.color = '#dc2626';
      rentRate.style.color = '#dc2626';
      } else {
      // Reset to normal styling
      rentContainer.style.background = '';
      rentContainer.style.borderColor = '';
      rentContainer.style.color = '';
      rentPerSecond.style.color = '';
      rentRate.style.color = '';
    }
  }

  // Make renderRentIncome globally accessible for eventTrigger.js
  window.renderRentIncome = renderRentIncome;

  // Initialize interest per second display and set up periodic updates
  (function initInterestPerSecond() {
    if (!interestPerSecEl) return;
    const update = () => {
      renderInterestPerSecond();
    };
    update();
    
    // Use new system if available
    if (gameEngine) {
      gameEngine.scheduleRecurringEvent('upgradeUpdate', update, getIntervalConfig('UPGRADE_UPDATE'));
    } else {
      // Fallback to legacy system
      const upgradeUpdateInterval = setInterval(update, getIntervalConfig('UPGRADE_UPDATE'));
      window.upgradeUpdateInterval = upgradeUpdateInterval;
    }
  })();
  
  // Setup new event-driven systems - moved to initializeGame() function

  // Mobile horizontal scrolling enhancements
  (function initMobileScrolling() {
    const panelsContainer = document.querySelector('.panels');
    if (!panelsContainer) return;

    // Add visual feedback for scroll position
    function updateScrollIndicators() {
      const scrollLeft = panelsContainer.scrollLeft;
      const maxScroll = panelsContainer.scrollWidth - panelsContainer.clientWidth;
      
      // Update fade indicators based on scroll position
      if (scrollLeft <= 10) {
        panelsContainer.style.setProperty('--left-fade-opacity', '0');
      } else {
        panelsContainer.style.setProperty('--left-fade-opacity', '1');
      }
      
      if (scrollLeft >= maxScroll - 10) {
        panelsContainer.style.setProperty('--right-fade-opacity', '0');
      } else {
        panelsContainer.style.setProperty('--right-fade-opacity', '1');
      }
    }

    // Debounced scroll handler for visual indicators
    let scrollIndicatorTimeout;
    const debouncedUpdateScrollIndicators = () => {
      clearTimeout(scrollIndicatorTimeout);
      scrollIndicatorTimeout = setTimeout(updateScrollIndicators, 16); // ~60fps
    };
    
    panelsContainer.addEventListener('scroll', debouncedUpdateScrollIndicators, { passive: true });
    updateScrollIndicators(); // Initial call
  })();

  // Game state management functions
  function getCurrentGameState() {
    return {
      // Core balances
      currentAccountBalance,
      investmentAccountBalance,
      
      // Upgrades owned
      owned: { ...owned },
      
      // Properties owned
      properties: { ...properties },
      
      // Statistics
      totalDividendsReceived,
      hasMadeFirstInvestment,
      
      // Click streak system
      streakCount,
      streakMultiplier,
      lastClickTime,
      
      // Prestige multipliers
      prestigeClickMultiplier,
      prestigeInterestMultiplier,
      
      // Prestige tier
      prestigeTier,
      
      // Buy multiplier
      buyMultiplier,
      
      // Audio settings
      musicEnabled: AudioSystem.getAudioSettings().musicEnabled,
      soundEffectsEnabled: AudioSystem.getAudioSettings().soundEffectsEnabled,
      particleEffectsEnabled,
      numberAnimationsEnabled,
      
      // Auto invest settings
      autoInvestEnabled,
      autoRentEnabled,
      
      // Game difficulty
      gameDifficulty: getGameDifficulty(),
      
      // Dark mode
      darkMode: document.body.classList.contains('dark-mode'),
      
      // Event logs
      eventLogs: [...eventLogs],
      
      // Last saved timestamp
      lastSaved: Date.now()
    };
  }

  // Make getCurrentGameState globally accessible
  window.getCurrentGameState = getCurrentGameState;
  
  // Make updateSubmissionStatus globally accessible
  window.updateSubmissionStatus = updateSubmissionStatus;
})();

// PWA Install Prompt Functionality
let deferredPrompt;
let installPromptShown = false;

function isRunningAsPWA() {
  // Method 1: Check if display mode is standalone (most reliable)
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }
  
  // Method 2: Check if window.navigator.standalone is true (iOS Safari)
  if (window.navigator.standalone === true) {
    return true;
  }
  
  // Method 3: Check if the app was launched from home screen
  // This works by checking if there's no referrer and the document was loaded via a link
  if (document.referrer === '' && window.location.search.includes('homescreen=1')) {
    return true;
  }
  
  // Method 4: Check if the app is running in fullscreen mode
  if (window.screen.height - window.innerHeight < 100) {
    // If the difference is small, it might be running as PWA
    // This is less reliable but can help in some cases
    return window.matchMedia('(display-mode: minimal-ui)').matches;
  }
  
  return false;
}

function initPWAInstallPrompt() {
  // Check if app is already installed (PWA mode)
  if (isRunningAsPWA()) {
    console.log('App is running as PWA - no install prompt needed');
    return; // Don't show install prompt if already installed
  }

  // Listen for the beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Show our custom install prompt after a delay
    setTimeout(() => {
      showInstallPrompt();
    }, 1000); // Show after 1 second
  });

  // Fallback: Show install prompt even without beforeinstallprompt event
  // This ensures the prompt shows on browsers that don't support the native prompt
  setTimeout(() => {
    if (!installPromptShown && !deferredPrompt) {
      showInstallPrompt();
    }
  }, 3000); // Show after 3 seconds if no native prompt

  // Listen for the app installed event
  window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    hideInstallPrompt();
    installPromptShown = true;
  });

  // Handle install button click
  const installBtn = document.getElementById('installBtn');
  if (installBtn) {
    installBtn.addEventListener('click', async () => {
      if (deferredPrompt) {
        // Show the native install prompt
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        deferredPrompt = null;
        
        if (outcome === 'accepted') {
          hideInstallPrompt();
        }
      } else {
        // Fallback: Try to trigger the browser's add to home screen functionality
        triggerAddToHomeScreen();
      }
    });
  }

  // Handle dismiss button click
  const dismissBtn = document.getElementById('installDismiss');
  if (dismissBtn) {
    dismissBtn.addEventListener('click', () => {
      hideInstallPrompt();
      installPromptShown = true;
    });
  }

  // Check if already installed
  if (isRunningAsPWA()) {
    console.log('PWA is already installed');
    installPromptShown = true;
  }



}

function showInstallPrompt() {
  if (installPromptShown) return;
  
  const installPrompt = document.getElementById('installPrompt');
  if (installPrompt) {
    installPrompt.classList.remove('hidden');
    setTimeout(() => {
      installPrompt.classList.add('show');
    }, 100);
  }
}

function hideInstallPrompt() {
  const installPrompt = document.getElementById('installPrompt');
  if (installPrompt) {
    installPrompt.classList.remove('show');
    setTimeout(() => {
      installPrompt.classList.add('hidden');
    }, 300);
  }
}

function triggerAddToHomeScreen() {
  // Try to detect the device and browser to provide the best experience
  const userAgent = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  const isAndroid = /android/.test(userAgent);
  const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent);
  const isChrome = /chrome/.test(userAgent);

  if (isIOS && isSafari) {
    // iOS Safari - show a more helpful prompt
    showIOSInstallGuide();
  } else if (isAndroid && isChrome) {
    // Android Chrome - try to trigger the install prompt
    showAndroidInstallGuide();
  } else {
    // Fallback for other browsers
    showGenericInstallGuide();
  }
}

function showIOSInstallGuide() {
  // Create a modal-style guide for iOS users
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
  `;
  
  modal.innerHTML = `
    <div style="
      background: white;
      padding: 30px;
      border-radius: 16px;
      max-width: 400px;
      margin: 20px;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    ">
      <h3 style="margin: 0 0 20px 0; color: #333; font-size: 24px;">📱 Add to Home Screen</h3>
      <div style="color: #666; line-height: 1.6; margin-bottom: 20px;">
        <p style="margin: 0 0 15px 0;">1. Tap the <strong>Share</strong> button <span style="font-size: 18px;">⤴️</span></p>
        <p style="margin: 0 0 15px 0;">2. Scroll down and tap <strong>"Add to Home Screen"</strong></p>
        <p style="margin: 0;">3. Tap <strong>"Add"</strong> to confirm</p>
      </div>
      <button onclick="this.parentElement.parentElement.remove()" style="
        background: #10b981;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        font-size: 16px;
      ">Got it!</button>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Auto-remove after 15 seconds
  setTimeout(() => {
    if (modal.parentNode) {
      modal.parentNode.removeChild(modal);
    }
  }, 15000);
}

function showAndroidInstallGuide() {
  // Create a modal-style guide for Android users
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
  `;
  
  modal.innerHTML = `
    <div style="
      background: white;
      padding: 30px;
      border-radius: 16px;
      max-width: 400px;
      margin: 20px;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    ">
      <h3 style="margin: 0 0 20px 0; color: #333; font-size: 24px;">📱 Install App</h3>
      <div style="color: #666; line-height: 1.6; margin-bottom: 20px;">
        <p style="margin: 0 0 15px 0;">1. Tap the <strong>Menu</strong> button <span style="font-size: 18px;">⋮</span></p>
        <p style="margin: 0 0 15px 0;">2. Tap <strong>"Add to Home Screen"</strong> or <strong>"Install App"</strong></p>
        <p style="margin: 0;">3. Tap <strong>"Add"</strong> or <strong>"Install"</strong> to confirm</p>
      </div>
      <button onclick="this.parentElement.parentElement.remove()" style="
        background: #10b981;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        font-size: 16px;
      ">Got it!</button>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Auto-remove after 15 seconds
  setTimeout(() => {
    if (modal.parentNode) {
      modal.parentNode.removeChild(modal);
    }
  }, 15000);
}

function showGenericInstallGuide() {
  // Generic guide for other browsers
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
  `;
  
  modal.innerHTML = `
    <div style="
      background: white;
      padding: 30px;
      border-radius: 16px;
      max-width: 400px;
      margin: 20px;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    ">
      <h3 style="margin: 0 0 20px 0; color: #333; font-size: 24px;">📱 Add to Home Screen</h3>
      <div style="color: #666; line-height: 1.6; margin-bottom: 20px;">
        <p style="margin: 0 0 15px 0;">Look for an <strong>"Add to Home Screen"</strong> or <strong>"Install"</strong> option in your browser menu.</p>
        <p style="margin: 0;">This will add Interest Inc to your device's home screen!</p>
      </div>
      <button onclick="this.parentElement.parentElement.remove()" style="
        background: #10b981;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        font-size: 16px;
      ">Got it!</button>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Auto-remove after 15 seconds
  setTimeout(() => {
    if (modal.parentNode) {
      modal.parentNode.removeChild(modal);
    }
  }, 15000);
}

function initPWASpecificFeatures() {
  if (isRunningAsPWA()) {
    console.log('Initializing PWA-specific features');
    
    // Add a class to body for PWA-specific styling
    document.body.classList.add('pwa-mode');
    
    // You can add PWA-specific features here, such as:
    // - Different UI elements
    // - Enhanced offline capabilities
    // - PWA-specific notifications
    // - Different behavior for certain features
    
    // Example: Hide browser-specific elements if any
    const browserElements = document.querySelectorAll('.browser-only');
    browserElements.forEach(el => el.style.display = 'none');
    
    // Example: Show PWA-specific elements
    const pwaElements = document.querySelectorAll('.pwa-only');
    pwaElements.forEach(el => el.style.display = 'block');
    
    // Log PWA mode for debugging
    console.log('Running in PWA mode - enhanced experience enabled');
  } else {
    console.log('Running in browser mode - install prompt available');
    document.body.classList.add('browser-mode');
  }
}

// How to Play functionality
function initHowToPlay() {
  const howToPlayBtn = document.getElementById('howToPlayBtn');
  const howToPlayModal = document.getElementById('howToPlayModal');
  const howToPlayModalClose = document.getElementById('howToPlayModalClose');

  if (howToPlayBtn && howToPlayModal) {
    // Open modal
    howToPlayBtn.addEventListener('click', () => {
      howToPlayModal.classList.remove('hidden');
      // Pause audio when modal opens
      if (AudioSystem.getAudioSettings().musicEnabled) {
        AudioSystem.pauseAllAudio();
      }
    });

    // Close modal functions
    const closeModal = () => {
      howToPlayModal.classList.add('hidden');
      // Resume audio when modal closes
      if (AudioSystem.getAudioSettings().musicEnabled) {
        AudioSystem.startBackgroundMusic();
      }
    };

    if (howToPlayModalClose) {
      howToPlayModalClose.addEventListener('click', closeModal);
    }

    // Close modal when clicking outside
    howToPlayModal.addEventListener('click', (e) => {
      if (e.target === howToPlayModal) {
        closeModal();
      }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !howToPlayModal.classList.contains('hidden')) {
        closeModal();
      }
    });
  }
}

// Firebase Authentication functionality
let currentUser = null;
let isFirebaseReady = false;

function initFirebaseAuth() {
  // Check if Firebase is available
  if (!window.firebaseAuth) {
    console.log('Firebase not available, using local storage only');
    return;
  }
  
  isFirebaseReady = true;
  
  // Listen for authentication state changes
  window.firebaseOnAuthStateChanged(window.firebaseAuth, (user) => {
    currentUser = user;
    updateAuthUI();
    
    if (user) {
      console.log('User signed in:', user.displayName);
      // Load user's cloud save
      loadCloudSave();
      // Auto-submit disabled - users must manually submit scores
      // startAutoSubmit();
    } else {
      console.log('User signed out');
      // Switch back to local save
      loadGameState();
      // Auto-submit disabled - no need to stop
      // stopAutoSubmit();
    }
  });
  
  // Set up login/logout button event listeners
  const googleLoginBtn = document.getElementById('googleLoginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  
  if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', signInWithGoogle);
  }
  
  if (logoutBtn) {
    logoutBtn.addEventListener('click', signOut);
  }
}

async function signInWithGoogle() {
  try {
    const result = await window.firebaseSignIn(window.firebaseAuth, window.firebaseProvider);
    console.log('Sign in successful:', result.user);
  } catch (error) {
    console.error('Sign in error:', error);
    alert('Sign in failed: ' + error.message);
  }
}

async function signOut() {
  try {
    await window.firebaseSignOut(window.firebaseAuth);
    console.log('Sign out successful');
  } catch (error) {
    console.error('Sign out error:', error);
  }
}

// Profile image cache to prevent too many requests
const profileImageCache = new Map();
const failedImages = new Set();
const requestTimestamps = new Map();
const RATE_LIMIT_MS = 5000; // 5 seconds between requests for same image

function loadProfileImage(imgElement, photoURL, fallbackText = '') {
  if (!photoURL || failedImages.has(photoURL)) {
    imgElement.style.display = 'none';
    return;
  }
  
  // Check cache first
  if (profileImageCache.has(photoURL)) {
    imgElement.src = profileImageCache.get(photoURL);
    imgElement.style.display = 'block';
    return;
  }
  
  // Rate limiting check
  const now = Date.now();
  const lastRequest = requestTimestamps.get(photoURL);
  if (lastRequest && (now - lastRequest) < RATE_LIMIT_MS) {
    console.log('Rate limiting profile image request:', photoURL);
    imgElement.style.display = 'none';
    return;
  }
  
  // Record this request timestamp
  requestTimestamps.set(photoURL, now);
  
  // Load with error handling
  imgElement.onerror = function() {
    console.log('Profile image failed to load:', photoURL);
    failedImages.add(photoURL);
    this.style.display = 'none';
  };
  
  imgElement.onload = function() {
    this.style.display = 'block';
    // Cache the successful image
    profileImageCache.set(photoURL, photoURL);
  };
  
  imgElement.src = photoURL;
}

function updateAuthUI() {
  const loginSection = document.getElementById('loginSection');
  const userSection = document.getElementById('userSection');
  const userName = document.getElementById('userName');
  const userEmail = document.getElementById('userEmail');
  const userAvatar = document.getElementById('userAvatar');
  
  if (!loginSection || !userSection) return;
  
  if (currentUser) {
    // User is signed in
    loginSection.classList.add('hidden');
    userSection.classList.remove('hidden');
    
    if (userName) userName.textContent = currentUser.displayName || 'User';
    if (userEmail) userEmail.textContent = currentUser.email || '';
    if (userAvatar) {
      loadProfileImage(userAvatar, currentUser.photoURL);
    }
  } else {
    // User is signed out
    loginSection.classList.remove('hidden');
    userSection.classList.add('hidden');
  }
  
  // Update submit button status when auth state changes
  if (window.updateSubmissionStatus) {
    window.updateSubmissionStatus();
  }
}

async function saveToCloud() {
  if (!currentUser || !isFirebaseReady) {
    console.log('Cannot save to cloud: user not authenticated or Firebase not ready');
    return;
  }
  
  try {
    const gameState = getCurrentGameState();
    const userDocRef = window.firebaseDoc(window.firebaseDb, 'users', currentUser.uid);
    
    await window.firebaseSetDoc(userDocRef, {
      gameState: gameState,
      lastSaved: Date.now(),
      username: currentUser.displayName || currentUser.email
    }, { merge: true });
    
    console.log('✅ Game saved to cloud successfully');
  } catch (error) {
    console.error('❌ Error saving to cloud:', error);
    
    // Check if it's a network/connectivity issue
    if (error.code === 'unavailable' || error.message.includes('offline')) {
      console.log('🔄 Network issue detected, will retry when connection is restored');
    } else if (error.code === 'permission-denied') {
      console.log('🔒 Permission denied - check Firestore security rules');
    } else {
      console.log('❓ Unknown error:', error.code, error.message);
    }
  }
}

async function loadCloudSave() {
  if (!currentUser || !isFirebaseReady) {
    console.log('Cannot load from cloud: user not authenticated or Firebase not ready');
    return;
  }
  
  try {
    const userDocRef = window.firebaseDoc(window.firebaseDb, 'users', currentUser.uid);
    const userDoc = await window.firebaseGetDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      if (userData.gameState) {
        console.log('✅ Loading cloud save for user:', currentUser.displayName);
        loadGameStateFromData(userData.gameState);
      }
    } else {
      console.log('📝 No cloud save found, using local save');
      loadGameState();
    }
  } catch (error) {
    console.error('❌ Error loading cloud save:', error);
    
    // Check error type and provide helpful messages
    if (error.code === 'unavailable' || error.message.includes('offline')) {
      console.log('🔄 Network issue detected, using local save');
    } else if (error.code === 'permission-denied') {
      console.log('🔒 Permission denied - check Firestore security rules');
    } else {
      console.log('❓ Unknown error:', error.code, error.message);
    }
    
    // Fallback to local save
    loadGameState();
  }
}


function loadGameStateFromData(gameState) {
  // Restore core balances
  currentAccountBalance = gameState.currentAccountBalance || 0;
  investmentAccountBalance = gameState.investmentAccountBalance || 0;
  
  // Restore upgrades
  if (gameState.owned) {
    Object.assign(owned, gameState.owned);
  }
  
  // Restore properties
  if (gameState.properties) {
    Object.assign(properties, gameState.properties);
  }
  
  // Restore statistics
  totalDividendsReceived = gameState.totalDividendsReceived || 0;
  hasMadeFirstInvestment = gameState.hasMadeFirstInvestment || false;
  
  // Click streak should reset on game load - not restored from save
  streakCount = 0;
  streakMultiplier = 1;
  lastClickTime = 0;
  
  // Restore prestige multipliers
  prestigeClickMultiplier = gameState.prestigeClickMultiplier || 1;
  prestigeInterestMultiplier = gameState.prestigeInterestMultiplier || 1;
  
  // Restore prestige tier
  prestigeTier = gameState.prestigeTier || 0;
  
  // Restore buy multiplier
  buyMultiplier = gameState.buyMultiplier || 1;
  
  // Restore audio settings
  if (gameState.musicEnabled !== undefined) {
    AudioSystem.setMusicEnabled(gameState.musicEnabled);
  }
  if (gameState.soundEffectsEnabled !== undefined) {
    AudioSystem.setSoundEffectsEnabled(gameState.soundEffectsEnabled);
  }
  
  // Restore auto invest settings
  autoInvestEnabled = gameState.autoInvestEnabled || false;
  autoRentEnabled = gameState.autoRentEnabled || false;
  
  // Restore game difficulty
  if (gameState.gameDifficulty) {
    setGameDifficulty(gameState.gameDifficulty);
  }
  
  // Restore dark mode
  if (gameState.darkMode) {
    document.body.classList.add('dark-mode');
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) darkModeToggle.checked = true;
  }
  
  console.log('Game state loaded from cloud');
}

// =============================================================================
// COIN FLIP GAME FUNCTIONS
// =============================================================================

function setCoinFlipBetAmount(type) {
  const input = document.getElementById('coinFlipBetAmount');
  if (!input) return;
  
  let amount = 0;
  switch(type) {
    case 'max':
      amount = currentAccountBalance;
      break;
    case 'half':
      amount = Math.floor(currentAccountBalance / 2);
      break;
    case 'quarter':
      amount = Math.floor(currentAccountBalance / 4);
      break;
    case 'eighth':
      amount = Math.floor(currentAccountBalance / 8);
      break;
  }
  
  input.value = amount;
  updateCoinFlipBetDisplay();
}

function updateCoinFlipBetDisplay() {
  const input = document.getElementById('coinFlipBetAmount');
  const display = document.getElementById('coinFlipCurrentBet');
  
  if (!input || !display) return;
  
  const amount = parseFloat(input.value) || 0;
  display.innerHTML = `<span>Current Bet: €${formatNumberShort(amount)}</span>`;
  
  // Update button state
  const flipBtn = document.getElementById('coinFlipBtn');
  if (flipBtn) {
    flipBtn.disabled = amount <= 0 || amount > currentAccountBalance || isCoinFlipping;
  }
}

function flipCoin() {
  if (isCoinFlipping) return;
  
  const input = document.getElementById('coinFlipBetAmount');
  const coin = document.getElementById('coinFlipCoin');
  const resultDiv = document.getElementById('coinFlipResult');
  const flipBtn = document.getElementById('coinFlipBtn');
  
  if (!input || !coin || !resultDiv || !flipBtn) return;
  
  const betAmount = parseFloat(input.value) || 0;
  
  // Validate bet
  if (betAmount <= 0) {
    resultDiv.innerHTML = 'Please enter a valid bet amount';
    resultDiv.className = 'game-result lose';
    return;
  }
  
  if (betAmount > currentAccountBalance) {
    resultDiv.innerHTML = 'Insufficient funds';
    resultDiv.className = 'game-result lose';
    return;
  }
  
  // Start flip animation
  isCoinFlipping = true;
  flipBtn.disabled = true;
  flipBtn.textContent = 'Flipping...';
  
  // Remove previous result classes
  resultDiv.className = 'game-result';
  resultDiv.innerHTML = '';
  
  // Add flipping animation
  coin.classList.add('flipping');
  coin.classList.remove('show-heads', 'show-tails');
  
  // Deduct bet amount
  currentAccountBalance -= betAmount;
  renderBalances();
  
  // Play flip sound
  if (AudioSystem && AudioSystem.playClickSound) {
    AudioSystem.playClickSound();
  }
  
  // Handle animation end to show result immediately when animation finishes
  const handleAnimationEnd = () => {
    const isHeads = Math.random() <= 0.5;
    const won = isHeads; // For simplicity, let's say heads always wins
    
    // Stop animation and show result
    coin.classList.remove('flipping');
    coin.classList.add(isHeads ? 'show-heads' : 'show-tails');
    
    // Calculate winnings
    const winnings = won ? betAmount * 2 : 0;
    
    if (won) {
      currentAccountBalance += winnings;
      resultDiv.innerHTML = `🎉 Heads! You won €${formatNumberShort(winnings)}!`;
      resultDiv.className = 'game-result win';
      
      // Trigger win celebration for big wins
      triggerWinCelebration(winnings, betAmount);
    } else {
      resultDiv.innerHTML = `💸 Tails! You lost €${formatNumberShort(betAmount)}`;
      resultDiv.className = 'game-result lose';
      
      // Play lose sound
      if (AudioSystem && AudioSystem.playErrorSound) {
        AudioSystem.playErrorSound();
      }
    }
    
    // Add to history
    coinFlipHistory.unshift({
      result: isHeads ? 'heads' : 'tails',
      bet: betAmount,
      won: won,
      winnings: winnings,
      timestamp: Date.now()
    });
    
    // Keep only last 5 results
    if (coinFlipHistory.length > 5) {
      coinFlipHistory = coinFlipHistory.slice(0, 5);
    }
    
    // Update history display
    updateCoinFlipHistory();
    
    // Update balances and UI
    renderBalances();
    
    // Reset button
    flipBtn.disabled = false;
    flipBtn.textContent = 'Flip Coin';
    isCoinFlipping = false;
    
    // Update bet display
    updateCoinFlipBetDisplay();
    
    // Remove the event listener to prevent multiple calls
    coin.removeEventListener('animationend', handleAnimationEnd);
  };
  
  // Listen for animation end
  coin.addEventListener('animationend', handleAnimationEnd);
}

function updateCoinFlipHistory() {
  const historyContainer = document.getElementById('coinFlipHistory');
  if (!historyContainer) return;
  
  historyContainer.innerHTML = '';
  
  coinFlipHistory.forEach(flip => {
    const item = document.createElement('div');
    item.className = `history-item ${flip.result}`;
    item.textContent = flip.result.toUpperCase();
    item.title = `${flip.result.toUpperCase()} - Bet: €${formatNumberShort(flip.bet)} - ${flip.won ? 'Won' : 'Lost'}: €${formatNumberShort(flip.winnings)}`;
    historyContainer.appendChild(item);
  });
}

// Initialize coin flip game
function initCoinFlipGame() {
  const betInput = document.getElementById('coinFlipBetAmount');
  if (betInput) {
    betInput.addEventListener('input', updateCoinFlipBetDisplay);
    betInput.addEventListener('change', updateCoinFlipBetDisplay);
  }
  
  // Initial display update
  updateCoinFlipBetDisplay();
}

// Make coin flip functions globally accessible
window.setCoinFlipBetAmount = setCoinFlipBetAmount;
window.flipCoin = flipCoin;

// =============================================================================
// GAME SWITCHER FUNCTIONS
// =============================================================================

function switchGame(gameType) {
  // Hide all game sections
  const coinFlipGame = document.getElementById('coinFlipGame');
  const slotsGame = document.getElementById('slotsGame');
  
  // Remove active class from all tabs
  const coinFlipTab = document.getElementById('coinFlipTab');
  const slotsTab = document.getElementById('slotsTab');
  
  if (coinFlipGame) coinFlipGame.style.display = 'none';
  if (slotsGame) slotsGame.style.display = 'none';
  
  if (coinFlipTab) coinFlipTab.classList.remove('active');
  if (slotsTab) slotsTab.classList.remove('active');
  
  // Show selected game and activate its tab
  switch(gameType) {
    case 'coinFlip':
      if (coinFlipGame) coinFlipGame.style.display = 'block';
      if (coinFlipTab) coinFlipTab.classList.add('active');
      break;
    case 'slots':
      if (slotsGame) slotsGame.style.display = 'block';
      if (slotsTab) slotsTab.classList.add('active');
      break;
  }
}

// Make game switcher function globally accessible
window.switchGame = switchGame;

// =============================================================================
// SLOTS GAME VARIABLES AND FUNCTIONS
// =============================================================================

// Slots Game Variables
let isSlotsSpinning = false;
let slotsAutoSpinInterval = null;

// Slots Game Configuration
const SLOTS_SYMBOLS = ['7', 'diamond', 'cherry', 'bell', 'bar', 'star'];
const SLOTS_PAYOUTS = {
  '7': { '5': 1000, '4': 300, '3': 50, '2': 5 },
  'diamond': { '5': 500, '4': 200, '3': 40, '2': 4 },
  'bar': { '5': 100, '4': 40, '3': 20, '2': 3 },
  'bell': { '5': 75, '4': 30, '3': 15, '2': 3 },
  'cherry': { '5': 50, '4': 25, '3': 10, '2': 2 },
  'star': { '5': 100, '4': 40, '3': 20, '2': 3 }
};

function setSlotsBetAmount(type) {
  const input = document.getElementById('slotsBetAmount');
  if (!input) return;
  
  let amount = 0;
  switch(type) {
    case 'max':
      amount = currentAccountBalance;
      break;
    case '100':
      amount = 100;
      break;
    case '50':
      amount = 50;
      break;
    case '25':
      amount = 25;
      break;
    case '10':
      amount = 10;
      break;
    case '5':
      amount = 5;
      break;
    case '1':
      amount = 1;
      break;
  }
  
  input.value = Math.min(amount, currentAccountBalance);
  updateSlotsBetDisplay();
}

function updateSlotsBetDisplay() {
  const input = document.getElementById('slotsBetAmount');
  const display = document.getElementById('slotsCurrentBet');
  
  if (!input || !display) return;
  
  const amount = parseFloat(input.value) || 0;
  const resultSpan = display.querySelector('#slotsResultSimple');
  const resultContent = resultSpan ? resultSpan.outerHTML : '';
  display.innerHTML = `<span>Current Bet: €${formatNumberShort(amount)}</span>${resultContent}`;
  
  // Update button state
  const spinBtn = document.getElementById('slotsSpinBtn');
  if (spinBtn) {
    spinBtn.disabled = amount <= 0 || amount > currentAccountBalance || isSlotsSpinning;
  }
}

function spinSlots() {
  if (isSlotsSpinning) return;
  
  const input = document.getElementById('slotsBetAmount');
  const spinBtn = document.getElementById('slotsSpinBtn');
  const resultDiv = document.getElementById('slotsResultSimple');
  
  if (!input || !spinBtn || !resultDiv) return;
  
  const betAmount = parseFloat(input.value) || 0;
  
  // Validate bet
  if (betAmount <= 0) {
    resultDiv.textContent = 'Invalid bet';
    resultDiv.className = 'game-result-simple lose';
    return;
  }
  
  if (betAmount > currentAccountBalance) {
    resultDiv.textContent = 'Insufficient funds';
    resultDiv.className = 'game-result-simple lose';
    return;
  }
  
  // Start spin
  isSlotsSpinning = true;
  spinBtn.disabled = true;
  spinBtn.textContent = 'SPINNING...';
  
  // Clear previous result
  resultDiv.textContent = '';
  resultDiv.className = 'game-result-simple';
  
  // Clear any previous winning highlights
  document.querySelectorAll('.symbol.winning').forEach(symbol => {
    symbol.classList.remove('winning');
  });
  
  // Deduct bet amount
  currentAccountBalance -= betAmount;
  renderBalances();
  
  // No spin sound
  
  // Generate results first
  const results = [];
  const reelElements = ['reel1', 'reel2', 'reel3', 'reel4', 'reel5'];
  
  // Generate random results for each reel
  reelElements.forEach((reelId) => {
    const randomSymbol = SLOTS_SYMBOLS[Math.floor(Math.random() * SLOTS_SYMBOLS.length)];
    results.push(randomSymbol);
  });
  
  // Show instant digital slots animation
  const reels = ['reel1', 'reel2', 'reel3', 'reel4', 'reel5'];
  reels.forEach((reelId, index) => {
    const reel = document.getElementById(reelId);
    const symbolElement = document.getElementById(`${reelId}-symbol`);
    const finalSymbol = results[index];
    
    if (reel && symbolElement) {
      // Add slight delay between reels for digital effect
      setTimeout(() => {
        reel.classList.add('instant-spin');
        
        // Update symbol immediately
        symbolElement.textContent = getSymbolDisplay(finalSymbol);
        symbolElement.setAttribute('data-symbol', finalSymbol);
        
        // Remove animation class after animation
        setTimeout(() => {
          reel.classList.remove('instant-spin');
        }, 300); // Match animation duration
      }, index * 100); // 100ms delay between reels for digital effect
    }
  });
  
  // Process results when all animations complete
  setTimeout(() => {
    // Check for wins immediately
    const winnings = calculateSlotsWinnings(results, betAmount);
    const totalWinnings = winnings.total;
    
    if (totalWinnings > 0) {
      currentAccountBalance += totalWinnings;
      resultDiv.textContent = `+€${formatNumberShort(totalWinnings)}`;
      resultDiv.className = 'game-result-simple win';
      
      // Highlight winning symbols
      highlightWinningSymbols(results, winnings.winningLines);
      
      // Trigger win celebration for big wins
      triggerWinCelebration(totalWinnings, betAmount);
    } else {
      resultDiv.textContent = 'Lose';
      resultDiv.className = 'game-result-simple lose';
    }
    
    
    // Update balances and UI
    renderBalances();
    
    // Reset button
    spinBtn.disabled = false;
    spinBtn.textContent = '🎰 SPIN';
    isSlotsSpinning = false;
    
    // Update bet display
    updateSlotsBetDisplay();
    
    // Auto spin is now handled by the checkbox event listener
    
  }, 500); // Wait for last reel (2*100ms) + animation (300ms)
}

function getSymbolDisplay(symbol) {
  const symbolMap = {
    '7': '7',
    'diamond': '💎',
    'cherry': '🍒',
    'bell': '🔔',
    'bar': '📊',
    'star': '⭐'
  };
  return symbolMap[symbol] || symbol;
}

function calculateSlotsWinnings(results, betAmount) {
  const [reel1, reel2, reel3, reel4, reel5] = results;
  let totalWinnings = 0;
  let message = '';
  let winningLines = [];
  
  // Count consecutive symbols from left to right
  const symbols = [reel1, reel2, reel3, reel4, reel5];
  let maxConsecutive = 0;
  let bestSymbol = '';
  let bestStartIndex = 0;
  
  // Find the longest consecutive sequence
  for (let i = 0; i < symbols.length; i++) {
    const symbol = symbols[i];
    let consecutive = 1;
    
    // Count consecutive symbols starting from this position
    for (let j = i + 1; j < symbols.length; j++) {
      if (symbols[j] === symbol) {
        consecutive++;
      } else {
        break;
      }
    }
    
    // Update best sequence if this one is longer
    if (consecutive > maxConsecutive) {
      maxConsecutive = consecutive;
      bestSymbol = symbol;
      bestStartIndex = i;
    }
  }
  
  // Calculate winnings based on consecutive symbols
  if (maxConsecutive >= 2) {
    const multiplier = SLOTS_PAYOUTS[bestSymbol]?.[maxConsecutive.toString()] || 0;
    if (multiplier > 0) {
      totalWinnings = betAmount * multiplier;
      const symbolDisplay = getSymbolDisplay(bestSymbol);
      message = `${maxConsecutive} ${symbolDisplay}s in a row! ${multiplier}x`;
      
      // Mark winning positions
      for (let i = bestStartIndex; i < bestStartIndex + maxConsecutive; i++) {
        winningLines.push(`reel${i + 1}`);
      }
    }
  }
  
  return {
    total: totalWinnings,
    message: message,
    winningLines: winningLines
  };
}

function highlightWinningSymbols(results, winningLines) {
  // Remove previous highlights
  document.querySelectorAll('.symbol.winning').forEach(symbol => {
    symbol.classList.remove('winning');
  });
  
  // Highlight only the winning symbols based on the winning lines
  if (winningLines.includes('all')) {
    // Highlight all three reels
    document.querySelectorAll('#reel1-symbol, #reel2-symbol, #reel3-symbol').forEach(symbol => {
      symbol.classList.add('winning');
    });
  } else if (winningLines.includes('first-two')) {
    // Highlight only first two reels
    document.querySelectorAll('#reel1-symbol, #reel2-symbol').forEach(symbol => {
      symbol.classList.add('winning');
    });
  } else if (winningLines.includes('last-two')) {
    // Highlight only last two reels
    document.querySelectorAll('#reel2-symbol, #reel3-symbol').forEach(symbol => {
      symbol.classList.add('winning');
    });
  } else if (winningLines.includes('first-last')) {
    // Highlight only first and last reels
    document.querySelectorAll('#reel1-symbol, #reel3-symbol').forEach(symbol => {
      symbol.classList.add('winning');
    });
  }
  
  // Remove highlights after animation
  setTimeout(() => {
    document.querySelectorAll('.symbol.winning').forEach(symbol => {
      symbol.classList.remove('winning');
    });
  }, 2000);
}


// Initialize slots game
function initSlotsGame() {
  const betInput = document.getElementById('slotsBetAmount');
  if (betInput) {
    betInput.addEventListener('input', updateSlotsBetDisplay);
    betInput.addEventListener('change', updateSlotsBetDisplay);
  }
  
  // Initialize auto spin checkbox
  const autoSpinCheckbox = document.getElementById('slotsAutoSpin');
  if (autoSpinCheckbox) {
    autoSpinCheckbox.addEventListener('change', function() {
      if (this.checked) {
        // Start auto spin
        slotsAutoSpinInterval = setInterval(() => {
          if (!isSlotsSpinning) {
            spinSlots();
          }
        }, 1200); // 1 second interval between auto spins
      } else {
        // Stop auto spin
        if (slotsAutoSpinInterval) {
          clearInterval(slotsAutoSpinInterval);
          slotsAutoSpinInterval = null;
        }
      }
    });
  }
  
  // Initialize reels with random symbols
  initializeSlotsReels();
  
  // Initial display update
  updateSlotsBetDisplay();
}

function initializeSlotsReels() {
  const reelElements = ['reel1', 'reel2', 'reel3', 'reel4', 'reel5'];
  
  reelElements.forEach(reelId => {
    const symbolElement = document.getElementById(`${reelId}-symbol`);
    if (symbolElement) {
      // Initialize each reel with a random symbol
      const randomSymbol = SLOTS_SYMBOLS[Math.floor(Math.random() * SLOTS_SYMBOLS.length)];
      symbolElement.textContent = getSymbolDisplay(randomSymbol);
      symbolElement.setAttribute('data-symbol', randomSymbol);
    }
  });
}

// Win Celebration System
function createCoinFlowAnimation() {
  if (!particleEffectsEnabled) return;
  
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const coins = [];
  const coinCount = 50;
  
  // Create coins flowing from top to bottom
  for (let i = 0; i < coinCount; i++) {
    coins.push({
      x: Math.random() * window.innerWidth,
      y: -50 - Math.random() * 200, // Start above screen
      vx: (Math.random() - 0.5) * 2, // Slight horizontal movement
      vy: 2 + Math.random() * 3, // Downward movement
      size: 8 + Math.random() * 8,
      rotation: 0,
      rotationSpeed: (Math.random() - 0.5) * 0.3,
      life: 1.0,
      delay: i * 100 // Stagger the coins
    });
  }
  
  // Animate coins
  let animationId;
  const startTime = Date.now();
  
  function animateCoins() {
    const currentTime = Date.now();
    const elapsed = currentTime - startTime;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    let activeCoins = 0;
    
    coins.forEach(coin => {
      if (elapsed < coin.delay) return;
      
      // Update positions
      coin.x += coin.vx;
      coin.y += coin.vy;
      coin.rotation += coin.rotationSpeed;
      
      // Update life (fade out near bottom)
      const progress = (coin.y - window.innerHeight * 0.8) / (window.innerHeight * 0.2);
      coin.life = Math.max(0, 1 - progress);
      
      // Draw coin
      if (coin.life > 0) {
        ctx.save();
        ctx.globalAlpha = coin.life;
        ctx.translate(coin.x, coin.y);
        ctx.rotate(coin.rotation);
        
        // Draw gold coin
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(0, 0, coin.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Coin highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(-coin.size * 0.3, -coin.size * 0.3, coin.size * 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Coin border
        ctx.strokeStyle = '#FFA500';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.restore();
        activeCoins++;
      }
    });
    
    // Continue animation if there are active coins
    if (activeCoins > 0) {
      animationId = requestAnimationFrame(animateCoins);
    } else {
      // Clear canvas when done
      setTimeout(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }, 100);
    }
  }
  
  animateCoins();
}

function showWinPopup(winType, amount, multiplier, betAmount) {
  // Remove existing popup if any
  const existingPopup = document.getElementById('winCelebrationPopup');
  if (existingPopup) {
    existingPopup.remove();
  }
  
  // Pause auto spin when popup is shown
  pauseAutoSpin();
  
  // Create popup
  const popup = document.createElement('div');
  popup.id = 'winCelebrationPopup';
  popup.className = 'win-celebration-popup';
  
  let titleText = '';
  let titleClass = '';
  
  switch(winType) {
    case 'super':
      titleText = 'SUPER WIN';
      titleClass = 'super-win';
      break;
    case 'mega':
      titleText = 'MEGA WIN';
      titleClass = 'mega-win';
      break;
    case 'divine':
      titleText = 'DIVINE WIN';
      titleClass = 'divine-win';
      break;
  }
  
  popup.innerHTML = `
    <div class="popup-content">
      <button class="popup-close" onclick="closeWinPopup()">&times;</button>
      <div class="popup-title ${titleClass}">${titleText}</div>
      <div class="popup-description">
        You won <strong>€${formatNumberShort(amount)}</strong><br>
        <span class="multiplier-text">${multiplier}x your bet!</span>
      </div>
      <div class="popup-details">
        Bet: €${formatNumberShort(betAmount)} → Win: €${formatNumberShort(amount)}
      </div>
    </div>
  `;
  
  document.body.appendChild(popup);
  
  // Add show animation
  setTimeout(() => {
    popup.classList.add('show');
  }, 100);
}

function closeWinPopup() {
  const popup = document.getElementById('winCelebrationPopup');
  if (popup) {
    popup.classList.remove('show');
    setTimeout(() => {
      popup.remove();
      // Resume auto spin after popup is closed
      resumeAutoSpin();
    }, 300);
  }
}

function triggerWinCelebration(totalWinnings, betAmount) {
  const multiplier = totalWinnings / betAmount;
  let winType = '';
  
  if (multiplier >= 10 && multiplier < 20) {
    winType = 'super';
  } else if (multiplier >= 20 && multiplier < 100) {
    winType = 'mega';
  } else if (multiplier >= 100) {
    winType = 'divine';
  }
  
  if (winType) {
    // Create coin flow animation
    createCoinFlowAnimation();
    
    // Show popup
    showWinPopup(winType, totalWinnings, multiplier, betAmount);
    
    // Play win sound
    if (AudioSystem && AudioSystem.playWinSound) {
      AudioSystem.playWinSound();
    }
  }
}

// Auto spin pause/resume functions
function pauseAutoSpin() {
  if (slotsAutoSpinInterval) {
    clearInterval(slotsAutoSpinInterval);
    slotsAutoSpinInterval = null;
    // Update auto spin checkbox to reflect paused state
    const autoSpinCheckbox = document.getElementById('slotsAutoSpin');
    if (autoSpinCheckbox) {
      autoSpinCheckbox.checked = false;
    }
  }
}

function resumeAutoSpin() {
  const autoSpinCheckbox = document.getElementById('slotsAutoSpin');
  if (autoSpinCheckbox && autoSpinCheckbox.checked) {
    // Restart auto spin if checkbox is still checked
    slotsAutoSpinInterval = setInterval(() => {
      if (!isSlotsSpinning) {
        spinSlots();
      }
    }, 2000); // 2 second interval between auto spins
  }
}

// Make win celebration functions globally accessible
window.closeWinPopup = closeWinPopup;

// Make slots functions globally accessible
window.setSlotsBetAmount = setSlotsBetAmount;
window.spinSlots = spinSlots;

// Initialize PWA functionality when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initFirebaseAuth();
  initHowToPlay();
  initPWAInstallPrompt();
  initPWASpecificFeatures();
  
  // Initialize help modal functionality after DOM is ready
  initHelpModals();
  
  // Initialize coin flip game
  initCoinFlipGame();
  
  // Initialize slots game
  initSlotsGame();
  
  // Show coin flip game by default
  switchGame('coinFlip');
});

// Initialize help modal functionality
function initHelpModals() {
  // Auto Invest Help Modal functionality
  const autoInvestHelpBtn = document.getElementById('autoInvestHelpBtn');
  const autoInvestModal = document.getElementById('autoInvestModal');
  const autoInvestModalClose = document.getElementById('autoInvestModalClose');
  
  // Auto Rent Help Modal functionality
  const autoRentHelpBtn = document.getElementById('autoRentHelpBtn');
  const autoRentModal = document.getElementById('autoRentModal');
  const autoRentModalClose = document.getElementById('autoRentModalClose');

  // Auto Invest Help Modal functionality
  if (autoInvestHelpBtn && autoInvestModal) {
    autoInvestHelpBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      autoInvestModal.classList.remove('hidden');
    });
  }

  if (autoInvestModalClose && autoInvestModal) {
    autoInvestModalClose.addEventListener('click', () => {
      autoInvestModal.classList.add('hidden');
    });
  }

  // Close modal when clicking outside
  if (autoInvestModal) {
    autoInvestModal.addEventListener('click', (e) => {
      if (e.target === autoInvestModal) {
        autoInvestModal.classList.add('hidden');
      }
    });
  }

  // Auto Rent Help Modal functionality
  if (autoRentHelpBtn && autoRentModal) {
    autoRentHelpBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      autoRentModal.classList.remove('hidden');
    });
  }

  if (autoRentModalClose && autoRentModal) {
    autoRentModalClose.addEventListener('click', () => {
      autoRentModal.classList.add('hidden');
    });
  }

  // Close modal when clicking outside
  if (autoRentModal) {
    autoRentModal.addEventListener('click', (e) => {
      if (e.target === autoRentModal) {
        autoRentModal.classList.add('hidden');
      }
    });
  }

  // Close modal with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (autoInvestModal && !autoInvestModal.classList.contains('hidden')) {
        autoInvestModal.classList.add('hidden');
      }
      if (autoRentModal && !autoRentModal.classList.contains('hidden')) {
        autoRentModal.classList.add('hidden');
      }
    }
  });
}
