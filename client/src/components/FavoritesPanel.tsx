import { useState } from 'react';
import { Heart, MapPin, Trash2, Plus, Home, Briefcase, Dumbbell, Star } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface FavoritesPanelProps {
  onSelectFavorite?: (favorite: any) => void;
  pickupLocation?: string;
  destinationLocation?: string;
}

const ICON_OPTIONS = [
  { value: 'Home', label: 'Home', icon: Home },
  { value: 'Briefcase', label: 'Work', icon: Briefcase },
  { value: 'Dumbbell', label: 'Gym', icon: Dumbbell },
  { value: 'Star', label: 'Favorite', icon: Star },
  { value: 'MapPin', label: 'Other', icon: MapPin },
];

export function FavoritesPanel({ onSelectFavorite, pickupLocation, destinationLocation }: FavoritesPanelProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFavorite, setNewFavorite] = useState({
    label: '',
    address: '',
    icon: 'MapPin',
  });

  // Get favorites
  const { data: favorites, isLoading, refetch } = trpc.favorites.list.useQuery();

  // Add favorite mutation
  const addMutation = trpc.favorites.add.useMutation({
    onSuccess: () => {
      toast.success('Favorite added successfully');
      setNewFavorite({ label: '', address: '', icon: 'MapPin' });
      setShowAddForm(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add favorite');
    },
  });

  // Delete favorite mutation
  const deleteMutation = trpc.favorites.delete.useMutation({
    onSuccess: () => {
      toast.success('Favorite deleted');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete favorite');
    },
  });

  const handleAddFavorite = async () => {
    if (!newFavorite.label || !newFavorite.address) {
      toast.error('Please fill in all fields');
      return;
    }

    // If no coordinates provided, use current location or default
    const latitude = '0';
    const longitude = '0';

    await addMutation.mutateAsync({
      label: newFavorite.label,
      address: newFavorite.address,
      latitude,
      longitude,
      icon: newFavorite.icon,
    });
  };

  const handleDeleteFavorite = (id: number) => {
    if (confirm('Are you sure you want to delete this favorite?')) {
      deleteMutation.mutate({ id });
    }
  };

  const handleSelectFavorite = (favorite: any) => {
    if (onSelectFavorite) {
      onSelectFavorite(favorite);
    }
  };

  const handleAddFromCurrent = () => {
    if (destinationLocation) {
      setNewFavorite({
        ...newFavorite,
        address: destinationLocation,
      });
      setShowAddForm(true);
    } else {
      toast.error('Please enter a destination first');
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500" />
          <h3 className="font-semibold">Saved Places</h3>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="p-4 border-b bg-gray-50 dark:bg-gray-900 space-y-3">
          <input
            type="text"
            placeholder="Label (e.g., Home, Work)"
            value={newFavorite.label}
            onChange={(e) => setNewFavorite({ ...newFavorite, label: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Address"
            value={newFavorite.address}
            onChange={(e) => setNewFavorite({ ...newFavorite, address: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={newFavorite.icon}
            onChange={(e) => setNewFavorite({ ...newFavorite, icon: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {ICON_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              onClick={handleAddFavorite}
              disabled={addMutation.isPending}
              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {addMutation.isPending ? 'Adding...' : 'Add'}
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="flex-1 px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
          {destinationLocation && (
            <button
              onClick={handleAddFromCurrent}
              className="w-full px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
            >
              Use Current Destination
            </button>
          )}
        </div>
      )}

      {/* Favorites List */}
      <div className="space-y-2 p-4 max-h-64 overflow-y-auto">
        {isLoading ? (
          <div className="text-center text-gray-500 py-4">Loading favorites...</div>
        ) : favorites && favorites.length > 0 ? (
          favorites.map((favorite) => {
            const IconComponent = ICON_OPTIONS.find(opt => opt.value === favorite.icon)?.icon || MapPin;
            return (
              <div
                key={favorite.id}
                onClick={() => handleSelectFavorite(favorite)}
                className="p-3 border rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900 cursor-pointer transition flex items-start justify-between group"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg flex-shrink-0 mt-0.5">
                    <IconComponent className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm">{favorite.label}</p>
                    <p className="text-xs text-gray-500 truncate">{favorite.address}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteFavorite(favorite.id);
                  }}
                  disabled={deleteMutation.isPending}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg opacity-0 group-hover:opacity-100 transition flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        ) : (
          <div className="text-center text-gray-500 py-4 text-sm">
            No saved places yet. Add one to get started!
          </div>
        )}
      </div>
    </div>
  );
}
