import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function Scene3() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 1000), // Start scanning
      setTimeout(() => setPhase(2), 4500), // Scan complete
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const dots = Array.from({ length: 60 }).map((_, i) => ({
    x: 35 + Math.random() * 30,
    y: 15 + Math.random() * 70,
  }));

  const brightDots = Array.from({ length: 140 }).map((_, i) => ({
    x: 30 + Math.random() * 40,
    y: 10 + Math.random() * 80,
  }));

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col bg-[#060c08] overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-6 z-20 flex justify-between items-start mt-8">
        <div>
          <h1 className="text-white text-[20px] font-[800] leading-none mb-1">Body Scan</h1>
          <div className="text-[#10B981] opacity-50 text-[9px] tracking-widest font-bold">LiDAR · DEPTH SENSING · AI</div>
        </div>
        <div className={`px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${phase === 1 ? 'border-[#10B981] bg-[rgba(16,185,129,0.1)]' : 'border-[#10B981]/30 bg-[#141414]'}`}>
          <motion.div 
            className="w-1.5 h-1.5 rounded-full bg-[#10B981]"
            animate={phase === 1 ? { opacity: [1, 0.3, 1] } : { opacity: 1 }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
          <span className="text-[#10B981] text-[10px] font-bold tracking-wide">
            {phase === 0 ? 'READY' : phase === 1 ? 'SCANNING' : 'COMPLETE'}
          </span>
        </div>
      </div>

      {/* Body Area */}
      <div className="flex-1 relative flex items-center justify-center mt-10">
        {/* Silhouette */}
        <svg className="absolute w-[80%] h-[80%] opacity-20" viewBox="0 0 100 200" preserveAspectRatio="xMidYMid meet">
          <path d="M50 10 C42 10 35 17 35 25 C35 32 40 37 45 39 C40 45 30 50 20 60 C15 65 15 90 20 120 C25 110 30 100 35 100 C35 120 30 150 30 180 C35 190 40 190 45 180 C45 150 50 120 50 120 C50 120 55 150 55 180 C60 190 65 190 70 180 C70 150 65 120 65 100 C70 100 75 110 80 120 C85 90 85 65 80 60 C70 50 60 45 55 39 C60 37 65 32 65 25 C65 17 58 10 50 10 Z" fill="none" stroke="white" strokeWidth="0.5" strokeLinejoin="round" />
        </svg>

        {/* Dots */}
        {phase === 0 && dots.map((dot, i) => (
          <div key={i} className="absolute w-1 h-1 bg-[#10B981] rounded-full opacity-20" style={{ left: `${dot.x}%`, top: `${dot.y}%` }} />
        ))}
        {phase >= 1 && [...dots, ...brightDots].map((dot, i) => (
          <motion.div 
            key={`bright-${i}`} 
            className="absolute w-1 h-1 bg-[#10B981] rounded-full shadow-[0_0_5px_#10B981]" 
            style={{ left: `${dot.x}%`, top: `${dot.y}%` }} 
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.8, 0.3, 0.6] }}
            transition={{ duration: 2, delay: (dot.y / 100) * 2 }}
          />
        ))}

        {/* Scan Beam */}
        {phase === 1 && (
          <motion.div 
            className="absolute left-0 right-0 h-[1px] bg-[#10B981] shadow-[0_0_15px_3px_rgba(16,185,129,0.8)] z-10"
            initial={{ top: '10%' }}
            animate={{ top: '90%' }}
            transition={{ duration: 3.5, ease: "linear" }}
          />
        )}

        {/* Brackets */}
        {phase === 1 && (
          <>
            <motion.div className="absolute top-[35%] left-[20%] flex items-center" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.2 }}>
              <div className="text-white font-mono text-[10px] mr-1">97.2</div>
              <div className="w-3 h-8 border-l border-y border-[#10B981]/50" />
            </motion.div>
            <motion.div className="absolute top-[45%] right-[20%] flex items-center" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.5 }}>
              <div className="w-3 h-8 border-r border-y border-[#10B981]/50" />
              <div className="text-white font-mono text-[10px] ml-1">81.8</div>
            </motion.div>
            <motion.div className="absolute top-[55%] left-[20%] flex items-center" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.8 }}>
              <div className="text-white font-mono text-[10px] mr-1">96.1</div>
              <div className="w-3 h-8 border-l border-y border-[#10B981]/50" />
            </motion.div>
          </>
        )}
      </div>

      {/* Bottom Area */}
      <div className="absolute bottom-24 left-0 right-0 px-6 flex flex-col items-center gap-4 z-20">
        {phase === 0 ? (
          <>
            <div className="text-[#9CA3AF] text-[11px] text-center font-medium">Stand 1–2m from device · Keep arms slightly away from body</div>
            <div className="w-full bg-[#10B981] rounded-2xl py-3.5 flex justify-center items-center font-bold text-[#0A0A0A] shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              ▣ Start LiDAR Scan
            </div>
          </>
        ) : phase === 1 ? (
          <>
            <div className="bg-[#141414] border border-[#2A2A2A] rounded-full px-4 py-2 text-white text-[11px] font-medium tracking-wide shadow-lg">
              Hold still · Keep breathing normally
            </div>
            {/* Progress line */}
            <motion.div 
              className="absolute top-[-300px] left-0 h-[2px] bg-[#10B981]"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 3.5, ease: "linear" }}
            />
          </>
        ) : null}
      </div>

      {/* Results Panel */}
      <AnimatePresence>
        {phase === 2 && (
          <motion.div 
            className="absolute bottom-0 left-0 right-0 bg-[#111814] rounded-t-3xl border-t border-[#10B981]/20 z-30 flex flex-col pt-3 pb-8 px-5"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-5" />
            
            <div className="flex gap-4 items-center mb-6">
              <div className="border border-[#10B981]/30 rounded-2xl p-3 flex flex-col items-center justify-center min-w-[80px] bg-[#0A0A0A]">
                <div className="text-[#10B981] text-[48px] font-[900] leading-none">87</div>
                <div className="text-white/40 text-[9px] tracking-widest font-bold mt-1">BODY SCORE</div>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-2">
                <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg p-2 flex flex-col">
                  <span className="text-white font-bold text-sm">80.2<span className="text-xs font-normal">kg</span></span>
                  <span className="text-[#9CA3AF] text-[10px]">Weight</span>
                </div>
                <div className="bg-[rgba(16,185,129,0.1)] border border-[#10B981]/30 rounded-lg p-2 flex flex-col">
                  <span className="text-[#10B981] font-bold text-sm">16.5<span className="text-xs font-normal">%</span></span>
                  <span className="text-[#10B981]/70 text-[10px]">Body Fat</span>
                </div>
                <div className="bg-[rgba(59,130,246,0.1)] border border-[#3B82F6]/30 rounded-lg p-2 flex flex-col">
                  <span className="text-[#3B82F6] font-bold text-sm">43.1<span className="text-xs font-normal">kg</span></span>
                  <span className="text-[#3B82F6]/70 text-[10px]">Muscle</span>
                </div>
                <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg p-2 flex flex-col">
                  <span className="text-white font-bold text-sm">25.3</span>
                  <span className="text-[#9CA3AF] text-[10px]">BMI</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mb-3">
              <div className="text-white font-bold text-sm">All Measurements · 11 zones</div>
              <div className="bg-[#10B981] text-[#0A0A0A] text-[10px] font-bold px-2 py-0.5 rounded-md">NEW</div>
            </div>

            <div className="flex flex-col gap-2 mb-6 h-[100px] overflow-hidden">
              <div className="flex justify-between items-center bg-[#0A0A0A] p-2 rounded-lg border border-[#2A2A2A]"><span className="text-[#9CA3AF] text-xs">Neck</span><span className="text-white text-xs font-bold">38.6cm</span></div>
              <div className="flex justify-between items-center bg-[#0A0A0A] p-2 rounded-lg border border-[#2A2A2A]"><span className="text-[#9CA3AF] text-xs">Shoulders</span><span className="text-white text-xs font-bold">123.4cm</span></div>
              <div className="flex justify-between items-center bg-[#0A0A0A] p-2 rounded-lg border border-[#10B981]/30"><span className="text-[#9CA3AF] text-xs">Chest</span><span className="text-[#10B981] text-xs font-bold">97.2cm</span></div>
            </div>

            <div className="flex gap-3">
              <div className="flex-1 py-3.5 rounded-xl border border-[#2A2A2A] text-white text-sm font-bold text-center flex justify-center items-center">↺ Rescan</div>
              <div className="flex-[2] py-3.5 rounded-xl bg-[#10B981] text-[#0A0A0A] text-sm font-bold text-center flex justify-center items-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">💾 Save Scan</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}