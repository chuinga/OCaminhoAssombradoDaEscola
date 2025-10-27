'use client';

import React from 'react';

export const ColorblindFilters: React.FC = () => {
  return (
    <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
      <defs>
        {/* Protanopia Filter (Red-blind) */}
        <filter id="protanopia-filter">
          <feColorMatrix
            type="matrix"
            values="0.567 0.433 0.000 0.000 0.000
                    0.558 0.442 0.000 0.000 0.000
                    0.000 0.242 0.758 0.000 0.000
                    0.000 0.000 0.000 1.000 0.000"
          />
        </filter>

        {/* Deuteranopia Filter (Green-blind) */}
        <filter id="deuteranopia-filter">
          <feColorMatrix
            type="matrix"
            values="0.625 0.375 0.000 0.000 0.000
                    0.700 0.300 0.000 0.000 0.000
                    0.000 0.300 0.700 0.000 0.000
                    0.000 0.000 0.000 1.000 0.000"
          />
        </filter>

        {/* Tritanopia Filter (Blue-blind) */}
        <filter id="tritanopia-filter">
          <feColorMatrix
            type="matrix"
            values="0.950 0.050 0.000 0.000 0.000
                    0.000 0.433 0.567 0.000 0.000
                    0.000 0.475 0.525 0.000 0.000
                    0.000 0.000 0.000 1.000 0.000"
          />
        </filter>
      </defs>
    </svg>
  );
};