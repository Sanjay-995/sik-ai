import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVideoPlayer } from '@/lib/video';
import { Camera, Cpu, Clock, TrendingUp, Home, Maximize, Zap, CheckCircle2 } from 'lucide-react';

const SCENE_DURATIONS = {
  brand: 5000,
  scan: 7000,
  dashboard: 5000,
  coach: 5000,
  progress: 5000,
  outro: 5000
};

// Font import in component
const fontLink = document.createElement('link');
fontLink.href = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800;900&display=swap';
fontLink.rel = 'stylesheet';
document.head.appendChild(fontLink);

export default function SikAICombined() {
  const { currentScene } = useVideoPlayer({ durations: SCENE_DURATIONS });

  // Phone positioning across acts
  // 0: center, 1: right (x: 60%), 2: left (x: 40%), 3: right, 4: left, 5: center (smaller)
  const phonePos = [
    { x: '50vw', scale: 1 },
    { x: '65vw', scale: 1 },
    { x: '35vw', scale: 1 },
    { x: '65vw', scale: 1 },
    { x: '35vw', scale: 1 },
    { x: '50vw', scale: 0.85 }
  ];

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0A0A0A]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Background Orbs */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {currentScene === 0 && (
          <>
            <motion.div className="absolute w-[800px] h-[800px] rounded-full blur-[150px] opacity-[0.08]"
              style={{ background: 'radial-gradient(circle, #10B981, transparent)' }}
              animate={{ x: ['-20%', '20%', '-20%'], y: ['-20%', '20%', '-20%'] }}
              transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div className="absolute w-[600px] h-[600px] rounded-full blur-[150px] opacity-[0.08] right-0 bottom-0"
              style={{ background: 'radial-gradient(circle, #10B981, transparent)' }}
              animate={{ x: ['20%', '-20%', '20%'], y: ['20%', '-20%', '20%'] }}
              transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            />
          </>
        )}
        {currentScene === 5 && (
          <>
            <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] rounded-full blur-[120px] opacity-20"
              style={{ background: 'radial-gradient(circle, #10B981, transparent)' }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
          </>
        )}
      </div>

      {/* Main Composition */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        
        {/* Full Screen Foreground Texts */}
        <AnimatePresence mode="popLayout">
          {/* Act 1 Left Text */}
          {currentScene === 0 && (
            <motion.div key="act1-text" className="absolute top-[20%] w-full flex flex-col items-center justify-center opacity-0"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 0, y: 0 }} exit={{ opacity: 0 }}
            />
          )}

          {/* Act 2 Text (Left) */}
          {currentScene === 1 && (
            <motion.div key="act2-text" className="absolute left-[15vw] top-[50%] -translate-y-1/2 w-[30vw] flex flex-col gap-6"
              initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ staggerChildren: 0.2 }}>
              <motion.div className="text-[#10B981] text-[10px] font-[700] tracking-[2px] uppercase" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>LiDAR TECHNOLOGY</motion.div>
              <motion.h2 className="text-white text-[42px] font-[800] leading-[1.1]" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>Scan your body<br/>in seconds</motion.h2>
              <motion.div className="flex flex-col gap-3 mt-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                {["500+ depth data points", "11 body zones tracked", "Real-time AI analysis"].map((txt, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                    <span className="text-white text-lg">{txt}</span>
                  </div>
                ))}
              </motion.div>
              <motion.div className="mt-8 flex items-end gap-4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.2 }}>
                <div className="text-[#10B981] text-[64px] font-[900] leading-none tracking-tighter">87</div>
                <div className="text-[#9CA3AF] text-lg font-medium pb-2">Your Body Score</div>
              </motion.div>
            </motion.div>
          )}

          {/* Act 3 Text (Right) */}
          {currentScene === 2 && (
            <motion.div key="act3-text" className="absolute right-[10vw] top-[50%] -translate-y-1/2 w-[35vw] flex flex-col gap-6"
              initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}>
              <motion.div className="text-[#10B981] text-[10px] font-[700] tracking-[2px] uppercase" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>DASHBOARD</motion.div>
              <motion.h2 className="text-white text-[42px] font-[800] leading-[1.1]" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>Everything in<br/>one view</motion.h2>
              <div className="flex flex-col gap-8 mt-4">
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }}>
                  <div className="text-[#10B981] text-[48px] font-[900] leading-none tracking-tighter">16.5%</div>
                  <div className="text-[#9CA3AF] text-lg font-medium mt-1">Body Fat</div>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.0 }}>
                  <div className="text-[#3B82F6] text-[48px] font-[900] leading-none tracking-tighter">43.1kg</div>
                  <div className="text-[#9CA3AF] text-lg font-medium mt-1">Muscle Mass</div>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.2 }}>
                  <div className="text-[#8B5CF6] text-[48px] font-[900] leading-none tracking-tighter">Score 87</div>
                  <div className="text-[#9CA3AF] text-lg font-medium mt-1">Overall Health</div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Act 4 Text (Left) */}
          {currentScene === 3 && (
            <motion.div key="act4-text" className="absolute left-[15vw] top-[50%] -translate-y-1/2 w-[35vw] flex flex-col gap-6"
              initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
              <motion.div className="text-[#10B981] text-[10px] font-[700] tracking-[2px] uppercase" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>AI COACHING</motion.div>
              <motion.h2 className="text-white text-[42px] font-[800] leading-[1.1]" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>Your personal<br/>AI trainer</motion.h2>
              <div className="grid grid-cols-2 gap-4 mt-4">
                {[
                  { icon: '🧠', label: 'Personalized Plans' },
                  { icon: '📊', label: 'Progress Analysis' },
                  { icon: '🥗', label: 'Nutrition Guidance' },
                  { icon: '💪', label: 'Workout Programming' }
                ].map((f, i) => (
                  <motion.div key={i} className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4 flex items-center gap-3"
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + (i * 0.1) }}>
                    <div className="text-2xl">{f.icon}</div>
                    <div className="text-white text-sm font-semibold">{f.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Act 5 Text (Right) */}
          {currentScene === 4 && (
            <motion.div key="act5-text" className="absolute right-[10vw] top-[50%] -translate-y-1/2 w-[35vw] flex flex-col gap-6"
              initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}>
              <motion.div className="text-[#10B981] text-[10px] font-[700] tracking-[2px] uppercase" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>8-WEEK RESULTS</motion.div>
              <motion.h2 className="text-white text-[42px] font-[800] leading-[1.1]" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>See your progress<br/>in detail</motion.h2>
              <div className="grid grid-cols-2 gap-6 mt-4">
                {[
                  { val: '-3.0 kg', label: 'Weight Lost', color: '#10B981' },
                  { val: '-2.5%', label: 'Fat Lost', color: '#F97316' },
                  { val: '+2.0 kg', label: 'Muscle', color: '#3B82F6' },
                  { val: '+8 pts', label: 'Score', color: '#8B5CF6' }
                ].map((s, i) => (
                  <motion.div key={i} className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6 relative overflow-hidden"
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 + (i * 0.1) }}>
                    <div className="absolute top-0 right-0 w-16 h-16 rounded-bl-full opacity-10" style={{ backgroundColor: s.color }} />
                    <div className="text-[32px] font-[900] tracking-tight" style={{ color: s.color }}>{s.val}</div>
                    <div className="text-[#9CA3AF] text-sm font-medium mt-1">{s.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Act 6 Text (Outro) */}
          {currentScene === 5 && (
            <motion.div key="act6-text" className="absolute inset-0 flex flex-col items-center justify-between py-[15vh] pointer-events-none"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
              <div className="flex flex-col items-center">
                <motion.div className="text-white text-[72px] font-[900] tracking-[-3px] leading-none mb-2"
                  initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5, type: 'spring' }}>
                  SIK AI
                </motion.div>
                <motion.div className="w-[120px] h-[4px] bg-[#10B981] rounded-full"
                  initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 1, duration: 0.6 }} />
              </div>
              <div className="flex flex-col items-center gap-6">
                <motion.div className="text-white text-[22px] font-medium"
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}>
                  Your body. Measured. Mastered.
                </motion.div>
                <motion.div className="flex gap-4"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
                  {["iOS 17+", "LiDAR", "AI Powered"].map((b, i) => (
                    <div key={i} className="bg-[#1A1A1A] border border-[#10B981]/50 px-4 py-1.5 rounded-full text-white text-sm font-bold shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                      {b}
                    </div>
                  ))}
                </motion.div>
                <motion.div className="mt-4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.8 }}>
                  <img src="https://developer.apple.com/app-store/marketing/guidelines/images/badge-download-on-the-app-store.svg" alt="Download on App Store" className="h-12" />
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* The Phone */}
        <motion.div 
          className="absolute top-1/2 -translate-y-1/2 w-[240px] h-[520px] border-[5px] border-[#2A2A2A] rounded-[40px] bg-[#0A0A0A] overflow-hidden shadow-[0_0_80px_rgba(16,185,129,0.15)] flex flex-col z-50"
          initial={{ left: '50vw', x: '-50%', scale: 0 }}
          animate={{ 
            left: phonePos[currentScene]?.x || '50vw', 
            x: '-50%', 
            scale: phonePos[currentScene]?.scale || 1
          }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        >
          {/* Phone Screen Area */}
          <div className="flex-1 relative overflow-hidden bg-[#0A0A0A]">
            <AnimatePresence mode="wait">
              {currentScene === 0 && <SceneBrand key="scene-brand" />}
              {currentScene === 1 && <SceneScan key="scene-scan" />}
              {currentScene === 2 && <SceneDashboard key="scene-dash" />}
              {currentScene === 3 && <SceneCoach key="scene-coach" />}
              {currentScene === 4 && <SceneProgress key="scene-prog" />}
              {currentScene === 5 && <ScenePaywall key="scene-pay" />}
            </AnimatePresence>
          </div>

          {/* Tab Bar (Acts 3-5) */}
          <AnimatePresence>
            {(currentScene >= 2 && currentScene <= 4) && (
              <motion.div 
                className="h-[50px] bg-[#1A1A1A] border-t border-[#2A2A2A] flex justify-around items-center px-2"
                initial={{ y: 50 }} animate={{ y: 0 }} exit={{ y: 50 }}
              >
                {[Home, Maximize, Cpu, Clock, TrendingUp].map((Icon, idx) => {
                  const isActive = (currentScene === 2 && idx === 0) || 
                                   (currentScene === 3 && idx === 2) || 
                                   (currentScene === 4 && idx === 4);
                  return (
                    <div key={idx} className="flex flex-col items-center justify-center w-10 h-10">
                      <Icon className={`w-5 h-5 ${isActive ? 'text-[#10B981]' : 'text-[#4B5563]'}`} />
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
      </div>
    </div>
  );
}

// --- Phone Scenes ---

function SceneBrand() {
  return (
    <motion.div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0A0A0A]"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="w-16 h-16 bg-[rgba(16,185,129,0.15)] rounded-2xl border border-[#10B981] flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(16,185,129,0.3)]"
        initial={{ scale: 0.5, rotate: -45, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={{ type: 'spring', delay: 0.3 }}>
        <div className="w-8 h-8 border-2 border-white rounded-lg flex items-center justify-center">
          <div className="w-3 h-3 bg-[#10B981] rounded-sm" />
        </div>
      </motion.div>
      <motion.div className="text-white text-3xl font-[900] tracking-[-1px]"
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        Sik AI
      </motion.div>
    </motion.div>
  );
}

function SceneScan() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 2000);
    const t2 = setTimeout(() => setPhase(2), 5000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const dots = Array.from({ length: 40 }).map((_, i) => ({ x: 35 + Math.random() * 30, y: 15 + Math.random() * 70 }));
  const brightDots = Array.from({ length: 140 }).map((_, i) => ({ x: 30 + Math.random() * 40, y: 10 + Math.random() * 80 }));

  return (
    <motion.div className="absolute inset-0 bg-[#060c08] flex flex-col"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="p-4 z-20">
        <h1 className="text-white text-lg font-[800] leading-none mb-1">Body Scan</h1>
        <div className="text-[#10B981] opacity-70 text-[8px] tracking-widest font-bold">LiDAR · DEPTH SENSING · AI</div>
      </div>
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        <svg className="absolute w-[80%] h-[80%] opacity-20" viewBox="0 0 100 200" preserveAspectRatio="xMidYMid meet">
          <path d="M50 10 C42 10 35 17 35 25 C35 32 40 37 45 39 C40 45 30 50 20 60 C15 65 15 90 20 120 C25 110 30 100 35 100 C35 120 30 150 30 180 C35 190 40 190 45 180 C45 150 50 120 50 120 C50 120 55 150 55 180 C60 190 65 190 70 180 C70 150 65 120 65 100 C70 100 75 110 80 120 C85 90 85 65 80 60 C70 50 60 45 55 39 C60 37 65 32 65 25 C65 17 58 10 50 10 Z" fill="none" stroke="white" strokeWidth="0.5" strokeLinejoin="round" />
        </svg>
        {phase === 0 && dots.map((d, i) => <div key={i} className="absolute w-1 h-1 bg-[#10B981] rounded-full opacity-30" style={{ left: `${d.x}%`, top: `${d.y}%` }} />)}
        {phase >= 1 && [...dots, ...brightDots].map((d, i) => (
          <motion.div key={`b-${i}`} className="absolute w-[3px] h-[3px] bg-[#10B981] rounded-full shadow-[0_0_4px_#10B981]" style={{ left: `${d.x}%`, top: `${d.y}%` }}
            initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0.4, 0.8] }} transition={{ duration: 1.5, delay: (d.y / 100) * 1.5 }} />
        ))}
        {phase === 1 && (
          <motion.div className="absolute left-0 right-0 h-[2px] bg-[#10B981] shadow-[0_0_12px_2px_rgba(16,185,129,0.8)] z-10"
            initial={{ top: '10%' }} animate={{ top: '90%' }} transition={{ duration: 2.5, ease: "linear" }} />
        )}
      </div>
      <AnimatePresence>
        {phase === 2 && (
          <motion.div className="absolute bottom-0 left-0 right-0 bg-[#111814] rounded-t-2xl border-t border-[#10B981]/20 p-3 z-30"
            initial={{ y: '100%' }} animate={{ y: 0 }} transition={{ type: 'spring', damping: 20 }}>
            <div className="flex gap-2 items-center mb-3">
              <div className="border border-[#10B981]/30 rounded-xl p-2 flex flex-col items-center justify-center min-w-[60px] bg-[#0A0A0A]">
                <div className="text-[#10B981] text-3xl font-[900] leading-none">87</div>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-1 text-[9px]">
                <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded p-1.5 text-white font-bold">80.2kg</div>
                <div className="bg-[rgba(16,185,129,0.1)] border border-[#10B981]/30 rounded p-1.5 text-[#10B981] font-bold">16.5% BF</div>
                <div className="bg-[rgba(59,130,246,0.1)] border border-[#3B82F6]/30 rounded p-1.5 text-[#3B82F6] font-bold">43.1kg</div>
                <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded p-1.5 text-white font-bold">BMI 25.3</div>
              </div>
            </div>
            <div className="flex flex-col gap-1 text-[9px]">
              {[['Neck', '38.6'], ['Shoulders', '123.4'], ['Chest', '97.2'], ['Waist', '81.8'], ['Hips', '96.1']].map(([l, v], i) => (
                <div key={i} className="flex justify-between bg-[#0A0A0A] p-1.5 rounded border border-[#2A2A2A]">
                  <span className="text-[#9CA3AF]">{l}</span><span className="text-white font-bold">{v}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SceneDashboard() {
  return (
    <motion.div className="absolute inset-0 bg-[#0A0A0A] p-4 overflow-y-auto no-scrollbar flex flex-col gap-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div>
        <div className="text-[#9CA3AF] text-[10px] font-medium tracking-wide">Good morning,</div>
        <div className="text-white text-lg font-[800]">Alex 👋</div>
      </div>
      <motion.div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-3 flex items-center"
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }}>
        <div className="w-1/2 flex justify-center">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#141414" strokeWidth="4" />
              <motion.path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#10B981" strokeWidth="4" strokeDasharray="100, 100" 
                initial={{ strokeDasharray: "0, 100" }} animate={{ strokeDasharray: "87, 100" }} transition={{ duration: 1.5, ease: "easeOut" }} />
            </svg>
            <div className="text-white text-xl font-[900]">87</div>
          </div>
        </div>
        <div className="w-1/2">
          <svg className="w-full h-20 opacity-30" viewBox="0 0 100 200" preserveAspectRatio="xMidYMid meet">
            <path d="M50 10 C42 10 35 17 35 25 C35 32 40 37 45 39 C40 45 30 50 20 60 C15 65 15 90 20 120 C25 110 30 100 35 100 C35 120 30 150 30 180 C35 190 40 190 45 180 C45 150 50 120 50 120 C50 120 55 150 55 180 C60 190 65 190 70 180 C70 150 65 120 65 100 C70 100 75 110 80 120 C85 90 85 65 80 60 C70 50 60 45 55 39 C60 37 65 32 65 25 C65 17 58 10 50 10 Z" fill="white" />
          </svg>
        </div>
      </motion.div>
      <div className="grid grid-cols-2 gap-2">
        {[
          { l: 'Weight', v: '80.2kg' }, { l: 'Body Fat', v: '16.5%', c: '#10B981' },
          { l: 'BMI', v: '25.3' }, { l: 'Muscle', v: '43.1kg', c: '#3B82F6' }
        ].map((m, i) => (
          <motion.div key={i} className="bg-[#1A1A1A] rounded-xl p-2 border border-[#2A2A2A]"
            initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 + (i * 0.1) }}>
            <div className="text-[#9CA3AF] text-[9px] mb-1">{m.l}</div>
            <div className="font-bold text-sm" style={{ color: m.c || 'white' }}>{m.v}</div>
          </motion.div>
        ))}
      </div>
      <motion.div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-3 flex flex-col gap-2"
        initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }}>
        {[['Chest', '97.2cm'], ['Waist', '81.8cm'], ['Hips', '96.1cm'], ['L. Arm', '36.4cm']].map(([l, v], i) => (
          <div key={i} className="flex justify-between items-center border-b border-[#2A2A2A] pb-1 last:border-0 last:pb-0">
            <span className="text-[#9CA3AF] text-[10px]">{l}</span><span className="text-white font-semibold text-[10px]">{v}</span>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}

function SceneCoach() {
  return (
    <motion.div className="absolute inset-0 bg-[#0A0A0A] flex flex-col"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="p-3 border-b border-[#2A2A2A] flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[rgba(16,185,129,0.15)] flex items-center justify-center border border-[#10B981]">
          <Cpu className="w-4 h-4 text-[#10B981]" />
        </div>
        <div>
          <div className="text-white text-sm font-bold">Sik AI Coach</div>
          <div className="text-[#10B981] text-[9px] font-medium">Online · Ready</div>
        </div>
      </div>
      <div className="flex-1 p-3 flex flex-col gap-4 text-xs font-medium">
        <motion.div className="bg-[#1A1A1A] p-3 rounded-2xl rounded-tl-sm text-white self-start max-w-[85%]"
          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
          Hi Alex! Your latest scan looks great. You dropped 0.2% body fat since last week. How can I help you today?
        </motion.div>
        <motion.div className="flex gap-2 overflow-x-hidden pt-1 pb-1"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}>
          <div className="bg-[#2A2A2A] text-white px-3 py-1.5 rounded-full text-[10px] whitespace-nowrap">Plan a workout</div>
          <div className="bg-[#2A2A2A] text-white px-3 py-1.5 rounded-full text-[10px] whitespace-nowrap">Analyze diet</div>
        </motion.div>
        <motion.div className="bg-[#10B981] p-3 rounded-2xl rounded-tr-sm text-[#0A0A0A] self-end max-w-[85%]"
          initial={{ opacity: 0, x: 10, scale: 0.9 }} animate={{ opacity: 1, x: 0, scale: 1 }} transition={{ delay: 1.8, type: 'spring' }}>
          How is my progress?
        </motion.div>
        <motion.div className="bg-[#1A1A1A] p-3 rounded-2xl rounded-tl-sm text-white self-start w-12 flex items-center justify-center gap-1"
          initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }} transition={{ delay: 2.2, duration: 1.5 }}>
          <div className="w-1.5 h-1.5 bg-[#9CA3AF] rounded-full" />
          <div className="w-1.5 h-1.5 bg-[#9CA3AF] rounded-full" />
          <div className="w-1.5 h-1.5 bg-[#9CA3AF] rounded-full" />
        </motion.div>
        <motion.div className="bg-[#1A1A1A] p-3 rounded-2xl rounded-tl-sm text-white self-start max-w-[85%]"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 3.5 }}>
          You're on track! Your <span className="text-[#10B981]">muscle mass increased by 2.0kg</span> over 8 weeks, and your <span className="text-[#10B981]">overall score is up 8 points</span>. Keep hitting your protein goals!
        </motion.div>
      </div>
    </motion.div>
  );
}

function SceneProgress() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setPhase(1), 2500);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div className="absolute inset-0 bg-[#0A0A0A] p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="mb-4">
        <h2 className="text-white text-lg font-bold">Progress</h2>
        <div className="text-[#9CA3AF] text-[10px]">9 scans · 8 weeks</div>
      </div>
      
      {phase === 0 ? (
        <motion.div className="flex flex-col gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="flex gap-2">
            <div className="bg-[#1A1A1A] border border-[#10B981] text-white px-3 py-1 rounded-full text-[10px] font-bold">Weight</div>
            <div className="bg-[#1A1A1A] text-[#9CA3AF] px-3 py-1 rounded-full text-[10px] font-bold">Body Fat</div>
          </div>
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl h-40 p-4 relative flex items-end">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <motion.path d="M0,80 L20,75 L40,65 L60,50 L80,35 L100,20" fill="none" stroke="#3B82F6" strokeWidth="3"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: "easeInOut" }} />
              <path d="M0,80 L20,75 L40,65 L60,50 L80,35 L100,20 L100,100 L0,100 Z" fill="rgba(59,130,246,0.1)" stroke="none" />
            </svg>
          </div>
        </motion.div>
      ) : (
        <motion.div className="flex flex-col gap-4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex justify-between items-center">
            <h3 className="text-white text-sm font-bold">Compare</h3>
            <div className="text-[#10B981] text-[10px] font-bold">8 Weeks Ago vs Today</div>
          </div>
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-3 flex flex-col gap-3">
            {[
              { l: 'Body Score', v1: '79', v2: '87', d: '+8 pts', c: '#10B981' },
              { l: 'Weight', v1: '83.2kg', v2: '80.2kg', d: '-3.0 kg', c: '#10B981' },
              { l: 'Body Fat', v1: '19.0%', v2: '16.5%', d: '-2.5%', c: '#10B981' }
            ].map((r, i) => (
              <div key={i} className="grid grid-cols-4 gap-2 items-center text-[10px] pb-2 border-b border-[#2A2A2A] last:border-0 last:pb-0">
                <div className="text-[#9CA3AF] font-medium">{r.l}</div>
                <div className="text-white text-center">{r.v1}</div>
                <div className="text-white text-center font-bold">{r.v2}</div>
                <div className="text-right font-bold" style={{ color: r.c }}>{r.d}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

function ScenePaywall() {
  return (
    <motion.div className="absolute inset-0 bg-[#0A0A0A] p-4 flex flex-col items-center justify-center text-center"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="w-16 h-16 bg-[rgba(16,185,129,0.15)] rounded-2xl border border-[#10B981] flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.3)]"
        initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3, type: 'spring' }}>
        <Zap className="w-8 h-8 text-[#10B981]" />
      </motion.div>
      <h2 className="text-white text-2xl font-[900] mb-2">Unlock Sik AI Pro</h2>
      <p className="text-[#9CA3AF] text-[11px] mb-8 px-4">Get unlimited scans, AI coaching, and deep historical analysis.</p>
      
      <div className="w-full bg-[#1A1A1A] border-2 border-[#10B981] rounded-xl p-4 relative mb-6">
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#10B981] text-[#0A0A0A] text-[9px] font-[900] px-3 py-0.5 rounded-full uppercase tracking-wider">Best Value</div>
        <div className="flex justify-between items-center">
          <div className="text-left">
            <div className="text-white font-bold text-sm">Annual Plan</div>
            <div className="text-[#9CA3AF] text-[10px]">$8.33 / month</div>
          </div>
          <div className="text-white font-[900] text-lg">$99.99<span className="text-[10px] text-[#9CA3AF] font-normal">/yr</span></div>
        </div>
      </div>
      
      <motion.div className="w-full bg-[#10B981] py-3.5 rounded-xl text-[#0A0A0A] font-[800] text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)]"
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
        Start Annual Pro
      </motion.div>
    </motion.div>
  );
}
