import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, Activity, TrendingUp, Star } from 'lucide-react';

export function Scene6() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 1000), // show line
      setTimeout(() => setPhase(2), 2500), // switch to fat
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col bg-[#0A0A0A] pb-24 overflow-hidden"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4 }}
    >
      <div className="px-5 pt-10 pb-4 flex flex-col gap-5">
        <div>
          <motion.h2 className="text-white text-[22px] font-[800]" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>Progress</motion.h2>
          <motion.div className="text-[#9CA3AF] text-[12px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>9 scans · 8 weeks</motion.div>
        </div>

        {/* Chart Card */}
        <motion.div 
          className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-[20px] p-5 flex flex-col gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="text-[#9CA3AF] text-[13px] font-[600] mb-0.5">{phase < 2 ? 'Weight' : 'Body Fat'}</div>
              <div className={`text-[26px] font-[800] leading-none ${phase < 2 ? 'text-[#3B82F6]' : 'text-[#F59E0B]'}`}>{phase < 2 ? '80.2kg' : '16.5%'}</div>
            </div>
            <div className="bg-[rgba(239,68,68,0.15)] px-2 py-1 rounded border border-[rgba(239,68,68,0.3)]">
              <span className="text-[#EF4444] text-[11px] font-bold">↘ {phase < 2 ? '3.0kg' : '2.5%'}</span>
            </div>
          </div>

          <div className="h-[120px] relative w-full">
             <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
               {phase < 2 ? (
                 <>
                   <motion.path d="M0 20 L15 30 L30 45 L45 40 L60 60 L75 75 L85 70 L100 90" fill="none" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1 }} />
                   <motion.path d="M0 20 L15 30 L30 45 L45 40 L60 60 L75 75 L85 70 L100 90 L100 100 L0 100 Z" fill="url(#gradBlue)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.5 }} />
                   <defs>
                    <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(59,130,246,0.3)" />
                      <stop offset="100%" stopColor="rgba(59,130,246,0)" />
                    </linearGradient>
                  </defs>
                 </>
               ) : (
                 <>
                   <motion.path d="M0 30 L15 35 L30 30 L45 50 L60 55 L75 70 L85 85 L100 80" fill="none" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8 }} />
                   <motion.path d="M0 30 L15 35 L30 30 L45 50 L60 55 L75 70 L85 85 L100 80 L100 100 L0 100 Z" fill="url(#gradOrg)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.5 }} />
                   <defs>
                    <linearGradient id="gradOrg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(245,158,11,0.3)" />
                      <stop offset="100%" stopColor="rgba(245,158,11,0)" />
                    </linearGradient>
                  </defs>
                 </>
               )}
             </svg>
          </div>
        </motion.div>

        {/* Chips */}
        <motion.div 
          className="flex gap-2 overflow-hidden py-1 w-[150%]"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        >
          <div className={`rounded-full px-4 py-1.5 text-[12px] font-semibold whitespace-nowrap transition-colors ${phase < 2 ? 'bg-[#3B82F6] text-white' : 'bg-[#1A1A1A] border border-[#2A2A2A] text-white'}`}>Weight</div>
          <div className={`rounded-full px-4 py-1.5 text-[12px] font-semibold whitespace-nowrap transition-colors ${phase >= 2 ? 'bg-[#F59E0B] text-[#0A0A0A]' : 'bg-[#1A1A1A] border border-[#2A2A2A] text-white'}`}>Body Fat</div>
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-full px-4 py-1.5 text-white text-[12px] font-semibold whitespace-nowrap">Muscle Mass</div>
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-full px-4 py-1.5 text-white text-[12px] font-semibold whitespace-nowrap">Body Score</div>
        </motion.div>

        {/* 8-Week Summary */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="text-white text-[16px] font-[700] mb-3">8-Week Summary</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-4 flex flex-col gap-2">
              <div className="w-8 h-8 rounded-full bg-[rgba(16,185,129,0.15)] flex items-center justify-center"><TrendingDown className="w-4 h-4 text-[#10B981]" /></div>
              <div>
                <div className="text-white text-[20px] font-bold">3.0kg</div>
                <div className="text-[#9CA3AF] text-[11px]">Weight Lost</div>
              </div>
            </div>
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-4 flex flex-col gap-2">
              <div className="w-8 h-8 rounded-full bg-[rgba(245,158,11,0.15)] flex items-center justify-center"><Activity className="w-4 h-4 text-[#F59E0B]" /></div>
              <div>
                <div className="text-white text-[20px] font-bold">2.5%</div>
                <div className="text-[#9CA3AF] text-[11px]">Fat Lost</div>
              </div>
            </div>
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-4 flex flex-col gap-2">
              <div className="w-8 h-8 rounded-full bg-[rgba(59,130,246,0.15)] flex items-center justify-center"><TrendingUp className="w-4 h-4 text-[#3B82F6]" /></div>
              <div>
                <div className="text-white text-[20px] font-bold">+2.0kg</div>
                <div className="text-[#9CA3AF] text-[11px]">Muscle Gained</div>
              </div>
            </div>
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-4 flex flex-col gap-2">
              <div className="w-8 h-8 rounded-full bg-[rgba(16,185,129,0.15)] flex items-center justify-center"><Star className="w-4 h-4 text-[#10B981]" /></div>
              <div>
                <div className="text-white text-[20px] font-bold">+8pts</div>
                <div className="text-[#9CA3AF] text-[11px]">Score Improved</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}