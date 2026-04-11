import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

export function Scene1() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 1500),
      setTimeout(() => setStep(2), 2500),
      setTimeout(() => setStep(3), 3500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col bg-[#0A0A0A] px-6 pt-12 pb-10 overflow-y-auto no-scrollbar"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      {/* Progress Dots */}
      <div className="flex gap-2 justify-center mb-12">
        {[0, 1, 2, 3].map((i) => (
          <motion.div 
            key={i}
            className={`h-1.5 rounded-full ${i === 0 ? 'bg-[#10B981]' : 'bg-[#2A2A2A]'}`}
            animate={{ width: i === 0 ? 24 : 6 }}
          />
        ))}
      </div>

      <div className="flex-1 flex flex-col items-center">
        {step < 3 ? (
          <motion.div 
            key="intro"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col items-center justify-center text-center"
          >
            <motion.div 
              className="w-24 h-24 rounded-3xl bg-[rgba(16,185,129,0.15)] border border-[rgba(16,185,129,0.3)] flex items-center justify-center mb-8"
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', bounce: 0.5 }}
            >
              <Activity className="w-12 h-12 text-[#10B981]" />
            </motion.div>
            
            <motion.h1 
              className="text-[28px] font-[800] text-white leading-tight mb-4 whitespace-pre-wrap"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            >
              {step === 0 ? "Welcome to\nSik AI" : step === 1 ? "Smart Body\nAnalysis" : "AI-Powered\nCoaching"}
            </motion.h1>
            
            <motion.p 
              className="text-[#9CA3AF] text-[13px] px-4"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            >
              Your premium body scanning & measurement tracking companion powered by AI.
            </motion.p>
          </motion.div>
        ) : (
          <motion.div 
            key="profile"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="w-full flex-1 flex flex-col"
          >
            <h1 className="text-[28px] font-[800] text-white mb-6">Set Up<br/>Your Profile</h1>
            
            <div className="space-y-4 w-full">
              <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-3">
                <div className="text-[#4B5563] text-xs mb-1">Your Name</div>
                <div className="text-white text-sm">Alex Johnson</div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-3">
                  <div className="text-[#4B5563] text-xs mb-1">Age</div>
                  <div className="text-white text-sm">28</div>
                </div>
                <div className="flex-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-3">
                  <div className="text-[#4B5563] text-xs mb-1">Height</div>
                  <div className="text-white text-sm">178cm</div>
                </div>
              </div>

              <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-3">
                  <div className="text-[#4B5563] text-xs mb-1">Weight</div>
                  <div className="text-white text-sm">82kg</div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1 bg-[rgba(16,185,129,0.15)] border border-[#10B981] rounded-xl p-3 text-center text-[#10B981] font-medium text-sm">Male</div>
                <div className="flex-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-3 text-center text-white font-medium text-sm">Female</div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-3 text-center text-white text-sm font-medium">Lose Weight</div>
                <div className="bg-[rgba(16,185,129,0.15)] border border-[#10B981] rounded-xl p-3 text-center text-[#10B981] text-sm font-medium flex items-center justify-center gap-1">
                  Build Muscle
                </div>
                <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-3 text-center text-white text-sm font-medium">Maintain</div>
                <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-3 text-center text-white text-sm font-medium">Get Fit</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <motion.div 
        className="w-full bg-[#10B981] rounded-2xl py-4 flex justify-center items-center font-bold text-[#0A0A0A] mt-8"
        whileHover={{ scale: 0.98 }}
      >
        {step < 2 ? "Continue →" : step === 2 ? "Set Up Profile →" : "Get Started ✓"}
      </motion.div>
    </motion.div>
  );
}