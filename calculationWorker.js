// Web Worker for Heavy Calculations
// Offloads CPU-intensive calculations to a separate thread

// Listen for messages from main thread
self.onmessage = function(e) {
  const { type, data, id } = e.data;
  
  try {
    let result;
    
    switch (type) {
      case 'CALCULATE_PROPERTY_INCOME':
        result = calculatePropertyIncome(data);
        break;
        
      case 'CALCULATE_COMPOUND_INTEREST':
        result = calculateCompoundInterest(data);
        break;
        
      case 'CALCULATE_UPGRADE_EFFECTS':
        result = calculateUpgradeEffects(data);
        break;
        
      case 'CALCULATE_ACHIEVEMENT_PROGRESS':
        result = calculateAchievementProgress(data);
        break;
        
      case 'CALCULATE_TOTAL_NET_WORTH':
        result = calculateTotalNetWorth(data);
        break;
        
      default:
        throw new Error(`Unknown calculation type: ${type}`);
    }
    
    // Send result back to main thread
    self.postMessage({
      id,
      type,
      result,
      success: true
    });
    
  } catch (error) {
    // Send error back to main thread
    self.postMessage({
      id,
      type,
      error: error.message,
      success: false
    });
  }
};

// Property income calculation
function calculatePropertyIncome(data) {
  const { properties, owned, upgrades, prestigeInterestMultiplier = 1 } = data;
  let totalIncome = 0;
  
  for (const [propertyId, count] of Object.entries(properties)) {
    if (count > 0) {
      const propertyConfig = data.propertyConfigs[propertyId];
      if (propertyConfig) {
        let income = count * propertyConfig.incomePerSecond;
        
        // Apply upgrades
        for (const [upgradeId, upgradeConfig] of Object.entries(upgrades)) {
          if (owned[upgradeId] && upgradeConfig.effects) {
            if (upgradeConfig.effects.rent_income) {
              income *= (1 + upgradeConfig.effects.rent_income);
            }
            if (upgradeConfig.effects.property_rent_income && upgradeConfig.property === propertyId) {
              income *= (1 + upgradeConfig.effects.property_rent_income);
            }
          }
        }
        
        // Apply tier multiplier (including special multipliers for high-tier buildings)
        // Calculate tier using procedural system (simplified)
        const tier = Math.floor((count - 1) / 25) + 1;
        let tierMultiplier = Math.pow(2, tier); // 2^tier (1x, 2x, 4x, 8x)
        
        // Special multipliers for high-tier buildings - multiplicative
        if (count >= 600) {
          tierMultiplier *= 100; // Multiply existing tier multiplier by 100x (Galactic tier)
        } else if (count >= 500) {
          tierMultiplier *= 10; // Multiply existing tier multiplier by 10x (Cosmic tier)
        }
        
        income *= tierMultiplier;
        
        // Apply prestige multiplier to property income (twice for double effect)
        income *= prestigeInterestMultiplier * prestigeInterestMultiplier;
        
        totalIncome += income;
      }
    }
  }
  
  return Math.floor(totalIncome);
}

// Compound interest calculation
function calculateCompoundInterest(data) {
  const { principal, rate, time, frequency = 1 } = data;
  return principal * Math.pow(1 + (rate / frequency), frequency * time);
}

// Upgrade effects calculation
function calculateUpgradeEffects(data) {
  const { owned, upgrades } = data;
  const effects = {
    clickMultiplier: 1,
    rentMultiplier: 1,
    interestMultiplier: 1,
    propertyMultipliers: {}
  };
  
  for (const [upgradeId, upgradeConfig] of Object.entries(upgrades)) {
    if (owned[upgradeId] && upgradeConfig.effects) {
      if (upgradeConfig.effects.click_income) {
        effects.clickMultiplier += upgradeConfig.effects.click_income;
      }
      if (upgradeConfig.effects.rent_income) {
        effects.rentMultiplier *= (1 + upgradeConfig.effects.rent_income);
      }
      if (upgradeConfig.effects.interest_rate) {
        effects.interestMultiplier *= (1 + upgradeConfig.effects.interest_rate);
      }
      if (upgradeConfig.effects.property_rent_income && upgradeConfig.property) {
        if (!effects.propertyMultipliers[upgradeConfig.property]) {
          effects.propertyMultipliers[upgradeConfig.property] = 1;
        }
        effects.propertyMultipliers[upgradeConfig.property] *= (1 + upgradeConfig.effects.property_rent_income);
      }
    }
  }
  
  return effects;
}

// Achievement progress calculation
function calculateAchievementProgress(data) {
  const { achievements, gameState } = data;
  const progress = {};
  
  for (const [achievementId, achievementConfig] of Object.entries(achievements)) {
    if (!gameState.achievements[achievementId]) {
      let current = 0;
      let target = achievementConfig.target;
      
      switch (achievementConfig.type) {
        case 'total_money':
          current = gameState.currentAccountBalance + gameState.investmentAccountBalance;
          break;
        case 'properties_owned':
          current = Object.values(gameState.properties).reduce((sum, count) => sum + count, 0);
          break;
        case 'upgrades_purchased':
          current = Object.values(gameState.owned).filter(owned => owned).length;
          break;
        case 'clicks_made':
          current = gameState.totalClicks || 0;
          break;
        case 'time_played':
          current = gameState.totalPlayTime || 0;
          break;
      }
      
      progress[achievementId] = {
        current: Math.min(current, target),
        target,
        progress: Math.min(current / target, 1)
      };
    }
  }
  
  return progress;
}

// Total net worth calculation
function calculateTotalNetWorth(data) {
  const { currentAccountBalance, investmentAccountBalance, properties, propertyConfigs } = data;
  
  let propertyValue = 0;
  for (const [propertyId, count] of Object.entries(properties)) {
    if (count > 0) {
      const propertyConfig = propertyConfigs[propertyId];
      if (propertyConfig) {
        propertyValue += count * propertyConfig.cost;
      }
    }
  }
  
  return currentAccountBalance + investmentAccountBalance + propertyValue;
}
