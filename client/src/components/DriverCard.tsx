import { useState } from 'react';
import { MessageCircle, Phone, Clock, MapPin, Star } from 'lucide-react';

export interface Driver {
  id: string;
  name: string;
  surname: string;
  rating: number;
  reviews: number;
  vehicleColor: string;
  vehicleType: string;
  licensePlate: string;
  photo?: string;
  eta?: number;
  distance?: number;
}

interface DriverCardProps {
  driver: Driver;
  onCall?: () => void;
  onMessage?: () => void;
  onCancel?: () => void;
  status?: 'arriving' | 'arrived' | 'in-transit' | 'completed';
}

export function DriverCard({
  driver,
  onCall,
  onMessage,
  onCancel,
  status = 'arriving',
}: DriverCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getStatusColor = () => {
    switch (status) {
      case 'arriving':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'arrived':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'in-transit':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'arriving':
        return 'Driver Arriving';
      case 'arrived':
        return 'Driver Arrived';
      case 'in-transit':
        return 'In Transit';
      case 'completed':
        return 'Trip Completed';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 flex-1">
          {driver.photo ? (
            <img
              src={driver.photo}
              alt={driver.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold">
              {driver.name.charAt(0)}{driver.surname.charAt(0)}
            </div>
          )}
          <div className="flex-1">
            <h3 className="font-bold text-lg">
              {driver.name} {driver.surname}
            </h3>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{driver.rating.toFixed(1)}</span>
              <span className="text-sm text-gray-500">({driver.reviews} reviews)</span>
            </div>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>

      {/* Vehicle Info */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">Vehicle</span>
          <span className="font-medium">{driver.vehicleType}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">Color</span>
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded border-2 border-gray-300"
              style={{ backgroundColor: driver.vehicleColor }}
            />
            <span className="font-medium">{driver.vehicleColor}</span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">License Plate</span>
          <span className="font-mono font-bold text-lg">{driver.licensePlate}</span>
        </div>
      </div>

      {/* ETA and Distance */}
      {(driver.eta || driver.distance) && (
        <div className="flex gap-4">
          {driver.eta && (
            <div className="flex-1 bg-blue-50 dark:bg-blue-900 rounded-lg p-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">ETA</p>
                <p className="font-bold">{driver.eta} min</p>
              </div>
            </div>
          )}
          {driver.distance && (
            <div className="flex-1 bg-green-50 dark:bg-green-900 rounded-lg p-3 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Distance</p>
                <p className="font-bold">{driver.distance.toFixed(1)} km</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={onMessage}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          Message
        </button>
        <button
          onClick={onCall}
          className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <Phone className="w-5 h-5" />
          Call
        </button>
        {onCancel && (
          <button
            onClick={onCancel}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 rounded-lg transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Details Toggle */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
      >
        {showDetails ? 'Hide Details' : 'Show More Details'}
      </button>

      {/* Additional Details */}
      {showDetails && (
        <div className="border-t dark:border-gray-700 pt-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Driver ID</span>
            <span className="font-mono text-sm">{driver.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Response Time</span>
            <span className="text-sm">Usually 2-3 min</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Acceptance Rate</span>
            <span className="text-sm">98%</span>
          </div>
        </div>
      )}
    </div>
  );
}
