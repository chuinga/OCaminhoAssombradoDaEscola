'use client';

import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
}

export const PumpkinIcon: React.FC<IconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path
      fill="currentColor"
      d="M12 2c-1 0-2 1-2 2v1c-3 0-5 2-5 5v6c0 3 2 5 5 5h4c3 0 5-2 5-5v-6c0-3-2-5-5-5V4c0-1-1-2-2-2zm-3 8l2 2 2-2v2l-2 2-2-2v-2zm0 6h6v2H9v-2z"
    />
  </svg>
);

export const GhostIcon: React.FC<IconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path
      fill="currentColor"
      d="M12 2C8.5 2 6 4.5 6 8v8l2-2 2 2 2-2 2 2 2-2 2 2V8c0-3.5-2.5-6-6-6zm-2 8c0-1 1-2 2-2s2 1 2 2-1 2-2 2-2-1-2-2zm-1 4h6v2H9v-2z"
    />
  </svg>
);

export const BatIcon: React.FC<IconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path
      fill="currentColor"
      d="M12 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2zm-8-2c0 2 2 4 4 4l2-2c0-1-1-2-2-2s-2 1-2 2zm16 0c0-1-1-2-2-2s-2 1-2 2l2 2c2 0 4-2 4-4z"
    />
  </svg>
);

export const MoonIcon: React.FC<IconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path
      fill="currentColor"
      d="M12 2a10 10 0 0 0 0 20c5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8c1.4 0 2.7.4 3.8 1-2.4 1.2-4 3.7-4 6.5s1.6 5.3 4 6.5c-1.1.6-2.4 1-3.8 1z"
    />
  </svg>
);

export const SkullIcon: React.FC<IconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path
      fill="currentColor"
      d="M12 2C8 2 5 5 5 9v4c0 2 1 3 2 4v3h2v-2h2v2h2v-2h2v2h2v-3c1-1 2-2 2-4V9c0-4-3-7-7-7zM9 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2zm6 0c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z"
    />
  </svg>
);

export const SpiderIcon: React.FC<IconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path
      fill="currentColor"
      d="M12 8c-2 0-4 2-4 4s2 4 4 4 4-2 4-4-2-4-4-4zm-8 4l-2-2 2-2 2 2-2 2zm16 0l2-2-2-2-2 2 2 2zM6 6L4 4l2-2 2 2-2 2zm12 0l2-2-2-2-2 2 2 2zM6 18l-2 2 2 2 2-2-2-2zm12 0l2 2-2 2-2-2 2 2z"
    />
  </svg>
);

interface HalloweenBorderProps {
  children: React.ReactNode;
  className?: string;
}

export const HalloweenBorder: React.FC<HalloweenBorderProps> = ({ children, className = '' }) => (
  <div className={`relative ${className}`}>
    {/* Corner decorations */}
    <div className="absolute -top-2 -left-2 text-orange-500">
      <PumpkinIcon size={16} />
    </div>
    <div className="absolute -top-2 -right-2 text-purple-500">
      <BatIcon size={16} />
    </div>
    <div className="absolute -bottom-2 -left-2 text-gray-600">
      <SkullIcon size={16} />
    </div>
    <div className="absolute -bottom-2 -right-2 text-yellow-400">
      <MoonIcon size={16} />
    </div>
    
    {children}
  </div>
);