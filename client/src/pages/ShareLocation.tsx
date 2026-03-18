import React from 'react';
import { ArrowLeft, MapPin } from 'lucide-react';
import { useAppStore } from '../store/useStore';

interface ShareLocationPageProps {
  onBack: () => void;
}

export function ShareLocationPage({ onBack }: ShareLocationPageProps) {
  const { isLocationSharingEnabled, toggleLocationSharing } = useAppStore();

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-[9999] overflow-y-auto">
      <div className="p-4 border-b flex items-center gap-3 dark:border-gray-700">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">Share Location</h1>
      </div>

      <div className="p-6 space-y-6">
        {/* Location Sharing Toggle */}
        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
          <div className="flex items-center gap-3">
            <MapPin className="w-6 h-6 text-green-500" />
            <div>
              <h3 className="font-semibold">Share Real-Time Location</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Allow drivers to see your location during trips</p>
            </div>
          </div>
          <button
            onClick={toggleLocationSharing}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              isLocationSharingEnabled
                ? 'bg-green-500 text-white'
                : 'bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            {isLocationSharingEnabled ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Info */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-700">
          <h4 className="font-semibold mb-2">About Location Sharing</h4>
          <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
            <li>✓ Helps drivers find you faster</li>
            <li>✓ Improves safety during trips</li>
            <li>✓ Location is only shared with your driver</li>
            <li>✓ Stops sharing when trip ends</li>
          </ul>
        </div>

        {/* Privacy Notice */}
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg border border-yellow-200 dark:border-yellow-700">
          <h4 className="font-semibold mb-2">Privacy</h4>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Your location data is encrypted and only visible to your assigned driver during active trips. We never sell or share your location with third parties.
          </p>
        </div>
      </div>
    </div>
  );
}
