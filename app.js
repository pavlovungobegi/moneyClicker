(() => {
  let currentAccountBalance = 0;
  let investmentAccountBalance = 0;

  // Mobile detection for particle optimization
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                   ('ontouchstart' in window) || 
                   (navigator.maxTouchPoints > 0);
  
  // Debug log for mobile detection
  console.log('Mobile device detected:', isMobile, 'User Agent:', navigator.userAgent);

  // Game difficulty system
  const DIFFICULTY_MODES = {
    EASY: 'easy',
    NORMAL: 'normal',
    HARD: 'hard',
    EXTREME: 'extreme'
  };
  
  let gameDifficulty = DIFFICULTY_MODES.NORMAL; // Default difficulty

  // Particle System
  class ParticleSystem {
    constructor() {
      this.canvas = document.getElementById('particleCanvas');
      this.ctx = this.canvas.getContext('2d');
      this.particles = [];
      this.particlePool = [];
      this.animationId = null;
      
      this.resizeCanvas();
      window.addEventListener('resize', () => this.resizeCanvas());
      this.startAnimation();
    }
    
    resizeCanvas() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }
    
    createParticle(type, x, y, options = {}) {
      let particle = this.particlePool.pop();
      if (!particle) {
        particle = {};
      }
      
      // Default properties
      particle.x = x;
      particle.y = y;
      particle.vx = (Math.random() - 0.5) * 4;
      particle.vy = -Math.random() * 3 - 1;
      particle.life = 1.0;
      particle.decay = 0.02;
      particle.size = 4;
      particle.type = type;
      particle.rotation = 0;
      particle.rotationSpeed = (Math.random() - 0.5) * 0.2;
      particle.gravity = 0.1;
      particle.bounce = 0.6;
      particle.color = '#FFD700';
      
      // Override with options
      Object.assign(particle, options);
      
      this.particles.push(particle);
    }
    
    createCoinParticles(x, y, count = 1) {
      // Reduce particles on mobile
      const actualCount = isMobile ? Math.max(1, Math.floor(count * 0.5)) : count;
      for (let i = 0; i < actualCount; i++) {
        this.createParticle('coin', x, y, {
          vx: (Math.random() - 0.5) * 6,
          vy: -Math.random() * 4 - 2,
          size: 6 + Math.random() * 4,
          color: '#FFD700',
          life: 1.5,
          decay: 0.015
        });
      }
    }
    
    createCriticalCoin(x, y) {
      // Create a single orange coin for critical hits
      this.createParticle('coin', x, y, {
        vx: (Math.random() - 0.5) * 2, // Less horizontal movement (more centered)
        vy: -Math.random() * 2 - 6, // More upward movement and higher
        size: 10 + Math.random() * 3, // Larger size (10-13px vs 8-10px)
        color: '#FF8C00', // Orange color
        life: 2.5, // Longer life for better visibility
        decay: 0.008 // Slower decay
      });
    }
    
    createSparkleParticles(x, y, count = 2) {
      // Reduce particles on mobile
      const actualCount = isMobile ? Math.max(1, Math.floor(count * 0.5)) : count;
      for (let i = 0; i < actualCount; i++) {
        this.createParticle('sparkle', x, y, {
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.5) * 8,
          size: 2 + Math.random() * 3,
          color: `hsl(${Math.random() * 60 + 30}, 100%, 70%)`,
          life: 0.8,
          decay: 0.03,
          gravity: 0.05
        });
      }
    }
    
    createUpgradeParticles(x, y, count = 5) {
      for (let i = 0; i < count; i++) {
        this.createParticle('upgrade', x, y, {
          vx: (Math.random() - 0.5) * 10,
          vy: -Math.random() * 6 - 2,
          size: 4 + Math.random() * 4,
          color: `hsl(${Math.random() * 120 + 200}, 80%, 60%)`,
          life: 1.2,
          decay: 0.02,
          gravity: 0.08,
          bounce: 0.4
        });
      }
    }
    
    createConfettiParticles(x, y, count = 8) {
      for (let i = 0; i < count; i++) {
        this.createParticle('confetti', x, y, {
          vx: (Math.random() - 0.5) * 12,
          vy: -Math.random() * 8 - 3,
          size: 3 + Math.random() * 3,
          color: `hsl(${Math.random() * 360}, 100%, 60%)`,
          life: 2.0,
          decay: 0.015,
          gravity: 0.12,
          bounce: 0.3,
          rotationSpeed: (Math.random() - 0.5) * 0.3
        });
      }
    }
    
    createMoneyGainParticles(x, y, amount) {
      const baseCount = Math.min(3, Math.max(2, Math.floor(amount / 2000)));
      const count = isMobile ? Math.max(1, Math.floor(baseCount * 0.5)) : baseCount;
      for (let i = 0; i < count; i++) {
        this.createParticle('money', x, y, {
          vx: (Math.random() - 0.5) * 6,
          vy: -Math.random() * 4 - 1,
          size: 5 + Math.random() * 3,
          color: '#00C851',
          life: 1.5,
          decay: 0.02,
          gravity: 0.1,
          bounce: 0.5
        });
      }
    }
    
    createFireworkParticles(x, y, count = 8) {
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const speed = 8 + Math.random() * 4;
        this.createParticle('firework', x, y, {
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 3 + Math.random() * 4,
          color: `hsl(${Math.random() * 60 + 30}, 100%, 60%)`,
          life: 2.0,
          decay: 0.02,
          gravity: 0.05,
          bounce: 0.2
        });
      }
    }
    
    createGoldenParticles(x, y, count = 10) {
      for (let i = 0; i < count; i++) {
        this.createParticle('golden', x, y, {
          vx: (Math.random() - 0.5) * 8,
          vy: -Math.random() * 6 - 2,
          size: 4 + Math.random() * 4,
          color: '#FFD700',
          life: 2.5,
          decay: 0.015,
          gravity: 0.08,
          bounce: 0.6,
          rotationSpeed: (Math.random() - 0.5) * 0.2
        });
      }
    }
    
    createMilestoneParticles(x, y, count = 15) {
      for (let i = 0; i < count; i++) {
        this.createParticle('milestone', x, y, {
          vx: (Math.random() - 0.5) * 12,
          vy: -Math.random() * 8 - 3,
          size: 2 + Math.random() * 3,
          color: `hsl(${Math.random() * 360}, 100%, 70%)`,
          life: 3.0,
          decay: 0.01,
          gravity: 0.06,
          bounce: 0.4,
          rotationSpeed: (Math.random() - 0.5) * 0.4
        });
      }
    }
    
    createRareAchievementParticles(x, y, count = 20) {
      // Create multiple bursts for rare achievements
      for (let burst = 0; burst < 3; burst++) {
        setTimeout(() => {
          for (let i = 0; i < count / 3; i++) {
            this.createParticle('rare', x, y, {
              vx: (Math.random() - 0.5) * 15,
              vy: -Math.random() * 10 - 5,
              size: 3 + Math.random() * 5,
              color: `hsl(${Math.random() * 60 + 280}, 100%, 60%)`,
              life: 2.5,
              decay: 0.018,
              gravity: 0.1,
              bounce: 0.3,
              rotationSpeed: (Math.random() - 0.5) * 0.3
            });
          }
        }, burst * 200);
      }
    }
    
    createMoneyLossParticles(x, y, amount) {
      const count = Math.min(Math.floor(amount / 1000) + 5, 20);
      for (let i = 0; i < count; i++) {
        this.createParticle('money-loss', x, y, {
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.5) * 6,
          size: 4 + Math.random() * 3,
          color: '#FF4444',
          life: 1.5,
          decay: 0.02,
          gravity: 0.1,
          bounce: 0.3,
          rotationSpeed: (Math.random() - 0.5) * 0.2
        });
      }
    }
    
    createFlashSaleParticles(x, y, count = 20) {
      for (let i = 0; i < count; i++) {
        this.createParticle('flash-sale', x, y, {
          vx: (Math.random() - 0.5) * 8,
          vy: -Math.random() * 6 - 2,
          size: 3 + Math.random() * 4,
          color: '#FF6B35',
          life: 2.0,
          decay: 0.015,
          gravity: 0.08,
          bounce: 0.4,
          rotationSpeed: (Math.random() - 0.5) * 0.3
        });
      }
    }
    
    updateParticles() {
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const particle = this.particles[i];
        
        // Update physics
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += particle.gravity;
        particle.rotation += particle.rotationSpeed;
        particle.life -= particle.decay;
        
        // Bounce off ground
        if (particle.y > window.innerHeight - particle.size && particle.vy > 0) {
          particle.y = window.innerHeight - particle.size;
          particle.vy *= -particle.bounce;
          particle.vx *= 0.8; // Friction
        }
        
        // Remove dead particles
        if (particle.life <= 0 || particle.x < -50 || particle.x > window.innerWidth + 50) {
          this.particles.splice(i, 1);
          this.particlePool.push(particle);
        }
      }
    }
    
    drawParticles() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      this.particles.forEach(particle => {
        this.ctx.save();
        this.ctx.globalAlpha = particle.life;
        this.ctx.translate(particle.x, particle.y);
        this.ctx.rotate(particle.rotation);
        
        if (particle.type === 'coin') {
          // Draw coin
          this.ctx.fillStyle = particle.color;
          this.ctx.beginPath();
          this.ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
          this.ctx.fill();
          
          // Coin highlight
          this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          this.ctx.beginPath();
          this.ctx.arc(-particle.size * 0.3, -particle.size * 0.3, particle.size * 0.3, 0, Math.PI * 2);
          this.ctx.fill();
        } else if (particle.type === 'sparkle') {
          // Draw sparkle
          this.ctx.fillStyle = particle.color;
          this.ctx.beginPath();
          this.ctx.moveTo(0, -particle.size);
          this.ctx.lineTo(particle.size * 0.3, -particle.size * 0.3);
          this.ctx.lineTo(particle.size, 0);
          this.ctx.lineTo(particle.size * 0.3, particle.size * 0.3);
          this.ctx.lineTo(0, particle.size);
          this.ctx.lineTo(-particle.size * 0.3, particle.size * 0.3);
          this.ctx.lineTo(-particle.size, 0);
          this.ctx.lineTo(-particle.size * 0.3, -particle.size * 0.3);
          this.ctx.closePath();
          this.ctx.fill();
        } else if (particle.type === 'upgrade') {
          // Draw upgrade particle (diamond shape)
          this.ctx.fillStyle = particle.color;
          this.ctx.beginPath();
          this.ctx.moveTo(0, -particle.size);
          this.ctx.lineTo(particle.size * 0.5, 0);
          this.ctx.lineTo(0, particle.size);
          this.ctx.lineTo(-particle.size * 0.5, 0);
          this.ctx.closePath();
          this.ctx.fill();
          
          // Upgrade highlight
          this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          this.ctx.beginPath();
          this.ctx.moveTo(0, -particle.size * 0.6);
          this.ctx.lineTo(particle.size * 0.3, 0);
          this.ctx.lineTo(0, particle.size * 0.6);
          this.ctx.lineTo(-particle.size * 0.3, 0);
          this.ctx.closePath();
          this.ctx.fill();
        } else if (particle.type === 'confetti') {
          // Draw confetti (rectangle)
          this.ctx.fillStyle = particle.color;
          this.ctx.fillRect(-particle.size * 0.3, -particle.size * 0.8, particle.size * 0.6, particle.size * 1.6);
        } else if (particle.type === 'money') {
          // Draw money particle (dollar sign)
          this.ctx.fillStyle = particle.color;
          this.ctx.beginPath();
          this.ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
          this.ctx.fill();
          
          // Dollar sign
          this.ctx.fillStyle = 'white';
          this.ctx.font = `bold ${particle.size}px Arial`;
          this.ctx.textAlign = 'center';
          this.ctx.textBaseline = 'middle';
          this.ctx.fillText('$', 0, 0);
        } else if (particle.type === 'firework') {
          // Draw firework particle (star burst)
          this.ctx.fillStyle = particle.color;
          this.ctx.beginPath();
          for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const x = Math.cos(angle) * particle.size;
            const y = Math.sin(angle) * particle.size;
            if (i === 0) {
              this.ctx.moveTo(x, y);
            } else {
              this.ctx.lineTo(x, y);
            }
          }
          this.ctx.closePath();
          this.ctx.fill();
        } else if (particle.type === 'golden') {
          // Draw golden particle (shining circle)
          this.ctx.fillStyle = particle.color;
          this.ctx.beginPath();
          this.ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
          this.ctx.fill();
          
          // Golden highlight
          this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          this.ctx.beginPath();
          this.ctx.arc(-particle.size * 0.3, -particle.size * 0.3, particle.size * 0.4, 0, Math.PI * 2);
          this.ctx.fill();
        } else if (particle.type === 'milestone') {
          // Draw milestone particle (hexagon)
          this.ctx.fillStyle = particle.color;
          this.ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const x = Math.cos(angle) * particle.size;
            const y = Math.sin(angle) * particle.size;
            if (i === 0) {
              this.ctx.moveTo(x, y);
            } else {
              this.ctx.lineTo(x, y);
            }
          }
          this.ctx.closePath();
          this.ctx.fill();
        } else if (particle.type === 'rare') {
          // Draw rare achievement particle (crown shape)
          this.ctx.fillStyle = particle.color;
          this.ctx.beginPath();
          this.ctx.moveTo(-particle.size, particle.size * 0.5);
          this.ctx.lineTo(-particle.size * 0.5, -particle.size * 0.5);
          this.ctx.lineTo(0, 0);
          this.ctx.lineTo(particle.size * 0.5, -particle.size * 0.5);
          this.ctx.lineTo(particle.size, particle.size * 0.5);
          this.ctx.lineTo(particle.size * 0.3, particle.size * 0.2);
          this.ctx.lineTo(-particle.size * 0.3, particle.size * 0.2);
          this.ctx.closePath();
          this.ctx.fill();
        } else if (particle.type === 'money-loss') {
          // Draw money loss particle (red X shape)
          this.ctx.strokeStyle = particle.color;
          this.ctx.lineWidth = 2;
          this.ctx.beginPath();
          this.ctx.moveTo(-particle.size, -particle.size);
          this.ctx.lineTo(particle.size, particle.size);
          this.ctx.moveTo(particle.size, -particle.size);
          this.ctx.lineTo(-particle.size, particle.size);
          this.ctx.stroke();
        } else if (particle.type === 'flash-sale') {
          // Draw flash sale particle (orange tag shape)
          this.ctx.fillStyle = particle.color;
          this.ctx.beginPath();
          this.ctx.moveTo(-particle.size, -particle.size * 0.5);
          this.ctx.lineTo(particle.size * 0.7, -particle.size * 0.5);
          this.ctx.lineTo(particle.size, 0);
          this.ctx.lineTo(particle.size * 0.7, particle.size * 0.5);
          this.ctx.lineTo(-particle.size, particle.size * 0.5);
          this.ctx.closePath();
          this.ctx.fill();
          
          // Add a small circle for the tag hole
          this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
          this.ctx.beginPath();
          this.ctx.arc(-particle.size * 0.3, 0, particle.size * 0.2, 0, Math.PI * 2);
          this.ctx.fill();
        }
        
        this.ctx.restore();
      });
    }
    
    animate() {
      this.updateParticles();
      this.drawParticles();
      this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    startAnimation() {
      if (!this.animationId) {
        this.animate();
      }
    }
    
    stopAnimation() {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
    }
  }
  
  // Initialize particle system
  let particleSystem;
  
  // Number Animation System
  class NumberAnimator {
    constructor() {
      this.animations = new Map();
      this.animationId = null;
      this.lastValues = new Map(); // Track last animated values
      this.startAnimation();
    }
    
    animateValue(element, startValue, endValue, duration = 1000, formatter = null, minChange = 0.01) {
      if (!element) return;
      
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
    }
    
    defaultFormatter(value) {
      return formatNumberShort(value);
    }
    
    // Force immediate animation for important events (bypasses minChange)
    forceAnimateValue(element, startValue, endValue, duration = 1000, formatter = null) {
      if (!element) return;
      
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
    
    animate() {
      this.updateAnimations();
      this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    startAnimation() {
      if (!this.animationId) {
        this.animate();
      }
    }
    
    stopAnimation() {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
    }
  }
  
  // Initialize number animator
  let numberAnimator;
  
  // Event System
  let marketBoomActive = false;
  let marketCrashActive = false;
  let flashSaleActive = false;
  let greatDepressionActive = false;
  let fastFingersActive = false;
  let marketBoomEndTime = 0;
  let marketCrashEndTime = 0;
  let flashSaleEndTime = 0;
  let greatDepressionEndTime = 0;
  let fastFingersEndTime = 0;
  let eventCooldown = 0;
  let skipNextEventCheck = false; // Skip next event check to give breathing room
  
  // Active event display elements
  let activeEventDisplay = null;
  let eventIcon = null;
  let eventName = null;
  let eventTimer = null;
  
  // Property system configuration
  const PROPERTY_CONFIG = {
    foodStand: {
      name: "Food Stand",
      baseCost: 400,
      incomePerSecond: 13,
      priceMultiplier: 1.065, // 2.5% increase per purchase
      icon: "fas fa-utensils"
    },
    newsstand: {
      name: "Newsstand",
      baseCost: 8000,
      incomePerSecond: 100,
      priceMultiplier: 1.065, // 4% increase per purchase
      icon: "fas fa-newspaper"
    },
    parkingGarage: {
      name: "Parking Garage",
      baseCost: 30000,
      incomePerSecond: 200,
      priceMultiplier: 1.065, // 4% increase per purchase
      icon: "fas fa-car"
    },
    convenienceStore: {
      name: "Convenience Store",
      baseCost: 150000,
      incomePerSecond: 1250,
      priceMultiplier: 1.065, // 4% increase per purchase
      icon: "fas fa-store"
    },
    apartment: {
      name: "Apartment",
      baseCost: 500000,
      incomePerSecond: 4000,
      priceMultiplier: 1.065, // 4% increase per purchase
      icon: "fas fa-home"
    },
    manufacturingPlant: {
      name: "Manufacturing Plant",
      baseCost: 2500000,
      incomePerSecond: 18000,
      priceMultiplier: 1.065, // 4% increase per purchase
      icon: "fas fa-industry"
    },
    officeBuilding: {
      name: "Office Building",
      baseCost: 10000000,
      incomePerSecond: 55000,
      priceMultiplier: 1.065, // 4% increase per purchase
      icon: "fas fa-building"
    },
    skyscraper: {
      name: "Skyscraper",
      baseCost: 50000000,
      incomePerSecond: 175000,
      priceMultiplier: 1.065, // 4% increase per purchase
      icon: "fas fa-city"
    },
    operaHouse: {
      name: "Opera House",
      baseCost: 500000000,
      incomePerSecond: 1500000,
      priceMultiplier: 1.065, // 4% increase per purchase
      icon: "fas fa-theater-masks"
    }
  };

  // Property ownership tracking
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

  // Buy multiplier system (1x, 10x, 25x, MAX)
  let buyMultiplier = 1;
  const BUY_MULTIPLIERS = [1, 10, 25, 'MAX'];

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

  // Net worth chart data
  let netWorthHistory = [];
  let eventLogs = [];
  let netWorthChart = null;
  const MAX_DATA_POINTS = 120; // 10 minutes of data (120 * 5 seconds)
  const DATA_COLLECTION_INTERVAL = 5000; // 5 seconds

  // Event system configuration
  const EVENT_CONFIG = {
    // Event probabilities (per check) - different for each difficulty
    probabilities: {
      marketBoom: {
        easy: 0.08,     // 7.5% chance (easier)
        normal: 0.055,  // 5.5% chance (original)
        hard: 0.04,     // 4% chance (harder)
        extreme: 0.005   // 2% chance (extreme)
      },
      marketCrash: {
        easy: 0.02,     // 2% chance (easier)
        normal: 0.04,   // 4% chance (original)
        hard: 0.06,     // 6% chance (harder)
        extreme: 0.08   // 8% chance (extreme)
      },
      flashSale: {
        easy: 0.05,     // 5% chance (easier)
        normal: 0.03,   // 3% chance (original)
        hard: 0.02,     // 2% chance (harder)
        extreme: 0.005   // 1% chance (extreme)
      },
      greatDepression: {
        easy: 0.005,    // 0.5% chance (easier)
        normal: 0.01,   // 1% chance (original)
        hard: 0.015,    // 1.5% chance (harder)
        extreme: 0.045   // 2% chance (extreme)
      },
      fastFingers: {
        easy: 0.04,     // 4% chance (easier)
        normal: 0.02,   // 2% chance (original)
        hard: 0.01,     // 1% chance (harder)
        extreme: 0.005  // 0.5% chance (extreme)
      },
      taxCollection: {
        easy: 0.01,     // 1% chance (easier)
        normal: 0.02,   // 2% chance (original)
        hard: 0.03,     // 3% chance (harder)
        extreme: 0.095   // 4% chance (extreme)
      },
      robbery: {
        easy: 0.01,     // 1% chance (easier)
        normal: 0.02,   // 2% chance (original)
        hard: 0.03,     // 3% chance (harder)
        extreme: 0.095   // 4% chance (extreme)
      },
      divorce: {
        easy: 0.005,    // 0.5% chance (easier)
        normal: 0.01,   // 1% chance (original)
        hard: 0.015,    // 1.5% chance (harder)
        extreme: 0.045   // 2% chance (extreme)
      }
    },
    
    // Event durations (milliseconds)
    durations: {
      marketBoom: 30000,    // 30 seconds
      marketCrash: 30000,   // 30 seconds
      flashSale: 30000,     // 30 seconds
      greatDepression: 30000, // 30 seconds
      fastFingers: 15000    // 15 seconds
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
        easy: 180000,     // 4 minutes (easier)
        normal: 180000,   // 3 minutes (original)
        hard: 180000,     // 2 minutes (harder)
        extreme: 180000    // 1.5 minutes (extreme)
      },
      greatDepression: {
        easy: 90000,      // 1.5 minutes (easier)
        normal: 60000,    // 1 minute (original)
        hard: 45000,      // 45 seconds (harder)
        extreme: 30000    // 30 seconds (extreme)
      },
      fastFingers: {
        easy: 60000,      // 1.5 minutes (easier)
        normal: 60000,    // 1 minute (original)
        hard: 60000,      // 45 seconds (harder)
        extreme: 60000    // 30 seconds (extreme)
      },
      taxCollection: {
        easy: 90000,      // 1.5 minutes (easier)
        normal: 60000,    // 1 minute (original)
        hard: 45000,      // 45 seconds (harder)
        extreme: 10000    // 30 seconds (extreme)
      },
      robbery: {
        easy: 90000,      // 1.5 minutes (easier)
        normal: 60000,    // 1 minute (original)
        hard: 45000,      // 45 seconds (harder)
        extreme: 10000    // 30 seconds (extreme)
      },
      divorce: {
        easy: 120000,     // 2 minutes (easier)
        normal: 90000,    // 1.5 minutes (original)
        hard: 60000,      // 1 minute (harder)
        extreme: 20000    // 45 seconds (extreme)
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
      divorce: 0
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
      divorce: 1000000      // 1 million euro threshold
    }
  };
  
  // Helper function to calculate current net worth
  function getCurrentNetWorth() {
    return currentAccountBalance + investmentAccountBalance;
  }
  
  // Helper function to check if event meets net worth threshold
  function meetsNetWorthThreshold(eventName) {
    const threshold = EVENT_CONFIG.netWorthThresholds[eventName] || 0;
    return getCurrentNetWorth() >= threshold;
  }
  
  // Helper function to get event probability based on current difficulty
  function getEventProbability(eventName) {
    const eventProbs = EVENT_CONFIG.probabilities[eventName];
    if (!eventProbs) return 0;
    
    // Return the probability for the current difficulty
    return eventProbs[gameDifficulty] || eventProbs.normal;
  }

  function getEventCooldown(eventName) {
    const eventCooldowns = EVENT_CONFIG.cooldowns[eventName];
    if (!eventCooldowns) return 60000; // Default 1 minute
    
    // Return the cooldown for the current difficulty
    return eventCooldowns[gameDifficulty] || eventCooldowns.normal;
  }
  
  // Event Functions
  function triggerMarketBoom() {
    if (marketBoomActive || marketCrashActive || flashSaleActive || greatDepressionActive) return; // Don't trigger if any event is active
    
    marketBoomActive = true;
    marketBoomEndTime = Date.now() + EVENT_CONFIG.durations.marketBoom;
    EVENT_CONFIG.eventCooldowns.marketBoom = Date.now() + getEventCooldown('marketBoom');
    
    // Show notification
    showEventNotification("📈 Market Boom!", "Interest & dividend rates increased by 50%!", "boom");
    
    // Visual effects
    screenFlash('#00FF00', 500); // Green flash
    screenShake(3, 200); // Gentle shake
    
    // Sound effect
    playMarketBoomSound();
    
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
    marketCrashEndTime = Date.now() + EVENT_CONFIG.durations.marketCrash;
    EVENT_CONFIG.eventCooldowns.marketCrash = Date.now() + getEventCooldown('marketCrash');
    
    // Calculate loss based on difficulty
    const lossRate = gameDifficulty === 'extreme' ? 0.45 : 0.2; // 40% for extreme, 20% for others
    const lossAmount = investmentAccountBalance * lossRate;
    investmentAccountBalance -= lossAmount;
    
    // Show notification
    showEventNotification("📉 Market Crash!", `Lost €${formatNumberShort(lossAmount)}! Interest & dividend rates reduced by 70%!`, "crash");
    
    // Visual effects
    screenFlash('#FF0000', 500); // Red flash
    screenShake(8, 400); // Strong shake
    
    // Sound effect
    playMarketCrashSound();
    
    // Create loss particles
    if (particleSystem) {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      particleSystem.createMoneyLossParticles(centerX, centerY, lossAmount);
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
    flashSaleEndTime = Date.now() + EVENT_CONFIG.durations.flashSale;
    EVENT_CONFIG.eventCooldowns.flashSale = Date.now() + getEventCooldown('flashSale');
    
    // Show notification
    showEventNotification("🏷️ Flash Sale!", "25% off all upgrades for 30 seconds!", "flash-sale");
    
    // Visual effects
    screenFlash('#FF6B35', 500); // Orange flash
    screenShake(4, 300); // Medium shake
    
    // Sound effect
    playFlashSaleSound();
    
    // Create sale particles
    if (particleSystem) {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      particleSystem.createFlashSaleParticles(centerX, centerY, 20);
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
    greatDepressionEndTime = Date.now() + EVENT_CONFIG.durations.greatDepression;
    EVENT_CONFIG.eventCooldowns.greatDepression = Date.now() + getEventCooldown('greatDepression');
    
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
    playMarketCrashSound();
    
    // Create massive loss particles
    if (particleSystem) {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      particleSystem.createMoneyLossParticles(centerX, centerY, lossAmount * 2); // Double particles for dramatic effect
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
    EVENT_CONFIG.eventCooldowns.taxCollection = Date.now() + getEventCooldown('taxCollection');
    
    // Calculate tax based on difficulty
    const taxRate = gameDifficulty === 'extreme' ? 0.28 : 0.08; // 24% for extreme (3x), 8% for others
    const taxAmount = investmentAccountBalance * taxRate;
    investmentAccountBalance -= taxAmount;
    
    // Show notification
    showEventNotification("🏛️ Tax Collection!", `Paid €${formatNumberShort(taxAmount)} in taxes!`, "tax-collection");
    
    // Visual effects
    screenFlash('#8B4513', 400); // Brown flash (tax color)
    screenShake(3, 200); // Gentle shake
    
    // Sound effect (reuse error sound for tax)
    playErrorSound();
    
    // Create tax particles
    if (particleSystem) {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      particleSystem.createMoneyLossParticles(centerX, centerY, taxAmount);
    }
    
    // Update displays
    renderBalances();
    
    // Log the event
    logEvent("💰 Tax Collection", "tax-collection");
  }
  
  function triggerRobbery() {
    // Robbery is an instant event (no duration) but follows the same "one event at a time" rule
    // Set cooldown
    EVENT_CONFIG.eventCooldowns.robbery = Date.now() + getEventCooldown('robbery');
    
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
    showEventNotification(" You are robbed!", notificationMessage, "robbery");
    
    // Visual effects
    screenFlash('#8B0000', 600); // Dark red flash
    screenShake(8, 400); // Strong shake
    
    // Sound effect (reuse error sound for robbery)
    playErrorSound();
    
    // Create robbery particles (only if money was actually stolen)
    if (particleSystem && stolenAmount > 0) {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      particleSystem.createMoneyLossParticles(centerX, centerY, stolenAmount);
    }
    
    // Update displays
    renderBalances();
    
    // Log the event
    logEvent("🔫 Robbery", "robbery");
  }
  
  function triggerDivorce() {
    // Divorce is an instant event (no duration) but follows the same "one event at a time" rule
    // Set cooldown
    EVENT_CONFIG.eventCooldowns.divorce = Date.now() + getEventCooldown('divorce');
    
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
    playErrorSound();
    
    // Create divorce particles
    if (particleSystem) {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      particleSystem.createMoneyLossParticles(centerX, centerY, lossAmount);
    }
    
    // Update displays
    renderBalances();
    
    // Log the event
    logEvent("💔 Divorce", "divorce");
  }
  
  function triggerFastFingers() {
    if (marketBoomActive || marketCrashActive || flashSaleActive || greatDepressionActive || fastFingersActive) return; // Don't trigger if any event is active
    
    fastFingersActive = true;
    fastFingersEndTime = Date.now() + EVENT_CONFIG.durations.fastFingers;
    EVENT_CONFIG.eventCooldowns.fastFingers = Date.now() + getEventCooldown('fastFingers');
    
    // Show notification
    showEventNotification("⚡ Fast Fingers!", "Click income boosted by 3x for 15 seconds!", "fast-fingers");
    
    // Visual effects
    screenFlash('#FFD700', 500); // Gold flash
    screenShake(2, 200); // Light shake
    
    // Play sound effect
    if (soundEnabled) {
      playFastFingersSound();
    }
    
    updateActiveEventDisplay();
    
    // Log the event
    logEvent("⚡ Fast Fingers", "fast-fingers");
  }
  
  // Check for expired events immediately (called every second)
  function checkExpiredEvents() {
    const now = Date.now();
    
    // Check if events should end
    if (marketBoomActive && now >= marketBoomEndTime) {
      marketBoomActive = false;
      updateInterestRateColor();
      updateDividendRateColor();
      renderDividendUI(0); // Update dividend display
      showEventNotification("📈 Boom Ended", "Interest & dividend rates returned to normal", "boom-end");
      updateActiveEventDisplay();
      skipNextEventCheck = true; // Skip next event check for breathing room
    }
    
    if (marketCrashActive && now >= marketCrashEndTime) {
      marketCrashActive = false;
      updateInterestRateColor();
      updateDividendRateColor();
      renderDividendUI(0); // Update dividend display
      showEventNotification("📉 Crash Ended", "Interest & dividend rates returned to normal", "crash-end");
      updateActiveEventDisplay();
      skipNextEventCheck = true; // Skip next event check for breathing room
    }
    
    if (flashSaleActive && now >= flashSaleEndTime) {
      flashSaleActive = false;
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
    
    if (greatDepressionActive && now >= greatDepressionEndTime) {
      greatDepressionActive = false;
      updateInterestRateColor();
      updateDividendRateColor();
      renderDividendUI(0); // Update dividend display
      showEventNotification("💀 Depression Ended", "Interest rates returned to normal, dividends resumed", "depression-end");
      updateActiveEventDisplay();
      skipNextEventCheck = true; // Skip next event check for breathing room
    }
    
    if (fastFingersActive && now >= fastFingersEndTime) {
      fastFingersActive = false;
      showEventNotification("⚡ Fast Fingers Ended", "Click income returned to normal", "fast-fingers-end");
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
    const anyEventActive = marketBoomActive || marketCrashActive || flashSaleActive || greatDepressionActive || fastFingersActive;
    
    // console.log('🎲 Event Check:', {
    //   anyEventActive,
    //   marketBoomActive,
    //   marketCrashActive,
    //   flashSaleActive,
    //   now,
    //   cooldowns: {
    //     marketBoom: EVENT_CONFIG.eventCooldowns.marketBoom,
    //     marketCrash: EVENT_CONFIG.eventCooldowns.marketCrash,
    //     flashSale: EVENT_CONFIG.eventCooldowns.flashSale
    //   }
    // });
    
    if (!anyEventActive) {
      // Only check for new events if no event is currently active
      const eventRoll = Math.random();
      
      // Calculate which events can actually trigger (meet thresholds and cooldowns)
      const availableEvents = [];
      const eventConfigs = [
        { name: 'marketBoom', prob: getEventProbability('marketBoom') },
        { name: 'marketCrash', prob: getEventProbability('marketCrash') },
        { name: 'flashSale', prob: getEventProbability('flashSale') },
        { name: 'greatDepression', prob: getEventProbability('greatDepression') },
        { name: 'fastFingers', prob: getEventProbability('fastFingers') },
        { name: 'taxCollection', prob: getEventProbability('taxCollection') },
        { name: 'robbery', prob: getEventProbability('robbery') },
        { name: 'divorce', prob: getEventProbability('divorce') }
      ];
      
      // Filter events that can actually trigger
      eventConfigs.forEach(event => {
        const canTrigger = now >= EVENT_CONFIG.eventCooldowns[event.name] && meetsNetWorthThreshold(event.name);
        if (canTrigger) {
          availableEvents.push(event);
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
          marketBoom: now >= EVENT_CONFIG.eventCooldowns.marketBoom,
          marketCrash: now >= EVENT_CONFIG.eventCooldowns.marketCrash,
          flashSale: now >= EVENT_CONFIG.eventCooldowns.flashSale,
          greatDepression: now >= EVENT_CONFIG.eventCooldowns.greatDepression,
          fastFingers: now >= EVENT_CONFIG.eventCooldowns.fastFingers,
          taxCollection: now >= EVENT_CONFIG.eventCooldowns.taxCollection,
          robbery: now >= EVENT_CONFIG.eventCooldowns.robbery,
          divorce: now >= EVENT_CONFIG.eventCooldowns.divorce
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
          divorce: meetsNetWorthThreshold('divorce')
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
  
  function updateInterestRateColor() {
    const interestEl = document.getElementById('interestPerSec');
    if (!interestEl) return;
    
    // Remove existing color classes
    interestEl.classList.remove('market-boom', 'market-crash', 'great-depression');
    
    // Add appropriate color class
    if (marketBoomActive) {
      interestEl.classList.add('market-boom');
    } else if (marketCrashActive) {
      interestEl.classList.add('market-crash');
    } else if (greatDepressionActive) {
      interestEl.classList.add('great-depression');
    }
  }
  
  function updateDividendRateColor() {
    const dividendRateEl = document.getElementById('dividendRate');
    if (!dividendRateEl) return;
    
    // Remove existing color classes
    dividendRateEl.classList.remove('market-boom', 'market-crash', 'great-depression');
    
    // Add appropriate color class
    if (marketBoomActive) {
      dividendRateEl.classList.add('market-boom');
    } else if (marketCrashActive) {
      dividendRateEl.classList.add('market-crash');
    } else if (greatDepressionActive) {
      dividendRateEl.classList.add('great-depression');
    }
  }
  
  function updateActiveEventDisplay() {
    if (!activeEventDisplay || !eventIcon || !eventName || !eventTimerFill || !eventTimerText) return;
    
    const now = Date.now();
    let activeEvent = null;
    let endTime = 0;
    let eventType = '';
    let totalDuration = 0;
    
    // Determine which event is active
    if (marketBoomActive && now < marketBoomEndTime) {
      activeEvent = { name: 'Market Boom', icon: '📈', type: 'market-boom' };
      endTime = marketBoomEndTime;
      eventType = 'market-boom';
      totalDuration = EVENT_CONFIG.durations.marketBoom;
    } else if (marketCrashActive && now < marketCrashEndTime) {
      activeEvent = { name: 'Market Crash', icon: '📉', type: 'market-crash' };
      endTime = marketCrashEndTime;
      eventType = 'market-crash';
      totalDuration = EVENT_CONFIG.durations.marketCrash;
    } else if (flashSaleActive && now < flashSaleEndTime) {
      activeEvent = { name: 'Flash Sale', icon: '🏷️', type: 'flash-sale' };
      endTime = flashSaleEndTime;
      eventType = 'flash-sale';
      totalDuration = EVENT_CONFIG.durations.flashSale;
    } else if (greatDepressionActive && now < greatDepressionEndTime) {
      activeEvent = { name: 'Great Depression', icon: '💀', type: 'great-depression' };
      endTime = greatDepressionEndTime;
      eventType = 'great-depression';
      totalDuration = EVENT_CONFIG.durations.greatDepression;
    } else if (fastFingersActive && now < fastFingersEndTime) {
      activeEvent = { name: 'Fast Fingers', icon: '⚡', type: 'fast-fingers' };
      endTime = fastFingersEndTime;
      eventType = 'fast-fingers';
      totalDuration = EVENT_CONFIG.durations.fastFingers;
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
  
  function showEventNotification(title, message, type) {
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
  
  function playMarketBoomSound() {
    if (!audioContext || !soundEffectsEnabled) return;
    
    try {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Rising tone for boom
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.5);
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('Audio not available');
    }
  }
  
  function playMarketCrashSound() {
    if (!audioContext || !soundEffectsEnabled) return;
    
    try {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Falling tone for crash
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.8);
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.4, audioContext.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.8);
    } catch (error) {
      console.log('Audio not available');
    }
  }
  
  function playFlashSaleSound() {
    if (!audioContext || !soundEffectsEnabled) return;
    
    try {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Cash register sound for sale
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime + 0.2);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.3);
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.1);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.2);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('Audio not available');
    }
  }
  
  function playFastFingersSound() {
    if (!audioContext || !soundEffectsEnabled) return;
    
    try {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Fast, energetic sound with multiple frequency jumps
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1000, audioContext.currentTime + 0.05);
      oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.1);
      oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.15);
      
      gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      console.log('Audio not available');
    }
  }

  // Screen shake functionality
  function screenShake(intensity = 5, duration = 200) {
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
  function screenFlash(color = '#FFD700', duration = 300) {
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

  // Format numbers with k/m/b/t suffixes for better readability
  function formatNumberShort(num) {
    const isNegative = num < 0;
    const absNum = Math.abs(num);
    
    let formatted;
    if (absNum >= 1000000000000) {
      formatted = (absNum / 1000000000000).toFixed(2) + 't';
    } else if (absNum >= 1000000000) {
      formatted = (absNum / 1000000000).toFixed(2) + 'b';
    } else if (absNum >= 1000000) {
      formatted = (absNum / 1000000).toFixed(2) + 'm';
    } else if (absNum >= 1000) {
      formatted = (absNum / 1000).toFixed(2) + 'k';
    } else {
      formatted = absNum.toFixed(2); // Show cents for amounts below 1000
    }
    
    return isNegative ? '-' + formatted : formatted;
  }

  function renderUpgradePrices() {
    // Generate upgrade price elements mapping automatically
    const map = Object.fromEntries(
      Object.keys(UPGRADE_CONFIG).map(id => [id, document.getElementById(id + 'Price')])
    );
    Object.entries(map).forEach(([key, el]) => {
      if (!el) return;
      let cost = UPGRADE_COSTS[key];
      
      // Apply Flash Sale discount
      if (flashSaleActive) {
        cost = cost * 0.75; // 25% off
      }
      
      if (numberAnimator) {
        // Parse current value from element text
        const currentValue = parseDisplayedValue(el.textContent);
        
        // Animate to new cost
        numberAnimator.animateValue(el, currentValue, cost, 300, (value) => '€' + formatNumberShort(value));
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

  function renderBalances() {
    if (currentDisplay && numberAnimator) {
      const currentValue = parseDisplayedValue(currentDisplay.textContent);
      // Only animate for significant changes (1% or more)
      const minChange = Math.max(currentAccountBalance * 0.01, 1);
      numberAnimator.animateValue(currentDisplay, currentValue, currentAccountBalance, 400, (value) => '€' + formatNumberShort(value), minChange);
    }
    if (investmentDisplay && numberAnimator) {
      const investmentValue = parseDisplayedValue(investmentDisplay.textContent);
      // Dynamic threshold: 1% of balance, but minimum 0.01 for small amounts
      const minChange = Math.max(investmentAccountBalance * 0.01, 0.01);
      numberAnimator.animateValue(investmentDisplay, investmentValue, investmentAccountBalance, 400, (value) => '€' + formatNumberShort(value), minChange);
    }
    
    // Update header displays
    if (headerCurrentDisplay && numberAnimator) {
      const headerCurrentValue = parseDisplayedValue(headerCurrentDisplay.textContent);
      const minChange = Math.max(currentAccountBalance * 0.01, 1);
      numberAnimator.animateValue(headerCurrentDisplay, headerCurrentValue, currentAccountBalance, 400, (value) => '€' + formatNumberShort(value), minChange);
    }
    if (headerInvestmentDisplay && numberAnimator) {
      const headerInvestmentValue = parseDisplayedValue(headerInvestmentDisplay.textContent);
      // Dynamic threshold: 1% of balance, but minimum 0.01 for small amounts
      const minChange = Math.max(investmentAccountBalance * 0.01, 0.01);
      numberAnimator.animateValue(headerInvestmentDisplay, headerInvestmentValue, investmentAccountBalance, 400, (value) => '€' + formatNumberShort(value), minChange);
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
    let bonus = 0;
    if (owned.u1) bonus += 1;      // elementary school
    if (owned.u3) bonus += 6;      // high school
    if (owned.u5) bonus += 30;     // higher education
    
    
    let totalIncome = (base + bonus) * prestigeClickMultiplier;
    
    // Apply Fast Fingers 3x boost
    if (fastFingersActive) {
      totalIncome *= 3;
    }
    
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
    
    // Create particle effects
    if (particleSystem && clickBtn) {
      const rect = clickBtn.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      if (isCritical) {
        // Critical hit: single orange coin + screen shake
        particleSystem.createCriticalCoin(centerX, centerY);
        screenShake(8, 300);
      } else {
        // Normal click: regular particles based on income (mobile gets even fewer particles)
        const particleMultiplier = isMobile ? 0.5 : 1; // Mobile gets 50% fewer particles
        const baseCoinCount = Math.min(Math.max(Math.floor(income * 0.15 * particleMultiplier), 1), 1);
        const baseSparkleCount = Math.min(Math.max(Math.floor(income * 0.25 * particleMultiplier), 1), isMobile ? 1 : 2);
        
        // Debug log for mobile particles
        if (isMobile) {
          console.log('Mobile click particles:', { income, particleMultiplier, baseCoinCount, baseSparkleCount });
        }
        
        // Create coin particles
        particleSystem.createCoinParticles(centerX, centerY, baseCoinCount);
        
        // Create sparkle particles
        particleSystem.createSparkleParticles(centerX, centerY, baseSparkleCount);
      }
    }
    
    // Force immediate balance animation for click feedback
    if (numberAnimator) {
      if (currentDisplay) {
        const currentValue = parseDisplayedValue(currentDisplay.textContent);
        numberAnimator.forceAnimateValue(currentDisplay, currentValue, currentAccountBalance, 300, (value) => '€' + formatNumberShort(value));
      }
      if (headerCurrentDisplay) {
        const headerCurrentValue = parseDisplayedValue(headerCurrentDisplay.textContent);
        numberAnimator.forceAnimateValue(headerCurrentDisplay, headerCurrentValue, currentAccountBalance, 300, (value) => '€' + formatNumberShort(value));
      }
    }
    
    renderBalances();
    updateUpgradeIndicator();
    updatePortfolioIndicator();
    
    // Create flying money number with critical hit styling (show actual amount added)
    createFlyingMoney(cappedIncome, isCritical);
    
    // Play appropriate sound
    if (isCritical) {
      playCriticalCoinSound();
    } else {
    playClickSound();
    }
    
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
        particleSystem.createMoneyGainParticles(centerX, centerY, depositAmount);
        
        // Create upgrade particles for investment
        particleSystem.createUpgradeParticles(centerX, centerY, 3);
      }
    }
    
    renderBalances();
    if (amountInput) amountInput.value = ""; // clear input
    playDepositSound(); // Play deposit sound effect
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
        particleSystem.createMoneyGainParticles(centerX, centerY, withdrawAmount);
        
        // Create sparkle particles for withdrawal
        particleSystem.createSparkleParticles(centerX, centerY, 2);
      }
    }
    
    renderBalances();
    if (amountInput) amountInput.value = ""; // clear input
    playWithdrawSound(); // Play withdraw sound effect
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
        particleSystem.createMoneyGainParticles(centerX, centerY, withdrawAmount);
        
        // Create sparkle particles for withdrawal
        particleSystem.createSparkleParticles(centerX, centerY, 1);
      }
    }
    
    renderBalances();
    if (amountInput) amountInput.value = ""; // clear input
    playWithdrawSound(); // Play withdraw sound effect
    saveGameState();
  }

  // Property system functions
  function getEffectiveBaseCost(config) {
    // Apply building discount upgrades
    let totalDiscount = 0;
    if (owned.u33) totalDiscount += 0.15; // Real Estate Connections: 15% off
    if (owned.u34) totalDiscount += 0.20; // Hire a contractor: additional 20% off
    if (owned.u36) totalDiscount += 0.10; // Market awareness: additional 10% off
    
    return config.baseCost * (1 - totalDiscount);
  }

  function getPropertyCost(propertyId) {
    const config = PROPERTY_CONFIG[propertyId];
    const owned = properties[propertyId];
    return Math.floor(getEffectiveBaseCost(config) * Math.pow(config.priceMultiplier, owned));
  }

  // Helper function to get individual building income based on total owned count
  function getIndividualBuildingIncome(propertyId, buildingIndex, totalOwned) {
    const config = PROPERTY_CONFIG[propertyId];
    
    // Calculate tier based on total owned buildings (not individual building index)
    // 0-99 buildings = tier 0 (1x), 100-199 = tier 1 (2x), 200-299 = tier 2 (4x), etc.
    const tier = Math.floor(totalOwned / 100);
    const tierMultiplier = Math.pow(3, tier); // 2^tier (1x, 2x, 4x, 8x...)
    
    let income = config.incomePerSecond * tierMultiplier;
    
    // Apply Property Management boost (35% increase)
    if (owned.u35) {
      income *= 1.35;
    }
    
    // Apply Rental Monopoly boost (20% increase)
    if (owned.u37) {
      income *= 1.20;
    }
    
    return Math.floor(income);
  }

  function getPropertyTotalIncome(propertyId) {
    const config = PROPERTY_CONFIG[propertyId];
    const ownedCount = properties[propertyId];
    
    // Calculate tier based on total owned buildings (every 25 buildings)
    let tier;
    if (ownedCount >= 100) {
      tier = 4; // Diamond (100+) - 16x multiplier
    } else if (ownedCount >= 75) {
      tier = 3; // Golden (75-99) - 8x multiplier
    } else if (ownedCount >= 50) {
      tier = 2; // Silver (50-74) - 4x multiplier
    } else if (ownedCount >= 25) {
      tier = 1; // Bronze (25-49) - 2x multiplier
    } else {
      tier = 0; // Default (0-24) - 1x multiplier
    }
    
    const tierMultiplier = Math.pow(2, tier); // 2^tier (1x, 2x, 4x, 8x)
    
    // All buildings get the same income multiplier based on total owned
    let baseIncome = ownedCount * config.incomePerSecond * tierMultiplier;
    
    // Apply Property Management boost (35% increase)
    if (owned.u35) {
      baseIncome *= 1.35;
    }
    
    // Apply Rental Monopoly boost (20% increase)
    if (owned.u37) {
      baseIncome *= 1.20;
    }
    
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
      playErrorSound();
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
        playErrorSound();
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
    
    // Create purchase particle effects
    if (particleSystem) {
      const buyBtn = document.getElementById(`buy${propertyId.charAt(0).toUpperCase() + propertyId.slice(1)}Btn`);
      if (buyBtn) {
        const rect = buyBtn.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Create upgrade particles (more particles for multiple purchases)
        particleSystem.createUpgradeParticles(centerX, centerY, Math.min(6, purchases * 1));
        
        // Create money gain particles
        particleSystem.createMoneyGainParticles(centerX, centerY, totalCost);
      }
    }
    
    // Play buy sound
    playBuySound();
    
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
              // Calculate tier based on total owned buildings (every 25 buildings)
              let tier;
              if (ownedCount >= 100) {
                tier = 4; // Diamond (100+) - 16x multiplier
              } else if (ownedCount >= 75) {
                tier = 3; // Golden (75-99) - 8x multiplier
              } else if (ownedCount >= 50) {
                tier = 2; // Silver (50-74) - 4x multiplier
              } else if (ownedCount >= 25) {
                tier = 1; // Bronze (25-49) - 2x multiplier
              } else {
                tier = 0; // Default (0-24) - 1x multiplier
              }
      
      const tierMultiplier = Math.pow(2, tier);
      
      let individualIncome = config.incomePerSecond * tierMultiplier;
      
      // Apply upgrades
      if (owned.u35) {
        individualIncome *= 1.35;
      }
      if (owned.u37) {
        individualIncome *= 1.20;
      }
      
      individualIncomeEl.textContent = `€${formatNumberShort(Math.floor(individualIncome))}/sec each`;
    }
    
    // Update total income
    const totalIncomeEl = document.getElementById(`${propertyId}TotalIncome`);
    if (totalIncomeEl) {
      totalIncomeEl.textContent = `€${formatNumberShort(totalIncome)}/sec total`;
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

  // Apply tier-based styling to property rows
  function applyTierStyling(propertyId, ownedCount, showNotifications = true) {
    const propertyRow = document.querySelector(`[data-property-id="${propertyId}"]`);
    if (!propertyRow) return;
    
    // Get previous tier to detect tier changes
    const previousTier = getTierFromClass(propertyRow);
    
    // Calculate new tier (every 25 buildings: Bronze, Silver, Gold, Diamond)
    let newTier;
    if (ownedCount >= 100) {
      newTier = 4; // Diamond (100+)
    } else if (ownedCount >= 75) {
      newTier = 3; // Golden (75-99)
    } else if (ownedCount >= 50) {
      newTier = 2; // Silver (50-74)
    } else if (ownedCount >= 25) {
      newTier = 1; // Bronze (25-49)
    } else {
      newTier = 0; // Default (0-24)
    }
    
    // Remove existing tier classes
    propertyRow.classList.remove('tier-0', 'tier-1', 'tier-2', 'tier-3', 'tier-4');
    
    if (ownedCount >= 100) {
      propertyRow.classList.add('tier-4'); // Diamond (100+)
    } else if (ownedCount >= 75) {
      propertyRow.classList.add('tier-3'); // Golden (75-99)
    } else if (ownedCount >= 50) {
      propertyRow.classList.add('tier-2'); // Silver (50-74)
    } else if (ownedCount >= 25) {
      propertyRow.classList.add('tier-1'); // Bronze (25-49)
    } else {
      propertyRow.classList.add('tier-0'); // Default (0-24)
    }
    
    // Check if tier increased and celebrate! (only for tiers 1, 2, 3, 4)
    if (showNotifications && newTier > previousTier && newTier <= 4) {
      celebrateTierUpgrade(propertyId, newTier, propertyRow);
    }
  }
  
  // Helper function to get tier from CSS class
  function getTierFromClass(propertyRow) {
    if (propertyRow.classList.contains('tier-4')) return 4;
    if (propertyRow.classList.contains('tier-3')) return 3;
    if (propertyRow.classList.contains('tier-2')) return 2;
    if (propertyRow.classList.contains('tier-1')) return 1;
    return 0;
  }
  
  // Update tier progress line under property card
  function updateTierProgressLine(propertyId, ownedCount) {
    const propertyRow = document.querySelector(`[data-property-id="${propertyId}"]`);
    if (!propertyRow) return;
    
    // Calculate current tier and progress to next tier
    let currentTier, nextTierThreshold, progress, lineColor;
    
    if (ownedCount >= 100) {
      // Diamond tier (max tier) - hide progress line
      currentTier = 4;
      nextTierThreshold = 100;
      progress = 0;
      lineColor = '#00bfff'; // Diamond blue
    } else if (ownedCount >= 75) {
      // Gold tier - progress to Diamond (100)
      currentTier = 3;
      nextTierThreshold = 100;
      progress = (ownedCount - 75) / 25; // 0-1 progress from 75 to 100
      lineColor = '#ffd700'; // Gold
    } else if (ownedCount >= 50) {
      // Silver tier - progress to Gold (75)
      currentTier = 2;
      nextTierThreshold = 75;
      progress = (ownedCount - 50) / 25; // 0-1 progress from 50 to 75
      lineColor = '#c0c0c0'; // Silver
    } else if (ownedCount >= 25) {
      // Bronze tier - progress to Silver (50)
      currentTier = 1;
      nextTierThreshold = 50;
      progress = (ownedCount - 25) / 25; // 0-1 progress from 25 to 50
      lineColor = '#cd7f32'; // Bronze
    } else {
      // Default tier - progress to Bronze (25)
      currentTier = 0;
      nextTierThreshold = 25;
      progress = ownedCount / 25; // 0-1 progress from 0 to 25
      lineColor = '#6b7280'; // Gray
    }
    
    // Create or update the progress line
    let progressLine = propertyRow.querySelector('.tier-progress-line');
    if (!progressLine) {
      progressLine = document.createElement('div');
      progressLine.classList.add('tier-progress-line');
      propertyRow.appendChild(progressLine);
    }
    
    // Hide progress line if at max tier (Diamond tier)
    if (currentTier >= 4) {
      progressLine.style.display = 'none';
    } else {
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
  }
  
  // Celebrate tier upgrade with particles
  function celebrateTierUpgrade(propertyId, newTier, propertyRow) {
    const config = PROPERTY_CONFIG[propertyId];
    const rect = propertyRow.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Create celebration particles based on tier
    let particleCount = 20 + (newTier * 10); // More particles for higher tiers
    let colors = [];
    
    switch(newTier) {
      case 1: // Bronze tier
        colors = ['#cd7f32', '#b87333', '#a0522d', '#8b4513'];
        break;
      case 2: // Silver tier
        colors = ['#c0c0c0', '#a9a9a9', '#808080', '#696969'];
        break;
      case 3: // Gold tier
        colors = ['#ffd700', '#ffdf00', '#daa520', '#b8860b'];
        break;
      case 4: // Diamond tier
        colors = ['#00bfff', '#1e90ff', '#4169e1', '#0000ff'];
        break;
      default: // Higher tiers
        colors = ['#8b5cf6', '#7c3aed', '#6d28d9'];
        break;
    }
    
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
    if (soundEnabled) {
      playTierUpgradeSound();
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
  
  // Show tier upgrade notification
  function showTierUpgradeNotification(propertyId, tier, propertyName) {
    const notification = document.createElement('div');
    const tierClass = getTierClass(tier);
    const propertyIcon = PROPERTY_CONFIG[propertyId].icon;
    
    notification.className = `market-event-notification tier-upgrade ${tierClass}`;
    notification.innerHTML = `
      <div class="event-title">
        <i class="${propertyIcon}"></i>
        ${propertyName} reached ${getTierText(tier)} tier!
      </div>
      <div class="event-message">Rent is doubled!</div>
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
  
  function getTierText(tier) {
    switch(tier) {
      case 1: return 'bronze';
      case 2: return 'silver';
      case 3: return 'gold';
      case 4: return 'diamond';
      default: return 'diamond';
    }
  }
  
  function getMultiplierText(tier) {
    switch(tier) {
      case 1: return '2x';
      case 2: return '2x';
      case 3: return '2x';
      case 4: return '2x';
      default: return '2x';
    }
  }
  
  function getTierClass(tier) {
    switch(tier) {
      case 1: return 'tier-bronze';
      case 2: return 'tier-silver';
      case 3: return 'tier-gold';
      case 4: return 'tier-diamond';
      default: return 'tier-diamond';
    }
  }

  function renderAllProperties() {
    Object.keys(PROPERTY_CONFIG).forEach(propertyId => {
      renderPropertyUI(propertyId);
    });
    updateTotalRentDisplay();
  }

  function getTotalPropertyIncome() {
    let total = 0;
    Object.keys(PROPERTY_CONFIG).forEach(propertyId => {
      total += getPropertyTotalIncome(propertyId);
    });
    return total;
  }

  function updateTotalRentDisplay() {
    const totalRentElement = document.getElementById('totalRentPerSecond');
    if (!totalRentElement) return;
    
    const totalRent = getTotalPropertyIncome();
    const formattedRent = formatNumberShort(totalRent);
    totalRentElement.textContent = `€${formattedRent}/sec`;
  }

  // Net worth calculation functions
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

  function calculateNetWorth() {
    const currentBalance = currentAccountBalance;
    const investmentBalance = investmentAccountBalance;
    const propertyValue = calculateTotalPropertyValue();
    return currentBalance + investmentBalance + propertyValue;
  }

  function addNetWorthDataPoint() {
    const liquidAssets = currentAccountBalance + investmentAccountBalance;
    const propertyValue = calculateTotalPropertyValue();
    const netWorth = liquidAssets + propertyValue;
    const timestamp = Date.now();
    
    netWorthHistory.push({ 
      timestamp, 
      netWorth,
      liquidAssets,
      propertyValue
    });
    
    // Keep only the last MAX_DATA_POINTS
    if (netWorthHistory.length > MAX_DATA_POINTS) {
      netWorthHistory.shift();
    }
    
    // Update chart if it exists
    updateNetWorthChart();
  }

  function initNetWorthChart() {
    const ctx = document.getElementById('netWorthChart');
    if (!ctx) return;

    netWorthChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Property Values',
          data: [],
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.4)',
          borderWidth: 2,
          fill: true, // Fill to the bottom (base layer)
          tension: 0.4,
          pointRadius: 0, // Hide points by default
          pointHoverRadius: 5, // Show points on hover
          pointBackgroundColor: '#f59e0b',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2
        }, {
          label: 'Liquid Assets',
          data: [],
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.4)',
          borderWidth: 2,
          fill: true, // Fill to the bottom (creates area under the line)
          tension: 0.4,
          pointRadius: 0, // Hide points by default
          pointHoverRadius: 5, // Show points on hover
          pointBackgroundColor: '#10b981',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 15,
              font: {
                size: 11
              }
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              title: function(context) {
                return context[0].label;
              },
              label: function(context) {
                const value = context.parsed.y;
                const label = context.dataset.label;
                return label + ': €' + formatNumberShort(value);
              },
              footer: function(context) {
                const total = context.reduce((sum, item) => sum + item.parsed.y, 0);
                return 'Total Net Worth: €' + formatNumberShort(total);
              }
            }
          }
        },
        scales: {
          x: {
            display: true,
            title: {
              display: false
            },
            grid: {
              color: 'rgba(100, 116, 139, 0.1)'
            },
            ticks: {
              color: '#64748b',
              maxTicksLimit: 6
            },
            stacked: true
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Net Worth (€)',
              color: '#64748b',
              font: {
                size: 12
              }
            },
            grid: {
              color: 'rgba(100, 116, 139, 0.1)'
            },
            ticks: {
              color: '#64748b',
              callback: function(value) {
                return formatNumberShort(value);
              }
            },
            stacked: true
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    });
  }

  function updateNetWorthChart() {
    if (!netWorthChart || netWorthHistory.length === 0) return;

    const labels = netWorthHistory.map(point => {
      const date = new Date(point.timestamp);
      return date.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    });

    const liquidAssetsData = netWorthHistory.map(point => {
      // Handle legacy data points that only have netWorth
      if (point.liquidAssets !== undefined) {
        return point.liquidAssets;
      } else {
        // For legacy data, estimate liquid assets as 70% of net worth
        return point.netWorth * 0.7;
      }
    });
    
    const propertyValuesData = netWorthHistory.map(point => {
      // Handle legacy data points that only have netWorth
      if (point.propertyValue !== undefined) {
        return point.propertyValue;
      } else {
        // For legacy data, estimate property values as 30% of net worth
        return point.netWorth * 0.3;
      }
    });

    netWorthChart.data.labels = labels;
    netWorthChart.data.datasets[0].data = propertyValuesData; // Property Values (base layer)
    netWorthChart.data.datasets[1].data = liquidAssetsData;   // Liquid Assets (stacked on top)
    netWorthChart.update('none'); // No animation for smoother updates
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
    }
    
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
        
        // Properties owned
        properties: { ...properties },
        
        // Net worth chart data
        netWorthHistory: [...netWorthHistory],
        
        // Event logs
        eventLogs: [...eventLogs],
        
        // Statistics
        totalClicks,
        totalCriticalHits,
        totalDividendsReceived,
        hasMadeFirstInvestment,
        
        // Click streak system
        streakCount,
        streakMultiplier,
        
        // Prestige multipliers
        prestigeClickMultiplier,
        prestigeInterestMultiplier,
        
        // Auto-invest settings
        autoInvestEnabled,
        
        // Auto-rent settings
        autoRentEnabled,
        
        // Buy multiplier
        buyMultiplier,
        
        // Game timing
        gameStartTime,
        
        // Audio settings
        musicEnabled,
        soundEffectsEnabled,
        
        // Game difficulty
        gameDifficulty,
        
        // Achievement banner tracking
        achievementsBannerShown: { ...achievementsBannerShown },
        
        // Market events
        marketBoomActive,
        marketCrashActive,
        flashSaleActive,
        greatDepressionActive,
        fastFingersActive,
        marketBoomEndTime,
        marketCrashEndTime,
        flashSaleEndTime,
        greatDepressionEndTime,
        fastFingersEndTime,
        eventCooldown,
        skipNextEventCheck,
        eventConfig: EVENT_CONFIG,
        
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
        
        // Restore properties
        if (gameState.properties) {
          Object.keys(gameState.properties).forEach(key => {
            if (properties.hasOwnProperty(key)) {
              properties[key] = gameState.properties[key];
            }
          });
        }
        
        // Restore net worth chart data
        if (gameState.netWorthHistory) {
          netWorthHistory = [...gameState.netWorthHistory];
        }
        
        // Restore event logs
        if (gameState.eventLogs) {
          eventLogs = [...gameState.eventLogs];
        }
        
        // Restore statistics
        totalClicks = gameState.totalClicks || 0;
        totalCriticalHits = gameState.totalCriticalHits || 0;
        totalDividendsReceived = gameState.totalDividendsReceived || 0;
        hasMadeFirstInvestment = gameState.hasMadeFirstInvestment || false;
        
        // Restore click streak
        streakCount = gameState.streakCount || 0;
        streakMultiplier = gameState.streakMultiplier || 1;
        
        // Restore prestige multipliers
        prestigeClickMultiplier = gameState.prestigeClickMultiplier || 1;
        prestigeInterestMultiplier = gameState.prestigeInterestMultiplier || 1;
        
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
        
        // Restore game timing (no offline earnings)
        gameStartTime = gameState.gameStartTime || Date.now();
        
        // Restore audio settings
        musicEnabled = gameState.musicEnabled !== undefined ? gameState.musicEnabled : true;
        soundEffectsEnabled = gameState.soundEffectsEnabled !== undefined ? gameState.soundEffectsEnabled : true;
        
        // Restore game difficulty
        gameDifficulty = gameState.gameDifficulty || DIFFICULTY_MODES.NORMAL;
        
        // Update difficulty selector UI
        if (difficultySelect) {
          difficultySelect.value = gameDifficulty;
        }
        
        // Restore achievement banner tracking
        achievementsBannerShown = gameState.achievementsBannerShown || {};
        
        // Restore market events
        marketBoomActive = gameState.marketBoomActive || false;
        marketCrashActive = gameState.marketCrashActive || false;
        flashSaleActive = gameState.flashSaleActive || false;
        greatDepressionActive = gameState.greatDepressionActive || false;
        fastFingersActive = gameState.fastFingersActive || false;
        marketBoomEndTime = gameState.marketBoomEndTime || 0;
        marketCrashEndTime = gameState.marketCrashEndTime || 0;
        flashSaleEndTime = gameState.flashSaleEndTime || 0;
        greatDepressionEndTime = gameState.greatDepressionEndTime || 0;
        fastFingersEndTime = gameState.fastFingersEndTime || 0;
        eventCooldown = gameState.eventCooldown || 0;
        skipNextEventCheck = gameState.skipNextEventCheck || false;
        
        // Restore event configuration
        if (gameState.eventConfig) {
          Object.assign(EVENT_CONFIG.eventCooldowns, gameState.eventConfig.eventCooldowns || {});
        }
        
        // Update interest rate color if market event is active
        updateInterestRateColor();
        
        // Update Flash Sale styling if active
        if (flashSaleActive) {
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
    renderStatistics();
    renderEventLogs();
    updateUpgradeIndicator();
    updatePortfolioIndicator();
        
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
      
      // Reset first investment tracking
      hasMadeFirstInvestment = false;
      
      // Reset market events
      marketBoomActive = false;
      marketCrashActive = false;
      flashSaleActive = false;
      greatDepressionActive = false;
      fastFingersActive = false;
      marketBoomEndTime = 0;
      marketCrashEndTime = 0;
      flashSaleEndTime = 0;
      greatDepressionEndTime = 0;
      fastFingersEndTime = 0;
      eventCooldown = 0;
      skipNextEventCheck = false;
      
      // Reset event cooldowns
      EVENT_CONFIG.eventCooldowns.marketBoom = 0;
      EVENT_CONFIG.eventCooldowns.marketCrash = 0;
      EVENT_CONFIG.eventCooldowns.flashSale = 0;
      EVENT_CONFIG.eventCooldowns.greatDepression = 0;
      EVENT_CONFIG.eventCooldowns.fastFingers = 0;
      EVENT_CONFIG.eventCooldowns.taxCollection = 0;
      EVENT_CONFIG.eventCooldowns.robbery = 0;
      EVENT_CONFIG.eventCooldowns.divorce = 0;
      
      // Reset properties
      properties = {
        parkingGarage: 0,
        apartment: 0,
        officeBuilding: 0
      };
      
      // Reset net worth chart data
      netWorthHistory = [];
      
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
    totalDividendsReceived = 0;
    streakCount = 0;
    streakMultiplier = 1;
    autoInvestEnabled = false;
    autoRentEnabled = false;
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
      message: 'Check out your Portfolio! View and manage all your properties and investments.',
      position: 'right'
    }
  ];
  

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
        panelsContainer.scrollLeft = panelWidth;
        
        // Wait for scroll to complete before showing tooltip
        setTimeout(() => {
          showTourTooltip(step, targetElement);
        }, 10);
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
        panelsContainer.scrollLeft = panelWidth * 2; // Third panel (index 2)
        
        // Wait for scroll to complete before showing tooltip
        setTimeout(() => {
          showPortfolioTooltip(step, targetElement);
        }, 10);
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
    if (totalClicksEl && numberAnimator) {
      const currentClicks = parseInt(totalClicksEl.textContent.replace(/,/g, '')) || 0;
      numberAnimator.animateValue(totalClicksEl, currentClicks, totalClicks, 600, (value) => new Intl.NumberFormat("en-US").format(Math.floor(value)));
    } else if (totalClicksEl) {
      totalClicksEl.textContent = new Intl.NumberFormat("en-US").format(totalClicks);
    }

    // Total critical hits
    const totalCriticalHitsEl = document.getElementById('totalCriticalHitsDisplay');
    if (totalCriticalHitsEl && numberAnimator) {
      const currentHits = parseInt(totalCriticalHitsEl.textContent.replace(/,/g, '')) || 0;
      numberAnimator.animateValue(totalCriticalHitsEl, currentHits, totalCriticalHits, 600, (value) => new Intl.NumberFormat("en-US").format(Math.floor(value)));
    } else if (totalCriticalHitsEl) {
      totalCriticalHitsEl.textContent = new Intl.NumberFormat("en-US").format(totalCriticalHits);
    }



    // Achievements unlocked
    const achievementsUnlockedEl = document.getElementById('achievementsUnlockedDisplay');
    if (achievementsUnlockedEl && numberAnimator) {
      const unlockedCount = Object.values(achievements).filter(ach => ach.unlocked).length;
      const currentUnlocked = parseInt(achievementsUnlockedEl.textContent.split('/')[0]) || 0;
      numberAnimator.animateValue(achievementsUnlockedEl, currentUnlocked, unlockedCount, 600, (value) => `${Math.floor(value)}/17`);
    } else if (achievementsUnlockedEl) {
      const unlockedCount = Object.values(achievements).filter(ach => ach.unlocked).length;
      achievementsUnlockedEl.textContent = `${unlockedCount}/17`;
    }
  }

  // Event logging functions
  function logEvent(eventName, eventType) {
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
      type: eventType
    });
    
    // Keep only the last 20 events
    if (eventLogs.length > 20) {
      eventLogs = eventLogs.slice(0, 20);
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
    
    eventLogsContent.innerHTML = eventLogs.map(event => `
      <div class="event-log-item ${event.type}">
        <span class="event-time">${event.time}</span>
        <span class="event-name">${event.name}</span>
      </div>
    `).join('');
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

  // Prestige system
  let prestigeClickMultiplier = 1;
  let prestigeInterestMultiplier = 1;

  // Automatic investments
  let autoInvestEnabled = false;
  
  // Automatic rent contribution
  let autoRentEnabled = false;

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
  let maxStreakReached = false;
  let totalDividendsReceived = 0;

  // Statistics tracking
  let gameStartTime = Date.now();
  let hasMadeFirstInvestment = false;
  
  const achievements = {
    ach1: { unlocked: false, condition: () => getTotalMoney() >= 1000 },
    ach2: { unlocked: false, condition: () => getTotalMoney() >= 10000 },
    ach3: { unlocked: false, condition: () => getTotalMoney() >= 1000000 },
    ach4: { unlocked: false, condition: () => getTotalMoney() >= 1000000000 },
    ach5: { unlocked: false, condition: () => getTotalMoney() >= 1000000000000 },
    ach6: { unlocked: false, condition: () => totalClicks >= 1000 },
    ach7: { unlocked: false, condition: () => totalCriticalHits >= 100 },
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

  // Money cap system
  const MAX_TOTAL_MONEY = 1000000000000000; // 100 trillion euros

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

  function applyMoneyCap(amountToAdd) {
    const currentTotal = getTotalMoney();
    const newTotal = currentTotal + amountToAdd;
    
    if (newTotal <= MAX_TOTAL_MONEY) {
      return amountToAdd; // No cap needed
    } else {
      const cappedAmount = Math.max(0, MAX_TOTAL_MONEY - currentTotal);
      return cappedAmount; // Only add what fits
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

  function playCriticalCoinSound() {
    if (!soundEnabled || !audioContext || !soundEffectsEnabled) return;
    
    // Ensure audio context is resumed for iOS PWA
    resumeAudioContext();
    
    // Create a more metallic, coin-like sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Lower frequency for more metallic sound
    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.15);
    
    // Higher gain for more prominent sound
    gainNode.gain.setValueAtTime(0.6, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.15);
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
    console.log('playErrorSound called:', { soundEnabled, audioContext: !!audioContext, soundEffectsEnabled });
    if (!soundEnabled || !audioContext || !soundEffectsEnabled) {
      console.log('playErrorSound blocked by conditions');
      return;
    }
    
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

  function playTierUpgradeSound() {
    if (!soundEnabled || !audioContext || !soundEffectsEnabled) return;
    
    // Ensure audio context is resumed for iOS PWA
    resumeAudioContext();
    
    try {
      // Create a celebratory ascending chord sequence
      const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5 (C major chord)
      
      frequencies.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + index * 0.1);
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime + index * 0.1);
        gainNode.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + index * 0.1 + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * 0.1 + 0.8);
        
        oscillator.start(audioContext.currentTime + index * 0.1);
        oscillator.stop(audioContext.currentTime + index * 0.1 + 0.8);
      });
    } catch (error) {
      console.log('Tier upgrade sound error:', error);
    }
  }

  // Centralized upgrade configuration
  // To add a new upgrade: Add an entry with id, cost, name, effect, and type
  // To remove an upgrade: Delete the entry from this object
  // Types: "click", "interest", "dividend", "dividend_speed", "dividend_rate", "unlock", "prestige", "special"
  //
  // Example of adding a new upgrade:
  // 1. Add to UPGRADE_CONFIG: u32: { cost: 1000, name: "New Upgrade", effect: "Does something", type: "click" }
  // 2. Add HTML to index.html: <div class="upgrade" data-upgrade-id="u32">...</div>
  // 3. Add logic in getPerClickIncome() or getCompoundMultiplierPerTick() if needed
  // That's it! Everything else is automatic.
  const UPGRADE_CONFIG = {
    u1: { cost: 10, name: "Finish elementary school", effect: "Adds +1 euro per click", type: "click" },
    u3: { cost: 50, name: "Finish high school", effect: "Adds +6 euros per click", type: "click" },
    u4: { cost: 6000, name: "Better credit score", effect: "Increases investment interest by 20%", type: "interest" },
    u5: { cost: 200, name: "Higher Education", effect: "Adds +30 euros per click", type: "click" },
    u8: { cost: 15000, name: "Create a network of influenced people", effect: "Increases investment interest by 15%", type: "interest" },
    u9: { cost: 250000, name: "Befriend a banker", effect: "Increases investment interest by 15%", type: "interest" },
    u10: { cost: 4000, name: "Dividends", effect: "Generate 1% dividend every 10 seconds", type: "dividend" },
    u11: { cost: 50, name: "Investment", effect: "Unlocks the investment account", type: "unlock" },
    u12: { cost: 8000, name: "Turbo Dividends", effect: "Speed up dividends by 20%", type: "dividend_speed" },
    u13: { cost: 30000, name: "Mega Dividends", effect: "Increase dividend rate by 25%", type: "dividend_rate" },
    u14: { cost: 300000, name: "Premium Dividends", effect: "Increases dividend rate by 20%", type: "dividend_rate" },
    u17: { cost: 2000000, name: "Elite Dividends", effect: "Increases dividend rate by 25%", type: "dividend_rate" },
    u19: { cost: 10000000, name: "Prime Interest", effect: "Increases interest rate by 15%", type: "interest" },
    u26: { cost: 1000000000000, name: "Prestige Reset", effect: "Reset everything for permanent +25% interest and click multipliers", type: "prestige" },
    u27: { cost: 3500000, name: "Automated Investments", effect: "Unlocks automatic investment of dividends into investment account", type: "unlock" },
    u29: { cost: 1000, name: "Critical Hits", effect: "15% chance for 5x click revenue", type: "special" },
    u30: { cost: 3500, name: "Click Streak", effect: "Build click streaks for temporary multipliers (1x to 3x)", type: "special" },
    u31: { cost: 75000, name: "Strong Credit Score", effect: "Increases interest rate by 10%", type: "interest" },
    u32: { cost: 5000000, name: "Automated Rent Collection", effect: "Unlocks automatic investment of property income into investment account", type: "unlock" },
    u33: { cost: 50000, name: "Real Estate Connections", effect: "Reduces building purchase costs by 15%", type: "building_discount" },
    u34: { cost: 750000, name: "Hire a contractor", effect: "Reduces building purchase costs by an additional 20%", type: "building_discount" },
    u35: { cost: 1250000, name: "Property Management", effect: "Increases rent income from properties by 35%", type: "rent_boost" },
    u36: { cost: 7500, name: "Market awareness", effect: "Reduces the prices of properties by 10%", type: "building_discount" },
    u37: { cost: 6000000, name: "Rental Monopoly", effect: "Increases the rent collected from properties by 20%", type: "rent_boost" }
  };

  // Generate upgrade costs and owned objects from config
  const UPGRADE_COSTS = Object.fromEntries(
    Object.entries(UPGRADE_CONFIG).map(([id, config]) => [id, config.cost])
  );
  
  const owned = Object.fromEntries(
    Object.keys(UPGRADE_CONFIG).map(id => [id, false])
  );

  function tryBuyUpgrade(key) {
    if (owned[key]) return;
    let cost = UPGRADE_COSTS[key];
    
    // Apply Flash Sale discount
    if (flashSaleActive) {
      cost = cost * 0.75; // 25% off
    }
    
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
        
        // Create prestige reset particle effects
        if (particleSystem) {
          const centerX = window.innerWidth / 2;
          const centerY = window.innerHeight / 2;
          
          // Create massive particle celebration
          particleSystem.createRareAchievementParticles(centerX, centerY, 50);
          particleSystem.createFireworkParticles(centerX, centerY, 25);
          particleSystem.createGoldenParticles(centerX, centerY, 20);
          particleSystem.createMilestoneParticles(centerX, centerY, 30);
          
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
        renderPrestigeMultipliers();
        sortUpgradesByCost();
        renderInvestmentUnlocked();
        renderInterestPerSecond();
        renderDividendUI(0);
        renderAutoInvestSection();
        
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
    
    // Create upgrade particle effects
    if (particleSystem) {
      const buyButton = document.getElementById(`buy${key.charAt(0).toUpperCase() + key.slice(1)}Btn`);
      if (buyButton) {
        const rect = buyButton.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Create upgrade particles
        particleSystem.createUpgradeParticles(centerX, centerY, 3);
        
        // Create confetti for expensive upgrades
        if (cost >= 10000) {
          particleSystem.createConfettiParticles(centerX, centerY, 6);
        }
        
        // Create money gain particles
        particleSystem.createMoneyGainParticles(centerX, centerY, cost);
      }
    }
    
    // Force immediate balance animation for purchase feedback
    if (numberAnimator) {
      if (currentDisplay) {
        const currentValue = parseDisplayedValue(currentDisplay.textContent);
        numberAnimator.forceAnimateValue(currentDisplay, currentValue, currentAccountBalance, 250, (value) => '€' + formatNumberShort(value));
      }
      if (headerCurrentDisplay) {
        const headerCurrentValue = parseDisplayedValue(headerCurrentDisplay.textContent);
        numberAnimator.forceAnimateValue(headerCurrentDisplay, headerCurrentValue, currentAccountBalance, 250, (value) => '€' + formatNumberShort(value));
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
    
    // Play buy sound
    playBuySound();
    
    // Check achievements
    checkAchievementsOptimized();
    
    // Save game state after upgrade purchase
    saveGameState();
  }

  // Automatically add event listeners for all upgrade buy buttons
  Object.keys(UPGRADE_CONFIG).forEach(id => {
    const buyBtn = document.getElementById(`buy${id.charAt(0).toUpperCase() + id.slice(1)}Btn`);
    if (buyBtn) {
      buyBtn.addEventListener("click", () => tryBuyUpgrade(id));
    }
  });

  // Auto-invest toggle event listener
  if (autoInvestToggle) {
    autoInvestToggle.addEventListener("change", handleAutoInvestToggle);
  }
  
  // Auto-rent toggle event listener
  if (autoRentToggle) {
    autoRentToggle.addEventListener("change", handleAutoRentToggle);
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

  // Game loop (1000 ms): compounding and leaderboard - reduced frequency for mobile performance
  const TICK_MS = 1000;
  // Base compound multiplier per tick - varies by difficulty
  function getBaseCompoundMultiplierPerTick() {
    switch (gameDifficulty) {
      case 'easy': return 1.005;    // 0.5% per second (easier)
      case 'normal': return 1.004;  // 0.4% per second (original)
      case 'hard': return 1.0033;   // 0.35% per second (harder)
      case 'extreme': return 1.0027; // 0.3% per second (extreme)
      default: return 1.004;        // fallback to normal
    }
  }
  function getCompoundMultiplierPerTick() {
    let rateBoost = 1;
    if (owned.u4) rateBoost *= 1.2; // +20%
    if (owned.u8) rateBoost *= 1.15; // +15%
    if (owned.u9) rateBoost *= 1.15; // +15%
    if (owned.u19) rateBoost *= 1.15; // +15%
    if (owned.u20) rateBoost *= 1.15; // +15%
    if (owned.u31) rateBoost *= 1.1; // +10%
    if (owned.u32) rateBoost *= 1.1; // +10% (Negotiation)
    
    // Market event effects
    if (marketBoomActive) {
      rateBoost *= 1.5; // +50% during boom
    } else if (marketCrashActive) {
      rateBoost *= 0.3; // -70% during crash
    } else if (greatDepressionActive) {
      rateBoost *= -0.2; // -120% during depression (negative rate = money shrinking)
    }
    
    return 1 + (getBaseCompoundMultiplierPerTick() - 1) * rateBoost * prestigeInterestMultiplier;
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

  // Check if any buildings are available and update portfolio indicator
  function updatePortfolioIndicator() {
    const indicator = document.getElementById('portfolioIndicator');
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
      const aCost = UPGRADE_CONFIG[aId]?.cost ?? Number.MAX_SAFE_INTEGER;
      const bCost = UPGRADE_CONFIG[bId]?.cost ?? Number.MAX_SAFE_INTEGER;
      return aCost - bCost;
    });
    rows.forEach((row) => scrollableContent.appendChild(row));

    const hideCompleted = container.classList.contains('hide-completed');
    
    if (hideCompleted) {
      // Show all unowned upgrades
      rows.forEach((row) => {
        const id = row.getAttribute('data-upgrade-id');
        row.style.display = !owned[id] ? '' : 'none';
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
  let dividendAnimationId = null;

  function tickDividends(deltaMs) {
    if (!owned.u10) {
      // console.log('Dividends not owned (u10), skipping');
      return;
    }
    dividendElapsed += deltaMs;
    
    // Calculate speed multipliers (stack multiplicatively)
    let speedMultiplier = 1;
    if (owned.u12) speedMultiplier *= 0.8; // 20% faster
    
    // Calculate rate multipliers (stack multiplicatively)
    let rateMultiplier = 1;
    if (owned.u13) rateMultiplier *= 1.25; // 25% more
    if (owned.u14) rateMultiplier *= 1.2;  // 20% more
    if (owned.u17) rateMultiplier *= 1.25; // 25% more
    
    // Market event effects on dividend rate
    if (marketBoomActive) {
      rateMultiplier *= 1.5; // +50% during boom
    } else if (marketCrashActive) {
      rateMultiplier *= 0.3; // -70% during crash
    } else if (greatDepressionActive) {
      rateMultiplier = 0; // No dividends during depression (0% rate)
    }
    
    const interval = Math.floor(BASE_DIVIDEND_INTERVAL_MS * speedMultiplier);
    const rate = BASE_DIVIDEND_RATE * rateMultiplier;
    
    
    if (dividendElapsed >= interval) {
      dividendElapsed -= interval;
      const payout = Math.floor(investmentAccountBalance * rate * 100) / 100;
      
      
      if (payout > 0) {
        const cappedPayout = applyMoneyCap(payout);
        
        if (cappedPayout <= 0) {
          return;
        }
        
        // Track total dividends received for achievement
        totalDividendsReceived += cappedPayout;
        
        // Create flying money particles for dividend payout
        if (particleSystem && particleSystem.createMoneyParticles) {
          const dividendCircle = document.getElementById('dividendCircle');
          if (dividendCircle) {
            const rect = dividendCircle.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            // Create money particles from the dividend circle
            particleSystem.createMoneyGainParticles(centerX, centerY, Math.min(cappedPayout / 2000000, 6));
          }
        }
        
        if (autoInvestEnabled) {
          // Auto-invest: add dividends to investment account
          investmentAccountBalance += cappedPayout;
        } else {
          // Normal: add dividends to current account
          currentAccountBalance += cappedPayout;
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
      if (owned.u12) speedMultiplier *= 0.8;
      
      const interval = Math.floor(BASE_DIVIDEND_INTERVAL_MS * speedMultiplier);
    
    // Use the same dividendElapsed variable as the payout logic for synchronization
    const timeInCycle = dividendElapsed % interval;
    const remaining = Math.ceil((interval - timeInCycle) / 1000);
    const percent = timeInCycle / interval;
      const dashOffset = 100 - percent * 100;
    
    // Update countdown timer smoothly
    const countdownEl = document.getElementById('dividendCountdown');
    if (countdownEl) {
      countdownEl.textContent = `${remaining}s`;
    }
    
    // Update circle fill smoothly
    const circleFill = document.querySelector('.dividend-circle .circle-fill');
    if (circleFill) {
      circleFill.setAttribute('stroke-dashoffset', String(dashOffset));
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
      if (owned.u12) speedMultiplier *= 0.8;
      
      let rateMultiplier = 1;
      if (owned.u13) rateMultiplier *= 1.25;
      if (owned.u14) rateMultiplier *= 1.2;
      if (owned.u17) rateMultiplier *= 1.25;
      
      // Market event effects on dividend rate
      if (marketBoomActive) {
        rateMultiplier *= 1.5; // +50% during boom
      } else if (marketCrashActive) {
        rateMultiplier *= 0.3; // -70% during crash
      } else if (greatDepressionActive) {
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
        numberAnimator.animateValue(dividendAmountEl, currentAmount, dividendAmount, 250, (value) => '€' + formatNumberShort(value));
      } else {
        dividendAmountEl.textContent = '€' + formatNumberShort(dividendAmount);
      }
    }
  }

  function renderInvestmentUnlocked() {
    if (!investSection) return;
    investSection.classList.toggle('hidden', !owned.u11);
    
    // Show/hide the entire earnings metrics container when investment is unlocked
    const earningsMetricsContainer = document.querySelector('.earnings-metrics-container');
    if (earningsMetricsContainer) {
      earningsMetricsContainer.classList.toggle('hidden', !owned.u11);
    }
    
    // Show/hide the investment amount in the header when investment is unlocked
    const headerInvestmentDisplay = document.getElementById('headerInvestmentDisplay');
    if (headerInvestmentDisplay) {
      headerInvestmentDisplay.classList.toggle('hidden', !owned.u11);
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
      prestigeMultiplierEl.textContent = `Multiplier: ${displayMultiplier.toFixed(2)}x`;
    }
  }

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

  function handleAutoRentToggle() {
    if (!autoRentToggle) return;
    autoRentEnabled = autoRentToggle.checked;
    saveGameState();
  }


  setInterval(() => {
    // Investment compounding: multiply per tick, boosted by upgrades
    if (investmentAccountBalance > 0) {
      const grown = investmentAccountBalance * getCompoundMultiplierPerTick();
      const growth = grown - investmentAccountBalance;
      const cappedGrowth = applyMoneyCap(growth);
      investmentAccountBalance = Math.round((investmentAccountBalance + cappedGrowth) * 100) / 100;
    }

    // Property income
    const propertyIncome = getTotalPropertyIncome();
    if (propertyIncome > 0) {
      const cappedPropertyIncome = applyMoneyCap(propertyIncome);
      
      if (autoRentEnabled) {
        // Auto-rent: add property income to investment account
        investmentAccountBalance = Math.round((investmentAccountBalance + cappedPropertyIncome) * 100) / 100;
      } else {
        // Normal: add property income to current account
      currentAccountBalance = Math.round((currentAccountBalance + cappedPropertyIncome) * 100) / 100;
      }
    }

    // Dividends
    tickDividends(TICK_MS);

    renderBalances();
    renderUpgradesOwned();
    renderDividendUI(TICK_MS);
    renderAllProperties();
    renderInvestmentUnlocked();
    renderPrestigeMultipliers();
    renderAutoInvestSection();
    renderAutoRentSection();
    renderClickStreak();
    updateActiveEventDisplay();
    checkExpiredEvents(); // Check for expired events immediately
    checkStreakTimeout();
    updateUpgradeIndicator();
    updatePortfolioIndicator();
    updateProgressBars();
    checkAchievementsOptimized(); // Use optimized version (every 5 seconds)
    renderStatistics();
    
    
    // Check tour triggers
    checkTourTriggers();
    
    // Check portfolio tour (independent)
    checkPortfolioTour();
  }, TICK_MS);

  // Net worth data collection (every 5 seconds)
  setInterval(() => {
    addNetWorthDataPoint();
  }, DATA_COLLECTION_INTERVAL);
  
  // Events check every 10 seconds - reduced frequency for mobile performance
  setInterval(() => {
    checkEvents();
  }, 10000);

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
  // Initialize upgrade visibility state before rendering
  initUpgradeVisibility();
  updateToggleCompletedUI();

  renderBalances();
  renderUpgradesOwned();
  renderUpgradePrices();
  renderAllProperties();
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
  
  // Initialize net worth chart
  initNetWorthChart();
  
  // Add initial data point
  addNetWorthDataPoint();
  renderAchievements();
  renderStatistics();
    renderEventLogs();
  updateUpgradeIndicator();
    updatePortfolioIndicator();
  }

  // Show loading screen and initialize game after 2 seconds
  showLoadingScreen();
  setTimeout(() => {
    initializeGame();
    hideLoadingScreen();
  }, 2000);
  
  // Settings panel functionality
  const settingsToggle = document.getElementById('settingsToggle');
  const settingsMenu = document.getElementById('settingsMenu');
  const musicToggle = document.getElementById('musicToggle');
  const soundEffectsToggle = document.getElementById('soundEffectsToggle');

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

  // Cheat system variables
  let cheatToggleCount = 0;
  let lastToggleTime = 0;
  const cheatSection = document.getElementById('cheatSection');
  const addMoneyBtn = document.getElementById('addMoneyBtn');

  // Sound effects toggle functionality
  if (soundEffectsToggle) {
    soundEffectsToggle.addEventListener('change', (e) => {
      soundEffectsEnabled = e.target.checked;
      saveAudioSettings();
      
      // Handle cheat activation
      handleCheatToggle();
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
    // Apply 10x multiplier to click income
    prestigeClickMultiplier *= 10;
    
    // Create celebration particles
    if (particleSystem) {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      // Create golden money particles
      particleSystem.createGoldenParticles(centerX, centerY, 30);
      particleSystem.createMilestoneParticles(centerX, centerY, 20);
      
      // Screen effects
      screenFlash('#ffd700', 600); // Golden flash
      screenShake(8, 400); // Gentle shake
    }
    
    // Play success sound
    if (soundEnabled && soundEffectsEnabled) {
      playSuccessSound();
    }
    
    // Update UI
    updateUI();
    
    // Hide the cheat button after use
    hideCheatButton();
  }

  // Difficulty selector functionality
  const difficultySelect = document.getElementById('difficultySelect');
  if (difficultySelect) {
    difficultySelect.addEventListener('change', (e) => {
      gameDifficulty = e.target.value;
      saveGameState();
      console.log('Game difficulty changed to:', gameDifficulty);
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

// Handle app visibility changes (pause music when app goes to background)
function handleVisibilityChange() {
  if (document.hidden) {
    // App went to background - pause music and animations
    if (backgroundMusic && !backgroundMusic.paused) {
      backgroundMusic.pause();
      // console.log('Music paused - app went to background');
    }
    // Stop dividend animation to save resources
    if (dividendAnimationId) {
      cancelAnimationFrame(dividendAnimationId);
      dividendAnimationId = null;
    }
  } else {
    // App came to foreground - resume music if it was enabled
    if (backgroundMusic && musicEnabled && backgroundMusic.paused) {
      backgroundMusic.play().catch((error) => {
        console.log('Could not resume music:', error);
      });
      // console.log('Music resumed - app came to foreground');
    }
    // Restart dividend animation if dividends are enabled
    if (owned.u10 && !dividendAnimationId) {
      animateDividendTimer();
    }
  }
}

// Add event listener for visibility changes
document.addEventListener('visibilitychange', handleVisibilityChange);

// Handle page focus/blur events as backup
window.addEventListener('blur', () => {
  if (backgroundMusic && !backgroundMusic.paused) {
    backgroundMusic.pause();
    // console.log('Music paused - window lost focus');
  }
  // Stop dividend animation to save resources
  if (dividendAnimationId) {
    cancelAnimationFrame(dividendAnimationId);
    dividendAnimationId = null;
  }
});

window.addEventListener('focus', () => {
  if (backgroundMusic && musicEnabled && backgroundMusic.paused) {
    backgroundMusic.play().catch((error) => {
      console.log('Could not resume music on focus:', error);
    });
    // console.log('Music resumed - window gained focus');
  }
  // Restart dividend animation if dividends are enabled
  if (owned.u10 && !dividendAnimationId) {
    animateDividendTimer();
  }
});

// Handle mobile app lifecycle events (for PWA)
document.addEventListener('pause', () => {
  if (backgroundMusic && !backgroundMusic.paused) {
    backgroundMusic.pause();
    // console.log('Music paused - app paused (mobile)');
  }
  // Stop dividend animation to save resources
  if (dividendAnimationId) {
    cancelAnimationFrame(dividendAnimationId);
    dividendAnimationId = null;
  }
});

document.addEventListener('resume', () => {
  if (backgroundMusic && musicEnabled && backgroundMusic.paused) {
    backgroundMusic.play().catch((error) => {
      console.log('Could not resume music on resume:', error);
    });
    // console.log('Music resumed - app resumed (mobile)');
  }
  // Restart dividend animation if dividends are enabled
  if (owned.u10 && !dividendAnimationId) {
    animateDividendTimer();
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
    // console.log('Music paused - app closing');
  }
});

  
  // Console debugging functions
  function addMoney(amount) {
    if (typeof amount !== 'number' || amount <= 0) {
      console.log('❌ Invalid amount. Please provide a positive number.');
      return;
    }
    
    const cappedAmount = applyMoneyCap(amount);
    currentAccountBalance += cappedAmount;
    
    // Force immediate UI update
    renderBalances();
    
    console.log(`💰 Added €${formatNumberShort(cappedAmount)} to current account!`);
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
    // Cap the amount to the maximum allowed money cap
    const cappedAmount = Math.min(amount, MAX_TOTAL_MONEY);
    currentAccountBalance = cappedAmount;
    
    // Force immediate UI update
    renderBalances();
    
    console.log(`💳 Balance set to €${formatNumberShort(cappedAmount)}!`);
    if (oldBalance !== cappedAmount) {
      const difference = cappedAmount - oldBalance;
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

  // Auto Rent Help Modal functionality
  if (autoRentHelpBtn && autoRentModal) {
    autoRentHelpBtn.addEventListener('click', (e) => {
      e.stopPropagation();
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
  
  // Initialize audio on first user interaction
  initAudio();
  
  // Initialize background music immediately when page loads
  initBackgroundMusic();
  
  // Initialize particle system
  particleSystem = new ParticleSystem();
  
  // Initialize number animator
  numberAnimator = new NumberAnimator();
  
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
  
  // Load saved tour state (disabled - keeping for future use)
  // loadTourState();
  
  // Load saved game state
  const gameStateLoaded = loadGameState();
  
  // Initialize achievementsBannerShown for already unlocked achievements (prevent notifications on load)
  if (gameStateLoaded) {
    for (const [achievementId, achievement] of Object.entries(achievements)) {
      if (achievement.unlocked && !achievementsBannerShown[achievementId]) {
        achievementsBannerShown[achievementId] = true;
      }
    }
  }
  
  // Update buy multiplier display after game state is loaded
  updateBuyMultiplierDisplay();
  
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
        numberAnimator.animateValue(interestPerSecondEl, currentEarnings, earningsPerSecond, 250, (value) => '€' + formatNumberShort(value) + '/sec');
      } else {
        interestPerSecondEl.textContent = '€' + formatNumberShort(earningsPerSecond) + '/sec';
      }
    }
    
    
    // Update market event styling
    const interestRow = document.getElementById('interestContainer');
    if (interestRow) {
      interestRow.classList.remove('market-boom', 'market-crash');
      if (marketBoomActive) {
        interestRow.classList.add('market-boom');
      } else if (marketCrashActive) {
        interestRow.classList.add('market-crash');
      }
    }
  }

  // Initialize interest per second display and set up periodic updates
  (function initInterestPerSecond() {
    if (!interestPerSecEl) return;
    const update = () => {
      renderInterestPerSecond();
    };
    update();
    // Recompute periodically to reflect upgrades - reduced frequency for mobile performance
    setInterval(update, 2000);
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

// Initialize PWA functionality when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initPWAInstallPrompt();
  initPWASpecificFeatures();
});
