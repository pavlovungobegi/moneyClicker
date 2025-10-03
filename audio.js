// Audio System for Money Clicker Game
// Handles all audio functionality including background music and sound effects

(() => {
  // Audio system variables
  let audioContext = null;
  let soundEnabled = true;
  let backgroundMusic = null;
  let musicEnabled = true;
  let soundEffectsEnabled = true;

  // Initialize audio system
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
    
    // Additional mobile audio context handling
    if (audioContext && audioContext.state === 'running') {
      // Audio context is already running, ensure it stays active
      try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.001);
      } catch (e) {
        // Silent fail - this is just to keep context active
      }
    }
  }

  // Initialize background music
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

  // Start background music
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

  // Toggle background music
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

  // Play click sound effect
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

  // Play critical hit sound effect
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

  // Play buy sound effect
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

  // Play error sound effect
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

  // Play deposit sound effect
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

  // Play withdraw sound effect
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

  // Play achievement sound effect
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

  // Play tier upgrade sound effect
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

  // Play success sound effect
  function playSuccessSound() {
    if (!soundEnabled || !audioContext || !soundEffectsEnabled) return;
    
    // Ensure audio context is resumed for iOS PWA
    resumeAudioContext();
    
    try {
      // Create a success chime sound
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Pleasant ascending tone
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
      oscillator.frequency.exponentialRampToValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
      oscillator.frequency.exponentialRampToValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('Success sound error:', error);
    }
  }

  function playWinSound() {
    if (!soundEnabled || !soundEffectsEnabled) return;
    
    // Ensure audio context is resumed for iOS PWA
    resumeAudioContext();
    
    try {
      const winSound = new Audio('you-win.mp3');
      winSound.volume = 0.7; // Increase volume to 70% for better audibility
      winSound.preload = 'auto'; // Preload for better mobile performance
      
      // Add mobile-specific audio handling
      winSound.addEventListener('canplaythrough', () => {
        winSound.play().catch(e => {
          console.log('Win sound failed to play:', e);
          // Try to resume audio context and retry once
          resumeAudioContext();
          setTimeout(() => {
            winSound.play().catch(e2 => {
              console.log('Win sound retry failed:', e2);
            });
          }, 100);
        });
      });
      
      // Fallback: try to play immediately if already loaded
      if (winSound.readyState >= 3) { // HAVE_FUTURE_DATA or higher
        winSound.play().catch(e => {
          console.log('Win sound immediate play failed:', e);
        });
      }
      
    } catch (e) {
      console.log('Win sound not available:', e);
    }
  }

  // Play wheel spin sound
  function playWheelSpinSound() {
    // Ensure audio context is resumed for iOS PWA
    resumeAudioContext();
    
    try {
      const wheelSpinSound = new Audio('wheel-spin.wav');
      wheelSpinSound.volume = 0.6; // Moderate volume for spin sound
      wheelSpinSound.preload = 'auto'; // Preload for better mobile performance
      
      // Add mobile-specific audio handling
      wheelSpinSound.addEventListener('canplaythrough', () => {
        wheelSpinSound.play().catch(e => {
          console.log('Wheel spin sound failed to play:', e);
          // Try to resume audio context and retry once
          resumeAudioContext();
          setTimeout(() => {
            wheelSpinSound.play().catch(e2 => {
              console.log('Wheel spin sound retry failed:', e2);
            });
          }, 100);
        });
      });
      
      // Fallback: try to play immediately if already loaded
      if (wheelSpinSound.readyState >= 3) { // HAVE_FUTURE_DATA or higher
        wheelSpinSound.play().catch(e => {
          console.log('Wheel spin sound immediate play failed:', e);
        });
      }
      
    } catch (e) {
      console.log('Wheel spin sound not available:', e);
    }
  }

  // Event sound effects
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

  // Audio settings functions
  function setMusicEnabled(enabled) {
    musicEnabled = enabled;
    if (backgroundMusic) {
      if (enabled) {
        startBackgroundMusic();
      } else {
        backgroundMusic.pause();
      }
    }
  }

  function setSoundEffectsEnabled(enabled) {
    soundEffectsEnabled = enabled;
  }

  function setSoundEnabled(enabled) {
    soundEnabled = enabled;
    if (!enabled) {
      soundEffectsEnabled = false;
      musicEnabled = false;
    }
  }

  // Get audio settings
  function getAudioSettings() {
    return {
      soundEnabled,
      musicEnabled,
      soundEffectsEnabled
    };
  }

  // Pause all audio (for tab visibility changes)
  function pauseAllAudio() {
    if (backgroundMusic) {
      backgroundMusic.pause();
    }
  }

  // Resume all audio (for tab visibility changes)
  function resumeAllAudio() {
    if (musicEnabled && backgroundMusic) {
      startBackgroundMusic();
    }
  }

  // Initialize mobile audio (call on first user interaction)
  function initMobileAudio() {
    if (!audioContext) return;
    
    // Resume audio context
    resumeAudioContext();
    
    // Create a silent buffer to unlock audio on mobile
    try {
      const buffer = audioContext.createBuffer(1, 1, 22050);
      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.start(0);
    } catch (e) {
      console.log('Mobile audio init failed:', e);
    }
  }

  // Make functions globally available
  window.AudioSystem = {
    // Initialization
    initAudio,
    initBackgroundMusic,
    
    // Background music
    startBackgroundMusic,
    toggleBackgroundMusic,
    pauseAllAudio,
    resumeAllAudio,
    
    // Sound effects
    playClickSound,
    playCriticalCoinSound,
    playBuySound,
    playErrorSound,
    playDepositSound,
    playWithdrawSound,
    playAchievementSound,
    playTierUpgradeSound,
    playSuccessSound,
    playWinSound,
    playWheelSpinSound,
    
    // Event sounds
    playMarketBoomSound,
    playMarketCrashSound,
    playFlashSaleSound,
    playFastFingersSound,
    
    // Settings
    setMusicEnabled,
    setSoundEffectsEnabled,
    setSoundEnabled,
    getAudioSettings,
    
    // Utility
    resumeAudioContext,
    initMobileAudio
  };

})();
