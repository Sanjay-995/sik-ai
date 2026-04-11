import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Scene1() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => setPhase(3), 2800),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center bg-transparent z-10"
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="relative mb-8">
        <motion.div 
          className="absolute inset-0 rounded-full bg-emerald-500 blur-[60px] opacity-20"
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.h1 
          className="text-[12vw] font-black text-white tracking-tighter leading-none relative z-10"
          initial={{ y: 40, opacity: 0, rotateX: -20 }}
          animate={{ y: 0, opacity: 1, rotateX: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          Sik AI
        </motion.h1>
      </div>

      <motion.p 
        className="text-[2.5vw] font-body text-emerald-400 tracking-[0.2em] uppercase"
        initial={{ opacity: 0, filter: 'blur(10px)' }}
        animate={phase >= 1 ? { opacity: 1, filter: 'blur(0px)' } : { opacity: 0, filter: 'blur(10px)' }}
        transition={{ duration: 0.8 }}
      >
        Your body. Measured. Mastered.
      </motion.p>
      
      {/* Small tech scanning line overlay on the logo */}
      {phase >= 2 && (
        <motion.div 
          className="absolute h-[2px] bg-emerald-500 shadow-[0_0_10px_#10B981] w-[40vw] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
          initial={{ opacity: 0, scaleX: 0, y: -50 }}
          animate={{ opacity: [0, 1, 1, 0], scaleX: [0, 1, 1, 0], y: [-50, -50, 50, 50] }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        />
      )}
    </motion.div>
  );
}
