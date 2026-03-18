/**
 * Geocoding utilities for converting coordinates to addresses and vice versa
 */

interface GeocodeResult {
  address: string;
  lat: number;
  lng: number;
  placeId?: string;
  components?: {
    street?: string;
    city?: string;
    province?: string;
    country?: string;
    postalCode?: string;
  };
}

/**
 * Reverse geocode coordinates to get address
 */
export async function reverseGeocode(lat: number, lng: number): Promise<GeocodeResult | null> {
  try {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error('Google Maps API key not configured');
      return null;
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      const components = parseAddressComponents(result.address_components);

      return {
        address: result.formatted_address,
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        placeId: result.place_id,
        components,
      };
    }

    return null;
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return null;
  }
}

/**
 * Forward geocode address to get coordinates
 */
export async function forwardGeocode(address: string): Promise<GeocodeResult | null> {
  try {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error('Google Maps API key not configured');
      return null;
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}&components=country:za`
    );

    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      const components = parseAddressComponents(result.address_components);

      return {
        address: result.formatted_address,
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        placeId: result.place_id,
        components,
      };
    }

    return null;
  } catch (error) {
    console.error('Error forward geocoding:', error);
    return null;
  }
}

/**
 * Parse address components from Google Geocoding response
 */
function parseAddressComponents(components: any[]): GeocodeResult['components'] {
  const result: GeocodeResult['components'] = {};

  components.forEach((component) => {
    const types = component.types || [];

    if (types.includes('route')) {
      result.street = component.long_name;
    }
    if (types.includes('locality')) {
      result.city = component.long_name;
    }
    if (types.includes('administrative_area_level_1')) {
      result.province = component.long_name;
    }
    if (types.includes('country')) {
      result.country = component.long_name;
    }
    if (types.includes('postal_code')) {
      result.postalCode = component.long_name;
    }
  });

  return result;
}

/**
 * Calculate distance between two coordinates (in kilometers)
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Get nearby places of interest
 */
export async function getNearbyPlaces(
  lat: number,
  lng: number,
  radius: number = 1000,
  type: string = 'point_of_interest'
): Promise<any[]> {
  try {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error('Google Maps API key not configured');
      return [];
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`Nearby search failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error getting nearby places:', error);
    return [];
  }
}

/**
 * Validate if coordinates are within South Africa bounds
 */
export function isWithinSouthAfrica(lat: number, lng: number): boolean {
  // South Africa approximate bounds
  const minLat = -34.8;
  const maxLat = -22.0;
  const minLng = 16.5;
  const maxLng = 32.9;

  return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
}
