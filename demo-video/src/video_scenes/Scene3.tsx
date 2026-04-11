import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Scene3() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 800),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const metrics = [
    { label: 'CHEST', value: '102.5', unit: 'cm', delay: 0.1 },
    { label: 'WAIST', value: '78.2', unit: 'cm', delay: 0.2 },
    { label: 'HIPS', value: '96.0', unit: 'cm', delay: 0.3 },
    { label: 'ARMS', value: '38.4', unit: 'cm', delay: 0.4 },
    { label: 'THIGHS', value: '58.1', unit: 'cm', delay: 0.5 },
    { label: 'BODY FAT', value: '12.4', unit: '%', delay: 0.6 },
  ];

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center bg-[#0A0A0A] z-10"
      initial={{ opacity: 0, scale: 1.2 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div 
        className="absolute inset-0 opacity-20"
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/ui-texture.png)`, backgroundSize: 'cover' }}
      />
      
      <div className="relative z-20 w-full max-w-[80vw] mx-auto">
        <motion.h2 
          className="text-center text-[4vw] font-black text-white mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Comprehensive Data
        </motion.h2>

        <div className="grid grid-cols-3 gap-[2vw]">
          {metrics.map((m, i) => (
            <motion.div 
              key={i}
              className="bg-[#1A1A1A] border border-white/10 rounded-2xl p-[2vw] relative overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ delay: m.delay, type: 'spring', stiffness: 300, damping: 25 }}
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
              <p className="text-white/50 text-[1vw] font-body tracking-widest mb-2">{m.label}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-[3vw] font-display font-bold text-white">{m.value}</span>
                <span className="text-[1.2vw] text-emerald-500 font-bold">{m.unit}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
