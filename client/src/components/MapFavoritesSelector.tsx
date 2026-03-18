import { useEffect, useRef, useState } from 'react';
import { MapPin, Home, Briefcase, Dumbbell, Star, X, Plus, Loader } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { createDraggableMarker, updateMarkerPosition } from '@/lib/draggableMarker';

interface MapFavoritesSelectorProps {
  onFavoritesLoaded?: (favorites: any[]) => void;
  onFavoriteSelected?: (favorite: any) => void;
  theme?: 'light' | 'dark';
}

const ICON_COLORS: Record<string, string> = {
  Home: '#EF4444',      // Red
  Briefcase: '#3B82F6', // Blue
  Dumbbell: '#F59E0B',  // Amber
  Star: '#8B5CF6',      // Purple
  MapPin: '#10B981',    // Green
};

const ICON_COMPONENTS: Record<string, any> = {
  Home,
  Briefcase,
  Dumbbell,
  Star,
  MapPin,
};

export function MapFavoritesSelector({ onFavoritesLoaded, onFavoriteSelected, theme = 'light' }: MapFavoritesSelectorProps) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<number, google.maps.Marker>>(new Map());
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFavoriteCoords, setNewFavoriteCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [newFavoriteAddress, setNewFavoriteAddress] = useState('');
  const [isGeocodingAddress, setIsGeocodingAddress] = useState(false);

  // Get favorites
  const { data: favorites, isLoading, refetch } = trpc.favorites.list.useQuery();

  // Update favorite mutation
  const updateFavoriteMutation = trpc.favorites.update.useMutation({
    onSuccess: () => {
      toast.success('Favorite location updated');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update favorite');
    },
  });

  // Add favorite mutation
  const addMutation = trpc.favorites.add.useMutation({
    onSuccess: () => {
      toast.success('Favorite added to map');
      setShowAddForm(false);
      setNewFavoriteCoords(null);
      setNewFavoriteAddress('');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add favorite');
    },
  });

  // Initialize Google Map
  useEffect(() => {
    if (mapRef.current) return;

    const mapContainer = document.getElementById('map-favorites-container');
    if (!mapContainer) return;

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error('Google Maps API key not configured');
      return;
    }

    // Load Google Maps script if not already loaded
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geocoding`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        initializeMap();
      };
      document.head.appendChild(script);
    } else {
      initializeMap();
    }

    function initializeMap() {
      mapRef.current = new google.maps.Map(mapContainer as HTMLElement, {
        zoom: 13,
        center: { lat: -26.2023, lng: 28.0436 }, // Johannesburg
        mapTypeControl: true,
        fullscreenControl: true,
        streetViewControl: false,
      });

      // Add click listener to add favorites
      mapRef.current.addListener('click', (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
          const lat = event.latLng.lat();
          const lng = event.latLng.lng();
          setNewFavoriteCoords({ lat, lng });
          reverseGeocode(lat, lng);
          setShowAddForm(true);
        }
      });

      // Center map on user location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          mapRef.current?.setCenter({ lat: userLat, lng: userLng });
        }, (error) => {
          console.log('Geolocation error:', error);
        });
      }

      // Load favorites
      if (favorites && favorites.length > 0) {
        loadFavoritesOnMap(favorites);
      }
    }
  }, []);

  // Load favorites on map when they change
  useEffect(() => {
    if (favorites && mapRef.current) {
      loadFavoritesOnMap(favorites);
      if (onFavoritesLoaded) {
        onFavoritesLoaded(favorites);
      }
    }
  }, [favorites, onFavoritesLoaded]);

  const loadFavoritesOnMap = (favs: any[]) => {
    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current.clear();

    // Add new markers with drag & drop support
    favs.forEach((favorite) => {
      const lat = parseFloat(favorite.latitude);
      const lng = parseFloat(favorite.longitude);

      if (isNaN(lat) || isNaN(lng)) return;

      const marker = createDraggableMarker({
        position: { lat, lng },
        map: mapRef.current!,
        title: favorite.label,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: ICON_COLORS[favorite.icon] || '#10B981',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
        },
        onDragEnd: (newLat, newLng) => {
          // Update favorite coordinates
          updateFavoriteMutation.mutate({
            id: favorite.id,
            address: favorite.address,
          } as any);
        },
      });

      marker.addListener('click', () => {
        setSelectedMarker(favorite.id);
        showFavoriteInfoWindow(marker, favorite);
        if (onFavoriteSelected) {
          onFavoriteSelected(favorite);
        }
      });

      markersRef.current.set(favorite.id, marker);
    });
  };

  const showFavoriteInfoWindow = (marker: google.maps.Marker, favorite: any) => {
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
    }

    const IconComponent = ICON_COMPONENTS[favorite.icon] || MapPin;
    const content = `
      <div style="padding: 10px; max-width: 250px;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <div style="width: 24px; height: 24px; background-color: ${ICON_COLORS[favorite.icon] || '#10B981'}; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: white;">
            📍
          </div>
          <h3 style="margin: 0; font-weight: bold; font-size: 14px;">${favorite.label}</h3>
        </div>
        <p style="margin: 0; font-size: 12px; color: #666;">${favorite.address}</p>
        <p style="margin: 4px 0 0 0; font-size: 11px; color: #999;">Lat: ${parseFloat(favorite.latitude).toFixed(4)}, Lng: ${parseFloat(favorite.longitude).toFixed(4)}</p>
      </div>
    `;

    infoWindowRef.current = new google.maps.InfoWindow({
      content,
    });

    infoWindowRef.current.open(mapRef.current, marker);
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    setIsGeocodingAddress(true);
    try {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          setNewFavoriteAddress(data.results[0].formatted_address);
        }
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    } finally {
      setIsGeocodingAddress(false);
    }
  };

  const handleAddFavorite = async () => {
    if (!newFavoriteCoords || !newFavoriteAddress) {
      toast.error('Please select a location and address');
      return;
    }

    const label = prompt('Enter a label for this favorite (e.g., Home, Work):');
    if (!label) return;

    await addMutation.mutateAsync({
      label,
      address: newFavoriteAddress,
      latitude: newFavoriteCoords.lat.toString(),
      longitude: newFavoriteCoords.lng.toString(),
      icon: 'MapPin',
    });
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Map Container */}
      <div
        id="map-favorites-container"
        className="flex-1 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600"
        style={{ minHeight: '400px' }}
      />

      {/* Add Favorite Form */}
      {showAddForm && newFavoriteCoords && (
        <div className={`mt-4 p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Favorite Location
            </h3>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewFavoriteCoords(null);
                setNewFavoriteAddress('');
              }}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Coordinates</label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Lat: {newFavoriteCoords.lat.toFixed(4)}, Lng: {newFavoriteCoords.lng.toFixed(4)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newFavoriteAddress}
                  onChange={(e) => setNewFavoriteAddress(e.target.value)}
                  placeholder="Address"
                  className={`flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
                {isGeocodingAddress && (
                  <div className="flex items-center">
                    <Loader className="w-4 h-4 animate-spin" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAddFavorite}
                disabled={addMutation.isPending || !newFavoriteAddress}
                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {addMutation.isPending ? 'Adding...' : 'Add Favorite'}
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewFavoriteCoords(null);
                  setNewFavoriteAddress('');
                }}
                className="flex-1 px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      {!showAddForm && (
        <div className={`mt-4 p-3 rounded-lg text-sm text-center ${theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
          Click on the map to add a favorite location
        </div>
      )}
    </div>
  );
}
