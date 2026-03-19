import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Coins, RotateCcw, Home } from 'lucide-react';

interface RaceEndProps {
  success: boolean;
  time: number;
  reward: number;
  onRetry: () => void;
  onHome: () => void;
}

export const RaceEnd: React.FC<RaceEndProps> = ({
  success,
  time,
  reward,
  onRetry,
  onHome
}) => {
  return (
    <div className="fixed inset-0 bg-safari-storm/90 backdrop-blur-xl flex items-center justify-center p-8 z-50">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-card max-w-md w-full p-12 rounded-3xl text-center border-t-8 border-safari-gold"
      >
        <div className="flex justify-center mb-6">
          <div className={`p-6 rounded-full ${success ? 'bg-safari-gold/20' : 'bg-red-500/20'}`}>
            {success ? (
              <Trophy className="w-16 h-16 text-safari-gold" />
            ) : (
              <RotateCcw className="w-16 h-16 text-red-400" />
            )}
          </div>
        </div>

        <h2 className="text-5xl font-black italic uppercase mb-2">
          {success ? 'VICTORY' : 'FAILED'}
        </h2>
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-8">
          {success ? 'Target time achieved!' : 'You missed the target time.'}
        </p>

        <div className="grid grid-cols-2 gap-4 mb-12">
          <div className="glass-card p-4 rounded-2xl">
            <p className="text-[10px] font-bold text-gray-500 uppercase">Your Time</p>
            <p className="text-2xl font-black">{time.toFixed(2)}s</p>
          </div>
          <div className="glass-card p-4 rounded-2xl">
            <p className="text-[10px] font-bold text-gray-500 uppercase">Tokens Earned</p>
            <div className="flex items-center justify-center gap-2">
              <Coins className="w-4 h-4 text-safari-gold" />
              <p className="text-2xl font-black">{success ? reward : 0}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <button 
            onClick={onRetry}
            className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase italic tracking-tighter hover:bg-safari-gold transition-all hover:scale-105 flex items-center justify-center gap-3"
          >
            <RotateCcw className="w-5 h-5" />
            Try Again
          </button>
          <button 
            onClick={onHome}
            className="w-full bg-white/10 text-white py-4 rounded-2xl font-black uppercase italic tracking-tighter hover:bg-white/20 transition-all flex items-center justify-center gap-3"
          >
            <Home className="w-5 h-5" />
            Back to Garage
          </button>
        </div>
      </motion.div>
    </div>
  );
};
