'use client';

import React, { useEffect, useRef } from 'react';

interface ScreenReaderAnnouncerProps {
  message: string;
  priority?: 'polite' | 'assertive';
  clearAfter?: number;
}

export const ScreenReaderAnnouncer: React.FC<ScreenReaderAnnouncerProps> = ({
  message,
  priority = 'polite',
  clearAfter = 5000
}) => {
  const announcerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (message && announcerRef.current) {
      // Clear previous message
      announcerRef.current.textContent = '';
      
      // Set new message after a brief delay to ensure screen readers pick it up
      setTimeout(() => {
        if (announcerRef.current) {
          announcerRef.current.textContent = message;
        }
      }, 100);

      // Clear message after specified time
      if (clearAfter > 0) {
        setTimeout(() => {
          if (announcerRef.current) {
            announcerRef.current.textContent = '';
          }
        }, clearAfter);
      }
    }
  }, [message, clearAfter]);

  return (
    <div
      ref={announcerRef}
      className="sr-only"
      aria-live={priority}
      aria-atomic="true"
      role="status"
    />
  );
};

// Hook for managing screen reader announcements
export const useScreenReaderAnnouncer = () => {
  const [announcement, setAnnouncement] = React.useState<{
    message: string;
    priority: 'polite' | 'assertive';
  } | null>(null);

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    setAnnouncement({ message, priority });
  };

  const clear = () => {
    setAnnouncement(null);
  };

  return {
    announce,
    clear,
    ScreenReaderAnnouncer: () => announcement ? (
      <ScreenReaderAnnouncer 
        message={announcement.message} 
        priority={announcement.priority}
      />
    ) : null
  };
};