import { useState, useRef, useEffect } from 'react';
import { Search, X, MapPin } from 'lucide-react';

interface AddressSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (address: string, lat: number, lng: number) => void;
  placeholder?: string;
  label?: string;
  allowStop?: boolean;
}

interface AddressSuggestion {
  address: string;
  lat: number;
  lng: number;
}

export function AddressSearch({
  value,
  onChange,
  onSelect,
  placeholder = "Enter address",
  label,
  allowStop = false,
}: AddressSearchProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // South African cities and areas for fallback suggestions
  const saAreas = [
    { address: 'Sandton, Johannesburg', lat: -26.1087, lng: 28.0545 },
    { address: 'Midrand, Johannesburg', lat: -25.9876, lng: 28.1100 },
    { address: 'Rosebank, Johannesburg', lat: -26.1361, lng: 28.0492 },
    { address: 'Fourways, Johannesburg', lat: -25.9289, lng: 28.0169 },
    { address: 'Bryanston, Johannesburg', lat: -26.0794, lng: 28.0314 },
    { address: 'Randburg, Johannesburg', lat: -26.1447, lng: 27.9754 },
    { address: 'Parktown, Johannesburg', lat: -26.1850, lng: 28.0364 },
    { address: 'Melville, Johannesburg', lat: -26.1508, lng: 28.0236 },
    { address: 'Braamfontein, Johannesburg', lat: -26.1950, lng: 28.0364 },
    { address: 'Soweto, Johannesburg', lat: -26.2667, lng: 27.8667 },
    { address: 'Pretoria, South Africa', lat: -25.7461, lng: 28.2293 },
    { address: 'Cape Town, South Africa', lat: -33.9249, lng: 18.4241 },
    { address: 'Durban, South Africa', lat: -29.8587, lng: 31.0218 },
  ];

  const searchAddresses = async (query: string) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      // Try to use Google Maps API if available
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      
      if (apiKey) {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${apiKey}&components=country:za&region=za`
        );
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.predictions && data.predictions.length > 0) {
            // Get details for each prediction
            const detailedSuggestions = await Promise.all(
              data.predictions.slice(0, 5).map(async (prediction: any) => {
                try {
                  const detailResponse = await fetch(
                    `https://maps.googleapis.com/maps/api/place/details/json?place_id=${prediction.place_id}&key=${apiKey}`
                  );
                  
                  if (detailResponse.ok) {
                    const detailData = await detailResponse.json();
                    const location = detailData.result?.geometry?.location;
                    
                    if (location) {
                      return {
                        address: prediction.description,
                        lat: location.lat,
                        lng: location.lng,
                      };
                    }
                  }
                } catch (error) {
                  console.error('Error fetching place details:', error);
                }
                
                return null;
              })
            );
            
            setSuggestions(detailedSuggestions.filter((s): s is AddressSuggestion => s !== null));
            setIsOpen(true);
            return;
          }
        }
      }
      
      // Fallback: filter SA areas by query
      const filtered = saAreas.filter(area =>
        area.address.toLowerCase().includes(query.toLowerCase())
      );
      
      setSuggestions(filtered);
      setIsOpen(true);
    } catch (error) {
      console.error('Error searching addresses:', error);
      // Fallback to local search
      const filtered = saAreas.filter(area =>
        area.address.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filtered);
      setIsOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      searchAddresses(value);
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
    <div className="relative w-full">
      {label && (
        <label className="block text-sm font-medium mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <Search className="w-5 h-5" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => value && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        
        {value && (
          <button
            onClick={() => {
              onChange('');
              setSuggestions([]);
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Suggestions dropdown */}
      {isOpen && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
        >
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="inline-block animate-spin">
                <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full" />
              </div>
              <p className="mt-2">Searching...</p>
            </div>
          ) : suggestions.length > 0 ? (
            <>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    onSelect(suggestion.address, suggestion.lat, suggestion.lng);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-600 border-b border-gray-200 dark:border-gray-600 last:border-b-0 flex items-start gap-3"
                >
                  <MapPin className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {suggestion.address}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {suggestion.lat.toFixed(4)}, {suggestion.lng.toFixed(4)}
                    </p>
                  </div>
                </button>
              ))}
              
              {allowStop && (
                <button
                  onClick={() => {
                    // Add stop functionality
                    console.log('Add stop:', value);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-600 border-t border-gray-200 dark:border-gray-600 text-green-600 dark:text-green-400 font-medium flex items-center gap-2"
                >
                  <MapPin className="w-5 h-5" />
                  Add Stop
                </button>
              )}
            </>
          ) : value && !isLoading ? (
            <div className="p-4 text-center text-gray-500">
              No addresses found
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
