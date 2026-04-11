import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Check, ArrowLeft, ChevronRight, Bell } from 'lucide-react';

export function Scene8() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 2500), // swap to settings
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col bg-[#0A0A0A]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <AnimatePresence mode="popLayout">
        {phase === 0 ? (
          <motion.div 
            key="paywall"
            className="flex-1 flex flex-col p-5 overflow-y-auto no-scrollbar relative"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex justify-end pt-5">
              <X className="w-6 h-6 text-[#9CA3AF]" />
            </div>
            
            <div className="flex flex-col items-center mt-4 mb-6">
              <div className="w-20 h-20 bg-[rgba(16,185,129,0.15)] border border-[rgba(16,185,129,0.3)] rounded-3xl flex items-center justify-center mb-5">
                <Zap className="w-10 h-10 text-[#10B981] fill-[#10B981]" />
              </div>
              <h1 className="text-white text-[32px] font-[900] text-center leading-tight mb-2">Unlock<br/>Sik AI Pro</h1>
              <p className="text-[#9CA3AF] text-[13px] text-center">Transform your body with advanced tracking</p>
            </div>

            <div className="flex flex-col gap-2 mb-6">
              {['Unlimited Scans', 'AI Coach', 'Advanced Analytics', 'Scan Compare', 'Progress Charts', 'Export Reports'].map((feat, i) => (
                <div key={i} className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-3 flex items-center gap-3">
                  <div className="bg-[rgba(16,185,129,0.15)] p-1 rounded">
                    <Check className="w-3 h-3 text-[#10B981]" />
                  </div>
                  <span className="text-white text-[13px] font-medium">{feat}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 mb-6">
              <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-4 flex justify-between items-center">
                <div>
                  <div className="text-white text-[14px] font-bold">Pro Monthly</div>
                  <div className="text-[#9CA3AF] text-[12px]">$14.99/month</div>
                </div>
                <div className="w-5 h-5 rounded-full border-2 border-[#4B5563]" />
              </div>
              <div className="bg-[rgba(16,185,129,0.05)] border-2 border-[#10B981] rounded-2xl p-4 flex justify-between items-center relative">
                <div className="absolute -top-2.5 right-4 bg-[#10B981] text-[#0A0A0A] text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">Best Value</div>
                <div>
                  <div className="text-white text-[14px] font-bold">Pro Annual</div>
                  <div className="text-[#10B981] text-[12px] font-medium">$8.33/mo <span className="text-[#9CA3AF] line-through ml-1">$14.99</span></div>
                  <div className="text-[#9CA3AF] text-[10px] mt-0.5">Billed as $99.99/year</div>
                </div>
                <div className="w-5 h-5 rounded-full border-2 border-[#10B981] flex items-center justify-center bg-[#10B981]">
                  <Check className="w-3 h-3 text-[#0A0A0A]" />
                </div>
              </div>
            </div>

            <div className="w-full bg-[#10B981] rounded-2xl py-4 flex justify-center items-center gap-2 font-bold text-[#0A0A0A] mt-auto">
              <Zap className="w-4 h-4 fill-[#0A0A0A]" /> Start Annual Pro
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="settings"
            className="flex-1 flex flex-col bg-[#0A0A0A]"
            initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="px-5 pt-12 pb-4 border-b border-[#2A2A2A] flex items-center gap-3">
              <ArrowLeft className="w-5 h-5 text-white" />
              <div className="text-white text-[18px] font-[700]">Settings</div>
            </div>
            
            <div className="p-5 flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#10B981] flex items-center justify-center text-[24px] font-bold text-[#0A0A0A]">A</div>
                <div className="flex flex-col">
                  <div className="text-white text-[18px] font-bold">Alex Johnson</div>
                  <div className="text-[#9CA3AF] text-[12px]">28y · 178cm · 82kg</div>
                  <div className="bg-[#1A1A1A] border border-[#2A2A2A] text-white text-[10px] font-medium px-2 py-0.5 rounded mt-1 w-fit">Free Plan</div>
                </div>
              </div>

              <div className="bg-[rgba(16,185,129,0.15)] border border-[#10B981]/50 rounded-xl p-4 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-white font-bold text-[14px]">Upgrade to Pro</span>
                  <span className="text-[#10B981] text-[11px]">Unlock all features</span>
                </div>
                <ChevronRight className="w-5 h-5 text-[#10B981]" />
              </div>

              <div>
                <div className="text-[#9CA3AF] text-[11px] font-bold tracking-wider mb-2 ml-2">PROFILE</div>
                <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl flex flex-col">
                  <div className="p-4 flex justify-between items-center border-b border-[#2A2A2A]">
                    <span className="text-white text-[14px]">Goal</span>
                    <div className="flex items-center gap-2"><span className="text-[#9CA3AF] text-[12px]">Build Muscle</span><ChevronRight className="w-4 h-4 text-[#4B5563]" /></div>
                  </div>
                  <div className="p-4 flex justify-between items-center border-b border-[#2A2A2A]">
                    <span className="text-white text-[14px]">Gender</span>
                    <div className="flex items-center gap-2"><span className="text-[#9CA3AF] text-[12px]">Male</span><ChevronRight className="w-4 h-4 text-[#4B5563]" /></div>
                  </div>
                  <div className="p-4 flex justify-between items-center">
                    <span className="text-white text-[14px]">Units</span>
                    <div className="flex items-center gap-2"><span className="text-[#9CA3AF] text-[12px]">Metric (kg/cm)</span><ChevronRight className="w-4 h-4 text-[#4B5563]" /></div>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-[#9CA3AF] text-[11px] font-bold tracking-wider mb-2 ml-2">NOTIFICATIONS</div>
                <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl flex flex-col">
                  <div className="p-4 flex justify-between items-center border-b border-[#2A2A2A]">
                    <span className="text-white text-[14px]">Push Notifications</span>
                    <div className="w-10 h-6 bg-[#10B981] rounded-full p-1 flex justify-end"><div className="w-4 h-4 bg-white rounded-full shadow-sm" /></div>
                  </div>
                  <div className="p-4 flex justify-between items-center">
                    <span className="text-white text-[14px]">Weekly Scan Reminder</span>
                    <div className="w-10 h-6 bg-[#10B981] rounded-full p-1 flex justify-end"><div className="w-4 h-4 bg-white rounded-full shadow-sm" /></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}