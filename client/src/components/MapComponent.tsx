import React, { useEffect, useRef, useState } from 'react';
import { Navigation2, Globe } from 'lucide-react';
import { useAppStore } from '../store/useStore';

declare global {
  interface Window {
    google: any;
  }
}

interface MapComponentProps {
  pickupLocation?: string;
  destinationLocation?: string;
  onRouteCalculated?: (distance: string, duration: string) => void;
}

export const MapComponent: React.FC<MapComponentProps> = ({ 
  pickupLocation, 
  destinationLocation,
  onRouteCalculated 
}) => {
  const { theme } = useAppStore();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const driverMarkerRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [driverPos, setDriverPos] = useState<{ lat: number; lng: number }>({ lat: -26.2041, lng: 28.0473 });
  const [animationStep, setAnimationStep] = useState(0);
  const [routePoints, setRoutePoints] = useState<Array<{ lat: number; lng: number }>>([]);

  // Initialize map with Google Maps
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Load Google Maps script
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDIM95BODYVQMfk7rGIfhHtEklTrL8lcxA&libraries=places,geometry,directions`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      document.head.appendChild(script);
    } else {
      initializeMap();
    }

    function initializeMap() {
      if (!mapRef.current) return;

      const mapOptions = {
        zoom: 15,
        center: { lat: -26.2041, lng: 28.0473 },
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
        zoomControl: false,
        styles: theme === 'dark' ? getDarkMapStyle() : getLightMapStyle(),
      };

      const map = new window.google.maps.Map(mapRef.current, mapOptions);
      mapInstanceRef.current = map;

      // Get user location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLoc = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setUserLocation(userLoc);
            map.setCenter(userLoc);

            // Add user marker
            const userIcon = {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#10B981',
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 3,
            };

            userMarkerRef.current = new window.google.maps.Marker({
              position: userLoc,
              map: map,
              icon: userIcon,
              title: 'Your Location',
            });
          },
          (error) => {
            console.log('Location error:', error);
            setUserLocation({ lat: -26.2041, lng: 28.0473 });
          }
        );
      }

      // Add driver marker
      const driverIcon = document.createElement('div');
      driverIcon.innerHTML = `
        <div style="
          width: 50px; 
          height: 50px; 
          background: linear-gradient(135deg, #10B981 0%, #059669 100%); 
          border-radius: 12px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4); 
          color: white; 
          font-size: 28px; 
          font-weight: bold; 
          border: 3px solid white;
          position: relative;
          overflow: hidden;
        ">
          <div style="position: absolute; width: 100%; height: 100%; background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%);"></div>
          🚗
        </div>
      `;

      driverMarkerRef.current = new window.google.maps.marker.AdvancedMarkerElement({
        position: driverPos,
        map: map,
        content: driverIcon,
        title: 'Driver',
      });
    }
  }, [theme]);

  // Animate driver movement
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationStep(prev => (prev + 1) % (routePoints.length > 0 ? routePoints.length * 10 : 60));
    }, 500);

    return () => clearInterval(interval);
  }, [routePoints]);

  // Update driver position
  useEffect(() => {
    if (routePoints.length === 0) return;

    const segmentIndex = Math.floor(animationStep / 10);
    const segmentProgress = (animationStep % 10) / 10;

    if (segmentIndex < routePoints.length - 1) {
      const start = routePoints[segmentIndex];
      const end = routePoints[segmentIndex + 1];

      const lat = start.lat + (end.lat - start.lat) * segmentProgress;
      const lng = start.lng + (end.lng - start.lng) * segmentProgress;

      setDriverPos({ lat, lng });

      if (driverMarkerRef.current) {
        driverMarkerRef.current.position = { lat, lng };
      }
    }
  }, [animationStep, routePoints]);

  // Calculate route when locations change
  useEffect(() => {
    if (!pickupLocation || !destinationLocation || !mapInstanceRef.current) return;

    const directionsService = new window.google.maps.DirectionsService();
    const directionsRenderer = new window.google.maps.DirectionsRenderer({
      map: mapInstanceRef.current,
      polylineOptions: {
        strokeColor: '#3B82F6',
        strokeWeight: 4,
        strokeOpacity: 0.8,
      },
    });

    directionsService.route(
      {
        origin: pickupLocation,
        destination: destinationLocation,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result: any, status: any) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          directionsRenderer.setDirections(result);

          // Extract route points
          const route = result.routes[0];
          const points = [];
          for (let i = 0; i < route.legs.length; i++) {
            const leg = route.legs[i];
            for (let j = 0; j < leg.steps.length; j++) {
              const step = leg.steps[j];
              const path = step.path;
              for (let k = 0; k < path.length; k++) {
                points.push({ lat: path[k].lat(), lng: path[k].lng() });
              }
            }
          }
          setRoutePoints(points);

          // Get distance and duration
          const distance = route.legs[0].distance.text;
          const duration = route.legs[0].duration.text;
          onRouteCalculated?.(distance, duration);
        }
      }
    );
  }, [pickupLocation, destinationLocation, onRouteCalculated]);

  const handleRecenter = () => {
    if (mapInstanceRef.current && userLocation) {
      mapInstanceRef.current.setCenter(userLocation);
    }
  };

  const handleWorldView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter({ lat: 20, lng: 0 });
      mapInstanceRef.current.setZoom(3);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-gray-100 dark:bg-gray-900 z-0">
      {/* Map Container */}
      <div 
        ref={mapRef}
        className="w-full h-full"
        style={{ minHeight: '200px', zIndex: 0 }}
      />

      {/* Status Badge */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 z-20 pointer-events-none">
        <div className="bg-emerald-500 text-white text-[11px] font-bold px-3 py-2 rounded-full flex items-center gap-2 shadow-lg">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          Live GPS
        </div>
      </div>

      {/* Driver Info Card */}
      {routePoints.length > 0 && (
        <div className="absolute bottom-4 left-4 right-4 lg:left-auto lg:right-auto lg:bottom-8 lg:left-1/2 lg:-translate-x-1/2 z-20 max-w-xs pointer-events-none">
          <div className={`p-4 rounded-2xl shadow-2xl border border-emerald-500/30 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <span className="text-2xl">🚗</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm">Driver Approaching</h3>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>ETA: 2-3 minutes</p>
                <div className="mt-1 w-full bg-gray-300 dark:bg-gray-700 rounded-full h-1.5">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${(animationStep / (routePoints.length * 10)) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-20">
        <button 
          onClick={handleWorldView}
          className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-xl text-emerald-500 dark:text-emerald-400 active:scale-95 transition-transform flex items-center gap-2 hover:shadow-2xl"
          title="World View"
        >
          <Globe className="w-6 h-6" />
        </button>
        <button 
          onClick={handleRecenter}
          className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-xl text-emerald-500 dark:text-emerald-400 active:scale-95 transition-transform hover:shadow-2xl"
          title="Recenter"
        >
          <Navigation2 className="w-6 h-6 fill-current" />
        </button>
      </div>
    </div>
  );
};

// Light map style - white background with gray roads
function getLightMapStyle() {
  return [
    { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
    { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#f5f5f5' }] },
    { featureType: 'administrative.land_parcel', elementType: 'labels.text.fill', stylers: [{ color: '#bdbdbd' }] },
    { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#eeeeee' }] },
    { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
    { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#e5e5e5' }] },
    { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
    { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#fafafa' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#f0f0f0' }] },
    { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
    { featureType: 'road.local', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
    { featureType: 'transit.line', elementType: 'geometry', stylers: [{ color: '#e5e5e5' }] },
    { featureType: 'transit.station', elementType: 'geometry', stylers: [{ color: '#eeeeee' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9c9c9' }] },
    { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
  ];
}

// Dark map style
function getDarkMapStyle() {
  return [
    { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
    { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
    { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
    { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#263c3f' }] },
    { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#6b9080' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
    { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
    { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#746855' }] },
    { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1f2835' }] },
    { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#f3751ff' }] },
    { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#2f3948' }] },
    { featureType: 'transit.station', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
    { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#515c6d' }] },
    { featureType: 'water', elementType: 'labels.text.stroke', stylers: [{ color: '#17263c' }] },
  ];
}
