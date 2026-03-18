import { describe, it, expect } from 'vitest';
import { calculateDistance, isWithinSouthAfrica } from '../geocoding';

describe('Geocoding Utilities', () => {
  describe('calculateDistance', () => {
    it('should calculate distance between two coordinates', () => {
      // Johannesburg to Pretoria (approximately 50km)
      const lat1 = -26.2023;
      const lng1 = 28.0436;
      const lat2 = -25.7461;
      const lng2 = 28.2293;

      const distance = calculateDistance(lat1, lng1, lat2, lng2);

      // Should be approximately 50-60 km
      expect(distance).toBeGreaterThan(40);
      expect(distance).toBeLessThan(70);
    });

    it('should return 0 for same coordinates', () => {
      const lat = -26.2023;
      const lng = 28.0436;

      const distance = calculateDistance(lat, lng, lat, lng);

      expect(distance).toBe(0);
    });

    it('should calculate distance correctly for nearby points', () => {
      const lat1 = -26.2023;
      const lng1 = 28.0436;
      const lat2 = -26.2024; // ~1 meter away
      const lng2 = 28.0437;

      const distance = calculateDistance(lat1, lng1, lat2, lng2);

      // Should be very small
      expect(distance).toBeLessThan(0.01);
    });
  });

  describe('isWithinSouthAfrica', () => {
    it('should return true for Johannesburg', () => {
      const lat = -26.2023;
      const lng = 28.0436;

      expect(isWithinSouthAfrica(lat, lng)).toBe(true);
    });

    it('should return true for Cape Town', () => {
      const lat = -33.9249;
      const lng = 18.4241;

      expect(isWithinSouthAfrica(lat, lng)).toBe(true);
    });

    it('should return true for Durban', () => {
      const lat = -29.8587;
      const lng = 31.0218;

      expect(isWithinSouthAfrica(lat, lng)).toBe(true);
    });

    it('should return true for Pretoria', () => {
      const lat = -25.7461;
      const lng = 28.2293;

      expect(isWithinSouthAfrica(lat, lng)).toBe(true);
    });

    it('should return false for coordinates outside South Africa', () => {
      // New York
      const lat = 40.7128;
      const lng = -74.006;

      expect(isWithinSouthAfrica(lat, lng)).toBe(false);
    });

    it('should return false for coordinates too far north', () => {
      const lat = -20.0;
      const lng = 28.0;

      expect(isWithinSouthAfrica(lat, lng)).toBe(false);
    });

    it('should return false for coordinates too far south', () => {
      const lat = -40.0;
      const lng = 28.0;

      expect(isWithinSouthAfrica(lat, lng)).toBe(false);
    });

    it('should return false for coordinates too far west', () => {
      const lat = -26.0;
      const lng = 10.0;

      expect(isWithinSouthAfrica(lat, lng)).toBe(false);
    });

    it('should return false for coordinates too far east', () => {
      const lat = -26.0;
      const lng = 40.0;

      expect(isWithinSouthAfrica(lat, lng)).toBe(false);
    });
  });

  describe('Coordinate Validation', () => {
    it('should handle valid latitude range', () => {
      expect(isWithinSouthAfrica(-22.0, 28.0)).toBe(true);
      expect(isWithinSouthAfrica(-34.8, 28.0)).toBe(true);
    });

    it('should handle valid longitude range', () => {
      expect(isWithinSouthAfrica(-26.0, 16.5)).toBe(true);
      expect(isWithinSouthAfrica(-26.0, 32.9)).toBe(true);
    });

    it('should reject invalid latitude', () => {
      expect(isWithinSouthAfrica(-21.0, 28.0)).toBe(false);
      expect(isWithinSouthAfrica(-35.0, 28.0)).toBe(false);
    });

    it('should reject invalid longitude', () => {
      expect(isWithinSouthAfrica(-26.0, 16.0)).toBe(false);
      expect(isWithinSouthAfrica(-26.0, 33.0)).toBe(false);
    });
  });

  describe('Distance Calculations', () => {
    it('should calculate distance symmetrically', () => {
      const lat1 = -26.2023;
      const lng1 = 28.0436;
      const lat2 = -25.7461;
      const lng2 = 28.2293;

      const distance1 = calculateDistance(lat1, lng1, lat2, lng2);
      const distance2 = calculateDistance(lat2, lng2, lat1, lng1);

      expect(distance1).toBeCloseTo(distance2, 5);
    });

    it('should handle negative coordinates', () => {
      const distance = calculateDistance(-26.0, -28.0, -26.1, -28.1);

      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(20);
    });
  });
});
