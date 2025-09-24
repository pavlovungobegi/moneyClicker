(() => {
  let currentAccountBalance = 0;
  let investmentAccountBalance = 0;

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
  const buyU1Btn = document.getElementById("buyU1Btn");
  const buyU2Btn = document.getElementById("buyU2Btn");
  const buyU3Btn = document.getElementById("buyU3Btn");
  const buyU4Btn = document.getElementById("buyU4Btn");
  const buyU5Btn = document.getElementById("buyU5Btn");
  const buyU6Btn = document.getElementById("buyU6Btn");
  const buyU7Btn = document.getElementById("buyU7Btn");
  const buyU8Btn = document.getElementById("buyU8Btn");
  const buyU9Btn = document.getElementById("buyU9Btn");
  const buyU10Btn = document.getElementById("buyU10Btn");
  const buyU11Btn = document.getElementById("buyU11Btn");
  const buyU12Btn = document.getElementById("buyU12Btn");
  const buyU13Btn = document.getElementById("buyU13Btn");
  const buyU14Btn = document.getElementById("buyU14Btn");
  const buyU15Btn = document.getElementById("buyU15Btn");
  const buyU16Btn = document.getElementById("buyU16Btn");
  const buyU17Btn = document.getElementById("buyU17Btn");
  const buyU18Btn = document.getElementById("buyU18Btn");
  const buyU19Btn = document.getElementById("buyU19Btn");
  const buyU20Btn = document.getElementById("buyU20Btn");
  const buyU21Btn = document.getElementById("buyU21Btn");
  const buyU22Btn = document.getElementById("buyU22Btn");
  const buyU23Btn = document.getElementById("buyU23Btn");
  const buyU24Btn = document.getElementById("buyU24Btn");
  const buyU25Btn = document.getElementById("buyU25Btn");
  const buyU26Btn = document.getElementById("buyU26Btn");
  const buyU27Btn = document.getElementById("buyU27Btn");
  const buyU28Btn = document.getElementById("buyU28Btn");
  const buyU29Btn = document.getElementById("buyU29Btn");
  const buyU30Btn = document.getElementById("buyU30Btn");
  const buyU31Btn = document.getElementById("buyU31Btn");
  const buyU32Btn = document.getElementById("buyU32Btn");
  const rankDisplay = document.getElementById("rankDisplay");
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
  const clickStreakSection = document.getElementById("clickStreakSection");
  const streakMultiplierEl = document.getElementById("streakMultiplier");
  const streakProgressFill = document.getElementById("streakProgressFill");
  const streakProgressText = document.getElementById("streakProgressText");

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
          prestigeClickMultiplier = 10;
          prestigeInterestMultiplier = 10;
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

  // Format numbers with k/m/b/t suffixes for better readability
  function formatNumberShort(num) {
    if (num >= 1000000000000) {
      return (num / 1000000000000).toFixed(2) + 't';
    } else if (num >= 1000000000) {
      return (num / 1000000000).toFixed(2) + 'b';
    } else if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + 'm';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(2) + 'k';
    } else {
      return num.toFixed(0);
    }
  }

  function renderUpgradePrices() {
    const map = {
      u1: document.getElementById('u1Price'),
      u2: document.getElementById('u2Price'),
      u3: document.getElementById('u3Price'),
      u4: document.getElementById('u4Price'),
      u5: document.getElementById('u5Price'),
      u6: document.getElementById('u6Price'),
      u7: document.getElementById('u7Price'),
      u8: document.getElementById('u8Price'),
      u9: document.getElementById('u9Price'),
      u10: document.getElementById('u10Price'),
      u11: document.getElementById('u11Price'),
      u12: document.getElementById('u12Price'),
      u13: document.getElementById('u13Price'),
      u14: document.getElementById('u14Price'),
      u15: document.getElementById('u15Price'),
      u16: document.getElementById('u16Price'),
      u17: document.getElementById('u17Price'),
      u18: document.getElementById('u18Price'),
      u19: document.getElementById('u19Price'),
      u20: document.getElementById('u20Price'),
      u21: document.getElementById('u21Price'),
      u22: document.getElementById('u22Price'),
      u23: document.getElementById('u23Price'),
      u24: document.getElementById('u24Price'),
      u25: document.getElementById('u25Price'),
      u26: document.getElementById('u26Price'),
      u27: document.getElementById('u27Price'),
      u29: document.getElementById('u29Price'),
      u30: document.getElementById('u30Price'),
      u31: document.getElementById('u31Price'),
    };
    Object.entries(map).forEach(([key, el]) => {
      if (!el) return;
      const cost = UPGRADE_COSTS[key];
      el.textContent = '€' + formatNumberShort(cost);
    });
  }

  function renderBalances() {
    if (currentDisplay) {
      currentDisplay.textContent = '€' + formatNumberShort(currentAccountBalance);
      // Add update animation
      currentDisplay.classList.add('updating');
      setTimeout(() => currentDisplay.classList.remove('updating'), 400);
    }
    if (investmentDisplay) {
      investmentDisplay.textContent = '€' + formatNumberShort(investmentAccountBalance);
      // Add update animation
      investmentDisplay.classList.add('updating');
      setTimeout(() => investmentDisplay.classList.remove('updating'), 400);
    }
    
    // Update header displays
    if (headerCurrentDisplay) {
      headerCurrentDisplay.textContent = '€' + formatNumberShort(currentAccountBalance);
      headerCurrentDisplay.classList.add('updating');
      setTimeout(() => headerCurrentDisplay.classList.remove('updating'), 400);
    }
    if (headerInvestmentDisplay) {
      headerInvestmentDisplay.textContent = '€' + formatNumberShort(investmentAccountBalance);
      headerInvestmentDisplay.classList.add('updating');
      setTimeout(() => headerInvestmentDisplay.classList.remove('updating'), 400);
    }
  }

  function renderUpgradesOwned() {
    // Toggle CSS class to hide buy button and prevent layout shift
    const u1 = document.querySelector('.upgrade[data-upgrade-id="u1"]');
    const u2 = document.querySelector('.upgrade[data-upgrade-id="u2"]');
    const u3 = document.querySelector('.upgrade[data-upgrade-id="u3"]');
    const u4 = document.querySelector('.upgrade[data-upgrade-id="u4"]');
    const u5 = document.querySelector('.upgrade[data-upgrade-id="u5"]');
    const u6 = document.querySelector('.upgrade[data-upgrade-id="u6"]');
    const u7 = document.querySelector('.upgrade[data-upgrade-id="u7"]');
    const u8 = document.querySelector('.upgrade[data-upgrade-id="u8"]');
    const u9 = document.querySelector('.upgrade[data-upgrade-id="u9"]');
    if (u1) u1.classList.toggle('owned', !!owned.u1);
    if (u2) u2.classList.toggle('owned', !!owned.u2);
    if (u3) u3.classList.toggle('owned', !!owned.u3);
    if (u4) u4.classList.toggle('owned', !!owned.u4);
    if (u5) u5.classList.toggle('owned', !!owned.u5);
    if (u6) u6.classList.toggle('owned', !!owned.u6);
    if (u7) u7.classList.toggle('owned', !!owned.u7);
    if (u8) u8.classList.toggle('owned', !!owned.u8);
    if (u9) u9.classList.toggle('owned', !!owned.u9);
    const u10 = document.querySelector('.upgrade[data-upgrade-id="u10"]');
    const u11 = document.querySelector('.upgrade[data-upgrade-id="u11"]');
    const u12 = document.querySelector('.upgrade[data-upgrade-id="u12"]');
    const u13 = document.querySelector('.upgrade[data-upgrade-id="u13"]');
    const u14 = document.querySelector('.upgrade[data-upgrade-id="u14"]');
    const u15 = document.querySelector('.upgrade[data-upgrade-id="u15"]');
    const u16 = document.querySelector('.upgrade[data-upgrade-id="u16"]');
    const u17 = document.querySelector('.upgrade[data-upgrade-id="u17"]');
    const u18 = document.querySelector('.upgrade[data-upgrade-id="u18"]');
    const u19 = document.querySelector('.upgrade[data-upgrade-id="u19"]');
    const u20 = document.querySelector('.upgrade[data-upgrade-id="u20"]');
    const u21 = document.querySelector('.upgrade[data-upgrade-id="u21"]');
    const u22 = document.querySelector('.upgrade[data-upgrade-id="u22"]');
    const u23 = document.querySelector('.upgrade[data-upgrade-id="u23"]');
    const u24 = document.querySelector('.upgrade[data-upgrade-id="u24"]');
    const u25 = document.querySelector('.upgrade[data-upgrade-id="u25"]');
    const u26 = document.querySelector('.upgrade[data-upgrade-id="u26"]');
    const u27 = document.querySelector('.upgrade[data-upgrade-id="u27"]');
    const u28 = document.querySelector('.upgrade[data-upgrade-id="u28"]');
    const u29 = document.querySelector('.upgrade[data-upgrade-id="u29"]');
    const u30 = document.querySelector('.upgrade[data-upgrade-id="u30"]');
    if (u10) u10.classList.toggle('owned', !!owned.u10);
    if (u11) u11.classList.toggle('owned', !!owned.u11);
    if (u12) u12.classList.toggle('owned', !!owned.u12);
    if (u13) u13.classList.toggle('owned', !!owned.u13);
    if (u14) u14.classList.toggle('owned', !!owned.u14);
    if (u15) u15.classList.toggle('owned', !!owned.u15);
    if (u16) u16.classList.toggle('owned', !!owned.u16);
    if (u17) u17.classList.toggle('owned', !!owned.u17);
    if (u18) u18.classList.toggle('owned', !!owned.u18);
    if (u19) u19.classList.toggle('owned', !!owned.u19);
    if (u20) u20.classList.toggle('owned', !!owned.u20);
    if (u21) u21.classList.toggle('owned', !!owned.u21);
    if (u22) u22.classList.toggle('owned', !!owned.u22);
    if (u23) u23.classList.toggle('owned', !!owned.u23);
    if (u24) u24.classList.toggle('owned', !!owned.u24);
    if (u25) u25.classList.toggle('owned', !!owned.u25);
    if (u26) u26.classList.toggle('owned', !!owned.u26);
    if (u27) u27.classList.toggle('owned', !!owned.u27);
    if (u29) u29.classList.toggle('owned', !!owned.u29);
    if (u30) u30.classList.toggle('owned', !!owned.u30);
    const u31 = document.querySelector('.upgrade[data-upgrade-id="u31"]');
    if (u31) u31.classList.toggle('owned', !!owned.u31);
  }

  function getPerClickIncome() {
    let base = 1;
    let bonus = 0;
    if (owned.u1) bonus += 1;      // elementary school
    if (owned.u2) bonus += 2;      // secondary school
    if (owned.u3) bonus += 4;      // high school
    if (owned.u5) bonus += 10;     // bachelor's
    if (owned.u6) bonus += 20;     // master's
    if (owned.u7) bonus += 40;     // PhD
    
    
    let totalIncome = (base + bonus) * prestigeClickMultiplier;
    
    return totalIncome;
  }

  function handleClick() {
    let income = getPerClickIncome();
    
    // Track total clicks
    totalClicks++;
    
    // Handle click streak if upgrade is owned
    if (owned.u30) {
      updateClickStreak();
      income *= streakMultiplier;
    }
    
    // Check if this was a critical hit and multiply income by 5x
    const isCritical = owned.u29 && Math.random() < 0.15;
    if (isCritical) {
      income *= 5;
      totalCriticalHits++;
    }
    
    // Round income to 2 decimal places
    income = Math.round(income * 100) / 100;
    
    // Apply money cap
    const cappedIncome = applyMoneyCap(income);
    currentAccountBalance += cappedIncome;
    
    
    renderBalances();
    updateUpgradeIndicator();
    
    // Create flying money number with critical hit styling (show actual amount added)
    createFlyingMoney(cappedIncome, isCritical);
    
    // Play click sound
    playClickSound();
    
    // Check achievements
    checkAchievementsOptimized();
    
    // Save game state after significant changes
    saveGameState();
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
      resumeAudioContext();
      // Start background music on first user interaction (browser requirement)
      if (backgroundMusic) {
        startBackgroundMusic();
      }
    }, { once: true });
  }

  function parseAmountInput() {
    const value = amountInput && typeof amountInput.value === "string" ? amountInput.value.trim() : "";
    const parsed = Number(value);
    if (!isFinite(parsed) || parsed <= 0) return 0;
    return Math.floor(parsed * 100) / 100; // normalize to 2 decimals
  }

  function deposit() {
    // This function is no longer used since we removed the amount input
    // Keeping it for compatibility but it won't be called
  }

  function withdraw() {
    // This function is no longer used since we removed the amount input
    // Keeping it for compatibility but it won't be called
  }

  function depositAll() {
    if (currentAccountBalance <= 0) return;
    investmentAccountBalance += currentAccountBalance;
    currentAccountBalance = 0;
    renderBalances();
    if (amountInput) amountInput.value = ""; // clear input
    playDepositSound(); // Play deposit sound effect
    saveGameState();
  }

  function withdrawAll() {
    if (investmentAccountBalance <= 0) return;
    currentAccountBalance += investmentAccountBalance;
    investmentAccountBalance = 0;
    renderBalances();
    if (amountInput) amountInput.value = ""; // clear input
    playWithdrawSound(); // Play withdraw sound effect
    saveGameState();
  }

  function updateClickStreak() {
    const currentTime = Date.now();
    
    // Update streak
    streakCount++;
    lastClickTime = currentTime;
    
    // Calculate streak multiplier (linear from 1 to 3)
    // Streak builds up over time, reaching max at around 50-60 clicks
    const maxStreakForMaxMultiplier = 60;
    const progress = Math.min(streakCount / maxStreakForMaxMultiplier, 1);
    streakMultiplier = 1 + (progress * (MAX_STREAK_MULTIPLIER - 1));
    
    // Check if max streak is reached
    if (streakMultiplier >= MAX_STREAK_MULTIPLIER && !maxStreakReached) {
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
    const progress = ((streakMultiplier - 1) / (MAX_STREAK_MULTIPLIER - 1)) * 100;
    streakProgressFill.style.width = `${progress}%`;
    
    // Update progress text
    streakProgressText.textContent = `${streakMultiplier.toFixed(1)}x - ${MAX_STREAK_MULTIPLIER.toFixed(1)}x`;
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
    
    // Play achievement sound
    playAchievementSound();
    
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

  function renderStickFigure() {
    // Show/hide items based on upgrades
    const pencil = document.getElementById('pencil');
    const book = document.getElementById('book');
    const calculator = document.getElementById('calculator');
    const glasses = document.getElementById('glasses');
    const trophy = document.getElementById('trophy');
    const nobelPrize = document.getElementById('nobelPrize');
    
    if (pencil) pencil.style.display = owned.u1 ? 'block' : 'none';
    // Book is only shown if calculator is not owned (to avoid overlap)
    if (book) book.style.display = (owned.u2 && !owned.u3) ? 'block' : 'none';
    if (calculator) calculator.style.display = owned.u3 ? 'block' : 'none';
    if (glasses) glasses.style.display = owned.u5 ? 'block' : 'none';
    if (trophy) trophy.style.display = owned.u6 ? 'block' : 'none';
    if (nobelPrize) nobelPrize.style.display = owned.u7 ? 'block' : 'none';
    
    // Update education display
    renderEducationDisplay();
  }

  function renderEducationDisplay() {
    const educationDisplay = document.getElementById('educationDisplay');
    if (!educationDisplay) return;
    
    let educationLevel = 'None';
    
    if (owned.u7) {
      educationLevel = 'PhD';
    } else if (owned.u6) {
      educationLevel = 'Master\'s';
    } else if (owned.u5) {
      educationLevel = 'Bachelor\'s';
    } else if (owned.u3) {
      educationLevel = 'High School';
    } else if (owned.u2) {
      educationLevel = 'Secondary School';
    } else if (owned.u1) {
      educationLevel = 'Elementary School';
    }
    
    educationDisplay.innerHTML = `<span>Education:</span><span>${educationLevel}</span>`;
  }

  // Track last object counts to avoid unnecessary re-renders
  let lastObjectCounts = null;
  
  // Tour system (disabled - keeping for future use)
  let tourState = {
    active: false,
    currentStep: 0,
    completed: true, // Set to true to prevent any tour triggering
    portfolioTourShown: true // Set to true to prevent portfolio tour
  };

  // Tour persistence functions
  function saveTourState() {
    try {
      localStorage.setItem('moneyClicker_tourState', JSON.stringify(tourState));
    } catch (error) {
      console.warn('Could not save tour state:', error);
    }
  }

  function loadTourState() {
    try {
      const saved = localStorage.getItem('moneyClicker_tourState');
      if (saved) {
        const parsedState = JSON.parse(saved);
        // Merge with default state to handle new properties
        tourState = {
          ...tourState,
          ...parsedState
        };
      }
    } catch (error) {
      console.warn('Could not load tour state:', error);
    }
  }

  // Function to reset tutorial (useful for testing or user request)
  function resetTutorial() {
    tourState = {
      active: false,
      currentStep: 0,
      completed: false,
      portfolioTourShown: false
    };
    saveTourState();
    console.log('Tutorial has been reset. Refresh the page to see it again.');
  }

  // Make resetTutorial available globally for debugging
  window.resetTutorial = resetTutorial;

  // Game state persistence functions
  function saveGameState() {
    try {
      const gameState = {
        // Core balances
        currentAccountBalance,
        investmentAccountBalance,
        
        // Upgrades owned
        owned: { ...owned },
        
        // Statistics
        totalClicks,
        totalCriticalHits,
        totalUpgradesBought,
        hasPerformedPrestige,
        prestigeResets,
        totalDividendsReceived,
        
        // Click streak system
        streakCount,
        streakMultiplier,
        
        // Prestige multipliers
        prestigeClickMultiplier,
        prestigeInterestMultiplier,
        
        // Auto-invest settings
        autoInvestEnabled,
        
        // Game timing
        gameStartTime,
        
        // Audio settings
        musicEnabled,
        soundEffectsEnabled,
        
        // Achievement banner tracking
        achievementsBannerShown: { ...achievementsBannerShown },
        
        // Save timestamp
        lastSaved: Date.now()
      };
      
      localStorage.setItem('moneyClicker_gameState', JSON.stringify(gameState));
      console.log('Game state saved successfully');
    } catch (error) {
      console.warn('Could not save game state:', error);
    }
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
        
        // Restore statistics
        totalClicks = gameState.totalClicks || 0;
        totalCriticalHits = gameState.totalCriticalHits || 0;
        totalUpgradesBought = gameState.totalUpgradesBought || 0;
        hasPerformedPrestige = gameState.hasPerformedPrestige || false;
        prestigeResets = gameState.prestigeResets || 0;
        totalDividendsReceived = gameState.totalDividendsReceived || 0;
        
        // Restore click streak
        streakCount = gameState.streakCount || 0;
        streakMultiplier = gameState.streakMultiplier || 1;
        
        // Restore prestige multipliers
        prestigeClickMultiplier = gameState.prestigeClickMultiplier || 1;
        prestigeInterestMultiplier = gameState.prestigeInterestMultiplier || 1;
        
        // Restore auto-invest
        autoInvestEnabled = gameState.autoInvestEnabled || false;
        
        // Restore game timing and calculate offline interest
        if (gameState.gameStartTime && gameState.lastSaved) {
          const offlineTime = Date.now() - gameState.lastSaved;
          gameStartTime = gameState.gameStartTime + offlineTime;
          
          // Calculate offline interest if user was away for more than 1 second
          if (offlineTime > 1000 && gameState.investmentAccountBalance > 0) {
            const offlineSeconds = Math.floor(offlineTime / 1000);
            const maxOfflineSeconds = 3600; // Cap at 1 hour of offline interest
            
            // Apply capped offline time
            const cappedOfflineSeconds = Math.min(offlineSeconds, maxOfflineSeconds);
            
            // Calculate compound interest for offline time
            const compoundMultiplier = getCompoundMultiplierPerTick();
            const ticksPerSecond = 1000 / 50; // Assuming 50ms tick rate
            const totalTicks = cappedOfflineSeconds * ticksPerSecond;
            
            // Apply compound growth
            const offlineGrowth = gameState.investmentAccountBalance * Math.pow(compoundMultiplier, totalTicks) - gameState.investmentAccountBalance;
            const cappedOfflineGrowth = applyMoneyCap(offlineGrowth);
            
            investmentAccountBalance += cappedOfflineGrowth;
            
            console.log(`Applied ${cappedOfflineSeconds}s of offline interest: +$${formatNumber(cappedOfflineGrowth)}`);
          }
        } else {
          gameStartTime = gameState.gameStartTime || Date.now();
        }
        
        // Restore audio settings
        musicEnabled = gameState.musicEnabled !== undefined ? gameState.musicEnabled : true;
        soundEffectsEnabled = gameState.soundEffectsEnabled !== undefined ? gameState.soundEffectsEnabled : true;
        
        // Restore achievement banner tracking
        achievementsBannerShown = gameState.achievementsBannerShown || {};
        
        console.log('Game state loaded successfully');
        
        // Update UI after loading state
    // Initialize upgrade visibility state before rendering
    initUpgradeVisibility();
    
    renderBalances();
    renderUpgradesOwned();
    renderUpgradePrices();
    // Apply upgrade visibility rules now that hide-completed class is set
    sortUpgradesByCost();
    renderInvestmentUnlocked();
    renderInterestPerSecond();
    renderAutoInvestSection();
    renderStatistics();
    updateUpgradeIndicator();
        
        // Apply audio settings after loading game state
        applyAudioSettings();
        
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
      localStorage.removeItem('moneyClicker_tourState');
      
      // Reset achievement banner tracking
      achievementsBannerShown = {};
      
      // Reset prestige multipliers
      prestigeClickMultiplier = 1;
      prestigeInterestMultiplier = 1;
      
      console.log('All game data has been reset. Refresh the page to start fresh.');
    } catch (error) {
      console.warn('Could not reset game state:', error);
    }
  }

  // Make functions available globally for debugging
  window.saveGameState = saveGameState;
  window.loadGameState = loadGameState;
  window.resetGameState = resetGameState;

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
    totalClicks = 0;
    totalCriticalHits = 0;
    totalUpgradesBought = 0;
    hasPerformedPrestige = false;
    prestigeResets = 0;
    totalDividendsReceived = 0;
    streakCount = 0;
    streakMultiplier = 1;
    autoInvestEnabled = false;
    gameStartTime = Date.now();
    
    // Reset all upgrades
    Object.keys(owned).forEach(upgradeKey => {
      owned[upgradeKey] = false;
    });
    
    // Reset audio settings to defaults
    musicEnabled = true;
    soundEffectsEnabled = true;
    
    // Reset tour state
    tourState = {
      active: false,
      currentStep: 0,
      completed: false,
      portfolioTourShown: false
    };
    
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
  
  
  const tourSteps = [
    {
      target: 'clickBtn',
      title: 'Welcome to Interest Inc!',
      message: 'Click this button to start earning money! Each click gives you €1.',
      position: 'bottom'
    },
    {
      target: 'buyU1Btn',
      title: 'Time to Upgrade!',
      message: 'You have enough money! Buy your first upgrade to earn more per click.',
      position: 'right'
    },
    {
      target: 'leaderboardPanel',
      title: 'Your Portfolio',
      message: 'Check out your Portfolio! The stick figure represents your education progress, and the global rank shows your wealth ranking worldwide.',
      position: 'right'
    }
  ];
  
  function renderWealthVisualization() {
    const totalWealth = currentAccountBalance + investmentAccountBalance;
    
    // Define wealth objects and their values
    const wealthObjects = [
      { value: 10000000000000, id: 'galaxy', emoji: '🌌' },
      { value: 1000000000000, id: 'trillionStar', emoji: '⭐' },
      { value: 100000000000, id: 'globe', emoji: '🌍' },
      { value: 10000000000, id: 'crown', emoji: '👑' },
      { value: 1000000000, id: 'privateIsland', emoji: '🏝️' },
      { value: 100000000, id: 'castle', emoji: '🏰' },
      { value: 10000000, id: 'diamond', emoji: '💎' },
      { value: 1000000, id: 'goldBar', emoji: '🥇' },
      { value: 100000, id: 'moneyStack', emoji: '💰' },
      { value: 10000, id: 'moneyBill', emoji: '💵' },
      { value: 1000, id: 'coin', emoji: '🪙' }
    ];
    
    // Calculate how many of each object we can afford
    let remainingWealth = totalWealth;
    const currentObjectCounts = {};
    
    wealthObjects.forEach(({ value, id, emoji }) => {
      const count = Math.floor(remainingWealth / value);
      currentObjectCounts[id] = count;
      remainingWealth = remainingWealth % value;
    });
    
    // Filter out objects that represent less than 1% of total wealth
    const filteredObjectCounts = {};
    wealthObjects.forEach(({ value, id }) => {
      const count = currentObjectCounts[id] || 0;
      const singleObjectPercentage = totalWealth > 0 ? (value / totalWealth) * 100 : 0;
      
      
      // Only include objects where a single object represents 1% or more of total wealth
      if (singleObjectPercentage >= 1) {
        filteredObjectCounts[id] = count;
      }
    });
    
    // Check if the filtered object counts have changed
    const hasChanged = !lastObjectCounts || 
      wealthObjects.some(({ id }) => (filteredObjectCounts[id] || 0) !== (lastObjectCounts[id] || 0));
    
    // Only update if the visual representation has changed
    if (!hasChanged) return;
    
    // Get the container
    const container = document.querySelector('.wealth-objects');
    if (!container) return;
    
    // If this is the first render, do a full render
    if (!lastObjectCounts) {
      lastObjectCounts = { ...filteredObjectCounts };
      container.innerHTML = '';
      
      // Add all filtered objects
      wealthObjects.forEach(({ id, emoji }) => {
        const count = filteredObjectCounts[id] || 0;
        for (let i = 0; i < count; i++) {
          const span = document.createElement('span');
          span.className = 'wealth-object';
          span.id = `${id}_${i}`;
          span.textContent = emoji;
          span.style.display = 'inline-block';
          span.style.animation = 'wealthAppear 0.5s ease-out';
          container.appendChild(span);
        }
      });
      return;
    }
    
    // Incremental update: only add/remove objects that changed
    wealthObjects.forEach(({ id, emoji }) => {
      const oldCount = lastObjectCounts[id] || 0;
      const newCount = filteredObjectCounts[id] || 0;
      
      if (newCount > oldCount) {
        // Add new objects
        for (let i = oldCount; i < newCount; i++) {
          const span = document.createElement('span');
          span.className = 'wealth-object';
          span.id = `${id}_${i}`;
          span.textContent = emoji;
          span.style.display = 'inline-block';
          span.style.animation = 'wealthAppear 0.5s ease-out';
          container.appendChild(span);
        }
      } else if (newCount < oldCount) {
        // Remove excess objects
        for (let i = newCount; i < oldCount; i++) {
          const elementToRemove = document.getElementById(`${id}_${i}`);
          if (elementToRemove) {
            elementToRemove.remove();
          }
        }
      }
    });
    
    // Update the last counts with filtered values
    lastObjectCounts = { ...filteredObjectCounts };
  }

  function startTour() {
    if (tourState.completed) return;
    
    tourState.active = true;
    tourState.currentStep = 0;
    showTourStep();
  }
  
  function showTourStep() {
    if (!tourState.active || tourState.currentStep >= tourSteps.length) {
      endTour();
      return;
    }
    
    const step = tourSteps[tourState.currentStep];
    const targetElement = document.getElementById(step.target);
    
    if (!targetElement) {
      endTour();
      return;
    }
    
    // Mobile-specific scrolling for upgrade tour
    if (window.innerWidth <= 768 && tourState.currentStep === 1) {
      // Scroll to upgrades panel on mobile
      const panelsContainer = document.querySelector('.panels');
      if (panelsContainer) {
        // Calculate scroll position to show upgrades panel (second panel)
        const panelWidth = window.innerWidth - 32; // Account for padding
        panelsContainer.scrollTo({
          left: panelWidth,
          behavior: 'smooth'
        });
        
        // Wait for scroll to complete before showing tooltip
        setTimeout(() => {
          showTourTooltip(step, targetElement);
        }, 500);
        return;
      }
    }
    
    showTourTooltip(step, targetElement);
  }
  
  function showTourTooltip(step, targetElement) {
    // Show overlay
    const overlay = document.getElementById('tourOverlay');
    const tooltip = document.getElementById('tourTooltip');
    const title = document.getElementById('tourTitle');
    const message = document.getElementById('tourMessage');
    
    overlay.classList.remove('hidden');
    title.textContent = step.title;
    message.textContent = step.message;
    
    // Position tooltip near target element
    positionTooltip(targetElement, tooltip, step.position);
    
    // Highlight target element
    targetElement.classList.add('tour-highlight');
  }
  
  function positionTooltip(targetElement, tooltip, position) {
    const targetRect = targetElement.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const arrow = tooltip.querySelector('.tour-arrow');
    const isMobile = window.innerWidth <= 768;
    
    // Remove existing arrow classes
    arrow.className = 'tour-arrow';
    
    let top, left;
    
    // Mobile-specific positioning
    if (isMobile) {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Check if this is the portfolio tour (step 2)
      const isPortfolioTour = tourState.currentStep === 2;
      
      if (isPortfolioTour) {
        // For portfolio tour, position near bottom but with more space
        top = viewportHeight - tooltipRect.height - 80; // More space from bottom
        left = Math.max(20, (viewportWidth - tooltipRect.width) / 2);
        
        // Ensure it doesn't go off screen horizontally
        if (left + tooltipRect.width > viewportWidth - 20) {
          left = viewportWidth - tooltipRect.width - 20;
        }
        
        // Ensure it doesn't go too high
        if (top < 20) {
          top = 20;
        }
      } else {
        // For other tours, center the modal
        top = Math.max(20, (viewportHeight - tooltipRect.height) / 2);
        left = Math.max(20, (viewportWidth - tooltipRect.width) / 2);
        
        // Ensure tooltip doesn't go off screen
        if (left + tooltipRect.width > viewportWidth - 20) {
          left = viewportWidth - tooltipRect.width - 20;
        }
        if (top + tooltipRect.height > viewportHeight - 20) {
          top = viewportHeight - tooltipRect.height - 20;
        }
      }
      
      // Hide arrow on mobile for cleaner look
      arrow.style.display = 'none';
    } else {
      // Desktop positioning logic
      switch (position) {
        case 'bottom':
          top = targetRect.bottom + 20;
          left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
          arrow.classList.add('top');
          break;
        case 'right':
          top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
          left = targetRect.right + 30;
          arrow.classList.add('left');
          break;
        case 'left':
          top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
          left = targetRect.left - tooltipRect.width - 20;
          arrow.classList.add('right');
          break;
        case 'top':
          top = targetRect.top - tooltipRect.height - 20;
          left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
          arrow.classList.add('bottom');
          break;
      }
      
      // Show arrow on desktop
      arrow.style.display = 'block';
      
      // Ensure tooltip stays within viewport
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      if (left < 20) left = 20;
      if (left + tooltipRect.width > viewportWidth - 20) {
        left = viewportWidth - tooltipRect.width - 20;
      }
      if (top < 20) top = 20;
      if (top + tooltipRect.height > viewportHeight - 20) {
        top = viewportHeight - tooltipRect.height - 20;
      }
    }
    
    // Use requestAnimationFrame to ensure proper rendering
    requestAnimationFrame(() => {
      tooltip.style.position = 'fixed';
      tooltip.style.top = top + 'px';
      tooltip.style.left = left + 'px';
    });
  }
  
  
  function endTour() {
    tourState.active = false;
    tourState.completed = true;
    
    // Save tour state
    saveTourState();
    
    // Hide overlay
    const overlay = document.getElementById('tourOverlay');
    overlay.classList.add('hidden');
    
    // Remove all highlights
    document.querySelectorAll('.tour-highlight').forEach(el => {
      el.classList.remove('tour-highlight');
    });
  }
  
  function checkTourTriggers() {
    // Tour triggering disabled - keeping logic for future use
    return;
    
    if (tourState.completed) return;
    
    // Start tour if user hasn't clicked yet and has no money
    if (currentAccountBalance === 0 && !tourState.active) {
      startTour();
      return;
    }
    
    // Show upgrade tour if user has enough money for first upgrade
    if (currentAccountBalance >= UPGRADE_COSTS.u1 && !owned.u1 && tourState.currentStep === 0) {
      tourState.currentStep = 1;
      showTourStep();
    }
    
    // End tour if user bought the first upgrade
    if (tourState.active && tourState.currentStep === 1 && owned.u1) {
      endTour();
    }
  }
  
  // Separate function for portfolio tour
  function checkPortfolioTour() {
    // Portfolio tour triggering disabled - keeping logic for future use
    return;
    
    // Check if user just upgraded to secondary school
    if (owned.u2 && !tourState.portfolioTourShown) {
      tourState.portfolioTourShown = true;
      saveTourState(); // Save that portfolio tour was shown
      showPortfolioTour();
    }
  }
  
  function showPortfolioTour() {
    const step = tourSteps[2]; // Portfolio step
    const targetElement = document.getElementById(step.target);
    
    if (!targetElement) return;
    
    // Set the current step for positioning logic
    tourState.currentStep = 2;
    
    // Mobile-specific scrolling for portfolio tour
    if (window.innerWidth <= 768) {
      // Scroll to portfolio panel on mobile (third panel)
      const panelsContainer = document.querySelector('.panels');
      if (panelsContainer) {
        // Calculate scroll position to show portfolio panel (third panel)
        const panelWidth = window.innerWidth - 32; // Account for padding
        panelsContainer.scrollTo({
          left: panelWidth * 2, // Third panel (index 2)
          behavior: 'smooth'
        });
        
        // Wait for scroll to complete before showing tooltip
        setTimeout(() => {
          showPortfolioTooltip(step, targetElement);
        }, 600);
        return;
      }
    }
    
    showPortfolioTooltip(step, targetElement);
  }
  
  function showPortfolioTooltip(step, targetElement) {
    // Show overlay
    const overlay = document.getElementById('tourOverlay');
    const tooltip = document.getElementById('tourTooltip');
    const title = document.getElementById('tourTitle');
    const message = document.getElementById('tourMessage');
    
    overlay.classList.remove('hidden');
    title.textContent = step.title;
    message.textContent = step.message;
    
    // Use the same positioning logic as other tours
    // This will now use the mobile-specific bottom positioning for portfolio tour
    positionTooltip(targetElement, tooltip, step.position);
    
    // Highlight target element
    targetElement.classList.add('tour-highlight');
  }

  function renderStatistics() {
    // Time played
    const timePlayed = Math.floor((Date.now() - gameStartTime) / 1000);
    const timePlayedEl = document.getElementById('timePlayedDisplay');
    if (timePlayedEl) {
      if (timePlayed < 60) {
        timePlayedEl.textContent = `${timePlayed}s`;
      } else if (timePlayed < 3600) {
        timePlayedEl.textContent = `${Math.floor(timePlayed / 60)}m ${timePlayed % 60}s`;
      } else {
        timePlayedEl.textContent = `${Math.floor(timePlayed / 3600)}h ${Math.floor((timePlayed % 3600) / 60)}m`;
      }
    }

    // Total clicks
    const totalClicksEl = document.getElementById('totalClicksDisplay');
    if (totalClicksEl) {
      totalClicksEl.textContent = new Intl.NumberFormat("en-US").format(totalClicks);
    }


    // Total critical hits
    const totalCriticalHitsEl = document.getElementById('totalCriticalHitsDisplay');
    if (totalCriticalHitsEl) {
      totalCriticalHitsEl.textContent = new Intl.NumberFormat("en-US").format(totalCriticalHits);
    }

    // Upgrades bought
    const upgradesBoughtEl = document.getElementById('upgradesBoughtDisplay');
    if (upgradesBoughtEl) {
      const totalUpgrades = Object.keys(UPGRADE_COSTS).length;
      upgradesBoughtEl.textContent = `${totalUpgradesBought}/${totalUpgrades}`;
    }



    // Prestige resets
    const prestigeResetsEl = document.getElementById('prestigeResetsDisplay');
    if (prestigeResetsEl) {
      prestigeResetsEl.textContent = new Intl.NumberFormat("en-US").format(prestigeResets);
    }

    // Achievements unlocked
    const achievementsUnlockedEl = document.getElementById('achievementsUnlockedDisplay');
    if (achievementsUnlockedEl) {
      const unlockedCount = Object.values(achievements).filter(ach => ach.unlocked).length;
      achievementsUnlockedEl.textContent = `${unlockedCount}/12`;
    }
  }

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

  // Prestige system
  let prestigeClickMultiplier = 1;
  let prestigeInterestMultiplier = 1;

  // Automatic investments
  let autoInvestEnabled = false;

  // Click streak system
  let lastClickTime = 0;
  let streakCount = 0;
  let streakMultiplier = 1;
  const STREAK_TIMEOUT_MS = 2000; // 2 seconds
  const MAX_STREAK_MULTIPLIER = 3;

  // Auto clicker system
  let autoClickTimer = 0;
  const AUTO_CLICK_INTERVAL_MS = 3000; // 3 seconds

  // Achievement system
  let totalClicks = 0;
  let totalCriticalHits = 0;
  let totalUpgradesBought = 0;
  let hasPerformedPrestige = false;
  let maxStreakReached = false;
  let totalDividendsReceived = 0;

  // Statistics tracking
  let gameStartTime = Date.now();
  let prestigeResets = 0;
  
  const achievements = {
    ach1: { unlocked: false, condition: () => getTotalMoney() >= 1000 },
    ach2: { unlocked: false, condition: () => getTotalMoney() >= 10000 },
    ach3: { unlocked: false, condition: () => getTotalMoney() >= 1000000 },
    ach4: { unlocked: false, condition: () => getTotalMoney() >= 1000000000 },
    ach5: { unlocked: false, condition: () => getTotalMoney() >= 1000000000000 },
    ach6: { unlocked: false, condition: () => totalClicks >= 1000 },
    ach7: { unlocked: false, condition: () => totalCriticalHits >= 100 },
    ach8: { unlocked: false, condition: () => maxStreakReached },
    ach9: { unlocked: false, condition: () => totalUpgradesBought >= 5 },
    ach10: { unlocked: false, condition: () => investmentAccountBalance >= 100000 },
    ach11: { unlocked: false, condition: () => totalDividendsReceived >= 1000000 }, // Receive €1,000,000 in dividends
    ach12: { unlocked: false, condition: () => hasPerformedPrestige }
  };

  // Money cap system
  const MAX_TOTAL_MONEY = 100000000000000; // 100 trillion euros

  function getTotalMoney() {
    return currentAccountBalance + investmentAccountBalance;
  }

  function applyMoneyCap(amountToAdd) {
    const currentTotal = getTotalMoney();
    const newTotal = currentTotal + amountToAdd;
    
    if (newTotal <= MAX_TOTAL_MONEY) {
      return amountToAdd; // No cap needed
    } else {
      return Math.max(0, MAX_TOTAL_MONEY - currentTotal); // Only add what fits
    }
  }


  // Audio system
  let audioContext = null;
  let soundEnabled = true;
  let backgroundMusic = null;
  let musicEnabled = true;
  let soundEffectsEnabled = true;

  function initAudio() {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      console.log('Audio context initialized, state:', audioContext.state);
      
      // iOS PWA specific: Resume audio context on first user interaction
      if (audioContext.state === 'suspended') {
        console.log('Audio context suspended, will resume on user interaction');
      }
    } catch (e) {
      console.log('Audio not supported:', e);
      soundEnabled = false;
    }
  }

  // Resume audio context for iOS PWA compatibility
  function resumeAudioContext() {
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume().then(() => {
        console.log('Audio context resumed for iOS PWA');
      }).catch(e => {
        console.log('Failed to resume audio context:', e);
      });
    }
  }

  function initBackgroundMusic() {
    try {
      backgroundMusic = new Audio('backround.mp3');
      backgroundMusic.loop = true;
      backgroundMusic.volume = 0.05; // Set volume to 5% so it doesn't overpower sound effects
      backgroundMusic.preload = 'auto';
      
      // Handle audio loading errors
      backgroundMusic.addEventListener('error', (e) => {
        console.log('Background music failed to load:', e);
      });
      
      // Start playing when ready
      backgroundMusic.addEventListener('canplaythrough', () => {
        backgroundMusic.play().catch(e => {
          console.log('Background music play failed:', e);
          // This is normal - browsers require user interaction before playing audio
        });
      });
      
    } catch (e) {
      console.log('Background music initialization failed:', e);
    }
  }

  function startBackgroundMusic() {
    if (!backgroundMusic || !musicEnabled) return;
    
    try {
      // Ensure audio context is resumed for iOS PWA
      resumeAudioContext();
      
      backgroundMusic.currentTime = 0; // Start from beginning
      backgroundMusic.play().catch(e => {
        console.log('Background music play failed:', e);
        // This is normal - browsers require user interaction before playing audio
      });
    } catch (e) {
      console.log('Background music start failed:', e);
    }
  }

  function toggleBackgroundMusic() {
    if (!backgroundMusic) {
      console.log('Background music not initialized yet');
      return;
    }
    
    if (musicEnabled) {
      console.log('Starting background music');
      startBackgroundMusic();
    } else {
      console.log('Pausing background music');
      backgroundMusic.pause();
    }
  }

  function playClickSound() {
    if (!soundEnabled || !audioContext || !soundEffectsEnabled) return;
    
    // Ensure audio context is resumed for iOS PWA
    resumeAudioContext();
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.04, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  }

  function playBuySound() {
    if (!soundEnabled || !audioContext || !soundEffectsEnabled) return;
    
    // Ensure audio context is resumed for iOS PWA
    resumeAudioContext();
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.6, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.04, audioContext.currentTime + 0.2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  }

  function playErrorSound() {
    if (!soundEnabled || !audioContext || !soundEffectsEnabled) return;
    
    // Ensure audio context is resumed for iOS PWA
    resumeAudioContext();
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 0.3);
    
    gainNode.gain.setValueAtTime(1.0, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.16, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  }

  function playDepositSound() {
    if (!soundEnabled || !audioContext || !soundEffectsEnabled) return;
    
    // Ensure audio context is resumed for iOS PWA
    resumeAudioContext();
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Ascending tone for deposit (money going in)
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1000, audioContext.currentTime + 0.15);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.03, audioContext.currentTime + 0.15);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.15);
  }

  function playWithdrawSound() {
    if (!soundEnabled || !audioContext || !soundEffectsEnabled) return;
    
    // Ensure audio context is resumed for iOS PWA
    resumeAudioContext();
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Descending tone for withdraw (money coming out)
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.15);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.03, audioContext.currentTime + 0.15);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.15);
  }

  function playAchievementSound() {
    if (!soundEnabled || !audioContext || !soundEffectsEnabled) return;
    
    // Ensure audio context is resumed for iOS PWA
    resumeAudioContext();
    
    // Create a realistic cash register "ka-ching" sound
    const oscillator1 = audioContext.createOscillator();
    const oscillator2 = audioContext.createOscillator();
    const oscillator3 = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    oscillator3.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // "Ka" sound - metallic, percussive
    oscillator1.frequency.setValueAtTime(200, audioContext.currentTime);
    oscillator1.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 0.08);
    
    // "Ching" sound - bright, bell-like
    oscillator2.frequency.setValueAtTime(1000, audioContext.currentTime + 0.08);
    oscillator2.frequency.exponentialRampToValueAtTime(1500, audioContext.currentTime + 0.15);
    
    // Harmonic for metallic quality
    oscillator3.frequency.setValueAtTime(2000, audioContext.currentTime + 0.08);
    oscillator3.frequency.exponentialRampToValueAtTime(3000, audioContext.currentTime + 0.15);
    
    // Volume envelope for realistic cash register sound
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.4, audioContext.currentTime + 0.02); // Quick "ka" attack
    gainNode.gain.setValueAtTime(0.05, audioContext.currentTime + 0.08); // "ka" decay
    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime + 0.1); // "ching" attack
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3); // "ching" decay
    
    oscillator1.start(audioContext.currentTime);
    oscillator2.start(audioContext.currentTime + 0.08);
    oscillator3.start(audioContext.currentTime + 0.08);
    
    oscillator1.stop(audioContext.currentTime + 0.08);
    oscillator2.stop(audioContext.currentTime + 0.3);
    oscillator3.stop(audioContext.currentTime + 0.3);
  }

  // Upgrades state
  const UPGRADE_COSTS = { u1: 10, u2: 20, u3: 50, u4: 6000, u5: 100, u6: 250, u7: 500, u8: 20000, u9: 250000, u10: 10000, u11: 20, u12: 25000, u13: 30000, u14: 300000, u15: 400000, u16: 1000000, u17: 2000000, u18: 5000000, u19: 10000000, u20: 25000000, u21: 40000000, u22: 75000000, u23: 150000000, u24: 500000000, u25: 1000000000, u26: 1000000000000, u27: 750000000, u29: 1250, u30: 50000, u31: 75000 };
  const owned = { u1: false, u2: false, u3: false, u4: false, u5: false, u6: false, u7: false, u8: false, u9: false, u10: false, u11: false, u12: false, u13: false, u14: false, u15: false, u16: false, u17: false, u18: false, u19: false, u20: false, u21: false, u22: false, u23: false, u24: false, u25: false, u26: false, u27: false, u29: false, u30: false, u31: false };

  function tryBuyUpgrade(key) {
    if (owned[key]) return;
    const cost = UPGRADE_COSTS[key];
    if (currentAccountBalance < cost) {
      playErrorSound();
      return;
    }

    // Special handling for prestige reset (u26)
    if (key === "u26") {
      if (confirm("Are you sure you want to reset everything? This will give you permanent +25% multipliers but reset all money and upgrades.")) {
        // Apply permanent multipliers
        prestigeClickMultiplier *= 1.25;
        prestigeInterestMultiplier *= 1.25;
        hasPerformedPrestige = true;
        prestigeResets++;
        
        // Reset everything
        currentAccountBalance = 0;
        investmentAccountBalance = 0;
        dividendElapsed = 0;
        autoInvestEnabled = false;
        
        // Reset all upgrades
        Object.keys(owned).forEach(upgradeKey => {
          owned[upgradeKey] = false;
        });
        
        // Reset auto-invest toggle
        if (autoInvestToggle) {
          autoInvestToggle.checked = false;
        }
        
        // Update UI
        renderBalances();
        renderUpgradesOwned();
        renderPrestigeMultipliers();
        sortUpgradesByCost();
        renderInvestmentUnlocked();
        renderInterestPerSecond();
        renderDividendUI(0);
        renderAutoInvestSection();
        
        // Check achievements after prestige
        checkAchievementsOptimized();
      }
      return;
    }

    currentAccountBalance -= cost;
    owned[key] = true;
    totalUpgradesBought++;
    
    
    renderBalances();
    renderUpgradesOwned();
    // After purchase, re-sort and re-evaluate which upgrade to show next
    renderUpgradePrices();
    sortUpgradesByCost();
    updateUpgradeIndicator();
    
    // Play buy sound
    playBuySound();
    
    // Check achievements
    checkAchievementsOptimized();
    
    // Save game state after upgrade purchase
    saveGameState();
  }

  if (buyU1Btn) buyU1Btn.addEventListener("click", () => tryBuyUpgrade("u1"));
  if (buyU2Btn) buyU2Btn.addEventListener("click", () => tryBuyUpgrade("u2"));
  if (buyU3Btn) buyU3Btn.addEventListener("click", () => tryBuyUpgrade("u3"));
  if (buyU4Btn) buyU4Btn.addEventListener("click", () => tryBuyUpgrade("u4"));
  if (buyU5Btn) buyU5Btn.addEventListener("click", () => tryBuyUpgrade("u5"));
  if (buyU6Btn) buyU6Btn.addEventListener("click", () => tryBuyUpgrade("u6"));
  if (buyU7Btn) buyU7Btn.addEventListener("click", () => tryBuyUpgrade("u7"));
  if (buyU8Btn) buyU8Btn.addEventListener("click", () => tryBuyUpgrade("u8"));
  if (buyU9Btn) buyU9Btn.addEventListener("click", () => tryBuyUpgrade("u9"));
  if (buyU10Btn) buyU10Btn.addEventListener("click", () => tryBuyUpgrade("u10"));
  if (buyU11Btn) buyU11Btn.addEventListener("click", () => tryBuyUpgrade("u11"));
  if (buyU12Btn) buyU12Btn.addEventListener("click", () => tryBuyUpgrade("u12"));
  if (buyU13Btn) buyU13Btn.addEventListener("click", () => tryBuyUpgrade("u13"));
  if (buyU14Btn) buyU14Btn.addEventListener("click", () => tryBuyUpgrade("u14"));
  if (buyU15Btn) buyU15Btn.addEventListener("click", () => tryBuyUpgrade("u15"));
  if (buyU16Btn) buyU16Btn.addEventListener("click", () => tryBuyUpgrade("u16"));
  if (buyU17Btn) buyU17Btn.addEventListener("click", () => tryBuyUpgrade("u17"));
  if (buyU18Btn) buyU18Btn.addEventListener("click", () => tryBuyUpgrade("u18"));
  if (buyU19Btn) buyU19Btn.addEventListener("click", () => tryBuyUpgrade("u19"));
  if (buyU20Btn) buyU20Btn.addEventListener("click", () => tryBuyUpgrade("u20"));
  if (buyU21Btn) buyU21Btn.addEventListener("click", () => tryBuyUpgrade("u21"));
  if (buyU22Btn) buyU22Btn.addEventListener("click", () => tryBuyUpgrade("u22"));
  if (buyU23Btn) buyU23Btn.addEventListener("click", () => tryBuyUpgrade("u23"));
  if (buyU24Btn) buyU24Btn.addEventListener("click", () => tryBuyUpgrade("u24"));
  if (buyU25Btn) buyU25Btn.addEventListener("click", () => tryBuyUpgrade("u25"));
  if (buyU26Btn) buyU26Btn.addEventListener("click", () => tryBuyUpgrade("u26"));
  if (buyU27Btn) buyU27Btn.addEventListener("click", () => tryBuyUpgrade("u27"));
  if (buyU29Btn) buyU29Btn.addEventListener("click", () => tryBuyUpgrade("u29"));
  if (buyU30Btn) buyU30Btn.addEventListener("click", () => tryBuyUpgrade("u30"));
  if (buyU31Btn) buyU31Btn.addEventListener("click", () => tryBuyUpgrade("u31"));

  // Auto-invest toggle event listener
  if (autoInvestToggle) {
    autoInvestToggle.addEventListener("change", handleAutoInvestToggle);
  }
  
  // Tour event listeners
  const tourCloseBtn = document.getElementById('tourClose');
  
  if (tourCloseBtn) {
    tourCloseBtn.addEventListener('click', endTour);
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

  // Game loop (100 ms): compounding and leaderboard
  const TICK_MS = 100;
  const BASE_COMPOUND_MULTIPLIER_PER_TICK = 1.0008; // base multiply every 100ms 1.0008
  function getCompoundMultiplierPerTick() {
    let rateBoost = 1;
    if (owned.u4) rateBoost *= 1.2; // +20%
    if (owned.u8) rateBoost *= 1.15; // +15%
    if (owned.u9) rateBoost *= 1.15; // +15%
    if (owned.u19) rateBoost *= 1.15; // +15%
    if (owned.u20) rateBoost *= 1.15; // +15%
    if (owned.u22) rateBoost *= 1.15; // +15%
    if (owned.u25) rateBoost *= 1.2; // +20%
    if (owned.u31) rateBoost *= 1.1; // +10%
    return 1 + (BASE_COMPOUND_MULTIPLIER_PER_TICK - 1) * rateBoost * prestigeInterestMultiplier;
  }

  // Check if any upgrades are available and update indicator
  function updateUpgradeIndicator() {
    const indicator = document.getElementById('upgradeIndicator');
    if (!indicator) return;
    
    // Check if any upgrade is affordable using only current account balance
    const hasAffordableUpgrade = Object.entries(UPGRADE_COSTS).some(([upgradeId, cost]) => {
      return !owned[upgradeId] && currentAccountBalance >= cost;
    });
    
    if (hasAffordableUpgrade) {
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
      const aCost = UPGRADE_COSTS[aId] ?? Number.MAX_SAFE_INTEGER;
      const bCost = UPGRADE_COSTS[bId] ?? Number.MAX_SAFE_INTEGER;
      return aCost - bCost;
    });
    rows.forEach((row) => scrollableContent.appendChild(row));

    const hideCompleted = container.classList.contains('hide-completed');
    if (hideCompleted) {
      // Show the next 3 unowned upgrades, but only one education upgrade at a time
      const unownedUpgrades = rows.filter((row) => {
        const id = row.getAttribute('data-upgrade-id');
        return !owned[id];
      });
      
      // Define education upgrade IDs
      const educationUpgrades = ['u1', 'u2', 'u3', 'u5', 'u6', 'u7'];
      
      // Separate education and non-education upgrades
      const unownedEducation = unownedUpgrades.filter((row) => {
        const id = row.getAttribute('data-upgrade-id');
        return educationUpgrades.includes(id);
      });
      
      const unownedNonEducation = unownedUpgrades.filter((row) => {
        const id = row.getAttribute('data-upgrade-id');
        return !educationUpgrades.includes(id);
      });
      
      // Take the first education upgrade (if any) and first 2 non-education upgrades
      const nextThreeUpgrades = [];
      
      // Add the first education upgrade if available
      if (unownedEducation.length > 0) {
        nextThreeUpgrades.push(unownedEducation[0]);
      }
      
      // Add up to 2 non-education upgrades to fill remaining slots
      const remainingSlots = 3 - nextThreeUpgrades.length;
      nextThreeUpgrades.push(...unownedNonEducation.slice(0, remainingSlots));
      
      rows.forEach((row) => {
        if (nextThreeUpgrades.includes(row)) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
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
  const BASE_DIVIDEND_RATE = 0.01;
  let dividendElapsed = 0;

  function tickDividends(deltaMs) {
    if (!owned.u10) return;
    dividendElapsed += deltaMs;
    
    // Calculate speed multipliers (stack multiplicatively)
    let speedMultiplier = 1;
    if (owned.u12) speedMultiplier *= 0.8; // 20% faster
    if (owned.u15) speedMultiplier *= 0.8; // 20% faster
    if (owned.u16) speedMultiplier *= 0.8; // 20% faster
    if (owned.u18) speedMultiplier *= 0.8; // 20% faster
    if (owned.u21) speedMultiplier *= 0.8; // 20% faster
    if (owned.u23) speedMultiplier *= 0.5; // 50% faster
    
    // Calculate rate multipliers (stack multiplicatively)
    let rateMultiplier = 1;
    if (owned.u13) rateMultiplier *= 1.25; // 25% more
    if (owned.u14) rateMultiplier *= 1.2;  // 20% more
    if (owned.u17) rateMultiplier *= 1.25; // 25% more
    if (owned.u24) rateMultiplier *= 1.5;  // 50% more
    
    const interval = Math.floor(BASE_DIVIDEND_INTERVAL_MS * speedMultiplier);
    const rate = BASE_DIVIDEND_RATE * rateMultiplier;
    
    if (dividendElapsed >= interval) {
      dividendElapsed -= interval;
      const payout = Math.floor(investmentAccountBalance * rate * 100) / 100;
      if (payout > 0) {
        const cappedPayout = applyMoneyCap(payout);
        
        // Track total dividends received for achievement
        totalDividendsReceived += cappedPayout;
        
        if (autoInvestEnabled) {
          // Auto-invest: add dividends to investment account
          investmentAccountBalance += cappedPayout;
        } else {
          // Normal: add dividends to current account
          currentAccountBalance += cappedPayout;
        }
        
      }
    }
  }


  function renderDividendUI(deltaMs) {
    if (!dividendInfo) return;
    dividendInfo.classList.toggle('hidden', !owned.u10);
    if (dividendPie && owned.u10) {
      // Calculate speed multipliers (same as tickDividends)
      let speedMultiplier = 1;
      if (owned.u12) speedMultiplier *= 0.8;
      if (owned.u15) speedMultiplier *= 0.8;
      if (owned.u16) speedMultiplier *= 0.8;
      if (owned.u18) speedMultiplier *= 0.8;
      if (owned.u21) speedMultiplier *= 0.8;
      if (owned.u23) speedMultiplier *= 0.5;
      
      const interval = Math.floor(BASE_DIVIDEND_INTERVAL_MS * speedMultiplier);
      const percent = (dividendElapsed % interval) / interval;
      const dashOffset = 100 - percent * 100;
      const fg = dividendPie.querySelector('.fg');
      if (fg) fg.setAttribute('stroke-dashoffset', String(dashOffset));
    }

    // Update dividend rate display with actual values
    const rateEl = document.getElementById('dividendRate');
    if (rateEl && owned.u10) {
      // Calculate multipliers (same as tickDividends)
      let speedMultiplier = 1;
      if (owned.u12) speedMultiplier *= 0.8;
      if (owned.u15) speedMultiplier *= 0.8;
      if (owned.u16) speedMultiplier *= 0.8;
      if (owned.u18) speedMultiplier *= 0.8;
      if (owned.u21) speedMultiplier *= 0.8;
      if (owned.u23) speedMultiplier *= 0.5;
      
      let rateMultiplier = 1;
      if (owned.u13) rateMultiplier *= 1.25;
      if (owned.u14) rateMultiplier *= 1.2;
      if (owned.u17) rateMultiplier *= 1.25;
      if (owned.u24) rateMultiplier *= 1.5;
      
      const interval = Math.floor(BASE_DIVIDEND_INTERVAL_MS * speedMultiplier);
      const rate = BASE_DIVIDEND_RATE * rateMultiplier;
      const intervalSeconds = Math.round(interval / 1000);
      const ratePercent = (rate * 100).toFixed(2);
      rateEl.textContent = `Dividends: ${ratePercent}%/${intervalSeconds}s`;
    }
  }

  function renderInvestmentUnlocked() {
    if (!investSection) return;
    investSection.classList.toggle('hidden', !owned.u11);
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
      prestigeMultiplierEl.textContent = `Multiplier: ${displayMultiplier.toFixed(2)}x`;
    }
  }

  function renderAutoInvestSection() {
    if (!autoInvestSection) return;
    autoInvestSection.classList.toggle('hidden', !owned.u27);
  }

  function updateProgressBars() {
    // Update progress for all upgrades that have progress bars
    Object.keys(UPGRADE_COSTS).forEach(upgradeId => {
      if (owned[upgradeId]) return; // Skip if already owned
      
      const cost = UPGRADE_COSTS[upgradeId];
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

  // Leaderboard model
  const WORLD_POPULATION = 8200000000; // 8.2B starting rank
  const RICH_LIST_TOP = 1; // rank upper bound
  const WEALTH_FOR_TOP_100 = 10000000000000; // 10T ~ top rank scale

  function computeRank(totalWealth) {
    // Simple model: map wealth logarithmically to rank improvement
    if (totalWealth <= 0) return WORLD_POPULATION;
    const logBase = 10;
    const scaled = Math.log10(1 + totalWealth) / Math.log10(1 + WEALTH_FOR_TOP_100);
    const rankGain = Math.floor((WORLD_POPULATION - RICH_LIST_TOP) * Math.min(1, scaled));
    return Math.max(RICH_LIST_TOP, WORLD_POPULATION - rankGain);
  }

  function renderRank() {
    const totalWealth = currentAccountBalance + investmentAccountBalance;
    const rank = computeRank(totalWealth);
    if (rankDisplay) rankDisplay.textContent = new Intl.NumberFormat("en-US").format(rank);
  }

  setInterval(() => {
    // Investment compounding: multiply per tick, boosted by upgrades
    if (investmentAccountBalance > 0) {
      const grown = investmentAccountBalance * getCompoundMultiplierPerTick();
      const growth = grown - investmentAccountBalance;
      const cappedGrowth = applyMoneyCap(growth);
      investmentAccountBalance = Math.round((investmentAccountBalance + cappedGrowth) * 100) / 100;
    }

    // Dividends
    tickDividends(TICK_MS);

    renderBalances();
    renderUpgradesOwned();
    renderRank();
    renderDividendUI(TICK_MS);
    renderInvestmentUnlocked();
    renderPrestigeMultipliers();
    renderAutoInvestSection();
    renderClickStreak();
    checkStreakTimeout();
    updateUpgradeIndicator();
    updateProgressBars();
    checkAchievementsOptimized(); // Use optimized version (every 5 seconds)
    renderStatistics();
    renderStickFigure();
    
    // Update wealth visualization
    renderWealthVisualization();
    
    // Check tour triggers
    checkTourTriggers();
    
    // Check portfolio tour (independent)
    checkPortfolioTour();
  }, TICK_MS);

  // Initialize upgrade visibility state before rendering
  initUpgradeVisibility();
  
  renderBalances();
  renderUpgradesOwned();
  renderRank();
  renderUpgradePrices();
  // Apply upgrade visibility rules now that hide-completed class is set
  sortUpgradesByCost();
  renderInvestmentUnlocked();
  renderPrestigeMultipliers();
  renderAutoInvestSection();
  renderClickStreak();
  updateProgressBars();
  renderAchievements();
  renderStatistics();
  renderStickFigure();
  updateUpgradeIndicator();
  
  // Settings panel functionality
  const settingsToggle = document.getElementById('settingsToggle');
  const settingsMenu = document.getElementById('settingsMenu');
  const musicToggle = document.getElementById('musicToggle');
  const soundEffectsToggle = document.getElementById('soundEffectsToggle');

  // Auto Invest Help Modal functionality
  const autoInvestHelpBtn = document.getElementById('autoInvestHelpBtn');
  const autoInvestModal = document.getElementById('autoInvestModal');
  const autoInvestModalClose = document.getElementById('autoInvestModalClose');

  // Load audio settings from localStorage
  function loadAudioSettings() {
    const savedMusicEnabled = localStorage.getItem('musicEnabled');
    const savedSoundEffectsEnabled = localStorage.getItem('soundEffectsEnabled');
    
    if (savedMusicEnabled !== null) {
      musicEnabled = savedMusicEnabled === 'true';
      if (musicToggle) musicToggle.checked = musicEnabled;
    }
    
    if (savedSoundEffectsEnabled !== null) {
      soundEffectsEnabled = savedSoundEffectsEnabled === 'true';
      if (soundEffectsToggle) soundEffectsToggle.checked = soundEffectsEnabled;
    }
    
    // Apply music setting on load
    if (!musicEnabled && backgroundMusic) {
      backgroundMusic.pause();
    } else if (musicEnabled && backgroundMusic) {
      // If music should be enabled, try to start it
      startBackgroundMusic();
    }
  }

  // Save audio settings to localStorage
  function saveAudioSettings() {
    localStorage.setItem('musicEnabled', musicEnabled.toString());
    localStorage.setItem('soundEffectsEnabled', soundEffectsEnabled.toString());
  }

  // Apply audio settings to UI and audio
  function applyAudioSettings() {
    // Update toggle UI
    if (musicToggle) musicToggle.checked = musicEnabled;
    if (soundEffectsToggle) soundEffectsToggle.checked = soundEffectsEnabled;
    
    // Apply music setting
    if (!musicEnabled && backgroundMusic) {
      backgroundMusic.pause();
    } else if (musicEnabled && backgroundMusic) {
      // Try to start music if it should be enabled
      startBackgroundMusic();
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
      musicEnabled = e.target.checked;
      console.log('Music toggle changed to:', musicEnabled);
      saveAudioSettings();
      toggleBackgroundMusic();
    });
  }

  // Sound effects toggle functionality
  if (soundEffectsToggle) {
    soundEffectsToggle.addEventListener('change', (e) => {
      soundEffectsEnabled = e.target.checked;
      saveAudioSettings();
    });
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
      'stats': 4
    };
    
    let isScrolling = false;
    let scrollTimeout = null;
    
    navButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const panelName = button.getAttribute('data-panel');
        const panelIndex = panelMap[panelName];
        
        if (panelIndex !== undefined) {
          // Immediately update active button to prevent jittering
          navButtons.forEach(btn => btn.classList.remove('active'));
          button.classList.add('active');
          
          // Set scrolling flag to prevent scroll event from overriding
          isScrolling = true;
          
          // Scroll to panel
          const panelWidth = window.innerWidth - 32; // Account for padding
          panelsContainer.scrollTo({
            left: panelWidth * panelIndex,
            behavior: 'smooth'
          });
          
          // Clear scrolling flag after animation completes
          setTimeout(() => {
            isScrolling = false;
          }, 500); // Match the smooth scroll duration
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

// Handle app visibility changes (pause music when app goes to background)
function handleVisibilityChange() {
  if (document.hidden) {
    // App went to background - pause music
    if (backgroundMusic && !backgroundMusic.paused) {
      backgroundMusic.pause();
      console.log('Music paused - app went to background');
    }
  } else {
    // App came to foreground - resume music if it was enabled
    if (backgroundMusic && musicEnabled && backgroundMusic.paused) {
      backgroundMusic.play().catch((error) => {
        console.log('Could not resume music:', error);
      });
      console.log('Music resumed - app came to foreground');
    }
  }
}

// Add event listener for visibility changes
document.addEventListener('visibilitychange', handleVisibilityChange);

// Handle page focus/blur events as backup
window.addEventListener('blur', () => {
  if (backgroundMusic && !backgroundMusic.paused) {
    backgroundMusic.pause();
    console.log('Music paused - window lost focus');
  }
});

window.addEventListener('focus', () => {
  if (backgroundMusic && musicEnabled && backgroundMusic.paused) {
    backgroundMusic.play().catch((error) => {
      console.log('Could not resume music on focus:', error);
    });
    console.log('Music resumed - window gained focus');
  }
});

// Handle mobile app lifecycle events (for PWA)
document.addEventListener('pause', () => {
  if (backgroundMusic && !backgroundMusic.paused) {
    backgroundMusic.pause();
    console.log('Music paused - app paused (mobile)');
  }
});

document.addEventListener('resume', () => {
  if (backgroundMusic && musicEnabled && backgroundMusic.paused) {
    backgroundMusic.play().catch((error) => {
      console.log('Could not resume music on resume:', error);
    });
    console.log('Music resumed - app resumed (mobile)');
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

// Handle page unload (when user closes tab/app)
window.addEventListener('beforeunload', () => {
  if (backgroundMusic && !backgroundMusic.paused) {
    backgroundMusic.pause();
    console.log('Music paused - app closing');
  }
});

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

  // Auto Invest Help Modal functionality
  if (autoInvestHelpBtn && autoInvestModal) {
    autoInvestHelpBtn.addEventListener('click', (e) => {
      e.stopPropagation();
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

  // Close modal with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && autoInvestModal && !autoInvestModal.classList.contains('hidden')) {
      autoInvestModal.classList.add('hidden');
    }
  });

  // Initialize audio on first user interaction
  initAudio();
  
  // Initialize background music immediately when page loads
  initBackgroundMusic();
  
  // Initialize upgrade visibility state (will be called after DOM is ready)
  function initUpgradeVisibility() {
    const upgradesSection = document.getElementById('upgradesSection');
    if (upgradesSection) {
      // Default: hide completed upgrades
      upgradesSection.classList.add('hide-completed');
    }
  }
  
  // Load saved audio settings
  loadAudioSettings();
  
  // Load saved tour state (disabled - keeping for future use)
  // loadTourState();
  
  // Load saved game state
  const gameStateLoaded = loadGameState();
  
  // Try to start music after a short delay if it was enabled (fallback for autoplay restrictions)
  if (gameStateLoaded && musicEnabled) {
    setTimeout(() => {
      if (backgroundMusic && musicEnabled) {
        startBackgroundMusic();
      }
    }, 1000);
  }
  
  // Periodic saving every 10 seconds
  setInterval(() => {
    saveGameState();
  }, 10000);

  // Render interest per second from per-tick multiplier (dynamic)
  function renderInterestPerSecond() {
    if (!interestPerSecEl) return;
    const m = getCompoundMultiplierPerTick();
    const perSecondMultiplier = Math.pow(m, 1000 / TICK_MS);
    const percent = (perSecondMultiplier - 1) * 100;
    interestPerSecEl.textContent = percent.toFixed(2) + "%";
  }

  // Initialize interest per second display and set up periodic updates
  (function initInterestPerSecond() {
    if (!interestPerSecEl) return;
    const update = () => {
      renderInterestPerSecond();
    };
    update();
    // Recompute periodically to reflect upgrades
    setInterval(update, 500);
  })();

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

    // Only add scroll listener for visual indicators
    panelsContainer.addEventListener('scroll', updateScrollIndicators);
    updateScrollIndicators(); // Initial call
  })();
})();


