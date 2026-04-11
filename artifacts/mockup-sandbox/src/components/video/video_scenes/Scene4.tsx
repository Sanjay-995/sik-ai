import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Trash2, Send } from 'lucide-react';

export function Scene4() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 1000), // tap question
      setTimeout(() => setPhase(2), 1500), // user bubble appears
      setTimeout(() => setPhase(3), 2000), // typing starts
      setTimeout(() => setPhase(4), 3000), // bot response
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col bg-[#0A0A0A] pb-24"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="px-5 pt-10 pb-4 border-b border-[#2A2A2A] flex justify-between items-center bg-[#0A0A0A]/90 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[rgba(16,185,129,0.15)] flex items-center justify-center border border-[rgba(16,185,129,0.3)]">
            <Cpu className="w-5 h-5 text-[#10B981]" />
          </div>
          <div>
            <div className="text-white text-[15px] font-[700]">Sik AI Coach</div>
            <div className="text-[#10B981] text-[12px] font-medium flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-[#10B981] rounded-full" /> Online · Ready
            </div>
          </div>
        </div>
        <Trash2 className="w-5 h-5 text-[#9CA3AF]" />
      </div>

      {/* Chat Area */}
      <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto no-scrollbar">
        {/* Welcome message */}
        <motion.div 
          className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-[18px] rounded-tl-sm p-4 w-[85%] self-start relative"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="absolute -left-2 top-0 w-6 h-6 rounded-full bg-[#10B981] flex items-center justify-center border-2 border-[#0A0A0A]">
            <Cpu className="w-3 h-3 text-[#0A0A0A]" />
          </div>
          <p className="text-white text-[13px] leading-relaxed ml-2">
            Hi! I'm your Sik AI fitness coach. I can help you analyze your body scans, create personalized workout plans, and guide your nutrition. What would you like to know?
          </p>
        </motion.div>

        {/* Chips */}
        {phase === 0 && (
          <motion.div 
            className="flex gap-2 overflow-x-visible py-1 w-[150%]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, height: 0, margin: 0 }}
          >
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-full px-4 py-2 text-white text-[13px] font-medium whitespace-nowrap">How is my progress?</div>
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-full px-4 py-2 text-white text-[13px] font-medium whitespace-nowrap">Suggest a workout</div>
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-full px-4 py-2 text-white text-[13px] font-medium whitespace-nowrap">Nutrition tips</div>
          </motion.div>
        )}

        {/* User Question */}
        {phase >= 2 && (
          <motion.div 
            className="bg-[#10B981] rounded-[18px] rounded-tr-sm p-3.5 w-[75%] self-end"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', damping: 25 }}
          >
            <p className="text-[#0A0A0A] text-[13px] font-semibold leading-relaxed">
              How is my progress?
            </p>
          </motion.div>
        )}

        {/* Typing indicator */}
        {phase === 3 && (
          <motion.div 
            className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-full p-4 w-16 self-start flex gap-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div className="w-1.5 h-1.5 bg-[#10B981] rounded-full" animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
            <motion.div className="w-1.5 h-1.5 bg-[#10B981] rounded-full" animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
            <motion.div className="w-1.5 h-1.5 bg-[#10B981] rounded-full" animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} />
          </motion.div>
        )}

        {/* Bot Response */}
        {phase >= 4 && (
          <motion.div 
            className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-[18px] rounded-tl-sm p-4 w-[85%] self-start relative"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', damping: 25 }}
          >
            <div className="absolute -left-2 top-0 w-6 h-6 rounded-full bg-[#10B981] flex items-center justify-center border-2 border-[#0A0A0A]">
              <Cpu className="w-3 h-3 text-[#0A0A0A]" />
            </div>
            <p className="text-white text-[13px] leading-relaxed ml-2">
              Based on your recent scans, you're making excellent progress! Your body fat has decreased by <span className="text-[#10B981] font-bold">2.5%</span> over the past 8 weeks while muscle mass increased by <span className="text-[#10B981] font-bold">2kg</span>. Keep up the consistent training!
            </p>
          </motion.div>
        )}
      </div>

      {/* Input bar */}
      <div className="p-4 bg-[#0A0A0A] border-t border-[#2A2A2A]">
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-full px-4 py-3 flex items-center justify-between">
          <span className="text-[#4B5563] text-[13px]">Ask your AI coach...</span>
          <Send className="w-4 h-4 text-[#10B981]" />
        </div>
      </div>
    </motion.div>
  );
}