import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVideoPlayer } from '@/lib/video';
import { Scene1 } from './video_scenes/Scene1';
import { Scene2 } from './video_scenes/Scene2';
import { Scene3 } from './video_scenes/Scene3';
import { Scene4 } from './video_scenes/Scene4';
import { Scene5 } from './video_scenes/Scene5';
import { Scene6 } from './video_scenes/Scene6';
import { Scene7 } from './video_scenes/Scene7';
import { Scene8 } from './video_scenes/Scene8';
import { Home, Maximize, Cpu, Clock, TrendingUp } from 'lucide-react';

const SCENE_DURATIONS = {
  onboarding: 5500,
  dashboard: 6000,
  scan: 7000,
  coach: 5000,
  history: 4500,
  progress: 5000,
  compare: 4500,
  close: 5000
};

export default function VideoTemplate() {
  const { currentScene } = useVideoPlayer({ durations: SCENE_DURATIONS });

  const tabs = [
    { id: 'dashboard', icon: Home },
    { id: 'scan', icon: Maximize },
    { id: 'coach', icon: Cpu },
    { id: 'history', icon: Clock },
    { id: 'progress', icon: TrendingUp },
  ];

  // Mapping currentScene to active tab index (0 to 4)
  // Scene 1 (idx 0): onboarding (no tab bar)
  // Scene 2 (idx 1): dashboard -> tab 0
  // Scene 3 (idx 2): scan -> tab 1
  // Scene 4 (idx 3): coach -> tab 2
  // Scene 5 (idx 4): history -> tab 3
  // Scene 6 (idx 5): progress -> tab 4
  // Scene 7 (idx 6): compare -> no tab change (keep whatever or default to 0)
  // Scene 8 (idx 7): close -> no tab bar
  const activeTabIdx = currentScene === 1 ? 0 :
                       currentScene === 2 ? 1 :
                       currentScene === 3 ? 2 :
                       currentScene === 4 ? 3 :
                       currentScene === 5 ? 4 : 0;
                       
  const showTabBar = currentScene > 0 && currentScene < 7;

  const tapPositions = [
    { x: '50%', y: '85%' }, // tap "Get Started" end of scene 0
    { x: '80%', y: '80%' }, // tap compare card end of scene 1
    { x: '50%', y: '85%' }, // tap start scan scene 2
    { x: '20%', y: '40%' }, // tap coach question scene 3
    { x: '50%', y: '40%' }, // tap history item scene 4
    { x: '30%', y: '45%' }, // tap progress chip scene 5
    { x: '10%', y: '10%' }, // tap back compare scene 6
    { x: '50%', y: '70%' }, // tap upgrade scene 7
  ];

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0A0A0A]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Background glow */}
      <motion.div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] rounded-full blur-[120px] opacity-15 bg-[#10B981] pointer-events-none"
      />

      <motion.div 
        className="absolute top-1/2 left-1/2 flex items-center justify-center"
        initial={{ x: '-50%', y: '-50%', scale: 1 }}
        animate={{
           x: '-50%', y: '-50%',
           scale: currentScene === 7 ? [1, 0.85] : 1,
           opacity: currentScene === 7 ? [1, 0] : 1
        }}
        transition={{ 
           duration: 4, 
           ease: 'easeInOut',
           delay: 1 // Start close animation 1s into scene 8
        }}
        style={{ width: '40vh', height: '86.5vh', maxWidth: '390px', maxHeight: '844px' }}
      >
        {/* Phone Frame */}
        <div className="w-full h-full border-[6px] border-[#2A2A2A] rounded-[44px] bg-[#0A0A0A] overflow-hidden relative shadow-2xl flex flex-col">
          
          {/* Screen Content Area */}
          <div className="flex-1 relative overflow-hidden">
            <AnimatePresence mode="popLayout">
              {currentScene === 0 && <Scene1 key="s1" />}
              {currentScene === 1 && <Scene2 key="s2" />}
              {currentScene === 2 && <Scene3 key="s3" />}
              {currentScene === 3 && <Scene4 key="s4" />}
              {currentScene === 4 && <Scene5 key="s5" />}
              {currentScene === 5 && <Scene6 key="s6" />}
              {currentScene === 6 && <Scene7 key="s7" />}
              {currentScene === 7 && <Scene8 key="s8" />}
            </AnimatePresence>
          </div>

          {/* Persistent Tab Bar */}
          <AnimatePresence>
            {showTabBar && (
              <motion.div 
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                exit={{ y: 100 }}
                className="h-[60px] bg-[#1A1A1A] border-t border-[#2A2A2A] flex justify-around items-center px-4 z-50 absolute bottom-0 left-0 right-0"
              >
                {tabs.map((tab, idx) => (
                  <div key={tab.id} className="flex flex-col items-center justify-center w-12 h-12">
                    <tab.icon 
                      className={`w-6 h-6 transition-colors duration-300 ${activeTabIdx === idx ? 'text-[#10B981]' : 'text-[#4B5563]'}`}
                    />
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Animated Cursor / Finger Tap */}
          <motion.div 
            className="absolute w-6 h-6 rounded-full bg-white z-[60] pointer-events-none mix-blend-screen"
            initial={false}
            animate={{
              left: `calc(${tapPositions[currentScene]?.x || '50%'} - 12px)`,
              top: `calc(${tapPositions[currentScene]?.y || '50%'} - 12px)`,
            }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          >
            <motion.div 
              className="w-full h-full rounded-full border-2 border-white"
              key={`tap-${currentScene}`}
              initial={{ scale: 1, opacity: 0 }}
              animate={{ 
                scale: [1, 1.5, 0], 
                opacity: [1, 0.5, 0] 
              }}
              transition={{ duration: 0.4, times: [0, 0.5, 1], delay: 1 }}
            />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
