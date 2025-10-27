'use client';

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'orange' | 'purple' | 'white';
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = 'orange',
  text
}) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  };

  const colorClasses = {
    orange: 'border-orange-500 border-t-orange-200',
    purple: 'border-purple-500 border-t-purple-200',
    white: 'border-white border-t-gray-300'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={`
        ${sizeClasses[size]}
        border-4 rounded-full animate-spin
        ${colorClasses[color]}
      `} />
      {text && (
        <p className="text-center font-medium">
          {text}
        </p>
      )}
    </div>
  );
};