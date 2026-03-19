import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RaceConfig } from '../campaignData';
import { CloudRain, Cloud, Wind, Sun, AlertTriangle } from 'lucide-react';

interface LoadingScreenProps {
  race: RaceConfig;
  onComplete: () => void;
}

const survivalTips = {
  'Clear': [
    "Watch out for hidden rocks in the tall grass.",
    "Maintain high speed on open plains to build a lead.",
    "Dust from rivals can blind you; stay upwind if possible."
  ],
  'Dusty': [
    "Visibility is low. Use the mini-map to anticipate corners.",
    "Air filters are struggling. Engine power might dip slightly.",
    "Brake early; sand is deeper than it looks."
  ],
  'Mist': [
    "Moisture makes the track slick. Watch your traction.",
    "Fog hides hazards until the last second. Stay alert.",
    "Use your headlights to spot reflective markers."
  ],
  'Light Rain': [
    "Mud is starting to form. Avoid deep ruts.",
    "Braking distances are increased on wet clay.",
    "Keep your momentum through soft patches."
  ],
  'Heavy Storm': [
    "FLASH FLOOD WARNING: Stay on high ground where possible.",
    "Deep mud will swallow your tires. Use high torque.",
    "Visibility is near zero. Trust your instincts and the map."
  ]
};

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ race, onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const tips = survivalTips[race.weather] || survivalTips['Clear'];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 300);

    const tipTimer = setInterval(() => {
      setTipIndex(prev => (prev + 1) % tips.length);
    }, 2500);

    return () => {
      clearInterval(timer);
      clearInterval(tipTimer);
    };
  }, [onComplete, tips.length]);

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center p-8 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 opacity-20">
        <img 
          src={`https://picsum.photos/seed/${race.id}/1920/1080?blur=10`} 
          alt="Loading Background" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        {/* Race Info */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12"
        >
          <p className="text-safari-gold font-black uppercase tracking-[0.3em] text-sm mb-2">Preparing Stage</p>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter mb-4">{race.title}</h1>
          <div className="flex items-center justify-center gap-6 text-gray-400">
            <div className="flex items-center gap-2">
              {race.weather === 'Heavy Storm' ? <CloudRain className="text-blue-400" /> :
               race.weather === 'Light Rain' ? <Cloud className="text-blue-300" /> :
               race.weather === 'Dusty' ? <Wind className="text-amber-400" /> :
               <Sun className="text-safari-gold" />}
              <span className="font-bold uppercase text-xs tracking-widest">{race.weather}</span>
            </div>
            <div className="w-1 h-1 bg-white/20 rounded-full" />
            <span className="font-bold uppercase text-xs tracking-widest">{race.difficulty} Difficulty</span>
          </div>
        </motion.div>

        {/* Survival Tip */}
        <div className="glass-card p-8 rounded-3xl border-t-2 border-safari-gold mb-12 min-h-[160px] flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-4 text-safari-gold">
            <AlertTriangle size={20} />
            <span className="font-black uppercase tracking-widest text-xs">Survival Tip</span>
          </div>
          <AnimatePresence mode="wait">
            <motion.p 
              key={tipIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-xl font-bold italic text-white leading-tight"
            >
              "{tips[tipIndex]}"
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Progress Bar */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Syncing Physics Engine...</span>
            <span className="text-2xl font-black italic text-safari-gold">{Math.floor(progress)}%</span>
          </div>
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
            <motion.div 
              className="h-full bg-safari-gold"
              style={{ width: `${progress}%` }}
              transition={{ type: 'spring', stiffness: 50 }}
            />
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-safari-gold/20" />
      <div className="absolute top-12 left-12 w-24 h-24 border-t-2 border-l-2 border-white/10" />
      <div className="absolute bottom-12 right-12 w-24 h-24 border-b-2 border-r-2 border-white/10" />
    </div>
  );
};
