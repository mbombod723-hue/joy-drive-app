import React from 'react';

interface DestinationFlagProps {
  size?: 'small' | 'medium' | 'large';
}

export function DestinationFlag({ size = 'medium' }: DestinationFlagProps) {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
  };

  return (
    <div className={`${sizeClasses[size]} relative`}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full filter drop-shadow-lg"
      >
        {/* Flag pole */}
        <line x1="50" y1="10" x2="50" y2="90" stroke="#333" strokeWidth="3" />

        {/* Flag with black and white stripes */}
        <defs>
          <pattern id="flagStripes" x="0" y="0" width="20" height="100" patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="10" height="100" fill="#000" />
            <rect x="10" y="0" width="10" height="100" fill="#fff" />
          </pattern>
        </defs>

        {/* Flag shape */}
        <path
          d="M 50 15 L 85 25 L 85 60 Q 85 70 75 75 L 50 70 Z"
          fill="url(#flagStripes)"
          stroke="#333"
          strokeWidth="2"
        />

        {/* Flag outline for definition */}
        <path
          d="M 50 15 L 85 25 L 85 60 Q 85 70 75 75 L 50 70 Z"
          fill="none"
          stroke="#000"
          strokeWidth="1.5"
        />

        {/* Glow effect */}
        <circle cx="50" cy="80" r="8" fill="#ffff00" opacity="0.4" />
      </svg>
    </div>
  );
}
