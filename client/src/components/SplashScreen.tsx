import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Car } from 'lucide-react';

export const SplashScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 15000; // 15 seconds
    const intervalTime = 100;
    const increment = (100 / (duration / intervalTime));
    
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + increment;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0D1F17] text-white"
    >
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center"
      >
        <div className="relative mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 1,
              rotate: 360 
            }}
            transition={{ 
              scale: { duration: 1, ease: "easeOut" },
              opacity: { duration: 1, ease: "easeOut" },
              rotate: { duration: 4, repeat: Infinity, ease: "linear" }
            }}
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
          
          {/* Decorative rings */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.1, 0.2] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute -inset-4 border border-emerald-500/30 rounded-full"
          />
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [0.1, 0.05, 0.1] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute -inset-8 border border-emerald-500/20 rounded-full"
          />
        </div>

        <motion.h1 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          className="text-4xl font-display font-bold tracking-tight mb-2"
        >
          <motion.span
            animate={{ 
              color: ["#ffffff", "#00C17C", "#ffffff"],
            }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            joy-
          </motion.span>
          <span className="text-emerald-500">drive</span>
        </motion.h1>
        <motion.p 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="text-joy-muted text-sm font-medium tracking-widest uppercase"
        >
          Your Journey, Our Pride
        </motion.p>
      </motion.div>

      <div className="absolute bottom-20 w-64">
        <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden mb-4">
          <motion.div
            className="h-full bg-emerald-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              className="w-1.5 h-1.5 bg-emerald-500 rounded-full"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};
