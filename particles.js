// Particle System for Money Clicker Game
// Handles all particle effects and animations

(() => {
  // Particle System Class
  class ParticleSystem {
    constructor() {
      this.canvas = document.getElementById('particleCanvas');
      this.ctx = this.canvas.getContext('2d');
      this.particles = [];
      this.particlePool = [];
      this.animationId = null;
      this.isAnimating = false;
      this.lastFrameTime = 0;
      this.targetFPS = GAME_CONFIG.ANIMATION.TARGET_FPS;
      this.frameInterval = GAME_CONFIG.ANIMATION.FRAME_INTERVAL;
      
      this.resizeCanvas();
      this.resizeHandler = () => this.resizeCanvas();
      window.addEventListener('resize', this.resizeHandler);
      this.startAnimation();
    }
    
    resizeCanvas() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }

    hasParticles() {
      return this.particles.length > 0;
    }

    clearCanvas() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    ensureAnimationRunning() {
      if (!document.hidden && this.hasParticles()) {
        this.startAnimation();
      }
    }
    
    createParticle(type, x, y, options = {}) {
      // Limit total particles to prevent memory bloat
      if (this.particles.length > 200) {
        return;
      }
      
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
      this.ensureAnimationRunning();
    }
    
    createCoinParticles(x, y, count = 1) {
      if (!particleEffectsEnabled) return;
      
      // Reduce particles on mobile
      const actualCount = isMobile ? Math.max(1, Math.floor(count * GAME_CONFIG.ANIMATION.PARTICLE_REDUCTION_MOBILE)) : count;
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
      if (!particleEffectsEnabled) return;
      
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
      if (!particleEffectsEnabled) return;
      
      // Reduce particles on mobile
      const actualCount = isMobile ? Math.max(1, Math.floor(count * GAME_CONFIG.ANIMATION.PARTICLE_REDUCTION_MOBILE)) : count;
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
      if (!particleEffectsEnabled) return;
      
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
      if (!particleEffectsEnabled) return;
      
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
      if (!particleEffectsEnabled) return;
      
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
      if (!particleEffectsEnabled) return;
      
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
      if (!particleEffectsEnabled) return;
      
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
      if (!particleEffectsEnabled) return;
      
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
      if (!particleEffectsEnabled) return;
      
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
      if (!particleEffectsEnabled) return;
      
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
      if (!particleEffectsEnabled) return;
      
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
    
    animate(currentTime = 0) {
      // Throttle animation to target FPS
      if (currentTime - this.lastFrameTime >= this.frameInterval) {
      this.updateParticles();
      this.drawParticles();
        this.lastFrameTime = currentTime;
      }
      
      // Only continue animation if there are particles or we're actively animating
      if (this.particles.length > 0 || this.isAnimating) {
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
    
    // Cleanup method to prevent memory leaks
    destroy() {
      this.stopAnimation();
      if (this.resizeHandler) {
        window.removeEventListener('resize', this.resizeHandler);
      }
      this.particles = [];
      this.particlePool = [];
      if (this.canvas && this.canvas.parentNode) {
        this.canvas.parentNode.removeChild(this.canvas);
      }
    }
  }

  // Make ParticleSystem globally available
  window.ParticleSystem = ParticleSystem;

})();
