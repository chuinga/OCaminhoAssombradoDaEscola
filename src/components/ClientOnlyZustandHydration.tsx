'use client';

import { useEffect, useState } from 'react';

interface ClientOnlyZustandHydrationProps {
  children: React.ReactNode;
}

export function ClientOnlyZustandHydration({ children }: ClientOnlyZustandHydrationProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Wait for client-side hydration to complete
    const timer = setTimeout(() => {
      setIsHydrated(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // During SSR and initial hydration, render without client-specific features
  if (!isHydrated) {
    return <div suppressHydrationWarning>{children}</div>;
  }

  return <>{children}</>;
}