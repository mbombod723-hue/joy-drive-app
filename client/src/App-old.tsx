import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Car, Package, Truck, X, Moon, Sun, Bell, Globe, Menu, Home, Clock, Settings, LogOut, Trash2, Lock, Upload, Mail, Facebook, Star, ChevronRight, AlertCircle, Check } from 'lucide-react';
import { useAppStore, useAuthStore, type Language } from './store/useStore';
import { translations } from './translations';
import { SplashScreen } from './components/SplashScreen';
import { MapComponent } from './components/MapComponent';
import { supabase, getSupabase } from './lib/supabase';

// Pricing data
const PRICING = {
  ride: [
    { name: 'Joy Lite', desc: 'Moto-taxi, solo ride', price: 'R 45', time: 'ETA 3-5 min' },
    { name: 'Joy Economy', desc: 'Affordable sedan', price: 'R 85', time: 'ETA 2-7 min' },
    { name: 'Joy Express', desc: 'Priority pickup', price: 'R 145', time: 'ETA 2-4 min' },
    { name: 'Joy VIP', desc: 'Luxury SUV, premium', price: 'R 295', time: 'ETA 5-8 min' },
  ],
  package: [
    { name: 'Joy Package', desc: 'Small packages', price: 'R 65', time: 'ETA 2-7 min' },
  ],
  moving: [
    { name: 'Joy Moving', desc: 'Moving & delivery', price: 'R 195', time: 'ETA 10-15 min' },
  ],
};

// Languages
const LANGUAGES: { [key: string]: string } = {
  en: 'English',
  fr: 'Français',
  zu: 'isiZulu',
  af: 'Afrikaans',
  es: 'Español',
  de: 'Deutsch',
  it: 'Italiano',
  pt: 'Português',
  ru: 'Русский',
  zh: '中文',
  ja: '日本語',
  ar: 'العربية',
};

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingCategory, setRatingCategory] = useState<'politeness' | 'driving' | 'cleanliness'>('politeness');
  
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [shareLocation, setShareLocation] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  const { language, theme, setTheme, setLanguage } = useAppStore();
  const { user, setUser } = useAuthStore();
  const t = translations[language];

  // Registration form state
  const [regData, setRegData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    profilePic: null as File | null,
    agreeTerms: false,
  });

  const [pickupInput, setPickupInput] = useState('');
  const [destInput, setDestInput] = useState('');
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);
  const [selectedService, setSelectedService] = useState<'ride' | 'package' | 'moving'>('ride');
  const [selectedPrice, setSelectedPrice] = useState(PRICING.ride[0]);

  const saAvenues = [
    'Sandton Drive', 'Oxford Road', 'Rivonia Road', 'Jan Smuts Avenue',
    'William Nicol Drive', 'Main Road', 'Grayston Drive', 'Katherine Street',
    'Alice Lane', 'West Street', 'Maude Street', 'Fredman Drive',
    'Nelson Mandela Square', 'Gwen Lane', 'Pybus Road', 'Wierda Road',
  ];

  const filteredPickup = saAvenues.filter(a => a.toLowerCase().includes(pickupInput.toLowerCase()));
  const filteredDest = saAvenues.filter(a => a.toLowerCase().includes(destInput.toLowerCase()));

  // Detect user location on mount
  useEffect(() => {
    if (navigator.geolocation && shareLocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setPickupInput('My Location');
        },
        (error) => {
          console.log('Location access denied:', error);
          setPickupInput('Sandton Drive');
        }
      );
    }
  }, [shareLocation]);

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
      document.body.style.backgroundColor = '#0D1F17';
      document.body.style.color = '#FFFFFF';
    } else {
      root.classList.remove('dark');
      document.body.style.backgroundColor = '#FFFFFF';
      document.body.style.color = '#000000';
    }
  }, [theme]);

  const handleSignOut = async () => {
    const sb = getSupabase();
    if (sb) {
      await sb.auth.signOut();
    }
    setUser(null);
    setShowSettings(false);
    setShowMenu(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mock registration for development
    setUser({
      id: 'mock-user-' + Date.now(),
      email: regData.email,
      user_metadata: {
        firstName: regData.firstName,
        lastName: regData.lastName,
      }
    } as any);
    setShowAuth(false);
    setIsRegister(false);
  };

  const handleGoogleSignIn = async () => {
    setUser({ id: 'google-user', email: 'user@gmail.com' } as any);
    setShowAuth(false);
  };

  const handleFacebookSignIn = async () => {
    setUser({ id: 'facebook-user', email: 'user@facebook.com' } as any);
    setShowAuth(false);
  };

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="w-full max-w-md mx-auto px-4">
          {!showAuth ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Car className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Joy Drive</h1>
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-8`}>
                Your mobility solution
              </p>

              <button
                onClick={() => setShowAuth(true)}
                className="w-full bg-emerald-500 text-white py-3 rounded-lg font-semibold hover:bg-emerald-600 transition-colors"
              >
                Get Started
              </button>
            </div>
          ) : !isRegister ? (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-center mb-6">Sign In or Create Account</h2>

              <button
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-2 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 py-3 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Mail className="w-5 h-5" />
                Continue with Gmail
              </button>

              <button
                onClick={handleFacebookSignIn}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                <Facebook className="w-5 h-5" />
                Continue with Facebook
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className={`w-full h-px ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`} />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className={`px-2 ${theme === 'dark' ? 'bg-gray-900 text-gray-400' : 'bg-white text-gray-500'}`}>Or</span>
                </div>
              </div>

              <button
                onClick={() => setIsRegister(true)}
                className={`w-full py-3 rounded-lg font-semibold border-2 transition-colors ${
                  theme === 'dark'
                    ? 'border-emerald-500 text-emerald-500 hover:bg-emerald-500/10'
                    : 'border-emerald-500 text-emerald-500 hover:bg-emerald-50'
                }`}
              >
                Create Account
              </button>

              <button
                onClick={() => setShowAuth(false)}
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                  theme === 'dark'
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Back
              </button>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Create Account</h2>
                <button
                  type="button"
                  onClick={() => setIsRegister(false)}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Profile Picture Upload */}
              <div className="flex justify-center mb-4">
                <label className="cursor-pointer">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center border-2 border-dashed ${
                    theme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-gray-100'
                  }`}>
                    {regData.profilePic ? (
                      <img src={URL.createObjectURL(regData.profilePic)} alt="Profile" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <Upload className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setRegData({ ...regData, profilePic: e.target.files?.[0] || null })}
                    className="hidden"
                  />
                </label>
              </div>

              {/* First Name */}
              <input
                type="text"
                placeholder="First Name"
                value={regData.firstName}
                onChange={(e) => setRegData({ ...regData, firstName: e.target.value })}
                required
                className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500'
                    : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400 focus:border-emerald-500'
                }`}
              />

              {/* Last Name */}
              <input
                type="text"
                placeholder="Last Name"
                value={regData.lastName}
                onChange={(e) => setRegData({ ...regData, lastName: e.target.value })}
                required
                className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500'
                    : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400 focus:border-emerald-500'
                }`}
              />

              {/* Email */}
              <input
                type="email"
                placeholder="Gmail Address"
                value={regData.email}
                onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                required
                className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500'
                    : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400 focus:border-emerald-500'
                }`}
              />

              {/* Password */}
              <input
                type="password"
                placeholder="Password"
                value={regData.password}
                onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                required
                className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500'
                    : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400 focus:border-emerald-500'
                }`}
              />

              {/* Terms Agreement */}
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={regData.agreeTerms}
                  onChange={(e) => setRegData({ ...regData, agreeTerms: e.target.checked })}
                  required
                  className="w-4 h-4"
                />
                <span className="text-sm">I agree to Terms and Conditions</span>
              </label>

              {/* Register Button */}
              <button
                type="submit"
                disabled={!regData.firstName || !regData.lastName || !regData.email || !regData.password || !regData.agreeTerms}
                className="w-full bg-emerald-500 text-white py-3 rounded-lg font-semibold hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Create Account
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b z-20 ${theme === 'dark' ? 'border-gray-800 bg-gray-800' : 'border-gray-200 bg-white'}`}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-emerald-500">Joy Drive</h1>
        <div className="w-6 h-6" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col-reverse overflow-hidden md:flex-row">
        {/* Options Panel - 60% */}
        <div className={`flex-1 overflow-y-auto ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border-t md:border-t-0 md:border-l ${theme === 'dark' ? 'md:border-gray-700' : 'md:border-gray-200'}`}>
          <div className="p-4 space-y-4">
            {/* Service Selection */}
            <div className="flex gap-2">
              {[
                { id: 'ride', icon: Car, label: 'Ride' },
                { id: 'package', icon: Package, label: 'Package' },
                { id: 'moving', icon: Truck, label: 'Moving' },
              ].map(service => (
                <button
                  key={service.id}
                  onClick={() => {
                    setSelectedService(service.id as any);
                    setSelectedPrice(PRICING[service.id as keyof typeof PRICING][0]);
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
                    selectedService === service.id
                      ? 'bg-emerald-500 text-white'
                      : theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <service.icon className="w-4 h-4" />
                  <span className="text-sm font-semibold">{service.label}</span>
                </button>
              ))}
            </div>

            {/* Pickup Location */}
            <div className="relative">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 ${
                showPickupSuggestions
                  ? 'border-emerald-500'
                  : theme === 'dark'
                  ? 'border-gray-700'
                  : 'border-gray-300'
              }`}>
                <MapPin className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Pickup location"
                  value={pickupInput}
                  onChange={(e) => {
                    setPickupInput(e.target.value);
                    setShowPickupSuggestions(true);
                  }}
                  onFocus={() => setShowPickupSuggestions(true)}
                  className={`flex-1 outline-none bg-transparent text-sm ${
                    theme === 'dark' ? 'text-white placeholder-gray-500' : 'text-gray-800 placeholder-gray-400'
                  }`}
                />
              </div>
              {showPickupSuggestions && filteredPickup.length > 0 && (
                <div className={`absolute top-full left-0 right-0 mt-1 rounded-lg border z-30 ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                } shadow-lg`}>
                  {filteredPickup.slice(0, 4).map((avenue, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setPickupInput(avenue);
                        setShowPickupSuggestions(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-emerald-500 hover:text-white transition-colors ${
                        idx !== filteredPickup.length - 1 ? `border-b ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}` : ''
                      }`}
                    >
                      {avenue}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Destination Location */}
            <div className="relative">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 ${
                showDestSuggestions
                  ? 'border-emerald-500'
                  : theme === 'dark'
                  ? 'border-gray-700'
                  : 'border-gray-300'
              }`}>
                <MapPin className="w-5 h-5 text-red-500 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Destination"
                  value={destInput}
                  onChange={(e) => {
                    setDestInput(e.target.value);
                    setShowDestSuggestions(true);
                  }}
                  onFocus={() => setShowDestSuggestions(true)}
                  className={`flex-1 outline-none bg-transparent text-sm ${
                    theme === 'dark' ? 'text-white placeholder-gray-500' : 'text-gray-800 placeholder-gray-400'
                  }`}
                />
              </div>
              {showDestSuggestions && filteredDest.length > 0 && (
                <div className={`absolute top-full left-0 right-0 mt-1 rounded-lg border z-30 ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                } shadow-lg`}>
                  {filteredDest.slice(0, 4).map((avenue, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setDestInput(avenue);
                        setShowDestSuggestions(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-emerald-500 hover:text-white transition-colors ${
                        idx !== filteredDest.length - 1 ? `border-b ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}` : ''
                      }`}
                    >
                      {avenue}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Pricing Table */}
            <div className={`rounded-lg overflow-hidden border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className={`p-3 font-bold text-sm ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                Available Options
              </div>
              <div className="space-y-2 p-3">
                {PRICING[selectedService].map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedPrice(option)}
                    className={`w-full p-3 rounded-lg text-left transition-all ${
                      selectedPrice.name === option.name
                        ? 'bg-emerald-500 text-white'
                        : theme === 'dark'
                        ? 'bg-gray-700 hover:bg-gray-600'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm">{option.name}</p>
                        <p className={`text-xs ${selectedPrice.name === option.name ? 'text-emerald-100' : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {option.desc}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{option.price}</p>
                        <p className={`text-xs ${selectedPrice.name === option.name ? 'text-emerald-100' : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {option.time}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Request Button */}
            <button
              disabled={!pickupInput || !destInput}
              onClick={() => setShowRating(true)}
              className="w-full bg-emerald-500 text-white py-3 rounded-lg font-bold hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Find a Driver
            </button>
          </div>
        </div>

        {/* Map - 40% */}
        <div className="flex-1 overflow-hidden">
          <MapComponent />
        </div>
      </div>

      {/* Menu Sidebar */}
      <AnimatePresence>
        {showMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMenu(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className={`fixed left-0 top-0 bottom-0 w-64 z-50 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-xl overflow-y-auto`}
            >
              <div className="p-4 space-y-4">
                <button
                  onClick={() => setShowMenu(false)}
                  className="w-full flex items-center justify-between p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
                >
                  <h2 className="font-bold">Menu</h2>
                  <X className="w-5 h-5" />
                </button>

                <div className="space-y-2 border-t border-b pt-4 pb-4">
                  <button className={`w-full flex items-center gap-3 p-3 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                    <Home className="w-5 h-5" />
                    <span>Home</span>
                  </button>
                  <button className={`w-full flex items-center gap-3 p-3 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                    <Clock className="w-5 h-5" />
                    <span>History</span>
                  </button>
                  <button className={`w-full flex items-center gap-3 p-3 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                    <Bell className="w-5 h-5" />
                    <span>Notifications</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {/* Dark Mode */}
                  <div className={`flex items-center justify-between p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div className="flex items-center gap-3">
                      {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                      <span className="font-semibold text-sm">Dark Mode</span>
                    </div>
                    <button
                      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                      className={`relative w-10 h-6 rounded-full transition-colors ${theme === 'dark' ? 'bg-emerald-500' : 'bg-gray-400'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${theme === 'dark' ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  {/* Language */}
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <label className="flex items-center gap-3 font-semibold mb-2 text-sm">
                      <Globe className="w-5 h-5" />
                      Language
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as Language)}
                      className={`w-full p-2 rounded-lg border text-sm ${
                        theme === 'dark'
                          ? 'bg-gray-800 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-800'
                      }`}
                    >
                      {Object.entries(LANGUAGES).map(([code, name]) => (
                        <option key={code} value={code}>{name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Share Location */}
                  <div className={`flex items-center justify-between p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5" />
                      <span className="font-semibold text-sm">Share Location</span>
                    </div>
                    <button
                      onClick={() => setShareLocation(!shareLocation)}
                      className={`relative w-10 h-6 rounded-full transition-colors ${shareLocation ? 'bg-emerald-500' : 'bg-gray-400'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${shareLocation ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  {/* Notifications */}
                  <div className={`flex items-center justify-between p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5" />
                      <span className="font-semibold text-sm">Notifications</span>
                    </div>
                    <button
                      onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                      className={`relative w-10 h-6 rounded-full transition-colors ${notificationsEnabled ? 'bg-emerald-500' : 'bg-gray-400'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${notificationsEnabled ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  {/* Privacy Policy */}
                  <button className={`w-full text-left flex items-center gap-3 p-3 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                    <Lock className="w-5 h-5" />
                    <span className="text-sm">Privacy Policy</span>
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </button>

                  {/* About */}
                  <button className={`w-full text-left flex items-center gap-3 p-3 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm">About Joy Drive</span>
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </button>
                </div>

                {/* Emergency Logout */}
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2 p-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold text-sm"
                >
                  <LogOut className="w-5 h-5" />
                  Emergency Logout
                </button>

                {/* Delete Account */}
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                      handleSignOut();
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold text-sm"
                >
                  <Trash2 className="w-5 h-5" />
                  Delete My Account
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Rating Modal */}
      <AnimatePresence>
        {showRating && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRating(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`fixed inset-4 max-w-md mx-auto my-auto rounded-2xl z-50 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-2xl overflow-y-auto max-h-[90vh]`}
            >
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Rate Your Driver</h2>
                  <button
                    onClick={() => setShowRating(false)}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Star Rating */}
                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">How was your trip?</p>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= rating
                              ? 'fill-emerald-500 text-emerald-500'
                              : theme === 'dark'
                              ? 'text-gray-600'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rating Categories */}
                <div className="space-y-3">
                  {[
                    { id: 'politeness', label: 'Driver Politeness' },
                    { id: 'driving', label: 'Driving Quality' },
                    { id: 'cleanliness', label: 'Vehicle Cleanliness' },
                  ].map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setRatingCategory(cat.id as any)}
                      className={`w-full p-3 rounded-lg text-left transition-colors ${
                        ratingCategory === cat.id
                          ? 'bg-emerald-500 text-white'
                          : theme === 'dark'
                          ? 'bg-gray-700 hover:bg-gray-600'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Comment */}
                <textarea
                  placeholder="Share your feedback (optional)"
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  className={`w-full p-3 rounded-lg border-2 outline-none resize-none text-sm ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-emerald-500'
                      : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400 focus:border-emerald-500'
                  }`}
                  rows={3}
                />

                {/* Submit Button */}
                <button
                  onClick={() => setShowRating(false)}
                  className="w-full bg-emerald-500 text-white py-3 rounded-lg font-bold hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Submit Rating
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
