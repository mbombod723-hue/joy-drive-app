import React from 'react';
import { ArrowLeft, MapPin, Clock, DollarSign, Star } from 'lucide-react';

interface HistoryPageProps {
  onBack: () => void;
}

export function HistoryPage({ onBack }: HistoryPageProps) {
  const trips = [
    { id: 1, from: 'Sandton', to: 'OR Tambo', date: 'Mar 15, 14:20', price: 'R189', rating: 5, driver: 'Thabo M.' },
    { id: 2, from: 'Rosebank', to: 'Midrand', date: 'Mar 12, 09:15', price: 'R129', rating: 4, driver: 'John D.' },
    { id: 3, from: 'Fourways', to: 'Bryanston', date: 'Mar 05, 10:00', price: 'R1299', rating: 5, driver: 'Maria S.' },
    { id: 4, from: 'Melville', to: 'Braamfontein', date: 'Feb 28, 18:45', price: 'R49', rating: 4, driver: 'Ahmed K.' },
  ];

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-[9999] overflow-y-auto">
      <div className="p-4 border-b flex items-center gap-3 dark:border-gray-700">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">Trip History</h1>
      </div>

      <div className="p-4 space-y-3">
        {trips.map(trip => (
          <div key={trip.id} className="p-4 border rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-green-500" />
                  <span className="font-semibold">{trip.from} → {trip.to}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  {trip.date}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-green-600">{trip.price}</div>
                <div className="flex items-center gap-1 text-sm">
                  {[...Array(trip.rating)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Driver: {trip.driver}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
