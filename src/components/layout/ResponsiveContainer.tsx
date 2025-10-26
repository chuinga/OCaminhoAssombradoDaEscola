import { ReactNode } from 'react';

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | '7xl';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md', 
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
};

const paddingClasses = {
  none: '',
  sm: 'px-4 py-2',
  md: 'px-4 py-4 sm:px-6 sm:py-6',
  lg: 'px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10',
};

export function ResponsiveContainer({ 
  children, 
  className = '', 
  maxWidth = '4xl',
  padding = 'md'
}: ResponsiveContainerProps) {
  return (
    <div className={`
      w-full mx-auto
      ${maxWidthClasses[maxWidth]}
      ${paddingClasses[padding]}
      ${className}
    `}>
      {children}
    </div>
  );
}