import { User, Mail, Phone, MapPin, Star, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../store/useStore';

interface ProfilePageProps {
  onBack: () => void;
}

export function ProfilePage({ onBack }: ProfilePageProps) {
  const { userName, setUserName, profilePic, setProfilePic } = useAuthStore();
  const [editName, setEditName] = React.useState(userName);

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-[9999] overflow-y-auto">
      <div className="p-4 border-b flex items-center gap-3 dark:border-gray-700">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">My Profile</h1>
      </div>

      <div className="p-6 space-y-6">
        {/* Profile Picture */}
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-4xl font-bold">
            {profilePic ? <img src={profilePic} alt="Profile" className="w-full h-full rounded-full object-cover" /> : userName?.charAt(0).toUpperCase()}
          </div>
          <button className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
            Change Photo
          </button>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-semibold mb-2">Full Name</label>
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
            <Mail className="w-4 h-4" /> Email
          </label>
          <input
            type="email"
            value="user@example.com"
            disabled
            className="w-full px-4 py-2 border rounded-lg bg-gray-100 dark:bg-gray-800 dark:border-gray-700"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
            <Phone className="w-4 h-4" /> Phone
          </label>
          <input
            type="tel"
            value="+27 123 456 7890"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
          />
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" /> Rating
          </label>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
              ))}
            </div>
            <span className="text-sm">4.8 (342 reviews)</span>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={() => {
            setUserName(editName);
            onBack();
          }}
          className="w-full py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}

import React from 'react';
