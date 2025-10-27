'use client';

import React from 'react';

interface HalloweenCardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  variant?: 'default' | 'spooky' | 'dark';
}

export const HalloweenCard: React.FC<HalloweenCardProps> = ({
  children,
  title,
  className = '',
  variant = 'default'
}) => {
  const variantClasses = {
    default: 'bg-gradient-to-b from-orange-100 to-orange-200 border-orange-400 text-gray-800',
    spooky: 'bg-gradient-to-b from-purple-900 to-black border-purple-600 text-orange-200',
    dark: 'bg-gradient-to-b from-gray-800 to-gray-900 border-gray-600 text-white'
  };

  return (
    <div className={`
      rounded-lg border-2 shadow-2xl p-6 backdrop-blur-sm
      ${variantClasses[variant]}
      ${className}
    `}>
      {title && (
        <h2 className="text-2xl font-bold mb-4 text-center">
          {title}
        </h2>
      )}
      {children}
    </div>
  );
};