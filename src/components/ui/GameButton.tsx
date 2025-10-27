'use client';

import React from 'react';

interface GameButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'halloween';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  className?: string;
}

export const GameButton: React.FC<GameButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  className = ''
}) => {
  const baseClasses = 'font-bold rounded-lg transition-all duration-200 transform active:scale-95 shadow-lg';
  
  const variantClasses = {
    primary: 'bg-gradient-to-b from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white border-2 border-blue-800',
    secondary: 'bg-gradient-to-b from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800 text-white border-2 border-gray-800',
    danger: 'bg-gradient-to-b from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white border-2 border-red-800',
    halloween: 'bg-gradient-to-b from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800 text-white border-2 border-orange-800 shadow-orange-900/50'
  };
  
  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-6 py-3 text-base',
    large: 'px-8 py-4 text-lg'
  };
  
  const disabledClasses = disabled 
    ? 'opacity-50 cursor-not-allowed transform-none' 
    : 'hover:shadow-xl cursor-pointer';

  return (
    <button
      onClick={disabled ? undefined : onClick}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${disabledClasses}
        ${className}
      `}
      disabled={disabled}
    >
      {children}
    </button>
  );
};