import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Scene5() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 800),
      setTimeout(() => setPhase(2), 2000),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center z-10"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
      transition={{ duration: 1.2, ease: 'easeInOut' }}
    >
      
      {/* AI Chat Bubble */}
      <motion.div 
        className="bg-[#1A1A1A] border border-emerald-500/30 rounded-2xl p-[2vw] shadow-[0_10px_40px_rgba(16,185,129,0.15)] mb-[10vh] max-w-[40vw]"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20 }}
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
            <span className="text-black font-bold text-xs">AI</span>
          </div>
          <span className="text-emerald-400 font-bold text-[1.2vw]">Sik Coach</span>
        </div>
        <p className="text-[1.8vw] text-white font-body leading-snug">
          "Great progress! Your waist decreased 2.1cm this week while muscle mass increased by 0.5%."
        </p>
      </motion.div>

      {/* Final Logo Lockup */}
      {phase >= 1 && (
        <div className="text-center relative">
          <motion.div 
            className="absolute inset-0 bg-emerald-500 rounded-full blur-[80px] opacity-20"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 2 }}
          />
          <motion.h1 
            className="text-[8vw] font-black text-white tracking-tighter leading-none relative z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Sik AI
          </motion.h1>
          
          {phase >= 2 && (
            <motion.p 
              className="text-[2vw] text-emerald-400 font-body tracking-[0.2em] uppercase mt-4"
              initial={{ opacity: 0, filter: 'blur(10px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
            >
              Body scanning. Reimagined.
            </motion.p>
          )}
        </div>
      )}
    </motion.div>
  );
}
