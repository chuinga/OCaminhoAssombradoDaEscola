'use client';

import React from 'react';

interface HalloweenBackgroundProps {
  children: React.ReactNode;
  variant?: 'default' | 'game' | 'menu';
  showParticles?: boolean;
}

export const HalloweenBackground: React.FC<HalloweenBackgroundProps> = ({
  children,
  variant = 'default',
  showParticles = true
}) => {
  const backgroundClasses = {
    default: 'halloween-bg halloween-bg-pattern',
    game: 'bg-gradient-to-b from-purple-900 via-black to-purple-900',
    menu: 'halloween-bg-orange halloween-bg-pattern'
  };

  return (
    <div className={`min-h-screen relative overflow-hidden ${backgroundClasses[variant]}`}>
      {/* Animated background elements */}
      {showParticles && (
        <>
          {/* Floating particles */}
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-orange-400 rounded-full opacity-30 floating"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${3 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>

          {/* Spooky shadows */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-10 left-10 w-32 h-32 bg-black opacity-20 rounded-full blur-xl floating" />
            <div className="absolute top-32 right-20 w-24 h-24 bg-purple-900 opacity-30 rounded-full blur-lg floating" 
                 style={{ animationDelay: '1s' }} />
            <div className="absolute bottom-20 left-1/3 w-40 h-20 bg-orange-900 opacity-25 rounded-full blur-2xl floating" 
                 style={{ animationDelay: '2s' }} />
          </div>

          {/* Twinkling stars */}
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 15 }).map((_, i) => (
              <div
                key={`star-${i}`}
                className="absolute w-1 h-1 bg-yellow-200 rounded-full pulsing"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 50}%`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        </>
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};