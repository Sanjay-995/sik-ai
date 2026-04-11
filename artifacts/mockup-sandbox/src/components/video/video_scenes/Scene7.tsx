import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronDown } from 'lucide-react';

export function Scene7() {
  return (
    <motion.div 
      className="absolute inset-0 flex flex-col bg-[#0A0A0A] pb-24"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.4 }}
    >
      <div className="px-5 pt-10 pb-4 border-b border-[#2A2A2A] flex items-center justify-between">
        <ArrowLeft className="w-5 h-5 text-white" />
        <div className="text-white text-[16px] font-[700]">Compare Scans</div>
        <div className="w-5" />
      </div>

      <div className="p-5 flex flex-col gap-6">
        {/* Selectors */}
        <motion.div className="flex items-center justify-between relative" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex flex-col gap-1 w-[40%]">
            <span className="text-[#9CA3AF] text-[9px] font-bold tracking-wider">SCAN A (BEFORE)</span>
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-2 flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-white text-[11px] font-semibold">Mar 27</span>
                <span className="text-[#4B5563] text-[9px]">Score: 79</span>
              </div>
              <ChevronDown className="w-3 h-3 text-[#9CA3AF]" />
            </div>
          </div>
          
          <div className="absolute left-1/2 -translate-x-1/2 top-1/2 w-[34px] h-[34px] rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-white text-[10px] font-bold z-10">VS</div>

          <div className="flex flex-col gap-1 w-[40%]">
            <span className="text-[#9CA3AF] text-[9px] font-bold tracking-wider text-right">SCAN B (AFTER)</span>
            <div className="bg-[#1A1A1A] border border-[#10B981]/50 rounded-lg p-2 flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-white text-[11px] font-semibold">Apr 10</span>
                <span className="text-[#10B981] text-[9px]">Score: 87</span>
              </div>
              <ChevronDown className="w-3 h-3 text-[#10B981]" />
            </div>
          </div>
        </motion.div>

        {/* Table */}
        <motion.div 
          className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        >
          <div className="grid grid-cols-4 bg-[#141414] p-3 border-b border-[#2A2A2A]">
            <div className="text-[#9CA3AF] text-[10px] font-bold">Metric</div>
            <div className="text-[#3B82F6] text-[10px] font-bold text-center">Before</div>
            <div className="text-[#10B981] text-[10px] font-bold text-center">After</div>
            <div className="text-[#9CA3AF] text-[10px] font-bold text-right">Change</div>
          </div>
          
          <div className="flex flex-col">
            <div className="grid grid-cols-4 p-3 border-b border-[#2A2A2A] items-center">
              <div className="text-white text-[11px] font-medium">Body Score</div>
              <div className="text-white text-[11px] text-center">79pts</div>
              <div className="text-white text-[11px] text-center font-bold">87pts</div>
              <div className="text-right"><span className="bg-[rgba(16,185,129,0.15)] text-[#10B981] text-[9px] font-bold px-1.5 py-0.5 rounded border border-[rgba(16,185,129,0.3)]">+8pts</span></div>
            </div>
            <div className="grid grid-cols-4 p-3 border-b border-[#2A2A2A] items-center bg-[#141414]/30">
              <div className="text-white text-[11px] font-medium">Weight</div>
              <div className="text-white text-[11px] text-center">83.2kg</div>
              <div className="text-white text-[11px] text-center font-bold">80.2kg</div>
              <div className="text-right text-[#10B981] text-[11px] font-bold">-3.0kg</div>
            </div>
            <div className="grid grid-cols-4 p-3 border-b border-[#2A2A2A] items-center">
              <div className="text-white text-[11px] font-medium">Body Fat</div>
              <div className="text-white text-[11px] text-center">19.0%</div>
              <div className="text-white text-[11px] text-center font-bold">16.5%</div>
              <div className="text-right text-[#10B981] text-[11px] font-bold">-2.5%</div>
            </div>
            <div className="grid grid-cols-4 p-3 border-b border-[#2A2A2A] items-center bg-[#141414]/30">
              <div className="text-white text-[11px] font-medium">Muscle Mass</div>
              <div className="text-white text-[11px] text-center">41.1kg</div>
              <div className="text-white text-[11px] text-center font-bold">43.1kg</div>
              <div className="text-right text-[#10B981] text-[11px] font-bold">+2.0kg</div>
            </div>
            <div className="grid grid-cols-4 p-3 border-b border-[#2A2A2A] items-center">
              <div className="text-white text-[11px] font-medium">Chest</div>
              <div className="text-white text-[11px] text-center">99.1cm</div>
              <div className="text-white text-[11px] text-center font-bold">97.2cm</div>
              <div className="text-right"><span className="bg-[rgba(239,68,68,0.15)] text-[#EF4444] text-[9px] font-bold px-1.5 py-0.5 rounded border border-[rgba(239,68,68,0.3)]">-1.9cm</span></div>
            </div>
            <div className="grid grid-cols-4 p-3 items-center bg-[#141414]/30">
              <div className="text-white text-[11px] font-medium">Waist</div>
              <div className="text-white text-[11px] text-center">84.3cm</div>
              <div className="text-white text-[11px] text-center font-bold">81.8cm</div>
              <div className="text-right text-[#10B981] text-[11px] font-bold">-2.5cm</div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}