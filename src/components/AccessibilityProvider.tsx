'use client';

import React, { useEffect } from 'react';
import { useAccessibility } from '../hooks/useAccessibility';

interface AccessibilityProviderProps {
  children: React.ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  useAccessibility();

  return <>{children}</>;
};