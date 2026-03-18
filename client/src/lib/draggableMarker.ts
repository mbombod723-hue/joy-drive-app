/**
 * Utility functions for creating draggable markers on Google Maps
 */

export interface DraggableMarkerOptions {
  position: google.maps.LatLngLiteral;
  map: google.maps.Map;
  title?: string;
  icon?: google.maps.Icon | google.maps.Symbol | string;
  onDragEnd?: (lat: number, lng: number) => void;
  onDragStart?: () => void;
  onDrag?: (lat: number, lng: number) => void;
}

/**
 * Create a draggable marker with callbacks
 */
export function createDraggableMarker(options: DraggableMarkerOptions): google.maps.Marker {
  const marker = new google.maps.Marker({
    position: options.position,
    map: options.map,
    title: options.title,
    icon: options.icon,
    draggable: true,
    cursor: 'grab',
  });

  // Add drag listeners
  if (options.onDragStart) {
    marker.addListener('dragstart', () => {
      options.onDragStart?.();
      (marker as any).setOptions({ cursor: 'grabbing' });
    });
  }

  if (options.onDrag) {
    marker.addListener('drag', () => {
      const pos = marker.getPosition();
      if (pos) {
        options.onDrag?.(pos.lat(), pos.lng());
      }
    });
  }

  if (options.onDragEnd) {
    marker.addListener('dragend', () => {
      const pos = marker.getPosition();
      if (pos) {
        options.onDragEnd?.(pos.lat(), pos.lng());
      }
      (marker as any).setOptions({ cursor: 'grab' });
    });
  }

  return marker;
}

/**
 * Update marker position
 */
export function updateMarkerPosition(
  marker: google.maps.Marker,
  lat: number,
  lng: number
): void {
  marker.setPosition({ lat, lng });
}

/**
 * Add drag animation to marker
 */
export function addDragAnimation(marker: google.maps.Marker): void {
  marker.setAnimation(google.maps.Animation.DROP);
}

/**
 * Remove drag animation from marker
 */
export function removeDragAnimation(marker: google.maps.Marker): void {
  marker.setAnimation(null);
}

/**
 * Create a marker with custom styling for favorites
 */
export function createFavoriteMarker(
  position: google.maps.LatLngLiteral,
  map: google.maps.Map,
  label: string,
  color: string,
  onDragEnd?: (lat: number, lng: number) => void
): google.maps.Marker {
  return createDraggableMarker({
    position,
    map,
    title: label,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 14,
      fillColor: color,
      fillOpacity: 1,
      strokeColor: '#FFFFFF',
      strokeWeight: 2,
    },
    onDragEnd,
  });
}

/**
 * Snap marker to grid (for better UX)
 */
export function snapToGrid(
  lat: number,
  lng: number,
  gridSize: number = 0.0001 // ~10 meters
): { lat: number; lng: number } {
  return {
    lat: Math.round(lat / gridSize) * gridSize,
    lng: Math.round(lng / gridSize) * gridSize,
  };
}

/**
 * Constrain marker within bounds
 */
export function constrainToBounds(
  lat: number,
  lng: number,
  bounds: google.maps.LatLngBounds
): { lat: number; lng: number } {
  const ne = bounds.getNorthEast();
  const sw = bounds.getSouthWest();

  return {
    lat: Math.max(sw.lat(), Math.min(ne.lat(), lat)),
    lng: Math.max(sw.lng(), Math.min(ne.lng(), lng)),
  };
}
