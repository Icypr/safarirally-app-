import React from 'react';
import { motion } from 'motion/react';

interface HUDProps {
  speed: number;
  biomeName: string;
  position: number;
  totalRivals: number;
}

export const HUD: React.FC<HUDProps> = ({ speed, biomeName, position, totalRivals }) => {
  const maxSpeed = 200;
  const speedPercentage = Math.min((speed / maxSpeed) * 100, 100);

  return (
    <div className="fixed inset-0 pointer-events-none p-8 flex flex-col justify-between font-display">
      {/* Top Header */}
      <div className="flex justify-between items-start">
        <div className="glass-card p-4 rounded-xl border-l-4 border-safari-gold">
          <p className="text-[10px] uppercase tracking-widest text-safari-gold font-bold">Current Biome</p>
          <h2 className="text-xl font-bold italic uppercase">{biomeName}</h2>
        </div>
        <div className="text-right">
          <p className="text-4xl font-black italic">POSITION <span className="text-safari-gold">{position}/{totalRivals + 1}</span></p>
        </div>
      </div>

      {/* Bottom HUD */}
      <div className="flex justify-between items-end">
        {/* Mini-map Placeholder */}
        <div className="w-48 h-48 glass-card rounded-full border-2 border-white/10 relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <svg className="absolute w-full h-full opacity-20" viewBox="0 0 100 100">
              <path d="M10,50 Q40,10 90,50 T10,90" fill="none" stroke="white" strokeWidth="2" />
            </svg>
          </div>
          <div className="absolute bottom-2 w-full text-center text-[8px] uppercase tracking-widest font-bold opacity-50">Rift Valley Sector 02</div>
        </div>

        {/* Speedometer */}
        <div className="relative w-64 h-64 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="8"
              strokeDasharray="212 282"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#FFB800"
              strokeWidth="8"
              strokeDasharray={`${(speedPercentage * 212) / 100} 282`}
              transition={{ type: 'spring', stiffness: 50 }}
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-6xl font-black italic leading-none">{Math.round(speed)}</span>
            <span className="text-xs font-bold uppercase tracking-widest text-safari-gold">KM/H</span>
          </div>
          <div className="absolute bottom-8 glass-card px-3 py-1 rounded-full text-[10px] font-bold">GEAR 4</div>
        </div>
      </div>
    </div>
  );
};
