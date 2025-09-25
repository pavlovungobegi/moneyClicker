(() => {
  let currentAccountBalance = 0;
  let investmentAccountBalance = 0;

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
    
    createCoinParticles(x, y, count = 5) {
      for (let i = 0; i < count; i++) {
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
    
    createSparkleParticles(x, y, count = 8) {
      for (let i = 0; i < count; i++) {
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
    
    createUpgradeParticles(x, y, count = 10) {
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
    
    createConfettiParticles(x, y, count = 15) {
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
      const count = Math.min(20, Math.max(5, Math.floor(amount / 1000)));
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
    
    createFireworkParticles(x, y, count = 25) {
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
    
    createGoldenParticles(x, y, count = 20) {
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
    
    createMilestoneParticles(x, y, count = 30) {
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
    
    createRareAchievementParticles(x, y, count = 40) {
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
  let marketBoomEndTime = 0;
  let marketCrashEndTime = 0;
  let flashSaleEndTime = 0;
  let greatDepressionEndTime = 0;
  let eventCooldown = 0;
  
  // Active event display elements
  let activeEventDisplay = null;
  let eventIcon = null;
  let eventName = null;
  let eventTimer = null;
  
  // Event system configuration
  const EVENT_CONFIG = {
    // Event probabilities (per check)
    probabilities: {
      marketBoom: 0.08,    // 4% chance
      marketCrash: 0.08,   // 4% chance  
      flashSale: 0.03,     // 2% chance
      greatDepression: 0.03 // 1% chance
    },
    
    // Event durations (milliseconds)
    durations: {
      marketBoom: 30000,    // 30 seconds
      marketCrash: 30000,   // 30 seconds
      flashSale: 30000,     // 30 seconds
      greatDepression: 30000 // 30 seconds
    },
    
    // Event cooldowns (milliseconds)
    cooldowns: {
      marketBoom: 60000,    // 1 minute
      marketCrash: 60000,   // 1 minute
      flashSale: 180000,    // 3 minutes
      greatDepression: 60000 // 1 minute
    },
    
    // Event-specific cooldowns
    eventCooldowns: {
      marketBoom: 0,
      marketCrash: 0,
      flashSale: 0,
      greatDepression: 0
    }
  };
  
  // Event Functions
  function triggerMarketBoom() {
    if (marketBoomActive || marketCrashActive || flashSaleActive || greatDepressionActive) return; // Don't trigger if any event is active
    
    marketBoomActive = true;
    marketBoomEndTime = Date.now() + EVENT_CONFIG.durations.marketBoom;
    EVENT_CONFIG.eventCooldowns.marketBoom = Date.now() + EVENT_CONFIG.cooldowns.marketBoom;
    
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
  }
  
  function triggerMarketCrash() {
    if (marketBoomActive || marketCrashActive || flashSaleActive || greatDepressionActive) return; // Don't trigger if any event is active
    
    marketCrashActive = true;
    marketCrashEndTime = Date.now() + EVENT_CONFIG.durations.marketCrash;
    EVENT_CONFIG.eventCooldowns.marketCrash = Date.now() + EVENT_CONFIG.cooldowns.marketCrash;
    
    // Calculate 20% loss
    const lossAmount = investmentAccountBalance * 0.2;
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
  }
  
  function triggerFlashSale() {
    if (marketBoomActive || marketCrashActive || flashSaleActive || greatDepressionActive) return; // Don't trigger if any event is active
    
    flashSaleActive = true;
    flashSaleEndTime = Date.now() + EVENT_CONFIG.durations.flashSale;
    EVENT_CONFIG.eventCooldowns.flashSale = Date.now() + EVENT_CONFIG.cooldowns.flashSale;
    
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
  }
  
  function triggerGreatDepression() {
    if (marketBoomActive || marketCrashActive || flashSaleActive || greatDepressionActive) return; // Don't trigger if any event is active
    
    greatDepressionActive = true;
    greatDepressionEndTime = Date.now() + EVENT_CONFIG.durations.greatDepression;
    EVENT_CONFIG.eventCooldowns.greatDepression = Date.now() + EVENT_CONFIG.cooldowns.greatDepression;
    
    // Calculate 50% loss
    const lossAmount = investmentAccountBalance * 0.5;
    investmentAccountBalance -= lossAmount;
    
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
  }
  
  function checkEvents() {
    const now = Date.now();
    
    // Check if events should end
    if (marketBoomActive && now >= marketBoomEndTime) {
      marketBoomActive = false;
      updateInterestRateColor();
      updateDividendRateColor();
      renderDividendUI(0); // Update dividend display
      showEventNotification("📈 Boom Ended", "Interest & dividend rates returned to normal", "boom-end");
      updateActiveEventDisplay();
    }
    
    if (marketCrashActive && now >= marketCrashEndTime) {
      marketCrashActive = false;
      updateInterestRateColor();
      updateDividendRateColor();
      renderDividendUI(0); // Update dividend display
      showEventNotification("📉 Crash Ended", "Interest & dividend rates returned to normal", "crash-end");
      updateActiveEventDisplay();
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
    }
    
    if (greatDepressionActive && now >= greatDepressionEndTime) {
      greatDepressionActive = false;
      updateInterestRateColor();
      updateDividendRateColor();
      renderDividendUI(0); // Update dividend display
      showEventNotification("💀 Depression Ended", "Interest rates returned to normal, dividends resumed", "depression-end");
      updateActiveEventDisplay();
    }
    
    // Check for new events (only one event can be active at a time)
    const anyEventActive = marketBoomActive || marketCrashActive || flashSaleActive || greatDepressionActive;
    
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
      
      // Calculate cumulative probabilities
      const boomProb = EVENT_CONFIG.probabilities.marketBoom;
      const crashProb = EVENT_CONFIG.probabilities.marketCrash;
      const saleProb = EVENT_CONFIG.probabilities.flashSale;
      const depressionProb = EVENT_CONFIG.probabilities.greatDepression;
      const totalProb = boomProb + crashProb + saleProb + depressionProb;
      
      console.log('🎲 Event Roll:', {
        roll: eventRoll,
        probabilities: {
          marketBoom: `0.00-${boomProb} (${(boomProb * 100).toFixed(1)}%)`,
          marketCrash: `${boomProb}-${boomProb + crashProb} (${(crashProb * 100).toFixed(1)}%)`,
          flashSale: `${boomProb + crashProb}-${boomProb + crashProb + saleProb} (${(saleProb * 100).toFixed(1)}%)`,
          greatDepression: `${boomProb + crashProb + saleProb}-${totalProb} (${(depressionProb * 100).toFixed(1)}%)`,
          nothing: `${totalProb}-1.00 (${((1 - totalProb) * 100).toFixed(1)}%)`
        },
        cooldownChecks: {
          marketBoom: now >= EVENT_CONFIG.eventCooldowns.marketBoom,
          marketCrash: now >= EVENT_CONFIG.eventCooldowns.marketCrash,
          flashSale: now >= EVENT_CONFIG.eventCooldowns.flashSale,
          greatDepression: now >= EVENT_CONFIG.eventCooldowns.greatDepression
        }
      });
      
      // Market Boom
      if (now >= EVENT_CONFIG.eventCooldowns.marketBoom && eventRoll < boomProb) {
        console.log('🎯 TRIGGERING: Market Boom!');
        triggerMarketBoom();
      }
      // Market Crash  
      else if (now >= EVENT_CONFIG.eventCooldowns.marketCrash && eventRoll >= boomProb && eventRoll < boomProb + crashProb) {
        console.log('🎯 TRIGGERING: Market Crash!');
        triggerMarketCrash();
      }
      // Flash Sale
      else if (now >= EVENT_CONFIG.eventCooldowns.flashSale && eventRoll >= boomProb + crashProb && eventRoll < boomProb + crashProb + saleProb) {
        console.log('🎯 TRIGGERING: Flash Sale!');
        triggerFlashSale();
      }
      // Great Depression
      else if (now >= EVENT_CONFIG.eventCooldowns.greatDepression && eventRoll >= boomProb + crashProb + saleProb && eventRoll < totalProb) {
        console.log('🎯 TRIGGERING: Great Depression!');
        triggerGreatDepression();
      }
      // Nothing happens
      else {
        console.log(`🎲 Result: Nothing triggered (${((1 - totalProb) * 100).toFixed(1)}% chance)`);
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
    
    // Create particle effects
    if (particleSystem && clickBtn) {
      const rect = clickBtn.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Create coin particles
      particleSystem.createCoinParticles(centerX, centerY, isCritical ? 8 : 5);
      
      // Create sparkle particles
      particleSystem.createSparkleParticles(centerX, centerY, isCritical ? 12 : 8);
      
      // Screen shake for critical hits
      if (isCritical) {
        screenShake(8, 300);
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
        particleSystem.createUpgradeParticles(centerX, centerY, 8);
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
        particleSystem.createSparkleParticles(centerX, centerY, 6);
      }
    }
    
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
      
      if (milestoneAchievements.includes(achievementId)) {
        // Money milestone achievements - golden particles + fireworks
        particleSystem.createGoldenParticles(centerX, centerY, 25);
        particleSystem.createFireworkParticles(centerX, centerY, 30);
        screenFlash('#FFD700', 400); // Golden flash
        screenShake(6, 250); // Gentle shake
        
      } else if (clickAchievements.includes(achievementId)) {
        // Click achievements - sparkles + confetti
        particleSystem.createSparkleParticles(centerX, centerY, 20);
        particleSystem.createConfettiParticles(centerX, centerY, 25);
        screenFlash('#FF6B6B', 300); // Red flash
        
      } else if (rareAchievements.includes(achievementId)) {
        // Rare achievements - multiple bursts + screen effects
        particleSystem.createRareAchievementParticles(centerX, centerY, 50);
        screenFlash('#9B59B6', 500); // Purple flash
        screenShake(10, 400); // Strong shake
        
      } else if (upgradeAchievements.includes(achievementId)) {
        // Upgrade achievements - upgrade particles + milestone particles
        particleSystem.createUpgradeParticles(centerX, centerY, 15);
        particleSystem.createMilestoneParticles(centerX, centerY, 20);
        screenFlash('#3498DB', 350); // Blue flash
        
      } else {
        // Default achievement effects
        particleSystem.createConfettiParticles(centerX, centerY, 20);
        particleSystem.createSparkleParticles(centerX, centerY, 15);
        particleSystem.createUpgradeParticles(centerX, centerY, 12);
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
        hasMadeFirstInvestment,
        
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
        
        // Market events
        marketBoomActive,
        marketCrashActive,
        flashSaleActive,
        greatDepressionActive,
        marketBoomEndTime,
        marketCrashEndTime,
        flashSaleEndTime,
        greatDepressionEndTime,
        eventCooldown,
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
        
        // Restore statistics
        totalClicks = gameState.totalClicks || 0;
        totalCriticalHits = gameState.totalCriticalHits || 0;
        totalUpgradesBought = gameState.totalUpgradesBought || 0;
        hasPerformedPrestige = gameState.hasPerformedPrestige || false;
        prestigeResets = gameState.prestigeResets || 0;
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
        
        // Restore market events
        marketBoomActive = gameState.marketBoomActive || false;
        marketCrashActive = gameState.marketCrashActive || false;
        flashSaleActive = gameState.flashSaleActive || false;
        greatDepressionActive = gameState.greatDepressionActive || false;
        marketBoomEndTime = gameState.marketBoomEndTime || 0;
        marketCrashEndTime = gameState.marketCrashEndTime || 0;
        flashSaleEndTime = gameState.flashSaleEndTime || 0;
        greatDepressionEndTime = gameState.greatDepressionEndTime || 0;
        eventCooldown = gameState.eventCooldown || 0;
        
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
      
      // Reset first investment tracking
      hasMadeFirstInvestment = false;
      
      // Reset market events
      marketBoomActive = false;
      marketCrashActive = false;
      flashSaleActive = false;
      greatDepressionActive = false;
      marketBoomEndTime = 0;
      marketCrashEndTime = 0;
      flashSaleEndTime = 0;
      greatDepressionEndTime = 0;
      eventCooldown = 0;
      
      // Reset event cooldowns
      EVENT_CONFIG.eventCooldowns.marketBoom = 0;
      EVENT_CONFIG.eventCooldowns.marketCrash = 0;
      EVENT_CONFIG.eventCooldowns.flashSale = 0;
      EVENT_CONFIG.eventCooldowns.greatDepression = 0;
      
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
    // Recalculate upgrades bought to ensure accuracy
    recalculateUpgradesBought();
    
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

    // Upgrades bought
    const upgradesBoughtEl = document.getElementById('upgradesBoughtDisplay');
    if (upgradesBoughtEl && numberAnimator) {
      const totalUpgrades = Object.keys(UPGRADE_COSTS).length;
      const currentBought = parseInt(upgradesBoughtEl.textContent.split('/')[0]) || 0;
      numberAnimator.animateValue(upgradesBoughtEl, currentBought, totalUpgradesBought, 600, (value) => `${Math.floor(value)}/${totalUpgrades}`);
    } else if (upgradesBoughtEl) {
      const totalUpgrades = Object.keys(UPGRADE_COSTS).length;
      upgradesBoughtEl.textContent = `${totalUpgradesBought}/${totalUpgrades}`;
    }

    // Prestige resets
    const prestigeResetsEl = document.getElementById('prestigeResetsDisplay');
    if (prestigeResetsEl && numberAnimator) {
      const currentResets = parseInt(prestigeResetsEl.textContent.replace(/,/g, '')) || 0;
      numberAnimator.animateValue(prestigeResetsEl, currentResets, prestigeResets, 600, (value) => new Intl.NumberFormat("en-US").format(Math.floor(value)));
    } else if (prestigeResetsEl) {
      prestigeResetsEl.textContent = new Intl.NumberFormat("en-US").format(prestigeResets);
    }

    // Achievements unlocked
    const achievementsUnlockedEl = document.getElementById('achievementsUnlockedDisplay');
    if (achievementsUnlockedEl && numberAnimator) {
      const unlockedCount = Object.values(achievements).filter(ach => ach.unlocked).length;
      const currentUnlocked = parseInt(achievementsUnlockedEl.textContent.split('/')[0]) || 0;
      numberAnimator.animateValue(achievementsUnlockedEl, currentUnlocked, unlockedCount, 600, (value) => `${Math.floor(value)}/13`);
    } else if (achievementsUnlockedEl) {
      const unlockedCount = Object.values(achievements).filter(ach => ach.unlocked).length;
      achievementsUnlockedEl.textContent = `${unlockedCount}/13`;
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
    ach9: { unlocked: false, condition: () => totalUpgradesBought >= 5 },
    ach10: { unlocked: false, condition: () => investmentAccountBalance >= 100000 },
    ach11: { unlocked: false, condition: () => totalDividendsReceived >= 1000000 }, // Receive €1,000,000 in dividends
    ach12: { unlocked: false, condition: () => hasPerformedPrestige },
    ach13: { unlocked: false, condition: () => hasMadeFirstInvestment } // First investment
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
    u2: { cost: 20, name: "Finish secondary school", effect: "Adds +2 euros per click", type: "click" },
    u3: { cost: 50, name: "Finish high school", effect: "Adds +4 euros per click", type: "click" },
    u4: { cost: 6000, name: "Better credit score", effect: "Increases investment interest by 20%", type: "interest" },
    u5: { cost: 100, name: "Finish bachelor's", effect: "Adds +10 euros per click", type: "click" },
    u6: { cost: 250, name: "Finish master's", effect: "Adds +20 euros per click", type: "click" },
    u7: { cost: 500, name: "Do a PhD", effect: "Adds +40 euros per click", type: "click" },
    u8: { cost: 20000, name: "Create a network of influenced people", effect: "Increases investment interest by 15%", type: "interest" },
    u9: { cost: 250000, name: "Befriend a banker", effect: "Increases investment interest by 15%", type: "interest" },
    u10: { cost: 10000, name: "Dividends", effect: "Generate 1% dividend every 10 seconds", type: "dividend" },
    u11: { cost: 20, name: "Investment", effect: "Unlocks the investment account", type: "unlock" },
    u12: { cost: 25000, name: "Dividends 2", effect: "Speed up dividends by 20%", type: "dividend_speed" },
    u13: { cost: 30000, name: "Dividends 3", effect: "Increase dividend rate by 25%", type: "dividend_rate" },
    u14: { cost: 300000, name: "Premium Dividends", effect: "Increases dividend rate by 20%", type: "dividend_rate" },
    u17: { cost: 2000000, name: "Elite Dividends", effect: "Increases dividend rate by 25%", type: "dividend_rate" },
    u19: { cost: 10000000, name: "Prime Interest", effect: "Increases interest rate by 15%", type: "interest" },
    u20: { cost: 25000000, name: "Master Interest", effect: "Increases interest rate by 15%", type: "interest" },
    u21: { cost: 40000000, name: "Ultra Dividends", effect: "Increases dividend speed by 20%", type: "dividend_speed" },
    u26: { cost: 1000000000000, name: "Prestige Reset", effect: "Reset everything for permanent +25% interest and click multipliers", type: "prestige" },
    u27: { cost: 750000000, name: "Automated Investments", effect: "Unlocks automatic investment of dividends into investment account", type: "unlock" },
    u29: { cost: 1250, name: "Critical Hits", effect: "15% chance for 5x click damage", type: "special" },
    u30: { cost: 50000, name: "Click Streak", effect: "Build click streaks for temporary multipliers (1x to 3x)", type: "special" },
    u31: { cost: 75000, name: "Strong Credit Score", effect: "Increases interest rate by 10%", type: "interest" }
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
        hasPerformedPrestige = true;
        prestigeResets++;
        
        // Create prestige reset particle effects
        if (particleSystem) {
          const centerX = window.innerWidth / 2;
          const centerY = window.innerHeight / 2;
          
          // Create massive particle celebration
          particleSystem.createRareAchievementParticles(centerX, centerY, 100);
          particleSystem.createFireworkParticles(centerX, centerY, 50);
          particleSystem.createGoldenParticles(centerX, centerY, 40);
          particleSystem.createMilestoneParticles(centerX, centerY, 60);
          
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
    
    // Create upgrade particle effects
    if (particleSystem) {
      const buyButton = document.getElementById(`buy${key.charAt(0).toUpperCase() + key.slice(1)}Btn`);
      if (buyButton) {
        const rect = buyButton.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Create upgrade particles
        particleSystem.createUpgradeParticles(centerX, centerY, 10);
        
        // Create confetti for expensive upgrades
        if (cost >= 10000) {
          particleSystem.createConfettiParticles(centerX, centerY, 15);
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
  const BASE_COMPOUND_MULTIPLIER_PER_TICK = 1.004; // base multiply every 1000ms (1 second) - 0.4% per second
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
      const aCost = UPGRADE_CONFIG[aId]?.cost ?? Number.MAX_SAFE_INTEGER;
      const bCost = UPGRADE_CONFIG[bId]?.cost ?? Number.MAX_SAFE_INTEGER;
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
    if (owned.u21) speedMultiplier *= 0.8; // 20% faster
    
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
            particleSystem.createMoneyParticles(centerX, centerY, Math.min(cappedPayout / 1000000, 15));
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
      if (owned.u21) speedMultiplier *= 0.8;
      
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
      if (owned.u21) speedMultiplier *= 0.8;
      
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
    updateActiveEventDisplay();
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
  
  // Events check every 10 seconds - reduced frequency for mobile performance
  setInterval(() => {
    checkEvents();
  }, 10000);

  // Initialize upgrade visibility state before rendering
  initUpgradeVisibility();
  updateToggleCompletedUI();

  renderBalances();
  renderUpgradesOwned();
  renderRank();
  renderUpgradePrices();
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

  // Function to recalculate total upgrades bought based on current owned state
  function recalculateUpgradesBought() {
    totalUpgradesBought = Object.values(owned).filter(owned => owned === true).length;
  }
  
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
  function checkUpgradeStats() {
    recalculateUpgradesBought();
    const totalUpgrades = Object.keys(UPGRADE_COSTS).length;
    const ownedUpgrades = Object.values(owned).filter(owned => owned === true).length;
    
    console.log('📊 Upgrade Statistics:');
    console.log(`Total upgrades available: ${totalUpgrades}`);
    console.log(`Upgrades owned: ${ownedUpgrades}`);
    console.log(`Total upgrades bought counter: ${totalUpgradesBought}`);
    console.log(`Display should show: ${ownedUpgrades}/${totalUpgrades}`);
    
    // List all owned upgrades
    const ownedUpgradeList = Object.entries(owned)
      .filter(([id, isOwned]) => isOwned)
      .map(([id, isOwned]) => `${id}: ${UPGRADE_CONFIG[id]?.name || 'Unknown'}`)
      .join(', ');
    
    console.log(`Owned upgrades: ${ownedUpgradeList}`);
  }
  
  // Make functions globally available
  window.addMoney = addMoney;
  window.setBalance = setBalance;
  window.checkUpgradeStats = checkUpgradeStats;

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



