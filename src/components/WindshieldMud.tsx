import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface MudSplat {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  opacity: number;
}

export const WindshieldMud: React.FC<{ intensity: number; active: boolean }> = ({ intensity, active }) => {
  const [splats, setSplats] = useState<MudSplat[]>([]);

  useEffect(() => {
    if (!active) {
      setSplats([]);
      return;
    }

    if (intensity > 0.5 && Math.random() < 0.1) {
      const newSplat: MudSplat = {
        id: Date.now(),
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 20 + Math.random() * 60,
        rotation: Math.random() * 360,
        opacity: 0.6 + Math.random() * 0.4
      };
      setSplats(prev => [...prev.slice(-10), newSplat]); // Keep last 10 splats
    }

    // Slowly fade out splats
    const interval = setInterval(() => {
      setSplats(prev => prev.map(s => ({ ...s, opacity: s.opacity - 0.01 })).filter(s => s.opacity > 0));
    }, 100);

    return () => clearInterval(interval);
  }, [intensity, active]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {splats.map(splat => (
          <motion.div
            key={splat.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: splat.opacity }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              left: `${splat.x}%`,
              top: `${splat.y}%`,
              width: `${splat.size}px`,
              height: `${splat.size}px`,
              transform: `rotate(${splat.rotation}deg)`,
              backgroundColor: '#4a3728',
              borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
              filter: 'blur(2px)',
              boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.5)'
            }}
          />
        ))}
      </AnimatePresence>
      
      {/* Rain streaks to wash away mud slightly */}
      {intensity > 0.8 && (
        <div className="absolute inset-0 bg-blue-500/5 animate-pulse" />
      )}
    </div>
  );
};
