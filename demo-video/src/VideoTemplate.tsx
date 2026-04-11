import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVideoPlayer } from '@/lib/video';
import { Scene1 } from './video_scenes/Scene1';
import { Scene2 } from './video_scenes/Scene2';
import { Scene3 } from './video_scenes/Scene3';
import { Scene4 } from './video_scenes/Scene4';
import { Scene5 } from './video_scenes/Scene5';

const SCENE_DURATIONS = {
  open: 4000,
  scan: 6000,
  dash: 4500,
  prog: 5000,
  close: 5000
};

export default function VideoTemplate() {
  const { currentScene } = useVideoPlayer({ durations: SCENE_DURATIONS });

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0A0A0A] font-sans">
      
      {/* Persistent Background Layer */}
      <div className="absolute inset-0 z-0">
        <video 
          src={`${import.meta.env.BASE_URL}videos/particles.mp4`} 
          className="w-full h-full object-cover opacity-40 mix-blend-screen"
          autoPlay loop muted playsInline
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-[#0A0A0A] opacity-80" />
      </div>

      {/* Persistent Animated Accents */}
      <motion.div 
        className="absolute w-[800px] h-[800px] rounded-full blur-[100px] opacity-10 bg-emerald-500 pointer-events-none"
        animate={{
          x: ['-20%', '80%', '40%', '-10%', '50%'][currentScene],
          y: ['-20%', '10%', '60%', '80%', '20%'][currentScene],
          scale: [1, 1.5, 0.8, 1.2, 1][currentScene]
        }}
        transition={{ duration: 2, ease: 'easeInOut' }}
      />

      {/* Grid Lines */}
      <div 
        className="absolute inset-0 opacity-[0.03] z-0"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}
      />

      <AnimatePresence mode="popLayout">
        {currentScene === 0 && <Scene1 key="scene1" />}
        {currentScene === 1 && <Scene2 key="scene2" />}
        {currentScene === 2 && <Scene3 key="scene3" />}
        {currentScene === 3 && <Scene4 key="scene4" />}
        {currentScene === 4 && <Scene5 key="scene5" />}
      </AnimatePresence>
    </div>
  );
}
