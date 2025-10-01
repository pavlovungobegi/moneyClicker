// MoneyClicker Game Configuration
// This file contains all configurable parameters for the game
// Modify these values to adjust game balance, performance, and behavior

const GAME_CONFIG = {
  // =============================================================================
  // PERFORMANCE & TIMING CONFIGURATION
  // =============================================================================
  
  // Game loop timing
  TICK_MS: 1000, // Main game loop interval in milliseconds
  
  // Animation performance
  ANIMATION: {
    TARGET_FPS: 60,
    FRAME_INTERVAL: 1000 / 60, // ~16.67ms for 60fps
    PARTICLE_REDUCTION_MOBILE: 0.5, // Reduce particles by 50% on mobile
  },
  
  // Cache and memory management
  CACHE: {
    NUMBER_FORMAT_CACHE_LIMIT: 250,
    SIGNIFICANT_CHANGE_THRESHOLD: 0.01, // 1% change threshold
    CLEANUP_INTERVAL: 15000, // Cache cleanup every 15 seconds
  },
  
  // Interval timings (in milliseconds)
  INTERVALS: {
    INVESTMENT_COMPOUNDING: 1000, // Investment compounding interval
    EVENTS_CHECK: 15000, // Event check interval
    GAME_SAVE: 15000, // Auto-save interval
    SUBMISSION_STATUS: 1000, // Leaderboard submission status check
    UPGRADE_UPDATE: 10000, // Upgrade display update interval
    ACHIEVEMENT_CHECK: 4000, // Achievement check interval
  },
  
  // =============================================================================
  // GAME DIFFICULTY CONFIGURATION
  // =============================================================================
  
  DIFFICULTY_MODES: {
    EASY: 'easy',
    NORMAL: 'normal',
    HARD: 'hard',
    EXTREME: 'extreme'
  },
  
  DEFAULT_DIFFICULTY: 'normal',
  
  // =============================================================================
  // MONEY & ECONOMICS CONFIGURATION
  // =============================================================================
  
  // Money cap system
  MONEY_CAP: {
    ENABLED: true,
    BASE_CAP: 1000000000000, // 1 trillion
    CAP_MULTIPLIER: 1.1, // 10% increase per cap reached
  },
  
  // Buy multiplier system
  BUY_MULTIPLIERS: [1, 10, 25, 'MAX'],
  
  // =============================================================================
  // PROPERTY CONFIGURATION
  // =============================================================================
  
  PROPERTY_CONFIG: {
    foodStand: {
      name: "Food Stand",
      baseCost: 400,
      incomePerSecond: 13,
      priceMultiplier: 1.075,
      icon: "fas fa-utensils"
    },
    newsstand: {
      name: "Newsstand",
      baseCost: 8000,
      incomePerSecond: 100,
      priceMultiplier: 1.075,
      icon: "fas fa-newspaper"
    },
    parkingGarage: {
      name: "Parking Garage",
      baseCost: 30000,
      incomePerSecond: 200,
      priceMultiplier: 1.075,
      icon: "fas fa-car"
    },
    convenienceStore: {
      name: "Convenience Store",
      baseCost: 150000,
      incomePerSecond: 1250,
      priceMultiplier: 1.075,
      icon: "fas fa-store"
    },
    apartment: {
      name: "Apartment",
      baseCost: 500000,
      incomePerSecond: 4000,
      priceMultiplier: 1.075,
      icon: "fas fa-home"
    },
    manufacturingPlant: {
      name: "Manufacturing Plant",
      baseCost: 2500000,
      incomePerSecond: 18000,
      priceMultiplier: 1.075,
      icon: "fas fa-industry"
    },
    officeBuilding: {
      name: "Office Building",
      baseCost: 10000000,
      incomePerSecond: 55000,
      priceMultiplier: 1.075,
      icon: "fas fa-building"
    },
    skyscraper: {
      name: "Skyscraper",
      baseCost: 50000000,
      incomePerSecond: 175000,
      priceMultiplier: 1.075,
      icon: "fas fa-city"
    },
    operaHouse: {
      name: "Opera House",
      baseCost: 500000000,
      incomePerSecond: 1500000,
      priceMultiplier: 1.075,
      icon: "fas fa-theater-masks"
    }
  },
  
  // =============================================================================
  // UPGRADE CONFIGURATION
  // =============================================================================
  
  UPGRADE_CONFIG: {
    u1: { 
      cost: 10, 
      name: "Finish elementary school", 
      effect: "Adds +1 euro per click", 
      type: "click", 
      effects: { click_income: 1 } 
    },
    u3: { 
      cost: 50, 
      name: "Finish high school", 
      effect: "Adds +6 euros per click", 
      type: "click", 
      effects: { click_income: 6 } 
    },
    u4: { 
      cost: 250, 
      name: "Finish college", 
      effect: "Adds +30 euros per click", 
      type: "click", 
      effects: { click_income: 30 } 
    },
    u5: { 
      cost: 1250, 
      name: "Get a PhD", 
      effect: "Adds +150 euros per click", 
      type: "click", 
      effects: { click_income: 150 } 
    },
    u6: { 
      cost: 6250, 
      name: "Become a professor", 
      effect: "Adds +750 euros per click", 
      type: "click", 
      effects: { click_income: 750 } 
    },
    u7: { 
      cost: 31250, 
      name: "Win Nobel Prize", 
      effect: "Adds +3750 euros per click", 
      type: "click", 
      effects: { click_income: 3750 } 
    },
    u8: { 
      cost: 156250, 
      name: "Start a company", 
      effect: "Adds +18750 euros per click", 
      type: "click", 
      effects: { click_income: 18750 } 
    },
    u9: { 
      cost: 781250, 
      name: "Go public", 
      effect: "Adds +93750 euros per click", 
      type: "click", 
      effects: { click_income: 93750 } 
    },
    u10: { 
      cost: 3906250, 
      name: "Become a billionaire", 
      effect: "Adds +468750 euros per click", 
      type: "click", 
      effects: { click_income: 468750 } 
    },
    u11: { 
      cost: 19531250, 
      name: "Build a space company", 
      effect: "Adds +2343750 euros per click", 
      type: "click", 
      effects: { click_income: 2343750 } 
    },
    u12: { 
      cost: 97656250, 
      name: "Colonize Mars", 
      effect: "Adds +11718750 euros per click", 
      type: "click", 
      effects: { click_income: 11718750 } 
    },
    u13: { 
      cost: 488281250, 
      name: "Achieve immortality", 
      effect: "Adds +58593750 euros per click", 
      type: "click", 
      effects: { click_income: 58593750 } 
    },
    u14: { 
      cost: 2441406250, 
      name: "Become a god", 
      effect: "Adds +292968750 euros per click", 
      type: "click", 
      effects: { click_income: 292968750 } 
    },
    u15: { 
      cost: 12207031250, 
      name: "Create a universe", 
      effect: "Adds +1464843750 euros per click", 
      type: "click", 
      effects: { click_income: 1464843750 } 
    },
    u16: { 
      cost: 61035156250, 
      name: "Transcend reality", 
      effect: "Adds +7324218750 euros per click", 
      type: "click", 
      effects: { click_income: 7324218750 } 
    },
    u17: { 
      cost: 305175781250, 
      name: "Become the universe", 
      effect: "Adds +36621093750 euros per click", 
      type: "click", 
      effects: { click_income: 36621093750 } 
    },
    u18: { 
      cost: 1525878906250, 
      name: "Achieve omnipotence", 
      effect: "Adds +183105468750 euros per click", 
      type: "click", 
      effects: { click_income: 183105468750 } 
    },
    u19: { 
      cost: 7629394531250, 
      name: "Become everything", 
      effect: "Adds +915527343750 euros per click", 
      type: "click", 
      effects: { click_income: 915527343750 } 
    },
    u20: { 
      cost: 38146972656250, 
      name: "Transcend existence", 
      effect: "Adds +4577636718750 euros per click", 
      type: "click", 
      effects: { click_income: 4577636718750 } 
    },
    u21: { 
      cost: 190734863281250, 
      name: "Become nothing", 
      effect: "Adds +22888183593750 euros per click", 
      type: "click", 
      effects: { click_income: 22888183593750 } 
    },
    u22: { 
      cost: 953674316406250, 
      name: "Achieve perfect balance", 
      effect: "Adds +114440917968750 euros per click", 
      type: "click", 
      effects: { click_income: 114440917968750 } 
    },
    u23: { 
      cost: 4768371582031250, 
      name: "Become the void", 
      effect: "Adds +572204589843750 euros per click", 
      type: "click", 
      effects: { click_income: 572204589843750 } 
    },
    u24: { 
      cost: 23841857910156250, 
      name: "Transcend the void", 
      effect: "Adds +2861022949218750 euros per click", 
      type: "click", 
      effects: { click_income: 2861022949218750 } 
    },
    u25: { 
      cost: 119209289550781250, 
      name: "Become infinite", 
      effect: "Adds +14305114746093750 euros per click", 
      type: "click", 
      effects: { click_income: 14305114746093750 } 
    },
    u26: { 
      cost: 596046447753906250, 
      name: "Transcend infinity", 
      effect: "Adds +71525573730468750 euros per click", 
      type: "click", 
      effects: { click_income: 71525573730468750 } 
    },
    u27: { 
      cost: 2980232238769531250, 
      name: "Become eternal", 
      effect: "Adds +357627868652343750 euros per click", 
      type: "click", 
      effects: { click_income: 357627868652343750 } 
    },
    u28: { 
      cost: 14901161193847656250, 
      name: "Transcend eternity", 
      effect: "Adds +1788139343261718750 euros per click", 
      type: "click", 
      effects: { click_income: 1788139343261718750 } 
    },
    u29: { 
      cost: 74505805969238281250, 
      name: "Become absolute", 
      effect: "Adds +8940696716308593750 euros per click", 
      type: "click", 
      effects: { click_income: 8940696716308593750 } 
    },
    u30: { 
      cost: 372529029846191406250, 
      name: "Transcend the absolute", 
      effect: "Adds +44703483581542968750 euros per click", 
      type: "click", 
      effects: { click_income: 44703483581542968750 } 
    },
    u31: { 
      cost: 1862645149230957031250, 
      name: "Become the source", 
      effect: "Adds +223517417907714843750 euros per click", 
      type: "click", 
      effects: { click_income: 223517417907714843750 } 
    },
    u32: { 
      cost: 9313225746154785156250, 
      name: "Transcend the source", 
      effect: "Adds +1117587089538574218750 euros per click", 
      type: "click", 
      effects: { click_income: 1117587089538574218750 } 
    }
  },
  
  // =============================================================================
  // ACHIEVEMENT CONFIGURATION
  // =============================================================================
  
  ACHIEVEMENT_CONFIG: {
    ach1: { 
      name: "First Steps", 
      description: "Click 100 times", 
      condition: "clicks >= 100",
      reward: "Unlocks first property",
      icon: "👶"
    },
    ach2: { 
      name: "Getting Started", 
      description: "Earn your first €1,000", 
      condition: "totalEarned >= 1000",
      reward: "Unlocks lemonade stand",
      icon: "💰"
    },
    ach3: { 
      name: "Property Owner", 
      description: "Buy your first property", 
      condition: "propertiesOwned >= 1",
      reward: "Unlocks hot dog stand",
      icon: "🏠"
    },
    ach4: { 
      name: "Business Owner", 
      description: "Own 10 properties", 
      condition: "propertiesOwned >= 10",
      reward: "Unlocks ice cream truck",
      icon: "🏢"
    },
    ach5: { 
      name: "Entrepreneur", 
      description: "Earn €10,000 total", 
      condition: "totalEarned >= 10000",
      reward: "Unlocks restaurant",
      icon: "💼"
    },
    ach6: { 
      name: "Millionaire", 
      description: "Earn €1,000,000 total", 
      condition: "totalEarned >= 1000000",
      reward: "Unlocks fast food chain",
      icon: "💎"
    },
    ach7: { 
      name: "Billionaire", 
      description: "Earn €1,000,000,000 total", 
      condition: "totalEarned >= 1000000000",
      reward: "Unlocks luxury restaurant",
      icon: "👑"
    },
    ach8: { 
      name: "Trillionaire", 
      description: "Earn €1,000,000,000,000 total", 
      condition: "totalEarned >= 1000000000000",
      reward: "Unlocks food empire",
      icon: "🌟"
    },
    ach9: { 
      name: "Click Master", 
      description: "Click 1,000 times", 
      condition: "clicks >= 1000",
      reward: "Unlocks first upgrade",
      icon: "👆"
    },
    ach10: { 
      name: "Click Legend", 
      description: "Click 10,000 times", 
      condition: "clicks >= 10000",
      reward: "Unlocks second upgrade",
      icon: "🤚"
    },
    ach11: { 
      name: "Click God", 
      description: "Click 100,000 times", 
      condition: "clicks >= 100000",
      reward: "Unlocks third upgrade",
      icon: "✋"
    },
    ach12: { 
      name: "Property Mogul", 
      description: "Own 100 properties", 
      condition: "propertiesOwned >= 100",
      reward: "Unlocks fourth upgrade",
      icon: "🏘️"
    },
    ach13: { 
      name: "Real Estate King", 
      description: "Own 1,000 properties", 
      condition: "propertiesOwned >= 1000",
      reward: "Unlocks fifth upgrade",
      icon: "🏰"
    },
    ach14: { 
      name: "Investment Guru", 
      description: "Invest €1,000,000", 
      condition: "totalInvested >= 1000000",
      reward: "Unlocks sixth upgrade",
      icon: "📈"
    },
    ach15: { 
      name: "Market Master", 
      description: "Invest €100,000,000", 
      condition: "totalInvested >= 100000000",
      reward: "Unlocks seventh upgrade",
      icon: "📊"
    },
    ach16: { 
      name: "Financial Wizard", 
      description: "Invest €10,000,000,000", 
      condition: "totalInvested >= 10000000000",
      reward: "Unlocks eighth upgrade",
      icon: "🧙‍♂️"
    },
    ach17: { 
      name: "Upgrade Collector", 
      description: "Buy 10 upgrades", 
      condition: "upgradesOwned >= 10",
      reward: "Unlocks ninth upgrade",
      icon: "🔧"
    },
    ach18: { 
      name: "Upgrade Master", 
      description: "Buy 20 upgrades", 
      condition: "upgradesOwned >= 20",
      reward: "Unlocks tenth upgrade",
      icon: "⚙️"
    },
    ach19: { 
      name: "Upgrade Legend", 
      description: "Buy all upgrades", 
      condition: "upgradesOwned >= 32",
      reward: "Unlocks all remaining upgrades",
      icon: "🏆"
    },
    ach20: { 
      name: "Event Survivor", 
      description: "Survive 10 events", 
      condition: "eventsSurvived >= 10",
      reward: "Unlocks event resistance",
      icon: "⚡"
    },
    ach21: { 
      name: "Event Master", 
      description: "Survive 50 events", 
      condition: "eventsSurvived >= 50",
      reward: "Unlocks event immunity",
      icon: "🛡️"
    },
    ach22: { 
      name: "Event Legend", 
      description: "Survive 100 events", 
      condition: "eventsSurvived >= 100",
      reward: "Unlocks event mastery",
      icon: "👑"
    },
    ach23: { 
      name: "Speed Demon", 
      description: "Click 1,000 times in 1 minute", 
      condition: "clicksPerMinute >= 1000",
      reward: "Unlocks speed boost",
      icon: "💨"
    },
    ach24: { 
      name: "Speed God", 
      description: "Click 10,000 times in 1 minute", 
      condition: "clicksPerMinute >= 10000",
      reward: "Unlocks speed mastery",
      icon: "⚡"
    },
    ach25: { 
      name: "Perfectionist", 
      description: "Achieve 100% efficiency", 
      condition: "efficiency >= 100",
      reward: "Unlocks perfection mode",
      icon: "✨"
    },
    ach26: { 
      name: "Time Master", 
      description: "Play for 24 hours", 
      condition: "playTime >= 86400000",
      reward: "Unlocks time mastery",
      icon: "⏰"
    },
    ach27: { 
      name: "Dedication", 
      description: "Play for 7 days", 
      condition: "playTime >= 604800000",
      reward: "Unlocks dedication mode",
      icon: "📅"
    },
    ach28: { 
      name: "Legendary Player", 
      description: "Play for 30 days", 
      condition: "playTime >= 2592000000",
      reward: "Unlocks legendary status",
      icon: "🏆"
    },
    ach29: { 
      name: "Ultimate Gamer", 
      description: "Play for 365 days", 
      condition: "playTime >= 31536000000",
      reward: "Unlocks ultimate status",
      icon: "🌟"
    },
    ach30: { 
      name: "Transcendent Being", 
      description: "Achieve all other achievements", 
      condition: "achievementsUnlocked >= 29",
      reward: "Unlocks transcendence",
      icon: "👼"
    }
  },
  
  // =============================================================================
  // EVENT SYSTEM CONFIGURATION
  // =============================================================================
  
  EVENT_CONFIG: {
    // Event probabilities (per check) - different for each difficulty
    probabilities: {
      marketBoom: {
        easy: 0.15,
        normal: 0.10,
        hard: 0.08,
        extreme: 0.05
      },
      marketCrash: {
        easy: 0.05,
        normal: 0.08,
        hard: 0.12,
        extreme: 0.18
      },
      flashSale: {
        easy: 0.12,
        normal: 0.10,
        hard: 0.08,
        extreme: 0.06
      },
      greatDepression: {
        easy: 0.02,
        normal: 0.05,
        hard: 0.08,
        extreme: 0.12
      },
      fastFingers: {
        easy: 0.20,
        normal: 0.15,
        hard: 0.10,
        extreme: 0.08
      },
      taxCollection: {
        easy: 0.03,
        normal: 0.05,
        hard: 0.08,
        extreme: 0.12
      },
      robbery: {
        easy: 0.02,
        normal: 0.04,
        hard: 0.06,
        extreme: 0.10
      },
      divorce: {
        easy: 0.01,
        normal: 0.02,
        hard: 0.04,
        extreme: 0.06
      },
      earthquake: {
        easy: 0.01,
        normal: 0.02,
        hard: 0.03,
        extreme: 0.05
      }
    },
    
    // Event durations (in milliseconds)
    durations: {
      marketBoom: 30000, // 30 seconds
      marketCrash: 45000, // 45 seconds
      flashSale: 30000, // 30 seconds
      greatDepression: 60000, // 60 seconds
      fastFingers: 15000, // 15 seconds
      earthquake: 30000 // 30 seconds
    },
    
    // Event cooldowns (in milliseconds)
    cooldowns: {
      marketBoom: {
        easy: 300000, // 5 minutes
        normal: 240000, // 4 minutes
        hard: 180000, // 3 minutes
        extreme: 120000 // 2 minutes
      },
      marketCrash: {
        easy: 600000, // 10 minutes
        normal: 480000, // 8 minutes
        hard: 360000, // 6 minutes
        extreme: 240000 // 4 minutes
      },
      flashSale: {
        easy: 300000, // 5 minutes
        normal: 240000, // 4 minutes
        hard: 180000, // 3 minutes
        extreme: 120000 // 2 minutes
      },
      greatDepression: {
        easy: 900000, // 15 minutes
        normal: 720000, // 12 minutes
        hard: 540000, // 9 minutes
        extreme: 360000 // 6 minutes
      },
      fastFingers: {
        easy: 180000, // 3 minutes
        normal: 150000, // 2.5 minutes
        hard: 120000, // 2 minutes
        extreme: 90000 // 1.5 minutes
      },
      taxCollection: {
        easy: 1200000, // 20 minutes
        normal: 900000, // 15 minutes
        hard: 600000, // 10 minutes
        extreme: 300000 // 5 minutes
      },
      robbery: {
        easy: 1800000, // 30 minutes
        normal: 1200000, // 20 minutes
        hard: 900000, // 15 minutes
        extreme: 600000 // 10 minutes
      },
      divorce: {
        easy: 3600000, // 60 minutes
        normal: 2700000, // 45 minutes
        hard: 1800000, // 30 minutes
        extreme: 1200000 // 20 minutes
      },
      earthquake: {
        easy: 2400000, // 40 minutes
        normal: 1800000, // 30 minutes
        hard: 1200000, // 20 minutes
        extreme: 900000 // 15 minutes
      }
    },
    
    // Net worth thresholds for events
    netWorthThresholds: {
      marketBoom: 10000,
      marketCrash: 50000,
      flashSale: 25000,
      greatDepression: 100000,
      fastFingers: 5000,
      taxCollection: 500000,
      robbery: 1000000,
      divorce: 5000000,
      earthquake: 2000000
    },
    
    // Event requirements (upgrades needed)
    requirements: {
      marketBoom: null,
      marketCrash: null,
      flashSale: null,
      greatDepression: null,
      fastFingers: null,
      taxCollection: null,
      robbery: null,
      divorce: null,
      earthquake: null
    },
    
    // Event cooldown tracking
    eventCooldowns: {
      marketBoom: 0,
      marketCrash: 0,
      flashSale: 0,
      greatDepression: 0,
      fastFingers: 0,
      taxCollection: 0,
      robbery: 0,
      divorce: 0,
      earthquake: 0
    }
  },
  
  // =============================================================================
  // PARTICLE SYSTEM CONFIGURATION
  // =============================================================================
  
  PARTICLE_CONFIG: {
    // Particle counts
    COIN_PARTICLES: {
      base: 1,
      max: 10,
      mobile_reduction: 0.5
    },
    SPARKLE_PARTICLES: {
      base: 1,
      max: 8,
      mobile_reduction: 0.5
    },
    UPGRADE_PARTICLES: {
      base: 3,
      max: 15,
      mobile_reduction: 0.5
    },
    CONFETTI_PARTICLES: {
      base: 5,
      max: 20,
      mobile_reduction: 0.5
    },
    MONEY_PARTICLES: {
      base: 2,
      max: 10,
      mobile_reduction: 0.5
    },
    FIREWORK_PARTICLES: {
      base: 8,
      max: 20,
      mobile_reduction: 0.5
    },
    GOLDEN_PARTICLES: {
      base: 3,
      max: 12,
      mobile_reduction: 0.5
    },
    MILESTONE_PARTICLES: {
      base: 5,
      max: 15,
      mobile_reduction: 0.5
    },
    RARE_PARTICLES: {
      base: 10,
      max: 30,
      mobile_reduction: 0.5
    },
    MONEY_LOSS_PARTICLES: {
      base: 3,
      max: 15,
      mobile_reduction: 0.5
    },
    FLASH_SALE_PARTICLES: {
      base: 5,
      max: 20,
      mobile_reduction: 0.5
    }
  },
  
  // =============================================================================
  // AUDIO CONFIGURATION
  // =============================================================================
  
  AUDIO_CONFIG: {
    BACKGROUND_MUSIC: {
      file: 'backround.mp3',
      volume: 0.05, // 5% volume
      loop: true
    },
    SOUND_EFFECTS: {
      enabled: true,
      volume: 0.3 // 30% volume
    }
  },
  
  // =============================================================================
  // UI CONFIGURATION
  // =============================================================================
  
  UI_CONFIG: {
    // Notification settings
    NOTIFICATIONS: {
      duration: 5000, // 5 seconds
      animation_duration: 300, // 300ms
      max_notifications: 3
    },
    
    // Tooltip settings
    TOOLTIPS: {
      delay: 500, // 500ms delay
      duration: 3000 // 3 seconds
    },
    
    // Animation settings
    ANIMATIONS: {
      shake_intensity: 10,
      shake_duration: 200,
      flash_duration: 100
    }
  },
  
  // =============================================================================
  // LEADERBOARD CONFIGURATION
  // =============================================================================
  
  LEADERBOARD_CONFIG: {
    FIREBASE_URL: 'https://moneyclicker-8a8b4-default-rtdb.europe-west1.firebasedb.app/',
    SUBMISSION_COOLDOWN: 60000, // 1 minute
    MAX_ENTRIES: 100,
    UPDATE_INTERVAL: 1000 // 1 second
  },
  
  // =============================================================================
  // SAVE SYSTEM CONFIGURATION
  // =============================================================================
  
  SAVE_CONFIG: {
    AUTO_SAVE_INTERVAL: 15000, // 15 seconds
    MANUAL_SAVE_KEY: 'moneyClickerSave',
    SETTINGS_KEY: 'moneyClickerSettings',
    BACKUP_KEY: 'moneyClickerBackup'
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GAME_CONFIG;
}
