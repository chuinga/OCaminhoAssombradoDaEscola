'use client';

import React, { useEffect, useState } from 'react';
import { ScreenReaderAnnouncer } from './ScreenReaderAnnouncer';

export const GlobalScreenReaderAnnouncer: React.FC = () => {
  const [announcement, setAnnouncement] = useState<{
    message: string;
    priority: 'polite' | 'assertive';
  } | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    const handleAnnouncement = (event: CustomEvent) => {
      const { message, priority = 'polite' } = event.detail;
      setAnnouncement({ message, priority });
    };

    // Listen for screen reader announcement events
    window.addEventListener('screenReaderAnnounce', handleAnnouncement as EventListener);

    return () => {
      window.removeEventListener('screenReaderAnnounce', handleAnnouncement as EventListener);
    };
  }, [isClient]);

  return isClient && announcement ? (
    <ScreenReaderAnnouncer 
      message={announcement.message} 
      priority={announcement.priority}
      clearAfter={3000}
    />
  ) : null;
};