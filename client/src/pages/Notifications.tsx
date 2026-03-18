import React from 'react';
import { ArrowLeft, Bell, Trash2 } from 'lucide-react';

interface NotificationsPageProps {
  onBack: () => void;
}

export function NotificationsPage({ onBack }: NotificationsPageProps) {
  const [notifications, setNotifications] = React.useState([
    { id: 1, title: 'Driver Arrived', message: 'Your driver is 2 minutes away', time: '5 min ago', read: false },
    { id: 2, title: 'Trip Completed', message: 'Trip from Sandton to OR Tambo completed', time: '1 hour ago', read: true },
    { id: 3, title: 'Payment Received', message: 'Payment of R189 received successfully', time: '2 hours ago', read: true },
  ]);

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-[9999] overflow-y-auto">
      <div className="p-4 border-b flex items-center gap-3 dark:border-gray-700">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">Notifications</h1>
      </div>

      <div className="p-4 space-y-2">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No notifications</p>
          </div>
        ) : (
          notifications.map(notif => (
            <div
              key={notif.id}
              className={`p-4 rounded-lg border flex justify-between items-start ${
                notif.read
                  ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                  : 'bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700'
              }`}
            >
              <div className="flex-1">
                <h3 className="font-semibold">{notif.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{notif.message}</p>
                <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
              </div>
              <button
                onClick={() => deleteNotification(notif.id)}
                className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
