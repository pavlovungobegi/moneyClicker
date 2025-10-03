// Event Trigger Functions for Money Clicker Game
// Handles all event triggering logic

(() => {
  // Event System State Variables
  let marketBoomActive = false;
  let marketCrashActive = false;
  let flashSaleActive = false;
  let greatDepressionActive = false;
  let fastFingersActive = false;
  let earthquakeActive = false;
  let marketBoomEndTime = 0;
  let marketCrashEndTime = 0;
  let flashSaleEndTime = 0;
  let greatDepressionEndTime = 0;
  let fastFingersEndTime = 0;
  let earthquakeEndTime = 0;
  let earthquakeMagnitude = 0;

  // Game difficulty - needed for event calculations
  let gameDifficulty = GAME_CONFIG.DEFAULT_DIFFICULTY;

  // Helper functions for event system
  function getEventProbability(eventName) {
    const eventProbs = GAME_CONFIG.EVENT_CONFIG.probabilities[eventName];
    if (!eventProbs) return 0;
    
    // Return the probability for the current difficulty
    return eventProbs[gameDifficulty] || eventProbs.normal;
  }

  function getEventCooldown(eventName) {
    const eventCooldowns = GAME_CONFIG.EVENT_CONFIG.cooldowns[eventName];
    if (!eventCooldowns) return 60000; // Default 1 minute
    
    // Return the cooldown for the current difficulty
    return eventCooldowns[gameDifficulty] || eventCooldowns.normal;
  }

  // Event Functions
  function triggerMarketBoom() {
    if (marketBoomActive || marketCrashActive || flashSaleActive || greatDepressionActive) return; // Don't trigger if any event is active
    
    marketBoomActive = true;
    marketBoomEndTime = Date.now() + GAME_CONFIG.EVENT_CONFIG.durations.marketBoom;
    GAME_CONFIG.EVENT_CONFIG.eventCooldowns.marketBoom = Date.now() + getEventCooldown('marketBoom');
    
    // Show notification
    showEventNotification("📈 Market Boom!", "Interest & dividend rates increased by 50%!", "boom");
    
    // Visual effects
    screenFlash('#00FF00', 500); // Green flash
    screenShake(3, 200); // Gentle shake
    
    // Sound effect
    AudioSystem.playMarketBoomSound();
    
    // Update interest rate and dividend rate display colors
    updateInterestRateColor();
    updateDividendRateColor();
    updateActiveEventDisplay();
    
    // Log the event
    logEvent("📈 Market Boom", "market-boom");
  }
  
  function triggerMarketCrash() {
    if (marketBoomActive || marketCrashActive || flashSaleActive || greatDepressionActive) return; // Don't trigger if any event is active
    
    marketCrashActive = true;
    marketCrashEndTime = Date.now() + GAME_CONFIG.EVENT_CONFIG.durations.marketCrash;
    GAME_CONFIG.EVENT_CONFIG.eventCooldowns.marketCrash = Date.now() + getEventCooldown('marketCrash');
    
    // Calculate loss based on difficulty
    const lossRate = gameDifficulty === 'extreme' ? 0.4 : 0.03; // 40% for extreme, 20% for others
    const lossAmount = investmentAccountBalance * lossRate;
    investmentAccountBalance -= lossAmount;
    
    // Show notification
    showEventNotification("📉 Market Crash!", `Lost €${formatNumberShort(lossAmount)}! Interest & dividend rates reduced by 70%!`, "crash");
    
    // Visual effects
    screenFlash('#FF0000', 500); // Red flash
    screenShake(8, 400); // Strong shake
    
    // Sound effect
    AudioSystem.playMarketCrashSound();
    
    // Create loss particles
    if (particleSystem) {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      if (particleEffectsEnabled) {
        particleSystem.createMoneyLossParticles(centerX, centerY, lossAmount);
      }
    }
    
    // Update interest rate and dividend rate display colors
    updateInterestRateColor();
    updateDividendRateColor();
    updateActiveEventDisplay();
    
    // Update displays
    renderBalances();
    
    // Log the event
    logEvent("📉 Market Crash", "market-crash");
  }
  
  function triggerFlashSale() {
    if (marketBoomActive || marketCrashActive || flashSaleActive || greatDepressionActive) return; // Don't trigger if any event is active
    
    flashSaleActive = true;
    flashSaleEndTime = Date.now() + GAME_CONFIG.EVENT_CONFIG.durations.flashSale;
    GAME_CONFIG.EVENT_CONFIG.eventCooldowns.flashSale = Date.now() + getEventCooldown('flashSale');
    
    // Show notification
    showEventNotification("🏷️ Flash Sale!", "25% off all upgrades for 30 seconds!", "flash-sale");
    
    // Visual effects
    screenFlash('#FF6B35', 500); // Orange flash
    screenShake(4, 300); // Medium shake
    
    // Sound effect
    AudioSystem.playFlashSaleSound();
    
    // Create sale particles
    if (particleSystem) {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      if (particleEffectsEnabled) {
        particleSystem.createFlashSaleParticles(centerX, centerY, 20);
      }
    }
    
    // Update upgrade prices to show discount
    renderUpgradePrices();
    
    // Add visual styling to upgrades section
    const upgradesSection = document.getElementById('upgradesSection');
    if (upgradesSection) {
      upgradesSection.classList.add('flash-sale-active');
    }
    
    updateActiveEventDisplay();
    
    // Log the event
    logEvent("🏷️ Flash Sale", "flash-sale");
  }
  
  function triggerGreatDepression() {
    if (marketBoomActive || marketCrashActive || flashSaleActive || greatDepressionActive) return; // Don't trigger if any event is active
    
    greatDepressionActive = true;
    greatDepressionEndTime = Date.now() + GAME_CONFIG.EVENT_CONFIG.durations.greatDepression;
    GAME_CONFIG.EVENT_CONFIG.eventCooldowns.greatDepression = Date.now() + getEventCooldown('greatDepression');
    
    // Calculate loss based on difficulty and available funds
    let lossAmount;
    if (investmentAccountBalance > 0) {
      // Take from investment account if available
      const lossRate = gameDifficulty === 'extreme' ? 0.7 : 0.5; // 70% for extreme, 50% for others
      lossAmount = investmentAccountBalance * lossRate;
      investmentAccountBalance -= lossAmount;
    } else {
      // Take 10% from current account if no investment money
      lossAmount = currentAccountBalance * 0.1;
      currentAccountBalance -= lossAmount;
    }
    
    // Show notification
    showEventNotification("💀 The Great Depression!", `Lost €${formatNumberShort(lossAmount)}! Interest rates decreased by 120% - money is shrinking! Dividends stopped!`, "great-depression");
    
    // Visual effects
    screenFlash('#8B0000', 800); // Dark red flash
    screenShake(12, 600); // Very strong shake
    
    // Sound effect (reuse crash sound for now)
    AudioSystem.playMarketCrashSound();
    
    // Create massive loss particles
    if (particleSystem) {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      if (particleEffectsEnabled) {
        particleSystem.createMoneyLossParticles(centerX, centerY, lossAmount * 2); // Double particles for dramatic effect
      }
    }
    
    // Update interest rate and dividend rate display colors
    updateInterestRateColor();
    updateDividendRateColor();
    updateActiveEventDisplay();
    
    // Update displays
    renderBalances();
    
    // Log the event
    logEvent("💀 Great Depression", "great-depression");
  }
  
  function triggerTaxCollection() {
    // Tax collection is an instant event (no duration) but follows the same "one event at a time" rule
    // Set cooldown
    GAME_CONFIG.EVENT_CONFIG.eventCooldowns.taxCollection = Date.now() + getEventCooldown('taxCollection');
    
    let taxAmount = 0;
    
    // Calculate tax based on difficulty and available funds
    if (investmentAccountBalance > 0) {
      // Primary: Take from investment account
      const taxRate = gameDifficulty === 'extreme' ? 0.28 : 0.08; // 28% for extreme, 8% for others
      taxAmount = investmentAccountBalance * taxRate;
      investmentAccountBalance -= taxAmount;
    } else if (currentAccountBalance > 0) {
      // Fallback: Take 5% from current account if investment account is empty
      taxAmount = currentAccountBalance * 0.05;
      currentAccountBalance -= taxAmount;
    }
    
    // Show notification
    showEventNotification("🏛️ Tax Collection!", `Paid €${formatNumberShort(taxAmount)} in taxes!`, "tax-collection");
    
    // Visual effects
    screenFlash('#8B4513', 400); // Brown flash (tax color)
    screenShake(3, 200); // Gentle shake
    
    // Sound effect (reuse error sound for tax)
    AudioSystem.playErrorSound();
    
    // Create tax particles
    if (particleSystem) {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      if (particleEffectsEnabled) {
        particleSystem.createMoneyLossParticles(centerX, centerY, taxAmount);
      }
    }
    
    // Update displays
    renderBalances();
    
    // Log the event
    logEvent("💰 Tax Collection", "tax-collection");
  }
  
  function triggerRobbery() {
    // Robbery is an instant event (no duration) but follows the same "one event at a time" rule
    // Set cooldown
    GAME_CONFIG.EVENT_CONFIG.eventCooldowns.robbery = Date.now() + getEventCooldown('robbery');
    
    let stolenAmount = 0;
    let notificationMessage = "";
    
    // Check if current account has money
    if (currentAccountBalance > 0) {
      // Steal 25% of money from current account
      stolenAmount = currentAccountBalance * 0.25;
      currentAccountBalance -= stolenAmount;
      notificationMessage = `A thief stole €${formatNumberShort(stolenAmount)} from your current account!`;
    } else {
      // If current account is empty, steal from investment account based on difficulty
      const investmentStealRate = gameDifficulty === 'extreme' ? 0.25 : 0.01; // 20% for extreme, 1% for others
      stolenAmount = Math.floor(investmentAccountBalance * investmentStealRate);
      if (stolenAmount > 0) {
        investmentAccountBalance -= stolenAmount;
        notificationMessage = `A thief stole €${formatNumberShort(stolenAmount)} from your investment account!`;
      } else {
        // If investment account is also empty or very small, steal nothing
        notificationMessage = "A thief tried to rob you, but you have no money to steal!";
      }
    }
    
    // Show notification
    showEventNotification("🔫 You are robbed!", notificationMessage, "robbery");
    
    // Visual effects
    screenFlash('#8B0000', 600); // Dark red flash
    screenShake(8, 400); // Strong shake
    
    // Sound effect (reuse error sound for robbery)
    AudioSystem.playErrorSound();
    
    // Create robbery particles (only if money was actually stolen)
    if (particleSystem && stolenAmount > 0) {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      if (particleEffectsEnabled) {
        particleSystem.createMoneyLossParticles(centerX, centerY, stolenAmount);
      }
    }
    
    // Update displays
    renderBalances();
    
    // Log the event
    logEvent("🔫 Robbery", "robbery");
  }
  
  function triggerEarthquake() {
    if (marketBoomActive || marketCrashActive || flashSaleActive || greatDepressionActive || fastFingersActive) return; // Don't trigger if any event is active
    
    // Generate earthquake magnitude (4.0 to 8.0)
    const magnitude = 4.0 + Math.random() * 4.0; // Random between 4.0 and 8.0
    
    // Set earthquake as active
    earthquakeActive = true;
    earthquakeEndTime = Date.now() + GAME_CONFIG.EVENT_CONFIG.durations.earthquake;
    earthquakeMagnitude = magnitude;
    GAME_CONFIG.EVENT_CONFIG.eventCooldowns.earthquake = Date.now() + getEventCooldown('earthquake');
    
    // Calculate effects based on magnitude
    let rentReduction = 0;
    let demolishPercentage = 0;
    let demolishCount = 0;
    
    if (magnitude >= 4.0 && magnitude < 5.0) {
      // 4.0-5.0: 15% rent reduction
      rentReduction = 0.15;
    } else if (magnitude >= 5.0 && magnitude < 6.0) {
      // 5.0-6.0: 50% rent reduction
      rentReduction = 0.50;
    } else if (magnitude >= 6.0 && magnitude < 7.0) {
      // 6.0-7.0: 75% rent reduction + demolish 1-4% of buildings
      rentReduction = 0.75;
      demolishPercentage = 0.01 + (magnitude - 6.0) * 0.03; // 1% at 6.0, 4% at 7.0
    } else if (magnitude >= 7.0 && magnitude <= 8.0) {
      // 7.0-8.0: 100% rent reduction + demolish 4-25% of buildings
      rentReduction = 1.00;
      demolishPercentage = 0.04 + (magnitude - 7.0) * 0.21; // 4% at 7.0, 25% at 8.0
    }
    
    // Calculate total properties for demolition
    const totalProperties = Object.values(properties).reduce((sum, count) => sum + count, 0);
    demolishCount = Math.floor(totalProperties * demolishPercentage);
    
    // Demolish properties if applicable
    let demolishedProperties = {};
    if (demolishCount > 0) {
      demolishedProperties = demolishProperties(demolishCount);
    }
    
    // Show notification
    let notificationText = `Magnitude ${magnitude.toFixed(1)} earthquake! Rent income reduced by ${(rentReduction * 100).toFixed(0)}% for 30 seconds!`;
    if (demolishCount > 0) {
      notificationText += ` ${demolishCount} properties demolished!`;
    }
    
    showEventNotification("🌍 Earthquake!", notificationText, "earthquake");
    
    // Visual effects
    screenFlash('#8B4513', 800); // Brown flash
    screenShake(Math.min(15, magnitude * 2), 600); // Strong shake based on magnitude
    
    // Sound effect (reuse crash sound for now)
    AudioSystem.playMarketCrashSound();
    
    // Create destruction particles
    if (particleSystem && demolishCount > 0) {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      // Create destruction effect with multiple particle types
      if (particleEffectsEnabled) {
        particleSystem.createMoneyLossParticles(centerX, centerY, demolishCount * 1000); // Money loss particles for destruction
        particleSystem.createSparkleParticles(centerX, centerY, Math.min(demolishCount * 2, 10)); // Sparkles for destruction effect
        particleSystem.createUpgradeParticles(centerX, centerY, Math.min(demolishCount, 5)); // Upgrade particles for building destruction
      }
    }
    
    // Invalidate property income cache to ensure earthquake effects are applied
    propertyIncomeCacheValid = false;
    
    // Update displays
    renderAllProperties();
    renderRentIncome();
    updateActiveEventDisplay();
    
    // Log the event with demolition details
    const eventDetails = {
      magnitude: magnitude,
      rentReduction: rentReduction,
      demolishCount: demolishCount,
      demolishedProperties: demolishedProperties
    };
    logEvent(`🌍 Earthquake (${magnitude.toFixed(1)})`, "earthquake", eventDetails);
  }
  
  function demolishProperties(count) {
    if (count <= 0) return {};
    
    // Get all properties with counts > 0
    const availableProperties = Object.entries(properties).filter(([id, count]) => count > 0);
    if (availableProperties.length === 0) return {};
    
    // Track what was demolished
    const demolishedProperties = {};
    
    let remainingToDemolish = count;
    
    // Demolish properties randomly
    while (remainingToDemolish > 0 && availableProperties.length > 0) {
      // Pick a random property type
      const randomIndex = Math.floor(Math.random() * availableProperties.length);
      const [propertyId, currentCount] = availableProperties[randomIndex];
      
      // Demolish 1 property of this type
      properties[propertyId] = Math.max(0, currentCount - 1);
      remainingToDemolish--;
      
      // Track the demolition
      if (!demolishedProperties[propertyId]) {
        demolishedProperties[propertyId] = 0;
      }
      demolishedProperties[propertyId]++;
      
      // Update the available properties list
      if (properties[propertyId] === 0) {
        availableProperties.splice(randomIndex, 1);
      } else {
        availableProperties[randomIndex][1] = properties[propertyId];
      }
    }
    
    // Update displays
    renderAllProperties();
    renderRentIncome();
    
    return demolishedProperties;
  }
  
  function triggerDivorce() {
    // Divorce is an instant event (no duration) but follows the same "one event at a time" rule
    // Set cooldown
    GAME_CONFIG.EVENT_CONFIG.eventCooldowns.divorce = Date.now() + getEventCooldown('divorce');
    
    // Calculate total net worth and loss based on difficulty
    const totalNetWorth = currentAccountBalance + investmentAccountBalance;
    const lossRate = gameDifficulty === 'extreme' ? 0.65 : 0.5; // 65% for extreme, 50% for others
    const lossAmount = totalNetWorth * lossRate;
    
    // Apply loss to both accounts proportionally
    const currentLoss = currentAccountBalance * lossRate;
    const investmentLoss = investmentAccountBalance * lossRate;
    
    currentAccountBalance -= currentLoss;
    investmentAccountBalance -= investmentLoss;
    
    // Show notification
    const lossPercentage = Math.round(lossRate * 100);
    showEventNotification("💔 You are divorced!", `Lost €${formatNumberShort(lossAmount)} (${lossPercentage}% of your net worth)!`, "divorce");
    
    // Visual effects
    screenFlash('#8B008B', 700); // Purple flash (divorce color)
    screenShake(10, 500); // Very strong shake
    
    // Sound effect (reuse error sound for divorce)
    AudioSystem.playErrorSound();
    
    // Create divorce particles
    if (particleSystem) {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      if (particleEffectsEnabled) {
        particleSystem.createMoneyLossParticles(centerX, centerY, lossAmount);
      }
    }
    
    // Update displays
    renderBalances();
    
    // Log the event
    logEvent("💔 Divorce", "divorce");
  }
  
  function triggerFastFingers() {
    if (marketBoomActive || marketCrashActive || flashSaleActive || greatDepressionActive || fastFingersActive) return; // Don't trigger if any event is active
    
    fastFingersActive = true;
    fastFingersEndTime = Date.now() + GAME_CONFIG.EVENT_CONFIG.durations.fastFingers;
    GAME_CONFIG.EVENT_CONFIG.eventCooldowns.fastFingers = Date.now() + getEventCooldown('fastFingers');
    
    // Show notification
    showEventNotification("⚡ Fast Fingers!", "Click income boosted by 3x for 15 seconds!", "fast-fingers");
    
    // Visual effects
    screenFlash('#FFD700', 500); // Gold flash
    screenShake(2, 200); // Light shake
    
    // Play sound effect
    if (AudioSystem.getAudioSettings().soundEnabled) {
      AudioSystem.playFastFingersSound();
    }
    
    updateActiveEventDisplay();
    
    // Log the event
    logEvent("⚡ Fast Fingers", "fast-fingers");
  }

  // Make all event trigger functions globally available
  window.triggerMarketBoom = triggerMarketBoom;
  window.triggerMarketCrash = triggerMarketCrash;
  window.triggerFlashSale = triggerFlashSale;
  window.triggerGreatDepression = triggerGreatDepression;
  window.triggerTaxCollection = triggerTaxCollection;
  window.triggerRobbery = triggerRobbery;
  window.triggerEarthquake = triggerEarthquake;
  window.demolishProperties = demolishProperties;
  window.triggerDivorce = triggerDivorce;
  window.triggerFastFingers = triggerFastFingers;

  // Make helper functions globally available
  window.getEventProbability = getEventProbability;
  window.getEventCooldown = getEventCooldown;

  // Make game difficulty globally available
  window.getGameDifficulty = () => gameDifficulty;
  window.setGameDifficulty = (value) => gameDifficulty = value;

  // Note: Variables like currentAccountBalance, investmentAccountBalance, properties, owned
  // and functions like showEventNotification, screenFlash, screenShake, formatNumberShort
  // will be made globally accessible by app.js

  // Make event state variables globally available
  window.marketBoomActive = () => marketBoomActive;
  window.marketCrashActive = () => marketCrashActive;
  window.flashSaleActive = () => flashSaleActive;
  window.greatDepressionActive = () => greatDepressionActive;
  window.fastFingersActive = () => fastFingersActive;
  window.earthquakeActive = () => earthquakeActive;
  window.marketBoomEndTime = () => marketBoomEndTime;
  window.marketCrashEndTime = () => marketCrashEndTime;
  window.flashSaleEndTime = () => flashSaleEndTime;
  window.greatDepressionEndTime = () => greatDepressionEndTime;
  window.fastFingersEndTime = () => fastFingersEndTime;
  window.earthquakeEndTime = () => earthquakeEndTime;
  window.earthquakeMagnitude = () => earthquakeMagnitude;

  // Make event state setters globally available
  window.setMarketBoomActive = (value) => marketBoomActive = value;
  window.setMarketCrashActive = (value) => marketCrashActive = value;
  window.setFlashSaleActive = (value) => flashSaleActive = value;
  window.setGreatDepressionActive = (value) => greatDepressionActive = value;
  window.setFastFingersActive = (value) => fastFingersActive = value;
  window.setEarthquakeActive = (value) => earthquakeActive = value;
  window.setMarketBoomEndTime = (value) => marketBoomEndTime = value;
  window.setMarketCrashEndTime = (value) => marketCrashEndTime = value;
  window.setFlashSaleEndTime = (value) => flashSaleEndTime = value;
  window.setGreatDepressionEndTime = (value) => greatDepressionEndTime = value;
  window.setFastFingersEndTime = (value) => fastFingersEndTime = value;
  window.setEarthquakeEndTime = (value) => earthquakeEndTime = value;
  window.setEarthquakeMagnitude = (value) => earthquakeMagnitude = value;

})();
