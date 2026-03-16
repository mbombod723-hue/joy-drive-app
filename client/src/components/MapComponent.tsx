import React from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { Navigation2, Globe } from 'lucide-react';
import { useAppStore } from '../store/useStore';
import { translations } from '../translations';

const containerStyle = {
  width: '100%',
  height: '100%'
};

const center = {
  lat: -26.2041,
  lng: 28.0473 // Johannesburg
};

const lightMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#FFFFFF" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#FFFFFF" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#EEEEEE" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#F5F5F5" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#F0F0F0" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#E0E0E0" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#9E9E9E" }] },
  { featureType: "transit.line", elementType: "geometry", stylers: [{ color: "#E5E5E5" }] },
  { featureType: "transit.station", elementType: "geometry", stylers: [{ color: "#EEEEEE" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#00C17C" }, { opacity: 0.1 }] },
];

const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#0D1F17" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0D1F17" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8BA89A" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1A2E24" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#00C17C" }, { opacity: 0.2 }] },
];

type SimPhase = 'idle' | 'driver_approaching' | 'arrived' | 'on_trip';

export const MapComponent: React.FC = () => {
  const { language, theme, activeTrip } = useAppStore();
  const t = translations[language];
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  });

  const [map, setMap] = React.useState<google.maps.Map | null>(null);
  const [userPos, setUserPos] = React.useState(center);
  const [simPos, setSimPos] = React.useState(center);
  const [heading, setHeading] = React.useState(0);
  const [phase, setPhase] = React.useState<SimPhase>('idle');

  // Auto-positioning
  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserPos(pos);
          setSimPos(pos);
        },
        () => {
          console.log("Geolocation failed or denied");
        }
      );
    }
  }, []);

  // Simulation logic
  React.useEffect(() => {
    if (!activeTrip || activeTrip.status === 'searching') {
      setPhase('idle');
      return;
    }

    let interval: any;
    let step = 0;

    if (activeTrip.status === 'active') {
      // Phase 1: Driver approaching
      setPhase('driver_approaching');
      // Driver starts a bit away
      const driverStart = {
        lat: userPos.lat + 0.005,
        lng: userPos.lng + 0.005
      };
      setSimPos(driverStart);

      interval = setInterval(() => {
        setSimPos(prev => {
          const dLat = userPos.lat - prev.lat;
          const dLng = userPos.lng - prev.lng;
          const dist = Math.sqrt(dLat * dLat + dLng * dLng);

          if (dist < 0.0001) {
            setPhase('arrived');
            return userPos;
          }

          // Move towards user
          const moveLat = dLat * 0.1;
          const moveLng = dLng * 0.1;
          
          // Calculate heading
          const angle = Math.atan2(moveLng, moveLat) * (180 / Math.PI);
          setHeading(angle);

          return {
            lat: prev.lat + moveLat,
            lng: prev.lng + moveLng
          };
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [activeTrip, userPos]);

  // Trip simulation after arrival
  React.useEffect(() => {
    if (phase !== 'arrived') return;

    const timeout = setTimeout(() => {
      setPhase('on_trip');
    }, 3000);

    return () => clearTimeout(timeout);
  }, [phase]);

  React.useEffect(() => {
    if (phase !== 'on_trip') return;

    const interval = setInterval(() => {
      setSimPos(prev => {
        // Simple "following avenues" logic: move in cardinal directions
        const direction = Math.floor(Math.random() * 4);
        let nextLat = prev.lat;
        let nextLng = prev.lng;
        let nextHeading = heading;

        if (direction === 0) { nextLat += 0.0002; nextHeading = 0; }
        else if (direction === 1) { nextLat -= 0.0002; nextHeading = 180; }
        else if (direction === 2) { nextLng += 0.0002; nextHeading = 90; }
        else if (direction === 3) { nextLng -= 0.0002; nextHeading = 270; }

        setHeading(nextHeading);
        return { lat: nextLat, lng: nextLng };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [phase]);

  const onLoad = React.useCallback(function callback(m: google.maps.Map) {
    setMap(m);
  }, []);

  const onUnmount = React.useCallback(function callback() {
    setMap(null);
  }, []);

  const handleRecenter = () => {
    if (map) {
      map.panTo(simPos);
      map.setZoom(16);
    }
  };

  const handleWorldView = () => {
    if (map) {
      map.setZoom(3);
    }
  };

  const carIcon = React.useMemo(() => {
    if (!isLoaded || typeof google === 'undefined') return undefined;
    
    return {
      // Modern car top view SVG path
      path: "M12 2c-1.1 0-2 .9-2 2v1h4V4c0-1.1-.9-2-2-2zm6 5H6c-1.1 0-2 .9-2 2v9c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm-1 11h-2v-2h2v2zm-8 0H7v-2h2v2zm9-5H6V9h12v4z",
      fillColor: '#00C17C',
      fillOpacity: 1,
      strokeWeight: 2,
      strokeColor: '#FFFFFF',
      scale: 2,
      anchor: new google.maps.Point(12, 12),
      rotation: heading,
    };
  }, [isLoaded, heading]);

  return isLoaded ? (
    <div className="relative w-full h-full overflow-hidden">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={simPos}
        zoom={15}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          styles: theme === 'dark' ? darkMapStyle : lightMapStyle,
          disableDefaultUI: true,
          zoomControl: false,
          minZoom: 2,
          maxZoom: 20,
          clickableIcons: false,
        }}
      >
        <Marker 
          position={simPos} 
          icon={carIcon}
        />
      </GoogleMap>

      <div className="absolute top-4 left-4 flex flex-col gap-2">
        <div className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          {t.liveGps}
        </div>
        <div className="bg-joy-dark/80 backdrop-blur-sm text-white text-[8px] px-2 py-1 rounded-full">
          {t.simulationActive}
        </div>
      </div>

      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <button 
          onClick={handleWorldView}
          className="p-3 bg-white dark:bg-joy-dark rounded-2xl shadow-xl text-emerald-500 active:scale-95 transition-transform flex items-center gap-2"
        >
          <Globe className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase hidden lg:block">{t.worldView}</span>
        </button>
        <button 
          onClick={handleRecenter}
          className="p-3 bg-white dark:bg-joy-dark rounded-2xl shadow-xl text-emerald-500 active:scale-95 transition-transform"
        >
          <Navigation2 className="w-6 h-6 fill-current" />
        </button>
      </div>
    </div>
  ) : (
    <div className="w-full h-full bg-joy-dark flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
};
