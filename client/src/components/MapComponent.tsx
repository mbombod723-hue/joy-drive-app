import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAppStore } from '../store/useStore';

interface MapComponentProps {
  pickupLocation?: string;
  destinationLocation?: string;
}

export function MapComponent({ pickupLocation, destinationLocation }: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const { theme } = useAppStore();
  const markerRef = useRef<L.Marker | null>(null);
  const driverMarkerRef = useRef<L.Marker | null>(null);
  const routeRef = useRef<L.Polyline | null>(null);
  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initialize map only once
    if (mapRef.current) return;

    const mapContainer = document.getElementById('map-container');
    if (!mapContainer) return;

    // Initialize map
    mapRef.current = L.map('map-container', {
      center: [-26.2023, 28.0436], // Johannesburg
      zoom: 13,
      zoomControl: true,
      attributionControl: false, // Hide attribution
    });

    // Add tile layer with light theme
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '',
      maxZoom: 19,
    }).addTo(mapRef.current);

    // Set default location
    const defaultLocation: [number, number] = [-26.2023, 28.0436];
    setUserLocation(defaultLocation);

    // Add user marker immediately
    const userIcon = L.divIcon({
      html: '<div style="width: 20px; height: 20px; background: #10B981; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);"></div>',
      iconSize: [20, 20],
      className: 'user-marker',
    });
    
    if (markerRef.current) markerRef.current.remove();
    markerRef.current = L.marker(defaultLocation, { icon: userIcon }).addTo(mapRef.current);

    // Start simulation immediately
    simulateDriver(defaultLocation);

    // Try to get actual geolocation in background
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const userLoc: [number, number] = [latitude, longitude];
          setUserLocation(userLoc);
          mapRef.current?.setView(userLoc, 15);
          if (markerRef.current) markerRef.current.remove();
          markerRef.current = L.marker(userLoc, { icon: userIcon }).addTo(mapRef.current!);
          
          // Restart simulation with new location
          if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
          simulateDriver(userLoc);
        },
        () => {
          // Silently fail - use default location
        },
        { timeout: 5000 }
      );
    }

    return () => {
      // Cleanup on unmount
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
    };
  }, []);

  const simulateDriver = (userPos: [number, number] | null) => {
    if (!userPos) return;
    if (!mapRef.current) return;

    // Clear previous simulation
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
    }

    // Random destination nearby
    const destLat = userPos[0] + (Math.random() - 0.5) * 0.05;
    const destLng = userPos[1] + (Math.random() - 0.5) * 0.05;
    const destination: [number, number] = [destLat, destLng];

    // Create route
    if (routeRef.current) routeRef.current.remove();
    routeRef.current = L.polyline([userPos, destination], {
      color: '#3B82F6',
      weight: 4,
      opacity: 0.7,
      dashArray: '5, 5',
    }).addTo(mapRef.current);

    // Animate driver marker
    let progress = 0;
    const steps = 100;
    const stepDuration = 50; // ms per step

    simulationIntervalRef.current = setInterval(() => {
      progress += 1 / steps;
      if (progress > 1) {
        progress = 0; // Loop the animation
      }

      const lat = userPos[0] + (destination[0] - userPos[0]) * progress;
      const lng = userPos[1] + (destination[1] - userPos[1]) * progress;

      // Remove old marker
      if (driverMarkerRef.current) driverMarkerRef.current.remove();

      // Create futuristic vehicle marker (SVG)
      const vehicleSvg = `
        <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
          <!-- Futuristic vehicle design -->
          <defs>
            <linearGradient id="vehicleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#10B981;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
            </linearGradient>
          </defs>
          <!-- Main body -->
          <path d="M 8 15 L 12 8 L 28 8 L 32 15 L 32 28 Q 32 32 28 32 L 12 32 Q 8 32 8 28 Z" fill="url(#vehicleGrad)" stroke="#047857" stroke-width="1.5"/>
          <!-- Windows -->
          <rect x="10" y="10" width="8" height="6" fill="#E0F2FE" opacity="0.8" rx="1"/>
          <rect x="22" y="10" width="8" height="6" fill="#E0F2FE" opacity="0.8" rx="1"/>
          <!-- Lights -->
          <circle cx="10" cy="30" r="2" fill="#FFD700"/>
          <circle cx="30" cy="30" r="2" fill="#FFD700"/>
          <!-- Accent line -->
          <line x1="8" y1="20" x2="32" y2="20" stroke="#FCD34D" stroke-width="1" opacity="0.6"/>
        </svg>
      `;

      const icon = L.divIcon({
        html: vehicleSvg,
        iconSize: [40, 40],
        className: 'driver-marker',
      });

      driverMarkerRef.current = L.marker([lat, lng], { icon }).addTo(mapRef.current!);
    }, stepDuration);
  };

  return (
    <div id="map-container" className="w-full h-full rounded-lg overflow-hidden relative">
      <style>{`
        #map-container {
          background: #f5f5f5;
        }
        .dark #map-container {
          background: #1a1a1a;
        }
        .leaflet-control-attribution {
          display: none !important;
        }
        .driver-marker {
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
        }
      `}</style>
    </div>
  );
}
