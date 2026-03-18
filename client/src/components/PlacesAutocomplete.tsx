import { useEffect, useRef, useState } from 'react';
import { Search, X, Loader, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlacesAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (place: PlacePrediction) => void;
  placeholder?: string;
  className?: string;
  theme?: 'light' | 'dark';
}

export interface PlacePrediction {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText?: string;
  lat?: number;
  lng?: number;
}

export function PlacesAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = 'Search places...',
  className,
  theme = 'light',
}: PlacesAutocompleteProps) {
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const sessionTokenRef = useRef<string>(new Date().getTime().toString());
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);

  // Initialize Google Places services
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error('Google Maps API key not configured');
      return;
    }

    // Load Google Maps script if not already loaded
    if (!window.google?.maps?.places) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        initializePlacesServices();
      };
      document.head.appendChild(script);
    } else {
      initializePlacesServices();
    }

    function initializePlacesServices() {
      autocompleteServiceRef.current = new google.maps.places.AutocompleteService();

      // Create a dummy map for PlacesService
      const dummyMap = document.createElement('div');
      placesServiceRef.current = new google.maps.places.PlacesService(dummyMap as any);
    }
  }, []);

  // Search for places
  const searchPlaces = async (query: string) => {
    if (!query || query.length < 2) {
      setPredictions([]);
      return;
    }

    if (!autocompleteServiceRef.current) {
      console.error('Autocomplete service not initialized');
      return;
    }

    setIsLoading(true);
    try {
      const request = {
        input: query,
        componentRestrictions: { country: 'za' },
        sessionToken: sessionTokenRef.current,
      };

      const response = await autocompleteServiceRef.current.getPlacePredictions(request);

      if (response.predictions) {
        const formattedPredictions: PlacePrediction[] = response.predictions.map((prediction: any) => ({
          placeId: prediction.place_id,
          description: prediction.description,
          mainText: prediction.main_text || prediction.description,
          secondaryText: prediction.secondary_text,
        }));

        setPredictions(formattedPredictions);
        setIsOpen(true);
      }
    } catch (error) {
      console.error('Error searching places:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get place details
  const getPlaceDetails = async (placeId: string) => {
    if (!placesServiceRef.current) {
      console.error('Places service not initialized');
      return;
    }

    try {
      const request = {
        placeId,
        fields: ['geometry', 'formatted_address', 'name'],
        sessionToken: sessionTokenRef.current,
      };

      placesServiceRef.current.getDetails(request, (place: any, status: any) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          // Find the prediction and update it with coordinates
          const updatedPredictions = predictions.map((pred) =>
            pred.placeId === placeId
              ? {
                  ...pred,
                  lat: place.geometry?.location?.lat(),
                  lng: place.geometry?.location?.lng(),
                }
              : pred
          );

          const selectedPrediction = updatedPredictions.find((p) => p.placeId === placeId);
          if (selectedPrediction) {
            onSelect(selectedPrediction);
            // Generate new session token for next search
            sessionTokenRef.current = new Date().getTime().toString();
          }
        }
      });
    } catch (error) {
      console.error('Error getting place details:', error);
    }
  };

  // Handle input change with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      searchPlaces(value);
    }, 300);

    return () => clearTimeout(timer);
  }, [value]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn('relative w-full', className)}>
      <div className="relative">
        <Search className={cn('absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5', theme === 'dark' ? 'text-gray-400' : 'text-gray-500')} />

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => value && setIsOpen(true)}
          placeholder={placeholder}
          className={cn(
            'w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition',
            theme === 'dark'
              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
          )}
        />

        {value && (
          <button
            onClick={() => {
              onChange('');
              setPredictions([]);
              setIsOpen(false);
            }}
            className={cn('absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded hover:bg-gray-200', theme === 'dark' ? 'hover:bg-gray-600' : '')}
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader className="w-4 h-4 animate-spin" />
          </div>
        )}
      </div>

      {/* Predictions dropdown */}
      {isOpen && predictions.length > 0 && (
        <div
          ref={suggestionsRef}
          className={cn(
            'absolute top-full left-0 right-0 mt-2 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto border',
            theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
          )}
        >
          {predictions.map((prediction) => (
            <button
              key={prediction.placeId}
              onClick={() => {
                getPlaceDetails(prediction.placeId);
                setIsOpen(false);
              }}
              className={cn(
                'w-full text-left px-4 py-3 border-b flex items-start gap-3 hover:bg-opacity-50 transition',
                theme === 'dark'
                  ? 'border-gray-600 hover:bg-gray-600'
                  : 'border-gray-200 hover:bg-gray-50'
              )}
            >
              <MapPin className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className={cn('font-medium', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                  {prediction.mainText}
                </p>
                {prediction.secondaryText && (
                  <p className={cn('text-sm', theme === 'dark' ? 'text-gray-400' : 'text-gray-500')}>
                    {prediction.secondaryText}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && value && !isLoading && predictions.length === 0 && (
        <div
          className={cn(
            'absolute top-full left-0 right-0 mt-2 rounded-lg shadow-lg z-50 p-4 text-center text-sm',
            theme === 'dark' ? 'bg-gray-700 text-gray-400' : 'bg-white text-gray-500'
          )}
        >
          No places found
        </div>
      )}
    </div>
  );
}
