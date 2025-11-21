// Premium Fire Circle Particle System for FORGE Homepage
// Calm, smooth floating circles with red ember colors

class FireCircleParticles {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.animationId = null;
    this.isRunning = false;
    this.startTime = performance.now();
    this.scrollY = 0;
    
    // Detect device for performance optimization
    this.isMobile = window.innerWidth < 768;
    this.isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
    
    // Performance settings - Reduced by 30% for premium, less chaotic feel
    this.maxParticles = this.isMobile ? 98 : this.isTablet ? 182 : 280;
    this.targetFPS = this.isMobile ? 30 : 60;
    this.frameInterval = 1000 / this.targetFPS;
    this.lastFrameTime = 0;
    
    // Red color palette only
    this.colors = [
      { r: 255, g: 0, b: 0 },      // #ff0000 bright red
      { r: 212, g: 0, b: 0 },      // #d40000 deep red
      { r: 176, g: 0, b: 0 },      // #b00000 darker red
      { r: 138, g: 0, b: 0 }       // #8a0000 darkest red
    ];
    
    this.init();
  }
  
  init() {
    this.resize();
    this.createParticles();
    this.setupEventListeners();
    this.start();
  }
  
  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    
    // Recycle particles with new dimensions
    this.particles.forEach((particle, index) => {
      if (index < this.maxParticles) {
        this.resetParticle(particle);
      }
    });
    
    // Trim or add particles as needed
    while (this.particles.length < this.maxParticles) {
      this.particles.push(this.createParticle());
    }
    if (this.particles.length > this.maxParticles) {
      this.particles = this.particles.slice(0, this.maxParticles);
    }
  }
  
  createParticle() {
    // Size: Mostly small/medium, fewer large
    // 50% small (1.5-3px), 35% medium (3-5px), 15% large (5-8px)
    const sizeType = Math.random();
    let size;
    if (sizeType < 0.5) {
      size = 1.5 + Math.random() * 1.5; // Small: 1.5-3px
    } else if (sizeType < 0.85) {
      size = 3 + Math.random() * 2; // Medium: 3-5px
    } else {
      size = 5 + Math.random() * 3; // Large: 5-8px (reduced)
    }
    
    // Opacity: Lowered to 0.25 to 0.6 so background doesn't overpower text
    const opacity = 0.25 + Math.random() * 0.35;
    
    // Glow intensity: 0.5 to 1.0 (softer)
    const glowIntensity = 0.5 + Math.random() * 0.5;
    
    // Speed: Very slow for premium feel - 0.05 to 0.4 (reduced from 0.1-0.6)
    const speed = 0.05 + Math.random() * 0.35;
    
    // Movement: Mostly upward (70%), some diagonal (25%), few sideways (5%)
    const movementType = Math.random();
    let vx, vy;
    
    if (movementType < 0.7) {
      // Float gently upward
      vx = (Math.random() - 0.5) * 0.15; // Very slight horizontal drift
      vy = -speed * (0.7 + Math.random() * 0.3); // Upward, slow
    } else if (movementType < 0.95) {
      // Slight diagonal (upward + left or right)
      const diagonal = Math.random() < 0.5 ? -1 : 1;
      vx = diagonal * speed * (0.3 + Math.random() * 0.4);
      vy = -speed * (0.6 + Math.random() * 0.3); // Still mostly upward
    } else {
      // Few drift sideways (very gentle)
      vx = (Math.random() - 0.5) * speed * 0.8;
      vy = -speed * 0.3; // Still slight upward component
    }
    
    // Random starting position - distribute across screen for immediate visibility
    const x = Math.random() * this.width;
    // Distribute from bottom 20% to top for immediate visibility on load
    const y = this.height * (0.2 + Math.random() * 0.8);
    
    // Pulsing: 15% of particles pulse (reduced)
    const isPulsing = Math.random() < 0.15;
    
    // Color: pick from red palette
    const baseColor = this.colors[Math.floor(Math.random() * this.colors.length)];
    const colorVariation = 0.85 + Math.random() * 0.15; // 0.85-1.0 (subtle variation)
    
    return {
      x: x,
      y: y,
      size: size,
      baseSize: size,
      opacity: opacity,
      baseOpacity: opacity,
      glowIntensity: glowIntensity,
      vx: vx,
      vy: vy,
      isPulsing: isPulsing,
      pulseSpeed: 0.003 + Math.random() * 0.005, // Slower pulse
      pulsePhase: Math.random() * Math.PI * 2,
      color: {
        r: Math.min(255, Math.round(baseColor.r * colorVariation)),
        g: Math.min(255, Math.round(baseColor.g * colorVariation)),
        b: Math.min(255, Math.round(baseColor.b * colorVariation))
      },
      fadeIn: 1, // Start fully visible - no fade in
      fadeSpeed: 0 // No fade needed
    };
  }
  
  resetParticle(particle) {
    // Reset to random position - distribute for continuous visibility
    particle.x = Math.random() * this.width;
    // When resetting, place at bottom for upward flow
    particle.y = this.height + Math.random() * 100;
    particle.fadeIn = 1; // Always fully visible - no fade
    particle.opacity = particle.baseOpacity;
    
    // Reset movement - mostly upward (slower)
    const speed = 0.05 + Math.random() * 0.35;
    const movementType = Math.random();
    
    if (movementType < 0.7) {
      // Float gently upward
      particle.vx = (Math.random() - 0.5) * 0.15;
      particle.vy = -speed * (0.7 + Math.random() * 0.3);
    } else if (movementType < 0.95) {
      // Slight diagonal
      const diagonal = Math.random() < 0.5 ? -1 : 1;
      particle.vx = diagonal * speed * (0.3 + Math.random() * 0.4);
      particle.vy = -speed * (0.6 + Math.random() * 0.3);
    } else {
      // Gentle sideways drift
      particle.vx = (Math.random() - 0.5) * speed * 0.8;
      particle.vy = -speed * 0.3;
    }
  }
  
  createParticles() {
    this.particles = [];
    for (let i = 0; i < this.maxParticles; i++) {
      this.particles.push(this.createParticle());
    }
  }
  
  setupEventListeners() {
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.resize();
      }, 100);
    });
    
    // Track scroll for opacity reduction
    window.addEventListener('scroll', () => {
      this.scrollY = window.pageYOffset;
    }, { passive: true });
  }
  
  updateParticle(particle, time) {
    // Particles are always fully visible - no fade in needed
    particle.fadeIn = 1;
    
    // Gentle pulsing effect (subtle)
    if (particle.isPulsing) {
      const pulse = Math.sin(time * particle.pulseSpeed * 1000 + particle.pulsePhase) * 0.1 + 0.9; // Subtle pulse
      particle.size = particle.baseSize * pulse;
      particle.opacity = particle.baseOpacity * pulse;
    } else {
      particle.opacity = particle.baseOpacity;
    }
    
    // Update position (slow, smooth movement)
    particle.x += particle.vx;
    particle.y += particle.vy;
    
    // Wrap around screen edges
    if (particle.x < -50) particle.x = this.width + 50;
    if (particle.x > this.width + 50) particle.x = -50;
    if (particle.y < -100) {
      // Reset when off top
      this.resetParticle(particle);
    }
    if (particle.y > this.height + 100) {
      // Reset when off bottom (shouldn't happen often)
      this.resetParticle(particle);
    }
  }
  
  drawParticle(particle, globalOpacity = 1.0) {
    const ctx = this.ctx;
    const { r, g, b } = particle.color;
    const currentOpacity = particle.opacity * globalOpacity;
    
    if (currentOpacity <= 0.01) return;
    
    // Create radial gradient for soft glow/bloom (hot coal effect)
    const glowSize = particle.size * (1.2 + particle.glowIntensity * 0.8);
    const gradient = ctx.createRadialGradient(
      particle.x, particle.y, 0,
      particle.x, particle.y, glowSize
    );
    
    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${currentOpacity})`);
    gradient.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, ${currentOpacity * 0.8})`);
    gradient.addColorStop(0.6, `rgba(${r}, ${g}, ${b}, ${currentOpacity * 0.5})`);
    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
    
    // Draw with soft blur effect (hot coal/ember look)
    ctx.save();
    
    // Outer bloom (soft, subtle)
    ctx.globalAlpha = currentOpacity * 0.12;
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, glowSize * 1.8, 0, Math.PI * 2);
    ctx.fill();
    
    // Middle glow
    ctx.globalAlpha = currentOpacity * 0.35;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, glowSize * 0.7, 0, Math.PI * 2);
    ctx.fill();
    
    // Core bright circle (hot coal center)
    ctx.globalAlpha = currentOpacity;
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${currentOpacity})`;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }
  
  animate(currentTime) {
    if (!this.isRunning) return;
    
    // Throttle to target FPS
    const elapsed = currentTime - this.lastFrameTime;
    if (elapsed < this.frameInterval) {
      this.animationId = requestAnimationFrame((time) => this.animate(time));
      return;
    }
    
    this.lastFrameTime = currentTime - (elapsed % this.frameInterval);
    
    // Lower base opacity so animation doesn't overpower text
    const heroSection = document.querySelector('.hero-section');
    let globalOpacity = 0.6; // Reduced from 1.0 to 0.6 for subtle background
    if (heroSection) {
      const heroHeight = heroSection.offsetHeight;
      if (this.scrollY >= heroHeight * 0.5) {
        const scrollProgress = Math.min((this.scrollY - heroHeight * 0.5) / (heroHeight * 0.3), 1);
        globalOpacity = 0.6 - (scrollProgress * 0.2); // Further reduce on scroll
      }
    }
    
    // Clear with fade trail for smooth motion
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    const time = (currentTime - this.startTime) * 0.001;
    
    // Update and draw all particles
    this.particles.forEach(particle => {
      this.updateParticle(particle, time);
      this.drawParticle(particle, globalOpacity);
    });
    
    this.animationId = requestAnimationFrame((time) => this.animate(time));
  }
  
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.startTime = performance.now();
    this.lastFrameTime = performance.now();
    this.animationId = requestAnimationFrame((time) => this.animate(time));
  }
  
  stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}

// Initialize immediately - no waiting for DOMContentLoaded
// This ensures particles are visible as soon as possible
(function() {
  const canvas = document.getElementById('ember-canvas');
  if (canvas) {
    new FireCircleParticles('ember-canvas');
  } else {
    // If canvas not ready, try again on DOMContentLoaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        new FireCircleParticles('ember-canvas');
      });
    } else {
      // DOM already loaded, try again
      setTimeout(() => {
        new FireCircleParticles('ember-canvas');
      }, 0);
    }
  }
})();
