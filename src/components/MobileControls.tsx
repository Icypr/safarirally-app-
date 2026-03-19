import React from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface MobileControlsProps {
  onInput: (key: string, pressed: boolean) => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({ onInput }) => {
  return (
    <div className="fixed inset-0 pointer-events-none flex justify-between items-end p-8 lg:hidden">
      {/* Steering */}
      <div className="flex gap-4 pointer-events-auto">
        <button 
          onPointerDown={() => onInput('ArrowLeft', true)}
          onPointerUp={() => onInput('ArrowLeft', false)}
          onPointerLeave={() => onInput('ArrowLeft', false)}
          className="w-20 h-20 glass-card rounded-2xl flex items-center justify-center active:bg-safari-gold active:text-black"
        >
          <ChevronLeft size={40} />
        </button>
        <button 
          onPointerDown={() => onInput('ArrowRight', true)}
          onPointerUp={() => onInput('ArrowRight', false)}
          onPointerLeave={() => onInput('ArrowRight', false)}
          className="w-20 h-20 glass-card rounded-2xl flex items-center justify-center active:bg-safari-gold active:text-black"
        >
          <ChevronRight size={40} />
        </button>
      </div>

      {/* Acceleration / Brake */}
      <div className="flex flex-col gap-4 pointer-events-auto">
        <button 
          onPointerDown={() => onInput('ArrowUp', true)}
          onPointerUp={() => onInput('ArrowUp', false)}
          onPointerLeave={() => onInput('ArrowUp', false)}
          className="w-24 h-24 glass-card rounded-2xl flex items-center justify-center bg-emerald-500/20 active:bg-emerald-500 active:text-black"
        >
          <ChevronUp size={48} />
        </button>
        <button 
          onPointerDown={() => onInput(' ', true)}
          onPointerUp={() => onInput(' ', false)}
          onPointerLeave={() => onInput(' ', false)}
          className="w-24 h-16 glass-card rounded-2xl flex items-center justify-center bg-red-500/20 active:bg-red-500 active:text-black"
        >
          <span className="font-black italic uppercase">BRAKE</span>
        </button>
      </div>
    </div>
  );
};
