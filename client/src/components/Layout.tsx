import React from 'react';
import { motion } from 'motion/react';
import { MapPin, Search, Navigation2, Bell, Settings, Globe, Home, Package, Truck, User, Clock, Car } from 'lucide-react';
import { useAppStore } from '../store/useStore';
import { translations } from '../translations';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onNotificationClick: () => void;
  onSettingsClick: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeTab, 
  setActiveTab,
  onNotificationClick,
  onSettingsClick
}) => {
  const { language, setLanguage, theme } = useAppStore();
  const t = translations[language];

  const navItems = [
    { id: 'home', label: t.home, icon: Home },
    { id: 'packages', label: t.packages, icon: Package },
    { id: 'moving', label: t.moving, icon: Truck },
    { id: 'drive', label: t.drive, icon: User },
    { id: 'history', label: t.history, icon: Clock },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Sidebar (Desktop) / Header (Mobile) */}
      <aside className="lg:w-56 lg:h-screen lg:sticky lg:top-0 z-40 glass-nav lg:border-r border-black/5 dark:border-white/5 flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-black/5 dark:border-white/5">
          <motion.div
            animate={{ 
              rotateY: [0, 180, 360],
              boxShadow: ["0 0 0px rgba(0,193,124,0)", "0 0 20px rgba(0,193,124,0.4)", "0 0 0px rgba(0,193,124,0)"]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20"
          >
            <Car className="w-6 h-6 text-white" />
          </motion.div>
          <motion.span 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xl font-display font-bold tracking-tight dark:text-white"
          >
            joy-<motion.span 
              animate={{ color: ['#00C17C', '#34D399', '#00C17C'] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-emerald-500"
            >
              drive
            </motion.span>
          </motion.span>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto lg:block hidden">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all relative group",
                  isActive 
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                    : "text-joy-muted hover:bg-black/5 dark:hover:bg-white/5 hover:text-joy-dark dark:hover:text-white"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive && "fill-white/20")} />
                <span className="text-sm font-bold">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator-desktop"
                    className="absolute left-0 w-1 h-6 bg-white rounded-r-full"
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-black/5 dark:border-white/5 space-y-2 lg:block hidden">
          <button onClick={onNotificationClick} className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-joy-muted hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="text-sm font-bold">{t.notifications}</span>
          </button>
          <button onClick={onSettingsClick} className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-joy-muted hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
            <Settings className="w-5 h-5" />
            <span className="text-sm font-bold">{t.settings}</span>
          </button>
        </div>

        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-display font-bold dark:text-white">joy-drive</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onNotificationClick} className="p-2 glass rounded-full"><Bell className="w-5 h-5" /></button>
            <button onClick={onSettingsClick} className="p-2 glass rounded-full"><Settings className="w-5 h-5" /></button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 pb-24 lg:pb-0 overflow-y-auto bg-joy-beige dark:bg-joy-dark">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 glass-nav px-2 py-2 lg:hidden">
        <div className="max-w-lg mx-auto flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all",
                  isActive ? "text-emerald-500" : "text-joy-muted"
                )}
              >
                <Icon className={cn("w-6 h-6", isActive && "fill-emerald-500/20")} />
                <span className="text-[10px] font-medium uppercase">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
