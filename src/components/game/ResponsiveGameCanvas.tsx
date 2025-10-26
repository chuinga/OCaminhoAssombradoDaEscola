'use client';

import { useEffect, useState, useRef } from 'react';

interface ResponsiveGameCanvasProps {
  children: React.ReactNode;
  className?: string;
}

interface ViewportDimensions {
  width: number;
  height: number;
  aspectRatio: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

export function ResponsiveGameCanvas({ children, className = '' }: ResponsiveGameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<ViewportDimensions>({
    width: 800,
    height: 600,
    aspectRatio: 4/3,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  });

  useEffect(() => {
    const updateDimensions = () => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Determine device type based on viewport width
      const isMobile = viewportWidth < 768;
      const isTablet = viewportWidth >= 768 && viewportWidth < 1024;
      const isDesktop = viewportWidth >= 1024;

      // Calculate optimal game dimensions
      let gameWidth: number;
      let gameHeight: number;

      if (isMobile) {
        // Mobile: Use full viewport width, maintain aspect ratio
        gameWidth = Math.min(viewportWidth, 480);
        gameHeight = Math.min(viewportHeight * 0.7, gameWidth * 0.6);
      } else if (isTablet) {
        // Tablet: Use most of the viewport
        gameWidth = Math.min(containerWidth, 768);
        gameHeight = Math.min(containerHeight, gameWidth * 0.6);
      } else {
        // Desktop: Use container dimensions with max limits
        gameWidth = Math.min(containerWidth, 1200);
        gameHeight = Math.min(containerHeight, gameWidth * 0.6);
      }

      // Ensure minimum dimensions
      gameWidth = Math.max(gameWidth, 320);
      gameHeight = Math.max(gameHeight, 240);

      const aspectRatio = gameWidth / gameHeight;

      setDimensions({
        width: gameWidth,
        height: gameHeight,
        aspectRatio,
        isMobile,
        isTablet,
        isDesktop,
      });
    };

    // Initial calculation
    updateDimensions();

    // Update on resize with debouncing
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateDimensions, 150);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`
        relative w-full h-full flex items-center justify-center
        ${className}
      `}
      style={{
        minHeight: dimensions.isMobile ? '60vh' : '70vh',
      }}
    >
      {/* Game Canvas Container */}
      <div
        className="relative bg-black rounded-lg overflow-hidden shadow-2xl"
        style={{
          width: dimensions.width,
          height: dimensions.height,
          maxWidth: '100vw',
          maxHeight: '100vh',
        }}
      >
        {children}
      </div>

      {/* Device-specific UI hints */}
      {dimensions.isMobile && (
        <div className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg p-3 text-white text-sm text-center">
          <p>💡 Dica: Rode o dispositivo para uma melhor experiência</p>
        </div>
      )}

      {/* Debug info - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg p-2 text-white text-xs">
          <div>Resolução: {dimensions.width}x{dimensions.height}</div>
          <div>Dispositivo: {dimensions.isMobile ? 'Mobile' : dimensions.isTablet ? 'Tablet' : 'Desktop'}</div>
          <div>Aspecto: {dimensions.aspectRatio.toFixed(2)}</div>
        </div>
      )}
    </div>
  );
}