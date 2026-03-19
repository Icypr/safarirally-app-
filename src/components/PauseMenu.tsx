import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RotateCcw, Home, Settings, Trophy } from 'lucide-react';
import { RaceConfig } from '../gameData';

interface PauseMenuProps {
  isOpen: boolean;
  onResume: () => void;
  onRestart: () => void;
  onQuit: () => void;
  race: RaceConfig;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({ isOpen, onResume, onRestart, onQuit, race }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-8">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={onResume}
          />
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative z-10 w-full max-w-md glass-card p-12 rounded-[40px] border-2 border-white/10 shadow-2xl text-center"
          >
            <div className="mb-8">
              <div className="w-20 h-20 bg-safari-gold rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3 shadow-xl">
                <Settings className="w-10 h-10 text-black animate-spin-slow" />
              </div>
              <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-2">Game Paused</h2>
              <p className="text-safari-gold font-bold uppercase tracking-widest text-xs">{race.title} • Stage {race.difficulty}</p>
            </div>

            <div className="grid gap-4">
              <button 
                onClick={onResume}
                className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase italic tracking-tighter flex items-center justify-center gap-3 hover:bg-safari-gold transition-all hover:scale-[1.02] active:scale-95 shadow-xl"
              >
                <Play size={20} fill="currentColor" />
                Resume Racing
              </button>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={onRestart}
                  className="bg-white/5 hover:bg-white/10 py-4 rounded-2xl font-black uppercase italic tracking-tighter flex items-center justify-center gap-2 border border-white/10 transition-all hover:scale-[1.02] active:scale-95"
                >
                  <RotateCcw size={18} />
                  Restart
                </button>
                <button 
                  onClick={onQuit}
                  className="bg-white/5 hover:bg-white/10 py-4 rounded-2xl font-black uppercase italic tracking-tighter flex items-center justify-center gap-2 border border-white/10 transition-all hover:scale-[1.02] active:scale-95"
                >
                  <Home size={18} />
                  Quit
                </button>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-center gap-8 text-gray-500">
              <div className="text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1">Target</p>
                <p className="text-lg font-black italic text-white">{race.targetTime}s</p>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1">Reward</p>
                <p className="text-lg font-black italic text-safari-gold">{race.reward} T</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
