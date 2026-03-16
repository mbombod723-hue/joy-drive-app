import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Search, Car, Package, Truck, User, Clock, ChevronRight, X, Info, ShieldCheck, LogOut, Moon, Sun, Bell, Globe, Navigation, Star, ArrowRight, Camera, FileText, Hash, Palette } from 'lucide-react';
import { useAppStore, useAuthStore, type Language } from './store/useStore';
import { translations } from './translations';
import { SplashScreen } from './components/SplashScreen';
import { Layout } from './components/Layout';
import { MapComponent } from './components/MapComponent';
import { supabase, getSupabase } from './lib/supabase';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { language, theme, setTheme, setLanguage, isNotificationsEnabled, toggleNotifications, isLocationSharingEnabled, toggleLocationSharing, activeTrip, setActiveTrip } = useAppStore();
  const { user, setUser, userName, setUserName, profilePic, setProfilePic } = useAuthStore();
  const t = translations[language];

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempName, setTempName] = useState(userName);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState({ clean: true, polite: true, comment: '' });
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
    'Joe Slovo Drive', 'Smit Street', 'Wolmarans Street', 'Juta Street'
  ];
  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;

    // Check auth state
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

  const filteredPickup = saAvenues.filter(a => a.toLowerCase().includes(pickupInput.toLowerCase()));
  const filteredDest = saAvenues.filter(a => a.toLowerCase().includes(destInput.toLowerCase()));

  const handleGoogleSignIn = async () => {
    const sb = getSupabase();
    if (!sb) {
      // Mock sign-in for development if Supabase is not configured
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
      // Mock sign-in for development if Supabase is not configured
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
    if (sb) await sb.auth.signOut();
    setUser(null);
  };

  const handleProfileUpdate = () => {
    setUserName(tempName);
    setIsEditingProfile(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const [showAbout, setShowAbout] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [driverStep, setDriverStep] = useState(1);
  const [driverData, setDriverData] = useState({
    photo: null as string | null,
    license: null as string | null,
    docs: null as string | null,
    nom: '',
    posteNom: '',
    plate: '',
    color: ''
  });
  const [isDriverApplying, setIsDriverApplying] = useState(false);

  const handleDeleteAccount = () => {
    if (window.confirm(t.deleteConfirm)) {
      handleSignOut();
      alert("Account deleted successfully.");
    }
  };

  const handleDriverPhoto = (field: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setDriverData(prev => ({ ...prev, [field]: reader.result as string }));
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const startTrip = (tier: any) => {
    setActiveTrip({
      id: Math.random().toString(36).substr(2, 9),
      tier,
      status: 'searching',
      driver: null
    });
    
    // Simulate driver finding
    setTimeout(() => {
      setActiveTrip((prev: any) => ({
        ...prev,
        status: 'accepted',
        driver: {
          name: 'Thabo Mokoena',
          rating: 4.8,
          car: 'Toyota Corolla • KJG 452 GP',
          phone: '+27 82 123 4567'
        }
      }));
      
      // Real-time notification
      const newNotif = { title: 'Driver Found', body: 'Thabo is on his way!', time: 'Just now', icon: Car };
      // In a real app, this would update a global notifications state
    }, 3000);

    // Simulate arrival
    setTimeout(() => {
      setActiveTrip((prev: any) => ({ ...prev, status: 'arrived' }));
      setShowRatingModal(true);
    }, 15000);
  };

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0D1F17] flex flex-col items-center justify-center p-6 text-white">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full max-w-sm flex flex-col items-center"
        >
          <div className="relative mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-500/40 relative overflow-hidden"
            >
              <motion.div
                animate={{ 
                  x: [-100, 0, 100],
                  opacity: [0, 1, 0]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute inset-0 bg-white/20 skew-x-12"
              />
              <Car className="w-14 h-14 text-white drop-shadow-lg" />
            </motion.div>
          </div>

          <motion.h1 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl font-display font-bold mb-2"
          >
            joy-<motion.span 
              animate={{ color: ['#00C17C', '#34D399', '#00C17C'] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-emerald-500"
            >
              drive
            </motion.span>
          </motion.h1>
          <p className="text-joy-muted mb-12 text-center">Your Journey, Our Pride</p>
          
          <div className="w-full space-y-3 mb-8">
            <button 
              onClick={handleGoogleSignIn}
              className="w-full bg-white text-joy-dark font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-transform"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {t.signInGoogle}
            </button>

            <button 
              onClick={handleFacebookSignIn}
              className="w-full bg-[#1877F2] text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-transform"
            >
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              {t.signInFacebook}
            </button>
          </div>

          <div className="w-full card bg-white/5 border-white/10 p-6 text-center">
            <h3 className="text-sm font-bold mb-1">{t.becomeDriver}</h3>
            <p className="text-[10px] text-joy-muted mb-4">{t.driverHeroSub}</p>
            <button 
              onClick={() => {
                setUser({ id: 'temp' } as any); // Temporary bypass to show drive screen
                setActiveTab('drive');
              }}
              className="text-emerald-500 text-xs font-bold flex items-center justify-center gap-1 hover:gap-2 transition-all"
            >
              {t.applyNow} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Layout 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        onNotificationClick={() => setShowNotifications(true)}
        onSettingsClick={() => setShowSettings(true)}
      >
        <div className="lg:grid lg:grid-cols-2 h-full">
          {/* Left Panel: Content */}
          <div className="flex flex-col h-full overflow-y-auto">
            <AnimatePresence mode="wait">
              {activeTab === 'home' && (
                <motion.div 
                  key="home"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-6 space-y-8"
                >
                  <div className="space-y-4">
                    <motion.h2 
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      className="text-3xl font-display font-bold"
                    >
                      {t.book} joy-<motion.span 
                        animate={{ color: ['#00C17C', '#34D399', '#00C17C'] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="text-emerald-500"
                      >
                        drive
                      </motion.span>
                    </motion.h2>
                    <div className="space-y-3">
                      <div className="relative">
                        <div className="flex items-center gap-4 p-4 bg-white dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
                          <input 
                            type="text" 
                            value={pickupInput}
                            onChange={(e) => {
                              setPickupInput(e.target.value);
                              setShowPickupSuggestions(true);
                            }}
                            onFocus={() => setShowPickupSuggestions(true)}
                            placeholder={t.pickup}
                            className="flex-1 bg-transparent outline-none text-sm font-medium placeholder:text-joy-muted"
                          />
                        </div>
                        {showPickupSuggestions && pickupInput && (
                          <div className="absolute top-full left-0 right-0 z-20 mt-2 bg-white dark:bg-joy-dark border border-black/5 dark:border-white/5 rounded-2xl shadow-2xl overflow-hidden">
                            {filteredPickup.map((addr) => (
                              <button 
                                key={addr} 
                                onClick={() => {
                                  setPickupInput(addr);
                                  setShowPickupSuggestions(false);
                                }}
                                className="w-full text-left p-4 hover:bg-emerald-500/10 text-sm transition-colors border-b border-black/5 last:border-0 dark:text-white"
                              >
                                {addr}, Johannesburg
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="relative">
                        <div className="flex items-center gap-4 p-4 bg-white dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5">
                          <div className="w-2 h-2 rounded-full bg-red-500 shadow-lg shadow-red-500/50" />
                          <input 
                            type="text" 
                            value={destInput}
                            onChange={(e) => {
                              setDestInput(e.target.value);
                              setShowDestSuggestions(true);
                            }}
                            onFocus={() => setShowDestSuggestions(true)}
                            placeholder={t.destination}
                            className="flex-1 bg-transparent outline-none text-sm font-medium placeholder:text-joy-muted"
                          />
                        </div>
                        {showDestSuggestions && destInput && (
                          <div className="absolute top-full left-0 right-0 z-20 mt-2 bg-white dark:bg-joy-dark border border-black/5 dark:border-white/5 rounded-2xl shadow-2xl overflow-hidden">
                            {filteredDest.map((addr) => (
                              <button 
                                key={addr} 
                                onClick={() => {
                                  setDestInput(addr);
                                  setShowDestSuggestions(false);
                                }}
                                className="w-full text-left p-4 hover:bg-emerald-500/10 text-sm transition-colors border-b border-black/5 last:border-0 dark:text-white"
                              >
                                {addr}, Johannesburg
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'lite', name: 'Joy Lite', icon: Navigation, price: 45, eta: '3-5', desc: t.motoTaxi, color: 'bg-blue-500' },
                        { id: 'economy', name: 'Joy Economy', icon: Car, price: 85, eta: '4-7', desc: t.affordableSedan, popular: true, color: 'bg-emerald-500' },
                        { id: 'express', name: 'Joy Express', icon: Car, price: 145, eta: '2-4', desc: t.prioritySedan, color: 'bg-orange-500' },
                        { id: 'vip', name: 'Joy VIP', icon: Truck, price: 295, eta: '5-8', desc: t.luxurySuv, color: 'bg-purple-500' },
                        { id: 'colis', name: 'Joy Colis', icon: Package, price: 125, eta: '10-15', desc: t.packages, color: 'bg-pink-500' },
                        { id: 'moving', name: 'Joy Moving', icon: Truck, price: 1250, eta: '20-30', desc: t.moving, color: 'bg-indigo-500' },
                      ].map((tier) => (
                        <button 
                          key={tier.id}
                          onClick={() => setActiveTrip({ tier })}
                          className={cn(
                            "card relative flex flex-col items-start text-left p-4 transition-all hover:scale-[1.02]",
                            activeTrip?.tier?.id === tier.id ? "border-emerald-500 bg-emerald-500/5 ring-2 ring-emerald-500/20" : "hover:border-emerald-500/30"
                          )}
                        >
                          {tier.popular && (
                            <span className="absolute -top-2 right-2 bg-emerald-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase">
                              {t.popular}
                            </span>
                          )}
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3 shadow-lg", tier.color)}>
                            <tier.icon className={cn("w-6 h-6 text-white")} />
                          </div>
                          <span className="text-sm font-bold">{tier.name}</span>
                          <span className="text-[10px] text-joy-muted mb-2 leading-tight">{tier.desc}</span>
                          <div className="flex items-baseline gap-1 mt-auto">
                            <span className="text-xs font-bold text-emerald-500">R {tier.price}</span>
                            <span className="text-[8px] text-joy-muted uppercase tracking-tighter">{t.eta} {tier.eta} {t.min}</span>
                          </div>
                        </button>
                      ))}
                    </div>

                    <button 
                      onClick={() => activeTrip?.tier && startTrip(activeTrip.tier)}
                      disabled={!activeTrip?.tier || activeTrip.status === 'searching'}
                      className="btn-dark-blue w-full flex items-center justify-center gap-3 shadow-xl shadow-blue-900/40 relative overflow-hidden group"
                    >
                      <span className="relative z-10">{t.findDriver}</span>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="relative z-10"
                      >
                        <ArrowRight className="w-5 h-5" />
                      </motion.div>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </button>

                  {/* Become a Driver Section on Home removed */}
                </motion.div>
              )}

              {activeTab === 'packages' && (
                <motion.div 
                  key="packages"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 space-y-8"
                >
                  <h2 className="text-3xl font-display font-bold">{t.packages}</h2>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 p-4 bg-white dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <input type="text" placeholder={t.pickup} className="flex-1 bg-transparent outline-none text-sm font-medium" />
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-white dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <input type="text" placeholder="Recipient Address" className="flex-1 bg-transparent outline-none text-sm font-medium" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'lite', name: t.lite, price: 45, eta: t.sameDay, desc: t.smallParcel },
                      { id: 'economy', name: t.economy, price: 85, eta: '2-4 ' + t.hours, desc: t.mediumParcel, popular: true },
                      { id: 'express', name: t.express, price: 125, eta: t.under90, desc: t.priority },
                      { id: 'vip', name: t.vip, price: 245, eta: t.insured, desc: t.fragile },
                    ].map((tier) => (
                      <button key={tier.id} className={cn("card flex flex-col items-start text-left p-4", tier.popular && "border-emerald-500 bg-emerald-500/5")}>
                        <Package className="w-6 h-6 text-emerald-500 mb-2" />
                        <span className="text-sm font-bold">{tier.name}</span>
                        <span className="text-[10px] text-joy-muted mb-2 leading-tight">{tier.desc}</span>
                        <div className="flex items-baseline gap-1 mt-auto">
                          <span className="text-xs font-bold text-emerald-500">R {tier.price}</span>
                          <span className="text-[8px] text-joy-muted uppercase">{tier.eta}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  <button className="btn-primary w-full">{t.book} {t.packages}</button>
                </motion.div>
              )}

              {activeTab === 'moving' && (
                <motion.div 
                  key="moving"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 space-y-8"
                >
                  <h2 className="text-3xl font-display font-bold">{t.moving}</h2>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 p-4 bg-white dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <input type="text" placeholder="Moving from" className="flex-1 bg-transparent outline-none text-sm font-medium" />
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-white dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <input type="text" placeholder="Moving to" className="flex-1 bg-transparent outline-none text-sm font-medium" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'lite', name: t.lite, price: 450, eta: '1 ' + t.helpers, desc: t.minivan },
                      { id: 'economy', name: t.economy, price: 850, eta: '2 ' + t.helpers, desc: t.truck3ton, popular: true },
                      { id: 'express', name: t.express, price: 1450, eta: '3 ' + t.helpers, desc: t.truck5ton },
                      { id: 'vip', name: t.vip, price: 2950, eta: t.insured, desc: t.fullPacking },
                    ].map((tier) => (
                      <button key={tier.id} className={cn("card relative flex flex-col items-start text-left p-4", tier.popular && "border-emerald-500 bg-emerald-500/5")}>
                        {tier.popular && <span className="absolute -top-2 right-2 bg-emerald-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase">{t.popular}</span>}
                        <Truck className="w-6 h-6 text-emerald-500 mb-2" />
                        <span className="text-sm font-bold">{tier.name}</span>
                        <span className="text-[10px] text-joy-muted mb-2 leading-tight">{tier.desc}</span>
                        <div className="flex items-baseline gap-1 mt-auto">
                          <span className="text-xs font-bold text-emerald-500">R {tier.price}</span>
                          <span className="text-[8px] text-joy-muted uppercase">{tier.eta}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  <button className="btn-primary w-full">{t.book} {t.moving}</button>
                </motion.div>
              )}

              {activeTab === 'drive' && (
                <motion.div 
                  key="drive"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col min-h-full"
                >
                  <div className="bg-[#0D1F17] text-white p-8 pt-12 rounded-b-[40px] shadow-xl relative overflow-hidden">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="absolute -top-24 -right-24 w-64 h-64 border border-emerald-500/20 rounded-full"
                    />
                    <h2 className="text-3xl font-display font-bold mb-2 relative z-10">{t.driverHeroTitle}</h2>
                    <p className="text-joy-muted mb-8 relative z-10">{t.driverHeroSub}</p>
                    
                    <div className="grid grid-cols-3 gap-4 mb-8 relative z-10">
                      <div className="text-center">
                        <div className="text-emerald-500 font-bold text-lg">R 1,200</div>
                        <div className="text-[8px] text-joy-muted uppercase tracking-wider">{t.dailyEarnings}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-emerald-500 font-bold text-lg">4.9★</div>
                        <div className="text-[8px] text-joy-muted uppercase tracking-wider">{t.rating}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-emerald-500 font-bold text-lg">24/7</div>
                        <div className="text-[8px] text-joy-muted uppercase tracking-wider">{t.support}</div>
                      </div>
                    </div>

                    {!isDriverApplying ? (
                      <button 
                        onClick={() => setIsDriverApplying(true)}
                        className="w-full bg-emerald-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20 active:scale-95 transition-transform"
                      >
                        {t.applyNow}
                      </button>
                    ) : (
                      <div className="space-y-6 relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          {[1, 2, 3].map((s) => (
                            <div key={s} className={cn("w-full h-1 rounded-full mx-1", driverStep >= s ? "bg-emerald-500" : "bg-white/10")} />
                          ))}
                        </div>

                        {driverStep === 1 && (
                          <div className="space-y-4">
                            <button onClick={() => handleDriverPhoto('photo')} className="w-full p-6 glass rounded-2xl flex flex-col items-center gap-3 border-dashed border-2 border-white/20">
                              {driverData.photo ? <img src={driverData.photo} className="w-16 h-16 rounded-full object-cover" /> : <Camera className="w-8 h-8 text-emerald-500" />}
                              <span className="text-sm font-bold">{t.driverPhoto}</span>
                            </button>
                            <button onClick={() => handleDriverPhoto('license')} className="w-full p-6 glass rounded-2xl flex flex-col items-center gap-3 border-dashed border-2 border-white/20">
                              {driverData.license ? <ShieldCheck className="w-8 h-8 text-emerald-500" /> : <FileText className="w-8 h-8 text-emerald-500" />}
                              <span className="text-sm font-bold">{t.driverLicense}</span>
                            </button>
                            <button onClick={() => setDriverStep(2)} className="btn-primary w-full">{t.submit}</button>
                          </div>
                        )}

                        {driverStep === 2 && (
                          <div className="space-y-4">
                            <button onClick={() => handleDriverPhoto('docs')} className="w-full p-6 glass rounded-2xl flex flex-col items-center gap-3 border-dashed border-2 border-white/20">
                              {driverData.docs ? <ShieldCheck className="w-8 h-8 text-emerald-500" /> : <FileText className="w-8 h-8 text-emerald-500" />}
                              <span className="text-sm font-bold">{t.vehicleDocs}</span>
                            </button>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="flex items-center gap-3 p-4 glass rounded-2xl">
                                <User className="w-5 h-5 text-emerald-500" />
                                <input 
                                  type="text" 
                                  placeholder="Nom" 
                                  value={driverData.nom}
                                  onChange={(e) => setDriverData(prev => ({ ...prev, nom: e.target.value }))}
                                  className="bg-transparent outline-none flex-1 text-sm font-bold" 
                                />
                              </div>
                              <div className="flex items-center gap-3 p-4 glass rounded-2xl">
                                <User className="w-5 h-5 text-emerald-500" />
                                <input 
                                  type="text" 
                                  placeholder="Poste-nom" 
                                  value={driverData.posteNom}
                                  onChange={(e) => setDriverData(prev => ({ ...prev, posteNom: e.target.value }))}
                                  className="bg-transparent outline-none flex-1 text-sm font-bold" 
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 glass rounded-2xl">
                              <Hash className="w-5 h-5 text-emerald-500" />
                              <input 
                                type="text" 
                                placeholder={t.plateNumber} 
                                value={driverData.plate}
                                onChange={(e) => setDriverData(prev => ({ ...prev, plate: e.target.value }))}
                                className="bg-transparent outline-none flex-1 text-sm font-bold" 
                              />
                            </div>
                            <div className="flex items-center gap-3 p-4 glass rounded-2xl">
                              <Palette className="w-5 h-5 text-emerald-500" />
                              <input 
                                type="text" 
                                placeholder={t.vehicleColor} 
                                value={driverData.color}
                                onChange={(e) => setDriverData(prev => ({ ...prev, color: e.target.value }))}
                                className="bg-transparent outline-none flex-1 text-sm font-bold" 
                              />
                            </div>
                            <button onClick={() => setDriverStep(3)} className="btn-primary w-full">{t.submit}</button>
                          </div>
                        )}

                        {driverStep === 3 && (
                          <div className="text-center py-8">
                            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                              <ShieldCheck className="w-10 h-10 text-emerald-500" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">{t.tripCompleted}</h3>
                            <p className="text-joy-muted text-sm mb-8">{t.pendingApproval}</p>
                            <button onClick={() => { setIsDriverApplying(false); setDriverStep(1); }} className="btn-primary w-full">Done</button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="p-8">
                    <h3 className="font-bold mb-6 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-500" />
                      {t.requirements}
                    </h3>
                    <ul className="space-y-4">
                      {[t.license, t.pdp, t.vehicleYear, t.verification, t.supabaseAccount].map((req, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center mt-0.5">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                          </div>
                          <span className="text-sm text-joy-muted">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}

              {activeTab === 'history' && (
                <motion.div 
                  key="history"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 space-y-6"
                >
                  <h2 className="text-3xl font-display font-bold">{t.history}</h2>
                  <div className="space-y-4">
                    {tripHistory.map((item, i) => (
                      <div key={i} className="card flex items-center gap-4 border-emerald-500/10">
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                          <item.icon className="w-6 h-6 text-emerald-500" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-bold dark:text-white">{item.route}</div>
                          <div className="text-[10px] text-joy-muted">{item.tier} • {item.date}</div>
                        </div>
                        <div className="text-sm font-bold text-emerald-500">R {item.price}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Panel: Map (Desktop) / Mobile Map is fixed in home */}
          <div className="hidden lg:block h-full relative border-l border-black/5 dark:border-white/5">
            <MapComponent />
          </div>
        </div>

      {/* Notifications Modal */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-white dark:bg-joy-dark flex flex-col"
          >
            <div className="p-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
              <h2 className="text-xl font-display font-bold">{t.notifications}</h2>
              <button onClick={() => setShowNotifications(false)} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {[
                { title: 'Driver Arrived', body: 'Your driver is waiting outside.', time: '2m ago', icon: Car },
                { title: 'Trip Completed', body: 'Thank you for riding with Joy-Drive!', time: '1h ago', icon: ShieldCheck },
                { title: 'Promo Offer', body: 'Get 20% off your next moving service.', time: '5h ago', icon: Info },
              ].map((notif, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-white/5">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center shrink-0">
                    <notif.icon className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <div className="text-sm font-bold">{notif.title}</div>
                    <p className="text-xs text-joy-muted mb-1">{notif.body}</p>
                    <span className="text-[10px] text-emerald-500 font-medium">{notif.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-white dark:bg-joy-dark flex flex-col"
          >
            <div className="p-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
              <h2 className="text-xl font-display font-bold">{t.settings}</h2>
              <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Profile Section */}
              <div className="flex flex-col items-center p-6 glass rounded-[40px] mb-6">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-emerald-500 shadow-xl bg-gray-200 dark:bg-white/10">
                    {profilePic ? (
                      <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-12 h-12 text-joy-muted" />
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 p-2 bg-emerald-500 rounded-full text-white cursor-pointer shadow-lg active:scale-95 transition-transform">
                    <Sun className="w-4 h-4" />
                    <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                  </label>
                </div>
                
                {isEditingProfile ? (
                  <div className="mt-4 w-full space-y-3">
                    <input 
                      type="text" 
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      className="w-full bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-3 rounded-xl outline-none text-center font-bold"
                    />
                    <div className="flex gap-2">
                      <button onClick={handleProfileUpdate} className="flex-1 bg-emerald-500 text-white py-2 rounded-xl font-bold text-sm">Save</button>
                      <button onClick={() => setIsEditingProfile(false)} className="flex-1 bg-gray-200 dark:bg-white/10 py-2 rounded-xl font-bold text-sm">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 text-center">
                    <h3 className="text-xl font-display font-bold">{userName}</h3>
                    <button onClick={() => setIsEditingProfile(true)} className="text-emerald-500 text-xs font-bold mt-1">Edit Profile</button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-emerald-500" />
                    <span className="text-sm font-medium">{t.language}</span>
                  </div>
                  <select 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as Language)}
                    className="bg-transparent text-xs font-bold text-emerald-500 uppercase outline-none cursor-pointer"
                  >
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                    <option value="zu">IsiZulu</option>
                    <option value="af">Afrikaans</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
                  <div className="flex items-center gap-3">
                    {theme === 'dark' ? <Moon className="w-5 h-5 text-emerald-500" /> : <Sun className="w-5 h-5 text-emerald-500" />}
                    <span className="text-sm font-medium">{t.darkMode}</span>
                  </div>
                  <button 
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className={cn(
                      "w-12 h-6 rounded-full p-1 transition-colors",
                      theme === 'dark' ? "bg-emerald-500" : "bg-gray-300"
                    )}
                  >
                    <div className={cn("w-4 h-4 bg-white rounded-full transition-transform", theme === 'dark' && "translate-x-6")} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-emerald-500" />
                    <span className="text-sm font-medium">{t.notifications}</span>
                  </div>
                  <button 
                    onClick={toggleNotifications}
                    className={cn(
                      "w-12 h-6 rounded-full p-1 transition-colors",
                      isNotificationsEnabled ? "bg-emerald-500" : "bg-gray-300"
                    )}
                  >
                    <div className={cn("w-4 h-4 bg-white rounded-full transition-transform", isNotificationsEnabled && "translate-x-6")} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <Navigation className="w-5 h-5 text-emerald-500" />
                    <span className="text-sm font-medium">{t.shareLocation}</span>
                  </div>
                  <button 
                    onClick={toggleLocationSharing}
                    className={cn(
                      "w-12 h-6 rounded-full p-1 transition-colors",
                      isLocationSharingEnabled ? "bg-emerald-500" : "bg-gray-300"
                    )}
                  >
                    <div className={cn("w-4 h-4 bg-white rounded-full transition-transform", isLocationSharingEnabled && "translate-x-6")} />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <button onClick={() => setShowAbout(true)} className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <Info className="w-5 h-5 text-emerald-500" />
                    <span className="text-sm font-medium">{t.about}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-joy-muted" />
                </button>
                <button onClick={() => setShowPrivacy(true)} className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    <span className="text-sm font-medium">{t.privacy}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-joy-muted" />
                </button>
                <button onClick={handleSignOut} className="w-full flex items-center justify-between p-4 bg-red-500/5 rounded-2xl text-red-500">
                  <div className="flex items-center gap-3">
                    <LogOut className="w-5 h-5" />
                    <span className="text-sm font-medium">{t.logout || 'Logout'}</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button onClick={handleDeleteAccount} className="w-full flex items-center justify-between p-4 bg-red-500/5 rounded-2xl text-red-500 opacity-60 hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-3">
                    <X className="w-5 h-5" />
                    <span className="text-sm font-medium">{t.deleteAccount}</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Emergency Numbers */}
                <div className="p-4 glass rounded-2xl space-y-3">
                  <h3 className="text-sm font-bold text-red-500 flex items-center gap-2">
                    <Bell className="w-4 h-4" /> {t.emergency}
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    <a href="tel:10111" className="flex items-center justify-between p-3 bg-red-500/10 rounded-xl text-xs font-bold text-red-500">
                      <span>{t.emergencyPolice}</span>
                      <ChevronRight className="w-4 h-4" />
                    </a>
                    <a href="tel:10177" className="flex items-center justify-between p-3 bg-red-500/10 rounded-xl text-xs font-bold text-red-500">
                      <span>{t.emergencyAmbulance}</span>
                      <ChevronRight className="w-4 h-4" />
                    </a>
                    <a href="tel:112" className="flex items-center justify-between p-3 bg-red-500/10 rounded-xl text-xs font-bold text-red-500">
                      <span>{t.emergencyGeneral}</span>
                      <ChevronRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="pt-8 text-center">
                <button 
                  onClick={handleSignOut}
                  className="flex items-center gap-2 text-red-500 font-bold mx-auto mb-8"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
                <div className="text-[10px] text-joy-muted space-y-1">
                  <div>{t.version}</div>
                  <div>{t.connected}</div>
                  <div>{t.poweredBy}</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Trip Overlay */}
      <AnimatePresence>
        {activeTrip && activeTrip.status !== 'completed' && (
          <motion.div 
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            className="fixed bottom-24 left-4 right-4 z-40 lg:left-auto lg:right-8 lg:w-80"
          >
            <div className="glass p-4 rounded-[24px] shadow-2xl border-emerald-500/20">
              {activeTrip.status === 'searching' ? (
                <div className="flex items-center gap-4 py-2">
                  <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm font-bold text-emerald-500">{t.searchingDriver}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-sm">{activeTrip?.driver?.name}</h3>
                        <div className="flex items-center gap-1 text-yellow-400 text-[10px]">
                          <Star className="w-3 h-3 fill-current" />
                          <span className="font-bold">{activeTrip?.driver?.rating}</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-joy-muted truncate">{activeTrip?.driver?.car}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button className="flex items-center justify-center gap-2 bg-emerald-500 text-white py-3 rounded-xl text-xs font-bold active:scale-95 transition-transform">
                      <Bell className="w-4 h-4" /> {t.message}
                    </button>
                    <a href={`tel:${activeTrip?.driver?.phone}`} className="flex items-center justify-center gap-2 bg-joy-dark dark:bg-white/10 text-white py-3 rounded-xl text-xs font-bold active:scale-95 transition-transform text-center">
                      <Navigation className="w-4 h-4" /> {t.call}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rating Modal */}
      <AnimatePresence>
        {showRatingModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-sm glass p-8 rounded-[40px] text-center"
            >
              <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="w-10 h-10 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-display font-bold mb-2">{t.tripCompleted}</h2>
              <p className="text-joy-muted text-sm mb-8">{t.rateDriver}</p>

              <div className="flex justify-center gap-2 mb-8">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button 
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform active:scale-125"
                  >
                    <Star className={cn("w-10 h-10", rating >= star ? "text-yellow-400 fill-current" : "text-gray-300")} />
                  </button>
                ))}
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
                  <span className="text-sm font-medium">{t.cleanliness}</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setFeedback(f => ({ ...f, clean: true }))}
                      className={cn("text-[10px] px-3 py-1 rounded-full font-bold transition-colors", feedback.clean ? "bg-emerald-500 text-white" : "bg-gray-200 dark:bg-white/10")}
                    >
                      {t.clean}
                    </button>
                    <button 
                      onClick={() => setFeedback(f => ({ ...f, clean: false }))}
                      className={cn("text-[10px] px-3 py-1 rounded-full font-bold transition-colors", !feedback.clean ? "bg-red-500 text-white" : "bg-gray-200 dark:bg-white/10")}
                    >
                      {t.dirty}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
                  <span className="text-sm font-medium">{t.politeness}</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setFeedback(f => ({ ...f, polite: true }))}
                      className={cn("text-[10px] px-3 py-1 rounded-full font-bold transition-colors", feedback.polite ? "bg-emerald-500 text-white" : "bg-gray-200 dark:bg-white/10")}
                    >
                      {t.veryPolite}
                    </button>
                    <button 
                      onClick={() => setFeedback(f => ({ ...f, polite: false }))}
                      className={cn("text-[10px] px-3 py-1 rounded-full font-bold transition-colors", !feedback.polite ? "bg-red-500 text-white" : "bg-gray-200 dark:bg-white/10")}
                    >
                      {t.impolite}
                    </button>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => {
                  const newTrip = {
                    type: 'ride',
                    route: `${pickupInput || 'Current'} → ${destInput || 'Destination'}`,
                    tier: activeTrip.tier.name,
                    date: new Date().toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
                    price: activeTrip.tier.price,
                    icon: Car
                  };
                  setTripHistory(prev => [newTrip, ...prev]);
                  setShowRatingModal(false);
                  setActiveTrip(null);
                  setRating(0);
                  setPickupInput('');
                  setDestInput('');
                }}
                className="btn-primary w-full"
              >
                {t.submit}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* About Modal */}
      <AnimatePresence>
        {showAbout && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-md flex items-center justify-center p-6">
            <div className="w-full max-w-md glass p-8 rounded-[40px] relative">
              <button onClick={() => setShowAbout(false)} className="absolute top-6 right-6 p-2 glass rounded-full"><X className="w-5 h-5" /></button>
              <h2 className="text-2xl font-display font-bold mb-4">{t.about}</h2>
              <p className="text-sm text-joy-muted leading-relaxed">{t.aboutContent}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Privacy Modal */}
      <AnimatePresence>
        {showPrivacy && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-md flex items-center justify-center p-6">
            <div className="w-full max-w-md glass p-8 rounded-[40px] relative">
              <button onClick={() => setShowPrivacy(false)} className="absolute top-6 right-6 p-2 glass rounded-full"><X className="w-5 h-5" /></button>
              <h2 className="text-2xl font-display font-bold mb-4">{t.privacy}</h2>
              <p className="text-sm text-joy-muted leading-relaxed">{t.privacyContent}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  </div>
);
}
