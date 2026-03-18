import { Star, X } from 'lucide-react';
import { useState } from 'react';

export interface RatingData {
  rating: number;
  cleanliness: boolean;
  politeness: boolean;
  driving: boolean;
  comment: string;
}

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RatingData) => void;
  driverName?: string;
  tripPrice?: number;
}

export function RatingModal({
  isOpen,
  onClose,
  onSubmit,
  driverName = 'Driver',
  tripPrice,
}: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [cleanliness, setCleanliness] = useState(true);
  const [politeness, setPoliteness] = useState(true);
  const [driving, setDriving] = useState(true);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    try {
      onSubmit({
        rating,
        cleanliness,
        politeness,
        driving,
        comment,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingText = (value: number): string => {
    switch (value) {
      case 1:
        return 'Poor';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
        return 'Very Good';
      case 5:
        return 'Excellent';
      default:
        return 'Rate your trip';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold">Rate Your Trip</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Driver Name */}
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">Trip with</p>
            <p className="text-lg font-bold">{driverName}</p>
            {tripPrice && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Trip fare: R {tripPrice.toFixed(2)}
              </p>
            )}
          </div>

          {/* Star Rating */}
          <div className="space-y-3">
            <p className="text-center font-medium">
              {getRatingText(hoveredRating || rating)}
            </p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-10 h-10 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Feedback Options */}
          <div className="space-y-3">
            <p className="font-medium text-sm">How was your experience?</p>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={cleanliness}
                onChange={(e) => setCleanliness(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm">Vehicle was clean</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={politeness}
                onChange={(e) => setPoliteness(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm">Driver was polite</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={driving}
                onChange={(e) => setDriving(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm">Driver drove safely</span>
            </label>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Additional Comments (Optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your feedback..."
              maxLength={200}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white resize-none"
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">
              {comment.length}/200 characters
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
            >
              Skip
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || rating === 0}
              className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Rating'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
