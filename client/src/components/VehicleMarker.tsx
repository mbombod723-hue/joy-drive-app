import React from 'react';

interface VehicleMarkerProps {
  type: string;
  color: string;
  rotation?: number;
}

export function VehicleMarker({ type, color, rotation = 0 }: VehicleMarkerProps) {
  return (
    <div
      style={{
        transform: `rotate(${rotation}deg)`,
        transition: 'transform 0.3s ease',
      }}
      className="relative w-12 h-12"
    >
      {/* Modern car SVG */}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full filter drop-shadow-lg"
        style={{ color }}
      >
        {/* Car body with gradient */}
        <defs>
          <linearGradient id="carGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: color, stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: color, stopOpacity: 0.8 }} />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Main car body */}
        <path
          d="M 20 50 L 30 30 L 70 30 L 80 50 L 80 70 Q 80 80 70 80 L 30 80 Q 20 80 20 70 Z"
          fill="url(#carGradient)"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="2"
          filter="url(#glow)"
        />

        {/* Windows */}
        <rect x="35" y="35" width="15" height="12" fill="rgba(135, 206, 250, 0.6)" rx="2" />
        <rect x="55" y="35" width="15" height="12" fill="rgba(135, 206, 250, 0.6)" rx="2" />

        {/* Front lights */}
        <circle cx="25" cy="50" r="3" fill="#ffff00" opacity="0.8" />
        <circle cx="75" cy="50" r="3" fill="#ffff00" opacity="0.8" />

        {/* Wheels */}
        <circle cx="35" cy="80" r="6" fill="#333" />
        <circle cx="35" cy="80" r="4" fill="#555" />
        <circle cx="65" cy="80" r="6" fill="#333" />
        <circle cx="65" cy="80" r="4" fill="#555" />

        {/* Accent line */}
        <line x1="20" y1="60" x2="80" y2="60" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
      </svg>

      {/* Glow effect */}
      <div
        className="absolute inset-0 rounded-full opacity-30 blur-md"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}
