import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Search, Car, Package, Truck, User, Clock, ChevronRight, X, Info, ShieldCheck, LogOut, Moon, Sun, Bell, Globe, Navigation, Star, ArrowRight, Camera, FileText, Hash, Palette, Menu, Phone, AlertCircle, Upload } from 'lucide-react';
import { useAppStore, useAuthStore, type Language } from './store/useStore';
import { translations } from './translations';
import { SplashScreen } from './components/SplashScreen';
import { Layout } from './components/Layout';
import { MapComponent } from './components/MapComponent';
import { supabase, getSupabase } from './lib/supabase';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AddressSearch } from './components/AddressSearch';
import { DriverCard, type Driver } from './components/DriverCard';
import { RatingModal, type RatingData } from './components/RatingModal';
import { BecomeDriverForm, type DriverFormData } from './components/BecomeDriverForm';
import { ChatBox } from './components/ChatBox';
import { AboutPage } from './pages/About';
import { PrivacyPolicyPage } from './pages/PrivacyPolicy';
import { calculatePrice, estimateETA, calculateDistance, formatPrice, getVehicleColor } from './lib/vehicleSystem';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHamburger, setShowHamburger] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showBecomeDriver, setShowBecomeDriver] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const { language, theme, setTheme, setLanguage, isNotificationsEnabled, toggleNotifications, isLocationSharingEnabled, toggleLocationSharing, activeTrip, setActiveTrip } = useAppStore();
  const { user, setUser, userName, setUserName, profilePic, setProfilePic } = useAuthStore();
  const t = translations[language];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempName, setTempName] = useState(userName);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState({ clean: true, polite: true, comment: '' });
  
  // Address search states
  const [pickupLocation, setPickupLocation] = useState('');
  const [destinationLocation, setDestinationLocation] = useState('');
  const [pickupCoords, setPickupCoords] = useState({ lat: -26.1087, lng: 28.0545 });
  const [destinationCoords, setDestinationCoords] = useState({ lat: -26.1361, lng: 28.0492 });
  
  // Driver and trip states
  const [currentDriver, setCurrentDriver] = useState<Driver | null>(null);
  const [showDriverCard, setShowDriverCard] = useState(false);
  const [tripStatus, setTripStatus] = useState<'idle' | 'searching' | 'arriving' | 'arrived' | 'in-transit' | 'completed'>('idle');
  const [selectedVehicleType, setSelectedVehicleType] = useState('economy');
  const [tripHistory, setTripHistory] = useState([
    { type: 'ride', route: 'Sandton → OR Tambo', tier: t.economy, date: 'Mar 15, 14:20', price: 189, icon: Car },
    { type: 'package', route: 'Rosebank → Midrand', tier: t.express, date: 'Mar 12, 09:15', price: 129, icon: Package },
    { type: 'moving', route: 'Fourways → Bryanston', tier: t.economy, date: 'Mar 05, 10:00', price: 1299, icon: Truck },
    { type: 'ride', route: 'Melville → Braamfontein', tier: t.lite, date: 'Feb 28, 18:45', price: 49, icon: Car },
  ]);

  const saAvenues = [
    'Sandton Drive', 'Oxford Road', 'Rivonia Road', 'Jan Smuts Avenue', 
    'William Nicol Drive', 'Main Road', 'Grayston Drive', 'Katherine Street',
    'Alice Lane', 'West Street', 'Maude Street', 'Fredman Drive',
    'Nelson Mandela Square', 'Gwen Lane', 'Pybus Road', 'Wierda Road',
    'Empire Road', 'Barry Hertzog Avenue', 'Beyers Naude Drive', 'Louis Botha Avenue',
    'Joe Slovo Drive', 'Smit Street', 'Wolmarans Street', 'Juta Street',
    'Bryanston Drive', 'Sunset Road', 'Morningside Drive', 'Kelvin Drive',
    'Witkoppen Road', 'Montecasino Boulevard', 'Woodmead Drive', 'Ballyclare Drive'
  ];

  const services = [
    { id: 'lite', name: t.lite, icon: Car, color: 'bg-blue-500', price: 'R 45' },
    { id: 'economy', name: t.economy, icon: Car, color: 'bg-green-500', price: 'R 85' },
    { id: 'express', name: t.express, icon: Truck, color: 'bg-orange-500', price: 'R 145' },
    { id: 'vip', name: t.vip, icon: Car, color: 'bg-purple-500', price: 'R 295' },
    { id: 'package', name: t.packages, icon: Package, color: 'bg-pink-500', price: 'R 120' },
    { id: 'moving', name: t.moving, icon: Truck, color: 'bg-indigo-500', price: 'R 1200' },
  ];

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;

    sb.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = sb.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const [pickupInput, setPickupInput] = useState('');
  const [destInput, setDestInput] = useState('');
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);
  const [selectedService, setSelectedService] = useState('economy');
  const [showFindDriver, setShowFindDriver] = useState(false);
  const [selectedTier, setSelectedTier] = useState('economy');

  const filteredPickup = saAvenues.filter(a => a.toLowerCase().includes(pickupInput.toLowerCase()));
  const filteredDest = saAvenues.filter(a => a.toLowerCase().includes(destInput.toLowerCase()));

  const handleGoogleSignIn = async () => {
    const sb = getSupabase();
    if (!sb) {
      setUser({ id: 'mock-user', email: 'user@example.com' } as any);
      return;
    }
    const { error } = await sb.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) console.error('Error signing in:', error.message);
  };

  const handleFacebookSignIn = async () => {
    const sb = getSupabase();
    if (!sb) {
      setUser({ id: 'mock-user', email: 'user@example.com' } as any);
      return;
    }
    const { error } = await sb.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) console.error('Error signing in:', error.message);
  };

  const handleSignOut = async () => {
    const sb = getSupabase();
    if (sb) {
      await sb.auth.signOut();
    }
    setUser(null);
    setShowHamburger(false);
  };

  const handleProfilePicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setProfilePic(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveName = () => {
    setUserName(tempName);
    setIsEditingProfile(false);
  };

  const handleEmergencyCall = () => {
    window.location.href = 'tel:10177';
  };

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  if (!user) {
    return (
      <div className={cn('min-h-screen flex items-center justify-center', theme === 'dark' ? 'bg-gray-900' : 'bg-white')}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md px-6">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Car className="w-8 h-8 text-white" />
            </div>
            <h1 className={cn('text-3xl font-bold mb-2', theme === 'dark' ? 'text-white' : 'text-gray-900')}>Joy Drive</h1>
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Your ride, your way</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleGoogleSignIn}
              className={cn(
                'w-full py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all',
                theme === 'dark'
                  ? 'bg-gray-800 text-white hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              )}
            >
              <span>🔍</span> Sign in with Google
            </button>
            <button
              onClick={handleFacebookSignIn}
              className={cn(
                'w-full py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all',
                theme === 'dark'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              )}
            >
              <span>f</span> Sign in with Facebook
            </button>
            <button
              onClick={() => setUser({ id: 'demo-user', email: 'demo@example.com' } as any)}
              className={cn(
                'w-full py-3 px-4 rounded-lg font-semibold transition-all bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
              )}
            >
              Continue as Guest
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Show About page
  if (showAbout) {
    return <AboutPage onBack={() => setShowAbout(false)} />;
  }

  // Show Privacy Policy page
  if (showPrivacy) {
    return <PrivacyPolicyPage onBack={() => setShowPrivacy(false)} />;
  }

  // Show Become Driver form
  if (showBecomeDriver) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <BecomeDriverForm
          onSubmit={(data: DriverFormData) => {
            console.log('Driver application submitted:', data);
            setShowBecomeDriver(false);
          }}
          onCancel={() => setShowBecomeDriver(false)}
        />
      </div>
    );
  }

  // make sure to consider if you need authentication for certain routes
  return (
    <div className={cn('flex flex-col', theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900')} style={{ height: '100vh' }}>
      {/* Top Bar */}
      <div className={cn('flex items-center justify-between p-4 border-b flex-shrink-0', theme === 'dark' ? 'border-gray-800 bg-gray-800' : 'border-gray-200 bg-white')}>
        <button onClick={() => setShowHamburger(!showHamburger)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg">
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">Joy Drive</h1>
        {profilePic ? (
          <img src={profilePic} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200')}>
            <User className="w-6 h-6" />
          </div>
        )}
      </div>

      {/* Main Content - Split Layout */}
      <div className="flex-1 flex flex-col overflow-hidden" style={{ minHeight: 0 }}>
        {/* Map Section (40%) */}
        <div className="flex-shrink-0 w-full border-b" style={{ height: '40%', minHeight: 0, borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}>
          <MapComponent pickupLocation={pickupInput} destinationLocation={destInput} />
        </div>

        {/* Options Panel (60%) */}
        <div className="flex-1 w-full overflow-y-auto p-4 space-y-4" style={{ 
          height: '60%',
          minHeight: 0,
          backgroundColor: theme === 'dark' ? '#111827' : '#ffffff'
        }}>
          {/* Service Selection */}
          <div className="grid grid-cols-3 gap-2">
            {services.map(service => (
              <button
                key={service.id}
                onClick={() => setSelectedService(service.id)}
                className={cn(
                  'p-3 rounded-lg text-sm font-semibold transition-all',
                  selectedService === service.id
                    ? 'ring-2 ring-green-500 bg-green-50 dark:bg-green-900'
                    : theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
                )}
              >
                <service.icon className="w-5 h-5 mx-auto mb-1" />
                {service.name}
              </button>
            ))}
          </div>

          {/* Location Inputs */}
          <div className="space-y-2">
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-5 h-5 text-green-500" />
              <input
                type="text"
                placeholder={t.pickupLocation || 'Pickup Location'}
                value={pickupInput}
                onChange={(e) => {
                  setPickupInput(e.target.value);
                  setShowPickupSuggestions(true);
                }}
                className={cn(
                  'w-full pl-10 pr-4 py-2 rounded-lg outline-none',
                  theme === 'dark'
                    ? 'bg-gray-800 border border-gray-700 text-white'
                    : 'bg-gray-100 border border-gray-300 text-gray-900'
                )}
              />
              {showPickupSuggestions && filteredPickup.length > 0 && (
                <div className={cn('absolute top-full left-0 right-0 mt-1 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto', theme === 'dark' ? 'bg-gray-800' : 'bg-white')}>
                  {filteredPickup.slice(0, 5).map(avenue => (
                    <button
                      key={avenue}
                      onClick={() => {
                        setPickupInput(avenue);
                        setShowPickupSuggestions(false);
                      }}
                      className={cn('w-full text-left px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700')}
                    >
                      {avenue}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-5 h-5 text-red-500" />
              <input
                type="text"
                placeholder={t.destination || 'Destination'}
                value={destInput}
                onChange={(e) => {
                  setDestInput(e.target.value);
                  setShowDestSuggestions(true);
                }}
                className={cn(
                  'w-full pl-10 pr-4 py-2 rounded-lg outline-none',
                  theme === 'dark'
                    ? 'bg-gray-800 border border-gray-700 text-white'
                    : 'bg-gray-100 border border-gray-300 text-gray-900'
                )}
              />
              {showDestSuggestions && filteredDest.length > 0 && (
                <div className={cn('absolute top-full left-0 right-0 mt-1 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto', theme === 'dark' ? 'bg-gray-800' : 'bg-white')}>
                  {filteredDest.slice(0, 5).map(avenue => (
                    <button
                      key={avenue}
                      onClick={() => {
                        setDestInput(avenue);
                        setShowDestSuggestions(false);
                      }}
                      className={cn('w-full text-left px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700')}
                    >
                      {avenue}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Price and ETA */}
          <div className="grid grid-cols-2 gap-2">
            <div className={cn('p-3 rounded-lg', theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100')}>
              <p className={cn('text-sm', theme === 'dark' ? 'text-gray-400' : 'text-gray-600')}>Price</p>
              <p className="text-lg font-bold">R 125</p>
            </div>
            <div className={cn('p-3 rounded-lg', theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100')}>
              <p className={cn('text-sm', theme === 'dark' ? 'text-gray-400' : 'text-gray-600')}>ETA</p>
              <p className="text-lg font-bold">8 min</p>
            </div>
          </div>

          {/* Find Driver Button */}
          <button
            onClick={() => {
              // Simulate finding a driver
              const mockDriver: Driver = {
                id: 'DRV-001',
                name: 'Thabo',
                surname: 'Mthembu',
                rating: 4.8,
                reviews: 342,
                vehicleColor: getVehicleColor(selectedVehicleType),
                vehicleType: selectedVehicleType.charAt(0).toUpperCase() + selectedVehicleType.slice(1),
                licensePlate: 'JHB 234 GP',
                photo: undefined,
                eta: estimateETA(calculateDistance(pickupCoords.lat, pickupCoords.lng, destinationCoords.lat, destinationCoords.lng)),
                distance: calculateDistance(pickupCoords.lat, pickupCoords.lng, destinationCoords.lat, destinationCoords.lng),
              };
              setCurrentDriver(mockDriver);
              setShowDriverCard(true);
              setTripStatus('arriving');
            }}
            className="w-full py-3 bg-gradient-to-r from-blue-900 to-blue-800 text-white font-bold rounded-lg hover:from-blue-800 hover:to-blue-700 transition-all"
          >
            {t.findADriver || 'Find a Driver'}
          </button>
        </div>
      </div>

      {/* Hamburger Menu */}
      <AnimatePresence>
        {showHamburger && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className={cn('fixed left-0 top-0 h-full w-64 shadow-lg z-50 flex flex-col', theme === 'dark' ? 'bg-gray-800' : 'bg-white')}
          >
            <div className="p-4 border-b" style={{ borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}>
              <button onClick={() => setShowHamburger(false)} className="p-2">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <button onClick={() => { setShowHamburger(false); }} className={cn('w-full text-left px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-2')}>
                <User className="w-5 h-5" /> {'Profile'}
              </button>
              <button onClick={() => { setShowHamburger(false); }} className={cn('w-full text-left px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-2')}>
                <Bell className="w-5 h-5" /> {t.notifications || 'Notifications'}
              </button>
              <button onClick={() => { setShowHamburger(false); }} className={cn('w-full text-left px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-2')}>
                <Clock className="w-5 h-5" /> {t.history || 'Trip History'}
              </button>
              <button onClick={() => { setShowAbout(true); setShowHamburger(false); }} className={cn('w-full text-left px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-2')}>
                <Info className="w-5 h-5" /> {t.about || 'About'}
              </button>
              <button onClick={() => { setShowPrivacy(true); setShowHamburger(false); }} className={cn('w-full text-left px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-2')}>
                <ShieldCheck className="w-5 h-5" /> {t.privacy || 'Privacy'}
              </button>
              <button onClick={() => { setShowBecomeDriver(true); setShowHamburger(false); }} className={cn('w-full text-left px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-2')}>
                <Car className="w-5 h-5" /> {t.becomeDriver || 'Become Driver'}
              </button>
              <button onClick={() => { setTheme(theme === 'dark' ? 'light' : 'dark'); }} className={cn('w-full text-left px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-2')}>
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />} {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
              <button onClick={() => { setShowHamburger(false); }} className={cn('w-full text-left px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-2')}>
                <Globe className="w-5 h-5" /> {t.language || 'Language'}
              </button>
              <button onClick={() => { toggleLocationSharing(); }} className={cn('w-full text-left px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-2')}>
                <Navigation className="w-5 h-5" /> {t.shareLocation || 'Share Location'}
              </button>
              <button onClick={handleEmergencyCall} className={cn('w-full text-left px-4 py-2 rounded-lg hover:bg-red-200 dark:hover:bg-red-900 flex items-center gap-2 text-red-600')}>
                <AlertCircle className="w-5 h-5" /> {t.emergency || 'Emergency (10177)'}
              </button>
            </div>

            <div className="border-t p-4 space-y-2" style={{ borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}>
              <button onClick={handleSignOut} className={cn('w-full text-left px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-2 text-red-600')}>
                <LogOut className="w-5 h-5" /> {'Logout'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay for hamburger */}
      {showHamburger && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setShowHamburger(false)}
          style={{ zIndex: 40 }}
        />
      )}

      {/* Driver Card Modal */}
      {showDriverCard && currentDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-96 overflow-y-auto">
            <DriverCard
              driver={currentDriver}
              status={tripStatus as any}
              onCall={() => {
                console.log('Calling driver...');
                alert('Calling ' + currentDriver.name);
              }}
              onMessage={() => {
                setShowChat(true);
              }}
              onCancel={() => {
                setShowDriverCard(false);
                setTripStatus('idle');
              }}
            />
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {showChat && currentDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full h-96">
            <ChatBox
              driverId={parseInt(currentDriver.id)}
              driverName={`${currentDriver.name} ${currentDriver.surname}`}
              currentUserId={1} // This should come from auth context
              currentUserName={userName}
              onClose={() => setShowChat(false)}
              onCall={() => {
                console.log('Calling driver...');
                alert('Calling ' + currentDriver.name);
              }}
              theme={theme === 'dark' ? 'dark' : 'light'}
            />
          </div>
        </div>
      )}

      {/* Rating Modal */}
      <RatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        onSubmit={(data: RatingData) => {
          console.log('Rating submitted:', data);
          setShowRatingModal(false);
          // Here you would save the rating to Supabase
        }}
        driverName={currentDriver ? `${currentDriver.name} ${currentDriver.surname}` : 'Driver'}
        tripPrice={125}
      />
    </div>
  );
}
