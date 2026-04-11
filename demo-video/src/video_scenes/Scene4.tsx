import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Scene4() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1200),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center z-10 px-[10vw]"
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex w-full gap-[5vw] items-center">
        <div className="w-1/2">
          <motion.h2 
            className="text-[4.5vw] font-black text-white leading-tight mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Track Every<br/>Change.
          </motion.h2>
          
          {phase >= 1 && (
            <motion.div 
              className="bg-[#1A1A1A] border border-white/10 rounded-2xl p-[2vw]"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring' }}
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <p className="text-white/50 text-[1vw] uppercase tracking-widest">Waist Trend</p>
                  <p className="text-[2.5vw] font-bold text-white mt-1">76.2 cm</p>
                </div>
                <div className="bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-full font-bold text-[1.2vw]">
                  -4.5%
                </div>
              </div>
              
              {/* Abstract Chart */}
              <div className="h-[15vh] flex items-end justify-between gap-2">
                {[80, 75, 70, 60, 50, 45, 30, 20].map((h, i) => (
                  <motion.div 
                    key={i}
                    className="w-full bg-emerald-500/80 rounded-t-sm"
                    initial={{ height: 0 }}
                    animate={phase >= 2 ? { height: `${100 - h}%` } : { height: 0 }}
                    transition={{ delay: i * 0.1, type: 'spring' }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </div>
        
        <div className="w-1/2 relative h-[60vh] bg-[#1A1A1A] border border-white/10 rounded-2xl overflow-hidden flex">
           {/* Before / After split mock */}
           <div className="w-1/2 h-full bg-[#0A0A0A] flex flex-col items-center justify-center border-r border-white/20">
              <span className="text-white/50 font-body uppercase tracking-widest text-[1.2vw] mb-4">Week 1</span>
              <div className="w-[15vw] h-[40vh] border border-white/20 border-dashed rounded-full flex items-center justify-center">
                 <span className="text-[2vw] text-white">82cm</span>
              </div>
           </div>
           <div className="w-1/2 h-full flex flex-col items-center justify-center bg-gradient-to-t from-emerald-900/20 to-transparent">
              <span className="text-emerald-400 font-body uppercase tracking-widest text-[1.2vw] mb-4">Week 8</span>
              <div className="w-[12vw] h-[40vh] border border-emerald-500 border-solid rounded-full flex items-center justify-center bg-emerald-500/10">
                 <span className="text-[2.5vw] text-emerald-400 font-bold">76cm</span>
              </div>
           </div>
        </div>
      </div>
    </motion.div>
  );
}
