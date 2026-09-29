import React from 'react';
import { Sliders, Activity, Database, Code, BookOpen, RotateCcw } from 'lucide-react';

export type SimulatorMode = 'manual' | 'gradient_descent';

interface NavbarProps {
  mode: SimulatorMode;
  onModeChange: (mode: SimulatorMode) => void;
  onOpenMathModal: () => void;
  onOpenCodeModal: () => void;
  onResetAll: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  mode,
  onModeChange,
  onOpenMathModal,
  onOpenCodeModal,
  onResetAll,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Logo and title */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="text-xl font-bold text-white">📈</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white">
                  Linear Regression Simulator
                </h1>
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  ML Lab
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Interactive parameter fitting & gradient descent optimization simulator
              </p>
            </div>
          </div>

          {/* Mobile Reset */}
          <button
            onClick={onResetAll}
            title="Reset Everything"
            className="md:hidden p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Selector Tabs (Two-part simulator) */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800/80 shadow-inner w-full md:w-auto justify-center">
          <button
            onClick={() => onModeChange('manual')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              mode === 'manual'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Part 1: Manual Tuning</span>
          </button>

          <button
            onClick={() => onModeChange('gradient_descent')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              mode === 'gradient_descent'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Part 2: Gradient Descent</span>
          </button>
        </div>

        {/* Action utility buttons */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={onOpenMathModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium border border-slate-700/60 transition"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>Formula Inspector</span>
          </button>

          <button
            onClick={onOpenCodeModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium border border-slate-700/60 transition"
          >
            <Code className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Python Code</span>
          </button>

          <button
            onClick={onResetAll}
            title="Reset Everything"
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60 transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
