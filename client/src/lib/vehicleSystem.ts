// Vehicle system with colors and dynamic pricing for South Africa

export interface Vehicle {
  id: string;
  name: string;
  color: string;
  icon: string;
  basePricePerKm: number;
  basePricePerMin: number;
  minFare: number;
  description: string;
}

export const VEHICLES: Record<string, Vehicle> = {
  lite: {
    id: 'lite',
    name: 'Lite',
    color: '#3B82F6', // Blue
    icon: '🚗',
    basePricePerKm: 8.50,
    basePricePerMin: 1.20,
    minFare: 25.00,
    description: 'Budget-friendly option',
  },
  economy: {
    id: 'economy',
    name: 'Economy',
    color: '#10B981', // Green
    icon: '🚙',
    basePricePerKm: 12.50,
    basePricePerMin: 1.75,
    minFare: 35.00,
    description: 'Most popular choice',
  },
  express: {
    id: 'express',
    name: 'Express',
    color: '#F59E0B', // Amber
    icon: '🚕',
    basePricePerKm: 15.00,
    basePricePerMin: 2.00,
    minFare: 45.00,
    description: 'Faster service',
  },
  vip: {
    id: 'vip',
    name: 'VIP',
    color: '#8B5CF6', // Purple
    icon: '🚘',
    basePricePerKm: 22.50,
    basePricePerMin: 3.00,
    minFare: 65.00,
    description: 'Premium comfort',
  },
  packages: {
    id: 'packages',
    name: 'Packages',
    color: '#EF4444', // Red
    icon: '📦',
    basePricePerKm: 10.00,
    basePricePerMin: 1.50,
    minFare: 30.00,
    description: 'For deliveries',
  },
  moving: {
    id: 'moving',
    name: 'Moving',
    color: '#EC4899', // Pink
    icon: '🚚',
    basePricePerKm: 35.00,
    basePricePerMin: 5.00,
    minFare: 150.00,
    description: 'Large cargo',
  },
};

/**
 * Calculate trip price based on distance and time
 * @param vehicleId - Vehicle type ID
 * @param distanceKm - Distance in kilometers
 * @param durationMinutes - Duration in minutes
 * @returns Calculated price in ZAR
 */
export function calculatePrice(
  vehicleId: string,
  distanceKm: number,
  durationMinutes: number
): number {
  const vehicle = VEHICLES[vehicleId];
  if (!vehicle) return 0;

  const distancePrice = distanceKm * vehicle.basePricePerKm;
  const timePrice = durationMinutes * vehicle.basePricePerMin;
  const totalPrice = distancePrice + timePrice;

  // Apply minimum fare
  return Math.max(totalPrice, vehicle.minFare);
}

/**
 * Get vehicle by ID
 */
export function getVehicle(vehicleId: string): Vehicle | undefined {
  return VEHICLES[vehicleId];
}

/**
 * Get all vehicles
 */
export function getAllVehicles(): Vehicle[] {
  return Object.values(VEHICLES);
}

/**
 * Format price as ZAR currency
 */
export function formatPrice(price: number): string {
  return `R ${price.toFixed(2)}`;
}

/**
 * Estimate ETA based on distance and average speed
 * Average speed in Johannesburg: 40-50 km/h
 */
export function estimateETA(distanceKm: number): number {
  const averageSpeedKmh = 45; // km/h
  const minutes = Math.ceil((distanceKm / averageSpeedKmh) * 60);
  return Math.max(minutes, 5); // Minimum 5 minutes
}

/**
 * Get vehicle color for map marker
 */
export function getVehicleColor(vehicleId: string): string {
  const vehicle = VEHICLES[vehicleId];
  return vehicle?.color || '#10B981';
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
