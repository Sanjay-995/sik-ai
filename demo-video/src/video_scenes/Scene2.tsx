import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Scene2() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 2000),
      setTimeout(() => setPhase(3), 3500),
      setTimeout(() => setPhase(4), 5000),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-between px-[10vw] z-10"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100, filter: 'blur(10px)' }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="w-[40vw] relative h-[80vh] flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h2 className="text-[5vw] font-black text-white leading-tight">
            LiDAR<br/>Precision
          </h2>
          <p className="text-[1.8vw] text-white/60 mt-4 max-w-[30vw] font-body">
            11 body metrics captured in real-time with sub-millimeter accuracy.
          </p>
        </motion.div>

        {/* Floating readouts */}
        <div className="mt-12 space-y-4">
          {[
            { label: 'Chest', val: '98.4 cm', p: 1 },
            { label: 'Waist', val: '76.2 cm', p: 2 },
            { label: 'Body Fat', val: '14.2 %', p: 3 },
          ].map((item, i) => (
            <motion.div 
              key={i}
              className="flex items-center justify-between border-b border-white/10 pb-2 w-[25vw]"
              initial={{ opacity: 0, x: -20 }}
              animate={phase >= item.p ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ duration: 0.5, type: 'spring' }}
            >
              <span className="text-white/60 font-body text-[1.2vw] uppercase tracking-wider">{item.label}</span>
              <span className="text-emerald-400 font-display font-bold text-[1.5vw]">{item.val}</span>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="relative w-[35vw] h-[80vh]">
        {/* Silhouette Image */}
        <motion.img 
          src={`${import.meta.env.BASE_URL}images/body-silhouette.png`}
          className="absolute inset-0 w-full h-full object-contain z-10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5 }}
        />
        
        {/* Scan Line */}
        <motion.div 
          className="absolute left-0 right-0 h-[4px] bg-emerald-400 shadow-[0_0_20px_#10B981] z-20"
          initial={{ top: '10%', opacity: 0 }}
          animate={{ top: ['10%', '90%', '10%'], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 4, ease: 'easeInOut', delay: 0.5 }}
        />
      </div>
    </motion.div>
  );
}
