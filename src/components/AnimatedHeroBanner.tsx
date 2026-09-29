import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Sparkles, Play } from 'lucide-react';

interface AnimatedHeroBannerProps {
  onStartTraining?: () => void;
  isTraining?: boolean;
}

export const AnimatedHeroBanner: React.FC<AnimatedHeroBannerProps> = ({
  onStartTraining,
  isTraining,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl transition-all">
      {/* Banner Header Bar */}
      <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-semibold text-slate-200">
            Live Preview: Gradient Descent Optimization Simulation
          </span>
          <span className="hidden sm:inline text-[11px] text-slate-500">
            • Looping SVG Video-Like Demonstration
          </span>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition"
        >
          <span>{isExpanded ? 'Hide Banner' : 'Show Banner'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expanded SVG Animation */}
      {isExpanded && (
        <div className="relative w-full aspect-[2.65/1] max-h-72 bg-slate-950 overflow-hidden select-none">
          <img
            src="./banner.svg"
            alt="Linear Regression Gradient Descent Live Animation"
            className="w-full h-full object-cover sm:object-contain"
          />

          {/* Quick interactive trigger floating button */}
          {onStartTraining && !isTraining && (
            <div className="absolute bottom-3 right-3 hidden sm:flex items-center gap-2">
              <button
                onClick={onStartTraining}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/90 hover:bg-indigo-500 text-white text-xs font-semibold backdrop-blur shadow-lg transition"
              >
                <Play className="w-3 h-3 fill-white" />
                <span>Simulate on Canvas Below</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
