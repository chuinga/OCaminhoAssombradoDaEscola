'use client';

import { useEffect } from 'react';
import { useSettingsStore } from '../store/settingsStore';

export const useAccessibility = () => {
  const { display, game } = useSettingsStore();

  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;

    // Apply reduced motion
    if (display.reducedMotion) {
      body.classList.add('reduced-motion');
    } else {
      body.classList.remove('reduced-motion');
    }

    // Apply high contrast
    if (display.highContrast) {
      body.classList.add('high-contrast');
    } else {
      body.classList.remove('high-contrast');
    }

    // Apply colorblind filters
    body.classList.remove('colorblind-protanopia', 'colorblind-deuteranopia', 'colorblind-tritanopia');
    if (display.colorBlindMode !== 'none') {
      body.classList.add(`colorblind-${display.colorBlindMode}`);
    }

    // Apply particle effects setting
    if (!display.particleEffects) {
      body.classList.add('no-particles');
    } else {
      body.classList.remove('no-particles');
    }

    // Apply screen shake setting
    if (!display.screenShake) {
      body.classList.add('no-screen-shake');
    } else {
      body.classList.remove('no-screen-shake');
    }

    // Handle focus loss pause setting
    if (game.pauseOnFocusLoss) {
      const handleVisibilityChange = () => {
        if (document.hidden) {
          // Dispatch custom event for game to handle pause
          window.dispatchEvent(new CustomEvent('gamePauseOnFocusLoss'));
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [display, game]);

  // FPS Counter
  useEffect(() => {
    if (display.showFPS) {
      let fpsCounter = document.getElementById('fps-counter');
      if (!fpsCounter) {
        fpsCounter = document.createElement('div');
        fpsCounter.id = 'fps-counter';
        fpsCounter.className = 'fps-counter';
        document.body.appendChild(fpsCounter);
      }

      let lastTime = performance.now();
      let frameCount = 0;
      let fps = 0;

      const updateFPS = (currentTime: number) => {
        frameCount++;
        if (currentTime - lastTime >= 1000) {
          fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
          if (fpsCounter) {
            fpsCounter.textContent = `FPS: ${fps}`;
          }
          frameCount = 0;
          lastTime = currentTime;
        }
        requestAnimationFrame(updateFPS);
      };

      const animationId = requestAnimationFrame(updateFPS);

      return () => {
        cancelAnimationFrame(animationId);
        const counter = document.getElementById('fps-counter');
        if (counter) {
          counter.remove();
        }
      };
    } else {
      const counter = document.getElementById('fps-counter');
      if (counter) {
        counter.remove();
      }
    }
  }, [display.showFPS]);

  // Control Hints
  useEffect(() => {
    if (game.showControlHints) {
      let hintsElement = document.getElementById('control-hints');
      if (!hintsElement) {
        hintsElement = document.createElement('div');
        hintsElement.id = 'control-hints';
        hintsElement.className = 'control-hints';
        hintsElement.innerHTML = `
          <div style="margin-bottom: 8px; font-weight: bold;">Controlos:</div>
          <div>A/D ou ←/→: Mover</div>
          <div>W/↑: Saltar</div>
          <div>S/↓: Agachar</div>
          <div>Espaço: Atacar</div>
          <div>Esc: Pausar</div>
        `;
        document.body.appendChild(hintsElement);
      }

      // Auto-hide after 10 seconds
      const hideTimer = setTimeout(() => {
        if (hintsElement) {
          hintsElement.classList.add('hidden');
        }
      }, 10000);

      // Show on mouse movement or key press
      const showHints = () => {
        if (hintsElement) {
          hintsElement.classList.remove('hidden');
        }
      };

      document.addEventListener('mousemove', showHints);
      document.addEventListener('keydown', showHints);

      return () => {
        clearTimeout(hideTimer);
        document.removeEventListener('mousemove', showHints);
        document.removeEventListener('keydown', showHints);
        const hints = document.getElementById('control-hints');
        if (hints) {
          hints.remove();
        }
      };
    } else {
      const hints = document.getElementById('control-hints');
      if (hints) {
        hints.remove();
      }
    }
  }, [game.showControlHints]);

  return {
    isReducedMotion: display.reducedMotion,
    isHighContrast: display.highContrast,
    colorBlindMode: display.colorBlindMode,
    showFPS: display.showFPS,
    particleEffects: display.particleEffects,
    screenShake: display.screenShake,
    showControlHints: game.showControlHints,
    pauseOnFocusLoss: game.pauseOnFocusLoss
  };
};