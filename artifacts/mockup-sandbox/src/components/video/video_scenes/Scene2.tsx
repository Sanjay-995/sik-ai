import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Cpu, Clock, TrendingUp, Columns } from 'lucide-react';

export function Scene2() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1000),
      setTimeout(() => setPhase(3), 1500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col bg-[#0A0A0A] overflow-y-auto pb-24 no-scrollbar"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4 }}
    >
      <div className="p-5 flex flex-col gap-5">
        {/* Header */}
        <div className="flex justify-between items-center mt-8">
          <div>
            <div className="text-[#9CA3AF] text-[11px] font-medium tracking-wide">Good morning,</div>
            <div className="text-white text-[20px] font-[800]">Alex 👋</div>
          </div>
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-full px-3 py-1.5 flex items-center gap-1.5">
            <span className="text-[#F59E0B] text-xs">⚡</span>
            <span className="text-white text-xs font-semibold">Upgrade</span>
          </div>
        </div>

        {/* Main Card */}
        <motion.div 
          className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-[20px] p-4 flex flex-col relative overflow-hidden"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex gap-4 mb-3">
            <div className="w-1/2 relative flex items-center justify-center min-h-[140px] bg-[#141414] rounded-2xl border border-[#2A2A2A]/50">
              <svg className="w-20 h-32 opacity-25" viewBox="0 0 100 200" preserveAspectRatio="xMidYMid meet">
                <path d="M50 10 C42 10 35 17 35 25 C35 32 40 37 45 39 C40 45 30 50 20 60 C15 65 15 90 20 120 C25 110 30 100 35 100 C35 120 30 150 30 180 C35 190 40 190 45 180 C45 150 50 120 50 120 C50 120 55 150 55 180 C60 190 65 190 70 180 C70 150 65 120 65 100 C70 100 75 110 80 120 C85 90 85 65 80 60 C70 50 60 45 55 39 C60 37 65 32 65 25 C65 17 58 10 50 10 Z" fill="white" stroke="white" strokeWidth="1" strokeLinejoin="round" />
              </svg>
              {/* Highlight dots */}
              <motion.div className="absolute w-1.5 h-1.5 bg-[#10B981] rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)] top-[40%] left-[45%]" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />
              <motion.div className="absolute w-1.5 h-1.5 bg-[#10B981] rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)] top-[50%] left-[55%]" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} />
              <motion.div className="absolute w-1.5 h-1.5 bg-[#10B981] rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)] top-[60%] left-[40%]" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 1 }} />
            </div>
            <div className="w-1/2 flex flex-col justify-center items-center gap-3">
              <div className="relative w-[72px] h-[72px] flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#141414" strokeWidth="4" />
                  <motion.path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#10B981" strokeWidth="4" strokeDasharray="100, 100" 
                    initial={{ strokeDasharray: "0, 100" }}
                    animate={{ strokeDasharray: "87, 100" }}
                    transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                  />
                </svg>
                <div className="text-white text-2xl font-[900]">87</div>
              </div>
              <div className="bg-[#141414] px-2.5 py-1 rounded text-[#9CA3AF] text-[10px] font-semibold border border-[#2A2A2A]">Apr 10</div>
              <div className="bg-[rgba(16,185,129,0.15)] text-[#10B981] text-[11px] font-bold px-3 py-1.5 rounded-lg border border-[rgba(16,185,129,0.3)] flex items-center gap-1.5">
                <Camera className="w-3 h-3" /> New Scan
              </div>
            </div>
          </div>
          <div className="text-[#4B5563] text-[11px] text-center w-full font-medium">Tap body zones to see measurements</div>
        </motion.div>

        {/* Key Metrics */}
        <div>
          <div className="text-white text-[16px] font-[700] mb-3">Key Metrics</div>
          <div className="grid grid-cols-2 gap-3">
            <motion.div className="bg-[#1A1A1A] rounded-2xl p-3.5 border border-[#2A2A2A]" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
              <div className="text-[#9CA3AF] text-[11px] font-medium mb-1">Weight</div>
              <div className="text-white text-lg font-bold mb-1">80.2 <span className="text-[#9CA3AF] text-sm font-normal">kg</span></div>
              <div className="text-[#10B981] text-[10px] font-bold flex items-center">▼ 0.3 vs last</div>
            </motion.div>
            <motion.div className="bg-[#1A1A1A] rounded-2xl p-3.5 border border-[#2A2A2A]" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
              <div className="text-[#9CA3AF] text-[11px] font-medium mb-1">Body Fat</div>
              <div className="text-white text-lg font-bold mb-1">16.5<span className="text-[#9CA3AF] text-sm font-normal">%</span></div>
              <div className="text-[#10B981] text-[10px] font-bold flex items-center">▼ 0.2 vs last</div>
            </motion.div>
            <motion.div className="bg-[#1A1A1A] rounded-2xl p-3.5 border border-[#2A2A2A]" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
              <div className="text-[#9CA3AF] text-[11px] font-medium mb-1">BMI</div>
              <div className="text-[#10B981] text-lg font-bold">25.3</div>
            </motion.div>
            <motion.div className="bg-[#1A1A1A] rounded-2xl p-3.5 border border-[#2A2A2A]" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
              <div className="text-[#9CA3AF] text-[11px] font-medium mb-1">Muscle Mass</div>
              <div className="text-white text-lg font-bold">43.1 <span className="text-[#9CA3AF] text-sm font-normal">kg</span></div>
            </motion.div>
          </div>
        </div>

        {/* Measurements */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
          <div className="text-white text-[16px] font-[700] mb-3">Measurements</div>
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex justify-between items-center border-b border-[#2A2A2A] pb-2"><span className="text-[#9CA3AF] text-sm">Chest</span><span className="text-white font-semibold text-sm">97.2cm</span></div>
            <div className="flex justify-between items-center border-b border-[#2A2A2A] pb-2"><span className="text-[#9CA3AF] text-sm">Waist</span><span className="text-white font-semibold text-sm">81.8cm</span></div>
            <div className="flex justify-between items-center border-b border-[#2A2A2A] pb-2"><span className="text-[#9CA3AF] text-sm">Hips</span><span className="text-white font-semibold text-sm">96.1cm</span></div>
            <div className="flex justify-between items-center"><span className="text-[#9CA3AF] text-sm">L. Arm</span><span className="text-white font-semibold text-sm">36.4cm</span></div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }}>
          <div className="text-white text-[16px] font-[700] mb-3">Quick Actions</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-3 flex items-center gap-3">
              <div className="bg-[rgba(16,185,129,0.15)] p-2 rounded-lg"><Cpu className="w-4 h-4 text-[#10B981]" /></div>
              <span className="text-white text-xs font-semibold">AI Coach</span>
            </div>
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-3 flex items-center gap-3">
              <div className="bg-[rgba(16,185,129,0.15)] p-2 rounded-lg"><TrendingUp className="w-4 h-4 text-[#10B981]" /></div>
              <span className="text-white text-xs font-semibold">Progress</span>
            </div>
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-3 flex items-center gap-3">
              <div className="bg-[rgba(16,185,129,0.15)] p-2 rounded-lg"><Clock className="w-4 h-4 text-[#10B981]" /></div>
              <span className="text-white text-xs font-semibold">History</span>
            </div>
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-3 flex items-center gap-3">
              <div className="bg-[rgba(16,185,129,0.15)] p-2 rounded-lg"><Columns className="w-4 h-4 text-[#10B981]" /></div>
              <span className="text-white text-xs font-semibold">Compare</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}