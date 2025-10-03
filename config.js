// MoneyClicker Game Configuration
// This file contains all configurable parameters for the game
// Modify these values to adjust game balance, performance, and behavior

const GAME_CONFIG = {
  // =============================================================================
  // PERFORMANCE & TIMING CONFIGURATION
  // =============================================================================
  
  // Game loop timing
  TICK_MS: 1000, // Main game loop interval in milliseconds
  
  // Offline earnings configuration
  OFFLINE_EARNINGS: {
    MAX_OFFLINE_HOURS: 1, // Maximum hours to calculate offline earnings (prevents abuse)
    MIN_OFFLINE_MINUTES: 0.25, // Minimum minutes offline to show earnings popup (15 seconds)
    REDUCTION_FACTOR: 0.25, // Offline earnings are 10% of online earnings (1 minute online = 10 minutes offline)
  },
  
  // Animation performance
  ANIMATION: {
    TARGET_FPS: 60,
    FRAME_INTERVAL: 1000 / 60, // ~16.67ms for 60fps
    PARTICLE_REDUCTION_MOBILE: 0.3, // Reduce particles by 70% on mobile
    MOBILE_TARGET_FPS: 60, // Keep 60 FPS for smooth animations
    MOBILE_FRAME_INTERVAL: 1000 / 60, // ~16.67ms for 60fps on mobile
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
    EVENTS_CHECK: 10000, // Event check interval
    GAME_SAVE: 15000, // Auto-save interval
    SUBMISSION_STATUS: 1000, // Leaderboard submission status check
    UPGRADE_UPDATE: 5000, // Upgrade display update interval
    ACHIEVEMENT_CHECK: 4000, // Achievement check interval
  },
  
  // Mobile-specific intervals (slower for better performance)
  MOBILE_INTERVALS: {
    INVESTMENT_COMPOUNDING: 1000, // Slower compounding on mobile
    EVENTS_CHECK: 15000, // Less frequent event checks
    GAME_SAVE: 20000, // Less frequent saves
    SUBMISSION_STATUS: 10000, // Less frequent status checks
    UPGRADE_UPDATE: 8000, // Less frequent upgrade updates
    ACHIEVEMENT_CHECK: 6000, // Less frequent achievement checks
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
  
  // Mobile performance mode
  MOBILE_PERFORMANCE: {
    ENABLED: true, // Enable mobile performance optimizations
    REDUCE_ANIMATIONS: true, // Reduce CSS animations on mobile
    THROTTLE_FPS: true, // Throttle frame rate on mobile
    PAUSE_BACKGROUND: true, // Pause heavy operations when tab is hidden
    REDUCE_PARTICLES: true, // Significantly reduce particle effects
    SIMPLIFY_UI: false, // Keep UI complexity but optimize performance
  },
  
  // =============================================================================
  // MONEY & ECONOMICS CONFIGURATION
  // =============================================================================
  
  // Money cap system - REMOVED (no longer needed)
  
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
      priceMultiplier: 1.07,
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
      priceMultiplier: 1.074,
      icon: "fas fa-industry"
    },
    officeBuilding: {
      name: "Office Building",
      baseCost: 10000000,
      incomePerSecond: 55000,
      priceMultiplier: 1.073,
      icon: "fas fa-building"
    },
    skyscraper: {
      name: "Skyscraper",
      baseCost: 50000000,
      incomePerSecond: 175000,
      priceMultiplier: 1.072,
      icon: "fas fa-city"
    },
    operaHouse: {
      name: "Opera House",
      baseCost: 500000000,
      incomePerSecond: 1500000,
      priceMultiplier: 1.071,
      icon: "fas fa-theater-masks"
    }
  },
  
  // =============================================================================
  // UPGRADE CONFIGURATION
  // =============================================================================
  
  UPGRADE_CONFIG: {
    u1: { cost: 10, name: "Finish elementary school", effect: "Adds +1 euro per click", type: "click", effects: { click_income: 1 } },
    u3: { cost: 50, name: "Finish high school", effect: "Adds +6 euros per click", type: "click", effects: { click_income: 6 } },
    u4: { cost: 2500000, name: "Better credit score", effect: "Increases investment interest by 5%", type: "interest", requires: "u11", effects: { interest_rate: 0.05 } },
    u5: { cost: 200, name: "Higher Education", effect: "Adds +30 euros per click", type: "click", effects: { click_income: 30 } },
    u8: { cost: 50000000, name: "Create a network of influenced people", effect: "Increases investment interest by 5%", type: "interest", requires: "u11", effects: { interest_rate: 0.05 } },
    u10: { cost: 750000, name: "Dividends", effect: "Generate 0,15% dividend every 10 seconds", type: "dividend", requires: "u11" },
    u11: { cost: 500000, name: "Investment", effect: "Unlocks the investment account", type: "unlock" },
    u12: { cost: 1000000, name: "Turbo Dividends", effect: "Speed up dividends by 20%", type: "dividend_speed", requires: "u10", effects: { dividend_speed: 0.20 } },
    u13: { cost: 3000000, name: "Mega Dividends", effect: "Increase dividend rate by 20%", type: "dividend_rate", requires: "u10", effects: { dividend_rate: 0.20 } },
    u14: { cost: 15000000, name: "Premium Dividends", effect: "Increases dividend rate by 20%", type: "dividend_rate", requires: "u10", effects: { dividend_rate: 0.20 } },
    u17: { cost: 60000000, name: "Elite Dividends", effect: "Increases dividend rate by 25%", type: "dividend_rate", requires: "u10", effects: { dividend_rate: 0.25 } },
    u19: { cost: 10000000, name: "Prime Interest", effect: "Increases interest rate by 5%", type: "interest", requires: "u11", effects: { interest_rate: 0.05 } },
    u26: { cost: 1000000000000, name: "Prestige Reset", effect: "Reset everything for permanent +25% interest and click multipliers", type: "prestige" },
    u27: { cost: 3500000, name: "Automated Investments", effect: "Unlocks automatic investment of dividends into investment account", type: "unlock", requires: "u11" },
    u29: { cost: 1000, name: "Critical Hits", effect: "15% chance for 5x click revenue", type: "special" },
    u30: { cost: 3500, name: "Click Streak", effect: "Build click streaks for temporary multipliers (1x to 3x)", type: "special" },
    u31: { cost: 150000000, name: "Strong Credit Score", effect: "Increases interest rate by 5%", type: "interest", requires: "u11", effects: { interest_rate: 0.05 } },
    u32: { cost: 5000000, name: "Automated Rent Investment", effect: "Unlocks automatic investment of property income into investment account", type: "unlock" },
    u33: { cost: 50000, name: "Real Estate Connections", effect: "Reduces building purchase costs by 15%", type: "building_discount", effects: { building_discount: 0.15 } },
    u34: { cost: 750000, name: "Hire a contractor", effect: "Reduces building purchase costs by an additional 20%", type: "building_discount", effects: { building_discount: 0.20 } },
    u35: { cost: 100000000, name: "Property Management", effect: "Increases rent income from properties by 10%", type: "rent_boost", effects: { rent_income: 0.10 } },
    u36: { cost: 7500, name: "Market awareness", effect: "Reduces the prices of properties by 10%", type: "building_discount", effects: { building_discount: 0.10 } },
    u37: { cost: 6000000, name: "Rental Monopoly", effect: "Increases the rent collected from properties by 20%", type: "rent_boost", effects: { rent_income: 0.20 } },
    u38: { cost: 100000, name: "Cheesy Landlord", effect: "Increases the property rents by 5%", type: "rent_boost", effects: { rent_income: 0.05 } },
    u39: { cost: 20000000, name: "Government Connections", effect: "Reduces the building purchase costs by 25%", type: "property_discount", effects: { building_discount: 0.25 } },
    u40: { cost: 250000, name: "Zen Clicks", effect: "Adds +150 euros per click", type: "click", effects: { click_income: 150 } },
    u41: { cost: 1500000, name: "Clicker Kicker", effect: "Adds +400 euros per click", type: "click", effects: { click_income: 400 } },
    u42: { cost: 30000000, name: "Click Frenzy", effect: "Adds +15k euros per click", type: "click", effects: { click_income: 15000 } },
    u43: { cost: 250000000, name: "Just Clicking", effect: "Adds +150k euros per click", type: "click", effects: { click_income: 150000 } },
    u44: { cost: 1000000000, name: "OK! Clicker!", effect: "Adds +1m euros per click", type: "click", effects: { click_income: 1000000 } },
    u45: { cost: 75000000, name: "It Clicks!", effect: "Adds +50k euros per click", type: "click", effects: { click_income: 50000 } },
    u46: { cost: 50000000000, name: "It is just a click, bro!", effect: "Adds +25m euros per click", type: "click", effects: { click_income: 25000000 } },
    u47: { cost: 25000000000, name: "Property Pimp", effect: "Increases the rent collected from properties by 25%", type: "rent_boost", effects: { rent_income: 0.25 } },
    u48: { cost: 100000000000, name: "Oh Long Johnson!", effect: "Increases the rent collected from properties by 15%", type: "rent_boost", effects: { rent_income: 0.15 } },
    u49: { cost: 1000000, name: "Hot Dogs", effect: "Doubles the income of Food Stands", type: "property_rent_boost", effects: { property_rent_income: 1.0 }, property: "foodStand" },
    u50: { cost: 3000000, name: "Popular Magazines", effect: "Doubles the income of Newsstand", type: "property_rent_boost", effects: { property_rent_income: 1.0 }, property: "newsstand" },
    u51: { cost: 750000, name: "Clicking is Love!", effect: "Adds +250 euros per click", type: "click", effects: { click_income: 250 } },
    u52: { cost: 1000000, name: "Extended Streak", effect: "Increases maximum streak multiplier to 5x", type: "streak_boost", effects: { max_streak: 5 }, requires: "u30" },
    u53: { cost: 10000, name: "Swift Clicks!", effect: "Adds +40 euros per click", type: "click", effects: { click_income: 40 } },
    u54: { cost: 25000, name: "Click is ticking!", effect: "Adds +75 euros per click", type: "click", effects: { click_income: 75 } },
    u55: { cost: 10000000, name: "Automated Gates", effect: "Doubles the income of parking garages", type: "property_rent_boost", effects: { property_rent_income: 1.0 }, property: "parkingGarage" },
    u56: { cost: 50000000, name: "Self-scan checkouts", effect: "Doubles the income of convenience stores", type: "property_rent_boost", effects: { property_rent_income: 1.0 }, property: "convenienceStore" },
    u57: { cost: 250000000, name: "Renovations", effect: "Doubles the income of apartments", type: "property_rent_boost", effects: { property_rent_income: 1.0 }, property: "apartment" },
    u58: { cost: 1000000000, name: "Sustainable Production", effect: "Doubles the income of manufacturing plants", type: "property_rent_boost", effects: { property_rent_income: 1.0 }, property: "manufacturingPlant" },
    u59: { cost: 5000000000, name: "Open Office Spaces", effect: "Doubles the income of office buildings", type: "property_rent_boost", effects: { property_rent_income: 1.0 }, property: "officeBuilding" },
    u60: { cost: 25000000000, name: "Faster Elevators", effect: "Doubles the income of skyscrapers", type: "property_rent_boost", effects: { property_rent_income: 1.0 }, property: "skyscraper" },
    u61: { cost: 100000000000, name: "Cultural Hotspot", effect: "Doubles the income of opera houses", type: "property_rent_boost", effects: { property_rent_income: 1.0 }, property: "operaHouse" },
    // Late-game 12x income upgrades
    u62: { cost: 1000000000000, name: "Gourmet Revolution", effect: "12x the income of Food Stands", type: "property_rent_boost", effects: { property_rent_income: 11.0 }, property: "foodStand" },
    u63: { cost: 3000000000000, name: "Digital Media Empire", effect: "12x the income of Newsstands", type: "property_rent_boost", effects: { property_rent_income: 11.0 }, property: "newsstand" },
    u64: { cost: 9000000000000, name: "Smart Parking Network", effect: "12x the income of Parking Garages", type: "property_rent_boost", effects: { property_rent_income: 11.0 }, property: "parkingGarage" },
    u65: { cost: 27000000000000, name: "24/7 Mega Mart", effect: "12x the income of Convenience Stores", type: "property_rent_boost", effects: { property_rent_income: 11.0 }, property: "convenienceStore" },
    u66: { cost: 81000000000000, name: "Luxury Residences", effect: "12x the income of Apartments", type: "property_rent_boost", effects: { property_rent_income: 11.0 }, property: "apartment" },
    u67: { cost: 243000000000000, name: "AI Manufacturing", effect: "12x the income of Manufacturing Plants", type: "property_rent_boost", effects: { property_rent_income: 11.0 }, property: "manufacturingPlant" },
    u68: { cost: 729000000000000, name: "Corporate Headquarters", effect: "12x the income of Office Buildings", type: "property_rent_boost", effects: { property_rent_income: 11.0 }, property: "officeBuilding" },
    u69: { cost: 2187000000000000, name: "Vertical Metropolis", effect: "12x the income of Skyscrapers", type: "property_rent_boost", effects: { property_rent_income: 11.0 }, property: "skyscraper" },
    u70: { cost: 6561000000000000, name: "Grand Opera Dynasty", effect: "12x the income of Opera Houses", type: "property_rent_boost", effects: { property_rent_income: 11.0 }, property: "operaHouse" },
    // Second tier late-game 12x income upgrades
    u71: { cost: 75000000000000000, name: "Media Empire Expansion", effect: "12x the income of Newsstands", type: "property_rent_boost", effects: { property_rent_income: 11.0 }, property: "newsstand" },
    u72: { cost: 25000000000000000, name: "Gourmet Food Revolution", effect: "12x the income of Food Stands", type: "property_rent_boost", effects: { property_rent_income: 11.0 }, property: "foodStand" },
    u73: { cost: 225000000000000000, name: "Smart City Parking", effect: "12x the income of Parking Garages", type: "property_rent_boost", effects: { property_rent_income: 11.0 }, property: "parkingGarage" },
    u74: { cost: 675000000000000000, name: "Mega Retail Chains", effect: "12x the income of Convenience Stores", type: "property_rent_boost", effects: { property_rent_income: 11.0 }, property: "convenienceStore" },
    u75: { cost: 2025000000000000000, name: "Premium Living Spaces", effect: "12x the income of Apartments", type: "property_rent_boost", effects: { property_rent_income: 11.0 }, property: "apartment" },
    u76: { cost: 6075000000000000000, name: "Automated Production Lines", effect: "12x the income of Manufacturing Plants", type: "property_rent_boost", effects: { property_rent_income: 11.0 }, property: "manufacturingPlant" },
    u77: { cost: 18225000000000000000, name: "Global Corporate Centers", effect: "12x the income of Office Buildings", type: "property_rent_boost", effects: { property_rent_income: 11.0 }, property: "officeBuilding" },
    u78: { cost: 54675000000000000000, name: "Sky City Networks", effect: "12x the income of Skyscrapers", type: "property_rent_boost", effects: { property_rent_income: 11.0 }, property: "skyscraper" },
    u79: { cost: 164025000000000000000, name: "Cultural Capital Empire", effect: "12x the income of Opera Houses", type: "property_rent_boost", effects: { property_rent_income: 11.0 }, property: "operaHouse" },
    // Third tier late-game 20x income upgrades
    u80: { cost: 250000000000000000000, name: "Culinary Mastery Empire", effect: "20x the income of Food Stands", type: "property_rent_boost", effects: { property_rent_income: 19.0 }, property: "foodStand" },
    u81: { cost: 750000000000000000000, name: "Digital News Dominance", effect: "20x the income of Newsstands", type: "property_rent_boost", effects: { property_rent_income: 19.0 }, property: "newsstand" },
      u82: { cost: 2250000000000000000000, name: "Autonomous Parking Systems", effect: "20x the income of Parking Garages", type: "property_rent_boost", effects: { property_rent_income: 19.0 }, property: "parkingGarage" },
      u83: { cost: 6750000000000000000000, name: "Hypermarket Networks", effect: "20x the income of Convenience Stores", type: "property_rent_boost", effects: { property_rent_income: 19.0 }, property: "convenienceStore" },
      u84: { cost: 20250000000000000000000, name: "Elite Residential Complexes", effect: "20x the income of Apartments", type: "property_rent_boost", effects: { property_rent_income: 19.0 }, property: "apartment" },
      u85: { cost: 60750000000000000000000, name: "Quantum Manufacturing", effect: "20x the income of Manufacturing Plants", type: "property_rent_boost", effects: { property_rent_income: 19.0 }, property: "manufacturingPlant" },
      u86: { cost: 182250000000000000000000, name: "Interstellar Corporate Hubs", effect: "20x the income of Office Buildings", type: "property_rent_boost", effects: { property_rent_income: 19.0 }, property: "officeBuilding" },
      u87: { cost: 546750000000000000000000, name: "Dimensional Sky Cities", effect: "20x the income of Skyscrapers", type: "property_rent_boost", effects: { property_rent_income: 19.0 }, property: "skyscraper" },
    u88: { cost: 1640250000000000000000000, name: "Universal Arts Federation", effect: "20x the income of Opera Houses", type: "property_rent_boost", effects: { property_rent_income: 19.0 }, property: "operaHouse" },
    // Global property income doubling upgrades
    u89: { cost: 20000000000000000000000, name: "Property Dynasty", effect: "Triples all property incomes", type: "rent_boost", effects: { rent_income: 2.0 } },
    u90: { cost: 200000000000000000000000, name: "Property Dominion", effect: "Triples all property incomes", type: "rent_boost", effects: { rent_income: 2.0 } },
    u91: { cost: 2000000000000000000000000, name: "Universal Property Authority", effect: "Triples all property incomes", type: "rent_boost", effects: { rent_income: 2.0 } },
    u92: { cost: 1000000000000000000000, name: "Master Builder", effect: "Quadruples all property incomes", type: "building_discount", effects: { rent_income: 3.0 } },
    // Building-specific 20x income upgrades
    u93: { cost: 2000000000000000000000000, name: "Gourmet Empire", effect: "20x the income of Food Stands", type: "property_rent_boost", effects: { property_rent_income: 19.0 }, property: "foodStand" },
    u94: { cost: 3600000000000000000000000, name: "Media Conglomerate", effect: "20x the income of Newsstands", type: "property_rent_boost", effects: { property_rent_income: 19.0 }, property: "newsstand" },
    u95: { cost: 6480000000000000000000000, name: "Parking Dynasty", effect: "20x the income of Parking Garages", type: "property_rent_boost", effects: { property_rent_income: 19.0 }, property: "parkingGarage" },
    u96: { cost: 11664000000000000000000000, name: "Retail Monopoly", effect: "20x the income of Convenience Stores", type: "property_rent_boost", effects: { property_rent_income: 19.0 }, property: "convenienceStore" },
    u97: { cost: 20995200000000000000000000, name: "Housing Empire", effect: "20x the income of Apartments", type: "property_rent_boost", effects: { property_rent_income: 19.0 }, property: "apartment" },
    u98: { cost: 37791360000000000000000000, name: "Industrial Titan", effect: "20x the income of Manufacturing Plants", type: "property_rent_boost", effects: { property_rent_income: 19.0 }, property: "manufacturingPlant" },
    u99: { cost: 68024448000000000000000000, name: "Corporate Empire", effect: "20x the income of Office Buildings", type: "property_rent_boost", effects: { property_rent_income: 19.0 }, property: "officeBuilding" },
    u100: { cost: 122444006400000000000000000, name: "Sky City Dynasty", effect: "20x the income of Skyscrapers", type: "property_rent_boost", effects: { property_rent_income: 19.0 }, property: "skyscraper" },
    u101: { cost: 220399211520000000000000000, name: "Cultural Empire", effect: "20x the income of Opera Houses", type: "property_rent_boost", effects: { property_rent_income: 19.0 }, property: "operaHouse" },
    u102: { cost: 5000000000000, name: "It is just a click, bro!", effect: "Adds +25 billion euros per click", type: "click", effects: { click_income: 25000000000 } },
    // Building-specific 20x income upgrades (second tier)
    u103: { cost: 400000000000000000000000000, name: "Gourmet Dynasty", effect: "20x the income of Food Stands", type: "property_rent_boost", effects: { property_rent_income: 19.0 }, property: "foodStand" },
    u104: { cost: 720000000000000000000000000, name: "Media Empire", effect: "20x the income of Newsstands", type: "property_rent_boost", effects: { property_rent_income: 19.0 }, property: "newsstand" },
    u105: { cost: 1296000000000000000000000000, name: "Parking Empire", effect: "20x the income of Parking Garages", type: "property_rent_boost", effects: { property_rent_income: 19.0 }, property: "parkingGarage" },
    u106: { cost: 2332800000000000000000000000, name: "Retail Empire", effect: "20x the income of Convenience Stores", type: "property_rent_boost", effects: { property_rent_income: 19.0 }, property: "convenienceStore" },
    u107: { cost: 4199040000000000000000000000, name: "Housing Dynasty", effect: "20x the income of Apartments", type: "property_rent_boost", effects: { property_rent_income: 19.0 }, property: "apartment" },
    u108: { cost: 7558272000000000000000000000, name: "Industrial Empire", effect: "20x the income of Manufacturing Plants", type: "property_rent_boost", effects: { property_rent_income: 19.0 }, property: "manufacturingPlant" },
    u109: { cost: 13604889600000000000000000000, name: "Corporate Dynasty", effect: "20x the income of Office Buildings", type: "property_rent_boost", effects: { property_rent_income: 19.0 }, property: "officeBuilding" },
    u110: { cost: 24488801280000000000000000000, name: "Sky City Empire", effect: "20x the income of Skyscrapers", type: "property_rent_boost", effects: { property_rent_income: 19.0 }, property: "skyscraper" },
    u111: { cost: 44079842304000000000000000000, name: "Cultural Dynasty", effect: "20x the income of Opera Houses", type: "property_rent_boost", effects: { property_rent_income: 19.0 }, property: "operaHouse" },
  },
  
  // =============================================================================
  // ACHIEVEMENT CONFIGURATION
  // =============================================================================
  
  ACHIEVEMENT_CONFIG: {
    ach1: { 
      name: "First Steps", 
      description: "Earn your first €1,000", 
      icon: "💰" 
    },
    ach2: { 
      name: "Thousandaire", 
      description: "Reach €10,000 total wealth", 
      icon: "💎" 
    },
    ach3: { 
      name: "Millionaire", 
      description: "Reach €1,000,000 total wealth", 
      icon: "🏆" 
    },
    ach4: { 
      name: "Billionaire", 
      description: "Reach €1,000,000,000 total wealth", 
      icon: "👑" 
    },
    ach5: { 
      name: "Trillionaire", 
      description: "Reach €1,000,000,000,000 total wealth", 
      icon: "🚀" 
    },
    ach6: { 
      name: "Click Master", 
      description: "Click 1,000 times", 
      icon: "🎯" 
    },
    ach7: { 
      name: "Critical Hit", 
      description: "Get 100 critical hits", 
      icon: "⚡" 
    },
    ach8: { 
      name: "Streak Master", 
      description: "Reach maximum click streak (3.0x)", 
      icon: "🔥" 
    },
    ach9: { 
      name: "Educated", 
      description: "Complete Higher Education", 
      icon: "🎓" 
    },
    ach10: { 
      name: "Investor", 
      description: "Invest €100,000 in the investment account", 
      icon: "💼" 
    },
    ach11: { 
      name: "Dividend King", 
      description: "Receive €1,000,000 in dividends", 
      icon: "📈" 
    },
    ach13: { 
      name: "First Investment", 
      description: "Invest your first euro", 
      icon: "💳" 
    },
    ach14: { 
      name: "Property Pioneer", 
      description: "Buy your first property", 
      icon: "🏠" 
    },
    ach15: { 
      name: "Rent Rookie", 
      description: "Generate €1,000 per second in rent", 
      icon: "💰" 
    },
    ach16: { 
      name: "Rent Royalty", 
      description: "Generate €100,000 per second in rent", 
      icon: "👑" 
    },
    ach17: { 
      name: "Rent Empire", 
      description: "Generate €1,000,000 per second in rent", 
      icon: "🏰" 
    },
    ach18: { 
      name: "Rent Billionaire", 
      description: "Generate €1,000,000,000 per second in rent", 
      icon: "🌍" 
    }
  },
  
  // =============================================================================
  // EVENT SYSTEM CONFIGURATION
  // =============================================================================
  
  EVENT_CONFIG: {
    // Event probabilities (per check) - different for each difficulty
    probabilities: {
      marketBoom: {
        easy: 0.08,     // 7.5% chance (easier)
        normal: 0.065,  // 5.5% chance (original)
        hard: 0.04,     // 4% chance (harder)
        extreme: 0.005   // 2% chance (extreme)
      },
      marketCrash: {
        easy: 0.01,     // 2% chance (easier)
        normal: 0.02,   // 4% chance (original)
        hard: 0.06,     // 6% chance (harder)
        extreme: 0.08   // 8% chance (extreme)
      },
      flashSale: {
        easy: 0.05,     // 5% chance (easier)
        normal: 0.035,   // 3% chance (original)
        hard: 0.02,     // 2% chance (harder)
        extreme: 0.005   // 1% chance (extreme)
      },
      greatDepression: {
        easy: 0.005,    // 0.5% chance (easier)
        normal: 0.0025,   // 1% chance (original)
        hard: 0.015,    // 1.5% chance (harder)
        extreme: 0.05   // 2% chance (extreme)
      },
      fastFingers: {
        easy: 0.04,     // 4% chance (easier)
        normal: 0.025,   // 2% chance (original)
        hard: 0.01,     // 1% chance (harder)
        extreme: 0.005  // 0.5% chance (extreme)
      },
      taxCollection: {
        easy: 0.01,     // 1% chance (easier)
        normal: 0.01,   // 2% chance (original)
        hard: 0.03,     // 3% chance (harder)
        extreme: 0.08   // 4% chance (extreme)
      },
      robbery: {
        easy: 0.01,     // 1% chance (easier)
        normal: 0.01,   // 2% chance (original)
        hard: 0.03,     // 3% chance (harder)
        extreme: 0.08   // 4% chance (extreme)
      },
      divorce: {
        easy: 0.001,    // 0.5% chance (easier)
        normal: 0.0025,   // 1% chance (original)
        hard: 0.015,    // 1.5% chance (harder)
        extreme: 0.05   // 2% chance (extreme)
      },
      earthquake: {
        easy: 0.005,     // 1% chance (same for all difficulties)
        normal: 0.0025,   // 1% chance
        hard: 0.01,     // 1% chance
        extreme: 0.04   // 1% chance
      }
    },
    
    // Event durations (milliseconds)
    durations: {
      marketBoom: 30000,    // 30 seconds
      marketCrash: 30000,   // 30 seconds
      flashSale: 30000,     // 30 seconds
      greatDepression: 30000, // 30 seconds
      fastFingers: 15000,   // 15 seconds
      earthquake: 30000     // 30 seconds
    },
    
    // Event cooldowns (milliseconds) - different for each difficulty
    cooldowns: {
      marketBoom: {
        easy: 60000,      // 1.5 minutes (easier)
        normal: 60000,    // 1 minute (original)
        hard: 60000,      // 45 seconds (harder)
        extreme: 60000    // 30 seconds (extreme)
      },
      marketCrash: {
        easy: 90000,      // 1.5 minutes (easier)
        normal: 60000,    // 1 minute (original)
        hard: 45000,      // 45 seconds (harder)
        extreme: 30000    // 30 seconds (extreme)
      },
      flashSale: {
        easy: 60000,     // 4 minutes (easier)
        normal: 30000,   // 3 minutes (original)
        hard: 60000,     // 2 minutes (harder)
        extreme: 60000    // 1.5 minutes (extreme)
      },
      greatDepression: {
        easy: 90000,      // 1.5 minutes (easier)
        normal: 60000,    // 1 minute (original)
        hard: 45000,      // 45 seconds (harder)
        extreme: 30000    // 30 seconds (extreme)
      },
      fastFingers: {
        easy: 120000,      // 1.5 minutes (easier)
        normal: 120000,    // 1 minute (original)
        hard: 120000,      // 45 seconds (harder)
        extreme: 120000    // 30 seconds (extreme)
      },
      taxCollection: {
        easy: 120000,      // 1.5 minutes (easier)
        normal: 120000,    // 1 minute (original)
        hard: 45000,      // 45 seconds (harder)
        extreme: 30000    // 30 seconds (extreme)
      },
      robbery: {
        easy: 120000,      // 1.5 minutes (easier)
        normal: 120000,    // 1 minute (original)
        hard: 45000,      // 45 seconds (harder)
        extreme: 30000    // 30 seconds (extreme)
      },
      divorce: {
        easy: 900000,     // 2 minutes (easier)
        normal: 600000,    // 1.5 minutes (original)
        hard: 60000,      // 1 minute (harder)
        extreme: 30000    // 45 seconds (extreme)
      }
    },
    
    // Event-specific cooldowns
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
    },
    
    // Net worth thresholds (minimum net worth required for events to trigger)
    netWorthThresholds: {
      marketBoom: 500,        // No threshold
      marketCrash: 100000,       // No threshold
      flashSale: 1000,         // No threshold
      greatDepression: 2000000,   // No threshold
      fastFingers: 0,       // No threshold
      taxCollection: 250000,     // No threshold
      robbery: 150000,           // No threshold
      divorce: 1000000,     // 1 million euro threshold
      earthquake: 0         // No net worth threshold, but requires 100 properties
    },
    
    // Event requirements (upgrades that must be unlocked for events to trigger)
    requirements: {
      marketBoom: "u11",        // Investment must be unlocked
      marketCrash: "u11",       // Investment must be unlocked
      greatDepression: "u11",   // Investment must be unlocked
      taxCollection: "u11",     // Investment must be unlocked (affects investment account)
      robbery: null,            // No requirements
      flashSale: null,          // No requirements
      fastFingers: null,        // No requirements
      divorce: null,            // No requirements
      earthquake: null          // No upgrade requirements (100 property requirement handled separately)
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
    SUBMISSION_COOLDOWN: 180000, // 30 seconds
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
  },

  // =============================================================================
  // TIER CONFIGURATION
  // =============================================================================
  TIER_CONFIG: {
    // Default tier (0 buildings)
    default: {
      name: "Default",
      color: "#6b7280",
      bgColor: "rgba(107, 114, 128, 0.1)",
      borderColor: "rgba(107, 114, 128, 0.3)",
      buildingsRequired: 0
    },
    
    // All tiers in standard progression (every 25 buildings)
    standardTiers: [
      { name: "Bronze", color: "#cd7f32", bgColor: "rgba(205, 127, 50, 0.4)", borderColor: "rgba(205, 127, 50, 0.6)", buildingsRequired: 25 },
      { name: "Silver", color: "#c0c0c0", bgColor: "rgba(192, 192, 192, 0.4)", borderColor: "rgba(192, 192, 192, 0.6)", buildingsRequired: 50 },
      { name: "Gold", color: "#ffd700", bgColor: "rgba(255, 215, 0, 0.4)", borderColor: "rgba(255, 215, 0, 0.7)", buildingsRequired: 75 },
      { name: "Diamond", color: "#00bfff", bgColor: "rgba(0, 191, 255, 0.4)", borderColor: "rgba(0, 191, 255, 0.7)", buildingsRequired: 100 },
      { name: "Platinum", color: "#c0c0c0", bgColor: "rgba(192, 192, 192, 0.4)", borderColor: "rgba(192, 192, 192, 0.6)", buildingsRequired: 125 },
      { name: "Emerald", color: "#50c878", bgColor: "rgba(80, 200, 120, 0.4)", borderColor: "rgba(80, 200, 120, 0.6)", buildingsRequired: 150 },
      { name: "Ruby", color: "#e0115f", bgColor: "rgba(224, 17, 95, 0.4)", borderColor: "rgba(224, 17, 95, 0.6)", buildingsRequired: 175 },
      { name: "Sapphire", color: "#0f52ba", bgColor: "rgba(15, 82, 186, 0.4)", borderColor: "rgba(15, 82, 186, 0.6)", buildingsRequired: 200 },
      { name: "Mythic", color: "#8b5cf6", bgColor: "rgba(139, 92, 246, 0.4)", borderColor: "rgba(139, 92, 246, 0.6)", buildingsRequired: 225 },
      { name: "Legendary", color: "#f59e0b", bgColor: "rgba(245, 158, 11, 0.4)", borderColor: "rgba(245, 158, 11, 0.6)", buildingsRequired: 250 },
      { name: "Transcendent", color: "#ef4444", bgColor: "rgba(239, 68, 68, 0.4)", borderColor: "rgba(239, 68, 68, 0.6)", buildingsRequired: 275 },
      { name: "Divine", color: "#ff6b6b", bgColor: "rgba(255, 107, 107, 0.4)", borderColor: "rgba(255, 255, 255, 0.8)", buildingsRequired: 300 },
      { name: "Cosmic", color: "#ff00ff", bgColor: "rgba(255, 0, 255, 0.5)", borderColor: "rgba(255, 0, 255, 0.8)", buildingsRequired: 500 },
      { name: "Galactic", color: "#00ffff", bgColor: "rgba(0, 255, 255, 0.6)", borderColor: "rgba(0, 255, 255, 0.9)", buildingsRequired: 600 }
    ],
    
    // Configuration
    buildingsPerTier: 25
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GAME_CONFIG;
}
