import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';

interface CancelTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  driverName: string;
}

export function CancelTripModal({
  isOpen,
  onClose,
  onConfirm,
  driverName,
}: CancelTripModalProps) {
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  const reasons = [
    { id: 'uncomfortable', label: 'Driver is making me uncomfortable' },
    { id: 'wrong_route', label: 'Driver is taking wrong route' },
    { id: 'too_long', label: 'Driver is taking too long' },
    { id: 'change_mind', label: 'Changed my mind' },
    { id: 'other', label: 'Other reason' },
  ];

  const handleConfirm = () => {
    const reason = selectedReason === 'other' ? customReason : selectedReason;
    if (reason.trim()) {
      onConfirm(reason);
      setSelectedReason('');
      setCustomReason('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <h3 className="font-bold text-lg">Cancel Trip</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Are you sure you want to cancel this trip with {driverName}? Please let us know why.
          </p>

          <div className="space-y-2">
            {reasons.map((reason) => (
              <label
                key={reason.id}
                className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <input
                  type="radio"
                  name="cancel_reason"
                  value={reason.id}
                  checked={selectedReason === reason.id}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="w-4 h-4"
                />
                <span className="text-sm">{reason.label}</span>
              </label>
            ))}
          </div>

          {selectedReason === 'other' && (
            <textarea
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Please explain your reason for cancelling..."
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
              rows={3}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-4 border-t dark:border-gray-700">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
          >
            Keep Trip
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedReason || (selectedReason === 'other' && !customReason.trim())}
            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
          >
            Cancel Trip
          </button>
        </div>
      </div>
    </div>
  );
}
