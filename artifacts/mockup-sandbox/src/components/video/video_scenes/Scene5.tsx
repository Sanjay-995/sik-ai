import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

export function Scene5() {
  const historyItems = [
    { date: 'APR', day: '10', type: 'Body Scan (Latest)', isNew: true, w: '80.2kg', bf: '16.5%', w2: 'Waist 81.8cm', bmi: 'BMI 25.3', score: '87', scoreColor: '#10B981', border: 'border-[rgba(16,185,129,0.3)]', delay: 0.1 },
    { date: 'APR', day: '3', type: 'Body Scan', isNew: false, w: '81.1kg', bf: '16.8%', w2: 'Waist 82.5cm', bmi: 'BMI 25.6', score: '85', scoreColor: '#10B981', border: 'border-[#2A2A2A]', delay: 0.2 },
    { date: 'MAR', day: '27', type: 'Body Scan', isNew: false, w: '82.0kg', bf: '17.1%', w2: 'Waist 83.1cm', bmi: 'BMI 25.9', score: '83', scoreColor: '#F59E0B', border: 'border-[#2A2A2A]', delay: 0.3 },
  ];

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col bg-[#0A0A0A] pb-24 overflow-y-auto no-scrollbar"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4 }}
    >
      <div className="px-5 pt-10 pb-2">
        <div className="flex justify-between items-end mb-6">
          <motion.h2 className="text-white text-[22px] font-[800]" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>Scan History</motion.h2>
          <motion.div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-2.5 py-1 text-white text-[11px] font-semibold" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>9 scans</motion.div>
        </div>

        {/* Summary Card */}
        <motion.div 
          className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4 flex divide-x divide-[#2A2A2A] mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex-1 flex flex-col items-center justify-center">
            <span className="text-[#10B981] font-bold text-[15px]">-3.0kg</span>
            <span className="text-[#9CA3AF] text-[10px] mt-0.5">Weight Change</span>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center">
            <span className="text-[#F59E0B] font-bold text-[15px]">-2.5%</span>
            <span className="text-[#9CA3AF] text-[10px] mt-0.5">Body Fat</span>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center">
            <span className="text-[#3B82F6] font-bold text-[15px]">+2.0kg</span>
            <span className="text-[#9CA3AF] text-[10px] mt-0.5">Muscle Gained</span>
          </div>
        </motion.div>

        {/* List */}
        <div className="flex flex-col gap-3">
          {historyItems.map((item, i) => (
            <motion.div 
              key={i}
              className={`bg-[#1A1A1A] border ${item.border} rounded-2xl p-3.5 flex items-center gap-3`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: item.delay, duration: 0.4 }}
            >
              <div className="bg-[#141414] rounded-xl w-14 h-14 flex flex-col items-center justify-center border border-[#2A2A2A] shrink-0">
                <span className="text-[#9CA3AF] text-[9px] font-bold">{item.date}</span>
                <span className="text-white text-[20px] font-bold leading-none">{item.day}</span>
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-bold text-[14px]">{item.type}</span>
                  {item.isNew && <span className="bg-[#10B981] text-[#0A0A0A] text-[8px] font-bold px-1.5 py-0.5 rounded">NEW</span>}
                </div>
                <div className="text-[#9CA3AF] text-[11px] mb-0.5">{item.w} · {item.bf} body fat</div>
                {item.w2 && <div className="text-[#4B5563] text-[10px]">{item.w2} · {item.bmi}</div>}
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center`} style={{ borderColor: item.scoreColor }}>
                  <span className="text-white font-bold text-[12px]">{item.score}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#4B5563]" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}