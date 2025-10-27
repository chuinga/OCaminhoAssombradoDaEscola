'use client';

import React, { useEffect, useState } from 'react';
import { Keyboard, X } from 'lucide-react';

interface KeyboardNavigationHelperProps {
  showOnFirstVisit?: boolean;
  className?: string;
}

export const KeyboardNavigationHelper: React.FC<KeyboardNavigationHelperProps> = ({
  showOnFirstVisit = true,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenShown, setHasBeenShown] = useState(false);

  useEffect(() => {
    // Check if user has seen the helper before
    const hasSeenHelper = localStorage.getItem('keyboard-navigation-helper-seen');
    
    if (showOnFirstVisit && !hasSeenHelper) {
      // Show after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true);
        setHasBeenShown(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [showOnFirstVisit]);

  useEffect(() => {
    // Listen for keyboard events to show helper
    const handleKeyDown = (event: KeyboardEvent) => {
      // Show helper when Tab is pressed (keyboard navigation)
      if (event.key === 'Tab' && !hasBeenShown) {
        setIsVisible(true);
        setHasBeenShown(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [hasBeenShown]);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('keyboard-navigation-helper-seen', 'true');
  };

  const handleDontShowAgain = () => {
    handleClose();
    localStorage.setItem('keyboard-navigation-helper-dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-50 max-w-sm ${className}`}>
      <div className="bg-gray-900/95 backdrop-blur-sm border border-orange-500/30 rounded-lg p-4 shadow-xl animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
              <Keyboard className="w-4 h-4 text-orange-400" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-orange-400 mb-1">
              Navegação por Teclado
            </h3>
            <div className="text-xs text-gray-300 space-y-1">
              <p>• Use <kbd className="px-1 py-0.5 bg-gray-700 rounded text-xs">Tab</kbd> para navegar</p>
              <p>• <kbd className="px-1 py-0.5 bg-gray-700 rounded text-xs">Enter</kbd>/<kbd className="px-1 py-0.5 bg-gray-700 rounded text-xs">Espaço</kbd> para ativar</p>
              <p>• <kbd className="px-1 py-0.5 bg-gray-700 rounded text-xs">Esc</kbd> para pausar no jogo</p>
            </div>
          </div>
          
          <button
            onClick={handleClose}
            className="flex-shrink-0 p-1 text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/50 rounded"
            aria-label="Fechar ajuda de navegação"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="mt-3 flex gap-2">
          <button
            onClick={handleClose}
            className="flex-1 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 focus:bg-orange-700 text-white text-xs rounded transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/50"
          >
            Entendi
          </button>
          <button
            onClick={handleDontShowAgain}
            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 focus:bg-gray-600 text-white text-xs rounded transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500/50"
          >
            Não mostrar novamente
          </button>
        </div>
      </div>
    </div>
  );
};

// Hook to manually trigger the keyboard navigation helper
export const useKeyboardNavigationHelper = () => {
  const [isVisible, setIsVisible] = useState(false);

  const show = () => setIsVisible(true);
  const hide = () => setIsVisible(false);

  return {
    isVisible,
    show,
    hide,
    KeyboardNavigationHelper: () => (
      <KeyboardNavigationHelper 
        showOnFirstVisit={false} 
        className={isVisible ? '' : 'hidden'} 
      />
    )
  };
};